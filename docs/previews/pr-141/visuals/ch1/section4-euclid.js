/* Chapter 1 §4 lab: the Euclidean algorithm, its degree staircase and the Bézout identity sf+tg=gcd(f,g). */
(() => {
  "use strict";

  const M = () => window.Ch1Math;
  const U = () => window.Ch1UI;
  const tex = (value) => U().tex(String(value));
  const superscripts = ["", "", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];

  // x^{2} - \frac{1}{2} → x² − 1/2, for SVG text
  const polyText = (p) => M().formatPolyTex(p)
    .replace(/\\frac\{(\d+)\}\{(\d+)\}/g, "$1/$2")
    .replace(/\^\{(\d)\}/g, (_, d) => superscripts[Number(d)] || `^${d}`)
    .replace(/ /g, "")
    .replace(/-/g, "−");

  function selectButtons(root, selector, selected) {
    root.querySelectorAll(selector).forEach((button) => {
      const active = button === selected;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function mountEuclid(root) {
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
      // the shuffle key keeps the old file name so the options stay in the same order
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

  function interactiveEuclid(el, section) {
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
    mountEuclid(el);
  }

  defineLessonRenderer("ch1", "gcd-polynomials", { interactive: interactiveEuclid });
})();
