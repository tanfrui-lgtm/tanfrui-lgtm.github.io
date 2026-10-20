/* Original kinetic sculpture. Three.js r180, vendored locally under the MIT license.
   Decorative geometry only; this scene does not represent a research simulation. */
(() => {
  'use strict';

  const scriptBase = new URL('.', document.currentScript?.src || location.href);
  let threePromise;
  let active = null;
  let mountObserver = null;
  const noop = () => {};

  function initKineticScene() {
    const canvas = document.getElementById('kinetic-canvas');
    if (active?.canvas === canvas && canvas?.isConnected) return active.dispose;
    if (active) active.dispose();
    if (!canvas) return noop;

    const stage = canvas.closest('.kinetic-stage');
    if (!stage) return noop;
    let disposed = false;
    let releaseScene = noop;
    const instance = {
      canvas,
      dispose() {
        if (disposed) return;
        disposed = true;
        releaseScene();
        stage.classList.remove('kinetic-ready');
        if (active === instance) active = null;
      }
    };
    active = instance;
    stage.dataset.sceneState = 'loading';

    // Keep the CSS sculpture visible until the first successful WebGL frame.
    threePromise ||= import(new URL('assets/vendor/three-0.180.0/three.module.min.js', scriptBase).href);
    threePromise.then(THREE => {
      if (disposed || !canvas.isConnected) return;
      try {
        releaseScene = buildScene(THREE, canvas, stage);
      } catch (error) {
        stage.dataset.sceneState = 'fallback';
        console.warn('Kinetic sculpture: using the static fallback.', error?.message || error);
      }
    }).catch(() => {
      if (!disposed) stage.dataset.sceneState = 'fallback';
    });
    return instance.dispose;
  }

  function buildScene(T, canvas, stage) {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const compact = matchMedia('(max-width: 760px)').matches;
    let stopped = false;
    let visible = true;
    let manualPaused = document.documentElement.dataset.motionPaused === 'true';
    let lastFrame = 0;
    let time = 0;
    let running = false;
    let renderer;
    const geometries = new Set();
    const materials = new Set();
    const textures = new Set();
    let environmentTarget = null;
    let resizeObserver = null;
    let visibilityObserver = null;
    const removeListeners = [];
    const trackGeometry = geometry => (geometries.add(geometry), geometry);
    const trackMaterial = material => (materials.add(material), material);
    const listen = (target, event, callback, options) => {
      target.addEventListener(event, callback, options);
      removeListeners.push(() => target.removeEventListener(event, callback, options));
    };
    const scene = new T.Scene();
    const camera = new T.OrthographicCamera(-4, 4, 3, -3, .1, 50);
    camera.position.set(4.4, 3.1, 8.8);
    camera.lookAt(0, .12, 0);

    function cleanup() {
      if (stopped) return;
      stopped = true;
      renderer?.setAnimationLoop(null);
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      removeListeners.forEach(remove => remove());
      scene.traverse(object => object.shadow?.dispose?.());
      environmentTarget?.dispose();
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      textures.forEach(texture => texture.dispose());
      renderer?.dispose();
      renderer?.forceContextLoss();
    }

    try {
      renderer = new T.WebGLRenderer({
        canvas, alpha: true, antialias: true, powerPreference: 'low-power'
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, compact ? 1.4 : 1.7));
      renderer.outputColorSpace = T.SRGBColorSpace;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFSoftShadowMap;

      // A generated studio environment supplies broad highlights without an HDR image.
      const studio = new T.Scene();
      studio.background = new T.Color(0xc8cbd1);
      const studioGeometry = new T.PlaneGeometry(1, 1);
      const studioMaterials = [];
      function softbox(position, scale, brightness) {
        const material = new T.MeshBasicMaterial({
          color: new T.Color().setScalar(brightness), side: T.DoubleSide
        });
        studioMaterials.push(material);
        const panel = new T.Mesh(studioGeometry, material);
        panel.position.set(...position);
        panel.scale.set(...scale, 1);
        panel.lookAt(0, 0, 0);
        studio.add(panel);
      }
      softbox([-4, 5, 4], [4, 6], 5);
      softbox([5, 2, -2], [3, 5], 3);
      softbox([0, 6, -1], [5, 4], 2);
      const pmrem = new T.PMREMGenerator(renderer);
      environmentTarget = pmrem.fromScene(studio, .06);
      scene.environment = environmentTarget.texture;
      pmrem.dispose();
      studioGeometry.dispose();
      studioMaterials.forEach(material => material.dispose());

      scene.add(new T.HemisphereLight(0xf4f5ff, 0x8b909e, 1.15));
      const key = new T.DirectionalLight(0xffffff, 3.3);
      key.position.set(-3.5, 6.5, 5);
      key.castShadow = true;
      key.shadow.mapSize.set(compact ? 1024 : 2048, compact ? 1024 : 2048);
      Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: .5, far: 20 });
      key.shadow.bias = -.0002;
      key.shadow.normalBias = .035;
      key.shadow.radius = 4;
      scene.add(key);
      const fill = new T.DirectionalLight(0xc7d4ff, .8);
      fill.position.set(4, 2, -4);
      scene.add(fill);

      const graphite = trackMaterial(new T.MeshPhysicalMaterial({
        color: 0x151b25, roughness: .26, metalness: .26, clearcoat: .8,
        clearcoatRoughness: .2, envMapIntensity: .8
      }));
      const cobalt = trackMaterial(new T.MeshPhysicalMaterial({
        color: 0x163bc2, roughness: .23, metalness: .18, clearcoat: 1,
        clearcoatRoughness: .16, envMapIntensity: .75
      }));
      const ivory = trackMaterial(new T.MeshPhysicalMaterial({
        color: 0xf3f0e8, roughness: .28, metalness: .04, clearcoat: .75,
        clearcoatRoughness: .24, envMapIntensity: .65
      }));
      const sphereGeometry = trackGeometry(new T.SphereGeometry(1, 48, 32));
      const bodies = [];
      function body(geometry, material, scale, position, rotation, radius, seed) {
        const mesh = new T.Mesh(geometry, material);
        mesh.scale.set(...scale);
        mesh.position.set(...position);
        mesh.rotation.set(...rotation);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        const item = {
          mesh, home: mesh.position.clone(), rotation: mesh.rotation.clone(),
          velocity: new T.Vector3(), radius, seed
        };
        bodies.push(item);
        return item;
      }

      // A stable, asymmetric arrangement: control ring, pearl, actuator and satellite.
      body(trackGeometry(new T.TorusGeometry(1.14, .34, 32, 96)), cobalt,
        [1, 1, 1], [.48, .14, -.3], [.12, -.23, -.36], 0, .4);
      body(sphereGeometry, ivory,
        [.83, .83, .83], [-.91, -.61, .85], [0, 0, 0], .73, 1.8);
      body(trackGeometry(new T.CapsuleGeometry(.43, .76, 12, 32)), graphite,
        [1, 1, 1], [-1.49, -.48, -.6], [.1, -.4, .7], .58, 2.9);
      body(sphereGeometry, graphite,
        [.55, .55, .55], [1.5, -.88, .88], [0, 0, 0], .5, 4.1);
      body(sphereGeometry, ivory,
        [.28, .28, .28], [1.59, 1.26, -.26], [0, 0, 0], .25, 5.5);

      const floorHeight = -1.46;
      const floor = new T.Mesh(
        trackGeometry(new T.PlaneGeometry(30, 30)),
        trackMaterial(new T.ShadowMaterial({ color: 0x202b45, opacity: .17 }))
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = floorHeight;
      floor.receiveShadow = true;
      scene.add(floor);

      // Feathered contact shadows complement the physically lit cast shadows.
      const shadowCanvas = document.createElement('canvas');
      shadowCanvas.width = shadowCanvas.height = 128;
      const context = shadowCanvas.getContext('2d');
      const gradient = context.createRadialGradient(64, 64, 1, 64, 64, 62);
      gradient.addColorStop(0, 'rgba(18,28,48,.30)');
      gradient.addColorStop(.28, 'rgba(18,28,48,.17)');
      gradient.addColorStop(.65, 'rgba(18,28,48,.045)');
      gradient.addColorStop(1, 'rgba(18,28,48,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 128, 128);
      const shadowTexture = new T.CanvasTexture(shadowCanvas);
      textures.add(shadowTexture);
      const contactGeometry = trackGeometry(new T.PlaneGeometry(1, 1));
      bodies.forEach((item, i) => {
        const shadow = new T.Mesh(contactGeometry, trackMaterial(new T.MeshBasicMaterial({
          map: shadowTexture, transparent: true, depthWrite: false,
          opacity: i === 4 ? .24 : .75, toneMapped: false
        })));
        shadow.rotation.x = -Math.PI / 2;
        shadow.scale.set(i === 0 ? 3.2 : 2.5, i === 0 ? 2.4 : 2.2, 1);
        shadow.position.set(item.home.x, floorHeight + .012 + i * .001, item.home.z);
        item.shadow = shadow;
        scene.add(shadow);
      });

      const pointer = { active: false, x: 0, y: 0, expiry: 0 };
      const pointerNdc = new T.Vector2();
      const raycaster = new T.Raycaster();
      const pointerPlane = new T.Plane(new T.Vector3(0, 0, 1), -.55);
      const pointerWorld = new T.Vector3();
      const delta = new T.Vector3();
      const force = new T.Vector3();
      const paused = () => media.matches || manualPaused;

      function render() {
        if (stopped || !canvas.isConnected) return;
        renderer.render(scene, camera);
        stage.classList.add('kinetic-ready');
        stage.dataset.sceneState = paused() ? 'static' : 'ready';
      }
      function resize() {
        if (stopped) return;
        const { width, height } = stage.getBoundingClientRect();
        if (!width || !height) return;
        const aspect = width / height;
        const viewHeight = aspect < 1 ? 6.25 : 5.1;
        camera.left = -viewHeight * aspect / 2;
        camera.right = viewHeight * aspect / 2;
        camera.top = viewHeight / 2;
        camera.bottom = -viewHeight / 2;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        render();
      }
      function updatePointer(event) {
        if (paused() || event.target.closest?.('button,a,input,select')) return;
        const rect = stage.getBoundingClientRect();
        pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
        pointer.y = -(event.clientY - rect.top) / rect.height * 2 + 1;
        pointer.active = true;
        pointer.expiry = performance.now() + (event.pointerType === 'touch' ? 450 : 2000);
      }
      function leavePointer() { pointer.active = false; }
      function syncLoop() {
        if (stopped) return;
        const shouldRun = visible && !document.hidden && !paused();
        if (running !== shouldRun) {
          running = shouldRun;
          lastFrame = 0;
          renderer.setAnimationLoop(shouldRun ? animate : null);
        }
        if (!shouldRun) render();
      }
      function animate(now) {
        if (stopped || !canvas.isConnected) return;
        // Cap at 45 fps on desktop and 30 fps on narrow devices.
        if (lastFrame && now - lastFrame < (compact ? 32 : 21)) return;
        const dt = Math.min(lastFrame ? (now - lastFrame) / 1000 : 1 / 60, .04);
        lastFrame = now;
        time += dt;
        const interacting = pointer.active && now < pointer.expiry;
        if (interacting) {
          pointerNdc.set(pointer.x, pointer.y);
          raycaster.setFromCamera(pointerNdc, camera);
          raycaster.ray.intersectPlane(pointerPlane, pointerWorld);
        }
        bodies.forEach((item, i) => {
          const position = item.mesh.position;
          force.copy(item.home).sub(position).multiplyScalar(9);
          force.y += Math.sin(time * .65 + item.seed) * .13;
          if (interacting) {
            delta.copy(position).sub(pointerWorld);
            const distance = Math.max(delta.length(), .16);
            if (distance < 2.15) {
              delta.divideScalar(distance);
              force.addScaledVector(delta, Math.pow(1 - distance / 2.15, 2) * 15);
            }
          }
          item.velocity.addScaledVector(force, dt).multiplyScalar(Math.exp(-3.3 * dt));
          item.velocity.clampLength(0, 1.9);
          position.addScaledVector(item.velocity, dt);
          position.x = T.MathUtils.clamp(position.x, item.home.x - .65, item.home.x + .65);
          position.y = T.MathUtils.clamp(position.y, item.home.y - .08, item.home.y + .65);
          position.z = T.MathUtils.clamp(position.z, item.home.z - .3, item.home.z + .5);
          item.mesh.rotation.x = item.rotation.x + item.velocity.z * .08;
          item.mesh.rotation.y = item.rotation.y + Math.sin(time * .28 + item.seed) * .035;
          item.mesh.rotation.z = item.rotation.z + (position.x - item.home.x) * -.2;
          item.shadow.position.x = position.x;
          item.shadow.position.z = position.z;
          if (i !== 4) item.shadow.material.opacity = Math.max(.3, .75 - (position.y - item.home.y) * .5);
        });
        // Short-range separation keeps the three convex pieces from passing through each other.
        for (let i = 1; i < bodies.length; i++) {
          for (let j = i + 1; j < bodies.length; j++) {
            const a = bodies[i], b = bodies[j];
            delta.copy(a.mesh.position).sub(b.mesh.position);
            const distance = delta.length();
            const minimum = a.radius + b.radius;
            if (distance > .001 && distance < minimum) {
              delta.multiplyScalar((minimum - distance) * .48 / distance);
              a.mesh.position.add(delta);
              b.mesh.position.sub(delta);
              a.velocity.addScaledVector(delta, 1.5);
              b.velocity.addScaledVector(delta, -1.5);
            }
          }
        }
        render();
      }
      function motionChange(event) {
        manualPaused = typeof event.detail?.paused === 'boolean'
          ? event.detail.paused
          : document.documentElement.dataset.motionPaused === 'true';
        pointer.active = false;
        syncLoop();
      }
      listen(stage, 'pointermove', updatePointer, { passive: true });
      listen(stage, 'pointerdown', updatePointer, { passive: true });
      listen(stage, 'pointerleave', leavePointer, { passive: true });
      listen(window, 'portfolio-motion-change', motionChange);
      listen(document, 'visibilitychange', syncLoop);
      listen(media, 'change', syncLoop);
      listen(canvas, 'webglcontextlost', () => {
        cleanup();
        stage.classList.remove('kinetic-ready');
        stage.dataset.sceneState = 'fallback';
      });
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(stage);
      visibilityObserver = new IntersectionObserver(entries => {
        visible = entries[0]?.isIntersecting ?? false;
        syncLoop();
      }, { rootMargin: '50px' });
      visibilityObserver.observe(stage);
      resize();
      syncLoop();
      return cleanup;
    } catch (error) {
      cleanup();
      throw error;
    }
  }

  window.initKineticScene = initKineticScene;
  function mount() {
    initKineticScene();
    const app = document.getElementById('app');
    if (app && !mountObserver) {
      mountObserver = new MutationObserver(() => {
        const canvas = document.getElementById('kinetic-canvas');
        if (canvas !== active?.canvas) initKineticScene();
      });
      mountObserver.observe(app, { childList: true, subtree: true });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();
