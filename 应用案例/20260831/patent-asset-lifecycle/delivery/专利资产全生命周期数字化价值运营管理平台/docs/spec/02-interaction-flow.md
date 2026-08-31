# 02 - 交互流程 (技术规格)

> 本文档定义系统的主要交互流程，覆盖核心业务场景的前后端协作时序。

---

## 1. 文档说明

本文档基于需求模型推导主要交互流程，使用 Mermaid 时序图描述前后端协作。

---

## 2. 通用列表页交互流程

以 patent-ledger为例，描述 CRUD 列表页的标准交互：

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
    API->>DB: UPDATE status ACTIVE->EXPIRING
    API-->>V: { success }
    V-->>U: 专利资产 ACTIVE -> EXPIRING（距离年费到期日不超过30天且尚未缴费）
    U->>V: 触发: 逾期未缴自动置为失效
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status EXPIRING->EXPIRED
    API-->>V: { success }
    V-->>U: 专利资产 EXPIRING -> EXPIRED（超过年费到期日仍未缴纳）
    U->>V: 触发: 质押登记完成
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status ACTIVE->PLEDGED
    API-->>V: { success }
    V-->>U: 专利资产 ACTIVE -> PLEDGED（）
    U->>V: 触发: 解除质押
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status PLEDGED->ACTIVE
    API-->>V: { success }
    V-->>U: 专利资产 PLEDGED -> ACTIVE（）
    U->>V: 触发: 发起转让
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status ACTIVE->TRANSFERRING
    API-->>V: { success }
    V-->>U: 专利资产 ACTIVE -> TRANSFERRING（专利未处于质押中）
    U->>V: 触发: 转让成交
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status TRANSFERRING->TRANSFERRED
    API-->>V: { success }
    V-->>U: 专利资产 TRANSFERRING -> TRANSFERRED（）
    U->>V: 触发: 转让取消
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status TRANSFERRING->ACTIVE
    API-->>V: { success }
    V-->>U: 专利资产 TRANSFERRING -> ACTIVE（）
```

### 3.2 估值记录 状态流转

```mermaid
sequenceDiagram
    actor U as 用户
    participant V as 前端
    participant API as 后端
    participant DB as 数据库
    U->>V: 触发: 资产经理确认
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status PENDING->CONFIRMED
    API-->>V: { success }
    V-->>U: 估值记录 PENDING -> CONFIRMED（）
    U->>V: 触发: 驳回重估
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status PENDING->REJECTED
    API-->>V: { success }
    V-->>U: 估值记录 PENDING -> REJECTED（）
```

### 3.3 年费记录 状态流转

```mermaid
sequenceDiagram
    actor U as 用户
    participant V as 前端
    participant API as 后端
    participant DB as 数据库
    U->>V: 触发: 进入缴费窗口期
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status UPCOMING->PENDING
    API-->>V: { success }
    V-->>U: 年费记录 UPCOMING -> PENDING（）
    U->>V: 触发: 缴费登记
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status PENDING->PAID
    API-->>V: { success }
    V-->>U: 年费记录 PENDING -> PAID（）
    U->>V: 触发: 逾期未缴
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status PENDING->OVERDUE
    API-->>V: { success }
    V-->>U: 年费记录 PENDING -> OVERDUE（）
```

### 3.4 质押登记 状态流转

```mermaid
sequenceDiagram
    actor U as 用户
    participant V as 前端
    participant API as 后端
    participant DB as 数据库
    U->>V: 触发: 解除质押
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status ACTIVE->RELEASED
    API-->>V: { success }
    V-->>U: 质押登记 ACTIVE -> RELEASED（）
```

### 3.5 转让请求 状态流转

```mermaid
sequenceDiagram
    actor U as 用户
    participant V as 前端
    participant API as 后端
    participant DB as 数据库
    U->>V: 触发: 提交审核
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status DRAFT->REVIEWING
    API-->>V: { success }
    V-->>U: 转让请求 DRAFT -> REVIEWING（）
    U->>V: 触发: 审核成交
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status REVIEWING->DONE
    API-->>V: { success }
    V-->>U: 转让请求 REVIEWING -> DONE（）
    U->>V: 触发: 取消转让
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status REVIEWING->CANCELLED
    API-->>V: { success }
    V-->>U: 转让请求 REVIEWING -> CANCELLED（）
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

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-08-30T00:54:23.748Z）
