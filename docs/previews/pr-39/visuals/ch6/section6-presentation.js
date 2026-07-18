(() => {
  const U = () => window.Ch6UI;

  function sumVsUnionFigure() {
    const config = { ...U().plane, width: 400, height: 230, origin: [200, 130], scale: 62 };
    const a = [1.3, 0.25];
    const b = [-0.25, 1.1];
    const sum = U().add(a, b);
    const inner =
      U().planeGrid(config) +
      U().line(a, "is-u", "U", [0, 0], config) +
      U().line(b, "is-w", "W", [0, 0], config) +
      U().softArrow([0, 0], a, "is-u", "", config) +
      U().softArrow(a, sum, "is-w", "", config) +
      U().softArrow([0, 0], sum, "is-result", "", config);
    return `<svg class="ch6-sum-union-figure" viewBox="0 0 400 230" role="img" aria-label="先沿青色 u 前进，再沿橙色 w 前进，得到绿色 u+w">${inner}</svg>`;
  }

  function dimensionBookkeeping() {
    return `<div class="ch6-dimension-bookkeeping"><div class="ch6-basis-row"><span>U 的基</span><b>公共方向</b><b>U 独有方向</b></div><div class="ch6-basis-row is-w"><span>W 的基</span><b>公共方向</b><b>W 独有方向</b></div><div class="ch6-bookkeeping-arrow">公共方向在两行中各出现一次，因此合并时必须减去一次</div><div class="ch6-dimension-result">${U().texDisplay("\\dim(U+W)=\\dim U+\\dim W-\\dim(U\\cap W)")}</div></div>`;
  }

  function renderFormal(root) {
    const modules = [
      U().moduleBlock(
        "01",
        "交空间收集共同拥有的方向",
        "同时属于 U 与 W 的向量组成新的子空间",
        `<div class="ch6-definition-pair"><article><span>交空间</span>${U().texDisplay("U\\cap W=\\{v:v\\in U\\text{ 且 }v\\in W\\}")}<p>它继承含零、加法封闭与数乘封闭。</p></article><article><span>包含关系特例</span>${U().texDisplay("U\\subseteq W\\Rightarrow U\\cap W=U")}<p>较小的子空间就是全部公共方向。</p></article></div>`,
      ),
      U().moduleBlock(
        "02",
        "和空间收集所有可以合成的方向",
        "它不是简单把两个集合并排放在一起",
        `<div class="ch6-sum-definition"><div>${sumVsUnionFigure()}</div><div>${U().texDisplay("U+W=\\{u+w:u\\in U,\\ w\\in W\\}")}<p>青色段表示先取 ${U().texInline("u\\in U")}，橙色段表示从它的终点再加 ${U().texInline("w\\in W")}；绿色箭头是最终的 ${U().texInline("u+w")}。</p><div class="ch6-warning-note"><strong>${U().texInline("U\\cup W")} 一般不是子空间</strong><p>分别取 u∈U 与 w∈W，u+w 往往离开集合并。</p></div></div></div>`,
      ),
      U().moduleBlock("03", "维数公式是一笔重复方向的账", "dim U 与 dim W 都计算了交空间中的方向", dimensionBookkeeping()),
      U().moduleBlock(
        "04",
        "求 U+W 的基：合并生成组，再删冗余",
        "交空间决定需要删掉多少重复方向",
        `<div class="ch6-extraction-steps"><div><span>1</span><strong>写出 U 与 W 的基</strong><p>合并后一定生成 U+W。</p></div><div><span>2</span><strong>做线性无关筛选</strong><p>删去能由前面向量表示的方向。</p></div><div><span>3</span><strong>剩余向量形成和空间的基</strong><p>向量个数就是 dim(U+W)。</p></div></div>`,
      ),
      U().moduleBlock(
        "05",
        "代表例题的精确结果",
        "不仅判断维数，还要写出交空间与和空间的基",
        `<div class="ch6-example-result"><div>${U().texDisplay("U=\\operatorname{span}\\{(1,0,1)^T,(0,1,1)^T\\}")}${U().texDisplay("W=\\operatorname{span}\\{(1,1,0)^T,(1,-1,2)^T\\}")}</div><div class="ch6-example-arrow">→</div><div>${U().texDisplay("U\\cap W=\\operatorname{span}\\{(1,0,1)^T\\}")}${U().texDisplay("U+W=\\mathbb{R}^3")}</div></div><p class="ch6-example-basis">和空间可取基 ${U().texInline("(1,0,1)^T,(0,1,1)^T,(1,1,0)^T")}，维数账为 ${U().texInline("2+2-1=3")}。</p>`,
      ),
    ];
    root.innerHTML = U().formalShell(
      "交与和：公共方向与合成范围",
      "交空间回答“两个子空间共同拥有什么”，和空间回答“把两边方向一起使用能到达哪里”。维数公式把这两种信息联系起来。",
      modules,
      "下一节进一步要求和空间中的分解具有唯一性，这就得到直和。",
    );
  }

  function r2Visual(same, angleU, angleW) {
    const u = [Math.cos(angleU), Math.sin(angleU)];
    const w = same ? u : [Math.cos(angleW), Math.sin(angleW)];
    let inner = U().planeGrid();
    if (same) {
      const uPart = U().scale(u, 1.35);
      const sum = U().scale(u, 0.72);
      inner += U().line(u, "is-overlap", "U=W");
      inner += U().softArrow([0, 0], uPart, "is-u", "");
      inner += U().softArrow(uPart, sum, "is-w", "");
      inner += U().softArrow([0, 0], sum, "is-result", "");
    } else {
      const uPart = U().scale(u, 1.35);
      const sum = U().add(uPart, U().scale(w, 1.05));
      inner += `<rect class="ch6-plane-fill" x="14" y="14" width="612" height="332" rx="20"></rect>`;
      inner += U().line(u, "is-u", "U");
      inner += U().line(w, "is-w", "W");
      inner += U().softArrow([0, 0], uPart, "is-u", "");
      inner += U().softArrow(uPart, sum, "is-w", "");
      inner += U().softArrow([0, 0], sum, "is-result", "");
    }
    return U().planeSvg(inner, same ? "同一条直线中的 u 与 w 合成" : "两条不同直线中的 u 与 w 合成");
  }

  function r3Visual(kind) {
    if (kind === "contained") {
      return `<svg class="ch6-space-3d" viewBox="0 0 640 360" role="img" aria-label="直线 U 包含于平面 W"><polygon class="ch6-plane-polygon is-w" points="120,260 310,90 540,150 350,320"></polygon><line class="ch6-space-line is-u" x1="170" y1="270" x2="475" y2="135"></line><text x="458" y="126" class="ch6-space-label is-u">U=U∩W</text><text x="510" y="190" class="ch6-space-label is-w">W=U+W</text><circle cx="320" cy="205" r="5" class="ch6-space-origin"></circle></svg>`;
    }
    return `<svg class="ch6-space-3d" viewBox="0 0 640 360" role="img" aria-label="两个平面相交于一条直线"><polygon class="ch6-plane-polygon is-u" points="80,245 280,75 535,135 335,305"></polygon><polygon class="ch6-plane-polygon is-w" points="165,80 510,235 430,325 85,170"></polygon><line class="ch6-space-line is-overlap" x1="150" y1="140" x2="470" y2="275"></line><text x="520" y="132" class="ch6-space-label is-u">U</text><text x="450" y="315" class="ch6-space-label is-w">W</text><text x="345" y="228" class="ch6-space-label is-overlap">公共直线 U∩W</text></svg>`;
  }

  function r4Visual() {
    return `<div class="ch6-r4-stage"><div class="ch6-r4-axis-group is-u"><span>U</span><strong>e₁, e₂</strong><p>前两个坐标方向</p></div><div class="ch6-r4-plus">+</div><div class="ch6-r4-axis-group is-w"><span>W</span><strong>e₃, e₄</strong><p>后两个坐标方向</p></div><div class="ch6-r4-equals">=</div><div class="ch6-r4-axis-group is-result"><span>U+W</span><strong>ℝ⁴</strong><p>四个独立方向</p></div></div>`;
  }

  function renderInteractive(root, section) {
    const cases = {
      distinct: { label: "ℝ² 中两条不同直线", du: 1, dw: 1, di: 0, ds: 2, intersection: "只有零向量", sum: "整个 ℝ²", kind: "r2" },
      same: { label: "ℝ² 中同一条直线", du: 1, dw: 1, di: 1, ds: 1, intersection: "整条直线", sum: "仍是同一条直线", kind: "same" },
      contained: { label: "ℝ³ 中 U⊂W", du: 1, dw: 2, di: 1, ds: 2, intersection: "U", sum: "W", kind: "contained" },
      planes: { label: "ℝ³ 中两个不同平面", du: 2, dw: 2, di: 1, ds: 3, intersection: "一条公共直线", sum: "整个 ℝ³", kind: "planes" },
      r4: { label: "ℝ⁴ 中两个互补二维子空间", du: 2, dw: 2, di: 0, ds: 4, intersection: "只有零向量", sum: "整个 ℝ⁴", kind: "r4" },
    };
    let key = "distinct";
    let angleU = 0.25;
    let angleW = 1.15;
    root.innerHTML = `<div data-ch6-sum-lab></div>`;
    const host = root.querySelector("[data-ch6-sum-lab]");

    function render() {
      const info = cases[key];
      let visual;
      if (info.kind === "r2") visual = r2Visual(false, angleU, angleW);
      else if (info.kind === "same") visual = r2Visual(true, angleU, angleW);
      else if (info.kind === "contained" || info.kind === "planes") visual = r3Visual(info.kind);
      else visual = r4Visual();

      const controls = `${U().segmented([["distinct", "两条不同直线"], ["same", "同一条直线"], ["contained", "直线包含于平面"], ["planes", "两个平面"], ["r4", "ℝ⁴ 互补子空间"]], "sum-case", key)}${info.kind === "r2" ? `<div class="ch6-coordinate-sliders"><label>U 的方向 <output>${Math.round(angleU * 180 / Math.PI)}°</output><input type="range" min="-1.2" max="1.2" step="0.02" value="${angleU}" data-angle-u></label><label>W 的方向 <output>${Math.round(angleW * 180 / Math.PI)}°</output><input type="range" min="-1.2" max="1.4" step="0.02" value="${angleW}" data-angle-w></label></div>` : ""}`;
      const ledger = `<div class="ch6-dimension-ledger"><div><span>dim U</span><strong>${info.du}</strong></div><b>+</b><div><span>dim W</span><strong>${info.dw}</strong></div><b>−</b><div><span>重复方向 dim(U∩W)</span><strong>${info.di}</strong></div><b>=</b><div class="is-result"><span>dim(U+W)</span><strong>${info.ds}</strong></div></div>`;
      const readout = `${ledger}<div class="ch6-current-story"><span>当前情形</span><h4>${info.label}</h4><p>交空间：${info.intersection}；和空间：${info.sum}。</p></div><div class="ch6-formula-readout">${U().texDisplay(`\\dim(U+W)=${info.du}+${info.dw}-${info.di}=${info.ds}`)}</div><div class="ch6-reading-note"><strong>为什么要减</strong><p>交空间中的公共方向已经在 dim U 和 dim W 中各算过一次，合并时必须去掉一次重复。</p></div>`;

      host.innerHTML = U().labShell({
        title: "先找公共方向，再做维数账本",
        lead: "切换不同维数情形。画面负责告诉你哪些方向重复，下面的账本负责把这种重复写成维数公式。",
        focus: info.kind === "r2" ? "先看 U 与 W 是否是同一条直线，再沿青色段和橙色段追到绿色 u+w。" : "先找图中同时属于 U 和 W 的公共方向。",
        stage: `<div class="ch6-stage-shell">${visual}${info.kind === "r2" || info.kind === "same" ? `<div class="ch6-stage-legend"><span class="is-u">青色：先取 u</span><span class="is-w">橙色：再加 w</span><span class="is-result">绿色：最终 u+w</span></div>` : ""}</div>`,
        controls,
        readout,
        tasks: U().taskBlock(section),
        className: "ch6-sum-lab",
      });

      host.querySelectorAll("[data-sum-case]").forEach((button) => button.addEventListener("click", () => {
        key = button.dataset.sumCase;
        render();
      }));
      host.querySelector("[data-angle-u]")?.addEventListener("input", (event) => {
        angleU = Number(event.target.value);
        render();
      });
      host.querySelector("[data-angle-w]")?.addEventListener("input", (event) => {
        angleW = Number(event.target.value);
        render();
      });
    }

    render();
  }

  U().register("intersection-sum", renderFormal, renderInteractive);
})();