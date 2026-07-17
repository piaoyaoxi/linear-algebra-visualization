(() => {
  const M = () => window.Ch5Math;
  const tex = (s) => (window.texInline ? window.texInline(s) : s);

  function formalShell(title, lead, modulesHtml) {
    return `<h2>${title}</h2><div class="ch5-formal"><p class="ch5-formal-lead">${lead}</p>${modulesHtml}</div>`;
  }

  function module(num, title, sub, body) {
    return `<section class="ch5-module"><div class="ch5-module-heading"><span>${num}</span><div><h3>${title}</h3><p>${sub}</p></div></div>${body}</section>`;
  }

  function renderFormal(formal) {
    if (!formal) return;
    formal.innerHTML = formalShell(
      "从多项式到对称矩阵，再到合同",
      "交叉项在矩阵乘法里会出现两次，所以非对角元各放系数的一半。变量替换 x=Cy 在左右两侧各留下一个 C，得到合同矩阵 CᵀAC。",
      module(
        "1",
        "展开恒等式",
        "看清 2b 从哪里来",
        `<div class="ch5-poly">${tex("\\begin{bmatrix}x_1&x_2\\end{bmatrix}\\begin{bmatrix}a&b\\\\b&c\\end{bmatrix}\\begin{bmatrix}x_1\\\\x_2\\end{bmatrix}=ax_1^2+2bx_1x_2+cx_2^2")}</div>
         <p class="ch5-muted" style="margin:10px 0 0">矩阵的一个非对角元会在乘法中出现两次，因此多项式里的交叉项系数要平分到两个对称位置。</p>`,
      ) +
        module(
          "2",
          "斜对称部分贡献为 0",
          "为何只看对称矩阵",
          `<p class="ch5-muted">${tex("B=S+K")}，其中 ${tex("S=(B+B^T)/2")} 对称，${tex("K=(B-B^T)/2")} 斜对称。标量 ${tex("x^TKx")} 等于自身的相反数，故必为 0。</p>`,
        ) +
        module(
          "3",
          "合同来自两侧的 C",
          "非退化替换的矩阵语言",
          `<div class="ch5-poly">${tex("f(x)=x^TAx=(Cy)^TA(Cy)=y^T(C^TAC)y")}</div>
           <p class="ch5-muted" style="margin:10px 0 0">C 必须可逆。det C=0 时替换退化，不能再称为合同。</p>`,
        ),
    );
  }

  function mountLab(root) {
    if (!root) return;
    root.innerHTML = `
      <h2>交互实验</h2>
      <div class="ch5-lab">
        <div class="ch5-lab-head">
          <h3>多项式—矩阵同步与合同桥</h3>
          <p>左侧调节二次型系数并高亮对应矩阵位置；右侧选择替换矩阵 C，观察 B=CᵀAC 与合同状态。</p>
        </div>
        <div class="ch5-toolbar" data-mode-bar>
          <button type="button" class="is-active" data-mode="sync">多项式 ↔ 矩阵</button>
          <button type="button" data-mode="congruence">合同桥</button>
        </div>
        <div class="ch5-lab-grid" data-sync-view>
          <div class="ch5-panel">
            <div class="ch5-poly" data-poly></div>
            <div class="ch5-sliders">
              <label class="ch5-slider-row"><span>a</span><input data-k="a" type="range" min="-2" max="3" step="0.05" value="2" /><span data-v="a">2</span></label>
              <label class="ch5-slider-row"><span>b</span><input data-k="b" type="range" min="-2" max="2" step="0.05" value="0.8" /><span data-v="b">0.8</span></label>
              <label class="ch5-slider-row"><span>c</span><input data-k="c" type="range" min="-2" max="3" step="0.05" value="1.5" /><span data-v="c">1.5</span></label>
            </div>
            <div class="ch5-toolbar">
              <button type="button" data-preset="diag">对角</button>
              <button type="button" data-preset="cross">单交叉项</button>
              <button type="button" data-preset="zero">零二次型</button>
              <button type="button" data-preset="pd">正定样例</button>
            </div>
            <div class="ch5-stage" data-contour-wrap><canvas data-contour aria-label="等高线"></canvas></div>
          </div>
          <div class="ch5-panel">
            <div class="ch5-readout">
              <strong>对称矩阵 A</strong>
              <div data-matrix-a></div>
              <p class="ch5-muted" data-hot-note>点击滑块或下方项，高亮对应位置。</p>
            </div>
            <div class="ch5-toolbar" data-term-bar>
              <button type="button" data-term="a">a x₁²</button>
              <button type="button" data-term="b">2b x₁x₂</button>
              <button type="button" data-term="c">c x₂²</button>
            </div>
            <div class="ch5-readout">
              <strong>秩</strong>
              <span data-rank class="ch5-status">—</span>
              <p class="ch5-muted">二次型的秩 = 对称矩阵的秩。本节不展开惯性分类。</p>
            </div>
          </div>
        </div>
        <div class="ch5-lab-grid" data-cong-view hidden>
          <div class="ch5-panel">
            <div class="ch5-readout">
              <strong>固定 A（当前二次型）</strong>
              <div data-cong-a></div>
            </div>
            <div class="ch5-toolbar" data-c-presets>
              <button type="button" class="is-active" data-c="id">单位</button>
              <button type="button" data-c="scale">倍乘</button>
              <button type="button" data-c="shear">剪切</button>
              <button type="button" data-c="swap">交换</button>
              <button type="button" data-c="sing">不可逆</button>
            </div>
            <div class="ch5-sliders" data-c-sliders>
              <label class="ch5-slider-row"><span>c₁₁</span><input data-ck="0" type="range" min="-2" max="2" step="0.05" value="1" /><span data-cv="0">1</span></label>
              <label class="ch5-slider-row"><span>c₁₂</span><input data-ck="1" type="range" min="-2" max="2" step="0.05" value="0" /><span data-cv="1">0</span></label>
              <label class="ch5-slider-row"><span>c₂₁</span><input data-ck="2" type="range" min="-2" max="2" step="0.05" value="0" /><span data-cv="2">0</span></label>
              <label class="ch5-slider-row"><span>c₂₂</span><input data-ck="3" type="range" min="-2" max="2" step="0.05" value="1" /><span data-cv="3">1</span></label>
            </div>
          </div>
          <div class="ch5-panel">
            <div class="ch5-readout" data-cong-card>
              <strong>B = CᵀAC</strong>
              <div data-cong-b></div>
              <p class="ch5-muted">det C = <span data-detc></span> · 状态 <span data-cong-status class="ch5-status">—</span></p>
              <p class="ch5-muted" data-cong-note></p>
            </div>
            <div class="ch5-stage is-short"><canvas data-cong-contour aria-label="合同后等高线"></canvas></div>
          </div>
        </div>
      </div>`;

    const state = {
      a: 2,
      b: 0.8,
      c: 1.5,
      hot: null,
      mode: "sync",
      C: [
        [1, 0],
        [0, 1],
      ],
    };

    const presets = {
      diag: { a: 2, b: 0, c: 1 },
      cross: { a: 0, b: 1, c: 0 },
      zero: { a: 0, b: 0, c: 0 },
      pd: { a: 2, b: 0.4, c: 1.5 },
    };

    const cPresets = {
      id: [
        [1, 0],
        [0, 1],
      ],
      scale: [
        [1.5, 0],
        [0, 0.7],
      ],
      shear: [
        [1, 0.8],
        [0, 1],
      ],
      swap: [
        [0, 1],
        [1, 0],
      ],
      sing: [
        [1, 2],
        [0.5, 1],
      ],
    };

    function A() {
      return M().mat2FromAbc(state.a, state.b, state.c);
    }

    function writeCsliders() {
      const flat = [state.C[0][0], state.C[0][1], state.C[1][0], state.C[1][1]];
      flat.forEach((v, i) => {
        const input = root.querySelector(`[data-ck="${i}"]`);
        const lab = root.querySelector(`[data-cv="${i}"]`);
        if (input) input.value = String(v);
        if (lab) lab.textContent = M().formatNum(v, 2);
      });
    }

    function paint() {
      const mat = A();
      const highlight =
        state.hot === "a"
          ? { i: 0, j: 0 }
          : state.hot === "c"
            ? { i: 1, j: 1 }
            : state.hot === "b"
              ? { i: 0, j: 1 }
              : null;

      root.querySelector("[data-poly]").innerHTML = tex(`f=${M().polyTex2(mat)}`);
      ["a", "b", "c"].forEach((k) => {
        const input = root.querySelector(`[data-k="${k}"]`);
        const lab = root.querySelector(`[data-v="${k}"]`);
        if (input) input.value = String(state[k]);
        if (lab) lab.textContent = M().formatNum(state[k], 2);
      });
      root.querySelector("[data-matrix-a]").innerHTML = M().matrixHtml(mat, { highlight });
      if (state.hot === "b") {
        // also mark twin
        const twin = root.querySelector('.ch5-cell[data-i="1"][data-j="0"]');
        twin?.classList.add("is-twin");
      }
      const rank = M().matrixRank(mat);
      const rankEl = root.querySelector("[data-rank]");
      rankEl.textContent = `rank = ${rank}`;
      rankEl.className = `ch5-status ${rank === 0 ? "is-muted" : "is-ok"}`;
      root.querySelector("[data-hot-note]").textContent =
        state.hot === "b"
          ? "交叉项 2b 对应 a₁₂ 与 a₂₁ 两个位置，各填 b。"
          : state.hot === "a"
            ? "平方项 a 对应唯一对角元 a₁₁。"
            : state.hot === "c"
              ? "平方项 c 对应唯一对角元 a₂₂。"
              : "点击滑块或项按钮，高亮对应位置。";

      M().drawContours(root.querySelector("[data-contour]"), mat, {
        caption: "等高线预告 · 交叉项使图形倾斜",
      });

      // congruence pane
      root.querySelector("[data-cong-a]").innerHTML = M().matrixHtml(mat);
      const detC = M().det2(state.C);
      const invertible = Math.abs(detC) > 1e-8;
      const B = M().congruence(mat, state.C);
      const Bs = M().symmetrize(B);
      root.querySelector("[data-cong-b]").innerHTML = M().matrixHtml(Bs);
      root.querySelector("[data-detc]").textContent = M().formatNum(detC, 3);
      const st = root.querySelector("[data-cong-status]");
      if (invertible) {
        st.textContent = "合同合法";
        st.className = "ch5-status is-ok";
        root.querySelector("[data-cong-note]").textContent = "C 可逆：A 与 B 合同，二次型值在替换下一致。";
      } else {
        st.textContent = "非合同";
        st.className = "ch5-status is-bad";
        root.querySelector("[data-cong-note]").textContent = "det C=0：替换退化，信息压到低维，不能称为合同。";
      }
      M().drawContours(root.querySelector("[data-cong-contour]"), Bs, {
        caption: invertible ? "合同后的等高线" : "退化替换后的图像（仅观察）",
      });
      writeCsliders();
      M().pulseClass(root.querySelector("[data-cong-card]"));
    }

    root.querySelectorAll("[data-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.mode = btn.dataset.mode;
        root.querySelectorAll("[data-mode]").forEach((b) => b.classList.toggle("is-active", b === btn));
        root.querySelector("[data-sync-view]").hidden = state.mode !== "sync";
        root.querySelector("[data-cong-view]").hidden = state.mode !== "congruence";
        paint();
      });
    });

    root.querySelectorAll("[data-k]").forEach((input) => {
      input.addEventListener("input", () => {
        state[input.dataset.k] = Number(input.value);
        state.hot = input.dataset.k;
        paint();
      });
    });

    root.querySelectorAll("[data-term]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.hot = btn.dataset.term;
        root.querySelectorAll("[data-term]").forEach((b) => b.classList.toggle("is-active", b === btn));
        paint();
      });
    });

    root.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        Object.assign(state, presets[btn.dataset.preset]);
        paint();
      });
    });

    root.querySelectorAll("[data-c]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.C = M().cloneMat(cPresets[btn.dataset.c]);
        root.querySelectorAll("[data-c]").forEach((b) => b.classList.toggle("is-active", b === btn));
        paint();
      });
    });

    root.querySelectorAll("[data-ck]").forEach((input) => {
      input.addEventListener("input", () => {
        const flat = [state.C[0][0], state.C[0][1], state.C[1][0], state.C[1][1]];
        flat[Number(input.dataset.ck)] = Number(input.value);
        state.C = [
          [flat[0], flat[1]],
          [flat[2], flat[3]],
        ];
        paint();
      });
    });

    window.addEventListener(
      "resize",
      () => {
        if (document.body.contains(root)) paint();
      },
      { passive: true },
    );
    paint();
  }

  window.defineChapter5Renderer("quadratic-matrix", {
    formal: renderFormal,
    interactive: mountLab,
  });
})();
