/*
 * Chapter 7 lab kit.
 *
 * Shared pieces for the linear-transformation labs: the lab shell, chips, a
 * prediction gate that only reveals the conclusion after the student has
 * predicted *and* acted, a small 2D canvas plane (grids, oblique grids,
 * arrows, draggable handles) that matches the shared 3D scene's look, exact
 * rational matrix helpers built on Ch3Math, and the theorem-block renderer.
 */
(() => {
  const M = () => window.Ch3Math;
  const tex = (s) => (window.texInline ? window.texInline(s) : s);
  const texD = (s) => (window.texDisplay ? window.texDisplay(s) : s);
  const F = (x) => M().parseF(x);
  const num = (x) => M().toNumber(x);
  const lf = (x) => M().latexF(x);

  /* ---------- exact linear algebra (rationals) ---------- */

  const mat = (rows) => rows.map((r) => r.map(F));
  const vec = (v) => v.map(F);
  const zero = () => F(0);
  const one = () => F(1);

  function mul(A, B) {
    return A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => M().add(s, M().mul(a, B[k][j])), zero())));
  }

  function identity(n) {
    return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => F(i === j ? 1 : 0)));
  }

  function sub(A, B) {
    return A.map((r, i) => r.map((x, j) => M().sub(x, B[i][j])));
  }

  function scaleMat(A, k) {
    return A.map((r) => r.map((x) => M().mul(x, F(k))));
  }

  function inv(A) {
    const n = A.length;
    const aug = A.map((r, i) => [...r.map(F), ...identity(n)[i]]);
    const { matrix, pivots } = M().rref(aug, n);
    if (pivots.length < n) return null;
    return matrix.map((r) => r.slice(n));
  }

  function transpose(A) {
    return A[0].map((_, j) => A.map((r) => r[j]));
  }

  const det = (A) => M().determinant(A);
  const rank = (A) => (A.length && A[0].length ? M().rankOf(A) : 0);
  const matVec = (A, v) => M().matVec(A, v);
  const isZeroVec = (v) => v.every((x) => M().isZero(x));
  const eqMat = (A, B) => A.every((r, i) => r.every((x, j) => M().eq(x, B[i][j])));
  const isDiagonal = (A) => A.every((r, i) => r.every((x, j) => i === j || M().isZero(x)));

  function dotF(u, v) {
    return u.reduce((s, x, i) => M().add(s, M().mul(x, v[i])), zero());
  }

  function cross3(a, b) {
    const m = M();
    return [
      m.sub(m.mul(a[1], b[2]), m.mul(a[2], b[1])),
      m.sub(m.mul(a[2], b[0]), m.mul(a[0], b[2])),
      m.sub(m.mul(a[0], b[1]), m.mul(a[1], b[0])),
    ];
  }

  /* Rank of a list of vectors (as columns). */
  function rankOfVectors(vectors) {
    if (!vectors.length) return 0;
    return rank(vectors[0].map((_, i) => vectors.map((v) => v[i])));
  }

  /* Coefficients c with target = sum c_i vectors_i, or null if target is outside the span. */
  function coordinatesIn(vectors, target) {
    const n = target.length;
    const aug = Array.from({ length: n }, (_, i) => [...vectors.map((v) => v[i]), target[i]]);
    const sol = M().particularSolution(aug);
    return sol.ok ? sol.x : null;
  }

  /* Basis of the null space of a matrix with rational entries. */
  const nullspace = (A) => M().nullspaceBasis(A).basis;

  function latexMatrix(A) {
    return M().latexMatrix(A);
  }

  function latexVec(v) {
    return `(${v.map(lf).join(",")})^{T}`;
  }

  function latexRow(v) {
    return `(${v.map(lf).join(",")})`;
  }

  /* ---------- polynomials with rational coefficients, low degree first ---------- */

  function polyLatex(coeffs, x = "\\lambda") {
    const terms = [];
    for (let k = coeffs.length - 1; k >= 0; k -= 1) {
      const c = coeffs[k];
      if (M().isZero(c)) continue;
      const neg = c.n < 0;
      const abs = M().absF(c);
      const isOne = abs.n === 1 && abs.d === 1;
      const mono = k === 0 ? "" : k === 1 ? x : `${x}^{${k}}`;
      const body = k === 0 ? lf(abs) : isOne ? mono : `${lf(abs)}${mono}`;
      terms.push({ neg, body });
    }
    if (!terms.length) return "0";
    return terms.map((t, i) => (i === 0 ? (t.neg ? "-" : "") + t.body : (t.neg ? "-" : "+") + t.body)).join("");
  }

  function polyEval(coeffs, r) {
    return coeffs.reduceRight((s, c) => M().add(M().mul(s, r), c), zero());
  }

  function polyDivLinear(coeffs, r) {
    // divide by (x - r); returns quotient (low degree first)
    const n = coeffs.length - 1;
    const q = new Array(n);
    let carry = zero();
    for (let k = n; k >= 1; k -= 1) {
      carry = M().add(coeffs[k], M().mul(carry, r));
      q[k - 1] = carry;
    }
    return q;
  }

  /* Factor a monic polynomial with integer roots where possible: "(\lambda-2)^2(\lambda-1)". */
  function polyFactorLatex(coeffs, x = "\\lambda") {
    let rest = coeffs.slice();
    const roots = [];
    const candidates = [];
    for (let r = -12; r <= 12; r += 1) candidates.push(F(r));
    let progress = true;
    while (rest.length > 1 && progress) {
      progress = false;
      for (const r of candidates) {
        if (rest.length > 1 && M().isZero(polyEval(rest, r))) {
          roots.push(r);
          rest = polyDivLinear(rest, r);
          progress = true;
          break;
        }
      }
    }
    const counts = new Map();
    roots.forEach((r) => counts.set(lf(r), { r, k: (counts.get(lf(r))?.k || 0) + 1 }));
    const parts = [...counts.values()]
      .sort((a, b) => num(a.r) - num(b.r))
      .map(({ r, k }) => {
        const base = M().isZero(r) ? x : `(${x}${r.n < 0 ? "+" : "-"}${lf(M().absF(r))})`;
        return k > 1 ? `${base}^{${k}}` : base;
      });
    if (rest.length > 1) parts.push(`(${polyLatex(rest, x)})`);
    return parts.join("") || polyLatex(coeffs, x);
  }

  /*
   * Minimal polynomial of a square matrix: first k with A^k in span(I, ..., A^{k-1}).
   * Returns monic coefficients, low degree first.
   */
  function minimalPolynomial(A) {
    const n = A.length;
    const powers = [identity(n)];
    for (let k = 1; k <= n; k += 1) {
      powers.push(mul(powers[k - 1], A));
      const flat = powers.slice(0, k).map((P) => P.flat());
      const c = coordinatesIn(flat, powers[k].flat());
      if (c) return [...c.map(M().neg), one()];
    }
    return null;
  }

  /* Characteristic polynomial |lambda E - A| for n <= 3, monic, low degree first. */
  function charPolynomial(A) {
    const n = A.length;
    const m = M();
    if (n === 2) {
      const tr = m.add(A[0][0], A[1][1]);
      return [det(A), m.neg(tr), one()];
    }
    if (n === 3) {
      const tr = m.add(m.add(A[0][0], A[1][1]), A[2][2]);
      const minor = (i, j) => m.sub(m.mul(A[i][i], A[j][j]), m.mul(A[i][j], A[j][i]));
      const c1 = m.add(m.add(minor(0, 1), minor(0, 2)), minor(1, 2));
      return [m.neg(det(A)), c1, m.neg(tr), one()];
    }
    throw new RangeError("charPolynomial supports n = 2, 3");
  }

  /*
   * Highlight part of a formula in a lab readout: same colour role + soft glow.
   * KaTeX (trust off) only accepts literal colours, so hlTex marks the box with
   * sentinel colours and hlHtml swaps them for theme variables after rendering.
   */
  const HL_BOX = "#0a0b0c";
  const HL_INK = "#0a0b0d";
  const hlTex = (x) => `\\colorbox{${HL_BOX}}{$\\textcolor{${HL_INK}}{${x}}$}`;
  function hlHtml(html, role = "subspace") {
    const v = `var(--cv-${role})`;
    return String(html)
      .split(`background-color:${HL_BOX}`)
      .join(`background-color:color-mix(in srgb, ${v} 18%, transparent);box-shadow:0 0 0 3px color-mix(in srgb, ${v} 14%, transparent);border-radius:3px`)
      .split(`color:${HL_INK}`)
      .join(`color:${v};font-weight:700`);
  }

  /* ---------- DOM helpers ---------- */

  function el(tag, cls, html) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function chips(host, items, onPick, activeKey) {
    host.innerHTML = items
      .map(([key, label]) => `<button type="button" class="ch7l-chip${key === activeKey ? " is-active" : ""}" data-key="${key}">${label}</button>`)
      .join("");
    host.querySelectorAll("button").forEach((b) =>
      b.addEventListener("click", () => {
        host.querySelectorAll("button").forEach((x) => x.classList.toggle("is-active", x === b));
        onPick(b.dataset.key);
      }),
    );
  }

  function labShell(root, { title, task }) {
    root.innerHTML = `<h2>交互实验</h2>`;
    const lab = el("section", "ch7l-lab");
    lab.innerHTML = `<header class="ch7l-head"><h3>${title}</h3><p>${task}</p></header>`;
    root.append(lab);
    return lab;
  }

  /*
   * Predict -> act -> reveal.
   * The gate records the prediction; the conclusion opens only after the student
   * has predicted and then acted on the picture at least once.
   * Labs rebuild the gate when the student switches preset. The guess is kept per
   * question (by option text) for the life of the gate host, so switching away and
   * back never drops it; a question that was already revealed stays revealed.
   */
  const guessMemory = new WeakMap();

  function predictFlow(gateHost, resultBox, spec) {
    spec = { ...spec, options: window.LAStableShuffle ? window.LAStableShuffle(spec.options, spec.question) : spec.options };
    gateHost.innerHTML = "";
    resultBox.hidden = true;
    resultBox.innerHTML = "";
    const box = el("div", "ch7l-predict");
    box.innerHTML = `<div class="ch7l-predict-q"><span>先猜一猜</span><p>${spec.question}</p></div>
      <div class="ch7l-predict-options">${spec.options.map((o, i) => `<button type="button" data-i="${i}" data-ok="${o.correct ? "true" : "false"}" data-why="${String(o.why || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;")}">${o.text}</button>`).join("")}</div>
      <p class="ch7l-predict-feedback" hidden></p>`;
    gateHost.append(box);
    const feedback = box.querySelector(".ch7l-predict-feedback");
    const state = { choice: null, acted: false, revealed: false };
    if (!guessMemory.has(gateHost)) guessMemory.set(gateHost, new Map());
    const memory = guessMemory.get(gateHost);

    function reveal(deferHook = false) {
      if (state.revealed || state.choice == null || !state.acted) return;
      state.revealed = true;
      const saved = memory.get(spec.question);
      if (saved) saved.revealed = true;
      const o = spec.options[state.choice];
      const verdict = o.correct
        ? `<span class="ch7l-ok">猜对了。</span>`
        : `<span class="ch7l-bad">再看看图。</span>${o.why ? ` ${o.why}` : ""}`;
      resultBox.innerHTML = `<strong>结论</strong><p>${verdict}</p><p>${spec.conclusion}</p>`;
      resultBox.hidden = false;
      // the “act now” hint has done its job: the box now shows the verdict instead
      feedback.innerHTML = o.correct ? `<span class="ch7l-ok">✓ 猜对了，结论见下方。</span>` : `<span class="ch7l-bad">× 再看看图，结论见下方。</span>`;
      box.classList.add("is-done");
      // a restored reveal runs while the lab is still assigning the new flow: call back afterwards
      if (deferHook) queueMicrotask(() => spec.onReveal?.());
      else spec.onReveal?.();
    }

    function pick(i, unsure = false) {
      state.choice = i;
      box.querySelectorAll("[data-i]").forEach((x) => x.classList.toggle("is-picked", !unsure && Number(x.dataset.i) === i));
      feedback.hidden = false;
      feedback.textContent = unsure ? "好，先不猜。动手操作一次，答案随后出现。" : spec.actHint || "记下了你的猜测。现在动手操作，结论随后出现。";
    }

    box.querySelectorAll("[data-i]").forEach((b) =>
      b.addEventListener("click", (event) => {
        if (state.revealed) return;
        pick(Number(b.dataset.i));
        // “不确定，直接看” (predict-ux.js) registers the right option with a synthetic click
        const unsure = !event.isTrusted && box.dataset.unsure === "1";
        memory.set(spec.question, { text: spec.options[state.choice].text, unsure, revealed: false });
        reveal();
      }),
    );

    const saved = memory.get(spec.question);
    const savedIndex = saved ? spec.options.findIndex((o) => o.text === saved.text) : -1;
    if (savedIndex >= 0) {
      pick(savedIndex, saved.unsure);
      if (saved.unsure) {
        box.dataset.unsure = "1";
        // predict-ux.js adds its “不确定” button on the next frame; mark it as the pick
        requestAnimationFrame(() => requestAnimationFrame(() => box.querySelector(".la-unsure")?.classList.add("is-picked")));
      }
      if (saved.revealed) {
        state.acted = true;
        reveal(true);
      }
    }

    return {
      acted() {
        if (state.choice == null) return;
        state.acted = true;
        reveal();
      },
      get revealed() {
        return state.revealed;
      },
      get predicted() {
        return state.choice != null;
      },
      element: box,
    };
  }

  /* ---------- 2D canvas plane ---------- */

  function cssColor(style, name, fallback) {
    const value = style.getPropertyValue(name).trim();
    return value || fallback;
  }

  function palette(host) {
    const style = getComputedStyle(host);
    const dark = document.body.classList.contains("dark");
    return {
      dark,
      text: cssColor(style, "--text", "#18212c"),
      muted: cssColor(style, "--muted", "#66717f"),
      faint: cssColor(style, "--faint", "#8b96a5"),
      line: cssColor(style, "--line-strong", "rgba(28,43,61,.2)"),
      accent: cssColor(style, "--accent", "#0f8f88"),
      coral: cssColor(style, "--coral", "#d46b4f"),
      blue: cssColor(style, "--blue", "#335eea"),
      gold: cssColor(style, "--gold", "#b78a1b"),
      violet: cssColor(style, "--violet", "#7258ca"),
      // colour roles (tokens.css): labs should prefer these to hue names
      v1: cssColor(style, "--cv-v1", "#2a64a8"),
      v2: cssColor(style, "--cv-v2", "#c4552f"),
      drag: cssColor(style, "--cv-drag", "#a87a12"),
      image: cssColor(style, "--cv-image", "#8c4f86"),
      subspace: cssColor(style, "--cv-subspace", "#2c5e4a"),
      axis: cssColor(style, "--cv-axis", "#8a8d84"),
      gridMajor: cssColor(style, "--cv-grid-major", "#e2ddd0"),
      grid: cssColor(style, "--cv-grid", "#f0ece2"),
    };
  }

  function withAlpha(color, alpha) {
    if (color.startsWith("#")) {
      const hex = color.length === 4 ? color.replace(/#(.)(.)(.)/, "#$1$1$2$2$3$3") : color;
      const n = parseInt(hex.slice(1, 7), 16);
      return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
    }
    const m = color.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const [r, g, b] = m[1].split(",").map((x) => parseFloat(x));
      return `rgba(${r},${g},${b},${alpha})`;
    }
    return color;
  }

  /*
   * plane2d(host, { extent, label, hint, spreadLabels })
   *   spreadLabels   opt-in: labels are placed after the drawing, off other labels,
   *                  drag handles and arrow shafts, and inside the canvas
   *   setDraw(fn)    fn(d) is called on every render with a drawing API d
   *   setHandles([{ get, set, snap, color, hidden }])
   *   on("change", fn) / on("end", fn)
   */
  function plane2d(host, options = {}) {
    let extent = options.extent || 3;
    let drawFn = () => {};
    let handles = [];
    let hover = null;
    let drag = null;
    let destroyed = false;
    const listeners = { change: [], end: [] };

    const wrap = el("div", "ch7p");
    const canvas = el("canvas", "ch7p-canvas");
    canvas.tabIndex = 0;
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", options.label || "平面上的向量图");
    wrap.append(canvas);
    if (options.hint !== "") {
      const hint = el("div", "ch7p-hint");
      hint.textContent = options.hint || "拖动圆点";
      wrap.append(hint);
    }
    if (options.title) {
      const title = el("div", "ch7p-title", options.title);
      wrap.append(title);
    }
    host.append(wrap);
    const ctx = canvas.getContext("2d");
    let size = { w: 0, h: 0, dpr: 1 };
    let axisNameBoxes = [];
    // with spreadLabels: labels wait until the drawing is done, arrows leave their shafts
    let pendingLabels = [];
    let shafts = [];
    let arrowCount = 0;

    const scale = () => Math.min(size.w, size.h) / (2 * extent);
    const P = ([x, y]) => [size.w / 2 + x * scale(), size.h / 2 - y * scale()];
    const W = ([px, py]) => [(px - size.w / 2) / scale(), (size.h / 2 - py) / scale()];
    const halfW = () => size.w / 2 / scale();
    const halfH = () => size.h / 2 / scale();

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      if (w === size.w && h === size.h && dpr === size.dpr) return;
      size = { w, h, dpr };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      render();
    }

    function api(pal) {
      const res = (c) => (c ? pal[c] || c : pal.accent);
      const d = {
        ctx,
        pal,
        P,
        W,
        scale: scale(),
        extent,
        halfW: halfW(),
        halfH: halfH(),
        color: res,
        alpha: withAlpha,
        grid(basis = [[1, 0], [0, 1]], opts = {}) {
          const [b1, b2] = basis;
          const detB = b1[0] * b2[1] - b1[1] * b2[0];
          if (Math.abs(detB) < 1e-9) return;
          const toCoord = ([x, y]) => [(x * b2[1] - y * b2[0]) / detB, (b1[0] * y - b1[1] * x) / detB];
          const hw = halfW();
          const hh = halfH();
          const corners = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(toCoord);
          const lo = [0, 1].map((i) => Math.floor(Math.min(...corners.map((c) => c[i]))));
          const hi = [0, 1].map((i) => Math.ceil(Math.max(...corners.map((c) => c[i]))));
          const step = opts.step || 1;
          ctx.save();
          ctx.strokeStyle = withAlpha(res(opts.color || "line"), opts.alpha ?? 1);
          ctx.lineWidth = opts.width || 1;
          let count = 0;
          for (let k = lo[0]; k <= hi[0] && count < 120; k += step, count += 1) {
            const a = P([k * b1[0] + lo[1] * b2[0], k * b1[1] + lo[1] * b2[1]]);
            const b = P([k * b1[0] + hi[1] * b2[0], k * b1[1] + hi[1] * b2[1]]);
            ctx.beginPath();
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(b[0], b[1]);
            ctx.stroke();
          }
          for (let k = lo[1]; k <= hi[1] && count < 240; k += step, count += 1) {
            const a = P([lo[0] * b1[0] + k * b2[0], lo[0] * b1[1] + k * b2[1]]);
            const b = P([hi[0] * b1[0] + k * b2[0], hi[0] * b1[1] + k * b2[1]]);
            ctx.beginPath();
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(b[0], b[1]);
            ctx.stroke();
          }
          ctx.restore();
        },
        axes(names = ["x₁", "x₂"]) {
          ctx.save();
          ctx.strokeStyle = withAlpha(pal.muted, 0.6);
          ctx.lineWidth = 1.1;
          const [l, r] = [P([-halfW(), 0]), P([halfW(), 0])];
          const [b, t] = [P([0, -halfH()]), P([0, halfH()])];
          ctx.beginPath();
          ctx.moveTo(l[0], l[1]);
          ctx.lineTo(r[0], r[1]);
          ctx.moveTo(b[0], b[1]);
          ctx.lineTo(t[0], t[1]);
          ctx.stroke();
          // light integer ticks (6px); numbers only on the positive half, up to 3
          ctx.strokeStyle = pal.axis || withAlpha(pal.muted, 0.6);
          ctx.fillStyle = pal.faint;
          ctx.font = "11px 'LA Serif Latin', 'LA Serif SC', serif";
          ctx.lineWidth = 1;
          const kx = Math.floor(halfW() - 0.15);
          const ky = Math.floor(halfH() - 0.15);
          ctx.beginPath();
          for (let k = -kx; k <= kx; k += 1) {
            if (!k) continue;
            const [x, y] = P([k, 0]);
            ctx.moveTo(x, y - 3);
            ctx.lineTo(x, y + 3);
          }
          for (let k = -ky; k <= ky; k += 1) {
            if (!k) continue;
            const [x, y] = P([0, k]);
            ctx.moveTo(x - 3, y);
            ctx.lineTo(x + 3, y);
          }
          ctx.stroke();
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          for (let k = 1; k <= Math.min(3, kx - 1); k += 1) {
            const [x, y] = P([k, 0]);
            ctx.fillText(String(k), x, y + 6);
          }
          ctx.textAlign = "right";
          ctx.textBaseline = "middle";
          for (let k = 1; k <= Math.min(3, ky - 1); k += 1) {
            const [x, y] = P([0, k]);
            ctx.fillText(String(k), x - 6, y);
          }
          ctx.restore();
          if (names) {
            d.text([halfW() * 0.93, 0], names[0], "muted", { dy: -10, font: "600 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif", isAxisName: true });
            d.text([0, halfH() * 0.92], names[1], "muted", { dx: 8, font: "600 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif", isAxisName: true });
          }
        },
        line(p, dir, color, opts = {}) {
          const len = Math.hypot(dir[0], dir[1]);
          if (len < 1e-12) return;
          const u = [dir[0] / len, dir[1] / len];
          const R = Math.hypot(halfW(), halfH()) + Math.hypot(p[0], p[1]);
          d.segment([p[0] - u[0] * R, p[1] - u[1] * R], [p[0] + u[0] * R, p[1] + u[1] * R], color, opts);
        },
        segment(a, b, color, opts = {}) {
          const A = P(a);
          const B = P(b);
          ctx.save();
          ctx.globalAlpha = opts.alpha ?? 1;
          ctx.strokeStyle = res(color);
          ctx.lineWidth = opts.width || 1.6;
          ctx.lineCap = "round";
          if (opts.dash) ctx.setLineDash(opts.dash);
          ctx.beginPath();
          ctx.moveTo(A[0], A[1]);
          ctx.lineTo(B[0], B[1]);
          ctx.stroke();
          ctx.restore();
        },
        arrow(from, to, color, opts = {}) {
          const A = P(from);
          const B = P(to);
          const len = Math.hypot(B[0] - A[0], B[1] - A[1]);
          if (len < 0.5) return;
          const c = res(color);
          const ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
          const head = Math.min(13, len * 0.45);
          const end = [B[0] - Math.cos(ang) * head * 0.8, B[1] - Math.sin(ang) * head * 0.8];
          ctx.save();
          ctx.globalAlpha = opts.alpha ?? 1;
          ctx.strokeStyle = c;
          ctx.fillStyle = c;
          ctx.lineWidth = opts.width || 2.8;
          ctx.lineCap = "round";
          if (opts.dash) ctx.setLineDash(opts.dash);
          ctx.beginPath();
          ctx.moveTo(A[0], A[1]);
          ctx.lineTo(end[0], end[1]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(B[0], B[1]);
          ctx.lineTo(B[0] - Math.cos(ang - 0.42) * head, B[1] - Math.sin(ang - 0.42) * head);
          ctx.lineTo(B[0] - Math.cos(ang + 0.42) * head, B[1] - Math.sin(ang + 0.42) * head);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          arrowCount += 1;
          const owner = arrowCount;
          if (options.spreadLabels) shafts.push({ a: A, b: B, owner });
          if (opts.label) {
            const ux = Math.cos(ang);
            const uy = Math.sin(ang);
            d.text(to, opts.label, color, { dx: ux * 16 + (opts.ldx || 0), dy: uy * 16 + (opts.ldy || 0), font: "700 14px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif", align: "center", owner });
          }
        },
        point(p, color, opts = {}) {
          const [x, y] = P(p);
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, opts.r || 4.5, 0, Math.PI * 2);
          if (opts.hollow) {
            ctx.fillStyle = pal.dark ? "#161b27" : "#fff";
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = res(color);
            ctx.stroke();
          } else {
            ctx.globalAlpha = opts.alpha ?? 1;
            ctx.fillStyle = res(color);
            ctx.fill();
          }
          ctx.restore();
          if (opts.label) d.text(p, opts.label, color, { dx: 9, dy: -9 });
        },
        polyline(pts, color, opts = {}) {
          if (pts.length < 2) return;
          ctx.save();
          ctx.globalAlpha = opts.alpha ?? 1;
          ctx.strokeStyle = res(color);
          ctx.lineWidth = opts.width || 1.6;
          ctx.lineJoin = "round";
          if (opts.dash) ctx.setLineDash(opts.dash);
          ctx.beginPath();
          pts.forEach((p, i) => {
            const [x, y] = P(p);
            if (i) ctx.lineTo(x, y);
            else ctx.moveTo(x, y);
          });
          if (opts.close) ctx.closePath();
          if (opts.fill) {
            ctx.fillStyle = withAlpha(res(opts.fill), opts.fillAlpha ?? 0.12);
            ctx.fill();
          }
          ctx.stroke();
          ctx.restore();
        },
        polygon(pts, color, opts = {}) {
          d.polyline(pts, color, { ...opts, close: true, fill: opts.fill || color });
        },
        arc(radiusPx, a0, a1, color, opts = {}) {
          const [cx, cy] = P([0, 0]);
          ctx.save();
          ctx.strokeStyle = res(color);
          ctx.lineWidth = opts.width || 2;
          ctx.beginPath();
          ctx.arc(cx, cy, radiusPx, -a0, -a1, a1 > a0);
          ctx.stroke();
          ctx.restore();
        },
        text(p, str, color, opts = {}) {
          const [x, y] = P(p);
          ctx.save();
          ctx.font = opts.font || "600 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
          ctx.textAlign = opts.align || "left";
          ctx.textBaseline = "middle";
          let tx = x + (opts.dx ?? 0) + (opts.px ?? 0);
          let ty = y + (opts.dy ?? 0) - (opts.py ?? 0);
          /* keep every label inside the canvas, and off the axis names */
          const tw = ctx.measureText(str).width;
          const left = () => (ctx.textAlign === "center" ? tx - tw / 2 : ctx.textAlign === "right" ? tx - tw : tx);
          if (left() < 4) tx += 4 - left();
          if (left() + tw > size.w - 4) tx -= left() + tw - (size.w - 4);
          ty = Math.max(10, Math.min(size.h - 10, ty));
          if (options.spreadLabels && !opts.isAxisName) {
            pendingLabels.push({ str, x: left(), y: ty, w: tw, font: ctx.font, color: res(color), owner: opts.owner });
            ctx.restore();
            return;
          }
          if (!opts.isAxisName) {
            const hit = (r) => left() < r.x + r.w && left() + tw > r.x && Math.abs(ty - r.y) < 14;
            const r = axisNameBoxes.find(hit);
            if (r) ty = r.y + (ty <= r.y ? -16 : 16);
            ty = Math.max(10, Math.min(size.h - 10, ty));
          } else {
            axisNameBoxes.push({ x: left(), y: ty, w: tw });
          }
          ctx.lineWidth = 4;
          ctx.lineJoin = "round";
          ctx.strokeStyle = pal.dark ? "rgba(14,18,27,.85)" : "rgba(255,255,255,.9)";
          ctx.strokeText(str, tx, ty);
          ctx.fillStyle = res(color);
          ctx.fillText(str, tx, ty);
          ctx.restore();
        },
      };
      return d;
    }

    function render() {
      if (destroyed || !size.w) return;
      const pal = palette(host);
      ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
      ctx.clearRect(0, 0, size.w, size.h);
      axisNameBoxes = [];
      pendingLabels = [];
      shafts = [];
      arrowCount = 0;
      drawFn(api(pal));
      handles.forEach((h) => {
        if (h.hidden?.()) return;
        const [x, y] = P(h.get());
        const active = drag?.handle === h || hover === h;
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, active ? 9 : 7.5, 0, Math.PI * 2);
        ctx.fillStyle = pal.dark ? "#161b27" : "#fff";
        ctx.fill();
        ctx.lineWidth = active ? 3 : 2.4;
        ctx.strokeStyle = pal[h.color] || h.color || pal.accent;
        ctx.stroke();
        ctx.restore();
      });
      if (options.spreadLabels) placeLabels(pal);
    }

    /* Opt-in label placement: try a few offsets, keep off labels, handles and shafts. */
    function placeLabels(pal) {
      const gap = 5;
      // axis names keep a wider berth: a label right beside x₁ would read as one name
      const placed = axisNameBoxes.map((r) => ({ ...r, gap: 12 }));
      const knobs = handles.filter((h) => !h.hidden?.()).map((h) => P(h.get()));
      const meets = (a, b) => {
        const g = b.gap ?? gap;
        return a.x < b.x + b.w + g && a.x + a.w + g > b.x && Math.abs(a.y - b.y) < 15;
      };
      const onKnob = (r) =>
        knobs.some(([hx, hy]) => {
          const nx = Math.max(r.x, Math.min(r.x + r.w, hx));
          const ny = Math.max(r.y - 8, Math.min(r.y + 8, hy));
          return Math.hypot(nx - hx, ny - hy) < 12;
        });
      const onShaft = (r, owner) =>
        shafts.some((sh) => {
          if (sh.owner === owner) return false;
          const len = Math.hypot(sh.b[0] - sh.a[0], sh.b[1] - sh.a[1]);
          const n = Math.max(2, Math.ceil(len / 3));
          for (let i = 0; i <= n; i += 1) {
            const x = sh.a[0] + ((sh.b[0] - sh.a[0]) * i) / n;
            const y = sh.a[1] + ((sh.b[1] - sh.a[1]) * i) / n;
            if (x > r.x - 2 && x < r.x + r.w + 2 && y > r.y - 8 && y < r.y + 8) return true;
          }
          return false;
        });
      const inside = (r) => r.x >= 4 && r.x + r.w <= size.w - 4 && r.y >= 10 && r.y <= size.h - 10;
      pendingLabels.forEach((lab) => {
        const { w } = lab;
        const tries = [[0, 0], [0, -16], [0, 16], [w * 0.6, 0], [-w * 0.6, 0], [w * 0.6, -16], [-w * 0.6, -16], [w * 0.6, 16], [-w * 0.6, 16], [0, -30], [0, 30], [w + 8, 0], [-w - 8, 0]];
        const at = ([ox, oy]) => ({ x: lab.x + ox, y: lab.y + oy, w });
        const free = (r) => inside(r) && !placed.some((q) => meets(r, q)) && !onKnob(r);
        let best = tries.map(at).find((r) => free(r) && !onShaft(r, lab.owner)) || tries.map(at).find(free) || at([0, 0]);
        best = { ...best, x: Math.max(4, Math.min(size.w - 4 - w, best.x)), y: Math.max(10, Math.min(size.h - 10, best.y)) };
        placed.push(best);
        ctx.save();
        ctx.font = lab.font;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 4;
        ctx.lineJoin = "round";
        ctx.strokeStyle = pal.dark ? "rgba(14,18,27,.85)" : "rgba(255,255,255,.9)";
        ctx.strokeText(lab.str, best.x, best.y);
        ctx.fillStyle = lab.color;
        ctx.fillText(lab.str, best.x, best.y);
        ctx.restore();
      });
    }

    function localPoint(event) {
      const rect = canvas.getBoundingClientRect();
      return [event.clientX - rect.left, event.clientY - rect.top];
    }

    function pick(pt) {
      let best = null;
      let bestDist = 20;
      handles.forEach((h) => {
        if (h.hidden?.()) return;
        const [x, y] = P(h.get());
        const dist = Math.hypot(x - pt[0], y - pt[1]);
        if (dist < bestDist) {
          best = h;
          bestDist = dist;
        }
      });
      return best;
    }

    function moveTo(pt) {
      const h = drag.handle;
      let p = W(pt);
      const lim = h.limit ?? extent;
      p = p.map((x) => Math.max(-lim, Math.min(lim, x)));
      if (h.snap) p = p.map((x) => Math.round(x / h.snap) * h.snap);
      h.set(p);
      listeners.change.forEach((f) => f(h));
      render();
    }

    function onDown(event) {
      if (event.button !== undefined && event.button !== 0) return;
      const pt = localPoint(event);
      const h = pick(pt);
      if (!h) return;
      canvas.setPointerCapture?.(event.pointerId);
      drag = { handle: h };
      wrap.classList.add("is-dragging");
      moveTo(pt);
      event.preventDefault();
    }

    function onMove(event) {
      const pt = localPoint(event);
      if (!drag) {
        const h = pick(pt);
        if (h !== hover) {
          hover = h;
          canvas.style.cursor = h ? "grab" : "default";
          render();
        }
        return;
      }
      moveTo(pt);
    }

    function onUp() {
      if (drag) {
        const h = drag.handle;
        drag = null;
        wrap.classList.remove("is-dragging");
        h.end?.();
        listeners.end.forEach((f) => f(h));
        render();
      }
    }

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", () => {
      if (!drag && hover) {
        hover = null;
        render();
      }
    });
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const themeObserver = new MutationObserver(() => render());
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    // during a light/dark switch the colour tokens morph frame by frame: follow them
    const onThemeMix = () => { if (canvas.isConnected) render(); };
    window.addEventListener("la-thememix", onThemeMix);
    requestAnimationFrame(resize);

    return {
      canvas,
      element: wrap,
      render,
      project: P,
      unproject: W,
      setExtent(value) {
        extent = value;
        render();
      },
      setDraw(fn) {
        drawFn = fn;
        render();
      },
      setHandles(list) {
        handles = list || [];
        render();
      },
      on(event, fn) {
        listeners[event]?.push(fn);
      },
      destroy() {
        destroyed = true;
        ro.disconnect();
        themeObserver.disconnect();
        window.removeEventListener("la-thememix", onThemeMix);
        wrap.remove();
      },
    };
  }

  /* ---------- theorem blocks from content data ---------- */

  function renderFormal(root, section) {
    const f = section.lesson3d;
    if (!root || !f) return;
    const figure = (key) => {
      const make = window.Ch7Figures?.[key];
      return make ? `<figure class="ch7l-figure">${make()}</figure>` : "";
    };
    root.innerHTML = `<h2>定理与方法</h2><div class="ch7l-formal">${f.blocks
      .map(
        (b) => `<article class="ch7l-theorem"><h3>${b.title}</h3>${b.tex ? `<div class="ch7l-theorem-math">${texD(b.tex)}</div>` : ""}${b.figure ? figure(b.figure) : ""}${b.text ? `<p>${b.text}</p>` : ""}</article>`,
      )
      .join("")}${f.pitfalls?.length ? `<div class="ch7l-pitfalls"><h3>容易错在哪里</h3><ul>${f.pitfalls.map((p) => `<li>${p}</li>`).join("")}</ul></div>` : ""}</div>`;
  }

  /*
   * Register a section: the formal blocks always, and a lab when given.
   * The lab section is moved above the theorem blocks (picture first).
   */
  function register(id, lab) {
    window.defineChapter7Renderer?.(id, {
      formal: (root, section) => renderFormal(root, section),
      interactive: lab
        ? (root, section, page) => {
            if (!root) return undefined;
            const formal = page?.querySelector(`#${CSS.escape(section.id)}-formal`);
            if (formal && formal.compareDocumentPosition(root) & Node.DOCUMENT_POSITION_FOLLOWING) formal.before(root);
            return lab(root, section);
          }
        : undefined,
    });
  }

  window.Ch7Kit = Object.freeze({
    M,
    tex,
    texD,
    F,
    num,
    lf,
    mat,
    vec,
    mul,
    sub,
    scaleMat,
    identity,
    inv,
    transpose,
    det,
    rank,
    matVec,
    isZeroVec,
    eqMat,
    isDiagonal,
    dotF,
    cross3,
    rankOfVectors,
    coordinatesIn,
    nullspace,
    latexMatrix,
    hlTex,
    hlHtml,
    latexVec,
    latexRow,
    polyLatex,
    polyFactorLatex,
    minimalPolynomial,
    charPolynomial,
    el,
    chips,
    labShell,
    predictFlow,
    plane2d,
    withAlpha,
    renderFormal,
    register,
  });
})();
