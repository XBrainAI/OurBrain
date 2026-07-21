/* ==============================================================
 * components.js · 共享组件库
 * 提供表格行/卡片/时间线项等可复用 DOM 渲染函数
 * 注意：所有函数均返回 HTML 字符串，由 app.js 注入到 DOM
 * ============================================================ */

(function (global) {
  "use strict";

  var patentComponents = {};

  /* 状态元数据 */
  var STATUS_META = {
    draft:       { label: "草稿",     cls: "s-draft",      tagCls: "status-tag s-draft" },
    analyzing:   { label: "分析中",   cls: "s-analyzing",  tagCls: "status-tag s-analyzing" },
    recommended: { label: "推荐培育", cls: "s-recommended", tagCls: "status-tag s-recommended" },
    discarded:   { label: "已归档",   cls: "s-discarded",  tagCls: "status-tag s-discarded" }
  };

  /* 行业元数据 */
  var INDUSTRY_META = {
    "智能制造": { color: "#1B4D8C" },
    "生物医药": { color: "#2E7D5B" },
    "AI软件":  { color: "#7A3FB0" },
    "新材料":   { color: "#B8860B" },
    "新能源":   { color: "#D97706" }
  };

  /**
   * 评分等级
   * @param {number} score
   * @returns {{cls: string, grade: string, label: string}}
   */
  function scoreGrade(score) {
    if (score == null || isNaN(score)) return { cls: "none", grade: "—", label: "未评分" };
    if (score >= 85) return { cls: "high", grade: "A", label: "高价值" };
    if (score >= 60) return { cls: "mid", grade: "B", label: "可培育" };
    return { cls: "low", grade: "D", label: "需归档" };
  }

  /* HTML 转义 */
  function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /**
   * 渲染列表表格行（含 L3 锚点：查看 + AI 分析按钮）
   * 注意：动态生成的 L3 元件必须包含 [data-element-id] + .l3-dot
   */
  function renderIdeaRow(idea) {
    var grade = scoreGrade(idea.score);
    var scoreCell = idea.score == null
      ? '<span class="score-pill none">—</span>'
      : '<span class="score-pill ' + grade.cls + '">' + idea.score + '</span>';

    var statusMeta = STATUS_META[idea.status] || STATUS_META.draft;

    var aiBtn = idea.status === "draft"
      ? '<span data-element-id="P01-C-ROW-AI-' + idea.id + '"><button class="btn btn-secondary" data-action="analyze" data-id="' + idea.id + '">AI 分析</button><span class="l3-dot"></span></span>'
      : '<button class="btn btn-secondary" disabled>AI 分析</button>';

    return ''
      + '<tr data-id="' + idea.id + '">'
      +   '<td class="col-id">' + escapeHtml(idea.id) + '</td>'
      +   '<td class="col-title"><a href="#/patent-ideas/' + encodeURIComponent(idea.id) + '" data-action="view" data-id="' + idea.id + '">' + escapeHtml(idea.title) + '</a></td>'
      +   '<td class="col-industry"><span class="tag-industry">' + escapeHtml(idea.industry) + '</span></td>'
      +   '<td class="col-proposer">' + escapeHtml(idea.proposer) + '</td>'
      +   '<td class="col-score">' + scoreCell + '</td>'
      +   '<td class="col-owner">' + escapeHtml(idea.owner) + '</td>'
      +   '<td class="col-status"><span class="' + statusMeta.tagCls + '">' + statusMeta.label + '</span></td>'
      +   '<td class="col-actions">'
      +     '<span data-element-id="P01-C-ROW-VIEW-' + idea.id + '"><button class="btn btn-secondary" data-action="view" data-id="' + idea.id + '">查看</button><span class="l3-dot"></span></span>'
      +     aiBtn
      +   '</td>'
      + '</tr>';
  }

  /**
   * 渲染分页页码按钮
   */
  function renderPageNumber(num, active) {
    return '<button class="btn btn-page' + (active ? " active" : "") + '" data-action="page" data-page="' + num + '">' + num + '</button>';
  }

  /**
   * 渲染详情页布局方案分层
   */
  function renderLayoutLayer(type, title, detail) {
    return ''
      + '<div class="layout-layer">'
      +   '<div class="layer-tag ' + type + '">' + ({core: "核心", outer: "外围", defense: "防御"}[type] || type) + '</div>'
      +   '<div class="layer-body">'
      +     '<div class="layer-title">' + escapeHtml(title) + '</div>'
      +     '<div class="layer-detail">' + escapeHtml(detail) + '</div>'
      +   '</div>'
      + '</div>';
  }

  /**
   * 渲染时间线项
   */
  function renderTimelineItem(time, title, note, state) {
    var cls = state === "done" ? "done" : (state === "current" ? "current" : "");
    return ''
      + '<li class="timeline-item ' + cls + '">'
      +   '<div class="timeline-time">' + escapeHtml(time) + '</div>'
      +   '<div class="timeline-title">' + escapeHtml(title) + '</div>'
      +   (note ? '<div class="timeline-note">' + escapeHtml(note) + '</div>' : '')
      + '</li>';
  }

  /**
   * 渲染同行业去重列表项
   */
  function renderDedupItem(idea) {
    var grade = scoreGrade(idea.score);
    return ''
      + '<div class="dedup-item">'
      +   '<div class="dedup-id">' + escapeHtml(idea.id) + '</div>'
      +   '<div class="dedup-title">' + escapeHtml(idea.title) + '</div>'
      +   '<div class="dedup-proposer">' + escapeHtml(idea.proposer) + '</div>'
      +   '<div class="dedup-score" style="color: ' + (grade.cls === "high" ? "#B8860B" : grade.cls === "low" ? "#C5462B" : "#F5F1E8") + '">' + (idea.score == null ? "—" : idea.score) + '</div>'
      + '</div>';
  }

  patentComponents.STATUS_META = STATUS_META;
  patentComponents.INDUSTRY_META = INDUSTRY_META;
  patentComponents.scoreGrade = scoreGrade;
  patentComponents.escapeHtml = escapeHtml;
  patentComponents.renderIdeaRow = renderIdeaRow;
  patentComponents.renderPageNumber = renderPageNumber;
  patentComponents.renderLayoutLayer = renderLayoutLayer;
  patentComponents.renderTimelineItem = renderTimelineItem;
  patentComponents.renderDedupItem = renderDedupItem;

  global.patentComponents = patentComponents;

})(typeof window !== "undefined" ? window : this);
