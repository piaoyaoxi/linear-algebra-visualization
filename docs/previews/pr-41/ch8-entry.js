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
            <div class="section-list"><div class="section-list-clip"><div class="section-list-inner">${sectionLinks}</div></div></div>
          </div>`;
      })
      .join("");

    bindChapterToggles();
    updateProgressUI();
  };

  function renderChapter8Overview(chapter) {
    const sections = structuredSections(chapter);
    els.main.innerHTML = `
      <section class="lesson-cover ch8-cover ch8-overview-cover" id="chapter8">
        <div class="lesson-cover-copy">
          <span class="eyebrow">第八章 · λ-矩阵</span>
          <h1>给矩阵提取一张不会随换基改变的结构指纹</h1>
          <p>${chapter.summary}</p>
          <div class="meta-row">
            <span class="tag accent">7 个小节</span>
            <span class="tag">7 个重新设计的结构实验</span>
            <span class="tag">Jordan / Rational 双标准形</span>
          </div>
        </div>
        <div class="ch8-cover-journey" aria-label="第八章结构路线">
          <div><span>01</span><b>参数化</b><small>A → λI−A</small></div>
          <i>→</i>
          <div><span>02</span><b>压缩</b><small>Smith → dᵢ</small></div>
          <i>→</i>
          <div><span>03</span><b>分类</b><small>相似指纹</small></div>
          <i>→</i>
          <div><span>04</span><b>重建</b><small>Jordan / Rational</small></div>
        </div>
      </section>

      <section class="section-band compact-band ch8-overview-principle" id="ch8-structure">
        <div class="section-head"><div><div class="section-kicker">本章只回答一个大问题</div><h2>怎样从矩阵中抽取相似类，并把结构重新拼成标准形？</h2></div></div>
        <div class="ch8-overview-panels">
          <article><span>先看失败参数</span><h3>λI−A 什么时候出现非零核？</h3><p>特征值只是入口；同样的根还可能拥有不同核结构。</p></article>
          <article><span>再看不会变的指纹</span><h3>哪些多项式在行列操作下保持？</h3><p>Smith 标准形、不变因子和初等因子把大量子式压缩成有限结构。</p></article>
          <article><span>最后看两种重建</span><h3>链与轨道怎样变成标准块？</h3><p>Jordan 用广义特征向量链；有理标准形用循环子空间和伴随矩阵。</p></article>
        </div>
      </section>

      <section class="section-band compact-band" id="ch8-lessons">
        <div class="section-head"><div><div class="section-kicker">本章目录</div><h2>七个问题，七种不同的视觉语言</h2></div></div>
        <div class="lesson-card-grid ch8-lesson-grid">
          ${sections.map((section, index) => renderChapter8Card(section, index)).join("")}
        </div>
      </section>`;
  }

  function renderChapter8Card(section, index) {
    const visualNames = ["参数扫描", "化简轨迹", "gcd 流水线", "双坐标房间", "因子积木墙", "链塔与阶梯", "传送带与反馈"];
    return `
      <a class="lesson-card ch8-lesson-card" href="#ch8/${section.id}">
        <div class="ch8-card-top"><span>${String(index + 1).padStart(2, "0")}</span><b>${visualNames[index]}</b></div>
        <div class="section-kicker">${section.number} · ${section.textbookSection}</div>
        <h3>${section.navTitle}</h3>
        <p>${section.question}</p>
        <div class="meta-row">${(section.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
      </a>`;
  }

  function renderObserve(section) {
    const observe = section.observe;
    if (!observe) return "";
    return `
      <section class="section-band lesson-page-section ch8-observe" id="${section.id}-observe">
        <div class="ch8-observe-head">
          <div><span>观察前先知道</span><h2>${observe.title}</h2><p>${observe.lead}</p></div>
          <div class="ch8-observe-mark" aria-hidden="true">?</div>
        </div>
        <div class="ch8-observe-cues">
          ${observe.cues.map((cue, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><p>${cue}</p></article>`).join("")}
        </div>
      </section>`;
  }

  function renderInteraction(section) {
    const interactive = section.interactive;
    if (!interactive) return "";
    return `
      <section class="section-band lesson-page-section ch8-interactive-section" id="${section.id}-interactive">
        <div class="section-head ch8-interaction-heading">
          <div><div class="section-kicker">核心实验 · 先操作再读定理</div><h2>${interactive.title}</h2><p>${interactive.description}</p></div>
        </div>
        <div class="ch8-mission-card">
          <span>本次实验要回答</span>
          <strong>${interactive.mission}</strong>
        </div>
        <div class="ch8-lab-host" data-ch8-lab="${interactive.kind}" data-section-id="${section.id}"></div>
        <div class="ch8-experiment-roadmap" aria-label="实验观察步骤">
          ${interactive.steps
            .map(
              (step, index) => `
                <article data-experiment-step="${index}">
                  <span>${String(index + 1).padStart(2, "0")}</span>
                  <div><b>${step.action}</b><p>${step.watch}</p></div>
                </article>`,
            )
            .join("")}
        </div>
      </section>`;
  }

  function renderFoundation(section) {
    const modules = section.foundation || [];
    if (!modules.length) return "";
    return `
      <section class="section-band lesson-page-section ch8-foundation" id="${section.id}-formal">
        <div class="section-head"><div><div class="section-kicker">把实验落回教材</div><h2>刚才看到的现象，严格地怎样表达？</h2></div></div>
        <div class="ch8-foundation-stack">
          ${modules
            .map(
              (item) => `
                <article class="ch8-foundation-module">
                  <div class="ch8-foundation-number">${item.number}</div>
                  <div class="ch8-foundation-copy">
                    <div class="ch8-foundation-title"><h3>${item.title}</h3><p>${item.subtitle || ""}</p></div>
                    <div class="ch8-foundation-body"><p>${item.body}</p>${item.formula ? `<div class="ch8-foundation-formula">${texDisplay(item.formula)}</div>` : ""}</div>
                  </div>
                </article>`,
            )
            .join("")}
        </div>
        <div class="ch8-reference-row">
          <div><span>教材对应</span><strong>${section.textbookSection}</strong><p>${section.textbook?.reference || "北大版《高等代数》第八章"}</p></div>
          <ul>${(section.textbook?.items || []).map((item) => `<li>${item}</li>`).join("")}</ul>
        </div>
        ${
          section.misconceptions?.length
            ? `<div class="ch8-misconceptions"><strong>容易混淆</strong>${section.misconceptions.map((item) => `<span>${item}</span>`).join("")}</div>`
            : ""
        }
      </section>`;
  }

  function renderExample(section) {
    const example = section.example;
    if (!example) return "";
    const choices = Array.isArray(example.choices)
      ? `<fieldset class="ch8-example-choices" data-ch8-example-choices>
          <legend class="sr-only">请选择一个答案</legend>
          ${example.choices
            .map(
              (choice, index) => `
                <label>
                  <input type="radio" name="${section.id}-choice" value="${index}">
                  <span>${String.fromCharCode(65 + index)}</span>
                  <b>${choice.text}</b>
                  <i aria-hidden="true"></i>
                </label>`,
            )
            .join("")}
        </fieldset>`
      : "";
    return `
      <section class="section-band lesson-page-section" id="${section.id}-example">
        <div class="section-head"><div><div class="section-kicker">代表例题</div><h2>先用刚才的结构判断，再展开计算</h2></div></div>
        <div class="ch8-example" data-ch8-example data-section-id="${section.id}">
          <div class="ch8-example-head"><span>问题</span><h3>${example.title}</h3></div>
          <div class="ch8-example-question">${example.question}</div>
          ${choices}
          <div class="ch8-example-actions">
            <button class="button primary" type="button" data-ch8-example-action${choices ? " disabled" : ""}>${choices ? "检查选择" : "显示第一步"}</button>
            <p data-ch8-example-feedback aria-live="polite">${choices ? "先选一个答案。" : "先独立思考，再逐步核对。"}</p>
          </div>
          <ol class="ch8-example-steps" data-ch8-example-steps></ol>
        </div>
      </section>`;
  }

  function renderSelfTest(section) {
    if (!section.quiz?.length) return "";
    return `
      <section class="section-band lesson-page-section" id="${section.id}-quiz">
        <div class="section-head"><div><div class="section-kicker">自测</div><h2>能否不看实验，独立说清这四件事？</h2></div></div>
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
      const previousDirection = direction === "previous";
      return `<a class="lesson-neighbor-card ${previousDirection ? "is-previous" : "is-next"}" href="#ch8/${item.id}"><span class="lesson-neighbor-label">${previousDirection ? "← 上一节" : "下一节 →"}</span><strong>${item.number} ${item.navTitle}</strong><span>第八章 λ-矩阵</span></a>`;
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

      <section class="section-band lesson-page-section ch8-question" id="${section.id}-question">
        <div class="section-kicker">这一节只追一个问题</div>
        <h2>${section.question}</h2>
        <p class="lead">${section.intro}</p>
      </section>

      ${renderObserve(section)}
      ${renderInteraction(section)}
      ${renderFoundation(section)}
      ${renderExample(section)}
      ${renderSelfTest(section)}

      <section class="section-band lesson-page-section ch8-summary" id="${section.id}-summary">
        <div class="section-head"><div><div class="section-kicker">小结</div><h2>把这一节压缩成三句话</h2></div></div>
        <ol>${(section.summary || []).map((item) => `<li>${item}</li>`).join("")}</ol>
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
    const activeSection = sections.find((item) => item.id === sectionId);
    document.title = activeSection ? `${activeSection.number} ${activeSection.navTitle} | 高等代数可视化` : `${chapter.title} | 高等代数可视化`;

    updateNavActive();
    updateContinueShortcut();
    buildPageToc();
    document.body.classList.remove("sidebar-open");

    window.requestAnimationFrame(() => {
      setupInteractiveBlocks();
      window.mountChapter8?.(activeSection, els.main);
      if (sectionId) document.querySelector(`#${CSS.escape(sectionId)}`)?.scrollIntoView({ block: "start", behavior: "auto" });
      else window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  };
})();
