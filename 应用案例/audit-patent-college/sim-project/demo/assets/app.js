/* ============================================================
 * 盘知 Patent Pulse - 业务逻辑
 * 命名空间：使用 myApp 命名空间，避免与标注引擎全局变量冲突
 * ============================================================ */
(function () {
  'use strict';

  // === 命名空间（避免与标注引擎的 const state/app 冲突）===
  var myApp = {};

  // === 状态常量 ===
  var STATUS_LABEL = {
    dormant: '沉睡',
    cleaning: '清洗中',
    matching: '匹配中',
    negotiating: '洽谈中',
    transferred: '已转化'
  };

  // === Mock 数据：8 条专利，覆盖 5 所高校 × 5 种状态 × 3 种成熟度 ===
  // 注意：失效专利不出现在列表中（mock 模拟）
  myApp.PATENTS = [
    {
      id: 'P001', patent_no: 'CN202310001234A',
      title: '一种基于多模态传感的工业机器人柔性抓取装置',
      owner_college: '中山大学', industry: '智能制造', maturity: '中试',
      match_score: 87, status: 'matching'
    },
    {
      id: 'P002', patent_no: 'CN202310002456B',
      title: '高熵合金增材制造微观组织调控方法',
      owner_college: '华南理工', industry: '新材料', maturity: '实验室',
      match_score: 0, status: 'cleaning'
    },
    {
      id: 'P003', patent_no: 'CN202310003678C',
      title: '钠离子电池正极材料原位包覆工艺',
      owner_college: '华南理工', industry: '新能源', maturity: '中试',
      match_score: 73, status: 'negotiating'
    },
    {
      id: 'P004', patent_no: 'CN202310004890D',
      title: '面向肺癌早筛的 ctDNA 甲基化检测 Panel',
      owner_college: '暨南大学', industry: '生物医药', maturity: '产业化',
      match_score: 92, status: 'transferred'
    },
    {
      id: 'P005', patent_no: 'CN202310005112E',
      title: '分布式边缘计算任务调度优化算法',
      owner_college: '华南师范', industry: '信息技术', maturity: '实验室',
      match_score: 0, status: 'dormant'
    },
    {
      id: 'P006', patent_no: 'CN202310006334F',
      title: '碳化硅功率器件高温封装结构',
      owner_college: '广东工业', industry: '新能源', maturity: '产业化',
      match_score: 81, status: 'matching'
    },
    {
      id: 'P007', patent_no: 'CN202310007556G',
      title: '基于深度学习的工业质检视觉系统',
      owner_college: '广东工业', industry: '智能制造', maturity: '中试',
      match_score: 65, status: 'matching'
    },
    {
      id: 'P008', patent_no: 'CN202310008778H',
      title: '可降解聚乳酸医用缝合线制备工艺',
      owner_college: '暨南大学', industry: '生物医药', maturity: '中试',
      match_score: 78, status: 'negotiating'
    }
  ];

  // === Mock 数据：匹配企业清单（用于 P02 详情）===
  myApp.MATCH_COMPANIES = {
    P001: [
      { company: '广州精密装备有限公司', score: 87, status: 'negotiating', days: 32 },
      { company: '佛山智造机器人有限公司', score: 82, status: 'negotiating', days: 18 },
      { company: '深圳工业自动化科技公司', score: 76, status: 'matching', days: 0 }
    ]
  };

  // === Mock 数据：AI 匹配结果（P03）===
  myApp.AI_RESULTS = [
    { rank: 1, patent_no: 'CN202310001234A', title: '一种基于多模态传感的工业机器人柔性抓取装置', score: 92, college: '中山大学' },
    { rank: 2, patent_no: 'CN202310007556G', title: '基于深度学习的工业质检视觉系统', score: 81, college: '广东工业' },
    { rank: 3, patent_no: 'CN202310006334F', title: '碳化硅功率器件高温封装结构', score: 73, college: '广东工业' }
  ];

  // === 工具函数 ===
  myApp.$ = function (id) { return document.getElementById(id); };
  myApp.qsa = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  myApp.toast = function (msg, type) {
    var el = myApp.$('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast' + (type ? ' toast-' + type : '');
    el.hidden = false;
    clearTimeout(myApp._toastTimer);
    myApp._toastTimer = setTimeout(function () { el.hidden = true; }, 2400);
  };

  // === 状态标签 HTML ===
  myApp.statusTagHtml = function (status) {
    var label = STATUS_LABEL[status] || status;
    return '<span class="status-tag ' + status + '">' + label + '</span>';
  };

  myApp.matchScoreHtml = function (score) {
    if (!score) return '<span class="match-score low">—</span>';
    return '<span class="match-score">' + score + '%</span>';
  };

  // === 路由表 ===
  myApp.ROUTES = {
    '/college-patents': 'P01',
    '/college-patents/match': 'P03'
  };

  // 详情页路由按 hash 中的 path 段判断
  myApp.DEFAULT_ROUTE = '/college-patents';

  myApp.handleRoute = function () {
    var hash = location.hash.replace(/^#/, '') || myApp.DEFAULT_ROUTE;
    // 处理详情路由：/college-patents/P001
    var match = hash.match(/^\/college-patents\/(\w+)$/);
    var pageId;
    if (match) {
      pageId = 'P02';
      myApp._detailPatentId = match[1];
    } else {
      pageId = myApp.ROUTES[hash] || 'P01';
    }
    // 切换页面显隐
    myApp.qsa('[data-page-id]').forEach(function (page) {
      page.hidden = (page.getAttribute('data-page-id') !== pageId);
    });
    // 同步 nav-link active
    myApp.qsa('.nav-link').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      var linkHash = href.replace(/^#/, '');
      // 专利库 nav 对 P01/P02 都高亮
      if (linkHash === '/college-patents') {
        link.classList.toggle('active', hash.indexOf('/college-patents') === 0);
      } else if (linkHash === '/college-patents/match') {
        link.classList.toggle('active', hash === '/college-patents/match');
      } else {
        link.classList.toggle('active', linkHash === hash);
      }
    });
    // 进入页面后执行特定初始化
    if (pageId === 'P01') {
      myApp.renderPatentTable();
    } else if (pageId === 'P02') {
      myApp.renderDetail(myApp._detailPatentId || 'P001');
    } else if (pageId === 'P03') {
      // 表单页保持初始状态
    }
    // 通知标注引擎刷新
    if (window.__ANNOTATION_ENGINE__) {
      try { window.__ANNOTATION_ENGINE__.refresh(); } catch (e) {}
    }
  };

  // === 渲染专利表格（P01）===
  myApp.renderPatentTable = function (filter) {
    var tbody = myApp.$('patentTbody');
    if (!tbody) return;
    var patents = myApp.PATENTS.slice();
    if (filter) {
      patents = patents.filter(function (p) {
        if (filter.patentNo && p.patent_no.indexOf(filter.patentNo) < 0) return false;
        if (filter.title && p.title.indexOf(filter.title) < 0) return false;
        if (filter.college && p.owner_college !== filter.college) return false;
        if (filter.industry && p.industry !== filter.industry) return false;
        if (filter.maturity && p.maturity !== filter.maturity) return false;
        if (filter.status && p.status !== filter.status) return false;
        return true;
      });
    }
    var countEl = myApp.$('patentCount');
    if (countEl) countEl.textContent = String(patents.length);
    if (patents.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:32px;color:#999;">未找到匹配的专利，请调整筛选条件</td></tr>';
      return;
    }
    tbody.innerHTML = patents.map(function (p) {
      return ''
        + '<tr data-patent-id="' + p.id + '">'
        +   '<td class="col-check"><input type="checkbox" class="row-check" data-patent-id="' + p.id + '"></td>'
        +   '<td><span class="patent-no">' + p.patent_no + '</span></td>'
        +   '<td class="patent-title-cell">' + p.title + '</td>'
        +   '<td>' + p.owner_college + '</td>'
        +   '<td>' + p.industry + '</td>'
        +   '<td>' + p.maturity + '</td>'
        +   '<td>' + myApp.matchScoreHtml(p.match_score) + '</td>'
        +   '<td>' + myApp.statusTagHtml(p.status) + '</td>'
        +   '<td class="col-actions"><div class="row-actions">'
        +     '<button class="btn-row btn-row-view" data-action="view" data-patent-id="' + p.id + '">查看</button>'
        +   '</div></td>'
        + '</tr>';
    }).join('');
  };

  // === 渲染专利详情（P02）===
  myApp.renderDetail = function (patentId) {
    var patent = myApp.PATENTS.filter(function (p) { return p.id === patentId; })[0] || myApp.PATENTS[0];
    myApp._currentPatent = patent;
    var s = function (id) { var el = myApp.$(id); if (el) el.textContent = patent[id.replace('detail', '').toLowerCase()] || ''; };
    // 手动映射（id 不完全一致）
    if (myApp.$('detailPatentNo')) myApp.$('detailPatentNo').textContent = patent.patent_no;
    if (myApp.$('detailTitle')) myApp.$('detailTitle').textContent = patent.title;
    if (myApp.$('detailCollege')) myApp.$('detailCollege').textContent = patent.owner_college;
    if (myApp.$('detailIndustry')) myApp.$('detailIndustry').textContent = patent.industry;
    if (myApp.$('detailMaturity')) myApp.$('detailMaturity').textContent = patent.maturity;
    if (myApp.$('detailStatus')) {
      var statusEl = myApp.$('detailStatus');
      statusEl.textContent = STATUS_LABEL[patent.status];
      statusEl.className = 'meta-chip meta-status status-tag ' + patent.status;
    }
    if (myApp.$('detailMatchScore')) myApp.$('detailMatchScore').textContent = (patent.match_score || 0) + '%';
    // 渲染匹配企业清单
    var companies = myApp.MATCH_COMPANIES[patent.id] || [];
    var negCount = companies.filter(function (c) { return c.status === 'negotiating'; }).length;
    if (myApp.$('detailNegotiatingCount')) myApp.$('detailNegotiatingCount').textContent = negCount + ' / 3';
    if (myApp.$('detailQuota')) myApp.$('detailQuota').textContent = (3 - negCount) + ' 家';
    var matchList = myApp.$('matchList');
    if (matchList) {
      if (companies.length === 0) {
        matchList.innerHTML = '<div style="padding:24px;text-align:center;color:#999;background:#F4EFE6;border-radius:4px;border:1px dashed #D9D1BE;">该专利暂未推送至企业</div>';
      } else {
        matchList.innerHTML = companies.map(function (c) {
          var daysHtml = c.status === 'negotiating'
            ? '<span class="match-days' + (c.days > 80 ? ' warn' : '') + '">洽谈 ' + c.days + ' 天</span>'
            : '<span class="match-days">未洽谈</span>';
          return ''
            + '<div class="match-item' + (c.status === 'negotiating' ? ' match-item-active' : '') + '">'
            +   '<div class="match-company">' + c.company + '</div>'
            +   '<div class="match-score-cell">' + c.score + '%</div>'
            +   '<div class="match-status">' + (c.status === 'negotiating' ? '洽谈中' : '匹配中') + '</div>'
            +   daysHtml
            + '</div>';
        }).join('');
      }
    }
    // 渲染转化合同信息
    var contractBody = myApp.$('contractBody');
    var contractSub = myApp.$('contractSub');
    if (contractBody && contractSub) {
      if (patent.status === 'transferred') {
        contractSub.textContent = '已转化 · 合同已签订';
        contractBody.innerHTML = ''
          + '<div class="contract-filled">'
          +   '<div class="contract-row"><span class="label">合同编号</span><span class="value">GD-2026-0042</span></div>'
          +   '<div class="contract-row"><span class="label">签约企业</span><span class="value">广州精密装备有限公司</span></div>'
          +   '<div class="contract-row"><span class="label">成交金额</span><span class="value">120 万元</span></div>'
          +   '<div class="contract-row"><span class="label">权属分配</span><span class="value">高校 60% / 企业 30% / 中介 10%</span></div>'
          + '</div>';
      } else {
        contractSub.textContent = '尚未转化 · 等待进入洽谈';
        contractBody.innerHTML = '<div class="contract-empty">当前专利状态为「' + STATUS_LABEL[patent.status] + '」，需先进入洽谈并完成签约后，此处将展示权属与收益分配模板。</div>';
      }
    }
    // 操作按钮按状态显隐
    var btnEnter = myApp.$('btnEnterNegotiation');
    var btnMark = myApp.$('btnMarkTransferred');
    var btnApply = myApp.$('btnApplySubsidy');
    if (btnEnter) btnEnter.disabled = (patent.status !== 'matching' || negCount >= 3);
    if (btnMark) {
      if (patent.status === 'negotiating') {
        btnMark.style.display = '';
        btnMark.disabled = false;
      } else if (patent.status === 'transferred') {
        btnMark.style.display = 'none';
      } else {
        btnMark.style.display = '';
        btnMark.disabled = true;
      }
    }
    if (btnApply) {
      btnApply.style.display = (patent.status === 'transferred') ? '' : 'none';
    }
  };

  // === 弹窗契约 ===
  myApp.openModal = function (title) {
    var mask = myApp.$('modalMask');
    if (!mask) return;
    if (title && myApp.$('modalTitle')) myApp.$('modalTitle').textContent = title;
    mask.hidden = false;
  };
  myApp.closeModal = function () {
    var mask = myApp.$('modalMask');
    if (mask) mask.hidden = true;
  };

  // === 事件绑定 ===
  myApp.bindEvents = function () {
    // === P01 按钮 ===
    var btnSearch = myApp.$('btnSearch');
    if (btnSearch) btnSearch.addEventListener('click', function () {
      var filter = {
        patentNo: (myApp.$('searchPatentNo') || {}).value || '',
        title: (myApp.$('searchTitle') || {}).value || '',
        college: (myApp.$('searchCollege') || {}).value || '',
        industry: (myApp.$('searchIndustry') || {}).value || '',
        maturity: (myApp.$('searchMaturity') || {}).value || '',
        status: (myApp.$('searchStatus') || {}).value || ''
      };
      myApp.renderPatentTable(filter);
      myApp.toast('已应用筛选条件', 'success');
    });

    var btnReset = myApp.$('btnReset');
    if (btnReset) btnReset.addEventListener('click', function () {
      ['searchPatentNo', 'searchTitle', 'searchCollege', 'searchIndustry', 'searchMaturity', 'searchStatus'].forEach(function (id) {
        var el = myApp.$(id);
        if (el) el.value = '';
      });
      myApp.renderPatentTable();
      myApp.toast('已重置筛选条件');
    });

    var btnBatchClean = myApp.$('btnBatchClean');
    if (btnBatchClean) btnBatchClean.addEventListener('click', function () {
      var checked = myApp.qsa('.row-check:checked');
      if (checked.length === 0) {
        myApp.toast('请先勾选要清洗的专利', 'warn');
        return;
      }
      myApp.toast('已对 ' + checked.length + ' 件专利启动批量清洗任务', 'success');
    });

    var btnGoMatch = myApp.$('btnGoMatch');
    if (btnGoMatch) btnGoMatch.addEventListener('click', function () {
      location.hash = '#/college-patents/match';
    });

    // 表格行查看按钮（事件委托）
    var table = myApp.$('patentTable');
    if (table) table.addEventListener('click', function (e) {
      var target = e.target;
      if (target && target.classList && target.classList.contains('btn-row-view')) {
        var pid = target.getAttribute('data-patent-id');
        if (pid) {
          location.hash = '#/college-patents/' + pid;
        }
      }
    });

    // 全选
    var checkAll = myApp.$('checkAll');
    if (checkAll) checkAll.addEventListener('change', function () {
      var checked = checkAll.checked;
      myApp.qsa('.row-check').forEach(function (cb) {
        cb.checked = checked;
        var tr = cb.closest('tr');
        if (tr) tr.classList.toggle('row-checked', checked);
      });
    });

    // 行勾选高亮
    document.addEventListener('change', function (e) {
      if (e.target && e.target.classList && e.target.classList.contains('row-check')) {
        var tr = e.target.closest('tr');
        if (tr) tr.classList.toggle('row-checked', e.target.checked);
      }
    });

    // 分页（disabled 按钮不响应，有效时提示）
    var btnPrev = myApp.$('btnPrev');
    if (btnPrev) btnPrev.addEventListener('click', function () {
      if (!btnPrev.disabled) myApp.toast('已切换到上一页');
    });
    var btnNext = myApp.$('btnNext');
    if (btnNext) btnNext.addEventListener('click', function () {
      if (!btnNext.disabled) myApp.toast('已切换到下一页');
    });

    // === P02 按钮 ===
    var btnBackToList = myApp.$('btnBackToList');
    if (btnBackToList) btnBackToList.addEventListener('click', function () {
      location.hash = '#/college-patents';
    });

    var btnEnterNegotiation = myApp.$('btnEnterNegotiation');
    if (btnEnterNegotiation) btnEnterNegotiation.addEventListener('click', function () {
      if (btnEnterNegotiation.disabled) return;
      var patent = myApp._currentPatent;
      if (!patent) return;
      if (patent.status !== 'matching') {
        myApp.toast('仅匹配中状态可进入洽谈', 'warn');
        return;
      }
      patent.status = 'negotiating';
      myApp.renderDetail(patent.id);
      myApp.toast('已进入洽谈阶段', 'success');
    });

    var btnMarkTransferred = myApp.$('btnMarkTransferred');
    if (btnMarkTransferred) btnMarkTransferred.addEventListener('click', function () {
      if (btnMarkTransferred.disabled) return;
      var patent = myApp._currentPatent;
      if (!patent || patent.status !== 'negotiating') {
        myApp.toast('仅洽谈中状态可标记转化', 'warn');
        return;
      }
      myApp.openModal('录入转化合同信息');
    });

    var btnApplySubsidy = myApp.$('btnApplySubsidy');
    if (btnApplySubsidy) btnApplySubsidy.addEventListener('click', function () {
      if (btnApplySubsidy.style.display === 'none') return;
      myApp.toast('已生成补贴申报材料，下载中...', 'success');
    });

    // === P03 按钮 ===
    var btnAiMatch = myApp.$('btnAiMatch');
    if (btnAiMatch) btnAiMatch.addEventListener('click', function () {
      var industry = (myApp.$('formIndustry') || {}).value;
      var maturity = (myApp.$('formMaturity') || {}).value;
      var college = (myApp.$('formCollege') || {}).value;
      // 清除之前的错误
      myApp.qsa('.form-field.error').forEach(function (f) { f.classList.remove('error'); });
      var missing = [];
      if (!industry) {
        var f1 = (myApp.$('formIndustry') || {}).parentElement;
        if (f1) f1.classList.add('error');
        missing.push('产业方向');
      }
      if (!maturity) {
        var f2 = (myApp.$('formMaturity') || {}).parentElement;
        if (f2) f2.classList.add('error');
        missing.push('成熟度');
      }
      if (!college) {
        var f3 = (myApp.$('formCollege') || {}).parentElement;
        if (f3) f3.classList.add('error');
        missing.push('高校');
      }
      if (missing.length > 0) {
        myApp.toast('请补齐必填字段：' + missing.join('、'), 'error');
        return;
      }
      // 渲染结果
      var resultCard = myApp.$('resultCard');
      var resultList = myApp.$('resultList');
      if (resultCard) resultCard.hidden = false;
      if (resultList) {
        resultList.innerHTML = myApp.AI_RESULTS.map(function (r) {
          return ''
            + '<div class="result-item">'
            +   '<div class="result-rank">' + r.rank + '</div>'
            +   '<div class="result-title-cell">' + r.title + '<span class="patent-no">' + r.patent_no + ' · ' + r.college + '</span></div>'
            +   '<div class="result-score">' + r.score + '%</div>'
            +   '<div><span class="status-tag matching">匹配中</span></div>'
            + '</div>';
        }).join('');
      }
      myApp.toast('AI 匹配完成，共 3 件专利满足阈值', 'success');
      // 通知标注引擎刷新（新区域可见）
      if (window.__ANNOTATION_ENGINE__) {
        try { window.__ANNOTATION_ENGINE__.refresh(); } catch (e) {}
      }
    });

    var btnSubmit = myApp.$('btnSubmit');
    if (btnSubmit) btnSubmit.addEventListener('click', function () {
      var industry = (myApp.$('formIndustry') || {}).value;
      var maturity = (myApp.$('formMaturity') || {}).value;
      var college = (myApp.$('formCollege') || {}).value;
      myApp.qsa('.form-field.error').forEach(function (f) { f.classList.remove('error'); });
      if (!industry || !maturity || !college) {
        if (!industry) { var f1 = (myApp.$('formIndustry') || {}).parentElement; if (f1) f1.classList.add('error'); }
        if (!maturity) { var f2 = (myApp.$('formMaturity') || {}).parentElement; if (f2) f2.classList.add('error'); }
        if (!college) { var f3 = (myApp.$('formCollege') || {}).parentElement; if (f3) f3.classList.add('error'); }
        myApp.toast('校验未通过，请检查必填字段', 'error');
        return;
      }
      myApp.toast('需求已提交，3 秒后跳转专利库', 'success');
      setTimeout(function () { location.hash = '#/college-patents'; }, 1500);
    });

    var btnCancel = myApp.$('btnCancel');
    if (btnCancel) btnCancel.addEventListener('click', function () {
      location.hash = '#/college-patents';
    });

    // === 弹窗关闭契约 ===
    var modalClose = myApp.$('modalClose');
    if (modalClose) modalClose.addEventListener('click', myApp.closeModal);
    var modalMask = myApp.$('modalMask');
    if (modalMask) modalMask.addEventListener('click', function (e) {
      if (e.target === modalMask) myApp.closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modalMask && !modalMask.hidden) myApp.closeModal();
    });
    var modalCancel = myApp.$('modalCancel');
    if (modalCancel) modalCancel.addEventListener('click', myApp.closeModal);
    var modalConfirm = myApp.$('modalConfirm');
    if (modalConfirm) modalConfirm.addEventListener('click', function () {
      var no = (myApp.$('contractNo') || {}).value;
      var company = (myApp.$('contractCompany') || {}).value;
      var amount = (myApp.$('contractAmount') || {}).value;
      if (!no || !company || !amount) {
        myApp.toast('请填写合同编号、签约企业、成交金额', 'error');
        return;
      }
      var patent = myApp._currentPatent;
      if (patent) {
        patent.status = 'transferred';
        myApp.renderDetail(patent.id);
      }
      myApp.closeModal();
      myApp.toast('转化已确认，合同信息已保存', 'success');
    });
  };

  // === 初始化 ===
  myApp.init = function () {
    myApp.bindEvents();
    myApp.handleRoute();
  };

  // === DOMContentLoaded ===
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', myApp.init);
  } else {
    myApp.init();
  }

  // === hashchange 监听 ===
  window.addEventListener('hashchange', myApp.handleRoute);

  // 暴露命名空间便于调试
  window.myApp = myApp;
})();
