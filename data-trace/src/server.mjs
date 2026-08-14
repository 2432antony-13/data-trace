import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { hash, openDatabase } from './db.mjs';

const moduleDir = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(moduleDir, '../public');
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8'
};
const CLASSIFICATION_PATTERN = /^[a-z][a-z0-9_]{0,63}$/;
const JURISDICTION_PLANS = { HK: ['HK'], SG: ['SG'], ALL: ['HK', 'SG'] };
const DAILY_SCHEDULE = { cron: '0 8 * * *', timezone: 'Asia/Shanghai', label: '08:00 Beijing time' };
const DISCLAIMER = 'AI-generated Chinese summaries are for regulatory tracking only and may contain errors. They are not legal advice; verify the official source before relying on them. / AI 生成的中文摘要仅用于法规追踪，可能存在错误，不构成法律意见；使用前请核对官方原文。';

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

function normalizePreferences(body) {
  const dailyBriefing = body.dailyBriefing === true;
  const updateAlert = body.updateAlert === true;
  if (!dailyBriefing && !updateAlert) {
    throw Object.assign(new Error('Select daily briefing, regulation update alerts, or both.'), { status: 422 });
  }
  const jurisdictionPlan = String(body.jurisdictionPlan || '').toUpperCase();
  if (!Object.hasOwn(JURISDICTION_PLANS, jurisdictionPlan)) {
    throw Object.assign(new Error('Choose one jurisdiction plan: HK, SG, or ALL.'), { status: 422 });
  }
  return { dailyBriefing, updateAlert, jurisdictionPlan, jurisdictions: JURISDICTION_PLANS[jurisdictionPlan] };
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
    updatedAt: row.updated_at
  };
}

function parseList(value) {
  try { return JSON.parse(value || '[]'); } catch { return []; }
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

function beijingParts(value) {
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

function handleApi(request, response, url, db, env) {
  if (request.method === 'GET' && url.pathname === '/api/health') {
    const counts = db.prepare(`SELECT
      (SELECT COUNT(*) FROM regulations) AS regulations,
      (SELECT COUNT(*) FROM articles) AS articles,
      (SELECT COUNT(*) FROM updates) AS updates,
      (SELECT COUNT(*) FROM subscribers WHERE active=1) AS subscribers`).get();
    return json(response, 200, { status: 'ok', database: 'connected', schedule: DAILY_SCHEDULE, ...counts });
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
    if (['HK', 'SG'].includes(jurisdiction)) { clauses.push('jurisdiction = ?'); values.push(jurisdiction); }
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
    const clauses = [];
    const values = [];
    if (['HK', 'SG'].includes(jurisdiction)) { clauses.push('jurisdiction=?'); values.push(jurisdiction); }
    if (CLASSIFICATION_PATTERN.test(industry || '')) { clauses.push('EXISTS (SELECT 1 FROM json_each(updates.industries) WHERE value=?)'); values.push(industry); }
    if (CLASSIFICATION_PATTERN.test(topic || '')) { clauses.push('EXISTS (SELECT 1 FROM json_each(updates.topics) WHERE value=?)'); values.push(topic); }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const rows = db.prepare(`SELECT * FROM updates ${where} ORDER BY event_date DESC LIMIT ?`).all(...values, limit);
    return json(response, 200, { data: rows.map(mapUpdate), total: rows.length });
  }

  if (request.method === 'GET' && url.pathname === '/api/briefings/preview') {
    const jurisdiction = url.searchParams.get('jurisdiction');
    const rows = ['HK', 'SG'].includes(jurisdiction)
      ? db.prepare('SELECT * FROM updates WHERE jurisdiction=? ORDER BY event_date DESC LIMIT 5').all(jurisdiction)
      : db.prepare('SELECT * FROM updates ORDER BY event_date DESC LIMIT 5').all();
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
      const beijing = beijingParts(scheduledAt);
      if (messageType === 'daily_briefing' && beijing.hour !== 8) {
        throw Object.assign(new Error('Daily briefings may only be prepared for 08:00 Beijing time.'), { status: 409 });
      }
      let updateRows;
      let updateId = null;
      if (messageType === 'update_alert') {
        updateId = String(body.updateId || '');
        const update = db.prepare('SELECT * FROM updates WHERE id=?').get(updateId);
        if (!update) throw Object.assign(new Error('A valid updateId is required for an immediate alert.'), { status: 422 });
        updateRows = [update];
      } else {
        updateRows = db.prepare('SELECT * FROM updates ORDER BY event_date DESC LIMIT 8').all();
      }
      const idempotencyKey = messageType === 'daily_briefing'
        ? `daily:${beijing.date}:08:Asia/Shanghai`
        : `alert:${updateId}`;
      const existingRun = db.prepare('SELECT * FROM dispatch_runs WHERE idempotency_key=?').get(idempotencyKey);
      if (existingRun) {
        return json(response, 200, {
          data: { messageType, idempotencyKey, alreadyPrepared: true, deliveryMode: messageType === 'daily_briefing' ? 'scheduled_08_beijing' : 'immediate', schedule: DAILY_SCHEDULE, messages: [] },
          gatewayRequirement: { senderAccount: 'ByteStore or Wiselaw accountId configured in Lawrence gateway', sendEachPayloadOnce: true }
        });
      }
      const subscribers = db.prepare(`SELECT * FROM subscribers WHERE active=1 AND ${messageType === 'daily_briefing' ? 'daily_briefing=1' : 'update_alert=1'}`).all();
      const origin = `${url.protocol}//${url.host}`;
      const messages = subscribers.flatMap((subscriber) => {
        const allowed = JURISDICTION_PLANS[subscriber.jurisdiction_plan] || parseList(subscriber.jurisdictions);
        const scopedUpdates = updateRows.filter((item) => allowed.includes(item.jurisdiction));
        return scopedUpdates.length ? [buildMessage(subscriber, scopedUpdates, messageType, env, origin, scheduledAt)] : [];
      });
      const now = new Date().toISOString();
      db.prepare(`INSERT INTO dispatch_runs (id, idempotency_key, message_type, scheduled_for, timezone, trigger_kind, update_id, status, recipient_count, created_at)
        VALUES (?, ?, ?, ?, 'Asia/Shanghai', ?, ?, 'prepared', ?, ?)`).run(
        `dispatch_${randomUUID()}`, idempotencyKey, messageType, scheduledAt.toISOString(),
        messageType === 'daily_briefing' ? 'schedule' : 'update_event', updateId, messages.length, now
      );
      return json(response, 200, {
        data: { messageType, idempotencyKey, deliveryMode: messageType === 'daily_briefing' ? 'scheduled_08_beijing' : 'immediate', schedule: DAILY_SCHEDULE, messages },
        gatewayRequirement: { senderAccount: 'ByteStore or Wiselaw accountId configured in Lawrence gateway', sendEachPayloadOnce: true }
      });
    });
  }

  if (request.method === 'POST' && url.pathname === '/api/subscribers') {
    return readJson(request).then((body) => {
      if (!validateEmail(body.email)) throw Object.assign(new Error('Enter a valid email address.'), { status: 422 });
      const email = body.email.trim().toLowerCase();
      const preferences = normalizePreferences(body);
      const token = randomBytes(24).toString('base64url');
      const now = new Date().toISOString();
      const existing = db.prepare('SELECT id FROM subscribers WHERE email=?').get(email);
      const id = existing?.id ?? `sub_${randomUUID()}`;
      db.prepare(`INSERT INTO subscribers (
          id, email, daily_briefing, update_alert, jurisdiction_plan, jurisdictions, active, manage_token_hash,
          consented_at, unsubscribed_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, NULL, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
          daily_briefing=excluded.daily_briefing, update_alert=excluded.update_alert,
          jurisdiction_plan=excluded.jurisdiction_plan, jurisdictions=excluded.jurisdictions, active=1, manage_token_hash=excluded.manage_token_hash,
          consented_at=excluded.consented_at, unsubscribed_at=NULL, updated_at=excluded.updated_at`).run(
        id, email, Number(preferences.dailyBriefing), Number(preferences.updateAlert), preferences.jurisdictionPlan,
        JSON.stringify(preferences.jurisdictions), tokenHash(token).toString('hex'), now, now, now
      );
      const subscriber = db.prepare('SELECT * FROM subscribers WHERE email=?').get(email);
      return json(response, existing ? 200 : 201, { data: publicSubscriber(subscriber), manageToken: token });
    });
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
      const preferences = normalizePreferences(body);
      const now = new Date().toISOString();
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
      if (!['daily_briefing', 'update_alert', 'test'].includes(body.messageType)) {
        throw Object.assign(new Error('Invalid messageType.'), { status: 422 });
      }
      const gatewayResult = body.gatewayResult;
      const status = gatewayResult?.success === true ? 'sent' : gatewayResult?.success === false ? 'failed' : 'skipped';
      const providerMessageId = gatewayResult?.messageId || gatewayResult?.id || null;
      const errorMessage = status === 'failed' ? String(gatewayResult?.message || 'Gateway delivery failed.') : status === 'skipped' ? String(body.skipReason || 'Gateway delivery was not attempted.') : null;
      const now = new Date().toISOString();
      const payloadHash = body.payloadHash || hash({ subscriberId: body.subscriberId, subject: body.subject, body: body.body });
      const id = `mail_${randomUUID()}`;
      db.prepare(`INSERT INTO mail_log (
        id, subscriber_id, message_type, subject, status, provider, provider_message_id, account_id, gateway_response_json,
        payload_hash, error_message, attempted_at, delivered_at, created_at
      ) VALUES (?, ?, ?, ?, ?, 'lawrence_gateway', ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        id, body.subscriberId ?? null, body.messageType, String(body.subject || '').slice(0, 300),
        status, providerMessageId, body.accountId ?? null, gatewayResult ? JSON.stringify(gatewayResult) : null,
        payloadHash, errorMessage, body.attemptedAt ?? now, status === 'sent' ? (body.deliveredAt ?? now) : null, now
      );
      return json(response, 201, { data: { id, payloadHash, status, providerMessageId } });
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
  const server = createServer(async (request, response) => {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    try {
      if (url.pathname.startsWith('/api/')) {
        const handled = handleApi(request, response, url, db, env);
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
  server.on('close', () => db.close());
  return { server, db };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT) || 3000;
  const { server } = createDataTraceServer();
  server.listen(port, '0.0.0.0', () => console.log(`Data Trace running on http://localhost:${port}`));
}
