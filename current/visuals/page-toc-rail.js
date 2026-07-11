(() => {
  const toc = document.querySelector("#pageToc");
  if (!toc) return;

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const BASE_WIDTH = 14;
  const ACTIVE_WIDTH = 22;
  const MAX_WIDTH = 46;
  const INFLUENCE_RADIUS = 76;

  let railList = null;
  let railItems = [];
  let nearestItem = null;
  let rafId = 0;
  let pendingPointerY = null;

  function smoothstep(value) {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  }

  function clearPointerTarget() {
    if (nearestItem) nearestItem.classList.remove("is-pointer-target");
    nearestItem = null;
  }

  function resetWave() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    pendingPointerY = null;
    clearPointerTarget();
    railItems.forEach((item) => {
      item.style.removeProperty("--toc-rail-width");
      item.style.removeProperty("--toc-rail-opacity");
    });
  }

  function applyWave(pointerY) {
    rafId = 0;
    if (!railItems.length || !finePointer.matches) return;

    let closest = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    railItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const distance = Math.abs(pointerY - centerY);
      const influence = smoothstep(1 - distance / INFLUENCE_RADIUS);
      const baseline = item.classList.contains("is-active") ? ACTIVE_WIDTH : BASE_WIDTH;
      const width = baseline + (MAX_WIDTH - baseline) * influence;
      const opacity = 0.34 + 0.66 * influence;

      item.style.setProperty("--toc-rail-width", `${width.toFixed(2)}px`);
      item.style.setProperty("--toc-rail-opacity", opacity.toFixed(3));

      if (distance < closestDistance) {
        closestDistance = distance;
        closest = item;
      }
    });

    if (nearestItem !== closest) {
      clearPointerTarget();
      nearestItem = closest;
      nearestItem?.classList.add("is-pointer-target");
    }
  }

  function queueWave(pointerY) {
    pendingPointerY = pointerY;
    if (rafId) return;
    rafId = requestAnimationFrame(() => applyWave(pendingPointerY));
  }

  function applyKeyboardWave(targetIndex) {
    railItems.forEach((item, index) => {
      const stepDistance = Math.abs(index - targetIndex);
      const influence = smoothstep(1 - stepDistance / 3);
      const baseline = item.classList.contains("is-active") ? ACTIVE_WIDTH : BASE_WIDTH;
      const width = baseline + (MAX_WIDTH - baseline) * influence;
      item.style.setProperty("--toc-rail-width", `${width.toFixed(2)}px`);
      item.style.setProperty("--toc-rail-opacity", `${0.34 + 0.66 * influence}`);
    });
  }

  function bindRailInteractions() {
    if (!railList || railList.dataset.railBound === "true") return;
    railList.dataset.railBound = "true";

    railList.addEventListener("pointermove", (event) => queueWave(event.clientY), { passive: true });
    railList.addEventListener("pointerleave", resetWave);

    railList.addEventListener("focusin", (event) => {
      const item = event.target.closest(".toc-rail-item");
      if (!item) return;
      clearPointerTarget();
      nearestItem = item;
      item.classList.add("is-pointer-target");
      applyKeyboardWave(railItems.indexOf(item));
    });

    railList.addEventListener("focusout", (event) => {
      if (railList.contains(event.relatedTarget)) return;
      resetWave();
    });
  }

  function transformToc() {
    if (toc.querySelector(".toc-rail-shell")) return;

    const links = [...toc.querySelectorAll("a[data-toc-link][data-scroll-to]")];
    if (!links.length) {
      toc.classList.remove("has-toc-rail");
      return;
    }

    const shell = document.createElement("div");
    shell.className = "toc-rail-shell";

    railList = document.createElement("div");
    railList.className = "toc-rail-list";
    railList.setAttribute("role", "list");

    links.forEach((link) => {
      const title = link.textContent.trim() || link.dataset.tocLink;
      const label = document.createElement("span");
      label.className = "toc-rail-label";
      label.textContent = title;

      const bar = document.createElement("span");
      bar.className = "toc-rail-bar";
      bar.setAttribute("aria-hidden", "true");

      link.classList.add("toc-rail-item");
      link.setAttribute("aria-label", title);
      link.setAttribute("role", "listitem");
      link.replaceChildren(label, bar);
      railList.appendChild(link);
    });

    shell.appendChild(railList);
    toc.replaceChildren(shell);
    toc.classList.add("has-toc-rail");
    railItems = [...railList.querySelectorAll(".toc-rail-item")];
    bindRailInteractions();
  }

  const observer = new MutationObserver(() => {
    queueMicrotask(transformToc);
  });

  observer.observe(toc, { childList: true, subtree: true });
  finePointer.addEventListener?.("change", resetWave);
  reduceMotion.addEventListener?.("change", resetWave);
  transformToc();
})();
