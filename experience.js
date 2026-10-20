(() => {
  window.initPortfolioExperience = () => {
    const root = document.documentElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const narrow = matchMedia('(max-width: 900px), (max-height: 650px)');
    const chapters = [...document.querySelectorAll('[data-work-chapter]')];
    const steps = [...document.querySelectorAll('[data-work-step]')];
    const gallery = document.querySelector('.work-gallery');
    const panels = [...document.querySelectorAll('[data-work-media]')];
    const jumps = [...document.querySelectorAll('[data-work-jump]')];
    const videos = [...document.querySelectorAll('[data-work-video]')];
    const pauseButton = document.getElementById('motion-toggle');
    const statement = document.querySelector('.reading-statement');
    const mediaIntent = new WeakMap();
    const managedPause = new WeakSet();
    const manualHold = new WeakSet();
    const listeners = [];
    let frame = 0, active = -1, disposed = false, previousStatic;
    let paused = root.dataset.motionPaused === 'true';
    const on = (target, type, handler, options) => {
      target.addEventListener(type, handler, options);
      listeners.push(() => target.removeEventListener(type, handler, options));
    };
    const words = [];
    // Word masks preserve semantic headings and animate typography with its media.
    const splitTitle = heading => {
      heading.setAttribute('aria-label', heading.innerText.replace(/\n/g, ' '));
      let order = 0;
      const wrap = parent => [...parent.childNodes].forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const fragment = document.createDocumentFragment();
          const tokens = root.lang.startsWith('zh') ? [...node.textContent] : node.textContent.split(/(\s+)/);
          tokens.forEach(token => {
            if (!token.trim()) { fragment.append(document.createTextNode(token)); return; }
            const mask = document.createElement('span'), word = document.createElement('span');
            mask.className = 'type-mask'; mask.setAttribute('aria-hidden', 'true');
            word.className = 'type-word'; word.textContent = token;
            word.style.setProperty('--type-order', String(order++));
            mask.append(word); fragment.append(mask);
          });
          node.replaceWith(fragment);
        } else if (node.nodeType === Node.ELEMENT_NODE) wrap(node);
      });
      wrap(heading);
    };
    document.querySelectorAll('.statement-section h2,.chapter-content h3').forEach(splitTitle);
    const titleObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('is-in-view', entry.isIntersecting));
    }, {threshold:.18});
    document.querySelectorAll('.statement-section h2').forEach(title => titleObserver.observe(title));
    if (statement) {
      const text = statement.textContent;
      const accessible = document.createElement('span');
      accessible.className = 'sr-only'; accessible.textContent = text;
      const visual = document.createElement('span');
      visual.setAttribute('aria-hidden', 'true');
      const tokens = root.lang.startsWith('zh') ? [...text] : text.split(/(\s+)/);
      tokens.forEach(token => {
        const word = document.createElement('span');
        if (token.trim()) {
          word.className = 'reading-word'; word.textContent = token;
          visual.append(word); words.push(word);
        } else visual.append(document.createTextNode(token));
      });
      statement.replaceChildren(accessible, visual);
    }
    const updateButton = () => {
      root.dataset.motionPaused = String(paused);
      if (!pauseButton) return;
      pauseButton.setAttribute('aria-pressed', String(paused));
      pauseButton.lastElementChild.textContent = paused ? pauseButton.dataset.resume : pauseButton.dataset.pause;
      pauseButton.firstElementChild.textContent = paused ? '▷' : 'Ⅱ';
    };
    const pauseVideo = video => {
      if (!video.paused) { managedPause.add(video); video.pause(); }
    };
    const setVideo = (video, shouldPlay, inView) => {
      if (!inView || document.hidden || paused) {
        mediaIntent.set(video, false); pauseVideo(video); return;
      }
      if (!shouldPlay) {
        const wasAutomatic = mediaIntent.get(video);
        mediaIntent.set(video, false);
        if (wasAutomatic) pauseVideo(video);
        return;
      }
      if (mediaIntent.get(video) === shouldPlay) return;
      mediaIntent.set(video, shouldPlay);
      if (manualHold.has(video)) return;
      video.muted = true;
      video.play()?.then(() => {
        if (disposed || !mediaIntent.get(video)) {
          pauseVideo(video);
        }
      }).catch(() => {});
    };
    videos.forEach(video => {
      on(video, 'pause', () => {
        if (managedPause.has(video)) managedPause.delete(video);
        else manualHold.add(video);
      });
      on(video, 'play', () => manualHold.delete(video));
    });
    const update = () => {
      frame = 0;
      if (disposed) return;
      const height = innerHeight;
      const scrollSpan = root.scrollHeight - height;
      const staticLayout = reduced.matches || narrow.matches;
      if (staticLayout !== previousStatic) {
        steps.forEach((step, i) => {
          step.removeAttribute('id'); chapters[i].removeAttribute('id');
          (staticLayout ? chapters[i] : step).id = step.dataset.anchor;
        });
        previousStatic = staticLayout;
      }
      root.classList.toggle('static-work-layout', staticLayout);
      const rectangles = (staticLayout ? chapters : steps).map(chapter => chapter.getBoundingClientRect());
      const statementRect = statement?.getBoundingClientRect();
      const galleryRect = gallery?.getBoundingClientRect();
      let next = 0, distance = Infinity;
      rectangles.forEach((rect, index) => {
        const d = Math.abs(rect.top + rect.height * .45 - height * .52);
        if (d < distance) { distance = d; next = index; }
      });
      const visibleMedia = videos.map(video => {
        const rect = video.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.bottom > height * .15 && rect.top < height * .85;
      });
      root.style.setProperty('--scroll-progress', scrollSpan > 0 ? String(scrollY / scrollSpan) : '0');
      gallery?.classList.toggle('is-in-view', !!galleryRect && galleryRect.top < height * .87 && galleryRect.bottom > height * .15);
      chapters.forEach((chapter, i) => {
        const current = staticLayout || i === next;
        if (!current && chapter.contains(document.activeElement)) {
          jumps[next]?.focus({preventScroll:true});
        }
        chapter.inert = !current;
        chapter.setAttribute('aria-hidden', String(!current));
      });
      if (next !== active) {
        active = next;
        chapters.forEach((chapter, index) => chapter.classList.toggle('is-active', index === active));
        panels.forEach((panel, index) => {
          const current = index === active && !staticLayout;
          if (!current && panel.contains(document.activeElement)) jumps[next]?.focus({preventScroll:true});
          panel.classList.toggle('is-active', current);
          panel.inert = !current;
          panel.setAttribute('aria-hidden', String(!current));
        });
        jumps.forEach((link, index) => {
          link.classList.toggle('is-active', index === active);
          if (index === active) link.setAttribute('aria-current', 'step');
          else link.removeAttribute('aria-current');
        });
      } else {
        panels.forEach((panel, index) => {
          const current = index === active && !staticLayout;
          if (!current && panel.contains(document.activeElement)) jumps[next]?.focus({preventScroll:true});
          panel.inert = !current;
          panel.setAttribute('aria-hidden', String(!current));
          panel.classList.toggle('is-active', current);
        });
      }
      if (statementRect) {
        const progress = reduced.matches || paused ? 1 : Math.max(0, Math.min(1, (height * .9 - statementRect.top) / (height * .55)));
        words.forEach((word, index) => {
          const reveal = reduced.matches || paused ? 1 : Math.max(0, Math.min(1, (progress - index / (words.length * 1.25)) * 5));
          word.style.setProperty('--word-opacity', String(.16 + reveal * .84));
          word.style.setProperty('--word-lift', `${(1 - reveal) * 24}px`);
        });
      }
      videos.forEach((video, index) => {
        const inStage = Boolean(video.closest('.work-stage'));
        const relevant = inStage ? !staticLayout && Number(video.dataset.workVideo) === active : staticLayout;
        const saveData = navigator.connection?.saveData;
        setVideo(video, !reduced.matches && !saveData, relevant && visibleMedia[index]);
      });
    };
    const request = () => { if (!frame && !disposed) frame = requestAnimationFrame(update); };
    if (pauseButton) on(pauseButton, 'click', () => {
      paused = !paused; updateButton();
      dispatchEvent(new CustomEvent('portfolio-motion-change', { detail: { paused } }));
      request();
    });
    on(window, 'scroll', request, { passive: true });
    on(window, 'hashchange', request);
    on(window, 'resize', request, { passive: true });
    on(document, 'visibilitychange', request);
    on(reduced, 'change', request);
    on(narrow, 'change', request);
    document.querySelectorAll('details').forEach(detail => on(detail, 'toggle', request));
    updateButton(); update();
    return () => {
      disposed = true; cancelAnimationFrame(frame);
      titleObserver.disconnect();
      listeners.forEach(remove => remove());
      videos.forEach(video => video.pause());
    };
  };
})();
