# 08 - 权限设计

> 本文档定义 RBAC 角色权限体系，包括功能权限、数据权限、页面可见性及页面操作权限。

---

## 角色列表

| 角色 ID | 角色名称 | 描述 |
|---------|----------|------|
| financing-manager | 企业融资经理 | 负责企业融资经理相关业务 |
| bank-risk | 银行风控 | 负责银行风控相关业务 |
| assessor | 评估师 | 负责评估师相关业务 |

---

## 功能权限矩阵

> 权限标识：R = 可读 (Read)，W = 可写 (Write)，N = 无权限 (None)

| 功能模块 | 企业融资经理 | 银行风控 | 评估师 |
|----------|------|------|------|
| 质押案件管理 | R/W | R/W | R/W |

---

## 数据权限矩阵

| 角色 | 数据范围 | 说明 |
|------|----------|------|
| financing-manager - 企业融资经理 | 全部数据 (all) | 可查看/管理所有数据 |
| bank-risk - 银行风控 | 全部数据 (all) | 可查看/管理所有数据 |
| assessor - 评估师 | 全部数据 (all) | 可查看/管理所有数据 |

---

## 页面可见性矩阵

| 页面 | 企业融资经理 | 银行风控 | 评估师 |
|------|------|------|------|
| P01 pledge-case-list | Y | Y | Y |
| P02 pledge-case-detail | Y | Y | Y |
| P03 pledge-case-apply | Y | Y | Y |

---

## 页面操作权限详情

| 页面 | 操作 | 企业融资经理 | 银行风控 | 评估师 |
|------|------|------|------|------|
| pledge-case-list | 新增 | Y | - | - |
| pledge-case-list | 编辑 | Y | Y | Y |
| pledge-case-list | 删除 | - | - | - |
| pledge-case-list | 导出 | - | Y | - |
| pledge-case-list | 审批 | Y | Y | Y |
| pledge-case-detail | 新增 | Y | - | - |
| pledge-case-detail | 编辑 | Y | Y | Y |
| pledge-case-detail | 删除 | - | - | - |
| pledge-case-detail | 导出 | - | Y | - |
| pledge-case-detail | 审批 | Y | Y | Y |
| pledge-case-apply | 新增 | Y | - | - |
| pledge-case-apply | 编辑 | Y | Y | Y |
| pledge-case-apply | 删除 | - | - | - |
| pledge-case-apply | 导出 | - | Y | - |
| pledge-case-apply | 审批 | Y | Y | Y |

---

> 权限基线配置请参见 `permission-baseline.yaml`（由角色权限自动推导）。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-07-21T10:18:59.217Z）
