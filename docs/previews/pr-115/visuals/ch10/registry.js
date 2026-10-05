/* Chapter 10 renderer registry with deterministic teardown. */
(() => {
  const renderers = new Map();
  let activeCleanup = null;

  function runCleanup() {
    if (typeof activeCleanup === "function") {
      try {
        activeCleanup();
      } catch (error) {
        console.warn("Chapter 10 teardown failed", error);
      }
    }
    activeCleanup = null;
  }

  window.defineChapter10Renderer = function defineChapter10Renderer(sectionId, renderer) {
    if (!sectionId || !renderer || typeof renderer !== "object") {
      throw new TypeError("Chapter 10 renderers require a section id and an object.");
    }
    renderers.set(sectionId, renderer);
  };

  window.teardownChapter10Lesson = runCleanup;

  window.mountChapter10Lesson = function mountChapter10Lesson(section, root) {
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
