/* Chapter 9 renderer registry, matching the Chapter 5 lifecycle pattern. */
(() => {
  const renderers = new Map();
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
        console.warn("Chapter 9 cleanup failed", error);
      }
    });
  }

  window.defineChapter9Renderer = function defineChapter9Renderer(sectionId, renderer) {
    if (!sectionId || !renderer || typeof renderer !== "object") {
      throw new TypeError("Chapter 9 renderers require a section id and an object.");
    }
    renderers.set(sectionId, renderer);
  };

  window.cleanupChapter9Lesson = cleanupActiveLesson;

  window.mountChapter9Lesson = function mountChapter9Lesson(section, root) {
    cleanupActiveLesson();
    if (!section?.id || !root) return;
    const renderer = renderers.get(section.id);
    if (!renderer) return;
    const formal = root.querySelector(`#${CSS.escape(section.id)}-formal`);
    const interactive = root.querySelector(`#${CSS.escape(section.id)}-interactive`);
    collectCleanup(renderer.formal?.(formal, section, root));
    collectCleanup(renderer.interactive?.(interactive, section, root));
  };
})();
