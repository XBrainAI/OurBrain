# 00 - PRD 总览与索引

> 本文档是产品需求文档 (PRD) 的主索引，汇总项目基本信息与文档结构。

---

## TL;DR（一页纸摘要）

> 3-5 行项目摘要，让 PM/研发/测试在 30 秒内理解项目本质。

- **项目定位**：将专利从授权登记、年费监控、AI 四维估值、组合战略、产业撮合到质押/转让退出的全过程纳入统一数字底稿，让专利资产可量化、可预警、可交易、可尽调。
- **核心差异点**：整合 5 大业务实体（专利资产、估值记录、年费记录、质押转让记录），提供全流程数字化管理
- **关键功能**：查看看板、浏览PatentAsset、浏览ValuationRecord
- **一句话状态**：规划中，计划 2026-Q4 上线
- **关键数字**：5 实体 / 4 角色 / 6 页面

---

## 项目信息

| 字段 | 内容 |
|------|------|
| 项目名称 | 专利资产全生命周期数字化价值运营管理平台 |
| 产品愿景 | 将专利从授权登记、年费监控、AI 四维估值、组合战略、产业撮合到质押/转让退出的全过程纳入统一数字底稿，让专利资产可量化、可预警、可交易、可尽调。 |
| 所属领域 | IPAM |
| 目标平台 | Web 后台管理系统（响应式适配桌面端） |
| 技术栈 | 前端 React + 后端 RESTful API + 关系型数据库 |
| 文档版本 | v5.2.2 |
| 项目状态 | 规划中 |
| 产品经理 | 由 Demora 生成 |
| 计划发布日期 | 2026-Q4 |

---

## PRD 文档结构

| 编号 | 文档名称 | 说明 | 链接 |
|------|----------|------|------|
| 00 | PRD 总览与索引 | 项目信息、文档结构、关联文档 | [00-overview.md](./00-overview.md) |
| 01 | 背景与目标 | 业务背景、核心痛点、解决方案、目标 | [01-background.md](./01-background.md) |
| 02 | 目标用户 | 用户分群、用户画像、使用场景、客户洞察 | [02-target-audience.md](./02-target-audience.md) |
| 03 | 用户角色 | 角色定义、权限概要、角色详细说明 | [03-user-roles.md](./03-user-roles.md) |
| 04 | 业务流程 | 主流程、分支流程、异常流程、状态流转 | [04-business-flow.md](./04-business-flow.md) |
| 05 | 页面清单 | 模块划分、页面列表、页面类型说明 | [05-page-list.md](./05-page-list.md) |
| 06 | 页面详情 | 各页面详细设计（子目录） | [06-page-details/](./06-page-details/) |
| 07 | 字段定义 | 全局共享字段、实体字段详情 | [07-fields.md](./07-fields.md) |
| 08 | 权限设计 | RBAC 角色、功能权限、数据权限 | [08-permissions.md](./08-permissions.md) |
| 09 | 用户故事 | 用户故事列表、故事地图 | [09-user-stories.md](./09-user-stories.md) |
| 10 | 成功指标 | 指标定义、测量计划、A/B 测试、成功标准 | [10-success-metrics.md](./10-success-metrics.md) |
| 11 | 时间线 | 关键里程碑、路线图、发布计划 | [11-timeline.md](./11-timeline.md) |
| 12 | 风险与假设 | 假设清单、风险矩阵、待验证项 | [12-risk-assumptions.md](./12-risk-assumptions.md) |
| 13 | 待确认问题 | 开放问题追踪、确认记录 | [13-open-questions.md](./13-open-questions.md) |

---

## 关联文档

| 文档类型 | 名称 | 链接 |
|----------|------|------|
| 技术规格文档 | spec/ 目录 | [../spec/](../spec/) |
| 测试验收文档 | test/ 目录 | [../test/](../test/) |
| 交付评审文档 | handoff/ 目录 | [../handoff/](../handoff/) |
| 需求模型 | requirement-model.yaml | [.demora/requirement-model.yaml](../../.demora/requirement-model.yaml) |

---

## 项目结构概要

| 维度 | 内容 |
|------|------|
| 产品名称 | 专利资产全生命周期数字化价值运营管理平台 |
| 产品描述 | 将专利从授权登记、年费监控、AI 四维估值、组合战略、产业撮合到质押/转让退出的全过程纳入统一数字底稿，让专利资产可量化、可预警、可交易、可尽调。 |
| 所属领域 | IPAM |
| 实体数量 | 5 个 |
| 角色数量 | 4 个 |
| 页面数量 | 6 个 |

### 实体清单

| ID | 名称 | 字段数 | 状态数 |
|------|------|--------|--------|
| PatentAsset | 专利资产 | 14 | 3 |
| ValuationRecord | 估值记录 | 12 | 2 |
| AnnualFeeRecord | 年费记录 | 6 | 4 |
| PledgeTransferRecord | 质押转让记录 | 7 | 5 |
| MatchDeal | 撮合意向 | 8 | 5 |

### 角色清单

| ID | 名称 | 权限数 |
|------|------|--------|
| ipr | 企业IPR（A级） | 5 |
| asset-manager | 资产经理（B级） | 5 |
| bank-risk | 银行风控（B级） | 3 |
| executive | 高管（C级） | 5 |

### 页面清单

| ID | 页面名称 | 类型 | 关联实体 | 路由 |
|------|---------|------|---------|------|
| P01 | executive-dashboard | 仪表盘页 | PatentAsset | /dashboard |
| P02 | patent-ledger | CRUD 列表页 | PatentAsset | /patents |
| P03 | valuation-center | CRUD 列表页 | ValuationRecord | /valuations |
| P04 | portfolio-strategy | 详情页 | PatentAsset | /portfolio |
| P05 | match-channel | CRUD 列表页 | MatchDeal | /matches |
| P06 | pledge-transfer | CRUD 列表页 | PledgeTransferRecord | /pledges |


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-08-28T16:41:57.813Z）
