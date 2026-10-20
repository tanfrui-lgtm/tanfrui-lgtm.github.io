/* An original trajectory map for navigating the portfolio.
   HTML links remain functional without WebGL. Three.js r180 is vendored under MIT. */
(() => {
  'use strict';

  const scriptBase = new URL('.', document.currentScript?.src || location.href);
  const noop = () => {};
  let threePromise;
  let current = null;

  function initKineticScene() {
    const stage = document.querySelector('.kinetic-stage');
    const map = stage?.querySelector('.scene-map');
    const canvas = map?.querySelector('#kinetic-canvas');
    if (current?.map === map && map?.isConnected) return current.dispose;
    current?.dispose();
    if (!stage || !map) return noop;

    const nodes = [...map.querySelectorAll('[data-scene-node]')]
      .sort((a, b) => Number(a.dataset.sceneNode) - Number(b.dataset.sceneNode));
    const previews = [...stage.querySelectorAll('[data-scene-preview]')];
    const status = stage.querySelector('[data-scene-status]');
    if (!nodes.length) return noop;

    let disposed = false;
    let releaseScene = noop;
    let sceneUpdate = noop;
    let selected = 0;
    let drag = null;
    let suppressClickUntil = 0;
    const removeListeners = [];
    const pointer = { x: 0, y: 0, active: false };
    const listen = (target, type, handler, options) => {
      target?.addEventListener(type, handler, options);
      removeListeners.push(() => target?.removeEventListener(type, handler, options));
    };

    function select(index) {
      const next = (index + nodes.length) % nodes.length;
      const changed = next !== selected;
      selected = next;
      stage.dataset.activeNode = String(selected);
      nodes.forEach((node, i) => node.classList.toggle('is-active', i === selected));
      previews.forEach(preview => {
        const active = Number(preview.dataset.scenePreview) === selected;
        preview.hidden = !active;
        preview.classList.toggle('is-active', active);
      });
      if (changed && status) {
        const label = (nodes[selected].querySelector('.scene-node-label') || nodes[selected]).cloneNode(true);
        label.querySelectorAll('[aria-hidden="true"]').forEach(item => item.remove());
        status.textContent = label.textContent.trim();
      }
      sceneUpdate();
    }

    function updatePointer(event) {
      const rect = map.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = rect.height - (event.clientY - rect.top);
      pointer.active = true;
      if (drag?.id === event.pointerId) {
        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        if (!drag.started && Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
          drag = null;
          return; // A vertical gesture remains ordinary page scrolling.
        }
        if (Math.abs(dx) >= 60 && Math.abs(dx) > Math.abs(dy) * 1.25) {
          if (!drag.started) {
            drag.started = true;
            try { map.setPointerCapture(event.pointerId); } catch (_) { /* Optional. */ }
            map.classList.add('is-dragging');
          }
          select(selected + (dx < 0 ? 1 : -1));
          drag.startX = event.clientX;
          drag.startY = event.clientY;
          suppressClickUntil = performance.now() + 500;
        }
        return;
      }
      if (event.pointerType === 'touch' || document.activeElement?.matches('[data-scene-node]:focus-visible')) return;
      let nearest = -1;
      let distance = Math.min(rect.width * .24, 135);
      nodes.forEach((node, i) => {
        const box = (node.querySelector('.scene-dot') || node).getBoundingClientRect();
        const d = Math.hypot(event.clientX - box.left - box.width / 2, event.clientY - box.top - box.height / 2);
        if (d < distance) { nearest = i; distance = d; }
      });
      if (nearest >= 0 && nearest !== selected) select(nearest);
    }

    function endDrag(event) {
      if (!drag || event.pointerId !== drag.id) return;
      if (drag.started) suppressClickUntil = performance.now() + 350;
      try {
        if (map.hasPointerCapture(event.pointerId)) map.releasePointerCapture(event.pointerId);
      } catch (_) { /* A cancelled touch may already have released capture. */ }
      drag = null;
      map.classList.remove('is-dragging');
    }

    nodes.forEach((node, i) => {
      listen(node, 'pointerenter', () => { if (!drag?.started) select(i); }, { passive: true });
      listen(node, 'focus', () => select(i));
      listen(node, 'keydown', event => {
        let target;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = (i + 1) % nodes.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = (i - 1 + nodes.length) % nodes.length;
        if (event.key === 'Home') target = 0;
        if (event.key === 'End') target = nodes.length - 1;
        if (target === undefined) return;
        event.preventDefault();
        select(target);
        nodes[target].focus({ preventScroll: true });
      });
    });
    listen(stage.querySelector('.scene-prev'), 'click', () => select(selected - 1));
    listen(stage.querySelector('.scene-next'), 'click', () => select(selected + 1));
    listen(map, 'pointermove', updatePointer, { passive: true });
    listen(map, 'pointerleave', () => { pointer.active = false; }, { passive: true });
    listen(map, 'pointerdown', event => {
      if (event.button !== 0 || event.target.closest('a,button,input,select,textarea')) return;
      drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, started: false };
    }, { passive: true });
    listen(window, 'pointerup', endDrag, { passive: true });
    listen(window, 'pointercancel', endDrag, { passive: true });
    listen(map, 'click', event => {
      if (performance.now() >= suppressClickUntil) return;
      event.preventDefault();
      event.stopPropagation();
    }, true);
    select(0);

    const instance = {
      map,
      dispose() {
        if (disposed) return;
        disposed = true;
        releaseScene();
        removeListeners.forEach(remove => remove());
        stage.classList.remove('kinetic-ready');
        if (current === instance) current = null;
      }
    };
    current = instance;
    stage.dataset.sceneState = canvas ? 'loading' : 'fallback';
    if (!canvas) return instance.dispose;

    threePromise ||= import(new URL('assets/vendor/three-0.180.0/three.module.min.js', scriptBase).href);
    threePromise.then(T => {
      if (disposed || !canvas.isConnected) return;
      try {
        const scene = buildTrajectoryScene(T, canvas, stage, map, nodes, pointer, () => selected);
        releaseScene = scene.dispose;
        sceneUpdate = scene.update;
      } catch (error) {
        stage.classList.remove('kinetic-ready');
        stage.dataset.sceneState = 'fallback';
        console.warn('Trajectory map: the accessible navigation remains available.', error?.message || error);
      }
    }).catch(() => {
      if (!disposed) stage.dataset.sceneState = 'fallback';
    });
    return instance.dispose;
  }

  function buildTrajectoryScene(T, canvas, stage, map, nodes, pointer, selectedIndex) {
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let manualPaused = document.documentElement.dataset.motionPaused === 'true';
    let stopped = false;
    let visible = true;
    let running = false;
    let lastFrame = 0;
    let elapsed = 0;
    let width = 1;
    let height = 1;
    let renderer;
    let resizeObserver;
    let intersectionObserver;
    const geometries = new Set();
    const materials = new Set();
    const removeListeners = [];
    const scene = new T.Scene();
    const camera = new T.OrthographicCamera(0, 1, 1, 0, .1, 100);
    camera.position.z = 20;
    const trackGeometry = value => (geometries.add(value), value);
    const trackMaterial = value => (materials.add(value), value);
    const listen = (target, type, handler, options) => {
      target.addEventListener(type, handler, options);
      removeListeners.push(() => target.removeEventListener(type, handler, options));
    };
    const paused = () => reduceMotion.matches || manualPaused;

    function dispose() {
      if (stopped) return;
      stopped = true;
      renderer?.setAnimationLoop(null);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      removeListeners.forEach(remove => remove());
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      renderer?.dispose();
      renderer?.forceContextLoss();
    }

    try {
      renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
      renderer.outputColorSpace = T.SRGBColorSpace;

      const gridGeometry = trackGeometry(new T.BufferGeometry());
      const grid = new T.Points(gridGeometry, trackMaterial(new T.PointsMaterial({
        color: 0x7b91b5, size: 1.45, sizeAttenuation: false, transparent: true, opacity: .26, depthTest: false
      })));
      grid.renderOrder = -2;
      scene.add(grid);

      function line(points, material) {
        const geometry = trackGeometry(new T.BufferGeometry().setFromPoints(points));
        const shape = new T.Line(geometry, material);
        scene.add(shape);
        return shape;
      }
      const routes = nodes.map((_, i) => {
        const material = trackMaterial(new T.LineBasicMaterial({
          color: 0x244be2, transparent: true, opacity: .25, depthTest: false
        }));
        const geometry = trackGeometry(new T.BufferGeometry());
        geometry.setAttribute('position', new T.BufferAttribute(new Float32Array(49 * 3), 3));
        const shape = new T.Line(geometry, material);
        scene.add(shape);
        const referenceMaterial = trackMaterial(new T.LineDashedMaterial({
          color: 0x49607e, transparent: true, opacity: .17, dashSize: 3, gapSize: 7, depthTest: false
        }));
        const reference = line([new T.Vector3(), new T.Vector3()], referenceMaterial);
        reference.renderOrder = -1;
        return {
          start: new T.Vector2(), end: new T.Vector2(), home: new T.Vector2(),
          control: new T.Vector2(), velocity: new T.Vector2(), material, shape, reference, index: i
        };
      });

      const markers = nodes.map(() => {
        const points = [];
        for (let i = 0; i <= 48; i++) {
          const angle = i / 48 * Math.PI * 2;
          points.push(new T.Vector3(Math.cos(angle) * 16, Math.sin(angle) * 16, 0));
        }
        const material = trackMaterial(new T.LineBasicMaterial({
          color: 0x244be2, transparent: true, opacity: .16, depthTest: false
        }));
        return line(points, material);
      });

      function agentMarker(seed) {
        const group = new T.Group();
        const material = trackMaterial(new T.LineBasicMaterial({
          color: seed ? 0x5a749e : 0x244be2, transparent: true, opacity: seed ? .7 : .95, depthTest: false
        }));
        const parts = [];
        const p = (x, y) => new T.Vector3(x, y, 1);
        // A heading marker represents an agent's decision along a trajectory.
        // Its pointed hull and short wake remain neutral across research domains.
        const outline = [[0, 11], [-6, -7], [0, -3], [6, -7], [0, 11]];
        for (let i = 0; i < outline.length - 1; i++) {
          parts.push(p(...outline[i]), p(...outline[i + 1]));
        }
        parts.push(p(-3, -11), p(-3, -16), p(3, -11), p(3, -16));
        group.add(new T.LineSegments(trackGeometry(new T.BufferGeometry().setFromPoints(parts)), material));
        const hull = new T.Shape();
        hull.moveTo(0, 8);
        hull.lineTo(-3.7, -4);
        hull.lineTo(0, -1.6);
        hull.lineTo(3.7, -4);
        hull.closePath();
        const body = new T.Mesh(trackGeometry(new T.ShapeGeometry(hull)), trackMaterial(
          new T.MeshBasicMaterial({ color: seed ? 0x607ba8 : 0x244be2, transparent: true, opacity: .7, depthTest: false })
        ));
        group.add(body);
        group.scale.setScalar(seed ? .7 : 1);
        group.renderOrder = 3;
        scene.add(group);
        return { group, seed };
      }
      const agents = [agentMarker(0), agentMarker(1), agentMarker(2)];
      const point = new T.Vector2();
      const tangent = new T.Vector2();
      const force = new T.Vector2();
      const delta = new T.Vector2();

      function sample(route, t, out) {
        const s = 1 - t;
        return out.set(
          s * s * route.start.x + 2 * s * t * route.control.x + t * t * route.end.x,
          s * s * route.start.y + 2 * s * t * route.control.y + t * t * route.end.y
        );
      }
      function updateGeometry() {
        const selected = selectedIndex();
        routes.forEach(route => {
          const position = route.shape.geometry.getAttribute('position');
          for (let i = 0; i < 49; i++) {
            sample(route, i / 48, point);
            position.setXYZ(i, point.x, point.y, 0);
          }
          position.needsUpdate = true;
          route.shape.geometry.computeBoundingSphere();
          route.material.opacity = (route.index + 1) % nodes.length === selected ? .83 : .27;
        });
        markers.forEach((marker, i) => {
          marker.material.opacity = i === selected ? .46 : .13;
          marker.scale.setScalar(i === selected ? 1.12 + Math.sin(elapsed * 1.8) * .05 : 1);
        });
        // A small formation follows the loop. The route stays anchored to usable links.
        agents.forEach(({ group, seed }) => {
          const progress = (elapsed * .045 + .14 + seed * .055) % nodes.length;
          const index = Math.floor(progress);
          const t = progress - index;
          const route = routes[index];
          sample(route, t, point);
          tangent.set(
            2 * (1 - t) * (route.control.x - route.start.x) + 2 * t * (route.end.x - route.control.x),
            2 * (1 - t) * (route.control.y - route.start.y) + 2 * t * (route.end.y - route.control.y)
          );
          group.position.set(point.x, point.y, 2);
          group.rotation.z = Math.atan2(tangent.y, tangent.x) - Math.PI / 2;
        });
      }
      function render() {
        if (stopped || !canvas.isConnected) return;
        updateGeometry();
        renderer.render(scene, camera);
        stage.classList.add('kinetic-ready');
        stage.dataset.sceneState = paused() ? 'static' : 'ready';
      }
      function resize() {
        if (stopped) return;
        const rect = map.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        width = rect.width;
        height = rect.height;
        renderer.setSize(width, height, false);
        camera.right = width;
        camera.top = height;
        camera.updateProjectionMatrix();
        const centers = nodes.map(node => {
          const box = (node.querySelector('.scene-dot') || node).getBoundingClientRect();
          return new T.Vector2(box.left + box.width / 2 - rect.left, height - (box.top + box.height / 2 - rect.top));
        });
        const center = centers.reduce((sum, value) => sum.add(value), new T.Vector2()).multiplyScalar(1 / centers.length);
        routes.forEach((route, i) => {
          route.start.copy(centers[i]);
          route.end.copy(centers[(i + 1) % centers.length]);
          route.home.copy(route.start).add(route.end).multiplyScalar(.5);
          delta.copy(route.home).sub(center).normalize().multiplyScalar(Math.min(width, height) * .085);
          route.home.add(delta);
          route.control.copy(route.home);
          route.velocity.set(0, 0);
          const vertices = route.reference.geometry.getAttribute('position');
          vertices.setXYZ(0, route.start.x, route.start.y, -.1);
          vertices.setXYZ(1, route.end.x, route.end.y, -.1);
          vertices.needsUpdate = true;
          route.reference.computeLineDistances();
          route.reference.geometry.computeBoundingSphere();
          markers[i].position.set(centers[i].x, centers[i].y, 0);
        });
        const dots = [];
        for (let x = 16; x < width; x += 28) {
          for (let y = 16; y < height; y += 28) dots.push(x, y, -1);
        }
        gridGeometry.setAttribute('position', new T.Float32BufferAttribute(dots, 3));
        gridGeometry.computeBoundingSphere();
        render();
      }
      function animate(now) {
        if (stopped) return;
        if (lastFrame && now - lastFrame < 31) return;
        const dt = Math.min(lastFrame ? (now - lastFrame) / 1000 : 1 / 30, .06);
        lastFrame = now;
        elapsed += dt;
        routes.forEach(route => {
          force.copy(route.home).sub(route.control).multiplyScalar(12);
          if (pointer.active) {
            delta.set(route.control.x - pointer.x, route.control.y - pointer.y);
            const distance = Math.max(delta.length(), 1);
            const radius = Math.min(width, height) * .45;
            if (distance < radius) {
              delta.multiplyScalar(1 / distance);
              force.addScaledVector(delta, (1 - distance / radius) ** 2 * 540);
            }
          }
          route.velocity.addScaledVector(force, dt).multiplyScalar(Math.exp(-4.6 * dt));
          route.velocity.clampLength(0, 90);
          route.control.addScaledVector(route.velocity, dt);
        });
        render();
      }
      function syncLoop() {
        if (stopped) return;
        const shouldRun = visible && !document.hidden && !paused();
        if (running !== shouldRun) {
          running = shouldRun;
          lastFrame = 0;
          renderer.setAnimationLoop(shouldRun ? animate : null);
        }
        render();
      }
      listen(window, 'portfolio-motion-change', event => {
        manualPaused = typeof event.detail?.paused === 'boolean'
          ? event.detail.paused
          : document.documentElement.dataset.motionPaused === 'true';
        pointer.active = false;
        syncLoop();
      });
      listen(document, 'visibilitychange', syncLoop);
      listen(reduceMotion, 'change', syncLoop);
      listen(canvas, 'webglcontextlost', () => {
        dispose();
        stage.classList.remove('kinetic-ready');
        stage.dataset.sceneState = 'fallback';
      });
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(map);
      nodes.forEach(node => resizeObserver.observe(node));
      intersectionObserver = new IntersectionObserver(entries => {
        visible = entries[0]?.isIntersecting ?? false;
        syncLoop();
      }, { rootMargin: '50px' });
      intersectionObserver.observe(map);
      document.fonts?.ready.then(() => { if (!stopped) resize(); });
      resize();
      syncLoop();
      return { dispose, update: render };
    } catch (error) {
      dispose();
      throw error;
    }
  }

  window.initKineticScene = initKineticScene;
})();
