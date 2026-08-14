# ingest —— 法规实时更新管道

本目录实现 DataTrace 的法规更新「实时更新」数据入口：定期抓取香港 / 新加坡官方数据源，
规范化后以 `status='pending_review'` 落入 `updates` 表，经人工审校后再 `approve` 发布，
发布后的记录才会被公开 API 展示并触发订阅提醒。

## 架构

```
抓取 (sources/*.mjs)
  → 规范化 (item: externalId / title / url / date / kind)
  → external_id 去重（幂等）+ content_hash 记录
  → INSERT updates (status='pending_review')
  → （可选）LLM 摘要 summarize.mjs（不阻塞入库，失败返回 null）
  → 人工审校 review.mjs（list → edit → approve / reject）
  → status='published' → 公开 API 展示 → 触发 update_alert
```

- 每个源一次运行写一行 `ingestion_runs`（running → succeeded / failed，含 inserted / unchanged / error_message）。
- 逐条按 `external_id` 判重：已存在则记为 unchanged 跳过（幂等，重复运行不产生重复记录）。
- 任一源失败只标记该源 failed，不中断其它源，也不让 `runIngest` 崩溃。
- `event_type` 默认 `source_refresh`，`importance` 默认 `medium`，`industries=['cross_industry']`。

## 文件

| 文件 | 作用 |
| --- | --- |
| `pipeline.mjs` | `runIngest` 入库逻辑 + `fetchText` 统一抓取策略（30s 超时 / UA / 429、5xx 重试一次）+ 日期规范化工具 |
| `sources/hk.mjs` | `pcpd-press`（PCPD 新闻稿）、`hkel-dataset`（律政司「香港法例现行版本」开放数据集） |
| `sources/sg.mjs` | `pdpc-news`、`mas-consultations`、`imda-codes` |
| `summarize.mjs` | 可选 LLM 摘要（OpenAI 兼容端点），未配置 / 失败一律返回 null，永不 throw |
| `review.mjs` | 审校 CLI：list / approve / reject / edit |
| `run.mjs` | 抓取 CLI：`--source` / `--dry-run` / `--database` |

## 源模块接口

每个源导出：

```js
{
  code,          // 唯一源标识，如 'pcpd-press'
  jurisdiction,  // 'HK' | 'SG'
  name,          // 展示名，写入 updates.source_name
  baseUrls,      // 源页面 URL 数组
  async extract({ fetchFn }) => ({ items: [{ externalId, title, url, date, kind }] })
}
```

`fetchFn` 可注入（测试用），默认 `globalThis.fetch`。所有请求经 `fetchText` 统一带
`AbortSignal.timeout(30000)` 与 User-Agent；429 / 5xx 重试一次后抛错。

## 各源抓取策略与合规说明

### HK · pcpd-press（PCPD 新闻稿 / 媒体声明）
- 索引页 `https://www.pcpd.org.hk/english/news_events/media_statements/index.html` 是 JS 渲染壳，
  真实条目在 `/js/Media_Statements2.js` 里（`var Media_Statements = { data: [...] }`）。
- 策略：从索引页正则取 `Media_Statements*.js` 相对路径 → 拉取 JS → 用状态机提取 JSON 对象 →
  取最近 `MAX_ITEMS=20` 条（`archive='N'` 的现行年份条目优先）。
- `externalId = hk:event:pcpd-press:<YYYY-MM-DD>-<slug>`（slug 取链接文件名，如 `press_20260813`）。
- 合规：仅读取官方公开新闻稿索引，单源单次最多 20 条，默认按需手动触发（见「限速」）。

### HK · hkel-dataset（律政司香港法例现行版本）
- 优先 CKAN 开放数据接口
  `https://data.gov.hk/en-data/api/3/action/package_show?id=hk-doj-hkel-legislation-current`，
  结构化返回 `result.resources`（12 个 ZIP 下载链接）与 `result.metadata_modified`（更新时间）。
- 回退：解析数据集 HTML 中 `<li data-url="..." data-name-en="...">` 资源列表。
- 兜底：两者都解析不出资源时，产出「页面指纹」事件（整页内容 sha256 前 16 位入 externalId，
  title 注明 page fingerprint）——页面一变即产生新事件。
- 网络不可达时正则按上述已知结构防御性编写（数据来源为官方开放数据，优先官方接口）。

### SG · pdpc-news（PDPC 新闻）
- 页面 `https://www.pdpc.gov.sg/news-and-events`（实际跳转 `/media-events`）。
- **已知限制**：PDPC 站点在 AWS WAF（CloudFront）之后，纯 Node fetch 会收到 202 空响应
  （`fetchText` 会抛「empty response」并把该源标为 failed）。防御性正则按「新闻卡片 `<a>` +
  `Published on DD Mon YYYY`」编写；测试用 fixture 覆盖，真实抓取需无头浏览器或官方 API。

### SG · mas-consultations（MAS 法规 / 咨询）
- 列表页 `https://www.mas.gov.sg/publications/consultations`（结构稳定：`Published Date: DD Month YYYY`
  + 标题链接 `/publications/consultations/<year>/<slug>`）。
- **已知限制**：MAS 对非浏览器 UA 返回 `<title>Maintenance</title>` 维护页；纯 Node fetch
  可能拿不到列表（此时返回 0 条，源仍 succeeded，README 已注明）。正则按上述结构防御性编写。

### SG · imda-codes（IMDA 守则）
- 守则页 `https://www.imda.gov.sg/regulations-and-licences/regulations/codes-of-practice`，
  含 Infocomm / Media / Postal 三个分组链接，页脚有 `LAST UPDATED: DD Month YYYY`。
- **已知限制**：IMDA 同样在 AWS WAF 之后（202 空响应）。正则按「分组链接 + LAST UPDATED」防御性编写。

### 合规总则
- 全部为官方公开站点 / 官方开放数据，优先结构化 API（CKAN）而非页面抓取。
- robots.txt：各源均为政府公开信息页，抓取前应人工确认其 robots.txt 允许；本管线默认按需
  手动触发（`node src/ingest/run.mjs`），不内置高频定时轮询。
- 限速：单源单次最多 20 条；`fetchText` 30 秒超时 + 429/5xx 仅重试一次，避免打爆源站。
- 不落盘任何抓取原文，仅存规范化后的标题 / 链接 / 日期 / content_hash。

## 可选 LLM 摘要（SUMMARIZE_API_URL）

`summarize.mjs` 在环境变量同时配置 `SUMMARIZE_API_URL` 与 `SUMMARIZE_API_KEY` 时，向
任意 OpenAI 兼容端点 `POST { text }`（Bearer 鉴权），期待响应 `{ summaryEn, summaryZh }`；
超时 45 秒，任何失败返回 null（永不 throw，不阻塞入库）。

```bash
# .env 示例（任意 OpenAI 兼容端点，例如某网关 / vLLM / Ollama 的 OpenAI 兼容层）
export SUMMARIZE_API_URL="https://your-endpoint.example/v1/chat/completions"   # 仅示意，实际实现按 {summaryEn,summaryZh} 契约
export SUMMARIZE_API_KEY="sk-..."
```

> 说明：本模块按任务契约发送 `{ text }` 并解析 `{ summaryEn, summaryZh }`；接自建网关时，
> 网关需把「生成中英双语一句话摘要」的提示词与后端模型差异封装在该端点之后，保证返回契约不变。

## 审校 SOP（人工审校，发布前必须）

```bash
# 1. 抓取（写入 pending_review）
node src/ingest/run.mjs                       # 全部源
node src/ingest/run.mjs --source hk           # 仅香港
node src/ingest/run.mjs --dry-run             # 只打印不写库

# 2. 列出待审
node src/ingest/review.mjs list

# 3. 逐条编辑（可选，逐字段更新）
node src/ingest/review.mjs edit upd_ing_<uuid> --summaryEn="..." --summaryZh="..." --importance=high

# 4. 批准（→ published，公开 API 可见并触发 alert）或驳回（→ retracted）
node src/ingest/review.mjs approve upd_ing_<uuid>
node src/ingest/review.mjs reject  upd_ing_<uuid>
```

- 可用 `--database <path>` 指定数据库（默认 `data/data-trace.sqlite`，也可用 `DATABASE_PATH`）。
- 审校要求：核实标题、链接、日期与事件类型/重要度；中文摘要须人工校对后再发布（默认
  `【待审校】` 前缀提示）。
- 批准后即进入 `published`，由 server 层过滤展示并参与 update_alert 派发。

## 验证

```bash
node --check src/ingest/pipeline.mjs src/ingest/sources/hk.mjs src/ingest/sources/sg.mjs   src/ingest/summarize.mjs src/ingest/review.mjs src/ingest/run.mjs test/ingest.test.mjs
node --test test/ingest.test.mjs
```
