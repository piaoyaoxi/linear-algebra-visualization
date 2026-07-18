/* Screenshot-pass behavior fixes loaded after the Chapter 2 story renderers. */
(() => {
  if (typeof window.defineChapter2LessonEnhancer !== "function") return;

  window.defineChapter2LessonEnhancer((section, root) => {
    if (section?.id !== "laplace-and-product") return undefined;

    const formula = root.querySelector("#laplace-and-product-interactive .ch2-story-formula");
    if (!formula) return undefined;

    const laplaceCells = [
      formula.querySelector("[data-lap-minor]")?.closest("div"),
      formula.querySelector("[data-lap-sign]")?.closest("div"),
      formula.querySelector("[data-lap-complement]")?.closest("div"),
    ].filter(Boolean);
    const productCells = [
      formula.querySelector("[data-product-da]")?.closest("div"),
      formula.querySelector("[data-product-db]")?.closest("div"),
      formula.querySelector("[data-product-dab]")?.closest("div"),
    ].filter(Boolean);
    const tabs = [...root.querySelectorAll("[data-story8-tab]")];

    function syncReadouts() {
      const productActive = root.querySelector('[data-story8-tab="product"]')?.classList.contains("is-active");
      laplaceCells.forEach((cell) => { cell.hidden = Boolean(productActive); });
      productCells.forEach((cell) => { cell.hidden = !productActive; });
    }

    tabs.forEach((button) => button.addEventListener("click", syncReadouts));
    syncReadouts();

    return () => {
      tabs.forEach((button) => button.removeEventListener("click", syncReadouts));
    };
  });
})();