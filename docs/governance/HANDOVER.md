# data-trace 治理交接

2026-10-27；当前授权：用户要求按既定规范更新五个已有 GitHub 项目。工作分支 governance/project-baseline-20261027，基线 `943501e38d3cb33bb8ad54199a05d5a36bc7b3aa`。

已准备章程、协作规则、质量矩阵、资产来源与模板；实际 Issue、PR、平台约束和检查结果由本轮完成记录补充。当前尚未以本文件宣告合并、部署或业务验收。

下一执行动作：读取本仓 Issues 的唯一状态与阻塞，核对当前分支和最新检查，按具体用例推进。在 `data-trace/` 使用 Node 22：`npm run check`、`npm test`、`npm run build:demo`。构建写入 `site/`，回归测试使用临时数据库和模拟服务。

具体产品待办：完成来源失败与浏览器路径验收；完成每日更新到 Pages 的显式部署与简报停用接入。业务期限/预算尚未承诺；新外部费用、真实发信或数据恢复按任务补齐范围。

当前已知限制：2026-10-26 静态试点已部署，七个文件与 943501e38d3cb33bb8ad54199a05d5a36bc7b3aa 一致。自动化增强仅在本地 governance/datatrace-automation 分支；来源观测为一可用、一无匹配、三失败。 Projects/新工作流待权限；独立人工批准和用户验收尚未取得。本轮不新建仓库，不引入 JEV 等本地对象。

## 实际任务入口

[本轮里程碑](https://github.com/2432antony-13/data-trace/milestone/2)

- [governance #7](https://github.com/2432antony-13/data-trace/issues/7)

任务当前状态以 Issue 标签为准；最终 PR、合并来源与运行结果在治理任务正文登记。这里不复制会随进度变化的第二套任务状态。
