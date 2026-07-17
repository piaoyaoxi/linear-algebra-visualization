(() => {
  const M = () => window.Ch3Math;
  const tex = (s) => M().tex(s);

  function formalShell(title, lead, body) {
    return `<h2>${title}</h2><div class="ch3-formal"><p class="ch3-formal-lead">${lead}</p>${body}</div>`;
  }

  function module(num, title, sub, body) {
    return `<section class="ch3-module"><div class="ch3-module-heading"><span>${num}</span><div><h3>${title}</h3><p>${sub}</p></div></div>${body}</section>`;
  }

  function mountResultant(root) {
    // Circle x^2+y^2=1 with line ax+by=c
    const presets = {
      circleLine: { label: "圆与 y=x", line: [1, -1, 0], note: "消去 x 后得到 2y²−1=0" },
      circleHoriz: { label: "圆与 y=1/2", line: [0, 1, 0.5], note: "水平线与单位圆两交点" },
      tangent: { label: "相切 y=1", line: [0, 1, 1], note: "重根/相切：候选重合" },
      miss: { label: "无实交 y=2", line: [0, 1, 2], note: "无实候选，不必硬凑实交点" },
    };
    const state = { key: "circleLine", verified: false };

    function solveCircleLine(a, b, c) {
      const pts = [];
      if (Math.abs(b) > 1e-9) {
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
      const uniq = [];
      pts.forEach((p) => {
        if (!uniq.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1e-8)) uniq.push(p);
      });
      return uniq;
    }

    function sylvesterForYX(line) {
      // For circle: f = x^2 + 0·x + (y^2-1)
      // For line ax+by=c with a≠0: g = x + (by-c)/a  monic → r = (by-c)/a
      // Sylvester 3×3:
      // 1  0  q
      // 1  r  0
      // 0  1  r
      const [a, b, c] = line;
      if (Math.abs(a) < 1e-9) {
        return {
          mode: "y-fixed",
          rows: null,
          resText: "此预设固定 y，直接代回圆方程求 x",
        };
      }
      // Keep symbolic r(y)
      return {
        mode: "x-elim",
        rows: [
          ["1", "0", "y^2-1"],
          ["1", "r(y)", "0"],
          ["0", "1", "r(y)"],
        ],
        rExpr: `(${b}y-(${c}))/(${a})`,
        resText:
          state.key === "circleLine"
            ? "Res_x(f,g) = r(y)^2 + (y^2-1) ，且 r(y)=-y ⇒ 2y^2-1=0"
            : `r(y)=${b === 0 ? `${-c}/${a}` : `(${b}y-${c})/${a}`}，结式给出关于 y 的条件`,
      };
    }

    function render() {
      const preset = presets[state.key];
      const [a, b, c] = preset.line;
      const candidates = solveCircleLine(a, b, c);
      const verified = candidates.filter(([x, y]) => {
        return Math.abs(x * x + y * y - 1) < 1e-6 && Math.abs(a * x + b * y - c) < 1e-6;
      });
      const syl = sylvesterForYX(preset.line);

      root.querySelector("[data-f]").innerHTML = tex("f(x)=x^2+(y^2-1)");
      if (Math.abs(a) > 1e-9) {
        const r = b === 0 && c === 0 ? "0" : `\\dfrac{${b}y-(${c})}{${a}}`;
        root.querySelector("[data-g]").innerHTML = tex(`g(x)=x+\\left(${r}\\right)`);
      } else {
        root.querySelector("[data-g]").innerHTML = tex(`\\text{直线 } ${b}y=${c} \\text{（固定 } y\\text{）}`);
      }

      const sylBox = root.querySelector("[data-syl]");
      if (syl.rows) {
        sylBox.innerHTML = syl.rows
          .map(
            (row) =>
              `<div class="ch3-sylvester-row">${row.map((cell) => `<span>${cell}</span>`).join("")}</div>`,
          )
          .join("");
      } else {
        sylBox.innerHTML = `<p class="ch3-note">此预设不走 x-首项消元的 monic 形式，改用几何求交并强调验解。</p>`;
      }
      root.querySelector("[data-res]").textContent = syl.resText;
      root.querySelector("[data-note]").textContent = preset.note;

      const fmt = (p) => `(${M().formatSigned(p[0], 3)},\\, ${M().formatSigned(p[1], 3)})`;
      root.querySelector("[data-cand]").innerHTML = candidates.length
        ? tex(candidates.map(fmt).join("\\;\\;"))
        : tex("\\text{无实候选}");
      root.querySelector("[data-ver]").innerHTML = state.verified
        ? verified.length
          ? tex(verified.map(fmt).join("\\;\\;"))
          : tex("\\text{无已验证实交点}")
        : tex("\\text{尚未验解}");
      root.querySelector("[data-count]").textContent = state.verified
        ? `${verified.length} 个已验证`
        : `${candidates.length} 个候选`;
      M().pulseClass(root.querySelector("[data-ver-card]"));

      const canvas = root.querySelector("[data-ch3-canvas]");
      const sized = M().sizeCanvas(canvas);
      if (!sized) return;
      const { ctx, width, height } = sized;
      const frame = M().drawAxes(ctx, width, height, 70);
      ctx.strokeStyle = frame.p.accent;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(frame.cx, frame.cy, frame.scale, 0, Math.PI * 2);
      ctx.stroke();
      M().drawLineFromEq(ctx, frame, a, b, c, frame.p.coral, 2.5);
      candidates.forEach((p) => M().drawPoint(ctx, frame, p, frame.p.muted, "候选"));
      if (state.verified) {
        verified.forEach((p) => M().drawPoint(ctx, frame, p, frame.p.blue, "解"));
      }
    }

    root.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        root.querySelectorAll("[data-preset]").forEach((b) => b.classList.toggle("is-active", b === btn));
        state.key = btn.dataset.preset;
        state.verified = false;
        root.querySelector("[data-verify-note]").textContent = "";
        render();
      });
    });
    root.querySelector("[data-verify]").addEventListener("click", () => {
      state.verified = true;
      root.querySelector("[data-verify-note]").textContent =
        "已把候选代回 x²+y²=1 与直线方程；仅同时满足两者的点保留为解。结式给出候选，不等于自动跳过验解。";
      render();
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
          `<p class="ch3-note">把 ${tex("f,g")} 看成关于 ${tex("x")} 的多项式，系数依赖 ${tex("y")}。Sylvester 矩阵的行列式是 ${tex("\operatorname{Res}_x(f,g)")}；在正常次数条件下，它为零对应公共 ${tex("x")} 根。</p>`,
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
            <p>观察任务：走完“消元 → 候选 → 回代 → 验解”。不要把结式说成无条件万能工具。</p>
          </div>
          <div class="ch3-presets">
            <button type="button" class="is-active" data-preset="circleLine">圆与 y=x</button>
            <button type="button" data-preset="circleHoriz">圆与 y=1/2</button>
            <button type="button" data-preset="tangent">相切 y=1</button>
            <button type="button" data-preset="miss">无实交 y=2</button>
          </div>
          <div class="ch3-lab-grid">
            <div class="ch3-stage"><canvas data-ch3-canvas aria-label="曲线交点"></canvas></div>
            <div class="ch3-side">
              <div class="ch3-meter">
                <div class="ch3-meter-card" data-ver-card><strong>状态</strong><span data-count>—</span></div>
                <div class="ch3-meter-card"><strong>流程</strong><span class="ch3-small">消元→回代→验解</span></div>
              </div>
              <div class="ch3-panel"><h4>关于 x 的多项式</h4><div data-f class="ch3-math"></div><div data-g class="ch3-math"></div></div>
              <div class="ch3-panel"><h4>Sylvester 结构</h4><div class="ch3-sylvester" data-syl></div></div>
              <div class="ch3-panel"><h4>结式条件</h4><p class="ch3-note" data-res></p><p class="ch3-note" data-note></p></div>
              <div class="ch3-panel"><h4>候选点</h4><div class="ch3-math" data-cand></div></div>
              <div class="ch3-panel"><h4>验解后</h4><div class="ch3-math" data-ver></div><p class="ch3-note" data-verify-note></p></div>
              <div class="ch3-toolbar"><button type="button" data-verify>执行验解</button></div>
            </div>
          </div>
        </div>`;
      mountResultant(root);
    },
  });
})();
