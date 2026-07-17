/* Generic structured-chapter routing layered on top of the existing Chapter 4 application. */
(() => {
  const legacyRenderChapter4 = window.renderChapter4;

  function structuredSections(chapter) {
    return (chapter?.sections || []).filter((section) => section && typeof section === "object" && section.id);
  }

  function findStructuredSection(chapter, sectionId) {
    if (!sectionId) return null;
    return structuredSections(chapter).find((section) => section.id === sectionId) || null;
  }

  function chapterShortTitle(chapter) {
    return String(chapter?.title || "")
      .replace(/^第[0-9一二三四五六七八九十百]+章/, "")
      .replace(/^[\s·:：\-—]+/, "")
      .trim();
  }

  function renderStructuredLessonCard(chapter, section) {
    return `
      <a class="lesson-card" href="#${chapter.id}/${section.id}">
        <div class="section-kicker">${section.number} · ${section.textbookSection || section.title}</div>
        <h3>${section.navTitle || section.title}</h3>
        <p>${section.question || section.goal || ""}</p>
        <div class="meta-row">
          ${(section.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>
      </a>`;
  }

  function renderStructuredChapterOverview(chapter) {
    const sections = structuredSections(chapter);
    const interactiveCount = sections.filter((section) => section.interactive).length;
    const exampleCount = sections.filter((section) => section.example).length;
    const overviewCards = chapter.overviewCards?.length
      ? chapter.overviewCards
      : [
          { title: "概念", text: "先从核心问题建立对象与结构。" },
          { title: "交互", text: "用可操作实验观察边界状态与不变量。" },
          { title: "推理", text: "回到定义、定理、例题和自测形成闭环。" },
        ];

    els.main.innerHTML = `
      <section class="lesson-cover structured-cover" id="${chapter.id}-overview">
        <div class="lesson-cover-copy">
          <span class="eyebrow">${chapter.title}</span>
          <h1>${chapter.overviewTitle || chapterShortTitle(chapter)}</h1>
          <p>${chapter.summary || "本章沿教材顺序组织概念、交互实验、代表例题和自测。"}</p>
          <div class="meta-row">
            <span class="tag accent">${sections.length} 个小节</span>
            ${interactiveCount ? `<span class="tag">${interactiveCount} 个主交互</span>` : ""}
            ${exampleCount ? `<span class="tag">${exampleCount} 个代表例题</span>` : ""}
          </div>
        </div>
        ${chapter.id === "ch10" ? window.renderChapter10OverviewVisual?.() || "" : ""}
      </section>

      <section class="section-band compact-band" id="${chapter.id}-structure">
        <div class="section-head">
          <div>
            <div class="section-kicker">本章结构</div>
            <h2>一条主线连接全部小节</h2>
          </div>
        </div>
        <div class="overview-grid">
          ${overviewCards
            .map(
              (card) => `<div class="info-panel"><strong>${card.title}</strong><p>${card.text}</p></div>`,
            )
            .join("")}
        </div>
      </section>

      <section class="section-band compact-band" id="${chapter.id}-lessons">
        <div class="section-head">
          <div>
            <div class="section-kicker">本章目录</div>
            <h2>进入具体小节</h2>
          </div>
        </div>
        <div class="lesson-card-grid">
          ${sections.map((section) => renderStructuredLessonCard(chapter, section)).join("")}
        </div>
      </section>`;
  }

  function renderChapter10Interactive(section) {
    if (!section.interactive) return "";
    const prompts = section.interactive.prompts || [];
    return `
      <section class="section-band lesson-page-section ch10-interactive-section" id="${section.id}-interactive">
        <h2>交互实验</h2>
        <div class="ch10-lab-mount" data-ch10-lab="${section.interactive.type}"></div>
        <div class="script-panel ch10-task-panel">
          <h3>操作任务</h3>
          ${section.interactive.task ? `<p>${section.interactive.task}</p>` : ""}
          ${prompts.length ? `<ol>${prompts.map((item) => `<li>${item}</li>`).join("")}</ol>` : ""}
        </div>
      </section>`;
  }

  function renderChapter10Theory(section) {
    return `
      <section class="section-band lesson-page-section ch10-theory-section" id="${section.id}-formal">
        <h2>定理概念</h2>
        <div class="ch10-theory-mount" data-ch10-theory="${section.id}"></div>
      </section>`;
  }

  function renderChapter10Example(section) {
    if (!section.example) return "";
    return `
      <section class="section-band lesson-page-section" id="${section.id}-example">
        <h2>代表例题</h2>
        <article class="ch10-example-card">
          <div class="ch10-example-heading">
            <span>例题</span>
            <h3>${section.example.title}</h3>
          </div>
          <div class="example-question ch10-example-question">${section.example.question}</div>
          <details class="example-box ch10-example-box">
            <summary>查看分步解析</summary>
            <div class="disclose-panel">
              <div class="disclose-panel-inner">
                <div class="example-answer">
                  <h4>答案与分析</h4>
                  ${renderExampleSteps(section.example)}
                </div>
              </div>
            </div>
          </details>
        </article>
      </section>`;
  }

  function courseNodes() {
    return algebraContent.chapters.flatMap((chapter) => {
      const sections = structuredSections(chapter);
      if (sections.length) {
        return sections.map((section) => ({
          id: `${chapter.id}/${section.id}`,
          href: `#${chapter.id}/${section.id}`,
          title: `${section.number} ${section.navTitle || section.title}`,
          context: chapter.title,
          type: "section",
        }));
      }
      return [
        {
          id: chapter.id,
          href: `#${chapter.id}`,
          title: chapter.title,
          context: chapter.subtitle || "章节导览",
          type: "chapter",
        },
      ];
    });
  }

  function renderStructuredLessonNavigation(chapter, section) {
    const nodes = courseNodes();
    const currentIndex = nodes.findIndex((node) => node.id === `${chapter.id}/${section.id}`);
    if (currentIndex < 0) return "";
    const previous = nodes[currentIndex - 1] || null;
    const next = nodes[currentIndex + 1] || null;

    const card = (node, direction) => {
      if (!node) return `<span class="lesson-neighbor-spacer" aria-hidden="true"></span>`;
      const previousDirection = direction === "previous";
      const label = node.type === "chapter" ? (previousDirection ? "上一章" : "下一章") : previousDirection ? "上一节" : "下一节";
      return `
        <a class="lesson-neighbor-card ${previousDirection ? "is-previous" : "is-next"}" href="${node.href}">
          <span class="lesson-neighbor-label">${previousDirection ? `← ${label}` : `${label} →`}</span>
          <strong>${node.title}</strong>
          <span>${node.context}</span>
        </a>`;
    };

    return `
      <nav class="lesson-neighbor-nav" aria-label="上下节导航">
        ${card(previous, "previous")}
        ${card(next, "next")}
      </nav>`;
  }

  function renderStructuredLessonPage(chapter, section) {
    els.main.innerHTML = `
      <section class="lesson-cover structured-lesson-cover" id="${section.id}">
        <div class="lesson-cover-copy">
          <div class="breadcrumb">${chapter.title} <span>/</span> ${section.title}</div>
          <h1>${section.title}</h1>
          <p>${section.goal}</p>
          <div class="meta-row">${(section.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
        </div>
        ${chapter.id === "ch10" ? window.renderChapter10SectionGlyph?.(section.id) || "" : ""}
      </section>

      <section class="section-band lesson-page-section" id="${section.id}-question">
        <h2>概念问题</h2>
        <p class="lead">${section.question}</p>
        <p>${section.intro}</p>
      </section>

      ${chapter.id === "ch10" ? renderChapter10Interactive(section) : renderInteractiveSection(section, section.interactive)}
      ${chapter.id === "ch10" ? renderChapter10Theory(section) : renderFormalSection(section, getConcepts(section))}
      ${chapter.id === "ch10" ? renderChapter10Example(section) : renderExampleSection(section)}
      ${renderSelfTestSection(section)}

      <section class="section-band lesson-page-section" id="${section.id}-summary">
        <h2>小结</h2>
        ${renderSummary(section)}
        <button class="button mark-button" type="button" data-complete="${section.id}">标记掌握</button>
      </section>

      ${renderStructuredLessonNavigation(chapter, section)}`;

    if (chapter.id === "ch10") window.mountChapter10Lesson?.(section, els.main);
  }

  window.getStructuredSections = structuredSections;
  window.findStructuredSection = findStructuredSection;
  window.renderStructuredChapterOverview = renderStructuredChapterOverview;
  window.renderStructuredLessonPage = renderStructuredLessonPage;

  learnLastTarget = function learnAnyStructuredLastTarget() {
    const last = localStorage.getItem("la-visual-last");
    if (!last || !last.startsWith("#")) return null;
    const [route, sectionId] = last.slice(1).split("/");
    const chapter = algebraContent.chapters.find((item) => item.id === route);
    if (!chapter) return null;
    if (sectionId && !findStructuredSection(chapter, sectionId)) return null;
    return last;
  };

  renderNav = function renderStructuredLearningNav() {
    els.nav.innerHTML = getChapters()
      .map((chapter) => {
        const sections = structuredSections(chapter);
        const chapterHref = `#${chapter.id}`;
        const sectionLinks =
          chapter.id === "guide"
            ? ""
            : sections.length
              ? sections
                  .map(
                    (section) => `
                      <a class="nav-section" href="#${chapter.id}/${section.id}" data-section-link="${section.id}" data-search-text="${normalizeSearchText(
                        getSectionSearchText(section),
                      )}">
                        <span class="status-dot"></span>
                        <span>${section.number} ${section.navTitle || section.title}</span>
                        <span class="section-status">未掌握</span>
                      </a>`,
                  )
                  .join("")
              : (chapter.sections || [])
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
              <div class="section-list-clip">
                <div class="section-list-inner">${sectionLinks}</div>
              </div>
            </div>
          </div>`;
      })
      .join("");

    bindChapterToggles();
    updateProgressUI();
  };

  updateDocumentTitle = function updateStructuredDocumentTitle(chapter) {
    const section = findStructuredSection(chapter, state.section);
    document.title = section
      ? `${section.number} ${section.navTitle || section.title} | 高等代数可视化`
      : `${chapter.title} | 高等代数可视化`;
  };

  renderRoute = function renderStructuredLearningRoute() {
    cancelTransformAnimation?.();
    window.teardownSection2ContinuousLab?.();
    window.teardownChapter10Lesson?.();

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
    const validSection = findStructuredSection(chapter, requestedSection);

    state.route = chapter.id;
    state.section = validSection?.id || "";
    state.openChapters.add(state.route);
    document.body.dataset.route = state.route;
    document.body.dataset.view = state.section ? "lesson" : "overview";

    if (chapter.id === "guide") {
      renderGuide();
    } else if (chapter.id === "ch4") {
      legacyRenderChapter4();
    } else if (structuredSections(chapter).length) {
      if (validSection) renderStructuredLessonPage(chapter, validSection);
      else renderStructuredChapterOverview(chapter);
    } else {
      renderPlaceholder(chapter);
    }

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
      if (state.section) {
        document.querySelector(`#${CSS.escape(state.section)}`)?.scrollIntoView({ block: "start", behavior: "auto" });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    });
  };
})();