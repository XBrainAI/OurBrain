# 08 - 权限设计

> 本文档定义 RBAC 角色权限体系，包括功能权限、数据权限、页面可见性及页面操作权限。

---

## 角色列表

| 角色 ID | 角色名称 | 描述 |
|---------|----------|------|
| agent | 代理师 | 负责代理师相关业务 |
| precheck-reviewer | 预审员 | 负责预审员相关业务 |
| ipr | 企业IPR | 负责企业IPR相关业务 |

---

## 功能权限矩阵

> 权限标识：R = 可读 (Read)，W = 可写 (Write)，N = 无权限 (None)

| 功能模块 | 代理师 | 预审员 | 企业IPR |
|----------|------|------|------|
| 预审案件管理 | R/W | R/W | R |

---

## 数据权限矩阵

| 角色 | 数据范围 | 说明 |
|------|----------|------|
| agent - 代理师 | 全部数据 (all) | 可查看/管理所有数据 |
| precheck-reviewer - 预审员 | 全部数据 (all) | 可查看/管理所有数据 |
| ipr - 企业IPR | 全部数据 (all) | 可查看/管理所有数据 |

---

## 页面可见性矩阵

| 页面 | 代理师 | 预审员 | 企业IPR |
|------|------|------|------|
| P01 precheck-case-list | Y | Y | Y |
| P02 precheck-case-detail | Y | Y | Y |
| P03 precheck-case-submit | Y | Y | Y |

---

## 页面操作权限详情

| 页面 | 操作 | 代理师 | 预审员 | 企业IPR |
|------|------|------|------|------|
| precheck-case-list | 新增 | Y | - | - |
| precheck-case-list | 编辑 | Y | Y | - |
| precheck-case-list | 删除 | Y | - | - |
| precheck-case-list | 导出 | - | - | - |
| precheck-case-list | 审批 | Y | Y | - |
| precheck-case-detail | 新增 | Y | - | - |
| precheck-case-detail | 编辑 | Y | Y | - |
| precheck-case-detail | 删除 | Y | - | - |
| precheck-case-detail | 导出 | - | - | - |
| precheck-case-detail | 审批 | Y | Y | - |
| precheck-case-submit | 新增 | Y | - | - |
| precheck-case-submit | 编辑 | Y | Y | - |
| precheck-case-submit | 删除 | Y | - | - |
| precheck-case-submit | 导出 | - | - | - |
| precheck-case-submit | 审批 | Y | Y | - |

---

> 权限基线配置请参见 `permission-baseline.yaml`（由角色权限自动推导）。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-07-21T09:57:00.862Z）
