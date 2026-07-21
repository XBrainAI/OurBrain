# 05 - 页面清单

> 本文档定义系统的模块划分、页面列表、页面类型说明及功能依赖关系。

---

## 模块划分

| 模块 ID | 名称 | 说明 | 页面数 |
|---------|------|------|--------|
| M01 | patent-idea管理 | patent-idea管理相关功能页面 | 3 |

---

## 页面列表

| 页面 ID | 名称 | 模块 | 类型 | 路由 | 优先级 |
|---------|------|------|------|------|--------|
| P01 | patent-idea-list | patent-idea管理 | CRUD 列表页 | /patent-ideas | P0 |
| P02 | patent-idea-detail | patent-idea管理 | 详情页 | /patent-ideas/:id | P0 |
| P03 | patent-idea-form | patent-idea管理 | 表单页 | /patent-ideas/form | P0 |

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
| patent-idea-detail | patent-idea-list | patent-idea-detail通常在patent-idea-list之后操作 |
| patent-idea-form | patent-idea-detail | patent-idea-form通常在patent-idea-detail之后操作 |


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-07-21T09:56:38.084Z）
