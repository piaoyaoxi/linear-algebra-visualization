/*
 * Chapter 5 presentation registry.
 * Renderers may return cleanup functions; the previous lesson is torn down
 * before a new one mounts so resize listeners and animation frames do not leak.
 */
(() => {
  const renderers = new Map();
  const enhancers = [];
  let activeCleanups = [];

  function collectCleanup(value) {
    if (typeof value === "function") activeCleanups.push(value);
    if (Array.isArray(value)) value.forEach(collectCleanup);
  }

  function cleanupActiveLesson() {
    activeCleanups.splice(0).forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        console.warn("Chapter 5 cleanup failed", error);
      }
    });
  }

  window.defineChapter5Renderer = function defineChapter5Renderer(sectionId, renderer) {
    if (!sectionId || !renderer || typeof renderer !== "object") {
      throw new TypeError("Chapter 5 renderers require a section id and an object.");
    }
    renderers.set(sectionId, renderer);
  };

  window.defineChapter5LessonEnhancer = function defineChapter5LessonEnhancer(enhancer) {
    if (typeof enhancer === "function") enhancers.push(enhancer);
  };

  window.cleanupChapter5Lesson = cleanupActiveLesson;

  window.mountChapter5Lesson = function mountChapter5Lesson(section, root) {
    cleanupActiveLesson();
    if (!section?.id || !root) return;
    const renderer = renderers.get(section.id);
    if (renderer) {
      const formal = root.querySelector(`#${CSS.escape(section.id)}-formal`);
      const interactive = root.querySelector(`#${CSS.escape(section.id)}-interactive`);
      collectCleanup(renderer.formal?.(formal, section, root));
      collectCleanup(renderer.interactive?.(interactive, section, root));
    }
    enhancers.forEach((enhancer) => collectCleanup(enhancer(section, root)));
  };
})();
