/* Attach Chapter 4 presentation modules after the generic lesson shell renders. */
(() => {
  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  window.renderLessonPage = function renderLessonPageWithChapter4Extensions(section) {
    baseRenderLessonPage(section);
    window.mountChapter4Lesson?.(section, document.querySelector("#mainContent"));
  };
})();
