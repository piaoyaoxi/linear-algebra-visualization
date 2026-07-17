(() => {
  const M = () => window.Ch5Math;
  const tex = (s) => (window.texInline ? window.texInline(s) : s);
  const display = (s) => (window.texDisplay ? window.texDisplay(s) : s);

  function formalShell(title, lead, body) {
    return `<h2>${title}</h2><div class="ch5-formal"><p class="ch5-formal-lead">${lead}</p>${body}</div>`;
  }

  function module(num, title, sub, body) {
    return `<section class="ch5-module"><div class="ch5-module-heading"><span>${num}</span><div><h3>${title}</h3><p>${sub}</p></div></div>${body}</section>`;
  }

  function renderFormal(formal) {
    if (!formal) return;
    formal.innerHTML = formalShell(
      "二次型怎样变成对称矩阵",
      "二次齐次多项式与实对称矩阵互相唯一决定。交叉项在矩阵乘法里出现两次，所以非对角元各放一半；非退化替换 x=Cy 对应合同 CᵀAC。",
      module(
        "1",
        "展开恒等式",
        "交叉项系数为什么要平分",
        `${display("\\begin{bmatrix}x_1&x_2\\end{bmatrix}\\begin{bmatrix}a&b\\\\b&c\\end{bmatrix}\\begin{bmatrix}x_1\\\\x_2\\end{bmatrix}=ax_1^2+2bx_1x_2+cx_2^2")}
         <p class="ch5-muted" style="margin:12px 0 0">乘法时 b 出现两次，因此多项式里的交叉项系数 2b 在矩阵中写作 a₁₂=a₂₁=b。</p>`,
      ) +
        module(
          "2",
          "为什么只看对称矩阵",
          "斜对称部分对二次型无贡献",
          `<p class="ch5-muted">任意方阵 ${tex("B=S+K")}，其中 ${tex("S=(B+B^T)/2")} 对称、${tex("K=(B-B^T)/2")} 斜对称。标量 ${tex("x^TKx")} 等于自己的相反数，故为 0，于是 ${tex("x^TBx=x^TSx")}。</p>`,
        ) +
        module(
          "3",
          "变量替换与合同",
          "左右各出现一个 C",
          `${display("f(x)=x^TAx=(Cy)^TA(Cy)=y^T(C^TAC)y")}
           <p class="ch5-muted" style="margin:12px 0 0">合同要求 C 可逆。det C=0 时替换退化，不能再称为合同，惯性定理的前提也不成立。</p>`,
        ),
    );
  }

  function mountLab(root) {
    if (!root) return;
    root.innerHTML = `
      <h2>交互实验</h2>
      <div class="ch5-lab">
        <div class="ch5-lab-head">
          <h3>多项式—矩阵同步 · 合同桥</h3>
          <p>调节二次型系数，观察对称矩阵与等高线同步变化；再切换到合同桥，验证可逆替换与不可逆反例。</p>
        </div>

        <div class="ch5-toolbar" data-mode-bar role="tablist">
          <button type="button" class="is-active" data-mode="sync" role="tab">① 多项式 ↔ 矩阵</button>
          <button type="button" data-mode="congruence" role="tab">② 合同桥</button>
        </div>

        <div data-pane="sync">
          <div class="ch5-lab-grid">
            <div class="ch5-panel">
              <div class="ch5-poly" data-poly aria-live="polite"></div>
              <div class="ch5-sliders">
                <label class="ch5-slider-row"><span>a · x₁²</span><input data-k="a" type="range" min="-2" max="3" step="0.05" value="2" /><span data-v="a">2</span></label>
                <label class="ch5-slider-row"><span>b · 交叉</span><input data-k="b" type="range" min="-2" max="2" step="0.05" value="0.8" /><span data-v="b">0.8</span></label>
                <label class="ch5-slider-row"><span>c · x₂²</span><input data-k="c" type="range" min="-2" max="3" step="0.05" value="1.5" /><span data-v="c">1.5</span></label>
              </div>
              <div class="ch5-toolbar">
                <button type="button" data-preset="diag">对角</button>
                <button type="button" data-preset="cross">仅交叉项</button>
                <button type="button" data-preset="tilt">倾斜</button>
                <button type="button" data-preset="zero">零二次型</button>
              </div>
              <div class="ch5-toolbar" data-term-bar>
                <button type="button" data-term="a">高亮 a（对角）</button>
                <button type="button" data-term="b">高亮 2b（对称位）</button>
                <button type="button" data-term="c">高亮 c（对角）</button>
              </div>
              <div class="ch5-stage"><canvas data-contour aria-label="二次型等高线"></canvas></div>
            </div>
            <div class="ch5-panel">
              <div class="ch5-readout">
                <strong>对称矩阵 A</strong>
                <div data-matrix-a class="ch5-matrix-wrap"></div>
                <p class="ch5-muted" data-hot-note>拖动滑块或点“高亮”，看多项式项与矩阵格如何对应。</p>
              </div>
              <div class="ch5-readout">
                <strong>对应规则</strong>
                <ul class="ch5-rule-list">
                  <li>平方项 ${tex("a x_1^2")} → 对角元 ${tex("a_{11}=a")}</li>
                  <li>交叉项 ${tex("2b x_1x_2")} → ${tex("a_{12}=a_{21}=b")}</li>
                  <li>平方项 ${tex("c x_2^2")} → 对角元 ${tex("a_{22}=c")}</li>
                </ul>
              </div>
              <div class="ch5-meters">
                <div class="ch5-meter"><span>秩</span><strong data-rank>—</strong></div>
                <div class="ch5-meter"><span>det A</span><strong data-det-a>—</strong></div>
              </div>
              <div class="ch5-readout">
                <strong>抽样核对 xᵀAx</strong>
                <div data-checks class="ch5-checks"></div>
              </div>
            </div>
          </div>
        </div>

        <div data-pane="congruence" hidden>
          <div class="ch5-lab-grid">
            <div class="ch5-panel">
              <div class="ch5-readout">
                <strong>固定的二次型矩阵 A</strong>
                <div data-cong-a class="ch5-matrix-wrap"></div>
                <p class="ch5-muted">A 来自上一页的系数 a,b,c（切回模式 ① 可改）。</p>
              </div>
              <div class="ch5-toolbar" data-c-presets>
                <button type="button" class="is-active" data-c="id">单位</button>
                <button type="button" data-c="scale">倍乘</button>
                <button type="button" data-c="shear">剪切</button>
                <button type="button" data-c="swap">交换</button>
                <button type="button" data-c="sing">不可逆反例</button>
              </div>
              <div class="ch5-sliders">
                <label class="ch5-slider-row"><span>c₁₁</span><input data-ck="0" type="range" min="-2" max="2" step="0.05" value="1" /><span data-cv="0">1</span></label>
                <label class="ch5-slider-row"><span>c₁₂</span><input data-ck="1" type="range" min="-2" max="2" step="0.05" value="0" /><span data-cv="1">0</span></label>
                <label class="ch5-slider-row"><span>c₂₁</span><input data-ck="2" type="range" min="-2" max="2" step="0.05" value="0" /><span data-cv="2">0</span></label>
                <label class="ch5-slider-row"><span>c₂₂</span><input data-ck="3" type="range" min="-2" max="2" step="0.05" value="1" /><span data-cv="3">1</span></label>
              </div>
              <div class="ch5-readout">
                <strong>替换矩阵 C</strong>
                <div data-cong-c class="ch5-matrix-wrap"></div>
              </div>
            </div>
            <div class="ch5-panel">
              <div class="ch5-readout" data-cong-card>
                <strong>B = Cᵀ A C</strong>
                <div data-cong-b class="ch5-matrix-wrap"></div>
                <p class="ch5-muted">det C = <span data-detc></span>
                  · <span data-cong-status class="ch5-status">—</span></p>
                <p class="ch5-muted" data-cong-note></p>
              </div>
              <div class="ch5-readout">
                <strong>函数值是否一致</strong>
                <p class="ch5-muted">取 y，令 x=Cy，比较 xᵀAx 与 yᵀBy（可逆时二者必须相等）。</p>
                <div data-value-check class="ch5-checks"></div>
              </div>
              <div class="ch5-stage is-short"><canvas data-cong-contour aria-label="合同后等高线"></canvas></div>
            </div>
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
      tilt: { a: 1.2, b: 0.9, c: 1.8 },
      zero: { a: 0, b: 0, c: 0 },
    };

    const cPresets = {
      id: [
        [1, 0],
        [0, 1],
      ],
      scale: [
        [1.6, 0],
        [0, 0.7],
      ],
      shear: [
        [1, 0.9],
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

    function matA() {
      return M().mat2FromAbc(state.a, state.b, state.c);
    }

    function paint(opts = {}) {
      const mat = matA();
      const highlight =
        state.hot === "a"
          ? { i: 0, j: 0, twin: false }
          : state.hot === "c"
            ? { i: 1, j: 1, twin: false }
            : state.hot === "b"
              ? { i: 0, j: 1, twin: true }
              : null;

      root.querySelector("[data-poly]").innerHTML = tex(`f=${M().polyTex2(mat)}`);
      ["a", "b", "c"].forEach((k) => {
        root.querySelector(`[data-k="${k}"]`).value = String(state[k]);
        root.querySelector(`[data-v="${k}"]`).textContent = M().formatNum(state[k], 2);
      });
      root.querySelector("[data-matrix-a]").innerHTML = M().matrixHtml(mat, { highlight });
      if (state.hot === "b") {
        root.querySelector('.ch5-cell[data-i="1"][data-j="0"]')?.classList.add("is-twin");
      }

      root.querySelector("[data-hot-note]").textContent =
        state.hot === "b"
          ? "交叉项 2b：两个对称位置 a₁₂ 与 a₂₁ 同时高亮，各填 b。"
          : state.hot === "a"
            ? "平方项 a 只对应对角元 a₁₁。"
            : state.hot === "c"
              ? "平方项 c 只对应对角元 a₂₂。"
              : "拖动滑块或点“高亮”，看多项式项与矩阵格如何对应。";

      root.querySelector("[data-rank]").textContent = String(M().matrixRank(mat));
      root.querySelector("[data-det-a]").textContent = M().formatNum(M().det2(mat), 3);

      const checks = M().randomChecks(mat, 3);
      root.querySelector("[data-checks]").innerHTML = checks
        .map((item) => {
          const x1 = M().formatNum(item.x[0], 2);
          const x2 = M().formatNum(item.x[1], 2);
          return `<div class="ch5-check-row"><span>x=(${x1}, ${x2})</span><strong>${M().formatNum(item.value, 3)}</strong></div>`;
        })
        .join("");

      M().drawContours(root.querySelector("[data-contour]"), mat, {
        caption: "等高线：交叉项使图形相对坐标轴倾斜",
      });

      // congruence pane
      root.querySelector("[data-cong-a]").innerHTML = M().matrixHtml(mat);
      root.querySelector("[data-cong-c]").innerHTML = M().matrixHtml(state.C);
      const detC = M().det2(state.C);
      const invertible = Math.abs(detC) > 1e-8;
      const B = M().symmetrize(M().congruence(mat, state.C));
      root.querySelector("[data-cong-b]").innerHTML = M().matrixHtml(B);
      root.querySelector("[data-detc]").textContent = M().formatNum(detC, 3);

      const st = root.querySelector("[data-cong-status]");
      if (invertible) {
        st.textContent = "合同成立";
        st.className = "ch5-status is-ok";
        root.querySelector("[data-cong-note]").textContent =
          "C 可逆：A 与 B 合同。二次型在变量替换下只是换了坐标写法，数值一致。";
      } else {
        st.textContent = "非合同";
        st.className = "ch5-status is-bad";
        root.querySelector("[data-cong-note]").textContent =
          "det C = 0：替换把平面压到低维，无法反解，不能称为合同变换。";
      }

      const ySamples = [
        [1, 0],
        [0, 1],
        [1, 1],
      ];
      root.querySelector("[data-value-check]").innerHTML = ySamples
        .map((y) => {
          const x = M().matVec(state.C, y);
          const left = M().qForm(mat, x);
          const right = M().qForm(B, y);
          const ok = invertible && Math.abs(left - right) < 1e-6;
          return `<div class="ch5-check-row">
            <span>y=(${M().formatNum(y[0])},${M().formatNum(y[1])}) → x=Cy</span>
            <strong class="${ok ? "is-ok-text" : ""}">${M().formatNum(left, 3)} ${invertible ? "≈" : "vs"} ${M().formatNum(right, 3)}</strong>
          </div>`;
        })
        .join("");

      M().drawContours(root.querySelector("[data-cong-contour]"), B, {
        caption: invertible ? "合同后的等高线（形状可变）" : "退化替换后的图像（仅观察）",
      });

      const flat = [state.C[0][0], state.C[0][1], state.C[1][0], state.C[1][1]];
      flat.forEach((v, i) => {
        root.querySelector(`[data-ck="${i}"]`).value = String(v);
        root.querySelector(`[data-cv="${i}"]`).textContent = M().formatNum(v, 2);
      });

      if (opts.pulse) M().pulseClass(root.querySelector("[data-cong-card]"));
    }

    root.querySelectorAll("[data-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.mode = btn.dataset.mode;
        root.querySelectorAll("[data-mode]").forEach((b) => b.classList.toggle("is-active", b === btn));
        root.querySelector('[data-pane="sync"]').hidden = state.mode !== "sync";
        root.querySelector('[data-pane="congruence"]').hidden = state.mode !== "congruence";
        paint({ pulse: true });
      });
    });

    root.querySelectorAll("[data-k]").forEach((input) => {
      input.addEventListener("input", () => {
        state[input.dataset.k] = Number(input.value);
        state.hot = input.dataset.k;
        root.querySelectorAll("[data-term]").forEach((b) => b.classList.toggle("is-active", b.dataset.term === state.hot));
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
        state.hot = null;
        paint({ pulse: true });
      });
    });

    root.querySelectorAll("[data-c]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.C = M().cloneMat(cPresets[btn.dataset.c]);
        root.querySelectorAll("[data-c]").forEach((b) => b.classList.toggle("is-active", b === btn));
        paint({ pulse: true });
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
        root.querySelectorAll("[data-c]").forEach((b) => b.classList.remove("is-active"));
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
