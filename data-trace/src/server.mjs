import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { hash, openDatabase } from './db.mjs';
import { isMailConfigured, sendEmail } from './mail/sender.mjs';

const moduleDir = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(moduleDir, '../public');
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8'
};
const CLASSIFICATION_PATTERN = /^[a-z][a-z0-9_]{0,63}$/;
const DAILY_SCHEDULE = { cron: '0 8 * * *', timezone: 'Asia/Shanghai', label: '08:00 Beijing time' };
const DISCLAIMER = 'AI-generated Chinese summaries are for regulatory tracking only and may contain errors. They are not legal advice; verify the official source before relying on them. / AI 生成的中文摘要仅用于法规追踪，可能存在错误，不构成法律意见；使用前请核对官方原文。';

// 安全响应头（对所有响应生效，含静态文件与 API）。
// public/ 仅使用外部 <script type="module" src="/app.js">，无内联脚本/事件处理器，
// 因此 script-src 收紧为 'self'；style-src 保留 'unsafe-inline' 以兼容内联样式与前端模板注入。
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; base-uri 'self'; frame-ancestors 'none'"
};

function applySecurityHeaders(request, response) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) response.setHeader(key, value);
  const forwardedProto = request.headers['x-forwarded-proto'];
  const isHttps = forwardedProto === 'https' || request.socket?.encrypted === true;
  if (isHttps) response.setHeader('Strict-Transport-Security', 'max-age=31536000');
}

function json(response, status, body) {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    'cache-control': 'no-store'
  });
  response.end(payload);
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 32_768) throw Object.assign(new Error('Request body is too large.'), { status: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    throw Object.assign(new Error('Request body must be valid JSON.'), { status: 400 });
  }
}

function validateEmail(email) {
  return typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function tokenHash(token) {
  return createHash('sha256').update(token).digest();
}

function tokenMatches(token, storedHex, subscriberId, env) {
  if (!token || !storedHex) return false;
  const actual = tokenHash(token);
  const expected = Buffer.from(storedHex, 'hex');
  const randomTokenMatches = actual.length === expected.length && timingSafeEqual(actual, expected);
  return randomTokenMatches || token === deliveryToken(subscriberId, env);
}

function deliveryToken(subscriberId, env) {
  if (!env.MANAGE_LINK_SECRET) return '';
  return createHmac('sha256', env.MANAGE_LINK_SECRET).update(`data-trace:${subscriberId}`).digest('base64url');
}

function normalizePreferences(body, db) {
  const dailyBriefing = body.dailyBriefing === true;
  const updateAlert = body.updateAlert === true;
  if (!dailyBriefing && !updateAlert) {
    throw Object.assign(new Error('Select daily briefing, regulation update alerts, or both.'), { status: 422 });
  }
  let jurisdictionPlan;
  let jurisdictions;
  if (Array.isArray(body.jurisdictions) && body.jurisdictions.length > 0) {
    // 多选法域（jurisdictions 表驱动）：数组元素必须是 jurisdictions 表中存在的 code。
    const codes = [...new Set(body.jurisdictions.map((code) => String(code).toUpperCase()))];
    const known = knownJurisdictionCodes(db);
    const unknown = codes.filter((code) => !known.has(code));
    if (unknown.length > 0) {
      throw Object.assign(new Error(`Unknown jurisdiction: ${unknown.join(', ')}.`), { status: 422 });
    }
    const active = activeJurisdictionCodes(db);
    jurisdictionPlan = codes.length === active.length && codes.every((code) => active.includes(code)) ? 'ALL' : 'CUSTOM';
    jurisdictions = codes;
  } else {
    // 向后兼容：旧客户端三档单选计划 HK / SG / ALL。
    const plan = String(body.jurisdictionPlan || '').toUpperCase();
    const planMap = { HK: ['HK'], SG: ['SG'], ALL: activeJurisdictionCodes(db) };
    if (!Object.hasOwn(planMap, plan)) {
      throw Object.assign(new Error('Choose one jurisdiction plan: HK, SG, or ALL, or send a jurisdictions array.'), { status: 422 });
    }
    jurisdictionPlan = plan;
    jurisdictions = planMap[plan];
  }
  return { dailyBriefing, updateAlert, jurisdictionPlan, jurisdictions };
}

function publicSubscriber(row) {
  return {
    id: row.id,
    email: row.email,
    dailyBriefing: Boolean(row.daily_briefing),
    updateAlert: Boolean(row.update_alert),
    jurisdictionPlan: row.jurisdiction_plan,
    jurisdictions: JSON.parse(row.jurisdictions),
    active: Boolean(row.active),
    confirmedAt: row.confirmed_at,
    pendingConfirmation: row.confirmed_at == null,
    updatedAt: row.updated_at
  };
}

function parseList(value) {
  try { return JSON.parse(value || '[]'); } catch { return []; }
}

function knownJurisdictionCodes(db) {
  return new Set(db.prepare('SELECT code FROM jurisdictions').all().map((row) => row.code));
}

function activeJurisdictionCodes(db) {
  return db.prepare('SELECT code FROM jurisdictions WHERE active=1 ORDER BY code').all().map((row) => row.code);
}

function mapRegulation(row) {
  return {
    id: row.id,
    externalId: row.external_id,
    jurisdiction: row.jurisdiction,
    title: row.title,
    shortTitle: row.short_title,
    instrumentType: row.instrument_type,
    industries: parseList(row.industries),
    topics: parseList(row.topics),
    issuingBody: row.issuing_body,
    status: row.status,
    publicationDate: row.publication_date,
    effectiveDate: row.effective_date,
    currentVersionDate: row.current_version_date,
    summary: row.summary,
    sourceUrl: row.source_url,
    sourceName: row.source_name,
    sourceCheckedAt: row.source_checked_at,
    contentHash: row.content_hash
  };
}

function mapUpdate(row) {
  return {
    id: row.id,
    regulationId: row.regulation_id,
    jurisdiction: row.jurisdiction,
    eventType: row.event_type,
    title: row.title,
    summary: row.summary,
    eventDate: row.event_date,
    importance: row.importance,
    industries: parseList(row.industries),
    topics: parseList(row.topics),
    summaryZh: row.summary_zh,
    sourceUrl: row.source_url,
    sourceName: row.source_name
  };
}

export function beijingParts(value) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23'
  }).formatToParts(value).reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

function buildMessage(subscriber, updateRows, messageType, env, origin, messageDate = new Date()) {
  const token = deliveryToken(subscriber.id, env);
  if (!token) throw Object.assign(new Error('MANAGE_LINK_SECRET is required to create recipient-specific email links.'), { status: 503 });
  const baseUrl = String(env.PUBLIC_BASE_URL || origin).replace(/\/$/, '');
  const params = `subscriber=${encodeURIComponent(subscriber.id)}&token=${encodeURIComponent(token)}`;
  const manageUrl = `${baseUrl}/#subscribe?${params}`;
  const unsubscribeUrl = `${baseUrl}/#subscribe?${params}&action=unsubscribe`;
  const date = beijingParts(messageDate).date;
  const subject = messageType === 'daily_briefing' ? `DataTrace Daily Briefing · ${date}` : `DataTrace Alert · ${updateRows[0]?.jurisdiction || 'HK/SG'} · ${updateRows[0]?.title || 'Regulatory update'}`;
  const updatesText = updateRows.map((item, index) => [
    `${index + 1}. ${item.event_date} · ${item.jurisdiction} · ${item.title}`,
    `中文一句话摘要（AI）：${item.summary_zh}`,
    `Official source: ${item.source_url}`
  ].join('\n')).join('\n\n');
  const text = `${subject}\n\n${updatesText}\n\n${DISCLAIMER}\n\nManage subscription: ${manageUrl}\nUnsubscribe: ${unsubscribeUrl}`;
  return {
    subscriberId: subscriber.id,
    jurisdictionPlan: subscriber.jurisdiction_plan,
    messageType,
    manageUrl,
    unsubscribeUrl,
    gateway: {
      channel: 'email', to: subscriber.email,
      content: { type: 'text', text },
      metadata: { compose: true, subject, to: subscriber.email }
    }
  };
}

/**
 * 生成双重确认（double opt-in）邮件。确认链接使用确定性 deliveryToken，便于重复点击幂等。
 * 返回结构可直接传给 sendEmail（含 to/subject/text/html/headers）。
 */
function buildConfirmationMessage(subscriber, env, origin) {
  const token = deliveryToken(subscriber.id, env);
  if (!token) throw Object.assign(new Error('MANAGE_LINK_SECRET is required to create a confirmation link.'), { status: 503 });
  const baseUrl = String(env.PUBLIC_BASE_URL || origin).replace(/\/$/, '');
  const confirmationUrl = `${baseUrl}/api/subscribers/${subscriber.id}/confirm?token=${encodeURIComponent(token)}`;
  const params = `subscriber=${encodeURIComponent(subscriber.id)}&token=${encodeURIComponent(token)}`;
  const unsubscribeUrl = `${baseUrl}/#subscribe?${params}&action=unsubscribe`;
  const subject = 'Confirm your DataTrace subscription';
  const text = [
    'Confirm your DataTrace subscription / 确认您的 DataTrace 订阅',
    '',
    'Please open the link below to confirm your subscription:',
    '请打开以下链接确认订阅：',
    confirmationUrl,
    '',
    'Note: briefings and alerts are only sent to confirmed subscribers. / 注意：简报与提醒只会发送给已确认的订阅者。',
    '',
    `Unsubscribe / 退订: ${unsubscribeUrl}`
  ].join('\n');
  const html = [
    '<!doctype html><html><body style="font-family:system-ui,sans-serif;line-height:1.6;color:#111">',
    '<h2>DataTrace</h2>',
    '<p>Please confirm your subscription / 请确认您的订阅：</p>',
    `<p><a href="${confirmationUrl}">Confirm subscription / 确认订阅</a></p>`,
    `<p>${confirmationUrl}</p>`,
    '<p>Note: briefings and alerts are only sent to confirmed subscribers. / 注意：简报与提醒只会发送给已确认的订阅者。</p>',
    `<p><a href="${unsubscribeUrl}">Unsubscribe / 退订</a></p>`,
    '</body></html>'
  ].join('');
  return {
    subscriberId: subscriber.id,
    messageType: 'confirmation',
    subject,
    text,
    html,
    confirmationUrl,
    unsubscribeUrl,
    to: subscriber.email,
    headers: { unsubscribeUrl }
  };
}

/** 确认结果的服务端渲染 HTML 页面（双语）。 */
function confirmationPage(kind) {
  const messages = {
    success: {
      title: 'Subscription confirmed / 订阅确认成功',
      en: 'Your DataTrace subscription is confirmed. Daily briefings and regulation update alerts are now enabled.',
      zh: '您的 DataTrace 订阅已确认成功。每日简报与法规更新提醒现已启用。'
    },
    invalid: {
      title: 'Invalid or expired link / 链接无效或已过期',
      en: 'This confirmation link is invalid or has expired. Please subscribe again to receive a new confirmation email.',
      zh: '该确认链接无效或已过期。请重新订阅以获取新的确认邮件。'
    },
    already: {
      title: 'Already confirmed / 已确认',
      en: 'This subscription is already confirmed. No further action is needed.',
      zh: '该订阅已确认，无需重复操作。'
    }
  };
  const message = messages[kind] || messages.invalid;
  return `<!doctype html>
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${message.title}</title>
</head>
<body style="font-family:system-ui,sans-serif;max-width:640px;margin:48px auto;padding:0 16px;line-height:1.6">
<h1>DataTrace</h1>
<p><strong>${message.title}</strong></p>
<p>${message.en}</p>
<p>${message.zh}</p>
</body>
</html>`;
}

/**
 * 把一次邮件发送结果写入 mail_log（/api/mail-log 端点与 dispatch worker 共用）。
 * gatewayResult.success === true → sent；=== false → failed；否则 skipped。
 * payloadHash 沿用 hash({ subscriberId, subject, body })。
 */
export function logMailResult(db, env, payload) {
  if (!['daily_briefing', 'update_alert', 'confirmation', 'test'].includes(payload.messageType)) {
    throw Object.assign(new Error('Invalid messageType.'), { status: 422 });
  }
  const gatewayResult = payload.gatewayResult;
  const status = gatewayResult?.success === true ? 'sent' : gatewayResult?.success === false ? 'failed' : 'skipped';
  const providerMessageId = gatewayResult?.messageId || gatewayResult?.id || null;
  const errorMessage = status === 'failed'
    ? String(gatewayResult?.message || 'Gateway delivery failed.')
    : status === 'skipped'
      ? String(payload.skipReason || 'Gateway delivery was not attempted.')
      : null;
  const now = new Date().toISOString();
  const payloadHash = payload.payloadHash || hash({ subscriberId: payload.subscriberId, subject: payload.subject, body: payload.body });
  const id = `mail_${randomUUID()}`;
  db.prepare(`INSERT INTO mail_log (
    id, subscriber_id, message_type, subject, status, provider, provider_message_id, account_id, gateway_response_json,
    payload_hash, error_message, attempted_at, delivered_at, created_at
  ) VALUES (?, ?, ?, ?, ?, 'lawrence_gateway', ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    id, payload.subscriberId ?? null, payload.messageType, String(payload.subject || '').slice(0, 300),
    status, providerMessageId, payload.accountId ?? null, gatewayResult ? JSON.stringify(gatewayResult) : null,
    payloadHash, errorMessage, payload.attemptedAt ?? now, status === 'sent' ? (payload.deliveredAt ?? now) : null, now
  );
  return { id, payloadHash, status, providerMessageId };
}

/** 持久化一个 dispatch run 及其 messages（status='queued'），返回 runId。 */
function persistDispatch({ db, idempotencyKey, messageType, scheduledFor, triggerKind, updateId, messages }) {
  const runId = `dispatch_${randomUUID()}`;
  const now = new Date().toISOString();
  db.prepare(`INSERT INTO dispatch_runs (id, idempotency_key, message_type, scheduled_for, timezone, trigger_kind, update_id, status, recipient_count, created_at)
    VALUES (?, ?, ?, ?, 'Asia/Shanghai', ?, ?, 'prepared', ?, ?)`).run(
    runId, idempotencyKey, messageType, scheduledFor.toISOString(), triggerKind, updateId, messages.length, now
  );
  const insertMessage = db.prepare(`INSERT INTO dispatch_messages (
    id, dispatch_run_id, subscriber_id, message_type, recipient, subject, body, manage_url, unsubscribe_url, status, attempts, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'queued', 0, ?)`);
  for (const message of messages) {
    insertMessage.run(
      `dm_${randomUUID()}`, runId, message.subscriberId, messageType, message.gateway.to,
      message.gateway.metadata.subject, message.gateway.content.text, message.manageUrl, message.unsubscribeUrl, now
    );
  }
  return runId;
}

/**
 * 准备当日 daily 简报（endpoint 与 scheduler 共用）。
 * 负责写入 dispatch_runs + dispatch_messages 并返回 runId；按幂等键去重。
 */
export function prepareDailyDispatch({ db, env, now = new Date(), origin = env.PUBLIC_BASE_URL || '' }) {
  const beijing = beijingParts(now);
  const idempotencyKey = `daily:${beijing.date}:08:Asia/Shanghai`;
  const existingRun = db.prepare('SELECT * FROM dispatch_runs WHERE idempotency_key=?').get(idempotencyKey);
  if (existingRun) return { runId: existingRun.id, idempotencyKey, alreadyPrepared: true, messages: [] };

  const updateRows = db.prepare("SELECT * FROM updates WHERE status='published' ORDER BY event_date DESC LIMIT 8").all();
  const subscribers = db.prepare('SELECT * FROM subscribers WHERE active=1 AND confirmed_at IS NOT NULL AND daily_briefing=1').all();
  const messages = subscribers.flatMap((subscriber) => {
    const allowed = parseList(subscriber.jurisdictions);
    const scopedUpdates = updateRows.filter((item) => allowed.includes(item.jurisdiction));
    return scopedUpdates.length ? [buildMessage(subscriber, scopedUpdates, 'daily_briefing', env, origin, now)] : [];
  });
  const runId = persistDispatch({ db, idempotencyKey, messageType: 'daily_briefing', scheduledFor: now, triggerKind: 'schedule', updateId: null, messages });
  return { runId, idempotencyKey, alreadyPrepared: false, messages };
}

/** 取客户端 IP：仅当 env.TRUST_PROXY==='1' 时信任 x-forwarded-for 首个地址。 */
function getClientIp(request, env) {
  if (env.TRUST_PROXY === '1') {
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) return String(forwarded).split(',')[0].trim();
  }
  return request.socket?.remoteAddress || 'unknown';
}

/** 内存滑动窗口限流：每 IP 每 10 分钟最多 3 次、每天最多 20 次。 */
function createRateLimiter({ windowMs = 10 * 60 * 1000, windowMax = 3, dayMs = 24 * 60 * 60 * 1000, dayMax = 20 } = {}) {
  const buckets = new Map();
  return {
    check(ip) {
      const now = Date.now();
      const entry = buckets.get(ip) || { window: [], day: [] };
      entry.window = entry.window.filter((ts) => now - ts < windowMs);
      entry.day = entry.day.filter((ts) => now - ts < dayMs);
      if (entry.window.length >= windowMax || entry.day.length >= dayMax) {
        buckets.set(ip, entry);
        return false;
      }
      entry.window.push(now);
      entry.day.push(now);
      buckets.set(ip, entry);
      return true;
    },
    prune() {
      const now = Date.now();
      for (const [ip, entry] of buckets) {
        entry.window = entry.window.filter((ts) => now - ts < windowMs);
        entry.day = entry.day.filter((ts) => now - ts < dayMs);
        if (entry.window.length === 0 && entry.day.length === 0) buckets.delete(ip);
      }
    }
  };
}

function handleApi(request, response, url, db, env, limiter) {
  if (request.method === 'GET' && url.pathname === '/api/health') {
    const counts = db.prepare(`SELECT
      (SELECT COUNT(*) FROM regulations) AS regulations,
      (SELECT COUNT(*) FROM articles) AS articles,
      (SELECT COUNT(*) FROM updates WHERE status='published') AS updates,
      (SELECT COUNT(*) FROM subscribers WHERE active=1) AS subscribers`).get();
    return json(response, 200, { status: 'ok', database: 'connected', schedule: DAILY_SCHEDULE, ...counts });
  }

  if (request.method === 'GET' && url.pathname === '/api/jurisdictions') {
    const rows = db.prepare('SELECT code, name_en, name_zh, region, tier, active FROM jurisdictions ORDER BY tier, code').all();
    return json(response, 200, { data: rows });
  }

  if (request.method === 'GET' && url.pathname === '/api/taxonomy') {
    const industryRows = db.prepare(`SELECT DISTINCT value FROM regulations, json_each(regulations.industries) ORDER BY value`).all();
    const topicRows = db.prepare(`SELECT DISTINCT value FROM regulations, json_each(regulations.topics) ORDER BY value`).all();
    return json(response, 200, { data: { industries: industryRows.map((row) => row.value), topics: topicRows.map((row) => row.value) } });
  }

  if (request.method === 'GET' && url.pathname === '/api/regulations') {
    const jurisdiction = url.searchParams.get('jurisdiction');
    const type = url.searchParams.get('type');
    const industry = url.searchParams.get('industry');
    const topic = url.searchParams.get('topic');
    const query = url.searchParams.get('q')?.trim().toLowerCase();
    const clauses = [];
    const values = [];
    if (jurisdiction && knownJurisdictionCodes(db).has(jurisdiction)) { clauses.push('jurisdiction = ?'); values.push(jurisdiction); }
    if (['legislation', 'subsidiary_legislation', 'regulator_guidance', 'code_of_practice'].includes(type)) {
      clauses.push('instrument_type = ?'); values.push(type);
    }
    if (CLASSIFICATION_PATTERN.test(industry || '')) { clauses.push('EXISTS (SELECT 1 FROM json_each(regulations.industries) WHERE value = ?)'); values.push(industry); }
    if (CLASSIFICATION_PATTERN.test(topic || '')) { clauses.push('EXISTS (SELECT 1 FROM json_each(regulations.topics) WHERE value = ?)'); values.push(topic); }
    if (query) {
      clauses.push(`(LOWER(title) LIKE ? OR LOWER(short_title) LIKE ? OR LOWER(summary) LIKE ? OR LOWER(issuing_body) LIKE ? OR LOWER(industries) LIKE ? OR LOWER(topics) LIKE ?)`);
      values.push(...Array(6).fill(`%${query}%`));
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const rows = db.prepare(`SELECT * FROM regulations ${where} ORDER BY jurisdiction, effective_date DESC, title`).all(...values);
    return json(response, 200, { data: rows.map(mapRegulation), total: rows.length });
  }

  const regulationMatch = url.pathname.match(/^\/api\/regulations\/([a-zA-Z0-9_-]+)$/);
  if (request.method === 'GET' && regulationMatch) {
    const row = db.prepare('SELECT * FROM regulations WHERE id=?').get(regulationMatch[1]);
    if (!row) return json(response, 404, { error: 'Regulation not found.' });
    const articleRows = db.prepare('SELECT * FROM articles WHERE regulation_id=? ORDER BY provision_number').all(row.id);
    const updateRows = db.prepare('SELECT * FROM updates WHERE regulation_id=? ORDER BY event_date DESC').all(row.id);
    return json(response, 200, {
      data: {
        ...mapRegulation(row),
        articles: articleRows.map((item) => ({
          id: item.id, provisionNumber: item.provision_number, heading: item.heading,
          textSummary: item.text_summary, keywords: JSON.parse(item.keywords), versionLabel: item.version_label,
          sourceUrl: item.source_url
        })),
        updates: updateRows.map(mapUpdate)
      }
    });
  }

  if (request.method === 'GET' && url.pathname === '/api/updates') {
    const jurisdiction = url.searchParams.get('jurisdiction');
    const industry = url.searchParams.get('industry');
    const topic = url.searchParams.get('topic');
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 50, 1), 100);
    const clauses = ["status='published'"];
    const values = [];
    if (jurisdiction && knownJurisdictionCodes(db).has(jurisdiction)) { clauses.push('jurisdiction=?'); values.push(jurisdiction); }
    if (CLASSIFICATION_PATTERN.test(industry || '')) { clauses.push('EXISTS (SELECT 1 FROM json_each(updates.industries) WHERE value=?)'); values.push(industry); }
    if (CLASSIFICATION_PATTERN.test(topic || '')) { clauses.push('EXISTS (SELECT 1 FROM json_each(updates.topics) WHERE value=?)'); values.push(topic); }
    const where = `WHERE ${clauses.join(' AND ')}`;
    const rows = db.prepare(`SELECT * FROM updates ${where} ORDER BY event_date DESC LIMIT ?`).all(...values, limit);
    return json(response, 200, { data: rows.map(mapUpdate), total: rows.length });
  }

  if (request.method === 'GET' && url.pathname === '/api/briefings/preview') {
    const jurisdiction = url.searchParams.get('jurisdiction');
    const rows = jurisdiction && knownJurisdictionCodes(db).has(jurisdiction)
      ? db.prepare("SELECT * FROM updates WHERE jurisdiction=? AND status='published' ORDER BY event_date DESC LIMIT 5").all(jurisdiction)
      : db.prepare("SELECT * FROM updates WHERE status='published' ORDER BY event_date DESC LIMIT 5").all();
    const date = new Date().toISOString().slice(0, 10);
    return json(response, 200, {
      data: {
        subject: `Data Trace Daily · ${date}`,
        generatedAt: new Date().toISOString(),
        schedule: DAILY_SCHEDULE,
        disclaimer: DISCLAIMER,
        updates: rows.map(mapUpdate),
        text: `${rows.map((item) => `${item.event_date} · ${item.jurisdiction} · ${item.title}\n中文一句话摘要（AI）：${item.summary_zh}\n${item.source_url}`).join('\n\n')}\n\n${DISCLAIMER}`
      }
    });
  }

  if (request.method === 'POST' && url.pathname === '/api/dispatch/messages') {
    return readJson(request).then((body) => {
      if (!env.DISPATCH_API_KEY || request.headers['x-dispatch-key'] !== env.DISPATCH_API_KEY) {
        return json(response, 401, { error: 'A valid dispatch key is required.' });
      }
      const messageType = body.messageType;
      if (!['daily_briefing', 'update_alert'].includes(messageType)) {
        throw Object.assign(new Error('messageType must be daily_briefing or update_alert.'), { status: 422 });
      }
      const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : new Date();
      if (Number.isNaN(scheduledAt.getTime())) throw Object.assign(new Error('scheduledAt must be a valid ISO date.'), { status: 422 });
      const origin = `${url.protocol}//${url.host}`;

      if (messageType === 'daily_briefing') {
        if (beijingParts(scheduledAt).hour !== 8) {
          throw Object.assign(new Error('Daily briefings may only be prepared for 08:00 Beijing time.'), { status: 409 });
        }
        const prepared = prepareDailyDispatch({ db, env, now: scheduledAt, origin });
        if (prepared.alreadyPrepared) {
          return json(response, 200, {
            data: { messageType, idempotencyKey: prepared.idempotencyKey, alreadyPrepared: true, deliveryMode: 'scheduled_08_beijing', schedule: DAILY_SCHEDULE, messages: [] },
            gatewayRequirement: { senderAccount: 'ByteStore or Wiselaw accountId configured in Lawrence gateway', sendEachPayloadOnce: true }
          });
        }
        return json(response, 200, {
          data: { messageType, idempotencyKey: prepared.idempotencyKey, deliveryMode: 'scheduled_08_beijing', schedule: DAILY_SCHEDULE, messages: prepared.messages },
          gatewayRequirement: { senderAccount: 'ByteStore or Wiselaw accountId configured in Lawrence gateway', sendEachPayloadOnce: true }
        });
      }

      // update_alert（立即）分支。
      const updateId = String(body.updateId || '');
      const update = db.prepare("SELECT * FROM updates WHERE id=? AND status='published'").get(updateId);
      if (!update) throw Object.assign(new Error('A valid updateId is required for an immediate alert.'), { status: 422 });
      const idempotencyKey = `alert:${updateId}`;
      const existingRun = db.prepare('SELECT * FROM dispatch_runs WHERE idempotency_key=?').get(idempotencyKey);
      if (existingRun) {
        return json(response, 200, {
          data: { messageType, idempotencyKey, alreadyPrepared: true, deliveryMode: 'immediate', schedule: DAILY_SCHEDULE, messages: [] },
          gatewayRequirement: { senderAccount: 'ByteStore or Wiselaw accountId configured in Lawrence gateway', sendEachPayloadOnce: true }
        });
      }
      const updateRows = [update];
      const subscribers = db.prepare('SELECT * FROM subscribers WHERE active=1 AND confirmed_at IS NOT NULL AND update_alert=1').all();
      const messages = subscribers.flatMap((subscriber) => {
        const allowed = parseList(subscriber.jurisdictions);
        const scopedUpdates = updateRows.filter((item) => allowed.includes(item.jurisdiction));
        return scopedUpdates.length ? [buildMessage(subscriber, scopedUpdates, messageType, env, origin, scheduledAt)] : [];
      });
      persistDispatch({ db, idempotencyKey, messageType, scheduledFor: scheduledAt, triggerKind: 'update_event', updateId, messages });
      return json(response, 200, {
        data: { messageType, idempotencyKey, deliveryMode: 'immediate', schedule: DAILY_SCHEDULE, messages },
        gatewayRequirement: { senderAccount: 'ByteStore or Wiselaw accountId configured in Lawrence gateway', sendEachPayloadOnce: true }
      });
    });
  }

  if (request.method === 'GET' && url.pathname.startsWith('/api/dispatch/runs/')) {
    const runMessagesMatch = url.pathname.match(/^\/api\/dispatch\/runs\/([a-zA-Z0-9_-]+)\/messages$/);
    if (runMessagesMatch) {
      if (!env.DISPATCH_API_KEY || request.headers['x-dispatch-key'] !== env.DISPATCH_API_KEY) {
        return json(response, 401, { error: 'A valid dispatch key is required.' });
      }
      const run = db.prepare('SELECT * FROM dispatch_runs WHERE id=?').get(runMessagesMatch[1]);
      if (!run) return json(response, 404, { error: 'Dispatch run not found.' });
      const messages = db.prepare('SELECT * FROM dispatch_messages WHERE dispatch_run_id=? ORDER BY created_at').all(run.id);
      return json(response, 200, {
        data: {
          runId: run.id,
          idempotencyKey: run.idempotency_key,
          status: run.status,
          messages: messages.map((message) => ({
            id: message.id,
            subscriberId: message.subscriber_id,
            messageType: message.message_type,
            recipient: message.recipient,
            subject: message.subject,
            status: message.status,
            attempts: message.attempts,
            lastError: message.last_error,
            sentAt: message.sent_at
          }))
        }
      });
    }
  }

  if (request.method === 'POST' && url.pathname === '/api/subscribers') {
    const ip = getClientIp(request, env);
    if (!limiter.check(ip)) {
      return json(response, 429, { error: 'Too many requests. Try again later.' });
    }
    return readJson(request).then((body) => {
      if (!validateEmail(body.email)) throw Object.assign(new Error('Enter a valid email address.'), { status: 422 });
      const email = body.email.trim().toLowerCase();
      const preferences = normalizePreferences(body, db);
      const token = randomBytes(24).toString('base64url');
      const now = new Date().toISOString();
      const existing = db.prepare('SELECT id FROM subscribers WHERE email=?').get(email);
      const id = existing?.id ?? `sub_${randomUUID()}`;
      // 新建或重新激活时 confirmed_at 一律置空，触发双重确认。
      db.prepare(`INSERT INTO subscribers (
          id, email, daily_briefing, update_alert, jurisdiction_plan, jurisdictions, active, manage_token_hash,
          consented_at, confirmed_at, unsubscribed_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, NULL, NULL, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
          daily_briefing=excluded.daily_briefing, update_alert=excluded.update_alert,
          jurisdiction_plan=excluded.jurisdiction_plan, jurisdictions=excluded.jurisdictions, active=1, manage_token_hash=excluded.manage_token_hash,
          consented_at=excluded.consented_at, confirmed_at=NULL, unsubscribed_at=NULL, updated_at=excluded.updated_at`).run(
        id, email, Number(preferences.dailyBriefing), Number(preferences.updateAlert), preferences.jurisdictionPlan,
        JSON.stringify(preferences.jurisdictions), tokenHash(token).toString('hex'), now, now, now
      );
      const subscriber = db.prepare('SELECT * FROM subscribers WHERE email=?').get(email);
      const origin = `${url.protocol}//${url.host}`;
      const confirmation = buildConfirmationMessage(subscriber, env, origin);
      let confirmationUrl;
      const dryRun = env.CONFIRMATION_DRY_RUN === '1';
      if (!isMailConfigured(env) || dryRun) {
        // 邮件未配置或 DRY_RUN：不真发，改为响应顶层返回 confirmationUrl（便于本地/测试）。
        confirmationUrl = confirmation.confirmationUrl;
      } else {
        sendEmail(env, confirmation).then((outcome) => {
          if (!outcome.ok) console.error(`[confirmation] failed to send to ${subscriber.email}: ${outcome.result?.message || 'unknown'}`);
        });
      }
      const payload = { data: publicSubscriber(subscriber), manageToken: token };
      if (confirmationUrl) payload.confirmationUrl = confirmationUrl;
      return json(response, existing ? 200 : 201, payload);
    });
  }

  const confirmMatch = url.pathname.match(/^\/api\/subscribers\/([a-zA-Z0-9_-]+)\/confirm$/);
  if (confirmMatch && request.method === 'GET') {
    const row = db.prepare('SELECT * FROM subscribers WHERE id=?').get(confirmMatch[1]);
    const token = url.searchParams.get('token');
    const valid = Boolean(row) && tokenMatches(token, row.manage_token_hash, row.id, env);
    if (!valid) {
      response.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      response.end(confirmationPage('invalid'));
      return;
    }
    if (row.confirmed_at) {
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      response.end(confirmationPage('already'));
      return;
    }
    const now = new Date().toISOString();
    db.prepare('UPDATE subscribers SET confirmed_at=?, updated_at=? WHERE id=?').run(now, now, row.id);
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(confirmationPage('success'));
    return;
  }

  const subscriberMatch = url.pathname.match(/^\/api\/subscribers\/([a-zA-Z0-9_-]+)$/);
  if (subscriberMatch && ['GET', 'PATCH', 'DELETE'].includes(request.method)) {
    const row = db.prepare('SELECT * FROM subscribers WHERE id=?').get(subscriberMatch[1]);
    const token = request.headers['x-manage-token'] || url.searchParams.get('token');
    if (!row || !tokenMatches(token, row.manage_token_hash, row.id, env)) return json(response, 404, { error: 'Subscription link is invalid or expired.' });
    if (request.method === 'GET') return json(response, 200, { data: publicSubscriber(row) });
    if (request.method === 'DELETE') {
      const now = new Date().toISOString();
      db.prepare('UPDATE subscribers SET active=0, unsubscribed_at=?, updated_at=? WHERE id=?').run(now, now, row.id);
      return json(response, 200, { data: { ...publicSubscriber({ ...row, active: 0, updated_at: now }), active: false } });
    }
    return readJson(request).then((body) => {
      const preferences = normalizePreferences(body, db);
      const now = new Date().toISOString();
      // PATCH 只更新偏好，不重置 confirmed_at。
      db.prepare(`UPDATE subscribers SET daily_briefing=?, update_alert=?, jurisdiction_plan=?, jurisdictions=?, active=1,
        unsubscribed_at=NULL, updated_at=? WHERE id=?`).run(
        Number(preferences.dailyBriefing), Number(preferences.updateAlert), preferences.jurisdictionPlan, JSON.stringify(preferences.jurisdictions), now, row.id
      );
      return json(response, 200, { data: publicSubscriber(db.prepare('SELECT * FROM subscribers WHERE id=?').get(row.id)) });
    });
  }

  if (request.method === 'POST' && url.pathname === '/api/mail-log') {
    return readJson(request).then((body) => {
      if (!env.MAIL_LOG_API_KEY || request.headers['x-mail-log-key'] !== env.MAIL_LOG_API_KEY) {
        return json(response, 401, { error: 'A valid mail-log key is required.' });
      }
      const result = logMailResult(db, env, body);
      return json(response, 201, { data: result });
    });
  }

  return false;
}

function serveStatic(request, response, url) {
  if (!['GET', 'HEAD'].includes(request.method)) return false;
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  const safePath = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '');
  let filePath = join(publicDir, safePath);
  if (!filePath.startsWith(publicDir)) return false;
  if (!existsSync(filePath) || !statSync(filePath).isFile()) filePath = join(publicDir, 'index.html');
  const stat = statSync(filePath);
  response.writeHead(200, {
    'content-type': MIME_TYPES[extname(filePath)] || 'application/octet-stream',
    'content-length': stat.size,
    'cache-control': extname(filePath) === '.html' ? 'no-cache' : 'public, max-age=3600'
  });
  if (request.method === 'HEAD') return response.end();
  createReadStream(filePath).pipe(response);
  return true;
}

export function createDataTraceServer({ databasePath, env = process.env } = {}) {
  const db = openDatabase(databasePath);
  const limiter = createRateLimiter();
  const server = createServer(async (request, response) => {
    applySecurityHeaders(request, response);
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    try {
      if (url.pathname.startsWith('/api/')) {
        const handled = handleApi(request, response, url, db, env, limiter);
        if (handled instanceof Promise) await handled;
        else if (handled === false) json(response, 404, { error: 'API endpoint not found.' });
        return;
      }
      if (!serveStatic(request, response, url)) json(response, 405, { error: 'Method not allowed.' });
    } catch (error) {
      if (!error.status) console.error(error);
      json(response, error.status || 500, { error: error.status ? error.message : 'Unexpected server error.' });
    }
  });
  // 定期清理限流 Map 中的过期项。
  const cleanupTimer = setInterval(() => limiter.prune(), 60_000);
  cleanupTimer.unref?.();
  server.on('close', () => { clearInterval(cleanupTimer); db.close(); });
  return { server, db };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT) || 3000;
  const { server, db } = createDataTraceServer({ databasePath: process.env.DATABASE_PATH || undefined });
  server.listen(port, '0.0.0.0', () => console.log(`Data Trace running on http://localhost:${port}`));
  // 只在主入口启动定时调度器（测试通过 createDataTraceServer 启动，不受影响）。
  const { startScheduler } = await import('./mail/scheduler.mjs');
  startScheduler({ db, env: process.env });
}
