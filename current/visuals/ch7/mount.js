/* Attach Chapter 7 story modules after the generic lesson shell renders. */
(() => {
  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  const rangeSelector = '.ch7-story-range input[type="range"]';
  const rangeLabelSelector = ".ch7-story-range";
  let activeRange = null;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function findRange(target, clientX, clientY) {
    if (target instanceof Element) {
      if (target.matches(rangeSelector)) return target;
      const labelled = target.closest(rangeLabelSelector)?.querySelector('input[type="range"]');
      if (labelled) return labelled;
    }
    return [...document.querySelectorAll(rangeSelector)].find((input) => {
      const rect = input.getBoundingClientRect();
      return clientX >= rect.left - 5 && clientX <= rect.right + 5
        && clientY >= rect.top - 14 && clientY <= rect.bottom + 14;
    }) || null;
  }

  function updateRange(input, clientX) {
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

  function beginRange(input, kind, id, clientX) {
    activeRange = { input, kind, id };
    input.focus({ preventScroll: true });
    updateRange(input, clientX);
    document.documentElement.dataset.ch7StoryDragging = "range";
  }

  function clearRange() {
    activeRange = null;
    delete document.documentElement.dataset.ch7StoryDragging;
  }

  document.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;
    const input = findRange(event.target, event.clientX, event.clientY);
    if (!input) return;
    beginRange(input, "mouse", 0, event.clientX);
    event.preventDefault();
  }, { capture: true, passive: false });

  window.addEventListener("mousemove", (event) => {
    if (activeRange?.kind !== "mouse") return;
    updateRange(activeRange.input, event.clientX);
    event.preventDefault();
  }, { capture: true, passive: false });

  window.addEventListener("mouseup", (event) => {
    if (activeRange?.kind !== "mouse" || event.button !== 0) return;
    updateRange(activeRange.input, event.clientX);
    clearRange();
    event.preventDefault();
  }, { capture: true, passive: false });

  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" || (event.button !== 0 && event.button !== -1)) return;
    const input = findRange(event.target, event.clientX, event.clientY);
    if (!input) return;
    beginRange(input, "pointer", event.pointerId, event.clientX);
    input.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }, { capture: true, passive: false });

  window.addEventListener("pointermove", (event) => {
    if (activeRange?.kind !== "pointer" || activeRange.id !== event.pointerId) return;
    updateRange(activeRange.input, event.clientX);
    event.preventDefault();
  }, { capture: true, passive: false });

  const finishPointer = (event) => {
    if (activeRange?.kind !== "pointer" || activeRange.id !== event.pointerId) return;
    updateRange(activeRange.input, event.clientX);
    if (activeRange.input.hasPointerCapture?.(event.pointerId)) {
      activeRange.input.releasePointerCapture(event.pointerId);
    }
    clearRange();
    event.preventDefault();
  };
  window.addEventListener("pointerup", finishPointer, { capture: true, passive: false });
  window.addEventListener("pointercancel", finishPointer, { capture: true, passive: false });

  window.renderLessonPage = function renderLessonPageWithChapter7Extensions(section, chapter) {
    window.teardownChapter7Lesson?.();
    baseRenderLessonPage(section, chapter);
    const owner = chapter || window.findStructuredSection?.(section?.id)?.chapter;
    if (owner?.id === "ch7") {
      window.mountChapter7Lesson?.(section, document.querySelector("#mainContent"));
    }
  };
})();
