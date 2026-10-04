/* Chapter 1 motion upgrade: continuous polynomial division and conjugate roots. */
(() => {
  "use strict";

  const M = () => window.Ch1Math;
  const U = () => window.Ch1UI;
  const tex = (value) => U().tex(String(value));
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => {
    const x = clamp(t);
    return x < 0.5 ? 4 * x * x * x : 1 - ((-2 * x + 2) ** 3) / 2;
  };
  const reduceMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  function roundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  /*
   * Canvas text with ᾱ: the bundled fonts have no precomposed ᾱ and set a combining
   * macron off-centre, so the bar is drawn over a plain α. Honours textAlign; with
   * stroke = true it paints the paper halo first.
   */
  const BAR = /\u1FB1|\u03B1\u0304/g;
  function fillBarText(ctx, text, x, y, stroke = false) {
    if (!BAR.test(text)) { BAR.lastIndex = 0; if (stroke) ctx.strokeText(text, x, y); ctx.fillText(text, x, y); return; }
    BAR.lastIndex = 0;
    const plain = text.replace(BAR, "\u03B1");
    const marks = [];
    let offset = 0;
    text.replace(BAR, (m, i) => { marks.push(i - offset); offset += m.length - 1; return m; });
    const align = ctx.textAlign;
    const total = ctx.measureText(plain).width;
    const left = align === "right" || align === "end" ? x - total : align === "center" ? x - total / 2 : x;
    ctx.save();
    ctx.textAlign = "left";
    if (stroke) ctx.strokeText(plain, left, y);
    ctx.fillText(plain, left, y);
    const size = parseFloat((ctx.font.match(/(\d+(?:\.\d+)?)px/) || [0, 13])[1]);
    const top = ctx.textBaseline === "middle" ? y - size * 0.42 : ctx.textBaseline === "top" ? y + size * 0.08 : y - size * 0.92;
    marks.forEach((i) => {
      const a = left + ctx.measureText(plain.slice(0, i)).width;
      const w = ctx.measureText("\u03B1").width;
      ctx.beginPath(); ctx.moveTo(a + w * 0.12, top); ctx.lineTo(a + w * 0.88, top);
      ctx.lineWidth = Math.max(1, size / 13); ctx.strokeStyle = ctx.fillStyle; ctx.stroke();
    });
    ctx.restore();
  }

  function drawPill(ctx, x, y, width, height, text, palette, options = {}) {
    ctx.save();
    ctx.globalAlpha = options.alpha ?? 1;
    roundedRect(ctx, x, y, width, height, height / 2);
    ctx.fillStyle = options.fill || palette.surface;
    ctx.fill();
    ctx.strokeStyle = options.stroke || palette.line;
    ctx.lineWidth = options.lineWidth || 1;
    ctx.stroke();
    ctx.fillStyle = options.textColor || palette.text;
    ctx.font = `${options.weight || 650} ${options.fontSize || 13}px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    fillBarText(ctx, text, x + width / 2, y + height / 2 + 0.5);
    ctx.restore();
  }

  function setButtonState(root, selector, active) {
    root.querySelectorAll(selector).forEach((button) => {
      const isActive = button === active;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function mountDivisionMotion(root) {
    const presets = {
      default: { f: M().poly([-1, 0, 0, 0, 1]), g: M().poly([1, 1, 1]), name: "x⁴−1 ÷ (x²+x+1)" },
      divides: { f: M().poly([-1, 0, 0, 1]), g: M().poly([-1, 1]), name: "x³−1 ÷ (x−1)" },
      fraction: { f: M().poly(["1/2", "-1/2", 0, 1]), g: M().poly(["1/2", 1]), name: "分数系数示例" },
    };

    const state = {
      preset: "default",
      current: presets.default,
      steps: [],
      index: 0,
      animation: null,
      raf: 0,
      autoTimer: 0,
      playing: false,
    };

    const canvas = root.querySelector("[data-division-canvas]");
    const ctxInfo = () => M().setupCanvas(canvas);

    function maxDegree() {
      return Math.max(M().deg(state.current.f), M().deg(state.current.g), 1);
    }

    function columnGeometry(width) {
      const degree = maxDegree();
      const left = width < 520 ? 64 : 92;
      const right = width - (width < 520 ? 18 : 28);
      const span = Math.max(180, right - left);
      const step = span / (degree + 1);
      return {
        degree,
        left,
        right,
        step,
        xFor(d) {
          return left + (degree - d + 0.5) * step;
        },
        cardWidth: clamp(step - 10, width < 520 ? 40 : 48, width < 520 ? 68 : 88),
      };
    }

    function coefficient(poly, degree) {
      return poly[degree] || M().R(0);
    }

    function drawDegreeLabels(ctx, geometry, y, palette) {
      ctx.save();
      ctx.fillStyle = palette.muted;
      ctx.font = `${geometry.step < 72 ? 11 : 12}px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let d = geometry.degree; d >= 0; d -= 1) {
        const label = d === 0 ? "1" : d === 1 ? "x" : `x^${d}`;
        ctx.fillText(label, geometry.xFor(d), y);
      }
      ctx.restore();
    }

    function drawCoefficientCard(ctx, x, y, value, geometry, palette, options = {}) {
      const width = geometry.cardWidth;
      const height = geometry.step < 68 ? 42 : 48;
      const alpha = options.alpha ?? 1;
      ctx.save();
      ctx.globalAlpha = alpha;
      roundedRect(ctx, x - width / 2, y - height / 2, width, height, 11);
      ctx.fillStyle = options.fill || palette.surface;
      ctx.fill();
      ctx.strokeStyle = options.stroke || palette.line;
      ctx.lineWidth = options.lineWidth || 1;
      ctx.stroke();
      ctx.fillStyle = options.textColor || palette.text;
      ctx.font = `${options.weight || 680} ${geometry.step < 68 ? 12 : 14}px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(M().formatR(value), x, y + 0.5);
      if (options.strike) {
        ctx.strokeStyle = options.strikeColor || palette.coral;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - width * 0.34, y);
        ctx.lineTo(x + width * 0.34, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawPolyRow(ctx, poly, y, label, geometry, palette, options = {}) {
      ctx.save();
      ctx.globalAlpha = options.alpha ?? 1;
      ctx.fillStyle = options.labelColor || palette.muted;
      ctx.font = `700 ${geometry.step < 68 ? 11 : 13}px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(label, geometry.left - 14, y);
      ctx.restore();
      for (let d = geometry.degree; d >= 0; d -= 1) {
        const value = coefficient(poly, d);
        const isLead = options.highlightDegree === d;
        drawCoefficientCard(ctx, geometry.xFor(d), y, value, geometry, palette, {
          alpha: options.alpha,
          fill: isLead ? palette.soft : palette.surface,
          stroke: isLead ? palette.accent : palette.line,
          lineWidth: isLead ? 2 : 1,
          strike: options.strikeDegree === d,
          strikeColor: palette.coral,
        });
      }
    }

    function drawCanvasBackground(ctx, width, height, palette) {
      ctx.fillStyle = palette.paper;
      ctx.fillRect(0, 0, width, height);
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = palette.line;
      ctx.lineWidth = 1;
      for (let y = 54; y < height; y += 54) {
        ctx.beginPath();
        ctx.moveTo(18, y + 0.5);
        ctx.lineTo(width - 18, y + 0.5);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawStaticStep(ctx, width, height, step, palette, baseAlpha = 1) {
      const geometry = columnGeometry(width);
      drawDegreeLabels(ctx, geometry, 38, palette);
      const currentR = step.r || state.current.f;
      drawPolyRow(ctx, currentR, 120, "当前余式", geometry, palette, {
        alpha: baseAlpha,
        highlightDegree: M().isZeroPoly(currentR) ? -1 : M().deg(currentR),
      });
      drawPolyRow(ctx, state.current.g, 245, "除式 g", geometry, palette, { alpha: baseAlpha });

      ctx.save();
      ctx.strokeStyle = palette.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(geometry.left - 2, 184);
      ctx.lineTo(geometry.right, 184);
      ctx.stroke();
      ctx.restore();

      if (step.kind === "done") {
        const divides = M().isZeroPoly(step.r);
        drawPill(ctx, Math.max(18, width / 2 - 160), height - 62, Math.min(320, width - 36), 38,
          divides ? "余式为 0：整除成立" : "deg r < deg g：算法停止", palette, {
            stroke: divides ? palette.accent : palette.coral,
            textColor: divides ? palette.accent : palette.coral,
            alpha: baseAlpha,
          });
      } else {
        const next = state.steps[Math.min(state.index + 1, state.steps.length - 1)];
        const prompt = next?.kind === "eliminate" ? `下一步：${next.note}` : "准备检查余式次数";
        drawPill(ctx, Math.max(18, width / 2 - 190), height - 62, Math.min(380, width - 36), 38, prompt, palette, {
          stroke: palette.accent,
          textColor: palette.text,
          alpha: baseAlpha,
        });
      }
    }

    function plainTerm(term) {
      const degree = M().deg(term);
      const c = M().leading(term);
      const coeff = M().formatR(c);
      if (degree === 0) return coeff;
      const power = degree === 1 ? "x" : `x${["", "", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"][degree] || `^${degree}`}`;
      if (coeff === "1") return power;
      if (coeff === "-1") return `−${power}`;
      return `${coeff}${power}`;
    }

    function drawElimination(ctx, width, height, target, t, palette) {
      const geometry = columnGeometry(width);
      const phaseAlign = ease(t / 0.38);
      const phaseSubtract = ease((t - 0.28) / 0.42);
      const phasePromote = ease((t - 0.72) / 0.28);
      const beforeAlpha = 1 - phasePromote;
      const resultAlpha = clamp((t - 0.38) / 0.34);
      const productAlpha = clamp(t / 0.22) * (1 - phasePromote);
      const shift = M().deg(target.term);
      const scale = M().leading(target.term);
      const leadingDegree = M().deg(target.before);

      drawDegreeLabels(ctx, geometry, 38, palette);
      drawPolyRow(ctx, target.before, 105, "当前余式", geometry, palette, {
        alpha: beforeAlpha,
        highlightDegree: leadingDegree,
        strikeDegree: phaseSubtract > 0.72 ? leadingDegree : -1,
      });

      ctx.save();
      ctx.globalAlpha = productAlpha;
      ctx.fillStyle = palette.muted;
      ctx.font = `700 ${geometry.step < 68 ? 11 : 13}px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText("商项×g", geometry.left - 14, 220);
      ctx.restore();

      for (let j = 0; j <= M().deg(state.current.g); j += 1) {
        const sourceDegree = j;
        const targetDegree = j + shift;
        const value = M().rMul(coefficient(state.current.g, j), scale);
        const x = lerp(geometry.xFor(sourceDegree), geometry.xFor(targetDegree), phaseAlign);
        const y = lerp(318, 220, phaseAlign);
        drawCoefficientCard(ctx, x, y, value, geometry, palette, {
          alpha: productAlpha,
          fill: palette.soft,
          stroke: targetDegree === leadingDegree ? palette.accent : palette.line,
          lineWidth: targetDegree === leadingDegree ? 2 : 1,
          strike: phaseSubtract > 0.72 && targetDegree === leadingDegree,
          strikeColor: palette.coral,
        });
      }

      ctx.save();
      ctx.globalAlpha = productAlpha;
      ctx.fillStyle = palette.coral;
      ctx.font = `800 ${geometry.step < 68 ? 20 : 24}px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText("−", geometry.left - 20, 220);
      ctx.strokeStyle = palette.line;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(geometry.left - 4, 260);
      ctx.lineTo(geometry.right, 260);
      ctx.stroke();
      ctx.restore();

      const resultY = lerp(322, 105, phasePromote);
      drawPolyRow(ctx, target.r, resultY, phasePromote > 0.5 ? "新余式" : "相减结果", geometry, palette, {
        alpha: resultAlpha,
        highlightDegree: M().isZeroPoly(target.r) ? -1 : M().deg(target.r),
        labelColor: palette.accent,
      });

      const callout = phaseAlign < 0.98
        ? `把 ${plainTerm(target.term)}·g 平移到最高次项下方`
        : phaseSubtract < 0.98
          ? "同列相减，最高次项精确抵消"
          : "新的余式上移，成为下一轮的被除式";
      drawPill(ctx, Math.max(18, width / 2 - 190), height - 56, Math.min(380, width - 36), 36, callout, palette, {
        stroke: palette.accent,
        textColor: palette.text,
      });
    }

    function drawCrossfade(ctx, width, height, fromStep, toStep, t, palette) {
      drawStaticStep(ctx, width, height, fromStep, palette, 1 - t);
      drawStaticStep(ctx, width, height, toStep, palette, t);
    }

    function draw() {
      const { ctx, width, height } = ctxInfo();
      const palette = M().getPalette();
      drawCanvasBackground(ctx, width, height, palette);
      if (state.animation) {
        const { from, to, progress } = state.animation;
        const target = state.steps[to];
        if (to === from + 1 && target?.kind === "eliminate") {
          drawElimination(ctx, width, height, target, progress, palette);
        } else {
          drawCrossfade(ctx, width, height, state.steps[from], state.steps[to], ease(progress), palette);
        }
      } else {
        drawStaticStep(ctx, width, height, state.steps[state.index], palette);
      }
    }

    function updateDom() {
      const step = state.steps[state.index];
      const done = step.kind === "done";
      const divides = done && M().isZeroPoly(step.r);
      root.querySelector("[data-title]").textContent = state.current.name;
      root.querySelector("[data-step]").textContent = `${state.index + 1}/${state.steps.length}`;
      root.querySelector("[data-note]").textContent = step.note;
      root.querySelector("[data-f]").innerHTML = tex(M().formatPolyTex(state.current.f));
      root.querySelector("[data-g]").innerHTML = tex(M().formatPolyTex(state.current.g));
      root.querySelector("[data-q]").innerHTML = tex(M().formatPolyTex(step.q));
      root.querySelector("[data-r]").innerHTML = tex(M().formatPolyTex(step.r));
      root.querySelector("[data-invariant]").innerHTML = `${tex(M().formatPolyTex(state.current.f))} = (${tex(M().formatPolyTex(step.q))})(${tex(M().formatPolyTex(state.current.g))}) + (${tex(M().formatPolyTex(step.r))})`;
      const status = root.querySelector("[data-status]");
      status.className = `ch1-status ${done ? (divides ? "is-ok" : "is-bad") : "is-warn"}`;
      status.textContent = done ? (divides ? "整除成立" : "不整除") : "正在降低余式次数";
      root.querySelector("[data-degree]").textContent = M().isZeroPoly(step.r) ? "余式为 0" : `deg r=${M().deg(step.r)}，deg g=${M().deg(state.current.g)}`;
      root.querySelector("[data-action]").textContent = step.kind === "start"
        ? "先比较当前余式与除式的最高次数。"
        : step.kind === "eliminate"
          ? step.note
          : divides
            ? "余式归零，除式完整地包含在被除式中。"
            : "余式次数已经低于除式次数，不能继续消去。";
      root.querySelector("[data-step-track]").innerHTML = state.steps.map((item, i) => `<span class="${i < state.index ? "is-done" : i === state.index ? "is-current" : ""}" aria-label="第 ${i + 1} 步${i === state.index ? "，当前" : ""}"></span>`).join("");
      const busy = Boolean(state.animation);
      root.querySelector("[data-prev]").disabled = busy || state.index === 0;
      root.querySelector("[data-next]").disabled = busy || state.index === state.steps.length - 1;
      root.querySelector("[data-reset]").disabled = busy || state.index === 0;
      root.querySelector("[data-play]").disabled = busy && !state.playing;
      root.querySelector("[data-play]").textContent = state.playing ? "暂停" : "自动播放";
      draw();
    }

    function stopAuto() {
      state.playing = false;
      window.clearTimeout(state.autoTimer);
      state.autoTimer = 0;
      const play = root.querySelector("[data-play]");
      if (play) play.textContent = "自动播放";
    }

    function transitionTo(targetIndex, after) {
      const to = clamp(targetIndex, 0, state.steps.length - 1);
      if (to === state.index || state.animation) return;
      if (reduceMotion()) {
        state.index = to;
        state.animation = null;
        updateDom();
        after?.();
        return;
      }
      const from = state.index;
      const duration = to === from + 1 && state.steps[to]?.kind === "eliminate" ? 1050 : 420;
      const start = performance.now();
      state.animation = { from, to, progress: 0 };
      updateDom();
      const frame = (now) => {
        if (!state.animation) return;
        state.animation.progress = clamp((now - start) / duration);
        draw();
        if (state.animation.progress < 1) {
          state.raf = requestAnimationFrame(frame);
          return;
        }
        state.index = to;
        state.animation = null;
        state.raf = 0;
        updateDom();
        after?.();
      };
      state.raf = requestAnimationFrame(frame);
    }

    function scheduleAuto() {
      if (!state.playing) return;
      if (state.index >= state.steps.length - 1) {
        stopAuto();
        updateDom();
        return;
      }
      state.autoTimer = window.setTimeout(() => transitionTo(state.index + 1, scheduleAuto), 240);
    }

    function applyPreset(key, button) {
      stopAuto();
      cancelAnimationFrame(state.raf);
      state.raf = 0;
      state.animation = null;
      state.preset = key;
      state.current = presets[key];
      state.steps = M().divisionSteps(state.current.f, state.current.g);
      state.index = 0;
      if (button) setButtonState(root, "[data-preset]", button);
      updateDom();
    }

    root.querySelector("[data-prev]").addEventListener("click", () => {
      stopAuto();
      transitionTo(state.index - 1);
    });
    root.querySelector("[data-next]").addEventListener("click", () => {
      stopAuto();
      transitionTo(state.index + 1);
    });
    root.querySelector("[data-reset]").addEventListener("click", () => {
      stopAuto();
      transitionTo(0);
    });
    root.querySelector("[data-play]").addEventListener("click", () => {
      if (state.playing) {
        stopAuto();
        updateDom();
        return;
      }
      if (state.index >= state.steps.length - 1) state.index = 0;
      state.playing = true;
      updateDom();
      scheduleAuto();
    });
    root.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => applyPreset(button.dataset.preset, button)));

    const resizeCleanup = M().observeCanvas(root.querySelector(".ch1-division-canvas-shell"), draw);
    window.ch1UseCleanup?.(() => {
      stopAuto();
      cancelAnimationFrame(state.raf);
      resizeCleanup?.();
    });
    applyPreset("default", root.querySelector('[data-preset="default"]'));
  }

  function interactiveDivision(el, section) {
    el.innerHTML = `<h2>交互实验</h2>
      <div class="ch1-lab ch1-motion-lab ch1-division-motion">
        <header class="ch1-motion-head">
          <h3>让除式滑到最高次项下方，再看这一列怎样被消去</h3>
          <p>${section.interactive.description}</p>
        </header>
        <div class="ch1-controls ch1-motion-toolbar" role="group" aria-label="选择示例与播放步骤">
          <button type="button" data-preset="default" class="is-active">非整除</button>
          <button type="button" data-preset="divides">整除</button>
          <button type="button" data-preset="fraction">分数系数</button>
          <span class="ch1-control-separator"></span>
          <button type="button" data-prev>上一步</button>
          <button type="button" data-play>自动播放</button>
          <button type="button" data-next>下一步</button>
          <button type="button" data-reset>重置</button>
        </div>
        <div class="ch1-step-track" data-step-track aria-label="除法步骤进度"></div>
        <div class="ch1-motion-grid">
          <section class="ch1-division-canvas-shell">
            <canvas data-division-canvas aria-label="多项式长除法连续动画"></canvas>
            <p class="ch1-canvas-caption">同一列表示同一次数；动画只做三件事：平移、对齐、相减。</p>
          </section>
          <aside class="ch1-motion-aside">
            <div class="ch1-metrics is-compact">
              <div class="ch1-metric"><span>示例</span><strong data-title></strong></div>
              <div class="ch1-metric"><span>步骤</span><strong data-step></strong></div>
              <div class="ch1-metric"><span>状态</span><strong data-status class="ch1-status"></strong></div>
            </div>
            <div class="ch1-focus-note">
              <span>当前只观察一件事</span>
              <strong data-action></strong>
              <p data-note></p>
            </div>
            <div class="ch1-equation-grid is-compact">
              <div><span>f</span><strong data-f></strong></div>
              <div><span>g</span><strong data-g></strong></div>
              <div><span>q</span><strong data-q></strong></div>
              <div><span>r</span><strong data-r></strong></div>
            </div>
          </aside>
        </div>
        <div class="ch1-callout ch1-division-invariant">
          <strong>每一帧都保持同一个等式</strong>
          <p data-invariant></p>
          <p class="ch1-muted" data-degree></p>
        </div>
      </div>`;
    mountDivisionMotion(el);
  }

  function mountConjugateMotion(root) {
    // starts unlocked: the student predicts where the second root goes, then drags β there
    const state = {
      mode: "C",
      alpha: { re: 1, im: 1.5 },
      beta: { re: -1, im: 0.75 },
      dragging: null,
      tween: null,
      raf: 0,
      cam: null,
      locking: false,
    };
    const bounds = { xMin: -3, xMax: 3, yMin: -3, yMax: 3 };
    const canvas = root.querySelector("[data-complex-canvas]");

    /*
     * Roots at rest sit on a quarter grid (drag, sliders and presets all snap to it),
     * so every reading is an exact rational: α = 1 + 3/2 i, β = −1 + 3/4 i give
     * α + β = 9/4 i and αβ = −17/8 − 3/4 i. While a preset or the conjugate lock
     * animates, the readings already show the end values (state.tween holds them).
     */
    const GRID = 4;
    const snap = (value) => Math.round(value * GRID) / GRID;
    const toR = (value) => M().R(Math.round(value * GRID) + 0, GRID);
    const exact = (z) => ({ re: toR(z.re), im: toR(z.im) });
    const text = (r) => M().formatRText(r);
    const rtex = (r) => M().formatRTex(r);
    const shown = () => state.tween || state;
    let gate = null;
    // a+bi without a zero part, in TeX: 2i, \frac{3}{2}, 1-\frac{3}{2}i
    function complexTex(z) {
      if (M().rIsZero(z.im)) return rtex(z.re);
      const absIm = M().rAbs(z.im);
      const imPart = `${M().rEq(absIm, M().R(1)) ? "" : rtex(absIm)}i`;
      const sign = z.im.n < 0 ? "-" : "+";
      if (M().rIsZero(z.re)) return `${sign === "-" ? "-" : ""}${imPart}`;
      return `${rtex(z.re)}${sign}${imPart}`;
    }
    const isConjugate = () => Math.abs(state.beta.re - state.alpha.re) < 1e-9 && Math.abs(state.beta.im + state.alpha.im) < 1e-9;

    function exactConjugate() {
      return { re: state.alpha.re, im: -state.alpha.im };
    }

    function realQuadraticTex(sum, product) {
      const absSum = M().rAbs(sum);
      const linear = M().rIsZero(sum) ? "" : `${sum.n > 0 ? "-" : "+"}${M().rEq(absSum, M().R(1)) ? "" : rtex(absSum)}x`;
      const constant = M().rIsZero(product) ? "" : `${product.n < 0 ? "-" : "+"}${rtex(M().rAbs(product))}`;
      return `x^2${linear}${constant}`;
    }

    // exact sum and product of the two roots that are being shown
    function coefficients() {
      const { alpha, beta } = shown();
      const a = exact(alpha);
      const b = exact(beta);
      return {
        alpha: a,
        beta: b,
        sum: { re: M().rAdd(a.re, b.re), im: M().rAdd(a.im, b.im) },
        product: {
          re: M().rSub(M().rMul(a.re, b.re), M().rMul(a.im, b.im)),
          im: M().rAdd(M().rMul(a.re, b.im), M().rMul(a.im, b.re)),
        },
      };
    }

    function mapFor(width, height) {
      const pad = width < 520 ? 38 : 52;
      const usableW = width - 2 * pad;
      const usableH = height - 2 * pad;
      return {
        toScreen(x, y) {
          return {
            x: pad + ((x - bounds.xMin) / (bounds.xMax - bounds.xMin)) * usableW,
            y: pad + ((bounds.yMax - y) / (bounds.yMax - bounds.yMin)) * usableH,
          };
        },
        toWorld(px, py) {
          return {
            x: bounds.xMin + ((px - pad) / usableW) * (bounds.xMax - bounds.xMin),
            y: bounds.yMax - ((py - pad) / usableH) * (bounds.yMax - bounds.yMin),
          };
        },
      };
    }

    function drawArrow(ctx, from, to, color) {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const length = Math.hypot(dx, dy) || 1;
      const ux = dx / length;
      const uy = dy / length;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(to.x - ux * 8 - uy * 4, to.y - uy * 8 + ux * 4);
      ctx.lineTo(to.x - ux * 8 + uy * 4, to.y - uy * 8 - ux * 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawPoint(ctx, point, label, palette, options = {}) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, options.radius || 8, 0, Math.PI * 2);
      if (options.halo) {
        ctx.save();
        ctx.globalAlpha = 0.14;
        ctx.fillStyle = options.color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, (options.radius || 8) + 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.beginPath();
        ctx.arc(point.x, point.y, options.radius || 8, 0, Math.PI * 2);
      }
      ctx.fillStyle = options.hollow ? palette.paper : options.color || palette.accent;
      ctx.fill();
      ctx.strokeStyle = options.color || palette.accent;
      ctx.lineWidth = options.hollow ? 3 : 2;
      ctx.stroke();
      ctx.fillStyle = palette.text;
      ctx.font = "700 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      fillBarText(ctx, label, point.x + 12, point.y + (options.labelBelow ? 16 : -12));
      ctx.restore();
    }

    function draw() {
      const { ctx, width, height } = M().setupCanvas(canvas);
      const palette = M().getPalette();
      const cam = mapFor(width, height);
      state.cam = cam;
      ctx.fillStyle = palette.paper;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.strokeStyle = palette.gridMajor;
      ctx.lineWidth = 1;
      for (let k = -2; k <= 2; k += 1) {
        const verticalA = cam.toScreen(k, bounds.yMin);
        const verticalB = cam.toScreen(k, bounds.yMax);
        const horizontalA = cam.toScreen(bounds.xMin, k);
        const horizontalB = cam.toScreen(bounds.xMax, k);
        ctx.beginPath();
        ctx.moveTo(verticalA.x, verticalA.y);
        ctx.lineTo(verticalB.x, verticalB.y);
        ctx.moveTo(horizontalA.x, horizontalA.y);
        ctx.lineTo(horizontalB.x, horizontalB.y);
        ctx.stroke();
      }
      ctx.restore();

      const origin = cam.toScreen(0, 0);
      const xEnd = cam.toScreen(bounds.xMax, 0);
      const yEnd = cam.toScreen(0, bounds.yMax);
      drawArrow(ctx, cam.toScreen(bounds.xMin, 0), xEnd, palette.axis);
      drawArrow(ctx, cam.toScreen(0, bounds.yMin), yEnd, palette.axis);
      ctx.fillStyle = palette.muted;
      ctx.font = "12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      ctx.fillText("Re", xEnd.x - 24, xEnd.y - 10);
      ctx.fillText("Im", yEnd.x + 10, yEnd.y + 18);

      const alpha = cam.toScreen(state.alpha.re, state.alpha.im);
      const beta = cam.toScreen(state.beta.re, state.beta.im);
      const projection = cam.toScreen(state.alpha.re, 0);

      const open = Boolean(!gate || gate.picked);
      const locked = state.mode === "R" || state.locking;
      const mid = cam.toScreen((state.alpha.re + state.beta.re) / 2, (state.alpha.im + state.beta.im) / 2);
      const midOnAxis = Math.abs(state.alpha.im + state.beta.im) < 1e-9;
      const halo = (text, x, y, color, align = "left") => {
        ctx.save(); ctx.font = "600 12.5px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif"; ctx.textAlign = align; ctx.textBaseline = "middle";
        ctx.lineWidth = 4; ctx.strokeStyle = palette.paper; ctx.fillStyle = color;
        fillBarText(ctx, text, x, y, true); ctx.restore();
      };

      if (open) {
        /*
         * Where each coefficient is real (α = a+bi fixed):
         *   α+β ∈ ℝ  ⇔  Im β = −b          (horizontal line, purple like the midpoint)
         *   αβ  ∈ ℝ  ⇔  a·Im β + b·Re β = 0 ⇔ β = tᾱ, t ∈ ℝ  (line through 0 along ᾱ, green)
         * For b ≠ 0 the two lines meet only at ᾱ.
         */
        const { re: a, im: b } = state.alpha;
        const { re: x, im: y } = state.beta;
        const sumReal = Math.abs(b + y) < 1e-9;
        const productReal = Math.abs(a * y + b * x) < 1e-9;
        const tl = cam.toScreen(bounds.xMin, bounds.yMax);
        const br = cam.toScreen(bounds.xMax, bounds.yMin);
        const strokeLine = (p, q, color, dash, lit) => {
          ctx.save();
          ctx.beginPath(); ctx.rect(tl.x, tl.y, br.x - tl.x, br.y - tl.y); ctx.clip();
          if (lit) {
            ctx.globalAlpha = 0.18; ctx.strokeStyle = color; ctx.lineWidth = 7;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
          ctx.globalAlpha = lit ? 0.95 : 0.6; ctx.strokeStyle = color; ctx.lineWidth = lit ? 1.8 : 1.2; ctx.setLineDash(dash);
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          ctx.restore();
        };
        // the label goes to whichever end of the line is farther from the roots
        const endLabel = (ends, textValue, color) => {
          const score = (e) => Math.min(Math.hypot(e.x - alpha.x, e.y - alpha.y), Math.hypot(e.x - beta.x, e.y - beta.y), Math.hypot(e.x - mid.x, e.y - mid.y));
          const e = score(ends[0]) >= score(ends[1]) ? ends[0] : ends[1];
          const right = e.x > origin.x;
          halo(textValue, e.x + (right ? -4 : 4), e.y + (e.y < origin.y ? 14 : -14), color, right ? "right" : "left");
        };
        const realAlpha = Math.abs(b) < 1e-9;
        if (realAlpha) {
          // α real: both lines are the real axis
          strokeLine(cam.toScreen(bounds.xMin, 0), cam.toScreen(bounds.xMax, 0), palette.subspace, [], sumReal);
          endLabel([cam.toScreen(bounds.xMin + 0.2, 0), cam.toScreen(bounds.xMax - 0.2, 0)], "β 为实数：和、积都是实数", palette.subspace);
        } else {
          const h0 = cam.toScreen(bounds.xMin, -b);
          const h1 = cam.toScreen(bounds.xMax, -b);
          strokeLine(h0, h1, palette.image, [6, 5], sumReal);
          const len = Math.hypot(a, b);
          const reach = 9 / len;
          strokeLine(cam.toScreen(-reach * a, reach * b), cam.toScreen(reach * a, -reach * b), palette.subspace, [], productReal);
          endLabel([cam.toScreen(bounds.xMin + 0.15, -b), cam.toScreen(bounds.xMax - 0.15, -b)], "α+β 为实数", palette.image);
          // the product label sits where the green line leaves the plotted square
          const k = Math.min(Math.abs(2.75 / a) || Infinity, Math.abs(2.75 / b));
          endLabel([cam.toScreen(k * a, -k * b), cam.toScreen(-k * a, k * b)], "αβ 为实数（β = tᾱ）", palette.subspace);
          // their only common point, marked once the prediction has been checked
          if (gate?.revealed || locked) {
            const c = cam.toScreen(a, -b);
            ctx.save(); ctx.globalAlpha = 0.2; ctx.fillStyle = palette.subspace;
            ctx.beginPath(); ctx.arc(c.x, c.y, 15, 0, Math.PI * 2); ctx.fill(); ctx.restore();
          }
        }
        ctx.save(); ctx.strokeStyle = palette.axis; ctx.setLineDash([2, 3]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(alpha.x, alpha.y); ctx.stroke(); ctx.restore();
        // the segment between the two roots, and its midpoint (α+β)/2
        ctx.save();
        ctx.setLineDash([5, 6]); ctx.strokeStyle = palette.axis; ctx.globalAlpha = 0.7; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(alpha.x, alpha.y); ctx.lineTo(beta.x, beta.y); ctx.stroke();
        ctx.restore();
        if (!midOnAxis) {
          const foot = cam.toScreen((state.alpha.re + state.beta.re) / 2, 0);
          ctx.save(); ctx.strokeStyle = palette.image; ctx.setLineDash([2, 3]); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(mid.x, mid.y); ctx.lineTo(foot.x, foot.y); ctx.stroke(); ctx.restore();
        } else {
          ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = palette.image;
          ctx.beginPath(); ctx.arc(mid.x, mid.y, 13, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        }
        ctx.save(); ctx.fillStyle = palette.image; ctx.strokeStyle = palette.paper; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(mid.x, mid.y, 5.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
        const midText = locked ? "(α+ᾱ)/2 = a" : midOnAxis ? "(α+β)/2 在实轴上" : "(α+β)/2 离开实轴";
        // label on the side away from α, so it never sits on the root
        const leftSide = alpha.x > mid.x + 6;
        halo(midText, mid.x + (leftSide ? -12 : 12), mid.y + (mid.y >= origin.y - 4 ? 16 : -14), palette.image, leftSide ? "right" : "left");
        // ghost of ᾱ once the prediction has been checked, so β can be compared with it
        if (!locked && gate?.revealed && !isConjugate()) {
          const ghost = cam.toScreen(state.alpha.re, -state.alpha.im);
          ctx.save(); ctx.globalAlpha = 0.35; ctx.strokeStyle = palette.image; ctx.lineWidth = 2; ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.arc(ghost.x, ghost.y, 8, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
          halo("ᾱ", ghost.x + 12, ghost.y + 14, palette.muted);
        }
      }

      drawPoint(ctx, alpha, "α", palette, { color: palette.drag, halo: true });
      if (open) drawPoint(ctx, beta, state.mode === "R" || state.locking ? "ᾱ" : "β", palette, {
        color: state.mode === "C" && !state.locking ? palette.v2 : palette.image,
        hollow: state.mode === "R" || state.locking,
        labelBelow: true,
      });

      if (state.mode === "R" && !state.locking && open) {
        // exact end values, also while α is still sliding to a preset
        const a = coefficients().alpha;
        const twiceRe = M().rMul(M().R(2), a.re);
        const modulusSquared = M().rAdd(M().rMul(a.re, a.re), M().rMul(a.im, a.im));
        /* compact pills in the lower-left corner, clear of the Im axis label and of α */
        const fontSize = width < 520 ? 11 : 12.5;
        const texts = [`α+ᾱ = 2a = ${text(twiceRe)}`, `αᾱ = |α|² = ${text(modulusSquared)}`];
        ctx.save();
        ctx.font = `650 ${fontSize}px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif`;
        const boxWidth = Math.min(width - 32, Math.max(...texts.map((t) => ctx.measureText(t).width)) + 28);
        ctx.restore();
        const y0 = height - 2 * 30 - 14;
        drawPill(ctx, 14, y0, boxWidth, 26, texts[0], palette, { stroke: palette.line, textColor: palette.text, fontSize });
        drawPill(ctx, 14, y0 + 32, boxWidth, 26, texts[1], palette, { stroke: palette.line, textColor: palette.text, fontSize });
      }
    }

    // KaTeX only re-renders when the formula changes (a tween repaints every frame)
    const rendered = new WeakMap();
    const setTex = (node, source) => {
      if (rendered.get(node) === source) return;
      rendered.set(node, source);
      node.innerHTML = tex(source);
    };
    const setText = (node, value) => {
      rendered.delete(node);
      node.textContent = value;
    };

    function updateDom() {
      const c = coefficients();
      const view = shown();
      setTex(root.querySelector("[data-alpha]"), complexTex(c.alpha));
      setTex(root.querySelector("[data-beta]"), complexTex(c.beta));
      setTex(root.querySelector("[data-sum]"), complexTex(c.sum));
      setTex(root.querySelector("[data-product]"), complexTex(c.product));
      const exactReal = M().rIsZero(c.sum.im) && M().rIsZero(c.product.im);
      const status = root.querySelector("[data-real-status]");
      const open = Boolean(!gate || gate.picked);
      status.hidden = !open;
      status.className = `ch1-status ${state.locking ? "is-warn" : exactReal ? "is-ok" : "is-bad"}`;
      status.textContent = state.locking ? "β 正在移到 α 关于实轴的对称点" : exactReal ? "根之和与根之积都是实数" : `系数出现虚部：Im(α+β)=${text(c.sum.im)}，Im(αβ)=${text(c.product.im)}`;
      setTex(root.querySelector("[data-factor]"), exactReal
        ? realQuadraticTex(c.sum.re, c.product.re)
        : `x^2-\\left(${complexTex(c.sum)}\\right)x+\\left(${complexTex(c.product)}\\right)`);
      const geometryCopy = state.mode === "R"
        ? `${tex("\\bar\\alpha")} 同时在两条线上：在紫色虚线上，根之和 2a 是实数；在过原点的绿线上，根之积 ${tex("|\\alpha|^2")} 是实数。`
        : "紫色虚线上 α+β 是实数，过原点的绿线上 αβ 是实数。把 β 拖到两条线上看看。";
      const geometryNode = root.querySelector("[data-geometry-copy]");
      if (geometryNode.dataset.copy !== geometryCopy) { geometryNode.dataset.copy = geometryCopy; geometryNode.innerHTML = geometryCopy; }
      if (!open) {
        setText(root.querySelector("[data-beta]"), "猜过之后显示");
        setText(root.querySelector("[data-sum]"), "—");
        setText(root.querySelector("[data-product]"), "—");
        setText(root.querySelector("[data-factor]"), "—");
      }
      if (gate?.picked && !state.tween && !state.locking && exactReal && Math.abs(state.alpha.im) > 1e-9) gate.acted();
      root.querySelector("[data-beta-controls]").hidden = state.mode === "R";
      root.querySelector("[data-re]").value = view.alpha.re;
      root.querySelector("[data-im]").value = view.alpha.im;
      root.querySelector("[data-bre]").value = view.beta.re;
      root.querySelector("[data-bim]").value = view.beta.im;
      root.querySelector("[data-re-value]").textContent = text(c.alpha.re);
      root.querySelector("[data-im-value]").textContent = text(c.alpha.im);
      root.querySelector("[data-bre-value]").textContent = text(c.beta.re);
      root.querySelector("[data-bim-value]").textContent = text(c.beta.im);
      root.querySelector("[data-canvas-hint]").textContent = !open
        ? "先在上方猜一猜，再拖动 β"
        : state.mode === "R"
          ? "拖动 α：共轭根关于实轴镜像跟随，两条线始终交在共轭根处"
          : "拖动离指针最近的根，看它何时落到两条线上";
      draw();
    }

    function cancelTween() {
      cancelAnimationFrame(state.raf);
      state.raf = 0;
      state.tween = null;
    }

    function tweenTo(alphaTarget, betaTarget, options = {}) {
      cancelTween();
      const fromA = { ...state.alpha };
      const fromB = { ...state.beta };
      const duration = reduceMotion() ? 0 : options.duration || 560;
      if (!duration) {
        state.alpha = { ...alphaTarget };
        state.beta = { ...betaTarget };
        state.locking = false;
        updateDom();
        options.after?.();
        return;
      }
      state.locking = Boolean(options.locking);
      // the readouts show where the roots are going, not the frames in between
      state.tween = { alpha: { ...alphaTarget }, beta: { ...betaTarget } };
      const start = performance.now();
      const frame = (now) => {
        const t = ease((now - start) / duration);
        state.alpha.re = lerp(fromA.re, alphaTarget.re, t);
        state.alpha.im = lerp(fromA.im, alphaTarget.im, t);
        state.beta.re = lerp(fromB.re, betaTarget.re, t);
        state.beta.im = lerp(fromB.im, betaTarget.im, t);
        updateDom();
        if (t < 1) {
          state.raf = requestAnimationFrame(frame);
          return;
        }
        state.raf = 0;
        state.locking = false;
        state.tween = null;
        options.after?.();
        updateDom();
      };
      state.raf = requestAnimationFrame(frame);
    }

    function choosePreset(key) {
      const targets = {
        pair: { re: 1, im: 1.5 },
        imag: { re: 0, im: 2 },
        real: { re: 1.5, im: 0 },
      };
      const alpha = targets[key] || targets.pair;
      const beta = state.mode === "R" ? { re: alpha.re, im: -alpha.im } : { ...state.beta };
      tweenTo(alpha, beta);
    }

    function setMode(mode, button) {
      cancelTween();
      setButtonState(root, "[data-mode]", button);
      if (mode === "R") {
        state.mode = "R";
        const target = exactConjugate();
        tweenTo({ ...state.alpha }, target, { locking: true });
      } else {
        state.mode = "C";
        state.locking = false;
        updateDom();
      }
    }

    function pointerWorld(event) {
      const rect = canvas.getBoundingClientRect();
      return state.cam.toWorld(event.clientX - rect.left, event.clientY - rect.top);
    }

    function setPoint(target, world) {
      target.re = clamp(snap(world.x), -2.5, 2.5);
      target.im = clamp(snap(world.y), -2.5, 2.5);
      if (state.mode === "R" && target === state.alpha) state.beta = exactConjugate();
      // β snaps onto ᾱ when it is within about one grid step of it
      if (target === state.beta && Math.hypot(state.beta.re - state.alpha.re, state.beta.im + state.alpha.im) < 0.11) state.beta = exactConjugate();
      updateDom();
    }

    canvas.addEventListener("pointerdown", (event) => {
      if (gate && !gate.picked) return;
      cancelTween();
      const world = pointerWorld(event);
      const da = Math.hypot(world.x - state.alpha.re, world.y - state.alpha.im);
      const db = Math.hypot(world.x - state.beta.re, world.y - state.beta.im);
      state.dragging = state.mode === "R" || da <= db ? "alpha" : "beta";
      canvas.setPointerCapture(event.pointerId);
      setPoint(state[state.dragging], world);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!state.dragging) return;
      setPoint(state[state.dragging], pointerWorld(event));
    });
    const release = (event) => {
      state.dragging = null;
      if (event?.pointerId != null && canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    };
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);

    canvas.addEventListener("keydown", (event) => {
      const delta = event.shiftKey ? 0.5 : 0.25;
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      const next = { ...state.alpha };
      if (event.key === "ArrowLeft") next.re -= delta;
      if (event.key === "ArrowRight") next.re += delta;
      if (event.key === "ArrowUp") next.im += delta;
      if (event.key === "ArrowDown") next.im -= delta;
      setPoint(state.alpha, next);
    });

    const lockables = [...root.querySelectorAll("[data-mode], [data-preset], [data-re], [data-im], [data-bre], [data-bim]")];
    gate = window.LAPredictGate?.mount(root.querySelector("[data-conj-gate]"), {
      root,
      manual: true,
      key: "visuals/ch1/motion-upgrade.js#conjugate",
      question: `实系数二次多项式 ${tex("x^2+px+q")} 有一个根 ${tex("\\alpha=1+\\tfrac32 i")}。另一个根 ${tex("\\beta")} 在哪里？`,
      options: [
        [`${tex("\\bar\\alpha=1-\\tfrac32 i")}：与 α 关于实轴对称`, true, ""],
        [`${tex("-\\alpha=-1-\\tfrac32 i")}：与 α 关于原点对称`, false, `若 ${tex("\\beta=-\\alpha")}，则 ${tex("\\alpha\\beta=-\\alpha^2=\\tfrac54-3i")}，常数项不是实数。`],
        ["实轴上的某一点", false, `β 是实数时 ${tex("\\alpha+\\beta")} 的虚部仍是 ${tex("\\tfrac32")}，一次项系数不是实数。`],
        [`${tex("-\\bar\\alpha=-1+\\tfrac32 i")}：与 α 关于虚轴对称`, false, `若 ${tex("\\beta=-\\bar\\alpha")}，则 ${tex("\\alpha+\\beta=3i")}，一次项系数不是实数。`],
      ],
      right: `✓ 根之和 ${tex("-p")} 是实数，β 在水平线 ${tex("\\operatorname{Im}\\beta=-\\tfrac32")} 上；根之积 ${tex("q")} 是实数，β 在过原点、方向为 ${tex("\\bar\\alpha")} 的直线上（${tex("\\beta=t\\bar\\alpha")}，t 为实数）。两条线只交于 ${tex("\\bar\\alpha")}，此时 ${tex("q=\\alpha\\bar\\alpha=|\\alpha|^2")}。`,
      onPick: () => { lockables.forEach((node) => { node.disabled = false; }); updateDom(); },
    });
    if (gate) lockables.forEach((node) => { node.disabled = true; });
    root.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode, button)));
    root.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => choosePreset(button.dataset.preset)));
    [["re", "alpha", "re"], ["im", "alpha", "im"], ["bre", "beta", "re"], ["bim", "beta", "im"]].forEach(([key, object, prop]) => {
      root.querySelector(`[data-${key}]`).addEventListener("input", (event) => {
        cancelTween();
        state[object][prop] = Number(event.target.value);
        if (state.mode === "R" && object === "alpha") state.beta = exactConjugate();
        updateDom();
      });
    });

    const resizeCleanup = M().observeCanvas(root.querySelector(".ch1-complex-canvas-shell"), draw);
    window.ch1UseCleanup?.(() => {
      cancelTween();
      resizeCleanup?.();
    });
    updateDom();
  }

  function interactiveConjugate(el, section) {
    el.innerHTML = `<h2>交互实验</h2>
      <div class="ch1-lab ch1-motion-lab ch1-conjugate-motion">
        <header class="ch1-motion-head">
          <h3>另一个根放在哪里，系数才是实数</h3>
          <p>${section.interactive.description}</p>
        </header>
        <div data-conj-gate></div>
        <div class="ch1-controls ch1-motion-toolbar" role="group" aria-label="选择系数模式与根的预设">
          <button type="button" data-mode="C" class="is-active" aria-pressed="true">自由移动 β</button>
          <button type="button" data-mode="R" aria-pressed="false">实系数：共轭锁</button>
          <span class="ch1-control-separator"></span>
          <button type="button" data-preset="pair">一般共轭对</button>
          <button type="button" data-preset="imag">纯虚根</button>
          <button type="button" data-preset="real">虚部为 0</button>
        </div>
        <div class="ch1-motion-grid ch1-complex-grid">
          <section class="ch1-complex-canvas-shell">
            <canvas data-complex-canvas tabindex="0" aria-label="可拖动的复根共轭平面"></canvas>
            <p class="ch1-canvas-caption" data-canvas-hint></p>
          </section>
          <aside class="ch1-motion-aside">
            <div class="ch1-focus-note">
              <span>图上真正要看懂的关系</span>
              <strong data-geometry-copy></strong>
            </div>
            <label class="ch1-slider-row"><span>Re(α)</span><input data-re type="range" min="-2.5" max="2.5" step="0.25"><output data-re-value></output></label>
            <label class="ch1-slider-row"><span>Im(α)</span><input data-im type="range" min="-2.5" max="2.5" step="0.25"><output data-im-value></output></label>
            <div data-beta-controls hidden>
              <label class="ch1-slider-row"><span>Re(β)</span><input data-bre type="range" min="-2.5" max="2.5" step="0.25"><output data-bre-value></output></label>
              <label class="ch1-slider-row"><span>Im(β)</span><input data-bim type="range" min="-2.5" max="2.5" step="0.25"><output data-bim-value></output></label>
            </div>
            <div class="ch1-equation-grid is-compact">
              <div><span>α</span><strong data-alpha></strong></div>
              <div><span>第二个根</span><strong data-beta></strong></div>
              <div><span>根之和</span><strong data-sum></strong></div>
              <div><span>根之积</span><strong data-product></strong></div>
            </div>
            <div data-real-status class="ch1-status"></div>
            <div class="ch1-result-band is-compact">
              <div><span>由根得到的二次因式</span><strong data-factor></strong></div>
            </div>
          </aside>
        </div>
      </div>`;
    mountConjugateMotion(el);
  }

  window.defineChapter1Renderer("polynomial-divisibility", { interactive: interactiveDivision });
  window.defineChapter1Renderer("complex-real-factorization", { interactive: interactiveConjugate });
})();
