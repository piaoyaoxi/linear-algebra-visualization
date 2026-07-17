/* Attach Chapter 3 presentation modules after the generic lesson shell renders. */
(() => {
  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  window.renderLessonPage = function renderLessonPageWithChapter3Extensions(section, chapter) {
    baseRenderLessonPage(section, chapter);
    window.mountChapter3Lesson?.(section, document.querySelector("#mainContent"));
  };
})();
