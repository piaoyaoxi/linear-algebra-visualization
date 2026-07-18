/* Compatibility hooks for the focused Chapter 1 motion upgrades. */
(() => {
  "use strict";

  if (!document.querySelector('link[href*="repair-pass-final.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "./visuals/ch1/repair-pass-final.css?v=ch1-repair-final1";
    document.head.append(link);
  }

  const math = window.Ch1Math;
  if (math?.observeCanvas && !math.observeCanvas.__ch1MotionDeferred) {
    const baseObserveCanvas = math.observeCanvas;
    math.observeCanvas = function observeCanvasAfterState(root, draw) {
      if (!root?.classList?.contains("ch1-division-canvas-shell")) return baseObserveCanvas(root, draw);
      let queued = false;
      const deferredDraw = () => {
        if (queued) return;
        queued = true;
        queueMicrotask(() => {
          queued = false;
          if (root.isConnected) draw();
        });
      };
      return baseObserveCanvas(root, deferredDraw);
    };
    math.observeCanvas.__ch1MotionDeferred = true;
  }

  if (typeof window.mountChapter1Lesson === "function" && !window.mountChapter1Lesson.__ch1MotionHeadCompatible) {
    const baseMountChapter1Lesson = window.mountChapter1Lesson;
    const compatibleMount = function mountChapter1LessonWithMotionHead(section, root) {
      baseMountChapter1Lesson(section, root);
      if (!section?.id || !root) return;
      root.querySelector(`#${CSS.escape(section.id)}-interactive .ch1-motion-head`)?.classList.add("ch1-lab-head");
    };
    compatibleMount.__ch1MotionHeadCompatible = true;
    window.mountChapter1Lesson = compatibleMount;
  }
})();
