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

/* ============================================================
   业务数据与逻辑（AI 实现）— 专利资产全生命周期价值运营平台
   ============================================================ */
var TODAY = new Date('2026-08-30T00:00:00');

function daysUntil(dateStr) {
  if (!dateStr) return null;
  var d = new Date(dateStr + 'T00:00:00');
  return Math.round((d - TODAY) / 86400000);
}
function pad3(n) { return String(n).padStart(3, '0'); }
function fmtDate(iso) { return iso ? iso : '-'; }
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function todayStr() {
  return TODAY.getFullYear() + '-' + pad(TODAY.getMonth() + 1) + '-' + pad(TODAY.getDate());
}

var PATENT_STATUS = {
  APPLYING: { label: '申请中', cls: 'info' },
  ACTIVE: { label: '授权有效', cls: 'ok' },
  EXPIRING: { label: '即将到期', cls: 'warn' },
  EXPIRED: { label: '逾期失效', cls: 'danger' },
  PLEDGED: { label: '质押中', cls: 'primary' },
  TRANSFERRING: { label: '转让中', cls: 'warn' },
  TRANSFERRED: { label: '已转让', cls: 'info' }
};
var FEE_STATUS = {
  PAID: { label: '已缴', cls: 'ok' },
  PENDING: { label: '待缴', cls: 'warn' },
  UPCOMING: { label: '即将到期', cls: 'warn' },
  OVERDUE: { label: '已逾期', cls: 'danger' }
};
var VAL_STATUS = {
  PENDING: { label: '待确认', cls: 'warn' },
  CONFIRMED: { label: '已确认', cls: 'ok' },
  REJECTED: { label: '已驳回', cls: 'danger' }
};
var PLEDGE_STATUS = {
  ACTIVE: { label: '质押中', cls: 'primary' },
  RELEASED: { label: '已解除', cls: 'info' }
};
var TRANSFER_STATUS = {
  DRAFT: { label: '草稿', cls: 'info' },
  REVIEWING: { label: '审核中', cls: 'warn' },
  DONE: { label: '已成交', cls: 'ok' },
  CANCELLED: { label: '已取消', cls: 'danger' }
};
var DEMAND_STATUS = {
  PUBLISHED: { label: '发布中', cls: 'info' },
  MATCHING: { label: '匹配中', cls: 'warn' },
  DEALT: { label: '已成交', cls: 'ok' },
  CLOSED: { label: '已关闭', cls: 'danger' }
};

function badge(statusMap, key) {
  var s = statusMap[key] || { label: key, cls: 'info' };
  return '<span class="badge ' + s.cls + '">' + s.label + '</span>';
}

var patents = [
  { no: 'ZL202310001234', title: '高密度固态电池电解质制备方法', type: '发明专利', applicant: '奥凯新能源', inventor: '王启明', appDate: '2023-03-15', grantDate: '2024-07-20', expiryDate: '2026-09-12', status: 'EXPIRING', feeStatus: 'UPCOMING', annualFee: 3600, value: 1280, industry: '新能源', pledged: false },
  { no: 'ZL202210009876', title: '晶圆级芯片封装散热结构', type: '发明专利', applicant: '奥凯半导体', inventor: '李国栋', appDate: '2022-06-08', grantDate: '2023-11-30', expiryDate: '2026-06-30', status: 'ACTIVE', feeStatus: 'PAID', annualFee: 4200, value: 1560, industry: '半导体', pledged: false },
  { no: 'ZL202110004567', title: '抗肿瘤药物靶向递送载体', type: '发明专利', applicant: '奥凯生物', inventor: '陈思远', appDate: '2021-09-22', grantDate: '2023-05-18', expiryDate: '2026-08-25', status: 'EXPIRED', feeStatus: 'OVERDUE', annualFee: 3000, value: 860, industry: '生物医药', pledged: false },
  { no: 'ZL202310008654', title: '工业机器人视觉定位装置', type: '实用新型', applicant: '奥凯智造', inventor: '张立群', appDate: '2023-02-10', grantDate: '2023-12-05', expiryDate: '2026-09-05', status: 'EXPIRING', feeStatus: 'UPCOMING', annualFee: 1500, value: 420, industry: '智能制造', pledged: false },
  { no: 'ZL202410001111', title: '锂离子电池热管理模组', type: '发明专利', applicant: '奥凯新能源', inventor: '刘雨桐', appDate: '2024-01-16', grantDate: '2025-04-22', expiryDate: '2027-01-16', status: 'ACTIVE', feeStatus: 'PAID', annualFee: 4200, value: 1680, industry: '新能源', pledged: false },
  { no: 'ZL202310009999', title: '多模态语义理解模型压缩方法', type: '发明专利', applicant: '奥凯智能', inventor: '赵一鸣', appDate: '2023-08-11', grantDate: '2025-06-30', expiryDate: '2026-11-08', status: 'ACTIVE', feeStatus: 'PENDING', annualFee: 4600, value: 2100, industry: '人工智能', pledged: false },
  { no: 'ZL202210007321', title: '智能仓储调度算法', type: '发明专利', applicant: '奥凯智造', inventor: '周雨薇', appDate: '2022-11-02', grantDate: '2024-09-12', expiryDate: '2026-09-20', status: 'EXPIRING', feeStatus: 'UPCOMING', annualFee: 3900, value: 1180, industry: '智能制造', pledged: false },
  { no: 'ZL202110006543', title: '医用内窥镜图像增强装置', type: '实用新型', applicant: '奥凯生物', inventor: '吴建波', appDate: '2021-12-09', grantDate: '2022-08-15', expiryDate: '2026-07-31', status: 'PLEDGED', feeStatus: 'PAID', annualFee: 1500, value: 630, industry: '生物医药', pledged: true },
  { no: 'ZL202310007777', title: '自动驾驶多传感器融合系统', type: '发明专利', applicant: '奥凯智能', inventor: '郑海涛', appDate: '2023-05-19', grantDate: '2025-01-28', expiryDate: '2027-05-19', status: 'PLEDGED', feeStatus: 'PAID', annualFee: 4800, value: 2400, industry: '人工智能', pledged: true },
  { no: 'ZL202010003210', title: '柔性显示基板制备工艺', type: '发明专利', applicant: '奥凯半导体', inventor: '孙嘉怡', appDate: '2020-10-21', grantDate: '2022-12-16', expiryDate: '2026-10-21', status: 'ACTIVE', feeStatus: 'PENDING', annualFee: 4300, value: 1750, industry: '半导体', pledged: false },
  { no: 'ZL202210005432', title: '风电叶片除冰系统', type: '实用新型', applicant: '奥凯新能源', inventor: '马天宇', appDate: '2022-04-12', grantDate: '2023-01-09', expiryDate: '2026-08-28', status: 'TRANSFERRING', feeStatus: 'OVERDUE', annualFee: 1500, value: 520, industry: '新能源', pledged: false },
  { no: 'ZL202410002222', title: '边缘计算节点安全认证方法', type: '发明专利', applicant: '奥凯智能', inventor: '黄晓峰', appDate: '2024-02-26', grantDate: '2025-09-10', expiryDate: '2027-02-26', status: 'TRANSFERRED', feeStatus: 'PAID', annualFee: 4000, value: 960, industry: '人工智能', pledged: false },
  { no: 'ZL202110008888', title: '高分子复合材料配方', type: '发明专利', applicant: '奥凯智造', inventor: '许文博', appDate: '2021-07-14', grantDate: '2023-03-28', expiryDate: '2026-07-14', status: 'ACTIVE', feeStatus: 'PAID', annualFee: 3600, value: 1340, industry: '智能制造', pledged: false },
  { no: 'ZL202310006666', title: '光伏组件隐裂检测方法', type: '发明专利', applicant: '奥凯新能源', inventor: '高翔', appDate: '2023-06-07', grantDate: '', expiryDate: '2026-09-02', status: 'APPLYING', feeStatus: 'PENDING', annualFee: 2600, value: 0, industry: '新能源', pledged: false }
];

var valuations = [
  { no: 'V-2026Q4-001', patentNo: 'ZL202310001234', patentTitle: '高密度固态电池电解质制备方法', quarter: '2026Q4', legalScore: 88, techScore: 91, marketScore: 84, revenueScore: 79, totalValue: 1280, method: '行业定制AI估值', status: 'PENDING', confirmBy: '', confirmTime: '' },
  { no: 'V-2026Q3-001', patentNo: 'ZL202310001234', patentTitle: '高密度固态电池电解质制备方法', quarter: '2026Q3', legalScore: 86, techScore: 89, marketScore: 82, revenueScore: 77, totalValue: 1210, method: '行业定制AI估值', status: 'CONFIRMED', confirmBy: '资产经理', confirmTime: '2026-08-05' },
  { no: 'V-2026Q4-002', patentNo: 'ZL202210009876', patentTitle: '晶圆级芯片封装散热结构', quarter: '2026Q4', legalScore: 90, techScore: 87, marketScore: 88, revenueScore: 82, totalValue: 1560, method: '行业定制AI估值', status: 'PENDING', confirmBy: '', confirmTime: '' },
  { no: 'V-2026Q2-002', patentNo: 'ZL202210009876', patentTitle: '晶圆级芯片封装散热结构', quarter: '2026Q2', legalScore: 89, techScore: 85, marketScore: 86, revenueScore: 80, totalValue: 1490, method: '行业定制AI估值', status: 'CONFIRMED', confirmBy: '资产经理', confirmTime: '2026-06-02' },
  { no: 'V-2026Q4-003', patentNo: 'ZL202110004567', patentTitle: '抗肿瘤药物靶向递送载体', quarter: '2026Q4', legalScore: 72, techScore: 78, marketScore: 65, revenueScore: 58, totalValue: 860, method: '收益法', status: 'REJECTED', confirmBy: '资产经理', confirmTime: '2026-08-12' },
  { no: 'V-2026Q3-003', patentNo: 'ZL202110004567', patentTitle: '抗肿瘤药物靶向递送载体', quarter: '2026Q3', legalScore: 75, techScore: 79, marketScore: 68, revenueScore: 60, totalValue: 890, method: '收益法', status: 'CONFIRMED', confirmBy: '资产经理', confirmTime: '2026-07-18' },
  { no: 'V-2026Q4-004', patentNo: 'ZL202310008654', patentTitle: '工业机器人视觉定位装置', quarter: '2026Q4', legalScore: 70, techScore: 74, marketScore: 66, revenueScore: 61, totalValue: 420, method: '成本法', status: 'PENDING', confirmBy: '', confirmTime: '' },
  { no: 'V-2026Q4-005', patentNo: 'ZL202410001111', patentTitle: '锂离子电池热管理模组', quarter: '2026Q4', legalScore: 87, techScore: 92, marketScore: 90, revenueScore: 86, totalValue: 1680, method: '行业定制AI估值', status: 'CONFIRMED', confirmBy: '资产经理', confirmTime: '2026-08-08' },
  { no: 'V-2026Q4-006', patentNo: 'ZL202310009999', patentTitle: '多模态语义理解模型压缩方法', quarter: '2026Q4', legalScore: 91, techScore: 94, marketScore: 89, revenueScore: 84, totalValue: 2100, method: '行业定制AI估值', status: 'PENDING', confirmBy: '', confirmTime: '' },
  { no: 'V-2026Q3-006', patentNo: 'ZL202310009999', patentTitle: '多模态语义理解模型压缩方法', quarter: '2026Q3', legalScore: 90, techScore: 92, marketScore: 87, revenueScore: 82, totalValue: 1980, method: '行业定制AI估值', status: 'CONFIRMED', confirmBy: '资产经理', confirmTime: '2026-07-25' },
  { no: 'V-2026Q4-007', patentNo: 'ZL202210007321', patentTitle: '智能仓储调度算法', quarter: '2026Q4', legalScore: 84, techScore: 88, marketScore: 80, revenueScore: 76, totalValue: 1180, method: '行业定制AI估值', status: 'PENDING', confirmBy: '', confirmTime: '' },
  { no: 'V-2026Q4-008', patentNo: 'ZL202110006543', patentTitle: '医用内窥镜图像增强装置', quarter: '2026Q4', legalScore: 78, techScore: 80, marketScore: 74, revenueScore: 70, totalValue: 630, method: '成本法', status: 'CONFIRMED', confirmBy: '资产经理', confirmTime: '2026-08-15' },
  { no: 'V-2026Q4-009', patentNo: 'ZL202310007777', patentTitle: '自动驾驶多传感器融合系统', quarter: '2026Q4', legalScore: 92, techScore: 95, marketScore: 93, revenueScore: 90, totalValue: 2400, method: '行业定制AI估值', status: 'PENDING', confirmBy: '', confirmTime: '' },
  { no: 'V-2026Q3-009', patentNo: 'ZL202310007777', patentTitle: '自动驾驶多传感器融合系统', quarter: '2026Q3', legalScore: 90, techScore: 93, marketScore: 91, revenueScore: 88, totalValue: 2280, method: '行业定制AI估值', status: 'CONFIRMED', confirmBy: '资产经理', confirmTime: '2026-07-11' },
  { no: 'V-2026Q4-010', patentNo: 'ZL202010003210', patentTitle: '柔性显示基板制备工艺', quarter: '2026Q4', legalScore: 86, techScore: 89, marketScore: 85, revenueScore: 81, totalValue: 1750, method: '行业定制AI估值', status: 'PENDING', confirmBy: '', confirmTime: '' },
  { no: 'V-2026Q1-010', patentNo: 'ZL202010003210', patentTitle: '柔性显示基板制备工艺', quarter: '2026Q1', legalScore: 83, techScore: 86, marketScore: 82, revenueScore: 78, totalValue: 1620, method: '行业定制AI估值', status: 'CONFIRMED', confirmBy: '资产经理', confirmTime: '2026-02-20' }
];

var fees = [
  { no: 'F-2026-001', patentNo: 'ZL202310001234', patentTitle: '高密度固态电池电解质制备方法', year: 2026, amount: 3600, dueDate: '2026-09-12', status: 'UPCOMING', paidDate: '' },
  { no: 'F-2025-001', patentNo: 'ZL202310001234', patentTitle: '高密度固态电池电解质制备方法', year: 2025, amount: 3600, dueDate: '2025-09-12', status: 'PAID', paidDate: '2025-08-28' },
  { no: 'F-2026-002', patentNo: 'ZL202210009876', patentTitle: '晶圆级芯片封装散热结构', year: 2026, amount: 4200, dueDate: '2026-06-30', status: 'PAID', paidDate: '2026-06-02' },
  { no: 'F-2026-003', patentNo: 'ZL202110004567', patentTitle: '抗肿瘤药物靶向递送载体', year: 2026, amount: 3000, dueDate: '2026-08-25', status: 'OVERDUE', paidDate: '' },
  { no: 'F-2025-003', patentNo: 'ZL202110004567', patentTitle: '抗肿瘤药物靶向递送载体', year: 2025, amount: 3000, dueDate: '2025-08-25', status: 'PAID', paidDate: '2025-08-10' },
  { no: 'F-2026-004', patentNo: 'ZL202310008654', patentTitle: '工业机器人视觉定位装置', year: 2026, amount: 1500, dueDate: '2026-09-05', status: 'UPCOMING', paidDate: '' },
  { no: 'F-2026-005', patentNo: 'ZL202410001111', patentTitle: '锂离子电池热管理模组', year: 2026, amount: 4200, dueDate: '2027-01-16', status: 'PENDING', paidDate: '' },
  { no: 'F-2026-006', patentNo: 'ZL202310009999', patentTitle: '多模态语义理解模型压缩方法', year: 2026, amount: 4600, dueDate: '2026-11-08', status: 'PENDING', paidDate: '' },
  { no: 'F-2026-007', patentNo: 'ZL202210007321', patentTitle: '智能仓储调度算法', year: 2026, amount: 3900, dueDate: '2026-09-20', status: 'UPCOMING', paidDate: '' },
  { no: 'F-2026-008', patentNo: 'ZL202110006543', patentTitle: '医用内窥镜图像增强装置', year: 2026, amount: 1500, dueDate: '2026-07-31', status: 'PAID', paidDate: '2026-07-12' },
  { no: 'F-2026-009', patentNo: 'ZL202310007777', patentTitle: '自动驾驶多传感器融合系统', year: 2026, amount: 4800, dueDate: '2027-05-19', status: 'PAID', paidDate: '2026-05-01' },
  { no: 'F-2026-010', patentNo: 'ZL202010003210', patentTitle: '柔性显示基板制备工艺', year: 2026, amount: 4300, dueDate: '2026-10-21', status: 'PENDING', paidDate: '' },
  { no: 'F-2026-011', patentNo: 'ZL202210005432', patentTitle: '风电叶片除冰系统', year: 2026, amount: 1500, dueDate: '2026-08-28', status: 'OVERDUE', paidDate: '' },
  { no: 'F-2026-012', patentNo: 'ZL202410002222', patentTitle: '边缘计算节点安全认证方法', year: 2026, amount: 4000, dueDate: '2027-02-26', status: 'PAID', paidDate: '2026-02-10' },
  { no: 'F-2026-013', patentNo: 'ZL202110008888', patentTitle: '高分子复合材料配方', year: 2026, amount: 3600, dueDate: '2026-07-14', status: 'PAID', paidDate: '2026-06-20' },
  { no: 'F-2026-014', patentNo: 'ZL202310006666', patentTitle: '光伏组件隐裂检测方法', year: 2026, amount: 2600, dueDate: '2026-09-02', status: 'PENDING', paidDate: '' },
  { no: 'F-2025-010', patentNo: 'ZL202010003210', patentTitle: '柔性显示基板制备工艺', year: 2025, amount: 4300, dueDate: '2025-10-21', status: 'PAID', paidDate: '2025-10-05' },
  { no: 'F-2024-010', patentNo: 'ZL202010003210', patentTitle: '柔性显示基板制备工艺', year: 2024, amount: 4300, dueDate: '2024-10-21', status: 'PAID', paidDate: '2024-10-08' }
];

var pledges = [
  { no: 'P-2026-001', patentNo: 'ZL202110006543', patentTitle: '医用内窥镜图像增强装置', bank: '工商银行', amount: 300, startDate: '2026-03-01', endDate: '2027-03-01', risk: '中', status: 'ACTIVE' },
  { no: 'P-2026-002', patentNo: 'ZL202310007777', patentTitle: '自动驾驶多传感器融合系统', bank: '建设银行', amount: 1200, startDate: '2026-05-15', endDate: '2028-05-15', risk: '高', status: 'ACTIVE' },
  { no: 'P-2025-003', patentNo: 'ZL202310001234', patentTitle: '高密度固态电池电解质制备方法', bank: '招商银行', amount: 600, startDate: '2025-09-01', endDate: '2026-08-31', risk: '低', status: 'RELEASED' },
  { no: 'P-2025-004', patentNo: 'ZL202210009876', patentTitle: '晶圆级芯片封装散热结构', bank: '中国银行', amount: 800, startDate: '2025-06-10', endDate: '2026-06-09', risk: '中', status: 'RELEASED' },
  { no: 'P-2026-005', patentNo: 'ZL202410001111', patentTitle: '锂离子电池热管理模组', bank: '浦发银行', amount: 900, startDate: '2026-02-20', endDate: '2027-02-19', risk: '低', status: 'ACTIVE' },
  { no: 'P-2026-006', patentNo: 'ZL202010003210', patentTitle: '柔性显示基板制备工艺', bank: '工商银行', amount: 700, startDate: '2026-01-10', endDate: '2027-01-09', risk: '高', status: 'ACTIVE' },
  { no: 'P-2024-007', patentNo: 'ZL202110004567', patentTitle: '抗肿瘤药物靶向递送载体', bank: '建设银行', amount: 400, startDate: '2024-11-01', endDate: '2025-10-31', risk: '中', status: 'RELEASED' },
  { no: 'P-2026-008', patentNo: 'ZL202110008888', patentTitle: '高分子复合材料配方', bank: '交通银行', amount: 550, startDate: '2026-04-01', endDate: '2027-03-31', risk: '低', status: 'ACTIVE' },
  { no: 'P-2025-009', patentNo: 'ZL202210005432', patentTitle: '风电叶片除冰系统', bank: '中信银行', amount: 250, startDate: '2025-08-01', endDate: '2026-07-31', risk: '高', status: 'RELEASED' },
  { no: 'P-2026-010', patentNo: 'ZL202310009999', patentTitle: '多模态语义理解模型压缩方法', bank: '招商银行', amount: 1100, startDate: '2026-06-01', endDate: '2028-05-31', risk: '中', status: 'ACTIVE' }
];

var transfers = [
  { no: 'T-2026-001', patentNo: 'ZL202210005432', patentTitle: '风电叶片除冰系统', buyer: '华风新能源', price: 520, reason: '战略聚焦，出售非核心专利', status: 'REVIEWING', createBy: '企业IPR专员', createTime: '2026-08-20' },
  { no: 'T-2026-002', patentNo: 'ZL202410002222', patentTitle: '边缘计算节点安全认证方法', buyer: '云枢科技', price: 960, reason: '技术转让并完成交割', status: 'DONE', createBy: '资产经理', createTime: '2026-07-12' },
  { no: 'T-2026-003', patentNo: 'ZL202310001234', patentTitle: '高密度固态电池电解质制备方法', buyer: '星澜能源', price: 1280, reason: '拟与买方联合开发', status: 'DRAFT', createBy: '企业IPR专员', createTime: '2026-08-26' },
  { no: 'T-2026-004', patentNo: 'ZL202210007321', patentTitle: '智能仓储调度算法', buyer: '仓舟智能', price: 1180, reason: '买方主动询价', status: 'REVIEWING', createBy: '资产经理', createTime: '2026-08-18' },
  { no: 'T-2025-005', patentNo: 'ZL202110006543', patentTitle: '医用内窥镜图像增强装置', buyer: '康镜医疗', price: 630, reason: '价格未达成一致', status: 'CANCELLED', createBy: '企业IPR专员', createTime: '2025-12-02' },
  { no: 'T-2026-006', patentNo: 'ZL202110008888', patentTitle: '高分子复合材料配方', buyer: '材新科技', price: 1340, reason: '产业并购配套转让', status: 'REVIEWING', createBy: '资产经理', createTime: '2026-08-15' },
  { no: 'T-2026-007', patentNo: 'ZL202310009999', patentTitle: '多模态语义理解模型压缩方法', buyer: '启元智能', price: 2100, reason: '战略合作框架下转让', status: 'DRAFT', createBy: '企业IPR专员', createTime: '2026-08-28' },
  { no: 'T-2026-008', patentNo: 'ZL202010003210', patentTitle: '柔性显示基板制备工艺', buyer: '光芯显示', price: 1750, reason: '买方产线适配需求', status: 'REVIEWING', createBy: '资产经理', createTime: '2026-08-22' }
];

var portfolios = [
  { no: 'PF-001', name: '固态电池专利族', strategy: '进攻型', industry: '新能源', patentCount: 12, totalValue: 4860, owner: '王启明' },
  { no: 'PF-002', name: '半导体封装护城河', strategy: '防御型', industry: '半导体', patentCount: 18, totalValue: 6230, owner: '李国栋' },
  { no: 'PF-003', name: 'AI 基础算法组合', strategy: '进攻型', industry: '人工智能', patentCount: 15, totalValue: 7080, owner: '赵一鸣' },
  { no: 'PF-004', name: '生物医药核心资产', strategy: '运营型', industry: '生物医药', patentCount: 8, totalValue: 2140, owner: '陈思远' },
  { no: 'PF-005', name: '智能制造产线专利包', strategy: '防御型', industry: '智能制造', patentCount: 10, totalValue: 2950, owner: '张立群' },
  { no: 'PF-006', name: '新能源配套专利组合', strategy: '运营型', industry: '新能源', patentCount: 9, totalValue: 2680, owner: '刘雨桐' }
];

var demands = [
  { no: 'D-001', company: '晶科储能', industry: '新能源', keyword: '电池热管理', budget: 1000, contact: '周经理', status: 'MATCHING' },
  { no: 'D-002', company: '微远半导体', industry: '半导体', keyword: '封装散热', budget: 1500, contact: '林工', status: 'MATCHING' },
  { no: 'D-003', company: '恒康医药', industry: '生物医药', keyword: '靶向递送', budget: 1200, contact: '苏博士', status: 'DEALT' },
  { no: 'D-004', company: '智造云控', industry: '智能制造', keyword: '仓储调度', budget: 800, contact: '钱经理', status: 'PUBLISHED' },
  { no: 'D-005', company: '深蓝智能', industry: '人工智能', keyword: '模型压缩', budget: 2000, contact: '冯工', status: 'MATCHING' },
  { no: 'D-006', company: '光芯显示', industry: '半导体', keyword: '柔性显示', budget: 1300, contact: '何总', status: 'DEALT' },
  { no: 'D-007', company: '绿能风电', industry: '新能源', keyword: '叶片除冰', budget: 600, contact: '杜工', status: 'CLOSED' },
  { no: 'D-008', company: '航迹科技', industry: '智能制造', keyword: '视觉定位', budget: 900, contact: '于经理', status: 'PUBLISHED' }
];

/* ===== 状态位（筛选/分页显隐契约 v2.4） ===== */
var filterState = {
  patentKeyword: '', patentType: 'ALL', patentStatus: 'ALL', patentIndustry: 'ALL',
  valQuarter: 'ALL', valStatus: 'ALL', valKeyword: '',
  feeYear: 'ALL', feeStatus: 'ALL', feeKeyword: '',
  pledgeRisk: 'ALL', pledgeStatus: 'ALL', transferStatus: 'ALL',
  pfStrategy: 'ALL', demandStatus: 'ALL', cockpitDim: 'asset'
};
var currentRole = 'enterprise_ipr';
var currentPatentNo = 'ZL202310001234';
var exportCounters = { patents: 0, valuation: 0, fees: 0, portfolio: 0 };
var actionSeq = 0;

var ROLE_PAGES = {
  enterprise_ipr: ['P01', 'P02', 'P03', 'P04', 'P05', 'P07'],
  asset_manager: ['P01', 'P02', 'P03', 'P05', 'P06', 'P07'],
  bank_risk: ['P01', 'P02', 'P03', 'P05'],
  c_level_exec: ['P01', 'P02', 'P03', 'P06', 'P08']
};
var ROLE_LABEL = {
  enterprise_ipr: '企业IPR专员',
  asset_manager: '资产经理',
  bank_risk: '银行风控',
  c_level_exec: 'C级高管'
};
var NAV_ROLE_CFG = {
  P04: 'enterprise_ipr',
  P06: 'asset_manager,c_level_exec',
  P07: 'enterprise_ipr,asset_manager',
  P08: 'c_level_exec'
};

function can(role, entity, action) {
  var perms = {
    enterprise_ipr: { Patent: ['create', 'read', 'update', 'batch'], AnnualFee: ['read', 'update'], Valuation: ['read', 'create'], Pledge: ['create', 'read'], TransferRequest: ['create', 'read'], MatchDemand: ['create', 'read'] },
    asset_manager: { Patent: ['read', 'update'], Valuation: ['read', 'create', 'update', 'export'], Portfolio: ['create', 'read', 'update', 'export'], TransferRequest: ['read', 'create', 'update'], Pledge: ['read'], AnnualFee: ['read'], MatchDemand: ['read'] },
    bank_risk: { Patent: ['read'], Pledge: ['read'], Valuation: ['read'], AnnualFee: ['read'], TransferRequest: ['read'] },
    c_level_exec: { Patent: ['read'], Portfolio: ['read'], Valuation: ['read'], AnnualFee: ['read'], Pledge: ['read'] }
  };
  var list = (perms[role] && perms[role][entity]) || [];
  return list.indexOf(action) >= 0;
}

function showToast(msg) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(function () { t.classList.remove('show'); }, 2200);
}

function refreshAnnotations() {
  if (window.__ANNOTATION_ENGINE__) {
    try { window.__ANNOTATION_ENGINE__.refresh(); } catch (e) { /* 引擎未就绪时忽略 */ }
  }
}

function getPatent(no) {
  for (var i = 0; i < patents.length; i++) if (patents[i].no === no) return patents[i];
  return null;
}

function updateRoleUI() {
  var allowed = ROLE_PAGES[currentRole] || [];
  document.querySelectorAll('[data-nav]').forEach(function (link) {
    var pid = link.getAttribute('data-nav');
    var roleCfg = link.getAttribute('data-role-pages') || NAV_ROLE_CFG[pid] || 'all';
    var ok = roleCfg === 'all' || (roleCfg || '').split(',').indexOf(currentRole) >= 0;
    link.classList.toggle('nav-hidden', !ok);
    if (!ok && link.classList.contains('active')) link.classList.remove('active');
  });
  var activeLink = document.querySelector('[data-nav].active');
  var cur = activeLink ? activeLink.getAttribute('data-nav') : 'P01';
  if (cur && allowed.indexOf(cur) < 0) route('P01');
  var addBtn = document.getElementById('btnAddPatent');
  if (addBtn) addBtn.disabled = !can(currentRole, 'Patent', 'create');
}

/* ===== 通用行渲染辅助 ===== */
function esc(s) { return String(s == null ? '' : s); }
function ringCell(patent) {
  var days = daysUntil(patent.expiryDate);
  if (days === null || days < 0) return '<span class="badge danger">已过期</span>';
  var C = 238.76;
  var frac = Math.max(0, Math.min(1, days / 365));
  var offset = C * (1 - frac);
  var color = days <= 30 ? '#b45309' : '#0e7490';
  return '<svg class="ring" width="30" height="30" viewBox="0 0 88 88">' +
    '<circle class="ring-bg" cx="44" cy="44" r="38"></circle>' +
    '<circle class="ring-fg" cx="44" cy="44" r="38" style="stroke:' + color + ';stroke-dashoffset:' + offset.toFixed(1) + '"></circle>' +
    '</svg><span class="ring-inline">' + days + ' 天</span>';
}

function updateCounter(id, filtered) {
  var el = document.getElementById(id);
  if (el) el.textContent = '共 ' + filtered.length + ' 条';
}

/* ===== P01 专利台账 ===== */
function renderPatents() {
  var kw = filterState.patentKeyword.toLowerCase();
  var list = patents.filter(function (p) {
    var okKw = !kw || p.no.toLowerCase().indexOf(kw) >= 0 || p.title.indexOf(kw) >= 0 || p.inventor.indexOf(kw) >= 0;
    var okType = filterState.patentType === 'ALL' || p.type === filterState.patentType;
    var okStatus = filterState.patentStatus === 'ALL' || p.status === filterState.patentStatus;
    var okInd = filterState.patentIndustry === 'ALL' || p.industry === filterState.patentIndustry;
    return okKw && okType && okStatus && okInd;
  });
  var total = patents.length;
  var active = patents.filter(function (p) { return p.status === 'ACTIVE'; }).length;
  var warn = patents.filter(function (p) { return p.status === 'EXPIRING' || p.status === 'EXPIRED'; }).length;
  var pledged = patents.filter(function (p) { return p.status === 'PLEDGED'; }).length;
  setText('mTotal', total); setText('mActive', active); setText('mWarn', warn); setText('mPledged', pledged);
  updateCounter('patentCount', list);
  var hintEl = document.getElementById('patentFilterHint');
  if (hintEl) {
    actionSeq++;
    var parts = [];
    if (filterState.patentKeyword) parts.push('关键词「' + filterState.patentKeyword + '」');
    if (filterState.patentType !== 'ALL') parts.push('类型=' + filterState.patentType);
    if (filterState.patentStatus !== 'ALL') parts.push('状态=' + (PATENT_STATUS[filterState.patentStatus] || {}).label);
    if (filterState.patentIndustry !== 'ALL') parts.push('行业=' + filterState.patentIndustry);
    hintEl.textContent = '#' + actionSeq + ' ' + (parts.length ? '当前筛选：' + parts.join(' · ') : '当前筛选：全部');
  }
  var tbody = document.getElementById('patentTbody');
  if (!tbody) return;
  if (list.length === 0) {
    tbody.innerHTML = '';
    return;
  }
  var html = '';
  for (var i = 0; i < list.length; i++) {
    var p = list[i];
    var anchor = ' data-element-id="P01-L3-' + pad3(14 + patents.indexOf(p)) + '"';
    html += '<tr data-patent-no="' + esc(p.no) + '" data-filtered="1">' +
      '<td class="mono">' + esc(p.no) + '</td>' +
      '<td><strong>' + esc(p.title) + '</strong></td>' +
      '<td>' + esc(p.type) + '</td>' +
      '<td>' + badge(FEE_STATUS, p.feeStatus) + '</td>' +
      '<td>' + ringCell(p) + '</td>' +
      '<td>' + badge(PATENT_STATUS, p.status) + '</td>' +
      '<td class="num">' + (p.value || '-') + '</td>' +
      '<td><button type="button" class="row-btn"' + anchor + ' data-action="patent-view" data-patent-no="' + esc(p.no) + '">详情</button></td>' +
      '</tr>';
  }
  tbody.innerHTML = html;
  refreshAnnotations();
}

/* ===== P03 估值管理 ===== */
function renderValuations() {
  var kw = filterState.valKeyword.toLowerCase();
  var list = valuations.filter(function (v) {
    var okQ = filterState.valQuarter === 'ALL' || v.quarter === filterState.valQuarter;
    var okS = filterState.valStatus === 'ALL' || v.status === filterState.valStatus;
    var okK = !kw || v.patentNo.toLowerCase().indexOf(kw) >= 0;
    return okQ && okS && okK;
  });
  var pending = valuations.filter(function (v) { return v.status === 'PENDING'; }).length;
  var confirmed = valuations.filter(function (v) { return v.status === 'CONFIRMED'; }).length;
  var rejected = valuations.filter(function (v) { return v.status === 'REJECTED'; }).length;
  var avg = valuations.length ? Math.round(valuations.reduce(function (s, v) { return s + v.totalValue; }, 0) / valuations.length) : 0;
  setText('valPending', pending); setText('valConfirmed', confirmed); setText('valRejected', rejected); setText('valAvg', avg);
  updateCounter('valCount', list);
  var hintEl = document.getElementById('valFilterHint');
  if (hintEl) {
    actionSeq++;
    var parts = [];
    if (filterState.valKeyword) parts.push('专利号含「' + filterState.valKeyword + '」');
    if (filterState.valQuarter !== 'ALL') parts.push('季度=' + filterState.valQuarter);
    if (filterState.valStatus !== 'ALL') parts.push('状态=' + (VAL_STATUS[filterState.valStatus] || {}).label);
    hintEl.textContent = '#' + actionSeq + ' ' + (parts.length ? '当前筛选：' + parts.join(' · ') : '当前筛选：全部');
  }
  var tbody = document.getElementById('valTbody');
  if (!tbody) return;
  if (list.length === 0) {
    tbody.innerHTML = '';
    return;
  }
  var isManager = can(currentRole, 'Valuation', 'update');
  var html = '';
  for (var i = 0; i < list.length; i++) {
    var v = list[i];
    var vi = valuations.indexOf(v);
    var confAnchor = vi < 16 ? ' data-element-id="P03-L3-' + pad3(12 + vi) + '"' : '';
    var rejAnchor = vi < 16 ? ' data-element-id="P03-L3-' + pad3(28 + vi) + '"' : '';
    var confDisabled = !(isManager && v.status === 'PENDING');
    var rejDisabled = !(isManager && v.status === 'PENDING');
    html += '<tr data-val-no="' + esc(v.no) + '" data-filtered="1">' +
      '<td class="mono">' + esc(v.no) + '</td>' +
      '<td class="mono">' + esc(v.patentNo) + '</td>' +
      '<td>' + esc(v.patentTitle) + '</td>' +
      '<td>' + esc(v.quarter) + '</td>' +
      '<td class="num">' + v.legalScore + '</td><td class="num">' + v.techScore + '</td>' +
      '<td class="num">' + v.marketScore + '</td><td class="num">' + v.revenueScore + '</td>' +
      '<td class="num"><strong>' + v.totalValue + '</strong></td>' +
      '<td>' + badge(VAL_STATUS, v.status) + '</td>' +
      '<td><button type="button" class="row-btn"' + confAnchor + ' data-action="val-confirm" data-val-no="' + esc(v.no) + '"' + (confDisabled ? ' disabled' : '') + '>确认</button> ' +
      '<button type="button" class="row-btn"' + rejAnchor + ' data-action="val-reject" data-val-no="' + esc(v.no) + '"' + (rejDisabled ? ' disabled' : '') + '>驳回</button></td>' +
      '</tr>';
  }
  tbody.innerHTML = html;
  refreshAnnotations();
}

/* ===== P04 年费监控 ===== */
function renderFees() {
  var kw = filterState.feeKeyword.toLowerCase();
  var list = fees.filter(function (f) {
    var okY = filterState.feeYear === 'ALL' || String(f.year) === filterState.feeYear;
    var okS = filterState.feeStatus === 'ALL' || f.status === filterState.feeStatus;
    var okK = !kw || f.patentNo.toLowerCase().indexOf(kw) >= 0;
    return okY && okS && okK;
  });
  var upcoming = fees.filter(function (f) { return f.status === 'UPCOMING'; }).length;
  var overdue = fees.filter(function (f) { return f.status === 'OVERDUE'; }).length;
  var pending = fees.filter(function (f) { return f.status === 'PENDING'; }).length;
  setText('feeUpcoming', upcoming); setText('feeOverdue', overdue); setText('feePending', pending);
  updateCounter('feeCount', list);
  var hintEl = document.getElementById('feeFilterHint');
  if (hintEl) {
    actionSeq++;
    var parts = [];
    if (filterState.feeKeyword) parts.push('专利号含「' + filterState.feeKeyword + '」');
    if (filterState.feeYear !== 'ALL') parts.push('年度=' + filterState.feeYear);
    if (filterState.feeStatus !== 'ALL') parts.push('状态=' + (FEE_STATUS[filterState.feeStatus] || {}).label);
    hintEl.textContent = '#' + actionSeq + ' ' + (parts.length ? '当前筛选：' + parts.join(' · ') : '当前筛选：全部');
  }
  var tbody = document.getElementById('feeTbody');
  if (!tbody) return;
  if (list.length === 0) {
    tbody.innerHTML = '';
    return;
  }
  var html = '';
  for (var i = 0; i < list.length; i++) {
    var f = list[i];
    var payable = f.status === 'PENDING' || f.status === 'UPCOMING';
    var anchor = ' data-element-id="P04-L3-' + pad3(9 + fees.indexOf(f)) + '"';
    html += '<tr data-fee-no="' + esc(f.no) + '" data-filtered="1">' +
      '<td class="mono">' + esc(f.no) + '</td>' +
      '<td class="mono">' + esc(f.patentNo) + '</td>' +
      '<td>' + esc(f.patentTitle) + '</td>' +
      '<td>' + f.year + '</td>' +
      '<td class="num">' + f.amount + '</td>' +
      '<td>' + fmtDate(f.dueDate) + '</td>' +
      '<td>' + badge(FEE_STATUS, f.status) + '</td>' +
      '<td>' + fmtDate(f.paidDate) + '</td>' +
      '<td><button type="button" class="row-btn"' + anchor + ' data-action="fee-pay" data-fee-no="' + esc(f.no) + '"' + (payable ? '' : ' disabled') + '>缴费登记</button></td>' +
      '</tr>';
  }
  tbody.innerHTML = html;
  refreshAnnotations();
}

/* ===== P05 质押 / 转让 ===== */
function renderPledges() {
  var list = pledges.filter(function (p) {
    return (filterState.pledgeRisk === 'ALL' || p.risk === filterState.pledgeRisk) &&
      (filterState.pledgeStatus === 'ALL' || p.status === filterState.pledgeStatus);
  });
  var active = pledges.filter(function (p) { return p.status === 'ACTIVE'; }).length;
  var high = pledges.filter(function (p) { return p.risk === '高' && p.status === 'ACTIVE'; }).length;
  setText('plgActive', active); setText('plgHigh', high);
  var hintEl = document.getElementById('pledgeFilterHint');
  if (hintEl) {
    actionSeq++;
    var parts = [];
    if (filterState.pledgeRisk !== 'ALL') parts.push('风险=' + filterState.pledgeRisk);
    if (filterState.pledgeStatus !== 'ALL') parts.push('状态=质押中');
    hintEl.textContent = '#' + actionSeq + ' ' + (parts.length ? '当前质押筛选：' + parts.join(' · ') : '当前质押筛选：全部');
  }
  var tbody = document.getElementById('pledgeTbody');
  if (!tbody) return;
  if (list.length === 0) {
    tbody.innerHTML = '';
  } else {
    var html = '';
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      var anchor = ' data-element-id="P05-L3-' + pad3(10 + pledges.indexOf(p)) + '"';
      html += '<tr data-pledge-no="' + esc(p.no) + '" data-filtered="1">' +
        '<td class="mono">' + esc(p.no) + '</td>' +
        '<td class="mono">' + esc(p.patentNo) + '</td>' +
        '<td>' + esc(p.patentTitle) + '</td>' +
        '<td>' + esc(p.bank) + '</td>' +
        '<td class="num">' + p.amount + '</td>' +
        '<td>' + fmtDate(p.startDate) + '</td>' +
        '<td>' + fmtDate(p.endDate) + '</td>' +
        '<td>' + badge({ 低: { label: '低', cls: 'ok' }, 中: { label: '中', cls: 'warn' }, 高: { label: '高', cls: 'danger' } }, p.risk) + '</td>' +
        '<td>' + badge(PLEDGE_STATUS, p.status) + '</td>' +
        '<td><button type="button" class="row-btn"' + anchor + ' data-action="pledge-release" data-pledge-no="' + esc(p.no) + '"' + (p.status === 'ACTIVE' ? '' : ' disabled') + '>解除质押</button></td>' +
        '</tr>';
    }
    tbody.innerHTML = html;
  }
  var cnt = document.getElementById('pledgeCount');
  if (cnt) cnt.textContent = '质押 ' + list.length + ' 条';
  refreshAnnotations();
}

function renderTransfers() {
  var list = transfers.filter(function (t) {
    return filterState.transferStatus === 'ALL' || t.status === filterState.transferStatus;
  });
  var reviewing = transfers.filter(function (t) { return t.status === 'REVIEWING'; }).length;
  var done = transfers.filter(function (t) { return t.status === 'DONE'; }).length;
  setText('trfReviewing', reviewing); setText('trfDone', done);
  var hintEl = document.getElementById('pledgeFilterHint');
  if (hintEl) {
    actionSeq++;
    var parts = [];
    if (filterState.transferStatus !== 'ALL') parts.push('转让状态=' + (TRANSFER_STATUS[filterState.transferStatus] || {}).label);
    hintEl.textContent = '#' + actionSeq + ' ' + (parts.length ? '当前转让筛选：' + parts.join(' · ') : '当前转让筛选：全部');
  }
  var tbody = document.getElementById('transferTbody');
  if (!tbody) return;
  if (list.length === 0) {
    tbody.innerHTML = '';
  } else {
    var html = '';
    for (var i = 0; i < list.length; i++) {
      var t = list[i];
      var anchor = ' data-element-id="P05-L3-' + pad3(20 + transfers.indexOf(t)) + '"';
      var cancelable = t.status === 'DRAFT' || t.status === 'REVIEWING';
      html += '<tr data-transfer-no="' + esc(t.no) + '" data-filtered="1">' +
        '<td class="mono">' + esc(t.no) + '</td>' +
        '<td class="mono">' + esc(t.patentNo) + '</td>' +
        '<td>' + esc(t.buyer) + '</td>' +
        '<td class="num">' + t.price + '</td>' +
        '<td>' + esc(t.reason) + '</td>' +
        '<td>' + badge(TRANSFER_STATUS, t.status) + '</td>' +
        '<td>' + esc(t.createBy) + '</td>' +
        '<td><button type="button" class="row-btn"' + anchor + ' data-action="transfer-cancel" data-transfer-no="' + esc(t.no) + '"' + (cancelable ? '' : ' disabled') + '>取消转让</button></td>' +
        '</tr>';
    }
    tbody.innerHTML = html;
  }
  var cnt = document.getElementById('transferCount');
  if (cnt) cnt.textContent = '转让 ' + list.length + ' 条';
  refreshAnnotations();
}

/* ===== P06 组合分析 ===== */
function renderPortfolios() {
  var list = portfolios.filter(function (p) {
    return filterState.pfStrategy === 'ALL' || p.strategy === filterState.pfStrategy;
  });
  setText('pfCount', portfolios.length);
  setText('pfPatents', portfolios.reduce(function (s, p) { return s + p.patentCount; }, 0));
  setText('pfValue', portfolios.reduce(function (s, p) { return s + p.totalValue; }, 0));
  var hintEl = document.getElementById('portfolioFilterHint');
  if (hintEl) {
    actionSeq++;
    hintEl.textContent = '#' + actionSeq + ' ' + (filterState.pfStrategy !== 'ALL' ? '当前筛选：战略=' + filterState.pfStrategy : '当前筛选：全部');
  }
  var cnt = document.getElementById('portfolioCount');
  if (cnt) cnt.textContent = '组合 ' + list.length + ' 个';
  ['防御型', '进攻型', '运营型'].forEach(function (strategy) {
    var n = portfolios.filter(function (p) { return p.strategy === strategy; }).length;
    var bar = strategy === '防御型' ? 'barDefensive' : (strategy === '进攻型' ? 'barOffensive' : 'barOperation');
    var barEl = document.getElementById(bar);
    var numEl = document.getElementById(bar + 'Num');
    if (barEl) barEl.style.width = (n / portfolios.length * 100) + '%';
    if (numEl) numEl.textContent = n + ' 个';
  });
  var tbody = document.getElementById('portfolioTbody');
  if (!tbody) return;
  if (list.length === 0) {
    tbody.innerHTML = '';
    return;
  }
  var html = '';
  for (var i = 0; i < list.length; i++) {
    var p = list[i];
    var anchor = ' data-element-id="P06-L3-' + pad3(8 + portfolios.indexOf(p)) + '"';
    html += '<tr data-portfolio-no="' + esc(p.no) + '" data-filtered="1">' +
      '<td class="mono">' + esc(p.no) + '</td>' +
      '<td><strong>' + esc(p.name) + '</strong></td>' +
      '<td>' + badge({ 防御型: { label: '防御型', cls: 'info' }, 进攻型: { label: '进攻型', cls: 'primary' }, 运营型: { label: '运营型', cls: 'ok' } }, p.strategy) + '</td>' +
      '<td>' + esc(p.industry) + '</td>' +
      '<td class="num">' + p.patentCount + '</td>' +
      '<td class="num"><strong>' + p.totalValue + '</strong></td>' +
      '<td>' + esc(p.owner) + '</td>' +
      '<td><button type="button" class="row-btn"' + anchor + ' data-action="portfolio-view" data-portfolio-no="' + esc(p.no) + '">查看明细</button></td>' +
      '</tr>';
  }
  tbody.innerHTML = html;
  refreshAnnotations();
}

/* ===== P07 撮合通道 ===== */
function renderDemands() {
  var list = demands.filter(function (d) {
    return filterState.demandStatus === 'ALL' || d.status === filterState.demandStatus;
  });
  var published = demands.filter(function (d) { return d.status === 'PUBLISHED'; }).length;
  var matching = demands.filter(function (d) { return d.status === 'MATCHING'; }).length;
  var dealt = demands.filter(function (d) { return d.status === 'DEALT'; }).length;
  setText('dmPublished', published); setText('dmMatching', matching); setText('dmDealt', dealt);
  var hintEl = document.getElementById('demandFilterHint');
  if (hintEl) {
    actionSeq++;
    hintEl.textContent = '#' + actionSeq + ' ' + (filterState.demandStatus !== 'ALL' ? '当前筛选：状态=' + (DEMAND_STATUS[filterState.demandStatus] || {}).label : '当前筛选：全部');
  }
  var cnt = document.getElementById('demandCount');
  if (cnt) cnt.textContent = '需求 ' + list.length + ' 条';
  var tbody = document.getElementById('demandTbody');
  if (!tbody) return;
  if (list.length === 0) {
    tbody.innerHTML = '';
    return;
  }
  var html = '';
  for (var i = 0; i < list.length; i++) {
    var d = list[i];
    var anchor = ' data-element-id="P07-L3-' + pad3(7 + demands.indexOf(d)) + '"';
    html += '<tr data-demand-no="' + esc(d.no) + '" data-filtered="1">' +
      '<td class="mono">' + esc(d.no) + '</td>' +
      '<td><strong>' + esc(d.company) + '</strong></td>' +
      '<td>' + esc(d.industry) + '</td>' +
      '<td>' + esc(d.keyword) + '</td>' +
      '<td class="num">' + d.budget + '</td>' +
      '<td>' + esc(d.contact) + '</td>' +
      '<td>' + badge(DEMAND_STATUS, d.status) + '</td>' +
      '<td><button type="button" class="row-btn"' + anchor + ' data-action="match-run" data-demand-no="' + esc(d.no) + '">智能匹配</button></td>' +
      '</tr>';
  }
  tbody.innerHTML = html;
  refreshAnnotations();
}

/* ===== P08 高管驾驶舱 ===== */
function renderCockpit() {
  var totalValue = patents.reduce(function (s, p) { return s + (p.value || 0); }, 0);
  var active = patents.filter(function (p) { return p.status === 'ACTIVE' || p.status === 'PLEDGED' || p.status === 'TRANSFERRING'; }).length;
  var risk = patents.filter(function (p) { return p.status === 'EXPIRING' || p.status === 'EXPIRED'; }).length;
  var pledged = patents.filter(function (p) { return p.pledged; }).length;
  setText('ckTotal', totalValue);
  setText('ckActive', active);
  setText('ckRisk', risk);
  setText('ckPledge', patents.length ? Math.round(pledged / patents.length * 100) : 0);

  var byInd = {};
  patents.forEach(function (p) {
    if (!byInd[p.industry]) byInd[p.industry] = { count: 0, value: 0 };
    byInd[p.industry].count++;
    byInd[p.industry].value += (p.value || 0);
  });
  var inds = ['半导体', '新能源', '生物医药', '智能制造', '人工智能'];
  var maxCount = 1;
  inds.forEach(function (ind) { if (byInd[ind] && byInd[ind].count > maxCount) maxCount = byInd[ind].count; });
  inds.forEach(function (ind, idx) {
    var bar = document.getElementById('barInd' + (idx + 1));
    var num = document.getElementById('barInd' + (idx + 1) + 'Num');
    var d = byInd[ind] || { count: 0, value: 0 };
    if (bar) bar.style.width = (d.count / maxCount * 100) + '%';
    if (num) num.textContent = d.count + ' 件 / ' + d.value + ' 万';
  });

  var riskList = patents.filter(function (p) {
    return p.status === 'EXPIRING' || p.status === 'EXPIRED' || p.pledged;
  });
  var tbody = document.getElementById('riskTbody');
  if (tbody) {
    var cnt = document.getElementById('riskCount');
    if (cnt) cnt.textContent = '风险专利 ' + riskList.length + ' 件';
    if (riskList.length === 0) {
      tbody.innerHTML = '';
    } else {
      var html = '';
      for (var i = 0; i < riskList.length; i++) {
        var p = riskList[i];
        var riskItem = p.status === 'EXPIRED' ? '逾期失效' : (p.status === 'EXPIRING' ? '年费即将到期' : '质押中');
        var anchor = ' data-element-id="P08-L3-' + pad3(9 + i) + '"';
        html += '<tr data-patent-no="' + esc(p.no) + '" data-filtered="1">' +
          '<td class="mono">' + esc(p.no) + '</td>' +
          '<td>' + esc(p.title) + '</td>' +
          '<td>' + esc(p.industry) + '</td>' +
          '<td><span class="badge danger">' + riskItem + '</span></td>' +
          '<td>' + badge(PATENT_STATUS, p.status) + '</td>' +
          '<td class="num">' + (p.value || '-') + '</td>' +
          '<td><button type="button" class="row-btn"' + anchor + ' data-action="cockpit-view" data-patent-no="' + esc(p.no) + '">查看详情</button></td>' +
          '</tr>';
      }
      tbody.innerHTML = html;
    }
  }
  document.querySelectorAll('[data-cockpit-dim]').forEach(function (b) {
    var on = b.getAttribute('data-cockpit-dim') === filterState.cockpitDim;
    b.classList.toggle('active', on);
  });
  refreshAnnotations();
}

/* ===== P02 专利详情 ===== */
function renderDetail(no) {
  var p = getPatent(no);
  if (!p) return;
  var set = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
  var setHtml = function (id, v) { var el = document.getElementById(id); if (el) el.innerHTML = v; };
  set('dTitle', p.title);
  set('dNo', p.no);
  set('dNo2', p.no);
  set('dType', p.type);
  set('dApplicant', p.applicant);
  set('dInventor', p.inventor);
  set('dAppDate', fmtDate(p.appDate));
  set('dGrantDate', p.grantDate ? p.grantDate : '—');
  set('dExpiry', fmtDate(p.expiryDate));
  set('dIndustry', p.industry);
  setHtml('dStatus', badge(PATENT_STATUS, p.status));
  setHtml('dFeeStatus', badge(FEE_STATUS, p.feeStatus));
  set('dFee', '¥' + p.annualFee.toLocaleString());
  set('dValue', p.value ? p.value.toLocaleString() + ' 万元' : '待估值');
  var days = daysUntil(p.expiryDate);
  set('dDays', days === null || days < 0 ? '—' : days);
  var ring = document.getElementById('dRing');
  if (ring) {
    var fg = ring.querySelector('.ring-fg');
    var C = 238.76;
    var frac = days === null || days < 0 ? 0 : Math.max(0, Math.min(1, days / 365));
    if (fg) {
      fg.style.strokeDashoffset = (C * (1 - frac)).toFixed(1);
      fg.style.stroke = days !== null && days <= 30 ? '#b45309' : '#0e7490';
    }
  }
  var feeRows = fees.filter(function (f) { return f.patentNo === no; });
  var feeTbody = document.getElementById('feeTbodyD');
  if (feeTbody) {
    feeTbody.innerHTML = feeRows.length === 0
      ? '<tr class="empty-row"><td colspan="5">暂无年费记录</td></tr>'
      : feeRows.map(function (f) {
          return '<tr><td>' + f.year + '</td><td class="num">' + f.amount + '</td><td>' + fmtDate(f.dueDate) + '</td><td>' + badge(FEE_STATUS, f.status) + '</td><td>' + fmtDate(f.paidDate) + '</td></tr>';
        }).join('');
  }
  var valRows = valuations.filter(function (v) { return v.patentNo === no; }).sort(function (a, b) { return b.quarter < a.quarter ? -1 : 1; });
  var valTbody = document.getElementById('valTbodyD');
  if (valTbody) {
    valTbody.innerHTML = valRows.length === 0
      ? '<tr class="empty-row"><td colspan="7">暂无估值记录</td></tr>'
      : valRows.map(function (v) {
          return '<tr><td>' + v.quarter + '</td><td class="num">' + v.legalScore + '</td><td class="num">' + v.techScore + '</td><td class="num">' + v.marketScore + '</td><td class="num">' + v.revenueScore + '</td><td class="num"><strong>' + v.totalValue + '</strong></td><td>' + badge(VAL_STATUS, v.status) + '</td></tr>';
        }).join('');
  }
  var pledgeRows = pledges.filter(function (q) { return q.patentNo === no; });
  var pledgeTbody = document.getElementById('pledgeTbodyD');
  if (pledgeTbody) {
    pledgeTbody.innerHTML = pledgeRows.length === 0
      ? '<tr class="empty-row"><td colspan="5">暂无质押记录</td></tr>'
      : pledgeRows.map(function (q) {
          return '<tr><td>' + q.bank + '</td><td class="num">' + q.amount + '</td><td>' + fmtDate(q.startDate) + '</td><td>' + fmtDate(q.endDate) + '</td><td>' + badge(PLEDGE_STATUS, q.status) + '</td></tr>';
        }).join('');
  }
  var trfRows = transfers.filter(function (t) { return t.patentNo === no; });
  var trfTbody = document.getElementById('transferTbodyD');
  if (trfTbody) {
    trfTbody.innerHTML = trfRows.length === 0
      ? '<tr class="empty-row"><td colspan="4">暂无转让记录</td></tr>'
      : trfRows.map(function (t) {
          return '<tr><td>' + t.buyer + '</td><td class="num">' + t.price + '</td><td>' + badge(TRANSFER_STATUS, t.status) + '</td><td>' + t.createBy + '</td></tr>';
        }).join('');
  }
  var btnPay = document.getElementById('btnPay');
  var btnValuate = document.getElementById('btnValuate');
  var btnPledge = document.getElementById('btnPledge');
  var btnRelease = document.getElementById('btnRelease');
  var btnTransfer = document.getElementById('btnTransfer');
  if (btnPay) btnPay.disabled = !(p.feeStatus === 'PENDING' || p.feeStatus === 'UPCOMING');
  if (btnValuate) btnValuate.disabled = valuations.some(function (v) { return v.patentNo === no && v.quarter === '2026Q4' && v.status === 'PENDING'; });
  if (btnPledge) btnPledge.disabled = p.pledged || !(p.status === 'ACTIVE' || p.status === 'EXPIRING') || !can(currentRole, 'Pledge', 'create');
  if (btnRelease) btnRelease.disabled = !p.pledged;
  if (btnTransfer) btnTransfer.disabled = p.pledged || !can(currentRole, 'TransferRequest', 'create');
  refreshAnnotations();
}

/* ===== 弹窗选项联动 ===== */
function updateModalOptions() {
  var pledgeSel = document.getElementById('plg_no');
  if (pledgeSel) {
    var cand = patents.filter(function (p) { return !p.pledged && (p.status === 'ACTIVE' || p.status === 'EXPIRING'); });
    pledgeSel.innerHTML = cand.map(function (p) {
      return '<option value="' + esc(p.no) + '">' + esc(p.no) + ' · ' + esc(p.title) + '</option>';
    }).join('');
  }
  var trfSel = document.getElementById('trf_no');
  if (trfSel) {
    var cand2 = patents.filter(function (p) { return !p.pledged && p.status !== 'TRANSFERRED'; });
    trfSel.innerHTML = cand2.map(function (p) {
      return '<option value="' + esc(p.no) + '">' + esc(p.no) + ' · ' + esc(p.title) + '</option>';
    }).join('');
  }
}

function setText(id, v) {
  var el = document.getElementById(id);
  if (el) el.textContent = v;
}

function doExport(key, label) {
  exportCounters[key] = (exportCounters[key] || 0) + 1;
  var hint = { patents: 'exportHintPatents', valuation: 'exportHintValuation', fees: 'exportHintFees', portfolio: 'exportHintPortfolio' }[key];
  var el = document.getElementById(hint);
  if (el) el.textContent = el.textContent.replace(/\d+/, exportCounters[key]);
  showToast(label + '已生成，共 ' + exportCounters[key] + ' 份');
}

function renderAll() {
  renderPatents();
  renderValuations();
  renderFees();
  renderPledges();
  renderTransfers();
  renderPortfolios();
  renderDemands();
  renderCockpit();
  renderDetail(currentPatentNo);
  updateModalOptions();
}

/* ===== 业务 action 分发（P008/P039 契约） ===== */
window.handleDemoAction = function (action, target, e) {
  var ds = target.dataset || {};
  switch (action) {
    case 'switch-role':
      currentRole = (document.querySelector('[data-action="switch-role"]') || {}).value || target.value;
      updateRoleUI();
      renderAll();
      showToast('已切换角色：' + (ROLE_LABEL[currentRole] || currentRole));
      break;
    case 'patent-search':
      filterState.patentKeyword = (document.querySelector('[data-action="patent-search"]') || {}).value || '';
      renderPatents();
      break;
    case 'patent-filter-type':
      filterState.patentType = (document.querySelector('[data-action="patent-filter-type"]') || {}).value || 'ALL';
      renderPatents();
      break;
    case 'patent-filter-status':
      filterState.patentStatus = (document.querySelector('[data-action="patent-filter-status"]') || {}).value || 'ALL';
      renderPatents();
      break;
    case 'patent-filter-industry':
      filterState.patentIndustry = (document.querySelector('[data-action="patent-filter-industry"]') || {}).value || 'ALL';
      renderPatents();
      break;
    case 'patent-query':
      renderPatents();
      showToast('筛选条件已应用');
      break;
    case 'patent-reset':
      filterState.patentKeyword = '';
      filterState.patentType = 'ALL';
      filterState.patentStatus = 'ALL';
      filterState.patentIndustry = 'ALL';
      var els = ['patentKeyword', 'patentType', 'patentStatus', 'patentIndustry'];
      els.forEach(function (id) { var el = document.getElementById(id); if (el) el.value = id === 'patentKeyword' ? '' : 'ALL'; });
      renderPatents();
      showToast('筛选已重置');
      break;
    case 'patent-metric':
      filterState.patentStatus = ds.filterStatus || 'ALL';
      var st = document.getElementById('patentStatus');
      if (st) st.value = filterState.patentStatus;
      renderPatents();
      break;
    case 'patent-export':
      doExport('patents', '专利台账底稿');
      break;
    case 'patent-view':
      currentPatentNo = ds.patentNo || currentPatentNo;
      renderDetail(currentPatentNo);
      route('P02');
      break;
    case 'back-ledger':
      route('P01');
      break;
    case 'fee-pay-detail': {
      var p = getPatent(currentPatentNo);
      if (p) {
        var f = fees.filter(function (x) { return x.patentNo === p.no && (x.status === 'PENDING' || x.status === 'UPCOMING'); })[0];
        if (f) {
          f.status = 'PAID';
          f.paidDate = todayStr();
          p.feeStatus = 'PAID';
          renderDetail(p.no);
          renderFees();
          renderPatents();
          showToast('缴费登记成功：' + f.no);
        } else {
          showToast('该专利当前无可登记费用');
        }
      }
      break;
    }
    case 'val-create-detail': {
      var p2 = getPatent(currentPatentNo);
      if (p2) {
        var existing = valuations.some(function (v) { return v.patentNo === p2.no && v.quarter === '2026Q4'; });
        if (existing) {
          showToast('本季度已有估值记录');
        } else {
          valuations.push({
            no: 'V-2026Q4-' + pad(valuations.length + 1),
            patentNo: p2.no,
            patentTitle: p2.title,
            quarter: '2026Q4',
            legalScore: 80 + Math.round(Math.random() * 10),
            techScore: 82 + Math.round(Math.random() * 10),
            marketScore: 76 + Math.round(Math.random() * 12),
            revenueScore: 72 + Math.round(Math.random() * 12),
            totalValue: Math.round((p2.value || 500) * (0.95 + Math.random() * 0.1)),
            method: '行业定制AI估值',
            status: 'PENDING',
            confirmBy: '',
            confirmTime: ''
          });
          renderDetail(p2.no);
          renderValuations();
          showToast('已为 ' + p2.no + ' 发起季度估值');
        }
      }
      break;
    }
    case 'pledge-release-detail': {
      var p3 = getPatent(currentPatentNo);
      if (p3 && p3.pledged) {
        var q = pledges.filter(function (x) { return x.patentNo === p3.no && x.status === 'ACTIVE'; })[0];
        if (q) q.status = 'RELEASED';
        p3.pledged = false;
        p3.status = 'ACTIVE';
        renderDetail(p3.no);
        renderPledges();
        renderPatents();
        showToast('质押已解除：' + p3.no);
      }
      break;
    }
    case 'pledge-add-submit': {
      var pNo = document.getElementById('plg_no').value;
      var bank = document.getElementById('plg_bank').value;
      var amount = document.getElementById('plg_amount').value;
      var start = document.getElementById('plg_start').value;
      var end = document.getElementById('plg_end').value;
      var risk = document.getElementById('plg_risk').value;
      if (!pNo || !bank || !amount || !start || !end) {
        showToast('请完整填写质押登记信息');
        break;
      }
      var pp = getPatent(pNo);
      if (!pp || pp.pledged) {
        showToast('该专利已质押或不可质押');
        break;
      }
      pledges.push({ no: 'P-2026-' + pad(pledges.length + 1), patentNo: pNo, patentTitle: pp.title, bank: bank, amount: Number(amount), startDate: start, endDate: end, risk: risk, status: 'ACTIVE' });
      pp.pledged = true;
      pp.status = 'PLEDGED';
      closeModal(document.getElementById('pledgeModal'));
      renderPledges();
      renderPatents();
      renderDetail(currentPatentNo);
      updateModalOptions();
      showToast('质押登记成功：' + pNo);
      break;
    }
    case 'transfer-add-submit': {
      var tNo = document.getElementById('trf_no').value;
      var buyer = document.getElementById('trf_buyer').value;
      var price = document.getElementById('trf_price').value;
      var reason = document.getElementById('trf_reason').value;
      if (!tNo || !buyer || !price) {
        showToast('请完整填写转让信息');
        break;
      }
      var tp = getPatent(tNo);
      if (!tp || tp.pledged) {
        showToast('质押中的专利不可转让，请先解除质押');
        break;
      }
      transfers.push({ no: 'T-2026-' + pad(transfers.length + 1), patentNo: tNo, patentTitle: tp.title, buyer: buyer, price: Number(price), reason: reason || '商业转让', status: 'REVIEWING', createBy: ROLE_LABEL[currentRole], createTime: todayStr() });
      tp.status = 'TRANSFERRING';
      closeModal(document.getElementById('transferModal'));
      renderTransfers();
      renderPatents();
      renderDetail(currentPatentNo);
      updateModalOptions();
      showToast('转让请求已发起：' + tNo);
      break;
    }
    case 'val-create': {
      var created = 0;
      patents.forEach(function (p) {
        var has = valuations.some(function (v) { return v.patentNo === p.no && v.quarter === '2026Q4'; });
        if (!has && p.status !== 'APPLYING' && p.value > 0) {
          valuations.push({
            no: 'V-2026Q4-' + pad(valuations.length + 1 + created),
            patentNo: p.no,
            patentTitle: p.title,
            quarter: '2026Q4',
            legalScore: 80 + Math.round(Math.random() * 10),
            techScore: 82 + Math.round(Math.random() * 10),
            marketScore: 76 + Math.round(Math.random() * 12),
            revenueScore: 72 + Math.round(Math.random() * 12),
            totalValue: Math.round((p.value || 500) * (0.95 + Math.random() * 0.1)),
            method: '行业定制AI估值',
            status: 'PENDING',
            confirmBy: '',
            confirmTime: ''
          });
          created++;
        }
      });
      renderValuations();
      showToast(created > 0 ? '已为 ' + created + ' 件专利发起季度估值' : '本季度估值已全部生成');
      break;
    }
    case 'val-confirm':
      valuations.forEach(function (v) {
        if (v.no === ds.valNo && v.status === 'PENDING') {
          v.status = 'CONFIRMED';
          v.confirmBy = '资产经理';
          v.confirmTime = todayStr();
        }
      });
      renderValuations();
      renderDetail(currentPatentNo);
      showToast('估值已确认');
      break;
    case 'val-reject':
      valuations.forEach(function (v) {
        if (v.no === ds.valNo && v.status === 'PENDING') v.status = 'REJECTED';
      });
      renderValuations();
      renderDetail(currentPatentNo);
      showToast('估值已驳回');
      break;
    case 'val-export':
      doExport('valuation', '估值报告');
      break;
    case 'val-filter-quarter':
      filterState.valQuarter = (document.querySelector('[data-action="val-filter-quarter"]') || {}).value || 'ALL';
      renderValuations();
      break;
    case 'val-filter-status':
      filterState.valStatus = (document.querySelector('[data-action="val-filter-status"]') || {}).value || 'ALL';
      renderValuations();
      break;
    case 'val-search':
      filterState.valKeyword = (document.querySelector('[data-action="val-search"]') || {}).value || '';
      renderValuations();
      break;
    case 'val-metric':
      filterState.valStatus = ds.filterStatus || 'ALL';
      var vs = document.getElementById('valStatus');
      if (vs) vs.value = filterState.valStatus;
      renderValuations();
      break;
    case 'fee-search':
      filterState.feeKeyword = (document.querySelector('[data-action="fee-search"]') || {}).value || '';
      renderFees();
      break;
    case 'fee-filter-year':
      filterState.feeYear = (document.querySelector('[data-action="fee-filter-year"]') || {}).value || 'ALL';
      renderFees();
      break;
    case 'fee-filter-status':
      filterState.feeStatus = (document.querySelector('[data-action="fee-filter-status"]') || {}).value || 'ALL';
      renderFees();
      break;
    case 'fee-metric':
      filterState.feeStatus = ds.filterStatus || 'ALL';
      var fs = document.getElementById('feeStatus');
      if (fs) fs.value = filterState.feeStatus;
      renderFees();
      break;
    case 'fee-pay':
      fees.forEach(function (f) {
        if (f.no === ds.feeNo && (f.status === 'PENDING' || f.status === 'UPCOMING')) {
          f.status = 'PAID';
          f.paidDate = todayStr();
          var fp = getPatent(f.patentNo);
          if (fp) fp.feeStatus = 'PAID';
        }
      });
      renderFees();
      renderPatents();
      renderDetail(currentPatentNo);
      showToast('缴费登记成功');
      break;
    case 'fee-export':
      doExport('fees', '缴费清单');
      break;
    case 'pledge-filter-risk':
      filterState.pledgeRisk = (document.querySelector('[data-action="pledge-filter-risk"]') || {}).value || 'ALL';
      renderPledges();
      break;
    case 'pledge-metric':
      if (ds.filterKind === 'pledge') {
        if (ds.filterRisk) {
          filterState.pledgeRisk = filterState.pledgeRisk === ds.filterRisk ? 'ALL' : ds.filterRisk;
        } else {
          filterState.pledgeStatus = filterState.pledgeStatus === ds.filterStatus ? 'ALL' : (ds.filterStatus || 'ALL');
        }
        var pr = document.getElementById('pledgeRisk');
        if (pr) pr.value = filterState.pledgeRisk;
        renderPledges();
      } else {
        filterState.transferStatus = filterState.transferStatus === ds.filterStatus ? 'ALL' : (ds.filterStatus || 'ALL');
        renderTransfers();
      }
      break;
    case 'pledge-release':
      pledges.forEach(function (q) {
        if (q.no === ds.pledgeNo && q.status === 'ACTIVE') {
          q.status = 'RELEASED';
          var rp = getPatent(q.patentNo);
          if (rp) {
            rp.pledged = false;
            rp.status = 'ACTIVE';
          }
        }
      });
      renderPledges();
      renderPatents();
      renderDetail(currentPatentNo);
      showToast('质押已解除');
      break;
    case 'transfer-cancel':
      transfers.forEach(function (t) {
        if (t.no === ds.transferNo && (t.status === 'DRAFT' || t.status === 'REVIEWING')) {
          t.status = 'CANCELLED';
          var cp = getPatent(t.patentNo);
          if (cp && cp.status === 'TRANSFERRING') cp.status = 'ACTIVE';
        }
      });
      renderTransfers();
      renderPatents();
      renderDetail(currentPatentNo);
      showToast('转让请求已取消');
      break;
    case 'portfolio-filter-strategy':
      filterState.pfStrategy = (document.querySelector('[data-action="portfolio-filter-strategy"]') || {}).value || 'ALL';
      renderPortfolios();
      break;
    case 'portfolio-metric':
      filterState.pfStrategy = ds.filterStrategy || 'ALL';
      var ps = document.getElementById('portfolioStrategy');
      if (ps) ps.value = filterState.pfStrategy;
      renderPortfolios();
      break;
    case 'portfolio-view': {
      var pfo = null;
      portfolios.forEach(function (x) { if (x.no === ds.portfolioNo) pfo = x; });
      if (pfo) {
        var row = document.querySelector('tr[data-portfolio-no="' + pfo.no + '"]');
        var detailId = 'pf-detail-' + pfo.no;
        var existing = document.getElementById(detailId);
        if (existing) {
          existing.remove();
        } else if (row) {
          var members = patents.filter(function (p) { return p.industry === pfo.industry; }).slice(0, 5);
          var html = '<tr class="pf-detail" id="' + detailId + '"><td colspan="8">' +
            '<div class="pf-members"><strong>组合内专利（示例）：</strong>' +
            (members.length ? members.map(function (p) { return '<span class="pf-chip">' + esc(p.no) + ' ' + esc(p.title) + '</span>'; }).join('') : '暂无匹配专利') +
            '</div></td></tr>';
          row.insertAdjacentHTML('afterend', html);
        }
        showToast('组合「' + pfo.name + '」包含 ' + pfo.patentCount + ' 件专利');
      }
      break;
    }
    case 'dd-export':
      doExport('portfolio', '投融资尽调底稿');
      break;
    case 'portfolio-add-submit': {
      var poName = document.getElementById('po_name').value;
      var poStrategy = document.getElementById('po_strategy').value;
      var poIndustry = document.getElementById('po_industry').value;
      var poOwner = document.getElementById('po_owner').value;
      if (!poName || !poIndustry || !poOwner) {
        showToast('请完整填写组合信息');
        break;
      }
      portfolios.push({ no: 'PF-' + pad(portfolios.length + 1), name: poName, strategy: poStrategy, industry: poIndustry, patentCount: 0, totalValue: 0, owner: poOwner });
      closeModal(document.getElementById('portfolioModal'));
      renderPortfolios();
      showToast('组合已创建：' + poName);
      break;
    }
    case 'demand-filter-status':
      filterState.demandStatus = (document.querySelector('[data-action="demand-filter-status"]') || {}).value || 'ALL';
      renderDemands();
      break;
    case 'demand-metric':
      filterState.demandStatus = ds.filterStatus || 'ALL';
      var dsel = document.getElementById('demandStatus');
      if (dsel) dsel.value = filterState.demandStatus;
      renderDemands();
      break;
    case 'match-run': {
      var demand = null;
      demands.forEach(function (d) { if (d.no === ds.demandNo) demand = d; });
      if (demand) {
        var matched = patents.filter(function (p) {
          return !p.pledged && p.status !== 'EXPIRED' && p.status !== 'TRANSFERRED' &&
            (p.industry === demand.industry || p.title.indexOf(demand.keyword) >= 0);
        });
        var mr = document.getElementById('matchResult');
        if (mr) mr.textContent = demand.company + ' · 匹配到 ' + matched.length + ' 件候选专利：' + matched.slice(0, 3).map(function (p) { return p.no; }).join('、');
        showToast('智能匹配完成：' + matched.length + ' 件候选');
      }
      break;
    }
    case 'demand-add-submit': {
      var dmCompany = document.getElementById('dm_company').value;
      var dmIndustry = document.getElementById('dm_industry').value;
      var dmKeyword = document.getElementById('dm_keyword').value;
      var dmBudget = document.getElementById('dm_budget').value;
      var dmContact = document.getElementById('dm_contact').value;
      if (!dmCompany || !dmIndustry || !dmKeyword || !dmBudget) {
        showToast('请完整填写需求信息');
        break;
      }
      demands.push({ no: 'D-' + pad(demands.length + 1), company: dmCompany, industry: dmIndustry, keyword: dmKeyword, budget: Number(dmBudget), contact: dmContact, status: 'PUBLISHED' });
      closeModal(document.getElementById('demandModal'));
      renderDemands();
      showToast('需求已发布：' + dmCompany);
      break;
    }
    case 'cockpit-tab':
      filterState.cockpitDim = ds.cockpitDim || 'asset';
      renderCockpit();
      showToast('驾驶舱已切换到' + (filterState.cockpitDim === 'asset' ? '资产总览' : filterState.cockpitDim === 'risk' ? '风险预警' : '估值趋势'));
      break;
    case 'cockpit-view':
      currentPatentNo = ds.patentNo || currentPatentNo;
      renderDetail(currentPatentNo);
      route('P02');
      break;
    default:
      break;
  }
};

/* ===== select change 语义（骨架 input 通道已排除 SELECT） ===== */
document.addEventListener('change', function (e) {
  var t = e.target;
  if (!t || t.tagName !== 'SELECT') return;
  var host = t.closest ? t.closest('[data-action]') : null;
  if (host) dispatchDemoAction(host, e);
});

/* ===== 弹窗关闭增强：遮罩点击 + ESC ===== */
document.querySelectorAll('.modal').forEach(function (m) {
  var mask = m.querySelector('.modal-mask');
  if (mask) {
    mask.addEventListener('click', function (e) {
      if (e.target === mask) m.style.display = 'none';
    });
  }
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal').forEach(function (m) {
      if (m.style.display !== 'none') m.style.display = 'none';
    });
  }
});

/* ===== 打开弹窗前刷新选项 ===== */
document.addEventListener('click', function (e) {
  var t = e.target.closest ? e.target.closest('[data-open-modal]') : null;
  if (t) updateModalOptions();
});

/* ===== SPA hash 路由（多页面契约） ===== */
var ROUTES = {
  P01: 'P01', P02: 'P02', P03: 'P03', P04: 'P04',
  P05: 'P05', P06: 'P06', P07: 'P07', P08: 'P08'
};
function handleHash() {
  var pid = ROUTES[location.hash.replace('#', '')];
  if (pid) {
    if ((ROLE_PAGES[currentRole] || []).indexOf(pid) < 0) {
      route('P01');
    } else {
      route(pid);
    }
  }
}
window.addEventListener('hashchange', handleHash);

document.addEventListener('DOMContentLoaded', function () {
  updateRoleUI();
  renderAll();
  try { if (!location.hash) history.replaceState(null, '', '#P01'); } catch (err) { /* file:// 下个别浏览器限制，忽略 */ }
  route('P01');
});
