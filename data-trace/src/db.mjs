import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { articles, deprecatedSeedRecords, regulations, updates } from './seed-data.mjs';
import { runJurisdictionMigration } from './migrations/003-jurisdiction-refactor.mjs';

const moduleDir = dirname(fileURLToPath(import.meta.url));
const checkedAt = '2026-08-09T00:00:00.000Z';

const jurisdictionRoadmap = [
  { code: 'HK', nameEn: 'Hong Kong', nameZh: '香港', region: 'apac', tier: 0, active: true },
  { code: 'SG', nameEn: 'Singapore', nameZh: '新加坡', region: 'apac', tier: 0, active: true },
  { code: 'MO', nameEn: 'Macau', nameZh: '澳门', region: 'apac', tier: 1, active: false },
  { code: 'CN', nameEn: 'Mainland China', nameZh: '中国大陆', region: 'apac', tier: 1, active: false },
  { code: 'TH', nameEn: 'Thailand', nameZh: '泰国', region: 'apac', tier: 2, active: false },
  { code: 'ID', nameEn: 'Indonesia', nameZh: '印度尼西亚', region: 'apac', tier: 2, active: false },
  { code: 'MY', nameEn: 'Malaysia', nameZh: '马来西亚', region: 'apac', tier: 2, active: false },
  { code: 'VN', nameEn: 'Vietnam', nameZh: '越南', region: 'apac', tier: 2, active: false },
  { code: 'PH', nameEn: 'Philippines', nameZh: '菲律宾', region: 'apac', tier: 2, active: false },
  { code: 'JP', nameEn: 'Japan', nameZh: '日本', region: 'apac', tier: 3, active: false },
  { code: 'KR', nameEn: 'South Korea', nameZh: '韩国', region: 'apac', tier: 3, active: false },
  { code: 'IN', nameEn: 'India', nameZh: '印度', region: 'apac', tier: 4, active: false },
  { code: 'AU', nameEn: 'Australia', nameZh: '澳大利亚', region: 'apac', tier: 4, active: false },
  { code: 'NZ', nameEn: 'New Zealand', nameZh: '新西兰', region: 'apac', tier: 4, active: false },
  { code: 'UK', nameEn: 'United Kingdom', nameZh: '英国', region: 'emea', tier: 5, active: false },
  { code: 'EU', nameEn: 'European Union', nameZh: '欧盟', region: 'emea', tier: 5, active: false },
  { code: 'US', nameEn: 'United States', nameZh: '美国', region: 'americas', tier: 5, active: false },
  { code: 'CA', nameEn: 'Canada', nameZh: '加拿大', region: 'americas', tier: 5, active: false }
];

export function hash(value) {
  return createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
}

export function openDatabase(databasePath = resolve(moduleDir, '../data/data-trace.sqlite')) {
  mkdirSync(dirname(databasePath), { recursive: true });
  const db = new DatabaseSync(databasePath);
  db.exec(readFileSync(resolve(moduleDir, 'schema.sql'), 'utf8'));
  migrateDatabase(db);
  seedDatabase(db);
  return db;
}

function migrateDatabase(db) {
  const additions = {
    regulations: [
      ['industries', `TEXT NOT NULL DEFAULT '["cross_industry"]'`],
      ['topics', `TEXT NOT NULL DEFAULT '[]'`]
    ],
    updates: [
      ['industries', `TEXT NOT NULL DEFAULT '["cross_industry"]'`],
      ['topics', `TEXT NOT NULL DEFAULT '[]'`],
      ['summary_zh', `TEXT NOT NULL DEFAULT ''`],
      ['status', `TEXT NOT NULL DEFAULT 'published'`]
    ],
    subscribers: [
      ['jurisdiction_plan', `TEXT NOT NULL DEFAULT 'ALL'`],
      ['confirmed_at', 'TEXT'],
      ['bounce_count', 'INTEGER NOT NULL DEFAULT 0']
    ],
    mail_log: [
      ['account_id', 'TEXT'],
      ['gateway_response_json', 'TEXT']
    ]
  };
  for (const [table, columns] of Object.entries(additions)) {
    const existing = new Set(db.prepare(`PRAGMA table_info(${table})`).all().map((column) => column.name));
    for (const [name, definition] of columns) {
      if (!existing.has(name)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`);
    }
  }
  const mailLogSql = String(db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='mail_log'`).get()?.sql || '');
  if (mailLogSql && !mailLogSql.includes(`'confirmation'`)) {
    db.exec('BEGIN');
    try {
      db.exec('ALTER TABLE mail_log RENAME TO mail_log_legacy');
      db.exec(`CREATE TABLE mail_log (
        id TEXT PRIMARY KEY,
        subscriber_id TEXT REFERENCES subscribers(id) ON DELETE SET NULL,
        message_type TEXT NOT NULL CHECK (message_type IN ('daily_briefing', 'update_alert', 'confirmation', 'test')),
        subject TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'failed', 'skipped')),
        provider TEXT NOT NULL DEFAULT 'lawrence_gateway',
        provider_message_id TEXT,
        account_id TEXT,
        gateway_response_json TEXT,
        payload_hash TEXT NOT NULL,
        error_message TEXT,
        attempted_at TEXT NOT NULL,
        delivered_at TEXT,
        created_at TEXT NOT NULL
      )`);
      db.exec(`INSERT INTO mail_log (id, subscriber_id, message_type, subject, status, provider, provider_message_id, account_id, gateway_response_json, payload_hash, error_message, attempted_at, delivered_at, created_at)
        SELECT id, subscriber_id, message_type, subject, status, provider, provider_message_id, account_id, gateway_response_json, payload_hash, error_message, attempted_at, delivered_at, created_at FROM mail_log_legacy`);
      db.exec('DROP TABLE mail_log_legacy');
      db.exec('CREATE INDEX IF NOT EXISTS idx_mail_log_subscriber_date ON mail_log(subscriber_id, attempted_at DESC)');
      db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_mail_log_idempotency ON mail_log(subscriber_id, message_type, payload_hash) WHERE status = 'sent'`);
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }
  // 法域拓展：自动执行 jurisdictions 表驱动的 CHECK 移除迁移（幂等，无旧 CHECK 时跳过）。
  runJurisdictionMigration(db);
}

export function seedDatabase(db) {
  const now = new Date().toISOString();
  db.exec('BEGIN');
  try {
    const runId = `ing_${randomUUID()}`;
    db.prepare(`INSERT INTO ingestion_runs (id, source_name, started_at, status)
      VALUES (?, 'bundled_authoritative_seed', ?, 'running')`).run(runId, now);

    for (const externalId of deprecatedSeedRecords.updateExternalIds) {
      db.prepare('DELETE FROM updates WHERE external_id=?').run(externalId);
    }
    for (const externalId of deprecatedSeedRecords.regulationExternalIds) {
      db.prepare('DELETE FROM regulations WHERE external_id=?').run(externalId);
    }

    const jurisdictionStatement = db.prepare(`INSERT OR IGNORE INTO jurisdictions (code, name_en, name_zh, region, tier, active, source_config) VALUES (?, ?, ?, ?, ?, ?, '{}')`);
    for (const item of jurisdictionRoadmap) {
      jurisdictionStatement.run(item.code, item.nameEn, item.nameZh, item.region, item.tier, item.active ? 1 : 0);
    }

    const regulationStatement = db.prepare(`
      INSERT INTO regulations (
        id, external_id, jurisdiction, title, short_title, instrument_type, industries, topics, issuing_body, status,
        publication_date, effective_date, current_version_date, parent_external_id, summary,
        source_url, source_name, source_checked_at, content_hash, source_payload, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        external_id=excluded.external_id,
        jurisdiction=excluded.jurisdiction, title=excluded.title, short_title=excluded.short_title, instrument_type=excluded.instrument_type,
        industries=excluded.industries, topics=excluded.topics, issuing_body=excluded.issuing_body, status=excluded.status,
        publication_date=excluded.publication_date, effective_date=excluded.effective_date,
        current_version_date=excluded.current_version_date, parent_external_id=excluded.parent_external_id, summary=excluded.summary,
        source_url=excluded.source_url, source_name=excluded.source_name, source_checked_at=excluded.source_checked_at,
        content_hash=excluded.content_hash, source_payload=excluded.source_payload, updated_at=excluded.updated_at
    `);
    for (const item of regulations) {
      regulationStatement.run(
        item.id, item.externalId, item.jurisdiction, item.title, item.shortTitle, item.instrumentType,
        JSON.stringify(item.industries), JSON.stringify(item.topics), item.issuingBody, item.status,
        item.publicationDate ?? null, item.effectiveDate ?? null,
        item.currentVersionDate ?? null, item.parentExternalId ?? null, item.summary, item.sourceUrl,
        item.sourceName, checkedAt, hash(item), JSON.stringify(item), now, now
      );
    }

    const articleStatement = db.prepare(`
      INSERT INTO articles (
        id, external_id, regulation_id, provision_number, heading, text_summary, keywords,
        effective_date, version_label, source_anchor, source_url, content_hash, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        external_id=excluded.external_id,
        regulation_id=excluded.regulation_id, provision_number=excluded.provision_number,
        heading=excluded.heading, text_summary=excluded.text_summary, keywords=excluded.keywords,
        effective_date=excluded.effective_date, version_label=excluded.version_label,
        source_anchor=excluded.source_anchor, source_url=excluded.source_url,
        content_hash=excluded.content_hash, updated_at=excluded.updated_at
    `);
    for (const item of articles) {
      articleStatement.run(
        item.id, item.externalId, item.regulationId, item.provisionNumber, item.heading, item.textSummary,
        JSON.stringify(item.keywords), item.effectiveDate ?? null, item.versionLabel,
        item.sourceAnchor ?? null, item.sourceUrl, hash(item), now, now
      );
    }

    const updateStatement = db.prepare(`
      INSERT INTO updates (
        id, external_id, regulation_id, jurisdiction, event_type, title, summary, event_date,
        importance, industries, topics, summary_zh, source_url, source_name, source_checked_at, content_hash,
        previous_version_external_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        external_id=excluded.external_id,
        regulation_id=excluded.regulation_id, jurisdiction=excluded.jurisdiction, event_type=excluded.event_type,
        title=excluded.title, summary=excluded.summary, event_date=excluded.event_date,
        importance=excluded.importance, industries=excluded.industries, topics=excluded.topics,
        summary_zh=excluded.summary_zh, source_url=excluded.source_url, source_name=excluded.source_name,
        source_checked_at=excluded.source_checked_at, content_hash=excluded.content_hash,
        previous_version_external_id=excluded.previous_version_external_id,
        updated_at=excluded.updated_at
    `);
    for (const item of updates) {
      updateStatement.run(
        item.id, item.externalId, item.regulationId, item.jurisdiction, item.eventType, item.title,
        item.summary, item.eventDate, item.importance, JSON.stringify(item.industries),
        JSON.stringify(item.topics), item.summaryZh, item.sourceUrl, item.sourceName, checkedAt,
        hash(item), item.previousVersionExternalId ?? null, now, now
      );
    }

    db.prepare(`UPDATE ingestion_runs SET completed_at=?, status='succeeded', inserted_count=?, unchanged_count=0
      WHERE id=?`).run(new Date().toISOString(), regulations.length + articles.length + updates.length, runId);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
