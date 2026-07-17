/* Apply Chapter 1 section patches after ch1.js registration. */
(() => {
  const chapter = algebraContent.chapters.find((item) => item.id === "ch1");
  const patches = window.getChapter1SectionPatches?.();
  if (!chapter || !patches) return;

  const order = [
    "number-fields",
    "univariate-polynomials",
    "polynomial-divisibility",
    "gcd-polynomials",
    "factorization-theorem",
    "multiple-factors",
    "polynomial-functions",
    "complex-real-factorization",
    "rational-polynomials",
    "multivariate-polynomials",
    "symmetric-polynomials",
  ];

  const byId = new Map();
  for (const [id, patch] of patches.entries()) byId.set(id, patch);

  chapter.sections = order.map((id) => {
    const patch = byId.get(id);
    if (!patch) {
      console.warn("Missing Chapter 1 section patch:", id);
      return { id, number: "§?", title: id, navTitle: id };
    }
    return { id, ...patch };
  });
})();
