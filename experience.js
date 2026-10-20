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
    const statementTitle = document.querySelector('.statement-section h2');
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    const mediaIntent = new WeakMap();
    const managedPause = new WeakSet();
    const manualHold = new WeakSet();
    const listeners = [];
    let frame = 0, active = -1, disposed = false, previousStatic, lastScroll = scrollY, scrollDirection = 'down';
    let paused = root.dataset.motionPaused === 'true';
    const on = (target, type, handler, options) => {
      target.addEventListener(type, handler, options);
      listeners.push(() => target.removeEventListener(type, handler, options));
    };
    const motionRecords = [], hoverAnimations = new Set();
    const plainText = element => {
      const clone = element.cloneNode(true);
      clone.querySelectorAll('br').forEach(br => br.replaceWith(' '));
      return clone.textContent.replace(/\s+/g, ' ').trim();
    };
    const tokenize = (text, characters = false) => {
      if (!characters && !root.lang.startsWith('zh')) return text.split(/(\s+)/);
      // Preserve Latin words inside Chinese text rather than scattering their letters.
      return characters ? [...text] : text.match(/[A-Za-z0-9][A-Za-z0-9–—'’.-]*|\s+|./gu) || [];
    };
    const reveal = (record, visible) => {
      if (record.visible === visible) return;
      record.visible = visible;
      record.element.dataset.motionDirection = scrollDirection;
      record.element.classList.toggle('motion-visible', visible);
    };
    const hoverWave = element => {
      if (paused || reduced.matches || !finePointer.matches || !element.classList.contains('motion-visible')) return;
      const glyphs = [...element.querySelectorAll('.motion-glyph')];
      glyphs.forEach((glyph, index) => {
        glyph.getAnimations().forEach(animation => animation.cancel());
        const animation = glyph.animate([
          {transform:'translate3d(0,0,0) rotateX(0deg)'},
          {transform:'translate3d(0,-.18em,0) rotateX(58deg)', offset:.35},
          {transform:'translate3d(0,.07em,0) rotateX(-15deg)', offset:.7},
          {transform:'translate3d(0,0,0) rotateX(0deg)'}
        ], {duration:640, delay:Math.min(index * 24,240), easing:'cubic-bezier(.2,.7,.2,1)'});
        hoverAnimations.add(animation);
        animation.finished.then(() => hoverAnimations.delete(animation), () => hoverAnimations.delete(animation));
      });
    };
    const splitTitle = heading => {
      const text = plainText(heading);
      heading.setAttribute('aria-label', text);
      heading.classList.add('motion-title');
      if (heading === statementTitle) {
        const nodes = [...heading.childNodes];
        let line = document.createElement('span'), lineIndex = 0;
        line.className = 'statement-motion-line';
        line.dataset.motionLine = String(lineIndex);
        heading.replaceChildren(line);
        nodes.forEach(node => {
          if (node.nodeName === 'BR') {
            line = document.createElement('span');
            line.className = 'statement-motion-line';
            line.dataset.motionLine = String(++lineIndex);
            heading.append(line);
          } else line.append(node);
        });
      }
      let order = 0;
      const glyphs = [];
      const primaryName = heading.matches('.intro-identity h1');
      const makeMask = token => {
        const mask = document.createElement('span'), glyph = document.createElement('span');
        mask.className = 'motion-mask'; mask.setAttribute('aria-hidden', 'true');
        glyph.className = 'motion-glyph'; glyph.textContent = token;
        glyph.style.setProperty('--motion-delay', `${Math.min(order++ * 34,420)}ms`);
        glyphs.push(glyph); mask.append(glyph);
        return mask;
      };
      const wrap = parent => [...parent.childNodes].forEach(node => {
        // The secondary name retains its original typographic identity.
        if (primaryName && node.nodeType === Node.ELEMENT_NODE && parent === heading) return;
        if (node.nodeType === Node.TEXT_NODE) {
          const fragment = document.createDocumentFragment();
          (primaryName ? node.textContent.split(/(\s+)/) : tokenize(node.textContent)).forEach(token => {
            if (!token.trim()) { fragment.append(document.createTextNode(token)); return; }
            if (primaryName) {
              const word = document.createElement('span');
              word.className = 'motion-name-word';
              word.setAttribute('aria-hidden','true');
              [...token].forEach(character => word.append(makeMask(character)));
              fragment.append(word);
            } else fragment.append(makeMask(token));
          });
          node.replaceWith(fragment);
        } else if (node.nodeType === Node.ELEMENT_NODE) wrap(node);
      });
      wrap(heading);
      const record = {element:heading, chapter:heading.closest('[data-work-chapter]'), visible:false, glyphs};
      motionRecords.push(record);
      on(heading, 'pointerenter', () => hoverWave(heading), {passive:true});
    };
    document.querySelectorAll(
      '.intro-identity h1,.statement-section h2,.section-heading h2,.chapter-content h3,' +
      '.moment-copy h3,.papers-gateway h2,.contact-section h2,.archive-intro h1,.scene-header h2'
    ).forEach(splitTitle);
    document.querySelectorAll(
      '.intro-bio,.reading-statement,.statement-note,.about-story>div>p,.moment-copy>p:not(.eyebrow),' +
      '.contact-section>p,.archive-intro>p:not(.eyebrow),.chapter-content>p,.papers-gateway p'
    ).forEach(paragraph => {
      const text = paragraph.textContent;
      const accessible = document.createElement('span'), visual = document.createElement('span');
      accessible.className = 'sr-only'; accessible.textContent = text;
      visual.setAttribute('aria-hidden', 'true');
      paragraph.classList.add('motion-copy');
      const tokens = tokenize(text), wordCount = tokens.filter(token => token.trim()).length;
      let order = 0;
      tokens.forEach(token => {
        if (!token.trim()) { visual.append(document.createTextNode(token)); return; }
        const word = document.createElement('span');
        word.className = 'motion-copy-word'; word.textContent = token;
        word.style.setProperty('--motion-delay', `${Math.min(order++ * (wordCount > 35 ? 9 : 16),320)}ms`);
        visual.append(word);
      });
      paragraph.replaceChildren(accessible, visual);
      motionRecords.push({element:paragraph, chapter:paragraph.closest('[data-work-chapter]'), visible:false});
    });
    // Real links keep one semantic label. Only their visible text rolls on interaction.
    document.querySelectorAll('.nav>a,.text-link,.work-links>a').forEach(link => {
      if (link.querySelector('svg') || link.closest('.certificate-dialog')) return;
      [...link.childNodes].forEach(node => {
        if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) return;
        const mask = document.createElement('span'), label = document.createElement('span');
        mask.className = 'motion-link-mask'; label.className = 'motion-link-label';
        label.textContent = node.textContent; mask.append(label); node.replaceWith(mask);
      });
      link.classList.add('motion-link');
    });
    const titleObserver = new IntersectionObserver(entries => {
      if (disposed) return;
      entries.forEach(entry => {
        const record = motionRecords.find(item => item.element === entry.target);
        if (!record || record.chapter) return;
        const rect = entry.boundingClientRect;
        if (entry.isIntersecting) reveal(record, true);
        // Do not reset a partially visible title at the observer's early-entry margin.
        else if (rect.bottom <= 0 || rect.top >= innerHeight) reveal(record, false);
      });
    }, {rootMargin:'0px 0px -7% 0px',threshold:[0,.08]});
    motionRecords.filter(record => !record.chapter).forEach(record => titleObserver.observe(record.element));
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
      if (scrollY !== lastScroll) scrollDirection = scrollY < lastScroll ? 'up' : 'down';
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
      const statementTitleRect = statementTitle?.getBoundingClientRect();
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
      const galleryVisible = !!galleryRect && galleryRect.top < height * .9 && galleryRect.bottom > height * .08;
      motionRecords.forEach(record => {
        if (!record.chapter) return;
        const index = Number(record.chapter.dataset.workChapter);
        const rect = rectangles[index];
        const visible = staticLayout
          ? !!rect && rect.top < height * .92 && rect.bottom > height * .04
          : galleryVisible && index === active;
        reveal(record, visible);
      });
      if (statementTitleRect) {
        const progress = reduced.matches || paused || !finePointer.matches ? 1
          : Math.max(0,Math.min(1,(height * .98 - statementTitleRect.top) / (height * .3)));
        const shift = (1 - progress) * Math.min(innerWidth * .055,76);
        statementTitle.style.setProperty('--statement-shift',`${shift.toFixed(2)}px`);
        statementTitle.style.setProperty('--statement-tilt',`${((1 - progress) * 65).toFixed(2)}deg`);
      }
      if (paused || reduced.matches) {
        hoverAnimations.forEach(animation => animation.cancel());
        hoverAnimations.clear();
      }
      videos.forEach((video, index) => {
        const inStage = Boolean(video.closest('.work-stage'));
        const relevant = inStage ? !staticLayout && Number(video.dataset.workVideo) === active : staticLayout;
        const saveData = navigator.connection?.saveData;
        setVideo(video, !reduced.matches && !saveData, relevant && visibleMedia[index]);
      });
      lastScroll = scrollY;
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
    on(finePointer, 'change', request);
    document.querySelectorAll('details').forEach(detail => on(detail, 'toggle', request));
    updateButton(); update();
    return () => {
      disposed = true; cancelAnimationFrame(frame);
      titleObserver.disconnect();
      hoverAnimations.forEach(animation => animation.cancel());
      hoverAnimations.clear();
      listeners.forEach(remove => remove());
      videos.forEach(video => video.pause());
    };
  };
})();
