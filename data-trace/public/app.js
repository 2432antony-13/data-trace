const state = {
  regulations: [], updates: [], jurisdiction: '', industry: '', topic: '', type: '', query: '', timelineJurisdiction: '',
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
    'subscribe.title': 'Do not leave change<br>inside the browser.', 'subscribe.body': 'Choose a fixed jurisdiction plan and delivery mode. Daily briefings run at 08:00 Beijing time; high-impact alerts are prepared immediately.',
    'subscribe.settings': 'Subscription settings', 'subscribe.email': 'Work email', 'subscribe.delivery': 'Delivery',
    'subscribe.daily': 'Daily briefing', 'subscribe.dailyNote': 'Every day at 08:00 Beijing time', 'subscribe.alert': 'Regulatory update alert', 'subscribe.alertNote': 'Immediate delivery for new or amended rules',
    'subscribe.plan': 'Jurisdiction plan', 'plan.hk': 'Hong Kong only', 'plan.sg': 'Singapore only', 'plan.all': 'All jurisdictions',
    'subscribe.save': 'Save subscription', 'subscribe.fine': 'Each email contains recipient-specific management and unsubscribe links. No marketing mail.', 'subscribe.unsubscribe': 'Unsubscribe',
    'footer.note': 'Hong Kong + Singapore pilot · source check 2026-08-09<br>Tracking information only; not legal advice.'
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
    'subscribe.title': '别让变化<br>停在浏览器里。', 'subscribe.body': '选择固定法域方案与触达方式。每日简报在北京时间 8:00 生成，高影响修订与新规即时生成 alert。',
    'subscribe.settings': '订阅设置', 'subscribe.email': '工作邮箱', 'subscribe.delivery': '接收内容',
    'subscribe.daily': '每日简报', 'subscribe.dailyNote': '北京时间每天 8:00', 'subscribe.alert': '法规更新 Alert', 'subscribe.alertNote': '新规或修订即时触达',
    'subscribe.plan': '法域方案', 'plan.hk': '仅香港', 'plan.sg': '仅新加坡', 'plan.all': '全部',
    'subscribe.save': '保存订阅', 'subscribe.fine': '每封邮件均含收件人专属管理和退订链接；不发送营销信息。', 'subscribe.unsubscribe': '取消订阅',
    'footer.note': '香港 + 新加坡试点 · 来源核验于 2026-08-09<br>信息仅用于法规追踪，不构成法律意见。'
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

async function api(path, options) {
  const response = await fetch(path, options);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || (state.language === 'en' ? 'Request failed. Please try again.' : '请求失败，请稍后重试。'));
  return payload;
}

function applyTranslations() {
  document.documentElement.lang = state.language === 'en' ? 'en' : 'zh-CN';
  document.querySelectorAll('[data-i18n]').forEach((node) => { node.innerHTML = t(node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => { node.placeholder = t(node.dataset.i18nPlaceholder); });
  const toggle = document.querySelector('#language-toggle');
  toggle.textContent = state.language === 'en' ? '中文' : 'EN';
  toggle.setAttribute('aria-label', state.language === 'en' ? '切换到中文' : 'Switch to English');
  if (state.updates.length) { renderLatest(); renderTimeline(); }
  if (state.regulations.length) renderRegulations(state.regulations.length);
}

function formatDate(value) {
  return value ? new Intl.DateTimeFormat(state.language === 'en' ? 'en-GB' : 'zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(`${value}T00:00:00Z`)) : '—';
}
function skeletons(count = 3) { return Array.from({ length: count }, () => '<div class="skeleton"></div>').join(''); }

function route() {
  const target = (location.hash || '#home').slice(1).split(/[/?]/)[0];
  const view = document.querySelector(`[data-view="${target}"]`) || document.querySelector('[data-view="home"]');
  document.querySelectorAll('.view').forEach((item) => item.classList.toggle('active', item === view));
  document.querySelectorAll('[data-nav]').forEach((item) => item.classList.toggle('active', item.dataset.nav === view.dataset.view));
  document.querySelector('.topbar nav').classList.remove('open');
  document.querySelector('.menu-button').setAttribute('aria-expanded', 'false');
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (target === 'subscribe') restoreFromEmailLink();
}

async function loadHealth() {
  const data = await api('/api/health');
  document.querySelector('#stat-regulations').textContent = data.regulations;
  document.querySelector('#stat-articles').textContent = data.articles;
  document.querySelector('#stat-updates').textContent = data.updates;
}

async function loadTaxonomy() {
  const { data } = await api('/api/taxonomy');
  const industry = document.querySelector('#industry-filter');
  const topic = document.querySelector('#topic-filter');
  industry.replaceChildren(new Option(t('filter.allIndustries'), ''), ...data.industries.map((value) => new Option(label(value), value)));
  topic.replaceChildren(new Option(t('filter.allTopics'), ''), ...data.topics.map((value) => new Option(label(value), value)));
}

async function loadUpdates() {
  const payload = await api('/api/updates'); state.updates = payload.data; renderLatest(); renderTimeline();
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

async function loadRegulations() {
  const params = new URLSearchParams();
  for (const key of ['jurisdiction', 'industry', 'topic', 'type']) if (state[key]) params.set(key, state[key]);
  if (state.query) params.set('q', state.query);
  const payload = await api(`/api/regulations?${params}`); state.regulations = payload.data; renderRegulations(payload.total);
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

async function openRegulation(id) {
  if (!id) return;
  const overlay = document.querySelector('#detail-overlay'); const content = document.querySelector('#detail-content');
  overlay.hidden = false; document.body.style.overflow = 'hidden'; content.innerHTML = skeletons(4);
  try {
    const { data } = await api(`/api/regulations/${encodeURIComponent(id)}`);
    content.innerHTML = `<div class="detail-kicker"><span>${escapeHtml(data.jurisdiction)}</span><span>${escapeHtml(typeLabels[state.language][data.instrumentType] || data.instrumentType)}</span><span>${escapeHtml(data.status)}</span></div>
      <h1 id="detail-title">${escapeHtml(data.title)}</h1><p class="detail-summary">${escapeHtml(data.summary)}</p>
      <div class="keywords">${[...data.industries, ...data.topics].map((value) => `<span>${escapeHtml(label(value))}</span>`).join('')}</div>
      <div class="detail-facts"><div><small>${state.language === 'en' ? 'Authority' : '发布机关'}</small><b>${escapeHtml(data.issuingBody)}</b></div><div><small>${state.language === 'en' ? 'Current version' : '当前版本'}</small><b>${escapeHtml(data.currentVersionDate || '—')}</b></div><div><small>${state.language === 'en' ? 'Effective' : '生效日期'}</small><b>${escapeHtml(formatDate(data.effectiveDate))}</b></div><div><small>${state.language === 'en' ? 'Source checked' : '来源核验'}</small><b>${escapeHtml(data.sourceCheckedAt.slice(0, 10))}</b></div></div>
      <section class="detail-section"><h2>${state.language === 'en' ? 'Structured obligations' : '结构化义务'}</h2>${data.articles.length ? data.articles.map((article) => `<article class="article"><h3><span>${escapeHtml(article.provisionNumber)}</span>${escapeHtml(article.heading)}</h3><p>${escapeHtml(article.textSummary)}</p><div class="keywords">${article.keywords.map((keyword) => `<span>${escapeHtml(label(keyword))}</span>`).join('')}</div></article>`).join('') : `<p>${state.language === 'en' ? 'Tracked at instrument level; provision decomposition is pending.' : '当前按文书级追踪，条文拆分待补。'}</p>`}</section>
      <a class="button primary official-button" href="${escapeHtml(data.sourceUrl)}" target="_blank" rel="noopener">${state.language === 'en' ? 'Open' : '前往'} ${escapeHtml(data.sourceName)} <span>↗</span></a>`;
    document.querySelector('#detail-close').focus();
  } catch (error) { content.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`; }
}
function closeDetail() { document.querySelector('#detail-overlay').hidden = true; document.body.style.overflow = ''; }

async function loadBriefingPreview() {
  const { data } = await api('/api/briefings/preview');
  document.querySelector('#briefing-preview-body').textContent = `${data.subject}\n${data.schedule.label}\n\n${data.text}`;
}
function restoreSubscription() {
  if (!state.subscriber) return;
  const form = document.querySelector('#subscription-form');
  form.querySelector('#email').value = state.subscriber.email; form.querySelector('#email').disabled = true;
  form.querySelector('#daily-briefing').checked = state.subscriber.dailyBriefing; form.querySelector('#update-alert').checked = state.subscriber.updateAlert;
  const plan = form.querySelector(`[name="jurisdiction-plan"][value="${state.subscriber.jurisdictionPlan || 'ALL'}"]`); if (plan) plan.checked = true;
  document.querySelector('#manage-actions').hidden = false; document.querySelector('#subscriber-id').textContent = state.subscriber.id;
}
async function restoreFromEmailLink() {
  const query = location.hash.split('?')[1]; if (!query) return;
  const params = new URLSearchParams(query); const subscriber = params.get('subscriber'); const token = params.get('token');
  if (!subscriber || !token || state.subscriber?.id === subscriber) return;
  const feedback = document.querySelector('#subscription-feedback');
  try {
    const { data } = await api(`/api/subscribers/${encodeURIComponent(subscriber)}?token=${encodeURIComponent(token)}`);
    state.subscriber = { ...data, manageToken: token }; localStorage.setItem('dataTraceSubscriber', JSON.stringify(state.subscriber)); restoreSubscription();
    feedback.className = 'feedback success'; feedback.textContent = params.get('action') === 'unsubscribe' ? (state.language === 'en' ? 'Subscription loaded. Use Unsubscribe below to confirm.' : '已载入订阅，请点击下方“取消订阅”确认。') : (state.language === 'en' ? 'Subscription loaded from your private link.' : '已通过专属链接载入订阅。');
  } catch (error) { feedback.className = 'feedback error'; feedback.textContent = error.message; }
}
function formPreferences() {
  return { dailyBriefing: document.querySelector('#daily-briefing').checked, updateAlert: document.querySelector('#update-alert').checked, jurisdictionPlan: document.querySelector('[name="jurisdiction-plan"]:checked')?.value };
}
async function submitSubscription(event) {
  event.preventDefault(); const feedback = document.querySelector('#subscription-feedback'); const button = event.currentTarget.querySelector('.submit-button');
  feedback.className = 'feedback'; feedback.textContent = state.language === 'en' ? 'Saving…' : '正在保存…'; button.disabled = true;
  try {
    const preferences = formPreferences(); let payload;
    if (state.subscriber) {
      payload = await api(`/api/subscribers/${state.subscriber.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json', 'x-manage-token': state.subscriber.manageToken }, body: JSON.stringify(preferences) });
      state.subscriber = { ...payload.data, manageToken: state.subscriber.manageToken };
    } else {
      payload = await api('/api/subscribers', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: document.querySelector('#email').value, ...preferences }) });
      state.subscriber = { ...payload.data, manageToken: payload.manageToken };
    }
    localStorage.setItem('dataTraceSubscriber', JSON.stringify(state.subscriber)); feedback.className = 'feedback success'; feedback.textContent = state.language === 'en' ? '✓ Subscription preferences saved.' : '✓ 订阅设置已持久保存。'; restoreSubscription();
  } catch (error) { feedback.className = 'feedback error'; feedback.textContent = error.message; } finally { button.disabled = false; }
}
async function unsubscribe() {
  if (!state.subscriber) return; const feedback = document.querySelector('#subscription-feedback');
  try {
    await api(`/api/subscribers/${state.subscriber.id}`, { method: 'DELETE', headers: { 'x-manage-token': state.subscriber.manageToken } });
    localStorage.removeItem('dataTraceSubscriber'); state.subscriber = null; document.querySelector('#email').disabled = false; document.querySelector('#manage-actions').hidden = true;
    feedback.className = 'feedback success'; feedback.textContent = state.language === 'en' ? 'Subscription cancelled.' : '订阅已取消。';
  } catch (error) { feedback.className = 'feedback error'; feedback.textContent = error.message; }
}

let searchTimer;
function bindEvents() {
  window.addEventListener('hashchange', route);
  document.querySelector('#language-toggle').addEventListener('click', async () => { state.language = state.language === 'en' ? 'zh' : 'en'; localStorage.setItem('dataTraceLanguage', state.language); applyTranslations(); await loadTaxonomy(); });
  document.querySelector('.menu-button').addEventListener('click', (event) => { const nav = document.querySelector('.topbar nav'); nav.classList.toggle('open'); event.currentTarget.setAttribute('aria-expanded', String(nav.classList.contains('open'))); });
  document.querySelector('#reg-search').addEventListener('input', (event) => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { state.query = event.target.value.trim(); loadRegulations(); }, 220); });
  document.querySelectorAll('[data-jurisdiction]').forEach((button) => button.addEventListener('click', () => { document.querySelectorAll('[data-jurisdiction]').forEach((item) => item.classList.remove('active')); button.classList.add('active'); state.jurisdiction = button.dataset.jurisdiction; loadRegulations(); }));
  for (const key of ['industry', 'topic', 'type']) document.querySelector(`#${key}-filter`).addEventListener('change', (event) => { state[key] = event.target.value; loadRegulations(); });
  document.querySelectorAll('[data-timeline-jurisdiction]').forEach((button) => button.addEventListener('click', () => { document.querySelectorAll('[data-timeline-jurisdiction]').forEach((item) => item.classList.remove('active')); button.classList.add('active'); state.timelineJurisdiction = button.dataset.timelineJurisdiction; renderTimeline(); }));
  document.querySelectorAll('[data-jurisdiction-jump]').forEach((button) => button.addEventListener('click', () => { state.jurisdiction = button.dataset.jurisdictionJump; document.querySelectorAll('[data-jurisdiction]').forEach((item) => item.classList.toggle('active', item.dataset.jurisdiction === state.jurisdiction)); location.hash = '#library'; loadRegulations(); }));
  document.addEventListener('click', (event) => { const card = event.target.closest('[data-regulation-id]'); if (card) openRegulation(card.dataset.regulationId); const update = event.target.closest('[data-update-regulation]'); if (update?.dataset.updateRegulation) openRegulation(update.dataset.updateRegulation); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeDetail(); if (event.key === 'Enter') { const card = event.target.closest('[data-regulation-id]'); if (card) openRegulation(card.dataset.regulationId); } });
  document.querySelector('#detail-close').addEventListener('click', closeDetail); document.querySelector('.overlay-backdrop').addEventListener('click', closeDetail);
  document.querySelector('#subscription-form').addEventListener('submit', submitSubscription); document.querySelector('#unsubscribe-button').addEventListener('click', unsubscribe);
}

async function init() {
  document.querySelector('#latest-updates').innerHTML = skeletons(4); document.querySelector('#regulation-grid').innerHTML = skeletons(6); document.querySelector('#timeline-list').innerHTML = skeletons(5);
  bindEvents(); applyTranslations(); route(); restoreSubscription();
  const results = await Promise.allSettled([loadHealth(), loadTaxonomy(), loadUpdates(), loadRegulations(), loadBriefingPreview()]);
  const failed = results.filter((item) => item.status === 'rejected'); if (failed.length) console.error('Initial data load failed', failed.map((item) => item.reason));
}
init();
