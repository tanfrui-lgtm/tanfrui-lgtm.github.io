(() => {
  let releaseActive = null;
  const TRAIL = 12, DROPS = 8, BALLS = TRAIL + DROPS, WAVES = 3;
  const vertexSource = `
    attribute vec2 a_position;
    void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
  `;
  const fragmentSource = `
    precision highp float;
    uniform vec2 u_viewport;
    uniform float u_ratio;
    uniform float u_dark;
    uniform float u_time;
    uniform vec4 u_balls[20];
    uniform vec4 u_waves[3];

    void main() {
      vec2 p = vec2(gl_FragCoord.x / u_ratio, u_viewport.y - gl_FragCoord.y / u_ratio);
      float distance = 10000.0;
      vec2 gradient = vec2(0.0);
      float surfaceRadius = 1.0;
      // Smooth union preserves a continuous liquid surface between spring nodes.
      for (int i = 0; i < 20; i++) {
        vec4 ball = u_balls[i];
        if (ball.z > 0.08) {
          vec2 delta = p - ball.xy;
          float lengthToCenter = length(delta);
          float nextDistance = lengthToCenter - ball.z;
          vec2 nextGradient = delta / max(lengthToCenter, 0.001);
          float softness = min(13.0, ball.z * 0.75 + 2.0);
          float blend = clamp(0.5 + 0.5 * (nextDistance - distance) / softness, 0.0, 1.0);
          distance = mix(nextDistance, distance, blend) - softness * blend * (1.0 - blend);
          gradient = mix(nextGradient, gradient, blend);
          surfaceRadius = mix(ball.z, surfaceRadius, blend);
        }
      }

      float coverage = 1.0 - smoothstep(-0.75, 1.25, distance);
      float depth = clamp(-distance / max(surfaceRadius, 2.0), 0.0, 1.0);
      float radial = 1.0 - depth;
      vec3 normal = normalize(vec3(gradient * radial, sqrt(max(0.025, 1.0 - radial * radial))));
      vec3 light = normalize(vec3(-0.55, -0.7, 0.75));
      float shine = pow(max(dot(normal, normalize(light + vec3(0.0, 0.0, 1.0))), 0.0), 24.0);
      float rim = pow(1.0 - normal.z, 2.0);
      float lowerRim = pow(max(dot(normal, normalize(vec3(0.6, 0.7, 0.2))), 0.0), 8.0);
      float edge = exp(-abs(distance + 0.65) * 0.8);
      vec3 water = mix(vec3(0.16, 0.39, 0.94), vec3(0.48, 0.77, 1.0), u_dark);
      vec3 color = mix(water, vec3(0.92, 0.98, 1.0), clamp(shine * 1.8 + rim * 0.65, 0.0, 1.0));
      color += vec3(0.05, 0.13, 0.16) * lowerRim;
      float alpha = coverage * (0.12 + rim * 0.27 + shine * 0.35 + lowerRim * 0.12);
      alpha += edge * 0.19 * coverage;
      vec3 premultiplied = color * alpha;

      // Two traveling crests per splash, with a small asymmetric capillary ripple.
      for (int i = 0; i < 3; i++) {
        vec4 wave = u_waves[i];
        if (wave.z > 0.0 && wave.z < 1.0) {
          vec2 delta = p - wave.xy;
          float angle = atan(delta.y, delta.x);
          float distortion = sin(angle * 3.0 + wave.z * 7.0) * (1.0 - wave.z) * 2.5;
          float radius = 6.0 + (1.0 - pow(1.0 - wave.z, 2.5)) * 126.0;
          float d = length(delta * vec2(1.0, 1.045)) + distortion;
          float fade = pow(1.0 - wave.z, 1.25);
          float crest = exp(-abs(d - radius) * 0.8);
          float innerCrest = exp(-abs(d - radius * 0.78) * 0.95) * 0.58;
          float waveAlpha = (crest + innerCrest) * fade * 0.56;
          vec3 waveColor = mix(vec3(0.22, 0.48, 0.96), vec3(0.76, 0.91, 1.0), wave.w);
          waveColor = mix(waveColor, vec3(1.0), crest * 0.35);
          premultiplied = waveColor * waveAlpha + premultiplied * (1.0 - waveAlpha);
          alpha = waveAlpha + alpha * (1.0 - waveAlpha);
        }
      }
      gl_FragColor = vec4(premultiplied, alpha);
    }
  `;

  window.initPointerEffects = () => {
    releaseActive?.();
    const root = document.documentElement;
    const fine = matchMedia('(pointer: fine)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const canvas = document.createElement('canvas');
    canvas.className = 'pointer-water';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.dataset.effectState = 'initializing';
    canvas.dataset.particleCount = '0';
    document.body.append(canvas);
    const gl = canvas.getContext('webgl', {
      alpha: true, antialias: false, depth: false, stencil: false,
      premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'low-power',
    });
    if (!gl) {
      canvas.remove();
      return () => {};
    }

    let vertex, fragment, program, buffer;
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        throw new Error('Pointer surface shader unavailable');
      }
      return shader;
    };
    try {
      vertex = compile(gl.VERTEX_SHADER, vertexSource);
      fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
      program = gl.createProgram();
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Pointer surface unavailable');
      gl.useProgram(program);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    } catch {
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
      if (program) gl.deleteProgram(program);
      if (buffer) gl.deleteBuffer(buffer);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
      return () => {};
    }

    const uniforms = Object.fromEntries(['viewport', 'ratio', 'dark', 'time', 'balls', 'waves']
      .map(key => [key, gl.getUniformLocation(program, `u_${key}${key === 'balls' || key === 'waves' ? '[0]' : ''}`)]));
    const trail = Array.from({ length: TRAIL }, () => ({ x: 0, y: 0, vx: 0, vy: 0 }));
    const droplets = [], waves = [], listeners = [];
    const ballData = new Float32Array(BALLS * 4);
    const waveData = new Float32Array(WAVES * 4);
    const pointer = { x: 0, y: 0, known: false, dark: 0 };
    let frame = 0, previousTime = 0, lastInput = -Infinity;
    let width = 0, height = 0, ratio = 1, swell = 0, darkness = 0;
    let disposed = false, contextLost = false, enabled = false;
    let paused = root.dataset.motionPaused === 'true';
    const on = (target, name, handler, options) => {
      target.addEventListener(name, handler, options);
      listeners.push(() => target.removeEventListener(name, handler, options));
    };
    const erase = () => {
      if (contextLost) return;
      gl.disable(gl.SCISSOR_TEST);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };
    const clear = () => {
      cancelAnimationFrame(frame);
      frame = 0; previousTime = 0; lastInput = -Infinity; swell = 0;
      pointer.known = false;
      droplets.length = waves.length = 0;
      canvas.dataset.particleCount = '0';
      canvas.dataset.effectState = enabled ? 'idle' : 'disabled';
      erase();
    };
    const sync = () => {
      enabled = fine.matches && !reduced.matches && !paused && !document.hidden && !contextLost;
      canvas.hidden = !enabled;
      if (!enabled) clear();
      else if (!frame) canvas.dataset.effectState = 'idle';
    };
    const resize = () => {
      width = innerWidth; height = innerHeight;
      // The surface is local and antialiased analytically; more than 1.25 DPR brings little benefit.
      ratio = Math.min(devicePixelRatio || 1, 1.25);
      canvas.width = Math.ceil(width * ratio);
      canvas.height = Math.ceil(height * ratio);
      gl.viewport(0, 0, canvas.width, canvas.height);
      clear();
    };
    const themeAt = target => Number(target instanceof Element &&
      Boolean(target.closest('.moments-section, .contact-section, [data-pointer-theme="dark"]')));
    const excluded = target => target instanceof Element &&
      Boolean(target.closest('input,textarea,select,[contenteditable="true"],video,dialog'));
    const resetTrail = (x, y) => {
      trail.forEach(node => { node.x = x; node.y = y; node.vx = node.vy = 0; });
    };
    const draw = time => {
      frame = 0;
      if (!enabled || disposed) return;
      const elapsed = previousTime ? Math.min(34, time - previousTime) : 16.667;
      const step = elapsed / 16.667;
      previousTime = time;
      const idle = time - lastInput;
      const life = pointer.known ? Math.max(0, 1 - Math.max(0, idle - 150) / 650) : 0;
      darkness += (pointer.dark - darkness) * Math.min(1, step * .18);
      swell *= Math.pow(.9, step);
      ballData.fill(0); waveData.fill(0);
      let minX = width, minY = height, maxX = 0, maxY = 0, count = 0;
      const include = (x, y, r) => {
        minX = Math.min(minX, x - r); minY = Math.min(minY, y - r);
        maxX = Math.max(maxX, x + r); maxY = Math.max(maxY, y + r);
      };
      if (life > 0) {
        let speed = 0;
        trail.forEach((node, index) => {
          const target = index ? trail[index - 1] : pointer;
          const stiffness = index ? .31 : .22;
          node.vx = (node.vx + (target.x - node.x) * stiffness * step) * Math.pow(.61, step);
          node.vy = (node.vy + (target.y - node.y) * stiffness * step) * Math.pow(.61, step);
          node.x += node.vx * step; node.y += node.vy * step;
          if (!index) speed = Math.min(40, Math.hypot(node.vx, node.vy));
          // Limit the total tail to a deliberate local gesture, including fast pointer jumps.
          const distance = Math.hypot(node.x - target.x, node.y - target.y);
          if (index && distance > 14) {
            node.x = target.x + (node.x - target.x) / distance * 14;
            node.y = target.y + (node.y - target.y) / distance * 14;
          }
          const taper = Math.pow(1 - index / TRAIL, 1.15);
          const radius = (21 + speed * .28 + swell * 8) * taper * life;
          ballData.set([node.x, node.y, radius, 1], index * 4);
          include(node.x, node.y, radius + 19);
          if (radius > .08) count++;
        });
      }
      for (let i = droplets.length - 1; i >= 0; i--) {
        const drop = droplets[i];
        drop.age += elapsed;
        if (drop.age > drop.life) { droplets.splice(i, 1); continue; }
        drop.x += drop.vx * step; drop.y += drop.vy * step;
        drop.vx *= Math.pow(.965, step); drop.vy *= Math.pow(.965, step);
        drop.vy += .045 * step;
      }
      droplets.forEach((drop, index) => {
        const radius = drop.radius * Math.pow(1 - drop.age / drop.life, .65);
        ballData.set([drop.x, drop.y, radius, 1], (TRAIL + index) * 4);
        include(drop.x, drop.y, radius + 16); count++;
      });
      for (let i = waves.length - 1; i >= 0; i--) {
        waves[i].age += elapsed;
        if (waves[i].age >= 950) waves.splice(i, 1);
      }
      waves.forEach((wave, index) => {
        waveData.set([wave.x, wave.y, wave.age / 950, wave.dark], index * 4);
        include(wave.x, wave.y, 138);
      });
      erase();
      if (count || waves.length) {
        gl.enable(gl.SCISSOR_TEST);
        const x = Math.max(0, Math.floor(minX * ratio));
        const y = Math.max(0, Math.floor((height - maxY) * ratio));
        const right = Math.min(canvas.width, Math.ceil(maxX * ratio));
        const top = Math.min(canvas.height, Math.ceil((height - minY) * ratio));
        gl.scissor(x, y, Math.max(0, right - x), Math.max(0, top - y));
        gl.uniform2f(uniforms.viewport, width, height);
        gl.uniform1f(uniforms.ratio, ratio);
        gl.uniform1f(uniforms.dark, darkness);
        gl.uniform1f(uniforms.time, time * .001);
        gl.uniform4fv(uniforms.balls, ballData);
        gl.uniform4fv(uniforms.waves, waveData);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        canvas.dataset.particleCount = String(count);
        canvas.dataset.effectState = 'active';
        frame = requestAnimationFrame(draw);
      } else {
        previousTime = 0;
        canvas.dataset.particleCount = '0';
        canvas.dataset.effectState = 'idle';
      }
    };
    const request = () => {
      if (!frame && enabled && !disposed) frame = requestAnimationFrame(draw);
    };
    const move = event => {
      if (!enabled || event.pointerType !== 'mouse') return;
      if (excluded(event.target)) { clear(); return; }
      if (pointer.known && event.clientX === pointer.x && event.clientY === pointer.y) return;
      const time = performance.now();
      if (!pointer.known || time - lastInput > 800) resetTrail(event.clientX, event.clientY);
      pointer.x = event.clientX; pointer.y = event.clientY;
      pointer.dark = themeAt(event.target); pointer.known = true;
      lastInput = time;
      request();
    };
    const splash = event => {
      if (!enabled || event.pointerType !== 'mouse' || event.button !== 0 || excluded(event.target)) return;
      pointer.dark = themeAt(event.target);
      pointer.x = event.clientX; pointer.y = event.clientY;
      if (!pointer.known) resetTrail(event.clientX, event.clientY);
      pointer.known = true; lastInput = performance.now(); swell = 1;
      if (waves.length >= WAVES) waves.shift();
      waves.push({ x: event.clientX, y: event.clientY, dark: pointer.dark, age: 1 });
      droplets.length = 0;
      for (let i = 0; i < DROPS; i++) {
        const angle = i / DROPS * Math.PI * 2 + Math.random() * .23;
        const velocity = 2.4 + Math.random() * 2.4;
        droplets.push({
          x: event.clientX + Math.cos(angle) * 18, y: event.clientY + Math.sin(angle) * 18,
          vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity,
          radius: 5 + Math.random() * 5, age: 0, life: 620 + Math.random() * 230,
        });
      }
      request();
    };
    on(window, 'pointermove', move, { passive: true });
    on(window, 'pointerdown', splash, { passive: true });
    on(root, 'pointerleave', clear, { passive: true });
    on(window, 'blur', clear);
    on(window, 'pagehide', clear);
    on(window, 'resize', resize, { passive: true });
    on(window, 'portfolio-motion-change', event => {
      paused = event.detail?.paused ?? root.dataset.motionPaused === 'true'; sync();
    });
    on(document, 'visibilitychange', sync);
    on(fine, 'change', sync);
    on(reduced, 'change', sync);
    on(canvas, 'webglcontextlost', event => {
      event.preventDefault(); contextLost = true; sync(); canvas.dataset.effectState = 'context-lost';
    });
    resize(); sync();

    const cleanup = () => {
      if (disposed) return;
      disposed = true; clear();
      listeners.forEach(remove => remove());
      if (!contextLost) {
        gl.deleteBuffer(buffer); gl.deleteProgram(program);
        gl.deleteShader(vertex); gl.deleteShader(fragment);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
      canvas.remove();
      if (releaseActive === cleanup) releaseActive = null;
    };
    releaseActive = cleanup;
    return cleanup;
  };
})();
