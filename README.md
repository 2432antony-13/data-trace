<p><img src="docs/assets/tony.gif" width="112" height="112" alt="Tony 24 · DataTrace"></p>

**简体中文** · [繁體中文](docs/i18n/README.zh-TW.md) · [English](docs/i18n/README.en.md)

# DataTrace

**让每一次法规变化，都能追溯到来源。**

面向跨境产品与隐私团队的香港、新加坡法规追踪工具。通过法规库、变更时间线和来源状态，把信号连接到官方原文。

[在线入口](https://2432antony-13.github.io/data-trace/) · [任务](https://github.com/2432antony-13/data-trace/issues) · [文档](docs/README.md)

## 当前状态

公开静态演示可用。每日采集与部署已接通；来源失败和空结果分别展示。邮件订阅与简报尚未启用。

## 快速开始

Node.js 22.5+；无需安装运行依赖。

```bash
cd data-trace
npm start
# http://localhost:3000
npm run check
npm test
npm run build:demo
```

## 能力与范围

法规筛选与检索；版本和来源链接；按法域追踪变更；来源采集状态。

界面翻译不改变官方原文。2026-08-09 是种子内容核验基线，不代表今日全部法规已复核。

[源码](data-trace/) · [文档](docs/README.md)

仓库首页与产品界面提供 **简体中文 / 繁體中文 / English**。采用 Q 版 **Tony 24** 标识，GitHub 显示 GIF，产品使用 SVG/CSS 动画。

[语言覆盖与原文边界](docs/LOCALIZATION.md)
