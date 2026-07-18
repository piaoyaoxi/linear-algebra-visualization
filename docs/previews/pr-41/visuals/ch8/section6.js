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
            <svg viewBox="0 0 900 560" role="img" aria-label="两条广义特征向量链及核空间逐层增长">
              <defs><marker id="ch8-jordan-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0L10 5L0 10Z"></path></marker></defs>
              <rect class="kernel-band k3 ${activeK === 3 ? "is-active" : ""}" x="135" y="55" width="630" height="440" rx="64"></rect>
              <rect class="kernel-band k2 ${activeK === 2 ? "is-active" : ""}" x="170" y="185" width="560" height="310" rx="58"></rect>
              <rect class="kernel-band k1 ${activeK === 1 ? "is-active" : ""}" x="205" y="315" width="490" height="180" rx="52"></rect>
              <text class="kernel-label" x="162" y="92">ker N³</text>
              <text class="kernel-label" x="197" y="222">ker N²</text>
              <text class="kernel-label" x="232" y="352">ker N</text>

              ${edge(310, 375, 310, 245, 2, built)}
              ${edge(310, 245, 310, 115, 3, built)}
              ${edge(590, 375, 590, 245, 2, built)}
              ${node("v₁", 310, 410, 1, built)}
              ${node("v₂", 310, 280, 2, built)}
              ${node("v₃", 310, 150, 3, built)}
              ${node("w₁", 590, 410, 1, built)}
              ${node("w₂", 590, 280, 2, built)}

              <text class="chain-title" x="282" y="530">链 A · 长度 3</text>
              <text class="chain-title" x="562" y="530">链 B · 长度 2</text>
              <text class="chain-map" x="336" y="337">N</text>
              <text class="chain-map" x="336" y="207">N</text>
              <text class="chain-map" x="616" y="337">N</text>
              <text class="chain-zero" x="292" y="475">N(v₁)=0</text>
              <text class="chain-zero" x="572" y="475">N(w₁)=0</text>
            </svg>

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