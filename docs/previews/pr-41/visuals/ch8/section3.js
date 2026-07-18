(() => {
  const { I, on, setPressed, markExperimentStep, conclusionMarkup, polynomialChip } = window.Chapter8Lab;

  const levels = {
    1: {
      minors: ["1", "\\lambda-1", "(\\lambda-1)^2(\\lambda+2)", "0", "0", "0"],
      delta: "1",
      divisor: "\\Delta_1/\\Delta_0",
      invariant: "1",
      note: "因为 1 本身就是一个 1 阶子式，所有 1 阶子式的 gcd 只能是 1。",
    },
    2: {
      minors: ["\\lambda-1", "(\\lambda-1)^2(\\lambda+2)", "(\\lambda-1)^3(\\lambda+2)", "0", "0"],
      delta: "\\lambda-1",
      divisor: "\\Delta_2/\\Delta_1",
      invariant: "\\lambda-1",
      note: "每个非零 2 阶子式都含有 λ−1，而没有更高的共同幂。",
    },
    3: {
      minors: ["(\\lambda-1)^3(\\lambda+2)"],
      delta: "(\\lambda-1)^3(\\lambda+2)",
      divisor: "\\Delta_3/\\Delta_2",
      invariant: "(\\lambda-1)^2(\\lambda+2)",
      note: "3 阶只有整个行列式，因此 Δ₃ 就是三项对角元的乘积。",
    },
  };

  function mount(host) {
    let mode = "pipeline";
    let k = 1;
    let comparisonStep = 0;

    function renderPipeline() {
      markExperimentStep(host, Math.min(k - 1, 2));
      const level = levels[k];
      host.innerHTML = `
        <div class="ch8-lab ch8-story-lab ch8-invariant-story">
          <div class="ch8-story-tabs" role="tablist" aria-label="不变因子实验模式">
            <button type="button" class="is-active" data-invariant-mode="pipeline" aria-pressed="true"><span>01</span>走流水线</button>
            <button type="button" data-invariant-mode="compare" aria-pressed="false"><span>02</span>比较同一 χ</button>
          </div>
          <div class="ch8-scene-intro"><span>固定 Smith 对角形</span><h3>${I("D(\\lambda)=\\operatorname{diag}(1,\\lambda-1,(\\lambda-1)^2(\\lambda+2))")}</h3><p>现在选择子式阶数 k，观察大量子式怎样压缩成一个 Δₖ，再拆出一个 dₖ。</p></div>

          <div class="ch8-k-selector" role="group" aria-label="选择子式阶数">
            ${[1, 2, 3].map((value) => `<button type="button" data-k="${value}" class="${k === value ? "is-active" : ""}"><span>k=${value}</span><b>${value} 阶子式</b></button>`).join("")}
          </div>

          <div class="ch8-gcd-pipeline">
            <section class="ch8-minor-basket">
              <div class="ch8-pipeline-label"><span>输入</span><strong>全部 ${k} 阶子式</strong></div>
              <div class="ch8-minor-tiles">${level.minors.map((minor, index) => `<span class="${minor === "0" ? "is-zero" : ""}" style="--delay:${index}">${I(minor)}</span>`).join("")}</div>
              <p>零子式也属于集合，但不影响非零多项式的最大公因式。</p>
            </section>
            <div class="ch8-pipeline-arrow"><span>全部一起</span><b>→</b></div>
            <section class="ch8-gcd-machine">
              <div class="ch8-gears" aria-hidden="true"><i></i><i></i><i></i></div>
              <span>首一 gcd</span>
              <strong>${I(`\\Delta_${k}=${level.delta}`)}</strong>
              <p>${level.note}</p>
            </section>
            <div class="ch8-pipeline-arrow"><span>相邻相除</span><b>→</b></div>
            <section class="ch8-invariant-output">
              <div class="ch8-pipeline-label"><span>输出</span><strong>第 ${k} 个不变因子</strong></div>
              <div class="ch8-division-stack"><span>${I(level.divisor)}</span><b>${I(`d_${k}=${level.invariant}`)}</b></div>
              <p>这里不是猜测因式，而是用累计 gcd 的相邻商拆出新增结构。</p>
            </section>
          </div>

          <div class="ch8-invariant-chain">
            <span>当前整除链</span>
            ${polynomialChip("d_1=1")}
            <i>∣</i>
            ${polynomialChip(k >= 2 ? "d_2=\\lambda-1" : "d_2=?")}
            <i>∣</i>
            ${polynomialChip(k >= 3 ? "d_3=(\\lambda-1)^2(\\lambda+2)" : "d_3=?")}
          </div>
          ${conclusionMarkup("现在应该看见", `Δ${k} 是“这一阶全部子式”的共同因子`, `再用 Δ${k}/Δ${k - 1} 得到 d${k}。当三个层级都完成时，Smith 对角线被完整恢复。`)}
        </div>`;

      host.querySelectorAll("[data-k]").forEach((button) => on(button, "click", () => { k = Number(button.dataset.k); renderPipeline(); }));
      host.querySelectorAll("[data-invariant-mode]").forEach((button) => on(button, "click", () => {
        mode = button.dataset.invariantMode;
        if (mode === "compare") renderCompare();
      }));
    }

    function renderCompare() {
      markExperimentStep(host, 3);
      const pages = [
        { title: "先看特征多项式", a: "(\\lambda-2)^2", b: "(\\lambda-2)^2", result: "完全相同，只知道根 2 的代数重数为 2。" },
        { title: "再看 Smith 对角线", a: "\\operatorname{diag}(\\lambda-2,\\lambda-2)", b: "\\operatorname{diag}(1,(\\lambda-2)^2)", result: "一个把重数分给两个因子，另一个把重数集中在最后一个因子。" },
        { title: "最后看最小多项式", a: "m_A=\\lambda-2", b: "m_B=(\\lambda-2)^2", result: "最后一个不变因子不同，因此两个矩阵不相似。" },
      ];
      const page = pages[comparisonStep];
      host.innerHTML = `
        <div class="ch8-lab ch8-story-lab ch8-invariant-story">
          <div class="ch8-story-tabs" role="tablist" aria-label="不变因子实验模式">
            <button type="button" data-invariant-mode="pipeline" aria-pressed="false"><span>01</span>走流水线</button>
            <button type="button" class="is-active" data-invariant-mode="compare" aria-pressed="true"><span>02</span>比较同一 χ</button>
          </div>
          <div class="ch8-scene-intro"><span>同一特征多项式的两种结构</span><h3>${I("A=2I_2")} 与 ${I("B=J_2(2)")}</h3><p>点击“下一层指纹”，不要一开始就把所有答案同时摊开。</p></div>
          <div class="ch8-fingerprint-compare">
            <article>
              <div class="ch8-matrix-name"><span>A</span><strong>两个独立特征方向</strong></div>
              <div class="ch8-mini-geometry is-plane"><i></i><i></i><b>ker(2I−A) 是平面</b></div>
              <div class="ch8-fingerprint-page"><span>${page.title}</span><strong>${I(page.a)}</strong></div>
            </article>
            <div class="ch8-fingerprint-center"><span>第 ${comparisonStep + 1} 层</span><b>${comparisonStep === 0 ? "=" : "≠"}</b></div>
            <article>
              <div class="ch8-matrix-name"><span>B</span><strong>只有一个特征方向</strong></div>
              <div class="ch8-mini-geometry is-line"><i></i><i></i><b>ker(2I−B) 是直线</b></div>
              <div class="ch8-fingerprint-page"><span>${page.title}</span><strong>${I(page.b)}</strong></div>
            </article>
          </div>
          <div class="ch8-compare-controls">
            <button type="button" data-compare-prev ${comparisonStep === 0 ? "disabled" : ""}>← 上一层</button>
            <div><span>当前结论</span><strong>${page.result}</strong></div>
            <button type="button" class="is-primary" data-compare-next ${comparisonStep === pages.length - 1 ? "disabled" : ""}>下一层指纹 →</button>
          </div>
          ${conclusionMarkup("结构指纹", comparisonStep === pages.length - 1 ? "相同 χ 仍然可以不相似" : "继续向更细的不变量推进", comparisonStep === pages.length - 1 ? "不变因子同时保存了因子的分层方式；这正是单个特征多项式丢失的信息。" : "当前这一层还没有足够信息给出最终分类。", comparisonStep === pages.length - 1 ? "danger" : "accent")}
        </div>`;
      host.querySelectorAll("[data-invariant-mode]").forEach((button) => on(button, "click", () => {
        mode = button.dataset.invariantMode;
        if (mode === "pipeline") renderPipeline();
      }));
      on(host.querySelector("[data-compare-prev]"), "click", () => { comparisonStep = Math.max(0, comparisonStep - 1); renderCompare(); });
      on(host.querySelector("[data-compare-next]"), "click", () => { comparisonStep = Math.min(pages.length - 1, comparisonStep + 1); renderCompare(); });
    }

    if (mode === "pipeline") renderPipeline();
    else renderCompare();
  }

  window.defineChapter8Lab("invariant-story", mount);
})();
