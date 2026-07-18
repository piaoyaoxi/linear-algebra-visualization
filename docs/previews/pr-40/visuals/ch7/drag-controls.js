/* Stable pointer dragging for Chapter 7 cinematic range controls.
 * Native range inputs remain keyboard-accessible; this layer guarantees
 * continuous mouse, pen, and touch tracking across browsers.
 */
(() => {
  const selector = '.ch7-cinema-range input[type="range"]';
  let active = null;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function updateFromPointer(input, event) {
    const rect = input.getBoundingClientRect();
    if (!rect.width) return;
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const step = Number(input.step || 1);
    const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const raw = min + ratio * (max - min);
    const stepped = min + Math.round((raw - min) / step) * step;
    const next = clamp(Number(stepped.toFixed(10)), min, max);
    if (Number(input.value) === next) return;
    input.value = String(next);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  document.addEventListener("pointerdown", (event) => {
    const input = event.target.closest?.(selector);
    if (!input || (event.pointerType === "mouse" && event.button !== 0)) return;
    active = { input, pointerId: event.pointerId };
    input.setPointerCapture?.(event.pointerId);
    updateFromPointer(input, event);
    input.focus({ preventScroll: true });
    event.preventDefault();
  }, { passive: false });

  document.addEventListener("pointermove", (event) => {
    if (!active || active.pointerId !== event.pointerId) return;
    updateFromPointer(active.input, event);
    event.preventDefault();
  }, { passive: false });

  const finish = (event) => {
    if (!active || active.pointerId !== event.pointerId) return;
    updateFromPointer(active.input, event);
    if (active.input.hasPointerCapture?.(event.pointerId)) {
      active.input.releasePointerCapture(event.pointerId);
    }
    active = null;
    event.preventDefault();
  };

  document.addEventListener("pointerup", finish, { passive: false });
  document.addEventListener("pointercancel", finish, { passive: false });
})();
