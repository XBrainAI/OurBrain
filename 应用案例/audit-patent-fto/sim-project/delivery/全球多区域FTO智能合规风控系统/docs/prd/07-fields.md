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

### 实体：FTO分析（fto-analysis）

| 字段名 | 字段标签 | 类型 | 必填 | 校验规则 | 组件映射 | 说明 |
|--------|----------|------|------|----------|----------|------|
| product_name | 产品名称 | string | 是 | 必填校验 | Input | 产品名称字段 |
| target_market | 目标市场 | enum | 是 | 枚举值校验 | Select | 目标市场字段 |
| risk_level | 风险等级 | enum | 是 | 枚举值校验 | Select | 风险等级字段 |
| analyst | 分析师 | string | 是 | 必填校验 | Input | 分析师字段 |
| report_url | 报告链接 | string | 否 | - | Input | 报告链接字段 |
| patent_count | 比对专利数 | number | 否 | 数值范围校验 | InputNumber | 比对专利数字段 |
| owner | 申请人 | string | 是 | 必填校验 | Input | 申请人字段 |
| operator | 操作人 | string | 否 | - | Input | 操作人字段 |

**状态枚举**：pending / analyzing / low_risk / high_risk / delivered


---

> 完整的字段定义请参见 `field-definitions.yaml`（由实体字段自动推导）。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-07-21T09:56:45.692Z）
