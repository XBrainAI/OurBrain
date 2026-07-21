/* ==========================================================================
   专利预审智能合规预审管家 - Demo 应用逻辑
   命名空间封装：避免全局 const 冲突（标注引擎陷阱 #1）
   ========================================================================== */
(function (global) {
  'use strict';

  // ===== 应用状态 =====
  var App = {
    state: {
      currentRole: 'agent',
      currentPageId: 'P01',
      selectedRows: [],
      cases: [],
      currentCaseId: null,
      precheckPassed: false,
      searchFilters: {
        case_no: '',
        applicant: '',
        tech_field: '',
        reviewer: '',
        status: ''
      },
      pagination: {
        current: 1,
        pageSize: 10
      }
    },

    // ===== Mock 数据 =====
    mockCases: [
      {
        id: 'C001', case_no: 'CN-2026-000001', applicant: '广州奥凯信息科技',
        tech_field: '新一代信息技术', reviewer: '张预审', owner: '广州奥凯代理',
        operator: '李代理', status: 'submitted', submit_date: '2026-07-15',
        review_start_date: '', issues: ''
      },
      {
        id: 'C002', case_no: 'CN-2026-000002', applicant: '华南理工大学',
        tech_field: '高端装备制造', reviewer: '李预审', owner: '广州专利代理',
        operator: '王代理', status: 'checking', submit_date: '2026-07-12',
        review_start_date: '2026-07-13',
        issues: '1. 权利要求 1 范围过宽，需限定技术特征\n2. 附图 2 与说明书第 [0025] 段描述不一致'
      },
      {
        id: 'C003', case_no: 'CN-2026-000003', applicant: '广东新材料研究院',
        tech_field: '新材料', reviewer: '张预审', owner: '广州奥凯代理',
        operator: '李代理', status: 'passed', submit_date: '2026-07-05',
        review_start_date: '2026-07-06',
        issues: ''
      },
      {
        id: 'C004', case_no: 'CN-2026-000004', applicant: '广州生物医学集团',
        tech_field: '生物医药', reviewer: '王预审', owner: '广东知识产权服务',
        operator: '陈代理', status: 'rejected', submit_date: '2026-07-08',
        review_start_date: '2026-07-09',
        issues: '1. 研发证明材料不充分，需补充研发投入凭证\n2. 权利要求 1 表述过于宽泛\n3. 附图 2 与说明书描述不一致\n4. 发明人张三与申请人无关联证明\n5. 技术方案缺乏创造性论证\n6. 摘要未涵盖核心创新点（已超 5 项阈值，自动驳回）'
      },
      {
        id: 'C005', case_no: 'CN-2026-000005', applicant: '南方电网新能源',
        tech_field: '新能源', reviewer: '李预审', owner: '广州奥凯代理',
        operator: '李代理', status: 'rectified', submit_date: '2026-07-01',
        review_start_date: '2026-07-02',
        issues: '1. 权利要求保护范围过宽，已修正\n2. 补充了研发投入凭证'
      },
      {
        id: 'C006', case_no: 'CN-2026-000006', applicant: '广州环保科技',
        tech_field: '节能环保', reviewer: '王预审', owner: '广州专利代理',
        operator: '王代理', status: 'submitted', submit_date: '2026-07-19',
        review_start_date: '', issues: ''
      },
      {
        id: 'C007', case_no: 'CN-2026-000007', applicant: '深圳信息技术',
        tech_field: '新一代信息技术', reviewer: '张预审', owner: '广东知识产权服务',
        operator: '陈代理', status: 'checking', submit_date: '2026-07-10',
        review_start_date: '2026-07-11',
        issues: '1. 说明书第 [0018] 段引用的对比文件 D2 不清楚'
      },
      {
        id: 'C008', case_no: 'CN-2026-000008', applicant: '东莞装备制造',
        tech_field: '高端装备制造', reviewer: '李预审', owner: '广州奥凯代理',
        operator: '李代理', status: 'passed', submit_date: '2026-06-28',
        review_start_date: '2026-06-29', issues: ''
      },
      {
        id: 'C009', case_no: 'CN-2026-000009', applicant: '佛山新材料',
        tech_field: '新材料', reviewer: '王预审', owner: '广州专利代理',
        operator: '王代理', status: 'rejected', submit_date: '2026-07-03',
        review_start_date: '2026-07-04',
        issues: '1. 实用新型权利要求缺乏创造性\n2. 说明书公开不充分\n3. 附图标记错误'
      },
      {
        id: 'C010', case_no: 'CN-2026-000010', applicant: '珠海生物医药',
        tech_field: '生物医药', reviewer: '张预审', owner: '广东知识产权服务',
        operator: '陈代理', status: 'rectified', submit_date: '2026-06-20',
        review_start_date: '2026-06-21',
        issues: '1. 已补充发明人关联证明\n2. 已修正权利要求保护范围'
      },
      {
        id: 'C011', case_no: 'CN-2026-000011', applicant: '中山新能源',
        tech_field: '新能源', reviewer: '李预审', owner: '广州奥凯代理',
        operator: '李代理', status: 'submitted', submit_date: '2026-07-18',
        review_start_date: '', issues: ''
      },
      {
        id: 'C012', case_no: 'CN-2026-000012', applicant: '江门环保',
        tech_field: '节能环保', reviewer: '王预审', owner: '广州专利代理',
        operator: '王代理', status: 'checking', submit_date: '2026-07-14',
        review_start_date: '2026-07-15',
        issues: '1. 权利要求 4 引用基础不清'
      }
    ],

    // ===== 路由表 =====
    ROUTES: {
      '/precheck-cases': 'P01',
      '/precheck-cases/new': 'P03',
      '/precheck-cases/detail': 'P02'
    },
    DEFAULT_ROUTE: '/precheck-cases',

    // ===== 状态映射 =====
    STATUS_MAP: {
      submitted:  { label: '已提交',   cls: 'submitted' },
      checking:   { label: '预审中',   cls: 'checking' },
      passed:     { label: '预审通过', cls: 'passed' },
      rejected:   { label: '预审驳回', cls: 'rejected' },
      rectified:  { label: '已整改',   cls: 'rectified' }
    },

    TECH_FIELDS: [
      '新一代信息技术', '高端装备制造', '新材料',
      '生物医药', '新能源', '节能环保'
    ],

    ROLES: {
      agent:            { label: '代理师',   name: '李代理', initials: '代' },
      'precheck-reviewer': { label: '预审员', name: '张预审', initials: '审' },
      ipr:              { label: '企业IPR', name: '陈IPR',  initials: 'I' }
    }
  };

  // ===== Toast 通知 =====
  function toast(opts) {
    var type = opts.type || 'info';
    var title = opts.title || '';
    var msg = opts.msg || '';
    var container = document.getElementById('toastContainer');
    if (!container) return;
    var el = document.createElement('div');
    el.className = 'toast ' + type;
    el.innerHTML =
      '<div class="toast-title">' + escapeHtml(title) + '</div>' +
      '<div class="toast-msg">' + escapeHtml(msg) + '</div>';
    container.appendChild(el);
    setTimeout(function () {
      el.style.transition = 'opacity 0.3s';
      el.style.opacity = '0';
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 300);
    }, 3000);
  }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ===== 路由 =====
  function handleRoute() {
    var raw = global.location.hash.replace(/^#/, '');
    var hash = raw || App.DEFAULT_ROUTE;
    var pageId = App.ROUTES[hash];
    if (!pageId) {
      // 兼容 /precheck-cases/detail?id=C002 这种带参数形式
      var baseHash = hash.split('?')[0];
      pageId = App.ROUTES[baseHash];
    }
    if (!pageId) {
      pageId = 'P01';
      hash = App.DEFAULT_ROUTE;
    }

    App.state.currentPageId = pageId;

    // 切换页面 section 的 hidden 属性
    var pages = document.querySelectorAll('[data-page-id]');
    pages.forEach(function (page) {
      var pid = page.getAttribute('data-page-id');
      page.classList.toggle('active', pid === pageId);
    });

    // 同步激活态 nav-link
    var navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(function (link) {
      var linkHash = (link.getAttribute('href') || '').replace(/^#/, '');
      var isActive = (linkHash === hash) || (hash.indexOf('/detail') === 0 && linkHash === '/precheck-cases');
      link.classList.toggle('active', isActive);
    });

    // 路由参数解析
    if (pageId === 'P02') {
      var match = hash.match(/[?&]id=([^&]+)/);
      if (match) {
        App.state.currentCaseId = decodeURIComponent(match[1]);
      }
      renderP02();
    } else if (pageId === 'P01') {
      renderP01();
    } else if (pageId === 'P03') {
      resetP03();
    }

    // 通知标注引擎刷新
    if (global.__ANNOTATION_ENGINE__ && typeof global.__ANNOTATION_ENGINE__.refresh === 'function') {
      try { global.__ANNOTATION_ENGINE__.refresh(); } catch (e) {}
    }
  }

  function navigate(hash) {
    if (global.location.hash === '#' + hash) {
      handleRoute();
    } else {
      global.location.hash = hash;
    }
  }

  // ===== P01: 案件列表 =====
  function renderP01() {
    renderSidebarStats();
    var filters = App.state.searchFilters;
    var filtered = App.state.cases.filter(function (c) {
      if (filters.case_no && c.case_no.indexOf(filters.case_no) < 0) return false;
      if (filters.applicant && c.applicant.indexOf(filters.applicant) < 0) return false;
      if (filters.tech_field && c.tech_field !== filters.tech_field) return false;
      if (filters.reviewer && c.reviewer.indexOf(filters.reviewer) < 0) return false;
      if (filters.status && c.status !== filters.status) return false;
      // 企业 IPR 仅查看本企业案件（模拟 own scope，假设 IPR 属于"广州奥凯信息科技"）
      if (App.state.currentRole === 'ipr' && c.applicant !== '广州奥凯信息科技') return false;
      return true;
    });

    var tbody = document.getElementById('p01TableBody');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="8" class="cell-center">' +
          '<div class="empty-state">' +
            '<div class="empty-icon">[ ]</div>' +
            '<div class="empty-text">没有匹配的案件</div>' +
            '<div class="empty-hint">尝试调整搜索条件或清除筛选</div>' +
          '</div>' +
        '</td></tr>';
      document.getElementById('p01PaginationInfo').textContent = '共 0 条';
      return;
    }

    var html = filtered.map(function (c, idx) {
      var st = App.STATUS_MAP[c.status] || { label: c.status, cls: '' };
      var selected = App.state.selectedRows.indexOf(c.id) >= 0 ? ' selected' : '';
      var idx2 = String(idx + 1).padStart(2, '0');
      return '' +
        '<tr class="data-row' + selected + '" data-case-id="' + c.id + '">' +
          '<td class="cell-center"><input type="checkbox" class="row-checkbox" data-case-id="' + c.id + '"' + (selected ? ' checked' : '') + '></td>' +
          '<td><span class="cell-mono">' + escapeHtml(c.case_no) + '</span></td>' +
          '<td>' + escapeHtml(c.applicant) + '</td>' +
          '<td><span class="tech-tag">' + escapeHtml(c.tech_field) + '</span></td>' +
          '<td>' + escapeHtml(c.reviewer || '—') + '</td>' +
          '<td>' + escapeHtml(c.owner) + '</td>' +
          '<td><span class="status-tag ' + st.cls + '">' + st.label + '</span></td>' +
          '<td class="cell-center" data-element-id="P01-C-004">' +
            '<button class="btn btn-ghost btn-sm" data-action="view" data-case-id="' + c.id + '">查看</button>' +
            '<span class="l3-dot"></span>' +
          '</td>' +
        '</tr>';
    }).join('');
    tbody.innerHTML = html;

    var info = document.getElementById('p01PaginationInfo');
    if (info) {
      info.textContent = '共 ' + filtered.length + ' 条 · 第 ' + App.state.pagination.current + ' / 1 页';
    }

    // 批量预检按钮禁用状态
    var batchBtn = document.getElementById('btnBatchPrecheck');
    if (batchBtn) {
      batchBtn.disabled = App.state.selectedRows.length === 0;
    }

    bindP01RowEvents();
  }

  function renderSidebarStats() {
    var cases = App.state.cases;
    var total = cases.length;
    var submitted = cases.filter(function (c) { return c.status === 'submitted'; }).length;
    var checking = cases.filter(function (c) { return c.status === 'checking'; }).length;
    var passed = cases.filter(function (c) { return c.status === 'passed'; }).length;
    var rejected = cases.filter(function (c) { return c.status === 'rejected'; }).length;
    var rectified = cases.filter(function (c) { return c.status === 'rectified'; }).length;
    var el = document.getElementById('sidebarStats');
    if (!el) return;
    el.innerHTML =
      '<div class="stat-row"><span class="stat-label">案件总数</span><span class="stat-value">' + total + '</span></div>' +
      '<div class="stat-row"><span class="stat-label">已提交</span><span class="stat-value">' + submitted + '</span></div>' +
      '<div class="stat-row"><span class="stat-label">预审中</span><span class="stat-value">' + checking + '</span></div>' +
      '<div class="stat-row"><span class="stat-label">已通过</span><span class="stat-value">' + passed + '</span></div>' +
      '<div class="stat-row"><span class="stat-label">已驳回</span><span class="stat-value">' + rejected + '</span></div>' +
      '<div class="stat-row"><span class="stat-label">已整改</span><span class="stat-value">' + rectified + '</span></div>';
  }

  function bindP01RowEvents() {
    var tbody = document.getElementById('p01TableBody');
    if (!tbody) return;

    // 行复选框
    tbody.querySelectorAll('.row-checkbox').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var id = this.getAttribute('data-case-id');
        if (this.checked) {
          if (App.state.selectedRows.indexOf(id) < 0) App.state.selectedRows.push(id);
        } else {
          App.state.selectedRows = App.state.selectedRows.filter(function (x) { return x !== id; });
        }
        // 切换行的 selected 样式
        var row = this.closest('tr');
        if (row) row.classList.toggle('selected', this.checked);
        // 更新批量按钮状态
        var batchBtn = document.getElementById('btnBatchPrecheck');
        if (batchBtn) batchBtn.disabled = App.state.selectedRows.length === 0;
      });
    });

    // 查看按钮
    tbody.querySelectorAll('button[data-action="view"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-case-id');
        App.state.currentCaseId = id;
        navigate('/precheck-cases/detail?id=' + id);
      });
    });
  }

  function handleP01Search() {
    App.state.searchFilters.case_no = (document.getElementById('searchCaseNo') || {}).value || '';
    App.state.searchFilters.applicant = (document.getElementById('searchApplicant') || {}).value || '';
    App.state.searchFilters.tech_field = (document.getElementById('searchTechField') || {}).value || '';
    App.state.searchFilters.reviewer = (document.getElementById('searchReviewer') || {}).value || '';
    App.state.searchFilters.status = (document.getElementById('searchStatus') || {}).value || '';
    App.state.pagination.current = 1;
    renderP01();
    toast({ type: 'info', title: '搜索完成', msg: '已应用筛选条件' });
  }

  function handleP01Reset() {
    App.state.searchFilters = { case_no: '', applicant: '', tech_field: '', reviewer: '', status: '' };
    var ids = ['searchCaseNo', 'searchApplicant', 'searchTechField', 'searchReviewer', 'searchStatus'];
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = '';
    });
    renderP01();
    toast({ type: 'info', title: '已重置', msg: '搜索条件已清空' });
  }

  function handleP01NewCase() {
    navigate('/precheck-cases/new');
  }

  function handleP01BatchPrecheck() {
    if (App.state.selectedRows.length === 0) {
      toast({ type: 'warning', title: '未选中', msg: '请先勾选要批量预检的案件' });
      return;
    }
    toast({
      type: 'success',
      title: '批量预检已启动',
      msg: '已为 ' + App.state.selectedRows.length + ' 个案件触发准入预检任务'
    });
    // 模拟：1 秒后清除选择
    setTimeout(function () {
      App.state.selectedRows = [];
      renderP01();
    }, 1000);
  }

  // ===== P02: 案件详情 =====
  function findCase(id) {
    return App.state.cases.find(function (c) { return c.id === id; });
  }

  function renderP02() {
    var c = findCase(App.state.currentCaseId);
    if (!c) {
      var main = document.getElementById('p02Main');
      if (main) {
        main.innerHTML =
          '<div class="empty-state">' +
            '<div class="empty-icon">!</div>' +
            '<div class="empty-text">未找到案件</div>' +
            '<div class="empty-hint">可能链接已失效或案件已被删除</div>' +
            '<button class="btn btn-outline" style="margin-top:16px" onclick="location.hash=\'#/precheck-cases\'">返回列表</button>' +
          '</div>';
      }
      return;
    }
    var st = App.STATUS_MAP[c.status] || { label: c.status, cls: '' };

    // 详情头部
    var detailHead = document.getElementById('p02DetailHead');
    if (detailHead) {
      detailHead.innerHTML =
        '<div class="desc-list">' +
          '<div class="desc-term">案件编号</div><div class="desc-detail mono">' + escapeHtml(c.case_no) + '</div>' +
          '<div class="desc-term">申请人</div><div class="desc-detail">' + escapeHtml(c.applicant) + '</div>' +
          '<div class="desc-term">技术领域</div><div class="desc-detail"><span class="tech-tag">' + escapeHtml(c.tech_field) + '</span></div>' +
          '<div class="desc-term">代理机构</div><div class="desc-detail">' + escapeHtml(c.owner) + '</div>' +
          '<div class="desc-term">提交日期</div><div class="desc-detail">' + escapeHtml(c.submit_date) + '</div>' +
          '<div class="desc-term">当前状态</div><div class="desc-detail"><span class="status-tag ' + st.cls + '">' + st.label + '</span></div>' +
        '</div>';
    }

    // 预审员区
    var reviewerSec = document.getElementById('p02Reviewer');
    if (reviewerSec) {
      var reviewDate = c.review_start_date || '—';
      reviewerSec.innerHTML =
        '<div class="desc-list">' +
          '<div class="desc-term">预审员</div><div class="desc-detail">' + escapeHtml(c.reviewer || '未指派') + '</div>' +
          '<div class="desc-term">预审开始</div><div class="desc-detail">' + escapeHtml(reviewDate) + '</div>' +
          '<div class="desc-term">操作人</div><div class="desc-detail">' + escapeHtml(c.operator || '—') + '</div>' +
        '</div>';
    }

    // 整改清单区
    var issuesSec = document.getElementById('p02Issues');
    if (issuesSec) {
      if (c.issues && c.issues.trim()) {
        var lines = c.issues.split('\n').filter(function (l) { return l.trim(); });
        var issueHtml = lines.map(function (line, i) {
          var severity = i >= 4 ? '高' : '中';
          return '<li>' +
            '<span class="issue-no">' + String(i + 1).padStart(2, '0') + '</span>' +
            '<span class="issue-text">' + escapeHtml(line.replace(/^\d+\.\s*/, '')) + '</span>' +
            '<span class="issue-severity">' + severity + '</span>' +
          '</li>';
        }).join('');
        issuesSec.innerHTML = '<ul class="issues-list">' + issueHtml + '</ul>';
      } else {
        issuesSec.innerHTML =
          '<div class="issues-empty">' +
            '当前案件暂无整改清单<br>' +
            '<span style="font-size:11px;opacity:0.7">案件尚未进入预审或已通过审核</span>' +
          '</div>';
      }
    }

    // 操作按钮区
    renderP02Actions(c);
  }

  function renderP02Actions(c) {
    var actionsEl = document.getElementById('p02Actions');
    if (!actionsEl) return;

    var canStartCheck = (App.state.currentRole === 'precheck-reviewer') && c.status === 'submitted';
    var canPass = (App.state.currentRole === 'precheck-reviewer') && (c.status === 'checking' || c.status === 'rectified');
    var canReject = (App.state.currentRole === 'precheck-reviewer') && c.status === 'checking';

    var hint = '当前角色：' + App.ROLES[App.state.currentRole].label + ' · 状态：' + App.STATUS_MAP[c.status].label;

    var html = '';
    // L3 元件：开始预审按钮
    html += '<span data-element-id="P02-C-001">' +
      '<button class="btn btn-primary" id="btnStartCheck" ' + (canStartCheck ? '' : 'disabled') + '>开始预审</button>' +
      '<span class="l3-dot"></span></span>';
    // L3 元件：通过按钮
    html += '<span data-element-id="P02-C-002">' +
      '<button class="btn btn-success" id="btnPass" ' + (canPass ? '' : 'disabled') + '>通过预审</button>' +
      '<span class="l3-dot"></span></span>';
    // L3 元件：驳回按钮
    html += '<span data-element-id="P02-C-003">' +
      '<button class="btn btn-danger" id="btnReject" ' + (canReject ? '' : 'disabled') + '>驳回案件</button>' +
      '<span class="l3-dot"></span></span>';
    html += '<button class="btn btn-outline" onclick="location.hash=\'#/precheck-cases\'">返回列表</button>';
    html += '<span class="status-hint">' + escapeHtml(hint) + '</span>';

    actionsEl.innerHTML = html;

    // 绑定事件
    var startBtn = document.getElementById('btnStartCheck');
    if (startBtn && !startBtn.disabled) {
      startBtn.addEventListener('click', function () {
        c.status = 'checking';
        c.review_start_date = new Date().toISOString().slice(0, 10);
        toast({ type: 'success', title: '预审已开始', msg: '案件 ' + c.case_no + ' 已进入预审中' });
        renderP02();
      });
    }
    var passBtn = document.getElementById('btnPass');
    if (passBtn && !passBtn.disabled) {
      passBtn.addEventListener('click', function () {
        c.status = 'passed';
        c.issues = '';
        toast({ type: 'success', title: '预审通过', msg: '案件 ' + c.case_no + ' 已通过预审' });
        renderP02();
      });
    }
    var rejectBtn = document.getElementById('btnReject');
    if (rejectBtn && !rejectBtn.disabled) {
      rejectBtn.addEventListener('click', function () {
        openRejectModal(c.id);
      });
    }
  }

  // ===== 驳回弹窗 =====
  function openRejectModal(caseId) {
    var mask = document.getElementById('modalMask');
    if (!mask) return;
    App.state.currentCaseId = caseId;
    // 重置问题列表（默认 1 个空问题）
    var list = document.getElementById('issueInputList');
    if (list) {
      list.innerHTML = renderIssueInputRow(1, '');
    }
    mask.classList.add('show');
    var firstArea = list && list.querySelector('textarea');
    if (firstArea) setTimeout(function () { firstArea.focus(); }, 50);
  }

  function closeRejectModal() {
    var mask = document.getElementById('modalMask');
    if (mask) mask.classList.remove('show');
  }

  function renderIssueInputRow(idx, value) {
    return '' +
      '<div class="issue-input-row">' +
        '<span class="issue-idx">' + String(idx).padStart(2, '0') + '</span>' +
        '<textarea class="issue-textarea" placeholder="描述整改问题，例如：权利要求 1 范围过宽，需限定技术特征">' + escapeHtml(value || '') + '</textarea>' +
        '<button class="btn-remove" data-action="remove-issue">×</button>' +
      '</div>';
  }

  function addIssueRow() {
    var list = document.getElementById('issueInputList');
    if (!list) return;
    var rows = list.querySelectorAll('.issue-input-row');
    var nextIdx = rows.length + 1;
    list.insertAdjacentHTML('beforeend', renderIssueInputRow(nextIdx, ''));
    bindIssueRowEvents();
  }

  function removeIssueRow(btn) {
    var row = btn.closest('.issue-input-row');
    if (!row) return;
    row.parentNode.removeChild(row);
    // 重新编号
    var list = document.getElementById('issueInputList');
    if (list) {
      list.querySelectorAll('.issue-input-row').forEach(function (r, i) {
        var idxEl = r.querySelector('.issue-idx');
        if (idxEl) idxEl.textContent = String(i + 1).padStart(2, '0');
      });
    }
  }

  function bindIssueRowEvents() {
    var list = document.getElementById('issueInputList');
    if (!list) return;
    list.querySelectorAll('.btn-remove').forEach(function (btn) {
      // 避免重复绑定：先移除再加
      btn.removeEventListener('click', onRemoveClick);
      btn.addEventListener('click', onRemoveClick);
    });
  }

  function onRemoveClick(e) {
    removeIssueRow(e.currentTarget);
  }

  function confirmReject() {
    var list = document.getElementById('issueInputList');
    if (!list) return;
    var issues = [];
    list.querySelectorAll('.issue-textarea').forEach(function (ta) {
      var v = (ta.value || '').trim();
      if (v) issues.push(v);
    });
    if (issues.length === 0) {
      toast({ type: 'warning', title: '需输入问题', msg: '请至少描述一项整改问题再驳回' });
      return;
    }

    var c = findCase(App.state.currentCaseId);
    if (!c) return;

    // 业务规则：超过 5 项自动驳回（这里只是模拟，状态都置为 rejected）
    c.status = 'rejected';
    c.issues = issues.map(function (v, i) { return (i + 1) + '. ' + v; }).join('\n');
    closeRejectModal();
    toast({
      type: issues.length > 5 ? 'error' : 'warning',
      title: issues.length > 5 ? '问题数超阈值自动驳回' : '案件已驳回',
      msg: '共 ' + issues.length + ' 项整改问题，整改时限 7 日'
    });
    renderP02();
  }

  // ===== P03: 案件提交表单 =====
  function resetP03() {
    var form = document.getElementById('p03Form');
    if (form) form.reset();
    App.state.precheckPassed = false;
    var result = document.getElementById('precheckResult');
    if (result) {
      result.className = 'precheck-result';
      result.innerHTML = '';
    }
    // 清除错误样式
    ['p03CaseNo', 'p03Applicant', 'p03TechField', 'p03Owner'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove('error');
    });
  }

  function validateP03() {
    var errors = [];
    var fields = [
      { id: 'p03CaseNo', name: '案件编号' },
      { id: 'p03Applicant', name: '申请人' },
      { id: 'p03TechField', name: '技术领域' },
      { id: 'p03Owner', name: '代理机构' }
    ];
    fields.forEach(function (f) {
      var el = document.getElementById(f.id);
      if (el) el.classList.remove('error');
      var v = (el && el.value || '').trim();
      if (!v) {
        errors.push(f.name + ' 为必填项');
        if (el) el.classList.add('error');
      }
    });
    return errors;
  }

  function runPrecheck() {
    var errors = validateP03();
    if (errors.length > 0) {
      toast({ type: 'warning', title: '校验失败', msg: '请补全必填字段' });
      return;
    }
    var applicant = document.getElementById('p03Applicant').value.trim();
    var techField = document.getElementById('p03TechField').value;
    var caseNo = document.getElementById('p03CaseNo').value.trim();

    // 模拟 30 日内重复提交校验
    var dup = App.state.cases.find(function (c) {
      return c.applicant === applicant && c.tech_field === techField && c.status !== 'rejected' && c.status !== 'passed';
    });

    var result = document.getElementById('precheckResult');
    if (!result) return;

    if (dup) {
      App.state.precheckPassed = false;
      result.className = 'precheck-result show error';
      result.innerHTML =
        '<strong>准入预检未通过</strong><br>' +
        '原因：同一申请人「' + escapeHtml(applicant) + '」同一技术领域「' + escapeHtml(techField) +
        '」30 日内已存在案件 ' + escapeHtml(dup.case_no) + '，不可重复提交。';
      toast({ type: 'error', title: '准入预检未通过', msg: '30 日内重复提交' });
    } else {
      App.state.precheckPassed = true;
      result.className = 'precheck-result show success';
      result.innerHTML =
        '<strong>准入预检通过</strong><br>' +
        '主体备案校验 ✓ · 技术领域校验 ✓ · 同日重复校验 ✓ · 案件编号 ' + escapeHtml(caseNo) + ' 可提交预审。';
      toast({ type: 'success', title: '准入预检通过', msg: '可执行提交操作' });
    }
  }

  function submitP03() {
    var errors = validateP03();
    if (errors.length > 0) {
      toast({ type: 'warning', title: '校验失败', msg: errors[0] });
      return;
    }
    if (!App.state.precheckPassed) {
      toast({ type: 'warning', title: '未通过准入预检', msg: '请先点击「准入预检」并通过校验' });
      return;
    }
    var caseNo = document.getElementById('p03CaseNo').value.trim();
    var applicant = document.getElementById('p03Applicant').value.trim();
    var techField = document.getElementById('p03TechField').value;
    var owner = document.getElementById('p03Owner').value.trim();

    // 新增案件
    var newId = 'C' + String(App.state.cases.length + 1).padStart(3, '0');
    App.state.cases.unshift({
      id: newId,
      case_no: caseNo,
      applicant: applicant,
      tech_field: techField,
      reviewer: '',
      owner: owner,
      operator: App.ROLES[App.state.currentRole].name,
      status: 'submitted',
      submit_date: new Date().toISOString().slice(0, 10),
      review_start_date: '',
      issues: ''
    });
    toast({ type: 'success', title: '案件已提交', msg: '案件编号 ' + caseNo + ' 已提交预审，等待预审员受理' });
    navigate('/precheck-cases');
  }

  function cancelP03() {
    toast({ type: 'info', title: '已取消', msg: '未保存任何修改' });
    navigate('/precheck-cases');
  }

  // ===== 角色切换 =====
  function handleRoleChange(e) {
    var newRole = e.target.value;
    App.state.currentRole = newRole;
    var role = App.ROLES[newRole];
    // 更新顶部用户显示
    var avatarEl = document.querySelector('.user-avatar');
    if (avatarEl) avatarEl.textContent = role.initials;
    var nameEl = document.querySelector('.toolbar-user .user-name');
    if (nameEl) nameEl.textContent = role.label + ' · ' + role.name;
    toast({ type: 'info', title: '角色已切换', msg: '当前身份：' + role.label });
    // 企业 IPR 切换后，P01 列表过滤需要重渲染
    if (App.state.currentPageId === 'P01') {
      renderP01();
    }
  }

  // ===== 初始化 =====
  function bindEvents() {
    // P01 搜索 / 重置 / 新增 / 批量预检
    var searchBtn = document.getElementById('btnSearch');
    if (searchBtn) searchBtn.addEventListener('click', handleP01Search);
    var resetBtn = document.getElementById('btnReset');
    if (resetBtn) resetBtn.addEventListener('click', handleP01Reset);
    var newBtn = document.getElementById('btnNewCase');
    if (newBtn) newBtn.addEventListener('click', handleP01NewCase);
    var batchBtn = document.getElementById('btnBatchPrecheck');
    if (batchBtn) batchBtn.addEventListener('click', handleP01BatchPrecheck);

    // P03 准入预检 / 提交 / 取消
    var precheckBtn = document.getElementById('btnPrecheck');
    if (precheckBtn) precheckBtn.addEventListener('click', runPrecheck);
    var submitBtn = document.getElementById('btnSubmit');
    if (submitBtn) submitBtn.addEventListener('click', submitP03);
    var cancelBtn = document.getElementById('btnCancel');
    if (cancelBtn) cancelBtn.addEventListener('click', cancelP03);

    // 弹窗关闭按钮（v5.2.6 强制契约）
    var modalCloseBtn = document.getElementById('modalClose');
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeRejectModal);
    var modalMask = document.getElementById('modalMask');
    if (modalMask) {
      modalMask.addEventListener('click', function (e) {
        if (e.target === modalMask) closeRejectModal();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modalMask && modalMask.classList.contains('show')) {
        closeRejectModal();
      }
    });

    // 添加问题按钮
    var addIssueBtn = document.getElementById('btnAddIssue');
    if (addIssueBtn) addIssueBtn.addEventListener('click', addIssueRow);

    // 弹窗确认驳回
    var confirmRejectBtn = document.getElementById('btnConfirmReject');
    if (confirmRejectBtn) confirmRejectBtn.addEventListener('click', confirmReject);

    // 弹窗取消
    var cancelRejectBtn = document.getElementById('btnCancelReject');
    if (cancelRejectBtn) cancelRejectBtn.addEventListener('click', closeRejectModal);

    // 角色切换
    var roleSelect = document.getElementById('roleSelect');
    if (roleSelect) roleSelect.addEventListener('change', handleRoleChange);

    // 标注开关（v5.13.1 修复：删除 click 绑定，由 annotation-engine.js 统一处理）
    // 原因：annotation-engine.js 已在 bindEvents() 中绑定 click → togglePanel()，
    //       app.js 重复绑定会导致 togglePanel 被调用两次（状态相互抵消），面板无法显示。

    // 路由
    global.addEventListener('hashchange', handleRoute);
  }

  function init() {
    // 深拷贝 mock 数据到 state
    App.state.cases = JSON.parse(JSON.stringify(App.mockCases));
    bindEvents();
    bindIssueRowEvents();
    if (!global.location.hash) {
      global.location.hash = App.DEFAULT_ROUTE;
    }
    handleRoute();
  }

  // 暴露到全局（便于审计引擎 / 浏览器控制台调试）
  global.PatentPrecheckApp = App;
  global.PatentPrecheckApp.init = init;
  global.PatentPrecheckApp.handleRoute = handleRoute;

  // 自动启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : this);
