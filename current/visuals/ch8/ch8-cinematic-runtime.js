(() => {
  const traceValues = {
    11: { left: "λ", right: "2", result: "λ − 2" },
    12: { left: "0", right: "1", result: "−1" },
    21: { left: "0", right: "0", result: "0" },
    22: { left: "λ", right: "2", result: "λ − 2" },
  };

  function patchLambdaTrace() {
    document.querySelectorAll(".ch8-lambda-story .ch8-trace-formula").forEach((formula) => {
      const story = formula.closest(".ch8-lambda-story");
      const activeCell = story?.querySelector(".ch8-click-matrix [data-build-cell].is-active")?.dataset.buildCell || "11";
      if (formula.dataset.traceCell === activeCell) return;
      const value = traceValues[activeCell] || traceValues[11];
      formula.dataset.traceCell = activeCell;
      formula.innerHTML = `
        <span class="tex-inline ch8-trace-plain">${value.left}</span>
        <i aria-hidden="true">−</i>
        <span class="tex-inline ch8-trace-plain">${value.right}</span>
        <i aria-hidden="true">=</i>
        <strong><span class="tex-inline ch8-trace-plain">${value.result}</span></strong>`;
    });
  }

  function annotate() {
    document.querySelectorAll(".ch8-coordinate-rooms").forEach((stage) => {
      if (stage.querySelector("[data-geometry-constant]")) return;
      const note = document.createElement("span");
      note.className = "sr-only";
      note.dataset.geometryConstant = "true";
      note.textContent = "对象不动：蓝色几何对象与线性变换保持固定，只有坐标网格、基向量和矩阵记录发生变化。";
      stage.prepend(note);
    });
    patchLambdaTrace();
  }

  const observer = new MutationObserver(annotate);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  annotate();
})();
