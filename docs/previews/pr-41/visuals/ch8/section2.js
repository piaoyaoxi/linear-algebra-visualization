(() => {
  const { I, on, setPressed, markExperimentStep, conclusionMarkup } = window.Chapter8Lab;

  const steps = [
    {
      title: "原矩阵",
      operation: "先找一个最容易制造单位主元的位置",
      side: "observe",
      matrix: [["\\lambda", "1"], ["\\lambda^2-1", "\\lambda+1"]],
      highlight: [0, 1],
      why: "右上角已经是单位 1。把它移动到左上角后，后续可以同时清掉第一行和第一列。",
      invariant: "尚未操作；目标是把 1 移到主元位置。",
    },
    {
      title: "交换两列",
      operation: "C_1\\leftrightarrow C_2",
      side: "right",
      matrix: [["1", "\\lambda"], ["\\lambda+1", "\\lambda^2-1"]],
      highlightCol: 0,
      why: "列交换对应右乘一个可逆初等 λ-矩阵。单位 1 到达左上角。",
      invariant: "列交换只改变行列式一个非零常数因子 −1，不改变等价类。",
    },
    {
      title: "清掉左下角",
      operation: "R_2\\leftarrow R_2-(\\lambda+1)R_1",
      side: "left",
      matrix: [["1", "\\lambda"], ["0", "-\\lambda-1"]],
      highlightRow: 1,
      why: "用第一行的多项式倍数加到第二行。反操作是加回同样的倍数，所以仍可逆。",
      invariant: "这是左乘；第一列已经变成 (1,0)^T。",
    },
    {
      title: "清掉右上角",
      operation: "C_2\\leftarrow C_2-\\lambda C_1",
      side: "right",
      matrix: [["1", "0"], ["0", "-\\lambda-1"]],
      highlightCol: 1,
      why: "左上角的 1 可以消掉同一行中的 λ。列倍加同样有可逆反操作。",
      invariant: "这是右乘；矩阵已经对角化。",
    },
    {
      title: "首一化并检查整除链",
      operation: "R_2\\leftarrow -R_2",
      side: "left",
      matrix: [["1", "0"], ["0", "\\lambda+1"]],
      highlightRow: 1,
      why: "−1 是非零常数，是 F[λ] 中的单位。最后一个对角元因此变成首一多项式。",
      invariant: "1 | (λ+1)，所以得到唯一的 Smith 标准形。",
    },
  ];

  function polyMatrix(rows, step) {
    return `
      <div class="ch8-poly-matrix" role="img" aria-label="当前 λ-矩阵">
        <i class="brace left"></i>
        <div class="cells">
          ${rows
            .map((row, rowIndex) => row.map((tex, colIndex) => {
              const active =
                step.highlightRow === rowIndex ||
                step.highlightCol === colIndex ||
                (step.highlight && step.highlight[0] === rowIndex && step.highlight[1] === colIndex);
              return `<span class="${active ? "is-active" : ""}" data-row="${rowIndex}" data-col="${colIndex}">${I(tex)}</span>`;
            }).join(""))
            .join("")}
        </div>
        <i class="brace right"></i>
      </div>`;
  }

  function mount(host) {
    let index = 0;
    let legalChoice = "";
    let showVerification = false;

    function render() {
      const step = steps[index];
      markExperimentStep(host, Math.min(index, 3));
      const sideLabel = step.side === "left" ? "左乘：行操作" : step.side === "right" ? "右乘：列操作" : "先观察";
      host.innerHTML = `
        <div class="ch8-lab ch8-story-lab ch8-smith-story">
          <div class="ch8-smith-progress" aria-label="Smith 化简进度">
            ${steps.map((item, stepIndex) => `<button type="button" data-smith-step="${stepIndex}" class="${stepIndex === index ? "is-active" : stepIndex < index ? "is-complete" : ""}" ${stepIndex > index + 1 ? "disabled" : ""}><span>${stepIndex}</span><b>${item.title}</b></button>`).join("")}
          </div>

          <div class="ch8-smith-stage">
            <div class="ch8-operation-direction is-${step.side}">
              <span>${sideLabel}</span>
              <strong>${step.side === "observe" ? step.operation : I(step.operation)}</strong>
            </div>
            <div class="ch8-smith-matrix-focus">
              <span class="ch8-object-label">同一个 λ-矩阵的当前形态</span>
              ${polyMatrix(step.matrix, step)}
              <div class="ch8-smith-caption"><strong>${step.title}</strong><p>${step.why}</p></div>
            </div>
            <div class="ch8-smith-side-map">
              <div class="${step.side === "left" ? "is-lit" : ""}"><span>左侧 U(λ)</span><b>累计行操作</b><p>改变输出坐标的组合方式</p></div>
              <div class="ch8-smith-object"><span>A(λ)</span><b>等价类不变</b><p>矩阵外形在变，Smith 指纹不变</p></div>
              <div class="${step.side === "right" ? "is-lit" : ""}"><span>右侧 V(λ)</span><b>累计列操作</b><p>改变输入生成元的组合方式</p></div>
            </div>
          </div>

          <div class="ch8-smith-controls">
            <button type="button" data-smith-prev ${index === 0 ? "disabled" : ""}>← 上一步</button>
            <div><span>步骤 ${index + 1} / ${steps.length}</span><strong>${step.title}</strong></div>
            <button type="button" class="is-primary" data-smith-next ${index === steps.length - 1 ? "disabled" : ""}>下一步 →</button>
          </div>

          ${conclusionMarkup("这一操作为什么安全", step.invariant, index === steps.length - 1 ? "非零对角元首一且满足整除链；这才是 Smith 标准形，而不只是任意对角形。" : "每一步都有明确反操作，因此都对应可逆 λ-矩阵。")}

          <section class="ch8-legality-gate">
            <div><span>快速判定</span><h4>下面哪一个“倍乘”仍是合法初等变换？</h4></div>
            <div class="ch8-legality-options" role="group" aria-label="判断合法倍乘">
              <button type="button" data-legal="lambda" class="${legalChoice === "lambda" ? "is-wrong" : ""}">${I("R_1\\leftarrow\\lambda R_1")}</button>
              <button type="button" data-legal="minus" class="${legalChoice === "minus" ? "is-correct" : ""}">${I("R_1\\leftarrow- R_1")}</button>
              <button type="button" data-legal="poly" class="${legalChoice === "poly" ? "is-wrong" : ""}">${I("R_1\\leftarrow(\\lambda+1)R_1")}</button>
            </div>
            <p data-legal-feedback>${legalChoice ? (legalChoice === "minus" ? "正确：−1 是非零常数单位，反操作仍是乘 −1。" : "不合法：次数大于 0 的多项式不是 F[λ] 中的单位，不能保证可逆。") : "先选一个操作，再检查它是否有多项式反操作。"}</p>
          </section>

          <button type="button" class="ch8-detail-toggle" data-smith-verification aria-expanded="${showVerification}">${showVerification ? "收起" : "展开"}累计左右操作的验证</button>
          ${showVerification ? `<div class="ch8-smith-verification"><span>最终关系</span>${I("D(\\lambda)=U(\\lambda)A(\\lambda)V(\\lambda)")}<p>这里的 U 与 V 来自两套独立的行、列操作；它们一般不互为逆，所以这是等价，不是相似。</p></div>` : ""}
        </div>`;

      host.querySelectorAll("[data-smith-step]").forEach((button) => on(button, "click", () => { index = Number(button.dataset.smithStep); render(); }));
      on(host.querySelector("[data-smith-prev]"), "click", () => { index = Math.max(0, index - 1); render(); });
      on(host.querySelector("[data-smith-next]"), "click", () => { index = Math.min(steps.length - 1, index + 1); render(); });
      host.querySelectorAll("[data-legal]").forEach((button) => on(button, "click", () => { legalChoice = button.dataset.legal; render(); }));
      on(host.querySelector("[data-smith-verification]"), "click", () => { showVerification = !showVerification; render(); });
    }

    render();
  }

  window.defineChapter8Lab("smith-story", mount);
})();
