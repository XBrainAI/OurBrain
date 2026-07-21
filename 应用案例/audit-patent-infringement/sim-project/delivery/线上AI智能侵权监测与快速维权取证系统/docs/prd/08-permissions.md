# 08 - 权限设计

> 本文档定义 RBAC 角色权限体系，包括功能权限、数据权限、页面可见性及页面操作权限。

---

## 角色列表

| 角色 ID | 角色名称 | 描述 |
|---------|----------|------|
| brand-ipr | 品牌方IPR | 负责品牌方IPR相关业务 |
| lawyer | 维权律师 | 负责维权律师相关业务 |
| monitor-analyst | 监测分析师 | 负责监测分析师相关业务 |

---

## 功能权限矩阵

> 权限标识：R = 可读 (Read)，W = 可写 (Write)，N = 无权限 (None)

| 功能模块 | 品牌方IPR | 维权律师 | 监测分析师 |
|----------|------|------|------|
| 侵权案件管理 | R/W | R/W | R/W |

---

## 数据权限矩阵

| 角色 | 数据范围 | 说明 |
|------|----------|------|
| brand-ipr - 品牌方IPR | 全部数据 (all) | 可查看/管理所有数据 |
| lawyer - 维权律师 | 全部数据 (all) | 可查看/管理所有数据 |
| monitor-analyst - 监测分析师 | 全部数据 (all) | 可查看/管理所有数据 |

---

## 页面可见性矩阵

| 页面 | 品牌方IPR | 维权律师 | 监测分析师 |
|------|------|------|------|
| P01 infringement-case-list | Y | Y | Y |
| P02 infringement-case-detail | Y | Y | Y |
| P03 infringement-monitor-form | Y | Y | Y |

---

## 页面操作权限详情

| 页面 | 操作 | 品牌方IPR | 维权律师 | 监测分析师 |
|------|------|------|------|------|
| infringement-case-list | 新增 | Y | - | - |
| infringement-case-list | 编辑 | Y | Y | Y |
| infringement-case-list | 删除 | Y | - | - |
| infringement-case-list | 导出 | Y | Y | - |
| infringement-case-list | 审批 | Y | Y | Y |
| infringement-case-detail | 新增 | Y | - | - |
| infringement-case-detail | 编辑 | Y | Y | Y |
| infringement-case-detail | 删除 | Y | - | - |
| infringement-case-detail | 导出 | Y | Y | - |
| infringement-case-detail | 审批 | Y | Y | Y |
| infringement-monitor-form | 新增 | Y | - | - |
| infringement-monitor-form | 编辑 | Y | Y | Y |
| infringement-monitor-form | 删除 | Y | - | - |
| infringement-monitor-form | 导出 | Y | Y | - |
| infringement-monitor-form | 审批 | Y | Y | Y |

---

> 权限基线配置请参见 `permission-baseline.yaml`（由角色权限自动推导）。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-07-21T10:19:16.117Z）
