/*
 * Chapter 6 presentation registry.
 * Later refinement modules may replace one hook while preserving the other.
 */
(() => {
  const renderers = new Map();
  const enhancers = [];

  window.defineChapter6Renderer = function defineChapter6Renderer(sectionId, renderer) {
    if (!sectionId || !renderer || typeof renderer !== "object") {
      throw new TypeError("Chapter 6 renderers require a section id and an object.");
    }
    renderers.set(sectionId, { ...(renderers.get(sectionId) || {}), ...renderer });
  };

  window.defineChapter6LessonEnhancer = function defineChapter6LessonEnhancer(enhancer) {
    if (typeof enhancer === "function") enhancers.push(enhancer);
  };

  window.mountChapter6Lesson = function mountChapter6Lesson(section, root) {
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
