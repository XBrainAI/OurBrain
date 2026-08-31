# Demora 工作流约定（Windsurf Rules）

本文件由 `scaffold-project.mjs` 自动注入。如已有自定义规则，原文件已备份为 `.windsurf/rules/demora.md.bak`。

## 一、三阶段流程（严格顺序，禁止跳阶）

| Phase | 名称 | 目标 | 核心脚本 |
|-------|------|------|---------|
| 1 | 想清楚 | 需求建模 + Demo 空目录 | scaffold-project → validate-model → lock-model |
| 2 | 做精致 | 标注注入 + 文档生成 + 质量校验 | enhance-prototype → generate-prd → check-structure → quality-check |
| 3 | 改到位 | 决策同步 + 交付打包 + 最终审批 | sync-docs → package-delivery |

## 二、标注系统 data-* 属性约定

标注系统通过 `data-*` 属性与 AI 生成的 HTML 对接，**零 JS 侵入**：

- `[data-annotation-root]` — 布局根（可选，默认 body）
- `[data-annotation-toggle]` — 标注开关按钮
- `.anno-zone[data-zone-id]` — L2 区域标记（内含 `.l2-marker`）
- `[data-element-id]` — L3 元素包裹（内含 `.l3-dot`）

**禁止修改标注系统文件**（annotation-engine.js / annotation-styles.css / annotation-panel.html），
这些文件由 `enhance-prototype.mjs` 自动注入。

## 三、Demo 生成约束

1. 读取 `skills/frontend-design/SKILL.md` 后再设计 HTML
2. HTML 必须包含 4 项最小契约：
   - 根元素绑定（`[data-annotation-root]`）
   - `<router-view>` 或等效路由出口
   - 标注开关（`[data-annotation-toggle]`）
   - `data-zone-id` / `data-element-id` 属性
3. 禁止在标注面板 HTML 中使用 `el-drawer`（用标准 `.annotation-panel` 结构）

## 四、编码与输出规范

- 文件读写显式指定 `encoding: "utf-8"`
- `print()` / `console.log()` 输出使用 ASCII 标记（`[OK]` / `[FAIL]` / `[WARN]`），禁止 emoji
- 代码注释使用中文，变量/函数名使用英文
- 代码文件禁止使用中文文件名
