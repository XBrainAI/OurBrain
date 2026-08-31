# 08 - 权限设计

> 本文档定义 RBAC 角色权限体系，包括功能权限、数据权限、页面可见性及页面操作权限。

---

## 角色列表

| 角色 ID | 角色名称 | 描述 |
|---------|----------|------|
| brand_ipr | 品牌方IPR | 负责品牌方IPR相关业务 |
| rights_lawyer | 维权律师 | 负责维权律师相关业务 |
| monitoring_analyst | 监测分析师 | 负责监测分析师相关业务 |

---

## 功能权限矩阵

> 权限标识：R = 可读 (Read)，W = 可写 (Write)，N = 无权限 (None)

| 功能模块 | 品牌方IPR | 维权律师 | 监测分析师 |
|----------|------|------|------|
| 侵权线索管理 | R/W | R | R/W |
| 存证记录管理 | R | R | R/W |
| 维权案件管理 | R/W | R/W | R |
| 跨境规则模板管理 | R/W | R/W | R |

---

## 数据权限矩阵

| 角色 | 数据范围 | 说明 |
|------|----------|------|
| brand_ipr - 品牌方IPR | 全部数据 (all) | 可查看/管理所有数据 |
| rights_lawyer - 维权律师 | 全部数据 (all) | 可查看/管理所有数据 |
| monitoring_analyst - 监测分析师 | 全部数据 (all) | 可查看/管理所有数据 |

---

## 页面可见性矩阵

| 页面 | 品牌方IPR | 维权律师 | 监测分析师 |
|------|------|------|------|
| P01 monitor-dashboard | Y | Y | Y |
| P02 infringement-leads | Y | Y | Y |
| P03 evidence-detail | Y | Y | Y |
| P04 rights-cases | Y | Y | Y |
| P05 cross-border-rules | Y | Y | Y |
| P06 rights-analytics | Y | Y | Y |

---

## 页面操作权限详情

| 页面 | 操作 | 品牌方IPR | 维权律师 | 监测分析师 |
|------|------|------|------|------|
| monitor-dashboard | 新增 | Y | - | Y |
| monitor-dashboard | 编辑 | Y | - | Y |
| monitor-dashboard | 删除 | - | - | - |
| monitor-dashboard | 导出 | Y | Y | Y |
| monitor-dashboard | 审批 | Y | - | Y |
| infringement-leads | 新增 | Y | - | Y |
| infringement-leads | 编辑 | Y | - | Y |
| infringement-leads | 删除 | - | - | - |
| infringement-leads | 导出 | Y | Y | Y |
| infringement-leads | 审批 | Y | - | Y |
| evidence-detail | 新增 | - | - | Y |
| evidence-detail | 编辑 | - | - | Y |
| evidence-detail | 删除 | - | - | - |
| evidence-detail | 导出 | Y | Y | Y |
| evidence-detail | 审批 | - | - | Y |
| rights-cases | 新增 | Y | - | - |
| rights-cases | 编辑 | Y | Y | - |
| rights-cases | 删除 | - | - | - |
| rights-cases | 导出 | Y | Y | - |
| rights-cases | 审批 | Y | Y | - |
| cross-border-rules | 新增 | Y | - | - |
| cross-border-rules | 编辑 | Y | Y | - |
| cross-border-rules | 删除 | - | - | - |
| cross-border-rules | 导出 | - | - | - |
| cross-border-rules | 审批 | Y | Y | - |

---

> 权限基线配置请参见 `permission-baseline.yaml`（由角色权限自动推导）。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-08-29T15:52:06.999Z）
