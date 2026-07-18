(() => {
  const ui = window.chapter10UI;
  let activeTeardown = null;

  function chapterChainVisual() {
    return `
      <div class="ch10-chain" aria-label="第十章概念主线">
        <div class="ch10-chain-node"><span>V</span><small>向量</small></div>
        <i>由函数测量</i>
        <div class="ch10-chain-node is-functional"><span>V*</span><small>线性读取器</small></div>
        <i>增加第二输入</i>
        <div class="ch10-chain-node is-bilinear"><span>B(x,y)</span><small>双线性配对</small></div>
        <i>交错且非退化</i>
        <div class="ch10-chain-node is-symplectic"><span>ω</span><small>辛形式</small></div>
      </div>`;
  }

  function renderOverview(chapter, sections) {
    return `
      <section class="lesson-cover structured-cover ch10-cover" id="ch10-overview">
        <div class="lesson-cover-copy">
          <span class="eyebrow">${chapter.title}</span>
          <h1>${chapter.overviewTitle}</h1>
          <p>${chapter.summary}</p>
          <div class="meta-row">
            <span class="tag accent">${sections.length} 个小节</span>
            <span class="tag">4 个主交互</span>
            <span class="tag">4 个分步例题</span>
          </div>
        </div>
        ${chapterChainVisual()}
      </section>

      <section class="section-band compact-band" id="ch10-structure">
        <div class="section-head"><div><div class="section-kicker">本章结构</div><h2>每一步都增加一种新的“输入方式”</h2></div></div>
        <div class="overview-grid">
          ${chapter.overviewCards.map((card, index) => `<article class="info-panel ch10-overview-card"><span>0${index + 1}</span><strong>${card.title}</strong><p>${card.text}</p></article>`).join("")}
        </div>
      </section>

      <section class="section-band compact-band" id="ch10-lessons">
        <div class="section-head"><div><div class="section-kicker">本章目录</div><h2>沿着同一条主线进入四个小节</h2></div></div>
        <div class="lesson-card-grid ch10-lesson-grid">
          ${sections.map((section) => `
            <a class="lesson-card ch10-lesson-card" href="#ch10/${section.id}">
              <div class="section-kicker">${section.number} · ${section.textbookSection}</div>
              <h3>${section.navTitle}</h3>
              <p>${section.question}</p>
              <div class="meta-row">${section.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
            </a>`).join("")}
        </div>
      </section>`;
  }

  function lessonGlyph(sectionId) {
    const labels = {
      "linear-functional": ["f", "V → F"],
      "dual-space": ["V*", "functions"],
      "bilinear-form": ["B", "V × W → F"],
      "symplectic-space": ["ω", "alternating"],
    };
    const [symbol, caption] = labels[sectionId] || ["10", "chapter"];
    return `<div class="ch10-lesson-glyph" aria-hidden="true"><span>${symbol}</span><small>${caption}</small></div>`;
  }

  function renderLesson(chapter, section, navigation) {
    const renderer = window.getChapter10Renderer(section.id);
    if (!renderer) throw new Error(`Missing Chapter 10 renderer for ${section.id}`);

    return `
      <section class="lesson-cover structured-lesson-cover ch10-lesson-cover" id="${section.id}">
        <div class="lesson-cover-copy">
          <div class="breadcrumb">${chapter.title} <span>/</span> ${section.title}</div>
          <h1>${section.title}</h1>
          <p>${section.goal}</p>
          <div class="meta-row">${section.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
        </div>
        ${lessonGlyph(section.id)}
      </section>

      <section class="section-band lesson-page-section" id="${section.id}-question">
        <div class="section-kicker">从问题开始</div>
        <h2>${section.question}</h2>
        <p class="lead">${section.intro}</p>
      </section>

      <section class="section-band lesson-page-section ch10-intuition-section" id="${section.id}-intuition">
        <h2>先建立画面</h2>
        <div data-ch10-intuition="${section.id}">${renderer.renderIntuition(section)}</div>
      </section>

      <section class="section-band lesson-page-section ch10-interactive-section" id="${section.id}-interactive">
        <h2>交互实验</h2>
        ${ui.renderObservationHeader(section.interactive)}
        <div data-ch10-interactive="${section.id}">${renderer.renderInteractive(section)}</div>
        ${ui.renderTaskList(section.interactive.tasks)}
      </section>

      <section class="section-band lesson-page-section ch10-formal-section" id="${section.id}-formal">
        <h2>把观察写成定义与结构</h2>
        <div data-ch10-formal="${section.id}">${renderer.renderFormal(section)}</div>
      </section>

      ${ui.renderExample(section)}
      ${renderSelfTestSection(section)}

      <section class="section-band lesson-page-section" id="${section.id}-summary">
        <h2>小结</h2>
        ${renderSummary(section)}
        <button class="button mark-button" type="button" data-complete="${section.id}">标记掌握</button>
      </section>
      ${navigation}`;
  }

  function mountLesson(chapter, section, root) {
    activeTeardown?.();
    activeTeardown = null;
    const renderer = window.getChapter10Renderer(section.id);
    const cleanups = [];
    const addCleanup = (cleanup) => { if (typeof cleanup === "function") cleanups.push(cleanup); };
    addCleanup(renderer?.mountIntuition?.(section, root));
    addCleanup(renderer?.mountInteractive?.(section, root));
    addCleanup(renderer?.mountFormal?.(section, root));
    addCleanup(window.Chapter10Cinematic?.mount?.(section, root));
    ui.bindExample(root, section.example);
    activeTeardown = () => {
      cleanups.reverse().forEach((cleanup) => cleanup());
      renderer?.teardown?.();
    };
  }

  window.defineStructuredChapterRenderer("ch10", {
    renderOverview,
    renderLesson,
    mountLesson,
    teardown() {
      activeTeardown?.();
      activeTeardown = null;
    },
  });
})();