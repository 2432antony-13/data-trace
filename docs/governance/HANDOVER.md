# data-trace 治理交接

2026-10-27；当前授权：用户要求按既定规范更新五个已有 GitHub 项目。工作分支 governance/project-baseline-20261027，基线 `943501e38d3cb33bb8ad54199a05d5a36bc7b3aa`。

已准备章程、协作规则、质量矩阵、资产来源与模板；实际 Issue、PR、平台约束和检查结果由本轮完成记录补充。当前尚未以本文件宣告合并、部署或业务验收。

下一执行动作：读取本仓 Issues 的唯一状态与阻塞，核对当前分支和最新检查，按具体用例推进。在 `data-trace/` 使用 Node 22：`npm run check`、`npm test`、`npm run build:demo`。构建写入 `site/`，回归测试使用临时数据库和模拟服务。

具体产品待办：完成来源失败与浏览器路径验收；完成每日更新到 Pages 的显式部署与简报停用接入。业务期限/预算尚未承诺；新外部费用、真实发信或数据恢复按任务补齐范围。

当前已知限制：2026-10-26 静态试点已部署，七个文件与 943501e38d3cb33bb8ad54199a05d5a36bc7b3aa 一致。自动化增强已进入本轮平台接入 PR，实际检查与渠道结果见 Issue #3；来源观测为一可用、一无匹配、三失败。 2026-10-27 已补齐 project/workflow 权限并接入私有看板；独立人工批准和用户验收尚未取得。本轮不新建仓库，不引入 JEV 等本地对象。

## 实际任务入口

[本轮里程碑](https://github.com/2432antony-13/data-trace/milestone/2)

- [governance #7](https://github.com/2432antony-13/data-trace/issues/7)

任务当前状态以[私有管理看板](https://github.com/users/2432antony-13/projects/1)的 Status 与 Blocked 为准；最终 PR、合并来源与运行结果在治理任务正文登记。这里不复制会随进度变化的第二套任务状态。

## 2026-10-27 首页整理与三语入口

- 本轮首页任务：https://github.com/2432antony-13/data-trace/issues/10。
- README 顶部提供简体中文、繁体中文和 English；完整说明收进 docs/，旧版本在 docs/archive/ 保留。
- 三语覆盖当前仓库首页与核心使用说明；产品界面与专业内容尚未完成全量三语化，不能据此标为已完成。
- 页脚改为种子内容核验基线，不冒充最新采集或内容复核日期。Node 22 本地 17 项测试和 13 组静态筛选比较通过。
