(() => {
  const { I, on, markExperimentStep, conclusionMarkup } = window.Chapter8Lab;

  const dims = [0, 2, 4, 5];
  const labels = ["\\nu_0", "\\nu_1", "\\nu_2", "\\nu_3"];

  function tower(name, size, built) {
    const vectors = Array.from({ length: size }, (_, index) => ({ level: size - index, label: `${name}_${size - index}` }));
    return `
      <article class="ch8-chain-tower" style="--tower-size:${size}">
        <header><span>链 ${name === "v" ? "A" : "B"}</span><strong>目标长度 ${size}</strong></header>
        <div class="ch8-chain-stack">
          ${vectors.map((vector) => {
            const visible = vector.level <= built;
            return `<div class="ch8-chain-node ${visible ? "is-visible" : "is-ghost"}" data-level="${vector.level}"><span>${I(vector.label)}</span>${vector.level > 1 ? `<i><b>N</b>↓</i>` : `<i><b>N</b>↓ 0</i>`}</div>`;
          }).join("")}
        </div>
      </article>`;
  }

  function growthBars(activeK, built) {
    return `
      <div class="ch8-kernel-growth-bars">
        ${dims.map((value, index) => `<button type="button" data-growth-k="${index}" class="${activeK === index ? "is-active" : index > built ? "is-locked" : ""}" ${index > built ? "disabled" : ""} style="--height:${value / 5}"><span>${I(labels[index])}</span><i></i><b>${value}</b><small>${index === 0 ? "起点" : `ker N^${index}`}</small></button>`).join("")}
      </div>`;
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
        <div class="ch8-lab ch8-story-lab ch8-jordan-story">
          <div class="ch8-jordan-toolbar">
            <div><span>当前搭建高度</span><strong>${built} 层</strong></div>
            <button type="button" data-chain-reset ${built === 1 && !showBlocks ? "disabled" : ""}>重置</button>
            <button type="button" class="is-primary" data-chain-next ${built >= 3 ? "disabled" : ""}>向上搭一层</button>
            <button type="button" data-show-blocks ${built < 3 ? "disabled" : ""}>${showBlocks ? "隐藏" : "写出"} Jordan 块</button>
          </div>

          <div class="ch8-scene-intro"><span>固定 N=A−λ₀I</span><h3>每施加一次 N，向量就沿链向下移动一层</h3><p>链底是普通特征向量；更高层是广义特征向量。塔高最终就是 Jordan 块大小。</p></div>

          <div class="ch8-jordan-main">
            <section class="ch8-chain-yard">
              <div class="ch8-pipeline-label"><span>链塔</span><strong>亲手补齐一组广义特征向量链</strong></div>
              <div class="ch8-chain-towers">${tower("v", 3, built)}${tower("w", 2, built)}</div>
              <div class="ch8-chain-equations">
                <span>${I("Nv_1=0")}</span><span>${built >= 2 ? I("Nv_2=v_1") : "第二层尚未搭建"}</span><span>${built >= 3 ? I("Nv_3=v_2") : "第三层尚未搭建"}</span>
                <span>${I("Nw_1=0")}</span><span>${built >= 2 ? I("Nw_2=w_1") : "第二层尚未搭建"}</span>
              </div>
            </section>

            <section class="ch8-growth-meter">
              <div class="ch8-pipeline-label"><span>核增长</span><strong>第 k 次能看见每座塔的前 k 层</strong></div>
              ${growthBars(activeK, built)}
              <div class="ch8-growth-readout">
                <span>当前选择 ${I(`k=${activeK}`)}</span>
                <strong>${I(`\\nu_${activeK}=\\dim\\ker N^${activeK}=${activeDim}`)}</strong>
                ${activeK > 0 ? `<p>${I(`b_${activeK}=\\nu_${activeK}-\\nu_${activeK - 1}=${atLeast}`)}，所以有 ${atLeast} 个块的大小至少为 ${activeK}。</p>` : `<p>ν₀=0 只是增长序列的起点。</p>`}
              </div>
            </section>
          </div>

          ${showBlocks ? `
            <section class="ch8-jordan-output">
              <div><span>链 A：长度 3</span><div class="ch8-jordan-block is-three">${I("J_3(\\lambda_0)=\\begin{bmatrix}\\lambda_0&1&0\\\\0&\\lambda_0&1\\\\0&0&\\lambda_0\\end{bmatrix}")}</div></div>
              <b>⊕</b>
              <div><span>链 B：长度 2</span><div class="ch8-jordan-block is-two">${I("J_2(\\lambda_0)=\\begin{bmatrix}\\lambda_0&1\\\\0&\\lambda_0\\end{bmatrix}")}</div></div>
            </section>` : ""}

          ${conclusionMarkup(
            "从核增长反推块",
            built < 3 ? `目前只搭到第 ${built} 层，最长链还没有确定` : showBlocks ? "两座链塔分别变成 3 阶块与 2 阶块" : "ν=(0,2,4,5) 已经确定塔高为 3 和 2",
            built < 3 ? "继续向上搭链，观察哪一座塔还能增长。" : "增长量 2、2、1 表示：两个块至少 1 阶，两个块至少 2 阶，只有一个块至少 3 阶。",
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
