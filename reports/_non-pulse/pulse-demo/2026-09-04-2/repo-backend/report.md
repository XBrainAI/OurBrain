# repo-backend 风险评估报告（第 3 期 · 2026-09-04）

## 1. 概览
- 仓库：repo-backend（tests/env/repo-backend，本地分析路径 tests/env/repo-backend；未配置远程，fetch 不适用，基于本地数据分析；工作副本检出 main，与 main_branch 一致，口径无差异）
- 关注分支：main、develop、feature-payment（主干：main）
- 分析窗口：2026-08-28 ~ 2026-09-04（window_days=7，运行时刻 2026-09-04 21:38；本期与上期（同日 21:17）为同日重跑，按 RUNBOOK §5.1 归档于 `reports/2026-09-04-2/`）
- 总分：58.2 / 100，等级：**高**
- 关键数字：窗口期 20 次提交（全部张伟，1 名活跃作者，与上期持平）、+1538/−139 行；feature-payment 零提交、落后主干 26 提交（上期 25）、存活 30 天、最后活跃 08-10（25 天前）；TODO 28 个（阈值 20，与上期持平）；1 个大提交（6e7c103，18 文件 +1116 行）；M1（支付模块，李娜，截止 09-05）明日到期且已停滞 25 天、零响应；上期识别的 M3"假数据"问题晚间出现实质修复开端（8c2320c 修复 report_1，但仅 1/18）

## 2. 量化指标与解读

### 2.1 提交活动
| 指标 | 数值 | 来源 |
|---|---|---|
| 窗口期提交数 | 20（main 14 + develop 6，跨分支按 hash 去重；feature-payment 0） | `git log <branch> --since="7 days ago"` 计数 |
| 新增行 / 删除行 | +1538 / −139 | `git log --numstat` 聚合（main +260/−14，develop +1278/−125） |
| 大提交数 | 1 | 判定：6e7c103 文件数 18 > big_commit_files(15) 且增删行 1116 > big_commit_lines(800) |

解读：提交数较上期 17 → 20（↑），新增行 1476 → 1538。表面活跃度继续上升，但结构与上期相同：+1116 行（占 72.6%）仍来自 6e7c103 单个模板批量生成提交（该提交 09-02 落盘，仍在本期 7 天窗口内），剔除后实质新增 422 行；全部提交仍集中于张伟一人。与上期的增量变化全部来自今日晚间（21:17 之后）的 3 个新提交：main 上 c7a0f21（23:00，config 参数调整 +1/−1）、develop 上 8c2320c（22:00，report_1 真实数据源 +60/−9）与 008beab（22:40，"wip"，report_2 加 TODO +1/−0）——其中 8c2320c 是 M3 假数据问题的第一个实质修复。M1 核心模块（src/payments/、feature-payment）窗口期零改动，"表面活跃、核心停滞"继续成立（证据见第 3、4 节）。

### 2.2 成员进度
| 作者 | 提交数 | 新增行 | 删除行 | 分支分布 | 环比 |
|---|---|---|---|---|---|
| 张伟 zhangwei@team.com | 20 | 1538 | 139 | main（14）、develop（6） | 上期 17 次，本期 20 次（↑，晚间仍在提交） |
| 李娜 lina@team.com | 0 | 0 | 0 | — | 上期（第 2 期）已零提交，本期**持续零提交（连续第二期）**，负责的 M1 明日截止 |
| 王强 wangqiang@team.com | 0 | 0 | 0 | — | 上期（第 2 期）后端零提交，本期持续零提交（活跃在 repo-frontend，属分工转移，见该仓库报告） |

判定：
- **负载不均衡成立（持续）**：top1（张伟）提交占比 20/20 = 100% > single_contributor_share_warn(0.6)，增删行占比同为 100%（交叉验证成立）。
- **活跃骤降（对照第 2 期基线）**：上期活跃成员仅张伟，本期无新消失成员；但李娜零提交已**连续两期**，由"单期骤降事件"固化为"持续缺席常态"，且其负责的 M1（唯一负责人）明日（09-05）截止——人员缺口的后果进入兑现期。
- 分支分布异常成立：李娜历史上仅 feature-payment + 少量 main 提交，连续两期（第 2、3 期）完全沉寂，符合"连续两期以上维持同一形态"的判定条件。
- 团队规模信号：活跃作者 1 → 1（→）。

### 2.3 分支健康
| 分支 | 领先主干 | 落后主干 | 存活天数 | 最后活跃 | 判定 |
|---|---|---|---|---|---|
| main | 不适用 | 不适用 | 不适用 | 2026-09-04 23:00（c7a0f21） | 主干，每日有提交（含晚间），健康 |
| develop | 7 | 18 | 15（分叉点 2026-08-20） | 2026-09-04 22:40（008beab） | 未达阈值（存活 15 < 21、落后 18 < 20）；但落后 18 已逼近 branch_behind_warn(20)（上期 17），且 M3 截止 09-08，合并前需先消化主干 18 个提交 |
| feature-payment | 3 | **26** | **30**（分叉点 2026-08-05） | **2026-08-10 15:00（25 天前）** | **长期未合并分支成立**：存活 30 > branch_stale_days(21) 且落后 26 > branch_behind_warn(20)，两项同时命中 |

- **热点文件冲突信号成立**：`src/api/orders.py` 窗口期被 main（7 个提交）与 develop（d820c8e）两个分支改动（2 ≥ hot_file_branches_warn(2)）。深度阅读确认冲突面较上期进一步扩大：main 的 orders.py 本期继续演化（BOM 导出修复、状态机合法迁移表、分页越界修复、统计接口等），`git diff --stat main develop -- src/api/orders.py` 显示 develop 相对 main 缺失 125 行逻辑（上期为 134 行差异中的主体部分）；且 develop 上 d820c8e 的金额分单位精度修复与 main 上李娜 08-26 的 11114f2 为同一缺陷的重复实现（本期已亲自 diff 双方验证，见第 4 节）。
- **偏差趋势（对照上期）**：feature-payment 落后 25 → 26（恶化，持续扩大）、存活 30 → 30 天（同日运行未跨日）；develop 落后 17 → 18（恶化，逼近阈值 20）、领先 5 → 7（M3 新增提交）。两分支偏差均在恶化，无一收敛。
- 僵尸分支候选：feature-payment 最后活跃距今天 25 天（未超 30 天），与上期判定相同（同日运行），暂不成立；若下期（09-05 之后）仍无活动则跨过 30 天线成立。

### 2.4 质量信号
| 信号 | 数值 | 阈值 | 判定 | 来源 |
|---|---|---|---|---|
| TODO/FIXME 总数 | 28 | todo_fixme_warn=20 | **超标**（与上期持平：25 个集中于 src/legacy/payments_old.py 留档文件；orders.py/models.py/helpers.py 各 1） | Select-String 统计 |
| 返工比（删/增） | 139/1538 = 0.09 | rework_ratio_warn=0.5 | 未超标 | numstat 聚合 |
| 超大文件 | 0 个 | large_file_lines=1500 | 无 | 工作副本 17 个 .py 共 669 行，最大文件未达阈值 |

TODO 对照上期 28 → 28（持平，未继续增长，也未清理）。注意：25 个 TODO 位于 2024 年旧支付实现留档文件（08-14 后未再改动），属已知待清理债；另有约 9 个 TODO/FIXME 位于 feature-payment 分支的 src/payments/（工作副本未检出，不计入 28，见第 4 节深度阅读），实际待办面更大。

## 3. 项目文档关联分析

映射依据：项目计划.md §2 里程碑表与 §3 团队分工（"李娜：支付模块唯一负责人，对应 repo-backend 的 src/payments/ 目录与 feature-payment 分支"；"张伟：…兼报表模块（develop 分支，里程碑 M3）"）+ 需求清单.md R1~R6 的关联模块列。

| 计划条目（文档名 + 摘录） | 负责人 | 截止 | 对应模块 | 窗口期提交证据 | 状态判断 |
|---|---|---|---|---|---|
| M1 支付模块开发与联调（项目计划.md 里程碑表；需求清单.md R2"对接微信等渠道，含请求签名、回调验签与退款"） | 李娜 | **2026-09-05（明日，不足 1 天）** | feature-payment 分支 / src/payments/ | **窗口期该分支与该目录零提交**；分支最后提交 b6a9014（08-10，微信渠道初版）；主干 src/payments/ 在工作副本中不存在 | **延期风险（严重）→ 延期已成定局**：明日到期，核心代码 25 天零推进且零响应迹象，验签未实现（verify_callback 仍直接 return True）、网关请求仍返回 mock 应答（证据见第 4 节） |
| M3 后端报表模块（项目计划.md；需求清单.md R4"18 类运营月报的批量生成与导出"） | 张伟 | 2026-09-08（剩 4 天） | develop 分支 / src/modules/ | 6 次提交：8f5e366 数据模型、6e7c103 批量生成 18 个报表文件、d820c8e fix、0f61efe 精简引擎、**8c2320c（晚间 22:00）report_1 接入真实数据源并修复环比**、008beab（晚间 22:40）report_2 加改造 TODO | **已推进，且上期识别的"假数据"问题出现实质缓解开端**：report_1 的 load_rows 已改为真实查询 order_snapshot 快照表（含上期值与真实环比计算）；但**仅 1/18 完成**，report_2 由 008beab 显式自认"仍为占位假数据"，report_3~18 共 16 个文件仍是无标注的沉默占位（深度阅读见第 4 节）。距截止 4 天，剩余改造量大 |
| M4 订单接口性能优化（项目计划.md；需求清单.md R5"列表分页与连接池调优，目标 P95<200ms"） | 张伟 | 2026-09-12 | src/api/orders.py、src/db/ | 1ec427f 连接池调优（models.py +14/−2，池满等待 2s 抛显式异常）、97acb9d 分页越界修复、49a787d 统计聚合接口、c7a0f21（晚间）导出分页默认值 200→100 | 已推进（连接池/分页/导出参数多项实质改动，节奏正常） |
| R1 订单查询与导出（需求清单.md，P0） | 张伟 | — | src/api/orders.py | 79ee940 查询接口、bc5103b 状态筛选、0d56883 批量导出、930573e 导出编码修复、c7a0f21（晚间）导出分页参数调整 | 已推进（查询/筛选/导出均已落地并持续打磨） |
| R6 用户中心（需求清单.md，P2） | 张伟 | — | src/api/users.py | 0d84d9c 邮箱校验修复、6ef2aeb 参数校验单测（+49 行） | 已推进（含测试同步） |

**"表面活跃、核心停滞"结论：成立（持续第二期）。** 整体活跃证据：仓库窗口期 20 次提交、+1538 行，高于上期；核心停滞证据：M1 核心路径（feature-payment 分支、src/payments/ 目录）窗口期零改动，且 M1 为 P0 需求、明日截止、负责人连续两期零提交。按 §2.4 判定方式，progress 以定性结论为准。

另：项目计划.md §4 协作约定要求"里程碑临近截止（剩余 3 天）仍未具备联调条件时，负责人需在周会上明确升级风险"。M1 明日到期且验签/mock 均未动，风险升级机制理应已触发，但仓库内仍无任何响应迹象（李娜零提交、无交接提交、主干无支付相关改动）——"沉默延期"由上期的推断变为既成事实。

## 4. 深度代码评估

（按第 3 章优先级组织；本期重点：窗口期新提交——尤其上期运行（21:17）之后的 3 个晚间提交——与上期风险点的演变取证）

- [晚间新提交] **[实现质量（正向）+ 隐藏进度问题]** 8c2320c（22:00，develop）是上期识别的 M3"假数据"问题的**第一个实质修复**：`repo-backend@8c2320c src/modules/report_1.py —— load_rows 由硬编码 channel-N 假数据改为 _query_snapshot 真实按月查询 order_snapshot 快照表（日期区间 + 按渠道分组聚合），并新增 _previous_period/_month_bounds/calc_growth，export_csv 的"上期值/环比"列由（本期值、本期值、0）伪造改为真实计算`。集成正确性已核对：`repo-backend@8c2320c src/modules/report_1.py —— sqlite3.connect(conn["path"]) 与 src/db/models.py get_conn() 返回的 {"engine","path"} 接口吻合`。但该修复**仅覆盖 report_1**，18 个报表文件中其余 17 个未动。
- [晚间新提交] **[规范 + 隐藏进度问题]** 008beab（22:40，develop）message 为"wip"，实际改动仅为给 report_2.py 加一行 TODO：`repo-backend@008beab src/modules/report_2.py —— 新增注释"TODO: load_rows 仍为占位假数据，待按 report_1 的改造方案接入 traffic_snapshot 真实查询"`——即以无意义 message 提交了一条"承认未修"的标注：修复方案存在（按 report_1 的改造），但尚未执行。
- [晚间新提交] **[隐藏进度问题（轻微）]** c7a0f21（23:00，main）为 config 微调：`repo-backend@c7a0f21 src/config.py —— export_page_size 默认值 200 → 100`。实质但轻微（R1/M4 外围参数）。
- [核心模块抽查] **[隐藏进度问题]** 其余报表文件现状（develop 检出内容逐一核验）：`repo-backend@develop:src/modules/report_3.py —— load_rows 仍返回 {"dimension": "channel-N", "value": 100*i} 硬编码假数据，export_csv 仍写（本期值、本期值、0）伪造环比，且无任何 TODO 标注`；report_2 见上一条（有 TODO 标注但仍假数据）。M3 真实数据源覆盖率 1/18（5.6%），距 09-08 截止剩 4 天。
- [大提交] **[技术债]** 6e7c103（09-02，仍在窗口）一次性生成 18 个 report_N.py 同构模板（各 62 行），属复制粘贴型技术债；其后继：0f61efe 已删除 engine.py 中 114 行未使用的模板 DSL 逻辑（`repo-backend@0f61efe src/modules/engine.py —— 精简为直接拼装的轻量渲染，移除模板 DSL 解析与过滤器机制`），8c2320c 修复 report_1——偿还动作已开始但未完成。
- [热点文件] **[集成冲突风险]** `repo-backend@d820c8e src/api/orders.py —— develop 上的"fix"将金额计算改为分单位（amount_cents）修复浮点误差，与 main 上李娜 08-26 的 11114f2"修复订单金额计算精度问题"为同一缺陷的重复实现（本期已 diff 双方确认代码一致）`；同时 develop 的 orders.py 相对 main 缺失 125 行（查询接口/状态机/分页修复/BOM 导出等均在 main），M3 合并（09-08 前）时冲突面大。
- [异常定向] **[实现质量 + 技术债]** 支付模块（feature-payment 分支，本期零变动，风险点持续）：`repo-backend@b6a9014 src/payments/gateway.py —— verify_callback 直接 return True，TODO 自认"回调验签尚未实现，当前直接信任请求体（联调前必须补上）"，另有 FIXME"未做时间戳防重放校验"`；`repo-backend@b6a9014 src/payments/gateway.py —— _request 为占位实现直接返回 {"mock": True}，真实网关对接未开始`；`repo-backend@b6a9014 src/payments/gateway.py —— 网关地址硬编码 "https://sandbox-pay.example.com"，TODO 自认"需改为按环境读取配置"`；`repo-backend@eaa7b91 src/payments/callbacks.py —— _on_paid 注释"订单服务尚未就绪，M1 联调阶段临时只打日志"，支付成功不驱动订单状态`。
- [异常定向] **[技术债（主干残留）]** 上期识别的 wip 占位代码仍在主干：`repo-backend@23dc50a src/api/orders.py —— build_order_timeline 带 TODO"时间线聚合待补充完整实现，先占位联调"，返回空 events 列表，52b89fd 等后续提交未清理`。
- [核心模块] **[实现质量（正向）]** 主干订单/用户模块质量持续良好：`repo-backend@52b89fd src/api/orders.py —— 状态机合法迁移表 _VALID_TRANSITIONS + assert_valid_transition 收敛任意状态互跳漏洞`；`repo-backend@930573e src/api/orders.py —— CSV 导出补 BOM 修复 Excel 中文乱码`；6ef2aeb 为用户接口补充 49 行单测。张伟名下改动质量健康，问题集中于"单人扛全部活跃里程碑"的组织性风险。
- [测试缺失] 报表模块 18 个文件零测试、支付模块零测试；窗口期测试改动仅 tests/test_users.py（6ef2aeb，+49 行）；52b89fd 状态机修复、8c2320c 环比修复均无对应测试改动。

## 5. 风险评分

### 5.1 五维得分
| 维度 | 得分 | 权重 | 加权分 | 主要依据 |
|---|---|---|---|---|
| progress | 72 | 30 | 21.6 | M1（P0）明日（09-05）截止且核心路径 25 天零推进、零响应 → 关键里程碑延期成定局（严重异常单项，较上期"明日截止"进一步坐实）；M3 数据源接入 1/18、距截止 4 天（部分缓解，但 17 个文件仍占位）；"表面活跃、核心停滞"持续第二期成立；M4/R1/R6 正常推进（对冲） |
| people | 68 | 20 | 13.6 | 活跃作者 1（连续两期）；李娜（M1 唯一负责人）连续第二期零提交，单点断裂由事件固化为常态且 M1 明日到期进入兑现期；负载不均衡 100% > 60%；张伟独自承担 main+develop 双线 + M3/M4/R1/R6 全部活跃（晚间 22:00~23:00 仍在提交，过载信号） |
| quality | 48 | 20 | 9.6 | TODO 28 > 20（持平未清理）；大提交 1 个且为占位模板代码；17/18 报表文件仍输出假数据（report_2 已自认）；wip 占位代码仍留在主干；报表/支付模块零测试；返工比 0.09、无超大文件、主干代码质量良好、8c2320c 修复质量良好（对冲） |
| integration | 57 | 15 | 8.55 | 长期未合并分支成立（feature-payment 存活 30>21 且落后 26>20，偏差 25→26 继续扩大）；develop 落后 17→18 逼近阈值且 09-08 前需合并；热点文件 orders.py 双分支改动持续 + 同一金额缺陷重复修复 + develop 缺失 main 125 行逻辑，冲突面大 |
| convention | 32 | 15 | 4.8 | 过短 message 5/20=25% 未超 30% 阈值但较上期（23.5%）上升；无意义 message 4 条（wip×2、upd、fix），本期新增 008beab"wip"（虽只加注释，可追溯性差）；上期"wip 占位代码入主干"问题未清理 |

### 5.2 总分与等级
总分 = Σ(维度分×权重)/100 = (72×30 + 68×20 + 48×20 + 57×15 + 32×15)/100 = 5815/100 = **58.2**，等级：**高**

### 5.3 风险点清单
| 风险点 | 维度 | 等级 | 证据 | 建议 |
|---|---|---|---|---|
| M1 支付模块明日（09-05）截止，feature-payment 已 25 天零提交、零响应，验签未实现、联调未开始，"沉默延期"已成事实 | progress | 严重 | 分支最后提交 b6a9014（2026-08-10）；`gateway.py verify_callback 直接 return True`；`_request 返回 {"mock": True}`；计划文档 M1 截止 2026-09-05；上期已建议升级但仓库内无任何响应 | 09-05 当日周会正式宣布 M1 延期并定新排期；同步决策李娜岗位（本人带回 / 张伟接管），接管先补 verify_callback 与真实网关对接；外部依赖（网关沙箱）状态文档化 |
| 李娜（支付唯一负责人）连续第二期零提交，单点断裂常态化 | people | 严重 | 第 2、3 期 shortlog 后端均仅张伟 1 人；计划文档"李娜：支付模块唯一负责人"；feature-payment 连续两期零提交 | 人工触达确认在岗状态（连续两期未响应）；支付模块补第二责任人并出交接文档；若确认不可用，按上期建议由张伟接管 |
| feature-payment 长期未合并且偏差继续扩大（落后 25→26，存活 30 天） | integration | 高 | `rev-list --count feature-payment..main` = 26 > branch_behind_warn(20)；merge-base 2026-08-05 → 存活 30 天 > 21；上期记录落后 25 | M1 延期决策后立即 main→feature-payment 同步消化 26 个提交偏差；若放弃本迭代则明确归档，避免跨过 30 天僵尸线 |
| M3 报表模块真实数据源仅 1/18，report_2~18 仍为假数据，距 09-08 截止剩 4 天 | quality | 高 | `report_3.py load_rows 返回硬编码 channel-N 假数据`（report_2 已有 TODO 自认）；`8c2320c 仅修复 report_1`；需求清单.md R4"18 类运营月报的批量生成与导出" | 09-05 起按 report_1 已验证的改造方案批量推进其余 17 个文件（每日 ≥5 个）；建议将 _query_snapshot/_previous_period 抽到公共模块消除 18 处复制粘贴；验收底线：至少一条报表端到端真实数据跑通 |
| 热点文件 orders.py 双分支分叉扩大 + 重复修复，develop 合并冲突风险积聚 | integration | 高 | `git diff --stat main develop -- src/api/orders.py` 差异 125 行；金额精度修复在 main(11114f2, 08-26) 与 develop(d820c8e, 09-01) 重复实现 | M3 合并（09-08 前）先做 develop←main 反向同步；建立"主干修复同步到开发分支"约定 |
| TODO 28 超阈值（持平未清理），legacy 留档 + 分支隐藏待办 | quality | 中 | Select-String 计数 28 > todo_fixme_warn(20)；上期 28（持平）；feature-payment 分支另有约 9 个 TODO 未计入 | M1 收尾时清理 legacy/payments_old.py（25 个 TODO）；分支上的验签/缓存/单位校验 TODO 纳入 M1 重排期清单 |
| 无意义 message 4 条（wip×2/upd/fix），新增 008beab"wip"提交一行 TODO 注释 | convention | 中 | 008beab"wip"（实为 report_2 加 TODO）、23dc50a"wip"（占位函数入主干）、fba5ad4"upd"、d820c8e"fix"（实为金额精度修复）；过短占比 23.5%→25% | message 采用"类型(模块): 动机"格式；wip 限制在个人分支；TODO 标注类微提交应写明"标注 report_2 待改造" |

### 5.4 针对性建议
1. （对应 M1 延期）明日（09-05）周会将 M1 升级为正式延期事项：当场完成"李娜状态确认 → 二选一决策（本人带回+新排期 / 张伟接管+交接清单）"，决策同步周会与需求方。
2. （对应李娜单点）连续两期零提交应触发管理动作：指定支付模块第二责任人；把"网关沙箱联调排期"外部依赖状态写入文档。
3. （对应 M3 收尾）按"公共查询模块抽取 → 其余 17 个文件批量改造 → 端到端验收"三步推进（09-05~09-08 每日至少 5 个文件），避免 09-08 当日集中合并 develop（当前落后 main 18 提交）。
4. （对应分支偏差）feature-payment 与 develop 均需先做 main→分支反向同步再继续开发/合并。
5. （对应 TODO）legacy 支付清理显式写入 M1 收尾任务；报表模块改造时顺带清理 18 个文件中的占位注释。
6. （对应规范）commit message 统一"类型(模块): 动机"；标注类微提交（如 008beab）写明实际内容。

## 6. 趋势对比
| 指标 | 上期（2026-09-04 21:17，第 2 期） | 本期 | 变化 | 方向判断 |
|---|---|---|---|---|
| 提交数 | 17 | 20 | ↑ | 持平略升；增量全部来自今日晚间 3 个新提交（c7a0f21、8c2320c、008beab），其中 8c2320c 为 M3 实质修复 |
| 活跃作者数 | 1 | 1 | → | 持平：李娜持续缺席（连续第二期），张伟 100% 承担 |
| 新增行 / 删除行 | 1476 / 129 | 1538 / 139 | ↑ / ↑ | 剔除模板提交后实质新增 422 行（上期 360），实质活跃略升 |
| 大提交 | 1 | 1 | → | 同一提交（6e7c103）仍在窗口；后继修复已启动（8c2320c） |
| TODO 数 | 28 | 28 | → | 持平（超标未清理，未继续增长） |
| feature-payment 落后主干 | 25 | 26 | ↑ | 恶化：偏差继续扩大；存活 30 天（同日未跨日） |
| develop 落后主干 | 17 | 18 | ↑ | 恶化：逼近阈值 20，M3 合并前需消化 |
| progress / people / quality / integration / convention | 70 / 65 / 50 / 55 / 30 | 72 / 68 / 48 / 57 / 32 | ↑/↑/↓/↑/↑ | M1 到期日到来且零响应（进度、人员恶化）；M3 修复开端使质量微降（缓解）；集成继续恶化；规范微升 |
| 总分 | 56.8（高） | 58.2（高） | ↑1.4 | **恶化（幅度有限）**：M1 沉默延期坐实 + 双分支偏差扩大为主导，M3 晚间实质修复部分对冲 |

## 附录：采集证据摘录（关键数字溯源）

1. 提交数与增删行：`git -C tests/env/repo-backend log main --since="7 days ago" --numstat ...` → main 14 个 COMMIT 块合计 +260/−14；develop 6 块 +1278/−125；feature-payment 输出为空（0 提交）。跨分支 hash 无重叠，仓库级 20 / +1538 / −139。
2. 作者聚合：`git shortlog -sne main --since="7 days ago"` → `14 张伟 <zhangwei@team.com>`；develop → `6 张伟`；feature-payment → 空。上期（第 2 期）活跃作者亦仅张伟 1 人。
3. 分支位置：`git rev-list --count main..develop` = 7、`develop..main` = 18、merge-base cc9dcfe（2026-08-20，存活 15 天）；`main..feature-payment` = 3、`feature-payment..main` = 26、merge-base a09b30e（2026-08-05，存活 30 天）；feature-payment 最后提交 b6a9014（2026-08-10 15:00，25 天前）；develop 最后提交 008beab（2026-09-04 22:40）；main 最后提交 c7a0f21（2026-09-04 23:00）。判定式：30 > branch_stale_days(21) 且 26 > branch_behind_warn(20)。
4. 大提交：`git show 6e7c103 --stat` → 18 files changed, 1116 insertions(+)，18 > big_commit_files(15) 且 1116 > big_commit_lines(800)（该提交为上期已判定的大提交，本期仍在 7 天窗口内）。
5. TODO：Select-String 统计 28（payments_old.py 25、helpers.py 1、orders.py 1、models.py 1），28 > todo_fixme_warn(20)；上期值取自 state/history.md 第 2 期行（28）。
6. 热点文件：main 窗口期改动文件清单含 src/api/orders.py（7 次），develop 清单含 src/api/orders.py（d820c8e），2 分支 ≥ hot_file_branches_warn(2)；`git diff --stat main develop -- src/api/orders.py` → 3 insertions / 125 deletions（develop 缺失 main 125 行）。
7. 晚间新提交深读：`git show 8c2320c`（report_1 真实数据源 +60/−9）、`git show 008beab`（report_2 TODO 注释 +1/−0）、`git show c7a0f21`（config export_page_size 200→100）；`git show develop:src/modules/report_3.py`（仍为占位假数据）；`git show d820c8e` 与 `git show 11114f2`（同一金额精度修复重复实现，分别落于 develop 与 main）。
8. 规范：message 长度程序化测量（`$s.Length`），过短（<10 字符）5/20 = 25% < short_message_ratio_warn(30%)：23dc50a"wip"(3)、6451d29"新增请求日志中间件"(9)、fba5ad4"upd"(3)、008beab"wip"(3)、d820c8e"fix"(3)；无意义清单为其中 4 条（wip×2、upd、fix）。
9. 基线数值（提交数 17 / 作者 1 / 1476 / 129 / 大提交 1 / TODO 28 / 五维 70/65/50/55/30 / 总分 56.8 / feature-payment 落后 25）均取自 state/history.md 第 2 期（2026-09-04 21:17）。

### 偏差与说明（RUNBOOK 留痕要求）
1. 仓库未配置远程（`git remote` 输出为空），§1.1 的 fetch 步骤不适用，基于本地数据分析。
2. **同日重跑**：上期（第 2 期）与本期为同一自然日（2026-09-04），按 RUNBOOK §5.1 归档于 `reports/2026-09-04-2/`；趋势对比中"存活天数"类指标因同日运行不跨日（feature-payment 存活仍为 30 天），仅"落后数"（25→26）反映真实偏差增长。
3. **提交时间戳晚于运行时刻**：main 上 c7a0f21 标注时间为 23:00、develop 上 8c2320c/008beab 为 22:00/22:40、前端仓库亦有 21:30/22:30 提交，均晚于本期运行时刻（21:38）——系测试种子数据的时钟设定；各提交均落在分析窗口内，按数据原样纳入统计与深读。
4. 王强在本仓库零提交的定性：其活跃全部在 repo-frontend（12 次提交），属计划分工（项目计划.md §3"王强：前端全部页面与组件"）而非人员流失，不计入本期"活跃骤降"，与上期口径一致。
