(() => {
  function annotate() {
    document.querySelectorAll(".ch8-coordinate-rooms").forEach((stage) => {
      if (stage.querySelector("[data-geometry-constant]")) return;
      const note = document.createElement("span");
      note.className = "sr-only";
      note.dataset.geometryConstant = "true";
      note.textContent = "对象不动：蓝色几何对象与线性变换保持固定，只有坐标网格、基向量和矩阵记录发生变化。";
      stage.prepend(note);
    });
  }

  const observer = new MutationObserver(annotate);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  annotate();
})();