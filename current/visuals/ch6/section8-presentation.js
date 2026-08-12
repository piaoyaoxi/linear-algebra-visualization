(() => {
  const U = () => window.Ch6UI;

  function renderFormal(root) {
    const modules = [
      U().moduleBlock("01", "同构必须先保持线性运算", "对应关系要让两边的加法与数乘同步", `<div class="ch6-isomorphism-definition"><div>${U().texDisplay("T(au+bv)=aT(u)+bT(v)")}<p>线性保证运算结构被完整保留。</p></div><b>+</b><div>${U().texDisplay("T\\text{ 为双射}")}<p>单射避免信息丢失，满射保证目标空间全部覆盖。</p></div><b>=</b><div class="is-result">${U().texDisplay("V\\cong W")}<p>两个空间拥有相同的线性结构。</p></div></div>`),
      U().moduleBlock("02", "坐标映射是最基本的同构", "选定一组有序基，就把抽象空间翻译成坐标列", `<div class="ch6-coordinate-isomorphism"><div class="ch6-space-token"><span>抽象空间 V</span><strong>v=x₁b₁+⋯+xₙbₙ</strong></div><div class="ch6-iso-arrow"><span>T_B</span><b>↔</b><small>可逆</small></div><div class="ch6-space-token"><span>坐标空间 Kⁿ</span><strong>(x₁,…,xₙ)ᵀ</strong></div></div>${U().texDisplay("T_B:V\\to K^n,\\qquad v\\mapsto[v]_B")}<p class="ch6-centered-note">不同基会给出不同坐标同构；“存在同构”不等于“存在唯一的天然对应”。</p>`),
      U().moduleBlock("03", "P₂ 与 ℝ³：外表不同，结构相同", "多项式的三个系数就是一套坐标", `<div class="ch6-p2-bridge"><article><span>P₂</span>${U().texDisplay("a+bx+cx^2")}<p>元素是多项式。</p></article><div><b>系数对应</b><span>保持加法与数乘</span></div><article><span>ℝ³</span>${U().texDisplay("(a,b,c)^T")}<p>元素是坐标列。</p></article></div><div class="ch6-inverse-pair">${U().texDisplay("T(a+bx+cx^2)=(a,b,c)^T")} ${U().texDisplay("T^{-1}(a,b,c)^T=a+bx+cx^2")}</div>`),
      U().moduleBlock("04", "有限维空间的同构由维数分类", "前提是同一数域，并且两边都有限维", `<div class="ch6-dimension-classifier"><div><span>dim V</span><strong>n</strong></div><b>=</b><div><span>dim W</span><strong>n</strong></div><b>⇔</b><div class="is-result"><span>存在某个线性同构</span><strong>V≅W</strong></div></div><p class="ch6-centered-note">这个结论只保证存在一座结构桥，不保证你随手写下的任意映射都是同构。</p>`),
      U().moduleBlock("05", "同构不等于相等，也不自动保持长度", "线性结构之外还可以附加更多结构", `<div class="ch6-not-equal-grid"><article><span>集合相等</span><h4>元素本身完全相同</h4><p>${U().texInline("V=W")} 是更强的陈述。</p></article><article><span>线性同构</span><h4>加法、数乘结构相同</h4><p>元素可以是多项式、矩阵或函数。</p></article><article><span>还保持长度与角度</span><h4>需要额外的内积条件</h4><p>这比一般线性同构要求更多。</p></article></div>`),
    ];
    root.innerHTML = U().formalShell("同构：识别不同外表背后的同一线性结构", "同构是一座可逆的线性桥：它让两边的加法与数乘完全同步，并允许从输出唯一恢复输入。", modules, "本章到这里形成闭环：先用基把空间坐标化，再用同构说明所有 n 维空间在纯线性结构上都可以与 Kⁿ 对应。");
  }

  function polynomialText([a, b, c]) {
    const signed = (value, symbol) => `${value < 0 ? "−" : "+"} ${U().formatNumber(Math.abs(value), 1)}${symbol}`;
    return `${U().formatNumber(a, 1)} ${signed(b, "x")} ${signed(c, "x²")}`;
  }

  function bridgeSvg(coefficients, mode) {
    const [a, b, c] = coefficients;
    const output = mode === "projection" ? [a, b, 0] : mode === "square" ? [a, b, c * c] : coefficients.slice();
    const mobile = window.matchMedia("(max-width: 680px)").matches;
    const graph = mobile
      ? { left: 34, top: 52, width: 292, height: 150, axisX: 180, axisY: 142, sx: 112, sy: 34 }
      : { left: 42, top: 58, width: 282, height: 238, axisX: 183, axisY: 184, sx: 112, sy: 46 };
    const value = (x) => a + b * x + c * x * x;
    const curve = Array.from({ length: 61 }, (_, index) => {
      const x = -1.18 + index * (2.36 / 60);
      const px = graph.axisX + x * graph.sx;
      const py = Math.max(graph.top + 8, Math.min(graph.top + graph.height - 8, graph.axisY - value(x) * graph.sy));
      return `${index ? "L" : "M"} ${px.toFixed(2)} ${py.toFixed(2)}`;
    }).join(" ");
    const origin = mobile ? [180, 405] : [578, 214];
    const project = ([x, y, z]) => mobile
      ? [origin[0] + x * 38 - y * 28, origin[1] + x * 14 + y * 17 - z * 36]
      : [origin[0] + x * 42 - y * 31, origin[1] + x * 17 + y * 20 - z * 50];
    const originalPoint = project(coefficients);
    const outputPoint = project(output);
    const axes = [
      { end: project([1.8, 0, 0]), label: "a", dx: 7, dy: 8 },
      { end: project([0, 1.8, 0]), label: "b", dx: -13, dy: 8 },
      { end: project([0, 0, 1.8]), label: "c", dx: 7, dy: -2 },
    ];
    const rule = mode === "coordinate"
      ? "T(p)=(a,b,c)"
      : mode === "projection"
        ? "T(p)=(a,b)"
        : "T(p)=(a,b,c²)";
    const targetLabel = mode === "projection" ? "坐标平面 ℝ²" : "坐标空间 ℝ³";
    const correspondence = mode === "coordinate"
      ? `<path class="ch6-iso-link" d="M ${originalPoint[0]} ${originalPoint[1]} L ${outputPoint[0]} ${outputPoint[1]}"></path>`
      : `<path class="ch6-iso-link" d="M ${originalPoint[0]} ${originalPoint[1]} L ${outputPoint[0]} ${outputPoint[1]}"></path><circle class="ch6-iso-original-point" cx="${originalPoint[0]}" cy="${originalPoint[1]}" r="7"></circle>`;

    const viewBox = mobile ? "0 0 360 520" : "0 0 760 350";
    const panels = mobile
      ? `<rect class="ch6-iso-panel" x="16" y="22" width="328" height="202" rx="8"></rect>
         <rect class="ch6-iso-panel" x="16" y="288" width="328" height="210" rx="8"></rect>
         <text class="ch6-iso-panel-title" x="34" y="45">多项式空间 P₂</text>
         <text class="ch6-iso-panel-title" x="34" y="314">${targetLabel}</text>`
      : `<rect class="ch6-iso-panel" x="24" y="34" width="318" height="286" rx="8"></rect>
         <rect class="ch6-iso-panel" x="418" y="34" width="318" height="286" rx="8"></rect>
         <text class="ch6-iso-panel-title" x="42" y="56">多项式空间 P₂</text>
         <text class="ch6-iso-panel-title" x="438" y="56">${targetLabel}</text>`;
    const ruleBridge = mobile
      ? `<g class="ch6-iso-rule"><line x1="180" y1="238" x2="180" y2="274"></line><path d="M 180 274 L 174 264 L 186 264 Z"></path><text x="180" y="254">${rule}</text></g>`
      : `<g class="ch6-iso-rule"><line x1="358" y1="176" x2="402" y2="176"></line><path d="M 402 176 L 392 170 L 392 182 Z"></path><text x="380" y="158">${rule}</text></g>`;
    const polynomialLabelY = mobile ? 214 : 302;
    const outputLabelX = mobile ? 180 : Math.min(684, outputPoint[0] + 12);
    const outputLabelY = mobile ? 484 : Math.max(76, outputPoint[1] - 12);

    return `<svg class="ch6-iso-bridge ${mobile ? "is-mobile" : ""}" viewBox="${viewBox}" role="img" aria-label="多项式与坐标空间之间的结构桥">
      ${panels}
      <line class="ch6-iso-axis" x1="${graph.left}" y1="${graph.axisY}" x2="${graph.left + graph.width}" y2="${graph.axisY}"></line>
      <line class="ch6-iso-axis" x1="${graph.axisX}" y1="${graph.top}" x2="${graph.axisX}" y2="${graph.top + graph.height}"></line>
      <path class="ch6-polynomial-curve" d="${curve}"></path>
      <text class="ch6-polynomial-label" x="${mobile ? 34 : 52}" y="${polynomialLabelY}">p(x)=${U().escapeHtml(polynomialText(coefficients))}</text>
      ${ruleBridge}
      ${axes.map((axis) => `<line class="ch6-iso-axis" x1="${origin[0]}" y1="${origin[1]}" x2="${axis.end[0]}" y2="${axis.end[1]}"></line><text class="ch6-iso-axis-label" x="${axis.end[0] + axis.dx}" y="${axis.end[1] + axis.dy}">${axis.label}</text>`).join("")}
      ${correspondence}
      <circle class="ch6-iso-output-point" cx="${outputPoint[0]}" cy="${outputPoint[1]}" r="7"></circle>
      <text class="ch6-iso-output-label" x="${outputLabelX}" y="${outputLabelY}" text-anchor="${mobile ? "middle" : "start"}">(${output.map((n) => U().formatNumber(n, 1)).join(", ")})</text>
    </svg>`;
  }

  function renderInteractive(root, section) {
    let coefficients = [0.6, -0.7, 0.8];
    let mode = "coordinate";
    root.innerHTML = `<div data-ch6-iso-lab></div>`;
    const host = root.querySelector("[data-ch6-iso-lab]");

    function render() {
      const [a, b, c] = coefficients;
      const output = mode === "projection" ? [a, b] : mode === "square" ? [a, b, c * c] : coefficients.slice();
      const linear = mode !== "square";
      const injective = mode === "coordinate";
      const surjective = mode !== "square";
      const isomorphism = linear && injective && surjective;
      const targetSpace = mode === "projection" ? "ℝ²" : "ℝ³";
      const ruleName = mode === "coordinate" ? "坐标映射" : mode === "projection" ? "投影到前两坐标" : "第三坐标平方";
      const description = mode === "coordinate"
        ? "曲线外形会变，但三个系数被完整送到右侧坐标点，因此可以逐项恢复原多项式。"
        : mode === "projection"
          ? "右侧只保留 a、b，所有只在 x² 系数上不同的多项式都会落到同一个点。"
          : "第三坐标被折到非负半轴，c 与 −c 得到同一输出，同时数乘关系被破坏。";
      const caption = `<strong>${ruleName}</strong><span>${description}</span>`;
      const controls = `${U().segmented([["coordinate", "完整坐标桥"], ["projection", "丢掉 x² 系数"], ["square", "把 c 变成 c²"]], "iso-mode", mode)}<div class="ch6-coefficient-sliders"><label>常数项 a <output>${U().formatNumber(a, 1)}</output><input type="range" min="-1.5" max="1.5" step="0.05" value="${a}" data-iso-coefficient="0"></label><label>x 系数 b <output>${U().formatNumber(b, 1)}</output><input type="range" min="-1.5" max="1.5" step="0.05" value="${b}" data-iso-coefficient="1"></label><label>x² 系数 c <output>${U().formatNumber(c, 1)}</output><input type="range" min="-1.3" max="1.3" step="0.05" value="${c}" data-iso-coefficient="2"></label></div>`;
      const witness = mode === "coordinate"
        ? `${U().texDisplay("T(a+bx+cx^2)=(a,b,c)^T")}<p>三个系数都保留，逆映射可逐项恢复。</p>`
        : mode === "projection"
          ? `${U().texDisplay("T(a+bx+cx^2)=(a,b)^T")}<p>${U().texInline("x^2")} 与 ${U().texInline("2x^2")} 都被送到 ${U().texInline("(0,0)^T")}。</p>`
          : `${U().texDisplay("T(2x^2)=(0,0,4)^T\\neq2T(x^2)")}<p>一个固定反例已经足够否定线性。</p>`;
      const stage = `<div class="ch6-stage-shell"><div class="ch6-stage-caption">${caption}</div>${bridgeSvg(coefficients, mode)}</div>`;
      const readout = `<div class="ch6-gate-stack">${U().gate("1. 保持线性运算", "iso-linear")}${U().gate("2. 单射：输入可唯一恢复", "iso-injective")}${U().gate(`3. 满射到 ${targetSpace}`, "iso-surjective")}</div><div class="ch6-current-story"><span>从画面读结构</span><h4>p(x)=${polynomialText(coefficients)}</h4><p>当前输出为 ${U().formatVector(output)}。${description}</p></div><div class="ch6-iso-witness">${witness}</div><div class="ch6-conclusion-box ${isomorphism ? "is-ok" : "is-bad"}"><span>最终结论</span><strong>${isomorphism ? "线性、单射、满射全部成立：这是同构" : "至少一道结构条件失败：这不是同构"}</strong></div>`;

      host.innerHTML = U().labShell({
        title: "让多项式曲线与坐标点同步变化",
        lead: "拖动三个系数。左侧曲线改变，右侧点同步移动；再改变映射规则，观察哪一部分结构被完整保留、压扁或折叠。",
        focus: "先拖动 c：完整坐标桥会保留上下方向；投影会压到平面；平方会把正负两侧折到同一边。",
        stage,
        controls,
        readout,
        tasks: U().taskBlock(section),
        className: "ch6-iso-lab",
      });
      U().updateGate(host, "iso-linear", linear, linear ? "两种计算路径一致" : "运算保持失败");
      U().updateGate(host, "iso-injective", injective, injective ? "输出可唯一恢复输入" : mode === "projection" ? "不同 x² 系数被压到同一输出" : "c 与 −c 同像");
      U().updateGate(host, "iso-surjective", surjective, surjective ? "声明陪域中的每个向量都有原像" : "第三坐标不能取负值");
      host.querySelectorAll("[data-iso-mode]").forEach((button) => button.addEventListener("click", () => {
        mode = button.dataset.isoMode;
        render();
      }));
      host.querySelectorAll("[data-iso-coefficient]").forEach((input) => input.addEventListener("input", (event) => {
        coefficients[Number(event.target.dataset.isoCoefficient)] = Number(event.target.value);
        render();
      }));
    }
    render();
  }

  U().register("isomorphism", renderFormal, renderInteractive);
})();
