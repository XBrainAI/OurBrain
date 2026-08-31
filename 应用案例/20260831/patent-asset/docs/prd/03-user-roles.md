# 03 - 用户角色

> 本文档定义系统中的用户角色、权限概要与角色详细说明。

---

## 角色定义

| ID | 名称 | 职责 | 场景 |
|----|------|------|------|
| ipr | 企业IPR（A级） | 负责企业IPR（A级）相关业务 | 专利资产管理 |
| asset-manager | 资产经理（B级） | 负责资产经理（B级）相关业务 | 估值记录管理 |
| bank-risk | 银行风控（B级） | 负责银行风控（B级）相关业务 | 年费记录管理 |
| executive | 高管（C级） | 负责高管（C级）相关业务 | 质押转让记录管理 |

---

## 角色权限概要

| 角色 | 查看 | 新增 | 编辑 | 删除 | 审批 | 导出 |
|------|------|------|------|------|------|------|
| 企业IPR（A级） | - | - | - | - | - | - |
| 资产经理（B级） | - | - | - | - | - | - |
| 银行风控（B级） | - | - | - | - | - | - |
| 高管（C级） | - | - | - | - | - | - |

> 详细权限矩阵请参见 [08-permissions.md](./08-permissions.md)。

---

## 角色详细说明

### 角色 ipr：企业IPR（A级）

| 维度 | 描述 |
|------|------|
| 核心职责 | 负责企业IPR（A级）相关业务的管理与执行 |
| 使用频率 | 每日中频（3-5 次/天） |
| 典型操作路径 | executive-dashboard -> patent-ledger -> valuation-center |
| 数据权限 | 全部数据 |
| 关联权限 | PatentAsset、AnnualFeeRecord、ValuationRecord、PledgeTransferRecord、MatchDeal |

### 角色 asset-manager：资产经理（B级）

| 维度 | 描述 |
|------|------|
| 核心职责 | 负责资产经理（B级）相关业务的管理与执行 |
| 使用频率 | 每日中频（3-5 次/天） |
| 典型操作路径 | executive-dashboard -> patent-ledger -> valuation-center |
| 数据权限 | 全部数据 |
| 关联权限 | PatentAsset、ValuationRecord、MatchDeal、PledgeTransferRecord、AnnualFeeRecord |

### 角色 bank-risk：银行风控（B级）

| 维度 | 描述 |
|------|------|
| 核心职责 | 负责银行风控（B级）相关业务的管理与执行 |
| 使用频率 | 每日中频（3-5 次/天） |
| 典型操作路径 | executive-dashboard -> patent-ledger -> valuation-center |
| 数据权限 | 全部数据 |
| 关联权限 | PatentAsset、ValuationRecord、PledgeTransferRecord |

### 角色 executive：高管（C级）

| 维度 | 描述 |
|------|------|
| 核心职责 | 负责高管（C级）相关业务的管理与执行 |
| 使用频率 | 每日中频（3-5 次/天） |
| 典型操作路径 | executive-dashboard -> patent-ledger -> valuation-center |
| 数据权限 | 全部数据 |
| 关联权限 | PatentAsset、ValuationRecord、MatchDeal、PledgeTransferRecord、AnnualFeeRecord |

---

> 完整的 RBAC 权限设计请参见 [08-permissions.md](./08-permissions.md)。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-08-28T16:41:57.818Z）
