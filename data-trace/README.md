# DataTrace · 全栈实现

零第三方运行时依赖（Node.js 22.5+，内置 node:sqlite 与 fetch）的香港 + 新加坡数据合规情报站。
前端、HTTP API 与 SQLite 持久化在同一应用中；法域、订阅、派发与抓取全部为数据库驱动。

## 运行

```bash
npm start            # http://localhost:3000（PORT 可覆盖）
npm test             # node:test 自动化测试（11 项）
npm run check        # 语法检查
npm run ingest       # 法规更新管道（官方源抓取，pending_review 入库）
npm run review       # 审校 CLI：list / approve <id> / reject <id> / edit <id> ...
npm run migrate:jurisdictions   # 手动执行法域迁移（通常启动时自动完成）
```

## 架构

```
public/ (SPA, History 路由, 双语, 5 分钟轮询)
   │ fetch
src/server.mjs  ── API / 静态服务 / 限流 / 安全头 / 双重确认 / 派发准备
   │                └─ src/mail/{sender,dispatch-worker,scheduler}.mjs
src/db.mjs      ── openDatabase → schema.sql → 列迁移 → 法域自动迁移 → 幂等种子
src/ingest/     ── pipeline + sources/{hk,sg} + summarize(可选 LLM) + review CLI
```

### 数据表（10 张）

| 表 | 用途 |
| --- | --- |
| regulations / articles / updates | 法规、结构化义务、更新事件（updates.status：pending_review → published / retracted） |
| jurisdictions | 法域注册表（code/名称/region/tier/active），订阅与筛选的单一事实来源 |
| subscribers | 邮箱订阅：双重确认（confirmed_at）、法域多选（jurisdictions JSON）、退订与 bounce 计数 |
| dispatch_runs / dispatch_messages | 每日/即时派发的幂等批次与逐封消息队列（queued→sent/failed/skipped + attempts 重试） |
| mail_log | 网关回执审计（status 只由真实网关结果推导，不伪造 sent） |
| ingestion_runs | 每个官方源的抓取审计（succeeded/failed + 插入/未变计数） |

### API（要点）

- `GET /api/health` · `GET /api/taxonomy` · `GET /api/jurisdictions`
- `GET /api/regulations`（jurisdiction/industry/topic/type/q）· `GET /api/regulations/:id`
- `GET /api/updates`（仅 published）· `GET /api/briefings/preview`
- `POST /api/subscribers`（双重确认；jurisdictions 数组多选，兼容 jurisdictionPlan 三档）
- `GET /api/subscribers/:id/confirm?token=…`（确认页，HTML）· `GET/PATCH/DELETE /api/subscribers/:id`
- `POST /api/dispatch/messages`（x-dispatch-key；daily 仅接受北京时间 08:00；alert 按 updateId）
- `GET /api/dispatch/runs/:runId/messages` · `POST /api/mail-log`（x-mail-log-key，网关回执）

## 环境变量（.env.example）

| 变量 | 用途 |
| --- | --- |
| PORT / PUBLIC_BASE_URL / MANAGE_LINK_SECRET | 端口 / 公开地址（管理链接域名）/ HMAC 密钥 |
| DISPATCH_API_KEY / MAIL_LOG_API_KEY | 派发与回执接口鉴权 |
| MAIL_API_URL / MAIL_API_KEY / MAIL_FROM / MAIL_FROM_NAME | 发信网关（Resend/Postmark 风格，可适配 SES/阿里云 DirectMail） |
| CONFIRMATION_DRY_RUN | =1 时订阅接口直接返回确认链接（本地/测试） |
| MAX_SEND_ATTEMPTS / TRUST_PROXY | 发送重试次数 / 是否信任 x-forwarded-for |
| SUMMARIZE_API_URL / SUMMARIZE_API_KEY | 可选 LLM 摘要端点 |
| DATABASE_PATH | SQLite 文件路径（默认 data/data-trace.sqlite） |

## 行为契约

- 每日简报：`0 8 * * *` Asia/Shanghai；幂等键 `daily:<北京日期>:08:Asia/Shanghai`。
- 只有 `confirmed_at IS NOT NULL` 的订阅者接收邮件；退订不删除记录（active=0）。
- 每封邮件含收件人专属管理链接与退订链接；发信器自动附加 List-Unsubscribe 头。
- 所有 API 响应带安全头（CSP/nosniff/X-Frame-Options）；POST /api/subscribers 每 IP 每 10 分钟限 3 次。
- 种子数据逐条对照官方源核验于 2026-08-09；演示范围，不构成法律意见。
