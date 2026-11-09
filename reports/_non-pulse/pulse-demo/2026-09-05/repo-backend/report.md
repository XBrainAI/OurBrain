# repo-backend 风险评估报告（第 5 期 · 2026-09-05）

## 1. 概览

- 项目：pulse-demo；仓库：repo-backend（项目根 tests/env，仓库目录 tests/env/repo-backend；未配置远程，fetch 不适用，基于本地数据分析；两级接入见 §1.1）
- 关注分支：main、develop、feature-payment（主干：main）
- 分析窗口：2026-08-29 ~ 2026-09-05（window_days=7，运行时刻 2026-09-05 14:13）
- 总分：51.7 / 100，等级：**高**（与上期 51.7 持平）
- 关键数字：窗口期 22 次提交（张伟 21 + 李娜 1，跨分支去重）、+1660/−159 行；**M1 截止日（09-05）已到**——联调未开始（`_request` 仍 mock、沙箱未开通），延期由"不可避免"转为**既成事实**；feature-payment 存活 **31 天**（跨过 30 天僵尸线）且落后 26；M3 真实数据源 2/18；TODO 28 持平

## 2. 量化指标与解读

### 2.1 提交活动

| 指标 | 数值 | 来源 |
|---|---|---|
| 窗口期提交数 | 22（main 14 + develop 7 + feature-payment 1，跨分支按 hash 去重） | `git log <branch> --since="7 days ago"` 计数 |
| 新增行 / 删除行 | +1660 / −159 | `git log --numstat` 聚合（main +260/−14，develop +1374/−138，feature-payment +26/−7） |
| 大提交数 | 1（6e7c103：18 文件 +1116 行） | 文件数 > big_commit_files(15) 且增删行 > big_commit_lines(800) |

解读：上期运行（09-04 22:22）后至本期运行无新增提交，窗口集合与上期完全一致——全部指标环比持平。M1 截止日（09-05）已到而无任何联调进展提交，延期为既成事实。

### 2.2 成员进度

| 作者 | 提交数 | 新增行 | 删除行 | 分支分布 | 环比 |
|---|---|---|---|---|---|
| 张伟 zhangwei@team.com | 21 | 1634 | 152 | main（14）、develop（7） | 上期 21 次，持平 |
| 李娜 lina@team.com | 1 | 26 | 7 | feature-payment（1） | 上期 1 次，持平（回归后无后续提交，连续性仍未证实） |
| 王强 wangqiang@team.com | 0 | 0 | 0 | — | 活跃在 repo-frontend（分工，非流失） |

判定：
- **负载不均衡成立（持续）**：top1 占比 21/22 = 95.5% > single_contributor_share_warn(0.6)，增删行占比 98.4% 交叉验证成立。
- **活跃骤降：无**；李娜回归后连续性未证实（仅截止前夜 1 次提交）。
- **知识孤岛**（1.9 / 1.11）：核心模块 src/payments（M1）窗口期唯一提交者为李娜（1 次）；张伟独自承担 main + develop 双线——bus factor 信号持续。

### 2.3 分支健康

| 分支 | 领先主干 | 落后主干 | 存活天数 | 最后活跃 | 判定 |
|---|---|---|---|---|---|
| main | 不适用 | 不适用 | 不适用 | 2026-09-04 23:00（c7a0f21） | 主干，健康 |
| develop | 8 | 18 | **16**（分叉点 2026-08-20） | 2026-09-04 23:50（b73b622） | 未达阈值（16 < 21、18 < 20），但落后逼近 branch_behind_warn(20)；M3 截止 09-08 前需合并 |
| feature-payment | 4 | **26** | **31**（分叉点 2026-08-05） | 2026-09-04 23:30（156ac8d） | **长期未合并成立（双阈值命中）且已跨过 30 天僵尸观察线**；09-04 重新激活后无后续提交 |

- **热点文件冲突信号成立**：`src/api/orders.py` 被 main（7 次）与 develop（d820c8e）双分支改动（≥ hot_file_branches_warn(2)），差异 125 行未收敛。
- 偏差趋势：feature-payment 落后 26→26（持平，未继续扩大）；develop 落后 18→18（持平）。

### 2.4 质量信号

| 信号 | 数值 | 阈值 | 判定 | 来源 |
|---|---|---|---|---|
| TODO/FIXME 总数 | 28 | todo_fixme_warn=20 | **超标**（25 个集中于 src/legacy/payments_old.py 留档文件） | Select-String 统计 |
| 返工比（删/增） | 159/1660 = 0.10 | rework_ratio_warn=0.5 | 未超标 | numstat 聚合 |
| 超大文件 | 0 个 | large_file_lines=1500 | 无 | ls-files 行数统计 |
| 测试信号（1.12） | 窗口期改动中测试文件仅 tests/test_users.py（+49）；验签 verify_callback 零测试 | — | 安全关键代码零测试（持续） | numstat + ls-files |

### 2.5 节奏与模块分布

| 指标 | 数值 | 来源 |
|---|---|---|
| 逐日提交分布 | 08-29:3、08-30:2、08-31:2、09-01:3、09-02:3、09-03:3、09-04:6、09-05:0 | git log --pretty=%ad --date=short 按日聚合（跨分支 hash 去重） |
| 模块活跃 Top | src/modules +1369/−136（6 commits）；src/api +157/−12（10）；src/payments +26/−7（1）；src/db +14/−2（1）；src/middleware +42/0（1） | numstat 按前两级目录聚合；核心=计划映射路径（§2.4） |

（解读：09-04 单日 6 次为 M1 截止前夜突击（含李娜 23:30 验签初版）；核心模块 src/payments 仅 26 行变更 vs 报表 src/modules 1369 行——"表面活跃、核心停滞"结构性信号仍在（M3 批量模板提交占大头）。）

## 3. 项目文档关联分析

映射依据：两级文档——项目路径内文档（本演练项目无项目根内文档，pulse-demo 项目根 tests/env 下除仓库外无 md 文档）+ 全局 docs/（项目计划.md、需求清单.md）；仓库归属按模块路径（M1/R2→src/payments、M3/R4→src/modules、M4/R5→src/db+src/api、R1/R6→src/api/users）。

| 计划条目（文档路径 + 摘录） | 负责人 | 截止 | 对应模块 | 窗口期提交证据 | 状态判断 |
|---|---|---|---|---|---|
| M1 支付模块开发与联调（项目计划.md §2；需求清单.md R2） | 李娜 | **2026-09-05（今日，已到期）** | feature-payment / src/payments | 分支最后提交 156ac8d（09-04 23:30 验签初版 + 网关配置化）；`_request` 仍返回 mock、沙箱未开通 | **延期风险（已到期成事实）**：截止日已到，联调未开始，延期既成 |
| M3 后端报表模块（项目计划.md；R4） | 张伟 | 2026-09-08（剩 3 天） | develop / src/modules | 真实数据源 2/18（8c2320c report_1、b73b622 report_2），ReportBase 就绪，余 16 文件待迁移 | 部分推进 |
| M4 订单接口性能优化（R5） | 张伟 | 2026-09-12 | src/api、src/db | 连接池调优 / 分页修复 / 导出参数调整 | 已推进 |
| R1 订单查询与导出（P0） | 张伟 | — | src/api/orders.py | 查询/筛选/导出/编码修复落地 | 已推进 |
| R6 用户中心（P2） | 张伟 | — | src/api/users.py | 参数校验单测 +49 行 | 已推进 |

## 4. 深度代码评估

（上期运行后无新增提交，深度阅读结论沿用第 4 期，关键证据引用如下；未新增发现。）

- [M1 缺口] `repo-backend@156ac8d src/payments/gateway.py —— verify_callback 已为 HMAC-SHA256 验签（hmac.compare_digest 常量时间比较），网关地址配置化；但 _request 仍返回 {mock: True}（待沙箱），防重放 TODO 仍在`
- [M3 假数据] `repo-backend@develop:src/modules/report_3.py —— report_3~18 共 16 个文件仍返回 channel-N 硬编码假数据且无 TODO 标注；report_1/2 已接真实数据源`
- [热点文件] `repo-backend@d820c8e src/api/orders.py —— develop 上的金额分单位修复与 main 11114f2 重复实现；develop 相对 main 缺失 125 行`
- [wip 残留] `repo-backend@23dc50a src/api/orders.py —— build_order_timeline 占位函数（返回空列表）仍在主干`

## 5. 风险评分

### 5.1 五维得分

| 维度 | 得分 | 权重 | 加权分 | 主要依据 |
|---|---|---|---|---|
| progress | 64 | 30 | 19.2 | M1 截止日已到、延期成事实（严重）；M3 部分推进剩 3 天；M4/R1/R6 正常（对冲） |
| people | 56 | 20 | 11.2 | 李娜单点（回归后连续性未证实）+ 张伟 95.5% 过载；知识孤岛持续 |
| quality | 45 | 20 | 9.0 | TODO 28 超标持平；M3 16 文件假数据；验签零测试；主干质量良好（对冲） |
| integration | 52 | 15 | 7.8 | feature-payment 双阈值命中且跨 30 天线；develop 落后 18 逼近阈值；orders.py 冲突面未收敛 |
| convention | 30 | 15 | 4.5 | 无意义 message 4 条存量；wip 占位代码留主干 |

### 5.2 总分与等级

总分 = (64×30 + 56×20 + 45×20 + 52×15 + 30×15)/100 = 51.7，等级：**高**（与上期持平）

### 5.3 风险点清单

| 风险点 | 维度 | 等级 | 证据 | 建议 | 持续期数 |
|---|---|---|---|---|---|
| M1 截止日（09-05）已到，延期成事实：联调未开始（_request 仍 mock、回调未接订单服务） | progress | 严重 | `_request` 返回 {mock: True}；callbacks.py 注明订单服务未就绪；M1 定义=开发与联调；今日已到期 | 延期既成事实应正式化：周会宣布新交付日期，代码项（验签/配置化）先行验收，联调项以沙箱开通为前置重排 | 4 |
| M1 仍由李娜单人负责，回归仅 1 次提交，交付连续性未证实 | people | 高 | shortlog 李娜 1 次 vs 张伟 21 次；此前连续两期零提交；回归后无后续 | 指定支付第二责任人；回归后连续 3 日进度同步 | 4 |
| feature-payment 长期未合并（落后 26、存活 31 天，已跨 30 天僵尸线） | integration | 高 | rev-list behind=26 > 20；merge-base 2026-08-05 → 存活 31 > 21 双阈值命中 | main→feature-payment 反向同步消化偏差；验签代码尽早合入主干评审 | 4 |
| M3 报表真实数据源 2/18，剩 16 文件假数据，距 09-08 剩 3 天 | quality | 高 | report_3~18 load_rows 硬编码假数据；ReportBase 就绪待迁移 | 按基类每日 ≥5 文件迁移，09-08 只做合并 | 4 |
| 热点文件 orders.py 双分支 125 行差异 + 重复修复 | integration | 高 | git diff main..develop -- orders.py = 125 行差异；11114f2 与 d820c8e 重复实现 | develop←main 反向同步先行；建立主干修复同步约定 | 4 |
| TODO 28 超标持平；验签零测试 | quality | 中 | 28 > 20（payments_old.py 25 处）；verify_callback 无任何测试 | 补签名缺失/伪造/篡改/重放四类用例；legacy 清理入 M1 收尾 | 4 |
| 无意义 message 4 条存量（wip×2/upd/fix） | convention | 中 | 23dc50a/008beab/fba5ad4/d820c8e | message 统一"类型(模块): 动机"；wip 限个人分支 | 4 |

### 5.4 针对性建议

与 5.3 逐条对应（见建议列）；持续 ≥3 期的风险点（全部 7 项）应在本周会逐项定责任人与时限，防止风险常态化。

## 6. 趋势对比

| 指标 | 上期（2026-09-04 P4） | 本期（P5） | 变化 | 方向判断 |
|---|---|---|---|---|
| 提交数 | 22 | 22 | → | 持平（上期运行后无新增提交） |
| 活跃作者数 | 2 | 2 | → | 持平 |
| 新增行 / 删除行 | 1660 / 159 | 1660 / 159 | → | 持平 |
| TODO 数 | 28 | 28 | → | 持平（超标未清理） |
| feature-payment 落后 / 存活 | 26 / 30 天 | 26 / **31 天** | → / ↑ | 落后持平；**存活跨过 30 天僵尸观察线** |
| M1 里程碑 | 明日到期，延期不可避免 | **今日到期，延期成事实** | ↑ | 恶化（状态兑现） |
| 五维 / 总分 | 64/56/45/52/30 → 51.7 高 | 64/56/45/52/30 → 51.7 高 | → | 全维持平：风险未恶化也未缓解，**积压待治理** |

## 附录：采集证据摘录（关键数字溯源）

1. 提交数/增删行：`git log main|develop|feature-payment --since="2026-08-29 00:00" --numstat --pretty="COMMIT|%H|%an"` 聚合（hash 去重）→ 22 / +1660 / −159；分支分册 main +260/−14、develop +1374/−138、feature-payment +26/−7。
2. 作者：shortlog main=14 张伟、develop=7 张伟、feature-payment=1 李娜。
3. 分支位置：`rev-list --count main..develop`=8、`develop..main`=18、merge-base 2026-08-20 → 存活 16 天；`main..feature-payment`=4、`feature-payment..main`=26、merge-base 2026-08-05 → 存活 31 天；判定式 31 > branch_stale_days(21) 且 26 > branch_behind_warn(20)。
4. TODO：Select-String 计数 28（payments_old.py 25）；上期值取自 history 第 4 期（28）。
5. 上期环比基线（1.14）：取自 `reports/2026-09-04-3/index.html` 的 REPORT_DATA（P4：total 51.7/11.4、scores、members 21/1、branches behind 18/26、quality、rhythm）。
6. 偏差与说明：①窗口起始日含 08-29（上期窗口含 08-28，该日 0 提交，集合一致）；②存活天数按运行日重算（develop 15→16、feature-payment 30→31）；③深度阅读沿用第 4 期结论（无新增提交）。
