/* Chapter 1 repair pass: standard polynomial long division and readable Euclid formulas. */
(() => {
  "use strict";

  const M = () => window.Ch1Math;
  const U = () => window.Ch1UI;
  const tex = (value) => U().tex(String(value));
  const esc = (value) => U().esc(String(value));
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const ease = (value) => {
    const t = clamp(value);
    return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
  };
  const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const svgEsc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]);
  const superscripts = ["", "", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];

  function selectButtons(root, selector, selected) {
    root.querySelectorAll(selector).forEach((button) => {
      const active = button === selected;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function variableText(degree) {
    if (degree === 0) return "";
    if (degree === 1) return "x";
    return `x${superscripts[degree] || `^${degree}`}`;
  }

  function coefficientAt(poly, degree) {
    return poly[degree] || M().R(0);
  }

  function termText(poly, degree, options = {}) {
    const degreeOfPoly = M().isZeroPoly(poly) ? -1 : M().deg(poly);
    if (degree > degreeOfPoly) return "";
    const coefficient = coefficientAt(poly, degree);
    const zero = M().rIsZero(coefficient);
    const leading = degree === degreeOfPoly;
    if (zero && !options.showZeros) return "";
    if (zero) {
      const body = degree === 0 ? "0" : `0${variableText(degree)}`;
      return `${leading ? "" : "+ "}${body}`;
    }
    const raw = M().formatR(coefficient);
    const negative = raw.startsWith("-");
    const absolute = negative ? raw.slice(1) : raw;
    const variable = variableText(degree);
    const body = degree > 0 && absolute === "1" ? variable : `${absolute}${variable}`;
    if (leading) return `${negative ? "−" : ""}${body}`;
    return `${negative ? "− " : "+ "}${body}`;
  }

  function polynomialText(poly) {
    if (M().isZeroPoly(poly)) return "0";
    const parts = [];
    for (let degree = M().deg(poly); degree >= 0; degree -= 1) {
      if (M().rIsZero(coefficientAt(poly, degree))) continue;
      parts.push(termText(poly, degree));
    }
    return parts.join(" ") || "0";
  }

  function renderTerms(poly, maxDegree, y, options = {}) {
    if (M().isZeroPoly(poly)) {
      const x = options.x0 + maxDegree * options.termWidth;
      return `<text class="ch1-ld-term${options.newDegree === 0 ? " is-new-quotient" : ""}" x="${x}" y="${y}"${options.newDegree === 0 ? " data-new-quotient" : ""}>0</text>`;
    }
    const degreeOfPoly = M().deg(poly);
    const out = [];
    for (let degree = maxDegree; degree >= 0; degree -= 1) {
      const text = termText(poly, degree, { showZeros: options.showZeros });
      if (!text) continue;
      const zero = M().rIsZero(coefficientAt(poly, degree));
      const focus = options.focusDegree === degree;
      const isNew = options.newDegree === degree;
      const classes = ["ch1-ld-term", zero ? "is-zero" : "", focus ? "is-focus" : "", isNew ? "is-new-quotient" : ""].filter(Boolean).join(" ");
      const x = options.x0 + (maxDegree - degree) * options.termWidth;
      out.push(`<text class="${classes}" x="${x}" y="${y}"${isNew ? " data-new-quotient" : ""}>${svgEsc(text)}</text>`);
    }
    if (!out.length && degreeOfPoly < 0) {
      out.push(`<text class="ch1-ld-term" x="${options.x0 + maxDegree * options.termWidth}" y="${y}">0</text>`);
    }
    return out.join("");
  }

  function mountLongDivision(root) {
    const presets = {
      default: { f: M().poly([-1, 0, 0, 0, 1]), g: M().poly([1, 1, 1]), name: "x⁴−1 ÷ (x²+x+1)" },
      divides: { f: M().poly([-1, 0, 0, 1]), g: M().poly([-1, 1]), name: "x³−1 ÷ (x−1)" },
      fraction: { f: M().poly(["1/2", "-1/2", 0, 1]), g: M().poly(["1/2", 1]), name: "分数系数示例" },
    };
    const state = {
      current: presets.default,
      steps: [],
      index: 0,
      animation: null,
      raf: 0,
      timer: 0,
      playing: false,
    };
    const svg = root.querySelector("[data-division-svg]");

    function eliminationEntries() {
      return state.steps.map((step, stepIndex) => ({ step, stepIndex })).filter((entry) => entry.step.kind === "eliminate");
    }

    function sceneMarkup(targetIndex, animateTarget = null) {
      const maxDegree = Math.max(1, M().deg(state.current.f));
      const termWidth = 128;
      const x0 = 210;
      const width = x0 + (maxDegree + 1) * termWidth + 34;
      const visible = eliminationEntries().filter((entry) => entry.stepIndex <= targetIndex);
      const height = Math.max(330, 210 + visible.length * 132 + 58);
      const activeStep = animateTarget == null ? null : state.steps[animateTarget];
      const activeDegree = activeStep?.kind === "eliminate" ? M().deg(activeStep.before) : null;
      const quotient = state.steps[targetIndex]?.q || M().zeroPoly();
      const newQuotientDegree = activeStep?.kind === "eliminate" ? M().deg(activeStep.term) : null;
      const firstAnimation = activeStep?.kind === "eliminate" && visible[0]?.stepIndex === animateTarget;
      const rows = [];

      visible.forEach((entry, visibleIndex) => {
        const { step, stepIndex } = entry;
        const productY = 215 + visibleIndex * 132;
        const lineY = productY + 23;
        const remainderY = productY + 72;
        const isNew = animateTarget === stepIndex;
        const nextIsNew = animateTarget != null && visible[visibleIndex + 1]?.stepIndex === animateTarget;
        const productLabel = `${polynomialText(step.term)}·g(x)`;
        rows.push(`<g${isNew ? ' data-new-product opacity="0.16" transform="translate(0,-72)"' : ""}>`);
        rows.push(`<text class="ch1-ld-product-label" x="24" y="${productY}">${svgEsc(productLabel)}</text>`);
        rows.push(`<text class="ch1-ld-minus" x="184" y="${productY}">−</text>`);
        rows.push(renderTerms(step.product, maxDegree, productY, { x0, termWidth, showZeros: false, focusDegree: isNew ? activeDegree : null }));
        rows.push(`</g>`);
        const lineStart = x0 + (maxDegree - M().deg(step.before)) * termWidth - 8;
        rows.push(`<path class="ch1-ld-subtract-line" d="M${lineStart} ${lineY} H${width - 34}" pathLength="1"${isNew ? ' data-new-line stroke-dasharray="1" stroke-dashoffset="1"' : ""}></path>`);
        rows.push(`<g${isNew ? ' data-new-remainder opacity="0" transform="translate(0,-24)"' : ""}>`);
        rows.push(renderTerms(step.r, maxDegree, remainderY, { x0, termWidth, showZeros: true, focusDegree: nextIsNew ? activeDegree : null }));
        rows.push(`</g>`);
      });

      return {
        width,
        height,
        markup: `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="标准多项式长除法" data-animation-progress="0">
          <text class="ch1-ld-label" x="24" y="58">商</text>
          ${renderTerms(quotient, maxDegree, 60, { x0, termWidth, showZeros: false, newDegree: newQuotientDegree })}
          <path class="ch1-ld-bracket" d="M180 92 H${width - 34} M180 92 V154"></path>
          <text class="ch1-ld-label" x="24" y="111">除式</text>
          <text class="ch1-ld-divisor-text" x="164" y="142" text-anchor="end">${svgEsc(polynomialText(state.current.g))}</text>
          <text class="ch1-ld-label" x="24" y="142">被除式</text>
          ${renderTerms(state.current.f, maxDegree, 142, { x0, termWidth, showZeros: true, focusDegree: firstAnimation ? activeDegree : null })}
          ${rows.join("")}
        </svg>`,
      };
    }

    function updateInfo(stepIndex) {
      const step = state.steps[stepIndex];
      const done = step.kind === "done";
      const divides = done && M().isZeroPoly(step.r);
      root.querySelector("[data-title]").textContent = state.current.name;
      root.querySelector("[data-step]").textContent = `${stepIndex + 1}/${state.steps.length}`;
      root.querySelector("[data-f]").innerHTML = tex(M().formatPolyTex(state.current.f));
      root.querySelector("[data-g]").innerHTML = tex(M().formatPolyTex(state.current.g));
      root.querySelector("[data-q]").innerHTML = tex(M().formatPolyTex(step.q));
      root.querySelector("[data-r]").innerHTML = tex(M().formatPolyTex(step.r));
      root.querySelector("[data-invariant]").innerHTML = tex(`${M().formatPolyTex(state.current.f)}=(${M().formatPolyTex(step.q)})(${M().formatPolyTex(state.current.g)})+(${M().formatPolyTex(step.r)})`);
      const status = root.querySelector("[data-status]");
      status.className = `ch1-status ${done ? (divides ? "is-ok" : "is-bad") : "is-warn"}`;
      status.textContent = done ? (divides ? "余式为 0，整除成立" : "余式非零，不整除") : "长除法进行中";
      const focus = root.querySelector("[data-focus]");
      const note = root.querySelector("[data-note]");
      if (step.kind === "start") {
        focus.textContent = "先用当前余式的最高次项除以除式的最高次项。";
        note.textContent = `deg f=${M().deg(state.current.f)}，deg g=${M().deg(state.current.g)}，可以开始首项消去。`;
      } else if (step.kind === "eliminate") {
        focus.textContent = `新的商项是 ${polynomialText(step.term)}；把它乘回 g(x)，按同次项对齐后相减。`;
        note.textContent = M().isZeroPoly(step.r) ? "相减后余式归零。" : `相减后得到新余式，次数降为 ${M().deg(step.r)}。`;
      } else {
        focus.textContent = divides ? "余式已经归零，除法完整结束。" : "余式次数低于除式次数，不能再继续消去。";
        note.textContent = divides ? "此时 f(x)=q(x)g(x)。" : `最终 deg r=${M().deg(step.r)}<deg g=${M().deg(state.current.g)}。`;
      }
      root.querySelector("[data-progress]").innerHTML = state.steps.map((_, index) => `<span class="${index < stepIndex ? "is-done" : index === stepIndex ? "is-current" : ""}" aria-label="第 ${index + 1} 步"></span>`).join("");
    }

    function updateButtons() {
      const busy = Boolean(state.animation);
      root.querySelector("[data-prev]").disabled = busy || state.index === 0;
      root.querySelector("[data-next]").disabled = busy || state.index === state.steps.length - 1;
      root.querySelector("[data-reset]").disabled = busy || state.index === 0;
      root.querySelector("[data-play]").textContent = state.playing ? "暂停" : "自动播放";
    }

    function renderStable() {
      const scene = sceneMarkup(state.index);
      svg.outerHTML = scene.markup;
      updateInfo(state.index);
      updateButtons();
    }

    function currentSvg() {
      return root.querySelector("[data-division-svg]");
    }

    function stopAuto() {
      state.playing = false;
      window.clearTimeout(state.timer);
      state.timer = 0;
      updateButtons();
    }

    function animateTo(targetIndex, after) {
      if (state.animation || targetIndex === state.index) return;
      const target = state.steps[targetIndex];
      if (target?.kind !== "eliminate" || reducedMotion()) {
        state.index = targetIndex;
        renderStable();
        after?.();
        return;
      }
      const scene = sceneMarkup(targetIndex, targetIndex);
      currentSvg().outerHTML = scene.markup;
      updateInfo(targetIndex);
      state.animation = { targetIndex };
      updateButtons();
      const liveSvg = currentSvg();
      const product = liveSvg.querySelector("[data-new-product]");
      const line = liveSvg.querySelector("[data-new-line]");
      const remainder = liveSvg.querySelector("[data-new-remainder]");
      const quotient = liveSvg.querySelector("[data-new-quotient]");
      const start = performance.now();
      const duration = 1120;
      const frame = (now) => {
        const progress = clamp((now - start) / duration);
        liveSvg.dataset.animationProgress = progress.toFixed(3);
        const quotientProgress = ease(progress / 0.24);
        if (quotient) {
          quotient.setAttribute("opacity", String(quotientProgress));
          quotient.setAttribute("transform", `translate(0,${-18 * (1 - quotientProgress)})`);
        }
        const productProgress = ease(progress / 0.48);
        if (product) {
          product.setAttribute("opacity", String(0.16 + 0.84 * productProgress));
          product.setAttribute("transform", `translate(0,${-72 * (1 - productProgress)})`);
        }
        const lineProgress = ease((progress - 0.38) / 0.22);
        if (line) line.setAttribute("stroke-dashoffset", String(1 - lineProgress));
        const remainderProgress = ease((progress - 0.58) / 0.42);
        if (remainder) {
          remainder.setAttribute("opacity", String(remainderProgress));
          remainder.setAttribute("transform", `translate(0,${-24 * (1 - remainderProgress)})`);
        }
        if (progress < 1) {
          state.raf = requestAnimationFrame(frame);
          return;
        }
        state.raf = 0;
        state.animation = null;
        state.index = targetIndex;
        renderStable();
        after?.();
      };
      state.raf = requestAnimationFrame(frame);
    }

    function scheduleAuto() {
      if (!state.playing) return;
      if (state.index >= state.steps.length - 1) {
        stopAuto();
        return;
      }
      state.timer = window.setTimeout(() => animateTo(state.index + 1, scheduleAuto), 280);
    }

    function applyPreset(key, button) {
      stopAuto();
      cancelAnimationFrame(state.raf);
      state.raf = 0;
      state.animation = null;
      state.current = presets[key];
      state.steps = M().divisionSteps(state.current.f, state.current.g);
      state.index = 0;
      if (button) selectButtons(root, "[data-preset]", button);
      renderStable();
    }

    root.querySelector("[data-prev]").addEventListener("click", () => {
      stopAuto();
      state.index = Math.max(0, state.index - 1);
      renderStable();
    });
    root.querySelector("[data-next]").addEventListener("click", () => {
      stopAuto();
      animateTo(Math.min(state.steps.length - 1, state.index + 1));
    });
    root.querySelector("[data-reset]").addEventListener("click", () => {
      stopAuto();
      state.index = 0;
      renderStable();
    });
    root.querySelector("[data-play]").addEventListener("click", () => {
      if (state.playing) {
        stopAuto();
        return;
      }
      if (state.index >= state.steps.length - 1) state.index = 0;
      state.playing = true;
      renderStable();
      scheduleAuto();
    });
    root.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => applyPreset(button.dataset.preset, button)));
    window.ch1UseCleanup?.(() => {
      stopAuto();
      cancelAnimationFrame(state.raf);
    });
    applyPreset("default", root.querySelector('[data-preset="default"]'));
  }

  function interactiveLongDivision(el, section) {
    el.innerHTML = `<h2>交互实验</h2>
      <div class="ch1-lab ch1-long-division-lab">
        <div class="ch1-lab-head">
          <h3>标准多项式长除法</h3>
          <p>${section.interactive.description} 这次不再把系数拆成卡片，而是直接在同一张长除法算式里完成对齐、乘回和相减。</p>
        </div>
        <div class="ch1-controls" role="group" aria-label="长除法示例与播放控制">
          <button type="button" data-preset="default" class="is-active" aria-pressed="true">非整除</button>
          <button type="button" data-preset="divides" aria-pressed="false">整除</button>
          <button type="button" data-preset="fraction" aria-pressed="false">分数系数</button>
          <span class="ch1-control-separator"></span>
          <button type="button" data-prev>上一步</button>
          <button type="button" data-play>自动播放</button>
          <button type="button" data-next>下一步</button>
          <button type="button" data-reset>重置</button>
        </div>
        <div class="ch1-ld-progress" data-progress aria-label="长除法步骤进度"></div>
        <div class="ch1-long-division-layout">
          <section class="ch1-long-division-stage">
            <div class="ch1-long-division-scroll">
              <svg data-division-svg viewBox="0 0 900 330" role="img" aria-label="标准多项式长除法" data-animation-progress="0"></svg>
            </div>
            <p class="ch1-ld-caption">完整算式始终留在同一位置：商写在横线上方，乘回结果写在下方，同次项纵向对齐后相减。</p>
          </section>
          <aside class="ch1-ld-side">
            <div class="ch1-ld-summary">
              <div><span>示例</span><strong data-title></strong></div>
              <div><span>步骤</span><strong data-step></strong></div>
              <div><span>f(x)</span><strong data-f></strong></div>
              <div><span>g(x)</span><strong data-g></strong></div>
              <div><span>q(x)</span><strong data-q></strong></div>
              <div><span>r(x)</span><strong data-r></strong></div>
            </div>
            <div data-status class="ch1-status"></div>
            <div class="ch1-ld-focus">
              <span>当前只看这一件事</span>
              <strong data-focus></strong>
              <p data-note></p>
            </div>
            <div class="ch1-ld-invariant">
              <span>全过程保持不变</span>
              <strong data-invariant></strong>
            </div>
          </aside>
        </div>
      </div>`;
    mountLongDivision(el);
  }

  function mountEuclidRepair(root) {
    const presets = {
      default: { f: M().poly([-1, 0, 0, 0, 1]), g: M().poly([-1, 0, 0, 1]), name: "gcd(x⁴−1,x³−1)" },
      coprime: { f: M().poly([1, 0, 1]), g: M().poly([1, 1]), name: "gcd(x²+1,x+1)" },
      shared: { f: M().poly([-2, 1, 2, -1]), g: M().poly([-1, 0, 1]), name: "含公共二次因式" },
    };
    let current = presets.default;
    let steps = M().extendedEuclidSteps(current.f, current.g);
    let index = 0;

    function stepMarkup(step) {
      if (step.kind === "divide") {
        const equation = `${M().formatPolyTex(step.a)}=(${M().formatPolyTex(step.q)})(${M().formatPolyTex(step.b)})+(${M().formatPolyTex(step.remainder)})`;
        return `<div class="ch1-euclid-step-copy"><p>${tex(equation)}</p><small>取余后，用 B 和 r 进入下一轮。</small></div>`;
      }
      if (step.kind === "done") {
        return `<div class="ch1-euclid-step-copy"><p>首一化后得到 ${tex(M().formatPolyTex(step.d || step.a))}</p><small>最后一个非零余式给出最大公因式。</small></div>`;
      }
      return `<div class="ch1-euclid-step-copy"><p>${esc(step.note)}</p><small>从 A=f、B=g 开始。</small></div>`;
    }

    function paint() {
      steps = M().extendedEuclidSteps(current.f, current.g);
      index = Math.min(index, steps.length - 1);
      const step = steps[index];
      const final = steps.at(-1);
      root.querySelector("[data-name]").textContent = current.name;
      root.querySelector("[data-step]").textContent = `${index + 1}/${steps.length}`;
      root.querySelector("[data-a]").innerHTML = tex(M().formatPolyTex(step.a || M().zeroPoly()));
      root.querySelector("[data-b]").innerHTML = tex(M().formatPolyTex(step.b || M().zeroPoly()));
      root.querySelector("[data-q]").innerHTML = step.q ? tex(M().formatPolyTex(step.q)) : "—";
      root.querySelector("[data-r]").innerHTML = step.remainder ? tex(M().formatPolyTex(step.remainder)) : "—";
      const isDone = step.kind === "done";
      const trackedS = step.s || M().onePoly();
      const trackedT = step.t || M().zeroPoly();
      const trackedObject = step.kind === "divide" ? step.remainder : (step.d || step.a);
      const trackedLabel = step.kind === "start" ? "初始对象 A" : (isDone ? "首一最大公因式" : "当前余式 r");
      const verify = M().polyAdd(M().polyMul(trackedS, current.f), M().polyMul(trackedT, current.g));
      root.querySelector("[data-certificate-title]").textContent = isDone ? "Bézout 证书" : "线性组合追踪";
      root.querySelector("[data-object-label]").textContent = trackedLabel;
      root.querySelector("[data-gcd]").innerHTML = tex(M().formatPolyTex(trackedObject));
      root.querySelector("[data-s]").innerHTML = tex(M().formatPolyTex(trackedS));
      root.querySelector("[data-t]").innerHTML = tex(M().formatPolyTex(trackedT));
      root.querySelector("[data-verify]").innerHTML = tex(`(${M().formatPolyTex(trackedS)})(${M().formatPolyTex(current.f)})+(${M().formatPolyTex(trackedT)})(${M().formatPolyTex(current.g)})=${M().formatPolyTex(verify)}`);
      const stageNote = step.kind === "start"
        ? "从 A=f、B=g 出发，下一步计算第一次余式。"
        : (isDone
          ? "算法结束：最后一个非零余式首一化后就是 gcd。"
          : (M().isZeroPoly(step.remainder)
            ? "本轮余式为 0；下一步把最后一个非零余式首一化。"
            : `本轮余式次数降到 ${M().deg(step.remainder)}；下一轮改用 (B,r)。`));
      root.querySelector("[data-stage-note]").textContent = stageNote;
      const coprime = M().polyEq(final.d, M().onePoly());
      const status = root.querySelector("[data-coprime]");
      status.className = `ch1-status ${isDone ? (coprime ? "is-ok" : "is-warn") : ""}`;
      status.textContent = isDone ? (coprime ? "互素：gcd=1" : "含非常数公共因式") : "正在取余";
      root.querySelector("[data-ledger]").innerHTML = steps.slice(0, index + 1).map((entry, stepIndex) => `<div class="${stepIndex === index ? "is-current" : ""}"><span>${stepIndex + 1}</span>${stepMarkup(entry)}</div>`).join("");
      root.querySelector("[data-prev]").disabled = index === 0;
      root.querySelector("[data-next]").disabled = index === steps.length - 1;
      root.querySelector("[data-reset]").disabled = index === 0;
    }

    root.querySelector("[data-prev]").addEventListener("click", () => { index = Math.max(0, index - 1); paint(); });
    root.querySelector("[data-next]").addEventListener("click", () => { index = Math.min(steps.length - 1, index + 1); paint(); });
    root.querySelector("[data-reset]").addEventListener("click", () => { index = 0; paint(); });
    root.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => {
      current = presets[button.dataset.preset];
      index = 0;
      selectButtons(root, "[data-preset]", button);
      paint();
    }));
    paint();
  }

  function interactiveEuclidRepair(el, section) {
    el.innerHTML = `<h2>交互实验</h2>
      <div class="ch1-lab">
        <div class="ch1-lab-head"><h3>欧几里得算法与 Bézout 证书</h3><p>${section.interactive.description}</p></div>
        <div class="ch1-controls">
          <button type="button" data-prev>上一步</button>
          <button type="button" data-next>下一步</button>
          <button type="button" data-reset>重置</button>
          <span class="ch1-control-separator"></span>
          <button type="button" data-preset="default" class="is-active" aria-pressed="true">x⁴−1 与 x³−1</button>
          <button type="button" data-preset="coprime" aria-pressed="false">互素示例</button>
          <button type="button" data-preset="shared" aria-pressed="false">公共因式示例</button>
        </div>
        <div class="ch1-metrics">
          <div class="ch1-metric"><span>当前示例</span><strong data-name></strong></div>
          <div class="ch1-metric"><span>步骤</span><strong data-step></strong></div>
          <div class="ch1-metric"><span>结论</span><strong data-coprime class="ch1-status"></strong></div>
        </div>
        <div class="ch1-equation-grid">
          <div><span>A</span><strong data-a></strong></div>
          <div><span>B</span><strong data-b></strong></div>
          <div><span>商 q</span><strong data-q></strong></div>
          <div><span>余式 r</span><strong data-r></strong></div>
        </div>
        <div class="ch1-euclid-layout">
          <section class="ch1-euclid-panel">
            <h4>欧几里得账本</h4>
            <div class="ch1-ledger" data-ledger></div>
            <p class="ch1-muted" data-stage-note></p>
          </section>
          <section class="ch1-bezout-panel">
            <h4 data-certificate-title>线性组合追踪</h4>
            <div class="ch1-bezout-main"><span data-object-label>初始对象 A</span><strong data-gcd></strong></div>
            <div class="ch1-bezout-coefficients">
              <div class="ch1-bezout-coeff"><span>s(x)</span><strong data-s></strong></div>
              <div class="ch1-bezout-coeff"><span>t(x)</span><strong data-t></strong></div>
            </div>
            <div class="ch1-bezout-verify"><h4>代回验证</h4><div data-verify></div></div>
          </section>
        </div>
      </div>`;
    mountEuclidRepair(el);
  }

  window.defineChapter1Renderer("polynomial-divisibility", { interactive: interactiveLongDivision });
  window.defineChapter1Renderer("gcd-polynomials", { interactive: interactiveEuclidRepair });
})();
