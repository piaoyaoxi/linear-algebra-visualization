/*
 * Chapter 3 presentation registry.
 */
(() => {
  const renderers = new Map();
  const enhancers = [];

  window.defineChapter3Renderer = function defineChapter3Renderer(sectionId, renderer) {
    if (!sectionId || !renderer || typeof renderer !== "object") {
      throw new TypeError("Chapter 3 renderers require a section id and an object.");
    }
    renderers.set(sectionId, renderer);
  };

  window.defineChapter3LessonEnhancer = function defineChapter3LessonEnhancer(enhancer) {
    if (typeof enhancer === "function") enhancers.push(enhancer);
  };

  window.mountChapter3Lesson = function mountChapter3Lesson(section, root) {
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
