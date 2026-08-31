# 08 - 权限设计

> 本文档定义 RBAC 角色权限体系，包括功能权限、数据权限、页面可见性及页面操作权限。

---

## 角色列表

| 角色 ID | 角色名称 | 描述 |
|---------|----------|------|
| ipr | 企业IPR（A级） | 负责企业IPR（A级）相关业务 |
| asset-manager | 资产经理（B级） | 负责资产经理（B级）相关业务 |
| bank-risk | 银行风控（B级） | 负责银行风控（B级）相关业务 |
| executive | 高管（C级） | 负责高管（C级）相关业务 |

---

## 功能权限矩阵

> 权限标识：R = 可读 (Read)，W = 可写 (Write)，N = 无权限 (None)

| 功能模块 | 企业IPR（A级） | 资产经理（B级） | 银行风控（B级） | 高管（C级） |
|----------|------|------|------|------|
| 专利资产管理 | R | R | R | R |
| 估值记录管理 | R | R | R | R |
| 年费记录管理 | R | R | N | R |
| 质押转让记录管理 | R | R | R | R |
| 撮合意向管理 | R | R | N | R |

---

## 数据权限矩阵

| 角色 | 数据范围 | 说明 |
|------|----------|------|
| ipr - 企业IPR（A级） | 全部数据 (all) | 可查看/管理所有数据 |
| asset-manager - 资产经理（B级） | 全部数据 (all) | 可查看/管理所有数据 |
| bank-risk - 银行风控（B级） | 全部数据 (all) | 可查看/管理所有数据 |
| executive - 高管（C级） | 全部数据 (all) | 可查看/管理所有数据 |

---

## 页面可见性矩阵

| 页面 | 企业IPR（A级） | 资产经理（B级） | 银行风控（B级） | 高管（C级） |
|------|------|------|------|------|
| P01 executive-dashboard | Y | Y | Y | Y |
| P02 patent-ledger | Y | Y | Y | Y |
| P03 valuation-center | Y | Y | Y | Y |
| P04 portfolio-strategy | Y | Y | Y | Y |
| P05 match-channel | Y | Y | - | Y |
| P06 pledge-transfer | Y | Y | Y | Y |

---

## 页面操作权限详情

| 页面 | 操作 | 企业IPR（A级） | 资产经理（B级） | 银行风控（B级） | 高管（C级） |
|------|------|------|------|------|------|
| executive-dashboard | 新增 | - | - | - | - |
| executive-dashboard | 编辑 | - | - | - | - |
| executive-dashboard | 删除 | - | - | - | - |
| executive-dashboard | 导出 | - | - | - | - |
| executive-dashboard | 审批 | - | - | - | - |
| patent-ledger | 新增 | - | - | - | - |
| patent-ledger | 编辑 | - | - | - | - |
| patent-ledger | 删除 | - | - | - | - |
| patent-ledger | 导出 | - | - | - | - |
| patent-ledger | 审批 | - | - | - | - |
| valuation-center | 新增 | - | - | - | - |
| valuation-center | 编辑 | - | - | - | - |
| valuation-center | 删除 | - | - | - | - |
| valuation-center | 导出 | - | - | - | - |
| valuation-center | 审批 | - | - | - | - |
| portfolio-strategy | 新增 | - | - | - | - |
| portfolio-strategy | 编辑 | - | - | - | - |
| portfolio-strategy | 删除 | - | - | - | - |
| portfolio-strategy | 导出 | - | - | - | - |
| portfolio-strategy | 审批 | - | - | - | - |
| match-channel | 新增 | - | - | - | - |
| match-channel | 编辑 | - | - | - | - |
| match-channel | 删除 | - | - | - | - |
| match-channel | 导出 | - | - | - | - |
| match-channel | 审批 | - | - | - | - |

---

> 权限基线配置请参见 `permission-baseline.yaml`（由角色权限自动推导）。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-08-28T16:41:57.829Z）
