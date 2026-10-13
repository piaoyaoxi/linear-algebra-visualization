(() => {
  "use strict";
  const M = () => window.Ch1Math;
  const U = () => window.Ch1UI;
  const tex = (value) => U().tex(value);
  const display = (value) => U().display(value);
  const renderFormal = (el, section) => U().renderFormal(el, section);
  const lab = (...args) => U().lab(...args);
  const selectButtons = (...args) => U().selectButtons(...args);

  /*
   * §6 — root merge, read through f′.
   * Upper canvas y = f(x), lower canvas y = f′(x) on the same x-scale.
   * Merge mode: f = (x−u)(x−v), f′ = 2x − (u+v); f′ vanishes at (u+v)/2, between the roots,
   *   and at a root of f only when u = v (then gcd(f, f′) = x − u).
   * Multiplicity mode: f = (x−a)^m (x+1), f′ = (x−a)^{m−1}[(m+1)x + m − a];
   *   a = −1 gives f = (x+1)^{m+1}, f′ = (m+1)(x+1)^m.
   * Every value shown is exact: the u, v sliders move in quarters and are read as
   * rationals, so the start u = −3/4, v = 3/4 gives f = x² − 9/16 and f′(u) = u − v = −3/2.
   */
  function mountMultiplicity(root) {
    const state = { mode: "merge", a: 1, m: 2, u: "-0.75", v: "0.75" };
    const fBounds = { xMin: -3, xMax: 3, yMin: -4, yMax: 6 };
    const dBounds = { xMin: -3, xMax: 3, yMin: -6, yMax: 6 };
    const R = (s) => M().parseR(s);
    const frac = (r) => M().formatRText(r);
    const int = (n) => String(n).replace("-", "−");
    const merged = () => state.mode === "merge" && M().rEq(R(state.u), R(state.v));
    const currentPoly = () => state.mode === "multiplicity"
      ? M().polyMul(M().polyPow(M().poly([-state.a, 1]), state.m), M().poly([1, 1]))
      : M().polyMul(M().poly([M().rNeg(R(state.u)), 1]), M().poly([M().rNeg(R(state.v)), 1]));
    const effectiveM = () => (state.mode === "multiplicity" && state.a === -1 ? state.m + 1 : state.m);
    // real roots of f with multiplicity
    function fRoots() {
      if (state.mode === "multiplicity") {
        if (state.a === -1) return [{ x: R(-1), m: state.m + 1 }];
        return [{ x: R(state.a), m: state.m }, { x: R(-1), m: 1 }];
      }
      return merged() ? [{ x: R(state.u), m: 2 }] : [{ x: R(state.u), m: 1 }, { x: R(state.v), m: 1 }];
    }
    // real zeros of f′
    function dRoots() {
      if (state.mode === "multiplicity") {
        if (state.a === -1) return [R(-1)];
        const other = M().R(state.a - state.m, state.m + 1);
        return state.m >= 2 ? [R(state.a), other] : [other];
      }
      return [M().rDiv(M().rAdd(R(state.u), R(state.v)), M().R(2))];
    }
    const shared = () => fRoots().filter((r) => r.m >= 2).map((r) => r.x);
    let gate = null;
    // the last pair u ≠ v: once the roots merge, its f′ stays as a ghost
    let apart = { u: state.u, v: state.v };

    function glow(ctx, p, color) {
      ctx.save();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.18;
      ctx.beginPath(); ctx.arc(p.x, p.y, 15, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = color; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    function dot(ctx, p, color, paper, r = 5.5) {
      ctx.beginPath(); ctx.fillStyle = color; ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = paper; ctx.lineWidth = 1.5; ctx.stroke();
    }
    function guide(ctx, cam, x, height, color) {
      const s = cam.toScreen(x, 0);
      ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(s.x, 6); ctx.lineTo(s.x, height - 6); ctx.stroke(); ctx.restore();
    }
    const font = (size, weight = 600, italic = false) => `${italic ? "italic " : ""}${weight} ${size}px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif`;

    function draw(p, dp) {
      const pal = M().getPalette();
      const open = Boolean(gate?.picked || !gate);
      const common = open ? shared() : [];
      const fCanvas = root.querySelector("[data-graph]");
      const dCanvas = root.querySelector("[data-deriv-graph]");
      // upper: f
      const fc = M().drawPolynomial(fCanvas, p, { bounds: fBounds, series: [{ p, color: pal.v1, width: 2.4 }] });
      let ctx = fCanvas.getContext("2d");
      const fh = fCanvas.getBoundingClientRect().height;
      common.forEach((x) => guide(ctx, fc, M().rToNum(x), fh, pal.axis));
      dRoots().forEach((x) => {
        const s = fc.toScreen(M().rToNum(x), 0);
        ctx.save(); ctx.strokeStyle = pal.v2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s.x, s.y - 7); ctx.lineTo(s.x, s.y + 7); ctx.stroke(); ctx.restore();
      });
      fRoots().forEach((r) => {
        const s = fc.toScreen(M().rToNum(r.x), 0);
        if (r.m >= 2 && open) glow(ctx, s, pal.v1);
        dot(ctx, s, pal.v1, pal.paper);
      });
      ctx.save(); ctx.font = font(14, 600, true); ctx.fillStyle = pal.v1; ctx.fillText("y = f(x)", 14, 22); ctx.restore();
      if (state.mode === "merge" && !merged()) {
        ctx.save(); ctx.font = font(13, 600, true); ctx.textAlign = "center"; ctx.fillStyle = pal.v1;
        [["u", state.u], ["v", state.v]].forEach(([name, val]) => { const s = fc.toScreen(Number(val), 0); ctx.fillText(name, s.x, s.y - 12); });
        ctx.restore();
      }
      // lower: f′ on the same x-scale; after a merge the f′ from before it stays as a ghost
      const ghost = state.mode === "merge" && merged() && open
        ? M().polyDerivative(M().polyMul(M().poly([M().rNeg(R(apart.u)), 1]), M().poly([M().rNeg(R(apart.v)), 1])))
        : null;
      const dSeries = [{ p: dp, color: pal.v2, width: 2.4 }];
      if (ghost) dSeries.unshift({ p: ghost, color: pal.v2, width: 2, dash: [6, 5], alpha: 0.35 });
      const dc = M().drawPolynomial(dCanvas, dp, { bounds: dBounds, series: dSeries });
      ctx = dCanvas.getContext("2d");
      if (ghost) {
        const z = M().rDiv(M().rAdd(R(apart.u), R(apart.v)), M().R(2));
        const s = dc.toScreen(M().rToNum(z), 0);
        ctx.save(); ctx.globalAlpha = 0.45; ctx.strokeStyle = pal.v2; ctx.lineWidth = 1.6; ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.arc(s.x, s.y, 5.5, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 0.8; ctx.font = font(12, 600); ctx.fillStyle = pal.muted; ctx.textAlign = "center";
        ctx.lineWidth = 4; ctx.strokeStyle = pal.paper;
        const t = "合并前的 f′";
        const gy = dc.toScreen(M().rToNum(z), -4.4).y;
        ctx.strokeText(t, s.x, gy); ctx.fillText(t, s.x, gy);
        ctx.restore();
      }
      const dh = dCanvas.getBoundingClientRect().height;
      common.forEach((x) => guide(ctx, dc, M().rToNum(x), dh, pal.axis));
      fRoots().forEach((r) => {
        const s = dc.toScreen(M().rToNum(r.x), 0);
        ctx.save(); ctx.strokeStyle = pal.v1; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s.x, s.y - 7); ctx.lineTo(s.x, s.y + 7); ctx.stroke(); ctx.restore();
      });
      dRoots().forEach((x) => {
        const s = dc.toScreen(M().rToNum(x), 0);
        const isShared = common.some((c) => M().rEq(c, x));
        if (isShared) glow(ctx, s, pal.v2);
        dot(ctx, s, pal.v2, pal.paper);
        if (isShared) {
          ctx.save(); ctx.font = font(13); ctx.fillStyle = pal.text; ctx.textAlign = s.x > dCanvas.getBoundingClientRect().width - 150 ? "right" : "left";
          ctx.lineWidth = 4; ctx.strokeStyle = pal.paper;
          const label = "f 与 f′ 同为 0";
          // beside the top of the dotted guide, clear of the axis numbers
          const lx = ctx.textAlign === "right" ? s.x - 8 : s.x + 8;
          ctx.strokeText(label, lx, 44); ctx.fillText(label, lx, 44); ctx.restore();
        }
      });
      ctx.save(); ctx.font = font(14, 600, true); ctx.fillStyle = pal.v2; ctx.fillText("y = f′(x)", 14, 22); ctx.restore();
    }

    function paint() {
      if (state.mode === "merge" && !merged()) apart = { u: state.u, v: state.v };
      const p = currentPoly();
      const dp = M().polyDerivative(p);
      const gcd = M().polyGcd(p, dp);
      const coprime = M().polyEq(gcd, M().onePoly());
      const open = Boolean(gate?.picked || !gate);
      const focus = state.mode === "multiplicity" ? M().R(state.a) : R(state.u);
      const derivatives = [];
      const maxOrder = state.mode === "multiplicity" ? effectiveM() : (merged() ? 2 : 1);
      for (let order = 0; order <= maxOrder; order++) derivatives.push({ order, value: M().evalPoly(M().polyDerivative(p, order), focus) });
      root.querySelector("[data-poly]").innerHTML = tex(M().formatPolyTex(p));
      root.querySelector("[data-derivative]").innerHTML = tex(M().formatPolyTex(dp));
      const gcdCell = root.querySelector("[data-gcd]");
      gcdCell.innerHTML = open ? tex(M().formatPolyTex(gcd)) : `<small class="ch1-muted">猜过之后显示</small>`;
      gcdCell.closest("div").classList.toggle("is-shared", open && !coprime);
      root.querySelector("[data-focus-label]").innerHTML = tex(state.mode === "multiplicity" ? `x=${M().formatRTex(focus)}` : `x=u=${M().formatRTex(focus)}`);
      root.querySelector("[data-derivatives]").innerHTML = derivatives.map((row) => `<tr><td>${tex(row.order === 0 ? "f" : row.order === 1 ? "f'" : `f^{(${row.order})}`)}</td><td>${frac(row.value)}</td><td><b class="ch1-status ${M().rIsZero(row.value) ? "is-warn" : "is-ok"}">${M().rIsZero(row.value) ? "0" : "非零"}</b></td></tr>`).join("");
      const status = root.querySelector("[data-status]");
      if (state.mode === "multiplicity") {
        const m = effectiveM();
        const a = int(state.a);
        status.innerHTML = m >= 2
          ? `${a} 是 ${m} 重根${state.a === -1 ? `（与 ${tex("x+1")} 合并）` : ""}，也是 ${tex("f'")} 的 ${m - 1} 重根`
          : `${a} 是单根，${tex(`f'(${state.a})\\ne0`)}`;
      } else {
        status.innerHTML = merged()
          ? `${tex("u=v")}：二重根，${tex("f")} 与 ${tex("f'")} 在 ${tex(`x=${M().formatRTex(R(state.u))}`)} 同为 0`
          : `${tex("u\\ne v")}：两个单根（相距 ${frac(M().rAbs(M().rSub(R(state.u), R(state.v))))}），${tex("f'")} 的零点 ${frac(dRoots()[0])} 在两根之间`;
      }
      root.querySelector("[data-m-controls]").hidden = state.mode !== "multiplicity";
      root.querySelector("[data-merge-controls]").hidden = state.mode !== "merge";
      status.className = `ch1-status ${coprime ? "is-ok" : "is-warn"}`;
      draw(p, dp);
      root.querySelector("[data-a-value]").textContent = int(state.a); root.querySelector("[data-m-value]").textContent = state.m;
      root.querySelector("[data-u-value]").textContent = frac(R(state.u)); root.querySelector("[data-v-value]").textContent = frac(R(state.v));
      if (gate?.picked && !coprime) gate.acted();
    }
    const locked = [...root.querySelectorAll("[data-u], [data-v], [data-a], [data-m], [data-preset-m], [data-mode]")];
    const setLocked = (on) => locked.forEach((node) => { node.disabled = on; });
    gate = window.LAPredictGate?.mount(root.querySelector("[data-merge-gate]"), {
      root,
      manual: true,
      key: "visuals/ch1/section5-8-presentation.js#merge-derivative",
      question: `让两个单根 ${tex("u")}、${tex("v")} 合并成一个根。合并后，下方 ${tex("f'")} 的图像在这一点会怎样？`,
      options: [
        [`${tex("f'")} 也在这一点为 0：${tex("f")} 与 ${tex("f'")} 有公共零点，${tex("\\gcd(f,f')\\ne1")}`, true, ""],
        [`${tex("f'")} 在这一点不为 0，${tex("\\gcd(f,f')")} 仍是 1`, false, `合并后 ${tex("f=(x-u)^2")}，${tex("f'=2(x-u)")} 在 ${tex("x=u")} 处为 0。`],
        [`两根足够近时，${tex("\\gcd(f,f')")} 就已经不是 1`, false, `${tex("u\\ne v")} 时 ${tex("f'")} 的零点在 ${tex("\\tfrac{u+v}{2}")}，夹在两根之间，与它们错开，${tex("\\gcd(f,f')=1")}。`],
        [`${tex("f'")} 在这一点有二重根`, false, `重数降一：二重根 u 只是 ${tex("f'")} 的单根。`],
      ],
      right: `✓ ${tex("f'")} 的零点原来夹在两根之间；两根合并时三点重合，${tex("f")} 与 ${tex("f'")} 同时为 0，公因式 ${tex("x-u")} 出现在 ${tex("\\gcd(f,f')")} 中。所以 ${tex("f")} 有重因式当且仅当 ${tex("\\gcd(f,f')\\ne1")}。`,
      onPick: () => { setLocked(false); paint(); },
    });
    if (gate) setLocked(true);
    root.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => { state.mode = button.dataset.mode; selectButtons(root, "[data-mode]", button); paint(); }));
    root.querySelector("[data-a]").addEventListener("input", (e) => { state.a = Number(e.target.value); paint(); });
    root.querySelector("[data-m]").addEventListener("input", (e) => { state.m = Math.round(Number(e.target.value)); paint(); });
    root.querySelector("[data-u]").addEventListener("input", (e) => { state.u = e.target.value; paint(); });
    root.querySelector("[data-v]").addEventListener("input", (e) => { state.v = e.target.value; paint(); });
    root.querySelectorAll("[data-preset-m]").forEach((button) => button.addEventListener("click", () => { state.mode = "multiplicity"; state.m = Number(button.dataset.presetM); root.querySelector("[data-m]").value = state.m; root.querySelectorAll("[data-mode]").forEach((b) => b.classList.toggle("is-active", b.dataset.mode === "multiplicity")); paint(); }));
    root.querySelector("[data-merge-exact]").addEventListener("click", () => { state.mode = "merge"; state.v = state.u; root.querySelector("[data-v]").value = state.v; root.querySelectorAll("[data-mode]").forEach((b) => b.classList.toggle("is-active", b.dataset.mode === "merge")); paint(); });
    M().observeCanvas(root.querySelector(".ch1-merge-stages"), paint);
    paint();
  }

  function interactive6(el, section) {
    lab(el, `两根合并时的 ${tex("f'")}`, section.interactive.description,
      `<button type="button" data-mode="merge" class="is-active">两根合并</button><button type="button" data-mode="multiplicity">单根重数</button><span class="ch1-control-separator"></span>${[1, 2, 3, 4].map((m) => `<button type="button" data-preset-m="${m}">${tex(`m=${m}`)}</button>`).join("")}`,
      `<div class="ch1-two-col"><div class="ch1-merge-stages"><div class="ch1-stage"><canvas data-graph aria-label="y = f(x) 的图像"></canvas></div><div class="ch1-stage is-short"><canvas data-deriv-graph aria-label="同一横轴上 y = f′(x) 的图像"></canvas></div><p class="ch1-merge-legend"><b class="is-f">● ${tex("f")} 的根</b><b class="is-d">● ${tex("f'")} 的零点</b><b class="is-glow">◎ 公共零点</b></p></div><div class="ch1-panel"><div data-merge-controls><label class="ch1-slider-row"><span>根 ${tex("u")}</span><input data-u type="range" min="-2" max="2" step="0.25" value="-0.75"><output data-u-value></output></label><label class="ch1-slider-row"><span>根 ${tex("v")}</span><input data-v type="range" min="-2" max="2" step="0.25" value="0.75"><output data-v-value></output></label><button type="button" class="ch3l-btn is-primary ch1-merge-exact" data-merge-exact>令 ${tex("v=u")}，两根合并</button></div><div data-m-controls hidden><label class="ch1-slider-row"><span>根 ${tex("a")}</span><input data-a type="range" min="-2" max="2" step="1" value="1"><output data-a-value></output></label><label class="ch1-slider-row"><span>重数 ${tex("m")}</span><input data-m type="range" min="1" max="4" step="1" value="2"><output data-m-value></output></label></div><div class="ch1-result-band"><div><span>当前结论</span><strong data-status class="ch1-status"></strong></div></div><div class="ch1-equation-grid"><div><span>${tex("f")}</span><strong data-poly></strong></div><div><span>${tex("f'")}</span><strong data-derivative></strong></div><div class="ch1-gcd-cell"><span>${tex("\\gcd(f,f')")}</span><strong data-gcd></strong></div></div><h4>在 <b data-focus-label></b> 处各阶导数的值</h4><div class="ch1-table-wrap"><table class="ch1-table"><thead><tr><th>导数</th><th>值</th><th>状态</th></tr></thead><tbody data-derivatives></tbody></table></div></div></div>`);
    const gateBox = document.createElement("div");
    gateBox.dataset.mergeGate = "";
    el.querySelector(".ch1-controls")?.before(gateBox);
    mountMultiplicity(el);
  }

  // §7 — evaluation, root bound, interpolation
  function mountPolynomialFunctions(root) {
    const state = { mode: "roots", p: M().poly([1, -2, 0, 1]), a: 1, degree: 3, roots: 2, nodes: [{ x: M().R(0), y: M().R(1) }, { x: M().R(1), y: M().R(2) }, { x: M().R(2), y: M().R(5) }] };
    const bounds = { xMin: -2.5, xMax: 3.5, yMin: -4, yMax: 10 };
    function paintEval() {
      const h = M().hornerSteps(state.p, M().parseR(state.a));
      root.querySelector("[data-eval-panel]").hidden = false; root.querySelector("[data-root-panel]").hidden = true; root.querySelector("[data-interp-panel]").hidden = true;
      root.querySelector("[data-eval-poly]").innerHTML = tex(M().formatPolyTex(state.p));
      // a can be negative: −2 with a true minus on the slider, (−2) after a product dot, x+2 as the factor
      root.querySelector("[data-a-value]").textContent = String(state.a).replace("-", "−");
      root.querySelector("[data-fa]").innerHTML = tex(M().formatRTex(h.value));
      // one formula per row: (before)·a ± coefficient = after
      const times = state.a < 0 ? `(${state.a})` : `${state.a}`;
      const signed = (t) => (t.startsWith("-") ? t : `+${t}`);
      root.querySelector("[data-horner]").innerHTML = h.steps.map((s, i) => `<div class="${i === h.steps.length - 1 ? "is-current" : ""}"><span>${i + 1}</span><p>${tex(`(${M().formatRTex(s.before)})\\cdot${times}${signed(M().formatRTex(s.coefficient))}=${M().formatRTex(s.after)}`)}</p></div>`).join("");
      const isRoot = M().rIsZero(h.value);
      const factor = state.a === 0 ? "x" : state.a < 0 ? `x+${-state.a}` : `x-${state.a}`;
      const st = root.querySelector("[data-factor]"); st.className = `ch1-status ${isRoot ? "is-ok" : "is-warn"}`; st.innerHTML = isRoot ? `${tex(`f(${state.a})=0`)}，${tex(factor)} 是因式` : `余式 ${tex(`f(${state.a})\\ne0`)}`;
      M().drawPolynomial(root.querySelector("[data-canvas]"), state.p, { bounds, points: [{ x: state.a, y: M().rToNum(h.value) }], caption: "求值点 (a,f(a))" });
    }
    // (x − r) as TeX, with an optional power
    const factorTex = (r, k = 1) => {
      const base = r === 0 ? "x" : `(x${r < 0 ? "+" : "-"}${Math.abs(r)})`;
      return k > 1 ? `${base}^{${k}}` : base;
    };
    const productOf = (roots) => roots.reduce((p, r) => M().polyMul(p, M().poly([-r, 1])), M().onePoly());

    /*
     * Root bound: m distinct integer roots, degree n.
     * m ≤ n: p = (x − r₀)^{n−m+1} ∏_{i≥1}(x − rᵢ) has degree n and exactly these m roots.
     * m > n: the degree-n attempt q = ∏_{i<n}(x − rᵢ) is nonzero at the remaining roots,
     *        so only the zero polynomial vanishes at all m points.
     * The curve is scaled vertically to fit (same roots); values in the text are exact.
     */
    function drawRootBound(canvas, info) {
      const { ctx, width, height } = M().setupCanvas(canvas);
      const pal = M().getPalette();
      const cam = M().camera(width, height, { xMin: -4, xMax: 4, yMin: -1.5, yMax: 1.5 }, { stretch: true });
      M().drawAxes(ctx, width, height, cam, pal);
      // scale by the peak near the roots, so the crossings stay visible
      const lo = Math.min(...info.roots) - 0.8;
      const hi = Math.max(...info.roots) + 0.8;
      const scaleOf = (p) => {
        let peak = 0;
        for (let i = 0; i <= 200; i++) peak = Math.max(peak, Math.abs(M().evalPolyNum(p, lo + ((hi - lo) * i) / 200)));
        return peak > 0 ? 1.2 / peak : 1;
      };
      const curve = (p, color, dashed) => {
        const c = scaleOf(p);
        ctx.save();
        ctx.strokeStyle = color; ctx.lineWidth = 2.4;
        if (dashed) ctx.setLineDash([7, 5]);
        ctx.beginPath();
        let down = false;
        for (let i = 0; i <= 320; i++) {
          const x = cam.view.xMin + (i / 320) * (cam.view.xMax - cam.view.xMin);
          const y = c * M().evalPolyNum(p, x);
          if (Math.abs(y) > 2.2) { down = false; continue; }
          const s = cam.toScreen(x, y);
          if (!down) { ctx.moveTo(s.x, s.y); down = true; } else ctx.lineTo(s.x, s.y);
        }
        ctx.stroke();
        ctx.restore();
        return c;
      };
      ctx.font = "600 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      ctx.textAlign = "center";
      if (info.possible) {
        curve(info.p, pal.v1, false);
      } else {
        // only y = 0 vanishes at every root: a result, drawn thick
        const a = cam.toScreen(cam.view.xMin, 0);
        const b = cam.toScreen(cam.view.xMax, 0);
        ctx.save(); ctx.strokeStyle = pal.image; ctx.lineWidth = 3.4;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.restore();
        ctx.save(); ctx.fillStyle = pal.image; ctx.textAlign = "left"; ctx.font = "600 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
        ctx.fillText("只有 y = 0", a.x + 12, a.y - 12); ctx.restore();
        const c = curve(info.q, pal.v1, true);
        info.missed.forEach(({ r, value }) => {
          const base = cam.toScreen(r, 0);
          const top = cam.toScreen(r, Math.max(-1.45, Math.min(1.45, c * M().rToNum(value))));
          ctx.save(); ctx.strokeStyle = pal.v2; ctx.lineWidth = 1.4; ctx.setLineDash([2, 3]);
          ctx.beginPath(); ctx.moveTo(base.x, base.y); ctx.lineTo(top.x, top.y); ctx.stroke(); ctx.restore();
          ctx.fillStyle = pal.v2;
          ctx.beginPath(); ctx.arc(top.x, top.y, 4, 0, Math.PI * 2); ctx.fill();
          ctx.fillText(M().formatR(value).replace("-", "−"), top.x + 18, top.y + 4);
        });
      }
      info.roots.forEach((r, i) => {
        const s = cam.toScreen(r, 0);
        const missed = !info.possible && i >= info.n;
        ctx.beginPath();
        ctx.fillStyle = missed ? pal.v2 : pal.subspace;
        ctx.arc(s.x, s.y, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = pal.paper; ctx.lineWidth = 1.5; ctx.stroke();
        // a root the degree-n attempt could not reach is named, on the side away from its miss
        if (missed) {
          const value = M().rToNum(info.missed[i - info.n]?.value ?? M().R(0));
          ctx.save(); ctx.fillStyle = pal.v2; ctx.font = "600 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
          const unit = cam.toScreen(1, 0).x - cam.toScreen(0, 0).x;
          const stagger = unit < 70 && (i - info.n) % 2 === 1 ? 17 : 0;
          ctx.fillText(`第 ${i + 1} 个根`, s.x, value >= 0 ? s.y + 34 + stagger : s.y - 14 - stagger);
          ctx.restore();
        }
        // the tick numbers already name the roots; only a multiple root gets a label
        if (info.possible && i === 0 && info.n > info.m) {
          ctx.fillStyle = pal.text;
          ctx.fillText(`${info.n - info.m + 1} 重`, s.x, s.y - 12);
        }
      });
      ctx.textAlign = "left";
    }

    function paintRoots() {
      root.querySelector("[data-eval-panel]").hidden = true; root.querySelector("[data-root-panel]").hidden = false; root.querySelector("[data-interp-panel]").hidden = true;
      const n = state.degree;
      const m = state.roots;
      root.querySelector("[data-degree-value]").textContent = n;
      root.querySelector("[data-roots-value]").textContent = m;
      const roots = Array.from({ length: m }, (_, i) => i - Math.floor(m / 2));
      const possible = m <= n;
      const status = root.querySelector("[data-root-status]");
      const out = root.querySelector("[data-root-poly]");
      const title = root.querySelector("[data-root-title]");
      if (possible) {
        const p = M().polyMul(productOf(roots.slice(1)), M().polyPow(M().poly([-roots[0], 1]), n - m + 1));
        status.className = "ch1-status is-ok";
        status.textContent = `${m} 个不同的根，次数 ${n}：可以`;
        title.textContent = "构造结果";
        out.innerHTML = `${tex(`${factorTex(roots[0], n - m + 1)}${roots.slice(1).map((r) => factorTex(r)).join("")}`)}<br><span class="ch1-muted">每个根贡献一个一次因式，共 ${n} 个，次数正好是 ${n}。</span>`;
        drawRootBound(root.querySelector("[data-canvas]"), { possible, p, roots, n, m });
      } else {
        const q = productOf(roots.slice(0, n));
        const missed = roots.slice(n).map((r) => ({ r, value: M().evalPoly(q, M().R(r)) }));
        status.className = "ch1-status is-bad";
        status.textContent = `${m} 个不同的根，次数 ${n}：只有零多项式`;
        title.textContent = `次数为 ${n} 的尝试`;
        out.innerHTML = `${tex(`q(x)=${roots.slice(0, n).map((r) => factorTex(r)).join("")}`)} 已经用掉 ${n} 个一次因式，在 ${missed.map(({ r, value }) => tex(`q(${r})=${M().formatRTex(value)}`)).join("，")}，不为 0。<br><span class="ch1-muted">要在 ${m} 个点都为 0，就要含 ${m} 个不同的一次因式，次数至少是 ${m}。所以次数不超过 ${n} 的多项式只能是 0。</span>`;
        drawRootBound(root.querySelector("[data-canvas]"), { possible, q, missed, roots, n, m });
        gate?.acted();
      }
    }
    function readNodes() {
      return [0, 1, 2].map((i) => ({ x: M().parseR(root.querySelector(`[data-node-x="${i}"]`).value), y: M().parseR(root.querySelector(`[data-node-y="${i}"]`).value) }));
    }
    function paintInterpolation() {
      root.querySelector("[data-eval-panel]").hidden = true; root.querySelector("[data-root-panel]").hidden = true; root.querySelector("[data-interp-panel]").hidden = false;
      let result;
      try {
        state.nodes = readNodes();
        result = M().lagrangeInterpolation(state.nodes);
        root.querySelector("[data-interp-error]").textContent = "";
      } catch (error) {
        root.querySelector("[data-interp-error]").textContent = error.message.includes("distinct") ? "横坐标必须互不相同。" : "请输入合法有理数。";
        return;
      }
      root.querySelector("[data-interp-poly]").innerHTML = tex(M().formatPolyTex(result.polynomial));
      root.querySelector("[data-bases]").innerHTML = result.bases.map((b, i) => `<div class="ch1-compare-card"><strong>${tex(`L_${i}(x)=${M().formatPolyTex(b.L)}`)}</strong><p>加权贡献：${tex(M().formatPolyTex(b.contribution))}</p></div>`).join("");
      M().drawPolynomial(root.querySelector("[data-canvas]"), result.polynomial, { bounds, points: state.nodes.map((n) => ({ x: M().rToNum(n.x), y: M().rToNum(n.y) })), caption: "拉格朗日插值 · 节点横坐标互异" });
    }
    function paint() { if (state.mode === "eval") paintEval(); else if (state.mode === "roots") paintRoots(); else paintInterpolation(); }
    root.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => { state.mode = button.dataset.mode; selectButtons(root, "[data-mode]", button); paint(); }));
    root.querySelector("[data-a]").addEventListener("input", (e) => { state.a = Number(e.target.value); paintEval(); });
    root.querySelector("[data-degree]").addEventListener("input", (e) => { state.degree = Math.round(Number(e.target.value)); paintRoots(); });
    root.querySelector("[data-root-count]").addEventListener("input", (e) => { state.roots = Math.round(Number(e.target.value)); paintRoots(); });
    root.querySelectorAll("[data-node-x], [data-node-y]").forEach((input) => input.addEventListener("change", paintInterpolation));
    root.querySelectorAll("[data-eval-preset]").forEach((button) => button.addEventListener("click", () => { state.p = button.dataset.evalPreset === "root" ? M().poly([-2, 1, 1]) : M().poly([1, -2, 0, 1]); paintEval(); }));
    const countInput = root.querySelector("[data-root-count]");
    const degreeInput = root.querySelector("[data-degree]");
    const gate = window.LAPredictGate?.mount(root.querySelector("[data-root-gate]"), {
      root,
      manual: true,
      key: "visuals/ch1/section5-8-presentation.js#root-bound",
      question: `次数 ${tex("n=3")}。要让多项式有 4 个不同的根，还能找到一个次数不超过 3 的非零多项式吗？`,
      options: [
        ["不能：在 4 个点都为 0 的，只有零多项式", true, ""],
        ["能：把系数取得合适就行", false, "每个根 a 都给出一个因式 x−a。4 个不同的一次因式乘起来，次数已经是 4。"],
        ["能：取重根就可以", false, "重根让不同的根更少，不会更多。"],
        ["能，但要用复系数", false, "在复数域中同样至多 3 个根：上界只依赖次数。"],
      ],
      right: `✓ 每个根贡献一个一次因式，${tex("n")} 次多项式至多容纳 ${tex("n")} 个，所以至多有 ${tex("n")} 个根。反过来，次数不超过 ${tex("n")} 的多项式若有 ${tex("n+1")} 个根，它就是零多项式；这正是“函数相等就是多项式相等”的理由。`,
      onPick: () => {
        countInput.disabled = false;
        degreeInput.disabled = false;
        root.querySelector('[data-mode="roots"]')?.click();
      },
    });
    // m and n stay fixed until a prediction exists (either one could reach m > n)
    countInput.disabled = true;
    degreeInput.disabled = true;
    M().observeCanvas(root.querySelector(".ch1-stage"), paint);
    paint();
  }

  function interactive7(el, section) {
    lab(el, "求值、根数与插值", section.interactive.description,
      `<button type="button" data-mode="roots" class="is-active">根数上界</button><button type="button" data-mode="eval">求值 / 综合除法</button><button type="button" data-mode="interp">拉格朗日插值</button>`,
      `<div class="ch1-two-col"><div class="ch1-stage"><canvas data-canvas aria-label="多项式函数实验图"></canvas></div><div class="ch1-panel"><section data-eval-panel><div class="ch1-controls"><button type="button" data-eval-preset="default">三次示例</button><button type="button" data-eval-preset="root">有整数根示例</button></div><label class="ch1-slider-row"><span>${tex("a")}</span><input data-a type="range" min="-2" max="3" step="1" value="1"><output data-a-value></output></label><div class="ch1-equation-grid"><div><span>${tex("f")}</span><strong data-eval-poly></strong></div><div><span>${tex("f(a)")}</span><strong data-fa></strong></div></div><div data-factor class="ch1-status"></div><div class="ch1-ledger" data-horner></div></section><section data-root-panel hidden><label class="ch1-slider-row"><span>次数 ${tex("n")}</span><input data-degree type="range" min="1" max="6" value="3"><output data-degree-value></output></label><label class="ch1-slider-row"><span>不同根数 ${tex("m")}</span><input data-root-count type="range" min="1" max="7" value="2"><output data-roots-value></output></label><div data-root-status class="ch1-status"></div><div class="ch1-callout"><strong data-root-title>构造结果</strong><p data-root-poly></p></div></section><section data-interp-panel hidden><div class="ch1-node-grid">${[0,1,2].map((i) => `<label>节点 ${i}<span>${tex("x")}</span><input type="text" value="${i}" data-node-x="${i}"><span>${tex("y")}</span><input type="text" value="${[1,2,5][i]}" data-node-y="${i}"></label>`).join("")}</div><p class="ch1-error" data-interp-error aria-live="polite"></p><div class="ch1-result-band"><div><span>插值多项式</span><strong data-interp-poly></strong></div></div><div class="ch1-compare" data-bases></div></section></div></div>`);
    // the prediction sits above the mode buttons, right under the title
    const gateBox = document.createElement("div");
    gateBox.dataset.rootGate = "";
    el.querySelector(".ch1-controls")?.before(gateBox);
    mountPolynomialFunctions(el);
  }

  // §8 — draggable complex roots
  function mountConjugate(root) {
    const state = { mode: "R", alpha: { re: 1, im: 1.5 }, beta: { re: -1, im: 0.75 }, dragging: null };
    const bounds = { xMin: -3, xMax: 3, yMin: -3, yMax: 3 };
    let cam = null;
    const formatComplex = (z) => `${z.re.toFixed(2)}${z.im < 0 ? "−" : "+"}${Math.abs(z.im).toFixed(2)}i`;
    function coefficients() {
      const b = state.mode === "R" ? { re: state.alpha.re, im: -state.alpha.im } : state.beta;
      const sum = { re: state.alpha.re + b.re, im: state.alpha.im + b.im };
      const product = { re: state.alpha.re * b.re - state.alpha.im * b.im, im: state.alpha.re * b.im + state.alpha.im * b.re };
      return { beta: b, sum, product };
    }
    function paint() {
      const c = coefficients();
      cam = M().drawComplexPlane(root.querySelector("canvas"), [
        { ...state.alpha, label: "α", color: M().getPalette().drag },
        { ...c.beta, label: state.mode === "R" ? "ᾱ" : "β", color: M().getPalette().accent },
      ], { bounds });
      root.querySelector("[data-alpha]").textContent = formatComplex(state.alpha);
      root.querySelector("[data-beta]").textContent = formatComplex(c.beta);
      root.querySelector("[data-sum]").textContent = `${c.sum.re.toFixed(2)}${c.sum.im < 0 ? "−" : "+"}${Math.abs(c.sum.im).toFixed(2)}i`;
      root.querySelector("[data-product]").textContent = `${c.product.re.toFixed(2)}${c.product.im < 0 ? "−" : "+"}${Math.abs(c.product.im).toFixed(2)}i`;
      root.querySelector("[data-factor]").innerHTML = state.mode === "R" ? tex(`x^2-${(2 * state.alpha.re).toFixed(2)}x+${(state.alpha.re ** 2 + state.alpha.im ** 2).toFixed(2)}`) : tex(`(x-(${formatComplex(state.alpha)}))(x-(${formatComplex(c.beta)}))`);
      const real = Math.abs(c.sum.im) < 1e-9 && Math.abs(c.product.im) < 1e-9;
      const st = root.querySelector("[data-real-status]"); st.className = `ch1-status ${real ? "is-ok" : "is-bad"}`; st.textContent = real ? "二次系数全部为实数" : "解锁后系数出现虚部";
      root.querySelector("[data-beta-controls]").hidden = state.mode === "R";
      root.querySelector("[data-re]").value = state.alpha.re; root.querySelector("[data-im]").value = state.alpha.im;
      root.querySelector("[data-bre]").value = state.beta.re; root.querySelector("[data-bim]").value = state.beta.im;
      root.querySelector("[data-re-value]").textContent = state.alpha.re.toFixed(2); root.querySelector("[data-im-value]").textContent = state.alpha.im.toFixed(2);
      root.querySelector("[data-bre-value]").textContent = state.beta.re.toFixed(2); root.querySelector("[data-bim-value]").textContent = state.beta.im.toFixed(2);
    }
    const canvas = root.querySelector("canvas");
    function pointFromEvent(event) {
      const rect = canvas.getBoundingClientRect();
      return cam.toWorld(event.clientX - rect.left, event.clientY - rect.top);
    }
    canvas.addEventListener("pointerdown", (event) => {
      const point = pointFromEvent(event);
      const c = coefficients();
      const da = Math.hypot(point.x - state.alpha.re, point.y - state.alpha.im);
      const db = Math.hypot(point.x - c.beta.re, point.y - c.beta.im);
      state.dragging = da <= db ? "alpha" : state.mode === "C" ? "beta" : "alpha";
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!state.dragging) return;
      const point = pointFromEvent(event);
      const target = state.dragging === "alpha" ? state.alpha : state.beta;
      target.re = Math.max(-2.5, Math.min(2.5, Math.round(point.x * 20) / 20));
      target.im = Math.max(-2.5, Math.min(2.5, Math.round(point.y * 20) / 20));
      paint();
    });
    canvas.addEventListener("pointerup", () => { state.dragging = null; });
    root.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => { state.mode = button.dataset.mode; selectButtons(root, "[data-mode]", button); paint(); }));
    [["re", "alpha", "re"], ["im", "alpha", "im"], ["bre", "beta", "re"], ["bim", "beta", "im"]].forEach(([key, object, prop]) => root.querySelector(`[data-${key}]`).addEventListener("input", (e) => { state[object][prop] = Number(e.target.value); paint(); }));
    root.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => {
      if (button.dataset.preset === "real") state.alpha = { re: 1, im: 0 };
      else if (button.dataset.preset === "imag") state.alpha = { re: 0, im: 2 };
      else state.alpha = { re: 1, im: 1.5 };
      paint();
    }));
    M().observeCanvas(root.querySelector(".ch1-stage"), paint);
    paint();
  }

  function interactive8(el, section) {
    lab(el, "共轭锁复平面", section.interactive.description,
      `<button type="button" data-mode="R" class="is-active">实系数模式（共轭锁）</button><button type="button" data-mode="C">复系数模式（解锁）</button><span class="ch1-control-separator"></span><button type="button" data-preset="pair">一般共轭对</button><button type="button" data-preset="imag">纯虚根</button><button type="button" data-preset="real">虚部为 0</button>`,
      `<div class="ch1-two-col"><div><div class="ch1-stage ch1-draggable"><canvas aria-label="可拖动复根平面"></canvas><span class="ch1-canvas-hint">拖动 α；解锁后可拖动 β</span></div></div><div class="ch1-panel"><label class="ch1-slider-row"><span>Re(α)</span><input data-re type="range" min="-2.5" max="2.5" step="0.05"><output data-re-value></output></label><label class="ch1-slider-row"><span>Im(α)</span><input data-im type="range" min="-2.5" max="2.5" step="0.05"><output data-im-value></output></label><div data-beta-controls hidden><label class="ch1-slider-row"><span>Re(β)</span><input data-bre type="range" min="-2.5" max="2.5" step="0.05"><output data-bre-value></output></label><label class="ch1-slider-row"><span>Im(β)</span><input data-bim type="range" min="-2.5" max="2.5" step="0.05"><output data-bim-value></output></label></div><div class="ch1-equation-grid"><div><span>α</span><strong data-alpha></strong></div><div><span>第二个根</span><strong data-beta></strong></div><div><span>根之和</span><strong data-sum></strong></div><div><span>根之积</span><strong data-product></strong></div></div><div data-real-status class="ch1-status"></div><div class="ch1-result-band"><div><span>对应因式</span><strong data-factor></strong></div></div></div></div>`);
    mountConjugate(el);
  }

  window.defineChapter1Renderer("factorization-theorem", { formal: renderFormal });
  window.defineChapter1Renderer("multiple-factors", { formal: renderFormal, interactive: interactive6 });
  window.defineChapter1Renderer("polynomial-functions", { formal: renderFormal, interactive: interactive7 });
  window.defineChapter1Renderer("complex-real-factorization", { formal: renderFormal, interactive: interactive8 });
})();
