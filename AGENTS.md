# website/ AGENTS.md

本目录是 Demora 官方网站源码。本文档约束官网的维护、扩展与发布流程。

## 一、官网定位与受众

- **定位**：Demora 对外门户，面向产品经理（PM）与产品研发团队，介绍工具能力并指引上手。
- **受众**：以 PM 为主，技术背景不强；内容须简约易懂，避免技术黑话。
- **原则**：
  - 不透露技术秘密（实现细节、内部脚本逻辑、MCP/架构边界等不披露）
  - 只做必要披露（说"做什么"与"怎么用"，不说"内部怎么实现"）
  - 用户友好（操作步骤可直接复制粘贴，截图与文字对齐）
  - 中文为主，关键术语保留英文（如 Skill、Desktop Agent）

## 二、目录结构

```
src/assets/website/
├── AGENTS.md              # 本文件
├── index.html             # 首页（品牌入口）
├── docs.html              # 概念文档页（Demora 是什么 / 三阶段 / FAQ）
├── getting-started.html   # 开始使用实操页（Desktop Agent / Skill 安装 / 应用案例）
├── DesktopAgent/          # Trae Work 使用截图（有序语义命名 01-09）
├── skills/                # Skill 分发（构建时从 dist/ 同步 oc-demora.zip）
└── 应用案例/              # 最佳实践案例（每个案例即一个交付网站）
    ├── README.md          # 案例索引
    └── <case>/            # 单案例 = 交付网站（index.html + demo + docs + downloads）
```

## 三、IP 规范

所有页面遵循 Demora IP 规范，源文件位于 `src/assets/IP/brand-guide.html`。核心要点：

- 主色 Teal `#14B8A6`，背景深色 `#070708`
- 字体 Inter（含中文回退 PingFang SC / Noto Sans SC）
- 卡片圆角 20px，按钮圆角 99px（胶囊形）
- 标题大字重 700，正文行高 1.6-1.7
- 复用首页 SVG logo（三层渐变横条）

新增页面须从 `index.html` 或 `docs.html` 复制基础样式骨架，保持视觉一致。

## 四、页面职责

| 页面 | 职责 | 维护触发 |
|------|------|---------|
| index.html | 品牌入口，hero + 设计哲学 + CTA | 能力定位变化时 |
| docs.html | 概念性文档（是什么/三阶段/FAQ） | 流程或文档体系变化时 |
| getting-started.html | 实操指引（Agent/Skill/案例） | 安装方式、推荐 Agent、案例变化时 |

**首页"开始使用"按钮** → 跳 `getting-started.html`（实操）
**docs.html "如何开始使用"** → 概念性四步说明（保留，不跳转）

两者区分：首页 CTA 强调行动，docs 强调理解。

## 五、Skill 分发同步流程

官网通过 `skills/oc-demora.zip` 分发 Skill 包，PM 手工维护发布。

**安装命令**（PM 从 getting-started.html 复制粘贴到 Desktop Agent 终端执行）：
```
npx skills add https://demora--ourchem.netlify.app/skills/oc-demora.zip -g -y --agent trae-cn
```

**分发流程**：
1. `scripts/build-test-dist.mjs` 的 DIST 阶段生成 `dist/oc-demora.zip` 后，自动复制到 `src/assets/website/skills/oc-demora.zip`
2. PM 部署 website 到 Netlify（demora--ourchem.netlify.app），该 zip 即可通过上述 URL 访问
3. PM 手工维护该 zip 的发布（确认构建产物正确后再部署）
4. Skill 更新：PM 重新执行上述 `npx skills add` 命令（幂等覆盖）

**关键约束**：
- skills/oc-demora.zip 必须由构建流程产出，禁止手工放置旧版本
- 安装命令中的 URL 已确认：`https://demora--ourchem.netlify.app/skills/oc-demora.zip`
- `--agent trae-cn` 指定 Trae CN 适配；其它 Desktop Agent 按需调整

## 六、应用案例维护

- 每个案例 = 一个交付网站（由 `package-delivery.mjs` 生成）
- 当前结构：`应用案例/<case>/sim-project/delivery/<项目名>/index.html` 为案例交付网站入口
- getting-started.html 应用案例卡片链接到该入口
- 案例须脱敏（无真实客户数据、无敏感业务字段）
- 当前已纳入展示的 5 个案例：
  - **audit-ecommerce-order**（电商订单管理）
  - **audit-inventory-dashboard**（库存数据大屏）
  - **audit-clinic-appointment**（诊所预约挂号系统，v5.10.1 新增，audit 评级 A）
  - **audit-restaurant-order**（餐饮点餐系统，v5.10.1 新增，audit 评级 A）
  - **audit-travel-booking**（旅游行程预订系统，v5.10.1 新增，audit 评级 B）
- ecommerce-order（裸项目）为早期重复案例且状态异常，暂不纳入展示

### 6.1 案例数据源（v5.12 新增）

为避免在 `getting-started.html` 中硬编码案例数据，采用「每案例一份 `case-info.json` + 聚合索引」方案：

- **每案例元数据**：`应用案例/<case>/case-info.json`（与 `sim-project/` 同级），字段：
  - `caseId`：卡片编号，如 `CASE 01`（用于排序与展示）
  - `title`：案例标题（中文）
  - `description`：案例描述（1-2 句话，说明业务场景与 Demora 应用方式）
  - `domain`：业务领域，如 `EC` / `Dashboard` / `Healthcare` / `F&B` / `Travel`
  - `industry`：行业分类（`培育` / `分析` / `管理` / `金融`；未填时脚本自动归入「其他」），用于 `getting-started.html` STEP 04 顶部 tab 分组过滤
  - `pages`：页面数量（整数）
  - `entities`：实体数量（整数；无实体数据时填 `0`，卡片将自动隐藏该字段）
  - `roles`：角色列表（用 ` / ` 分隔，如 `patient / doctor / admin`）
  - `entryPath`：交付网站入口相对路径（相对于 `src/assets/website/`），如 `应用案例/audit-ecommerce-order/sim-project/delivery/电商订单管理/index.html`
  - `scenarioName`：场景目录名，如 `audit-ecommerce-order`
  - `auditGrade`：审计评级（`A` / `B` / `C`）
  - `createdAt`：案例纳入展示的日期（`YYYY-MM-DD`）
- **聚合索引**：`应用案例/cases-index.json` 由 `scripts/generate-cases-index.mjs` 自动生成，**禁止手工编辑**
  - 脚本扫描 `应用案例/*/case-info.json`，按 `caseId` 排序后聚合
  - 输出包含 `generatedAt` / `count` / `cases` 三个字段
  - `scripts/build-test-dist.mjs` 的 DIST 阶段会自动调用该脚本刷新索引
- **动态渲染**：`getting-started.html` STEP 04 通过 `fetch('应用案例/cases-index.json')` 动态渲染卡片，新增/删除案例无需修改 HTML
  - STEP 04 顶部新增行业 tab 分组（`全部` / `培育` / `分析` / `管理` / `金融`），根据 `industry` 字段过滤展示；`generate-cases-index.mjs` 在 `industry` 缺失时自动补「其他」

### 6.2 新增案例流程

1. 用 Demora 跑完一个真实项目，产出 sim-project
2. 在 sim-project 目录运行 `node <skill>/scripts/package-delivery.mjs`
3. 将整个 sim-project 复制到 `应用案例/<case>/`（保留 sim-project 包装）
4. 在 `应用案例/<case>/` 下创建 `case-info.json`（参考现有案例格式，字段见 §6.1）
5. 运行 `node scripts/generate-cases-index.mjs` 刷新 `应用案例/cases-index.json`
6. 本地预览：在 `src/assets/website/` 启动 `python -m http.server 8000`，浏览器打开 `http://localhost:8000/getting-started.html` 验证卡片渲染

## 七、截图规范

- 存放于 `DesktopAgent/`，有序语义命名：`01-new-project.png`、`02-select-local-path.png` … `09-delivery.png`（共 9 张，覆盖新建项目 → 交付完整流程）
- 禁止使用 `image.png`、`image copy.png` 等无意义名
- 尺寸统一宽度 1600px 左右，PNG 格式
- 截图须脱敏（无真实账号、token、内部 URL）
- `getting-started.html` 按编号引用，便于顺序阅读

## 八、内容更新检查清单

修改官网后自问：
- [ ] 是否泄露技术秘密（内部脚本名、MCP 架构、实现细节）？→ 删除
- [ ] 是否有过时表述（提及已废弃的概念如 Vue mixin / design tokens / 旧版文档数量）？→ 更新
- [ ] 操作步骤是否可直接复制粘贴？→ 补全命令与路径
- [ ] 截图与文字是否对齐？→ 重新截图
- [ ] 新页面是否遵循 IP 规范？→ 对照 brand-guide.html
- [ ] skills/oc-demora.zip 是否由构建流程同步（非手工）？→ 跑 build-test-dist

## 九、本地预览

```powershell
# 在 website/ 目录启动静态服务器
cd src/assets/website
python -m http.server 8000
# 浏览器打开 http://localhost:8000/
```

禁止直接双击 index.html 预览（部分相对路径在 file:// 下可能异常）。
