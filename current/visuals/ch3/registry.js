/* Chapter 3 presentation registry with deterministic teardown. */
(() => {
  const renderers = new Map();
  const enhancers = [];
  let activeCleanup = null;

  function runCleanup() {
    if (typeof activeCleanup === "function") {
      try {
        activeCleanup();
      } catch (error) {
        console.warn("Chapter 3 teardown failed", error);
      }
    }
    activeCleanup = null;
  }

  window.defineChapter3Renderer = function defineChapter3Renderer(sectionId, renderer) {
    if (!sectionId || !renderer || typeof renderer !== "object") {
      throw new TypeError("Chapter 3 renderers require a section id and an object.");
    }
    renderers.set(sectionId, renderer);
  };

  window.defineChapter3LessonEnhancer = function defineChapter3LessonEnhancer(enhancer) {
    if (typeof enhancer === "function") enhancers.push(enhancer);
  };

  window.teardownChapter3Lesson = runCleanup;

  window.mountChapter3Lesson = function mountChapter3Lesson(section, root) {
    runCleanup();
    if (!section?.id || !root) return;
    const cleanups = [];
    const renderer = renderers.get(section.id);
    if (renderer) {
      const formal = root.querySelector(`#${CSS.escape(section.id)}-formal`);
      const interactive = root.querySelector(`#${CSS.escape(section.id)}-interactive`);
      const formalCleanup = renderer.formal?.(formal, section, root);
      const interactiveCleanup = renderer.interactive?.(interactive, section, root);
      if (typeof formalCleanup === "function") cleanups.push(formalCleanup);
      if (typeof interactiveCleanup === "function") cleanups.push(interactiveCleanup);
    }
    enhancers.forEach((enhancer) => {
      const cleanup = enhancer(section, root);
      if (typeof cleanup === "function") cleanups.push(cleanup);
    });
    activeCleanup = () => cleanups.splice(0).reverse().forEach((cleanup) => cleanup());
  };

  window.addEventListener("hashchange", runCleanup);
  window.addEventListener("pagehide", runCleanup);
})();
