(() => {
  const { I, on, markExperimentStep, conclusionMarkup } = window.Chapter8Lab;

  const orbit = [
    { label: "v", svgLabel: "v", rank: 1, note: "起点向量建立循环子空间的第一维。" },
    { label: "Av", svgLabel: "Av", rank: 2, note: "Av 与 v 独立，轨道继续扩张。" },
    { label: "A^2v", svgLabel: "A²v", rank: 3, note: "A²v 仍然独立，得到三维 Krylov 基。" },
    { label: "A^3v", svgLabel: "A³v", rank: 3, note: "第一次不再增加秩：A³v 回流到前面三项的张成空间。" },
  ];

  function mount(host) {
    let mode = "orbit";
    let step = 0;
    let belt = "single";

    function renderOrbit() {
      const item = orbit[step];
      const feedback = step >= 3;
      markExperimentStep(host, Math.min(step, 3));
      host.innerHTML = `
        <div class="ch8-lab ch8-cinema ch8-rational-cinema">
          <div class="ch8-story-tabs" role="tablist" aria-label="有理标准形实验模式">
            <button type="button" class="is-active" data-rational-mode="orbit" aria-pressed="true"><span>01</span>Krylov 轨道</button>
            <button type="button" data-rational-mode="blocks" aria-pressed="false"><span>02</span>拼接伴随块</button>
          </div>

          <header class="ch8-cinema-head">
            <div><span>循环子空间</span><h3>每作用一次 A，轨道向前推进；第一次回流决定最后一列</h3></div>
            <p>伴随矩阵不是凭空写出的模板。它完整记录了“前移”和“反馈”两种动作。</p>
          </header>

          <section class="ch8-krylov-machine ch8-companion-matrix">
            <svg viewBox="0 0 980 470" role="img" aria-label="Krylov 轨道推进并在第一次线性相关时回流到前面向量">
              <defs><marker id="ch8-krylov-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0L10 5L0 10Z"></path></marker></defs>
              <path class="belt-line" d="M90 235H650"></path>
              ${orbit.map((vector, index) => {
                const x = 120 + index * 175;
                const state = index < step ? "is-past" : index === step ? "is-current" : "is-future";
                return `<g class="belt-node ${state}" transform="translate(${x} 235)"><circle r="42"></circle><text class="belt-node-label" text-anchor="middle" dy="7">${vector.svgLabel}</text></g>`;
              }).join("")}
              <text class="belt-index" x="115" y="305">0</text><text class="belt-index" x="290" y="305">1</text><text class="belt-index" x="465" y="305">2</text><text class="belt-index" x="640" y="305">3</text>
              <path class="feedback-curve ${feedback ? "is-visible" : ""}" d="M645 185C610 70 300 55 125 180"></path>
              <path class="feedback-branch ${feedback ? "is-visible" : ""}" d="M500 92C455 128 385 150 305 190"></path>
              <text class="feedback-label ${feedback ? "is-visible" : ""}" x="342" y="66">A³v = −v + 2Av</text>

              <g class="companion-shell" transform="translate(730 95)">
                <text x="0" y="0">在基 (v, Av, A²v) 中</text>
                <path class="matrix-brace" d="M12 38H0V282H12M226 38H238V282H226"></path>
                ${[
                  ["0", "0", feedback ? "−1" : "?"],
                  ["1", "0", feedback ? "2" : "?"],
                  ["0", "1", feedback ? "0" : "?"],
                ].map((row, r) => row.map((value, c) => `<g class="companion-cell ${c === Math.min(step, 2) ? "is-active" : ""}" transform="translate(${48 + c * 72} ${82 + r * 70})"><rect x="-28" y="-28" width="56" height="56" rx="12"></rect><text text-anchor="middle" dy="7">${value}</text></g>`).join("")).join("")}
                <text class="companion-caption" x="22" y="325">前两列：移位</text>
                <text class="companion-caption" x="132" y="325">最后一列：反馈</text>
              </g>
            </svg>

            <div class="ch8-krylov-status">
              <span>当前向量</span><strong>${I(item.label)}</strong>
              <span>轨道秩</span><b>${item.rank}</b>
              <p>${item.note}</p>
            </div>
          </section>

          <div class="ch8-krylov-controls">
            <button type="button" data-orbit-prev ${step === 0 ? "disabled" : ""}>← 上一步</button>
            <div><span>轨道位置 ${step + 1}/4</span><strong>${feedback ? "第一次回流已经出现" : "继续检查新向量是否增加秩"}</strong></div>
            <button type="button" class="is-primary" data-orbit-next ${step === orbit.length - 1 ? "disabled" : ""}>作用一次 A →</button>
          </div>

          ${feedback ? `<div class="ch8-return-polynomial"><span>首次回流关系</span><strong>${I("A^3v-2Av+v=0")}</strong><b>${I("f(t)=t^3-2t+1")}</b><p>反馈系数 (−1,2,0) 直接成为伴随矩阵最后一列；完全不需要先求根。</p></div>` : ""}

          ${conclusionMarkup(
            "伴随矩阵的来源",
            feedback ? "前两列记录前移，最后一列记录首次回流" : "轨道仍在扩张，还没有形成反馈多项式",
            feedback ? "Krylov 基把 A 的作用变成一台移位—反馈机器，这正是伴随矩阵的几何与代数含义。" : "继续作用 A，直到新向量第一次不再增加循环子空间维数。",
          )}
        </div>`;

      host.querySelectorAll("[data-rational-mode]").forEach((button) => on(button, "click", () => { mode = button.dataset.rationalMode; if (mode === "blocks") renderBlocks(); }));
      on(host.querySelector("[data-orbit-prev]"), "click", () => { step = Math.max(0, step - 1); renderOrbit(); });
      on(host.querySelector("[data-orbit-next]"), "click", () => { step = Math.min(orbit.length - 1, step + 1); renderOrbit(); });
    }

    function renderBlocks() {
      markExperimentStep(host, 3);
      host.innerHTML = `
        <div class="ch8-lab ch8-cinema ch8-rational-cinema">
          <div class="ch8-story-tabs" role="tablist" aria-label="有理标准形实验模式">
            <button type="button" data-rational-mode="orbit" aria-pressed="false"><span>01</span>Krylov 轨道</button>
            <button type="button" class="is-active" data-rational-mode="blocks" aria-pressed="true"><span>02</span>拼接伴随块</button>
          </div>

          <header class="ch8-cinema-head">
            <div><span>不变因子分解空间</span><h3>一个不变因子生成一条循环轨道，多条轨道做直和</h3></div>
            <p>这里直接使用多项式系数，不要求它分裂成一次因子，因此任意底域都可以构造。</p>
          </header>

          <div class="ch8-block-belt-switch" role="group" aria-label="选择循环块数量">
            <button type="button" data-belt="single" class="${belt === "single" ? "is-active" : ""}">一个循环子空间</button>
            <button type="button" data-belt="double" class="${belt === "double" ? "is-active" : ""}">两个循环子空间</button>
          </div>

          <section class="ch8-canonical-builder ${belt === "double" ? "has-two" : ""}">
            <div class="ch8-companion-belt is-first">
              <header><span>${belt === "single" ? "唯一不变因子" : "不变因子 d₁"}</span><strong>${belt === "single" ? I("t^3-2t+1") : I("t^2+1")}</strong></header>
              <div class="ch8-mini-belt">
                ${(belt === "single" ? ["v", "Av", "A²v"] : ["v", "Av"]).map((label, index, list) => `<div><span>${I(label)}</span><i>${index < list.length - 1 ? "A →" : "反馈 ↺"}</i></div>`).join("")}
              </div>
              <div class="ch8-companion-output">${belt === "single" ? I("C(t^3-2t+1)=\\begin{bmatrix}0&0&-1\\\\1&0&2\\\\0&1&0\\end{bmatrix}") : I("C(t^2+1)=\\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}")}</div>
            </div>
            ${belt === "double" ? `
              <div class="ch8-direct-sum-symbol">⊕</div>
              <div class="ch8-companion-belt is-second">
                <header><span>不变因子 d₂</span><strong>${I("(t^2+1)(t-2)")}</strong></header>
                <div class="ch8-mini-belt"><div><span>u</span><i>A →</i></div><div><span>Au</span><i>A →</i></div><div><span>A²u</span><i>反馈 ↺</i></div></div>
                <div class="ch8-companion-output">${I("C((t^2+1)(t-2))")}</div>
              </div>` : ""}
          </section>

          <div class="ch8-jordan-rational-compare">
            <article><span>Jordan 标准形</span><strong>按线性初等因子分块</strong><p>通常要先让特征多项式在底域上完全分裂。</p></article>
            <article><span>有理标准形</span><strong>按不变因子分块</strong><p>直接使用多项式系数，在任意域上都能构造。</p></article>
          </div>

          ${conclusionMarkup(
            "有理标准形",
            belt === "single" ? "整个空间由一条循环轨道生成" : "多个循环子空间的伴随块按直和拼接",
            "每个非单位不变因子对应一个伴随块；整除链固定块的组织方式，因此得到唯一的相似类代表。",
          )}
        </div>`;
      host.querySelectorAll("[data-rational-mode]").forEach((button) => on(button, "click", () => { mode = button.dataset.rationalMode; if (mode === "orbit") renderOrbit(); }));
      host.querySelectorAll("[data-belt]").forEach((button) => on(button, "click", () => { belt = button.dataset.belt; renderBlocks(); }));
    }

    if (mode === "orbit") renderOrbit();
    else renderBlocks();
  }

  window.defineChapter8Lab("rational-story", mount);
})();