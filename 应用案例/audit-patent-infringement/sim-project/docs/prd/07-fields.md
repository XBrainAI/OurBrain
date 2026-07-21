# 07 - 字段定义

> 本文档定义系统中的全局共享字段及各实体的字段详情。

---

## 全局共享字段

以下字段在所有实体中统一使用，无需重复定义。

| 字段名 | 字段标签 | 类型 | 必填 | 校验规则 | 组件映射 | 说明 |
|--------|----------|------|------|----------|----------|------|
| id | 主键 | string | 是 | UUID 格式 | - | 系统自动生成，不可编辑 |
| created_at | 创建时间 | datetime | 是 | ISO 8601 | DatePicker | 系统自动生成，不可编辑 |
| updated_at | 更新时间 | datetime | 是 | ISO 8601 | DatePicker | 系统自动更新，不可编辑 |
| created_by | 创建人 | string | 是 | - | Select | 关联当前操作用户，不可编辑 |
| status | 状态 | enum | 是 | 见状态枚举 | Select | 状态值由实体状态枚举定义 |

---

## 实体字段详情

### 实体：侵权案件（infringement-case）

| 字段名 | 字段标签 | 类型 | 必填 | 校验规则 | 组件映射 | 说明 |
|--------|----------|------|------|----------|----------|------|
| case_no | 案件编号 | string | 是 | 必填校验 | Input | 案件编号字段 |
| platform | 平台 | enum | 是 | 枚举值校验 | Select | 平台字段 |
| suspect_seller | 涉嫌卖家 | string | 是 | 必填校验 | Input | 涉嫌卖家字段 |
| evidence_status | 存证状态 | enum | 是 | 枚举值校验 | Select | 存证状态字段 |
| lawyer | 承办律师 | string | 否 | - | Input | 承办律师字段 |
| owner | 品牌方 | string | 是 | 必填校验 | Input | 品牌方字段 |
| operator | 操作人 | string | 否 | - | Input | 操作人字段 |

**状态枚举**：monitoring / detected / evidence_collected / complained / resolved


---

> 完整的字段定义请参见 `field-definitions.yaml`（由实体字段自动推导）。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-07-21T10:19:16.109Z）
