/* Attach Chapter 5 presentation modules after the generic lesson shell renders. */
(() => {
  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  window.renderLessonPage = function renderLessonPageWithChapter5Extensions(section, chapter) {
    baseRenderLessonPage(section, chapter);
    window.mountChapter5Lesson?.(section, document.querySelector("#mainContent"));
  };
})();
