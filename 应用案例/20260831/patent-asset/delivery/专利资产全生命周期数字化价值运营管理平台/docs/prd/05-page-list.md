# 05 - 页面清单

> 本文档定义系统的模块划分、页面列表、页面类型说明及功能依赖关系。

---

## 模块划分

| 模块 ID | 名称 | 说明 | 页面数 |
|---------|------|------|--------|
| M01 | PatentAsset管理 | PatentAsset管理相关功能页面 | 3 |
| M02 | ValuationRecord管理 | ValuationRecord管理相关功能页面 | 1 |
| M03 | MatchDeal管理 | MatchDeal管理相关功能页面 | 1 |
| M04 | PledgeTransferRecord管理 | PledgeTransferRecord管理相关功能页面 | 1 |

---

## 页面列表

| 页面 ID | 名称 | 模块 | 类型 | 路由 | 优先级 |
|---------|------|------|------|------|--------|
| P01 | executive-dashboard | PatentAsset管理 | 仪表盘页 | /dashboard | P0 |
| P02 | patent-ledger | PatentAsset管理 | CRUD 列表页 | /patents | P0 |
| P03 | valuation-center | ValuationRecord管理 | CRUD 列表页 | /valuations | P0 |
| P04 | portfolio-strategy | PatentAsset管理 | 详情页 | /portfolio | P0 |
| P05 | match-channel | MatchDeal管理 | CRUD 列表页 | /matches | P0 |
| P06 | pledge-transfer | PledgeTransferRecord管理 | CRUD 列表页 | /pledges | P0 |

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
| patent-ledger | executive-dashboard | patent-ledger通常在executive-dashboard之后操作 |
| valuation-center | patent-ledger | valuation-center通常在patent-ledger之后操作 |
| portfolio-strategy | valuation-center | portfolio-strategy通常在valuation-center之后操作 |
| match-channel | portfolio-strategy | match-channel通常在portfolio-strategy之后操作 |
| pledge-transfer | match-channel | pledge-transfer通常在match-channel之后操作 |
| 专利资产管理 | 估值记录管理 | 专利资产可能关联估值记录数据 |
| 估值记录管理 | 专利资产管理 | 估值记录可能关联专利资产数据 |
| 年费记录管理 | 专利资产管理 | 年费记录可能关联专利资产数据 |


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-08-28T16:41:57.827Z）
