// ingest 管线测试：node --test test/ingest.test.mjs
// 全部使用 fixture fetchFn（绝不触网），临时库 mkdtemp，测完清理。
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { openDatabase } from '../src/db.mjs';
import { runIngest } from '../src/ingest/pipeline.mjs';
import { hkSources } from '../src/ingest/sources/hk.mjs';
import { sgSources } from '../src/ingest/sources/sg.mjs';
import { summarize } from '../src/ingest/summarize.mjs';
import { runReview } from '../src/ingest/review.mjs';

const ALL_SOURCES = [...hkSources, ...sgSources];

const PCPD_INDEX_URL = 'https://www.pcpd.org.hk/english/news_events/media_statements/index.html';
const HKEL_CKAN_URL = 'https://data.gov.hk/en-data/api/3/action/package_show?id=hk-doj-hkel-legislation-current';
const PDPC_NEWS_URL = 'https://www.pdpc.gov.sg/news-and-events';
const MAS_CONSULT_URL = 'https://www.mas.gov.sg/publications/consultations';
const IMDA_CODES_URL = 'https://www.imda.gov.sg/regulations-and-licences/regulations/codes-of-practice';

// 每个源的 fixture 内容（模拟真实页面结构，正则据其编写）。
const FIXTURES = {
  [PCPD_INDEX_URL]: '<html><head></head><body><script type="text/javascript" src="../../../js/Media_Statements2.js"></script></body></html>',
  'https://www.pcpd.org.hk/js/Media_Statements2.js': [
    'var Media_Statements={"data":[',
    '{"id":"3214","enTitle":"PCPD and HKIRC Sign MoU","date":"13-08-2026","enlink":"../../../english/news_events/media_statements/press_20260813.html","archive":"N"},',
    '{"id":"3213","enTitle":"A Man Arrested for Suspected Doxxing","date":"11-08-2026","enlink":"../../../english/news_events/media_statements/press_20260811.html","archive":"N"}',
    ']}'
  ].join(''),
  [HKEL_CKAN_URL]: JSON.stringify({
    success: true,
    result: {
      title: 'Hong Kong e-Legislation',
      metadata_modified: '2026-08-10T16:31:24.408779',
      resources: [
        { name: 'Hong Kong Legislation: Caps. 1 — 300 (English)', format: 'ZIP', url: 'https://resource.data.one.gov.hk/doj/data/hkel_c_leg_cap_1_cap_300_en.zip' },
        { name: 'Hong Kong Legislation: Caps. 301 — 600 (English)', format: 'ZIP', url: 'https://resource.data.one.gov.hk/doj/data/hkel_c_leg_cap_301_cap_600_en.zip' }
      ]
    }
  }),
  [PDPC_NEWS_URL]: [
    '<ul class="media-list">',
    '<li><a href="/news-and-events/announcements/2026/08/pdpc-updates-advisory-guidelines">PDPC updates Advisory Guidelines</a> <span>Published on 08 Aug 2026</span></li>',
    '<li><a href="/media-events/press-room/2026/07/pdpc-issues-decision">PDPC issues enforcement decision</a> <span>Published on 15 Jul 2026</span></li>',
    '</ul>'
  ].join(''),
  [MAS_CONSULT_URL]: [
    '<div class="item">',
    '<span>Published Date: 09 July 2026</span>',
    '<a href="/publications/consultations/2026/cp-on-proposed-amendments-to-the-cis-code">Consultation Paper on Proposed Amendments to the CIS Code</a>',
    '</div>',
    '<div class="item">',
    '<span>Published Date: 07 July 2026</span>',
    '<a href="/publications/consultations/2026/consultation-paper-on-proposed-framework-for-protected-cell-companies">Consultation Paper on Protected Cell Companies</a>',
    '</div>'
  ].join(''),
  [IMDA_CODES_URL]: [
    '<ul class="codes-list">',
    '<li><a href="/regulations-and-licences/regulations/codes-of-practice/codes-of-practice-and-guidelines---infocomm">Codes of Practice and Guidelines - Infocomm</a></li>',
    '<li><a href="/regulations-and-licences/regulations/codes-of-practice/codes-of-practice-and-guidelines---media">Codes of Practice and Guidelines - Media</a></li>',
    '</ul>',
    '<p>LAST UPDATED: 25 May 2026</p>'
  ].join('')
};

// 构造 fixture fetchFn：按 URL 返回 200 响应；failUrl 命中则抛错。
function makeFetchFn({ failUrl } = {}) {
  return async (url) => {
    if (failUrl && url === failUrl) throw new Error('fixture network failure');
    const body = FIXTURES[url];
    if (body === undefined) return new Response('not found', { status: 404 });
    return new Response(body, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
  };
}

function makeDb(t) {
  const dir = mkdtempSync(join(tmpdir(), 'ingest-test-'));
  const db = openDatabase(join(dir, 'test.sqlite'));
  t.after(() => {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });
  return db;
}

const sum = (list, key) => list.reduce((n, r) => n + (r[key] || 0), 0);

test('首次 run 插入 status=pending_review 且 ingestion_runs 记为 succeeded', async (t) => {
  const db = makeDb(t);
  const { results } = await runIngest({ db, fetchFn: makeFetchFn(), sources: ALL_SOURCES });
  assert.equal(results.length, 5);
  for (const r of results) assert.equal(r.status, 'succeeded', `${r.code} should succeed`);
  assert.equal(sum(results, 'inserted'), 10);

  const runs = db.prepare("SELECT status, inserted_count FROM ingestion_runs WHERE source_name != 'bundled_authoritative_seed' ORDER BY started_at").all();
  assert.equal(runs.length, 5);
  for (const run of runs) assert.equal(run.status, 'succeeded');
  assert.equal(sum(runs, 'inserted_count'), 10);

  const pending = db.prepare("SELECT COUNT(*) AS c FROM updates WHERE status='pending_review'").get().c;
  assert.equal(pending, 10);
  const row = db.prepare("SELECT * FROM updates WHERE status='pending_review' LIMIT 1").get();
  assert.equal(row.event_type, 'source_refresh');
  assert.equal(row.importance, 'medium');
  assert.equal(row.jurisdiction, 'HK');
  assert.ok(row.id.startsWith('upd_ing_'));
});

test('相同 fixture 二次 run 幂等（inserted=0，unchanged=条数，不重复插入）', async (t) => {
  const db = makeDb(t);
  const fn = makeFetchFn();
  const first = await runIngest({ db, fetchFn: fn, sources: ALL_SOURCES });
  assert.equal(sum(first.results, 'inserted'), 10);

  const second = await runIngest({ db, fetchFn: fn, sources: ALL_SOURCES });
  assert.equal(sum(second.results, 'inserted'), 0);
  assert.equal(sum(second.results, 'unchanged'), 10);
  // seed 16 条 published + 首次 10 条 pending，不因二次运行而增加。
  assert.equal(db.prepare('SELECT COUNT(*) AS c FROM updates').get().c, 26);
  assert.equal(db.prepare("SELECT COUNT(*) AS c FROM updates WHERE status='pending_review'").get().c, 10);
});

test('某源 fetchFn 抛错 → 该源 failed、其它源继续、run 不抛', async (t) => {
  const db = makeDb(t);
  const { results } = await runIngest({ db, fetchFn: makeFetchFn({ failUrl: IMDA_CODES_URL }), sources: ALL_SOURCES });
  const imda = results.find((r) => r.code === 'imda-codes');
  assert.equal(imda.status, 'failed');
  assert.ok(imda.error);
  for (const r of results) {
    if (r.code !== 'imda-codes') assert.equal(r.status, 'succeeded', `${r.code} should continue`);
  }
  const run = db.prepare(
    "SELECT status, error_message FROM ingestion_runs WHERE source_name='IMDA Singapore' ORDER BY started_at DESC LIMIT 1"
  ).get();
  assert.equal(run.status, 'failed');
  assert.ok(run.error_message);
  // 其它 4 个源应各入库 2 条。
  assert.equal(sum(results.filter((r) => r.code !== 'imda-codes'), 'inserted'), 8);
});

test('review approve/reject 改变 status', async (t) => {
  const db = makeDb(t);
  await runIngest({ db, fetchFn: makeFetchFn(), sources: ALL_SOURCES });
  const rows = db.prepare("SELECT id FROM updates WHERE status='pending_review' ORDER BY id LIMIT 2").all();
  assert.equal(rows.length, 2);
  const [a, b] = rows;

  const approve = runReview(db, ['approve', a.id]);
  assert.ok(approve.ok);
  assert.equal(db.prepare('SELECT status FROM updates WHERE id=?').get(a.id).status, 'published');

  const reject = runReview(db, ['reject', b.id]);
  assert.ok(reject.ok);
  assert.equal(db.prepare('SELECT status FROM updates WHERE id=?').get(b.id).status, 'retracted');

  // list 应只显示仍为 pending_review 的 8 条。
  const list = runReview(db, ['list']);
  assert.ok(list.ok);
  assert.match(list.output, /待审校记录/);
});

test('review approve-all 批量发布并改写占位摘要', async (t) => {
  const db = makeDb(t);
  await runIngest({ db, fetchFn: makeFetchFn(), sources: ALL_SOURCES });
  const before = db.prepare("SELECT COUNT(*) AS c FROM updates WHERE status='pending_review'").get().c;
  assert.ok(before >= 2);

  const result = runReview(db, ['approve-all']);
  assert.ok(result.ok);
  assert.match(result.output, /已批量发布/);
  assert.equal(db.prepare("SELECT COUNT(*) AS c FROM updates WHERE status='pending_review'").get().c, 0);
  const published = db.prepare("SELECT COUNT(*) AS c FROM updates WHERE status='published' AND summary_zh LIKE '【自动收录】%'").get().c;
  assert.ok(published >= 2, '占位摘要应改写为【自动收录】前缀');
  // 幂等：再次执行无待审校记录。
  const again = runReview(db, ['approve-all']);
  assert.ok(again.ok);
  assert.match(again.output, /没有待审校的记录/);
});

test('summarize 未配置 env 返回 null（不触网）', async () => {
  assert.equal(await summarize({ title: 't', text: 'x', env: {} }), null);
  assert.equal(await summarize({ title: 't', text: 'x', env: { SUMMARIZE_API_URL: 'http://example.invalid' } }), null);
  assert.equal(await summarize({ title: 't', text: 'x', env: { SUMMARIZE_API_KEY: 'k' } }), null);
});
