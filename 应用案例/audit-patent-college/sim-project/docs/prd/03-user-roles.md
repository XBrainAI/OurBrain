# 03 - 用户角色

> 本文档定义系统中的用户角色、权限概要与角色详细说明。

---

## 角色定义

| ID | 名称 | 职责 | 场景 |
|----|------|------|------|
| college-research | 高校科研处 | 负责高校科研处相关业务 | 高校专利管理 |
| enterprise-tech | 企业技术经理 | 负责企业技术经理相关业务 | 日常业务操作 |
| transfer-broker | 转化中介 | 负责转化中介相关业务 | 日常业务操作 |

---

## 角色权限概要

| 角色 | 查看 | 新增 | 编辑 | 删除 | 审批 | 导出 |
|------|------|------|------|------|------|------|
| 高校科研处 | Y | Y | Y | Y | - | Y |
| 企业技术经理 | Y | - | Y | - | Y | - |
| 转化中介 | Y | - | Y | - | - | Y |

> 详细权限矩阵请参见 [08-permissions.md](./08-permissions.md)。

---

## 角色详细说明

### 角色 college-research：高校科研处

| 维度 | 描述 |
|------|------|
| 核心职责 | 负责高校科研处相关业务的管理与执行 |
| 使用频率 | 每日中频（3-5 次/天） |
| 典型操作路径 | college-patent-list -> college-patent-detail -> college-patent-match |
| 数据权限 | 全部数据 |
| 关联权限 | college-patent:create,read,update,delete,export |

### 角色 enterprise-tech：企业技术经理

| 维度 | 描述 |
|------|------|
| 核心职责 | 负责企业技术经理相关业务的管理与执行 |
| 使用频率 | 每日中频（3-5 次/天） |
| 典型操作路径 | college-patent-list -> college-patent-detail -> college-patent-match |
| 数据权限 | 全部数据 |
| 关联权限 | college-patent:read,update |

### 角色 transfer-broker：转化中介

| 维度 | 描述 |
|------|------|
| 核心职责 | 负责转化中介相关业务的管理与执行 |
| 使用频率 | 每日中频（3-5 次/天） |
| 典型操作路径 | college-patent-list -> college-patent-detail -> college-patent-match |
| 数据权限 | 全部数据 |
| 关联权限 | college-patent:read,update,export |

---

> 完整的 RBAC 权限设计请参见 [08-permissions.md](./08-permissions.md)。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-07-21T09:57:09.082Z）
