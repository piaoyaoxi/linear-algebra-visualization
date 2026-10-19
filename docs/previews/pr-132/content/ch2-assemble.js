/* Apply Chapter 2 section patches after ch2.js registration. */
(() => {
  const chapter = algebraContent.chapters.find((item) => item.id === "ch2");
  const patches = window.getChapter2SectionPatches?.();
  if (!chapter || !patches) return;

  const order = [
    "determinant-intro",
    "permutations",
    "n-order-determinant",
    "determinant-properties",
    "determinant-computation",
    "cofactor-expansion",
    "cramer-rule",
    "laplace-and-product",
  ];

  const byId = new Map();
  for (const [id, patch] of patches.entries()) byId.set(id, patch);

  chapter.sections = order.map((id) => {
    const patch = byId.get(id);
    if (!patch) {
      console.warn("Missing Chapter 2 section patch:", id);
      return { id, number: "§?", title: id, navTitle: id };
    }
    return { id, ...patch };
  });
})();
