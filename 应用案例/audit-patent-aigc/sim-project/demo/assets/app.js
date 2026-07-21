/* ============================================================
  AIGC 算法专利管理平台 - 应用逻辑
  - 多页面 SPA（hashchange 路由）
  - Mock 数据：12 条专利，覆盖 4 算法类型 + 5 状态
  - 交互：搜索、分页、状态流转、弹窗、Toast
  ============================================================ */

// === 全局应用命名空间（避免 const app 冲突标注引擎）===
var PatentApp = PatentApp || {};

// === Mock 数据：12 条专利，覆盖 4 算法类型 + 5 状态 ===
PatentApp.PATENTS = [
  {
    id: 'PT-2026-001',
    patent_no: 'CN202610001234.5',
    algorithm_type: '生成式AI',
    algorithm_type_key: 'generative',
    ownership_type: '人工发明',
    ownership_type_key: 'human',
    developer: '王思远',
    owner: '智源算法研究院',
    operator: '王思远',
    status: 'granted',
    submitted_at: '2026-03-12',
    parsed_at: '2026-03-13',
    filed_at: '2026-04-08',
    granted_at: '2026-07-05',
    code_artifact: '// 生成式 AI 模型蒸馏算法\nfunction distill(teacher, student, data) {\n  const softLabels = teacher.predict(data);\n  const loss = klDivergence(softLabels, student.predict(data));\n  return student.optimize(loss);\n}',
    insights: [
      { type: 'success', title: '创新点 1：分层蒸馏', desc: '通过 <code>teacher.predict()</code> 与 <code>student.predict()</code> 残差对齐，减少 38% 推理延迟。' },
      { type: 'success', title: '创新点 2：动态温度系数', desc: '基于样本难度自适应调整 softmax 温度。' },
      { type: 'warning', title: 'GPL-3.0 组件检测', desc: '依赖 <code>tensorflow/models</code>（GPL-3.0），需替换为 MIT 替代库后申请。' }
    ],
    fto_results: [
      { api: 'distill()', risk: 'low', target: 'US2024/0123456 A1', note: '功能相似但实现路径不同' },
      { api: 'klDivergence()', risk: 'low', target: 'CN1154321A', note: '标准数学函数，无侵权风险' }
    ]
  },
  {
    id: 'PT-2026-002',
    patent_no: 'CN202610002345.6',
    algorithm_type: '工业软件',
    algorithm_type_key: 'industrial',
    ownership_type: 'AI辅助',
    ownership_type_key: 'ai-assisted',
    developer: '林墨涵',
    owner: '华工智造科技',
    operator: '林墨涵',
    status: 'filed',
    submitted_at: '2026-05-18',
    parsed_at: '2026-05-19',
    filed_at: '2026-06-22',
    code_artifact: '# PLC 注塑机自适应控制\nFUNCTION_BLOCK FB_InjectCtrl\nVAR_INPUT\n  temp, pressure : REAL;\nEND_VAR\nVAR_OUTPUT\n  valve_open : BOOL;\nEND_VAR\nvalve_open := (temp > 180.0) AND (pressure < 12.5);',
    insights: [
      { type: 'success', title: '创新点 1：双闭环自适应', desc: '基于温度与压力双输入的闭环反馈控制。' },
      { type: 'warning', title: 'Apache-2.0 检测', desc: '依赖 <code>openplc/utils</code>（Apache-2.0），需保留 NOTICE 文件。' }
    ],
    fto_results: [
      { api: 'FB_InjectCtrl', risk: 'mid', target: 'EP3456789B1', note: '注塑控制相似，需添加差异化参数说明' }
    ]
  },
  {
    id: 'PT-2026-003',
    patent_no: 'CN202610003456.7',
    algorithm_type: '边缘算法',
    algorithm_type_key: 'edge',
    ownership_type: '人工发明',
    ownership_type_key: 'human',
    developer: '陈博文',
    owner: '边缘计算实验室',
    operator: '陈博文',
    status: 'analyzing',
    submitted_at: '2026-06-28',
    parsed_at: '2026-06-29',
    code_artifact: '// 边缘设备轻量化目标检测\nasync function detect(image) {\n  const tensor = preprocess(image);\n  const output = await session.run({ input: tensor });\n  return postprocess(output, 0.45);\n}',
    insights: [
      { type: 'success', title: '创新点 1：8-bit 量化推理', desc: '在 ARM Cortex-M 上实现 8-bit 整数量化。' }
    ],
    fto_results: []
  },
  {
    id: 'PT-2026-004',
    patent_no: 'CN202610004567.8',
    algorithm_type: '物联网算法',
    algorithm_type_key: 'iot',
    ownership_type: 'AI辅助',
    ownership_type_key: 'ai-assisted',
    developer: '赵晨曦',
    owner: '物联感知科技',
    operator: '赵晨曦',
    status: 'parsing',
    submitted_at: '2026-07-10',
    code_artifact: '// LoRa 自适应速率选择\nfunction selectRate(snr) {\n  if (snr > 12) return "SF7";\n  if (snr > 5) return "SF9";\n  return "SF12";\n}',
    insights: [],
    fto_results: []
  },
  {
    id: 'PT-2026-005',
    patent_no: 'CN202610005678.9',
    algorithm_type: '生成式AI',
    algorithm_type_key: 'generative',
    ownership_type: '纯机器生成',
    ownership_type_key: 'machine',
    developer: 'AI-Agent-001',
    owner: '智源算法研究院',
    operator: '王思远',
    status: 'submitted',
    submitted_at: '2026-07-15',
    code_artifact: '# 由 AI Agent 自动生成的扩散模型采样器\nimport torch\ndef sample(model, noise, steps=50):\n    for i in range(steps):\n        noise = model(noise)\n    return noise',
    insights: [],
    fto_results: []
  },
  {
    id: 'PT-2026-006',
    patent_no: 'CN202610006789.0',
    algorithm_type: '工业软件',
    algorithm_type_key: 'industrial',
    ownership_type: '人工发明',
    ownership_type_key: 'human',
    developer: '李泽宇',
    owner: '华工智造科技',
    operator: '李泽宇',
    status: 'granted',
    submitted_at: '2026-01-08',
    parsed_at: '2026-01-09',
    filed_at: '2026-02-14',
    granted_at: '2026-06-30',
    code_artifact: '// CNC 刀具磨损预测\nfunction predictWear(vibration, temperature, hours) {\n  const x = vibration * 0.4 + temperature * 0.3 + hours * 0.3;\n  return Math.min(1.0, x / 100);\n}',
    insights: [
      { type: 'success', title: '创新点 1：多源融合', desc: '融合振动、温度、工时三源数据。' }
    ],
    fto_results: [
      { api: 'predictWear()', risk: 'low', target: 'CN1098765A', note: '已有专利未覆盖工时维度' }
    ]
  },
  {
    id: 'PT-2026-007',
    patent_no: 'CN202610007890.1',
    algorithm_type: '边缘算法',
    algorithm_type_key: 'edge',
    ownership_type: 'AI辅助',
    ownership_type_key: 'ai-assisted',
    developer: '周文婷',
    owner: '边缘计算实验室',
    operator: '周文婷',
    status: 'analyzing',
    submitted_at: '2026-06-15',
    parsed_at: '2026-06-16',
    code_artifact: '// 边缘联邦学习聚合\nasync function aggregate(models) {\n  const avg = averageWeights(models);\n  return compress(avg, 0.7);\n}',
    insights: [
      { type: 'success', title: '创新点 1：稀疏化聚合', desc: '70% 稀疏度下通信量减少 65%。' },
      { type: 'risk', title: 'AGPL-3.0 检测', desc: '依赖 <code>flower/flwr</code>（AGPL-3.0），网络分发触发专利冲突，禁止提交。' }
    ],
    fto_results: [
      { api: 'aggregate()', risk: 'high', target: 'US2023/9988776 A1', note: '聚合逻辑高度相似，需重构差异化' }
    ]
  },
  {
    id: 'PT-2026-008',
    patent_no: 'CN202610008901.2',
    algorithm_type: '生成式AI',
    algorithm_type_key: 'generative',
    ownership_type: '人工发明',
    ownership_type_key: 'human',
    developer: '王思远',
    owner: '智源算法研究院',
    operator: '王思远',
    status: 'filed',
    submitted_at: '2026-04-22',
    parsed_at: '2026-04-23',
    filed_at: '2026-05-30',
    code_artifact: '// 提示词工程优化器\nclass PromptOptimizer {\n  optimize(prompt) {\n    return this.rewrite(prompt) + this.addContext(prompt);\n  }\n}',
    insights: [
      { type: 'success', title: '创新点 1：上下文注入', desc: '基于检索增强的提示词重写。' }
    ],
    fto_results: []
  },
  {
    id: 'PT-2026-009',
    patent_no: 'CN202610009012.3',
    algorithm_type: '物联网算法',
    algorithm_type_key: 'iot',
    ownership_type: '人工发明',
    ownership_type_key: 'human',
    developer: '孙雨欣',
    owner: '物联感知科技',
    operator: '孙雨欣',
    status: 'parsing',
    submitted_at: '2026-07-12',
    code_artifact: '// Modbus 异常检测\nfunction detectAnomaly(packet) {\n  return packet.crc !== computeCRC(packet.data);\n}',
    insights: [],
    fto_results: []
  },
  {
    id: 'PT-2026-010',
    patent_no: 'CN202610010123.4',
    algorithm_type: '工业软件',
    algorithm_type_key: 'industrial',
    ownership_type: 'AI辅助',
    ownership_type_key: 'ai-assisted',
    developer: '李泽宇',
    owner: '华工智造科技',
    operator: '李泽宇',
    status: 'submitted',
    submitted_at: '2026-07-18',
    code_artifact: '// MES 排程遗传算法\nfunction schedule(jobs, machines) {\n  let pop = initPopulation(jobs, machines);\n  for (let g = 0; g < 100; g++) {\n    pop = evolve(pop);\n  }\n  return best(pop);\n}',
    insights: [],
    fto_results: []
  },
  {
    id: 'PT-2026-011',
    patent_no: 'CN202610011234.5',
    algorithm_type: '边缘算法',
    algorithm_type_key: 'edge',
    ownership_type: '纯机器生成',
    ownership_type_key: 'machine',
    developer: 'AI-Agent-002',
    owner: '边缘计算实验室',
    operator: '陈博文',
    status: 'submitted',
    submitted_at: '2026-07-19',
    code_artifact: '// AI 自动生成的边缘缓存策略\nfunction cachePolicy(req) {\n  return req.freq > 0.8 ? "HOT" : "COLD";\n}',
    insights: [],
    fto_results: []
  },
  {
    id: 'PT-2026-012',
    patent_no: 'CN202610012345.6',
    algorithm_type: '生成式AI',
    algorithm_type_key: 'generative',
    ownership_type: '人工发明',
    ownership_type_key: 'human',
    developer: '林墨涵',
    owner: '智源算法研究院',
    operator: '林墨涵',
    status: 'granted',
    submitted_at: '2026-02-10',
    parsed_at: '2026-02-11',
    filed_at: '2026-03-18',
    granted_at: '2026-07-02',
    code_artifact: '// 多模态对齐\nfunction align(image_feat, text_feat) {\n  return cosineSimilarity(image_feat, text_feat);\n}',
    insights: [
      { type: 'success', title: '创新点 1：跨模态对比学习', desc: '基于余弦相似度的对比损失。' }
    ],
    fto_results: [
      { api: 'align()', risk: 'low', target: 'CN1102345A', note: '已获得授权' }
    ]
  }
];

// === 状态元数据 ===
PatentApp.STATUS_META = {
  submitted:  { label: '已提交',  order: 1 },
  parsing:    { label: '解析中',  order: 2 },
  analyzing:  { label: '分析中',  order: 3 },
  filed:      { label: '已申请',  order: 4 },
  granted:    { label: '已授权',  order: 5 }
};

PatentApp.ALGO_META = {
  generative: '生成式AI',
  industrial: '工业软件',
  edge: '边缘算法',
  iot: '物联网算法'
};

PatentApp.OWNERSHIP_META = {
  human: '人工发明',
  'ai-assisted': 'AI辅助',
  machine: '纯机器生成'
};

// === 当前用户（默认 IPR）===
PatentApp.currentRole = 'ipr';
PatentApp.currentUser = { name: '张明远', avatar: 'ZM', role: 'IPR' };

// === 当前状态 ===
PatentApp.filterState = {
  patent_no: '',
  algorithm_type: '',
  ownership_type: '',
  developer: '',
  owner: '',
  status: ''
};
PatentApp.currentPage = 1;
PatentApp.pageSize = 8;

// === 路由表 ===
PatentApp.ROUTES = {
  '/aigc-patents': 'P01',
  '/aigc-patents/form': 'P03'
};

PatentApp.DEFAULT_ROUTE = '/aigc-patents';

// === 工具函数 ===
PatentApp.escapeHtml = function (str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

PatentApp.getStatusTag = function (status) {
  var labels = { submitted: '已提交', parsing: '解析中', analyzing: '分析中', filed: '已申请', granted: '已授权' };
  return '<span class="tag tag-' + status + '">' + labels[status] + '</span>';
};

PatentApp.getAlgoTag = function (algoKey) {
  var labels = { generative: '生成式AI', industrial: '工业软件', edge: '边缘算法', iot: '物联网算法' };
  return '<span class="tag tag-algo-' + algoKey + '">' + labels[algoKey] + '</span>';
};

PatentApp.getOwnershipTag = function (ownKey) {
  var labels = { human: '人工发明', 'ai-assisted': 'AI辅助', machine: '纯机器生成' };
  return '<span class="tag tag-ownership-' + ownKey + '">' + labels[ownKey] + '</span>';
};

// === 过滤 + 分页 ===
PatentApp.getFilteredPatents = function () {
  var f = PatentApp.filterState;
  return PatentApp.PATENTS.filter(function (p) {
    if (f.patent_no && p.patent_no.toLowerCase().indexOf(f.patent_no.toLowerCase()) < 0) return false;
    if (f.algorithm_type && p.algorithm_type_key !== f.algorithm_type) return false;
    if (f.ownership_type && p.ownership_type_key !== f.ownership_type) return false;
    if (f.developer && p.developer.indexOf(f.developer) < 0) return false;
    if (f.owner && p.owner.indexOf(f.owner) < 0) return false;
    if (f.status && p.status !== f.status) return false;
    return true;
  });
};

PatentApp.getPagedPatents = function () {
  var filtered = PatentApp.getFilteredPatents();
  var start = (PatentApp.currentPage - 1) * PatentApp.pageSize;
  return filtered.slice(start, start + PatentApp.pageSize);
};

// === 渲染 P01 列表 ===
PatentApp.renderPatentList = function () {
  var tbody = document.getElementById('patentTbody');
  if (!tbody) return;
  var paged = PatentApp.getPagedPatents();
  if (paged.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state">' +
      '<div class="empty-icon">{ }</div>' +
      '<h4>未找到匹配的专利</h4>' +
      '<p>请调整搜索条件后重试</p>' +
      '</div></td></tr>';
    return;
  }
  tbody.innerHTML = paged.map(function (p) {
    var canParse = p.status === 'submitted';
    // L3 锚点包裹：C-004 查看 + C-003 AI 解析（动态渲染遵循 v5.2.3 强制契约）
    var parseBtn = canParse
      ? '<span data-element-id="C-003" style="position: relative;"><button class="btn-icon" data-action="parse" data-id="' + p.id + '" title="AI 解析">解析</button><span class="l3-dot"></span></span>'
      : '<button class="btn-icon" disabled title="状态不允许">解析</button>';
    var viewBtn = '<span data-element-id="C-004" style="position: relative;"><button class="btn-icon" data-action="view" data-id="' + p.id + '" title="查看详情">查看</button><span class="l3-dot"></span></span>';
    return '<tr>' +
      '<td class="patent-no">' + PatentApp.escapeHtml(p.patent_no) + '</td>' +
      '<td>' + PatentApp.getAlgoTag(p.algorithm_type_key) + '</td>' +
      '<td>' + PatentApp.getOwnershipTag(p.ownership_type_key) + '</td>' +
      '<td>' + PatentApp.escapeHtml(p.developer) + '</td>' +
      '<td>' + PatentApp.escapeHtml(p.owner) + '</td>' +
      '<td>' + PatentApp.getStatusTag(p.status) + '</td>' +
      '<td style="color: var(--color-text-muted); font-family: var(--font-mono); font-size: 11px;">' + PatentApp.escapeHtml(p.submitted_at) + '</td>' +
      '<td><div class="row-actions">' + viewBtn + parseBtn + '</div></td>' +
      '</tr>';
  }).join('');
  PatentApp.renderPagination();
};

PatentApp.renderPagination = function () {
  var total = PatentApp.getFilteredPatents().length;
  var totalPages = Math.max(1, Math.ceil(total / PatentApp.pageSize));
  var info = document.getElementById('paginationInfo');
  if (info) {
    var start = (PatentApp.currentPage - 1) * PatentApp.pageSize + 1;
    var end = Math.min(total, PatentApp.currentPage * PatentApp.pageSize);
    info.textContent = '第 ' + start + '-' + end + ' 条 / 共 ' + total + ' 条';
  }
  var controls = document.getElementById('paginationControls');
  if (!controls) return;
  var html = '';
  html += '<button class="page-btn" data-page="' + (PatentApp.currentPage - 1) + '" ' + (PatentApp.currentPage <= 1 ? 'disabled' : '') + '>&lt; 上一页</button>';
  for (var i = 1; i <= totalPages; i++) {
    html += '<button class="page-btn ' + (i === PatentApp.currentPage ? 'active' : '') + '" data-page="' + i + '">' + i + '</button>';
  }
  html += '<button class="page-btn" data-page="' + (PatentApp.currentPage + 1) + '" ' + (PatentApp.currentPage >= totalPages ? 'disabled' : '') + '>下一页 &gt;</button>';
  controls.innerHTML = html;
  var resultCount = document.getElementById('resultCount');
  if (resultCount) resultCount.innerHTML = '共 <strong>' + total + '</strong> 条专利';
};

// === P01 搜索 ===
PatentApp.handleSearch = function () {
  PatentApp.filterState.patent_no = (document.getElementById('searchPatentNo') || {}).value || '';
  PatentApp.filterState.algorithm_type = (document.getElementById('searchAlgoType') || {}).value || '';
  PatentApp.filterState.ownership_type = (document.getElementById('searchOwnership') || {}).value || '';
  PatentApp.filterState.developer = (document.getElementById('searchDeveloper') || {}).value || '';
  PatentApp.filterState.owner = (document.getElementById('searchOwner') || {}).value || '';
  PatentApp.filterState.status = (document.getElementById('searchStatus') || {}).value || '';
  PatentApp.currentPage = 1;
  PatentApp.renderPatentList();
  PatentApp.showToast('success', '搜索完成', '已应用筛选条件');
};

PatentApp.handleReset = function () {
  PatentApp.filterState = { patent_no: '', algorithm_type: '', ownership_type: '', developer: '', owner: '', status: '' };
  document.getElementById('searchPatentNo').value = '';
  document.getElementById('searchAlgoType').value = '';
  document.getElementById('searchOwnership').value = '';
  document.getElementById('searchDeveloper').value = '';
  document.getElementById('searchOwner').value = '';
  document.getElementById('searchStatus').value = '';
  PatentApp.currentPage = 1;
  PatentApp.renderPatentList();
  PatentApp.showToast('info', '已重置', '搜索条件已清空');
};

// === P01 表格事件代理 ===
PatentApp.handleTableClick = function (e) {
  var btn = e.target.closest('[data-action]');
  if (!btn) return;
  var action = btn.getAttribute('data-action');
  var id = btn.getAttribute('data-id');
  if (action === 'view') {
    location.hash = '#/aigc-patents/' + id;
  } else if (action === 'parse') {
    var p = PatentApp.PATENTS.find(function (x) { return x.id === id; });
    if (p && p.status === 'submitted') {
      p.status = 'parsing';
      p.parsed_at = new Date().toISOString().slice(0, 10);
      PatentApp.renderPatentList();
      PatentApp.showToast('success', '解析任务已启动', '专利 ' + p.patent_no + ' 状态已置为解析中');
    }
  }
};

PatentApp.handlePaginationClick = function (e) {
  var btn = e.target.closest('[data-page]');
  if (!btn || btn.disabled) return;
  var page = parseInt(btn.getAttribute('data-page'), 10);
  var total = PatentApp.getFilteredPatents().length;
  var totalPages = Math.max(1, Math.ceil(total / PatentApp.pageSize));
  if (page < 1 || page > totalPages) return;
  PatentApp.currentPage = page;
  PatentApp.renderPatentList();
};

// === P02 详情页 ===
PatentApp.renderDetail = function (id) {
  var p = PatentApp.PATENTS.find(function (x) { return x.id === id; });
  if (!p) {
    var main = document.querySelector('#P02 .page-content');
    if (main) main.innerHTML = '<div class="empty-state"><div class="empty-icon">{404}</div><h4>专利不存在</h4><p>ID: ' + PatentApp.escapeHtml(id) + '</p></div>';
    return;
  }
  PatentApp.currentDetailId = id;

  // 基本信息
  var info = document.getElementById('detailInfo');
  if (info) {
    info.innerHTML = '<dl class="desc-list">' +
      '<dt>专利号</dt><dd style="font-family: var(--font-mono); color: var(--color-cyan);">' + PatentApp.escapeHtml(p.patent_no) + '</dd>' +
      '<dt>算法类型</dt><dd>' + PatentApp.getAlgoTag(p.algorithm_type_key) + '</dd>' +
      '<dt>权属类型</dt><dd>' + PatentApp.getOwnershipTag(p.ownership_type_key) + '</dd>' +
      '<dt>开发者</dt><dd>' + PatentApp.escapeHtml(p.developer) + '</dd>' +
      '<dt>申请人</dt><dd>' + PatentApp.escapeHtml(p.owner) + '</dd>' +
      '<dt>当前状态</dt><dd>' + PatentApp.getStatusTag(p.status) + '</dd>' +
      '<dt>提交日期</dt><dd style="font-family: var(--font-mono); font-size: 12px;">' + PatentApp.escapeHtml(p.submitted_at) + '</dd>' +
      '</dl>';
  }

  // 进度时间线
  var timeline = document.getElementById('detailTimeline');
  if (timeline) {
    var stages = [
      { key: 'submitted', label: '已提交', date: p.submitted_at },
      { key: 'parsing', label: '解析中', date: p.parsed_at },
      { key: 'analyzing', label: '分析中', date: p.analyzed_at },
      { key: 'filed', label: '已申请', date: p.filed_at },
      { key: 'granted', label: '已授权', date: p.granted_at }
    ];
    var currentOrder = PatentApp.STATUS_META[p.status].order;
    timeline.innerHTML = stages.map(function (s, i) {
      var cls = '';
      if (s.date && PatentApp.STATUS_META[s.key].order < currentOrder) cls = 'done';
      else if (PatentApp.STATUS_META[s.key].order === currentOrder) cls = 'current';
      return '<div class="timeline-item ' + cls + '">' +
        '<div class="timeline-dot">' + (i + 1) + '</div>' +
        '<div class="timeline-content">' +
        '<h5>' + s.label + '</h5>' +
        '<div class="timeline-meta">' + (s.date || '待处理') + '</div>' +
        '</div></div>';
    }).join('');
  }

  // 代码资产
  var codeBlock = document.getElementById('detailCode');
  if (codeBlock) {
    var code = p.code_artifact || '// 暂无代码资产';
    var highlighted = PatentApp.escapeHtml(code)
      .replace(/(\/\/[^\n]*)/g, '<span class="code-comment">$1</span>')
      .replace(/(#[^\n]*)/g, '<span class="code-comment">$1</span>')
      .replace(/\b(function|class|const|let|var|return|if|else|for|async|await|new|import|from)\b/g, '<span class="code-keyword">$1</span>')
      .replace(/('[^']*'|"[^"]*")/g, '<span class="code-string">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="code-num">$1</span>');
    codeBlock.innerHTML = '<div class="code-header"><span class="code-filename">' + PatentApp.escapeHtml(p.id) + '.algo</span><span class="code-lang">' + PatentApp.escapeHtml(p.algorithm_type) + '</span></div><pre>' + highlighted + '</pre>';
  }

  // 算法流程图（mermaid 容器，简化为流程节点）
  var flowEl = document.getElementById('detailFlow');
  if (flowEl) {
    flowEl.innerHTML = '<div class="mermaid-flow">' +
      '<div class="mermaid-node">输入数据</div>' +
      '<span class="mermaid-arrow">→</span>' +
      '<div class="mermaid-node highlight">预处理</div>' +
      '<span class="mermaid-arrow">→</span>' +
      '<div class="mermaid-node">核心算法</div>' +
      '<span class="mermaid-arrow">→</span>' +
      '<div class="mermaid-node highlight">后处理</div>' +
      '<span class="mermaid-arrow">→</span>' +
      '<div class="mermaid-node">输出结果</div>' +
      '</div>';
  }

  // 解析结果
  var insightsEl = document.getElementById('detailInsights');
  if (insightsEl) {
    if (p.insights.length === 0) {
      insightsEl.innerHTML = '<div class="empty-state"><div class="empty-icon">{ }</div><h4>暂无解析结果</h4><p>专利尚未完成 AI 解析</p></div>';
    } else {
      insightsEl.innerHTML = '<div class="insight-list">' + p.insights.map(function (ins, i) {
        return '<div class="insight-item ' + ins.type + '">' +
          '<div class="insight-num">' + (i + 1) + '</div>' +
          '<div class="insight-body"><h4>' + PatentApp.escapeHtml(ins.title) + '</h4><p>' + ins.desc + '</p></div>' +
          '</div>';
      }).join('') + '</div>';
    }
  }

  // FTO 比对
  var ftoEl = document.getElementById('detailFto');
  if (ftoEl) {
    if (p.fto_results.length === 0) {
      ftoEl.innerHTML = '<div class="empty-state"><div class="empty-icon">{ }</div><h4>暂无 FTO 比对</h4><p>等待分析阶段触发</p></div>';
    } else {
      var riskLabel = { high: '高', mid: '中', low: '低' };
      ftoEl.innerHTML = '<table class="fto-table"><thead><tr><th>API / 模块</th><th>风险</th><th>对比专利</th><th>备注</th></tr></thead><tbody>' +
        p.fto_results.map(function (f) {
          return '<tr><td>' + PatentApp.escapeHtml(f.api) + '</td>' +
            '<td class="fto-risk-' + f.risk + '">' + riskLabel[f.risk] + '</td>' +
            '<td>' + PatentApp.escapeHtml(f.target) + '</td>' +
            '<td style="color: var(--color-text-secondary); font-family: var(--font-body);">' + PatentApp.escapeHtml(f.note) + '</td></tr>';
        }).join('') +
        '</tbody></table>';
    }
  }

  // 操作按钮区（按状态条件显示）+ L3 锚点包裹（v5.2.3 强制契约）
  var actionsEl = document.getElementById('detailActions');
  if (actionsEl) {
    var html = '';
    if (p.status === 'parsing') {
      html += '<span data-element-id="C-001" style="position: relative; display: inline-flex; align-items: center;"><button class="btn btn-primary" data-detail-action="analyze">触发分析</button><span class="l3-dot"></span></span>';
      html += '<span class="action-hint">解析完成后可触发 FTO + 权属分析</span>';
    } else if (p.status === 'analyzing') {
      if (PatentApp.currentRole === 'ipr') {
        html += '<span data-element-id="C-002" style="position: relative; display: inline-flex; align-items: center;"><button class="btn btn-primary" data-detail-action="review">审核权属</button><span class="l3-dot"></span></span>';
      } else {
        html += '<span class="action-hint">等待 IPR 审核权属</span>';
      }
    } else if (p.status === 'filed') {
      html += '<span data-element-id="C-003" style="position: relative; display: inline-flex; align-items: center;"><button class="btn btn-amber" data-detail-action="grant">标记授权</button><span class="l3-dot"></span></span>';
    } else if (p.status === 'granted') {
      html += '<span class="action-hint">[OK] 专利已授权</span>';
    } else if (p.status === 'submitted') {
      html += '<span class="action-hint">需先触发 AI 解析（在列表页）</span>';
    }
    html += '<button class="btn btn-ghost" data-detail-action="back">返回列表</button>';
    actionsEl.innerHTML = html;
  }

  // 面包屑
  var bc = document.getElementById('breadcrumbCurrent');
  if (bc) bc.textContent = '专利详情 / ' + p.patent_no;
};

PatentApp.handleDetailAction = function (e) {
  var btn = e.target.closest('[data-detail-action]');
  if (!btn) return;
  var action = btn.getAttribute('data-detail-action');
  var p = PatentApp.PATENTS.find(function (x) { return x.id === PatentApp.currentDetailId; });
  if (!p) return;

  if (action === 'analyze') {
    p.status = 'analyzing';
    p.analyzed_at = new Date().toISOString().slice(0, 10);
    // 模拟分析结果
    if (p.insights.length === 0) {
      p.insights = [
        { type: 'success', title: '创新点 1：算法流程优化', desc: '检测到核心算法在 <code>' + p.algorithm_type + '</code> 领域的差异化实现。' },
        { type: 'warning', title: '组件协议检测', desc: '建议补充开源协议清单。' }
      ];
    }
    if (p.fto_results.length === 0) {
      p.fto_results = [
        { api: 'main()', risk: 'low', target: 'CN0000000A', note: '暂无相似专利' }
      ];
    }
    PatentApp.renderDetail(p.id);
    PatentApp.showToast('success', '分析完成', 'FTO 比对与权属判定已生成');
  } else if (action === 'review') {
    PatentApp.openOwnershipModal(p);
  } else if (action === 'grant') {
    p.status = 'granted';
    p.granted_at = new Date().toISOString().slice(0, 10);
    PatentApp.renderDetail(p.id);
    PatentApp.showToast('success', '已标记授权', '专利 ' + p.patent_no + ' 已授权');
  } else if (action === 'back') {
    location.hash = '#/aigc-patents';
  }
};

// === 弹窗 ===
PatentApp.openOwnershipModal = function (p) {
  var mask = document.getElementById('modalMask');
  var title = document.getElementById('modalTitle');
  var body = document.getElementById('modalBody');
  if (!mask || !title || !body) return;
  title.textContent = '审核权属判定';
  var isMachine = p.ownership_type_key === 'machine';
  body.innerHTML =
    '<p>请确认以下权属判定结果，确认后将进入「已申请」状态。</p>' +
    '<div class="ownership-summary">' +
    '<div class="summary-row"><span class="label">专利号</span><span>' + PatentApp.escapeHtml(p.patent_no) + '</span></div>' +
    '<div class="summary-row"><span class="label">算法类型</span><span>' + PatentApp.escapeHtml(p.algorithm_type) + '</span></div>' +
    '<div class="summary-row"><span class="label">开发者</span><span>' + PatentApp.escapeHtml(p.developer) + '</span></div>' +
    '<div class="summary-row"><span class="label">申请人</span><span>' + PatentApp.escapeHtml(p.owner) + '</span></div>' +
    '<div class="summary-row"><span class="label">权属类型</span><span>' + PatentApp.escapeHtml(p.ownership_type) + '</span></div>' +
    '</div>' +
    (isMachine ? '<div class="alert-block"><strong>[WARN] 合规风险：</strong>纯机器生成内容不可作为专利发明人，建议补充人工发明人后再审核通过。</div>' : '<p style="color: var(--color-green);">[OK] 权属判定无合规风险</p>') +
    '<p style="margin-top: 12px; font-size: 12px;">点击「确认通过」将状态置为「已申请」。</p>';
  var footer = document.getElementById('modalFooter');
  if (footer) {
    footer.innerHTML = '<button class="btn btn-ghost" data-modal-action="cancel">取消</button>' +
      '<button class="btn btn-primary" data-modal-action="confirm">确认通过</button>';
  }
  PatentApp.modalContext = { type: 'ownership', patentId: p.id, isMachine: isMachine };
  mask.classList.add('show');
};

PatentApp.closeModal = function () {
  var mask = document.getElementById('modalMask');
  if (mask) mask.classList.remove('show');
  PatentApp.modalContext = null;
};

PatentApp.handleModalAction = function (e) {
  var btn = e.target.closest('[data-modal-action]');
  if (!btn) return;
  var action = btn.getAttribute('data-modal-action');
  var ctx = PatentApp.modalContext;
  if (!ctx) return;
  if (action === 'cancel') {
    PatentApp.closeModal();
  } else if (action === 'confirm' && ctx.type === 'ownership') {
    var p = PatentApp.PATENTS.find(function (x) { return x.id === ctx.patentId; });
    if (p) {
      p.status = 'filed';
      p.filed_at = new Date().toISOString().slice(0, 10);
      PatentApp.renderDetail(p.id);
      PatentApp.showToast('success', '权属审核通过', '专利 ' + p.patent_no + ' 已进入「已申请」状态');
    }
    PatentApp.closeModal();
  } else if (action === 'confirm' && ctx.type === 'risk') {
    PatentApp.closeModal();
  }
};

// === P03 表单 ===
PatentApp.handleFormOwnershipChange = function () {
  var select = document.getElementById('formOwnership');
  if (!select) return;
  if (select.value === 'machine') {
    PatentApp.openRiskModal();
  }
};

PatentApp.openRiskModal = function () {
  var mask = document.getElementById('modalMask');
  var title = document.getElementById('modalTitle');
  var body = document.getElementById('modalBody');
  if (!mask || !title || !body) return;
  title.textContent = '权属合规风险提示';
  body.innerHTML =
    '<p>您选择了「<strong>纯机器生成</strong>」权属类型。</p>' +
    '<div class="alert-block"><strong>[WARN] 合规警示：</strong>根据《专利法》相关规定，纯机器生成内容不可作为专利发明人。建议：</div>' +
    '<p style="padding-left: 12px; font-size: 12px; line-height: 1.7;">' +
    '1. 至少补充一位自然人作为发明人<br>' +
    '2. 将权属类型改为「AI 辅助」<br>' +
    '3. 如坚持纯机器生成，提交时将被合规校验拦截' +
    '</p>';
  var footer = document.getElementById('modalFooter');
  if (footer) {
    footer.innerHTML = '<button class="btn btn-ghost" data-modal-action="cancel">我知道了</button>';
  }
  PatentApp.modalContext = { type: 'risk' };
  mask.classList.add('show');
};

PatentApp.handleFormSubmit = function () {
  // 表单校验
  var fields = ['formPatentNo', 'formAlgoType', 'formOwnership', 'formDeveloper', 'formOwner'];
  var labels = { formPatentNo: '专利号', formAlgoType: '算法类型', formOwnership: '权属类型', formDeveloper: '开发者', formOwner: '申请人' };
  var valid = true;
  fields.forEach(function (fid) {
    var el = document.getElementById(fid);
    if (!el) return;
    var wrapper = el.closest('.form-field-large');
    if (!el.value.trim()) {
      valid = false;
      if (wrapper) wrapper.classList.add('has-error');
    } else {
      if (wrapper) wrapper.classList.remove('has-error');
    }
  });
  if (!valid) {
    PatentApp.showToast('error', '校验失败', '请补全必填字段');
    return;
  }

  // 唯一性校验（同算法类型 + 同专利号）
  var patentNo = document.getElementById('formPatentNo').value.trim();
  var exists = PatentApp.PATENTS.some(function (p) { return p.patent_no === patentNo; });
  if (exists) {
    PatentApp.showToast('error', '重复申请', '专利号 ' + patentNo + ' 已存在，同一算法不可重复申请');
    return;
  }

  // 合规校验
  var ownership = document.getElementById('formOwnership').value;
  if (ownership === 'machine') {
    PatentApp.showToast('error', '合规拦截', '纯机器生成内容不可作为专利发明人');
    return;
  }

  // 开源协议冲突模拟校验
  var code = (document.getElementById('formCode') || {}).value || '';
  if (code.indexOf('GPL') >= 0 || code.indexOf('AGPL') >= 0) {
    PatentApp.showToast('error', '协议冲突', '检测到 GPL/AGPL 协议，禁止提交');
    return;
  }

  // 创建新专利
  var newId = 'PT-2026-' + String(PatentApp.PATENTS.length + 1).padStart(3, '0');
  var algoKey = document.getElementById('formAlgoType').value;
  var ownKey = document.getElementById('formOwnership').value;
  PatentApp.PATENTS.unshift({
    id: newId,
    patent_no: patentNo,
    algorithm_type: PatentApp.ALGO_META[algoKey],
    algorithm_type_key: algoKey,
    ownership_type: PatentApp.OWNERSHIP_META[ownKey],
    ownership_type_key: ownKey,
    developer: document.getElementById('formDeveloper').value.trim(),
    owner: document.getElementById('formOwner').value.trim(),
    operator: PatentApp.currentUser.name,
    status: 'submitted',
    submitted_at: new Date().toISOString().slice(0, 10),
    code_artifact: code,
    insights: [],
    fto_results: []
  });

  PatentApp.showToast('success', '提交成功', '专利 ' + patentNo + ' 已创建，状态：已提交');
  // 跳转列表
  setTimeout(function () { location.hash = '#/aigc-patents'; }, 600);
};

PatentApp.handleFormCancel = function () {
  location.hash = '#/aigc-patents';
};

// === Toast ===
PatentApp.showToast = function (type, title, msg) {
  var container = document.getElementById('toastContainer');
  if (!container) return;
  var toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = '<div class="toast-title">' + PatentApp.escapeHtml(title) + '</div>' +
    '<div class="toast-msg">' + PatentApp.escapeHtml(msg) + '</div>';
  container.appendChild(toast);
  setTimeout(function () {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3000);
};

// === 标注开关 ===
// v5.13.1 修复：删除 PatentApp.handleAnnotationToggle 函数
// 原因：annotation-engine.js 已在 bindEvents() 中绑定 click → togglePanel()，
//       app.js 重复绑定会导致 togglePanel 被调用两次（状态相互抵消），面板无法显示。
// 修复方案：完全交由 annotation-engine.js 处理，app.js 不再绑定 click 事件。

// === 角色切换 ===
PatentApp.handleRoleSwitch = function (e) {
  var btn = e.target.closest('[data-role]');
  if (!btn) return;
  var role = btn.getAttribute('data-role');
  PatentApp.currentRole = role;
  document.querySelectorAll('[data-role]').forEach(function (b) { b.classList.remove('active'); });
  btn.classList.add('active');
  var roleMap = {
    ai: { name: '王思远', avatar: 'WS', role: 'AI工程师' },
    ipr: { name: '张明远', avatar: 'ZM', role: 'IPR' },
    agent: { name: '李书白', avatar: 'LS', role: '代理师' }
  };
  var u = roleMap[role] || roleMap.ipr;
  PatentApp.currentUser = u;
  var avatar = document.getElementById('userAvatar');
  var name = document.getElementById('userName');
  if (avatar) avatar.textContent = u.avatar;
  if (name) name.textContent = u.name;
  PatentApp.showToast('info', '角色已切换', '当前角色：' + u.role);
};

// === SPA 路由 ===
PatentApp.handleRoute = function () {
  var hash = location.hash.replace(/^#/, '') || PatentApp.DEFAULT_ROUTE;
  var pageId = null;
  var detailId = null;

  // 路由匹配
  if (hash === '/aigc-patents') {
    pageId = 'P01';
  } else if (hash === '/aigc-patents/form') {
    pageId = 'P03';
  } else {
    var m = hash.match(/^\/aigc-patents\/(.+)$/);
    if (m) {
      pageId = 'P02';
      detailId = m[1];
    } else {
      // 未知路由回退首页
      pageId = 'P01';
      hash = PatentApp.DEFAULT_ROUTE;
    }
  }

  // 切换页面
  document.querySelectorAll('[data-page-id]').forEach(function (page) {
    var isActive = page.getAttribute('data-page-id') === pageId;
    page.classList.toggle('active', isActive);
  });

  // 同步 nav 激活态
  document.querySelectorAll('.nav-link').forEach(function (link) {
    var linkHash = (link.getAttribute('href') || '').replace(/^#/, '');
    var isActive = false;
    if (pageId === 'P01' && linkHash === '/aigc-patents') isActive = true;
    else if (pageId === 'P03' && linkHash === '/aigc-patents/form') isActive = true;
    else if (pageId === 'P02' && linkHash === '/aigc-patents') isActive = true; // 详情页激活列表 nav
    link.classList.toggle('active', isActive);
  });

  // 面包屑
  var bc = document.getElementById('breadcrumbCurrent');
  if (bc) {
    if (pageId === 'P01') bc.textContent = 'AIGC 专利列表';
    else if (pageId === 'P03') bc.textContent = '代码上传解析表单';
    else if (pageId === 'P02' && detailId) {
      var p = PatentApp.PATENTS.find(function (x) { return x.id === detailId; });
      bc.textContent = '专利详情 / ' + (p ? p.patent_no : detailId);
    }
  }

  // 按页面渲染
  if (pageId === 'P01') PatentApp.renderPatentList();
  else if (pageId === 'P02' && detailId) PatentApp.renderDetail(detailId);
  // P03 为静态表单，无需动态渲染

  // 通知标注引擎
  if (window.__ANNOTATION_ENGINE__ && typeof window.__ANNOTATION_ENGINE__.refresh === 'function') {
    setTimeout(function () { window.__ANNOTATION_ENGINE__.refresh(); }, 50);
  }

  // 滚动到顶
  var main = document.querySelector('.main');
  if (main) main.scrollTop = 0;
};

// === 初始化 ===
PatentApp.init = function () {
  console.log('[INFO] PatentApp initializing...');

  // P01 搜索按钮
  var searchBtn = document.getElementById('searchBtn');
  if (searchBtn) searchBtn.addEventListener('click', PatentApp.handleSearch);
  var resetBtn = document.getElementById('resetBtn');
  if (resetBtn) resetBtn.addEventListener('click', PatentApp.handleReset);

  // P01 表格事件代理
  var tbody = document.getElementById('patentTbody');
  if (tbody) tbody.addEventListener('click', PatentApp.handleTableClick);

  // P01 分页
  var pagination = document.getElementById('paginationControls');
  if (pagination) pagination.addEventListener('click', PatentApp.handlePaginationClick);

  // P01 新增专利按钮
  var addBtn = document.getElementById('addPatentBtn');
  if (addBtn) addBtn.addEventListener('click', function () {
    location.hash = '#/aigc-patents/form';
  });

  // P02 详情操作
  var detailActions = document.getElementById('detailActions');
  if (detailActions) detailActions.addEventListener('click', PatentApp.handleDetailAction);

  // P03 表单
  var formOwnership = document.getElementById('formOwnership');
  if (formOwnership) formOwnership.addEventListener('change', PatentApp.handleFormOwnershipChange);
  var formSubmit = document.getElementById('formSubmit');
  if (formSubmit) formSubmit.addEventListener('click', PatentApp.handleFormSubmit);
  var formCancel = document.getElementById('formCancel');
  if (formCancel) formCancel.addEventListener('click', PatentApp.handleFormCancel);

  // 弹窗
  var modalClose = document.getElementById('modalClose');
  if (modalClose) modalClose.addEventListener('click', PatentApp.closeModal);
  var modalMask = document.getElementById('modalMask');
  if (modalMask) modalMask.addEventListener('click', function (e) {
    if (e.target === modalMask) PatentApp.closeModal();
  });
  var modalFooter = document.getElementById('modalFooter');
  if (modalFooter) modalFooter.addEventListener('click', PatentApp.handleModalAction);

  // ESC 关闭弹窗
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var mask = document.getElementById('modalMask');
      if (mask && mask.classList.contains('show')) PatentApp.closeModal();
    }
  });

  // 标注开关（v5.13.1 修复：删除 click 绑定，由 annotation-engine.js 统一处理）

  // 角色切换
  var roleSwitch = document.querySelector('.role-switch');
  if (roleSwitch) roleSwitch.addEventListener('click', PatentApp.handleRoleSwitch);

  // SPA 路由
  window.addEventListener('hashchange', PatentApp.handleRoute);

  // 默认路由
  if (!location.hash) location.hash = PatentApp.DEFAULT_ROUTE;
  PatentApp.handleRoute();

  console.log('[OK] PatentApp ready');
};

// === DOMContentLoaded ===
document.addEventListener('DOMContentLoaded', PatentApp.init);

// === 标注数据（L1 / L2 / L3）===
window.__ANNOTATION_DATA__ = {
  P01: {
    L1: {
      summary: 'AIGC 专利列表页，分页展示企业全部算法专利',
      entry: '侧边栏"AIGC 专利"菜单',
      precondition: '已登录且拥有 aigc-patent:read 权限',
      data_entity: 'aigc-patent',
      business_rules: [
        'AI 工程师仅查看自己提交的专利',
        'IPR 与代理师可见全部',
        '支持按专利号、算法类型、权属类型、状态搜索'
      ],
      test_data: '12 条专利 Mock 数据，覆盖 4 种算法类型 + 5 种状态'
    },
    L2: [
      { id: 'R-001', zone: '搜索区', description: '顶部搜索表单，含专利号、算法类型、权属类型、开发者、申请人、状态下拉与搜索按钮' },
      { id: 'R-002', zone: '操作栏', description: '含新增专利按钮，点击跳转到代码上传解析表单' },
      { id: 'R-003', zone: '数据表格', description: '展示专利列表，算法类型/权属类型/状态使用状态标签，含查看与 AI 解析行内操作' },
      { id: 'R-004', zone: '分页区', description: '底部标准分页组件，每页 8 条' }
    ],
    L3: [
      {
        id: 'C-001', element: '搜索按钮', zone: 'R-001',
        function: '触发搜索', trigger: 'click',
        condition: '无', response: '表格刷新为搜索结果',
        state: '搜索条件已应用', exception: '搜索条件为空时展示全部'
      },
      {
        id: 'C-002', element: '新增专利按钮', zone: 'R-002',
        function: '打开新增表单', trigger: 'click',
        condition: '用户拥有 aigc-patent:create 权限',
        response: '跳转到 /aigc-patents/form',
        state: '表单页面加载', exception: '无权限时按钮隐藏'
      },
      {
        id: 'C-003', element: 'AI 解析按钮', zone: 'R-003',
        function: '触发代码解析', trigger: 'click',
        condition: '状态为已提交',
        response: '异步任务启动，状态置为解析中',
        state: '行状态更新', exception: '非已提交状态按钮禁用'
      },
      {
        id: 'C-004', element: '查看按钮', zone: 'R-003',
        function: '跳转专利详情', trigger: 'click',
        condition: '用户拥有 aigc-patent:read 权限',
        response: '跳转到 /aigc-patents/:id',
        state: '详情页加载', exception: '无'
      }
    ]
  },
  P02: {
    L1: {
      summary: '专利详情页，展示代码解析结果与权属判定',
      entry: '专利列表点击"查看"',
      precondition: '已登录且拥有 aigc-patent:read 权限',
      data_entity: 'aigc-patent',
      business_rules: [
        '状态流转：已提交 → 解析中 → 分析中 → 已申请 → 已授权',
        '纯机器生成内容不可作为专利发明人',
        '开源协议冲突时禁止提交申请'
      ],
      test_data: '1 条专利详情 Mock 数据，含解析结果与 FTO 比对'
    },
    L2: [
      { id: 'R-001', zone: '详情头部', description: '描述列表展示专利号、算法类型、权属类型、开发者、申请人、状态' },
      { id: 'R-002', zone: '代码资产区', description: '展示上传的代码与算法流程图（mermaid 节点）' },
      { id: 'R-003', zone: '解析结果区', description: '展示创新逻辑挖掘、FTO 比对、开源协议冲突' },
      { id: 'R-004', zone: '操作按钮区', description: '含触发分析、审核权属、标记授权按钮（按状态显示）' }
    ],
    L3: [
      {
        id: 'C-001', element: '触发分析按钮', zone: 'R-004',
        function: '触发 FTO 与权属分析', trigger: 'click',
        condition: '状态为解析中',
        response: '状态更新为分析中', state: '按钮组刷新',
        exception: '非解析中状态按钮隐藏'
      },
      {
        id: 'C-002', element: '审核权属按钮', zone: 'R-004',
        function: '审核权属判定', trigger: 'click',
        condition: '角色为 IPR 且状态为分析中',
        response: '弹出权属确认弹窗', state: '弹窗显示',
        exception: '非分析中状态按钮隐藏'
      },
      {
        id: 'C-003', element: '标记授权按钮', zone: 'R-004',
        function: '标记专利已授权', trigger: 'click',
        condition: '状态为已申请',
        response: '状态置为已授权', state: '按钮组刷新',
        exception: '非已申请状态按钮隐藏'
      }
    ]
  },
  P03: {
    L1: {
      summary: '代码上传解析表单页，AI 工程师提交算法专利',
      entry: '专利列表点击"新增专利"',
      precondition: '已登录且拥有 aigc-patent:create 权限',
      data_entity: 'aigc-patent',
      business_rules: [
        '专利号、算法类型、权属类型、开发者、申请人为必填',
        '同一算法不可重复申请专利',
        '纯机器生成内容需提示权属合规风险'
      ],
      test_data: '空表单或回填的算法专利数据'
    },
    L2: [
      { id: 'R-001', zone: '表单区', description: '表单含专利号、算法类型、代码资产、权属类型、开发者、申请人字段' },
      { id: 'R-002', zone: '操作按钮区', description: '含提交、取消按钮' }
    ],
    L3: [
      {
        id: 'C-001', element: '提交按钮', zone: 'R-002',
        function: '提交算法专利', trigger: 'click',
        condition: '表单校验通过',
        response: '保存数据并跳转 /aigc-patents',
        state: '列表页刷新', exception: '同一算法重复申请时提示错误'
      },
      {
        id: 'C-002', element: '权属类型下拉', zone: 'R-001',
        function: '选择权属类型', trigger: 'change',
        condition: '无',
        response: '选择纯机器生成时弹出合规风险提示',
        state: '类型已选择', exception: '无'
      },
      {
        id: 'C-003', element: '取消按钮', zone: 'R-002',
        function: '取消编辑', trigger: 'click',
        condition: '无',
        response: '返回上一页', state: '不保存任何修改',
        exception: '无'
      }
    ]
  }
};
