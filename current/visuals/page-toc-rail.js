(() => {
  const toc = document.querySelector("#pageToc");
  if (!toc) return;

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const BASE_WIDTH = 14;
  const MAX_WIDTH = 44;
  const INFLUENCE_RADIUS = 66;
  const COLOR_IDLE = [166, 170, 167];
  const COLOR_HOT = [55, 60, 58];
  const COLOR_IDLE_DARK = [168, 176, 172];

  let railList = null;
  let railItems = [];
  let rafId = 0;
  let pendingPointerY = null;

  function smoothstep(value) {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  }

  function isDarkMode() {
    return document.body.classList.contains("dark");
  }

  function mixColor(from, to, t) {
    const r = Math.round(from[0] + (to[0] - from[0]) * t);
    const g = Math.round(from[1] + (to[1] - from[1]) * t);
    const b = Math.round(from[2] + (to[2] - from[2]) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function clearWaveStyles() {
    railItems.forEach((item) => {
      item.style.removeProperty("--toc-rail-width");
      item.style.removeProperty("--toc-rail-color");
      item.classList.remove("is-hot");
    });
  }

  function resetWave() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    pendingPointerY = null;
    toc.classList.remove("is-hovering");
    clearWaveStyles();
  }

  function applyWave(pointerY) {
    rafId = 0;
    if (!railItems.length || !finePointer.matches) return;

    toc.classList.add("is-hovering");
    // Light: pale gray → deep gray under the pointer.
    // Dark: muted gray → brighter light gray under the pointer.
    const idleColor = isDarkMode() ? COLOR_IDLE_DARK : COLOR_IDLE;
    const hotColor = isDarkMode() ? [236, 240, 238] : COLOR_HOT;

    let bestItem = null;
    let bestInfluence = 0;

    railItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const distance = Math.abs(pointerY - centerY);
      const influence = smoothstep(1 - distance / INFLUENCE_RADIUS);
      const width = BASE_WIDTH + (MAX_WIDTH - BASE_WIDTH) * influence;
      // Soft falloff: only strong proximity picks up color.
      const colorT = Math.pow(influence, 1.35);
      item.style.setProperty("--toc-rail-width", `${width.toFixed(2)}px`);
      item.style.setProperty("--toc-rail-color", mixColor(idleColor, hotColor, colorT));
      if (influence > bestInfluence) {
        bestInfluence = influence;
        bestItem = item;
      }
    });

    railItems.forEach((item) => {
      item.classList.toggle("is-hot", item === bestItem && bestInfluence > 0.28);
    });
  }

  function queueWave(pointerY) {
    pendingPointerY = pointerY;
    if (rafId) return;
    rafId = requestAnimationFrame(() => applyWave(pendingPointerY));
  }

  function bindRailInteractions() {
    if (!railList || railList.dataset.railBound === "true") return;
    railList.dataset.railBound = "true";

    railList.addEventListener("pointermove", (event) => queueWave(event.clientY), { passive: true });
    railList.addEventListener("pointerleave", resetWave);
  }

  function transformToc() {
    if (toc.querySelector(".toc-rail-list")) return;

    const links = [...toc.querySelectorAll("a[data-toc-link][data-scroll-to]")];
    if (!links.length) {
      toc.classList.remove("has-toc-rail", "is-hovering");
      return;
    }

    railList = document.createElement("div");
    railList.className = "toc-rail-list";
    railList.setAttribute("role", "list");

    links.forEach((link) => {
      const title = link.textContent.trim() || link.dataset.tocLink;
      const bar = document.createElement("span");
      bar.className = "toc-rail-bar";
      bar.setAttribute("aria-hidden", "true");

      const label = document.createElement("span");
      label.className = "toc-rail-label";
      label.textContent = title;
      label.setAttribute("aria-hidden", "true");

      link.classList.add("toc-rail-item");
      link.setAttribute("aria-label", title);
      link.removeAttribute("title");
      link.setAttribute("role", "listitem");
      link.replaceChildren(label, bar);
      railList.appendChild(link);
    });

    toc.replaceChildren(railList);
    toc.classList.add("has-toc-rail");
    railItems = [...railList.querySelectorAll(".toc-rail-item")];
    bindRailInteractions();
  }

  const observer = new MutationObserver(() => queueMicrotask(transformToc));
  observer.observe(toc, { childList: true, subtree: true });
  finePointer.addEventListener?.("change", resetWave);
  transformToc();
})();
