(() => {
  const baseRenderRoute = renderRoute;

  const structuredSections = (chapter) =>
    (chapter?.sections || []).filter((section) => typeof section === "object" && section.id);

  function validLastTarget() {
    const last = localStorage.getItem("la-visual-last");
    if (!last?.startsWith("#")) return null;
    const [route, sectionId] = last.slice(1).split("/");
    const chapter = algebraContent.chapters.find((item) => item.id === route);
    if (!chapter) return null;
    if (sectionId && !structuredSections(chapter).some((item) => item.id === sectionId)) return null;
    return last;
  }

  getStartTarget = () => validLastTarget() || "#ch4/matrix-language";
  hasVisitedLesson = () => Boolean(validLastTarget());

  renderNav = function renderChapter8AwareNav() {
    els.nav.innerHTML = getChapters()
      .map((chapter) => {
        const chapterHref = `#${chapter.id}`;
        const structured = structuredSections(chapter);
        const sectionLinks = chapter.id === "guide"
          ? ""
          : structured.length
            ? structured.map((section) => `
                <a class="nav-section" href="#${chapter.id}/${section.id}" data-section-link="${section.id}" data-search-text="${normalizeSearchText(getSectionSearchText(section))}">
                  <span class="status-dot"></span>
                  <span>${section.number} ${section.navTitle}</span>
                  <span class="section-status">未掌握</span>
                </a>`).join("")
            : chapter.sections.map((section) => `
                <a class="nav-section" href="${chapterHref}" data-search-text="${normalizeSearchText(getSectionSearchText(section))}">
                  <span class="status-dot"></span><span>${getSectionLabel(section)}</span>
                </a>`).join("");

        return `
          <div class="chapter-group" data-chapter="${chapter.id}" data-search-text="${normalizeSearchText(`${chapter.title} ${getChapterSectionText(chapter)}`)}">
            <button class="nav-chapter" type="button" aria-expanded="false">
              <span class="chapter-icon">${chapter.icon}</span>
              <span class="chapter-label"><strong>${chapter.title}</strong><small>${getChapterSubtitle(chapter.id)}</small></span>
              <span class="chapter-arrow">›</span>
            </button>
            <div class="section-list"><div class="section-list-clip"><div class="section-list-inner">${sectionLinks}</div></div></div>
          </div>`;
      }).join("");
    bindChapterToggles();
    updateProgressUI();
  };

  function renderChapter8Overview(chapter) {
    const sections = structuredSections(chapter);
    els.main.innerHTML = `
      <section class="lesson-cover ch8-cover ch8-overview-cover" id="chapter8">
        <div class="lesson-cover-copy">
          <span class="eyebrow">第八章 · λ-矩阵</span>
          <h1>从 λI−A 读出矩阵的结构</h1>
          <p>${chapter.summary}</p>
          <div class="meta-row"><span class="tag accent">7 个小节</span><span class="tag">相似分类</span><span class="tag">两种标准形</span></div>
        </div>
        <ol class="ch8-route-line" aria-label="本章结构路线">
          <li><span>1</span><b>构造</b><small>λI−A</small></li>
          <li><span>2</span><b>压缩</b><small>Smith 与不变因子</small></li>
          <li><span>3</span><b>分类</b><small>相似指纹</small></li>
          <li><span>4</span><b>重建</b><small>Jordan / 有理标准形</small></li>
        </ol>
      </section>
      <section class="section-band compact-band ch8-overview-intro" id="ch8-structure">
        <div class="section-kicker">本章主线</div>
        <h2>${texInline("A\\longmapsto \\lambda I-A\\longmapsto d_i(\\lambda)\\longmapsto \\text{标准形}")}</h2>
        <p>矩阵的数值会随换基改变。我们要找的是不会改变的多项式结构，并用它重建矩阵的标准形。</p>
      </section>
      <section class="section-band compact-band" id="ch8-lessons">
        <div class="section-head"><div><div class="section-kicker">本章目录</div><h2>七个问题，共用一条结构线索</h2></div></div>
        <div class="ch8-lesson-list">
          ${sections.map((section, index) => `
            <a href="#ch8/${section.id}" class="ch8-lesson-row">
              <span>${String(index + 1).padStart(2, "0")}</span>
              <div><small>${section.textbookSection}</small><h3>${section.navTitle}</h3><p>${section.question}</p></div>
              <b aria-hidden="true">→</b>
            </a>`).join("")}
        </div>
      </section>`;
  }

  function renderObserve(section) {
    if (!section.observe) return "";
    return `
      <section class="section-band lesson-page-section ch8-observe" id="${section.id}-observe">
        <div class="section-kicker">观察顺序</div>
        <h2>${section.observe.title}</h2>
        <p>${section.observe.lead}</p>
        <ol>${section.observe.cues.map((cue) => `<li>${cue}</li>`).join("")}</ol>
      </section>`;
  }

  function renderInteraction(section) {
    if (!section.interactive) return "";
    return `
      <section class="section-band lesson-page-section ch8-interactive-section" id="${section.id}-interactive">
        <div class="ch8-lab-intro">
          <div><div class="section-kicker">核心实验</div><h2>${section.interactive.title}</h2><p>${section.interactive.description}</p></div>
          <aside><span>要回答</span><strong>${section.interactive.mission}</strong></aside>
        </div>
        <div class="ch8-lab-host" data-ch8-lab="${section.interactive.kind}" data-section-id="${section.id}"></div>
        <ol class="ch8-experiment-roadmap" aria-label="实验步骤">
          ${section.interactive.steps.map((step, index) => `
            <li data-experiment-step="${index}"><span>${index + 1}</span><div><b>${step.action}</b><p>${step.watch}</p></div></li>`).join("")}
        </ol>
      </section>`;
  }

  function renderFoundation(section) {
    if (!section.foundation?.length) return "";
    return `
      <section class="section-band lesson-page-section ch8-foundation" id="${section.id}-formal">
        <div class="section-head"><div><div class="section-kicker">教材表达</div><h2>把实验中的现象写成严格结论</h2></div></div>
        <div class="ch8-foundation-stack">
          ${section.foundation.map((item) => `
            <article class="ch8-foundation-module">
              <span>${item.number}</span>
              <div><h3>${item.title}</h3>${item.subtitle ? `<p>${item.subtitle}</p>` : ""}<p>${item.body}</p>${item.formula ? `<div class="ch8-foundation-formula">${texDisplay(item.formula)}</div>` : ""}</div>
            </article>`).join("")}
        </div>
        ${section.misconceptions?.length ? `<div class="ch8-misconceptions"><strong>容易混淆</strong><ul>${section.misconceptions.map((item) => `<li>${item}</li>`).join("")}</ul></div>` : ""}
      </section>`;
  }

  function renderExample(section) {
    const example = section.example;
    if (!example) return "";
    const choices = Array.isArray(example.choices) ? `
      <fieldset class="ch8-example-choices" data-ch8-example-choices><legend class="sr-only">请选择一个答案</legend>
        ${example.choices.map((choice, index) => `<label><input type="radio" name="${section.id}-choice" value="${index}"><span>${String.fromCharCode(65 + index)}</span><b>${choice.text}</b></label>`).join("")}
      </fieldset>` : "";
    return `
      <section class="section-band lesson-page-section" id="${section.id}-example">
        <div class="section-head"><div><div class="section-kicker">代表例题</div><h2>先判断结构，再展开计算</h2></div></div>
        <div class="ch8-example" data-ch8-example data-section-id="${section.id}">
          <span>问题</span><h3>${example.title}</h3><div class="ch8-example-question">${example.question}</div>${choices}
          <div class="ch8-example-actions"><button class="button primary" type="button" data-ch8-example-action${choices ? " disabled" : ""}>${choices ? "检查选择" : "显示第一步"}</button><p data-ch8-example-feedback aria-live="polite">${choices ? "先选一个答案。" : "先独立思考，再逐步核对。"}</p></div>
          <ol class="ch8-example-steps" data-ch8-example-steps></ol>
        </div>
      </section>`;
  }

  function renderSelfTest(section) {
    if (!section.quiz?.length) return "";
    return `
      <section class="section-band lesson-page-section" id="${section.id}-quiz">
        <div class="section-head"><div><div class="section-kicker">自测</div><h2>离开实验后，还能否独立说明？</h2></div></div>
        <div class="self-test-list">${section.quiz.map((item, index) => `<details class="self-test-item"><summary>${index + 1}. ${item.question}</summary><div class="disclose-panel"><div class="disclose-panel-inner"><p>${item.answer}</p></div></div></details>`).join("")}</div>
      </section>`;
  }

  function renderNeighbors(section, chapter) {
    const sections = structuredSections(chapter);
    const index = sections.findIndex((item) => item.id === section.id);
    const neighbor = (item, previous) => item
      ? `<a class="lesson-neighbor-card ${previous ? "is-previous" : "is-next"}" href="#ch8/${item.id}"><span class="lesson-neighbor-label">${previous ? "← 上一节" : "下一节 →"}</span><strong>${item.number} ${item.navTitle}</strong><span>第八章 λ-矩阵</span></a>`
      : `<span class="lesson-neighbor-spacer" aria-hidden="true"></span>`;
    return `<nav class="lesson-neighbor-nav" aria-label="上下节导航">${neighbor(sections[index - 1], true)}${neighbor(sections[index + 1], false)}</nav>`;
  }

  function renderChapter8Lesson(section, chapter) {
    els.main.innerHTML = `
      <section class="lesson-cover ch8-cover" id="${section.id}">
        <div class="lesson-cover-copy"><div class="breadcrumb">第八章 λ-矩阵 <span>/</span> ${section.title}</div><h1>${section.title}</h1><p>${section.goal}</p><div class="meta-row">${(section.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join("")}</div></div>
      </section>
      <section class="section-band lesson-page-section ch8-question" id="${section.id}-question"><div class="section-kicker">本节问题</div><h2>${section.question}</h2><p class="lead">${section.intro}</p></section>
      ${renderObserve(section)}${renderInteraction(section)}${renderFoundation(section)}${renderExample(section)}${renderSelfTest(section)}
      <section class="section-band lesson-page-section ch8-summary" id="${section.id}-summary"><div class="section-kicker">小结</div><h2>三句话收束</h2><ol>${(section.summary || []).map((item) => `<li>${item}</li>`).join("")}</ol><button class="button mark-button" type="button" data-complete="${section.id}">标记掌握</button></section>
      ${renderNeighbors(section, chapter)}`;
  }

  renderRoute = function renderChapter8AwareRoute() {
    const raw = decodeURIComponent(window.location.hash.replace(/^#/, "")) || "guide";
    const [requestedRoute, requestedSection] = raw.split("/");
    if (requestedRoute !== "ch8") { window.teardownChapter8?.(); baseRenderRoute(); return; }
    const chapter = algebraContent.chapters.find((item) => item.id === "ch8");
    if (!chapter) { baseRenderRoute(); return; }
    const sections = structuredSections(chapter);
    const sectionId = requestedSection && sections.some((item) => item.id === requestedSection) ? requestedSection : "";
    window.teardownChapter8?.();
    state.route = "ch8"; state.section = sectionId; state.openChapters.add("ch8");
    document.body.dataset.route = "ch8"; document.body.dataset.view = sectionId ? "lesson" : "overview";
    const activeSection = sections.find((item) => item.id === sectionId);
    activeSection ? renderChapter8Lesson(activeSection, chapter) : renderChapter8Overview(chapter);
    localStorage.setItem("la-visual-last", `#ch8${sectionId ? `/${sectionId}` : ""}`);
    document.title = activeSection ? `${activeSection.number} ${activeSection.navTitle} | 高等代数可视化` : `${chapter.title} | 高等代数可视化`;
    updateNavActive(); updateContinueShortcut(); buildPageToc(); document.body.classList.remove("sidebar-open");
    window.requestAnimationFrame(() => {
      setupInteractiveBlocks(); window.mountChapter8?.(activeSection, els.main);
      activeSection ? document.querySelector(`#${CSS.escape(sectionId)}`)?.scrollIntoView({ block: "start", behavior: "auto" }) : window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  };
})();
