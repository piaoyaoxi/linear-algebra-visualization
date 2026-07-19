/* Chapter 7 presentation registry and lifecycle. */
(() => {
  if (!document.querySelector("#ch7-story-final-polish")) {
    const style = document.createElement("style");
    style.id = "ch7-story-final-polish";
    style.textContent = `
      .ch7-story-label,
      .ch7-story-caption {
        stroke-width: 1.8px;
      }

      .ch7-story-big-label,
      .ch7-story-matrix-text,
      .ch7-story-node-text {
        stroke-width: 3px;
      }

      @media (max-width: 620px) {
        .ch7-story-label,
        .ch7-story-caption {
          stroke-width: 1.35px;
        }
      }
    `;
    document.head.append(style);
  }

  const renderers = new Map();
  const enhancers = [];
  let activeCleanups = [];

  function runCleanup() {
    activeCleanups.splice(0).forEach((cleanup) => {
      try {
        cleanup?.();
      } catch (error) {
        console.warn("Chapter 7 cleanup failed", error);
      }
    });
  }

  window.defineChapter7Renderer = function defineChapter7Renderer(sectionId, renderer) {
    if (!sectionId || !renderer || typeof renderer !== "object") {
      throw new TypeError("Chapter 7 renderers require a section id and an object.");
    }
    renderers.set(sectionId, renderer);
  };

  window.defineChapter7LessonEnhancer = function defineChapter7LessonEnhancer(enhancer) {
    if (typeof enhancer === "function") enhancers.push(enhancer);
  };

  window.teardownChapter7Lesson = runCleanup;

  window.mountChapter7Lesson = function mountChapter7Lesson(section, root) {
    if (!section?.id || !root) return;
    runCleanup();

    const renderer = renderers.get(section.id);
    if (renderer) {
      const formal = root.querySelector(`#${CSS.escape(section.id)}-formal`);
      const interactive = root.querySelector(`#${CSS.escape(section.id)}-interactive`);
      const formalCleanup = renderer.formal?.(formal, section, root);
      const interactiveCleanup = renderer.interactive?.(interactive, section, root);
      if (typeof formalCleanup === "function") activeCleanups.push(formalCleanup);
      if (typeof interactiveCleanup === "function") activeCleanups.push(interactiveCleanup);
    }

    enhancers.forEach((enhancer) => {
      const cleanup = enhancer(section, root);
      if (typeof cleanup === "function") activeCleanups.push(cleanup);
    });
  };
})();
