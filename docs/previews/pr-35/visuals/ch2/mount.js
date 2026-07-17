/* Attach Chapter 2 presentation modules after the generic lesson shell renders. */
(() => {
  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  window.renderLessonPage = function renderLessonPageWithChapter2Extensions(section, chapter) {
    baseRenderLessonPage(section, chapter);
    window.mountChapter2Lesson?.(section, document.querySelector("#mainContent"));
  };
})();
