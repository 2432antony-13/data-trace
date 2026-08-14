# DataTrace · 数据合规雷达

**让每一次规则变化，留下轨迹。**

DataTrace 是面向跨境隐私与合规团队的开源法规情报平台。首发香港 + 新加坡，架构上支持扩展到任意法域——每条记录都保留发布机关、官方原文链接、版本日期与内容指纹。

**[English](./README.md) · 简体中文**

---

## 在线演示

**https://2432antony-13.github.io/data-trace/**

静态演示版内置真实种子数据（22 部法规、26 条结构化义务、16 条更新事件），可浏览法规库、更新线与中英双语界面。演示站**每日自动更新**——GitHub Actions 定时抓取官方源、发布新事件并重新部署（北京时间每天 10:00）。订阅与邮件触达需部署全栈版。

## 核心能力

- **法规雷达** — 实时数据库计数 + 最新监管信号，自动刷新
- **法规库** — 法域 · 行业 · 主题 · 文书类型多维筛选 + 关键词搜索
- **更新线** — 修订 / 生效 / 指引发布事件，AI 中文一句话摘要 + 官方来源链接
- **来源可核验** — 每条记录保留权威出处、原文链接、版本日与内容指纹（种子数据 2026-08-09 逐条对照官方源核验）
- **邮件订阅** — 双重确认、法域多选、每日简报（北京时间 08:00）与即时告警、专属管理/退订链接
- **实时更新管道** — 抓取官方源（PCPD、香港律政司开放数据、PDPC、MAS、IMDA），按内容哈希去重，新事件先进入「待审校」由人工确认后发布
- **中英双语** — 默认英文，一键切换简体中文

## 技术栈

Node.js 22+（内置 `node:sqlite` 与 `fetch`）· **零第三方运行时依赖** · 原生 JS 单页应用 · SQLite（WAL）· 附带 Docker / Caddy / systemd 部署资产 · 11 项自动化测试

## 快速开始

```bash
cd data-trace
npm start          # http://localhost:3000（无需 npm install）
npm test           # 自动化测试
```

## 部署

- **Docker Compose + Caddy**（自动 HTTPS）——详见 [data-trace/deploy/README.md](data-trace/deploy/README.md)
- 每日 08:00 简报：服务器 crontab 或 GitHub Actions（`.github/workflows/daily-dispatch.yml`）
- 发信：任意 Resend/Postmark 风格网关（`MAIL_API_URL` / `MAIL_API_KEY` / `MAIL_FROM`），可适配 AWS SES 或阿里云邮件推送

## 法域路线图

法域由数据表驱动（已预置 18 个法域）：**香港 · 新加坡已上线** → 澳门、中国大陆 → 东盟、日韩、欧美。新增法域无需改表结构。

## 仓库结构

| 路径 | 说明 |
| --- | --- |
| `data-trace/` | 全栈应用：SPA 前端、HTTP API、SQLite、邮件派发、更新管道 |
| `data-trace/scripts/build-static-demo.mjs` | 生成 `site/` 静态演示站（GitHub Pages） |
| `.github/workflows/` | CI、每日派发、Pages 部署 |
| `文档/` | 交付文档 |

## 免责声明

本站内容仅用于法规追踪，不构成法律意见；使用前请核对官方原文。

## 许可证

[MIT](./LICENSE)
