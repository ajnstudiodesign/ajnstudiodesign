/* smooth-scroll.js : eased mouse-wheel scrolling for desktop */
(function () {
  const EASE = 0.05;      /* lower = smoother/slower, higher = faster */
  const WHEEL_SPEED = 1;  /* 1 = normal, 1.5 = faster wheel steps */

  /* Skip on touch devices and for users who prefer reduced motion */
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let current = window.scrollY;
  let target = window.scrollY;
  let running = false;
  let last = 0;

  const maxScroll = () =>
    Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  const clamp = (v) => Math.min(Math.max(v, 0), maxScroll());

  /* Let inner scrollable boxes (menus, textareas) scroll normally */
  function insideScrollable(el, deltaY) {
    while (el && el !== document.body && el !== document.documentElement) {
      const s = getComputedStyle(el);
      const canScroll = /(auto|scroll)/.test(s.overflowY) &&
                        el.scrollHeight > el.clientHeight;
      if (canScroll) {
        const atTop = el.scrollTop <= 0 && deltaY < 0;
        const atBottom =
          el.scrollTop + el.clientHeight >= el.scrollHeight - 1 && deltaY > 0;
        if (!atTop && !atBottom) return true;
      }
      el = el.parentElement;
    }
    return false;
  }

  function onWheel(e) {
    if (e.ctrlKey || e.defaultPrevented) return;      /* pinch / zoom */
    if (insideScrollable(e.target, e.deltaY)) return;

    let dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 33;                  /* lines -> px */
    if (e.deltaMode === 2) dy *= window.innerHeight;  /* pages -> px */

    e.preventDefault();
    target = clamp(target + dy * WHEEL_SPEED);
    start();
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(tick);
  }

  function tick(now) {
    const dt = Math.min(now - last, 50);
    last = now;

    /* frame-rate independent easing (EASE is per 60fps frame) */
    const k = 1 - Math.pow(1 - EASE, dt / 16.667);
    current += (target - current) * k;

    if (Math.abs(target - current) < 0.5) {
      current = target;
      running = false;
    }
    window.scrollTo(0, current);
    if (running) requestAnimationFrame(tick);
  }

  /* Keep in sync when scrolling happens by other means
     (scrollbar drag, keyboard, anchor links, back button) */
  window.addEventListener('scroll', function () {
    if (!running) {
      current = target = window.scrollY;
    }
  }, { passive: true });

  window.addEventListener('resize', function () {
    target = clamp(target);
    current = clamp(current);
  });

  window.addEventListener('wheel', onWheel, { passive: false });
})();
