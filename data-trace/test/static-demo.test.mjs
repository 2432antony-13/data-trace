import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';
import { openDatabase } from '../src/db.mjs';
import { mapUpdate } from '../src/server.mjs';
import { getSourceStatus } from '../src/ingest/status.mjs';

test('static export preserves older jurisdictions beyond 100 rows and all published history', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'dt-static-regression-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const databasePath = join(dir, 'fixture.sqlite');
  const db = openDatabase(databasePath);
  const original = db.prepare("SELECT * FROM updates WHERE status='published' LIMIT 1").get();
  const columns = Object.keys(original);
  const insert = db.prepare(`INSERT INTO updates (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`);
  for (let i = 0; i < 120; i++) {
    const row = { ...original, id: `regression_hk_${i}`, external_id: `regression:${i}`,
      jurisdiction: 'HK', event_date: '2099-01-01' };
    insert.run(...columns.map((key) => row[key]));
  }
  const expected = db.prepare("SELECT * FROM updates WHERE status='published' AND jurisdiction='SG' ORDER BY event_date DESC, id").all().map(mapUpdate);
  const count = db.prepare("SELECT COUNT(*) AS n FROM updates WHERE status='published'").get().n;
  db.close();
  const out = join(dir, 'site');
  const build = spawnSync(process.execPath, [fileURLToPath(new URL('../scripts/build-static-demo.mjs', import.meta.url))], {
    env: { ...process.env, DEMO_DATABASE_PATH: databasePath, DEMO_OUTPUT_DIR: out,
      DEMO_SNAPSHOT_PATH: join(dir, 'no-previous-snapshot.json') },
    encoding: 'utf8', timeout: 30000
  });
  assert.equal(build.status, 0, `${build.stdout}\n${build.stderr}`);
  const context = { window: { fetch: async () => { throw new Error('unexpected external request'); } },
    location: { origin: 'https://example.invalid' }, URL, URLSearchParams, Promise };
  vm.createContext(context);
  vm.runInContext(readFileSync(join(out, 'static-data.js'), 'utf8'), context);
  const data = context.window.__DT_STATIC__;
  assert.equal(data.updates.length, count);
  assert.deepEqual(JSON.parse(JSON.stringify(data.filterUpdates({ jurisdiction: 'SG' }).data)), expected);
  assert.ok(expected.length > 0);
  assert.equal(data.filterUpdates({}).data.length, 50, 'UI API limit remains separate from export completeness');
  assert.equal(JSON.parse(readFileSync(join(out, 'demo-updates.json'), 'utf8')).length, count);
});

test('source status distinguishes unavailable, empty and unobserved sources and retains last success', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'dt-source-status-'));
  const db = openDatabase(join(dir, 'fixture.sqlite'));
  t.after(() => { db.close(); rmSync(dir, { recursive: true, force: true }); });
  const add = db.prepare('INSERT INTO ingestion_runs (id,source_name,started_at,completed_at,status,inserted_count) VALUES (?,?,?,?,?,?)');
  add.run('ok', 'PCPD Hong Kong', '2026-10-24T00:00:00Z', '2026-10-24T00:01:00Z', 'succeeded', 2);
  add.run('bad', 'PCPD Hong Kong', '2026-10-25T00:00:00Z', '2026-10-25T00:01:00Z', 'failed', 0);
  add.run('empty', 'Monetary Authority of Singapore', '2026-10-25T00:00:00Z', '2026-10-25T00:01:00Z', 'succeeded', 0);
  const { sources } = getSourceStatus(db);
  const pcpd = sources.find((s) => s.code === 'pcpd-press');
  assert.equal(pcpd.status, 'failed');
  assert.equal(pcpd.lastSuccessfulAt, '2026-10-24T00:01:00Z');
  assert.equal(sources.find((s) => s.code === 'mas-consultations').status, 'empty');
  assert.equal(sources.find((s) => s.code === 'pdpc-news').status, 'unknown');
  const prior = { sources: [{ code: 'pdpc-news', status: 'failed', checkedAt: '2026-10-24T00:00:00Z', lastSuccessfulAt: null }] };
  assert.deepEqual(getSourceStatus(db, prior).sources.find((s) => s.code === 'pdpc-news'), prior.sources[0]);
});
