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
  addStylesheet("./visuals/ch1/learning-design.css?v=ch1-learning1");

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

  const learningPlan = {
    "number-fields": {
      question: "哪些数集真的能成为多项式系数的稳定舞台？",
      steps: [
        ["选择", "切换一个候选集合，不要先猜结论。"],
        ["检验", "逐门检查加、减、乘和非零除法，并寻找最短反例。"],
        ["区分", "分别判断系数是否合法，以及多项式能否在当前域中继续分解。"],
      ],
      takeaway: "数域由运算封闭性决定；不可约性与因式分解必须连同系数域一起说明。",
    },
    "univariate-polynomials": {
      question: "系数的位置怎样决定加法、数乘与乘法？",
      steps: [
        ["输入", "把 f 与 g 的同一次数放在同一列，内部零系数也保留位置。"],
        ["运算", "先比较加减与数乘，再切到乘法观察卷积配对。"],
        ["追踪", "选择结果次数 k，只累加所有满足 i+j=k 的乘积。"],
      ],
      takeaway: "加减按同次对齐；乘法按 i+j=k 汇总。函数图像只是辅助窗口，不参与系数计算。",
    },
    "polynomial-divisibility": {
      question: "多项式长除法为什么每一步都要消去当前最高次项？",
      steps: [
        ["选择", "先比较一个整除示例和一个非整除示例。"],
        ["步进", "每次只做一次首项消去，读出新的商项与余式。"],
        ["停止", "当余式为 0，或余式次数低于除式次数时，算法结束。"],
      ],
      takeaway: "长除法的核心是不变量 f=qg+r，以及余式次数严格下降。",
    },
    "gcd-polynomials": {
      question: "为什么不断取余能够保留全部公共因式？",
      steps: [
        ["步进", "沿欧几里得余式链逐步前进。"],
        ["比较", "观察每一步 gcd(A,B)=gcd(B,R)，而余式次数下降。"],
        ["验证", "用最终的 Bézout 系数代回，检查 sf+tg=d。"],
      ],
      takeaway: "最后一个非零余式给出首一最大公因式；Bézout 等式是可核验的证书。",
    },
    "factorization-theorem": {
      question: "拆分路线不同，为什么最终的不可约因式仍然唯一？",
      steps: [
        ["定域", "先选择 Q、R 或 C，再讨论可约与不可约。"],
        ["换路", "对同一多项式比较路线 A 与路线 B。"],
        ["标准化", "把常数提出、因式首一化并排序，再比较最终叶节点。"],
      ],
      takeaway: "唯一的是标准化后的不可约因式多重集合，不是中间拆分路径。",
    },
    "multiple-factors": {
      question: "重数怎样同时出现在因式、导数、gcd 与图像中？",
      steps: [
        ["调重数", "比较 m=1、2、3、4 时根附近的穿过、贴住与平坦程度。"],
        ["看代数", "同步读取 gcd(f,f′) 与连续导数在根处的消失情况。"],
        ["判临界", "把两个近根精确合并，区分“很接近”和“真正重合”。"],
      ],
      takeaway: "重根是精确代数状态；图像形状提供直觉，但 gcd 与导数给出判定。",
    },
    "polynomial-functions": {
      question: "评价、根数上界与插值如何由同一个多项式结构连接起来？",
      steps: [
        ["评价", "移动 a，用 Horner 过程得到 f(a)，并用余数定理判断一次因式。"],
        ["计数", "改变次数 n 与不同根数 m，测试非零多项式的根数上界。"],
        ["重建", "编辑三个节点，用 Lagrange 基函数重建唯一的低次多项式。"],
      ],
      takeaway: "代入连接余数与因式；根数受次数限制；互异节点能够唯一确定低次多项式。",
    },
    "complex-real-factorization": {
      question: "实系数为什么会把非实根锁成共轭对？",
      steps: [
        ["拖动", "移动复根 α，观察关于实轴镜像的共轭根。"],
        ["读取", "同步查看根之和、根之积和对应二次因式。"],
        ["解锁", "切到复系数模式，比较任意两根为何通常产生复系数。"],
      ],
      takeaway: "实系数要求非实根成共轭对；一对共轭一次因式合并成实二次因式。",
    },
    "rational-polynomials": {
      question: "有理根定理与 Eisenstein 判别各自能说明什么，不能说明什么？",
      steps: [
        ["筛选", "根据首项与常数项生成全部既约有理根候选。"],
        ["验证", "逐个精确代入；候选并不自动是根。"],
        ["判别", "切换素数检查 Eisenstein 三条件，并正确解释“失败时未得到结论”。"],
      ],
      takeaway: "有理根定理缩小搜索范围；Eisenstein 是不可约的充分条件，判据失败不能反推可约。",
    },
    "multivariate-polynomials": {
      question: "多元单项式怎样变成指数格点，乘法又怎样变成向量相加？",
      steps: [
        ["点格点", "点击支撑内外的格点，读取指数向量、单项式与总次数。"],
        ["看分层", "按总次数过滤，观察齐次部分位于同一条斜线上。"],
        ["做乘法", "选择两个指数向量，观察它们相加到乘积格点。"],
      ],
      takeaway: "多元多项式的支撑是指数向量集合；单项式相乘就是指数逐坐标相加。",
    },
    "symmetric-polynomials": {
      question: "怎样可靠判断置换不变，并把对称多项式改写成基本对称多项式？",
      steps: [
        ["置换", "先做换位和三循环，再把结果规范化后比较。"],
        ["辨别", "用循环对称反例区分“某些置换不变”和“所有置换不变”。"],
        ["改写", "沿 σ 改写步骤逐次消去最高单项式。"],
      ],
      takeaway: "对称性是规范化后的置换不变性；基本对称多项式提供系统改写坐标。",
    },
  };

  const text = (node) => node?.textContent?.replace(/\s+/g, " ").trim() || "";

  function moduleHeading(number, title, description) {
    const heading = document.createElement("div");
    heading.className = "ch1-module-heading";
    heading.innerHTML = `<span>${number}</span><div><h4>${title}</h4><p>${description}</p></div>`;
    return heading;
  }

  function buildGuide(section) {
    const plan = learningPlan[section.id];
    if (!plan) return null;
    const guide = document.createElement("section");
    guide.className = "ch1-learning-guide";
    guide.setAttribute("aria-label", "实验任务与观察路径");
    guide.innerHTML = `
      <div class="ch1-learning-question">
        <span>本实验要回答</span>
        <strong>${plan.question}</strong>
      </div>
      <ol class="ch1-learning-steps">
        ${plan.steps.map(([verb, description], index) => `
          <li><span>${index + 1}</span><div><strong>${verb}</strong><p>${description}</p></div></li>`).join("")}
      </ol>`;
    return guide;
  }

  function wrapTopControls(lab) {
    const controls = lab.querySelector(":scope > .ch1-controls");
    if (!controls || controls.closest(".ch1-control-module")) return;
    const module = document.createElement("section");
    module.className = "ch1-learning-module ch1-control-module";
    module.append(moduleHeading("01", "选择实验情境", "先决定要比较的模式、参数或示例，再进入主观察区。"));
    controls.before(module);
    module.append(controls);
  }

  function buildConclusion(section, lab) {
    const plan = learningPlan[section.id];
    if (!plan) return null;
    const conclusion = document.createElement("section");
    conclusion.className = "ch1-live-conclusion";
    conclusion.setAttribute("aria-live", "polite");
    conclusion.innerHTML = `
      <div class="ch1-module-heading"><span>✓</span><div><h4>把现象说成一句数学结论</h4><p>先读当前状态，再对照本节不变量。</p></div></div>
      <p data-ch1-live-result>${plan.takeaway}</p>
      <small>${plan.takeaway}</small>`;
    lab.append(conclusion);
    return conclusion;
  }

  function currentObservation(sectionId, lab) {
    const plan = learningPlan[sectionId];
    const active = (selector) => text(lab.querySelector(selector));
    if (sectionId === "number-fields") {
      return [active("[data-domain-name]"), active("[data-field-status]"), active("[data-witness]")].filter(Boolean).join("：");
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
    if (sectionId === "gcd-polynomials") return [active("[data-coprime]"), `gcd=${active("[data-gcd]")}`, active("[data-note]")].filter(Boolean).join("；");
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
        const next = currentObservation(section.id, lab);
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
    graph.open = true;
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
    else wrapTopControls(lab);

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
    enhanceLesson(section, root);
  };
})();
