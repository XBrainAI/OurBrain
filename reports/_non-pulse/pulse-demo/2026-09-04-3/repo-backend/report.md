# repo-backend 风险评估报告（第 4 期 · 2026-09-04）

## 1. 概览
- 仓库：repo-backend（tests/env/repo-backend，本地分析路径 tests/env/repo-backend；未配置远程，fetch 不适用，基于本地数据分析；工作副本检出 main，与 main_branch 一致，口径无差异）
- 关注分支：main、develop、feature-payment（主干：main）
- 分析窗口：2026-08-28 ~ 2026-09-04（window_days=7，运行时刻 2026-09-04 22:22；本期为同日第三次重跑（第 2 期 21:17 / 第 3 期 21:41 / 本期 22:22），按 RUNBOOK §5.1 归档于 `reports/2026-09-04-3/`）
- 总分：51.7 / 100，等级：**高**
- 关键数字：窗口期 22 次提交（张伟 21 + 李娜 1，活跃作者 2 人，上期 1 人）、+1660/−159 行；**李娜回归**——连续两期零提交后于 23:30 提交支付验签初版（156ac8d），M1 三大代码缺口闭合 2 个（验签、网关配置化），但 `_request` 仍返回 mock、联调未开始、明日（09-05）到期；M3 真实数据源 1/18 → **2/18** 且公共基类 ReportBase 就绪（b73b622）；feature-payment 落后 26（持平）、存活 30 天但**已重新激活**；develop 落后 18（持平）、领先 8；TODO 28 个持平；1 个大提交（6e7c103，仍在窗口）

## 2. 量化指标与解读

### 2.1 提交活动
| 指标 | 数值 | 来源 |
|---|---|---|
| 窗口期提交数 | 22（main 14 + develop 7 + feature-payment 1，跨分支按 hash 去重） | `git log <branch> --since="7 days ago"` 计数 |
| 新增行 / 删除行 | +1660 / −159 | `git log --numstat` 聚合（main +260/−14，develop +1374/−138，feature-payment +26/−7） |
| 大提交数 | 1 | 判定：6e7c103 文件数 18 > big_commit_files(15) 且增删行 1116 > big_commit_lines(800) |

解读：提交数较上期 20 → 22（↑），活跃作者 1 → 2（↑，本窗口期最重要的人员结构变化）。增量全部来自上期运行（21:41）之后的两个深夜新提交：feature-payment 上 **156ac8d（23:30，李娜）支付回调验签初版实现与网关地址配置化（+26/−7）** 与 develop 上 **b73b622（23:50，张伟）新增报表公共基类 + report_2 迁移真实数据源（+96/−13）**。结构上：feature-payment 分支窗口期首次出现提交（上期为 0）；剔除 6e7c103 模板批量提交后实质新增 544 行（上期 422 行）。M1 核心路径 25 天来首次有实质改动——上期"表面活跃、核心停滞"结论本期**解除**（证据见第 3 节）。

### 2.2 成员进度
| 作者 | 提交数 | 新增行 | 删除行 | 分支分布 | 环比 |
|---|---|---|---|---|---|
| 张伟 zhangwei@team.com | 21 | 1634 | 152 | main（14）、develop（7） | 上期 20 次，本期 21 次（↑，23:50 仍在提交） |
| 李娜 lina@team.com | 1 | 26 | 7 | feature-payment（1） | 上期 0 次，本期**回归**——连续两期零提交后，于 M1 截止前夜（23:30）提交验签初版 |
| 王强 wangqiang@team.com | 0 | 0 | 0 | — | 持续零提交（活跃在 repo-frontend，属计划分工，见该仓库报告） |

判定：
- **负载不均衡成立（持续）**：top1（张伟）提交占比 21/22 = 95.5% > single_contributor_share_warn(0.6)，增删行占比 1634/1660 = 98.4%（交叉验证成立）；较上期 100% 略降，因李娜回归。
- **活跃骤降：无**。上期唯一活跃成员张伟提交量 20 → 21（略升）；李娜由零提交转为 1 次提交，属恢复而非骤降。
- **分支分布异常：显著缓解**。李娜上期连续两期完全沉寂（单点断裂常态化），本期打破沉寂回归 feature-payment——但仅 1 次提交且出现在截止前夜，交付连续性尚未证实（定性保守判断）。
- 团队规模信号：活跃作者 1 → 2（↑）。

### 2.3 分支健康
| 分支 | 领先主干 | 落后主干 | 存活天数 | 最后活跃 | 判定 |
|---|---|---|---|---|---|
| main | 不适用 | 不适用 | 不适用 | 2026-09-04 23:00（c7a0f21） | 主干，每日有提交，健康 |
| develop | 8 | 18 | 15（分叉点 2026-08-20） | 2026-09-04 23:50（b73b622） | 未达阈值（存活 15 < 21、落后 18 < 20）；落后 18 与上期持平（上期由 17 恶化至 18 后停止），仍逼近 branch_behind_warn(20)；领先 7 → 8（M3 新增基类提交）；M3 截止 09-08，合并前需先消化主干 18 个提交 |
| feature-payment | 4 | **26** | **30**（分叉点 2026-08-05） | **2026-09-04 23:30（156ac8d）** | **长期未合并分支成立**（存活 30 > branch_stale_days(21) 且落后 26 > branch_behind_warn(20)，两项同时命中）；但与上期三点关键差异：落后 26 → 26 **停止扩大**、分支 25 天来**重新激活**（上期最后活跃 2026-08-10）、领先 3 → 4（新提交） |

- **热点文件冲突信号成立（持续）**：`src/api/orders.py` 窗口期被 main（7 个提交）与 develop（d820c8e）两个分支改动（2 ≥ hot_file_branches_warn(2)）。`git diff --stat main develop -- src/api/orders.py` 仍为 3 insertions / 125 deletions（与上期完全一致）——develop 缺失 main 的 125 行逻辑（查询接口/状态机/分页修复/BOM 导出等），金额精度修复在 main(11114f2) 与 develop(d820c8e) 的重复实现未收敛。
- **偏差趋势（对照上期）：首次停止扩大**。feature-payment 落后 25→26（上期）→26（本期，持平）、develop 落后 17→18（上期）→18（本期，持平）——两分支落后数均不再增长（因主干自 23:00 后无新提交，且两分支自身均有前进）。上期"偏差均在恶化，无一收敛"的局面改变。
- 僵尸分支候选：**不再适用**——feature-payment 最后活跃为今日 23:30（上期为 25 天前，距 30 天僵尸线仅差 5 天）。

### 2.4 质量信号
| 信号 | 数值 | 阈值 | 判定 | 来源 |
|---|---|---|---|---|
| TODO/FIXME 总数 | 28 | todo_fixme_warn=20 | **超标**（与上期持平：25 个集中于 src/legacy/payments_old.py 留档文件；orders.py/models.py/helpers.py 各 1） | Select-String 统计 |
| 返工比（删/增） | 159/1660 = 0.10 | rework_ratio_warn=0.5 | 未超标 | numstat 聚合 |
| 超大文件 | 0 个 | large_file_lines=1500 | 无（工作副本 17 个 .py 共 669 行，最大文件远低于阈值） | 文件行数统计 |

TODO 对照上期 28 → 28（持平，未清理也未增长）。注意：25 个 TODO 位于 2024 年旧支付实现留档文件（属已知待清理债）；feature-payment 分支 src/payments/ 现存 **9 处 TODO/FIXME**（工作副本未检出该分支，不计入 28）——156ac8d 消除了其中 2 处（"网关地址写死""回调验签尚未实现"），同时保留/新增"时间戳防重放校验待补充""签名算法待确认是否切换 RSA2"等待办（见第 4 节）。

## 3. 项目文档关联分析

映射依据：项目计划.md §2 里程碑表与 §3 团队分工（"李娜：支付模块唯一负责人，对应 repo-backend 的 src/payments/ 目录与 feature-payment 分支，负责支付网关对接、签名验签与异步回调处理"；"张伟：…兼报表模块（develop 分支，里程碑 M3）"）+ 需求清单.md R1~R6 的关联模块列。

| 计划条目（文档名 + 摘录） | 负责人 | 截止 | 对应模块 | 窗口期提交证据 | 状态判断 |
|---|---|---|---|---|---|
| M1 支付模块开发与联调（项目计划.md 里程碑表；需求清单.md R2"对接微信等渠道，含请求签名、回调验签与退款"） | 李娜 | **2026-09-05（明日，不足 1 天）** | feature-payment 分支 / src/payments/ | **156ac8d（23:30）：verify_callback 验签初版（HMAC-SHA256）+ 网关地址配置化**——分支 25 天来首次提交 | **延期风险（严重，但形态改变）**：上期"沉默延期"（零响应）转为"截止前夜的部分交付"。三大代码缺口闭合 2 个：①验签已实现初版（原 return True）②网关地址已配置化（原硬编码）；但 ③`_request` 仍返回 mock 应答（真实网关联调未开始，docstring 注明"待沙箱开通"）、回调未接订单服务、防重放未做、退款超额未拦截——**M1 定义为"开发与联调"，联调 0%，明日交付不可能**，延期不可避免 |
| M3 后端报表模块（项目计划.md；需求清单.md R4"18 类运营月报的批量生成与导出"） | 张伟 | 2026-09-08（剩 4 天） | develop 分支 / src/modules/ | 7 次提交：8f5e366 数据模型、6e7c103 批量生成 18 文件、d820c8e fix、0f61efe 精简引擎、8c2320c report_1 真实数据源（上期已计入）、008beab wip 标注、**b73b622（23:50）新增 ReportBase 公共基类 + report_2 迁移真实数据源** | **已推进且加速**：真实数据源覆盖率 1/18 → **2/18**（report_1、report_2），且公共基类就绪（正是上期建议的"公共查询模块抽取"，基类 docstring 明确"后续 report_3 ~ report_18 迁移时按此基类逐个改造"）；但剩余 **16 个文件仍为无标注的假数据**（深度阅读见第 4 节），距截止 4 天，剩余量仍大 |
| M4 订单接口性能优化（项目计划.md；需求清单.md R5"列表分页与连接池调优，目标 P95<200ms"） | 张伟 | 2026-09-12 | src/api/orders.py、src/db/ | 1ec427f 连接池调优、97acb9d 分页越界修复、49a787d 统计聚合接口、c7a0f21（23:00）导出分页默认值 200→100 | 已推进（多项实质改动，节奏正常；与上期相同，无新增） |
| R1 订单查询与导出（需求清单.md，P0） | 张伟 | — | src/api/orders.py | 79ee940 查询接口、bc5103b 状态筛选、0d56883 批量导出、930573e 导出编码修复、c7a0f21 分页参数调整 | 已推进（持续打磨） |
| R6 用户中心（需求清单.md，P2） | 张伟 | — | src/api/users.py | 0d84d9c 邮箱校验修复、6ef2aeb 参数校验单测（+49 行） | 已推进（含测试同步） |

**"表面活跃、核心停滞"结论：本期解除。** 上期该结论依据"M1 核心路径（feature-payment 分支、src/payments/）窗口期零改动"——本期 156ac8d 直接改动 src/payments/gateway.py（+26/−7），核心路径 25 天来首次有实质推进（验签初版属真实实现而非占位，见第 4 节深读）。按 §2.4，progress 的定性基础由"计划核心停滞"转为"核心里程碑临期、联调缺失"。

另：项目计划.md §4 协作约定"里程碑临近截止（剩余 3 天）仍未具备联调条件时，负责人需在周会上明确升级风险"——M1 剩余不足 1 天且联调条件不具备（沙箱未开通、mock 应答），风险升级义务已连续多期应触发而未触发（无升级记录）；本期李娜的回归提交是仓库内首个响应迹象。

## 4. 深度代码评估

（按第 3 章优先级组织；本期重点：上期运行（21:41）之后 23:00 以来的两个深夜新提交——李娜 156ac8d（23:30）与张伟 b73b622（23:50）——及其对上期风险点的演变取证）

- [深夜新提交·李娜回归] **[实现质量（正向）+ 技术债]** 156ac8d（23:30，feature-payment）是 M1 三大代码缺口中两项的实质修复：
  - `repo-backend@156ac8d src/payments/gateway.py —— verify_callback 由直接 return True 改为 HMAC-SHA256 验签：_callback_sign 对 body 按 key 排序拼接后取 HMAC-SHA256 摘要，verify_callback 取 X-Signature 头，无签名返回 False，比对使用 hmac.compare_digest（常量时间比较，防时序攻击）`——实现方式专业；
  - `repo-backend@156ac8d src/payments/gateway.py —— 网关地址由硬编码 "https://sandbox-pay.example.com" 改为 GATEWAY_CONFIG 按环境变量 PAY_GATEWAY_URL 注入（缺省回退沙箱），回调密钥按 PAY_CALLBACK_KEY 注入（缺省复用 app_secret），消除上期 TODO"网关地址目前写死在代码里"`；
  - **剩余缺口（第三项未闭合）**：`repo-backend@156ac8d src/payments/gateway.py —— _request 仍返回 {"code":0,...,"mock":True} 占位应答，docstring 注明"真实网关联调待沙箱开通"；新留 TODO"时间戳防重放校验待补充"`；`repo-backend@feature-payment:src/payments/callbacks.py —— TODO"订单服务尚未就绪，M1 联调阶段临时只打日志"仍在，支付成功不驱动订单状态`。
- [深夜新提交·报表基类] **[实现质量（正向）+ 技术债（偿还中）]** b73b622（23:50，develop）落地了上期建议的"公共查询模块抽取"：`repo-backend@b73b622 src/modules/report_base.py —— 新增 ReportBase 基类（子类声明 SNAPSHOT_PREFIX/DIMENSION_COLUMN/METRIC_COLUMN 即可复用 _previous_period/_month_bounds/_query_snapshot/load_rows 全套真实数据查询流程，_query_snapshot 经 src.db.models.get_conn() 取连接与接口吻合），docstring 明确"后续 report_3 ~ report_18 迁移时按此基类逐个改造"`；`repo-backend@b73b622 src/modules/report_2.py —— TrafficReport(ReportBase) 以 METRIC_COLUMN="visits"（流量口径聚合访问量而非订单金额，领域适配正确）接入 traffic_snapshot 真实查询，export_csv 由伪造环比（本期值,本期值,0）改为真实 (value, prev_value, calc_growth)，calc_growth 含上期为 0 的除零保护；008beab"wip"标注的"占位假数据"TODO 已消除`。
- [核心模块抽查] **[隐藏进度问题（持续）]** 其余报表文件现状（develop 逐一核验）：`repo-backend@develop:src/modules/report_3.py —— load_rows 仍返回 {"dimension": "channel-{0}".format(i % 5), "value": 100 * i} 硬编码假数据，且无任何 TODO 标注`；report_18 同构（report_3 ~ report_18 共 16 个文件）。M3 真实数据源覆盖率 2/18（11.1%），距 09-08 截止剩 4 天。
- [热点文件] **[集成冲突风险（持续）]** `git diff --stat main develop -- src/api/orders.py` 仍为 3 insertions / 125 deletions（与上期完全一致）：develop 缺失 main 的 125 行逻辑；金额精度修复在 main(11114f2, 08-26) 与 develop(d820c8e, 09-01) 的重复实现未收敛，M3 合并（09-08 前）冲突面不变。
- [异常定向] **[测试缺失（加重）]** `git ls-tree feature-payment tests/` 与 `git ls-tree develop tests/` 输出均为空——两条深夜新提交（验签 26 行安全关键代码、报表基类 64 行）**均无对应测试**；窗口期测试改动仍仅 main 上 6ef2aeb（+49 行，用户接口）。verify_callback 属支付安全核心（伪造/篡改/重放回调直接资损），零测试属高危缺口。
- [异常定向] **[技术债（分支待办演变）]** feature-payment 分支 src/payments/ 现存 9 处 TODO/FIXME：156ac8d 消除 2 处（网关地址写死、验签未实现），保留/新增 `gateway.py —— "签名算法待确认是否切换 RSA2（当前为 HMAC-SHA256）""时间戳防重放校验待补充"`；`gateway.py —— "amount 未做分/元单位校验""FIXME: 部分退款超过剩余可退金额时未拦截，依赖网关侧兜底""查询接口需要加本地缓存"`；`callbacks.py —— "回调日志仅内存存储，重启即丢"` 等仍在。
- [大提交] **[技术债（偿还中）]** 6e7c103（09-02，仍在窗口）一次性生成 18 个 report_N.py 同构模板（18 文件 +1116 行，双阈值命中）；后继偿还持续：0f61efe 精简引擎、8c2320c 迁移 report_1、b73b622 抽取基类并迁移 report_2——已完成 2/18 迁移 + 批量改造路径就绪。
- [异常定向] **[技术债（主干残留，持续）]** 上期识别的 wip 占位代码仍在主干：`repo-backend@23dc50a src/api/orders.py —— build_order_timeline 带 TODO"时间线聚合待补充完整实现，先占位联调"，返回空 events 列表，后续提交未清理`。
- [核心模块] **[实现质量（正向，持续）]** 主干订单/用户模块质量良好（上期已验证，本期窗口未变）：状态机合法迁移表（52b89fd）、CSV 导出 BOM 修复（930573e）、用户接口单测（6ef2aeb）。

## 5. 风险评分

### 5.1 五维得分
| 维度 | 得分 | 权重 | 加权分 | 主要依据 |
|---|---|---|---|---|
| progress | 64 | 30 | 19.2 | M1（P0）明日（09-05）截止且联调 0%（_request 仍 mock、回调未接订单服务、防重放未做）→ 完整交付延期不可避免（严重单项持续）；但上期两大恶化因素反转：李娜回归、三大代码缺口闭合 2 个，"表面活跃、核心停滞"解除；M3 加速（2/18 + 基类就绪，批量路径明确）；M4/R1/R6 正常（对冲） |
| people | 56 | 20 | 11.2 | 李娜回归打破"单点断裂常态化"（上期最严重人员信号），活跃作者 1→2；但负载不均衡仍成立（95.5% > 60%，增删行占比 98.4%）；张伟过载持续（23:50 仍在提交，独自承担 main+develop 双线与 M3/M4/R1/R6）；李娜回归仅 1 次提交且在截止前夜，M1 仍单人负责、交付连续性未证实 |
| quality | 45 | 20 | 9.0 | TODO 28 > 20（持平未清理）；16/18 报表文件仍无标注假数据（但 2/18 已迁移 + 基类就绪，趋势好转）；**验签等新增安全关键代码零测试**（加重项）；wip 占位仍在主干；大提交 1（模板债，偿还中）；返工比 0.10、无超大文件、两条深夜新提交实现质量良好（对冲） |
| integration | 52 | 15 | 7.8 | 长期未合并分支仍成立（feature-payment 存活 30>21 且落后 26>20，双阈值命中）；但偏差**首次停止扩大**（落后 26→26、develop 18→18，上期均在恶化）且分支重新激活（今日 23:30 有提交）；orders.py 125 行差异与重复修复未收敛（持续）；develop 落后 18 逼近阈值且 09-08 前需合并 |
| convention | 30 | 15 | 4.5 | 过短 message 占比 25% → 22.7%（5/22 < 阈值 30%，回落）；无意义 message 4 条均为存量（wip×2、upd、fix），本期**无新增**——两条深夜新提交 message 均规范且信息量充分；wip 占位代码仍留主干（存量未清理） |

### 5.2 总分与等级
总分 = Σ(维度分×权重)/100 = (64×30 + 56×20 + 45×20 + 52×15 + 30×15)/100 = 5170/100 = **51.7**，等级：**高**

### 5.3 风险点清单
| 风险点 | 维度 | 等级 | 证据 | 建议 |
|---|---|---|---|---|
| M1 支付模块明日（09-05）截止，联调仍未开始（_request 仍返回 mock、回调未接订单服务、防重放未做），延期不可避免 | progress | 严重 | `repo-backend@156ac8d src/payments/gateway.py —— _request 仍返回 {"mock": True}（docstring"真实网关联调待沙箱开通"）`；`callbacks.py:38 "订单服务尚未就绪，M1 联调阶段临时只打日志"`；项目计划.md M1 定义为"开发与**联调**"，截止 2026-09-05 | 09-05 周会按"分段交付"定案：代码项（验签初版/网关配置化）先行验收，联调项以网关沙箱开通为前置条件重排期并同步需求方；沙箱申请状态写入文档 |
| M1 仍由李娜单人负责，回归仅 1 次提交（截止前夜），交付连续性未证实 | people | 高 | shortlog：窗口期李娜 1 次 vs 张伟 21 次；项目计划.md"李娜：支付模块唯一负责人"；此前连续两期零提交 | 09-05 站会当面确认在岗状态与后续排期；指定支付模块第二责任人；回归后连续 3 日每日同步进度，若再中断立即启动接管预案 |
| feature-payment 长期未合并（落后 26 > 20、存活 30 > 21 天，双阈值命中），虽已重新激活但 26 提交偏差未消化 | integration | 高 | `rev-list --count feature-payment..main` = 26 > branch_behind_warn(20)；merge-base 2026-08-05 → 存活 30 天 > branch_stale_days(21)；新提交 156ac8d 使分支重新激活（上期最后活跃 08-10） | 立即 main→feature-payment 反向同步消化 26 提交；验签代码（26 行安全关键改动）尽早合入主干评审，避免长期只在分支可见 |
| M3 报表真实数据源 2/18，剩余 16 个文件仍为无标注假数据，距 09-08 截止剩 4 天 | quality | 高 | `repo-backend@develop:src/modules/report_3.py —— load_rows 仍返回 channel-N 硬编码假数据且无 TODO 标注`（report_3~18 共 16 个）；b73b622 已就绪 ReportBase 基类待批量迁移 | 按基类每日 ≥5 个文件迁移（09-05~09-07 三日完成 16 个）；每个文件迁移后跑一次端到端导出验证；09-08 当日只做合并不做新迁移 |
| 热点文件 orders.py 双分支 125 行差异 + 同一金额缺陷重复修复，M3 合并冲突风险未收敛 | integration | 高 | `git diff --stat main develop -- src/api/orders.py` = 3+/125−（与上期一致）；金额精度修复在 main(11114f2) 与 develop(d820c8e) 重复实现 | M3 合并（09-08 前）先做 develop←main 反向同步；建立"主干修复同步到开发分支"约定 |
| TODO 28 超阈值持平未清理；验签等新增安全关键代码零测试 | quality | 中 | Select-String 统计 28 > todo_fixme_warn(20)（payments_old.py 25 处）；`git ls-tree feature-payment tests/` 为空——verify_callback 无任何测试 | 为 verify_callback 补"签名缺失/伪造签名/篡改 body/防重放"四类用例（优先级最高）；legacy/payments_old.py 清理纳入 M1 收尾 |
| 无意义 message 4 条存量未清理，wip 占位代码仍留主干 | convention | 中 | 23dc50a"wip"（占位函数入主干）、008beab"wip"、fba5ad4"upd"、d820c8e"fix"；过短占比 22.7% < 30%（回落）；本期两条新提交 message 规范 | message 统一"类型(模块): 动机"格式；wip 限制在个人分支；23dc50a 占位函数补实现或移除 |

### 5.4 针对性建议
1. （对应 M1 延期）09-05 周会将 M1 拆为"代码项 + 联调项"两段：代码项（验签初版、网关配置化）当场验收并确认李娜后续排期；联调项以沙箱开通为前置条件定新截止日，同步需求方与前端（R2 为 P0 需求）。
2. （对应李娜单点）指定支付模块第二责任人（建议张伟或外部支持）；李娜回归后连续 3 日站会同步，若再中断立即执行接管预案（验签已初版化，接管成本较上期显著降低）。
3. （对应 M3 收尾）按"基类已就绪 → 每日 ≥5 个文件迁移 → 09-07 完成 16 个 → 09-08 只做合并"推进；迁移前先做 develop←main 反向同步（当前落后 18 提交、orders.py 差异 125 行）。
4. （对应验签测试）为 verify_callback 编写签名缺失/伪造/篡改/重放四类用例——这是本期新增的最高优先级测试缺口。
5. （对应分支偏差）feature-payment 反向同步后，将验签代码合入主干评审；develop 合并前完成 orders.py 差异收敛。
6. （对应 TODO 与规范）legacy 清理写入 M1 收尾任务；message 规范化与 wip 占位清理随日常提交进行。

## 6. 趋势对比
| 指标 | 上期（2026-09-04 21:41，第 3 期） | 本期 | 变化 | 方向判断 |
|---|---|---|---|---|
| 提交数 | 20 | 22 | ↑ | 好转：增量来自李娜回归提交 + 张伟报表基类提交 |
| 活跃作者数 | 1 | 2 | ↑ | **好转：李娜回归**（连续两期零提交后首次提交） |
| 新增行 / 删除行 | 1538 / 139 | 1660 / 159 | ↑ / ↑ | 持平略升：剔除模板提交后实质新增 544 行（上期 422） |
| 大提交 | 1 | 1 | → | 同一提交（6e7c103）仍在窗口；偿还推进中（2/18 已迁移 + 基类） |
| TODO 数 | 28 | 28 | → | 持平（超标未清理，未增长） |
| feature-payment 落后主干 | 26 | 26 | → | **停止扩大**（上期 25→26 恶化）；分支重新激活（最后活跃 08-10 → 今日 23:30） |
| develop 落后主干 | 18 | 18 | → | 持平（上期 17→18 恶化后停止）；领先 7 → 8 |
| progress / people / quality / integration / convention | 72 / 68 / 48 / 57 / 32 | 64 / 56 / 45 / 52 / 30 | ↓/↓/↓/↓/↓ | 五维全部回落：李娜回归（人员、进度）、M3 加速（进度、质量）、偏差停止扩大（集成）、规范占比回落 |
| 总分 | 58.2（高） | 51.7（高） | ↓6.5 | **好转（幅度显著）**：李娜回归 + M1 两缺口闭合 + M3 2/18 与基类 + 偏差停止扩大；但 M1 明日到期联调未开始，延期不可避免，仍处"高" |

## 附录：采集证据摘录（关键数字溯源）

1. 提交数与增删行：`git -C tests/env/repo-backend log main --since="7 days ago" --numstat ...` → main 14 个 COMMIT 块合计 +260/−14；develop 7 块 +1374/−138；feature-payment 1 块 +26/−7。跨分支 hash 无重叠，仓库级 22 / +1660 / −159。
2. 作者聚合：`git shortlog -sne main --since="7 days ago"` → `14 张伟 <zhangwei@team.com>`；develop → `7 张伟`；feature-payment → `1 李娜 <lina@team.com>`（本期新增，上期为空）。top1 占比 21/22 = 95.5% > 0.6。
3. 分支位置：`git rev-list --count main..develop` = 8、`develop..main` = 18、merge-base cc9dcfe（2026-08-20，存活 15 天）；`main..feature-payment` = 4、`feature-payment..main` = 26、merge-base a09b30e（2026-08-05，存活 30 天）；feature-payment 最后提交 156ac8d（2026-09-04 23:30）；develop 最后提交 b73b622（2026-09-04 23:50）；main 最后提交 c7a0f21（2026-09-04 23:00）。判定式：30 > branch_stale_days(21) 且 26 > branch_behind_warn(20)。
4. 大提交：6e7c103 → 18 files changed, 1116 insertions(+)，18 > big_commit_files(15) 且 1116 > big_commit_lines(800)（上期已判定，仍在 7 天窗口内）。
5. TODO：Select-String 统计 28（payments_old.py 25、helpers.py 1、orders.py 1、models.py 1），28 > todo_fixme_warn(20)；上期值取自 state/history.md 第 3 期行（28）。分支另计：`git grep -n -E "TODO|FIXME" feature-payment -- src/payments/` → 9 处（callbacks.py 2、gateway.py 4、wechat_channel.py 2 等）。
6. 热点文件：main 窗口期 name-only 清单含 src/api/orders.py（7 次提交触及），develop 清单含 src/api/orders.py（d820c8e），2 分支 ≥ hot_file_branches_warn(2)；`git diff --stat main develop -- src/api/orders.py` → 3 insertions / 125 deletions。
7. 深夜新提交深读：`git show 156ac8d`（gateway.py +26/−7：GATEWAY_CONFIG 环境变量注入、_callback_sign HMAC-SHA256、verify_callback 常量时间比较、_request 仍 mock）；`git show b73b622`（report_base.py 新增 +64、report_2.py +32/−13：TrafficReport 子类接入 traffic_snapshot、calc_growth 除零保护、伪造环比移除）；`git show develop:src/modules/report_3.py` 与 `report_18.py`（仍为 channel-N 硬编码假数据）。
8. 规范：message 长度程序化测量（`$s.Length`），过短（<10 字符）5/22 = 22.7% < short_message_ratio_warn(30%)：23dc50a"wip"(3)、6451d29"新增请求日志中间件"(9)、fba5ad4"upd"(3)、008beab"wip"(3)、d820c8e"fix"(3)；无意义清单为其中 4 条（wip×2、upd、fix），均为存量。
9. 测试：`git ls-tree --name-only feature-payment tests/` 输出为空、`git ls-tree --name-only develop tests/` 输出为空；窗口期测试改动仅 main 上 tests/test_users.py（6ef2aeb）。
10. 基线数值（提交数 20 / 作者 1 / 1538 / 139 / 大提交 1 / TODO 28 / 五维 72/68/48/57/32 / 总分 58.2 / feature-payment 落后 26 / develop 落后 18）均取自 state/history.md 第 3 期（2026-09-04 21:41）。

### 偏差与说明（RUNBOOK 留痕要求）
1. 仓库未配置远程（`git remote` 输出为空），§1.1 的 fetch 步骤不适用，基于本地数据分析。
2. **同日重跑（第三次）**：第 2 期（21:17）、第 3 期（21:41）与本期（22:22）为同一自然日，按 RUNBOOK §5.1 归档于 `reports/2026-09-04-3/`；存活天数类指标同日不跨日（feature-payment 存活仍为 30 天、develop 仍为 15 天）。
3. **提交时间戳晚于运行时刻**：本期运行时刻 22:22，而 c7a0f21 标注 23:00、156ac8d 标注 23:30、b73b622 标注 23:50——系测试种子数据的时钟设定（与上期 21:38 运行含 22:00/22:40 提交同因）；各提交均落在分析窗口内，按数据原样纳入统计与深读。
4. 王强在本仓库零提交的定性：其活跃全部在 repo-frontend，属计划分工（项目计划.md §3）而非人员流失，不计入"活跃骤降"，与上期口径一致。
