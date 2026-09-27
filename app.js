(() => {
  const P = window.PROFILE;
  const copy = {
    zh: {
      nav:['关于','教育','研究','论文','荣誉'], cv:'个人简历', name:'唐睿', otherName:'Rui Tang',
      role:'哈尔滨工业大学（威海）本科生', field:'船舶与海洋工程',
      incoming:'清华大学 · 2027 级硕士推免录取',
      intro:'让智能，<br><em>走向行动。</em>',
      about:'我就读于哈尔滨工业大学（威海）船舶与海洋工程专业，已获清华大学深圳国际研究生院大数据技术与工程硕士推免录取，预计 2027 年入学。',
      focus:'我的研究兴趣包括视觉–语言–动作模型（VLA）、AI for Science、自主智能体控制与控制理论。已有工作涉及微尺度机器人操作、多无人机协同规划与控制、欠驱动无人船以及振子网络同步。',
      contact:'邮件联系', download:'查看简历', interests:'研究兴趣',
      tags:['视觉–语言–动作模型','AI for Science','自主智能体控制','控制理论'],
      news:'近期动态', newsEn:'Recent updates',
      newsItems:[['2026.09','推免录取至清华大学深圳国际研究生院大数据技术与工程硕士项目。'],['2026','两篇微操作 VLA 合作论文获 IROS 2026 录用。']],
      education:'教育经历',educationEn:'Education',research:'研究与项目',researchEn:'Research',publications:'论文成果',publicationsEn:'Publications',awards:'荣誉与奖励',awardsEn:'Honors & awards',
      researchLead:'从可证明的控制方法，到感知与行动相结合的智能系统。',
      footer:'唐睿 · 个人学术主页',updated:'最近更新',menu:'打开导航',closeMenu:'关闭导航',
      paperPage:'论文页面',publisherPage:'出版页面 · DOI',video:'演示视频',details:'研究详情',abstract:'研究内容',evidence:'获奖证书',firstAuthor:'第一作者',
      status:{published:'已发表',accepted:'已录用',conditional:'条件接收',upcoming:'即将推出'},
      oral:'口头报告',figure:'论文配图',viewFigure:'查看大图',closeFigure:'关闭大图',openFigure:'打开图片',figureLoadError:'图片暂时无法载入，请点击“打开图片”。',
      awardsLead:'代表性竞赛与学术荣誉',allAwards:'其他竞赛与奖学金',
      profileNote:'大数据技术与工程', incomingLabel:'下一站 · 清华大学', expected:'2027 年入学',
      mailLabel:'发送邮件给唐睿',languageLabel:'Switch to English',
      pdfNote:'中文 PDF', output:'成果',
      announcement:'获奖公示',viewCertificate:'点击查看大图',closeCertificate:'关闭大图',original:'查看原件',imageLoadError:'图片暂时无法载入，请点击“查看原件”。',
    },
    en: {
      nav:['About','Education','Research','Publications','Honors'], cv:'Curriculum vitae',name:'Rui Tang',otherName:'唐睿',
      role:'Undergraduate at HIT, Weihai',field:'Naval Architecture & Ocean Engineering',
      incoming:'TSINGHUA UNIVERSITY · INCOMING MASTER’S STUDENT, 2027',
      intro:'Intelligence,<br><em>in motion.</em>',
      about:'I study Naval Architecture and Ocean Engineering at Harbin Institute of Technology, Weihai. I am an incoming master’s student in Big Data Technology and Engineering at Tsinghua Shenzhen International Graduate School, starting in 2027.',
      focus:'My research interests include vision–language–action (VLA) models, AI for Science, autonomous agent control, and control theory. My work spans robotic micromanipulation, multi-UAV planning and control, underactuated surface vessels, and synchronization of oscillator networks.',
      contact:'Get in touch',download:'View CV',interests:'Research interests',
      tags:['Vision–language–action','AI for Science','Autonomous agents','Control theory'],
      news:'Recent updates',newsEn:'',
      newsItems:[['2026.09','Admitted to the master’s program in Big Data Technology and Engineering at Tsinghua SIGS.'],['2026','Two collaborative papers on VLA for micromanipulation accepted at IROS 2026.']],
      education:'Education',educationEn:'',research:'Research & projects',researchEn:'',publications:'Publications',publicationsEn:'',awards:'Honors & awards',awardsEn:'',
      researchLead:'From control methods with theoretical guarantees to intelligent systems that connect perception and action.',
      footer:'Rui Tang · Academic homepage',updated:'Last updated',menu:'Open navigation',closeMenu:'Close navigation',
      paperPage:'Paper page',publisherPage:'Publisher page · DOI',video:'Demo video',details:'Research details',abstract:'Overview',evidence:'Certificate',firstAuthor:'First author',
      status:{published:'Published',accepted:'Accepted',conditional:'Conditionally accepted',upcoming:'Coming soon'},
      oral:'Oral presentation',figure:'Paper figure',viewFigure:'View figure',closeFigure:'Close figure',openFigure:'Open image',figureLoadError:'The image could not load. Please open the image directly.',
      awardsLead:'Selected competition and academic honors',allAwards:'More competitions & scholarships',
      profileNote:'Big Data Technology and Engineering',incomingLabel:'Next · Tsinghua University',expected:'Expected entry in 2027',
      mailLabel:'Email Rui Tang',languageLabel:'切换至中文',pdfNote:'PDF in Chinese',output:'Outcome',
      announcement:'Award announcement',viewCertificate:'View full size',closeCertificate:'Close full-size image',original:'Open original',imageLoadError:'This image could not load. Please open the original document.',
    }
  };
  let lang = new URLSearchParams(location.search).get('lang');
  if (!['zh','en'].includes(lang)) { try { lang = localStorage.getItem('rui-tang-language'); } catch {} }
  if (!['zh','en'].includes(lang)) lang = 'en';
  const t = value => typeof value === 'object' ? value[lang] : value;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const arrow = '<span aria-hidden="true">↗</span>';
  const mail = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></svg>';
  const sectionTitle = (id,title,subtitle,number) => `<div class="section-heading"><h2 id="${id}-title">${title}<span>${subtitle}</span></h2><span class="section-number" aria-hidden="true">${number}</span></div>`;
  function render() {
    window.ruiArtCleanup?.();
    const c = copy[lang];
    const ids = ['about','education','research','publications','honors'];
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = lang === 'zh' ? '唐睿 Rui Tang | 个人学术主页' : 'Rui Tang 唐睿 | Academic Homepage';
    document.querySelector('meta[name="description"]').content = c.about;
    document.getElementById('app').innerHTML = `
      <div class="ambient-canvas" aria-hidden="true"><div class="ambient-orb one"></div><div class="ambient-orb two"></div></div>
      <header class="site-header"><div class="header-inner">
        <a class="wordmark" href="#about" aria-label="Rui Tang homepage"><span class="monogram">R.</span><span>RUI TANG<span class="wordmark-cn">唐睿</span></span></a>
        <nav class="nav" id="site-nav" aria-label="${lang==='zh'?'主导航':'Main navigation'}">${ids.map((id,i)=>`<a href="#${id}">${c.nav[i]}</a>`).join('')}</nav>
        <div class="header-actions"><button id="language-toggle" class="language-toggle" aria-label="${c.languageLabel}"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg><span>Language</span><span class="language-target">${lang==='en'?'中文':'EN'}</span></button><button class="menu-toggle" id="menu-toggle" aria-label="${c.menu}" aria-expanded="false" aria-controls="site-nav"><span></span><span></span></button></div>
      </div></header>
      <div class="page-grid">
        <aside class="profile" aria-label="${lang==='zh'?'个人信息':'Profile'}">
          <div class="portrait-frame"><img src="assets/portrait.jpg" alt="${lang==='zh'?'唐睿的个人照片':'Portrait of Rui Tang'}" width="413" height="579" fetchpriority="high"></div>
          <div class="profile-body"><p class="profile-name">${c.name}<span>${c.otherName}</span></p><p class="profile-role">${c.role}<br>${c.field}</p>
          <a class="email" href="mailto:${P.email}" aria-label="${c.mailLabel}">${mail}<span>${P.email}</span></a>
          <a class="cv-link" href="assets/Tang_Rui_CV.pdf" target="_blank" rel="noopener">${c.cv}${arrow}</a>
          <div class="next-stop"><span class="next-label">${c.incomingLabel}</span><strong>${c.profileNote}</strong><span>${c.expected}</span></div>
          </div>
        </aside>
        <main id="main">
          <section class="about-section" id="about" aria-labelledby="about-title"><p class="eyebrow">${lang==='en'?'RUI TANG · ROBOTICS / LEARNING / CONTROL':'唐睿 · 机器人 / 学习 / 控制'}</p><h1 id="about-title">${c.intro}</h1><p class="hello-line">${lang==='en'?'I’m Rui Tang, exploring the connection between perception, intelligence, and action.':'我是唐睿，探索感知、智能与行动之间的联系。'}</p><p class="intro-text">${c.about}</p><p>${c.focus}</p><div class="interest-tags" aria-label="${c.interests}">${c.tags.map(tag=>`<span>${tag}</span>`).join('')}</div><div class="intro-links"><a href="mailto:${P.email}">${c.contact}${arrow}</a><a href="assets/Tang_Rui_CV.pdf" target="_blank" rel="noopener">${c.download}<span class="link-note">${c.pdfNote}</span>${arrow}</a></div></section>
          <section class="news-section" aria-labelledby="news-title"><h2 id="news-title">${c.news}<span>${c.newsEn}</span></h2><ul>${c.newsItems.map(([date,text])=>`<li><time>${date}</time><span>${text}</span></li>`).join('')}</ul></section>
          <section class="content-section" id="education" aria-labelledby="education-title">${sectionTitle('education',c.education,c.educationEn,'01')}<div class="education-list">${P.education.map(item=>`<article class="education-item"><div class="school-initial ${item.future?'tsinghua':''}" aria-hidden="true">${item.initial}</div><div class="education-info"><div class="item-top"><h3>${t(item.school)}</h3><span class="period">${item.period}</span></div><p class="degree"><span class="education-unit">${t(item.unit)}</span><span class="education-degree">${t(item.degree)}</span></p><p class="item-note">${t(item.note)}</p></div></article>`).join('')}</div></section>
          ${renderResearch(c)}${renderPublications(c)}${renderAwards(c)}
          <footer class="site-footer"><span>© 2026 ${c.footer}</span><span>${c.updated} ${P.updated}</span></footer>
        </main>
      </div>
      <dialog class="certificate-dialog" id="certificate-dialog" aria-labelledby="certificate-title" aria-describedby="certificate-kind">
        <div class="certificate-toolbar"><div><p id="certificate-kind"></p><h2 id="certificate-title"></h2></div><button type="button" class="certificate-close" aria-label="${c.closeCertificate}"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>
        <div class="certificate-stage"><img id="certificate-image" alt=""><p id="certificate-error" hidden>${c.imageLoadError}</p></div>
        <div class="certificate-footer"><span id="certificate-award"></span><a id="certificate-original" target="_blank" rel="noopener">${c.original}${arrow}</a></div>
      </dialog>
      <dialog class="certificate-dialog publication-dialog" id="publication-dialog" aria-labelledby="publication-dialog-title" aria-describedby="publication-figure-caption">
        <div class="certificate-toolbar"><div><p id="publication-dialog-venue"></p><h2 id="publication-dialog-title" lang="en"></h2></div><button type="button" class="certificate-close" aria-label="${c.closeFigure}"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>
        <div class="certificate-stage"><img id="publication-figure-image" alt=""><p id="publication-figure-error" role="status" hidden>${c.figureLoadError}</p></div>
        <div class="certificate-footer"><span id="publication-figure-caption"></span><a id="publication-figure-original" target="_blank" rel="noopener">${c.openFigure}${arrow}</a></div>
      </dialog>`;
    document.getElementById('language-toggle').addEventListener('click', () => {
      lang = lang === 'zh' ? 'en' : 'zh';
      try { localStorage.setItem('rui-tang-language', lang); } catch {}
      const url = new URL(location.href); url.searchParams.set('lang',lang); try { history.replaceState({},'',url); } catch {}
      render();
      document.getElementById('language-toggle').focus({preventScroll:true});
    });
    document.getElementById('menu-toggle').addEventListener('click', e => {
      const button = e.currentTarget; const opened = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded',String(opened));button.setAttribute('aria-label',opened?c.closeMenu:c.menu);
      document.getElementById('site-nav').classList.toggle('is-open',opened);
    });
    document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>{
      document.getElementById('site-nav').classList.remove('is-open');
      document.getElementById('menu-toggle').setAttribute('aria-expanded','false');
      document.getElementById('menu-toggle').setAttribute('aria-label',c.menu);
    }));
    bindCertificateViewer(c);
    bindPublicationViewer(c);
    bindArtDirection();
    if (window.ruiObserver) window.ruiObserver.disconnect();
    window.ruiObserver = new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting) document.querySelectorAll('.nav a').forEach(a=>{const active=a.hash==='#'+entry.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
    }),{rootMargin:'-10% 0px -65% 0px',threshold:0});
    document.querySelectorAll('main section[id]').forEach(s=>window.ruiObserver.observe(s));
  }
  function renderResearch(c) { return P.research.length ? `<section class="content-section" id="research" aria-labelledby="research-title">${sectionTitle('research',c.research,c.researchEn,'02')}<p class="section-lead">${c.researchLead}</p><div class="research-list">${P.research.map((r,i)=>`<article class="research-item"><div class="research-visual"><img src="${r.image}" alt="${esc(t(r.imageAlt))}" width="800" height="500" loading="lazy"></div><div class="research-content"><div class="research-meta"><span>${esc(t(r.label))}</span><span>${r.period}</span></div><h3>${esc(t(r.title))}</h3><p>${esc(t(r.summary))}</p><p class="research-result">${esc(t(r.result))}</p><details><summary>${c.details}<span aria-hidden="true">+</span></summary><div class="detail-content"><p>${esc(t(r.detail))}</p></div></details></div></article>`).join('')}</div></section>` : ''; }
  function renderPublicationLinks(p,c) {
    if (p.status === 'conditional' || p.status === 'upcoming') return '';
    const links=[];
    if (p.doi) links.push(`<a href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener">${c.publisherPage}${arrow}</a>`);
    else if (p.page) links.push(`<a href="${esc(p.page)}" target="_blank" rel="noopener">${c.paperPage}${arrow}</a>`);
    if (p.video) links.push(`<a href="${esc(p.video)}" target="_blank" rel="noopener">${c.video}${arrow}</a>`);
    return links.length ? `<div class="paper-links">${links.join('')}</div>` : '';
  }
  function renderPublications(c) {
    if (!P.publications.length) return '';
    return `<section class="content-section" id="publications" aria-labelledby="publications-title">${sectionTitle('publications',c.publications,c.publicationsEn,'03')}<ol class="publication-list">${P.publications.map((p,i)=>`
      <li class="publication${p.figure?'':' publication-text-only'}">
        <span class="publication-index">${String(i+1).padStart(2,'0')}</span>
        <div class="publication-body">
          <div class="publication-meta"><span class="venue">${esc(p.venue)}</span><span class="status ${p.status}">${c.status[p.status]}</span>${p.presentation==='oral'?`<span class="presentation-badge">${c.oral}</span>`:''}</div>
          <h3 lang="en">${esc(p.title)}</h3>
          ${p.authors?.length?`<p class="authors" lang="en">${p.authors.map(a=>a==='Rui Tang'?'<strong>Rui Tang</strong>':esc(a)).join(', ')}</p>`:''}
          <p class="publication-note">${esc(t(p.note))}</p>${renderPublicationLinks(p,c)}
          ${p.photos?.length?`<div class="paper-moments">${p.photos.map((photo,j)=>`<button type="button" class="talk-photo" data-publication-index="${i}" data-photo-index="${j}" aria-haspopup="dialog" aria-label="${esc(p.venue+' · '+t(photo.label)+' · '+c.viewFigure)}"><img src="${esc(photo.src)}" alt="${esc(t(photo.alt))}" width="160" height="120" loading="lazy"><span>${esc(t(photo.label))}</span></button>`).join('')}</div>`:''}
        </div>
        ${p.figure?`<button type="button" class="paper-preview" data-publication-index="${i}" aria-haspopup="dialog" aria-label="${esc(p.title+' · '+c.viewFigure)}"><span class="paper-image-frame"><img src="${esc(p.figure.thumbnail)}" alt="${esc(t(p.figure.alt))}" width="640" height="480" loading="lazy"><span class="paper-expand" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5"/></svg></span></span><span class="paper-preview-caption"><span>${esc(t(p.figure.label))}</span><span>${c.viewFigure}${arrow}</span></span></button>`:''}
      </li>`).join('')}</ol></section>`;
  }
  function bindPublicationViewer(c) {
    const dialog=document.getElementById('publication-dialog');
    const image=document.getElementById('publication-figure-image');
    const error=document.getElementById('publication-figure-error');
    let trigger;
    document.querySelectorAll('[data-publication-index]').forEach(button=>button.addEventListener('click',()=>{
      const paper=P.publications[Number(button.dataset.publicationIndex)];
      const media=button.dataset.photoIndex===undefined?paper.figure:paper.photos[Number(button.dataset.photoIndex)];
      trigger=button;
      document.getElementById('publication-dialog-title').textContent=paper.title;
      document.getElementById('publication-dialog-venue').textContent=paper.venue+' / '+t(media.label);
      document.getElementById('publication-figure-caption').textContent=t(media.alt);
      document.getElementById('publication-figure-original').href=media.src;
      error.hidden=true;image.hidden=false;
      image.alt=t(media.alt);image.src=media.src;
      document.documentElement.classList.add('certificate-open');
      dialog.showModal();
    }));
    image.addEventListener('error',()=>{image.hidden=true;error.hidden=false;});
    dialog.querySelector('.certificate-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{
      if(event.target!==dialog)return;
      const box=dialog.getBoundingClientRect();
      if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();
    });
    dialog.addEventListener('close',()=>{
      document.documentElement.classList.remove('certificate-open');
      trigger?.focus({preventScroll:true});
    });
  }
  function certificateAssets(a) {
    const pdf = /\.pdf$/i.test(a.proof);
    const stem = a.proof.replace(/\.pdf$/i,'');
    return {
      thumbnail:pdf ? `${stem}-thumb.jpg` : a.proof,
      image:pdf ? `${stem}-full.jpg` : a.proof,
      kind:a.proofKind === 'announcement' ? copy[lang].announcement : copy[lang].evidence,
    };
  }
  function renderAwards(c) {
    if (!P.awards.length) return '';
    return `<section class="content-section" id="honors" aria-labelledby="honors-title">${sectionTitle('honors',c.awards,c.awardsEn,'04')}<p class="section-lead">${c.awardsLead}</p><div class="awards-list">${P.awards.map((a,i)=>{
      const media=certificateAssets(a);
      return `<article class="award"><div class="award-info"><div class="award-meta"><time>${a.year}</time><span aria-hidden="true">${String(i+1).padStart(2,'0')}</span></div><h3>${esc(t(a.title))}</h3><p class="award-level ${a.featured?'featured':''}">${esc(t(a.level))}</p>${a.note?`<p class="award-note">${esc(t(a.note))}</p>`:''}</div><button type="button" class="award-preview" data-award-index="${i}" aria-haspopup="dialog" aria-label="${esc(t(a.title)+' · '+media.kind+' · '+c.viewCertificate)}"><span class="award-image-frame"><img src="${media.thumbnail}" alt="" width="360" height="276" loading="lazy"><span class="award-expand" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5"/></svg></span></span><span class="award-preview-caption"><span>${media.kind}</span><span>${c.viewCertificate}<span aria-hidden="true"> ↗</span></span></span></button></article>`;
    }).join('')}</div></section>`;
  }
  function bindCertificateViewer(c) {
    const dialog=document.getElementById('certificate-dialog');
    const image=document.getElementById('certificate-image');
    const error=document.getElementById('certificate-error');
    let trigger;
    document.querySelectorAll('[data-award-index]').forEach(button=>button.addEventListener('click',()=>{
      const award=P.awards[Number(button.dataset.awardIndex)];
      const media=certificateAssets(award);
      trigger=button;
      document.getElementById('certificate-title').textContent=t(award.title);
      document.getElementById('certificate-kind').textContent=`${award.year} / ${media.kind}`;
      document.getElementById('certificate-award').textContent=t(award.level);
      document.getElementById('certificate-original').href=award.proof;
      error.hidden=true;image.hidden=false;
      image.alt=`${t(award.title)} · ${t(award.level)} · ${media.kind}`;
      image.src=media.image;
      dialog.showModal();
      document.documentElement.classList.add('certificate-open');
      dialog.querySelector('.certificate-close').focus({preventScroll:true});
    }));
    image.addEventListener('error',()=>{image.hidden=true;error.hidden=false;});
    dialog.querySelector('.certificate-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
    dialog.addEventListener('close',()=>{
      document.documentElement.classList.remove('certificate-open');
      trigger?.focus({preventScroll:true});
    });
  }
  function bindArtDirection() {
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    const root=document.documentElement;
    const sections=[...document.querySelectorAll('main section[id]')];
    let frame=0;
    const update=()=>{
      frame=0;
      const span=root.scrollHeight-window.innerHeight;
      root.style.setProperty('--scroll-progress',span>0?String(window.scrollY/span):'0');
      root.style.setProperty('--page-drift',reduced.matches?'0px':`${Math.min(window.scrollY,1200)*.12}px`);
      root.style.setProperty('--portrait-drift',reduced.matches?'0px':`${Math.min(window.scrollY,800)*.03}px`);
      let chapter='about';
      sections.forEach(section=>{if(section.getBoundingClientRect().top<window.innerHeight*.48)chapter=section.id;});
      document.body.dataset.chapter=chapter;
    };
    const request=()=>{if(!frame)frame=window.requestAnimationFrame(update);};
    window.addEventListener('scroll',request,{passive:true});
    window.addEventListener('resize',request,{passive:true});
    let reveal;
    if ('IntersectionObserver' in window) {
      reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(entry.isIntersecting){entry.target.classList.add('is-visible');reveal.unobserve(entry.target);}
      }),{threshold:.04,rootMargin:'0px 0px 20px 0px'});
      document.querySelectorAll('.section-heading,.section-lead,.education-item,.research-item,.publication,.award').forEach((element,i)=>{
        element.classList.add('reveal-target');
        element.style.setProperty('--reveal-delay',`${i%2*55}ms`);
        if(element.getBoundingClientRect().top<window.innerHeight)element.classList.add('is-visible');
        else reveal.observe(element);
      });
    }
    document.querySelectorAll('.about-section .eyebrow,.about-section h1,.about-section .hello-line').forEach(el=>el.classList.add('hero-enter'));
    root.classList.toggle('motion-ready',!reduced.matches);
    const preference=()=>{root.classList.toggle('motion-ready',!reduced.matches);request();};
    reduced.addEventListener('change',preference);
    update();
    window.ruiArtCleanup=()=>{
      window.removeEventListener('scroll',request);window.removeEventListener('resize',request);
      reduced.removeEventListener('change',preference);reveal?.disconnect();
      if(frame)window.cancelAnimationFrame(frame);
    };
  }
  render();
})();
