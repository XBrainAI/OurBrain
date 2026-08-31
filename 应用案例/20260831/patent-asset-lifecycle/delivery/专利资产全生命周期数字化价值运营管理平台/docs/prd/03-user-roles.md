# 03 - 用户角色

> 本文档定义系统中的用户角色、权限概要与角色详细说明。

---

## 角色定义

| ID | 名称 | 职责 | 场景 |
|----|------|------|------|
| enterprise_ipr | 企业IPR专员 | 负责企业IPR专员相关业务 | 专利资产管理 |
| asset_manager | 资产经理 | 负责资产经理相关业务 | 估值记录管理 |
| bank_risk | 银行风控 | 负责银行风控相关业务 | 年费记录管理 |
| c_level_exec | C级高管 | 负责C级高管相关业务 | 质押登记管理 |

---

## 角色权限概要

| 角色 | 查看 | 新增 | 编辑 | 删除 | 审批 | 导出 |
|------|------|------|------|------|------|------|
| 企业IPR专员 | Y | Y | Y | - | - | - |
| 资产经理 | Y | Y | Y | - | Y | Y |
| 银行风控 | Y | - | - | - | - | - |
| C级高管 | Y | - | - | - | - | - |

> 详细权限矩阵请参见 [08-permissions.md](./08-permissions.md)。

---

## 角色详细说明

### 角色 enterprise_ipr：企业IPR专员

| 维度 | 描述 |
|------|------|
| 核心职责 | 负责企业IPR专员相关业务的管理与执行 |
| 使用频率 | 每日中频（3-5 次/天） |
| 典型操作路径 | patent-ledger -> patent-detail -> valuation |
| 数据权限 | 全部数据 |
| 关联权限 | Patent:create,read,update,batch、AnnualFee:read,update、Valuation:read,create |

### 角色 asset_manager：资产经理

| 维度 | 描述 |
|------|------|
| 核心职责 | 负责资产经理相关业务的管理与执行 |
| 使用频率 | 每日中频（3-5 次/天） |
| 典型操作路径 | patent-ledger -> patent-detail -> valuation |
| 数据权限 | 全部数据 |
| 关联权限 | Patent:read,update、Valuation:read,create,update,export、Portfolio:create,read,update,export、TransferRequest:read,create,update |

### 角色 bank_risk：银行风控

| 维度 | 描述 |
|------|------|
| 核心职责 | 负责银行风控相关业务的管理与执行 |
| 使用频率 | 每日中频（3-5 次/天） |
| 典型操作路径 | patent-ledger -> patent-detail -> valuation |
| 数据权限 | 全部数据 |
| 关联权限 | Patent:read、Pledge:read、Valuation:read |

### 角色 c_level_exec：C级高管

| 维度 | 描述 |
|------|------|
| 核心职责 | 负责C级高管相关业务的管理与执行 |
| 使用频率 | 每日中频（3-5 次/天） |
| 典型操作路径 | patent-ledger -> patent-detail -> valuation |
| 数据权限 | 全部数据 |
| 关联权限 | Patent:read、Portfolio:read、Valuation:read |

---

> 完整的 RBAC 权限设计请参见 [08-permissions.md](./08-permissions.md)。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-08-30T00:54:23.700Z）
