(() => {
  const { I, on, markExperimentStep, conclusionMarkup } = window.Chapter8Lab;

  const steps = [
    {
      title: "先找到单位主元",
      operation: "观察右上角的 1",
      side: "observe",
      matrix: [["\\lambda", "1"], ["\\lambda^2-1", "\\lambda+1"]],
      active: [0, 1],
      why: "单位 1 已经存在。先把它移到左上角，后面才能同时清掉第一行和第一列。",
      invariant: "还没有改变矩阵，只是在选择最有效的主元。",
    },
    {
      title: "把主元送到左上角",
      operation: "C_1\\leftrightarrow C_2",
      side: "right",
      matrix: [["1", "\\lambda"], ["\\lambda+1", "\\lambda^2-1"]],
      activeCol: 0,
      why: "列交换对应右乘可逆初等 λ-矩阵。输入生成元换了顺序，但等价类没有改变。",
      invariant: "右侧 V(λ) 发生变化；Smith 指纹保持不变。",
    },
    {
      title: "清掉主元下方",
      operation: "R_2\\leftarrow R_2-(\\lambda+1)R_1",
      side: "left",
      matrix: [["1", "\\lambda"], ["0", "-\\lambda-1"]],
      activeRow: 1,
      why: "用第一行的多项式倍数加到第二行，反操作就是把同样的倍数加回去。",
      invariant: "左侧 U(λ) 发生变化；第一列已经被压成 (1,0)ᵀ。",
    },
    {
      title: "清掉主元右侧",
      operation: "C_2\\leftarrow C_2-\\lambda C_1",
      side: "right",
      matrix: [["1", "0"], ["0", "-\\lambda-1"]],
      activeCol: 1,
      why: "列倍加把右上角 λ 消掉。矩阵第一次真正成为对角形。",
      invariant: "右侧 V(λ) 再次变化；对角线已经显形。",
    },
    {
      title: "首一化并检查整除链",
      operation: "R_2\\leftarrow -R_2",
      side: "left",
      matrix: [["1", "0"], ["0", "\\lambda+1"]],
      activeRow: 1,
      why: "−1 是 F[λ] 的单位，所以可以把最后一个对角元改成首一多项式。",
      invariant: "1∣(λ+1)。首一条件与整除链共同确定唯一的 Smith 标准形。",
    },
  ];

  function mount(host) {
    let index = 0;
    let legalChoice = "";
    let showVerification = false;

    host.innerHTML = `
      <div class="ch8-lab ch8-cinema ch8-smith-cinema">
        <header class="ch8-cinema-head">
          <div><span>连续化简 · 对象始终是同一个等价类</span><h3>左边改输出组合，右边改输入生成元</h3></div>
          <div class="ch8-cinema-counter"><b data-smith-index>1</b><span>/ ${steps.length}</span></div>
        </header>

        <div class="ch8-smith-film">
          <svg class="ch8-smith-rails" viewBox="0 0 1000 430" role="img" aria-label="左右初等变换通道与中央 λ-矩阵">
            <defs>
              <marker id="ch8-smith-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0L10 5L0 10Z"></path></marker>
            </defs>
            <path class="rail rail-left" d="M120 92C250 92 270 170 380 202"></path>
            <path class="rail rail-right" d="M880 92C750 92 730 170 620 202"></path>
            <path class="rail rail-left return" d="M380 312C270 338 250 372 120 372"></path>
            <path class="rail rail-right return" d="M620 312C730 338 750 372 880 372"></path>
            <text x="70" y="64">U(λ)</text><text x="828" y="64">V(λ)</text>
            <text x="38" y="408">累计行操作</text><text x="804" y="408">累计列操作</text>
          </svg>

          <section class="ch8-smith-operator is-observe" data-smith-operator>
            <span data-smith-side>先观察</span>
            <strong data-smith-operation></strong>
            <i aria-hidden="true"></i>
          </section>

          <section class="ch8-smith-matrix-focus" aria-live="polite">
            <div class="ch8-matrix-bracket" aria-label="当前 λ-矩阵">
              <i></i>
              <div class="ch8-smith-cells">
                ${[0, 1, 2, 3].map((cell) => `<span data-smith-cell="${cell}"></span>`).join("")}
              </div>
              <i></i>
            </div>
            <div class="ch8-smith-caption"><strong data-smith-title></strong><p data-smith-why></p></div>
          </section>

          <div class="ch8-smith-meaning">
            <div data-smith-left><span>左乘 U(λ)</span><b>行操作</b><p>重新组合输出方程</p></div>
            <div class="is-object"><span>中央对象</span><b>等价类不动</b><p>外形在变，结构指纹不变</p></div>
            <div data-smith-right><span>右乘 V(λ)</span><b>列操作</b><p>重新选择输入生成元</p></div>
          </div>
        </div>

        <nav class="ch8-smith-timeline" aria-label="Smith 化简轨迹">
          ${steps.map((item, stepIndex) => `<button type="button" data-smith-step="${stepIndex}"><span>${String(stepIndex + 1).padStart(2, "0")}</span><b>${item.title}</b></button>`).join("")}
        </nav>

        <div class="ch8-smith-controls">
          <button type="button" data-smith-prev>← 上一步</button>
          <div><span>这一帧保持什么？</span><strong data-smith-invariant></strong></div>
          <button type="button" class="is-primary" data-smith-next>下一步 →</button>
        </div>

        <div data-smith-conclusion></div>

        <section class="ch8-legality-gate">
          <div><span>可逆性检查</span><h4>哪一个倍乘仍然拥有多项式反操作？</h4></div>
          <div class="ch8-legality-options" role="group" aria-label="判断合法倍乘">
            <button type="button" data-legal="lambda">${I("R_1\\leftarrow\\lambda R_1")}</button>
            <button type="button" data-legal="minus">${I("R_1\\leftarrow- R_1")}</button>
            <button type="button" data-legal="poly">${I("R_1\\leftarrow(\\lambda+1)R_1")}</button>
          </div>
          <p data-legal-feedback>合法性只取决于乘数是否为 F[λ] 的单位。</p>
        </section>

        <button type="button" class="ch8-detail-toggle" data-smith-verification aria-expanded="false">展开累计关系</button>
        <div data-smith-verification-slot></div>
      </div>`;

    const cells = [...host.querySelectorAll("[data-smith-cell]")];
    const operator = host.querySelector("[data-smith-operator]");
    const side = host.querySelector("[data-smith-side]");
    const operation = host.querySelector("[data-smith-operation]");
    const title = host.querySelector("[data-smith-title]");
    const why = host.querySelector("[data-smith-why]");
    const invariant = host.querySelector("[data-smith-invariant]");
    const counter = host.querySelector("[data-smith-index]");
    const left = host.querySelector("[data-smith-left]");
    const right = host.querySelector("[data-smith-right]");
    const prev = host.querySelector("[data-smith-prev]");
    const next = host.querySelector("[data-smith-next]");
    const conclusion = host.querySelector("[data-smith-conclusion]");
    const verificationSlot = host.querySelector("[data-smith-verification-slot]");

    function render() {
      const step = steps[index];
      markExperimentStep(host, Math.min(index, 3));
      counter.textContent = String(index + 1);
      side.textContent = step.side === "left" ? "左乘：行操作" : step.side === "right" ? "右乘：列操作" : "先观察主元";
      operation.innerHTML = step.side === "observe" ? step.operation : I(step.operation);
      title.textContent = step.title;
      why.textContent = step.why;
      invariant.textContent = step.invariant;
      operator.className = `ch8-smith-operator is-${step.side}`;
      left.classList.toggle("is-lit", step.side === "left");
      right.classList.toggle("is-lit", step.side === "right");

      cells.forEach((cell, cellIndex) => {
        const row = Math.floor(cellIndex / 2);
        const col = cellIndex % 2;
        cell.innerHTML = I(step.matrix[row][col]);
        cell.classList.toggle("is-active", Boolean(
          (step.active && step.active[0] === row && step.active[1] === col) ||
          step.activeRow === row ||
          step.activeCol === col,
        ));
      });

      host.querySelectorAll("[data-smith-step]").forEach((button, stepIndex) => {
        button.classList.toggle("is-active", stepIndex === index);
        button.classList.toggle("is-complete", stepIndex < index);
        button.disabled = stepIndex > index + 1;
      });
      prev.disabled = index === 0;
      next.disabled = index === steps.length - 1;
      conclusion.innerHTML = conclusionMarkup(
        "结构没有丢失",
        index === steps.length - 1 ? "对角线已经变成 Smith 指纹" : step.invariant,
        index === steps.length - 1 ? "非零对角元首一，并满足 1∣(λ+1)。左右两条操作通道只改变表示，不改变等价类。" : "跟着发亮的左轨或右轨看：每一步都必须有明确反操作。",
        index === steps.length - 1 ? "accent" : "quiet",
      );
      verificationSlot.innerHTML = showVerification ? `<div class="ch8-smith-verification"><span>累计关系</span><strong>${I("D(\\lambda)=U(\\lambda)A(\\lambda)V(\\lambda)")}</strong><p>U 与 V 分别累计行操作和列操作，所以这里得到矩阵等价；相似还要求左右因子来自同一个换基矩阵并互为逆。</p></div>` : "";
    }

    host.querySelectorAll("[data-smith-step]").forEach((button) => on(button, "click", () => {
      index = Number(button.dataset.smithStep);
      render();
    }));
    on(prev, "click", () => { index = Math.max(0, index - 1); render(); });
    on(next, "click", () => { index = Math.min(steps.length - 1, index + 1); render(); });
    host.querySelectorAll("[data-legal]").forEach((button) => on(button, "click", () => {
      legalChoice = button.dataset.legal;
      host.querySelectorAll("[data-legal]").forEach((item) => item.classList.remove("is-correct", "is-wrong"));
      button.classList.add(legalChoice === "minus" ? "is-correct" : "is-wrong");
      host.querySelector("[data-legal-feedback]").textContent = legalChoice === "minus"
        ? "正确：−1 是非零常数单位，反操作仍然是乘 −1。"
        : "不合法：F[λ] 的单位只有非零常数；次数大于 0 的乘数不能保证变换可逆。";
    }));
    on(host.querySelector("[data-smith-verification]"), "click", (event) => {
      showVerification = !showVerification;
      event.currentTarget.setAttribute("aria-expanded", String(showVerification));
      event.currentTarget.textContent = showVerification ? "收起累计关系" : "展开累计关系";
      render();
    });

    render();
  }

  window.defineChapter8Lab("smith-story", mount);
})();
