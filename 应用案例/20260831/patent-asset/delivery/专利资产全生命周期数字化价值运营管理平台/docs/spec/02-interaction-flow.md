# 02 - 交互流程 (技术规格)

> 本文档定义系统的主要交互流程，覆盖核心业务场景的前后端协作时序。

---

## 1. 文档说明

本文档基于需求模型推导主要交互流程，使用 Mermaid 时序图描述前后端协作。

---

## 2. 通用列表页交互流程

以 executive-dashboard为例，描述 CRUD 列表页的标准交互：

```mermaid
sequenceDiagram
    actor U as 用户
    participant V as 前端页面
    participant API as 后端 API
    participant DB as 数据库
    U->>V: 访问列表页
    V->>API: GET /api/xxx?page=1&size=20
    API->>DB: SELECT ... LIMIT
    DB-->>API: 数据集
    API-->>V: { list, total }
    V-->>U: 渲染表格 + 分页器
    U->>V: 输入搜索条件
    V->>API: GET /api/xxx?keyword=...
    API->>DB: WHERE ... LIKE
    DB-->>API: 过滤数据
    API-->>V: { list, total }
    V-->>U: 重新渲染表格
    U->>V: 点击新增
    V-->>U: 弹出表单弹窗
    U->>V: 填写表单并提交
    V->>API: POST /api/xxx
    API->>DB: INSERT
    DB-->>API: 新增 ID
    API-->>V: { success, id }
    V-->>U: 提示成功 + 刷新列表
```

---

## 3. 状态流转交互流程


### 3.1 专利资产 状态流转

```mermaid
sequenceDiagram
    actor U as 用户
    participant V as 前端
    participant API as 后端
    participant DB as 数据库
    U->>V: 触发: 年费到期前30天自动预警
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status ACTIVE->FEE_WARNING
    API-->>V: { success }
    V-->>U: 专利资产 ACTIVE -> FEE_WARNING（系统自动检测 feeDueDate 距今 30 天内）
    U->>V: 触发: 缴纳年费
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status FEE_WARNING->ACTIVE
    API-->>V: { success }
    V-->>U: 专利资产 FEE_WARNING -> ACTIVE（年费到账登记）
    U->>V: 触发: 逾期未缴自动失效
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status FEE_WARNING->EXPIRED
    API-->>V: { success }
    V-->>U: 专利资产 FEE_WARNING -> EXPIRED（超过年费截止日仍未缴纳）
    U->>V: 触发: 补缴年费并恢复
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status EXPIRED->ACTIVE
    API-->>V: { success }
    V-->>U: 专利资产 EXPIRED -> ACTIVE（资产经理审批通过）
```

### 3.2 估值记录 状态流转

```mermaid
sequenceDiagram
    actor U as 用户
    participant V as 前端
    participant API as 后端
    participant DB as 数据库
    U->>V: 触发: 资产经理确认估值
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status PENDING->CONFIRMED
    API-->>V: { success }
    V-->>U: 估值记录 PENDING -> CONFIRMED（每季度估值需确认后生效）
```

### 3.3 质押转让记录 状态流转

```mermaid
sequenceDiagram
    actor U as 用户
    participant V as 前端
    participant API as 后端
    participant DB as 数据库
    U->>V: 触发: 审批通过生效
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status IN_REVIEW->ACTIVE
    API-->>V: { success }
    V-->>U: 质押转让记录 IN_REVIEW -> ACTIVE（质押登记/转让审批）
    U->>V: 触发: 解除质押
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status ACTIVE->RELEASED
    API-->>V: { success }
    V-->>U: 质押转让记录 ACTIVE -> RELEASED（仅质押登记且生效中）
    U->>V: 触发: 转让交割完成
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status ACTIVE->COMPLETED
    API-->>V: { success }
    V-->>U: 质押转让记录 ACTIVE -> COMPLETED（仅专利转让且生效中）
```

### 3.4 撮合意向 状态流转

```mermaid
sequenceDiagram
    actor U as 用户
    participant V as 前端
    participant API as 后端
    participant DB as 数据库
    U->>V: 触发: 推进尽调
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status CONTACT->DUE_DILIGENCE
    API-->>V: { success }
    V-->>U: 撮合意向 CONTACT -> DUE_DILIGENCE（顺序推进）
    U->>V: 触发: 签署意向书
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status DUE_DILIGENCE->SIGNED
    API-->>V: { success }
    V-->>U: 撮合意向 DUE_DILIGENCE -> SIGNED（顺序推进）
    U->>V: 触发: 确认成交
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status SIGNED->DEAL
    API-->>V: { success }
    V-->>U: 撮合意向 SIGNED -> DEAL（顺序推进）
    U->>V: 触发: 搁置
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status SIGNED->PAUSED
    API-->>V: { success }
    V-->>U: 撮合意向 SIGNED -> PAUSED（终态）
```
---

## 4. 权限校验流程

```mermaid
sequenceDiagram
    actor U as 用户
    participant V as 前端路由
    participant G as 全局守卫
    participant API as 后端 API
    U->>V: 访问页面 /xxx
    V->>G: 路由守卫触发
    G->>G: 检查登录状态
    alt 未登录
        G-->>U: 重定向到登录页
    else 已登录
        G->>G: 检查角色权限
        alt 无权限
            G-->>U: 重定向到 403 页面
        else 有权限
            G-->>V: 放行
            V->>API: 请求业务数据
            API-->>V: 数据
            V-->>U: 渲染页面
        end
    end
```

---

## 5. 异常处理流程

```mermaid
sequenceDiagram
    actor U as 用户
    participant V as 前端
    participant API as 后端
    U->>V: 操作
    V->>API: 请求
    alt 网络异常
        API-->>V: 超时/无响应
        V-->>U: 提示网络异常 + 重试按钮
    else 业务错误
        API-->>V: 4xx + 错误信息
        V-->>U: 表单内联提示 / Toast
    else 系统错误
        API-->>V: 5xx
        V-->>U: 系统繁忙提示 + 上报日志
    else 成功
        API-->>V: 2xx
        V-->>U: 成功反馈 + 刷新数据
    end
```



---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-08-28T16:41:57.842Z）
