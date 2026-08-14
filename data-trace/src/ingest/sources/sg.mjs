// 新加坡数据源：PDPC 新闻、MAS 法规/咨询、IMDA 守则。
// 合规说明：三个站点均为 .gov.sg 官方站点；其中 PDPC/IMDA 有 AWS WAF 前端挑战、
// MAS 对非浏览器 UA 返回维护页，纯 Node fetch 可能拿不到内容（详见 README）。
// 因此这里一律用防御性正则：能抓到就入库，抓不到返回空列表（fetch 层失败则抛错）。
import { fetchText, normalizeDate, normalizeDayMonthYear } from '../pipeline.mjs';

const PDPC_NEWS_URL = 'https://www.pdpc.gov.sg/news-and-events';
const MAS_CONSULT_URL = 'https://www.mas.gov.sg/publications/consultations';
const IMDA_CODES_URL = 'https://www.imda.gov.sg/regulations-and-licences/regulations/codes-of-practice';

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

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// PDPC 新闻（news-and-events，会跳转到 media-events）。列表为 JS 渲染，防御性匹配 <a> 与日期。
export const pdpcNews = {
  code: 'pdpc-news',
  jurisdiction: 'SG',
  name: 'PDPC Singapore',
  baseUrls: [PDPC_NEWS_URL],
  async extract({ fetchFn = globalThis.fetch }) {
    const html = await fetchText(fetchFn, PDPC_NEWS_URL);
    const today = new Date().toISOString().slice(0, 10);
    const linkRe = /<a\b[^>]*href=["']([^"']*(?:\/news-and-events\/|\/media-events\/)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
    const dateRe = /Published (?:on\s+)?(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})/gi;
    const dates = [];
    let dm;
    while ((dm = dateRe.exec(html))) dates.push(normalizeDayMonthYear(dm[1], dm[2], dm[3]));
    const items = [];
    let i = 0;
    let lm;
    while ((lm = linkRe.exec(html))) {
      const title = stripHtml(lm[2]);
      if (!title) continue;
      const url = new URL(lm[1].replace(/&amp;/g, '&'), PDPC_NEWS_URL).toString();
      const date = dates[i] || today;
      items.push({
        externalId: `sg:event:pdpc-news:${date}-${slugFromUrl(url)}`,
        title,
        url,
        date,
        kind: 'news'
      });
      i += 1;
    }
    return { items };
  }
};

// MAS 法规/咨询：使用咨询论文列表页（结构稳定，含 Published Date / 标题 / 链接）。
export const masConsultations = {
  code: 'mas-consultations',
  jurisdiction: 'SG',
  name: 'Monetary Authority of Singapore',
  baseUrls: [MAS_CONSULT_URL],
  async extract({ fetchFn = globalThis.fetch }) {
    const html = await fetchText(fetchFn, MAS_CONSULT_URL);
    const today = new Date().toISOString().slice(0, 10);
    const linkRe = /<a\b[^>]*href=["']([^"']*\/publications\/(?:consultations|notices)\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    const dateRe = /(?:Published|Last Revised) Date:\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/gi;
    const dates = [];
    let dm;
    while ((dm = dateRe.exec(html))) dates.push(normalizeDayMonthYear(dm[1], dm[2], dm[3]));
    const items = [];
    let i = 0;
    let lm;
    while ((lm = linkRe.exec(html))) {
      const title = stripHtml(lm[2]);
      if (!title) continue;
      const url = new URL(lm[1].replace(/&amp;/g, '&'), MAS_CONSULT_URL).toString();
      const date = dates[i] || today;
      items.push({
        externalId: `sg:event:mas-consultations:${date}-${slugFromUrl(url)}`,
        title,
        url,
        date,
        kind: 'consultation'
      });
      i += 1;
    }
    return { items };
  }
};

// IMDA 守则：codes-of-practice 列表页（含 Infocomm/Media/Postal 三分组）。
export const imdaCodes = {
  code: 'imda-codes',
  jurisdiction: 'SG',
  name: 'IMDA Singapore',
  baseUrls: [IMDA_CODES_URL],
  async extract({ fetchFn = globalThis.fetch }) {
    const html = await fetchText(fetchFn, IMDA_CODES_URL);
    const today = new Date().toISOString().slice(0, 10);
    const updatedMatch = html.match(/LAST UPDATED:\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/i);
    const date = updatedMatch ? normalizeDayMonthYear(updatedMatch[1], updatedMatch[2], updatedMatch[3]) : today;
    const linkRe = /<a\b[^>]*href=["']([^"']*\/regulations-and-licences\/regulations\/codes-of-practice\/[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
    const items = [];
    let lm;
    while ((lm = linkRe.exec(html))) {
      const title = stripHtml(lm[2]);
      if (!title) continue;
      const url = new URL(lm[1].replace(/&amp;/g, '&'), IMDA_CODES_URL).toString();
      items.push({
        externalId: `sg:event:imda-codes:${date}-${slugFromUrl(url)}`,
        title,
        url,
        date,
        kind: 'code_of_practice'
      });
    }
    return { items };
  }
};

export const sgSources = [pdpcNews, masConsultations, imdaCodes];
