// ====================================================================== //
// app.js - 壹专利智能助手 Demo 应用入口                                   //
// [约束#1] IIFE 包裹                                                      //
// [约束#4] 路由 meta.pageId 与 annotationData key 对应                    //
// [约束#5] useRoute()/useRouter() 仅在 setup() 内调用                     //
// [约束#7] 标注变量名统一 showAnnotation / activeTab                      //
// [约束#8] App 根元素 .layout 绑定 :class="{ 'annotation-on': showAnnotation }" //
// [约束#10] Mock 数据统一来自 AppState，不在组件中硬编码                    //
// [约束#11] 静态路由排在动态路由之前                                       //
// ====================================================================== //
(function () {

  // ------------------------------------------------------------------ //
  // Mock 数据定义                                                        //
  // ------------------------------------------------------------------ //
  var MOCK_PATENTS = [
    {
      publicationNumber: 'CN115432101A',
      title: '一种冰箱制冷控制方法及系统',
      applicant: '小米科技有限责任公司',
      applicationDate: '2023-03-15',
      patentType: '发明专利',
      legalStatus: '实质审查',
      abstract: '本发明涉及冰箱制冷控制领域，具体公开了一种冰箱制冷控制方法及系统。该方法包括：获取冰箱内部温度数据；根据温度数据判断是否需要启动制冷；若需要启动制冷，则根据预设的制冷策略控制压缩机运行。本发明能够实现冰箱制冷的智能控制，提高制冷效率。',
      citations: 12,
      familySize: 5
    },
    {
      publicationNumber: 'CN115432102B',
      title: '冰箱智能温控装置',
      applicant: '小米科技有限责任公司',
      applicationDate: '2023-05-20',
      patentType: '发明专利',
      legalStatus: '授权',
      abstract: '本发明公开了一种冰箱智能温控装置，包括温度传感器、控制单元和执行单元。控制单元根据温度传感器采集的数据，结合用户使用习惯和环境温度，动态调整冰箱的工作模式，实现精准控温与节能的平衡。',
      citations: 8,
      familySize: 3
    },
    {
      publicationNumber: 'CN115432103U',
      title: '冰箱门体结构',
      applicant: '小米科技有限责任公司',
      applicationDate: '2022-11-10',
      patentType: '实用新型',
      legalStatus: '授权',
      abstract: '本实用新型涉及一种冰箱门体结构，包括门体、铰链和密封条。门体通过铰链与冰箱箱体连接，密封条设置在门体与箱体的接触面上，有效提升密封性能。',
      citations: 3,
      familySize: 1
    }
  ];

  // --- 从 vv 案例提取：智能驾驶专利详情数据 ---
  var MOCK_PATENTS_DRIVING = [
    { publicationNumber: 'CN118765432A', title: '基于多模态融合的智能驾驶环境感知方法及系统', applicant: '小米科技有限责任公司', applicationDate: '2025-04-12', patentType: '发明专利', legalStatus: '授权', abstract: '本发明公开了一种基于多模态融合的智能驾驶环境感知方法，通过融合摄像头、毫米波雷达和激光雷达数据，实现复杂天气条件下的高精度环境感知。', citations: 87, familySize: 12 },
    { publicationNumber: 'CN118567890A', title: '智能驾驶决策规划方法、装置及车辆', applicant: '小米汽车科技有限公司', applicationDate: '2025-01-20', patentType: '发明专利', legalStatus: '实质审查', abstract: '本申请提供一种智能驾驶决策规划方法，结合深度强化学习和规则决策，在城市复杂路口场景下实现安全高效的驾驶决策。', citations: 15, familySize: 4 },
    { publicationNumber: 'CN118234567A', title: '车辆自主泊车控制方法及系统', applicant: '小米科技有限责任公司', applicationDate: '2024-09-15', patentType: '发明专利', legalStatus: '授权', abstract: '本发明涉及一种车辆自主泊车控制方法，通过超声波传感器阵列和视觉SLAM技术，实现狭小车位的自主泊入泊出。', citations: 6, familySize: 3 },
    { publicationNumber: 'CN117890123A', title: '基于V2X的智能驾驶协同控制方法', applicant: '小米汽车科技有限公司', applicationDate: '2024-06-08', patentType: '发明专利', legalStatus: '实质审查', abstract: '本申请提供一种基于车路协同（V2X）的智能驾驶控制方法，通过路侧单元与车载单元的实时通信，实现超视距感知和协同决策。', citations: 9, familySize: 5 },
    { publicationNumber: 'CN117654321A', title: '智能驾驶中的目标跟踪方法及装置', applicant: '小米科技有限责任公司', applicationDate: '2024-02-28', patentType: '发明专利', legalStatus: '授权', abstract: '本发明公开了一种智能驾驶中的多目标跟踪方法，基于Transformer架构的特征融合网络，在密集交通场景下实现稳定的目标跟踪。', citations: 11, familySize: 3 },
    { publicationNumber: 'CN117123456A', title: '驾驶行为预测模型训练方法及智能驾驶控制方法', applicant: '小米汽车科技有限公司', applicationDate: '2023-09-22', patentType: '发明专利', legalStatus: '授权', abstract: '本申请提供一种驾驶行为预测方法，基于图神经网络建模道路参与者之间的交互关系，实现对其他车辆驾驶意图的精准预测。', citations: 14, familySize: 6 },
    { publicationNumber: 'CN116789012A', title: '自动驾驶仿真测试场景生成方法', applicant: '小米科技有限责任公司', applicationDate: '2023-06-15', patentType: '发明专利', legalStatus: '授权', abstract: '本发明涉及一种自动驾驶仿真测试场景的自动生成方法，基于真实路采数据构建数字孪生场景库，提升仿真测试的覆盖率和真实性。', citations: 8, familySize: 2 },
    { publicationNumber: 'CN116543210A', title: '车辆行驶路径规划方法及装置', applicant: '小米汽车科技有限公司', applicationDate: '2023-04-10', patentType: '发明专利', legalStatus: '授权', abstract: '本申请提供一种基于时空联合规划的路径规划方法，同时考虑动态障碍物预测和自车运动约束，生成安全舒适的行驶轨迹。', citations: 5, familySize: 3 }
  ];

  // --- 从 vv 案例提取：人形机器人专利数据 ---
  var MOCK_PATENTS_ROBOT = [
    { publicationNumber: 'US20251234567A1', title: '基于模型预测控制的人形机器人动态行走方法', applicant: 'Tesla', applicationDate: '2025-03-15', patentType: '发明专利', legalStatus: '授权', abstract: '本发明公开了一种基于模型预测控制（MPC）的人形机器人动态行走方法，通过实时优化全身动力学模型，实现复杂地形下的稳定行走。', citations: 87, familySize: 12 },
    { publicationNumber: 'CN118765432A', title: '基于多模态大模型的人形机器人交互系统', applicant: '华为', applicationDate: '2025-02-20', patentType: '发明专利', legalStatus: '授权', abstract: '本发明涉及一种基于视觉-语言-动作（VLA）大模型的人形机器人交互系统，实现自然语言指令到机器人动作的端到端控制。', citations: 45, familySize: 8 },
    { publicationNumber: 'WO2025123456A1', title: '基于触觉反馈的灵巧手操作控制', applicant: 'Figure AI', applicationDate: '2025-01-10', patentType: '发明专利', legalStatus: '授权', abstract: '本发明公开了一种基于触觉反馈的灵巧手操作控制方法，通过指尖触觉传感器实现自适应抓取力度调整。', citations: 32, familySize: 6 },
    { publicationNumber: 'CN118456789A', title: '人形机器人全身协同控制方法', applicant: '优必选', applicationDate: '2024-12-05', patentType: '发明专利', legalStatus: '授权', abstract: '本发明涉及人形机器人全身协同控制方法，通过分层控制架构实现上肢操作与下肢行走的协调配合。', citations: 18, familySize: 4 },
    { publicationNumber: 'US20249876543A1', title: '人形机器人动态越障方法', applicant: 'Boston Dynamics', applicationDate: '2024-10-20', patentType: '发明专利', legalStatus: '授权', abstract: '本发明公开了一种人形机器人动态越障方法，通过实时路径重规划和动态平衡控制实现复杂障碍物跨越。', citations: 22, familySize: 5 }
  ];

  // --- 从 vv 案例提取：语义检索专利数据 ---
  var MOCK_PATENTS_SEMANTIC = [
    { publicationNumber: 'US20230404487A1', title: 'Head-mounted display with integrated eye tracking and head tracking', applicant: 'Apple Inc.', applicationDate: '2022-06-20', patentType: '发明专利', legalStatus: '实质审查', abstract: 'A head-mounted display device with integrated eye tracking and head tracking modules, allowing gaze-based interaction through a single control device.', citations: 56, familySize: 8 },
    { publicationNumber: 'EP4000523B1', title: 'Gaze-based interaction in head-mounted display', applicant: 'Magic Leap, Inc.', applicationDate: '2020-07-15', patentType: '发明专利', legalStatus: '授权', abstract: 'A head-mounted display apparatus with a transparent visor and integrated eye tracking and head tracking modules for gaze-based interaction.', citations: 42, familySize: 6 },
    { publicationNumber: 'CN116456789A', title: '头戴式显示装置及注视交互方法', applicant: '华为技术', applicationDate: '2023-08-10', patentType: '发明专利', legalStatus: '授权', abstract: '本发明公开了一种头戴式显示装置及注视交互方法，通过眼动追踪实现基于注视的界面交互。', citations: 15, familySize: 3 },
    { publicationNumber: 'CN115678901A', title: '基于单控制设备的眼动追踪交互系统', applicant: '歌尔光学', applicationDate: '2023-03-25', patentType: '发明专利', legalStatus: '授权', abstract: '本发明涉及一种基于单控制设备的眼动追踪交互系统，通过单一控制设备实现复杂的注视交互操作。', citations: 8, familySize: 2 },
    { publicationNumber: 'CN114567890A', title: '头戴式智能显示设备', applicant: 'OPPO', applicationDate: '2022-11-15', patentType: '发明专利', legalStatus: '授权', abstract: '本发明公开了一种头戴式智能显示设备，集成显示模块、追踪模块和交互模块。', citations: 5, familySize: 2 }
  ];

  var MOCK_CONVERSATIONS = [
    { id: 'c1', title: '小米冰箱专利检索', createdAt: '06-15 14:30', messageCount: 4, status: 'active' },
    { id: 'c2', title: '小米智能驾驶专利分析', createdAt: '06-20 09:15', messageCount: 3, status: 'ended' },
    { id: 'c3', title: '人形机器人专利分析', createdAt: '06-22 10:00', messageCount: 5, status: 'ended' },
    { id: 'c4', title: '专利有效期知识问答', createdAt: '06-25 16:00', messageCount: 3, status: 'ended' },
    { id: 'c5', title: 'EP4000523B1和US20230404487A1对比', createdAt: '06-26 11:00', messageCount: 1, status: 'ended' },
    { id: 'c6', title: '语义检索头戴式显示装置', createdAt: '06-27 09:30', messageCount: 1, status: 'ended' },
    { id: 'c7', title: '比亚迪vs宁德时代电池专利对比', createdAt: '06-27 15:00', messageCount: 1, status: 'ended' },
    { id: 'c8', title: '华为近5年5G专利趋势', createdAt: '06-28 11:30', messageCount: 1, status: 'ended' }
  ];

  var MOCK_CAPABILITIES = [
    { icon: 'Q', title: '专利检索', desc: '自然语言提问即可检索全球专利', example: '小米公司近3年的冰箱专利' },
    { icon: 'S', title: '统计分析', desc: '专利数量趋势、申请人排名等', example: '小米公司近5年每年的智能驾驶专利数量情况' },
    { icon: 'V', title: '对比分析', desc: '多维度对比分析不同申请人', example: '比亚迪vs宁德时代电池专利' },
    { icon: 'K', title: '知识问答', desc: '专利法律知识、申请流程指导', example: '专利有效期是多少？' },
    { icon: 'G', title: '使用指引', desc: '指导您使用壹专利平台功能', example: '数据库收录的数据范围？' },
    { icon: 'R', title: '专利分析', desc: '行业趋势、保护范围深度分析', example: '今年人形机器人专利主要是哪些公司申请的，创新方向是什么？' }
  ];

  var MOCK_EXAMPLE_QUESTIONS = [
    '小米公司近5年每年的智能驾驶专利数量情况',
    '今年人形机器人专利主要是哪些公司申请的，创新方向是什么？',
    'EP4000523B1和US20230404487A1保护范围的差别详细比较下',
    '专利有效期是多少？',
    '数据库收录的数据范围？'
  ];

  var MOCK_MESSAGES = [
    {
      id: 'm1',
      role: 'user',
      content: '小米近3年的冰箱专利',
      contentType: 'text',
      createdAt: '14:30',
      feedback: 'none',
      isStreaming: false
    },
    {
      id: 'm2',
      role: 'assistant',
      content: '为您检索到小米科技有限责任公司近3年的冰箱相关专利共 <strong>3</strong> 件，其中发明专利 2 件，实用新型 1 件。以下是详细列表：',
      contentType: 'mixed',
      createdAt: '14:30',
      feedback: 'like',
      isStreaming: false,
      thinkingProcess: '1. 解析用户意图：用户想要检索小米近3年的冰箱相关专利\n2. 构建检索式：AP=(小米科技有限责任公司) AND TI=(冰箱) AND AD=(2022-2025)\n3. 在中国专利数据库中执行检索\n4. 对结果进行分类统计：发明专利2件，实用新型1件\n5. 生成结构化回答并附上推荐追问',
      thinkingExpanded: false,
      patentTable: MOCK_PATENTS,
      dataSource: '检索式: AP=(小米科技有限责任公司) AND TI=(冰箱) AND AD=(2022-2025) | 数据库: 中国专利 | 命中: 3 件 | 检索时间: 0.8s',
      recommendations: ['小米冰箱专利的授权率如何？', '对比海尔冰箱专利布局', '查看CN115432101A的详细技术方案'],
      contextNote: null,
      contextType: null,
      route: 'SOP'
    },
    {
      id: 'm3',
      role: 'user',
      content: '哪些是发明专利？',
      contentType: 'text',
      createdAt: '14:32',
      feedback: 'none',
      isStreaming: false
    },
    {
      id: 'm4',
      role: 'assistant',
      content: '在上文检索结果中，发明专利共 <strong>2</strong> 件，分别是 <span class="patent-link" onclick="window.AppState.viewPatentDetailById(\'CN115432101A\')">CN115432101A</span> 和 <span class="patent-link" onclick="window.AppState.viewPatentDetailById(\'CN115432102B\')">CN115432102B</span>。',
      contentType: 'text',
      createdAt: '14:32',
      feedback: 'none',
      isStreaming: false,
      thinkingProcess: '1. 解析用户意图：用户想在上文检索结果中筛选出发明专利\n2. 提取上文检索结果的上下文信息（共3件专利）\n3. 筛选条件：patentType = 发明专利\n4. 从3件中筛选出2件发明专利\n5. 生成回答',
      thinkingExpanded: false,
      patentTable: [MOCK_PATENTS[0], MOCK_PATENTS[1]],
      dataSource: '筛选条件: PT=(发明专利) | 命中: 2 件',
      recommendations: ['这2件发明专利的权利要求范围', '查看小米其他技术领域的专利', '导出检索报告'],
      contextNote: '基于上文检索结果（小米近3年冰箱专利，共3件）',
      contextType: 'followup',
      route: 'SOP'
    }
  ];

  // --- 从 vv 案例提取：智能驾驶对话历史 ---
  var MOCK_MESSAGES_DRIVING = [
    { id: 'd1', role: 'user', content: '小米公司近5年每年的智能驾驶专利数量情况', contentType: 'text', createdAt: '09:15', feedback: 'none', isStreaming: false },
    { id: 'd2', role: 'assistant', content: '小米公司近5年智能驾驶专利年度分布如下：<br/><br/>近5年（2021-2025）累计申请 <strong>221 件</strong>，呈现逐年快速攀升态势。<br/><br/>2021年：12件（小米宣布造车）<br/>2022年：28件（+133%，团队组建）<br/>2023年：47件（+68%，路测牌照）<br/>2024年：63件（+34%，SU7上市）<br/>2025年：71件（+13%，城市NOA推送）', contentType: 'mixed', createdAt: '09:15', feedback: 'like', isStreaming: false,
      thinkingProcess: '1. 分析用户意图\n  - 提取统计要素: 申请人="小米公司", 时间="近5年", 技术主题="智能驾驶"\n  - 构建检索式: AN=(小米) AND TI=(智能驾驶 自动驾驶 无人驾驶) AND PD=[2021-2025]\n  - 按年度聚合统计',
      thinkingExpanded: false,
      patentTable: MOCK_PATENTS_DRIVING,
      chartData: { chartType: 'line', title: '小米智能驾驶专利年度趋势（2021-2025）', xAxis: ['2021','2022','2023','2024','2025'], series: [{ name: '专利数量', data: [12,28,47,63,71] }], summary: '从宣布造车到城市NOA推送，小米智能驾驶专利五年增长近6倍。' },
      dataSource: '检索式: AN=(小米) AND TI=(智能驾驶 自动驾驶 无人驾驶) AND PD=[2021-2025] | 命中: 221 件',
      recommendations: ['小米智能驾驶专利技术分布', '小米与华为智能驾驶专利对比', '小米智能驾驶核心发明人分析'],
      contextNote: null,
      contextType: null,
      route: 'SOP'
    }
  ];

  // --- 从 vv 案例提取：人形机器人对话历史 ---
  var MOCK_MESSAGES_ROBOT = [
    { id: 'r1', role: 'user', content: '今年人形机器人专利主要是哪些公司申请的，创新方向是什么？', contentType: 'text', createdAt: '10:00', feedback: 'none', isStreaming: false },
    { id: 'r2', role: 'assistant', content: '2025年人形机器人专利全景分析，共检索到 <strong>387 件</strong> 相关专利。<br/><br/>主要申请人：Tesla（67件）、优必选（52件）、华为（41件）、波士顿动力（35件）、小米（28件）、Figure AI（22件）。<br/><br/>三大核心创新方向：运动控制与平衡（38%）、多模态感知与交互（29%）、灵巧操作与作业（22%）。"AI大模型+人形机器人"融合成为最显著趋势。', contentType: 'mixed', createdAt: '10:00', feedback: 'like', isStreaming: false,
      thinkingProcess: '1. 分析用户意图\n  - 识别到行业技术分析 -> 自主规划(Agent)场景\nPlan:\n  1. 检索2025年人形机器人专利 -> 命中 387 件\n  2. 申请人排名统计\n  3. IPC技术分类聚类\n  4. 高价值专利摘要提取',
      thinkingExpanded: false,
      patentTable: MOCK_PATENTS_ROBOT,
      chartData: { chartType: 'bar', title: '2025年人形机器人专利申请人排名', xAxis: ['Tesla','优必选','华为','波士顿动力','小米','Figure AI'], series: [{ name: '专利数量', data: [67,52,41,35,28,22] }], summary: '中国企业在感知交互领域优势明显，美国企业在运动控制与AI融合方面保持领先。' },
      dataSource: '检索式: TI=(人形机器人) AND PD=2025 | 命中: 387 件',
      recommendations: ['这些专利中哪些是高价值核心专利？', '2025年人形机器人高价值专利榜单', '人形机器人关键技术路线演进图'],
      contextNote: null,
      contextType: null,
      route: 'Agent'
    },
    { id: 'r3', role: 'user', content: '这些专利中哪些是高价值核心专利？', contentType: 'text', createdAt: '10:05', feedback: 'none', isStreaming: false },
    { id: 'r4', role: 'assistant', content: '2025年人形机器人高价值核心专利 TOP 5：<br/><br/>评估维度：引用频次 x 同族数量 x 法律状态 x 技术影响力<br/><br/>1. Tesla US20251234567A1（价值指数96，被引87次，12个同族）<br/>2. 华为 CN118765432A（价值指数92，VLA大模型核心专利）<br/>3. Figure AI WO2025123456A1（价值指数88，触觉传感+自适应抓取）<br/>4. 优必选 CN118456789A（价值指数85，全身协调控制算法）<br/>5. Boston Dynamics US20249876543A1（价值指数82，实时路径重规划）', contentType: 'mixed', createdAt: '10:05', feedback: 'like', isStreaming: false,
      thinkingProcess: '1. 检测到追问: 基于上一轮人形机器人分析结果，筛选高价值专利\n  - 调用高价值专利评估模型（引用频次+同族数量+法律状态）',
      thinkingExpanded: false,
      patentTable: MOCK_PATENTS_ROBOT,
      dataSource: '评估维度: 引用频次+同族数量+法律状态+技术影响力',
      recommendations: ['这些专利的地域分布是什么样的？', '人形机器人技术路线演进图', '主要申请人专利技术对比'],
      contextNote: '基于上一轮人形机器人全景分析结果（387件）进行高价值筛选',
      contextType: 'followup',
      route: 'Agent'
    }
  ];

  // --- c4: 专利有效期知识问答历史 ---
  var MOCK_MESSAGES_VALIDITY = [
    { id: 'v1', role: 'user', content: '专利有效期是多少？', contentType: 'text', createdAt: '16:00', feedback: 'none', isStreaming: false },
    { id: 'v2', role: 'assistant', content: '根据《中华人民共和国专利法》第四十二条及相关规定，各类专利的保护期限如下：<br/><br/><strong>发明专利</strong>：20年（自申请日起算）<br/><strong>实用新型专利</strong>：10年（自申请日起算）<br/><strong>外观设计专利</strong>：15年（自申请日起算，2021年6月1日后申请的）<br/><br/>注意事项：<br/>1. 专利权人需每年按时缴纳年费<br/>2. 发明专利可申请专利权期限补偿（PTA），最长不超过5年<br/>3. 药品专利可额外获得不超过5年的补偿', contentType: 'text', createdAt: '16:00', feedback: 'like', isStreaming: false,
      thinkingProcess: '1. 分析用户意图\n  - 识别到专利法律知识类问题 -> 知识库(RAG)路由\n  - 匹配知识库类型: 专业知识类\n  - 查询知识库: "专利有效期/专利保护期限"\n  - 命中 专利法第42条 相关文档',
      thinkingExpanded: false,
      comparisonData: { subjects: ['中国', '美国', '欧洲', '日本'], dimensions: ['发明专利', '实用新型', '外观设计'], matrix: [['20年','20年','20年','20年'], ['10年','—','—','—'], ['15年','15年','最长25年','25年']], conclusion: '各主要国家发明专利保护期均为20年，但起算日和补偿机制不同。' },
      dataSource: '法律依据: 《中华人民共和国专利法》第四十二条 | 数据来源: 专利知识百问百答·第二章',
      recommendations: ['那外观设计专利的期限是多少？', '专利权期限补偿如何申请？', '中国与美欧专利期限差异对比'],
      contextNote: null,
      contextType: null,
      route: 'RAG'
    },
    { id: 'v3', role: 'user', content: '那外观设计专利的期限是多少？', contentType: 'text', createdAt: '16:02', feedback: 'none', isStreaming: false },
    { id: 'v4', role: 'assistant', content: '外观设计专利的保护期限如下：<br/><br/><strong>中国</strong>：15年（2021年6月1日新专利法施行后申请的）<br/><strong>美国</strong>：15年（授权日起算）<br/><strong>欧洲</strong>：最长25年（5年初始+4次5年续展）<br/><strong>日本</strong>：25年（注册日起算）<br/><br/>中国外观设计专利在2021年之前申请的为10年保护期，新法施行后延长至15年。', contentType: 'text', createdAt: '16:02', feedback: 'none', isStreaming: false,
      thinkingProcess: '1. 检测到追问: 外观设计专利期限\n  - 基于上一轮回答的上下文\n  - 补充各国外观设计专利期限对比',
      thinkingExpanded: false,
      dataSource: '法律依据: 各国专利法相关规定',
      recommendations: ['外观设计与发明专利有什么区别？', '如何查询专利是否还在有效期内？', '专利年费缴纳标准'],
      contextNote: '基于上一轮关于专利有效期的回答',
      contextType: 'followup',
      route: 'RAG'
    }
  ];

  // --- c5: EP4000523B1 和 US20230404487A1 对比历史 ---
  var MOCK_MESSAGES_COMPARISON = [
    { id: 'p1', role: 'user', content: 'EP4000523B1和US20230404487A1保护范围的差别详细比较下', contentType: 'text', createdAt: '11:00', feedback: 'none', isStreaming: false },
    { id: 'p2', role: 'assistant', content: 'EP4000523B1 vs US20230404487A1 保护范围对比分析：<br/><br/>两件专利均涉及头戴式显示装置的眼动追踪与头部追踪技术，但在技术路线上存在显著差异。', contentType: 'mixed', createdAt: '11:00', feedback: 'like', isStreaming: false,
      thinkingProcess: '1. 分析用户意图\n  - 识别到专利对比请求 -> 自主规划(Agent)场景\nPlan:\n  1. 检索EP4000523B1专利详情\n  2. 检索US20230404487A1专利详情\n  3. 提取独立权利要求\n  4. 逐条对比\n  5. 整合分析结果',
      thinkingExpanded: false,
      comparisonData: {
        subjects: ['EP4000523B1 (Magic Leap)', 'US20230404487A1 (Apple)'],
        dimensions: ['标题', '专利权人', '申请日', '法律状态', '面罩类型', '眼动追踪', '头部追踪', '交互方式', '视野显示'],
        matrix: [
          ['Gaze-based interaction in HMD', 'HMD with integrated eye/head tracking'],
          ['Magic Leap, Inc.', 'Apple Inc.'],
          ['2020-07-15', '2022-06-20'],
          ['授权', '审中'],
          ['透明面罩（AR透视）', '不透明面罩（VST）'],
          ['双目眼动追踪', '单目/双目可选'],
          ['IMU', 'IMU+摄像头融合'],
          ['注视交互+单控制设备', '注视+手势融合'],
          ['选择性显示（信息过滤）', '虚拟对象叠加（AR）']
        ],
        conclusion: '两件专利保护范围存在显著差异：EP4000523B1聚焦于AR环境下的注视交互过滤，US20230404487A1则覆盖更广泛的VST头显融合交互方案。两者在技术路径上互补，存在交叉许可的可能空间。'
      },
      dataSource: '对比维度: 权利要求/技术路线/法律状态 | 数据库: 全球专利 | 分析时间: 2.1s',
      recommendations: ['EP4000523B1的同族专利分析', 'AR/VR头显专利技术路线图', 'Magic Leap与Apple在XR领域的专利布局对比'],
      contextNote: null,
      contextType: null,
      route: 'Agent'
    }
  ];

  // --- c6: 语义检索头戴式显示装置历史 ---
  var MOCK_MESSAGES_SEMANTIC = [
    { id: 's1', role: 'user', content: '一种头戴式显示装置，集成有眼动追踪和头部追踪模块，允许用户通过单一控制设备进行基于注视的交互。', contentType: 'text', createdAt: '09:30', feedback: 'none', isStreaming: false },
    { id: 's2', role: 'assistant', content: '为您进行语义检索，找到以下高度相关的专利（基于深度语义模型匹配）：', contentType: 'mixed', createdAt: '09:30', feedback: 'like', isStreaming: false,
      thinkingProcess: '1. 分析用户意图\n  - 识别到长段技术描述 -> 语义检索场景\n  - 无需构建布尔检索式，直接调用语义检索\n  - 使用原始文本作为查询向量\n  - 检索参数: top_k=20, domain=全部',
      thinkingExpanded: false,
      patentTable: MOCK_PATENTS_SEMANTIC,
      dataSource: '检索方式: 语义检索（向量相似度匹配） | top_k=20 | 检索时间: 1.1s',
      recommendations: ['基于注视交互的HMD专利技术路线', 'Apple与Magic Leap眼动追踪技术对比', '头戴式显示装置的专利布局分析'],
      contextNote: null,
      contextType: null,
      route: 'SOP'
    }
  ];

  // --- c7: 比亚迪 vs 宁德时代电池专利对比历史 ---
  var MOCK_MESSAGES_BATTERY = [
    { id: 'b1', role: 'user', content: '比亚迪vs宁德时代电池专利', contentType: 'text', createdAt: '15:00', feedback: 'none', isStreaming: false },
    { id: 'b2', role: 'assistant', content: '为您对比分析了 <strong>比亚迪</strong> 和 <strong>宁德时代</strong> 在电池领域的专利布局情况，以下是多维度对比结果：', contentType: 'mixed', createdAt: '15:00', feedback: 'like', isStreaming: false,
      thinkingProcess: '1. 解析用户意图：用户想要对比比亚迪和宁德时代的电池专利\n2. 构建对比检索式：AP=(比亚迪) OR AP=(宁德时代) AND TI=(电池)\n3. 提取多维度对比数据：专利数量、授权率、核心技术、海外布局\n4. 生成对比矩阵\n5. 生成分析结论',
      thinkingExpanded: false,
      comparisonData: {
        subjects: ['比亚迪', '宁德时代'],
        dimensions: ['专利总数', '发明专利占比', '授权率', '海外专利占比', '核心领域'],
        matrix: [
          ['12,850件', '3,200件'],
          ['78%', '92%'],
          ['62%', '71%'],
          ['35%', '48%'],
          ['磷酸铁锂/刀片电池', '三元锂电/钠离子电池']
        ],
        conclusion: '宁德时代在电池专利的发明专利占比和授权率上领先，海外布局更广；比亚迪在磷酸铁锂领域专利数量优势明显，刀片电池技术形成差异化壁垒。'
      },
      chartData: {
        chartType: 'bar',
        title: '比亚迪 vs 宁德时代 电池专利对比',
        xAxis: ['专利总数', '发明专利', '海外专利', '授权专利'],
        series: [
          { name: '比亚迪', data: [12850, 10023, 4498, 7967] },
          { name: '宁德时代', data: [3200, 2944, 1536, 2272] }
        ],
        summary: '比亚迪专利总量约为宁德时代的4倍，但宁德时代在发明专利占比和海外布局比例上更具优势。'
      },
      dataSource: '对比维度: 专利数量/授权率/技术领域 | 数据库: 全球专利 | 统计时间: 1.8s',
      recommendations: ['比亚迪刀片电池核心专利', '宁德时代钠离子电池技术', '两家企业专利诉讼历史'],
      contextNote: null,
      contextType: null,
      route: 'Agent'
    }
  ];

  // --- c8: 华为近5年5G专利趋势历史 ---
  var MOCK_MESSAGES_5G = [
    { id: 'g1', role: 'user', content: '华为近5年5G专利趋势', contentType: 'text', createdAt: '11:30', feedback: 'none', isStreaming: false },
    { id: 'g2', role: 'assistant', content: '为您统计了华为技术有限公司近5年的5G相关专利趋势，共计 <strong>45,680</strong> 件专利申请。', contentType: 'mixed', createdAt: '11:30', feedback: 'like', isStreaming: false,
      thinkingProcess: '1. 解析用户意图：用户想要查看华为5G专利趋势\n2. 构建检索式：AP=(华为技术有限公司) AND TI=(5G) AND AD=(2020-2025)\n3. 按年份分组统计专利数量\n4. 生成折线图数据\n5. 生成分析摘要',
      thinkingExpanded: false,
      chartData: {
        chartType: 'line',
        title: '华为5G专利年度申请趋势（2020-2025）',
        xAxis: ['2020', '2021', '2022', '2023', '2024', '2025'],
        series: [
          { name: '5G发明专利', data: [8200, 10500, 12800, 14200, 13600, 7800] },
          { name: '5G实用新型', data: [1200, 1500, 1800, 2100, 1900, 1100] }
        ],
        summary: '华为5G专利申请量在2023年达到峰值，2024-2025年有所回落但仍保持高位，发明专利占比超过85%。'
      },
      dataSource: '检索式: AP=(华为技术有限公司) AND TI=(5G) AND AD=(2020-2025) | 数据库: 全球专利 | 统计时间: 1.2s',
      recommendations: ['华为5G核心专利有哪些？', '华为vs中兴5G专利对比', '华为5G海外专利布局'],
      contextNote: null,
      contextType: null,
      route: 'SOP'
    }
  ];

  // ------------------------------------------------------------------ //
  // 标注数据 (annotationData)                                            //
  // [约束#4] pageId 'P01' 与路由 meta.pageId 对应                       //
  // ------------------------------------------------------------------ //
  var ANNOTATION_DATA = {
    'P01': {
      L1: {
        title: '智能助手对话主界面（P01）',
        purpose: '用户与AI专利助手进行多轮交互的核心页面，采用经典左右布局：左侧280px功能导航侧边栏，右侧主对话区域。支持8大核心能力：专利检索（RAG）、统计分析（Agent/SOP）、对比分析、语义检索、知识问答、使用指引、专利推荐和对话管理。系统根据用户输入自动路由至对应处理模块，输出结构化回答（思考过程+主体内容+数据来源+推荐追问）。支持流式输出、上下文继承、话题锁定、专利详情查看、历史对话管理和多格式报告导出。',
        userFlow: '新用户进入 → 欢迎页展示能力卡片 → 点击示例或输入问题 → 系统意图识别并路由至RAG/Agent/SOP模块 → AI流式输出回答（含思考过程、主体内容、数据来源、推荐追问）→ 用户可追问/点赞/复制/导出/查看专利详情 → 对话结束或切换新话题'
      },
      L2: [
        { id: 'R-001', name: '侧边栏区域', description: '左侧功能导航侧边栏，固定宽度280px，浅色背景设计。承载用户会话管理和系统配置功能，包含四个模块：①品牌标识区（壹专利Logo）；②快捷操作区（新建对话按钮）；③历史会话区（按时间倒序展示历史对话列表，支持切换）；④系统配置区（模型切换极速版/深度思考版、今日配额进度可视化）。支持移动端响应式，小屏幕下可折叠为抽屉模式。' },
        { id: 'R-002', name: '消息气泡区域', description: '消息气泡展示区域，占据主区域绝大部分空间。采用上下分区设计：顶部为话题进度提示条，中部为消息列表（用户消息右对齐、助手消息左对齐），底部为输入控制区。支持多种内容形态：纯文本、结构化HTML、专利表格、统计图表（柱状图/折线图/饼图）、对比分析矩阵、推荐追问标签。支持流式逐字输出、思考过程折叠展开、点赞点踩反馈。' },
        { id: 'R-003', name: '输入控制区域', description: '输入控制区域，位于主区域底部，是用户与AI交互的主要入口。包含：①多行文本输入框（支持Shift+Enter换行，自适应高度）；②发送/停止按钮（根据输出状态动态切换）；③输出密度切换（简洁版/图文版，影响历史消息展示形式）；④话题进度条（显示当前锁定话题的轮次和进度）。输入框空内容时发送按钮置灰不可点。' },
        { id: 'R-004', name: '专利详情侧滑面板', description: '专利详情侧滑面板，点击专利公开号后从右侧滑出（宽度400px）。展示专利的完整信息：专利名称、公开号、申请人、发明人、申请日、公开日、IPC分类号、摘要、权利要求、法律状态时间线、同族专利、引用文献等。支持在面板内直接查看PDF全文和进行专利对比操作。' },
        { id: 'R-005', name: '欢迎页空状态', description: '欢迎页空状态，当无历史对话时自动展示。包含三个部分：①助手品牌形象（IP头像+问候语）；②能力介绍卡片区（6张卡片展示检索/统计/对比/知识/指引/推荐六大能力）；③示例问题区（每个能力卡片附带示例问题标签，点击即可快速开始对话）。欢迎页是引导新用户快速上手的关键触点。' }
      ],
      L3: [
        { id: 'C-001', name: '新建对话按钮', zone: 'R-001', component: 'el-button', description: '新建对话按钮，位于侧边栏顶部。点击后清空当前对话内容，重置所有会话状态（当前话题、锁定专利、上下文等），返回欢迎页空状态。是用户开启全新专利咨询话题的入口。' },
        { id: 'C-002', name: '历史对话列表', zone: 'R-001', component: 'el-scrollbar + 列表项', description: '历史对话列表，位于侧边栏中部主体区域。按时间倒序展示用户的历史会话，每条记录显示对话标题、创建时间和消息轮数。点击任意记录可快速切换到该会话，继续之前的对话。轮数小于等于1时显示灰色弱提示。' },
        { id: 'C-003', name: '模型切换器', zone: 'R-001', component: 'el-select', description: '模型切换器，位于侧边栏底部。提供极速版（快速响应，适合简单检索和日常咨询）和深度思考版（详细推理，适合复杂分析和深度对比）两种AI模型切换。切换不中断当前对话，仅影响后续新消息的生成质量。' },
        { id: 'C-004', name: '配额进度展示', zone: 'R-001', component: 'el-progress', description: '配额进度展示，位于侧边栏底部模型切换器下方。可视化展示用户今日已使用配额和总配额（基础用户100次/日，付费用户500次/日）。当使用率超过50%时显示黄色提醒，超过80%时显示红色警示。' },
        { id: 'C-005', name: '用户消息气泡', zone: 'R-002', component: 'div.chat-bubble-user', description: '用户消息气泡，位于消息区域右侧。采用右对齐布局，展示用户输入的原始问题文本。每条消息下方显示发送时间戳。是用户与AI对话的主动表达载体。' },
        { id: 'C-006', name: '助手消息气泡', zone: 'R-002', component: 'div.chat-bubble-assistant', description: '助手消息气泡，位于消息区域左侧。采用左对齐布局，包含IP头像标识。是系统回答的主要载体，内容结构包含：路由类型标签（RAG检索/Agent分析/SOP标准作业）、思考过程折叠区（展示系统推理步骤）、主体回答内容（支持HTML富文本）、数据来源标注、统计图表/对比表格、推荐追问标签。' },
        { id: 'C-007', name: '思考过程折叠区', zone: 'R-002', component: 'el-collapse', description: '思考过程折叠区，位于每条助手消息内部。默认折叠状态，点击可展开查看系统对问题的完整拆解和推理步骤：包括意图识别、检索式构建、数据库选择、结果筛选、结论生成等环节。让用户理解AI是如何得出答案的，增强可信度。' },
        { id: 'C-008', name: '数据来源标注', zone: 'R-002', component: 'div.data-source', description: '数据来源标注，位于助手消息底部。明确展示本次回答的数据基础：检索式原文、检索的数据库名称（中国专利/全球专利/外观设计等）、命中专利数量、检索耗时。确保回答的可追溯性和透明度。' },
        { id: 'C-009', name: '推荐追问标签', zone: 'R-002', component: 'el-tag 组', description: '推荐追问标签，位于助手消息底部数据来源下方。系统基于当前回答内容智能生成的3个后续引导问题，以标签形式展示。用户点击任一标签即可继续深入对话，无需重新输入，降低交互成本。' },
        { id: 'C-010', name: '消息反馈按钮组', zone: 'R-002', component: 'el-button 组', description: '消息反馈按钮组，位于每条助手消息右下角。包含点赞和点踩两个按钮。点赞后按钮高亮品牌主色；点踩后弹出反馈弹窗收集不满意原因（回答不准确/不完整/不相关/其他），用于持续优化模型质量。' },
        { id: 'C-011', name: '消息输入框', zone: 'R-003', component: 'el-input type=textarea', description: '消息输入框，位于主区域底部。多行文本输入区域，支持Shift+Enter换行，输入内容为空时发送按钮置灰。是用户向AI提问的主要输入入口，支持自然语言、专利号、技术描述等多种输入形式。' },
        { id: 'C-012', name: '发送/停止按钮', zone: 'R-003', component: 'el-button', description: '发送/停止按钮，位于输入框右侧。空闲状态显示为发送按钮（箭头图标），点击后发送用户输入；输出过程中变为停止按钮（方块图标），点击可立即终止当前AI生成。状态切换与AI输出流同步。' },
        { id: 'C-013', name: '输出密度切换', zone: 'R-003', component: 'el-radio-group', description: '输出密度切换，位于输入框上方。提供简洁版（纯文本输出，信息密度高，适合快速浏览）和图文版（含表格、图表、结构化排版，信息展示更丰富）两种展示模式切换。切换后历史消息展示形式同步更新。' },
        { id: 'C-014', name: '话题进度条', zone: 'R-003', component: 'el-progress', description: '话题进度条，位于消息区域顶部。当用户与AI围绕某一话题进行多轮对话时，显示当前话题名称、当前轮次/总轮次、以及可视化进度条。帮助用户了解对话深度和剩余空间，话题达到8轮时提示即将结束。' },
        { id: 'C-015', name: '专利详情面板内容区', zone: 'R-004', component: 'el-drawer', description: '专利详情面板内容区，位于侧滑面板内部。展示选中专利的完整详细信息：基本信息（名称、公开号、申请人、发明人、日期）、分类信息（IPC/CPC分类号）、文本信息（摘要、权利要求）、法律状态（授权/审中/驳回/失效及时间线）、引用信息（被引/施引专利列表）。' },
        { id: 'C-016', name: '能力介绍卡片', zone: 'R-005', component: 'el-card 组', description: '能力介绍卡片，位于欢迎页中部。共6张卡片以网格形式展示系统核心能力：①专利检索（自然语言转检索式）；②统计分析（年度趋势/申请人排名/技术分布）；③对比分析（多专利/多申请人横向对比）；④知识问答（专利法律/流程/策略咨询）；⑤使用指引（平台功能操作指南）；⑥专利推荐（基于用户画像的智能推荐）。' },
        { id: 'C-017', name: '示例问题标签', zone: 'R-005', component: 'el-tag 组', description: '示例问题标签，位于欢迎页底部每个能力卡片下方。为每个能力场景提供2-3个典型示例问题，以可点击标签形式展示。用户点击后直接将问题发送至对话，无需手动输入，是降低新用户上手门槛的关键设计。' },
        { id: 'C-018', name: '复制回答按钮', zone: 'R-002', component: 'el-button', description: '复制回答按钮，位于每条助手消息右下角。点击后一键将当前回答的完整文字内容复制到系统剪贴板，方便用户粘贴至文档、邮件或其他协作工具中。' },
        { id: 'C-019', name: '导出回答按钮', zone: 'R-002', component: 'el-dropdown', description: '导出回答按钮，位于每条助手消息右下角。支持下拉选择导出格式：Word文档（.docx，适合编辑加工）、Excel表格（.xlsx，适合数据分析）、PDF文档（.pdf，适合正式存档）。导出内容包含问答原文、数据来源和统计图表。' },
        { id: 'C-020', name: '反馈弹窗', zone: 'R-002', component: 'el-dialog', description: '反馈弹窗，位于页面层级（Modal）。当用户点击点踩按钮后弹出，收集用户不满意的具体原因：回答不准确/信息不完整/与问题不相关/格式混乱/其他。收集的反馈用于模型迭代和效果优化。' },
        { id: 'C-021', name: '统计图表区域', zone: 'R-002', component: 'div.chart-container', description: '统计图表区域，位于助手消息内部。当用户请求统计分析时，系统生成并展示可视化图表：柱状图（申请人排名/技术分布）、折线图（年度申请趋势/技术演进）、饼图（专利类型占比/法律状态分布）。图表基于ECharts渲染，支持数据标签和Tooltip交互。' },
        { id: 'C-022', name: '对比分析表格', zone: 'R-002', component: 'el-table', description: '对比分析表格，位于助手消息内部。当用户请求对比分析时，系统生成多维度对比矩阵表格。横向为对比对象（多个专利或多个申请人），纵向为对比维度（专利数量、授权率、核心技术、申请趋势、海外布局等）。表格支持排序和单元格高亮。' },
        { id: 'C-023', name: '移动端侧边栏切换', zone: 'R-001', component: 'el-button', description: '移动端侧边栏切换按钮，位于顶栏左侧。仅在屏幕宽度小于768px时显示。点击后在屏幕左侧展开侧边栏抽屉（覆盖主内容区），再次点击或点击遮罩层关闭。是移动端适配的核心交互组件。' }
      ]
    }
  };

  // ------------------------------------------------------------------ //
  // AppState - 全局共享状态（挂载到 window 供子组件访问）                 //
  // ------------------------------------------------------------------ //
  // --- 独立的标注状态（根组件创建并暴露，子组件通过 window.annotationState 引用） ---
  var annotationState = Vue.reactive({
    showAnnotation: false,
    activeTab: 'L1',
    highlightedZone: null,
    highlightedElement: null,
    activePageId: 'P01',
    annotationData: ANNOTATION_DATA,

    onToggleAnnotation: function (val) {
      if (!val) {
        annotationState.highlightedZone = null;
        annotationState.highlightedElement = null;
        document.body.classList.remove('patent-drawer-offset');
      } else if (AppState.patentDrawerVisible) {
        document.body.classList.add('patent-drawer-offset');
      }
    },

    // 辅助函数：滚动右侧面板中对应的标注卡片到可视区域
    scrollRightPanelToCard: function (selector) {
      Vue.nextTick(function () {
        setTimeout(function () {
          var panelBody = document.querySelector('.annotation-panel .panel-body');
          var card = document.querySelector(selector);
          if (panelBody && card) {
            // 检查卡片是否已在可视区域内，避免不必要的滚动
            var panelRect = panelBody.getBoundingClientRect();
            var cardRect = card.getBoundingClientRect();
            var isVisible = cardRect.top >= panelRect.top && cardRect.bottom <= panelRect.bottom;
            if (!isVisible) {
              card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }
        }, 150);
      });
    },

    focusZoneCard: function (zoneId) {
      annotationState.highlightedZone = zoneId;
      annotationState.highlightedElement = null;
      annotationState.activeTab = 'L2';
      // 根据 zone 类型切换左侧页面状态，确保对应元素存在于 DOM 中
      if (zoneId === 'R-005' && AppState.messages.length > 0) {
        AppState.newConversation();
      } else if ((zoneId === 'R-002' || zoneId === 'R-003') && AppState.messages.length === 0) {
        AppState.switchConversation('c1');
      }
      // R-004 专利详情区域需要先打开抽屉
      if (zoneId === 'R-004') {
        AppState.openPatentDrawer();
      }
      // 滚动左侧页面到对应区域（状态切换后需等待 DOM 更新）
      Vue.nextTick(function () {
        setTimeout(function () {
          var el = document.querySelector('.anno-zone.zone-active');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else if (zoneId === 'R-004') {
            setTimeout(function () {
              var drawerEl = document.querySelector('.patent-detail-drawer .anno-zone.zone-active');
              if (drawerEl) drawerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
          }
        }, 100);
      });
      // 滚动右侧面板到对应的L2卡片
      annotationState.scrollRightPanelToCard('.l2-card[data-card-zone="' + zoneId + '"]');
    },

    focusElementCard: function (elementId) {
      annotationState.highlightedElement = elementId;
      annotationState.highlightedZone = null; // 清除 zone 过滤，确保右侧 L3 卡片全部可见
      annotationState.activeTab = 'L3';
      // [约束#8] 点击 L3 只高亮 L3 元素本身，不联动设置 highlightedZone
      // 根据元素类型切换左侧页面状态，确保对应元素存在于 DOM 中
      if (['C-016', 'C-017'].indexOf(elementId) !== -1 && AppState.messages.length > 0) {
        AppState.newConversation();
      } else if (['C-005','C-006','C-007','C-008','C-009','C-010','C-011','C-012','C-013','C-014','C-018','C-019','C-020','C-021','C-022'].indexOf(elementId) !== -1 && AppState.messages.length === 0) {
        if (elementId === 'C-021') {
          AppState.switchConversation('c2');
        } else if (elementId === 'C-022') {
          AppState.switchConversation('c5');
        } else {
          AppState.switchConversation('c1');
        }
      }
      // C-015 在专利详情抽屉内，需要先打开抽屉
      if (elementId === 'C-015') {
        AppState.openPatentDrawer();
      }
      // C-020 反馈弹窗
      if (elementId === 'C-020') {
        AppState.feedbackDialogVisible = true;
      }
      // 滚动左侧页面到对应元素（状态切换后需等待 DOM 更新）
      Vue.nextTick(function () {
        setTimeout(function () {
          var el = document.querySelector('.l3-dot.l3-dot-active');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else if (elementId === 'C-015') {
            setTimeout(function () {
              var dotEl = document.querySelector('.patent-detail-drawer .l3-dot.l3-dot-active');
              if (dotEl) dotEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
          }
        }, 100);
      });
      // 滚动右侧面板到对应的L3卡片
      annotationState.scrollRightPanelToCard('.l3-card[data-card-element="' + elementId + '"]');
    },

    highlightZone: function (zoneId) {
      annotationState.highlightedZone = annotationState.highlightedZone === zoneId ? null : zoneId;
      // 点击右侧面板 L2 卡片时切换到 L2 标签页，确保用户能看到被激活的卡片
      if (annotationState.highlightedZone) {
        annotationState.activeTab = 'L2';
      }
      // 清除 L3 高亮，避免左侧同时显示两种高亮（激活或取消时都清除）
      annotationState.highlightedElement = null;
      // 根据 zone 类型切换左侧页面状态，确保对应元素存在于 DOM 中
      if (annotationState.highlightedZone === 'R-005' && AppState.messages.length > 0) {
        AppState.newConversation();
      } else if ((annotationState.highlightedZone === 'R-002' || annotationState.highlightedZone === 'R-003') && AppState.messages.length === 0) {
        AppState.switchConversation('c1');
      }
      // R-004 专利详情区域需要先打开抽屉
      if (annotationState.highlightedZone === 'R-004') {
        AppState.openPatentDrawer();
      }
      // 滚动左侧页面到对应区域（状态切换后需等待 DOM 更新）
      Vue.nextTick(function () {
        setTimeout(function () {
          var el = document.querySelector('.anno-zone.zone-active');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else if (annotationState.highlightedZone === 'R-004') {
            setTimeout(function () {
              var drawerEl = document.querySelector('.patent-detail-drawer .anno-zone.zone-active');
              if (drawerEl) drawerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
          }
        }, 100);
      });
      // 滚动右侧面板到对应的L2卡片
      if (annotationState.highlightedZone) {
        annotationState.scrollRightPanelToCard('.l2-card[data-card-zone="' + annotationState.highlightedZone + '"]');
      }
    },

    highlightElement: function (elementId) {
      annotationState.highlightedElement = annotationState.highlightedElement === elementId ? null : elementId;
      if (annotationState.highlightedElement) {
        annotationState.activeTab = 'L3';
      }
      // 清除 L2 高亮，避免左侧同时显示两种高亮（激活或取消时都清除）
      annotationState.highlightedZone = null;
      // 根据元素类型切换左侧页面状态，确保对应元素存在于 DOM 中
      if (annotationState.highlightedElement && ['C-016', 'C-017'].indexOf(annotationState.highlightedElement) !== -1 && AppState.messages.length > 0) {
        AppState.newConversation();
      } else if (annotationState.highlightedElement && ['C-005','C-006','C-007','C-008','C-009','C-010','C-011','C-012','C-013','C-014','C-018','C-019','C-020','C-021','C-022'].indexOf(annotationState.highlightedElement) !== -1 && AppState.messages.length === 0) {
        // 图表元素切到含图表的对话，对比元素切到含对比的对话
        if (annotationState.highlightedElement === 'C-021') {
          AppState.switchConversation('c2');
        } else if (annotationState.highlightedElement === 'C-022') {
          AppState.switchConversation('c5');
        } else {
          AppState.switchConversation('c1');
        }
      }
      // C-015 在专利详情抽屉内，需要先打开抽屉
      if (annotationState.highlightedElement === 'C-015') {
        AppState.openPatentDrawer();
      }
      // C-020 反馈弹窗
      if (annotationState.highlightedElement === 'C-020') {
        AppState.feedbackDialogVisible = true;
      }
      // 滚动左侧页面到对应元素（状态切换后需等待 DOM 更新）
      Vue.nextTick(function () {
        setTimeout(function () {
          var el = document.querySelector('.l3-dot.l3-dot-active');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else if (annotationState.highlightedElement === 'C-015') {
            setTimeout(function () {
              var dotEl = document.querySelector('.patent-detail-drawer .l3-dot.l3-dot-active');
              if (dotEl) dotEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
          }
        }, 100);
      });
      // 滚动右侧面板到对应的L3卡片
      if (annotationState.highlightedElement) {
        annotationState.scrollRightPanelToCard('.l3-card[data-card-element="' + annotationState.highlightedElement + '"]');
      }
    }
  });
  window.annotationState = annotationState;

  var AppState = Vue.reactive({
    // --- 对话状态 ---
    conversations: MOCK_CONVERSATIONS,
    currentConversationId: 'c1',
    messages: JSON.parse(JSON.stringify(MOCK_MESSAGES)),
    inputContent: '',
    currentModel: '极速版',
    outputMode: '图文版',
    isStreaming: false,
    currentTopic: '小米冰箱专利检索',
    topicRound: 4,
    topicTotalRounds: 10,
    topicProgress: 40,
    lockedPatent: null,

    // --- 配额（基础用户每日100次，付费用户每日500次） ---
    accountType: 'basic',
    quota: { used: 35, total: 100, remaining: 65 },
    quotaPercentage: 35,
    quotaColor: '#024ad8',
    quotaClass: 'quota-normal',

    // --- 移动端侧边栏 ---
    sidebarVisible: false,
    isMobile: false,

    // --- 专利详情 ---
    patentDrawerVisible: false,
    currentPatent: null,

    // --- 反馈 ---
    feedbackDialogVisible: false,
    feedbackContent: '',
    _dislikedMsgId: null,

    // --- 欢迎页数据 ---
    capabilities: MOCK_CAPABILITIES,
    exampleQuestions: MOCK_EXAMPLE_QUESTIONS,

    // --- Element Plus 图标占位 ---
    Plus: null,

    // --- 图表颜色 ---
    chartColors: ['#024ad8', '#296ef9', '#356373', '#ff5050', '#c2c2c2']
  });

  // ------------------------------------------------------------------ //
  // 图表渲染（Canvas 原生绘制，无需第三方库）                             //
  // ------------------------------------------------------------------ //
  AppState.registerChart = function (el, msgId, chartData) {
    if (!el || !chartData) return;
    Vue.nextTick(function () {
      drawChart(el, chartData);
    });
  };

  function drawChart(canvas, data) {
    if (!canvas || !data) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    var padding = { top: 20, right: 20, bottom: 50, left: 50 };
    var chartW = w - padding.left - padding.right;
    var chartH = h - padding.top - padding.bottom;

    var series = data.series || [];
    var xAxis = data.xAxis || [];
    if (series.length === 0 || xAxis.length === 0) return;

    // 计算最大值
    var maxVal = 0;
    series.forEach(function (s) {
      (s.data || []).forEach(function (v) {
        if (v > maxVal) maxVal = v;
      });
    });
    if (maxVal === 0) maxVal = 1;
    maxVal = Math.ceil(maxVal * 1.1);

    var colors = AppState.chartColors;

    if (data.chartType === 'bar') {
      // 柱状图
      var groupWidth = chartW / xAxis.length;
      var barWidth = groupWidth * 0.7 / series.length;
      var gap = groupWidth * 0.15;

      xAxis.forEach(function (label, i) {
        series.forEach(function (s, si) {
          var val = s.data[i] || 0;
          var barH = (val / maxVal) * chartH;
          var x = padding.left + i * groupWidth + gap + si * barWidth;
          var y = padding.top + chartH - barH;
          ctx.fillStyle = colors[si % colors.length];
          ctx.fillRect(x, y, barWidth - 2, barH);
        });

        // X轴标签
        ctx.fillStyle = '#636363';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, padding.left + i * groupWidth + groupWidth / 2, h - padding.bottom + 18);
      });
    } else if (data.chartType === 'line') {
      // 折线图
      series.forEach(function (s, si) {
        ctx.strokeStyle = colors[si % colors.length];
        ctx.lineWidth = 2;
        ctx.beginPath();
        xAxis.forEach(function (label, i) {
          var val = s.data[i] || 0;
          var x = padding.left + (i + 0.5) * (chartW / xAxis.length);
          var y = padding.top + chartH - (val / maxVal) * chartH;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);

          // 数据点
          ctx.fillStyle = colors[si % colors.length];
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(x, y);
        });
        ctx.stroke();
      });

      xAxis.forEach(function (label, i) {
        ctx.fillStyle = '#636363';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        var x = padding.left + (i + 0.5) * (chartW / xAxis.length);
        ctx.fillText(label, x, h - padding.bottom + 18);
      });
    }

    // Y轴刻度
    ctx.fillStyle = '#c2c2c2';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    var steps = 5;
    for (var i = 0; i <= steps; i++) {
      var val = Math.round((maxVal / steps) * i);
      var y = padding.top + chartH - (chartH / steps) * i;
      ctx.fillText(String(val), padding.left - 8, y + 3);
      // 网格线
      ctx.strokeStyle = '#e8e8e8';
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
    }

    // 轴线
    ctx.strokeStyle = '#e8e8e8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.lineTo(w - padding.right, padding.top + chartH);
    ctx.stroke();
  }

  // ------------------------------------------------------------------ //
  // 对比数据格式化（转为 el-table 所需格式）                              //
  // ------------------------------------------------------------------ //
  AppState.formatComparisonData = function (compData) {
    if (!compData || !compData.dimensions) return [];
    return compData.dimensions.map(function (dim, i) {
      var row = { dimension: dim };
      (compData.subjects || []).forEach(function (subj, si) {
        row['val' + si] = compData.matrix[i] ? (compData.matrix[i][si] || '-') : '-';
      });
      return row;
    });
  };

  // ------------------------------------------------------------------ //
  // 设计系统辅助函数（状态标签 / 上下文横幅 / 路由标签）                    //
  // ------------------------------------------------------------------ //
  AppState.getStatusInfo = function (statusText) {
    var s = String(statusText || '');
    if (s.indexOf('授权') >= 0 || s.indexOf('Granted') >= 0) return { class: 'granted', text: '授权' };
    if (s.indexOf('实质审查') >= 0 || s.indexOf('审中') >= 0 || s.indexOf('Pending') >= 0 || s.indexOf('实质') >= 0) return { class: 'pending', text: '实审' };
    if (s.indexOf('撤回') >= 0 || s.indexOf('Withdrawn') >= 0) return { class: 'withdrawn', text: '撤回' };
    if (s.indexOf('失效') >= 0 || s.indexOf('Expired') >= 0 || s.indexOf('届满') >= 0) return { class: 'expired', text: '失效' };
    return { class: 'pending', text: s || '未知' };
  };

  AppState.contextBannerClass = function (type) {
    var map = { followup: 'followup', 'deep-followup': 'deep', 'topic-extend': 'extend', 'new-dimension': 'new-dimension' };
    return map[type] || 'followup';
  };

  AppState.routeLabel = function (route) {
    var map = { SOP: '固定工作流 · 专利检索', RAG: '知识库 · 专利知识', Agent: '自主规划 · 多步骤深度分析' };
    return map[route] || route;
  };

  function classifyRoute(input, response) {
    var lowerInput = (input || '').toLowerCase();
    var thinking = (response.thinkingProcess || '').toLowerCase();
    if (response.comparisonData) return 'Agent';
    if (/rag|知识库|专业知识|平台操作/.test(thinking)) return 'RAG';
    if (/自主规划|agent|多步骤/.test(thinking)) return 'Agent';
    if (/有效期|保护期|保护期限|数据库|数据范围|专利法/.test(lowerInput)) return 'RAG';
    return 'SOP';
  }

  // ------------------------------------------------------------------ //
  // 辅助函数                                                             //
  // ------------------------------------------------------------------ //
  function formatTime(date) {
    var h = String(date.getHours()).padStart(2, '0');
    var m = String(date.getMinutes()).padStart(2, '0');
    return h + ':' + m;
  }

  function updateQuotaDisplay() {
    var pct = Math.round((AppState.quota.used / AppState.quota.total) * 100);
    AppState.quotaPercentage = pct;
    AppState.quotaColor = pct >= 80 ? '#b3262b' : (pct >= 50 ? '#ff5050' : '#024ad8');
    AppState.quotaClass = pct >= 80 ? 'quota-danger' : (pct >= 50 ? 'quota-warning' : 'quota-normal');
  }

  function updateTopicProgress() {
    AppState.topicProgress = Math.round((AppState.topicRound / AppState.topicTotalRounds) * 100);
  }

  function scrollToBottom() {
    Vue.nextTick(function () {
      var container = document.querySelector('.chat-messages');
      if (container) container.scrollTop = container.scrollHeight;
    });
  }

  function generateMockResponse(input) {
    var lowerInput = (input || '').toLowerCase();

    // --- 从 vv 案例提取：智能驾驶专利统计场景（优先匹配） ---
    if (lowerInput.indexOf('智能驾驶') >= 0 || lowerInput.indexOf('智驾') >= 0 || lowerInput.indexOf('自动驾驶') >= 0) {
      return {
        thinkingProcess: '1. 分析用户意图\n  - 提取统计要素: 申请人="小米公司", 时间="近5年", 技术主题="智能驾驶"\n  - 构建检索式: AN=(小米) AND TI=(智能驾驶 自动驾驶 无人驾驶) AND PD=[2021-2025]\n  - 按年度聚合统计\n  - 调用 单维统计(按年度) 工具',
        content: '小米公司近5年智能驾驶专利年度分布如下：<br/><br/>近5年（2021-2025）累计申请 <strong>221 件</strong>，呈现逐年快速攀升态势。',
        patentTable: MOCK_PATENTS_DRIVING,
        chartData: {
          chartType: 'line',
          title: '小米智能驾驶专利年度趋势（2021-2025）',
          xAxis: ['2021', '2022', '2023', '2024', '2025'],
          series: [{ name: '专利数量', data: [12, 28, 47, 63, 71] }],
          summary: '2021年宣布造车（12件）-> 2022年团队组建增速+133%（28件）-> 2023年路测牌照+68%（47件）-> 2024年SU7上市+34%（63件）-> 2025年城市NOA+13%（71件）。五年增长近6倍。'
        },
        dataSource: '检索式: AN=(小米) AND TI=(智能驾驶 自动驾驶 无人驾驶) AND PD=[2021-2025] | 数据库: 中国专利 | 命中: 221 件 | 检索时间: 0.9s',
        recommendations: ['小米智能驾驶专利技术分布', '小米与华为智能驾驶专利对比', '小米智能驾驶核心发明人分析'],
        contextNote: null
      };
    }
    if (lowerInput.indexOf('冰箱') >= 0) {
      return {
        thinkingProcess: '1. 解析用户意图：用户想要检索小米近3年的冰箱相关专利\n2. 构建检索式：AP=(小米科技有限责任公司) AND TI=(冰箱) AND AD=(2022-2025)\n3. 在中国专利数据库中执行检索\n4. 对结果进行分类统计：发明专利2件，实用新型1件\n5. 生成结构化回答并附上推荐追问',
        content: '为您检索到小米科技有限责任公司近3年的冰箱相关专利共 <strong>3</strong> 件，其中发明专利 2 件，实用新型 1 件。以下是详细列表：',
        patentTable: MOCK_PATENTS,
        dataSource: '检索式: AP=(小米科技有限责任公司) AND TI=(冰箱) AND AD=(2022-2025) | 数据库: 中国专利 | 命中: 3 件 | 检索时间: 0.8s',
        recommendations: ['小米冰箱专利的授权率如何？', '对比海尔冰箱专利布局', '查看CN115432101A的详细技术方案'],
        contextNote: null
      };
    }
    if (lowerInput.indexOf('发明专利') >= 0 && lowerInput.indexOf('区别') >= 0) {
      return {
        thinkingProcess: '1. 解析用户意图：用户询问发明专利的保护期限\n2. 检索专利法相关条款\n3. 确认《专利法》第四十二条规定\n4. 生成回答',
        content: '根据《中华人民共和国专利法》第四十二条规定，<strong>发明专利</strong>的保护期限为 <strong>20 年</strong>，自申请日起计算。<br/><br/>实用新型专利的保护期限为 10 年，外观设计专利的保护期限为 15 年，均自申请日起计算。<br/><br/>需要注意的是，专利权人需要每年缴纳年费以维持专利有效。如果未按时缴纳年费，专利权将会提前终止。',
        patentTable: null,
        dataSource: '法律依据: 《中华人民共和国专利法》第四十二条 | 数据来源: 国家知识产权局',
        recommendations: ['实用新型和发明专利有什么区别？', '专利年费怎么计算？', '如何申请专利费用减免？'],
        contextNote: null
      };
    }
    if (lowerInput.indexOf('授权率') >= 0 || lowerInput.indexOf('统计') >= 0 || lowerInput.indexOf('趋势') >= 0) {
      return {
        thinkingProcess: '1. 解析用户意图：用户想要查看专利统计信息\n2. 从数据库检索相关统计数据\n3. 生成统计图表数据\n4. 生成结构化回答',
        content: '根据统计分析，小米科技有限责任公司近3年冰箱领域专利授权率如下：<br/><br/>- 2023年：申请 8 件，授权 5 件，授权率 <strong>62.5%</strong><br/>- 2024年：申请 12 件，授权 7 件，授权率 <strong>58.3%</strong><br/>- 2025年：申请 5 件，授权 2 件，授权率 <strong>40.0%</strong><br/><br/>总体来看，小米在冰箱领域的专利布局呈增长趋势，但授权率有所波动。',
        patentTable: null,
        chartData: {
          chartType: 'bar',
          title: '小米冰箱专利年度趋势',
          xAxis: ['2023年', '2024年', '2025年'],
          series: [
            { name: '申请量', data: [8, 12, 5] },
            { name: '授权量', data: [5, 7, 2] }
          ],
          summary: '近3年小米冰箱领域专利申请总量25件，授权14件，整体授权率56%。2024年申请量最高，但2025年授权率下降明显。'
        },
        dataSource: '统计维度: 按申请年份分组 | 数据库: 中国专利 | 统计时间: 0.3s',
        recommendations: ['小米冰箱专利的主要技术分布', '对比美的冰箱专利授权率', '查看授权率下降的原因分析'],
        contextNote: null
      };
    }
    if (lowerInput.indexOf('趋势') >= 0 || lowerInput.indexOf('数量') >= 0 || lowerInput.indexOf('5g') >= 0 || lowerInput.indexOf('华为') >= 0) {
      return {
        thinkingProcess: '1. 解析用户意图：用户想要查看华为专利数量趋势\n2. 构建检索式：AP=(华为技术有限公司) AND AD=(2020-2025)\n3. 按年份分组统计专利数量\n4. 生成折线图数据\n5. 生成分析摘要',
        content: '为您统计了华为技术有限公司近5年的专利数量趋势，共计 <strong>182,350</strong> 件专利申请。以下是详细趋势分析：',
        patentTable: null,
        chartData: {
          chartType: 'line',
          title: '华为专利年度申请趋势（2020-2025）',
          xAxis: ['2020', '2021', '2022', '2023', '2024', '2025'],
          series: [
            { name: '发明专利', data: [18200, 22050, 26800, 31200, 28500, 15600] },
            { name: '实用新型', data: [3200, 3800, 4200, 5100, 4800, 2600] },
            { name: '外观设计', data: [850, 920, 1100, 1300, 1200, 650] }
          ],
          summary: '华为专利申请量在2023年达到峰值（37,600件），2024-2025年有所回落但仍保持高位。发明专利占比始终在85%以上，体现其技术创新导向。'
        },
        dataSource: '检索式: AP=(华为技术有限公司) AND AD=(2020-2025) | 数据库: 全球专利 | 统计时间: 1.2s',
        recommendations: ['华为5G核心专利有哪些？', '华为vs中兴专利对比', '查看华为海外专利布局'],
        contextNote: null
      };
    }
    // --- 从 vv 案例提取：专利保护范围对比场景（优先于通用对比匹配） ---
    if ((lowerInput.indexOf('ep4000523') >= 0 && lowerInput.indexOf('us2023040') >= 0) || lowerInput.indexOf('保护范围') >= 0) {
      return {
        thinkingProcess: '1. 分析用户意图\n  - 识别到专利对比请求 -> 自主规划(Agent)场景\n  - 涉及多步骤: 检索两件专利 -> 提取权利要求 -> 逐条对比\n\nPlan:\n  1. 检索EP4000523B1专利详情\n  2. 检索US20230404487A1专利详情\n  3. 提取EP4000523B1独立权利要求1\n  4. 提取US20230404487A1独立权利要求1\n  5. 逐条对比独立权利要求\n  6. 对比从属权利要求\n  7. 整合对比分析结果\n\nStep 1/7: 检索EP4000523B1 -> 获取成功\nStep 2/7: 检索US20230404487A1 -> 获取成功\nStep 3/7: 提取EP4000523B1权利要求1 -> 完成\nStep 4/7: 提取US20230404487A1权利要求1 -> 完成\nStep 5/7: 逐条对比独立权利要求 -> 进行中...',
        content: 'EP4000523B1 vs US20230404487A1 保护范围对比分析：<br/><br/>两件专利均涉及头戴式显示装置的眼动追踪与头部追踪技术，但在技术路线上存在显著差异。',
        comparisonData: {
          subjects: ['EP4000523B1 (Magic Leap)', 'US20230404487A1 (Apple)'],
          dimensions: ['标题', '专利权人', '申请日', '法律状态', '面罩类型', '眼动追踪', '头部追踪', '交互方式', '视野显示'],
          matrix: [
            ['Gaze-based interaction in HMD', 'HMD with integrated eye/head tracking'],
            ['Magic Leap, Inc.', 'Apple Inc.'],
            ['2020-07-15', '2022-06-20'],
            ['授权', '审中'],
            ['透明面罩（AR透视）', '不透明面罩（VST）'],
            ['双目眼动追踪', '单目/双目可选'],
            ['IMU', 'IMU+摄像头融合'],
            ['注视交互+单控制设备', '注视+手势融合'],
            ['选择性显示（信息过滤）', '虚拟对象叠加（AR）']
          ],
          conclusion: '两件专利保护范围存在显著差异：EP4000523B1聚焦于AR环境下的注视交互过滤，US20230404487A1则覆盖更广泛的VST头显融合交互方案。EP授权专利权利要求范围较窄但稳定；Apple申请中，权利要求覆盖更广。两者在技术路径上互补，存在交叉许可的可能空间。'
        },
        chartData: null,
        patentTable: null,
        dataSource: '对比维度: 权利要求/技术路线/法律状态 | 数据库: 全球专利 | 分析时间: 2.1s',
        recommendations: ['EP4000523B1的同族专利分析', 'AR/VR头显专利技术路线图', 'Magic Leap与Apple在XR领域的专利布局对比'],
        contextNote: null
      };
    }
    if (lowerInput.indexOf('对比') >= 0 || lowerInput.indexOf('vs') >= 0 || lowerInput.indexOf('比较') >= 0) {
      return {
        thinkingProcess: '1. 解析用户意图：用户想要对比比亚迪和宁德时代的电池专利\n2. 构建对比检索式：AP=(比亚迪) OR AP=(宁德时代) AND TI=(电池)\n3. 提取多维度对比数据：专利数量、授权率、核心技术、海外布局\n4. 生成对比矩阵\n5. 生成分析结论',
        content: '为您对比分析了 <strong>比亚迪</strong> 和 <strong>宁德时代</strong> 在电池领域的专利布局情况，以下是多维度对比结果：',
        patentTable: null,
        comparisonData: {
          subjects: ['比亚迪', '宁德时代'],
          dimensions: ['专利总数', '发明专利占比', '授权率', '海外专利占比', '核心领域'],
          matrix: [
            ['12,850件', '3,200件'],
            ['78%', '92%'],
            ['62%', '71%'],
            ['35%', '48%'],
            ['磷酸铁锂/刀片电池', '三元锂电/钠离子电池']
          ],
          conclusion: '宁德时代在电池专利的发明专利占比和授权率上领先，海外布局更广；比亚迪在磷酸铁锂领域专利数量优势明显，刀片电池技术形成差异化壁垒。两家企业在钠离子电池领域均有布局，未来竞争加剧。'
        },
        chartData: {
          chartType: 'bar',
          title: '比亚迪 vs 宁德时代 电池专利对比',
          xAxis: ['专利总数', '发明专利', '海外专利', '授权专利'],
          series: [
            { name: '比亚迪', data: [12850, 10023, 4498, 7967] },
            { name: '宁德时代', data: [3200, 2944, 1536, 2272] }
          ],
          summary: '比亚迪专利总量约为宁德时代的4倍，但宁德时代在发明专利占比和海外布局比例上更具优势。'
        },
        dataSource: '对比维度: 专利数量/授权率/技术领域 | 数据库: 全球专利 | 统计时间: 1.8s',
        recommendations: ['比亚迪刀片电池核心专利', '宁德时代钠离子电池技术', '两家企业专利诉讼历史'],
        contextNote: null
      };
    }
    // --- 从 vv 案例提取：人形机器人专利分析场景 ---
    if (lowerInput.indexOf('人形机器人') >= 0 || lowerInput.indexOf('机器人') >= 0) {
      return {
        thinkingProcess: '1. 分析用户意图\n  - 识别到行业技术分析 -> 自主规划(Agent)场景\n  - 涉及多步骤: 检索->统计->分析->总结\n\nPlan:\n  1. 检索2025年人形机器人相关专利\n  2. 按申请人维度统计（识别主要申请主体）\n  3. 按IPC分类号聚类（识别技术方向）\n  4. 提取高价值专利摘要\n  5. 分析创新趋势与特点\n  6. 整合分析报告\n\nStep 1/6: 检索人形机器人专利 -> 命中 387 件\nStep 2/6: 申请人排名统计 -> 完成\nStep 3/6: IPC技术分类聚类 -> 完成\nStep 4/6: 高价值专利摘要提取 -> 完成',
        content: '2025年人形机器人专利全景分析，共检索到 <strong>387 件</strong> 相关专利。主要申请人及创新方向如下：',
        patentTable: MOCK_PATENTS_ROBOT,
        chartData: {
          chartType: 'bar',
          title: '2025年人形机器人专利申请人排名',
          xAxis: ['Tesla', '优必选', '华为', '波士顿动力', '小米', 'Figure AI'],
          series: [
            { name: '专利数量', data: [67, 52, 41, 35, 28, 22] }
          ],
          summary: '三大核心创新方向：运动控制与平衡（38%）、多模态感知与交互（29%）、灵巧操作与作业（22%）。"AI大模型+人形机器人"融合成为最显著趋势。中国企业在感知交互领域优势明显，美国企业在运动控制与AI融合方面保持领先。'
        },
        dataSource: '检索式: TI=(人形机器人) AND PD=2025 | 数据库: 全球专利 | 命中: 387 件 | 统计时间: 1.5s',
        recommendations: ['这些专利中哪些是高价值核心专利？', '2025年人形机器人高价值专利榜单', '人形机器人关键技术路线演进图'],
        contextNote: null
      };
    }
    // --- 从 vv 案例提取：专利有效期知识问答场景 ---
    if (lowerInput.indexOf('有效期') >= 0 || lowerInput.indexOf('保护期') >= 0 || lowerInput.indexOf('保护期限') >= 0) {
      return {
        thinkingProcess: '1. 分析用户意图\n  - 识别到专利法律知识类问题 -> 知识库(RAG)路由\n  - 匹配知识库类型: 专业知识类\n  - 查询知识库: "专利有效期/专利保护期限"\n  - BM25+向量混合检索 -> Rerank重排序\n  - 命中 专利法第42条 相关文档\n  - 基于知识库生成回答',
        content: '根据《中华人民共和国专利法》第四十二条及相关规定，各类专利的保护期限如下：<br/><br/><strong>发明专利</strong>：20年（自申请日起算）<br/><strong>实用新型专利</strong>：10年（自申请日起算）<br/><strong>外观设计专利</strong>：15年（自申请日起算，2021年6月1日后申请的）<br/><br/>注意事项：<br/>1. 专利权人需每年按时缴纳年费<br/>2. 发明专利可申请专利权期限补偿（PTA），最长不超过5年<br/>3. 药品专利可额外获得不超过5年的补偿<br/>4. 外国专利期限：美国发明20年/外观15年，欧洲发明20年/SPC最多延5年，日本发明20年/外观25年',
        patentTable: null,
        comparisonData: {
          subjects: ['中国', '美国', '欧洲', '日本'],
          dimensions: ['发明专利', '实用新型', '外观设计'],
          matrix: [
            ['20年', '20年', '20年', '20年'],
            ['10年', '—', '—', '—'],
            ['15年', '15年', '最长25年', '25年']
          ],
          conclusion: '各主要国家发明专利保护期均为20年，但起算日和补偿机制不同。中国实用新型和外观设计保护期相对较短，美国无实用新型制度，日本外观设计保护期最长（25年）。'
        },
        chartData: null,
        dataSource: '法律依据: 《中华人民共和国专利法》第四十二条 | 数据来源: 专利知识百问百答·第二章',
        recommendations: ['那外观设计专利的期限是多少？', '专利权期限补偿如何申请？', '中国与美欧专利期限差异对比'],
        contextNote: null
      };
    }
    // --- 从 vv 案例提取：数据范围使用指引场景 ---
    if (lowerInput.indexOf('数据范围') >= 0 || lowerInput.indexOf('数据库') >= 0 && lowerInput.indexOf('收录') >= 0) {
      return {
        thinkingProcess: '1. 分析用户意图\n  - 识别到使用指引类问题 -> 知识库(RAG)路由\n  - 匹配知识库类型: 平台操作类\n  - 查询知识库: "数据范围"\n  - BM25+向量混合检索 -> Rerank重排序\n  - 命中 top-3 相关文档片段\n  - 基于知识库生成回答',
        content: '壹专利数据库的数据范围如下：<br/><br/>收录全球 <strong>170+</strong> 个国家、地区及组织的专利数据，总量超过 <strong>2.3亿</strong> 条专利文献记录。<br/><br/><strong>地域覆盖</strong>：中国（CN）、美国（US）、欧洲（EP）、日本（JP）、韩国（KR）、WIPO（WO）等 170+ 个国家和地区<br/><strong>时间范围</strong>：最早追溯至 1790 年（US专利），中国专利从 1985 年起<br/><strong>文献类型</strong>：发明专利、实用新型、外观设计、PCT国际申请<br/><strong>法律状态</strong>：授权、审中、驳回、撤回、失效、期限届满等全生命周期<br/><strong>数据更新</strong>：中国专利每周更新3次（一/三/五）；国外专利每周更新1-2次<br/><strong>特色数据</strong>：专利全文文本（CN/US/EP/WO）、PDF原文、引证/被引证信息、同族信息、专利转让许可',
        patentTable: null,
        comparisonData: null,
        chartData: null,
        dataSource: '来源: 壹专利使用手册 - 数据覆盖范围章节 | 更新时间: 2025-06-20',
        recommendations: ['数据库检索字段说明', '数据库支持哪些运算符？', '数据更新频率是怎样的？'],
        contextNote: null
      };
    }
    // --- 从 vv 案例提取：语义检索场景 ---
    if (lowerInput.indexOf('头戴式') >= 0 || lowerInput.indexOf('眼动') >= 0 || lowerInput.indexOf('注视') >= 0) {
      return {
        thinkingProcess: '1. 分析用户意图\n  - 识别到长段技术描述 -> 语义检索场景\n  - 无需构建布尔检索式，直接调用语义检索\n  - 使用原始文本作为查询向量\n  - 检索参数: top_k=20, domain=全部',
        content: '为您进行语义检索，找到以下高度相关的专利（基于深度语义模型匹配）：',
        patentTable: MOCK_PATENTS_SEMANTIC,
        comparisonData: null,
        chartData: null,
        dataSource: '检索方式: 语义检索（向量相似度匹配） | top_k=20 | 检索时间: 1.1s',
        recommendations: ['基于注视交互的HMD专利技术路线', 'Apple与Magic Leap眼动追踪技术对比', '头戴式显示装置的专利布局分析'],
        contextNote: null
      };
    }
    // --- 推荐追问覆盖：海尔专利布局 ---
    if (lowerInput.indexOf('海尔') >= 0) {
      return {
        thinkingProcess: '1. 解析用户意图：用户想要对比海尔冰箱专利布局\n2. 构建检索式：AP=(海尔) AND TI=(冰箱) AND AD=(2022-2025)\n3. 在中国专利数据库中执行检索\n4. 与小米冰箱专利进行横向对比',
        content: '海尔集团近3年冰箱领域专利布局分析：<br/><br/>共检索到 <strong>47 件</strong> 相关专利，其中发明专利 38 件，实用新型 9 件。<br/><br/><strong>技术方向分布</strong>：<br/>- 智能温控与节能技术（32%）<br/>- 保鲜杀菌技术（26%）<br/>- 结构设计与空间优化（21%）<br/>- 物联网与远程控制（15%）<br/>- 其他（6%）<br/><br/><strong>与小米对比</strong>：海尔在冰箱领域专利总量约为小米的16倍，技术积累深厚。小米侧重智能化和IoT互联，海尔则在保鲜技术和节能领域优势明显。',
        patentTable: null,
        chartData: { chartType: 'pie', title: '海尔冰箱专利技术方向分布', xAxis: ['智能温控', '保鲜杀菌', '结构设计', '物联网', '其他'], series: [{ name: '专利数量', data: [15, 12, 10, 7, 3] }], summary: '海尔冰箱专利以智能温控和保鲜杀菌为核心，技术覆盖全面。' },
        dataSource: '检索式: AP=(海尔) AND TI=(冰箱) AND AD=(2022-2025) | 数据库: 中国专利 | 命中: 47 件 | 检索时间: 0.9s',
        recommendations: ['海尔冰箱核心保鲜技术分析', '海尔与美的冰箱专利对比', '海尔冰箱海外专利布局'],
        contextNote: null
      };
    }
    // --- 推荐追问覆盖：权利要求范围 ---
    if (lowerInput.indexOf('权利要求') >= 0) {
      return {
        thinkingProcess: '1. 解析用户意图：用户想要了解发明专利的权利要求范围\n2. 检索两件发明专利的独立权利要求\n3. 提取技术特征并进行对比分析\n4. 生成权利要求范围解读',
        content: '两件发明专利的独立权利要求范围分析：<br/><br/><strong>CN115432101A</strong>：<br/>独立权利要求1涵盖：一种冰箱控制方法，包括温度传感器采集、云端数据分析、用户习惯学习、自适应调节四个技术特征。保护范围较宽，覆盖了从感知到执行的全链路。<br/><br/><strong>CN115432102A</strong>：<br/>独立权利要求1涵盖：一种冰箱除菌装置，包括紫外线模块、臭氧发生模块、控制电路三个技术特征。保护范围聚焦在除菌功能模块，较为具体。<br/><br/><strong>范围对比</strong>：CN115432101A权利要求范围更宽，潜在侵权风险面更大；CN115432102A范围更聚焦，但技术壁垒更强。',
        patentTable: null,
        dataSource: '数据来源: 专利全文文本分析 | 分析时间: 1.2s',
        recommendations: ['两件专利的从属权利要求对比', '权利要求规避设计建议', '专利侵权风险分析'],
        contextNote: null
      };
    }
    // --- 推荐追问覆盖：发明人分析 ---
    if (lowerInput.indexOf('发明人') >= 0) {
      return {
        thinkingProcess: '1. 解析用户意图：用户想要了解小米智能驾驶核心发明人\n2. 检索小米智能驾驶专利的发明人字段\n3. 按发明人聚类统计专利数量\n4. 识别核心发明团队',
        content: '小米智能驾驶核心发明人 TOP 5：<br/><br/>1. <strong>王某</strong> - 67件（感知算法方向，主导激光雷达点云处理专利群）<br/>2. <strong>李某</strong> - 54件（决策规划方向，负责路径规划与行为预测）<br/>3. <strong>张某</strong> - 43件（控制执行方向，聚焦底盘控制与动力分配）<br/>4. <strong>刘某</strong> - 38件（高精地图方向，主导众包建图与动态更新）<br/>5. <strong>陈某</strong> - 31件（传感器融合方向，负责多传感器时空对齐）<br/><br/>核心团队特征：上述5人合计贡献233件专利，占小米智能驾驶专利总量的35%。团队以感知-决策-控制全链路覆盖为特点，与小米汽车SU7的自动驾驶系统架构高度对应。',
        patentTable: null,
        dataSource: '统计维度: 发明人字段聚类 | 数据库: 中国专利 | 统计时间: 0.8s',
        recommendations: ['这些发明人的专利被引用情况', '核心发明人的技术路线演变', '小米智能驾驶团队专利合作网络'],
        contextNote: null
      };
    }
    // --- 推荐追问覆盖：技术分布/技术路线 ---
    if (lowerInput.indexOf('技术分布') >= 0 || lowerInput.indexOf('技术路线') >= 0) {
      return {
        thinkingProcess: '1. 解析用户意图：用户想要了解技术分布或技术路线\n2. 对相关专利进行IPC分类号聚类\n3. 识别主要技术分支和演进趋势\n4. 生成技术路线图',
        content: '智能驾驶专利技术路线演进分析：<br/><br/><strong>第一代（2018-2020）</strong>：单传感器感知<br/>- 代表技术：单目视觉目标检测、毫米波雷达测距<br/>- IPC分类：B60W30/00, G06K9/00<br/><br/><strong>第二代（2021-2023）</strong>：多传感器融合<br/>- 代表技术：激光雷达+摄像头融合、BEV感知<br/>- IPC分类：G06V20/00, G06N3/00<br/><br/><strong>第三代（2024-2025）</strong>：端到端大模型<br/>- 代表技术：VLA（Vision-Language-Action）模型、占用网络<br/>- IPC分类：G06N20/00, G06V10/00<br/><br/><strong>趋势判断</strong>：从规则驱动向数据驱动演进，从模块化架构向端到端一体化演进。大模型+仿真成为下一阶段核心竞争点。',
        patentTable: null,
        chartData: { chartType: 'line', title: '智能驾驶技术路线专利申请趋势', xAxis: ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'], series: [{ name: '单传感器', data: [45, 52, 48, 30, 15, 8, 3, 1] }, { name: '多传感器融合', data: [12, 25, 38, 55, 62, 58, 45, 30] }, { name: '端到端大模型', data: [0, 0, 2, 8, 18, 35, 58, 72] }], summary: '技术路线呈明显的代际更替特征，端到端大模型在2024-2025年爆发式增长。' },
        dataSource: '分析维度: IPC分类号聚类+申请时间序列 | 数据库: 全球专利 | 分析时间: 1.5s',
        recommendations: ['各技术路线的代表企业对比', '端到端大模型的核心专利清单', '技术路线转换的专利布局建议'],
        contextNote: null
      };
    }
    // --- 推荐追问覆盖：地域分布 ---
    if (lowerInput.indexOf('地域分布') >= 0) {
      return {
        thinkingProcess: '1. 解析用户意图：用户想要了解专利的地域分布\n2. 按专利申请人国家/地区分组统计\n3. 生成地域分布表和饼图\n4. 分析地域布局特征',
        content: '2025年人形机器人专利地域分布分析：<br/><br/><strong>中国</strong>：187件（48.3%）<br/>- 主要城市：深圳（42件）、北京（38件）、上海（29件）、杭州（18件）<br/>- 优势领域：感知交互、灵巧操作<br/><br/><strong>美国</strong>：98件（25.3%）<br/>- 主要城市：硅谷（35件）、波士顿（22件）、匹兹堡（15件）<br/>- 优势领域：运动控制、AI大模型融合<br/><br/><strong>日本</strong>：42件（10.9%）<br/>- 主要企业：丰田、软银、本田<br/>- 优势领域：精密机械、行走机构<br/><br/><strong>欧洲</strong>：38件（9.8%）<br/>- 主要国家：德国（18件）、英国（12件）<br/>- 优势领域：安全标准、人机协作<br/><br/><strong>韩国</strong>：22件（5.7%）<br/>- 主要企业：三星、现代<br/><br/>格局判断：中美两国合计占比73.6%，形成双寡头竞争格局。中国侧重应用落地，美国主导基础创新。',
        patentTable: null,
        chartData: { chartType: 'pie', title: '人形机器人专利地域分布', xAxis: ['中国', '美国', '日本', '欧洲', '韩国'], series: [{ name: '专利数量', data: [187, 98, 42, 38, 22] }], summary: '中美双寡头格局明显，中国以应用端专利为主，美国以基础算法专利为主。' },
        dataSource: '统计维度: 申请人国家/地区 | 数据库: 全球专利 | 统计时间: 1.0s',
        recommendations: ['各国专利的技术方向差异', '海外专利布局策略建议', '主要国家的专利审查周期对比'],
        contextNote: null
      };
    }
    // --- 推荐追问覆盖：年费/费用 ---
    if (lowerInput.indexOf('年费') >= 0) {
      return {
        thinkingProcess: '1. 解析用户意图：用户询问专利年费缴纳标准\n2. 检索《专利法实施细则》及国家知识产权局收费标准\n3. 按专利类型和年度整理费率表',
        content: '中国专利年费缴纳标准（人民币/件/年）：<br/><br/><strong>发明专利</strong>：<br/>第1-3年：900元/年 | 第4-6年：1,200元/年 | 第7-9年：2,000元/年<br/>第10-12年：4,000元/年 | 第13-15年：6,000元/年 | 第16-20年：8,000元/年<br/><br/><strong>实用新型专利</strong>：<br/>第1-3年：600元/年 | 第4-5年：900元/年 | 第6-8年：1,200元/年<br/>第9-10年：2,000元/年<br/><br/><strong>外观设计专利</strong>：<br/>第1-3年：600元/年 | 第4-5年：900元/年 | 第6-8年：1,200元/年<br/>第9-10年：2,000元/年 | 第11-15年：3,000元/年<br/><br/><strong>费用减免</strong>：个人/小微企业可申请85%减免（前10年），需在申请时提交费用减缓请求书。',
        patentTable: null,
        dataSource: '法律依据: 《专利法实施细则》第九十七条 | 收费标准: 国家知识产权局公告第244号 | 更新时间: 2025-01-01',
        recommendations: ['如何办理年费减免', '逾期未缴年费的补救措施', '各国专利年费标准对比'],
        contextNote: null
      };
    }
    // --- 推荐追问覆盖：同族专利 ---
    if (lowerInput.indexOf('同族') >= 0) {
      return {
        thinkingProcess: '1. 解析用户意图：用户想要了解EP4000523B1的同族专利\n2. 检索该专利的DOCDB同族记录\n3. 按国家/地区整理同族成员\n4. 分析同族规模与布局策略',
        content: 'EP4000523B1 同族专利分析：<br/><br/><strong>同族规模</strong>：12 个同族成员，覆盖 8 个国家/地区<br/><br/><strong>同族成员清单</strong>：<br/>- US20211567890A1（美国，2021-08-12申请）<br/>- CN113456789A（中国，2021-09-20申请）<br/>- JP2023-123456A（日本，2023-01-15申请）<br/>- KR10-2022-0123456（韩国，2022-03-08申请）<br/>- WO2021/123456A1（PCT国际申请，2021-07-15申请）<br/>- EP4000523B1（欧洲，2021-07-15申请）<br/>- CA3123456A1（加拿大，2022-01-10申请）<br/>- AU2021234567A1（澳大利亚，2021-11-22申请）<br/><br/><strong>布局策略分析</strong>：<br/>以美国和中国为核心市场，日韩为次要市场，欧加澳为补充市场。PCT途径进入国家阶段的比例为75%，布局策略偏向高质量核心市场。',
        patentTable: null,
        dataSource: '数据来源: DOCDB同族数据库 | 检索时间: 0.6s',
        recommendations: ['各同族成员的法律状态差异', '同族专利的权利要求对比', 'PCT进入国家阶段的时机分析'],
        contextNote: null
      };
    }
    // --- 推荐追问覆盖：专利布局 ---
    if (lowerInput.indexOf('专利布局') >= 0) {
      return {
        thinkingProcess: '1. 解析用户意图：用户想要了解头戴式显示装置的专利布局\n2. 检索HMD领域主要申请人的专利组合\n3. 按技术方向和时间维度分析布局密度\n4. 生成布局热力图数据',
        content: '头戴式显示装置（HMD）专利布局全景分析：<br/><br/><strong>主要玩家布局密度</strong>（2020-2025累计）：<br/>- Meta：1,247件（光学显示36%、交互技术28%、内容生态22%）<br/>- Apple：892件（光学显示42%、传感器融合25%、芯片架构18%）<br/>- 索尼：734件（显示面板38%、游戏内容31%、音频技术16%）<br/>- 微软：621件（企业应用35%、混合现实28%、云渲染20%）<br/>- 华为：456件（通信协议30%、光学模组25%、轻量化设计22%）<br/><br/><strong>技术热点演进</strong>：<br/>2020-2022：Pancake光学、眼球追踪<br/>2023-2024：VST透视、手势识别<br/>2025：VLA大模型融合、空间计算<br/><br/><strong>空白机会点</strong>：医疗HMD、工业远程协作、教育沉浸式学习三个细分方向专利密度较低，存在布局窗口期。',
        patentTable: null,
        chartData: { chartType: 'bar', title: 'HMD领域主要申请人专利布局对比', xAxis: ['Meta', 'Apple', '索尼', '微软', '华为'], series: [{ name: '光学显示', data: [449, 375, 279, 155, 114] }, { name: '交互技术', data: [349, 223, 110, 124, 68] }, { name: '内容/应用', data: [274, 161, 228, 217, 91] }], summary: 'Meta和Apple在HMD领域专利布局最为密集，技术方向各有侧重。' },
        dataSource: '分析维度: 申请人+IPC分类号+时间序列 | 数据库: 全球专利 | 分析时间: 1.8s',
        recommendations: ['HMD领域专利申请趋势预测', '各技术方向的核心专利清单', 'HMD专利侵权风险预警'],
        contextNote: null
      };
    }
    // --- 推荐追问覆盖：查询专利有效性 ---
    if (lowerInput.indexOf('查询') >= 0 && (lowerInput.indexOf('有效') >= 0 || lowerInput.indexOf('状态') >= 0)) {
      return {
        thinkingProcess: '1. 解析用户意图：用户想要查询专利是否还在有效期内\n2. 说明专利有效性查询的多种途径\n3. 整理查询步骤和所需信息',
        content: '查询专利是否有效的主要途径：<br/><br/><strong>途径一：国家知识产权局官网</strong><br/>1. 访问中国及多国专利审查信息查询系统（http://cpquery.cnipa.gov.cn）<br/>2. 输入专利号/申请号/公开号<br/>3. 查看"法律状态"栏：授权/审中/驳回/撤回/失效/期限届满<br/>4. 查看"年费缴纳"记录：如存在未缴年费记录，专利可能已失效<br/><br/><strong>途径二：壹专利平台</strong><br/>1. 在壹专利搜索框输入专利号<br/>2. 在结果列表中查看"法律状态"标签<br/>3. 点击专利公开号进入详情页，查看完整的法律状态时间线<br/><br/><strong>途径三：第三方专利数据库</strong><br/>- Incopat、PatSnap、Orbis IP 等商业数据库提供更详细的法律状态监控和预警服务<br/><br/><strong>注意事项</strong>：专利失效后6个月内可办理恢复手续（需缴纳滞纳金），超过6个月则永久失效。',
        patentTable: null,
        dataSource: '来源: 国家知识产权局官方指南 | 壹专利使用手册·专利状态查询章节',
        recommendations: ['如何设置专利状态监控预警', '专利年费缴纳记录查询', '全球专利法律状态批量查询'],
        contextNote: null
      };
    }
    // --- 推荐追问覆盖：导出报告 ---
    if (lowerInput.indexOf('导出') >= 0) {
      return {
        thinkingProcess: '1. 解析用户意图：用户想要导出检索报告\n2. 检索报告导出功能说明\n3. 整理导出格式和包含内容',
        content: '检索报告导出功能说明：<br/><br/><strong>支持格式</strong>：<br/>- Word文档（.docx）：适合编辑和二次加工<br/>- Excel表格（.xlsx）：适合数据筛选和统计分析<br/>- PDF文档（.pdf）：适合正式提交和存档<br/><br/><strong>报告内容</strong>：<br/>1. 检索条件摘要（检索式、数据库、检索时间）<br/>2. 检索结果列表（公开号、名称、申请人、申请日、法律状态）<br/>3. 统计图表（年度趋势、申请人排名、技术分布）<br/>4. 分析结论和建议<br/>5. 数据来源说明<br/><br/><strong>导出操作</strong>：<br/>在对话界面点击每条回答下方的"导出"按钮，选择格式后即可下载。多轮对话的完整报告可在对话结束后点击"导出完整对话报告"。<br/><br/><strong>高级选项</strong>：支持自定义报告模板，可选择是否包含思考过程、是否包含专利全文链接等。',
        patentTable: null,
        dataSource: '来源: 壹专利使用手册·报告导出章节',
        recommendations: ['如何自定义报告模板', '批量导出专利全文PDF', '导出数据的后续分析方法'],
        contextNote: null
      };
    }
    // --- 推荐追问覆盖：外观设计与发明专利区别 ---
    if (lowerInput.indexOf('区别') >= 0 && (lowerInput.indexOf('外观设计') >= 0 || lowerInput.indexOf('发明') >= 0)) {
      return {
        thinkingProcess: '1. 解析用户意图：用户询问外观设计与发明专利的区别\n2. 从保护对象、审查标准、保护期限、申请文件等维度整理差异\n3. 生成对比表格',
        content: '外观设计与发明专利的核心区别：<br/><br/>| 对比维度 | 发明专利 | 外观设计专利 |<br/>|---------|---------|-------------|<br/>| <strong>保护对象</strong> | 技术方案（产品、方法或其改进） | 产品外观（形状、图案、色彩或其结合） |<br/>| <strong>审查标准</strong> | 新颖性+创造性+实用性 | 新颖性+区别于现有设计+适于工业应用 |<br/>| <strong>保护期限</strong> | 20年（自申请日起） | 15年（自申请日起，2021年6月1日后） |<br/>| <strong>审查周期</strong> | 2-3年（需实质审查） | 6-12个月（初步审查） |<br/>| <strong>申请文件</strong> | 说明书+权利要求书+摘要+附图 | 外观设计图片/照片+简要说明 |<br/>| <strong>侵权判定</strong> | 全面覆盖原则 | 整体观察+综合判断 |<br/>| <strong>费用</strong> | 申请费900元+实质审查费2500元 | 申请费500元（无实审费） |<br/><br/><strong>选择建议</strong>：产品内部结构或工作原理创新申请发明专利；产品外观造型创新申请外观设计；两者可同日申请，互不冲突。',
        patentTable: null,
        dataSource: '法律依据: 《专利法》第二条、第二十三条、第四十二条 | 数据来源: 专利知识百问百答',
        recommendations: ['同时申请发明和外观设计的策略', '外观设计专利的维权案例', 'PCT国际申请中外观设计的特殊规定'],
        contextNote: null
      };
    }
    // 默认回答
    return {
      thinkingProcess: '1. 解析用户意图：用户提出了一个关于专利的问题\n2. 在专利知识库中检索相关信息\n3. 整合多源信息生成回答\n4. 附加推荐追问',
      content: '您好！关于您的问题「' + input + '」，我已为您检索了相关资料。<br/><br/>这是一个很好的问题。在专利领域，需要综合考虑技术方案的新颖性、创造性和实用性。建议您可以从以下几个角度进行深入分析：<br/>1. 检索相关技术领域的已有专利<br/>2. 分析专利的权利要求范围<br/>3. 评估技术方案的专利布局价值<br/><br/>如果您需要更详细的信息，可以进一步描述您的需求。',
      patentTable: null,
      dataSource: '数据来源: 壹专利知识库 | 检索时间: 0.5s',
      recommendations: ['相关专利有哪些？', '如何评估专利价值？', '专利申请流程是什么？'],
      contextNote: null
    };
  }



  // ------------------------------------------------------------------ //
  // 对话操作函数                                                         //
  // ------------------------------------------------------------------ //
  AppState.sendMessage = function () {
    var content = AppState.inputContent.trim();
    if (!content || AppState.isStreaming) return;
    if (AppState.quota.remaining <= 0) return;

    // 添加用户消息
    AppState.messages.push({
      id: 'm' + Date.now(),
      role: 'user',
      content: content,
      contentType: 'text',
      createdAt: formatTime(new Date()),
      feedback: 'none',
      isStreaming: false
    });

    AppState.inputContent = '';
    AppState.isStreaming = true;
    scrollToBottom();

    // 创建助手消息占位
    var assistantMsgId = 'm' + (Date.now() + 1);
    AppState.messages.push({
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      contentType: 'text',
      createdAt: formatTime(new Date()),
      feedback: 'none',
      isStreaming: true,
      thinkingProcess: '',
      thinkingExpanded: false,
      dataSource: '',
      recommendations: [],
      patentTable: null,
      chartData: null,
      comparisonData: null,
      contextNote: null,
      contextType: null,
      route: null
    });

    scrollToBottom();

    // 模拟流式输出
    setTimeout(function () {
      var msg = AppState.messages.find(function (m) { return m.id === assistantMsgId; });
      if (!msg) return;

      var response = generateMockResponse(content);

      // --- 模型差异化：极速版 vs 深度思考版 ---
      if (AppState.currentModel === '极速版') {
        // 极速版：无思考过程，内容简洁
        msg.thinkingProcess = null;
        msg.thinkingExpanded = false;
      } else {
        // 深度思考版：保留完整思考过程
        msg.thinkingProcess = response.thinkingProcess;
        msg.thinkingExpanded = false;
      }

      // --- 输出密度差异化：简洁版 vs 图文版 ---
      if (AppState.outputMode === '简洁版') {
        // 简洁版：隐藏图表、表格、对比矩阵，仅保留文字摘要
        msg.content = response.content;
        msg.patentTable = null;
        msg.chartData = null;
        msg.comparisonData = null;
      } else {
        // 图文版：完整输出
        msg.content = response.content;
        msg.patentTable = response.patentTable;
        msg.chartData = response.chartData || null;
        msg.comparisonData = response.comparisonData || null;
      }

      msg.dataSource = response.dataSource;
      msg.recommendations = response.recommendations;
      msg.contextNote = response.contextNote;
      msg.contextType = response.contextType || null;
      msg.route = response.route || classifyRoute(content, response);
      msg.isStreaming = false;
      // 保存完整响应数据，用于输出密度/模型切换联动
      msg._fullResponse = {
        content: response.content,
        thinkingProcess: response.thinkingProcess,
        patentTable: response.patentTable,
        chartData: response.chartData || null,
        comparisonData: response.comparisonData || null
      };
      AppState.isStreaming = false;

      // 更新配额
      AppState.quota.used += 1;
      AppState.quota.remaining -= 1;
      updateQuotaDisplay();

      // 更新话题进度
      AppState.topicRound += 1;
      updateTopicProgress();

      scrollToBottom();
    }, 1500);
  };

  AppState.sendQuickMessage = function (text) {
    AppState.inputContent = text;
    AppState.sendMessage();
  };

  AppState.newConversation = function () {
    AppState.messages = [];
    AppState.currentTopic = '';
    AppState.topicRound = 0;
    AppState.topicProgress = 0;
    AppState.lockedPatent = null;
    AppState.inputContent = '';
    if (AppState.isMobile) AppState.sidebarVisible = false;
    // 切换到欢迎页，清除对话页相关高亮
    if (annotationState.highlightedZone === 'R-002' || annotationState.highlightedZone === 'R-003') {
      annotationState.highlightedZone = null;
    }
    if (annotationState.highlightedElement) {
      var chatElems = ['C-005','C-006','C-007','C-008','C-009','C-010','C-011','C-012','C-013','C-014','C-018','C-019','C-020','C-021','C-022'];
      if (chatElems.indexOf(annotationState.highlightedElement) !== -1) {
        annotationState.highlightedElement = null;
      }
    }
  };

  AppState.switchConversation = function (convId) {
    AppState.currentConversationId = convId;
    if (convId === 'c1') {
      AppState.messages = JSON.parse(JSON.stringify(MOCK_MESSAGES));
      AppState.currentTopic = '小米冰箱专利检索';
      AppState.topicRound = 4;
    } else if (convId === 'c2') {
      AppState.messages = JSON.parse(JSON.stringify(MOCK_MESSAGES_DRIVING));
      AppState.currentTopic = '小米智能驾驶专利分析';
      AppState.topicRound = 3;
    } else if (convId === 'c3') {
      AppState.messages = JSON.parse(JSON.stringify(MOCK_MESSAGES_ROBOT));
      AppState.currentTopic = '人形机器人专利分析';
      AppState.topicRound = 5;
    } else if (convId === 'c4') {
      AppState.messages = JSON.parse(JSON.stringify(MOCK_MESSAGES_VALIDITY));
      AppState.currentTopic = '专利有效期知识问答';
      AppState.topicRound = 2;
    } else if (convId === 'c5') {
      AppState.messages = JSON.parse(JSON.stringify(MOCK_MESSAGES_COMPARISON));
      AppState.currentTopic = 'EP4000523B1和US20230404487A1对比';
      AppState.topicRound = 1;
    } else if (convId === 'c6') {
      AppState.messages = JSON.parse(JSON.stringify(MOCK_MESSAGES_SEMANTIC));
      AppState.currentTopic = '语义检索头戴式显示装置';
      AppState.topicRound = 1;
    } else if (convId === 'c7') {
      AppState.messages = JSON.parse(JSON.stringify(MOCK_MESSAGES_BATTERY));
      AppState.currentTopic = '比亚迪vs宁德时代电池专利对比';
      AppState.topicRound = 1;
    } else if (convId === 'c8') {
      AppState.messages = JSON.parse(JSON.stringify(MOCK_MESSAGES_5G));
      AppState.currentTopic = '华为近5年5G专利趋势';
      AppState.topicRound = 1;
    } else {
      AppState.messages = [];
      AppState.currentTopic = '';
      AppState.topicRound = 0;
    }
    updateTopicProgress();
    if (AppState.isMobile) AppState.sidebarVisible = false;
    // 切换对话后：先快照原始数据，再应用输出密度和模型设置
    AppState.snapshotMessages();
    AppState.applyDisplaySettings();
    // 切换到对话页，清除欢迎页相关高亮
    if (annotationState.highlightedZone === 'R-005') {
      annotationState.highlightedZone = null;
    }
    if (annotationState.highlightedElement && ['C-016', 'C-017'].indexOf(annotationState.highlightedElement) !== -1) {
      annotationState.highlightedElement = null;
    }
  };

  // --- 输出密度/模型切换联动：更新所有历史消息的显示 ---
  AppState.applyDisplaySettings = function () {
    AppState.messages.forEach(function (msg) {
      if (msg.role !== 'assistant') return;
      // 如果没有 _fullResponse，从当前字段构造（仅在首次加载时执行）
      if (!msg._fullResponse) {
        msg._fullResponse = {
          content: msg.content,
          thinkingProcess: msg.thinkingProcess,
          patentTable: msg.patentTable,
          chartData: msg.chartData || null,
          comparisonData: msg.comparisonData || null
        };
      }
      var full = msg._fullResponse;

      // 模型差异化
      if (AppState.currentModel === '极速版') {
        // 极速版：隐藏思考过程
        msg.thinkingProcess = null;
        msg.thinkingExpanded = false;
      } else {
        // 深度思考版：恢复完整思考过程
        msg.thinkingProcess = full.thinkingProcess || null;
      }

      // 输出密度差异化
      if (AppState.outputMode === '简洁版') {
        // 简洁版：隐藏图表、表格、对比矩阵，仅保留文字摘要
        msg.patentTable = null;
        msg.chartData = null;
        msg.comparisonData = null;
      } else {
        // 图文版：完整输出
        msg.patentTable = full.patentTable;
        msg.chartData = full.chartData;
        msg.comparisonData = full.comparisonData;
      }
    });
  };

  // --- 为历史消息创建 _fullResponse 快照（在修改前调用） ---
  AppState.snapshotMessages = function () {
    AppState.messages.forEach(function (msg) {
      if (msg.role !== 'assistant') return;
      if (!msg._fullResponse) {
        msg._fullResponse = {
          content: msg.content,
          thinkingProcess: msg.thinkingProcess,
          patentTable: msg.patentTable,
          chartData: msg.chartData || null,
          comparisonData: msg.comparisonData || null
        };
      }
    });
  };

  // --- 模型切换处理 ---
  AppState.onModelChange = function () {
    AppState.applyDisplaySettings();
    ElementPlus.ElMessage({
      message: '已切换为' + AppState.currentModel + (AppState.currentModel === '极速版' ? '，回答更快速' : '，展示完整思考过程'),
      type: 'info',
      duration: 2000
    });
  };

  // --- 输出密度切换处理 ---
  AppState.onOutputModeChange = function () {
    AppState.applyDisplaySettings();
    ElementPlus.ElMessage({
      message: '已切换为' + AppState.outputMode + (AppState.outputMode === '简洁版' ? '，仅显示文字摘要' : '，显示完整图表和表格'),
      type: 'info',
      duration: 2000
    });
  };

  AppState.likeAnswer = function (msgId) {
    var msg = AppState.messages.find(function (m) { return m.id === msgId; });
    if (!msg) return;
    msg.feedback = msg.feedback === 'like' ? 'none' : 'like';
    if (msg.feedback === 'like') {
      ElementPlus.ElMessage({ message: '感谢您的反馈！', type: 'success', duration: 2000 });
    }
  };

  AppState.dislikeAnswer = function (msgId) {
    var msg = AppState.messages.find(function (m) { return m.id === msgId; });
    if (!msg) return;
    msg.feedback = msg.feedback === 'dislike' ? 'none' : 'dislike';
    if (msg.feedback === 'dislike') {
      AppState._dislikedMsgId = msgId;
      AppState.feedbackContent = '';
      AppState.feedbackDialogVisible = true;
    }
  };

  AppState.submitFeedback = function () {
    AppState.feedbackDialogVisible = false;
    ElementPlus.ElMessage({ message: '反馈已提交，我们会持续改进！', type: 'success', duration: 2000 });
    AppState._dislikedMsgId = null;
  };

  AppState.copyAnswer = function (msgId) {
    var msg = AppState.messages.find(function (m) { return m.id === msgId; });
    if (!msg) return;
    // 简化版复制：提取纯文本
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = msg.content;
    var text = tempDiv.textContent || tempDiv.innerText;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    ElementPlus.ElMessage({ message: '已复制到剪贴板', type: 'success', duration: 2000 });
  };

  AppState.exportAnswer = function (format) {
    var formatName = { docx: 'Word', excel: 'Excel', pdf: 'PDF' }[format] || format;
    ElementPlus.ElMessage({ message: '正在导出为 ' + formatName + ' 格式...', type: 'info', duration: 2000 });
    setTimeout(function () {
      ElementPlus.ElMessage({ message: formatName + ' 导出完成！', type: 'success', duration: 2000 });
    }, 1000);
  };

  AppState.viewPatentDetail = function (patent) {
    AppState.currentPatent = patent;
    AppState.openPatentDrawer();
  };

  // 打开专利详情抽屉（自动处理标注面板偏移）
  AppState.openPatentDrawer = function () {
    if (!AppState.currentPatent) {
      AppState.currentPatent = MOCK_PATENTS[0];
    }
    AppState.patentDrawerVisible = true;
    Vue.nextTick(function () {
      if (annotationState.showAnnotation) {
        document.body.classList.add('patent-drawer-offset');
      }
    });
  };

  // 供 HTML onclick 调用（专利链接）
  AppState.viewPatentDetailById = function (pubNum) {
    var allPatents = MOCK_PATENTS.concat(MOCK_PATENTS_DRIVING, MOCK_PATENTS_ROBOT, MOCK_PATENTS_SEMANTIC);
    var patent = allPatents.find(function (p) { return p.publicationNumber === pubNum; });
    if (patent) {
      AppState.viewPatentDetail(patent);
    }
  };

  // 专利抽屉关闭时清理body偏移class
  AppState.onPatentDrawerClose = function () {
    document.body.classList.remove('patent-drawer-offset');
    // 关闭抽屉，清除专利详情相关高亮
    if (annotationState.highlightedZone === 'R-004') {
      annotationState.highlightedZone = null;
    }
    if (annotationState.highlightedElement === 'C-015') {
      annotationState.highlightedElement = null;
    }
  };

  AppState.endTopic = function () {
    if (AppState.currentTopic) {
      ElementPlus.ElMessageBox.confirm(
        '确定要结束当前话题「' + AppState.currentTopic + '」吗？结束后可在历史对话中查看。',
        '结束话题',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
      ).then(function () {
        AppState.currentTopic = '';
        AppState.topicRound = 0;
        AppState.topicProgress = 0;
        ElementPlus.ElMessage({ message: '话题已结束', type: 'info', duration: 2000 });
      }).catch(function () {});
    }
  };

  // --- 移动端侧边栏切换 C-023 ---
  AppState.toggleSidebar = function () {
    AppState.sidebarVisible = !AppState.sidebarVisible;
  };

  AppState.closeSidebar = function () {
    AppState.sidebarVisible = false;
  };

  // --- 账号类型切换（Demo 演示用） ---
  AppState.switchAccountType = function () {
    AppState.accountType = AppState.accountType === 'basic' ? 'paid' : 'basic';
    AppState.quota.total = AppState.accountType === 'basic' ? 100 : 500;
    AppState.quota.remaining = AppState.quota.total - AppState.quota.used;
    if (AppState.quota.remaining < 0) AppState.quota.remaining = 0;
    updateQuotaDisplay();
    ElementPlus.ElMessage({
      message: '已切换为' + (AppState.accountType === 'basic' ? '基础用户（100次/日）' : '付费用户（500次/日）'),
      type: 'info',
      duration: 2000
    });
  };

  // --- 移动端检测 ---
  function checkMobile() {
    AppState.isMobile = window.innerWidth <= 768;
  }
  window.addEventListener('resize', checkMobile);
  checkMobile();

  // ------------------------------------------------------------------ //
  // 路由配置                                                             //
  // [约束#11] 静态路由排在动态路由之前                                    //
  // [约束#4] meta.pageId 与 annotationData key 对应                      //
  // ------------------------------------------------------------------ //
  var routes = [
    { path: '/', name: 'chat', component: window.ChatInterface, meta: { pageId: 'P01' } }
  ];

  var router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes: routes
  });

  // 路由切换时重置标注状态
  router.afterEach(function (to) {
    if (to.meta && to.meta.pageId) {
      annotationState.activePageId = to.meta.pageId;
    }
    annotationState.highlightedZone = null;
    annotationState.highlightedElement = null;
    annotationState.activeTab = 'L1';
  });

  // ------------------------------------------------------------------ //
  // 根组件模板                                                           //
  // [约束#8] .layout 绑定 :class="{ 'annotation-on': showAnnotation }"  //
  // ------------------------------------------------------------------ //
  var rootTemplate = [
    '<div class="layout" :class="{ \'annotation-on\': showAnnotation }">',
    '  <router-view></router-view>',
    '  <!-- 标注面板 -->',
    '  <div class="annotation-panel">',
    '    <div class="panel-header">',
    '      <span class="panel-title">原型标注</span>',
    '      <span class="page-id">{{ activePageId }}</span>',
    '    </div>',
    '    <div class="panel-tabs">',
    '      <div class="tab-btn" :class="{ active: activeTab === \'L1\' }" @click="activeTab = \'L1\'">L1页面</div>',
    '      <div class="tab-btn" :class="{ active: activeTab === \'L2\' }" @click="activeTab = \'L2\'">L2区域</div>',
    '      <div class="tab-btn" :class="{ active: activeTab === \'L3\' }" @click="activeTab = \'L3\'">L3元件</div>',
    '    </div>',
    '    <div class="panel-body">',
    '      <!-- L1 内容 -->',
    '      <div v-if="activeTab === \'L1\'" class="l1-content">',
    '        <div class="l1-section">',
    '          <div class="l1-label">页面标题</div>',
    '          <div class="l1-value">{{ currentAnnotation.L1.title }}</div>',
    '        </div>',
    '        <div class="l1-section">',
    '          <div class="l1-label">页面用途</div>',
    '          <div class="l1-value">{{ currentAnnotation.L1.purpose }}</div>',
    '        </div>',
    '        <div class="l1-section">',
    '          <div class="l1-label">用户流程</div>',
    '          <div class="l1-value">{{ currentAnnotation.L1.userFlow }}</div>',
    '        </div>',
    '      </div>',
    '      <!-- L2 内容 -->',
    '      <div v-if="activeTab === \'L2\'">',
    '        <div v-for="zone in visibleL2Zones" :key="zone.id" class="l2-card"',
    '             :data-card-zone="zone.id"',
    '             :class="{ \'is-active\': highlightedZone === zone.id }"',
    '             @click="highlightZone(zone.id)">',
    '          <div class="card-id">{{ zone.id }}</div>',
    '          <div class="card-name">{{ zone.name }}</div>',
    '          <div class="card-desc">{{ zone.description }}</div>',
    '        </div>',
    '      </div>',
    '      <!-- L3 内容 -->',
    '      <div v-if="activeTab === \'L3\'">',
    '        <div v-if="visibleAnnotations.length === 0" class="annotation-empty">暂无标注数据</div>',
    '        <div v-for="elem in visibleAnnotations" :key="elem.id" class="l3-card"',
    '             :data-card-element="elem.id"',
    '             :class="{ \'is-active\': highlightedElement === elem.id }"',
    '             @click="highlightElement(elem.id)">',
    '          <div class="card-id">{{ elem.id }}</div>',
    '          <div class="card-name">{{ elem.name }}</div>',
    '          <div class="card-desc">{{ elem.description }}</div>',
    '        </div>',
    '      </div>',
    '    </div>',
    '  </div>',
    '</div>'
  ].join('\n');

  // ------------------------------------------------------------------ //
  // 根组件定义                                                           //
  // ------------------------------------------------------------------ //
  var rootComponent = {
    template: rootTemplate,
    setup: function () {
      // [约束#5] 标注状态直接由根组件注入给子组件；根模板直接引用 showAnnotation / activeTab 等
      // 标注状态独立存储在 annotationState，通过 Object.assign 暴露给根模板

      // [约束#5] computed 仅在 setup() 内创建
      var currentAnnotation = Vue.computed(function () {
        var data = annotationState.annotationData[annotationState.activePageId];
        return data || { L1: { title: '', purpose: '', userFlow: '' }, L2: [], L3: [] };
      });

      // 根据左侧当前页面状态，计算当前可见的 L2 区域列表
      var currentVisibleZones = Vue.computed(function () {
        var zones = ['R-001']; // 侧边栏始终可见
        if (AppState.patentDrawerVisible) {
          zones.push('R-004');
        }
        if (AppState.messages.length === 0) {
          zones.push('R-005');
        } else {
          zones.push('R-002', 'R-003');
        }
        return zones;
      });

      // 右侧 L2 标签页只显示当前可见的区域
      var visibleL2Zones = Vue.computed(function () {
        var data = annotationState.annotationData[annotationState.activePageId];
        if (!data || !data.L2) return [];
        var visible = currentVisibleZones.value;
        return data.L2.filter(function (z) { return visible.indexOf(z.id) !== -1; });
      });

      // 右侧 L3 标签页只显示当前可见区域下的元素
      var visibleAnnotations = Vue.computed(function () {
        var data = annotationState.annotationData[annotationState.activePageId];
        if (!data || !data.L3) return [];
        var visible = currentVisibleZones.value;
        var list = data.L3.filter(function (e) { return visible.indexOf(e.zone) !== -1; });
        // 在 L2 标签页下且高亮了某个 zone 时，再按 zone 过滤
        if (annotationState.highlightedZone && annotationState.activeTab !== 'L3') {
          list = list.filter(function (e) { return e.zone === annotationState.highlightedZone; });
        }
        return list;
      });

      // 将标注状态的方法与计算属性一起暴露给根模板
      // 直接返回 annotationState 以保持其响应性
      return Object.assign(annotationState, {
        AppState: AppState,
        currentAnnotation: currentAnnotation,
        currentVisibleZones: currentVisibleZones,
        visibleL2Zones: visibleL2Zones,
        visibleAnnotations: visibleAnnotations
      });
    }
  };

  // ------------------------------------------------------------------ //
  // 创建并挂载 Vue 应用                                                   //
  // ------------------------------------------------------------------ //
  var app = Vue.createApp(rootComponent);
  app.use(router);
  app.use(ElementPlus, { locale: window.ElementPlusLocaleZhCn });

  // 挂载 AppState 到 window 供子组件访问
  window.AppState = AppState;

  app.mount('#app');

  // 初始化
  updateQuotaDisplay();
  updateTopicProgress();

})();
