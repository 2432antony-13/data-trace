const state = {
  regulations: [], updates: [], jurisdiction: '', industry: '', topic: '', type: '', query: '', timelineJurisdiction: '',
  jurisdictions: [], subscriptionJurisdictions: [],
  language: localStorage.getItem('dataTraceLanguage') || 'en',
  subscriber: JSON.parse(localStorage.getItem('dataTraceSubscriber') || 'null')
};

const messages = {
  en: {
    'nav.home': 'Radar', 'nav.library': 'Library', 'nav.timeline': 'Timeline', 'nav.subscribe': 'Subscribe ↗',
    'hero.title': 'Trace every<br><em>regulatory shift</em><br>to its source.',
    'hero.body': 'Regulatory intelligence for cross-border legal and privacy teams—connecting primary sources, obligations, amendments and delivery in one auditable data chain.',
    'hero.library': 'Explore the library', 'hero.timeline': 'Review latest changes',
    'stats.records': 'instruments', 'stats.obligations': 'obligations', 'stats.events': 'events',
    'latest.title': 'Latest regulatory signals', 'latest.all': 'Full timeline →',
    'coverage.title': 'Jurisdiction coverage', 'coverage.hk': 'Hong Kong', 'coverage.sg': 'Singapore',
    'coverage.source': '<b>Source-verifiable</b><br>Every record retains its authority, primary link, version date and content fingerprint.',
    'library.title': 'Regulation is more than a PDF.', 'library.body': 'Filter by jurisdiction, industry and topic; open any record for structured obligations, version data and the authoritative source.',
    'library.search': 'Search rules, duties or authorities', 'filter.all': 'All', 'filter.allIndustries': 'All industries', 'filter.allTopics': 'All topics', 'filter.allTypes': 'All instrument types',
    'type.legislation': 'Primary legislation', 'type.subsidiary_legislation': 'Subsidiary legislation', 'type.regulator_guidance': 'Regulatory guidance', 'type.code_of_practice': 'Code of practice',
    'timeline.title': 'Regulatory change timeline', 'timeline.body': 'Every commencement, amendment and guidance event links back to its instrument and official source.',
    'impact.high': 'High impact', 'impact.medium': 'Medium impact', 'impact.low': 'Routine',
    'subscribe.title': 'Do not leave change<br>inside the browser.', 'subscribe.body': 'Choose one or more jurisdictions and delivery modes. Daily briefings run at 08:00 Beijing time; high-impact alerts are prepared immediately.',
    'subscribe.settings': 'Subscription settings', 'subscribe.email': 'Work email', 'subscribe.delivery': 'Delivery',
    'subscribe.daily': 'Daily briefing', 'subscribe.dailyNote': 'Every day at 08:00 Beijing time', 'subscribe.alert': 'Regulatory update alert', 'subscribe.alertNote': 'Immediate delivery for new or amended rules',
    'subscribe.plan': 'Jurisdictions', 'plan.hk': 'Hong Kong only', 'plan.sg': 'Singapore only', 'plan.all': 'All jurisdictions', 'subscribe.selectAll': 'All', 'subscribe.selectJurisdiction': 'Select at least one jurisdiction.',
    'subscribe.save': 'Save subscription', 'subscribe.fine': 'Each email contains recipient-specific management and unsubscribe links. No marketing mail.', 'subscribe.unsubscribe': 'Unsubscribe',
    'subscribe.saved': '✓ Subscription preferences saved.',
    'subscribe.confirm': '✓ Subscription saved. Check your inbox and click the confirmation link to activate delivery.',
    'subscribe.pendingConfirm': 'Subscription pending confirmation — check your inbox and click the confirmation link to activate delivery.',
    'footer.note': 'Hong Kong + Singapore pilot · source check 2026-08-09<br>Tracking information only; not legal advice.',
    'radar.label': 'Regulatory coverage radar', 'skip.link': 'Skip to main content', 'retry': 'Retry',
    'offline.title': 'You are offline or the server is unreachable. Some data may be stale.'
  },
  zh: {
    'nav.home': '雷达', 'nav.library': '法规库', 'nav.timeline': '更新线', 'nav.subscribe': '订阅信号 ↗',
    'hero.title': '让每一次<br><em>规则变化</em><br>留下轨迹。', 'hero.body': '面向出海企业法务与数据合规律师的法规信号台，把原始法源、条文义务、修订事件和订阅触达收拢到一条可追溯的数据链。',
    'hero.library': '进入法规库', 'hero.timeline': '查看最新变化', 'stats.records': '法规与指南', 'stats.obligations': '结构化义务', 'stats.events': '历史事件',
    'latest.title': '最新监管信号', 'latest.all': '完整时间线 →', 'coverage.title': '法域覆盖', 'coverage.hk': '香港', 'coverage.sg': '新加坡',
    'coverage.source': '<b>来源可核验</b><br>每条记录保留发布机关、原文链接、版本日与内容指纹。',
    'library.title': '法规，不只是一份 PDF。', 'library.body': '按法域、行业、主题与文书层级定位规则；打开记录即可查看结构化义务、版本信息和权威原文。',
    'library.search': '搜索法规、义务或发布机关', 'filter.all': '全部', 'filter.allIndustries': '全部行业', 'filter.allTopics': '全部主题', 'filter.allTypes': '全部文书类型',
    'type.legislation': '主要立法', 'type.subsidiary_legislation': '附属法规', 'type.regulator_guidance': '监管指引', 'type.code_of_practice': '实务守则',
    'timeline.title': '规则更新线', 'timeline.body': '从生效、修订到指引发布，每个事件均回链至对应法规和官方来源。',
    'impact.high': '高影响', 'impact.medium': '中影响', 'impact.low': '常规更新',
    'subscribe.title': '别让变化<br>停在浏览器里。', 'subscribe.body': '选择一个或多个法域与触达方式。每日简报在北京时间 8:00 生成，高影响修订与新规即时生成 alert。',
    'subscribe.settings': '订阅设置', 'subscribe.email': '工作邮箱', 'subscribe.delivery': '接收内容',
    'subscribe.daily': '每日简报', 'subscribe.dailyNote': '北京时间每天 8:00', 'subscribe.alert': '法规更新 Alert', 'subscribe.alertNote': '新规或修订即时触达',
    'subscribe.plan': '法域', 'plan.hk': '仅香港', 'plan.sg': '仅新加坡', 'plan.all': '全部', 'subscribe.selectAll': '全选', 'subscribe.selectJurisdiction': '请至少选择一个法域。',
    'subscribe.save': '保存订阅', 'subscribe.fine': '每封邮件均含收件人专属管理和退订链接；不发送营销信息。', 'subscribe.unsubscribe': '取消订阅',
    'subscribe.saved': '✓ 订阅设置已持久保存。',
    'subscribe.confirm': '✓ 订阅已持久保存，请查收确认邮件完成激活（未确认不发送简报）。',
    'subscribe.pendingConfirm': '订阅尚未激活：请查收确认邮件并点击确认链接完成激活（未确认不发送简报）。',
    'footer.note': '香港 + 新加坡试点 · 来源核验于 2026-08-09<br>信息仅用于法规追踪，不构成法律意见。',
    'radar.label': '覆盖情况', 'skip.link': '跳到主要内容', 'retry': '重试',
    'offline.title': '网络不可用或服务器无响应，部分数据可能已过期。'
  }
};

const typeLabels = {
  en: { legislation: 'Primary legislation', subsidiary_legislation: 'Subsidiary legislation', regulator_guidance: 'Regulatory guidance', code_of_practice: 'Code of practice' },
  zh: { legislation: '主要立法', subsidiary_legislation: '附属法规', regulator_guidance: '监管指引', code_of_practice: '实务守则' }
};
const eventLabels = {
  en: { enactment: 'Enactment', commencement: 'Commencement', amendment: 'Amendment', guidance_release: 'Guidance release', guidance_revision: 'Guidance revision', source_refresh: 'Source refresh' },
  zh: { enactment: '颁布', commencement: '生效', amendment: '修订', guidance_release: '指引发布', guidance_revision: '指引修订', source_refresh: '来源刷新' }
};
const taxonomyLabels = {
  cross_industry: ['Cross-industry', '跨行业'], financial_services: ['Financial services', '金融服务'], banking: ['Banking', '银行'], telecommunications: ['Telecommunications', '电信'], marketing: ['Marketing', '营销'],
  collection: ['Collection', '收集'], consent: ['Consent', '同意'], data_subject_rights: ['Data subject rights', '数据主体权利'], security: ['Security', '安全'], retention: ['Retention', '留存'], direct_marketing: ['Direct marketing', '直销'], breach_notification: ['Breach notification', '泄露通知'], incident_response: ['Incident response', '事件响应'], cross_border_transfer: ['Cross-border transfer', '跨境传输'], cybersecurity: ['Cybersecurity', '网络安全'], technology_risk: ['Technology risk', '科技风险'], outsourcing: ['Outsourcing', '外包'], customer_confidentiality: ['Customer confidentiality', '客户信息保密'], communications_data: ['Communications data', '通信数据'], electronic_marketing: ['Electronic marketing', '电子营销'], network_security: ['Network security', '网络安全']
};

function t(key) { return messages[state.language][key] || key; }
function label(value) { const pair = taxonomyLabels[value]; return pair ? pair[state.language === 'en' ? 0 : 1] : value.replaceAll('_', ' '); }
function escapeHtml(value = '') { return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]); }

// 法域静态降级数据（/api/jurisdictions 失败时使用），保证 HK/SG 始终可用。
const FALLBACK_JURISDICTIONS = [
  { code: 'HK', name_en: 'Hong Kong', name_zh: '香港', region: 'apac', tier: 0, active: 1 },
  { code: 'SG', name_en: 'Singapore', name_zh: '新加坡', region: 'apac', tier: 0, active: 1 }
];
function jurisdictionName(code) {
  const item = state.jurisdictions.find((entry) => entry.code === code);
  if (item) return state.language === 'en' ? item.name_en : item.name_zh;
  const key = 'coverage.' + String(code).toLowerCase();
  const localized = t(key);
  return localized !== key ? localized : code;
}
function activeJurisdictionCodes() {
  return state.jurisdictions.filter((entry) => entry.active).map((entry) => entry.code);
}

async function api(path, options) {
  const response = await fetch(path, options);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || (state.language === 'en' ? 'Request failed. Please try again.' : '请求失败，请稍后重试。'));
  return payload;
}

// ---- 路由常量与状态 ----
const DEFAULT_TITLE = document.title;
const DETAIL_PREFIX = '/regulations/';
const LEGACY_PATHS = { home: '/', library: '/library', timeline: '/timeline', subscribe: '/subscribe' };
let initialized = false;
let currentViewUrl = '/';
let detailContext = null; // { id, previousUrl, previousTitle, trigger }

function applyTranslations() {
  document.documentElement.lang = state.language === 'en' ? 'en' : 'zh-CN';
  document.querySelectorAll('[data-i18n]').forEach((node) => { node.innerHTML = t(node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => { node.placeholder = t(node.dataset.i18nPlaceholder); });
  document.querySelectorAll('[data-i18n-aria]').forEach((node) => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
  const toggle = document.querySelector('#language-toggle');
  toggle.textContent = state.language === 'en' ? '中文' : 'EN';
  toggle.setAttribute('aria-label', state.language === 'en' ? '切换到中文' : 'Switch to English');
  if (state.updates.length) { renderLatest(); renderTimeline(); }
  if (state.regulations.length) renderRegulations(state.regulations.length);
  renderJurisdictionFilters();
  renderSubscriptionJurisdictionChoices();
  updatePendingBanner();
}

function formatDate(value) {
  return value ? new Intl.DateTimeFormat(state.language === 'en' ? 'en-GB' : 'zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(`${value}T00:00:00Z`)) : '—';
}
function skeletons(count = 3) { return Array.from({ length: count }, () => '<div class="skeleton"></div>').join(''); }
function errorCard(message, retryKey) {
  return `<div class="error-state" role="alert"><p>${escapeHtml(message)}</p><button type="button" class="retry-button" data-retry="${escapeHtml(retryKey)}">${escapeHtml(t('retry'))}</button></div>`;
}
function renderSkeletons() {
  document.querySelector('#latest-updates').innerHTML = skeletons(4);
  document.querySelector('#regulation-grid').innerHTML = skeletons(6);
  document.querySelector('#timeline-list').innerHTML = skeletons(5);
}

// ---- 路由（History API + 深链 + 旧 hash 兼容） ----
function parseRoute() {
  if (location.hash) {
    const raw = location.hash.slice(1);
    const qi = raw.indexOf('?');
    const hashPath = qi === -1 ? raw : raw.slice(0, qi);
    const hashQuery = qi === -1 ? '' : raw.slice(qi + 1);
    if (Object.hasOwn(LEGACY_PATHS, hashPath)) {
      return { path: LEGACY_PATHS[hashPath], query: hashQuery, legacy: true };
    }
    if (hashPath.startsWith('regulations/')) {
      return { path: '/' + hashPath, query: hashQuery, legacy: true };
    }
    return null; // 非路由 hash（如 skip link 的 #main），忽略
  }
  return { path: location.pathname, query: location.search.slice(1), legacy: false };
}

function viewForPath(path) {
  if (path === '/library') return 'library';
  if (path === '/timeline') return 'timeline';
  if (path === '/subscribe') return 'subscribe';
  return 'home';
}

function showView(name) {
  const view = document.querySelector(`[data-view="${name}"]`) || document.querySelector('[data-view="home"]');
  document.querySelectorAll('.view').forEach((item) => item.classList.toggle('active', item === view));
  document.querySelectorAll('[data-nav]').forEach((item) => item.classList.toggle('active', item.dataset.nav === view.dataset.view));
  document.querySelector('.topbar nav').classList.remove('open');
  document.querySelector('.menu-button').setAttribute('aria-expanded', 'false');
  window.scrollTo({ top: 0, behavior: 'instant' });
  return view.dataset.view;
}

function hideDetailOverlay() {
  const overlay = document.querySelector('#detail-overlay');
  if (!overlay.hidden) { overlay.hidden = true; document.body.style.overflow = ''; }
  detailContext = null;
}

function syncMeta() {
  const url = location.origin + location.pathname + location.search;
  const canonical = document.querySelector('link[rel="canonical"]');
  const ogUrl = document.querySelector('meta[property="og:url"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (canonical) canonical.setAttribute('href', url);
  if (ogUrl) ogUrl.setAttribute('content', url);
  if (ogTitle) ogTitle.setAttribute('content', document.title);
}

function route() {
  const parsed = parseRoute();
  if (!parsed) return;
  if (parsed.legacy) history.replaceState(null, '', parsed.path + (parsed.query ? '?' + parsed.query : ''));
  if (parsed.path.startsWith(DETAIL_PREFIX)) {
    showView('home'); // 深链打开详情时以首页为底层视图，并同步 nav 高亮
    openRegulation(decodeURIComponent(parsed.path.slice(DETAIL_PREFIX.length)), null);
    return;
  }
  hideDetailOverlay();
  document.title = DEFAULT_TITLE;
  const viewName = viewForPath(parsed.path);
  showView(viewName);
  currentViewUrl = location.pathname + location.search;
  if (viewName === 'library') restoreFiltersFromUrl(parsed.query);
  else if (viewName === 'subscribe' && parsed.query) restoreFromEmailLink(parsed.query);
  syncMeta();
}

function navigateTo(path) {
  if (path === location.pathname + location.search) return;
  history.pushState(null, '', path);
  route();
}

// ---- 数据加载与错误态 ----
function setBanner(visible) {
  const banner = document.querySelector('#global-banner');
  if (!banner) return;
  banner.hidden = !visible;
  banner.innerHTML = visible ? `<span>${escapeHtml(t('offline.title'))}</span><button type="button" class="banner-retry" data-retry="health">${escapeHtml(t('retry'))}</button>` : '';
}

async function loadHealth() {
  try {
    const data = await api('/api/health');
    document.querySelector('#stat-regulations').textContent = data.regulations;
    document.querySelector('#stat-articles').textContent = data.articles;
    document.querySelector('#stat-updates').textContent = data.updates;
    setBanner(false);
  } catch (error) {
    setBanner(true);
  }
}

async function loadTaxonomy() {
  try {
    const { data } = await api('/api/taxonomy');
    const industry = document.querySelector('#industry-filter');
    const topic = document.querySelector('#topic-filter');
    industry.replaceChildren(new Option(t('filter.allIndustries'), ''), ...data.industries.map((value) => new Option(label(value), value)));
    topic.replaceChildren(new Option(t('filter.allTopics'), ''), ...data.topics.map((value) => new Option(label(value), value)));
    applyLibraryFilterControls();
  } catch (error) { /* 分类选项加载失败时静默保留默认选项，不阻塞主流程 */ }
}

// ---- 法域（/api/jurisdictions，多选） ----
async function loadJurisdictions() {
  try {
    const { data } = await api('/api/jurisdictions');
    state.jurisdictions = data;
  } catch (error) {
    state.jurisdictions = FALLBACK_JURISDICTIONS; // 优雅降级：HK/SG
  }
  if (!state.subscriptionJurisdictions.length) state.subscriptionJurisdictions = activeJurisdictionCodes();
  renderJurisdictionFilters();
  renderSubscriptionJurisdictionChoices();
}
function renderJurisdictionFilters() {
  const active = state.jurisdictions.filter((entry) => entry.active);
  const libraryChips = document.querySelector('#library-jurisdiction-chips');
  const timelineChips = document.querySelector('#timeline-jurisdiction-chips');
  if (libraryChips) {
    libraryChips.innerHTML = active.map((entry) => `<button type="button" class="chip" data-jurisdiction="${escapeHtml(entry.code)}">${escapeHtml(jurisdictionName(entry.code))}</button>`).join('');
  }
  if (timelineChips) {
    timelineChips.innerHTML = active.map((entry) => `<button type="button" class="chip" data-timeline-jurisdiction="${escapeHtml(entry.code)}">${escapeHtml(jurisdictionName(entry.code))}</button>`).join('');
  }
  applyLibraryFilterControls();
  applyTimelineFilterControls();
}
function applyTimelineFilterControls() {
  document.querySelectorAll('[data-timeline-jurisdiction]').forEach((button) => {
    button.classList.toggle('active', button.dataset.timelineJurisdiction === (state.timelineJurisdiction || ''));
  });
}
function renderSubscriptionJurisdictionChoices() {
  const container = document.querySelector('#subscription-jurisdiction-choices');
  if (!container) return;
  const active = activeJurisdictionCodes();
  const selected = new Set(state.subscriptionJurisdictions);
  const allSelected = active.length > 0 && active.every((code) => selected.has(code));
  container.innerHTML = `<button type="button" class="chip jurisdiction-choice ${allSelected ? 'active' : ''}" data-jurisdiction-all="1" aria-pressed="${allSelected}">${escapeHtml(t('subscribe.selectAll'))}</button>` +
    active.map((code) => `<button type="button" class="chip jurisdiction-choice ${selected.has(code) ? 'active' : ''}" data-jurisdiction-choice="${escapeHtml(code)}" aria-pressed="${selected.has(code)}">${escapeHtml(jurisdictionName(code))}</button>`).join('');
}
function toggleSubscriptionJurisdiction(code) {
  const set = new Set(state.subscriptionJurisdictions);
  if (set.has(code)) set.delete(code); else set.add(code);
  state.subscriptionJurisdictions = [...set];
  renderSubscriptionJurisdictionChoices();
}
function toggleSubscriptionAll() {
  const active = activeJurisdictionCodes();
  const allSelected = active.length > 0 && active.every((code) => state.subscriptionJurisdictions.includes(code));
  state.subscriptionJurisdictions = allSelected ? [] : [...active];
  renderSubscriptionJurisdictionChoices();
}

async function loadUpdates() {
  try {
    const payload = await api('/api/updates');
    const next = payload.data;
    if (JSON.stringify(state.updates) === JSON.stringify(next)) return; // 无变化则跳过重渲染
    state.updates = next;
    renderLatest();
    renderTimeline();
  } catch (error) {
    renderUpdatesError(error.message);
  }
}
function renderLatest() {
  document.querySelector('#latest-updates').innerHTML = state.updates.slice(0, 5).map((item) => `
    <article class="signal-item" data-update-regulation="${escapeHtml(item.regulationId || '')}" tabindex="0">
      <time>${escapeHtml(item.eventDate.replaceAll('-', '.'))}</time><span class="signal-tag">${escapeHtml(item.jurisdiction)}</span>
      <div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(state.language === 'zh' ? item.summaryZh : item.summary)}</p></div><i>↗</i>
    </article>`).join('');
}
function renderTimeline() {
  const items = state.timelineJurisdiction ? state.updates.filter((item) => item.jurisdiction === state.timelineJurisdiction) : state.updates;
  document.querySelector('#timeline-list').innerHTML = items.map((item) => `
    <article class="timeline-item ${escapeHtml(item.importance)}"><time class="timeline-date">${escapeHtml(item.eventDate.replaceAll('-', '.'))}</time>
      <div class="timeline-content"><div class="timeline-meta"><span>${escapeHtml(item.jurisdiction)}</span><span>${escapeHtml(eventLabels[state.language][item.eventType] || item.eventType)}</span></div>
      <h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(state.language === 'zh' ? item.summaryZh : item.summary)}</p>
      <div class="keywords">${item.industries.map((value) => `<span>${escapeHtml(label(value))}</span>`).join('')}</div>
      <a class="source-link" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(item.sourceName)} · ${state.language === 'en' ? 'official source' : '查看原文'} ↗</a></div>
    </article>`).join('') || `<div class="empty-state">${state.language === 'en' ? 'No updates for this jurisdiction.' : '该法域暂无更新记录。'}</div>`;
}
function renderUpdatesError(message) {
  const card = errorCard(message, 'updates');
  document.querySelector('#latest-updates').innerHTML = card;
  document.querySelector('#timeline-list').innerHTML = card;
}

// ---- 法规库：筛选状态与 URL query 同步 ----
const LIBRARY_KEYS = ['jurisdiction', 'industry', 'topic', 'type'];
function libraryQueryFromState() {
  const params = new URLSearchParams();
  for (const key of LIBRARY_KEYS) if (state[key]) params.set(key, state[key]);
  if (state.query) params.set('q', state.query);
  return params.toString();
}
function syncLibraryUrl() {
  if (viewForPath(location.pathname) !== 'library') return; // 仅在法规库视图同步 URL，避免残留计时器改错路径
  const query = libraryQueryFromState();
  const url = '/library' + (query ? '?' + query : '');
  currentViewUrl = url;
  history.replaceState(null, '', url);
  syncMeta();
}
function applyLibraryFilterControls() {
  document.querySelectorAll('[data-jurisdiction]').forEach((button) => {
    button.classList.toggle('active', button.dataset.jurisdiction === (state.jurisdiction || ''));
  });
  document.querySelector('#industry-filter').value = state.industry || '';
  document.querySelector('#topic-filter').value = state.topic || '';
  document.querySelector('#type-filter').value = state.type || '';
  document.querySelector('#reg-search').value = state.query || '';
}
function restoreFiltersFromUrl(queryString) {
  const params = new URLSearchParams(queryString);
  for (const key of LIBRARY_KEYS) if (params.has(key)) state[key] = params.get(key);
  if (params.has('q')) state.query = params.get('q');
  applyLibraryFilterControls();
  syncLibraryUrl();
  if (initialized) loadRegulations();
}

let regulationsRequestId = 0;
async function loadRegulations() {
  const requestId = ++regulationsRequestId;
  try {
    const params = new URLSearchParams();
    for (const key of LIBRARY_KEYS) if (state[key]) params.set(key, state[key]);
    if (state.query) params.set('q', state.query);
    const payload = await api(`/api/regulations?${params}`);
    if (requestId !== regulationsRequestId) return; // 过期响应丢弃，避免旧结果覆盖新筛选
    state.regulations = payload.data;
    renderRegulations(payload.total);
  } catch (error) {
    if (requestId !== regulationsRequestId) return;
    document.querySelector('#regulation-grid').innerHTML = errorCard(error.message, 'regulations');
    document.querySelector('#result-count').textContent = '';
  }
}
function renderRegulations(total) {
  document.querySelector('#result-count').textContent = state.language === 'en' ? `${total} verified records` : `${total} 条已核验记录`;
  document.querySelector('#regulation-grid').innerHTML = state.regulations.map((item, index) => `
    <article class="reg-card ${index === 0 && !state.query && !state.type && !state.industry && !state.topic ? 'featured' : ''}" data-regulation-id="${escapeHtml(item.id)}" data-code="${escapeHtml(item.jurisdiction)}" tabindex="0">
      <div class="card-top"><span class="jurisdiction-badge">${escapeHtml(item.jurisdiction)}</span><span class="card-type">${escapeHtml(typeLabels[state.language][item.instrumentType] || item.instrumentType)}</span></div>
      <h2>${escapeHtml(item.shortTitle)}</h2><p>${escapeHtml(item.summary)}</p>
      <div class="keywords">${[...item.industries, ...item.topics.slice(0, 2)].map((value) => `<span>${escapeHtml(label(value))}</span>`).join('')}</div>
      <div class="card-bottom"><span>${state.language === 'en' ? 'Version' : '版本'} ${escapeHtml(item.currentVersionDate || item.effectiveDate || '—')}</span><b>${state.language === 'en' ? 'Open record' : '打开记录'} ↗</b></div>
    </article>`).join('') || `<div class="empty-state"><b>${state.language === 'en' ? 'No matching records' : '没有匹配记录'}</b><p>${state.language === 'en' ? 'Try fewer keywords or change a classification filter.' : '请减少关键词或切换分类筛选。'}</p></div>`;
}

// ---- 详情抽屉（含 focus trap 与深链） ----
async function openRegulation(id, trigger) {
  if (!id) return;
  const overlay = document.querySelector('#detail-overlay');
  const content = document.querySelector('#detail-content');
  if (!overlay.hidden && detailContext?.id === id) return;
  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
  content.innerHTML = skeletons(4);
  detailContext = {
    id,
    previousUrl: location.pathname.startsWith(DETAIL_PREFIX) ? (currentViewUrl || '/') : (location.pathname + location.search),
    previousTitle: document.title,
    trigger
  };
  const detailPath = DETAIL_PREFIX + encodeURIComponent(id);
  if (location.pathname !== detailPath) history.replaceState(null, '', detailPath);
  try {
    const { data } = await api(`/api/regulations/${encodeURIComponent(id)}`);
    content.innerHTML = `<div class="detail-kicker"><span>${escapeHtml(data.jurisdiction)}</span><span>${escapeHtml(typeLabels[state.language][data.instrumentType] || data.instrumentType)}</span><span>${escapeHtml(data.status)}</span></div>
      <h1 id="detail-title">${escapeHtml(data.title)}</h1><p class="detail-summary">${escapeHtml(data.summary)}</p>
      <div class="keywords">${[...data.industries, ...data.topics].map((value) => `<span>${escapeHtml(label(value))}</span>`).join('')}</div>
      <div class="detail-facts"><div><small>${state.language === 'en' ? 'Authority' : '发布机关'}</small><b>${escapeHtml(data.issuingBody)}</b></div><div><small>${state.language === 'en' ? 'Current version' : '当前版本'}</small><b>${escapeHtml(data.currentVersionDate || '—')}</b></div><div><small>${state.language === 'en' ? 'Effective' : '生效日期'}</small><b>${escapeHtml(formatDate(data.effectiveDate))}</b></div><div><small>${state.language === 'en' ? 'Source checked' : '来源核验'}</small><b>${escapeHtml(data.sourceCheckedAt.slice(0, 10))}</b></div></div>
      <section class="detail-section"><h2>${state.language === 'en' ? 'Structured obligations' : '结构化义务'}</h2>${data.articles.length ? data.articles.map((article) => `<article class="article"><h3><span>${escapeHtml(article.provisionNumber)}</span>${escapeHtml(article.heading)}</h3><p>${escapeHtml(article.textSummary)}</p><div class="keywords">${article.keywords.map((keyword) => `<span>${escapeHtml(label(keyword))}</span>`).join('')}</div></article>`).join('') : `<p>${state.language === 'en' ? 'Tracked at instrument level; provision decomposition is pending.' : '当前按文书级追踪，条文拆分待补。'}</p>`}</section>
      <a class="button primary official-button" href="${escapeHtml(data.sourceUrl)}" target="_blank" rel="noopener">${state.language === 'en' ? 'Open' : '前往'} ${escapeHtml(data.sourceName)} <span>↗</span></a>`;
    document.title = data.title;
    syncMeta();
    document.querySelector('#detail-close').focus();
  } catch (error) { content.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`; }
}
function closeDetail() {
  const overlay = document.querySelector('#detail-overlay');
  if (overlay.hidden) return;
  overlay.hidden = true;
  document.body.style.overflow = '';
  const ctx = detailContext;
  if (ctx) {
    if (location.pathname.startsWith(DETAIL_PREFIX)) history.replaceState(null, '', ctx.previousUrl || '/');
    document.title = ctx.previousTitle || DEFAULT_TITLE;
    if (ctx.trigger && document.contains(ctx.trigger) && typeof ctx.trigger.focus === 'function') ctx.trigger.focus();
  }
  detailContext = null;
  syncMeta();
}
function trapFocus(event) {
  const drawer = document.querySelector('#detail-overlay .detail-drawer');
  const focusables = [...drawer.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((el) => el.offsetParent !== null);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && (document.activeElement === first || !drawer.contains(document.activeElement))) {
    event.preventDefault(); last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !drawer.contains(document.activeElement))) {
    event.preventDefault(); first.focus();
  }
}

// ---- 简报预览 ----
async function loadBriefingPreview() {
  try {
    const { data } = await api('/api/briefings/preview');
    document.querySelector('#briefing-preview-body').textContent = `${data.subject}\n${data.schedule.label}\n\n${data.text}`;
  } catch (error) {
    document.querySelector('#briefing-preview-body').innerHTML = errorCard(error.message, 'briefing');
  }
}

// ---- 订阅（含双重确认提示） ----
function restoreSubscription() {
  if (!state.subscriber) { updatePendingBanner(); return; }
  const form = document.querySelector('#subscription-form');
  form.querySelector('#email').value = state.subscriber.email; form.querySelector('#email').disabled = true;
  form.querySelector('#daily-briefing').checked = state.subscriber.dailyBriefing; form.querySelector('#update-alert').checked = state.subscriber.updateAlert;
  // 法域回显：优先 jurisdictions 数组，兼容旧 jurisdictionPlan 三档。
  const jurisdictions = Array.isArray(state.subscriber.jurisdictions) && state.subscriber.jurisdictions.length
    ? state.subscriber.jurisdictions
    : (state.subscriber.jurisdictionPlan === 'HK' ? ['HK'] : state.subscriber.jurisdictionPlan === 'SG' ? ['SG'] : activeJurisdictionCodes());
  state.subscriptionJurisdictions = [...jurisdictions];
  renderSubscriptionJurisdictionChoices();
  document.querySelector('#manage-actions').hidden = false; document.querySelector('#subscriber-id').textContent = state.subscriber.id;
  updatePendingBanner();
}
function updatePendingBanner() {
  const banner = document.querySelector('#pending-confirmation');
  if (!banner) return;
  const pending = state.subscriber?.pendingConfirmation === true;
  banner.hidden = !pending;
  if (pending) banner.textContent = t('subscribe.pendingConfirm');
}
async function restoreFromEmailLink(queryString) {
  const params = new URLSearchParams(queryString);
  const subscriber = params.get('subscriber'); const token = params.get('token');
  if (!subscriber || !token || state.subscriber?.id === subscriber) return;
  const feedback = document.querySelector('#subscription-feedback');
  try {
    const { data } = await api(`/api/subscribers/${encodeURIComponent(subscriber)}?token=${encodeURIComponent(token)}`);
    state.subscriber = { ...data, manageToken: token }; localStorage.setItem('dataTraceSubscriber', JSON.stringify(state.subscriber)); restoreSubscription();
    feedback.className = 'feedback success'; feedback.textContent = params.get('action') === 'unsubscribe' ? (state.language === 'en' ? 'Subscription loaded. Use Unsubscribe below to confirm.' : '已载入订阅，请点击下方“取消订阅”确认。') : (state.language === 'en' ? 'Subscription loaded from your private link.' : '已通过专属链接载入订阅。');
  } catch (error) { feedback.className = 'feedback error'; feedback.textContent = error.message; }
}
function formPreferences() {
  return {
    dailyBriefing: document.querySelector('#daily-briefing').checked,
    updateAlert: document.querySelector('#update-alert').checked,
    jurisdictions: activeJurisdictionCodes().filter((code) => state.subscriptionJurisdictions.includes(code))
  };
}
async function submitSubscription(event) {
  event.preventDefault(); const feedback = document.querySelector('#subscription-feedback'); const button = event.currentTarget.querySelector('.submit-button');
  feedback.className = 'feedback'; feedback.textContent = state.language === 'en' ? 'Saving…' : '正在保存…'; button.disabled = true;
  try {
    const preferences = formPreferences(); let payload; const isUpdate = Boolean(state.subscriber);
    if (!preferences.jurisdictions.length) { feedback.className = 'feedback error'; feedback.textContent = t('subscribe.selectJurisdiction'); return; }
    if (isUpdate) {
      payload = await api(`/api/subscribers/${state.subscriber.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json', 'x-manage-token': state.subscriber.manageToken }, body: JSON.stringify(preferences) });
      state.subscriber = { ...payload.data, manageToken: state.subscriber.manageToken };
    } else {
      payload = await api('/api/subscribers', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: document.querySelector('#email').value, ...preferences }) });
      state.subscriber = { ...payload.data, manageToken: payload.manageToken };
    }
    localStorage.setItem('dataTraceSubscriber', JSON.stringify(state.subscriber));
    feedback.className = 'feedback success';
    feedback.textContent = isUpdate ? t('subscribe.saved') : t('subscribe.confirm');
    restoreSubscription();
  } catch (error) { feedback.className = 'feedback error'; feedback.textContent = error.message; } finally { button.disabled = false; }
}
async function unsubscribe() {
  if (!state.subscriber) return; const feedback = document.querySelector('#subscription-feedback');
  try {
    await api(`/api/subscribers/${state.subscriber.id}`, { method: 'DELETE', headers: { 'x-manage-token': state.subscriber.manageToken } });
    localStorage.removeItem('dataTraceSubscriber'); state.subscriber = null; document.querySelector('#email').disabled = false; document.querySelector('#manage-actions').hidden = true;
    updatePendingBanner();
    feedback.className = 'feedback success'; feedback.textContent = state.language === 'en' ? 'Subscription cancelled.' : '订阅已取消。';
  } catch (error) { feedback.className = 'feedback error'; feedback.textContent = error.message; }
}

// ---- 实时刷新（轮询 + 可见性） ----
async function refreshLive() {
  await Promise.allSettled([loadHealth(), loadUpdates()]);
}
function startPolling() {
  window.setInterval(refreshLive, 5 * 60 * 1000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refreshLive(); });
}

// ---- 事件绑定 ----
let searchTimer;
function bindEvents() {
  window.addEventListener('popstate', route);
  window.addEventListener('hashchange', route);
  document.querySelector('#language-toggle').addEventListener('click', async () => { state.language = state.language === 'en' ? 'zh' : 'en'; localStorage.setItem('dataTraceLanguage', state.language); applyTranslations(); await loadTaxonomy(); });
  document.querySelector('.menu-button').addEventListener('click', (event) => { const nav = document.querySelector('.topbar nav'); nav.classList.toggle('open'); event.currentTarget.setAttribute('aria-expanded', String(nav.classList.contains('open'))); });
  document.querySelector('#reg-search').addEventListener('input', (event) => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { state.query = event.target.value.trim(); syncLibraryUrl(); loadRegulations(); }, 220); });
  for (const key of ['industry', 'topic', 'type']) document.querySelector(`#${key}-filter`).addEventListener('change', (event) => { state[key] = event.target.value; syncLibraryUrl(); loadRegulations(); });
  document.querySelectorAll('[data-jurisdiction-jump]').forEach((button) => button.addEventListener('click', () => { navigateTo('/library?jurisdiction=' + encodeURIComponent(button.dataset.jurisdictionJump)); }));
  document.addEventListener('click', (event) => {
    const retry = event.target.closest('[data-retry]');
    if (retry) { event.preventDefault(); const loaders = { health: loadHealth, updates: loadUpdates, regulations: loadRegulations, briefing: loadBriefingPreview }; if (loaders[retry.dataset.retry]) loaders[retry.dataset.retry](); return; }
    const link = event.target.closest('a[href]');
    if (link) { const href = link.getAttribute('href'); if (href && href.startsWith('/')) { event.preventDefault(); navigateTo(href); return; } }
    const choice = event.target.closest('[data-jurisdiction-choice]');
    if (choice) { toggleSubscriptionJurisdiction(choice.dataset.jurisdictionChoice); return; }
    const allChoice = event.target.closest('[data-jurisdiction-all]');
    if (allChoice) { toggleSubscriptionAll(); return; }
    const jurisdictionChip = event.target.closest('[data-jurisdiction]');
    if (jurisdictionChip) { state.jurisdiction = jurisdictionChip.dataset.jurisdiction; applyLibraryFilterControls(); syncLibraryUrl(); loadRegulations(); return; }
    const timelineChip = event.target.closest('[data-timeline-jurisdiction]');
    if (timelineChip) { state.timelineJurisdiction = timelineChip.dataset.timelineJurisdiction; applyTimelineFilterControls(); renderTimeline(); return; }
    const card = event.target.closest('[data-regulation-id]'); if (card) { openRegulation(card.dataset.regulationId, card); return; }
    const update = event.target.closest('[data-update-regulation]'); if (update?.dataset.updateRegulation) { openRegulation(update.dataset.updateRegulation, update); return; }
  });
  document.addEventListener('keydown', (event) => {
    const overlay = document.querySelector('#detail-overlay');
    if (!overlay.hidden) {
      if (event.key === 'Escape') { event.preventDefault(); closeDetail(); return; }
      if (event.key === 'Tab') { trapFocus(event); return; }
    } else if (event.key === 'Enter') {
      const card = event.target.closest('[data-regulation-id]'); if (card) openRegulation(card.dataset.regulationId, card);
    }
  });
  document.querySelector('#detail-close').addEventListener('click', closeDetail);
  document.querySelector('.overlay-backdrop').addEventListener('click', closeDetail);
  document.querySelector('#subscription-form').addEventListener('submit', submitSubscription);
  document.querySelector('#unsubscribe-button').addEventListener('click', unsubscribe);
}

async function init() {
  renderSkeletons();
  bindEvents();
  applyTranslations();
  await loadJurisdictions();
  restoreSubscription();
  route();
  initialized = true;
  startPolling();
  await Promise.allSettled([loadHealth(), loadTaxonomy(), loadUpdates(), loadRegulations(), loadBriefingPreview()]);
}
init();
