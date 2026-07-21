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

### 实体：专利创意（patent-idea）

| 字段名 | 字段标签 | 类型 | 必填 | 校验规则 | 组件映射 | 说明 |
|--------|----------|------|------|----------|----------|------|
| title | 创意标题 | string | 是 | 必填校验 | Input | 创意标题字段 |
| industry | 行业领域 | enum | 是 | 枚举值校验 | Select | 行业领域字段 |
| innovation_point | 创新点 | text | 是 | 最大长度 500 | TextArea | 创新点字段 |
| proposer | 提出人 | string | 是 | 必填校验 | Input | 提出人字段 |
| score | AI评分 | number | 否 | 数值范围校验 | InputNumber | AI评分字段 |
| layout_plan | 布局方案 | text | 否 | 最大长度 500 | TextArea | 布局方案字段 |
| owner | 责任IPR | string | 是 | 必填校验 | Input | 责任IPR字段 |
| operator | 操作人 | string | 否 | - | Input | 操作人字段 |

**状态枚举**：draft / analyzing / recommended / discarded


---

> 完整的字段定义请参见 `field-definitions.yaml`（由实体字段自动推导）。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-07-21T09:56:38.088Z）
