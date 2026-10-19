/* Chapter 1 repair pass: standard polynomial long division and readable Euclid formulas. */
(() => {
  "use strict";

  const M = () => window.Ch1Math;
  const U = () => window.Ch1UI;
  const tex = (value) => U().tex(String(value));
  const svgEsc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]);
  const superscripts = ["", "", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];

  /*
   * Degree staircase shared by §3 (long division) and §4 (Euclid).
   * bars: [{ label, deg (null for the zero polynomial), role: "f" | "g" | "r" }]
   * line: { deg, label } draws a dashed level (deg g in §3); highlight: index of the glowing bar.
   * Only bars already reached are passed in, so earlier steps stay as the staircase.
   */
  function degreeStairs(bars, { maxDeg, line = null, highlight = -1, highlightLabel = "", topLabel = "" } = {}) {
    const unit = 24;
    const top = 26;
    const left = 46;
    const step = 54;
    const barW = 28;
    const levels = Math.max(1, maxDeg);
    const y = (d) => top + (levels - d) * unit;
    const base = y(0) + 14;
    // the zero polynomial has no degree: it is an empty slot below the axis
    const hasZero = bars.some((bar) => bar.deg == null);
    const nameY = base + (hasZero ? 36 : 20);
    const width = Math.max(280, left + bars.length * step + 100);
    const height = nameY + (highlightLabel ? 32 : 10);
    const out = [`<svg class="ch1-stairs-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="余式次数逐步下降">`];
    for (let d = 0; d <= levels; d += 1) {
      out.push(`<line class="ch1-stairs-grid" x1="${left - 8}" x2="${width - 8}" y1="${y(d)}" y2="${y(d)}"></line>`);
      out.push(`<text class="ch1-stairs-tick" x="${left - 14}" y="${y(d) + 4}" text-anchor="end">${d}</text>`);
    }
    out.push(`<text class="ch1-stairs-axis" x="6" y="${top - 12}">次数</text>`);
    if (line) {
      out.push(`<line class="ch1-stairs-level" x1="${left - 8}" x2="${width - 8}" y1="${y(line.deg)}" y2="${y(line.deg)}"></line>`);
      out.push(`<text class="ch1-stairs-level-label" x="${width - 10}" y="${y(line.deg) - 6}" text-anchor="end">${svgEsc(line.label)}</text>`);
    }
    bars.forEach((bar, i) => {
      const x = left + 10 + i * step;
      const cx = x + barW / 2;
      const role = `is-${bar.role}`;
      if (bar.deg == null) {
        out.push(`<rect class="ch1-stairs-zero ${role}" x="${x}" y="${base + 3}" width="${barW}" height="14" rx="2"></rect>`);
        out.push(`<text class="ch1-stairs-zero-label ${role}" x="${cx}" y="${base - 6}" text-anchor="middle">0 多项式</text>`);
      } else {
        const h = base - y(bar.deg);
        if (i === highlight) out.push(`<rect class="ch1-stairs-glow ${role}" x="${x - 4}" y="${y(bar.deg) - 4}" width="${barW + 8}" height="${h + 4}" rx="5"></rect>`);
        out.push(`<rect class="ch1-stairs-bar ${role}" x="${x}" y="${y(bar.deg)}" width="${barW}" height="${h}" rx="3"></rect>`);
        out.push(`<text class="ch1-stairs-value ${role}" x="${cx}" y="${y(bar.deg) - 7}" text-anchor="middle">${bar.deg}</text>`);
        if (i === highlight && topLabel) out.push(`<text class="ch1-stairs-top ${role}" x="${cx}" y="${Math.max(12, y(bar.deg) - 24)}" text-anchor="middle">${svgEsc(topLabel)}</text>`);
      }
      out.push(`<text class="ch1-stairs-name ${role}" x="${cx}" y="${nameY}" text-anchor="middle">${svgEsc(bar.label)}</text>`);
      if (i > 0) {
        const prev = bars[i - 1];
        const from = prev.deg == null ? base + 17 : y(prev.deg);
        const to = bar.deg == null ? base + 3 : y(bar.deg);
        out.push(`<path class="ch1-stairs-step" d="M${x - step + barW} ${from} H${x}${to !== from ? ` V${to}` : ""}"></path>`);
      }
      if (i === highlight && highlightLabel) {
        out.push(`<text class="ch1-stairs-callout ${role}" x="${x - 6}" y="${nameY + 22}">↑ ${svgEsc(highlightLabel)}</text>`);
      }
    });
    out.push("</svg>");
    return out.join("");
  }
  // x^{2} - \frac{1}{2} → x² − 1/2, for SVG text
  const polyText = (p) => M().formatPolyTex(p)
    .replace(/\\frac\{(\d+)\}\{(\d+)\}/g, "$1/$2")
    .replace(/\^\{(\d)\}/g, (_, d) => superscripts[Number(d)] || `^${d}`)
    .replace(/ /g, "")
    .replace(/-/g, "−");
  const sub = (k) => String(k).split("").map((c) => "₀₁₂₃₄₅₆₇₈₉"[Number(c)]).join("");
  window.Ch1Stairs = { degreeStairs, sub };

  function selectButtons(root, selector, selected) {
    root.querySelectorAll(selector).forEach((button) => {
      const active = button === selected;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function mountEuclidRepair(root) {
    const presets = {
      default: { f: M().poly([-1, 0, 0, 0, 1]), g: M().poly([-1, 0, 0, 1]), name: tex("\\gcd(x^4-1,x^3-1)") },
      coprime: { f: M().poly([1, 0, 1]), g: M().poly([1, 1]), name: tex("\\gcd(x^2+1,x+1)") },
      shared: { f: M().poly([-2, 1, 2, -1]), g: M().poly([-1, 0, 1]), name: "含公共二次因式" },
    };
    let current = presets.default;
    let steps = M().extendedEuclidSteps(current.f, current.g);
    let index = 0;
    let gate = null;

    // f, g, then one bar per remainder reached so far; the last nonzero one glows at the end
    function stairs(done) {
      const bars = [
        { label: "f", deg: M().deg(current.f), role: "f" },
        { label: "g", deg: M().deg(current.g), role: "g" },
      ];
      let k = 0;
      steps.forEach((entry, stepIndex) => {
        if (entry.kind !== "divide" || stepIndex > index) return;
        k += 1;
        bars.push({ label: `r${window.Ch1Stairs.sub(k)}`, deg: M().isZeroPoly(entry.remainder) ? null : M().deg(entry.remainder), role: "r" });
      });
      let highlight = -1;
      if (done) bars.forEach((bar, i) => { if (bar.deg != null) highlight = i; });
      const final = steps.at(-1);
      return window.Ch1Stairs.degreeStairs(bars, {
        maxDeg: Math.max(M().deg(current.f), M().deg(current.g)),
        highlight,
        highlightLabel: done ? "最后一个非零余式" : "",
        topLabel: done ? `gcd = ${polyText(final.d || final.a)}` : "",
      });
    }

    // p written as (d)·(p/d) with the common factor d marked; d divides every A, B, r of the run
    function factored(p, d) {
      if (M().isZeroPoly(p)) return tex("0");
      const mark = `<b class="ch1-common-factor">${tex(`(${M().formatPolyTex(d)})`)}</b>`;
      const q = M().polyDiv(p, d).q;
      if (M().deg(q) === 0) {
        const c = M().formatRTex(q[0]);
        return `${c === "1" ? "" : tex(c === "-1" ? "-" : c)}${mark}`;
      }
      return `${mark}${tex(`(${M().formatPolyTex(q)})`)}`;
    }

    function stepMarkup(step, common) {
      if (step.kind === "divide") {
        const equation = `${M().formatPolyTex(step.a)}=(${M().formatPolyTex(step.q)})(${M().formatPolyTex(step.b)})+(${M().formatPolyTex(step.remainder)})`;
        const note = common
          // each “X=(…)(…)” stays on one line; lines break only between them
          ? `<small class="ch1-euclid-common"><span class="ch1-keep">${tex("A={}")}${factored(step.a, common)}，</span><span class="ch1-keep">${tex("B={}")}${factored(step.b, common)}，</span><span class="ch1-keep">${tex("r={}")}${factored(step.remainder, common)}</span></small>`
          : `<small>取余后，用 ${tex("B")} 和 ${tex("r")} 进入下一轮。</small>`;
        return `<div class="ch1-euclid-step-copy"><p>${tex(equation)}</p>${note}</div>`;
      }
      if (step.kind === "done") {
        const d = M().formatPolyTex(step.d || step.a);
        return `<div class="ch1-euclid-step-copy"><p>首一化后得到 ${common ? `<b class="ch1-common-factor">${tex(d)}</b>` : tex(d)}</p><small>${common ? `每一行的 ${tex("A")}、${tex("B")}、${tex("r")} 都含这个因式，取余时它一直保留。` : "最后一个非零余式给出最大公因式。"}</small></div>`;
      }
      return `<div class="ch1-euclid-step-copy"><p>初始化：${tex("A=f")}，${tex("B=g")}</p><small>从 ${tex("A=f")}、${tex("B=g")} 开始。</small></div>`;
    }

    function paint() {
      steps = M().extendedEuclidSteps(current.f, current.g);
      index = Math.min(index, steps.length - 1);
      const step = steps[index];
      const final = steps.at(-1);
      root.querySelector("[data-name]").innerHTML = current.name;
      root.querySelector("[data-step]").textContent = `${index + 1}/${steps.length}`;
      root.querySelector("[data-a]").innerHTML = tex(M().formatPolyTex(step.a || M().zeroPoly()));
      root.querySelector("[data-b]").innerHTML = tex(M().formatPolyTex(step.b || M().zeroPoly()));
      root.querySelector("[data-q]").innerHTML = step.q ? tex(M().formatPolyTex(step.q)) : "—";
      root.querySelector("[data-r]").innerHTML = step.remainder ? tex(M().formatPolyTex(step.remainder)) : "—";
      root.querySelector("[data-note]").hidden = true;
      // the gcd, s, t and the verdict appear only once the last step is reached
      const done = index === steps.length - 1;
      const wait = `<small class="ch1-muted">做完最后一步后显示</small>`;
      root.querySelector("[data-gcd]").innerHTML = done ? tex(M().formatPolyTex(final.d || final.a)) : wait;
      root.querySelector("[data-s]").innerHTML = done ? tex(M().formatPolyTex(final.s || M().zeroPoly())) : "—";
      root.querySelector("[data-t]").innerHTML = done ? tex(M().formatPolyTex(final.t || M().zeroPoly())) : "—";
      const verify = M().polyAdd(M().polyMul(final.s, current.f), M().polyMul(final.t, current.g));
      root.querySelector("[data-verify]").innerHTML = done ? tex(`(${M().formatPolyTex(final.s)})(${M().formatPolyTex(current.f)})+(${M().formatPolyTex(final.t)})(${M().formatPolyTex(current.g)})=${M().formatPolyTex(verify)}`) : wait;
      const coprime = M().polyEq(final.d, M().onePoly());
      const status = root.querySelector("[data-coprime]");
      status.className = `ch1-status ${done ? (coprime ? "is-ok" : "is-warn") : "is-warn"}`;
      status.textContent = done ? (coprime ? "互素" : "有非常数公共因式") : "取余进行中";
      // once the run ends, a non-constant gcd is marked inside every ledger row
      const common = done && !coprime ? (final.d || final.a) : null;
      root.querySelector("[data-ledger]").innerHTML = steps.filter((_, stepIndex) => stepIndex <= index).map((entry, stepIndex) => `<div class="${stepIndex === index ? "is-current" : ""}"><span>${stepIndex + 1}</span>${stepMarkup(entry, common)}</div>`).join("");
      root.querySelector("[data-stairs]").innerHTML = stairs(done);
      root.querySelector("[data-stairs-note]").textContent = done
        ? `次数 ${M().deg(current.f)} → ${M().deg(current.g)} → ${steps.filter((e) => e.kind === "divide").map((e) => (M().isZeroPoly(e.remainder) ? "0 多项式" : M().deg(e.remainder))).join(" → ")}，降到 0 多项式就停；它前面那一个就是公因式。`
        : "每取一次余，余式次数严格下降，所以一定会停。";
      if (done) gate?.acted();
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
    gate = window.LAPredictGate?.mount(root.querySelector("[data-gcd-gate]"), {
      root,
      manual: true,
      key: "visuals/ch1/repair-pass.js#euclid",
      question: `对 ${tex("f=x^4-1")}、${tex("g=x^3-1")} 反复做带余除法，余式次数一路下降。最大公因式在哪里读出？`,
      options: [
        ["最后一个非零余式（化成首一）", true, ""],
        ["余式变成 0 的那一步：0 就是最大公因式", false, "余式为 0 只说明除法停了；公因式是它前面那个非零余式。"],
        ["余式变成非零常数时的那个常数", false, `这里余式从 ${tex("x-1")} 直接变成 0，没有经过常数；余式是非零常数时，最大公因式是 1。`],
        [`必须先把 ${tex("f")}、${tex("g")} 分解因式才能读出`, false, "整个过程只做带余除法，没有分解因式。"],
      ],
      right: `✓ 每一步 ${tex("\\gcd(f,g)=\\gcd(g,r)")}，公因式在取余中保持不变；余式次数严格下降，到 0 多项式为止，前一个非零余式化成首一就是 ${tex("\\gcd(f,g)")}。对 ${tex("x^4-1")} 与 ${tex("x^3-1")}，它是 ${tex("x-1")}。`,
    });
    paint();
  }

  function interactiveEuclidRepair(el, section) {
    el.innerHTML = `<h2>交互实验</h2>
      <div class="ch1-lab">
        <div class="ch1-lab-head"><h3>辗转相除：余式次数降到哪里停</h3><p>${section.interactive.description}</p></div>
        <div data-gcd-gate></div>
        <div class="ch1-controls">
          <button type="button" data-prev>上一步</button>
          <button type="button" class="is-primary" data-next>下一步</button>
          <button type="button" data-reset>重置</button>
          <span class="ch1-control-separator"></span>
          <button type="button" data-preset="default" class="is-active" aria-pressed="true">${tex("x^4-1")} 与 ${tex("x^3-1")}</button>
          <button type="button" data-preset="coprime" aria-pressed="false">互素示例</button>
          <button type="button" data-preset="shared" aria-pressed="false">公共因式示例</button>
        </div>
        <div class="ch1-metrics">
          <div class="ch1-metric"><span>当前示例</span><strong data-name></strong></div>
          <div class="ch1-metric"><span>步骤</span><strong data-step></strong></div>
          <div class="ch1-metric"><span>结论</span><strong data-coprime class="ch1-status"></strong></div>
        </div>
        <div class="ch1-equation-grid">
          <div><span>${tex("A")}</span><strong data-a></strong></div>
          <div><span>${tex("B")}</span><strong data-b></strong></div>
          <div><span>商 ${tex("q")}</span><strong data-q></strong></div>
          <div><span>余式 ${tex("r")}</span><strong data-r></strong></div>
        </div>
        <section class="ch1-stairs-card">
          <h4>余式次数</h4>
          <div class="ch1-stairs" data-stairs></div>
          <p class="ch1-stairs-note" data-stairs-note></p>
        </section>
        <div class="ch1-euclid-layout">
          <section class="ch1-euclid-panel">
            <h4>辗转相除的每一步</h4>
            <div class="ch1-ledger" data-ledger></div>
            <div class="ch1-muted" data-note></div>
          </section>
          <section class="ch1-bezout-panel">
            <h4>倒着代回：${tex("sf+tg=\\gcd(f,g)")}</h4>
            <div class="ch1-bezout-main"><span>首一最大公因式</span><strong data-gcd></strong></div>
            <div class="ch1-bezout-coefficients">
              <div class="ch1-bezout-coeff"><span>${tex("s(x)")}</span><strong data-s></strong></div>
              <div class="ch1-bezout-coeff"><span>${tex("t(x)")}</span><strong data-t></strong></div>
            </div>
            <div class="ch1-bezout-verify"><h4>代回验证</h4><div data-verify></div></div>
          </section>
        </div>
      </div>`;
    mountEuclidRepair(el);
  }

  defineLessonRenderer("ch1", "gcd-polynomials", { interactive: interactiveEuclidRepair });
})();
