# 05 - 页面清单

> 本文档定义系统的模块划分、页面列表、页面类型说明及功能依赖关系。

---

## 模块划分

| 模块 ID | 名称 | 说明 | 页面数 |
|---------|------|------|--------|
| M01 | Patent管理 | Patent管理相关功能页面 | 3 |
| M02 | Valuation管理 | Valuation管理相关功能页面 | 1 |
| M03 | AnnualFee管理 | AnnualFee管理相关功能页面 | 1 |
| M04 | Pledge管理 | Pledge管理相关功能页面 | 1 |
| M05 | Portfolio管理 | Portfolio管理相关功能页面 | 1 |
| M06 | MatchDemand管理 | MatchDemand管理相关功能页面 | 1 |

---

## 页面列表

| 页面 ID | 名称 | 模块 | 类型 | 路由 | 优先级 |
|---------|------|------|------|------|--------|
| P01 | patent-ledger | Patent管理 | CRUD 列表页 | /patents | P0 |
| P02 | patent-detail | Patent管理 | 详情页 | /patents/:id | P0 |
| P03 | valuation | Valuation管理 | CRUD 列表页 | /valuations | P0 |
| P04 | fee-monitor | AnnualFee管理 | CRUD 列表页 | /fees | P0 |
| P05 | pledge-transfer | Pledge管理 | CRUD 列表页 | /pledges | P0 |
| P06 | portfolio | Portfolio管理 | 仪表盘页 | /portfolio | P0 |
| P07 | match | MatchDemand管理 | CRUD 列表页 | /match | P0 |
| P08 | executive-cockpit | Patent管理 | 仪表盘页 | /cockpit | P0 |

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
| patent-detail | patent-ledger | patent-detail通常在patent-ledger之后操作 |
| valuation | patent-detail | valuation通常在patent-detail之后操作 |
| fee-monitor | valuation | fee-monitor通常在valuation之后操作 |
| pledge-transfer | fee-monitor | pledge-transfer通常在fee-monitor之后操作 |
| portfolio | pledge-transfer | portfolio通常在pledge-transfer之后操作 |
| match | portfolio | match通常在portfolio之后操作 |
| executive-cockpit | match | executive-cockpit通常在match之后操作 |
| 专利资产管理 | 估值记录管理 | 专利资产可能关联估值记录数据 |
| 估值记录管理 | 专利资产管理 | 估值记录可能关联专利资产数据 |
| 年费记录管理 | 专利资产管理 | 年费记录可能关联专利资产数据 |


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-08-30T00:54:23.718Z）
