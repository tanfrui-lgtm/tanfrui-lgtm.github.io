(() => {
  let releaseActive = null;

  // A short-lived canvas overlay. It never replaces the native pointer or handles navigation.
  window.initPointerEffects = () => {
    releaseActive?.();
    const root = document.documentElement;
    const fine = matchMedia('(pointer: fine)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const canvas = document.createElement('canvas');
    canvas.className = 'pointer-water';
    canvas.setAttribute('aria-hidden', 'true');
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return () => {};
    document.body.append(canvas);

    const listeners = [];
    const bubbles = [];
    const ripples = [];
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, dark: false, known: false };
    let frame = 0;
    let previousTime = 0;
    let lastInput = -Infinity;
    let lastBubble = -Infinity;
    let width = 0;
    let height = 0;
    let disposed = false;
    let paused = root.dataset.motionPaused === 'true';
    let enabled = false;
    const on = (target, name, handler, options) => {
      target.addEventListener(name, handler, options);
      listeners.push(() => target.removeEventListener(name, handler, options));
    };
    const rgba = (dark, alpha) => dark
      ? `rgba(220,238,255,${alpha})`
      : `rgba(37,78,218,${alpha})`;
    const clear = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      lastInput = -Infinity;
      pointer.known = false;
      pointer.vx = pointer.vy = 0;
      bubbles.length = ripples.length = 0;
      context.clearRect(0, 0, width, height);
    };
    const sync = () => {
      enabled = fine.matches && !reduced.matches && !paused && !document.hidden;
      canvas.hidden = !enabled;
      if (!enabled) clear();
    };
    const resize = () => {
      width = innerWidth;
      height = innerHeight;
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.ceil(width * ratio);
      canvas.height = Math.ceil(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      clear();
    };
    const addBubble = (x, y, radius, dark, vx = 0, vy = 0) => {
      if (bubbles.length >= 42) bubbles.shift();
      bubbles.push({
        x, y, radius, dark, vx, vy,
        age: 0,
        life: 550 + Math.random() * 300,
        phase: Math.random() * Math.PI * 2,
      });
    };
    const drawBubble = (x, y, radius, alpha, dark, phase) => {
      context.save();
      context.translate(x, y);
      context.rotate(phase);
      context.scale(1 + Math.sin(phase) * .045, 1 - Math.sin(phase) * .045);
      const fill = context.createRadialGradient(-radius * .3, -radius * .35, 0, 0, 0, radius);
      fill.addColorStop(0, dark ? `rgba(255,255,255,${alpha * .12})` : `rgba(255,255,255,${alpha * .32})`);
      fill.addColorStop(.6, rgba(dark, alpha * .025));
      fill.addColorStop(1, rgba(dark, alpha * .15));
      context.beginPath();
      context.arc(0, 0, radius, 0, Math.PI * 2);
      context.fillStyle = fill;
      context.fill();
      context.lineWidth = .8;
      context.strokeStyle = rgba(dark, alpha * .48);
      context.stroke();
      context.beginPath();
      context.arc(0, 0, radius * .72, Math.PI * 1.08, Math.PI * 1.54);
      context.lineWidth = 1.1;
      context.strokeStyle = `rgba(255,255,255,${alpha * .82})`;
      context.stroke();
      context.restore();
    };
    const drawRipple = (ripple, progress, offset) => {
      const t = Math.max(0, Math.min(1, progress - offset));
      if (!t) return;
      const radius = 4 + (1 - Math.pow(1 - t, 3)) * (offset ? 45 : 69);
      const alpha = Math.pow(1 - t, 1.8) * (offset ? .32 : .42);
      context.beginPath();
      for (let i = 0; i <= 48; i++) {
        const angle = i / 48 * Math.PI * 2;
        const wave = 1 + Math.sin(angle * 3 + ripple.phase + t * 5) * .027 * (1 - t)
          + Math.sin(angle * 5 - t * 3) * .013;
        const x = ripple.x + Math.cos(angle) * radius * wave;
        const y = ripple.y + Math.sin(angle) * radius * wave * .93;
        if (!i) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.closePath();
      context.strokeStyle = rgba(ripple.dark, alpha);
      context.lineWidth = .8 + (1 - t) * .55;
      context.stroke();
    };
    const animate = time => {
      frame = 0;
      if (!enabled || disposed) return;
      const elapsed = previousTime ? Math.min(40, time - previousTime) : 16;
      const step = elapsed / 16.667;
      previousTime = time;
      context.clearRect(0, 0, width, height);

      const idle = time - lastInput;
      if (pointer.known && idle < 480) {
        pointer.vx = (pointer.vx + (pointer.tx - pointer.x) * .15 * step) * Math.pow(.64, step);
        pointer.vy = (pointer.vy + (pointer.ty - pointer.y) * .15 * step) * Math.pow(.64, step);
        pointer.x += pointer.vx * step;
        pointer.y += pointer.vy * step;
        const speed = Math.hypot(pointer.vx, pointer.vy);
        if (idle < 110 && speed > .7 && time - lastBubble > 29) {
          addBubble(
            pointer.x, pointer.y,
            2.5 + Math.random() * 4.5 + Math.min(speed * .05, 2),
            pointer.dark,
            -pointer.vx * .035, -pointer.vy * .035 - .05
          );
          lastBubble = time;
        }
        const alpha = Math.max(0, 1 - idle / 480) * .78;
        drawBubble(pointer.x, pointer.y, 10 + Math.min(speed * .2, 6), alpha, pointer.dark, time * .001);
      }

      for (let i = bubbles.length - 1; i >= 0; i--) {
        const bubble = bubbles[i];
        bubble.age += elapsed;
        if (bubble.age >= bubble.life) { bubbles.splice(i, 1); continue; }
        const progress = bubble.age / bubble.life;
        bubble.x += bubble.vx * step;
        bubble.y += bubble.vy * step - .075 * step;
        bubble.vx *= Math.pow(.97, step);
        bubble.vy *= Math.pow(.97, step);
        drawBubble(
          bubble.x, bubble.y,
          bubble.radius * (1 + progress * .35),
          Math.pow(1 - progress, 1.6) * .58,
          bubble.dark, bubble.phase + progress * .3
        );
      }
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        ripple.age += elapsed;
        if (ripple.age >= 900) { ripples.splice(i, 1); continue; }
        drawRipple(ripple, ripple.age / 720, 0);
        drawRipple(ripple, ripple.age / 720, .18);
      }
      if (bubbles.length || ripples.length || (pointer.known && idle < 480)) {
        frame = requestAnimationFrame(animate);
      } else {
        previousTime = 0;
        context.clearRect(0, 0, width, height);
      }
    };
    const request = () => {
      if (!frame && enabled && !disposed) frame = requestAnimationFrame(animate);
    };
    const themeAt = target => Boolean(target instanceof Element &&
      target.closest('.moments-section, .contact-section, [data-pointer-theme="dark"]'));
    const move = event => {
      if (!enabled || event.pointerType !== 'mouse') return;
      if (event.target instanceof Element && event.target.closest('input,textarea,select,[contenteditable="true"],video')) {
        return;
      }
      if (pointer.known && event.clientX === pointer.tx && event.clientY === pointer.ty) return;
      if (!pointer.known || performance.now() - lastInput > 500) {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.vx = pointer.vy = 0;
      }
      pointer.tx = event.clientX;
      pointer.ty = event.clientY;
      pointer.dark = themeAt(event.target);
      pointer.known = true;
      lastInput = performance.now();
      request();
    };
    const splash = event => {
      if (!enabled || event.pointerType !== 'mouse' || event.button !== 0) return;
      const dark = themeAt(event.target);
      if (ripples.length >= 5) ripples.shift();
      ripples.push({ x: event.clientX, y: event.clientY, dark, age: 0, phase: Math.random() * 6.28 });
      for (let i = 0; i < 6; i++) {
        const angle = i / 6 * Math.PI * 2 + Math.random() * .3;
        const force = .45 + Math.random() * .6;
        addBubble(event.clientX + Math.cos(angle) * 7, event.clientY + Math.sin(angle) * 7,
          2.5 + Math.random() * 2.5, dark, Math.cos(angle) * force, Math.sin(angle) * force);
      }
      request();
    };

    on(window, 'pointermove', move, { passive: true });
    on(window, 'pointerdown', splash, { passive: true });
    on(document.documentElement, 'pointerleave', clear, { passive: true });
    on(window, 'blur', clear);
    on(window, 'pagehide', clear);
    on(window, 'resize', resize, { passive: true });
    on(window, 'portfolio-motion-change', event => {
      paused = event.detail?.paused ?? root.dataset.motionPaused === 'true';
      sync();
    });
    on(document, 'visibilitychange', sync);
    on(fine, 'change', sync);
    on(reduced, 'change', sync);
    resize();
    sync();

    const cleanup = () => {
      if (disposed) return;
      disposed = true;
      clear();
      listeners.forEach(remove => remove());
      canvas.remove();
      if (releaseActive === cleanup) releaseActive = null;
    };
    releaseActive = cleanup;
    return cleanup;
  };
})();
