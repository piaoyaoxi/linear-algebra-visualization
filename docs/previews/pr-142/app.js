/*
 * Learning page shell: content registry, routing, navigation, the lesson page
 * and the hooks chapter labs use to mount into it.
 */

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

window.texInline = texInline;
window.texDisplay = texDisplay;

/* ---------- Content registry ---------- */

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
  algebraContent.chapters.sort((a, b) => chapterNumber(a) - chapterNumber(b));
}

function chapterNumber(chapter) {
  const match = /^ch(\d+)$/.exec(chapter.id || "");
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

window.registerAlgebraChapter = registerAlgebraChapter;

const GUIDE_CHAPTER = {
  id: "guide",
  icon: "0",
  title: "导学",
  subtitle: "如何使用",
  sections: [],
};

function getChapters() {
  return [GUIDE_CHAPTER, ...algebraContent.chapters];
}

function getChapterById(id) {
  return getChapters().find((chapter) => chapter.id === id) || GUIDE_CHAPTER;
}

function getStructuredSections(chapter) {
  return (chapter?.sections || []).filter((section) => section && typeof section === "object" && section.id);
}

function findSection(chapter, sectionId) {
  if (!sectionId) return null;
  return getStructuredSections(chapter).find((section) => section.id === sectionId) || null;
}

function findStructuredSection(sectionId) {
  if (!sectionId) return null;
  for (const chapter of algebraContent.chapters) {
    const section = findSection(chapter, sectionId);
    if (section) return { chapter, section };
  }
  return null;
}

window.getStructuredSections = getStructuredSections;
window.findStructuredSection = findStructuredSection;

function chapterShortTitle(chapter) {
  const trimmed = String(chapter?.title || "")
    .replace(/^第[0-9一二三四五六七八九十百]+章/, "")
    .replace(/^[\s·:：\-—]+/, "")
    .trim();
  return trimmed || chapter?.title || "";
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

function getVideo(section) {
  const video = section.video;
  if (!video) return null;
  return video.src || video.embed ? video : null;
}

// A section shows the lab band when it declares `interactive`.
function getInteractive(section) {
  return section.interactive || null;
}

function getSelfTestItems(section) {
  if (section.quiz?.length) return section.quiz;
  return (section.exercises || []).map((question) => ({ question }));
}

/* ---------- Lesson labs ---------- */

// A section's labs mount into its rendered lesson: `formal(el, section, root)` fills the
// theorem band, `interactive(el, section, root)` the lab band. Each may return a cleanup
// function (or an array of them), run before the next route renders. A slot is defined
// once: a second definition throws, so later files cannot silently replace earlier ones.
const chapterLabs = new Map();
const lessonEnhancers = [];
let lessonCleanups = [];

function labsOf(chapterId) {
  if (!chapterLabs.has(chapterId)) chapterLabs.set(chapterId, { renderers: new Map(), enhancers: [], teardowns: [] });
  return chapterLabs.get(chapterId);
}

function defineLessonRenderer(chapterId, sectionId, renderer) {
  if (!chapterId || !sectionId || !renderer || typeof renderer !== "object") {
    throw new TypeError("Lesson renderers need a chapter id, a section id and an object.");
  }
  const renderers = labsOf(chapterId).renderers;
  const current = renderers.get(sectionId) || {};
  Object.keys(renderer).forEach((slot) => {
    if (current[slot]) throw new Error(`${chapterId}/${sectionId}: "${slot}" is already defined`);
  });
  renderers.set(sectionId, { ...current, ...renderer });
}

// Runs after the section renderers on every lesson of one chapter.
function defineChapterEnhancer(chapterId, enhance) {
  if (typeof enhance === "function") labsOf(chapterId).enhancers.push(enhance);
}

// Extra cleanup for chapter-wide state that labs register outside their return value.
function defineChapterTeardown(chapterId, teardown) {
  if (typeof teardown === "function") labsOf(chapterId).teardowns.push(teardown);
}

// Runs on every lesson, after the chapter's own labs.
function afterLessonRender(enhance) {
  if (typeof enhance === "function") lessonEnhancers.push(enhance);
}

function keepCleanup(value) {
  if (typeof value === "function") lessonCleanups.push(value);
  else if (Array.isArray(value)) value.forEach(keepCleanup);
}

function runSafely(label, task) {
  try {
    return task();
  } catch (error) {
    console.error(`${label} failed:`, error);
    return null;
  }
}

function mountLessonLabs(chapterId, section, root) {
  const labs = chapterLabs.get(chapterId);
  const renderer = labs?.renderers.get(section.id);
  if (renderer) {
    ["formal", "interactive"].forEach((slot) => {
      const el = root.querySelector(`#${CSS.escape(section.id)}-${slot}`);
      if (el && renderer[slot]) keepCleanup(runSafely(`${section.id} ${slot}`, () => renderer[slot](el, section, root)));
    });
  }
  labs?.enhancers.forEach((enhance) => keepCleanup(runSafely(`${chapterId} enhancer`, () => enhance(section, root))));
  lessonEnhancers.forEach((enhance) => keepCleanup(runSafely("lesson enhancer", () => enhance(section, root))));
}

function teardownLessonLabs() {
  lessonCleanups.splice(0).reverse().forEach((cleanup) => runSafely("lesson cleanup", cleanup));
  chapterLabs.forEach((labs) => labs.teardowns.forEach((teardown) => runSafely("chapter teardown", teardown)));
}

window.defineLessonRenderer = defineLessonRenderer;
window.defineChapterEnhancer = defineChapterEnhancer;
window.defineChapterTeardown = defineChapterTeardown;
window.afterLessonRender = afterLessonRender;
window.addEventListener("pagehide", teardownLessonLabs);

/* ---------- Loading chapter labs ---------- */

// learn.html lists each chapter's lab scripts in a <template data-chapter-labs>; they
// load when a lesson of that chapter first opens, and the remaining chapters load in the
// background once the page is idle. Scripts run in insertion order (async = false), and
// a kit listed under several chapters loads once.
const scriptLoads = new Map();
const chapterLoads = new Map();
const loadedChapters = new Set();

function loadScript(src) {
  if (!scriptLoads.has(src)) {
    scriptLoads.set(
      src,
      new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = false;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.append(script);
      }),
    );
  }
  return scriptLoads.get(src);
}

function labScriptsOf(chapterId) {
  const template = document.querySelector(`template[data-chapter-labs="${chapterId}"]`);
  return template ? [...template.content.querySelectorAll("script[src]")].map((script) => script.getAttribute("src")) : [];
}

function loadChapterLabs(chapterId) {
  if (!chapterLoads.has(chapterId)) {
    chapterLoads.set(
      chapterId,
      Promise.all(labScriptsOf(chapterId).map(loadScript)).then(() => {
        loadedChapters.add(chapterId);
      }),
    );
  }
  return chapterLoads.get(chapterId);
}

function preloadRemainingLabs() {
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || "")) return;
  const idle = (callback) => (window.requestIdleCallback ? window.requestIdleCallback(callback, { timeout: 4000 }) : window.setTimeout(callback, 1500));
  const queue = algebraContent.chapters.map((chapter) => chapter.id).filter((id) => !chapterLoads.has(id));
  const next = () => {
    const id = queue.shift();
    if (id) idle(() => loadChapterLabs(id).catch(() => {}).then(next));
  };
  next();
}

/* ---------- Preferences ---------- */

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

function lastVisitedTarget() {
  const last = readPreference("la-visual-last");
  if (!last || !last.startsWith("#")) return null;

  const [route, sectionId] = last.slice(1).split("/");
  const chapter = algebraContent.chapters.find((item) => item.id === route);
  if (!chapter) return null;
  if (sectionId && !findSection(chapter, sectionId)) return null;
  return last;
}

function firstLessonTarget() {
  for (const chapter of algebraContent.chapters) {
    const first = getStructuredSections(chapter)[0];
    if (first) return `#${chapter.id}/${first.id}`;
  }
  return "#guide";
}

/* ---------- State and chrome ---------- */

const state = {
  route: "guide",
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
  if (document.readyState === "complete") preloadRemainingLabs();
  else window.addEventListener("load", preloadRemainingLabs, { once: true });

  // Canvas text is drawn with whatever font is ready at that moment, and the serif fonts
  // arrive in slices (fonts.css) the first time a page uses their characters. When a slice
  // finishes loading after a page was drawn and the student has not touched that page yet,
  // draw it again in place so canvas labels match the text. Each face's `loaded` promise is
  // used because WebKit does not fire the FontFaceSet loadingdone event.
  if (document.fonts) {
    let touched = false;
    let redraw = null;
    ["pointerdown", "keydown"].forEach((type) => window.addEventListener(type, () => { touched = true; }, { capture: true }));
    window.addEventListener("hashchange", () => { touched = false; });
    document.fonts.forEach((face) => {
      if (!face.family.includes("LA Serif") || face.status === "loaded") return;
      face.loaded.then(() => {
        // slices that arrive together are drawn once
        redraw ??= document.fonts.ready.then(() => {
          redraw = null;
          if (!touched) renderRoute({ keepScroll: true });
        });
      }, () => {});
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
  });
}

function updateThemeIcon() {
  els.themeToggle.innerHTML = document.body.classList.contains("dark") ? MOON_ICON : SUN_ICON;
}

window.updateThemeIcon = updateThemeIcon;

/* ---------- Sidebar ---------- */

function renderNav() {
  els.nav.innerHTML = getChapters()
    .map((chapter) => {
      const searchText = normalizeSearchText(`${chapter.title} ${getChapterSectionText(chapter)}`);
      // The guide is a single page: a direct link, not an expandable chapter.
      if (chapter.id === "guide") {
        return `
          <div class="chapter-group is-direct" data-chapter="guide" data-search-text="${searchText}">
      <a class="nav-chapter is-direct" href="#guide" data-search-text="${searchText}" aria-label="进入导学页">
        <span class="chapter-icon">${chapter.icon}</span>
        <span class="chapter-label"><strong>${chapter.title}</strong><small>${chapter.subtitle}</small></span>
      </a></div>`;
      }

      const sectionLinks = getStructuredSections(chapter)
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
        .join("");

      return `
          <div class="chapter-group" data-chapter="${chapter.id}" data-search-text="${searchText}">
            <button class="nav-chapter" type="button" aria-expanded="false">
              <span class="chapter-icon">${chapter.icon}</span>
              <span class="chapter-label"><strong>${chapter.title}</strong><small>${chapter.subtitle || "章节导览"}</small></span>
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
}

function bindChapterToggles() {
  els.nav.querySelectorAll("button.nav-chapter").forEach((button) => {
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

/* ---------- Routing ---------- */

let routeToken = 0;

// keepScroll: draw the same page again in place (fonts arrived) instead of opening it at the top
function renderRoute({ keepScroll = false } = {}) {
  const keepY = keepScroll ? window.scrollY : null;
  teardownLessonLabs();
  const token = ++routeToken;

  const raw = decodeURIComponent(window.location.hash.replace(/^#/, "")) || "guide";
  const [requestedRoute, requestedSection] = raw.split("/");

  if (requestedRoute === "home") {
    window.location.replace("./index.html");
    return;
  }

  const chapter = getChapterById(requestedRoute);
  const section = findSection(chapter, requestedSection);

  state.route = chapter.id;
  state.section = section?.id || "";
  state.openChapters.add(state.route);
  document.body.dataset.route = state.route;
  document.body.dataset.view = state.section ? "lesson" : "overview";

  if (chapter.id !== "guide") {
    writePreference("la-visual-last", `#${state.route}${state.section ? `/${state.section}` : ""}`);
  }
  updateDocumentTitle(chapter, section);
  updateNavActive();
  document.body.classList.remove("sidebar-open");

  if (chapter.id === "guide") renderGuide();
  else if (!section) renderChapterOverview(chapter);
  else if (loadedChapters.has(chapter.id)) renderLessonPage(section, chapter);
  else {
    renderLessonLoading(section, chapter);
    const startScroll = window.scrollY;
    loadChapterLabs(chapter.id).then(
      () => {
        if (token !== routeToken) return;
        // keep the reader's place if they scrolled while the labs were loading
        const moved = Math.abs(window.scrollY - startScroll) > 4;
        renderLessonPage(section, chapter);
        finishRoute({ scroll: !moved });
      },
      () => {
        if (token === routeToken) renderLabLoadError();
      },
    );
  }
  finishRoute({ scroll: true, keepY });
}

function finishRoute({ scroll, keepY = null }) {
  buildPageToc();
  if (keepY !== null) window.scrollTo(0, keepY);
  window.requestAnimationFrame(() => {
    setupInteractiveBlocks();
    if (keepY !== null) window.scrollTo(0, keepY);
    if (!scroll || keepY !== null) return;
    if (state.section) {
      document.querySelector(`#${CSS.escape(state.section)}`)?.scrollIntoView({ block: "start", behavior: "auto" });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  });
}

function updateDocumentTitle(chapter, section) {
  document.title = section
    ? `${section.number} ${section.navTitle || section.title} | 高等代数可视化`
    : `${chapter.title} | 高等代数可视化`;
}

/* ---------- Guide ---------- */

function renderGuide() {
  const visited = Boolean(lastVisitedTarget());
  const startTarget = lastVisitedTarget() || firstLessonTarget();

  els.main.innerHTML = `
    <section class="section-band guide-hero" id="guide-intro">
      <div class="section-kicker">导学</div>
      <h2>先看见，再定义</h2>
      <p class="lead">这里沿北大版《高等代数》的章节展开。每个小节从一个具体的问题出发，先用图像与交互把画面立起来，再回到教材里的定义、定理与例题。</p>
      <p>你可以从头按顺序读，也可以在左侧目录里直接跳到正在学的小节。学习进度保存在这台设备上，随时可以接着上次的位置继续。</p>
      <div class="hero-actions">
        <a class="button primary" href="${startTarget}">${visited ? "继续学习" : "从第一节开始"}</a>
        <a class="button ghost" href="#guide-map" data-scroll-to="guide-map">查看学习路线</a>
      </div>
    </section>

    <section class="section-band" id="guide-usage">
      <div class="section-head"><div><div class="section-kicker">怎么学</div><h2>每个小节的三个动作</h2></div></div>
      <div class="usage-grid">
        <div class="usage-card"><span class="usage-step">01</span><strong>先抓住问题</strong><p>先明确这一节在回答什么，再建立必要的图像、结构和阅读方向。</p></div>
        <div class="usage-card"><span class="usage-step">02</span><strong>动手实验</strong><p>拖动矩阵元素、切换视角，亲手看网格、向量和结构怎样随参数变化。</p></div>
        <div class="usage-card"><span class="usage-step">03</span><strong>回到教材</strong><p>对照定义与定理，再做一道代表例题——答案默认折叠，先自己算。</p></div>
      </div>
      <div class="usage-tip">读完一节，点底部的「标记掌握」，进度会同步到左侧目录和下面的学习路线。</div>
    </section>

    <section class="section-band" id="guide-map">
      <div class="section-head"><div><div class="section-kicker">学习路线</div><h2>沿教材章节展开</h2></div></div>
      <div class="route-grid">${algebraContent.chapters.map(renderRouteCard).join("")}</div>
    </section>`;
}

function renderRouteCard(chapter) {
  const trackable = getStructuredSections(chapter);
  const done = trackable.filter((section) => state.completed.has(section.id)).length;
  const ready = trackable.length > 0;
  const percent = ready ? Math.round((done / trackable.length) * 100) : 0;
  const preview = chapter.sections.slice(0, 4).map(getSectionLabel).join(" · ");
  const status = ready
    ? `<div class="route-meter" role="img" aria-label="已掌握 ${done} / ${trackable.length}"><span style="width:${percent}%"></span></div><span class="route-count">${done}/${trackable.length} 已掌握</span>`
    : `<span class="route-count">${chapter.sections.length} 个小节</span>`;
  const href = ready ? `#${chapter.id}/${trackable[0].id}` : `#${chapter.id}`;

  return `
    <a class="route-card${ready ? "" : " is-soon"}" href="${href}">
      <span class="route-num">${String(chapterNumber(chapter)).padStart(2, "0")}</span>
      <div class="route-body"><strong>${escapeHtml(chapterShortTitle(chapter))}</strong><p>${preview}${chapter.sections.length > 4 ? " …" : ""}</p></div>
      <div class="route-status">${status}</div>
    </a>`;
}

/* ---------- Chapter overview ---------- */

function renderChapterOverview(chapter) {
  const sections = getStructuredSections(chapter);
  const cards = chapter.overviewCards || [];

  els.main.innerHTML = `
      <section class="lesson-cover structured-cover" id="${chapter.id}-overview">
        <div class="lesson-cover-copy">
          <span class="eyebrow">${chapter.title}</span>
          <h1>${chapter.overviewTitle || chapterShortTitle(chapter)}</h1>
          <p>${chapter.summary || ""}</p>
          <div class="meta-row"><span class="tag accent">${sections.length} 个小节</span></div>
        </div>
      </section>
      ${cards.length ? `<section class="section-band compact-band" id="${chapter.id}-structure">
        <div class="section-head"><div><div class="section-kicker">本章结构</div><h2>${chapter.structureTitle || "一条主线连接全部小节"}</h2></div></div>
        <div class="overview-grid">
          ${cards.map((card) => `<div class="info-panel"><strong>${card.title}</strong><p>${card.text}</p></div>`).join("")}
        </div>
      </section>` : ""}
      <section class="section-band compact-band" id="${chapter.id}-lessons">
        <div class="section-head"><div><div class="section-kicker">本章目录</div><h2>进入具体小节</h2></div></div>
        <div class="lesson-card-grid">${sections.map((section) => renderLessonCard(chapter, section)).join("")}</div>
      </section>`;
}

function renderLessonCard(chapter, section) {
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

/* ---------- Lesson page ---------- */

function lessonCoverHtml(section, owner) {
  return `
    <section class="lesson-cover" id="${section.id}">
      <div class="lesson-cover-copy">
        <div class="breadcrumb">${owner?.title || "课程"} <span>/</span> ${section.title}</div>
        <h1>${section.title}</h1>
        <p>${section.goal}</p>
      </div>
    </section>
`;
}

// Shown for the moment a chapter's labs are still downloading.
function renderLessonLoading(section, chapter) {
  els.main.innerHTML = `${lessonCoverHtml(section, chapter)}
    <section class="section-band lesson-page-section lab-load-state" role="status">
      <p class="lead">正在载入这一节……</p>
    </section>`;
}

function renderLabLoadError() {
  const box = els.main.querySelector(".lab-load-state");
  if (!box) return;
  box.innerHTML = `
    <p class="lead">这一节的实验没有载入成功，可能是网络断了一下。</p>
    <button class="button primary" type="button" data-reload-page>重新载入</button>`;
  box.querySelector("[data-reload-page]").addEventListener("click", () => window.location.reload());
}

function renderLessonPage(section, chapter) {
  teardownLessonLabs();
  const owner = chapter || findStructuredSection(section.id)?.chapter || null;
  const concepts = getConcepts(section);
  const video = getVideo(section);
  els.main.innerHTML = `${lessonCoverHtml(section, owner)}

    <section class="section-band lesson-page-section" id="${section.id}-question">
      <h2>概念问题</h2>
      <p class="lead">${section.question}</p>
      <p>${section.intro}</p>
    </section>

    ${renderVideoSection(section, video)}

    ${renderFormalSection(section, concepts)}

    ${renderInteractiveSection(section)}

    ${renderExampleSection(section)}

    ${renderSelfTestSection(section)}

    <section class="section-band lesson-page-section" id="${section.id}-summary">
      <h2>小结</h2>
      ${renderSummary(section)}
      <button class="button mark-button" type="button" data-complete="${section.id}">标记掌握</button>
    </section>

    ${renderLessonNavigation(section, owner)}
  `;

  mountLessonLabs(owner?.id, section, els.main);
}

function getCourseNavigationNodes() {
  return getChapters().flatMap((chapter) => {
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

function renderLessonNavigation(section, chapter) {
  const nodes = getCourseNavigationNodes();
  const currentIndex = nodes.findIndex((node) => node.id === `${chapter?.id || state.route}/${section.id}`);
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

// The band is a mount point: chapter modules render the lab into it.
function renderInteractiveSection(section) {
  const interactive = getInteractive(section);
  if (!interactive) return "";
  const prompts = interactive.prompts || [];
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
  return section.summary?.length ? `<ul>${section.summary.map((item) => `<li>${item}</li>`).join("")}</ul>` : "";
}


/* ---------- After each render ---------- */

function setupInteractiveBlocks() {
  updateProgressUI();
  bindCompleteButtons();
  bindAnimatedDetails(els.main);
  setupTocObserver();
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

/* ---------- Page table of contents ---------- */

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

/* ---------- Sidebar state ---------- */

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

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "");
}
