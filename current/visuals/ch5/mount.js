/* Attach Chapter 5 presentation modules after the generic lesson shell renders. */
(() => {
  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  const taskCopy = {
    "quadratic-matrix": ["先看两个红点的高度", "切换剪切与奇异压缩，判断矩阵变化究竟只是换坐标，还是已经丢失方向。"],
    "quadratic-standard-form": ["先看曲面的主方向", "逐步配方，直到主方向对准新坐标轴，并同时核对交叉项、行列式和秩。"],
    "quadratic-uniqueness": ["先盯住正、负、零三个计数", "拖动剪切参数观察曲面扭曲；再让替换奇异，比较定理前提何时停止。"],
    "positive-definite": ["按碗面、山谷、马鞍的顺序观察", "每次先看三维曲面，再用方向轮、等高线和主子式确认同一个边界。"],
  };

  window.renderLessonPage = function renderLessonPageWithChapter5Extensions(section, chapter) {
    baseRenderLessonPage(section, chapter);
    const root = document.querySelector("#mainContent");
    window.mountChapter5Lesson?.(section, root);
    const lab = root?.querySelector(".qv-lab");
    if (!lab) return;
    lab.classList.add("ch5-lab");
    const copy = taskCopy[section?.id];
    const head = lab.querySelector(".qv-head");
    if (copy && head && !lab.querySelector(".ch5-task")) {
      head.insertAdjacentHTML(
        "afterend",
        `<div class="ch5-task qv-task"><span>1</span><div><strong>${copy[0]}</strong><p>${copy[1]}</p></div></div>`,
      );
    }
  };
})();
