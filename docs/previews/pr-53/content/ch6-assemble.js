/* Apply Chapter 6 section patches after ch6.js registration. */
(() => {
  const chapter = algebraContent.chapters.find((item) => item.id === "ch6");
  const patches = window.getChapter6SectionPatches?.();
  if (!chapter || !patches) return;

  const order = [
    "sets-maps",
    "vector-space-definition",
    "basis-coordinates",
    "change-of-basis",
    "subspaces",
    "intersection-sum",
    "direct-sum",
    "isomorphism",
  ];

  const byId = new Map();
  for (const [id, patch] of patches.entries()) byId.set(id, patch);

  chapter.sections = order.map((id) => {
    const patch = byId.get(id);
    if (!patch) {
      console.warn("Missing Chapter 6 section patch:", id);
      return { id, number: "§?", title: id, navTitle: id };
    }
    return { id, ...patch };
  });
})();
