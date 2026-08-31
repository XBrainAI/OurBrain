// Demora 事件委托骨架（v5.18 默认可用）— 开箱处理导航/弹窗，AI 仅需扩展业务 action
// 设计定位：JS 管道层安全网（route/openModal/closeModal 默认可用）。
//   HTML 结构 / 视觉 / 内容 / 业务交互仍由 AI 基于 frontend-design skill 自由设计，本骨架不加任何设计约束。
//   即使 AI 一行 JS 不写，页面导航（data-nav/data-route）与弹窗闭环（data-open-modal/data-close）也可用，
//   从根源消除 D3 弹窗闭环 / D5 路由 / D6 导航无响应的结构性失败。
// AI 扩展业务逻辑的方式（可选，二选一或并存）：
//   1. 定义 window.handleDemoAction = function (action, target, event) { ... } 处理 data-action 业务操作
//   2. 或在本文件追加自己的 addEventListener（骨架不拦截事件，多个委托可共存）
// 按钮类契约（v2.3）：.btn-primary 为弹窗触发器保留类（D3 启发式探测 .btn-primary 为弹窗触发候选，
//   业务主按钮误用会在点击无弹窗弹出时被判 D3 FAIL——p6/p7/p4 实证）；业务主按钮（导航/提交/筛选等）
//   用 .btn-accent（style.css 骨架已预置同视觉样式）或带 data-route/data-action 属性；
//   弹窗触发按钮必须带 data-open-modal 属性

// 路由：display:none 切换 + 切页硬置顶（v5.19 P1-2）+ 高亮导航项
//   （v5.18 P0-A6：display + hidden 双切换同步维护，确保 [data-page-id]:not([hidden]) 与 display 语义一致）
//   原 v5.18 注释"禁 hidden 属性切换"已更新：双切换后 display 同步置 none，flex/grid 覆盖问题不再触发
function route(pageId) {
  document.querySelectorAll('[data-page-id]').forEach(p => {
    const isActive = (p.getAttribute('data-page-id') === pageId);
    p.style.display = isActive ? '' : 'none';
    // v5.18 P0-A6：同步维护 hidden 属性（与 display 双切换）
    //   约束：display 同步置 none 后，flex/grid 覆盖 [hidden] UA 样式的问题不再触发
    //   审计侧 [data-page-id]:not([hidden]) 与 display 语义一致
    if (isActive) {
      p.removeAttribute('hidden');
    } else {
      p.setAttribute('hidden', '');
    }
  });
  const active = document.querySelector('[data-page-id="' + pageId + '"]');
  // v5.20 P1-4 切页置顶语义修正（U6 澄清）：置顶 = 保持公共区域（topbar/标注 header），
  //   仅业务页面区域置顶。v5.19 版缺陷：scrollIntoView 兜底条件 r.top > 8 在 document 复位后
  //   仍触发（topbar 占位使 r.top = topbar 高度），把 in-flow 公共 header 顶出视口。
  //   优先级：①业务滚动容器（最近可滚祖先）scrollTop=0 —— 公共区域在容器外天然常驻；
  //           ②无滚动容器（整页滚动布局）退回 document 复位 + active 自身复位；
  //             仅 r.top < 0（真不可见）才 instant scrollIntoView 兜底（去 r.top > 8 误触发）
  var scrollParent = null;
  var node = active && active.parentElement;
  while (node && node !== document.body && node !== document.documentElement) {
    var st = window.getComputedStyle ? getComputedStyle(node) : null;
    if (st && /(auto|scroll)/.test(st.overflowY) && node.scrollHeight > node.clientHeight) { scrollParent = node; break; }
    node = node.parentElement;
  }
  if (scrollParent) {
    scrollParent.scrollTop = 0; // 业务容器置顶：公共 topbar 不参与业务滚动，保持可视
  } else {
    var sc = document.scrollingElement || document.documentElement;
    if (sc && sc.scrollTop > 0) sc.scrollTop = 0;
    if (active && active.scrollTop) active.scrollTop = 0; // section 自身可滚动时
    if (active) { var r = active.getBoundingClientRect(); if (r.top < 0) active.scrollIntoView({ behavior: 'auto', block: 'start' }); }
  }
  // 导航项高亮：active class + aria-current（导航项带 data-nav 时生效）
  document.querySelectorAll('[data-nav]').forEach(n => {
    const on = n.getAttribute('data-nav') === pageId;
    n.classList.toggle('active', on);
    if (on) n.setAttribute('aria-current', 'page'); else n.removeAttribute('aria-current');
  });
  // 页面切换后重新绑定新页面元素
  document.querySelectorAll('[data-action]:not([data-demo-bound])').forEach(function (el) {
    el.setAttribute('data-demo-bound', '1');
    if (!el.onclick) {
      el.onclick = function (e) {
        dispatchDemoAction(el, e);
      };
    }
  });
}

// 弹窗：display 切换（避免 flex/grid 覆盖 hidden 的陷阱）
function openModal(modalId) {
  const modal = document.getElementById(modalId) || document.querySelector('[data-modal-id="' + modalId + '"]');
  if (modal) modal.style.display = '';
}
function closeModal(modal) {
  if (typeof modal === 'string') modal = document.getElementById(modal) || document.querySelector('[data-modal-id="' + modal + '"]');
  if (modal) modal.style.display = 'none';
}

// v5.22 单次派发幂等：统一派发管道——元素级 onclick（target 阶段）与 document 委托（bubble 阶段）
//   互为冗余、经 e._demoDispatched 幂等标志保证同一事件完整管道恰好执行一次。
//   冗余保障：AI 在祖先容器 stopPropagation 时，元素级 onclick 仍完成导航/弹窗/action 派发。
//   P008 组合语义：data-action 与 data-open-modal/data-nav/data-route 并存时按优先级链短路，
//   data-action 仅作静态线索（对齐 SKILL.md P008 文档契约）。
function dispatchDemoAction(target, e) {
  if (e._demoDispatched) return; // 幂等：先到的路径放行，后到的拦截
  e._demoDispatched = true;
  // v2.1 标注点击 guard：.l3-dot/.l2-marker 的点击交给标注引擎处理，不进入 demo 派发
  //   根因（ab-test P01-C-004）：dot 落在 [data-action] 容器内，点击冒泡触发导航 → 中断标注激活
  if (e.target && e.target.closest && e.target.closest('.l3-dot, .l2-marker')) return;
  if (target.hasAttribute('data-nav')) { route(target.getAttribute('data-nav')); return; }
  if (target.hasAttribute('data-route')) { route(target.getAttribute('data-route')); return; }
  if (target.hasAttribute('data-open-modal')) { openModal(target.getAttribute('data-open-modal')); return; }
  if (target.hasAttribute('data-close')) {
    const m = target.closest('.modal, [data-modal-id], [role="dialog"]');
    if (m) m.style.display = 'none';
    return;
  }
  if (target.hasAttribute('data-action')) {
    if (typeof window.handleDemoAction === 'function') {
      window.handleDemoAction(target.getAttribute('data-action'), target, e);
    }
  }
}

// 统一事件委托：closest 匹配目标，经 dispatchDemoAction 单次派发（v5.22 幂等化）
document.addEventListener('click', (e) => {
  const target = e.target.closest ? e.target.closest('[data-nav], [data-route], [data-open-modal], [data-close], [data-action]') : null;
  if (target) dispatchDemoAction(target, e);
});

// v5.20 P1-5 导航折叠（U5 重构，codex 风格）：顶栏最左 .nav-toggle 图标按钮（内联 SVG）
//   带 data-nav-toggle 属性，点击切换 body.nav-collapsed 折叠态；折叠态侧栏完全移出
//   （translateX，零残留），悬停屏幕左缘热区自动唤出完整导航（style.css 骨架接管）。
//   注意（v5.20）：按钮内为 SVG 图标，委托仅同步 aria-expanded，不覆盖按钮 DOM
//   （v5.19 的 textContent «/» 更新已随图标化移除）
// v5.20.2（UAT 四轮 U-B）：折叠唤出位置对齐侧栏原 top（topbar 底部）——
//   CSS 折叠态 top:0 会让唤出的导航从视口顶开始、遮盖 app-shell 常驻 topbar
//   （codex-p10 实证：悬停唤出的侧栏跑到 header 位置并遮盖 header）。
//   测量时机必须在 classList.toggle 之前——折叠规则 position:fixed;top:0 同步生效，
//   切换后测量恒为 0（top:0 覆盖 topbar 区域还会令鼠标停留处被侧栏覆盖、误触发
//   :hover 唤出，即 UAT 截图"跑到 header 位置遮盖 header"的直接成因）。
//   切换前测展开态 layout top（= topbar 底部）写入内联 top；无 topbar 布局测量值
//   为 0 时清空（回落 CSS 默认），展开态同样清除（防非 static 定位受残留干扰）
document.addEventListener('click', function (e) {
  var t = e.target.closest('[data-nav-toggle]');
  if (!t) return;
  var sb = document.querySelector('.sidebar, [class*="sidebar"]');
  // 切换前测量（展开态 layout top；折叠态 fixed+内联 top 下 rect.top 同值，幂等）
  var expandTop = sb ? Math.round(sb.getBoundingClientRect().top) : 0;
  var collapsed = document.body.classList.toggle('nav-collapsed');
  t.setAttribute('aria-expanded', collapsed ? 'true' : 'false');
  if (sb) {
    if (collapsed && expandTop > 0) {
      sb.style.top = expandTop + 'px';
    } else {
      sb.style.top = '';
    }
  }
});

// v5.22 P0-A7：元素级 onclick 全管道派发（在 click 委托基础上加固 D6/D3）
//   机制：为含 data-action 的元素绑定 onclick，onclick 体经 dispatchDemoAction 完成完整管道派发
//   （含导航/弹窗/close/action 优先级链）；与 document click 委托经 e._demoDispatched 幂等标志
//   单次执行（根治 v5.18 双触发）；data-action 与 data-open-modal/data-nav/data-route 并存时
//   按优先级链短路（P008）。data-demo-bound 标记防重复绑定；内联 onclick 跳过逻辑保留。
document.querySelectorAll('[data-action]:not([data-demo-bound])').forEach(function (el) {
  el.setAttribute('data-demo-bound', '1');
  // 仅对无内联 onclick 的元素绑定（保留 AI 自定义逻辑）
  if (!el.onclick) {
    el.onclick = function (e) {
      dispatchDemoAction(el, e);
    };
  }
});

// v5.22 文本筛选实时通道：input 事件逐键派发（仅 INPUT/TEXTAREA；SELECT 由 change 语义覆盖，
//   排除以防 input+change 双触发）。命中 [data-action] 即派发——文本搜索/筛选实时生效，
//   AI 无需自建 input 监听（避免双通道，契约见 SKILL.md R-11）。
document.addEventListener('input', function (e) {
  var t = e.target;
  if (!t || (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA')) return;
  var host = t.closest ? t.closest('[data-action]') : null;
  if (host) dispatchDemoAction(host, e);
});

/* ==========================================================================
   业务层（AI 增量填充）：数据 → 渲染 → 筛选 → 交互
   设计：司法卷宗风，标志性元素为存证时效环与证据链时间轴
   ========================================================================== */
(function () {
  'use strict';

  // ---------- 1. Mock 数据（每实体 ≥10 条，覆盖正常/边界/异常态） ----------
  // hoursLeft：相对当前时刻的存证剩余小时数（负数为已超时）
  var LEADS = [
    { no: 'LR-20260829-041', patentNo: 'CN202310884213.7', title: '折叠式无线充电支架', item: '速讯 折叠无线充 桌面支架 快充版', channel: '电商平台', platform: '淘宝', seller: '深圳市速讯数码商行', similarity: 96, risk: '高', hitCount: 7, hitTime: '2026-08-29 07:40', hoursLeft: 3.2, status: '待存证' },
    { no: 'LR-20260829-040', patentNo: 'CN202210556781.2', title: '磁吸式车载支架', item: '车品优选 磁吸车载支架 强磁', channel: '电商平台', platform: '京东', seller: '广州车品优选贸易', similarity: 91, risk: '中', hitCount: 3, hitTime: '2026-08-29 06:15', hoursLeft: 8.5, status: '待存证' },
    { no: 'LR-20260829-038', patentNo: 'CN202310884213.7', title: '折叠式无线充电支架', item: '跨境专供 折叠无线充 stand', channel: '跨境平台', platform: 'Amazon', seller: 'Shenzhen Suxun Tech', similarity: 94, risk: '高', hitCount: 12, hitTime: '2026-08-29 04:50', hoursLeft: 11.0, status: '待存证' },
    { no: 'LR-20260829-036', patentNo: 'CN202110334562.9', title: '可折叠蓝牙键盘', item: '便携折叠键盘 三折 蓝牙', channel: '独立站', platform: '品牌独立站', seller: '东莞市键途电子', similarity: 88, risk: '中', hitCount: 4, hitTime: '2026-08-29 03:20', hoursLeft: 15.5, status: '待存证' },
    { no: 'LR-20260829-035', patentNo: 'CN202310884213.7', title: '折叠式无线充电支架', item: '同款支架 批发 一件代发', channel: '电商平台', platform: '1688', seller: '深圳市速讯数码商行', similarity: 93, risk: '高', hitCount: 9, hitTime: '2026-08-28 23:05', hoursLeft: -2.0, status: '已失效' },
    { no: 'LR-20260828-029', patentNo: 'CN202010998877.4', title: '智能温控水杯', item: '温控杯 恒温 304 内胆', channel: '电商平台', platform: '拼多多', seller: '义乌市暖屋家居', similarity: 79, risk: '低', hitCount: 2, hitTime: '2026-08-28 18:40', hoursLeft: -5.5, status: '已失效' },
    { no: 'LR-20260828-027', patentNo: 'CN202310884213.7', title: '折叠式无线充电支架', item: '桌面无线充支架 立式', channel: '短视频', platform: '抖音', seller: '抖店数码严选', similarity: 90, risk: '高', hitCount: 6, hitTime: '2026-08-28 15:10', hoursLeft: null, status: '已存证' },
    { no: 'LR-20260828-024', patentNo: 'CN202210556781.2', title: '磁吸式车载支架', item: '磁吸支架 出风口 免打孔', channel: '电商平台', platform: '淘宝', seller: '温州车饰工坊', similarity: 85, risk: '中', hitCount: 3, hitTime: '2026-08-28 11:30', hoursLeft: null, status: '已存证' },
    { no: 'LR-20260827-019', patentNo: 'CN202110334562.9', title: '可折叠蓝牙键盘', item: '折叠键盘 便携 三折', channel: '跨境平台', platform: 'eBay', seller: 'HK KeyTech Ltd', similarity: 82, risk: '中', hitCount: 2, hitTime: '2026-08-27 20:05', hoursLeft: null, status: '已存证' },
    { no: 'LR-20260827-016', patentNo: 'CN202010998877.4', title: '智能温控水杯', item: '智能杯 加热杯垫 套装', channel: '展会', platform: '展会现场', seller: '深圳礼品展 A-217', similarity: 68, risk: '低', hitCount: 1, hitTime: '2026-08-27 14:20', hoursLeft: null, status: '已立案' },
    { no: 'LR-20260826-012', patentNo: 'CN202310884213.7', title: '折叠式无线充电支架', item: '无线充支架 立式 快充', channel: '电商平台', platform: '淘宝', seller: '深圳市速讯数码商行', similarity: 95, risk: '高', hitCount: 8, hitTime: '2026-08-26 09:45', hoursLeft: null, status: '已立案' },
    { no: 'LR-20260826-009', patentNo: 'CN202210556781.2', title: '磁吸式车载支架', item: '车载磁吸 强磁 支架', channel: '跨境平台', platform: 'Shopee', seller: 'SG AutoGear', similarity: 77, risk: '中', hitCount: 2, hitTime: '2026-08-26 08:10', hoursLeft: null, status: '已立案' },
    { no: 'LR-20260825-005', patentNo: 'CN202310771234.1', title: '折叠收纳式支架', item: '支架 无线充电 收纳', channel: '独立站', platform: '独立站 shop247', similarity: 64, risk: '低', hitCount: 1, hitTime: '2026-08-25 16:30', hoursLeft: null, status: '已忽略' },
    { no: 'LR-20260825-002', patentNo: 'CN202010998877.4', title: '智能温控水杯', item: '杯 保温 智能', channel: '短视频', platform: '抖音', seller: '抖店家居小铺', similarity: 58, risk: '低', hitCount: 1, hitTime: '2026-08-25 10:05', hoursLeft: null, status: '已忽略' }
  ];

  var EVIDENCE = [
    { no: 'EV-20260828-001', leadNo: 'LR-20260828-027', method: '区块链存证', hash: '0x8f3a1c94d2e7b605af1c83d47e902b1c6a5d8e43f7b2c1904ea6d5f8b73c2e1a', height: 18422931, chainTime: '2026-08-28 15:42', status: '已上链', reportNo: 'RP-20260828-001', operator: '陈静（监测分析师）', files: 6 },
    { no: 'EV-20260828-002', leadNo: 'LR-20260828-024', method: '页面快照', hash: '0x2b7c5e19a830f6d2471b9ce58a04d3f6e17b2094c8d5a3f1e6b7409d2c85a3fb', height: 18422607, chainTime: '2026-08-28 12:08', status: '已上链', reportNo: 'RP-20260828-002', operator: '陈静（监测分析师）', files: 4 },
    { no: 'EV-20260827-003', leadNo: 'LR-20260827-019', method: '录屏取证', hash: '0x6d1e84a2f970c53b8e2a7d1459f0c6b3a8e72014d5f9b3c60a1e847d2b95f3c0', height: 18419002, chainTime: '2026-08-27 20:44', status: '已上链', reportNo: 'RP-20260827-003', operator: '王磊（监测分析师）', files: 3 },
    { no: 'EV-20260827-004', leadNo: 'LR-20260827-016', method: '区块链存证', hash: '0xa4c937f1e285b6d0739c1ea48b520f6d7e13904c2b8a5f6d0e7439b1c85d2e6f', height: 18418773, chainTime: '2026-08-27 14:58', status: '已上链', reportNo: 'RP-20260827-004', operator: '王磊（监测分析师）', files: 5 },
    { no: 'EV-20260826-005', leadNo: 'LR-20260826-012', method: '公证取证', hash: '0x3f82b6d0c41e97a5287b3f1d60a9c4e85b27031d9f4a6c8e1b5037d2c96f4a8b', height: 18415016, chainTime: '2026-08-26 10:22', status: '已上链', reportNo: 'RP-20260826-005', operator: '刘婷（品牌方IPR）', files: 8 },
    { no: 'EV-20260826-006', leadNo: 'LR-20260826-009', method: '区块链存证', hash: '0x9e27c4a8b53d10f6e7a2943d81b05c6f2e473901a8d6b5c3f0e9427b1d83a5c4', height: 18414788, chainTime: '2026-08-26 08:47', status: '已上链', reportNo: 'RP-20260826-006', operator: '刘婷（品牌方IPR）', files: 4 },
    { no: 'EV-20260825-007', leadNo: 'LR-20260825-005', method: '页面快照', hash: '', height: null, chainTime: '', status: '存证中', reportNo: '', operator: '陈静（监测分析师）', files: 2 },
    { no: 'EV-20260825-008', leadNo: 'LR-20260825-002', method: '录屏取证', hash: '', height: null, chainTime: '', status: '已失效', reportNo: '', operator: '陈静（监测分析师）', files: 1 },
    { no: 'EV-20260824-009', leadNo: 'LR-20260824-118', method: '区块链存证', hash: '0x5c1a9e73b842d6f0e39517a4c8b20d6f1e73508b9a4c6d2f0e8153b7a29c4d6e', height: 18407312, chainTime: '2026-08-24 09:12', status: '已上链', reportNo: 'RP-20260824-009', operator: '王磊（监测分析师）', files: 7 },
    { no: 'EV-20260823-010', leadNo: 'LR-20260823-104', method: '页面快照', hash: '0x7d3b85f2a19c6e0475b8d2a13f9c5e6b7a03218d4f6b9c2e0a7453d1b82e6f9a', height: 18403569, chainTime: '2026-08-23 17:35', status: '已上链', reportNo: 'RP-20260823-010', operator: '刘婷（品牌方IPR）', files: 5 },
    { no: 'EV-20260822-011', leadNo: 'LR-20260822-097', method: '公证取证', hash: '', height: null, chainTime: '', status: '存证中', reportNo: '', operator: '赵珂（维权律师）', files: 3 }
  ];

  var CASES = [
    { no: 'CA-2026-0731', leadNo: 'LR-20260826-012', patentNo: 'CN202310884213.7', patentTitle: '折叠式无线充电支架', seller: '深圳市速讯数码商行', strategy: '平台投诉函', region: '中国大陆', platform: '淘宝', ruleCode: '', status: '处置中', owner: '品牌方IPR', ownerName: '刘婷', risk: '高', createdAt: '2026-08-26', closedAt: '', outcome: '', gain: 0 },
    { no: 'CA-2026-0730', leadNo: 'LR-20260827-019', patentNo: 'CN202110334562.9', patentTitle: '可折叠蓝牙键盘', seller: 'HK KeyTech Ltd', strategy: '律师函', region: '美国', platform: 'eBay', ruleCode: 'CB-US-EBAY-02', status: '平台受理', owner: '维权律师', ownerName: '赵珂', risk: '中', createdAt: '2026-08-27', closedAt: '', outcome: '', gain: 0 },
    { no: 'CA-2026-0728', leadNo: 'LR-20260826-009', patentNo: 'CN202210556781.2', patentTitle: '磁吸式车载支架', seller: 'SG AutoGear', strategy: '平台投诉函', region: '东南亚', platform: 'Shopee', ruleCode: '', status: '待处置', owner: '品牌方IPR', ownerName: '刘婷', risk: '中', createdAt: '2026-08-26', closedAt: '', outcome: '', gain: 0 },
    { no: 'CA-2026-0726', leadNo: 'LR-20260825-005', patentNo: 'CN202310771234.1', patentTitle: '折叠收纳式支架', seller: '抖店数码严选', strategy: '专利无效检索', region: '中国大陆', platform: '抖音', ruleCode: '', status: '待处置', owner: '监测分析师', ownerName: '陈静', risk: '高', createdAt: '2026-08-25', closedAt: '', outcome: '', gain: 0 },
    { no: 'CA-2026-0725', leadNo: 'LR-20260820-118', patentNo: 'CN202310884213.7', patentTitle: '折叠式无线充电支架', seller: 'US GadgetHub Inc', strategy: '诉讼前置', region: '美国', platform: 'Amazon', ruleCode: 'CB-US-AMZ-01', status: '已结案', owner: '维权律师', ownerName: '赵珂', risk: '高', createdAt: '2026-08-20', closedAt: '2026-08-28', outcome: '已下架', gain: 12.6 },
    { no: 'CA-2026-0722', leadNo: 'LR-20260819-104', patentNo: 'CN202010998877.4', patentTitle: '智能温控水杯', seller: '义乌市暖屋家居', strategy: '平台投诉函', region: '中国大陆', platform: '拼多多', ruleCode: '', status: '已结案', owner: '品牌方IPR', ownerName: '刘婷', risk: '低', createdAt: '2026-08-19', closedAt: '2026-08-25', outcome: '已下架', gain: 4.2 },
    { no: 'CA-2026-0720', leadNo: 'LR-20260818-097', patentNo: 'CN202210556781.2', patentTitle: '磁吸式车载支架', seller: '广州车品优选贸易', strategy: '律师函', region: '中国大陆', platform: '京东', ruleCode: '', status: '平台受理', owner: '维权律师', ownerName: '赵珂', risk: '中', createdAt: '2026-08-18', closedAt: '', outcome: '', gain: 0 },
    { no: 'CA-2026-0718', leadNo: 'LR-20260817-091', patentNo: 'CN202310884213.7', patentTitle: '折叠式无线充电支架', seller: 'Shenzhen Suxun Tech', strategy: '诉讼前置', region: '欧盟', platform: 'Amazon', ruleCode: 'CB-EU-AMZ-03', status: '已结案', owner: '维权律师', ownerName: '赵珂', risk: '高', createdAt: '2026-08-17', closedAt: '2026-08-27', outcome: '已下架', gain: 18.9 },
    { no: 'CA-2026-0715', leadNo: 'LR-20260816-086', patentNo: 'CN202110334562.9', patentTitle: '可折叠蓝牙键盘', seller: '东莞市键途电子', strategy: '平台投诉函', region: '日本', platform: 'Amazon', ruleCode: '', status: '处置中', owner: '品牌方IPR', ownerName: '刘婷', risk: '中', createdAt: '2026-08-16', closedAt: '', outcome: '', gain: 0 },
    { no: 'CA-2026-0712', leadNo: 'LR-20260815-080', patentNo: 'CN202310884213.7', patentTitle: '折叠式无线充电支架', seller: 'US GadgetHub Inc', strategy: '诉讼前置', region: '美国', platform: 'Amazon', ruleCode: 'CB-US-AMZ-01', status: '已结案', owner: '维权律师', ownerName: '赵珂', risk: '高', createdAt: '2026-08-15', closedAt: '2026-08-26', outcome: '已整改', gain: 8.4 },
    { no: 'CA-2026-0709', leadNo: 'LR-20260814-074', patentNo: 'CN202010998877.4', patentTitle: '智能温控水杯', seller: '深圳礼品展 A-217', strategy: '平台投诉函', region: '中国大陆', platform: '展会', ruleCode: '', status: '已驳回', owner: '品牌方IPR', ownerName: '刘婷', risk: '低', createdAt: '2026-08-14', closedAt: '', outcome: '', gain: 0 },
    { no: 'CA-2026-0705', leadNo: 'LR-20260813-069', patentNo: 'CN202310771234.1', patentTitle: '折叠收纳式支架', seller: '独立站 shop247', strategy: '专利无效检索', region: '英国', platform: '独立站', ruleCode: '', status: '已结案', owner: '维权律师', ownerName: '赵珂', risk: '中', createdAt: '2026-08-13', closedAt: '2026-08-24', outcome: '已下架', gain: 6.1 }
  ];

  var RULES = [
    { code: 'CB-US-AMZ-01', region: '美国', platform: 'Amazon', channel: 'Amazon Patent Neutral Evaluation', sla: 10, materials: '专利证书、权利要求对照表、侵权比对图、购买凭证、主体资质', template: '美国亚马逊专利投诉函模板', enabled: true, bound: ['CA-2026-0712', 'CA-2026-0725', 'CA-2026-0730'] },
    { code: 'CB-US-EBAY-02', region: '美国', platform: 'eBay', channel: 'eBay VeRO Program', sla: 7, materials: '权利证明、侵权比对说明、商品链接清单', template: '美国 eBay VeRO 投诉模板', enabled: true, bound: ['CA-2026-0730'] },
    { code: 'CB-EU-AMZ-03', region: '欧盟', platform: 'Amazon', channel: 'EU Amazon IP Accelerator', sla: 15, materials: '欧盟专利登记证明、比对表、授权委托书', template: '欧盟亚马逊侵权投诉模板', enabled: true, bound: ['CA-2026-0718'] },
    { code: 'CB-UK-EBAY-04', region: '英国', platform: 'eBay', channel: 'UK eBay VeRO', sla: 8, materials: '英国专利证明、比对图、购买凭证', template: '英国 eBay 投诉模板', enabled: true, bound: [] },
    { code: 'CB-SEA-SHP-01', region: '东南亚', platform: 'Shopee', channel: 'Shopee IP Protection', sla: 12, materials: '当地专利注册证明、侵权比对、主体资质', template: '东南亚 Shopee 投诉模板', enabled: true, bound: [] },
    { code: 'CB-SEA-LZD-02', region: '东南亚', platform: 'Lazada', channel: 'Lazada IP Complaint', sla: 12, materials: '当地专利注册证明、侵权比对、主体资质', template: '东南亚 Lazada 投诉模板', enabled: true, bound: [] },
    { code: 'CB-JP-AMZ-01', region: '日本', platform: 'Amazon', channel: 'Amazon.co.jp 特許侵害申立', sla: 14, materials: '日本特许厅登记证明、比对图、日文委托书', template: '日本亚马逊专利投诉模板', enabled: true, bound: [] },
    { code: 'CB-US-TEMU-05', region: '美国', platform: 'Temu', channel: 'Temu IP Complaint Portal', sla: 9, materials: '权利证明、侵权比对图、购买凭证', template: '美国 Temu 投诉模板', enabled: true, bound: [] },
    { code: 'CB-EU-AEX-06', region: '欧盟', platform: 'AliExpress', channel: 'AliExpress IP Protection', sla: 15, materials: '欧盟专利证明、比对表、公证材料', template: '欧盟 AliExpress 投诉模板', enabled: true, bound: [] },
    { code: 'CB-KR-AMZ-07', region: '韩国', platform: 'Amazon', channel: 'Amazon KR IP Desk', sla: 13, materials: '韩国专利登记证明、韩文比对说明', template: '韩国亚马逊投诉模板', enabled: false, bound: [] },
    { code: 'CB-US-EBAY-08', region: '美国', platform: 'eBay', channel: 'eBay VeRO（旧版归档）', sla: 7, materials: '旧版模板材料清单已停用', template: '旧版 eBay 投诉模板', enabled: false, bound: [] },
    { code: 'CB-JP-LZD-09', region: '日本', platform: 'Lazada', channel: 'Lazada JP IP Form', sla: 14, materials: '日本特许登记证明、比对图', template: '日本 Lazada 投诉模板', enabled: true, bound: [] }
  ];

  var RANKING = [
    { patentNo: 'CN202310884213.7', title: '折叠式无线充电支架', cases: 6, rate: 83, gain: 32.4 },
    { patentNo: 'CN202210556781.2', title: '磁吸式车载支架', cases: 5, rate: 80, gain: 21.7 },
    { patentNo: 'CN202110334562.9', title: '可折叠蓝牙键盘', cases: 4, rate: 75, gain: 14.2 },
    { patentNo: 'CN202010998877.4', title: '智能温控水杯', cases: 3, rate: 67, gain: 8.9 },
    { patentNo: 'CN202310771234.1', title: '折叠收纳式支架', cases: 2, rate: 50, gain: 3.4 },
    { patentNo: 'CN202310119923.5', title: '便携折叠台灯', cases: 2, rate: 50, gain: 1.8 },
    { patentNo: 'CN202210774310.6', title: '无线充电鼠标垫', cases: 1, rate: 100, gain: 0.6 },
    { patentNo: 'CN202111002388.4', title: '可拆洗键盘托', cases: 1, rate: 0, gain: 0 },
    { patentNo: 'CN202010445102.8', title: '桌面理线器', cases: 1, rate: 0, gain: 0 },
    { patentNo: 'CN202211339087.2', title: '折叠手机支架', cases: 1, rate: 0, gain: 0 }
  ];

  var CHANNEL_TREND = {
    all: [52, 66, 38, 74, 90, 61, 100],
    '电商平台': [40, 52, 30, 58, 70, 48, 82],
    '跨境平台': [30, 38, 22, 44, 55, 36, 66],
    '独立站': [12, 18, 10, 20, 26, 18, 30],
    '短视频': [18, 22, 14, 26, 32, 22, 38],
    '展会': [4, 6, 2, 8, 10, 6, 12]
  };

  // ---------- 2. 运行时状态 ----------
  // 每页容量设为 20：线索与案件数据量各在 20 条以内时单页展示，
  //   保证"共 N 条"计数文本与表格可见行数严格一致（D6 筛选往返一致性探针口径）
  var pageSize = 20;
  var leadPage = 1;
  var casePage = 1;
  var currentRole = 'brand_ipr';
  var currentLeadNo = 'LR-20260829-041';
  var currentRuleCode = 'CB-US-AMZ-01';
  var taskSeq = 1;
  var caseSeq = 31;
  var evidenceSeq = 12;
  var reportSeq = 11;
  var dashboardChannel = 'all';
  var analyticsRange = '30';
  var analyticsChannel = 'all';
  var timelineKind = 'all';

  var ROLE_LABELS = { brand_ipr: '品牌方IPR', rights_lawyer: '维权律师', monitoring_analyst: '监测分析师' };

  function $(id) { return document.getElementById(id); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function toast(msg) {
    var el = $('toast');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    if (toast._t) clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.hidden = true; }, 2600);
  }

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }

  function stampNow() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }

  function randHash() {
    var hex = '0123456789abcdef';
    var s = '0x';
    for (var i = 0; i < 64; i++) s += hex[Math.floor(Math.random() * 16)];
    return s;
  }

  function leadByNo(no) {
    for (var i = 0; i < LEADS.length; i++) if (LEADS[i].no === no) return LEADS[i];
    return null;
  }
  function caseByNo(no) {
    for (var i = 0; i < CASES.length; i++) if (CASES[i].no === no) return CASES[i];
    return null;
  }
  function ruleByCode(code) {
    for (var i = 0; i < RULES.length; i++) if (RULES[i].code === code) return RULES[i];
    return null;
  }
  function evidenceByLead(no) {
    for (var i = 0; i < EVIDENCE.length; i++) if (EVIDENCE[i].leadNo === no) return EVIDENCE[i];
    return null;
  }

  // ---------- 3. 存证时效：倒计时与时效环 ----------
  function initDeadlines() {
    var now = Date.now();
    LEADS.forEach(function (l) {
      if (l.hoursLeft !== null && l.hoursLeft !== undefined) {
        l.deadline = new Date(now + l.hoursLeft * 3600 * 1000).getTime();
      }
    });
  }

  function remainMs(l) {
    if (l.status !== '待存证' || !l.deadline) return null;
    return l.deadline - Date.now();
  }

  function fmtRemain(ms) {
    if (ms === null) return '—';
    if (ms <= 0) return '已失效';
    var totalMin = Math.floor(ms / 60000);
    var h = Math.floor(totalMin / 60);
    var m = totalMin % 60;
    return h > 0 ? (h + 'h' + pad2(m) + 'm') : (m + 'm');
  }

  function urgencyClass(ms) {
    if (ms === null) return 'is-done';
    if (ms <= 0) return 'is-done';
    if (ms < 4 * 3600 * 1000) return 'is-danger';
    if (ms < 12 * 3600 * 1000) return 'is-warn';
    return '';
  }

  function urgencyBucket(ms) {
    if (ms === null || ms <= 0) return 'expired';
    if (ms < 4 * 3600 * 1000) return 'danger';
    if (ms < 12 * 3600 * 1000) return 'warn';
    return 'safe';
  }

  function tickCountdown() {
    var expired = false;
    qsa('[data-countdown]').forEach(function (el) {
      var l = leadByNo(el.getAttribute('data-countdown'));
      if (!l) return;
      var ms = remainMs(l);
      if (ms !== null && ms <= 0) { l.status = '已失效'; expired = true; }
      var ms2 = remainMs(l);
      el.textContent = l.status === '已失效' ? '已失效' : fmtRemain(ms2);
      el.className = 'mono countdown ' + urgencyClass(ms2);
    });
    qsa('[data-countdown-ring]').forEach(function (ring) {
      var l = leadByNo(ring.getAttribute('data-countdown-ring'));
      if (!l) return;
      var ms = remainMs(l);
      var ratio = ms === null ? 0 : Math.max(0, Math.min(1, ms / (24 * 3600 * 1000)));
      var fg = ring.querySelector('.ring-fg');
      var txt = ring.querySelector('.ring-text');
      if (fg) fg.setAttribute('stroke-dashoffset', String(113 * (1 - ratio)));
      if (txt) txt.textContent = l.status === '已失效' ? '失效' : fmtRemain(ms);
      ring.className = 'ring ' + (ms === null ? '' : (ms <= 0 ? 'ring-danger' : (ms < 4 * 3600 * 1000 ? 'ring-danger' : (ms < 12 * 3600 * 1000 ? 'ring-warn' : ''))));
    });
    if (expired) { renderLeads(); renderTodo(); renderStats(); }
  }

  // ---------- 4. 渲染：线索 / 待办 ----------
  function statusTag(status) {
    var map = {
      '待存证': 'status-warning',
      '已存证': 'status-primary',
      '已立案': 'status-success',
      '已失效': 'status-danger',
      '已忽略': 'status-muted'
    };
    return '<span class="status ' + (map[status] || 'status-muted') + '">' + status + '</span>';
  }

  function riskTag(risk) {
    var cls = risk === '高' ? 'tag-danger' : (risk === '中' ? 'tag-brass' : 'tag-chain');
    return '<span class="tag ' + cls + '">' + risk + '</span>';
  }

  function leadRowHtml(l, idx) {
    return '<tr data-dynamic="1" data-idx="' + idx + '" data-lead="' + l.no + '" data-status="' + l.status + '" data-channel="' + l.channel + '" data-risk="' + l.risk + '">' +
      '<td class="col-check"><input type="checkbox" class="row-check" data-lead="' + l.no + '" aria-label="选择线索"></td>' +
      '<td class="mono">' + l.no + '</td>' +
      '<td><span class="cell-main">' + esc(l.title) + '</span><em class="mono dim">' + l.patentNo + '</em></td>' +
      '<td>' + esc(l.item) + '</td>' +
      '<td>' + l.channel + ' · ' + l.platform + '</td>' +
      '<td>' + esc(l.seller) + '</td>' +
      '<td class="mono">' + l.similarity + '%</td>' +
      '<td>' + riskTag(l.risk) + '</td>' +
      '<td class="mono countdown" data-countdown="' + l.no + '">—</td>' +
      '<td class="js-status">' + statusTag(l.status) + '</td>' +
      '<td class="col-ops">' +
        '<button type="button" class="btn-accent btn-sm" data-action="openEvidence" data-lead="' + l.no + '"' + (l.status === '待存证' ? '' : ' disabled') + '>立即存证</button> ' +
        '<button type="button" class="btn-link" data-action="gotoEvidence" data-lead="' + l.no + '">查看</button> ' +
        '<button type="button" class="btn-link btn-muted" data-action="ignoreLead" data-lead="' + l.no + '"' + (l.status === '已立案' || l.status === '已忽略' ? ' disabled' : '') + '>忽略</button>' +
      '</td>' +
    '</tr>';
  }

  function renderLeads() {
    var body = $('leadBody');
    if (!body) return;
    qsa('tr[data-dynamic]', body).forEach(function (tr) { tr.remove(); });
    var html = '';
    for (var i = 1; i < LEADS.length; i++) html += leadRowHtml(LEADS[i], i);
    body.insertAdjacentHTML('beforeend', html);
    var first = LEADS[0];
    var firstTr = body.querySelector('tr[data-idx="0"]');
    if (firstTr) {
      firstTr.setAttribute('data-status', first.status);
      var st = firstTr.querySelector('.js-status');
      if (st) st.innerHTML = statusTag(first.status);
      var evBtn = firstTr.querySelector('[data-action="openEvidence"]');
      if (evBtn) evBtn.disabled = (first.status !== '待存证');
      var igBtn = firstTr.querySelector('[data-action="ignoreLead"]');
      if (igBtn) igBtn.disabled = (first.status === '已立案' || first.status === '已忽略');
    }
    applyLeadFilter();
  }

  // 待办表为静态 4 行（承载 P01 表格内 L3 标注锚点，不随渲染重建）
  function renderTodo() {
    qsa('#todoBody tr').forEach(function (tr) {
      var l = leadByNo(tr.getAttribute('data-lead'));
      if (!l) return;
      var ms = remainMs(l);
      tr.dataset.bucket = urgencyBucket(ms);
      tr.dataset.pending = (l.status === '待存证') ? '1' : '0';
      var btn = tr.querySelector('[data-action="openEvidence"]');
      if (btn) btn.disabled = (l.status !== '待存证');
    });
    applyTodoFilter();
  }

  // 最近动作指示器：任何操作都写入时间戳文本，保证界面状态可观测（同时也是空交互的护栏）
  function clockNow() {
    var d = new Date();
    return pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
  }

  function markAction(label) {
    var el = $('lastAction');
    if (el) el.textContent = '最近动作：' + label + ' · ' + clockNow();
  }

  // ---------- 5. 筛选：独立状态位 + 全量重算（显隐状态位契约） ----------
  function leadMatch(l, kw, channel, risk, status) {
    if (channel !== 'all' && l.channel !== channel) return false;
    if (risk !== 'all' && l.risk !== risk) return false;
    if (status !== 'all' && l.status !== status) return false;
    if (kw) {
      var hay = (l.no + ' ' + l.patentNo + ' ' + l.title + ' ' + l.item + ' ' + l.seller).toLowerCase();
      if (hay.indexOf(kw.toLowerCase()) === -1) return false;
    }
    return true;
  }

  function applyLeadFilter() {
    var kw = ($('p2Keyword') && $('p2Keyword').value || '').trim();
    var channel = $('p2Channel') ? $('p2Channel').value : 'all';
    var risk = $('p2Risk') ? $('p2Risk').value : 'all';
    var status = $('p2Status') ? $('p2Status').value : 'all';

    var matched = [];
    LEADS.forEach(function (l, i) {
      var ok = leadMatch(l, kw, channel, risk, status);
      l._filtered = ok ? '1' : '0';
      if (ok) matched.push(i);
    });

    // 首行（data-idx=0）常驻显示：它承载表格内 L3 标注锚点，随翻页隐藏会导致标注不可见；
    // 其余命中行按每页 pageSize-1 条分页（首行占 1 个名额，每页总可见仍为 pageSize 条）
    var perPage = Math.max(1, pageSize - 1);
    var pageItems = matched.filter(function (i) { return i !== 0; });
    var totalPages = Math.max(1, Math.ceil(pageItems.length / perPage));
    if (leadPage > totalPages) leadPage = totalPages;
    var start = (leadPage - 1) * perPage;
    var pageSet = pageItems.slice(start, start + perPage);

    LEADS.forEach(function (l, i) {
      var tr = document.querySelector('#leadBody tr[data-idx="' + i + '"]');
      if (!tr) return;
      tr.dataset.filtered = l._filtered;
      var onPage = (i === 0) || (pageSet.indexOf(i) >= 0);
      tr.dataset.onpage = onPage ? '1' : '0';
      tr.style.display = (l._filtered === '0' || !onPage) ? 'none' : '';
    });

    var counts = { '待存证': 0, '已存证': 0, '已立案': 0, '已失效': 0, '已忽略': 0 };
    matched.forEach(function (i) { if (counts[LEADS[i].status] !== undefined) counts[LEADS[i].status]++; });
    if ($('leadTotal')) $('leadTotal').textContent = String(matched.length);
    if ($('leadCountText')) $('leadCountText').textContent = String(matched.length);
    if ($('leadPending')) $('leadPending').textContent = String(counts['待存证']);
    if ($('leadEvidenced')) $('leadEvidenced').textContent = String(counts['已存证']);
    if ($('leadFiled')) $('leadFiled').textContent = String(counts['已立案']);
    if ($('leadExpired')) $('leadExpired').textContent = String(counts['已失效']);
    if ($('leadIgnored')) $('leadIgnored').textContent = String(counts['已忽略']);
    if ($('leadPagerInfo')) $('leadPagerInfo').textContent = '第 ' + leadPage + ' / ' + totalPages + ' 页 · 每页 ' + pageSize + ' 条 · 命中 ' + matched.length + ' 条';
    if ($('leadPrev')) $('leadPrev').disabled = (leadPage <= 1);
    if ($('leadNext')) $('leadNext').disabled = (leadPage >= totalPages);
    if ($('leadEmpty')) $('leadEmpty').hidden = (matched.length > 0);
    syncCheckAllState();
  }

  function currentUrgencyFilter() {
    var active = document.querySelector('#todoBody') ? document.querySelector('.chip-tabs .chip.is-active[data-urgency]') : null;
    return active ? active.getAttribute('data-urgency') : 'all';
  }

  function applyTodoFilter() {
    var urgency = currentUrgencyFilter();
    var visible = 0;
    qsa('#todoBody tr').forEach(function (tr) {
      var no = tr.getAttribute('data-lead');
      var l = leadByNo(no);
      var okUrgency = true;
      var okChannel = (dashboardChannel === 'all' || tr.getAttribute('data-channel') === dashboardChannel);
      if (urgency !== 'all') {
        var ms = l ? remainMs(l) : null;
        okUrgency = (urgencyBucket(ms) === urgency);
      }
      var ok = okUrgency && okChannel && tr.dataset.pending === '1';
      tr.dataset.filtered = ok ? '1' : '0';
      tr.style.display = ok ? '' : 'none';
      if (ok) visible++;
    });
    if ($('todoEmpty')) $('todoEmpty').hidden = (visible > 0);
    if ($('todoCount')) $('todoCount').textContent = String(visible);
  }

  function syncCheckAllState() {
    var boxes = qsa('#leadBody .row-check').filter(function (b) {
      var tr = b.closest('tr');
      return tr && tr.dataset.onpage === '1' && tr.dataset.filtered === '1';
    });
    var checkAll = $('leadCheckAll');
    if (checkAll) {
      var selectable = boxes.filter(function (b) {
        var l = leadByNo(b.getAttribute('data-lead'));
        return l && l.status === '待存证';
      });
      checkAll.disabled = (selectable.length === 0);
      checkAll.checked = (selectable.length > 0 && selectable.every(function (b) { return b.checked; }));
    }
    updateBatchState();
  }

  function checkedLeads() {
    return qsa('#leadBody .row-check').filter(function (b) { return b.checked; })
      .map(function (b) { return b.getAttribute('data-lead'); });
  }

  function updateBatchState() {
    var sel = checkedLeads();
    var btn = document.querySelector('[data-action="batchEvidence"]');
    var hint = $('batchHint');
    if (!btn) return;
    var pending = sel.filter(function (no) {
      var l = leadByNo(no);
      return l && l.status === '待存证';
    });
    var allowed = (currentRole !== 'rights_lawyer');
    btn.disabled = (pending.length === 0 || !allowed);
    if (hint) {
      hint.textContent = sel.length === 0
        ? '尚未勾选线索。'
        : ('已选 ' + sel.length + ' 条，其中 ' + pending.length + ' 条可存证' + (allowed ? '' : '（当前角色无存证权限）'));
    }
  }

  // ---------- 6. 渲染：案件 / 规则 / 排行 ----------
  function caseRowHtml(c, i) {
    return '<tr data-dynamic="1" data-idx="' + i + '" data-case="' + c.no + '" data-status="' + c.status + '" data-strategy="' + c.strategy + '" data-owner="' + c.owner + '" data-patent="' + c.patentNo + '" data-seller="' + esc(c.seller) + '">' +
      '<td class="mono">' + c.no + '</td>' +
      '<td><span class="cell-main">' + esc(c.patentTitle) + '</span><em class="mono dim">' + c.patentNo + '</em></td>' +
      '<td>' + esc(c.seller) + '</td>' +
      '<td>' + c.strategy + '</td>' +
      '<td>' + c.region + ' · ' + c.platform + '</td>' +
      '<td class="mono js-rule">' + (c.ruleCode || '—') + '</td>' +
      '<td class="js-status">' + caseStatusTag(c.status) + '</td>' +
      '<td class="js-owner">' + c.owner + '</td>' +
      '<td class="col-ops">' +
        '<button type="button" class="btn-accent btn-sm" data-action="advanceCase" data-case="' + c.no + '"' + (c.status === '已结案' ? ' disabled' : '') + '>推进状态</button> ' +
        '<button type="button" class="btn-link" data-action="viewEvidence" data-case="' + c.no + '">查看证据</button> ' +
        '<button type="button" class="btn-link btn-muted" data-action="escalateCase" data-case="' + c.no + '"' + (c.owner === '维权律师' ? ' disabled' : '') + '>升级律师</button>' +
      '</td>' +
    '</tr>';
  }

  function caseStatusTag(status) {
    var map = {
      '待处置': 'status-warning',
      '处置中': 'status-primary',
      '平台受理': 'status-primary',
      '已结案': 'status-success',
      '已驳回': 'status-danger'
    };
    return '<span class="status ' + (map[status] || 'status-muted') + '">' + status + '</span>';
  }

  function renderCases() {
    var body = $('caseBody');
    if (!body) return;
    qsa('tr[data-dynamic]', body).forEach(function (tr) { tr.remove(); });
    var html = '';
    for (var i = 1; i < CASES.length; i++) html += caseRowHtml(CASES[i], i);
    body.insertAdjacentHTML('beforeend', html);
    var c0 = CASES[0];
    var firstTr = body.querySelector('tr[data-idx="0"]');
    if (firstTr) {
      firstTr.setAttribute('data-status', c0.status);
      firstTr.setAttribute('data-owner', c0.owner);
      var st = firstTr.querySelector('.js-status');
      if (st) st.innerHTML = caseStatusTag(c0.status);
      var ow = firstTr.querySelector('.js-owner');
      if (ow) ow.textContent = c0.owner;
      var rl = firstTr.querySelector('.js-rule');
      if (rl) rl.textContent = c0.ruleCode || '—';
      var adv = firstTr.querySelector('[data-action="advanceCase"]');
      if (adv) adv.disabled = (c0.status === '已结案');
      var esc2 = firstTr.querySelector('[data-action="escalateCase"]');
      if (esc2) esc2.disabled = (c0.owner === '维权律师');
    }
    applyCaseFilter();
  }

  function caseMatch(c, kw, strategy, status, owner) {
    if (strategy !== 'all' && c.strategy !== strategy) return false;
    if (status !== 'all' && c.status !== status) return false;
    if (owner !== 'all' && c.owner !== owner) return false;
    if (kw) {
      var hay = (c.no + ' ' + c.patentNo + ' ' + c.patentTitle + ' ' + c.seller).toLowerCase();
      if (hay.indexOf(kw.toLowerCase()) === -1) return false;
    }
    return true;
  }

  function applyCaseFilter() {
    var kw = ($('p4Keyword') && $('p4Keyword').value || '').trim();
    var strategy = $('p4Strategy') ? $('p4Strategy').value : 'all';
    var status = $('p4Status') ? $('p4Status').value : 'all';
    var owner = $('p4Owner') ? $('p4Owner').value : 'all';

    var matched = [];
    CASES.forEach(function (c, i) {
      var ok = caseMatch(c, kw, strategy, status, owner);
      c._filtered = ok ? '1' : '0';
      if (ok) matched.push(i);
    });

    // 首行常驻（承载表格内 L3 标注锚点），其余命中行按每页 pageSize-1 条分页
    var perPageC = Math.max(1, pageSize - 1);
    var pageItemsC = matched.filter(function (i) { return i !== 0; });
    var totalPages = Math.max(1, Math.ceil(pageItemsC.length / perPageC));
    if (casePage > totalPages) casePage = totalPages;
    var startC = (casePage - 1) * perPageC;
    var pageSetC = pageItemsC.slice(startC, startC + perPageC);

    CASES.forEach(function (c, i) {
      var tr = document.querySelector('#caseBody tr[data-idx="' + i + '"]');
      if (!tr) return;
      var onPage = (i === 0) || (pageSetC.indexOf(i) >= 0);
      tr.dataset.filtered = c._filtered;
      tr.dataset.onpage = onPage ? '1' : '0';
      tr.style.display = (c._filtered === '0' || !onPage) ? 'none' : '';
    });

    var counts = { '待处置': 0, '处置中': 0, '平台受理': 0, '已结案': 0, '已驳回': 0 };
    matched.forEach(function (i) { if (counts[CASES[i].status] !== undefined) counts[CASES[i].status]++; });
    if ($('caseTotal')) $('caseTotal').textContent = String(matched.length);
    if ($('caseCountText')) $('caseCountText').textContent = String(matched.length);
    if ($('casePending')) $('casePending').textContent = String(counts['待处置']);
    if ($('caseProcessing')) $('caseProcessing').textContent = String(counts['处置中']);
    if ($('caseAccepted')) $('caseAccepted').textContent = String(counts['平台受理']);
    if ($('caseClosed')) $('caseClosed').textContent = String(counts['已结案']);
    if ($('caseRejected')) $('caseRejected').textContent = String(counts['已驳回']);
    if ($('casePagerInfo')) $('casePagerInfo').textContent = '第 ' + casePage + ' / ' + totalPages + ' 页 · 每页 ' + pageSize + ' 条 · 命中 ' + matched.length + ' 条';
    if ($('casePrev')) $('casePrev').disabled = (casePage <= 1);
    if ($('caseNext')) $('caseNext').disabled = (casePage >= totalPages);
    if ($('caseEmpty')) $('caseEmpty').hidden = (matched.length > 0);
  }

  function ruleRowHtml(r) {
    return '<tr data-dynamic="1" data-rule="' + r.code + '" data-region="' + r.region + '" data-platform="' + r.platform + '" data-enabled="' + (r.enabled ? '1' : '0') + '">' +
      '<td class="mono">' + r.code + '</td>' +
      '<td>' + r.region + '</td>' +
      '<td>' + r.platform + '</td>' +
      '<td>' + esc(r.channel) + '</td>' +
      '<td class="mono">' + r.sla + ' 工作日</td>' +
      '<td>' + esc(r.template) + '</td>' +
      '<td class="js-enabled">' + (r.enabled ? '<span class="status status-success">已启用</span>' : '<span class="status status-muted">已停用</span>') + '</td>' +
      '<td class="mono js-bound">' + r.bound.length + '</td>' +
      '<td class="col-ops">' +
        '<button type="button" class="btn-link" data-action="editRule" data-rule="' + r.code + '">编辑</button> ' +
        '<button type="button" class="btn-accent btn-sm" data-action="bindRule" data-rule="' + r.code + '"' + (r.enabled ? '' : ' disabled') + '>绑定案件</button> ' +
        '<button type="button" class="btn-link btn-muted" data-action="downloadTemplate" data-rule="' + r.code + '"' + (r.template ? '' : ' disabled') + '>下载模板</button>' +
      '</td>' +
    '</tr>';
  }

  function renderRules() {
    var body = $('ruleBody');
    if (!body) return;
    qsa('tr[data-dynamic]', body).forEach(function (tr) { tr.remove(); });
    var html = '';
    for (var i = 1; i < RULES.length; i++) html += ruleRowHtml(RULES[i]);
    body.insertAdjacentHTML('beforeend', html);
    applyRuleFilter();
  }

  function applyRuleFilter() {
    var region = $('p5Region') ? $('p5Region').value : 'all';
    var platform = $('p5Platform') ? $('p5Platform').value : 'all';
    var kw = ($('p5Keyword') && $('p5Keyword').value || '').trim();
    var visible = 0;
    RULES.forEach(function (r) {
      var tr = document.querySelector('#ruleBody tr[data-rule="' + r.code + '"]');
      if (!tr) return;
      var ok = (region === 'all' || r.region === region) &&
               (platform === 'all' || r.platform === platform) &&
               (!kw || (r.code + ' ' + r.template).toLowerCase().indexOf(kw.toLowerCase()) >= 0);
      tr.dataset.filtered = ok ? '1' : '0';
      tr.style.display = ok ? '' : 'none';
      if (ok) visible++;
    });
    if ($('ruleEmpty')) $('ruleEmpty').hidden = (visible > 0);
    if ($('ruleCountText')) $('ruleCountText').textContent = String(visible);
  }

  function renderRanking() {
    var body = $('rankBody');
    if (!body) return;
    qsa('tr[data-dynamic]', body).forEach(function (tr) { tr.remove(); });
    var html = '';
    for (var i = 1; i < RANKING.length; i++) {
      var r = RANKING[i];
      html += '<tr data-dynamic="1" data-patent="' + r.patentNo + '"><td class="mono">' + (i + 1) + '</td><td class="mono">' + r.patentNo + '</td><td>' + esc(r.title) +
        '</td><td class="mono">' + r.cases + '</td><td class="mono">' + r.rate + '%</td><td class="mono">' + r.gain.toFixed(1) + '</td>' +
        '<td class="col-ops"><button type="button" class="btn-link" data-action="viewPatentCases" data-patent="' + r.patentNo + '">查看案件</button></td></tr>';
    }
    body.insertAdjacentHTML('beforeend', html);
  }

  function renderStats() {
    var pending = LEADS.filter(function (l) { return l.status === '待存证'; }).length;
    var highRisk = LEADS.filter(function (l) { return l.risk === '高'; }).length;
    var closed = CASES.filter(function (c) { return c.status === '已结案'; });
    var takedown = closed.filter(function (c) { return c.outcome === '已下架'; }).length;
    var gain = closed.reduce(function (s, c) { return s + (c.gain || 0); }, 0);
    var days = closed.map(function (c) {
      return (new Date(c.closedAt) - new Date(c.createdAt)) / 86400000;
    }).filter(function (d) { return !isNaN(d); });
    var avg = days.length ? (days.reduce(function (a, b) { return a + b; }, 0) / days.length) : 0;

    if ($('p1PendingCount')) $('p1PendingCount').textContent = String(pending);
    if ($('kpiPending')) $('kpiPending').textContent = String(pending);
    if ($('kpiHighRisk')) $('kpiHighRisk').textContent = String(highRisk);
    if ($('kpiTakedown')) $('kpiTakedown').textContent = String(takedown);
    if ($('kpiCycle')) $('kpiCycle').innerHTML = avg.toFixed(1) + '<em>天</em>';
    if ($('kpiTakedownRate')) $('kpiTakedownRate').innerHTML = (closed.length ? Math.round(takedown / closed.length * 100) : 0) + '<em>%</em>';
    if ($('kpiCloseRate')) $('kpiCloseRate').innerHTML = Math.round(closed.length / CASES.length * 100) + '<em>%</em>';
    if ($('kpiAvgCycle')) $('kpiAvgCycle').innerHTML = avg.toFixed(1) + '<em>天</em>';
    if ($('kpiGain')) $('kpiGain').innerHTML = gain.toFixed(1) + '<em>万</em>';

    var riskBars = $('riskBars');
    if (riskBars) {
      var pool = LEADS.filter(function (l) { return dashboardChannel === 'all' || l.channel === dashboardChannel; });
      var total = pool.length || 1;
      ['高', '中', '低'].forEach(function (lv, idx) {
        var n = pool.filter(function (l) { return l.risk === lv; }).length;
        var li = riskBars.children[idx];
        if (!li) return;
        li.querySelector('.bar-fill').style.width = Math.round(n / total * 100) + '%';
        li.querySelector('.bar-num').textContent = String(n);
      });
    }
  }

  function renderTrend() {
    var data = CHANNEL_TREND[dashboardChannel] || CHANNEL_TREND.all;
    var cols = qsa('#trendChart .trend-bar');
    cols.forEach(function (bar, i) { bar.style.height = (data[i] || 10) + '%'; });
    var sum = data.reduce(function (a, b) { return a + b; }, 0);
    var note = $('trendNote');
    if (note) {
      note.textContent = dashboardChannel === 'all'
        ? ('近七日共命中 ' + sum + ' 条，跨境平台占 41%。')
        : ('渠道「' + dashboardChannel + '」近七日共命中 ' + sum + ' 条。');
    }
  }

  // ---------- 7. 详情页（P03） ----------
  function loadEvidence(leadNo) {
    var l = leadByNo(leadNo);
    if (!l) return;
    currentLeadNo = leadNo;
    var ev = evidenceByLead(leadNo);
    if ($('evLeadNo')) $('evLeadNo').textContent = l.no;
    if ($('evTitle')) $('evTitle').textContent = l.title;
    if ($('evSub')) $('evSub').textContent = l.seller + ' · ' + l.channel + ' · ' + l.platform + ' · 相似度 ' + l.similarity + '% · ' + l.risk + '风险';

    var grid = $('evBaseInfo');
    if (grid) {
      grid.innerHTML =
        '<div><dt>专利号</dt><dd class="mono">' + l.patentNo + '</dd></div>' +
        '<div><dt>商品标题</dt><dd>' + esc(l.item) + '</dd></div>' +
        '<div><dt>命中时间</dt><dd class="mono">' + l.hitTime + '</dd></div>' +
        '<div><dt>存证截止</dt><dd class="mono">' + (l.deadline ? new Date(l.deadline).toLocaleString('zh-CN', { hour12: false }) : '—') + '</dd></div>' +
        '<div><dt>剩余时长</dt><dd class="mono countdown" data-countdown="' + l.no + '">—</dd></div>' +
        '<div><dt>命中商品数</dt><dd class="mono">' + l.hitCount + '</dd></div>';
    }

    if ($('evNo')) $('evNo').textContent = ev ? ev.no : 'EV-待生成';
    if ($('evHash')) $('evHash').textContent = ev && ev.hash ? ev.hash : '待存证后生成';
    if ($('evHeight')) $('evHeight').textContent = ev && ev.height ? String(ev.height) : '—';
    if ($('evChainTime')) $('evChainTime').textContent = ev && ev.chainTime ? ev.chainTime : '—';
    if ($('evStatus')) {
      var st = ev ? ev.status : '待存证';
      $('evStatus').textContent = st;
      $('evStatus').className = 'status ' + (st === '已上链' ? 'status-success' : (st === '已失效' ? 'status-danger' : 'status-warning'));
    }

    renderTimeline(leadNo);
    var chain = (ev && ev.status === '已上链');
    var methodSel = $('evMethod');
    if (methodSel) methodSel.disabled = chain;
    var submit = $('evSubmit');
    if (submit) {
      submit.disabled = (l.status !== '待存证');
      submit.textContent = (l.status === '已存证' || chain) ? '已存证' : (l.status === '已失效' ? '证据已失效' : '发起存证');
    }
    var copyBtn = $('evCopy');
    if (copyBtn) copyBtn.disabled = !chain;
    var fmtSel = $('reportFormat');
    if (fmtSel) fmtSel.disabled = !chain;
    var repBtn = $('reportBtn');
    if (repBtn) repBtn.disabled = !chain;
    if ($('reportNo')) $('reportNo').textContent = ev && ev.reportNo ? ev.reportNo : '—';
    if ($('reportState')) $('reportState').textContent = ev && ev.reportNo ? '已生成' : '待上链后生成';
    var fileHint = $('evFileHint');
    if (fileHint) {
      fileHint.textContent = (l.status === '已存证' || chain)
        ? (hasOpenCase(l) ? '该卖家与该专利已存在在办案件，立案将被拦截。' : '证据已上链，可以立案。')
        : '当前证据尚未上链，立案提交时将被拦截。';
    }
    tickCountdown();
  }

  function hasOpenCase(l) {
    return CASES.some(function (c) {
      return c.seller === l.seller && c.patentNo === l.patentNo && c.status !== '已结案' && c.status !== '已驳回';
    });
  }

  function timelineItems(leadNo) {
    var l = leadByNo(leadNo) || { hitTime: '' };
    var ev = evidenceByLead(leadNo);
    var items = [
      { kind: '快照', time: l.hitTime, title: '监测命中', desc: '爬虫在 ' + (l.platform || '—') + ' 捕获涉嫌商品页面，相似度 ' + (l.similarity || 0) + '%。' },
      { kind: '快照', time: l.hitTime, title: '页面快照固化', desc: '保存商品页、店铺资质与价格信息共 ' + (ev ? ev.files : 7) + ' 份文件。' },
      { kind: '录屏', time: l.hitTime, title: '录屏取证', desc: '录屏记录浏览与下单流程，含卖家主体信息。' }
    ];
    if (ev && ev.status === '已上链') {
      items.push({ kind: '上链', time: ev.chainTime, title: '区块链上链', desc: '存证哈希写入区块高度 ' + ev.height + '，时间戳不可篡改。' });
    }
    return items;
  }

  function renderTimeline(leadNo) {
    var ol = $('evTimeline');
    if (!ol) return;
    ol.innerHTML = timelineItems(leadNo).map(function (it) {
      return '<li class="tl-item" data-kind="' + it.kind + '">' +
        '<span class="tl-dot"></span>' +
        '<span class="tl-time mono">' + esc(it.time || '—') + '</span>' +
        '<span class="tl-title">' + esc(it.title) + '</span>' +
        '<span class="tl-desc">' + esc(it.desc) + '</span></li>';
    }).join('');
    applyTimelineFilter();
  }

  function applyTimelineFilter() {
    var visible = 0;
    qsa('#evTimeline .tl-item').forEach(function (li) {
      var ok = (timelineKind === 'all' || li.getAttribute('data-kind') === timelineKind);
      li.dataset.filtered = ok ? '1' : '0';
      li.style.display = ok ? '' : 'none';
      if (ok) visible++;
    });
    if ($('timelineEmpty')) $('timelineEmpty').hidden = (visible > 0);
  }

  // ---------- 8. 规则详情 ----------
  function loadRuleDetail(code) {
    var r = ruleByCode(code);
    if (!r) return;
    currentRuleCode = code;
    if ($('rdCode')) $('rdCode').textContent = r.code;
    if ($('rdMaterials')) $('rdMaterials').textContent = r.materials;
    if ($('rdCases')) $('rdCases').textContent = r.bound.length ? r.bound.join('、') : '尚未绑定案件';
    var sw = document.querySelector('[data-action="toggleRule"][data-rule="' + code + '"]');
    if (sw) {
      sw.classList.toggle('is-on', r.enabled);
      sw.setAttribute('aria-pressed', r.enabled ? 'true' : 'false');
      var txt = sw.querySelector('.switch-text');
      if (txt) txt.textContent = r.enabled ? '已启用' : '已停用';
    }
    var list = $('bindList');
    if (list) {
      list.innerHTML = r.bound.length
        ? r.bound.map(function (cn) {
            var c = caseByNo(cn) || { region: '—', platform: '—' };
            return '<div class="bind-item"><span class="mono">' + cn + '</span><span>' + c.region + ' · ' + c.platform + '</span><span class="status status-success">已绑定</span></div>';
          }).join('')
        : '<div class="bind-item"><span class="mono">—</span><span>暂无绑定案件，点击规则行内「绑定案件」可关联。</span><span class="status status-muted">未绑定</span></div>';
    }
  }

  // ---------- 9. 存证 / 立案 业务动作 ----------
  function doEvidenceFor(leadNo, method, files) {
    var l = leadByNo(leadNo);
    if (!l) return { ok: false, msg: '线索不存在' };
    if (l.status !== '待存证') return { ok: false, msg: '该线索当前状态不可存证' };
    var ms = remainMs(l);
    if (ms !== null && ms <= 0) {
      l.status = '已失效';
      return { ok: false, msg: '已超过 24 小时存证窗口，证据失效' };
    }
    l.status = '已存证';
    var ev = evidenceByLead(leadNo);
    if (!ev) {
      evidenceSeq += 1;
      ev = { no: 'EV-20260829-0' + evidenceSeq, leadNo: leadNo, method: method, hash: '', height: null, chainTime: '', status: '存证中', reportNo: '', operator: ROLE_LABELS[currentRole], files: files };
      EVIDENCE.unshift(ev);
    }
    ev.method = method;
    ev.files = files;
    ev.status = '已上链';
    ev.hash = randHash();
    ev.height = 18422931 + evidenceSeq * 37;
    ev.chainTime = stampNow();
    ev.operator = ROLE_LABELS[currentRole];
    return { ok: true, msg: '存证完成，哈希已上链（区块高度 ' + ev.height + '）', ev: ev };
  }

  function openCaseModal(preferLead) {
    var sel = $('caseLead');
    if (sel) {
      var candidates = LEADS.filter(function (l) { return l.status === '已存证'; });
      sel.innerHTML = candidates.map(function (l) {
        return '<option value="' + l.no + '">' + l.no + ' · ' + esc(l.title) + ' · ' + esc(l.seller) + '</option>';
      }).join('') || '<option value="">暂无已存证线索</option>';
      if (preferLead) sel.value = preferLead;
    }
    var ruleSel = $('caseRule');
    if (ruleSel) {
      ruleSel.innerHTML = '<option value="">不绑定</option>' + RULES.filter(function (r) { return r.enabled; }).map(function (r) {
        return '<option value="' + r.code + '">' + r.code + ' · ' + r.region + ' · ' + r.platform + '</option>';
      }).join('');
    }
    var err = $('caseError');
    if (err) { err.hidden = true; err.textContent = ''; }
    var regionSel = $('caseRegion');
    if (regionSel) regionSel.value = '中国大陆';
    openModal('modalCase');
  }

  function duplicateCase(l) {
    for (var i = 0; i < CASES.length; i++) {
      var c = CASES[i];
      if (c.seller === l.seller && c.patentNo === l.patentNo && c.status !== '已结案' && c.status !== '已驳回') return c;
    }
    return null;
  }

  // ---------- 10. 角色权限 ----------
  function applyRole() {
    var label = ROLE_LABELS[currentRole] || currentRole;
    var canCreateTask = (currentRole !== 'rights_lawyer');
    var canFileCase = (currentRole !== 'monitoring_analyst');
    var canEditRule = (currentRole !== 'monitoring_analyst');
    var canEvidence = (currentRole !== 'rights_lawyer');

    var taskBtn = document.querySelector('[data-action="newTask"]');
    if (taskBtn) taskBtn.disabled = !canCreateTask;
    if ($('taskHint')) $('taskHint').textContent = canCreateTask ? '配置专利号与监测渠道，任务进入监测队列。' : '当前角色为维权律师，无新建监测任务权限。';

    var caseBtn = document.querySelector('[data-page-id="P04"] [data-action="newCase"]');
    if (caseBtn) {
      caseBtn.disabled = !canFileCase;
    }
    var evFileBtn = $('evFileBtn');
    if (evFileBtn) {
      var l = leadByNo(currentLeadNo);
      var ev = evidenceByLead(currentLeadNo);
      var chain = !!(ev && ev.status === '已上链');
      evFileBtn.disabled = !canFileCase;
      if ($('evFileHint')) {
        $('evFileHint').textContent = !canFileCase
          ? '当前角色为监测分析师，立案提交将被拦截。'
          : ((l && (l.status === '已存证' || chain)) ? '证据已上链，可以立案。' : '当前证据尚未上链，立案提交时将被拦截。');
      }
    }

    var ruleBtn = document.querySelector('[data-action="newRule"]');
    if (ruleBtn) ruleBtn.disabled = !canEditRule;
    if ($('ruleHint')) $('ruleHint').textContent = '当前角色：' + label + (canEditRule ? '，可维护规则模板。' : '，仅可查看规则模板。');
    if ($('caseHint')) $('caseHint').textContent = '当前角色：' + label + (canFileCase ? '，可立案与导出。' : '，仅可查看案件。');

    qsa('[data-action="editRule"]').forEach(function (b) { b.disabled = !canEditRule; });
    qsa('[data-action="openEvidence"], [data-action="doEvidence"]').forEach(function (b) {
      var no = b.getAttribute('data-lead');
      var l2 = leadByNo(no);
      if (l2 && l2.status !== '待存证') { b.disabled = true; return; }
      b.disabled = !canEvidence;
    });
    updateBatchState();
  }

  // ---------- 11. 交互派发 ----------
  function closeAllModals() {
    qsa('.modal, [data-modal-id], [role="dialog"]').forEach(function (m) {
      m.style.display = 'none';
      m.removeAttribute('hidden');
    });
  }

  function jump(pageId) {
    closeAllModals();
    if (typeof route === 'function') route(pageId);
  }

  function setSelect(id, value) {
    var el = $(id);
    if (el) el.value = value;
  }

  function csv(name, rows) {
    try {
      var blob = new Blob(['\ufeff' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    } catch (e) { return false; }
  }

  var ACTION_LABELS = {
    switchRole: '切换角色', gotoLeads: '跳转线索清单', gotoCases: '跳转案件中心', gotoAnalytics: '跳转维权统计',
    gotoRules: '跳转跨境规则', gotoCasesClosed: '筛选已结案案件', gotoEvidence: '查看线索详情', viewEvidence: '查看案件证据',
    viewPatentCases: '按专利筛选案件', openEvidence: '打开存证弹窗', confirmEvidence: '确认存证', doEvidence: '发起区块链存证',
    copyHash: '复制存证哈希', generateReport: '生成取证报告', filterTimeline: '切换证据类型', filterUrgency: '按存证时效筛选',
    filterDashboardChannel: '切换监测渠道', filterLeads: '筛选线索', resetLeads: '重置线索筛选', ignoreLead: '判定线索忽略',
    leadPrev: '线索上一页', leadNext: '线索下一页', batchEvidence: '批量存证', exportLeads: '导出线索',
    filterCases: '筛选案件', resetCases: '重置案件筛选', casePrev: '案件上一页', caseNext: '案件下一页',
    advanceCase: '推进案件状态', escalateCase: '升级至维权律师', exportCases: '导出案件台账', newCase: '打开立案弹窗',
    submitCase: '提交立案', filterRules: '筛选规则', resetRules: '重置规则筛选', editRule: '编辑规则',
    newRule: '打开新建规则', submitRule: '保存规则', toggleRule: '切换规则启用', bindRule: '绑定跨境案件',
    downloadTemplate: '下载规则模板', newTask: '打开新建任务', submitTask: '创建监测任务', filterAnalytics: '切换统计范围',
    exportAnalytics: '导出统计报表', focusTakedown: '定位渠道分布', focusRegion: '定位地区分布', focusRanking: '定位专利排行',
    pickEvidenceMethod: '选择存证方式', pickReportFormat: '选择报告格式'
  };

  window.handleDemoAction = function (action, target) {
    markAction(ACTION_LABELS[action] || action);
    switch (action) {
      case 'switchRole': {
        var roleSel = $('roleSwitch');
        currentRole = roleSel ? roleSel.value : target.value;
        applyRole();
        toast('已切换为' + (ROLE_LABELS[currentRole] || currentRole) + '，操作权限已更新');
        break;
      }
      case 'gotoLeads': {
        var st = target.getAttribute('data-status');
        var rk = target.getAttribute('data-risk');
        if (st) setSelect('p2Status', st);
        if (rk) setSelect('p2Risk', rk);
        leadPage = 1;
        applyLeadFilter();
        jump('P02');
        toast(st ? ('已按「' + st + '」筛选线索') : (rk ? '已跳转案件中心并按高风险筛选' : '已跳转侵权线索清单'));
        break;
      }
      case 'gotoCases': {
        var risk = target.getAttribute('data-risk');
        if (risk) {
          setSelect('p4Keyword', '');
          var highCases = CASES.filter(function (c) { return c.risk === '高'; }).length;
          if ($('caseHint')) $('caseHint').textContent = '高风险案件 ' + highCases + ' 件，已按风险口径展示。';
        }
        casePage = 1;
        applyCaseFilter();
        jump('P04');
        toast('已跳转维权案件中心');
        break;
      }
      case 'gotoAnalytics': { jump('P06'); toast('已跳转维权统计'); break; }
      case 'gotoRules': { jump('P05'); toast('已跳转跨境规则库'); break; }
      case 'gotoCasesClosed': {
        setSelect('p4Status', '已结案');
        casePage = 1;
        applyCaseFilter();
        jump('P04');
        toast('已按「已结案」筛选案件');
        break;
      }
      case 'gotoEvidence': {
        var no = target.getAttribute('data-lead');
        loadEvidence(no);
        jump('P03');
        toast('已载入线索 ' + no);
        break;
      }
      case 'viewEvidence': {
        var cn = target.getAttribute('data-case');
        var c = caseByNo(cn);
        if (c) { loadEvidence(c.leadNo); jump('P03'); toast('已载入案件 ' + cn + ' 的关联证据'); }
        break;
      }
      case 'viewPatentCases': {
        var patent = target.getAttribute('data-patent');
        setSelect('p4Keyword', patent);
        setSelect('p4Status', 'all');
        setSelect('p4Strategy', 'all');
        setSelect('p4Owner', 'all');
        casePage = 1;
        applyCaseFilter();
        jump('P04');
        toast('已按专利 ' + patent + ' 筛选案件');
        break;
      }
      case 'openEvidence': {
        var leadNo = target.getAttribute('data-lead');
        var lead = leadByNo(leadNo);
        if (!lead) break;
        if (lead.status !== '待存证') { toast('该线索当前状态为' + lead.status + '，不可存证'); break; }
        var leadLabel = $('evModalLead');
        if (leadLabel) leadLabel.textContent = '线索 ' + lead.no + ' · ' + lead.title + ' · ' + lead.seller;
        var note = $('evModalNote');
        if (note) note.textContent = '剩余存证时长 ' + fmtRemain(remainMs(lead)) + '，超时后证据失效。';
        var modal = $('modalEvidence');
        if (modal) modal.setAttribute('data-lead', leadNo);
        openModal('modalEvidence');
        break;
      }
      case 'confirmEvidence': {
        var m = $('modalEvidence');
        var mNo = m ? m.getAttribute('data-lead') : null;
        var method = $('evModalMethod') ? $('evModalMethod').value : '区块链存证';
        var files = parseInt(($('evModalFiles') && $('evModalFiles').value) || '7', 10);
        var res = doEvidenceFor(mNo, method, isNaN(files) ? 7 : files);
        if (!res.ok) { toast(res.msg); break; }
        closeModal('modalEvidence');
        renderLeads(); renderTodo(); renderStats(); loadEvidence(mNo);
        toast(res.msg);
        break;
      }
      case 'doEvidence': {
        var method2 = $('evMethod') ? $('evMethod').value : '区块链存证';
        var r2 = doEvidenceFor(currentLeadNo, method2, 7);
        if (!r2.ok) { toast(r2.msg); break; }
        renderLeads(); renderTodo(); renderStats(); loadEvidence(currentLeadNo); applyRole();
        toast(r2.msg);
        break;
      }
      case 'copyHash': {
        var evc = evidenceByLead(currentLeadNo);
        var hashText = evc && evc.hash ? evc.hash : '';
        if (!hashText) { toast('尚无存证哈希'); break; }
        try { if (navigator.clipboard) navigator.clipboard.writeText(hashText); } catch (e) { /* 剪贴板不可用时仅提示 */ }
        var btn = $('evCopy');
        if (btn) btn.textContent = '已复制哈希';
        toast('存证哈希已复制到剪贴板');
        break;
      }
      case 'generateReport': {
        var evr = evidenceByLead(currentLeadNo);
        if (!evr || evr.status !== '已上链') { toast('证据未上链，无法生成报告'); break; }
        reportSeq += 1;
        evr.reportNo = 'RP-20260829-0' + reportSeq;
        var fmt = $('reportFormat') ? $('reportFormat').value : '标准版 PDF';
        if ($('reportNo')) $('reportNo').textContent = evr.reportNo;
        if ($('reportState')) $('reportState').textContent = '已生成 · ' + fmt;
        var rb = $('reportBtn');
        if (rb) { rb.textContent = '重新生成报告'; }
        toast('取证报告 ' + evr.reportNo + ' 已生成（' + fmt + '）');
        break;
      }
      case 'pickEvidenceMethod': {
        var mth = $('evMethod') ? $('evMethod').value : '区块链存证';
        var note = $('evMethodNote');
        if (note) {
          note.textContent = '已选择「' + mth + '」' + (mth === '区块链存证'
            ? '：上链后生成不可篡改的时间戳与区块高度。'
            : '：取证完成后仍需上链固化，方可生成取证报告。');
        }
        break;
      }
      case 'pickReportFormat': {
        var fmtSel2 = $('reportFormat');
        var fmt2 = fmtSel2 ? fmtSel2.value : '标准版 PDF';
        var st2 = $('reportState');
        if (st2) st2.textContent = '已选格式：' + fmt2 + '（生成后可在报告中引用）';
        break;
      }
      case 'filterTimeline': {
        timelineKind = target.getAttribute('data-kind');
        qsa('[data-action="filterTimeline"]').forEach(function (b) { b.classList.toggle('is-active', b === target); });
        applyTimelineFilter();
        break;
      }
      case 'filterUrgency': {
        qsa('[data-action="filterUrgency"]').forEach(function (b) { b.classList.toggle('is-active', b === target); });
        applyTodoFilter();
        var u = target.getAttribute('data-urgency');
        toast(u === 'all' ? '已显示全部时效待办' : ('已按' + (u === 'danger' ? '危险（<4h）' : '警告（4-12h）') + '筛选待办'));
        break;
      }
      case 'filterDashboardChannel': {
        var chSel = $('p1Channel');
        dashboardChannel = chSel ? chSel.value : target.value;
        renderTrend(); renderStats(); applyTodoFilter();
        toast(dashboardChannel === 'all' ? '已切换为全部渠道' : ('已切换渠道：' + dashboardChannel));
        break;
      }
      case 'filterLeads': {
        leadPage = 1;
        applyLeadFilter();
        break;
      }
      case 'resetLeads': {
        setSelect('p2Keyword', ''); setSelect('p2Channel', 'all'); setSelect('p2Risk', 'all'); setSelect('p2Status', 'all');
        leadPage = 1;
        applyLeadFilter();
        toast('筛选条件已重置');
        break;
      }
      case 'ignoreLead': {
        var ino = target.getAttribute('data-lead');
        var il = leadByNo(ino);
        if (!il) break;
        if (il.status === '已立案') { toast('该线索已立案，需先结案案件'); break; }
        il.status = '已忽略';
        renderLeads(); renderTodo(); renderStats();
        toast('线索 ' + ino + ' 已判定为忽略');
        break;
      }
      case 'leadPrev': { if (leadPage > 1) { leadPage -= 1; applyLeadFilter(); } break; }
      case 'leadNext': { leadPage += 1; applyLeadFilter(); break; }
      case 'batchEvidence': {
        var sel = checkedLeads();
        var done = 0, skipped = 0;
        sel.forEach(function (no2) {
          var l3 = leadByNo(no2);
          if (!l3) return;
          var rr = doEvidenceFor(no2, '区块链存证', 7);
          if (rr.ok) done += 1; else skipped += 1;
        });
        renderLeads(); renderTodo(); renderStats(); applyRole();
        toast('批量存证完成：成功 ' + done + ' 条，跳过 ' + skipped + ' 条');
        break;
      }
      case 'exportLeads': {
        var rows = ['线索编号,涉案专利,商品标题,渠道,平台,卖家,相似度,风险,状态'];
        var n = 0;
        LEADS.forEach(function (l4) {
          if (l4._filtered !== '1') return;
          n += 1;
          rows.push([l4.no, l4.patentNo, l4.item, l4.channel, l4.platform, l4.seller, l4.similarity + '%', l4.risk, l4.status].join(','));
        });
        csv('侵权线索-' + n + '条.csv', rows);
        var eb = document.querySelector('[data-action="exportLeads"]');
        if (eb) eb.textContent = '已导出 ' + n + ' 条';
        toast('已导出 ' + n + ' 条线索');
        break;
      }
      case 'filterCases': { casePage = 1; applyCaseFilter(); break; }
      case 'resetCases': {
        setSelect('p4Keyword', ''); setSelect('p4Strategy', 'all'); setSelect('p4Status', 'all'); setSelect('p4Owner', 'all');
        casePage = 1;
        applyCaseFilter();
        toast('案件筛选条件已重置');
        break;
      }
      case 'casePrev': { if (casePage > 1) { casePage -= 1; applyCaseFilter(); } break; }
      case 'caseNext': { casePage += 1; applyCaseFilter(); break; }
      case 'advanceCase': {
        var ano = target.getAttribute('data-case');
        var ac = caseByNo(ano);
        if (!ac) break;
        var nextMap = { '待处置': '处置中', '处置中': '平台受理', '平台受理': '已结案', '已驳回': '处置中' };
        var next = nextMap[ac.status];
        if (!next) { toast('案件已结案，不可再推进'); break; }
        if (next === '处置中' && ac.region !== '中国大陆' && !ac.ruleCode) {
          toast('跨境案件需先绑定 ' + ac.region + ' 投诉规则模板');
          jump('P05');
          break;
        }
        if (next === '平台受理' && ac.region !== '中国大陆' && !ac.ruleCode) {
          toast('跨境案件需先绑定 ' + ac.region + ' 投诉规则模板');
          jump('P05');
          break;
        }
        ac.status = next;
        if (next === '已结案') { ac.outcome = '已下架'; ac.closedAt = stampNow().slice(0, 10); ac.gain = Math.round((5 + Math.random() * 12) * 10) / 10; }
        renderCases(); renderStats(); applyRole();
        toast('案件 ' + ano + ' 已推进至' + next + (next === '已结案' ? '，处置结果：已下架' : ''));
        break;
      }
      case 'escalateCase': {
        var eno = target.getAttribute('data-case');
        var ec = caseByNo(eno);
        if (!ec) break;
        if (ec.risk !== '高' && ec.strategy !== '诉讼前置') {
          target.textContent = '不满足升级';
          target.disabled = true;
          toast('该案件风险为' + ec.risk + '且策略为' + ec.strategy + '，不满足升级条件');
          break;
        }
        ec.owner = '维权律师';
        ec.ownerName = '赵珂';
        renderCases();
        toast('案件 ' + eno + ' 已升级至维权律师');
        break;
      }
      case 'exportCases': {
        var crows = ['案件编号,涉案专利,被诉卖家,处置策略,地区,平台,绑定规则,状态,责任人'];
        var cn2 = 0;
        CASES.forEach(function (c5) {
          if (c5._filtered !== '1') return;
          cn2 += 1;
          crows.push([c5.no, c5.patentNo, c5.seller, c5.strategy, c5.region, c5.platform, c5.ruleCode || '-', c5.status, c5.owner].join(','));
        });
        csv('维权案件台账-' + cn2 + '条.csv', crows);
        var cb = document.querySelector('[data-action="exportCases"]');
        if (cb) cb.textContent = '已导出 ' + cn2 + ' 条';
        toast('已导出 ' + cn2 + ' 条案件台账');
        break;
      }
      case 'newCase': {
        var prefer = target.getAttribute('data-lead') || (function () {
          var l5 = leadByNo(currentLeadNo);
          return (l5 && l5.status === '已存证') ? currentLeadNo : null;
        })();
        openCaseModal(prefer);
        break;
      }
      case 'submitCase': {
        var selLead = $('caseLead') ? $('caseLead').value : '';
        var selStrategy = $('caseStrategy') ? $('caseStrategy').value : '';
        var selRegion = $('caseRegion') ? $('caseRegion').value : '';
        var selRule = $('caseRule') ? $('caseRule').value : '';
        var selOwner = $('caseOwner') ? $('caseOwner').value : '';
        var err = $('caseError');
        var showErr = function (msg) { if (err) { err.textContent = msg; err.hidden = false; } };
        if (!selLead) { showErr('暂无可立案线索：请先对待存证线索完成区块链存证。'); break; }
        var sl = leadByNo(selLead);
        if (!sl || sl.status !== '已存证') { showErr('所选线索尚未完成存证，立案前必须完成区块链存证。'); break; }
        if (selRegion !== '中国大陆' && !selRule) {
          showErr('跨境案件必须绑定 ' + selRegion + ' 的投诉规则模板。');
          break;
        }
        var dup = duplicateCase(sl);
        if (dup) {
          showErr('同一卖家同一专利不可重复立案，已存在在办案件 ' + dup.no + '。');
          break;
        }
        caseSeq += 1;
        var newCase = {
          no: 'CA-2026-07' + caseSeq,
          leadNo: sl.no,
          patentNo: sl.patentNo,
          patentTitle: sl.title,
          seller: sl.seller,
          strategy: selStrategy,
          region: selRegion,
          platform: sl.platform,
          ruleCode: selRule,
          status: '待处置',
          owner: selOwner,
          ownerName: selOwner === '维权律师' ? '赵珂' : '刘婷',
          risk: sl.risk,
          createdAt: stampNow().slice(0, 10),
          closedAt: '', outcome: '', gain: 0
        };
        if (sl.risk === '高') { newCase.strategy = '诉讼前置'; newCase.owner = '维权律师'; newCase.ownerName = '赵珂'; }
        CASES.unshift(newCase);
        if (selRule) {
          var rr2 = ruleByCode(selRule);
          if (rr2 && rr2.bound.indexOf(newCase.no) === -1) rr2.bound.push(newCase.no);
        }
        sl.status = '已立案';
        if (err) err.hidden = true;
        closeModal('modalCase');
        renderCases(); renderLeads(); renderTodo(); renderStats(); renderRules(); applyRole();
        jump('P04');
        toast('案件 ' + newCase.no + ' 已立案' + (newCase.risk === '高' ? '，高风险自动升级至维权律师' : ''));
        break;
      }
      case 'filterRules': { applyRuleFilter(); break; }
      case 'resetRules': {
        setSelect('p5Region', 'all'); setSelect('p5Platform', 'all'); setSelect('p5Keyword', '');
        applyRuleFilter();
        toast('规则筛选条件已重置');
        break;
      }
      case 'editRule': {
        var rcode = target.getAttribute('data-rule');
        var rr3 = ruleByCode(rcode);
        if (!rr3) break;
        var modalR = $('modalRule');
        if (modalR) { modalR.setAttribute('data-mode', 'edit'); modalR.setAttribute('data-rule', rcode); }
        var h3 = modalR ? modalR.querySelector('.modal-head h3') : null;
        if (h3) h3.textContent = '编辑跨境规则模板';
        setSelect('ruleRegion', rr3.region);
        setSelect('rulePlatform', rr3.platform);
        if ($('ruleChannel')) $('ruleChannel').value = rr3.channel;
        if ($('ruleSla')) $('ruleSla').value = String(rr3.sla);
        if ($('ruleTemplate')) $('ruleTemplate').value = rr3.template;
        var rerr = $('ruleError');
        if (rerr) rerr.hidden = true;
        openModal('modalRule');
        break;
      }
      case 'newRule': {
        var modalR2 = $('modalRule');
        if (modalR2) { modalR2.setAttribute('data-mode', 'create'); modalR2.removeAttribute('data-rule'); }
        var h3b = modalR2 ? modalR2.querySelector('.modal-head h3') : null;
        if (h3b) h3b.textContent = '新建跨境规则模板';
        if ($('ruleChannel')) $('ruleChannel').value = '';
        if ($('ruleTemplate')) $('ruleTemplate').value = '';
        var rerr2 = $('ruleError');
        if (rerr2) rerr2.hidden = true;
        openModal('modalRule');
        break;
      }
      case 'submitRule': {
        var mr = $('modalRule');
        var mode = mr ? mr.getAttribute('data-mode') : 'create';
        var channel = ($('ruleChannel') && $('ruleChannel').value || '').trim();
        var template = ($('ruleTemplate') && $('ruleTemplate').value || '').trim();
        var rerr3 = $('ruleError');
        if (!channel || !template) {
          if (rerr3) { rerr3.textContent = '请填写投诉渠道与模板名称。'; rerr3.hidden = false; }
          break;
        }
        if (mode === 'edit') {
          var re = ruleByCode(mr.getAttribute('data-rule'));
          if (re) {
            re.region = $('ruleRegion').value;
            re.platform = $('rulePlatform').value;
            re.channel = channel;
            re.sla = parseInt(($('ruleSla') && $('ruleSla').value) || '10', 10);
            re.template = template;
            renderRules(); loadRuleDetail(re.code);
            toast('规则 ' + re.code + ' 已更新');
          }
        } else {
          var seq = RULES.length + 1;
          var newCode = 'CB-' + ($('ruleRegion').value === '美国' ? 'US' : 'XX') + '-' + ($('rulePlatform').value.slice(0, 3).toUpperCase()) + '-' + (seq < 10 ? '0' + seq : seq);
          RULES.push({
            code: newCode,
            region: $('ruleRegion').value,
            platform: $('rulePlatform').value,
            channel: channel,
            sla: parseInt(($('ruleSla') && $('ruleSla').value) || '10', 10),
            materials: '专利证书、权利要求对照表、侵权比对图、购买凭证',
            template: template,
            enabled: true,
            bound: []
          });
          renderRules();
          toast('规则 ' + newCode + ' 已创建并启用');
        }
        if (rerr3) rerr3.hidden = true;
        closeModal('modalRule');
        break;
      }
      case 'toggleRule': {
        var tcode = target.getAttribute('data-rule');
        var rt = ruleByCode(tcode);
        if (!rt) break;
        rt.enabled = !rt.enabled;
        renderRules(); loadRuleDetail(tcode);
        toast('规则 ' + tcode + ' 已' + (rt.enabled ? '启用' : '停用'));
        break;
      }
      case 'bindRule': {
        var bcode = target.getAttribute('data-rule');
        var rb2 = ruleByCode(bcode);
        if (!rb2) break;
        var pending = CASES.filter(function (c6) {
          return c6.region !== '中国大陆' && !c6.ruleCode && c6.status !== '已结案';
        });
        if (!pending.length) { toast('暂无待绑定的跨境案件'); break; }
        var pick = pending[0];
        pick.ruleCode = bcode;
        rb2.bound.push(pick.no);
        renderRules(); renderCases(); loadRuleDetail(bcode);
        toast('案件 ' + pick.no + ' 已绑定规则 ' + bcode);
        break;
      }
      case 'downloadTemplate': {
        var dcode = target.getAttribute('data-rule');
        var rd = ruleByCode(dcode);
        if (!rd) break;
        csv(rd.code + '-投诉材料清单.csv', ['规则编号,地区,平台,投诉渠道,响应时效工作日,材料清单', [rd.code, rd.region, rd.platform, rd.channel, rd.sla, rd.materials].join(',')]);
        target.textContent = '已下载';
        toast('模板 ' + rd.code + ' 已下载');
        break;
      }
      case 'newTask': {
        if ($('taskPatent')) $('taskPatent').value = '';
        if ($('taskChannel')) $('taskChannel').value = '电商平台';
        if ($('taskFreq')) $('taskFreq').value = '每小时';
        if ($('taskError')) $('taskError').hidden = true;
        if ($('taskHint')) $('taskHint').textContent = '待创建：填写监测专利号后提交，任务进入监测队列。';
        break;
      }
      case 'submitTask': {
        var patent = ($('taskPatent') && $('taskPatent').value || '').trim();
        var terr = $('taskError');
        if (!patent) {
          if (terr) terr.hidden = false;
          break;
        }
        if (terr) terr.hidden = true;
        var taskNo = 'TK-20260829-0' + taskSeq;
        taskSeq += 1;
        if ($('taskHint')) {
          $('taskHint').textContent = '任务 ' + taskNo + ' 已创建：' + patent + ' · ' + $('taskChannel').value + ' · ' + $('taskFreq').value + '。';
        }
        closeModal('modalTask');
        toast('监测任务 ' + taskNo + ' 已创建');
        break;
      }
      case 'filterAnalytics': {
        analyticsRange = $('p6Range') ? $('p6Range').value : analyticsRange;
        analyticsChannel = $('p6Channel') ? $('p6Channel').value : analyticsChannel;
        applyAnalyticsFilter();
        break;
      }
      case 'exportAnalytics': {
        var arows = ['维度,数值'];
        arows.push('下架率,' + ($('kpiTakedownRate') ? $('kpiTakedownRate').textContent : ''));
        arows.push('结案率,' + ($('kpiCloseRate') ? $('kpiCloseRate').textContent : ''));
        arows.push('平均处置周期,' + ($('kpiAvgCycle') ? $('kpiAvgCycle').textContent : ''));
        arows.push('维权收益万元,' + ($('kpiGain') ? $('kpiGain').textContent : ''));
        csv('维权统计报表.csv', arows);
        var ab = document.querySelector('[data-action="exportAnalytics"]');
        if (ab) ab.textContent = '已导出报表';
        toast('统计报表已导出');
        break;
      }
      case 'focusTakedown': {
        highlightZone('P06', 2);
        scrollToZone('P06', 2);
        if ($('analyticsNote')) $('analyticsNote').textContent = '已定位渠道分布：跨境平台结案 18 件、下架 14 件，为下架贡献最高的渠道。';
        toast('已定位渠道分布，下架数占比最高的是跨境平台');
        break;
      }
      case 'focusRegion': {
        highlightZone('P06', 3);
        scrollToZone('P06', 3);
        if ($('analyticsNote')) $('analyticsNote').textContent = '已定位地区分布：欧盟平均周期 16.8 天，为跨境地区中最长。';
        toast('已定位地区分布，欧盟平均周期最长');
        break;
      }
      case 'focusRanking': {
        highlightZone('P06', 4);
        scrollToZone('P06', 4);
        if ($('analyticsNote')) $('analyticsNote').textContent = '已定位专利维权排行：CN202310884213.7 以 32.4 万元收益居首。';
        toast('已定位专利维权排行');
        break;
      }
      default: break;
    }
  };

  function scrollToZone(pageId, zoneIndex) {
    var page = document.querySelector('[data-page-id="' + pageId + '"]');
    if (!page) return;
    var zones = qsa('.zone', page);
    var z = zones[zoneIndex];
    if (z) z.scrollIntoView({ behavior: 'auto', block: 'start' });
  }

  function highlightZone(pageId, zoneIndex) {
    var page = document.querySelector('[data-page-id="' + pageId + '"]');
    if (!page) return;
    var zones = qsa('.zone', page);
    zones.forEach(function (z, i) { z.classList.toggle('is-focused', i === zoneIndex); });
  }

  function applyAnalyticsFilter() {
    var factor = analyticsRange === '7' ? 0.35 : (analyticsRange === '90' ? 1.6 : (analyticsRange === 'all' ? 2.1 : 1));
    var closed = CASES.filter(function (c) { return c.status === '已结案'; });
    var takedown = closed.filter(function (c) { return c.outcome === '已下架'; }).length;
    var gain = closed.reduce(function (s, c) { return s + (c.gain || 0); }, 0) * factor;
    var days = closed.map(function (c) { return (new Date(c.closedAt) - new Date(c.createdAt)) / 86400000; }).filter(function (d) { return !isNaN(d); });
    var avg = days.length ? (days.reduce(function (a, b) { return a + b; }, 0) / days.length) : 0;
    if ($('kpiTakedownRate')) $('kpiTakedownRate').innerHTML = (closed.length ? Math.round(takedown / closed.length * 100 * factor) : 0) + '<em>%</em>';
    if ($('kpiCloseRate')) $('kpiCloseRate').innerHTML = Math.round(closed.length / CASES.length * 100 * factor) + '<em>%</em>';
    if ($('kpiAvgCycle')) $('kpiAvgCycle').innerHTML = (avg * (analyticsRange === '7' ? 0.8 : 1)).toFixed(1) + '<em>天</em>';
    if ($('kpiGain')) $('kpiGain').innerHTML = gain.toFixed(1) + '<em>万</em>';
    if ($('analyticsNote')) {
      var rangeLabel = analyticsRange === '7' ? '近 7 日' : (analyticsRange === '90' ? '本季度' : (analyticsRange === 'all' ? '全部' : '近 30 日'));
      $('analyticsNote').textContent = rangeLabel + ' · ' + (analyticsChannel === 'all' ? '全部渠道' : analyticsChannel) + '：结案 ' + closed.length + ' 件，已下架 ' + takedown + ' 件。';
    }
  }

  // ---------- 12. 标注数据（L1 / L2 / L3，与需求模型一致） ----------
  window.__ANNOTATION_DATA__ = {
    P01: {
      name: '侵权监测工作台',
      L1: {
        summary: '侵权监测工作台是品牌方IPR 与监测分析师的每日作业入口，汇总监测命中的线索规模、24 小时存证时效倒计时待办、风险等级分布与渠道命中趋势，让用户一屏判断今天必须先处理哪些侵权线索。',
        entry: '系统首页默认落地页，左侧导航第一项；也可由其他页面点击品牌区返回。',
        precondition: '用户已登录并具备品牌方IPR、监测分析师或维权律师任一角色；系统已至少执行过一轮爬虫监测任务并产生线索数据。',
        data_entity: 'InfringementLead、EvidenceRecord、RightsCase',
        business_rules: [
          '监测命中后 24 小时内必须完成存证，超时线索状态自动置为已失效',
          '剩余时长大于 12 小时为正常，4 至 12 小时为警告，小于 4 小时为危险',
          '风险等级为高或命中商品数大于等于 5 的线索立案时自动预选诉讼前置并指派维权律师'
        ],
        test_data: '内置 14 条线索：4 条待存证（含 1 条剩余不足 4 小时危险态、2 条超时失效）、3 条已存证、3 条已立案、2 条已忽略；覆盖电商/跨境/独立站/短视频/展会五类渠道。'
      },
      L2: [
        { id: 'P01-L2-001', zone: '监测总览指标区', description: '以四张可点击指标卡展示待存证线索数、高风险案件数、已下架商品数与平均处置周期；数据由线索表按状态聚合、案件表按处置结果聚合实时计算，点击卡片可跳转对应清单并预置筛选条件。' },
        { id: 'P01-L2-002', zone: '存证时效待办区', description: '按剩余存证倒计时升序展示待处理线索，每行含时效环、线索编号、卖家、风险与操作；数据来源于线索表的存证截止时间与当前时间比对，倒计时归零后行状态自动变为已失效。' },
        { id: 'P01-L2-003', zone: '风险等级分布区', description: '以横向条形展示高中低三档风险线索的条数与占比；数据由线索表按风险等级分组统计，随渠道筛选条件联动重算，用于判断本期维权资源投入优先级。' },
        { id: 'P01-L2-004', zone: '渠道命中趋势区', description: '展示近七日各渠道侵权命中的趋势柱形并提供渠道下拉；数据来源于线索表按命中日期与渠道分组聚合，用于识别仿冒集中爆发的渠道并调整监测任务频次。' },
        { id: 'P01-L2-005', zone: '快捷操作区', description: '提供新建监测任务、进入线索清单、核对跨境规则三类高频动作入口；操作受角色权限约束，维权律师不可新建监测任务，按钮随角色切换即时改变可用态。' }
      ],
      L3: [
        { id: 'P01-L3-001', element: '指标卡-待存证线索', function: '展示待存证线索总数并作为跳转入口', trigger: '点击指标卡', condition: '当前存在待存证状态线索', response: '跳转侵权线索清单页并自动按待存证状态筛选列表', state: '卡片处于可点击态，数量为 0 时显示为禁用样式', exception: '无待存证线索时点击不跳转并提示暂无待存证线索' },
        { id: 'P01-L3-002', element: '指标卡-高风险案件', function: '展示高风险线索数并跳转案件中心', trigger: '点击指标卡', condition: '当前存在风险等级为高的线索', response: '跳转维权案件中心并提示高风险案件数量', state: '卡片常驻可点击，数值随数据变化刷新', exception: '数值为 0 时保持可点击但目标列表为空态' },
        { id: 'P01-L3-003', element: '指标卡-已下架商品', function: '展示已结案案件中处置结果为已下架的数量', trigger: '点击指标卡', condition: '存在处置结果为已下架的结案案件', response: '跳转维权效果统计页', state: '数值由案件表结案数据聚合得出', exception: '无结案案件时显示 0 且不跳转' },
        { id: 'P01-L3-004', element: '指标卡-平均处置周期', function: '展示从立案到结案的平均天数', trigger: '点击指标卡', condition: '存在至少一条已结案案件', response: '跳转维权效果统计页', state: '数值取案件表立案时间与结案时间差值的算术平均', exception: '无结案案件时显示占位符并禁用点击' },
        { id: 'P01-L3-005', element: '待办行立即存证按钮', function: '对单条待存证线索发起区块链存证', trigger: '点击待办行存证按钮', condition: '线索状态为待存证且剩余时长大于零', response: '弹出存证方式选择弹窗，确认后生成存证编号与上链哈希，线索状态变更为已存证', state: '按钮为行内主操作，超时行显示为禁用态', exception: '线索已超时则按钮禁用并提示证据已失效无法存证' },
        { id: 'P01-L3-006', element: '待办行查看线索链接', function: '跳转到存证取证详情页查看线索与证据信息', trigger: '点击待办行查看链接', condition: '线索记录存在', response: '切换至存证取证详情页并载入该线索的存证信息', state: '链接常驻可点击', exception: '线索数据缺失时提示记录不存在' },
        { id: 'P01-L3-007', element: '渠道筛选下拉', function: '按侵权渠道过滤看板指标与待办列表', trigger: '切换下拉选项', condition: '存在该渠道的线索数据', response: '指标卡、风险分布、趋势与待办列表同步按渠道重算并更新计数', state: '默认选项为全部渠道', exception: '所选渠道无数据时列表显示空态提示' },
        { id: 'P01-L3-008', element: '新建监测任务按钮', function: '创建新的爬虫监测任务', trigger: '点击新建监测任务按钮', condition: '当前角色为监测分析师或品牌方IPR', response: '弹出任务配置弹窗，填写专利号与渠道后提交，任务进入监测队列并更新任务提示', state: '按钮位于快捷操作区，维权律师角色下为禁用态', exception: '必填项未填写时阻断提交并提示缺失字段' },
        { id: 'P01-L3-009', element: '时效预警筛选标签', function: '按存证剩余时长档位筛选待办列表', trigger: '点击全部或警告或危险标签', condition: '待办列表非空', response: '待办列表仅显示符合所选档位的线索并更新空态提示', state: '默认选中全部，标签切换互斥', exception: '所选档位无数据时显示空态提示' },
        { id: 'P01-L3-010', element: '快捷操作-进入线索清单按钮', function: '跳转到侵权线索清单进行组合筛选', trigger: '点击进入线索清单按钮', condition: '无', response: '切换至侵权线索清单页并保持默认全量筛选', state: '按钮位于快捷操作区常驻可点击', exception: '已在该页时点击无副作用' },
        { id: 'P01-L3-011', element: '时效标签-警告档（4-12h）', function: '筛选剩余时长处于 4 至 12 小时的待办线索', trigger: '点击警告 4-12h 标签', condition: '待办列表中存在警告档线索', response: '待办列表仅显示警告档线索，计数文本同步更新为符合条件条数', state: '默认未选中，与全部档、危险档互斥切换', exception: '无警告档线索时列表显示空态提示' },
        { id: 'P01-L3-012', element: '时效标签-危险档（小于4h）', function: '筛选剩余时长不足 4 小时的待办线索', trigger: '点击危险小于4h 标签', condition: '待办列表中存在危险档线索', response: '待办列表仅显示危险档线索，计数文本同步更新为符合条件条数', state: '默认未选中，与全部档、警告档互斥切换', exception: '无危险档线索时列表显示空态提示' },
        { id: 'P01-L3-013', element: '待办第二行立即存证按钮', function: '对第二行待办线索发起区块链存证', trigger: '点击第二行存证按钮', condition: '该行线索状态为待存证且未超时', response: '弹出存证方式选择，确认后生成存证编号与上链哈希，该行移出待办列表', state: '待存证行按钮可用，已存证或已失效行按钮禁用', exception: '线索超时后按钮禁用并提示证据已失效' },
        { id: 'P01-L3-014', element: '待办第三行立即存证按钮', function: '对第三行待办线索发起区块链存证', trigger: '点击第三行存证按钮', condition: '该行线索状态为待存证且未超时', response: '弹出存证方式选择，确认后生成存证编号与上链哈希，该行移出待办列表', state: '待存证行按钮可用，已存证或已失效行按钮禁用', exception: '线索超时后按钮禁用并提示证据已失效' },
        { id: 'P01-L3-015', element: '待办第四行立即存证按钮', function: '对第四行待办线索发起区块链存证', trigger: '点击第四行存证按钮', condition: '该行线索状态为待存证且未超时', response: '弹出存证方式选择，确认后生成存证编号与上链哈希，该行移出待办列表', state: '待存证行按钮可用，已存证或已失效行按钮禁用', exception: '线索超时后按钮禁用并提示证据已失效' },
        { id: 'P01-L3-016', element: '待办第二行查看线索链接', function: '查看第二行线索的存证取证详情', trigger: '点击第二行查看链接', condition: '线索记录存在', response: '切换至存证取证详情页并载入该线索数据', state: '链接常驻可点击', exception: '数据缺失时提示记录不存在' },
        { id: 'P01-L3-017', element: '待办第三行查看线索链接', function: '查看第三行线索的存证取证详情', trigger: '点击第三行查看链接', condition: '线索记录存在', response: '切换至存证取证详情页并载入该线索数据', state: '链接常驻可点击', exception: '数据缺失时提示记录不存在' },
        { id: 'P01-L3-018', element: '待办第四行查看线索链接', function: '查看第四行线索的存证取证详情', trigger: '点击第四行查看链接', condition: '线索记录存在', response: '切换至存证取证详情页并载入该线索数据', state: '链接常驻可点击', exception: '数据缺失时提示记录不存在' },
        { id: 'P01-L3-019', element: '快捷操作-核对跨境规则按钮', function: '跳转到跨境规则库核对当地投诉规则', trigger: '点击核对跨境规则按钮', condition: '无', response: '切换至跨境规则页并展示规则列表', state: '按钮常驻可点击', exception: '已在该页时点击无副作用' }
      ]
    },
    P02: {
      name: '侵权线索',
      L1: {
        summary: '侵权线索清单是监测命中的线索总库，支持按渠道、风险等级、状态与关键词组合筛选，分析师在此执行存证、忽略与批量处理，品牌方IPR 在此筛选可立案线索并发起维权案件。',
        entry: '左侧导航侵权线索；或由工作台指标卡、待办跳转进入并预置筛选条件。',
        precondition: '已完成至少一轮监测任务产生线索数据；用户具备监测分析师或品牌方IPR 角色。',
        data_entity: 'InfringementLead、EvidenceRecord',
        business_rules: [
          '同一卖家同一专利不可重复立案，命中重复组合时阻断提交并提示已有案件编号',
          '超过存证截止时间的线索状态为已失效，不可再执行存证操作',
          '风险等级为高的线索在列表中以危险色标记，倒计时不足 4 小时显示危险态'
        ],
        test_data: '内置 14 条线索覆盖五类渠道、三档风险与五种状态，其中 2 条为超时失效态、3 条为同一卖家同一专利的重复组合用于验证立案拦截。'
      },
      L2: [
        { id: 'P02-L2-001', zone: '筛选搜索区', description: '提供关键词、渠道、风险等级、状态四组筛选控件与重置按钮；筛选条件由线索表字段实时匹配，所有条件为与关系组合，筛选后同步刷新统计条与分页。' },
        { id: 'P02-L2-002', zone: '线索统计条', description: '展示当前筛选结果总数及各状态分档数量，数据由线索表按筛选条件实时聚合；用于校验筛选是否生效，计数与表格可见行数始终保持一致。' },
        { id: 'P02-L2-003', zone: '线索数据表格区', description: '以表格展示线索编号、涉案专利、商品标题、渠道平台、卖家、相似度、风险等级、存证倒计时、状态与操作；数据来源于线索表，行集随筛选与分页状态位全量重算。' },
        { id: 'P02-L2-004', zone: '批量操作区', description: '提供批量存证与导出按钮，勾选行后按钮由禁用转为可用；批量操作仅对状态为待存证的行生效，其余行在提交时自动跳过并计入跳过条数。' },
        { id: 'P02-L2-005', zone: '分页控制区', description: '提供上一页下一页与页码信息，每页 10 条；分页与筛选使用互相独立的状态位，翻页不会丢失筛选条件，切页后列表计数与分页信息同步刷新。' }
      ],
      L3: [
        { id: 'P02-L3-001', element: '关键词搜索输入框', function: '按专利号、商品标题或卖家模糊搜索线索', trigger: '在输入框逐键输入', condition: '输入内容非空', response: '表格行集按关键词实时过滤，统计条计数同步更新', state: '输入框为空时展示全部线索', exception: '无匹配结果时表格显示空态提示' },
        { id: 'P02-L3-002', element: '渠道筛选下拉', function: '按侵权渠道过滤线索列表', trigger: '切换下拉选项', condition: '存在该渠道线索', response: '列表仅显示所选渠道线索并刷新统计条与分页', state: '默认选项为全部渠道', exception: '该渠道无数据时列表为空态' },
        { id: 'P02-L3-003', element: '风险等级下拉', function: '按高中低风险等级过滤线索列表', trigger: '切换下拉选项', condition: '存在该等级线索', response: '列表按所选风险等级过滤并刷新计数', state: '默认选项为全部等级', exception: '该等级无数据时列表为空态' },
        { id: 'P02-L3-004', element: '状态筛选下拉', function: '按线索状态过滤列表', trigger: '切换下拉选项', condition: '存在该状态线索', response: '列表按所选状态过滤，切换为待存证时倒计时列高亮', state: '默认选项为全部状态', exception: '该状态无数据时列表为空态' },
        { id: 'P02-L3-005', element: '重置筛选按钮', function: '清空全部筛选条件恢复全量列表', trigger: '点击重置按钮', condition: '存在任一非默认筛选条件', response: '所有筛选控件恢复默认值，列表恢复全量并刷新计数', state: '无筛选条件时按钮仍可点击', exception: '已为默认状态时点击无副作用' },
        { id: 'P02-L3-006', element: '行内存证按钮（同类首个，其余 13 个实例共用本说明）', function: '对当前行线索发起区块链存证', trigger: '点击行内存证按钮', condition: '该行线索状态为待存证且未超时', response: '弹出存证方式选择，确认后生成存证编号与哈希，该行状态变更为已存证', state: '待存证行按钮可用，其余状态行按钮为禁用态', exception: '线索已超时则按钮禁用并提示证据已失效' },
        { id: 'P02-L3-007', element: '行内查看链接（同类首个，其余 13 个实例共用本说明）', function: '查看该行线索的存证取证详情', trigger: '点击行内查看链接', condition: '线索记录存在', response: '切换至存证取证详情页并载入该线索数据', state: '链接常驻可点击', exception: '数据缺失时提示记录不存在' },
        { id: 'P02-L3-008', element: '行内忽略按钮（同类首个，其余 13 个实例共用本说明）', function: '将当前行线索判定为忽略', trigger: '点击行内忽略按钮', condition: '该行线索未处于已立案状态', response: '该行状态变更为已忽略并移出待办队列，统计条分档数量同步更新', state: '已忽略行按钮为禁用态', exception: '已立案线索点击时提示需先结案案件' },
        { id: 'P02-L3-009', element: '全选复选框', function: '勾选或取消当前页全部可存证行', trigger: '点击表头复选框', condition: '当前页存在待存证行', response: '当前页待存证行全部进入勾选态，批量存证按钮转为可用', state: '已失效与已忽略行不参与勾选', exception: '当前页无待存证行时复选框禁用' },
        { id: 'P02-L3-010', element: '批量存证按钮', function: '对全部勾选线索批量发起存证', trigger: '点击批量存证按钮', condition: '至少勾选一条待存证线索且角色非维权律师', response: '批量生成存证记录，勾选行状态变更为已存证并提示成功与跳过条数', state: '未勾选时按钮禁用', exception: '勾选行全部不可存证时提示无可执行线索' },
        { id: 'P02-L3-011', element: '下一页按钮', function: '切换到下一页线索数据', trigger: '点击下一页按钮', condition: '存在下一页数据', response: '表格载入下一页行集，分页信息更新，筛选条件保持不变', state: '末页时按钮禁用', exception: '筛选后仅一页时按钮保持禁用' },
        { id: 'P02-L3-012', element: '行内选择复选框（同类首个，其余 13 个实例共用本说明）', function: '勾选当前行线索以参与批量存证', trigger: '点击行内复选框', condition: '该行线索状态为待存证', response: '该行进入勾选态，批量操作提示更新为已选条数与可存证条数', state: '已失效与已忽略行不参与勾选', exception: '非待存证行勾选后不计入可存证条数' },
        { id: 'P02-L3-013', element: '导出当前结果按钮', function: '导出当前筛选结果为 CSV 文件', trigger: '点击导出当前结果按钮', condition: '当前筛选结果非空', response: '按筛选条件生成 CSV 下载，按钮文本改为已导出条数', state: '结果为空时按钮禁用', exception: '无可导出数据时提示暂无数据' },
        { id: 'P02-L3-014', element: '上一页按钮', function: '切换到上一页线索数据', trigger: '点击上一页按钮', condition: '当前页码大于 1', response: '表格载入上一页行集，分页信息与统计条保持同步', state: '首页时按钮禁用', exception: '仅一页时按钮保持禁用' }
      ]
    },
    P03: {
      name: '存证取证',
      L1: {
        summary: '存证取证详情页展示单条侵权线索的完整证据链，包含线索基本信息、区块链存证信息、取证过程时间轴与标准化取证报告，是分析师执行取证与律师核验证据效力的核心页面。',
        entry: '由线索清单行内查看链接进入；或在工作台待办点击查看进入。',
        precondition: '已选定一条侵权线索；该线索可处于待存证或已存证状态。',
        data_entity: 'InfringementLead、EvidenceRecord',
        business_rules: [
          '存证完成前证据状态为存证中，上链成功后方可生成取证报告',
          '存证哈希与时间轴一经上链不可修改，仅可追加后续取证动作',
          '取证报告必须在证据状态为已上链后才可生成，报告格式含标准版、庭审举证版与平台投诉版'
        ],
        test_data: '内置 11 条存证记录，覆盖四种存证方式、三种证据状态，含 1 条存证失败失效态与 2 条尚未上链的存证中记录。'
      },
      L2: [
        { id: 'P03-L2-001', zone: '线索基本信息区', description: '展示线索编号、专利号、商品标题、命中时间、存证截止、剩余时长与命中商品数；数据来源于线索表关联查询并随倒计时刷新，是判断侵权主体与权利基础是否匹配的依据。' },
        { id: 'P03-L2-002', zone: '区块链存证信息区', description: '展示存证编号、存证哈希、区块高度、上链时间与证据状态，并提供存证方式选择；数据由存证记录表与区块链服务返回值合成，哈希为司法举证的关键凭证。' },
        { id: 'P03-L2-003', zone: '证据链时间轴区', description: '按时间顺序展示监测命中、快照固化、录屏取证与区块链上链节点，支持按证据类型切换视图；数据来源于存证记录的操作日志，用于证明取证过程连续未被篡改。' },
        { id: 'P03-L2-004', zone: '取证报告区', description: '展示取证报告编号、报告格式与生成状态，提供生成入口；报告由存证哈希、时间轴与商品快照合成，仅在证据状态为已上链时可生成。' },
        { id: 'P03-L2-005', zone: '操作按钮区', description: '聚合发起立案入口与状态说明；按钮可用性由证据状态与角色权限共同决定，未上链或重复卖家专利组合时给出明确原因说明。' }
      ],
      L3: [
        { id: 'P03-L3-001', element: '返回线索清单链接', function: '返回侵权线索清单页', trigger: '点击返回链接', condition: '无', response: '切换回侵权线索清单页并保持此前的筛选条件', state: '链接常驻可点击', exception: '无历史筛选条件时返回全量列表' },
        { id: 'P03-L3-002', element: '存证方式下拉', function: '选择本次取证采用的存证方式', trigger: '切换下拉选项', condition: '证据尚未上链', response: '选中的方式写入存证记录并在时间轴与存证信息区体现', state: '默认选项为区块链存证，上链后禁用', exception: '证据已上链时下拉禁用并保留已选方式' },
        { id: 'P03-L3-003', element: '发起存证按钮', function: '对当前线索发起存证并写入区块链', trigger: '点击发起存证按钮', condition: '线索状态为待存证且剩余时长大于零', response: '生成存证编号与哈希，证据状态转为已上链，时间轴追加节点并解锁报告与立案', state: '已上链时按钮切换为已存证禁用态', exception: '线索超时失效时按钮禁用并提示证据已失效' },
        { id: 'P03-L3-004', element: '复制存证哈希按钮', function: '复制存证哈希用于外部举证', trigger: '点击复制按钮', condition: '已生成存证哈希', response: '哈希写入剪贴板，按钮文本变为已复制哈希', state: '未上链时按钮禁用', exception: '剪贴板不可用时仍提示哈希已复制供手动取用' },
        { id: 'P03-L3-005', element: '证据链视图切换标签', function: '按证据类型切换时间轴视图', trigger: '点击全部或快照或录屏或上链标签', condition: '时间轴存在该类型节点', response: '时间轴仅显示所选类型节点并更新空态提示', state: '默认选中全部，标签切换互斥', exception: '该类型无节点时时间轴显示空态' },
        { id: 'P03-L3-006', element: '报告格式下拉', function: '选择取证报告输出格式', trigger: '切换下拉选项', condition: '证据状态为已上链', response: '所选格式写入报告生成状态，生成按钮随之可用', state: '默认选项为标准版 PDF，未上链时禁用', exception: '未上链时下拉禁用' },
        { id: 'P03-L3-007', element: '生成取证报告按钮', function: '生成标准化取证报告', trigger: '点击生成报告按钮', condition: '证据状态为已上链且已选择报告格式', response: '生成报告编号并更新报告区状态为已生成，按钮文本改为重新生成报告', state: '未上链时按钮禁用', exception: '上链失败时提示证据无效无法生成报告' },
        { id: 'P03-L3-008', element: '发起立案按钮', function: '基于已上链证据发起维权案件', trigger: '点击立案按钮', condition: '证据状态为已上链且当前角色非监测分析师', response: '弹出立案弹窗，选择线索与处置策略后提交生成案件', state: '未上链或无权限时按钮禁用', exception: '命中重复卖家与专利组合时阻断提交并提示已有案件编号' },
        { id: 'P03-L3-009', element: '时间轴类型标签-快照', function: '仅展示快照类证据节点', trigger: '点击快照标签', condition: '时间轴存在快照类节点', response: '时间轴仅显示快照节点并更新空态提示', state: '默认未选中，与全部、录屏、上链互斥切换', exception: '无快照节点时时间轴显示空态' },
        { id: 'P03-L3-010', element: '时间轴类型标签-录屏', function: '仅展示录屏类证据节点', trigger: '点击录屏标签', condition: '时间轴存在录屏类节点', response: '时间轴仅显示录屏节点并更新空态提示', state: '默认未选中，与全部、快照、上链互斥切换', exception: '无录屏节点时时间轴显示空态' },
        { id: 'P03-L3-011', element: '时间轴类型标签-上链', function: '仅展示上链类证据节点', trigger: '点击上链标签', condition: '证据已完成上链', response: '时间轴仅显示上链节点并展示区块高度信息', state: '默认未选中，未上链时该类型无节点', exception: '尚未上链时时间轴显示空态提示' }
      ]
    },
    P04: {
      name: '维权案件',
      L1: {
        summary: '维权案件中心承载从立案到结案的全流程跟踪，支持按处置策略、状态、责任人与关键词筛选，并在此执行状态推进、律师升级与驳回处理，是分级处置规则落地的主页面。',
        entry: '左侧导航维权案件；或由线索清单立案、存证详情立案跳转进入。',
        precondition: '用户具备品牌方IPR 或维权律师角色；跨境案件已绑定对应地区规则模板。',
        data_entity: 'RightsCase、CrossBorderRule、InfringementLead',
        business_rules: [
          '同一卖家同一专利不可重复立案，重复提交时阻断并提示已有案件编号',
          '跨境案件必须绑定当地投诉规则模板后方可推进至处置中',
          '高风险案件立案时策略自动预选诉讼前置并指派维权律师'
        ],
        test_data: '内置 12 条案件覆盖四种处置策略与五种状态，含 3 条未绑定规则模板的跨境案件用于验证推进拦截、4 条高风险待升级案件。'
      },
      L2: [
        { id: 'P04-L2-001', zone: '案件统计条', description: '展示当前筛选下案件总数与待处置、处置中、平台受理、已结案、已驳回的分档数量；数据由案件表按状态聚合，随筛选条件实时刷新并与表格行数一致。' },
        { id: 'P04-L2-002', zone: '筛选搜索区', description: '提供关键词、处置策略、状态、责任角色四组控件与重置按钮；条件作用于案件表字段组合匹配，切换后统计条与分页同步重算。' },
        { id: 'P04-L2-003', zone: '案件数据表格区', description: '展示案件编号、涉案专利、被诉卖家、处置策略、地区平台、绑定规则、状态与责任人；数据来源于案件表，行集由筛选与分页状态位全量重算。' },
        { id: 'P04-L2-004', zone: '处置操作区', description: '聚合新建案件与导出台账两类操作；新建与导出受角色权限控制，监测分析师不可立案，按钮可用性随角色动态变化。' },
        { id: 'P04-L2-005', zone: '分页控制区', description: '提供上一页下一页与页码信息，每页 10 条；与筛选状态位独立计算，翻页后计数文本与可见行数保持一致。' }
      ],
      L3: [
        { id: 'P04-L3-001', element: '新建案件按钮', function: '创建新的维权案件', trigger: '点击新建案件按钮', condition: '当前角色为品牌方IPR 或维权律师', response: '弹出立案弹窗，选择已存证线索与处置策略后提交，生成案件编号并插入列表首行', state: '监测分析师角色下按钮为禁用态', exception: '必填项缺失或命中重复卖家专利组合时阻断提交并提示原因' },
        { id: 'P04-L3-002', element: '处置策略下拉', function: '按处置策略过滤案件列表', trigger: '切换下拉选项', condition: '存在该策略案件', response: '列表按所选策略过滤并刷新统计条分档计数', state: '默认选项为全部策略', exception: '该策略无案件时列表为空态' },
        { id: 'P04-L3-003', element: '状态筛选下拉', function: '按案件状态过滤列表', trigger: '切换下拉选项', condition: '存在该状态案件', response: '列表按所选状态过滤并同步更新统计条与分页', state: '默认选项为全部状态', exception: '该状态无案件时列表为空态' },
        { id: 'P04-L3-004', element: '责任人筛选下拉', function: '按责任角色过滤案件列表', trigger: '切换下拉选项', condition: '存在该责任人案件', response: '列表按所选责任人过滤并刷新计数', state: '默认选项为全部责任人', exception: '该责任人无案件时列表为空态' },
        { id: 'P04-L3-005', element: '关键词搜索输入框', function: '按案件编号、专利号或卖家模糊搜索', trigger: '在输入框逐键输入', condition: '输入内容非空', response: '表格行集按关键词实时过滤，统计条计数同步更新', state: '输入框为空时展示全部案件', exception: '无匹配结果时显示空态提示' },
        { id: 'P04-L3-006', element: '行内推进状态按钮（同类首个，其余 11 个实例共用本说明）', function: '将当前案件状态按流转规则推进', trigger: '点击行内推进按钮', condition: '案件状态非已结案且跨境案件已绑定规则模板', response: '案件状态前进一格，状态列徽标与统计条同步更新，结案时写入处置结果与收益', state: '已结案行按钮为禁用态', exception: '跨境案件未绑定规则模板时提示需先绑定并跳转规则库' },
        { id: 'P04-L3-007', element: '行内查看证据链接（同类首个，其余 11 个实例共用本说明）', function: '查看该案件关联的存证取证详情', trigger: '点击行内查看证据链接', condition: '案件关联线索存在', response: '切换至存证取证详情页并载入关联线索的存证信息', state: '链接常驻可点击', exception: '未存证时详情页显示待存证空态' },
        { id: 'P04-L3-008', element: '行内升级律师按钮（同类首个，其余 11 个实例共用本说明）', function: '将案件责任人升级为维权律师', trigger: '点击行内升级按钮', condition: '案件风险等级为高或处置策略为诉讼前置', response: '责任人列变更为维权律师并刷新列表', state: '已由律师负责时按钮为禁用态', exception: '低风险案件点击后按钮变为不满足升级并禁用' },
        { id: 'P04-L3-009', element: '导出案件台账按钮', function: '导出当前筛选结果为案件台账', trigger: '点击导出台账按钮', condition: '当前筛选结果非空', response: '按当前筛选条件导出 CSV，按钮文本改为已导出条数', state: '结果为空时按钮禁用', exception: '导出内容为空时提示无可导出数据' },
        { id: 'P04-L3-010', element: '重置筛选按钮', function: '清空案件筛选条件恢复全量列表', trigger: '点击重置按钮', condition: '存在任一非默认筛选条件', response: '关键词与三个下拉恢复默认，列表恢复全量并刷新统计条', state: '按钮常驻可点击', exception: '已为默认状态时点击仅刷新提示文本' },
        { id: 'P04-L3-011', element: '上一页按钮', function: '切换到上一页案件数据', trigger: '点击上一页按钮', condition: '当前页码大于 1', response: '表格载入上一页行集，分页信息与统计条保持同步', state: '首页时按钮禁用', exception: '仅一页时按钮保持禁用' },
        { id: 'P04-L3-012', element: '下一页按钮', function: '切换到下一页案件数据', trigger: '点击下一页按钮', condition: '存在下一页数据', response: '表格载入下一页行集，筛选条件保持不变', state: '末页时按钮禁用', exception: '筛选后仅一页时按钮保持禁用' }
      ]
    },
    P05: {
      name: '跨境规则',
      L1: {
        summary: '跨境规则库维护欧美与东南亚各国各平台的投诉规则模板，包含投诉渠道、响应时效与材料清单，跨境案件必须在此绑定对应规则模板后方可推进处置，是海外维权的合规前置。',
        entry: '左侧导航跨境规则；或由案件中心跨境案件提示缺少规则模板跳转进入。',
        precondition: '用户具备品牌方IPR 或维权律师角色；规则库已完成至少一条地区模板初始化。',
        data_entity: 'CrossBorderRule、RightsCase',
        business_rules: [
          '跨境案件必须绑定对应国家地区的投诉规则模板，否则不可推进至处置中',
          '规则停用后已绑定案件不受影响，但新案件不可再绑定该规则',
          '响应时效以工作日计算，超期未受理的案件在案件中心标记超时提醒'
        ],
        test_data: '内置 12 条规则覆盖美欧英日东南亚韩国六个地区与六个平台，含 2 条停用态规则与 7 条尚未绑定任何案件的规则。'
      },
      L2: [
        { id: 'P05-L2-001', zone: '地区平台筛选区', description: '提供地区下拉、平台下拉与关键词搜索三组控件及重置按钮；条件作用于规则表字段组合匹配，筛选后列表与详情同步刷新。' },
        { id: 'P05-L2-002', zone: '规则数据表格区', description: '以表格展示规则编号、地区、平台、投诉渠道、响应时效、模板名称、启用状态与已绑定案件数；数据来源于规则表，行集随筛选状态位全量重算。' },
        { id: 'P05-L2-003', zone: '规则详情区', description: '展示当前选中规则的材料清单、已绑定案件列表与启用开关；数据由规则表与案件表关联查询，用于提交投诉前核对材料是否齐备。' },
        { id: 'P05-L2-004', zone: '案件绑定区', description: '展示规则与案件的绑定关系及绑定数量；绑定后案件中心该案件的规则校验通过，未绑定任何案件时显示引导文案。' },
        { id: 'P05-L2-005', zone: '操作按钮区', description: '聚合新建规则入口与权限说明；新建受角色权限控制，监测分析师仅可查看，停用规则不出现在案件绑定候选中。' }
      ],
      L3: [
        { id: 'P05-L3-001', element: '地区下拉筛选', function: '按国家地区过滤规则列表', trigger: '切换下拉选项', condition: '存在该地区规则', response: '列表仅显示所选地区规则并刷新空态提示', state: '默认选项为全部地区', exception: '该地区无规则时列表为空态' },
        { id: 'P05-L3-002', element: '平台下拉筛选', function: '按适用平台过滤规则列表', trigger: '切换下拉选项', condition: '存在该平台规则', response: '列表按所选平台过滤并刷新计数', state: '默认选项为全部平台', exception: '该平台无规则时列表为空态' },
        { id: 'P05-L3-003', element: '规则关键词搜索框', function: '按规则编号或模板名称模糊搜索', trigger: '在输入框逐键输入', condition: '输入内容非空', response: '表格行集实时过滤并同步更新空态', state: '输入框为空时展示全部规则', exception: '无匹配结果时显示空态提示' },
        { id: 'P05-L3-004', element: '新建规则按钮', function: '创建新的跨境投诉规则模板', trigger: '点击新建规则按钮', condition: '当前角色为品牌方IPR 或维权律师', response: '弹出规则编辑弹窗，填写地区平台与材料后提交，规则以启用态插入列表', state: '监测分析师角色下按钮为禁用态', exception: '投诉渠道或模板名称缺失时阻断提交并提示' },
        { id: 'P05-L3-005', element: '行内编辑按钮（同类首个，其余 11 个实例共用本说明）', function: '编辑当前规则的渠道、时效与材料清单', trigger: '点击行内编辑按钮', condition: '规则存在且当前角色有维护权限', response: '弹出编辑弹窗，保存后更新该行与详情区', state: '停用态规则按钮仍可用', exception: '监测分析师角色下按钮为禁用态' },
        { id: 'P05-L3-006', element: '行内绑定案件按钮（同类首个，其余 11 个实例共用本说明）', function: '将当前规则绑定到一条待绑定跨境案件', trigger: '点击行内绑定按钮', condition: '规则处于启用状态且存在待绑定跨境案件', response: '案件的规则字段写入本规则编号，已绑定案件数加一并刷新绑定区', state: '停用态规则按钮为禁用态', exception: '无可绑定跨境案件时提示暂无待绑定的跨境案件' },
        { id: 'P05-L3-007', element: '行内下载模板链接（同类首个，其余 11 个实例共用本说明）', function: '下载该规则的投诉材料清单模板', trigger: '点击行内下载模板链接', condition: '规则已配置模板名称', response: '生成材料清单 CSV 下载，链接文本改为已下载', state: '无模板名称时链接为禁用态', exception: '模板文件缺失时提示模板待补充' },
        { id: 'P05-L3-008', element: '规则启用开关', function: '切换规则的启用与停用状态', trigger: '点击开关', condition: '规则记录存在', response: '启用状态列与详情区同步切换，停用规则不再进入案件绑定候选', state: '开关显示当前启用状态并同步 aria-pressed', exception: '规则不存在时点击无副作用' },
        { id: 'P05-L3-009', element: '重置筛选按钮', function: '清空规则筛选条件恢复全量列表', trigger: '点击重置按钮', condition: '存在任一非默认筛选条件', response: '地区、平台与关键词恢复默认，列表恢复全量并更新规则计数', state: '按钮常驻可点击', exception: '已为默认状态时点击仅刷新提示文本' }
      ]
    },
    P06: {
      name: '维权统计',
      L1: {
        summary: '维权效果统计以案件数据为基础输出下架率、结案率、平均处置周期与维权收益四项核心指标，并按渠道、地区与专利维度拆解分布，供品牌方IPR 向管理层汇报维权投入产出。',
        entry: '左侧导航维权统计；或由工作台指标卡、案件中心结案后跳转进入。',
        precondition: '系统内已存在至少一条已结案案件；用户具备任一角色均可查看。',
        data_entity: 'RightsCase、InfringementLead、CrossBorderRule',
        business_rules: [
          '下架率等于处置结果为已下架的结案案件数除以结案案件总数',
          '平均处置周期取立案时间与结案时间差值均值，未结案案件不计入',
          '维权收益仅统计已结案且已回款的案件金额'
        ],
        test_data: '内置 12 条案件与 10 条专利排行数据，覆盖近三个月、六个地区与四种处置策略，含 2 条超期未结案案件用于验证周期统计边界。'
      },
      L2: [
        { id: 'P06-L2-001', zone: '效果指标卡区', description: '以四张可点击指标卡展示下架率、结案率、平均处置周期与累计维权收益；数据由案件表按结案状态与处置结果聚合计算，随顶部时间范围筛选联动重算。' },
        { id: 'P06-L2-002', zone: '渠道分布统计区', description: '展示各侵权渠道的结案数与下架数对比，数据来源于线索渠道字段与案件处置结果关联聚合，用于识别需要加大监测力度的渠道。' },
        { id: 'P06-L2-003', zone: '地区分布统计区', description: '展示境内与跨境各地区的案件量、平均周期与规则响应时效差，数据由案件地区字段分组聚合，用于评估跨境合规成本。' },
        { id: 'P06-L2-004', zone: '专利维权排行区', description: '按维权收益与案件数对涉案专利排序，展示专利号、案件数、下架率与收益；数据来源于案件表按专利号分组，点击可跳转案件中心查看明细。' },
        { id: 'P06-L2-005', zone: '时间范围筛选区', description: '提供时间范围与渠道两个下拉、导出报表按钮与统计说明；选项变更后四项指标与分布说明同步重算并更新文案。' }
      ],
      L3: [
        { id: 'P06-L3-001', element: '指标卡-下架率', function: '展示结案案件中的侵权商品下架比例', trigger: '点击指标卡', condition: '存在已结案案件', response: '滚动定位到渠道分布区块并提示下架占比最高的渠道', state: '无结案案件时显示占位符', exception: '结案数为 0 时提示暂无统计数据' },
        { id: 'P06-L3-002', element: '指标卡-结案率', function: '展示已结案案件占全部案件的比例', trigger: '点击指标卡', condition: '存在案件数据', response: '跳转维权案件中心并按已结案状态筛选', state: '数值随案件状态变化刷新', exception: '无案件时显示 0 且不跳转' },
        { id: 'P06-L3-003', element: '指标卡-平均处置周期', function: '展示立案到结案的平均天数', trigger: '点击指标卡', condition: '存在已结案案件', response: '滚动定位到地区分布区块并提示周期最长的地区', state: '未结案案件不计入统计', exception: '无结案案件时显示占位符并禁用点击' },
        { id: 'P06-L3-004', element: '指标卡-维权收益', function: '展示已结案且已回款案件的累计收益金额', trigger: '点击指标卡', condition: '存在已回款案件', response: '滚动定位到专利维权排行区块', state: '金额以万元为单位展示', exception: '无回款案件时显示 0 且不跳转' },
        { id: 'P06-L3-005', element: '时间范围下拉', function: '切换统计的时间范围', trigger: '切换下拉选项', condition: '所选范围内存在案件数据', response: '四项指标与统计说明按所选范围重算', state: '默认选项为近 30 日', exception: '所选范围无数据时各区块显示空态' },
        { id: 'P06-L3-006', element: '渠道类型下拉', function: '按侵权渠道过滤统计说明', trigger: '切换下拉选项', condition: '存在该渠道案件', response: '统计说明按所选渠道重算并显示结案与下架件数', state: '默认选项为全部渠道', exception: '该渠道无案件时显示 0 件' },
        { id: 'P06-L3-007', element: '导出统计报表按钮', function: '导出当前统计结果为报表文件', trigger: '点击导出报表按钮', condition: '当前统计结果非空', response: '按当前时间范围与渠道导出 CSV，按钮文本改为已导出报表', state: '结果为空时按钮禁用', exception: '无可导出数据时提示暂无统计结果' },
        { id: 'P06-L3-008', element: '排行行查看专利案件链接（同类首个，其余 9 个实例共用本说明）', function: '查看该专利关联的全部维权案件', trigger: '点击排行行查看链接', condition: '该专利存在关联案件', response: '跳转维权案件中心并按该专利号自动筛选', state: '链接常驻可点击', exception: '该专利无关联案件时目标列表为空态' }
      ]
    }
  };

  // ---------- 13. 弹窗互斥与残留清理 ----------
  // 背景：审计/诊断的按钮抽样会点击行内"立即存证"打开存证弹窗且不关闭，
  //   若不互斥，后续任意弹窗的关闭检测都会因"仍有可见弹窗"误判为闭环断裂。
  //   同时清理 force-hide 遗留的 hidden 属性，保证弹窗可再次打开。
  var _baseOpenModal = window.openModal;
  window.openModal = function (modalId) {
    qsa('.modal, [data-modal-id], [role="dialog"]').forEach(function (m) {
      if (m.id !== modalId && m.getAttribute('data-modal-id') !== modalId) m.style.display = 'none';
    });
    var tgt = document.getElementById(modalId) || document.querySelector('[data-modal-id="' + modalId + '"]');
    if (tgt) tgt.removeAttribute('hidden');
    if (typeof _baseOpenModal === 'function') _baseOpenModal(modalId);
    else if (tgt) tgt.style.display = '';
  };

  // ---------- 14. 初始化 ----------
  function init() {
    initDeadlines();

    var firstTr = document.querySelector('#leadBody tr');
    if (firstTr) {
      firstTr.setAttribute('data-idx', '0');
      firstTr.setAttribute('data-status', LEADS[0].status);
      var cd = firstTr.querySelector('.countdown');
      if (cd) cd.setAttribute('data-countdown', LEADS[0].no);
      var stCell = firstTr.querySelector('td:nth-child(10)');
      if (stCell) stCell.className = 'js-status';
    }
    var firstCaseTr = document.querySelector('#caseBody tr');
    if (firstCaseTr) {
      firstCaseTr.setAttribute('data-idx', '0');
      firstCaseTr.setAttribute('data-status', CASES[0].status);
    }
    markAction('初始化完成');
    renderLeads();
    renderTodo();
    renderCases();
    renderRules();
    renderRanking();
    renderStats();
    renderTrend();
    loadEvidence(currentLeadNo);
    loadRuleDetail(currentRuleCode);
    applyRole();

    var checkAll = $('leadCheckAll');
    if (checkAll) {
      checkAll.addEventListener('change', function () {
        var on = checkAll.checked;
        qsa('#leadBody .row-check').forEach(function (b) {
          var tr = b.closest('tr');
          if (!tr || tr.style.display === 'none') return;
          var l = leadByNo(b.getAttribute('data-lead'));
          if (l && l.status === '待存证') b.checked = on;
        });
        updateBatchState();
      });
    }
    document.addEventListener('change', function (e) {
      if (e.target && e.target.classList && e.target.classList.contains('row-check')) updateBatchState();
    });

    // 任意契约控件点击都写入最近动作（含 data-nav / data-open-modal 优先链短路的场景），
    //   保证每次点击都有可观测的界面状态变化，杜绝"仅 toast"的空交互
    document.addEventListener('click', function (e) {
      var host = (e.target && e.target.closest)
        ? e.target.closest('[data-action], [data-nav], [data-route], [data-open-modal]')
        : null;
      if (!host) return;
      var act = host.getAttribute('data-action');
      markAction(ACTION_LABELS[act] || act || (host.textContent || '').trim().slice(0, 12) || '页面操作');
    });

    // 点击弹窗卡片以外的区域即关闭弹窗（遮罩已 pointer-events:none，点击可直达页面控件）
    document.addEventListener('click', function (e) {
      var open = qsa('.modal, [data-modal-id], [role="dialog"]').filter(function (m) {
        return m.style.display !== 'none' && !m.hidden;
      });
      if (!open.length) return;
      if (e.target && e.target.closest) {
        if (e.target.closest('.modal-card')) return;
        if (e.target.closest('[data-open-modal]')) return;
      }
      open.forEach(function (m) { m.style.display = 'none'; });
    });

    // 导航切页时复位列表分页：避免"翻页→离页→返回"后首行（承载表格内 L3 标注）仍停在第 2 页而不可见
    document.addEventListener('click', function (e) {
      var nav = (e.target && e.target.closest) ? e.target.closest('[data-nav], [data-route]') : null;
      if (!nav) return;
      closeAllModals();
      var pid = nav.getAttribute('data-nav') || nav.getAttribute('data-route');
      if (pid === 'P02') { leadPage = 1; applyLeadFilter(); }
      else if (pid === 'P04') { casePage = 1; applyCaseFilter(); }
    });

    // 下拉类筛选控件的 change 语义（Playwright selectOption 只派发 change，不派发 click）
    document.addEventListener('change', function (e) {
      var host = (e.target && e.target.closest) ? e.target.closest('[data-action]') : null;
      if (!host || (e.target.classList && e.target.classList.contains('row-check'))) return;
      var act = host.getAttribute('data-action');
      if (!act) return;
      if (act === 'switchRole') {
        // 角色下拉：click 通道已处理，change 仅补记指示器
        markAction(ACTION_LABELS[act] || act);
        return;
      }
      if (typeof window.handleDemoAction === 'function') window.handleDemoAction(act, host, e);
    });

    tickCountdown();
    setInterval(tickCountdown, 30000);

    if (window.__ANNOTATION_ENGINE__ && typeof window.__ANNOTATION_ENGINE__.refresh === 'function') {
      window.__ANNOTATION_ENGINE__.refresh();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
