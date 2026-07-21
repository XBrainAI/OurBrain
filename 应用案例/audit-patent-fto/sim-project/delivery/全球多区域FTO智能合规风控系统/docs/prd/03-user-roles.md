# 03 - 用户角色

> 本文档定义系统中的用户角色、权限概要与角色详细说明。

---

## 角色定义

| ID | 名称 | 职责 | 场景 |
|----|------|------|------|
| ipr | 企业IPR | 负责企业IPR相关业务 | FTO分析管理 |
| fto-analyst | FTO分析师 | 负责FTO分析师相关业务 | 日常业务操作 |
| export-manager | 外贸经理 | 负责外贸经理相关业务 | 日常业务操作 |

---

## 角色权限概要

| 角色 | 查看 | 新增 | 编辑 | 删除 | 审批 | 导出 |
|------|------|------|------|------|------|------|
| 企业IPR | Y | Y | Y | Y | - | Y |
| FTO分析师 | Y | - | Y | - | - | Y |
| 外贸经理 | Y | - | - | - | - | - |

> 详细权限矩阵请参见 [08-permissions.md](./08-permissions.md)。

---

## 角色详细说明

### 角色 ipr：企业IPR

| 维度 | 描述 |
|------|------|
| 核心职责 | 负责企业IPR相关业务的管理与执行 |
| 使用频率 | 每日中频（3-5 次/天） |
| 典型操作路径 | fto-analysis-list -> fto-analysis-detail -> fto-analysis-form |
| 数据权限 | 全部数据 |
| 关联权限 | fto-analysis:create,read,update,delete,export |

### 角色 fto-analyst：FTO分析师

| 维度 | 描述 |
|------|------|
| 核心职责 | 负责FTO分析师相关业务的管理与执行 |
| 使用频率 | 每日中频（3-5 次/天） |
| 典型操作路径 | fto-analysis-list -> fto-analysis-detail -> fto-analysis-form |
| 数据权限 | 全部数据 |
| 关联权限 | fto-analysis:read,update,export |

### 角色 export-manager：外贸经理

| 维度 | 描述 |
|------|------|
| 核心职责 | 负责外贸经理相关业务的管理与执行 |
| 使用频率 | 每日中频（3-5 次/天） |
| 典型操作路径 | fto-analysis-list -> fto-analysis-detail -> fto-analysis-form |
| 数据权限 | 全部数据 |
| 关联权限 | fto-analysis:read |

---

> 完整的 RBAC 权限设计请参见 [08-permissions.md](./08-permissions.md)。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-07-21T09:56:45.674Z）
