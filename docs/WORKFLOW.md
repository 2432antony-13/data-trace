# DataTrace 工作与交付流程

一项任务先写用户问题、范围、可核对验收与前置条件，再进入实施。采用 Backlog → Ready → Doing → Review → Verified → Delivered；阻塞单列，取消不计交付。任务状态统一在[私有管理看板](https://github.com/users/2432antony-13/projects/1)的 Status 字段维护，阻塞使用 Blocked / Blocker 字段；Issue 正文保留验收与解除条件。旧 status/blocked 标签停止作为状态源。

小修复可用一个 Issue 与一个 PR 承载；重要数据/产品变动补一份决策记录。默认 `main` 加短任务分支。PR 写清行为变化、实际命令、结果和未覆盖范围，检查通过后才集成；单人自查不伪装成独立审批。

## 检查

在 `data-trace/` 使用 Node 22：

```text
npm run check
npm test
npm run build:demo
```

测试包括本机模拟 HTTP/SMTP 服务；构建会使用临时数据库和本地环回服务，并写 `site/`。`DEMO_OUTPUT_DIR` 可隔离产物；`DEMO_SNAPSHOT_PATH` 可指定历史快照；`DEMO_DATABASE_PATH` 可指定构建数据库。通常无需安装第三方依赖。

## 渠道

2026-10-27：project/workflow 权限已补齐。本轮变更将以下增强流程接入 Actions；精确运行、来源提交和线上制品核对登记到 Issue #3。2026-10-26 的首轮静态交付没有 deployment.json，历史证据保留。

- main 代码变更：Pages workflow 检查、构建、记录制品指纹并部署。
- 每日数据变更：采集并保留各源状态，演示自动收录，构建与提交后显式调用 Pages workflow。机器人 push 本身不是触发保证。
- 公共 `deployment.json` 记录实际构建的提交、Actions URL 和文件 SHA-256；它证明制品来源，不等于内容经过专业审核。
- 邮件：`DISPATCH_ENABLED=true` 且地址/凭据齐备时才尝试准备；接收与退订另外验收。目前未配置，不能把 workflow 结束成功当作邮件送达。

GitHub 的复用工作流与 Pages 权限规则参考：[复用工作流](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows)、[自定义 Pages 流程](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 交付与恢复

交付记录链接任务、PR、验证 run、实际线上源码标识、浏览器场景和未完成项。记录上一实际可用部署及数据快照；恢复代码与恢复数据是两件事，邮件不可用代码回退撤回。未演练时明确标为未演练。

发现质量/时效问题先保留证据与可用旧内容，不通过隐藏失败或放宽断言让指标好看。复盘决定继续、调整或暂停，并记录理由。

## 2026-10-27 全仓治理接入

本轮沿用既有试点规则，补充治理基线、质量矩阵、资产和交接。入口见 [治理基线](governance/BASELINE.md)。任务状态统一在[私有管理看板](https://github.com/users/2432antony-13/projects/1)的 Status 字段维护，阻塞使用 Blocked / Blocker 字段；Issue 正文保留验收与解除条件。旧 status/blocked 标签停止作为状态源。仅现有 GitHub 仓库在范围内，暂不新建仓库或引入本地项目。全仓治理文档交付不替代来源修复、自动化和浏览器验收。

## 新任务进入看板

[私有管理看板](https://github.com/users/2432antony-13/projects/1)是当前状态源。网页任务表单设置了项目关联和默认 Owner；创建者有看板写权限时可自动加入。CLI/API 或外部贡献者创建的 Issue 由 Owner 显式加入看板，并核对 Status、Blocked、Assignees；新任务通常为 Backlog，期限未知保持空。参考 [GitHub 表单规则](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms)。
