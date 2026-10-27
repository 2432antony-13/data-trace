// Only built-in display text passes through ui(); user input and source records are unchanged.
const traditionalCharacters = {"与": "與", "专": "專", "业": "業", "丢": "丟", "个": "個", "为": "為", "义": "義", "书": "書", "于": "於", "仅": "僅", "从": "從", "优": "優", "传": "傳", "体": "體", "关": "關", "内": "內", "况": "況", "减": "減", "击": "擊", "则": "則", "别": "別", "务": "務", "动": "動", "历": "歷", "双": "雙", "发": "發", "变": "變", "台": "臺", "号": "號", "后": "後", "响": "響", "图": "圖", "实": "實", "审": "審", "对": "對", "层": "層", "屉": "屜", "属": "屬", "师": "師", "并": "並", "库": "庫", "应": "應", "开": "開", "弃": "棄", "当": "當", "录": "錄", "径": "徑", "态": "態", "户": "戶", "报": "報", "拢": "攏", "择": "擇", "换": "換", "据": "據", "数": "數", "无": "無", "旧": "舊", "时": "時", "显": "顯", "暂": "暫", "机": "機", "权": "權", "条": "條", "来": "來", "构": "構", "档": "檔", "检": "檢", "残": "殘", "没": "沒", "泄": "洩", "浏": "瀏", "点": "點", "状": "狀", "电": "電", "监": "監", "盖": "蓋", "确": "確", "种": "種", "筛": "篩", "简": "簡", "类": "類", "级": "級", "纹": "紋", "线": "線", "组": "組", "终": "終", "绑": "綁", "结": "結", "络": "絡", "继": "繼", "续": "續", "网": "網", "营": "營", "补": "補", "见": "見", "规": "規", "视": "視", "览": "覽", "触": "觸", "计": "計", "订": "訂", "认": "認", "让": "讓", "记": "記", "设": "設", "证": "證", "词": "詞", "试": "試", "询": "詢", "该": "該", "详": "詳", "误": "誤", "请": "請", "读": "讀", "败": "敗", "踪": "蹤", "轨": "軌", "轮": "輪", "载": "載", "输": "輸", "达": "達", "过": "過", "进": "進", "迹": "跡", "选": "選", "邮": "郵", "采": "採", "里": "裡", "银": "銀", "链": "鏈", "销": "銷", "错": "錯", "键": "鍵", "间": "間", "阅": "閱", "险": "險", "静": "靜", "页": "頁", "项": "項", "颁": "頒", "预": "預", "题": "題", "风": "風", "验": "驗"};
const traditionalPhrases = {"已通过专属链接载入订阅。": "已透過專屬連結載入訂閱。", "尚无检查记录": "尚無檢查記錄", "结构化义务": "結構化義務", "订阅已取消。": "訂閱已取消。", "发布机关": "釋出機關", "查看原文": "檢視原文", "当前按文书级追踪，条文拆分待补。": "當前按文書級追蹤，條文拆分待補。", "最近检查": "最近檢查", "历史记录可继续浏览；来源检查成功不代表内容已完成人工审校。自动收录内容请核对官方原文。": "歷史記錄可繼續瀏覽；來源檢查成功不代表內容已完成人工審校。自動收錄內容請核對官方原文。", "已载入订阅，请点击下方“取消订阅”确认。": "已載入訂閱，請點選下方“取消訂閱”確認。", "来源核验": "來源核驗", "未匹配到条目，待核验": "未匹配到條目，待核驗", "当前版本": "當前版本", "来源与数据时效": "來源與資料時效", "最近成功采集": "最近成功採集", "打开记录": "開啟記錄", "来源不可用": "來源不可用", "采集可用": "採集可用", "该法域暂无更新记录。": "該法域暫無更新記錄。", "请减少关键词或切换分类筛选。": "請減少關鍵詞或切換分類篩選。", "来源状态暂不可读取，当前数据时效未确认。": "來源狀態暫不可讀取，當前資料時效未確認。", "正在保存…": "正在儲存…", "未确认": "未確認", "请求失败，请稍后重试。": "請求失敗，請稍後重試。", "没有匹配记录": "沒有匹配記錄", "检查中": "檢查中", "雷达": "雷達", "法规库": "法規庫", "更新线": "更新線", "订阅信号 ↗": "訂閱訊號 ↗", "让每一次<br><em>规则变化</em><br>留下轨迹。": "讓每一次<br><em>規則變化</em><br>留下軌跡。", "面向出海企业法务与数据合规律师的法规信号台，把原始法源、条文义务、修订事件和订阅触达收拢到一条可追溯的数据链。": "面向出海企業法務與資料合規律師的法規訊號臺，把原始法源、條文義務、修訂事件和訂閱觸達收攏到一條可追溯的資料鏈。", "进入法规库": "進入法規庫", "查看最新变化": "檢視最新變化", "法规与指南": "法規與指南", "历史事件": "歷史事件", "最新监管信号": "最新監管訊號", "完整时间线 →": "完整時間線 →", "法域覆盖": "法域覆蓋", "<b>来源可核验</b><br>每条记录保留发布机关、原文链接、版本日与内容指纹。": "<b>來源可核驗</b><br>每條記錄保留髮布機關、原文連結、版本日與內容指紋。", "法规，不只是一份 PDF。": "法規，不只是一份 PDF。", "按法域、行业、主题与文书层级定位规则；打开记录即可查看结构化义务、版本信息和权威原文。": "按法域、行業、主題與文書層級定位規則；開啟記錄即可檢視結構化義務、版本資訊和權威原文。", "搜索法规、义务或发布机关": "搜尋法規、義務或釋出機關", "全部行业": "全部行業", "全部主题": "全部主題", "全部文书类型": "全部文書型別", "附属法规": "附屬法規", "监管指引": "監管指引", "实务守则": "實務守則", "规则更新线": "規則更新線", "从生效、修订到指引发布，每个事件均回链至对应法规和官方来源。": "從生效、修訂到指引發布，每個事件均回鏈至對應法規和官方來源。", "高影响": "高影響", "中影响": "中影響", "常规更新": "常規更新", "别让变化<br>停在浏览器里。": "別讓變化<br>停在瀏覽器裡。", "选择一个或多个法域与触达方式。每日简报在北京时间 8:00 生成，高影响修订与新规即时生成 alert。": "選擇一個或多個法域與觸達方式。每日簡報在北京時間 8:00 生成，高影響修訂與新規即時生成 alert。", "订阅设置": "訂閱設定", "工作邮箱": "工作郵箱", "接收内容": "接收內容", "每日简报": "每日簡報", "北京时间每天 8:00": "北京時間每天 8:00", "法规更新 Alert": "法規更新 Alert", "新规或修订即时触达": "新規或修訂即時觸達", "仅香港": "僅香港", "仅新加坡": "僅新加坡", "全选": "全選", "请至少选择一个法域。": "請至少選擇一個法域。", "保存订阅": "儲存訂閱", "每封邮件均含收件人专属管理和退订链接；不发送营销信息。": "每封郵件均含收件人專屬管理和退訂連結；不傳送營銷資訊。", "取消订阅": "取消訂閱", "✓ 订阅设置已持久保存。": "✓ 訂閱設定已持久儲存。", "✓ 订阅已持久保存，请查收确认邮件完成激活（未确认不发送简报）。": "✓ 訂閱已持久儲存，請查收確認郵件完成啟用（未確認不傳送簡報）。", "订阅尚未激活：请查收确认邮件并点击确认链接完成激活（未确认不发送简报）。": "訂閱尚未啟用：請查收確認郵件並點選確認連結完成啟用（未確認不傳送簡報）。", "香港 + 新加坡试点 · 种子内容核验基线 2026-08-09；采集状态见上方<br>信息仅用于法规追踪，不构成法律意见。": "香港 + 新加坡試點 · 種子內容核驗基線 2026-08-09；採集狀態見上方<br>資訊僅用於法規追蹤，不構成法律意見。", "覆盖情况": "覆蓋情況", "跳到主要内容": "跳到主要內容", "重试": "重試", "网络不可用或服务器无响应，部分数据可能已过期。": "網路不可用或伺服器無響應，部分資料可能已過期。", "颁布": "頒佈", "修订": "修訂", "指引发布": "指引發布", "指引修订": "指引修訂", "来源刷新": "來源重新整理", "跨行业": "跨行業", "金融服务": "金融服務", "银行": "銀行", "电信": "電信", "营销": "營銷", "数据主体权利": "資料主體權利", "直销": "直銷", "泄露通知": "洩露通知", "事件响应": "事件響應", "跨境传输": "跨境傳輸", "网络安全": "網路安全", "科技风险": "科技風險", "客户信息保密": "客戶資訊保密", "通信数据": "通訊資料", "电子营销": "電子營銷", "语言": "語言", "打开导航": "開啟導航", "菜单": "選單", "主要导航": "主要導航", "关闭": "關閉", "返回顶部 ↑": "返回頂部 ↑", "法规雷达": "法規雷達", "实时": "實時", "法规动态 · 香港 / 新加坡": "法規動態 · 香港 / 新加坡", "全球合规信号": "全球合規訊號", "PDPO · 金融 · 电信": "PDPO · 金融 · 電信", "PDPA · 金融 · 电信": "PDPA · 金融 · 電信", "结构化法规库": "結構化法規庫", "修订 / 生效 / 指引": "修訂 / 生效 / 指引", "信号触达": "訊號觸達", "每日简报 / 预览": "每日簡報 / 預覽", "正在生成最新简报预览…": "正在生成最新簡報預覽…", "追踪变化，核验来源。": "追蹤變化，核驗來源。", "产品特性": "產品特性", "DataTrace 首页": "DataTrace 首頁", "法域筛选": "法域篩選", "行业筛选": "行業篩選", "主题筛选": "主題篩選", "文书类型": "文書型別", "更新线法域筛选": "更新線法域篩選", "权威来源": "權威來源", "版本指纹": "版本指紋", "修订时间线": "修訂時間線", "即时提醒": "即時提醒", "权威来源 ✦ 保留来源依据 ✦ 幂等更新 ✦ 香港与新加坡试点": "權威來源 ✦ 保留來源依據 ✦ 冪等更新 ✦ 香港與新加坡試點", "DataTrace · 法规动态": "DataTrace · 法規動態", " 条已核验记录": " 條已核驗記錄"};
function traditional(text) { if (traditionalPhrases[text]) return traditionalPhrases[text]; return Array.from(text, c => traditionalCharacters[c] || c).join(''); }
function ui(text) { return state.language === 'zh-TW' ? traditional(text) : text; }
function uiTemplate(parts, ...values) { return parts.map((part, i) => ui(part) + (values[i] ?? '')).join(''); }
function readLanguage() {
  let stored; try { stored = localStorage.getItem('dataTraceLanguage'); } catch { /* Session preference only. */ }
  for (const value of [new URLSearchParams(location.search).get('lang'), stored]) {
    if (value === 'zh' || value === 'zh-CN') return 'zh';
    if (value === 'zh-TW' || value === 'en') return value;
  }
  return /^zh-(tw|hk|mo|hant)/i.test(navigator.language) ? 'zh-TW' : /^zh/i.test(navigator.language) ? 'zh' : 'en';
}
function readSubscriber() { try { return JSON.parse(localStorage.getItem('dataTraceSubscriber') || 'null'); } catch { return null; } }
const state = {
  regulations: [], updates: [], timelineUpdates: [], jurisdiction: '', industry: '', topic: '', type: '', query: '', timelineJurisdiction: '',
  jurisdictions: [], subscriptionJurisdictions: [],
  language: readLanguage(),
  subscriber: readSubscriber()
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
    'footer.note': 'Hong Kong + Singapore pilot · seed content checked 2026-08-09; collection status shown above<br>Tracking information only; not legal advice.',
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
    'footer.note': '香港 + 新加坡试点 · 种子内容核验基线 2026-08-09；采集状态见上方<br>信息仅用于法规追踪，不构成法律意见。',
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


Object.assign(messages.en, {"language.label": "Language", "menu.open": "Open navigation", "menu.label": "Menu", "nav.label": "Primary navigation", "detail.close": "Close", "back.top": "Back to top ↑", "radar.title": "REGULATORY RADAR", "radar.live": "LIVE", "hero.eyebrow": "LIVE REGULATORY INTELLIGENCE · HK / SG", "brand.tagline": "GLOBAL COMPLIANCE SIGNAL"});
Object.assign(messages.zh, {"language.label": "语言", "menu.open": "打开导航", "menu.label": "菜单", "nav.label": "主要导航", "detail.close": "关闭", "back.top": "返回顶部 ↑", "radar.title": "法规雷达", "radar.live": "实时", "hero.eyebrow": "法规动态 · 香港 / 新加坡", "brand.tagline": "全球合规信号"});
Object.assign(messages.en, {"coverage.hkDetail": "PDPO · finance · telecoms", "coverage.sgDetail": "PDPA · finance · telecoms", "library.eyebrow": "STRUCTURED REGULATION LIBRARY", "timeline.eyebrow": "AMENDMENT / COMMENCEMENT / GUIDANCE", "subscribe.eyebrow": "SIGNAL DELIVERY", "briefing.preview": "DAILY BRIEFING / PREVIEW", "briefing.loading": "Generating the latest briefing preview…", "footer.tagline": "TRACE CHANGE. PROVE SOURCE.", "features.label": "Product features", "brand.home": "DataTrace home", "filter.jurisdiction": "Jurisdiction filter", "filter.industry": "Industry filter", "filter.topic": "Topic filter", "filter.type": "Instrument type", "filter.timeline": "Timeline jurisdiction filter", "detail.close": "Close details", "feature.0": "AUTHORITATIVE SOURCES", "feature.1": "STRUCTURED OBLIGATIONS", "feature.2": "VERSION FINGERPRINTS", "feature.3": "AMENDMENT TIMELINE", "feature.4": "DAILY BRIEFINGS", "feature.5": "REAL-TIME ALERTS"});
Object.assign(messages.zh, {"coverage.hkDetail": "PDPO · 金融 · 电信", "coverage.sgDetail": "PDPA · 金融 · 电信", "library.eyebrow": "结构化法规库", "timeline.eyebrow": "修订 / 生效 / 指引", "subscribe.eyebrow": "信号触达", "briefing.preview": "每日简报 / 预览", "briefing.loading": "正在生成最新简报预览…", "footer.tagline": "追踪变化，核验来源。", "features.label": "产品特性", "brand.home": "DataTrace 首页", "filter.jurisdiction": "法域筛选", "filter.industry": "行业筛选", "filter.topic": "主题筛选", "filter.type": "文书类型", "filter.timeline": "更新线法域筛选", "detail.close": "关闭", "feature.0": "权威来源", "feature.1": "结构化义务", "feature.2": "版本指纹", "feature.3": "修订时间线", "feature.4": "每日简报", "feature.5": "即时提醒"});
messages.en['ticker.text'] = 'AUTHORITATIVE SOURCES ✦ PROVENANCE BY DEFAULT ✦ IDEMPOTENT UPDATES ✦ HK + SINGAPORE PILOT';
messages.zh['ticker.text'] = '权威来源 ✦ 保留来源依据 ✦ 幂等更新 ✦ 香港与新加坡试点';
for (const table of [messages, typeLabels, eventLabels]) table['zh-TW'] = Object.fromEntries(Object.entries(table.zh).map(([key, value]) => [key, traditional(value)]));

function t(key) { return messages[state.language][key] || key; }
function label(value) { const pair = taxonomyLabels[value]; return pair ? ui(pair[state.language === 'en' ? 0 : 1]) : value.replaceAll('_', ' '); }
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
  if (!response.ok) throw new Error(payload.error || (state.language === 'en' ? 'Request failed. Please try again.' : ui('请求失败，请稍后重试。')));
  return payload;
}

// ---- 路由常量与状态 ----
function pageTitle() { return state.language === 'en' ? 'DataTrace · Regulatory intelligence' : state.language === 'zh-TW' ? 'DataTrace · 法規動態' : 'DataTrace · 法规动态'; }
const DETAIL_PREFIX = '/regulations/';
const LEGACY_PATHS = { home: '/', library: '/library', timeline: '/timeline', subscribe: '/subscribe' };
let initialized = false;
let currentViewUrl = '/';
let detailContext = null; // { id, previousUrl, previousTitle, trigger }

function applyTranslations() {
  document.documentElement.lang = state.language === 'zh' ? 'zh-CN' : state.language;
  document.title = state.language === 'en' ? 'DataTrace · Regulatory intelligence' : state.language === 'zh-TW' ? 'DataTrace · 法規動態' : 'DataTrace · 法规动态';
  document.querySelectorAll('[data-i18n]').forEach((node) => { node.innerHTML = t(node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => { node.placeholder = t(node.dataset.i18nPlaceholder); });
  document.querySelectorAll('[data-i18n-aria]').forEach((node) => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
  const toggle = document.querySelector('#language-toggle');
  toggle.value = state.language;
  toggle.setAttribute('aria-label', t('language.label'));
  if (state.updates.length) { renderLatest(); renderTimeline(); }
  if (state.regulations.length) renderRegulations(state.regulations.length);
  renderJurisdictionFilters();
  renderSubscriptionJurisdictionChoices();
  updatePendingBanner();
}

function formatDate(value) {
  return value ? new Intl.DateTimeFormat(state.language === 'en' ? 'en-GB' : state.language === 'zh-TW' ? 'zh-TW' : 'zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(`${value}T00:00:00Z`)) : '—';
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
  document.title = pageTitle();
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

async function loadSourceStatus() {
  const panel = document.querySelector('#source-status');
  if (!panel) return;
  const zh = state.language !== 'en';
  const labels = zh
    ? { available: ui('采集可用'), failed: ui('来源不可用'), empty: ui('未匹配到条目，待核验'), unknown: ui('尚无检查记录'), running: ui('检查中') }
    : { available: 'Collection available', failed: 'Source unavailable', empty: 'No matches — verification needed', unknown: 'Not yet checked', running: 'Checking' };
  const dateLabel = (value) => value ? new Date(value).toLocaleString(state.language === 'zh-TW' ? 'zh-TW' : zh ? 'zh-CN' : 'en-GB') : (zh ? ui('未确认') : 'Unconfirmed');
  try {
    const { sources } = await api('/api/source-status');
    panel.innerHTML = uiTemplate`<h2>${zh ? ui('来源与数据时效') : 'Source coverage & freshness'}</h2>
      <p>${zh ? ui('历史记录可继续浏览；来源检查成功不代表内容已完成人工审校。自动收录内容请核对官方原文。') : 'Historical records remain available. A successful source check is not editorial approval; verify automatically collected items against the official source.'}</p>
      <ul>${sources.map((source) => uiTemplate`<li><strong>${escapeHtml(source.name)}</strong> · ${escapeHtml(labels[source.status] || labels.unknown)}<br><small>${zh ? ui('最近检查') : 'Last check'}: ${escapeHtml(dateLabel(source.checkedAt))} · ${zh ? ui('最近成功采集') : 'Last successful collection'}: ${escapeHtml(dateLabel(source.lastSuccessfulAt))}</small></li>`).join('')}</ul>`;
  } catch {
    panel.textContent = zh ? ui('来源状态暂不可读取，当前数据时效未确认。') : 'Source status is unavailable; data freshness is unconfirmed.';
  }
  panel.hidden = false;
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
    if (JSON.stringify(state.updates) !== JSON.stringify(next)) {
      state.updates = next;
      renderLatest();
    }
    await loadTimeline();
  } catch (error) {
    renderUpdatesError(error.message);
  }
}
function renderLatest() {
  document.querySelector('#latest-updates').innerHTML = state.updates.slice(0, 5).map((item) => `
    <article class="signal-item" data-update-regulation="${escapeHtml(item.regulationId || '')}" tabindex="0">
      <time>${escapeHtml(item.eventDate.replaceAll('-', '.'))}</time><span class="signal-tag">${escapeHtml(item.jurisdiction)}</span>
      <div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(state.language !== 'en' ? item.summaryZh : item.summary)}</p></div><i>↗</i>
    </article>`).join('');
}
let timelineRequestId = 0;
async function loadTimeline() {
  const requestId = ++timelineRequestId;
  try {
    const params = new URLSearchParams({ limit: '100' });
    if (state.timelineJurisdiction) params.set('jurisdiction', state.timelineJurisdiction);
    const { data } = await api(`/api/updates?${params}`);
    if (requestId !== timelineRequestId) return;
    state.timelineUpdates = data;
    renderTimeline();
  } catch (error) {
    if (requestId === timelineRequestId) document.querySelector('#timeline-list').innerHTML = errorCard(error.message, 'updates');
  }
}
function renderTimeline() {
  const items = state.timelineUpdates;
  document.querySelector('#timeline-list').innerHTML = items.map((item) => uiTemplate`
    <article class="timeline-item ${escapeHtml(item.importance)}"><time class="timeline-date">${escapeHtml(item.eventDate.replaceAll('-', '.'))}</time>
      <div class="timeline-content"><div class="timeline-meta"><span>${escapeHtml(item.jurisdiction)}</span><span>${escapeHtml(eventLabels[state.language][item.eventType] || item.eventType)}</span></div>
      <h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(state.language !== 'en' ? item.summaryZh : item.summary)}</p>
      <div class="keywords">${item.industries.map((value) => `<span>${escapeHtml(label(value))}</span>`).join('')}</div>
      <a class="source-link" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(item.sourceName)} · ${state.language === 'en' ? 'official source' : ui('查看原文')} ↗</a></div>
    </article>`).join('') || uiTemplate`<div class="empty-state">${state.language === 'en' ? 'No updates for this jurisdiction.' : ui('该法域暂无更新记录。')}</div>`;
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
  document.querySelector('#result-count').textContent = state.language === 'en' ? `${total} verified records` : uiTemplate`${total} 条已核验记录`;
  document.querySelector('#regulation-grid').innerHTML = state.regulations.map((item, index) => uiTemplate`
    <article class="reg-card ${index === 0 && !state.query && !state.type && !state.industry && !state.topic ? 'featured' : ''}" data-regulation-id="${escapeHtml(item.id)}" data-code="${escapeHtml(item.jurisdiction)}" tabindex="0">
      <div class="card-top"><span class="jurisdiction-badge">${escapeHtml(item.jurisdiction)}</span><span class="card-type">${escapeHtml(typeLabels[state.language][item.instrumentType] || item.instrumentType)}</span></div>
      <h2>${escapeHtml(item.shortTitle)}</h2><p>${escapeHtml(item.summary)}</p>
      <div class="keywords">${[...item.industries, ...item.topics.slice(0, 2)].map((value) => `<span>${escapeHtml(label(value))}</span>`).join('')}</div>
      <div class="card-bottom"><span>${state.language === 'en' ? 'Version' : ui('版本')} ${escapeHtml(item.currentVersionDate || item.effectiveDate || '—')}</span><b>${state.language === 'en' ? 'Open record' : ui('打开记录')} ↗</b></div>
    </article>`).join('') || uiTemplate`<div class="empty-state"><b>${state.language === 'en' ? 'No matching records' : ui('没有匹配记录')}</b><p>${state.language === 'en' ? 'Try fewer keywords or change a classification filter.' : ui('请减少关键词或切换分类筛选。')}</p></div>`;
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
    content.innerHTML = uiTemplate`<div class="detail-kicker"><span>${escapeHtml(data.jurisdiction)}</span><span>${escapeHtml(typeLabels[state.language][data.instrumentType] || data.instrumentType)}</span><span>${escapeHtml(data.status)}</span></div>
      <h1 id="detail-title">${escapeHtml(data.title)}</h1><p class="detail-summary">${escapeHtml(data.summary)}</p>
      <div class="keywords">${[...data.industries, ...data.topics].map((value) => `<span>${escapeHtml(label(value))}</span>`).join('')}</div>
      <div class="detail-facts"><div><small>${state.language === 'en' ? 'Authority' : ui('发布机关')}</small><b>${escapeHtml(data.issuingBody)}</b></div><div><small>${state.language === 'en' ? 'Current version' : ui('当前版本')}</small><b>${escapeHtml(data.currentVersionDate || '—')}</b></div><div><small>${state.language === 'en' ? 'Effective' : ui('生效日期')}</small><b>${escapeHtml(formatDate(data.effectiveDate))}</b></div><div><small>${state.language === 'en' ? 'Source checked' : ui('来源核验')}</small><b>${escapeHtml(data.sourceCheckedAt.slice(0, 10))}</b></div></div>
      <section class="detail-section"><h2>${state.language === 'en' ? 'Structured obligations' : ui('结构化义务')}</h2>${data.articles.length ? data.articles.map((article) => `<article class="article"><h3><span>${escapeHtml(article.provisionNumber)}</span>${escapeHtml(article.heading)}</h3><p>${escapeHtml(article.textSummary)}</p><div class="keywords">${article.keywords.map((keyword) => `<span>${escapeHtml(label(keyword))}</span>`).join('')}</div></article>`).join('') : uiTemplate`<p>${state.language === 'en' ? 'Tracked at instrument level; provision decomposition is pending.' : ui('当前按文书级追踪，条文拆分待补。')}</p>`}</section>
      <a class="button primary official-button" href="${escapeHtml(data.sourceUrl)}" target="_blank" rel="noopener">${state.language === 'en' ? 'Open' : ui('前往')} ${escapeHtml(data.sourceName)} <span>↗</span></a>`;
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
    document.title = pageTitle();
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
    feedback.className = 'feedback success'; feedback.textContent = params.get('action') === 'unsubscribe' ? (state.language === 'en' ? 'Subscription loaded. Use Unsubscribe below to confirm.' : ui('已载入订阅，请点击下方“取消订阅”确认。')) : (state.language === 'en' ? 'Subscription loaded from your private link.' : ui('已通过专属链接载入订阅。'));
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
  feedback.className = 'feedback'; feedback.textContent = state.language === 'en' ? 'Saving…' : ui('正在保存…'); button.disabled = true;
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
    feedback.className = 'feedback success'; feedback.textContent = state.language === 'en' ? 'Subscription cancelled.' : ui('订阅已取消。');
  } catch (error) { feedback.className = 'feedback error'; feedback.textContent = error.message; }
}

// ---- 实时刷新（轮询 + 可见性） ----
async function refreshLive() {
  await Promise.allSettled([loadHealth(), loadUpdates(), loadSourceStatus()]);
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
  document.querySelector('#language-toggle').addEventListener('change', async (event) => {
    const selected = event.target.value;
    if (!['en', 'zh', 'zh-TW'].includes(selected)) return;
    state.language = selected;
    try { localStorage.setItem('dataTraceLanguage', selected); } catch { /* Session-only preference. */ }
    const url = new URL(location.href); url.searchParams.set('lang', selected === 'zh' ? 'zh-CN' : selected); history.replaceState(null, '', url);
    applyTranslations(); await Promise.allSettled([loadTaxonomy(), loadSourceStatus()]);
  });
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
    if (timelineChip) { state.timelineJurisdiction = timelineChip.dataset.timelineJurisdiction; applyTimelineFilterControls(); loadTimeline(); return; }
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
  await Promise.allSettled([loadHealth(), loadTaxonomy(), loadUpdates(), loadRegulations(), loadBriefingPreview(), loadSourceStatus()]);
}
init();
