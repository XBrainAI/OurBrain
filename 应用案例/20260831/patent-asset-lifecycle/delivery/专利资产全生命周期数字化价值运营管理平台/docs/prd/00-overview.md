# 00 - PRD 总览与索引

> 本文档是产品需求文档 (PRD) 的主索引，汇总项目基本信息与文档结构。

---

## TL;DR（一页纸摘要）

> 3-5 行项目摘要，让 PM/研发/测试在 30 秒内理解项目本质。

- **项目定位**：面向企业 IPR、资产经理与银行风控的一站式专利资产价值运营平台，覆盖全流程台账、年费监控、AI 四维估值、组合战略分析、质押转让跟踪与产业撮合，以标准化数字底稿支撑融资、上市与质押场景。
- **核心差异点**：整合 7 大业务实体（专利资产、估值记录、年费记录、质押登记），提供全流程数字化管理
- **关键功能**：浏览Patent、查看Patent详情、浏览Valuation
- **一句话状态**：规划中，计划 2026-Q4 上线
- **关键数字**：7 实体 / 4 角色 / 8 页面

---

## 项目信息

| 字段 | 内容 |
|------|------|
| 项目名称 | 专利资产全生命周期数字化价值运营管理平台 |
| 产品愿景 | 面向企业 IPR、资产经理与银行风控的一站式专利资产价值运营平台，覆盖全流程台账、年费监控、AI 四维估值、组合战略分析、质押转让跟踪与产业撮合，以标准化数字底稿支撑融资、上市与质押场景。 |
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
| 产品描述 | 面向企业 IPR、资产经理与银行风控的一站式专利资产价值运营平台，覆盖全流程台账、年费监控、AI 四维估值、组合战略分析、质押转让跟踪与产业撮合，以标准化数字底稿支撑融资、上市与质押场景。 |
| 所属领域 | IPAM |
| 实体数量 | 7 个 |
| 角色数量 | 4 个 |
| 页面数量 | 8 个 |

### 实体清单

| ID | 名称 | 字段数 | 状态数 |
|------|------|--------|--------|
| Patent | 专利资产 | 14 | 7 |
| Valuation | 估值记录 | 13 | 3 |
| AnnualFee | 年费记录 | 8 | 4 |
| Pledge | 质押登记 | 9 | 2 |
| TransferRequest | 转让请求 | 9 | 4 |
| Portfolio | 专利组合 | 7 | 0 |
| MatchDemand | 撮合需求 | 7 | 4 |

### 角色清单

| ID | 名称 | 权限数 |
|------|------|--------|
| enterprise_ipr | 企业IPR专员 | 3 |
| asset_manager | 资产经理 | 4 |
| bank_risk | 银行风控 | 3 |
| c_level_exec | C级高管 | 3 |

### 页面清单

| ID | 页面名称 | 类型 | 关联实体 | 路由 |
|------|---------|------|---------|------|
| P01 | patent-ledger | CRUD 列表页 | Patent | /patents |
| P02 | patent-detail | 详情页 | Patent | /patents/:id |
| P03 | valuation | CRUD 列表页 | Valuation | /valuations |
| P04 | fee-monitor | CRUD 列表页 | AnnualFee | /fees |
| P05 | pledge-transfer | CRUD 列表页 | Pledge | /pledges |
| P06 | portfolio | 仪表盘页 | Portfolio | /portfolio |
| P07 | match | CRUD 列表页 | MatchDemand | /match |
| P08 | executive-cockpit | 仪表盘页 | Patent | /cockpit |


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-08-30T00:54:23.691Z）
