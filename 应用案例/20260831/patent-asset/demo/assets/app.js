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
   业务层（AI 增量追加）— 专利资产全生命周期数字化价值运营管理平台
   数据 / 渲染 / 业务动作；显隐一律由数据+筛选全量重算（v2.4 状态位契约），
   禁止读取 style.display 反推业务状态（R-11/P033）。
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Mock 数据（每实体 >= 10 条，覆盖正常/边界/异常态） ---------- */
  var PATENTS = [
    { no: 'ZL202118990011', title: '基于联邦学习的医疗影像脱敏方法', type: '发明专利', field: '人工智能', owner: '深睿医疗', apply: '2021-08-13', grant: '2023-04-21', expiry: '2041-08-13', due: '2026-09-12', fee: 9000, value: 920, grade: 'B', status: '年费预警', pledge: '未质押' },
    { no: 'ZL202233445566', title: '星载激光通信快速捕获转台', type: '发明专利', field: '数字通信', owner: '长光卫星', apply: '2022-05-09', grant: '2023-11-17', expiry: '2042-05-09', due: '2026-09-25', fee: 12000, value: 1680, grade: 'A', status: '年费预警', pledge: '未质押' },
    { no: 'ZL202310566789', title: '磁悬浮轴承主动减振控制结构', type: '发明专利', field: '高端制造', owner: '汇川智造', apply: '2023-02-14', grant: '2024-09-06', expiry: '2043-02-14', due: '2026-11-30', fee: 9000, value: 1860, grade: 'A', status: '有效', pledge: '未质押' },
    { no: 'ZL202211233445', title: '钙钛矿-晶硅叠层光伏组件封装工艺', type: '发明专利', field: '新能源', owner: '协鑫光电', apply: '2022-03-22', grant: '2023-10-11', expiry: '2042-03-22', due: '2027-01-15', fee: 9000, value: 2480, grade: 'A', status: '有效', pledge: '质押中' },
    { no: 'ZL202412003456', title: '固态电解质膜片连续涂布装置', type: '发明专利', field: '新材料', owner: '清陶能源', apply: '2024-01-18', grant: '2025-06-27', expiry: '2044-01-18', due: '2027-02-20', fee: 9000, value: 1150, grade: 'B', status: '有效', pledge: '质押中' },
    { no: 'ZL202345678901', title: '面向客服质检的方言语音识别模型', type: '发明专利', field: '人工智能', owner: '科大讯飞', apply: '2023-06-30', grant: '2024-12-04', expiry: '2043-06-30', due: '2026-12-10', fee: 10000, value: 1050, grade: 'B', status: '有效', pledge: '未质押' },
    { no: 'ZL202056784567', title: '骨科手术导航定位夹持器', type: '发明专利', field: '生物医药', owner: '威高骨科', apply: '2020-07-15', grant: '2022-03-08', expiry: '2040-07-15', due: '2026-09-05', fee: 9000, value: 470, grade: 'C', status: '年费预警', pledge: '质押中' },
    { no: 'ZL202020998877', title: '便携式血糖仪多光谱检测探头', type: '实用新型', field: '生物医药', owner: '三诺生物', apply: '2020-10-26', grant: '2021-05-19', expiry: '2030-10-26', due: '2027-03-08', fee: 6000, value: 380, grade: 'C', status: '有效', pledge: '未质押' },
    { no: 'ZL202156781234', title: '动力电池包液冷板流道结构', type: '实用新型', field: '新能源', owner: '宁德时代', apply: '2021-04-08', grant: '2021-12-01', expiry: '2031-04-08', due: '2027-01-28', fee: 6000, value: 640, grade: 'C', status: '有效', pledge: '质押中' },
    { no: 'ZL202466778899', title: '5G小基站射频前端模组封装结构', type: '实用新型', field: '数字通信', owner: '烽火通信', apply: '2024-05-11', grant: '2024-11-26', expiry: '2034-05-11', due: '2027-02-14', fee: 6000, value: 520, grade: 'C', status: '有效', pledge: '未质押' },
    { no: 'ZL201922011455', title: '低温甲醇洗工艺尾气回收系统', type: '实用新型', field: '新能源', owner: '中石化宁波院', apply: '2019-09-03', grant: '2020-04-10', expiry: '2029-09-03', due: '2026-06-30', fee: 4000, value: 60, grade: 'D', status: '失效', pledge: '未质押' },
    { no: 'ZL201877665544', title: '纸基超疏水涂层配方及制备', type: '发明专利', field: '新材料', owner: '丰域新材', apply: '2018-11-29', grant: '2020-02-14', expiry: '2038-11-29', due: '2026-05-20', fee: 9000, value: 40, grade: 'D', status: '失效', pledge: '未质押' }
  ];

  var VALUATIONS = [
    { no: 'V-2026Q3-001', patent: 'ZL202118990011', quarter: '2026-Q3', legal: 84, tech: 90, market: 78, revenue: 82, total: 84, value: 950, status: '待确认' },
    { no: 'V-2026Q3-002', patent: 'ZL202233445566', quarter: '2026-Q3', legal: 88, tech: 86, market: 82, revenue: 80, total: 85, value: 1720, status: '待确认' },
    { no: 'V-2026Q3-003', patent: 'ZL202310566789', quarter: '2026-Q3', legal: 88, tech: 93, market: 80, revenue: 85, total: 87, value: 1900, status: '待确认' },
    { no: 'V-2026Q3-004', patent: 'ZL202211233445', quarter: '2026-Q3', legal: 85, tech: 92, market: 84, revenue: 82, total: 86, value: 2550, status: '待确认' },
    { no: 'V-2026Q2-001', patent: 'ZL202310566789', quarter: '2026-Q2', legal: 88, tech: 92, market: 80, revenue: 84, total: 87, value: 1860, status: '已确认', by: '林岚', at: '2026-07-05' },
    { no: 'V-2026Q2-002', patent: 'ZL202211233445', quarter: '2026-Q2', legal: 84, tech: 91, market: 82, revenue: 81, total: 85, value: 2480, status: '已确认', by: '林岚', at: '2026-07-05' },
    { no: 'V-2026Q2-003', patent: 'ZL202412003456', quarter: '2026-Q2', legal: 82, tech: 84, market: 76, revenue: 80, total: 81, value: 1150, status: '已确认', by: '林岚', at: '2026-07-06' },
    { no: 'V-2026Q2-004', patent: 'ZL202020998877', quarter: '2026-Q2', legal: 70, tech: 62, market: 58, revenue: 66, total: 64, value: 380, status: '已确认', by: '林岚', at: '2026-07-06' },
    { no: 'V-2026Q2-005', patent: 'ZL201922011455', quarter: '2026-Q2', legal: 45, tech: 40, market: 32, revenue: 36, total: 39, value: 60, status: '已确认', by: '林岚', at: '2026-07-07' },
    { no: 'V-2026Q2-006', patent: 'ZL202345678901', quarter: '2026-Q2', legal: 80, tech: 82, market: 72, revenue: 78, total: 79, value: 1050, status: '已确认', by: '周衡', at: '2026-07-08' },
    { no: 'V-2026Q2-007', patent: 'ZL202156781234', quarter: '2026-Q2', legal: 72, tech: 70, market: 64, revenue: 70, total: 69, value: 640, status: '已确认', by: '周衡', at: '2026-07-08' },
    { no: 'V-2026Q2-008', patent: 'ZL202056784567', quarter: '2026-Q2', legal: 68, tech: 66, market: 60, revenue: 70, total: 66, value: 470, status: '已确认', by: '周衡', at: '2026-07-09' },
    { no: 'V-2026Q1-001', patent: 'ZL202118990011', quarter: '2026-Q1', legal: 82, tech: 88, market: 76, revenue: 80, total: 82, value: 920, status: '已确认', by: '林岚', at: '2026-04-10' },
    { no: 'V-2026Q1-002', patent: 'ZL202233445566', quarter: '2026-Q1', legal: 86, tech: 84, market: 80, revenue: 78, total: 83, value: 1680, status: '已确认', by: '林岚', at: '2026-04-10' }
  ];

  var FEES = [
    { patent: 'ZL202118990011', year: 2026, due: '2026-09-12', amount: 9000, status: '预警' },
    { patent: 'ZL202233445566', year: 2026, due: '2026-09-25', amount: 12000, status: '预警' },
    { patent: 'ZL202056784567', year: 2026, due: '2026-09-05', amount: 9000, status: '预警' },
    { patent: 'ZL201922011455', year: 2026, due: '2026-06-30', amount: 4000, status: '逾期' },
    { patent: 'ZL201877665544', year: 2026, due: '2026-05-20', amount: 9000, status: '逾期' },
    { patent: 'ZL202310566789', year: 2026, due: '2026-11-30', amount: 9000, status: '已缴', paidAt: '2026-07-02' },
    { patent: 'ZL202345678901', year: 2026, due: '2026-12-10', amount: 10000, status: '已缴', paidAt: '2026-07-15' },
    { patent: 'ZL202156781234', year: 2026, due: '2027-01-28', amount: 6000, status: '已缴', paidAt: '2026-06-20' },
    { patent: 'ZL202466778899', year: 2026, due: '2027-02-14', amount: 6000, status: '已缴', paidAt: '2026-06-28' },
    { patent: 'ZL202211233445', year: 2026, due: '2027-01-15', amount: 9000, status: '待缴' },
    { patent: 'ZL202412003456', year: 2026, due: '2027-02-20', amount: 9000, status: '待缴' },
    { patent: 'ZL202020998877', year: 2026, due: '2027-03-08', amount: 6000, status: '待缴' },
    { patent: 'ZL202118990011', year: 2025, due: '2025-09-12', amount: 9000, status: '已缴', paidAt: '2025-08-30' },
    { patent: 'ZL202233445566', year: 2025, due: '2025-09-25', amount: 12000, status: '已缴', paidAt: '2025-09-01' }
  ];

  var PLEDGES = [
    { no: 'DB2026-001', patent: 'ZL202211233445', type: '质押登记', party: '江苏银行苏州分行', amount: 1200, start: '2026-02-10', status: '生效中' },
    { no: 'DB2026-002', patent: 'ZL202412003456', type: '质押登记', party: '中国银行常州分行', amount: 800, start: '2026-03-15', status: '生效中' },
    { no: 'DB2026-003', patent: 'ZL202156781234', type: '质押登记', party: '工商银行福建分行', amount: 500, start: '2026-01-20', status: '生效中' },
    { no: 'DB2026-009', patent: 'ZL202056784567', type: '质押登记', party: '招商银行威海分行', amount: 350, start: '2026-06-05', status: '生效中' },
    { no: 'DB2026-005', patent: 'ZL202466778899', type: '质押登记', party: '交通银行武汉分行', amount: 400, start: '2026-07-01', status: '审批中' },
    { no: 'DB2026-006', patent: 'ZL202020998877', type: '专利转让', party: '康泰医学', amount: 350, start: '2026-07-10', status: '审批中' },
    { no: 'DB2025-018', patent: 'ZL202118990011', type: '质押登记', party: '建设银行深圳分行', amount: 600, start: '2025-08-15', status: '已解除' },
    { no: 'DB2025-021', patent: 'ZL202233445566', type: '质押登记', party: '国家开发银行', amount: 900, start: '2025-09-01', status: '已解除' },
    { no: 'DB2026-008', patent: 'ZL202345678901', type: '专利转让', party: '云知声', amount: 980, start: '2026-05-20', status: '已完成' },
    { no: 'DB2026-007', patent: 'ZL202310566789', type: '专利转让', party: '三花智控', amount: 2000, start: '2026-04-12', status: '已驳回' },
    { no: 'DB2026-004', patent: 'ZL201922011455', type: '专利转让', party: '竹贝壳科技', amount: 55, start: '2026-03-01', status: '已完成' }
  ];

  var DEALS = [
    { no: 'YX2026-001', patent: 'ZL202211233445', buyer: '中广核新能源', industry: '新能源', type: '转让', budget: 3000, status: '初步接触', owner: '林岚' },
    { no: 'YX2026-002', patent: 'ZL202310566789', buyer: '美的工业技术', industry: '高端制造', type: '许可', budget: 800, status: '尽调中', owner: '林岚' },
    { no: 'YX2026-003', patent: 'ZL202345678901', buyer: '云知声', industry: '人工智能', type: '转让', budget: 1100, status: '尽调中', owner: '周衡' },
    { no: 'YX2026-012', patent: 'ZL202310566789', buyer: '格力电器', industry: '高端制造', type: '许可', budget: 120, status: '尽调中', owner: '周衡' },
    { no: 'YX2026-009', patent: 'ZL202156781234', buyer: '中创新航', industry: '新能源', type: '质押融资', budget: 700, status: '尽调中', owner: '林岚' },
    { no: 'YX2026-004', patent: 'ZL202056784567', buyer: '鱼跃医疗', industry: '生物医药', type: '质押融资', budget: 400, status: '签署意向', owner: '林岚' },
    { no: 'YX2026-007', patent: 'ZL202233445566', buyer: '海格通信', industry: '数字通信', type: '转让', budget: 1750, status: '签署意向', owner: '周衡' },
    { no: 'YX2026-005', patent: 'ZL202412003456', buyer: '天目先导', industry: '新材料', type: '转让', budget: 1250, status: '成交', owner: '林岚' },
    { no: 'YX2026-006', patent: 'ZL202466778899', buyer: '锐捷网络', industry: '数字通信', type: '许可', budget: 600, status: '成交', owner: '周衡' },
    { no: 'YX2026-011', patent: 'ZL202345678901', buyer: '思必驰', industry: '人工智能', type: '许可', budget: 950, status: '成交', owner: '林岚' },
    { no: 'YX2026-008', patent: 'ZL202118990011', buyer: '联影智能', industry: '生物医药', type: '许可', budget: 300, status: '初步接触', owner: '周衡' },
    { no: 'YX2026-010', patent: 'ZL202020998877', buyer: '乐普医疗', industry: '生物医药', type: '转让', budget: 50, status: '搁置', owner: '周衡' }
  ];

  var TRACES = [
    { no: 'DD-2026-015', scope: 'A 级 + 质押相关', count: 6, by: '林岚', at: '2026-08-12 14:20' },
    { no: 'DD-2026-014', scope: '全部在管资产', count: 10, by: '林岚', at: '2026-07-30 09:45' },
    { no: 'DD-2026-013', scope: '质押相关资产', count: 4, by: '周衡', at: '2026-07-08 16:02' }
  ];

  var QUADRANTS = {
    core: { name: '核心防御', sub: '（A 级）', match: function (p) { return p.grade === 'A'; } },
    grow: { name: '增值运营', sub: '（B 级）', match: function (p) { return p.grade === 'B'; } },
    sell: { name: '盘点出售', sub: '（C 级）', match: function (p) { return p.grade === 'C'; } },
    retire: { name: '放弃退役', sub: '（D 级）', match: function (p) { return p.grade === 'D'; } }
  };

  var ROLE_VIS = {
    'executive': ['P01', 'P02', 'P03', 'P04', 'P05', 'P06'],
    'asset-manager': ['P02', 'P03', 'P04', 'P05', 'P06'],
    'ipr': ['P02', 'P03', 'P05', 'P06'],
    'bank-risk': ['P02', 'P03', 'P06']
  };
  var ROLE_LABEL = { 'executive': 'C 级', 'asset-manager': 'B 级', 'ipr': 'A 级', 'bank-risk': 'B 级' };
  var ROLE_NAME = { 'executive': '高管（C级）', 'asset-manager': '资产经理（B级）', 'ipr': '企业IPR（A级）', 'bank-risk': '银行风控（B级）' };
  var DEAL_FLOW = ['初步接触', '尽调中', '签署意向', '成交'];

  /* ---------- 工具 ---------- */
  function $(id) { return document.getElementById(id); }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function patByNo(no) { for (var i = 0; i < PATENTS.length; i++) if (PATENTS[i].no === no) return PATENTS[i]; return null; }
  function gradeCls(g) { return 'g-' + String(g || '').charAt(0).toLowerCase(); }
  var PILL = { '有效': 'ok', '年费预警': 'warn', '失效': 'danger', '待确认': 'warn', '已确认': 'ok', '审批中': 'info', '生效中': 'gold', '已解除': 'ok', '已完成': 'ok', '已驳回': 'danger', '初步接触': 'info', '尽调中': 'plain', '签署意向': 'gold', '成交': 'ok', '搁置': 'danger', '已缴': 'ok', '待缴': 'info', '预警': 'warn', '逾期': 'danger' };
  function pill(s) { return '<span class="pill ' + (PILL[s] || 'plain') + '">' + esc(s) + '</span>'; }

  var toastTimer = null;
  function toast(msg, warn) {
    var t = $('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = warn ? 'warn show' : 'show';
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = ''; }, 2600);
  }

  function refreshAnnotation() {
    var eng = window.__ANNOTATION_ENGINE__;
    if (eng && typeof eng.refresh === 'function') { try { eng.refresh(); } catch (e) { /* 引擎刷新失败不阻塞业务 */ } }
  }

  /* ---------- 渲染：专利台账（筛选 + 统计全量重算，唯一路径） ---------- */
  function patentMatch(p) {
    var q = ($('patSearch') && $('patSearch').value || '').trim().toLowerCase();
    var st = $('patStatus') ? $('patStatus').value : '';
    var fd = $('patField') ? $('patField').value : '';
    if (q && (p.no + ' ' + p.title + ' ' + p.owner + ' ' + p.type).toLowerCase().indexOf(q) < 0) return false;
    if (st && p.status !== st) return false;
    if (fd && p.field !== fd) return false;
    return true;
  }

  function renderPatents() {
    var tbody = $('patentRows');
    if (!tbody) return;
    var html = '';
    var vis = 0, warn = 0, expired = 0, pledged = 0;
    for (var i = 0; i < PATENTS.length; i++) {
      var p = PATENTS[i];
      if (!patentMatch(p)) continue;
      vis++;
      if (p.status === '年费预警') warn++;
      if (p.status === '失效') expired++;
      if (p.pledge === '质押中') pledged++;
      var annoDetail = vis === 1 ? ' data-element-id="P02-L3-005"' : '';
      var annoPay = vis === 1 ? ' data-element-id="P02-L3-006"' : '';
      html += '<tr data-no="' + p.no + '" data-status="' + p.status + '" data-field="' + p.field + '" data-search="' + esc((p.no + ' ' + p.title + ' ' + p.owner + ' ' + p.type).toLowerCase()) + '">'
        + '<td class="mono">' + p.no + '</td>'
        + '<td class="t-title">' + esc(p.title) + '<span class="cell-sub">' + esc(p.owner) + ' · ' + esc(p.type) + '</span></td>'
        + '<td>' + esc(p.field) + '</td>'
        + '<td class="mono">' + p.due + '</td>'
        + '<td class="mono num">' + fmt(p.value) + '</td>'
        + '<td><span class="grade ' + gradeCls(p.grade) + '" title="估值等级 ' + p.grade + '">' + p.grade.charAt(0) + '</span></td>'
        + '<td>' + pill(p.status) + (p.pledge === '质押中' ? ' <span class="pill plain">质押中</span>' : '') + '</td>'
        + '<td class="ops"><button type="button" class="mini-btn" data-open-modal="modalPatentDetail" data-action="viewPatent" data-fill="patentDetail" data-no="' + p.no + '"' + annoDetail + '>详情</button>'
        + '<button type="button" class="mini-btn solid" data-open-modal="modalPayFee" data-action="payFee" data-fill="payFee" data-no="' + p.no + '"' + annoPay + '>缴费</button></td></tr>';
    }
    if (vis === 0) html = '<tr class="empty-row"><td colspan="8">无匹配记录，请调整筛选条件</td></tr>';
    tbody.innerHTML = html;
    $('stTotal').textContent = vis;
    $('stWarn').textContent = warn;
    $('stExpired').textContent = expired;
    $('stPledged').textContent = pledged;
    $('patCountTag').textContent = '共 ' + vis + ' 件';
    refreshAnnotation();
  }

  /* ---------- 渲染：估值中心 ---------- */
  function valMatch(v) {
    var q = ($('valSearch') && $('valSearch').value || '').trim().toLowerCase();
    var qd = $('valQuarter') ? $('valQuarter').value : '';
    var st = $('valStatus') ? $('valStatus').value : '';
    var p = patByNo(v.patent);
    if (qd && v.quarter !== qd) return false;
    if (st && v.status !== st) return false;
    if (q && (v.no + ' ' + v.patent + ' ' + (p ? p.title : '')).toLowerCase().indexOf(q) < 0) return false;
    return true;
  }

  function renderValuations() {
    var tbody = $('valuationRows');
    if (!tbody) return;
    var html = '', vis = 0, pending = 0, confirmed = 0;
    for (var i = 0; i < VALUATIONS.length; i++) {
      var v = VALUATIONS[i];
      if (!valMatch(v)) continue;
      vis++;
      if (v.status === '待确认') pending++; else confirmed++;
      var p = patByNo(v.patent);
      var annoModel = vis === 1 ? ' data-element-id="P03-L3-005"' : '';
      var annoConfirm = vis === 1 ? ' data-element-id="P03-L3-006"' : '';
      var confirmBtn = v.status === '待确认'
        ? '<button type="button" class="mini-btn solid" data-action="confirmValuation" data-no="' + v.no + '"' + annoConfirm + '>确认</button>'
        : '<button type="button" class="mini-btn solid" data-action="confirmValuation" data-no="' + v.no + '">确认</button>';
      html += '<tr data-no="' + v.no + '" data-quarter="' + v.quarter + '" data-status="' + v.status + '" data-search="' + esc((v.no + ' ' + v.patent + ' ' + (p ? p.title : '')).toLowerCase()) + '">'
        + '<td class="mono">' + v.no + '</td>'
        + '<td class="t-title">' + esc(p ? p.title : v.patent) + '<span class="cell-sub mono">' + v.patent + '</span></td>'
        + '<td class="mono">' + v.quarter + '</td>'
        + '<td class="mono num">' + v.legal + '</td><td class="mono num">' + v.tech + '</td><td class="mono num">' + v.market + '</td><td class="mono num">' + v.revenue + '</td>'
        + '<td class="mono num">' + v.total + '</td>'
        + '<td class="mono num">' + fmt(v.value) + '</td>'
        + '<td>' + pill(v.status) + '</td>'
        + '<td class="ops"><button type="button" class="mini-btn" data-open-modal="modalModel" data-action="viewModel" data-fill="model" data-no="' + v.no + '"' + annoModel + '>模型</button>' + confirmBtn + '</td></tr>';
    }
    if (vis === 0) html = '<tr class="empty-row"><td colspan="11">无匹配估值记录，请调整筛选条件</td></tr>';
    tbody.innerHTML = html;
    $('stValPending').textContent = pending;
    $('stValConfirmed').textContent = confirmed;
    $('valCountTag').textContent = '共 ' + vis + ' 笔';
    var sidePending = $('sidePending');
    if (sidePending) sidePending.textContent = countPendingAll();
    refreshAnnotation();
  }

  function countPendingAll() {
    var n = 0;
    for (var i = 0; i < VALUATIONS.length; i++) if (VALUATIONS[i].status === '待确认') n++;
    return n;
  }

  /* ---------- 渲染：风险预警（P01） ---------- */
  function renderRisk() {
    var tbody = $('riskRows');
    if (!tbody) return;
    var html = '', vis = 0;
    for (var i = 0; i < PATENTS.length; i++) {
      var p = PATENTS[i];
      if (p.status !== '年费预警' && p.status !== '失效') continue;
      vis++;
      var annoView = vis === 1 ? ' data-element-id="P01-L3-005"' : '';
      html += '<tr data-no="' + p.no + '"><td class="mono">' + p.no + '</td>'
        + '<td class="t-title">' + esc(p.title) + '</td>'
        + '<td>' + (p.status === '失效' ? pill('失效') : pill('年费预警')) + (p.pledge === '质押中' ? ' <span class="pill plain">质押中</span>' : '') + '</td>'
        + '<td class="mono">' + p.due + '</td>'
        + '<td class="mono num">' + fmt(p.value) + '</td>'
        + '<td class="ops"><button type="button" class="mini-btn" data-action="locatePatent" data-no="' + p.no + '"' + annoView + '>查看</button></td></tr>';
    }
    if (vis === 0) html = '<tr class="empty-row"><td colspan="6">当前无风险资产</td></tr>';
    tbody.innerHTML = html;
    refreshAnnotation();
  }

  /* ---------- 渲染：KPI（驾驶舱汇总） ---------- */
  function renderKpi() {
    var assets = 0, value = 0, risk = 0;
    for (var i = 0; i < PATENTS.length; i++) {
      var p = PATENTS[i];
      value += p.value;
      if (p.status !== '失效') assets++;
      if (p.status === '年费预警' || p.status === '失效') risk++;
    }
    var deal = 0;
    for (var j = 0; j < DEALS.length; j++) if (DEALS[j].status === '成交') deal += DEALS[j].budget;
    $('kpiAssets').textContent = assets;
    $('kpiValue').textContent = fmt(value);
    $('kpiRisk').textContent = risk;
    $('kpiDeal').textContent = fmt(deal);
  }

  /* ---------- 渲染：撮合意向 ---------- */
  function dealMatch(d) {
    var q = ($('dealSearch') && $('dealSearch').value || '').trim().toLowerCase();
    var tp = $('dealType') ? $('dealType').value : '';
    var st = $('dealStatus') ? $('dealStatus').value : '';
    var p = patByNo(d.patent);
    if (tp && d.type !== tp) return false;
    if (st && d.status !== st) return false;
    if (q && (d.no + ' ' + d.patent + ' ' + d.buyer + ' ' + (p ? p.title : '')).toLowerCase().indexOf(q) < 0) return false;
    return true;
  }

  function renderDeals() {
    var tbody = $('dealRows');
    if (!tbody) return;
    var html = '', vis = 0, dd = 0, done = 0, amount = 0;
    for (var i = 0; i < DEALS.length; i++) {
      var d = DEALS[i];
      if (!dealMatch(d)) continue;
      vis++;
      if (d.status === '尽调中') dd++;
      if (d.status === '成交') { done++; amount += d.budget; }
      var p = patByNo(d.patent);
      var terminal = (d.status === '成交' || d.status === '搁置');
      var annoAdv = vis === 1 ? ' data-element-id="P05-L3-005"' : '';
      var annoView = vis === 1 ? ' data-element-id="P05-L3-006"' : '';
      var advBtn = terminal
        ? '<button type="button" class="mini-btn solid" data-action="advanceDeal" data-no="' + d.no + '">推进</button>'
        : '<button type="button" class="mini-btn solid" data-action="advanceDeal" data-no="' + d.no + '"' + annoAdv + '>推进</button>';
      html += '<tr data-no="' + d.no + '" data-type="' + d.type + '" data-status="' + d.status + '" data-search="' + esc((d.no + ' ' + d.patent + ' ' + d.buyer + ' ' + (p ? p.title : '')).toLowerCase()) + '">'
        + '<td class="mono">' + d.no + '</td>'
        + '<td class="t-title">' + esc(p ? p.title : d.patent) + '<span class="cell-sub mono">' + d.patent + '</span></td>'
        + '<td>' + esc(d.buyer) + '</td><td>' + esc(d.industry) + '</td><td>' + esc(d.type) + '</td>'
        + '<td class="mono num">' + fmt(d.budget) + '</td>'
        + '<td>' + pill(d.status) + '</td><td>' + esc(d.owner) + '</td>'
        + '<td class="ops">' + advBtn + '<button type="button" class="mini-btn" data-open-modal="modalDealDetail" data-action="viewDeal" data-fill="dealDetail" data-no="' + d.no + '"' + annoView + '>查看</button></td></tr>';
    }
    if (vis === 0) html = '<tr class="empty-row"><td colspan="9">无匹配撮合意向，请调整筛选条件</td></tr>';
    tbody.innerHTML = html;
    $('stDealTotal').textContent = vis;
    $('stDealDD').textContent = dd;
    $('stDealDone').textContent = done;
    $('stDealAmount').textContent = fmt(amount);
    $('dealCountTag').textContent = '共 ' + vis + ' 笔';
    refreshAnnotation();
  }

  /* ---------- 渲染：质押/转让 ---------- */
  function pledgeMatch(r) {
    var q = ($('plSearch') && $('plSearch').value || '').trim().toLowerCase();
    var tp = $('plType') ? $('plType').value : '';
    var st = $('plStatus') ? $('plStatus').value : '';
    var p = patByNo(r.patent);
    if (tp && r.type !== tp) return false;
    if (st && r.status !== st) return false;
    if (q && (r.no + ' ' + r.patent + ' ' + r.party + ' ' + (p ? p.title : '')).toLowerCase().indexOf(q) < 0) return false;
    return true;
  }

  function renderPledges() {
    var tbody = $('pledgeRows');
    if (!tbody) return;
    var html = '', vis = 0;
    for (var i = 0; i < PLEDGES.length; i++) {
      var r = PLEDGES[i];
      if (!pledgeMatch(r)) continue;
      vis++;
      var p = patByNo(r.patent);
      var releasable = (r.type === '质押登记' && r.status === '生效中');
      var annoRel = vis === 1 ? ' data-element-id="P06-L3-005"' : '';
      var annoView = vis === 1 ? ' data-element-id="P06-L3-006"' : '';
      var relBtn = '<button type="button" class="mini-btn" data-open-modal="modalRelease" data-action="releasePledge" data-fill="release" data-no="' + r.no + '"' + annoRel + '>解除质押</button>';
      html += '<tr data-no="' + r.no + '" data-type="' + r.type + '" data-status="' + r.status + '" data-search="' + esc((r.no + ' ' + r.patent + ' ' + r.party + ' ' + (p ? p.title : '')).toLowerCase()) + '">'
        + '<td class="mono">' + r.no + '</td>'
        + '<td class="t-title">' + esc(p ? p.title : r.patent) + '<span class="cell-sub mono">' + r.patent + '</span></td>'
        + '<td>' + esc(r.type) + '</td><td>' + esc(r.party) + '</td>'
        + '<td class="mono num">' + fmt(r.amount) + '</td><td class="mono">' + r.start + '</td>'
        + '<td>' + pill(r.status) + '</td>'
        + '<td class="ops">' + relBtn + '<button type="button" class="mini-btn" data-open-modal="modalPledgeDetail" data-action="viewPledge" data-fill="pledgeDetail" data-no="' + r.no + '"' + annoView + '>查看</button></td></tr>';
    }
    if (vis === 0) html = '<tr class="empty-row"><td colspan="8">无匹配业务记录，请调整筛选条件</td></tr>';
    tbody.innerHTML = html;
    var active = 0, amount = 0, pats = {};
    for (var j = 0; j < PLEDGES.length; j++) {
      var r2 = PLEDGES[j];
      if (r2.type === '质押登记' && r2.status === '生效中') { active++; amount += r2.amount; pats[r2.patent] = 1; }
    }
    $('plActiveCount').textContent = active;
    $('plActiveAmount').textContent = fmt(amount);
    $('plPatents').textContent = Object.keys(pats).length;
    $('plCountTag').textContent = '共 ' + vis + ' 笔';
    var sidePledge = $('sidePledge');
    if (sidePledge) sidePledge.textContent = active;
    refreshAnnotation();
  }

  /* ---------- 渲染：尽调留痕 ---------- */
  function renderTraces() {
    var tbody = $('traceRows');
    if (!tbody) return;
    var html = '';
    for (var i = 0; i < TRACES.length; i++) {
      var t = TRACES[i];
      html += '<tr><td class="mono">' + t.no + '</td><td>' + esc(t.scope) + '</td><td class="num">' + t.count + '</td><td>' + esc(t.by) + '</td><td class="mono">' + t.at + '</td></tr>';
    }
    tbody.innerHTML = html;
  }

  /* ---------- 角色：驾驶舱仅对 C 级角色开放 ---------- */
  function applyRole(role) {
    var vis = ROLE_VIS[role] || ROLE_VIS.executive;
    document.querySelectorAll('.side-nav [data-nav]').forEach(function (a) {
      var on = vis.indexOf(a.getAttribute('data-nav')) >= 0;
      a.style.display = on ? '' : 'none';
    });
    var badge = $('roleBadge');
    if (badge) badge.textContent = ROLE_LABEL[role] || 'C 级';
    var cur = null;
    document.querySelectorAll('[data-page-id]:not([hidden])').forEach(function (p) { cur = p.getAttribute('data-page-id'); });
    if (cur && vis.indexOf(cur) < 0) route(vis[0]);
    return vis;
  }

  /* ---------- 弹窗内容填充（data-fill 委托） ---------- */
  var FILL = {
    patentDetail: function (no) {
      var p = patByNo(no);
      if (!p) return;
      var feeHtml = '';
      for (var i = 0; i < FEES.length; i++) {
        var f = FEES[i];
        if (f.patent !== no) continue;
        feeHtml += '<tr><td class="mono">' + f.year + '</td><td class="mono">' + f.due + '</td><td class="mono num">' + fmt(f.amount) + '</td><td>' + pill(f.status) + '</td></tr>';
      }
      $('patentDetailBody').innerHTML =
        '<table class="kv"><tbody>'
        + '<tr><th>专利号</th><td class="mono">' + p.no + '</td></tr>'
        + '<tr><th>专利名称</th><td>' + esc(p.title) + '</td></tr>'
        + '<tr><th>专利类型 / 领域</th><td>' + esc(p.type) + ' · ' + esc(p.field) + '</td></tr>'
        + '<tr><th>专利权人</th><td>' + esc(p.owner) + '</td></tr>'
        + '<tr><th>申请 / 授权 / 届满</th><td class="mono">' + p.apply + ' / ' + p.grant + ' / ' + p.expiry + '</td></tr>'
        + '<tr><th>年费截止日 / 金额</th><td class="mono">' + p.due + ' / ' + fmt(p.fee) + ' 元</td></tr>'
        + '<tr><th>当前估值</th><td class="mono">' + fmt(p.value) + ' 万元 · ' + p.grade + ' 级</td></tr>'
        + '<tr><th>资产状态 / 质押</th><td>' + pill(p.status) + ' ' + pill(p.pledge) + '</td></tr>'
        + '</tbody></table>'
        + '<div class="ql-title" style="margin-top:14px">年费缴纳记录</div>'
        + '<table class="grid"><thead><tr><th>年度</th><th>缴费截止日</th><th>金额(元)</th><th>状态</th></tr></thead><tbody>' + feeHtml + '</tbody></table>';
    },
    payFee: function (no) {
      var p = patByNo(no);
      if (!p) return;
      $('payFeeBody').innerHTML =
        '<table class="kv"><tbody>'
        + '<tr><th>专利号</th><td class="mono">' + p.no + '</td></tr>'
        + '<tr><th>专利名称</th><td>' + esc(p.title) + '</td></tr>'
        + '<tr><th>年费金额</th><td class="mono">' + fmt(p.fee) + ' 元</td></tr>'
        + '<tr><th>缴费截止日</th><td class="mono">' + p.due + '</td></tr>'
        + '<tr><th>当前状态</th><td>' + pill(p.status) + '</td></tr>'
        + '</tbody></table>'
        + '<p style="margin-top:10px;font-size:12px;color:var(--ink-soft)">确认后年费记录置为「已缴」，资产状态由「年费预警」恢复为「有效」。</p>';
      var err = $('payErr');
      if (err) err.className = 'form-err';
      var btn = $('payConfirmBtn');
      if (btn) btn.setAttribute('data-no', p.no);
    },
    model: function (no) {
      var v = null;
      for (var i = 0; i < VALUATIONS.length; i++) if (VALUATIONS[i].no === no) v = VALUATIONS[i];
      if (!v) return;
      var p = patByNo(v.patent);
      function row(name, s) {
        return '<div class="score-row"><span class="sr-name">' + name + '</span><div class="sr-track"><div class="sr-fill" style="width:' + s + '%"></div></div><span class="sr-num num">' + s + '</span></div>';
      }
      $('modelBody').innerHTML =
        '<div class="ql-title">' + esc(p ? p.title : v.patent) + ' · 估值期 <span class="mono">' + v.quarter + '</span> · ' + pill(v.status) + '</div>'
        + row('法律维度', v.legal) + row('技术维度', v.tech) + row('市场维度', v.market) + row('营收维度', v.revenue)
        + '<p style="margin-top:10px;font-size:12px;color:var(--ink-soft)">综合 = 法律×0.3 + 技术×0.3 + 市场×0.2 + 营收×0.2 = <b class="mono">' + v.total + '</b> 分，对应估值 <b class="mono">' + fmt(v.value) + '</b> 万元。</p>'
        + '<p style="margin-top:6px;font-size:12px;color:var(--ink-soft)">' + (v.status === '待确认' ? '该估值为本季度新生成结果，需资产经理确认后生效。' : '已由 ' + esc(v.by || '资产经理') + ' 于 ' + esc(v.at || '') + ' 确认生效。') + '</p>';
    },
    trace: function () {
      var t = TRACES[0];
      if (!t) { $('traceBody').innerHTML = '<p>暂无导出留痕</p>'; return; }
      $('traceBody').innerHTML =
        '<table class="kv"><tbody>'
        + '<tr><th>留痕编号</th><td class="mono">' + t.no + '</td></tr>'
        + '<tr><th>导出范围</th><td>' + esc(t.scope) + '</td></tr>'
        + '<tr><th>资产份数</th><td class="mono">' + t.count + ' 份</td></tr>'
        + '<tr><th>操作人</th><td>' + esc(t.by) + '</td></tr>'
        + '<tr><th>导出时间</th><td class="mono">' + t.at + '</td></tr>'
        + '</tbody></table>'
        + '<p style="margin-top:10px;font-size:12px;color:var(--ink-soft)">尽调包含：专利法律状态底稿、四维估值报告、年费缴纳凭证清单、质押/转让状态证明。</p>';
    },
    dealDetail: function (no) {
      var d = null;
      for (var i = 0; i < DEALS.length; i++) if (DEALS[i].no === no) d = DEALS[i];
      if (!d) return;
      var p = patByNo(d.patent);
      $('dealDetailBody').innerHTML =
        '<table class="kv"><tbody>'
        + '<tr><th>意向编号</th><td class="mono">' + d.no + '</td></tr>'
        + '<tr><th>关联专利</th><td>' + esc(p ? p.title : d.patent) + '<span class="cell-sub mono">' + d.patent + '</span></td></tr>'
        + '<tr><th>需求方 / 行业</th><td>' + esc(d.buyer) + ' · ' + esc(d.industry) + '</td></tr>'
        + '<tr><th>意向类型</th><td>' + esc(d.type) + '</td></tr>'
        + '<tr><th>预算</th><td class="mono">' + fmt(d.budget) + ' 万元</td></tr>'
        + '<tr><th>当前状态</th><td>' + pill(d.status) + '</td></tr>'
        + '<tr><th>负责人</th><td>' + esc(d.owner) + '</td></tr>'
        + '</tbody></table>';
    },
    pledgeDetail: function (no) {
      var r = null;
      for (var i = 0; i < PLEDGES.length; i++) if (PLEDGES[i].no === no) r = PLEDGES[i];
      if (!r) return;
      var p = patByNo(r.patent);
      $('pledgeDetailBody').innerHTML =
        '<table class="kv"><tbody>'
        + '<tr><th>业务编号</th><td class="mono">' + r.no + '</td></tr>'
        + '<tr><th>关联专利</th><td>' + esc(p ? p.title : r.patent) + '<span class="cell-sub mono">' + r.patent + '</span></td></tr>'
        + '<tr><th>业务类型</th><td>' + esc(r.type) + '</td></tr>'
        + '<tr><th>对手方</th><td>' + esc(r.party) + '</td></tr>'
        + '<tr><th>金额 / 对价</th><td class="mono">' + fmt(r.amount) + ' 万元</td></tr>'
        + '<tr><th>起始日</th><td class="mono">' + r.start + '</td></tr>'
        + '<tr><th>状态</th><td>' + pill(r.status) + '</td></tr>'
        + '</tbody></table>';
    },
    release: function (no) {
      var r = null;
      for (var i = 0; i < PLEDGES.length; i++) if (PLEDGES[i].no === no) r = PLEDGES[i];
      if (!r) return;
      var p = patByNo(r.patent);
      $('releaseBody').innerHTML =
        '<table class="kv"><tbody>'
        + '<tr><th>业务编号</th><td class="mono">' + r.no + '</td></tr>'
        + '<tr><th>关联专利</th><td>' + esc(p ? p.title : r.patent) + '</td></tr>'
        + '<tr><th>质权人</th><td>' + esc(r.party) + '</td></tr>'
        + '<tr><th>融资金额</th><td class="mono">' + fmt(r.amount) + ' 万元</td></tr>'
        + '</tbody></table>'
        + '<p style="margin-top:10px;font-size:12px;color:var(--ink-soft)">确认后记录置为「已解除」，专利质押状态恢复为「未质押」，方可发起转让。</p>';
      var reErr = $('releaseErr');
      if (reErr) reErr.className = 'form-err';
      var btn = $('releaseConfirmBtn');
      if (btn) btn.setAttribute('data-no', r.no);
    },
    newDeal: function () {
      var sel = $('ndPatent');
      if (!sel) return;
      var html = '';
      for (var i = 0; i < PATENTS.length; i++) {
        var p = PATENTS[i];
        if (p.status === '失效') continue;
        html += '<option value="' + p.no + '">' + esc(p.title) + '（' + p.no + '）</option>';
      }
      sel.innerHTML = html;
      var err = $('ndErr');
      if (err) err.className = 'form-err';
    },
    newPledge: function () {
      var sel = $('plNewPatent');
      if (!sel) return;
      var html = '';
      for (var i = 0; i < PATENTS.length; i++) {
        var p = PATENTS[i];
        if (p.status === '失效') continue;
        html += '<option value="' + p.no + '">' + esc(p.title) + '（' + p.no + (p.pledge === '质押中' ? ' · 质押中' : '') + '）</option>';
      }
      sel.innerHTML = html;
      var err = $('plErr');
      if (err) err.className = 'form-err';
    },
    newPatent: function () {
      ['npNo', 'npTitle', 'npOwner', 'npDue', 'npFee', 'npValue'].forEach(function (id) { var el = $(id); if (el) el.value = ''; });
      var err = $('npErr');
      if (err) err.className = 'form-err';
    },
    locate: function () { /* P01 预警行定位在 handleDemoAction 内处理 */ }
  };

  /* data-fill 委托：与骨架 data-open-modal 委托并存（先开窗后填充，同一事件循环内完成） */
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('[data-fill]') : null;
    if (!t) return;
    var fn = FILL[t.getAttribute('data-fill')];
    if (fn) fn(t.getAttribute('data-no'));
  });

  /* select 筛选走 change 语义（骨架 input 通道已排除 SELECT，防双触发） */
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!t || t.tagName !== 'SELECT') return;
    var act = t.getAttribute && t.getAttribute('data-action');
    if (act && typeof window.handleDemoAction === 'function') window.handleDemoAction(act, t, e);
  });

  /* 组合概览视图构建（数据驱动重算 + 刷新时间戳，保证每次切换均有 DOM 变化） */
  function buildOverviewHtml(view) {
    var grades = { A: { n: 0, v: 0 }, B: { n: 0, v: 0 }, C: { n: 0, v: 0 }, D: { n: 0, v: 0 } };
    var fields = {};
    var maxField = 1;
    for (var i = 0; i < PATENTS.length; i++) {
      var p = PATENTS[i];
      if (p.status === '失效') continue;
      if (grades[p.grade]) { grades[p.grade].n++; grades[p.grade].v += p.value; }
      fields[p.field] = (fields[p.field] || 0) + p.value;
      if (fields[p.field] > maxField) maxField = fields[p.field];
    }
    var t = new Date();
    var ts = t.getHours() + ':' + String(t.getMinutes()).padStart(2, '0') + ':' + String(t.getSeconds()).padStart(2, '0');
    var foot = '<div class="panel-tag" style="margin-top:8px">数据刷新于 ' + ts + '</div>';
    if (view === 'fields') {
      var order = Object.keys(fields).sort(function (a, b) { return fields[b] - fields[a]; });
      return order.map(function (f) {
        var w = Math.max(6, Math.round(fields[f] / maxField * 100));
        return '<div class="hbar"><span class="hb-name">' + f + '</span><div class="hb-track"><div class="hb-fill" style="width:' + w + '%"></div></div><span class="hb-val num">' + fmt(fields[f]) + ' 万</span></div>';
      }).join('') + foot;
    }
    var maxV = 1;
    ['A', 'B', 'C', 'D'].forEach(function (g) { if (grades[g].v > maxV) maxV = grades[g].v; });
    var bars = ['A', 'B', 'C', 'D'].map(function (g) {
      var h = Math.max(8, Math.round(grades[g].v / maxV * 92));
      return '<div class="vbar"><span class="vb-num num">' + fmt(grades[g].v) + ' 万</span><div class="vb-fill" style="height:' + h + '%"></div><span class="vb-name">' + g + '级 · ' + grades[g].n + '件</span></div>';
    }).join('');
    return '<div class="vbars">' + bars + '</div>' + foot;
  }

  /* ---------- 业务动作 ---------- */
  window.handleDemoAction = function (action, target, event) {
    var no = target ? target.getAttribute('data-no') : null;
    switch (action) {
      case 'filterPatents': renderPatents(); break;
      case 'resetPatents':
        if ($('patSearch')) $('patSearch').value = '';
        if ($('patStatus')) $('patStatus').value = '';
        if ($('patField')) $('patField').value = '';
        renderPatents();
        toast('已重置台账筛选条件');
        break;
      case 'submitNewPatent': {
        var vNo = ($('npNo') && $('npNo').value || '').trim().toUpperCase();
        var vTitle = ($('npTitle') && $('npTitle').value || '').trim();
        var vOwner = ($('npOwner') && $('npOwner').value || '').trim();
        var err = $('npErr');
        if (!/^ZL\d{12}$/.test(vNo)) { err.textContent = '专利号格式不正确：ZL + 12 位数字（如 ZL202311223344）'; err.className = 'form-err show'; return; }
        for (var i = 0; i < PATENTS.length; i++) {
          if (PATENTS[i].no === vNo) { err.textContent = '专利号 ' + vNo + ' 已存在于台账，不可重复登记'; err.className = 'form-err show'; return; }
        }
        if (!vTitle || !vOwner) { err.textContent = '专利名称与专利权人为必填项'; err.className = 'form-err show'; return; }
        var vVal = Number($('npValue') && $('npValue').value || 0) || 0;
        var grade = vVal >= 1500 ? 'A' : (vVal >= 800 ? 'B' : (vVal >= 300 ? 'C' : 'D'));
        PATENTS.unshift({
          no: vNo, title: vTitle, type: $('npType') ? $('npType').value : '发明专利', field: $('npField') ? $('npField').value : '人工智能',
          owner: vOwner, apply: '2026-08-28', grant: '—', expiry: '—', due: ($('npDue') && $('npDue').value) || '2027-08-28',
          fee: Number($('npFee') && $('npFee').value || 0) || 0, value: vVal, grade: grade, status: '有效', pledge: '未质押'
        });
        closeModal('modalNewPatent');
        renderPatents(); renderKpi();
        toast('专利「' + vTitle + '」已登记入台账');
        break;
      }
      case 'confirmPay': {
        var pp = patByNo(no);
        if (!pp) return;
        if (pp.status !== '年费预警') { var pe = $('payErr'); if (pe) { pe.textContent = '该专利当前无待缴年费预警'; pe.className = 'form-err show'; } return; }
        pp.status = '有效';
        for (var j = 0; j < FEES.length; j++) {
          if (FEES[j].patent === no && FEES[j].year === 2026) { FEES[j].status = '已缴'; FEES[j].paidAt = '2026-08-28'; }
        }
        closeModal('modalPayFee');
        renderPatents(); renderRisk(); renderKpi();
        toast('年费缴纳成功，「' + pp.title + '」恢复有效状态');
        break;
      }
      case 'filterValuations': renderValuations(); break;
      case 'resetValuations':
        if ($('valSearch')) $('valSearch').value = '';
        if ($('valQuarter')) $('valQuarter').value = '';
        if ($('valStatus')) $('valStatus').value = '';
        renderValuations();
        toast('已重置估值筛选条件');
        break;
      case 'confirmValuation': {
        var v = null;
        for (var k = 0; k < VALUATIONS.length; k++) if (VALUATIONS[k].no === no) v = VALUATIONS[k];
        if (!v) return;
        if (v.status !== '待确认') { toast('估值 ' + v.no + ' 已确认生效，无需重复确认', true); break; }
        v.status = '已确认'; v.by = ROLE_NAME[($('roleSelect') && $('roleSelect').value) || 'executive']; v.at = '2026-08-28';
        var p = patByNo(v.patent);
        if (p) {
          var isNewer = true;
          for (var m = 0; m < VALUATIONS.length; m++) {
            var other = VALUATIONS[m];
            if (other.patent === v.patent && other.status === '已确认' && other.no !== v.no && other.quarter > v.quarter) isNewer = false;
          }
          if (isNewer) {
            p.value = v.value;
            p.grade = v.value >= 1500 ? 'A' : (v.value >= 800 ? 'B' : (v.value >= 300 ? 'C' : 'D'));
          }
        }
        renderValuations(); renderPatents(); renderRisk(); renderKpi();
        toast('估值 ' + v.no + ' 已确认生效，台账估值已同步');
        break;
      }
      case 'startQuarterValuation': {
        var added = 0;
        for (var n = 0; n < PATENTS.length; n++) {
          var pt = PATENTS[n];
          if (pt.status === '失效') continue;
          var has = false;
          for (var q = 0; q < VALUATIONS.length; q++) {
            if (VALUATIONS[q].patent === pt.no && VALUATIONS[q].quarter === '2026-Q3') { has = true; break; }
          }
          if (has) continue;
          var base = pt.value || 300;
          var val = Math.round(base * (0.97 + (n % 5) * 0.02));
          VALUATIONS.unshift({
            no: 'V-2026Q3-' + String(VALUATIONS.filter(function (x) { return x.quarter === '2026-Q3'; }).length + 1 + added).padStart(3, '0'),
            patent: pt.no, quarter: '2026-Q3',
            legal: Math.min(96, 60 + (n * 7) % 36), tech: Math.min(96, 62 + (n * 5) % 34), market: Math.min(96, 58 + (n * 9) % 38), revenue: Math.min(96, 60 + (n * 6) % 36),
            total: 0, value: val, status: '待确认'
          });
          VALUATIONS[0].total = Math.round(VALUATIONS[0].legal * 0.3 + VALUATIONS[0].tech * 0.3 + VALUATIONS[0].market * 0.2 + VALUATIONS[0].revenue * 0.2);
          added++;
        }
        renderValuations(); renderPatents(); renderRisk(); renderKpi();
        toast(added > 0 ? ('已为 ' + added + ' 件在管专利生成 2026-Q3 待确认估值') : '2026-Q3 在管专利估值均已生成，无重复项');
        break;
      }
      case 'filterDeals': renderDeals(); break;
      case 'advanceDeal': {
        var d = null;
        for (var a = 0; a < DEALS.length; a++) if (DEALS[a].no === no) d = DEALS[a];
        if (!d) return;
        var idx = DEAL_FLOW.indexOf(d.status);
        if (idx < 0 || idx >= DEAL_FLOW.length - 1) { toast('意向 ' + d.no + ' 已处于终态「' + d.status + '」，不可继续推进', true); break; }
        d.status = DEAL_FLOW[idx + 1];
        renderDeals(); renderKpi();
        toast('意向 ' + d.no + ' 已推进至「' + d.status + '」');
        break;
      }
      case 'submitNewDeal': {
        var buyer = ($('ndBuyer') && $('ndBuyer').value || '').trim();
        var pNo = $('ndPatent') ? $('ndPatent').value : '';
        var p2 = patByNo(pNo);
        var err2 = $('ndErr');
        if (!p2 || p2.status === '失效') { err2.textContent = '失效专利不可发起撮合，请重新选择专利'; err2.className = 'form-err show'; return; }
        if (!buyer) { err2.textContent = '需求方为必填项'; err2.className = 'form-err show'; return; }
        var seq = 0;
        for (var s = 0; s < DEALS.length; s++) {
          var mm = /^YX2026-(\d+)$/.exec(DEALS[s].no);
          if (mm) seq = Math.max(seq, Number(mm[1]));
        }
        DEALS.unshift({ no: 'YX2026-' + String(seq + 1).padStart(3, '0'), patent: pNo, buyer: buyer, industry: $('ndIndustry') ? $('ndIndustry').value : '人工智能', type: $('ndType') ? $('ndType').value : '转让', budget: Number($('ndBudget') && $('ndBudget').value || 0) || 0, status: '初步接触', owner: '林岚' });
        closeModal('modalNewDeal');
        renderDeals();
        toast('撮合意向已登记：' + buyer);
        break;
      }
      case 'filterPledges': renderPledges(); break;
      case 'submitNewPledge': {
        var type = $('plNewType') ? $('plNewType').value : '质押登记';
        var pNo3 = $('plNewPatent') ? $('plNewPatent').value : '';
        var p3 = patByNo(pNo3);
        var party = ($('plNewParty') && $('plNewParty').value || '').trim();
        var err3 = $('plErr');
        if (!p3 || p3.status === '失效') { err3.textContent = '失效专利不可发起新的质押/转让业务'; err3.className = 'form-err show'; return; }
        if (!party) { err3.textContent = '对手方为必填项'; err3.className = 'form-err show'; return; }
        if (type === '专利转让' && p3.pledge === '质押中') {
          err3.textContent = '「' + p3.title + '」处于质押中，不可转让，需先解除质押（DB 业务）后再发起';
          err3.className = 'form-err show';
          return;
        }
        var seq3 = 0;
        for (var s3 = 0; s3 < PLEDGES.length; s3++) {
          var m3 = /^DB\d{4}-(\d+)$/.exec(PLEDGES[s3].no);
          if (m3) seq3 = Math.max(seq3, Number(m3[1]));
        }
        PLEDGES.unshift({ no: 'DB2026-' + String(seq3 + 1).padStart(3, '0'), patent: pNo3, type: type, party: party, amount: Number($('plNewAmount') && $('plNewAmount').value || 0) || 0, start: ($('plNewDate') && $('plNewDate').value) || '2026-08-28', status: '审批中' });
        if (type === '质押登记') p3.pledge = '质押中';
        closeModal('modalNewPledge');
        renderPledges(); renderPatents(); renderKpi();
        toast(type + '业务已登记：' + party);
        break;
      }
      case 'confirmRelease': {
        var r = null;
        for (var rI = 0; rI < PLEDGES.length; rI++) if (PLEDGES[rI].no === no) r = PLEDGES[rI];
        if (!r) return;
        if (r.status !== '生效中') { var re = $('releaseErr'); if (re) { re.textContent = '该记录状态为「' + r.status + '」，仅生效中的质押登记可解除'; re.className = 'form-err show'; } return; }
        r.status = '已解除';
        var rp = patByNo(r.patent);
        if (rp) rp.pledge = '未质押';
        closeModal('modalRelease');
        renderPledges(); renderPatents(); renderKpi();
        toast('质押 ' + r.no + ' 已解除，专利恢复未质押状态');
        break;
      }
      case 'updateScope': {
        var scope = $('ddScope') ? $('ddScope').value : 'all';
        var n2 = 0;
        for (var nI = 0; nI < PATENTS.length; nI++) {
          var px = PATENTS[nI];
          if (scope === 'all' && px.status !== '失效') n2++;
          if (scope === 'a-grade' && px.grade === 'A' && px.status !== '失效') n2++;
          if (scope === 'pledge' && px.pledge === '质押中') n2++;
        }
        $('ddCount').textContent = n2;
        break;
      }
      case 'exportDD': {
        var scope2 = $('ddScope') ? $('ddScope').value : 'all';
        var label = scope2 === 'a-grade' ? '仅 A 级资产' : (scope2 === 'pledge' ? '质押相关资产' : '全部在管资产');
        var cnt = Number($('ddCount') && $('ddCount').textContent || 0) || 0;
        if (cnt <= 0) { toast('所选范围内无可导出资产', true); return; }
        var seq2 = 0;
        for (var s2 = 0; s2 < TRACES.length; s2++) {
          var m2 = /^DD-\d{4}-(\d+)$/.exec(TRACES[s2].no);
          if (m2) seq2 = Math.max(seq2, Number(m2[1]));
        }
        TRACES.unshift({ no: 'DD-2026-' + String(seq2 + 1).padStart(3, '0'), scope: label, count: cnt, by: ROLE_NAME[($('roleSelect') && $('roleSelect').value) || 'executive'], at: '2026-08-28 17:0' + (TRACES.length % 10) });
        renderTraces();
        toast('尽调包导出成功：' + label + ' · ' + cnt + ' 份，已留痕');
        break;
      }
      case 'switchOverview': {
        var view = target.getAttribute('data-view') || 'grades';
        var gOn = (view !== 'fields'); // data-view 枚举: grades / fields（R-10 字面量对齐）
        if ($('ovGrades')) { $('ovGrades').innerHTML = buildOverviewHtml('grades'); $('ovGrades').hidden = !gOn; }
        if ($('ovFields')) { $('ovFields').innerHTML = buildOverviewHtml('fields'); $('ovFields').hidden = gOn; }
        document.querySelectorAll('.tab-group [data-action="switchOverview"]').forEach(function (b) {
          var on = b.getAttribute('data-view') === view;
          b.className = on ? 'active' : '';
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        break;
      }
      case 'showQuadrant': {
        var qk = target.getAttribute('data-q') || 'core';
        var qd = QUADRANTS[qk] || QUADRANTS.core;
        document.querySelectorAll('.quad').forEach(function (b) { b.className = (b.getAttribute('data-q') === qk) ? 'quad q-active' : 'quad'; });
        var items = [], sum = 0;
        for (var qI = 0; qI < PATENTS.length; qI++) {
          var pq = PATENTS[qI];
          if (qd.match(pq)) { items.push(pq); sum += pq.value; }
        }
        $('qlTitle').textContent = '象限清单 · ' + qd.name + qd.sub + ' · ' + items.length + ' 件 · ' + fmt(sum) + ' 万元';
        $('qlItems').innerHTML = items.length
          ? items.map(function (it) { return '<span class="ql-chip">' + esc(it.title) + '<span class="mono">' + it.no + ' · ' + fmt(it.value) + ' 万</span></span>'; }).join('')
          : '<span class="ql-chip">该象限暂无专利</span>';
        break;
      }
      case 'switchRole': {
        var role = target && target.value ? target.value : 'executive';
        var vis2 = applyRole(role);
        toast('已切换为「' + ROLE_NAME[role] + '」' + (vis2.indexOf('P01') < 0 ? '，高管驾驶舱仅对 C 级角色开放，已从导航隐藏' : '，驾驶舱可见'));
        break;
      }
      case 'locatePatent': {
        var lp = patByNo(no);
        if ($('patSearch')) $('patSearch').value = no || '';
        if ($('patStatus')) $('patStatus').value = '';
        if ($('patField')) $('patField').value = '';
        renderPatents();
        route('P02');
        toast(lp ? ('已在台账中定位「' + lp.title + '」') : '未找到该专利');
        break;
      }
      default: break;
    }
  };

  /* ---------- 新建/编辑弹窗打开时也需要填充专利下拉（data-open-modal 直开场景） ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('[data-open-modal="modalNewDeal"]') : null;
    if (t && FILL.newDeal) FILL.newDeal();
    var t2 = e.target && e.target.closest ? e.target.closest('[data-open-modal="modalNewPledge"]') : null;
    if (t2 && FILL.newPledge) FILL.newPledge();
    var t3 = e.target && e.target.closest ? e.target.closest('[data-open-modal="modalNewPatent"]') : null;
    if (t3 && FILL.newPatent) FILL.newPatent();
  });

  /* ---------- 初始化：静态首屏即数据真值，仅同步角色视图 ---------- */
  applyRole('executive');
})();

