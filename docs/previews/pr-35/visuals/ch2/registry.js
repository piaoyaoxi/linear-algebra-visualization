/* Chapter 2 presentation registry with lifecycle cleanup. */
(() => {
  const renderers = new Map();
  const enhancers = [];
  let activeCleanup = null;

  window.defineChapter2Renderer = function defineChapter2Renderer(sectionId, renderer) {
    if (!sectionId || !renderer || typeof renderer !== "object") {
      throw new TypeError("Chapter 2 renderers require a section id and an object.");
    }
    renderers.set(sectionId, renderer);
  };

  window.extendChapter2Renderer = function extendChapter2Renderer(sectionId, extension) {
    if (!sectionId || !extension || typeof extension !== "object") {
      throw new TypeError("Chapter 2 renderer extensions require a section id and an object.");
    }
    const current = renderers.get(sectionId) || {};
    renderers.set(sectionId, { ...current, ...extension });
  };

  window.defineChapter2LessonEnhancer = function defineChapter2LessonEnhancer(enhancer) {
    if (typeof enhancer === "function") enhancers.push(enhancer);
  };

  window.teardownChapter2Lesson = function teardownChapter2Lesson() {
    try {
      activeCleanup?.();
    } finally {
      activeCleanup = null;
    }
  };

  window.mountChapter2Lesson = function mountChapter2Lesson(section, root) {
    window.teardownChapter2Lesson();
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
    enhancers.forEach((enhancer) => {
      const cleanup = enhancer(section, root);
      if (typeof cleanup === "function") cleanups.push(cleanup);
    });
    activeCleanup = () => cleanups.reverse().forEach((cleanup) => cleanup());
  };
})();