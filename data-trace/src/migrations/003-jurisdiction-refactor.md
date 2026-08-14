# 003 · 法域拓展重构（数据层迁移）方案文档

> 给后续集成者的说明。本迁移只改「数据层」：把 `regulations` / `updates` 的
> `jurisdiction` 与 `subscribers` 的 `jurisdiction_plan` 从硬编码 CHECK 约束解放为
> `jurisdictions` 表驱动，为多法域（MO/CN/TH/ID/…）上线铺路。
> 本文件只写方案，不改任何代码。

---

## 1. 迁移原理与风险

### 1.1 为什么要重建表

SQLite 不支持 `ALTER TABLE ... DROP CONSTRAINT`，无法直接删除列上的 CHECK 约束。
要去掉 CHECK，只能走「重建表」标准流程：

1. `PRAGMA foreign_keys = OFF`（必须在事务外执行，事务内是 no-op）
2. 逐表 `ALTER TABLE <t> RENAME TO <t>_old`
3. `CREATE TABLE <t>`（同名新表，去掉 CHECK）
4. `INSERT INTO <t> (<显式列名>) SELECT <显式列名> FROM <t>_old`
5. `DROP TABLE <t>_old`
6. 重建索引
7. `PRAGMA foreign_key_check`（必须为空）
8. `PRAGMA foreign_keys = ON`

整个过程包在 `BEGIN / COMMIT / ROLLBACK` 事务里，任一环节失败即回滚，保证原子性。

### 1.2 关键坑：legacy_alter_table 与 RENAME 改写子表外键引用

本项目内置 SQLite 为 **3.53.3**。实测结论（务必知晓）：

| PRAGMA 组合 | `ALTER TABLE regulations RENAME TO regulations_old` 后 articles 的外键引用 |
| --- | --- |
| `foreign_keys=OFF`，默认 `legacy_alter_table=OFF` | 被改写为 `REFERENCES regulations_old(id)` ❌ |
| `foreign_keys=OFF` + `legacy_alter_table=ON` | 保持 `REFERENCES regulations(id)` ✅ |
| `foreign_keys=ON` | 被改写为 `REFERENCES regulations_old(id)` ❌ |

也就是说：**仅关 `foreign_keys` 不够**。默认 `legacy_alter_table=OFF` 时，即便外键已关，
`RENAME` 仍会把其它表里指向被重命名表的外键引用改写成 `_old`；随后 `DROP` 旧表后这些
引用会悬空。因此迁移必须同时开启 `PRAGMA legacy_alter_table = ON`，让 `RENAME` 不改写
任何子表引用。这样同名新表建好后，`articles` / `updates` / `mail_log` /
`dispatch_messages` 等子表的外键引用自然恢复指向新表，最后用 `foreign_key_check` 兜底验证。

> 这正是任务描述里「foreign_keys=OFF 期间 RENAME 不会改写子表引用」在本 SQLite 版本下
> 成立的前提条件。

### 1.3 风险清单

- **外键引用悬空**：已在 1.2 用 `legacy_alter_table=ON` 规避，并由 `foreign_key_check` 兜底。
- **数据丢失**：`INSERT ... SELECT` 显式列出全部列名，逐行搬运；迁移后应核对
  `regulations=22 / articles=26 / updates=16` 行数不变（`articles` 不参与重建，天然不变）。
- **索引丢失**：`DROP` 旧表会连带删除其上的索引，所以必须在 DROP 之后重建 5 个原索引。
- **事务边界**：`foreign_keys` 开关必须在事务外；若在事务内设置会被忽略，导致校验失效。
- **并发写入**：迁移期间应停机（无写入）执行；`RENAME` 会短暂让同名表不存在，需靠事务隔离。

---

## 2. 新 DDL 与 src/schema.sql 的完整 diff 清单

日后把 `schema.sql` 同步为「无 CHECK 版本」时，只需做以下三处改动，其余完全一致：

### 2.1 regulations

```diff
-  jurisdiction TEXT NOT NULL CHECK (jurisdiction IN ('HK', 'SG')),
+  jurisdiction TEXT NOT NULL,
```

### 2.2 updates

```diff
-  jurisdiction TEXT NOT NULL CHECK (jurisdiction IN ('HK', 'SG')),
+  jurisdiction TEXT NOT NULL,
```

> `updates.status` 列及其 `CHECK (status IN ('pending_review','published','retracted'))`
> 保持不动。

### 2.3 subscribers

```diff
-  jurisdiction_plan TEXT NOT NULL DEFAULT 'ALL' CHECK (jurisdiction_plan IN ('HK', 'SG', 'ALL')),
+  jurisdiction_plan TEXT NOT NULL DEFAULT 'ALL',
```

> `subscribers.jurisdictions`（JSON 数组，默认 `'["HK","SG"]'`）保持不动，作为多选法域的
> 长期存储字段；`jurisdiction_plan` 保留为兼容列（历史三档计划映射），新代码以
> `jurisdictions` 为准。

其余表（`articles` / `mail_log` / `dispatch_runs` / `ingestion_runs` / `jurisdictions` /
`dispatch_messages`）与全部索引定义不变。

---

## 3. server.mjs 集成清单

### 3.1 常量替换

删除：

```js
const JURISDICTION_PLANS = { HK: ['HK'], SG: ['SG'], ALL: ['HK', 'SG'] };
```

改为启动时从 `jurisdictions` 表查询 active 行，例如：

```js
const activeJurisdictions = db.prepare(
  'SELECT code FROM jurisdictions WHERE active=1 ORDER BY code'
).all().map((row) => row.code);
```

### 3.2 新增 GET /api/jurisdictions

返回 jurisdictions 表全量（或 active 行），供前端动态渲染法域 chip：

```js
if (request.method === 'GET' && url.pathname === '/api/jurisdictions') {
  const rows = db.prepare(
    'SELECT code, name_en, name_zh, region, tier, active FROM jurisdictions ORDER BY code'
  ).all();
  return json(response, 200, { data: rows });
}
```

### 3.3 订阅 API 接受 jurisdictions 数组多选（替代三档计划）

- `normalizePreferences` 里用 `body.jurisdictions`（数组，须为 `jurisdictions` 表中存在的
  code）替代 `body.jurisdictionPlan` 三档判断。
- 向后兼容：若旧客户端仍传 `jurisdictionPlan`（HK/SG/ALL），映射为
  `{HK:['HK'], SG:['SG'], ALL:[...activeJurisdictions]}`；同时把 `jurisdiction_plan`
  写入 `jurisdictions` 数组。
- 入库仍写 `jurisdictions` JSON 列；`jurisdiction_plan` 可作为兼容冗余列继续写入。

### 3.4 /api/regulations 与 /api/updates 的法域参数校验改为 jurisdictions 表

现在的硬编码校验：

```js
if (['HK', 'SG'].includes(jurisdiction)) { clauses.push('jurisdiction = ?'); values.push(jurisdiction); }
```

改为：

```js
const known = new Set(activeJurisdictions); // 或查 jurisdictions 表
if (known.has(jurisdiction)) { clauses.push('jurisdiction = ?'); values.push(jurisdiction); }
```

`/api/briefings/preview` 与 `/api/dispatch/messages` 中所有 `['HK','SG'].includes(...)`
与 `JURISDICTION_PLANS[...]` 同样替换为 jurisdictions 表驱动；dispatch 的
`allowed` 直接取 `parseList(subscriber.jurisdictions)`。

---

## 4. 前端集成清单（public/app.js / public/index.html）

- **法域 chip 动态化**：启动时 `fetch('/api/jurisdictions')`，用返回的
  `code / name_zh` 渲染筛选 chip，替换当前硬编码的 HK/SG 两枚。
- **订阅多选 UI**：订阅表单把「三档单选（HK/SG/ALL）」改为法域多选复选框/多选 chip，
  提交字段用 `jurisdictions: ['HK','SG',...]`；读取回显也用 `subscriber.jurisdictions`。
- **消费 /api/jurisdictions**：`/api/regulations`、`/api/updates` 的筛选参数与法域标签
  显示都以上面接口的 code 集合为准，避免前端再写死法域列表。

---

## 5. 建议执行顺序

1. **先跑迁移**：`npm run migrate:jurisdictions`（即
   `node src/migrations/003-jurisdiction-refactor.mjs`，可用 `DATABASE_PATH` 指定库）。
   确认输出「迁移完成」，且 `PRAGMA foreign_key_check` 为空、行数 22/26/16 不变。
2. **再改代码**：按第 3 节改 `server.mjs`（常量/校验/新接口），按第 4 节改前端。
3. **最后同步 schema**：按第 2 节把 `schema.sql` 三处 CHECK 移除，保证新建库即无 CHECK
   （迁移对新建库会自动幂等跳过）。
4. 回归：`node --test test/app.test.mjs test/jurisdiction.test.mjs` 全绿。
