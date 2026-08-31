# 08 - 权限设计

> 本文档定义 RBAC 角色权限体系，包括功能权限、数据权限、页面可见性及页面操作权限。

---

## 角色列表

| 角色 ID | 角色名称 | 描述 |
|---------|----------|------|
| enterprise_ipr | 企业IPR专员 | 负责企业IPR专员相关业务 |
| asset_manager | 资产经理 | 负责资产经理相关业务 |
| bank_risk | 银行风控 | 负责银行风控相关业务 |
| c_level_exec | C级高管 | 负责C级高管相关业务 |

---

## 功能权限矩阵

> 权限标识：R = 可读 (Read)，W = 可写 (Write)，N = 无权限 (None)

| 功能模块 | 企业IPR专员 | 资产经理 | 银行风控 | C级高管 |
|----------|------|------|------|------|
| 专利资产管理 | R/W | R/W | R | R |
| 估值记录管理 | R/W | R/W | R | R |
| 年费记录管理 | R/W | N | N | N |
| 质押登记管理 | N | N | R | N |
| 转让请求管理 | N | R/W | N | N |
| 专利组合管理 | N | R/W | N | R |
| 撮合需求管理 | N | N | N | N |

---

## 数据权限矩阵

| 角色 | 数据范围 | 说明 |
|------|----------|------|
| enterprise_ipr - 企业IPR专员 | 全部数据 (all) | 可查看/管理所有数据 |
| asset_manager - 资产经理 | 全部数据 (all) | 可查看/管理所有数据 |
| bank_risk - 银行风控 | 全部数据 (all) | 可查看/管理所有数据 |
| c_level_exec - C级高管 | 全部数据 (all) | 可查看/管理所有数据 |

---

## 页面可见性矩阵

| 页面 | 企业IPR专员 | 资产经理 | 银行风控 | C级高管 |
|------|------|------|------|------|
| P01 patent-ledger | Y | Y | Y | Y |
| P02 patent-detail | Y | Y | Y | Y |
| P03 valuation | Y | Y | Y | Y |
| P04 fee-monitor | Y | - | - | - |
| P05 pledge-transfer | - | - | Y | - |
| P06 portfolio | - | Y | - | Y |
| P07 match | - | - | - | - |
| P08 executive-cockpit | Y | Y | Y | Y |

---

## 页面操作权限详情

| 页面 | 操作 | 企业IPR专员 | 资产经理 | 银行风控 | C级高管 |
|------|------|------|------|------|------|
| patent-ledger | 新增 | Y | - | - | - |
| patent-ledger | 编辑 | Y | Y | - | - |
| patent-ledger | 删除 | - | - | - | - |
| patent-ledger | 导出 | - | - | - | - |
| patent-ledger | 审批 | Y | Y | - | - |
| patent-detail | 新增 | Y | - | - | - |
| patent-detail | 编辑 | Y | Y | - | - |
| patent-detail | 删除 | - | - | - | - |
| patent-detail | 导出 | - | - | - | - |
| patent-detail | 审批 | Y | Y | - | - |
| valuation | 新增 | Y | Y | - | - |
| valuation | 编辑 | - | Y | - | - |
| valuation | 删除 | - | - | - | - |
| valuation | 导出 | - | Y | - | - |
| valuation | 审批 | - | Y | - | - |
| fee-monitor | 新增 | - | - | - | - |
| fee-monitor | 编辑 | Y | - | - | - |
| fee-monitor | 删除 | - | - | - | - |
| fee-monitor | 导出 | - | - | - | - |
| fee-monitor | 审批 | Y | - | - | - |
| pledge-transfer | 新增 | - | - | - | - |
| pledge-transfer | 编辑 | - | - | - | - |
| pledge-transfer | 删除 | - | - | - | - |
| pledge-transfer | 导出 | - | - | - | - |
| pledge-transfer | 审批 | - | - | - | - |

---

> 权限基线配置请参见 `permission-baseline.yaml`（由角色权限自动推导）。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-08-30T00:54:23.721Z）
