(() => {
  const toc = document.querySelector("#pageToc");
  if (!toc) return;

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const BASE_WIDTH = 14;
  const MAX_WIDTH = 44;
  const INFLUENCE_RADIUS = 66;

  let railList = null;
  let railItems = [];
  let rafId = 0;
  let pendingPointerY = null;

  function smoothstep(value) {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  }

  function resetWave() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    pendingPointerY = null;
    railItems.forEach((item) => item.style.removeProperty("--toc-rail-width"));
  }

  function applyWave(pointerY) {
    rafId = 0;
    if (!railItems.length || !finePointer.matches) return;

    railItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const distance = Math.abs(pointerY - centerY);
      const influence = smoothstep(1 - distance / INFLUENCE_RADIUS);
      const width = BASE_WIDTH + (MAX_WIDTH - BASE_WIDTH) * influence;
      item.style.setProperty("--toc-rail-width", `${width.toFixed(2)}px`);
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
      toc.classList.remove("has-toc-rail");
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

      link.classList.add("toc-rail-item");
      link.setAttribute("aria-label", title);
      link.setAttribute("title", title);
      link.setAttribute("role", "listitem");
      link.replaceChildren(bar);
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
