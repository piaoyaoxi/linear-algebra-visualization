(() => {
  const M = () => window.Ch3Math;
  const tex = (s) => (window.texInline ? window.texInline(s) : s);

  function formalShell(title, lead, modulesHtml) {
    return `<h2>${title}</h2><div class="ch3-formal"><p class="ch3-formal-lead">${lead}</p>${modulesHtml}</div>`;
  }

  function module(num, title, sub, body) {
    return `<section class="ch3-module"><div class="ch3-module-heading"><span>${num}</span><div><h3>${title}</h3><p>${sub}</p></div></div>${body}</section>`;
  }

  function mountResultant(root) {
    const presets = {
      circleLine: {
        label: "圆与直线 x−y=0",
        // unit circle + y=x
        type: "circle-line",
        line: [1, -1, 0], // x - y = 0
      },
      circleHoriz: {
        label: "圆与水平线 y=0.5",
        type: "circle-line",
        line: [0, 1, 0.5],
      },
      tangent: {
        label: "相切 y=1",
        type: "circle-line",
        line: [0, 1, 1],
      },
      miss: {
        label: "无实交 y=2",
        type: "circle-line",
        line: [0, 1, 2],
      },
    };
    const state = { key: "circleLine" };

    function solveCircleLine(a, b, c) {
      // a x + b y = c, x^2 + y^2 = 1
      // If b≠0: y = (c - a x)/b
      // If a≠0 and b=0: x = c/a
      const pts = [];
      if (Math.abs(b) > 1e-9) {
        // x^2 + ((c-ax)/b)^2 = 1
        // (b^2 + a^2) x^2 - 2 a c x + c^2 - b^2 = 0
        const A = a * a + b * b;
        const B = -2 * a * c;
        const C = c * c - b * b;
        const disc = B * B - 4 * A * C;
        if (disc >= -1e-10) {
          const s = Math.sqrt(Math.max(0, disc));
          for (const sign of [-1, 1]) {
            const x = (-B + sign * s) / (2 * A);
            const y = (c - a * x) / b;
            pts.push([x, y]);
          }
        }
      } else if (Math.abs(a) > 1e-9) {
        const x = c / a;
        const rest = 1 - x * x;
        if (rest >= -1e-10) {
          const y = Math.sqrt(Math.max(0, rest));
          pts.push([x, y], [x, -y]);
        }
      }
      // unique near-duplicates for tangent
      const uniq = [];
      pts.forEach((p) => {
        if (!uniq.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1e-8)) uniq.push(p);
      });
      return uniq;
    }

    function sylvesterForCircleLineY(line) {
      // Eliminate x for f=x^2 + (y^2-1), g = a x + (b y - c) as poly in x:
      // For line a x + b y = c => a x + (b y - c) = 0
      // If a≠0: g = x + (by-c)/a , monic
      // Demo focuses on a=1,b=-1,c=0 => g=x-y, r=-y, p=0, q=y^2-1
      // Res = resultant = y^2 + (y^2-1) wait - use structure display
      const [a, b, c] = line;
      return { a, b, c };
    }

    function render() {
      const preset = presets[state.key];
      const [a, b, c] = preset.line;
      const candidates = solveCircleLine(a, b, c);
      const verified = candidates.filter(([x, y]) => {
        const onCircle = Math.abs(x * x + y * y - 1) < 1e-6;
        const onLine = Math.abs(a * x + b * y - c) < 1e-6;
        return onCircle && onLine;
      });

      // Sylvester display for monic case when a=1: f=x^2+0x+(y^2-1), g=x + (by-c)
      // For general educational display:
      root.querySelector("[data-f]").textContent = "f(x) = x² + (y² − 1)";
      root.querySelector("[data-g]").textContent =
        Math.abs(a) > 1e-9
          ? `g(x) = x + (${b}·y − ${c})/${a}`
          : `g 不以 x 为首（此预设改用几何求交并强调验解）`;
      root.querySelector("[data-syl]").innerHTML = `
        <div class="ch3-sylvester-row"><span>1</span><span>0</span><span>y²−1</span></div>
        <div class="ch3-sylvester-row"><span>1</span><span>r(y)</span><span>0</span></div>
        <div class="ch3-sylvester-row"><span>0</span><span>1</span><span>r(y)</span></div>`;
      root.querySelector("[data-res]").textContent =
        state.key === "circleLine"
          ? "Res_x(f,g) ∝ 2y² − 1  →  y = ±√2/2"
          : "由圆与直线联立得到关于参数的二次方程（候选）";
      root.querySelector("[data-cand]").textContent = candidates.length
        ? candidates.map((p) => `(${p[0].toFixed(3)}, ${p[1].toFixed(3)})`).join("  ")
        : "无实候选";
      root.querySelector("[data-ver]").textContent = verified.length
        ? verified.map((p) => `(${p[0].toFixed(3)}, ${p[1].toFixed(3)})`).join("  ")
        : "无已验证实交点";
      root.querySelector("[data-count]").textContent = `${verified.length} 个已验证`;
      M().pulseClass(root.querySelector("[data-ver-card]"));

      const canvas = root.querySelector("[data-ch3-canvas]");
      const sized = M().sizeCanvas(canvas);
      if (!sized) return;
      const { ctx, width, height } = sized;
      const frame = M().drawAxes(ctx, width, height, 70);
      // unit circle
      ctx.strokeStyle = frame.p.accent;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(frame.cx, frame.cy, frame.scale, 0, Math.PI * 2);
      ctx.stroke();
      M().drawLineFromEq(ctx, frame, a, b, c, frame.p.coral, 2.4);
      candidates.forEach((p) => M().drawPoint(ctx, frame, p, frame.p.muted, "候选"));
      verified.forEach((p) => M().drawPoint(ctx, frame, p, frame.p.blue, "解"));
    }

    root.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        root.querySelectorAll("[data-preset]").forEach((b) => b.classList.toggle("is-active", b === btn));
        state.key = btn.dataset.preset;
        render();
      });
    });
    root.querySelector("[data-verify]").addEventListener("click", () => {
      render();
      root.querySelector("[data-verify-note]").textContent =
        "已把候选代回 x²+y²=1 与直线方程；仅同时满足两者的点保留为解。";
    });
    window.addEventListener(
      "resize",
      () => {
        if (document.body.contains(root)) render();
      },
      { passive: true },
    );
    render();
  }

  defineChapter3Renderer("binary-higher-degree", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "消元思想升级到曲线",
        "减少变量的主线不变：构造结式得到单变量条件，再回代并验解。本节为选学。",
        module(
          "01",
          "Sylvester 与结式",
          "低次数可读的矩阵证书。",
          `<p class="ch3-note">把 f、g 看成关于 x 的多项式，系数依赖 y。Sylvester 矩阵的行列式是 ${tex("\\operatorname{Res}_x(f,g)")}；在正常次数条件下，它为零对应公共 x 根。</p>`,
        ) +
          module(
            "02",
            "候选必须验解",
            "消元不是无条件等价改写。",
            `<div class="ch3-card-grid">
              <article class="ch3-card"><span class="kicker">回代</span><h4>求另一变量</h4><p>从候选 y 回到 x。</p></article>
              <article class="ch3-card"><span class="kicker">验解</span><h4>代回原方程</h4><p>剔除不成立的候选。</p></article>
              <article class="ch3-card"><span class="kicker">边界</span><h4>退化与重根</h4><p>首项系数变零或相切时需单独解释。</p></article>
            </div>`,
          ),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch3-lab">
          <div class="ch3-lab-head">
            <h3>结式消元台（圆与直线）</h3>
            <p>在低次预设上观察曲线、Sylvester 结构、候选根与验解。不把结式说成无条件万能工具。</p>
          </div>
          <div class="ch3-presets">
            <button type="button" class="is-active" data-preset="circleLine">圆与 y=x</button>
            <button type="button" data-preset="circleHoriz">圆与 y=0.5</button>
            <button type="button" data-preset="tangent">相切 y=1</button>
            <button type="button" data-preset="miss">无实交 y=2</button>
          </div>
          <div class="ch3-lab-grid">
            <div class="ch3-stage"><canvas data-ch3-canvas aria-label="曲线交点"></canvas></div>
            <div class="ch3-side">
              <div class="ch3-meter">
                <div class="ch3-meter-card" data-ver-card><strong>已验证</strong><span data-count>—</span></div>
                <div class="ch3-meter-card"><strong>流程</strong><span style="font-size:12px">消元→回代→验解</span></div>
              </div>
              <div class="ch3-panel"><h4>关于 x 的多项式</h4><p class="ch3-note" data-f></p><p class="ch3-note" data-g></p></div>
              <div class="ch3-panel"><h4>Sylvester 结构</h4><div class="ch3-sylvester" data-syl></div></div>
              <div class="ch3-panel"><h4>结式条件</h4><p class="ch3-note" data-res></p></div>
              <div class="ch3-panel"><h4>候选点</h4><p class="ch3-note" data-cand></p></div>
              <div class="ch3-panel"><h4>验解后</h4><p class="ch3-note" data-ver></p><p class="ch3-note" data-verify-note></p></div>
              <div class="ch3-toolbar"><button type="button" data-verify>执行验解</button></div>
            </div>
          </div>
        </div>`;
      mountResultant(root);
    },
  });
})();
