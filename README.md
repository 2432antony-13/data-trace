# DataTrace · 项目交付目录

DataTrace —— 香港 + 新加坡全球数据合规追踪网站（出海企业法务 / 数据合规律师）。

## 目录结构

```
Data Trace/
├── data-trace/                 # 完整全栈项目（核心）
│   ├── public/                 # 前端页面（index.html / app.js / styles.css）
│   ├── src/                    # 后端（server.mjs 服务 / db.mjs 数据库 / schema.sql / seed-data.mjs 法规数据）
│   ├── test/                   # 自动化测试（app.test.mjs / ui_test.py）
│   ├── data/                   # SQLite 数据库文件（运行时生成，含订阅数据）
│   ├── package.json            # npm start / test / check
│   ├── .env.example            # 环境变量样例
│   └── README.md               # 详细项目文档
├── data-trace-static/          # 静态展示版（已发布到妙搭的版本：数据内联，无需后端）
├── DataTrace-演示版.html       # 单文件离线演示版（手机/浏览器直接打开）
├── 文档/
│   ├── DataTrace-后端架构说明.docx
│   ├── DataTrace-演示效果说明.docx
│   └── DataTrace-妙搭全栈部署诊断与替代方案测试报告.docx
└── 验收截图/                   # 各页面验收截图
```

## 本地运行（全栈版）

环境要求：Node.js 22.5+

```bash
cd data-trace
npm start        # 启动，默认 http://localhost:3000
npm test         # 自动化测试
npm run check    # 语法检查
```

打开浏览器访问 http://localhost:3000

## 功能清单

- 首页法规雷达：实时读取数据库（22 条法规 / 26 条义务 / 16 条更新事件）
- 法规库：法域 / 行业 / 主题 / 文书类型多维筛选 + 关键词搜索 + 法规详情（结构化义务、官方来源链接）
- 更新线 Timeline：16 条更新事件、AI 中文摘要、官方来源链接、影响程度标签
- 中英文切换（默认英文）
- 邮件订阅：邮箱即会员，三档方案（仅香港 / 仅新加坡 / 全部），订阅真实写入 SQLite，含管理/退订链接
- 每日简报（北京时间 08:00）与法规更新 alert 的消息生成机制（真实发信需配置发件邮箱）

## 当前状态说明

- 全栈版：本地完整可运行，订阅真实入库
- 静态版：已发布公开免登录链接（数据内联，无后端）
- 真实邮件发送：机制就绪，待配置发件邮箱账号 + 测试收件邮箱后实测
- 线上全栈部署：妙搭全栈发布受平台限制（job is failed），替代方案详见文档/报告
