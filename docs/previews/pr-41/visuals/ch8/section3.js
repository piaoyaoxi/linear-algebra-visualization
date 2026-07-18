(() => {
  const { I, on, markExperimentStep, conclusionMarkup, polynomialChip } = window.Chapter8Lab;

  const levels = {
    1: {
      minors: ["1", "\\lambda-1", "(\\lambda-1)^2(\\lambda+2)", "0", "0", "0"],
      delta: "1",
      invariant: "1",
      note: "一个 1 已经把所有 1 阶子式的共同因子压到 1。",
    },
    2: {
      minors: ["\\lambda-1", "(\\lambda-1)^2(\\lambda+2)", "(\\lambda-1)^3(\\lambda+2)", "0", "0"],
      delta: "\\lambda-1",
      invariant: "\\lambda-1",
      note: "所有非零 2 阶子式都含 λ−1，但没有更高的共同幂。",
    },
    3: {
      minors: ["(\\lambda-1)^3(\\lambda+2)"],
      delta: "(\\lambda-1)^3(\\lambda+2)",
      invariant: "(\\lambda-1)^2(\\lambda+2)",
      note: "3 阶只有整个行列式，全部结构一次汇总到 Δ₃。",
    },
  };

  function mount(host) {
    let mode = "pipeline";
    let k = 1;
    let comparisonStep = 0;

    function renderPipeline() {
      const level = levels[k];
      markExperimentStep(host, Math.min(k - 1, 2));
      host.innerHTML = `
        <div class="ch8-lab ch8-cinema ch8-invariant-cinema">
          <div class="ch8-story-tabs" role="tablist" aria-label="不变因子实验模式">
            <button type="button" class="is-active" data-invariant-mode="pipeline" aria-pressed="true"><span>01</span>信息压缩</button>
            <button type="button" data-invariant-mode="compare" aria-pressed="false"><span>02</span>同一 χ 的分叉</button>
          </div>

          <header class="ch8-cinema-head">
            <div><span>固定 Smith 对角形</span><h3>${I("D(\\lambda)=\\operatorname{diag}(1,\\lambda-1,(\\lambda-1)^2(\\lambda+2))")}</h3></div>
            <p>大量子式不是答案；它们先被压成 Δₖ，再由相邻层之间新增的部分生成 dₖ。</p>
          </header>

          <div class="ch8-k-selector" role="group" aria-label="选择子式阶数">
            ${[1, 2, 3].map((value) => `<button type="button" data-k="${value}" class="${k === value ? "is-active" : ""}"><span>k=${value}</span><b>${value} 阶子式</b></button>`).join("")}
          </div>

          <section class="ch8-compression-field" aria-live="polite">
            <svg class="ch8-compression-svg" viewBox="0 0 1000 430" role="img" aria-label="子式经过最大公因式压缩成行列式因子，再拆出不变因子">
              <defs>
                <marker id="ch8-compress-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0L10 5L0 10Z"></path></marker>
              </defs>
              <path class="flow" d="M318 212C400 212 420 212 472 212"></path>
              <path class="flow" d="M606 212C680 212 705 212 760 212"></path>
              <circle class="pulse" cx="540" cy="212" r="72"></circle>
              <text x="473" y="94">首一 gcd</text>
              <text x="706" y="94">相邻相除</text>
            </svg>

            <div class="ch8-minor-constellation" style="--minor-count:${level.minors.length}">
              <span class="ch8-field-label">全部 ${k} 阶子式</span>
              ${level.minors.map((minor, index) => `<i style="--i:${index};--n:${level.minors.length}" class="${minor === "0" ? "is-zero" : ""}">${I(minor)}</i>`).join("")}
            </div>

            <div class="ch8-gcd-core">
              <span>压缩结果</span>
              <strong>${I(`\\Delta_${k}=${level.delta}`)}</strong>
              <p>${level.note}</p>
            </div>

            <div class="ch8-invariant-output">
              <span>这一层新增的信息</span>
              <small>${I(`d_${k}=\\Delta_${k}/\\Delta_${k - 1}`)}</small>
              <strong>${I(`d_${k}=${level.invariant}`)}</strong>
              <p>不是重新因式分解，而是读取相邻压缩层之间新增了什么。</p>
            </div>
          </section>

          <div class="ch8-invariant-chain">
            <span>整除链正在被恢复</span>
            ${polynomialChip("d_1=1")}
            <i>∣</i>
            ${polynomialChip(k >= 2 ? "d_2=\\lambda-1" : "d_2=?")}
            <i>∣</i>
            ${polynomialChip(k >= 3 ? "d_3=(\\lambda-1)^2(\\lambda+2)" : "d_3=?")}
          </div>

          ${conclusionMarkup(
            "信息压缩",
            `Δ${k} 保存这一阶所有子式的共同结构`,
            `d${k}=Δ${k}/Δ${k - 1} 只保留从第 ${k - 1} 层到第 ${k} 层新出现的部分。三层完成后，Smith 对角线被唯一恢复。`,
          )}
        </div>`;

      host.querySelectorAll("[data-k]").forEach((button) => on(button, "click", () => {
        k = Number(button.dataset.k);
        renderPipeline();
      }));
      host.querySelectorAll("[data-invariant-mode]").forEach((button) => on(button, "click", () => {
        mode = button.dataset.invariantMode;
        if (mode === "compare") renderCompare();
      }));
    }

    function renderCompare() {
      markExperimentStep(host, 3);
      const pages = [
        { title: "先看特征多项式", a: "(\\lambda-2)^2", b: "(\\lambda-2)^2", result: "完全相同：这里只看见根与代数重数。", symbol: "=" },
        { title: "再看 Smith 对角线", a: "\\operatorname{diag}(\\lambda-2,\\lambda-2)", b: "\\operatorname{diag}(1,(\\lambda-2)^2)", result: "重数的分配方式已经不同。", symbol: "≠" },
        { title: "最后看最小多项式", a: "m_A=\\lambda-2", b: "m_B=(\\lambda-2)^2", result: "最后一个不变因子不同，所以不相似。", symbol: "≠" },
      ];
      const page = pages[comparisonStep];
      host.innerHTML = `
        <div class="ch8-lab ch8-cinema ch8-invariant-cinema">
          <div class="ch8-story-tabs" role="tablist" aria-label="不变因子实验模式">
            <button type="button" data-invariant-mode="pipeline" aria-pressed="false"><span>01</span>信息压缩</button>
            <button type="button" class="is-active" data-invariant-mode="compare" aria-pressed="true"><span>02</span>同一 χ 的分叉</button>
          </div>

          <header class="ch8-cinema-head">
            <div><span>同一个特征多项式</span><h3>${I("A=2I_2")} 与 ${I("B=J_2(2)")}</h3></div>
            <p>不要同时摊开所有答案。逐层打开结构指纹，观察两条路径从哪一层开始分叉。</p>
          </header>

          <section class="ch8-fingerprint-stage">
            <div class="ch8-fingerprint-column is-plane">
              <span>矩阵 A</span><div class="ch8-fingerprint-geometry"><i></i><i></i><b>二维特征空间</b></div>
              <strong>${I(page.a)}</strong>
            </div>
            <div class="ch8-fingerprint-spine"><span>第 ${comparisonStep + 1} 层</span><b>${page.symbol}</b><i></i></div>
            <div class="ch8-fingerprint-column is-line">
              <span>矩阵 B</span><div class="ch8-fingerprint-geometry"><i></i><i></i><b>一维特征空间</b></div>
              <strong>${I(page.b)}</strong>
            </div>
          </section>

          <div class="ch8-compare-controls">
            <button type="button" data-compare-prev ${comparisonStep === 0 ? "disabled" : ""}>← 上一层</button>
            <div><span>${page.title}</span><strong>${page.result}</strong></div>
            <button type="button" class="is-primary" data-compare-next ${comparisonStep === pages.length - 1 ? "disabled" : ""}>下一层指纹 →</button>
          </div>

          ${conclusionMarkup(
            "结构指纹",
            comparisonStep === pages.length - 1 ? "相同 χ 仍然可以不相似" : "当前这一层还不足以完成分类",
            comparisonStep === pages.length - 1 ? "不变因子保存了重数怎样分配到不同层级；单个特征多项式会丢掉这部分信息。" : "继续向更细的不变量推进，直到两条结构路径真正分叉。",
            comparisonStep === pages.length - 1 ? "danger" : "accent",
          )}
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