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

### 实体：专利资产（patent-asset）

| 字段名 | 字段标签 | 类型 | 必填 | 校验规则 | 组件映射 | 说明 |
|--------|----------|------|------|----------|----------|------|
| patent_no | 专利号 | string | 是 | 必填校验 | Input | 专利号字段 |
| title | 专利名称 | string | 是 | 必填校验 | Input | 专利名称字段 |
| value_estimate | 估值（万元） | number | 是 | 数值范围校验 | InputNumber | 估值（万元）字段 |
| annual_fee_due | 年费到期日 | date | 是 | 日期格式 YYYY-MM-DD | DatePicker | 年费到期日字段 |
| owner | 专利权人 | string | 是 | 必填校验 | Input | 专利权人字段 |
| operator | 操作人 | string | 否 | - | Input | 操作人字段 |
| status | 状态 | enum | 是 | 枚举值校验 | Select | 状态字段 |

**状态枚举**：active / expired / pledged / transferred


---

> 完整的字段定义请参见 `field-definitions.yaml`（由实体字段自动推导）。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-07-21T10:12:23.187Z）
