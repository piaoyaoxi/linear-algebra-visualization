(() => {
  const M = () => window.Ch3Math;
  const tex = (source) => M().tex(source);
  const texD = (source) => M().texD(source);

  function formalShell(title, lead, body) {
    return `<h2>${title}</h2><div class="ch3-formal"><p class="ch3-formal-lead">${lead}</p>${body}</div>`;
  }
  function module(number, title, subtitle, body) {
    return `<section class="ch3-module"><div class="ch3-module-heading"><span>${number}</span><div><h3>${title}</h3><p>${subtitle}</p></div></div>${body}</section>`;
  }
  function cards(items) {
    return `<div class="ch3-card-grid">${items.map(([kicker, title, text]) => `<article class="ch3-card"><span class="kicker">${kicker}</span><h4>${title}</h4><p>${text}</p></article>`).join("")}</div>`;
  }

  function formalHigherDegree(root) {
    if (!root) return;
    root.innerHTML = formalShell(
      "选学：结式消元",
      "这里保留本章最核心的算法动作——消去一个变量、回代另一个变量、最后验解——但把运算对象从线性方程行升级为一元多项式的系数表。",
      module(
        "01",
        "Sylvester 矩阵与结式",
        "公共根问题被编码为一个行列式",
        `<div class="ch3-theorem-row"><div>${texD(String.raw`\operatorname{Res}_x(f,g)=\det S_x(f,g)`)}</div><p>把 f、g 按 x 的次数排列系数并错位堆叠，得到 Sylvester 矩阵。次数正常时，行列式为零恰好表示两多项式关于 x 有公共根。</p></div>`,
      ) +
        module(
          "02",
          "结式只负责候选",
          "完整解还需要回代与边界检查",
          cards([
            ["选择", "先选消元变量", "优先选择次数较低、系数较简单的方向。"],
            ["候选", "解结式多项式", "得到被保留变量的可能取值，包含重根和复根信息。"],
            ["确认", "逐点回代验解", "求另一坐标，并排除退化或变形过程产生的伪候选。"],
          ]),
        ) +
        `<p class="ch3-source-note">本节为教材选学内容。可视化重点是消元流程与代数边界，不把曲线图当作严格证明。</p>`,
    );
  }

  const PRESETS = {
    crossing: {
      label: "圆与割线",
      equations: ["x^2+y^2-1=0", "x-y=0"],
      describe: "单位圆与直线 x=y 有两个横截交点。",
      modes: {
        x: {
          variable: "x",
          kept: "y",
          polys: ["f=x^2+(y^2-1)", "g=x-y"],
          sylvester: String.raw`\begin{bmatrix}1&0&y^2-1\\1&-y&0\\0&1&-y\end{bmatrix}`,
          resultant: "2y^2-1",
          candidateText: "y=\\pm\\dfrac{\\sqrt2}{2}",
          lines: [{ value: Math.SQRT1_2, label: "y = √2/2" }, { value: -Math.SQRT1_2, label: "y = −√2/2" }],
        },
        y: {
          variable: "y",
          kept: "x",
          polys: ["f=y^2+(x^2-1)", "g=y-x"],
          sylvester: String.raw`\begin{bmatrix}1&0&x^2-1\\1&-x&0\\0&1&-x\end{bmatrix}`,
          resultant: "2x^2-1",
          candidateText: "x=\\pm\\dfrac{\\sqrt2}{2}",
          lines: [{ value: Math.SQRT1_2, label: "x = √2/2" }, { value: -Math.SQRT1_2, label: "x = −√2/2" }],
        },
      },
      candidates: [
        { x: Math.SQRT1_2, y: Math.SQRT1_2, multiplicity: 1, tex: "\\left(\\tfrac{\\sqrt2}{2},\\tfrac{\\sqrt2}{2}\\right)" },
        { x: -Math.SQRT1_2, y: -Math.SQRT1_2, multiplicity: 1, tex: "\\left(-\\tfrac{\\sqrt2}{2},-\\tfrac{\\sqrt2}{2}\\right)" },
      ],
      // points where a candidate line meets the circle but not the line x = y
      rejected: [
        { x: -Math.SQRT1_2, y: Math.SQRT1_2, tex: "\\left(-\\tfrac{\\sqrt2}{2},\\tfrac{\\sqrt2}{2}\\right)", why: "x-y=-\\sqrt2\\ne0" },
        { x: Math.SQRT1_2, y: -Math.SQRT1_2, tex: "\\left(\\tfrac{\\sqrt2}{2},-\\tfrac{\\sqrt2}{2}\\right)", why: "x-y=\\sqrt2\\ne0" },
      ],
      curve: "circle-line",
    },
    tangent: {
      label: "抛物线与切线",
      equations: ["y-x^2=0", "y-2x+1=0"],
      describe: "抛物线 y=x² 与直线 y=2x−1 在 (1,1) 相切。",
      modes: {
        x: {
          variable: "x",
          kept: "y",
          polys: ["f=x^2-y", "g=2x-(y+1)"],
          sylvester: String.raw`\begin{bmatrix}1&0&-y\\2&-(y+1)&0\\0&2&-(y+1)\end{bmatrix}`,
          resultant: "(y-1)^2",
          candidateText: "y=1\\quad(m=2)",
          lines: [{ value: 1, label: "y = 1" }],
          // y = 1 also meets the parabola at (−1, 1), which is not on the tangent line
          rejected: [{ x: -1, y: 1, tex: "(-1,1)", why: "y-2x+1=4\\ne0" }],
        },
        y: {
          variable: "y",
          kept: "x",
          polys: ["f=y-x^2", "g=y-(2x-1)"],
          sylvester: String.raw`\begin{bmatrix}1&-x^2\\1&-(2x-1)\end{bmatrix}`,
          resultant: "(x-1)^2",
          candidateText: "x=1\\quad(m=2)",
          lines: [{ value: 1, label: "x = 1" }],
          rejected: [],
        },
      },
      candidates: [{ x: 1, y: 1, multiplicity: 2, tex: "(1,1)" }],
      curve: "parabola-tangent",
    },
    noReal: {
      label: "无实交点",
      equations: ["x^2+y^2+1=0", "x-y=0"],
      describe: "第一条方程在实平面中没有点，但在复数域中仍可讨论公共根。",
      modes: {
        x: {
          variable: "x",
          kept: "y",
          polys: ["f=x^2+(y^2+1)", "g=x-y"],
          sylvester: String.raw`\begin{bmatrix}1&0&y^2+1\\1&-y&0\\0&1&-y\end{bmatrix}`,
          resultant: "2y^2+1",
          candidateText: "y=\\pm\\dfrac{i}{\\sqrt2}",
          lines: [],
        },
        y: {
          variable: "y",
          kept: "x",
          polys: ["f=y^2+(x^2+1)", "g=y-x"],
          sylvester: String.raw`\begin{bmatrix}1&0&x^2+1\\1&-x&0\\0&1&-x\end{bmatrix}`,
          resultant: "2x^2+1",
          candidateText: "x=\\pm\\dfrac{i}{\\sqrt2}",
          lines: [],
        },
      },
      candidates: [],
      curve: "no-real",
    },
  };

  function interactiveHigherDegree(root) {
    if (!root) return;
    root.innerHTML = `
      <h2>交互实验</h2>
      <div class="ch3-lab" data-ch3-lab="resultant">
        <div class="ch3-lab-head"><h3>从曲线交点到一元方程</h3><p>每点一次“下一步”只做一个代数动作：整理、写 Sylvester 矩阵、求结式、解候选根、回代。第 4 步把候选值画成直线，第 5 步只留下两条曲线的公共点；选“抛物线与切线”，看二重根怎样对应相切。</p></div>
        <div data-resultant-gate></div>
        <div class="ch3-presets">
          <button type="button" class="is-active" data-preset="crossing">圆与割线</button>
          <button type="button" data-preset="tangent">抛物线与切线</button>
          <button type="button" data-preset="noReal">无实交点</button>
        </div>
        <div class="ch3-control-row">
          <span>消去变量</span>
          <label class="form-check"><input class="form-check-input" type="radio" name="ch3-eliminate" value="x" checked data-mode /><span class="form-check-label">x</span></label>
          <label class="form-check"><input class="form-check-input" type="radio" name="ch3-eliminate" value="y" data-mode /><span class="form-check-label">y</span></label>
          <button type="button" data-prev>上一步</button>
          <button type="button" class="button primary is-primary" data-next>下一步</button>
          <button type="button" data-reset>重新开始</button>
        </div>
        <div class="ch3-lab-grid">
          <div class="ch3-stage"><canvas data-canvas aria-label="二元曲线与候选交点"></canvas></div>
          <div class="ch3-side">
            <div class="ch3-meter is-3">
              <div class="ch3-meter-card" data-stage-card><strong>当前阶段</strong><span data-stage>—</span></div>
              <div class="ch3-meter-card"><strong>实候选</strong><span data-candidate-count>—</span></div>
              <div class="ch3-meter-card"><strong>已验证</strong><span data-verified-count>—</span></div>
            </div>
            <div class="ch3-panel"><h4>原方程</h4><div data-equations></div><p class="ch3-note" data-description></p></div>
            <div class="ch3-panel"><h4>当前说明</h4><p data-explanation></p></div>
          </div>
        </div>
        <div class="ch3-resultant-steps">
          <section data-step="1"><h4>1 · 按消元变量整理</h4><div data-polys></div></section>
          <section data-step="2"><h4>2 · Sylvester 矩阵</h4><div data-sylvester></div></section>
          <section data-step="3"><h4>3 · 结式</h4><div data-resultant></div></section>
          <section data-step="4"><h4>4 · 候选根</h4><div data-candidates></div></section>
          <section data-step="5"><h4>5 · 回代验解</h4><div data-verification></div></section>
        </div>
        <div class="viz-callout" data-conclusion></div>
      </div>`;

    const scope = M().createScope(root);
    const canvas = root.querySelector("[data-canvas]");
    const labels = ["观察原系统", "整理系数", "构造 Sylvester", "计算结式", "求候选根", "回代验解"];
    const state = { key: "crossing", mode: "x", step: 0 };
    let gate = null;

    function current() {
      const preset = PRESETS[state.key];
      return { preset, mode: preset.modes[state.mode] };
    }

    function drawCurve(ctx, frame, fn, color, width = 2.4) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      let started = false;
      for (let x = -3.2; x <= 3.2; x += 0.025) {
        const y = fn(x);
        if (!Number.isFinite(y) || Math.abs(y) > 4) {
          started = false;
          continue;
        }
        const point = M().toCanvas(frame, [x, y]);
        if (!started) { ctx.moveTo(...point); started = true; }
        else ctx.lineTo(...point);
      }
      ctx.stroke();
      ctx.restore();
    }

    const cv = () => {
      const st = getComputedStyle(document.body);
      const read = (name, fallback) => st.getPropertyValue(name).trim() || fallback;
      return {
        v1: read("--cv-v1", "#2a64a8"), v2: read("--cv-v2", "#c4552f"), image: read("--cv-image", "#8c4f86"),
        axis: read("--cv-axis", "#8a8d84"), paper: read("--cv-paper", "#fdfcf8"), text: read("--text", "#1d211e"),
      };
    };
    const FONT = "'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";

    function label(ctx, text, x, y, color, align = "left") {
      ctx.save();
      ctx.font = `italic 600 13px ${FONT}`;
      ctx.textAlign = align;
      ctx.lineWidth = 4; ctx.strokeStyle = cv().paper; ctx.strokeText(text, x, y);
      ctx.fillStyle = color; ctx.fillText(text, x, y);
      ctx.restore();
    }

    /*
     * Step 4 draws each real candidate as a line (y = c when x is eliminated, x = c otherwise);
     * the line meets f = 0 in the probe points. Step 5 keeps the points on both curves (filled,
     * glowing) and crosses out the rest. A double root of the resultant is a point of tangency.
     */
    function draw() {
      const sized = M().sizeCanvas(canvas);
      if (!sized) return;
      const { ctx } = sized;
      const frame = M().drawAxes(ctx, sized.width, sized.height, Math.round(Math.max(52, Math.min(84, sized.height / 4.2))));
      const c = cv();
      const { preset, mode } = current();
      if (preset.curve === "circle-line") {
        ctx.save();
        ctx.strokeStyle = c.v1;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(frame.cx, frame.cy, frame.scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        drawCurve(ctx, frame, (x) => x, c.v2);
      } else if (preset.curve === "parabola-tangent") {
        drawCurve(ctx, frame, (x) => x * x, c.v1);
        drawCurve(ctx, frame, (x) => 2 * x - 1, c.v2);
      } else {
        drawCurve(ctx, frame, (x) => x, c.v2);
        ctx.fillStyle = frame.p.muted;
        ctx.font = `600 13px ${FONT}`;
        ctx.fillText("x²+y²+1=0 在实平面中没有轨迹", 16, 28);
      }
      if (state.step < 4) return;
      const horizontal = mode.kept === "y";
      (mode.lines || []).forEach((line, i) => {
        ctx.save();
        ctx.strokeStyle = c.image; ctx.lineWidth = 1.4; ctx.setLineDash([6, 5]);
        ctx.beginPath();
        if (horizontal) {
          const [, py] = M().toCanvas(frame, [0, line.value]);
          ctx.moveTo(0, py); ctx.lineTo(sized.width, py);
        } else {
          const [px] = M().toCanvas(frame, [line.value, 0]);
          ctx.moveTo(px, 0); ctx.lineTo(px, sized.height);
        }
        ctx.stroke();
        ctx.restore();
        if (horizontal) {
          const [, py] = M().toCanvas(frame, [0, line.value]);
          label(ctx, line.label, sized.width - 12, py + (line.value >= 0 ? -8 : 18), c.image, "right");
        } else {
          const [px] = M().toCanvas(frame, [line.value, 0]);
          label(ctx, line.label, px + (line.value >= 0 ? 8 : -8), 22 + i * 18, c.image, line.value >= 0 ? "left" : "right");
        }
      });
      if (!(mode.lines || []).length) {
        ctx.save(); ctx.fillStyle = c.image; ctx.font = `600 13px ${FONT}`;
        ctx.fillText("结式没有实根：没有可画的候选直线", 16, 50); ctx.restore();
      }
      const rejected = preset.rejected || mode.rejected || [];
      const verified = state.step >= 5;
      const probe = (pt) => {
        const [px, py] = M().toCanvas(frame, [pt.x, pt.y]);
        ctx.save(); ctx.strokeStyle = c.image; ctx.lineWidth = 1.6; ctx.fillStyle = c.paper;
        ctx.beginPath(); ctx.arc(px, py, 5.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
      };
      rejected.forEach((pt) => {
        if (!verified) { probe(pt); return; }
        const [px, py] = M().toCanvas(frame, [pt.x, pt.y]);
        ctx.save(); ctx.strokeStyle = c.axis; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(px - 5, py - 5); ctx.lineTo(px + 5, py + 5); ctx.moveTo(px + 5, py - 5); ctx.lineTo(px - 5, py + 5); ctx.stroke();
        ctx.restore();
        label(ctx, "舍去", px - 9, py - 9, c.axis, "right");
      });
      preset.candidates.forEach((pt) => {
        if (!verified) { probe(pt); return; }
        const [px, py] = M().toCanvas(frame, [pt.x, pt.y]);
        ctx.save();
        ctx.globalAlpha = 0.2; ctx.fillStyle = c.image;
        ctx.beginPath(); ctx.arc(px, py, 14, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1; ctx.strokeStyle = c.paper; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.restore();
        label(ctx, pt.multiplicity > 1 ? "二重根：相切" : "公共点", px + 12, py + 18, c.image);
      });
    }

    function render() {
      const { preset, mode } = current();
      root.querySelector("[data-stage]").textContent = labels[state.step];
      root.querySelector("[data-candidate-count]").textContent = state.step >= 4 ? String((mode.lines || []).length) : "—";
      root.querySelector("[data-verified-count]").textContent = state.step >= 5 ? String(preset.candidates.length) : "0";
      root.querySelector("[data-equations]").innerHTML = preset.equations.map((eq) => `<div>${tex(eq)}</div>`).join("");
      root.querySelector("[data-description]").textContent = preset.describe;
      const explanations = [
        `先观察两条曲线，并决定消去 ${mode.variable}、保留 ${mode.kept}。`,
        `把两个方程都看成关于 ${mode.variable} 的多项式，其系数只含 ${mode.kept}。`,
        "按次数错位排列系数；矩阵大小由两个多项式的次数决定。",
        `取 Sylvester 行列式，得到只含 ${mode.kept} 的结式。`,
        `解结式，得到 ${mode.kept} 的候选值；重数记录在候选中。`,
        "把候选值代回原方程，求另一坐标并逐点验证。",
      ];
      root.querySelector("[data-explanation]").textContent = explanations[state.step];
      root.querySelector("[data-polys]").innerHTML = mode.polys.map((poly) => `<div>${tex(poly)}</div>`).join("");
      root.querySelector("[data-sylvester]").innerHTML = texD(String.raw`S_${mode.variable}(f,g)=${mode.sylvester}`);
      root.querySelector("[data-resultant]").innerHTML = texD(String.raw`\operatorname{Res}_${mode.variable}(f,g)=${mode.resultant}`);
      root.querySelector("[data-candidates]").innerHTML = tex(mode.candidateText);
      const rejected = preset.rejected || mode.rejected || [];
      root.querySelector("[data-verification]").innerHTML = preset.candidates.length
        ? preset.candidates.map((point) => `<div class="ch3-verification-item"><b class="viz-badge">${point.multiplicity > 1 ? `${point.multiplicity} 重` : "单根"}</b> ${tex(point.tex)}：两个原方程均为 0</div>`).join("")
          + rejected.map((point) => `<div class="ch3-verification-item is-rejected"><b class="viz-badge">舍去</b> ${tex(point.tex)}：在第一条曲线上，但 ${tex(point.why)}</div>`).join("")
        : "没有实候选；实平面中无需回代出交点。";
      root.querySelectorAll("[data-step]").forEach((section) => {
        const step = Number(section.dataset.step);
        section.hidden = state.step < step;
        section.classList.toggle("is-current", state.step === step);
      });
      root.querySelector("[data-prev]").disabled = state.step === 0;
      root.querySelector("[data-next]").disabled = state.step === 5;
      root.querySelector("[data-conclusion]").innerHTML = state.step < 5
        ? "结式结果目前仍是候选信息；完成回代前，不把候选点标记为最终解。"
        : preset.candidates.length
          ? `${preset.candidates.length} 个实点通过原方程验证${rejected.length ? `，${rejected.length} 个只在一条曲线上的点被舍去` : ""}。${state.key === "tangent" ? "结式的二重根对应两条曲线在 (1,1) 相切。" : ""}`
          : "结式没有实根，因此原系统没有实公共点；在复数域中仍存在候选。";
      M().pulse(root.querySelector("[data-stage-card]"));
      draw();
      // the prediction is about the circle and the secant: only that example answers it
      if (state.step === 5 && state.key === "crossing") gate?.acted();
      else if (state.step === 5 && gate?.picked && !gate.revealed) {
        const note = root.querySelector("[data-resultant-gate] .ch3l-predict-feedback");
        if (note) note.textContent = "这道题问的是“圆与割线”：切回它，走完五步，结论随后出现。";
      }
    }

    root.querySelectorAll("[data-preset]").forEach((button) => scope.listen(button, "click", () => {
      root.querySelectorAll("[data-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
      state.key = button.dataset.preset;
      state.step = 0;
      render();
    }));
    root.querySelectorAll("[data-mode]").forEach((input) => scope.listen(input, "change", () => {
      if (!input.checked) return;
      state.mode = input.value;
      state.step = 0;
      render();
    }));
    scope.listen(root.querySelector("[data-next]"), "click", () => { state.step = Math.min(5, state.step + 1); render(); });
    scope.listen(root.querySelector("[data-prev]"), "click", () => { state.step = Math.max(0, state.step - 1); render(); });
    scope.listen(root.querySelector("[data-reset]"), "click", () => { state.step = 0; render(); });
    scope.resize(draw);
    gate = window.LAPredictGate?.mount(root.querySelector("[data-resultant-gate]"), {
      root,
      manual: true,
      key: "visuals/ch3/section7-presentation.js#candidates",
      question: `圆 ${tex("x^2+y^2=1")} 与直线 ${tex("x=y")}：消去 x，结式 ${tex("2y^2-1")} 给出 ${tex("y=\\pm\\tfrac{\\sqrt2}{2}")}。两条水平线 ${tex("y=\\pm\\tfrac{\\sqrt2}{2}")} 与圆共有 4 个交点。方程组有几个实数解？`,
      options: [
        ["2 个：只有同时在直线 x=y 上的交点", true, ""],
        ["4 个：每个交点都是解", false, `${tex("\\left(-\\tfrac{\\sqrt2}{2},\\tfrac{\\sqrt2}{2}\\right)")} 在圆上，但不满足 ${tex("x-y=0")}。`],
        ["1 个", false, "两条水平线上各有一个点同时在两条曲线上。"],
        [`0 个：${tex("\\tfrac{\\sqrt2}{2}")} 不是有理数`, false, "实数解不要求是有理数。"],
      ],
      right: `✓ 结式的根只给出被保留变量的候选值；候选直线与第一条曲线的交点，还要回代第二个方程。圆与割线的 4 个交点里，只有 ${tex("\\left(\\tfrac{\\sqrt2}{2},\\tfrac{\\sqrt2}{2}\\right)")}、${tex("\\left(-\\tfrac{\\sqrt2}{2},-\\tfrac{\\sqrt2}{2}\\right)")} 通过。`,
    });
    render();
    return scope.cleanup;
  }

  window.defineChapter3Renderer?.("binary-higher-degree", { formal: formalHigherDegree, interactive: interactiveHigherDegree });
})();
