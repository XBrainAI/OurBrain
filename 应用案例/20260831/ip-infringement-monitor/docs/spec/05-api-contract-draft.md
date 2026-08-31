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


### 3.1 侵权线索 (InfringementLead)

#### InfringementLead-01 列表查询

- **Method**: GET
- **URL**: /api/infringementleads
- **Query**: page, size, sort, keyword, leadNo
- **Response**: `{ list: InfringementLead[], total, page, size }`

#### InfringementLead-02 详情查询

- **Method**: GET
- **URL**: /api/infringementleads/{id}
- **Response**: InfringementLead 对象

#### InfringementLead-03 新增

- **Method**: POST
- **URL**: /api/infringementleads
- **Body**: InfringementLead 对象（不含 id）
- **Response**: `{ id: string }`

#### InfringementLead-04 编辑

- **Method**: PUT
- **URL**: /api/infringementleads/{id}
- **Body**: InfringementLead 对象（可变字段）
- **Response**: `{ success: true }`

#### InfringementLead-05 删除

- **Method**: DELETE
- **URL**: /api/infringementleads/{id}
- **Response**: `{ success: true }`

#### InfringementLead-06 状态转换

- **Method**: POST
- **URL**: /api/infringementleads/{id}/transition
- **Body**: `{ to: string, reason: string }`
- **Response**: `{ success: true }`


### 3.2 存证记录 (EvidenceRecord)

#### EvidenceRecord-01 列表查询

- **Method**: GET
- **URL**: /api/evidencerecords
- **Query**: page, size, sort, keyword, evidenceNo
- **Response**: `{ list: EvidenceRecord[], total, page, size }`

#### EvidenceRecord-02 详情查询

- **Method**: GET
- **URL**: /api/evidencerecords/{id}
- **Response**: EvidenceRecord 对象

#### EvidenceRecord-03 新增

- **Method**: POST
- **URL**: /api/evidencerecords
- **Body**: EvidenceRecord 对象（不含 id）
- **Response**: `{ id: string }`

#### EvidenceRecord-04 编辑

- **Method**: PUT
- **URL**: /api/evidencerecords/{id}
- **Body**: EvidenceRecord 对象（可变字段）
- **Response**: `{ success: true }`

#### EvidenceRecord-05 删除

- **Method**: DELETE
- **URL**: /api/evidencerecords/{id}
- **Response**: `{ success: true }`

#### EvidenceRecord-06 状态转换

- **Method**: POST
- **URL**: /api/evidencerecords/{id}/transition
- **Body**: `{ to: string, reason: string }`
- **Response**: `{ success: true }`


### 3.3 维权案件 (RightsCase)

#### RightsCase-01 列表查询

- **Method**: GET
- **URL**: /api/rightscases
- **Query**: page, size, sort, keyword, caseNo
- **Response**: `{ list: RightsCase[], total, page, size }`

#### RightsCase-02 详情查询

- **Method**: GET
- **URL**: /api/rightscases/{id}
- **Response**: RightsCase 对象

#### RightsCase-03 新增

- **Method**: POST
- **URL**: /api/rightscases
- **Body**: RightsCase 对象（不含 id）
- **Response**: `{ id: string }`

#### RightsCase-04 编辑

- **Method**: PUT
- **URL**: /api/rightscases/{id}
- **Body**: RightsCase 对象（可变字段）
- **Response**: `{ success: true }`

#### RightsCase-05 删除

- **Method**: DELETE
- **URL**: /api/rightscases/{id}
- **Response**: `{ success: true }`

#### RightsCase-06 状态转换

- **Method**: POST
- **URL**: /api/rightscases/{id}/transition
- **Body**: `{ to: string, reason: string }`
- **Response**: `{ success: true }`


### 3.4 跨境规则模板 (CrossBorderRule)

#### CrossBorderRule-01 列表查询

- **Method**: GET
- **URL**: /api/crossborderrules
- **Query**: page, size, sort, keyword, ruleCode
- **Response**: `{ list: CrossBorderRule[], total, page, size }`

#### CrossBorderRule-02 详情查询

- **Method**: GET
- **URL**: /api/crossborderrules/{id}
- **Response**: CrossBorderRule 对象

#### CrossBorderRule-03 新增

- **Method**: POST
- **URL**: /api/crossborderrules
- **Body**: CrossBorderRule 对象（不含 id）
- **Response**: `{ id: string }`

#### CrossBorderRule-04 编辑

- **Method**: PUT
- **URL**: /api/crossborderrules/{id}
- **Body**: CrossBorderRule 对象（可变字段）
- **Response**: `{ success: true }`

#### CrossBorderRule-05 删除

- **Method**: DELETE
- **URL**: /api/crossborderrules/{id}
- **Response**: `{ success: true }`

#### CrossBorderRule-06 状态转换

- **Method**: POST
- **URL**: /api/crossborderrules/{id}/transition
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

Mock 数据需覆盖：侵权线索、存证记录、维权案件、跨境规则模板 等 4 个实体的列表/详情/新增/编辑/删除场景。



---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-08-29T15:52:07.061Z）
