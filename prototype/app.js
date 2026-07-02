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
};

const els = {
  nav: document.querySelector("#chapterNav"),
  main: document.querySelector("#mainContent"),
  toc: document.querySelector("#pageToc"),
  sidebarToggle: document.querySelector("#sidebarToggle"),
  themeToggle: document.querySelector("#themeToggle"),
  drawerBackdrop: document.querySelector("#drawerBackdrop"),
  search: document.querySelector("#searchInput"),
  progressBadge: document.querySelector("#progressBadge"),
};

const SUN_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3v2" />
    <path d="M12 19v2" />
    <path d="m4.22 4.22 1.42 1.42" />
    <path d="m18.36 18.36 1.42 1.42" />
    <path d="M3 12h2" />
    <path d="M19 12h2" />
    <path d="m4.22 19.78 1.42-1.42" />
    <path d="m18.36 5.64 1.42-1.42" />
    <circle cx="12" cy="12" r="4" />
  </svg>
`;

const MOON_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.4 13.4A7.7 7.7 0 0 1 10.6 3.6a8.4 8.4 0 1 0 9.8 9.8Z" />
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

  els.search.addEventListener("input", () => filterNav(els.search.value));
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
          <a class="nav-chapter" href="${chapterHref}">
            <span class="chapter-icon">${chapter.icon}</span>
            <span class="chapter-label">
              <strong>${chapter.title}</strong>
              <small>${getChapterSubtitle(chapter.id)}</small>
            </span>
            <span class="chapter-arrow">›</span>
          </a>
          <div class="section-list">${sectionLinks}</div>
        </div>
      `;
    })
    .join("");

  updateProgressUI();
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
      <p class="lead">页面按照教材路径组织内容，在正文中嵌入动画、交互实验和代表例题。学生可以沿着章节阅读，也可以直接进入可视化演示。</p>
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
          <span class="tag accent">${chapter4Sections.length} 个小节</span>
          <span class="tag">2 个交互实验</span>
          <span class="tag">7 个折叠例题</span>
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
  const prompts = getVisualPrompts(section);
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

    <section class="section-band lesson-page-section" id="${section.id}-visual">
      <h2>可视化演示</h2>
      ${renderVisualPanel(section)}
    </section>

    <section class="section-band lesson-page-section" id="${section.id}-meaning">
      <h2>直观解释</h2>
      <p>${concepts.map((concept) => `<span class="term-chip">${concept.label}</span> ${concept.text}`).join(" ")}</p>
      ${renderConceptStrip(concepts)}
    </section>

    <section class="section-band lesson-page-section" id="${section.id}-experiment">
      <h2>交互实验</h2>
      <div class="script-panel">
        <h3>观察提示</h3>
        <ol>${prompts.map((item) => `<li>${item}</li>`).join("")}</ol>
      </div>
    </section>

    <section class="section-band lesson-page-section" id="${section.id}-textbook">
      <h2>教材对应</h2>
      <div class="script-panel textbook-panel">
        <h3>${section.textbookSection} · ${section.textbook?.reference || "北大版《高等代数》第四章"}</h3>
        ${section.textbook?.page ? `<p>页码：${section.textbook.page}</p>` : ""}
        <ul>${(section.textbook?.items || []).map((item) => `<li>${item}</li>`).join("")}</ul>
      </div>
    </section>

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

    <section class="section-band lesson-page-section" id="${section.id}-summary">
      <h2>小结</h2>
      ${renderSummary(section)}
      <button class="button mark-button" type="button" data-complete="${section.id}">标记掌握</button>
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
  const exercises = section.exercises?.length
    ? `<div class="exercise-list"><h3>思考题</h3><ol>${section.exercises.map((item) => `<li>${item}</li>`).join("")}</ol></div>`
    : "";
  return `${summary}${exercises}`;
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

function renderVisualPanel(section) {
  const visual = getVisual(section);

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

function setupMatrixControls() {
  if (!document.querySelector("#transformCanvas")) return;
  document.querySelectorAll("[data-matrix]").forEach((input) => {
    input.addEventListener("input", drawTransformCanvas);
  });
  drawTransformCanvas();
}

function drawTransformCanvas() {
  const canvas = document.querySelector("#transformCanvas");
  if (!canvas) return;

  const inputs = {
    a: document.querySelector("#matrix-a"),
    b: document.querySelector("#matrix-b"),
    c: document.querySelector("#matrix-c"),
    d: document.querySelector("#matrix-d"),
  };
  if (!inputs.a) return;

  const matrix = {
    a: Number(inputs.a.value),
    b: Number(inputs.b.value),
    c: Number(inputs.c.value),
    d: Number(inputs.d.value),
  };

  Object.entries(matrix).forEach(([key, value]) => {
    const label = document.querySelector(`#matrix-${key}-value`);
    if (label) label.textContent = value.toFixed(2).replace(/\.00$/, "");
  });

  const readout = document.querySelector("#matrixReadout");
  const det = matrix.a * matrix.d - matrix.b * matrix.c;
  if (readout) {
    readout.innerHTML = `
      ${texDisplay(`A=\\begin{bmatrix}${formatNumber(matrix.a)}&${formatNumber(matrix.b)}\\\\${formatNumber(matrix.c)}&${formatNumber(matrix.d)}\\end{bmatrix}`)}
      ${texInline(`\\det(A)=${formatNumber(det)}`)}
    `;
  }

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);

  const styles = getComputedStyle(document.body);
  const text = styles.getPropertyValue("--muted").trim();
  const line = styles.getPropertyValue("--line-strong").trim();
  const accent = styles.getPropertyValue("--accent").trim();
  const coral = styles.getPropertyValue("--coral").trim();
  const blue = styles.getPropertyValue("--blue").trim();
  const origin = { x: rect.width / 2, y: rect.height / 2 };
  const scale = Math.min(rect.width, rect.height) / 8.4;

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
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.restore();
  }

  for (let i = -5; i <= 5; i += 1) {
    drawLine(point(-5, i), point(5, i), line, 1, 0.34);
    drawLine(point(i, -5), point(i, 5), line, 1, 0.34);
    drawLine(point(-5, i, true), point(5, i, true), accent, 1.25, 0.5);
    drawLine(point(i, -5, true), point(i, 5, true), coral, 1.25, 0.42);
  }

  drawArrow(ctx, origin, point(1, 0, true), accent, "Ae1");
  drawArrow(ctx, origin, point(0, 1, true), coral, "Ae2");
  drawArrow(ctx, origin, point(1, 0), text, "e1", 0.42);
  drawArrow(ctx, origin, point(0, 1), text, "e2", 0.42);

  ctx.fillStyle = blue;
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, 3.6, 0, Math.PI * 2);
  ctx.fill();
}

function drawArrow(ctx, from, to, color, label, alpha = 1) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - 10 * Math.cos(angle - Math.PI / 6), to.y - 10 * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(to.x - 10 * Math.cos(angle + Math.PI / 6), to.y - 10 * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  ctx.font = "700 13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillText(label, to.x + 8, to.y - 8);
  ctx.restore();
}

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
function setupTocObserver() {
  if (tocObserver) tocObserver.disconnect();
  const sections = [...document.querySelectorAll(".section-band[id], .lesson-section[id]")];
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
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      document.querySelectorAll("[data-toc-link]").forEach((link) => {
        link.classList.toggle("is-active", link.dataset.tocLink === visible.target.id);
      });
    },
    { rootMargin: "-90px 0px -60% 0px", threshold: [0.1, 0.2, 0.4] },
  );

  sections.forEach((section) => tocObserver.observe(section));
}

function updateNavActive() {
  document.querySelectorAll(".chapter-group").forEach((group) => {
    const isActive = group.dataset.chapter === state.route;
    group.classList.toggle("is-active", isActive);
    group.classList.toggle("is-open", isActive || group.dataset.chapter === "ch4");
    group.querySelector(".nav-chapter")?.classList.toggle("is-active", isActive);
  });

  document.querySelectorAll("[data-section-link]").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.sectionLink === state.section);
  });
}

function updateProgressUI() {
  const { done, total } = getProgress();
  els.progressBadge.textContent = `已掌握 ${done}/${total}`;

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
