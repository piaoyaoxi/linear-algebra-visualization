/* Attach Chapter 5 presentation modules after the generic lesson shell renders. */
(() => {
  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  const taskCopy = {
    "quadratic-matrix": ["先看两个红点的高度", "切换剪切与奇异压缩，判断矩阵变化究竟只是换坐标，还是已经丢失方向。"],
    "quadratic-standard-form": ["先看等高线的倾斜", "逐步配方，直到新变量下交叉项消失，并同时核对行列式和秩。"],
    "quadratic-uniqueness": ["先盯住向上、向下的方向", "选好预测后拖动剪切参数 h，看曲面和符号轮怎样变；再让替换奇异，比较定理前提何时停止。"],
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
