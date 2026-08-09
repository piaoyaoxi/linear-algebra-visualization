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
      "前六节的线性理论已经闭合。本节只迁移“消去一个变量—恢复另一个变量—代回验解”的算法顺序，并把运算对象换成一元多项式的系数表。",
      module(
        "01",
        "Sylvester 矩阵与结式",
        "公共根问题被编码为一个行列式",
        `<div class="ch3-theorem-row"><div>${texD(String.raw`\operatorname{Res}_x(f,g)=\det S_x(f,g)`)}</div><p>把 f、g 按 x 的次数排列系数并错位堆叠，得到 Sylvester 矩阵。固定次数的正常情形下，结式为零给出关于 x 存在公共根的条件。</p></div>`,
      ) +
        module(
          "02",
          "候选、边界与真解",
          "完整解还需要恢复坐标并检查次数退化",
          cards([
            ["选择", "先选消元变量", "优先选择次数较低、系数较简单的方向。"],
            ["候选", "解结式多项式", "得到被保留变量的可能取值，其中可能含复根或重根。"],
            ["确认", "逐点回代验解", "恢复另一坐标，并检查首项系数消失造成的次数下降。"],
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
        },
        y: {
          variable: "y",
          kept: "x",
          polys: ["f=y^2+(x^2-1)", "g=y-x"],
          sylvester: String.raw`\begin{bmatrix}1&0&x^2-1\\1&-x&0\\0&1&-x\end{bmatrix}`,
          resultant: "2x^2-1",
          candidateText: "x=\\pm\\dfrac{\\sqrt2}{2}",
        },
      },
      candidates: [
        { x: Math.SQRT1_2, y: Math.SQRT1_2, multiplicity: 1 },
        { x: -Math.SQRT1_2, y: -Math.SQRT1_2, multiplicity: 1 },
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
        },
        y: {
          variable: "y",
          kept: "x",
          polys: ["f=y-x^2", "g=y-(2x-1)"],
          sylvester: String.raw`\begin{bmatrix}1&-x^2\\1&-(2x-1)\end{bmatrix}`,
          resultant: "(x-1)^2",
          candidateText: "x=1\\quad(m=2)",
        },
      },
      candidates: [{ x: 1, y: 1, multiplicity: 2 }],
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
        },
        y: {
          variable: "y",
          kept: "x",
          polys: ["f=y^2+(x^2+1)", "g=y-x"],
          sylvester: String.raw`\begin{bmatrix}1&0&x^2+1\\1&-x&0\\0&1&-x\end{bmatrix}`,
          resultant: "2x^2+1",
          candidateText: "x=\\pm\\dfrac{i}{\\sqrt2}",
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
        <div class="ch3-lab-head"><span class="ch3-lab-kicker">目标 · 区分“结式候选”和“原方程组真解”</span><h3>从曲线公共点到一元候选</h3><p>一次只推进一个代数动作。左侧曲线说明要寻找的对象，右侧公式明确每一步保留和丢失的信息。</p></div><div class="ch3-mission"><strong>你来试一试</strong><span>先在求出候选根后暂停，再执行回代；随后选择“抛物线与切线”，观察二重根怎样对应相切。</span><span class="ch3-mission-result">观察：结式缩小候选集，原方程完成最终确认</span></div>
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
          <button type="button" class="button primary" data-next>下一步</button>
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

    function draw() {
      const sized = M().sizeCanvas(canvas);
      if (!sized) return;
      const frame = M().drawAxes(sized.ctx, sized.width, sized.height, 52);
      const { preset } = current();
      if (preset.curve === "circle-line") {
        sized.ctx.save();
        sized.ctx.strokeStyle = frame.p.accent;
        sized.ctx.lineWidth = 2.5;
        sized.ctx.beginPath();
        sized.ctx.arc(frame.cx, frame.cy, frame.scale, 0, Math.PI * 2);
        sized.ctx.stroke();
        sized.ctx.restore();
        drawCurve(sized.ctx, frame, (x) => x, frame.p.coral);
      } else if (preset.curve === "parabola-tangent") {
        drawCurve(sized.ctx, frame, (x) => x * x, frame.p.accent);
        drawCurve(sized.ctx, frame, (x) => 2 * x - 1, frame.p.coral);
      } else {
        drawCurve(sized.ctx, frame, (x) => x, frame.p.coral);
        sized.ctx.fillStyle = frame.p.muted;
        sized.ctx.font = "600 13px ui-sans-serif, system-ui";
        sized.ctx.fillText("x²+y²+1=0 在实平面中没有轨迹", 16, 28);
      }
      if (state.step >= 4) {
        preset.candidates.forEach((point) => M().drawPoint(
          sized.ctx,
          frame,
          [point.x, point.y],
          state.step >= 5 ? frame.p.blue : frame.p.coral,
          state.step >= 5 ? "已验证" : "候选",
        ));
      }
    }

    function render() {
      const { preset, mode } = current();
      root.querySelector("[data-stage]").textContent = labels[state.step];
      root.querySelector("[data-candidate-count]").textContent = state.step >= 4 ? String(preset.candidates.length) : "—";
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
      root.querySelector("[data-verification]").innerHTML = preset.candidates.length
        ? preset.candidates.map((point) => `<div class="ch3-verification-item"><span class="viz-badge">${point.multiplicity > 1 ? `${point.multiplicity} 重` : "单根"}</span> (${M().formatNumber(point.x, 4)}, ${M().formatNumber(point.y, 4)})：两个原方程均为 0</div>`).join("")
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
          ? `${preset.candidates.length} 个实点通过原方程验证。${state.key === "tangent" ? "二重根与曲线相切相对应。" : ""}`
          : "结式没有实根，因此原系统没有实公共点；在复数域中仍存在候选。";
      M().pulse(root.querySelector("[data-stage-card]"));
      draw();
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
    render();
    return scope.cleanup;
  }

  window.defineChapter3Renderer?.("binary-higher-degree", { formal: formalHigherDegree, interactive: interactiveHigherDegree });
})();
