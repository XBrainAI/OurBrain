# 05 - 页面清单

> 本文档定义系统的模块划分、页面列表、页面类型说明及功能依赖关系。

---

## 模块划分

| 模块 ID | 名称 | 说明 | 页面数 |
|---------|------|------|--------|
| M01 | InfringementLead管理 | InfringementLead管理相关功能页面 | 2 |
| M02 | EvidenceRecord管理 | EvidenceRecord管理相关功能页面 | 1 |
| M03 | RightsCase管理 | RightsCase管理相关功能页面 | 2 |
| M04 | CrossBorderRule管理 | CrossBorderRule管理相关功能页面 | 1 |

---

## 页面列表

| 页面 ID | 名称 | 模块 | 类型 | 路由 | 优先级 |
|---------|------|------|------|------|--------|
| P01 | monitor-dashboard | InfringementLead管理 | 仪表盘页 | /dashboard | P0 |
| P02 | infringement-leads | InfringementLead管理 | CRUD 列表页 | /leads | P0 |
| P03 | evidence-detail | EvidenceRecord管理 | 详情页 | /evidence | P0 |
| P04 | rights-cases | RightsCase管理 | CRUD 列表页 | /cases | P0 |
| P05 | cross-border-rules | CrossBorderRule管理 | CRUD 列表页 | /rules | P0 |
| P06 | rights-analytics | RightsCase管理 | 仪表盘页 | /analytics | P0 |

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
| infringement-leads | monitor-dashboard | infringement-leads通常在monitor-dashboard之后操作 |
| evidence-detail | infringement-leads | evidence-detail通常在infringement-leads之后操作 |
| rights-cases | evidence-detail | rights-cases通常在evidence-detail之后操作 |
| cross-border-rules | rights-cases | cross-border-rules通常在rights-cases之后操作 |
| rights-analytics | cross-border-rules | rights-analytics通常在cross-border-rules之后操作 |
| 侵权线索管理 | 存证记录管理 | 侵权线索可能关联存证记录数据 |
| 存证记录管理 | 侵权线索管理 | 存证记录可能关联侵权线索数据 |
| 维权案件管理 | 侵权线索管理 | 维权案件可能关联侵权线索数据 |


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-08-29T15:52:06.992Z）
