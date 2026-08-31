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

### 实体：专利资产（Patent）

| 字段名 | 字段标签 | 类型 | 必填 | 校验规则 | 组件映射 | 说明 |
|--------|----------|------|------|----------|----------|------|
| patentNo | 专利号 | string | 是 | 必填校验 | Input | 专利号字段 |
| title | 专利名称 | string | 是 | 必填校验 | Input | 专利名称字段 |
| type | 专利类型 | enum | 是 | 枚举值校验 | Select | 专利类型字段 |
| applicant | 权利人 | string | 否 | - | Input | 权利人字段 |
| inventor | 发明人 | string | 否 | - | Input | 发明人字段 |
| applicationDate | 申请日 | date | 否 | 日期格式 YYYY-MM-DD | DatePicker | 申请日字段 |
| grantDate | 授权日 | date | 否 | 日期格式 YYYY-MM-DD | DatePicker | 授权日字段 |
| expiryDate | 年费到期日 | date | 否 | 日期格式 YYYY-MM-DD | DatePicker | 年费到期日字段 |
| status | 法律状态 | enum | 否 | 枚举值校验 | Select | 法律状态字段 |
| feeStatus | 年费状态 | enum | 否 | 枚举值校验 | Select | 年费状态字段 |
| annualFee | 本年度费(元) | number | 否 | 数值范围校验 | InputNumber | 本年度费(元)字段 |
| estimatedValue | 最新估值(万元) | number | 否 | 数值范围校验 | InputNumber | 最新估值(万元)字段 |
| industry | 所属行业 | string | 否 | - | Input | 所属行业字段 |
| isPledged | 是否质押 | boolean | 否 | - | Input | 是否质押字段 |

**状态枚举**：APPLYING / ACTIVE / EXPIRING / EXPIRED / PLEDGED / TRANSFERRING / TRANSFERRED


### 实体：估值记录（Valuation）

| 字段名 | 字段标签 | 类型 | 必填 | 校验规则 | 组件映射 | 说明 |
|--------|----------|------|------|----------|----------|------|
| valuationNo | 估值编号 | string | 否 | - | Input | 估值编号字段 |
| patentNo | 专利号 | string | 否 | - | Input | 专利号字段 |
| patentTitle | 专利名称 | string | 否 | - | Input | 专利名称字段 |
| quarter | 估值季度 | enum | 否 | 枚举值校验 | Select | 估值季度字段 |
| legalScore | 法律维度得分 | number | 否 | 数值范围校验 | InputNumber | 法律维度得分字段 |
| techScore | 技术维度得分 | number | 否 | 数值范围校验 | InputNumber | 技术维度得分字段 |
| marketScore | 市场维度得分 | number | 否 | 数值范围校验 | InputNumber | 市场维度得分字段 |
| revenueScore | 营收维度得分 | number | 否 | 数值范围校验 | InputNumber | 营收维度得分字段 |
| totalValue | 估值金额(万元) | number | 否 | 数值范围校验 | InputNumber | 估值金额(万元)字段 |
| method | 估值模型 | enum | 否 | 枚举值校验 | Select | 估值模型字段 |
| status | 确认状态 | enum | 否 | 枚举值校验 | Select | 确认状态字段 |
| confirmBy | 确认人 | string | 否 | - | Input | 确认人字段 |
| confirmTime | 确认时间 | date | 否 | 日期格式 YYYY-MM-DD | DatePicker | 确认时间字段 |

**状态枚举**：PENDING / CONFIRMED / REJECTED


### 实体：年费记录（AnnualFee）

| 字段名 | 字段标签 | 类型 | 必填 | 校验规则 | 组件映射 | 说明 |
|--------|----------|------|------|----------|----------|------|
| feeNo | 记录编号 | string | 否 | - | Input | 记录编号字段 |
| patentNo | 专利号 | string | 否 | - | Input | 专利号字段 |
| patentTitle | 专利名称 | string | 否 | - | Input | 专利名称字段 |
| feeYear | 费年度 | number | 否 | 数值范围校验 | InputNumber | 费年度字段 |
| amount | 应缴金额(元) | number | 否 | 数值范围校验 | InputNumber | 应缴金额(元)字段 |
| dueDate | 到期日 | date | 否 | 日期格式 YYYY-MM-DD | DatePicker | 到期日字段 |
| status | 缴费状态 | enum | 否 | 枚举值校验 | Select | 缴费状态字段 |
| paidDate | 缴费日期 | date | 否 | 日期格式 YYYY-MM-DD | DatePicker | 缴费日期字段 |

**状态枚举**：PAID / PENDING / UPCOMING / OVERDUE


### 实体：质押登记（Pledge）

| 字段名 | 字段标签 | 类型 | 必填 | 校验规则 | 组件映射 | 说明 |
|--------|----------|------|------|----------|----------|------|
| pledgeNo | 质押编号 | string | 否 | - | Input | 质押编号字段 |
| patentNo | 专利号 | string | 否 | - | Input | 专利号字段 |
| patentTitle | 专利名称 | string | 否 | - | Input | 专利名称字段 |
| bank | 质权人(银行) | string | 否 | - | Input | 质权人(银行)字段 |
| pledgeAmount | 质押金额(万元) | number | 否 | 数值范围校验 | InputNumber | 质押金额(万元)字段 |
| startDate | 质押开始日 | date | 否 | 日期格式 YYYY-MM-DD | DatePicker | 质押开始日字段 |
| endDate | 质押到期日 | date | 否 | 日期格式 YYYY-MM-DD | DatePicker | 质押到期日字段 |
| riskLevel | 风险等级 | enum | 否 | 枚举值校验 | Select | 风险等级字段 |
| status | 质押状态 | enum | 否 | 枚举值校验 | Select | 质押状态字段 |

**状态枚举**：ACTIVE / RELEASED


### 实体：转让请求（TransferRequest）

| 字段名 | 字段标签 | 类型 | 必填 | 校验规则 | 组件映射 | 说明 |
|--------|----------|------|------|----------|----------|------|
| transferNo | 转让编号 | string | 否 | - | Input | 转让编号字段 |
| patentNo | 专利号 | string | 否 | - | Input | 专利号字段 |
| patentTitle | 专利名称 | string | 否 | - | Input | 专利名称字段 |
| buyer | 受让方 | string | 否 | - | Input | 受让方字段 |
| transferPrice | 转让价格(万元) | number | 否 | 数值范围校验 | InputNumber | 转让价格(万元)字段 |
| reason | 转让原因 | text | 否 | 最大长度 500 | TextArea | 转让原因字段 |
| status | 转让状态 | enum | 否 | 枚举值校验 | Select | 转让状态字段 |
| createBy | 发起人 | string | 否 | - | Input | 发起人字段 |
| createTime | 发起时间 | date | 否 | 日期格式 YYYY-MM-DD | DatePicker | 发起时间字段 |

**状态枚举**：DRAFT / REVIEWING / DONE / CANCELLED


### 实体：专利组合（Portfolio）

| 字段名 | 字段标签 | 类型 | 必填 | 校验规则 | 组件映射 | 说明 |
|--------|----------|------|------|----------|----------|------|
| portfolioNo | 组合编号 | string | 否 | - | Input | 组合编号字段 |
| name | 组合名称 | string | 否 | - | Input | 组合名称字段 |
| strategy | 组合战略 | enum | 否 | 枚举值校验 | Select | 组合战略字段 |
| industry | 所属产业 | string | 否 | - | Input | 所属产业字段 |
| patentCount | 专利数量 | number | 否 | 数值范围校验 | InputNumber | 专利数量字段 |
| totalValue | 组合估值(万元) | number | 否 | 数值范围校验 | InputNumber | 组合估值(万元)字段 |
| owner | 负责人 | string | 否 | - | Input | 负责人字段 |

### 实体：撮合需求（MatchDemand）

| 字段名 | 字段标签 | 类型 | 必填 | 校验规则 | 组件映射 | 说明 |
|--------|----------|------|------|----------|----------|------|
| demandNo | 需求编号 | string | 否 | - | Input | 需求编号字段 |
| demandCompany | 需求方 | string | 否 | - | Input | 需求方字段 |
| targetIndustry | 目标产业 | string | 否 | - | Input | 目标产业字段 |
| keyword | 技术关键词 | string | 否 | - | Input | 技术关键词字段 |
| budget | 预算(万元) | number | 否 | 数值范围校验 | InputNumber | 预算(万元)字段 |
| contact | 联系人 | string | 否 | - | Input | 联系人字段 |
| status | 需求状态 | enum | 否 | 枚举值校验 | Select | 需求状态字段 |

**状态枚举**：PUBLISHED / MATCHING / DEALT / CLOSED


---

> 完整的字段定义请参见 `field-definitions.yaml`（由实体字段自动推导）。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-08-30T00:54:23.719Z）
