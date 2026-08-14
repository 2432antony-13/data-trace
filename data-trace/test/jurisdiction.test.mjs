// test/jurisdiction.test.mjs
// 法域拓展重构（数据层迁移）的集成回归测试。
// schema.sql 已同步为「无 CHECK」版本；openDatabase 会自动执行
// runJurisdictionMigration（幂等）。本文件验证两条路径：
//   ① 旧库（含硬编码 CHECK、缺新列）→ 打开即自动迁移、数据保留、新法域可插入；
//   ② 新库 → 天然无 CHECK，显式迁移幂等跳过。

import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { openDatabase } from '../src/db.mjs';
import { runJurisdictionMigration } from '../src/migrations/003-jurisdiction-refactor.mjs';

// 旧版（迁移前）DDL：三张表带硬编码 CHECK；updates 缺 status 列、
// subscribers 缺 confirmed_at/bounce_count 列，以覆盖 ALTER 补列路径。
const LEGACY_REGULATIONS = `CREATE TABLE regulations (
  id TEXT PRIMARY KEY,
  external_id TEXT NOT NULL UNIQUE,
  jurisdiction TEXT NOT NULL CHECK (jurisdiction IN ('HK', 'SG')),
  title TEXT NOT NULL,
  short_title TEXT NOT NULL,
  instrument_type TEXT NOT NULL CHECK (instrument_type IN ('legislation', 'subsidiary_legislation', 'regulator_guidance', 'code_of_practice')),
  industries TEXT NOT NULL DEFAULT '["cross_industry"]',
  topics TEXT NOT NULL DEFAULT '[]',
  issuing_body TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in_force', 'guidance_current', 'superseded')),
  publication_date TEXT,
  effective_date TEXT,
  current_version_date TEXT,
  parent_external_id TEXT,
  summary TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_checked_at TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  source_payload TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`;
const LEGACY_UPDATES = `CREATE TABLE updates (
  id TEXT PRIMARY KEY,
  external_id TEXT NOT NULL UNIQUE,
  regulation_id TEXT REFERENCES regulations(id) ON DELETE SET NULL,
  jurisdiction TEXT NOT NULL CHECK (jurisdiction IN ('HK', 'SG')),
  event_type TEXT NOT NULL CHECK (event_type IN ('enactment', 'commencement', 'amendment', 'guidance_release', 'guidance_revision', 'source_refresh')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  event_date TEXT NOT NULL,
  importance TEXT NOT NULL CHECK (importance IN ('high', 'medium', 'low')),
  industries TEXT NOT NULL DEFAULT '["cross_industry"]',
  topics TEXT NOT NULL DEFAULT '[]',
  summary_zh TEXT NOT NULL DEFAULT '',
  source_url TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_checked_at TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  previous_version_external_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`;
const LEGACY_SUBSCRIBERS = `CREATE TABLE subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  daily_briefing INTEGER NOT NULL DEFAULT 0 CHECK (daily_briefing IN (0, 1)),
  update_alert INTEGER NOT NULL DEFAULT 0 CHECK (update_alert IN (0, 1)),
  jurisdiction_plan TEXT NOT NULL DEFAULT 'ALL' CHECK (jurisdiction_plan IN ('HK', 'SG', 'ALL')),
  jurisdictions TEXT NOT NULL DEFAULT '["HK","SG"]',
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  manage_token_hash TEXT NOT NULL,
  consented_at TEXT NOT NULL,
  unsubscribed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`;

function tableDdl(db, name) {
  return String(db.prepare('SELECT sql FROM sqlite_master WHERE name=?').get(name).sql);
}

test('旧库打开时自动迁移：CHECK 移除、数据保留、新法域可插入', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'data-trace-legacy-'));
  const databasePath = join(tempDir, 'legacy.sqlite');

  // 手工构造旧版库：三张带 CHECK 的表 + 一条旧法规 + 一条旧订阅者。
  const raw = new DatabaseSync(databasePath);
  raw.exec(LEGACY_REGULATIONS);
  raw.exec(LEGACY_UPDATES);
  raw.exec(LEGACY_SUBSCRIBERS);
  raw.prepare(`INSERT INTO regulations (
    id, external_id, jurisdiction, title, short_title, instrument_type, issuing_body, status, summary,
    source_url, source_name, source_checked_at, content_hash, created_at, updated_at
  ) VALUES ('reg_legacy_keep', 'legacy:keep:1', 'HK', 'Legacy regulation', 'Legacy', 'legislation', 'Legacy body',
    'in_force', 'legacy summary', 'https://example.org/legacy', 'Legacy source',
    '2026-08-08T00:00:00.000Z', 'legacy-hash', '2026-08-08T00:00:00.000Z', '2026-08-08T00:00:00.000Z')`).run();
  raw.prepare(`INSERT INTO subscribers (id, email, manage_token_hash, consented_at, created_at, updated_at)
    VALUES ('sub_legacy_keep', 'legacy@example.com', 'legacy-token', '2026-08-08T00:00:00.000Z',
    '2026-08-08T00:00:00.000Z', '2026-08-08T00:00:00.000Z')`).run();
  raw.close();

  const db = openDatabase(databasePath);
  try {
    // 自动迁移后：三张表 DDL 不再含旧 CHECK。
    assert.ok(!tableDdl(db, 'regulations').includes("CHECK (jurisdiction IN ('HK', 'SG'))"));
    assert.ok(!tableDdl(db, 'updates').includes("CHECK (jurisdiction IN ('HK', 'SG'))"));
    assert.ok(!tableDdl(db, 'subscribers').includes("CHECK (jurisdiction_plan IN ('HK', 'SG', 'ALL'))"));

    // 种子数据 22/26/16 + 旧数据保留。
    assert.equal(db.prepare('SELECT COUNT(*) AS c FROM regulations').get().c, 23);
    assert.equal(db.prepare('SELECT COUNT(*) AS c FROM articles').get().c, 26);
    assert.equal(db.prepare('SELECT COUNT(*) AS c FROM updates').get().c, 16);
    assert.equal(db.prepare("SELECT COUNT(*) AS c FROM regulations WHERE external_id='legacy:keep:1'").get().c, 1);
    assert.equal(db.prepare("SELECT COUNT(*) AS c FROM subscribers WHERE id='sub_legacy_keep'").get().c, 1);

    // 迁移后可插入 jurisdiction='MO' 的 regulation。
    db.prepare(`INSERT INTO regulations (
      id, external_id, jurisdiction, title, short_title, instrument_type, issuing_body, status, summary,
      source_url, source_name, source_checked_at, content_hash, created_at, updated_at
    ) VALUES ('reg_mo_test', 'mo:test:1', 'MO', '澳门测试法', '澳门测试', 'legislation', '澳门监管机构', 'in_force',
      '测试摘要', 'https://example.org/law', '测试来源', '2026-08-09T00:00:00.000Z', 'test-hash',
      '2026-08-09T00:00:00.000Z', '2026-08-09T00:00:00.000Z')`).run();
    assert.equal(db.prepare("SELECT jurisdiction FROM regulations WHERE id='reg_mo_test'").get().jurisdiction, 'MO');

    // 迁移后 subscribers 可插入 jurisdiction_plan='ASIA' 的行。
    db.prepare(`INSERT INTO subscribers (id, email, jurisdiction_plan, manage_token_hash, consented_at, created_at, updated_at)
      VALUES ('sub_asia_test', 'asia@example.com', 'ASIA', 'test-token-hash', '2026-08-09T00:00:00.000Z',
      '2026-08-09T00:00:00.000Z', '2026-08-09T00:00:00.000Z')`).run();
    assert.equal(db.prepare("SELECT jurisdiction_plan FROM subscribers WHERE id='sub_asia_test'").get().jurisdiction_plan, 'ASIA');

    // 外键完整性校验为空。
    assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(), []);
  } finally {
    db.close();
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test('新库天然无 CHECK，显式迁移幂等跳过', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'data-trace-fresh-'));
  const databasePath = join(tempDir, 'fresh.sqlite');
  const db = openDatabase(databasePath);
  try {
    assert.equal(db.prepare('SELECT COUNT(*) AS c FROM regulations').get().c, 22);
    assert.equal(db.prepare('SELECT COUNT(*) AS c FROM articles').get().c, 26);
    assert.equal(db.prepare('SELECT COUNT(*) AS c FROM updates').get().c, 16);
    assert.ok(!tableDdl(db, 'regulations').includes("CHECK (jurisdiction IN ('HK', 'SG'))"));

    // 幂等：新库已无 CHECK，显式调用返回 changed:false。
    const result = runJurisdictionMigration(db);
    assert.deepEqual(result, { changed: false });

    // jurisdictions 路线图表已种入（HK/SG 激活 + 路线图）。
    const roadmap = db.prepare('SELECT code, active FROM jurisdictions ORDER BY code').all();
    assert.ok(roadmap.some((row) => row.code === 'HK' && row.active === 1));
    assert.ok(roadmap.some((row) => row.code === 'SG' && row.active === 1));
    assert.ok(roadmap.some((row) => row.code === 'MO' && row.active === 0));
    assert.ok(roadmap.length >= 18);

    assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(), []);
  } finally {
    db.close();
    rmSync(tempDir, { recursive: true, force: true });
  }
});
