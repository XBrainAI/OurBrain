// PatentGuard - 专利侵权监测与维权取证平台
// 应用主逻辑：SPA 路由 + Mock 数据 + 案件列表/详情/表单交互 + 弹窗 + Toast
// 注意：避免在全局作用域使用 const state/app 等常见变量名，防止与标注引擎冲突

var PatentGuardApp = {
  // 路由表：hash → page-id 映射
  ROUTES: {
    '/infringement-cases': 'P01',
    '/infringement-cases/form': 'P03'
  },

  // 默认首页路由（必须指向 P01 案件列表，非 dashboard/orders/list）
  DEFAULT_ROUTE: '/infringement-cases',

  // 状态标签映射
  STATUS_MAP: {
    monitoring: { label: '监测中', cls: 'status-monitoring' },
    detected: { label: '已发现', cls: 'status-detected' },
    evidence_collected: { label: '已取证', cls: 'status-evidence_collected' },
    complained: { label: '已投诉', cls: 'status-complained' },
    resolved: { label: '已结案', cls: 'status-resolved' }
  },

  // 状态流转顺序（用于详情页时间线轨道）
  STAGE_ORDER: ['monitoring', 'detected', 'evidence_collected', 'complained', 'resolved'],

  // 平台投诉规则（P03 联动 + 弹窗显示）
  PLATFORM_RULES: {
    '淘宝': '淘宝投诉规则：通过阿里知识产权保护平台（ipp.alibabagroup.com）提交，需提供专利证书 +侵权比对表 + 商品链接。处理周期 3-7 个工作日。',
    '京东': '京东投诉规则：通过京东知识产权保护系统（ipr.jd.com）提交，需提供专利证书 + 公证购买记录 + 商品链接。处理周期 5-10 个工作日。',
    '亚马逊': 'Amazon 投诉规则：通过 Brand Registry 提交 Report a Violation，需提供专利号 + Test Buy Affidavit + 产品比对图。处理周期 7-14 个工作日。',
    '1688': '1688 投诉规则：通过阿里知识产权保护平台提交，规则同淘宝，但 B 端卖家需提供经销商授权证明反诉机制。',
    '独立站': '独立站投诉规则：通过 Shopify DMCA / 网站托管方提交，需提供 DMCA Takedown Notice + 专利证书 + 侵权页面快照。',
    '抖音': '抖音投诉规则：通过抖音电商知识产权保护平台（ipr.douyin.com）提交，需提供专利证书 + 商品视频截图 + 链接。处理周期 3-5 个工作日。'
  },

  // === Mock 案件数据：12 条，覆盖 6 个平台 + 5 个状态 ===
  CASES: [
    {
      case_no: 'PAT-20260721-001', platform: '淘宝', suspect_seller: '广州某化工店铺A',
      owner: '奥凯化工', evidence_status: '已存证', lawyer: '陈宇航', operator: '李明',
      status: 'complained', detected_at: '2026-07-15 10:32:00',
      patent: 'ZL202310123456.7', keyword: '奥凯专利配方',
      tx_hash: '0x7a3f9b2c8e1d4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
      block_height: '1,287,402', evidence_time: '2026-07-15 11:42:17',
      evidence_hash: 'sha256:9c4f3a8b2d1e7f6a5c4b3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1',
      snap_url: 'https://item.taobao.com/item.htm?id=6789012345',
      snap_title: '【仿品】奥凯化工同款工业催化剂 高纯度配方',
      snap_price: '¥ 89.00', snap_meta: '月销 1,247 · 评价 312 · 好评率 96%',
      timeline: [
        { stage: 'monitoring', title: '监测任务创建', desc: 'IPR 创建监测任务，绑定关键词"奥凯专利配方"', time: '2026-07-10 09:15:00' },
        { stage: 'detected', title: '爬虫命中侵权链接', desc: '淘宝商品页面命中关键词 + 价格异常', time: '2026-07-15 10:32:00' },
        { stage: 'evidence_collected', title: '区块链存证完成', desc: '商品页面 HTML 快照 + 销售数据已上链 BSN', time: '2026-07-15 11:42:17' },
        { stage: 'complained', title: '阿里知识产权平台投诉', desc: '已生成投诉函并通过 ipp.alibabagroup.com 提交', time: '2026-07-17 14:20:00' }
      ]
    },
    {
      case_no: 'PAT-20260721-002', platform: '京东', suspect_seller: '北京化工专营店B',
      owner: '奥凯化工', evidence_status: '已存证', lawyer: '林婉清', operator: '李明',
      status: 'evidence_collected', detected_at: '2026-07-18 09:20:00',
      patent: 'ZL202310123456.7', keyword: '奥凯化工 催化剂',
      tx_hash: '0x8b4f0c3d9e2e5f6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
      block_height: '1,287,568', evidence_time: '2026-07-18 10:15:43',
      evidence_hash: 'sha256:1f2e3d4c5b6a7081920304f5e6d7c8b9a0f1e2d3c4b5a69788796a5b4c3d2e1f',
      snap_url: 'https://item.jd.com/1009876543.html',
      snap_title: '正品奥凯催化剂 工业级高纯度（仿品实拍）',
      snap_price: '¥ 128.00', snap_meta: '月销 432 · 评价 89 · 好评率 94%',
      timeline: [
        { stage: 'monitoring', title: '监测任务创建', desc: 'IPR 创建监测任务', time: '2026-07-13 16:00:00' },
        { stage: 'detected', title: '爬虫命中侵权链接', desc: '京东商品页面命中图片相似度 87%', time: '2026-07-18 09:20:00' },
        { stage: 'evidence_collected', title: '区块链存证完成', desc: '快照已上链 BSN', time: '2026-07-18 10:15:43' }
      ]
    },
    {
      case_no: 'PAT-20260721-003', platform: '亚马逊', suspect_seller: 'ShenzhenTech Store',
      owner: '奥凯化工', evidence_status: '已存证', lawyer: '周明远', operator: '王芳',
      status: 'complained', detected_at: '2026-07-12 22:10:00',
      patent: 'ZL202310123456.7', keyword: 'Aokai catalyst',
      tx_hash: '0x9c5d1d4e0f3f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
      block_height: '1,286,901', evidence_time: '2026-07-13 01:05:22',
      evidence_hash: 'sha256:2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f',
      snap_url: 'https://www.amazon.com/dp/B0CD45EFGH',
      snap_title: 'Aokai Industrial Catalyst High Purity Formula',
      snap_price: '$ 24.99', snap_meta: 'Sold 1,892 · Reviews 215 · 4.3 stars',
      timeline: [
        { stage: 'monitoring', title: '监测任务创建', desc: '跨境监测，关键词"Aokai catalyst"', time: '2026-07-05 10:00:00' },
        { stage: 'detected', title: '爬虫命中侵权链接', desc: '亚马逊美国站命中 + 销量异常', time: '2026-07-12 22:10:00' },
        { stage: 'evidence_collected', title: '区块链存证完成', desc: '快照已上链 BSN，含多语言版本', time: '2026-07-13 01:05:22' },
        { stage: 'complained', title: 'Brand Registry 投诉', desc: '通过 Amazon Brand Registry 提交 Report a Violation', time: '2026-07-16 09:30:00' }
      ]
    },
    {
      case_no: 'PAT-20260721-004', platform: '1688', suspect_seller: '义乌批发商C',
      owner: '奥凯化工', evidence_status: '未存证', lawyer: '—', operator: '王芳',
      status: 'detected', detected_at: '2026-07-20 14:55:00',
      patent: 'ZL202310123456.7', keyword: '奥凯 工业级',
      tx_hash: '', block_height: '', evidence_time: '', evidence_hash: '',
      snap_url: 'https://detail.1688.com/offer/6789012345678.html',
      snap_title: '工厂直供 奥凯同款催化剂 大批量批发',
      snap_price: '¥ 65.00', snap_meta: '成交 2,341 笔 · 复购率 68%',
      timeline: [
        { stage: 'monitoring', title: '监测任务创建', desc: 'IPR 创建监测任务', time: '2026-07-15 11:00:00' },
        { stage: 'detected', title: '爬虫命中侵权链接', desc: '1688 商品页面命中 + 销量超 2000 高风险', time: '2026-07-20 14:55:00' }
      ]
    },
    {
      case_no: 'PAT-20260721-005', platform: '独立站', suspect_seller: 'bestchem-store.com',
      owner: '奥凯化工', evidence_status: '已存证', lawyer: '周明远', operator: '李明',
      status: 'evidence_collected', detected_at: '2026-07-19 03:25:00',
      patent: 'ZL202310123456.7', keyword: 'aokai formula',
      tx_hash: '0xa0e6f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f',
      block_height: '1,287,201', evidence_time: '2026-07-19 04:10:55',
      evidence_hash: 'sha256:3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5',
      snap_url: 'https://bestchem-store.com/products/aokai-catalyst',
      snap_title: 'Aokai Catalyst - Industrial Grade (Replica)',
      snap_price: '$ 19.99', snap_meta: 'Sold 432 · 3.8 stars',
      timeline: [
        { stage: 'monitoring', title: '监测任务创建', desc: 'Shopify 独立站监测', time: '2026-07-10 09:00:00' },
        { stage: 'detected', title: '爬虫命中侵权链接', desc: '独立站产品页命中', time: '2026-07-19 03:25:00' },
        { stage: 'evidence_collected', title: '区块链存证完成', desc: '快照已上链 BSN', time: '2026-07-19 04:10:55' }
      ]
    },
    {
      case_no: 'PAT-20260721-006', platform: '抖音', suspect_seller: '化工小铺直播间',
      owner: '奥凯化工', evidence_status: '存证中', lawyer: '—', operator: '王芳',
      status: 'detected', detected_at: '2026-07-21 08:40:00',
      patent: 'ZL202310123456.7', keyword: '奥凯 化工 直播',
      tx_hash: '', block_height: '', evidence_time: '', evidence_hash: '',
      snap_url: 'https://haohuo.jinritemai.com/views/goods/item/index?id=3456789012',
      snap_title: '【直播专享】奥凯同款催化剂 限时秒杀',
      snap_price: '¥ 79.00', snap_meta: '直播销量 1,856 · 视频播放 12,341',
      timeline: [
        { stage: 'monitoring', title: '监测任务创建', desc: '短视频监测任务', time: '2026-07-18 09:00:00' },
        { stage: 'detected', title: '爬虫命中直播商品', desc: '抖音直播间商品命中 + 销量超 1000', time: '2026-07-21 08:40:00' }
      ]
    },
    {
      case_no: 'PAT-20260720-007', platform: '淘宝', suspect_seller: '上海试剂店D',
      owner: '奥凯化工', evidence_status: '已存证', lawyer: '陈宇航', operator: '李明',
      status: 'resolved', detected_at: '2026-06-22 11:00:00',
      patent: 'ZL202310123456.7', keyword: '奥凯 化工',
      tx_hash: '0xb1f7a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a',
      block_height: '1,265,432', evidence_time: '2026-06-22 12:15:33',
      evidence_hash: 'sha256:4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6',
      snap_url: 'https://item.taobao.com/item.htm?id=6789019999',
      snap_title: '奥凯同款试剂 高纯度配方（已下架）',
      snap_price: '¥ 95.00', snap_meta: '月销 678 · 评价 156',
      timeline: [
        { stage: 'monitoring', title: '监测任务创建', desc: 'IPR 创建监测任务', time: '2026-06-15 10:00:00' },
        { stage: 'detected', title: '爬虫命中', desc: '淘宝商品命中', time: '2026-06-22 11:00:00' },
        { stage: 'evidence_collected', title: '区块链存证', desc: '快照上链', time: '2026-06-22 12:15:33' },
        { stage: 'complained', title: '阿里知识产权平台投诉', desc: '已提交投诉', time: '2026-06-24 14:00:00' },
        { stage: 'resolved', title: '商品下架结案', desc: '淘宝已下架商品，卖家未申诉', time: '2026-06-28 16:20:00' }
      ]
    },
    {
      case_no: 'PAT-20260720-008', platform: '京东', suspect_seller: '化工旗舰店E',
      owner: '奥凯化工', evidence_status: '已存证', lawyer: '林婉清', operator: '王芳',
      status: 'resolved', detected_at: '2026-06-10 15:30:00',
      patent: 'ZL202310123456.7', keyword: '奥凯 催化',
      tx_hash: '0xc208b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b',
      block_height: '1,261,123', evidence_time: '2026-06-10 16:45:12',
      evidence_hash: 'sha256:5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7',
      snap_url: 'https://item.jd.com/1009812345.html',
      snap_title: '【仿品下架】奥凯催化剂 工业级',
      snap_price: '¥ 110.00', snap_meta: '月销 234 · 评价 67',
      timeline: [
        { stage: 'monitoring', title: '监测任务', desc: 'IPR 创建', time: '2026-06-01 09:00:00' },
        { stage: 'detected', title: '爬虫命中', desc: '京东商品命中', time: '2026-06-10 15:30:00' },
        { stage: 'evidence_collected', title: '区块链存证', desc: '快照上链', time: '2026-06-10 16:45:12' },
        { stage: 'complained', title: '京东 IPR 投诉', desc: '已提交', time: '2026-06-13 10:00:00' },
        { stage: 'resolved', title: '商品下架', desc: '京东下架', time: '2026-06-20 11:30:00' }
      ]
    },
    {
      case_no: 'PAT-20260719-009', platform: '1688', suspect_seller: '化工批发商城F',
      owner: '奥凯化工', evidence_status: '已存证', lawyer: '陈宇航', operator: '李明',
      status: 'resolved', detected_at: '2026-06-05 09:00:00',
      patent: 'ZL202310123456.7', keyword: '奥凯 工业级',
      tx_hash: '0xd319c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c',
      block_height: '1,259,801', evidence_time: '2026-06-05 10:20:45',
      evidence_hash: 'sha256:6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8',
      snap_url: 'https://detail.1688.com/offer/6789099999888.html',
      snap_title: '【已下架】奥凯同款催化剂 批发价',
      snap_price: '¥ 60.00', snap_meta: '成交 1,234 笔',
      timeline: [
        { stage: 'monitoring', title: '监测任务', desc: 'IPR 创建', time: '2026-05-28 10:00:00' },
        { stage: 'detected', title: '爬虫命中', desc: '1688 商品命中', time: '2026-06-05 09:00:00' },
        { stage: 'evidence_collected', title: '区块链存证', desc: '快照上链', time: '2026-06-05 10:20:45' },
        { stage: 'complained', title: '阿里投诉', desc: '已提交', time: '2026-06-07 14:00:00' },
        { stage: 'resolved', title: '商品下架', desc: '卖家主动下架', time: '2026-06-15 09:30:00' }
      ]
    },
    {
      case_no: 'PAT-20260718-010', platform: '亚马逊', suspect_seller: 'ChemPlus Direct',
      owner: '奥凯化工', evidence_status: '已存证', lawyer: '周明远', operator: '王芳',
      status: 'evidence_collected', detected_at: '2026-07-17 19:20:00',
      patent: 'ZL202310123456.7', keyword: 'aokai industrial',
      tx_hash: '0xe42a0d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d',
      block_height: '1,286,512', evidence_time: '2026-07-17 20:05:11',
      evidence_hash: 'sha256:7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9',
      snap_url: 'https://www.amazon.com/dp/B0CD99XYZW',
      snap_title: 'Aokai Industrial Catalyst Replica Sale',
      snap_price: '$ 22.50', snap_meta: 'Sold 312 · Reviews 45 · 4.1 stars',
      timeline: [
        { stage: 'monitoring', title: '监测任务', desc: '亚马逊监测', time: '2026-07-10 09:00:00' },
        { stage: 'detected', title: '爬虫命中', desc: '亚马逊美国站命中', time: '2026-07-17 19:20:00' },
        { stage: 'evidence_collected', title: '区块链存证', desc: '快照上链', time: '2026-07-17 20:05:11' }
      ]
    },
    {
      case_no: 'PAT-20260717-011', platform: '抖音', suspect_seller: '化工干货博主G',
      owner: '奥凯化工', evidence_status: '未存证', lawyer: '—', operator: '李明',
      status: 'monitoring', detected_at: '—',
      patent: 'ZL202310123456.7', keyword: '奥凯 配方',
      tx_hash: '', block_height: '', evidence_time: '', evidence_hash: '',
      snap_url: '', snap_title: '', snap_price: '', snap_meta: '',
      timeline: [
        { stage: 'monitoring', title: '监测任务创建', desc: 'IPR 创建监测任务，等待爬虫命中', time: '2026-07-17 14:00:00' }
      ]
    },
    {
      case_no: 'PAT-20260716-012', platform: '独立站', suspect_seller: 'wholesale-chem.net',
      owner: '奥凯化工', evidence_status: '存证中', lawyer: '—', operator: '王芳',
      status: 'detected', detected_at: '2026-07-16 11:00:00',
      patent: 'ZL202310123456.7', keyword: 'aokai wholesale',
      tx_hash: '', block_height: '', evidence_time: '', evidence_hash: '',
      snap_url: 'https://wholesale-chem.net/aokai-catalyst',
      snap_title: 'Aokai Catalyst Wholesale Replica',
      snap_price: '$ 15.00', snap_meta: 'Sold 145',
      timeline: [
        { stage: 'monitoring', title: '监测任务', desc: '独立站监测', time: '2026-07-08 09:00:00' },
        { stage: 'detected', title: '爬虫命中', desc: '独立站命中', time: '2026-07-16 11:00:00' }
      ]
    }
  ],

  // 当前应用状态（使用命名空间避免冲突）
  appState: {
    currentPage: 'P01',
    currentCaseNo: null,
    selectedCases: new Set(),
    searchFilters: {
      case_no: '', platform: '', seller: '', evidence: '', lawyer: '', status: ''
    },
    page: { current: 1, size: 10 }
  },

  // === 初始化 ===
  init: function () {
    this.bindNavEvents();
    this.bindSearchEvents();
    this.bindActionBarEvents();
    this.bindPaginationEvents();
    this.bindDetailEvents();
    this.bindFormEvents();
    this.bindModalEvents();
    this.bindRouteHandler();

    // 默认路由：如果没有 hash，设置默认首页
    if (!location.hash) {
      location.hash = this.DEFAULT_ROUTE;
    } else {
      this.handleRoute();
    }
  },

  // === SPA 路由切换 ===
  handleRoute: function () {
    var hash = location.hash.replace(/^#/, '') || this.DEFAULT_ROUTE;
    var pageId = this.resolvePageId(hash);

    this.appState.currentPage = pageId;
    document.querySelectorAll('[data-page-id]').forEach(function (page) {
      var pid = page.getAttribute('data-page-id');
      page.hidden = (pid !== pageId);
    });

    // 同步激活态 nav-link
    document.querySelectorAll('.nav-link').forEach(function (link) {
      var linkHash = link.getAttribute('href').replace(/^#/, '');
      link.classList.toggle('active', linkHash === hash);
    });

    // 按页面渲染
    if (pageId === 'P01') {
      this.renderCaseList();
    } else if (pageId === 'P02') {
      this.renderCaseDetail(this.appState.currentCaseNo || 'PAT-20260721-001');
    } else if (pageId === 'P03') {
      this.resetForm();
    }

    // 通知标注引擎刷新
    if (window.__ANNOTATION_ENGINE__) {
      try { window.__ANNOTATION_ENGINE__.refresh(); } catch (e) {}
    }
  },

  // 解析 hash → page-id（支持 /infringement-cases/:id 形式）
  resolvePageId: function (hash) {
    if (this.ROUTES[hash]) return this.ROUTES[hash];
    // 详情页匹配：/infringement-cases/PAT-xxx
    if (hash.indexOf('/infringement-cases/') === 0 && hash !== '/infringement-cases/form') {
      var parts = hash.split('/');
      if (parts.length >= 3) {
        this.appState.currentCaseNo = parts[2];
      }
      return 'P02';
    }
    return 'P01'; // 未知 hash 回退首页
  },

  bindRouteHandler: function () {
    var self = this;
    window.addEventListener('hashchange', function () { self.handleRoute(); });
  },

  // === 导航事件 ===
  bindNavEvents: function () {
    // nav-link 使用 href hash 自动切换，无需额外绑定
  },

  // === 搜索事件 ===
  bindSearchEvents: function () {
    var self = this;
    var btnSearch = document.getElementById('btn-search');
    if (btnSearch) {
      btnSearch.addEventListener('click', function () { self.applySearch(); });
    }
    var btnReset = document.getElementById('btn-reset');
    if (btnReset) {
      btnReset.addEventListener('click', function () { self.resetSearch(); });
    }
  },

  applySearch: function () {
    this.appState.searchFilters.case_no = (document.getElementById('search-case-no').value || '').trim();
    this.appState.searchFilters.platform = document.getElementById('search-platform').value || '';
    this.appState.searchFilters.seller = (document.getElementById('search-seller').value || '').trim();
    this.appState.searchFilters.evidence = document.getElementById('search-evidence').value || '';
    this.appState.searchFilters.lawyer = document.getElementById('search-lawyer').value || '';
    this.appState.searchFilters.status = document.getElementById('search-status').value || '';
    this.appState.page.current = 1;
    this.renderCaseList();
    this.showToast('查询完成');
  },

  resetSearch: function () {
    document.getElementById('search-case-no').value = '';
    document.getElementById('search-platform').value = '';
    document.getElementById('search-seller').value = '';
    document.getElementById('search-evidence').value = '';
    document.getElementById('search-lawyer').value = '';
    document.getElementById('search-status').value = '';
    this.appState.searchFilters = { case_no: '', platform: '', seller: '', evidence: '', lawyer: '', status: '' };
    this.appState.page.current = 1;
    this.renderCaseList();
    this.showToast('已重置搜索条件');
  },

  // === 案件列表渲染 ===
  filterCases: function () {
    var f = this.appState.searchFilters;
    return this.CASES.filter(function (c) {
      if (f.case_no && c.case_no.toLowerCase().indexOf(f.case_no.toLowerCase()) < 0) return false;
      if (f.platform && c.platform !== f.platform) return false;
      if (f.seller && c.suspect_seller.toLowerCase().indexOf(f.seller.toLowerCase()) < 0) return false;
      if (f.evidence && c.evidence_status !== f.evidence) return false;
      if (f.lawyer && c.lawyer !== f.lawyer) return false;
      if (f.status && c.status !== f.status) return false;
      return true;
    });
  },

  renderCaseList: function () {
    var filtered = this.filterCases();
    var tbody = document.getElementById('case-tbody');
    var empty = document.getElementById('empty-state');
    var table = document.getElementById('case-table');
    var self = this;

    // 更新计数
    document.getElementById('case-count').textContent = filtered.length;
    document.getElementById('selected-count').textContent = this.appState.selectedCases.size;

    // 分页计算
    var totalPages = Math.max(1, Math.ceil(filtered.length / this.appState.page.size));
    if (this.appState.page.current > totalPages) this.appState.page.current = totalPages;
    document.getElementById('page-current').textContent = this.appState.page.current;
    document.getElementById('page-total').textContent = totalPages;

    var start = (this.appState.page.current - 1) * this.appState.page.size;
    var pageData = filtered.slice(start, start + this.appState.page.size);

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      table.style.display = 'none';
      empty.hidden = false;
      return;
    }
    table.style.display = '';
    empty.hidden = true;

    tbody.innerHTML = pageData.map(function (c) {
      var statusInfo = self.STATUS_MAP[c.status] || { label: c.status, cls: '' };
      var evCls = c.evidence_status === '未存证' ? 'ev-not' : (c.evidence_status === '存证中' ? 'ev-doing' : 'ev-done');
      var rowCls = '';
      if (c.status === 'detected') rowCls = 'row-detected';
      if (c.status === 'resolved') rowCls = 'row-resolved';
      var selected = self.appState.selectedCases.has(c.case_no) ? 'selected' : '';
      var checked = self.appState.selectedCases.has(c.case_no) ? 'checked' : '';

      return '<tr class="' + rowCls + ' ' + selected + '" data-case-no="' + c.case_no + '">' +
        '<td class="col-check"><input type="checkbox" class="row-check" data-case-no="' + c.case_no + '" ' + checked + '></td>' +
        '<td class="col-case-no">' + c.case_no + '</td>' +
        '<td><span class="platform-tag">' + c.platform + '</span></td>' +
        '<td class="col-seller">' + c.suspect_seller + '</td>' +
        '<td>' + c.owner + '</td>' +
        '<td><span class="evidence-tag ' + evCls + '">' + c.evidence_status + '</span></td>' +
        '<td>' + (c.lawyer === '—' ? '<span class="text-muted">未分配</span>' : c.lawyer) + '</td>' +
        '<td><span class="status-tag ' + statusInfo.cls + '">' + statusInfo.label + '</span></td>' +
        '<td>' + (c.detected_at === '—' ? '<span class="text-muted">—</span>' : c.detected_at) + '</td>' +
        '<td><button class="row-action" data-case-no="' + c.case_no + '">查看</button></td>' +
        '</tr>';
    }).join('');

    // 绑定行内事件
    tbody.querySelectorAll('.row-check').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var caseNo = this.getAttribute('data-case-no');
        if (this.checked) {
          self.appState.selectedCases.add(caseNo);
        } else {
          self.appState.selectedCases.delete(caseNo);
        }
        self.updateBatchButton();
        document.getElementById('selected-count').textContent = self.appState.selectedCases.size;
        var tr = this.closest('tr');
        if (tr) tr.classList.toggle('selected', this.checked);
      });
    });
    tbody.querySelectorAll('.row-action').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var caseNo = this.getAttribute('data-case-no');
        self.appState.currentCaseNo = caseNo;
        location.hash = '/infringement-cases/' + caseNo;
      });
    });

    // 全选
    var checkAll = document.getElementById('check-all');
    if (checkAll) {
      checkAll.checked = pageData.length > 0 && pageData.every(function (c) { return self.appState.selectedCases.has(c.case_no); });
      checkAll.onchange = function () {
        pageData.forEach(function (c) {
          if (this.checked) {
            self.appState.selectedCases.add(c.case_no);
          } else {
            self.appState.selectedCases.delete(c.case_no);
          }
        }.bind(this));
        self.renderCaseList();
      };
    }

    this.updateBatchButton();
  },

  updateBatchButton: function () {
    var btn = document.getElementById('btn-batch-evidence');
    if (!btn) return;
    // 仅当选中行存在未存证案件时启用
    var hasUnevidenced = false;
    this.appState.selectedCases.forEach(function (caseNo) {
      var c = this.CASES.find(function (x) { return x.case_no === caseNo; });
      if (c && c.evidence_status === '未存证') hasUnevidenced = true;
    }.bind(this));
    btn.disabled = !hasUnevidenced;
  },

  // === 操作栏事件 ===
  bindActionBarEvents: function () {
    var self = this;
    var btnNew = document.getElementById('btn-new-monitor');
    if (btnNew) {
      btnNew.addEventListener('click', function () {
        location.hash = '/infringement-cases/form';
      });
    }
    var btnBatch = document.getElementById('btn-batch-evidence');
    if (btnBatch) {
      btnBatch.addEventListener('click', function () {
        if (this.disabled) return;
        self.batchEvidence();
      });
    }
    var btnExport = document.getElementById('btn-export');
    if (btnExport) {
      btnExport.addEventListener('click', function () {
        if (self.appState.selectedCases.size === 0) {
          self.showToast('请先选择要导出的案件', 'error');
          return;
        }
        self.showToast('已生成取证报告 PDF（' + self.appState.selectedCases.size + ' 份）', 'success');
      });
    }
  },

  batchEvidence: function () {
    var self = this;
    var count = 0;
    this.appState.selectedCases.forEach(function (caseNo) {
      var c = self.CASES.find(function (x) { return x.case_no === caseNo; });
      if (c && c.evidence_status === '未存证') {
        c.evidence_status = '存证中';
        count++;
      }
    });
    if (count > 0) {
      this.showToast('已启动 ' + count + ' 条案件的区块链存证任务', 'success');
      this.renderCaseList();
      // 模拟异步完成
      setTimeout(function () {
        self.appState.selectedCases.forEach(function (caseNo) {
          var c = self.CASES.find(function (x) { return x.case_no === caseNo; });
          if (c && c.evidence_status === '存证中') {
            c.evidence_status = '已存证';
            c.tx_hash = '0x' + Math.random().toString(16).substr(2, 64).padEnd(64, '0');
            c.block_height = String(1287000 + Math.floor(Math.random() * 1000));
            c.evidence_time = new Date().toISOString().replace('T', ' ').substr(0, 19);
          }
        });
        self.showToast('[OK] 区块链存证完成', 'success');
        self.renderCaseList();
      }, 1500);
    }
  },

  // === 分页事件 ===
  bindPaginationEvents: function () {
    var self = this;
    var prev = document.getElementById('page-prev');
    var next = document.getElementById('page-next');
    if (prev) {
      prev.addEventListener('click', function () {
        if (self.appState.page.current > 1) {
          self.appState.page.current--;
          self.renderCaseList();
        }
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        var filtered = self.filterCases();
        var totalPages = Math.max(1, Math.ceil(filtered.length / self.appState.page.size));
        if (self.appState.page.current < totalPages) {
          self.appState.page.current++;
          self.renderCaseList();
        }
      });
    }
  },

  // === 案件详情渲染 ===
  renderCaseDetail: function (caseNo) {
    var c = this.CASES.find(function (x) { return x.case_no === caseNo; });
    if (!c) {
      this.showToast('案件不存在: ' + caseNo, 'error');
      location.hash = this.DEFAULT_ROUTE;
      return;
    }
    var statusInfo = this.STATUS_MAP[c.status] || { label: c.status, cls: '' };

    document.getElementById('detail-title').textContent = '案件 ' + c.case_no + ' 详情';
    document.getElementById('d-case-no').textContent = c.case_no;
    document.getElementById('d-platform').innerHTML = '<span class="platform-tag">' + c.platform + '</span>';
    document.getElementById('d-seller').textContent = c.suspect_seller;
    document.getElementById('d-owner').textContent = c.owner;
    document.getElementById('d-status').innerHTML = '<span class="status-tag ' + statusInfo.cls + '">' + statusInfo.label + '</span>';
    document.getElementById('d-evidence').textContent = c.evidence_status;
    document.getElementById('d-lawyer').textContent = c.lawyer;
    document.getElementById('d-operator').textContent = c.operator;

    // 渲染区块链时间线
    this.renderChainTrack(c);

    // 渲染证据快照
    document.getElementById('snap-url').textContent = c.snap_url || '(暂无快照)';
    document.getElementById('snap-body').innerHTML = c.snap_title
      ? '<div class="snap-title">' + c.snap_title + '</div>' +
        '<div class="snap-price">' + c.snap_price + '</div>' +
        '<div class="snap-meta">' + c.snap_meta + '</div>' +
        '<div class="snap-image" aria-hidden="true"></div>'
      : '<div class="empty-state"><div class="empty-icon">∅</div><div class="empty-title">暂无证据快照</div><div class="empty-hint">案件尚未进入取证阶段</div></div>';

    // 区块链哈希
    if (c.tx_hash) {
      document.getElementById('h-chain').textContent = 'BSN 司法链';
      document.getElementById('h-height').textContent = c.block_height;
      document.getElementById('h-tx').textContent = c.tx_hash.substr(0, 10) + '...' + c.tx_hash.substr(-6);
      document.getElementById('h-time').textContent = c.evidence_time;
      document.getElementById('h-hash').textContent = c.evidence_hash ? c.evidence_hash.substr(0, 14) + '...' + c.evidence_hash.substr(-6) : '—';
    } else {
      document.getElementById('h-chain').textContent = '未上链';
      document.getElementById('h-height').textContent = '—';
      document.getElementById('h-tx').textContent = '—';
      document.getElementById('h-time').textContent = '—';
      document.getElementById('h-hash').textContent = '—';
    }

    // 渲染维权处置时间线
    this.renderActionTimeline(c);

    // 按状态显隐操作按钮
    this.updateDetailActions(c);
  },

  renderChainTrack: function (c) {
    var currentIdx = this.STAGE_ORDER.indexOf(c.status);
    if (currentIdx < 0) currentIdx = 0;

    var stageTimes = {};
    (c.timeline || []).forEach(function (t) { stageTimes[t.stage] = t.time; });

    this.STAGE_ORDER.forEach(function (stage, idx) {
      var node = document.querySelector('.chain-node[data-stage="' + stage + '"]');
      if (!node) return;
      node.classList.remove('is-passed', 'is-current');
      if (idx < currentIdx) node.classList.add('is-passed');
      if (idx === currentIdx) node.classList.add('is-current');

      var timeEl = document.getElementById('t-' + stage);
      if (timeEl) timeEl.textContent = stageTimes[stage] || '—';

      // 连线
      var line = node.nextElementSibling;
      if (line && line.classList.contains('chain-line')) {
        line.classList.toggle('is-passed', idx < currentIdx);
      }
    });
  },

  renderActionTimeline: function (c) {
    var container = document.getElementById('action-timeline');
    if (!container) return;
    var self = this;
    var currentIdx = this.STAGE_ORDER.indexOf(c.status);
    var html = (c.timeline || []).map(function (t, idx) {
      var isPending = self.STAGE_ORDER.indexOf(t.stage) > currentIdx;
      var stageLabel = self.STATUS_MAP[t.stage] ? self.STATUS_MAP[t.stage].label : t.stage;
      return '<div class="timeline-item ' + (isPending ? 'is-pending' : '') + '">' +
        '<div class="timeline-stage">STAGE ' + (idx + 1) + ' · ' + stageLabel + '</div>' +
        '<div class="timeline-title">' + t.title + '</div>' +
        '<div class="timeline-desc">' + t.desc + '</div>' +
        '<div class="timeline-time">' + t.time + '</div>' +
        '</div>';
    }).join('');
    if (!html) {
      html = '<div class="empty-state"><div class="empty-title">暂无维权处置记录</div></div>';
    }
    container.innerHTML = html;
  },

  updateDetailActions: function (c) {
    var btnCollect = document.getElementById('btn-collect-evidence');
    var btnComplain = document.getElementById('btn-complain');
    var btnFinish = document.getElementById('btn-finish');
    if (!btnCollect || !btnComplain || !btnFinish) return;

    // 立即存证：仅在"已发现 + 未存证"状态可见
    var showCollect = (c.status === 'detected' && c.evidence_status === '未存证');
    btnCollect.style.display = showCollect ? '' : 'none';

    // 发起投诉：仅在"已取证"状态可见
    var showComplain = (c.status === 'evidence_collected');
    btnComplain.style.display = showComplain ? '' : 'none';

    // 结案：仅在"已投诉"状态可见
    var showFinish = (c.status === 'complained');
    btnFinish.style.display = showFinish ? '' : 'none';
  },

  // === 详情页事件 ===
  bindDetailEvents: function () {
    var self = this;
    var btnCollect = document.getElementById('btn-collect-evidence');
    if (btnCollect) {
      btnCollect.addEventListener('click', function () { self.collectEvidence(); });
    }
    var btnComplain = document.getElementById('btn-complain');
    if (btnComplain) {
      btnComplain.addEventListener('click', function () { self.complainCase(); });
    }
    var btnFinish = document.getElementById('btn-finish');
    if (btnFinish) {
      btnFinish.addEventListener('click', function () { self.openFinishModal(); });
    }
    var btnBack = document.getElementById('btn-back-list');
    if (btnBack) {
      btnBack.addEventListener('click', function () {
        location.hash = self.DEFAULT_ROUTE;
      });
    }
  },

  collectEvidence: function () {
    var c = this.CASES.find(function (x) { return x.case_no === this.appState.currentCaseNo; }.bind(this));
    if (!c) return;
    if (c.status !== 'detected' || c.evidence_status !== '未存证') {
      this.showToast('当前状态不可存证', 'error');
      return;
    }
    c.evidence_status = '存证中';
    this.showToast('区块链存证中...', 'info');
    this.renderCaseDetail(c.case_no);
    var self = this;
    setTimeout(function () {
      c.evidence_status = '已存证';
      c.status = 'evidence_collected';
      c.tx_hash = '0x' + Math.random().toString(16).substr(2, 64).padEnd(64, '0');
      c.block_height = String(1287000 + Math.floor(Math.random() * 1000));
      c.evidence_time = new Date().toISOString().replace('T', ' ').substr(0, 19);
      c.evidence_hash = 'sha256:' + Math.random().toString(16).substr(2, 64);
      c.timeline.push({
        stage: 'evidence_collected',
        title: '区块链存证完成',
        desc: '商品页面 HTML 快照 + 销售数据已上链 BSN',
        time: c.evidence_time
      });
      self.showToast('[OK] 区块链存证完成', 'success');
      self.renderCaseDetail(c.case_no);
    }, 1500);
  },

  complainCase: function () {
    var c = this.CASES.find(function (x) { return x.case_no === this.appState.currentCaseNo; }.bind(this));
    if (!c) return;
    if (c.status !== 'evidence_collected') {
      this.showToast('当前状态不可发起投诉', 'error');
      return;
    }
    var self = this;
    this.openModal('发起平台投诉', '<p>确认对案件 <strong>' + c.case_no + '</strong>（' + c.platform + ' · ' + c.suspect_seller + '）发起平台投诉？</p>' +
      '<p style="margin-top:8px;color:var(--text-secondary);font-size:12px;">将自动生成投诉函并提交至 ' + c.platform + ' 知识产权保护平台。</p>',
      function () {
        c.status = 'complained';
        c.timeline.push({
          stage: 'complained',
          title: c.platform + ' 平台投诉',
          desc: '已生成投诉函并通过平台提交',
          time: new Date().toISOString().replace('T', ' ').substr(0, 19)
        });
        self.closeModal();
        self.showToast('[OK] 已发起平台投诉', 'success');
        self.renderCaseDetail(c.case_no);
      });
  },

  openFinishModal: function () {
    var c = this.CASES.find(function (x) { return x.case_no === this.appState.currentCaseNo; }.bind(this));
    if (!c) return;
    if (c.status !== 'complained') {
      this.showToast('当前状态不可结案', 'error');
      return;
    }
    var self = this;
    var body = '<p style="margin-bottom:12px;">请录入案件 <strong>' + c.case_no + '</strong> 的结案结果：</p>' +
      '<div class="form-field"><span class="field-label">结案方式 <em>*</em></span>' +
      '<select id="finish-type"><option value="平台下架">平台下架</option><option value="卖家和解">卖家和解</option><option value="诉讼终结">诉讼终结</option></select></div>' +
      '<div class="form-field"><span class="field-label">结案说明</span>' +
      '<textarea id="finish-remark" rows="3" placeholder="补充说明"></textarea></div>';
    this.openModal('结案归档', body, function () {
      var finishType = document.getElementById('finish-type').value;
      var finishRemark = document.getElementById('finish-remark').value;
      c.status = 'resolved';
      c.timeline.push({
        stage: 'resolved',
        title: '案件结案 · ' + finishType,
        desc: finishRemark || ('结案方式：' + finishType),
        time: new Date().toISOString().replace('T', ' ').substr(0, 19)
      });
      self.closeModal();
      self.showToast('[OK] 案件已结案归档', 'success');
      self.renderCaseDetail(c.case_no);
    });
  },

  // === 表单页事件 ===
  bindFormEvents: function () {
    var self = this;

    var platformSel = document.getElementById('f-platform');
    if (platformSel) {
      platformSel.addEventListener('change', function () {
        var hint = document.getElementById('platform-rule-hint');
        var platform = this.value;
        if (platform && self.PLATFORM_RULES[platform]) {
          hint.textContent = '[规则] ' + self.PLATFORM_RULES[platform].substr(0, 60) + '...';
        } else {
          hint.textContent = '选择平台后将显示投诉规则提示';
        }
      });
    }

    var btnSubmit = document.getElementById('btn-submit-monitor');
    if (btnSubmit) {
      btnSubmit.addEventListener('click', function () { self.submitForm(); });
    }
    var btnCancel = document.getElementById('btn-cancel-monitor');
    if (btnCancel) {
      btnCancel.addEventListener('click', function () {
        location.hash = self.DEFAULT_ROUTE;
      });
    }
    var btnRule = document.getElementById('btn-platform-rule');
    if (btnRule) {
      btnRule.addEventListener('click', function () { self.showPlatformRule(); });
    }
  },

  resetForm: function () {
    var form = document.getElementById('monitor-form');
    if (form) form.reset();
    var hint = document.getElementById('platform-rule-hint');
    if (hint) hint.textContent = '选择平台后将显示投诉规则提示';
  },

  submitForm: function () {
    var caseNo = document.getElementById('f-case-no').value.trim();
    var platform = document.getElementById('f-platform').value;
    var seller = document.getElementById('f-seller').value.trim();
    var owner = document.getElementById('f-owner').value.trim();

    if (!caseNo || !platform || !seller || !owner) {
      this.showToast('请填写所有必填字段', 'error');
      return;
    }
    // 校验案件编号格式
    if (!/^PAT-\d{8}-\d{3}$/.test(caseNo)) {
      this.showToast('案件编号格式应为 PAT-YYYYMMDD-NNN', 'error');
      return;
    }
    // 校验同一卖家同一专利不可重复立案
    var exists = this.CASES.find(function (c) {
      return c.suspect_seller === seller && c.patent === (document.getElementById('f-patent').value.trim() || 'ZL202310123456.7');
    });
    if (exists) {
      this.showToast('[FAIL] 同一卖家同一专利不可重复立案: ' + exists.case_no, 'error');
      return;
    }

    var newCase = {
      case_no: caseNo, platform: platform, suspect_seller: seller, owner: owner,
      evidence_status: '未存证', lawyer: '—', operator: '李明',
      status: 'monitoring', detected_at: '—',
      patent: document.getElementById('f-patent').value.trim() || '',
      keyword: document.getElementById('f-keyword').value.trim() || '',
      tx_hash: '', block_height: '', evidence_time: '', evidence_hash: '',
      snap_url: '', snap_title: '', snap_price: '', snap_meta: '',
      timeline: [{
        stage: 'monitoring',
        title: '监测任务创建',
        desc: 'IPR 创建监测任务，关键词：' + (document.getElementById('f-keyword').value.trim() || '未设置'),
        time: new Date().toISOString().replace('T', ' ').substr(0, 19)
      }]
    };
    this.CASES.unshift(newCase);
    this.showToast('[OK] 监测任务已创建: ' + caseNo, 'success');
    var self = this;
    setTimeout(function () {
      location.hash = self.DEFAULT_ROUTE;
    }, 800);
  },

  showPlatformRule: function () {
    var platform = document.getElementById('f-platform').value;
    if (!platform) {
      this.showToast('请先选择平台', 'error');
      return;
    }
    var rule = this.PLATFORM_RULES[platform] || '暂无该平台的投诉规则';
    this.openModal(platform + ' 投诉规则', '<p style="line-height:1.7;font-size:13px;">' + rule + '</p>', null);
  },

  // === 弹窗 ===
  bindModalEvents: function () {
    var self = this;
    var closeBtn = document.getElementById('modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () { self.closeModal(); });
    }
    var cancelBtn = document.getElementById('modal-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function () { self.closeModal(); });
    }
    var okBtn = document.getElementById('modal-ok');
    if (okBtn) {
      okBtn.addEventListener('click', function () {
        if (typeof self._modalOkHandler === 'function') {
          self._modalOkHandler();
        } else {
          self.closeModal();
        }
      });
    }
    var mask = document.getElementById('modal-mask');
    if (mask) {
      mask.addEventListener('click', function (e) {
        if (e.target === mask) self.closeModal();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var m = document.getElementById('modal-mask');
        if (m && !m.hidden) self.closeModal();
      }
    });
  },

  openModal: function (title, bodyHtml, onOk) {
    document.getElementById('modal-title').textContent = title || '提示';
    document.getElementById('modal-body').innerHTML = bodyHtml || '';
    this._modalOkHandler = onOk;
    var footer = document.getElementById('modal-footer');
    if (footer) footer.style.display = onOk ? '' : 'none';
    document.getElementById('modal-mask').hidden = false;
  },

  closeModal: function () {
    document.getElementById('modal-mask').hidden = true;
    this._modalOkHandler = null;
  },

  // === Toast ===
  showToast: function (msg, type) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'toast';
    if (type === 'error') toast.classList.add('is-error');
    if (type === 'success') toast.classList.add('is-success');
    toast.hidden = false;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(function () { toast.hidden = true; }, 2800);
  }
};

// === 启动 ===
document.addEventListener('DOMContentLoaded', function () {
  PatentGuardApp.init();
});
