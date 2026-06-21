// ==========================================
// 订单管理系统 - 路由配置与应用装配
// 加载顺序：第 2 个（依赖 components.js 中定义的组件变量）
// ==========================================

// === 路由配置 ===
var routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', component: DashboardPage, meta: { title: '首页概览', module: '首页' } },
  { path: '/order-list', component: OrderListPage, meta: { title: '订单列表', module: '订单管理' } },
  { path: '/order-create', component: OrderCreatePage, meta: { title: '新建订单', module: '订单管理' } },
  { path: '/order-detail/:id', component: OrderDetailPage, meta: { title: '订单详情', module: '订单管理' }, props: true },
  { path: '/customer-list', component: CustomerListPage, meta: { title: '客户列表', module: '客户管理' } },
  { path: '/product-list', component: ProductListPage, meta: { title: '产品列表', module: '产品管理' } }
];

var router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: routes
});

// === 应用创建 ===
var app = Vue.createApp({
  data: function() {
    return {
      showAnnotation: false,
      currentPageId: 'dashboard',
      annotationData: annotationData,
      highlightItemId: ''  // 由 EventBus 统一驱动，下传给 annotation-panel
    };
  },
  computed: {
    currentRoute: function() {
      return this.$route.path;
    },
    breadcrumbItems: function() {
      var meta = this.$route.meta || {};
      var items = [];
      if (meta.module) items.push({ title: meta.module });
      if (meta.title) items.push({ title: meta.title });
      return items;
    }
  },
  watch: {
    '$route': function(to) {
      var pathMap = {
        '/dashboard': 'dashboard',
        '/order-list': 'order-list',
        '/order-create': 'order-create',
        '/customer-list': 'customer-list',
        '/product-list': 'product-list'
      };
      this.currentPageId = pathMap[to.path] || (to.path.indexOf('/order-detail') === 0 ? 'order-detail' : 'dashboard');
    }
  },
  methods: {
    toggleAnnotation: function(val) {
      this.showAnnotation = val;
    },
    // 左侧标记被点击 → 自动打开标注面板 + 驱动右侧高亮
    onMarkerClick: function(markerId) {
      this.showAnnotation = true;
      this.highlightItemId = markerId;
    },
    // 右侧面板条目被点击 → 驱动左侧标记弹跳
    onAnnotationItemClick: function(itemId) {
      EventBus.emit('annotation-item-click', itemId);
    }
  },
  mounted: function() {
    var self = this;
    // 从左侧水滴/圆点发来的 EventBus 事件，桥接到 root app
    EventBus.on('marker-click', function(id) { self.onMarkerClick(id); });
  },
  beforeUnmount: function() {
    EventBus.off('marker-click');
  }
});

app.use(ElementPlus);
app.use(router);

// 注册全局标注组件
app.component('annotation-panel', AnnotationPanel);
app.component('annotation-marker', AnnotationMarker);
app.component('annotation-dot', AnnotationDot);

app.mount('#app');
