/* Stable continuous dragging for Chapter 7 cinematic range controls.
 * Native range inputs remain keyboard-accessible. This layer broadens the
 * hit target to the whole visible rail and keeps tracking outside the rail.
 */
(() => {
  const labelSelector = ".ch7-cinema-range";
  const inputSelector = '.ch7-cinema-controls input[type="range"]';
  let active = null;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function inputAt(target, clientX, clientY) {
    if (target instanceof Element) {
      if (target.matches(inputSelector)) return target;
      const labelled = target.closest(labelSelector)?.querySelector('input[type="range"]');
      if (labelled) return labelled;
    }
    // Some engines expose the painted range track through native shadow DOM.
    // In that case the event target is not the light-DOM input, so hit-test the
    // actual input rectangles instead of losing the drag.
    return [...document.querySelectorAll(inputSelector)].find((input) => {
      const rect = input.getBoundingClientRect();
      return clientX >= rect.left - 4 && clientX <= rect.right + 4
        && clientY >= rect.top - 10 && clientY <= rect.bottom + 10;
    }) || null;
  }

  function updateAt(input, clientX) {
    if (!input?.isConnected || !Number.isFinite(clientX)) return;
    const rect = input.getBoundingClientRect();
    if (!rect.width) return;
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const step = Math.abs(Number(input.step || 1)) || 1;
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    const raw = min + ratio * (max - min);
    const stepped = min + Math.round((raw - min) / step) * step;
    const next = clamp(Number(stepped.toFixed(10)), min, max);
    if (Number(input.value) === next) return;
    input.value = String(next);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function begin(input, kind, id, clientX) {
    active = { input, kind, id };
    input.focus({ preventScroll: true });
    updateAt(input, clientX);
    document.documentElement.dataset.ch7RangeDragging = kind;
  }

  function clearActive() {
    active = null;
    delete document.documentElement.dataset.ch7RangeDragging;
  }

  document.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;
    const input = inputAt(event.target, event.clientX, event.clientY);
    if (!input) return;
    begin(input, "mouse", 0, event.clientX);
    event.preventDefault();
  }, { capture: true, passive: false });

  window.addEventListener("mousemove", (event) => {
    if (active?.kind !== "mouse") return;
    updateAt(active.input, event.clientX);
    event.preventDefault();
  }, { capture: true, passive: false });

  window.addEventListener("mouseup", (event) => {
    if (active?.kind !== "mouse" || event.button !== 0) return;
    updateAt(active.input, event.clientX);
    clearActive();
    event.preventDefault();
  }, { capture: true, passive: false });

  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" || (event.button !== 0 && event.button !== -1)) return;
    const input = inputAt(event.target, event.clientX, event.clientY);
    if (!input) return;
    begin(input, "pointer", event.pointerId, event.clientX);
    input.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }, { capture: true, passive: false });

  window.addEventListener("pointermove", (event) => {
    if (active?.kind !== "pointer" || active.id !== event.pointerId) return;
    updateAt(active.input, event.clientX);
    event.preventDefault();
  }, { capture: true, passive: false });

  const endPointer = (event) => {
    if (active?.kind !== "pointer" || active.id !== event.pointerId) return;
    updateAt(active.input, event.clientX);
    if (active.input.hasPointerCapture?.(event.pointerId)) active.input.releasePointerCapture(event.pointerId);
    clearActive();
    event.preventDefault();
  };
  window.addEventListener("pointerup", endPointer, { capture: true, passive: false });
  window.addEventListener("pointercancel", endPointer, { capture: true, passive: false });

  window.__ch7DragControlsReady = true;
})();
