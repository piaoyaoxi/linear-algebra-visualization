/* Attach Chapter 1 presentation modules after the generic lesson shell renders. */
(() => {
  const styleHref = "./visuals/ch1/refinement.css?v=ch1-final";
  if (!document.querySelector(`link[href="${styleHref}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = styleHref;
    document.head.append(link);
  }

  if (window.Ch1UI?.renderFormal && window.defineChapter1Renderer) {
    ["rational-polynomials", "multivariate-polynomials", "symmetric-polynomials"].forEach((sectionId) => {
      window.defineChapter1Renderer(sectionId, { formal: window.Ch1UI.renderFormal });
    });
  }

  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  window.addEventListener("hashchange", () => window.teardownChapter1Lesson?.());

  window.renderLessonPage = function renderLessonPageWithChapter1Extensions(section, chapter) {
    baseRenderLessonPage(section, chapter);
    window.mountChapter1Lesson?.(section, document.querySelector("#mainContent"));
  };
})();
