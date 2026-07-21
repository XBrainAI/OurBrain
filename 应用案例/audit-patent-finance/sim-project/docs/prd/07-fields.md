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

### 实体：质押案件（pledge-case）

| 字段名 | 字段标签 | 类型 | 必填 | 校验规则 | 组件映射 | 说明 |
|--------|----------|------|------|----------|----------|------|
| case_no | 案件编号 | string | 是 | 必填校验 | Input | 案件编号字段 |
| applicant | 申请人 | string | 是 | 必填校验 | Input | 申请人字段 |
| pledge_patents | 质押专利清单 | text | 是 | 最大长度 500 | TextArea | 质押专利清单字段 |
| assessed_value | 评估价值（万元） | number | 是 | 数值范围校验 | InputNumber | 评估价值（万元）字段 |
| loan_amount | 贷款金额（万元） | number | 是 | 数值范围校验 | InputNumber | 贷款金额（万元）字段 |
| bank | 受托银行 | enum | 是 | 枚举值校验 | Select | 受托银行字段 |
| operator | 操作人 | string | 否 | - | Input | 操作人字段 |

**状态枚举**：applied / assessing / approved / registered / disbursed / repaid


---

> 完整的字段定义请参见 `field-definitions.yaml`（由实体字段自动推导）。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-07-21T10:18:59.215Z）
