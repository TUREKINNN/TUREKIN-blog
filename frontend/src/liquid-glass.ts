// Liquid Glass v13 — visionOS: fluid micro-glow tracking + theme adaptation
(() => {
  const X = '--glow-x', Y = '--glow-y', H = 'is-hovered';
  const S = '.glass-deep, nav.glass, nav.glass-deep, nav[class*="glass"]';
  function adaptTheme() {
    const dk = document.documentElement.classList.contains('dark');
    document.documentElement.style.setProperty('--lg-bg',
      dk ? 'rgba(20,20,25,0.15)' : 'rgba(255,255,255,0.65)');
  }
  function track(e: PointerEvent) {
    const el = e.currentTarget as HTMLElement, r = el.getBoundingClientRect();
    el.style.setProperty(X, ((e.clientX - r.left) / r.width * 100) + '%');
    el.style.setProperty(Y, ((e.clientY - r.top) / r.height * 100) + '%');
  }
  document.addEventListener('DOMContentLoaded', () => {
    adaptTheme();
    document.querySelectorAll<HTMLElement>(S).forEach(el => {
      el.addEventListener('pointerenter', () => el.classList.add(H), { passive: true });
      el.addEventListener('pointerleave', () => el.classList.remove(H), { passive: true });
      el.addEventListener('pointermove', track as EventListener, { passive: true });
    });
    new MutationObserver(adaptTheme).observe(document.documentElement,
      { attributes: true, attributeFilter: ['class'] });
  });
})();
