/* Stable pointer dragging for Chapter 7 story ranges.
 * Native range inputs remain focusable and keyboard-accessible. Pointer input
 * is mapped across the full visible track so a drag never degrades to clicks.
 */
(() => {
  const selector = '.ch7-story-range input[type="range"]';
  let active = null;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function update(input, clientX) {
    if (!input?.isConnected || !Number.isFinite(clientX)) return;
    const rect = input.getBoundingClientRect();
    if (!rect.width) return;
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const step = Math.abs(Number(input.step || 1)) || 1;
    const raw = min + clamp((clientX - rect.left) / rect.width, 0, 1) * (max - min);
    const value = clamp(min + Math.round((raw - min) / step) * step, min, max);
    const next = Number(value.toFixed(10));
    if (Number(input.value) === next) return;
    input.value = String(next);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  document.addEventListener("pointerdown", (event) => {
    const input = event.target instanceof Element ? event.target.closest(selector) : null;
    if (!input || (event.button !== 0 && event.button !== -1)) return;
    active = { input, pointerId: event.pointerId };
    input.focus({ preventScroll: true });
    input.setPointerCapture?.(event.pointerId);
    update(input, event.clientX);
    document.documentElement.dataset.ch7StoryDragging = "range";
    event.preventDefault();
  }, { capture: true, passive: false });

  window.addEventListener("pointermove", (event) => {
    if (!active || active.pointerId !== event.pointerId) return;
    update(active.input, event.clientX);
    event.preventDefault();
  }, { capture: true, passive: false });

  const finish = (event) => {
    if (!active || active.pointerId !== event.pointerId) return;
    update(active.input, event.clientX);
    if (active.input.hasPointerCapture?.(event.pointerId)) {
      active.input.releasePointerCapture(event.pointerId);
    }
    active = null;
    delete document.documentElement.dataset.ch7StoryDragging;
    event.preventDefault();
  };

  window.addEventListener("pointerup", finish, { capture: true, passive: false });
  window.addEventListener("pointercancel", finish, { capture: true, passive: false });
})();
