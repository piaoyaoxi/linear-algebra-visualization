(() => {
  const CHAPTER_ID = "ch9";

  function structuredSections(chapter) {
    return (chapter?.sections || []).filter((section) => typeof section === "object" && section.id);
  }

  function findSection(chapter, id) {
    return structuredSections(chapter).find((section) => section.id === id) || null;
  }

  function allTrackableSections() {
    return algebraContent.chapters.flatMap((chapter) => structuredSections(chapter));
  }

  function firstTrackableTarget() {
    for (const chapter of [...algebraContent.chapters].sort((a, b) => {
      const ai = Number((a.id || "").replace(/^ch/, "")) || 999;
      const bi = Number((b.id || "").replace(/^ch/, "")) || 999;
      return ai - bi;
    })) {
      const first = structuredSections(chapter)[0];
      if (first) return `#${chapter.id}/${first.id}`;
    }
    return "#ch4/matrix-language";
  }

  learnLastTarget = function chapterNineAwareLastTarget() {
    const last = localStorage.getItem("la-visual-last");
    if (!last || !last.startsWith("#")) return null;
    const [route, sectionId] = last.slice(1).split("/");
    const chapter = algebraContent.chapters.find((item) => item.id === route);
    if (!chapter) return null;
    if (sectionId && !findSection(chapter, sectionId)) return null;
    return last;
  };

  getProgress = function chapterNineAwareProgress() {
    const trackable = allTrackableSections();
    return {
      done: trackable.filter((section) => state.completed.has(section.id)).length,
      total: trackable.length,
    };
  };

  getStartTarget = function chapterNineAwareStartTarget() {
    return learnLastTarget() || firstTrackableTarget();
  };

  hasVisitedLesson = function chapterNineAwareHistory() {
    return Boolean(learnLastTarget());
  };

  renderNav = function renderChapterNineAwareNav() {
    els.nav.innerHTML = getChapters()
      .map((chapter) => {
        const structured = structuredSections(chapter);
        let sectionLinks = "";
        if (chapter.id !== "guide") {
          if (structured.length) {
            sectionLinks = structured
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
              .join("");
          } else {
            sectionLinks = (chapter.sections || [])
              .map(
                (section) => `
                  <a class="nav-section" href="#${chapter.id}" data-search-text="${normalizeSearchText(getSectionSearchText(section))}">
                    <span class="status-dot"></span>
                    <span>${getSectionLabel(section)}</span>
                  </a>`,
              )
              .join("");
          }
        }

        return `
          <div class="chapter-group" data-chapter="${chapter.id}" data-search-text="${normalizeSearchText(
            `${chapter.title} ${getChapterSectionText(chapter)}`,
          )}">
            <button class="nav-chapter" type="button" aria-expanded="false">
              <span class="chapter-icon">${chapter.icon}</span>
              <span class="chapter-label"><strong>${chapter.title}</strong><small>${getChapterSubtitle(chapter.id)}</small></span>
              <span class="chapter-arrow">›</span>
            </button>
            <div class="section-list"><div class="section-list-clip"><div class="section-list-inner">${sectionLinks}</div></div></div>
          </div>`;
      })
      .join("");

    bindChapterToggles();
    updateProgressUI();
  };

  updateDocumentTitle = function updateChapterNineAwareTitle(chapter) {
    const section = state.section ? findSection(chapter, state.section) : null;
    document.title = section
      ? `${section.number} ${section.navTitle} | 高等代数可视化`
      : `${chapter.title} | 高等代数可视化`;
  };

  function renderMetric(label, value, detail = "") {
    return `<div class="ch9-overview-metric"><span>${label}</span><strong>${value}</strong>${detail ? `<small>${detail}</small>` : ""}</div>`;
  }

  function renderChapterNineOverview(chapter) {
    const sections = structuredSections(chapter);
    const overview = chapter.overview || {};
    els.main.innerHTML = `
      <section class="lesson-cover ch9-cover" id="chapter9">
        <div class="lesson-cover-copy">
          <span class="eyebrow">第九章 · 欧几里得空间</span>
          <h1>${overview.title || chapter.subtitle}</h1>
          <p>${chapter.summary}</p>
          <div class="meta-row">
            <span class="tag accent">${sections.length} 个小节</span>
            <span class="tag">${sections.length} 个交互实验</span>
            <span class="tag">${sections.length} 个代表例题</span>
          </div>
        </div>
        <div class="ch9-cover-visual" aria-hidden="true">
          <svg viewBox="0 0 560 300">
            <g class="ch9-cover-grid">
              <path d="M34 245H525M78 270V30"></path>
              <path d="M78 245L244 92L472 175"></path>
              <path d="M78 245L262 245"></path>
            </g>
            <path class="ch9-cover-vector ch9-cover-vector-x" d="M78 245L378 76"></path>
            <path class="ch9-cover-vector ch9-cover-vector-p" d="M78 245L337 245"></path>
            <path class="ch9-cover-vector ch9-cover-vector-e" d="M337 245L378 76"></path>
            <path class="ch9-cover-right" d="M322 245V230H337"></path>
            <circle cx="78" cy="245" r="5"></circle>
            <circle cx="378" cy="76" r="5"></circle>
            <text x="388" y="72">x</text>
            <text x="226" y="266">P_Wx</text>
            <text x="360" y="168">x−P_Wx</text>
          </svg>
        </div>
      </section>

      <section class="section-band compact-band ch9-overview" id="ch9-structure">
        <div class="section-head"><div><div class="section-kicker">本章主线</div><h2>一条正交结构贯穿八个小节</h2></div></div>
        <p class="lead ch9-spine">${overview.spine || "内积 → 正交 → 投影 → 谱分解 → 最小二乘"}</p>
        <div class="ch9-overview-metrics">
          ${renderMetric("源头", "内积", "统一产生长度、夹角和距离")}
          ${renderMetric("坐标", "标准正交基", "坐标直接等于投影系数")}
          ${renderMetric("应用", "投影", "连接最近点、谱分解与拟合")}
        </div>
        <div class="overview-grid ch9-overview-panels">
          ${(overview.panels || [])
            .map((panel) => `<div class="info-panel"><strong>${panel.title}</strong><p>${panel.text}</p></div>`)
            .join("")}
        </div>
      </section>

      <section class="section-band compact-band" id="ch9-lessons">
        <div class="section-head"><div><div class="section-kicker">本章目录</div><h2>从内积一路走到最小二乘与酉空间</h2></div></div>
        <div class="lesson-card-grid ch9-lesson-grid">
          ${sections
            .map(
              (section) => `
                <a class="lesson-card ch9-lesson-card" href="#${chapter.id}/${section.id}">
                  <div class="section-kicker">${section.number} · ${section.textbookSection}</div>
                  <h3>${section.navTitle}</h3>
                  <p>${section.question}</p>
                  <div class="meta-row">${(section.tags || []).slice(0, 3).map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
                </a>`,
            )
            .join("")}
        </div>
      </section>`;
  }

  function renderConceptCards(section) {
    return `
      <div class="ch9-concept-grid">
        ${(section.concepts || [])
          .map(
            (concept) => `
              <article class="ch9-concept-card">
                <span>${concept.label}</span>
                <p>${concept.text}</p>
              </article>`,
          )
          .join("")}
      </div>`;
  }

  function renderFormalBlocks(section) {
    return `
      <div class="ch9-formal-flow">
        ${(section.formalBlocks || [])
          .map(
            (block, index) => `
              <article class="ch9-formal-block">
                <div class="ch9-formal-index">${String(index + 1).padStart(2, "0")}</div>
                <div class="ch9-formal-copy">
                  <span>${block.eyebrow}</span>
                  <h3>${block.title}</h3>
                  <div>${block.body}</div>
                </div>
              </article>`,
          )
          .join("")}
      </div>`;
  }

  function renderTextbookMap(section) {
    const items = section.textbook?.items || [];
    if (!items.length) return "";
    return `
      <aside class="ch9-textbook-map">
        <div><span>教材对应</span><strong>${section.textbook?.reference || "北大版《高等代数》"}</strong></div>
        <ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>
      </aside>`;
  }

  function renderLabSection(section) {
    const lab = section.interactive;
    return `
      <section class="section-band lesson-page-section ch9-lab-section" id="${section.id}-interactive">
        <div class="ch9-section-heading">
          <div><span>动手验证</span><h2>交互实验</h2></div>
          <p>${lab.description}</p>
        </div>
        <div class="ch9-lab-shell" data-ch9-lab="${lab.lab}" data-section-id="${section.id}">
          <div class="ch9-lab-loading" aria-live="polite">正在载入数学实验…</div>
        </div>
        <div class="script-panel ch9-task-panel">
          <h3>操作任务</h3>
          <p>${lab.task}</p>
          <ol>${(lab.prompts || []).map((prompt) => `<li>${prompt}</li>`).join("")}</ol>
        </div>
      </section>`;
  }

  function renderExample(section) {
    const example = section.example;
    const name = `${section.id}-example`;
    return `
      <section class="section-band lesson-page-section" id="${section.id}-example">
        <h2>代表例题</h2>
        <div class="example-challenge ch9-example" data-ch9-example data-state="idle">
          <div class="example-challenge-content">
            <div class="example-challenge-head"><span class="example-label">例题 · 先作答再看解析</span><h3>${escapeHtml(example.title)}</h3></div>
            <p class="example-challenge-question">${example.question}</p>
            <fieldset class="example-choice-list" aria-label="${escapeAttribute(example.title)}">
              <legend class="visually-hidden">请选择一个答案</legend>
              ${example.choices
                .map(
                  (choice, index) => `
                    <label class="example-choice">
                      <input type="radio" name="${name}" value="${index}" data-correct="${choice.correct ? "true" : "false"}" />
                      <span class="example-choice-marker" aria-hidden="true">${String.fromCharCode(65 + index)}</span>
                      <span class="example-choice-copy">${choice.text}</span>
                      <span class="example-choice-result" aria-hidden="true">✓</span>
                    </label>`,
                )
                .join("")}
            </fieldset>
            <div class="example-challenge-actions">
              <button class="button primary example-check" type="button" data-ch9-example-check disabled>检查</button>
              <div class="example-feedback" data-ch9-example-feedback aria-live="polite">选择一个答案后再检查。</div>
            </div>
            <div class="example-explanation" data-ch9-example-explanation hidden>
              <h4>答案与分析</h4>
              <ol>${(example.steps || []).map((step) => `<li>${step}</li>`).join("")}</ol>
            </div>
          </div>
        </div>
      </section>`;
  }

  function renderQuiz(section) {
    return `
      <section class="section-band lesson-page-section" id="${section.id}-quiz">
        <h2>自测</h2>
        <div class="self-test-list">
          ${(section.quiz || [])
            .map(
              (item, index) => `
                <details class="self-test-item">
                  <summary>${index + 1}. ${item.question}</summary>
                  <div class="disclose-panel"><div class="disclose-panel-inner"><p>${item.answer}</p>${
                    item.feedback ? `<p class="muted-note">${item.feedback}</p>` : ""
                  }</div></div>
                </details>`,
            )
            .join("")}
        </div>
      </section>`;
  }

  function renderNeighborNavigation(chapter, section) {
    const sections = structuredSections(chapter);
    const index = sections.findIndex((item) => item.id === section.id);
    const previous = index > 0 ? { href: `#${chapter.id}/${sections[index - 1].id}`, title: `${sections[index - 1].number} ${sections[index - 1].navTitle}`, label: "上一节" } : { href: "#ch8", title: "第八章 λ-矩阵", label: "上一章" };
    const next = index < sections.length - 1 ? { href: `#${chapter.id}/${sections[index + 1].id}`, title: `${sections[index + 1].number} ${sections[index + 1].navTitle}`, label: "下一节" } : { href: "#ch10", title: "第十章 双线性函数", label: "下一章" };
    return `
      <nav class="lesson-neighbor-nav" aria-label="上下节导航">
        <a class="lesson-neighbor-card is-previous" href="${previous.href}"><span class="lesson-neighbor-label">← ${previous.label}</span><strong>${previous.title}</strong><span>${chapter.title}</span></a>
        <a class="lesson-neighbor-card is-next" href="${next.href}"><span class="lesson-neighbor-label">${next.label} →</span><strong>${next.title}</strong><span>${chapter.title}</span></a>
      </nav>`;
  }

  function renderChapterNineLesson(chapter, section) {
    els.main.innerHTML = `
      <section class="lesson-cover ch9-lesson-cover" id="${section.id}">
        <div class="lesson-cover-copy">
          <div class="breadcrumb">${chapter.title} <span>/</span> ${section.number} ${section.navTitle}</div>
          <h1>${section.title}</h1>
          <p>${section.goal}</p>
          <div class="meta-row">${(section.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
        </div>
      </section>

      <section class="section-band lesson-page-section ch9-question" id="${section.id}-question">
        <div class="section-kicker">核心问题</div>
        <h2>${section.question}</h2>
        <p class="lead">${section.intro}</p>
      </section>

      <section class="section-band lesson-page-section ch9-formal" id="${section.id}-formal">
        <div class="ch9-section-heading">
          <div><span>定义与结构</span><h2>定理概念</h2></div>
          <p>先抓住概念之间的依赖，再把公式落回同一幅几何画面。</p>
        </div>
        ${renderConceptCards(section)}
        ${renderFormalBlocks(section)}
        ${renderTextbookMap(section)}
      </section>

      ${renderLabSection(section)}
      ${renderExample(section)}
      ${renderQuiz(section)}

      <section class="section-band lesson-page-section" id="${section.id}-summary">
        <h2>小结</h2>
        <ul>${(section.summary || []).map((item) => `<li>${item}</li>`).join("")}</ul>
        <button class="button mark-button" type="button" data-complete="${section.id}">标记掌握</button>
      </section>
      ${renderNeighborNavigation(chapter, section)}`;
  }

  function renderChapterNine(chapter) {
    const section = state.section ? findSection(chapter, state.section) : null;
    if (section) renderChapterNineLesson(chapter, section);
    else renderChapterNineOverview(chapter);
  }

  window.renderChapterNine = renderChapterNine;

  renderRoute = function renderChapterNineAwareRoute() {
    cancelTransformAnimation?.();
    window.teardownSection2ContinuousLab?.();
    window.teardownChapter9?.();

    const raw = decodeURIComponent(window.location.hash.replace(/^#/, "")) || "guide";
    const [requestedRoute, requestedSection] = raw.split("/");
    if (requestedRoute === "home") {
      window.location.replace("./index.html");
      return;
    }

    const chapter =
      requestedRoute === "guide"
        ? LEARN_GUIDE_CHAPTER
        : algebraContent.chapters.find((item) => item.id === requestedRoute) || LEARN_GUIDE_CHAPTER;
    const section = requestedSection ? findSection(chapter, requestedSection) : null;

    state.route = chapter.id;
    state.section = section?.id || "";
    state.openChapters.add(state.route);
    document.body.dataset.route = state.route;
    document.body.dataset.view = state.section ? "lesson" : "overview";

    if (chapter.id === "guide") renderGuide();
    else if (chapter.id === "ch4") renderChapter4();
    else if (chapter.id === CHAPTER_ID) renderChapterNine(chapter);
    else renderPlaceholder(chapter);

    if (chapter.id !== "guide") {
      localStorage.setItem("la-visual-last", `#${state.route}${state.section ? `/${state.section}` : ""}`);
    }

    updateDocumentTitle(chapter);
    updateNavActive();
    updateContinueShortcut();
    buildPageToc();
    document.body.classList.remove("sidebar-open");

    window.requestAnimationFrame(() => {
      setupInteractiveBlocks();
      if (chapter.id === CHAPTER_ID && section) window.mountChapter9?.(section.id);
      if (state.section) document.querySelector(`#${CSS.escape(state.section)}`)?.scrollIntoView({ block: "start", behavior: "auto" });
      else window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  };
})();
