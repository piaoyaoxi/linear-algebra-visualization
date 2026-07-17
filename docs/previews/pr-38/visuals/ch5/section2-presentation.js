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
      "消去交叉项：配方法与合同消元",
      "标准形是无交叉项的对角二次型。配方法每一步定义新变量；矩阵语言里，这对应一串可逆因子的累积合同 CᵀAC→D。",
      module(
        "1",
        "标准形定义",
        "对角形式，系数一般不唯一",
        `<div class="ch5-poly">${tex("f=d_1y_1^2+\\cdots+d_ry_r^2,\\quad d_i\\neq0")}</div>
         <p class="ch5-muted" style="margin:10px 0 0">非零项个数 r 等于二次型的秩。具体 dᵢ 还可缩放，唯一性见 §3。</p>`,
      ) +
        module(
          "2",
          "配方一步",
          "主平方项吸收交叉项",
          `<p class="ch5-muted">若 a≠0，则 ${tex("ax_1^2+2bx_1x_2+cx_2^2=a\\big(x_1+\\frac{b}{a}x_2\\big)^2+\\big(c-\\frac{b^2}{a}\\big)x_2^2")}。</p>`,
        ) +
        module(
          "3",
          "成对初等变换",
          "行操作必须配合同列操作",
          `<p class="ch5-muted">交换 / 倍乘 / 倍加都要在行与列上同步进行，才能保持对称并对应合法变量替换。禁止把普通行消元直接当作合同变换。</p>`,
        ),
    );
  }

  function mountLab(root) {
    if (!root) return;
    root.innerHTML = `
      <h2>交互实验</h2>
      <div class="ch5-lab">
        <div class="ch5-lab-head">
          <h3>配方步进与坐标解混</h3>
          <p>对二元二次型逐步配方；同步查看等高线从倾斜变为轴对齐，以及累积替换矩阵。</p>
        </div>
        <div class="ch5-lab-grid">
          <div class="ch5-panel">
            <div class="ch5-sliders">
              <label class="ch5-slider-row"><span>a</span><input data-k="a" type="range" min="0.2" max="3" step="0.05" value="1" /><span data-v="a">1</span></label>
              <label class="ch5-slider-row"><span>b</span><input data-k="b" type="range" min="-1.5" max="1.5" step="0.05" value="0.8" /><span data-v="b">0.8</span></label>
              <label class="ch5-slider-row"><span>c</span><input data-k="c" type="range" min="0.2" max="3" step="0.05" value="2" /><span data-v="c">2</span></label>
            </div>
            <div class="ch5-toolbar">
              <button type="button" data-preset="tilt">倾斜椭圆</button>
              <button type="button" data-preset="axis">已对齐</button>
              <button type="button" data-preset="hyper">双曲型</button>
            </div>
            <div class="ch5-stage"><canvas data-contour aria-label="等高线"></canvas></div>
            <div class="ch5-toolbar">
              <button type="button" data-step-btn="prev">上一步</button>
              <button type="button" data-step-btn="next">下一步</button>
              <button type="button" data-step-btn="reset">重置</button>
            </div>
          </div>
          <div class="ch5-panel">
            <div class="ch5-steps" data-steps></div>
            <div class="ch5-readout">
              <strong>累积替换（x = C y）</strong>
              <div data-c-mat></div>
              <p class="ch5-muted">det C = <span data-det></span> · 标准形系数 <span data-std></span></p>
            </div>
          </div>
        </div>
      </div>`;

    const state = { a: 1, b: 0.8, c: 2, step: 0 };

    function A() {
      return M().mat2FromAbc(state.a, state.b, state.c);
    }

    function paint() {
      ["a", "b", "c"].forEach((k) => {
        root.querySelector(`[data-k="${k}"]`).value = String(state[k]);
        root.querySelector(`[data-v="${k}"]`).textContent = M().formatNum(state[k], 2);
      });
      const mat = A();
      const pack = M().completeSquareSteps2(mat);
      const steps = pack.ok
        ? pack.steps
        : [{ title: "无法直接配方", poly: M().polyPlain2(mat), note: pack.reason }];

      const idx = M().clamp(state.step, 0, steps.length - 1);
      state.step = idx;
      root.querySelector("[data-steps]").innerHTML = steps
        .map(
          (s, i) => `
          <article class="ch5-step ${i === idx ? "is-active" : ""}">
            <h4>${i + 1}. ${s.title}</h4>
            <p><strong>${s.poly}</strong></p>
            <p>${s.note}</p>
          </article>`,
        )
        .join("");

      const C = pack.ok ? pack.C : M().identity(2);
      const std = pack.ok ? pack.standard : [state.a, state.c];
      root.querySelector("[data-c-mat]").innerHTML = M().matrixHtml(C);
      root.querySelector("[data-det]").textContent = M().formatNum(M().det2(C), 3);
      root.querySelector("[data-std]").textContent = pack.ok
        ? `d₁=${M().formatNum(std[0], 3)}, d₂=${M().formatNum(std[1], 3)}`
        : "—";

      // morph contour: blend b toward 0 by step progress
      const t = pack.ok ? idx / Math.max(1, steps.length - 1) : 0;
      const bShow = state.b * (1 - t);
      const Ashow = M().mat2FromAbc(state.a, bShow, state.c);
      M().drawContours(root.querySelector("[data-contour]"), Ashow, {
        caption: t > 0.95 ? "标准形坐标：交叉项消失" : "原坐标：交叉项使等高线倾斜",
      });
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
        if (btn.dataset.preset === "tilt") Object.assign(state, { a: 1, b: 0.9, c: 2, step: 0 });
        if (btn.dataset.preset === "axis") Object.assign(state, { a: 1.5, b: 0, c: 1, step: 0 });
        if (btn.dataset.preset === "hyper") Object.assign(state, { a: 1, b: 0.2, c: -1, step: 0 });
        paint();
      });
    });

    root.querySelectorAll("[data-step-btn]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pack = M().completeSquareSteps2(A());
        const max = pack.ok ? pack.steps.length - 1 : 0;
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
