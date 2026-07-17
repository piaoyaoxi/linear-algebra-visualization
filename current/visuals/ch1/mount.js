/* Attach Chapter 1 presentation modules after the generic lesson shell renders. */
(() => {
  const styleHref = "./visuals/ch1/refinement.css?v=ch1-final2";
  if (!document.querySelector(`link[href="${styleHref}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = styleHref;
    document.head.append(link);
  }

  // Compatibility for the original §9—§11 interaction modules. The rebuilt
  // exact engine keeps the new API, while these aliases preserve the accepted
  // interaction implementations already present on the PR branch.
  const math = window.Ch1Math;
  if (math) {
    math.polyFrom ||= math.poly;
    math.rCmp ||= ((a, b) => math.rToNum(a) - math.rToNum(b));
    if (!math.drawLattice.__ch1Compatibility) {
      const baseDrawLattice = math.drawLattice;
      const compatibleDrawLattice = function compatibleDrawLattice(...args) {
        const grid = baseDrawLattice(...args);
        if (!grid.hitTest) {
          grid.hitTest = (px, py) => {
            const point = grid.toIndex(px, py);
            const maxI = Math.round((grid.width - 2 * grid.pad) / grid.sx);
            const maxJ = Math.round((grid.height - 2 * grid.pad) / grid.sy);
            if (point.i < 0 || point.j < 0 || point.i > maxI || point.j > maxJ) return null;
            return point;
          };
        }
        return grid;
      };
      compatibleDrawLattice.__ch1Compatibility = true;
      math.drawLattice = compatibleDrawLattice;
    }
  }

  if (window.Ch1UI?.renderFormal && window.defineChapter1Renderer) {
    ["rational-polynomials", "multivariate-polynomials", "symmetric-polynomials"].forEach((sectionId) => {
      window.defineChapter1Renderer(sectionId, { formal: window.Ch1UI.renderFormal });
    });
  }

  function syncCoefficientDegreeLabels(root = document) {
    const slider = root.querySelector("[data-k]");
    if (!slider) return;
    root.querySelectorAll("[data-k-value]").forEach((node) => {
      node.textContent = slider.value;
    });
  }

  function correctNumberFieldComparison(root = document) {
    const lesson = root.querySelector("#number-fields-interactive");
    if (!lesson) return;
    const active = lesson.querySelector('[data-domain="Q2"].is-active');
    if (!active) return;
    lesson.querySelectorAll("[data-poly-table] tr").forEach((row) => {
      const formula = row.cells?.[0]?.textContent?.replace(/\s+/g, "") || "";
      if (formula.includes("x2−√2") || formula.includes("x2-√2") || formula.includes("x²−√2")) {
        row.cells[2].textContent = "不可约";
      }
    });
  }

  document.addEventListener("input", (event) => {
    if (event.target?.matches?.("[data-k]")) syncCoefficientDegreeLabels(document);
  });
  document.addEventListener("click", (event) => {
    if (event.target?.closest?.('[data-domain="Q2"]')) queueMicrotask(() => correctNumberFieldComparison(document));
  });

  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  window.addEventListener("hashchange", () => window.teardownChapter1Lesson?.());

  window.renderLessonPage = function renderLessonPageWithChapter1Extensions(section, chapter) {
    baseRenderLessonPage(section, chapter);
    const root = document.querySelector("#mainContent");
    window.mountChapter1Lesson?.(section, root);
    syncCoefficientDegreeLabels(root);
    correctNumberFieldComparison(root);
  };
})();
