// ==========================================
// 订单管理系统 - 全局数据、工具、组件定义
// 加载顺序：第 1 个脚本（被 app.js 引用组件变量）
// ==========================================

// ===========================================
// PART 0 — 标注样式注入（最小化，HP 配色由 style.css 接管）
// ===========================================
(function() {
  var s = document.createElement('style');
  s.textContent = ''
    + '@keyframes a-pulse{0%{transform:scale(1);box-shadow:0 0 0 0 rgba(2,74,216,.5)}50%{transform:scale(1.2);box-shadow:0 0 0 8px rgba(2,74,216,0)}100%{transform:scale(1);box-shadow:0 0 0 0 rgba(2,74,216,0)}}'
    + '.a-hl{animation:a-pulse .5s ease-in-out 2}'
    + '.a-pnl{width:320px;min-width:320px;overflow-y:auto;height:100%}'
    + '.a-pnl .el-tabs__content{padding:12px}'
    + '.a-l1s{margin-bottom:12px}'
    + '.a-item{padding:10px 12px;margin-bottom:8px;border-radius:8px;cursor:pointer;transition:background-color .3s}'
    + '.a-item .a-ihd{display:flex;align-items:center;margin-bottom:4px}'
    + '.a-item .a-inum{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:#024ad8;color:#fff;font-size:11px;font-weight:600;margin-right:8px;flex-shrink:0}'
    + '.a-item .a-idesc{line-height:1.5;margin-top:4px}'
    + '.a-item .a-ifml{line-height:1.6;margin-top:6px;padding:8px;border-radius:4px;font-family:Inter,Consolas,monospace}'
    + '.a-ifml .a-fr{display:flex;margin-bottom:2px}'
    + '.a-ifml .a-fl{min-width:48px;flex-shrink:0}'
    + '.a-empty{text-align:center;padding:40px 20px}'
    + '.a-mk{position:absolute;top:-8px;right:-8px;z-index:10;cursor:pointer;width:24px;height:30px;display:flex;align-items:center;justify-content:center}'
    + '.a-mk .a-mks{width:24px;height:30px;background:#024ad8;border:2px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.2)}'
    + '.a-mk .a-mkn{transform:rotate(45deg);color:#fff;font-size:11px;font-weight:600;line-height:1}'
    + '.a-dot{position:absolute;width:10px;height:10px;border-radius:50%;background:#024ad8;border:2px solid #fff;z-index:11;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.25)}';
  document.head.appendChild(s);
})();

// ===========================================
// PART 1 — 事件总线
// ===========================================
var EventBus = {
  _h: {},
  on: function(e, fn) { if (!this._h[e]) this._h[e] = []; this._h[e].push(fn); },
  emit: function(e) { var a = [].slice.call(arguments,1); (this._h[e]||[]).forEach(function(f){ f.apply(null,a); }); },
  off: function(e, fn) { if (this._h[e]) this._h[e] = this._h[e].filter(function(f){ return f !== fn; }); }
};

// ===========================================
// PART 2 — 工具函数
// ===========================================
var orderSeq = 10;
function generateOrderNo() {
  var n = new Date();
  return 'ORD-' + n.getFullYear() + String(n.getMonth()+1).padStart(2,'0') + String(n.getDate()).padStart(2,'0') + '-' + String(++orderSeq).padStart(4,'0');
}
function formatDateTime(s) {
  if (!s) return '-';
  var d = new Date(s);
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0') + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
}
function formatMoney(v) { return v ? v.toFixed(2) : '0.00'; }

// ===========================================
// PART 3 — 状态映射与流转规则
// ===========================================
var STATUS_MAP = {
  PENDING_PAY: { label: '待支付', type: 'warning' },
  PAID: { label: '已支付', type: '' },
  SHIPPED: { label: '已发货', type: '' },
  COMPLETED: { label: '已完成', type: 'success' },
  CANCELLED: { label: '已取消', type: 'info' }
};
var STATUS_FLOW = {
  PENDING_PAY: ['PAID', 'CANCELLED'],
  PAID: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: []
};
function getNextStatusLabel(v) { return STATUS_MAP[v] ? STATUS_MAP[v].label : v; }

// ===========================================
// PART 4 — 全局数据仓库
// ===========================================
var store = Vue.reactive({
  customers: [
    { id:1, name:'北京神州科技有限公司', contact_person:'张伟', contact_phone:'13800138001', email:'zhangwei@shenzhou.com', address:'北京市海淀区中关村大街1号', status:'ACTIVE' },
    { id:2, name:'上海华信信息技术有限公司', contact_person:'李娜', contact_phone:'13900139002', email:'lina@huaxin.com', address:'上海市浦东新区张江高科技园区', status:'ACTIVE' },
    { id:3, name:'广州天河软件股份有限公司', contact_person:'王强', contact_phone:'13700137003', email:'wangqiang@tianhe.com', address:'广州市天河区天河路385号', status:'ACTIVE' },
    { id:4, name:'深圳鹏程电子有限公司', contact_person:'赵敏', contact_phone:'13600136004', email:'zhaomin@pengcheng.com', address:'深圳市南山区科技园南路', status:'INACTIVE' },
    { id:5, name:'成都蓉城数据服务有限公司', contact_person:'陈刚', contact_phone:'13500135005', email:'chengang@rongcheng.com', address:'成都市高新区天府大道中段', status:'ACTIVE' },
    { id:6, name:'杭州西湖云计算科技股份有限公司', contact_person:'周涛', contact_phone:'18800188006', email:'zhoutao@xihucloud.com', address:'杭州市西湖区西溪路556号蚂蚁Z空间', status:'ACTIVE' },
    { id:7, name:'武汉光谷微电子有限公司', contact_person:'孙丽', contact_phone:'17700177007', email:'', address:'武汉市洪山区光谷大道77号', status:'ACTIVE' },
    { id:8, name:'西安高新技术产业开发区创业园管理办公室', contact_person:'吴磊', contact_phone:'13300133008', email:'wulei@xagx.com', address:'西安市高新区锦业路69号创业研发园', status:'ACTIVE' },
    { id:9, name:'南京紫金山实验室', contact_person:'郑博士', contact_phone:'18900189009', email:'', address:'', status:'INACTIVE' },
    { id:10, name:'重庆两江新区云计算投资有限公司', contact_person:'黄建国', contact_phone:'13600136010', email:'huangjg@ljcloud.com', address:'重庆市渝北区黄山大道中段64号', status:'ACTIVE' }
  ],
  products: [
    { id:1, name:'企业级防火墙', specification:'FW-2000E', unit:'台', unit_price:58000, stock:15, status:'ON_SALE' },
    { id:2, name:'云服务器ECS', specification:'ecs.c7.2xlarge', unit:'台', unit_price:1200, stock:50, status:'ON_SALE' },
    { id:3, name:'数据库审计系统', specification:'DAS-V5.0', unit:'套', unit_price:35000, stock:8, status:'ON_SALE' },
    { id:4, name:'SSL证书', specification:'OV通配符', unit:'个', unit_price:4800, stock:30, status:'ON_SALE' },
    { id:5, name:'数据备份一体机', specification:'BK-4800', unit:'台', unit_price:128000, stock:0, status:'ON_SALE' },
    { id:6, name:'负载均衡器', specification:'SLB-200G', unit:'台', unit_price:22000, stock:3, status:'ON_SALE' },
    { id:7, name:'对象存储服务', specification:'OSS-10TB', unit:'套', unit_price:9800, stock:25, status:'ON_SALE' },
    { id:8, name:'Web应用防火墙', specification:'WAF-Pro', unit:'套', unit_price:16800, stock:0, status:'ON_SALE' },
    { id:9, name:'内容分发网络', specification:'CDN-10TB', unit:'套', unit_price:4500, stock:100, status:'ON_SALE' },
    { id:10, name:'堡垒机', specification:'BH-500', unit:'台', unit_price:38000, stock:2, status:'ON_SALE' }
  ],
  orders: [
    { id:1, order_no:'ORD-20260618-0001', customer_id:1, total_amount:174800, status:'COMPLETED', remark:'神州科技网络安全升级项目', created_at:'2026-06-18T09:30:00', customer_name:'北京神州科技有限公司' },
    { id:2, order_no:'ORD-20260619-0002', customer_id:2, total_amount:72000, status:'SHIPPED', remark:'', created_at:'2026-06-19T14:20:00', customer_name:'上海华信信息技术有限公司' },
    { id:3, order_no:'ORD-20260620-0003', customer_id:3, total_amount:56000, status:'PAID', remark:'天河软件安全合规采购', created_at:'2026-06-20T10:15:00', customer_name:'广州天河软件股份有限公司' },
    { id:4, order_no:'ORD-20260620-0004', customer_id:5, total_amount:4800, status:'PENDING_PAY', remark:'', created_at:'2026-06-20T16:45:00', customer_name:'成都蓉城数据服务有限公司' },
    { id:5, order_no:'ORD-20260621-0005', customer_id:3, total_amount:128000, status:'CANCELLED', cancel_reason:'客户预算调整，项目暂缓', cancelled_by:'管理员', cancelled_at:'2026-06-21T11:00:00', remark:'原计划采购数据备份设备', created_at:'2026-06-21T08:00:00', customer_name:'广州天河软件股份有限公司' },
    { id:6, order_no:'ORD-20260615-0006', customer_id:6, total_amount:31800, status:'COMPLETED', remark:'西湖云CDN加速项目', created_at:'2026-06-15T11:00:00', customer_name:'杭州西湖云计算科技股份有限公司' },
    { id:7, order_no:'ORD-20260616-0007', customer_id:7, total_amount:63800, status:'COMPLETED', remark:'', created_at:'2026-06-16T09:45:00', customer_name:'武汉光谷微电子有限公司' },
    { id:8, order_no:'ORD-20260617-0008', customer_id:8, total_amount:22000, status:'SHIPPED', remark:'创业园网络安全一期', created_at:'2026-06-17T14:00:00', customer_name:'西安高新技术产业开发区创业园管理办公室' },
    { id:9, order_no:'ORD-20260621-0009', customer_id:10, total_amount:38400, status:'PENDING_PAY', remark:'', created_at:'2026-06-21T10:30:00', customer_name:'重庆两江新区云计算投资有限公司' },
    { id:10, order_no:'ORD-20260622-0010', customer_id:8, total_amount:55000, status:'PAID', remark:'安全加固二期', created_at:'2026-06-22T08:15:00', customer_name:'西安高新技术产业开发区创业园管理办公室' }
  ],
  orderItems: [
    { id:1, order_id:1, product_id:1, product_name:'企业级防火墙', specification:'FW-2000E', unit:'台', unit_price:58000, quantity:2, subtotal:116000 },
    { id:2, order_id:1, product_id:2, product_name:'云服务器ECS', specification:'ecs.c7.2xlarge', unit:'台', unit_price:1200, quantity:10, subtotal:12000 },
    { id:3, order_id:1, product_id:4, product_name:'SSL证书', specification:'OV通配符', unit:'个', unit_price:4800, quantity:5, subtotal:24000 },
    { id:4, order_id:2, product_id:3, product_name:'数据库审计系统', specification:'DAS-V5.0', unit:'套', unit_price:35000, quantity:2, subtotal:70000 },
    { id:5, order_id:2, product_id:2, product_name:'云服务器ECS', specification:'ecs.c7.2xlarge', unit:'台', unit_price:1200, quantity:1, subtotal:1200 },
    { id:6, order_id:3, product_id:1, product_name:'企业级防火墙', specification:'FW-2000E', unit:'台', unit_price:58000, quantity:1, subtotal:58000 },
    { id:7, order_id:4, product_id:4, product_name:'SSL证书', specification:'OV通配符', unit:'个', unit_price:4800, quantity:1, subtotal:4800 },
    { id:8, order_id:5, product_id:5, product_name:'数据备份一体机', specification:'BK-4800', unit:'台', unit_price:128000, quantity:1, subtotal:128000 },
    { id:9, order_id:6, product_id:9, product_name:'内容分发网络', specification:'CDN-10TB', unit:'套', unit_price:4500, quantity:2, subtotal:9000 },
    { id:10, order_id:6, product_id:4, product_name:'SSL证书', specification:'OV通配符', unit:'个', unit_price:4800, quantity:3, subtotal:14400 },
    { id:11, order_id:7, product_id:6, product_name:'负载均衡器', specification:'SLB-200G', unit:'台', unit_price:22000, quantity:1, subtotal:22000 },
    { id:12, order_id:7, product_id:8, product_name:'Web应用防火墙', specification:'WAF-Pro', unit:'套', unit_price:16800, quantity:1, subtotal:16800 },
    { id:13, order_id:7, product_id:2, product_name:'云服务器ECS', specification:'ecs.c7.2xlarge', unit:'台', unit_price:1200, quantity:15, subtotal:18000 },
    { id:14, order_id:8, product_id:6, product_name:'负载均衡器', specification:'SLB-200G', unit:'台', unit_price:22000, quantity:1, subtotal:22000 },
    { id:15, order_id:9, product_id:7, product_name:'对象存储服务', specification:'OSS-10TB', unit:'套', unit_price:9800, quantity:2, subtotal:19600 },
    { id:16, order_id:9, product_id:9, product_name:'内容分发网络', specification:'CDN-10TB', unit:'套', unit_price:4500, quantity:3, subtotal:13500 },
    { id:17, order_id:10, product_id:10, product_name:'堡垒机', specification:'BH-500', unit:'台', unit_price:38000, quantity:1, subtotal:38000 },
    { id:18, order_id:10, product_id:4, product_name:'SSL证书', specification:'OV通配符', unit:'个', unit_price:4800, quantity:2, subtotal:9600 }
  ],
  operationLogs: [
    { id:1, order_id:1, action:'CREATE', from_status:null, to_status:'PENDING_PAY', operator:'张伟', remark:'新建订单', created_at:'2026-06-18T09:30:00' },
    { id:2, order_id:1, action:'STATUS_CHANGE', from_status:'PENDING_PAY', to_status:'PAID', operator:'张伟', remark:'银行转账已到账', created_at:'2026-06-18T14:00:00' },
    { id:3, order_id:1, action:'STATUS_CHANGE', from_status:'PAID', to_status:'SHIPPED', operator:'李娜', remark:'顺丰快递 SF1234567890', created_at:'2026-06-19T10:00:00' },
    { id:4, order_id:1, action:'STATUS_CHANGE', from_status:'SHIPPED', to_status:'COMPLETED', operator:'王强', remark:'客户已签收确认', created_at:'2026-06-20T16:00:00' },
    { id:5, order_id:2, action:'CREATE', from_status:null, to_status:'PENDING_PAY', operator:'王强', remark:'新建订单', created_at:'2026-06-19T14:20:00' },
    { id:6, order_id:2, action:'STATUS_CHANGE', from_status:'PENDING_PAY', to_status:'PAID', operator:'王强', remark:'支付宝转账已到账', created_at:'2026-06-19T17:00:00' },
    { id:7, order_id:2, action:'STATUS_CHANGE', from_status:'PAID', to_status:'SHIPPED', operator:'李娜', remark:'德邦物流 DB9876543210', created_at:'2026-06-20T09:00:00' },
    { id:8, order_id:3, action:'CREATE', from_status:null, to_status:'PENDING_PAY', operator:'陈刚', remark:'新建订单', created_at:'2026-06-20T10:15:00' },
    { id:9, order_id:3, action:'STATUS_CHANGE', from_status:'PENDING_PAY', to_status:'PAID', operator:'陈刚', remark:'对公转账已到账', created_at:'2026-06-20T15:00:00' },
    { id:10, order_id:4, action:'CREATE', from_status:null, to_status:'PENDING_PAY', operator:'陈刚', remark:'新建订单', created_at:'2026-06-20T16:45:00' },
    { id:11, order_id:5, action:'CREATE', from_status:null, to_status:'PENDING_PAY', operator:'张伟', remark:'新建订单', created_at:'2026-06-21T08:00:00' },
    { id:12, order_id:5, action:'CANCEL', from_status:'PENDING_PAY', to_status:'CANCELLED', operator:'管理员', remark:'客户预算调整，项目暂缓', created_at:'2026-06-21T11:00:00' },
    { id:13, order_id:6, action:'CREATE', from_status:null, to_status:'PENDING_PAY', operator:'周涛', remark:'新建订单', created_at:'2026-06-15T11:00:00' },
    { id:14, order_id:6, action:'STATUS_CHANGE', from_status:'PENDING_PAY', to_status:'PAID', operator:'周涛', remark:'网银转账已到账', created_at:'2026-06-15T15:00:00' },
    { id:15, order_id:6, action:'STATUS_CHANGE', from_status:'PAID', to_status:'SHIPPED', operator:'李娜', remark:'EMS快递 EM882277330011', created_at:'2026-06-16T09:00:00' },
    { id:16, order_id:6, action:'STATUS_CHANGE', from_status:'SHIPPED', to_status:'COMPLETED', operator:'周涛', remark:'已签收确认', created_at:'2026-06-17T17:00:00' },
    { id:17, order_id:7, action:'CREATE', from_status:null, to_status:'PENDING_PAY', operator:'孙丽', remark:'新建订单', created_at:'2026-06-16T09:45:00' },
    { id:18, order_id:7, action:'STATUS_CHANGE', from_status:'PENDING_PAY', to_status:'PAID', operator:'孙丽', remark:'银行对公到账', created_at:'2026-06-16T11:00:00' },
    { id:19, order_id:7, action:'STATUS_CHANGE', from_status:'PAID', to_status:'SHIPPED', operator:'李娜', remark:'顺丰快递 SF8234567890', created_at:'2026-06-17T08:00:00' },
    { id:20, order_id:7, action:'STATUS_CHANGE', from_status:'SHIPPED', to_status:'COMPLETED', operator:'孙丽', remark:'已签收', created_at:'2026-06-18T10:00:00' },
    { id:21, order_id:8, action:'CREATE', from_status:null, to_status:'PENDING_PAY', operator:'吴磊', remark:'新建订单', created_at:'2026-06-17T14:00:00' },
    { id:22, order_id:8, action:'STATUS_CHANGE', from_status:'PENDING_PAY', to_status:'PAID', operator:'吴磊', remark:'财政拨款到账', created_at:'2026-06-17T18:00:00' },
    { id:23, order_id:8, action:'STATUS_CHANGE', from_status:'PAID', to_status:'SHIPPED', operator:'赵敏', remark:'京东物流 JD1122334455', created_at:'2026-06-18T08:00:00' },
    { id:24, order_id:9, action:'CREATE', from_status:null, to_status:'PENDING_PAY', operator:'黄建国', remark:'新建订单', created_at:'2026-06-21T10:30:00' },
    { id:25, order_id:10, action:'CREATE', from_status:null, to_status:'PENDING_PAY', operator:'吴磊', remark:'新建订单', created_at:'2026-06-22T08:15:00' },
    { id:26, order_id:10, action:'STATUS_CHANGE', from_status:'PENDING_PAY', to_status:'PAID', operator:'吴磊', remark:'政府采购款已到账', created_at:'2026-06-22T10:00:00' }
  ]
});

// ===========================================
// PART 5 — 标注数据
// ===========================================
var annotationData = Vue.reactive({
  'dashboard': {
    L1: { purpose:'订单管理系统首页概览，展示关键统计数据与最近订单动态', entryFrom:'系统登录后默认进入', preconditions:'用户已登录，拥有订单查看权限', entities:['订单','客户'], businessRules:['统计卡片展示总订单数、进行中订单数、本月新增订单数、订单总金额'], dataOverview:'当前展示 5 条 Mock 订单数据', testEntryData:'预置 5 条测试订单数据' },
    L2: [
      { id:'L2-db-01', number:1, areaName:'统计卡片区', description:'四个统计卡片：总订单数、进行中订单、本月新增、订单总额。实时汇总计算。' },
      { id:'L2-db-02', number:2, areaName:'最近订单列表', description:'展示最近创建的 5 条订单，含订单号、客户、金额、状态、时间。点击行跳转详情。' }
    ],
    L3: [
      { id:'L3-db-01', elementName:'统计卡片', trigger:'页面加载', condition:'数据就绪', response:'自动计算并渲染统计数值', state:'静态展示', exception:'无数据时显示 0' }
    ]
  },
  'order-list': {
    L1: {
      purpose:'展示所有订单信息，支持按状态、客户、创建时间多维度筛选排序，并提供状态变更与取消订单入口',
      entryFrom:'侧边栏菜单「订单管理 > 订单列表」或首页最近订单点击跳转',
      preconditions:'用户已登录。管理员拥有 Order.Read/status-change/cancel 权限；操作员仅拥有 Order.Read 权限',
      entities:['订单','客户'],
      businessRules: [
        '状态严格顺序流转：待支付→已支付→已发货→已完成，任意非终态可取消→已取消',
        '已取消/已完成订单不显示修改状态和取消按钮',
        '取消操作：必填原因和操作人；取消后自动回退对应产品库存',
        '每次状态变更实时追加操作日志'
      ],
      dataOverview:'10 条 Mock 订单：3已完成、2已发货、2已支付、2待支付、1已取消',
      testEntryData:'ORD-20260620-0004(待支付) / ORD-20260622-0010(已支付) / ORD-20260619-0002(已发货) / ORD-20260618-0001(已完成) / ORD-20260621-0005(已取消)'
    },
    L2: [
      { id:'L2-ol-01', number:1, areaName:'搜索筛选区', description:'背景 cloud(#f7f7f7)，border-radius 8px，内边距 16px。包含：订单号 el-input(180px)、状态 el-select(120px)、客户名称 el-input(180px)、创建时间 el-date-picker daterange(260px)、搜索/重置按钮。' },
      { id:'L2-ol-02', number:2, areaName:'操作按钮区', description:'左侧 HP Blue 新建订单按钮(4px圆角 uppercase)，右侧「共N条」灰色统计文本。' },
      { id:'L2-ol-03', number:3, areaName:'数据表格区', description:'el-table 16px圆角+Soft Lift阴影。表头 uppercase 600w 13px。操作列240px固定右，已取消/已完成行仅显示查看详情。行hover #f7f7f7背景。' },
      { id:'L2-ol-04', number:4, areaName:'分页区', description:'el-pagination 10/20/50切换。页码4px圆角按钮，活动页蓝底白字#024ad8，默认白底黑字hairline边框。' }
    ],
    L3: [
      { id:'L3-ol-01', elementName:'【修改状态】按钮', trigger:'单击', condition:'订单非已取消且非已完成', response:'弹出状态变更对话框(500px)：下一状态select+操作人必填input+备注textarea', state:'校验通过→更新order.status→追加operation_log→ElMessage.success→列表刷新', exception:'状态流转无可用选项时select为空；操作人空时红字错误提示' },
      { id:'L3-ol-02', elementName:'【取消订单】按钮', trigger:'单击', condition:'订单非已取消且非已完成', response:'弹出取消对话框(500px)：取消原因textarea必填+操作人必填', state:'校验通过→order.status=CANCELLED+记录取消时间→库存回退→追加CANCEL日志→列表刷新', exception:'原因/操作人空时红字错误；已取消行按钮隐藏' },
      { id:'L3-ol-03', elementName:'【查看详情】按钮', trigger:'单击', condition:'无', response:'路由跳转/order-detail/:id', state:'详情页加载(基本信息+产品明细+操作日志时间线)', exception:'订单id不存在显示empty-tip' },
      { id:'L3-ol-04', elementName:'【搜索】按钮', trigger:'单击', condition:'至少一个筛选项非空', response:'四维度过滤store.orders→computed.filtered重新计算→分页重置', state:'列表刷新→总条数更新', exception:'无匹配显示空状态' }
    ]
  },
  'order-create': {
    L1: { purpose:'新建订单：选择客户、添加产品明细、自动计算金额、生成唯一订单编号', entryFrom:'侧边栏 订单管理 > 新建订单', preconditions:'用户已登录，拥有 Order.Create 权限', entities:['订单','订单明细','客户','产品'], businessRules:['订单编号 ORD-YYYYMMDD-XXXX 自动生成','总金额 = Σ(单价×数量) 自动计算','至少一个产品明细','所选产品须为在售'], dataOverview:'预置 5 客户、5 在售产品', testEntryData:'选择「北京神州科技有限公司」+ 产品「企业级防火墙」×1' },
    L2: [
      { id:'L2-oc-01', number:1, areaName:'客户选择区', description:'下拉搜索选择客户，支持按名称模糊搜索。选中后显示联系人+电话。' },
      { id:'L2-oc-02', number:2, areaName:'产品明细区', description:'动态表格：添加/删除产品行，产品选择+单价自动带入+数量输入+小计自动计算，底部总金额。' },
      { id:'L2-oc-03', number:3, areaName:'备注与操作区', description:'备注（选填）。提交触发校验→生成编号→写入→跳转详情；重置清空所有。' }
    ],
    L3: [
      { id:'L3-oc-01', elementName:'【选择客户】下拉框', trigger:'聚焦', condition:'-', response:'下拉展示活跃客户', state:'选中回填客户信息', exception:'无匹配显示空' },
      { id:'L3-oc-02', elementName:'【添加产品】按钮', trigger:'单击', condition:'-', response:'明细表新增一行', state:'新增空白行→可编辑', exception:'-' },
      { id:'L3-oc-03', elementName:'【数量】输入框', trigger:'值变化', condition:'数量>0', response:'实时计算小计=单价×数量，同步总计', state:'数值变化→联动更新', exception:'非正整数校验错误' },
      { id:'L3-oc-04', elementName:'【提交订单】按钮', trigger:'单击', condition:'客户已选+至少一产品+校验通过', response:'生成编号→写入store→记日志→跳详情', state:'loading→成功→路由跳转', exception:'校验失败滚动到首错' }
    ]
  },
  'order-detail': {
    L1: { purpose:'查看订单完整信息：基本信息、产品明细、操作日志，可执行状态变更', entryFrom:'订单列表点击查看详情', preconditions:'用户已登录，拥有 Order.Read 权限', entities:['订单','订单明细','客户','产品','操作日志'], businessRules:['已取消不可修改','状态按序流转','操作日志时间倒序'], dataOverview:'从列表传入订单 ID 加载', testEntryData:'ORD-20260618-0001（已完成，含完整流转日志）' },
    L2: [
      { id:'L2-od-01', number:1, areaName:'订单基本信息区', description:'el-descriptions：订单编号、客户、总金额、状态tag、时间、取消原因、备注。' },
      { id:'L2-od-02', number:2, areaName:'客户信息区', description:'关联客户：名称、联系人、电话、邮箱、地址。' },
      { id:'L2-od-03', number:3, areaName:'产品明细区', description:'el-table：产品名称、规格、单位、单价、数量、小计，底部合计。' },
      { id:'L2-od-04', number:4, areaName:'操作日志区', description:'el-timeline 倒序：时间、操作类型、状态变化(从→到)、操作人、备注。' },
      { id:'L2-od-05', number:5, areaName:'状态操作区', description:'根据当前状态显示按钮：待支付→可付款/取消；已支付→可发货/取消；已发货→可完成；已完成/已取消→无。' }
    ],
    L3: [
      { id:'L3-od-01', elementName:'【返回列表】按钮', trigger:'单击', condition:'-', response:'返回订单列表页', state:'路由跳转', exception:'-' },
      { id:'L3-od-02', elementName:'【状态变更】按钮组', trigger:'单击', condition:'非已取消/非已完成', response:'确认弹窗→更新状态→追加日志', state:'状态更新→页面刷新', exception:'流转违规提示错误' }
    ]
  },
  'customer-list': {
    L1: { purpose:'管理所有客户信息，支持增删改查', entryFrom:'侧边栏菜单 客户管理', preconditions:'用户已登录，拥有 Customer.Read 权限', entities:['客户'], businessRules:['停用的客户仍可被历史订单关联','删除客户前需检查是否有关联订单'], dataOverview:'当前 5 条预置客户数据', testEntryData:'北京神州科技有限公司(活跃) / 深圳鹏程电子有限公司(停用)' },
    L2: [
      { id:'L2-cu-01', number:1, areaName:'搜索筛选区', description:'支持按客户名称模糊搜索、按状态下拉筛选。' },
      { id:'L2-cu-02', number:2, areaName:'操作按钮区', description:'新增客户按钮弹出表单弹窗。' },
      { id:'L2-cu-03', number:3, areaName:'数据表格区', description:'展示客户列表：名称、联系人、电话、邮箱、状态。操作列含编辑/删除。' },
      { id:'L2-cu-04', number:4, areaName:'分页区', description:'标准分页组件。' }
    ],
    L3: [
      { id:'L3-cu-01', elementName:'【新增客户】按钮', trigger:'单击', condition:'-', response:'弹出新增客户表单弹窗', state:'弹窗展开→提交→列表刷新', exception:'必填校验不通过阻止提交' },
      { id:'L3-cu-02', elementName:'【编辑】按钮', trigger:'单击', condition:'-', response:'弹出编辑表单弹窗，回填数据', state:'弹窗展开→提交→更新列表', exception:'-' }
    ]
  },
  'product-list': {
    L1: { purpose:'管理所有产品信息，支持增删改查和库存管理', entryFrom:'侧边栏菜单 产品管理', preconditions:'用户已登录，拥有 Product.Read 权限', entities:['产品'], businessRules:['下架产品不可被新订单引用','删除产品前需检查是否有关联订单明细','库存为0时红色警示、<5时蓝色提示'], dataOverview:'当前 5 条预置产品数据，含 1 条0库存', testEntryData:'数据备份一体机(BK-4800, 库存0) / 企业级防火墙(FW-2000E, 库存15)' },
    L2: [
      { id:'L2-pd-01', number:1, areaName:'搜索筛选区', description:'支持按产品名称/规格模糊搜索、按状态下拉筛选。' },
      { id:'L2-pd-02', number:2, areaName:'操作按钮区', description:'新增产品按钮弹出表单弹窗。' },
      { id:'L2-pd-03', number:3, areaName:'数据表格区', description:'展示产品列表：名称、规格、单位、单价、库存、状态。库存量根据数值变色。' },
      { id:'L2-pd-04', number:4, areaName:'分页区', description:'标准分页组件。' }
    ],
    L3: [
      { id:'L3-pd-01', elementName:'【新增产品】按钮', trigger:'单击', condition:'-', response:'弹出新增产品表单弹窗，含库存字段', state:'弹窗展开→提交→列表刷新', exception:'必填校验不通过阻止提交' },
      { id:'L3-pd-02', elementName:'【库存】列', trigger:'数值变化', condition:'库存量变化时', response:'0=红色 #b3262b, <5=蓝色 #024ad8, ≥5=黑色', state:'实时响应库存变化', exception:'-' }
    ]
  }
});

// ===========================================
// PART 6 — 标注系统组件
// ===========================================
var AnnotationPanel = {
  props: { currentPage:{type:String,default:''}, annotationData:{type:Object,default:function(){return{};}}, highlightItemId:{type:String,default:''} },
  emits: ['item-click'],
  data: function() { return { activeTab:'L1', localHL:'' }; },
  watch: {
    highlightItemId: function(nv) {
      if (!nv) return;
      var s = this;
      if (nv.indexOf('L2-')===0) s.activeTab='L2';
      else if (nv.indexOf('L3-')===0) s.activeTab='L3';
      s.localHL = nv;
      s.$nextTick(function() {
        var el = (s.$refs['item-' + nv] || [])[0] || s.$refs['item-' + nv];
        if (el && el.scrollIntoView) el.scrollIntoView({behavior:'smooth',block:'center'});
      });
      setTimeout(function(){ s.localHL=''; },2000);
    }
  },
  computed: {
    pg: function() { return this.annotationData[this.currentPage] || {L1:null,L2:[],L3:[]}; },
    l1: function() { return this.pg.L1 || null; },
    l2: function() { return this.pg.L2 || []; },
    l3: function() { return this.pg.L3 || []; }
  },
  methods: {
    hcls: function(id) { return this.localHL===id ? 'a-ihl a-hl' : ''; },
    clk2: function(item) { this.$emit('item-click', item.id); },
    clk3: function(item) { this.$emit('item-click', item.id); }
  },
  template: '<div class="a-pnl">'
    + '<div class="a-hd">标注说明</div>'
    + '<el-tabs v-model="activeTab" type="border-card" style="border:none;">'
    + '<el-tab-pane label="L1 页面说明" name="L1">'
    + '<div v-if="l1">'
    + '<div class="a-l1s"><div class="a-l1l">页面用途</div><div class="a-l1v">{{ l1.purpose || "-" }}</div></div>'
    + '<div class="a-l1s"><div class="a-l1l">入口来源</div><div class="a-l1v">{{ l1.entryFrom || "-" }}</div></div>'
    + '<div class="a-l1s"><div class="a-l1l">前置条件</div><div class="a-l1v">{{ l1.preconditions || "-" }}</div></div>'
    + '<div class="a-l1s"><div class="a-l1l">数据实体</div><div class="a-l1v">{{ Array.isArray(l1.entities) ? l1.entities.join("、") : (l1.entities||"-") }}</div></div>'
    + '<div class="a-l1s"><div class="a-l1l">业务规则</div><div class="a-l1v"><div v-if="Array.isArray(l1.businessRules)" v-for="r in l1.businessRules" style="margin-bottom:2px;">\u2022 {{ r }}</div></div></div>'
    + '<div class="a-l1s"><div class="a-l1l">数据概况</div><div class="a-l1v">{{ l1.dataOverview || "-" }}</div></div>'
    + '<div class="a-l1s"><div class="a-l1l">测试数据</div><div class="a-l1v">{{ l1.testEntryData || "-" }}</div></div>'
    + '</div><div v-else class="a-empty">无 L1 标注</div>'
    + '</el-tab-pane>'
    + '<el-tab-pane :label="\'L2 区域 (\'+l2.length+\')\'" name="L2">'
    + '<div v-if="l2.length>0">'
    + '<div v-for="item in l2" :key="item.id" :ref="\'item-\'+item.id" class="a-item" :class="hcls(item.id)" @click="clk2(item)">'
    + '<div class="a-ihd"><span class="a-inum">{{ item.number }}</span><span class="a-iname">{{ item.areaName }}</span></div>'
    + '<div class="a-idesc">{{ item.description }}</div></div>'
    + '</div><div v-else class="a-empty">无 L2 标注</div>'
    + '</el-tab-pane>'
    + '<el-tab-pane :label="\'L3 元件 (\'+l3.length+\')\'" name="L3">'
    + '<div v-if="l3.length>0">'
    + '<div v-for="item in l3" :key="item.id" :ref="\'item-\'+item.id" class="a-item" :class="hcls(item.id)" @click="clk3(item)">'
    + '<div class="a-ihd"><span class="a-iname">{{ item.elementName }}</span></div>'
    + '<div class="a-ifml">'
    + '<div class="a-fr"><span class="a-fl">触发：</span><span class="a-fv">{{ item.trigger||"-" }}</span></div>'
    + '<div class="a-fr"><span class="a-fl">条件：</span><span class="a-fv">{{ item.condition||"-" }}</span></div>'
    + '<div class="a-fr"><span class="a-fl">响应：</span><span class="a-fv">{{ item.response||"-" }}</span></div>'
    + '<div class="a-fr"><span class="a-fl">状态：</span><span class="a-fv">{{ item.state||"-" }}</span></div>'
    + '<div class="a-fr"><span class="a-fl">异常：</span><span class="a-fv">{{ item.exception||"-" }}</span></div>'
    + '</div></div>'
    + '</div><div v-else class="a-empty">无 L3 标注</div>'
    + '</el-tab-pane>'
    + '</el-tabs></div>'
};

var AnnotationMarker = {
  props: { number:{type:Number,required:true}, markerId:{type:String,required:true} },
  emits: ['click'],
  data: function() { return { isH:false }; },
  mounted: function() {
    var s = this;
    EventBus.on('annotation-item-click', function(id) { if (id===s.markerId) { s.isH=true; setTimeout(function(){ s.isH=false; },1000); } });
  },
  methods: {
    clk: function() { this.$emit('click', this.markerId); EventBus.emit('marker-click', this.markerId); }
  },
  template: '<div class="a-mk" :class="{ \'a-hl\': isH }" @click.stop="clk" :title="\'#\'+number"><div class="a-mks"><span class="a-mkn">{{ number }}</span></div></div>'
};

var AnnotationDot = {
  props: { dotId:{type:String,required:true} },
  emits: ['click'],
  data: function() { return { isH:false }; },
  mounted: function() {
    var s = this;
    EventBus.on('annotation-item-click', function(id) { if (id===s.dotId) { s.isH=true; setTimeout(function(){ s.isH=false; },1000); } });
  },
  methods: {
    clk: function() { this.$emit('click', this.dotId); EventBus.emit('marker-click', this.dotId); }
  },
  template: '<div class="a-dot" :class="{ \'a-hl\': isH }" @click.stop="clk" title="元件标注"></div>'
};

// ===========================================
// PART 7 — 页面组件
// ===========================================

// --- DashboardPage ---
var DashboardPage = {
  template: '<div>'
    + '<h2 class="page-title">首页概览</h2>'
    + '<div class="annotation-zone">'
    + '<annotation-marker :number="1" marker-id="L2-db-01"></annotation-marker>'
    + '<span style="position:relative;display:inline-block;"><annotation-dot dot-id="L3-db-01"></annotation-dot>'
    + '<el-row :gutter="20" class="stat-cards">'
    + '<el-col :span="6"><el-card shadow="hover"><div class="stat-card"><div class="stat-number">{{ totalOrders }}</div><div class="stat-label">总订单数</div></div></el-card></el-col>'
    + '<el-col :span="6"><el-card shadow="hover"><div class="stat-card"><div class="stat-number" style="color:#E6A23C;">{{ activeOrders }}</div><div class="stat-label">进行中订单</div></div></el-card></el-col>'
    + '<el-col :span="6"><el-card shadow="hover"><div class="stat-card"><div class="stat-number" style="color:#409EFF;">{{ monthOrders }}</div><div class="stat-label">本月新增</div></div></el-card></el-col>'
    + '<el-col :span="6"><el-card shadow="hover"><div class="stat-card"><div class="stat-number" style="color:#67C23A;">{{ formatMoney(totalAmount) }}</div><div class="stat-label">订单总额（元）</div></div></el-card></el-col>'
    + '</el-row></span></div>'
    + '<div class="annotation-zone">'
    + '<annotation-marker :number="2" marker-id="L2-db-02"></annotation-marker>'
    + '<el-card><template #header><span style="font-weight:600;">最近订单</span></template>'
    + '<el-table :data="recentOrders" stripe border>'
    + '<el-table-column prop="order_no" label="订单编号" min-width="160" />'
    + '<el-table-column prop="customer_name" label="客户名称" min-width="180" />'
    + '<el-table-column label="总金额" min-width="120" align="right"><template #default="scope">{{ formatMoney(scope.row.total_amount) }}</template></el-table-column>'
    + '<el-table-column label="状态" min-width="100"><template #default="scope"><el-tag :type="STATUS_MAP[scope.row.status].type" size="small">{{ STATUS_MAP[scope.row.status].label }}</el-tag></template></el-table-column>'
    + '<el-table-column label="创建时间" min-width="160"><template #default="scope">{{ formatDateTime(scope.row.created_at) }}</template></el-table-column>'
    + '<el-table-column label="操作" min-width="80"><template #default="scope"><el-button type="text" size="small" @click="$router.push(\'/order-detail/\'+scope.row.id)">查看</el-button></template></el-table-column>'
    + '</el-table></el-card></div></div>',
  computed: {
    totalOrders: function() { return store.orders.length; },
    activeOrders: function() { return store.orders.filter(function(o){ return o.status!=='COMPLETED'&&o.status!=='CANCELLED'; }).length; },
    monthOrders: function() {
      var n = new Date();
      return store.orders.filter(function(o){ var d=new Date(o.created_at); return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear(); }).length;
    },
    totalAmount: function() { return store.orders.reduce(function(s,o){ return s+o.total_amount; },0); },
    recentOrders: function() {
      return store.orders.slice().sort(function(a,b){ return new Date(b.created_at)-new Date(a.created_at); }).slice(0,5);
    }
  },
  methods: { formatMoney: formatMoney, formatDateTime: formatDateTime }
};

// --- OrderListPage ---
var OrderListPage = {
  data: function() {
    return {
      searchOrderNo:'', searchStatus:'', searchCustomer:'', searchDateRange:[],
      currentPage:1, pageSize:10,
      sdVisible:false, sdOrder:null, sdNext:'', sdRemark:'', sdOperator:'管理员',
      cdVisible:false, cdOrder:null, cdReason:'', cdOperator:'管理员'
    };
  },
  computed: {
    statusOptions: function() {
      return [{value:'',label:'全部'},{value:'PENDING_PAY',label:'待支付'},{value:'PAID',label:'已支付'},{value:'SHIPPED',label:'已发货'},{value:'COMPLETED',label:'已完成'},{value:'CANCELLED',label:'已取消'}];
    },
    sdNextOptions: function() {
      if (!this.sdOrder) return [];
      var flows = STATUS_FLOW[this.sdOrder.status] || [];
      var t = this;
      return flows.map(function(s){ return {value:s,label:getNextStatusLabel(s)}; });
    },
    filtered: function() {
      var t = this;
      var list = store.orders.filter(function(o){
        if (t.searchOrderNo && o.order_no.indexOf(t.searchOrderNo)===-1) return false;
        if (t.searchStatus && o.status!==t.searchStatus) return false;
        if (t.searchCustomer && o.customer_name.indexOf(t.searchCustomer)===-1) return false;
        if (t.searchDateRange && t.searchDateRange.length===2) {
          var c = new Date(o.created_at);
          if (c < t.searchDateRange[0] || c > new Date(t.searchDateRange[1].getTime()+86400000)) return false;
        }
        return true;
      });
      return list.sort(function(a,b){ return new Date(b.created_at)-new Date(a.created_at); });
    },
    paged: function() {
      var s = (this.currentPage-1)*this.pageSize;
      return this.filtered.slice(s, s+this.pageSize);
    }
  },
  methods: {
    formatMoney: formatMoney,
    formatDateTime: formatDateTime,
    ps: function(oid) {
      var items = store.orderItems.filter(function(i){ return i.order_id===oid; });
      if (!items.length) return '-';
      return items.map(function(i){ return i.product_name+' \u00d7'+i.quantity; }).join('、');
    },
    reset: function() { this.searchOrderNo=''; this.searchStatus=''; this.searchCustomer=''; this.searchDateRange=[]; this.currentPage=1; },
    sz: function(v) { this.pageSize=v; this.currentPage=1; },
    cp: function(v) { this.currentPage=v; },
    can: function(s) { return s!=='CANCELLED'&&s!=='COMPLETED'; },
    osd: function(row) {
      if (row.status==='CANCELLED') { ElMessage.warning('已取消的订单不可修改状态'); return; }
      if (row.status==='COMPLETED') { ElMessage.warning('已完成的订单不可修改状态'); return; }
      this.sdOrder=row; this.sdNext=''; this.sdRemark=''; this.sdOperator='管理员'; this.sdVisible=true;
    },
    sds: function() {
      if (!this.sdNext) { ElMessage.error('请选择目标状态'); return; }
      if (!this.sdOperator) { ElMessage.error('请填写操作人'); return; }
      var o = this.sdOrder;
      var prev = o.status;
      var pl = STATUS_MAP[prev].label;
      var nl = STATUS_MAP[this.sdNext].label;
      if (this.sdNext==='CANCELLED') {
        var t = this;
        ElMessageBox.confirm('确定将订单 '+o.order_no+' 从「'+pl+'」变更为「已取消」吗？取消后不可恢复。','确认取消',{ confirmButtonText:'确定', cancelButtonText:'返回', type:'warning' })
        .then(function(){
          o.status='CANCELLED'; o.cancelled_at=new Date().toISOString(); o.cancel_reason=t.sdRemark||'系统取消'; o.cancelled_by=t.sdOperator;
          // 库存回退
          var oid=o.id;
          store.orderItems.filter(function(i){ return i.order_id===oid; }).forEach(function(i){
            var p=store.products.find(function(p){ return p.id===i.product_id; });
            if(p) p.stock += i.quantity;
          });
          store.operationLogs.push({ id:store.operationLogs.length+1, order_id:o.id, action:'CANCEL', from_status:prev, to_status:'CANCELLED', operator:t.sdOperator, remark:t.sdRemark||'取消订单', created_at:new Date().toISOString() });
          ElMessage.success('订单已取消，库存已回退'); t.sdVisible=false;
        }).catch(function(){});
        return;
      }
      o.status = this.sdNext;
      store.operationLogs.push({ id:store.operationLogs.length+1, order_id:o.id, action:'STATUS_CHANGE', from_status:prev, to_status:this.sdNext, operator:this.sdOperator, remark:this.sdRemark||'状态变更', created_at:new Date().toISOString() });
      ElMessage.success('状态变更：'+pl+' \u2192 '+nl); this.sdVisible=false;
    },
    ocd: function(row) {
      if (row.status==='CANCELLED') { ElMessage.warning('该订单已被取消'); return; }
      if (row.status==='COMPLETED') { ElMessage.warning('已完成的订单不可取消'); return; }
      this.cdOrder=row; this.cdReason=''; this.cdOperator='管理员'; this.cdVisible=true;
    },
    cds: function() {
      if (!this.cdReason.trim()) { ElMessage.error('请填写取消原因'); return; }
      if (!this.cdOperator.trim()) { ElMessage.error('请填写操作人'); return; }
      var o = this.cdOrder;
      var prev = o.status;
      o.status='CANCELLED'; o.cancel_reason=this.cdReason; o.cancelled_by=this.cdOperator; o.cancelled_at=new Date().toISOString();
      // 库存回退
      var oid=o.id;
      store.orderItems.filter(function(i){ return i.order_id===oid; }).forEach(function(i){
        var p=store.products.find(function(p){ return p.id===i.product_id; });
        if(p) p.stock += i.quantity;
      });
      store.operationLogs.push({ id:store.operationLogs.length+1, order_id:o.id, action:'CANCEL', from_status:prev, to_status:'CANCELLED', operator:this.cdOperator, remark:this.cdReason, created_at:new Date().toISOString() });
      ElMessage.success('订单 '+o.order_no+' 已取消，库存已回退'); this.cdVisible=false;
    }
  },
  template: '<div>'
    + '<h2 class="page-title">订单列表</h2>'
    + '<div class="annotation-zone"><annotation-marker :number="1" marker-id="L2-ol-01"></annotation-marker>'
    + '<div class="search-area"><el-form :inline="true">'
    + '<el-form-item label="订单编号"><el-input v-model="searchOrderNo" placeholder="输入订单号" clearable style="width:180px;" /></el-form-item>'
    + '<el-form-item label="状态"><el-select v-model="searchStatus" placeholder="全部" clearable style="width:120px;"><el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" /></el-select></el-form-item>'
    + '<el-form-item label="客户"><el-input v-model="searchCustomer" placeholder="客户名称" clearable style="width:180px;" /></el-form-item>'
    + '<el-form-item label="创建时间"><el-date-picker v-model="searchDateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" style="width:260px;" /></el-form-item>'
    + '<el-form-item><span style="position:relative;display:inline-block;"><annotation-dot dot-id="L3-ol-04"></annotation-dot><el-button type="primary" @click="currentPage=1">搜索</el-button></span><el-button @click="reset">重置</el-button></el-form-item>'
    + '</el-form></div></div>'
    + '<div class="annotation-zone"><annotation-marker :number="2" marker-id="L2-ol-02"></annotation-marker>'
    + '<div class="action-bar"><el-button type="primary" icon="Plus" @click="$router.push(\'/order-create\')">新建订单</el-button><span style="color:#909399;font-size:13px;">共 {{ filtered.length }} 条</span></div></div>'
    + '<div class="annotation-zone"><annotation-marker :number="3" marker-id="L2-ol-03"></annotation-marker>'
    + '<div class="table-area"><el-table :data="paged" stripe border>'
    + '<el-table-column prop="order_no" label="订单编号" min-width="170" />'
    + '<el-table-column prop="customer_name" label="客户名称" min-width="180" />'
    + '<el-table-column label="产品概要" min-width="200"><template #default="scope">{{ ps(scope.row.id) }}</template></el-table-column>'
    + '<el-table-column label="总金额" min-width="120" align="right"><template #default="scope">\u00a5{{ formatMoney(scope.row.total_amount) }}</template></el-table-column>'
    + '<el-table-column label="状态" min-width="100"><template #default="scope"><el-tag :type="STATUS_MAP[scope.row.status].type" size="small">{{ STATUS_MAP[scope.row.status].label }}</el-tag></template></el-table-column>'
    + '<el-table-column label="创建时间" min-width="160"><template #default="scope">{{ formatDateTime(scope.row.created_at) }}</template></el-table-column>'
    + '<el-table-column label="操作" min-width="240" fixed="right"><template #default="scope">'
    + '<div style="display:flex;align-items:center;gap:8px;">'
    + '<span style="position:relative;display:inline-flex;align-items:center;"><annotation-dot dot-id="L3-ol-03" style="top:2px;left:-6px;right:auto;"></annotation-dot><el-button type="text" size="small" @click="$router.push(\'/order-detail/\'+scope.row.id)">查看详情</el-button></span>'
    + '<span style="position:relative;display:inline-flex;align-items:center;" v-if="can(scope.row.status)"><annotation-dot dot-id="L3-ol-01" style="top:2px;left:-6px;right:auto;"></annotation-dot><el-button type="text" size="small" @click="osd(scope.row)">修改状态</el-button></span>'
    + '<span style="position:relative;display:inline-flex;align-items:center;" v-if="can(scope.row.status)"><annotation-dot dot-id="L3-ol-02" style="top:2px;left:-6px;right:auto;"></annotation-dot><el-button type="text" size="small" style="color:#b3262b;" @click="ocd(scope.row)">取消</el-button></span>'
    + '</div>'
    + '</template></el-table-column>'
    + '</el-table></div></div>'
    + '<div class="annotation-zone"><annotation-marker :number="4" marker-id="L2-ol-04"></annotation-marker>'
    + '<el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10,20,50]" layout="total,sizes,prev,pager,next" :total="filtered.length" @size-change="sz" @current-change="cp" /></div>'
    // 状态变更弹窗
    + '<el-dialog v-model="sdVisible" title="修改订单状态" width="500px" destroy-on-close>'
    + '<el-form label-width="100px" v-if="sdOrder">'
    + '<el-form-item label="订单编号"><span>{{ sdOrder.order_no }}</span></el-form-item>'
    + '<el-form-item label="当前状态"><el-tag :type="STATUS_MAP[sdOrder.status].type" size="small">{{ STATUS_MAP[sdOrder.status].label }}</el-tag></el-form-item>'
    + '<el-form-item label="目标状态" required><el-select v-model="sdNext" placeholder="请选择" style="width:100%;"><el-option v-for="s in sdNextOptions" :key="s.value" :label="s.label" :value="s.value" /></el-select></el-form-item>'
    + '<el-form-item label="操作人" required><el-input v-model="sdOperator" /></el-form-item>'
    + '<el-form-item label="备注"><el-input v-model="sdRemark" type="textarea" :rows="2" placeholder="选填" /></el-form-item>'
    + '</el-form>'
    + '<template #footer><el-button @click="sdVisible=false">取消</el-button><el-button type="primary" @click="sds">确认变更</el-button></template></el-dialog>'
    // 取消弹窗
    + '<el-dialog v-model="cdVisible" title="取消订单" width="500px" destroy-on-close>'
    + '<el-form label-width="100px" v-if="cdOrder">'
    + '<el-form-item label="订单编号"><span>{{ cdOrder.order_no }}</span></el-form-item>'
    + '<el-form-item label="当前状态"><el-tag :type="STATUS_MAP[cdOrder.status].type" size="small">{{ STATUS_MAP[cdOrder.status].label }}</el-tag></el-form-item>'
    + '<el-form-item label="取消原因" required><el-input v-model="cdReason" type="textarea" :rows="3" placeholder="请填写取消原因" /></el-form-item>'
    + '<el-form-item label="操作人" required><el-input v-model="cdOperator" /></el-form-item>'
    + '</el-form>'
    + '<template #footer><el-button @click="cdVisible=false">返回</el-button><el-button type="danger" @click="cds">确认取消</el-button></template></el-dialog>'
    + '</div>'
};

// --- OrderCreatePage ---
var OrderCreatePage = {
  data: function() {
    return { cid:null, c:null, items:[], remark:'', submitting:false };
  },
  computed: {
    acs: function() { return store.customers.filter(function(c){ return c.status==='ACTIVE'; }); },
    aps: function() { return store.products.filter(function(p){ return p.status==='ON_SALE'; }); },
    total: function() { return this.items.reduce(function(s,i){ return s+(i.subtotal||0); },0); },
    canSubmit: function() { return this.cid && this.items.length>0 && this.items.every(function(i){ return i.pid&&i.qty>0; }); }
  },
  methods: {
    formatMoney: formatMoney,
    cc: function(v) { var f=store.customers.find(function(c){ return c.id===v; }); this.c=f||null; },
    add: function() { this.items.push({ pid:null, pname:'', spec:'', unit:'', price:0, qty:1, subtotal:0 }); },
    rm: function(idx) { this.items.splice(idx,1); },
    pc: function(idx, pid) {
      var p = store.products.find(function(p){ return p.id===pid; });
      if (p) { this.items[idx].pname=p.name; this.items[idx].spec=p.specification; this.items[idx].unit=p.unit; this.items[idx].price=p.unit_price; this.items[idx].subtotal=p.unit_price*this.items[idx].qty; }
    },
    qc: function(idx) { var i=this.items[idx]; i.subtotal=(i.price||0)*(i.qty||0); },
    submit: function() {
      if (!this.cid) { ElMessage.error('请选择客户'); return; }
      if (!this.items.length) { ElMessage.error('请至少添加一个产品'); return; }
      var iv = this.items.find(function(i){ return !i.pid||!i.qty||i.qty<=0; });
      if (iv) { ElMessage.error('请完善产品明细'); return; }
      // 库存校验
      var t=this;
      var insufficient = this.items.find(function(item){
        var p = store.products.find(function(p){ return p.id===item.pid; });
        return !p || p.stock < item.qty;
      });
      if (insufficient) {
        var pn = insufficient.pname || '产品';
        ElMessage.error(pn+' 库存不足，当前库存：'+(store.products.find(function(p){ return p.id===insufficient.pid; })?store.products.find(function(p){ return p.id===insufficient.pid; }).stock:0));
        return;
      }
      this.submitting=true;
      setTimeout(function(){
        // 扣减库存
        t.items.forEach(function(item){
          var p=store.products.find(function(p){ return p.id===item.pid; });
          if(p) p.stock -= item.qty;
        });
        var ono=generateOrderNo();
        var oid=store.orders.length+1;
        var isid=store.orderItems.length+1;
        var no={ id:oid, order_no:ono, customer_id:t.cid, customer_name:t.c?t.c.name:'', total_amount:t.total, status:'PENDING_PAY', remark:t.remark, created_at:new Date().toISOString() };
        store.orders.unshift(no);
        t.items.forEach(function(item,idx){
          store.orderItems.push({ id:isid+idx, order_id:oid, product_id:item.pid, product_name:item.pname, specification:item.spec, unit:item.unit, unit_price:item.price, quantity:item.qty, subtotal:item.subtotal });
        });
        store.operationLogs.push({ id:store.operationLogs.length+1, order_id:oid, action:'CREATE', from_status:null, to_status:'PENDING_PAY', operator:'当前用户', remark:'新建订单', created_at:new Date().toISOString() });
        t.submitting=false;
        ElMessage.success('订单创建成功：'+ono);
        t.$router.push('/order-detail/'+oid);
      },500);
    },
    reset: function() { this.cid=null; this.c=null; this.items=[]; this.remark=''; }
  },
  template: '<div>'
    + '<h2 class="page-title">新建订单</h2>'
    + '<div class="annotation-zone"><annotation-marker :number="1" marker-id="L2-oc-01"></annotation-marker>'
    + '<el-card class="detail-card"><template #header><span>选择客户</span></template>'
    + '<el-form label-width="100px">'
    + '<el-form-item label="客户" required><span style="position:relative;display:inline-block;"><annotation-dot dot-id="L3-oc-01"></annotation-dot><el-select v-model="cid" placeholder="请选择客户" filterable @change="cc" style="width:400px;"><el-option v-for="c in acs" :key="c.id" :label="c.name" :value="c.id" /></el-select></span></el-form-item>'
    + '<el-form-item v-if="c" label="联系人"><span>{{ c.contact_person }} / {{ c.contact_phone }}</span></el-form-item>'
    + '</el-form></el-card></div>'
    + '<div class="annotation-zone"><annotation-marker :number="2" marker-id="L2-oc-02"></annotation-marker>'
    + '<el-card class="detail-card"><template #header><div style="display:flex;justify-content:space-between;align-items:center;"><span>产品明细</span><span style="position:relative;display:inline-block;"><annotation-dot dot-id="L3-oc-02"></annotation-dot><el-button type="primary" size="small" icon="Plus" @click="add">添加产品</el-button></span></div></template>'
    + '<el-table :data="items" border stripe v-if="items.length>0" class="items-table">'
    + '<el-table-column label="序号" type="index" width="60" />'
    + '<el-table-column label="产品" min-width="180"><template #default="scope"><el-select v-model="scope.row.pid" placeholder="选择产品" @change="pc(scope.$index,$event)" style="width:100%;"><el-option v-for="p in aps" :key="p.id" :label="p.name+\' (\'+p.specification+\')\'" :value="p.id" /></el-select></template></el-table-column>'
    + '<el-table-column label="规格" min-width="120"><template #default="scope">{{ scope.row.spec||"-" }}</template></el-table-column>'
    + '<el-table-column label="单价" min-width="100" align="right"><template #default="scope">\u00a5{{ formatMoney(scope.row.price) }}</template></el-table-column>'
    + '<el-table-column label="数量" min-width="120"><template #default="scope"><span style="position:relative;display:inline-block;"><annotation-dot dot-id="L3-oc-03"></annotation-dot><el-input-number v-model="scope.row.qty" :min="1" :max="9999" @change="qc(scope.$index)" style="width:100px;" /></span></template></el-table-column>'
    + '<el-table-column label="小计" min-width="120" align="right"><template #default="scope">\u00a5{{ formatMoney(scope.row.subtotal) }}</template></el-table-column>'
    + '<el-table-column label="操作" min-width="80"><template #default="scope"><el-button type="text" style="color:#F56C6C;" @click="rm(scope.$index)">删除</el-button></template></el-table-column>'
    + '</el-table><div v-else class="empty-tip">暂未添加产品，请点击「添加产品」按钮</div>'
    + '<div v-if="items.length>0" style="text-align:right;margin-top:16px;font-size:16px;font-weight:600;color:#303133;">订单总金额：<span style="color:#409EFF;font-size:20px;">\u00a5{{ formatMoney(total) }}</span></div>'
    + '</el-card></div>'
    + '<div class="annotation-zone"><annotation-marker :number="3" marker-id="L2-oc-03"></annotation-marker>'
    + '<el-card class="detail-card"><template #header><span>备注与提交</span></template>'
    + '<el-form label-width="80px"><el-form-item label="订单备注"><el-input v-model="remark" type="textarea" :rows="3" placeholder="选填" /></el-form-item></el-form>'
    + '<div style="text-align:right;margin-top:16px;"><el-button @click="reset">重置</el-button><span style="position:relative;display:inline-block;"><annotation-dot dot-id="L3-oc-04"></annotation-dot><el-button type="primary" @click="submit" :loading="submitting" :disabled="!canSubmit">提交订单</el-button></span></div>'
    + '</el-card></div></div>'
};

// --- OrderDetailPage ---
var OrderDetailPage = {
  props: ['id'],
  data: function() {
    return { sdV:false, sdN:'', sdR:'', sdO:'管理员', cdV:false, cdR:'', cdO:'管理员' };
  },
  computed: {
    o: function() { return store.orders.find(function(o){ return o.id===parseInt(this.id); }.bind(this)) || null; },
    c: function() { if(!this.o) return null; return store.customers.find(function(c){ return c.id===this.o.customer_id; }.bind(this)) || null; },
    its: function() { if(!this.o) return []; return store.orderItems.filter(function(i){ return i.order_id===this.o.id; }.bind(this)); },
    lgs: function() {
      if(!this.o) return [];
      return store.operationLogs.filter(function(l){ return l.order_id===this.o.id; }.bind(this)).sort(function(a,b){ return new Date(b.created_at)-new Date(a.created_at); });
    },
    nso: function() { if(!this.o) return []; return (STATUS_FLOW[this.o.status]||[]).map(function(s){ return {value:s,label:getNextStatusLabel(s)}; }); },
    canOp: function() { return this.o && this.o.status!=='CANCELLED'&&this.o.status!=='COMPLETED'; }
  },
  methods: {
    formatMoney: formatMoney, formatDateTime: formatDateTime,
    la: function(a) { var m={CREATE:'创建订单',STATUS_CHANGE:'状态变更',CANCEL:'取消订单'}; return m[a]||a; },
    ls: function(l) { if(!l.from_status) return '初始 \u2192 '+getNextStatusLabel(l.to_status); return getNextStatusLabel(l.from_status)+' \u2192 '+getNextStatusLabel(l.to_status); },
    osd: function() { this.sdN=''; this.sdR=''; this.sdO='管理员'; this.sdV=true; },
    sds: function() {
      if (!this.sdN) { ElMessage.error('请选择目标状态'); return; }
      if (!this.sdO) { ElMessage.error('请填写操作人'); return; }
      var o=this.o, prev=o.status, pl=getNextStatusLabel(prev), nl=getNextStatusLabel(this.sdN);
      o.status=this.sdN;
      store.operationLogs.push({ id:store.operationLogs.length+1, order_id:o.id, action:'STATUS_CHANGE', from_status:prev, to_status:this.sdN, operator:this.sdO, remark:this.sdR||'状态变更', created_at:new Date().toISOString() });
      ElMessage.success('状态变更：'+pl+' \u2192 '+nl); this.sdV=false;
    },
    ocd: function() { this.cdR=''; this.cdO='管理员'; this.cdV=true; },
    cds: function() {
      if (!this.cdR.trim()) { ElMessage.error('请填写取消原因'); return; }
      if (!this.cdO.trim()) { ElMessage.error('请填写操作人'); return; }
      var o=this.o, prev=o.status;
      o.status='CANCELLED'; o.cancel_reason=this.cdR; o.cancelled_by=this.cdO; o.cancelled_at=new Date().toISOString();
      // 库存回退
      var oid=o.id;
      store.orderItems.filter(function(i){ return i.order_id===oid; }).forEach(function(i){
        var p=store.products.find(function(p){ return p.id===i.product_id; });
        if(p) p.stock += i.quantity;
      });
      store.operationLogs.push({ id:store.operationLogs.length+1, order_id:o.id, action:'CANCEL', from_status:prev, to_status:'CANCELLED', operator:this.cdO, remark:this.cdR, created_at:new Date().toISOString() });
      ElMessage.success('订单已取消，库存已回退'); this.cdV=false;
    }
  },
  template: '<div v-if="o">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;"><h2 class="page-title" style="margin-bottom:0;">订单详情</h2><span style="position:relative;display:inline-block;"><annotation-dot dot-id="L3-od-01"></annotation-dot><el-button @click="$router.push(\'/order-list\')">返回列表</el-button></span></div>'
    + '<div class="annotation-zone"><annotation-marker :number="1" marker-id="L2-od-01"></annotation-marker>'
    + '<el-card class="detail-card"><template #header><span>基本信息</span></template>'
    + '<el-descriptions :column="2" border>'
    + '<el-descriptions-item label="订单编号">{{ o.order_no }}</el-descriptions-item>'
    + '<el-descriptions-item label="订单状态"><el-tag :type="STATUS_MAP[o.status].type">{{ STATUS_MAP[o.status].label }}</el-tag></el-descriptions-item>'
    + '<el-descriptions-item label="客户名称">{{ o.customer_name }}</el-descriptions-item>'
    + '<el-descriptions-item label="总金额"><span style="color:#409EFF;font-weight:600;font-size:16px;">\u00a5{{ formatMoney(o.total_amount) }}</span></el-descriptions-item>'
    + '<el-descriptions-item label="创建时间">{{ formatDateTime(o.created_at) }}</el-descriptions-item>'
    + '<el-descriptions-item v-if="o.cancelled_at" label="取消时间">{{ formatDateTime(o.cancelled_at) }}</el-descriptions-item>'
    + '<el-descriptions-item v-if="o.cancel_reason" label="取消原因" :span="2">{{ o.cancel_reason }}</el-descriptions-item>'
    + '<el-descriptions-item v-if="o.remark" label="备注" :span="2">{{ o.remark }}</el-descriptions-item>'
    + '</el-descriptions></el-card></div>'
    + '<div class="annotation-zone" v-if="c"><annotation-marker :number="2" marker-id="L2-od-02"></annotation-marker>'
    + '<el-card class="detail-card"><template #header><span>客户信息</span></template>'
    + '<el-descriptions :column="2" border>'
    + '<el-descriptions-item label="客户名称">{{ c.name }}</el-descriptions-item>'
    + '<el-descriptions-item label="联系人">{{ c.contact_person }}</el-descriptions-item>'
    + '<el-descriptions-item label="联系电话">{{ c.contact_phone }}</el-descriptions-item>'
    + '<el-descriptions-item label="邮箱">{{ c.email||"-" }}</el-descriptions-item>'
    + '<el-descriptions-item label="地址" :span="2">{{ c.address||"-" }}</el-descriptions-item>'
    + '</el-descriptions></el-card></div>'
    + '<div class="annotation-zone"><annotation-marker :number="3" marker-id="L2-od-03"></annotation-marker>'
    + '<el-card class="detail-card"><template #header><span>产品明细</span></template>'
    + '<el-table :data="its" border stripe v-if="its.length>0">'
    + '<el-table-column type="index" label="序号" width="60" />'
    + '<el-table-column prop="product_name" label="产品名称" min-width="150" />'
    + '<el-table-column prop="specification" label="规格" min-width="120" />'
    + '<el-table-column prop="unit" label="单位" width="80" />'
    + '<el-table-column label="单价" min-width="120" align="right"><template #default="scope">\u00a5{{ formatMoney(scope.row.unit_price) }}</template></el-table-column>'
    + '<el-table-column prop="quantity" label="数量" min-width="100" />'
    + '<el-table-column label="小计" min-width="120" align="right"><template #default="scope">\u00a5{{ formatMoney(scope.row.subtotal) }}</template></el-table-column>'
    + '</el-table><div v-else class="empty-tip">暂无产品明细</div>'
    + '<div v-if="its.length>0" style="text-align:right;margin-top:12px;font-size:14px;color:#606266;">合计：<span style="color:#409EFF;font-weight:600;font-size:16px;">\u00a5{{ formatMoney(o.total_amount) }}</span></div>'
    + '</el-card></div>'
    + '<div class="annotation-zone"><annotation-marker :number="4" marker-id="L2-od-04"></annotation-marker>'
    + '<el-card class="detail-card"><template #header><span>操作日志</span></template>'
    + '<el-timeline v-if="lgs.length>0" class="log-timeline">'
    + '<el-timeline-item v-for="log in lgs" :key="log.id" :timestamp="formatDateTime(log.created_at)" :type="log.action===\'CANCEL\'?\'danger\':(log.action===\'CREATE\'?\'success\':\'primary\')" :hollow="log.action!==\'CREATE\'">'
    + '<div style="font-size:13px;"><span style="font-weight:500;">{{ la(log.action) }}</span><span v-if="log.action!==\'CREATE\'" style="margin-left:8px;color:#606266;">{{ ls(log) }}</span></div>'
    + '<div style="font-size:12px;color:#909399;margin-top:2px;">操作人：{{ log.operator }}<span v-if="log.remark" style="margin-left:8px;">| {{ log.remark }}</span></div>'
    + '</el-timeline-item></el-timeline><div v-else class="empty-tip">暂无操作日志</div>'
    + '</el-card></div>'
    + '<div class="annotation-zone" v-if="canOp"><annotation-marker :number="5" marker-id="L2-od-05"></annotation-marker>'
    + '<div class="status-actions"><span class="status-label">订单操作：</span>'
    + '<span style="position:relative;display:inline-block;"><annotation-dot dot-id="L3-od-02"></annotation-dot><el-button type="primary" @click="osd" v-if="nso.length>0&&!nso.every(function(s){return s.value===\'CANCELLED\'})">修改状态</el-button></span>'
    + '<el-button type="danger" @click="ocd">取消订单</el-button></div></div>'
    // 状态变更弹窗
    + '<el-dialog v-model="sdV" title="修改订单状态" width="500px" destroy-on-close>'
    + '<el-form label-width="100px"><el-form-item label="订单编号"><span>{{ o.order_no }}</span></el-form-item>'
    + '<el-form-item label="当前状态"><el-tag :type="STATUS_MAP[o.status].type">{{ STATUS_MAP[o.status].label }}</el-tag></el-form-item>'
    + '<el-form-item label="目标状态" required><el-select v-model="sdN" placeholder="请选择" style="width:100%;"><el-option v-for="s in nso" :key="s.value" :label="s.label" :value="s.value" v-if="s.value!==\'CANCELLED\'" /></el-select></el-form-item>'
    + '<el-form-item label="操作人" required><el-input v-model="sdO" /></el-form-item>'
    + '<el-form-item label="备注"><el-input v-model="sdR" type="textarea" :rows="2" placeholder="选填" /></el-form-item>'
    + '</el-form><template #footer><el-button @click="sdV=false">取消</el-button><el-button type="primary" @click="sds">确认变更</el-button></template></el-dialog>'
    // 取消弹窗
    + '<el-dialog v-model="cdV" title="取消订单" width="500px" destroy-on-close>'
    + '<el-form label-width="100px"><el-form-item label="订单编号"><span>{{ o.order_no }}</span></el-form-item>'
    + '<el-form-item label="当前状态"><el-tag :type="STATUS_MAP[o.status].type">{{ STATUS_MAP[o.status].label }}</el-tag></el-form-item>'
    + '<el-form-item label="取消原因" required><el-input v-model="cdR" type="textarea" :rows="3" placeholder="请填写取消原因" /></el-form-item>'
    + '<el-form-item label="操作人" required><el-input v-model="cdO" /></el-form-item>'
    + '</el-form><template #footer><el-button @click="cdV=false">返回</el-button><el-button type="danger" @click="cds">确认取消</el-button></template></el-dialog>'
    + '</div>'
    + '<div v-else class="empty-tip"><p>订单不存在或已被删除</p><el-button type="primary" @click="$router.push(\'/order-list\')">返回订单列表</el-button></div>'
};

// ===========================================
// PART 8 — 客户管理页
// ===========================================
var CustomerListPage = {
  data: function() {
    var phoneValidator = function(rule, value, callback) {
      if (!value) callback(new Error('请输入联系电话'));
      else if (!/^1[3-9]\d{9}$/.test(value) && !/^0\d{2,3}-?\d{7,8}$/.test(value)) callback(new Error('手机号或座机号格式不正确'));
      else callback();
    };
    var emailValidator = function(rule, value, callback) {
      if (!value) callback();
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) callback(new Error('邮箱格式不正确'));
      else callback();
    };
    return {
      searchName:'', searchStatus:'',
      currentPage:1, pageSize:10,
      dlgVisible:false, isEdit:false, dlgTitle:'新增客户',
      form:{ name:'', contact_person:'', contact_phone:'', email:'', address:'', status:'ACTIVE' },
      rules: {
        name: [
          { required:true, message:'请输入客户名称', trigger:'blur' },
          { max:100, message:'客户名称不超过100个字符', trigger:'blur' }
        ],
        contact_person: [
          { required:true, message:'请输入联系人', trigger:'blur' },
          { max:50, message:'联系人不超过50个字符', trigger:'blur' }
        ],
        contact_phone: [
          { required:true, validator:phoneValidator, trigger:'blur' }
        ],
        email: [
          { validator:emailValidator, trigger:'blur' }
        ],
        address: [
          { max:200, message:'地址不超过200个字符', trigger:'blur' }
        ]
      }
    };
  },
  computed: {
    filtered: function() {
      var t=this;
      return store.customers.filter(function(c){
        if(t.searchName && c.name.indexOf(t.searchName)===-1) return false;
        if(t.searchStatus && c.status!==t.searchStatus) return false;
        return true;
      });
    },
    paged: function() {
      var s=(this.currentPage-1)*this.pageSize;
      return this.filtered.slice(s,s+this.pageSize);
    }
  },
  methods: {
    formatMoney: formatMoney,
    reset: function() { this.searchName=''; this.searchStatus=''; this.currentPage=1; },
    openAdd: function() {
      this.isEdit=false; this.dlgTitle='新增客户';
      this.form={ name:'', contact_person:'', contact_phone:'', email:'', address:'', status:'ACTIVE' };
      this.dlgVisible=true;
    },
    openEdit: function(row) {
      this.isEdit=true; this.dlgTitle='编辑客户';
      this.form={ name:row.name, contact_person:row.contact_person, contact_phone:row.contact_phone, email:row.email, address:row.address, status:row.status };
      this.editTarget=row;
      this.dlgVisible=true;
    },
    save: function() {
      var t=this;
      this.$refs.customerForm.validate(function(valid){
        if(!valid) return;
        if(t.isEdit) { Object.assign(t.editTarget, t.form); ElMessage.success('客户信息已更新'); }
        else { var nc={ id:store.customers.length+1, name:t.form.name, contact_person:t.form.contact_person, contact_phone:t.form.contact_phone, email:t.form.email||'', address:t.form.address||'', status:t.form.status }; store.customers.push(nc); ElMessage.success('客户已添加'); }
        t.dlgVisible=false;
      });
    },
    del: function(row) {
      ElMessageBox.confirm('确定删除客户「'+row.name+'」吗？','确认删除',{ confirmButtonText:'确定', cancelButtonText:'取消', type:'warning' }).then(function(){
        var i=store.customers.indexOf(row); if(i>-1) store.customers.splice(i,1); ElMessage.success('已删除');
      }).catch(function(){});
    }
  },
  template: '<div>'
    + '<h2 class="page-title">客户列表</h2>'
    + '<div class="annotation-zone"><annotation-marker :number="1" marker-id="L2-cu-01"></annotation-marker>'
    + '<div class="search-area"><el-form :inline="true">'
    + '<el-form-item label="客户名称"><el-input v-model="searchName" placeholder="输入客户名称" clearable style="width:200px;" /></el-form-item>'
    + '<el-form-item label="状态"><el-select v-model="searchStatus" placeholder="全部" clearable style="width:120px;"><el-option label="活跃" value="ACTIVE" /><el-option label="停用" value="INACTIVE" /></el-select></el-form-item>'
    + '<el-form-item><el-button type="primary" @click="currentPage=1">搜索</el-button><el-button @click="reset">重置</el-button></el-form-item>'
    + '</el-form></div></div>'
    + '<div class="annotation-zone"><annotation-marker :number="2" marker-id="L2-cu-02"></annotation-marker>'
    + '<div class="action-bar"><el-button type="primary" icon="Plus" @click="openAdd">新增客户</el-button><span style="color:#909399;font-size:13px;">共 {{ filtered.length }} 条</span></div></div>'
    + '<div class="annotation-zone"><annotation-marker :number="3" marker-id="L2-cu-03"></annotation-marker>'
    + '<div class="table-area"><el-table :data="paged" stripe border>'
    + '<el-table-column prop="name" label="客户名称" min-width="200" />'
    + '<el-table-column prop="contact_person" label="联系人" min-width="100" />'
    + '<el-table-column prop="contact_phone" label="联系电话" min-width="130" />'
    + '<el-table-column prop="email" label="邮箱" min-width="170" />'
    + '<el-table-column label="状态" min-width="80"><template #default="scope"><el-tag :type="scope.row.status===\'ACTIVE\'?\'success\':\'info\'" size="small">{{ scope.row.status===\'ACTIVE\'?\'活跃\':\'停用\' }}</el-tag></template></el-table-column>'
    + '<el-table-column label="操作" min-width="130"><template #default="scope"><el-button type="text" size="small" @click="openEdit(scope.row)">编辑</el-button><el-button type="text" size="small" style="color:#b3262b;" @click="del(scope.row)">删除</el-button></template></el-table-column>'
    + '</el-table></div></div>'
    + '<div class="annotation-zone"><annotation-marker :number="4" marker-id="L2-cu-04"></annotation-marker>'
    + '<el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10,20,50]" layout="total,sizes,prev,pager,next" :total="filtered.length" @size-change="function(v){pageSize=v;currentPage=1;}" @current-change="function(v){currentPage=v;}" /></div>'
    + '<el-dialog v-model="dlgVisible" :title="dlgTitle" width="500px" destroy-on-close>'
    + '<el-form ref="customerForm" :model="form" :rules="rules" label-width="80px">'
    + '<el-form-item label="客户名称" prop="name"><el-input v-model="form.name" /></el-form-item>'
    + '<el-form-item label="联系人" prop="contact_person"><el-input v-model="form.contact_person" /></el-form-item>'
    + '<el-form-item label="联系电话" prop="contact_phone"><el-input v-model="form.contact_phone" /></el-form-item>'
    + '<el-form-item label="邮箱" prop="email"><el-input v-model="form.email" /></el-form-item>'
    + '<el-form-item label="地址" prop="address"><el-input v-model="form.address" /></el-form-item>'
    + '<el-form-item label="状态"><el-select v-model="form.status" style="width:100%;"><el-option label="活跃" value="ACTIVE" /><el-option label="停用" value="INACTIVE" /></el-select></el-form-item>'
    + '</el-form><template #footer><el-button @click="dlgVisible=false">取消</el-button><el-button type="primary" @click="save">保存</el-button></template></el-dialog>'
    + '</div>'
};

// ===========================================
// PART 9 — 产品管理页
// ===========================================
var ProductListPage = {
  data: function() {
    return {
      searchName:'', searchStatus:'',
      currentPage:1, pageSize:10,
      dlgVisible:false, isEdit:false, dlgTitle:'新增产品',
      form:{ name:'', specification:'', unit:'pcs', unit_price:0, stock:0, status:'ON_SALE' },
      rules: {
        name: [
          { required:true, message:'请输入产品名称', trigger:'blur' },
          { max:100, message:'产品名称不超过100个字符', trigger:'blur' }
        ],
        specification: [
          { required:true, message:'请输入产品规格', trigger:'blur' },
          { max:100, message:'规格不超过100个字符', trigger:'blur' }
        ],
        unit_price: [
          { required:true, message:'请输入单价', trigger:'blur' },
          { type:'number', min:0.01, message:'单价必须大于0', trigger:'blur' }
        ],
        stock: [
          { type:'number', min:0, message:'库存不能为负数', trigger:'blur' }
        ]
      }
    };
  },
  computed: {
    filtered: function() {
      var t=this;
      return store.products.filter(function(p){
        if(t.searchName && (p.name.indexOf(t.searchName)===-1 && p.specification.indexOf(t.searchName)===-1)) return false;
        if(t.searchStatus && p.status!==t.searchStatus) return false;
        return true;
      });
    },
    paged: function() {
      var s=(this.currentPage-1)*this.pageSize;
      return this.filtered.slice(s,s+this.pageSize);
    }
  },
  methods: {
    formatMoney: formatMoney,
    reset: function() { this.searchName=''; this.searchStatus=''; this.currentPage=1; },
    openAdd: function() {
      this.isEdit=false; this.dlgTitle='新增产品';
      this.form={ name:'', specification:'', unit:'pcs', unit_price:0, stock:0, status:'ON_SALE' };
      this.dlgVisible=true;
    },
    openEdit: function(row) {
      this.isEdit=true; this.dlgTitle='编辑产品';
      this.form={ name:row.name, specification:row.specification, unit:row.unit, unit_price:row.unit_price, stock:row.stock, status:row.status };
      this.editTarget=row;
      this.dlgVisible=true;
    },
    save: function() {
      var t=this;
      this.$refs.productForm.validate(function(valid){
        if(!valid) return;
        if(t.isEdit) { Object.assign(t.editTarget, t.form); ElMessage.success('产品信息已更新'); }
        else { var np={ id:store.products.length+1, name:t.form.name, specification:t.form.specification, unit:t.form.unit, unit_price:Number(t.form.unit_price), stock:Number(t.form.stock)||0, status:t.form.status }; store.products.push(np); ElMessage.success('产品已添加'); }
        t.dlgVisible=false;
      });
    },
    del: function(row) {
      ElMessageBox.confirm('确定删除产品「'+row.name+'」吗？','确认删除',{ confirmButtonText:'确定', cancelButtonText:'取消', type:'warning' }).then(function(){
        var i=store.products.indexOf(row); if(i>-1) store.products.splice(i,1); ElMessage.success('已删除');
      }).catch(function(){});
    }
  },
  template: '<div>'
    + '<h2 class="page-title">产品列表</h2>'
    + '<div class="annotation-zone"><annotation-marker :number="1" marker-id="L2-pd-01"></annotation-marker>'
    + '<div class="search-area"><el-form :inline="true">'
    + '<el-form-item label="名称/规格"><el-input v-model="searchName" placeholder="搜索名称或规格" clearable style="width:200px;" /></el-form-item>'
    + '<el-form-item label="状态"><el-select v-model="searchStatus" placeholder="全部" clearable style="width:120px;"><el-option label="在售" value="ON_SALE" /><el-option label="下架" value="OFF_SALE" /></el-select></el-form-item>'
    + '<el-form-item><el-button type="primary" @click="currentPage=1">搜索</el-button><el-button @click="reset">重置</el-button></el-form-item>'
    + '</el-form></div></div>'
    + '<div class="annotation-zone"><annotation-marker :number="2" marker-id="L2-pd-02"></annotation-marker>'
    + '<div class="action-bar"><el-button type="primary" icon="Plus" @click="openAdd">新增产品</el-button><span style="color:#909399;font-size:13px;">共 {{ filtered.length }} 条</span></div></div>'
    + '<div class="annotation-zone"><annotation-marker :number="3" marker-id="L2-pd-03"></annotation-marker>'
    + '<div class="table-area"><el-table :data="paged" stripe border>'
    + '<el-table-column prop="name" label="产品名称" min-width="160" />'
    + '<el-table-column prop="specification" label="规格" min-width="120" />'
    + '<el-table-column prop="unit" label="单位" width="70" />'
    + '<el-table-column label="单价" min-width="100" align="right"><template #default="scope">\u00a5{{ formatMoney(scope.row.unit_price) }}</template></el-table-column>'
    + '<el-table-column label="库存" min-width="80" align="center"><template #default="scope"><span :style="{color:scope.row.stock===0?\'#b3262b\':(scope.row.stock<5?\'#024ad8\':\'#1a1a1a\')}">{{ scope.row.stock }}</span></template></el-table-column>'
    + '<el-table-column label="状态" min-width="80"><template #default="scope"><el-tag :type="scope.row.status===\'ON_SALE\'?\'success\':\'info\'" size="small">{{ scope.row.status===\'ON_SALE\'?\'在售\':\'下架\' }}</el-tag></template></el-table-column>'
    + '<el-table-column label="操作" min-width="130"><template #default="scope"><el-button type="text" size="small" @click="openEdit(scope.row)">编辑</el-button><el-button type="text" size="small" style="color:#b3262b;" @click="del(scope.row)">删除</el-button></template></el-table-column>'
    + '</el-table></div></div>'
    + '<div class="annotation-zone"><annotation-marker :number="4" marker-id="L2-pd-04"></annotation-marker>'
    + '<el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10,20,50]" layout="total,sizes,prev,pager,next" :total="filtered.length" @size-change="function(v){pageSize=v;currentPage=1;}" @current-change="function(v){currentPage=v;}" /></div>'
    + '<el-dialog v-model="dlgVisible" :title="dlgTitle" width="500px" destroy-on-close>'
    + '<el-form ref="productForm" :model="form" :rules="rules" label-width="80px">'
    + '<el-form-item label="产品名称" prop="name"><el-input v-model="form.name" /></el-form-item>'
    + '<el-form-item label="规格" prop="specification"><el-input v-model="form.specification" /></el-form-item>'
    + '<el-form-item label="单位"><el-select v-model="form.unit" style="width:100%;"><el-option label="件" value="pcs" /><el-option label="千克" value="kg" /><el-option label="套" value="set" /><el-option label="箱" value="box" /></el-select></el-form-item>'
    + '<el-form-item label="单价" prop="unit_price"><el-input-number v-model="form.unit_price" :min="0" :precision="2" style="width:100%;" /></el-form-item>'
    + '<el-form-item label="库存" prop="stock"><el-input-number v-model="form.stock" :min="0" :step="1" style="width:100%;" /></el-form-item>'
    + '<el-form-item label="状态"><el-select v-model="form.status" style="width:100%;"><el-option label="在售" value="ON_SALE" /><el-option label="下架" value="OFF_SALE" /></el-select></el-form-item>'
    + '</el-form><template #footer><el-button @click="dlgVisible=false">取消</el-button><el-button type="primary" @click="save">保存</el-button></template></el-dialog>'
    + '</div>'
};
