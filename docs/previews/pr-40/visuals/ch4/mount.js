/* Attach Chapter 4 presentation modules after the generic lesson shell renders. */
(() => {
  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  window.renderLessonPage = function renderLessonPageWithChapter4Extensions(section, chapter) {
    baseRenderLessonPage(section, chapter);
    const owner = chapter || window.findStructuredSection?.(section?.id)?.chapter;
    if (owner?.id === "ch4") {
      window.mountChapter4Lesson?.(section, document.querySelector("#mainContent"));
    }
  };
})();
