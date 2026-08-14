// 香港数据源：PCPD 新闻稿（媒体声明）+ 律政司开放数据（香港法例现行版本）。
// 合规说明：优先官方公开页面/开放数据接口；抓取前已在 README 注明 robots 与限速策略。
import { createHash } from 'node:crypto';
import { fetchText, normalizeDate } from '../pipeline.mjs';

const PCPD_INDEX_URL = 'https://www.pcpd.org.hk/english/news_events/media_statements/index.html';
const HKEL_DATASET_URL = 'https://data.gov.hk/en-data/dataset/hk-doj-hkel-legislation-current';
const HKEL_CKAN_URL = 'https://data.gov.hk/en-data/api/3/action/package_show?id=hk-doj-hkel-legislation-current';

// 单源单次最多入库条数，控制首次回填与后续噪声。
const MAX_ITEMS = 20;

// 从 URL 取最后一段作为 slug（去掉常见扩展名），保证 externalId 稳定唯一。
function slugFromUrl(url) {
  try {
    const { pathname } = new URL(url);
    const parts = pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1] || 'item';
    return last.replace(/\.(html?|php|aspx?|zip|json)$/i, '') || 'item';
  } catch {
    return 'item';
  }
}

// 提取 JS 赋值语句中的 JSON 对象；用状态机配对花括号，避免标题里出现花括号导致截断。
function extractJsonObject(text, marker) {
  const keyIndex = text.indexOf(marker);
  if (keyIndex < 0) return null;
  const braceIndex = text.indexOf('{', keyIndex);
  if (braceIndex < 0) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = braceIndex; i < text.length; i += 1) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(braceIndex, i + 1);
    }
  }
  return null;
}

// PCPD 新闻稿（媒体声明）。索引页为 JS 渲染，真实数据在 Media_Statements*.js 中。
export const pcpdPress = {
  code: 'pcpd-press',
  jurisdiction: 'HK',
  name: 'PCPD Hong Kong',
  baseUrls: [PCPD_INDEX_URL],
  async extract({ fetchFn = globalThis.fetch }) {
    const indexHtml = await fetchText(fetchFn, PCPD_INDEX_URL);
    // 防御性：从索引页找出数据脚本 Media_Statements*.js（相对路径）。
    const scriptMatch = indexHtml.match(/src=["']([^"']*Media_Statements[^"']*\.js)["']/i);
    if (!scriptMatch) throw new Error('PCPD 索引页未找到 Media_Statements 脚本');
    const scriptUrl = new URL(scriptMatch[1].replace(/\\\//g, '/'), PCPD_INDEX_URL).toString();
    const js = await fetchText(fetchFn, scriptUrl);
    const jsonText = extractJsonObject(js, 'var Media_Statements');
    if (!jsonText) throw new Error('PCPD Media_Statements 数据对象解析失败');
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (error) {
      throw new Error(`PCPD Media_Statements JSON 解析失败: ${error.message}`);
    }
    const rows = Array.isArray(parsed && parsed.data) ? parsed.data : [];
    const baseDir = new URL('.', PCPD_INDEX_URL).toString();
    const items = [];
    for (const row of rows) {
      const title = (row.enTitle || row.tcTitle || '').trim();
      const link = String(row.enlink || '').replace(/\\\//g, '/');
      if (!title || !link) continue;
      const date = normalizeDate(row.date);
      const url = new URL(link, baseDir).toString();
      items.push({
        externalId: `hk:event:pcpd-press:${date}-${slugFromUrl(url)}`,
        title,
        url,
        date,
        kind: 'press_release'
      });
      if (items.length >= MAX_ITEMS) break;
    }
    return { items };
  }
};

// 律政司「香港法例（现行版本）」开放数据集。优先 CKAN API，回退 HTML，再回退页面指纹。
export const hkelDataset = {
  code: 'hkel-dataset',
  jurisdiction: 'HK',
  name: 'Hong Kong e-Legislation (DATA.GOV.HK)',
  baseUrls: [HKEL_DATASET_URL, HKEL_CKAN_URL],
  async extract({ fetchFn = globalThis.fetch }) {
    const today = new Date().toISOString().slice(0, 10);
    let resources = null;
    let modified = null;
    // 1) 优先 CKAN API（结构化、含更新时间）。
    try {
      const json = await fetchText(fetchFn, HKEL_CKAN_URL);
      const parsed = JSON.parse(json);
      const result = parsed && parsed.result;
      if (result && Array.isArray(result.resources) && result.resources.length > 0) {
        resources = result.resources;
        modified = result.metadata_modified || null;
      }
    } catch {
      resources = null;
    }
    let html = null;
    // 2) 回退：解析数据集 HTML 中 <li data-url="..." data-name-en="..."> 资源列表。
    if (!resources) {
      try {
        html = await fetchText(fetchFn, HKEL_DATASET_URL);
        const found = [];
        const liRe = /<li\b[^>]*\bdata-url=["'][^"']+["'][^>]*>/gi;
        for (const tag of html.match(liRe) || []) {
          const url = (tag.match(/\bdata-url=["']([^"']+)["']/i) || [])[1];
          const name = (tag.match(/\bdata-name-en=["']([^"']*)["']/i) || [])[1];
          if (url) found.push({ name: name || '', url });
        }
        if (found.length > 0) resources = found;
      } catch {
        html = null;
      }
    }
    const items = [];
    if (resources) {
      const date = normalizeDate(modified) || today;
      for (const r of resources) {
        const url = r.url || '';
        if (!url) continue;
        const slug = slugFromUrl(url);
        items.push({
          externalId: `hk:event:hkel-dataset:${date}-${slug}`,
          title: r.name || r.title || slug,
          url,
          date,
          kind: 'dataset_resource'
        });
        if (items.length >= MAX_ITEMS) break;
      }
      return { items };
    }
    // 3) 兜底：产出「页面指纹」事件（整页内容 hash），页面一变即产生新事件。
    if (html && html.trim().length > 0) {
      const fingerprint = createHash('sha256').update(html).digest('hex').slice(0, 16);
      return {
        items: [{
          externalId: `hk:event:hkel-dataset:page-fingerprint:${fingerprint}`,
          title: 'Hong Kong e-Legislation dataset page fingerprint (no resources parsed)',
          url: HKEL_DATASET_URL,
          date: today,
          kind: 'page_fingerprint'
        }]
      };
    }
    throw new Error('香港法例数据集不可达（CKAN 与 HTML 均失败）');
  }
};

export const hkSources = [pcpdPress, hkelDataset];
