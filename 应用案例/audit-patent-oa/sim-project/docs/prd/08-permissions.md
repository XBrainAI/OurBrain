# 08 - 权限设计

> 本文档定义 RBAC 角色权限体系，包括功能权限、数据权限、页面可见性及页面操作权限。

---

## 角色列表

| 角色 ID | 角色名称 | 描述 |
|---------|----------|------|
| agent | 代理师 | 负责代理师相关业务 |
| ipr | 企业IPR | 负责企业IPR相关业务 |
| examiner | 审查员 | 负责审查员相关业务 |

---

## 功能权限矩阵

> 权限标识：R = 可读 (Read)，W = 可写 (Write)，N = 无权限 (None)

| 功能模块 | 代理师 | 企业IPR | 审查员 |
|----------|------|------|------|
| OA答复管理 | R/W | R/W | R |

---

## 数据权限矩阵

| 角色 | 数据范围 | 说明 |
|------|----------|------|
| agent - 代理师 | 全部数据 (all) | 可查看/管理所有数据 |
| ipr - 企业IPR | 全部数据 (all) | 可查看/管理所有数据 |
| examiner - 审查员 | 全部数据 (all) | 可查看/管理所有数据 |

---

## 页面可见性矩阵

| 页面 | 代理师 | 企业IPR | 审查员 |
|------|------|------|------|
| P01 oa-response-list | Y | Y | Y |
| P02 oa-response-detail | Y | Y | Y |
| P03 oa-response-form | Y | Y | Y |

---

## 页面操作权限详情

| 页面 | 操作 | 代理师 | 企业IPR | 审查员 |
|------|------|------|------|------|
| oa-response-list | 新增 | Y | - | - |
| oa-response-list | 编辑 | Y | Y | - |
| oa-response-list | 删除 | Y | - | - |
| oa-response-list | 导出 | Y | - | - |
| oa-response-list | 审批 | Y | Y | - |
| oa-response-detail | 新增 | Y | - | - |
| oa-response-detail | 编辑 | Y | Y | - |
| oa-response-detail | 删除 | Y | - | - |
| oa-response-detail | 导出 | Y | - | - |
| oa-response-detail | 审批 | Y | Y | - |
| oa-response-form | 新增 | Y | - | - |
| oa-response-form | 编辑 | Y | Y | - |
| oa-response-form | 删除 | Y | - | - |
| oa-response-form | 导出 | Y | - | - |
| oa-response-form | 审批 | Y | Y | - |

---

> 权限基线配置请参见 `permission-baseline.yaml`（由角色权限自动推导）。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-07-21T10:08:57.975Z）
