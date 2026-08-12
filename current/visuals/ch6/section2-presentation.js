(() => {
  const U = () => window.Ch6UI;

  function objectCards() {
    const cards = [
      ["几何向量", "\\mathbb{R}^2", "逐分量相加与数乘"],
      ["多项式", "P_2", "系数逐项相加与数乘"],
      ["矩阵", "M_{2}(\\mathbb{R})", "对应元素相加与数乘"],
      ["函数", "C[a,b]", "逐点相加与数乘"],
    ];
    return `<div class="ch6-object-grid">${cards.map(([label, formula, note]) => `<article><span>${label}</span>${U().texDisplay(formula)}<p>${note}</p></article>`).join("")}</div>`;
  }

  function axiomRule(name, formula, explanation) {
    return `<div class="ch6-axiom-rule"><div><strong>${name}</strong><p>${explanation}</p></div>${U().texDisplay(formula)}</div>`;
  }

  function axiomGroups() {
    return `<div class="ch6-axiom-grid"><article><span>加法的四条规则</span><div class="ch6-axiom-list">${axiomRule("交换顺序不影响结果", "u+v=v+u", "先加 u 还是先加 v，得到同一个向量。")} ${axiomRule("改变括号不影响结果", "(u+v)+w=u+(v+w)", "连续相加时，结合方式可以改变。")} ${axiomRule("存在零向量", "u+0=u", "加上零向量不会改变原向量。")} ${axiomRule("每个向量都有相反向量", "u+(-u)=0", "u 与 −u 相加回到零向量。")}</div></article><article><span>数乘的四条规则</span><div class="ch6-axiom-list">${axiomRule("乘以 1 保持不变", "1u=u", "标量 1 不改变向量。")} ${axiomRule("连续数乘可以合并", "(ab)u=a(bu)", "先乘 b 再乘 a，等于直接乘 ab。")} ${axiomRule("对向量和分配", "a(u+v)=au+av", "先相加再缩放，等于分别缩放后相加。")} ${axiomRule("对标量和分配", "(a+b)u=au+bu", "标量相加后作用，等于两次作用再相加。")}</div></article></div>`;
  }

  function renderFormal(root) {
    const modules = [
      U().moduleBlock("01", "线性空间研究共同的运算规则", "元素可以长得完全不同，只要加法与数乘遵守同一套规则", `${objectCards()}<div class="ch6-definition-banner"><div><span>一套线性空间必须同时给出</span><strong>集合 V · 数域 K · 加法 · 数乘</strong></div>${U().texDisplay("+:V\\times V\\to V,\\qquad \\cdot:K\\times V\\to V")}</div>`),
      U().moduleBlock("02", "八条公理直接按 4 + 4 理解", "左边四条说明向量怎样相加，右边四条说明数乘怎样与加法配合", axiomGroups()),
      U().moduleBlock("03", "简单性质由八条公理推出", "前面的规则足以逐步推出这些结论", `<div class="ch6-property-flow"><div>${U().texDisplay("0v=(0+0)v=0v+0v")}<p>两边同时消去一个 ${U().texInline("0v")}，得到 ${U().texInline("0v=0")}。</p></div><div>${U().texDisplay("(-1)v+v=(-1+1)v=0v=0")}<p>因此 ${U().texInline("(-1)v=-v")}。</p></div><div>${U().texDisplay("a0=a(0+0)=a0+a0")}<p>两边同时消去一个 ${U().texInline("a0")}，得到 ${U().texInline("a0=0")}。</p></div></div>`),
      U().moduleBlock("04", "判断候选集合：优先寻找最短反例", "一个反例足以否定；有限次试验通过不能代替证明", `<div class="ch6-counterexample-table"><div><strong>第一步：看零向量</strong><span>不过原点的直线、常数项为 1 的多项式集合立即失败。</span></div><div><strong>第二步：看负数数乘</strong><span>第一象限、非负函数集合常在 ${U().texInline("-1")} 倍处失败。</span></div><div><strong>第三步：看放大与相加</strong><span>RGB 颜色立方体有上下界，${U().texInline("2u")} 或 ${U().texInline("u+v")} 会越界。</span></div><div><strong>最后：再证明一般情况</strong><span>图中一次通过只能帮助理解，真正成立仍要说明任意元素和任意标量。</span></div></div>`),
    ];
    root.innerHTML = U().formalShell("线性空间：不看外形，只检查加法与数乘", "几何箭头只是线性空间的一种模型。真正需要检查的是：运算是否定义良好、结果是否仍在集合中，以及八条规则是否对任意元素成立。", modules, "下一节开始研究有限维空间怎样被一组最小的独立方向描述。");
  }

  function candidateVisual(candidate) {
    if (candidate.kind === "rgb") {
      const rows = [["u", candidate.u], [candidate.operationLabel, candidate.result]];
      return `<div class="ch6-rgb-stage">${rows.map(([label, vector]) => `<div class="ch6-rgb-row"><strong>${label} = ${U().formatVector(vector)}</strong>${vector.map((value, index) => `<div class="ch6-rgb-channel"><span>${["R", "G", "B"][index]}</span><i><b style="width:${Math.max(0, Math.min(1, value)) * 100}%"></b></i><em class="${value < 0 || value > 1 ? "is-out" : ""}">${U().formatNumber(value)}</em></div>`).join("")}</div>`).join("")}</div>`;
    }
    if (candidate.kind === "polynomial") {
      return `<div class="ch6-polynomial-stage"><div class="ch6-polynomial-panel"><span>先取集合中的元素</span>${U().texDisplay(candidate.element)}</div><div class="ch6-polynomial-arrow"><small>${candidate.operationTitle}</small><b>→</b></div><div class="ch6-polynomial-panel"><span>运算后的结果</span>${U().texDisplay(candidate.operation)}</div><div class="ch6-polynomial-failure">集合要求常数项始终等于 1，但结果的常数项变成 2，因此立即离开集合。</div></div>`;
    }
    const inner = U().planeGrid();
    const region = candidate.kind === "quadrant" ? `<rect class="ch6-plane-region" x="320" y="30" width="290" height="160"></rect><text class="ch6-plane-label is-u" x="545" y="55">第一象限</text>` : "";
    const setLine = candidate.line ? U().line(candidate.line.direction, candidate.line.className, candidate.line.label, candidate.line.offset || [0, 0]) : "";
    const arrows = candidate.arrows.map((arrow) => U().softArrow(arrow.from, arrow.to, arrow.className, arrow.label)).join("");
    return U().planeSvg(inner + region + setLine + arrows, candidate.label);
  }

  function renderInteractive(root, section) {
    const candidates = {
      r2: { label: "整个 ℝ²", kind: "plane", line: null, arrows: [{ from: [0, 0], to: [1.1, 0.4], className: "is-u", label: "u" }, { from: [0, 0], to: [-0.4, 1], className: "is-w", label: "v" }, { from: [0, 0], to: [0.7, 1.4], className: "is-result", label: "u+v" }], gates: [true, true, true], witness: "零向量属于 ℝ²；任意两向量相加、任意实数数乘，结果仍在 ℝ² 中。", conclusion: "是线性空间" },
      line: { label: "过原点直线 y=x", kind: "plane", line: { direction: [1, 1], className: "is-u", label: "span{(1,1)}" }, arrows: [{ from: [0, 0], to: [1, 1], className: "is-u", label: "u" }, { from: [0, 0], to: [-1.25, -1.25], className: "is-w", label: "−1.25u" }], gates: [true, true, true], witness: "所有元素都形如 t(1,1)。相加或乘任意实数后，仍沿同一条直线。", conclusion: "是 ℝ² 的一维子空间" },
      affine: { label: "不过原点直线 x+y=1", kind: "plane", line: { direction: [1, -1], offset: [0.5, 0.5], className: "is-bad-line", label: "x+y=1" }, arrows: [{ from: [0, 0], to: [1, 0], className: "is-u", label: "u" }, { from: [0, 0], to: [0, 1], className: "is-w", label: "v" }, { from: [0, 0], to: [1, 1], className: "is-bad", label: "u+v" }], gates: [false, false, false], witness: "零向量不满足 x+y=1；而 (1,0)+(0,1)=(1,1) 也不在直线上。", conclusion: "不是线性空间，是仿射直线" },
      quadrant: { label: "第一象限", kind: "quadrant", arrows: [{ from: [0, 0], to: [1.2, 0.7], className: "is-u", label: "u" }, { from: [0, 0], to: [-1.2, -0.7], className: "is-bad", label: "−u" }], gates: [true, true, false], witness: "第一象限包含零向量，并且对加法封闭；但乘以 −1 后，反例向量 −u 落到第三象限。", conclusion: "不是线性空间：负数数乘失败" },
      rgb: { label: "RGB 颜色立方体 [0,1]³", kind: "rgb", u: [0.7, 0.45, 0.3], result: [1.4, 0.9, 0.6], operationLabel: "2u", gates: [true, true, false], witness: "2u 的 R 通道变为 1.4，超出允许范围 [0,1]。", conclusion: "不是 ℝ 上的线性空间" },
      p1: { label: "P₂ 中常数项为 1 的多项式", kind: "polynomial", element: "p(x)=1+x", operationTitle: "乘以标量 2", operation: "2p(x)=2+2x\\notin S", gates: [false, false, false], witness: "零多项式不在 S 中，且乘以 2 后常数项由 1 变成 2。", conclusion: "不是线性空间，是仿射集合" },
    };
    let key = "line";
    root.innerHTML = `<div data-ch6-closure-lab></div>`;
    const host = root.querySelector("[data-ch6-closure-lab]");

    function render() {
      const candidate = candidates[key];
      const controls = U().segmented([["r2", "整个 ℝ²"], ["line", "过原点直线"], ["affine", "不过原点直线"], ["quadrant", "第一象限"], ["rgb", "RGB 立方体"], ["p1", "常数项为 1"]], "space-case", key);
      const [zero, add, scale] = candidate.gates;
      const readout = `<div class="ch6-gate-stack">${U().gate("1. 含零向量", "space-zero")}${U().gate("2. 加法封闭", "space-add")}${U().gate("3. 任意数乘封闭", "space-scale")}</div><div class="ch6-current-story"><span>当前候选</span><h4>${candidate.label}</h4><p>${candidate.witness}</p></div><div class="ch6-conclusion-box ${zero && add && scale ? "is-ok" : "is-bad"}"><span>结论</span><strong>${candidate.conclusion}</strong></div><p class="ch6-proof-warning">画面中的失败状态给出一个明确反例；通过状态还需要覆盖任意元素与任意标量的数学证明，单次试验只用于发现规律。</p>`;
      host.innerHTML = U().labShell({ title: "用最短反例检查候选集合", lead: "不要随机试很多数。按固定顺序检查零向量、加法和任意数乘；任何一道出现反例，候选集合立即出局。", focus: "先找离开候选集合的对象，再回答它违反了哪一条规则。", stage: `<div class="ch6-stage-shell"><div class="ch6-stage-caption"><strong>${candidate.conclusion}</strong><span>${candidate.witness}</span></div>${candidateVisual(candidate)}</div>`, controls, readout, tasks: U().taskBlock(section), className: "ch6-closure-lab" });
      U().updateGate(host, "space-zero", zero, zero ? "0 属于集合" : "0 不属于集合");
      U().updateGate(host, "space-add", add, add ? "任意两元素之和仍在集合" : "存在加法反例");
      U().updateGate(host, "space-scale", scale, scale ? "任意标量数乘仍在集合" : "存在数乘反例");
      host.querySelectorAll("[data-space-case]").forEach((button) => button.addEventListener("click", () => { key = button.dataset.spaceCase; render(); }));
    }
    render();
  }

  U().register("vector-space-definition", renderFormal, renderInteractive);
})();
