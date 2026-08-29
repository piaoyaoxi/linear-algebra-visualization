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

  function planFor(section) {
    const interactive = section?.interactive || {};
    return {
      question: interactive.task || section?.question || interactive.title || "这个实验揭示了什么结构？",
      steps: Array.isArray(interactive.guide) ? interactive.guide : [],
      takeaway: interactive.takeaway || (section?.summary || []).join(" "),
      controlsTitle: interactive.controlsTitle || "设置实验条件",
      controlsDescription: interactive.controlsDescription || "选择要比较的模式、参数或示例，再观察结果怎样变化。",
    };
  }

  const text = (node) => {
    if (!node) return "";
    const copy = node.cloneNode(true);
    copy.querySelectorAll?.(".katex-mathml, annotation").forEach((hiddenMath) => hiddenMath.remove());
    return copy.textContent?.replace(/\s+/g, " ").trim() || "";
  };

  function moduleHeading(number, title, description) {
    const heading = document.createElement("div");
    heading.className = "ch1-module-heading";
    heading.innerHTML = `<span>${number}</span><div><h4>${title}</h4><p>${description}</p></div>`;
    return heading;
  }

  function buildGuide(section) {
    const plan = planFor(section);
    if (!plan.steps.length) return null;
    const guide = document.createElement("section");
    guide.className = "ch1-learning-guide";
    guide.setAttribute("aria-label", "实验任务与观察路径");
    guide.innerHTML = `
      <div class="ch1-learning-question">
        <span>观察目标</span>
        <strong>${plan.question}</strong>
      </div>
      <ol class="ch1-learning-steps">
        ${plan.steps.map(([verb, description], index) => `
          <li><span>${index + 1}</span><div><strong>${verb}</strong><p>${description}</p></div></li>`).join("")}
      </ol>`;
    return guide;
  }

  function wrapTopControls(section, lab) {
    const controls = lab.querySelector(":scope > .ch1-controls");
    if (!controls || controls.closest(".ch1-control-module")) return;
    const plan = planFor(section);
    const module = document.createElement("section");
    module.className = "ch1-learning-module ch1-control-module";
    module.append(moduleHeading("01", plan.controlsTitle, plan.controlsDescription));
    controls.before(module);
    module.append(controls);
  }

  function buildConclusion(section, lab) {
    const plan = planFor(section);
    if (!plan.takeaway) return null;
    const conclusion = document.createElement("section");
    conclusion.className = "ch1-live-conclusion";
    conclusion.setAttribute("aria-live", "polite");
    conclusion.innerHTML = `
      <div class="ch1-module-heading"><span>✓</span><div><h4>当前观察</h4><p>操作后，检查哪些条件成立，哪些对象发生变化。</p></div></div>
      <p data-ch1-live-result>${plan.takeaway}</p>`;
    lab.append(conclusion);
    return conclusion;
  }

  function currentObservation(section, lab) {
    const sectionId = section.id;
    const plan = planFor(section);
    const active = (selector) => text(lab.querySelector(selector));
    if (sectionId === "number-fields") {
      const parts = [active("[data-domain-name]"), active("[data-field-status]"), active("[data-witness]"), active("[data-current-factor]")]
        .filter(Boolean)
        .map((part) => part.replace(/[。；]+$/, ""));
      return `${parts.join("；")}。`;
    }
    if (sectionId === "univariate-polynomials") {
      const mode = lab.querySelector("[data-mode].is-active")?.dataset.mode;
      if (mode === "mul") {
        return `当前在追踪乘法的 k=${lab.querySelector("[data-k]")?.value || ""} 次项；所有高亮配对都满足 i+j=k，合计系数为 ${active("[data-k-coeff]") || "0"}。`;
      }
      const labels = { add: "加法按同次位置相加", sub: "减法按同次位置相减", scale: "数乘保持次数位置，只缩放系数" };
      return labels[mode] || plan.takeaway;
    }
    if (sectionId === "polynomial-divisibility") return [active("[data-status]"), active("[data-degree]"), active("[data-note]")].filter(Boolean).join("；");
    if (sectionId === "gcd-polynomials") return [active("[data-coprime]"), `${active("[data-object-label]")}=${active("[data-gcd]")}`, active("[data-stage-note]")].filter(Boolean).join("；");
    if (sectionId === "factorization-theorem") return `当前标准化叶节点：${active("[data-standard]")}。${active("[data-unique]")}`;
    if (sectionId === "multiple-factors") return [active("[data-status]"), `gcd(f,f′)=${active("[data-gcd]")}`].filter(Boolean).join("；");
    if (sectionId === "polynomial-functions") {
      const visible = [...lab.querySelectorAll("[data-eval-panel], [data-root-panel], [data-interp-panel]")].find((node) => !node.hidden);
      return text(visible?.querySelector("[data-factor], [data-root-status], [data-interp-poly]")) || plan.takeaway;
    }
    if (sectionId === "complex-real-factorization") return [active("[data-real-status]"), active("[data-factor]")].filter(Boolean).join("；");
    if (sectionId === "rational-polynomials") return active("[data-eisenstein-status]") || plan.takeaway;
    if (sectionId === "multivariate-polynomials") return active("[data-lattice-readout]") || active("[data-active]") || plan.takeaway;
    if (sectionId === "symmetric-polynomials") return active("[data-global-status]") || active("[data-sym-status]") || plan.takeaway;
    return plan.takeaway;
  }

  function installLiveConclusion(section, lab, conclusion) {
    if (!conclusion) return;
    const output = conclusion.querySelector("[data-ch1-live-result]");
    let queued = false;
    const update = () => {
      if (queued) return;
      queued = true;
      queueMicrotask(() => {
        queued = false;
        const next = currentObservation(section, lab);
        if (output.textContent !== next) output.textContent = next;
      });
    };
    const observer = new MutationObserver(update);
    observer.observe(lab, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["class", "hidden"] });
    lab.addEventListener("click", update);
    lab.addEventListener("input", update);
    lab.addEventListener("change", update);
    window.ch1UseCleanup?.(() => observer.disconnect());
    update();
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
    editor.append(moduleHeading("01", "把系数放回正确次数", "f 与 g 各占一整行；常数项到 x⁴ 始终保持同一列。"));
    const editorGrid = document.createElement("div");
    editorGrid.className = "ch1-coeff-pair-grid";
    fBlock.classList.add("ch1-coeff-card", "is-f");
    gBlock.classList.add("ch1-coeff-card", "is-g");
    editorGrid.append(fBlock, gBlock);
    editor.append(editorGrid);

    const operation = document.createElement("section");
    operation.className = "ch1-learning-module ch1-coeff-operation";
    operation.append(moduleHeading("02", "选择运算规则", "加减只看同列；数乘统一缩放；乘法会把不同次数配对后汇总。"));
    operation.append(controls);
    const parameterRow = document.createElement("div");
    parameterRow.className = "ch1-coeff-parameters";
    if (scaleBox) parameterRow.append(scaleBox);
    if (kBox) parameterRow.append(kBox);
    operation.append(parameterRow);

    const result = document.createElement("section");
    result.className = "ch1-learning-module ch1-coeff-result";
    result.append(moduleHeading("03", "先读结果，再解释来源", "结果系数带与公式同步；乘法模式下继续追踪一个指定次数。"));
    result.append(resultBand);

    const explanation = document.createElement("section");
    explanation.className = "ch1-learning-module ch1-coeff-analysis";
    explanation.append(moduleHeading("04", "追踪指定次数的全部贡献", "表格不只给答案，而是列出每一组满足 i+j=k 的来源。"));
    const analysisGrid = document.createElement("div");
    analysisGrid.className = "ch1-coeff-analysis-grid";
    [...explanationPair.children].forEach((child) => analysisGrid.append(child));
    explanation.append(analysisGrid);

    const graph = document.createElement("details");
    graph.className = "ch1-graph-details";
    graph.innerHTML = `<summary><span>辅助观察：函数图像</span><small>图像只帮助感受结果形状；系数运算仍以系数带为准。</small></summary>`;
    graph.append(stage);

    workflow.append(editor, operation, result, explanation, graph);
    const guide = lab.querySelector(":scope > .ch1-learning-guide");
    (guide || lab.querySelector(":scope > .ch1-lab-head")).after(workflow);
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

    const guide = buildGuide(section);
    const head = lab.querySelector(":scope > .ch1-lab-head");
    if (guide && head) head.after(guide);

    if (section.id === "univariate-polynomials") restructureCoefficientLab(lab);
    else wrapTopControls(section, lab);

    const conclusion = buildConclusion(section, lab);
    installLiveConclusion(section, lab, conclusion);
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
