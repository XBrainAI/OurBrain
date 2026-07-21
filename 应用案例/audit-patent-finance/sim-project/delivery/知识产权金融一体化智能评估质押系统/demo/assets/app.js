/* ========================================================================
   Patent Finance Workbench · 业务逻辑
   - 命名空间：使用 pfApp（避免与标注引擎的 const app/state 冲突）
   - SPA hash 路由：hashchange + [data-page-id] hidden 切换
   - 业务约束：贷款金额 <= 评估价值 × 70% / 已质押专利不可重复
   ======================================================================== */
(function () {
  'use strict';

  // ===== 命名空间（避免与标注引擎全局变量冲突） =====
  var pfApp = {};

  // ===== 路由表 =====
  var ROUTES = {
    '/pledge-cases': 'P01',
    '/pledge-cases/form': 'P03'
  };
  var DEFAULT_ROUTE = '/pledge-cases';

  // ===== 状态映射 =====
  var STATUS_MAP = {
    applied:     { label: '已申请',   cls: 'status-applied' },
    assessing:   { label: '评估中',   cls: 'status-assessing' },
    approved:    { label: '已审批',   cls: 'status-approved' },
    registered:  { label: '已登记',   cls: 'status-registered' },
    disbursed:   { label: '已放款',   cls: 'status-disbursed' },
    repaid:      { label: '已还款',   cls: 'status-repaid' }
  };

  // ===== 状态流转顺序 =====
  var STATUS_FLOW = ['applied', 'assessing', 'approved', 'registered', 'disbursed', 'repaid'];

  // ===== Mock 数据：12 条案件，覆盖 4 家银行 × 6 种状态 =====
  pfApp.cases = [
    {
      caseNo: 'PAT-2026-0001', applicant: '广州奥凯信息科技有限公司', bank: '工商银行',
      assessedValue: 1420, loanAmount: 980, status: 'assessing', applyTime: '2026-07-15 09:23',
      operator: '林秋月（评估师）',
      patents: [
        { no: 'ZL202310123456.7', name: '基于知识图谱的专利价值评估方法', type: '发明专利', remain: 14, value: 520 },
        { no: 'ZL202210987654.3', name: '一种专利风险预警系统', type: '发明专利', remain: 12, value: 380 },
        { no: 'ZL202310888888.8', name: '知识产权质押融资对接平台', type: '发明专利', remain: 15, value: 320 },
        { no: 'ZL202320555666.2', name: '一种证书防伪印刷结构', type: '实用新型', remain: 8, value: 200 }
      ],
      matrix: { legal: 88, industry: 82, market: 75, revenue: 79 },
      subsidy: '粤府 2024-12号 · 2%'
    },
    {
      caseNo: 'PAT-2026-0002', applicant: '深圳锐拓半导体技术有限公司', bank: '建设银行',
      assessedValue: 2350, loanAmount: 1600, status: 'disbursed', applyTime: '2026-06-08 14:11',
      operator: '王志远（银行风控）',
      patents: [
        { no: 'ZL202110456789.1', name: '一种芯片散热封装结构', type: '发明专利', remain: 11, value: 1200 },
        { no: 'ZL202210666777.4', name: '半导体晶圆清洗工艺', type: '发明专利', remain: 13, value: 1150 }
      ],
      matrix: { legal: 92, industry: 90, market: 88, revenue: 85 },
      subsidy: '粤府 2024-12号 · 2%'
    },
    {
      caseNo: 'PAT-2026-0003', applicant: '佛山顺德智造装备有限公司', bank: '招商银行',
      assessedValue: 860, loanAmount: 600, status: 'approved', applyTime: '2026-07-02 10:45',
      operator: '陈秋燕（银行风控）',
      patents: [
        { no: 'ZL202310222333.4', name: '一种工业机器人抓取装置', type: '发明专利', remain: 15, value: 480 },
        { no: 'ZL202320111222.5', name: '自动化产线传送机构', type: '实用新型', remain: 9, value: 380 }
      ],
      matrix: { legal: 80, industry: 78, market: 70, revenue: 72 },
      subsidy: '粤府 2024-12号 · 2%'
    },
    {
      caseNo: 'PAT-2026-0004', applicant: '东莞盛源新材料股份有限公司', bank: '广州银行',
      assessedValue: 1880, loanAmount: 1300, status: 'registered', applyTime: '2026-06-22 16:30',
      operator: '李明哲（银行风控）',
      patents: [
        { no: 'ZL202110999888.7', name: '一种高强度复合薄膜材料', type: '发明专利', remain: 10, value: 980 },
        { no: 'ZL202210777666.2', name: '可降解塑料配方', type: '发明专利', remain: 12, value: 900 }
      ],
      matrix: { legal: 85, industry: 84, market: 80, revenue: 76 },
      subsidy: '粤府 2024-12号 · 2%'
    },
    {
      caseNo: 'PAT-2026-0005', applicant: '珠海横琴生物医药研究有限公司', bank: '工商银行',
      assessedValue: 3200, loanAmount: 2240, status: 'repaid', applyTime: '2025-08-12 09:00',
      operator: '赵文静（银行风控）',
      patents: [
        { no: 'ZL201910333444.5', name: '一种靶向药物递送系统', type: '发明专利', remain: 7, value: 1800 },
        { no: 'ZL202010555666.7', name: '药物缓释载体', type: '发明专利', remain: 9, value: 1400 }
      ],
      matrix: { legal: 95, industry: 92, market: 90, revenue: 88 },
      subsidy: '粤府 2024-08号 · 2%'
    },
    {
      caseNo: 'PAT-2026-0006', applicant: '中山市华芯电子科技有限公司', bank: '建设银行',
      assessedValue: 720, loanAmount: 0, status: 'applied', applyTime: '2026-07-19 11:25',
      operator: '—',
      patents: [
        { no: 'ZL202310888999.0', name: '一种低功耗芯片设计', type: '发明专利', remain: 15, value: 420 },
        { no: 'ZL202320444555.6', name: '芯片测试夹具', type: '实用新型', remain: 10, value: 300 }
      ],
      matrix: { legal: 0, industry: 0, market: 0, revenue: 0 },
      subsidy: '待评估'
    },
    {
      caseNo: 'PAT-2026-0007', applicant: '广州市橙心农业科技有限公司', bank: '招商银行',
      assessedValue: 540, loanAmount: 370, status: 'assessing', applyTime: '2026-07-18 15:42',
      operator: '林秋月（评估师）',
      patents: [
        { no: 'ZL202210111222.3', name: '一种智能灌溉系统', type: '发明专利', remain: 12, value: 320 }
      ],
      matrix: { legal: 75, industry: 70, market: 65, revenue: 60 },
      subsidy: '粤府 2024-12号 · 2%'
    },
    {
      caseNo: 'PAT-2026-0008', applicant: '惠州大亚湾石化装备有限公司', bank: '广州银行',
      assessedValue: 1650, loanAmount: 1150, status: 'approved', applyTime: '2026-07-05 13:18',
      operator: '陈秋燕（银行风控）',
      patents: [
        { no: 'ZL202110666555.2', name: '一种高效换热器结构', type: '发明专利', remain: 11, value: 850 },
        { no: 'ZL202210333222.1', name: '防腐涂层配方', type: '发明专利', remain: 13, value: 800 }
      ],
      matrix: { legal: 82, industry: 80, market: 75, revenue: 73 },
      subsidy: '粤府 2024-12号 · 2%'
    },
    {
      caseNo: 'PAT-2026-0009', applicant: '江门市新会纺织机械有限公司', bank: '工商银行',
      assessedValue: 980, loanAmount: 680, status: 'registered', applyTime: '2026-06-28 10:00',
      operator: '李明哲（银行风控）',
      patents: [
        { no: 'ZL202110222333.6', name: '一种自动络筒机', type: '发明专利', remain: 10, value: 580 },
        { no: 'ZL202320666777.8', name: '纱线张力调节装置', type: '实用新型', remain: 8, value: 400 }
      ],
      matrix: { legal: 78, industry: 75, market: 72, revenue: 70 },
      subsidy: '粤府 2024-12号 · 2%'
    },
    {
      caseNo: 'PAT-2026-0010', applicant: '肇庆高新区新能源科技有限公司', bank: '建设银行',
      assessedValue: 4200, loanAmount: 2940, status: 'disbursed', applyTime: '2026-06-15 09:35',
      operator: '王志远（银行风控）',
      patents: [
        { no: 'ZL202110444555.6', name: '一种锂离子电池正极材料', type: '发明专利', remain: 12, value: 2200 },
        { no: 'ZL202210999888.7', name: '电池热管理结构', type: '发明专利', remain: 13, value: 2000 }
      ],
      matrix: { legal: 90, industry: 92, market: 88, revenue: 86 },
      subsidy: '粤府 2024-12号 · 2%'
    },
    {
      caseNo: 'PAT-2026-0011', applicant: '汕头市澄海玩具研究院', bank: '招商银行',
      assessedValue: 460, loanAmount: 0, status: 'applied', applyTime: '2026-07-20 08:50',
      operator: '—',
      patents: [
        { no: 'ZL202310777888.9', name: '一种可编程智能玩具', type: '发明专利', remain: 15, value: 460 }
      ],
      matrix: { legal: 0, industry: 0, market: 0, revenue: 0 },
      subsidy: '待评估'
    },
    {
      caseNo: 'PAT-2026-0012', applicant: '湛江市东海岛海洋装备有限公司', bank: '广州银行',
      assessedValue: 1980, loanAmount: 1380, status: 'assessing', applyTime: '2026-07-16 14:20',
      operator: '林秋月（评估师）',
      patents: [
        { no: 'ZL202110888777.6', name: '一种海上风电基础结构', type: '发明专利', remain: 11, value: 1100 },
        { no: 'ZL202210666555.4', name: '海洋平台防腐方法', type: '发明专利', remain: 13, value: 880 }
      ],
      matrix: { legal: 84, industry: 82, market: 78, revenue: 75 },
      subsidy: '粤府 2024-12号 · 2%'
    }
  ];

  // 当前查看的案件索引（P02）
  pfApp.currentCaseIdx = 0;
  // 搜索过滤后的案件
  pfApp.filteredCases = pfApp.cases.slice();
  // 当前角色
  pfApp.currentRole = 'financing-manager';
  pfApp.roles = ['financing-manager', 'bank-risk', 'assessor'];
  pfApp.roleLabels = { 'financing-manager': '企业融资经理', 'bank-risk': '银行风控', 'assessor': '评估师' };
  // 分页
  pfApp.pageSize = 10;
  pfApp.currentPage = 1;

  // ===== 工具函数 =====
  function $(id) { return document.getElementById(id); }
  function fmtMoney(v) { return v.toLocaleString('zh-CN'); }

  function log(msg, level) {
    // 控制台输出使用 ASCII 标记，禁用 emoji
    var tag = '[INFO]';
    if (level === 'ok') tag = '[OK]';
    else if (level === 'warn') tag = '[WARN]';
    else if (level === 'fail') tag = '[FAIL]';
    else if (level === 'summary') tag = '[SUMMARY]';
    if (window.console && console.log) {
      try { console.log(tag + ' ' + msg); } catch (e) {}
    }
  }

  // ===== 路由切换 =====
  function getPageIdFromHash(hash) {
    hash = (hash || '').replace(/^#/, '');
    if (!hash) return ROUTES[DEFAULT_ROUTE];
    if (ROUTES[hash]) return ROUTES[hash];
    // 形如 /pledge-cases/PAT-2026-0001 → P02
    if (/^\/pledge-cases\/[^/]+$/.test(hash) && hash.indexOf('/form') === -1) {
      var seg = hash.split('/').pop();
      // 如果是案件编号，定位案件
      var idx = pfApp.cases.findIndex(function (c) { return c.caseNo === seg; });
      if (idx >= 0) {
        pfApp.currentCaseIdx = idx;
        return 'P02';
      }
      return 'P02';
    }
    // 未知 hash 回退首页
    return ROUTES[DEFAULT_ROUTE];
  }

  function handleRoute() {
    var hash = location.hash.replace(/^#/, '') || DEFAULT_ROUTE;
    var pageId = getPageIdFromHash(hash);

    // 切换页面 hidden 属性
    document.querySelectorAll('[data-page-id]').forEach(function (page) {
      var pid = page.getAttribute('data-page-id');
      page.hidden = (pid !== pageId);
    });

    // 同步 nav-link 激活态
    document.querySelectorAll('.nav-link').forEach(function (link) {
      var linkHash = (link.getAttribute('href') || '').replace(/^#/, '');
      // P02 任意案件详情都高亮 02
      var linkTarget = link.getAttribute('data-page-target');
      var isActive = false;
      if (linkTarget === pageId) {
        isActive = true;
      } else if (pageId === 'P02' && linkTarget === 'P02') {
        isActive = true;
      }
      link.classList.toggle('active', isActive);
    });

    // 渲染对应页面
    if (pageId === 'P01') {
      renderCaseTable();
    } else if (pageId === 'P02') {
      renderDetail();
    } else if (pageId === 'P03') {
      resetForm();
    }

    // 通知标注引擎刷新
    if (window.__ANNOTATION_ENGINE__) {
      try { window.__ANNOTATION_ENGINE__.refresh(); } catch (e) {}
    }

    // 更新底部状态
    var footMeta = $('footMeta');
    if (footMeta) footMeta.textContent = '当前页面 ' + pageId;
  }

  // ===== P01: 渲染案件表格 =====
  function renderCaseTable() {
    var tbody = $('caseTableBody');
    if (!tbody) return;
    var cases = pfApp.filteredCases;
    var start = (pfApp.currentPage - 1) * pfApp.pageSize;
    var end = start + pfApp.pageSize;
    var pageCases = cases.slice(start, end);

    if (pageCases.length === 0) {
      tbody.innerHTML = '';
      $('emptyState').hidden = false;
    } else {
      $('emptyState').hidden = true;
      tbody.innerHTML = pageCases.map(function (c) {
        var st = STATUS_MAP[c.status] || STATUS_MAP.applied;
        return ''
          + '<tr data-case-no="' + c.caseNo + '">'
          + '<td class="col-check"><input type="checkbox" class="row-check" data-case-no="' + c.caseNo + '" aria-label="选择 ' + c.caseNo + '"></td>'
          + '<td class="col-no"><span class="case-no-cell" data-case-no="' + c.caseNo + '">' + c.caseNo + '</span></td>'
          + '<td class="col-app">' + c.applicant + '</td>'
          + '<td class="col-bank">' + c.bank + '</td>'
          + '<td class="col-val">¥ ' + fmtMoney(c.assessedValue) + ' 万</td>'
          + '<td class="col-loan">' + (c.loanAmount > 0 ? '¥ ' + fmtMoney(c.loanAmount) + ' 万' : '—') + '</td>'
          + '<td class="col-status"><span class="status-tag ' + st.cls + '">' + st.label + '</span></td>'
          + '<td class="col-action">'
          +   '<button type="button" class="btn btn-ghost btn-sm" data-action="view" data-case-no="' + c.caseNo + '">查看</button> '
          +   '<button type="button" class="btn btn-ghost btn-sm" data-action="export-row" data-case-no="' + c.caseNo + '">导出</button>'
          + '</td>'
          + '</tr>';
      }).join('');
    }

    // 更新计数与分页
    $('totalCount').textContent = cases.length;
    var totalPages = Math.max(1, Math.ceil(cases.length / pfApp.pageSize));
    $('pageTotal').textContent = totalPages;
    $('pageCurrent').textContent = pfApp.currentPage;
    $('btnPrev').disabled = pfApp.currentPage <= 1;
    $('btnNext').disabled = pfApp.currentPage >= totalPages;
  }

  // ===== P02: 渲染案件详情 =====
  function renderDetail() {
    var c = pfApp.cases[pfApp.currentCaseIdx];
    if (!c) return;

    $('detailCaseNo').textContent = c.caseNo;
    $('dCaseNo').textContent = c.caseNo;
    $('dApplicant').textContent = c.applicant;
    $('dBank').textContent = c.bank;
    var st = STATUS_MAP[c.status] || STATUS_MAP.applied;
    var dStatus = $('dStatus');
    dStatus.textContent = st.label;
    dStatus.className = 'status-tag ' + st.cls;
    $('dApplyTime').textContent = c.applyTime;
    $('dOperator').textContent = c.operator;
    $('dAssessedValue').textContent = fmtMoney(c.assessedValue);
    $('dLoanAmount').textContent = fmtMoney(c.loanAmount);
    var ratio = c.assessedValue > 0 ? (c.loanAmount / c.assessedValue * 100) : 0;
    $('dRatio').textContent = ratio.toFixed(1);
    var bar = $('dRatioBar');
    bar.style.width = Math.min(100, ratio) + '%';
    bar.className = 'bar-fill' + (ratio > 70 ? ' bar-fill--danger' : '');
    $('dSubsidy').textContent = c.subsidy;

    // 质押专利表
    $('patentTableBody').innerHTML = c.patents.map(function (p) {
      return ''
        + '<tr>'
        + '<td>' + p.no + '</td>'
        + '<td>' + p.name + '</td>'
        + '<td>' + p.type + '</td>'
        + '<td>' + p.remain + ' 年</td>'
        + '<td>¥ ' + fmtMoney(p.value) + ' 万</td>'
        + '</tr>';
    }).join('');

    // 四维估值矩阵（标志性元素）
    var matrixGrid = $('matrixGrid');
    if (matrixGrid) {
      var dims = [
        { key: 'legal',    name: '法律', en: 'LEGAL',    weight: 30, basis: '剩余保护期 14 年 · 无无效诉讼 · 权属清晰' },
        { key: 'industry', name: '产业', en: 'INDUSTRY', weight: 25, basis: 'AI 估值行业景气度 82 · 产业链上游 · 技术替代风险低' },
        { key: 'market',   name: '市场', en: 'MARKET',   weight: 25, basis: '同族布局 3 国 · 已实施许可 2 项 · 可比案例 5 单' },
        { key: 'revenue',  name: '营收', en: 'REVENUE',  weight: 20, basis: '近三年专利产品营收 4,200 万 · 收益贡献率 18%' }
      ];
      matrixGrid.innerHTML = dims.map(function (d) {
        var score = c.matrix[d.key] || 0;
        return ''
          + '<div class="matrix-quad matrix-' + d.key + '">'
          +   '<div class="matrix-head">'
          +     '<span class="matrix-name">' + d.name + '</span>'
          +     '<span class="matrix-name-en">' + d.en + '</span>'
          +   '</div>'
          +   '<div>'
          +     '<span class="matrix-score">' + score + '</span>'
          +     '<span class="matrix-score-max"> / 100</span>'
          +   '</div>'
          +   '<div class="matrix-bar"><div class="matrix-bar-fill" style="width: ' + score + '%"></div></div>'
          +   '<div class="matrix-basis">'
          +     '<span class="matrix-weight">权重 ' + d.weight + '%</span> '
          +     d.basis
          +   '</div>'
          + '</div>';
      }).join('');
    }

    // 时间轴
    var tl = $('timelineList');
    if (tl) {
      var currentIdx = STATUS_FLOW.indexOf(c.status);
      tl.innerHTML = STATUS_FLOW.map(function (s, i) {
        var nodeCls = i < currentIdx ? 'done' : (i === currentIdx ? 'current' : 'pending');
        var stInfo = STATUS_MAP[s];
        var time = i <= currentIdx ? (c.applyTime) : '—';
        return ''
          + '<li class="timeline-node ' + nodeCls + '">'
          +   '<div class="timeline-dot">' + (i < currentIdx ? '✓' : (i + 1)) + '</div>'
          +   '<div class="timeline-status">' + stInfo.label + '</div>'
          +   '<div class="timeline-time">' + time + '</div>'
          + '</li>';
      }).join('');
    }

    // 按状态控制操作按钮：禁用而非隐藏，确保 L3 锚点（data-element-id + .l3-dot）始终可见
    // 符合 v5.2.3 动态渲染元件的 L3 锚定契约 — 锚定率需 100%
    var btnAssess = $('btnAssess');
    var btnApprove = $('btnApprove');
    var btnDisburse = $('btnDisburse');
    if (btnAssess) {
      var assessOk = (c.status === 'applied');
      btnAssess.disabled = !assessOk;
      btnAssess.title = assessOk ? '启动 AI 估值' : '仅「已申请」状态可启动评估';
    }
    if (btnApprove) {
      var approveOk = (c.status === 'assessing');
      btnApprove.disabled = !approveOk;
      btnApprove.title = approveOk ? '审批质押案件' : '仅「评估中」状态可审批';
    }
    if (btnDisburse) {
      var disburseOk = (c.status === 'registered');
      btnDisburse.disabled = !disburseOk;
      btnDisburse.title = disburseOk ? '执行放款' : '仅「已登记」状态可放款';
    }
    // 确保 data-element-id 包裹层始终可见（保留 L3 锚点）
    document.querySelectorAll('[data-element-id]').forEach(function (wrap) {
      wrap.style.display = '';
    });
  }

  // ===== P03: 重置表单 =====
  function resetForm() {
    if (!$('pledgeForm')) return;
    $('pledgeForm').reset();
    var nextNo = 'PAT-2026-' + String(pfApp.cases.length + 1).padStart(4, '0');
    $('fCaseNo').value = nextNo;
    $('fAssessedValue').value = '';
    $('ratioHint').textContent = '贷款金额不超过评估价值的 70%。';
    $('ratioHint').className = 'form-hint form-hint--warn';
    $('fLoanAmount').classList.remove('error');
  }

  // ===== 搜索 =====
  function doSearch() {
    var caseNo = ($('sCaseNo').value || '').trim().toLowerCase();
    var applicant = ($('sApplicant').value || '').trim().toLowerCase();
    var bank = $('sBank').value;
    var status = $('sStatus').value;

    pfApp.filteredCases = pfApp.cases.filter(function (c) {
      if (caseNo && c.caseNo.toLowerCase().indexOf(caseNo) === -1) return false;
      if (applicant && c.applicant.toLowerCase().indexOf(applicant) === -1) return false;
      if (bank && c.bank !== bank) return false;
      if (status && c.status !== status) return false;
      return true;
    });
    pfApp.currentPage = 1;
    renderCaseTable();
    showToast('搜索完成，共 ' + pfApp.filteredCases.length + ' 条结果', 'success');
    log('搜索完成: ' + pfApp.filteredCases.length + ' 条', 'ok');
  }

  function doReset() {
    $('sCaseNo').value = '';
    $('sApplicant').value = '';
    $('sBank').value = '';
    $('sStatus').value = '';
    pfApp.filteredCases = pfApp.cases.slice();
    pfApp.currentPage = 1;
    renderCaseTable();
    showToast('已重置搜索条件', 'success');
    log('搜索条件已重置', 'ok');
  }

  // ===== 弹窗 =====
  pfApp.modalCallback = null;

  function openModal(opts) {
    var mask = $('modalMask');
    $('modalTitle').textContent = opts.title || '提示';
    $('modalBody').innerHTML = opts.body || '';
    var foot = $('modalFoot');
    if (opts.buttons && opts.buttons.length) {
      foot.innerHTML = opts.buttons.map(function (b, i) {
        return '<button type="button" class="btn ' + (b.cls || 'btn-ghost') + '" data-modal-btn="' + i + '">' + b.text + '</button>';
      }).join('');
      foot.querySelectorAll('[data-modal-btn]').forEach(function (btn) {
        var idx = parseInt(btn.getAttribute('data-modal-btn'), 10);
        btn.addEventListener('click', function () {
          var b = opts.buttons[idx];
          if (b.onClick) b.onClick();
        });
      });
    } else {
      foot.innerHTML = '<button type="button" class="btn btn-primary" data-modal-close>确定</button>';
      foot.querySelector('[data-modal-close]').addEventListener('click', closeModal);
    }
    pfApp.modalCallback = opts.onClose || null;
    mask.hidden = false;
    log('弹窗打开: ' + opts.title, 'info');
  }

  function closeModal() {
    var mask = $('modalMask');
    mask.hidden = true;
    if (pfApp.modalCallback) {
      try { pfApp.modalCallback(); } catch (e) {}
      pfApp.modalCallback = null;
    }
    log('弹窗关闭', 'info');
  }

  // ===== Toast =====
  var toastTimer = null;
  function showToast(msg, level) {
    var toast = $('toast');
    toast.textContent = msg;
    toast.className = 'toast' + (level ? ' toast--' + level : '');
    toast.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 2400);
  }

  // ===== 业务操作 =====
  function startAssess() {
    var c = pfApp.cases[pfApp.currentCaseIdx];
    if (c.status !== 'applied') {
      showToast('当前状态不可启动评估', 'warn');
      return;
    }
    openModal({
      title: '启动 AI 估值',
      body: ''
        + '<p>将对案件 <strong>' + c.caseNo + '</strong> 启动四维 AI 估值：</p>'
        + '<dl>'
        + '<div><dt>法律维度</dt><dd>剩余保护期 / 无效诉讼 / 权属</dd></div>'
        + '<div><dt>产业维度</dt><dd>行业景气度 / 产业链位置</dd></div>'
        + '<div><dt>市场维度</dt><dd>同族布局 / 许可实施 / 可比案例</dd></div>'
        + '<div><dt>营收维度</dt><dd>专利产品营收 / 收益贡献率</dd></div>'
        + '</dl>'
        + '<p>预计耗时 30 秒，评估完成后状态将更新为「评估中」。</p>',
      buttons: [
        { text: '取消', cls: 'btn-ghost', onClick: closeModal },
        { text: '确认启动', cls: 'btn-primary', onClick: function () {
          c.status = 'assessing';
          c.matrix = { legal: 82, industry: 78, market: 75, revenue: 72 };
          c.assessedValue = c.patents.reduce(function (s, p) { return s + p.value; }, 0);
          c.operator = '林秋月（评估师）';
          closeModal();
          renderDetail();
          showToast('AI 估值完成，状态已更新为评估中', 'success');
          log('启动评估: ' + c.caseNo, 'ok');
        } }
      ]
    });
  }

  function startApprove() {
    var c = pfApp.cases[pfApp.currentCaseIdx];
    if (c.status !== 'assessing') {
      showToast('当前状态不可审批', 'warn');
      return;
    }
    openModal({
      title: '审批质押案件',
      body: ''
        + '<p>案件 <strong>' + c.caseNo + '</strong>（' + c.applicant + '）当前评估价值 ¥ ' + fmtMoney(c.assessedValue) + ' 万，'
        + '申请贷款金额 ¥ ' + fmtMoney(c.loanAmount) + ' 万，质押率 ' + (c.loanAmount / c.assessedValue * 100).toFixed(1) + '%。</p>'
        + '<p>请输入审批意见：</p>'
        + '<textarea id="approveOpinion" placeholder="如：评估依据充分，质押率合规，同意放款。"></textarea>',
      buttons: [
        { text: '驳回', cls: 'btn-danger', onClick: function () {
          closeModal();
          showToast('案件已驳回', 'warn');
          log('审批驳回: ' + c.caseNo, 'warn');
        } },
        { text: '取消', cls: 'btn-ghost', onClick: closeModal },
        { text: '同意审批', cls: 'btn-primary', onClick: function () {
          c.status = 'approved';
          c.operator = '陈秋燕（银行风控）';
          closeModal();
          renderDetail();
          showToast('审批通过，状态已更新为已审批', 'success');
          log('审批通过: ' + c.caseNo, 'ok');
        } }
      ]
    });
  }

  function startDisburse() {
    var c = pfApp.cases[pfApp.currentCaseIdx];
    if (c.status !== 'registered') {
      showToast('当前状态不可放款', 'warn');
      return;
    }
    openModal({
      title: '确认放款',
      body: ''
        + '<p>将对案件 <strong>' + c.caseNo + '</strong> 执行放款：</p>'
        + '<dl>'
        + '<div><dt>受托银行</dt><dd>' + c.bank + '</dd></div>'
        + '<div><dt>放款金额</dt><dd>¥ ' + fmtMoney(c.loanAmount) + ' 万</dd></div>'
        + '<div><dt>贴息政策</dt><dd>' + c.subsidy + '</dd></div>'
        + '</dl>'
        + '<p>放款后状态将更新为「已放款」，不可撤销。</p>',
      buttons: [
        { text: '取消', cls: 'btn-ghost', onClick: closeModal },
        { text: '确认放款', cls: 'btn-primary', onClick: function () {
          c.status = 'disbursed';
          c.operator = '王志远（银行风控）';
          closeModal();
          renderDetail();
          showToast('放款成功，状态已更新为已放款', 'success');
          log('放款成功: ' + c.caseNo, 'ok');
        } }
      ]
    });
  }

  // ===== P03: AI 估值 =====
  function aiValue() {
    var patentText = ($('fPatents').value || '').trim();
    if (!patentText) {
      showToast('请先填写质押专利清单', 'error');
      $('fPatents').classList.add('error');
      log('AI 估值失败: 专利清单为空', 'fail');
      return;
    }
    $('fPatents').classList.remove('error');
    var patents = patentText.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    // 校验重复质押
    var pledgedSet = {};
    pfApp.cases.forEach(function (c) {
      if (['assessing', 'approved', 'registered', 'disbursed'].indexOf(c.status) >= 0) {
        c.patents.forEach(function (p) { pledgedSet[p.no] = c.caseNo; });
      }
    });
    var duplicates = patents.filter(function (p) { return pledgedSet[p]; });
    if (duplicates.length) {
      openModal({
        title: 'AI 估值 · 重复质押告警',
        body: ''
          + '<p>以下专利已在质押中，不可重复质押：</p>'
          + '<dl>' + duplicates.map(function (p) {
            return '<div><dt>' + p + '</dt><dd>已在案件 ' + pledgedSet[p] + ' 中质押</dd></div>';
          }).join('') + '</dl>',
        buttons: [
          { text: '知道了', cls: 'btn-primary', onClick: closeModal }
        ]
      });
      log('AI 估值: 重复质押 ' + duplicates.length + ' 件', 'fail');
      return;
    }
    // 模拟 AI 估值
    var suggested = patents.length * 380 + Math.floor(Math.random() * 100);
    $('fAssessedValue').value = suggested;
    openModal({
      title: 'AI 估值结果',
      body: ''
        + '<p>共识别 <strong>' + patents.length + '</strong> 件专利，AI 综合估值结果：</p>'
        + '<dl>'
        + '<div><dt>评估价值</dt><dd>¥ ' + fmtMoney(suggested) + ' 万</dd></div>'
        + '<div><dt>建议贷款上限</dt><dd>¥ ' + fmtMoney(Math.floor(suggested * 0.7)) + ' 万（评估价值 × 70%）</dd></div>'
        + '<div><dt>贴息匹配</dt><dd>粤府 2024-12号 · 2%</dd></div>'
        + '</dl>'
        + '<p>评估价值已自动填入表单，请据此调整贷款金额。</p>',
      buttons: [
        { text: '确认', cls: 'btn-primary', onClick: function () {
          closeModal();
          validateRatio();
        } }
      ]
    });
    log('AI 估值完成: 建议估值 ' + suggested + ' 万', 'ok');
  }

  // ===== P03: 贷款金额 vs 评估价值 70% 校验 =====
  function validateRatio() {
    var loan = parseFloat($('fLoanAmount').value) || 0;
    var assessed = parseFloat($('fAssessedValue').value) || 0;
    var hint = $('ratioHint');
    var input = $('fLoanAmount');
    if (loan <= 0 || assessed <= 0) {
      hint.textContent = '贷款金额不超过评估价值的 70%。';
      hint.className = 'form-hint form-hint--warn';
      input.classList.remove('error');
      return true;
    }
    var ratio = loan / assessed * 100;
    if (ratio > 70) {
      hint.textContent = '警告：贷款金额 / 评估价值 = ' + ratio.toFixed(1) + '%，超过 70% 上限。';
      hint.className = 'form-hint form-hint--error';
      input.classList.add('error');
      return false;
    } else {
      hint.textContent = '质押率 ' + ratio.toFixed(1) + '%，符合 ≤ 70% 约束。';
      hint.className = 'form-hint';
      input.classList.remove('error');
      return true;
    }
  }

  // ===== P03: 提交申请 =====
  function submitPledge() {
    var form = $('pledgeForm');
    var required = ['fCaseNo', 'fApplicant', 'fBank', 'fLoanAmount', 'fPatents'];
    var missing = [];
    required.forEach(function (id) {
      var el = $(id);
      if (!el.value || !el.value.trim()) {
        el.classList.add('error');
        missing.push(el);
      } else {
        el.classList.remove('error');
      }
    });
    if (missing.length) {
      showToast('请补齐必填字段：' + missing.length + ' 项', 'error');
      log('提交失败: 缺少必填字段 ' + missing.length + ' 项', 'fail');
      return;
    }
    if (!validateRatio()) {
      showToast('贷款金额超过评估价值 70% 上限', 'error');
      log('提交失败: 质押率超限', 'fail');
      return;
    }
    var newCase = {
      caseNo: $('fCaseNo').value.trim(),
      applicant: $('fApplicant').value.trim(),
      bank: $('fBank').value,
      assessedValue: parseFloat($('fAssessedValue').value) || 0,
      loanAmount: parseFloat($('fLoanAmount').value) || 0,
      status: 'applied',
      applyTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      operator: '—',
      patents: $('fPatents').value.split(/\r?\n/).filter(Boolean).map(function (no, i) {
        return { no: no, name: '专利 ' + (i + 1), type: '发明专利', remain: 12, value: 380 };
      }),
      matrix: { legal: 0, industry: 0, market: 0, revenue: 0 },
      subsidy: '待评估'
    };
    pfApp.cases.unshift(newCase);
    pfApp.filteredCases = pfApp.cases.slice();
    pfApp.currentPage = 1;
    showToast('案件 ' + newCase.caseNo + ' 已提交，状态：已申请', 'success');
    log('新案件提交: ' + newCase.caseNo, 'ok');
    // 跳转列表
    setTimeout(function () {
      location.hash = '#/pledge-cases';
    }, 600);
  }

  // ===== 切换角色 =====
  function switchRole() {
    var idx = pfApp.roles.indexOf(pfApp.currentRole);
    pfApp.currentRole = pfApp.roles[(idx + 1) % pfApp.roles.length];
    var label = pfApp.roleLabels[pfApp.currentRole];
    document.querySelector('.role-label').textContent = label;
    showToast('已切换角色：' + label, 'success');
    log('角色切换: ' + label, 'info');
  }

  // ===== 导出 =====
  function exportLedger() {
    // 打开导出选项弹窗（确保 D3 弹窗运行时验证可触发）
    openModal({
      title: '导出质押台账',
      body: ''
        + '<p>将导出当前筛选范围内的质押案件台账，共 <strong>' + pfApp.filteredCases.length + '</strong> 条记录。</p>'
        + '<dl>'
        + '<div><dt>导出格式</dt><dd>Excel（.xlsx）</dd></div>'
        + '<div><dt>字段范围</dt><dd>案件编号 / 申请人 / 银行 / 评估价值 / 贷款金额 / 状态 / 操作人</dd></div>'
        + '<div><dt>文件大小</dt><dd>约 ' + (pfApp.filteredCases.length * 2 + 18) + ' KB</dd></div>'
        + '</dl>'
        + '<p>导出完成后将自动下载到本地。</p>',
      buttons: [
        { text: '取消', cls: 'btn-ghost', onClick: closeModal },
        { text: '确认导出', cls: 'btn-primary', onClick: function () {
          closeModal();
          showToast('正在导出质押台账 Excel...（共 ' + pfApp.filteredCases.length + ' 条）', 'success');
          log('导出台账: ' + pfApp.filteredCases.length + ' 条', 'ok');
        } }
      ]
    });
  }

  // ===== 事件绑定 =====
  function bindEvents() {
    // 导航 hashchange
    window.addEventListener('hashchange', handleRoute);

    // 搜索/重置
    var btnSearch = $('btnSearch');
    if (btnSearch) btnSearch.addEventListener('click', doSearch);
    var btnReset = $('btnReset');
    if (btnReset) btnReset.addEventListener('click', doReset);

    // 新增 / 导出
    var btnNew = $('btnNew');
    if (btnNew) btnNew.addEventListener('click', function () {
      location.hash = '#/pledge-cases/form';
      log('点击新增案件，跳转表单', 'info');
    });
    var btnExport = $('btnExport');
    if (btnExport) btnExport.addEventListener('click', exportLedger);

    // 表格行事件（事件委托）
    var tbody = $('caseTableBody');
    if (tbody) {
      tbody.addEventListener('click', function (e) {
        var target = e.target;
        var caseNoEl = target.closest('.case-no-cell');
        if (caseNoEl) {
          var caseNo = caseNoEl.getAttribute('data-case-no');
          location.hash = '#/pledge-cases/' + caseNo;
          log('查看案件: ' + caseNo, 'info');
          return;
        }
        var btn = target.closest('button[data-action]');
        if (btn) {
          var action = btn.getAttribute('data-action');
          var cNo = btn.getAttribute('data-case-no');
          if (action === 'view') {
            location.hash = '#/pledge-cases/' + cNo;
          } else if (action === 'export-row') {
            showToast('已导出案件 ' + cNo + ' 详情', 'success');
            log('导出单行: ' + cNo, 'ok');
          }
        }
      });

      // 复选框
      tbody.addEventListener('change', function (e) {
        if (e.target.classList.contains('row-check')) {
          updateSelectedCount();
        }
      });
    }

    // 全选
    var chkAll = $('chkAll');
    if (chkAll) {
      chkAll.addEventListener('change', function () {
        var checked = chkAll.checked;
        document.querySelectorAll('.row-check').forEach(function (cb) { cb.checked = checked; });
        updateSelectedCount();
      });
    }

    // 分页
    var btnPrev = $('btnPrev');
    if (btnPrev) btnPrev.addEventListener('click', function () {
      if (pfApp.currentPage > 1) {
        pfApp.currentPage--;
        renderCaseTable();
        log('翻页: 第 ' + pfApp.currentPage + ' 页', 'info');
      }
    });
    var btnNext = $('btnNext');
    if (btnNext) btnNext.addEventListener('click', function () {
      var totalPages = Math.ceil(pfApp.filteredCases.length / pfApp.pageSize);
      if (pfApp.currentPage < totalPages) {
        pfApp.currentPage++;
        renderCaseTable();
        log('翻页: 第 ' + pfApp.currentPage + ' 页', 'info');
      }
    });

    // 详情页操作按钮
    var btnAssess = $('btnAssess');
    if (btnAssess) btnAssess.addEventListener('click', startAssess);
    var btnApprove = $('btnApprove');
    if (btnApprove) btnApprove.addEventListener('click', startApprove);
    var btnDisburse = $('btnDisburse');
    if (btnDisburse) btnDisburse.addEventListener('click', startDisburse);
    var btnBackToList = $('btnBackToList');
    if (btnBackToList) btnBackToList.addEventListener('click', function () {
      location.hash = '#/pledge-cases';
    });

    // P03 表单按钮
    var btnAiValue = $('btnAiValue');
    if (btnAiValue) btnAiValue.addEventListener('click', aiValue);
    var btnSubmit = $('btnSubmit');
    if (btnSubmit) btnSubmit.addEventListener('click', submitPledge);
    var btnCancel = $('btnCancel');
    if (btnCancel) btnCancel.addEventListener('click', function () {
      location.hash = '#/pledge-cases';
      showToast('已取消编辑', 'warn');
    });

    // 贷款金额实时校验
    var fLoanAmount = $('fLoanAmount');
    if (fLoanAmount) fLoanAmount.addEventListener('input', validateRatio);
    var fAssessedValue = $('fAssessedValue');
    if (fAssessedValue) fAssessedValue.addEventListener('input', validateRatio);

    // 弹窗关闭
    var modalClose = $('modalClose');
    if (modalClose) modalClose.addEventListener('click', closeModal);
    var modalMask = $('modalMask');
    if (modalMask) modalMask.addEventListener('click', function (e) {
      if (e.target === modalMask) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modalMask && !modalMask.hidden) closeModal();
    });

    // 角色切换
    var roleChip = $('roleChip');
    if (roleChip) roleChip.addEventListener('click', switchRole);
  }

  function updateSelectedCount() {
    var count = document.querySelectorAll('.row-check:checked').length;
    var el = $('selectedCount');
    if (el) el.textContent = count;
  }

  // ===== 初始化 =====
  function init() {
    log('Patent Finance Workbench 初始化', 'info');
    bindEvents();
    // 设置默认 hash
    if (!location.hash) {
      location.hash = DEFAULT_ROUTE;
    }
    handleRoute();
    log('Demo 初始化完成 · 12 条 Mock 案件 · 3 个页面', 'ok');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 暴露调试接口（可选）
  window.pfApp = pfApp;
})();
