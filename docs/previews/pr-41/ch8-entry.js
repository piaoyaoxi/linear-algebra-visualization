(() => {
  const baseRenderRoute = renderRoute;

  function structuredSections(chapter) {
    return (chapter?.sections || []).filter((section) => typeof section === "object" && section.id);
  }

  function validLastTarget() {
    const last = localStorage.getItem("la-visual-last");
    if (!last?.startsWith("#")) return null;
    const [route, sectionId] = last.slice(1).split("/");
    const chapter = algebraContent.chapters.find((item) => item.id === route);
    if (!chapter) return null;
    if (sectionId && !structuredSections(chapter).some((item) => item.id === sectionId)) return null;
    return last;
  }

  getStartTarget = function getChapter8AwareStartTarget() {
    return validLastTarget() || "#ch4/matrix-language";
  };

  hasVisitedLesson = function hasChapter8AwareHistory() {
    return Boolean(validLastTarget());
  };

  renderNav = function renderChapter8AwareNav() {
    els.nav.innerHTML = getChapters()
      .map((chapter) => {
        const chapterHref = `#${chapter.id}`;
        const structured = structuredSections(chapter);
        const sectionLinks =
          chapter.id === "guide"
            ? ""
            : structured.length
              ? structured
                  .map(
                    (section) => `
                      <a class="nav-section" href="#${chapter.id}/${section.id}" data-section-link="${section.id}" data-search-text="${normalizeSearchText(
                        getSectionSearchText(section),
                      )}">
                        <span class="status-dot"></span>
                        <span>${section.number} ${section.navTitle}</span>
                        <span class="section-status">未掌握</span>
                      </a>`,
                  )
                  .join("")
              : chapter.sections
                  .map(
                    (section) => `
                      <a class="nav-section" href="${chapterHref}" data-search-text="${normalizeSearchText(getSectionSearchText(section))}">
                        <span class="status-dot"></span>
                        <span>${getSectionLabel(section)}</span>
                      </a>`,
                  )
                  .join("");

        return `
          <div class="chapter-group" data-chapter="${chapter.id}" data-search-text="${normalizeSearchText(`${chapter.title} ${getChapterSectionText(chapter)}`)}">
            <button class="nav-chapter" type="button" aria-expanded="false">
              <span class="chapter-icon">${chapter.icon}</span>
              <span class="chapter-label"><strong>${chapter.title}</strong><small>${getChapterSubtitle(chapter.id)}</small></span>
              <span class="chapter-arrow">›</span>
            </button>
            <div class="section-list">
              <div class="section-list-clip"><div class="section-list-inner">${sectionLinks}</div></div>
            </div>
          </div>`;
      })
      .join("");

    bindChapterToggles();
    updateProgressUI();
  };

  function renderChapter8Overview(chapter) {
    const sections = structuredSections(chapter);
    const meta = [`${sections.length} 个小节`, `${sections.length} 个交互实验`, `${sections.length} 个代表例题`];
    els.main.innerHTML = `
      <section class="lesson-cover ch8-cover" id="chapter8">
        <div class="lesson-cover-copy">
          <span class="eyebrow">第八章 · λ-矩阵</span>
          <h1>从特征矩阵提取相似类的结构指纹</h1>
          <p>${chapter.summary}</p>
          <div class="meta-row">${meta.map((item, index) => `<span class="tag${index === 0 ? " accent" : ""}">${item}</span>`).join("")}</div>
        </div>
        <div class="ch8-cover-map" aria-hidden="true">
          <span>A</span><i>→</i><span>λI−A</span><i>→</i><span>Smith</span><i>→</i><span>dᵢ</span><i>→</i><span>Jordan / Rational</span>
        </div>
      </section>

      <section class="section-band compact-band" id="ch8-structure">
        <div class="section-head"><div><div class="section-kicker">本章结构</div><h2>一条指纹提取与标准形重建路线</h2></div></div>
        <div class="overview-grid">
          <div class="info-panel"><strong>提取</strong><p>把普通矩阵变成 λI−A，用可逆多项式行列操作得到 Smith 标准形。</p></div>
          <div class="info-panel"><strong>分类</strong><p>不变因子与初等因子在换基下保持不变，并完整决定矩阵的相似类。</p></div>
          <div class="info-panel"><strong>重建</strong><p>初等因子生成若尔当块；不变因子生成友矩阵块与有理标准形。</p></div>
        </div>
      </section>

      <section class="section-band compact-band" id="ch8-lessons">
        <div class="section-head"><div><div class="section-kicker">本章目录</div><h2>从 λ-矩阵到两种标准形</h2></div></div>
        <div class="lesson-card-grid ch8-lesson-grid">
          ${sections.map((section) => renderChapter8Card(section)).join("")}
        </div>
      </section>`;
  }

  function renderChapter8Card(section) {
    return `
      <a class="lesson-card ch8-lesson-card" href="#ch8/${section.id}">
        <div class="section-kicker">${section.number} · ${section.textbookSection}</div>
        <h3>${section.navTitle}</h3>
        <p>${section.question}</p>
        <div class="meta-row">${(section.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
      </a>`;
  }

  function renderRoadmap(section) {
    if (!section.roadmap?.length) return "";
    return `
      <div class="ch8-roadmap" aria-label="本节阅读路线">
        ${section.roadmap.map((item, index) => `<div><span>${String(index + 1).padStart(2, "0")}</span><p>${item}</p></div>`).join("")}
      </div>`;
  }

  function renderFormal(section) {
    const formal = section.formal || [];
    return `
      <section class="section-band lesson-page-section ch8-formal" id="${section.id}-formal">
        <div class="section-head"><div><div class="section-kicker">定义 · 定理 · 结构</div><h2>把直觉落回严格表述</h2></div></div>
        ${renderRoadmap(section)}
        <div class="concept-strip ch8-concept-strip">
          ${(section.concepts || []).map((concept) => `<div class="concept-item"><span>${concept.label}</span><p>${concept.text}</p></div>`).join("")}
        </div>
        <div class="ch8-theory-stack">
          ${formal
            .map(
              (item, index) => `
                <article class="ch8-theory-card">
                  <div class="ch8-theory-index">${String(index + 1).padStart(2, "0")}</div>
                  <div><h3>${item.title}</h3><p>${item.body}</p>${item.formula ? `<div class="ch8-formula">${texDisplay(item.formula)}</div>` : ""}</div>
                </article>`,
            )
            .join("")}
        </div>
        <div class="script-panel textbook-panel ch8-textbook">
          <h3>${section.textbookSection} · ${section.textbook?.reference || "北大版《高等代数》第八章"}</h3>
          <ul>${(section.textbook?.items || []).map((item) => `<li>${item}</li>`).join("")}</ul>
        </div>
        ${
          section.misconceptions?.length
            ? `<div class="ch8-misconceptions"><strong>常见误区</strong><div>${section.misconceptions.map((item) => `<span>${item}</span>`).join("")}</div></div>`
            : ""
        }
      </section>`;
  }

  function renderInteraction(section) {
    const interactive = section.interactive;
    if (!interactive) return "";
    return `
      <section class="section-band lesson-page-section ch8-interactive-section" id="${section.id}-interactive">
        <div class="section-head"><div><div class="section-kicker">交互实验</div><h2>${interactive.title}</h2></div></div>
        <p class="lead">${interactive.description}</p>
        <div class="ch8-lab-host" data-ch8-lab="${interactive.kind}" data-section-id="${section.id}"></div>
        <div class="script-panel ch8-task-panel">
          <h3>操作任务</h3>
          <p>${interactive.task || ""}</p>
          ${(interactive.prompts || []).length ? `<ol>${interactive.prompts.map((item) => `<li>${item}</li>`).join("")}</ol>` : ""}
        </div>
      </section>`;
  }

  function renderExample(section) {
    const example = section.example;
    if (!example) return "";
    const choiceMarkup = Array.isArray(example.choices)
      ? `<fieldset class="ch8-example-choices" data-ch8-example-choices>
          <legend class="sr-only">请选择一个答案</legend>
          ${example.choices
            .map(
              (choice, index) => `<label><input type="radio" name="${section.id}-choice" value="${index}"><span>${String.fromCharCode(65 + index)}</span><b>${choice.text}</b></label>`,
            )
            .join("")}
        </fieldset>`
      : "";
    return `
      <section class="section-band lesson-page-section" id="${section.id}-example">
        <h2>代表例题</h2>
        <div class="ch8-example" data-ch8-example data-section-id="${section.id}">
          <div class="ch8-example-head"><span>例题 · 先思考再展开</span><h3>${example.title}</h3></div>
          <div class="ch8-example-question">${example.question}</div>
          ${choiceMarkup}
          <div class="ch8-example-actions">
            <button class="button primary" type="button" data-ch8-example-action${choiceMarkup ? " disabled" : ""}>${choiceMarkup ? "检查" : "显示第一步"}</button>
            <p data-ch8-example-feedback aria-live="polite">${choiceMarkup ? "选择一个答案后再检查。" : "先独立思考，再逐步核对。"}</p>
          </div>
          <ol class="ch8-example-steps" data-ch8-example-steps></ol>
        </div>
      </section>`;
  }

  function renderSelfTest(section) {
    if (!section.quiz?.length) return "";
    return `
      <section class="section-band lesson-page-section" id="${section.id}-quiz">
        <h2>自测</h2>
        <div class="self-test-list">
          ${section.quiz
            .map(
              (item, index) => `
                <details class="self-test-item">
                  <summary>${index + 1}. ${item.question}</summary>
                  <div class="disclose-panel"><div class="disclose-panel-inner"><p>${item.answer}</p></div></div>
                </details>`,
            )
            .join("")}
        </div>
      </section>`;
  }

  function renderNeighbors(section, chapter) {
    const sections = structuredSections(chapter);
    const index = sections.findIndex((item) => item.id === section.id);
    const previous = sections[index - 1] || null;
    const next = sections[index + 1] || null;
    const card = (item, direction) => {
      if (!item) return `<span class="lesson-neighbor-spacer" aria-hidden="true"></span>`;
      const prev = direction === "previous";
      return `<a class="lesson-neighbor-card ${prev ? "is-previous" : "is-next"}" href="#ch8/${item.id}"><span class="lesson-neighbor-label">${prev ? "← 上一节" : "下一节 →"}</span><strong>${item.number} ${item.navTitle}</strong><span>第八章 λ-矩阵</span></a>`;
    };
    return `<nav class="lesson-neighbor-nav" aria-label="上下节导航">${card(previous, "previous")}${card(next, "next")}</nav>`;
  }

  function renderChapter8Lesson(section, chapter) {
    els.main.innerHTML = `
      <section class="lesson-cover ch8-cover" id="${section.id}">
        <div class="lesson-cover-copy">
          <div class="breadcrumb">第八章 λ-矩阵 <span>/</span> ${section.title}</div>
          <h1>${section.title}</h1>
          <p>${section.goal}</p>
          <div class="meta-row">${(section.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
        </div>
      </section>

      <section class="section-band lesson-page-section" id="${section.id}-question">
        <div class="section-kicker">核心问题</div>
        <h2>${section.question}</h2>
        <p class="lead">${section.intro}</p>
      </section>

      ${renderFormal(section)}
      ${renderInteraction(section)}
      ${renderExample(section)}
      ${renderSelfTest(section)}

      <section class="section-band lesson-page-section" id="${section.id}-summary">
        <h2>小结</h2>
        <ul>${(section.summary || []).map((item) => `<li>${item}</li>`).join("")}</ul>
        <button class="button mark-button" type="button" data-complete="${section.id}">标记掌握</button>
      </section>
      ${renderNeighbors(section, chapter)}`;
  }

  function renderChapter8(chapter) {
    const sections = structuredSections(chapter);
    const section = sections.find((item) => item.id === state.section);
    if (section) renderChapter8Lesson(section, chapter);
    else renderChapter8Overview(chapter);
  }

  renderRoute = function renderChapter8AwareRoute() {
    const raw = decodeURIComponent(window.location.hash.replace(/^#/, "")) || "guide";
    const [requestedRoute, requestedSection] = raw.split("/");

    if (requestedRoute !== "ch8") {
      window.teardownChapter8?.();
      baseRenderRoute();
      return;
    }

    const chapter = algebraContent.chapters.find((item) => item.id === "ch8");
    if (!chapter) {
      baseRenderRoute();
      return;
    }

    const sections = structuredSections(chapter);
    const sectionId = requestedSection && sections.some((item) => item.id === requestedSection) ? requestedSection : "";

    window.teardownChapter8?.();
    state.route = "ch8";
    state.section = sectionId;
    state.openChapters.add("ch8");
    document.body.dataset.route = "ch8";
    document.body.dataset.view = sectionId ? "lesson" : "overview";

    renderChapter8(chapter);
    localStorage.setItem("la-visual-last", `#ch8${sectionId ? `/${sectionId}` : ""}`);
    document.title = sectionId
      ? `${sections.find((item) => item.id === sectionId).number} ${sections.find((item) => item.id === sectionId).navTitle} | 高等代数可视化`
      : `${chapter.title} | 高等代数可视化`;

    updateNavActive();
    updateContinueShortcut();
    buildPageToc();
    document.body.classList.remove("sidebar-open");

    window.requestAnimationFrame(() => {
      setupInteractiveBlocks();
      window.mountChapter8?.(sections.find((item) => item.id === sectionId), els.main);
      if (sectionId) document.querySelector(`#${CSS.escape(sectionId)}`)?.scrollIntoView({ block: "start", behavior: "auto" });
      else window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  };
})();
