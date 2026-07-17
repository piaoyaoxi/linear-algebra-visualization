/*
 * learn.html entry adapter.
 * The existing course engine remains in app.js; this file turns it into the
 * dedicated learning application and supplies the guide route.
 */

const LEARN_GUIDE_CHAPTER = {
  id: "guide",
  icon: "0",
  title: "导学",
  subtitle: "如何使用",
  sections: [],
};

function learnTrackableSections(chapter) {
  return (chapter.sections || []).filter((section) => typeof section === "object" && section.id);
}

function learnChapterNumber(chapter) {
  const match = /^ch(\d+)$/.exec(chapter.id || "");
  if (match) return Number(match[1]);
  const index = algebraContent.chapters.indexOf(chapter);
  return index >= 0 ? index + 1 : 0;
}

function learnChapterShortTitle(chapter) {
  const trimmed = String(chapter.title || "")
    .replace(/^第[0-9一二三四五六七八九十百]+章/, "")
    .replace(/^[\s·:：\-—]+/, "")
    .trim();
  return trimmed || chapter.title || "";
}

function learnOrderedChapters() {
  return [...algebraContent.chapters].sort((a, b) => learnChapterNumber(a) - learnChapterNumber(b));
}


function learnFirstStructuredTarget() {
  for (const chapter of learnOrderedChapters()) {
    const first = learnTrackableSections(chapter)[0];
    if (first) return `#${chapter.id}/${first.id}`;
  }
  return "#ch4/matrix-language";
}

function learnLastTarget() {
  const last = localStorage.getItem("la-visual-last");
  if (!last || !last.startsWith("#")) return null;

  const [route, section] = last.slice(1).split("/");
  const chapter = algebraContent.chapters.find((item) => item.id === route);
  if (!chapter) return null;

  if (section) {
    if (!learnTrackableSections(chapter).some((item) => item.id === section)) return null;
  }

  return last;
}

getChapters = function getLearningChapters() {
  return [LEARN_GUIDE_CHAPTER, ...algebraContent.chapters];
};

getChapterById = function getLearningChapterById(id) {
  return getChapters().find((chapter) => chapter.id === id) || LEARN_GUIDE_CHAPTER;
};

getProgress = function getLearningProgress() {
  const trackable = algebraContent.chapters.flatMap((chapter) => learnTrackableSections(chapter));
  return { done: trackable.filter((section) => state.completed.has(section.id)).length, total: trackable.length };
};

getStartTarget = function getLearningStartTarget() {
  return learnLastTarget() || learnFirstStructuredTarget();
};

hasVisitedLesson = function hasLearningHistory() {
  return Boolean(learnLastTarget());
};

renderNav = function renderLearningNav() {
  els.nav.innerHTML = getChapters()
    .map((chapter) => {
      const chapterHref = `#${chapter.id}`;
      const structured = learnTrackableSections(chapter);
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

updateContinueShortcut = function updateLearningContinueShortcut() {
  const shortcut = document.querySelector("#continueShortcut");
  if (!shortcut) return;
  shortcut.href = getStartTarget();
  shortcut.textContent = hasVisitedLesson() ? "继续学习" : "从第一节开始";
};

renderGuide = function renderLearningGuide() {
  const startTarget = getStartTarget();
  const visited = hasVisitedLesson();

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
      <div class="route-grid">${learnOrderedChapters().map(renderLearningRouteCard).join("")}</div>
    </section>`;
};

function renderLearningRouteCard(chapter) {
  const trackable = learnTrackableSections(chapter);
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
      <span class="route-num">${String(learnChapterNumber(chapter)).padStart(2, "0")}</span>
      <div class="route-body"><strong>${escapeHtml(learnChapterShortTitle(chapter))}</strong><p>${preview}${chapter.sections.length > 4 ? " …" : ""}</p></div>
      <div class="route-status">${status}</div>
    </a>`;
}

renderRoute = function renderLearningRoute() {
  window.teardownChapter7Lesson?.();
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
  const structured = learnTrackableSections(chapter);
  const validSection =
    requestedSection && structured.some((item) => item.id === requestedSection) ? requestedSection : "";

  state.route = chapter.id;
  state.section = validSection;
  state.openChapters.add(state.route);
  document.body.dataset.route = state.route;
  document.body.dataset.view = state.section ? "lesson" : "overview";

  if (chapter.id === "guide") renderGuide();
  else if (structured.length) renderStructuredChapter(chapter);
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
    if (state.section) document.querySelector(`#${CSS.escape(state.section)}`)?.scrollIntoView({ block: "start", behavior: "auto" });
    else window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  });
};
