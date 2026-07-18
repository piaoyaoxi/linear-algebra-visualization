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
    root.innerHTML = U().formalShell("同构：识别不同外表背后的同一线性结构", "同构不是“看起来相像”，也不是“元素类型相同”。它要求一座可逆的线性桥，让两边的运算完全同步。", modules, "本章到这里形成闭环：先用基把空间坐标化，再用同构说明所有 n 维空间在纯线性结构上都可以与 Kⁿ 对应。");
  }

  const addVectors = (a, b) => a.map((value, index) => value + b[index]);
  const scaleVector = (vector, scalar) => vector.map((value) => scalar * value);
  const nearlyEqual = (a, b) => a.length === b.length && a.every((value, index) => Math.abs(value - b[index]) < 1e-8);

  function polynomialText(coefficients) {
    const [a, b, c] = coefficients;
    const signed = (value, symbol) => `${value < 0 ? "−" : "+"} ${U().formatNumber(Math.abs(value), 1)}${symbol}`;
    return `${U().formatNumber(a, 1)} ${signed(b, "x")} ${signed(c, "x²")}`;
  }

  function renderInteractive(root, section) {
    const f = [1, -0.5, 0.8];
    const g = [-0.4, 1.1, -0.6];
    let alpha = 1.2;
    let beta = -0.7;
    let mode = "coordinate";
    let basis = "standard";
    root.innerHTML = `<div data-ch6-iso-lab></div>`;
    const host = root.querySelector("[data-ch6-iso-lab]");

    function coordinates(vector) {
      if (basis === "standard") return vector.slice();
      const [a, b, c] = vector;
      return [a - b, b, c];
    }

    function apply(vector) {
      const coords = coordinates(vector);
      if (mode === "projection") return coords.slice(0, 2);
      if (mode === "square") return [coords[0], coords[1], coords[2] ** 2];
      return coords;
    }

    function render() {
      const h = addVectors(scaleVector(f, alpha), scaleVector(g, beta));
      const tf = apply(f);
      const tg = apply(g);
      const left = apply(h);
      const right = addVectors(scaleVector(tf, alpha), scaleVector(tg, beta));
      const linear = nearlyEqual(left, right);
      const injective = mode === "coordinate";
      const surjective = mode !== "square";
      const isomorphism = linear && injective && surjective;
      const targetSpace = mode === "projection" ? "ℝ²" : "ℝ³";
      const ruleName = mode === "coordinate" ? "坐标映射" : mode === "projection" ? "投影到前两坐标" : "第三坐标平方";
      const description = mode === "coordinate"
        ? `选定基 ${basis === "standard" ? "(1,x,x²)" : "(1,1+x,x²)"} 后，三个坐标完整保存多项式。`
        : mode === "projection"
          ? "丢掉第三坐标后，x² 系数不同的多项式会得到同一输出。它仍然线性且满射到 ℝ²，但不是单射。"
          : "把第三坐标平方会破坏线性；c 与 −c 也得到同一输出，而且负的第三坐标无法被命中。";

      const controls = `${U().segmented([["coordinate", "坐标同构"], ["projection", "丢掉 x² 系数"], ["square", "末坐标平方"]], "iso-mode", mode)}${mode === "coordinate" ? U().segmented([["standard", "基 (1,x,x²)"], ["shifted", "基 (1,1+x,x²)"]], "iso-basis", basis) : ""}<div class="ch6-coordinate-sliders"><label>α <output>${U().formatNumber(alpha, 1)}</output><input type="range" min="-2" max="2" step="0.1" value="${alpha}" data-iso-alpha></label><label>β <output>${U().formatNumber(beta, 1)}</output><input type="range" min="-2" max="2" step="0.1" value="${beta}" data-iso-beta></label></div>`;

      const stage = `<div class="ch6-stage-shell"><div class="ch6-iso-paths" data-iso-paths><article class="ch6-iso-path"><span>路径 A：先组合，再应用 T</span><div class="ch6-iso-path-flow"><article><small>h=αf+βg</small><strong>${polynomialText(h)}</strong></article><b>→ T →</b><article><small>T(h)</small><strong>${U().formatVector(left)}</strong></article></div><div class="ch6-iso-path-result">结果 A = ${U().formatVector(left)}</div></article><article class="ch6-iso-path"><span>路径 B：先应用 T，再组合</span><div class="ch6-iso-path-flow"><article><small>αT(f)+βT(g)</small><strong>${U().formatVector(right)}</strong></article><b>→ 合并 →</b><article><small>右侧结果</small><strong>${U().formatVector(right)}</strong></article></div><div class="ch6-iso-path-result">结果 B = ${U().formatVector(right)}</div></article></div><div class="ch6-iso-compare-verdict ${linear ? "is-ok" : "is-bad"}">${linear ? "两条路径一致：这一组计算没有破坏线性" : "两条路径不一致：线性条件失败"}</div></div>`;

      const readout = `<div class="ch6-gate-stack">${U().gate("1. 保持加法与数乘", "iso-linear")}${U().gate("2. 单射：不丢失信息", "iso-injective")}${U().gate(`3. 满射到 ${targetSpace}`, "iso-surjective")}</div><div class="ch6-current-story"><span>当前规则</span><h4>${ruleName}</h4><p>${description}</p></div><div class="ch6-conclusion-box ${isomorphism ? "is-ok" : "is-bad"}"><span>最终结论</span><strong>${isomorphism ? "三道检查全部通过，是线性同构" : "至少一道检查失败，不是线性同构"}</strong></div>${isomorphism ? `<div class="ch6-inverse-readout"><span>可以反向恢复</span>${U().texDisplay(basis === "standard" ? "(a,b,c)^T\\mapsto a+bx+cx^2" : "(r,s,t)^T\\mapsto(r+s)+sx+tx^2")}</div>` : ""}`;

      host.innerHTML = U().labShell({
        title: "先比较两条计算路径，再检查是否双射",
        lead: "线性不是一句标签。把同一个输入沿两条路径计算，结果必须一致；随后还要分别确认单射和满射。",
        focus: "先比较主画面中的“结果 A”和“结果 B”，不要先看下面的最终结论。",
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
      host.querySelectorAll("[data-iso-basis]").forEach((button) => button.addEventListener("click", () => {
        basis = button.dataset.isoBasis;
        render();
      }));
      host.querySelector("[data-iso-alpha]").addEventListener("input", (event) => {
        alpha = Number(event.target.value);
        render();
      });
      host.querySelector("[data-iso-beta]").addEventListener("input", (event) => {
        beta = Number(event.target.value);
        render();
      });
    }
    render();
  }

  U().register("isomorphism", renderFormal, renderInteractive);
})();
