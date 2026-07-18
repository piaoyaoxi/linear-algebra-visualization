(() => {
  const { I, on, setPressed, markExperimentStep, conclusionMarkup } = window.Chapter8Lab;

  const orbit = [
    { label: "v", rank: 1, note: "起点向量建立循环子空间的第一维。", column: 0 },
    { label: "Av", rank: 2, note: "Av 与 v 独立，轨道继续扩张。", column: 1 },
    { label: "A^2v", rank: 3, note: "A²v 仍然独立，得到三维循环基。", column: 2 },
    { label: "A^3v", rank: 3, note: "第一次不再增加秩：A³v 回流到前面三个向量的张成空间。", column: 2 },
  ];

  function companionMatrix(activeColumn, showFeedback) {
    const cells = [
      ["0", "0", showFeedback ? "-1" : "?"],
      ["1", "0", showFeedback ? "2" : "?"],
      ["0", "1", showFeedback ? "0" : "?"],
    ];
    return `
      <div class="ch8-companion-matrix" role="img" aria-label="伴随矩阵列构造">
        <i class="brace left"></i>
        <div class="cells">${cells.map((row) => row.map((value, col) => `<span class="${col === activeColumn ? "is-active" : ""}">${I(value)}</span>`).join("")).join("")}</div>
        <i class="brace right"></i>
      </div>`;
  }

  function mount(host) {
    let mode = "orbit";
    let step = 0;
    let belt = "single";

    function renderOrbit() {
      const item = orbit[step];
      const feedback = step >= 3;
      markExperimentStep(host, Math.min(step, 3));
      host.innerHTML = `
        <div class="ch8-lab ch8-story-lab ch8-rational-story">
          <div class="ch8-story-tabs" role="tablist" aria-label="有理标准形实验模式">
            <button type="button" class="is-active" data-rational-mode="orbit" aria-pressed="true"><span>01</span>Krylov 轨道</button>
            <button type="button" data-rational-mode="blocks" aria-pressed="false"><span>02</span>拼接伴随块</button>
          </div>
          <div class="ch8-scene-intro"><span>循环子空间</span><h3>每按一次 A，传送带向前移动一个位置</h3><p>只要新向量增加秩，轨道继续扩张；第一次不增加秩时，反馈关系出现。</p></div>

          <div class="ch8-krylov-stage">
            <section class="ch8-krylov-belt">
              <div class="ch8-pipeline-label"><span>向量轨道</span><strong>${I("v,Av,A^2v,A^3v")}</strong></div>
              <div class="ch8-belt-track">
                ${orbit.map((vector, index) => `<div class="ch8-belt-station ${index < step ? "is-past" : index === step ? "is-current" : "is-future"}"><span>${index}</span><b>${I(vector.label)}</b><i>${index < 3 ? "A →" : feedback ? "回流" : "?"}</i></div>`).join("")}
              </div>
              <div class="ch8-rank-meter"><span>当前轨道秩</span><div><i style="--rank:${item.rank}"></i></div><strong>${item.rank}</strong></div>
              <p>${item.note}</p>
            </section>

            <section class="ch8-feedback-machine">
              <div class="ch8-pipeline-label"><span>坐标记录</span><strong>每一步写成伴随矩阵的一列</strong></div>
              <div class="ch8-feedback-equation">
                ${step === 0 ? I("A(v)=Av") : step === 1 ? I("A(Av)=A^2v") : step === 2 ? I("A(A^2v)=A^3v") : I("A^3v=-v+2Av")}
              </div>
              ${companionMatrix(item.column, feedback)}
              <div class="ch8-column-explanation">
                ${step === 0 ? `<b>第一列 (0,1,0)ᵀ</b><p>v 被送到基中的第二个向量 Av。</p>` : ""}
                ${step === 1 ? `<b>第二列 (0,0,1)ᵀ</b><p>Av 被送到第三个向量 A²v。</p>` : ""}
                ${step === 2 ? `<b>第三列暂时未知</b><p>必须先把 A³v 用前面三项表示。</p>` : ""}
                ${step === 3 ? `<b>第三列 (−1,2,0)ᵀ</b><p>反馈系数直接进入最后一列。</p>` : ""}
              </div>
            </section>
          </div>

          <div class="ch8-krylov-controls">
            <button type="button" data-orbit-prev ${step === 0 ? "disabled" : ""}>← 上一步</button>
            <div><span>轨道位置 ${step + 1}/4</span><strong>${I(item.label)}</strong></div>
            <button type="button" class="is-primary" data-orbit-next ${step === orbit.length - 1 ? "disabled" : ""}>作用一次 A →</button>
          </div>

          ${feedback ? `<div class="ch8-return-polynomial"><span>首次回流关系</span><strong>${I("A^3v-2Av+v=0")}</strong><b>${I("f(t)=t^3-2t+1")}</b><p>没有求任何根，只使用多项式系数，就已经得到伴随块。</p></div>` : ""}
          ${conclusionMarkup("传送带读法", feedback ? "前两列移位，最后一列反馈" : "轨道还在寻找第一次回流", feedback ? "伴随矩阵的结构不是公式硬记：它就是 Krylov 基中 A 的坐标。" : "继续作用 A，直到新向量不再增加循环子空间的维数。")}
        </div>`;
      host.querySelectorAll("[data-rational-mode]").forEach((button) => on(button, "click", () => {
        mode = button.dataset.rationalMode;
        if (mode === "blocks") renderBlocks();
      }));
      on(host.querySelector("[data-orbit-prev]"), "click", () => { step = Math.max(0, step - 1); renderOrbit(); });
      on(host.querySelector("[data-orbit-next]"), "click", () => { step = Math.min(orbit.length - 1, step + 1); renderOrbit(); });
    }

    function renderBlocks() {
      markExperimentStep(host, 3);
      host.innerHTML = `
        <div class="ch8-lab ch8-story-lab ch8-rational-story">
          <div class="ch8-story-tabs" role="tablist" aria-label="有理标准形实验模式">
            <button type="button" data-rational-mode="orbit" aria-pressed="false"><span>01</span>Krylov 轨道</button>
            <button type="button" class="is-active" data-rational-mode="blocks" aria-pressed="true"><span>02</span>拼接伴随块</button>
          </div>
          <div class="ch8-scene-intro"><span>不变因子分解空间</span><h3>一个不变因子生成一条传送带，多个传送带做直和</h3><p>这里不需要把多项式分解成一次因子，因此任意底域都可以直接构造。</p></div>

          <div class="ch8-block-belt-switch" role="group" aria-label="选择循环块数量">
            <button type="button" data-belt="single" class="${belt === "single" ? "is-active" : ""}">一个循环子空间</button>
            <button type="button" data-belt="double" class="${belt === "double" ? "is-active" : ""}">两个循环子空间</button>
          </div>

          <div class="ch8-canonical-builder ${belt === "double" ? "has-two" : ""}">
            <section class="ch8-companion-belt is-first">
              <header><span>不变因子 d₁</span><strong>${belt === "single" ? I("t^3-2t+1") : I("t^2+1")}</strong></header>
              <div class="ch8-mini-belt">${(belt === "single" ? ["v", "Av", "A²v"] : ["v", "Av"]).map((item, index) => `<div><span>${I(item)}</span>${index < (belt === "single" ? 2 : 1) ? `<i>A →</i>` : `<i>反馈</i>`}</div>`).join("")}</div>
              <div class="ch8-companion-output">${belt === "single" ? I("C(t^3-2t+1)=\\begin{bmatrix}0&0&-1\\\\1&0&2\\\\0&1&0\\end{bmatrix}") : I("C(t^2+1)=\\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}")}</div>
            </section>
            ${belt === "double" ? `
              <div class="ch8-direct-sum-symbol">⊕</div>
              <section class="ch8-companion-belt is-second">
                <header><span>不变因子 d₂</span><strong>${I("(t^2+1)(t-2)")}</strong></header>
                <div class="ch8-mini-belt"><div><span>u</span><i>A →</i></div><div><span>Au</span><i>A →</i></div><div><span>A²u</span><i>反馈</i></div></div>
                <div class="ch8-companion-output">${I("C((t^2+1)(t-2))")}</div>
              </section>` : ""}
          </div>

          <div class="ch8-jordan-rational-compare">
            <article><span>Jordan 标准形</span><strong>按线性初等因子分块</strong><p>通常要先让特征多项式在底域上完全分裂。</p></article>
            <article><span>有理标准形</span><strong>按不变因子分块</strong><p>直接使用多项式系数，在任意域上都能构造。</p></article>
          </div>
          ${conclusionMarkup("有理标准形", belt === "single" ? "一个循环空间对应一个伴随块" : "多个循环空间的伴随块按直和拼接", "块的顺序由不变因子的整除链固定，因此得到唯一的相似类代表。")}
        </div>`;
      host.querySelectorAll("[data-rational-mode]").forEach((button) => on(button, "click", () => {
        mode = button.dataset.rationalMode;
        if (mode === "orbit") renderOrbit();
      }));
      host.querySelectorAll("[data-belt]").forEach((button) => on(button, "click", () => { belt = button.dataset.belt; renderBlocks(); }));
    }

    if (mode === "orbit") renderOrbit();
    else renderBlocks();
  }

  window.defineChapter8Lab("rational-story", mount);
})();
