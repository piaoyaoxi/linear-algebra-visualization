/* Chapter 6 presentation registry with deterministic teardown. */
(() => {
  const renderers = new Map();
  let activeCleanup = null;

  function runCleanup() {
    if (typeof activeCleanup === "function") {
      try {
        activeCleanup();
      } catch (error) {
        console.warn("Chapter 6 teardown failed", error);
      }
    }
    activeCleanup = null;
  }

  window.defineChapter6Renderer = function defineChapter6Renderer(sectionId, renderer) {
    if (!sectionId || !renderer || typeof renderer !== "object") {
      throw new TypeError("Chapter 6 renderers require a section id and an object.");
    }
    renderers.set(sectionId, { ...(renderers.get(sectionId) || {}), ...renderer });
  };

  window.teardownChapter6Lesson = runCleanup;

  window.mountChapter6Lesson = function mountChapter6Lesson(section, root) {
    runCleanup();
    if (!section?.id || !root) return;
    const renderer = renderers.get(section.id);
    if (!renderer) return;
    const cleanups = [];
    const formal = root.querySelector(`#${CSS.escape(section.id)}-formal`);
    const interactive = root.querySelector(`#${CSS.escape(section.id)}-interactive`);
    const formalCleanup = renderer.formal?.(formal, section, root);
    const interactiveCleanup = renderer.interactive?.(interactive, section, root);
    if (typeof formalCleanup === "function") cleanups.push(formalCleanup);
    if (typeof interactiveCleanup === "function") cleanups.push(interactiveCleanup);
    activeCleanup = () => cleanups.splice(0).reverse().forEach((cleanup) => cleanup());
  };

  window.addEventListener("hashchange", runCleanup);
  window.addEventListener("pagehide", runCleanup);
})();
