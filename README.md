# DataTrace · 数据合规雷达

DataTrace —— 香港 + 新加坡全球数据合规追踪网站（面向出海企业法务 / 数据合规律师）。
法规库可核验、更新线可追溯、邮件订阅带双重确认，法域架构为 jurisdictions 表驱动，可平滑扩展至澳门、中国大陆、东盟等法域。

代码仓库：https://github.com/2432antony-13/data-trace

## 目录结构

```
Data Trace/
├── data-trace/                 # 完整全栈项目（核心，Node 22+，零第三方运行时依赖）
│   ├── public/                 # 前端（index.html / app.js / styles.css，History 路由 SPA）
│   ├── src/
│   │   ├── server.mjs          # HTTP API + 静态服务 + 限流 + 安全头 + 双重确认
│   │   ├── db.mjs              # SQLite 打开/迁移/种子（含法域自动迁移）
│   │   ├── schema.sql          # 七张业务表 + 三张审计表
│   │   ├── seed-data.mjs       # 22 条法规 / 26 条义务 / 16 条更新事件（官方源核验）
│   │   ├── ingest/             # 法规实时更新管道（HK/SG 官方源抓取 → 审校 CLI）
│   │   ├── mail/               # 零依赖 HTTP 发信器 + 发送队列 worker + 北京 08:00 调度器
│   │   └── migrations/         # 法域重构迁移（jurisdictions 表驱动，自动执行）
│   ├── test/                   # node:test 自动化测试（11 项全绿）+ Playwright UI 冒烟
│   ├── deploy/                 # Dockerfile / Caddy / systemd / 备份 / 每日调度脚本
│   ├── Dockerfile · docker-compose.yml · Caddyfile
│   └── .env.example            # 环境变量样例（含发信与限流配置）
├── .github/workflows/          # CI（check+test）与每日 08:00 简报调度
├── data-trace-static/          # 静态展示版（数据内联，无后端）
├── DataTrace-演示版.html        # 单文件离线演示版
├── 文档/ · 验收截图/            # 交付文档与页面截图
└── README.md
```

## 本地运行（全栈版）

要求 Node.js 22.5+（内置 node:sqlite），无需 npm install。

```bash
cd data-trace
npm start            # http://localhost:3000
npm test             # 自动化测试（node:test）
npm run check        # 语法检查
```

## 功能清单

- **首页法规雷达**：实时数据库计数 + 前端每 5 分钟自动轮询最新更新流
- **法规库**：法域 / 行业 / 主题 / 文书类型多维筛选 + 关键词搜索 + 详情抽屉（History 路由深链 /regulations/:id，可刷新直开、可分享）
- **更新线**：16 条更新事件、AI 中文摘要、官方来源链接、影响程度标签；数据库支持 pending_review 审校态
- **中英双语**（默认英文）、离线横幅与各区块错误重试、focus trap 等无障碍支持
- **邮件订阅**：邮箱即会员、**双重确认（double opt-in）**、法域多选（jurisdictions 数组）、管理/退订专属 HMAC 链接、List-Unsubscribe 头、IP 限流
- **每日简报**（北京时间 08:00）与法规更新 alert：消息持久化入 dispatch_messages、发送队列带重试退避、幂等键防重复发送

## 法规实时更新管道

```bash
npm run ingest                       # 抓取 HK/SG 官方源 → pending_review 入库（幂等）
npm run review list|approve|reject   # 人工审校（发布前必经）
```

- 香港源：PCPD 新闻稿、律政司开放数据（data.gov.hk CKAN API）
- 新加坡源：PDPC / MAS / IMDA（部分站点有 WAF，需无头浏览器或官方 API，详见 src/ingest/README.md）
- 可选 LLM 摘要（SUMMARIZE_API_URL / SUMMARIZE_API_KEY），未配置时优雅降级
- 只有 status='published' 的更新会进入 API 与邮件简报

## 部署

- 海外/无需备案：`cd data-trace && docker compose up -d`（Caddy 自动 HTTPS）
- 国内：systemd + Caddy + 已备案域名，详见 data-trace/deploy/README.md
- 每日 08:00 简报双保险：服务器 crontab 调 deploy/daily-dispatch.sh；GitHub Actions 定时任务（.github/workflows/daily-dispatch.yml，UTC 00:00）
- 上线前必须配置发件邮箱：MAIL_API_URL / MAIL_API_KEY / MAIL_FROM（支持 Resend/Postmark 风格网关，可适配 SES/阿里云 DirectMail），并先走 CONFIRMATION_DRY_RUN=1 联调

## 法域路线图

jurisdictions 表驱动（已种入 18 个法域，HK/SG 激活）：
澳门、中国大陆（Tier 1）→ 泰国/印尼/马来西亚/越南/菲律宾（Tier 2）→ 日本/韩国（Tier 3）→ 印度/澳新/英国/欧盟/美国/加拿大（Tier 4-5）。
新法域上线 = 激活 jurisdictions 行 + 接入官方源 + 种子法规 + 双语摘要审校，无需改表结构。

## 测试与质量

- node:test 11 项全绿：种子事实核验、订阅全流程（双重确认/法域多选/限流）、幂等种子、法域自动迁移（旧库/新库两条路径）、ingest 管线
- CI：.github/workflows/ci.yml（push/PR 自动 check + test）
