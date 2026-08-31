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

### 实体：专利资产（PatentAsset）

| 字段名 | 字段标签 | 类型 | 必填 | 校验规则 | 组件映射 | 说明 |
|--------|----------|------|------|----------|----------|------|
| patentNo | 专利号 | string | 是 | 必填校验 | Input | 专利号字段 |
| title | 专利名称 | string | 是 | 必填校验 | Input | 专利名称字段 |
| patentType | 专利类型 | enum | 是 | 枚举值校验 | Select | 专利类型字段 |
| techField | 技术领域 | enum | 是 | 枚举值校验 | Select | 技术领域字段 |
| owner | 专利权人 | string | 是 | 必填校验 | Input | 专利权人字段 |
| applyDate | 申请日 | date | 否 | 日期格式 YYYY-MM-DD | DatePicker | 申请日字段 |
| grantDate | 授权日 | date | 否 | 日期格式 YYYY-MM-DD | DatePicker | 授权日字段 |
| expiryDate | 届满日 | date | 否 | 日期格式 YYYY-MM-DD | DatePicker | 届满日字段 |
| feeDueDate | 年费截止日 | date | 否 | 日期格式 YYYY-MM-DD | DatePicker | 年费截止日字段 |
| annualFee | 年费金额(元) | number | 否 | 数值范围校验 | InputNumber | 年费金额(元)字段 |
| value | 当前估值(万元) | number | 否 | 数值范围校验 | InputNumber | 当前估值(万元)字段 |
| valueGrade | 估值等级 | enum | 否 | 枚举值校验 | Select | 估值等级字段 |
| status | 资产状态 | enum | 是 | 枚举值校验 | Select | 资产状态字段 |
| pledgeStatus | 质押状态 | enum | 否 | 枚举值校验 | Select | 质押状态字段 |

**状态枚举**：ACTIVE / FEE_WARNING / EXPIRED


### 实体：估值记录（ValuationRecord）

| 字段名 | 字段标签 | 类型 | 必填 | 校验规则 | 组件映射 | 说明 |
|--------|----------|------|------|----------|----------|------|
| recordNo | 估值编号 | string | 是 | 必填校验 | Input | 估值编号字段 |
| patentNo | 专利号 | string | 是 | 必填校验 | Input | 专利号字段 |
| quarter | 估值期 | enum | 是 | 枚举值校验 | Select | 估值期字段 |
| legalScore | 法律维度 | number | 否 | 数值范围校验 | InputNumber | 法律维度字段 |
| techScore | 技术维度 | number | 否 | 数值范围校验 | InputNumber | 技术维度字段 |
| marketScore | 市场维度 | number | 否 | 数值范围校验 | InputNumber | 市场维度字段 |
| revenueScore | 营收维度 | number | 否 | 数值范围校验 | InputNumber | 营收维度字段 |
| totalScore | 综合得分 | number | 否 | 数值范围校验 | InputNumber | 综合得分字段 |
| value | 估值(万元) | number | 否 | 数值范围校验 | InputNumber | 估值(万元)字段 |
| status | 确认状态 | enum | 是 | 枚举值校验 | Select | 确认状态字段 |
| confirmedBy | 确认人 | string | 否 | - | Input | 确认人字段 |
| confirmedAt | 确认时间 | date | 否 | 日期格式 YYYY-MM-DD | DatePicker | 确认时间字段 |

**状态枚举**：PENDING / CONFIRMED


### 实体：年费记录（AnnualFeeRecord）

| 字段名 | 字段标签 | 类型 | 必填 | 校验规则 | 组件映射 | 说明 |
|--------|----------|------|------|----------|----------|------|
| patentNo | 专利号 | string | 是 | 必填校验 | Input | 专利号字段 |
| year | 年度 | number | 是 | 数值范围校验 | InputNumber | 年度字段 |
| dueDate | 缴费截止日 | date | 是 | 日期格式 YYYY-MM-DD | DatePicker | 缴费截止日字段 |
| amount | 金额(元) | number | 是 | 数值范围校验 | InputNumber | 金额(元)字段 |
| status | 缴费状态 | enum | 是 | 枚举值校验 | Select | 缴费状态字段 |
| paidAt | 缴费日期 | date | 否 | 日期格式 YYYY-MM-DD | DatePicker | 缴费日期字段 |

**状态枚举**：PAID / PENDING / WARNING / OVERDUE


### 实体：质押转让记录（PledgeTransferRecord）

| 字段名 | 字段标签 | 类型 | 必填 | 校验规则 | 组件映射 | 说明 |
|--------|----------|------|------|----------|----------|------|
| recordNo | 业务编号 | string | 是 | 必填校验 | Input | 业务编号字段 |
| patentNo | 专利号 | string | 是 | 必填校验 | Input | 专利号字段 |
| type | 业务类型 | enum | 是 | 枚举值校验 | Select | 业务类型字段 |
| counterparty | 对手方 | string | 是 | 必填校验 | Input | 对手方字段 |
| amount | 金额/对价(万元) | number | 否 | 数值范围校验 | InputNumber | 金额/对价(万元)字段 |
| startDate | 起始日 | date | 否 | 日期格式 YYYY-MM-DD | DatePicker | 起始日字段 |
| status | 状态 | enum | 是 | 枚举值校验 | Select | 状态字段 |

**状态枚举**：IN_REVIEW / ACTIVE / RELEASED / COMPLETED / REJECTED


### 实体：撮合意向（MatchDeal）

| 字段名 | 字段标签 | 类型 | 必填 | 校验规则 | 组件映射 | 说明 |
|--------|----------|------|------|----------|----------|------|
| dealNo | 意向编号 | string | 是 | 必填校验 | Input | 意向编号字段 |
| patentNo | 关联专利号 | string | 是 | 必填校验 | Input | 关联专利号字段 |
| buyer | 需求方 | string | 是 | 必填校验 | Input | 需求方字段 |
| industry | 需求行业 | enum | 否 | 枚举值校验 | Select | 需求行业字段 |
| intentType | 意向类型 | enum | 是 | 枚举值校验 | Select | 意向类型字段 |
| budget | 预算(万元) | number | 否 | 数值范围校验 | InputNumber | 预算(万元)字段 |
| status | 意向状态 | enum | 是 | 枚举值校验 | Select | 意向状态字段 |
| owner | 负责人 | string | 否 | - | Input | 负责人字段 |

**状态枚举**：CONTACT / DUE_DILIGENCE / SIGNED / DEAL / PAUSED


---

> 完整的字段定义请参见 `field-definitions.yaml`（由实体字段自动推导）。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-08-28T16:41:57.828Z）
