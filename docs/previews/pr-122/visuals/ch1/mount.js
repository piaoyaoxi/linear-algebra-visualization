/* Attach Chapter 1 presentation modules, compatibility shims, and guided learning layouts. */
(() => {
  "use strict";

  const addStylesheet = (href) => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.append(link);
  };

  addStylesheet("./visuals/ch1/refinement.css?v=ch1-final2");
  addStylesheet("./visuals/ch1/learning-design.css?v=ch1-learning2");

  const math = window.Ch1Math;
  if (math) {
    math.polyFrom ||= math.poly;
    math.rCmp ||= ((a, b) => math.rToNum(a) - math.rToNum(b));
    if (math.drawLattice && !math.drawLattice.__ch1Compatibility) {
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

  // One section-specific conclusion per lab, shown after the lab itself.
  const t = (source) => (window.texInline ? window.texInline(source) : source);
  const takeaways = {
    "univariate-polynomials": () => `加减按同次位置对齐；乘积中 ${t("x^k")} 的系数是所有满足 ${t("i+j=k")} 的 ${t("a_ib_j")} 之和。`,
    "polynomial-divisibility": () => `每一步用首项相除得到唯一的商项，余式次数严格下降；停止时 ${t("f=qg+r")}，且 ${t("r=0")} 或 ${t("\\deg r<\\deg g")}。`,
    "gcd-polynomials": () => `取余不改变公因式；最后一个非零余式首一化就是 ${t("\\gcd(f,g)")}，回代得到的 ${t("s,t")} 满足 ${t("sf+tg=\\gcd(f,g)")}。`,
    "multiple-factors": () => `两根相距再近也是两个单根；只有精确重合时才成为二重根，此时曲线与横轴相切，${t("\\gcd(f,f')")} 也不再是 1。`,
    "polynomial-functions": () => `${t("f")} 除以 ${t("x-a")} 的余式就是 ${t("f(a)")}；非零 ${t("n")} 次多项式至多有 ${t("n")} 个根；${t("n+1")} 个横坐标互异的点唯一确定次数不超过 ${t("n")} 的多项式。`,
    "complex-real-factorization": () => "实系数多项式的非实根成共轭对出现；一对共轭根合成一个判别式小于 0 的实二次因式。",
    "multivariate-polynomials": () => `${t("x^iy^j")} 对应格点 ${t("(i,j)")}；单项式相乘时指数向量相加，总次数相同的项组成一个齐次部分。`,
  };

  function moduleHeading(number, title) {
    const heading = document.createElement("div");
    heading.className = "ch1-module-heading";
    heading.innerHTML = `<span>${number}</span><div><h4>${title}</h4></div>`;
    return heading;
  }

  function applyTask(section, lab) {
    const task = section.interactive?.task;
    const head = lab.querySelector(":scope > .ch1-lab-head");
    if (!head || !task) return;
    const line = head.querySelector(":scope > p");
    if (line) {
      line.classList.add("ch1-lab-task");
      line.innerHTML = task;
    }
  }

  function buildConclusion(section, lab) {
    const takeaway = takeaways[section.id];
    if (!takeaway) return;
    const conclusion = document.createElement("p");
    conclusion.className = "ch1-live-conclusion";
    conclusion.innerHTML = takeaway();
    lab.append(conclusion);
    // with a prediction box, the conclusion waits until the prediction is checked
    const gate = lab.querySelector(".ch3l-predict");
    if (!gate || gate.classList.contains("is-done")) return;
    conclusion.hidden = true;
    const observer = new MutationObserver(() => {
      if (!gate.classList.contains("is-done")) return;
      conclusion.hidden = false;
      observer.disconnect();
    });
    observer.observe(gate, { attributes: true, attributeFilter: ["class"] });
    window.ch1UseCleanup?.(() => observer.disconnect());
  }

  function installCoefficientHighlights(lab) {
    const update = () => {
      const mode = lab.querySelector("[data-mode].is-active")?.dataset.mode;
      lab.dataset.coefficientMode = mode || "add";
      lab.querySelectorAll(".ch1-strip-cell.is-contributor").forEach((cell) => cell.classList.remove("is-contributor"));
      if (mode !== "mul") return;
      lab.querySelectorAll("[data-contributions] tr").forEach((row) => {
        const cells = row.cells;
        if (!cells || cells.length < 2) return;
        const i = (cells[0].textContent.match(/\d+/) || [])[0];
        const j = (cells[1].textContent.match(/\d+/) || [])[0];
        if (i !== undefined) lab.querySelector(`[data-f="${i}"]`)?.closest(".ch1-strip-cell")?.classList.add("is-contributor");
        if (j !== undefined) lab.querySelector(`[data-g="${j}"]`)?.closest(".ch1-strip-cell")?.classList.add("is-contributor");
      });
    };
    const observer = new MutationObserver(update);
    const table = lab.querySelector("[data-contributions]");
    if (table) observer.observe(table, { subtree: true, childList: true, characterData: true });
    lab.addEventListener("click", () => queueMicrotask(update));
    lab.addEventListener("input", () => queueMicrotask(update));
    window.ch1UseCleanup?.(() => observer.disconnect());
    update();
  }

  function restructureCoefficientLab(lab) {
    if (lab.dataset.coefficientLayout === "true") return;
    const controls = lab.querySelector(":scope > .ch1-controls");
    const pairs = [...lab.querySelectorAll(":scope > .ch1-two-col")];
    const sourcePair = pairs[0];
    const explanationPair = pairs[1];
    const sourcePanel = sourcePair?.querySelector(":scope > .ch1-panel");
    const stage = sourcePair?.querySelector(":scope > .ch1-stage");
    // the opening “middle 0” module keeps number 01; the workbench follows it
    const opener = lab.querySelector(":scope > [data-zero-module]");
    const n = (k) => String(k + (opener ? 1 : 0)).padStart(2, "0");
    const resultBand = lab.querySelector(":scope > .ch1-result-band");
    const fStrip = lab.querySelector("[data-f-strip]");
    const gStrip = lab.querySelector("[data-g-strip]");
    if (!controls || !sourcePanel || !stage || !resultBand || !fStrip || !gStrip || !explanationPair) return;

    const fBlock = fStrip.parentElement;
    const gBlock = gStrip.parentElement;
    const scaleBox = lab.querySelector("[data-scale-box]");
    const kBox = lab.querySelector("[data-k-box]");

    const workflow = document.createElement("div");
    workflow.className = "ch1-coeff-workflow";

    const editor = document.createElement("section");
    editor.className = "ch1-learning-module ch1-coeff-editor";
    editor.append(moduleHeading(n(1), "输入系数"));
    const editorGrid = document.createElement("div");
    editorGrid.className = "ch1-coeff-pair-grid";
    fBlock.classList.add("ch1-coeff-card", "is-f");
    gBlock.classList.add("ch1-coeff-card", "is-g");
    editorGrid.append(fBlock, gBlock);
    editor.append(editorGrid);

    const operation = document.createElement("section");
    operation.className = "ch1-learning-module ch1-coeff-operation";
    operation.append(moduleHeading(n(2), "选择运算"));
    operation.append(controls);
    const parameterRow = document.createElement("div");
    parameterRow.className = "ch1-coeff-parameters";
    if (scaleBox) parameterRow.append(scaleBox);
    if (kBox) parameterRow.append(kBox);
    operation.append(parameterRow);

    const result = document.createElement("section");
    result.className = "ch1-learning-module ch1-coeff-result";
    result.append(moduleHeading(n(3), "结果"));
    result.append(resultBand);

    const explanation = document.createElement("section");
    explanation.className = "ch1-learning-module ch1-coeff-analysis";
    explanation.append(moduleHeading(n(4), "乘积中指定次数的全部贡献"));
    const analysisGrid = document.createElement("div");
    analysisGrid.className = "ch1-coeff-analysis-grid";
    [...explanationPair.children].forEach((child) => analysisGrid.append(child));
    explanation.append(analysisGrid);

    const graph = document.createElement("details");
    graph.className = "ch1-graph-details";
    graph.open = false;
    graph.innerHTML = `<summary><span>结果的函数图像</span></summary>`;
    graph.append(stage);

    workflow.append(editor, operation, result, explanation, graph);
    // the section's question is the middle 0; the operations workbench folds away under it
    const more = document.createElement("details");
    more.className = "ch1-more-ops";
    more.innerHTML = `<summary><span>更多运算</span><small>加、减、数乘与乘法：输入两组系数，读出结果的每一项</small></summary>`;
    more.append(workflow);
    more.addEventListener("toggle", () => { if (more.open) window.dispatchEvent(new Event("resize")); });
    (opener || lab.querySelector(":scope > .ch1-lab-head")).after(more);
    sourcePair.remove();
    explanationPair.remove();
    sourcePanel.remove();
    lab.dataset.coefficientLayout = "true";
    installCoefficientHighlights(lab);
  }

  function enhanceLesson(section, root) {
    const interactive = root.querySelector(`#${CSS.escape(section.id)}-interactive`);
    const lab = interactive?.querySelector(".ch1-lab");
    if (!lab || lab.dataset.ch1LearningReady === "true") return;
    lab.dataset.ch1LearningReady = "true";
    lab.classList.add("ch1-guided-lab", `ch1-section-${section.id}`);
    applyTask(section, lab);
    if (section.id === "univariate-polynomials") restructureCoefficientLab(lab);
    buildConclusion(section, lab);
  }

  function syncCoefficientDegreeLabels(root = document) {
    const slider = root.querySelector("[data-k]");
    if (!slider) return;
    root.querySelectorAll("[data-k-value]").forEach((node) => {
      node.textContent = slider.value;
    });
  }

  document.addEventListener("input", (event) => {
    if (event.target?.matches?.("[data-k]")) syncCoefficientDegreeLabels(document);
  });

  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  window.addEventListener("hashchange", () => window.teardownChapter1Lesson?.());

  window.renderLessonPage = function renderLessonPageWithChapter1Extensions(section, chapter) {
    baseRenderLessonPage(section, chapter);
    const root = document.querySelector("#mainContent");
    window.mountChapter1Lesson?.(section, root);
    syncCoefficientDegreeLabels(root);
    enhanceLesson(section, root);
  };
})();
