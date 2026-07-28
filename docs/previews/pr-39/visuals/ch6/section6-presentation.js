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
    return `<svg class="ch6-sum-union-figure" viewBox="0 0 400 230" role="img" aria-label="先取 u，再从它的终点加上 w，得到 u+w">${inner}</svg>`;
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
        `<div class="ch6-sum-definition"><div>${sumVsUnionFigure()}</div><div>${U().texDisplay("U+W=\\{u+w:u\\in U,\\ w\\in W\\}")}<p>第一段表示先取 ${U().texInline("u\\in U")}，第二段表示从它的终点再加 ${U().texInline("w\\in W")}；从原点直达终点的箭头就是 ${U().texInline("u+w")}。</p><div class="ch6-warning-note"><strong>${U().texInline("U\\cup W")} 一般不是子空间</strong><p>分别取 u∈U 与 w∈W，u+w 往往离开集合并。</p></div></div></div>`,
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

  function angleVisual(angleU, angleW) {
    const u = [Math.cos(angleU), Math.sin(angleU)];
    const w = [Math.cos(angleW), Math.sin(angleW)];
    const delta = Math.atan2(Math.sin(angleW - angleU), Math.cos(angleW - angleU));
    const separated = Math.abs(delta) > 0.002;
    const openness = Math.min(1, Math.abs(Math.sin(delta)) * 2.2);
    const origin = U().point([0, 0]);
    const a = U().point(U().scale(u, 1.25));
    const b = U().point(U().scale(w, 1.25));
    const c = U().point(U().add(U().scale(u, 1.25), U().scale(w, 1.25)));
    let inner = U().planeGrid();

    if (separated) {
      inner += `<rect class="ch6-plane-fill ch6-sum-field" x="14" y="14" width="612" height="332" rx="18" style="opacity:${(0.12 + openness * 0.68).toFixed(3)}"></rect>`;
      inner += `<polygon class="ch6-sum-cell" points="${origin.join(",")} ${a.join(",")} ${c.join(",")} ${b.join(",")}" style="opacity:${Math.max(0.1, openness).toFixed(3)}"></polygon>`;
    }

    inner += U().line(u, separated ? "is-u" : "is-overlap", separated ? "U" : "U=W");
    if (separated) inner += U().line(w, "is-w", "W");
    const uTip = U().scale(u, 1.22);
    inner += U().softArrow([0, 0], uTip, "is-u", "");
    const uMid = U().point(U().scale(uTip, 0.58));
    inner += `<text class="ch6-component-label" x="${uMid[0] + 8}" y="${uMid[1] - 10}">u∈U</text>`;
    if (separated) {
      const wTip = U().scale(w, 1.22);
      inner += U().softArrow([0, 0], wTip, "is-w", "");
      const wMid = U().point(U().scale(wTip, 0.58));
      inner += `<text class="ch6-component-label" x="${wMid[0] + 8}" y="${wMid[1] - 10}">w∈W</text>`;
    }
    inner += `<path class="ch6-origin-cross" d="M ${origin[0] - 6} ${origin[1]} H ${origin[0] + 6} M ${origin[0]} ${origin[1] - 6} V ${origin[1] + 6}"></path>`;

    return {
      separated,
      delta,
      openness,
      svg: U().planeSvg(inner, "连续改变两条子空间直线的夹角，观察交空间与和空间"),
    };
  }

  function renderInteractive(root, section) {
    const angleU = 0.18;
    let angleW = 0.92;
    root.innerHTML = `<div data-ch6-sum-lab></div>`;
    const host = root.querySelector("[data-ch6-sum-lab]");

    function render() {
      const visual = angleVisual(angleU, angleW);
      const intersectionDim = visual.separated ? 0 : 1;
      const sumDim = visual.separated ? 2 : 1;
      const degrees = Math.abs(visual.delta * 180 / Math.PI);
      const controls = `${U().segmented([["same", "让两条直线重合"], ["near", "只差 8°"], ["open", "分开 42°"]], "sum-preset", visual.separated ? "" : "same")}<div class="ch6-progress-control"><label>W 相对 U 的夹角 <output>${U().formatNumber(degrees, 1)}°</output><input type="range" min="-1.15" max="1.15" step="0.002" value="${visual.delta}" data-angle-gap></label><p>把夹角连续拖到 0，观察“公共方向”和“合成范围”同时发生什么变化。</p></div>`;
      const caption = visual.separated
        ? `<strong>两条方向不同</strong><span>交空间只有零向量；使用两边方向可以铺满平面。</span>`
        : `<strong>两条方向完全重合</strong><span>整条直线都是公共部分；合起来仍只有这一条直线。</span>`;
      const ledger = `<div class="ch6-dimension-ledger"><div><span>dim U</span><strong>1</strong></div><b>+</b><div><span>dim W</span><strong>1</strong></div><b>−</b><div><span>dim(U∩W)</span><strong>${intersectionDim}</strong></div><b>=</b><div class="is-result"><span>dim(U+W)</span><strong>${sumDim}</strong></div></div>`;
      const readout = `${ledger}<div class="ch6-structure-pair"><article><span>交空间 U∩W</span><strong>${visual.separated ? "{0}" : "U=W"}</strong><p>${visual.separated ? "两条不同直线只共享零向量。" : "每个方向都同时属于 U 与 W。"}</p></article><article><span>和空间 U+W</span><strong>${visual.separated ? "ℝ²" : "U"}</strong><p>${visual.separated ? "两个独立方向可以合成任意平面向量。" : "没有增加新的方向。"}</p></article></div><div class="ch6-formula-readout">${U().texDisplay(`\\dim(U+W)=1+1-${intersectionDim}=${sumDim}`)}</div>`;

      host.innerHTML = U().labShell({
        title: "连续改变夹角，观察交与和怎样联动",
        lead: "固定 U，只转动 W。两条直线逐渐靠拢时，先看公共部分，再看两个方向合起来还能铺到哪里。",
        focus: "先看两条直线是否完全重合，再看淡色平行四边形是否还有面积。",
        stage: `<div class="ch6-stage-shell"><div class="ch6-stage-caption">${caption}</div>${visual.svg}</div>`,
        controls,
        readout,
        tasks: U().taskBlock(section),
        className: "ch6-sum-lab",
      });

      host.querySelectorAll("[data-sum-preset]").forEach((button) => button.addEventListener("click", () => {
        const preset = button.dataset.sumPreset;
        angleW = angleU + (preset === "same" ? 0 : preset === "near" ? 8 * Math.PI / 180 : 42 * Math.PI / 180);
        render();
      }));
      host.querySelector("[data-angle-gap]")?.addEventListener("input", (event) => {
        angleW = angleU + Number(event.target.value);
        render();
      });
    }

    render();
  }

  U().register("intersection-sum", renderFormal, renderInteractive);
})();
