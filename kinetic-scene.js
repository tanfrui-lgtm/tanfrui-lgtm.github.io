/* Original spatial navigation sculpture. Local Three.js r180, MIT.
   The projected waypoints are ordinary HTML links; WebGL is progressive enhancement. */
(() => {
  'use strict';
  const scriptBase = new URL('.', document.currentScript?.src || location.href);
  const noop = () => {};
  let threePromise;
  let current;

  window.initKineticScene = function initKineticScene() {
    const stage = document.querySelector('.kinetic-stage');
    const map = stage?.querySelector('.scene-map');
    const canvas = map?.querySelector('#kinetic-canvas');
    if (current?.map === map && map?.isConnected) return current.dispose;
    current?.dispose();
    if (!stage || !map) return noop;
    const nodes = [...map.querySelectorAll('[data-scene-node]')].sort((a, b) => +a.dataset.sceneNode - +b.dataset.sceneNode);
    const previews = [...stage.querySelectorAll('[data-scene-preview]')];
    const status = stage.querySelector('[data-scene-status]');
    if (!nodes.length) return noop;

    let disposed = false;
    let selected = 0;
    let engine;
    let drag;
    let suppressClickUntil = 0;
    const removeListeners = [];
    const listen = (target, type, handler, options) => {
      target?.addEventListener(type, handler, options);
      removeListeners.push(() => target?.removeEventListener(type, handler, options));
    };
    function select(index, orient = false) {
      const next = (index + nodes.length) % nodes.length;
      const changed = selected !== next;
      selected = next;
      stage.dataset.activeNode = String(selected);
      nodes.forEach((node, i) => node.classList.toggle('is-active', i === selected));
      previews.forEach(preview => {
        const active = +preview.dataset.scenePreview === selected;
        preview.hidden = !active;
        preview.classList.toggle('is-active', active);
      });
      if (changed && status) {
        const label = (nodes[selected].querySelector('.scene-node-label') || nodes[selected]).cloneNode(true);
        label.querySelectorAll('[aria-hidden="true"]').forEach(item => item.remove());
        status.textContent = label.textContent.trim();
      }
      if (orient) engine?.focus(selected);
      else engine?.render();
    }
    nodes.forEach((node, i) => {
      listen(node, 'pointerenter', () => {
        if (drag?.started) return;
        engine?.hold();
        select(i);
      }, { passive: true });
      listen(node, 'focus', () => select(i, node.matches(':focus-visible')));
      listen(node, 'keydown', event => {
        let next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (i + 1) % nodes.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (i + nodes.length - 1) % nodes.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = nodes.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        nodes[next].focus({ preventScroll: true });
        select(next, true);
      });
    });
    listen(stage.querySelector('.scene-prev'), 'click', () => select(selected - 1, true));
    listen(stage.querySelector('.scene-next'), 'click', () => select(selected + 1, true));
    listen(map, 'pointerdown', event => {
      if (drag || event.isPrimary === false || event.button !== 0 || event.target.closest('button,input,select,textarea')) return;
      drag = {
        id: event.pointerId, type: event.pointerType, startX: event.clientX, startY: event.clientY,
        lastX: event.clientX, lastY: event.clientY, started: false
      };
      engine?.hold();
    }, { passive: true });
    listen(map, 'pointermove', event => {
      if (!drag || drag.id !== event.pointerId) return;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (!drag.started) {
        // Browser-owned vertical panning is preserved on a touch screen.
        if (drag.type === 'touch' && Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
          drag = null;
          return;
        }
        if (Math.hypot(dx, dy) < (drag.type === 'touch' ? 12 : 6)) return;
        if (!engine) return;
        drag.started = true;
        map.classList.add('is-dragging');
        engine.startDrag();
        try { map.setPointerCapture(event.pointerId); } catch (_) { /* Optional capture. */ }
      }
      event.preventDefault();
      engine.drag(event.clientX - drag.lastX, event.clientY - drag.lastY);
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
      suppressClickUntil = performance.now() + 500;
    });
    function finishDrag(cancelled) {
      const previousDrag = drag;
      if (!previousDrag) return;
      // Release can dispatch lostpointercapture synchronously, so clear state first.
      drag = null;
      if (previousDrag.started) {
        suppressClickUntil = performance.now() + 350;
        engine?.endDrag(cancelled);
      }
      try { if (map.hasPointerCapture(previousDrag.id)) map.releasePointerCapture(previousDrag.id); } catch (_) { /* Already released. */ }
      map.classList.remove('is-dragging');
    }
    function endDrag(event) {
      if (drag?.id === event.pointerId) finishDrag(event.type === 'pointercancel');
    }
    listen(window, 'pointerup', endDrag, { passive: true });
    listen(window, 'pointercancel', endDrag, { passive: true });
    listen(map, 'lostpointercapture', event => {
      if (drag?.id === event.pointerId) finishDrag(true);
    }, { passive: true });
    listen(window, 'blur', () => finishDrag(true));
    listen(document, 'visibilitychange', () => { if (document.hidden) finishDrag(true); });
    listen(map, 'dragstart', event => event.preventDefault());
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
        finishDrag(true);
        engine?.dispose();
        removeListeners.forEach(remove => remove());
        map.classList.remove('is-dragging');
        if (current === instance) current = null;
      }
    };
    current = instance;
    stage.dataset.sceneState = canvas ? 'loading' : 'fallback';
    if (canvas) {
      threePromise ||= import(new URL('assets/vendor/three-0.180.0/three.module.min.js', scriptBase).href);
      threePromise.then(T => {
        if (disposed || !canvas.isConnected) return;
        try { engine = buildScene(T, canvas, map, stage, nodes, () => selected); }
        catch (error) {
          stage.dataset.sceneState = 'fallback';
          console.warn('Spatial navigation: HTML destinations remain available.', error?.message || error);
        }
      }).catch(() => { if (!disposed) stage.dataset.sceneState = 'fallback'; });
    }
    return instance.dispose;
  };

  function buildScene(T, canvas, map, stage, nodes, selectedIndex) {
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const original = nodes.map(node => ({
      node, style: node.getAttribute('style'), label: node.querySelector('.scene-node-label'),
      labelStyle: node.querySelector('.scene-node-label')?.getAttribute('style')
    }));
    const geometries = new Set();
    const materials = new Set();
    const removeListeners = [];
    const geometry = value => (geometries.add(value), value);
    const material = value => (materials.add(value), value);
    const listen = (target, type, callback, options) => {
      target.addEventListener(type, callback, options);
      removeListeners.push(() => target.removeEventListener(type, callback, options));
    };
    const scene = new T.Scene();
    const sculpture = new T.Group();
    scene.add(sculpture);
    const camera = new T.PerspectiveCamera(38, 1, .1, 100);
    let renderer;
    let resizeObserver;
    let visibilityObserver;
    let environmentTarget;
    let stopped = false;
    let visible = true;
    let running = false;
    let dragging = false;
    let manualPaused = document.documentElement.dataset.motionPaused === 'true';
    let width = 1;
    let height = 1;
    let lastFrame = 0;
    let lastInput = 0;
    let elapsed = 0;
    let targetRotation = null;
    const velocity = new T.Vector3();
    const axis = new T.Vector3();
    const rotation = new T.Quaternion();
    const world = new T.Vector3();
    const projected = new T.Vector3();
    const tangent = new T.Vector3();
    const upright = new T.Vector3(0, 1, 0);
    const paused = () => reduceMotion.matches || manualPaused;

    function restoreStyles() {
      original.forEach(item => {
        if (item.style === null) item.node.removeAttribute('style');
        else item.node.setAttribute('style', item.style);
        if (item.label) {
          if (item.labelStyle === null) item.label.removeAttribute('style');
          else item.label.setAttribute('style', item.labelStyle);
        }
      });
      stage.classList.remove('kinetic-ready', 'kinetic-3d');
    }
    function dispose() {
      if (stopped) return;
      stopped = true;
      renderer?.setAnimationLoop(null);
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      removeListeners.forEach(remove => remove());
      scene.traverse(object => object.shadow?.dispose?.());
      environmentTarget?.dispose();
      geometries.forEach(item => item.dispose());
      materials.forEach(item => item.dispose());
      renderer?.dispose();
      renderer?.forceContextLoss();
      restoreStyles();
    }

    try {
      renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
      renderer.outputColorSpace = T.SRGBColorSpace;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFSoftShadowMap;

      // Broad studio reflections are generated locally, without external imagery.
      const studio = new T.Scene();
      studio.background = new T.Color(0xc4cfdf);
      const panelGeometry = new T.PlaneGeometry(1, 1);
      const panelMaterials = [];
      [[-4, 5, 6, 5, 7, 4], [5, 1, 2, 3, 5, 3], [0, -4, 5, 4, 2, 2]].forEach(([x, y, z, w, h, intensity]) => {
        const mat = new T.MeshBasicMaterial({ color: new T.Color().setScalar(intensity), side: T.DoubleSide });
        panelMaterials.push(mat);
        const panel = new T.Mesh(panelGeometry, mat);
        panel.position.set(x, y, z);
        panel.scale.set(w, h, 1);
        panel.lookAt(0, 0, 0);
        studio.add(panel);
      });
      const pmrem = new T.PMREMGenerator(renderer);
      environmentTarget = pmrem.fromScene(studio, .03);
      scene.environment = environmentTarget.texture;
      pmrem.dispose();
      panelGeometry.dispose();
      panelMaterials.forEach(mat => mat.dispose());
      scene.add(new T.HemisphereLight(0xffffff, 0x567098, 2));
      const key = new T.DirectionalLight(0xffffff, 4);
      key.position.set(-3, 5, 7);
      key.castShadow = true;
      key.shadow.mapSize.set(512, 512);
      Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: .5, far: 20 });
      key.shadow.normalBias = .025;
      key.shadow.radius = 4;
      scene.add(key);
      const fill = new T.DirectionalLight(0x7a9eff, 2);
      fill.position.set(4, -2, -1);
      scene.add(fill);

      const locations = [
        [-2.35, 1.35, .65], [1.25, 2.0, -.9], [2.6, -.55, .65],
        [-.15, -2.0, 1.0], [-2.45, -.95, -.8]
      ].map(point => new T.Vector3(...point));
      const curve = new T.CatmullRomCurve3(locations, true, 'catmullrom', .5);
      const orbitMaterial = material(new T.MeshPhysicalMaterial({
        color: 0x234ad8, metalness: .46, roughness: .21, clearcoat: 1, clearcoatRoughness: .16,
        envMapIntensity: .65
      }));
      const orbit = new T.Mesh(geometry(new T.TubeGeometry(curve, 192, .075, 10, true)), orbitMaterial);
      orbit.castShadow = true;
      orbit.receiveShadow = true;
      sculpture.add(orbit);

      // Fine inner chords add spatial depth and make the connected graph legible.
      const chordMaterial = material(new T.LineBasicMaterial({
        color: 0x718ab8, transparent: true, opacity: .26, depthWrite: false
      }));
      for (let i = 0; i < locations.length; i++) {
        const chord = new T.Line(geometry(new T.BufferGeometry().setFromPoints([
          locations[i], locations[(i + 2) % locations.length]
        ])), chordMaterial);
        sculpture.add(chord);
      }
      const sphereGeometry = geometry(new T.SphereGeometry(.29, 32, 24));
      const spheres = locations.map(position => {
        const mat = material(new T.MeshPhysicalMaterial({
          color: 0xf6f7fb, metalness: .16, roughness: .19, clearcoat: 1,
          clearcoatRoughness: .14, envMapIntensity: .65
        }));
        const sphere = new T.Mesh(sphereGeometry, mat);
        sphere.position.copy(position);
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        sculpture.add(sphere);
        return sphere;
      });
      const shadow = new T.Mesh(
        geometry(new T.PlaneGeometry(20, 20)),
        material(new T.ShadowMaterial({ color: 0x36527e, opacity: .08 }))
      );
      shadow.position.z = -4;
      shadow.receiveShadow = true;
      scene.add(shadow);
      const agentGeometry = geometry(new T.ConeGeometry(.105, .32, 4));
      const agentMaterial = material(new T.MeshPhysicalMaterial({
        color: 0xf5f8ff, roughness: .22, metalness: .28, clearcoat: 1, envMapIntensity: .8
      }));
      const agents = [0, .06, .12].map(offset => {
        const mesh = new T.Mesh(agentGeometry, agentMaterial);
        mesh.castShadow = true;
        sculpture.add(mesh);
        return { mesh, offset };
      });
      sculpture.rotation.set(.43, -.42, -.11);
      let labelSizes = nodes.map(() => ({ width: 92, height: 28 }));
      let lastSelected = -1;

      function projectLinks() {
        sculpture.updateMatrixWorld(true);
        const points = locations.map((location, i) => {
          world.copy(location).applyMatrix4(sculpture.matrixWorld);
          projected.copy(world).project(camera);
          return { i, x: (projected.x + 1) * width / 2, y: (1 - projected.y) * height / 2, depth: world.z };
        });
        points.forEach(point => {
          const node = nodes[point.i];
          node.style.left = `${point.x.toFixed(2)}px`;
          node.style.top = `${point.y.toFixed(2)}px`;
          node.style.transform = 'translate(-50%, -16px)';
          node.style.zIndex = String(20 + Math.round((point.depth + 4) * 10));
        });
        // Keep labels horizontal and separate when the orbit turns edge-on.
        const occupied = [];
        [...points].sort((a, b) => b.depth - a.depth).forEach(point => {
          const label = original[point.i].label;
          if (!label) return;
          const size = labelSizes[point.i];
          const dx = Math.max(7 + size.width / 2 - point.x, Math.min(0, width - 7 - size.width / 2 - point.x));
          let dy = 0;
          for (const offset of [0, -52, 29, -81, 58, -110]) {
            const box = { left: point.x + dx - size.width / 2, top: point.y + 23 + offset, width: size.width, height: size.height };
            const fits = box.top >= 4 && box.top + box.height <= height - 4;
            const overlaps = occupied.some(other =>
              box.left < other.left + other.width + 5 && box.left + box.width + 5 > other.left &&
              box.top < other.top + other.height + 4 && box.top + box.height + 4 > other.top
            );
            if (fits && !overlaps) { dy = offset; occupied.push(box); break; }
          }
          label.style.transform = `translate(${dx.toFixed(1)}px, ${dy}px)`;
        });
      }
      function render() {
        if (stopped || !canvas.isConnected) return;
        const selected = selectedIndex();
        if (lastSelected !== selected) {
          spheres.forEach((sphere, i) => {
            sphere.material.color.setHex(i === selected ? 0x2148d8 : 0xf4f6fb);
            sphere.scale.setScalar(i === selected ? 1.16 : 1);
          });
          lastSelected = selected;
        }
        agents.forEach(({ mesh, offset }) => {
          const progress = (elapsed * .045 + .025 + offset) % 1;
          mesh.position.copy(curve.getPointAt(progress));
          tangent.copy(curve.getTangentAt(progress));
          mesh.quaternion.setFromUnitVectors(upright, tangent);
        });
        renderer.render(scene, camera);
        stage.classList.add('kinetic-ready', 'kinetic-3d');
        stage.dataset.sceneState = paused() ? 'static' : 'ready';
        projectLinks();
      }
      function resize() {
        if (stopped) return;
        const box = map.getBoundingClientRect();
        if (!box.width || !box.height) return;
        width = box.width;
        height = box.height;
        camera.aspect = width / height;
        const fit = Math.min(camera.aspect, 1);
        camera.position.set(0, 0, 3.35 / Math.tan(T.MathUtils.degToRad(camera.fov / 2)) / fit * 1.1);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        labelSizes = original.map(item => ({ width: item.label?.offsetWidth || 92, height: item.label?.offsetHeight || 28 }));
        render();
      }
      function applyRotation(x, y, angle) {
        axis.set(x, y, 0);
        if (axis.lengthSq() < .000001) return;
        axis.normalize();
        rotation.setFromAxisAngle(axis, angle);
        sculpture.quaternion.premultiply(rotation).normalize();
      }
      function animate(now) {
        if (stopped) return;
        if (lastFrame && now - lastFrame < 22) return;
        const dt = Math.min(lastFrame ? (now - lastFrame) / 1000 : 1 / 40, .05);
        lastFrame = now;
        elapsed += dt;
        if (!dragging) {
          if (targetRotation) {
            sculpture.quaternion.slerp(targetRotation, 1 - Math.exp(-6.5 * dt));
            if (sculpture.quaternion.angleTo(targetRotation) < .001) targetRotation = null;
          } else if (velocity.lengthSq() > .0004) {
            applyRotation(velocity.x, velocity.y, velocity.length() * dt);
            velocity.multiplyScalar(Math.exp(-2.7 * dt));
          } else if (!map.matches(':hover') && !map.contains(document.activeElement)) {
            applyRotation(.38, 1, .105 * dt);
          }
        }
        render();
      }
      function syncLoop() {
        if (stopped) return;
        const shouldRun = visible && !document.hidden && !paused();
        if (shouldRun !== running) {
          running = shouldRun;
          lastFrame = 0;
          renderer.setAnimationLoop(shouldRun ? animate : null);
        }
        if (paused()) { velocity.set(0, 0, 0); targetRotation = null; }
        render();
      }
      listen(window, 'portfolio-motion-change', event => {
        manualPaused = typeof event.detail?.paused === 'boolean'
          ? event.detail.paused : document.documentElement.dataset.motionPaused === 'true';
        syncLoop();
      });
      listen(reduceMotion, 'change', syncLoop);
      listen(document, 'visibilitychange', syncLoop);
      listen(canvas, 'webglcontextlost', () => {
        dispose();
        stage.dataset.sceneState = 'fallback';
      });
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(map);
      visibilityObserver = new IntersectionObserver(entries => {
        visible = entries[0]?.isIntersecting ?? false;
        syncLoop();
      }, { rootMargin: '40px' });
      visibilityObserver.observe(map);
      document.fonts?.ready.then(() => { if (!stopped) resize(); });
      resize();
      syncLoop();
      return {
        dispose, render,
        hold() { velocity.set(0, 0, 0); targetRotation = null; },
        startDrag() { dragging = true; targetRotation = null; velocity.set(0, 0, 0); lastInput = performance.now(); },
        drag(dx, dy) {
          if (stopped) return;
          const now = performance.now();
          const dt = Math.max(.016, Math.min(.1, (now - lastInput) / 1000));
          const sensitivity = 3.8 / Math.min(width, height);
          applyRotation(dy, dx, Math.hypot(dx, dy) * sensitivity);
          velocity.set(dy * sensitivity / dt, dx * sensitivity / dt, 0).clampLength(0, 5);
          lastInput = now;
          render();
        },
        endDrag(cancelled) {
          dragging = false;
          if (cancelled || paused() || performance.now() - lastInput > 130) velocity.set(0, 0, 0);
        },
        focus(index) {
          if (stopped) return;
          velocity.set(0, 0, 0);
          world.copy(locations[index]).applyQuaternion(sculpture.quaternion).normalize();
          const destination = new T.Vector3(.55, .24, 1).normalize();
          rotation.setFromUnitVectors(world, destination);
          targetRotation = rotation.clone().multiply(sculpture.quaternion).normalize();
          if (paused()) { sculpture.quaternion.copy(targetRotation); targetRotation = null; }
          render();
        }
      };
    } catch (error) {
      dispose();
      throw error;
    }
  }
})();
