import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createDataTraceServer } from '../src/server.mjs';
import { articles, regulationVerification, regulations, updates } from '../src/seed-data.mjs';

async function request(baseUrl, path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.json();
  return { response, body };
}

async function requestText(baseUrl, path) {
  const response = await fetch(`${baseUrl}${path}`);
  const body = await response.text();
  return { response, body };
}

test('authoritative seed facts and relationships match the reviewed official-source snapshot', () => {
  assert.equal(regulations.length, 22);
  assert.equal(articles.length, 26);
  assert.equal(updates.length, 16);
  assert.deepEqual(Object.keys(regulationVerification).sort(), regulations.map(({ id }) => id).sort());

  const allowedOfficialHosts = new Set([
    'www.elegislation.gov.hk', 'www.pcpd.org.hk', 'brdr.hkma.gov.hk', 'www.ofca.gov.hk',
    'sso.agc.gov.sg', 'www.pdpc.gov.sg', 'www.mas.gov.sg', 'www.imda.gov.sg'
  ]);
  const ids = (items, key) => items.map((item) => item[key]);
  for (const [items, label] of [[regulations, 'regulation'], [articles, 'article'], [updates, 'update']]) {
    assert.equal(new Set(ids(items, 'id')).size, items.length, `${label} ids must be unique`);
    assert.equal(new Set(ids(items, 'externalId')).size, items.length, `${label} external ids must be unique`);
    for (const item of items) {
      assert.ok(allowedOfficialHosts.has(new URL(item.sourceUrl).hostname), `${item.id} must use an approved official source`);
    }
  }

  const regulationIds = new Set(ids(regulations, 'id'));
  for (const article of articles) {
    assert.ok(regulationIds.has(article.regulationId), `${article.id} has an orphan regulation`);
    assert.equal(article.sourceAnchor, article.provisionNumber);
    assert.equal(article.versionLabel, 'current_as_checked_2026-08-09');
  }
  for (const update of updates) {
    assert.ok(regulationIds.has(update.regulationId), `${update.id} has an orphan regulation`);
    assert.match(update.eventDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(update.evidence, `${update.id} must state its official evidence locator`);
  }

  const byId = new Map(regulations.map((item) => [item.id, item]));
  assert.equal(byId.get('reg_hk_hkma_tmg1').currentVersionDate, '2003-06-24');
  assert.equal(byId.get('reg_sg_pdpr_2021').currentVersionDate, '2026-03-02');
  assert.equal(byId.get('reg_hk_id_code_2016').currentVersionDate, '2016-04');
  assert.equal(byId.get('reg_hk_id_compliance_guide_2024').currentVersionDate, '2024-08-22');
  assert.notEqual(byId.get('reg_hk_id_code_2016').title, byId.get('reg_hk_id_compliance_guide_2024').title);
  assert.equal(byId.get('reg_sg_imda_telecom_cyber').currentVersionDate, null);

  assert.deepEqual(Object.fromEntries(updates.map(({ id, eventDate }) => [id, eventDate])), {
    upd_hk_pdpo_commencement: '1996-12-20',
    upd_hk_direct_marketing_2013: '2013-04-01',
    upd_hk_doxxing_2021: '2021-10-08',
    upd_hk_breach_guide_2023: '2023-06-30',
    upd_hk_gba_scc_2023: '2023-12-13',
    upd_hk_hkid_guide_2024: '2024-08-22',
    upd_hk_tmg1_issue_2003: '2003-06-24',
    upd_hk_uemo_2007: '2007-12-22',
    upd_sg_core_2014: '2014-07-02',
    upd_sg_2020_amendment: '2021-02-01',
    upd_sg_breach_regs: '2021-02-01',
    upd_sg_penalties_2022: '2022-10-01',
    upd_sg_breach_regs_2024: '2024-10-15',
    upd_sg_pdpa_2025: '2025-12-05',
    upd_sg_mas_trm_2021: '2021-01-18',
    upd_sg_pdpr_2026: '2026-03-02'
  });

  const snapshot = JSON.stringify({ regulations, articles, updates });
  for (const disprovedValue of ['upd_hk_tmg1_2024', '2024-11-05', '2026-02-27', 'reg_hk_id_code_2024', '2024-08-01', 'upd_sg_imda_cyber_2022']) {
    assert.ok(!snapshot.includes(disprovedValue), `seed must not retain disproved value ${disprovedValue}`);
  }
});

test('full regulation-to-subscription flow persists and remains manageable', async (t) => {
  const tempDir = mkdtempSync(join(tmpdir(), 'data-trace-test-'));
  const { server, db } = createDataTraceServer({
    databasePath: join(tempDir, 'test.sqlite'),
    env: {
      MAIL_LOG_API_KEY: 'test-mail-key', DISPATCH_API_KEY: 'test-dispatch-key',
      MANAGE_LINK_SECRET: 'test-manage-secret', PUBLIC_BASE_URL: 'https://data-trace.example',
      CONFIRMATION_DRY_RUN: '1'
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    rmSync(tempDir, { recursive: true, force: true });
  });

  const health = await request(baseUrl, '/api/health');
  assert.equal(health.response.status, 200);
  assert.equal(health.body.database, 'connected');
  assert.equal(health.body.regulations, 22);
  assert.equal(health.body.articles, 26);
  assert.equal(health.body.updates, 16);
  assert.deepEqual(health.body.schedule, { cron: '0 8 * * *', timezone: 'Asia/Shanghai', label: '08:00 Beijing time' });

  // 法域接口：HK/SG 激活 + 路线图（MO 等 inactive）。
  const jurisdictionsApi = await request(baseUrl, '/api/jurisdictions');
  assert.equal(jurisdictionsApi.response.status, 200);
  const jurisdictionCodes = jurisdictionsApi.body.data.map((item) => item.code);
  assert.ok(jurisdictionCodes.includes('HK') && jurisdictionCodes.includes('SG') && jurisdictionCodes.includes('MO'));
  assert.equal(jurisdictionsApi.body.data.find((item) => item.code === 'HK').active, 1);
  assert.equal(jurisdictionsApi.body.data.find((item) => item.code === 'MO').active, 0);
  assert.equal(jurisdictionsApi.body.data.find((item) => item.code === 'MO').name_zh, '澳门');

  const hongKong = await request(baseUrl, '/api/regulations?jurisdiction=HK');
  assert.equal(hongKong.response.status, 200);
  assert.equal(hongKong.body.total, 10);
  assert.ok(hongKong.body.data.every((item) => item.jurisdiction === 'HK'));

  const search = await request(baseUrl, '/api/regulations?q=breach&jurisdiction=SG');
  assert.ok(search.body.total >= 2);
  assert.ok(search.body.data.every((item) => item.jurisdiction === 'SG'));
  assert.ok(search.body.data.every((item) => item.sourceUrl.startsWith('https://')));

  const finance = await request(baseUrl, '/api/regulations?industry=financial_services');
  assert.equal(finance.body.total, 5);
  assert.ok(finance.body.data.some((item) => item.jurisdiction === 'HK' && item.shortTitle === 'HKMA SPM TM-G-1'));
  assert.ok(finance.body.data.some((item) => item.jurisdiction === 'SG' && item.shortTitle === 'MAS TRM Guidelines'));
  assert.ok(finance.body.data.every((item) => item.industries.includes('financial_services')));

  const telecomSecurity = await request(baseUrl, '/api/regulations?industry=telecommunications&topic=cybersecurity');
  assert.equal(telecomSecurity.body.total, 1);
  assert.equal(telecomSecurity.body.data[0].id, 'reg_sg_imda_telecom_cyber');

  const addressHarvesting = await request(baseUrl, '/api/regulations?topic=address_harvesting');
  assert.equal(addressHarvesting.body.total, 2);
  assert.ok(addressHarvesting.body.data.every((item) => item.topics.includes('address_harvesting')));

  const taxonomy = await request(baseUrl, '/api/taxonomy');
  assert.ok(taxonomy.body.data.industries.includes('banking'));
  assert.ok(taxonomy.body.data.industries.includes('telecommunications'));
  assert.ok(taxonomy.body.data.topics.includes('cross_border_transfer'));

  const detail = await request(baseUrl, '/api/regulations/reg_sg_pdpa_2012');
  assert.equal(detail.response.status, 200);
  assert.ok(detail.body.data.articles.length >= 6);
  assert.ok(detail.body.data.updates.length >= 4);

  const invalidSubscription = await request(baseUrl, '/api/subscribers', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email', dailyBriefing: true })
  });
  assert.equal(invalidSubscription.response.status, 422);

  const created = await request(baseUrl, '/api/subscribers', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'Counsel@example.com', dailyBriefing: true, updateAlert: true, jurisdictionPlan: 'ALL' })
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.body.data.email, 'counsel@example.com');
  assert.ok(created.body.manageToken);
  assert.equal(created.body.data.jurisdictionPlan, 'ALL');
  // 双重确认：新建时 pendingConfirmation 为 true，且 DRY_RUN 下顶层返回 confirmationUrl。
  assert.equal(created.body.data.pendingConfirmation, true);
  assert.equal(created.body.data.confirmedAt, null);
  assert.ok(created.body.confirmationUrl);
  const { id } = created.body.data;

  // 访问确认链接（相对路径）→ 200 且返回确认成功 HTML。
  const confirmationUrl = new URL(created.body.confirmationUrl);
  const confirmed = await requestText(baseUrl, `${confirmationUrl.pathname}${confirmationUrl.search}`);
  assert.equal(confirmed.response.status, 200);
  assert.match(confirmed.response.headers.get('content-type'), /text\/html/);
  assert.match(confirmed.body, /确认成功/);

  // 确认后 pendingConfirmation 变为 false，DB confirmed_at 非空。
  const afterConfirm = await request(baseUrl, `/api/subscribers/${id}`, {
    headers: { 'x-manage-token': created.body.manageToken }
  });
  assert.equal(afterConfirm.response.status, 200);
  assert.equal(afterConfirm.body.data.pendingConfirmation, false);
  assert.ok(afterConfirm.body.data.confirmedAt);
  assert.ok(db.prepare('SELECT confirmed_at FROM subscribers WHERE id=?').get(id).confirmed_at);

  const managed = await request(baseUrl, `/api/subscribers/${id}`, {
    method: 'PATCH', headers: { 'content-type': 'application/json', 'x-manage-token': created.body.manageToken },
    body: JSON.stringify({ dailyBriefing: true, updateAlert: true, jurisdictionPlan: 'SG' })
  });
  assert.equal(managed.response.status, 200);
  assert.equal(managed.body.data.dailyBriefing, true);
  assert.equal(managed.body.data.jurisdictionPlan, 'SG');
  assert.deepEqual(managed.body.data.jurisdictions, ['SG']);
  // PATCH 只更新偏好，不重置 confirmed_at。
  assert.ok(db.prepare('SELECT confirmed_at FROM subscribers WHERE id=?').get(id).confirmed_at);

  // 未知法域 code 必须被拒绝（PATCH 不受订阅限流影响）。
  const unknownJurisdiction = await request(baseUrl, `/api/subscribers/${id}`, {
    method: 'PATCH', headers: { 'content-type': 'application/json', 'x-manage-token': created.body.manageToken },
    body: JSON.stringify({ dailyBriefing: true, updateAlert: true, jurisdictions: ['XX'] })
  });
  assert.equal(unknownJurisdiction.response.status, 422);
  assert.match(unknownJurisdiction.body.error, /Unknown jurisdiction/);

  // 第二个未确认订阅者：使用 jurisdictions 多选数组（覆盖 HK+SG → 派生计划 ALL），不应进入 dispatch。
  const unconfirmed = await request(baseUrl, '/api/subscribers', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'pending@example.com', dailyBriefing: true, updateAlert: true, jurisdictions: ['HK', 'SG'] })
  });
  assert.equal(unconfirmed.response.status, 201);
  assert.equal(unconfirmed.body.data.pendingConfirmation, true);
  assert.ok(unconfirmed.body.confirmationUrl);
  assert.equal(unconfirmed.body.data.jurisdictionPlan, 'ALL');
  assert.deepEqual(unconfirmed.body.data.jurisdictions, ['HK', 'SG']);

  const briefing = await request(baseUrl, '/api/briefings/preview?jurisdiction=SG');
  assert.equal(briefing.response.status, 200);
  assert.match(briefing.body.data.subject, /Data Trace Daily/);
  assert.equal(briefing.body.data.updates.length, 5);
  assert.match(briefing.body.data.text, /中文一句话摘要（AI）/);
  assert.match(briefing.body.data.disclaimer, /not legal advice/);

  const wrongTime = await request(baseUrl, '/api/dispatch/messages', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-dispatch-key': 'test-dispatch-key' },
    body: JSON.stringify({ messageType: 'daily_briefing', scheduledAt: '2026-08-09T01:00:00.000Z' })
  });
  assert.equal(wrongTime.response.status, 409);

  const dispatch = await request(baseUrl, '/api/dispatch/messages', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-dispatch-key': 'test-dispatch-key' },
    body: JSON.stringify({ messageType: 'daily_briefing', scheduledAt: '2026-08-09T00:00:00.000Z' })
  });
  assert.equal(dispatch.response.status, 200);
  assert.equal(dispatch.body.data.deliveryMode, 'scheduled_08_beijing');
  assert.equal(dispatch.body.data.messages.length, 1);
  assert.equal(dispatch.body.data.messages[0].gateway.to, 'counsel@example.com');
  // 未确认订阅者不进入 dispatch。
  assert.ok(!dispatch.body.data.messages.some((m) => m.gateway.to === 'pending@example.com'));
  assert.match(dispatch.body.data.messages[0].gateway.content.text, /中文一句话摘要（AI）/);
  assert.match(dispatch.body.data.messages[0].gateway.metadata.subject, /2026-08-09/);
  assert.match(dispatch.body.data.messages[0].manageUrl, new RegExp(`/\\#subscribe\\?subscriber=${id}`));
  assert.match(dispatch.body.data.messages[0].unsubscribeUrl, /action=unsubscribe/);
  // dispatch 后 dispatch_messages 表 queued 行数等于 messages.length。
  assert.equal(
    db.prepare("SELECT COUNT(*) AS count FROM dispatch_messages WHERE status='queued'").get().count,
    dispatch.body.data.messages.length
  );

  const duplicateDispatch = await request(baseUrl, '/api/dispatch/messages', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-dispatch-key': 'test-dispatch-key' },
    body: JSON.stringify({ messageType: 'daily_briefing', scheduledAt: '2026-08-09T00:00:00.000Z' })
  });
  assert.equal(duplicateDispatch.body.data.alreadyPrepared, true);
  assert.equal(duplicateDispatch.body.data.messages.length, 0);

  const immediate = await request(baseUrl, '/api/dispatch/messages', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-dispatch-key': 'test-dispatch-key' },
    body: JSON.stringify({ messageType: 'update_alert', updateId: 'upd_sg_pdpr_2026' })
  });
  assert.equal(immediate.response.status, 200);
  assert.equal(immediate.body.data.deliveryMode, 'immediate');
  assert.equal(immediate.body.data.messages.length, 1);

  const mailLog = await request(baseUrl, '/api/mail-log', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-mail-log-key': 'test-mail-key' },
    body: JSON.stringify({ subscriberId: id, messageType: 'test', subject: 'Data Trace test briefing', body: briefing.body.data.text, skipReason: 'No configured gateway sender account or user-selected recipient.' })
  });
  assert.equal(mailLog.response.status, 201);
  assert.equal(mailLog.body.data.status, 'skipped');
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM mail_log WHERE status=\'sent\'').get().count, 0);
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM dispatch_runs').get().count, 2);

  const cancelled = await request(baseUrl, `/api/subscribers/${id}`, {
    method: 'DELETE', headers: { 'x-manage-token': created.body.manageToken }
  });
  assert.equal(cancelled.response.status, 200);
  assert.equal(cancelled.body.data.active, false);
  assert.equal(db.prepare('SELECT active FROM subscribers WHERE id=?').get(id).active, 0);
});

test('seed import is idempotent and keeps stable record counts', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'data-trace-seed-'));
  const databasePath = join(tempDir, 'seed.sqlite');
  const first = createDataTraceServer({ databasePath });
  const legacyTime = '2026-08-08T00:00:00.000Z';
  first.db.prepare(`INSERT INTO regulations (
    id, external_id, jurisdiction, title, short_title, instrument_type, industries, topics, issuing_body, status,
    publication_date, effective_date, current_version_date, parent_external_id, summary, source_url, source_name,
    source_checked_at, content_hash, source_payload, created_at, updated_at
  ) VALUES (?, ?, 'HK', ?, ?, 'code_of_practice', '["cross_industry"]', '["identity_data"]', ?, 'guidance_current',
    '2024-08-01', NULL, '2024-08-01', 'hk:cap486', ?, ?, ?, ?, 'legacy', '{}', ?, ?)`).run(
    'reg_hk_id_code_2024_legacy', 'hk:pcpd:code:hkid:2024-08',
    'Code of Practice on the Identity Card Number and other Personal Identifiers', 'Legacy HKID Code',
    'Privacy Commissioner for Personal Data', 'Legacy conflated record',
    'https://www.pcpd.org.hk/english/resources_centre/publications/guidance/guidance.html', 'PCPD Hong Kong',
    legacyTime, legacyTime, legacyTime
  );
  first.db.prepare(`INSERT INTO updates (
    id, external_id, regulation_id, jurisdiction, event_type, title, summary, event_date, importance, industries, topics,
    summary_zh, source_url, source_name, source_checked_at, content_hash, previous_version_external_id, created_at, updated_at
  ) VALUES (?, ?, 'reg_hk_hkma_tmg1', 'HK', 'guidance_revision', ?, ?, '2024-11-05', 'high',
    '["financial_services","banking"]', '["technology_risk"]', ?, ?, ?, ?, 'legacy', NULL, ?, ?)`).run(
    'upd_hk_tmg1_2024_legacy', 'hk:event:hkma-tmg1:2024-11-05', 'Fabricated TM-G-1 revision',
    'Legacy false update', '旧有虚假更新', 'https://brdr.hkma.gov.hk/eng/doc-ldg/spm/current/TM-G-1',
    'Hong Kong Monetary Authority', legacyTime, legacyTime, legacyTime
  );
  first.db.close();
  const second = createDataTraceServer({ databasePath });
  assert.equal(second.db.prepare('SELECT COUNT(*) AS count FROM regulations').get().count, 22);
  assert.equal(second.db.prepare('SELECT COUNT(*) AS count FROM articles').get().count, 26);
  assert.equal(second.db.prepare('SELECT COUNT(*) AS count FROM updates').get().count, 16);
  assert.equal(second.db.prepare("SELECT COUNT(*) AS count FROM regulations WHERE external_id='hk:pcpd:code:hkid:2024-08'").get().count, 0);
  assert.equal(second.db.prepare("SELECT COUNT(*) AS count FROM updates WHERE external_id='hk:event:hkma-tmg1:2024-11-05'").get().count, 0);
  second.db.close();
  rmSync(tempDir, { recursive: true, force: true });
});

test('subscriber rate limit throttles bursts from a single IP', async (t) => {
  const tempDir = mkdtempSync(join(tmpdir(), 'data-trace-rate-'));
  const { server } = createDataTraceServer({
    databasePath: join(tempDir, 'test.sqlite'),
    env: { MANAGE_LINK_SECRET: 'test-manage-secret', CONFIRMATION_DRY_RUN: '1' }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    rmSync(tempDir, { recursive: true, force: true });
  });

  const postSubscriber = () => request(baseUrl, '/api/subscribers', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: `rate-${Math.random().toString(36).slice(2)}@example.com`, dailyBriefing: true, jurisdictionPlan: 'ALL' })
  });

  for (let i = 0; i < 3; i++) {
    const result = await postSubscriber();
    assert.equal(result.response.status, 201);
  }
  const limited = await postSubscriber();
  assert.equal(limited.response.status, 429);
  assert.equal(limited.body.error, 'Too many requests. Try again later.');
});
