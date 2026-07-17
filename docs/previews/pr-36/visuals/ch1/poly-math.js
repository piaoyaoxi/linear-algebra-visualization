/* Chapter 1 shared polynomial math, exact rationals, and fixed-camera canvas helpers. */
(() => {
  const frames = new WeakMap();
  const gcdInt = (a, b) => {
    let x = Math.abs(a | 0);
    let y = Math.abs(b | 0);
    while (y) {
      const t = y;
      y = x % y;
      x = t;
    }
    return x || 1;
  };

  const reducedMotion = () => Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2);
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  function R(n, d = 1) {
    n = Number(n);
    d = Number(d);
    if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return { n: 0, d: 1 };
    if (d < 0) {
      n = -n;
      d = -d;
    }
    n = Math.round(n);
    d = Math.round(d) || 1;
    const g = gcdInt(n, d);
    return { n: n / g, d: d / g };
  }

  const rAdd = (a, b) => R(a.n * b.d + b.n * a.d, a.d * b.d);
  const rSub = (a, b) => R(a.n * b.d - b.n * a.d, a.d * b.d);
  const rMul = (a, b) => R(a.n * b.n, a.d * b.d);
  const rDiv = (a, b) => R(a.n * b.d, a.d * b.n);
  const rNeg = (a) => R(-a.n, a.d);
  const rEq = (a, b) => a.n === b.n && a.d === b.d;
  const rIsZero = (a) => a.n === 0;
  const rCmp = (a, b) => a.n * b.d - b.n * a.d;
  const rToNum = (a) => a.n / a.d;
  const rAbs = (a) => R(Math.abs(a.n), a.d);

  function formatR(a, digits = 4) {
    if (a.d === 1) return String(a.n);
    const num = rToNum(a);
    if (Number.isInteger(num)) return String(num);
    const rounded = Math.round(num * 10 ** digits) / 10 ** digits;
    return String(rounded);
  }

  function formatRTex(a) {
    if (a.d === 1) return String(a.n);
    const sign = a.n < 0 ? "-" : "";
    return `${sign}\\dfrac{${Math.abs(a.n)}}{${a.d}}`;
  }

  function polyFromNums(nums) {
    return (nums || []).map((v) => (typeof v === "object" && v && "n" in v ? R(v.n, v.d) : R(v)));
  }

  function normalizePoly(coeffs) {
    const out = coeffs.map((c) => R(c.n, c.d));
    while (out.length > 1 && rIsZero(out[out.length - 1])) out.pop();
    if (out.length === 0) out.push(R(0));
    return out;
  }

  function isZeroPoly(p) {
    return normalizePoly(p).every(rIsZero);
  }

  function deg(p) {
    const n = normalizePoly(p);
    if (n.length === 1 && rIsZero(n[0])) return -Infinity;
    return n.length - 1;
  }

  function leading(p) {
    const n = normalizePoly(p);
    return n[n.length - 1];
  }

  function polyEq(a, b) {
    const A = normalizePoly(a);
    const B = normalizePoly(b);
    if (A.length !== B.length) return false;
    return A.every((c, i) => rEq(c, B[i]));
  }

  function polyAdd(a, b) {
    const n = Math.max(a.length, b.length);
    const out = [];
    for (let i = 0; i < n; i++) out.push(rAdd(a[i] || R(0), b[i] || R(0)));
    return normalizePoly(out);
  }

  function polySub(a, b) {
    return polyAdd(a, b.map(rNeg));
  }

  function polyScale(a, s) {
    const sc = typeof s === "object" ? s : R(s);
    return normalizePoly(a.map((c) => rMul(c, sc)));
  }

  function polyMul(a, b) {
    if (isZeroPoly(a) || isZeroPoly(b)) return [R(0)];
    const out = Array(a.length + b.length - 1)
      .fill(null)
      .map(() => R(0));
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b.length; j++) {
        out[i + j] = rAdd(out[i + j], rMul(a[i], b[j]));
      }
    }
    return normalizePoly(out);
  }

  /** Exact division with remainder using rational coeffs. Returns { q, r }. */
  function polyDiv(f, g) {
    const G = normalizePoly(g);
    if (isZeroPoly(G)) throw new Error("division by zero polynomial");
    let rem = normalizePoly(f);
    const q = [];
    const dG = deg(G);
    const leadG = leading(G);
    while (!isZeroPoly(rem) && deg(rem) >= dG) {
      const d = deg(rem) - dG;
      const coeff = rDiv(leading(rem), leadG);
      while (q.length <= d) q.push(R(0));
      q[d] = rAdd(q[d] || R(0), coeff);
      const term = Array(d + 1)
        .fill(null)
        .map((_, i) => (i === d ? coeff : R(0)));
      rem = polySub(rem, polyMul(term, G));
    }
    return { q: normalizePoly(q.length ? q : [R(0)]), r: normalizePoly(rem) };
  }

  function polyMod(f, g) {
    return polyDiv(f, g).r;
  }

  function makeMonic(p) {
    if (isZeroPoly(p)) return [R(0)];
    return polyScale(p, rDiv(R(1), leading(p)));
  }

  function polyGcd(a, b) {
    let A = normalizePoly(a);
    let B = normalizePoly(b);
    while (!isZeroPoly(B)) {
      const next = polyMod(A, B);
      A = B;
      B = next;
    }
    return makeMonic(A);
  }

  function polyDerivative(p) {
    const n = normalizePoly(p);
    if (n.length <= 1) return [R(0)];
    return normalizePoly(n.slice(1).map((c, i) => rMul(c, R(i + 1))));
  }

  function evalPoly(p, x) {
    const X = typeof x === "object" ? x : R(x);
    let acc = R(0);
    for (let i = p.length - 1; i >= 0; i--) acc = rAdd(rMul(acc, X), p[i] || R(0));
    return acc;
  }

  function evalPolyNum(p, x) {
    let acc = 0;
    for (let i = p.length - 1; i >= 0; i--) acc = acc * x + rToNum(p[i] || R(0));
    return acc;
  }

  function formatPolyTex(p, variable = "x") {
    const n = normalizePoly(p);
    if (isZeroPoly(n)) return "0";
    const parts = [];
    for (let i = n.length - 1; i >= 0; i--) {
      const c = n[i];
      if (rIsZero(c)) continue;
      const abs = rAbs(c);
      const sign = c.n < 0 ? "-" : parts.length ? "+" : "";
      let body;
      if (i === 0) body = formatRTex(abs);
      else if (i === 1) {
        body = rEq(abs, R(1)) ? variable : `${formatRTex(abs)}${variable}`;
      } else {
        body = rEq(abs, R(1)) ? `${variable}^{${i}}` : `${formatRTex(abs)}${variable}^{${i}}`;
      }
      parts.push(sign ? `${sign} ${body}` : body);
    }
    return parts.join(" ");
  }

  function formatCoeffsList(p) {
    return `[${normalizePoly(p)
      .map((c) => formatR(c))
      .join(", ")}]`;
  }

  function stripHtml(p, { editable = false, dataKey = "coeff" } = {}) {
    const n = normalizePoly(p);
    return `<div class="ch1-strip" role="list">${n
      .map(
        (c, i) => `
      <div class="ch1-strip-cell" role="listitem" data-deg="${i}">
        <span class="ch1-strip-deg">${i === 0 ? "const" : i === 1 ? "x" : `x^${i}`}</span>
        ${
          editable
            ? `<input class="ch1-strip-input" type="number" step="any" data-${dataKey}="${i}" value="${formatR(c)}" aria-label="系数 ${i}" />`
            : `<strong class="ch1-strip-val">${formatR(c)}</strong>`
        }
      </div>`,
      )
      .join("")}</div>`;
  }

  function getPalette() {
    const style = getComputedStyle(document.body);
    return {
      surface: style.getPropertyValue("--surface-solid").trim() || "#ffffff",
      soft: style.getPropertyValue("--surface-soft").trim() || "#eef4f6",
      text: style.getPropertyValue("--text").trim() || "#071512",
      muted: style.getPropertyValue("--muted").trim() || "#66717f",
      line: style.getPropertyValue("--line-strong").trim() || "rgba(28,43,61,.2)",
      accent: style.getPropertyValue("--accent").trim() || "#0f8f88",
      accentStrong: style.getPropertyValue("--accent-strong").trim() || "#08736e",
      coral: style.getPropertyValue("--coral").trim() || "#d9835f",
      blue: style.getPropertyValue("--blue").trim() || "#547ec8",
    };
  }

  function setupCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width || canvas.clientWidth || 520);
    const height = Math.max(1, rect.height || canvas.clientHeight || 300);
    const dpr = window.devicePixelRatio || 1;
    const pw = Math.max(1, Math.round(width * dpr));
    const ph = Math.max(1, Math.round(height * dpr));
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return { ctx, width, height };
  }

  /**
   * Fixed-camera axes. World bounds are locked so interactions never zoom away.
   * Default world: x in [-4,4], y in [-4,4] mapped with padding.
   */
  function camera(width, height, bounds = { xMin: -4, xMax: 4, yMin: -4, yMax: 4 }) {
    const pad = 28;
    const sx = (width - pad * 2) / (bounds.xMax - bounds.xMin);
    const sy = (height - pad * 2) / (bounds.yMax - bounds.yMin);
    const scale = Math.min(sx, sy);
    const ox = width / 2 - ((bounds.xMax + bounds.xMin) / 2) * scale;
    const oy = height / 2 + ((bounds.yMax + bounds.yMin) / 2) * scale;
    return {
      bounds,
      scale,
      toScreen(x, y) {
        return { x: ox + x * scale, y: oy - y * scale };
      },
      toWorld(px, py) {
        return { x: (px - ox) / scale, y: (oy - py) / scale };
      },
    };
  }

  function drawAxes(ctx, width, height, cam, palette) {
    ctx.save();
    ctx.strokeStyle = palette.line;
    ctx.lineWidth = 1;
    const o = cam.toScreen(0, 0);
    ctx.beginPath();
    ctx.moveTo(12, o.y);
    ctx.lineTo(width - 12, o.y);
    ctx.moveTo(o.x, 12);
    ctx.lineTo(o.x, height - 12);
    ctx.stroke();
    ctx.fillStyle = palette.muted;
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    for (let x = Math.ceil(cam.bounds.xMin); x <= Math.floor(cam.bounds.xMax); x++) {
      if (x === 0) continue;
      const p = cam.toScreen(x, 0);
      ctx.fillText(String(x), p.x - 3, p.y + 14);
    }
    ctx.restore();
  }

  function drawPolyGraph(canvas, poly, options = {}) {
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const cam = camera(width, height, options.bounds);
    drawAxes(ctx, width, height, cam, palette);

    const color = options.color || palette.accent;
    const samples = options.samples || 240;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = options.lineWidth || 2.4;
    ctx.beginPath();
    let started = false;
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const x = cam.bounds.xMin + t * (cam.bounds.xMax - cam.bounds.xMin);
      const y = evalPolyNum(poly, x);
      if (!Number.isFinite(y) || y < cam.bounds.yMin - 2 || y > cam.bounds.yMax + 2) {
        started = false;
        continue;
      }
      const p = cam.toScreen(x, y);
      if (!started) {
        ctx.moveTo(p.x, p.y);
        started = true;
      } else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.restore();

    if (options.points?.length) {
      options.points.forEach((pt) => {
        const p = cam.toScreen(pt.x, pt.y);
        ctx.beginPath();
        ctx.fillStyle = pt.color || palette.coral;
        ctx.arc(p.x, p.y, pt.r || 5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    if (options.caption) {
      ctx.fillStyle = palette.muted;
      ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(options.caption, 14, height - 12);
    }

    return cam;
  }

  function drawRootAxis(canvas, roots, options = {}) {
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const cam = camera(width, height, options.bounds || { xMin: -4, xMax: 4, yMin: -1.5, yMax: 1.5 });
    drawAxes(ctx, width, height, cam, palette);
    roots.forEach((root) => {
      const mult = root.m || 1;
      const p = cam.toScreen(root.x, 0);
      for (let k = 0; k < mult; k++) {
        ctx.beginPath();
        ctx.fillStyle = root.color || palette.accent;
        ctx.arc(p.x, p.y - k * 7, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = palette.surface;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      if (root.label) {
        ctx.fillStyle = palette.text;
        ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText(root.label, p.x - 8, p.y + 18);
      }
    });
  }

  function drawComplexPlane(canvas, points, options = {}) {
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const cam = camera(width, height, options.bounds || { xMin: -3, xMax: 3, yMin: -3, yMax: 3 });
    drawAxes(ctx, width, height, cam, palette);
    ctx.fillStyle = palette.muted;
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    const re = cam.toScreen(cam.bounds.xMax - 0.3, 0);
    const im = cam.toScreen(0, cam.bounds.yMax - 0.3);
    ctx.fillText("Re", re.x - 10, re.y - 6);
    ctx.fillText("Im", im.x + 6, im.y + 4);
    points.forEach((pt) => {
      const p = cam.toScreen(pt.re, pt.im);
      ctx.beginPath();
      ctx.fillStyle = pt.color || palette.coral;
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();
      if (pt.label) {
        ctx.fillStyle = palette.text;
        ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText(pt.label, p.x + 8, p.y - 6);
      }
    });
    return cam;
  }

  function drawLattice(canvas, terms, options = {}) {
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const maxI = options.maxI || 4;
    const maxJ = options.maxJ || 4;
    const pad = 40;
    const cellW = (width - pad * 2) / maxI;
    const cellH = (height - pad * 2) / maxJ;
    ctx.strokeStyle = palette.line;
    ctx.fillStyle = palette.muted;
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    for (let i = 0; i <= maxI; i++) {
      for (let j = 0; j <= maxJ; j++) {
        const x = pad + i * cellW;
        const y = height - pad - j * cellH;
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillText("x 指数 →", width - 70, height - 12);
    ctx.fillText("y↑", 8, 18);
    (terms || []).forEach((t) => {
      const x = pad + t.i * cellW;
      const y = height - pad - t.j * cellH;
      ctx.beginPath();
      ctx.fillStyle = t.active ? palette.accent : palette.coral;
      ctx.arc(x, y, t.active ? 8 : 6, 0, Math.PI * 2);
      ctx.fill();
      if (t.label) {
        ctx.fillStyle = palette.text;
        ctx.fillText(t.label, x + 10, y - 6);
      }
    });
  }

  function cancelAnim(key) {
    const id = frames.get(key);
    if (id) cancelAnimationFrame(id);
    frames.delete(key);
  }

  function animateScalar(key, from, to, duration, onUpdate) {
    cancelAnim(key);
    const dur = reducedMotion() ? 0 : duration;
    if (dur <= 0) {
      onUpdate(to, 1);
      return Promise.resolve(to);
    }
    const start = performance.now();
    return new Promise((resolve) => {
      const step = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = easeInOutCubic(t);
        onUpdate(lerp(from, to, eased), t);
        if (t < 1) {
          frames.set(key, requestAnimationFrame(step));
          return;
        }
        frames.delete(key);
        onUpdate(to, 1);
        resolve(to);
      };
      frames.set(key, requestAnimationFrame(step));
    });
  }

  function pulseClass(el, cls = "is-pulse") {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function divisionSteps(f, g) {
    const steps = [];
    const G = normalizePoly(g);
    if (isZeroPoly(G)) return steps;
    let rem = normalizePoly(f);
    const q = [];
    const dG = deg(G);
    const leadG = leading(G);
    steps.push({
      kind: "start",
      rem: rem.slice(),
      q: [R(0)],
      note: "开始带余除法",
    });
    while (!isZeroPoly(rem) && deg(rem) >= dG) {
      const d = deg(rem) - dG;
      const coeff = rDiv(leading(rem), leadG);
      while (q.length <= d) q.push(R(0));
      q[d] = rAdd(q[d] || R(0), coeff);
      const term = Array(d + 1)
        .fill(null)
        .map((_, i) => (i === d ? coeff : R(0)));
      const product = polyMul(term, G);
      const nextRem = polySub(rem, product);
      steps.push({
        kind: "eliminate",
        term: term.slice(),
        product: product.slice(),
        remBefore: rem.slice(),
        rem: nextRem.slice(),
        q: normalizePoly(q.slice()),
        note: `商加上 ${formatPolyTex(term)}，消去次数 ${deg(rem)} 项`,
      });
      rem = nextRem;
    }
    steps.push({
      kind: "done",
      rem: rem.slice(),
      q: normalizePoly(q.length ? q : [R(0)]),
      note: isZeroPoly(rem) ? "余式为 0，整除成立" : `余式次数 ${deg(rem)} < 除式次数 ${dG}`,
    });
    return steps;
  }

  function euclidSteps(f, g) {
    const steps = [];
    let A = normalizePoly(f);
    let B = normalizePoly(g);
    steps.push({ a: A.slice(), b: B.slice(), r: null, note: "输入两个多项式" });
    while (!isZeroPoly(B)) {
      const { q, r } = polyDiv(A, B);
      steps.push({
        a: A.slice(),
        b: B.slice(),
        q: q.slice(),
        r: r.slice(),
        note: `${formatPolyTex(A)} = (${formatPolyTex(q)})(${formatPolyTex(B)}) + (${formatPolyTex(r)})`,
      });
      A = B;
      B = r;
    }
    steps.push({ a: makeMonic(A), b: [R(0)], r: null, note: `最大公因式（首一）= ${formatPolyTex(makeMonic(A))}` });
    return steps;
  }

  window.Ch1Math = {
    R,
    rAdd,
    rSub,
    rMul,
    rDiv,
    rNeg,
    rEq,
    rIsZero,
    rCmp,
    rToNum,
    rAbs,
    formatR,
    formatRTex,
    polyFromNums,
    normalizePoly,
    isZeroPoly,
    deg,
    leading,
    polyEq,
    polyAdd,
    polySub,
    polyScale,
    polyMul,
    polyDiv,
    polyMod,
    makeMonic,
    polyGcd,
    polyDerivative,
    evalPoly,
    evalPolyNum,
    formatPolyTex,
    formatCoeffsList,
    stripHtml,
    getPalette,
    setupCanvas,
    camera,
    drawAxes,
    drawPolyGraph,
    drawRootAxis,
    drawComplexPlane,
    drawLattice,
    animateScalar,
    cancelAnim,
    reducedMotion,
    pulseClass,
    clamp,
    lerp,
    divisionSteps,
    euclidSteps,
  };
})();
