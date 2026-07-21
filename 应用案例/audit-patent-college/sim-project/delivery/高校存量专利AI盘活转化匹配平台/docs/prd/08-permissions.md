# 08 - 权限设计

> 本文档定义 RBAC 角色权限体系，包括功能权限、数据权限、页面可见性及页面操作权限。

---

## 角色列表

| 角色 ID | 角色名称 | 描述 |
|---------|----------|------|
| college-research | 高校科研处 | 负责高校科研处相关业务 |
| enterprise-tech | 企业技术经理 | 负责企业技术经理相关业务 |
| transfer-broker | 转化中介 | 负责转化中介相关业务 |

---

## 功能权限矩阵

> 权限标识：R = 可读 (Read)，W = 可写 (Write)，N = 无权限 (None)

| 功能模块 | 高校科研处 | 企业技术经理 | 转化中介 |
|----------|------|------|------|
| 高校专利管理 | R/W | R/W | R/W |

---

## 数据权限矩阵

| 角色 | 数据范围 | 说明 |
|------|----------|------|
| college-research - 高校科研处 | 全部数据 (all) | 可查看/管理所有数据 |
| enterprise-tech - 企业技术经理 | 全部数据 (all) | 可查看/管理所有数据 |
| transfer-broker - 转化中介 | 全部数据 (all) | 可查看/管理所有数据 |

---

## 页面可见性矩阵

| 页面 | 高校科研处 | 企业技术经理 | 转化中介 |
|------|------|------|------|
| P01 college-patent-list | Y | Y | Y |
| P02 college-patent-detail | Y | Y | Y |
| P03 college-patent-match | Y | Y | Y |

---

## 页面操作权限详情

| 页面 | 操作 | 高校科研处 | 企业技术经理 | 转化中介 |
|------|------|------|------|------|
| college-patent-list | 新增 | Y | - | - |
| college-patent-list | 编辑 | Y | Y | Y |
| college-patent-list | 删除 | Y | - | - |
| college-patent-list | 导出 | Y | - | Y |
| college-patent-list | 审批 | Y | Y | Y |
| college-patent-detail | 新增 | Y | - | - |
| college-patent-detail | 编辑 | Y | Y | Y |
| college-patent-detail | 删除 | Y | - | - |
| college-patent-detail | 导出 | Y | - | Y |
| college-patent-detail | 审批 | Y | Y | Y |
| college-patent-match | 新增 | Y | - | - |
| college-patent-match | 编辑 | Y | Y | Y |
| college-patent-match | 删除 | Y | - | - |
| college-patent-match | 导出 | Y | - | Y |
| college-patent-match | 审批 | Y | Y | Y |

---

> 权限基线配置请参见 `permission-baseline.yaml`（由角色权限自动推导）。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-07-21T09:57:09.103Z）
