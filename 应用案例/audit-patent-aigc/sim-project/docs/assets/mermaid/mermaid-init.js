// mermaid-init.js — Demora v5.7 流程图渲染初始化脚本
//
// 作用：
//   1. 配置 Mermaid 主题（暗色，对齐 Demora 配色）
//   2. 启动 Mermaid 渲染（startOnLoad: true，扫描 <div class="mermaid">）
//   3. 加载失败时降级为源码显示（不阻塞页面）
//
// 依赖：mermaid.min.js（必须在本脚本之前加载）
// 守卫：typeof mermaid === 'undefined' 时仅打印警告，不抛异常

document.addEventListener('DOMContentLoaded', function () {
  // 守卫：mermaid.min.js 加载失败时降级
  if (typeof mermaid === 'undefined') {
    console.warn('[Demora] mermaid.min.js 加载失败，流程图将以源码形式显示');
    // 将所有 <div class="mermaid"> 转为 <pre> 显示源码，避免空白
    document.querySelectorAll('div.mermaid').forEach(function (el) {
      const pre = document.createElement('pre');
      pre.className = 'mermaid-fallback';
      pre.textContent = el.textContent;
      el.parentNode.replaceChild(pre, el);
    });
    return;
  }

  // 初始化 Mermaid（暗色主题 + Demora 配色变量）
  mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    themeVariables: {
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
    },
    flowchart: {
      curve: 'basis',
      useMaxWidth: true,
      htmlLabels: true
    },
    sequence: {
      useMaxWidth: true,
      actorMargin: 50,
      boxMargin: 10
    },
    state: {
      useMaxWidth: true
    },
    er: {
      useMaxWidth: true
    },
    gantt: {
      useMaxWidth: true
    }
  });

  // 渲染完成后给 SVG 添加可访问性属性
  // Mermaid 11.x 在 startOnLoad: true 模式下会自动遍历 .mermaid 元素
  // 这里通过 MutationObserver 监听 SVG 注入完成
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (node) {
        if (node.nodeType === 1 && node.tagName === 'SVG' &&
            node.parentNode && node.parentNode.classList.contains('mermaid')) {
          node.setAttribute('role', 'img');
          node.style.maxWidth = '100%';
          node.style.height = 'auto';
        }
      });
    });
  });
  document.querySelectorAll('div.mermaid').forEach(function (el) {
    observer.observe(el, { childList: true, subtree: true });
  });

  // 30 秒后停止观察（避免长期占用）
  setTimeout(function () { observer.disconnect(); }, 30000);

  console.info('[Demora] mermaid 初始化完成，已扫描 ' +
    document.querySelectorAll('div.mermaid').length + ' 个流程图');
});
