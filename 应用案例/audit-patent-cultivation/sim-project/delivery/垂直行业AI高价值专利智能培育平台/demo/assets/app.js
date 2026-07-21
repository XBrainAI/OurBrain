/* ==============================================================
 * app.js · 智孵 PatentForge 主应用
 * 路由：hash 路由（hashchange 监听 + [data-page-id] hidden 切换）
 * 状态：命名空间 patentApp（避免 const 冲突 - 运行时陷阱 #1）
 * Mock 数据：≥10 条创意，覆盖 5 行业 × 4 状态
 * ============================================================ */

(function (global) {
  "use strict";

  /* ============== 命名空间（避免 const 冲突） ============== */
  var patentApp = {
    state: {
      currentPage: 1,
      pageSize: 10,
      currentRole: "ipr",
      currentIdeaId: null,
      filter: { title: "", industry: "", proposer: "", owner: "", status: "" }
    },
    data: { ideas: [] }
  };

  /* ============== Mock 数据：12 条创意（≥10），覆盖 5 行业 × 4 状态 ============== */
  patentApp.data.ideas = [
    {
      id: "P001", title: "基于液冷主轴的数控机床热误差补偿方法",
      industry: "智能制造", innovation_point: "现有数控机床主轴在高速运转时产生显著热变形，导致加工精度下降。本方案通过在主轴轴承外圈布置螺旋液冷通道，配合温度传感器实时采集主轴前后轴承温度差，结合 BP 神经网络建立热误差预测模型，并通过压电陶瓷执行器进行补偿。相比传统风冷方案，主轴热伸长量降低 78%，加工精度提升 0.5 级。同时设计了冷却液流量自适应控制算法，根据主轴转速动态调节流量，节能 35%。",
      proposer: "陈志远", owner: "林若曦", status: "recommended", score: 88,
      subScores: { innovation: 90, patent: 86, business: 88 },
      graphNode: "数控机床-主轴冷却-液冷",
      layout: {
        core: { title: "液冷主轴结构 + 热误差补偿方法", detail: "权利要求 1-8：螺旋通道结构、温度采集方法、BP 网络模型、压电补偿执行器" },
        outer: { title: "冷却液流量自适应控制算法", detail: "权利要求 9-12：转速-流量映射表、PID 调节、节能优化策略" },
        defense: { title: "风冷-液冷混合散热方案", detail: "权利要求 13-15：风冷备用通道、热切换阀、双模式切换控制" }
      },
      screen: "通过", similar: 3,
      timeline: [
        { time: "2026-06-10 10:23", title: "研发工程师提交创意", note: "陈志远提交", state: "done" },
        { time: "2026-06-10 14:55", title: "非正常专利前置筛查", note: "通过筛查，相似专利 3 件", state: "done" },
        { time: "2026-06-11 09:12", title: "IPR 触发 AI 分析", note: "林若曦触发", state: "done" },
        { time: "2026-06-11 09:38", title: "AI 评分完成", note: "综合分 88 / 高价值", state: "done" },
        { time: "2026-06-12 11:02", title: "推荐培育", note: "已生成布局方案", state: "done" },
        { time: "2026-06-15 待执行", title: "代理师领取撰写任务", note: "待指派", state: "current" }
      ],
      createdAt: "2026-06-10"
    },
    {
      id: "P002", title: "AI 辅助的体外诊断试剂图像识别方法",
      industry: "生物医药", innovation_point: "针对免疫组化染色切片人工判读一致性差、效率低的问题，本方案构建基于 Transformer 注意力机制的细胞核分割模型，配合多尺度特征融合模块，可在 5 秒内完成单张切片的细胞核分割与阳性判定。模型训练集包含 12000 张标注切片，覆盖乳腺癌、胃癌、肺癌 3 个癌种。相比传统 CNN 方法，准确率提升 12%，假阳性率降低 18%。同时设计了切片质量自动评估模块，提前剔除模糊/气泡切片。",
      proposer: "李文静", owner: "周敏华", status: "analyzing", score: null,
      subScores: null, graphNode: "—", layout: null,
      screen: "通过", similar: 5,
      timeline: [
        { time: "2026-07-01 09:00", title: "研发工程师提交创意", note: "李文静提交", state: "done" },
        { time: "2026-07-01 15:20", title: "非正常专利前置筛查", note: "通过筛查，相似专利 5 件", state: "done" },
        { time: "2026-07-02 10:11", title: "IPR 触发 AI 分析", note: "周敏华触发", state: "current" }
      ],
      createdAt: "2026-07-01"
    },
    {
      id: "P003", title: "大语言模型推理显存优化方法",
      industry: "AI软件", innovation_point: "针对 70B 参数大模型在消费级 GPU 上推理显存不足的问题，本方案提出动态 KV-Cache 量化方法：根据 token 注意力权重分布，自动将低重要性的 KV-Cache 量化为 4-bit，高重要性保留 FP16。同时设计了重要性评分的滑动窗口更新算法，避免全局重算。相比 GPTQ 4-bit 全量化，在 MMLU 基准上准确率仅下降 0.8%，但显存占用降低 62%，单卡可运行 70B 模型。包含详细的工程实现：CUDA kernel、PyTorch 集成、batch 推理优化。",
      proposer: "王浩然", owner: "吴志强", status: "recommended", score: 92,
      subScores: { innovation: 95, patent: 90, business: 91 },
      graphNode: "LLM-推理优化-显存",
      layout: {
        core: { title: "动态 KV-Cache 量化方法 + 重要性评分", detail: "权利要求 1-6：评分算法、量化策略、滑动窗口" },
        outer: { title: "CUDA kernel 工程实现", detail: "权利要求 7-10：4-bit 解码 kernel、batch 调度" },
        defense: { title: "全量化方案对比方法", detail: "权利要求 11-13：与 GPTQ/AWQ 对比接口、回退机制" }
      },
      screen: "通过", similar: 2,
      timeline: [
        { time: "2026-05-20 10:30", title: "研发工程师提交创意", note: "王浩然提交", state: "done" },
        { time: "2026-05-20 16:00", title: "非正常专利前置筛查", note: "通过筛查，相似专利 2 件", state: "done" },
        { time: "2026-05-21 09:15", title: "IPR 触发 AI 分析", note: "吴志强触发", state: "done" },
        { time: "2026-05-21 09:42", title: "AI 评分完成", note: "综合分 92 / 高价值", state: "done" },
        { time: "2026-05-22 10:08", title: "推荐培育", note: "已生成布局方案", state: "done" }
      ],
      createdAt: "2026-05-20"
    },
    {
      id: "P004", title: "硅碳负极材料原位包覆制备方法",
      industry: "新材料", innovation_point: "针对硅碳负极材料循环寿命短的问题，本方案提出原位 CVD 包覆方法：在硅纳米颗粒表面原位生长双层碳包覆层，内层为软碳层（厚 5nm）缓冲体积膨胀，外层为硬碳层（厚 3nm）提升导电性。同时设计了两段式 CVD 工艺：先在 600℃ 生长软碳，再在 900℃ 生长硬碳，避免单层包覆应力集中。相比传统机械球磨包覆，循环 500 次容量保持率从 65% 提升至 89%，首效从 78% 提升至 86%。",
      proposer: "张明阳", owner: "林若曦", status: "recommended", score: 86,
      subScores: { innovation: 88, patent: 84, business: 86 },
      graphNode: "锂电-负极-硅碳",
      layout: {
        core: { title: "原位双层 CVD 包覆方法", detail: "权利要求 1-7：软碳/硬碳层、温度梯度、生长时间" },
        outer: { title: "两段式 CVD 工艺装置", detail: "权利要求 8-11：反应炉结构、温度控制、气体流量" },
        defense: { title: "单层包覆对比实施例", detail: "权利要求 12-14：球磨对比、单层对比、性能数据" }
      },
      screen: "通过", similar: 7,
      timeline: [
        { time: "2026-06-25 11:00", title: "研发工程师提交创意", state: "done" },
        { time: "2026-06-25 17:30", title: "非正常专利前置筛查", state: "done" },
        { time: "2026-06-26 09:00", title: "AI 评分完成", note: "综合分 86", state: "done" },
        { time: "2026-06-26 14:00", title: "推荐培育", state: "done" }
      ],
      createdAt: "2026-06-25"
    },
    {
      id: "P005", title: "光伏组件 PID 效应修复装置",
      industry: "新能源", innovation_point: "针对光伏组件在高温高湿环境下发生电势诱导衰减（PID）的问题，本方案设计了一种在线修复装置：夜间组件不发电时段，自动施加反向偏置电压（-1000V），配合红外加热板将组件温度提升至 60℃，加速离子迁移修复。装置含智能控制单元，根据组件衰减程度自动调节修复时长。相比离线修复方案，无需拆卸组件，修复效率提升 4 倍，修复后功率恢复至 97%。",
      proposer: "刘建国", owner: "周敏华", status: "analyzing", score: null,
      subScores: null, graphNode: "—", layout: null,
      screen: "通过", similar: 4,
      timeline: [
        { time: "2026-07-05 09:30", title: "研发工程师提交创意", state: "done" },
        { time: "2026-07-05 14:00", title: "非正常专利前置筛查", state: "done" },
        { time: "2026-07-06 10:00", title: "IPR 触发 AI 分析", note: "周敏华触发", state: "current" }
      ],
      createdAt: "2026-07-05"
    },
    {
      id: "P006", title: "工业机器人末端执行器柔顺控制方法",
      industry: "智能制造", innovation_point: "针对工业机器人在精密装配过程中刚度不可调导致易损坏工件的问题，本方案提出基于阻抗模型的柔顺控制方法：通过六维力传感器实时反馈接触力，结合动力学模型计算期望位置偏移量，实现末端执行器等效刚度从 0.1N/mm 到 100N/mm 的连续可调。相比传统 PID 控制，装配成功率从 82% 提升至 98%，可适应 0.01mm 间隙的精密装配。",
      proposer: "陈志远", owner: "吴志强", status: "draft", score: null,
      subScores: null, graphNode: "—", layout: null,
      screen: "通过", similar: 6,
      timeline: [
        { time: "2026-07-18 10:00", title: "研发工程师提交创意", note: "陈志远提交", state: "done" }
      ],
      createdAt: "2026-07-18"
    },
    {
      id: "P007", title: "mRNA 疫苗脂质纳米颗粒处方筛选方法",
      industry: "生物医药", innovation_point: "针对 mRNA 疫苗 LNP 处方筛选实验周期长、成本高的问题，本方案提出基于高通量微流控芯片 + 机器学习的处方筛选方法：在一张芯片上同时合成 96 种不同比例的 LNP，通过自动化表征平台测量粒径、Zeta 电位、包封率，结合主动学习算法在 3 轮迭代内收敛到最优处方。相比传统 DoE 方法，筛选周期从 3 个月缩短至 2 周。",
      proposer: "李文静", owner: "林若曦", status: "recommended", score: 81,
      subScores: { innovation: 84, patent: 80, business: 79 },
      graphNode: "mRNA-LNP-处方",
      layout: {
        core: { title: "高通量微流控芯片 + 主动学习筛选", detail: "权利要求 1-8：芯片结构、96 通道、主动学习算法" },
        outer: { title: "自动化表征平台", detail: "权利要求 9-12：粒径检测、Zeta 电位、包封率" },
        defense: { title: "传统 DoE 对比实施例", detail: "权利要求 13-15：响应面法、中心组合设计" }
      },
      screen: "通过", similar: 8,
      timeline: [
        { time: "2026-06-15 10:00", title: "提交创意", state: "done" },
        { time: "2026-06-16 09:00", title: "AI 评分完成", note: "综合分 81", state: "done" },
        { time: "2026-06-16 15:00", title: "推荐培育", state: "done" }
      ],
      createdAt: "2026-06-15"
    },
    {
      id: "P008", title: "联邦学习异构客户端聚合方法",
      industry: "AI软件", innovation_point: "针对联邦学习中客户端算力/数据异构导致聚合效率低的问题，本方案提出基于客户端能力画像的自适应聚合方法：根据客户端算力、数据量、网络带宽，动态分配聚合权重，并设计异步聚合机制允许快客户端先行更新。相比 FedAvg 基线，收敛速度提升 35%，准确率提升 4%。",
      proposer: "王浩然", owner: "吴志强", status: "discarded", score: 52,
      subScores: { innovation: 55, patent: 50, business: 51 },
      graphNode: "FL-聚合-异步",
      layout: null,
      screen: "通过", similar: 12,
      timeline: [
        { time: "2026-05-10 10:00", title: "提交创意", state: "done" },
        { time: "2026-05-11 09:00", title: "AI 评分完成", note: "综合分 52 / 低于 60 自动归档", state: "done" },
        { time: "2026-05-11 09:01", title: "自动归档 discarded", note: "评分 < 60，相似专利 12 件，创新性不足", state: "current" }
      ],
      createdAt: "2026-05-10"
    },
    {
      id: "P009", title: "钙钛矿太阳能电池界面修饰材料",
      industry: "新材料", innovation_point: "针对钙钛矿太阳能电池界面复合损失严重的问题，本方案设计了一种新型两性离子型自组装单层界面修饰材料：分子一端为巯基锚定 ITO 电极，另一端为季铵盐基团钝化钙钛矿表面缺陷，中间为共轭 π 桥提升电荷传输。修饰后器件效率从 21.5% 提升至 24.8%，且稳定性提升 50%。",
      proposer: "张明阳", owner: "林若曦", status: "draft", score: null,
      subScores: null, graphNode: "—", layout: null,
      screen: "通过", similar: 9,
      timeline: [
        { time: "2026-07-19 14:30", title: "研发工程师提交创意", note: "张明阳提交", state: "done" }
      ],
      createdAt: "2026-07-19"
    },
    {
      id: "P010", title: "储能系统簇间均衡控制方法",
      industry: "新能源", innovation_point: "针对储能系统电池簇间 SOC 不一致导致可用容量降低的问题，本方案提出基于模型预测控制（MPC）的簇间均衡方法：建立电池簇等效电路模型，预测未来 N 步的 SOC 演化，通过优化求解器计算每簇最优充放电电流。相比传统被动均衡，可用容量提升 8%，均衡时间缩短 60%。",
      proposer: "刘建国", owner: "周敏华", status: "analyzing", score: null,
      subScores: null, graphNode: "—", layout: null,
      screen: "通过", similar: 5,
      timeline: [
        { time: "2026-07-10 09:00", title: "提交创意", state: "done" },
        { time: "2026-07-11 09:30", title: "IPR 触发 AI 分析", state: "current" }
      ],
      createdAt: "2026-07-10"
    },
    {
      id: "P011", title: "面向边缘端的轻量化目标检测网络",
      industry: "AI软件", innovation_point: "针对工业视觉检测在边缘端部署时算力受限的问题，本方案提出深度可分离卷积 + 通道注意力 + 知识蒸馏三合一的轻量化方案：以 YOLOv8 为 teacher 蒸馏 student 模型，参数量从 68M 压缩至 3.2M，在 Jetson Nano 上推理速度达 45FPS，mAP 仅下降 1.8%。设计了面向工业缺陷的迁移学习策略，仅需 50 张标注样本即可完成新缺陷类别的适配。",
      proposer: "陈志远", owner: "吴志强", status: "recommended", score: 79,
      subScores: { innovation: 80, patent: 78, business: 79 },
      graphNode: "工业视觉-检测-轻量化",
      layout: {
        core: { title: "深度可分离卷积 + 通道注意力", detail: "权利要求 1-6：网络结构、注意力模块、激活函数" },
        outer: { title: "知识蒸馏 + 迁移学习策略", detail: "权利要求 7-10：teacher-student 框架、损失函数、少样本适配" },
        defense: { title: "对比 MobileNet/ShuffleNet 实施例", detail: "权利要求 11-13：参数量/速度/mAP 对比数据" }
      },
      screen: "通过", similar: 6,
      timeline: [
        { time: "2026-06-28 09:00", title: "提交创意", state: "done" },
        { time: "2026-06-29 09:00", title: "AI 评分完成", note: "综合分 79", state: "done" },
        { time: "2026-06-29 14:00", title: "推荐培育", state: "done" }
      ],
      createdAt: "2026-06-28"
    },
    {
      id: "P012", title: "微创手术机器人末端力反馈装置",
      industry: "智能制造", innovation_point: "针对微创手术机器人缺乏力反馈导致医生手感缺失的问题，本方案在手术器械末端集成基于光纤光栅传感器的三轴力测量装置，精度达 0.01N，并通过主从控制将末端力映射至医生操作手柄，实现 1:1 力反馈。装置外径仅 5mm，可集成于现有 8mm 戳卡内。相比传统应变片方案，抗电磁干扰能力提升 10 倍，可在 MRI 环境下工作。",
      proposer: "陈志远", owner: "林若曦", status: "draft", score: null,
      subScores: null, graphNode: "—", layout: null,
      screen: "待筛查", similar: null,
      timeline: [
        { time: "2026-07-20 09:00", title: "研发工程师提交创意", note: "陈志远提交", state: "done" }
      ],
      createdAt: "2026-07-20"
    }
  ];

  /* ============== 路由表 ============== */
  var ROUTES = {
    "/patent-ideas": "P01",
    "/patent-ideas/form": "P03"
  };
  var DEFAULT_ROUTE = "/patent-ideas";

  /* ============== 工具函数 ============== */
  function $(id) { return document.getElementById(id); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function getStatusLabel(status) {
    var meta = patentComponents.STATUS_META[status];
    return meta ? meta.label : status;
  }

  function applyRoleFilter(ideas, role) {
    // 研发工程师仅可见本人创意
    if (role === "engineer") {
      // Mock: 当前研发工程师 = 陈志远
      return ideas.filter(function (i) { return i.proposer === "陈志远"; });
    }
    return ideas;
  }

  function applySearchFilter(ideas, filter) {
    return ideas.filter(function (i) {
      if (filter.title && i.title.indexOf(filter.title) < 0) return false;
      if (filter.industry && i.industry !== filter.industry) return false;
      if (filter.proposer && i.proposer.indexOf(filter.proposer) < 0) return false;
      if (filter.owner && i.owner !== filter.owner) return false;
      if (filter.status && i.status !== filter.status) return false;
      return true;
    });
  }

  function paginate(arr, page, size) {
    var total = arr.length;
    var totalPages = Math.max(1, Math.ceil(total / size));
    var p = Math.min(Math.max(1, page), totalPages);
    var start = (p - 1) * size;
    return { items: arr.slice(start, start + size), page: p, totalPages: totalPages, total: total };
  }

  /* ============== 路由切换 ============== */
  function handleRoute() {
    var hash = (location.hash || "").replace(/^#/, "");
    if (!hash) hash = DEFAULT_ROUTE;

    // P02 详情页：/patent-ideas/:id（且不是 form）
    var detailMatch = hash.match(/^\/patent-ideas\/([^\/]+)$/);
    var pageId;
    if (detailMatch && detailMatch[1] !== "form") {
      pageId = "P02";
      patentApp.state.currentIdeaId = decodeURIComponent(detailMatch[1]);
      renderDetailPage(patentApp.state.currentIdeaId);
    } else if (hash === "/patent-ideas/form") {
      pageId = "P03";
      renderFormPage();
    } else {
      pageId = ROUTES[hash] || "P01";
      // 默认首页 P01
      if (pageId === "P01") {
        renderListPage();
      }
    }

    // 切换 [data-page-id] 的 hidden 属性
    $$("[data-page-id]").forEach(function (page) {
      var id = page.getAttribute("data-page-id");
      page.hidden = (id !== pageId);
    });

    // 同步激活态 nav-link
    $$(".nav-link").forEach(function (link) {
      var route = link.getAttribute("data-route") || "";
      var isActive = false;
      if (route === "/patent-ideas/:id" && pageId === "P02") {
        isActive = true;
      } else if (route === hash) {
        isActive = true;
      } else if (route === "/patent-ideas" && (hash === DEFAULT_ROUTE || hash === "/patent-ideas")) {
        isActive = true;
      }
      link.classList.toggle("active", isActive);
    });

    // 通知标注引擎刷新
    if (global.__ANNOTATION_ENGINE__ && typeof global.__ANNOTATION_ENGINE__.refresh === "function") {
      try { global.__ANNOTATION_ENGINE__.refresh(); } catch (e) { /* 静默 */ }
    }

    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ============== P01 列表页渲染 ============== */
  function renderListPage() {
    updateBannerStats();
    renderIdeaTable();
  }

  function updateBannerStats() {
    var all = patentApp.data.ideas;
    $("statTotal").textContent = all.length;
    $("statRecommended").textContent = all.filter(function (i) { return i.status === "recommended"; }).length;
    $("statDiscarded").textContent = all.filter(function (i) { return i.status === "discarded"; }).length;

    // Hero 统计
    var scored = all.filter(function (i) { return i.score != null; });
    var avg = scored.length > 0 ? Math.round(scored.reduce(function (s, i) { return s + i.score; }, 0) / scored.length) : 0;
    var high = scored.filter(function (i) { return i.score >= 85; }).length;
    $("heroStatAvg").textContent = avg;
    $("heroStatHigh").textContent = high;
  }

  function renderIdeaTable() {
    var tbody = $("ideaTableBody");
    var emptyState = $("emptyState");
    var tableWrap = $("ideaTable") ? $("ideaTable").parentElement : null;

    var filtered = applySearchFilter(
      applyRoleFilter(patentApp.data.ideas, patentApp.state.currentRole),
      patentApp.state.filter
    );

    var page = patentApp.state.currentPage;
    var paged = paginate(filtered, page, patentApp.state.pageSize);

    var html = paged.items.map(function (idea) {
      return patentComponents.renderIdeaRow(idea);
    }).join("");
    tbody.innerHTML = html;

    // 空状态
    if (filtered.length === 0) {
      emptyState.hidden = false;
      if (tableWrap) tableWrap.style.display = "none";
    } else {
      emptyState.hidden = true;
      if (tableWrap) tableWrap.style.display = "";
    }

    // 计数
    $("listCount").textContent = filtered.length;

    // 分页
    $("pageCurrent").textContent = paged.page;
    $("pageTotal").textContent = paged.totalPages;
    renderPageNumbers(paged.page, paged.totalPages);

    // 上一页/下一页禁用态
    $("pagePrev").disabled = (paged.page <= 1);
    $("pageNext").disabled = (paged.page >= paged.totalPages);

    // 通知标注引擎刷新（动态渲染 L3 后必须调用）
    notifyAnnotationRefresh();
  }

  function renderPageNumbers(current, total) {
    var holder = $("pageNumbers");
    if (total <= 1) { holder.innerHTML = ""; return; }
    var html = "";
    for (var i = 1; i <= total; i++) {
      html += patentComponents.renderPageNumber(i, i === current);
    }
    holder.innerHTML = html;
  }

  /* ============== P02 详情页渲染 ============== */
  function renderDetailPage(id) {
    var idea = patentApp.data.ideas.filter(function (i) { return i.id === id; })[0];
    if (!idea) {
      // 找不到则跳回列表
      location.hash = DEFAULT_ROUTE;
      return;
    }

    $("detailId").textContent = idea.id;
    $("detailTitle").textContent = idea.title;
    $("detailIndustry").textContent = idea.industry;
    $("detailProposer").textContent = idea.proposer;
    $("detailOwner").textContent = idea.owner;
    $("detailCreated").textContent = idea.createdAt;

    var statusMeta = patentComponents.STATUS_META[idea.status] || patentComponents.STATUS_META.draft;
    var statusTag = $("detailStatus");
    statusTag.textContent = statusMeta.label;
    statusTag.className = "detail-status-tag " + statusMeta.cls;

    // 评分
    if (idea.score != null) {
      var grade = patentComponents.scoreGrade(idea.score);
      $("detailScore").textContent = idea.score;
      $("detailScoreGrade").textContent = grade.grade + " · " + grade.label;
      if (idea.subScores) {
        $("subInnov").style.width = idea.subScores.innovation + "%";
        $("subInnovNum").textContent = idea.subScores.innovation;
        $("subPatent").style.width = idea.subScores.patent + "%";
        $("subPatentNum").textContent = idea.subScores.patent;
        $("subBiz").style.width = idea.subScores.business + "%";
        $("subBizNum").textContent = idea.subScores.business;
      }
    } else {
      $("detailScore").textContent = "—";
      $("detailScoreGrade").textContent = "未评分";
      $("subInnov").style.width = "0%";
      $("subInnovNum").textContent = "—";
      $("subPatent").style.width = "0%";
      $("subPatentNum").textContent = "—";
      $("subBiz").style.width = "0%";
      $("subBizNum").textContent = "—";
    }

    // 布局方案
    $("layoutGraph").textContent = "图谱节点：" + (idea.graphNode || "—");
    var layersHtml = "";
    if (idea.layout) {
      layersHtml += patentComponents.renderLayoutLayer("core", idea.layout.core.title, idea.layout.core.detail);
      layersHtml += patentComponents.renderLayoutLayer("outer", idea.layout.outer.title, idea.layout.outer.detail);
      layersHtml += patentComponents.renderLayoutLayer("defense", idea.layout.defense.title, idea.layout.defense.detail);
    } else {
      layersHtml = '<div class="layout-layer"><div class="layer-body"><div class="layer-title">尚未生成布局方案</div><div class="layer-detail">请先触发 AI 分析</div></div></div>';
    }
    $("layoutLayers").innerHTML = layersHtml;

    // 创新点
    $("detailInnovation").textContent = idea.innovation_point;
    $("detailInnovLen").textContent = idea.innovation_point.length;
    $("detailScreen").textContent = idea.screen || "—";
    $("detailSimilar").textContent = idea.similar != null ? idea.similar : "—";

    // 操作按钮按状态/角色显示
    var recommendBtn = $("recommendBtn");
    var discardBtn = $("discardBtn");
    var exportBtn = $("exportBtn");
    var reanalyzeBtn = $("reanalyzeBtn");

    var isIpr = patentApp.state.currentRole === "ipr";
    var isAgent = patentApp.state.currentRole === "agent";

    // 推荐培育：仅 IPR + 状态为分析中
    recommendBtn.disabled = !(isIpr && idea.status === "analyzing");
    // 归档：仅 IPR + 状态为草稿/分析中
    discardBtn.disabled = !(isIpr && (idea.status === "draft" || idea.status === "analyzing"));
    // 导出：IPR/代理师 + 状态为推荐培育/已归档
    exportBtn.disabled = !((isIpr || isAgent) && (idea.status === "recommended" || idea.status === "discarded"));
    // 重新分析：仅 IPR + 状态非草稿
    reanalyzeBtn.disabled = !(isIpr && idea.status !== "draft");

    // 时间线
    var tlHtml = (idea.timeline || []).map(function (item) {
      return patentComponents.renderTimelineItem(item.time, item.title, item.note, item.state);
    }).join("");
    $("detailTimeline").innerHTML = tlHtml || '<li class="timeline-item"><div class="timeline-title">暂无时间线数据</div></li>';

    // 通知标注引擎刷新
    notifyAnnotationRefresh();
  }

  /* ============== P03 表单页渲染 ============== */
  function renderFormPage() {
    // 重置表单
    var form = $("ideaForm");
    if (form) form.reset();
    $("innovCounter").textContent = "0 / 50 字（最少）";
    ["errTitle", "errProposer", "errOwner", "errInnovation"].forEach(function (id) {
      if ($(id)) $(id).textContent = "";
    });
    ["fTitle", "fProposer", "fOwner", "fInnovation"].forEach(function (id) {
      if ($(id)) $(id).classList.remove("has-error");
    });

    // 渲染同行业去重列表（默认全部）
    renderDedupList("");
  }

  function renderDedupList(industry) {
    var list = $("dedupList");
    var same = patentApp.data.ideas.filter(function (i) {
      if (industry && i.industry !== industry) return false;
      return true;
    });
    if (same.length === 0) {
      list.innerHTML = '<div class="empty-state" style="padding:30px 10px;"><div class="empty-text">该行业暂无已有创意</div></div>';
      return;
    }
    list.innerHTML = same.map(function (i) {
      return patentComponents.renderDedupItem(i);
    }).join("");
  }

  /* ============== 业务操作 ============== */
  function doAnalyze(id) {
    var idea = patentApp.data.ideas.filter(function (i) { return i.id === id; })[0];
    if (!idea) return;
    if (idea.status !== "draft") {
      showToast("该创意状态非草稿，无法触发 AI 分析", "warn");
      return;
    }
    // 异步执行：先置为分析中
    idea.status = "analyzing";
    idea.timeline.push({ time: new Date().toISOString().slice(0, 16).replace("T", " "), title: "IPR 触发 AI 分析", note: patentApp.state.currentRole === "ipr" ? "林若曦触发" : "演示触发", state: "current" });
    showToast("已触发 AI 分析，创意 " + id + " 进入分析中状态", "info");
    renderListPage();
    // 模拟 1.5s 后完成分析
    setTimeout(function () {
      // 生成评分（60-95 随机）
      var score = Math.floor(60 + Math.random() * 35);
      idea.score = score;
      idea.subScores = {
        innovation: Math.max(40, Math.min(100, score + Math.floor(Math.random() * 10 - 5))),
        patent: Math.max(40, Math.min(100, score + Math.floor(Math.random() * 10 - 5))),
        business: Math.max(40, Math.min(100, score + Math.floor(Math.random() * 10 - 5)))
      };
      // 评分 < 60 自动归档
      if (score < 60) {
        idea.status = "discarded";
        idea.timeline.push({ time: new Date().toISOString().slice(0, 16).replace("T", " "), title: "AI 评分完成 - 自动归档", note: "综合分 " + score + " / 低于 60 自动归档", state: "current" });
        showToast("创意 " + id + " 评分 " + score + " < 60，已自动归档", "error");
      } else {
        // 生成布局方案
        idea.graphNode = idea.industry + "-图谱节点-示例";
        idea.layout = {
          core: { title: "核心权利要求保护方案", detail: "权利要求 1-8：核心创新点 + 实施例" },
          outer: { title: "外围应用场景保护方案", detail: "权利要求 9-12：应用场景 + 改进型" },
          defense: { title: "防御性公开方案", detail: "权利要求 13-15：竞争者路径 + 对比" }
        };
        idea.timeline.push({ time: new Date().toISOString().slice(0, 16).replace("T", " "), title: "AI 评分完成", note: "综合分 " + score, state: "done" });
        showToast("创意 " + id + " AI 分析完成，评分 " + score, "success");
      }
      renderListPage();
    }, 1500);
  }

  function doRecommend(id) {
    var idea = patentApp.data.ideas.filter(function (i) { return i.id === id; })[0];
    if (!idea) return;
    if (idea.status !== "analyzing") {
      showToast("仅分析中状态可推荐培育", "warn");
      return;
    }
    idea.status = "recommended";
    idea.timeline.push({ time: new Date().toISOString().slice(0, 16).replace("T", " "), title: "推荐培育", note: "已生成布局方案", state: "done" });
    showToast("创意 " + id + " 已标记推荐培育", "success");
    renderDetailPage(id);
  }

  function doDiscard(id) {
    var idea = patentApp.data.ideas.filter(function (i) { return i.id === id; })[0];
    if (!idea) return;
    openModal({
      title: "确认归档创意",
      body: '即将归档创意 <span class="modal-strong">' + id + " · " + patentComponents.escapeHtml(idea.title) + "</span><br>归档后创意将进入 discarded 状态，不可再推荐培育。<br>此操作可由 IPR 在详情页重新分析后恢复。",
      confirmText: "确认归档",
      onConfirm: function () {
        idea.status = "discarded";
        idea.timeline.push({ time: new Date().toISOString().slice(0, 16).replace("T", " "), title: "IPR 归档", note: "归档原因：暂不培育", state: "current" });
        closeModal();
        showToast("创意 " + id + " 已归档", "info");
        renderDetailPage(id);
      }
    });
  }

  function doExport(id) {
    var idea = patentApp.data.ideas.filter(function (i) { return i.id === id; })[0];
    if (!idea) return;
    showToast("正在导出创意 " + id + " 的培育报告 PDF（Mock）", "info");
    // Mock：1s 后下载提示
    setTimeout(function () {
      var blob = new Blob([
        "智孵 PatentForge 培育报告\n\n",
        "创意编号：", idea.id, "\n",
        "创意标题：", idea.title, "\n",
        "行业领域：", idea.industry, "\n",
        "提出人：", idea.proposer, "\n",
        "责任 IPR：", idea.owner, "\n",
        "AI 评分：", idea.score != null ? idea.score : "未评分", "\n",
        "状态：", getStatusLabel(idea.status), "\n\n",
        "创新点：\n", idea.innovation_point, "\n"
      ], { type: "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "patent-report-" + idea.id + ".txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("创意 " + id + " 报告已下载", "success");
    }, 1000);
  }

  function doReanalyze(id) {
    var idea = patentApp.data.ideas.filter(function (i) { return i.id === id; })[0];
    if (!idea) return;
    openModal({
      title: "重新分析创意",
      body: '即将重新触发 AI 分析创意 <span class="modal-strong">' + id + "</span>，当前评分与布局方案将被覆盖。",
      confirmText: "确认重新分析",
      onConfirm: function () {
        idea.status = "analyzing";
        idea.score = null;
        idea.subScores = null;
        idea.layout = null;
        idea.graphNode = "—";
        idea.timeline.push({ time: new Date().toISOString().slice(0, 16).replace("T", " "), title: "IPR 重新触发分析", note: "覆盖原评分", state: "current" });
        closeModal();
        showToast("创意 " + id + " 已重新进入分析", "info");
        renderDetailPage(id);
      }
    });
  }

  function doBatchAnalyze() {
    var drafts = patentApp.data.ideas.filter(function (i) { return i.status === "draft"; });
    if (drafts.length === 0) {
      showToast("无草稿状态创意可批量分析", "warn");
      return;
    }
    openModal({
      title: "批量 AI 分析",
      body: '即将批量触发 <span class="modal-strong">' + drafts.length + "</span> 条草稿创意的 AI 分析，预计耗时 " + (drafts.length * 1.5) + " 秒。",
      confirmText: "开始批量分析",
      onConfirm: function () {
        closeModal();
        drafts.forEach(function (idea, idx) {
          setTimeout(function () { doAnalyze(idea.id); }, idx * 200);
        });
      }
    });
  }

  function doSubmitForm(e) {
    if (e) e.preventDefault();
    var title = $("fTitle").value.trim();
    var industry = $("fIndustry").value;
    var innovation = $("fInnovation").value.trim();
    var proposer = $("fProposer").value.trim();
    var owner = $("fOwner").value;
    var chkNonNormal = $("chkNonNormal").checked;
    var chkDedup = $("chkDedup").checked;
    var chkGraph = $("chkGraph").checked;

    var hasErr = false;
    // 必填校验
    if (!title) { showFieldError("fTitle", "errTitle", "请输入创意标题"); hasErr = true; }
    else clearFieldError("fTitle", "errTitle");

    if (!industry) { showFieldError("fIndustry", "errTitle", "请选择行业"); hasErr = true; }

    if (!proposer) { showFieldError("fProposer", "errProposer", "请输入提出人"); hasErr = true; }
    else clearFieldError("fProposer", "errProposer");

    if (!owner) { showFieldError("fOwner", "errOwner", "请选择责任 IPR"); hasErr = true; }
    else clearFieldError("fOwner", "errOwner");

    if (!innovation) { showFieldError("fInnovation", "errInnovation", "请输入创新点详述"); hasErr = true; }
    else if (innovation.length < 50) { showFieldError("fInnovation", "errInnovation", "创新点不少于 50 字，当前 " + innovation.length + " 字"); hasErr = true; }
    else clearFieldError("fInnovation", "errInnovation");

    if (hasErr) {
      showToast("表单校验失败，请修正高亮字段", "error");
      return;
    }

    if (!chkNonNormal) {
      showToast("请勾选「已通过非正常专利前置筛查」", "warn");
      return;
    }

    // 同行业去重提示
    var sameIndustry = patentApp.data.ideas.filter(function (i) { return i.industry === industry; });
    if (sameIndustry.length > 0 && !chkDedup) {
      showToast("已存在 " + sameIndustry.length + " 条同行业创意，请勾选「已确认无重复」", "warn");
      return;
    }

    // 创建新创意
    var newId = "P" + String(patentApp.data.ideas.length + 1).padStart(3, "0");
    var newIdea = {
      id: newId,
      title: title,
      industry: industry,
      innovation_point: innovation,
      proposer: proposer,
      owner: owner,
      status: "draft",
      score: null,
      subScores: null,
      graphNode: "—",
      layout: null,
      screen: "待筛查",
      similar: null,
      timeline: [
        { time: new Date().toISOString().slice(0, 16).replace("T", " "), title: "研发工程师提交创意", note: proposer + " 提交", state: "done" }
      ],
      createdAt: new Date().toISOString().slice(0, 10)
    };
    patentApp.data.ideas.unshift(newIdea);
    showToast("创意 " + newId + " 提交成功，已进入草稿状态", "success");

    // 跳转回列表
    setTimeout(function () {
      location.hash = DEFAULT_ROUTE;
    }, 600);
  }

  function showFieldError(inputId, errId, msg) {
    var input = $(inputId);
    var err = $(errId);
    if (input) input.classList.add("has-error");
    if (err) err.textContent = msg;
  }

  function clearFieldError(inputId, errId) {
    var input = $(inputId);
    var err = $(errId);
    if (input) input.classList.remove("has-error");
    if (err) err.textContent = "";
  }

  /* ============== Modal 弹窗（可关闭契约） ============== */
  var modalState = { onConfirm: null };

  function openModal(opts) {
    var mask = $("modalMask");
    $("modalTitle").textContent = opts.title || "提示";
    $("modalBody").innerHTML = opts.body || "";
    $("modalConfirm").textContent = opts.confirmText || "确认";
    modalState.onConfirm = opts.onConfirm || null;
    mask.hidden = false;
  }

  function closeModal() {
    $("modalMask").hidden = true;
    modalState.onConfirm = null;
  }

  /* ============== Toast 通知 ============== */
  function showToast(msg, type) {
    var stack = $("toastStack");
    var toast = document.createElement("div");
    toast.className = "toast t-" + (type || "info");
    toast.textContent = msg;
    stack.appendChild(toast);
    setTimeout(function () {
      toast.classList.add("t-out");
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3000);
  }

  /* ============== 通知标注引擎刷新 ============== */
  function notifyAnnotationRefresh() {
    if (global.__ANNOTATION_ENGINE__ && typeof global.__ANNOTATION_ENGINE__.refresh === "function") {
      try { global.__ANNOTATION_ENGINE__.refresh(); } catch (e) { /* 静默 */ }
    }
  }

  /* ============== 事件绑定 ============== */
  function bindEvents() {
    // 搜索按钮
    $("searchBtn").addEventListener("click", function () {
      patentApp.state.filter = {
        title: $("searchTitle").value.trim(),
        industry: $("searchIndustry").value,
        proposer: $("searchProposer").value.trim(),
        owner: $("searchOwner").value,
        status: $("searchStatus").value
      };
      patentApp.state.currentPage = 1;
      renderIdeaTable();
      showToast("搜索完成", "info");
    });

    // 重置按钮
    $("resetBtn").addEventListener("click", function () {
      $("searchTitle").value = "";
      $("searchIndustry").value = "";
      $("searchProposer").value = "";
      $("searchOwner").value = "";
      $("searchStatus").value = "";
      patentApp.state.filter = { title: "", industry: "", proposer: "", owner: "", status: "" };
      patentApp.state.currentPage = 1;
      renderIdeaTable();
      showToast("已重置筛选条件", "info");
    });

    // 新增创意
    $("newIdeaBtn").addEventListener("click", function () {
      if (patentApp.state.currentRole === "agent") {
        showToast("代理师无 patent-idea:create 权限", "warn");
        return;
      }
      location.hash = "/patent-ideas/form";
    });

    // 批量分析
    $("batchAnalyzeBtn").addEventListener("click", doBatchAnalyze);

    // 表格事件委托（查看 / AI 分析）
    $("ideaTableBody").addEventListener("click", function (e) {
      var target = e.target;
      var actionEl = target.closest("[data-action]");
      if (!actionEl) return;
      var action = actionEl.getAttribute("data-action");
      var id = actionEl.getAttribute("data-id");
      if (!action || !id) return;
      if (action === "view") {
        location.hash = "/patent-ideas/" + encodeURIComponent(id);
      } else if (action === "analyze") {
        doAnalyze(id);
      }
    });

    // 分页
    $("pagePrev").addEventListener("click", function () {
      if (patentApp.state.currentPage > 1) {
        patentApp.state.currentPage--;
        renderIdeaTable();
      }
    });
    $("pageNext").addEventListener("click", function () {
      patentApp.state.currentPage++;
      renderIdeaTable();
    });
    $("pageNumbers").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-action='page']");
      if (!btn) return;
      patentApp.state.currentPage = parseInt(btn.getAttribute("data-page"), 10);
      renderIdeaTable();
    });

    // 详情页操作按钮
    $("recommendBtn").addEventListener("click", function () {
      if (patentApp.state.currentIdeaId) doRecommend(patentApp.state.currentIdeaId);
    });
    $("discardBtn").addEventListener("click", function () {
      if (patentApp.state.currentIdeaId) doDiscard(patentApp.state.currentIdeaId);
    });
    $("exportBtn").addEventListener("click", function () {
      if (patentApp.state.currentIdeaId) doExport(patentApp.state.currentIdeaId);
    });
    $("reanalyzeBtn").addEventListener("click", function () {
      if (patentApp.state.currentIdeaId) doReanalyze(patentApp.state.currentIdeaId);
    });

    // 表单提交
    $("ideaForm").addEventListener("submit", doSubmitForm);
    $("cancelBtn").addEventListener("click", function () {
      location.hash = DEFAULT_ROUTE;
    });
    $("draftBtn").addEventListener("click", function () {
      showToast("已保存为草稿（Mock，未实际写入数据）", "info");
    });

    // 创新点字数计数
    $("fInnovation").addEventListener("input", function () {
      var len = this.value.length;
      var counter = $("innovCounter");
      counter.textContent = len + " / 50 字（最少）";
      if (len >= 50) {
        counter.style.color = "#B8D86B";
      } else if (len > 0) {
        counter.style.color = "#D97706";
      } else {
        counter.style.color = "";
      }
    });

    // 行业选择联动
    $("fIndustry").addEventListener("change", function () {
      var industry = this.value;
      var hint = $("industryHint");
      if (!industry) {
        hint.textContent = "选择行业后，将显示该行业已有创意数量（去重提示）";
        renderDedupList("");
        return;
      }
      var count = patentApp.data.ideas.filter(function (i) { return i.industry === industry; }).length;
      hint.textContent = "当前已存在 " + count + " 条 [" + industry + "] 行业创意，请确认创新点差异";
      hint.style.color = count > 0 ? "#D97706" : "#B8D86B";
      renderDedupList(industry);
    });

    // 角色切换
    $("roleSwitcher").addEventListener("change", function () {
      patentApp.state.currentRole = this.value;
      patentApp.state.currentPage = 1;
      var roleName = { ipr: "企业 IPR", agent: "代理师", engineer: "研发工程师" }[this.value];
      showToast("已切换至 " + roleName + " 视角", "info");
      // 如果当前在列表页，重新渲染
      var activePage = document.querySelector("[data-page-id]:not([hidden])");
      if (activePage && activePage.getAttribute("data-page-id") === "P01") {
        renderListPage();
      }
    });

    // Modal 关闭契约（运行时契约：必须绑定 click 事件）
    $("modalClose").addEventListener("click", closeModal);
    $("modalCancel").addEventListener("click", closeModal);
    $("modalMask").addEventListener("click", function (e) {
      if (e.target === this) closeModal();
    });
    $("modalConfirm").addEventListener("click", function () {
      if (typeof modalState.onConfirm === "function") {
        modalState.onConfirm();
      } else {
        closeModal();
      }
    });
    // ESC 关闭
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !$("modalMask").hidden) {
        closeModal();
      }
    });

    // 路由
    global.addEventListener("hashchange", handleRoute);
  }

  /* ============== 标注数据：window.__ANNOTATION_DATA__ ============== */
  global.__ANNOTATION_DATA__ = {
    P01: {
      L1: {
        summary: "P01 专利创意列表页，分页展示企业所有创意及培育状态",
        entry: "顶部导航「01 · 创意池」或默认路由 /patent-ideas",
        precondition: "已登录且拥有 patent-idea:read 权限；研发工程师仅可见本人创意",
        data_entity: "patent-idea",
        business_rules: [
          "研发工程师仅看到自己提交的创意（数据范围 own）",
          "IPR 与代理师可见全部创意（数据范围 all）",
          "支持按标题、行业、提出人、责任 IPR、状态搜索",
          "AI 评分 < 60 自动归档 discarded",
          "推荐培育必须绑定产业图谱节点",
          "默认路由 /patent-ideas，非 /orders /dashboard"
        ],
        test_data: "12 条 Mock 创意，覆盖 5 行业 × 4 状态（草稿/分析中/推荐培育/已归档）"
      },
      L2: [
        { id: "P01-R-001", zone: "Hero 概览区", description: "顶部 Hero 区域：展示创意池总体统计（总数、平均 AI 评分、高价值数、覆盖行业数），阐述培育流程" },
        { id: "P01-R-002", zone: "搜索区", description: "5 字段搜索表单：标题、行业、提出人、责任 IPR、状态 + 搜索/重置按钮" },
        { id: "P01-R-003", zone: "操作栏", description: "左侧计数与权限说明；右侧新增创意（需 create 权限）+ 批量 AI 分析按钮" },
        { id: "P01-R-004", zone: "数据表格", description: "8 列表格：编号/标题/行业/提出人/AI 评分/责任 IPR/状态/操作；行内查看 + AI 分析按钮（草稿状态可点）" },
        { id: "P01-R-005", zone: "分页区", description: "上一页/下一页 + 页码按钮；每页 10 条；空数据时显示空状态" }
      ],
      L3: [
        { id: "P01-C-001", element: "搜索按钮", zone: "P01-R-002", function: "触发搜索", trigger: "click", condition: "无", response: "表格刷新为搜索结果", state: "搜索条件已应用", exception: "搜索条件为空时展示全部" },
        { id: "P01-C-002", element: "重置按钮", zone: "P01-R-002", function: "清空搜索条件", trigger: "click", condition: "无", response: "所有字段清空，表格刷新", state: "无筛选", exception: "无" },
        { id: "P01-C-003", element: "新增创意按钮", zone: "P01-R-003", function: "跳转到新增创意表单页", trigger: "click", condition: "用户拥有 patent-idea:create 权限（IPR/工程师）", response: "location.hash = /patent-ideas/form", state: "P03 表单页加载", exception: "代理师无权限，按钮点击弹 toast 警告" },
        { id: "P01-C-004", element: "批量 AI 分析按钮", zone: "P01-R-003", function: "批量触发所有草稿创意的 AI 分析", trigger: "click", condition: "存在草稿状态创意", response: "弹出确认弹窗，确认后逐条触发分析", state: "草稿创意状态变为分析中", exception: "无草稿时弹 toast 提示" },
        { id: "P01-C-005", element: "上一页按钮", zone: "P01-R-005", function: "翻到上一页", trigger: "click", condition: "当前页 > 1", response: "表格刷新为上一页数据", state: "页码减 1", exception: "已在第一页时按钮禁用" },
        { id: "P01-C-006", element: "下一页按钮", zone: "P01-R-005", function: "翻到下一页", trigger: "click", condition: "当前页 < 总页数", response: "表格刷新为下一页数据", state: "页码加 1", exception: "已在最后一页时按钮禁用" }
      ]
    },
    P02: {
      L1: {
        summary: "P02 创意详情页，展示创意全部信息、AI 评分、分层布局方案、操作按钮",
        entry: "创意列表点击「查看」按钮或表格标题",
        precondition: "已登录且拥有 patent-idea:read 权限",
        data_entity: "patent-idea",
        business_rules: [
          "仅 IPR 可执行推荐培育（状态须为分析中）",
          "仅 IPR 可执行归档（状态须为草稿/分析中）",
          "推荐培育状态下不可归档（按钮禁用）",
          "状态流转：草稿 → 分析中 → 推荐培育 / 已归档",
          "评分低于60分自动归档 discarded",
          "推荐培育必须绑定产业图谱节点（图谱节点：xxx）"
        ],
        test_data: "12 条创意任选其一查看详情，覆盖各状态、各行业"
      },
      L2: [
        { id: "P02-R-001", zone: "详情头部", description: "展示创意编号、状态标签、标题、行业、提出人、责任 IPR、提交时间" },
        { id: "P02-R-002", zone: "评分与布局区", description: "左侧评分卡（综合分 + 三维子分进度条 + 评分规则）；右侧分层布局方案（核心/外围/防御三层 + 图谱节点）" },
        { id: "P02-R-003", zone: "创新点描述区", description: "创新点详述文本（纸张样式）+ 字数 + 非正常筛查状态 + 相似专利数" },
        { id: "P02-R-004", zone: "操作按钮区", description: "推荐培育/归档/导出/重新分析 4 个按钮，按状态与角色显示禁用态" }
      ],
      L3: [
        { id: "P02-C-001", element: "推荐培育按钮", zone: "P02-R-004", function: "推进培育流程", trigger: "click", condition: "状态为分析中 + 当前角色 IPR", response: "状态更新为推荐培育，时间线追加记录", state: "按钮组刷新", exception: "非分析中状态或非 IPR 角色时按钮禁用" },
        { id: "P02-C-002", element: "归档按钮", zone: "P02-R-004", function: "归档创意", trigger: "click", condition: "状态为草稿/分析中 + 当前角色 IPR", response: "弹出确认弹窗，确认后状态置为 discarded", state: "确认弹窗显示", exception: "推荐培育/已归档状态按钮禁用" },
        { id: "P02-C-003", element: "导出按钮", zone: "P02-R-004", function: "导出培育报告", trigger: "click", condition: "当前角色 IPR/代理师 + 状态为推荐培育/已归档", response: "下载 PDF/TXT 报告文件", state: "无状态变更", exception: "无权限或状态不对时按钮禁用" },
        { id: "P02-C-004", element: "重新分析按钮", zone: "P02-R-004", function: "重新触发 AI 分析", trigger: "click", condition: "当前角色 IPR + 状态非草稿", response: "弹出确认弹窗，确认后状态置为分析中，原评分清空", state: "评分卡刷新", exception: "草稿状态按钮禁用" }
      ]
    },
    P03: {
      L1: {
        summary: "P03 创意培育表单页，研发工程师提交技术创意",
        entry: "创意列表点击「新增创意」按钮",
        precondition: "已登录且拥有 patent-idea:create 权限（IPR/工程师）",
        data_entity: "patent-idea",
        business_rules: [
          "标题、行业、创新点、提出人、责任 IPR 为必填",
          "创新点不少于 50 字",
          "提交后自动进入草稿状态，可触发 AI 分析",
          "同行业创意去重提示（已存在 X 条同行业创意）",
          "提交前自检：非正常筛查 / 去重确认 / 图谱绑定"
        ],
        test_data: "空表单或回填的创意数据；行业下拉联动显示同行业已有创意"
      },
      L2: [
        { id: "P03-R-001", zone: "表单区", description: "5 字段表单：标题、行业、创新点（文本域）、提出人、责任 IPR + 提交前自检清单" },
        { id: "P03-R-002", zone: "同行业去重参考区", description: "选择行业后，下方列表显示该行业已有创意（编号/标题/提出人/评分），辅助去重判断" }
      ],
      L3: [
        { id: "P03-C-001", element: "提交按钮", zone: "P03-R-001", function: "提交创意", trigger: "click", condition: "表单校验通过 + 已勾选非正常筛查 + 同行业去重勾选", response: "保存数据并跳转 /patent-ideas，新创意出现在表格首行", state: "列表页刷新", exception: "校验失败时高亮错误字段，弹 toast 警告" },
        { id: "P03-C-002", element: "取消按钮", zone: "P03-R-001", function: "取消编辑", trigger: "click", condition: "无", response: "返回上一页（创意列表）", state: "不保存任何修改", exception: "无" },
        { id: "P03-C-003", element: "保存为草稿按钮", zone: "P03-R-001", function: "保存为草稿（Mock）", trigger: "click", condition: "无", response: "弹 toast 提示已保存", state: "无实际数据变更（演示用）", exception: "无" }
      ]
    }
  };

  /* ============== 初始化 ============== */
  function init() {
    bindEvents();
    // 默认路由（避免空 hash）
    if (!location.hash) {
      location.hash = DEFAULT_ROUTE;
    } else {
      handleRoute();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // 暴露给调试用
  global.patentApp = patentApp;

})(typeof window !== "undefined" ? window : this);
