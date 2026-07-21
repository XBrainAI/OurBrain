# 08 - 权限设计

> 本文档定义 RBAC 角色权限体系，包括功能权限、数据权限、页面可见性及页面操作权限。

---

## 角色列表

| 角色 ID | 角色名称 | 描述 |
|---------|----------|------|
| ai-engineer | AI工程师 | 负责AI工程师相关业务 |
| ipr | 企业IPR | 负责企业IPR相关业务 |
| agent | 代理师 | 负责代理师相关业务 |

---

## 功能权限矩阵

> 权限标识：R = 可读 (Read)，W = 可写 (Write)，N = 无权限 (None)

| 功能模块 | AI工程师 | 企业IPR | 代理师 |
|----------|------|------|------|
| AIGC专利管理 | R/W | R/W | R/W |

---

## 数据权限矩阵

| 角色 | 数据范围 | 说明 |
|------|----------|------|
| ai-engineer - AI工程师 | 全部数据 (all) | 可查看/管理所有数据 |
| ipr - 企业IPR | 全部数据 (all) | 可查看/管理所有数据 |
| agent - 代理师 | 全部数据 (all) | 可查看/管理所有数据 |

---

## 页面可见性矩阵

| 页面 | AI工程师 | 企业IPR | 代理师 |
|------|------|------|------|
| P01 aigc-patent-list | Y | Y | Y |
| P02 aigc-patent-detail | Y | Y | Y |
| P03 aigc-patent-upload | Y | Y | Y |

---

## 页面操作权限详情

| 页面 | 操作 | AI工程师 | 企业IPR | 代理师 |
|------|------|------|------|------|
| aigc-patent-list | 新增 | Y | Y | - |
| aigc-patent-list | 编辑 | - | Y | Y |
| aigc-patent-list | 删除 | - | Y | - |
| aigc-patent-list | 导出 | - | Y | Y |
| aigc-patent-list | 审批 | - | Y | Y |
| aigc-patent-detail | 新增 | Y | Y | - |
| aigc-patent-detail | 编辑 | - | Y | Y |
| aigc-patent-detail | 删除 | - | Y | - |
| aigc-patent-detail | 导出 | - | Y | Y |
| aigc-patent-detail | 审批 | - | Y | Y |
| aigc-patent-upload | 新增 | Y | Y | - |
| aigc-patent-upload | 编辑 | - | Y | Y |
| aigc-patent-upload | 删除 | - | Y | - |
| aigc-patent-upload | 导出 | - | Y | Y |
| aigc-patent-upload | 审批 | - | Y | Y |

---

> 权限基线配置请参见 `permission-baseline.yaml`（由角色权限自动推导）。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-07-21T10:20:38.243Z）
