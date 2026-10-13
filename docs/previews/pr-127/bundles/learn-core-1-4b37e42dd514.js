
;/* app.js */
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
  // Content scripts load in any order; keep textbook chapter order.
  algebraContent.chapters.sort((a, b) => chapterOrder(a) - chapterOrder(b));
}

function chapterOrder(chapter) {
  const match = /^ch(\d+)$/.exec(chapter.id || "");
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

window.registerAlgebraChapter = registerAlgebraChapter;
window.texInline = texInline;
window.texDisplay = texDisplay;

// Storage can be blocked (private browsing, sandboxed embeds) or contain stale data.
// Keep the learning UI usable even when a preference cannot be read or saved.
function readPreference(key) {
  try { return window.localStorage.getItem(key); } catch { return null; }
}

function writePreference(key, value) {
  try { window.localStorage.setItem(key, value); } catch { /* Session-only state still works. */ }
}

function readCompletedSections() {
  try {
    const value = JSON.parse(readPreference("la-visual-progress") || "[]");
    return new Set(Array.isArray(value) ? value.filter((id) => typeof id === "string" && id.length > 0) : []);
  } catch {
    return new Set();
  }
}

const state = {
  route: "home",
  section: "",
  completed: readCompletedSections(),
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

function getStructuredSections(chapter) {
  if (!chapter) return [];
  return (chapter.sections || []).filter((section) => typeof section === "object" && section.id);
}

function getChapter4Sections() {
  return getStructuredSections(getChapterById("ch4"));
}

function chapterHasStructuredLessons(chapter) {
  return getStructuredSections(chapter).length > 0;
}

function findStructuredSection(sectionId) {
  if (!sectionId) return null;
  for (const chapter of algebraContent.chapters) {
    const section = getStructuredSections(chapter).find((item) => item.id === sectionId);
    if (section) return { chapter, section };
  }
  return null;
}

function getAllTrackableSections() {
  return algebraContent.chapters.flatMap((chapter) => getStructuredSections(chapter));
}

window.getStructuredSections = getStructuredSections;
window.chapterHasStructuredLessons = chapterHasStructuredLessons;
window.findStructuredSection = findStructuredSection;


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
  const trackable = getAllTrackableSections();
  return {
    done: trackable.filter((section) => state.completed.has(section.id)).length,
    total: trackable.length,
  };
}

function init() {
  const savedTheme = readPreference("la-visual-theme");
  if (savedTheme === "dark") document.body.classList.add("dark");

  const collapsed = readPreference("la-visual-sidebar") === "collapsed";
  if (collapsed) document.body.classList.add("sidebar-collapsed");

  updateThemeIcon();
  renderNav();
  bindChrome();
  renderRoute();
  window.addEventListener("hashchange", renderRoute);

  // Canvas text is drawn with whatever font is ready at that moment. If the serif web
  // font arrives after the first paint and the student has not touched anything yet,
  // draw the page again so canvas labels match the text.
  if (document.fonts && !document.fonts.check('16px "LA Serif SC"')) {
    let touched = false;
    ["pointerdown", "keydown"].forEach((type) => window.addEventListener(type, () => { touched = true; }, { once: true, capture: true }));
    document.fonts.load('16px "LA Serif SC"').then(() => {
      if (!touched) renderRoute();
    });
  }

  // Enable expand transitions after the first open-state is applied (no boot pop).
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      document.documentElement.classList.add("expand-ready");
    });
  });
}

function bindChrome() {
  window.addEventListener("resize", () => drawTransformCanvas(), { passive: true });

  els.sidebarToggle.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 920px)").matches) {
      document.body.classList.toggle("sidebar-open");
      return;
    }
    document.body.classList.toggle("sidebar-collapsed");
    writePreference(
      "la-visual-sidebar",
      document.body.classList.contains("sidebar-collapsed") ? "collapsed" : "open",
    );
  });

  els.drawerBackdrop.addEventListener("click", () => {
    document.body.classList.remove("sidebar-open");
  });

  els.themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    writePreference("la-visual-theme", document.body.classList.contains("dark") ? "dark" : "light");
    updateThemeIcon();
    drawTransformCanvas();
  });

}

function updateThemeIcon() {
  els.themeToggle.innerHTML = document.body.classList.contains("dark") ? MOON_ICON : SUN_ICON;
}

function renderNav() {
  els.nav.innerHTML = getChapters()
    .map((chapter) => {
      const chapterHref = chapter.id === "home" ? "#home" : `#${chapter.id}`;
      const structured = getStructuredSections(chapter);
      const sectionLinks = structured.length
          ? structured
              .map(
                (section) => `
                  <a class="nav-section" href="#${chapter.id}/${section.id}" data-section-link="${section.id}" data-search-text="${normalizeSearchText(
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
          <div class="section-list">
            <div class="section-list-clip">
              <div class="section-list-inner">${sectionLinks}</div>
            </div>
          </div>
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

// Chapter content remains eager for full navigation, progress and search coverage;
// chapter-specific visualization code loads only when a lesson is opened.
const chapterAssetPromises = new Map();
let routeRequestId = 0;

function ensureChapterAssets(chapterId) {
  if (chapterAssetPromises.has(chapterId)) return chapterAssetPromises.get(chapterId);
  const sources = [...document.querySelectorAll("script[data-lazy-chapter]")]
    .filter((node) => node.dataset.lazyChapter === chapterId)
    .map((node) => node.dataset.src);
  // Fetch in parallel while executing in markup order (classic scripts with
  // async=false); sequential downloads add a round trip per file on mobile.
  const promise = Promise.all(sources.map((src) => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.async = false;
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load chapter asset: " + src));
    document.head.append(script);
  })));
  chapterAssetPromises.set(chapterId, promise);
  return promise;
}

window.ensureChapterAssets = ensureChapterAssets;

async function renderRoute() {
  const requestId = ++routeRequestId;
  const raw = decodeURIComponent(window.location.hash.replace(/^#/, "")) || "home";
  const [requestedChapter, requestedSection] = raw.split("/");
  if (requestedSection && /^ch\d+$/.test(requestedChapter)) {
    try {
      await ensureChapterAssets(requestedChapter);
    } catch (error) {
      // A failed optional lab script must not prevent reading the lesson itself.
      console.error("Chapter interaction assets could not be loaded:", error);
    }
    if (requestId !== routeRequestId) return;
  }
  cancelTransformAnimation();
  window.teardownSection2ContinuousLab?.();
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
  } else if (chapterHasStructuredLessons(chapter)) {
    // Only accept section ids that belong to this chapter.
    if (state.section && !getStructuredSections(chapter).some((item) => item.id === state.section)) {
      state.section = "";
      document.body.dataset.view = "overview";
    }
    renderStructuredChapter(chapter);
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
  const section = state.section
    ? getStructuredSections(chapter).find((item) => item.id === state.section)
    : null;
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

function getChapterOverviewConfig(chapter) {
  if (chapter.id === "ch4") {
    return {
      coverId: "chapter4",
      eyebrow: "第四章 · 矩阵",
      title: "从数字表格走向线性结构",
      structureTitle: "一条主线串起七个小节",
      panels: [
        { title: "变换视角", text: "先把矩阵看成基向量去向的记录，避免一上来陷入计算规则。" },
        { title: "运算视角", text: "加法、数乘、乘法都解释成记录之间的组合，矩阵乘法重点做复合动画。" },
        { title: "结构视角", text: "通过初等矩阵、可逆、秩和分块，把矩阵从工具推进到结构对象。" },
      ],
    };
  }
  if (chapter.id === "ch2") {
    return {
      coverId: "chapter2",
      eyebrow: "第二章 · 行列式",
      title: "有向面积、符号与塌缩",
      structureTitle: "一条主线串起八个小节",
      panels: [
        { title: "几何视角", text: "用有向面积与体积理解倍率、方向保持与维度塌缩。" },
        { title: "符号视角", text: "由排列奇偶性给出每一项的正负号，再写出 n 阶定义。" },
        { title: "计算视角", text: "用性质、化简、展开和克拉默法则把定义落到可算的结构。" },
      ],
    };
  }
  if (chapter.id === "ch1") {
    return {
      coverId: "chapter1",
      eyebrow: "第一章 · 多项式",
      title: "从数域到形式对象与分解结构",
      structureTitle: "一条主线串起十一个小节",
      panels: [
        { title: "对象视角", text: "先指定数域，再把多项式看成有位置的系数序列，而不是仅看函数图像。" },
        { title: "算法视角", text: "用除法阶梯、欧几里得算法与 Bézout 回代，把整除与最大公因式变成可见过程。" },
        { title: "结构视角", text: "从因式分解、重因式、实复根到多元与对称，把分解与不变量连成主线。" },
      ],
    };
  }
  if (chapter.id === "ch5") {
    return {
      coverId: "chapter5",
      eyebrow: "第五章 · 二次型",
      title: "从二次多项式到合同分类与正定判别",
      structureTitle: "一条主线串起四个小节",
      panels: [
        { title: "表达视角", text: "二次齐次多项式与实对称矩阵互相唯一决定，交叉项系数要在对称位置平分。" },
        { title: "变换视角", text: "非退化替换 x=Cy 对应合同 CᵀAC；配方法与成对初等变换消去交叉项。" },
        { title: "分类与判别", text: "惯性锁定正、负、零方向数量；顺序主子式给出正定的代数判据。" },
      ],
    };
  }
  if (chapter.id === "ch6") {
    return {
      coverId: "chapter6",
      eyebrow: "第六章 · 线性空间",
      title: "从集合映射到空间结构与同构",
      structureTitle: "一条主线串起八个小节",
      panels: [
        { title: "语言视角", text: "先建立集合与映射，再把加法、数乘抽象成线性空间的共同结构。" },
        { title: "骨架视角", text: "用基、维数与坐标描述空间；换基时对象不动，变的是表示。" },
        { title: "分解视角", text: "子空间、交与和、直和与同构，把“空间如何拼装与对应”串成主线。" },
      ],
    };
  }
  return {
    coverId: chapter.id,
    eyebrow: chapter.title,
    title: chapter.subtitle || chapter.title,
    structureTitle: "本章目录",
    panels: [
      { title: "概念", text: chapter.summary || "沿教材顺序建立本章对象与规则。" },
      { title: "结构", text: "从定义出发，连接性质、计算与应用。" },
      { title: "实验", text: "用交互把抽象规则变成可观察的对象。" },
    ],
  };
}

function renderStructuredChapter(chapter) {
  const sections = getStructuredSections(chapter);
  const activeLesson = sections.find((section) => section.id === state.section);
  const interactiveCount = sections.filter(getInteractive).length;
  const videoCount = sections.filter(getVideo).length;
  const exampleCount = sections.filter((section) => section.example).length;
  const metaTags = [
    `${sections.length} 个小节`,
    interactiveCount ? `${interactiveCount} 个交互实验` : "",
    videoCount ? `${videoCount} 个概念短讲` : "",
    exampleCount ? `${exampleCount} 个代表例题` : "",
  ].filter(Boolean);
  if (activeLesson) {
    renderLessonPage(activeLesson, chapter);
    return;
  }

  const overview = getChapterOverviewConfig(chapter);
  els.main.innerHTML = `
    <section class="lesson-cover" id="${overview.coverId}">
      <div class="lesson-cover-copy">
        <span class="eyebrow">${overview.eyebrow}</span>
        <h1>${overview.title}</h1>
        <p>${chapter.summary || ""}</p>
        <div class="meta-row">
          ${metaTags.map((tag, index) => `<span class="tag${index === 0 ? " accent" : ""}">${tag}</span>`).join("")}
        </div>
      </div>
    </section>

    <section class="section-band compact-band" id="${chapter.id}-structure">
      <div class="section-head">
        <div>
          <div class="section-kicker">本章结构</div>
          <h2>${overview.structureTitle}</h2>
        </div>
      </div>
      <div class="overview-grid">
        ${overview.panels
          .map(
            (panel) => `
          <div class="info-panel">
            <strong>${panel.title}</strong>
            <p>${panel.text}</p>
          </div>`,
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
        ${sections.map((section) => renderLessonCard(section, chapter)).join("")}
      </div>
    </section>
  `;
}

function renderChapter4() {
  renderStructuredChapter(getChapterById("ch4"));
}

window.renderStructuredChapter = renderStructuredChapter;
window.renderChapter4 = renderChapter4;


function renderLessonPage(section, chapter = null) {
  const owner = chapter || findStructuredSection(section.id)?.chapter || getChapterById(state.route);
  const concepts = getConcepts(section);
  const video = getVideo(section);
  const interactive = getInteractive(section);
  const breadcrumb = owner?.title || "课程";
  els.main.innerHTML = `
    <section class="lesson-cover" id="${section.id}">
      <div class="lesson-cover-copy">
        <div class="breadcrumb">${breadcrumb} <span>/</span> ${section.title}</div>
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

    ${renderFormalSection(section, concepts)}

    ${renderInteractiveSection(section, interactive)}

    ${renderExampleSection(section)}

    ${renderSelfTestSection(section)}

    <section class="section-band lesson-page-section" id="${section.id}-summary">
      <h2>小结</h2>
      ${renderSummary(section)}
      <button class="button mark-button" type="button" data-complete="${section.id}">标记掌握</button>
    </section>

    ${renderLessonNavigation(section, owner)}
  `;
}

window.renderLessonPage = renderLessonPage;


function getCourseNavigationNodes() {
  return getChapters()
    .filter((chapter) => chapter.id !== "home")
    .flatMap((chapter) => {
      const structured = getStructuredSections(chapter);
      if (structured.length) {
        return structured.map((section) => ({
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

function renderLessonNavigation(section, chapter = null) {
  const owner = chapter || findStructuredSection(section.id)?.chapter;
  const nodes = getCourseNavigationNodes();
  const currentIndex = nodes.findIndex((node) => node.id === `${owner?.id || state.route}/${section.id}`);
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
    ? `<details class="transcript-box"><summary>文字稿</summary><div class="disclose-panel"><div class="disclose-panel-inner"><p>${video.transcript}</p></div></div></details>`
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
        <h3>${section.textbookSection || section.title} · ${section.textbook?.reference || "北大版《高等代数》"}</h3>
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
        <div class="disclose-panel">
          <div class="disclose-panel-inner">
            <div class="example-question">${section.example.question}</div>
            <div class="example-answer">
              <h4>答案与分析</h4>
              ${renderExampleSteps(section.example)}
            </div>
          </div>
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
                  <div class="disclose-panel">
                    <div class="disclose-panel-inner">
                      ${item.answer ? `<p>${item.answer}</p>` : ""}
                      ${item.feedback ? `<p class="muted-note">${item.feedback}</p>` : ""}
                    </div>
                  </div>
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

function renderLessonCard(section, chapter = null) {
  const owner = chapter || findStructuredSection(section.id)?.chapter || getChapterById(state.route);
  const href = owner ? `#${owner.id}/${section.id}` : `#${section.id}`;
  return `
    <a class="lesson-card" href="${href}">
      <div class="section-kicker">${section.number} · ${section.textbookSection || section.title}</div>
      <h3>${section.navTitle || section.title}</h3>
      <p>${section.question || section.goal || ""}</p>
      <div class="meta-row">
        ${(section.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join("")}
      </div>
    </a>
  `;
}

function renderVisualPanel(item) {
  const visual = item?.type ? item : getVisual(item);

  // Presentation modules own slot labs; keep the shell empty.
  if (visual.type === "slot") return "";

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
        <g font-family="'LA Serif Latin', 'LA Serif SC', serif" font-size="22" fill="#f5fbfc" opacity="0.92">
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
  bindAnimatedDetails(els.main);
  setupMultiplyDemo();
  setupRankDemo();
  setupMatrixControls();
  setupTocObserver();
}

/**
 * Animate details open/close via grid-template-rows.
 * Native details removes [open] immediately on close, which skips CSS height
 * transitions — intercept summary clicks when motion is allowed.
 */
function bindAnimatedDetails(root) {
  if (!root) return;

  root.querySelectorAll("details.self-test-item, details.example-box, details.transcript-box").forEach((details) => {
    if (details.dataset.expandBound === "1") return;
    const panel = details.querySelector(":scope > .disclose-panel");
    const summary = details.querySelector(":scope > summary");
    if (!panel || !summary) return;

    details.dataset.expandBound = "1";

    summary.addEventListener("click", (event) => {
      if (prefersReducedMotion()) return;
      if (details.dataset.expandBusy === "1") {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      details.dataset.expandBusy = "1";

      const finish = () => {
        details.dataset.expandBusy = "0";
        panel.style.gridTemplateRows = "";
      };

      const waitForRows = (done) => {
        let settled = false;
        const settle = () => {
          if (settled) return;
          settled = true;
          panel.removeEventListener("transitionend", onEnd);
          window.clearTimeout(timer);
          done();
        };
        const onEnd = (transitionEvent) => {
          if (transitionEvent.target !== panel) return;
          if (transitionEvent.propertyName !== "grid-template-rows") return;
          settle();
        };
        panel.addEventListener("transitionend", onEnd);
        const timer = window.setTimeout(settle, 520);
      };

      if (details.open) {
        panel.style.gridTemplateRows = "1fr";
        // Force style flush so the close transition starts from 1fr.
        void panel.offsetHeight;
        panel.style.gridTemplateRows = "0fr";
        waitForRows(() => {
          details.open = false;
          finish();
        });
        return;
      }

      details.open = true;
      panel.style.gridTemplateRows = "0fr";
      void panel.offsetHeight;
      panel.style.gridTemplateRows = "1fr";
      waitForRows(finish);
    });
  });
}

function bindCompleteButtons() {
  document.querySelectorAll("[data-complete]").forEach((button) => {
    const id = button.dataset.complete;
    button.classList.toggle("is-done", state.completed.has(id));
    button.textContent = state.completed.has(id) ? "已掌握" : "标记掌握";
    button.onclick = () => {
      if (state.completed.has(id)) state.completed.delete(id);
      else state.completed.add(id);
      writePreference("la-visual-progress", JSON.stringify([...state.completed]));
      updateProgressUI();
      bindCompleteButtons();
    };
  });
}

const TRANSFORM_KEYS = ["a", "b", "c", "d"];
const TRANSFORM_INPUT_STEP = "0.05";
let transformAnimRaf = 0;
let transformAnimResolve = null;
/** Live matrix while animating (avoids range `step` quantizing mid-lerp). */
let transformLiveMatrix = null;
let transformResizeObserver = null;

function prefersReducedMotion() {
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
}

function formatMatrixEntry(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return n.toFixed(2).replace(/\.00$/, "");
}

function finiteNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Ignore Event / non-matrix first args (e.g. residual resize listeners). */
function coerceTransformMatrixArg(value) {
  if (value == null) return null;
  if (typeof Event !== "undefined" && value instanceof Event) return null;
  if (Array.isArray(value)) return normalizeTransformMatrix(value);
  if (typeof value === "object" && ("a" in value || "b" in value || "c" in value || "d" in value)) {
    return normalizeTransformMatrix(value);
  }
  return null;
}

function normalizeTransformMatrix(target) {
  if (Array.isArray(target)) {
    return {
      a: finiteNumber(target[0]),
      b: finiteNumber(target[1]),
      c: finiteNumber(target[2]),
      d: finiteNumber(target[3]),
    };
  }
  return {
    a: finiteNumber(target?.a),
    b: finiteNumber(target?.b),
    c: finiteNumber(target?.c),
    d: finiteNumber(target?.d),
  };
}

function getTransformLab() {
  const canvas = document.querySelector("#transformCanvas");
  if (!canvas) return null;
  const root = canvas.closest(".visual-panel") || canvas.closest("#matrix-language-interactive") || document;
  const inputs = Object.fromEntries(
    TRANSFORM_KEYS.map((key) => [key, root.querySelector(`#matrix-${key}`) || document.querySelector(`#matrix-${key}`)]),
  );
  if (!inputs.a) return null;
  return {
    canvas,
    root,
    inputs,
    labels: Object.fromEntries(
      TRANSFORM_KEYS.map((key) => [
        key,
        root.querySelector(`#matrix-${key}-value`) || document.querySelector(`#matrix-${key}-value`),
      ]),
    ),
    readout: root.querySelector("#matrixReadout") || document.querySelector("#matrixReadout"),
  };
}

function readTransformMatrix() {
  if (transformLiveMatrix) return { ...transformLiveMatrix };
  const lab = getTransformLab();
  if (!lab) return { a: 1, b: 0, c: 0, d: 1 };
  return {
    a: finiteNumber(lab.inputs.a?.value),
    b: finiteNumber(lab.inputs.b?.value),
    c: finiteNumber(lab.inputs.c?.value),
    d: finiteNumber(lab.inputs.d?.value),
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

function rememberNativeSteps(lab) {
  TRANSFORM_KEYS.forEach((key) => {
    const input = lab.inputs[key];
    if (input && input.dataset.nativeStep == null) {
      input.dataset.nativeStep = input.getAttribute("step") || TRANSFORM_INPUT_STEP;
    }
  });
}

function setTransformInputStep(step) {
  const lab = getTransformLab();
  if (!lab) return;
  rememberNativeSteps(lab);
  TRANSFORM_KEYS.forEach((key) => {
    const input = lab.inputs[key];
    if (!input) return;
    if (step === "any") {
      input.step = "any";
      return;
    }
    input.step = input.dataset.nativeStep || TRANSFORM_INPUT_STEP;
  });
}

function writeTransformMatrix(matrix, { syncInputs = true } = {}) {
  const lab = getTransformLab();
  const next = normalizeTransformMatrix(matrix);
  TRANSFORM_KEYS.forEach((key) => {
    const input = lab?.inputs[key];
    const value = clampTransformEntry(input, next[key]);
    next[key] = value;
    if (syncInputs && input) input.value = String(value);
    const label = lab?.labels[key];
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
  setTransformInputStep("native");
  settleTransformAnimation(current);
}

function setTransformMatrix(target) {
  cancelTransformAnimation();
  const matrix = writeTransformMatrix(target, { syncInputs: true });
  drawTransformCanvas(matrix, { richReadout: true });
  return matrix;
}

function animateTransformMatrix(target, options = {}) {
  const to = normalizeTransformMatrix(target);
  const duration = Number.isFinite(options.duration) ? options.duration : 580;
  const onUpdate = typeof options.onUpdate === "function" ? options.onUpdate : null;

  cancelTransformAnimation();

  if (!getTransformLab()) {
    return Promise.resolve(to);
  }

  const from = readTransformMatrix();
  if (prefersReducedMotion() || duration <= 0 || matricesNearlyEqual(from, to)) {
    const matrix = writeTransformMatrix(to, { syncInputs: true });
    drawTransformCanvas(matrix, { richReadout: true });
    onUpdate?.(matrix, { final: true });
    return Promise.resolve(matrix);
  }

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
      drawTransformCanvas(matrix, { richReadout: false });
      onUpdate?.(matrix, { final: t >= 1 });
      if (t < 1) {
        transformAnimRaf = requestAnimationFrame(step);
        return;
      }
      transformAnimRaf = 0;
      transformLiveMatrix = null;
      setTransformInputStep("native");
      const finalMatrix = writeTransformMatrix(to, { syncInputs: true });
      drawTransformCanvas(finalMatrix, { richReadout: true });
      onUpdate?.(finalMatrix, { final: true });
      settleTransformAnimation(finalMatrix);
    };
    transformAnimRaf = requestAnimationFrame(step);
  });
}

function setupMatrixControls() {
  const lab = getTransformLab();
  if (!lab) return;

  rememberNativeSteps(lab);

  TRANSFORM_KEYS.forEach((key) => {
    const input = lab.inputs[key];
    if (!input || input.dataset.transformBound === "true") return;
    input.dataset.transformBound = "true";
    input.addEventListener("input", (event) => {
      if (event.isTrusted) cancelTransformAnimation();
      if (event.isTrusted || !transformAnimRaf) drawTransformCanvas();
    });
  });

  if (transformResizeObserver) {
    transformResizeObserver.disconnect();
    transformResizeObserver = null;
  }
  if (typeof ResizeObserver !== "undefined") {
    transformResizeObserver = new ResizeObserver(() => {
      drawTransformCanvas();
    });
    transformResizeObserver.observe(lab.canvas);
    if (lab.canvas.parentElement) transformResizeObserver.observe(lab.canvas.parentElement);
  }

  drawTransformCanvas();
}

function updateTransformReadout(matrix, { rich = true } = {}) {
  const lab = getTransformLab();
  const readout = lab?.readout;
  if (!readout) return;

  const a = formatMatrixEntry(matrix.a);
  const b = formatMatrixEntry(matrix.b);
  const c = formatMatrixEntry(matrix.c);
  const d = formatMatrixEntry(matrix.d);

  // Live frames: plain text only (no KaTeX thrash). Final frame: KaTeX matrix, no det in §1.
  if (!rich) {
    readout.innerHTML = `
      <div class="matrix-readout-live" aria-hidden="true">
        <span>A =</span>
        <span class="matrix-readout-live-grid">
          <i>${a}</i><i>${b}</i>
          <i>${c}</i><i>${d}</i>
        </span>
      </div>
    `;
    return;
  }

  readout.innerHTML = texDisplay(
    `A=\\begin{bmatrix}${formatNumber(matrix.a)}&${formatNumber(matrix.b)}\\\\${formatNumber(matrix.c)}&${formatNumber(matrix.d)}\\end{bmatrix}`,
  );
}

function ensureTransformCanvasBuffer(canvas, cssW, cssH, dpr) {
  const metrics = canvas._transformMetrics || { w: 0, h: 0, dpr: 0 };
  if (metrics.w === cssW && metrics.h === cssH && metrics.dpr === dpr) return;
  canvas.width = Math.max(1, Math.floor(cssW * dpr));
  canvas.height = Math.max(1, Math.floor(cssH * dpr));
  canvas._transformMetrics = { w: cssW, h: cssH, dpr };
}

function drawTransformCanvas(matrixOverride, options = {}) {
  const lab = getTransformLab();
  if (!lab) return;

  const matrix = coerceTransformMatrixArg(matrixOverride) || readTransformMatrix();
  const richReadout = options.richReadout !== false && options.fullReadout !== false;

  TRANSFORM_KEYS.forEach((key) => {
    const label = lab.labels[key];
    if (label) label.textContent = formatMatrixEntry(matrix[key]);
  });
  updateTransformReadout(matrix, { rich: richReadout });

  const canvas = lab.canvas;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const cssW = Math.max(1, rect.width);
  const cssH = Math.max(1, rect.height);
  ensureTransformCanvasBuffer(canvas, cssW, cssH, dpr);

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  const styles = getComputedStyle(document.body);
  const muted = styles.getPropertyValue("--muted").trim() || "#5f6965";
  const lineStrong = styles.getPropertyValue("--cv-axis").trim() || "#8a8d84";
  /* the transformed lattice and the unit cell are results (purple) */
  const accent = styles.getPropertyValue("--cv-image").trim() || "#8c4f86";
  const accentStrong = styles.getPropertyValue("--cv-image").trim() || "#8c4f86";
  const coral = styles.getPropertyValue("--cv-v2").trim() || "#c4552f";
  const text = styles.getPropertyValue("--text").trim() || "#071512";
  const v1 = styles.getPropertyValue("--cv-v1").trim() || "#2a64a8";
  const v2 = styles.getPropertyValue("--cv-v2").trim() || "#c4552f";

  const origin = { x: cssW / 2, y: cssH / 2 };
  /* zoom in on the unit square, but keep both column vectors on screen */
  const reachCol = Math.max(Math.hypot(matrix.a, matrix.c), Math.hypot(matrix.b, matrix.d), Math.hypot(matrix.a + matrix.b, matrix.c + matrix.d));
  const scale = Math.min(cssW, cssH) / Math.max(6.4, 2 * reachCol + 1.4);
  const halfW = cssW / (2 * scale);
  const halfH = cssH / (2 * scale);
  const screenReach = Math.hypot(halfW, halfH) + 1.25;

  const col1Len = Math.hypot(matrix.a, matrix.c);
  const col2Len = Math.hypot(matrix.b, matrix.d);
  const minCol = Math.max(Math.min(col1Len || 0, col2Len || 0), 0);
  const maxCol = Math.max(col1Len, col2Len, 0);
  const allZero = maxCol < 1e-8;
  // Expand domain so the image of the lattice still covers the viewport when A shrinks.
  const domainReach = Math.min(56, Math.max(screenReach + 2, screenReach / Math.max(minCol || maxCol, 0.14) + 2));

  function point(x, y, transformed = false) {
    const px = transformed ? matrix.a * x + matrix.b * y : x;
    const py = transformed ? matrix.c * x + matrix.d * y : y;
    return { x: origin.x + px * scale, y: origin.y - py * scale };
  }

  function drawLine(from, to, color, width = 1, alpha = 1) {
    if (!Number.isFinite(from.x + from.y + to.x + to.y)) return;
    const len = Math.hypot(to.x - from.x, to.y - from.y);
    if (len < 0.4) return;
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

  // Layer 1 — reference grid filling the full stage (axis-aligned).
  const refX = halfW + 1.5;
  const refY = halfH + 1.5;
  const ix0 = Math.floor(-refX);
  const ix1 = Math.ceil(refX);
  const iy0 = Math.floor(-refY);
  const iy1 = Math.ceil(refY);
  for (let i = iy0; i <= iy1; i += 1) {
    const isAxis = i === 0;
    drawLine(point(-refX, i), point(refX, i), lineStrong, isAxis ? 1.15 : 1, isAxis ? 0.26 : 0.09);
  }
  for (let i = ix0; i <= ix1; i += 1) {
    const isAxis = i === 0;
    drawLine(point(i, -refY), point(i, refY), lineStrong, isAxis ? 1.15 : 1, isAxis ? 0.26 : 0.09);
  }

  // Layer 2 — transformed lattice over the whole plane (image of ℤ-grid lines).
  if (!allZero) {
    const iMin = Math.floor(-domainReach);
    const iMax = Math.ceil(domainReach);
    for (let i = iMin; i <= iMax; i += 1) {
      const isAxis = i === 0;
      drawLine(
        point(-domainReach, i, true),
        point(domainReach, i, true),
        isAxis ? accentStrong : accent,
        isAxis ? 1.25 : 1.05,
        isAxis ? 0.4 : 0.28,
      );
      drawLine(
        point(i, -domainReach, true),
        point(i, domainReach, true),
        isAxis ? accentStrong : accent,
        isAxis ? 1.25 : 1.05,
        isAxis ? 0.4 : 0.28,
      );
    }
  }

  // Layer 3 — unit square image as a quiet anchor (not the whole story).
  const p00 = point(0, 0, true);
  const p10 = point(1, 0, true);
  const p11 = point(1, 1, true);
  const p01 = point(0, 1, true);
  const cellArea = Math.abs((p10.x - p00.x) * (p01.y - p00.y) - (p01.x - p00.x) * (p10.y - p00.y));
  if (cellArea > 2) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p00.x, p00.y);
    ctx.lineTo(p10.x, p10.y);
    ctx.lineTo(p11.x, p11.y);
    ctx.lineTo(p01.x, p01.y);
    ctx.closePath();
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.09;
    ctx.fill();
    ctx.globalAlpha = 0.34;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();
  }

  // Layer 4 — basis before / after.
  /* the faint e1, e2 labels are dropped while Ae1, Ae2 sit on top of them */
  const near = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) < 22;
  drawArrow(ctx, origin, point(1, 0), muted, near(point(1, 0), point(1, 0, true)) ? "" : "e₁", 0.3, 2.2);
  drawArrow(ctx, origin, point(0, 1), muted, near(point(0, 1), point(0, 1, true)) ? "" : "e₂", 0.3, 2.2);
  drawArrow(ctx, origin, point(1, 0, true), v1, "Ae₁", 1, 3.05);
  drawArrow(ctx, origin, point(0, 1, true), v2, "Ae₂", 1, 3.05);

  ctx.save();
  ctx.fillStyle = text;
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, allZero ? 4.2 : 3.2, 0, Math.PI * 2);
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
  if (label) {
    ctx.font = "700 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
    ctx.fillText(label, to.x + 8, to.y - 8);
  }
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

  document.querySelectorAll(".chapter-group").forEach((group) => {
    const button = group.querySelector(".nav-chapter");
    const links = group.querySelectorAll("[data-section-link]");
    if (!button || !links.length) return;
    const done = [...links].filter((link) => state.completed.has(link.dataset.sectionLink)).length;
    let badge = button.querySelector(".chapter-progress");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "chapter-progress";
      button.insertBefore(badge, button.querySelector(".chapter-arrow"));
    }
    badge.textContent = done ? `${done}/${links.length}` : "";
    badge.classList.toggle("is-complete", done === links.length);
    if (done) badge.setAttribute("aria-label", `已掌握 ${done} 节，共 ${links.length} 节`);
    else badge.removeAttribute("aria-label");
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


;/* visuals/theme-transition.js */
(() => {
  // phones get the art alone: the words Luna / Sol do not fit a portrait screen
  const PHONE = window.matchMedia("(max-width: 720px)");
  const ASSETS = PHONE.matches
    ? { luna: "./assets/theme/luna-mark-alpha.webp?v=t4", sol: "./assets/theme/sol-mark-alpha.webp?v=t4" }
    : { luna: "./assets/theme/luna-alpha.webp?v=21h", sol: "./assets/theme/sol-alpha.webp?v=21h" };

  /**
   * Timeline (full duration):
   * 0–morphEnd   continuous CSS-token luminance morph (无极)
   * ~morphEnd    body.dark commit (under full art + blur; veil still 0)
   * 68–100%      page veil 0→1 + blur/art fade (no green snap at teardown)
   */
  const NORMAL = {
    duration: 2800,
    morphStart: 0.06,
    /** Finalize class while art+blur still full and veil still off */
    morphEnd: 0.66,
    /** Start restoring body::before in the shared exit window */
    veilRestoreStart: 0.68,
  };
  const REDUCED = {
    duration: 420,
    morphStart: 0.08,
    morphEnd: 0.75,
    veilRestoreStart: 0.7,
  };

  /** Light palette: must match design-a.css :root (direction A “松烟”) */
  const LIGHT = {
    "--bg": [245, 242, 234, 1],
    "--bg-grid": [0, 0, 0, 0],
    "--surface": [251, 249, 244, 1],
    "--surface-solid": [251, 249, 244, 1],
    "--surface-soft": [240, 237, 227, 1],
    "--text": [29, 33, 30, 1],
    "--muted": [93, 98, 92, 1],
    "--faint": [143, 147, 139, 1],
    "--line": [225, 220, 207, 1],
    "--line-strong": [214, 209, 195, 1],
    "--accent": [44, 94, 74, 1],
    "--accent-strong": [31, 74, 57, 1],
    "--accent-soft": [231, 236, 227, 1],
    "--canvas-paper-top": [253, 252, 248, 1],
    "--canvas-paper-bottom": [253, 252, 248, 1],
    "--canvas-paper-glow": [0, 0, 0, 0],
    "--shadow-rgb": [54, 65, 50, 0.14],
  };

  /** Dark palette: must match design-a.css body.dark */
  const DARK = {
    "--bg": [19, 22, 20, 1],
    "--bg-grid": [0, 0, 0, 0],
    "--surface": [26, 29, 26, 1],
    "--surface-solid": [26, 29, 26, 1],
    "--surface-soft": [30, 34, 30, 1],
    "--text": [231, 229, 221, 1],
    "--muted": [166, 168, 159, 1],
    "--faint": [125, 129, 120, 1],
    "--line": [42, 46, 42, 1],
    "--line-strong": [58, 63, 58, 1],
    "--accent": [147, 194, 166, 1],
    "--accent-strong": [185, 217, 196, 1],
    "--accent-soft": [31, 42, 35, 1],
    "--canvas-paper-top": [22, 25, 22, 1],
    "--canvas-paper-bottom": [22, 25, 22, 1],
    "--canvas-paper-glow": [0, 0, 0, 0],
    "--shadow-rgb": [0, 0, 0, 0.42],
  };

  const TOKEN_KEYS = Object.keys(LIGHT);

  /*
   * Every other colour token the stylesheets define for :root (light) and body.dark
   * (dark) — sidebar, canvas, prediction, glass… — read when a switch starts, so tokens
   * added later morph with the page instead of jumping when the class flips.
   */
  let dynamic = { keys: [], light: {}, dark: {} };
  let probe = null;

  function toRgba(value) {
    if (!probe) {
      probe = document.createElement("i");
      probe.hidden = true;
      document.documentElement.append(probe);
    }
    probe.style.color = "";
    probe.style.color = value;
    if (!probe.style.color) return null;
    const c = getComputedStyle(probe).color;
    let m = c.match(/^rgba?\(([^)]+)\)/);
    if (m) {
      const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
      return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
    }
    m = c.match(/^color\(srgb ([^)]+)\)/);
    if (m) {
      const p = m[1].split(/[\s/]+/).filter(Boolean).map(Number);
      return [p[0] * 255, p[1] * 255, p[2] * 255, p.length > 3 ? p[3] : 1];
    }
    return null;
  }

  function collectTokens() {
    const light = {};
    const dark = {};
    for (const sheet of document.styleSheets) {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch (error) {
        continue;
      }
      for (const rule of rules) {
        if (!rule.selectorText || !rule.style) continue;
        const parts = rule.selectorText.split(",").map((x) => x.trim());
        const target = parts.includes("body.dark") ? dark : parts.some((x) => x === ":root" || x === "html") ? light : null;
        if (!target) continue;
        for (const name of rule.style) if (name.startsWith("--")) target[name] = rule.style.getPropertyValue(name).trim();
      }
    }
    const resolve = (value, palette, depth = 0) =>
      depth > 6 ? value : value.replace(/var\((--[\w-]+)\s*(?:,\s*([^()]+))?\)/g, (_, name, fallback) => resolve(palette[name] ?? fallback ?? "", palette, depth + 1));
    const darkFull = { ...light, ...dark };
    const keys = [];
    const out = { keys, light: {}, dark: {} };
    for (const name of Object.keys(darkFull)) {
      if (TOKEN_KEYS.includes(name)) continue;
      const a = toRgba(resolve(light[name] ?? darkFull[name], light));
      const b = toRgba(resolve(darkFull[name], darkFull));
      if (!a || !b || a.every((x, i) => Math.abs(x - b[i]) < 1e-3)) continue;
      keys.push(name);
      out.light[name] = a;
      out.dark[name] = b;
    }
    return out;
  }

  let mixFrame = 0;

  let active = false;
  let overlay = null;
  let art = null;
  let timers = [];
  let morphRaf = 0;

  /** @type {Record<string, HTMLImageElement>} */
  const images = {};

  function clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }

  function smootherstep(t) {
    const x = clamp01(t);
    return x * x * x * (x * (x * 6 - 15) + 10);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function mixChannel(from, to, t) {
    return [
      Math.round(lerp(from[0], to[0], t)),
      Math.round(lerp(from[1], to[1], t)),
      Math.round(lerp(from[2], to[2], t)),
      lerp(from[3], to[3], t),
    ];
  }

  function cssColor(channels) {
    const [r, g, b, a] = channels;
    if (a >= 0.999) return `rgb(${r}, ${g}, ${b})`;
    return `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(4))})`;
  }

  function loadImage(src, priority = "low") {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.fetchPriority = priority;
      img.onload = () => {
        if (typeof img.decode !== "function") {
          resolve(img);
          return;
        }
        // Safari can reject decode() on an image that has already loaded: it is still usable
        img.decode().then(() => resolve(img), () => resolve(img));
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  // Theme artwork is optional until the user requests a transition.
  // Avoid competing with the first lesson, math fonts and active lab on slow networks.
  const preparations = {};
  function prepareArt(mode, priority = "low") {
    if (!preparations[mode]) {
      preparations[mode] = loadImage(ASSETS[mode], priority).then((img) => {
        images[mode] = img;
        return img;
      }).catch((error) => {
        delete preparations[mode];
        throw error;
      });
    }
    return preparations[mode];
  }

  function preloadWhenIdle() {
    window.setTimeout(() => {
      const start = () => {
        Promise.allSettled([prepareArt("luna"), prepareArt("sol")])
          .then((results) => results.forEach((result) => {
            if (result.status === "rejected") console.warn("Theme artwork could not be prepared.", result.reason);
          }));
      };
      if ("requestIdleCallback" in window) window.requestIdleCallback(start, { timeout: 10000 });
      else start();
    }, 3500);
  }
  if (document.readyState === "complete") preloadWhenIdle();
  else window.addEventListener("load", preloadWhenIdle, { once: true });

  function ensureOverlay() {
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.className = "theme-transition";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <div class="theme-transition__blur"></div>
      <div class="theme-transition__wash theme-transition__wash--from"></div>
      <div class="theme-transition__wash theme-transition__wash--to"></div>
      <img class="theme-transition__art" alt="" draggable="false" />
    `;
    art = overlay.querySelector(".theme-transition__art");
    document.body.append(overlay);
    return overlay;
  }

  function clearTimers() {
    timers.forEach((id) => window.clearTimeout(id));
    timers = [];
    if (morphRaf) {
      cancelAnimationFrame(morphRaf);
      morphRaf = 0;
    }
  }

  function clearInlineTokens() {
    TOKEN_KEYS.forEach((key) => {
      document.body.style.removeProperty(key);
    });
    dynamic.keys.forEach((key) => {
      document.body.style.removeProperty(key);
    });
    document.body.style.removeProperty("--shadow");
    document.body.style.removeProperty("--shadow-soft");
    document.body.style.removeProperty("--theme-mix");
    // Keep --theme-tx-page-veil until teardown — finalize must not snap atmosphere
  }

  /**
   * body::before opacity over full timeline t∈[0,1].
   * Off during mid (so light/dark ::before content can swap under art+blur),
   * then continuous restore to 1 before teardown — eliminates green end jump.
   */
  function pageVeilForTimeline(globalT, timing) {
    const t = clamp01(globalT);
    const start = timing.veilRestoreStart;
    if (t <= 0.06) {
      // Soft dip at start so entry is not a hard cut either
      return lerp(1, 0, smootherstep(t / 0.06));
    }
    if (t < start) return 0;
    return smootherstep((t - start) / Math.max(0.001, 1 - start));
  }

  function setPageVeil(value) {
    document.body.style.setProperty("--theme-tx-page-veil", String(clamp01(value)));
  }

  function applyMix(from, to, t) {
    const mix = smootherstep(t);
    document.body.style.setProperty("--theme-mix", String(mix));

    TOKEN_KEYS.forEach((key) => {
      if (key === "--shadow-rgb") return;
      document.body.style.setProperty(key, cssColor(mixChannel(from[key], to[key], mix)));
    });
    const goingDark = from === LIGHT;
    const a = goingDark ? dynamic.light : dynamic.dark;
    const b = goingDark ? dynamic.dark : dynamic.light;
    dynamic.keys.forEach((key) => {
      document.body.style.setProperty(key, cssColor(mixChannel(a[key], b[key], mix)));
    });
    // canvases paint their colours from these tokens: let them redraw along the way
    mixFrame += 1;
    if (mixFrame % 2 === 0) window.dispatchEvent(new Event("la-thememix"));
    // older labs (chapters 1, 2, 4, 5) repaint on resize: nudge them a few times a second
    if (mixFrame % 6 === 0) window.dispatchEvent(new Event("resize"));

    const shadow = mixChannel(from["--shadow-rgb"], to["--shadow-rgb"], mix);
    const softA = lerp(0.1, 0.24, mix);
    document.body.style.setProperty(
      "--shadow",
      `0 26px 70px rgba(${shadow[0]}, ${shadow[1]}, ${shadow[2]}, ${shadow[3].toFixed(3)})`,
    );
    document.body.style.setProperty(
      "--shadow-soft",
      `0 18px 42px rgba(${shadow[0]}, ${shadow[1]}, ${shadow[2]}, ${softA.toFixed(3)})`,
    );
  }

  function finalizeTheme(targetTheme, button) {
    const isDark = targetTheme === "dark";
    document.body.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = targetTheme;
    clearInlineTokens();
    document.documentElement.style.colorScheme = targetTheme;

    try {
      localStorage.setItem("la-visual-theme", targetTheme);
    } catch (error) {
      console.warn("Theme preference could not be saved.", error);
    }

    button?.setAttribute("aria-pressed", String(isDark));

    if (typeof window.updateThemeIcon === "function") {
      window.updateThemeIcon();
    }
    if (typeof window.drawTransformCanvas === "function") {
      window.drawTransformCanvas();
    }

    window.dispatchEvent(
      new CustomEvent("la-themechange", {
        detail: { theme: targetTheme },
      }),
    );

    requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
  }

  function teardownOverlay(button) {
    // Atmosphere already at 1 — removing the class cannot flash green radials
    setPageVeil(1);
    if (overlay) {
      overlay.classList.remove("is-active");
      overlay.removeAttribute("data-mode");
    }
    document.body.classList.remove("theme-transitioning");
    document.body.style.removeProperty("--theme-tx-page-veil");
    button?.removeAttribute("aria-busy");
    if (button) button.disabled = false;
    active = false;
  }

  function startTimeline(from, to, timing, targetTheme, button) {
    const t0 = performance.now();
    const morphSpan = Math.max(1, timing.duration * (timing.morphEnd - timing.morphStart));
    const morphDelay = timing.duration * timing.morphStart;
    let finalized = false;

    applyMix(from, to, 0);
    setPageVeil(1);

    const tick = (now) => {
      const elapsed = now - t0;
      const globalT = clamp01(elapsed / timing.duration);

      // Continuous page atmosphere (the end-jump fix)
      setPageVeil(pageVeilForTimeline(globalT, timing));

      // Continuous theme tokens
      if (elapsed < morphDelay) {
        applyMix(from, to, 0);
      } else {
        const local = clamp01((elapsed - morphDelay) / morphSpan);
        applyMix(from, to, local);
        if (local > 0.55) {
          document.documentElement.style.colorScheme = targetTheme;
        }
        if (local >= 1 && !finalized) {
          finalized = true;
          // Class commit under art+blur while veil is still 0 — invisible
          finalizeTheme(targetTheme, button);
        }
      }

      if (globalT < 1) {
        morphRaf = requestAnimationFrame(tick);
        return;
      }

      morphRaf = 0;
      setPageVeil(1);
      if (!finalized) {
        finalized = true;
        finalizeTheme(targetTheme, button);
      }
    };

    morphRaf = requestAnimationFrame(tick);
  }

  function playTransition(button) {
    if (active) return;
    active = true;

    const goingDark = !document.body.classList.contains("dark");
    const targetTheme = goingDark ? "dark" : "light";
    try {
      dynamic = collectTokens();
    } catch (error) {
      dynamic = { keys: [], light: {}, dark: {} };
    }
    const mode = goingDark ? "luna" : "sol";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timing = reduced ? REDUCED : NORMAL;
    const root = ensureOverlay();
    const from = goingDark ? LIGHT : DARK;
    const to = goingDark ? DARK : LIGHT;

    clearTimers();
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    document.body.classList.add("theme-transitioning");
    window.dispatchEvent(new Event("la-themestart"));
    root.dataset.mode = mode;
    root.style.setProperty("--theme-tx-duration", `${timing.duration}ms`);
    setPageVeil(1);

    const run = () => {
      root.classList.remove("is-active");
      void root.offsetWidth;
      root.classList.add("is-active");

      startTimeline(from, to, timing, targetTheme, button);

      timers.push(
        window.setTimeout(() => {
          const wantDark = targetTheme === "dark";
          if (document.body.classList.contains("dark") !== wantDark) {
            finalizeTheme(targetTheme, button);
          } else {
            clearInlineTokens();
            document.documentElement.style.colorScheme = targetTheme;
          }
          // Guarantee veil is full before class removal
          setPageVeil(1);
          teardownOverlay(button);
          clearTimers();
        }, timing.duration + 80),
      );
    };

    if (reduced) {
      run();
      return;
    }

    const ready = images[mode]
      ? Promise.resolve(images[mode])
      : prepareArt(mode, "high").then((img) => {
          images[mode] = img;
          return img;
        });

    ready
      .then((img) => {
        // a fresh element per switch: reusing one <img> and swapping luna → sol made
        // Safari's decode() reject, which dropped the sun animation
        const fresh = art.cloneNode(false);
        fresh.src = img.src;
        art.replaceWith(fresh);
        art = fresh;
        return Promise.resolve(fresh.decode?.()).catch(() => {});
      })
      .then(run)
      .catch((error) => {
        console.warn("Theme transition art failed.", error);
        finalizeTheme(targetTheme, button);
        setPageVeil(1);
        teardownOverlay(button);
        clearTimers();
      });
  }

  document.addEventListener(
    "click",
    (event) => {
      const button = event.target.closest?.("#themeToggle");
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      if (!active) playTransition(button);
    },
    true,
  );
})();


;/* visuals/liquid-glass.js */
/*
 * Learning-page chrome: marks the page as scrolled once it leaves the top, so
 * the floating controls can show their scroll-edge fade. The material itself
 * and its pointer light live in material.css / material.js.
 */
(() => {
  function initScrollEdge() {
    let queued = false;
    const update = () => {
      queued = false;
      document.body.classList.toggle("lg-scrolled", window.scrollY > 4);
    };
    window.addEventListener(
      "scroll",
      () => {
        if (queued) return;
        queued = true;
        window.requestAnimationFrame(update);
      },
      { passive: true },
    );
    update();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initScrollEdge, { once: true });
  else initScrollEdge();
})();


;/* content/ch1-registry.js */
/*
 * Chapter 1 section data registry.
 */
(() => {
  const patches = new Map();

  window.defineChapter1Section = function defineChapter1Section(sectionId, patch) {
    if (!sectionId || !patch || typeof patch !== "object") {
      throw new TypeError("Chapter 1 section patches require an id and an object.");
    }
    patches.set(sectionId, patch);
  };

  window.getChapter1SectionPatches = function getChapter1SectionPatches() {
    return patches;
  };
})();


;/* content/ch1-section1.js */
defineChapter1Section("number-fields", {
  number: "§1",
  textbookSection: "数域",
  title: "数域",
  navTitle: "数域",
  question: "研究多项式之前，为什么要先说明系数取自哪个数域？",
  goal: `掌握数域的定义；会判断常见数集是否为数域；理解同一个多项式能否分解要看数域。`,
  tags: ["数域", "封闭性", "系数域"],
  intro: `数域是含 0 和 1、对加、减、乘、除（除数不为 0）都封闭的复数集合。多项式的系数、它的因式，以及“能不能再分解”，都要在指定的数域里讨论：${texInline("x^2-2")} 在 ${texInline("\\mathbb{Q}")} 上不能分解，在 ${texInline("\\mathbb{R}")} 上等于 ${texInline("(x-\\sqrt2)(x+\\sqrt2)")}。`,
  textbook: {
    reference: "北大版《高等代数》第一章 §1",
    items: ["数域的定义", "常见数域与反例"],
  },
  formal: {
    title: "数域的定义",
    equation: "\\mathbb{Q}\\subseteq P\\subseteq\\mathbb{C}\\qquad(P\\ \\text{为任意数域})",
    definitions: [
      {
        title: "数域",
        text: `设 ${texInline("P")} 是含 0 与 1 的复数集合。若 ${texInline("P")} 中任意两数的和、差、积、商（除数不为 0）仍属于 ${texInline("P")}，就称 ${texInline("P")} 为数域。`,
      },
      {
        title: `任何数域都含 ${texInline("\\mathbb{Q}")}`,
        text: `从 1 出发反复做加减，得到全体整数；再做除法，得到全体有理数。所以 ${texInline("\\mathbb{Q}")} 是最小的数域。`,
      },
      {
        title: `${texInline("\\mathbb{Q}(\\sqrt2)")} 是数域`,
        text: `${texInline("\\{a+b\\sqrt2:a,b\\in\\mathbb{Q}\\}")} 对加、减、乘显然封闭；非零元素的倒数 ${texInline("\\dfrac{a-b\\sqrt2}{a^2-2b^2}")} 仍是这种形式（${texInline("\\sqrt2")} 是无理数，故 ${texInline("a^2-2b^2\\ne0")}）。`,
      },
    ],
    pitfalls: [
      `只检查加法和乘法：${texInline("\\mathbb{Z}")} 对加、减、乘封闭，但 ${texInline("1\\div2\\notin\\mathbb{Z}")}。`,
      `不说数域就判断能否分解：${texInline("x^2+1")} 在 ${texInline("\\mathbb{R}")} 上不能分解，在 ${texInline("\\mathbb{C}")} 上等于 ${texInline("(x-i)(x+i)")}。`,
    ],
    note: "一元多项式：系数序列、运算与次数。",
  },
  interactive: false,
  example: {
    title: "例题：判断集合是否为数域",
    question: `判断下列集合是否为数域：${texInline("\\mathbb{Z}")}；${texInline("\\mathbb{Q}")}；${texInline("\\{a+b\\sqrt2:a,b\\in\\mathbb{Q}\\}")}；正实数集。`,
    choices: [
      {
        correct: true,
        text: `${texInline("\\mathbb{Z}")} 不是（除法不封闭）；${texInline("\\mathbb{Q}")} 是；${texInline("\\mathbb{Q}(\\sqrt2)")} 是；正实数集不是（不含 0）。`,
      },
      { text: "四个集合都是数域，因为都可以进行乘法和除法。" },
      { text: `${texInline("\\mathbb{Q}")} 不是数域，因为它不含 ${texInline("\\sqrt2")}。` },
      { text: "正实数集是数域，因为正数相除仍为正数。" },
    ],
    steps: [
      `正实数集不含 0，也不对减法封闭（${texInline("1-2=-1")}），不是数域。`,
      `${texInline("\\mathbb{Z}")} 对加、减、乘封闭，但 ${texInline("1/2\\notin\\mathbb{Z}")}，不是数域。`,
      `${texInline("\\mathbb{Q}")} 中两数的和、差、积、商（除数非零）仍是有理数，是数域。`,
      `${texInline("(a+b\\sqrt2)(c+d\\sqrt2)=(ac+2bd)+(ad+bc)\\sqrt2")}；非零元素的倒数为 ${texInline("\\dfrac{a-b\\sqrt2}{a^2-2b^2}")}，仍在集合中，所以 ${texInline("\\mathbb{Q}(\\sqrt2)")} 是数域。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("\\{a+bi:a,b\\in\\mathbb{Q}\\}")} 是数域吗？`,
      answer: `是。和、差、积仍是这种形式；非零元素的倒数 ${texInline("\\dfrac{a-bi}{a^2+b^2}")} 也在其中。`,
    },
    {
      question: `为什么任何数域 ${texInline("P")} 都包含 ${texInline("\\mathbb{Q}")}？`,
      answer: `${texInline("1\\in P")}，反复加减得到全体整数，再作除法得到全体有理数。`,
    },
    {
      question: `${texInline("x^2-\\sqrt2")} 是 ${texInline("\\mathbb{Q}")} 上的多项式吗？是 ${texInline("\\mathbb{Q}(\\sqrt2)")} 上的多项式吗？`,
      answer: `不是 ${texInline("\\mathbb{Q}")} 上的多项式（系数 ${texInline("-\\sqrt2")} 不是有理数）；是 ${texInline("\\mathbb{Q}(\\sqrt2)")} 上的多项式。`,
    },
    {
      question: `奇数集对乘法封闭，它是数域吗？`,
      answer: `不是：它不含 0，而且 ${texInline("1+1=2")} 不是奇数。`,
    },
  ],
  summary: [
    "数域含 0 和 1，对加、减、乘、除（除数非零）封闭；任何数域都包含有理数域。",
    "要说明一个集合不是数域，找出一个不封闭的运算实例即可。",
    "多项式的系数、因式和能否分解，都要相对于指定的数域来说。",
  ],
});


;/* content/ch1-section2.js */
defineChapter1Section("univariate-polynomials", {
  number: "§2",
  textbookSection: "一元多项式",
  title: "一元多项式",
  navTitle: "一元多项式",
  question: "为什么说一个多项式由它的系数决定？系数中间的 0 能不能省掉？",
  goal: `掌握 ${texInline("P[x]")} 中多项式的相等、加法、乘法与次数；会用 ${texInline("i+j=k")} 求乘积中指定项的系数。`,
  tags: ["一元多项式", "系数", "次数", "乘法"],
  intro: `数域 ${texInline("P")} 上的一元多项式是 ${texInline("f(x)=a_0+a_1x+\\cdots+a_nx^n")}，${texInline("a_i\\in P")}。两个多项式相等，指同次项的系数全部相等。系数的位置就是次数：${texInline("3x^3-x+2")} 的系数依次为 ${texInline("(2,-1,0,3)")}，中间的 0 占着 ${texInline("x^2")} 的位置。`,
  textbook: {
    reference: "北大版《高等代数》第一章 §2",
    items: ["一元多项式及其相等", "加法与乘法", "次数"],
  },
  formal: {
    title: "运算与次数",
    equation: "f(x)g(x)=\\sum_{k=0}^{n+m}\\Bigl(\\sum_{i+j=k}a_ib_j\\Bigr)x^k",
    definitions: [
      {
        title: "加法与乘法",
        text: `加法把同次项系数相加。乘法中 ${texInline("x^k")} 的系数是所有满足 ${texInline("i+j=k")} 的 ${texInline("a_ib_j")} 之和，因为 ${texInline("a_ix^i\\cdot b_jx^j=a_ib_jx^{i+j}")}。`,
      },
      {
        title: "次数",
        text: `非零多项式最高非零系数的下标叫它的次数，记作 ${texInline("\\deg f")}。零多项式不定义次数。`,
      },
      {
        title: "次数公式",
        text: `${texInline("f,g\\ne0")} 时 ${texInline("\\deg(fg)=\\deg f+\\deg g")}，因为首项系数之积不为 0；${texInline("f+g\\ne0")} 时 ${texInline("\\deg(f+g)\\le\\max(\\deg f,\\deg g)")}，首项可能抵消。`,
      },
    ],
    pitfalls: [
      `把 ${texInline("(2,-1,0,3)")} 写成 ${texInline("(2,-1,3)")}，后面的系数全部错位。`,
      `把乘法当成同次系数相乘：${texInline("x^k")} 的系数要收集所有 ${texInline("i+j=k")} 的配对。`,
      "认为两个 3 次多项式之和一定是 3 次。",
    ],
    note: `整除的概念：带余除法 ${texInline("f=qg+r")}。`,
  },
  interactive: {
    type: "slot",
    title: "系数带工作台",
    description: `编辑 ${texInline("f")}、${texInline("g")} 的系数，比较乘法、加减与数乘。`,
    task: `先猜一猜删去中间的 0 会怎样，再动手比较两条曲线。展开“更多运算”可以做加减与乘法：拖动 ${texInline("k")}，读出所有满足 ${texInline("i+j=k")} 的配对；再点“首项抵消”，看和的次数怎样下降。`,
  },
  example: {
    title: "例题：系数、抵消与指定项",
    question: `设 ${texInline("f(x)=2-x+3x^3")}，${texInline("g(x)=-2+x+x^2-3x^3")}。写出系数序列，计算 ${texInline("f+g")}；求 ${texInline("fg")} 中 ${texInline("x^3")} 的系数，并判断 ${texInline("\\deg(fg)")}。`,
    choices: [
      {
        correct: true,
        text: `${texInline("f\\leftrightarrow(2,-1,0,3)")}，${texInline("g\\leftrightarrow(-2,1,1,-3)")}；${texInline("f+g=x^2")}；${texInline("x^3")} 的系数为 ${texInline("-13")}；${texInline("\\deg(fg)=6")}。`,
      },
      { text: `${texInline("f+g")} 仍为三次，因为两个加数都是三次。` },
      { text: `${texInline("x^3")} 的系数为 ${texInline("3\\cdot(-3)=-9")}，只需乘两个三次项系数。` },
      { text: `${texInline("f\\leftrightarrow(2,-1,3)")}，中间的零系数可以直接删除。` },
    ],
    steps: [
      `${texInline("f\\leftrightarrow(2,-1,0,3)")}，${texInline("g\\leftrightarrow(-2,1,1,-3)")}，缺少的 ${texInline("x^2")} 项系数记为 0。`,
      `同次相加得 ${texInline("(0,0,1,0)")}，即 ${texInline("f+g=x^2")}：三次项抵消了。`,
      `${texInline("x^3")} 的系数为 ${texInline("a_0b_3+a_1b_2+a_2b_1+a_3b_0=2(-3)+(-1)(1)+0\\cdot1+3(-2)=-13")}。`,
      `首项系数之积 ${texInline("3\\cdot(-3)=-9\\ne0")}，所以 ${texInline("\\deg(fg)=3+3=6")}。`,
    ],
  },
  quiz: [
    {
      question: `设 ${texInline("f=1+2x^2")}，${texInline("g=x-x^2")}。${texInline("fg")} 中 ${texInline("x^2")} 的系数是多少？`,
      answer: `${texInline("a_0b_2+a_1b_1+a_2b_0=1\\cdot(-1)+0\\cdot1+2\\cdot0=-1")}。`,
    },
    {
      question: `${texInline("\\deg(f+g)")} 什么时候会小于 ${texInline("\\max(\\deg f,\\deg g)")}？`,
      answer: "两者次数相同，并且首项系数互为相反数时。",
    },
    {
      question: "为什么两个非零多项式的乘积一定不是零多项式？",
      answer: "乘积的首项系数是两个首项系数之积，数域中两个非零数的积不为 0。",
    },
    {
      question: `${texInline("(2,-1,0,3)")} 与 ${texInline("(2,-1,3)")} 表示同一个多项式吗？`,
      answer: `不是。前者是 ${texInline("2-x+3x^3")}，后者是 ${texInline("2-x+3x^2")}。`,
    },
  ],
  summary: [
    "多项式由系数序列决定，缺少的项系数记为 0。",
    `加法同次相加；乘积中 ${texInline("x^k")} 的系数是 ${texInline("\\sum_{i+j=k}a_ib_j")}。`,
    "两个非零多项式乘积的次数等于次数之和；和的次数可能因首项抵消而降低。",
  ],
});


;/* content/ch1-section3.js */
defineChapter1Section("polynomial-divisibility", {
  number: "§3",
  textbookSection: "整除的概念",
  title: "整除的概念",
  navTitle: "整除的概念",
  question: `多项式的带余除法怎样一步步算出商和余式？什么时候说 ${texInline("g")} 整除 ${texInline("f")}？`,
  goal: "掌握带余除法以及商、余式的唯一性；理解整除的定义与基本性质。",
  tags: ["带余除法", "整除", "商与余式"],
  intro: `对 ${texInline("f(x)")} 和非零的 ${texInline("g(x)")} 做长除法：每一步用当前余式的首项除以 ${texInline("g")} 的首项，得到商的下一项；乘回 ${texInline("g")} 再相减，余式次数就下降。做到 ${texInline("r=0")} 或 ${texInline("\\deg r<\\deg g")} 为止。`,
  textbook: {
    reference: "北大版《高等代数》第一章 §3",
    items: ["带余除法", "整除的定义与性质"],
  },
  formal: {
    title: "带余除法与整除",
    equation: "\\begin{gathered}f(x)=q(x)g(x)+r(x)\\\\ r(x)=0\\ \\ \\text{或}\\ \\ \\deg r<\\deg g\\end{gathered}",
    definitions: [
      {
        title: "整除",
        text: `若有 ${texInline("h(x)")} 使 ${texInline("f=gh")}，就说 ${texInline("g")} 整除 ${texInline("f")}，记作 ${texInline("g\\mid f")}。${texInline("g\\ne0")} 时，${texInline("g\\mid f")} 当且仅当 ${texInline("g")} 除 ${texInline("f")} 的余式为 0。`,
      },
      {
        title: "商和余式唯一",
        text: `若 ${texInline("f=q_1g+r_1=q_2g+r_2")}，则 ${texInline("(q_1-q_2)g=r_2-r_1")}。若 ${texInline("q_1\\ne q_2")}，左边次数至少为 ${texInline("\\deg g")}，右边次数却小于 ${texInline("\\deg g")}，矛盾。`,
      },
      {
        title: "基本性质",
        text: `整除有传递性；若 ${texInline("h\\mid f")}、${texInline("h\\mid g")}，则对任意 ${texInline("u,v")} 有 ${texInline("h\\mid uf+vg")}；若 ${texInline("f\\mid g")} 且 ${texInline("g\\mid f")}，则 ${texInline("f=cg")}，${texInline("c")} 为非零常数。`,
      },
    ],
    pitfalls: [
      "缺项不补 0，相减时同次项没有对齐。",
      "余式次数已经低于除式次数，还继续往下除。",
    ],
    note: "最大公因式：反复做带余除法。",
  },
  interactive: {
    type: "slot",
    title: "长除法",
    description: "逐步做首项相除、乘回、相减。",
    task: `先猜一猜，再点“下一步”做完 ${texInline("x^4-1")} 除以 ${texInline("x^2+x+1")}：看余式次数阶梯每步下降多少、在哪里落到 ${texInline("\\deg g")} 以下；再换到“整除”示例比较结束时的余式。`,
  },
  example: {
    title: "例题：完成一次带余除法",
    question: `用带余除法求 ${texInline("x^4-1")} 除以 ${texInline("x^2+x+1")} 的商与余式，并判断是否整除。`,
    choices: [
      { correct: true, text: `商为 ${texInline("x^2-x")}，余式为 ${texInline("x-1")}，不整除。` },
      { text: `商为 ${texInline("x^2+1")}，余式为 0。` },
      { text: `商为 ${texInline("x^2-x")}，余式为 0。` },
      { text: "商和余式不唯一，可以换一组继续相等。" },
    ],
    steps: [
      `${texInline("x^4\\div x^2=x^2")}，减去 ${texInline("x^2(x^2+x+1)=x^4+x^3+x^2")}，余下 ${texInline("-x^3-x^2-1")}。`,
      `${texInline("-x^3\\div x^2=-x")}，减去 ${texInline("-x(x^2+x+1)=-x^3-x^2-x")}，余下 ${texInline("x-1")}。`,
      `${texInline("\\deg(x-1)=1<2")}，停止。`,
      `所以 ${texInline("x^4-1=(x^2-x)(x^2+x+1)+(x-1)")}；余式不为 0，不整除。`,
    ],
  },
  quiz: [
    {
      question: `用 ${texInline("x^2+1")} 除 ${texInline("x^3+x^2+x+1")}，商和余式是什么？`,
      answer: `商 ${texInline("x+1")}，余式 0，所以 ${texInline("x^2+1\\mid x^3+x^2+x+1")}。`,
    },
    {
      question: "为什么长除法一定在有限步内结束？",
      answer: "每一步余式的次数都严格下降，而次数是非负整数。",
    },
    {
      question: `非零常数 ${texInline("c")} 整除哪些多项式？`,
      answer: `整除所有多项式，因为 ${texInline("f=c\\cdot(c^{-1}f)")}。`,
    },
    {
      question: `若 ${texInline("h\\mid f")} 且 ${texInline("h\\mid g")}，${texInline("h")} 是否整除 ${texInline("f-qg")}？`,
      answer: `是，${texInline("f-qg")} 是 ${texInline("f,g")} 的组合。这正是下一节辗转相除法的依据。`,
    },
  ],
  summary: [
    `${texInline("g\\ne0")} 时，存在唯一的 ${texInline("q,r")} 使 ${texInline("f=qg+r")}，其中 ${texInline("r=0")} 或 ${texInline("\\deg r<\\deg g")}。`,
    `${texInline("g\\mid f")} 当且仅当余式为 0。`,
    "非零常数整除一切多项式；互相整除的两个多项式只差一个非零常数因子。",
  ],
});


;/* content/ch1-section4.js */
defineChapter1Section("gcd-polynomials", {
  number: "§4",
  textbookSection: "最大公因式",
  title: "最大公因式",
  navTitle: "最大公因式",
  question: "不分解因式，怎样求两个多项式的最大公因式？",
  goal: `掌握用辗转相除法求首一最大公因式，会写出 ${texInline("sf+tg=\\gcd(f,g)")}；理解互素的判定。`,
  tags: ["最大公因式", "辗转相除法", "互素"],
  intro: `若 ${texInline("f=qg+r")}，则 ${texInline("f,g")} 的公因式与 ${texInline("g,r")} 的公因式完全相同。于是反复做带余除法，余式次数不断下降，最后一个非零余式首一化后就是最大公因式。这就是辗转相除法。`,
  textbook: {
    reference: "北大版《高等代数》第一章 §4",
    items: ["最大公因式", "辗转相除法", "互素"],
  },
  formal: {
    title: "辗转相除法",
    equation: "f=qg+r\\ \\Longrightarrow\\ \\gcd(f,g)=\\gcd(g,r)",
    definitions: [
      {
        title: "最大公因式",
        text: `${texInline("d")} 是 ${texInline("f,g")} 的公因式，并且 ${texInline("f,g")} 的每个公因式都整除 ${texInline("d")}。首项系数为 1 的那个记作 ${texInline("\\gcd(f,g)")}。`,
      },
      {
        title: "线性组合表示",
        text: `存在 ${texInline("s,t\\in P[x]")} 使 ${texInline("sf+tg=\\gcd(f,g)")}。把辗转相除的各步倒着代回，就能求出一组 ${texInline("s,t")}。`,
      },
      {
        title: "互素",
        text: `${texInline("\\gcd(f,g)=1")} 时称 ${texInline("f,g")} 互素，这等价于存在 ${texInline("s,t")} 使 ${texInline("sf+tg=1")}。互素时，若 ${texInline("f\\mid gh")}，则 ${texInline("f\\mid h")}。`,
      },
    ],
    pitfalls: [
      "把次数较低的那个多项式直接当作最大公因式。",
      "忘记把最后的非零余式化成首一。",
      `认为 ${texInline("s,t")} 唯一：满足 ${texInline("sf+tg=\\gcd(f,g)")} 的 ${texInline("s,t")} 有无穷多组。`,
    ],
    note: "因式分解定理：不可约多项式与唯一分解。",
  },
  interactive: {
    type: "slot",
    title: "辗转相除法",
    description: `逐步取余，最后读出最大公因式和 ${texInline("s")}、${texInline("t")}。`,
    task: `先猜一猜，再逐步做完 ${texInline("\\gcd(x^4-1,x^3-1)")}：看余式次数阶梯降到 0 多项式时，前一个余式是什么；最后读出 ${texInline("s")}、${texInline("t")} 并代回验证，再换到“互素示例”比较。`,
  },
  example: {
    title: "例题：求最大公因式并写成组合",
    question: `求 ${texInline("\\gcd(x^4-1,x^3-1)")}，并写出一组 ${texInline("s,t")} 使 ${texInline("s(x^4-1)+t(x^3-1)=\\gcd(x^4-1,x^3-1)")}。`,
    choices: [
      { correct: true, text: `${texInline("\\gcd=x-1")}，可取 ${texInline("s=1,\\ t=-x")}。` },
      { text: `${texInline("\\gcd=x^3-1")}，因为它的次数较低。` },
      { text: `${texInline("\\gcd=1")}，两个多项式互素。` },
      { text: `${texInline("\\gcd=x^2-1")}，因为 ${texInline("x^4-1=(x^2-1)(x^2+1)")}。` },
    ],
    steps: [
      `${texInline("x^4-1=x(x^3-1)+(x-1)")}。`,
      `${texInline("x^3-1=(x^2+x+1)(x-1)")}，余式为 0。`,
      `最后的非零余式 ${texInline("x-1")} 已首一，所以 ${texInline("\\gcd=x-1")}。`,
      `由第一步，${texInline("x-1=1\\cdot(x^4-1)+(-x)(x^3-1)")}，即 ${texInline("s=1,\\ t=-x")}。`,
    ],
  },
  quiz: [
    {
      question: `求 ${texInline("\\gcd(x^2-1,\\ x^2-3x+2)")}。`,
      answer: `${texInline("x-1")}。两式相减得 ${texInline("3x-3")}，而 ${texInline("x-1")} 整除两者。`,
    },
    {
      question: `为什么 ${texInline("f=qg+r")} 时 ${texInline("\\gcd(f,g)=\\gcd(g,r)")}？`,
      answer: `整除 ${texInline("f,g")} 的多项式整除 ${texInline("r=f-qg")}；整除 ${texInline("g,r")} 的多项式整除 ${texInline("f=qg+r")}。两组公因式相同。`,
    },
    {
      question: "两个互素的多项式能有公共根吗？",
      answer: `不能。若 ${texInline("f(a)=g(a)=0")}，代入 ${texInline("sf+tg=1")} 得 ${texInline("0=1")}。`,
    },
    {
      question: `${texInline("f\\ne0")} 时，${texInline("\\gcd(f,0)")} 是什么？`,
      answer: `${texInline("f")} 除以它的首项系数所得的首一多项式。`,
    },
  ],
  summary: [
    "辗转相除：公因式在每一步不变，最后的非零余式首一化就是最大公因式。",
    `倒着代回得到 ${texInline("sf+tg=\\gcd(f,g)")}。`,
    `${texInline("f,g")} 互素当且仅当存在 ${texInline("s,t")} 使 ${texInline("sf+tg=1")}。`,
  ],
});


;/* content/ch1-section5.js */
defineChapter1Section("factorization-theorem", {
  number: "§5",
  textbookSection: "因式分解定理",
  title: "因式分解定理",
  navTitle: "因式分解定理",
  question: "多项式能否拆成不能再拆的因式之积？换一种拆法，结果会不会不同？",
  goal: "理解不可约多项式；掌握因式分解及唯一性定理和标准分解式。",
  tags: ["不可约", "因式分解", "唯一性"],
  intro: `次数 ${texInline("\\ge1")} 的多项式如果不能写成两个次数更低的多项式之积，就叫不可约。每个次数 ${texInline("\\ge1")} 的多项式都能分解成不可约多项式之积；除去因式的顺序和非零常数倍，分解是唯一的。`,
  textbook: {
    reference: "北大版《高等代数》第一章 §5",
    items: ["不可约多项式", "因式分解及唯一性定理", "标准分解式"],
  },
  formal: {
    title: "因式分解及唯一性",
    equation: "f(x)=c\\,p_1(x)^{r_1}p_2(x)^{r_2}\\cdots p_s(x)^{r_s}",
    definitions: [
      {
        title: "不可约多项式",
        text: `数域 ${texInline("P")} 上次数 ${texInline("\\ge1")} 的多项式 ${texInline("p")}，若不能写成 ${texInline("P")} 上两个次数都比 ${texInline("p")} 低的多项式之积，就称 ${texInline("p")} 在 ${texInline("P")} 上不可约。一次多项式都不可约。`,
      },
      {
        title: "关键性质",
        text: `若 ${texInline("p")} 不可约且 ${texInline("p\\mid fg")}，则 ${texInline("p\\mid f")} 或 ${texInline("p\\mid g")}。因为 ${texInline("p\\nmid f")} 时 ${texInline("\\gcd(p,f)=1")}，由上一节得 ${texInline("p\\mid g")}。唯一性由这条性质推出。`,
      },
      {
        title: "标准分解式",
        text: `上式中 ${texInline("c")} 是 ${texInline("f")} 的首项系数，${texInline("p_1,\\ldots,p_s")} 是互不相同的首一不可约多项式，${texInline("r_i")} 是正整数。`,
      },
    ],
    pitfalls: [
      `不说数域就判断不可约：${texInline("x^2+1")} 在 ${texInline("\\mathbb{R}")} 上不可约，在 ${texInline("\\mathbb{C}")} 上等于 ${texInline("(x-i)(x+i)")}。`,
      `用“没有根”判断高次多项式不可约：${texInline("x^4+4")} 没有实根，却等于 ${texInline("(x^2-2x+2)(x^2+2x+2)")}。`,
    ],
    note: `重因式：标准分解式中 ${texInline("r_i>1")} 的因式。`,
  },
  interactive: false,
  example: {
    title: "例题：在 Q、R、C 上分解 x⁴+4",
    question: `分别在 ${texInline("\\mathbb{Q}")}、${texInline("\\mathbb{R}")}、${texInline("\\mathbb{C}")} 上写出 ${texInline("x^4+4")} 的标准分解式。`,
    choices: [
      {
        correct: true,
        text: `在 ${texInline("\\mathbb{Q}")}、${texInline("\\mathbb{R}")} 上为 ${texInline("(x^2-2x+2)(x^2+2x+2)")}；在 ${texInline("\\mathbb{C}")} 上为 ${texInline("(x-1-i)(x-1+i)\\allowbreak(x+1-i)(x+1+i)")}。`,
      },
      { text: "三个数域上的分解完全相同。" },
      { text: `${texInline("x^4+4")} 没有实根，所以在 ${texInline("\\mathbb{R}")} 上不可约。` },
      { text: `在 ${texInline("\\mathbb{R}")} 上可以拆成四个一次因式。` },
    ],
    steps: [
      `配方：${texInline("x^4+4=(x^2+2)^2-(2x)^2=(x^2-2x+2)(x^2+2x+2)")}。`,
      `两个二次式的判别式都是 ${texInline("4-8=-4<0")}，没有实根，所以在 ${texInline("\\mathbb{R}")} 上（从而在 ${texInline("\\mathbb{Q}")} 上）不可约。`,
      `在 ${texInline("\\mathbb{C}")} 上，${texInline("x^2-2x+2")} 的根为 ${texInline("1\\pm i")}，${texInline("x^2+2x+2")} 的根为 ${texInline("-1\\pm i")}。`,
      "于是在复数域上得到四个一次因式。",
    ],
  },
  quiz: [
    {
      question: `写出 ${texInline("x^4-1")} 在 ${texInline("\\mathbb{R}")} 与 ${texInline("\\mathbb{C}")} 上的标准分解式。`,
      answer: `${texInline("\\mathbb{R}")}：${texInline("(x-1)(x+1)(x^2+1)")}；${texInline("\\mathbb{C}")}：${texInline("(x-1)(x+1)(x-i)(x+i)")}。`,
    },
    {
      question: `2 次或 3 次多项式在 ${texInline("P")} 上可约，当且仅当什么？`,
      answer: `它在 ${texInline("P")} 中有根。可约时必有一次因式，一次因式给出根；反之有根就有一次因式。`,
    },
    {
      question: `${texInline("p")} 不可约，${texInline("f")} 任意。${texInline("\\gcd(p,f)")} 可能是什么？`,
      answer: `只能是 1 或 ${texInline("p")} 的首一化：前者 ${texInline("p,f")} 互素，后者 ${texInline("p\\mid f")}。`,
    },
    {
      question: "为什么一次多项式总是不可约？",
      answer: "若它等于两个次数都比 1 低的多项式之积，这两个因式都是零次的，乘积也是零次，矛盾。",
    },
  ],
  summary: [
    "次数不小于 1 的多项式都能分解成不可约多项式之积，除顺序和常数倍外唯一。",
    `唯一性的关键：不可约的 ${texInline("p")} 整除 ${texInline("fg")} 时，必整除其中一个。`,
    "不可约与否取决于数域；高次多项式没有根也可能可约。",
  ],
});


;/* content/ch1-section6.js */
defineChapter1Section("multiple-factors", {
  number: "§6",
  textbookSection: "重因式",
  title: "重因式",
  navTitle: "重因式",
  question: "怎样判断一个多项式有没有重因式？两个根靠在一起时会发生什么？",
  goal: `理解 ${texInline("m")} 重因式与重根；会用 ${texInline("\\gcd(f,f')")} 判断有无重因式。`,
  tags: ["重因式", "重根", "导数"],
  intro: `若不可约多项式 ${texInline("p")} 满足 ${texInline("p^m\\mid f")}、${texInline("p^{m+1}\\nmid f")}，就称 ${texInline("p")} 是 ${texInline("f")} 的 ${texInline("m")} 重因式，${texInline("m\\ge2")} 时叫重因式；${texInline("p=x-a")} 时说 ${texInline("a")} 是 ${texInline("m")} 重根。${texInline("m")} 重因式是 ${texInline("f'")} 的 ${texInline("m-1")} 重因式，所以 ${texInline("f")} 没有重因式当且仅当 ${texInline("\\gcd(f,f')=1")}。`,
  textbook: {
    reference: "北大版《高等代数》第一章 §6",
    items: ["重因式与重数", "重因式的判别"],
  },
  formal: {
    title: "导数与重因式",
    equation: "\\begin{gathered}f=(x-a)^m h,\\quad h(a)\\ne0\\\\ f'=(x-a)^{m-1}\\bigl[m\\,h+(x-a)h'\\bigr]\\end{gathered}",
    definitions: [
      {
        title: "为什么降一重",
        text: `上式方括号在 ${texInline("x=a")} 处等于 ${texInline("m\\,h(a)\\ne0")}，所以 ${texInline("a")} 恰好是 ${texInline("f'")} 的 ${texInline("m-1")} 重根。`,
      },
      {
        title: "判别法",
        text: `${texInline("f")} 没有重因式 ${texInline("\\iff\\gcd(f,f')=1")}。${texInline("f/\\gcd(f,f')")} 与 ${texInline("f")} 有相同的不可约因式，但每个只出现一次。`,
      },
      {
        title: "实根处的图像",
        text: `${texInline("m\\ge2")} 时曲线在该点与 ${texInline("x")} 轴相切；${texInline("m")} 为奇数时穿过 ${texInline("x")} 轴，为偶数时不穿过。两个单根靠得再近，曲线也穿过两次，只有重合时才相切。`,
      },
    ],
    pitfalls: [
      `看图估重数：两个很近的单根在图上像相切，但 ${texInline("\\gcd(f,f')=1")}。`,
      `把 ${texInline("\\gcd(f,f')")} 当成重因式的全部：${texInline("m")} 重因式在其中只出现 ${texInline("m-1")} 次。`,
    ],
    note: "多项式函数：代入、余数定理与根的个数。",
  },
  interactive: {
    type: "slot",
    title: "两根合并与重数",
    description: "让两个单根合并，再比较不同重数的图像。",
    task: `先猜一猜，再拖动 ${texInline("u")}、${texInline("v")} 让两根靠近，或点“令 ${texInline("v=u")}，两根合并”。下方画的是同一横轴上的 ${texInline("f'")}，看它的零点和 ${texInline("f")} 的根什么时候重合；再切到“单根重数”比较 ${texInline("m=1,2,3,4")}。`,
  },
  example: {
    title: "例题：求重根并用导数验证",
    question: `设 ${texInline("f(x)=x^5-2x^4+x^3")}。求各根的重数与 ${texInline("\\gcd(f,f')")}，并说明实图像在各根附近是否穿过 ${texInline("x")} 轴。`,
    choices: [
      {
        correct: true,
        text: `${texInline("f=x^3(x-1)^2")}：0 是 3 重根，1 是 2 重根；${texInline("\\gcd(f,f')=x^2(x-1)")}。`,
      },
      { text: `0 与 1 都是单根，${texInline("\\gcd(f,f')=1")}。` },
      { text: `${texInline("\\gcd(f,f')=f")}，因为 ${texInline("f")} 与 ${texInline("f'")} 有公共根。` },
      { text: "0 是 2 重根，1 是 3 重根。" },
    ],
    steps: [
      `${texInline("f=x^3(x^2-2x+1)=x^3(x-1)^2")}，所以 0 是 3 重根，1 是 2 重根。`,
      `${texInline("f'=5x^4-8x^3+3x^2=x^2(x-1)(5x-3)")}。`,
      `公共部分为 ${texInline("x^2(x-1)")}，与“每个重数减 1”一致。`,
      `0 的重数为奇数，曲线相切并穿过 ${texInline("x")} 轴；1 的重数为偶数，曲线相切后折回。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("x=1")} 是 ${texInline("f=x^3-3x+2")} 的几重根？`,
      answer: `2 重：${texInline("f(1)=0")}，${texInline("f'(1)=3-3=0")}，${texInline("f''(1)=6\\ne0")}；实际上 ${texInline("f=(x-1)^2(x+2)")}。`,
    },
    {
      question: `${texInline("\\gcd(f,f')=1")} 时，${texInline("f")} 在复数域中会有重根吗？`,
      answer: "不会。最大公因式由辗转相除求得，不随数域扩大而改变，所以在复数域中也没有重因式。",
    },
    {
      question: `${texInline("u\\ne v")} 但两者非常接近时，${texInline("(x-u)(x-v)")} 有重根吗？`,
      answer: `没有，${texInline("\\gcd(f,f')=1")}；只有 ${texInline("u=v")} 时才是二重根。`,
    },
    {
      question: `${texInline("a")} 是 ${texInline("f")} 的 ${texInline("m")} 重根时，各阶导数在 ${texInline("a")} 处的值有什么规律？`,
      answer: `${texInline("f(a)=f'(a)=\\cdots=f^{(m-1)}(a)=0")}，而 ${texInline("f^{(m)}(a)\\ne0")}。`,
    },
  ],
  summary: [
    `${texInline("m")} 重因式是 ${texInline("f'")} 的 ${texInline("m-1")} 重因式。`,
    `${texInline("f")} 没有重因式当且仅当 ${texInline("\\gcd(f,f')=1")}。`,
    `两个根只有精确重合才成为重根；实根处重数不小于 2 时曲线与 ${texInline("x")} 轴相切。`,
  ],
});


;/* content/ch1-section7.js */
defineChapter1Section("polynomial-functions", {
  number: "§7",
  textbookSection: "多项式函数",
  title: "多项式函数",
  navTitle: "多项式函数",
  question: `把一个数代入多项式会得到什么？为什么 ${texInline("n")} 次多项式最多有 ${texInline("n")} 个根？`,
  goal: "掌握余数定理与因式定理；理解根的个数上界与多项式函数的相等；会用拉格朗日插值公式构造多项式。",
  tags: ["余数定理", "根的个数", "插值"],
  intro: `用 ${texInline("x-a")} 除 ${texInline("f(x)")}，余式是常数；在等式中令 ${texInline("x=a")}，便知这个常数就是 ${texInline("f(a)")}。所以 ${texInline("a")} 是根当且仅当 ${texInline("(x-a)\\mid f")}。每个根贡献一个一次因式，因此 ${texInline("n")} 次多项式在数域中至多有 ${texInline("n")} 个根（重根按重数计）。`,
  textbook: {
    reference: "北大版《高等代数》第一章 §7",
    items: ["余数定理", "根的个数", "多项式函数的相等"],
  },
  formal: {
    title: "余数定理与根",
    equation: "f(x)=(x-a)\\,q(x)+f(a)",
    definitions: [
      {
        title: "综合除法",
        text: `从首项系数开始，反复“乘 ${texInline("a")} 再加下一个系数”，最后得到 ${texInline("f(a)")}；中间依次得到的数正是商 ${texInline("q(x)")} 的系数。`,
      },
      {
        title: "函数相等与多项式相等",
        text: `若 ${texInline("f,g")} 的次数都不超过 ${texInline("n")}，且在 ${texInline("n+1")} 个不同的数处取值相同，则 ${texInline("f=g")}，因为 ${texInline("f-g")} 的根太多。所以数域上两个多项式函数相等，当且仅当两个多项式相等。`,
      },
      {
        title: "拉格朗日插值公式",
        text: `横坐标互异的 ${texInline("n+1")} 个点确定唯一一个次数不超过 ${texInline("n")} 的多项式：${texInline("L(x)=\\sum_i y_i\\prod_{j\\ne i}\\dfrac{x-x_j}{x_i-x_j}")}。`,
      },
    ],
    pitfalls: [
      `以为 ${texInline("n")} 次多项式一定有 ${texInline("n")} 个根：${texInline("x^2+1")} 在 ${texInline("\\mathbb{R}")} 中没有根，上界只说“至多”。`,
      "插值节点的横坐标重复时仍套用拉格朗日插值公式，分母会等于 0。",
    ],
    note: "复系数与实系数多项式的因式分解：把根放到复平面上。",
  },
  interactive: {
    type: "slot",
    title: "代入、根数与插值",
    description: "综合除法、根数上界与拉格朗日插值。",
    task: `先猜一猜，再把不同根的个数 ${texInline("m")} 拖到超过次数 ${texInline("n")}，看曲线还能不能穿过所有根。“求值 / 综合除法”里移动 ${texInline("a")} 看 ${texInline("f(a)")} 何时为 0；“拉格朗日插值”里修改三个节点。`,
  },
  example: {
    title: "例题：三点确定一个二次多项式",
    question: `求次数不超过 2 且满足 ${texInline("f(0)=1,\\ f(1)=2,\\ f(2)=5")} 的多项式。`,
    choices: [
      { correct: true, text: `${texInline("f(x)=x^2+1")}。` },
      { text: `${texInline("f(x)=x+1")}。` },
      { text: `${texInline("f(x)=2x^2+1")}。` },
      { text: "过三个点的这种多项式不唯一。" },
    ],
    steps: [
      `拉格朗日插值基函数：${texInline("L_0=\\tfrac{(x-1)(x-2)}{2}")}，${texInline("L_1=-x(x-2)")}，${texInline("L_2=\\tfrac{x(x-1)}{2}")}。`,
      `${texInline("f=1\\cdot L_0+2L_1+5L_2")}，展开合并得 ${texInline("f=x^2+1")}。`,
      `检验：${texInline("f(0)=1,\\ f(1)=2,\\ f(2)=5")}。次数不超过 2 的这种多项式只有一个。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("x^4-3x^2+2x+5")} 除以 ${texInline("x-2")} 的余式是多少？`,
      answer: `${texInline("f(2)=16-12+4+5=13")}。`,
    },
    {
      question: `${texInline("f,g")} 的次数都不超过 3，且在 0、1、2、3 处取值相同，能推出什么？`,
      answer: `${texInline("f=g")}。${texInline("f-g")} 若非零，次数不超过 3，却有 4 个根，矛盾。`,
    },
    {
      question: `过点 ${texInline("(0,1),(1,2),(2,5)")} 的多项式只有 ${texInline("x^2+1")} 一个吗？`,
      answer: `次数不超过 2 的只有这一个；次数更高的有无穷多个，例如 ${texInline("x^2+1+c\\,x(x-1)(x-2)")}。`,
    },
    {
      question: `用综合除法计算 ${texInline("f(a)")} 时，中间得到的数有什么意义？`,
      answer: `依次是商 ${texInline("q(x)")} 的系数，最后一个数是余数 ${texInline("f(a)")}。`,
    },
  ],
  summary: [
    `${texInline("f")} 除以 ${texInline("x-a")} 的余式是 ${texInline("f(a)")}；${texInline("f(a)=0\\iff(x-a)\\mid f")}。`,
    `${texInline("n")} 次多项式在数域中至多有 ${texInline("n")} 个根，所以多项式函数相等与多项式相等是一回事。`,
    `横坐标互异的 ${texInline("n+1")} 个点唯一确定次数不超过 ${texInline("n")} 的多项式。`,
  ],
});


;/* content/ch1-section8.js */
defineChapter1Section("complex-real-factorization", {
  number: "§8",
  textbookSection: "复系数与实系数多项式的因式分解",
  title: "复系数与实系数多项式的因式分解",
  navTitle: "实复因式分解",
  question: "为什么复系数多项式总能拆成一次因式？实系数多项式的虚根为什么成对出现？",
  goal: "理解代数基本定理与复系数多项式的分解；掌握实系数多项式的共轭根性质与实数域上的分解。",
  tags: ["代数基本定理", "共轭根", "实二次因式"],
  intro: `代数基本定理：每个次数 ${texInline("\\ge1")} 的复系数多项式在 ${texInline("\\mathbb{C}")} 中至少有一个根。反复提出一次因式，复系数多项式就分解为一次因式之积。系数都是实数时，${texInline("f(\\bar z)=\\overline{f(z)}")}，所以虚根 ${texInline("\\alpha")} 与 ${texInline("\\bar\\alpha")} 成对出现，合成一个实系数二次因式。`,
  textbook: {
    reference: "北大版《高等代数》第一章 §8",
    items: ["代数基本定理", "复系数多项式的分解", "实系数多项式的分解"],
  },
  formal: {
    title: "共轭根与实二次因式",
    equation: "\\begin{aligned}&\\bigl(x-(a+bi)\\bigr)\\bigl(x-(a-bi)\\bigr)\\\\ &\\quad=x^2-2ax+a^2+b^2\\end{aligned}",
    definitions: [
      {
        title: "复数域上的分解",
        text: `次数 ${texInline("n\\ge1")} 的复系数多项式可写成 ${texInline("f=a_n(x-\\alpha_1)\\cdots(x-\\alpha_n)")}，${texInline("\\alpha_i")} 可以相同。复数域上的不可约多项式只有一次式。`,
      },
      {
        title: "共轭根",
        text: `实系数多项式若有虚根 ${texInline("\\alpha")}，则 ${texInline("\\bar\\alpha")} 也是根，且重数相同。上式中 ${texInline("b\\ne0")} 时判别式为 ${texInline("-4b^2<0")}。`,
      },
      {
        title: "实数域上的分解",
        text: "实数域上的不可约多项式只有一次式和判别式小于 0 的二次式；每个实系数多项式都能分解成这两类因式之积。",
      },
    ],
    pitfalls: [
      `以为实系数多项式只有实根：${texInline("x^2+1")} 的根是 ${texInline("\\pm i")}。`,
      `构造实系数多项式时只放一个虚根：${texInline("\\alpha")} 是根时 ${texInline("\\bar\\alpha")} 必须同时出现。`,
    ],
    note: "有理系数多项式：有理根与艾森斯坦判别法。",
  },
  interactive: {
    type: "slot",
    title: "共轭根",
    description: "在复平面上拖动根，观察二次因式的系数。",
    task: `先猜一猜，再拖动 ${texInline("\\beta")}：${texInline("\\beta")} 在紫色水平虚线上时根之和是实数，在过原点、方向为 ${texInline("\\bar\\alpha")} 的绿线上时根之积是实数。最后切到“实系数：共轭锁”拖动 ${texInline("\\alpha")}。`,
  },
  example: {
    title: "例题：由虚根写出实因式",
    question: `实系数多项式以 ${texInline("1+2i")} 为 3 重根。它还必须有哪个根？写出由这些根给出的次数最低的实系数首一因式。`,
    choices: [
      { correct: true, text: `${texInline("1-2i")} 也是 3 重根；因式为 ${texInline("(x^2-2x+5)^3")}。` },
      { text: `${texInline("1-2i")} 只需出现一次；因式为 ${texInline("x^2-2x+5")}。` },
      { text: `实系数多项式不能有 ${texInline("1+2i")} 这个根。` },
      { text: `${texInline("(x-1)^3")} 已经是所需实因式。` },
    ],
    steps: [
      `实系数多项式的虚根成对出现，且重数相同，所以 ${texInline("1-2i")} 也是 3 重根。`,
      `${texInline("(x-(1+2i))(x-(1-2i))=x^2-2x+5")}。`,
      `每个一次因式出现 3 次，所以因式为 ${texInline("(x^2-2x+5)^3")}，次数为 6。`,
    ],
  },
  quiz: [
    {
      question: `以 ${texInline("2+i")} 为根的二次首一实系数多项式是什么？`,
      answer: `${texInline("x^2-4x+5")}。`,
    },
    {
      question: "奇数次实系数多项式一定有实根吗？",
      answer: "一定。虚根成对出现，个数（按重数计）是偶数，而根的总数是奇数。",
    },
    {
      question: `${texInline("x^4+1")} 在实数域上可约吗？`,
      answer: `可约：${texInline("x^4+1=(x^2+1)^2-2x^2=(x^2-\\sqrt2x+1)(x^2+\\sqrt2x+1)")}。`,
    },
    {
      question: "把共轭根的虚部拖到 0，二次因式变成什么？",
      answer: `两根重合于实轴上的 ${texInline("a")}，二次因式变成 ${texInline("(x-a)^2")}。`,
    },
  ],
  summary: [
    "复系数多项式能分解为一次因式之积。",
    "实系数多项式的虚根成共轭对出现，重数相同。",
    "实数域上的不可约多项式只有一次式和判别式小于 0 的二次式。",
  ],
});


;/* content/ch1-section9.js */
defineChapter1Section("rational-polynomials", {
  number: "§9",
  textbookSection: "有理系数多项式",
  title: "有理系数多项式",
  navTitle: "有理系数",
  question: "怎样找出有理系数多项式的有理根？怎样证明它在有理数域上不可约？",
  goal: "理解本原多项式与高斯引理；掌握有理根的求法和艾森斯坦判别法。",
  tags: ["本原多项式", "有理根", "艾森斯坦判别法"],
  intro: `有理系数多项式乘上适当的整数就成为整系数多项式，可约性不变。系数互素的整系数多项式叫本原多项式。由高斯引理，整系数多项式若能分解成两个次数更低的有理系数多项式之积，也能分解成两个次数更低的整系数多项式之积。`,
  textbook: {
    reference: "北大版《高等代数》第一章 §9",
    items: ["本原多项式与高斯引理", "有理根", "艾森斯坦判别法"],
  },
  formal: {
    title: "有理根与不可约判别",
    equation: "\\begin{gathered}\\tfrac rs\\ \\text{是}\\ a_nx^n+\\cdots+a_0\\ \\text{的根},\\quad\\gcd(r,s)=1\\\\ \\Longrightarrow\\quad s\\mid a_n,\\quad r\\mid a_0\\end{gathered}",
    definitions: [
      {
        title: "高斯引理",
        text: "两个本原多项式的乘积仍是本原多项式。",
      },
      {
        title: "有理根",
        text: `整系数多项式的有理根 ${texInline("r/s")}（既约）满足上式，所以候选只有有限个，逐个代入检验即可。`,
      },
      {
        title: "艾森斯坦判别法",
        text: `整系数 ${texInline("f=a_nx^n+\\cdots+a_0")}，若有素数 ${texInline("p")} 使 ${texInline("p\\nmid a_n")}，${texInline("p")} 整除 ${texInline("a_{n-1},\\ldots,a_0")}，且 ${texInline("p^2\\nmid a_0")}，则 ${texInline("f")} 在有理数域上不可约。条件不满足时，不能由此断定可约。`,
      },
    ],
    pitfalls: [
      `没有有理根就断言不可约：这只对 2、3 次成立；${texInline("x^4+4")} 没有有理根，却可约。`,
      "列有理根候选时漏掉负数。",
    ],
    note: "多元多项式：多个变量的单项式、次数与齐次成分。",
  },
  interactive: false,
  example: {
    title: "例题：艾森斯坦判别法与有理根",
    question: `(1) 证明 ${texInline("x^5+10x+5")} 在 ${texInline("\\mathbb{Q}")} 上不可约。(2) 列出 ${texInline("2x^3+x^2-x-1")} 的全部有理根候选，并判断它在 ${texInline("\\mathbb{Q}")} 上是否可约。`,
    choices: [
      {
        correct: true,
        text: `(1) 取 ${texInline("p=5")} 用艾森斯坦判别法；(2) 候选为 ${texInline("\\pm1,\\pm\\frac12")}，都不是根，它是三次的，所以在 ${texInline("\\mathbb{Q}")} 上不可约。`,
      },
      { text: `(1) 没有整数根，所以不可约；(2) 候选只有 ${texInline("\\pm1")}。` },
      { text: `(1) 应取 ${texInline("p=2")}；(2) 候选为 ${texInline("\\pm2")}。` },
      { text: "(2) 有理根候选只由常数项决定，与首项系数无关。" },
    ],
    steps: [
      `(1) ${texInline("5\\nmid1")}；5 整除 0、0、0、10、5；${texInline("25\\nmid5")}。艾森斯坦判别法的条件成立，不可约。`,
      `(2) 既约根 ${texInline("r/s")} 满足 ${texInline("r\\mid-1")}、${texInline("s\\mid2")}，候选为 ${texInline("\\pm1,\\pm\\frac12")}。`,
      `代入：${texInline("f(1)=1,\\ f(-1)=-1,\\ f(\\tfrac12)=-1,\\ f(-\\tfrac12)=-\\tfrac12")}，都不为 0。`,
      "三次多项式若可约必有一次因式，从而有有理根；这里没有，所以不可约。",
    ],
  },
  quiz: [
    {
      question: `${texInline("x^3-2")} 在 ${texInline("\\mathbb{Q}")} 上可约吗？`,
      answer: `不可约。取 ${texInline("p=2")} 满足艾森斯坦判别法的条件（也可以验证它没有有理根）。`,
    },
    {
      question: `求 ${texInline("2x^3-3x^2+1")} 的有理根。`,
      answer: `候选为 ${texInline("\\pm1,\\pm\\frac12")}；代入得根 ${texInline("1")}（二重）和 ${texInline("-\\frac12")}，即 ${texInline("2x^3-3x^2+1=(x-1)^2(2x+1)")}。`,
    },
    {
      question: "为什么没有有理根的三次有理系数多项式在有理数域上不可约？",
      answer: "若可约，两个因式中必有一个是一次的，它给出一个有理根。",
    },
    {
      question: `${texInline("x^4+1")} 能直接用艾森斯坦判别法吗？`,
      answer: `不能直接用。令 ${texInline("x=y+1")}，得 ${texInline("y^4+4y^3+6y^2+4y+2")}，对 ${texInline("p=2")} 满足条件，所以 ${texInline("x^4+1")} 在 ${texInline("\\mathbb{Q}")} 上不可约。`,
    },
  ],
  summary: [
    "有理系数的分解问题可以化为整系数问题，高斯引理保证可约性不变。",
    `有理根 ${texInline("r/s")} 满足 ${texInline("s\\mid a_n")}、${texInline("r\\mid a_0")}，候选要逐个检验。`,
    "艾森斯坦判别法给出不可约的充分条件；条件不满足时不能断定可约。",
  ],
});


;/* content/ch1-section10.js */
defineChapter1Section("multivariate-polynomials", {
  number: "§10",
  textbookSection: "多元多项式",
  title: "多元多项式",
  navTitle: "多元多项式",
  question: "有多个变量时，多项式的各项怎样排列？次数怎样定义？",
  goal: `理解 ${texInline("n")} 元多项式、次数与字典排列法；掌握齐次多项式与齐次成分。`,
  tags: ["多元多项式", "次数", "齐次成分"],
  intro: `单项式 ${texInline("a\\,x_1^{k_1}\\cdots x_n^{k_n}")} 的次数是 ${texInline("k_1+\\cdots+k_n")}；多项式的次数是系数非零的各项次数的最大值。两个变量时，把 ${texInline("x^iy^j")} 放在格点 ${texInline("(i,j)")} 上：同类项落在同一点，单项式相乘就是指数向量相加。`,
  textbook: {
    reference: "北大版《高等代数》第一章 §10",
    items: [`${texInline("n")} 元多项式与次数`, "字典排列法", "齐次多项式"],
  },
  formal: {
    title: "次数与齐次成分",
    equation: "x^iy^j\\cdot x^ky^\\ell=x^{i+k}y^{j+\\ell}",
    definitions: [
      {
        title: "同类项与次数",
        text: `指数完全相同的单项式是同类项。${texInline("x^3y^2+x^2y^5")} 的次数是 7；关于 ${texInline("x")} 的次数是 3，关于 ${texInline("y")} 的次数是 5。`,
      },
      {
        title: "齐次成分",
        text: `各项次数都等于 ${texInline("m")} 的多项式叫 ${texInline("m")} 次齐次多项式。每个多项式都能唯一写成 ${texInline("f=f_0+f_1+\\cdots+f_d")}，${texInline("f_i")} 是 ${texInline("i")} 次齐次成分。`,
      },
      {
        title: "字典排列法",
        text: `先比 ${texInline("x_1")} 的指数，相同再比 ${texInline("x_2")} 的指数……从大到小排列，第一项叫首项。两个非零多项式乘积的首项等于首项之积，所以乘积不为零。`,
      },
    ],
    pitfalls: [
      "把某一个变量的次数当成多项式的次数。",
      "把字典序的首项当成次数最高的项：它们可以不同。",
    ],
    note: "对称多项式：交换变量后不变的多项式。",
  },
  interactive: {
    type: "slot",
    title: "指数格点",
    description: "点击格点读取单项式，按次数分层，观察乘法。",
    task: `点击格点读出单项式和它的次数，按 ${texInline("d=0,1,2,3")} 查看齐次成分；先猜一猜，再切到“乘法合成”，看两个指数向量首尾相接落在哪一点。`,
  },
  example: {
    title: "例题：次数与齐次成分",
    question: `对 ${texInline("f=x^3+2x^2y-xy^2+4y^3+x-1")}，求次数并写出各齐次成分。`,
    choices: [
      {
        correct: true,
        text: `次数为 3；${texInline("f_3=x^3+2x^2y-xy^2+4y^3")}，${texInline("f_2=0")}，${texInline("f_1=x")}，${texInline("f_0=-1")}。`,
      },
      { text: `次数为 6，因为 ${texInline("x^3")} 与 ${texInline("y^3")} 的指数相加。` },
      { text: `${texInline("f_3=x^3+4y^3")}，交叉项不属于三次齐次成分。` },
      { text: "多元多项式没有次数。" },
    ],
    steps: [
      "逐项求次数：3、3、3、3、1、0，最大为 3。",
      `次数为 3 的四项组成 ${texInline("f_3")}；没有 2 次项，${texInline("f_2=0")}。`,
      `${texInline("f_1=x")}，${texInline("f_0=-1")}。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("(x+y+z)^3")} 中 ${texInline("x^2y")} 的系数是多少？`,
      answer: `3。三个因子中选两个出 ${texInline("x")}、一个出 ${texInline("y")}，有 3 种选法。`,
    },
    {
      question: `按字典序（${texInline("x")} 先于 ${texInline("y")}），${texInline("xy^5+x^3y^2-y")} 的首项和次数各是什么？`,
      answer: `首项是 ${texInline("x^3y^2")}（${texInline("x")} 的指数最大），次数是 6（来自 ${texInline("xy^5")}）。`,
    },
    {
      question: "两个非零的 2 次齐次多项式之积是什么？",
      answer: "4 次齐次多项式：每一项都是两个 2 次单项式之积。",
    },
    {
      question: `${texInline("x^2y")} 与 ${texInline("xy^2")} 是同类项吗？`,
      answer: `不是，指数向量分别是 ${texInline("(2,1)")} 与 ${texInline("(1,2)")}。`,
    },
  ],
  summary: [
    "多元单项式由指数向量确定，次数是各指数之和。",
    "单项式相乘，指数向量相加；按次数分组得到唯一的齐次成分。",
    "字典排列法下，非零多项式乘积的首项等于首项之积。",
  ],
});


;/* content/ch1-section11.js */
defineChapter1Section("symmetric-polynomials", {
  number: "§11",
  textbookSection: "对称多项式",
  title: "对称多项式",
  navTitle: "对称多项式",
  question: "交换任意两个变量后保持不变的多项式有什么结构？",
  goal: "理解对称多项式与初等对称多项式；掌握对称多项式基本定理，会用初等对称多项式表示简单的对称多项式。",
  tags: ["对称多项式", "初等对称多项式", "根与系数"],
  intro: `若交换任意两个变量 ${texInline("x_i,x_j")}，${texInline("f(x_1,\\ldots,x_n)")} 都不变，就称 ${texInline("f")} 为对称多项式。最基本的是初等对称多项式 ${texInline("\\sigma_1,\\ldots,\\sigma_n")}。基本定理：每个对称多项式都能唯一地表示成 ${texInline("\\sigma_1,\\ldots,\\sigma_n")} 的多项式。`,
  textbook: {
    reference: "北大版《高等代数》第一章 §11",
    items: ["对称多项式", "初等对称多项式", "对称多项式基本定理"],
  },
  formal: {
    title: "初等对称多项式",
    equation: "\\sigma_k=\\sum_{1\\le i_1<\\cdots<i_k\\le n}x_{i_1}x_{i_2}\\cdots x_{i_k}",
    definitions: [
      {
        title: "判断对称",
        text: `要对所有交换都不变。${texInline("x^2y+y^2z+z^2x")} 在轮换 ${texInline("x\\to y\\to z\\to x")} 下不变，但交换 ${texInline("x,y")} 后变为 ${texInline("y^2x+x^2z+z^2y")}，所以它不是对称多项式。`,
      },
      {
        title: "基本定理的证法",
        text: `取 ${texInline("f")} 按字典序的首项 ${texInline("a\\,x_1^{l_1}\\cdots x_n^{l_n}")}，必有 ${texInline("l_1\\ge\\cdots\\ge l_n")}。减去 ${texInline("a\\,\\sigma_1^{l_1-l_2}\\sigma_2^{l_2-l_3}\\cdots\\sigma_n^{l_n}")}，首项变小；有限步后得到 0。`,
      },
      {
        title: "根与系数",
        text: `若 ${texInline("x^n+a_1x^{n-1}+\\cdots+a_n")} 的根为 ${texInline("\\alpha_1,\\ldots,\\alpha_n")}，则 ${texInline("a_k=(-1)^k\\sigma_k(\\alpha_1,\\ldots,\\alpha_n)")}。于是根的任何对称多项式都能用系数表示。`,
      },
    ],
    pitfalls: [
      "只检查轮换就断定对称，如上面的例子。",
      `用根与系数的关系时漏掉符号 ${texInline("(-1)^k")}。`,
    ],
    noteLabel: "下一章",
    note: "行列式。",
  },
  interactive: false,
  example: {
    title: "例题：用初等对称多项式表示",
    question: `三个变量时，用 ${texInline("\\sigma_1,\\sigma_2,\\sigma_3")} 表示 ${texInline("x^2+y^2+z^2")} 与 ${texInline("x^2y+x^2z+y^2x+y^2z+z^2x+z^2y")}。`,
    choices: [
      {
        correct: true,
        text: `${texInline("x^2+y^2+z^2=\\sigma_1^2-2\\sigma_2")}；六项之和为 ${texInline("\\sigma_1\\sigma_2-3\\sigma_3")}。`,
      },
      { text: `两式分别等于 ${texInline("\\sigma_1^2")} 与 ${texInline("\\sigma_1\\sigma_2")}。` },
      { text: `第一式等于 ${texInline("\\sigma_2")}，第二式等于 ${texInline("\\sigma_3")}。` },
      { text: "对称多项式不能用有限个初等对称多项式表示。" },
    ],
    steps: [
      `${texInline("\\sigma_1^2=(x+y+z)^2=x^2+y^2+z^2+2\\sigma_2")}，所以 ${texInline("x^2+y^2+z^2=\\sigma_1^2-2\\sigma_2")}。`,
      `展开 ${texInline("\\sigma_1\\sigma_2=(x+y+z)(xy+xz+yz)")}：六个 ${texInline("x^2y")} 型的项各出现一次。`,
      `${texInline("xyz")} 由 ${texInline("x\\cdot yz,\\ y\\cdot xz,\\ z\\cdot xy")} 出现 3 次，所以六项之和为 ${texInline("\\sigma_1\\sigma_2-3\\sigma_3")}。`,
    ],
  },
  quiz: [
    {
      question: `用 ${texInline("\\sigma_1,\\sigma_2,\\sigma_3")} 表示 ${texInline("x^3+y^3+z^3")}。`,
      answer: `${texInline("\\sigma_1^3-3\\sigma_1\\sigma_2+3\\sigma_3")}。`,
    },
    {
      question: `${texInline("\\alpha,\\beta,\\gamma")} 是 ${texInline("x^3-2x+5")} 的根，求 ${texInline("\\alpha^2+\\beta^2+\\gamma^2")}。`,
      answer: `${texInline("\\sigma_1=0,\\ \\sigma_2=-2")}，所以 ${texInline("\\sigma_1^2-2\\sigma_2=4")}。`,
    },
    {
      question: "基本定理证明中的消去过程为什么一定会结束？",
      answer: `每一步首项按字典序严格变小；而满足 ${texInline("l_1\\ge\\cdots\\ge l_n")} 且不超过原首项的指数组只有有限个。`,
    },
    {
      question: `四个变量时 ${texInline("\\sigma_2")} 有几项？`,
      answer: `${texInline("\\binom42=6")} 项。`,
    },
  ],
  summary: [
    "对称多项式在交换任意两个变量后不变；只在轮换下不变还不够。",
    "每个对称多项式都能唯一表示成初等对称多项式的多项式。",
    `根与系数的关系：${texInline("a_k=(-1)^k\\sigma_k(\\alpha_1,\\ldots,\\alpha_n)")}。`,
  ],
});


;/* content/ch1.js */
registerAlgebraChapter({
  id: "ch1",
  icon: "1",
  title: "第一章 多项式",
  subtitle: "数域 · 整除 · 分解 · 对称",
  summary:
    "先固定系数所在的数域，把一元多项式建立为有位置的形式对象；再用带余除法和欧几里得算法研究整除与最大公因式；随后进入不可约分解、重因式、多项式函数以及实复、有理系数分解；最后把一元结构推广到多元和对称多项式。",
  sections: [
    { id: "number-fields", number: "§1", title: "数域", navTitle: "数域" },
    { id: "univariate-polynomials", number: "§2", title: "一元多项式", navTitle: "一元多项式" },
    { id: "polynomial-divisibility", number: "§3", title: "整除的概念", navTitle: "整除的概念" },
    { id: "gcd-polynomials", number: "§4", title: "最大公因式", navTitle: "最大公因式" },
    { id: "factorization-theorem", number: "§5", title: "因式分解定理", navTitle: "因式分解定理" },
    { id: "multiple-factors", number: "§6", title: "重因式", navTitle: "重因式" },
    { id: "polynomial-functions", number: "§7", title: "多项式函数", navTitle: "多项式函数" },
    { id: "complex-real-factorization", number: "§8", title: "复系数与实系数多项式的因式分解", navTitle: "实复因式分解" },
    { id: "rational-polynomials", number: "§9", title: "有理系数多项式", navTitle: "有理系数" },
    { id: "multivariate-polynomials", number: "§10", title: "多元多项式", navTitle: "多元多项式" },
    { id: "symmetric-polynomials", number: "§11", title: "对称多项式", navTitle: "对称多项式" },
  ],
});


;/* content/ch1-assemble.js */
/* Apply the section patches after ch1.js has registered the base chapter. */
(() => {
  const chapter = algebraContent.chapters.find((item) => item.id === "ch1");
  const patches = window.getChapter1SectionPatches?.();
  if (!chapter || !patches) return;

  chapter.sections = chapter.sections.map((section) => {
    if (!section || typeof section !== "object") return section;
    const patch = patches.get(section.id);
    return patch ? { ...section, ...patch } : section;
  });
})();


;/* content/ch2-registry.js */
/*
 * Chapter 2 section data registry.
 */
(() => {
  const patches = new Map();

  window.defineChapter2Section = function defineChapter2Section(sectionId, patch) {
    if (!sectionId || !patch || typeof patch !== "object") {
      throw new TypeError("Chapter 2 section patches require an id and an object.");
    }
    patches.set(sectionId, patch);
  };

  window.getChapter2SectionPatches = function getChapter2SectionPatches() {
    return patches;
  };
})();


;/* content/ch2-section1.js */
defineChapter2Section("determinant-intro", {
  number: "§1",
  textbookSection: "引言",
  title: "引言",
  navTitle: "引言",
  question: "一个方阵怎样用一个数同时记录空间的倍率、定向与是否发生维度塌缩？",
  goal: "从二维有向面积建立行列式的第一幅图像：绝对值给出面积倍率，符号记录定向，零值对应低维塌缩；再把这幅图像连接到列向量、可逆性与方程组的唯一性。",
  tags: ["有向面积", "定向", "维度塌缩"],
  prerequisites: [
    "会把 2 阶矩阵看成两个列向量，并能计算平行四边形的面积。",
    "知道两向量共线意味着它们线性相关。",
  ],
  objectives: [
    "从矩阵的两列直接读出变换后的平行四边形。",
    "区分 det(A)、|det(A)| 与普通几何面积所表达的信息。",
    "用 det(A)=0 解释维度塌缩、不可逆与唯一解失效。",
    "说明 det(A)=1 为什么不等于 A=E。",
  ],
  checkpoints: [
    { label: "先看图形", text: "固定单位正方形，观察两列向量怎样决定变换后的平行四边形。" },
    { label: "再读三个状态", text: "分别比较 det>0、det<0 与 det=0 时，面积、定向和维度发生了什么。" },
    { label: "最后连接代数", text: "把零行列式与列相关、不可逆以及方程组不再保证唯一解连成一条链。" },
  ],
  intro:
    "把单位正方形的两条边看成矩阵的两列。矩阵改变这两条边，也就改变它们张成的平行四边形。行列式把这次变化压缩成一个标量：大小告诉我们面积放大多少，正负告诉我们有序方向是否翻转，零告诉我们完整的二维信息已经被压进更低维空间。",
  videoPlan: {
    title: "一个正方形的三种命运",
    duration: "约 60—90 秒",
    scenes: [
      "单位正方形连续变成平行四边形，面积读数与 ad−bc 同步变化。",
      "经过镜像后普通面积保持为正，有向面积符号翻转。",
      "两列逐渐共线，平行四边形压成线段，det 连续经过 0。",
      "用同一画面连接 det 非零、可逆与唯一恢复。",
    ],
  },
  concepts: [
    { label: "定义对象", text: "行列式定义在方阵上，结果是一个标量；非方阵没有本章意义下的行列式。" },
    { label: "二阶公式", text: `${texInline("\\det\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}=ad-bc")}` },
    { label: "绝对值", text: `${texInline("|\\det(A)|")} 是单位正方形经线性变换后的面积倍率。` },
    { label: "符号", text: "正号表示定向保持，负号表示定向翻转；普通几何面积始终取绝对值。" },
    { label: "零值", text: `${texInline("\\det(A)=0")} 表示列向量线性相关，平面被压到直线或点。` },
    { label: "可逆性", text: `${texInline("\\det(A)\\ne0")} 时二维变换保留完整维度，可以唯一撤回。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第二章 §1",
    page: "",
    items: ["二阶行列式", "有向面积", "符号与零值", "与可逆性及方程组的连接"],
  },
  interactive: {
    type: "slot",
    title: "实验：行列式仪表",
    description: "拖动两列向量或调节矩阵元素，同步观察图形、公式、倍率与状态。",
    task: "先构造一个明显变形但 det=1 的矩阵，再让 det 穿过 0，最后进入负值区域。",
    prompts: [
      "用剪切预设确认：形状改变时面积倍率仍可保持 1。",
      "拖动任一列，使两列逐渐共线，观察 det 连续趋近 0。",
      "继续越过共线位置，比较普通面积与有向面积符号。",
      "尝试构造 det=2 与 det=−2，比较倍率相同而定向不同的两个状态。",
    ],
  },
  example: {
    title: "例题：det=1 为什么不代表没有变换",
    question: `设 ${texInline("A=\\begin{bmatrix}1&2\\\\0&1\\end{bmatrix}")}。计算 ${texInline("\\det(A)")}，说明单位正方形的面积、定向和形状怎样变化，并判断 ${texInline("A")} 是否等于单位矩阵。`,
    choices: [
      { correct: true, text: `${texInline("\\det(A)=1")}；面积不变、定向保持，但图形发生剪切，所以 ${texInline("A\\ne E")}。` },
      { text: `${texInline("\\det(A)=1")}，因此所有向量都保持不变。` },
      { text: `${texInline("\\det(A)=0")}；非零的非对角元会造成塌缩。` },
      { text: `${texInline("\\det(A)=-1")}；剪切必然翻转定向。` },
    ],
    steps: [
      `按二阶公式：${texInline("\\det(A)=1\\cdot1-2\\cdot0=1")}。`,
      "绝对值为 1，所以单位面积仍变为单位面积。",
      "结果为正，所以有序方向保持；结果非零，所以平面没有塌缩。",
      `第二列由 ${texInline("e_2")} 变为 ${texInline("2e_1+e_2")}，网格发生剪切，因此 ${texInline("A\\ne E")}。`,
    ],
  },
  quiz: [
    { question: `${texInline("\\det(A)=2")} 与 ${texInline("\\det(A)=-2")} 的共同点和差别是什么？`, answer: "面积倍率都为 2；前者保持定向，后者翻转定向。" },
    { question: `${texInline("\\det(A)=1")} 是否推出 ${texInline("A=E")}？`, answer: "不能。剪切、旋转等许多非单位矩阵也有行列式 1。" },
    { question: "两列共线时为什么得到零行列式？", answer: "它们张成的平行四边形高度为零，二维面积消失。" },
    { question: `二维中 ${texInline("\\det")} 非零与可逆有什么关系？`, answer: `${texInline("\\det")} 非零表示没有丢失维度，线性变换可逆。` },
  ],
  summary: [
    "行列式把倍率、定向和维度是否塌缩压缩进一个标量。",
    `二维中 ${texInline("|\\det|")} 是面积倍率，${texInline("\\det")} 的符号记录定向。`,
    `${texInline("\\det=0")} 对应列向量线性相关，也预告了不可逆与方程组失去唯一解。`,
    `${texInline("\\det=1")} 只说明有向面积倍率为 1，不说明矩阵等于单位矩阵。`,
  ],
  bridge: "高阶行列式会出现许多乘积项。下一节先解决这些项前面的正负号从哪里来：答案隐藏在排列的奇偶性中。",
  exercises: [
    "构造两个不同的 2 阶矩阵，使它们的行列式都等于 1。",
    "画出一个 det<0 的变换，并用箭头标出定向翻转。",
  ],
});

;/* content/ch2-section2.js */
defineChapter2Section("permutations", {
  number: "§2",
  textbookSection: "排列",
  title: "排列",
  navTitle: "排列",
  question: "行列式展开时，每行每列各取一个元素，为什么不同取法必须带上不同的正负号？",
  goal: "掌握排列、逆序对、逆序数与奇偶性；区分相邻交换、一般对换与移位，并把排列符号准确连接到行列式乘积项。",
  tags: ["排列", "逆序数", "对换与奇偶性"],
  prerequisites: [
    "能区分一个数在排列中的位置与它本身的数值。",
    "知道行列式中的一个合法乘积项要从每一行、每一列各取一个元素。",
  ],
  objectives: [
    "逐对列出逆序，并计算排列的逆序数。",
    "由逆序数奇偶判断排列符号。",
    "解释一次对换为什么必然翻转排列奇偶性。",
    "区分一次对换与把一个数移过若干位置的移位。",
  ],
  checkpoints: [
    { label: "先逐对比较", text: "只比较位置 i<j 的数值大小，完整列出逆序对，避免凭直觉猜奇偶。" },
    { label: "再看交叉", text: "把排列画成上下两排连线，每个交叉恰好对应一个逆序。" },
    { label: "最后研究交换", text: "相邻交换改变一个逆序；一般对换等价于奇数次相邻交换，因此也翻转符号。" },
  ],
  intro:
    `从第 1 行到第 ${texInline("n")} 行依次选取元素时，被选中的列指标组成一个排列。排列中的“交叉程度”由逆序数计量，奇偶性决定乘积项前面的符号 ${texInline("\\operatorname{sgn}(\\sigma)")}。`,
  concepts: [
    { label: "排列", text: `${texInline("1,2,\\ldots,n")} 的一个全排列可写成 ${texInline("\\sigma=(\\sigma(1),\\ldots,\\sigma(n))")}。` },
    { label: "逆序对", text: `当 ${texInline("i<j")} 但 ${texInline("\\sigma(i)>\\sigma(j)")} 时，位置 ${texInline("(i,j)")} 构成逆序。` },
    { label: "逆序数", text: `${texInline("\\tau(\\sigma)")} 是全部逆序对的个数。` },
    { label: "奇偶性", text: "逆序数为偶数时称偶排列，为奇数时称奇排列。" },
    { label: "排列符号", text: `${texInline("\\operatorname{sgn}(\\sigma)=(-1)^{\\tau(\\sigma)}")}。` },
    { label: "相邻交换", text: "交换相邻两项会使逆序数恰好改变 1。" },
    { label: "一般对换", text: "交换任意两个位置会使逆序数改变一个奇数，因此排列符号翻转。" },
  ],
  textbook: {
    reference: "北大版《高等代数》第二章 §2",
    page: "",
    items: ["排列", "逆序数", "奇偶性", "对换改变奇偶性"],
  },
  interactive: {
    type: "slot",
    title: "实验：排列奇偶实验室",
    description: "重排数字卡片，用逆序扫描器与连线图观察交叉，并比较对换与拖动移位。",
    task: "把 3142 还原为 1234，记录每一步逆序数与符号怎样变化。",
    prompts: [
      "先扫描 3142 的全部位置对，确认三个逆序。",
      "查看连线图：每个交叉对应一个逆序对。",
      "点击两张卡片做一次对换，观察符号必然翻转。",
      "用相邻交换步进器还原排列，比较步数与初始逆序数。",
      "拖动一张卡片跨越多个位置，判断它等价于多少次相邻交换。",
    ],
  },
  example: {
    title: "例题：逆序数、符号与一次对换",
    question: `设 ${texInline("\\sigma=(3,1,4,2)")}。列出逆序对，求 ${texInline("\\tau(\\sigma)")} 与 ${texInline("\\operatorname{sgn}(\\sigma)")}；再交换最后两个位置，判断新排列的奇偶性。`,
    choices: [
      { correct: true, text: `逆序对为 ${texInline("(3,1)")}、${texInline("(3,2)")}、${texInline("(4,2)")}，${texInline("\\tau=3")}，符号为 −1；交换最后两个位置后变为偶排列。` },
      { text: `只有 ${texInline("(3,1)")} 一个逆序，${texInline("\\tau=1")}。` },
      { text: `${texInline("\\tau")} 等于排列中的最大数 4，因此符号为 +1。` },
      { text: "交换任意两个位置不会改变奇偶性。" },
    ],
    steps: [
      "从左向右扫描：3 的右侧有 1、2 比它小；4 的右侧有 2 比它小。",
      `全部逆序对为 ${texInline("(3,1)")}、${texInline("(3,2)")}、${texInline("(4,2)")}，所以 ${texInline("\\tau=3")}。`,
      `因此 ${texInline("\\operatorname{sgn}(\\sigma)=(-1)^3=-1")}。`,
      `交换最后两个位置得到 ${texInline("3124")}，逆序数变为 2；一次对换使奇偶性翻转。`,
    ],
  },
  quiz: [
    { question: `排列 ${texInline("231")} 的逆序数是多少？`, answer: `2，逆序对为 ${texInline("(2,1)")}、${texInline("(3,1)")}。` },
    { question: `完全逆序 ${texInline("n\\ldots21")} 的逆序数是多少？`, answer: `${texInline("\\binom{n}{2}=n(n-1)/2")}。` },
    { question: "交换任意两个不相邻位置，逆序数一定只改变 1 吗？", answer: "不一定；它会改变一个奇数，但符号一定翻转。" },
    { question: `乘积 ${texInline("a_{12}a_{23}a_{31}")} 对应哪个列指标排列？`, answer: `${texInline("231")}。` },
  ],
  summary: [
    "排列记录每一行所选取的列。",
    "逆序数的奇偶决定排列符号。",
    "相邻交换使逆序数改变 1，一般对换使逆序数改变奇数，因此两者都会翻转符号。",
    "把一个数移过若干位置相当于多次相邻交换，与一次对换不同。",
  ],
  bridge: `下一节把‘每行每列各取一次’与排列符号合并起来，写出 ${texInline("n")} 阶行列式的统一定义。`,
  exercises: [
    "写出 3 阶全部 6 个排列及其符号。",
    "把 4213 用相邻交换还原为 1234，并核对交换次数与初始逆序数。",
  ],
});

;/* content/ch2-section3.js */
defineChapter2Section("n-order-determinant", {
  number: "§3",
  textbookSection: "n 阶行列式",
  title: "n 阶行列式",
  navTitle: "n 阶行列式",
  question: `怎样把二阶公式推广到 ${texInline("n")} 阶，同时保证每个乘积项恰好使用每一行和每一列一次？`,
  goal: `从取项网格建立 Leibniz 定义，解释 ${texInline("n!")} 个合法项的来源、排列符号的作用，并从一般定义还原二阶、三阶与三角行列式。`,
  tags: ["Leibniz 公式", "合法取项", "排列求和"],
  prerequisites: [
    "会判断一个排列的奇偶性，并能写出其符号。",
    "理解‘每行每列各取一个元素’是两个同时满足的条件。",
  ],
  objectives: [
    "从一个排列写出唯一对应的乘积项与符号。",
    "判断给定乘积是否属于行列式定义中的合法项，并指出违反了哪一条条件。",
    "用 Leibniz 公式还原二阶与三阶展开。",
    "证明上三角行列式只剩恒等排列项。",
  ],
  checkpoints: [
    { label: "先生成路径", text: "逐行选元素，并锁定已经使用的列；完整路径恰好对应一个排列。" },
    { label: "再附加符号", text: "由列指标排列的奇偶性决定该乘积项取正号还是负号。" },
    { label: "最后利用结构", text: "矩阵中的零会让许多合法项消失；三角结构因此把 n! 项压缩成一项。" },
  ],
  intro:
    `${texInline("n")} 阶行列式把所有合法取项放在一起求和。合法意味着每一行恰取一个元素、每一列也恰取一个元素；列指标因此形成排列，上一节的奇偶性为每一项提供符号。定义允许某个合法项因选中零元素而贡献 0，但不允许重复行或重复列。`,
  videoPlan: {
    title: "从取项路径到 n 阶定义",
    duration: "约 2 分钟",
    scenes: [
      "在 3×3 网格中逐行选择元素，同时锁定已用列。",
      "把选择路径读成排列，计算逆序数与符号。",
      "汇总六条路径，得到三阶六项。",
      "切换上三角矩阵，让五条合法路径因零元素消失。",
      "把图像压缩成一般 n 阶求和公式。",
    ],
  },
  concepts: [
    { label: "Leibniz 定义", text: `${texInline("\\det(A)=\\sum_{\\sigma\\in S_n}\\operatorname{sgn}(\\sigma)\\prod_{i=1}^{n}a_{i,\\sigma(i)}")}。` },
    { label: "求和范围", text: `${texInline("S_n")} 是 ${texInline("1,\\ldots,n")} 的全部排列组成的集合。` },
    { label: "合法取项", text: "每项从每一行、每一列各取一个元素；只满足其中一条仍然不合法。" },
    { label: "项数", text: `列指标共有 ${texInline("n!")} 个排列，所以形式上有 ${texInline("n!")} 个带符号乘积项。` },
    { label: "零贡献", text: "合法项可以含零元素而贡献 0；‘合法’描述下标结构，不保证数值非零。" },
    { label: "三角结构", text: "上三角矩阵中只有恒等排列项可能非零，因此行列式等于主对角线乘积。" },
  ],
  textbook: {
    reference: "北大版《高等代数》第二章 §3",
    page: "",
    items: ["n 阶定义", "二阶与三阶特例", "三角行列式", "n 维有向体积定位"],
  },
  interactive: {
    type: "slot",
    title: "实验：取项网格与排列项生成器",
    description: "逐行选择矩阵元素，系统同步生成排列、逆序数、符号与乘积项。",
    task: "构造排列 231 对应的项，再故意尝试重复使用一列，解释为什么该路径不合法。",
    prompts: [
      "每一行选择一个元素，已使用的列会锁定。",
      "完成路径后核对排列、逆序数和符号。",
      "点击六项列表，比较三正三负的结构。",
      "切换三角矩阵预设，观察哪些合法路径因零元素而消失。",
      "比较‘路径不合法’与‘路径合法但贡献为零’这两种情况。",
    ],
  },
  example: {
    title: "例题：合法项需要同时满足行条件与列条件",
    question: `对一般 3 阶矩阵，写出排列 ${texInline("231")} 对应的项与符号；说明 ${texInline("a_{11}a_{12}a_{23}")} 为什么不属于定义中的合法项。`,
    choices: [
      { correct: true, text: `对应 ${texInline("+a_{12}a_{23}a_{31}")}；后一乘积在第 1 行取了两个元素，并且完全没有从第 3 行取元素。` },
      { text: `对应 ${texInline("-a_{12}a_{23}a_{31}")}，因为 ${texInline("231")} 是奇排列。` },
      { text: `对应 ${texInline("+a_{11}a_{22}a_{33}")}。` },
      { text: `${texInline("a_{11}a_{12}a_{23}")} 使用了三列，所以自动是合法项。` },
    ],
    steps: [
      `${texInline("231")} 表示第 1 行取第 2 列、第 2 行取第 3 列、第 3 行取第 1 列。`,
      `因此乘积为 ${texInline("a_{12}a_{23}a_{31}")}。`,
      `${texInline("231")} 有两个逆序，属于偶排列，所以符号为正。`,
      `${texInline("a_{11}a_{12}a_{23}")} 虽然使用了第 1、2、3 列各一次，却在第 1 行取了两个元素并遗漏第 3 行；列条件满足而行条件失败，仍然不合法。`,
    ],
  },
  quiz: [
    { question: `${texInline("n")} 阶定义中为什么出现 ${texInline("n!")} 个项？`, answer: `因为合法取项与 ${texInline("n")} 个列指标的排列一一对应。` },
    { question: "对角线法则可以直接推广到四阶吗？", answer: "不能，它只适用于二阶与三阶。" },
    { question: "一个合法项含有零元素时，它会怎样？", answer: "它仍是定义中的合法项，但数值贡献为 0。" },
    { question: "上三角矩阵为什么只剩主对角项？", answer: `任何非恒等排列都存在某个 ${texInline("i")} 使 ${texInline("\\sigma(i)<i")}，从而选到主对角线下方的零。` },
  ],
  summary: [
    `${texInline("n")} 阶行列式是带符号的排列求和。`,
    "合法项与排列一一对应：每行每列各取一次。",
    "合法性只描述下标结构，合法项仍可能因零元素而贡献 0。",
    "二阶、三阶与三角公式都从同一个定义得到。",
  ],
  bridge: `定义告诉我们行列式是什么，但直接处理 ${texInline("n!")} 项并不适合计算。下一节从定义中提炼分别线性与交替性，把它们变成可操作的规则。`,
  exercises: [
    "用一般定义完整还原二阶公式。",
    "证明上三角矩阵的非恒等排列项必定含有主对角线下方的零。",
  ],
});

;/* content/ch2-section4.js */
defineChapter2Section("determinant-properties", {
  number: "§4",
  textbookSection: "n 阶行列式的性质",
  title: "n 阶行列式的性质",
  navTitle: "行列式性质",
  question: `交换、倍乘与倍加为什么分别让行列式乘以 −1、乘以 ${texInline("\\lambda")}、保持不变？`,
  goal: "以分别线性与交替性为主轴，理解三类初等行列变换对行列式的影响，并分清基本性质、派生结论和计算技巧之间的依赖关系。",
  tags: ["分别线性", "交替性", "初等变换"],
  prerequisites: [
    "理解 n 阶行列式是带符号的排列求和。",
    "能区分对某一行或列线性与对整个矩阵线性。",
  ],
  objectives: [
    "用分别线性与交替性推出相同行为零和倍加不变。",
    "准确追踪交换、倍乘、倍加对行列式的倍率。",
    "由 det(Aᵀ)=det(A) 在行性质与列性质之间切换。",
    "解释 det(λA)=λⁿdet(A) 中为什么出现 n 次 λ。",
  ],
  checkpoints: [
    { label: "抓住母性质", text: "先理解分别线性和交换变号，不把所有结论当作互不相关的口诀。" },
    { label: "推出三类操作", text: "交换对应 −1，单行倍乘对应 λ，倍加对应 1。" },
    { label: "建立依赖图", text: "相同行为零、比例行为零、三角公式和整体数乘都能回到母性质。" },
  ],
  intro:
    "行列式对每一行或每一列分别线性，并在交换两行或两列时变号。这两条结构性质能够推出计算中最常用的规则。",
  concepts: [
    { label: "分别线性", text: "固定其余行后，行列式关于某一行满足加法与数乘的线性规律。" },
    { label: "交替性", text: "交换两行或两列，行列式乘以 −1。" },
    { label: "相同行", text: "两行相同，则交换后矩阵不变但行列式应变号，因此行列式为 0。" },
    { label: "比例行", text: "两行成比例时，可先提出比例因子，再化为相同行，因此行列式为 0。" },
    { label: "倍加不变", text: "一行加上另一行的倍数，新增项含两行相同而为 0。" },
    { label: "转置", text: `${texInline("\\det(A^T)=\\det(A)")}，所以行性质与列性质完全平行。` },
    { label: "三角矩阵", text: "上三角或下三角行列式等于主对角线元素乘积。" },
    { label: "整体数乘", text: `${texInline("\\det(\\lambda A)=\\lambda^n\\det(A)")}，因为 n 行各自提出一个 λ。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第二章 §4",
    page: "",
    items: ["基本性质", "派生结论", "初等行列变换", "转置、三角与整体数乘"],
  },
  interactive: {
    type: "slot",
    title: "实验：列操作观测台",
    description: "直接操作平行四边形的两条生成边，观察交换、倍乘与倍加对应的几何变化；行操作由转置性质得到同样规则。",
    task: "依次执行一次交换、一次倍乘和一次倍加，用账本预测每一步的行列式。",
    prompts: [
      "交换两列前先猜一猜符号，再观察定向翻转。",
      "把第一列乘 1.5，确认面积倍率同步乘 1.5。",
      "把第二列加上第一列，观察形状剪切而面积不变。",
      "撤销操作并尝试另一条序列，核对累计倍率与当前 det。",
    ],
  },
  example: {
    title: "例题：连续操作必须逐步记账",
    question: `已知 ${texInline("\\det(A)=-2")}。先交换第 1、2 行，再把新的第 1 行乘 5，最后把第 3 行加上第 1 行的 4 倍。所得行列式是多少？`,
    choices: [
      { correct: true, text: "先乘 −1 得 2，再乘 5 得 10；最后的倍加不改变行列式，所以结果为 10。" },
      { text: "只需乘 5，结果为 −10。" },
      { text: "三次行变换都会保持行列式，因此仍为 −2。" },
      { text: "做过三次操作后必为 0。" },
    ],
    steps: [
      "交换两行使行列式乘以 −1：−2 变为 2。",
      "把一行乘 5，使行列式再乘 5：2 变为 10。",
      "把一行加上另一行的倍数属于倍加，行列式保持 10。",
      `累计倍率为 ${texInline("(-1)\\cdot5\\cdot1=-5")}，与原值 −2 相乘得到 10。`,
    ],
  },
  quiz: [
    { question: `${texInline("\\det(A+B)=\\det(A)+\\det(B)")} 一般成立吗？`, answer: "不成立。分别线性针对单独一行或一列，而不是整个矩阵。" },
    { question: "两行相同时为什么行列式为零？", answer: `交换这两行后矩阵不变，但交替性要求行列式变号，因此 ${texInline("D=-D")}，只能有 ${texInline("D=0")}。` },
    { question: `${texInline("\\det(\\lambda A)")} 在 ${texInline("n")} 阶时等于什么？`, answer: `${texInline("\\lambda^n\\det(A)")}。` },
    { question: "列倍加规则能否直接用于行？", answer: `可以。由 ${texInline("\\det(A^T)=\\det(A)")}，行与列的规则完全对应。` },
  ],
  summary: [
    "分别线性与交替性是行列式的两条基本性质。",
    `交换、倍乘、倍加对应倍率 −1、${texInline("\\lambda")}、1。`,
    "相同行为零、比例行为零和倍加不变都是派生结论。",
    "转置把所有行性质转换为列性质。",
  ],
  bridge: "下一节不再孤立地使用性质，而是把它们组织成计算策略：先读结构，再造零，最后抵达三角形或低成本展开。",
  exercises: [
    "由交换变号证明两行相同的行列式为零。",
    "由分别线性与相同行为零证明倍加不变。",
  ],
});

;/* content/ch2-section5.js */
defineChapter2Section("determinant-computation", {
  number: "§5",
  textbookSection: "行列式的计算",
  title: "行列式的计算",
  navTitle: "行列式计算",
  question: `面对高阶行列式，怎样识别结构、制造零并正确记账，使计算从 ${texInline("n!")} 项缩短为少量步骤？`,
  goal: "掌握先读结构、再选择终点的计算流程；用造零、三角化、因子提取和零多方向展开缩短计算，并用倍率账本保证每一步可追溯。",
  tags: ["结构识别", "造零", "倍率账本"],
  prerequisites: [
    "熟悉交换、倍乘、倍加对行列式的影响。",
    "知道三角行列式等于主对角线乘积，并理解按零多行列展开的基本想法。",
  ],
  objectives: [
    "在计算前识别零、公共因子、比例关系、三角结构与块结构。",
    "根据目标选择三角化或按行列展开，而不是机械消元。",
    "维护当前行列式与原行列式之间的倍率关系。",
    "用另一条路线或结构判断检查答案。",
  ],
  checkpoints: [
    { label: "先读结构", text: "不要立刻展开；先寻找已经存在的零、因子、相似行列和三角趋势。" },
    { label: "选择终点", text: "能够快速三角化就读对角线；某行或列零很多时就准备展开。" },
    { label: "每步记账", text: "交换记 −1，倍乘记 λ，倍加记 1；终点值要按账本还原为原值。" },
  ],
  intro:
    `按定义直接展开需要处理 ${texInline("n!")} 个乘积项。手算的核心是先读结构，再选择操作：提取公共因子、用倍加制造零、必要时交换并记号，最终化为三角形或零很多的展开形式。好的路线不只是算对，还应当让每一步的目的清楚。`,
  concepts: [
    { label: "结构扫描", text: "优先寻找零、公共因子、成比例或接近相同的行列，以及三角或块结构。" },
    { label: "造零", text: "行倍加不改变行列式，最适合消去元素并制造展开入口。" },
    { label: "倍率账本", text: "交换记 −1，倍乘记 λ，倍加记 1；当前值等于原值乘累计倍率。" },
    { label: "三角化", text: "化为上、下三角后读取主对角线乘积，再按账本恢复原值。" },
    { label: "展开选择", text: "若某行或列零很多，按该方向展开可能比完整消元更短。" },
    { label: "路线比较", text: "计算成本取决于非零项数量、分数复杂度和记账负担，不只取决于步骤数。" },
    { label: "验证", text: "用另一条路线、数值计算或结构判断核对结果。" },
  ],
  textbook: {
    reference: "北大版《高等代数》第二章 §5",
    page: "",
    items: ["计算策略", "行列变换", "三角化", "特殊结构与路线比较"],
  },
  interactive: {
    type: "slot",
    title: "实验：行列式策略台",
    description: "执行行变换、撤销并查看累计倍率；界面实时判断是否已形成三角结构。",
    task: "只用两次倍加把示例矩阵化为上三角，并用对角线乘积求出原行列式。",
    prompts: [
      "先估计直接展开的项数，再观察矩阵已有的两个零。",
      "用 R₂ 消去第一列，再用 R₃ 消去第二列。",
      "确认两次倍加的累计倍率始终为 1。",
      "尝试一次交换或倍乘后撤销，检查账本是否完整恢复。",
      "思考：若第二步出现复杂分数，是否存在更合适的交换或展开路线。",
    ],
  },
  example: {
    title: "例题：用倍加化为上三角",
    question: `计算 ${texInline("\\det\\begin{bmatrix}2&1&0\\\\1&3&1\\\\0&2&1\\end{bmatrix}")}。要求用行倍加化为上三角，并说明每一步对行列式的影响。`,
    choices: [
      { correct: true, text: `结果为 ${texInline("1")}；两次倍加均不改变行列式，三角矩阵对角线乘积为 ${texInline("2\\cdot\\frac52\\cdot\\frac15=1")}。` },
      { text: "结果为 6，直接把原矩阵主对角线相乘。" },
      { text: "结果为 0，因为矩阵中已经出现两个零。" },
      { text: "结果为 −1，因为消元必然包含一次交换。" },
    ],
    steps: [
      `做 ${texInline("R_2\\leftarrow R_2-\\frac12R_1")}，行列式不变，第二行变为 ${texInline("(0,\\frac52,1)")}。`,
      `再做 ${texInline("R_3\\leftarrow R_3-\\frac45R_2")}，行列式仍不变，第三行变为 ${texInline("(0,0,\\frac15)")}。`,
      "所得矩阵为上三角，行列式等于对角线乘积。",
      `因此原行列式为 ${texInline("2\\cdot\\frac52\\cdot\\frac15=1")}。`,
      "两步的累计倍率为 1，所以无需额外恢复。",
    ],
  },
  quiz: [
    { question: "何时可以直接把主对角线相乘？", answer: "矩阵已经是上三角或下三角时。" },
    { question: "交换两行后忘记变号会造成什么错误？", answer: "最终答案相差一个负号。" },
    { question: "某一列只有一个非零元素时，哪条策略常常最短？", answer: "沿该列展开。" },
    { question: "当前行列式为 12，累计倍率为 −3，原行列式是多少？", answer: "−4，因为当前值=原值×(−3)。" },
  ],
  summary: [
    "计算的关键是结构选择、合法操作和倍率账本。",
    "造零与三角化构成最稳定的手算路线。",
    "零多时展开更短，分数复杂度和记账负担也应纳入路线选择。",
    "多条路线可以互相验证，但每条路线都必须保留完整倍率关系。",
  ],
  bridge: "当零被制造出来后，最自然的下一步是沿某一行或列展开。下一节把这种做法写成严格的余子式与代数余子式公式。",
  exercises: [
    "对同一 3 阶行列式分别用三角化和按零多列展开。",
    "设计一个包含交换、倍乘、倍加的操作序列，并完整记录倍率。",
  ],
});

;/* content/ch2-section6.js */
defineChapter2Section("cofactor-expansion", {
  number: "§6",
  textbookSection: "行列式按一行（列）展开",
  title: "行列式按一行（列）展开",
  navTitle: "按行列展开",
  question: "删去一个元素所在的行与列后，为什么剩余的低阶行列式能够重建原行列式？",
  goal: "准确区分余子矩阵、余子式与代数余子式；掌握按任意一行或一列展开、交叉恒等式及其来源，并通过非零项数量选择更短路线。",
  tags: ["余子式", "代数余子式", "展开定理"],
  prerequisites: [
    "会计算 2 阶行列式，并熟悉代数符号中的行列下标。",
    "知道一个行列式可以沿不同路线计算而结果不变。",
  ],
  objectives: [
    "从 aᵢⱼ 正确构造余子矩阵、余子式 Mᵢⱼ 与代数余子式 Cᵢⱼ。",
    "沿任意指定行或列写出完整展开式。",
    "利用零元素比较不同展开路线的计算成本。",
    "解释同一行展开得到 det(A)，而一行与另一行的代数余子式交叉配对得到 0。",
  ],
  checkpoints: [
    { label: "先分清三个对象", text: "删行删列得到矩阵；对它取行列式得到 Mᵢⱼ；再乘位置符号得到 Cᵢⱼ。" },
    { label: "再看符号棋盘", text: "位置符号由 (−1)ⁱ⁺ʲ 决定，不能仅凭余子式本身判断正负。" },
    { label: "最后选择路线", text: "所有行列都能展开，但零越多，需要计算的低阶行列式越少。" },
  ],
  intro:
    `选中 ${texInline("a_{ij}")} 后删去第 ${texInline("i")} 行与第 ${texInline("j")} 列，剩余矩阵的行列式记为 ${texInline("M_{ij}")}；再乘位置符号 ${texInline("(-1)^{i+j}")} 得到代数余子式 ${texInline("C_{ij}")}。一行或一列中的元素与对应代数余子式配对求和，就得到原行列式。这里最容易混淆的是三个对象的类型与符号。`,
  concepts: [
    { label: "余子矩阵", text: "删去第 i 行、第 j 列后得到的 (n−1) 阶矩阵。" },
    { label: "余子式", text: `${texInline("M_{ij}")} 是余子矩阵的行列式，是标量。` },
    { label: "代数余子式", text: `${texInline("C_{ij}=(-1)^{i+j}M_{ij}")}。` },
    { label: "按行展开", text: `${texInline("\\det(A)=\\sum_{j=1}^{n}a_{ij}C_{ij}")}。` },
    { label: "按列展开", text: `${texInline("\\det(A)=\\sum_{i=1}^{n}a_{ij}C_{ij}")}。` },
    { label: "交叉恒等式", text: `当 ${texInline("r\\ne s")} 时，第 r 行元素与第 s 行对应代数余子式的乘积之和为 0。` },
    { label: "递归结构", text: "n 阶行列式被拆成若干 (n−1) 阶行列式，因此展开可以递归进行。" },
  ],
  textbook: {
    reference: "北大版《高等代数》第二章 §6",
    page: "",
    items: ["余子矩阵与余子式", "代数余子式", "按行列展开", "交叉恒等式"],
  },
  interactive: {
    type: "slot",
    title: "实验：余子式展开板",
    description: "点击元素观察删行删列、符号棋盘与代数余子式；切换展开方向比较非零项数量。",
    task: "找出示例矩阵中展开成本最低的行或列，并完成全部非零项。",
    prompts: [
      "点击任意元素，区分余子矩阵、余子式和代数余子式。",
      "对照棋盘符号，解释 C₂₃ 为什么带负号。",
      "切换按行与按列路线，比较需要计算的非零项数量。",
      "选择最短路线后核对展开和与直接行列式值。",
      "观察界面如何省略零项，同时保持展开式的符号清晰。",
    ],
  },
  example: {
    title: "例题：选择零最多的方向展开",
    question: `计算 ${texInline("\\det\\begin{bmatrix}1&2&0\\\\0&3&0\\\\4&5&6\\end{bmatrix}")}，并说明为什么所选展开方向最省步骤。`,
    choices: [
      { correct: true, text: `沿第 2 行或第 3 列都只需一个非零项，结果为 ${texInline("18")}。` },
      { text: "必须沿第 1 行展开，结果为 0。" },
      { text: "有零元素的行整体贡献为 0，所以结果为 0。" },
      { text: "代数余子式始终等于余子式，无需位置符号。" },
    ],
    steps: [
      `第 2 行只有 ${texInline("a_{22}=3")} 非零，第 3 列也只有 ${texInline("a_{33}=6")} 非零，两条路线成本相同。`,
      `沿第 2 行：位置符号 ${texInline("(-1)^{2+2}=1")}。`,
      `余子式 ${texInline("M_{22}=\\det\\begin{bmatrix}1&0\\\\4&6\\end{bmatrix}=6")}。`,
      `所以 ${texInline("\\det(A)=3\\cdot6=18")}。`,
      "其余两个元素为零，对应项可以省略，但并不意味着整行贡献为零。",
    ],
  },
  quiz: [
    { question: `${texInline("C_{23}")} 的位置符号是多少？`, answer: `${texInline("(-1)^{2+3}=-1")}。` },
    { question: "为什么通常选择零最多的行或列展开？", answer: "零项无需计算对应余子式，子问题数量更少。" },
    { question: "一行中有一个零，能否推出整个行列式为零？", answer: "不能；只会消去该元素对应的一个展开项。" },
    { question: "一行元素与另一行对应的代数余子式配对为什么为零？", answer: "可把前一行复制到后一行，展开得到一个含两行相同的行列式，因此为零。" },
  ],
  summary: [
    "删行删列产生余子矩阵，取其行列式得到余子式，再加入位置符号得到代数余子式。",
    "按任意一行或列展开都能恢复原行列式。",
    "展开方向决定计算量，零多的方向通常更短。",
    "交叉恒等式来自把一行复制到另一行后出现相同行列式。",
  ],
  bridge: "代数余子式不仅能计算行列式，还能把方程组中的某个未知量单独抽出来。下一节由此进入克拉默法则。",
  exercises: [
    "对同一矩阵分别按第 2 行和第 3 列展开，核对两条路线。",
    "构造一个矩阵，使按某一行展开只需计算一个二阶余子式。",
  ],
});

;/* content/ch2-section7.js */
defineChapter2Section("cramer-rule", {
  number: "§7",
  textbookSection: "克拉默（Cramer）法则",
  title: "克拉默（Cramer）法则",
  navTitle: "克拉默法则",
  question: `为什么把系数矩阵的第 ${texInline("i")} 列换成常数列后，两个行列式的比值恰好给出第 ${texInline("i")} 个未知量？`,
  goal: `在 ${texInline("\\det(A)\\ne0")} 的前提下构造替换矩阵 ${texInline("A_i")}，理解 ${texInline("x_i=\\det(A_i)/\\det(A)")} 的列线性推导与二维有向面积比，并正确区分 ${texInline("\\det(A)=0")} 时的无解与无穷多解。`,
  tags: ["克拉默法则", "替换列", "唯一解"],
  prerequisites: [
    "会把 Ax=b 写成 b=x₁a₁+⋯+xₙaₙ，其中 aᵢ 是 A 的列。",
    "熟悉行列式对单独一列的线性以及重复列时行列式为零。",
  ],
  objectives: [
    "正确构造 Aᵢ，并说明为什么替换的是列而不是行。",
    "由列线性推导 det(Aᵢ)=xᵢdet(A)。",
    "用二维有向面积比解释克拉默公式。",
    "在 D=0 时停止使用比值公式，并继续判断无解或无穷多解。",
    "说明克拉默法则的理论价值与大规模数值计算局限。",
  ],
  checkpoints: [
    { label: "先看列组合", text: "Ax=b 的本质是 b 由 A 的列向量线性组合得到，未知量就是这组基下的坐标。" },
    { label: "再替换一列", text: "把 b 放进第 i 列，利用该列线性展开；含重复列的项全部消失。" },
    { label: "最后检查分母", text: "只有 det(A)≠0 才能相除；D=0 时必须回到列空间或消元判断相容性。" },
  ],
  intro:
    `方程 ${texInline("Ax=b")} 表示常数向量 ${texInline("b")} 是 ${texInline("A")} 的列向量的线性组合。当 ${texInline("\\det(A)\\ne0")} 时，这组列向量构成一组基，坐标唯一。把第 ${texInline("i")} 列替换成 ${texInline("b")} 后，行列式的分别线性会自动留下系数 ${texInline("x_i")}。公式中的分母正是唯一解存在的结构条件。`,
  videoPlan: {
    title: "克拉默法则为什么是有向体积比",
    duration: "约 2 分钟",
    scenes: [
      "把 b 写成 A 的列向量线性组合。",
      "在第 i 列放入 b，并用该列的线性展开。",
      "含重复列的项消失，只留下 xᵢdet(A)。",
      "在二维画面中比较替换列后的有向面积与原基底面积。",
      "展示 det(A)=0 时基底塌缩，比例公式失去分母，并分出相容与不相容两种情况。",
    ],
  },
  concepts: [
    { label: "前提", text: `${texInline("A")} 为 n 阶方阵且 ${texInline("\\det(A)\\ne0")}。` },
    { label: "列组合", text: `${texInline("b=x_1a_1+\\cdots+x_na_n")}，其中 ${texInline("a_i")} 是 A 的第 i 列。` },
    { label: "替换矩阵", text: `${texInline("A_i")} 由把 ${texInline("A")} 的第 i 列替换成 ${texInline("b")} 得到。` },
    { label: "核心等式", text: `${texInline("\\det(A_i)=x_i\\det(A)")}。` },
    { label: "公式", text: `${texInline("x_i=\\dfrac{\\det(A_i)}{\\det(A)}")}。` },
    { label: "二维解释", text: "替换列后的有向面积与原基底面积之比给出对应坐标。" },
    { label: "奇异边界", text: `${texInline("\\det(A)=0")} 时公式不可用；方程组可能无解，也可能有无穷多解。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第二章 §7",
    page: "",
    items: ["克拉默法则", "列线性证明", "齐次方程组推论", "适用边界与相容性"],
  },
  interactive: {
    type: "slot",
    title: "实验：替换列与克拉默步进",
    description: "调节系数列与 b，实时比较 D、D₁、D₂、坐标重构与残差；在 D=0 时判断无解或无穷多解。",
    task: "先求解示例方程组，再把两列拖成共线，分别构造相容与不相容的 b。",
    prompts: [
      "确认 D 非零，再读取 D₁/D 与 D₂/D。",
      "观察 x₁a₁+x₂a₂ 是否重新得到 b，并检查残差。",
      "让 D 接近 0，观察比值为什么对小变化变得敏感。",
      "切换 D=0 且相容的预设，确认出现无穷多解。",
      "切换 D=0 且不相容的预设，确认出现无解。",
    ],
  },
  example: {
    title: "例题：二元克拉默法则与回代验证",
    question: `解方程组 ${texInline("2x+y=5")}，${texInline("x+3y=5")}，并用回代验证结果。`,
    choices: [
      { correct: true, text: `${texInline("D=5,D_1=10,D_2=5")}，所以 ${texInline("x=2,y=1")}。` },
      { text: `${texInline("x=1,y=2")}。` },
      { text: `${texInline("D=0")}，克拉默法则不可用。` },
      { text: "出现行列式就说明方程组无解。" },
    ],
    steps: [
      `系数矩阵 ${texInline("A=\\begin{bmatrix}2&1\\\\1&3\\end{bmatrix}")}，${texInline("D=6-1=5\\ne0")}，因此有唯一解。`,
      `替换第 1 列：${texInline("D_1=\\det\\begin{bmatrix}5&1\\\\5&3\\end{bmatrix}=10")}，所以 ${texInline("x=2")}。`,
      `替换第 2 列：${texInline("D_2=\\det\\begin{bmatrix}2&5\\\\1&5\\end{bmatrix}=5")}，所以 ${texInline("y=1")}。`,
      `回代：${texInline("2\\cdot2+1=5")}，${texInline("2+3\\cdot1=5")}，两个方程均成立。`,
      `几何上，${texInline("b=2a_1+a_2")}；两个行列式之比分别读出这两个坐标。`,
    ],
  },
  quiz: [
    { question: "克拉默法则的必要前提是什么？", answer: "系数矩阵为方阵且行列式非零。" },
    { question: `${texInline("A_2")} 怎样构造？`, answer: `把 ${texInline("A")} 的第 2 列替换成 ${texInline("b")}，其余列保持不变。` },
    { question: `${texInline("D=0")} 是否必然无解？`, answer: "不必然，也可能有无穷多解。" },
    { question: `齐次方程 ${texInline("Ax=0")} 在 ${texInline("\\det(A)\\ne0")} 时有几个解？`, answer: "只有零解。" },
  ],
  summary: [
    `${texInline("\\det(A)")} 非零时，${texInline("A")} 的列构成基，方程组有唯一坐标。`,
    `替换第 ${texInline("i")} 列并利用列线性可得 ${texInline("\\det(A_i)=x_i\\det(A)")}。`,
    `二维中，${texInline("D_i/D")} 是替换列后有向面积与原基底有向面积之比。`,
    `${texInline("D=0")} 时应停止使用克拉默公式，回到列空间、秩或消元判断无解与无穷多解。`,
  ],
  bridge: "最后一节把‘沿一行展开’推广到多个行的子式配对，并证明连续两个线性变换的有向体积倍率相乘。",
  exercises: [
    "对一个 3×3 方程组写出 A₁、A₂、A₃ 的结构。",
    "分别构造 D=0 且无解、D=0 且有无穷多解的二元方程组。",
  ],
});

;/* content/ch2-section8.js */
defineChapter2Section("laplace-and-product", {
  number: "§8",
  textbookSection: "拉普拉斯（Laplace）定理·行列式的乘法规则",
  title: "拉普拉斯（Laplace）定理·行列式的乘法规则",
  navTitle: "Laplace 与乘法",
  question: "怎样把单行展开推广为多个行的子式配对？连续两个线性变换的有向体积倍率为什么相乘？",
  goal: `理解固定 ${texInline("k")} 行后的子式—互补子式配对及其位置符号，区分广义 Laplace 展开与 §6；从几何和代数两个入口掌握 ${texInline("\\det(AB)=\\det(A)\\det(B)")}，并能推出逆矩阵、矩阵幂与相似不变性。`,
  tags: ["Laplace 定理", "互补子式", "乘法规则"],
  prerequisites: [
    "熟悉按一行或一列展开以及代数余子式的位置符号。",
    "理解矩阵乘法 AB 表示先作用 B，再作用 A。",
  ],
  objectives: [
    "在固定 k 行后枚举所有 k 列组合，并找出对应互补行列集合。",
    "写出广义 Laplace 展开的完整符号因子。",
    "说明 k=1 为什么退化为 §6 的按一行展开。",
    "用连续体积倍率解释 det(AB)=det(A)det(B)，并理解几何图像与代数证明的分工。",
    "由乘法规则推出 det(A⁻¹)、det(Aᵐ) 与相似矩阵行列式相同。",
  ],
  checkpoints: [
    { label: "先做子式配对", text: "固定 k 行，选择 k 列形成子式；未选行列形成互补子式，并由行列指标和决定符号。定理概念中的例子列出了固定前两行时的全部六项。" },
    { label: "再看两阶段变换", text: "单位图形先经过 B，再从 B 的真实结果继续经过 A；倍率依次相乘。" },
    { label: "最后回到证明", text: "多重线性展开 AB 的各列，重复列项消失，剩余排列项分离成 det(A)det(B)。" },
  ],
  intro:
    `按一行展开时每次固定一个元素；拉普拉斯定理同时选择若干行与同样数量的列，得到一个子式，再与互补部分配对求和。另一条主线来自矩阵乘法：先做 ${texInline("B")}，再做 ${texInline("A")}，体积倍率依次相乘，因此复合矩阵 ${texInline("AB")} 的行列式等于两个倍率的乘积。所以行列式既能递归拆解，也在复合下保持乘法结构。`,
  videoPlan: {
    title: "两次变换的有向体积倍率",
    duration: "约 2 分钟",
    scenes: [
      "单位图形先经过 B，显示第一阶段倍率。",
      "保持 B 后的图形作为第二阶段起点，再经过 A。",
      "同步对照 det(B)、det(A)det(B) 与 det(AB)。",
      "加入一次镜像、两次镜像与含零因子的边界。",
      "把几何图像压缩为多重线性与排列求和的代数证明路线。",
    ],
  },
  concepts: [
    { label: "k 阶子式", text: "选定 k 行和 k 列交叉得到的 k 阶行列式。" },
    { label: "互补子式", text: "删去所选行与列后，剩余位置形成的 (n−k) 阶子式。" },
    { label: "位置符号", text: `若行指标集为 ${texInline("I")}、列指标集为 ${texInline("J")}，符号为 ${texInline("(-1)^{\\sum I+\\sum J}")}。` },
    { label: "Laplace 展开", text: "固定 k 行，对全部 k 列组合，将子式与带符号的互补子式配对求和。" },
    { label: "k=1", text: "退化为 §6 的按一行展开。" },
    { label: "乘法规则", text: `${texInline("\\det(AB)=\\det(A)\\det(B)")}。` },
    { label: "零因子", text: "任一阶段行列式为 0，复合后的行列式也为 0；已经丢失的维度无法在后续线性变换中恢复。" },
    { label: "推论", text: `${texInline("\\det(A^{-1})=1/\\det(A)")}、${texInline("\\det(A^m)=\\det(A)^m")}，相似矩阵行列式相同。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第二章 §8",
    page: "",
    items: ["广义 Laplace 定理", "子式与互补子式", "行列式乘法规则", "逆、幂与相似不变性"],
  },
  interactive: {
    type: "slot",
    title: "实验：两次变换，面积倍率相乘",
    description: "单位正方形先经过 B，再从 B 的结果出发经过 A；面积块显示倍率怎样相乘。",
  },
  example: {
    title: "例题：乘法规则与三个推论",
    question: `已知 ${texInline("\\det(A)=-2")}，${texInline("\\det(B)=3")}。求 ${texInline("\\det(AB)")}、${texInline("\\det(BA)")}、${texInline("\\det(A^{-1})")} 与 ${texInline("\\det(A^2B)")}。`,
    choices: [
      { correct: true, text: `${texInline("\\det(AB)=\\det(BA)=-6")}，${texInline("\\det(A^{-1})=-1/2")}，${texInline("\\det(A^2B)=12")}。` },
      { text: `${texInline("\\det(AB)=1")}，因为复合后要归一化。` },
      { text: `${texInline("\\det(AB)\\ne\\det(BA)")}，因为矩阵乘法通常不可交换。` },
      { text: `${texInline("\\det(A)")} 为负，所以 ${texInline("A")} 不可逆。` },
    ],
    steps: [
      `乘法规则给出 ${texInline("\\det(AB)=(-2)\\cdot3=-6")}，同理 ${texInline("\\det(BA)=3\\cdot(-2)=-6")}。`,
      `因为 ${texInline("\\det(A)\\ne0")}，${texInline("A")} 可逆且 ${texInline("\\det(A^{-1})=1/(-2)=-1/2")}。`,
      `先算 ${texInline("\\det(A^2)=(-2)^2=4")}，再乘 ${texInline("\\det(B)=3")}，得到 12。`,
      "几何上，一次方向翻转与三倍正缩放复合，最终体积倍率为 6，定向翻转。",
      `${texInline("AB")} 与 ${texInline("BA")} 虽通常不是同一矩阵，但两者的行列式都化为同一组标量因子的乘积。`,
    ],
  },
  quiz: [
    { question: `固定 ${texInline("4\\times4")} 的两行做 Laplace 展开，需要遍历多少个两列组合？`, answer: `${texInline("\\binom42=6")} 个。` },
    { question: "广义 Laplace 展开的位置符号由什么决定？", answer: "由所选行指标之和与所选列指标之和的奇偶性决定。" },
    { question: `${texInline("AB")} 与 ${texInline("BA")} 通常不同，为什么它们的行列式仍相等？`, answer: `两者都等于 ${texInline("\\det(A)\\det(B)")}，标量乘法可交换。` },
    { question: `若 ${texInline("\\det(B)=0")}，${texInline("\\det(AB)")} 等于多少？`, answer: "0。" },
  ],
  summary: [
    "广义 Laplace 展开把单元素展开推广为子式与互补子式的配对。",
    `位置符号由所选行列指标之和的奇偶性决定，${texInline("k=1")} 时回到按一行展开。`,
    "乘法规则说明复合变换的有向体积倍率相乘。",
    "几何图像解释为什么公式合理，多重线性与排列求和给出代数证明。",
    "可逆矩阵、矩阵幂与相似不变量等结论都可由乘法规则快速推出。",
  ],
  bridge: `全章主线至此闭合：从二维有向面积出发，经排列与 ${texInline("n")} 阶定义，进入性质、计算、展开和方程组，最后在子式分解与矩阵复合中看到行列式的完整结构。`,
  exercises: [
    "在 4×4 中固定前两行，写出六个列组合及各自的互补列。",
    "用乘法规则证明 det(A)=0 时 AB 与 BA 都是奇异矩阵。",
  ],
});

;/* content/ch2.js */
registerAlgebraChapter({
  id: "ch2",
  icon: "2",
  title: "第二章 行列式",
  subtitle: "有向体积与结构",
  summary:
    `从二维有向面积出发，经排列奇偶性建立 ${texInline("n")} 阶定义，再把性质组织成计算工具，最后连接余子式展开、克拉默法则、Laplace 定理与矩阵乘积。行列式的绝对值记录体积倍率，符号记录定向，零值标志维度塌缩。`,
  sections: [
    { id: "determinant-intro", number: "§1", title: "引言", navTitle: "引言" },
    { id: "permutations", number: "§2", title: "排列", navTitle: "排列" },
    { id: "n-order-determinant", number: "§3", title: "n 阶行列式", navTitle: "n 阶行列式" },
    { id: "determinant-properties", number: "§4", title: "n 阶行列式的性质", navTitle: "行列式性质" },
    { id: "determinant-computation", number: "§5", title: "行列式的计算", navTitle: "行列式计算" },
    { id: "cofactor-expansion", number: "§6", title: "行列式按一行（列）展开", navTitle: "按行列展开" },
    { id: "cramer-rule", number: "§7", title: "克拉默（Cramer）法则", navTitle: "克拉默法则" },
    { id: "laplace-and-product", number: "§8", title: "拉普拉斯（Laplace）定理·行列式的乘法规则", navTitle: "Laplace 与乘法" },
  ],
});


;/* content/ch2-assemble.js */
/* Apply Chapter 2 section patches after ch2.js registration. */
(() => {
  const chapter = algebraContent.chapters.find((item) => item.id === "ch2");
  const patches = window.getChapter2SectionPatches?.();
  if (!chapter || !patches) return;

  const order = [
    "determinant-intro",
    "permutations",
    "n-order-determinant",
    "determinant-properties",
    "determinant-computation",
    "cofactor-expansion",
    "cramer-rule",
    "laplace-and-product",
  ];

  const byId = new Map();
  for (const [id, patch] of patches.entries()) byId.set(id, patch);

  chapter.sections = order.map((id) => {
    const patch = byId.get(id);
    if (!patch) {
      console.warn("Missing Chapter 2 section patch:", id);
      return { id, number: "§?", title: id, navTitle: id };
    }
    return { id, ...patch };
  });
})();


;/* content/ch3-registry.js */
/*
 * Chapter 3 section data registry.
 */
(() => {
  const patches = new Map();

  window.defineChapter3Section = function defineChapter3Section(sectionId, patch) {
    if (!sectionId || !patch || typeof patch !== "object") {
      throw new TypeError("Chapter 3 section patches require an id and an object.");
    }
    patches.set(sectionId, patch);
  };

  window.getChapter3SectionPatches = function getChapter3SectionPatches() {
    return patches;
  };
})();


;/* content/ch3-section1.js */
defineChapter3Section("elimination", {
  number: "§1",
  textbookSection: "消元法",
  title: "消元法",
  navTitle: "消元法",
  question: "为什么交换、倍乘或倍加方程以后，解集不变？“消去一个未知量”在几何上做了什么？",
  goal: "理解三类初等行变换都可逆，因此保持解集；会用增广矩阵完成消元与回代，并从阶梯形读出唯一解、无解或无穷多解。",
  tags: ["初等行变换", "增广矩阵", "阶梯形", "回代", "三平面"],
  intro:
    "三元一次方程的每一个方程是空间里的一个平面，方程组的解就是三个平面的公共点。消元不断把方程换成新的组合：平面在变，公共点不变。",
  concepts: [
    { label: "初等行变换", text: "交换两行、一行乘非零数、一行加上另一行的倍数；每一种都有逆变换。" },
    { label: "阶梯形", text: "主元逐行向右下推进；从最后一个主元开始回代。" },
  ],
  textbook: { reference: "北大版《高等代数》第三章 §1", items: ["初等变换与同解方程组", "阶梯形与回代"] },
  interactive: { type: "slot", title: "消元：平面绕交线转动，解点不动" },
  lesson3d: {
    blocks: [
      {
        title: "三类变换都可逆，所以解集不变",
        tex: String.raw`R_i\leftrightarrow R_j,\qquad R_i\leftarrow kR_i\ (k\ne0),\qquad R_i\leftarrow R_i+cR_j`,
        text: `它们的逆变换分别是再交换一次、乘 ${texInline("1/k")}、减去 ${texInline("cR_j")}。新方程组的每个方程都由旧方程组合而来，所以旧解都是新解；再用逆变换倒回去，新解也都是旧解。乘 0 没有逆变换，会丢掉一个约束，因此不允许。`,
      },
      {
        title: "倍加的几何含义",
        ponder: {
          q: `平面 1、2 平行（法向相同、右端 ${texInline("d_1\\ne d_2")}），做 ${texInline("R_2\\leftarrow R_2-R_1")} 会得到什么？`,
          a: `得到 ${texInline("0=d_2-d_1\\ne0")}：两个平行平面没有交线，转不出新平面，只剩一个矛盾行，方程组无解。`,
        },
        text: `新方程 ${texInline("R_i+cR_j")} 被所有同时满足 ${texInline("R_i")}、${texInline("R_j")} 的点满足，所以新平面始终含着这两个平面的交线；${texInline("c")} 变化时，新平面绕这条交线转动。选对 ${texInline("c")} 让某个系数变成 0，新平面就与对应的坐标轴平行，这就是“消去一个未知量”。`,
      },
      {
        title: "从阶梯形读出结果",
        figure: "three-planes",
        tex: String.raw`\begin{array}{l}\text{出现 }[0\ \cdots\ 0\mid d],\ d\ne0\ \Rightarrow\ \text{无解}\\ \text{无矛盾行且每列都有主元}\ \Rightarrow\ \text{唯一解}\\ \text{无矛盾行且有非主元列}\ \Rightarrow\ \text{无穷多解}\end{array}`,
      },
    ],
    pitfalls: [
      "以为无解就意味着有两个平行平面。三个平面可以两两相交，却围成一个“三棱柱”，没有公共点。",
      "只对系数做变换，忘记右端常数要跟着一起变。",
      "以为方程个数等于未知量个数就一定有唯一解。",
    ],
  },
  example: {
    title: "例题：消元，并读出每一步的几何含义",
    question: `解方程组 ${texInline("x+y+z=2")}，${texInline("2x+2y+3z=5")}，${texInline("x-y+z=0")}。做完 ${texInline(String.raw`R_2\leftarrow R_2-2R_1`)} 以后，新的第二个平面与哪些坐标轴平行？`,
    choices: [
      { correct: true, text: `解为 ${texInline("(0,1,1)")}；新平面 ${texInline("z=1")} 同时平行于 ${texInline("x")} 轴和 ${texInline("y")} 轴。` },
      { text: `解为 ${texInline("(1,1,0)")}；新平面只平行于 ${texInline("x")} 轴。` },
      { text: `解为 ${texInline("(0,1,1)")}；新平面平行于 ${texInline("z")} 轴。` },
      { text: "方程组有无穷多解，因为第二行消元后只剩一个未知量。" },
    ],
    steps: [
      `增广矩阵为 ${texInline(String.raw`\left[\begin{array}{ccc|c}1&1&1&2\\2&2&3&5\\1&-1&1&0\end{array}\right]`)}。`,
      `${texInline(String.raw`R_2\leftarrow R_2-2R_1`)} 得到 ${texInline("z=1")}：${texInline("x")}、${texInline("y")} 的系数同时变成 0，这个平面与 ${texInline("x")} 轴、${texInline("y")} 轴都平行。`,
      `${texInline(String.raw`R_3\leftarrow R_3-R_1`)} 得到 ${texInline("-2y=-2")}。第二列的主元位置是 0，交换第二、三行后继续。`,
      `回代：${texInline("z=1")}，${texInline("y=1")}，${texInline("x=2-1-1=0")}。`,
      `代回三个原方程检验：${texInline("0+1+1=2")}，${texInline("0+2+3=5")}，${texInline("0-1+1=0")}。`,
    ],
  },
  quiz: [
    {
      question: `对一个方程组做 ${texInline(String.raw`R_3\leftarrow R_3-4R_1`)}。若平面 1 与平面 3 相交，新的第三个平面一定包含哪条直线？`,
      answer: "原来的平面 1 与平面 3 的交线。若方程组有解，这条线也经过解。",
    },
    {
      question: "三个平面两两相交，但没有公共点。消元到最后会出现什么？",
      answer: `出现形如 ${texInline(String.raw`[0\ 0\ 0\mid d]`)}（${texInline(String.raw`d\ne0`)}）的矛盾行，此时 ${texInline(String.raw`\operatorname{rank}A=2<\operatorname{rank}[A\mid b]=3`)}。`,
    },
    {
      question: "把唯一解方程组的某一行乘 0，解集会怎样？这一步为什么不允许？",
      answer: "少了一个约束，解集一般从一个点扩大成一条直线。乘 0 没有逆变换，解集不再保持。",
    },
  ],
  summary: [
    "三类初等行变换都可逆，所以消元前后解集相同。",
    "倍加让平面绕两平面的交线转动；消去一个未知量，就是把平面转到与对应坐标轴平行。",
    "阶梯形里的矛盾行、主元与非主元列，分别对应无解、唯一解和自由变量。",
  ],
});


;/* content/ch3-section2.js */
defineChapter3Section("n-vector-space", {
  number: "§2",
  textbookSection: "n维向量空间",
  title: "n维向量空间",
  navTitle: "n维向量空间",
  question: `怎样把一个方程组读成“${texInline("n")} 维向量的线性组合”？${texInline("n")} 大于 3、画不出来时，为什么仍能精确运算？`,
  goal: `掌握 ${texInline("F^n")} 中向量的加法、数乘与线性组合；能把 ${texInline("Ax=b")} 同时读成“三个方程”和“列向量的组合”。`,
  tags: [texInline("F^n"), "线性组合", "列图景", "行图景"],
  intro: `把未知量排成一列 ${texInline("x=(x_1,\\dots,x_n)")}，方程组就能写成 ${texInline("x_1a_1+\\cdots+x_na_n=b")}：求解就是找 ${texInline("A")} 的各列的权重，让组合正好等于 ${texInline("b")}。`,
  concepts: [
    { label: texInline("F^n"), text: `数域 ${texInline("F")} 上的 ${texInline("n")} 元有序数组全体，按分量相加、数乘。` },
    { label: "线性组合", text: `${texInline("k_1a_1+\\cdots+k_na_n")}。` },
  ],
  textbook: { reference: "北大版《高等代数》第三章 §2", items: ["n 维向量及其运算", "线性组合"] },
  interactive: { type: "slot", title: "同一个方程组，两幅图同时成立" },
  lesson3d: {
    blocks: [
      {
        title: "向量就是有顺序的一列数",
        tex: String.raw`\alpha+\beta=(a_1+b_1,\dots,a_n+b_n),\qquad k\alpha=(ka_1,\dots,ka_n)`,
        text: `二维、三维时可以把向量画成箭头；${texInline("n")} 更大时画不出来，但加法和数乘仍然逐个分量进行，结果完全确定。坐标的顺序不能交换：${texInline("(1,2,0)")} 与 ${texInline("(2,1,0)")} 是不同的向量。`,
      },
      {
        title: "方程组的两种读法",
        ponder: {
          q: `${texInline("A")} 是 ${texInline("3\\times2")} 矩阵时，行图景和列图景分别画在哪个空间里？`,
          a: `行图景：三个方程是 ${texInline("\\mathbb R^2")} 中的三条直线，解是它们的公共点。列图景：两个列向量在 ${texInline("\\mathbb R^3")} 中组合出 ${texInline("b")}。`,
        },
        tex: String.raw`\underbrace{\begin{cases}a_{11}x_1+\cdots+a_{1n}x_n=b_1\\ \quad\vdots\\ a_{m1}x_1+\cdots+a_{mn}x_n=b_m\end{cases}}_{\text{按行读是 }m\text{ 个方程}}\iff \underbrace{x_1a_1+\cdots+x_na_n=b}_{\text{按列读是一个向量等式}}`,
        text: `按行读，每个方程是输入空间 ${texInline("F^n")} 里的一个约束，解是所有约束的公共点；按列读，${texInline("x")} 是列向量的权重，${texInline("Ax")} 落在输出空间 ${texInline("F^m")} 里。同一个 ${texInline("x")} 让两种读法同时成立。`,
      },
    ],
    pitfalls: [
      `把权重 ${texInline("x")} 和目标 ${texInline("b")} 混为一谈：${texInline("x")} 在输入空间，${texInline("b")} 在输出空间，两者维数可以不同。`,
      `以为 ${texInline("n>3")} 时向量没有意义。画不出来，但每个分量都参与运算。`,
      "以为两个向量在某个坐标平面上的投影相同，它们就相等。",
    ],
  },
  example: {
    title: "例题：不消元，用列组合找解",
    question: `${texInline("A")} 的三列是 ${texInline("a_1=(1,2,6)^T")}，${texInline("a_2=(2,5,-3)^T")}，${texInline("a_3=(3,2,1)^T")}，${texInline("b=(6,4,2)^T")}。已知 ${texInline("\\det A=-77")}。求 ${texInline("Ax=b")} 的解。`,
    choices: [
      { correct: true, text: `${texInline("x=(0,0,2)")}，因为 ${texInline("b=2a_3")}；${texInline("\\det A\\ne0")}，所以这是唯一解。` },
      { text: `${texInline("x=(6,4,2)")}，因为解就是 ${texInline("b")} 的坐标。` },
      { text: `${texInline("x=(2,0,0)")}，因为 ${texInline("2a_1")} 的第二个分量与 ${texInline("b")} 一致。` },
      { text: "不做消元就无法确定。" },
    ],
    steps: [
      `观察：${texInline("2a_3=(6,4,2)^T=b")}。`,
      `所以 ${texInline("0\\cdot a_1+0\\cdot a_2+2\\cdot a_3=b")}，即 ${texInline("x=(0,0,2)")} 是一个解。`,
      `${texInline("\\det A=-77\\ne0")}，方程组只有一个解。`,
      `按行检验：三个平面都经过点 ${texInline("(0,0,2)")}。`,
    ],
  },
  quiz: [
    {
      question: `同一个 ${texInline("A")}，把 ${texInline("b")} 换成 ${texInline("(4,4,7)^T")}，解是什么？`,
      answer: `${texInline("x=(1,0,1)")}，因为 ${texInline("a_1+a_3=(4,4,7)^T")}。`,
    },
    {
      question: `${texInline("u=(1,0,2,-1)")}，${texInline("v=(0,1,1,1)")}。${texInline("w=(2,-3,1,-5)")} 是 ${texInline("u")}、${texInline("v")} 的线性组合吗？把最后一个分量改成 0 呢？`,
      answer: `是，${texInline("w=2u-3v")}：前两个分量定出系数 2 和 −3，后两个分量正好吻合。改成 0 以后，系数仍被前两个分量定为 2、−3，第四个分量对不上，就不是了。`,
    },
    {
      question: `${texInline("A")} 是 ${texInline("3\\times2")} 矩阵。${texInline("Ax=b")} 中的 ${texInline("x")} 与 ${texInline("b")} 分别属于哪个空间？`,
      answer: `${texInline("x\\in F^2")}，${texInline("b\\in F^3")}。`,
    },
  ],
  summary: [
    `${texInline("F^n")} 中的向量按分量相加、数乘；画不出来也能精确运算。`,
    `${texInline("Ax=b")} 按行读是 ${texInline("m")} 个方程的公共解，按列读是列向量组合出 ${texInline("b")}。`,
    "下一节研究：一组向量里，哪些真正带来了新方向。",
  ],
});


;/* content/ch3-section3.js */
defineChapter3Section("linear-dependence", {
  number: "§3",
  textbookSection: "线性相关性",
  title: "线性相关性",
  navTitle: "线性相关性",
  question: "一组向量里，哪些向量真正带来了新方向？为什么多的向量由少的向量线性表出，就一定相关？",
  goal: "理解线性相关、线性无关与张成的关系；会写出具体的线性关系；理解“多的由少的线性表出必相关”，掌握极大无关组与向量组的秩。",
  tags: ["线性相关", "线性无关", "张成", "极大无关组", "向量组的秩"],
  intro:
    "一个向量带来新方向，当且仅当它不能由前面的向量组合出来。在三维空间里，这件事看得见：新向量一旦落进前两个向量张成的平面，平行六面体就被压扁，体积变成 0。",
  concepts: [
    { label: "线性相关", text: `存在不全为零的 ${texInline("k_1,\\dots,k_s")}，使 ${texInline("k_1\\alpha_1+\\cdots+k_s\\alpha_s=0")}。` },
    { label: "极大无关组", text: "向量组中一个线性无关、并且能表出全部向量的部分组。" },
  ],
  textbook: { reference: "北大版《高等代数》第三章 §3", items: ["线性相关与线性无关", "向量组的线性表出", "极大线性无关组与向量组的秩"] },
  interactive: { type: "slot", title: "第三个向量有没有带来新方向" },
  lesson3d: {
    blocks: [
      {
        title: "相关 ⇔ 某个向量可由前面的向量表出",
        tex: String.raw`k_1\alpha_1+\cdots+k_s\alpha_s=0\ \text{有非零解}\iff \text{存在 }j,\ \alpha_j\in\operatorname{span}\{\alpha_1,\dots,\alpha_{j-1}\}`,
        text: `注意：相关组里并不是每个向量都能由其余向量表出。例如 ${texInline("\\{u,2u,w\\}")} 相关，但 ${texInline("w")} 不在 ${texInline("\\operatorname{span}\\{u,2u\\}")} 里。`,
      },
      {
        title: "多的由少的线性表出，必然相关",
        ponder: {
          q: `${texInline("\\mathbb R^3")} 中任意四个向量一定线性相关吗？`,
          a: `一定。它们都能由 ${texInline("e_1,e_2,e_3")} 线性表出，而 ${texInline("4>3")}。`,
        },
        text: `若 ${texInline("\\alpha_1,\\dots,\\alpha_r")} 都能由 ${texInline("\\beta_1,\\dots,\\beta_s")} 线性表出，并且 ${texInline("r>s")}，那么 ${texInline("\\alpha_1,\\dots,\\alpha_r")} 线性相关（教材 §3 定理 2）。直观地说，${texInline("s")} 个向量最多提供 ${texInline("s")} 个方向，多出来的向量不可能都是新方向。特别地，${texInline("F^n")} 中任意 ${texInline("n+1")} 个向量都相关。`,
      },
      {
        title: "极大无关组与秩",
        text: "由这个定理，同一向量组的任意两个极大无关组所含向量个数相同。这个共同的个数叫作向量组的秩。极大无关组本身一般不唯一。",
      },
    ],
    pitfalls: [
      "以为相关就是有两个向量共线。三个向量可以两两不共线，却落在同一个平面里。",
      "用看图或近似数值判断相关：体积很小但不为 0，仍然线性无关。",
      "以为极大无关组是唯一的。",
    ],
  },
  example: {
    title: "例题：求秩与全部极大无关组",
    question: `${texInline("v_1=(1,0,1)")}，${texInline("v_2=(0,1,1)")}，${texInline("v_3=(1,1,2)")}，${texInline("v_4=(1,-1,0)")}。这组向量的秩是多少？哪些部分组是极大无关组？`,
    choices: [
      { correct: true, text: `秩为 2；四个向量都在平面 ${texInline("x+y=z")} 上，任取两个都构成极大无关组，共 6 组。` },
      { text: `秩为 3；${texInline("\\{v_1,v_2,v_4\\}")} 是唯一的极大无关组。` },
      { text: `秩为 2；只有 ${texInline("\\{v_1,v_2\\}")} 是极大无关组。` },
      { text: "秩为 4，因为任意两个向量都不共线。" },
    ],
    steps: [
      `${texInline("v_3=v_1+v_2")}，${texInline("v_4=v_1-v_2")}，所以全部向量都能由 ${texInline("v_1,v_2")} 表出。`,
      `${texInline("v_1,v_2")} 不共线，线性无关，因此秩为 2。`,
      `四个向量的坐标都满足 ${texInline("x+y=z")}，它们在同一个过原点的平面上。`,
      "任意两个向量都不共线，在这个平面里任取两个就能张成整个平面，所以 6 个两元部分组都是极大无关组。",
    ],
  },
  quiz: [
    {
      question: `${texInline("v_1,v_2,v_3")} 线性无关。${texInline("v_1+v_2,\\ v_2+v_3,\\ v_3+v_1")} 呢？${texInline("v_1-v_2,\\ v_2-v_3,\\ v_3-v_1")} 呢？`,
      answer: `第一组线性无关（系数矩阵的行列式为 ${texInline("2\\ne0")}）；第二组相关，三者之和为 0。`,
    },
    {
      question: `${texInline("\\alpha_1,\\dots,\\alpha_4")} 都能由 ${texInline("\\beta_1,\\beta_2,\\beta_3")} 线性表出。${texInline("\\alpha")} 组一定相关吗？`,
      answer: "一定相关：4 个向量由 3 个向量线性表出。",
    },
    {
      question: `实验里把 ${texInline("v_3")} 拖到 ${texInline("(1,1,\\tfrac32)")}，体积为 ${texInline("-\\tfrac12")}。这三个向量相关吗？`,
      answer: `不相关。体积不为 0，${texInline("v_3")} 不在平面里；看起来“几乎共面”不等于共面。`,
    },
  ],
  summary: [
    "线性相关 ⇔ 存在非零组合等于 0 ⇔ 某个向量可由前面的向量表出。",
    "多的由少的线性表出，必然相关；因此极大无关组所含向量个数确定，这就是秩。",
    "下一节把秩搬到矩阵上：行向量组和列向量组的秩为什么相等。",
  ],
});


;/* content/ch3-section4.js */
defineChapter3Section("matrix-rank", {
  number: "§4",
  textbookSection: "矩阵的秩",
  title: "矩阵的秩",
  navTitle: "矩阵的秩",
  question: "行变换会改变列向量，为什么列秩却不变？行秩与列秩为什么总是相等？",
  goal: "理解矩阵的行秩、列秩与最高阶非零子式；会用初等行变换求秩，并从原矩阵中选出一组线性无关的列。",
  tags: ["行秩", "列秩", "行空间", "列空间", "子式"],
  intro:
    "矩阵的行向量张成输入空间里的行空间，列向量张成输出空间里的列空间。这两个空间一般不是同一个，但维数永远相等，这个共同的维数就是矩阵的秩。",
  concepts: [
    { label: "秩", text: "行秩 = 列秩 = 最高阶非零子式的阶数。" },
    { label: "初等行变换", text: "不改变行空间，也不改变列之间的线性关系。" },
  ],
  textbook: { reference: "北大版《高等代数》第三章 §4", items: ["行秩与列秩", "矩阵的秩与子式", "用初等变换求秩"] },
  interactive: { type: "slot", title: "行变换：行空间不动，列空间在动，维数都不变" },
  lesson3d: {
    blocks: [
      {
        title: "行变换保持两样东西",
        text: `新行都是旧行的组合，逆变换又能倒回去，所以<strong>行空间不变</strong>，行秩不变。另一方面，${texInline("PA")}（${texInline("P")} 可逆）与 ${texInline("A")} 的齐次方程组同解：${texInline("c_1a_1+\\cdots+c_na_n=0")} 成立，当且仅当 ${texInline("c_1(Pa_1)+\\cdots+c_n(Pa_n)=0")} 成立。所以<strong>列之间的线性关系不变</strong>，列秩也不变。`,
      },
      {
        title: "在阶梯形上读出行秩 = 列秩",
        ponder: {
          q: "行空间和列空间可能是同一个平面吗？",
          a: `可能。${texInline("A")} 对称时，第 ${texInline("i")} 行就是第 ${texInline("i")} 列的转置，行空间与列空间在同一个 ${texInline("\\mathbb R^n")} 里重合；一般情况下两者不同，只是维数相同。`,
        },
        tex: String.raw`\operatorname{rank}A=\text{阶梯形中非零行的个数}=\text{主元列的个数}`,
        text: `阶梯形的非零行线性无关，主元列也线性无关，两者个数都等于主元个数 ${texInline("r")}。回到原矩阵：行秩 = 列秩 = ${texInline("r")}。<strong>${texInline("A")} 中</strong>与主元列同位置的列，就是 ${texInline("A")} 的列向量组的一个极大无关组。`,
      },
      {
        title: "用子式刻画秩",
        text: `${texInline("\\operatorname{rank}A=r")}，当且仅当 ${texInline("A")} 有一个 ${texInline("r")} 阶子式不为 0，而所有 ${texInline("r+1")} 阶子式都为 0。找非零 ${texInline("r")} 阶子式时，先在 ${texInline("A")} 的主元列里取 ${texInline("r")} 列，再从这 ${texInline("r")} 列中挑出 ${texInline("r")} 个线性无关的行；它们交叉处的子式不为 0。`,
      },
    ],
    pitfalls: [
      "数矩阵里非零元素的个数，或者在没化简的矩阵里数非零行。",
      "用阶梯形里的列作为原矩阵列空间的基。应该取原矩阵中同位置的列。",
      "以为行变换也不改变列空间。列空间会变，只有它的维数不变。",
    ],
  },
  example: {
    title: "例题：行空间与列空间是不是同一个平面",
    question: `${texInline(String.raw`A=\begin{bmatrix}1&2&3\\2&4&6\\0&1&1\end{bmatrix}`)}。求行空间与列空间的方程，它们是同一个平面吗？${texInline("\\operatorname{rank}A")} 是多少？`,
    choices: [
      { correct: true, text: `行空间是 ${texInline("z=x+y")}，列空间是 ${texInline("y=2x")}，不是同一个平面；两者都是 2 维，${texInline("\\operatorname{rank}A=2")}。` },
      { text: `两者是同一个平面 ${texInline("z=x+y")}，${texInline("\\operatorname{rank}A=2")}。` },
      { text: `第二行是第一行的 2 倍，所以 ${texInline("\\operatorname{rank}A=1")}。` },
      { text: `${texInline("A")} 是 ${texInline("3\\times3")} 矩阵，${texInline("\\operatorname{rank}A=3")}。` },
    ],
    steps: [
      `行：${texInline("r_2=2r_1")}，${texInline("r_1,r_3")} 不共线，都满足 ${texInline("z=x+y")}，所以行空间是平面 ${texInline("z=x+y")}。`,
      `列：${texInline("c_3=c_1+c_2")}，${texInline("c_1=(1,2,0)^T,\\ c_2=(2,4,1)^T")} 不共线，都满足 ${texInline("y=2x")}，所以列空间是平面 ${texInline("y=2x")}。`,
      `两个平面不同，但都是 2 维，所以 ${texInline("\\operatorname{rank}A=2")}。`,
      `非零的 2 阶子式：主元列是第 1、2 列，其中第 1、3 行线性无关，${texInline(String.raw`\begin{vmatrix}1&2\\0&1\end{vmatrix}=1`)}。第 1、2 行不行：${texInline(String.raw`\begin{vmatrix}1&2\\2&4\end{vmatrix}=0`)}。`,
    ],
  },
  quiz: [
    {
      question: `对上面的 ${texInline("A")} 做 ${texInline(String.raw`R_2\leftarrow R_2-2R_1`)}。列空间变了吗？维数呢？${texInline("c_3=c_1+c_2")} 还成立吗？`,
      answer: `列空间从 ${texInline("y=2x")} 变成 ${texInline("y=0")}，变了；维数仍是 2；关系 ${texInline("c_3=c_1+c_2")} 仍然成立。`,
    },
    {
      question: `${texInline("3\\times5")} 矩阵的秩最大是多少？${texInline("Ax=0")} 的解空间维数至少是多少？`,
      answer: `秩最大是 3；解空间维数至少是 ${texInline("5-3=2")}。`,
    },
    {
      question: `${texInline("u")}、${texInline("v")} 是非零列向量，${texInline("uv^T")} 的秩是多少？它的行空间和列空间分别是什么？`,
      answer: `秩为 1；列空间是 ${texInline("u")} 方向的直线，行空间是 ${texInline("v")} 方向的直线。`,
    },
  ],
  summary: [
    "初等行变换不改变行空间，也不改变列之间的线性关系。",
    "所以行秩 = 列秩，它等于阶梯形的主元个数，也等于最高阶非零子式的阶数。",
    `下一节用秩判断方程组 ${texInline("Ax=b")} 是否有解。`,
  ],
});


;/* content/ch3-section5.js */
defineChapter3Section("solvability", {
  number: "§5",
  textbookSection: "线性方程组有解判别定理",
  title: "线性方程组有解判别定理",
  navTitle: "有解判别",
  question: `不解方程，怎样判断 ${texInline("Ax=b")} 有没有解？“增广矩阵的秩多出 1”在几何上是什么样子？`,
  goal: `理解 ${texInline("Ax=b")} 有解当且仅当 ${texInline("b")} 属于 ${texInline("A")} 的列空间，当且仅当 ${texInline("\\operatorname{rank}A=\\operatorname{rank}[A\\mid b]")}；有解时，再用秩判断解是否唯一。`,
  tags: ["列空间", "增广矩阵", "有解判别", "三棱柱"],
  intro:
    `${texInline("Ax")} 取遍 ${texInline("A")} 的各列的全部组合，这些组合构成列空间。方程组有解，就是 ${texInline("b")} 落在列空间里。把 ${texInline("b")} 拖出列空间，增广矩阵多出一个主元，秩加 1。`,
  concepts: [
    { label: "有解判别", text: `${texInline("Ax=b")} 有解 ⇔ ${texInline("\\operatorname{rank}A=\\operatorname{rank}[A\\mid b]")}。` },
    { label: "唯一性", text: "有解时，秩等于未知量个数 ⇔ 解唯一。" },
  ],
  textbook: { reference: "北大版《高等代数》第三章 §5", items: ["有解判别定理", "解的个数"] },
  interactive: { type: "slot", title: "把 b 拖离列空间，三个平面失去公共线" },
  lesson3d: {
    blocks: [
      {
        title: "有解判别定理",
        ponder: {
          q: "方程个数比未知量多（例如 5 个方程、3 个未知量），一定无解吗？",
          a: `不一定。只要 ${texInline("b")} 落在列空间里就有解；例如 ${texInline("b=0")} 时总有零解。`,
        },
        tex: String.raw`Ax=b\ \text{有解}\iff b\in\operatorname{span}\{a_1,\dots,a_n\}\iff\operatorname{rank}A=\operatorname{rank}[A\mid b]`,
        text: `${texInline("b")} 能由各列表出，加入 ${texInline("b")} 就不会增加新的方向，秩不变；${texInline("b")} 不能由各列表出，它就是一个新方向，秩加 1。增广矩阵只比 ${texInline("A")} 多一列，所以秩最多多 1。`,
      },
      {
        title: "解的个数",
        tex: String.raw`\operatorname{rank}A=\operatorname{rank}[A\mid b]=r:\quad r=n\Rightarrow\text{唯一解},\qquad r<n\Rightarrow\text{无穷多解（有 }n-r\text{ 个自由未知量）}`,
      },
      {
        title: "偏离量从哪里来",
        text: `实验中的 ${texInline("A")} 满足“第 3 行 = 第 1 行 + 第 2 行”，所以要有解，${texInline("b")} 也必须满足同样的关系 ${texInline("b_3=b_1+b_2")}。消元到最后一行得到 ${texInline(String.raw`[0\ 0\ 0\mid b_3-b_1-b_2]`)}：偏离量不为 0，这一行就是矛盾行。有没有解由它是否精确为 0 决定，与 ${texInline("b")} 离列空间多远无关。`,
      },
    ],
    pitfalls: [
      "以为方程比未知量多就一定无解，或者方阵一定有解。",
      "以为无解一定是因为有两个平行平面。三个平面可以两两相交成三条平行线，仍然没有公共点。",
      "把“有没有解”和“解是否唯一”混成一步判断。",
    ],
  },
  example: {
    title: "例题：先判断，再求解",
    question: `${texInline(String.raw`A=\begin{bmatrix}1&0&1\\0&1&1\\1&1&2\end{bmatrix}`)}。分别取 ${texInline("b=(1,2,3)^T")} 与 ${texInline("b'=(1,2,4)^T")}，判断 ${texInline("Ax=b")} 是否有解。`,
    choices: [
      { correct: true, text: `${texInline("b")} 有解，并且有无穷多解；${texInline("b'")} 无解，此时 ${texInline(String.raw`\operatorname{rank}[A\mid b']=3>\operatorname{rank}A=2`)}。` },
      { text: `两者都有唯一解，因为 ${texInline("A")} 是方阵。` },
      { text: `两者都无解，因为 ${texInline("A")} 的行列式为 0。` },
      { text: `${texInline("b")} 有唯一解，${texInline("b'")} 有无穷多解。` },
    ],
    steps: [
      `${texInline("A")} 的第三行等于前两行之和，${texInline("\\operatorname{rank}A=2")}。有解必须满足 ${texInline("b_3=b_1+b_2")}。`,
      `${texInline("b=(1,2,3)")}：${texInline("3=1+2")}，有解。消元得 ${texInline("x=(1,2,0)+t(-1,-1,1)")}，三个平面交于一条直线。`,
      `${texInline("b'=(1,2,4)")}：化简后最后一行是 ${texInline(String.raw`[0\ 0\ 0\mid 1]`)}，${texInline(String.raw`\operatorname{rank}[A\mid b']=3`)}，无解。`,
      `几何上，${texInline("b'")} 离开了列空间平面；三个平面两两相交，三条交线互相平行，形成三棱柱。`,
    ],
  },
  quiz: [
    {
      question: `对上面这个 ${texInline("A")}，使方程有解的 ${texInline("b")} 组成什么集合？`,
      answer: `过原点的平面 ${texInline("b_3=b_1+b_2")}，也就是 ${texInline("A")} 的列空间。`,
    },
    {
      question: `${texInline("A")} 是 ${texInline("3\\times4")} 矩阵，${texInline("\\operatorname{rank}A=3")}。${texInline("Ax=b")} 对每个 ${texInline("b")} 都有解吗？解有几个？`,
      answer: `都有解，因为列空间是整个 ${texInline("F^3")}；有 ${texInline("4-3=1")} 个自由未知量，所以有无穷多解。`,
    },
    {
      question: `${texInline(String.raw`\operatorname{rank}[A\mid b]`)} 可能等于 ${texInline("\\operatorname{rank}A+2")} 吗？`,
      answer: "不可能。增广矩阵只多一列，秩最多增加 1。",
    },
  ],
  summary: [
    `${texInline("Ax=b")} 有解 ⇔ ${texInline("b")} 在列空间里 ⇔ ${texInline(String.raw`\operatorname{rank}A=\operatorname{rank}[A\mid b]`)}。`,
    "有解时，秩等于未知量个数则唯一，小于则有自由未知量。",
    "下一节回答：有无穷多解时，全部解长什么样。",
  ],
});


;/* content/ch3-section6.js */
defineChapter3Section("solution-structure", {
  number: "§6",
  textbookSection: "线性方程组解的结构",
  title: "线性方程组解的结构",
  navTitle: "解的结构",
  question: `为什么全部解等于“一个特解加上齐次方程组的全部解”？改变 ${texInline("b")} 时，解集怎样移动？`,
  goal: `掌握齐次方程组的基础解系与解空间维数 ${texInline("n-r")}；会写出非齐次方程组的通解 ${texInline("x=x_0+k_1\\eta_1+\\cdots+k_s\\eta_s")}。`,
  tags: ["基础解系", "解空间", "特解", "通解"],
  intro:
    "两个非齐次解相减，得到的是齐次解。所以只要找到一个解，其余的解都是在它上面加一个齐次解。几何上，解集就是齐次解空间整体平移到特解那里。",
  concepts: [
    { label: "基础解系", text: `齐次方程组解空间的一组基，含 ${texInline("n-r")} 个向量。` },
    { label: "通解", text: `${texInline("x=x_0+k_1\\eta_1+\\cdots+k_s\\eta_s")}。` },
  ],
  textbook: { reference: "北大版《高等代数》第三章 §6", items: ["齐次方程组的基础解系", "非齐次方程组解的结构"] },
  interactive: { type: "slot", title: "解集是零空间平移过去的样子" },
  lesson3d: {
    blocks: [
      {
        title: "齐次方程组：解构成子空间",
        tex: String.raw`\dim\{x: Ax=0\}=n-\operatorname{rank}A`,
        text: "两个齐次解的和、数乘仍是齐次解，所以解集是一个子空间，称为解空间。阶梯形中每个自由未知量恰好对应基础解系中的一个向量：令它取 1、其余自由未知量取 0，解出主元未知量即可。",
      },
      {
        title: "非齐次方程组：特解 + 解空间",
        ponder: {
          q: "解空间是子空间，非齐次方程组的解集为什么不是？",
          a: `${texInline("b\\ne0")} 时解集不含零向量，两个解之和也不再是解。它是把子空间整体平移后的结果，几何上是一条不过原点的直线或一个不过原点的平面。`,
        },
        tex: String.raw`Ax_0=b\ \Longrightarrow\ \{x:Ax=b\}=\{x_0+\eta:\ A\eta=0\}`,
        text: `若 ${texInline("Ax=b")}，则 ${texInline("A(x-x_0)=0")}，所以 ${texInline("x-x_0")} 是齐次解；反过来，${texInline("A(x_0+\\eta)=b+0=b")}。${texInline("b\\ne0")} 时，原点不是解。解集是把 ${texInline("n-r")} 维解空间平移到 ${texInline("x_0")} 处得到的（三维里可能是一个点、一条直线或一个平面），它与解空间平行。`,
      },
    ],
    pitfalls: [
      "给特解也乘上任意常数。通解里只有齐次部分带任意常数。",
      `以为非齐次方程组的解集对加法封闭：两个解之和满足的是 ${texInline("Ax=2b")}。`,
      "自由未知量选得不同，通解看起来不一样，就以为算错了。",
    ],
  },
  example: {
    title: "例题：写出通解，并看它怎样随 b 移动",
    question: `求 ${texInline("x+y+z=3")}，${texInline("x+2y-z=4")} 的全部解。若右端改为 ${texInline("(3,5)")}，解集怎样变化？`,
    choices: [
      { correct: true, text: `${texInline("x=(2,1,0)+t(-3,2,1)")}；改右端后为 ${texInline("(1,2,0)+t(-3,2,1)")}，方向不变，直线平移。` },
      { text: `${texInline("x=t(2,1,0)")}；改右端后直线绕原点转动。` },
      { text: `${texInline("x=(2,1,0)+t(-3,2,1)")}；改右端后解集变成一个平面。` },
      { text: "两个方程三个未知量，无法确定全部解。" },
    ],
    steps: [
      `消元：${texInline(String.raw`R_2\leftarrow R_2-R_1`)} 得 ${texInline("y-2z=1")}。${texInline("z")} 是自由未知量。`,
      `令 ${texInline("z=0")}，得特解 ${texInline("x_0=(2,1,0)")}。`,
      `齐次方程组令 ${texInline("z=1")}，得 ${texInline("\\eta=(-3,2,1)")}，通解 ${texInline("x=(2,1,0)+t(-3,2,1)")}。`,
      `右端改为 ${texInline("(3,5)")}：特解变为 ${texInline("(1,2,0)")}，方向仍是 ${texInline("(-3,2,1)")}。两条解线都与解空间 ${texInline("t(-3,2,1)")} 平行。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("x_1,x_2")} 都是 ${texInline("Ax=b")}（${texInline("b\\ne0")}）的解。${texInline("x_1+x_2")}、${texInline("2x_1-x_2")}、${texInline("\\tfrac12(x_1+x_2)")}、${texInline("x_1-x_2")} 中，哪些仍是 ${texInline("Ax=b")} 的解？`,
      answer: `只有 ${texInline("2x_1-x_2")} 和 ${texInline("\\tfrac12(x_1+x_2)")}（系数之和为 1）；${texInline("x_1-x_2")} 是齐次解；${texInline("x_1+x_2")} 满足 ${texInline("Ax=2b")}。`,
    },
    {
      question: `${texInline("A")} 是 ${texInline("5\\times7")} 矩阵，${texInline("\\operatorname{rank}A=4")}。基础解系含几个向量？若 ${texInline("Ax=b")} 有解，解集是几维的？`,
      answer: "3 个；解集是一个 3 维解空间平移后的结果。",
    },
    {
      question: `${texInline("(2,1,0)+t(-3,2,1)")} 与 ${texInline("(-1,3,1)+u(6,-4,-2)")} 表示同一个解集吗？`,
      answer: `是。两个特解之差 ${texInline("(3,-2,-1)")} 在解空间里，两个方向也共线。`,
    },
  ],
  summary: [
    `齐次方程组的解构成 ${texInline("n-r")} 维解空间，基础解系是它的一组基。`,
    `非齐次方程组的全部解 = 一个特解 + 解空间；改变 ${texInline("b")} 时，只要仍然有解，解集就只平移、不转动。`,
    "选学 §7 把消元思想推广到两个变量的高次方程组。",
  ],
});


;/* content/ch3-section7.js */
defineChapter3Section("binary-higher-degree", {
  number: "＊§7",
  textbookSection: "二元高次方程组",
  title: "二元高次方程组",
  navTitle: "二元高次",
  question: "当方程不再线性时，消元思想还能怎样工作？怎样把两个变量的曲线交点问题压缩成一个变量的候选根问题？",
  goal: "理解二元多项式方程组的公共解是代数曲线交点；会选择消元变量；认识Sylvester 矩阵与结式；能够从结式得到候选根、回代求另一坐标并逐点验解，同时识别重根与次数退化。",
  tags: ["选学", "多项式消元", "Sylvester 矩阵", "结式", "回代验解"],
  intro:
    `把两个方程都看成关于 ${texInline("x")} 的多项式，系数是 ${texInline("y")} 的多项式。结式 ${texInline("R(y)")} 为 0 的 ${texInline("y")} 是交点纵坐标的候选；每个候选都要回代求 ${texInline("x")}，并代回两个原方程检验。`,
  videoPlan: {
    title: "从直线交点到曲线交点",
    duration: "约 2.5 分钟",
    scenes: [
      "两条直线的消元逐渐过渡为圆与直线的消元。",
      "把 f、g 按 x 的次数排列系数，错位堆叠成Sylvester 矩阵。",
      "行列式化为只含 y 的结式多项式。",
      "候选 y 回代求 x，未验证点与已验证交点使用不同标记。",
    ],
  },
  concepts: [
    {
      label: "曲线交点",
      text: `${texInline(String.raw`f(x,y)=0`)} 与 ${texInline(String.raw`g(x,y)=0`)} 的公共解对应两条代数曲线的交点。`,
    },
    {
      label: "选择消元变量",
      text: `把 ${texInline("f")}、${texInline("g")} 看成关于 ${texInline("x")} 的多项式时，其系数是 ${texInline("y")} 的多项式；也可以反过来消去 ${texInline("y")}。不同选择影响计算复杂度。`,
    },
    {
      label: "Sylvester 矩阵",
      text: "把两多项式的系数按次数错位排列成方阵；其行列式就是关于被保留变量的结式。",
    },
    {
      label: "结式条件",
      text: `在次数保持正常时，${texInline(String.raw`\operatorname{Res}_x(f,g)=0`)} 等价于 ${texInline("f")}、${texInline("g")} 关于 ${texInline("x")} 有公共根。`,
    },
    {
      label: "候选与验解",
      text: "先解结式得到保留变量候选，再回代求被消去变量；每个候选点必须代回原方程，特别留意首项系数为零、重根与复根。",
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第三章 ＊§7",
    page: "",
    items: ["二元高次方程组", "消元法", "结式", "回代与验解", "重根和退化情形"],
  },
  interactive: {
    type: "slot",
    title: "实验：从曲线交点到一元方程",
    description: "在相交、相切与无实交点三个预设中，逐步显示系数表、Sylvester 矩阵、结式、候选根和回代验证。",
    task: "先处理单位圆与直线 x=y，消去 x；再切换到抛物线与切线，观察结式出现重根并与相切几何对应。",
    prompts: [
      "逐步点击‘整理系数—构造矩阵—计算结式—求候选—回代验解’。",
      "比较相交预设的两个单根与相切预设的一个二重根。",
      "在无实交点预设中区分复候选与实平面中的交点。",
      "切换消元方向，确认最终通过验解的交点集合一致。",
    ],
  },
  example: {
    title: "例题：单位圆与直线的结式",
    question: `求 ${texInline(String.raw`x^2+y^2=1`)} 与 ${texInline(String.raw`x-y=0`)} 的公共实解。要求把两式看成关于 ${texInline("x")} 的多项式，写出Sylvester 矩阵与结式，并回代验解。`,
    choices: [
      {
        correct: true,
        text: `结式为 ${texInline(String.raw`2y^2-1`)}；故 ${texInline(String.raw`y=\pm\frac{\sqrt2}{2}`)}，由 ${texInline(String.raw`x=y`)} 得两个交点 ${texInline(String.raw`\left(\tfrac{\sqrt2}{2},\tfrac{\sqrt2}{2}\right)`)} 与 ${texInline(String.raw`\left(-\tfrac{\sqrt2}{2},-\tfrac{\sqrt2}{2}\right)`)}。`,
      },
      { text: "结式为零的每个根都自动对应原方程组解，无需回代。" },
      { text: "圆与直线的次数分别为 2 和 1，因此一定有三个实交点。" },
      { text: `消去 ${texInline("x")} 后只能得到 ${texInline(String.raw`y=0`)}。` },
    ],
    steps: [
      `写成 ${texInline(String.raw`f=x^2+(y^2-1)`)} 与 ${texInline(String.raw`g=x-y`)}。`,
      `Sylvester 矩阵可取 ${texInline(String.raw`\begin{bmatrix}1&0&y^2-1\\1&-y&0\\0&1&-y\end{bmatrix}`)}。`,
      `其行列式为 ${texInline(String.raw`2y^2-1`)}。`,
      `解得 ${texInline(String.raw`y=\pm\sqrt2/2`)}。`,
      `由 ${texInline(String.raw`x-y=0`)} 得 ${texInline(String.raw`x=y`)}。`,
      "把两点代回两个原方程，均成立，因此都是已验证实交点。",
    ],
  },
  quiz: [
    {
      question: `解 ${texInline("x^2+y^2=5,\\ xy=2")} 时，候选 ${texInline("y=1")} 给出 ${texInline("x^2=4")}。${texInline("(-2,1)")} 是解吗？`,
      answer: `不是。${texInline("x")} 必须同时是 ${texInline("f(x,1)=x^2-4")} 与 ${texInline("g(x,1)=x-2")} 的根，只有 ${texInline("x=2")}。回代时要用两个方程。`,
    },
    {
      question: `${texInline("x^2+y^2=2")} 与 ${texInline("y=x^2")} 消去 ${texInline("x")} 得 ${texInline("R(y)=(y-1)^2(y+2)^2")}。二重根 ${texInline("y=1")} 表示两条曲线在那里相切吗？`,
      answer: `不是。${texInline("y=1")} 对应两个横截交点 ${texInline("(1,1)")} 与 ${texInline("(-1,1)")}，它们纵坐标相同，所以 ${texInline("y=1")} 是二重根。${texInline("y=-2")} 回代得 ${texInline("x=\\pm\\sqrt2\\,i")}，没有实交点。`,
    },
    {
      question: `${texInline("xy=1")} 与 ${texInline("xy=2")} 消去 ${texInline("x")} 得 ${texInline("R(y)=-y")}。${texInline("y=0")} 为什么不是解？`,
      answer: `两个方程关于 ${texInline("x")} 的首项系数都是 ${texInline("y")}，在 ${texInline("y=0")} 处同时为 0，结式的根在这里只是伪候选。回代得 ${texInline("0=1")}，不成立。`,
    },
  ],
  summary: [
    "结式把两条曲线的交点问题化为一个单变量多项式的根。",
    "结式的根只是候选：可能对应复交点，也可能来自首项系数同时为零的伪候选。",
    "每个候选都要回代求另一坐标，并代回两个原方程检验。",
  ],
  exercises: [
    "对单位圆与 x=y 改为消去 y，比较两个Sylvester 矩阵与最终交点。",
    "研究 y=x² 与 y=2x−1，说明结式二重根为什么对应相切点。",
  ],
});


;/* content/ch3.js */
registerAlgebraChapter({
  id: "ch3",
  icon: "3",
  title: "第三章 线性方程组",
  subtitle: "约束、秩与解空间",
  summary:
    `先用可逆行变换整理约束，再把未知量视为 ${texInline("F^n")} 中的向量；线性相关与秩度量独立信息，系数秩与增广秩决定目标是否可达，最后把全部解写成特解加零空间。同一消元思想还能求解二元高次方程组（选学 §7）。`,
  sections: [
    { id: "elimination", number: "§1", title: "消元法", navTitle: "消元法" },
    { id: "n-vector-space", number: "§2", title: "n维向量空间", navTitle: "n维向量空间" },
    { id: "linear-dependence", number: "§3", title: "线性相关性", navTitle: "线性相关性" },
    { id: "matrix-rank", number: "§4", title: "矩阵的秩", navTitle: "矩阵的秩" },
    { id: "solvability", number: "§5", title: "线性方程组有解判别定理", navTitle: "有解判别" },
    { id: "solution-structure", number: "§6", title: "线性方程组解的结构", navTitle: "解的结构" },
    { id: "binary-higher-degree", number: "＊§7", title: "二元高次方程组", navTitle: "二元高次" },
  ],
});


;/* content/ch3-assemble.js */
/* Apply Chapter 3 section patches after ch3.js registration. */
(() => {
  const chapter = algebraContent.chapters.find((item) => item.id === "ch3");
  const patches = window.getChapter3SectionPatches?.();
  if (!chapter || !patches) return;

  const order = [
    "elimination",
    "n-vector-space",
    "linear-dependence",
    "matrix-rank",
    "solvability",
    "solution-structure",
    "binary-higher-degree",
  ];

  const byId = new Map();
  for (const [id, patch] of patches.entries()) byId.set(id, patch);

  chapter.sections = order.map((id) => {
    const patch = byId.get(id);
    if (!patch) {
      console.warn("Missing Chapter 3 section patch:", id);
      return { id, number: "§?", title: id, navTitle: id };
    }
    return { id, ...patch };
  });
})();


;/* content/ch4-registry.js */
/*
 * Chapter 4 section data registry.
 *
 * Each section module declares only the fields it owns. The base chapter stays
 * in ch4.js; ch4-assemble.js applies these patches once after registration.
 * This replaces the previous chain of registerAlgebraChapter wrappers.
 */
(() => {
  const patches = new Map();

  window.defineChapter4Section = function defineChapter4Section(sectionId, patch) {
    if (!sectionId || !patch || typeof patch !== "object") {
      throw new TypeError("Chapter 4 section patches require an id and an object.");
    }
    patches.set(sectionId, patch);
  };

  window.getChapter4SectionPatches = function getChapter4SectionPatches() {
    return patches;
  };
})();


;/* content/ch4-section1.js */
defineChapter4Section("matrix-language", {
  number: "§1",
  textbookSection: "矩阵概念的一些背景",
  title: "矩阵概念的一些背景",
  navTitle: "矩阵概念背景",
  question: "矩阵为什么会出现？一张有行有列的数字表，怎样同时记录数据、方程组和方向变化？",
  goal: "读懂矩阵的行、列、阶、元素与相等；理解矩阵尺寸和输入输出维数的关系；最后从两列读出二维变换对基本方向的作用。",
  tags: ["行列与阶", "位置结构", "输入输出", "先看列"],
  intro:
    "矩阵把一组彼此相关的数字连同它们的位置一起保存下来。行和列可以对应样本与变量、方程与未知量，也可以记录基本方向经过变换后的坐标。先读清结构，再解释这些数字来自哪里。",
  concepts: [
    {
      label: "行、列与阶",
      text: `${texInline("m\\times n")} 表示 ${texInline("m")} 行 ${texInline("n")} 列；行数和列数共同决定矩阵的形状。`,
    },
    {
      label: "元素位置",
      text: `${texInline("a_{ij}")} 表示第 ${texInline("i")} 行第 ${texInline("j")} 列的元素，下标先读行、再读列。`,
    },
    {
      label: "矩阵相等",
      text: "两个矩阵先要形状相同，再要求所有对应位置的元素分别相等。",
    },
    {
      label: "输入与输出",
      text: `${texInline("m\\times n")} 矩阵接收 ${texInline("n")} 个输入坐标，产生 ${texInline("m")} 个输出坐标。`,
    },
    {
      label: "列的含义",
      text: `把矩阵看成变换记录时，第 ${texInline("j")} 列就是 ${texInline("Ae_j")}，记录第 ${texInline("j")} 个标准基向量的去向。`,
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第四章",
    page: "",
    items: [
      "矩阵出现的背景与记录作用",
      "矩阵的行、列、阶与元素",
      "矩阵相等和基础矩阵类型",
      "矩阵尺寸与输入输出坐标数",
      "矩阵列向量的几何读取",
    ],
  },
  interactive: {
    type: "slot",
    title: "实验：同一张表，三种读法",
    description: "同一个 2×2 矩阵同时读作数据表、方程组的系数和两个方向 Ae₁、Ae₂。",
  },
  example: {
    title: "例题：从矩阵的两列读出平面变化",
    question: `设 ${texInline("A=\\begin{bmatrix}2&1\\\\0&1\\end{bmatrix}")}。不逐点代入，说明 ${texInline("A")} 对平面网格的大致作用，并判断它是否会把平面压扁。`,
    choices: [
      {
        correct: true,
        text: `第一列给出 ${texInline("Ae_1=(2,0)^T")}，第二列给出 ${texInline("Ae_2=(1,1)^T")}；网格横向拉伸并向右剪切，两列不共线，所以平面没有坍缩。`,
      },
      {
        text: `第一列给出 ${texInline("Ae_2=(2,0)^T")}，第二列给出 ${texInline("Ae_1=(1,1)^T")}；矩阵的列需要从右向左读取。`,
      },
      { text: "两列都含有非零元素，所以两个标准基向量都保持不变。" },
      { text: "必须把平面上每个点逐一代入，单看两列无法判断网格变化。" },
    ],
    steps: [
      `第一列是 ${texInline("Ae_1=(2,0)^T")}：水平方向仍沿 ${texInline("x")} 轴，但长度变为原来的 2 倍。`,
      `第二列是 ${texInline("Ae_2=(1,1)^T")}：竖直方向保留向上分量，同时向右偏移。`,
      `任意向量都由 ${texInline("e_1")}、${texInline("e_2")} 线性组合而成，所以两列的去向会带动整张网格。`,
      "两列不共线，仍能张成整个平面；因此这是横向拉伸与剪切的组合，不会把平面压扁。",
    ],
  },
  quiz: [
    {
      question: `${texInline("a_{23}")} 位于矩阵的哪个位置？`,
      answer: "第 2 行第 3 列。",
    },
    {
      question: "两个矩阵含有完全相同的一组数字，它们一定相等吗？",
      answer: "不一定。还要检查形状和每个数字所在的对应位置。",
    },
    {
      question: `${texInline("3\\times2")} 矩阵接收几维输入，产生几维输出？`,
      answer: "接收 2 维输入，产生 3 维输出。",
    },
    {
      question: "一个 2 阶矩阵的两列都非零，是否一定不会把平面压扁？",
      answer: "不一定。若两列共线，它们仍然只提供一个独立方向，网格会压到一条直线上。",
    },
  ],
  summary: [
    `矩阵同时保存数字和位置；${texInline("a_{ij}")} 的下标先读行、再读列。`,
    "矩阵可以来自数据、方程组和方向变化，但这些来源都依赖稳定的行列结构。",
    `${texInline("m\\times n")} 矩阵把 ${texInline("n")} 个输入坐标组织成 ${texInline("m")} 个输出坐标。`,
    "二维变换中，先读两列，就能抓住两个基本方向以及整张网格的去向。",
  ],
  exercises: [
    `写出一个一般的 ${texInline("2\\times3")} 矩阵，并指出 ${texInline("a_{23}")} 的位置。`,
    `构造一个两列都非零但会把平面压到直线上的 2 阶矩阵。`,
  ],
});


;/* content/ch4-section2.js */
defineChapter4Section("matrix-operations", {
  number: "§2",
  textbookSection: "矩阵的运算",
  title: "矩阵的运算",
  navTitle: "矩阵的运算",
  question: "矩阵为什么能相加、数乘和相乘？矩阵乘法怎样把两个连续过程合成一个过程？",
  goal: "掌握加法、数乘与转置；再从尺寸、行乘列、看列和过程复合四个入口理解矩阵乘法。",
  tags: ["加法与数乘", "转置", "矩阵乘法", "过程复合"],
  intro: "加法与数乘是在相同位置上组合数字；转置改变行列的读取方向；矩阵乘法先检查尺寸，再把右边矩阵的输出交给左边矩阵。",
  videoPlan: {
    title: "矩阵乘法为什么表示复合",
    duration: "约 2—3 分钟",
    scenes: [
      "从向量 x 出发，先经过 B，得到中间向量 Bx。",
      "保持中间向量的颜色与位置连续，再让 A 作用到 Bx，得到 A(Bx)。",
      "把两次网格变化压缩成一次变化，记作 AB。",
      "强调 ABx 从靠近 x 的 B 开始读取。",
      "切到列视角：AB 的每一列都是 A 作用于 B 的对应列。",
      "切到行乘列：一个输出位置由 A 的一行与 B 的一列配对得到。",
      "让三种画面使用同一组矩阵和颜色，最后合并为同一个乘积。",
    ],
    ttsDraft: "矩阵乘法记录两个过程的复合。ABx 先读右边的 B，再读左边的 A。复合、看列和行乘列是同一个乘积的三种观察方式。",
  },
  concepts: [
    { label: "同型相加", text: `若 ${texInline("A,B")} 都是 ${texInline("m\\times n")} 矩阵，则 ${texInline("(A+B)_{ij}=a_{ij}+b_{ij}")}。` },
    { label: "数乘", text: `${texInline("(\\lambda A)_{ij}=\\lambda a_{ij}")}；同一个数作用于所有位置。` },
    { label: "转置", text: `${texInline("(A^T)_{ij}=a_{ji}")}；第 ${texInline("i")} 行变成第 ${texInline("i")} 列。` },
    { label: "转置倒序", text: `${texInline("(AB)^T=B^TA^T")}；转置复合过程时，作用顺序随之反转。` },
    { label: "乘法条件", text: `若 ${texInline("A")} 为 ${texInline("m\\times n")}，${texInline("B")} 为 ${texInline("n\\times p")}，则 ${texInline("AB")} 为 ${texInline("m\\times p")}。` },
    { label: "行乘列", text: `${texInline("(AB)_{ij}=\\sum_{k=1}^{n}a_{ik}b_{kj}")}。` },
    { label: "复合顺序", text: `${texInline("ABx=A(Bx)")}；靠近输入的矩阵先作用。` },
    { label: "单位矩阵", text: `${texInline("EA=A")} 且 ${texInline("AE=A")}。` },
    { label: "结合律", text: `${texInline("(AB)C=A(BC)")}；打包方式可以改变，实际作用顺序保持不变。` },
    { label: "通常不交换", text: `${texInline("AB")} 与 ${texInline("BA")} 通常不同，但某些特殊矩阵仍然可以交换。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第四章",
    page: "",
    items: [
      "矩阵的加法、数乘及其运算律",
      "矩阵的转置及转置公式",
      "矩阵乘法的尺寸条件与行乘列公式",
      "单位矩阵、结合律和分配律",
      "矩阵乘法通常不满足交换律",
    ],
  },
  visual: {
    type: "multiply",
    title: "同一个乘积，两个视角",
    description: "同一组矩阵贯穿复合与顺序比较。",
    task: `播放 ${texInline("B\\to A")}，再与“直接看 ${texInline("AB")}”对照终点，确认 ${texInline("ABx=A(Bx)")}；在“交换顺序”中比较 ${texInline("AB")} 与 ${texInline("BA")}。`,
    prompts: [],
  },
  example: {
    title: "例题：为什么 AB 和 BA 通常不同",
    question: `令 ${texInline("A=\\begin{bmatrix}2&0\\\\0&1\\end{bmatrix}")}，${texInline("B=\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}")}。计算 ${texInline("AB")} 与 ${texInline("BA")}；再用“先剪切还是先拉伸”解释右上角元素为何不同。`,
    choices: [
      { correct: true, text: `${texInline("AB=\\begin{bmatrix}2&2\\\\0&1\\end{bmatrix}")}，${texInline("BA=\\begin{bmatrix}2&1\\\\0&1\\end{bmatrix}")}；先剪切再拉伸会把剪切产生的水平偏移一起放大。` },
      { text: `${texInline("AB=\\begin{bmatrix}2&1\\\\0&1\\end{bmatrix}")}，${texInline("BA=\\begin{bmatrix}2&2\\\\0&1\\end{bmatrix}")}；矩阵按从左到右的顺序作用。` },
      { text: `${texInline("AB=BA=\\begin{bmatrix}2&2\\\\0&1\\end{bmatrix}")}；拉伸与剪切的顺序不影响结果。` },
      { text: `${texInline("AB")} 是对应位置相乘，所以 ${texInline("AB=\\begin{bmatrix}2&0\\\\0&1\\end{bmatrix}")}。` },
    ],
    steps: [
      `先检查尺寸：${texInline("A")} 与 ${texInline("B")} 都是 ${texInline("2\\times2")} 矩阵，所以两个方向的乘积都有定义。`,
      `计算 ${texInline("AB")}：${texInline("\\begin{bmatrix}2&0\\\\0&1\\end{bmatrix}\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}=\\begin{bmatrix}2&2\\\\0&1\\end{bmatrix}")}。它表示先做 ${texInline("B")} 的剪切，再做 ${texInline("A")} 的横向拉伸。`,
      `计算 ${texInline("BA")}：${texInline("\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}\\begin{bmatrix}2&0\\\\0&1\\end{bmatrix}=\\begin{bmatrix}2&1\\\\0&1\\end{bmatrix}")}。它表示先横向拉伸，再剪切。`,
      `两种顺序面对的中间图形不同，因此右上角分别得到 ${texInline("2")} 与 ${texInline("1")}。`,
      "结论：矩阵乘法记录过程复合，先后顺序会改变最终结果。",
    ],
  },
  quiz: [
    { question: `若 ${texInline("A")} 是 ${texInline("2\\times3")} 矩阵，${texInline("B")} 是 ${texInline("3\\times4")} 矩阵，${texInline("AB")} 的阶是什么？`, answer: `${texInline("AB")} 是 ${texInline("2\\times4")} 矩阵：中间的 3 匹配，结果保留外侧的 2 与 4。` },
    { question: `在 ${texInline("ABx")} 中，哪一个矩阵先作用？`, answer: `${texInline("B")} 先作用，先得到 ${texInline("Bx")}；随后 ${texInline("A")} 作用于这个中间结果。` },
    { question: `${texInline("AB")} 的第 ${texInline("j")} 列为什么等于 ${texInline("A")} 乘 ${texInline("B")} 的第 ${texInline("j")} 列？`, answer: `${texInline("ABe_j=A(Be_j)")}；而 ${texInline("Be_j")} 正是 ${texInline("B")} 的第 ${texInline("j")} 列。` },
    { question: `矩阵乘法满足结合律，是否意味着它也满足交换律？`, answer: `不意味着。${texInline("(AB)C=A(BC)")} 只改变括号；${texInline("AB=BA")} 则交换了过程顺序，通常不成立。` },
  ],
  summary: [
    "同型矩阵才能逐项相加；数乘作用于每一个位置；转置交换行与列。",
    "矩阵乘法先检查内部尺寸，结果形状由外侧尺寸决定。",
    "复合、看列和行乘列是同一个乘积的三种主视角。",
    "单位矩阵保持对象不变；结合律改变打包方式；交换顺序通常会改变结果。",
  ],
  exercises: [
    `设 ${texInline("A")} 为 ${texInline("3\\times2")} 矩阵，${texInline("B")} 为 ${texInline("2\\times5")} 矩阵。写出 ${texInline("AB")} 的阶，并判断 ${texInline("BA")} 是否有定义。`,
    `取 ${texInline("C=\\begin{bmatrix}0&1\\\\1&0\\end{bmatrix}")}。分别观察 ${texInline("AC")} 与 ${texInline("CA")} 为什么对应交换列与交换行。`,
  ],
});


;/* content/ch4-core.js */
defineChapter4Section("matrix-product-determinant-rank", {
  number: "§3",
  textbookSection: "矩阵乘积的行列式与秩",
  title: "矩阵乘积的行列式与秩",
  navTitle: "乘积的行列式与秩",
  question: "连续施加两个矩阵后，面积缩放和有效方向会怎样变化？秩到底在数什么？",
  goal: "把行列式理解为缩放因子，把秩理解为输出中仍然保留的独立方向数；再理解乘积为什么不会凭空增加秩。",
  tags: ["行列式", "秩", "有效维度"],
  intro: "矩阵乘积对应连续变换。连续缩放时，缩放因子相乘；一旦某一步已经把平面压到一条线，后面的变换只能继续处理这条线，不能重新制造第二个独立方向。",
  concepts: [
    { label: "行列式", text: `${texInline("\\det(A)")} 记录二维面积或高维体积的有向缩放因子。` },
    { label: "乘积行列式", text: `${texInline("\\det(AB)=\\det(A)\\det(B)")}；连续变换的缩放因子连续相乘。` },
    { label: "秩", text: "秩是矩阵列向量中独立方向的数量，也是输出空间的维数。" },
    { label: "乘积与秩", text: `${texInline("\\operatorname{rank}(AB)\\leq\\min\\{\\operatorname{rank}(A),\\operatorname{rank}(B)\\}")}；复合不会凭空恢复已经丢掉的方向。` },
  ],
  textbook: { reference: "北大版《高等代数》第四章", page: "", items: ["矩阵乘积的行列式", "矩阵的秩", "乘积与秩的关系"] },
  visual: { type: "rank", title: "交互图：秩是保留下来的方向数", description: "比较两列独立与两列共线的情况，再观察一个秩 1 变换被复合后为什么仍不能恢复成秩 2。" },
  example: {
    title: "例题：从列关系判断乘积的秩上界",
    question: `设 ${texInline("B")} 的两列相同，且 ${texInline("A")} 是任意可相乘的矩阵。说明 ${texInline("AB")} 的两列有什么关系，并给出 ${texInline("\\operatorname{rank}(AB)")} 的上界。`,
    choices: [
      { correct: true, text: `${texInline("AB")} 的两列仍然相同，因此 ${texInline("\\operatorname{rank}(AB)\\leq1")}。` },
      { text: `A 可以把相同的两列变成两个独立方向，因此 ${texInline("\\operatorname{rank}(AB)=2")}。` },
      { text: `${texInline("AB")} 的两列互为相反数，因此 ${texInline("\\operatorname{rank}(AB)=1")}。` },
      { text: `仅知道 B 的两列相同，无法判断 ${texInline("AB")} 的列关系。` },
    ],
    steps: [
      `设 ${texInline("B")} 的两列都等于 ${texInline("b")}。那么 ${texInline("AB")} 的两列分别是 ${texInline("Ab")} 与 ${texInline("Ab")}。`,
      "所以 AB 的两列仍然相同，至多提供一个独立方向。",
      `因此 ${texInline("\\operatorname{rank}(AB)\\leq1")}。左乘 A 可以改变方向，但不能把同一列变成两条独立方向。`,
    ],
  },
  quiz: [
    { question: `若 ${texInline("\\det(A)\\ne0")}，n 阶矩阵 ${texInline("A")} 的秩是多少？`, answer: `秩为 ${texInline("n")}。非零行列式表示变换没有把空间压到低维对象。` },
    { question: `若 ${texInline("\\operatorname{rank}(B)=1")}，是否可能有 ${texInline("\\operatorname{rank}(AB)=2")}？`, answer: "不可能。AB 的输出先受 B 的一维输出空间限制，后面的 A 不能创造第二条独立方向。" },
    { question: `若 ${texInline("\\det(A)=0")}，A 在二维中的几何信号是什么？`, answer: "面积被缩放到 0；网格会坍缩到一条线或一个点，因此 A 不可逆。" },
  ],
  summary: ["行列式描述连续变换的缩放，乘积时缩放因子相乘。", "秩描述输出中真正保留下来的独立方向数。", "秩一旦在某一步下降，后续复合不能凭空把丢失的方向造回来。"],
  exercises: ["构造两个 2 阶矩阵 A、B，使 B 的两列相同，并直接算出 AB 的两列。"],
});

defineChapter4Section("matrix-inverse", {
  number: "§4",
  textbookSection: "矩阵的逆",
  title: "矩阵的逆",
  navTitle: "矩阵的逆",
  question: "什么时候一个矩阵能把输出唯一地还原回输入？这种“信息没有丢失”在公式、几何和方程组里分别长什么样？",
  goal: "掌握逆矩阵的定义，并把可逆与非零行列式、满秩、唯一解和不坍缩的直觉连接起来。",
  tags: ["逆矩阵", "满秩", "唯一解"],
  intro: "判断矩阵可逆，核心是看信息能否完整保留。可逆变换把平面仍送到整个平面；不可逆变换会让不同输入挤到同一个输出上，于是无法倒推。",
  concepts: [
    { label: "逆矩阵的定义", text: `${texInline("A^{-1}A=AA^{-1}=E")}。先做 A，再做 ${texInline("A^{-1}")}，会回到原来的输入。` },
    { label: "方阵限制", text: "只有方阵才可能有双侧逆矩阵，因为输入与输出的维数必须一致。" },
    { label: "二维判定", text: `对 2 阶矩阵，${texInline("\\det(A)\\ne0")} 时可逆；${texInline("\\det(A)=0")} 时发生坍缩。` },
    { label: "核心等价", text: "对 n 阶矩阵：可逆、行列式非零、秩为 n、列向量线性无关、方程 Ax=b 对每个 b 有唯一解，是同一件结构事实的不同说法。" },
  ],
  textbook: { reference: "北大版《高等代数》第四章", page: "", items: ["逆矩阵的定义", "可逆矩阵的判定", "2 阶矩阵求逆", "可逆与线性方程组"] },
  visual: { type: "slot", label: "可逆性对照", title: "对照：不坍缩与坍缩", description: "用两组 2 阶矩阵比较可逆和不可逆；重点观察两个独立方向能否继续保持独立。" },
  interactive: { type: "slot", label: "可逆性对照", title: "对照：不坍缩与坍缩", description: "用两组 2 阶矩阵比较可逆和不可逆；重点观察两个独立方向能否继续保持独立。" },
  example: {
    title: "例题：求一个 2 阶逆矩阵并解释它为什么存在",
    question: `设 ${texInline("A=\\begin{pmatrix}2&1\\\\1&1\\end{pmatrix}")}。求 ${texInline("A^{-1}")}，并说明为什么这个逆矩阵存在。`,
    choices: [
      { correct: true, text: `${texInline("A^{-1}=\\begin{pmatrix}1&-1\\\\-1&2\\end{pmatrix}")}；因为 ${texInline("\\det(A)=1\\ne0")}。` },
      { text: `${texInline("A^{-1}=\\begin{pmatrix}2&-1\\\\-1&1\\end{pmatrix}")}；把非对角元素变号即可。` },
      { text: `${texInline("A^{-1}=\\frac12\\begin{pmatrix}1&-1\\\\-1&2\\end{pmatrix}")}；分母取主对角线元素之和。` },
      { text: `A 没有逆矩阵，因为它的两个非对角元素相同。` },
    ],
    steps: [
      `先算 ${texInline("\\det(A)=2\\cdot1-1\\cdot1=1\\ne0")}，所以 A 可逆。`,
      `对 ${texInline("\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}")}，逆矩阵为 ${texInline("\\frac1{ad-bc}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}")}。`,
      `代入得到 ${texInline("A^{-1}=\\begin{pmatrix}1&-1\\\\-1&2\\end{pmatrix}")}。最后检查 ${texInline("AA^{-1}=E")}，说明它确实把输出还原回输入。`,
    ],
  },
  quiz: [
    { question: "一个 2 阶矩阵的两列共线，它可能可逆吗？", answer: "不可能。两列共线说明秩小于 2，平面被压到一条线，无法唯一还原输入。" },
    { question: `若 ${texInline("Ax=b")} 对每个 ${texInline("b")} 都有唯一解，这说明什么？`, answer: "说明 A 可逆；它既不会漏掉某些输出，也不会让不同输入得到同一个输出。" },
    { question: `为什么 ${texInline("\\det(A)=0")} 会阻止逆矩阵存在？`, answer: "因为面积缩放到 0 意味着至少丢掉一个方向。不同输入会重合到同一个输出，无法倒推。" },
  ],
  summary: ["可逆意味着输入信息没有丢失，输出可以唯一倒推。", "对方阵，可逆、满秩、非零行列式和唯一解彼此对应。", "求逆公式只是计算工具；不坍缩才是可逆的结构本质。"],
  exercises: [`判断 ${texInline("\\begin{pmatrix}1&2\\\\2&4\\end{pmatrix}")} 是否可逆，并用列关系和行列式各说明一次。`],
});

defineChapter4Section("elementary-matrices", {
  number: "§6",
  textbookSection: "初等矩阵",
  title: "初等矩阵",
  navTitle: "初等矩阵",
  question: "为什么一次行变换等于左乘一个矩阵？又为什么同样的想法会让初等变换可逆？",
  goal: `把三类初等行变换与初等矩阵一一对应，理解“对单位矩阵做同样操作”如何构造初等矩阵 ${texInline("P")}，并看懂 ${texInline("PA")} 为什么正是对 ${texInline("A")} 做行变换。`,
  tags: ["初等矩阵", "左乘", "行变换"],
  intro: "把一次行变换作用到单位矩阵上，就得到对应的初等矩阵；左乘它，就是对任意矩阵做同一次行变换。放到平面上看，三类初等矩阵分别是反射、伸缩和剪切。",
  concepts: [
    { label: "换行", text: "交换两行；对应的初等矩阵来自把单位矩阵的相同两行交换。" },
    { label: "倍乘", text: "某一行乘非零常数；反向操作是乘以倒数，所以仍然可逆。" },
    { label: "倍加", text: "一行加上另一行的倍数；反向操作是加上相反数倍，因此也可逆。" },
    { label: "左乘与右乘", text: "左乘初等矩阵作用于行；右乘初等矩阵作用于列。" },
  ],
  textbook: { reference: "北大版《高等代数》第四章", page: "", items: ["三类初等行变换", "由单位矩阵构造初等矩阵", "左乘对应行变换", "初等矩阵的逆"] },
  visual: { type: "slot", label: "逐步演示", title: "实验：同一行变换如何同时作用于 E 和 A", description: "按步骤看 R₂ ← R₂ − 3R₁：先作用于单位矩阵得到 P，再左乘到 A。" },
  interactive: { type: "slot", label: "逐步演示", title: "实验：同一行变换如何同时作用于 E 和 A", description: "按步骤看 R₂ ← R₂ − 3R₁：先作用于单位矩阵得到 P，再左乘到 A。" },
  example: {
    title: "例题：从一次行变换写出初等矩阵",
    question: `对任意 2 阶矩阵 ${texInline("A")} 执行 ${texInline("R_1\\leftarrow R_1+2R_2")}。写出对应初等矩阵 ${texInline("P")}，并说明为什么变换后的矩阵是 ${texInline("PA")}。`,
    choices: [
      { correct: true, text: `${texInline("P=\\begin{pmatrix}1&2\\\\0&1\\end{pmatrix}")}；它的第一行把 ${texInline("A")} 的第一行与第二行的 2 倍组合起来。` },
      { text: `${texInline("P=\\begin{pmatrix}1&0\\\\2&1\\end{pmatrix}")}；左乘时应把 2 放在第一列。` },
      { text: `${texInline("P=\\begin{pmatrix}1&-2\\\\0&1\\end{pmatrix}")}；加法行变换对应负号。` },
      { text: `${texInline("P=\\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}")}；所有初等行变换都由换行矩阵完成。` },
    ],
    steps: [
      `先对单位矩阵 ${texInline("E")} 做同样操作，得到 ${texInline("P(1,2(2))=\\begin{pmatrix}1&2\\\\0&1\\end{pmatrix}")}。`,
      `把 ${texInline("P(1,2(2))")} 左乘到 ${texInline("A")}：它的第一行 ${texInline("(1,2)")} 会把 ${texInline("A")} 的第一行加上 ${texInline("A")} 的第二行的 2 倍。`,
      `因此 ${texInline("P(1,2(2))A")} 恰好就是执行 ${texInline("R_1\\leftarrow R_1+2R_2")} 后的矩阵。反向操作 ${texInline("R_1\\leftarrow R_1-2R_2")} 给出 ${texInline("P(1,2(2))^{-1}=P(1,2(-2))")}。`,
    ],
  },
  quiz: [
    { question: `要构造 ${texInline("R_2\\leftarrow R_2-3R_1")} 对应的初等矩阵，最直接的做法是什么？`, answer: `把同一个行变换施加到单位矩阵 ${texInline("E")} 上，得到 ${texInline("\\begin{pmatrix}1&0\\\\-3&1\\end{pmatrix}")}。` },
    { question: "三类初等矩阵的行列式分别是多少？这和第二章的行列式性质有什么关系？", answer: `换行为 ${texInline("-1")}，倍乘 ${texInline("k")} 为 ${texInline("k")}，倍加为 1。它们正是“交换变号、倍乘乘 ${texInline("k")}、倍加不变”；几何上分别是反射、伸缩和剪切。` },
    { question: "为什么初等矩阵都可逆？", answer: "每一类初等行变换都有一个反向的初等行变换；对应的反向操作就是逆矩阵。" },
    { question: `左乘 ${texInline("P")} 和右乘 ${texInline("P")} 的主要区别是什么？`, answer: "左乘改变行，右乘改变列。原因是矩阵乘法时左侧因子用自己的行组合右侧矩阵的行。" },
  ],
  summary: [`一次初等行变换 = 对单位矩阵做同样操作得到 ${texInline("P")} = 左乘 ${texInline("P")}。`, "初等矩阵都可逆；可逆矩阵都是初等矩阵的乘积。", "左乘看行，右乘看列；对分块矩阵的块行、块列也是如此。"],
  exercises: [`写出 ${texInline("R_2\\leftarrow -2R_2")} 对应的 2 阶初等矩阵，并写出它的逆。`],
});


;/* content/ch4-section3.js */
defineChapter4Section("matrix-product-determinant-rank", {
  number: "§3",
  textbookSection: "矩阵乘积的行列式与秩",
  title: "矩阵乘积的行列式与秩",
  navTitle: "乘积的行列式与秩",
  question: "连续施加两个矩阵后，面积倍率怎样累积？已经丢失的独立方向还能被后面的矩阵恢复吗？",
  goal: "把行列式读成有向面积倍率，把秩读成输出中保留下来的独立方向数；再用连续变换理解乘积行列式与乘积秩的约束。",
  tags: ["有向面积", "乘积行列式", "秩", "秩瓶颈"],
  intro:
    "矩阵乘积表示过程的复合。沿着复合过程追踪两个量：行列式记录面积或体积被放大多少以及方向是否翻转；秩记录输出还能沿多少个独立方向变化。倍率可以继续相乘，丢掉的方向却不会凭空回来。",
  concepts: [
    {
      label: "有向面积",
      text: `${texInline("\\det(A)")} 的绝对值是二维面积倍率；正负号记录方向是否翻转。`,
    },
    {
      label: "乘积行列式",
      text: `${texInline("\\det(AB)=\\det(A)\\det(B)")}；连续两步的面积倍率依次相乘。`,
    },
    {
      label: "秩",
      text: `${texInline("\\operatorname{rank}(A)")} 是列空间的维数，也等于行空间的维数。`,
    },
    {
      label: "方阵的临界状态",
      text: `对 ${texInline("n")} 阶矩阵，${texInline("\\det(A)\\ne0")} 等价于 ${texInline("\\operatorname{rank}(A)=n")}；行列式为 0 时至少丢掉一个方向。`,
    },
    {
      label: "秩瓶颈",
      text: `${texInline("\\operatorname{rank}(AB)\\leq\\min\\{\\operatorname{rank}(A),\\operatorname{rank}(B)\\}")}。`,
    },
    {
      label: "可逆因子保持秩",
      text: `若 ${texInline("A")} 可逆，则 ${texInline("\\operatorname{rank}(AB)=\\operatorname{rank}(B)")}；若 ${texInline("B")} 可逆，则 ${texInline("\\operatorname{rank}(AB)=\\operatorname{rank}(A)")}。`,
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第四章",
    page: "",
    items: [
      "矩阵乘积的行列式",
      "行列式为零与列向量相关",
      "矩阵的行秩、列秩与秩",
      "乘积的秩不等式",
      "可逆矩阵乘法对秩的保持",
    ],
  },
  visual: {
    type: "rank",
    title: "连续作用两个矩阵",
    description: "同步播放 AB 与 BA，比较形状与面积倍率；再让 A 作用在 B 压出的直线上，看丢掉的方向能否找回。",
  },
  example: {
    title: "例题：不展开乘积，判断行列式与秩",
    question: `设 ${texInline("A=\\begin{bmatrix}2&1\\\\0&1\\end{bmatrix}")}，${texInline("B=\\begin{bmatrix}1&1\\\\2&2\\end{bmatrix}")}。不必先算出 ${texInline("AB")} 的全部元素，判断 ${texInline("\\det(AB)")} 与 ${texInline("\\operatorname{rank}(AB)")}。`,
    choices: [
      {
        correct: true,
        text: `${texInline("\\det(AB)=0")}，且 ${texInline("\\operatorname{rank}(AB)=1")}；${texInline("B")} 的两列相同，而 ${texInline("A")} 可逆。`,
      },
      {
        text: `${texInline("\\det(AB)=4")}，且 ${texInline("\\operatorname{rank}(AB)=2")}；${texInline("A")} 的行列式会把 ${texInline("B")} 的秩也放大两倍。`,
      },
      {
        text: `${texInline("\\det(AB)=0")}，但 ${texInline("\\operatorname{rank}(AB)=0")}；行列式为 0 就意味着零矩阵。`,
      },
      {
        text: `必须完整计算 ${texInline("AB")} 后才能判断，单看两个因子无法得到任何结论。`,
      },
    ],
    steps: [
      `先看 ${texInline("B")}：两列都等于 ${texInline("(1,2)^T")}，所以 ${texInline("\\operatorname{rank}(B)=1")} 且 ${texInline("\\det(B)=0")}。`,
      `由乘积行列式，${texInline("\\det(AB)=\\det(A)\\det(B)=2\\cdot0=0")}。`,
      `${texInline("A")} 的行列式为 ${texInline("2\\ne0")}，所以 ${texInline("A")} 可逆。可逆的左因子只改变方向和尺度，不改变 ${texInline("B")} 已有的独立方向数。`,
      `因此 ${texInline("\\operatorname{rank}(AB)=\\operatorname{rank}(B)=1")}。`,
      `结论来自结构：面积已经在 ${texInline("B")} 这一步降为 0；${texInline("A")} 可以移动那条输出直线，却不能把它重新撑成平面。`,
    ],
  },
  quiz: [
    {
      question: `二维矩阵的 ${texInline("\\det(A)=-3")} 表示什么？`,
      answer: "面积放大为原来的 3 倍，同时方向发生翻转。",
    },
    {
      question: `${texInline("\\det(A)=1")} 是否说明 ${texInline("A")} 没有改变图形？`,
      answer: "不说明。剪切或一方向放大、另一方向缩小都可能保持面积 1。",
    },
    {
      question: `在二维中，${texInline("\\det(A)")} 连续趋近 0 时，秩会怎样变化？`,
      answer: "只要行列式仍非零，秩仍是 2；到达行列式恰为 0 的临界状态时，秩才降为 1 或 0。",
    },
    {
      question: `若 ${texInline("\\operatorname{rank}(B)=1")}，是否可能有 ${texInline("\\operatorname{rank}(AB)=2")}？`,
      answer: `不可能。${texInline("B")} 的输出已经限制在一条线，${texInline("A")} 只能把这条线变成另一条线或一个点。`,
    },
  ],
  summary: [
    "行列式的绝对值记录面积倍率，符号记录方向；行列式为 0 是坍缩的临界信号。",
    `连续变换的面积倍率相乘，所以 ${texInline("\\det(AB)=\\det(A)\\det(B)")}。${texInline("A")}、${texInline("B")} 是同阶方阵时，${texInline("AB")} 与 ${texInline("BA")} 一般不相等，行列式却都等于 ${texInline("\\det A\\cdot\\det B")}。`,
    "秩是输出中保留下来的独立方向数；行秩与列秩相等。",
    `乘积受最窄的一步限制：${texInline("\\operatorname{rank}(AB)")} 不超过两个因子的秩；可逆因子则保持另一因子的秩。`,
  ],
  exercises: [
    `构造三个不同的 2 阶矩阵，使它们的行列式都为 1，但分别表现为单位变换、剪切和非等比例缩放。`,
    `取秩为 1 的矩阵 ${texInline("B")}，分别选择可逆 ${texInline("A")} 和不可逆 ${texInline("A")}，验证 ${texInline("\\operatorname{rank}(AB)")} 只能保持或下降。`,
  ],
});


;/* content/ch4-section4.js */
defineChapter4Section("matrix-inverse", {
  number: "§4",
  textbookSection: "矩阵的逆",
  title: "矩阵的逆",
  navTitle: "矩阵的逆",
  question: "怎样用一个确定的矩阵完整撤销原来的作用，并把输出准确还原成输入？",
  goal: "把逆矩阵理解为可逆方阵唯一的撤销运算；掌握逆矩阵的定义与唯一性、复合过程的逆序法则、矩阵方程的消元方式，以及二阶公式和伴随矩阵求逆路线。",
  tags: ["逆矩阵", "撤销运算", "逆序法则", "伴随矩阵"],
  intro:
    "可逆矩阵的作用可以被完整撤销：缩放取倒数，旋转反向，剪切系数变号，镜像再做一次。复合过程要倒序撤销；逆矩阵可以用二阶公式或伴随矩阵求出，再用来解方程。",
  videoPlan: {
    title: "把一次矩阵作用倒着走回来",
    duration: "约 1.5—2 分钟",
    scenes: [
      "同一个方格先经过 A 变形，再经过 A^{-1} 回到原状；输入点、基向量和网格始终保持对象连续。",
      "依次闪过缩放、旋转、剪切和镜像：缩放取倒数，旋转转向相反，剪切系数变号，镜像再做一次回到原处。",
      "短暂对照投影：两个不同输入落到同一输出，只保留一句结论——信息一旦合并，反向过程便不再唯一。",
      "展示 x 先经过 B、再经过 A；错误地先撤销 B 时无法复原，改为先 A^{-1}、再 B^{-1} 后回到 x。",
      "画面收束到 AA^{-1}=A^{-1}A=E 与 (AB)^{-1}=B^{-1}A^{-1}。",
    ],
    ttsDraft:
      "逆矩阵把已经发生的矩阵作用完整撤销。单个过程按相反方式执行；多个过程组成复合后，撤销必须从最后一步开始。因此 AB 的逆按相反顺序书写：B 的逆乘 A 的逆。",
  },
  concepts: [
    {
      label: "逆矩阵的定义",
      text: `${texInline("A^{-1}A=AA^{-1}=E")}。先做 ${texInline("A")}，再做 ${texInline("A^{-1}")}，会回到原来的输入。`,
    },
    {
      label: "方阵限制",
      text: "只有方阵才可能有双侧逆矩阵，因为输入与输出的维数必须一致。",
    },
    {
      label: "二维判定",
      text: `对 2 阶矩阵，${texInline("\\det(A)\\ne0")} 时可逆；${texInline("\\det(A)=0")} 时发生坍缩。`,
    },
    {
      label: "核心等价",
      text: `对 ${texInline("n")} 阶矩阵：可逆、行列式非零、秩为 ${texInline("n")}、列向量线性无关、方程 ${texInline("Ax=b")} 对每个 ${texInline("b")} 有唯一解，是同一件结构事实的不同说法。`,
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第四章",
    page: "",
    items: [
      "逆矩阵的定义、存在条件与唯一性",
      "逆矩阵的运算性质与乘积逆序法则",
      "利用逆矩阵解向量方程和矩阵方程",
      "二阶矩阵求逆公式",
      "余子式、代数余子式与伴随矩阵求逆",
    ],
  },
  interactive: {
    type: "inverse",
    task: "点击任意矩阵，观察单位正方形在输出端是否仍占据二维面积。满秩时应用逆矩阵恢复；降秩时比较两个不同输入为什么会落到同一个输出。",
    prompts: [
      "比较满秩矩阵与四个降秩矩阵：输出是平行四边形，还是已经塌成线段？",
      `同时读取 ${texInline("\\operatorname{rank}(A)")}、${texInline("\\det(A)")} 与面积倍率，建立满秩、行列式非零和可逆之间的联系。`,
      `在降秩例子中观察 ${texInline("x_1")} 不等于 ${texInline("x_2")} 但 ${texInline("Ax_1=Ax_2")}，说明信息丢失后为什么不能唯一恢复。`,
    ],
  },
  visual: false,
  example: {
    title: "例题：求逆、解方程并完成验证",
    question: `设 ${texInline("A=\\begin{bmatrix}3&1\\\\1&1\\end{bmatrix}")}，${texInline("b=\\begin{bmatrix}7\\\\3\\end{bmatrix}")}。求 ${texInline("A^{-1}")}，并解 ${texInline("Ax=b")}。`,
    choices: [
      {
        correct: true,
        text: `${texInline("A^{-1}=\\frac12\\begin{bmatrix}1&-1\\\\-1&3\\end{bmatrix}")}，${texInline("x=\\begin{bmatrix}2\\\\1\\end{bmatrix}")}。`,
      },
      {
        text: `${texInline("A^{-1}=\\begin{bmatrix}1&-1\\\\-1&3\\end{bmatrix}")}，${texInline("x=\\begin{bmatrix}4\\\\2\\end{bmatrix}")}。`,
      },
      {
        text: `${texInline("A^{-1}=\\frac14\\begin{bmatrix}1&-1\\\\-1&3\\end{bmatrix}")}，${texInline("x=\\begin{bmatrix}1\\\\1/2\\end{bmatrix}")}。`,
      },
      {
        text: `${texInline("A^{-1}=\\frac12\\begin{bmatrix}3&-1\\\\-1&1\\end{bmatrix}")}，${texInline("x=\\begin{bmatrix}9\\\\-1\\end{bmatrix}")}。`,
      },
    ],
    steps: [
      `先检查二阶公式的分母：${texInline("\\det(A)=3\\cdot1-1\\cdot1=2\\ne0")}，因此逆矩阵存在。`,
      `交换主对角元素并改变副对角元素符号，得到 ${texInline("\\begin{bmatrix}1&-1\\\\-1&3\\end{bmatrix}")}。`,
      `除以行列式 2：${texInline("A^{-1}=\\frac12\\begin{bmatrix}1&-1\\\\-1&3\\end{bmatrix}")}。`,
      `在 ${texInline("Ax=b")} 左侧乘 ${texInline("A^{-1}")}，得到 ${texInline("x=A^{-1}b=\\frac12\\begin{bmatrix}1&-1\\\\-1&3\\end{bmatrix}\\begin{bmatrix}7\\\\3\\end{bmatrix}=\\begin{bmatrix}2\\\\1\\end{bmatrix}")}。`,
      `最后代回：${texInline("A\\begin{bmatrix}2\\\\1\\end{bmatrix}=\\begin{bmatrix}7\\\\3\\end{bmatrix}")}；同时可检查 ${texInline("AA^{-1}=E")}。`,
    ],
  },
  quiz: [
    {
      question: "为什么同一个方阵不可能有两个不同的逆矩阵？",
      answer: `若 ${texInline("B")}、${texInline("C")} 都是 ${texInline("A")} 的逆，则 ${texInline("B=B(AC)=(BA)C=C")}，所以逆矩阵唯一。`,
    },
    {
      question: `若 ${texInline("A,B")} 都可逆，${texInline("(AB)^{-1}")} 是什么？`,
      answer: `${texInline("(AB)^{-1}=B^{-1}A^{-1}")}。撤销复合过程要从最后发生的作用开始。`,
    },
    {
      question: `方程 ${texInline("XA=C")} 应怎样消去右侧的 ${texInline("A")}？`,
      answer: `在等式两边右乘 ${texInline("A^{-1}")}，得到 ${texInline("X=CA^{-1}")}。`,
    },
    {
      question: "用伴随矩阵求逆时，代数余子式矩阵为什么还要转置？",
      answer: `伴随矩阵 ${texInline("A^{*}")} 按定义是代数余子式矩阵的转置；只有完成转置后才满足 ${texInline("AA^{*}=A^{*}A=\\det(A)E")}。`,
    },
  ],
  summary: [
    "逆矩阵是可逆方阵唯一的双侧撤销运算；左右相乘都回到单位矩阵。",
    "矩阵方程中，逆矩阵必须乘在与原矩阵相同的一侧。",
    "复合过程按相反顺序撤销，所以乘积的逆会倒序。",
    `二阶公式提供直接计算；一般情形可用伴随矩阵：${texInline("A^{-1}=\\frac{1}{\\det(A)}A^{*}")}。`,
  ],
  exercises: [
    `证明：若 ${texInline("AB=BA=E")} 且 ${texInline("AC=CA=E")}，则 ${texInline("B=C")}。`,
    `设 ${texInline("A,B")} 可逆，分别验证 ${texInline("B^{-1}A^{-1}")} 是 ${texInline("AB")} 的左逆和右逆。`,
    `对 ${texInline("A=\\begin{bmatrix}1&2&0\\\\0&1&1\\\\1&0&1\\end{bmatrix}")} 写出元素 ${texInline("a_{12}")} 的余子矩阵、余子式与代数余子式。`,
  ],
});


;/* content/ch4-block.js */
defineChapter4Section("block-matrices", {
  number: "§5",
  textbookSection: "矩阵的分块",
  title: "矩阵的分块",
  navTitle: "矩阵的分块",
  question: "为什么把大矩阵按有意义的行列切开后，计算和结构都会更清楚？",
  goal: "理解分块要来自有意义的行列分组：块的尺寸必须匹配；块乘法仍然是行乘列；块对角结构表示彼此独立的子系统。",
  tags: ["分块", "块乘法", "块对角"],
  intro: `把矩阵切成块以后，块可以像“较大的元素”一样做乘法。能不能乘只看一件事：${texInline("A")} 的列怎样分，${texInline("B")} 的行就必须怎样分。`,
  concepts: [
    { label: "分块的前提", text: "行和列必须按一致的尺寸切分；只有尺寸匹配的块才能参与同一种运算。" },
    { label: "块乘法", text: `输出块 ${texInline("C_{ij}")} 仍然来自 ${texInline("A")} 的第 ${texInline("i")} 个块行和 ${texInline("B")} 的第 ${texInline("j")} 个块列的配对。` },
    { label: "块对角", text: "非对角块为零时，两个子系统不互相耦合，可以分别计算。" },
    { label: "结构优先", text: "分块的价值是先看见关系，再让计算顺着结构展开。" },
  ],
  textbook: { reference: "北大版《高等代数》第四章", page: "", items: ["矩阵的分块", "分块加法与数乘", "分块乘法", "块对角矩阵"] },
  interactive: {
    type: "block",
    title: "图示：把大矩阵看成小系统",
    description: "分块让输入、输出和子结构更清楚。",
    prompts: ["把一个大矩阵切成四块，并标出每块的输入输出含义。", "演示块乘法时，只高亮真正发生配对的块。", "用块对角矩阵展示两个子系统互不干扰的情况。"],
  },
  example: {
    title: "例题：从块行和块列读出一个输出块",
    question: `设 ${texInline("A=\\begin{pmatrix}A_{11}&A_{12}\\\\A_{21}&A_{22}\\end{pmatrix}")}，${texInline("B=\\begin{pmatrix}B_{11}&B_{12}\\\\B_{21}&B_{22}\\end{pmatrix}")}。写出 ${texInline("AB")} 的右上块，并说明它为什么只用到 ${texInline("A")} 的第一块行和 ${texInline("B")} 的第二块列。`,
    choices: [
      { text: `${texInline("(AB)_{12}=A_{11}B_{11}+A_{12}B_{21}")}。` },
      { correct: true, text: `${texInline("(AB)_{12}=A_{11}B_{12}+A_{12}B_{22}")}。` },
      { text: `${texInline("(AB)_{12}=A_{21}B_{12}+A_{22}B_{22}")}。` },
      { text: `${texInline("(AB)_{12}=A_{12}B_{12}")}。` },
    ],
    steps: [
      `右上块的位置是 ${texInline("(1,2)")}，所以先取 ${texInline("A")} 的第一块行 ${texInline("(A_{11},A_{12})")}。`,
      `再取 ${texInline("B")} 的第二块列 ${texInline("(B_{12},B_{22})^T")}。`,
      `像普通矩阵的行乘列一样配对，得到 ${texInline("(AB)_{12}=A_{11}B_{12}+A_{12}B_{22}")}。`,
    ],
  },
  quiz: [
    { question: "为什么分块时不能只看图形上切得整不整齐？", answer: "因为块要参与加法或乘法，行列分组必须和各块的尺寸兼容；否则相应的块乘积没有定义。" },
    { question: `在 ${texInline("C=AB")} 的块乘法里，${texInline("C_{21}")} 由哪一行块和哪一列块配对？`, answer: `由 ${texInline("A")} 的第二块行和 ${texInline("B")} 的第一块列配对。` },
    { question: "块对角矩阵为什么可以分别处理不同块？", answer: "因为非对角块为零，一个块的输入不会流向另一个块的输出，子系统之间没有耦合。" },
  ],
  summary: ["分块要先保证尺寸与行列分组匹配。", "块乘法没有改变本质：仍然是块行乘块列。", "块对角结构把互不影响的子系统直接写在矩阵形状里。"],
  exercises: [`设 ${texInline("C=AB")} 是 ${texInline("2\\times2")} 分块乘积，写出 ${texInline("C_{22}")} 的块行列公式。`],
});

defineChapter4Section("block-elementary-applications", {
  number: "§7",
  textbookSection: "分块乘法的初等变换及应用举例",
  title: "分块乘法的初等变换及应用举例",
  navTitle: "分块初等变换与应用",
  question: "怎样把初等行变换推广到“整块行”，并用它更清楚地处理耦合方程组？",
  goal: "把一次块行变换写成左乘一个分块初等矩阵；通过消去左下块，理解分块消元怎样帮助求解一个耦合系统。",
  tags: ["分块初等变换", "块消元", "耦合系统"],
  intro: "初等行变换让一行加上另一行的倍数；分块初等变换让一整块行加上另一块行左乘某个合适矩阵的结果。规则没有变，只是“倍数”升级成了尺寸匹配的矩阵块。",
  concepts: [
    { label: "块行操作", text: `例如 ${texInline("R_2\\leftarrow R_2-CR_1")}；其中 ${texInline("C")} 的尺寸必须刚好能把第一块行变成第二块行的尺寸。` },
    { label: "块初等矩阵", text: `把同样操作施加到分块单位矩阵，就得到对应的分块初等矩阵 ${texInline("P")}。` },
    { label: "左乘仍改行", text: `左乘 ${texInline("P")} 时，${texInline("P")} 的块行会组合原矩阵的块行，因此它实现的仍是行操作。` },
    { label: "应用", text: "块消元让耦合系统变成块上三角或块对角结构，从而可以按块回代。" },
  ],
  textbook: { reference: "北大版《高等代数》第四章", page: "", items: ["分块乘法中的初等变换", "块行操作的尺寸条件", "块消元", "应用举例"] },
  interactive: { type: "slot", label: "块消元逐步演示", title: "实验：把普通行变换升级成块行变换", description: "按步骤看块行操作如何消去耦合项，并把系统改写成更容易求解的结构。" },
  example: {
    title: "例题：用块行操作解一个耦合系统",
    question: `设 ${texInline("x=f")}，${texInline("Cx+y=g")}。把它写成分块方程组后，用一次块行操作消去左下块，并写出 ${texInline("x")}、${texInline("y")}。`,
    choices: [
      { correct: true, text: `执行 ${texInline("R_2\\leftarrow R_2-CR_1")} 后得到 ${texInline("x=f")}，${texInline("y=g-Cf")}。` },
      { text: `执行 ${texInline("R_2\\leftarrow R_2+CR_1")} 后得到 ${texInline("x=f")}，${texInline("y=g+Cf")}。` },
      { text: `消去左下块后得到 ${texInline("x=g")}，${texInline("y=f-Cg")}。` },
      { text: `必须先求 ${texInline("C^{-1}")}；若 ${texInline("C")} 不可逆，就无法进行块消元。` },
    ],
    steps: [
      `写成 ${texInline("\\begin{pmatrix}E&0\\\\C&E\\end{pmatrix}\\begin{pmatrix}x\\\\y\\end{pmatrix}=\\begin{pmatrix}f\\\\g\\end{pmatrix}")}。`,
      `对第二块行执行 ${texInline("R_2\\leftarrow R_2-CR_1")}，左下块 ${texInline("C")} 被消去，右侧变为 ${texInline("g-Cf")}。`,
      `得到 ${texInline("x=f")}，${texInline("y=g-Cf")}。这里没有神秘公式，只是把普通消元的“倍数”替换成了矩阵块 ${texInline("C")}。`,
    ],
  },
  quiz: [
    { question: `块行操作 ${texInline("R_2\\leftarrow R_2-CR_1")} 里，为什么 ${texInline("C")} 不能随便选尺寸？`, answer: `因为 ${texInline("CR_1")} 必须和 ${texInline("R_2")} 具有相同的列结构，才能相减；尺寸匹配是块操作合法的条件。` },
    { question: "分块初等矩阵如何构造？", answer: "和普通初等矩阵完全一样：对分块单位矩阵做同一个块行操作。" },
    { question: "块消元后为什么更容易解系统？", answer: "因为耦合块被消去后，系统变成块上三角或块对角形式，可以先解上面的块，再按块回代。" },
  ],
  summary: ["分块初等变换是普通行变换在块层面的延伸。", "左乘分块初等矩阵仍然改变块行。", "块消元的目的，是把耦合结构改写成可以按块求解的结构。"],
  exercises: [`验证 ${texInline("\\begin{pmatrix}E&0\\\\-C&E\\end{pmatrix}\\begin{pmatrix}E&0\\\\C&E\\end{pmatrix}=\\begin{pmatrix}E&0\\\\0&E\\end{pmatrix}")}。`],
});


;/* content/ch4.js */
registerAlgebraChapter({
  id: "ch4",
  icon: "4",
  title: "第四章 矩阵",
  subtitle: "运算 · 逆 · 分块 · 初等变换",
  summary:
    "先建立矩阵概念与运算，再讨论矩阵乘积的行列式与秩、逆矩阵、分块、初等矩阵，以及分块乘法的初等变换与应用。",
  sections: [
    {
      id: "matrix-language",
      number: "§1",
      textbookSection: "矩阵概念的一些背景",
      title: "矩阵概念的一些背景",
      navTitle: "矩阵概念背景",
      question: `矩阵为什么会出现？它除了是一张数字表格，还能记录什么？`,
      goal: "从矩阵的背景与基本记法出发，建立“矩阵可以记录线性映射在选定基下的作用”这一核心视角。",
      tags: ["矩阵背景", "行列与阶", "基向量"],
      intro:
        "矩阵最初服务于方程组、数据排列和计算规则，但它更深的作用是记录线性关系。逐列地看，矩阵记录标准基向量的去向；整体地看，它记录整个空间怎样拉伸、旋转、剪切或压缩。",
      concepts: [
        { label: "矩阵", text: "矩阵是按行和列排列的数表；它的行数和列数共同确定矩阵的阶。" },
        { label: "列向量", text: "在线性映射视角下，矩阵的第 j 列就是第 j 个标准基向量经过变换后的坐标。" },
        { label: "线性性", text: "知道基向量的去向，就知道所有向量的去向，因为线性组合关系会被保留。" },
      ],
      textbook: {
        reference: "北大版《高等代数》第四章",
        page: "",
        items: ["矩阵概念的背景", "矩阵的行、列与阶", "矩阵的基本记法", "矩阵作为线性关系的记录"],
      },
      visual: {
        type: "transform",
        title: "交互图：矩阵怎样改变网格",
        description: "拖动矩阵元素，观察基向量和整张网格同步变化。",
        prompts: [
          "先固定原始网格和两个标准基向量。",
          "拖动四个矩阵元素，让网格实时变形。",
          `观察两列向量的变化，再回到公式 ${texInline("A(x,y)^T=xAe_1+yAe_2")}。`,
        ],
      },
      example: {
        title: "例题：从列向量读出变换",
        question: `设 ${texInline("A=\\begin{bmatrix}2&1\\\\0&1\\end{bmatrix}")}。不用逐点代入，说明它对平面网格的大致作用。`,
        steps: [
          `第一列是 ${texInline("(2,0)^T")}，所以 ${texInline("e_1")} 被拉到 x 轴正方向并放大 2 倍。`,
          `第二列是 ${texInline("(1,1)^T")}，所以 ${texInline("e_2")} 被送到斜向量。`,
          "水平方向被拉长，竖直方向同时向右偏移，整体表现为横向拉伸和剪切。",
        ],
      },
      quiz: [
        {
          question: `矩阵 ${texInline("A")} 的第 j 列在变换视角下表示什么？`,
          answer: `它表示标准基向量 ${texInline("e_j")} 经过 ${texInline("A")} 后得到的坐标，即 ${texInline("Ae_j")}。`,
        },
        {
          question: "为什么知道基向量的去向就能知道所有向量的去向？",
          answer: "任意向量都可写成基向量的线性组合；线性映射保持线性组合关系。",
        },
      ],
      summary: ["矩阵首先是一种结构化记录。", "从列向量读矩阵，可以把数字表格还原为线性映射。"],
      exercises: ["调节交互图中的 b，让竖直网格线逐渐倾斜，观察剪切量怎样变化。"],
    },
    {
      id: "matrix-operations",
      number: "§2",
      textbookSection: "矩阵的运算",
      title: "矩阵的运算",
      navTitle: "矩阵的运算",
      question: "矩阵为什么能相加、数乘和相乘？这些规则分别在表达什么结构？",
      goal: "把加法、数乘理解成同类记录的叠加与缩放，并把矩阵乘法理解成线性变换的复合。",
      tags: ["加法与数乘", "矩阵乘法", "复合变换"],
      intro:
        "矩阵加法和数乘让同型矩阵像向量一样形成线性组合；矩阵乘法把两个线性变换的复合过程压缩成一个新的矩阵。",
      videoPlan: {
        title: "矩阵乘法为什么对应复合",
        duration: "约 2 分钟",
        script: [
          "先让一个向量经过 B，得到中间结果。",
          "再把中间结果交给 A，得到最终结果。",
          "把两个动作合成一次动作，记作 AB。",
          "回到坐标，解释为什么右边的矩阵先作用。",
        ],
      },
      concepts: [
        { label: "同型相加", text: "只有尺寸相同的矩阵才能逐项相加，这对应同一类输入输出记录的叠加。" },
        { label: "数乘", text: "把矩阵所有列向量同时缩放，也就是把记录的变换强度整体缩放。" },
        { label: "矩阵乘法", text: `${texInline("ABx")} 表示 ${texInline("B")} 先作用在 ${texInline("x")} 上，再由 ${texInline("A")} 作用到 ${texInline("Bx")} 上。` },
        { label: "行列配对", text: "行乘列是在计算输出的一个坐标如何由输入基向量的响应组合出来。" },
      ],
      textbook: {
        reference: "北大版《高等代数》第四章",
        page: "",
        items: ["矩阵的加法与数乘", "矩阵乘法", "转置与基本运算性质"],
      },
      visual: {
        type: "multiply",
        title: "交互图：AB 是先 B 后 A",
        description: "切换复合、列向量与行列公式三个视角，比较同一件事的不同表达。",
        task: `先选“复合”观察 ${texInline("x\\to Bx\\to A(Bx)")}，再切到“看列”，说明 ${texInline("AB")} 的每一列为什么来自 ${texInline("A")} 作用到 ${texInline("B")} 的对应列。`,
        prompts: [
          `第一步：向量 ${texInline("x")} 经过 ${texInline("B")} 到达中间位置。`,
          `第二步：中间向量再经过 ${texInline("A")} 到达最终位置。`,
          `第三步：把整个过程压缩成 ${texInline("ABx")}，并观察 ${texInline("AB")} 的列。`,
        ],
      },
      example: {
        title: "例题：比较 AB 与 BA",
        question: "设 A 表示横向拉伸，B 表示剪切。为什么先剪切再拉伸，通常不同于先拉伸再剪切？",
        steps: [
          `取 ${texInline("A=\\begin{bmatrix}2&0\\\\0&1\\end{bmatrix}")}，${texInline("B=\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}")}。`,
          `${texInline("AB=\\begin{bmatrix}2&2\\\\0&1\\end{bmatrix}")}，${texInline("BA=\\begin{bmatrix}2&1\\\\0&1\\end{bmatrix}")}。`,
          "右上角不同，说明剪切量与拉伸顺序发生耦合；第二个变换面对的是第一个变换已经改变后的图形。",
        ],
      },
      quiz: [
        {
          question: `判断：${texInline("ABx")} 中，${texInline("A")} 先作用在 ${texInline("x")} 上。`,
          answer: "错。右边的矩阵先作用，所以先得到 Bx，再由 A 作用到 Bx。",
        },
        {
          question: `${texInline("AB")} 的第 j 列可以怎样理解？`,
          answer: `${texInline("AB")} 的第 j 列是 ${texInline("A")} 作用到 ${texInline("B")} 的第 j 列后的结果。`,
        },
        {
          question: `怎样把 ${texInline("\\begin{bmatrix}3&-1\\\\2&0\\end{bmatrix}")} 写成 2 阶基本矩阵的线性组合？`,
          answer: `${texInline("3E_{11}-E_{12}+2E_{21}+0E_{22}")}。`,
        },
      ],
      summary: ["同型矩阵可以相加和数乘。", "矩阵乘法的核心是复合：右边先作用，左边后作用。"],
      exercises: ["用两个简单 2 阶矩阵再找一个 AB 与 BA 不相等的例子。"],
    },
    {
      id: "matrix-product-determinant-rank",
      number: "§3",
      textbookSection: "矩阵乘积的行列式与秩",
      title: "矩阵乘积的行列式与秩",
      navTitle: "乘积的行列式与秩",
      question: "矩阵相乘以后，面积缩放和有效维度会怎样变化？秩到底在数什么？",
      goal: "把行列式理解为面积或体积的缩放因子，把秩理解为矩阵真正保留下来的有效维度。",
      tags: ["行列式", "秩", "有效维度"],
      intro:
        "矩阵乘积会连续施加两个变换，因此面积或体积的缩放因子相乘；秩则描述变换后仍然保留下来的独立方向数。",
      concepts: [
        { label: "乘积行列式", text: `${texInline("\\det(AB)=\\det(A)\\det(B)")}，连续变换的面积或体积缩放因子会相乘。` },
        { label: "秩", text: "秩描述矩阵作为变换时保留下来的有效维度。" },
        { label: "列秩", text: "列向量张成空间的维数，描述输出能到达的范围。" },
        { label: "乘积与秩", text: `${texInline("\\operatorname{rank}(AB)\\leq\\min\\{\\operatorname{rank}(A),\\operatorname{rank}(B)\\}")}；复合不会凭空创造独立方向。` },
      ],
      textbook: {
        reference: "北大版《高等代数》第四章",
        page: "",
        items: ["矩阵乘积的行列式", "矩阵的秩", "乘积与秩的关系"],
      },
      visual: {
        type: "rank",
        title: "交互图：秩是保留下来的维度",
        description: "比较列向量张成平面和坍缩成直线时的差别。",
        prompts: [
          "从列向量出发，观察它们张成平面还是只张成直线。",
          "把“独立方向的数量”与秩联系起来。",
          "再回到乘积，理解复合不会增加有效维度。",
        ],
      },
      example: {
        title: "例题：从列关系判断秩",
        question: `矩阵 ${texInline("A")} 的三列满足 ${texInline("c_3=2c_1-c_2")}，且 ${texInline("c_1,c_2")} 线性无关。${texInline("\\operatorname{rank}(A)")} 是多少？`,
        steps: [
          "第三列已经由前两列线性表示，所以不提供新方向。",
          `前两列 ${texInline("c_1,c_2")} 线性无关，所以至少有两个独立方向。`,
          `列空间维数正好是 ${texInline("2")}，因此 ${texInline("\\operatorname{rank}(A)=2")}。`,
        ],
      },
      quiz: [
        {
          question: `若 ${texInline("\\det(A)\\ne0")}，n 阶矩阵 ${texInline("A")} 的秩是多少？`,
          answer: "秩为 n。非零行列式意味着变换没有把空间压到低维对象。",
        },
        {
          question: "为什么复合变换通常不能增加秩？",
          answer: "后一个变换只能继续处理前一个变换已经留下的输出方向，不能恢复前一步已经丢失的独立方向。",
        },
      ],
      summary: ["行列式描述缩放，秩描述有效维度。", "矩阵乘积对应复合，因此行列式相乘，秩不会凭空增加。"],
      exercises: ["构造一个 3 列矩阵，使三列都非零但秩为 1。"],
    },
    {
      id: "matrix-inverse",
      number: "§4",
      textbookSection: "矩阵的逆",
      title: "矩阵的逆",
      navTitle: "矩阵的逆",
      question: "一个矩阵什么时候能把输入完整恢复出来？几何图像上会出现什么信号？",
      goal: "把可逆理解成变换没有压扁信息，并串起逆矩阵、行列式、秩与方程组唯一解。",
      tags: ["可逆", "信息不丢失", "等价条件"],
      intro: `矩阵可逆意味着它没有让不同输入不可分辨：网格没有被压扁，列向量张成全空间，秩满，方程 ${texInline("Ax=b")} 对每个 ${texInline("b")} 有唯一解。`,
      concepts: [
        { label: "逆矩阵", text: `${texInline("A^{-1}A=AA^{-1}=E")}；逆矩阵把变换后的结果送回原来的输入。` },
        { label: "几何直觉", text: "可逆意味着空间没有被压到低维对象上。" },
        { label: "代数条件", text: "n 阶矩阵可逆等价于秩为 n，也等价于行最简形为 I。" },
        { label: "方程组视角", text: `${texInline("Ax=b")} 对任意 ${texInline("b")} 有唯一解，说明 ${texInline("A")} 能完整追踪输入。` },
      ],
      textbook: {
        reference: "北大版《高等代数》第四章",
        page: "",
        items: ["逆矩阵", "可逆矩阵的判定", "求逆与相关性质"],
      },
      visual: {
        type: "slot",
        label: "可逆性对照",
        title: "图示：可逆与坍缩",
        description: "并排比较可逆与不可逆：左侧网格仍铺满平面，右侧网格坍缩成直线。",
        text: `观察 ${texInline("\\det A")} 接近 0 时网格面积怎样变化，再把几何坍缩与 ${texInline("\\operatorname{rank}(A)<n")} 联系起来。`,
      },
      example: {
        title: "例题：不用求逆判断可逆",
        question: "设 A 的三列向量线性相关。A 可能可逆吗？为什么？",
        steps: [
          `三列线性相关说明列空间维数小于 ${texInline("3")}。`,
          `于是 ${texInline("\\operatorname{rank}(A)<3")}。`,
          "对 3 阶矩阵来说，满秩才可能可逆；几何上看，A 至少让某个非零方向丢失信息。",
        ],
      },
      summary: ["可逆等价于满秩。", "几何上，可逆变换不会把空间压到低维对象。"],
      exercises: [`用秩判断 ${texInline("\\begin{bmatrix}1&2&3\\\\2&4&6\\\\0&1&1\\end{bmatrix}")} 是否可逆。`],
    },
    {
      id: "block-matrices",
      number: "§5",
      textbookSection: "矩阵的分块",
      title: "矩阵的分块",
      navTitle: "矩阵的分块",
      question: "为什么把大矩阵切成小块以后，计算会更清楚？分块在表达什么结构？",
      goal: "把大矩阵拆成有意义的小矩阵，让计算服务于结构。",
      tags: ["分块", "块乘法", "空间分解"],
      intro:
        "分块矩阵是组织复杂信息的工具。当线性映射尊重某种分解时，矩阵会呈现更清楚的结构；块标出了问题内部相互关联或相互独立的部分。",
      concepts: [
        { label: "分块", text: "按照行和列的划分，把一个大矩阵看成若干尺寸匹配的小矩阵。" },
        { label: "块乘法", text: "只要尺寸匹配，块可以像元素一样参与乘法。" },
        { label: "块对角", text: "不同子空间互不耦合时，矩阵会呈现块对角结构。" },
      ],
      textbook: {
        reference: "北大版《高等代数》第四章",
        page: "",
        items: ["矩阵的分块", "分块运算", "块对角矩阵"],
      },
      visual: {
        type: "block",
        title: "图示：把大矩阵看成小系统",
        description: "分块让输入、输出和子结构更清楚。",
        prompts: [
          "把一个大矩阵切成四块，并标出每块的输入输出含义。",
          "演示块乘法时，只高亮真正发生配对的块。",
          "用块对角矩阵展示两个子系统互不干扰的情况。",
        ],
      },
      example: {
        title: "例题：块对角矩阵的逆",
        question: `若 ${texInline("A,D")} 都可逆，为什么 ${texInline("\\operatorname{diag}(A,D)")} 的逆是 ${texInline("\\operatorname{diag}(A^{-1},D^{-1})")}？`,
        steps: [
          "块对角矩阵表示两个部分互不混合。",
          `${texInline("\\operatorname{diag}(A,D)\\operatorname{diag}(A^{-1},D^{-1})=\\operatorname{diag}(AA^{-1},DD^{-1})")}。`,
          `${texInline("AA^{-1}=E")} 且 ${texInline("DD^{-1}=E")}，所以乘积为 ${texInline("\\operatorname{diag}(E,E)")}。`,
        ],
      },
      summary: ["分块让结构先被看见。", "块对角矩阵可以按子系统分别处理。"],
      exercises: [`验证 ${texInline("\\begin{bmatrix}A&0\\\\0&D\\end{bmatrix}\\begin{bmatrix}B&0\\\\0&E\\end{bmatrix}=\\begin{bmatrix}AB&0\\\\0&DE\\end{bmatrix}")}。`],
    },
    {
      id: "elementary-matrices",
      number: "§6",
      textbookSection: "初等矩阵",
      title: "初等矩阵",
      navTitle: "初等矩阵",
      question: "一次初等变换怎样写成左乘一个矩阵？为什么初等变换都可逆？",
      goal: "把初等行变换看成左乘初等矩阵，把初等列变换看成右乘初等矩阵。",
      tags: ["初等变换", "左乘右乘", "可逆操作"],
      intro:
        "初等矩阵把消元法和矩阵乘法连起来。一次初等行操作就是一个可逆的线性操作；连续行操作也可以压缩为一串初等矩阵的乘积。",
      concepts: [
        { label: "换行", text: "交换两行对应左乘一个置换矩阵。" },
        { label: "倍乘", text: "某一行乘非零常数，对应沿某个坐标方向缩放。" },
        { label: "倍加", text: "一行加上另一行的倍数，对应剪切型操作。" },
        { label: "左乘与右乘", text: "左乘初等矩阵对应行变换；右乘初等矩阵对应列变换。" },
      ],
      textbook: {
        reference: "北大版《高等代数》第四章",
        page: "",
        items: ["初等行变换与初等列变换", "初等矩阵", "初等矩阵的逆"],
      },
      visual: {
        type: "slot",
        label: "消元演示",
        title: "图示：行变换怎样变成左乘",
        description: `左侧显示矩阵，右侧显示 ${texInline("P_k\\cdots P_2P_1A")}，每次行操作同步高亮对应的初等矩阵。`,
        text: `同一个行操作施加到单位矩阵上，就得到对应的初等矩阵；连续消元可以写成 ${texInline("P_k\\cdots P_2P_1A")}。`,
      },
      example: {
        title: "例题：把行变换写成左乘",
        question: `对 ${texInline("2\\times2")} 矩阵 ${texInline("A")} 执行 ${texInline("R_2\\leftarrow R_2-3R_1")}。对应的初等矩阵是什么？`,
        steps: [
          `对单位矩阵 ${texInline("E")} 做同样的行变换。`,
          `得到 ${texInline("P(2,1(-3))=\\begin{bmatrix}1&0\\\\-3&1\\end{bmatrix}")}。`,
          `因此变换后的矩阵就是 ${texInline("P(2,1(-3))A")}；找初等矩阵时，把同样操作施加到单位矩阵上。`,
        ],
      },
      summary: ["初等行变换对应左乘初等矩阵。", "初等矩阵可逆，逆矩阵对应反向初等变换。"],
      exercises: [`写出 ${texInline("R_1\\leftarrow R_1+2R_2")} 对应的 2 阶初等矩阵。`],
    },
    {
      id: "block-elementary-applications",
      number: "§7",
      textbookSection: "分块乘法的初等变换及应用举例",
      title: "分块乘法的初等变换及应用举例",
      navTitle: "分块初等变换与应用",
      question: "怎样把初等变换推广到分块矩阵，并让分块计算真正服务于具体问题？",
      goal: "把一次块行变换写成左乘一个分块初等矩阵；通过消去左下块，理解分块消元怎样帮助求解一个耦合系统。",
      tags: ["分块初等变换", "块消元", "耦合系统"],
      intro:
        "初等行变换让一行加上另一行的倍数；分块初等变换让一整块行加上另一块行左乘某个合适矩阵的结果。",
      concepts: [
        { label: "分块初等变换", text: "把适当尺寸的矩阵块作为操作对象，前提仍然是块的尺寸与乘法方向匹配。" },
        { label: "应用举例", text: "本节应以教材给出的具体问题为中心，后续依据教材例题补足应用。" },
      ],
      textbook: {
        reference: "北大版《高等代数》第四章",
        page: "",
        items: ["分块乘法的初等变换", "应用举例", "待依据教材正文补足"],
      },
      summary: ["第四章的七个教材节现在都已有准确位置。", "本节保留为空间，等待依据教材具体内容继续展开。"],
    },
  ],
});


;/* content/ch4-assemble.js */
/* Apply the section patches after ch4.js has registered the base chapter. */
(() => {
  const chapter = algebraContent.chapters.find((item) => item.id === "ch4");
  const patches = window.getChapter4SectionPatches?.();
  if (!chapter || !patches) return;

  chapter.sections = chapter.sections.map((section) => {
    if (!section || typeof section !== "object") return section;
    const patch = patches.get(section.id);
    return patch ? { ...section, ...patch } : section;
  });
})();


;/* content/ch6-registry.js */
/*
 * Chapter 6 section data registry.
 */
(() => {
  const patches = new Map();

  window.defineChapter6Section = function defineChapter6Section(sectionId, patch) {
    if (!sectionId || !patch || typeof patch !== "object") {
      throw new TypeError("Chapter 6 section patches require an id and an object.");
    }
    patches.set(sectionId, patch);
  };

  window.getChapter6SectionPatches = function getChapter6SectionPatches() {
    return patches;
  };
})();


;/* content/ch6-section1.js */
defineChapter6Section("sets-maps", {
  number: "§1",
  textbookSection: "集合·映射",
  title: "集合·映射",
  navTitle: "集合·映射",
  question: "一条对应规则什么时候构成映射？什么时候可以唯一地倒回去？",
  goal: "分清定义域、陪域与像；会判断单射、满射、双射；理解双射与逆映射的关系，以及有限集与无限集的差别。",
  tags: ["映射", "单射", "满射", "双射", "逆映射"],
  intro:
    "映射给每个输入指定恰好一个输出。想倒回去时会遇到两种障碍：两个输入撞到同一个像，或者陪域里有元素没被取到。前者破坏单射，后者破坏满射；两种障碍都没有，映射才可逆。",
  concepts: [
    { label: "单射", text: "不同的输入有不同的像。" },
    { label: "满射", text: "陪域中每个元素都有原像。" },
  ],
  textbook: { reference: "北大版《高等代数》第六章 §1", items: ["集合及其运算", "映射、像与原像", "单射、满射、双射", "映射的乘积与逆映射"] },
  interactive: false,
  lesson: {
    figure: "maps",
    blocks: [
      {
        title: "映射、像与原像",
        tex: String.raw`f:X\to Y,\qquad f(X)=\{f(x):x\in X\}\subseteq Y`,
        text: `每个 ${texInline("x\\in X")} 恰有一个像 ${texInline("f(x)")}。像集 ${texInline("f(X)")} 可以比陪域 ${texInline("Y")} 小；${texInline("y")} 的原像集 ${texInline("\\{x:f(x)=y\\}")} 可以是空集，也可以含多个元素。两个映射相等，要求定义域、陪域和对应规则都相同。`,
      },
      {
        title: "单射、满射、双射与逆映射",
        tex: String.raw`g\circ f=1_X,\qquad f\circ g=1_Y`,
        text: `单射：${texInline("x_1\\ne x_2\\Rightarrow f(x_1)\\ne f(x_2)")}；满射：${texInline("f(X)=Y")}。双射同时满足二者，这时并且只有这时存在逆映射 ${texInline("g=f^{-1}")}，满足上式。乘积 ${texInline("(g\\circ f)(x)=g(f(x))")} 先作用 ${texInline("f")}。`,
      },
      {
        title: "有限集与无限集",
        text: `${texInline("X,Y")} 是元素个数相同的有限集时，${texInline("f:X\\to Y")} 单射 ${texInline("\\Leftrightarrow")} 满射。无限集上这一条不成立：在全体多项式 ${texInline("P[x]")} 上，求导 ${texInline("D")} 是满射，但 ${texInline("D(1)=D(2)=0")}，不是单射；乘以 ${texInline("x")} 是单射，但常数 1 没有原像。第七章会看到，有限维空间上的线性变换又满足“单射 ${texInline("\\Leftrightarrow")} 满射”。`,
      },
    ],
    pitfalls: [
      `陪域是映射的一部分：${texInline("f(x)=x^2")} 作为 ${texInline("\\mathbb R\\to\\mathbb R")} 不是满射，作为 ${texInline("\\mathbb R\\to[0,+\\infty)")} 是满射。`,
      `原像集 ${texInline("f^{-1}(y)")} 对任何映射都有意义；逆映射 ${texInline("f^{-1}")} 只有双射才有。`,
      `${texInline("g\\circ f")} 先作用 ${texInline("f")}，再作用 ${texInline("g")}；一般 ${texInline("g\\circ f\\ne f\\circ g")}。`,
    ],
  },
  example: {
    title: "例题：数一数映射、满射与单射",
    question: `设 ${texInline("X=\\{1,2,3\\}")}，${texInline("Y=\\{a,b\\}")}。从 ${texInline("X")} 到 ${texInline("Y")} 一共有多少个映射？其中满射、单射各有多少个？`,
    choices: [
      { text: "6 个映射，6 个满射，0 个单射" },
      { correct: true, text: "8 个映射，6 个满射，0 个单射" },
      { text: "8 个映射，8 个满射，2 个单射" },
      { text: "9 个映射，6 个满射，3 个单射" },
    ],
    steps: [
      `每个输入独立地选 ${texInline("a")} 或 ${texInline("b")}，共 ${texInline("2^3=8")} 个映射。`,
      `只有两个常值映射（全部映到 ${texInline("a")} 或全部映到 ${texInline("b")}）漏掉了一个输出，所以满射有 ${texInline("8-2=6")} 个。`,
      "3 个输入放进 2 个输出，必有两个撞在一起，所以单射有 0 个。",
      `反过来从 ${texInline("Y")} 到 ${texInline("X")}：共 ${texInline("3^2=9")} 个映射，单射 ${texInline("3\\times2=6")} 个，满射 0 个。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("g\\circ f")} 是单射。${texInline("f")} 与 ${texInline("g")} 中哪一个一定是单射？`,
      answer: `${texInline("f")} 一定是：若 ${texInline("f(x_1)=f(x_2)")}，则 ${texInline("g(f(x_1))=g(f(x_2))")}，由 ${texInline("g\\circ f")} 单射得 ${texInline("x_1=x_2")}。${texInline("g")} 不一定，它在 ${texInline("f")} 的像集之外可以有碰撞。`,
    },
    {
      question: `${texInline("g\\circ f")} 是满射。哪一个一定是满射？`,
      answer: `${texInline("g")} 一定是：每个 ${texInline("z")} 都等于某个 ${texInline("g(f(x))")}，自然在 ${texInline("g")} 的像里。${texInline("f")} 不一定。`,
    },
    {
      question: `有限集 ${texInline("X")} 到自身的单射一定是满射吗？自然数集 ${texInline("\\mathbb N")} 到自身的单射呢？`,
      answer: `有限集上一定是：${texInline("n")} 个互不相同的像占满 ${texInline("n")} 个元素。${texInline("\\mathbb N")} 上不一定，${texInline("n\\mapsto n+1")} 是单射，但 0 没有原像。`,
    },
  ],
  summary: [
    "映射给每个输入恰好一个输出；陪域是映射的一部分。",
    `单射看有没有碰撞，满射看有没有遗漏；双射 ${texInline("\\Leftrightarrow")} 存在逆映射。`,
    `元素个数相同的有限集之间，单射 ${texInline("\\Leftrightarrow")} 满射；无限集上这一条失效。`,
  ],
});


;/* content/ch6-section2.js */
defineChapter6Section("vector-space-definition", {
  number: "§2",
  textbookSection: "线性空间的定义与简单性质",
  title: "线性空间的定义与简单性质",
  navTitle: "线性空间定义",
  question: "只保留加法与数乘的运算规律，哪些对象都可以当作向量？",
  goal: "掌握线性空间的定义和简单性质；会在多项式、矩阵、函数等例子中找出零向量与负向量；会用一条失败的规律否定一个候选结构。",
  tags: ["线性空间", "八条运算规律", "零向量", "负向量", "数域"],
  intro:
    "线性空间只关心两件事：向量怎样相加，怎样乘以数域中的数。只要这两种运算满足八条规律，多项式、矩阵、函数都是向量。零向量也由运算决定，未必是数字 0。",
  concepts: [
    { label: "线性空间", text: `数域 ${texInline("P")} 上带有加法与数乘、满足八条运算规律的集合。` },
    { label: "零向量", text: `使 ${texInline("\\alpha+0=\\alpha")} 对一切 ${texInline("\\alpha")} 成立的元素，由加法决定。` },
  ],
  textbook: { reference: "北大版《高等代数》第六章 §2", items: ["线性空间的定义", "常见例子", "零元素与负元素的唯一性", "简单性质"] },
  interactive: false,
  lesson: {
    figure: "gallery",
    blocks: [
      {
        title: "线性空间的定义",
        tex: String.raw`\alpha+\beta\in V,\qquad k\alpha\in V\qquad(\alpha,\beta\in V,\ k\in P)`,
        text: `加法交换、结合，有零元 ${texInline("0")}，每个 ${texInline("\\alpha")} 有负元 ${texInline("-\\alpha")}；数乘满足 ${texInline("1\\alpha=\\alpha")}、${texInline("k(l\\alpha)=(kl)\\alpha")}；两者由 ${texInline("(k+l)\\alpha=k\\alpha+l\\alpha")}、${texInline("k(\\alpha+\\beta)=k\\alpha+k\\beta")} 相连。数域是定义的一部分：${texInline("\\mathbb C")} 可以看成 ${texInline("\\mathbb R")} 上的空间，也可以看成 ${texInline("\\mathbb C")} 上的空间，二者不同。`,
      },
      {
        title: "常见例子",
        tex: String.raw`P[x]_n=\{a_0+a_1x+\cdots+a_{n-1}x^{n-1}:a_i\in P\}`,
        text: `${texInline("P[x]_n")} 是次数小于 ${texInline("n")} 的多项式连同零多项式（北大记号），按通常运算构成线性空间。全体多项式 ${texInline("P[x]")}、全体 ${texInline("m\\times n")} 矩阵 ${texInline("P^{m\\times n}")}、区间上的全体实函数，按逐项或逐点运算都是线性空间。`,
      },
      {
        title: "简单性质",
        tex: String.raw`0\alpha=0,\qquad k0=0,\qquad (-1)\alpha=-\alpha`,
        text: `零向量唯一：${texInline("0_1=0_1+0_2=0_2")}；每个向量的负向量也唯一。${texInline("k\\alpha=0")} 当且仅当 ${texInline("k=0")} 或 ${texInline("\\alpha=0")}。这些都由八条规律推出，与向量具体是什么无关。`,
      },
    ],
    pitfalls: [
      `零向量由加法决定。例题中的 ${texInline("\\mathbb R^+")} 里，零向量是数 1。`,
      `只检查“运算封闭”不够：在 ${texInline("\\mathbb R^2")} 上保留加法、令 ${texInline("k\\circ(a,b)=(ka,0)")}，运算封闭，却违反 ${texInline("1\\circ\\alpha=\\alpha")}。`,
      `次数恰为 ${texInline("n")} 的多项式全体不是线性空间：它不含零多项式，${texInline("x^n+(-x^n)=0")} 也离开了集合。`,
    ],
  },
  example: {
    title: "例题：正实数上的“加法”与“数乘”",
    question: `在正实数集 ${texInline("\\mathbb R^+")} 上规定 ${texInline("a\\oplus b=ab")}，${texInline("k\\circ a=a^k\\ (k\\in\\mathbb R)")}。${texInline("\\mathbb R^+")} 对这两种运算构成 ${texInline("\\mathbb R")} 上的线性空间吗？如果构成，零向量和 ${texInline("a")} 的负向量分别是什么？`,
    choices: [
      { text: `不构成，因为 ${texInline("\\mathbb R^+")} 里没有 0。` },
      { text: `不构成，因为 ${texInline("(-1)\\circ a")} 不在 ${texInline("\\mathbb R^+")} 中。` },
      { correct: true, text: `构成；零向量是 1，${texInline("a")} 的负向量是 ${texInline("1/a")}。` },
      { text: `构成；零向量是 0，${texInline("a")} 的负向量是 ${texInline("-a")}。` },
    ],
    steps: [
      `封闭：${texInline("a,b>0")} 时 ${texInline("ab>0")}，${texInline("a^k>0")}。`,
      `加法：${texInline("ab=ba")}，${texInline("(ab)c=a(bc)")}；${texInline("a\\oplus1=a")}，所以零向量是 1；${texInline("a\\oplus\\frac1a=1")}，所以 ${texInline("a")} 的负向量是 ${texInline("\\frac1a")}。`,
      `数乘：${texInline("1\\circ a=a")}，${texInline("k\\circ(l\\circ a)=(a^l)^k=a^{kl}=(kl)\\circ a")}。`,
      `分配律：${texInline("(k+l)\\circ a=a^{k+l}=a^ka^l")}，${texInline("k\\circ(a\\oplus b)=(ab)^k=a^kb^k")}。八条全部成立。按对数刻度画 ${texInline("\\mathbb R^+")}，${texInline("\\oplus")} 就成了长度相接；§8 会看到 ${texInline("\\ln")} 把这个空间同构地映到 ${texInline("\\mathbb R")}。`,
    ],
  },
  quiz: [
    {
      question: `在 ${texInline("\\mathbb R^2")} 上保留通常加法，把数乘改成 ${texInline("k\\circ(a,b)=(ka,0)")}。八条规律中哪一条失败？`,
      answer: `只有 ${texInline("1\\circ\\alpha=\\alpha")} 失败：${texInline("1\\circ(a,b)=(a,0)")}。其余七条都成立，可见这一条不能由其他规律推出。`,
    },
    {
      question: `在例题的 ${texInline("\\mathbb R^+")} 中，${texInline("0\\circ a")} 等于什么？这与性质 ${texInline("0\\alpha=0")} 矛盾吗？`,
      answer: `${texInline("0\\circ a=a^0=1")}，正是这个空间的零向量，与性质一致。`,
    },
    {
      question: "为什么线性空间的零向量只有一个？",
      answer: `若 ${texInline("0_1,0_2")} 都是零向量，则 ${texInline("0_1=0_1+0_2=0_2")}。`,
    },
    {
      question: "全体 2 阶可逆实矩阵，按矩阵的加法与数乘，构成线性空间吗？",
      answer: `不构成：零矩阵不可逆；${texInline("E+(-E)=O")} 也说明加法不封闭。`,
    },
  ],
  summary: [
    "线性空间 = 集合 + 数域 + 满足八条规律的加法与数乘。",
    "多项式、矩阵、函数都可以是向量；零向量和负向量由运算决定。",
    "否定一个候选结构，找出一条失败的规律就够了。",
  ],
});


;/* content/ch6-section3.js */
defineChapter6Section("basis-coordinates", {
  number: "§3",
  textbookSection: "维数·基与坐标",
  title: "维数·基与坐标",
  navTitle: "维数·基与坐标",
  question: "选定一组基以后，抽象向量怎样变成一列数？这列数为什么唯一？",
  goal: "理解基、维数与坐标；会把多项式、矩阵的线性相关问题转化为坐标的线性相关问题；会求向量在给定基下的坐标。",
  tags: ["基", "维数", "坐标", "有限维", "无限维"],
  intro:
    `在 ${texInline(String.raw`P[x]_3`)} 中取基 ${texInline(String.raw`1,x,x^2`)}，多项式 ${texInline(String.raw`a_0+a_1x+a_2x^2`)} 就对应三维空间中的点 ${texInline(String.raw`(a_0,a_1,a_2)`)}。坐标保持加法与数乘，所以多项式之间的线性关系，都能在坐标空间里直接看出来。`,
  concepts: [
    { label: "基", text: "线性无关、并且能线性表出空间中每个向量的有序向量组。" },
    { label: "坐标", text: "向量由一组基线性表出时唯一的系数组。" },
  ],
  textbook: { reference: "北大版《高等代数》第六章 §3", items: ["线性无关与线性表出", "基与维数", "坐标", "有限维与无限维"] },
  interactive: { type: "slot", title: "多项式与它的坐标点" },
  lesson: {
    blocks: [
      {
        title: "基与维数",
        tex: String.raw`V=L(\varepsilon_1,\dots,\varepsilon_n),\qquad \varepsilon_1,\dots,\varepsilon_n\ \text{线性无关}`,
        text: `这时 ${texInline("\\varepsilon_1,\\dots,\\varepsilon_n")} 是 ${texInline("V")} 的一组基，${texInline("\\dim V=n")}。${texInline("P[x]_n")} 有基 ${texInline("1,x,\\dots,x^{n-1}")}，维数 ${texInline("n")}；${texInline("P^{m\\times n}")} 有基 ${texInline("E_{ij}")}，维数 ${texInline("mn")}。有限个多项式的次数有上界，张不满全体多项式，所以 ${texInline("P[x]")} 是无限维的。`,
      },
      {
        title: "坐标",
        tex: String.raw`\alpha=a_1\varepsilon_1+a_2\varepsilon_2+\cdots+a_n\varepsilon_n\ \longleftrightarrow\ (a_1,a_2,\dots,a_n)`,
        text: `基线性无关，所以这种表法唯一，系数组称为 ${texInline("\\alpha")} 在这组基下的坐标。基是有序的：交换两个基向量，坐标的两个分量也随之交换。`,
      },
      {
        title: "相关性可以在坐标里判断",
        tex: String.raw`k_1\alpha_1+\cdots+k_s\alpha_s=0\iff k_1X_1+\cdots+k_sX_s=0`,
        text: `${texInline("X_i")} 是 ${texInline("\\alpha_i")} 的坐标。坐标保持加法与数乘，所以一组向量线性相关，当且仅当它们的坐标向量线性相关。判断几个多项式或矩阵是否构成基，就化为求坐标矩阵的秩或行列式。`,
      },
    ],
    pitfalls: [
      "维数与“看起来有几个数”不同：2 阶实对称矩阵有 4 个元素，所成空间的维数是 3。",
      "坐标依赖于基和基的顺序，离开基谈坐标没有意义。",
      "三个多项式两两不成比例，仍可能线性相关：实验中预设的三条曲线就是例子。",
    ],
  },
  example: {
    title: "例题：判断基并求坐标",
    question: `${texInline("1+x,\\ x+x^2,\\ 1+x^2")} 是 ${texInline("P[x]_3")} 的一组基吗？若是，求 ${texInline("2+3x+x^2")} 在这组基下的坐标。`,
    choices: [
      { text: `不是基，因为 ${texInline("1+x^2")} 能由前两个表出。` },
      { text: `是基，坐标为 ${texInline("(1,1,1)")}。` },
      { text: `是基，坐标为 ${texInline("(2,3,1)")}。` },
      { correct: true, text: `是基，坐标为 ${texInline("(2,1,0)")}。` },
    ],
    steps: [
      `在基 ${texInline("1,x,x^2")} 下，三个多项式的坐标是 ${texInline("(1,1,0),(0,1,1),(1,0,1)")}，坐标矩阵的行列式为 ${texInline("2\\ne0")}，三者线性无关；${texInline("\\dim P[x]_3=3")}，所以它们是一组基。`,
      `设 ${texInline("2+3x+x^2=a(1+x)+b(x+x^2)+c(1+x^2)")}，比较系数：${texInline("a+c=2,\\ a+b=3,\\ b+c=1")}。`,
      `三式相加得 ${texInline("a+b+c=3")}，于是 ${texInline("a=2,\\ b=1,\\ c=0")}。`,
      `验证：${texInline("2(1+x)+(x+x^2)=2+3x+x^2")}。新坐标 ${texInline("(2,1,0)")} 与它在 ${texInline("1,x,x^2")} 下的坐标 ${texInline("(2,3,1)")} 不同。`,
    ],
  },
  quiz: [
    {
      question: "2 阶实对称矩阵构成的空间维数是多少？",
      answer: `3。基可取 ${texInline("E_{11},\\ E_{22},\\ E_{12}+E_{21}")}：对称矩阵由两个对角元和一个非对角元决定。`,
    },
    {
      question: `${texInline("\\mathbb C")} 看成 ${texInline("\\mathbb R")} 上的线性空间和看成 ${texInline("\\mathbb C")} 上的线性空间，维数分别是多少？`,
      answer: `2 和 1。在 ${texInline("\\mathbb R")} 上可取基 ${texInline("1,\\mathrm i")}；在 ${texInline("\\mathbb C")} 上任何一个非零复数单独构成基。`,
    },
    {
      question: `为什么全体多项式 ${texInline("P[x]")} 没有有限的基？`,
      answer: `任取有限个多项式，设最高次数为 ${texInline("m")}，它们的线性组合次数都不超过 ${texInline("m")}，表不出 ${texInline("x^{m+1}")}。`,
    },
    {
      question: `实验中把 ${texInline("p_3")} 的坐标点拖到 ${texInline("(-1,-\\tfrac12,-\\tfrac12)")}，三个多项式还是基吗？`,
      answer: `不是。${texInline("(-1,-\\tfrac12,-\\tfrac12)=(1,0,2)-\\tfrac12(4,1,5)")}，即 ${texInline("p_3=p_1-\\tfrac12p_2")}，三个坐标点与原点共面。`,
    },
  ],
  summary: [
    "基 = 线性无关 + 能表出全部向量；维数是基所含向量的个数。",
    "取定有序基，每个向量对应唯一的坐标，并且坐标保持运算。",
    "抽象向量的线性相关，归结为坐标的线性相关。",
  ],
});


;/* content/ch6-section4.js */
defineChapter6Section("change-of-basis", {
  number: "§4",
  textbookSection: "基变换与坐标变换",
  title: "基变换与坐标变换",
  navTitle: "基变换与坐标变换",
  question: "同一个向量换一组基，坐标怎样变？过渡矩阵的方向怎样记？",
  goal: `掌握过渡矩阵 ${texInline(String.raw`(\eta_1,\dots,\eta_n)=(\varepsilon_1,\dots,\varepsilon_n)A`)} 与坐标变换公式 ${texInline(String.raw`X=AY`)}；理解多项式在基 ${texInline(String.raw`1,x-a,(x-a)^2`)} 下的坐标就是 Taylor 系数。`,
  tags: ["过渡矩阵", "坐标变换", "X=AY", "Taylor 系数"],
  intro:
    `换基时向量本身不动，变的是度量它的那组基。把新基向量在旧基下的坐标排成列，得到过渡矩阵 ${texInline(String.raw`A`)}；同一向量的旧坐标 ${texInline(String.raw`X`)} 与新坐标 ${texInline(String.raw`Y`)} 满足 ${texInline(String.raw`X=AY`)}。拖动 ${texInline(String.raw`a`)}，看同一条抛物线在一族新基下的坐标。`,
  concepts: [
    { label: "过渡矩阵", text: `由基 ${texInline("\\varepsilon")} 到基 ${texInline("\\eta")} 的过渡矩阵 ${texInline("A")} 满足 ${texInline("(\\eta)=(\\varepsilon)A")}，第 ${texInline("j")} 列是 ${texInline("\\eta_j")} 在 ${texInline("\\varepsilon")} 下的坐标。` },
    { label: "坐标变换", text: `旧坐标 ${texInline("X")}、新坐标 ${texInline("Y")} 满足 ${texInline("X=AY")}。` },
  ],
  textbook: { reference: "北大版《高等代数》第六章 §4", items: ["基变换与过渡矩阵", "过渡矩阵可逆", `坐标变换公式 ${texInline("X=AY")}`] },
  interactive: { type: "slot", title: "同一条曲线，换一组基" },
  lesson: {
    blocks: [
      {
        title: "过渡矩阵",
        tex: String.raw`(\eta_1,\eta_2,\dots,\eta_n)=(\varepsilon_1,\varepsilon_2,\dots,\varepsilon_n)A`,
        text: `${texInline("A")} 称为由基 ${texInline("\\varepsilon")} 到基 ${texInline("\\eta")} 的过渡矩阵，它的第 ${texInline("j")} 列是 ${texInline("\\eta_j")} 在基 ${texInline("\\varepsilon")} 下的坐标。${texInline("A")} 可逆，由 ${texInline("\\eta")} 到 ${texInline("\\varepsilon")} 的过渡矩阵是 ${texInline("A^{-1}")}。`,
      },
      {
        title: "坐标变换公式",
        tex: String.raw`X=AY,\qquad Y=A^{-1}X`,
        text: `${texInline("X,Y")} 是同一个 ${texInline("\\alpha")} 在 ${texInline("\\varepsilon,\\eta")} 下的坐标：${texInline("\\alpha=(\\varepsilon)X=(\\eta)Y=(\\varepsilon)AY")}，坐标唯一，所以 ${texInline("X=AY")}，旧坐标在左边。在 ${texInline("\\mathbb R^n")} 中把两组基排成矩阵 ${texInline("U,W")}，则 ${texInline("W=UA")}，${texInline("A=U^{-1}W")}；有的教材把它记作 ${texInline("P_{U\\leftarrow W}")}，意思相同。`,
      },
      {
        title: "多项式的 Taylor 坐标",
        tex: String.raw`p(x)=p(a)+p'(a)(x-a)+\tfrac12p''(a)(x-a)^2`,
        text: `在 ${texInline("P[x]_3")} 中，由 ${texInline("1,x,x^2")} 到 ${texInline("1,x-a,(x-a)^2")} 的过渡矩阵是 ${texInline("A_a=\\begin{pmatrix}1&-a&a^2\\\\0&1&-2a\\\\0&0&1\\end{pmatrix}")}，${texInline("p")} 的新坐标是 ${texInline("(p(a),p'(a),\\tfrac12p''(a))")}。${texInline("A_a^{-1}=A_{-a}")}：换回旧基相当于把 ${texInline("a")} 换成 ${texInline("-a")}。`,
      },
    ],
    pitfalls: [
      `把 ${texInline("X=AY")} 写成 ${texInline("Y=AX")}。记法：${texInline("A")} 的列描述新基，所以 ${texInline("A")} 乘新坐标得旧坐标。`,
      `把过渡矩阵的列写成旧基在新基下的坐标，得到的是 ${texInline("A^{-1}")}。`,
      "换基与线性变换不同：换基时向量不动，只换坐标。",
    ],
  },
  example: {
    title: "例题：求过渡矩阵与新坐标",
    question: `在 ${texInline("P[x]_3")} 中，求由 ${texInline("1,x,x^2")} 到 ${texInline("1,x-1,(x-1)^2")} 的过渡矩阵 ${texInline("A")}，以及 ${texInline("p=2+3x+x^2")} 在新基下的坐标 ${texInline("Y")}。`,
    choices: [
      { text: `${texInline("A=\\begin{pmatrix}1&1&1\\\\0&1&2\\\\0&0&1\\end{pmatrix}")}，${texInline("Y=(6,5,1)^T")}` },
      { correct: true, text: `${texInline("A=\\begin{pmatrix}1&-1&1\\\\0&1&-2\\\\0&0&1\\end{pmatrix}")}，${texInline("Y=(6,5,1)^T")}` },
      { text: `${texInline("A=\\begin{pmatrix}1&-1&1\\\\0&1&-2\\\\0&0&1\\end{pmatrix}")}，${texInline("Y=(2,3,1)^T")}` },
      { text: `${texInline("A=\\begin{pmatrix}1&-1&1\\\\0&1&-2\\\\0&0&1\\end{pmatrix}")}，${texInline("Y=(0,1,1)^T")}` },
    ],
    steps: [
      `新基在旧基下的坐标：${texInline("1\\to(1,0,0)^T")}，${texInline("x-1\\to(-1,1,0)^T")}，${texInline("(x-1)^2=1-2x+x^2\\to(1,-2,1)^T")}，按列排成 ${texInline("A")}。`,
      `旧坐标 ${texInline("X=(2,3,1)^T")}。由 ${texInline("X=AY")} 得 ${texInline("Y=A^{-1}X")}，其中 ${texInline("A^{-1}=\\begin{pmatrix}1&1&1\\\\0&1&2\\\\0&0&1\\end{pmatrix}")} 是由新基到旧基的过渡矩阵。`,
      `${texInline("Y=A^{-1}X=(6,5,1)^T")}，即 ${texInline("p=6+5(x-1)+(x-1)^2")}；也可以直接算 ${texInline("p(1)=6,\\ p'(1)=5,\\ \\tfrac12p''(1)=1")}。`,
      `验证 ${texInline("AY=(6-5+1,\\ 5-2,\\ 1)^T=(2,3,1)^T=X")}。${texInline("Y=(0,1,1)^T")} 那一项把公式写成了 ${texInline("Y=AX")}；${texInline("A")} 写成 ${texInline("\\begin{pmatrix}1&1&1\\\\0&1&2\\\\0&0&1\\end{pmatrix}")} 的那一项把 ${texInline("A")} 与 ${texInline("A^{-1}")} 弄反了；${texInline("Y=(2,3,1)^T")} 那一项直接把旧坐标当成了新坐标。`,
    ],
  },
  quiz: [
    {
      question: `由 ${texInline("1,x-1,(x-1)^2")} 到 ${texInline("1,x,x^2")} 的过渡矩阵是什么？`,
      answer: `${texInline("A^{-1}=\\begin{pmatrix}1&1&1\\\\0&1&2\\\\0&0&1\\end{pmatrix}")}：${texInline("x=(x-1)+1")}，${texInline("x^2=(x-1)^2+2(x-1)+1")}，按列排列。它正是 ${texInline("A_{-1}")}。`,
    },
    {
      question: `每个基向量都放大 2 倍，${texInline("\\eta_i=2\\varepsilon_i")}，坐标怎样变？`,
      answer: `${texInline("A=2E")}，${texInline("X=2Y")}，所以 ${texInline("Y=\\tfrac12X")}：基向量变长，坐标变小。`,
    },
    {
      question: `由 ${texInline("\\varepsilon")} 到 ${texInline("\\eta")} 的过渡矩阵为 ${texInline("A")}，由 ${texInline("\\eta")} 到 ${texInline("\\zeta")} 的过渡矩阵为 ${texInline("B")}。由 ${texInline("\\varepsilon")} 到 ${texInline("\\zeta")} 的过渡矩阵是什么？`,
      answer: `${texInline("(\\zeta)=(\\eta)B=(\\varepsilon)AB")}，是 ${texInline("AB")}。`,
    },
    {
      question: `实验中拖动 ${texInline("a")} 时，右图的点 ${texInline("X")} 为什么一动不动？`,
      answer: `${texInline("X")} 是 ${texInline("p")} 在旧基 ${texInline("1,x,x^2")} 下的坐标，旧基和 ${texInline("p")} 都没变。变的是新基 ${texInline("\\eta_j")}（${texInline("A_a")} 的列）和沿新基走到 ${texInline("X")} 所需的步数 ${texInline("Y")}。`,
    },
  ],
  summary: [
    `${texInline(String.raw`(\eta)=(\varepsilon)A`)}：${texInline(String.raw`A`)} 的列是新基在旧基下的坐标。`,
    `${texInline(String.raw`X=AY`)}，旧坐标在左；由 ${texInline(String.raw`\eta`)} 到 ${texInline(String.raw`\varepsilon`)} 的过渡矩阵是 ${texInline(String.raw`A^{-1}`)}。`,
    `多项式在 ${texInline(String.raw`1,x-a,(x-a)^2`)} 下的坐标是 Taylor 系数。`,
  ],
});


;/* content/ch6-section5.js */
defineChapter6Section("subspaces", {
  number: "§5",
  textbookSection: "线性子空间",
  title: "线性子空间",
  navTitle: "线性子空间",
  question: "线性空间的子集什么时候自己也是线性空间？由几个向量生成的子空间有多大？",
  goal: "会用“非空且对加法、数乘封闭”判断子空间；理解生成子空间的维数等于向量组的秩；会把子空间的基扩充为整个空间的基。",
  tags: ["子空间", "生成子空间", "向量组的秩", "基的扩充"],
  intro:
    `子空间沿用原空间的加法和数乘，只需检查运算结果不离开这个子集。图中满足 ${texInline(String.raw`p(1)=0`)} 的曲线都过同一点，相加后仍过这一点；把条件改成 ${texInline(String.raw`p(1)=1`)}，两条曲线一相加就离开了集合。`,
  concepts: [
    { label: "子空间", text: "对原空间的加法与数乘封闭的非空子集。" },
    { label: "生成子空间", text: `${texInline("L(\\alpha_1,\\dots,\\alpha_s)")}：${texInline("\\alpha_1,\\dots,\\alpha_s")} 的全部线性组合。` },
  ],
  textbook: { reference: "北大版《高等代数》第六章 §5", items: ["子空间的判别", "齐次方程组的解空间", "生成子空间", "基的扩充定理"] },
  interactive: false,
  lesson: {
    figure: "curve-families",
    blocks: [
      {
        title: "子空间的判别",
        tex: String.raw`\alpha,\beta\in W,\ k,l\in P\ \Longrightarrow\ k\alpha+l\beta\in W`,
        text: `${texInline("V")} 的非空子集 ${texInline("W")} 对加法和数乘封闭，就是子空间：八条规律自动从 ${texInline("V")} 继承，零向量 ${texInline("0=0\\alpha")} 也在 ${texInline("W")} 中。齐次线性方程组的解集是 ${texInline("P^n")} 的子空间，维数为 ${texInline("n-r")}，基础解系就是它的一组基。`,
      },
      {
        title: "生成子空间",
        tex: String.raw`\dim L(\alpha_1,\dots,\alpha_s)=\operatorname{rank}\{\alpha_1,\dots,\alpha_s\}`,
        text: `${texInline("L(\\alpha_1,\\dots,\\alpha_s)")} 是包含 ${texInline("\\alpha_1,\\dots,\\alpha_s")} 的最小子空间，向量组的任一极大无关组都是它的基。两个向量组生成同一个子空间，当且仅当这两个向量组等价。`,
      },
      {
        title: "基的扩充",
        text: `${texInline("W")} 是 ${texInline("n")} 维空间 ${texInline("V")} 的 ${texInline("m")} 维子空间，${texInline("\\alpha_1,\\dots,\\alpha_m")} 是 ${texInline("W")} 的基，则总能再取 ${texInline("n-m")} 个向量，凑成 ${texInline("V")} 的基。例如图中 ${texInline("W_0")} 的基 ${texInline("x-1,(x-1)^2")} 添上 1，就是 ${texInline("P[x]_3")} 的基。`,
      },
    ],
    pitfalls: [
      `含零向量只是必要条件：第一象限含零且对加法封闭，但 ${texInline("(-1)(1,1)")} 跑到了第三象限。`,
      `非齐次方程组的解集、${texInline("\\{p:p(1)=1\\}")} 都不含零向量，不是子空间。`,
      `两个子空间的并一般不是子空间：${texInline("x")} 轴与 ${texInline("y")} 轴的并中，${texInline("(1,0)+(0,1)")} 不在其中。`,
    ],
  },
  example: {
    title: "例题：矩阵空间中的子空间",
    question: `在 ${texInline("\\mathbb R^{2\\times2}")} 中，下列子集哪些是子空间？① 对称矩阵；② 可逆矩阵；③ 迹为 0 的矩阵；④ 行列式为 0 的矩阵。`,
    choices: [
      { text: "①②③④ 都是" },
      { correct: true, text: "只有 ① 和 ③，它们的维数都是 3" },
      { text: "只有 ①③④" },
      { text: "只有 ②" },
    ],
    steps: [
      `①：对称矩阵的和与数乘仍对称。基 ${texInline("E_{11},E_{22},E_{12}+E_{21}")}，维数 3。`,
      `③：${texInline("\\operatorname{tr}(kA+lB)=k\\operatorname{tr}A+l\\operatorname{tr}B")}，迹为 0 的矩阵组合后迹仍为 0。基 ${texInline("E_{11}-E_{22},E_{12},E_{21}")}，维数 3。`,
      "②：零矩阵不可逆，可逆矩阵全体不含零向量。",
      `④：${texInline("\\operatorname{diag}(1,0)")} 与 ${texInline("\\operatorname{diag}(0,1)")} 的行列式都是 0，它们的和 ${texInline("E")} 的行列式是 1，对加法不封闭。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("\\{p\\in P[x]_4:p(1)=0\\}")} 的维数是多少？`,
      answer: `3。${texInline("P[x]_4")} 是次数小于 4 的多项式，维数 4；${texInline("x-1,(x-1)^2,(x-1)^3")} 是这个子空间的一组基。`,
    },
    {
      question: `${texInline("\\alpha_1,\\alpha_2")} 线性无关，${texInline("\\alpha_3=\\alpha_1+\\alpha_2")}。${texInline("L(\\alpha_1,\\alpha_2,\\alpha_3)")} 的维数是多少？`,
      answer: `2，等于向量组的秩；${texInline("L(\\alpha_1,\\alpha_2,\\alpha_3)=L(\\alpha_1,\\alpha_2)")}。`,
    },
    {
      question: `${texInline("\\mathbb R^4")} 中方程 ${texInline("x_1+x_2+x_3+x_4=0")} 的解空间维数是多少？`,
      answer: "3：未知量个数 4 减去系数矩阵的秩 1。",
    },
    {
      question: `第一象限 ${texInline("\\{(x,y):x\\ge0,\\ y\\ge0\\}")} 含零向量、对加法封闭，为什么不是子空间？`,
      answer: `对数乘不封闭：${texInline("(-1)(1,1)=(-1,-1)")} 不在其中。`,
    },
  ],
  summary: [
    "子空间 = 对加法、数乘封闭的非空子集。",
    `${texInline(String.raw`\dim L(\alpha_1,\dots,\alpha_s)`)} 等于向量组的秩，极大无关组是它的基。`,
    "子空间的基总能扩充为整个空间的基。",
  ],
});


;/* content/ch6-section6.js */
defineChapter6Section("intersection-sum", {
  number: "§6",
  textbookSection: "子空间的交与和",
  title: "子空间的交与和",
  navTitle: "交与和",
  question: "两个子空间合起来能张成多大的空间？公共的方向怎样扣除？",
  goal: "掌握子空间的交与和；会用维数公式计算交或和的维数；理解维数之和超过空间维数时交一定非零。",
  tags: ["交", "和", "维数公式"],
  intro:
    `${texInline(String.raw`U+W`)} 由 ${texInline(String.raw`U`)} 中向量与 ${texInline(String.raw`W`)} 中向量的和组成，是包含二者的最小子空间。公共方向在 ${texInline(String.raw`\dim U`)} 和 ${texInline(String.raw`\dim W`)} 里各数了一次，所以要扣掉一次。在 ${texInline(String.raw`\mathbb R^3`)} 里拖动两个平面，看它们的交能不能只剩原点。`,
  concepts: [
    { label: "和", text: `${texInline("V_1+V_2=\\{\\alpha_1+\\alpha_2:\\alpha_1\\in V_1,\\ \\alpha_2\\in V_2\\}")}。` },
    { label: "维数公式", text: `${texInline(String.raw`\dim V_1+\dim V_2=\dim(V_1+V_2)+\dim(V_1\cap V_2)`)}。` },
  ],
  textbook: { reference: "北大版《高等代数》第六章 §6", items: ["子空间的交与和", "生成子空间的和", "维数公式", `维数之和大于 ${texInline("n")} 时交非零`] },
  interactive: { type: "slot", title: "两个子空间合起来有多大" },
  lesson: {
    figure: "intersection-curves",
    figureLast: true,
    blocks: [
      {
        title: "交与和",
        tex: String.raw`V_1+V_2=\{\alpha_1+\alpha_2:\alpha_1\in V_1,\ \alpha_2\in V_2\}`,
        text: `${texInline("V_1\\cap V_2")} 与 ${texInline("V_1+V_2")} 都是子空间，并集一般不是。生成元可以直接合并：${texInline("L(\\alpha_1,\\dots,\\alpha_s)+L(\\beta_1,\\dots,\\beta_t)=L(\\alpha_1,\\dots,\\alpha_s,\\beta_1,\\dots,\\beta_t)")}，再从中取极大无关组作为和的基。`,
      },
      {
        title: "维数公式",
        tex: String.raw`\dim V_1+\dim V_2=\dim(V_1+V_2)+\dim(V_1\cap V_2)`,
        text: `证明思路：取 ${texInline("V_1\\cap V_2")} 的一组基，分别扩充成 ${texInline("V_1")}、${texInline("V_2")} 的基，合在一起恰好是 ${texInline("V_1+V_2")} 的基。公共部分在左边数了两次，右边只数一次。`,
      },
      {
        title: `推论：维数之和超过 ${texInline("n")}，交必非零`,
        text: `在 ${texInline("n")} 维空间中，若 ${texInline("\\dim V_1+\\dim V_2>n")}，则 ${texInline("V_1\\cap V_2")} 含非零向量。${texInline("\\mathbb R^3")} 中两个平面 ${texInline("2+2>3")}，一定交出一条直线；下图是 ${texInline("P[x]_4")} 中同样的现象。`,
      },
    ],
    pitfalls: [
      `把 ${texInline("U+W")} 当成 ${texInline("U\\cup W")}；和空间包含一切形如 ${texInline("u+w")} 的向量。`,
      `两组基直接合并不一定是 ${texInline("U+W")} 的基，要去掉 ${texInline("\\dim(U\\cap W)")} 个多余的向量。`,
      "两组生成元各不相同，推不出交为零。",
    ],
  },
  example: {
    title: "例题：多项式空间中的交与和",
    question: `在 ${texInline("P[x]_4")}（次数小于 4 的多项式）中，${texInline("U=\\{p:p(1)=0\\}")}，${texInline("W=\\{p:p(-1)=0\\}")}。求 ${texInline("U\\cap W")} 及其维数，并判断 ${texInline("U+W")} 是什么。`,
    choices: [
      { text: `${texInline("U\\cap W=\\{0\\}")}，${texInline("\\dim(U+W)=6")}` },
      { text: `${texInline("U\\cap W=\\{c(x^2-1)\\}")}，维数 1；${texInline("\\dim(U+W)=5")}` },
      { correct: true, text: `${texInline("U\\cap W=\\{(x^2-1)(a+bx)\\}")}，维数 2；${texInline("U+W=P[x]_4")}` },
      { text: `${texInline("U\\cap W=\\{(x^2-1)(a+bx)\\}")}，维数 2；${texInline("U+W=U\\cup W")}` },
    ],
    steps: [
      `${texInline("\\dim U=\\dim W=3")}，例如 ${texInline("U")} 有基 ${texInline("x-1,(x-1)^2,(x-1)^3")}。`,
      `${texInline("p")} 同时以 ${texInline("1")} 和 ${texInline("-1")} 为根，当且仅当 ${texInline("x^2-1")} 整除 ${texInline("p")}。${texInline("p")} 的次数不超过 3，所以 ${texInline("p=(x^2-1)(a+bx)")}，${texInline("\\dim(U\\cap W)=2")}。`,
      `维数公式：${texInline("\\dim(U+W)=3+3-2=4=\\dim P[x]_4")}，所以 ${texInline("U+W=P[x]_4")}。`,
      `${texInline("3+3>4")} 本身就说明交非零：例如 ${texInline("x^2-1")} 同时以 ${texInline("1")} 和 ${texInline("-1")} 为根，属于 ${texInline("U\\cap W")}。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("\\mathbb R^3")} 中两个不同的二维子空间，交的维数是多少？`,
      answer: `恰为 1。两个平面不同，和比平面大，只能是 ${texInline("\\mathbb R^3")}，于是交的维数是 ${texInline("2+2-3=1")}。`,
    },
    {
      question: `${texInline("\\mathbb R^4")} 中两个二维子空间的交能只有零向量吗？`,
      answer: `能，例如 ${texInline("L(\\varepsilon_1,\\varepsilon_2)")} 与 ${texInline("L(\\varepsilon_3,\\varepsilon_4)")}；${texInline("2+2")} 没有超过 4。`,
    },
    {
      question: `${texInline("\\dim(U+W)=\\dim U+\\dim W")} 在什么条件下成立？`,
      answer: `当且仅当 ${texInline("U\\cap W=\\{0\\}")}。这正是直和的条件。`,
    },
    {
      question: `${texInline("U=L(\\alpha_1,\\alpha_2)")}，${texInline("W=L(\\beta_1,\\beta_2)")}，两组各自线性无关，四个向量的秩为 3。${texInline("U\\cap W")} 的维数是多少？`,
      answer: `${texInline("\\dim(U+W)=3")}，所以 ${texInline("\\dim(U\\cap W)=2+2-3=1")}。`,
    },
  ],
  summary: [
    "交与和都是子空间，和是包含二者的最小子空间。",
    `${texInline(String.raw`\dim V_1+\dim V_2=\dim(V_1+V_2)+\dim(V_1\cap V_2)`)}。`,
    "维数之和超过空间维数时，交一定非零。",
  ],
});


;/* content/ch6-section7.js */
defineChapter6Section("direct-sum", {
  number: "§7",
  textbookSection: "子空间的直和",
  title: "子空间的直和",
  navTitle: "直和",
  question: "什么条件保证每个向量的分解既存在又唯一？",
  goal: "掌握直和的定义与等价条件；会判断多个子空间的和是否为直和；理解直和分解沿子空间的方向进行，与是否垂直无关。",
  tags: ["直和", "补子空间", "分解唯一"],
  intro:
    `${texInline(String.raw`V=U\oplus W`)} 表示每个向量都能唯一地写成 ${texInline(String.raw`u+w`)}。唯一性只需检查零向量，存在性要求 ${texInline(String.raw`U+W`)} 铺满 ${texInline(String.raw`V`)}。在 ${texInline(String.raw`\mathbb R^3`)} 中，一条斜线和一个平面就给出这样的分解，分解的方向沿着那条直线。`,
  concepts: [
    { label: "直和", text: `和中每个向量的分解式唯一，记作 ${texInline("V_1\\oplus V_2")}。` },
    { label: "补子空间", text: `满足 ${texInline("V=U\\oplus W")} 的子空间 ${texInline("W")}。` },
  ],
  textbook: { reference: "北大版《高等代数》第六章 §7", items: ["直和的定义", "直和的等价条件", "补子空间", "多个子空间的直和"] },
  interactive: { type: "slot", title: "分解什么时候唯一" },
  lesson: {
    figure: "even-odd",
    figureLast: true,
    blocks: [
      {
        title: "直和与它的等价条件",
        tex: String.raw`V_1+V_2\ \text{是直和}\iff V_1\cap V_2=\{0\}\iff\dim(V_1+V_2)=\dim V_1+\dim V_2`,
        text: `和 ${texInline("V_1+V_2")} 中每个向量的分解式 ${texInline("\\alpha=\\alpha_1+\\alpha_2")} 都唯一时，称为直和，记作 ${texInline("V_1\\oplus V_2")}。只要零向量的分解唯一（${texInline("0=0+0")}），所有向量的分解就都唯一。`,
      },
      {
        title: "补子空间",
        text: `有限维空间 ${texInline("V")} 的每个子空间 ${texInline("U")} 都有补子空间 ${texInline("W")}，使 ${texInline("V=U\\oplus W")}：把 ${texInline("U")} 的基扩充为 ${texInline("V")} 的基，新添的向量生成 ${texInline("W")}。补子空间不唯一，${texInline("\\mathbb R^3")} 中水平面的补可以是任何一条不在平面里的过原点直线。`,
      },
      {
        title: "多个子空间的直和",
        tex: String.raw`W_i\cap\sum_{j\ne i}W_j=\{0\}\ (i=1,\dots,s)\iff\dim\sum_i W_i=\sum_i\dim W_i`,
        text: `两两交为零不够：同一平面内三条过原点的直线两两只交于原点，但 ${texInline("1+1+1")} 大于平面的维数 2，它们的和不是直和。`,
      },
    ],
    pitfalls: [
      "以为直和的两部分必须互相垂直。直和只涉及加法和维数。",
      `${texInline("U\\cap W=\\{0\\}")} 只保证分解唯一，不保证每个向量都能分解：${texInline("\\mathbb R^3")} 中两条直线交为零，和只是一个平面。`,
      "把两个子空间的判别法“交为零”直接搬到多个子空间。",
    ],
  },
  example: {
    title: "例题：对称部分与反对称部分",
    question: `证明 ${texInline("\\mathbb R^{n\\times n}")} 是对称矩阵子空间与反对称矩阵子空间的直和，并分解 ${texInline("A=\\begin{pmatrix}1&2\\\\0&3\\end{pmatrix}")}。`,
    choices: [
      { text: `${texInline("A=\\begin{pmatrix}1&0\\\\0&3\\end{pmatrix}+\\begin{pmatrix}0&2\\\\0&0\\end{pmatrix}")}` },
      { text: `${texInline("A=\\begin{pmatrix}1&2\\\\2&3\\end{pmatrix}+\\begin{pmatrix}0&0\\\\-2&0\\end{pmatrix}")}` },
      { correct: true, text: `${texInline("A=\\begin{pmatrix}1&1\\\\1&3\\end{pmatrix}+\\begin{pmatrix}0&1\\\\-1&0\\end{pmatrix}")}` },
      { text: "分解不唯一，对角线上的数可以任意分给两部分" },
    ],
    steps: [
      `存在：${texInline("A=\\frac{A+A^T}2+\\frac{A-A^T}2")}，前者对称，后者反对称。`,
      `唯一：若 ${texInline("B")} 既对称又反对称，则 ${texInline("B=B^T=-B")}，${texInline("B=O")}，两个子空间的交为零。`,
      `维数核对：${texInline("\\frac{n(n+1)}2+\\frac{n(n-1)}2=n^2")}。`,
      `代入：${texInline("\\frac{A+A^T}2=\\begin{pmatrix}1&1\\\\1&3\\end{pmatrix}")}，${texInline("\\frac{A-A^T}2=\\begin{pmatrix}0&1\\\\-1&0\\end{pmatrix}")}。另外两种拆法的第二项 ${texInline("\\begin{pmatrix}0&2\\\\0&0\\end{pmatrix}")}、${texInline("\\begin{pmatrix}0&0\\\\-2&0\\end{pmatrix}")} 都不是反对称矩阵。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("\\mathbb R^2")} 中 ${texInline("x")} 轴的补子空间唯一吗？`,
      answer: `不唯一，任何一条过原点、不同于 ${texInline("x")} 轴的直线都是。`,
    },
    {
      question: "三个子空间两两交为零，能推出它们的和是直和吗？",
      answer: `不能。实验的第二种模式里，同一平面内的三条直线满足 ${texInline("w_1+w_2-w_3=0")}，零向量有非零的分解。`,
    },
    {
      question: `${texInline("U\\cap W=\\{0\\}")} 能推出 ${texInline("U+W=V")} 吗？`,
      answer: `不能，只能推出 ${texInline("U+W")} 是直和。${texInline("\\mathbb R^3")} 中两条不同直线的和只是一个平面。`,
    },
    {
      question: `${texInline("V=U\\oplus W")}，${texInline("\\dim V=5")}，${texInline("\\dim U=2")}。${texInline("W")} 的维数是多少？`,
      answer: "3：直和的维数等于各部分维数之和。",
    },
  ],
  summary: [
    `直和 ${texInline("\\Leftrightarrow")} 零向量分解唯一 ${texInline("\\Leftrightarrow")} 交为零 ${texInline("\\Leftrightarrow")} 维数相加。`,
    "直和分解沿子空间的方向进行，与垂直无关；补子空间不唯一。",
    "多个子空间要检查每一个与其余之和的交。",
  ],
});


;/* content/ch6-section8.js */
defineChapter6Section("isomorphism", {
  number: "§8",
  textbookSection: "线性空间的同构",
  title: "线性空间的同构",
  navTitle: "同构",
  question: "外表不同的两个线性空间，什么时候具有完全相同的线性结构？",
  goal: "掌握同构映射的定义与基本性质；理解有限维线性空间同构当且仅当维数相同；会验证一个具体映射是否为同构。",
  tags: ["同构", "坐标映射", "维数"],
  intro:
    `同构是保持加法与数乘的双射，它把一个空间里的运算原样搬到另一个空间：${texInline(String.raw`p+q`)} 的像正好是 ${texInline(String.raw`p`)} 的像与 ${texInline(String.raw`q`)} 的像之和。取系数和取函数值，是 ${texInline(String.raw`P[x]_3`)} 到 ${texInline(String.raw`\mathbb R^3`)} 的两个不同同构。`,
  concepts: [
    { label: "同构映射", text: "保持加法与数乘的双射。" },
    { label: "维数定理", text: `数域 ${texInline("P")} 上有限维空间同构 ${texInline("\\Leftrightarrow")} 维数相同。` },
  ],
  textbook: { reference: "北大版《高等代数》第六章 §8", items: ["同构映射的定义", "坐标映射是同构", "同构的基本性质", "同构当且仅当维数相同"] },
  interactive: { type: "slot", title: "两张“坐标”，同一套运算" },
  lesson: {
    blocks: [
      {
        title: "同构映射",
        tex: String.raw`\sigma(\alpha+\beta)=\sigma(\alpha)+\sigma(\beta),\qquad \sigma(k\alpha)=k\sigma(\alpha)`,
        text: `数域 ${texInline("P")} 上线性空间 ${texInline("V")} 到 ${texInline("V'")} 的双射 ${texInline("\\sigma")} 满足上式时，称为同构映射，记 ${texInline("V\\cong V'")}。取定 ${texInline("V")} 的一组基，把向量对应到它的坐标，就是 ${texInline("V")} 到 ${texInline("P^n")} 的同构。`,
      },
      {
        title: "同构保持什么",
        text: `${texInline("\\sigma(0)=0")}，${texInline("\\sigma(-\\alpha)=-\\sigma(\\alpha)")}，${texInline("\\sigma")} 保持线性组合，因而把线性相关组映成线性相关组、线性无关组映成线性无关组，把子空间映成同维数的子空间。同构的逆映射与两个同构的乘积仍是同构。`,
      },
      {
        title: "维数决定同构",
        tex: String.raw`V\cong V'\iff \dim V=\dim V'`,
        text: `对数域 ${texInline("P")} 上的有限维空间成立。所以 ${texInline("P[x]_4")}、${texInline("P^{2\\times2}")} 与 ${texInline("P^4")} 两两同构。`,
      },
    ],
    pitfalls: [
      "同构不意味着元素相同：多项式和数组是不同的对象，只是运算结构一致。",
      `同构一般不唯一：取系数和取函数值都给出 ${texInline("P[x]_3\\cong\\mathbb R^3")}。`,
      `比较维数要在同一个数域上：${texInline("\\mathbb C")} 看成 ${texInline("\\mathbb R")} 上的空间时维数是 2，与 ${texInline("\\mathbb R^2")} 同构。`,
    ],
  },
  example: {
    title: "例题：取值映射是同构吗",
    question: `${texInline("T:P[x]_3\\to\\mathbb R^3")}，${texInline("T(p)=(p(0),p(1),p(2))")}。${texInline("T")} 是同构吗？若是，求 ${texInline("T^{-1}(1,3,7)")}。`,
    choices: [
      { text: `不是同构，因为 ${texInline("T(p)")} 不是 ${texInline("p")} 的系数。` },
      { correct: true, text: `是同构，${texInline("T^{-1}(1,3,7)=1+x+x^2")}。` },
      { text: `是同构，${texInline("T^{-1}(1,3,7)=1+3x+7x^2")}。` },
      { text: `是同构，${texInline("T^{-1}(1,3,7)=1+2x")}。` },
    ],
    steps: [
      `线性：${texInline("(p+q)(k)=p(k)+q(k)")}，${texInline("(cp)(k)=cp(k)")}。`,
      `单射：${texInline("T(p)=0")} 说明次数小于 3 的 ${texInline("p")} 有 0、1、2 三个根，只能 ${texInline("p=0")}。`,
      `满射：任给 ${texInline("(y_0,y_1,y_2)")}，插值多项式 ${texInline("y_0+(y_1-y_0)x+\\tfrac{y_2-2y_1+y_0}{2}x(x-1)")} 在 0、1、2 处恰好取这三个值。所以 ${texInline("T")} 是同构。`,
      `设 ${texInline("p=a+bx+cx^2")}：${texInline("a=1,\\ a+b+c=3,\\ a+2b+4c=7")}，解得 ${texInline("b=c=1")}。验证 ${texInline("p(2)=1+2+4=7")}；${texInline("1+2x")} 在 2 处的值是 5。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("\\mathbb R^{2\\times2}")} 与 ${texInline("P[x]_4")} 同构吗？`,
      answer: `同构，二者都是 ${texInline("\\mathbb R")} 上的 4 维空间。例如把 ${texInline("\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}")} 对应到 ${texInline("a+bx+cx^2+dx^3")}。`,
    },
    {
      question: `§2 例题中的 ${texInline("(\\mathbb R^+,\\oplus,\\circ)")} 与 ${texInline("\\mathbb R")} 之间有什么同构？`,
      answer: `${texInline("\\ln")}：${texInline("\\ln(ab)=\\ln a+\\ln b")}，${texInline("\\ln(a^k)=k\\ln a")}，并且 ${texInline("\\ln")} 是 ${texInline("\\mathbb R^+")} 到 ${texInline("\\mathbb R")} 的双射。`,
    },
    {
      question: `求导 ${texInline("D:P[x]_4\\to P[x]_4")} 为什么不是同构？`,
      answer: `${texInline("D(1)=D(2)=0")}，${texInline("D")} 不是单射；它的像只是 ${texInline("P[x]_3")}，也不是满射。`,
    },
    {
      question: `${texInline("\\sigma")} 是同构，${texInline("\\sigma(\\alpha_1),\\sigma(\\alpha_2),\\sigma(\\alpha_3)")} 线性相关。${texInline("\\alpha_1,\\alpha_2,\\alpha_3")} 呢？`,
      answer: `也线性相关：${texInline("\\sigma^{-1}")} 也是同构，把相关组映成相关组。`,
    },
  ],
  summary: [
    "同构 = 保持加法与数乘的双射。",
    `有限维空间同构当且仅当维数相同；坐标映射给出 ${texInline(String.raw`V\cong P^n`)}。`,
    "同构不唯一，它保持一切由加法和数乘描述的性质。",
  ],
});


;/* content/ch6.js */
registerAlgebraChapter({
  id: "ch6",
  icon: "6",
  title: "第六章 线性空间",
  subtitle: "基 · 坐标 · 子空间 · 同构",
  summary:
    "本章把多项式、矩阵和函数都当作向量：先用基和坐标把抽象空间翻译成数组，再看换基时坐标怎样变；随后研究子空间、交与和、直和，最后用同构说明维数相同的空间结构相同。",
  sections: [
    { id: "sets-maps", number: "§1", title: "集合·映射", navTitle: "集合·映射" },
    { id: "vector-space-definition", number: "§2", title: "线性空间的定义与简单性质", navTitle: "线性空间定义" },
    { id: "basis-coordinates", number: "§3", title: "维数·基与坐标", navTitle: "维数·基与坐标" },
    { id: "change-of-basis", number: "§4", title: "基变换与坐标变换", navTitle: "基变换与坐标变换" },
    { id: "subspaces", number: "§5", title: "线性子空间", navTitle: "线性子空间" },
    { id: "intersection-sum", number: "§6", title: "子空间的交与和", navTitle: "交与和" },
    { id: "direct-sum", number: "§7", title: "子空间的直和", navTitle: "直和" },
    { id: "isomorphism", number: "§8", title: "线性空间的同构", navTitle: "同构" },
  ],
});


;/* content/ch6-assemble.js */
/* Apply Chapter 6 section patches after ch6.js registration. */
(() => {
  const chapter = algebraContent.chapters.find((item) => item.id === "ch6");
  const patches = window.getChapter6SectionPatches?.();
  if (!chapter || !patches) return;

  const order = [
    "sets-maps",
    "vector-space-definition",
    "basis-coordinates",
    "change-of-basis",
    "subspaces",
    "intersection-sum",
    "direct-sum",
    "isomorphism",
  ];

  const byId = new Map();
  for (const [id, patch] of patches.entries()) byId.set(id, patch);

  chapter.sections = order.map((id) => {
    const patch = byId.get(id);
    if (!patch) {
      console.warn("Missing Chapter 6 section patch:", id);
      return { id, number: "§?", title: id, navTitle: id };
    }
    return { id, ...patch };
  });
})();


;/* visuals/ch4/registry.js */
/*
 * Chapter 4 presentation registry.
 *
 * Renderers receive the already-created lesson DOM and mount into the formal
 * and interactive slots. The lesson shell owns the lifecycle, so renderers do
 * not watch the whole page or inject their own placeholder sections.
 */
(() => {
  const renderers = new Map();
  const enhancers = [];

  window.defineChapter4Renderer = function defineChapter4Renderer(sectionId, renderer) {
    if (!sectionId || !renderer || typeof renderer !== "object") {
      throw new TypeError("Chapter 4 renderers require a section id and an object.");
    }
    renderers.set(sectionId, renderer);
  };

  window.defineChapter4LessonEnhancer = function defineChapter4LessonEnhancer(enhancer) {
    if (typeof enhancer === "function") enhancers.push(enhancer);
  };

  window.mountChapter4Lesson = function mountChapter4Lesson(section, root) {
    if (!section?.id || !root) return;

    const renderer = renderers.get(section.id);
    if (renderer) {
      const formal = root.querySelector(`#${CSS.escape(section.id)}-formal`);
      const interactive = root.querySelector(`#${CSS.escape(section.id)}-interactive`);
      renderer.formal?.(formal, section, root);
      renderer.interactive?.(interactive, section, root);
    }

    enhancers.forEach((enhancer) => enhancer(section, root));
  };
})();


;/* visuals/ch2/registry.js */
/* Chapter 2 presentation registry with lifecycle cleanup. */
(() => {
  const renderers = new Map();
  const enhancers = [];
  let activeCleanup = null;

  window.defineChapter2Renderer = function defineChapter2Renderer(sectionId, renderer) {
    if (!sectionId || !renderer || typeof renderer !== "object") {
      throw new TypeError("Chapter 2 renderers require a section id and an object.");
    }
    renderers.set(sectionId, renderer);
  };

  window.defineChapter2LessonEnhancer = function defineChapter2LessonEnhancer(enhancer) {
    if (typeof enhancer === "function") enhancers.push(enhancer);
  };

  window.teardownChapter2Lesson = function teardownChapter2Lesson() {
    try {
      activeCleanup?.();
    } finally {
      activeCleanup = null;
    }
  };

  window.mountChapter2Lesson = function mountChapter2Lesson(section, root) {
    window.teardownChapter2Lesson();
    if (!section?.id || !root) return;
    const renderer = renderers.get(section.id);
    if (!renderer) return;

    const cleanups = [];
    const formal = root.querySelector(`#${CSS.escape(section.id)}-formal`);
    const interactive = root.querySelector(`#${CSS.escape(section.id)}-interactive`);
    const formalCleanup = renderer.formal?.(formal, section, root);
    const interactiveCleanup = renderer.interactive?.(interactive, section, root);
    if (typeof formalCleanup === "function") cleanups.push(formalCleanup);
    if (typeof interactiveCleanup === "function") cleanups.push(interactiveCleanup);
    enhancers.forEach((enhancer) => {
      const cleanup = enhancer(section, root);
      if (typeof cleanup === "function") cleanups.push(cleanup);
    });
    activeCleanup = () => cleanups.reverse().forEach((cleanup) => cleanup());
  };
})();


;/* visuals/ch3/registry.js */
/* Chapter 3 presentation registry with deterministic teardown. */
(() => {
  const renderers = new Map();
  const enhancers = [];
  let activeCleanup = null;

  function runCleanup() {
    if (typeof activeCleanup === "function") {
      try {
        activeCleanup();
      } catch (error) {
        console.warn("Chapter 3 teardown failed", error);
      }
    }
    activeCleanup = null;
  }

  window.defineChapter3Renderer = function defineChapter3Renderer(sectionId, renderer) {
    if (!sectionId || !renderer || typeof renderer !== "object") {
      throw new TypeError("Chapter 3 renderers require a section id and an object.");
    }
    renderers.set(sectionId, renderer);
  };

  window.defineChapter3LessonEnhancer = function defineChapter3LessonEnhancer(enhancer) {
    if (typeof enhancer === "function") enhancers.push(enhancer);
  };

  window.teardownChapter3Lesson = runCleanup;

  window.mountChapter3Lesson = function mountChapter3Lesson(section, root) {
    runCleanup();
    if (!section?.id || !root) return;
    const cleanups = [];
    const renderer = renderers.get(section.id);
    if (renderer) {
      const formal = root.querySelector(`#${CSS.escape(section.id)}-formal`);
      const interactive = root.querySelector(`#${CSS.escape(section.id)}-interactive`);
      const formalCleanup = renderer.formal?.(formal, section, root);
      const interactiveCleanup = renderer.interactive?.(interactive, section, root);
      if (typeof formalCleanup === "function") cleanups.push(formalCleanup);
      if (typeof interactiveCleanup === "function") cleanups.push(interactiveCleanup);
    }
    enhancers.forEach((enhancer) => {
      const cleanup = enhancer(section, root);
      if (typeof cleanup === "function") cleanups.push(cleanup);
    });
    activeCleanup = () => cleanups.splice(0).reverse().forEach((cleanup) => cleanup());
  };

  window.addEventListener("hashchange", runCleanup);
  window.addEventListener("pagehide", runCleanup);
})();


;/* visuals/ch1/registry.js */
/*
 * Chapter 1 presentation registry and lifecycle.
 * Every route transition tears down the previous Chapter 1 lab before mounting
 * a new renderer, so resize observers, timers, and listeners do not accumulate.
 */
(() => {
  const renderers = new Map();
  let cleanups = [];

  function runCleanup() {
    const pending = cleanups;
    cleanups = [];
    pending.reverse().forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        console.warn("Chapter 1 cleanup failed:", error);
      }
    });
  }

  window.ch1UseCleanup = function ch1UseCleanup(cleanup) {
    if (typeof cleanup === "function") cleanups.push(cleanup);
    return cleanup;
  };

  window.ch1Listen = function ch1Listen(target, type, handler, options) {
    if (!target?.addEventListener || typeof handler !== "function") return () => {};
    target.addEventListener(type, handler, options);
    return window.ch1UseCleanup(() => target.removeEventListener(type, handler, options));
  };

  window.ch1ObserveResize = function ch1ObserveResize(target, callback) {
    if (!target || typeof callback !== "function") return () => {};
    if (window.ResizeObserver) {
      const observer = new ResizeObserver(() => callback());
      observer.observe(target);
      return window.ch1UseCleanup(() => observer.disconnect());
    }
    return window.ch1Listen(window, "resize", callback, { passive: true });
  };

  window.defineChapter1Renderer = function defineChapter1Renderer(sectionId, renderer) {
    if (!sectionId || !renderer || typeof renderer !== "object") {
      throw new TypeError("Chapter 1 renderers require a section id and an object.");
    }
    const current = renderers.get(sectionId) || {};
    renderers.set(sectionId, { ...current, ...renderer });
  };

  window.renderChapter1Formal = function renderChapter1Formal(el, section, config = {}) {
    if (!el || !section) return;
    const display = (source) => (window.texDisplay ? window.texDisplay(source) : source);
    const details = Array.isArray(config.details) ? config.details : [];
    const cards = Array.isArray(config.cards) ? config.cards : [];
    const misconceptions = Array.isArray(section.misconceptions) ? section.misconceptions : [];
    const formula = config.formula || "";
    const title = config.title || section.title;

    el.innerHTML = `
      <h2>${title}</h2>
      <div class="lesson-formal-layout">
        <p class="lesson-formal-intro">${config.intro || section.intro || ""}</p>
        ${formula ? `<div class="ch1-formal-equation">${display(formula)}</div>` : ""}
        <div class="definition-stack">
          ${details
            .map(
              (item) =>
                `<article class="definition-row"><strong>${item.title}</strong><p>${item.html}</p></article>`,
            )
            .join("")}
        </div>
        ${
          cards.length
            ? `<div class="lesson-card-grid">
                ${cards
                  .map(
                    (item) => `<article class="lesson-card">
                      <span class="lesson-card-kicker">${item.kicker || "观察"}</span>
                      <h3>${item.title}</h3>
                      <p>${item.html}</p>
                    </article>`,
                  )
                  .join("")}
              </div>`
            : ""
        }
        ${
          misconceptions.length
            ? `<div class="ch1-misconceptions">
                <strong>常见误区</strong>
                <ul>${misconceptions.map((item) => `<li>${item}</li>`).join("")}</ul>
              </div>`
            : ""
        }
        <div class="lesson-reading-note">
          <strong>这一节的主线</strong>
          <p>${(section.summary || []).join(" ")}</p>
        </div>
      </div>`;
  };

  window.mountChapter1Lesson = function mountChapter1Lesson(section, root) {
    runCleanup();
    if (!section?.id || !root) return;
    const renderer = renderers.get(section.id);
    if (!renderer) return;
    const formal = root.querySelector(`#${CSS.escape(section.id)}-formal`);
    const interactive = root.querySelector(`#${CSS.escape(section.id)}-interactive`);
    if (formal) renderer.formal?.(formal, section, root);
    // `interactive: false` removes the band entirely; only mount a lab where one exists.
    if (interactive && section.interactive) renderer.interactive?.(interactive, section, root);
  };

  window.teardownChapter1Lesson = runCleanup;
})();


;/* visuals/ch7/registry.js */
/* Chapter 7 renderer registry and lifecycle. */
(() => {
  const renderers = new Map();
  const enhancers = [];
  let activeCleanups = [];

  function runCleanup() {
    activeCleanups.splice(0).forEach((cleanup) => {
      try {
        cleanup?.();
      } catch (error) {
        console.warn("Chapter 7 cleanup failed", error);
      }
    });
  }

  window.defineChapter7Renderer = function defineChapter7Renderer(sectionId, renderer) {
    if (!sectionId || !renderer || typeof renderer !== "object") {
      throw new TypeError("Chapter 7 renderers require a section id and an object.");
    }
    renderers.set(sectionId, renderer);
  };

  window.defineChapter7LessonEnhancer = function defineChapter7LessonEnhancer(enhancer) {
    if (typeof enhancer === "function") enhancers.push(enhancer);
  };

  window.teardownChapter7Lesson = runCleanup;

  window.mountChapter7Lesson = function mountChapter7Lesson(section, root) {
    if (!section?.id || !root) return;
    runCleanup();

    const renderer = renderers.get(section.id);
    if (renderer) {
      const formal = root.querySelector(`#${CSS.escape(section.id)}-formal`);
      const interactive = root.querySelector(`#${CSS.escape(section.id)}-interactive`);
      const formalCleanup = renderer.formal?.(formal, section, root);
      const interactiveCleanup = renderer.interactive?.(interactive, section, root);
      if (typeof formalCleanup === "function") activeCleanups.push(formalCleanup);
      if (typeof interactiveCleanup === "function") activeCleanups.push(interactiveCleanup);
    }

    enhancers.forEach((enhancer) => {
      const cleanup = enhancer(section, root);
      if (typeof cleanup === "function") activeCleanups.push(cleanup);
    });
  };
})();


;/* visuals/lesson-presentation.js */
(() => {
  const inline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : `<code>${source}</code>`);

  function renderSectionOneFormal(formal) {
    if (!formal) return;
    formal.innerHTML = `
      <h2>先把矩阵的记号摆清楚</h2>
      <div class="lesson-formal-layout">
        <p class="lesson-formal-intro">这一节先把矩阵当作一个有位置的数表来读：先认清它有几行、几列，每个数字处在哪个位置；再回头看它为什么能够记录方程组和方向变化。</p>
        <div class="matrix-anatomy">
          <div class="matrix-anatomy-main">${display("A=(a_{ij})_{m\\times n}")}</div>
          <dl class="lesson-meta-list">
            <div><dt>矩阵的阶</dt><dd>${inline("m\\times n")}：m 行，n 列。</dd></div>
            <div><dt>元素的位置</dt><dd>${inline("a_{ij}")}：第 i 行第 j 列。先读行，再读列。</dd></div>
            <div><dt>矩阵相等</dt><dd>先有相同的行数和列数，再要求所有对应位置的元素相等。</dd></div>
          </dl>
        </div>
        <div class="lesson-card-grid">
          <article class="lesson-card"><span class="lesson-card-kicker">背景一</span><h3>方程组把系数排成矩阵</h3><p>多个方程会反复出现同一批未知数和系数。把系数按行排开，计算与比较才有统一的对象可操作。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">背景二</span><h3>矩阵的行列位置带有信息</h3><p>数字放在不同位置，通常就改变了矩阵，也改变了它能表达的关系。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">背景三</span><h3>相等先比结构，再比数字</h3><p>两个矩阵先要尺寸相同，再比较对应位置的数字是否相等。</p></article>
        </div>
        <div class="lesson-reading-note"><strong>后面的观察法</strong><p>当我们把二维矩阵看成平面变换的记录时，第一列告诉右向的基本方向去了哪里，第二列告诉上向的基本方向去了哪里。下面的交互只用来体验这句话，不取代本节的基本定义。</p></div>
      </div>`;
  }

  function renderSectionTwoFormal(formal) {
    if (!formal) return;
    formal.innerHTML = `
      <h2>先分清三类运算</h2>
      <div class="lesson-formal-layout">
        <p class="lesson-formal-intro">矩阵运算最容易混的地方，是把“逐项组合”和“过程复合”混在一起。加法、数乘和转置先解决读写规则；矩阵乘法进入过程复合，它要求尺寸匹配，并把两个连续步骤压缩成一个新矩阵。</p>
        <div class="operation-map">
          <div class="operation-map-main">${display("A_{m\\times n}B_{n\\times p}=C_{m\\times p}")}</div>
          <dl class="lesson-meta-list">
            <div><dt>加法与数乘</dt><dd>同型矩阵才能逐项相加；数乘把每个元素同时缩放。</dd></div>
            <div><dt>转置</dt><dd>${inline("(A^T)_{ij}=a_{ji}")}：行和列互换。</dd></div>
            <div><dt>矩阵乘法</dt><dd>A 的列数要等于 B 的行数；外侧尺寸决定 AB 的阶。</dd></div>
            <div><dt>单位矩阵</dt><dd>${inline("IA=A")}，${inline("AI=A")}；它表示不改变输入的操作。</dd></div>
          </dl>
        </div>
        <div class="definition-stack">
          <article class="definition-row"><strong>加法与数乘</strong><p>${inline("(A+B)_{ij}=a_{ij}+b_{ij}")}。它们要求 A 与 B 同型，因为每一个位置都必须找到对应位置。</p></article>
          <article class="definition-row"><strong>转置</strong><p>${inline("A^T")} 把 A 的行和列互换，从而改变我们读取同一个数字表的位置方向。</p></article>
          <article class="definition-row"><strong>矩阵乘法</strong><p>若 ${inline("A=(a_{ik})_{m\\times n}")}，${inline("B=(b_{kj})_{n\\times p}")}，那么 ${inline("(AB)_{ij}=\\sum_{k=1}^n a_{ik}b_{kj}")}。先检查中间尺寸 n 是否匹配，再做“第 i 行配第 j 列”。</p></article>
          <article class="definition-row"><strong>基本性质</strong><p>矩阵乘法满足结合律 ${inline("(AB)C=A(BC)")}；交换顺序通常会改变结果，所以计算前必须保留顺序。</p></article>
        </div>
        <div class="lesson-reading-note"><strong>这一节的核心</strong><p>请把 ${inline("AB")} 同时记成三句话：先 B 后 A；AB 的第 j 列是 A 作用到 B 的第 j 列；${inline("(AB)_{ij}")} 是 A 的第 i 行与 B 的第 j 列的配对。这三句话是在描述同一件事。</p></div>
      </div>`;
  }

  function multiplyView(view) {
    if (view === "columns") return `<h4>看列：乘积的列从哪里来</h4><p>不要把 AB 当成一张全新的表。先看 B 的每一列：它们分别是 ${inline("Be_1")}、${inline("Be_2")}。再让 A 作用一次，就得到 AB 的对应列。</p><div class="multiply-lab-math">${display("ABe_j=A(Be_j)")}</div><div class="multiply-lab-math">${display("B=\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix},\\quad A=\\begin{bmatrix}2&0\\\\0&1\\end{bmatrix},\\quad AB=\\begin{bmatrix}2&2\\\\0&1\\end{bmatrix}")}</div><ul class="multiply-lab-check"><li>第 1 列：${inline("Be_1=(1,0)^T")}，再经 A 作用得到 ${inline("(2,0)^T")}。</li><li>第 2 列：${inline("Be_2=(1,1)^T")}，再经 A 作用得到 ${inline("(2,1)^T")}。</li></ul>`;
    if (view === "formula") return `<h4>行列公式：一个位置怎样算出来</h4><p>乘积矩阵的一个位置只看两部分：A 的一行和 B 的一列。它们逐项相乘再相加，给出一个输出坐标。</p><div class="multiply-lab-math">${display("(AB)_{12}=\\begin{bmatrix}2&0\\end{bmatrix}\\begin{bmatrix}1\\\\1\\end{bmatrix}=2\\cdot1+0\\cdot1=2")}</div><div class="multiply-lab-math">${display("AB=\\begin{bmatrix}2&0\\\\0&1\\end{bmatrix}\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}=\\begin{bmatrix}2&2\\\\0&1\\end{bmatrix}")}</div><ul class="multiply-lab-check"><li>“行乘列”给出输出的第 i 个坐标。</li><li>尺寸不匹配时，根本找不到可以配对的整行和整列。</li></ul>`;
    return `<h4>复合：右边先作用</h4><p>把 ${inline("A")} 和 ${inline("B")} 当成两个连续步骤。${inline("ABx")} 的计算顺序是先算 ${inline("Bx")}，再算 ${inline("A(Bx)")}。</p><div class="multiply-chain-row"><span class="multiply-chain-pill">${inline("x=(1,1)^T")}</span><span class="multiply-arrow">→ B →</span><span class="multiply-chain-pill">${inline("Bx=(2,1)^T")}</span><span class="multiply-arrow">→ A →</span><span class="multiply-chain-pill">${inline("A(Bx)=(4,1)^T")}</span></div><div class="multiply-lab-math">${display("A(Bx)=(AB)x")}</div><ul class="multiply-lab-check"><li>从右向左读是函数复合的习惯：离 x 最近的 B 先做。</li><li>把两步压成一步，才得到矩阵 AB。</li></ul>`;
  }

  function renderSectionTwoInteractive(section) {
    if (!section) return;
    section.innerHTML = `<h2>交互实验</h2><div class="multiply-lab"><div class="multiply-lab-head"><h3>同一个 AB，三种读法</h3><p>用同一组矩阵，在“复合”“看列”“行列公式”之间切换。三种语言要互相对上，最后都指向同一个乘积矩阵。</p></div><div class="segmented" data-golden-tabs><button type="button" class="is-active" data-golden-view="compose">复合</button><button type="button" data-golden-view="columns">看列</button><button type="button" data-golden-view="formula">行列公式</button></div><div class="multiply-lab-view" data-golden-view-panel>${multiplyView("compose")}</div></div>`;
    section.querySelectorAll("[data-golden-view]").forEach((button) => button.addEventListener("click", () => {
      const view = button.dataset.goldenView;
      section.querySelectorAll("[data-golden-view]").forEach((item) => item.classList.toggle("is-active", item === button));
      const panel = section.querySelector("[data-golden-view-panel]");
      if (panel) panel.innerHTML = multiplyView(view);
    }));
  }

  function enhanceExamples(_lesson, root) {
    root.querySelectorAll(".lesson-page-section[id$='-example']").forEach((section) => {
      const details = section.querySelector("details.example-box");
      const summary = details?.querySelector("summary");
      const question = details?.querySelector(".example-question");
      if (!details || !summary || !question) return;
      const title = document.createElement("h3");
      title.className = "example-title";
      title.textContent = summary.textContent.trim();
      const label = document.createElement("span");
      label.className = "example-label";
      label.textContent = "题目";
      question.prepend(label);
      details.before(title);
      title.after(question);
      summary.textContent = "展开答案与分析";
    });
  }

  defineChapter4Renderer("matrix-language", { formal: renderSectionOneFormal });
  defineChapter4Renderer("matrix-operations", { formal: renderSectionTwoFormal, interactive: renderSectionTwoInteractive });
  defineChapter4LessonEnhancer(enhanceExamples);
})();

