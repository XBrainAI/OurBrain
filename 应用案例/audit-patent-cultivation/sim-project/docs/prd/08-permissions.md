# 08 - 权限设计

> 本文档定义 RBAC 角色权限体系，包括功能权限、数据权限、页面可见性及页面操作权限。

---

## 角色列表

| 角色 ID | 角色名称 | 描述 |
|---------|----------|------|
| ipr | 企业IPR | 负责企业IPR相关业务 |
| agent | 代理师 | 负责代理师相关业务 |
| engineer | 研发工程师 | 负责研发工程师相关业务 |

---

## 功能权限矩阵

> 权限标识：R = 可读 (Read)，W = 可写 (Write)，N = 无权限 (None)

| 功能模块 | 企业IPR | 代理师 | 研发工程师 |
|----------|------|------|------|
| 专利创意管理 | R/W | R/W | R/W |

---

## 数据权限矩阵

| 角色 | 数据范围 | 说明 |
|------|----------|------|
| ipr - 企业IPR | 全部数据 (all) | 可查看/管理所有数据 |
| agent - 代理师 | 全部数据 (all) | 可查看/管理所有数据 |
| engineer - 研发工程师 | 全部数据 (all) | 可查看/管理所有数据 |

---

## 页面可见性矩阵

| 页面 | 企业IPR | 代理师 | 研发工程师 |
|------|------|------|------|
| P01 patent-idea-list | Y | Y | Y |
| P02 patent-idea-detail | Y | Y | Y |
| P03 patent-idea-form | Y | Y | Y |

---

## 页面操作权限详情

| 页面 | 操作 | 企业IPR | 代理师 | 研发工程师 |
|------|------|------|------|------|
| patent-idea-list | 新增 | Y | - | Y |
| patent-idea-list | 编辑 | Y | Y | - |
| patent-idea-list | 删除 | Y | - | - |
| patent-idea-list | 导出 | Y | Y | - |
| patent-idea-list | 审批 | Y | Y | - |
| patent-idea-detail | 新增 | Y | - | Y |
| patent-idea-detail | 编辑 | Y | Y | - |
| patent-idea-detail | 删除 | Y | - | - |
| patent-idea-detail | 导出 | Y | Y | - |
| patent-idea-detail | 审批 | Y | Y | - |
| patent-idea-form | 新增 | Y | - | Y |
| patent-idea-form | 编辑 | Y | Y | - |
| patent-idea-form | 删除 | Y | - | - |
| patent-idea-form | 导出 | Y | Y | - |
| patent-idea-form | 审批 | Y | Y | - |

---

> 权限基线配置请参见 `permission-baseline.yaml`（由角色权限自动推导）。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-07-21T09:56:38.092Z）
