# DataTrace

**Trace every regulatory shift to its source.**

DataTrace is an open-source regulatory intelligence platform for cross-border privacy and compliance teams. Launched with Hong Kong and Singapore, architected to expand to any jurisdiction — every record carries its authority, official link, version date and content fingerprint.

**English · [简体中文](./README.zh-CN.md)**

---

## Live demo

**https://2432antony-13.github.io/data-trace/**

Browse the regulation library, timeline and bilingual UI with real seed data (22 instruments, 26 structured obligations, 16 update events). Subscriptions and email delivery require a full-stack deployment.

## Highlights

- **Regulatory radar** — live database counts + latest signals, auto-refreshing
- **Regulation library** — multi-dimensional filters (jurisdiction · industry · topic · instrument type) + keyword search
- **Change timeline** — amendments, commencements and guidance events with AI-generated Chinese summaries and official source links
- **Source-verifiable** — every record keeps authority, primary link, version date and content hash (seed re-checked against official sources on 2026-08-09)
- **Email subscriptions** — double opt-in, jurisdiction multi-select, daily briefing (08:00 Beijing time) and instant alerts, private HMAC manage/unsubscribe links
- **Live ingestion pipeline** — polls official sources (PCPD, HK Department of Justice open data, PDPC, MAS, IMDA), dedupes by content hash, holds new events in *pending review* for human approval
- **Bilingual** — English default, one-click 简体中文

## Tech stack

Node.js 22+ (built-in `node:sqlite` + `fetch`) · **zero runtime dependencies** · vanilla JS SPA · SQLite (WAL) · Docker / Caddy / systemd assets included · 11 automated tests

## Quick start

```bash
cd data-trace
npm start          # http://localhost:3000 — no npm install needed
npm test           # automated tests
```

## Deploy

- **Docker Compose + Caddy** (auto HTTPS) — see [data-trace/deploy/README.md](data-trace/deploy/README.md)
- Daily 08:00 briefing: server crontab or GitHub Actions (`.github/workflows/daily-dispatch.yml`)
- Email: any Resend/Postmark-style gateway (`MAIL_API_URL` / `MAIL_API_KEY` / `MAIL_FROM`), adaptable to SES or Alibaba Cloud DirectMail

## Jurisdiction roadmap

Table-driven jurisdictions (18 pre-registered): **Hong Kong · Singapore live** → Macau, Mainland China next → ASEAN, Japan/Korea, EU/US on the roadmap. Adding a jurisdiction requires no schema change.

## Repository layout

| Path | What |
| --- | --- |
| `data-trace/` | Full-stack app: SPA frontend, HTTP API, SQLite, mail dispatch, ingest pipeline |
| `data-trace/scripts/build-static-demo.mjs` | Generates the `site/` static demo (GitHub Pages) |
| `.github/workflows/` | CI, daily dispatch, Pages deployment |
| `文档/` | Delivery documents (简体中文) |

## Disclaimer

Tracking information only — not legal advice. Verify the official source before relying on it.

## License

[MIT](./LICENSE)
