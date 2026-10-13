/* Attach Chapter 10 labs after the generic lesson shell renders. */
(() => {
  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  window.renderLessonPage = function renderLessonPageWithChapter10(section, chapter) {
    window.teardownChapter10Lesson?.();
    baseRenderLessonPage(section, chapter);
    const owner = chapter || window.findStructuredSection?.(section?.id)?.chapter;
    if (owner?.id !== "ch10") return;
    window.mountChapter10Lesson?.(section, document.querySelector("#mainContent"));
  };
})();
