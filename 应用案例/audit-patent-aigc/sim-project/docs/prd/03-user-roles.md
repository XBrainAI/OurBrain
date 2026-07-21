# 03 - 用户角色

> 本文档定义系统中的用户角色、权限概要与角色详细说明。

---

## 角色定义

| ID | 名称 | 职责 | 场景 |
|----|------|------|------|
| ai-engineer | AI工程师 | 负责AI工程师相关业务 | AIGC专利管理 |
| ipr | 企业IPR | 负责企业IPR相关业务 | 日常业务操作 |
| agent | 代理师 | 负责代理师相关业务 | 日常业务操作 |

---

## 角色权限概要

| 角色 | 查看 | 新增 | 编辑 | 删除 | 审批 | 导出 |
|------|------|------|------|------|------|------|
| AI工程师 | Y | Y | - | - | - | - |
| 企业IPR | Y | Y | Y | Y | - | Y |
| 代理师 | Y | - | Y | - | - | Y |

> 详细权限矩阵请参见 [08-permissions.md](./08-permissions.md)。

---

## 角色详细说明

### 角色 ai-engineer：AI工程师

| 维度 | 描述 |
|------|------|
| 核心职责 | 负责AI工程师相关业务的管理与执行 |
| 使用频率 | 每日中频（3-5 次/天） |
| 典型操作路径 | aigc-patent-list -> aigc-patent-detail -> aigc-patent-upload |
| 数据权限 | 全部数据 |
| 关联权限 | aigc-patent:create,read |

### 角色 ipr：企业IPR

| 维度 | 描述 |
|------|------|
| 核心职责 | 负责企业IPR相关业务的管理与执行 |
| 使用频率 | 每日中频（3-5 次/天） |
| 典型操作路径 | aigc-patent-list -> aigc-patent-detail -> aigc-patent-upload |
| 数据权限 | 全部数据 |
| 关联权限 | aigc-patent:create,read,update,delete,export |

### 角色 agent：代理师

| 维度 | 描述 |
|------|------|
| 核心职责 | 负责代理师相关业务的管理与执行 |
| 使用频率 | 每日中频（3-5 次/天） |
| 典型操作路径 | aigc-patent-list -> aigc-patent-detail -> aigc-patent-upload |
| 数据权限 | 全部数据 |
| 关联权限 | aigc-patent:read,update,export |

---

> 完整的 RBAC 权限设计请参见 [08-permissions.md](./08-permissions.md)。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-07-21T10:20:38.225Z）
