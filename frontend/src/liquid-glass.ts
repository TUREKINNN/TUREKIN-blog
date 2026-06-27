// Liquid Glass v14 — iOS 26: 鼠标追踪光晕 + 流光角度 + 主题自适应
(() => {
  const X = '--glow-x', Y = '--glow-y', H = 'is-hovered';
  // 扩展选择器：侧边栏 + 导航 + 卡片 + 统计面板
  const S = '.glass-deep, nav.glass, nav.glass-deep, nav[class*="glass"], article.card, .hero-stat, .glass-panel';

  function adaptTheme() {
    const dk = document.documentElement.classList.contains('dark');
    document.documentElement.style.setProperty('--lg-bg',
      dk ? 'rgba(20,20,25,0.15)' : 'rgba(255,255,255,0.65)');
  }

  function track(e: PointerEvent) {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const xPct = ((e.clientX - r.left) / r.width * 100);
    const yPct = ((e.clientY - r.top) / r.height * 100);
    el.style.setProperty(X, xPct + '%');
    el.style.setProperty(Y, yPct + '%');

    // 更新内部流光子元素（如果存在）
    const glow = el.querySelector('.hero-stat-glow, .liquid-flow') as HTMLElement | null;
    if (glow) {
      glow.style.setProperty('--glow-x', xPct + '%');
      glow.style.setProperty('--glow-y', yPct + '%');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    adaptTheme();

    // 为所有玻璃元素绑定交互
    document.querySelectorAll<HTMLElement>(S).forEach(el => {
      el.addEventListener('pointerenter', () => el.classList.add(H), { passive: true });
      el.addEventListener('pointerleave', () => el.classList.remove(H), { passive: true });
      el.addEventListener('pointermove', track as EventListener, { passive: true });
    });

    // 主题切换监听
    new MutationObserver(adaptTheme).observe(document.documentElement,
      { attributes: true, attributeFilter: ['class'] });
  });
})();
