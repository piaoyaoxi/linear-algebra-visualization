/* Attach Chapter 9 presentation modules after the generic lesson shell renders. */
(() => {
  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  window.renderLessonPage = function renderLessonPageWithChapter9(section, chapter) {
    baseRenderLessonPage(section, chapter);
    if (chapter?.id !== "ch9") return;
    window.mountChapter9Lesson?.(section, document.querySelector("#mainContent"));
  };
})();
