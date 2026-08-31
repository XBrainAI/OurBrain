# 00 - PRD 总览与索引

> 本文档是产品需求文档 (PRD) 的主索引，汇总项目基本信息与文档结构。

---

## TL;DR（一页纸摘要）

> 3-5 行项目摘要，让 PM/研发/测试在 30 秒内理解项目本质。

- **项目定位**：面向品牌方面向电商/1688/跨境/短视频/展会渠道的 AI 侵权监测、区块链存证取证与分级维权处置一体化平台
- **核心差异点**：整合 4 大业务实体（侵权线索、存证记录、维权案件、跨境规则模板），提供全流程数字化管理
- **关键功能**：查看看板、浏览InfringementLead、查看EvidenceRecord详情
- **一句话状态**：规划中，计划 2026-Q4 上线
- **关键数字**：4 实体 / 3 角色 / 6 页面

---

## 项目信息

| 字段 | 内容 |
|------|------|
| 项目名称 | 线上侵权监测与维权取证系统 |
| 产品愿景 | 面向品牌方面向电商/1688/跨境/短视频/展会渠道的 AI 侵权监测、区块链存证取证与分级维权处置一体化平台 |
| 所属领域 | IPR |
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
| 产品名称 | 线上侵权监测与维权取证系统 |
| 产品描述 | 面向品牌方面向电商/1688/跨境/短视频/展会渠道的 AI 侵权监测、区块链存证取证与分级维权处置一体化平台 |
| 所属领域 | IPR |
| 实体数量 | 4 个 |
| 角色数量 | 3 个 |
| 页面数量 | 6 个 |

### 实体清单

| ID | 名称 | 字段数 | 状态数 |
|------|------|--------|--------|
| InfringementLead | 侵权线索 | 14 | 5 |
| EvidenceRecord | 存证记录 | 10 | 3 |
| RightsCase | 维权案件 | 15 | 5 |
| CrossBorderRule | 跨境规则模板 | 10 | 2 |

### 角色清单

| ID | 名称 | 权限数 |
|------|------|--------|
| brand_ipr | 品牌方IPR | 4 |
| rights_lawyer | 维权律师 | 4 |
| monitoring_analyst | 监测分析师 | 4 |

### 页面清单

| ID | 页面名称 | 类型 | 关联实体 | 路由 |
|------|---------|------|---------|------|
| P01 | monitor-dashboard | 仪表盘页 | InfringementLead | /dashboard |
| P02 | infringement-leads | CRUD 列表页 | InfringementLead | /leads |
| P03 | evidence-detail | 详情页 | EvidenceRecord | /evidence |
| P04 | rights-cases | CRUD 列表页 | RightsCase | /cases |
| P05 | cross-border-rules | CRUD 列表页 | CrossBorderRule | /rules |
| P06 | rights-analytics | 仪表盘页 | RightsCase | /analytics |


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-08-29T15:52:06.706Z）
