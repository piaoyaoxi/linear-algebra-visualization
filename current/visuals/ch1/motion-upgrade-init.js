/* Ensure the division scene receives its exact step data before the first resize paint. */
(() => {
  "use strict";
  const math = window.Ch1Math;
  if (!math?.observeCanvas || math.observeCanvas.__ch1MotionDeferred) return;
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
})();
