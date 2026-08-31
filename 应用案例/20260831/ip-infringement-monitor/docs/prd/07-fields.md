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

### 实体：侵权线索（InfringementLead）

| 字段名 | 字段标签 | 类型 | 必填 | 校验规则 | 组件映射 | 说明 |
|--------|----------|------|------|----------|----------|------|
| leadNo | 线索编号 | string | 是 | 必填校验 | Input | 线索编号字段 |
| patentNo | 专利号 | string | 是 | 必填校验 | Input | 专利号字段 |
| patentTitle | 专利名称 | string | 是 | 必填校验 | Input | 专利名称字段 |
| itemTitle | 涉嫌商品标题 | string | 是 | 必填校验 | Input | 涉嫌商品标题字段 |
| channel | 侵权渠道 | enum | 是 | 枚举值校验 | Select | 侵权渠道字段 |
| platform | 平台站点 | enum | 是 | 枚举值校验 | Select | 平台站点字段 |
| seller | 涉嫌卖家 | string | 是 | 必填校验 | Input | 涉嫌卖家字段 |
| shopUrl | 商品链接 | string | 否 | - | Input | 商品链接字段 |
| similarity | 相似度评分 | number | 否 | 数值范围校验 | InputNumber | 相似度评分字段 |
| riskLevel | 风险等级 | enum | 是 | 枚举值校验 | Select | 风险等级字段 |
| hitCount | 命中商品数 | number | 否 | 数值范围校验 | InputNumber | 命中商品数字段 |
| hitTime | 命中时间 | date | 是 | 日期格式 YYYY-MM-DD | DatePicker | 命中时间字段 |
| evidenceDeadline | 存证截止时间 | date | 是 | 日期格式 YYYY-MM-DD | DatePicker | 存证截止时间字段 |
| status | 线索状态 | enum | 是 | 枚举值校验 | Select | 线索状态字段 |

**状态枚举**：PENDING_EVIDENCE / EVIDENCED / FILED / EXPIRED / IGNORED


### 实体：存证记录（EvidenceRecord）

| 字段名 | 字段标签 | 类型 | 必填 | 校验规则 | 组件映射 | 说明 |
|--------|----------|------|------|----------|----------|------|
| evidenceNo | 存证编号 | string | 是 | 必填校验 | Input | 存证编号字段 |
| leadNo | 关联线索编号 | string | 是 | 必填校验 | Input | 关联线索编号字段 |
| method | 存证方式 | enum | 是 | 枚举值校验 | Select | 存证方式字段 |
| blockHash | 存证哈希 | string | 否 | - | Input | 存证哈希字段 |
| blockHeight | 区块高度 | number | 否 | 数值范围校验 | InputNumber | 区块高度字段 |
| chainTime | 上链时间 | date | 否 | 日期格式 YYYY-MM-DD | DatePicker | 上链时间字段 |
| evidenceStatus | 证据状态 | enum | 是 | 枚举值校验 | Select | 证据状态字段 |
| reportNo | 取证报告编号 | string | 否 | - | Input | 取证报告编号字段 |
| operator | 取证操作人 | string | 否 | - | Input | 取证操作人字段 |
| fileCount | 证据文件数 | number | 否 | 数值范围校验 | InputNumber | 证据文件数字段 |

**状态枚举**：CHAINING / ON_CHAIN / INVALID


### 实体：维权案件（RightsCase）

| 字段名 | 字段标签 | 类型 | 必填 | 校验规则 | 组件映射 | 说明 |
|--------|----------|------|------|----------|----------|------|
| caseNo | 案件编号 | string | 是 | 必填校验 | Input | 案件编号字段 |
| leadNo | 关联线索编号 | string | 是 | 必填校验 | Input | 关联线索编号字段 |
| patentNo | 涉案专利号 | string | 是 | 必填校验 | Input | 涉案专利号字段 |
| seller | 被诉卖家 | string | 是 | 必填校验 | Input | 被诉卖家字段 |
| strategy | 处置策略 | enum | 是 | 枚举值校验 | Select | 处置策略字段 |
| region | 国家地区 | enum | 是 | 枚举值校验 | Select | 国家地区字段 |
| platform | 受理平台 | string | 否 | - | Input | 受理平台字段 |
| ruleCode | 绑定规则模板 | string | 否 | - | Input | 绑定规则模板字段 |
| status | 案件状态 | enum | 是 | 枚举值校验 | Select | 案件状态字段 |
| owner | 责任角色 | enum | 否 | 枚举值校验 | Select | 责任角色字段 |
| ownerName | 责任人 | string | 否 | - | Input | 责任人字段 |
| createdAt | 立案时间 | date | 否 | 日期格式 YYYY-MM-DD | DatePicker | 立案时间字段 |
| closedAt | 结案时间 | date | 否 | 日期格式 YYYY-MM-DD | DatePicker | 结案时间字段 |
| outcome | 处置结果 | enum | 否 | 枚举值校验 | Select | 处置结果字段 |
| compensation | 维权收益 | number | 否 | 数值范围校验 | InputNumber | 维权收益字段 |

**状态枚举**：PENDING / PROCESSING / ACCEPTED / CLOSED / REJECTED


### 实体：跨境规则模板（CrossBorderRule）

| 字段名 | 字段标签 | 类型 | 必填 | 校验规则 | 组件映射 | 说明 |
|--------|----------|------|------|----------|----------|------|
| ruleCode | 规则编号 | string | 是 | 必填校验 | Input | 规则编号字段 |
| region | 国家地区 | enum | 是 | 枚举值校验 | Select | 国家地区字段 |
| platform | 适用平台 | enum | 是 | 枚举值校验 | Select | 适用平台字段 |
| channel | 投诉渠道 | string | 否 | - | Input | 投诉渠道字段 |
| responseSla | 响应时效工作日 | number | 否 | 数值范围校验 | InputNumber | 响应时效工作日字段 |
| materials | 材料清单 | text | 否 | 最大长度 500 | TextArea | 材料清单字段 |
| templateName | 模板名称 | string | 否 | - | Input | 模板名称字段 |
| enabled | 启用状态 | boolean | 否 | - | Input | 启用状态字段 |
| boundCases | 已绑定案件数 | number | 否 | 数值范围校验 | InputNumber | 已绑定案件数字段 |
| updatedAt | 更新时间 | date | 否 | 日期格式 YYYY-MM-DD | DatePicker | 更新时间字段 |

**状态枚举**：ENABLED / DISABLED


---

> 完整的字段定义请参见 `field-definitions.yaml`（由实体字段自动推导）。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-08-29T15:52:06.995Z）
