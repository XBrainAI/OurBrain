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
//
// v5.20 变更（UAT 二轮 U14/U18 修复）：
//   - P1-1 details 展开惰性渲染：折叠容器内 mermaid 初始渲染失败（文本测量），
//     toggle 捕获委托驱动按需渲染（dev-docs 研发文档聚合 22 图由此可达）
//   - P1-2 缩放弹窗重做：背景随 data-theme 适配（修复浅色反白）；克隆 svg 按原始
//     viewBox × 1.5× 显式尺寸（真实放大）；工具栏 + 滚轮缩放 0.5×–4×；拖拽平移；双击复位

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
          // v5.19 P2-4 图表点击放大：渲染完成后为每个 svg 绑定点击放大
          bindZoomToSvgs();
        }
      });
    } catch (e) {
      console.warn('[Demora] mermaid 渲染失败:', e);
    }
  }

  // ==================================================================
  // v5.20 P1-2 图表放大弹窗（重做）：主题适配 + 真实放大 + 缩放控制 + 拖拽平移
  //   v5.19 版缺陷（U14 实证）：
  //   ① 背景硬编码暗色 fallback（#0A0A0A），浅色主题下浅色 SVG 叠加暗底反白不可读
  //   ② 克隆 svg 100% 等比适配视口 = 无倍率增益（"独立弹窗视图"≠"放大"）
  //   ③ 无缩放/平移控制（仅点击关闭 + Esc）
  //   重做要点：背景随 data-theme 适配；克隆 svg 按原始 viewBox × 初始 1.5× 显式尺寸
  //   （画布 overflow:auto，超界出滚动条即真实放大）；工具栏 +/−/复位与滚轮缩放
  //   （0.5×–4×，步进 0.25×）；拖拽平移（拖画布滚动视口）；双击复位；零第三方依赖
  // ==================================================================
  var zoomState = { clone: null, baseW: 0, baseH: 0, scale: 1.5 };

  // 弹窗配色随 data-theme 适配（打开时/主题变化时调用——修复 U14 反白）
  function applyZoomDialogTheme() {
    var d = document.getElementById('mermaid-zoom-dialog');
    if (!d) return;
    var light = getCurrentTheme() === 'light';
    d.style.background = light ? '#ffffff' : '#0a0a0a';
    d.style.borderColor = light ? '#e4e4e7' : '#27272a';
    d.style.color = light ? '#18181b' : '#f5f5f7';
  }

  // 设置缩放倍率（0.5×–4× 钳制；同步克隆尺寸与倍率显示）
  function setZoomScale(scale) {
    zoomState.scale = Math.min(4, Math.max(0.5, scale));
    if (zoomState.clone) {
      zoomState.clone.style.width = Math.round(zoomState.baseW * zoomState.scale) + 'px';
      zoomState.clone.style.height = Math.round(zoomState.baseH * zoomState.scale) + 'px';
    }
    var label = document.getElementById('mermaid-zoom-label');
    if (label) label.textContent = Math.round(zoomState.scale * 100) + '%';
  }

  // 动态创建放大弹窗（仅创建一次，复用；结构：工具栏 + 滚动画布）
  function ensureZoomDialog() {
    var dialog = document.getElementById('mermaid-zoom-dialog');
    if (dialog) return dialog;

    dialog = document.createElement('dialog');
    dialog.id = 'mermaid-zoom-dialog';
    dialog.style.cssText = 'border:1px solid #27272a;background:#0a0a0a;color:#f5f5f7;'
      + 'padding:0;margin:auto;width:95vw;max-width:95vw;height:95vh;max-height:95vh;';

    // 内层 flex 包装（dialog 本身不动 display，避免覆盖 UA 的 [open] 显隐规则）
    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;width:100%;height:100%;';

    // 工具栏：− 倍率 ＋ 复位 | 关闭
    var bar = document.createElement('div');
    bar.style.cssText = 'display:flex;align-items:center;gap:6px;padding:8px 12px;flex:none;'
      + 'border-bottom:1px solid rgba(128,128,128,.35);font:12px/1.2 system-ui,sans-serif;user-select:none;';
    function mkBtn(txt, title, fn) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = txt;
      b.title = title;
      b.style.cssText = 'border:1px solid currentColor;background:transparent;color:inherit;'
        + 'border-radius:4px;padding:3px 10px;font:12px/1.2 system-ui,sans-serif;cursor:pointer;';
      b.addEventListener('click', fn);
      return b;
    }
    bar.appendChild(mkBtn('−', '缩小（滚轮亦可）', function () { setZoomScale(zoomState.scale - 0.25); }));
    var label = document.createElement('span');
    label.id = 'mermaid-zoom-label';
    label.style.cssText = 'min-width:44px;text-align:center;font-variant-numeric:tabular-nums;';
    label.textContent = '150%';
    bar.appendChild(label);
    bar.appendChild(mkBtn('＋', '放大（滚轮亦可）', function () { setZoomScale(zoomState.scale + 0.25); }));
    bar.appendChild(mkBtn('复位', '复位至 150%（双击画布同效）', function () { setZoomScale(1.5); }));
    var spacer = document.createElement('span');
    spacer.style.cssText = 'flex:1;';
    bar.appendChild(spacer);
    bar.appendChild(mkBtn('✕ 关闭', '关闭预览（Esc 同效）', function () { dialog.close(); }));
    wrap.appendChild(bar);

    // 画布：滚动平移容器（内容超界出滚动条 = 真实放大）
    var canvas = document.createElement('div');
    canvas.id = 'mermaid-zoom-canvas';
    canvas.style.cssText = 'flex:1;min-height:0;overflow:auto;cursor:grab;';
    wrap.appendChild(canvas);
    dialog.appendChild(wrap);

    // 滚轮缩放（0.5×–4×，步进 0.25×）
    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      setZoomScale(zoomState.scale + (e.deltaY < 0 ? 0.25 : -0.25));
    }, { passive: false });

    // 拖拽平移：拖画布滚动视口（超界部分由此可达）
    var drag = null;
    canvas.addEventListener('mousedown', function (e) {
      if (e.target && e.target.closest && e.target.closest('button')) return;
      drag = { x: e.clientX, y: e.clientY, l: canvas.scrollLeft, t: canvas.scrollTop };
      canvas.style.cursor = 'grabbing';
      e.preventDefault();
    });
    window.addEventListener('mousemove', function (e) {
      if (!drag) return;
      canvas.scrollLeft = drag.l - (e.clientX - drag.x);
      canvas.scrollTop = drag.t - (e.clientY - drag.y);
    });
    window.addEventListener('mouseup', function () {
      if (!drag) return;
      drag = null;
      canvas.style.cursor = 'grab';
    });

    // 双击画布复位 1.5×
    canvas.addEventListener('dblclick', function () { setZoomScale(1.5); });

    // 点击 backdrop 关闭（内容区交互不受影响；Esc 为原生默认）
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog && dialog.open) dialog.close();
    });
    // 关闭时释放克隆节点
    dialog.addEventListener('close', function () {
      canvas.innerHTML = '';
      zoomState.clone = null;
    });

    // backdrop 遮罩样式（style 标签仅注入一次）
    if (!document.getElementById('mermaid-zoom-dialog-style')) {
      var style = document.createElement('style');
      style.id = 'mermaid-zoom-dialog-style';
      style.textContent = '#mermaid-zoom-dialog::backdrop{background:rgba(0,0,0,0.78);}';
      document.head.appendChild(style);
    }

    document.body.appendChild(dialog);
    return dialog;
  }

  // svg click → 打开放大弹窗（克隆 svg 按原始 viewBox × 初始 1.5× 显式尺寸 = 真实放大）
  function bindZoomToSvgs() {
    document.querySelectorAll('div.mermaid').forEach(function (el) {
      var svg = el.querySelector('svg');
      if (!svg) return;
      // 绑定前给容器加放大提示
      el.title = '点击放大（弹窗内滚轮缩放 / 拖拽平移 / 双击复位）';
      el.style.cursor = 'zoom-in';
      // 防重复绑定：主题切换重渲染会重建 svg，仅对新 svg 绑定
      if (svg.getAttribute('data-zoom-bound') === '1') return;
      svg.setAttribute('data-zoom-bound', '1');
      svg.addEventListener('click', function () {
        var dialog = ensureZoomDialog();
        var canvas = document.getElementById('mermaid-zoom-canvas');
        canvas.innerHTML = '';
        // 基准尺寸：优先 viewBox（图形真实坐标系），退化用当前显示矩形
        var vb = svg.viewBox && svg.viewBox.baseVal;
        var rect = svg.getBoundingClientRect();
        zoomState.baseW = (vb && vb.width) ? vb.width : (rect.width || 800);
        zoomState.baseH = (vb && vb.height) ? vb.height : (rect.height || 600);
        // 克隆并解除内联约束（maxWidth 等），尺寸交由 setZoomScale 控制
        var clone = svg.cloneNode(true);
        clone.removeAttribute('data-zoom-bound');
        // v5.20.1（UAT 三轮 U18-B）：mermaid 11 的内联 <style> 以 #<svg-id> 为选择器前缀，
        //   原 removeAttribute('id') 令克隆体内全部主题规则失配 → 节点/连线/文字回落
        //   SVG 默认黑色填充（亮色主题"一团黑"、暗色主题"边框连线不可见"的双症状根因）。
        //   正确做法：克隆体改用新 id，并把内联 <style> 中旧 id 前缀整体替换，主题样式完整生效
        var svgOldId = svg.getAttribute('id');
        if (svgOldId) {
          var svgNewId = 'mermaid-zoom-clone';
          var styleEl = clone.querySelector('style');
          if (styleEl && styleEl.textContent && styleEl.textContent.indexOf(svgOldId) !== -1) {
            styleEl.textContent = styleEl.textContent.split(svgOldId).join(svgNewId);
          }
          clone.setAttribute('id', svgNewId);
        }
        clone.style.maxWidth = 'none';
        clone.style.width = 'auto';
        clone.style.height = 'auto';
        clone.style.display = 'block';
        clone.style.margin = '12px auto';
        zoomState.clone = clone;
        canvas.appendChild(clone);
        applyZoomDialogTheme();
        setZoomScale(1.5);
        canvas.scrollLeft = 0;
        canvas.scrollTop = 0;
        dialog.showModal();
      });
    });
  }

  // ==================================================================
  // v5.20 P1-1 details 展开惰性渲染（U18 根因修复）
  //   根因：mermaid.run() 仅在页面加载时执行一次；折叠 <details>（display:none）
  //   内文本测量失败，22/22 图保持原始文本。修法：toggle 事件（不冒泡，捕获委托）
  //   驱动按需渲染——details 展开时渲染其内未处理的 .mermaid（幂等，主题切换后同样生效）
  // ==================================================================
  function setupDetailsLazyRender() {
    document.addEventListener('toggle', function (e) {
      var details = e.target;
      if (!details || details.tagName !== 'DETAILS' || !details.open) return;
      if (typeof mermaid === 'undefined') return;
      var pending = Array.prototype.slice.call(
        details.querySelectorAll('div.mermaid:not([data-processed])')
      );
      if (pending.length === 0) return;
      // rAF 确保 open 态布局已提交（文本测量可用）
      requestAnimationFrame(function () {
        if (!details.open) return;
        try {
          mermaid.run({
            nodes: pending,
            postRenderCallback: function () {
              pending.forEach(function (el) {
                var svg = el.querySelector('svg');
                if (svg) {
                  svg.setAttribute('role', 'img');
                  svg.style.maxWidth = '100%';
                  svg.style.height = 'auto';
                }
              });
              bindZoomToSvgs();
            }
          });
        } catch (err) {
          console.warn('[Demora] details 惰性渲染失败:', err);
        }
      });
    }, true);
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
          // v5.20 P1-2：放大弹窗配色随主题实时适配（弹窗打开态下亦生效）
          applyZoomDialogTheme();
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
      setupDetailsLazyRender(); // v5.20 P1-1：details 展开惰性渲染（U18）
    });
  } else {
    initMermaid();
    setupThemeObserver();
    setupDetailsLazyRender(); // v5.20 P1-1：details 展开惰性渲染（U18）
  }
})();
