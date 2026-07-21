# 05 - 页面清单

> 本文档定义系统的模块划分、页面列表、页面类型说明及功能依赖关系。

---

## 模块划分

| 模块 ID | 名称 | 说明 | 页面数 |
|---------|------|------|--------|
| M01 | patent-asset管理 | patent-asset管理相关功能页面 | 4 |

---

## 页面列表

| 页面 ID | 名称 | 模块 | 类型 | 路由 | 优先级 |
|---------|------|------|------|------|--------|
| P01 | patent-asset-list | patent-asset管理 | CRUD 列表页 | /patent-assets | P0 |
| P02 | patent-asset-detail | patent-asset管理 | 详情页 | /patent-assets/:id | P0 |
| P03 | patent-asset-evaluate | patent-asset管理 | 表单页 | /patent-assets/:id/evaluate | P0 |
| P04 | asset-dashboard | patent-asset管理 | 仪表盘页 | /patent-assets/dashboard | P0 |

---

## 页面类型说明

| 类型代码 | 类型名称 | 说明 |
|----------|----------|------|
| crud_list | CRUD 列表页 | 包含搜索区、数据表格、分页器，支持增删改查操作 |
| detail_view | 详情页 | 展示单条记录的完整信息，支持查看与编辑 |
| form_page | 表单页 | 独立的新增/编辑表单页面，适用于复杂录入场景 |
| dashboard | 仪表盘页 | 数据概览与可视化统计页面 |
| tree_list | 树形列表页 | 左侧树形导航 + 右侧数据列表的布局 |
| step_form | 分步表单页 | 多步骤填写流程，适用于复杂业务创建场景 |
| chat | 聊天对话页 | 消息列表 + 输入框 + 会话切换的即时通讯布局 |
| kanban | 看板页 | 多列卡片拖拽布局，适用于工单/任务流转管理 |

---

## 功能依赖关系

| 功能 | 依赖 | 说明 |
|------|------|------|
| patent-asset-detail | patent-asset-list | patent-asset-detail通常在patent-asset-list之后操作 |
| patent-asset-evaluate | patent-asset-detail | patent-asset-evaluate通常在patent-asset-detail之后操作 |
| asset-dashboard | patent-asset-evaluate | asset-dashboard通常在patent-asset-evaluate之后操作 |


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-07-21T10:12:23.185Z）
