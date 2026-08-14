PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS regulations (
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
);

CREATE INDEX IF NOT EXISTS idx_regulations_jurisdiction_status
  ON regulations(jurisdiction, status);
CREATE INDEX IF NOT EXISTS idx_regulations_parent
  ON regulations(parent_external_id);
CREATE INDEX IF NOT EXISTS idx_regulations_type
  ON regulations(instrument_type);

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  external_id TEXT NOT NULL UNIQUE,
  regulation_id TEXT NOT NULL REFERENCES regulations(id) ON DELETE CASCADE,
  provision_number TEXT NOT NULL,
  heading TEXT NOT NULL,
  text_summary TEXT NOT NULL,
  keywords TEXT NOT NULL DEFAULT '[]',
  effective_date TEXT,
  version_label TEXT NOT NULL,
  source_anchor TEXT,
  source_url TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_articles_regulation
  ON articles(regulation_id, provision_number);

CREATE TABLE IF NOT EXISTS updates (
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
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('pending_review', 'published', 'retracted')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_updates_date_jurisdiction
  ON updates(event_date DESC, jurisdiction);

CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  daily_briefing INTEGER NOT NULL DEFAULT 0 CHECK (daily_briefing IN (0, 1)),
  update_alert INTEGER NOT NULL DEFAULT 0 CHECK (update_alert IN (0, 1)),
  jurisdiction_plan TEXT NOT NULL DEFAULT 'ALL' CHECK (jurisdiction_plan IN ('HK', 'SG', 'ALL')),
  jurisdictions TEXT NOT NULL DEFAULT '["HK","SG"]',
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  manage_token_hash TEXT NOT NULL,
  consented_at TEXT NOT NULL,
  confirmed_at TEXT,
  unsubscribed_at TEXT,
  bounce_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscribers_delivery
  ON subscribers(active, daily_briefing, update_alert);

CREATE TABLE IF NOT EXISTS mail_log (
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
);

CREATE INDEX IF NOT EXISTS idx_mail_log_subscriber_date
  ON mail_log(subscriber_id, attempted_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_mail_log_idempotency
  ON mail_log(subscriber_id, message_type, payload_hash)
  WHERE status = 'sent';

CREATE TABLE IF NOT EXISTS dispatch_runs (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  message_type TEXT NOT NULL CHECK (message_type IN ('daily_briefing', 'update_alert')),
  scheduled_for TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Shanghai',
  trigger_kind TEXT NOT NULL CHECK (trigger_kind IN ('schedule', 'update_event')),
  update_id TEXT REFERENCES updates(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('prepared', 'completed', 'failed')),
  recipient_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS ingestion_runs (
  id TEXT PRIMARY KEY,
  source_name TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL CHECK (status IN ('running', 'succeeded', 'failed')),
  inserted_count INTEGER NOT NULL DEFAULT 0,
  updated_count INTEGER NOT NULL DEFAULT 0,
  unchanged_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS jurisdictions (
  code TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'apac',
  tier INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  source_config TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS dispatch_messages (
  id TEXT PRIMARY KEY,
  dispatch_run_id TEXT NOT NULL REFERENCES dispatch_runs(id) ON DELETE CASCADE,
  subscriber_id TEXT NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('daily_briefing', 'update_alert')),
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  manage_url TEXT NOT NULL,
  unsubscribe_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed', 'skipped')),
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  sent_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dispatch_messages_run
  ON dispatch_messages(dispatch_run_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_messages_status
  ON dispatch_messages(status, attempts);
