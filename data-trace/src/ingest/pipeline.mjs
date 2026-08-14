// DataTrace 法规实时更新管线（ingest）
// 流程：抓取 → 规范化 → external_id/content_hash 去重 → status=pending_review
//       → 人工/LLM 审校 → status=published → 触发 alert。
// 本文件导出 runIngest（逐源入库，幂等、容错）与抓取/日期公共工具。
import { randomUUID } from 'node:crypto';
import { hash } from '../db.mjs';

export const USER_AGENT = 'DataTrace-Ingest/0.1 (+https://github.com/data-trace)';

// 统一抓取策略：所有请求带 30 秒超时与 User-Agent；429/5xx 重试一次后抛错。
// fetchFn 可注入（测试用），默认由调用方传入 globalThis.fetch。
export async function fetchText(fetchFn, url) {
  const attempt = () => fetchFn(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/json;q=0.9,*/*;q=0.8'
    },
    signal: AbortSignal.timeout(30000)
  });
  let response = await attempt();
  if (response.status === 429 || response.status >= 500) {
    response = await attempt(); // 限流 / 服务端错误：重试一次
  }
  if (!response.ok || response.status === 202) {
    throw new Error(`HTTP ${response.status} for ${url}（202 通常为 WAF 挑战或异步响应）`);
  }
  const text = await response.text();
  if (!text || text.trim().length === 0) {
    throw new Error(`empty response from ${url}（可能是 WAF 拦截或维护页）`);
  }
  return text;
}

// 将日期字符串规范化为 YYYY-MM-DD；无法识别返回空串（由调用方回退当天）。
export function normalizeDate(value) {
  if (!value) return '';
  const s = String(value).trim();
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ]|$)/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const ddmm = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (ddmm) return `${ddmm[3]}-${ddmm[2].padStart(2, '0')}-${ddmm[1].padStart(2, '0')}`;
  return '';
}

const MONTHS = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
};

// 将英文月份名日期（如 day="09", month="July", year="2026"）规范化为 YYYY-MM-DD。
export function normalizeDayMonthYear(day, month, year) {
  const m = MONTHS[String(month || '').toLowerCase().slice(0, 3)];
  if (!m || !year) return '';
  return `${year}-${m}-${String(day).padStart(2, '0')}`;
}

function insertUpdate(db, source, item, nowIso, today) {
  const summary = `New ${source.name} update detected: ${item.title}. Pending editorial review.`;
  db.prepare(`
    INSERT INTO updates (
      id, external_id, regulation_id, jurisdiction, event_type, title, summary, event_date,
      importance, industries, topics, summary_zh, source_url, source_name, source_checked_at,
      content_hash, previous_version_external_id, status, created_at, updated_at
    ) VALUES (?, ?, NULL, ?, 'source_refresh', ?, ?, ?, 'medium',
      '["cross_industry"]', '[]', ?, ?, ?, ?, ?, NULL, 'pending_review', ?, ?)
  `).run(
    `upd_ing_${randomUUID()}`,
    item.externalId,
    source.jurisdiction,
    item.title,
    summary,
    item.date || today,
    `【待审校】${item.title}`,
    item.url,
    source.name,
    nowIso,
    hash(JSON.stringify(item)),
    nowIso,
    nowIso
  );
}

// 逐源运行抓取入库。任一源失败不影响其它源，也不让整体 run 崩溃。
export async function runIngest({ db, fetchFn = globalThis.fetch, sources, now = new Date() }) {
  const nowIso = now.toISOString();
  const today = nowIso.slice(0, 10);
  const results = [];
  for (const source of sources) {
    const runId = `ing_${randomUUID()}`;
    let inserted = 0;
    let unchanged = 0;
    let errorMessage = null;
    let status = 'succeeded';
    try {
      db.prepare(
        `INSERT INTO ingestion_runs (id, source_name, started_at, status) VALUES (?, ?, ?, 'running')`
      ).run(runId, source.name, nowIso);
    } catch (error) {
      results.push({ code: source.code, status: 'failed', inserted: 0, unchanged: 0, error: error.message });
      continue;
    }
    try {
      const { items = [] } = await source.extract({ fetchFn });
      const existsStmt = db.prepare('SELECT 1 AS one FROM updates WHERE external_id = ?');
      for (const item of items) {
        if (existsStmt.get(item.externalId)) {
          unchanged += 1; // 幂等：external_id 已存在则跳过
          continue;
        }
        insertUpdate(db, source, item, nowIso, today);
        inserted += 1;
      }
    } catch (error) {
      status = 'failed';
      errorMessage = error && error.message ? error.message : String(error);
    }
    db.prepare(
      `UPDATE ingestion_runs SET completed_at=?, status=?, inserted_count=?, unchanged_count=?, error_message=? WHERE id=?`
    ).run(new Date().toISOString(), status, inserted, unchanged, errorMessage, runId);
    results.push({ code: source.code, status, inserted, unchanged, error: errorMessage });
  }
  return { results };
}
