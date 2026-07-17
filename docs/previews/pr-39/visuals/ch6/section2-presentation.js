(() => {
  const U = () => window.Ch6UI;
  function objectCards() {
    const cards = [["几何向量", "\\mathbb{R}^2", "逐分量相加与数乘"], ["多项式", "P_2", "系数逐项相加与数乘"], ["矩阵", "M_{2}(\\mathbb{R})", "对应元素相加与数乘"], ["函数", "C[a,b]", "逐点相加与数乘"]];
    return `<div class="ch6-object-grid">${cards.map(([label, formula, note]) => `<article><span>${label}</span>${U().texDisplay(formula)}<p>${note}</p></article>`).join("")}</div>`;
  }
  function axiomGroups() {
    return `<div class="ch6-axiom-grid"><article><span>加法形成阿贝尔群</span>${U().texDisplay("u+v=v+u,\\quad (u+v)+w=u+(v+w)")}${U().texDisplay("u+0=u,\\quad u+(-u)=0")}<p>零向量与加法逆元都属于同一个集合。</p></article><article><span>数乘与数域相容</span>${U().texDisplay("1u=u,\\quad (ab)u=a(bu)")}${U().texDisplay("a(u+v)=au+av,\\quad (a+b)u=au+bu")}<p>两条分配律把标量运算和向量运算接起来。</p></article></div>`;
  }
  function renderFormal(root) {
    const modules = [
      U().moduleBlock("01", "线性空间研究共同的运算结构", "元素可以长得完全不同，只要加法与数乘遵守同一套规则", `${objectCards()}<div class="ch6-definition-banner"><div><span>一套线性空间必须同时给出</span><strong>集合 V · 数域 K · 加法 · 数乘</strong></div>${U().texDisplay("+:V\\times V\\to V,\\qquad \\cdot:K\\times V\\to V")}</div>`),
      U().moduleBlock("02", "八条公理按两组理解", "先把加法结构站稳，再检查数乘怎样与它配合", axiomGroups()),
      U().moduleBlock("03", "简单性质由公理推出", "这些结论不是额外假设，证明时要知道用了什么", `<div class="ch6-property-flow"><div>${U().texDisplay("0v=(0+0)v=0v+0v")}<p>两边加上 ${U().texInline("-(0v)")}，得到 ${U().texInline("0v=0")}。</p></div><div>${U().texDisplay("(-1)v+v=(-1+1)v=0v=0")}<p>因此 ${U().texInline("(-1)v=-v")}。</p></div><div>${U().texDisplay("a0=a(0+0)=a0+a0")}<p>同理得到 ${U().texInline("a0=0")}。</p></div></div>`),
      U().moduleBlock("04", "判断候选集合：优先寻找最短反例", "一个反例足以否定，有限次试验通过不能代替证明", `<div class="ch6-counterexample-table"><div><strong>先看零向量</strong><span>不过原点的直线、常数项为 1 的多项式集合立即失败。</span></div><div><strong>再看负数数乘</strong><span>第一象限、非负函数集合常在 ${U().texInline("-1")} 倍处失败。</span></div><div><strong>再看放大与相加</strong><span>RGB 颜色立方体有上下界，${U().texInline("2u")} 或 ${U().texInline("u+v")} 会越界。</span></div><div><strong>最后核对公理</strong><span>若集合来自已知线性空间的子空间，很多公理会自动继承。</span></div></div>`),
    ];
    root.innerHTML = U().formalShell("线性空间：忘掉外观，只保留加法与数乘", "几何箭头只是线性空间的一种模型。真正需要检查的是：运算是否定义良好、结果是否仍在集合中，以及零元、逆元和分配律是否成立。", modules, "下一节开始研究有限维空间怎样被一组最小的独立方向描述。");
  }
  function candidateVisual(candidate) {
    if (candidate.kind === "rgb") {
      const rows = [["u", candidate.u], [candidate.operationLabel, candidate.result]];
      return `<div class="ch6-rgb-stage">${rows.map(([label, vector]) => `<div class="ch6-rgb-row"><strong>${label} = ${U().formatVector(vector)}</strong>${vector.map((value, index) => `<div class="ch6-rgb-channel"><span>${["R", "G", "B"][index]}</span><i><b style="width:${Math.max(0, Math.min(1, value)) * 100}%"></b></i><em class="${value < 0 || value > 1 ? "is-out" : ""}">${U().formatNumber(value)}</em></div>`).join("")}</div>`).join("")}</div>`;
    }
    if (candidate.kind === "polynomial") return `<div class="ch6-polynomial-stage"><div><span>集合条件</span>${U().texDisplay(candidate.condition)}</div><div class="ch6-polynomial-operation"><article><span>取元素</span>${U().texDisplay(candidate.element)}</article><b>→</b><article><span>${candidate.operationTitle}</span>${U().texDisplay(candidate.operation)}</article></div></div>`;
    const inner = U().planeGrid();
    const region = candidate.kind === "quadrant" ? `<rect class="ch6-plane-region" x="320" y="30" width="290" height="160"></rect>` : "";
    const setLine = candidate.line ? U().line(candidate.line.direction, candidate.line.className, candidate.line.label, candidate.line.offset || [0, 0]) : "";
    const arrows = candidate.arrows.map((arrow) => U().softArrow(arrow.from, arrow.to, arrow.className, arrow.label)).join("");
    return U().planeSvg(inner + region + setLine + arrows, candidate.label);
  }
  function renderInteractive(root, section) {
    const candidates = {
      r2: { label: "ℝ²", kind: "plane", line: null, arrows: [{ from: [0,0], to: [1.1,.4], className: "is-u", label: "u" }, { from: [0,0], to: [-.4,1], className: "is-w", label: "v" }, { from: [0,0], to: [.7,1.4], className: "is-result", label: "u+v" }], gates: [true,true,true], witness: "任意两向量相加、任意实数数乘，结果仍在 ℝ² 中。", conclusion: "是线性空间" },
      line: { label: "过原点直线 y=x", kind: "plane", line: { direction: [1,1], className: "is-u", label: "span{(1,1)}" }, arrows: [{ from: [0,0], to: [1,1], className: "is-u", label: "u" }, { from: [0,0], to: [-1.25,-1.25], className: "is-w", label: "−1.25u" }], gates: [true,true,true], witness: "所有元素都形如 t(1,1)，线性组合仍具有同样形式。", conclusion: "是 ℝ² 的一维子空间" },
      affine: { label: "不过原点直线 x+y=1", kind: "plane", line: { direction: [1,-1], offset: [.5,.5], className: "is-bad-line", label: "x+y=1" }, arrows: [{ from: [0,0], to: [1,0], className: "is-u", label: "u" }, { from: [0,0], to: [0,1], className: "is-w", label: "v" }, { from: [0,0], to: [1,1], className: "is-bad", label: "u+v" }], gates: [false,false,false], witness: "0 不满足 x+y=1；而 (1,0)+(0,1)=(1,1) 也不在直线上。", conclusion: "不是线性空间，是仿射直线" },
      quadrant: { label: "第一象限", kind: "quadrant", arrows: [{ from: [0,0], to: [1.2,.7], className: "is-u", label: "u" }, { from: [0,0], to: [-1.2,-.7], className: "is-bad", label: "−u" }], gates: [true,true,false], witness: "零向量和向量和仍在象限内，但 −u 离开第一象限。", conclusion: "不是线性空间：负数数乘失败" },
      rgb: { label: "RGB 颜色立方体 [0,1]³", kind: "rgb", u: [.7,.45,.3], result: [1.4,.9,.6], operationLabel: "2u", gates: [true,true,false], witness: "2u 的红色通道变为 1.4，超出允许范围 [0,1]。", conclusion: "不是 ℝ 上的线性空间" },
      p1: { label: "P₂ 中常数项为 1 的多项式", kind: "polynomial", condition: "S=\\{a+bx+cx^2:a=1\\}", element: "p(x)=1+x", operationTitle: "数乘 2", operation: "2p(x)=2+2x\\notin S", gates: [false,false,false], witness: "零多项式不在 S 中，且数乘 2 后常数项由 1 变成 2。", conclusion: "不是线性空间，是仿射集合" },
    };
    let key = "r2";
    root.innerHTML = `<h2>交互实验</h2><div data-ch6-closure-lab></div>`;
    const host = root.querySelector("[data-ch6-closure-lab]");
    function render() {
      const candidate = candidates[key];
      const controls = U().segmented([["r2","ℝ²"],["line","过原点直线"],["affine","不过原点直线"],["quadrant","第一象限"],["rgb","RGB 立方体"],["p1","常数项为 1"]], "space-case", key);
      const [zero, add, scale] = candidate.gates;
      host.innerHTML = U().labShell({ title: "线性空间体检", lead: "不要随机试很多数。先找最短的反例：零向量、两个元素的和，或一个负数/放大数乘。", focus: "图中红色对象就是反例；一旦出现，候选集合立即出局。", stage: `<div class="ch6-stage-shell">${candidateVisual(candidate)}</div>`, controls, readout: `<div class="ch6-current-story"><span>当前候选</span><h4>${candidate.label}</h4><p>${candidate.witness}</p></div><div class="ch6-gate-stack">${U().gate("含零向量", "space-zero")}${U().gate("加法封闭", "space-add")}${U().gate("任意数乘封闭", "space-scale")}</div><div class="ch6-conclusion-box ${zero && add && scale ? "is-ok" : "is-bad"}"><span>结论</span><strong>${candidate.conclusion}</strong></div><p class="ch6-proof-warning">提示：绿色勾表示这个候选确实满足该条件；不是只由图中一次试验得出。</p>`, tasks: U().taskBlock(section), className: "ch6-closure-lab" });
      U().updateGate(host, "space-zero", zero, zero ? "0 属于集合" : "0 不属于集合");
      U().updateGate(host, "space-add", add, add ? "任意两元素之和仍在集合" : "存在加法反例");
      U().updateGate(host, "space-scale", scale, scale ? "任意标量数乘仍在集合" : "存在数乘反例");
      host.querySelectorAll("[data-space-case]").forEach((button) => button.addEventListener("click", () => { key = button.dataset.spaceCase; render(); }));
    }
    render();
  }
  U().register("vector-space-definition", renderFormal, renderInteractive);
})();
