/* Extend the learning shell to any chapter that provides object-based sections. */
(() => {
  const legacyRenderChapter4 = window.renderChapter4;
  let mountedChapterId = "";

  function structuredSections(chapter) {
    return (chapter?.sections || []).filter(
      (section) => section && typeof section === "object" && section.id,
    );
  }

  function findSection(chapter, sectionId) {
    if (!sectionId) return null;
    return structuredSections(chapter).find((section) => section.id === sectionId) || null;
  }

  function chapterShortTitle(chapter) {
    return String(chapter?.title || "")
      .replace(/^第[0-9一二三四五六七八九十百]+章/, "")
      .replace(/^[\s·:：\-—]+/, "")
      .trim();
  }

  function courseNodes() {
    return algebraContent.chapters.flatMap((chapter) => {
      const sections = structuredSections(chapter);
      if (!sections.length) {
        return [
          {
            id: chapter.id,
            href: `#${chapter.id}`,
            title: chapter.title,
            context: chapter.subtitle || "章节导览",
            type: "chapter",
          },
        ];
      }

      return sections.map((section) => ({
        id: `${chapter.id}/${section.id}`,
        href: `#${chapter.id}/${section.id}`,
        title: `${section.number} ${section.navTitle || section.title}`,
        context: chapter.title,
        type: "section",
      }));
    });
  }

  function renderNeighborNavigation(chapter, section) {
    const nodes = courseNodes();
    const currentIndex = nodes.findIndex((node) => node.id === `${chapter.id}/${section.id}`);
    if (currentIndex < 0) return "";

    const previous = nodes[currentIndex - 1] || null;
    const next = nodes[currentIndex + 1] || null;

    const renderCard = (node, direction) => {
      if (!node) return `<span class="lesson-neighbor-spacer" aria-hidden="true"></span>`;
      const isPrevious = direction === "previous";
      const label =
        node.type === "chapter"
          ? isPrevious
            ? "上一章"
            : "下一章"
          : isPrevious
            ? "上一节"
            : "下一节";

      return `
        <a class="lesson-neighbor-card ${isPrevious ? "is-previous" : "is-next"}" href="${node.href}">
          <span class="lesson-neighbor-label">${isPrevious ? `← ${label}` : `${label} →`}</span>
          <strong>${node.title}</strong>
          <span>${node.context}</span>
        </a>`;
    };

    return `
      <nav class="lesson-neighbor-nav" aria-label="上下节导航">
        ${renderCard(previous, "previous")}
        ${renderCard(next, "next")}
      </nav>`;
  }

  function renderFallbackLessonCard(chapter, section) {
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

  function renderFallbackOverview(chapter) {
    const sections = structuredSections(chapter);
    const lessonDirectory = window.renderChapterLessonDirectory?.(chapter, sections)
      || `<div class="lesson-card-grid">${sections.map((section) => renderFallbackLessonCard(chapter, section)).join("")}</div>`;
    const cards = chapter.overviewCards?.length
      ? chapter.overviewCards
      : [
          { title: "概念", text: "从核心问题建立对象与结构。" },
          { title: "实验", text: "通过可操作状态观察边界与不变量。" },
          { title: "推理", text: "回到定义、例题和自测形成闭环。" },
        ];

    return `
      <section class="lesson-cover structured-cover" id="${chapter.id}-overview">
        <div class="lesson-cover-copy">
          <span class="eyebrow">${chapter.title}</span>
          <h1>${chapter.overviewTitle || chapterShortTitle(chapter)}</h1>
          <p>${chapter.summary || "本章沿教材顺序组织概念、交互实验、代表例题和自测。"}</p>
          <div class="meta-row"><span class="tag accent">${sections.length} 个小节</span></div>
        </div>
      </section>
      <section class="section-band compact-band" id="${chapter.id}-structure">
        <div class="section-head"><div><div class="section-kicker">本章结构</div><h2>一条主线连接全部小节</h2></div></div>
        <div class="overview-grid">
          ${cards.map((card) => `<div class="info-panel"><strong>${card.title}</strong><p>${card.text}</p></div>`).join("")}
        </div>
      </section>
      <section class="section-band compact-band" id="${chapter.id}-lessons">
        <div class="section-head"><div><div class="section-kicker">本章目录</div><h2>进入具体小节</h2></div></div>
        ${lessonDirectory}
      </section>`;
  }

  function renderFallbackLesson(chapter, section) {
    const interactive = section.interactive ? renderInteractiveSection(section, section.interactive) : "";
    return `
      <section class="lesson-cover structured-lesson-cover" id="${section.id}">
        <div class="lesson-cover-copy">
          <div class="breadcrumb">${chapter.title} <span>/</span> ${section.title}</div>
          <h1>${section.title}</h1>
          <p>${section.goal || ""}</p>
        </div>
      </section>
      <section class="section-band lesson-page-section" id="${section.id}-question">
        <h2>概念问题</h2>
        <p class="lead">${section.question || ""}</p>
        <p>${section.intro || ""}</p>
      </section>
      ${interactive}
      ${renderFormalSection(section, getConcepts(section))}
      ${renderExampleSection(section)}
      ${renderSelfTestSection(section)}
      <section class="section-band lesson-page-section" id="${section.id}-summary">
        <h2>小结</h2>
        ${renderSummary(section)}
        <button class="button mark-button" type="button" data-complete="${section.id}">标记掌握</button>
      </section>
      ${renderNeighborNavigation(chapter, section)}`;
  }

  function renderStructuredOverview(chapter) {
    const renderer = window.getStructuredChapterRenderer?.(chapter.id);
    els.main.innerHTML = renderer?.renderOverview?.(chapter, structuredSections(chapter)) || renderFallbackOverview(chapter);
    renderer?.mountOverview?.(chapter, els.main);
  }

  function renderStructuredLesson(chapter, section) {
    const renderer = window.getStructuredChapterRenderer?.(chapter.id);
    if (!renderer && typeof window.renderLessonPage === "function") {
      window.renderLessonPage(section, chapter);
      return;
    }
    const navigation = renderNeighborNavigation(chapter, section);
    els.main.innerHTML =
      renderer?.renderLesson?.(chapter, section, navigation) || renderFallbackLesson(chapter, section);
    renderer?.mountLesson?.(chapter, section, els.main);
  }

  window.getStructuredSections = structuredSections;
  window.findStructuredSection = findSection;

  learnLastTarget = function learnStructuredLastTarget() {
    const last = localStorage.getItem("la-visual-last");
    if (!last || !last.startsWith("#")) return null;

    const [route, sectionId] = last.slice(1).split("/");
    const chapter = algebraContent.chapters.find((item) => item.id === route);
    if (!chapter) return null;
    if (sectionId && !findSection(chapter, sectionId)) return null;
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
              <div class="section-list-clip"><div class="section-list-inner">${sectionLinks}</div></div>
            </div>
          </div>`;
      })
      .join("");

    bindChapterToggles();
    updateProgressUI();
  };

  updateDocumentTitle = function updateStructuredDocumentTitle(chapter) {
    const section = findSection(chapter, state.section);
    document.title = section
      ? `${section.number} ${section.navTitle || section.title} | 高等代数可视化`
      : `${chapter.title} | 高等代数可视化`;
  };

  renderRoute = function renderStructuredLearningRoute() {
    if (typeof window.cancelTransformAnimation === "function") window.cancelTransformAnimation();
    window.teardownSection2ContinuousLab?.();
    if (mountedChapterId) window.teardownStructuredChapter?.(mountedChapterId);
    mountedChapterId = "";

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
    const section = findSection(chapter, requestedSection);

    state.route = chapter.id;
    state.section = section?.id || "";
    state.openChapters.add(state.route);
    document.body.dataset.route = state.route;
    document.body.dataset.view = state.section ? "lesson" : "overview";

    if (chapter.id === "guide") {
      renderGuide();
    } else if (chapter.id === "ch4") {
      legacyRenderChapter4();
    } else if (structuredSections(chapter).length) {
      mountedChapterId = chapter.id;
      if (section) renderStructuredLesson(chapter, section);
      else renderStructuredOverview(chapter);
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
