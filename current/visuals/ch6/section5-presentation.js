(() => {
  const U = () => window.Ch6UI;

  function renderFormal(root) {
    const modules = [
      U().moduleBlock("01", "子空间是大空间里的小线性空间", "沿用原来的加法与数乘，不重新发明运算", `<div class="ch6-subspace-definition"><div><span>候选子集</span>${U().texDisplay("U\\subseteq V")}<p>先确认 U 非空。</p></div><b>+</b><div><span>继承运算</span>${U().texDisplay("u+v,\\quad au")}<p>运算仍使用 V 中原有的规则。</p></div><b>→</b><div class="is-result"><span>线性子空间</span>${U().texDisplay("U\\le V")}<p>结果始终留在 U 内。</p></div></div>`),
      U().moduleBlock("02", "统一判定式", "把含零、加法封闭和数乘封闭压缩成一条线性组合检查", `<div class="ch6-unified-test">${U().texDisplay("\\forall u,v\\in U,\\ \\forall \\alpha,\\beta\\in K,\\qquad \\alpha u+\\beta v\\in U")}<div class="ch6-test-decode"><div><strong>取 α=β=0</strong><p>得到 0∈U。</p></div><div><strong>取 α=β=1</strong><p>得到 u+v∈U。</p></div><div><strong>取 β=0</strong><p>得到 αu∈U。</p></div></div></div>`),
      U().moduleBlock("03", "几何上先看是否经过原点", "直线或平面平移离开原点后会失去线性结构", `<div class="ch6-origin-compare"><article><span>线性子空间</span><div class="ch6-origin-sketch is-linear"><i></i><b>0</b></div><h4>过原点</h4><p>例如 ${U().texInline("x+y+z=0")}。</p></article><article><span>仿射集合</span><div class="ch6-origin-sketch is-affine"><i></i><b>0</b></div><h4>平移离开原点</h4><p>例如 ${U().texInline("x+y+z=1")}。</p></article></div><div class="ch6-reading-note"><strong>必要但不充分</strong><p>经过原点后仍需检查加法与任意数乘。第一象限会在负数数乘这一步失败。</p></div>`),
      U().moduleBlock("04", "两类标准来源", "张成空间与齐次方程解集天然满足线性组合封闭", `<div class="ch6-source-pair"><article><span>张成空间</span>${U().texDisplay("\\operatorname{span}\\{v_1,\\ldots,v_k\\}")}<p>线性组合的线性组合仍是原向量组的线性组合。</p></article><article><span>齐次解集</span>${U().texDisplay("U=\\{x:Ax=0\\}")}<p>若 Au=Av=0，则 ${U().texInline("A(\\alpha u+\\beta v)=0")}。</p></article></div>`),
      U().moduleBlock("05", "非齐次解集是仿射平移", "有解时，它等于一个特解加上齐次解空间", `<div class="ch6-affine-formula">${U().texDisplay("Ax=b,\\quad x=x_0+u,\\quad Au=0")}<p>${U().texInline("x_0")} 决定平移位置，齐次解空间决定方向。除非 ${U().texInline("b=0")}，它通常不含零向量。</p></div>`),
    ];
    root.innerHTML = U().formalShell("线性子空间：形状之外，还要保留全部线性运算", "子空间判定取决于原空间中的任意线性组合是否仍留在这个集合里；几何外观只能帮助寻找候选。", modules, "下一节把两个子空间放在一起，分别研究它们共享什么、合起来能生成什么。");
  }

  function visualFor(caseInfo, shift) {
    if (caseInfo.kind === "line") {
      const offset = [shift / 2, -shift / 2];
      const ox = U().plane.origin[0];
      const oy = U().plane.origin[1];
      const displacement = Math.abs(shift) < 1e-8 ? "" : U().softArrow([0, 0], offset, "is-bad", `离原点 ${U().formatNumber(Math.abs(shift) / Math.sqrt(2), 2)}`);
      const inner = U().planeGrid() + U().line([1, 1], Math.abs(shift) < 1e-8 ? "is-u" : "is-bad-line", `x−y=${U().formatNumber(shift, 1)}`, offset) + displacement + `<path class="ch6-origin-cross" d="M ${ox - 6} ${oy} H ${ox + 6} M ${ox} ${oy - 6} V ${oy + 6}"></path><text class="ch6-plane-label is-target" x="${ox + 15}" y="${oy - 12}">零向量</text>`;
      return U().planeSvg(inner, "直线平移与子空间判定");
    }
    if (caseInfo.kind === "quadrant") {
      const inner = U().planeGrid() + `<rect class="ch6-plane-region" x="320" y="30" width="290" height="160"></rect><text class="ch6-plane-label is-u" x="540" y="55">候选集合</text>` + U().softArrow([0, 0], [1.2, 0.8], "is-u", "u") + U().softArrow([0, 0], [-1.2, -0.8], "is-bad", "−u");
      return U().planeSvg(inner, "第一象限的负数数乘反例");
    }
    if (caseInfo.kind === "equation") {
      return `<div class="ch6-equation-stage"><div class="ch6-equation-space ${caseInfo.ok ? "is-ok" : "is-bad"}"><span>${caseInfo.label}</span>${U().texDisplay(caseInfo.formula)}</div><div class="ch6-equation-witness"><span>第一步只代入零向量</span>${U().texDisplay(caseInfo.witnessFormula)}<p>${caseInfo.note}</p></div></div>`;
    }
    return `<div class="ch6-polynomial-stage"><div><span>集合</span>${U().texDisplay(caseInfo.formula)}</div><div class="ch6-polynomial-operation"><article><span>取一个集合中的元素</span>${U().texDisplay(caseInfo.element)}</article><b>→</b><article><span>${caseInfo.operationLabel}</span>${U().texDisplay(caseInfo.operation)}</article></div></div>`;
  }

  function renderInteractive(root, section) {
    const cases = {
      line: { label: "直线族 x−y=t", kind: "line" },
      homogeneous: { label: "齐次平面", kind: "equation", ok: true, formula: "x+y+z=0", witnessFormula: "0+0+0=0", note: "零向量在其中，且方程对线性组合保持。" },
      affine: { label: "非齐次平面", kind: "equation", ok: false, formula: "x+y+z=1", witnessFormula: "0+0+0\\neq1", note: "零向量不在其中，立即否定。" },
      quadrant: { label: "第一象限", kind: "quadrant" },
      pzero: { label: "常数项为 0", kind: "polynomial", ok: true, formula: "S_0=\\{bx+cx^2\\}", element: "p(x)=x+x^2", operationLabel: "任意线性组合", operation: "\\alpha p+\\beta q\\in S_0" },
      pone: { label: "常数项为 1", kind: "polynomial", ok: false, formula: "S_1=\\{1+bx+cx^2\\}", element: "p(x)=1+x", operationLabel: "乘以标量 2", operation: "2p(x)=2+2x\\notin S_1" },
    };
    let key = "line";
    let shift = 0;
    root.innerHTML = `<div data-ch6-subspace-lab></div>`;
    const host = root.querySelector("[data-ch6-subspace-lab]");

    function stateFor() {
      if (key === "line") {
        const ok = Math.abs(shift) < 1e-8;
        return {
          zero: ok,
          add: ok,
          scale: ok,
          story: ok ? "t=0 时，直线可写成 span{(1,1)}，所有线性组合仍沿同一方向。" : "直线只做了平移，但零向量已经离开集合；它是仿射直线。",
          conclusion: ok ? "是一维线性子空间" : "不是子空间",
        };
      }
      if (key === "homogeneous" || key === "pzero") return { zero: true, add: true, scale: true, story: "条件由线性等式给出，任意线性组合仍满足同一条件。", conclusion: "是线性子空间" };
      if (key === "quadrant") return { zero: true, add: true, scale: false, story: "第一象限包含零，且加法封闭；但 −u 说明负标量数乘会离开集合。", conclusion: "不是子空间" };
      return { zero: false, add: false, scale: false, story: "集合不含零向量；无需继续证明，子空间判定已经失败。", conclusion: "不是子空间，是仿射集合" };
    }

    function render() {
      const info = cases[key];
      const state = stateFor();
      const controls = `${U().segmented([["line", "移动直线"], ["homogeneous", "齐次平面"], ["affine", "非齐次平面"], ["quadrant", "第一象限"], ["pzero", "常数项为 0"], ["pone", "常数项为 1"]], "subspace-case", key)}${key === "line" ? `<div class="ch6-progress-control"><label>平移量 t <output>${U().formatNumber(shift, 2)}</output><input type="range" min="-1.5" max="1.5" step="0.05" value="${shift}" data-line-shift></label><p>只有 t=0 时直线经过原点。</p></div>` : ""}`;
      const readout = `<div class="ch6-gate-stack">${U().gate("1. 含零向量", "sub-zero")}${U().gate("2. 加法封闭", "sub-add")}${U().gate("3. 任意数乘封闭", "sub-scale")}</div><div class="ch6-current-story"><span>当前候选</span><h4>${info.label}</h4><p>${state.story}</p></div><div class="ch6-conclusion-box ${state.zero && state.add && state.scale ? "is-ok" : "is-bad"}"><span>最终判定</span><strong>${state.conclusion}</strong></div><p class="ch6-proof-warning">统一判定式 ${U().texInline("\\alpha u+\\beta v\\in U")} 可以一次性概括三道检查；图形只负责帮助你找到最短反例。</p>`;

      host.innerHTML = U().labShell({
        title: "先过原点，再检查线性组合",
        lead: "直线、平面和多项式集合都可能只差一个常数项，却从子空间变成仿射集合。按三步过滤，不靠外形猜。",
        focus: key === "line" ? "先看零向量是否落在直线上；离开原点就立即失败。" : "先找失败的公式或箭头，它给出一个可以直接写进证明的反例。",
        stage: `<div class="ch6-stage-shell"><div class="ch6-stage-caption">${key === "line" ? Math.abs(shift) < 1e-8 ? "<strong>直线经过零向量</strong><span>此时方程齐次，整条直线是一维子空间。</span>" : "<strong>平移使零向量离开集合</strong><span>方向没有变，但线性结构已经失效。</span>" : `<strong>${info.label}</strong><span>${state.story}</span>`}</div>${visualFor(info, shift)}</div>`,
        controls,
        readout,
        tasks: U().taskBlock(section),
        className: "ch6-subspace-lab",
      });
      U().updateGate(host, "sub-zero", state.zero, state.zero ? "0∈U" : "0∉U");
      U().updateGate(host, "sub-add", state.add, state.add ? "u+v 仍在 U" : "存在加法反例");
      U().updateGate(host, "sub-scale", state.scale, state.scale ? "αu 仍在 U" : "存在数乘反例");
      host.querySelectorAll("[data-subspace-case]").forEach((button) => button.addEventListener("click", () => {
        key = button.dataset.subspaceCase;
        render();
      }));
      host.querySelector("[data-line-shift]")?.addEventListener("input", (event) => {
        shift = Number(event.target.value);
        render();
      });
    }
    render();
  }

  U().register("subspaces", renderFormal, renderInteractive);
})();
