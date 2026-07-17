/* Attach Chapter 2 presentation modules after the generic lesson shell renders. */
(() => {
  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  function renderList(items) {
    if (!Array.isArray(items) || !items.length) return "";
    return `<ul>${items.map((item) => `<li>${typeof item === "string" ? item : item.text || ""}</li>`).join("")}</ul>`;
  }

  function renderCheckpoints(items) {
    if (!Array.isArray(items) || !items.length) return "";
    return `
      <div class="ch2-learning-steps">
        ${items
          .map(
            (item, index) => `
              <article class="ch2-learning-step">
                <span>${String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>${item.label || `第 ${index + 1} 步`}</strong>
                  <p>${item.text || ""}</p>
                </div>
              </article>`,
          )
          .join("")}
      </div>`;
  }

  function enhanceChapter2Lesson(section, root) {
    const question = root.querySelector(`#${CSS.escape(section.id)}-question`);
    const summary = root.querySelector(`#${CSS.escape(section.id)}-summary`);
    if (!question) return;

    const hasRoadmap =
      section.prerequisites?.length || section.objectives?.length || section.checkpoints?.length;

    if (hasRoadmap) {
      const roadmap = document.createElement("section");
      roadmap.className = "section-band lesson-page-section ch2-learning-map";
      roadmap.id = `${section.id}-roadmap`;
      roadmap.innerHTML = `
        <div class="ch2-learning-map-head">
          <div>
            <div class="section-kicker">本节路线</div>
            <h2>先知道要看见什么，再进入公式</h2>
          </div>
          <div class="meta-row">${(section.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
        </div>
        <div class="ch2-learning-map-grid">
          ${
            section.prerequisites?.length
              ? `<article class="ch2-learning-map-card"><strong>开始前</strong>${renderList(section.prerequisites)}</article>`
              : ""
          }
          ${
            section.objectives?.length
              ? `<article class="ch2-learning-map-card"><strong>读完后应当做到</strong>${renderList(section.objectives)}</article>`
              : ""
          }
        </div>
        ${renderCheckpoints(section.checkpoints)}
      `;
      question.before(roadmap);
    }

    if (summary && section.bridge) {
      const bridge = document.createElement("div");
      bridge.className = "ch2-lesson-bridge";
      bridge.innerHTML = `<strong>下一步</strong><p>${section.bridge}</p>`;
      const markButton = summary.querySelector("[data-complete]");
      if (markButton) markButton.before(bridge);
      else summary.append(bridge);
    }
  }

  window.defineChapter2LessonEnhancer?.(enhanceChapter2Lesson);

  window.renderLessonPage = function renderLessonPageWithChapter2Extensions(section, chapter) {
    baseRenderLessonPage(section, chapter);
    window.mountChapter2Lesson?.(section, document.querySelector("#mainContent"));
  };

  // A Chapter 2 renderer owns resize listeners and animation frames. Tear it down
  // before every route transition, including transitions to the guide, overview,
  // or another chapter where no new Chapter 2 renderer will mount.
  window.addEventListener("hashchange", () => window.teardownChapter2Lesson?.());
  window.addEventListener("pagehide", () => window.teardownChapter2Lesson?.());
})();