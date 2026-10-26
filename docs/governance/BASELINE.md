# data-trace 治理基线

观察日期：2026-10-27。基线：`943501e38d3cb33bb8ad54199a05d5a36bc7b3aa`；默认分支 `main`；仓库公开。这是冻结事实，不替代当前 PR 的检查。

2026-10-26 静态试点已部署，七个文件与 943501e38d3cb33bb8ad54199a05d5a36bc7b3aa 一致。自动化增强仅在本地 governance/datatrace-automation 分支；来源观测为一可用、一无匹配、三失败。

## 检查入口与历史证据

在 `data-trace/` 使用 Node 22：`npm run check`、`npm test`、`npm run build:demo`。构建写入 `site/`，回归测试使用临时数据库和模拟服务。

- [CI / 40315581959](https://github.com/2432antony-13/data-trace/actions/runs/40315581959)：success，来源 `943501e38d3cb33bb8ad54199a05d5a36bc7b3aa`。
- [Deploy static demo to Pages / 40315581869](https://github.com/2432antony-13/data-trace/actions/runs/40315581869)：success，来源 `943501e38d3cb33bb8ad54199a05d5a36bc7b3aa`。
- [CI / 40315272791](https://github.com/2432antony-13/data-trace/actions/runs/40315272791)：success，来源 `e3ea7567b5497561db586760f84c2e1e05da4bb3`。

## 平台差异

公开仓库尚无 rulesets；待实际 PR 检查通过后配置并回读。 CLI 当前有 repo 权限，仍缺 project/workflow；Projects 和新工作流接入单列待办。本仓 Issues 已启用。

## 本轮采用范围

采用材料来源：用户提供的 project-governance kit/skill v1.0.0 与 2026-10-25 工作区方案；用户 2026-10-27 授权五个现有仓库实施。此前跨仓复用是建议；未发生的集成不登记为已采用。

本轮 PR 与实际管理交付见 [HANDOVER.md](HANDOVER.md)。专业质量、浏览器使用和线上渠道必须另有证据。
