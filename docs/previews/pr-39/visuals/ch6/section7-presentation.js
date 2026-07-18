(() => {
  const U = () => window.Ch6UI;

  function uniquenessProof() {
    return `<div class="ch6-uniqueness-proof"><div>${U().texDisplay("v=u_1+w_1=u_2+w_2")}</div><span>把同类项移到两边</span><div>${U().texDisplay("u_1-u_2=w_2-w_1")}</div><span>左边属于 U，右边属于 W</span><div>${U().texDisplay("u_1-u_2\\in U\\cap W")}</div><span>若交空间只有零向量</span><div class="is-result">${U().texDisplay("u_1=u_2,\\qquad w_1=w_2")}</div></div>`;
  }

  function renderFormal(root) {
    const modules = [
      U().moduleBlock("01", "直和由两道独立闸门组成", "先保证每个向量能分解，再保证分解不会重复", `<div class="ch6-direct-gates"><article><span>覆盖闸门</span>${U().texDisplay("V=U+W")}<h4>分解存在</h4><p>每个 v∈V 至少能写成 u+w。</p></article><b>+</b><article><span>零交闸门</span>${U().texDisplay("U\\cap W=\\{0\\}")}<h4>分解唯一</h4><p>两个分量之间没有可来回搬运的公共方向。</p></article><b>=</b><article class="is-result"><span>直和</span>${U().texDisplay("V=U\\oplus W")}<h4>唯一分解</h4><p>每个 v 恰有一组 u+w。</p></article></div>`),
      U().moduleBlock("02", "零交为什么等价于唯一性", "假设同一个向量有两种分解，比较它们的差", uniquenessProof()),
      U().moduleBlock("03", "公共方向会制造无穷多分解", "只要存在非零 z∈U∩W，就可以在两个分量之间搬运 z", `<div class="ch6-nonunique-formula">${U().texDisplay("v=u+w=(u+tz)+(w-tz),\\qquad t\\in K")}<p>总和保持不变，但 u 分量与 w 分量随 t 改变，因此分解不唯一。</p></div>`),
      U().moduleBlock("04", "直和不要求正交", "正交直和只是更强、更方便的特殊情形", `<div class="ch6-orthogonal-compare"><article><span>一般直和</span><div class="ch6-oblique-sketch"><i></i><b></b></div><h4>方向可以斜着</h4><p>只需覆盖目标空间且交为零。</p></article><article><span>正交直和</span><div class="ch6-orthogonal-sketch"><i></i><b></b></div><h4>额外要求 U⊥W</h4><p>可以用正交投影直接读取分量。</p></article></div>`),
      U().moduleBlock("05", "基与维数在直和中直接拼接", "两边没有重复方向，因此基可以无损合并", `<div class="ch6-basis-concat"><div><span>U 的基</span><strong>u₁,…,uᵣ</strong></div><b>+</b><div><span>W 的基</span><strong>w₁,…,wₛ</strong></div><b>→</b><div class="is-result"><span>V 的基</span><strong>u₁,…,uᵣ,w₁,…,wₛ</strong></div></div>${U().texDisplay("\\dim V=\\dim U+\\dim W")}`),
    ];
    root.innerHTML = U().formalShell("直和：把“能分解”升级为“唯一分解”", "和空间只保证向量可以由两边合成；直和进一步要求这种合成没有歧义。判断时必须把覆盖与零交分开检查。", modules, "下一节不再比较一个空间内部的分解，而是比较两个不同空间是否拥有相同的线性结构。");
  }

  function renderInteractive(root, section) {
    const cases = {
      oblique: { label: "非正交直和", u: [1, 0.25], w: [0.25, 1], cover: true, zero: true, kind: "independent", note: "方向不垂直，但它们独立并覆盖整个平面，所以分解仍然唯一。" },
      orthogonal: { label: "正交直和", u: [1, 0], w: [0, 1], cover: true, zero: true, kind: "independent", note: "这是直和的特殊情形，两个分量恰好沿坐标轴读取。" },
      overlap: { label: "覆盖平面但交非零", u: null, w: [1, 0.45], cover: true, zero: false, kind: "plane-overlap", note: "令 U=ℝ²、W=span{z}。覆盖当然成立，但 W 整条直线都包含在 U 中，因此分解不唯一。" },
      incomplete: { label: "零交但未覆盖", u: [1, 0.25], w: [0, 0], cover: false, zero: true, kind: "incomplete", note: "W={0} 与 U 交为零，但 U+W 仍只是一条直线，不能覆盖 ℝ²。" },
    };
    let key = "oblique";
    let target = [1.45, 1.05];
    let t = 0;
    root.innerHTML = `<div data-ch6-direct-lab></div>`;
    const host = root.querySelector("[data-ch6-direct-lab]");

    function render() {
      const info = cases[key];
      let vector = target.slice();
      let uPart = [0, 0];
      let wPart = [0, 0];
      let exists = false;
      let unique = false;

      if (info.kind === "independent") {
        const coefficients = U().solve(info.u, info.w, vector);
        exists = Boolean(coefficients);
        unique = exists;
        uPart = U().scale(info.u, coefficients[0]);
        wPart = U().scale(info.w, coefficients[1]);
      } else if (info.kind === "plane-overlap") {
        const z = info.w;
        wPart = U().scale(z, t);
        uPart = U().sub(vector, wPart);
        exists = true;
        unique = false;
      } else {
        const cross = Math.abs(U().cross(info.u, vector));
        exists = cross < 1e-8;
        unique = exists;
        if (exists) {
          const coefficient = U().dot(vector, info.u) / U().dot(info.u, info.u);
          uPart = U().scale(info.u, coefficient);
        }
      }

      let inner = U().planeGrid();
      if (info.kind === "plane-overlap") {
        inner += `<rect class="ch6-plane-fill" x="14" y="14" width="612" height="332" rx="20"></rect><text class="ch6-plane-label is-u" x="520" y="42">U=V=ℝ²</text>`;
        inner += U().line(info.w, "is-overlap", "W=span{z}");
      } else {
        inner += U().line(info.u, "is-u", "U");
        if (U().norm(info.w) > 1e-8) inner += U().line(info.w, info.zero ? "is-w" : "is-overlap", "W");
      }
      if (exists) {
        inner += U().softArrow([0, 0], uPart, "is-u", "u");
        inner += U().softArrow(uPart, vector, "is-w", "w");
      }
      inner += U().softArrow([0, 0], vector, exists ? "is-target" : "is-bad", "目标 v");

      const controls = `${U().segmented([["oblique", "非正交直和"], ["orthogonal", "正交直和"], ["overlap", "覆盖但不唯一"], ["incomplete", "零交但未覆盖"]], "direct-case", key)}${info.kind === "plane-overlap" ? `<div class="ch6-progress-control"><label>把多少公共方向放进 W 分量：t <output>${U().formatNumber(t, 1)}</output><input type="range" min="-1.5" max="1.5" step="0.1" value="${t}" data-direct-t></label><p>w=t z，u=v−t z。拖动后两个分量改变，但总和始终等于 v。</p></div>` : `<div class="ch6-coordinate-sliders"><label>目标 v 横坐标 <output>${U().formatNumber(target[0], 1)}</output><input type="range" min="-2.2" max="2.2" step="0.1" value="${target[0]}" data-direct-vx></label><label>目标 v 纵坐标 <output>${U().formatNumber(target[1], 1)}</output><input type="range" min="-1.8" max="1.8" step="0.1" value="${target[1]}" data-direct-vy></label></div>`}`;
      const final = info.cover && info.zero;
      const readout = `<div class="ch6-gate-stack">${U().gate("1. 覆盖目标空间 V=U+W", "direct-cover")}${U().gate("2. 没有公共非零方向", "direct-zero")}${U().gate("当前目标 v 有分解", "direct-exists")}${U().gate("当前分解唯一", "direct-unique")}</div><div class="ch6-current-story"><span>当前情形</span><h4>${info.label}</h4><p>${info.note}</p></div><div class="ch6-component-reader"><div><span>u 分量</span><strong>${exists ? U().formatVector(uPart) : "—"}</strong></div><div><span>w 分量</span><strong>${exists ? U().formatVector(wPart) : "—"}</strong></div><div><span>u+w</span><strong>${exists ? U().formatVector(U().add(uPart, wPart)) : "无法表示当前 v"}</strong></div></div><div class="ch6-conclusion-box ${final ? "is-ok" : "is-bad"}"><span>能否写 ⊕</span><strong>${final ? "可以：V=U⊕W" : "不可以：至少一道全局闸门失败"}</strong></div>`;

      host.innerHTML = U().labShell({
        title: "把“存在”和“唯一”分成两道闸门",
        lead: "先判断 U+W 是否覆盖整个目标空间，再判断 U 与 W 是否共享非零方向。当前一个 v 的表现不能替代全局条件。",
        focus: info.kind === "plane-overlap" ? "拖动 t：黑色目标 v 不动，但青色 u 与橙色 w 不断改变，这就是非唯一。" : "先看背景是否覆盖整个平面，再看两条方向是否重合。",
        stage: `<div class="ch6-stage-shell">${U().planeSvg(inner, info.label)}</div>`,
        controls,
        readout,
        tasks: U().taskBlock(section),
        className: "ch6-direct-lab",
      });
      U().updateGate(host, "direct-cover", info.cover, info.cover ? "每个目标向量都能由两边合成" : "U+W 没有覆盖整个目标空间");
      U().updateGate(host, "direct-zero", info.zero, info.zero ? "U∩W={0}" : "存在可在两边搬运的公共方向");
      U().updateGate(host, "direct-exists", exists, exists ? "当前 v∈U+W" : "当前 v∉U+W");
      U().updateGate(host, "direct-unique", unique, unique ? "只有这一组分量" : exists ? "改变 t 可得到多组分量" : "分解尚不存在");
      host.querySelectorAll("[data-direct-case]").forEach((button) => button.addEventListener("click", () => {
        key = button.dataset.directCase;
        t = 0;
        target = [1.45, 1.05];
        render();
      }));
      host.querySelector("[data-direct-t]")?.addEventListener("input", (event) => {
        t = Number(event.target.value);
        render();
      });
      host.querySelector("[data-direct-vx]")?.addEventListener("input", (event) => {
        target[0] = Number(event.target.value);
        render();
      });
      host.querySelector("[data-direct-vy]")?.addEventListener("input", (event) => {
        target[1] = Number(event.target.value);
        render();
      });
    }
    render();
  }

  U().register("direct-sum", renderFormal, renderInteractive);
})();
