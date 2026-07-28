(() => {
  const { I, on, markExperimentStep, conclusionMarkup } = window.Chapter8Lab;

  const dims = [0, 2, 4, 5];

  function node(name, x, y, level, built) {
    const visible = level <= built;
    return `<g class="jordan-node ${visible ? "is-visible" : "is-ghost"}" data-level="${level}" transform="translate(${x} ${y})"><circle r="34"></circle><text text-anchor="middle" dy="6">${name}</text></g>`;
  }

  function edge(x1, y1, x2, y2, level, built) {
    return `<path class="jordan-edge ${level <= built ? "is-visible" : "is-ghost"}" d="M${x1} ${y1 - 34}L${x2} ${y2 + 34}"></path>`;
  }

  function growthEquation(k, value) {
    return `<strong class="ch8-growth-equation"><span>ν<sub>${k}</sub></span><i>=</i><span>dim ker N<sup>${k}</sup></span><i>=</i><b>${value}</b></strong>`;
  }

  function differenceEquation(k, value, previous, result) {
    return `<span class="ch8-growth-difference">b<sub>${k}</sub> = ν<sub>${k}</sub> − ν<sub>${k - 1}</sub> = ${value} − ${previous} = <b>${result}</b></span>`;
  }

  function mount(host) {
    let built = 1;
    let activeK = 1;
    let showBlocks = false;

    function render() {
      const activeDim = dims[activeK];
      const previousDim = dims[Math.max(0, activeK - 1)];
      const atLeast = activeK === 0 ? 0 : activeDim - previousDim;
      markExperimentStep(host, showBlocks ? 3 : Math.min(built - 1, 2));

      host.innerHTML = `
        <div class="ch8-lab ch8-cinema ch8-jordan-cinema">
          <header class="ch8-cinema-head">
            <div><span>固定 N=A−λ₀I</span><h3>链每向上多一层，核空间就多看见一层</h3></div>
            <p>链长不是装饰：它同时决定 ker Nᵏ 的增长速度和 Jordan 块的大小。</p>
          </header>

          <div class="ch8-jordan-toolbar">
            <div><span>已经构造</span><strong>${built} 层</strong></div>
            <button type="button" data-chain-reset ${built === 1 && !showBlocks ? "disabled" : ""}>重置</button>
            <button type="button" class="is-primary" data-chain-next ${built >= 3 ? "disabled" : ""}>向上补一层</button>
            <button type="button" data-show-blocks ${built < 3 ? "disabled" : ""}>${showBlocks ? "隐藏" : "显出"} Jordan 块</button>
          </div>

          <section class="ch8-jordan-field">
            <div class="ch8-chain-table" role="img" aria-label="两条广义特征向量链进入逐层增长的核空间">
              <div class="ch8-chain-head"><span>核空间层</span><b>链 A</b><b>链 B</b></div>
              <div class="ch8-chain-row ${activeK === 3 ? "is-active" : ""}">
                <span>${I("\\ker N^3")}</span>
                <div class="jordan-node ${built >= 3 ? "is-visible" : "is-ghost"}"><b>v₃</b><small>${I("Nv_3=v_2")}</small></div>
                <i aria-hidden="true">∅</i>
              </div>
              <div class="ch8-chain-arrow-row" aria-hidden="true"><span></span><i>N ↓</i><i>N ↓</i></div>
              <div class="ch8-chain-row ${activeK === 2 ? "is-active" : ""}">
                <span>${I("\\ker N^2")}</span>
                <div class="jordan-node ${built >= 2 ? "is-visible" : "is-ghost"}"><b>v₂</b><small>${I("Nv_2=v_1")}</small></div>
                <div class="jordan-node ${built >= 2 ? "is-visible" : "is-ghost"}"><b>w₂</b><small>${I("Nw_2=w_1")}</small></div>
              </div>
              <div class="ch8-chain-arrow-row" aria-hidden="true"><span></span><i>N ↓</i><i>N ↓</i></div>
              <div class="ch8-chain-row ${activeK === 1 ? "is-active" : ""}">
                <span>${I("\\ker N")}</span>
                <div class="jordan-node is-visible"><b>v₁</b><small>${I("Nv_1=0")}</small></div>
                <div class="jordan-node is-visible"><b>w₁</b><small>${I("Nw_1=0")}</small></div>
              </div>
              <div class="ch8-chain-foot"><span></span><b>长度 3</b><b>长度 2</b></div>
            </div>

            <aside class="ch8-growth-meter">
              <span>选择观察层数 k</span>
              <div class="ch8-kernel-growth-bars">
                ${dims.map((value, index) => `<button type="button" data-growth-k="${index}" class="${activeK === index ? "is-active" : ""} ${index > built ? "is-locked" : ""}" ${index > built ? "disabled" : ""}><span>${I(`\\nu_${index}`)}</span><i style="--height:${value / 5}"></i><b>${value}</b><small>${index === 0 ? "起点" : `ker N^${index}`}</small></button>`).join("")}
              </div>
              <div class="ch8-growth-readout">
                <span>当前读数</span>
                ${growthEquation(activeK, activeDim)}
                ${activeK > 0 ? `<p>${differenceEquation(activeK, activeDim, previousDim, atLeast)}<em>共有 ${atLeast} 个块的大小至少为 ${activeK}。</em></p>` : `<p>ν₀=0 只是增长序列的起点。</p>`}
              </div>
            </aside>
          </section>

          ${showBlocks ? `
            <section class="ch8-jordan-output">
              <div class="ch8-chain-to-block"><span>长度 3 的链</span><i>→</i><strong>${I("J_3(\\lambda_0)=\\begin{bmatrix}\\lambda_0&1&0\\\\0&\\lambda_0&1\\\\0&0&\\lambda_0\\end{bmatrix}")}</strong></div>
              <b>⊕</b>
              <div class="ch8-chain-to-block"><span>长度 2 的链</span><i>→</i><strong>${I("J_2(\\lambda_0)=\\begin{bmatrix}\\lambda_0&1\\\\0&\\lambda_0\\end{bmatrix}")}</strong></div>
            </section>` : ""}

          ${conclusionMarkup(
            "从核增长反推块",
            built < 3 ? `目前只看见链的前 ${built} 层` : showBlocks ? "两条链已经变成 3 阶块与 2 阶块" : "ν=(0,2,4,5) 已经唯一确定块大小 3 与 2",
            built < 3 ? "继续向上补链。每补一层，观察哪几条链仍能进入更高次核。" : "增长量 2、2、1 表示：两个块至少 1 阶，两个块至少 2 阶，只有一个块至少 3 阶。",
          )}
        </div>`;

      on(host.querySelector("[data-chain-reset]"), "click", () => { built = 1; activeK = 1; showBlocks = false; render(); });
      on(host.querySelector("[data-chain-next]"), "click", () => { built = Math.min(3, built + 1); activeK = built; render(); });
      on(host.querySelector("[data-show-blocks]"), "click", () => { showBlocks = !showBlocks; render(); });
      host.querySelectorAll("[data-growth-k]").forEach((button) => on(button, "click", () => { activeK = Number(button.dataset.growthK); render(); }));
    }

    render();
  }

  window.defineChapter8Lab("jordan-story", mount);
})();
