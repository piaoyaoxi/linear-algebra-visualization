/* Attach Chapter 7 story modules after the generic lesson shell renders. */
(() => {
  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  const rangeSelector = '.ch7-story-range input[type="range"]';
  const rangeLabelSelector = ".ch7-story-range";
  const eigenSvgSelector = '.ch7-story[data-story="eigenvalues-eigenvectors"] .ch7-story-svg';
  let activeRange = null;
  let activeScene = null;
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

  function findEigenScene(target, clientX, clientY) {
    const direct = target instanceof Element ? target.closest(eigenSvgSelector) : null;
    if (direct) return direct;
    const svg = document.querySelector(eigenSvgSelector);
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right
      && clientY >= rect.top && clientY <= rect.bottom ? svg : null;
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

  function updateEigenScene(clientX, clientY) {
    const svg = document.querySelector(eigenSvgSelector);
    const input = svg?.closest(".ch7-story")?.querySelector('input[data-key="angle"]');
    if (!svg || !input || !Number.isFinite(clientX) || !Number.isFinite(clientY)) return;
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const viewBox = svg.viewBox?.baseVal;
    const vbX = viewBox?.x || 0;
    const vbY = viewBox?.y || 0;
    const vbWidth = viewBox?.width || 980;
    const vbHeight = viewBox?.height || 570;
    const x = vbX + ((clientX - rect.left) / rect.width) * vbWidth;
    const y = vbY + ((clientY - rect.top) / rect.height) * vbHeight;
    const centerX = 85 + 700 / 2;
    const centerY = 55 + 470 / 2;
    let angle = Math.atan2(centerY - y, x - centerX) * 180 / Math.PI;
    angle = ((angle % 180) + 180) % 180;
    const next = Math.round(angle);
    if (Number(input.value) === next) return;
    input.value = String(next);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function clearDrag() {
    activeRange = null;
    activeScene = null;
    delete document.documentElement.dataset.ch7StoryDragging;
  }

  document.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;
    const input = findRange(event.target, event.clientX, event.clientY);
    if (input) {
      activeRange = { input, kind: "mouse" };
      input.focus({ preventScroll: true });
      updateRange(input, event.clientX);
      document.documentElement.dataset.ch7StoryDragging = "range";
      event.preventDefault();
      return;
    }
    const scene = findEigenScene(event.target, event.clientX, event.clientY);
    if (!scene) return;
    activeScene = { kind: "mouse" };
    updateEigenScene(event.clientX, event.clientY);
    document.documentElement.dataset.ch7StoryDragging = "scene";
    event.preventDefault();
  }, { capture: true, passive: false });

  window.addEventListener("mousemove", (event) => {
    if (activeRange?.kind === "mouse") updateRange(activeRange.input, event.clientX);
    else if (activeScene?.kind === "mouse") updateEigenScene(event.clientX, event.clientY);
    else return;
    event.preventDefault();
  }, { capture: true, passive: false });

  window.addEventListener("mouseup", (event) => {
    if (event.button !== 0 || (!activeRange && !activeScene)) return;
    if (activeRange?.kind === "mouse") updateRange(activeRange.input, event.clientX);
    else if (activeScene?.kind === "mouse") updateEigenScene(event.clientX, event.clientY);
    clearDrag();
    event.preventDefault();
  }, { capture: true, passive: false });

  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" || (event.button !== 0 && event.button !== -1)) return;
    const input = findRange(event.target, event.clientX, event.clientY);
    if (input) {
      activeRange = { input, kind: "pointer", id: event.pointerId };
      input.focus({ preventScroll: true });
      input.setPointerCapture?.(event.pointerId);
      updateRange(input, event.clientX);
      document.documentElement.dataset.ch7StoryDragging = "range";
      event.preventDefault();
      return;
    }
    const scene = findEigenScene(event.target, event.clientX, event.clientY);
    if (!scene) return;
    activeScene = { kind: "pointer", id: event.pointerId };
    scene.setPointerCapture?.(event.pointerId);
    updateEigenScene(event.clientX, event.clientY);
    document.documentElement.dataset.ch7StoryDragging = "scene";
    event.preventDefault();
  }, { capture: true, passive: false });

  window.addEventListener("pointermove", (event) => {
    if (activeRange?.kind === "pointer" && activeRange.id === event.pointerId) {
      updateRange(activeRange.input, event.clientX);
    } else if (activeScene?.kind === "pointer" && activeScene.id === event.pointerId) {
      updateEigenScene(event.clientX, event.clientY);
    } else {
      return;
    }
    event.preventDefault();
  }, { capture: true, passive: false });

  const finishPointer = (event) => {
    if (activeRange?.kind === "pointer" && activeRange.id === event.pointerId) {
      updateRange(activeRange.input, event.clientX);
      if (activeRange.input.hasPointerCapture?.(event.pointerId)) activeRange.input.releasePointerCapture(event.pointerId);
    } else if (activeScene?.kind === "pointer" && activeScene.id === event.pointerId) {
      updateEigenScene(event.clientX, event.clientY);
      const scene = document.querySelector(eigenSvgSelector);
      if (scene?.hasPointerCapture?.(event.pointerId)) scene.releasePointerCapture(event.pointerId);
    } else {
      return;
    }
    clearDrag();
    event.preventDefault();
  };
  window.addEventListener("pointerup", finishPointer, { capture: true, passive: false });
  window.addEventListener("pointercancel", finishPointer, { capture: true, passive: false });

  window.renderLessonPage = function renderLessonPageWithChapter7Extensions(section, chapter) {
    window.teardownChapter7Lesson?.();
    clearDrag();
    baseRenderLessonPage(section, chapter);
    const owner = chapter || window.findStructuredSection?.(section?.id)?.chapter;
    if (owner?.id === "ch7") {
      window.mountChapter7Lesson?.(section, document.querySelector("#mainContent"));
    }
  };
})();
