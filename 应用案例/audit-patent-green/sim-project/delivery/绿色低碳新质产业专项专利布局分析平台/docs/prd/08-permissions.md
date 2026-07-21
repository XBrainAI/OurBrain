# 08 - 权限设计

> 本文档定义 RBAC 角色权限体系，包括功能权限、数据权限、页面可见性及页面操作权限。

---

## 角色列表

| 角色 ID | 角色名称 | 描述 |
|---------|----------|------|
| ipr | 企业IPR | 负责企业IPR相关业务 |
| green-researcher | 绿色技术研究员 | 负责绿色技术研究员相关业务 |
| layout-planner | 布局规划师 | 负责布局规划师相关业务 |

---

## 功能权限矩阵

> 权限标识：R = 可读 (Read)，W = 可写 (Write)，N = 无权限 (None)

| 功能模块 | 企业IPR | 绿色技术研究员 | 布局规划师 |
|----------|------|------|------|
| 绿色专利管理 | R/W | R/W | R/W |

---

## 数据权限矩阵

| 角色 | 数据范围 | 说明 |
|------|----------|------|
| ipr - 企业IPR | 全部数据 (all) | 可查看/管理所有数据 |
| green-researcher - 绿色技术研究员 | 全部数据 (all) | 可查看/管理所有数据 |
| layout-planner - 布局规划师 | 全部数据 (all) | 可查看/管理所有数据 |

---

## 页面可见性矩阵

| 页面 | 企业IPR | 绿色技术研究员 | 布局规划师 |
|------|------|------|------|
| P01 green-patent-list | Y | Y | Y |
| P02 green-patent-detail | Y | Y | Y |
| P03 green-patent-layout | Y | Y | Y |

---

## 页面操作权限详情

| 页面 | 操作 | 企业IPR | 绿色技术研究员 | 布局规划师 |
|------|------|------|------|------|
| green-patent-list | 新增 | Y | - | - |
| green-patent-list | 编辑 | Y | Y | Y |
| green-patent-list | 删除 | Y | - | - |
| green-patent-list | 导出 | Y | - | Y |
| green-patent-list | 审批 | Y | Y | Y |
| green-patent-detail | 新增 | Y | - | - |
| green-patent-detail | 编辑 | Y | Y | Y |
| green-patent-detail | 删除 | Y | - | - |
| green-patent-detail | 导出 | Y | - | Y |
| green-patent-detail | 审批 | Y | Y | Y |
| green-patent-layout | 新增 | Y | - | - |
| green-patent-layout | 编辑 | Y | Y | Y |
| green-patent-layout | 删除 | Y | - | - |
| green-patent-layout | 导出 | Y | - | Y |
| green-patent-layout | 审批 | Y | Y | Y |

---

> 权限基线配置请参见 `permission-baseline.yaml`（由角色权限自动推导）。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-07-21T09:57:34.109Z）
