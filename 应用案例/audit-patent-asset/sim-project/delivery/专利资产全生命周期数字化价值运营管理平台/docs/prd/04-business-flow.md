# 04 - 业务流程

> 本文档描述系统的任务流（Task Flow）、数据流（Data Flow）、页面流（Page Flow）、主流程、分支流程、异常流程及状态流转规则。

> 模板版本：v5.7  |  章节契约：与 04-business-flow.md 模板严格对齐

---

## Task Flow（任务流，BPMN 2.0）

> **业界标准**：BPMN 2.0（Business Process Model and Notation）
> **关注点**：用户完成业务任务的操作步骤序列，按角色分 Pool/Lane。
> **图例**：`(( ))` 事件 / `( )` 任务 / `{ }` 网关 / 实线=Sequence Flow / 虚线=Message Flow

### BPMN 任务流图

```mermaid
flowchart TD
    Start((用户登录))
    subgraph Pool1["企业IPR"]
        Pool1_T1("浏览专利资产")
        Pool1_T2("查看专利资产详情")
        Pool1_T1 --> Pool1_G1{"通过?"}
        Pool1_G1 -->|是| Pool1_T2
        Pool1_G1 -->|否| Pool1_End((结束))
        Pool1_T3("新增/编辑专利资产")
        Pool1_T2 --> Pool1_G2{"通过?"}
        Pool1_G2 -->|是| Pool1_T3
        Pool1_G2 -->|否| Pool1_End((结束))
        Pool1_T4("查看看板")
        Pool1_T3 --> Pool1_G3{"通过?"}
        Pool1_G3 -->|是| Pool1_T4
        Pool1_G3 -->|否| Pool1_End((结束))
        Pool1_T4 --> Pool1_Done((任务完成))
    end
    subgraph Pool2["资产经理"]
        Pool2_T1("执行业务操作")
    end
    subgraph Pool3["银行风控"]
        Pool3_T1("执行业务操作")
    end
    Start --> Pool1_T1
    Pool1_Done -.->|交付专利资产| Pool2_T1
    Pool2_Done -.->|交付| Pool3_T1
    Pool3_Done --> End((业务完成))
```

### 角色任务清单（BPMN Pool/Lane 视角）

| 角色 (Pool) | 任务 (Task) | 触发条件 | 关联页面 | 关联实体 | 交付物 |
|------|------|----------|----------|---------|--------|
| 企业IPR | 浏览专利资产 | 登录后进入工作台 | 专利资产列表页(patent-asset-list) | 专利资产 | 业务数据 |
| 资产经理 | 执行业务操作 | 登录后进入工作台 | - | 专利资产 | 业务数据 |
| 银行风控 | 执行业务操作 | 登录后进入工作台 | - | - | 业务数据 |

### BPMN 元素说明

| 元素类型 | 图例 | 含义 |
|---------|------|------|
| Start Event | `(( ))` 圆形 | 流程起始点（如用户登录） |
| End Event | `(( ))` 双圆 | 流程结束点（如任务完成） |
| Task | `( )` 圆角矩形 | 用户执行的具体业务任务 |
| Gateway (XOR) | `{ }` 菱形 | 排他网关，二选一决策点 |
| Intermediate Event | `{{ }}` 六边形 | 中间事件，如状态流转 |
| Sequence Flow | `-->` 实线箭头 | 同 Pool 内的任务流转 |
| Message Flow | `-.->` 虚线箭头 | 跨 Pool 的消息/数据交付 |
| Pool/Lane | `subgraph` | 角色泳道，划分职责边界 |


---

## Data Flow（数据流，DFD Yourdon-DeMarco）

> **业界标准**：DFD（Data Flow Diagram，Yourdon-DeMarco notation）
> **关注点**：数据在系统各模块/角色间的流动路径，含数据归属与操作权限。
> **图例**：`[ ]` 外部实体 / `( )` 处理过程 / `[[ ]]` 数据存储 / 箭头标签=数据流内容

### Level 0 - 上下文图（Context Diagram）

```mermaid
flowchart LR
    System((本系统<br/>专利资产全生命周期数字化价值运营管理平台))
    Ext1["企业IPR"]
    Ext2["资产经理"]
    Ext3["银行风控"]
    Ext1 -->|专利资产数据| System
    System -.->|查询结果/反馈| Ext1
    Ext2 -->|专利资产数据| System
    System -.->|查询结果/反馈| Ext2
    Ext3 -->|业务请求| System
    System -.->|查询结果/反馈| Ext3
```

### Level 1 - 数据流分解图

```mermaid
flowchart LR
    DS1[["专利资产<br/>字段: patent_no, title, value_estimate, annual_fee_due..."]]
    P1("新增资产<br/>(专利资产)")
    P2("查看资产<br/>(专利资产)")
    P3("标记质押<br/>(专利资产)")
    P4("解除质押<br/>(专利资产)")
    P5("提交估值<br/>(专利资产)")
    P6("AI 估值建议<br/>(专利资产)")
    P7("切换时间范围<br/>(专利资产)")
    Ext1["企业IPR"]
    Ext2["资产经理"]
    Ext3["银行风控"]
    Ext1 -->|create 专利资产| P1
    Ext2 -->|create 专利资产| P1
    P1 -->|写入| DS1
    P1 -.->|查询结果| Ext1
    P1 -.->|查询结果| Ext2
    P1 -.->|查询结果| Ext3
    Ext1 -->|view 专利资产| P2
    Ext2 -->|view 专利资产| P2
    DS1 -->|读取| P2
    P2 -.->|查询结果| Ext1
    P2 -.->|查询结果| Ext2
    P2 -.->|查询结果| Ext3
    Ext1 -->|update 专利资产| P3
    Ext2 -->|update 专利资产| P3
    P3 -->|写入| DS1
    P3 -.->|查询结果| Ext1
    P3 -.->|查询结果| Ext2
    P3 -.->|查询结果| Ext3
    Ext1 -->|update 专利资产| P4
    Ext2 -->|update 专利资产| P4
    P4 -->|写入| DS1
    P4 -.->|查询结果| Ext1
    P4 -.->|查询结果| Ext2
    P4 -.->|查询结果| Ext3
    Ext1 -->|save 专利资产| P5
    Ext2 -->|save 专利资产| P5
    P5 -->|写入| DS1
    P5 -.->|查询结果| Ext1
    P5 -.->|查询结果| Ext2
    P5 -.->|查询结果| Ext3
    Ext1 -->|update 专利资产| P6
    Ext2 -->|update 专利资产| P6
    P6 -->|写入| DS1
    P6 -.->|查询结果| Ext1
    P6 -.->|查询结果| Ext2
    P6 -.->|查询结果| Ext3
    Ext1 -->|update 专利资产| P7
    Ext2 -->|update 专利资产| P7
    P7 -->|写入| DS1
    P7 -.->|查询结果| Ext1
    P7 -.->|查询结果| Ext2
    P7 -.->|查询结果| Ext3
```

### 实体数据归属矩阵

| 实体 | 所有者角色 | 可读角色 | 可写角色 | 数据流向 | 主键字段 | 关键字段 |
|------|------------|----------|----------|----------|---------|---------|
| 专利资产 | 企业IPR | 企业IPR/资产经理/银行风控 | 企业IPR/资产经理 | 企业IPR → [专利资产] → 企业IPR | id | patent_no, title, value_estimate |

### DFD 元素说明

| 元素类型 | 图例 | 含义 |
|---------|------|------|
| External Entity | `[ ]` 矩形 | 系统外部数据来源/去向（角色） |
| Process | `( )` 圆角矩形 | 系统内的处理过程（页面操作） |
| Data Store | `[[ ]]` 双线 | 数据存储（实体表） |
| Data Flow | `-->\|label\|` 带标签箭头 | 数据流向，标签为数据内容 |
| Read Flow | `-.->` 虚线 | 读取/反馈数据流 |
| Write Flow | `-->` 实线 | 写入/提交数据流 |

### 数据流层级说明

- **Level 0 - Context Diagram**：将整个系统视为单一 Process，展示外部实体与系统的交互边界
- **Level 1 - 数据流分解图**：将系统分解为多个 Process（页面操作），展示 Process 与 Data Store（实体）的数据交互
- **建议进一步分解**：复杂 Process 可继续分解为 Level 2 / Level 3 DFD


---

## Page Flow（页面流，UI Flow Diagram）

> **业界标准**：UI Flow Diagram（用户界面流程图）
> **关注点**：页面间的跳转关系，含路由、跳转条件与决策分支。
> **图例**：`(( ))` 起止节点 / `[ ]` 页面 / `{ }` 决策点 / 实线=跳转 / 虚线=返回

### UI Flow 页面跳转图

```mermaid
flowchart TD
    Start((用户登录))
    P01["专利资产列表页(patent-asset-list)<br/>/patent-assets"]
    P02["专利资产详情页(patent-asset-detail)<br/>/patent-assets/:id"]
    P03["专利资产表单页(patent-asset-evaluate)<br/>/patent-assets/:id/evaluate"]
    P04["仪表盘页(asset-dashboard)<br/>/patent-assets/dashboard"]
    Start --> P01
    P01 --> P01_D{"用户操作?"}
    P01_D -->|查看详情| P02
    P01_D -->|新建| P03
    P02 -->|"标记质押"按钮| P03
    P03 -->|提交按钮| P04
    P04 -.->|返回主页| P01
    P02 -.->|返回列表| P01
    P01 -->|退出登录| Exit((退出系统))
```

### 路由表与跳转条件

| 源页面 | 目标页面 | 触发条件 | 传参 | 权限要求 | 跳转类型 |
|--------|----------|----------|------|----------|---------|
| 登录页 | 专利资产列表页(patent-asset-list) | 用户登录成功 | userId | 已认证 | 路由跳转 |
| 专利资产列表页(patent-asset-list) | 专利资产详情页(patent-asset-detail) | 点击新增按钮 | patent-asset | 已认证 | 路由跳转 |
| 专利资产详情页(patent-asset-detail) | 专利资产表单页(patent-asset-evaluate) | 点击"标记质押"按钮 | patent-asset | 已认证 | 路由跳转 |
| 专利资产表单页(patent-asset-evaluate) | 仪表盘页(asset-dashboard) | 点击提交按钮 | patent-asset | 已认证 | 路由跳转 |
| 仪表盘页(asset-dashboard) | 专利资产列表页(patent-asset-list) | 点击返回/面包屑 | - | 已认证 | 返回 |

### UI Flow 元素说明

| 元素类型 | 图例 | 含义 |
|---------|------|------|
| Terminator | `(( ))` 圆形 | 流程起始/终止点（如登录、退出） |
| Screen | `[ ]` 矩形 | 系统页面，含路由信息 |
| Decision | `{ }` 菱形 | 用户操作决策点（如查看 vs 新建） |
| Action | `-->\|label\|` 实线箭头 | 用户操作触发的页面跳转 |
| Back Navigation | `-.->\|label\|` 虚线箭头 | 返回上一页或主页 |
| Modal/Drawer | `subgraph` | 弹窗/抽屉式叠加层 |

### 跳转模式说明

- **列表 → 详情**：用户在列表页点击行项目，跳转到详情页查看完整信息
- **列表 → 表单**：用户在列表页点击"新建"按钮，跳转到表单页录入数据
- **详情 → 列表**：用户在详情页点击"返回"，回到列表页
- **任意页 → 主页**：用户点击面包屑或 Logo，返回主页
- **退出登录**：用户点击退出按钮，终止会话


---

## 主流程（业务流程）

> 系统的核心业务流程，端到端的操作序列。

### ASCII 流程图

```ascii
[登录] --> [浏览专利资产]
  |
  v
[查看专利资产详情]
  |
  v
[新增/编辑专利资产]
  |
  v
[查看看板]
  |
  v
[完成]
```

### Mermaid 流程图

```mermaid
graph TD
    N1[用户登录] --> N2[浏览专利资产]
    N2 --> D1{需要查看专利资产详情?}
    D1 -->|是| N3[查看专利资产详情]
    D1 -->|否| END[完成]
    N3 --> D2{需要新增/编辑专利资产?}
    D2 -->|是| N4[新增/编辑专利资产]
    D2 -->|否| END[完成]
    N4 --> D3{需要查看看板?}
    D3 -->|是| N5[查看看板]
    D3 -->|否| END[完成]
    N5 --> END[完成]
```

### 主流程步骤说明

**步骤 1：浏览专利资产**
- 页面 ID：P01
- 页面类型：CRUD 列表页
- 关联实体：专利资产
- 路由：/patent-assets


**步骤 2：查看专利资产详情**
- 页面 ID：P02
- 页面类型：详情页
- 关联实体：专利资产
- 路由：/patent-assets/:id


**步骤 3：新增/编辑专利资产**
- 页面 ID：P03
- 页面类型：表单页
- 关联实体：专利资产
- 路由：/patent-assets/:id/evaluate


**步骤 4：查看看板**
- 页面 ID：P04
- 页面类型：仪表盘页
- 关联实体：专利资产
- 路由：/patent-assets/dashboard


---

## 分支流程

### 分支一：数据查询分支

```mermaid
graph TD
    N1[列表页] --> D1{是否找到数据?}
    D1 -->|是| N2[展示详情]
    D1 -->|否| N3[显示空状态]
```

---

## 异常流程

| 异常场景 | 触发条件 | 处理方式 | 提示信息 |
|----------|----------|----------|----------|
| 数据加载失败 | 网络异常或接口超时 | 显示错误状态页，提供重试按钮 | 数据加载失败，请重试 |
| 权限不足 | 用户访问无权限页面或操作 | 路由守卫拦截，跳转 403 页面 | 您无权访问该页面 |
| 数据校验失败 | 表单提交字段不合规 | 表单内联显示校验错误 | 请检查输入内容 |
| 数据不存在 | 访问已删除/不存在的记录 | 显示 404 空状态页 | 该记录不存在或已删除 |
| 并发冲突 | 多人同时编辑同一记录 | 提交时检测版本冲突，提示刷新 | 数据已被他人修改，请刷新后重试 |

---

## 状态流转

| 实体 | 当前状态 | 允许转换到 | 触发操作 | 触发条件 |
|------|----------|------------|----------|----------|
| - | - | - | - | - |

### 各实体状态枚举

- **专利资产**：有效 / 失效 / 质押中 / 已转让

> 状态字典定义请参见 `status-dictionary.yaml`（由实体状态枚举自动推导）。


---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-07-21T10:12:23.182Z）
