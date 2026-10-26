# DataTrace 工作与交付流程

一项任务先写用户问题、范围、可核对验收与前置条件，再进入实施。采用 Backlog → Ready → Doing → Review → Verified → Delivered；阻塞单列，取消不计交付。Projects 接入前由 Issue 的任务记录承载状态，接入后以 Projects 为状态源。

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

2026-10-26 实施状态：以下增强工作流已在本地准备，待账号取得 `workflow` 权限后推送。首轮试点使用现有 Pages 流程发布已提交的 `site/`，以部署运行的 SHA 与线上文件散列核对来源；该阶段没有 `deployment.json`。Projects 看板另待 `project` 权限。不要将这些待接入能力写成已完成。

- main 代码变更：Pages workflow 检查、构建、记录制品指纹并部署。
- 每日数据变更：采集并保留各源状态，演示自动收录，构建与提交后显式调用 Pages workflow。机器人 push 本身不是触发保证。
- 公共 `deployment.json` 记录实际构建的提交、Actions URL 和文件 SHA-256；它证明制品来源，不等于内容经过专业审核。
- 邮件：`DISPATCH_ENABLED=true` 且地址/凭据齐备时才尝试准备；接收与退订另外验收。目前未配置，不能把 workflow 结束成功当作邮件送达。

GitHub 的复用工作流与 Pages 权限规则参考：[复用工作流](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows)、[自定义 Pages 流程](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 交付与恢复

交付记录链接任务、PR、验证 run、实际线上源码标识、浏览器场景和未完成项。记录上一实际可用部署及数据快照；恢复代码与恢复数据是两件事，邮件不可用代码回退撤回。未演练时明确标为未演练。

发现质量/时效问题先保留证据与可用旧内容，不通过隐藏失败或放宽断言让指标好看。复盘决定继续、调整或暂停，并记录理由。
