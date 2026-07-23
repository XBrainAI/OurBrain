// mermaid-init.js — Demora v5.13.5 流程图渲染初始化脚本
//
// 作用：
//   1. 配置 Mermaid 主题（跟随 data-theme 切换 dark/light）
//   2. 启动 Mermaid 渲染（startOnLoad: false，由本脚本控制 run）
//   3. 监听 documentElement 的 data-theme 属性变化，切换主题并重新渲染
//   4. 加载失败时降级为源码显示（不阻塞页面）
//
// 依赖：mermaid.min.js（必须在本脚本之前加载）
// 守卫：typeof mermaid === 'undefined' 时仅打印警告，不抛异常
//
// v5.13.5 变更：
//   - 原 theme: 'dark' 硬编码，浅色模式下 mermaid 仍为黑色
//   - 改为读取 documentElement 的 data-theme 属性动态选择 theme
//   - 监听 data-theme 属性变化，切换时重新初始化 + 重新渲染所有 .mermaid
//   - 浅色主题用 mermaid 'default' 主题 + 浅色 themeVariables

(function () {
  'use strict';

  // 深色主题变量（对齐 Demora 配色）
  var DARK_VARS = {
    primaryColor: '#14B8A6',
    primaryTextColor: '#F5F5F7',
    primaryBorderColor: '#14B8A6',
    lineColor: '#A1A1AA',
    secondaryColor: '#1A1A1F',
    tertiaryColor: '#0A0A0A',
    background: '#070708',
    mainBkg: '#0A0A0A',
    secondBkg: '#111114',
    borderColor: '#27272A',
    textColor: '#F5F5F7',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: '14px'
  };

  // 浅色主题变量（白底 + #14B8A6 强调色，与深色同色系）
  var LIGHT_VARS = {
    primaryColor: '#14B8A6',
    primaryTextColor: '#18181B',
    primaryBorderColor: '#14B8A6',
    lineColor: '#52525B',
    secondaryColor: '#F4F4F5',
    tertiaryColor: '#FAFAFA',
    background: '#FFFFFF',
    mainBkg: '#FAFAFA',
    secondBkg: '#F4F4F5',
    borderColor: '#E4E4E7',
    textColor: '#18181B',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: '14px'
  };

  // 通用配置（与主题无关）
  var COMMON_CONFIG = {
    flowchart: { curve: 'basis', useMaxWidth: true, htmlLabels: true },
    sequence: { useMaxWidth: true, actorMargin: 50, boxMargin: 10 },
    state: { useMaxWidth: true },
    er: { useMaxWidth: true },
    gantt: { useMaxWidth: true }
  };

  // 读取当前主题（data-theme="light" → light，其他 → dark）
  function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  // 根据主题获取 mermaid theme 名称 + themeVariables
  function getMermaidThemeConfig(theme) {
    if (theme === 'light') {
      return { theme: 'default', themeVariables: LIGHT_VARS };
    }
    return { theme: 'dark', themeVariables: DARK_VARS };
  }

  // 缓存所有 .mermaid 元素的原始源码（用于重新渲染时恢复）
  var mermaidSources = [];
  function cacheMermaidSources() {
    mermaidSources = [];
    document.querySelectorAll('div.mermaid').forEach(function (el) {
      // 仅缓存未渲染的源码（避免缓存已转换的 SVG）
      if (!el.getAttribute('data-processed') && !el.querySelector('svg')) {
        mermaidSources.push({ el: el, code: el.textContent });
      }
    });
  }

  // 渲染所有 .mermaid 元素
  function renderAll() {
    if (typeof mermaid === 'undefined') return;
    try {
      // mermaid 11.x：使用 run API
      mermaid.run({
        querySelector: '.mermaid',
        postRenderCallback: function () {
          // 给 SVG 添加可访问性属性
          document.querySelectorAll('div.mermaid svg').forEach(function (svg) {
            svg.setAttribute('role', 'img');
            svg.style.maxWidth = '100%';
            svg.style.height = 'auto';
          });
        }
      });
    } catch (e) {
      console.warn('[Demora] mermaid 渲染失败:', e);
    }
  }

  // 重新渲染所有 .mermaid 元素（切换主题时调用）
  function rerenderAll() {
    if (typeof mermaid === 'undefined') return;
    // 恢复源码并清除处理标记
    document.querySelectorAll('div.mermaid').forEach(function (el, idx) {
      // 找到对应的缓存源码
      var cached = null;
      for (var i = 0; i < mermaidSources.length; i++) {
        if (mermaidSources[i].el === el) {
          cached = mermaidSources[i];
          break;
        }
      }
      // 退化策略：若缓存未命中，尝试从现有 SVG 提取源码（meta 标签）
      if (cached) {
        el.textContent = cached.code;
      }
      el.removeAttribute('data-processed');
      el.innerHTML = el.textContent;
    });
    renderAll();
  }

  // 初始化 mermaid（根据当前主题）
  function initMermaid() {
    if (typeof mermaid === 'undefined') {
      console.warn('[Demora] mermaid.min.js 加载失败，流程图将以源码形式显示');
      document.querySelectorAll('div.mermaid').forEach(function (el) {
        var pre = document.createElement('pre');
        pre.className = 'mermaid-fallback';
        pre.textContent = el.textContent;
        el.parentNode.replaceChild(pre, el);
      });
      return;
    }

    var theme = getCurrentTheme();
    var themeConfig = getMermaidThemeConfig(theme);
    var config = Object.assign(
      { startOnLoad: false },
      themeConfig,
      COMMON_CONFIG
    );
    mermaid.initialize(config);
    console.info('[Demora] mermaid 初始化完成，主题: ' + theme);

    // 首次渲染前缓存源码
    cacheMermaidSources();
    renderAll();
  }

  // 监听 data-theme 属性变化，切换主题并重新渲染
  function setupThemeObserver() {
    if (typeof MutationObserver === 'undefined') return;
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type === 'attributes' && m.attributeName === 'data-theme') {
          var theme = getCurrentTheme();
          var themeConfig = getMermaidThemeConfig(theme);
          var config = Object.assign(
            { startOnLoad: false },
            themeConfig,
            COMMON_CONFIG
          );
          if (typeof mermaid !== 'undefined') {
            mermaid.initialize(config);
            console.info('[Demora] mermaid 主题切换: ' + theme);
            rerenderAll();
          }
          break;
        }
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  // 等待 DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initMermaid();
      setupThemeObserver();
    });
  } else {
    initMermaid();
    setupThemeObserver();
  }
})();
