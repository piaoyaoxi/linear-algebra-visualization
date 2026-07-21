/* Attach Chapter 2 presentation modules after the generic lesson shell renders. */
(() => {
  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  function enhanceChapter2Lesson(section, root) {
    const summary = root.querySelector(`#${CSS.escape(section.id)}-summary`);
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

  window.addEventListener("hashchange", () => window.teardownChapter2Lesson?.());
  window.addEventListener("pagehide", () => window.teardownChapter2Lesson?.());
})();
