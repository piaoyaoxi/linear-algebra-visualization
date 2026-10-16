/* Attach Chapter 8 labs after the generic lesson shell renders. */
(() => {
  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  window.renderLessonPage = function renderLessonPageWithChapter8(section, chapter) {
    window.teardownChapter8Lesson?.();
    baseRenderLessonPage(section, chapter);
    const owner = chapter || window.findStructuredSection?.(section?.id)?.chapter;
    if (owner?.id !== "ch8") return;
    window.mountChapter8Lesson?.(section, document.querySelector("#mainContent"));
  };
})();
