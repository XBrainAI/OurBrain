# 00 - PRD 总览与索引

> 本文档是产品需求文档 (PRD) 的主索引，汇总项目基本信息与文档结构。

---

## TL;DR（一页纸摘要）

> 3-5 行项目摘要，让 PM/研发/测试在 30 秒内理解项目本质。

- **项目定位**：算法专利解析、权属判定与 FTO 比对平台
- **核心差异点**：整合 1 大业务实体（AIGC专利），提供全流程数字化管理
- **关键功能**：浏览aigc-patent、查看aigc-patent详情、新增/编辑aigc-patent
- **一句话状态**：规划中，计划 2026-Q4 上线
- **关键数字**：1 实体 / 3 角色 / 3 页面

---

## 项目信息

| 字段 | 内容 |
|------|------|
| 项目名称 | AIGC软件算法类数字专利专项管理平台 |
| 产品愿景 | 算法专利解析、权属判定与 FTO 比对平台 |
| 所属领域 | PATENT |
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
| 产品名称 | AIGC软件算法类数字专利专项管理平台 |
| 产品描述 | 算法专利解析、权属判定与 FTO 比对平台 |
| 所属领域 | PATENT |
| 实体数量 | 1 个 |
| 角色数量 | 3 个 |
| 页面数量 | 3 个 |

### 实体清单

| ID | 名称 | 字段数 | 状态数 |
|------|------|--------|--------|
| aigc-patent | AIGC专利 | 7 | 5 |

### 角色清单

| ID | 名称 | 权限数 |
|------|------|--------|
| ai-engineer | AI工程师 | 1 |
| ipr | 企业IPR | 1 |
| agent | 代理师 | 1 |

### 页面清单

| ID | 页面名称 | 类型 | 关联实体 | 路由 |
|------|---------|------|---------|------|
| P01 | aigc-patent-list | CRUD 列表页 | aigc-patent | /aigc-patents |
| P02 | aigc-patent-detail | 详情页 | aigc-patent | /aigc-patents/:id |
| P03 | aigc-patent-upload | 表单页 | aigc-patent | /aigc-patents/form |


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-07-21T10:20:38.214Z）
