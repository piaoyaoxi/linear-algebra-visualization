/* Apply Chapter 3 section patches after ch3.js registration. */
(() => {
  const chapter = algebraContent.chapters.find((item) => item.id === "ch3");
  const patches = window.getChapter3SectionPatches?.();
  if (!chapter || !patches) return;

  const order = [
    "elimination",
    "n-vector-space",
    "linear-dependence",
    "matrix-rank",
    "solvability",
    "solution-structure",
    "binary-higher-degree",
  ];

  const byId = new Map();
  for (const [id, patch] of patches.entries()) byId.set(id, patch);

  chapter.sections = order.map((id) => {
    const patch = byId.get(id);
    if (!patch) {
      console.warn("Missing Chapter 3 section patch:", id);
      return { id, number: "§?", title: id, navTitle: id };
    }
    return { id, ...patch };
  });
})();
