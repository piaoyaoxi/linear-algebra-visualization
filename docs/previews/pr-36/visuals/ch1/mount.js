/* Attach Chapter 1 presentation modules after the generic lesson shell renders. */
(() => {
  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  window.renderLessonPage = function renderLessonPageWithChapter1Extensions(section, chapter) {
    baseRenderLessonPage(section, chapter);
    window.mountChapter1Lesson?.(section, document.querySelector("#mainContent"));
  };
})();
