/* Stable continuous dragging for Chapter 7 cinematic range controls.
 * Native range inputs remain keyboard-accessible. This layer broadens the
 * hit target to the whole labelled rail and keeps tracking outside the rail.
 */
(() => {
  const labelSelector = ".ch7-cinema-range";
  const inputSelector = 'input[type="range"]';
  let active = null;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function resolveInput(target) {
    if (!(target instanceof Element)) return null;
    if (target.matches(`${labelSelector} ${inputSelector}`)) return target;
    return target.closest(labelSelector)?.querySelector(inputSelector) || null;
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
  }

  // Mouse fallback is intentionally independent from Pointer Events. Chromium,
  // Safari and embedded webviews do not always expose identical pointer events
  // for a restyled native range input.
  document.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;
    const input = resolveInput(event.target);
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
    active = null;
    event.preventDefault();
  }, { capture: true, passive: false });

  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" || (event.button !== 0 && event.button !== -1)) return;
    const input = resolveInput(event.target);
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
    active = null;
    event.preventDefault();
  };
  window.addEventListener("pointerup", endPointer, { capture: true, passive: false });
  window.addEventListener("pointercancel", endPointer, { capture: true, passive: false });

  window.__ch7DragControlsReady = true;
})();
