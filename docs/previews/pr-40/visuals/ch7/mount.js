/* Attach Chapter 7 story modules after the generic lesson shell renders. */
(() => {
  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  const rangeSelector = '.ch7-story-range input[type="range"]';
  let activeRange = null;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

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

  document.addEventListener("pointerdown", (event) => {
    const input = event.target instanceof Element ? event.target.closest(rangeSelector) : null;
    if (!input || (event.button !== 0 && event.button !== -1)) return;
    activeRange = { input, pointerId: event.pointerId };
    input.focus({ preventScroll: true });
    input.setPointerCapture?.(event.pointerId);
    updateRange(input, event.clientX);
    document.documentElement.dataset.ch7StoryDragging = "range";
    event.preventDefault();
  }, { capture: true, passive: false });

  window.addEventListener("pointermove", (event) => {
    if (!activeRange || activeRange.pointerId !== event.pointerId) return;
    updateRange(activeRange.input, event.clientX);
    event.preventDefault();
  }, { capture: true, passive: false });

  const finishRange = (event) => {
    if (!activeRange || activeRange.pointerId !== event.pointerId) return;
    updateRange(activeRange.input, event.clientX);
    if (activeRange.input.hasPointerCapture?.(event.pointerId)) {
      activeRange.input.releasePointerCapture(event.pointerId);
    }
    activeRange = null;
    delete document.documentElement.dataset.ch7StoryDragging;
    event.preventDefault();
  };
  window.addEventListener("pointerup", finishRange, { capture: true, passive: false });
  window.addEventListener("pointercancel", finishRange, { capture: true, passive: false });

  window.renderLessonPage = function renderLessonPageWithChapter7Extensions(section, chapter) {
    window.teardownChapter7Lesson?.();
    baseRenderLessonPage(section, chapter);
    const owner = chapter || window.findStructuredSection?.(section?.id)?.chapter;
    if (owner?.id === "ch7") {
      window.mountChapter7Lesson?.(section, document.querySelector("#mainContent"));
    }
  };
})();
