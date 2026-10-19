/* Compatibility hooks for the focused Chapter 1 motion upgrades. */
(() => {
  "use strict";

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

  defineChapterEnhancer("ch1", (section, root) => {
    if (!section?.id || !root) return;
    root.querySelector(`#${CSS.escape(section.id)}-interactive .ch1-motion-head`)?.classList.add("ch1-lab-head");
  });
})();
