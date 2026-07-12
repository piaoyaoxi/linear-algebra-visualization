function texInline(source) {
  return renderTexShell(source, false);
}

function texDisplay(source) {
  return renderTexShell(source, true);
}

function renderTexShell(source, displayMode) {
  const tex = String(source || "");
  const className = displayMode ? "tex tex-display" : "tex tex-inline";
  return '<span class="' + className + '" data-tex="' + escapeAttribute(tex) + '">' + renderTex(tex, displayMode) + '</span>';
}

function renderTex(source, displayMode) {
  if (window.katex?.renderToString) {
    try {
      return window.katex.renderToString(source, {
        displayMode,
        throwOnError: false,
        strict: "ignore",
        trust: false,
      });
    } catch (error) {
      console.warn("KaTeX render failed:", source, error);
    }
  }

  return escapeHtml(source);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/\x60/g, "&#96;");
}

const HOME_CHAPTER = {
  id: "home",
  icon: "0",
  title: "导学",
  subtitle: "如何使用",
  sections: ["定位与形式", "视觉原则", "制作流程"],
};

const algebraContent = {
  chapters: [],
};

function registerAlgebraChapter(chapter) {
  const normalized = {
    ...chapter,
    sections: Array.isArray(chapter.sections) ? chapter.sections : [],
  };
  const index = algebraContent.chapters.findIndex((item) => item.id === normalized.id);
  if (index >= 0) algebraContent.chapters[index] = normalized;
  else algebraContent.chapters.push(normalized);
}

window.registerAlgebraChapter = registerAlgebraChapter;
window.texInline = texInline;
window.texDisplay = texDisplay;

const state = {
  route: "home",
  section: "",
  completed: new Set(JSON.parse(localStorage.getItem("la-visual-progress") || "[]")),
  openChapters: new Set(),
};

const els = {
  nav: document.querySelector("#chapterNav"),
  main: document.querySelector("#mainContent"),
  toc: document.querySelector("#pageToc"),
  sidebarToggle: document.querySelector("#sidebarToggle"),
  themeToggle: document.querySelector("#themeToggle"),
  drawerBackdrop: document.querySelector("#drawerBackdrop"),
};

const SUN_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3.2v1.8" />
    <path d="M12 19v1.8" />
    <path d="M3.2 12h1.8" />
    <path d="M19 12h1.8" />
    <path d="m5.4 5.4 1.3 1.3" />
    <path d="m17.3 17.3 1.3 1.3" />
    <path d="m17.3 6.7 1.3-1.3" />
    <path d="m5.4 18.6 1.3-1.3" />
  </svg>
`;

const MOON_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.2 14.1A7.4 7.4 0 0 1 9.9 3.8 8.2 8.2 0 1 0 20.2 14.1Z" />
  </svg>
`;

if (document.readyState === "complete") {
  init();
} else {
  window.addEventListener("DOMContentLoaded", init, { once: true });
}

function getChapters() {
  return [HOME_CHAPTER, ...algebraContent.chapters];
}

function getChapterById(id) {
  return getChapters().find((chapter) => chapter.id === id) || HOME_CHAPTER;
}

function getChapter4Sections() {
  return getChapterById("ch4").sections.filter((section) => typeof section === "object");
}

function getSectionLabel(section) {
  return typeof section === "string" ? section : section.navTitle || section.title;
}

function getSectionSearchText(section) {
  if (typeof section === "string") return section;
  return `${section.number || ""} ${section.title || ""} ${section.navTitle || ""}`;
}

function getChapterSectionText(chapter) {
  return chapter.sections.map(getSectionSearchText).join(" ");
}

function getConcepts(section) {
  return (section.concepts || []).map((concept) =>
    Array.isArray(concept) ? { label: concept[0], text: concept[1] } : concept,
  );
}

function getVisual(section) {
  return section.visual || { type: section.visualType || "slot" };
}

function getVisualPrompts(section) {
  return getVisual(section).prompts || section.script || [];
}

function getVideo(section) {
  const video = section.video;
  if (!video) return null;
  return video.src || video.embed ? video : null;
}

function getInteractive(section) {
  if (Object.prototype.hasOwnProperty.call(section, "interactive")) {
    return section.interactive || null;
  }
  const visual = section.visual;
  if (!visual) return null;
  return ["transform", "multiply", "rank", "block"].includes(visual.type) ? visual : null;
}

function getSelfTestItems(section) {
  if (section.quiz?.length) return section.quiz;
  return (section.exercises || []).map((question) => ({ question }));
}

function getProgress() {
  const total = getChapter4Sections().length;
  const done = getChapter4Sections().filter((section) => state.completed.has(section.id)).length;
  return { done, total };
}

function init() {
  const savedTheme = localStorage.getItem("la-visual-theme");
  if (savedTheme === "dark") document.body.classList.add("dark");

  const collapsed = localStorage.getItem("la-visual-sidebar") === "collapsed";
  if (collapsed) document.body.classList.add("sidebar-collapsed");

  updateThemeIcon();
  renderNav();
  bindChrome();
  renderRoute();
  window.addEventListener("hashchange", renderRoute);
}

function bindChrome() {
  window.addEventListener("resize", drawTransformCanvas, { passive: true });

  els.sidebarToggle.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 920px)").matches) {
      document.body.classList.toggle("sidebar-open");
      return;
    }
    document.body.classList.toggle("sidebar-collapsed");
    localStorage.setItem(
      "la-visual-sidebar",
      document.body.classList.contains("sidebar-collapsed") ? "collapsed" : "open",
    );
  });

  els.drawerBackdrop.addEventListener("click", () => {
    document.body.classList.remove("sidebar-open");
  });

  els.themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("la-visual-theme", document.body.classList.contains("dark") ? "dark" : "light");
    updateThemeIcon();
    drawTransformCanvas();
  });

  bindSearchModal();
}

function bindSearchModal() {
  const openBtn = document.querySelector("#searchOpen");
  const modal = document.querySelector("#searchModal");
  const input = document.querySelector("#searchModalInput");
  if (!openBtn || !modal) return;

  function openSearch() {
    modal.hidden = false;
    document.body.classList.add("search-modal-open");
    queueMicrotask(() => input?.focus());
  }

  function closeSearch() {
    modal.hidden = true;
    document.body.classList.remove("search-modal-open");
    openBtn.focus();
  }

  openBtn.addEventListener("click", openSearch);
  modal.querySelectorAll("[data-search-close]").forEach((el) => {
    el.addEventListener("click", closeSearch);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      event.preventDefault();
      closeSearch();
    }
  });
}

function updateThemeIcon() {
  els.themeToggle.innerHTML = document.body.classList.contains("dark") ? MOON_ICON : SUN_ICON;
}

function renderNav() {
  els.nav.innerHTML = getChapters()
    .map((chapter) => {
      const chapterHref = chapter.id === "home" ? "#home" : `#${chapter.id}`;
      const sectionLinks =
        chapter.id === "ch4"
          ? getChapter4Sections()
              .map(
                (section) => `
                  <a class="nav-section" href="#ch4/${section.id}" data-section-link="${section.id}" data-search-text="${normalizeSearchText(
                    getSectionSearchText(section),
                  )}">
                    <span class="status-dot"></span>
                    <span>${section.number} ${section.navTitle}</span>
                    <span class="section-status">未掌握</span>
                  </a>
                `,
              )
              .join("")
          : chapter.sections
              .map(
                (section) => `
                  <a class="nav-section" href="${chapterHref}" data-search-text="${normalizeSearchText(getSectionSearchText(section))}">
                    <span class="status-dot"></span>
                    <span>${getSectionLabel(section)}</span>
                  </a>
                `,
              )
              .join("");

      return `
        <div class="chapter-group" data-chapter="${chapter.id}" data-search-text="${normalizeSearchText(
          `${chapter.title} ${getChapterSectionText(chapter)}`,
        )}">
          <button class="nav-chapter" type="button" aria-expanded="false">
            <span class="chapter-icon">${chapter.icon}</span>
            <span class="chapter-label">
              <strong>${chapter.title}</strong>
              <small>${getChapterSubtitle(chapter.id)}</small>
            </span>
            <span class="chapter-arrow">›</span>
          </button>
          <div class="section-list">${sectionLinks}</div>
        </div>
      `;
    })
    .join("");

  bindChapterToggles();
  updateProgressUI();
}

function bindChapterToggles() {
  els.nav.querySelectorAll(".nav-chapter").forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.closest(".chapter-group");
      if (!group) return;
      const chapterId = group.dataset.chapter;
      const isOpen = group.classList.contains("is-open");

      if (isOpen) {
        state.openChapters.delete(chapterId);
        group.classList.remove("is-open");
        button.setAttribute("aria-expanded", "false");
        return;
      }

      state.openChapters.add(chapterId);
      group.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
    });
  });
}

function getChapterSubtitle(id) {
  return getChapterById(id).subtitle || "章节导览";
}

function renderRoute() {
  const raw = decodeURIComponent(window.location.hash.replace(/^#/, "")) || "home";
  const [route, section] = raw.split("/");
  state.route = route || "home";
  state.section = section || "";

  const chapter = getChapterById(state.route);
  state.route = chapter.id;
  state.openChapters.add(state.route);
  document.body.dataset.route = state.route;
  document.body.dataset.view = state.section ? "lesson" : "overview";

  if (chapter.id === "home") {
    renderHome();
  } else if (chapter.id === "ch4") {
    renderChapter4();
  } else {
    renderPlaceholder(chapter);
  }

  updateDocumentTitle(chapter);
  updateNavActive();
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
}

function updateDocumentTitle(chapter) {
  const section = state.section ? getChapter4Sections().find((item) => item.id === state.section) : null;
  document.title = section
    ? `${section.number} ${section.navTitle} | 高等代数可视化`
    : `${chapter.title} | 高等代数可视化`;
}

function renderHome() {
  els.main.innerHTML = `
    <section class="home-hero" id="overview">
      <div class="home-copy">
        <span class="eyebrow">教材路径 · 可视化 · 交互实验</span>
        <h1><span>高等代数</span><span class="gradient-word">可视化</span></h1>
        <div class="latin-title">visual algebra</div>
        <p>沿着北大版教材，把矩阵、线性空间、线性变换、二次型等抽象概念转化为可观察、可操作、可解释的空间结构。</p>
        <div class="hero-actions">
          <a class="button primary" href="#ch4/matrix-language">开始查看第四章</a>
          <a class="button" href="#ch4">查看第四章目录</a>
        </div>
        <div class="feature-cards">
          <div class="feature-card">
            <strong>轻玻璃</strong>
            <p>导航与控制层有质感，正文与公式保持清晰。</p>
          </div>
          <div class="feature-card">
            <strong>可折叠</strong>
            <p>Apple 文档式侧栏，给动画和实验留出空间。</p>
          </div>
          <div class="feature-card">
            <strong>精选例题</strong>
            <p>每节只放代表例题，答案默认折叠。</p>
          </div>
        </div>
      </div>
      <div class="home-stage">${renderHeroVisual()}</div>
    </section>

    <section class="section-band compact-band" id="position">
      <div class="section-head">
        <div>
          <div class="section-kicker">形式定位</div>
          <h2>把抽象概念放进可操作的视觉讲义</h2>
        </div>
      </div>
      <p class="lead">页面按照教材路径组织内容，在正文中嵌入概念短讲、交互实验和代表例题。学生可以沿着章节阅读，也可以直接进入重点小节。</p>
      <div class="overview-grid">
        <div class="info-panel">
          <strong>概念优先</strong>
          <p>例题只保留能解释概念结构的代表题，答案折叠，重点放在思路与图像对应。</p>
        </div>
        <div class="info-panel">
          <strong>清晰阅读</strong>
          <p>页面以清晰阅读为主，玻璃质感只用于导航和少量信息面板，保证可读性。</p>
        </div>
        <div class="info-panel">
          <strong>先做第四章</strong>
          <p>矩阵连接变换、乘法、消元、秩、可逆和分块结构，是高等代数的重要枢纽。</p>
        </div>
      </div>
    </section>

    <section class="section-band compact-band" id="map">
      <div class="section-head">
        <div>
          <div class="section-kicker">课程目录</div>
          <h2>沿着章节建立概念地图</h2>
        </div>
      </div>
      <div class="chapter-grid">
        ${getChapters()
          .filter((chapter) => chapter.id !== "home")
          .map(
            (chapter) => `
              <a class="chapter-card" href="#${chapter.id}">
                <strong>${chapter.title}</strong>
                <p>${chapter.sections.map(getSectionLabel).join(" · ")}</p>
              </a>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderChapter4() {
  const chapter = getChapterById("ch4");
  const chapter4Sections = getChapter4Sections();
  const activeLesson = chapter4Sections.find((section) => section.id === state.section);
  const interactiveCount = chapter4Sections.filter(getInteractive).length;
  const videoCount = chapter4Sections.filter(getVideo).length;
  const exampleCount = chapter4Sections.filter((section) => section.example).length;
  const metaTags = [
    `${chapter4Sections.length} 个小节`,
    interactiveCount ? `${interactiveCount} 个交互实验` : "",
    videoCount ? `${videoCount} 个概念短讲` : "",
    exampleCount ? `${exampleCount} 个代表例题` : "",
  ].filter(Boolean);
  if (activeLesson) {
    renderLessonPage(activeLesson);
    return;
  }

  els.main.innerHTML = `
    <section class="lesson-cover" id="chapter4">
      <div class="lesson-cover-copy">
        <span class="eyebrow">第四章 · 矩阵</span>
        <h1>从数字表格走向线性结构</h1>
        <p>${chapter.summary}</p>
        <div class="meta-row">
          ${metaTags.map((tag, index) => `<span class="tag${index === 0 ? " accent" : ""}">${tag}</span>`).join("")}
        </div>
      </div>
    </section>

    <section class="section-band compact-band" id="chapter4-structure">
      <div class="section-head">
        <div>
          <div class="section-kicker">本章结构</div>
          <h2>一条主线串起七个小节</h2>
        </div>
      </div>
      <div class="overview-grid">
        <div class="info-panel">
          <strong>变换视角</strong>
          <p>先把矩阵看成基向量去向的记录，避免一上来陷入计算规则。</p>
        </div>
        <div class="info-panel">
          <strong>运算视角</strong>
          <p>加法、数乘、乘法都解释成记录之间的组合，矩阵乘法重点做复合动画。</p>
        </div>
        <div class="info-panel">
          <strong>结构视角</strong>
          <p>通过初等矩阵、可逆、秩和分块，把矩阵从工具推进到结构对象。</p>
        </div>
      </div>
    </section>

    <section class="section-band compact-band" id="chapter4-lessons">
      <div class="section-head">
        <div>
          <div class="section-kicker">本章目录</div>
          <h2>进入具体小节</h2>
        </div>
      </div>
      <div class="lesson-card-grid">
        ${chapter4Sections.map(renderLessonCard).join("")}
      </div>
    </section>
  `;
}

function renderLessonPage(section) {
  const concepts = getConcepts(section);
  const video = getVideo(section);
  const interactive = getInteractive(section);
  els.main.innerHTML = `
    <section class="lesson-cover" id="${section.id}">
      <div class="lesson-cover-copy">
        <div class="breadcrumb">第四章 矩阵 <span>/</span> ${section.title}</div>
        <h1>${section.title}</h1>
        <p>${section.goal}</p>
      </div>
    </section>

    <section class="section-band lesson-page-section" id="${section.id}-question">
      <h2>概念问题</h2>
      <p class="lead">${section.question}</p>
      <p>${section.intro}</p>
    </section>

    ${renderVideoSection(section, video)}

    ${renderInteractiveSection(section, interactive)}

    ${renderFormalSection(section, concepts)}

    ${renderExampleSection(section)}

    ${renderSelfTestSection(section)}

    <section class="section-band lesson-page-section" id="${section.id}-summary">
      <h2>小结</h2>
      ${renderSummary(section)}
      <button class="button mark-button" type="button" data-complete="${section.id}">标记掌握</button>
    </section>

    ${renderLessonNavigation(section)}
  `;
}

function getCourseNavigationNodes() {
  return getChapters()
    .filter((chapter) => chapter.id !== "home")
    .flatMap((chapter) => {
      if (chapter.id === "ch4") {
        return getChapter4Sections().map((section) => ({
          id: `${chapter.id}/${section.id}`,
          href: `#${chapter.id}/${section.id}`,
          title: `${section.number} ${section.navTitle}`,
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

function renderLessonNavigation(section) {
  const nodes = getCourseNavigationNodes();
  const currentIndex = nodes.findIndex((node) => node.id === `ch4/${section.id}`);
  if (currentIndex < 0) return "";

  const previous = nodes[currentIndex - 1] || null;
  const next = nodes[currentIndex + 1] || null;
  if (!previous && !next) return "";

  const renderCard = (node, direction) => {
    if (!node) return `<span class="lesson-neighbor-spacer" aria-hidden="true"></span>`;
    const isPrevious = direction === "previous";
    const label = node.type === "chapter" ? (isPrevious ? "上一章" : "下一章") : isPrevious ? "上一节" : "下一节";
    const arrow = isPrevious ? "←" : "→";

    return `
      <a class="lesson-neighbor-card ${isPrevious ? "is-previous" : "is-next"}" href="${node.href}">
        <span class="lesson-neighbor-label">${isPrevious ? `${arrow} ${label}` : `${label} ${arrow}`}</span>
        <strong>${node.title}</strong>
        <span>${node.context}</span>
      </a>
    `;
  };

  return `
    <nav class="lesson-neighbor-nav" aria-label="上下节导航">
      ${renderCard(previous, "previous")}
      ${renderCard(next, "next")}
    </nav>
  `;
}

function renderVideoSection(section, video) {
  if (!video) return "";
  const media = video.embed
    ? `<iframe src="${escapeAttribute(video.embed)}" title="${escapeAttribute(video.title || "概念短讲")}" allowfullscreen loading="lazy"></iframe>`
    : `<video controls preload="metadata"${video.poster ? ` poster="${escapeAttribute(video.poster)}"` : ""}>
        <source src="${escapeAttribute(video.src)}" type="${escapeAttribute(video.type || "video/mp4")}" />
      </video>`;

  const transcript = video.transcript
    ? `<details class="transcript-box"><summary>文字稿</summary><p>${video.transcript}</p></details>`
    : "";

  return `
    <section class="section-band lesson-page-section" id="${section.id}-video">
      <h2>概念短讲</h2>
      <div class="video-panel">
        <div class="video-frame">${media}</div>
        <div class="video-meta">
          <strong>${video.title || section.title}</strong>
          ${video.duration ? `<span>${video.duration}</span>` : ""}
        </div>
        ${transcript}
      </div>
    </section>
  `;
}

function renderInteractiveSection(section, interactive) {
  if (!interactive) return "";
  const prompts = interactive.prompts || getVisualPrompts(section);
  const task = interactive.task || section.task || "";
  const promptBlock =
    task || prompts.length
      ? `<div class="script-panel">
          <h3>操作任务</h3>
          ${task ? `<p>${task}</p>` : ""}
          ${prompts.length ? `<ol>${prompts.map((item) => `<li>${item}</li>`).join("")}</ol>` : ""}
        </div>`
      : "";

  return `
    <section class="section-band lesson-page-section" id="${section.id}-interactive">
      <h2>交互实验</h2>
      ${renderVisualPanel(interactive)}
      ${promptBlock}
    </section>
  `;
}

function renderFormalSection(section, concepts) {
  return `
    <section class="section-band lesson-page-section" id="${section.id}-formal">
      <h2>定理概念</h2>
      ${concepts.length ? `<p>${concepts.map((concept) => `<span class="term-chip">${concept.label}</span> ${concept.text}`).join(" ")}</p>` : ""}
      ${concepts.length ? renderConceptStrip(concepts) : ""}
      <div class="script-panel textbook-panel">
        <h3>${section.textbookSection} · ${section.textbook?.reference || "北大版《高等代数》第四章"}</h3>
        ${section.textbook?.page ? `<p>页码：${section.textbook.page}</p>` : ""}
        <ul>${(section.textbook?.items || []).map((item) => `<li>${item}</li>`).join("")}</ul>
      </div>
    </section>
  `;
}

function renderExampleSection(section) {
  if (!section.example) return "";
  return `
    <section class="section-band lesson-page-section" id="${section.id}-example">
      <h2>代表例题</h2>
      <details class="example-box">
        <summary>${section.example.title}</summary>
        <div class="example-question">${section.example.question}</div>
        <div class="example-answer">
          <h4>答案与分析</h4>
          ${renderExampleSteps(section.example)}
        </div>
      </details>
    </section>
  `;
}

function renderSelfTestSection(section) {
  const items = getSelfTestItems(section);
  if (!items.length) return "";
  return `
    <section class="section-band lesson-page-section" id="${section.id}-quiz">
      <h2>自测</h2>
      <div class="self-test-list">
        ${items
          .map((item, index) =>
            item.answer || item.feedback
              ? `<details class="self-test-item">
                  <summary>${index + 1}. ${item.question}</summary>
                  ${item.answer ? `<p>${item.answer}</p>` : ""}
                  ${item.feedback ? `<p class="muted-note">${item.feedback}</p>` : ""}
                </details>`
              : `<div class="self-test-item"><strong>${index + 1}.</strong><span>${item.question}</span></div>`,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderConceptStrip(concepts) {
  return `
    <div class="concept-strip">
      ${concepts
        .map(
          (concept) => `
            <div class="concept-item">
              <span>${concept.label}</span>
              <p>${concept.text}</p>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderExampleSteps(example) {
  if (example.steps?.length) {
    return `<ol>${example.steps.map((step) => `<li>${step}</li>`).join("")}</ol>`;
  }

  return `<p>${example.answer || ""}</p>`;
}

function renderSummary(section) {
  const summary = section.summary?.length
    ? `<ul>${section.summary.map((item) => `<li>${item}</li>`).join("")}</ul>`
    : `<p class="lead">这一节的核心是把公式、图像和线性结构连成同一个对象。</p>`;
  return summary;
}

function renderLessonCard(section) {
  return `
    <a class="lesson-card" href="#ch4/${section.id}">
      <div class="section-kicker">${section.number} · ${section.textbookSection}</div>
      <h3>${section.navTitle}</h3>
      <p>${section.question}</p>
      <div class="meta-row">
        ${(section.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join("")}
      </div>
    </a>
  `;
}

function renderVisualPanel(item) {
  const visual = item?.type ? item : getVisual(item);

  if (visual.type === "transform") {
    return `
      <div class="visual-panel">
        <div class="visual-title">
          <div>
            <h3>${visual.title || "交互图：矩阵怎样改变网格"}</h3>
            <p>${visual.description || "拖动矩阵元素，观察基向量和整张网格同步变化。"}</p>
          </div>
        </div>
        <div class="canvas-wrap">
          <canvas id="transformCanvas" width="720" height="360" aria-label="矩阵变换网格"></canvas>
          <div class="control-stack">
            ${["a", "b", "c", "d"]
              .map(
                (key, index) => `
                  <div class="control-row">
                    <label for="matrix-${key}">
                      <span>${key}</span>
                      <span id="matrix-${key}-value">${[1, 0.45, 0.2, 1][index]}</span>
                    </label>
                    <input id="matrix-${key}" data-matrix="${key}" type="range" min="-2" max="2" step="0.05" value="${[
                      1, 0.45, 0.2, 1,
                    ][index]}" />
                  </div>
                `,
              )
              .join("")}
            <div class="matrix-readout" id="matrixReadout"></div>
          </div>
        </div>
      </div>
    `;
  }

  if (visual.type === "multiply") {
    return `
      <div class="visual-panel">
        <div class="visual-title">
          <div>
            <h3>${visual.title || "交互图：AB 是先 B 后 A"}</h3>
            <p>${visual.description || "切换视角，比较复合、列向量与行列公式。"}</p>
          </div>
        </div>
        <div class="multiply-demo">
          <div class="segmented" data-multiply-tabs>
            <button type="button" class="is-active" data-step="compose">复合</button>
            <button type="button" data-step="columns">看列</button>
            <button type="button" data-step="formula">行列公式</button>
          </div>
          <div class="matrix-chain" id="multiplyChain"></div>
          <div class="note-panel" id="multiplyText"></div>
        </div>
      </div>
    `;
  }

  if (visual.type === "rank") {
    return `
      <div class="visual-panel">
        <div class="visual-title">
          <div>
            <h3>${visual.title || "交互图：秩是保留下来的维度"}</h3>
            <p>${visual.description || "比较列向量张成平面和坍缩成直线时的差别。"}</p>
          </div>
        </div>
        <div class="rank-demo">
          <div class="segmented" data-rank-tabs>
            <button type="button" class="is-active" data-rank="2">${texInline("\\operatorname{rank}=2")}</button>
            <button type="button" data-rank="1">${texInline("\\operatorname{rank}=1")}</button>
          </div>
          <div class="rank-visual">
            <div class="vector-plane" id="rankPlane">
              <span class="vector v1"></span>
              <span class="vector v2"></span>
              <span class="vector v3"></span>
            </div>
            <div class="rank-info">
              <div class="rank-number" id="rankNumber">2</div>
              <p id="rankText">两列向量提供两个独立方向，输出可以铺开一个平面区域。</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (visual.type === "block") {
    return `
      <div class="visual-panel">
        <div class="visual-title">
          <div>
            <h3>${visual.title || "图示：把大矩阵看成小系统"}</h3>
            <p>${visual.description || "分块让输入、输出和子结构更清楚。"}</p>
          </div>
        </div>
        <div class="block-demo">
          <div class="block-grid" aria-label="分块矩阵示意">
            <span>A11</span>
            <span>A12</span>
            <span>A21</span>
            <span>A22</span>
          </div>
          <div class="note-panel">
            <strong>块乘法的本质</strong>
            <p>把每个块当作一个“较大的元素”，但前提是块的尺寸必须匹配。它适合解释子空间分解、块对角和进一步的标准形。</p>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="visual-panel">
      <div class="visual-title">
        <div>
          <h3>${visual.title || visual.label || "概念图示"}</h3>
          <p>${visual.description || "用图示承接核心概念。"}</p>
        </div>
      </div>
      <div class="video-slot">
        <div class="slot-label">${visual.label || "概念演示"}</div>
        <div class="slot-text">${visual.text || ""}</div>
      </div>
    </div>
  `;
}

function renderPlaceholder(chapter) {
  els.main.innerHTML = `
    <section class="hero" id="${chapter.id}">
      <div class="hero-copy">
        <span class="eyebrow">章节导览</span>
        <h1>${chapter.title}</h1>
        <p>这一章围绕下列主题展开，适合配合教材相应章节阅读。</p>
        <div class="hero-actions">
          <a class="button primary" href="#ch4/matrix-language">查看第四章矩阵</a>
          <a class="button ghost" href="#home">返回总览</a>
        </div>
      </div>
      <div class="hero-visual">${renderHeroVisual()}</div>
    </section>
    <section class="section-band" id="planned-sections">
      <div class="section-head">
        <div>
          <div class="section-kicker">本章主题</div>
          <h2>${chapter.title}的可视化入口</h2>
        </div>
      </div>
      <p class="lead">这些主题围绕概念理解和可视化表达组织，帮助学生抓住章节主线。</p>
      <ul class="placeholder-list">
        ${chapter.sections.map((item) => `<li>${getSectionLabel(item)}</li>`).join("")}
      </ul>
    </section>
  `;
}

function renderHeroVisual() {
  return `
    <div class="matrix-stage" aria-hidden="true">
      <svg viewBox="0 0 520 320" role="img">
        <defs>
          <linearGradient id="lineGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#43c6ba" />
            <stop offset="0.54" stop-color="#6b8df2" />
            <stop offset="1" stop-color="#d46b4f" />
          </linearGradient>
        </defs>
        <g opacity="0.26" stroke="#ffffff" stroke-width="1">
          ${Array.from({ length: 9 }, (_, i) => `<path d="M${50 + i * 52} 32 L${18 + i * 30} 288" />`).join("")}
          ${Array.from({ length: 6 }, (_, i) => `<path d="M36 ${50 + i * 42} L488 ${30 + i * 34}" />`).join("")}
        </g>
        <path d="M88 236 C160 118 246 266 336 118 S452 88 482 178" fill="none" stroke="url(#lineGradient)" stroke-width="5" stroke-linecap="round" />
        <path d="M118 214 L260 156 L420 96" fill="none" stroke="#43c6ba" stroke-width="4" stroke-linecap="round" />
        <path d="M118 214 L220 250 L420 96" fill="none" stroke="#d46b4f" stroke-width="4" stroke-linecap="round" opacity="0.82" />
        <g fill="#f5fbfc">
          <circle cx="118" cy="214" r="6" />
          <circle cx="260" cy="156" r="6" />
          <circle cx="420" cy="96" r="6" />
          <circle cx="220" cy="250" r="5" />
        </g>
        <g font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="22" fill="#f5fbfc" opacity="0.92">
          <text x="82" y="82">A · v</text>
          <text x="336" y="250">rank A</text>
        </g>
      </svg>
      <div class="formula-chip">${texInline("A=\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}")} · 先看列向量，再看整个空间</div>
    </div>
  `;
}

function setupInteractiveBlocks() {
  updateProgressUI();
  bindCompleteButtons();
  setupMultiplyDemo();
  setupRankDemo();
  setupMatrixControls();
  setupTocObserver();
}

function bindCompleteButtons() {
  document.querySelectorAll("[data-complete]").forEach((button) => {
    const id = button.dataset.complete;
    button.classList.toggle("is-done", state.completed.has(id));
    button.textContent = state.completed.has(id) ? "已掌握" : "标记掌握";
    button.onclick = () => {
      if (state.completed.has(id)) state.completed.delete(id);
      else state.completed.add(id);
      localStorage.setItem("la-visual-progress", JSON.stringify([...state.completed]));
      updateProgressUI();
      bindCompleteButtons();
    };
  });
}

const TRANSFORM_KEYS = ["a", "b", "c", "d"];
const TRANSFORM_INPUT_STEP = "0.05";
let transformAnimRaf = 0;
let transformAnimResolve = null;
let transformCanvasMetrics = { w: 0, h: 0, dpr: 0 };
/** Live matrix while animating (avoids range `step` quantizing mid-lerp). */
let transformLiveMatrix = null;

function prefersReducedMotion() {
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
}

function formatMatrixEntry(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return n.toFixed(2).replace(/\.00$/, "");
}

function normalizeTransformMatrix(target) {
  if (Array.isArray(target)) {
    return {
      a: Number(target[0]) || 0,
      b: Number(target[1]) || 0,
      c: Number(target[2]) || 0,
      d: Number(target[3]) || 0,
    };
  }
  return {
    a: Number(target?.a) || 0,
    b: Number(target?.b) || 0,
    c: Number(target?.c) || 0,
    d: Number(target?.d) || 0,
  };
}

function readTransformMatrix() {
  if (transformLiveMatrix) return { ...transformLiveMatrix };
  return {
    a: Number(document.querySelector("#matrix-a")?.value || 0),
    b: Number(document.querySelector("#matrix-b")?.value || 0),
    c: Number(document.querySelector("#matrix-c")?.value || 0),
    d: Number(document.querySelector("#matrix-d")?.value || 0),
  };
}

function clampTransformEntry(input, value) {
  let next = value;
  const min = Number(input?.min);
  const max = Number(input?.max);
  if (Number.isFinite(min)) next = Math.max(min, next);
  if (Number.isFinite(max)) next = Math.min(max, next);
  return next;
}

function writeTransformMatrix(matrix, { syncInputs = true } = {}) {
  const next = normalizeTransformMatrix(matrix);
  TRANSFORM_KEYS.forEach((key) => {
    const input = document.querySelector(`#matrix-${key}`);
    const value = clampTransformEntry(input, next[key]);
    next[key] = value;
    if (syncInputs && input) input.value = String(value);
    const label = document.querySelector(`#matrix-${key}-value`);
    if (label) label.textContent = formatMatrixEntry(value);
  });
  return next;
}

function matricesNearlyEqual(a, b, eps = 1e-5) {
  return TRANSFORM_KEYS.every((key) => Math.abs(a[key] - b[key]) <= eps);
}

function lerpTransformMatrix(from, to, t) {
  return {
    a: from.a + (to.a - from.a) * t,
    b: from.b + (to.b - from.b) * t,
    c: from.c + (to.c - from.c) * t,
    d: from.d + (to.d - from.d) * t,
  };
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function setTransformInputStep(step) {
  document.querySelectorAll("[data-matrix]").forEach((input) => {
    input.step = step;
  });
}

function settleTransformAnimation(matrix) {
  const resolve = transformAnimResolve;
  transformAnimResolve = null;
  if (resolve) resolve(matrix);
}

function cancelTransformAnimation() {
  if (transformAnimRaf) {
    cancelAnimationFrame(transformAnimRaf);
    transformAnimRaf = 0;
  }
  const current = transformLiveMatrix ? { ...transformLiveMatrix } : readTransformMatrix();
  transformLiveMatrix = null;
  setTransformInputStep(TRANSFORM_INPUT_STEP);
  settleTransformAnimation(current);
}

function setTransformMatrix(target) {
  cancelTransformAnimation();
  const matrix = writeTransformMatrix(target, { syncInputs: true });
  drawTransformCanvas(matrix, { fullReadout: true });
  return matrix;
}

function animateTransformMatrix(target, options = {}) {
  const to = normalizeTransformMatrix(target);
  const duration = Number.isFinite(options.duration) ? options.duration : 580;
  const onUpdate = typeof options.onUpdate === "function" ? options.onUpdate : null;

  cancelTransformAnimation();

  if (!document.querySelector("#transformCanvas") || !document.querySelector("#matrix-a")) {
    return Promise.resolve(to);
  }

  const from = readTransformMatrix();
  if (prefersReducedMotion() || duration <= 0 || matricesNearlyEqual(from, to)) {
    const matrix = writeTransformMatrix(to, { syncInputs: true });
    drawTransformCanvas(matrix, { fullReadout: true });
    onUpdate?.(matrix);
    return Promise.resolve(matrix);
  }

  // Allow continuous thumb motion; range step would otherwise quantize the lerp.
  setTransformInputStep("any");
  const start = performance.now();

  return new Promise((resolve) => {
    transformAnimResolve = resolve;
    const step = (now) => {
      if (transformAnimResolve !== resolve) return;
      const t = Math.min(1, (now - start) / duration);
      const matrix = writeTransformMatrix(lerpTransformMatrix(from, to, easeOutCubic(t)), {
        syncInputs: true,
      });
      transformLiveMatrix = matrix;
      drawTransformCanvas(matrix, { fullReadout: false });
      onUpdate?.(matrix);
      if (t < 1) {
        transformAnimRaf = requestAnimationFrame(step);
        return;
      }
      transformAnimRaf = 0;
      transformLiveMatrix = null;
      setTransformInputStep(TRANSFORM_INPUT_STEP);
      const finalMatrix = writeTransformMatrix(to, { syncInputs: true });
      drawTransformCanvas(finalMatrix, { fullReadout: true });
      onUpdate?.(finalMatrix);
      settleTransformAnimation(finalMatrix);
    };
    transformAnimRaf = requestAnimationFrame(step);
  });
}

function setupMatrixControls() {
  if (!document.querySelector("#transformCanvas")) return;
  document.querySelectorAll("[data-matrix]").forEach((input) => {
    input.addEventListener("input", (event) => {
      if (event.isTrusted) cancelTransformAnimation();
      if (event.isTrusted || !transformAnimRaf) drawTransformCanvas();
    });
  });
  drawTransformCanvas();
}

function updateTransformReadout(matrix) {
  const readout = document.querySelector("#matrixReadout");
  if (!readout) return;
  const det = matrix.a * matrix.d - matrix.b * matrix.c;
  readout.innerHTML = `
    ${texDisplay(`A=\\begin{bmatrix}${formatNumber(matrix.a)}&${formatNumber(matrix.b)}\\\\${formatNumber(matrix.c)}&${formatNumber(matrix.d)}\\end{bmatrix}`)}
    ${texInline(`\\det(A)=${formatNumber(det)}`)}
  `;
}

function drawTransformCanvas(matrixOverride, options = {}) {
  const canvas = document.querySelector("#transformCanvas");
  if (!canvas) return;
  if (!matrixOverride && !document.querySelector("#matrix-a")) return;

  const matrix = matrixOverride ? normalizeTransformMatrix(matrixOverride) : readTransformMatrix();
  const fullReadout = options.fullReadout !== false;

  TRANSFORM_KEYS.forEach((key) => {
    const label = document.querySelector(`#matrix-${key}-value`);
    if (label) label.textContent = formatMatrixEntry(matrix[key]);
  });

  if (fullReadout) updateTransformReadout(matrix);

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const cssW = Math.max(1, rect.width);
  const cssH = Math.max(1, rect.height);

  if (
    transformCanvasMetrics.w !== cssW ||
    transformCanvasMetrics.h !== cssH ||
    transformCanvasMetrics.dpr !== dpr
  ) {
    canvas.width = Math.max(1, Math.floor(cssW * dpr));
    canvas.height = Math.max(1, Math.floor(cssH * dpr));
    transformCanvasMetrics = { w: cssW, h: cssH, dpr };
  }

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  const styles = getComputedStyle(document.body);
  const muted = styles.getPropertyValue("--muted").trim() || "#5f6965";
  const lineStrong = styles.getPropertyValue("--line-strong").trim() || "rgba(21, 52, 45, 0.22)";
  const accent = styles.getPropertyValue("--accent").trim() || "#078b7e";
  const accentStrong = styles.getPropertyValue("--accent-strong").trim() || "#006f65";
  const coral = styles.getPropertyValue("--coral").trim() || "#d69a48";
  const text = styles.getPropertyValue("--text").trim() || "#071512";

  const origin = { x: cssW / 2, y: cssH / 2 };
  const scale = Math.min(cssW, cssH) / 8.8;
  const extent = 5;

  function point(x, y, transformed = false) {
    const px = transformed ? matrix.a * x + matrix.b * y : x;
    const py = transformed ? matrix.c * x + matrix.d * y : y;
    return { x: origin.x + px * scale, y: origin.y - py * scale };
  }

  function drawLine(from, to, color, width = 1, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.restore();
  }

  // Layer 1 — quiet reference grid (axis-aligned, mathematical only).
  for (let i = -extent; i <= extent; i += 1) {
    const isAxis = i === 0;
    drawLine(point(-extent, i), point(extent, i), lineStrong, isAxis ? 1.2 : 1, isAxis ? 0.3 : 0.11);
    drawLine(point(i, -extent), point(i, extent), lineStrong, isAxis ? 1.2 : 1, isAxis ? 0.3 : 0.11);
  }

  // Layer 2 — image of the unit square (visual subject of the linear map).
  const p00 = point(0, 0, true);
  const p10 = point(1, 0, true);
  const p11 = point(1, 1, true);
  const p01 = point(0, 1, true);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(p00.x, p00.y);
  ctx.lineTo(p10.x, p10.y);
  ctx.lineTo(p11.x, p11.y);
  ctx.lineTo(p01.x, p01.y);
  ctx.closePath();
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.11;
  ctx.fill();
  ctx.globalAlpha = 0.42;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // Layer 3 — transformed grid in one accent family (no dual-color clash).
  for (let i = -extent; i <= extent; i += 1) {
    if (i === 0) continue;
    drawLine(point(-extent, i, true), point(extent, i, true), accent, 1.05, 0.26);
    drawLine(point(i, -extent, true), point(i, extent, true), accent, 1.05, 0.26);
  }
  drawLine(point(-extent, 0, true), point(extent, 0, true), accentStrong, 1.3, 0.38);
  drawLine(point(0, -extent, true), point(0, extent, true), accentStrong, 1.3, 0.38);

  // Layer 4 — basis before / after.
  drawArrow(ctx, origin, point(1, 0), muted, "e1", 0.32, 2.25);
  drawArrow(ctx, origin, point(0, 1), muted, "e2", 0.32, 2.25);
  drawArrow(ctx, origin, point(1, 0, true), accentStrong, "Ae1", 1, 3.1);
  drawArrow(ctx, origin, point(0, 1, true), coral, "Ae2", 1, 3.1);

  ctx.save();
  ctx.fillStyle = text;
  ctx.globalAlpha = 0.72;
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawArrow(ctx, from, to, color, label, alpha = 1, width = 3) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len < 3.5) return;

  const angle = Math.atan2(dy, dx);
  const head = Math.min(10, Math.max(6, len * 0.18));

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - head * Math.cos(angle - Math.PI / 6), to.y - head * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(to.x - head * Math.cos(angle + Math.PI / 6), to.y - head * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  ctx.font = "700 12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillText(label, to.x + 8, to.y - 8);
  ctx.restore();
}

window.setTransformMatrix = setTransformMatrix;
window.animateTransformMatrix = animateTransformMatrix;

function setupMultiplyDemo() {
  const tabs = document.querySelector("[data-multiply-tabs]");
  const chain = document.querySelector("#multiplyChain");
  const text = document.querySelector("#multiplyText");
  if (!tabs || !chain || !text) return;

  const views = {
    compose: {
      chain: [texInline("x"), texInline("B"), texInline("Bx"), texInline("A"), texInline("A(Bx)")],
      text: `<strong>复合视角</strong><p>${texInline("ABx")} 表示 ${texInline("x")} 先经过 ${texInline("B")}，再把结果交给 ${texInline("A")}。顺序写在右侧先发生。</p>`,
    },
    columns: {
      chain: [`${texInline("B")} 的第 ${texInline("j")} 列`, texInline("A"), texInline("Ab_j"), "=", `${texInline("AB")} 的第 ${texInline("j")} 列`],
      text: `<strong>列视角</strong><p>${texInline("AB")} 的每一列，都是 ${texInline("A")} 作用到 ${texInline("B")} 的对应列。这个视角比直接背行列公式更贴近线性映射。</p>`,
    },
    formula: {
      chain: [`第 ${texInline("i")} 行`, "·", `第 ${texInline("j")} 列`, "=", texInline("(AB)_{ij}")],
      text: `<strong>公式视角</strong><p>行乘列是在计算输出第 ${texInline("i")} 个坐标对输入第 ${texInline("j")} 个基向量的响应。公式是复合过程的坐标化结果。</p>`,
    },
  };

  function render(step) {
    tabs.querySelectorAll("button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.step === step);
    });
    chain.innerHTML = views[step].chain
      .map((item, index) =>
        index % 2 === 1
          ? `<span class="chain-symbol">${item}</span>`
          : `<span class="matrix-card">${item}</span>`,
      )
      .join("");
    text.innerHTML = views[step].text;
  }

  tabs.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-step]");
    if (button) render(button.dataset.step);
  });

  render("compose");
}

function setupRankDemo() {
  const tabs = document.querySelector("[data-rank-tabs]");
  const plane = document.querySelector("#rankPlane");
  const number = document.querySelector("#rankNumber");
  const text = document.querySelector("#rankText");
  if (!tabs || !plane || !number || !text) return;

  function render(rank) {
    tabs.querySelectorAll("button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.rank === rank);
    });
    plane.classList.toggle("rank-1", rank === "1");
    number.textContent = rank;
    text.textContent =
      rank === "1"
        ? "所有列向量落在同一条直线上，输出只保留一个独立方向。"
        : "两列向量提供两个独立方向，输出可以铺开一个平面区域。";
  }

  tabs.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-rank]");
    if (button) render(button.dataset.rank);
  });
}

function buildPageToc() {
  const headings = [...els.main.querySelectorAll(".section-band[id], .lesson-section[id]")];
  if (!headings.length) {
    els.toc.innerHTML = "";
    return;
  }

  els.toc.innerHTML = `
    <div class="page-toc-title">本页目录</div>
    ${headings
      .map((section) => {
        const title = section.querySelector("h2")?.textContent || section.id;
        return `<a href="#${section.id}" data-toc-link="${section.id}" data-scroll-to="${section.id}">${title}</a>`;
      })
      .join("")}
  `;
}

let tocObserver;
let tocScrollBound = false;

function getPageSections() {
  return [...document.querySelectorAll(".section-band[id], .lesson-section[id]")];
}

function setActiveTocLink(sectionId) {
  if (!sectionId) return;
  document.querySelectorAll("[data-toc-link]").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.tocLink === sectionId);
  });
}

function isPageScrolledToBottom(slack = 12) {
  const root = document.documentElement;
  const bottom = window.scrollY + window.innerHeight;
  return bottom >= root.scrollHeight - slack;
}

function syncTocActiveFromScroll() {
  const sections = getPageSections();
  if (!sections.length) return;

  // Short final sections never reach the intersection band; pin the last
  // heading once the viewport hits the document bottom.
  if (isPageScrolledToBottom()) {
    setActiveTocLink(sections[sections.length - 1].id);
    return true;
  }
  return false;
}

function setupTocObserver() {
  if (tocObserver) tocObserver.disconnect();
  const sections = getPageSections();
  if (!sections.length) return;

  document.querySelectorAll("[data-scroll-to]").forEach((link) => {
    link.onclick = (event) => {
      event.preventDefault();
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      document.querySelector(`#${CSS.escape(link.dataset.scrollTo)}`)?.scrollIntoView({ block: "start", behavior });
    };
  });

  tocObserver = new IntersectionObserver(
    (entries) => {
      if (syncTocActiveFromScroll()) return;
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      setActiveTocLink(visible.target.id);
    },
    { rootMargin: "-90px 0px -60% 0px", threshold: [0.1, 0.2, 0.4] },
  );

  sections.forEach((section) => tocObserver.observe(section));
  syncTocActiveFromScroll();

  if (!tocScrollBound) {
    tocScrollBound = true;
    window.addEventListener(
      "scroll",
      () => {
        syncTocActiveFromScroll();
      },
      { passive: true },
    );
    window.addEventListener(
      "resize",
      () => {
        syncTocActiveFromScroll();
      },
      { passive: true },
    );
  }
}

function updateNavActive() {
  document.querySelectorAll(".chapter-group").forEach((group) => {
    const isActive = group.dataset.chapter === state.route;
    const isOpen = state.openChapters.has(group.dataset.chapter);
    group.classList.toggle("is-active", isActive);
    group.classList.toggle("is-open", isOpen);
    const button = group.querySelector(".nav-chapter");
    button?.classList.toggle("is-active", isActive);
    button?.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  document.querySelectorAll("[data-section-link]").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.sectionLink === state.section);
  });
}

function updateProgressUI() {
  document.querySelectorAll("[data-section-link]").forEach((link) => {
    const isDone = state.completed.has(link.dataset.sectionLink);
    link.classList.toggle("is-done", isDone);
    const status = link.querySelector(".section-status");
    if (status) status.textContent = isDone ? "已掌握" : "未掌握";
  });
}

function filterNav(value) {
  const query = normalizeSearchText(value);

  if (!query) {
    document.querySelectorAll(".chapter-group, .nav-section").forEach((item) => {
      item.classList.remove("is-hidden-by-search");
    });
    updateNavActive();
    return;
  }

  document.querySelectorAll(".chapter-group").forEach((group) => {
    const chapterMatches = group.dataset.searchText.includes(query);
    let sectionMatches = false;

    group.querySelectorAll(".nav-section").forEach((link) => {
      const match = link.dataset.searchText.includes(query);
      link.classList.toggle("is-hidden-by-search", !match);
      sectionMatches = sectionMatches || match;
    });

    group.classList.toggle("is-hidden-by-search", !chapterMatches && !sectionMatches);
    if (chapterMatches || sectionMatches) group.classList.add("is-open");
  });
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "");
}

function formatNumber(value) {
  const rounded = Math.round(value * 100) / 100;
  return String(rounded).replace(/^-0$/, "0");
}
