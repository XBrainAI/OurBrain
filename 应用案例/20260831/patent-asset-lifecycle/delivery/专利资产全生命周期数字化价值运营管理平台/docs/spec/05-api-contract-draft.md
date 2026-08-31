# 05 - API 接口契约 (技术规格)

> 本文档定义前后端接口契约，包括 RESTful API 的请求/响应格式、参数规范、错误码等。

---

## 1. 文档说明

本文档基于需求模型中的实体推导 RESTful API 契约，作为前后端联调的依据。

---

## 2. 通用规范

### 2.1 请求头

| Header | 说明 |
|--------|------|
| Authorization | Bearer {JWT token} |
| Content-Type | application/json |
| X-Request-Id | 请求追踪 ID（前端生成 UUID） |

### 2.2 统一响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": { ... },
  "requestId": "xxx-xxx-xxx"
}
```

### 2.3 分页参数规范

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | int | 1 | 页码（从 1 开始） |
| size | int | 20 | 每页条数（最大 100） |
| sort | string | - | 排序字段，格式：`field,asc` 或 `field,desc` |

### 2.4 分页响应格式

```json
{
  "code": 0,
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "size": 20
  }
}
```

---

## 3. 接口清单


### 3.1 专利资产 (Patent)

#### Patent-01 列表查询

- **Method**: GET
- **URL**: /api/patents
- **Query**: page, size, sort, keyword, patentNo
- **Response**: `{ list: Patent[], total, page, size }`

#### Patent-02 详情查询

- **Method**: GET
- **URL**: /api/patents/{id}
- **Response**: Patent 对象

#### Patent-03 新增

- **Method**: POST
- **URL**: /api/patents
- **Body**: Patent 对象（不含 id）
- **Response**: `{ id: string }`

#### Patent-04 编辑

- **Method**: PUT
- **URL**: /api/patents/{id}
- **Body**: Patent 对象（可变字段）
- **Response**: `{ success: true }`

#### Patent-05 删除

- **Method**: DELETE
- **URL**: /api/patents/{id}
- **Response**: `{ success: true }`

#### Patent-06 状态转换

- **Method**: POST
- **URL**: /api/patents/{id}/transition
- **Body**: `{ to: string, reason: string }`
- **Response**: `{ success: true }`


### 3.2 估值记录 (Valuation)

#### Valuation-01 列表查询

- **Method**: GET
- **URL**: /api/valuations
- **Query**: page, size, sort, keyword, valuationNo
- **Response**: `{ list: Valuation[], total, page, size }`

#### Valuation-02 详情查询

- **Method**: GET
- **URL**: /api/valuations/{id}
- **Response**: Valuation 对象

#### Valuation-03 新增

- **Method**: POST
- **URL**: /api/valuations
- **Body**: Valuation 对象（不含 id）
- **Response**: `{ id: string }`

#### Valuation-04 编辑

- **Method**: PUT
- **URL**: /api/valuations/{id}
- **Body**: Valuation 对象（可变字段）
- **Response**: `{ success: true }`

#### Valuation-05 删除

- **Method**: DELETE
- **URL**: /api/valuations/{id}
- **Response**: `{ success: true }`

#### Valuation-06 状态转换

- **Method**: POST
- **URL**: /api/valuations/{id}/transition
- **Body**: `{ to: string, reason: string }`
- **Response**: `{ success: true }`


### 3.3 年费记录 (AnnualFee)

#### AnnualFee-01 列表查询

- **Method**: GET
- **URL**: /api/annualfees
- **Query**: page, size, sort, keyword, feeNo
- **Response**: `{ list: AnnualFee[], total, page, size }`

#### AnnualFee-02 详情查询

- **Method**: GET
- **URL**: /api/annualfees/{id}
- **Response**: AnnualFee 对象

#### AnnualFee-03 新增

- **Method**: POST
- **URL**: /api/annualfees
- **Body**: AnnualFee 对象（不含 id）
- **Response**: `{ id: string }`

#### AnnualFee-04 编辑

- **Method**: PUT
- **URL**: /api/annualfees/{id}
- **Body**: AnnualFee 对象（可变字段）
- **Response**: `{ success: true }`

#### AnnualFee-05 删除

- **Method**: DELETE
- **URL**: /api/annualfees/{id}
- **Response**: `{ success: true }`

#### AnnualFee-06 状态转换

- **Method**: POST
- **URL**: /api/annualfees/{id}/transition
- **Body**: `{ to: string, reason: string }`
- **Response**: `{ success: true }`


### 3.4 质押登记 (Pledge)

#### Pledge-01 列表查询

- **Method**: GET
- **URL**: /api/pledges
- **Query**: page, size, sort, keyword, pledgeNo
- **Response**: `{ list: Pledge[], total, page, size }`

#### Pledge-02 详情查询

- **Method**: GET
- **URL**: /api/pledges/{id}
- **Response**: Pledge 对象

#### Pledge-03 新增

- **Method**: POST
- **URL**: /api/pledges
- **Body**: Pledge 对象（不含 id）
- **Response**: `{ id: string }`

#### Pledge-04 编辑

- **Method**: PUT
- **URL**: /api/pledges/{id}
- **Body**: Pledge 对象（可变字段）
- **Response**: `{ success: true }`

#### Pledge-05 删除

- **Method**: DELETE
- **URL**: /api/pledges/{id}
- **Response**: `{ success: true }`

#### Pledge-06 状态转换

- **Method**: POST
- **URL**: /api/pledges/{id}/transition
- **Body**: `{ to: string, reason: string }`
- **Response**: `{ success: true }`


### 3.5 转让请求 (TransferRequest)

#### TransferRequest-01 列表查询

- **Method**: GET
- **URL**: /api/transferrequests
- **Query**: page, size, sort, keyword, transferNo
- **Response**: `{ list: TransferRequest[], total, page, size }`

#### TransferRequest-02 详情查询

- **Method**: GET
- **URL**: /api/transferrequests/{id}
- **Response**: TransferRequest 对象

#### TransferRequest-03 新增

- **Method**: POST
- **URL**: /api/transferrequests
- **Body**: TransferRequest 对象（不含 id）
- **Response**: `{ id: string }`

#### TransferRequest-04 编辑

- **Method**: PUT
- **URL**: /api/transferrequests/{id}
- **Body**: TransferRequest 对象（可变字段）
- **Response**: `{ success: true }`

#### TransferRequest-05 删除

- **Method**: DELETE
- **URL**: /api/transferrequests/{id}
- **Response**: `{ success: true }`

#### TransferRequest-06 状态转换

- **Method**: POST
- **URL**: /api/transferrequests/{id}/transition
- **Body**: `{ to: string, reason: string }`
- **Response**: `{ success: true }`


### 3.6 专利组合 (Portfolio)

#### Portfolio-01 列表查询

- **Method**: GET
- **URL**: /api/portfolios
- **Query**: page, size, sort, keyword, portfolioNo
- **Response**: `{ list: Portfolio[], total, page, size }`

#### Portfolio-02 详情查询

- **Method**: GET
- **URL**: /api/portfolios/{id}
- **Response**: Portfolio 对象

#### Portfolio-03 新增

- **Method**: POST
- **URL**: /api/portfolios
- **Body**: Portfolio 对象（不含 id）
- **Response**: `{ id: string }`

#### Portfolio-04 编辑

- **Method**: PUT
- **URL**: /api/portfolios/{id}
- **Body**: Portfolio 对象（可变字段）
- **Response**: `{ success: true }`

#### Portfolio-05 删除

- **Method**: DELETE
- **URL**: /api/portfolios/{id}
- **Response**: `{ success: true }`


### 3.7 撮合需求 (MatchDemand)

#### MatchDemand-01 列表查询

- **Method**: GET
- **URL**: /api/matchdemands
- **Query**: page, size, sort, keyword, demandNo
- **Response**: `{ list: MatchDemand[], total, page, size }`

#### MatchDemand-02 详情查询

- **Method**: GET
- **URL**: /api/matchdemands/{id}
- **Response**: MatchDemand 对象

#### MatchDemand-03 新增

- **Method**: POST
- **URL**: /api/matchdemands
- **Body**: MatchDemand 对象（不含 id）
- **Response**: `{ id: string }`

#### MatchDemand-04 编辑

- **Method**: PUT
- **URL**: /api/matchdemands/{id}
- **Body**: MatchDemand 对象（可变字段）
- **Response**: `{ success: true }`

#### MatchDemand-05 删除

- **Method**: DELETE
- **URL**: /api/matchdemands/{id}
- **Response**: `{ success: true }`

#### MatchDemand-06 状态转换

- **Method**: POST
- **URL**: /api/matchdemands/{id}/transition
- **Body**: `{ to: string, reason: string }`
- **Response**: `{ success: true }`


---

## 4. 错误码定义

| HTTP 状态码 | 业务码 | 含义 | 处理建议 |
|------------|--------|------|---------|
| 200 | 0 | 成功 | - |
| 400 | 10001 | 参数错误 | 前端表单校验 |
| 401 | 10002 | 未登录 | 重定向到登录页 |
| 403 | 10003 | 无权限 | 提示无权限 |
| 404 | 10004 | 资源不存在 | 提示并返回列表 |
| 422 | 10005 | 业务校验失败 | 显示具体错误信息 |
| 429 | 10006 | 请求过于频繁 | 提示稍后重试 |
| 500 | 20001 | 系统错误 | 提示系统繁忙 + 上报日志 |
| 502 | 20002 | 网关错误 | 提示服务不可用 |
| 504 | 20003 | 网关超时 | 提示网络超时 + 重试 |

---

## 5. 鉴权方式

### 5.1 登录

- **POST /api/auth/login**
- **Body**: `{ username, password }`
- **Response**: `{ token, refreshToken, user }`

### 5.2 Token 刷新

- **POST /api/auth/refresh**
- **Body**: `{ refreshToken }`
- **Response**: `{ token, refreshToken }`

### 5.3 退出

- **POST /api/auth/logout**

---

## 6. Mock 数据方案

| 阶段 | 方案 |
|------|------|
| 前端开发 | 本地 Mock（Mock.js / MSW） |
| 联调 | 后端提供 Swagger 文档 + Mock 服务 |
| 测试 | 测试环境真实接口 |

Mock 数据需覆盖：专利资产、估值记录、年费记录、质押登记、转让请求、专利组合、撮合需求 等 7 个实体的列表/详情/新增/编辑/删除场景。



---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-08-30T00:54:23.756Z）
