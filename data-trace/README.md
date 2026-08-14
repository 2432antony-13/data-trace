# DataTrace

DataTrace is a runnable Hong Kong and Singapore data-compliance intelligence demo for cross-border legal and privacy teams. English is the default UI language, with a persistent Chinese toggle. The same application provides the frontend, HTTP API and SQLite persistence for multidimensional regulation discovery, structured obligations, updates and passwordless email subscriptions.

## Delivery documents

- [DataTrace 后端架构说明](../deliverables/DataTrace-后端架构说明.docx) — complete five-table schema, keys/indexes, configuration, dependencies, every API, the current SQLite implementation, and the Miaoda application-database / CloudBase deployment paths.
- [DataTrace 演示效果说明](../deliverables/DataTrace-演示效果说明.docx) — page-by-page demo guide for Home, Library, Regulation Detail, Timeline and Subscribe, with explicit labels for display-only elements, real seed data, real APIs, persistent backend behavior and current external blockers.

The nine reviewed full-page captures remain in [`../evidence/screenshots/`](../evidence/screenshots/) as the visible HTML frontend fallback. The two DOCX files were opened, converted to PDF and rendered for delivery QA; the machine-readable result is [`../evidence/docx-validation.json`](../evidence/docx-validation.json).

## Run and verify locally

Node.js 22.5 or later is required; there are no third-party runtime dependencies.

```bash
npm start
npm test
npm run check
```

The default URL is `http://localhost:3000`. Runtime data is written to `data/data-trace.sqlite` and is safely migrated when new taxonomy columns are introduced.

The browser smoke test covers the English default, Chinese switch, every major page, multidimensional filtering, record details, create/update/cancel subscription persistence and mobile navigation. In the Lawrence workspace it can be reproduced from the repository root with:

```bash
"${LAWRENCE_PYTHON:-python3}" .agents/skills/webapp-testing/scripts/with_server.py \
  --server "cd data-trace && MANAGE_LINK_SECRET=local-ui-test-secret npm start" --port 3000 \
  -- "${LAWRENCE_PYTHON:-python3}" data-trace/test/ui_test.py
```

It writes the reviewed page captures to `evidence/screenshots/`.

Production configuration:

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port; defaults to `3000` |
| `PUBLIC_BASE_URL` | Public Miaoda URL used in recipient-specific management links |
| `MANAGE_LINK_SECRET` | HMAC secret for email management and unsubscribe links |
| `DISPATCH_API_KEY` | Protects daily/alert message generation |
| `MAIL_LOG_API_KEY` | Protects gateway-result callbacks |

## Product flow

- The home radar reads live database counts and the latest update stream.
- The regulation library filters simultaneously by jurisdiction, industry, topic, instrument type and keyword.
- Regulation details expose provenance, classifications, source-check date, structured obligation units and official source links.
- The timeline supports Hong Kong/Singapore views and shows industry tags and authoritative sources.
- The English-first UI can switch to Chinese without reloading; dynamic event summaries and labels follow the active language.
- Email membership has no account or password. The jurisdiction plan is exactly one of `HK`, `SG` or `ALL` (Hong Kong only / Singapore only / all).
- Subscribers may independently enable the 08:00 Beijing daily briefing and immediate regulation-update alerts, then manage or cancel through the browser or a recipient-specific email link.

## AI-ready schema and seed scope

| Domain | Automation/audit fields |
| --- | --- |
| `regulations` | Stable `external_id`, jurisdiction, JSON industry/topic taxonomies, type, authority, status/version dates, parent relationship, official provenance, content hash and source payload |
| `articles` | Stable provision identifier, regulation relation, obligation summary, keywords, version label, source anchor and content hash |
| `updates` | Stable event identifier, jurisdiction, industry/topic taxonomies, English summary, one-sentence Chinese AI summary, impact, date, prior version and provenance |
| `subscribers` | Email, two delivery modes, fixed jurisdiction plan, derived jurisdiction list, lifecycle, hashed browser token and timestamps |
| `dispatch_runs` | Daily/immediate trigger type, Beijing schedule, update relation, idempotency key and prepared-recipient count |
| `mail_log` | Message type, status derived from the real gateway response, sender account ID, provider message ID, response snapshot, payload hash and delivery/error timestamps |
| `ingestion_runs` | Source, status, inserted/updated/unchanged counts and errors |

The idempotent bundled import now contains **22 authoritative instruments/guides, 26 structured obligation units and 16 update events**. It covers the core lifecycle under Hong Kong PDPO and Singapore PDPA plus cross-border transfer, breach notification, direct/electronic marketing and identity data.

Sector coverage is explicit rather than inferred:

- Hong Kong finance: Banking Ordinance (Cap. 155) and HKMA SPM TM-G-1.
- Hong Kong telecommunications/electronic communications: Telecommunications Ordinance (Cap. 106) and Unsolicited Electronic Messages Ordinance (Cap. 593).
- Singapore finance: Banking Act 1970, MAS Technology Risk Management Guidelines and MAS Notice 644.
- Singapore telecommunications/electronic communications: Telecommunications Act 1999, Spam Control Act 2007 and IMDA Telecommunication Cybersecurity Code of Practice.

All records retain direct links to Hong Kong e-Legislation, PCPD, HKMA, Singapore Statutes Online, PDPC, MAS or IMDA. Summaries are concise obligation-oriented descriptions, not quotations or substitutes for the official text. The dataset is broad demo coverage at provision-level granularity; it does not claim that a finite seed snapshot is an exhaustive legal inventory.

The legal seed was re-checked record by record against those official links on 2026-08-09. The regression suite now requires all 22 instruments to have a review locator, all 26 obligation units to resolve to a live parent and provision anchor, and all 16 timeline events to carry an explicit official event source and evidence locator. In particular:

- HKMA BRDR records TM-G-1 as issued on 24 June 2003. There is no 5 November 2024 TM-G-1 revision in the seed or timeline.
- The April 2016 revision of the HKID Code of Practice and the separate Compliance Guide issued on 22 August 2024 are distinct records.
- Singapore Statutes Online records the current PDPR 2021 version as 2 March 2026 (S 86/2026), which is also the newest timeline event.
- IMDA's current codes page does not state a 31 October 2022 revision date for the Telecommunication Cybersecurity Code, so no such date or event is asserted.
- Dates that the official source does not expose are left blank instead of being inferred from a page timestamp. Seed migration removes the superseded conflated or disproved records from an existing database before re-importing the reviewed snapshot.

## Briefing and alert execution contract

`GET /api/briefings/preview` shows the current briefing shape: an update list, a one-sentence Chinese AI summary for each update, official source links and a bilingual disclaimer.

Actual message preparation is authenticated:

```text
POST /api/dispatch/messages
x-dispatch-key: <DISPATCH_API_KEY>

daily: {"messageType":"daily_briefing","scheduledAt":"<08:00 Asia/Shanghai>"}
alert: {"messageType":"update_alert","updateId":"<new update id>"}
```

The daily endpoint rejects any scheduled time outside hour `08` in `Asia/Shanghai`; its schedule contract is `0 8 * * *` with timezone `Asia/Shanghai`. An alert is keyed directly to an update and is available immediately after that update is inserted. Both paths use idempotency keys in `dispatch_runs` and filter recipients by the fixed plan.

Every prepared recipient has one gateway-ready payload and two HMAC links:

- `/#subscribe?subscriber=...&token=...` loads subscription management.
- `/#subscribe?subscriber=...&token=...&action=unsubscribe` loads the same private record and asks the recipient to confirm cancellation; a GET never silently unsubscribes.

Outbound delivery remains exclusively in the Lawrence `email` gateway, as required—there is no SMTP client or local sender script. After the gateway call, its unmodified result is posted to `/api/mail-log`; the server derives `sent` only from `gatewayResult.success === true`, derives `failed` from `false`, and otherwise records `skipped`. Tests deliberately record `skipped` and assert that no fabricated `sent` record exists.

## External delivery status (verified 2026-08-09 12:55 +08:00)

The source is ready for the Miaoda full-stack flow, but no public URL can truthfully be supplied from this run:

- The dedicated user profile resolves to the pre-authorized user 杨凌西 and its token verifies as valid.
- `lark-cli apps +list --keyword "DataTrace" --as user` is rejected with `missing_scope: spark:app:read`. Creating, initializing and publishing the full-stack asset additionally requires the Apps write permission, so no Miaoda asset or release was fabricated.
- The Lawrence email account query returns an empty list, so neither ByteStore nor Wiselaw has an `accountId` available.
- The issue still contains no user-selected test recipient.

Consequently no Miaoda asset, public/login-free URL, mainland-China reachability result or real test email is claimed. The user must grant the dedicated profile the Lark Apps domain (at minimum `spark:app:read` and `spark:app:write`). Once those external prerequisites exist, the remaining verification is: create or locate the full-stack Miaoda app, initialize its repository, adapt this implementation to the generated runtime scaffold, push `sprint/default`, publish a release, confirm `release-get` returns `finished`, set access scope to `public` with `require_login=false`, verify the returned `online_url`, set `PUBLIC_BASE_URL`, schedule the daily dispatch at 08:00 Asia/Shanghai, and send one generated test briefing through the configured ByteStore/Wiselaw `accountId` to the user-selected recipient. The exact gateway response must then be written to `mail_log`.

Machine-readable proof of the deployment attempt and the local fallback verification is committed at `evidence/deployment-status.json`; full-page captures of the four product views, the detail drawer and mobile navigation are in `evidence/screenshots/`.
