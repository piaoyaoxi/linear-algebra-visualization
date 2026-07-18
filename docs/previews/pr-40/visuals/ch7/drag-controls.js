/* Stable continuous dragging for Chapter 7 cinematic controls.
 * Native range inputs remain keyboard-accessible. Pointer state lives on the
 * lesson container, so SVG redraws cannot interrupt a drag in progress.
 */
(() => {
  const labelSelector = ".ch7-cinema-range";
  const inputSelector = '.ch7-cinema-controls input[type="range"]';
  const svgSelector = ".ch7-cinema-svg";
  let active = null;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function inputAt(target, clientX, clientY) {
    if (target instanceof Element) {
      if (target.matches(inputSelector)) return target;
      const labelled = target.closest(labelSelector)?.querySelector('input[type="range"]');
      if (labelled) return labelled;
    }
    return [...document.querySelectorAll(inputSelector)].find((input) => {
      const rect = input.getBoundingClientRect();
      return clientX >= rect.left - 4 && clientX <= rect.right + 4
        && clientY >= rect.top - 10 && clientY <= rect.bottom + 10;
    }) || null;
  }

  function sceneAt(target, clientX, clientY) {
    let svg = target instanceof Element ? target.closest(svgSelector) : null;
    if (!svg) {
      svg = [...document.querySelectorAll(svgSelector)].find((candidate) => {
        const rect = candidate.getBoundingClientRect();
        return clientX >= rect.left && clientX <= rect.right
          && clientY >= rect.top && clientY <= rect.bottom;
      }) || null;
    }
    const lab = svg?.closest(".ch7-cinema-lab");
    const input = lab?.querySelector('.ch7-cinema-controls input[data-key="angle"]');
    return lab && input ? { lab, input } : null;
  }

  function setInputValue(input, value) {
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const step = Math.abs(Number(input.step || 1)) || 1;
    const stepped = min + Math.round((value - min) / step) * step;
    const next = clamp(Number(stepped.toFixed(10)), min, max);
    if (Number(input.value) === next) return;
    input.value = String(next);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function updateRange(input, clientX) {
    if (!input?.isConnected || !Number.isFinite(clientX)) return;
    const rect = input.getBoundingClientRect();
    if (!rect.width) return;
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    setInputValue(input, min + clamp((clientX - rect.left) / rect.width, 0, 1) * (max - min));
  }

  function updateScene(scene, clientX, clientY) {
    if (!scene?.lab?.isConnected) return;
    const svg = scene.lab.querySelector(svgSelector);
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const viewBox = svg.viewBox?.baseVal;
    const vbX = viewBox?.x || 0;
    const vbY = viewBox?.y || 0;
    const vbWidth = viewBox?.width || 640;
    const vbHeight = viewBox?.height || 470;
    const x = vbX + (clientX - rect.left) / rect.width * vbWidth;
    const y = vbY + (clientY - rect.top) / rect.height * vbHeight;
    const cx = vbX + vbWidth / 2;
    const cy = vbY + vbHeight / 2;
    let angle = Math.atan2(cy - y, x - cx) * 180 / Math.PI;
    angle = ((angle % 180) + 180) % 180;
    setInputValue(scene.input, angle);
  }

  function mark(kind) {
    document.documentElement.dataset.ch7Dragging = kind;
  }

  function clearActive() {
    active = null;
    delete document.documentElement.dataset.ch7Dragging;
  }

  document.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;
    const input = inputAt(event.target, event.clientX, event.clientY);
    if (input) {
      active = { kind: "range-mouse", input };
      input.focus({ preventScroll: true });
      updateRange(input, event.clientX);
      mark(active.kind);
      event.preventDefault();
      return;
    }
    const scene = sceneAt(event.target, event.clientX, event.clientY);
    if (!scene) return;
    active = { kind: "scene-mouse", scene };
    updateScene(scene, event.clientX, event.clientY);
    mark(active.kind);
    event.preventDefault();
  }, { capture: true, passive: false });

  window.addEventListener("mousemove", (event) => {
    if (active?.kind === "range-mouse") updateRange(active.input, event.clientX);
    else if (active?.kind === "scene-mouse") updateScene(active.scene, event.clientX, event.clientY);
    else return;
    event.preventDefault();
  }, { capture: true, passive: false });

  window.addEventListener("mouseup", (event) => {
    if (!active || event.button !== 0 || !active.kind.endsWith("-mouse")) return;
    if (active.kind === "range-mouse") updateRange(active.input, event.clientX);
    else updateScene(active.scene, event.clientX, event.clientY);
    clearActive();
    event.preventDefault();
  }, { capture: true, passive: false });

  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" || (event.button !== 0 && event.button !== -1)) return;
    const input = inputAt(event.target, event.clientX, event.clientY);
    if (input) {
      active = { kind: "range-pointer", id: event.pointerId, input };
      input.focus({ preventScroll: true });
      input.setPointerCapture?.(event.pointerId);
      updateRange(input, event.clientX);
    } else {
      const scene = sceneAt(event.target, event.clientX, event.clientY);
      if (!scene) return;
      active = { kind: "scene-pointer", id: event.pointerId, scene };
      updateScene(scene, event.clientX, event.clientY);
    }
    mark(active.kind);
    event.preventDefault();
  }, { capture: true, passive: false });

  window.addEventListener("pointermove", (event) => {
    if (!active?.kind.endsWith("-pointer") || active.id !== event.pointerId) return;
    if (active.kind === "range-pointer") updateRange(active.input, event.clientX);
    else updateScene(active.scene, event.clientX, event.clientY);
    event.preventDefault();
  }, { capture: true, passive: false });

  const endPointer = (event) => {
    if (!active?.kind.endsWith("-pointer") || active.id !== event.pointerId) return;
    if (active.kind === "range-pointer") updateRange(active.input, event.clientX);
    else updateScene(active.scene, event.clientX, event.clientY);
    if (active.input?.hasPointerCapture?.(event.pointerId)) active.input.releasePointerCapture(event.pointerId);
    clearActive();
    event.preventDefault();
  };
  window.addEventListener("pointerup", endPointer, { capture: true, passive: false });
  window.addEventListener("pointercancel", endPointer, { capture: true, passive: false });

  window.__ch7DragControlsReady = true;
})();
