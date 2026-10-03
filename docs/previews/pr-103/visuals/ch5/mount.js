/* Attach Chapter 5 presentation modules after the generic lesson shell renders. */
(() => {
  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  const taskCopy = {
    "quadratic-matrix": ["看两根高度杆", "选一种替换，比较两根杆的顶端是否落在同一个水平面上；再看 det C 判断是不是合同。"],
    "quadratic-standard-form": ["先看俯视小图里椭圆的倾斜", "逐步配方，直到新变量下交叉项消失；看椭圆的轴怎样摆正，并核对行列式和秩。"],
    "quadratic-uniqueness": ["先盯住向上、向下的方向", "选好预测后拖动剪切参数 h，看曲面和符号轮怎样变；再让替换奇异，比较定理前提何时停止。"],
    "positive-definite": ["把 t 从 0 往右拖", "先看曲面和它底面的等高线，再用方向轮和主子式核对同一个边界。"],
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
