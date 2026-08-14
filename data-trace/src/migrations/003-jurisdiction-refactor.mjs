// 003-jurisdiction-refactor.mjs
// 法域拓展重构（数据层迁移）：把 regulations / updates / subscribers 从硬编码的
// CHECK (jurisdiction IN ('HK','SG')) 与 CHECK (jurisdiction_plan IN ('HK','SG','ALL'))
// 解放为 jurisdictions 表驱动，为后续多法域（MO/CN/TH/…）上线铺路。
//
// 迁移策略：SQLite 标准重建表流程 —— 先关外键，逐表 RENAME -> 新建同名无 CHECK 表 ->
// 显式列名回灌数据 -> DROP 旧表 -> 重建索引 -> foreign_key_check 校验 -> 提交。
// 整个过程包裹在事务中，保证原子性。
//
// 关键实现细节（务必保留）：
// 本项目内置 SQLite 3.53.3 中，默认 PRAGMA legacy_alter_table=OFF 时，即便
// foreign_keys=OFF，ALTER TABLE ... RENAME 仍会改写其它表里指向被重命名表的
// 外键引用（例如 articles.regulation_id 会被改写成 REFERENCES "regulations_old"）。
// 一旦随后 DROP 旧表，这些引用就会悬空。因此迁移必须额外开启
// PRAGMA legacy_alter_table=ON，让 RENAME 不改写任何子表引用；这样重建同名新表后，
// articles / updates / mail_log / dispatch_messages 等表的外键引用自然恢复指向新表。

import { pathToFileURL } from 'node:url';
import { openDatabase } from '../db.mjs';

// 三张表各自需要移除的旧 CHECK 子句；也用于幂等检测。
const LEGACY_CHECKS = {
  regulations: "CHECK (jurisdiction IN ('HK', 'SG'))",
  updates: "CHECK (jurisdiction IN ('HK', 'SG'))",
  subscribers: "CHECK (jurisdiction_plan IN ('HK', 'SG', 'ALL'))"
};

// 三张表重建后的新 DDL（与 schema.sql 完全一致，仅删除对应的 CHECK）。
// updates 保留 status 列及其 CHECK；subscribers 保留 jurisdictions JSON 列。
const NEW_DDL = {
  regulations: `CREATE TABLE regulations (
  id TEXT PRIMARY KEY,
  external_id TEXT NOT NULL UNIQUE,
  jurisdiction TEXT NOT NULL,
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
)`,
  updates: `CREATE TABLE updates (
  id TEXT PRIMARY KEY,
  external_id TEXT NOT NULL UNIQUE,
  regulation_id TEXT REFERENCES regulations(id) ON DELETE SET NULL,
  jurisdiction TEXT NOT NULL,
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
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('pending_review', 'published', 'retracted')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`,
  subscribers: `CREATE TABLE subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  daily_briefing INTEGER NOT NULL DEFAULT 0 CHECK (daily_briefing IN (0, 1)),
  update_alert INTEGER NOT NULL DEFAULT 0 CHECK (update_alert IN (0, 1)),
  jurisdiction_plan TEXT NOT NULL DEFAULT 'ALL',
  jurisdictions TEXT NOT NULL DEFAULT '["HK","SG"]',
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  manage_token_hash TEXT NOT NULL,
  consented_at TEXT NOT NULL,
  confirmed_at TEXT,
  unsubscribed_at TEXT,
  bounce_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`
};

// 每张表回灌数据时显式列出的列名（与新旧表顺序无关，显式列出确保安全）。
const COLUMNS = {
  regulations: [
    'id', 'external_id', 'jurisdiction', 'title', 'short_title', 'instrument_type',
    'industries', 'topics', 'issuing_body', 'status', 'publication_date', 'effective_date',
    'current_version_date', 'parent_external_id', 'summary', 'source_url', 'source_name',
    'source_checked_at', 'content_hash', 'source_payload', 'created_at', 'updated_at'
  ],
  updates: [
    'id', 'external_id', 'regulation_id', 'jurisdiction', 'event_type', 'title', 'summary',
    'event_date', 'importance', 'industries', 'topics', 'summary_zh', 'source_url',
    'source_name', 'source_checked_at', 'content_hash', 'previous_version_external_id',
    'status', 'created_at', 'updated_at'
  ],
  subscribers: [
    'id', 'email', 'daily_briefing', 'update_alert', 'jurisdiction_plan', 'jurisdictions',
    'active', 'manage_token_hash', 'consented_at', 'confirmed_at', 'unsubscribed_at',
    'bounce_count', 'created_at', 'updated_at'
  ]
};

// 需要重建的原有索引（定义与 schema.sql 完全一致）。
const INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_regulations_jurisdiction_status ON regulations(jurisdiction, status)',
  'CREATE INDEX IF NOT EXISTS idx_regulations_parent ON regulations(parent_external_id)',
  'CREATE INDEX IF NOT EXISTS idx_regulations_type ON regulations(instrument_type)',
  'CREATE INDEX IF NOT EXISTS idx_updates_date_jurisdiction ON updates(event_date DESC, jurisdiction)',
  'CREATE INDEX IF NOT EXISTS idx_subscribers_delivery ON subscribers(active, daily_briefing, update_alert)'
];

function tableDdl(db, name) {
  const row = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`).get(name);
  return row ? String(row.sql) : '';
}

// 三张表是否仍含有旧 CHECK：只要任意一张仍含旧 CHECK 即需要迁移。
function hasLegacyChecks(db) {
  return Object.entries(LEGACY_CHECKS).some(([name, check]) => tableDdl(db, name).includes(check));
}

function rebuildTable(db, name) {
  const oldName = `${name}_old`;
  const columns = COLUMNS[name].join(', ');
  db.exec(`ALTER TABLE ${name} RENAME TO ${oldName}`);
  db.exec(NEW_DDL[name]);
  db.exec(`INSERT INTO ${name} (${columns}) SELECT ${columns} FROM ${oldName}`);
  db.exec(`DROP TABLE ${oldName}`);
}

/**
 * 执行法域重构迁移。
 * @param {import('node:sqlite').DatabaseSync} db 已打开的数据库连接。
 * @returns {{ changed: boolean }} changed 表示本次是否实际执行了迁移。
 */
export function runJurisdictionMigration(db) {
  // 幂等：三张表 DDL 都不再包含旧 CHECK 时，说明已经迁移过，直接返回。
  if (!hasLegacyChecks(db)) return { changed: false };

  // 外键开关与 legacy_alter_table 必须在事务之外设置。
  db.exec('PRAGMA foreign_keys = OFF');
  db.exec('PRAGMA legacy_alter_table = ON');
  try {
    db.exec('BEGIN');
    try {
      // 顺序：regulations -> updates -> subscribers。
      // 先重建 regulations：articles/updates 对它的外键引用在 RENAME 期间保持不变，
      // 同名新表创建后引用自然恢复。
      rebuildTable(db, 'regulations');
      rebuildTable(db, 'updates');
      rebuildTable(db, 'subscribers');

      for (const indexSql of INDEXES) db.exec(indexSql);

      // 外键完整性校验：必须为空，否则回滚。
      const violations = db.prepare('PRAGMA foreign_key_check').all();
      if (violations.length > 0) {
        throw new Error(`法域重构迁移后外键校验失败：${JSON.stringify(violations)}`);
      }
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  } finally {
    // 无论成败都恢复 pragma 默认值，避免影响后续数据库操作。
    db.exec('PRAGMA legacy_alter_table = OFF');
    db.exec('PRAGMA foreign_keys = ON');
  }
  return { changed: true };
}

// 直接执行本文件时（node src/migrations/003-jurisdiction-refactor.mjs），
// 对 process.env.DATABASE_PATH 或默认库执行迁移并打印中文结果。
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const db = openDatabase(process.env.DATABASE_PATH || undefined);
  try {
    const result = runJurisdictionMigration(db);
    if (result.changed) {
      console.log('法域重构迁移完成：已移除 regulations / updates 的 jurisdiction CHECK 与 subscribers 的 jurisdiction_plan CHECK。');
    } else {
      console.log('法域重构迁移无需执行：三张表已为无 CHECK 的表驱动结构（幂等跳过）。');
    }
  } finally {
    db.close();
  }
}
