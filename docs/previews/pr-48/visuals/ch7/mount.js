/* Attach Chapter 7 renderers after the generic lesson shell is ready. */
(() => {
  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  window.renderLessonPage = function renderLessonPageWithChapter7(section, chapter) {
    window.teardownChapter7Lesson?.();
    baseRenderLessonPage(section, chapter);
    const owner = chapter || window.findStructuredSection?.(section?.id)?.chapter;
    if (owner?.id === "ch7") window.mountChapter7Lesson?.(section, document.querySelector("#mainContent"));
  };
})();
