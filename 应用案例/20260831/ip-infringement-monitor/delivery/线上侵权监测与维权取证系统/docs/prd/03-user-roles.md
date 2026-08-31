# 03 - 用户角色

> 本文档定义系统中的用户角色、权限概要与角色详细说明。

---

## 角色定义

| ID | 名称 | 职责 | 场景 |
|----|------|------|------|
| brand_ipr | 品牌方IPR | 负责品牌方IPR相关业务 | 侵权线索管理 |
| rights_lawyer | 维权律师 | 负责维权律师相关业务 | 存证记录管理 |
| monitoring_analyst | 监测分析师 | 负责监测分析师相关业务 | 维权案件管理 |

---

## 角色权限概要

| 角色 | 查看 | 新增 | 编辑 | 删除 | 审批 | 导出 |
|------|------|------|------|------|------|------|
| 品牌方IPR | Y | Y | Y | - | - | Y |
| 维权律师 | Y | - | Y | - | - | Y |
| 监测分析师 | Y | Y | Y | - | - | Y |

> 详细权限矩阵请参见 [08-permissions.md](./08-permissions.md)。

---

## 角色详细说明

### 角色 brand_ipr：品牌方IPR

| 维度 | 描述 |
|------|------|
| 核心职责 | 负责品牌方IPR相关业务的管理与执行 |
| 使用频率 | 每日中频（3-5 次/天） |
| 典型操作路径 | monitor-dashboard -> infringement-leads -> evidence-detail |
| 数据权限 | 全部数据 |
| 关联权限 | InfringementLead:create,read,update,export、EvidenceRecord:read,export、RightsCase:create,read,update,export,batch、CrossBorderRule:create,read,update |

### 角色 rights_lawyer：维权律师

| 维度 | 描述 |
|------|------|
| 核心职责 | 负责维权律师相关业务的管理与执行 |
| 使用频率 | 每日中频（3-5 次/天） |
| 典型操作路径 | monitor-dashboard -> infringement-leads -> evidence-detail |
| 数据权限 | 全部数据 |
| 关联权限 | InfringementLead:read,export、EvidenceRecord:read,export、RightsCase:read,update,export,custom、CrossBorderRule:read,update |

### 角色 monitoring_analyst：监测分析师

| 维度 | 描述 |
|------|------|
| 核心职责 | 负责监测分析师相关业务的管理与执行 |
| 使用频率 | 每日中频（3-5 次/天） |
| 典型操作路径 | monitor-dashboard -> infringement-leads -> evidence-detail |
| 数据权限 | 全部数据 |
| 关联权限 | InfringementLead:create,read,update,batch,export、EvidenceRecord:create,read,update,export、RightsCase:read、CrossBorderRule:read |

---

> 完整的 RBAC 权限设计请参见 [08-permissions.md](./08-permissions.md)。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-08-29T15:52:06.963Z）
