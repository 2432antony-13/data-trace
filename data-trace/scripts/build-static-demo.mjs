// 构建 GitHub Pages 静态演示站点（site/）。
// 做法：启动一次内存中的全栈服务 → 快照全部 API 数据 → 把当前前端
// （public/app.js/index.html/styles.css）改造为 /data-trace 子路径可用的
// 静态版本：注入 fetch 拦截器（window.__DT_STATIC__），浏览/筛选/搜索/详情
// 与后端语义一致；订阅等写操作返回「静态演示版」提示。
//
// 产物：<repo>/site/{index.html, app.js, styles.css, static-data.js, 404.html}
// 部署：pages.yml 直接部署已提交的 site/；修改前端或数据后请本地运行
//   npm run build:demo 并提交（每日更新工作流 daily-regulatory-update.yml 会
//   自动完成抓取+重建+提交）。
// 验证：构建后用 node:vm 执行 static-data.js，将客户端筛选结果与真实服务端
// 响应逐组对比断言（法规 8 组、更新 5 组组合）。

import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { createDataTraceServer } from '../src/server.mjs';

const moduleDir = dirname(fileURLToPath(import.meta.url));
const dataTraceDir = resolve(moduleDir, '..');
const repoRoot = resolve(dataTraceDir, '..');
const outDir = resolve(repoRoot, 'site');
const BASE_PATH = '/data-trace';
const PAGES_URL = 'https://2432antony-13.github.io' + BASE_PATH + '/';

mkdirSync(outDir, { recursive: true });
const tempDir = mkdtempSync(join(tmpdir(), 'dt-demo-build-'));
// DEMO_DATABASE_PATH：可注入已含新抓取/审校数据的库（每日自动更新工作流使用）。
const demoDatabasePath = process.env.DEMO_DATABASE_PATH || join(tempDir, 'demo.sqlite');
const { server } = createDataTraceServer({
  databasePath: demoDatabasePath,
  env: { MANAGE_LINK_SECRET: 'demo-build', PUBLIC_BASE_URL: PAGES_URL, CONFIRMATION_DRY_RUN: '1' }
});
await new Promise((resolvePromise) => server.listen(0, '127.0.0.1', resolvePromise));
const base = 'http://127.0.0.1:' + server.address().port;
const getJson = async (path) => (await fetch(base + path)).json();

console.log('[demo-build] 快照 API 数据…');
const health = await getJson('/api/health');
const taxonomy = await getJson('/api/taxonomy');
const jurisdictions = await getJson('/api/jurisdictions');
const regulations = await getJson('/api/regulations');
const updates = await getJson('/api/updates?limit=100');
const previews = {
  '': await getJson('/api/briefings/preview'),
  HK: await getJson('/api/briefings/preview?jurisdiction=HK'),
  SG: await getJson('/api/briefings/preview?jurisdiction=SG')
};
const details = {};
for (const item of regulations.data) {
  details['/api/regulations/' + item.id] = await getJson('/api/regulations/' + encodeURIComponent(item.id));
}
assert.ok(regulations.data.length >= 22, '法规快照应至少含 22 条种子记录');
assert.ok(updates.data.length >= 16, '更新快照应至少含 16 条种子事件');
assert.equal(Object.keys(details).length, regulations.data.length);
console.log('[demo-build] 快照完成：法规 22、更新 16、详情 22');

// ---------- static-data.js ----------
const staticJs = `// 静态演示数据与 fetch 拦截器（由 scripts/build-static-demo.mjs 生成，勿手改）
window.__DT_STATIC__ = {
  basePath: '/data-trace',
  demoNotice: '静态演示版：浏览、筛选与搜索可用；订阅与邮件需部署全栈版。',
  health: ${JSON.stringify(health)},
  taxonomy: ${JSON.stringify(taxonomy)},
  jurisdictions: ${JSON.stringify(jurisdictions)},
  regulations: ${JSON.stringify(regulations.data)},
  updates: ${JSON.stringify(updates.data)},
  previews: ${JSON.stringify(previews)},
  details: ${JSON.stringify(details)},
  filterRegulations: function (query) {
    var rows = this.regulations.slice();
    if (query.jurisdiction) rows = rows.filter(function (r) { return r.jurisdiction === query.jurisdiction; });
    if (query.type) rows = rows.filter(function (r) { return r.instrumentType === query.type; });
    if (query.industry) rows = rows.filter(function (r) { return Array.isArray(r.industries) && r.industries.includes(query.industry); });
    if (query.topic) rows = rows.filter(function (r) { return Array.isArray(r.topics) && r.topics.includes(query.topic); });
    if (query.q) rows = rows.filter(function (r) {
      var q = String(query.q).toLowerCase();
      var hay = [r.title, r.shortTitle, r.summary, r.issuingBody, JSON.stringify(r.industries), JSON.stringify(r.topics)]
        .map(function (v) { return String(v || '').toLowerCase(); });
      return hay.some(function (v) { return v.includes(q); });
    });
    return { data: rows, total: rows.length };
  },
  filterUpdates: function (query) {
    var rows = this.updates.slice();
    if (query.jurisdiction) rows = rows.filter(function (r) { return r.jurisdiction === query.jurisdiction; });
    if (query.industry) rows = rows.filter(function (r) { return Array.isArray(r.industries) && r.industries.includes(query.industry); });
    if (query.topic) rows = rows.filter(function (r) { return Array.isArray(r.topics) && r.topics.includes(query.topic); });
    var limit = Math.min(Math.max(Number(query.limit) || 50, 1), 100);
    rows = rows.slice(0, limit);
    return { data: rows, total: rows.length };
  }
};
(function () {
  var S = window.__DT_STATIC__;
  var map = Object.assign({}, S.details, {
    '/api/health': S.health,
    '/api/taxonomy': S.taxonomy,
    '/api/jurisdictions': S.jurisdictions
  });
  var realFetch = window.fetch.bind(window);
  function okJson(value) {
    return Promise.resolve({ ok: true, status: 200, json: function () { return Promise.resolve(value); } });
  }
  function blocked() {
    return Promise.resolve({ ok: false, status: 403, json: function () { return Promise.resolve({ error: S.demoNotice }); } });
  }
  function queryParams(url) {
    var out = {};
    url.searchParams.forEach(function (v, k) { out[k] = v; });
    return out;
  }
  window.fetch = function (input, init) {
    var raw = typeof input === 'string' ? input : (input && input.url) || '';
    var url;
    try { url = new URL(raw, location.origin); } catch (error) { return realFetch(input, init); }
    var pathname = url.pathname;
    var method = (init && init.method) || 'GET';
    if (method !== 'GET') return blocked();
    if (pathname === '/api/regulations') return okJson(S.filterRegulations(queryParams(url)));
    if (pathname === '/api/updates') return okJson(S.filterUpdates(queryParams(url)));
    if (pathname.indexOf('/api/briefings/preview') === 0) {
      var j = queryParams(url).jurisdiction;
      return okJson(S.previews[j] || S.previews['']);
    }
    if (Object.prototype.hasOwnProperty.call(map, pathname)) return okJson(map[pathname]);
    return realFetch(input, init);
  };
})();
`;

// ---------- 校验：vm 执行 static-data.js，客户端筛选与真实服务端逐组对比 ----------
console.log('[demo-build] 校验客户端筛选与服务端语义一致…');
const vmCtx = { window: { fetch: async () => { throw new Error('network disabled in demo build vm'); } }, location: { origin: 'https://demo.local' }, URL, URLSearchParams, Promise, console };
vm.createContext(vmCtx);
vm.runInContext(staticJs, vmCtx);
const S = vmCtx.window.__DT_STATIC__;
const toQuery = (search) => Object.fromEntries(new URLSearchParams(search).entries());
function compareWithDetail(got, expected, label) {
  const a = JSON.stringify(got);
  const b = JSON.stringify(expected);
  if (a === b) return;
  console.error('[demo-build] 不一致：' + label + '（长度 ' + a.length + ' vs ' + b.length + '）');
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) {
      console.error('  first diff @' + i + '\n  got:      ' + JSON.stringify(a.slice(Math.max(0, i - 80), i + 100)) + '\n  expected: ' + JSON.stringify(b.slice(Math.max(0, i - 80), i + 100)));
      break;
    }
  }
  assert.fail(label + ' 不一致');
}
const regCombos = ['', '?jurisdiction=SG', '?jurisdiction=HK', '?type=legislation', '?industry=financial_services',
  '?topic=cybersecurity', '?q=breach', '?jurisdiction=SG&industry=financial_services'];
for (const combo of regCombos) {
  const expected = await getJson('/api/regulations' + combo);
  const got = S.filterRegulations(toQuery(combo));
  compareWithDetail(got, expected, 'regulations ' + combo);
}
const updCombos = ['', '?jurisdiction=HK', '?jurisdiction=SG', '?limit=5', '?topic=breach_notification'];
for (const combo of updCombos) {
  const expected = await getJson('/api/updates' + combo);
  const got = S.filterUpdates(toQuery(combo));
  compareWithDetail(got, expected, 'updates ' + combo);
}
console.log('[demo-build] 筛选校验 13 组全部一致');

// ---------- 改造 app.js（子路径 BASE_PATH 适配，逐处断言恰好一次） ----------
console.log('[demo-build] 改造 app.js 路由…');
let appJs = readFileSync(join(dataTraceDir, 'public/app.js'), 'utf8');
const patches = [
  ['const DEFAULT_TITLE = document.title;', 'const BASE_PATH = ' + JSON.stringify(BASE_PATH) + ';\nconst DEFAULT_TITLE = document.title;'],
  ["const DETAIL_PREFIX = '/regulations/';", "const DETAIL_PREFIX = BASE_PATH + '/regulations/';"],
  ["const LEGACY_PATHS = { home: '/', library: '/library', timeline: '/timeline', subscribe: '/subscribe' };",
    "const LEGACY_PATHS = { home: BASE_PATH + '/', library: BASE_PATH + '/library', timeline: BASE_PATH + '/timeline', subscribe: BASE_PATH + '/subscribe' };"],
  ["return { path: '/' + hashPath, query: hashQuery, legacy: true };",
    "return { path: BASE_PATH + '/' + hashPath, query: hashQuery, legacy: true };"],
  ["function viewForPath(path) {\n  if (path === '/library') return 'library';\n  if (path === '/timeline') return 'timeline';\n  if (path === '/subscribe') return 'subscribe';\n  return 'home';\n}",
    "function viewForPath(path) {\n  if (path === BASE_PATH + '/library') return 'library';\n  if (path === BASE_PATH + '/timeline') return 'timeline';\n  if (path === BASE_PATH + '/subscribe') return 'subscribe';\n  return 'home';\n}"],
  ["let currentViewUrl = '/';", "let currentViewUrl = BASE_PATH + '/';"],
  ["navigateTo('/library?jurisdiction=' + encodeURIComponent(button.dataset.jurisdictionJump)", "navigateTo(BASE_PATH + '/library?jurisdiction=' + encodeURIComponent(button.dataset.jurisdictionJump)"],
  ["const url = '/library' + (query ? '?' + query : '');", "const url = BASE_PATH + '/library' + (query ? '?' + query : '');"],
  ["(currentViewUrl || '/')", "(currentViewUrl || BASE_PATH + '/')"],
  ["ctx.previousUrl || '/'", "ctx.previousUrl || BASE_PATH + '/'"]
];
for (const [from, to] of patches) {
  const count = appJs.split(from).length - 1;
  assert.equal(count, 1, 'app.js 补丁锚点应恰好出现一次：' + from.slice(0, 60));
  appJs = appJs.replace(from, to);
}
writeFileSync(join(outDir, 'app.js'), appJs);

// ---------- 改造 index.html ----------
console.log('[demo-build] 改造 index.html…');
let html = readFileSync(join(dataTraceDir, 'public/index.html'), 'utf8');
html = html.replace('<link rel="stylesheet" href="/styles.css">', '<link rel="stylesheet" href="styles.css">');
html = html.replace('<script type="module" src="/app.js"></script>', '<script src="static-data.js"></script>\n  <script type="module" src="app.js"></script>');
html = html.split('href="/').join('href="' + BASE_PATH + '/');   // 内部链接统一子路径前缀
html = html.split('https://datatrace.example').join(PAGES_URL);  // canonical/og 指向 Pages 地址
html = html.split(BASE_PATH + '//').join(BASE_PATH + '/');                 // 修正 canonical 尾部双斜杠
writeFileSync(join(outDir, 'index.html'), html);

// ---------- 404.html：深链刷新回退到 hash，由 parseRoute 恢复 ----------
const notFound = '<!doctype html><html><head><meta charset="utf-8"><title>DataTrace</title><script>(function(){var b=' + JSON.stringify(BASE_PATH) + ';var p=location.pathname||"";var s=p.indexOf(b)===0?p.slice(b.length).replace(/^\\/+/, ""):"";location.replace(b+"/"+(s?"#"+s:"")+(location.search||""));})();</script></head><body>Redirecting…</body></html>\n';
writeFileSync(join(outDir, '404.html'), notFound);

// ---------- 静态资源 ----------
copyFileSync(join(dataTraceDir, 'public/styles.css'), join(outDir, 'styles.css'));
writeFileSync(join(outDir, 'static-data.js'), staticJs);
writeFileSync(join(outDir, '.nojekyll'), '');

// ---------- 防回归守卫：拦截器必须按 pathname 匹配（带 query 的请求会漏网）；404 正则必须完整 ----------
assert.ok(!staticJs.includes('url.pathname + url.search'), '拦截器不得按 pathname+search 全量匹配');
assert.ok(staticJs.includes('var pathname = url.pathname;'), '拦截器缺少 pathname 匹配');
assert.ok(notFound.includes('/^\\/+/'), '404.html 正则转义缺失');
assert.ok(!appJs.includes("const url = '/library' +"), 'app.js 存在未加 BASE_PATH 的根路径');
assert.ok(!appJs.includes("navigateTo('/library?"), 'app.js 存在未加 BASE_PATH 的跳转');

// ---------- 语法校验产物 ----------
import { spawnSync } from 'node:child_process';
for (const file of ['app.js', 'static-data.js']) {
  const check = spawnSync(process.execPath, ['--check', join(outDir, file)], { encoding: 'utf8' });
  assert.equal(check.status, 0, file + ' 语法错误：' + check.stderr);
}

await new Promise((resolvePromise) => server.close(resolvePromise));
rmSync(tempDir, { recursive: true, force: true });
console.log('[demo-build] 完成 → site/（index.html / app.js / styles.css / static-data.js / 404.html）');
