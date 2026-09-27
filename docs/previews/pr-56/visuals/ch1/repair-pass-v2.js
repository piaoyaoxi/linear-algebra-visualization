/* Final §3 repair: standard polynomial long division without coefficient cards. */
(() => {
  "use strict";

  const M = () => window.Ch1Math;
  const U = () => window.Ch1UI;
  const tex = (value) => U().tex(String(value));
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const ease = (value) => {
    const t = clamp(value);
    return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
  };
  const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const superscripts = ["", "", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
  const svgEscape = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
  })[char]);

  function setActive(root, selector, selected) {
    root.querySelectorAll(selector).forEach((button) => {
      const active = button === selected;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function coefficient(poly, degree) {
    return poly[degree] || M().R(0);
  }

  function variable(degree) {
    if (degree === 0) return "";
    if (degree === 1) return "x";
    return `x${superscripts[degree] || `^${degree}`}`;
  }

  function term(poly, degree) {
    if (M().isZeroPoly(poly) || degree > M().deg(poly)) return "";
    const value = coefficient(poly, degree);
    if (M().rIsZero(value)) return "";
    const raw = M().formatR(value);
    const negative = raw.startsWith("-");
    const absolute = negative ? raw.slice(1) : raw;
    const body = degree > 0 && absolute === "1" ? variable(degree) : `${absolute}${variable(degree)}`;
    const first = degree === M().deg(poly);
    if (first) return `${negative ? "−" : ""}${body}`;
    return `${negative ? "− " : "+ "}${body}`;
  }

  function polynomial(poly) {
    if (M().isZeroPoly(poly)) return "0";
    const parts = [];
    for (let degree = M().deg(poly); degree >= 0; degree -= 1) {
      const text = term(poly, degree);
      if (text) parts.push(text);
    }
    return parts.join(" ") || "0";
  }

  function termRow(poly, maxDegree, y, config) {
    if (M().isZeroPoly(poly)) {
      const x = config.x0 + maxDegree * config.columnWidth;
      return `<text class="ch1-ld-term${config.newDegree === 0 ? " is-new-quotient" : ""}" x="${x}" y="${y}"${config.newDegree === 0 ? " data-new-quotient" : ""}>0</text>`;
    }
    const output = [];
    for (let degree = maxDegree; degree >= 0; degree -= 1) {
      const text = term(poly, degree);
      if (!text) continue;
      const x = config.x0 + (maxDegree - degree) * config.columnWidth;
      const isFocus = degree === config.focusDegree;
      const isNew = degree === config.newDegree;
      const classes = ["ch1-ld-term", isFocus ? "is-focus" : "", isNew ? "is-new-quotient" : ""].filter(Boolean).join(" ");
      output.push(`<text class="${classes}" x="${x}" y="${y}"${isNew ? " data-new-quotient" : ""}>${svgEscape(text)}</text>`);
    }
    return output.join("");
  }

  function mount(root) {
    const presets = {
      default: { f: M().poly([-1, 0, 0, 0, 1]), g: M().poly([1, 1, 1]), name: "x⁴−1 ÷ (x²+x+1)" },
      divides: { f: M().poly([-1, 0, 0, 1]), g: M().poly([-1, 1]), name: "x³−1 ÷ (x−1)" },
      fraction: { f: M().poly(["1/2", "-1/2", 0, 1]), g: M().poly(["1/2", 1]), name: "分数系数示例" },
    };
    const state = {
      example: presets.default,
      steps: [],
      index: 0,
      animation: null,
      raf: 0,
      timer: 0,
      playing: false,
    };

    const svgNode = () => root.querySelector("[data-division-svg]");
    const eliminations = () => state.steps
      .map((step, index) => ({ step, index }))
      .filter(({ step }) => step.kind === "eliminate");

    function scene(index, animatedIndex = null) {
      const maxDegree = Math.max(1, M().deg(state.example.f));
      const columnWidth = 112;
      const x0 = 224;
      const width = x0 + (maxDegree + 1) * columnWidth + 34;
      const visible = eliminations().filter((entry) => entry.index <= index);
      const height = Math.max(320, 206 + visible.length * 124 + 58);
      const active = animatedIndex == null ? null : state.steps[animatedIndex];
      const activeDegree = active?.kind === "eliminate" ? M().deg(active.before) : null;
      const newQuotientDegree = active?.kind === "eliminate" ? M().deg(active.term) : null;
      const quotient = state.steps[index]?.q || M().zeroPoly();
      const rows = [];

      visible.forEach(({ step, index: stepIndex }, rowIndex) => {
        const productY = 207 + rowIndex * 124;
        const lineY = productY + 22;
        const remainderY = productY + 67;
        const isNew = stepIndex === animatedIndex;
        const lineStart = x0 + (maxDegree - M().deg(step.before)) * columnWidth - 10;
        rows.push(`<g${isNew ? ' data-new-product opacity="0.12" transform="translate(0,-66)"' : ""}>`);
        rows.push(`<text class="ch1-ld-product-label" x="22" y="${productY}">${svgEscape(`${polynomial(step.term)} · g(x)`)}</text>`);
        rows.push(`<text class="ch1-ld-minus" x="195" y="${productY}">−</text>`);
        rows.push(termRow(step.product, maxDegree, productY, { x0, columnWidth, focusDegree: isNew ? activeDegree : null }));
        rows.push("</g>");
        rows.push(`<path class="ch1-ld-subtract-line" d="M${lineStart} ${lineY} H${width - 34}" pathLength="1"${isNew ? ' data-new-line stroke-dasharray="1" stroke-dashoffset="1"' : ""}></path>`);
        rows.push(`<g${isNew ? ' data-new-remainder opacity="0" transform="translate(0,-22)"' : ""}>`);
        rows.push(termRow(step.r, maxDegree, remainderY, { x0, columnWidth }));
        rows.push("</g>");
      });

      return `<svg data-division-svg data-animation-progress="0" viewBox="0 0 ${width} ${height}" role="img" aria-label="标准多项式长除法">
        <text class="ch1-ld-label" x="22" y="57">商</text>
        ${termRow(quotient, maxDegree, 59, { x0, columnWidth, newDegree: newQuotientDegree })}
        <path class="ch1-ld-bracket" d="M188 91 H${width - 34} M188 91 V154"></path>
        <text class="ch1-ld-label" x="22" y="111">除式</text>
        <text class="ch1-ld-divisor-text" x="174" y="141" text-anchor="end">${svgEscape(polynomial(state.example.g))}</text>
        <text class="ch1-ld-label" x="22" y="141">被除式</text>
        ${termRow(state.example.f, maxDegree, 141, { x0, columnWidth, focusDegree: activeDegree })}
        ${rows.join("")}
      </svg>`;
    }

    function updateText(index) {
      const step = state.steps[index];
      const done = step.kind === "done";
      const divides = done && M().isZeroPoly(step.r);
      root.querySelector("[data-title]").textContent = state.example.name;
      root.querySelector("[data-step]").textContent = `${index + 1}/${state.steps.length}`;
      root.querySelector("[data-f]").innerHTML = tex(M().formatPolyTex(state.example.f));
      root.querySelector("[data-g]").innerHTML = tex(M().formatPolyTex(state.example.g));
      root.querySelector("[data-q]").innerHTML = tex(M().formatPolyTex(step.q));
      root.querySelector("[data-r]").innerHTML = tex(M().formatPolyTex(step.r));
      root.querySelector("[data-invariant]").innerHTML = tex(`${M().formatPolyTex(state.example.f)}=(${M().formatPolyTex(step.q)})(${M().formatPolyTex(state.example.g)})+(${M().formatPolyTex(step.r)})`);
      const status = root.querySelector("[data-status]");
      status.className = `ch1-status ${done ? (divides ? "is-ok" : "is-bad") : "is-warn"}`;
      status.textContent = done ? (divides ? "余式为 0，整除成立" : "余式非零，不整除") : "长除法进行中";
      if (step.kind === "start") {
        root.querySelector("[data-focus]").textContent = "先比较被除式和除式的最高次项。";
        root.querySelector("[data-note]").textContent = `用 x${superscripts[M().deg(state.example.f) - M().deg(state.example.g)] || ""} 消去当前最高次项。`;
      } else if (step.kind === "eliminate") {
        root.querySelector("[data-focus]").textContent = `商中加入 ${polynomial(step.term)}，乘回除式并在同次项下方对齐。`;
        root.querySelector("[data-note]").textContent = M().isZeroPoly(step.r) ? "相减后余式归零。" : `相减后得到 ${polynomial(step.r)}，余式次数降为 ${M().deg(step.r)}。`;
      } else {
        root.querySelector("[data-focus]").textContent = divides ? "余式归零，除法结束。" : "余式次数已经低于除式次数，除法结束。";
        root.querySelector("[data-note]").textContent = divides ? "因此 f(x)=q(x)g(x)。" : `最终 deg r=${M().deg(step.r)}<deg g=${M().deg(state.example.g)}。`;
      }
      root.querySelector("[data-progress]").innerHTML = state.steps.map((_, stepIndex) => `<span class="${stepIndex < index ? "is-done" : stepIndex === index ? "is-current" : ""}" aria-label="第 ${stepIndex + 1} 步"></span>`).join("");
    }

    function updateButtons() {
      const busy = Boolean(state.animation);
      root.querySelector("[data-prev]").disabled = busy || state.index === 0;
      root.querySelector("[data-next]").disabled = busy || state.index === state.steps.length - 1;
      root.querySelector("[data-reset]").disabled = busy || state.index === 0;
      root.querySelector("[data-play]").textContent = state.playing ? "暂停" : "自动播放";
    }

    function render() {
      svgNode().outerHTML = scene(state.index);
      updateText(state.index);
      updateButtons();
    }

    function stop() {
      state.playing = false;
      clearTimeout(state.timer);
      state.timer = 0;
      updateButtons();
    }

    function go(targetIndex, after) {
      if (state.animation || targetIndex === state.index) return;
      const target = state.steps[targetIndex];
      if (target.kind !== "eliminate" || reducedMotion()) {
        state.index = targetIndex;
        render();
        after?.();
        return;
      }
      svgNode().outerHTML = scene(targetIndex, targetIndex);
      updateText(targetIndex);
      state.animation = { targetIndex };
      updateButtons();
      const live = svgNode();
      const quotient = live.querySelector("[data-new-quotient]");
      const product = live.querySelector("[data-new-product]");
      const line = live.querySelector("[data-new-line]");
      const remainder = live.querySelector("[data-new-remainder]");
      const started = performance.now();
      const duration = 1150;
      const frame = (now) => {
        const progress = clamp((now - started) / duration);
        live.dataset.animationProgress = progress.toFixed(3);
        const q = ease(progress / 0.22);
        if (quotient) {
          quotient.setAttribute("opacity", String(q));
          quotient.setAttribute("transform", `translate(0,${-16 * (1 - q)})`);
        }
        const p = ease(progress / 0.48);
        if (product) {
          product.setAttribute("opacity", String(0.12 + 0.88 * p));
          product.setAttribute("transform", `translate(0,${-66 * (1 - p)})`);
        }
        const l = ease((progress - 0.37) / 0.22);
        if (line) line.setAttribute("stroke-dashoffset", String(1 - l));
        const r = ease((progress - 0.57) / 0.43);
        if (remainder) {
          remainder.setAttribute("opacity", String(r));
          remainder.setAttribute("transform", `translate(0,${-22 * (1 - r)})`);
        }
        if (progress < 1) {
          state.raf = requestAnimationFrame(frame);
          return;
        }
        state.animation = null;
        state.raf = 0;
        state.index = targetIndex;
        render();
        after?.();
      };
      state.raf = requestAnimationFrame(frame);
    }

    function auto() {
      if (!state.playing) return;
      if (state.index >= state.steps.length - 1) {
        stop();
        return;
      }
      state.timer = setTimeout(() => go(state.index + 1, auto), 260);
    }

    function choose(key, button) {
      stop();
      cancelAnimationFrame(state.raf);
      state.animation = null;
      state.raf = 0;
      state.example = presets[key];
      state.steps = M().divisionSteps(state.example.f, state.example.g);
      state.index = 0;
      setActive(root, "[data-preset]", button);
      render();
    }

    root.querySelector("[data-prev]").addEventListener("click", () => {
      stop();
      state.index = Math.max(0, state.index - 1);
      render();
    });
    root.querySelector("[data-next]").addEventListener("click", () => {
      stop();
      go(Math.min(state.steps.length - 1, state.index + 1));
    });
    root.querySelector("[data-reset]").addEventListener("click", () => {
      stop();
      state.index = 0;
      render();
    });
    root.querySelector("[data-play]").addEventListener("click", () => {
      if (state.playing) {
        stop();
        return;
      }
      if (state.index >= state.steps.length - 1) state.index = 0;
      state.playing = true;
      render();
      auto();
    });
    root.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => choose(button.dataset.preset, button)));
    window.ch1UseCleanup?.(() => {
      stop();
      cancelAnimationFrame(state.raf);
    });
    choose("default", root.querySelector('[data-preset="default"]'));
  }

  function interactive(el, section) {
    el.innerHTML = `<h2>交互实验</h2>
      <div class="ch1-lab ch1-long-division-lab">
        <div class="ch1-lab-head">
          <h3>标准多项式长除法</h3>
          <p>${section.interactive.description} 所有多项式都作为完整算式显示，不再把每个系数切成独立卡片。</p>
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
              <svg data-division-svg data-animation-progress="0" viewBox="0 0 900 320" role="img" aria-label="标准多项式长除法"></svg>
            </div>
            <p class="ch1-ld-caption">商写在横线上方；乘回结果写在当前余式下方；同次项纵向对齐后相减。</p>
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
            <div class="ch1-ld-focus"><span>当前只看这一件事</span><strong data-focus></strong><p data-note></p></div>
            <div class="ch1-ld-invariant"><span>全过程保持不变</span><strong data-invariant></strong></div>
          </aside>
        </div>
      </div>`;
    mount(el);
  }

  window.defineChapter1Renderer("polynomial-divisibility", { interactive });
})();
