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
    ctx.font = `${options.weight || 650} ${options.fontSize || 13}px ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + width / 2, y + height / 2 + 0.5);
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
      ctx.font = `${geometry.step < 72 ? 11 : 12}px ui-sans-serif, system-ui, sans-serif`;
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
      ctx.font = `${options.weight || 680} ${geometry.step < 68 ? 12 : 14}px ui-sans-serif, system-ui, sans-serif`;
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
      ctx.font = `700 ${geometry.step < 68 ? 11 : 13}px ui-sans-serif, system-ui, sans-serif`;
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
      ctx.fillStyle = palette.soft;
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
      ctx.font = `700 ${geometry.step < 68 ? 11 : 13}px ui-sans-serif, system-ui, sans-serif`;
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
      ctx.font = `800 ${geometry.step < 68 ? 20 : 24}px ui-sans-serif, system-ui, sans-serif`;
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
          <span>POLYNOMIAL DIVISION</span>
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
    const state = {
      mode: "R",
      alpha: { re: 1, im: 1.5 },
      beta: { re: 1, im: -1.5 },
      dragging: null,
      tween: null,
      raf: 0,
      cam: null,
      locking: false,
    };
    const bounds = { xMin: -3, xMax: 3, yMin: -3, yMax: 3 };
    const canvas = root.querySelector("[data-complex-canvas]");

    function formatNumber(value) {
      const rounded = Math.abs(value) < 1e-10 ? 0 : value;
      return Number(rounded.toFixed(2)).toString();
    }

    function formatComplex(z) {
      const re = formatNumber(z.re);
      const im = formatNumber(Math.abs(z.im));
      if (Math.abs(z.im) < 1e-10) return re;
      if (Math.abs(z.re) < 1e-10) return `${z.im < 0 ? "−" : ""}${im}i`;
      return `${re}${z.im < 0 ? "−" : "+"}${im}i`;
    }

    function exactConjugate() {
      return { re: state.alpha.re, im: -state.alpha.im };
    }

    function realQuadraticTex(sum, product) {
      const linear = Math.abs(sum) < 1e-10 ? "" : sum > 0 ? `-${formatNumber(sum)}x` : `+${formatNumber(-sum)}x`;
      const constant = product >= 0 ? `+${formatNumber(product)}` : `-${formatNumber(-product)}`;
      return `x^2${linear}${constant}`;
    }

    function coefficients() {
      const b = state.beta;
      return {
        sum: { re: state.alpha.re + b.re, im: state.alpha.im + b.im },
        product: {
          re: state.alpha.re * b.re - state.alpha.im * b.im,
          im: state.alpha.re * b.im + state.alpha.im * b.re,
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
      ctx.fillStyle = options.hollow ? palette.surface : options.color || palette.accent;
      ctx.fill();
      ctx.strokeStyle = options.color || palette.accent;
      ctx.lineWidth = options.hollow ? 3 : 2;
      ctx.stroke();
      ctx.fillStyle = palette.text;
      ctx.font = "700 13px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(label, point.x + 12, point.y + (options.labelBelow ? 16 : -12));
      ctx.restore();
    }

    function draw() {
      const { ctx, width, height } = M().setupCanvas(canvas);
      const palette = M().getPalette();
      const cam = mapFor(width, height);
      state.cam = cam;
      ctx.fillStyle = palette.soft;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.strokeStyle = palette.line;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.55;
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
      drawArrow(ctx, cam.toScreen(bounds.xMin, 0), xEnd, palette.muted);
      drawArrow(ctx, cam.toScreen(0, bounds.yMin), yEnd, palette.muted);
      ctx.fillStyle = palette.muted;
      ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("Re", xEnd.x - 24, xEnd.y - 10);
      ctx.fillText("Im", yEnd.x + 10, yEnd.y + 18);

      const alpha = cam.toScreen(state.alpha.re, state.alpha.im);
      const beta = cam.toScreen(state.beta.re, state.beta.im);
      const projection = cam.toScreen(state.alpha.re, 0);

      if (state.mode === "R" || state.locking) {
        ctx.save();
        ctx.setLineDash([5, 6]);
        ctx.strokeStyle = palette.accent;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(alpha.x, alpha.y);
        ctx.lineTo(beta.x, beta.y);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = palette.line;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(projection.x, projection.y);
        ctx.lineTo(alpha.x, alpha.y);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        drawPoint(ctx, projection, "a", palette, { color: palette.muted, hollow: true, radius: 5, labelBelow: true });
        const midB = { x: projection.x + 8, y: (projection.y + alpha.y) / 2 };
        ctx.fillStyle = palette.muted;
        ctx.font = "650 12px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText("b", midB.x, midB.y);
        const radiusMid = { x: (origin.x + alpha.x) / 2, y: (origin.y + alpha.y) / 2 };
        ctx.fillText("|α|", radiusMid.x + 8, radiusMid.y - 8);
      }

      drawPoint(ctx, alpha, "α", palette, { color: palette.accent });
      drawPoint(ctx, beta, state.mode === "R" || state.locking ? "ᾱ" : "β", palette, {
        color: state.mode === "C" && !state.locking ? palette.coral : palette.accent,
        hollow: state.mode === "R" || state.locking,
        labelBelow: true,
      });

      if (state.mode === "R" && !state.locking) {
        const a = state.alpha.re;
        const modulusSquared = state.alpha.re ** 2 + state.alpha.im ** 2;
        const boxWidth = Math.min(260, width - 32);
        drawPill(ctx, width - boxWidth - 16, 18, boxWidth, 34, `α+ᾱ = 2a = ${formatNumber(2 * a)}`, palette, {
          stroke: palette.accent,
          textColor: palette.text,
          fontSize: width < 520 ? 11 : 13,
        });
        drawPill(ctx, width - boxWidth - 16, 60, boxWidth, 34, `αᾱ = |α|² = ${formatNumber(modulusSquared)}`, palette, {
          stroke: palette.line,
          textColor: palette.text,
          fontSize: width < 520 ? 11 : 13,
        });
      }
    }

    function updateDom() {
      const c = coefficients();
      root.querySelector("[data-alpha]").textContent = formatComplex(state.alpha);
      root.querySelector("[data-beta]").textContent = formatComplex(state.beta);
      root.querySelector("[data-sum]").textContent = formatComplex(c.sum);
      root.querySelector("[data-product]").textContent = formatComplex(c.product);
      const sumReal = Math.abs(c.sum.im) < 1e-9;
      const productReal = Math.abs(c.product.im) < 1e-9;
      const exactReal = sumReal && productReal;
      const conjugatePair = Math.abs(state.alpha.re - state.beta.re) < 1e-9 && Math.abs(state.alpha.im + state.beta.im) < 1e-9;
      const bothReal = Math.abs(state.alpha.im) < 1e-9 && Math.abs(state.beta.im) < 1e-9;
      const status = root.querySelector("[data-real-status]");
      status.className = `ch1-status ${state.locking ? "is-warn" : exactReal ? "is-ok" : "is-bad"}`;
      status.textContent = state.locking ? "共轭点正在沿镜像位置归位" : exactReal ? "根之和与根之积都是实数" : "两个根未成共轭对，系数出现虚部";
      root.querySelector("[data-factor]").innerHTML = exactReal
        ? tex(realQuadraticTex(c.sum.re, c.product.re))
        : tex(`x^2-(${formatComplex(c.sum)})x+(${formatComplex(c.product)})`);
      root.querySelector("[data-geometry-copy]").textContent = state.mode === "R"
        ? "横坐标 a 决定根之和 2a；从原点到 α 的距离平方决定根之积 |α|²。"
        : "解锁后 β 可以独立移动；镜像关系一旦破坏，和与积通常带有虚部。";
      root.querySelector("[data-observation]").textContent = state.locking
        ? "第二个根正在回到 α 的共轭位置。"
        : exactReal
          ? (bothReal
            ? "两个根都在实轴上，根之和与根之积自然为实数。"
            : `${state.mode === "C" && conjugatePair ? "解锁状态下 β 恰好等于 ᾱ；" : "α 与第二个根互为共轭；"}根之和为 ${formatNumber(c.sum.re)}，根之积为 ${formatNumber(c.product.re)}。`)
          : `${sumReal ? "根之和仍为实数" : "根之和带有虚部"}，${productReal ? "根之积仍为实数" : "根之积带有虚部"}；对应二次式不属于 R[x]。`;
      root.querySelector("[data-beta-controls]").hidden = state.mode === "R";
      root.querySelector("[data-re]").value = state.alpha.re;
      root.querySelector("[data-im]").value = state.alpha.im;
      root.querySelector("[data-bre]").value = state.beta.re;
      root.querySelector("[data-bim]").value = state.beta.im;
      root.querySelector("[data-re-value]").textContent = formatNumber(state.alpha.re);
      root.querySelector("[data-im-value]").textContent = formatNumber(state.alpha.im);
      root.querySelector("[data-bre-value]").textContent = formatNumber(state.beta.re);
      root.querySelector("[data-bim-value]").textContent = formatNumber(state.beta.im);
      root.querySelector("[data-canvas-hint]").textContent = state.mode === "R"
        ? "拖动 α：共轭点会关于实轴连续镜像跟随"
        : "拖动离指针最近的根，观察系数何时出现虚部";
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
        options.after?.();
        updateDom();
      };
      state.raf = requestAnimationFrame(frame);
    }

    function choosePreset(key) {
      const targets = {
        pair: { re: 1, im: 1.5 },
        imag: { re: 0, im: 2 },
        real: { re: 1.4, im: 0 },
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
      target.re = clamp(Math.round(world.x * 20) / 20, -2.5, 2.5);
      target.im = clamp(Math.round(world.y * 20) / 20, -2.5, 2.5);
      if (state.mode === "R" && target === state.alpha) state.beta = exactConjugate();
      updateDom();
    }

    canvas.addEventListener("pointerdown", (event) => {
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
      const delta = event.shiftKey ? 0.25 : 0.1;
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      const next = { ...state.alpha };
      if (event.key === "ArrowLeft") next.re -= delta;
      if (event.key === "ArrowRight") next.re += delta;
      if (event.key === "ArrowUp") next.im += delta;
      if (event.key === "ArrowDown") next.im -= delta;
      setPoint(state.alpha, next);
    });

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
          <span>共轭根与实系数</span>
          <h3>拖动一个复根，观察共轭约束怎样保持实系数</h3>
          <p>${section.interactive.description}</p>
        </header>
        <div class="ch1-controls ch1-motion-toolbar" role="group" aria-label="选择系数模式与根的预设">
          <button type="button" data-mode="R" class="is-active" aria-pressed="true">实系数：共轭锁</button>
          <button type="button" data-mode="C" aria-pressed="false">复系数：解锁</button>
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
              <span>当前几何关系</span>
              <strong data-geometry-copy></strong>
            </div>
            <label class="ch1-slider-row"><span>Re(α)</span><input data-re type="range" min="-2.5" max="2.5" step="0.05"><output data-re-value></output></label>
            <label class="ch1-slider-row"><span>Im(α)</span><input data-im type="range" min="-2.5" max="2.5" step="0.05"><output data-im-value></output></label>
            <div data-beta-controls hidden>
              <label class="ch1-slider-row"><span>Re(β)</span><input data-bre type="range" min="-2.5" max="2.5" step="0.05"><output data-bre-value></output></label>
              <label class="ch1-slider-row"><span>Im(β)</span><input data-bim type="range" min="-2.5" max="2.5" step="0.05"><output data-bim-value></output></label>
            </div>
            <div class="ch1-equation-grid is-compact">
              <div><span>α</span><strong data-alpha></strong></div>
              <div><span>第二个根</span><strong data-beta></strong></div>
              <div><span>根之和</span><strong data-sum></strong></div>
              <div><span>根之积</span><strong data-product></strong></div>
            </div>
            <div data-real-status class="ch1-status"></div>
            <p class="ch1-conjugate-observation" data-observation></p>
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
