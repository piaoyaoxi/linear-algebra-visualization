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
      "配方法：消去交叉项",
      "标准形是无交叉项的对角二次型。教材主方法是配方法；矩阵语言里，每一步对应可逆替换的累积合同 CᵀAC → D。标准形系数一般不唯一。",
      module(
        "1",
        "标准形",
        "对角形式，非零项个数 = 秩",
        `${display("f=d_1y_1^2+\\cdots+d_ry_r^2\\ (d_i\\neq 0)")}
         <p class="ch5-muted" style="margin:12px 0 0">存在性由配方法或合同初等变换保证；具体 dᵢ 还可缩放，唯一性见 §3。</p>`,
      ) +
        module(
          "2",
          "配方一步",
          "主平方项吸收交叉项",
          `<p class="ch5-muted">若 a≠0，则 ${tex("ax_1^2+2bx_1x_2+cx_2^2=a\\bigl(x_1+\\tfrac{b}{a}x_2\\bigr)^2+\\bigl(c-\\tfrac{b^2}{a}\\bigr)x_2^2")}。</p>
           <p class="ch5-muted">若先出现纯交叉项而没有平方项，先做和差替换，再配方。</p>`,
        ) +
        module(
          "3",
          "合同初等变换",
          "行操作必须配合同列操作",
          `<p class="ch5-muted">对对称矩阵做合同变换时，交换/倍乘/倍加都要在行与列上同步进行，才能保持对称并对应合法变量替换。不要把普通行消元直接当作合同变换。</p>`,
        ),
    );
  }

  function mountLab(root) {
    if (!root) return;
    root.innerHTML = `
      <h2>交互实验</h2>
      <div class="ch5-lab">
        <div class="ch5-lab-head">
          <h3>配方步进器</h3>
          <p>逐步配方，同步查看当前多项式、替换矩阵 C、合同后的矩阵 B=CᵀAC，以及等高线在新表达下如何变为轴对齐。</p>
        </div>
        <div class="ch5-lab-grid">
          <div class="ch5-panel">
            <div class="ch5-sliders">
              <label class="ch5-slider-row"><span>a</span><input data-k="a" type="range" min="-2" max="3" step="0.05" value="1" /><span data-v="a">1</span></label>
              <label class="ch5-slider-row"><span>b</span><input data-k="b" type="range" min="-2" max="2" step="0.05" value="0.8" /><span data-v="b">0.8</span></label>
              <label class="ch5-slider-row"><span>c</span><input data-k="c" type="range" min="-2" max="3" step="0.05" value="2" /><span data-v="c">2</span></label>
            </div>
            <div class="ch5-toolbar">
              <button type="button" data-preset="tilt">倾斜椭圆型</button>
              <button type="button" data-preset="axis">已对角</button>
              <button type="button" data-preset="hyper">不定型</button>
              <button type="button" data-preset="cross">纯交叉项</button>
            </div>
            <div class="ch5-stage"><canvas data-contour aria-label="当前二次型等高线"></canvas></div>
            <div class="ch5-toolbar">
              <button type="button" data-step-btn="prev">上一步</button>
              <button type="button" data-step-btn="next">下一步</button>
              <button type="button" data-step-btn="reset">重置到起点</button>
            </div>
            <p class="ch5-muted" data-step-label>步骤 1 / 1</p>
          </div>
          <div class="ch5-panel">
            <div class="ch5-steps" data-steps></div>
            <div class="ch5-readout">
              <strong>当前替换 x = C y</strong>
              <div data-c-mat class="ch5-matrix-wrap"></div>
              <p class="ch5-muted">det C = <span data-det>—</span>（必须非零）</p>
            </div>
            <div class="ch5-readout">
              <strong>当前矩阵（合同后）</strong>
              <div data-d-mat class="ch5-matrix-wrap"></div>
              <p class="ch5-muted">标准形系数：<span data-std>—</span></p>
            </div>
          </div>
        </div>
      </div>`;

    const state = { a: 1, b: 0.8, c: 2, step: 0 };

    function mat() {
      return M().mat2FromAbc(state.a, state.b, state.c);
    }

    function paint() {
      ["a", "b", "c"].forEach((k) => {
        root.querySelector(`[data-k="${k}"]`).value = String(state[k]);
        root.querySelector(`[data-v="${k}"]`).textContent = M().formatNum(state[k], 2);
      });

      const pack = M().completeSquareSteps2(mat());
      const steps = pack.steps || [];
      const max = Math.max(0, steps.length - 1);
      state.step = M().clamp(state.step, 0, max);
      const cur = steps[state.step] || { title: "—", poly: "—", note: "—", matrix: mat(), C: M().identity(2) };

      root.querySelector("[data-steps]").innerHTML = steps
        .map((s, i) => {
          const active = i === state.step ? " is-active" : i < state.step ? " is-done" : "";
          return `<article class="ch5-step${active}">
            <h4>${i + 1}. ${s.title}</h4>
            <p class="ch5-step-poly">${s.poly}</p>
            <p>${s.note}</p>
          </article>`;
        })
        .join("");

      root.querySelector("[data-step-label]").textContent = `步骤 ${state.step + 1} / ${steps.length}`;

      const C = cur.C || pack.C || M().identity(2);
      const showMat = cur.matrix || pack.D || mat();
      root.querySelector("[data-c-mat]").innerHTML = M().matrixHtml(C);
      root.querySelector("[data-d-mat]").innerHTML = M().matrixHtml(showMat);
      root.querySelector("[data-det]").textContent = M().formatNum(M().det2(C), 3);
      if (pack.standard) {
        root.querySelector("[data-std]").textContent = `d₁=${M().formatNum(pack.standard[0], 3)}, d₂=${M().formatNum(pack.standard[1], 3)}`;
      } else {
        root.querySelector("[data-std]").textContent = "—";
      }

      // Show the matrix that the student is "looking at" this step
      const drawA = state.step >= steps.length - 1 && pack.D ? pack.D : showMat;
      const caption =
        cur.kind === "check" || cur.kind === "done"
          ? "标准形坐标：等高线相对新轴对齐（无交叉项）"
          : cur.kind === "sub"
            ? "完成替换后的二次型"
            : "原坐标：交叉项使等高线倾斜";
      M().drawContours(root.querySelector("[data-contour]"), drawA, { caption });
    }

    root.querySelectorAll("[data-k]").forEach((input) => {
      input.addEventListener("input", () => {
        state[input.dataset.k] = Number(input.value);
        state.step = 0;
        paint();
      });
    });

    root.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const p = btn.dataset.preset;
        if (p === "tilt") Object.assign(state, { a: 1, b: 0.9, c: 2, step: 0 });
        if (p === "axis") Object.assign(state, { a: 1.5, b: 0, c: 1, step: 0 });
        if (p === "hyper") Object.assign(state, { a: 1, b: 0.3, c: -1.2, step: 0 });
        if (p === "cross") Object.assign(state, { a: 0, b: 1, c: 0, step: 0 });
        paint();
      });
    });

    root.querySelectorAll("[data-step-btn]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pack = M().completeSquareSteps2(mat());
        const max = Math.max(0, (pack.steps || []).length - 1);
        if (btn.dataset.stepBtn === "next") state.step = Math.min(max, state.step + 1);
        if (btn.dataset.stepBtn === "prev") state.step = Math.max(0, state.step - 1);
        if (btn.dataset.stepBtn === "reset") state.step = 0;
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

  window.defineChapter5Renderer("quadratic-standard-form", {
    formal: renderFormal,
    interactive: mountLab,
  });
})();
