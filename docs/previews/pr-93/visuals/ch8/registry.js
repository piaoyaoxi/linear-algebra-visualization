/* Chapter 8 renderer registry with deterministic teardown. */
(() => {
  const renderers = new Map();
  let activeCleanup = null;

  function runCleanup() {
    if (typeof activeCleanup === "function") {
      try {
        activeCleanup();
      } catch (error) {
        console.warn("Chapter 8 teardown failed", error);
      }
    }
    activeCleanup = null;
  }

  window.defineChapter8Renderer = function defineChapter8Renderer(sectionId, renderer) {
    if (!sectionId || !renderer || typeof renderer !== "object") {
      throw new TypeError("Chapter 8 renderers require a section id and an object.");
    }
    renderers.set(sectionId, renderer);
  };

  window.teardownChapter8Lesson = runCleanup;

  window.mountChapter8Lesson = function mountChapter8Lesson(section, root) {
    runCleanup();
    if (!section?.id || !root) return;
    const renderer = renderers.get(section.id);
    if (!renderer) return;
    const cleanups = [];
    const formal = root.querySelector(`#${CSS.escape(section.id)}-formal`);
    const interactive = root.querySelector(`#${CSS.escape(section.id)}-interactive`);
    [renderer.formal?.(formal, section, root), renderer.interactive?.(interactive, section, root)].forEach((cleanup) => {
      if (typeof cleanup === "function") cleanups.push(cleanup);
    });
    activeCleanup = () => cleanups.splice(0).reverse().forEach((cleanup) => cleanup());
  };

  window.addEventListener("hashchange", runCleanup);
  window.addEventListener("pagehide", runCleanup);
})();
