# 02 - 交互流程 (技术规格)

> 本文档定义系统的主要交互流程，覆盖核心业务场景的前后端协作时序。

---

## 1. 文档说明

本文档基于需求模型推导主要交互流程，使用 Mermaid 时序图描述前后端协作。

---

## 2. 通用列表页交互流程

以 monitor-dashboard为例，描述 CRUD 列表页的标准交互：

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


### 3.1 侵权线索 状态流转

```mermaid
sequenceDiagram
    actor U as 用户
    participant V as 前端
    participant API as 后端
    participant DB as 数据库
    U->>V: 触发: 一键存证
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status PENDING_EVIDENCE->EVIDENCED
    API-->>V: { success }
    V-->>U: 侵权线索 PENDING_EVIDENCE -> EVIDENCED（命中后 24 小时内完成区块链存证）
    U->>V: 触发: 超时失效
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status PENDING_EVIDENCE->EXPIRED
    API-->>V: { success }
    V-->>U: 侵权线索 PENDING_EVIDENCE -> EXPIRED（超过存证截止时间仍未完成存证）
    U->>V: 触发: 发起立案
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status EVIDENCED->FILED
    API-->>V: { success }
    V-->>U: 侵权线索 EVIDENCED -> FILED（同一卖家同一专利无在办案件）
    U->>V: 触发: 判定忽略
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status PENDING_EVIDENCE->IGNORED
    API-->>V: { success }
    V-->>U: 侵权线索 PENDING_EVIDENCE -> IGNORED（分析师复核为不侵权或重复线索）
```

### 3.2 存证记录 状态流转

```mermaid
sequenceDiagram
    actor U as 用户
    participant V as 前端
    participant API as 后端
    participant DB as 数据库
    U->>V: 触发: 上链成功
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status CHAINING->ON_CHAIN
    API-->>V: { success }
    V-->>U: 存证记录 CHAINING -> ON_CHAIN（区块链网络返回存证哈希与时间戳）
    U->>V: 触发: 存证失败
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status CHAINING->INVALID
    API-->>V: { success }
    V-->>U: 存证记录 CHAINING -> INVALID（上链超时或证据文件缺失）
```

### 3.3 维权案件 状态流转

```mermaid
sequenceDiagram
    actor U as 用户
    participant V as 前端
    participant API as 后端
    participant DB as 数据库
    U->>V: 触发: 启动处置
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status PENDING->PROCESSING
    API-->>V: { success }
    V-->>U: 维权案件 PENDING -> PROCESSING（已选定处置策略且跨境案件已绑定当地规则模板）
    U->>V: 触发: 平台受理
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status PROCESSING->ACCEPTED
    API-->>V: { success }
    V-->>U: 维权案件 PROCESSING -> ACCEPTED（平台返回受理回执）
    U->>V: 触发: 结案归档
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status ACCEPTED->CLOSED
    API-->>V: { success }
    V-->>U: 维权案件 ACCEPTED -> CLOSED（侵权商品已下架或达成和解）
    U->>V: 触发: 平台驳回
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status PROCESSING->REJECTED
    API-->>V: { success }
    V-->>U: 维权案件 PROCESSING -> REJECTED（证据不足或权利不稳定）
    U->>V: 触发: 补充证据重启
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status REJECTED->PROCESSING
    API-->>V: { success }
    V-->>U: 维权案件 REJECTED -> PROCESSING（补充存证后重新提交）
```

### 3.4 跨境规则模板 状态流转

```mermaid
sequenceDiagram
    actor U as 用户
    participant V as 前端
    participant API as 后端
    participant DB as 数据库
    U->>V: 触发: 停用规则
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status ENABLED->DISABLED
    API-->>V: { success }
    V-->>U: 跨境规则模板 ENABLED -> DISABLED（平台投诉渠道变更或规则过期）
    U->>V: 触发: 启用规则
    V->>API: POST /api/xxx/{id}/transition
    API->>DB: UPDATE status DISABLED->ENABLED
    API-->>V: { success }
    V-->>U: 跨境规则模板 DISABLED -> ENABLED（规则内容复核通过）
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

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-08-29T15:52:07.046Z）
