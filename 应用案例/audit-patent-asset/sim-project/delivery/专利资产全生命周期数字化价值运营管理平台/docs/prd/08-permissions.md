# 08 - 权限设计

> 本文档定义 RBAC 角色权限体系，包括功能权限、数据权限、页面可见性及页面操作权限。

---

## 角色列表

| 角色 ID | 角色名称 | 描述 |
|---------|----------|------|
| ipr | 企业IPR | 负责企业IPR相关业务 |
| asset-manager | 资产经理 | 负责资产经理相关业务 |
| bank-risk | 银行风控 | 负责银行风控相关业务 |

---

## 功能权限矩阵

> 权限标识：R = 可读 (Read)，W = 可写 (Write)，N = 无权限 (None)

| 功能模块 | 企业IPR | 资产经理 | 银行风控 |
|----------|------|------|------|
| 专利资产管理 | R/W | R/W | R |

---

## 数据权限矩阵

| 角色 | 数据范围 | 说明 |
|------|----------|------|
| ipr - 企业IPR | 全部数据 (all) | 可查看/管理所有数据 |
| asset-manager - 资产经理 | 全部数据 (all) | 可查看/管理所有数据 |
| bank-risk - 银行风控 | 全部数据 (all) | 可查看/管理所有数据 |

---

## 页面可见性矩阵

| 页面 | 企业IPR | 资产经理 | 银行风控 |
|------|------|------|------|
| P01 patent-asset-list | Y | Y | Y |
| P02 patent-asset-detail | Y | Y | Y |
| P03 patent-asset-evaluate | Y | Y | Y |
| P04 asset-dashboard | Y | Y | Y |

---

## 页面操作权限详情

| 页面 | 操作 | 企业IPR | 资产经理 | 银行风控 |
|------|------|------|------|------|
| patent-asset-list | 新增 | Y | - | - |
| patent-asset-list | 编辑 | Y | Y | - |
| patent-asset-list | 删除 | Y | - | - |
| patent-asset-list | 导出 | Y | Y | - |
| patent-asset-list | 审批 | Y | Y | - |
| patent-asset-detail | 新增 | Y | - | - |
| patent-asset-detail | 编辑 | Y | Y | - |
| patent-asset-detail | 删除 | Y | - | - |
| patent-asset-detail | 导出 | Y | Y | - |
| patent-asset-detail | 审批 | Y | Y | - |
| patent-asset-evaluate | 新增 | Y | - | - |
| patent-asset-evaluate | 编辑 | Y | Y | - |
| patent-asset-evaluate | 删除 | Y | - | - |
| patent-asset-evaluate | 导出 | Y | Y | - |
| patent-asset-evaluate | 审批 | Y | Y | - |
| asset-dashboard | 新增 | Y | - | - |
| asset-dashboard | 编辑 | Y | Y | - |
| asset-dashboard | 删除 | Y | - | - |
| asset-dashboard | 导出 | Y | Y | - |
| asset-dashboard | 审批 | Y | Y | - |

---

> 权限基线配置请参见 `permission-baseline.yaml`（由角色权限自动推导）。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-07-21T10:12:23.193Z）
