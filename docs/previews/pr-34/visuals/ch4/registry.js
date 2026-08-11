/*
 * Chapter 4 presentation registry.
 *
 * Renderers receive the already-created lesson DOM and mount into the formal
 * and interactive slots. The lesson shell owns the lifecycle, so renderers do
 * not watch the whole page or inject their own placeholder sections.
 */
(() => {
  const renderers = new Map();
  const enhancers = [];

  window.defineChapter4Renderer = function defineChapter4Renderer(sectionId, renderer) {
    if (!sectionId || !renderer || typeof renderer !== "object") {
      throw new TypeError("Chapter 4 renderers require a section id and an object.");
    }
    renderers.set(sectionId, renderer);
  };

  window.defineChapter4LessonEnhancer = function defineChapter4LessonEnhancer(enhancer) {
    if (typeof enhancer === "function") enhancers.push(enhancer);
  };

  window.renderChapter4SourcePanel = function renderChapter4SourcePanel(section) {
    const source = section?.textbook;
    if (!source) return "";
    const items = (source.items || []).map((item) => `<li>${item}</li>`).join("");
    return `
      <aside class="script-panel textbook-panel ch4-source-panel">
        <span class="matrix-formal-kicker">经典教材脉络</span>
        <h3>${source.reference || "经典线性代数教材综合"}</h3>
        ${source.page ? `<p>对应章节：${source.page}</p>` : ""}
        ${items ? `<ul>${items}</ul>` : ""}
      </aside>`;
  };

  window.mountChapter4Lesson = function mountChapter4Lesson(section, root) {
    if (!section?.id || !root) return;

    const renderer = renderers.get(section.id);
    if (renderer) {
      const formal = root.querySelector(`#${CSS.escape(section.id)}-formal`);
      const interactive = root.querySelector(`#${CSS.escape(section.id)}-interactive`);
      renderer.formal?.(formal, section, root);
      renderer.interactive?.(interactive, section, root);
    }

    enhancers.forEach((enhancer) => enhancer(section, root));
  };
})();
