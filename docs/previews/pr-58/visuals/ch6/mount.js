/* Attach Chapter 6 presentation modules after the generic lesson shell renders. */
(() => {
  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  window.renderLessonPage = function renderLessonPageWithChapter6Extensions(section, chapter) {
    baseRenderLessonPage(section, chapter);
    window.mountChapter6Lesson?.(section, document.querySelector("#mainContent"));
  };
})();
