
;/* visuals/ch1/poly-math.js */
/* Chapter 1 shared exact polynomial math and fixed-camera drawing helpers. */
(() => {
  "use strict";

  const observers = new WeakMap();

  function gcdInt(a, b) {
    let x = Math.abs(Number(a));
    let y = Math.abs(Number(b));
    if (!Number.isSafeInteger(x) || !Number.isSafeInteger(y)) throw new RangeError("integer expected");
    while (y !== 0) [x, y] = [y, x % y];
    return x || 1;
  }

  function lcmInt(a, b) {
    if (a === 0 || b === 0) return 0;
    return Math.abs((a / gcdInt(a, b)) * b);
  }

  function R(n, d = 1) {
    const nn = Number(n);
    const dd = Number(d);
    if (!Number.isSafeInteger(nn) || !Number.isSafeInteger(dd)) throw new RangeError("rational parts must be safe integers");
    if (dd === 0) throw new RangeError("zero denominator");
    const sign = dd < 0 ? -1 : 1;
    const g = gcdInt(nn, dd);
    return Object.freeze({ n: (sign * nn) / g, d: Math.abs(dd) / g });
  }

  function parseR(value) {
    if (value && typeof value === "object" && Number.isSafeInteger(value.n) && Number.isSafeInteger(value.d)) {
      return R(value.n, value.d);
    }
    if (typeof value === "number") {
      if (!Number.isFinite(value)) throw new TypeError("finite number expected");
      if (Number.isSafeInteger(value)) return R(value);
      return parseR(String(value));
    }
    const raw = String(value ?? "").trim().replace(/−/g, "-");
    if (!raw) return R(0);
    if (/^[+-]?\d+\s*\/\s*[+-]?\d+$/.test(raw)) {
      const [a, b] = raw.split("/").map((part) => Number(part.trim()));
      return R(a, b);
    }
    if (/^[+-]?\d+(?:\.\d+)?$/.test(raw)) {
      const sign = raw.startsWith("-") ? -1 : 1;
      const unsigned = raw.replace(/^[+-]/, "");
      if (!unsigned.includes(".")) return R(sign * Number(unsigned));
      const [whole, frac] = unsigned.split(".");
      const den = 10 ** frac.length;
      if (!Number.isSafeInteger(den)) throw new RangeError("too many decimal places");
      return R(sign * (Number(whole) * den + Number(frac)), den);
    }
    throw new TypeError(`invalid rational: ${raw}`);
  }

  const rAdd = (a, b) => R(a.n * b.d + b.n * a.d, a.d * b.d);
  const rSub = (a, b) => R(a.n * b.d - b.n * a.d, a.d * b.d);
  const rMul = (a, b) => R(a.n * b.n, a.d * b.d);
  const rDiv = (a, b) => {
    if (b.n === 0) throw new RangeError("division by zero rational");
    return R(a.n * b.d, a.d * b.n);
  };
  const rNeg = (a) => R(-a.n, a.d);
  const rAbs = (a) => R(Math.abs(a.n), a.d);
  const rEq = (a, b) => a.n === b.n && a.d === b.d;
  const rIsZero = (a) => a.n === 0;
  const rToNum = (a) => a.n / a.d;

  function formatR(a) {
    return a.d === 1 ? String(a.n) : `${a.n}/${a.d}`;
  }

  // the same exact value for reading on the page: −3/2 with a true minus sign
  function formatRText(a) {
    return formatR(a).replace("-", "−");
  }

  function formatRTex(a) {
    if (a.d === 1) return String(a.n);
    const sign = a.n < 0 ? "-" : "";
    return `${sign}\\frac{${Math.abs(a.n)}}{${a.d}}`;
  }

  function poly(values) {
    return normalizePoly((values || []).map(parseR));
  }

  function normalizePoly(values) {
    const out = (values || []).map(parseR);
    while (out.length > 1 && rIsZero(out[out.length - 1])) out.pop();
    return out.length ? out : [R(0)];
  }

  const zeroPoly = () => [R(0)];
  const onePoly = () => [R(1)];
  const isZeroPoly = (p) => normalizePoly(p).every(rIsZero);
  function deg(p) {
    const n = normalizePoly(p);
    return isZeroPoly(n) ? -Infinity : n.length - 1;
  }
  const leading = (p) => normalizePoly(p).at(-1);

  function polyEq(a, b) {
    const A = normalizePoly(a);
    const B = normalizePoly(b);
    return A.length === B.length && A.every((c, i) => rEq(c, B[i]));
  }

  function polyAdd(a, b) {
    const n = Math.max(a.length, b.length);
    return normalizePoly(Array.from({ length: n }, (_, i) => rAdd(a[i] || R(0), b[i] || R(0))));
  }
  const polyNeg = (a) => normalizePoly(a.map(rNeg));
  const polySub = (a, b) => polyAdd(a, polyNeg(b));
  function polyScale(a, scalar) {
    const s = parseR(scalar);
    return normalizePoly(a.map((c) => rMul(c, s)));
  }
  function polyShift(a, amount) {
    return normalizePoly([...Array(Math.max(0, amount)).fill(R(0)), ...a]);
  }
  function polyMul(a, b) {
    if (isZeroPoly(a) || isZeroPoly(b)) return zeroPoly();
    const out = Array.from({ length: a.length + b.length - 1 }, () => R(0));
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b.length; j++) out[i + j] = rAdd(out[i + j], rMul(a[i], b[j]));
    }
    return normalizePoly(out);
  }
  function polyPow(a, n) {
    if (!Number.isInteger(n) || n < 0) throw new RangeError("nonnegative integer exponent expected");
    let result = onePoly();
    let base = normalizePoly(a);
    let exp = n;
    while (exp) {
      if (exp % 2) result = polyMul(result, base);
      base = polyMul(base, base);
      exp = Math.floor(exp / 2);
    }
    return result;
  }

  function polyDiv(f, g) {
    const G = normalizePoly(g);
    if (isZeroPoly(G)) throw new RangeError("division by zero polynomial");
    let rem = normalizePoly(f);
    const q = zeroPoly();
    const dG = deg(G);
    while (!isZeroPoly(rem) && deg(rem) >= dG) {
      const d = deg(rem) - dG;
      const c = rDiv(leading(rem), leading(G));
      while (q.length <= d) q.push(R(0));
      q[d] = rAdd(q[d] || R(0), c);
      rem = polySub(rem, polyShift(polyScale(G, c), d));
    }
    return { q: normalizePoly(q), r: normalizePoly(rem) };
  }
  const polyMod = (f, g) => polyDiv(f, g).r;
  function makeMonic(p) {
    return isZeroPoly(p) ? zeroPoly() : polyScale(p, rDiv(R(1), leading(p)));
  }
  function polyGcd(a, b) {
    let A = normalizePoly(a);
    let B = normalizePoly(b);
    while (!isZeroPoly(B)) [A, B] = [B, polyMod(A, B)];
    return makeMonic(A);
  }
  function polyDerivative(p, order = 1) {
    let result = normalizePoly(p);
    for (let k = 0; k < order; k++) {
      result = result.length <= 1 ? zeroPoly() : normalizePoly(result.slice(1).map((c, i) => rMul(c, R(i + 1))));
    }
    return result;
  }
  function evalPoly(p, x) {
    const X = parseR(x);
    let acc = R(0);
    for (let i = p.length - 1; i >= 0; i--) acc = rAdd(rMul(acc, X), p[i] || R(0));
    return acc;
  }
  function evalPolyNum(p, x) {
    let acc = 0;
    for (let i = p.length - 1; i >= 0; i--) acc = acc * x + rToNum(p[i] || R(0));
    return acc;
  }

  function divisionSteps(f, g) {
    const F = normalizePoly(f);
    const G = normalizePoly(g);
    if (isZeroPoly(G)) throw new RangeError("division by zero polynomial");
    const steps = [{ kind: "start", q: zeroPoly(), r: F, before: F, note: "从被除式开始" }];
    let q = zeroPoly();
    let r = F;
    while (!isZeroPoly(r) && deg(r) >= deg(G)) {
      const d = deg(r) - deg(G);
      const c = rDiv(leading(r), leading(G));
      const term = polyShift([c], d);
      const product = polyMul(term, G);
      const next = polySub(r, product);
      q = polyAdd(q, term);
      steps.push({ kind: "eliminate", q, r: next, before: r, term, product, note: `用商项 ${formatPolyTex(term)} 消去 ${deg(r)} 次项` });
      r = next;
    }
    steps.push({ kind: "done", q, r, before: r, note: isZeroPoly(r) ? "余式为 0，整除成立" : `余式次数 ${deg(r)} 小于除式次数 ${deg(G)}` });
    return steps;
  }

  function extendedEuclidSteps(f, g) {
    const F = normalizePoly(f);
    const G = normalizePoly(g);
    let oldR = F, r = G;
    let oldS = onePoly(), s = zeroPoly();
    let oldT = zeroPoly(), t = onePoly();
    const steps = [{ kind: "start", a: oldR, b: r, s: oldS, t: oldT, note: "初始化：A=f，B=g" }];
    while (!isZeroPoly(r)) {
      const { q, r: nextR } = polyDiv(oldR, r);
      const nextS = polySub(oldS, polyMul(q, s));
      const nextT = polySub(oldT, polyMul(q, t));
      steps.push({ kind: "divide", a: oldR, b: r, q, remainder: nextR, s: nextS, t: nextT, note: `${formatPolyTex(oldR)} = (${formatPolyTex(q)})(${formatPolyTex(r)}) + (${formatPolyTex(nextR)})` });
      [oldR, r] = [r, nextR];
      [oldS, s] = [s, nextS];
      [oldT, t] = [t, nextT];
    }
    if (isZeroPoly(oldR)) return steps;
    const scale = rDiv(R(1), leading(oldR));
    const d = polyScale(oldR, scale);
    const S = polyScale(oldS, scale);
    const T = polyScale(oldT, scale);
    steps.push({ kind: "done", a: d, b: zeroPoly(), d, s: S, t: T, note: `首一 gcd = ${formatPolyTex(d)}` });
    return steps;
  }

  function hornerSteps(p, x) {
    const X = parseR(x);
    let acc = R(0);
    const steps = [];
    for (let i = normalizePoly(p).length - 1; i >= 0; i--) {
      const before = acc;
      acc = rAdd(rMul(acc, X), p[i] || R(0));
      steps.push({ degree: i, before, coefficient: p[i] || R(0), after: acc });
    }
    return { value: acc, steps };
  }

  function lagrangeInterpolation(nodes) {
    if (!Array.isArray(nodes) || nodes.length === 0) return { polynomial: zeroPoly(), bases: [] };
    const xs = nodes.map((n) => parseR(n.x));
    for (let i = 0; i < xs.length; i++) {
      for (let j = i + 1; j < xs.length; j++) if (rEq(xs[i], xs[j])) throw new RangeError("interpolation x values must be distinct");
    }
    let total = zeroPoly();
    const bases = nodes.map((node, i) => {
      let numerator = onePoly();
      let denominator = R(1);
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        numerator = polyMul(numerator, [rNeg(xs[j]), R(1)]);
        denominator = rMul(denominator, rSub(xs[i], xs[j]));
      }
      const L = polyScale(numerator, rDiv(R(1), denominator));
      const contribution = polyScale(L, parseR(node.y));
      total = polyAdd(total, contribution);
      return { L, contribution };
    });
    return { polynomial: normalizePoly(total), bases };
  }

  function contentAndPrimitive(p) {
    const P = normalizePoly(p);
    const commonDen = P.reduce((acc, c) => lcmInt(acc, c.d), 1);
    const integers = P.map((c) => c.n * (commonDen / c.d));
    const g = integers.reduce((acc, n) => gcdInt(acc, n), 0);
    const sign = integers.at(-1) < 0 ? -1 : 1;
    const content = R(sign * g, commonDen);
    const primitive = polyScale(P, rDiv(R(1), content));
    return { commonDen, content, primitive, integers };
  }

  function integerDivisors(n) {
    const value = Math.abs(Number(n));
    if (!Number.isSafeInteger(value)) throw new RangeError("safe integer expected");
    if (value === 0) return [0];
    const out = [];
    for (let i = 1; i * i <= value; i++) {
      if (value % i !== 0) continue;
      out.push(i);
      if (i * i !== value) out.push(value / i);
    }
    return out.sort((a, b) => a - b);
  }

  function rationalRootCandidates(p) {
    const P = normalizePoly(p);
    const { primitive } = contentAndPrimitive(P);
    const ints = primitive.map((c) => c.n / c.d);
    if (!ints.every(Number.isSafeInteger)) throw new RangeError("primitive coefficients must be integers");
    const a0 = ints[0];
    const an = ints.at(-1);
    if (a0 === 0) return [R(0), ...rationalRootCandidates(normalizePoly(ints.slice(1).map(R)))];
    const set = new Map();
    for (const num of integerDivisors(a0)) {
      for (const den of integerDivisors(an)) {
        for (const sign of [-1, 1]) {
          const c = R(sign * num, den);
          set.set(formatR(c), c);
        }
      }
    }
    return [...set.values()].sort((a, b) => rToNum(a) - rToNum(b));
  }

  function formatPolyTex(p, variable = "x") {
    const P = normalizePoly(p);
    if (isZeroPoly(P)) return "0";
    const parts = [];
    for (let i = P.length - 1; i >= 0; i--) {
      const c = P[i];
      if (rIsZero(c)) continue;
      const abs = rAbs(c);
      const sign = c.n < 0 ? "-" : parts.length ? "+" : "";
      let body;
      if (i === 0) body = formatRTex(abs);
      else {
        const coeff = rEq(abs, R(1)) ? "" : formatRTex(abs);
        body = `${coeff}${variable}${i === 1 ? "" : `^{${i}}`}`;
      }
      parts.push(`${sign}${sign ? " " : ""}${body}`);
    }
    return parts.join(" ");
  }

  function formatCoefficients(p) {
    return `[${normalizePoly(p).map(formatR).join(", ")}]`;
  }

  function coefficientStrip(p, { editable = false, key = "coeff", length = null } = {}) {
    const P = normalizePoly(p);
    const n = Math.max(P.length, length || 0);
    return `<div class="ch1-strip" role="list">${Array.from({ length: n }, (_, i) => {
      const value = P[i] || R(0);
      const monomial = i === 0 ? "1" : i === 1 ? "x" : `x^{${i}}`;
      const label = window.texInline ? window.texInline(monomial) : i === 0 ? "1" : i === 1 ? "x" : `x<sup>${i}</sup>`;
      return `<label class="ch1-strip-cell" role="listitem"><span class="ch1-strip-deg">${label}</span>${editable ? `<input class="ch1-strip-input" type="text" inputmode="decimal" data-${key}="${i}" value="${formatR(value)}" aria-label="x 的 ${i} 次项系数">` : `<strong class="ch1-strip-val">${formatRText(value)}</strong>`}</label>`;
    }).join("")}</div>`;
  }

  function getPalette() {
    const style = getComputedStyle(document.body);
    return {
      surface: style.getPropertyValue("--surface-solid").trim() || "#fff",
      soft: style.getPropertyValue("--surface-soft").trim() || "#eef4f6",
      text: style.getPropertyValue("--text").trim() || "#10201d",
      muted: style.getPropertyValue("--muted").trim() || "#66717f",
      line: style.getPropertyValue("--line-strong").trim() || "rgba(30,50,48,.22)",
      accent: style.getPropertyValue("--accent").trim() || "#2c5e4a",
      coral: style.getPropertyValue("--coral").trim() || "#c4552f",
      blue: style.getPropertyValue("--blue").trim() || "#2a64a8",
      paper: style.getPropertyValue("--cv-paper").trim() || "#fdfcf8",
      grid: style.getPropertyValue("--cv-grid").trim() || "#f0ece2",
      gridMajor: style.getPropertyValue("--cv-grid-major").trim() || "#e2ddd0",
      axis: style.getPropertyValue("--cv-axis").trim() || "#8a8d84",
      v1: style.getPropertyValue("--cv-v1").trim() || "#2a64a8",
      v2: style.getPropertyValue("--cv-v2").trim() || "#c4552f",
      drag: style.getPropertyValue("--cv-drag").trim() || "#a87a12",
      image: style.getPropertyValue("--cv-image").trim() || "#8c4f86",
      subspace: style.getPropertyValue("--cv-subspace").trim() || "#2c5e4a",
    };
  }

  function setupCanvas(canvas) {
    const box = canvas.getBoundingClientRect();
    const width = Math.max(1, box.width || canvas.clientWidth || 520);
    const height = Math.max(1, box.height || canvas.clientHeight || 300);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return { ctx, width, height };
  }

  /*
   * stretch: x and y get their own scale so a function graph fills the canvas;
   * otherwise one scale for both (needed for the complex plane).
   */
  function camera(width, height, bounds = { xMin: -4, xMax: 4, yMin: -4, yMax: 4 }, opts = {}) {
    const pad = 34;
    const sxFit = (width - 2 * pad) / (bounds.xMax - bounds.xMin);
    const syFit = (height - 2 * pad) / (bounds.yMax - bounds.yMin);
    const scale = Math.min(sxFit, syFit);
    const sx = opts.stretch ? sxFit : scale;
    const sy = opts.stretch ? syFit : scale;
    const ox = width / 2 - ((bounds.xMin + bounds.xMax) / 2) * sx;
    const oy = height / 2 + ((bounds.yMin + bounds.yMax) / 2) * sy;
    const view = { xMin: (0 - ox) / sx, xMax: (width - ox) / sx, yMin: (oy - height) / sy, yMax: oy / sy };
    return {
      bounds, scale: sx, view,
      toScreen: (x, y) => ({ x: ox + x * sx, y: oy - y * sy }),
      toWorld: (x, y) => ({ x: (x - ox) / sx, y: (oy - y) / sy }),
    };
  }

  function drawAxes(ctx, width, height, cam, palette = getPalette()) {
    ctx.save();
    ctx.strokeStyle = palette.axis;
    ctx.fillStyle = palette.muted;
    ctx.lineWidth = 1;
    ctx.font = "11px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
    const origin = cam.toScreen(0, 0);
    ctx.beginPath();
    if (origin.y >= 0 && origin.y <= height) { ctx.moveTo(12, origin.y); ctx.lineTo(width - 12, origin.y); }
    if (origin.x >= 0 && origin.x <= width) { ctx.moveTo(origin.x, 12); ctx.lineTo(origin.x, height - 12); }
    ctx.stroke();
    const span = cam.view ? [cam.view.xMin + 0.3, cam.view.xMax - 0.3] : [cam.bounds.xMin, cam.bounds.xMax];
    const tickStep = cam.scale < 22 ? 2 : 1;
    for (let x = Math.ceil(span[0]); x <= Math.floor(span[1]); x++) {
      if (x === 0 || x % tickStep) continue;
      const p = cam.toScreen(x, 0);
      if (p.y < 0 || p.y > height) continue;
      ctx.textAlign = "center";
      ctx.lineWidth = 3;
      ctx.strokeStyle = palette.paper;
      const tick = String(x).replace("-", "−");
      ctx.strokeText(tick, p.x, p.y + 15);
      ctx.fillText(tick, p.x, p.y + 15);
    }
    ctx.restore();
  }

  function drawPolynomial(canvas, p, options = {}) {
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const cam = camera(width, height, options.bounds, { stretch: true });
    drawAxes(ctx, width, height, cam, palette);
    const polys = options.series || [{ p, color: palette.text, width: 2.4 }];
    for (const series of polys) {
      ctx.save();
      ctx.strokeStyle = series.color || palette.text;
      ctx.lineWidth = series.width || 2.2;
      // ghost series: same colour, dashed and faint
      if (series.dash) ctx.setLineDash(series.dash);
      if (series.alpha != null) ctx.globalAlpha = series.alpha;
      ctx.beginPath();
      let penDown = false;
      const samples = options.samples || Math.max(280, Math.round(width));
      for (let i = 0; i <= samples; i++) {
        const xr = options.clipToBounds ? cam.bounds : cam.view;
        const x = xr.xMin + (i / samples) * (xr.xMax - xr.xMin);
        const y = evalPolyNum(series.p, x);
        if (!Number.isFinite(y) || y < cam.view.yMin - 1 || y > cam.view.yMax + 1) { penDown = false; continue; }
        const point = cam.toScreen(x, y);
        if (!penDown) { ctx.moveTo(point.x, point.y); penDown = true; } else ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();
      ctx.restore();
    }
    (options.points || []).forEach((point) => {
      const pnt = cam.toScreen(point.x, point.y);
      ctx.beginPath();
      ctx.fillStyle = point.color || palette.drag;
      ctx.arc(pnt.x, pnt.y, point.r || 5, 0, Math.PI * 2);
      ctx.fill();
    });
    if (options.caption) {
      ctx.fillStyle = palette.muted;
      ctx.font = "12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      ctx.lineWidth = 4;
      ctx.strokeStyle = palette.paper;
      ctx.strokeText(options.caption, 14, height - 12);
      ctx.fillText(options.caption, 14, height - 12);
    }
    return cam;
  }

  function drawRootAxis(canvas, roots, options = {}) {
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const cam = camera(width, height, options.bounds || { xMin: -4, xMax: 4, yMin: -1.4, yMax: 1.4 }, { stretch: true });
    drawAxes(ctx, width, height, cam, palette);
    roots.forEach((root) => {
      const base = cam.toScreen(root.x, 0);
      for (let i = 0; i < (root.m || 1); i++) {
        ctx.beginPath();
        ctx.fillStyle = root.color || palette.drag;
        ctx.arc(base.x, base.y - i * 7, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = palette.surface;
        ctx.stroke();
      }
      ctx.fillStyle = palette.text;
      ctx.font = "12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      /* above the stacked dots, so it never lands on a tick number */
      ctx.textAlign = "center";
      if (root.label) ctx.fillText(root.label, base.x, base.y - ((root.m || 1) - 1) * 7 - 13);
      ctx.textAlign = "left";
    });
    return cam;
  }

  function drawComplexPlane(canvas, points, options = {}) {
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const cam = camera(width, height, options.bounds || { xMin: -3, xMax: 3, yMin: -3, yMax: 3 });
    drawAxes(ctx, width, height, cam, palette);
    ctx.fillStyle = palette.muted;
    ctx.font = "11px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
    const re = cam.toScreen(cam.bounds.xMax - 0.25, 0);
    const im = cam.toScreen(0, cam.bounds.yMax - 0.25);
    ctx.fillText("Re", re.x - 12, re.y - 7);
    ctx.fillText("Im", im.x + 7, im.y + 4);
    points.forEach((point) => {
      const p = cam.toScreen(point.re, point.im);
      ctx.beginPath();
      ctx.fillStyle = point.color || palette.coral;
      ctx.arc(p.x, p.y, point.r || 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = palette.text;
      ctx.font = "12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      if (point.label) ctx.fillText(point.label, p.x + 9, p.y - 7);
    });
    return cam;
  }

  function drawLattice(canvas, terms, options = {}) {
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const maxI = options.maxI ?? 5;
    const maxJ = options.maxJ ?? 5;
    const pad = 44;
    const sx = (width - 2 * pad) / Math.max(1, maxI);
    const sy = (height - 2 * pad) / Math.max(1, maxJ);
    ctx.font = "11px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
    for (let i = 0; i <= maxI; i++) {
      for (let j = 0; j <= maxJ; j++) {
        const x = pad + i * sx;
        const y = height - pad - j * sy;
        ctx.beginPath();
        ctx.fillStyle = palette.axis;
        ctx.arc(x, y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.strokeStyle = palette.subspace;
    for (const d of options.layers || []) {
      ctx.beginPath();
      const a = { x: pad + Math.min(d, maxI) * sx, y: height - pad - Math.max(0, d - maxI) * sy };
      const b = { x: pad + Math.max(0, d - maxJ) * sx, y: height - pad - Math.min(d, maxJ) * sy };
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    (terms || []).forEach((term) => {
      const x = pad + term.i * sx;
      const y = height - pad - term.j * sy;
      ctx.beginPath();
      ctx.fillStyle = term.active ? term.color || palette.accent : term.color || palette.v1;
      ctx.arc(x, y, term.active ? 8 : 6, 0, Math.PI * 2);
      ctx.fill();
      if (term.label) { ctx.fillStyle = palette.text; ctx.fillText(term.label, x + 9, y - 7); }
    });
    ctx.fillStyle = palette.muted;
    ctx.fillText("x 指数", width - 62, height - 12);
    ctx.fillText("y 指数", 8, 16);
    return { pad, sx, sy, width, height, toIndex(px, py) { return { i: Math.round((px - pad) / sx), j: Math.round((height - pad - py) / sy) }; } };
  }

  function observeCanvas(root, draw) {
    const old = observers.get(root);
    old?.disconnect();
    // redraw when the width changes: the canvases size from it. A height change comes from
    // the text the drawing itself writes (typeset.js may rewrap it), and redrawing on it
    // would rewrite that text, rewrap, and loop
    let lastWidth = -1;
    const observer = new ResizeObserver((entries) => {
      if (!root.isConnected) { observer.disconnect(); return; }
      const width = Math.round(entries[entries.length - 1].contentRect.width);
      if (width === lastWidth) return;
      lastWidth = width;
      draw();
    });
    observer.observe(root);
    observers.set(root, observer);
    // follow the colour tokens while the light/dark switch morphs them
    const onThemeMix = () => { if (root.isConnected) draw(); else window.removeEventListener("la-thememix", onThemeMix); };
    window.addEventListener("la-thememix", onThemeMix);
    draw();
    return () => { observer.disconnect(); window.removeEventListener("la-thememix", onThemeMix); };
  }

  window.Ch1Math = {
    gcdInt, lcmInt, R, parseR, rAdd, rSub, rMul, rDiv, rNeg, rAbs, rEq, rIsZero, rToNum,
    formatR, formatRText, formatRTex, poly, normalizePoly, zeroPoly, onePoly, isZeroPoly, deg, leading, polyEq,
    polyAdd, polySub, polyScale, polyShift, polyMul, polyPow, polyDiv, polyMod, makeMonic, polyGcd,
    polyDerivative, evalPoly, evalPolyNum, divisionSteps, extendedEuclidSteps, hornerSteps,
    lagrangeInterpolation, contentAndPrimitive, integerDivisors, rationalRootCandidates,
    formatPolyTex, formatCoefficients, coefficientStrip, getPalette, setupCanvas, camera, drawAxes,
    drawPolynomial, drawRootAxis, drawComplexPlane, drawLattice, observeCanvas,
  };
})();


;/* visuals/ch1/section1-4-presentation.js */
(() => {
  "use strict";
  const M = () => window.Ch1Math;
  const tex = (value) => (window.texInline ? window.texInline(String(value)) : String(value));
  const display = (value) => (window.texDisplay ? window.texDisplay(String(value)) : String(value));
  const esc = (value) => String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);

  function renderFormal(el, section) {
    if (!el) return;
    const f = section.formal || {};
    const definitions = (f.definitions || []).slice(0, 3).map((item) => `<article class="definition-row"><strong>${item.title}</strong><p>${item.text}</p></article>`).join("");
    const pitfalls = (f.pitfalls || []).length ? `<div class="ch1-pitfalls"><strong>常见误区</strong><ul>${f.pitfalls.slice(0, 3).map((item) => `<li>${item}</li>`).join("")}</ul></div>` : "";
    el.innerHTML = `<h2>${f.title || "定理与概念"}</h2>
      <div class="lesson-formal-layout ch1-formal">
        ${f.intro ? `<p class="lesson-formal-intro">${f.intro}</p>` : ""}
        ${f.equation ? `<div class="ch1-formal-equation">${display(f.equation)}</div>` : ""}
        ${definitions ? `<div class="definition-stack">${definitions}</div>` : ""}
        ${pitfalls}
        ${f.note ? `<p class="ch1-next-note"><strong>${f.noteLabel || "下一节"}</strong>${f.note}</p>` : ""}
      </div>`;
  }

  function lab(el, title, description, controls, body) {
    el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
      <div class="ch1-lab-head"><h3>${title}</h3><p>${description}</p></div>
      ${controls ? `<div class="ch1-controls">${controls}</div>` : ""}
      ${body}
    </div>`;
  }

  function selectButtons(root, selector, selected) {
    root.querySelectorAll(selector).forEach((button) => button.classList.toggle("is-active", button === selected));
  }

  function readStrip(root, key) {
    const inputs = [...root.querySelectorAll(`[data-${key}]`)];
    const values = inputs.map((input) => {
      try { input.setCustomValidity(""); return M().parseR(input.value); }
      catch (error) { input.setCustomValidity("请输入整数、小数或分数，如 -3/2"); return M().R(0); }
    });
    return M().normalizePoly(values);
  }

  window.Ch1UI = { tex, display, esc, renderFormal, lab, selectButtons, readStrip };

  // §2 — coefficient strip and exact convolution
  function mountCoefficients(root) {
    const state = { f: M().poly([2, -1, 0, 3]), g: M().poly([-2, 1, 1, -3]), mode: "mul", k: 3, scale: M().R(2) };
    const bounds = { xMin: -2.5, xMax: 2.5, yMin: -8, yMax: 8 };
    const inputLength = 5;
    function result() {
      if (state.mode === "add") return M().polyAdd(state.f, state.g);
      if (state.mode === "sub") return M().polySub(state.f, state.g);
      if (state.mode === "scale") return M().polyScale(state.f, state.scale);
      return M().polyMul(state.f, state.g);
    }
    function contributions() {
      const rows = [];
      if (state.mode !== "mul") return rows;
      for (let i = 0; i < state.f.length; i++) {
        const j = state.k - i;
        if (j < 0 || j >= state.g.length) continue;
        rows.push({ i, j, value: M().rMul(state.f[i], state.g[j]) });
      }
      return rows;
    }
    function paint(rebuildInputs = false) {
      const out = result();
      if (rebuildInputs) {
        root.querySelector("[data-f-strip]").innerHTML = M().coefficientStrip(state.f, { editable: true, key: "f", length: inputLength });
        root.querySelector("[data-g-strip]").innerHTML = M().coefficientStrip(state.g, { editable: true, key: "g", length: inputLength });
      }
      root.querySelector("[data-out-strip]").innerHTML = M().coefficientStrip(out);
      root.querySelector("[data-f-tex]").innerHTML = tex(M().formatPolyTex(state.f));
      root.querySelector("[data-g-tex]").innerHTML = tex(M().formatPolyTex(state.g));
      root.querySelector("[data-out-tex]").innerHTML = tex(M().formatPolyTex(out));
      const degreeLine = (p, name) => (M().isZeroPoly(p) ? `${tex(`\\deg ${name}`)} 未定义（零多项式）` : tex(`\\deg ${name}=${M().deg(p)}`));
      root.querySelector("[data-deg-f]").innerHTML = degreeLine(state.f, "f");
      root.querySelector("[data-deg-g]").innerHTML = degreeLine(state.g, "g");
      root.querySelector("[data-deg-out]").textContent = M().isZeroPoly(out) ? "未定义（零多项式）" : M().deg(out);
      root.querySelector("[data-k-value]").textContent = state.k;
      root.querySelector("[data-k-eq]").innerHTML = tex(`k=${state.k}`);
      const rows = contributions();
      root.querySelector("[data-contributions]").innerHTML = state.mode === "mul" ? (rows.length ? rows.map((row) => `<tr><td>${tex(`a_${row.i}`)}</td><td>${tex(`b_${row.j}`)}</td><td>${tex(M().formatRTex(row.value))}</td></tr>`).join("") : `<tr><td colspan="3">该次数没有配对</td></tr>`) : `<tr><td colspan="3">切换到乘法后查看 ${tex("i+j=k")} 的完整配对。</td></tr>`;
      const coefficient = out[state.k] || M().R(0);
      root.querySelector("[data-k-coeff]").innerHTML = tex(M().formatRTex(coefficient));
      root.querySelector("[data-scale-box]").hidden = state.mode !== "scale";
      root.querySelector("[data-k-box]").hidden = state.mode !== "mul";
      // the i+j=k contributions only describe a product; hide them for f±g and λf
      const analysis = root.querySelector(".ch1-coeff-analysis");
      if (analysis) analysis.hidden = state.mode !== "mul";
      M().drawPolynomial(root.querySelector(".ch1-stage:not(.ch1-zero-stage) canvas"), out, { bounds, caption: "结果多项式的图像" });
    }
    root.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.matches("[data-f], [data-g]")) {
        state.f = readStrip(root, "f"); state.g = readStrip(root, "g"); paint(false);
      }
    });
    root.querySelector("[data-k]").addEventListener("input", (event) => { state.k = Number(event.target.value); paint(false); });
    root.querySelector("[data-scale]").addEventListener("change", (event) => { try { state.scale = M().parseR(event.target.value); event.target.setCustomValidity(""); } catch { event.target.setCustomValidity("请输入整数、小数或分数"); } paint(false); });
    root.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => { state.mode = button.dataset.mode; selectButtons(root, "[data-mode]", button); paint(false); }));
    root.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => {
      if (button.dataset.preset === "cancel") { state.f = M().poly([1, 0, 0, 2]); state.g = M().poly([0, 1, 0, -2]); state.mode = "add"; }
      else if (button.dataset.preset === "fraction") { state.f = M().poly(["1/2", "-3/2", 0, 1]); state.g = M().poly(["-1/2", "3/2", 1]); state.mode = "mul"; }
      else if (button.dataset.preset === "zero") { state.f = M().poly([0]); state.g = M().poly([1, 2]); state.mode = "add"; }
      else { state.f = M().poly([2, -1, 0, 3]); state.g = M().poly([-2, 1, 1, -3]); state.mode = "mul"; }
      root.querySelectorAll("[data-mode]").forEach((b) => b.classList.toggle("is-active", b.dataset.mode === state.mode));
      paint(true);
    }));
    M().observeCanvas(root.querySelector(".ch1-stage:not(.ch1-zero-stage)"), () => paint(false));
    paint(true);
  }

  /*
   * §2 opening module: the section question “can the middle 0 be dropped?”.
   * f = 3x³ − x + 2 ↔ (2, −1, 0, 3). Dropping the 0 gives (2, −1, 3) ↔ 3x² − x + 2:
   * the 3 moves from the x³ slot to the x² slot, and the two curves differ
   * (f − h = 3x²(x − 1), equal only at x = 0 and x = 1; f(2) = 24, h(2) = 12).
   */
  function mountZeroModule(root) {
    const box = root.querySelector("[data-zero-module]");
    if (!box) return;
    const f = M().poly([2, -1, 0, 3]);
    const h = M().poly([2, -1, 3]);
    const bounds = { xMin: -1.6, xMax: 2.4, yMin: -4, yMax: 26 };
    let dropped = false;
    const stage = box.querySelector(".ch1-zero-stage");
    const canvas = stage.querySelector("canvas");
    const toggle = box.querySelector("[data-zero-toggle]");
    const after = box.querySelector("[data-zero-after]");
    const readout = box.querySelector("[data-zero-readout]");

    function draw() {
      const pal = M().getPalette ? M().getPalette() : null;
      const st = getComputedStyle(canvas);
      const v1 = st.getPropertyValue("--cv-v1").trim() || pal?.v1 || "#2a64a8";
      const v2 = st.getPropertyValue("--cv-v2").trim() || pal?.v2 || "#c4552f";
      const axis = st.getPropertyValue("--cv-axis").trim() || "#8a8d84";
      const series = [{ p: f, color: v1, width: 2.4 }];
      if (dropped) series.push({ p: h, color: v2, width: 2.4 });
      const points = dropped ? [{ x: 2, y: 24, color: v1, r: 4.5 }, { x: 2, y: 12, color: v2, r: 4.5 }] : [];
      const cam = M().drawPolynomial(canvas, f, { bounds, series, points, clipToBounds: true });
      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.font = "italic 600 14px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      const put = (text, x, y, color, dx = 8, dy = 0) => { const p = cam.toScreen(x, y); ctx.fillStyle = color; ctx.fillText(text, p.x + dx, p.y + dy); };
      put("3x³ − x + 2", 1.62, 14.5, v1, -110, 0);
      if (dropped) {
        put("3x² − x + 2", -1.55, 15.5, v2, 0, 0);
        const top = cam.toScreen(2, 24);
        const bottom = cam.toScreen(2, 0);
        ctx.strokeStyle = axis; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(top.x, top.y); ctx.lineTo(bottom.x, bottom.y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = "600 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
        put("24", 2, 24, v1, 9, 4);
        put("12", 2, 12, v2, 9, 4);
      }
      ctx.restore();
    }

    function paint() {
      after.hidden = !dropped;
      toggle.textContent = dropped ? "恢复中间的 0" : "删去中间的 0";
      readout.hidden = !dropped || !gate?.revealed;
      draw();
    }

    const gate = window.LAPredictGate?.mount(box.querySelector("[data-zero-gate]"), {
      root: box,
      manual: true,
      key: "visuals/ch1/section1-4-presentation.js#middle-zero",
      question: `${tex("f(x)=3x^3-x+2")} 的系数序列是 ${tex("(2,-1,0,3)")}。删去中间的 0，写成 ${tex("(2,-1,3)")}，还是同一个多项式吗？`,
      options: [
        [`不是：3 挪到了 ${tex("x^2")} 的位置，变成 ${tex("3x^2-x+2")}`, true, ""],
        ["是：系数为 0 的项本来就不存在", false, `0 本身不贡献，但它占着 ${tex("x^2")} 的位置；删掉后，后面的系数都往前挪一位。`],
        ["是：只是写法更短", false, `${tex("(2,-1,3)")} 读作 ${tex("2-x+3x^2")}，在 x=2 处的值是 12，而 f(2)=24。`],
        ["只有次数变了，图像不变", false, "两条曲线只在 x=0 和 x=1 处相交，其他地方都分开了。"],
      ],
      right: `✓ 系数序列的第 ${tex("k")} 位就是 ${tex("x^k")} 的系数，位置本身就是次数。中间的 0 必须保留；两个多项式相等，指每个同次项的系数都相等。`,
    });

    toggle.addEventListener("click", () => {
      dropped = !dropped;
      if (dropped) gate?.acted();
      paint();
    });
    M().observeCanvas(stage, draw);
    paint();
  }

  function interactive2(el, section) {
    lab(el, "系数带工作台", section.interactive.description,
      `<button type="button" data-mode="mul" class="is-active">${tex("fg")}</button><button type="button" data-mode="add">${tex("f+g")}</button><button type="button" data-mode="sub">${tex("f-g")}</button><button type="button" data-mode="scale">${tex("\\lambda f")}</button><span class="ch1-control-separator"></span><button type="button" data-preset="default">默认</button><button type="button" data-preset="cancel">首项抵消</button><button type="button" data-preset="fraction">分数系数</button><button type="button" data-preset="zero">零多项式</button>`,
      `<section class="ch1-learning-module ch1-zero-module" data-zero-module>
         <div class="ch1-module-heading"><span>01</span><div><h4>中间的 0 能不能省掉</h4></div></div>
         <div data-zero-gate></div>
         <div class="ch1-zero-body">
           <div class="ch1-zero-strips">
             <div class="ch1-zero-strip is-f"><b>${tex("f")} 的系数</b>${M().coefficientStrip(M().poly([2, -1, 0, 3]))}</div>
             <div class="ch1-zero-strip is-h" data-zero-after hidden><b>删去 0 后</b>${M().coefficientStrip(M().poly([2, -1, 3]))}</div>
             <div class="ch1-zero-actions"><button type="button" class="ch3l-btn is-primary" data-zero-toggle>删去中间的 0</button></div>
             <p class="ch1-zero-readout" data-zero-readout hidden>${tex("x=2")} 时，${tex("f(2)=24")}，而 ${tex("3\\cdot2^2-2+2=12")}。两者之差 ${tex("3x^2(x-1)")}，只在 ${tex("x=0")}、${tex("x=1")} 处为 0。</p>
           </div>
           <div class="ch1-stage ch1-zero-stage"><canvas aria-label="3x³−x+2 与 3x²−x+2 的图像"></canvas></div>
         </div>
       </section>
       <div class="ch1-two-col"><div class="ch1-panel"><div><h4>${tex("f")} 的系数带</h4><div data-f-strip></div><div class="ch1-inline-equation">${tex("f=")}<span data-f-tex></span> · <span data-deg-f></span></div></div><div><h4>${tex("g")} 的系数带</h4><div data-g-strip></div><div class="ch1-inline-equation">${tex("g=")}<span data-g-tex></span> · <span data-deg-g></span></div></div><div data-scale-box hidden><label class="ch1-field">${tex("\\lambda")}（支持分数）<input type="text" value="2" data-scale></label></div><div data-k-box hidden><label class="ch1-slider-row"><span>结果次数 ${tex("k")}</span><input type="range" min="0" max="8" value="3" data-k><output data-k-value>3</output></label></div></div><div class="ch1-stage"><canvas aria-label="结果多项式固定坐标图像"></canvas></div></div>
       <div class="ch1-result-band"><div><span>结果</span><strong data-out-tex></strong><small>次数：<span data-deg-out></span></small></div><div data-out-strip></div></div>
       <div class="ch1-two-col"><div><h4>指定次数贡献</h4><div class="ch1-table-wrap"><table class="ch1-table"><thead><tr><th>${tex("f")} 项</th><th>${tex("g")} 项</th><th>乘积</th></tr></thead><tbody data-contributions></tbody></table></div></div><div class="ch1-callout"><strong>${tex("[x^k](fg)")} 的当前值</strong><p>当 <span data-k-eq></span> 时，系数为 <span data-k-coeff></span>。</p><p class="ch1-muted">输入允许整数、小数与分数，例如 −3/2；计算在有理数上精确完成。</p></div></div>`);
    mountCoefficients(el);
    mountZeroModule(el);
  }

  // §3 — division stepper
  function mountDivision(root) {
    const presets = {
      default: { f: M().poly([-1, 0, 0, 0, 1]), g: M().poly([1, 1, 1]), name: "x⁴−1 ÷ (x²+x+1)" },
      divides: { f: M().poly([-1, 0, 0, 1]), g: M().poly([-1, 1]), name: "x³−1 ÷ (x−1)" },
      fraction: { f: M().poly(["1/2", "-1/2", 0, 1]), g: M().poly(["1/2", 1]), name: "分数系数示例" },
    };
    let current = presets.default;
    let steps = M().divisionSteps(current.f, current.g);
    let index = 0;
    const paint = () => {
      steps = M().divisionSteps(current.f, current.g);
      index = Math.min(index, steps.length - 1);
      const step = steps[index];
      const done = step.kind === "done";
      const divides = done && M().isZeroPoly(step.r);
      root.querySelector("[data-title]").textContent = current.name;
      root.querySelector("[data-step]").textContent = `${index + 1}/${steps.length}`;
      root.querySelector("[data-note]").textContent = step.note;
      root.querySelector("[data-f]").innerHTML = tex(M().formatPolyTex(current.f));
      root.querySelector("[data-g]").innerHTML = tex(M().formatPolyTex(current.g));
      root.querySelector("[data-q]").innerHTML = tex(M().formatPolyTex(step.q));
      root.querySelector("[data-r]").innerHTML = tex(M().formatPolyTex(step.r));
      root.querySelector("[data-invariant]").innerHTML = `${tex(M().formatPolyTex(current.f))} = (${tex(M().formatPolyTex(step.q))})(${tex(M().formatPolyTex(current.g))}) + (${tex(M().formatPolyTex(step.r))})`;
      root.querySelector("[data-q-strip]").innerHTML = M().coefficientStrip(step.q);
      root.querySelector("[data-r-strip]").innerHTML = M().coefficientStrip(step.r);
      const status = root.querySelector("[data-status]");
      status.className = `ch1-status ${done ? (divides ? "is-ok" : "is-bad") : "is-warn"}`;
      status.textContent = done ? (divides ? "整除成立" : "不整除") : "首项消去中";
      root.querySelector("[data-degree]").textContent = M().isZeroPoly(step.r) ? "余式为 0" : `deg r=${M().deg(step.r)}，deg g=${M().deg(current.g)}`;
      root.querySelector("[data-current-operation]").innerHTML = step.kind === "eliminate" ? `${tex(M().formatPolyTex(step.before))} − (${tex(M().formatPolyTex(step.term))})(${tex(M().formatPolyTex(current.g))}) = ${tex(M().formatPolyTex(step.r))}` : done ? "次数条件已经满足，算法停止。" : "从被除式开始。";
      root.querySelector("[data-ledger]").innerHTML = steps.map((s, i) => `<div class="${i === index ? "is-current" : ""}"><span>${i + 1}</span><p>${s.kind === "eliminate" ? `${tex(M().formatPolyTex(s.before))} → ${tex(M().formatPolyTex(s.r))}` : s.note}</p></div>`).join("");
      root.querySelector("[data-prev]").disabled = index === 0;
      root.querySelector("[data-next]").disabled = index === steps.length - 1;
    };
    root.querySelector("[data-prev]").addEventListener("click", () => { index = Math.max(0, index - 1); paint(); });
    root.querySelector("[data-next]").addEventListener("click", () => { index = Math.min(steps.length - 1, index + 1); paint(); });
    root.querySelector("[data-reset]").addEventListener("click", () => { index = 0; paint(); });
    root.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => { current = presets[button.dataset.preset]; index = 0; selectButtons(root, "[data-preset]", button); paint(); }));
    paint();
  }

  function interactive3(el, section) {
    lab(el, "除法阶梯", section.interactive.description,
      `<button type="button" data-prev>上一步</button><button type="button" data-next>下一步</button><button type="button" data-reset>重置</button><span class="ch1-control-separator"></span><button type="button" data-preset="default" class="is-active">非整除</button><button type="button" data-preset="divides">整除</button><button type="button" data-preset="fraction">分数系数</button>`,
      `<div class="ch1-metrics"><div class="ch1-metric"><span>示例</span><strong data-title></strong></div><div class="ch1-metric"><span>步骤</span><strong data-step></strong></div><div class="ch1-metric"><span>状态</span><strong data-status class="ch1-status"></strong></div></div>
       <div class="ch1-equation-grid"><div><span>f</span><strong data-f></strong></div><div><span>g</span><strong data-g></strong></div><div><span>q</span><strong data-q></strong></div><div><span>r</span><strong data-r></strong></div></div>
       <div class="ch1-callout"><strong>不变量 f=qg+r</strong><p data-invariant></p><p class="ch1-muted" data-degree></p><p data-current-operation></p></div>
       <div class="ch1-two-col"><div><h4>商的系数带</h4><div data-q-strip></div><h4>当前余式</h4><div data-r-strip></div><p class="ch1-muted" data-note></p></div><div><h4>步骤账本</h4><div class="ch1-ledger" data-ledger></div></div></div>`);
    mountDivision(el);
  }

  // §4 — extended Euclid and Bezout
  function mountEuclid(root) {
    const presets = {
      default: { f: M().poly([-1, 0, 0, 0, 1]), g: M().poly([-1, 0, 0, 1]), name: "gcd(x⁴−1,x³−1)" },
      coprime: { f: M().poly([1, 0, 1]), g: M().poly([1, 1]), name: "gcd(x²+1,x+1)" },
      shared: { f: M().poly([-2, 1, 2, -1]), g: M().poly([-1, 0, 1]), name: "含公共二次因式" },
    };
    let current = presets.default;
    let steps = M().extendedEuclidSteps(current.f, current.g);
    let index = 0;
    const doneStep = () => steps.at(-1);
    function paint() {
      steps = M().extendedEuclidSteps(current.f, current.g);
      index = Math.min(index, steps.length - 1);
      const step = steps[index];
      const final = doneStep();
      root.querySelector("[data-name]").textContent = current.name;
      root.querySelector("[data-step]").textContent = `${index + 1}/${steps.length}`;
      root.querySelector("[data-a]").innerHTML = tex(M().formatPolyTex(step.a || M().zeroPoly()));
      root.querySelector("[data-b]").innerHTML = tex(M().formatPolyTex(step.b || M().zeroPoly()));
      root.querySelector("[data-q]").innerHTML = step.q ? tex(M().formatPolyTex(step.q)) : "—";
      root.querySelector("[data-r]").innerHTML = step.remainder ? tex(M().formatPolyTex(step.remainder)) : "—";
      root.querySelector("[data-note]").textContent = step.note;
      root.querySelector("[data-gcd]").innerHTML = tex(M().formatPolyTex(final.d || final.a));
      root.querySelector("[data-s]").innerHTML = tex(M().formatPolyTex(final.s || M().zeroPoly()));
      root.querySelector("[data-t]").innerHTML = tex(M().formatPolyTex(final.t || M().zeroPoly()));
      const verify = M().polyAdd(M().polyMul(final.s, current.f), M().polyMul(final.t, current.g));
      root.querySelector("[data-verify]").innerHTML = `${tex(M().formatPolyTex(final.s))}·(${tex(M().formatPolyTex(current.f))}) + ${tex(M().formatPolyTex(final.t))}·(${tex(M().formatPolyTex(current.g))}) = ${tex(M().formatPolyTex(verify))}`;
      const coprime = M().polyEq(final.d, M().onePoly());
      const status = root.querySelector("[data-coprime]"); status.className = `ch1-status ${coprime ? "is-ok" : "is-warn"}`; status.textContent = coprime ? "互素" : "有非常数公共因式";
      root.querySelector("[data-ledger]").innerHTML = steps.map((s, i) => `<div class="${i === index ? "is-current" : ""}"><span>${i + 1}</span><p>${s.note}</p>${s.q ? `<small>q=${tex(M().formatPolyTex(s.q))}，r=${tex(M().formatPolyTex(s.remainder))}</small>` : ""}</div>`).join("");
      root.querySelector("[data-prev]").disabled = index === 0; root.querySelector("[data-next]").disabled = index === steps.length - 1;
    }
    root.querySelector("[data-prev]").addEventListener("click", () => { index = Math.max(0, index - 1); paint(); });
    root.querySelector("[data-next]").addEventListener("click", () => { index = Math.min(steps.length - 1, index + 1); paint(); });
    root.querySelector("[data-reset]").addEventListener("click", () => { index = 0; paint(); });
    root.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => { current = presets[button.dataset.preset]; index = 0; selectButtons(root, "[data-preset]", button); paint(); }));
    paint();
  }

  function interactive4(el, section) {
    lab(el, "辗转相除与倒着代回", section.interactive.description,
      `<button type="button" data-prev>上一步</button><button type="button" data-next>下一步</button><button type="button" data-reset>重置</button><span class="ch1-control-separator"></span><button type="button" data-preset="default" class="is-active">x⁴−1 与 x³−1</button><button type="button" data-preset="coprime">互素示例</button><button type="button" data-preset="shared">公共因式示例</button>`,
      `<div class="ch1-metrics"><div class="ch1-metric"><span>当前示例</span><strong data-name></strong></div><div class="ch1-metric"><span>步骤</span><strong data-step></strong></div><div class="ch1-metric"><span>结论</span><strong data-coprime class="ch1-status"></strong></div></div>
       <div class="ch1-equation-grid"><div><span>A</span><strong data-a></strong></div><div><span>B</span><strong data-b></strong></div><div><span>商 q</span><strong data-q></strong></div><div><span>余式 r</span><strong data-r></strong></div></div>
       <div class="ch1-two-col"><div><h4>辗转相除的每一步</h4><div class="ch1-ledger" data-ledger></div><p class="ch1-muted" data-note></p></div><div><h4>倒着代回</h4><div class="ch1-result-band"><div><span>首一 gcd</span><strong data-gcd></strong></div></div><div class="ch1-equation-grid"><div><span>s</span><strong data-s></strong></div><div><span>t</span><strong data-t></strong></div></div><div class="ch1-callout"><strong>代回验证</strong><p data-verify></p></div></div></div>`);
    mountEuclid(el);
  }

  window.defineChapter1Renderer("number-fields", { formal: renderFormal });
  window.defineChapter1Renderer("univariate-polynomials", { formal: renderFormal, interactive: interactive2 });
  window.defineChapter1Renderer("polynomial-divisibility", { formal: renderFormal, interactive: interactive3 });
  window.defineChapter1Renderer("gcd-polynomials", { formal: renderFormal, interactive: interactive4 });
})();


;/* visuals/ch1/section5-8-presentation.js */
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


;/* visuals/ch1/section9-11-presentation.js */
(() => {
  const M = () => window.Ch1Math;
  const tex = (source) => (window.texInline ? window.texInline(source) : source);
  const listen = (...args) => window.ch1Listen?.(...args);
  const observe = (...args) => window.ch1ObserveResize?.(...args);

  function formal(section, el, config) {
    window.renderChapter1Formal?.(el, section, config);
  }

  function integerDivisors(value) {
    const n = Math.abs(Math.trunc(value));
    if (n === 0) return [0];
    const result = [];
    for (let i = 1; i <= n; i++) if (n % i === 0) result.push(i);
    return result;
  }

  function rationalCandidates(poly) {
    const p = M().normalizePoly(poly);
    const constant = Math.abs(p[0].n);
    const leading = Math.abs(p[p.length - 1].n);
    const values = new Map();
    integerDivisors(constant).forEach((numerator) => {
      integerDivisors(leading).forEach((denominator) => {
        if (!denominator) return;
        [1, -1].forEach((sign) => {
          const candidate = M().R(sign * numerator, denominator);
          values.set(M().formatR(candidate), candidate);
        });
      });
    });
    return [...values.values()].sort(M().rCmp);
  }

  function mountRationalLab(root) {
    const examples = {
      root: {
        label: "2x³+x²−x−1",
        poly: M().polyFrom(["-1", "-1", "1", "2"]),
        note: "有理根定理给候选；每个候选仍需精确代入。",
      },
      eisenstein: {
        label: "x⁵+10x+5",
        poly: M().polyFrom(["5", "10", "0", "0", "0", "1"]),
        note: "取 p=5，满足艾森斯坦判别法的三个条件。",
      },
      quartic: {
        label: "x⁴+4",
        poly: M().polyFrom(["4", "0", "0", "0", "1"]),
        note: "没有有理根，但它仍可分成两个二次式；用来阻止错误推理。",
      },
    };
    let current = "root";
    let prime = 5;

    function eisenstein(poly, p) {
      const coefficients = poly.map((c) => c.d === 1 ? c.n : NaN);
      if (coefficients.some((c) => !Number.isInteger(c))) {
        return { applicable: false, checks: [false, false, false], message: "先清分母并本原化为整系数多项式。" };
      }
      const top = coefficients.length - 1;
      const c1 = coefficients[top] % p !== 0;
      const c2 = coefficients.slice(0, top).every((c) => c % p === 0);
      const c3 = coefficients[0] % (p * p) !== 0;
      return {
        applicable: c1 && c2 && c3,
        checks: [c1, c2, c3],
        message: c1 && c2 && c3
          ? `p=${p} 满足全部条件：在 ℚ[x] 中不可约。`
          : `p=${p} 未通过全部条件：这条判据没有给出结论，并不表示可约。`,
      };
    }

    function render() {
      const item = examples[current];
      const poly = item.poly;
      root.querySelector("[data-rational-poly]").innerHTML = tex(M().formatPolyTex(poly));
      root.querySelector("[data-rational-note]").textContent = item.note;
      const candidates = rationalCandidates(poly);
      root.querySelector("[data-candidate-count]").textContent = `候选 ${candidates.length} 个（约分、去重、含正负）`;
      root.querySelector("[data-candidates]").innerHTML = candidates.map((candidate) => {
        const value = M().evalPoly(poly, candidate);
        const isRoot = M().rIsZero(value);
        return `<article class="ch1-candidate ${isRoot ? "is-root" : ""}">
          <strong>${tex(M().formatRTex(candidate))}</strong>
          <span>${tex(`f(${M().formatRTex(candidate)})=${M().formatRTex(value)}`)}</span>
          <em>${isRoot ? "是根" : "不是根"}</em>
        </article>`;
      }).join("") || "<p>常数项为 0 时先提出 x，再对剩余多项式使用定理。</p>";

      const result = eisenstein(poly, prime);
      const labels = [
        `${prime} 不整除首项系数`,
        `${prime} 整除其余所有系数（缺项 0 也计入）`,
        `${prime ** 2} 不整除常数项`,
      ];
      root.querySelector("[data-eisenstein-checks]").innerHTML = labels.map((label, index) => `
        <div class="ch1-check-row ${result.checks[index] ? "is-ok" : "is-bad"}">
          <span>${result.checks[index] ? "✓" : "×"}</span><p>${label}</p>
        </div>`).join("");
      const status = root.querySelector("[data-eisenstein-status]");
      status.textContent = result.message;
      status.className = `ch1-status ${result.applicable ? "is-ok" : "is-warn"}`;
      root.querySelector("[data-prime-value]").textContent = String(prime);
      root.querySelectorAll("[data-rational-example]").forEach((button) => button.classList.toggle("is-active", button.dataset.rationalExample === current));
      root.querySelectorAll("[data-prime]").forEach((button) => button.classList.toggle("is-active", Number(button.dataset.prime) === prime));
    }

    root.querySelectorAll("[data-rational-example]").forEach((button) => listen(button, "click", () => {
      current = button.dataset.rationalExample;
      render();
    }));
    root.querySelectorAll("[data-prime]").forEach((button) => listen(button, "click", () => {
      prime = Number(button.dataset.prime);
      render();
    }));
    render();
  }

  function mountExponentLattice(root) {
    const baseTerms = [
      { i: 3, j: 0, c: 1, label: "x³" },
      { i: 2, j: 1, c: 2, label: "2x²y" },
      { i: 1, j: 2, c: -1, label: "−xy²" },
      { i: 0, j: 3, c: 4, label: "4y³" },
      { i: 1, j: 0, c: 1, label: "x" },
      { i: 0, j: 0, c: -1, label: "−1" },
    ];
    const state = { layer: "all", selected: { i: 2, j: 1 }, first: { i: 2, j: 1 }, second: { i: 1, j: 0 }, mode: "support" };
    const canvas = root.querySelector("canvas");
    let lattice = null;

    function termAt(i, j) {
      return baseTerms.find((term) => term.i === i && term.j === j) || null;
    }

    function render() {
      root.querySelectorAll("[data-lattice-mode]").forEach((button) => button.classList.toggle("is-active", button.dataset.latticeMode === state.mode));
      root.querySelectorAll("[data-layer]").forEach((button) => button.classList.toggle("is-active", button.dataset.layer === state.layer));
      if (state.mode === "support") {
        const terms = baseTerms
          .filter((term) => state.layer === "all" || term.i + term.j === Number(state.layer))
          .map((term) => ({ ...term, active: term.i === state.selected.i && term.j === state.selected.j }));
        lattice = M().drawLattice(canvas, terms, { maxI: 4, maxJ: 4 });
        const selected = termAt(state.selected.i, state.selected.j);
        root.querySelector("[data-lattice-readout]").innerHTML = selected
          ? `格点 ${tex(`(${selected.i},${selected.j})`)} 表示 ${tex(selected.label.replace("−", "-"))}；该项总次数 ${selected.i + selected.j}。`
          : `格点 ${tex(`(${state.selected.i},${state.selected.j})`)} 的系数为 0，是支撑之外的位置。`;
      } else {
        const sum = { i: state.first.i + state.second.i, j: state.first.j + state.second.j };
        lattice = M().drawLattice(canvas, [
          { ...state.first, label: `α=(${state.first.i},${state.first.j})`, color: M().getPalette().v1 },
          { ...state.second, label: `β=(${state.second.i},${state.second.j})`, color: M().getPalette().v2 },
          { ...sum, label: `α+β=(${sum.i},${sum.j})`, active: true, color: M().getPalette().image },
        ], { maxI: 5, maxJ: 5 });
        root.querySelector("[data-lattice-readout]").innerHTML =
          `${tex(`(${state.first.i},${state.first.j})+(${state.second.i},${state.second.j})=(${sum.i},${sum.j})`)}，对应单项式指数逐坐标相加。`;
      }
      root.querySelector("[data-layers]").innerHTML = [0, 1, 2, 3].map((degree) => {
        const terms = baseTerms.filter((term) => term.i + term.j === degree);
        return `<article class="ch1-compare-card"><strong>f${degree}</strong><p>${terms.length ? terms.map((term) => term.label).join(" + ") : "0"}</p></article>`;
      }).join("");
      root.querySelector("[data-degree-summary]").textContent = "deg f=3，degₓ f=3，degᵧ f=3；这些三个数字碰巧相同，但定义不同。";
      root.querySelector("[data-product-coefficient]").innerHTML =
        `${tex("[x^3y]f(x-y)")}：${tex("2x^2y\\cdot x")} 贡献 2，${tex("x^3\\cdot(-y)")} 贡献 −1，合计 1。`;
    }

    listen(canvas, "click", (event) => {
      const rect = canvas.getBoundingClientRect();
      const point = lattice?.hitTest(event.clientX - rect.left, event.clientY - rect.top);
      if (!point) return;
      state.selected = { i: point.i, j: point.j };
      state.mode = "support";
      render();
    });
    root.querySelectorAll("[data-lattice-mode]").forEach((button) => listen(button, "click", () => {
      state.mode = button.dataset.latticeMode;
      render();
    }));
    root.querySelectorAll("[data-layer]").forEach((button) => listen(button, "click", () => {
      state.layer = button.dataset.layer;
      state.mode = "support";
      render();
    }));
    root.querySelectorAll("[data-first]").forEach((button) => listen(button, "click", () => {
      state.first = JSON.parse(button.dataset.first);
      state.mode = "multiply";
      render();
    }));
    root.querySelectorAll("[data-second]").forEach((button) => listen(button, "click", () => {
      state.second = JSON.parse(button.dataset.second);
      state.mode = "multiply";
      render();
    }));
    observe(root.querySelector(".ch1-stage"), render);
    render();
  }

  function monomialKey(exp) {
    return exp.join(",");
  }

  function canonical(expression) {
    const map = new Map();
    expression.forEach(({ c, e }) => {
      const key = monomialKey(e);
      map.set(key, (map.get(key) || 0) + c);
    });
    return [...map.entries()]
      .filter(([, coefficient]) => coefficient !== 0)
      .map(([key, c]) => ({ c, e: key.split(",").map(Number) }))
      .sort((a, b) => {
        const da = a.e.reduce((sum, value) => sum + value, 0);
        const db = b.e.reduce((sum, value) => sum + value, 0);
        if (da !== db) return db - da;
        for (let i = 0; i < a.e.length; i++) if (a.e[i] !== b.e[i]) return b.e[i] - a.e[i];
        return 0;
      });
  }

  function permute(expression, permutation) {
    return canonical(expression.map(({ c, e }) => ({ c, e: permutation.map((source) => e[source]) })));
  }

  function expressionEquals(a, b) {
    const A = canonical(a);
    const B = canonical(b);
    return A.length === B.length && A.every((term, index) => term.c === B[index].c && monomialKey(term.e) === monomialKey(B[index].e));
  }

  function expressionTex(expression) {
    const vars = ["x", "y", "z"];
    const terms = canonical(expression);
    if (!terms.length) return "0";
    return terms.map((term, index) => {
      const absolute = Math.abs(term.c);
      const factors = term.e.map((power, i) => {
        if (!power) return "";
        return power === 1 ? vars[i] : `${vars[i]}^{${power}}`;
      }).join("");
      const body = factors ? `${absolute === 1 ? "" : absolute}${factors}` : String(absolute);
      const sign = term.c < 0 ? "-" : index ? "+" : "";
      return `${sign}${body}`;
    }).join("");
  }

  function mountSymmetry(root) {
    const expressions = {
      squares: {
        label: "x²+y²+z²",
        terms: [{ c: 1, e: [2, 0, 0] }, { c: 1, e: [0, 2, 0] }, { c: 1, e: [0, 0, 2] }],
      },
      orbit: {
        label: "Σsym x²y",
        terms: [
          [2,1,0],[2,0,1],[1,2,0],[0,2,1],[1,0,2],[0,1,2],
        ].map((e) => ({ c: 1, e })),
      },
      nonsym: {
        label: "x²+y",
        terms: [{ c: 1, e: [2,0,0] }, { c: 1, e: [0,1,0] }],
      },
      cyclic: {
        label: "x²y+y²z+z²x",
        terms: [{ c: 1, e: [2,1,0] }, { c: 1, e: [0,2,1] }, { c: 1, e: [1,0,2] }],
      },
    };
    const state = { current: "squares", permutation: [0,1,2], rewrite: "squares", step: 0 };
    const rewriteSteps = {
      squares: [
        { title: "目标", formula: "x^2+y^2+z^2" },
        { title: "展开 σ₁²", formula: "\\sigma_1^2=x^2+y^2+z^2+2\\sigma_2" },
        { title: "移项", formula: "x^2+y^2+z^2=\\sigma_1^2-2\\sigma_2" },
      ],
      orbit: [
        { title: "目标轨道和", formula: "\\sum_{sym}x^2y" },
        { title: "展开 σ₁σ₂", formula: "\\sigma_1\\sigma_2=\\sum_{sym}x^2y+3xyz" },
        { title: "识别 σ₃", formula: "\\sigma_1\\sigma_2=\\sum_{sym}x^2y+3\\sigma_3" },
        { title: "移项", formula: "\\sum_{sym}x^2y=\\sigma_1\\sigma_2-3\\sigma_3" },
      ],
    };

    function composePermutation(next) {
      state.permutation = next.map((source) => state.permutation[source]);
    }

    function render() {
      const item = expressions[state.current];
      const transformed = permute(item.terms, state.permutation);
      const unchanged = expressionEquals(item.terms, transformed);
      root.querySelector("[data-sym-before]").innerHTML = tex(expressionTex(item.terms));
      root.querySelector("[data-sym-after]").innerHTML = tex(expressionTex(transformed));
      root.querySelector("[data-permutation]").textContent = `当前变量顺序：${state.permutation.map((index) => ["x","y","z"][index]).join("，")}`;
      const status = root.querySelector("[data-sym-status]");
      status.textContent = unchanged ? "这次置换后保持不变" : "这次置换后改变";
      status.className = `ch1-status ${unchanged ? "is-ok" : "is-bad"}`;
      const allSymmetric = [[1,0,2],[0,2,1]].every((permutation) => expressionEquals(item.terms, permute(item.terms, permutation)));
      root.querySelector("[data-global-status]").textContent =
        state.current === "cyclic"
          ? "三循环保持不变，但换位 x↔y 会改变：循环对称不等于全对称。"
          : allSymmetric
            ? "通过生成换位检查：全对称。"
            : "存在换位使表达式改变：不是全对称。";
      root.querySelectorAll("[data-sym-expression]").forEach((button) => button.classList.toggle("is-active", button.dataset.symExpression === state.current));

      const steps = rewriteSteps[state.rewrite];
      state.step = Math.min(state.step, steps.length - 1);
      root.querySelector("[data-rewrite-step]").textContent = `${state.step + 1} / ${steps.length}`;
      root.querySelector("[data-rewrite-title]").textContent = steps[state.step].title;
      root.querySelector("[data-rewrite-formula]").innerHTML = tex(steps[state.step].formula);
      root.querySelector("[data-rewrite-prev]").disabled = state.step === 0;
      root.querySelector("[data-rewrite-next]").disabled = state.step === steps.length - 1;
      root.querySelectorAll("[data-rewrite-kind]").forEach((button) => button.classList.toggle("is-active", button.dataset.rewriteKind === state.rewrite));
      root.querySelector("[data-orbit]").innerHTML = expressions.orbit.terms.map((term) => `<span>${tex(expressionTex([term]))}</span>`).join("");
    }

    root.querySelectorAll("[data-sym-expression]").forEach((button) => listen(button, "click", () => {
      state.current = button.dataset.symExpression;
      state.permutation = [0,1,2];
      render();
    }));
    listen(root.querySelector("[data-swap-xy]"), "click", () => {
      composePermutation([1,0,2]);
      render();
    });
    listen(root.querySelector("[data-cycle]"), "click", () => {
      composePermutation([1,2,0]);
      render();
    });
    listen(root.querySelector("[data-permutation-reset]"), "click", () => {
      state.permutation = [0,1,2];
      render();
    });
    root.querySelectorAll("[data-rewrite-kind]").forEach((button) => listen(button, "click", () => {
      state.rewrite = button.dataset.rewriteKind;
      state.step = 0;
      render();
    }));
    listen(root.querySelector("[data-rewrite-prev]"), "click", () => {
      state.step -= 1;
      render();
    });
    listen(root.querySelector("[data-rewrite-next]"), "click", () => {
      state.step += 1;
      render();
    });
    listen(root.querySelector("[data-rewrite-reset]"), "click", () => {
      state.step = 0;
      render();
    });
    render();
  }

  function formal9(el, section) {
    formal(section, el, {
      title: "从有理系数到精确整数判据",
      formula: "f=\\operatorname{cont}(f)f^*,\\qquad \\gcd(\\text{coefficients of }f^*)=1",
      details: [
        { title: "清分母与本原化", html: "先乘最小公倍数得到整系数，再提出系数最大公因数；剩余本原部分承载真正的分解问题。" },
        { title: "有理根候选", html: `既约根 ${tex("p/q")} 必满足 ${tex("p\\mid a_0,q\\mid a_n")}；这是候选条件，不是自动判根。` },
        { title: "艾森斯坦判别法", html: "素数 p 不整除首项，整除其余所有系数，且 p² 不整除常数项。" },
        { title: "逻辑方向", html: "有理根和艾森斯坦判别法都是工具。判据失败应写“未得到结论”，不能反写成“可约”。" },
      ],
      cards: [
        { kicker: "候选", title: "约分、去重、含正负", html: "筛选器显示每个候选的精确代值。" },
        { kicker: "素数", title: "失败定位到具体条件", html: "切换 p 后逐行说明哪一门通过或失败。" },
        { kicker: "反例", title: "无有理根未必不可约", html: "x⁴+4 没有有理根，却能分成两个二次因式。" },
      ],
    });
  }

  function formal10(el, section) {
    formal(section, el, {
      title: "指数格点与齐次分层",
      formula: "x^\\alpha x^\\beta=x^{\\alpha+\\beta},\\qquad |\\alpha|=\\sum_i\\alpha_i",
      details: [
        { title: "支撑", html: "非零系数对应的指数格点集合就是多项式的支撑；缺项不会改变格点坐标系。" },
        { title: "三种次数", html: "degₓ、degᵧ 分别取单个坐标最大值；总次数逐项求指数和再取最大。" },
        { title: "齐次层", html: `二元情形 ${tex("i+j=d")} 是一条斜线；同一斜线上的项组成 ${tex("f_d")}。` },
        { title: "乘法聚合", html: "指数向量相加给出落点，所有落到同一格点的系数再相加。" },
      ],
      cards: [
        { kicker: "点击", title: "格点直接读取单项式", html: "点击空格点也会明确显示系数为 0。" },
        { kicker: "过滤", title: "按总次数看齐次层", html: "0、1、2、3 层保持同一坐标系，不重新排列。" },
        { kicker: "配对", title: "指定系数追踪来源", html: "x³y 的系数同时接收 x·2x²y 与 −y·x³。" },
      ],
    });
  }

  function formal11(el, section) {
    formal(section, el, {
      title: "置换不变性与基本对称构件",
      formula: "\\sigma_1=x+y+z,\\quad\\sigma_2=xy+xz+yz,\\quad\\sigma_3=xyz",
      details: [
        { title: "规范比较", html: "置换后先按统一单项式次序合并同类项，再比较；不能依赖字符串顺序。" },
        { title: "轨道和", html: "一个单项式的全部置换像构成轨道；任何置换只重排轨道，因此等系数轨道和对称。" },
        { title: "基本定理的算法", html: "用 σ 的乘积匹配当前最高单项式并相减；规定次序下最高项严格下降，最终终止。" },
        { title: "根与系数的关系", html: "把变量换成一元多项式的根，σ₁、σ₂、… 正好给出带交替符号的系数。" },
      ],
      cards: [
        { kicker: "区分", title: "循环对称不等于全对称", html: "三循环保持不变仍可能在一个换位下改变。" },
        { kicker: "轨道", title: "x²y 产生六个不同项", html: "页面列出并检查不重不漏。" },
        { kicker: "改写", title: "一步一步消去最高项", html: "平方和与六项轨道和各有完整推导。" },
      ],
    });
  }

  function interactive9(el) {
    el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
      <div class="ch1-lab-head"><h3>有理根筛选器与素数透镜</h3><p>候选根显示精确代值；艾森斯坦判别法的条件不满足时只写“未判定”，绝不误报“可约”。</p></div>
      <div class="ch1-control-groups">
        <div class="ch1-controls">
          <button type="button" class="is-active" data-rational-example="root">2x³+x²−x−1</button>
          <button type="button" data-rational-example="eisenstein">x⁵+10x+5</button>
          <button type="button" data-rational-example="quartic">x⁴+4 反例</button>
        </div>
        <div class="ch1-controls">
          <span>素数 p：</span>
          <button type="button" data-prime="2">2</button>
          <button type="button" data-prime="3">3</button>
          <button type="button" class="is-active" data-prime="5">5</button>
        </div>
      </div>
      <div class="ch1-readout">
        <div>f = <strong data-rational-poly></strong></div>
        <p class="ch1-muted" data-rational-note></p>
      </div>
      <div class="ch1-lab-grid">
        <section class="ch1-panel">
          <h4>有理根候选</h4>
          <p class="ch1-muted" data-candidate-count></p>
          <div class="ch1-candidate-grid" data-candidates></div>
        </section>
        <section class="ch1-panel">
          <h4>艾森斯坦判别法：p=<span data-prime-value></span></h4>
          <div class="ch1-check-list" data-eisenstein-checks></div>
          <div><span data-eisenstein-status></span></div>
        </section>
      </div>
    </div>`;
    mountRationalLab(el);
  }

  function interactive10(el) {
    el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
      <div class="ch1-lab-head"><h3>指数格点与乘法合成</h3><p>点击格点读取项；过滤齐次层；切到乘法模式看指数向量的和点。</p></div>
      <div class="ch1-controls">
        <button type="button" class="is-active" data-lattice-mode="support">支撑与齐次层</button>
        <button type="button" data-lattice-mode="multiply">乘法合成</button>
        <button type="button" class="is-active" data-layer="all">全部层</button>
        <button type="button" data-layer="0">d=0</button>
        <button type="button" data-layer="1">d=1</button>
        <button type="button" data-layer="2">d=2</button>
        <button type="button" data-layer="3">d=3</button>
      </div>
      <div class="ch1-lab-grid">
        <div class="ch1-stage"><canvas aria-label="二元多项式指数格点"></canvas></div>
        <div class="ch1-panel">
          <div class="ch1-readout" data-lattice-readout></div>
          <p class="ch1-muted" data-degree-summary></p>
          <div class="ch1-compare" data-layers></div>
          <div class="ch1-controls">
            <span>第一指数：</span>
            <button type="button" data-first='{"i":2,"j":1}'>(2,1)</button>
            <button type="button" data-first='{"i":1,"j":2}'>(1,2)</button>
            <span>第二指数：</span>
            <button type="button" data-second='{"i":1,"j":0}'>(1,0)</button>
            <button type="button" data-second='{"i":0,"j":1}'>(0,1)</button>
          </div>
          <div class="ch1-readout" data-product-coefficient></div>
        </div>
      </div>
    </div>`;
    mountExponentLattice(el);
  }

  function interactive11(el) {
    el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
      <div class="ch1-lab-head"><h3>置换轨道与 σ 改写</h3><p>表达式先按指数向量规范化再比较。三循环与换位分开测试，避免把循环对称误当全对称。</p></div>
      <div class="ch1-controls">
        <button type="button" class="is-active" data-sym-expression="squares">x²+y²+z²</button>
        <button type="button" data-sym-expression="orbit">Σsym x²y</button>
        <button type="button" data-sym-expression="cyclic">循环对称反例</button>
        <button type="button" data-sym-expression="nonsym">x²+y</button>
      </div>
      <div class="ch1-controls">
        <button type="button" data-swap-xy>换位 x↔y</button>
        <button type="button" data-cycle>三循环 x→y→z→x</button>
        <button type="button" data-permutation-reset>恢复变量顺序</button>
      </div>
      <div class="ch1-lab-grid">
        <section class="ch1-panel">
          <div class="ch1-readout">
            <div>原式：<strong data-sym-before></strong></div>
            <div>置换后：<strong data-sym-after></strong></div>
            <div class="ch1-muted" data-permutation></div>
            <div><span data-sym-status></span></div>
            <p data-global-status></p>
          </div>
          <h4>x²y 的完整轨道</h4>
          <div class="ch1-orbit" data-orbit></div>
        </section>
        <section class="ch1-panel">
          <div class="ch1-controls">
            <button type="button" class="is-active" data-rewrite-kind="squares">平方和改写</button>
            <button type="button" data-rewrite-kind="orbit">六项轨道和改写</button>
          </div>
          <div class="ch1-rewrite-stage">
            <span>步骤 <strong data-rewrite-step></strong></span>
            <h4 data-rewrite-title></h4>
            <div data-rewrite-formula></div>
          </div>
          <div class="ch1-controls">
            <button type="button" data-rewrite-prev>上一步</button>
            <button type="button" data-rewrite-next>下一步</button>
            <button type="button" data-rewrite-reset>重置</button>
          </div>
        </section>
      </div>
    </div>`;
    mountSymmetry(el);
  }

  window.defineChapter1Renderer("rational-polynomials", { formal: formal9, interactive: interactive9 });
  window.defineChapter1Renderer("multivariate-polynomials", { formal: formal10, interactive: interactive10 });
  window.defineChapter1Renderer("symmetric-polynomials", { formal: formal11, interactive: interactive11 });
})();

;/* visuals/ch1/layout-rebalance.js */
/* Chapter 1 layout rebalance: a focused multivariate workspace with no dead column. */
(() => {
  "use strict";

  const M = () => window.Ch1Math;
  const tex = (source) => (window.texInline ? window.texInline(source) : source);
  const listen = (...args) => window.ch1Listen?.(...args);
  const observe = (...args) => window.ch1ObserveResize?.(...args);

  const baseTerms = [
    { i: 3, j: 0, c: 1, plain: "x³", math: "x^3" },
    { i: 2, j: 1, c: 2, plain: "2x²y", math: "2x^2y" },
    { i: 1, j: 2, c: -1, plain: "−xy²", math: "-xy^2" },
    { i: 0, j: 3, c: 4, plain: "4y³", math: "4y^3" },
    { i: 1, j: 0, c: 1, plain: "x", math: "x" },
    { i: 0, j: 0, c: -1, plain: "−1", math: "-1" },
  ];

  function termAt(i, j) {
    return baseTerms.find((term) => term.i === i && term.j === j) || null;
  }

  function layerFormula(degree) {
    const terms = baseTerms.filter((term) => term.i + term.j === degree);
    if (!terms.length) return "0";
    return terms.map((term, index) => {
      const body = term.math.startsWith("-") ? term.math.slice(1) : term.math;
      if (index === 0) return term.math;
      return `${term.c < 0 ? "-" : "+"}${body}`;
    }).join("");
  }

  function monomial(exp) {
    const x = exp.i === 0 ? "" : exp.i === 1 ? "x" : `x^{${exp.i}}`;
    const y = exp.j === 0 ? "" : exp.j === 1 ? "y" : `y^{${exp.j}}`;
    return x || y ? `${x}${y}` : "1";
  }

  function mount(root) {
    const state = {
      mode: "support",
      layer: "all",
      selected: { i: 2, j: 1 },
      first: { i: 2, j: 1 },
      second: { i: 1, j: 0 },
    };
    const canvas = root.querySelector("canvas");
    let lattice = null;
    let gate = null;

    function setActive(selector, value, key) {
      root.querySelectorAll(selector).forEach((button) => {
        const active = button.dataset[key] === String(value);
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    }

    function renderSupport() {
      const terms = baseTerms
        .filter((term) => state.layer === "all" || term.i + term.j === Number(state.layer))
        .map((term) => ({
          i: term.i,
          j: term.j,
          c: term.c,
          label: term.plain,
          active: term.i === state.selected.i && term.j === state.selected.j,
        }));
      lattice = M().drawLattice(canvas, terms, { maxI: 4, maxJ: 4 });
      drawLexOrder(terms);
      const selected = termAt(state.selected.i, state.selected.j);
      const readout = root.querySelector("[data-lattice-readout]");
      if (selected) {
        const rank = lexOrder().indexOf(selected) + 1;
        readout.innerHTML = `
          <span>当前格点 ${tex(`(${selected.i},${selected.j})`)}</span>
          <strong>${tex(selected.math)}</strong>
          <p>${tex("x")} 的指数是 ${selected.i}，${tex("y")} 的指数是 ${selected.j}，所以总次数是 ${selected.i + selected.j}。按字典序排第 ${rank}${rank === 1 ? "，是首项" : ""}。</p>`;
      } else {
        readout.innerHTML = `
          <span>当前格点 ${tex(`(${state.selected.i},${state.selected.j})`)}</span>
          <strong>系数为 0</strong>
          <p>这个位置属于指数空间，但不在当前多项式的支撑中。</p>`;
      }
      root.querySelector("[data-degree-summary]").innerHTML =
        `当前多项式的总次数、${tex("x")} 次数和 ${tex("y")} 次数都等于 3；数值相同只是巧合，定义并不相同。`;
    }

    // lexicographic order (x before y): compare the x exponent, then the y exponent
    const lexOrder = () => baseTerms.slice().sort((p, q) => q.i - p.i || q.j - p.j);

    // number every visible term by its place in the lexicographic order; the first one is the leading term
    function drawLexOrder(terms) {
      const ctx = canvas.getContext("2d");
      const pal = M().getPalette();
      const order = lexOrder();
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      terms.forEach((term) => {
        const k = order.findIndex((t) => t.i === term.i && t.j === term.j) + 1;
        const x = lattice.pad + term.i * lattice.sx - 14;
        const y = lattice.height - lattice.pad - term.j * lattice.sy + 14;
        ctx.beginPath();
        ctx.fillStyle = pal.paper;
        ctx.strokeStyle = k === 1 ? pal.accent : pal.axis;
        ctx.lineWidth = k === 1 ? 1.6 : 1;
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = k === 1 ? pal.accent : pal.muted;
        ctx.font = "600 11px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
        ctx.fillText(String(k), x, y + 0.5);
        if (k === 1) {
          ctx.textAlign = "left";
          ctx.font = "600 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
          ctx.lineWidth = 4; ctx.strokeStyle = pal.paper;
          ctx.strokeText("首项", x + 22, y + 2);
          ctx.fillText("首项", x + 22, y + 2);
          ctx.textAlign = "center";
        }
      });
      ctx.restore();
    }

    function arrow(ctx, from, to, color, { width = 2.4, dashed = false, alpha = 1 } = {}) {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const len = Math.hypot(dx, dy);
      if (len < 1) return;
      const ux = dx / len;
      const uy = dy / len;
      const tip = { x: to.x - ux * 7, y: to.y - uy * 7 };
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width;
      if (dashed) ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(tip.x - ux * 3, tip.y - uy * 3); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(tip.x + ux * 7, tip.y + uy * 7);
      ctx.lineTo(tip.x - ux * 3 - uy * 4.5, tip.y - uy * 3 + ux * 4.5);
      ctx.lineTo(tip.x - ux * 3 + uy * 4.5, tip.y - uy * 3 - ux * 4.5);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    /*
     * x^a y^b · x^c y^d = x^{a+c} y^{b+d}: draw α from the origin, then β from the tip of α
     * (head to tail), landing on the product point α+β; β's ghost stays at the origin.
     */
    function renderMultiply() {
      const sum = { i: state.first.i + state.second.i, j: state.first.j + state.second.j };
      const pal = M().getPalette();
      lattice = M().drawLattice(canvas, [
        { ...state.first, color: pal.v1 },
        { ...sum, active: true, color: pal.image },
      ], { maxI: 5, maxJ: 5, layers: [sum.i + sum.j] });
      const ctx = canvas.getContext("2d");
      const at = (e) => ({ x: lattice.pad + e.i * lattice.sx, y: lattice.height - lattice.pad - e.j * lattice.sy });
      const o = at({ i: 0, j: 0 });
      const a = at(state.first);
      const ghost = at(state.second);
      const tipP = at(sum);
      arrow(ctx, o, ghost, pal.v2, { dashed: true, alpha: 0.35 });
      arrow(ctx, o, a, pal.v1);
      arrow(ctx, a, tipP, pal.v2);
      ctx.save();
      ctx.globalAlpha = 0.18; ctx.fillStyle = pal.image;
      ctx.beginPath(); ctx.arc(tipP.x, tipP.y, 15, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.font = "italic 600 14px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      ctx.lineWidth = 4; ctx.strokeStyle = pal.paper;
      const put = (text, p, color, dx, dy, align = "left") => { ctx.textAlign = align; ctx.fillStyle = color; ctx.strokeText(text, p.x + dx, p.y + dy); ctx.fillText(text, p.x + dx, p.y + dy); };
      const midA = { x: (o.x + a.x) / 2, y: (o.y + a.y) / 2 };
      const midB = { x: (a.x + tipP.x) / 2, y: (a.y + tipP.y) / 2 };
      put(`α=(${state.first.i},${state.first.j})`, midA, pal.v1, -10, -8, "right");
      put(`β=(${state.second.i},${state.second.j})`, midB, pal.v2, state.second.j ? 10 : 0, state.second.j ? 4 : 22, state.second.j ? "left" : "center");
      put(`α+β=(${sum.i},${sum.j})`, tipP, pal.image, 12, -12);
      ctx.font = "600 12.5px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      const layerEnd = { x: lattice.pad + Math.min(sum.i + sum.j, 5) * lattice.sx, y: lattice.height - lattice.pad - Math.max(0, sum.i + sum.j - 5) * lattice.sy };
      put(`i+j=${sum.i + sum.j}`, layerEnd, pal.subspace, 6, -6);
      ctx.restore();
      gate?.acted();
      root.querySelector("[data-lattice-readout]").innerHTML = `
        <span>指数向量相加</span>
        <strong>${tex(`(${state.first.i},${state.first.j})+(${state.second.i},${state.second.j})=(${sum.i},${sum.j})`)}</strong>
        <p>乘积格点的两个坐标，分别由 ${tex("x")} 指数和 ${tex("y")} 指数相加得到。</p>`;
      root.querySelector("[data-degree-summary]").textContent =
        "在指数空间中，单项式乘法就是向量加法；系数相乘，指数逐坐标相加。";
      root.querySelector("[data-product-result]").innerHTML = `
        <span>当前乘积</span>
        <strong>${tex(`${monomial(state.first)}\\cdot{}${monomial(state.second)}=${monomial(sum)}`)}</strong>
        <p>${tex(`(${state.first.i},${state.first.j})+(${state.second.i},${state.second.j})=(${sum.i},${sum.j})`)}，结果落在高亮格点。</p>`;
    }

    function renderLayers() {
      root.querySelector("[data-layers]").innerHTML = [0, 1, 2, 3].map((degree) => `
        <article class="ch1-multivariate-layer-card ${state.layer === String(degree) ? "is-active" : ""}">
          <span>总次数 ${degree}</span>
          <strong>${tex(`f_${degree}=${layerFormula(degree)}`)}</strong>
        </article>`).join("");
    }

    function render() {
      setActive("[data-lattice-mode]", state.mode, "latticeMode");
      setActive("[data-layer]", state.layer, "layer");
      setActive("[data-first]", JSON.stringify(state.first), "first");
      setActive("[data-second]", JSON.stringify(state.second), "second");
      root.querySelector("[data-support-module]").hidden = state.mode !== "support";
      root.querySelector("[data-multiply-module]").hidden = state.mode !== "multiply";
      if (state.mode === "support") renderSupport();
      else renderMultiply();
      renderLayers();
    }

    listen(canvas, "click", (event) => {
      if (state.mode !== "support") return;
      const rect = canvas.getBoundingClientRect();
      const point = lattice?.hitTest(event.clientX - rect.left, event.clientY - rect.top);
      if (!point) return;
      state.selected = { i: point.i, j: point.j };
      render();
    });

    root.querySelectorAll("[data-lattice-mode]").forEach((button) => listen(button, "click", () => {
      state.mode = button.dataset.latticeMode;
      render();
    }));
    root.querySelectorAll("[data-layer]").forEach((button) => listen(button, "click", () => {
      state.layer = button.dataset.layer;
      state.mode = "support";
      render();
    }));
    root.querySelectorAll("[data-first]").forEach((button) => listen(button, "click", () => {
      state.first = JSON.parse(button.dataset.first);
      state.mode = "multiply";
      render();
    }));
    root.querySelectorAll("[data-second]").forEach((button) => listen(button, "click", () => {
      state.second = JSON.parse(button.dataset.second);
      state.mode = "multiply";
      render();
    }));

    // multiplication mode waits for a prediction; the support view stays free to explore
    const lockables = [...root.querySelectorAll('[data-lattice-mode="multiply"], [data-first], [data-second]')];
    gate = window.LAPredictGate?.mount(root.querySelector("[data-lattice-gate]"), {
      root,
      manual: true,
      key: "visuals/ch1/layout-rebalance.js#exponent-add",
      question: `${tex("x^2y")} 在格点 ${tex("(2,1)")}，${tex("x")} 在格点 ${tex("(1,0)")}。乘积 ${tex("x^2y\\cdot x")} 落在哪个格点，总次数是多少？`,
      options: [
        [`${tex("(3,1)")}，总次数 4`, true, ""],
        [`${tex("(2,0)")}，总次数 2`, false, `指数要相加：${tex("x^2\\cdot x=x^3")}，不是 ${tex("x^{2\\cdot1}")}。`],
        [`${tex("(3,1)")}，总次数仍是 3`, false, "总次数是两个指数之和 3+1=4，乘上一次项后升高 1。"],
        [`${tex("(2,1)")}，乘 ${tex("x")} 不改变位置`, false, `${tex("x^2y\\cdot x=x^3y")}，x 的指数从 2 变成 3。`],
      ],
      right: `✓ 单项式相乘，指数向量相加：${tex("(2,1)+(1,0)=(3,1)")}，首尾相接正好到达乘积格点；总次数也相加，${tex("3+1=4")}，乘积落在斜线 ${tex("i+j=4")} 上。`,
      onPick: () => lockables.forEach((node) => { node.disabled = false; }),
    });
    if (gate) lockables.forEach((node) => { node.disabled = true; });
    observe(root.querySelector(".ch1-multivariate-stage"), render);
    render();
  }

  function interactive(el, section) {
    el.innerHTML = `<h2>交互实验</h2>
      <div class="ch1-lab">
        <div class="ch1-lab-head">
          <h3>指数格点：先看位置，再看分层与乘法</h3>
          <p>${section.interactive.description}</p>
        </div>
        <div data-lattice-gate></div>
        <div class="ch1-controls" role="group" aria-label="选择指数格点观察模式">
          <button type="button" class="is-active" data-lattice-mode="support" aria-pressed="true">支撑与齐次层</button>
          <button type="button" data-lattice-mode="multiply" aria-pressed="false">乘法合成</button>
        </div>
        <div class="ch1-multivariate-workspace">
          <div class="ch1-multivariate-primary">
            <div class="ch1-stage ch1-multivariate-stage"><canvas aria-label="二元多项式指数格点"></canvas></div>
            <aside class="ch1-multivariate-inspector">
              <div class="ch1-multivariate-readout" data-lattice-readout></div>
              <div class="ch1-multivariate-axis-key">
                <span>怎样读这张图</span>
                <div class="ch1-axis-key-grid">
                  <div><strong>横坐标 ${tex("i")}</strong><small>${tex("x")} 的指数</small></div>
                  <div><strong>纵坐标 ${tex("j")}</strong><small>${tex("y")} 的指数</small></div>
                  <div><strong>斜线 ${tex("i+j=d")}</strong><small>同一齐次层</small></div>
                </div>
              </div>
              <p class="ch1-multivariate-summary" data-degree-summary></p>
            </aside>
          </div>

          <section class="ch1-multivariate-module" data-support-module>
            <header class="ch1-multivariate-module-head">
              <h4>按总次数查看齐次分层</h4>
              <p>选择一个 ${tex("d")}，只保留位于斜线 ${tex("i+j=d")} 上的项；下方同步列出完整齐次分解。</p>
            </header>
            <div class="ch1-controls" role="group" aria-label="选择总次数层">
              <button type="button" class="is-active" data-layer="all">全部层</button>
              ${[0, 1, 2, 3].map((d) => `<button type="button" data-layer="${d}">${tex(`d=${d}`)}</button>`).join("\n              ")}
            </div>
            <div class="ch1-multivariate-layer-grid" data-layers></div>
          </section>

          <section class="ch1-multivariate-module" data-multiply-module hidden>
            <header class="ch1-multivariate-module-head">
              <h4>用两个指数向量合成乘积格点</h4>
              <p>主图中 ${tex("\\alpha")} 从原点出发，${tex("\\beta")} 接在 ${tex("\\alpha")} 的末端，终点就是乘积的指数。</p>
            </header>
            <div class="ch1-multivariate-product-grid">
              <div class="ch1-multivariate-product-controls">
                <div class="ch1-exponent-choice">
                  <span>第一指数</span>
                  <div class="ch1-controls">
                    <button type="button" class="is-active" data-first='{"i":2,"j":1}'>(2,1)</button>
                    <button type="button" data-first='{"i":1,"j":2}'>(1,2)</button>
                  </div>
                </div>
                <div class="ch1-exponent-choice">
                  <span>第二指数</span>
                  <div class="ch1-controls">
                    <button type="button" class="is-active" data-second='{"i":1,"j":0}'>(1,0)</button>
                    <button type="button" data-second='{"i":0,"j":1}'>(0,1)</button>
                  </div>
                </div>
              </div>
              <div class="ch1-multivariate-product-result" data-product-result></div>
            </div>
          </section>
        </div>
      </div>`;
    mount(el);
  }

  window.defineChapter1Renderer("multivariate-polynomials", { interactive });
})();


;/* visuals/ch1/motion-upgrade.js */
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
    // text with formulas: built from a plain key, so a tween does not re-render KaTeX every frame
    const setHtml = (node, key, build) => {
      if (rendered.get(node) === key) return;
      rendered.set(node, key);
      node.innerHTML = build();
    };
    const alphaTex = tex("\\alpha");
    const betaTex = tex("\\beta");
    const geometryReal = `${tex("\\bar\\alpha")} 同时在两条线上：在紫色虚线上，根之和 ${tex("2a")} 是实数；在过原点的绿线上，根之积 ${tex("|\\alpha|^2")} 是实数。`;
    const geometryFree = `紫色虚线上 ${tex("\\alpha+\\beta")} 是实数，过原点的绿线上 ${tex("\\alpha\\beta")} 是实数。把 ${betaTex} 拖到两条线上看看。`;
    const hints = {
      closed: `先在上方猜一猜，再拖动 ${betaTex}`,
      real: `拖动 ${alphaTex}：共轭根关于实轴镜像跟随，两条线始终交在共轭根处`,
      free: "拖动离指针最近的根，看它何时落到两条线上",
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
      const statusKey = state.locking ? "locking" : exactReal ? "real" : `im:${text(c.sum.im)}:${text(c.product.im)}`;
      setHtml(status, statusKey, () => (state.locking
        ? `${betaTex} 正在移到 ${alphaTex} 关于实轴的对称点`
        : exactReal
          ? "根之和与根之积都是实数"
          : `系数出现虚部：${tex(`\\operatorname{Im}(\\alpha+\\beta)=${rtex(c.sum.im)}`)}，${tex(`\\operatorname{Im}(\\alpha\\beta)=${rtex(c.product.im)}`)}`));
      setTex(root.querySelector("[data-factor]"), exactReal
        ? realQuadraticTex(c.sum.re, c.product.re)
        : `x^2-\\left(${complexTex(c.sum)}\\right)x+\\left(${complexTex(c.product)}\\right)`);
      const geometryCopy = state.mode === "R" ? geometryReal : geometryFree;
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
      const hint = !open ? "closed" : state.mode === "R" ? "real" : "free";
      setHtml(root.querySelector("[data-canvas-hint]"), hint, () => hints[hint]);
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
      // until the answer is shown, α stays where the question puts it: only β moves freely
      const free = gate && !gate.revealed;
      state.dragging = state.mode === "R" ? "alpha" : free ? "beta" : da <= db ? "alpha" : "beta";
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
      // the arrow keys move the root a drag would move: β while it is free, α under the lock
      const target = state.mode === "R" ? state.alpha : state.beta;
      const next = { x: target.re, y: target.im };
      if (event.key === "ArrowLeft") next.x -= delta;
      if (event.key === "ArrowRight") next.x += delta;
      if (event.key === "ArrowUp") next.y += delta;
      if (event.key === "ArrowDown") next.y -= delta;
      setPoint(target, next);
    });

    const lockables = [...root.querySelectorAll("[data-mode], [data-preset], [data-re], [data-im], [data-bre], [data-bim]")];
    gate = window.LAPredictGate?.mount(root.querySelector("[data-conj-gate]"), {
      root,
      manual: true,
      key: "visuals/ch1/motion-upgrade.js#conjugate",
      question: `实系数二次多项式 ${tex("x^2+px+q")} 有一个根 ${tex("\\alpha=1+\\tfrac32 i")}。另一个根 ${tex("\\beta")} 在哪里？`,
      options: [
        [`${tex("\\bar\\alpha=1-\\tfrac32 i")}：与 ${tex("\\alpha")} 关于实轴对称`, true, ""],
        [`${tex("-\\alpha=-1-\\tfrac32 i")}：与 ${tex("\\alpha")} 关于原点对称`, false, `若 ${tex("\\beta=-\\alpha")}，则 ${tex("\\alpha\\beta=-\\alpha^2=\\tfrac54-3i")}，常数项不是实数。`],
        ["实轴上的某一点", false, `β 是实数时 ${tex("\\alpha+\\beta")} 的虚部仍是 ${tex("\\tfrac32")}，一次项系数不是实数。`],
        [`${tex("-\\bar\\alpha=-1+\\tfrac32 i")}：与 ${tex("\\alpha")} 关于虚轴对称`, false, `若 ${tex("\\beta=-\\bar\\alpha")}，则 ${tex("\\alpha+\\beta=3i")}，一次项系数不是实数。`],
      ],
      right: `✓ 根之和 ${tex("-p")} 是实数，${tex("\\beta")} 在水平线 ${tex("\\operatorname{Im}\\beta=-\\tfrac32")} 上；根之积 ${tex("q")} 是实数，${tex("\\beta")} 在过原点、方向为 ${tex("\\bar\\alpha")} 的直线上（${tex("\\beta=t\\bar\\alpha")}，${tex("t")} 为实数）。两条线只交于 ${tex("\\bar\\alpha")}，此时 ${tex("q=\\alpha\\bar\\alpha=|\\alpha|^2")}。`,
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
          <button type="button" data-mode="C" class="is-active" aria-pressed="true">自由移动 ${tex("\\beta")}</button>
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
            <label class="ch1-slider-row"><span>${tex("\\operatorname{Re}(\\alpha)")}</span><input data-re type="range" min="-2.5" max="2.5" step="0.25"><output data-re-value></output></label>
            <label class="ch1-slider-row"><span>${tex("\\operatorname{Im}(\\alpha)")}</span><input data-im type="range" min="-2.5" max="2.5" step="0.25"><output data-im-value></output></label>
            <div data-beta-controls hidden>
              <label class="ch1-slider-row"><span>${tex("\\operatorname{Re}(\\beta)")}</span><input data-bre type="range" min="-2.5" max="2.5" step="0.25"><output data-bre-value></output></label>
              <label class="ch1-slider-row"><span>${tex("\\operatorname{Im}(\\beta)")}</span><input data-bim type="range" min="-2.5" max="2.5" step="0.25"><output data-bim-value></output></label>
            </div>
            <div class="ch1-equation-grid is-compact">
              <div><span>${tex("\\alpha")}</span><strong data-alpha></strong></div>
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


;/* visuals/ch1/repair-pass.js */
/* Chapter 1 repair pass: standard polynomial long division and readable Euclid formulas. */
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

  window.defineChapter1Renderer("polynomial-divisibility", { interactive: interactiveLongDivision });
  window.defineChapter1Renderer("gcd-polynomials", { interactive: interactiveEuclidRepair });
})();


;/* visuals/ch1/repair-pass-v2.js */
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

  /*
   * In the SVG a coefficient p/q is a small stacked fraction (“1/2x” reads as 1/(2x)).
   * A term with a fraction becomes tspans: segments (sign, variable) and data-num/data-den
   * pairs; layoutFractions() measures them and places them, and draws the bar.
   */
  const SVG_NS = "http://www.w3.org/2000/svg";

  function termPieces(poly, degree, first) {
    const value = coefficient(poly, degree);
    if (M().rIsZero(value)) return null;
    const negative = value.n < 0;
    const n = Math.abs(value.n);
    const sign = negative ? "−" : first ? "" : "+";
    const pieces = [];
    if (sign) pieces.push({ text: sign, gap: first ? 0.04 : 0.3 });
    if (value.d !== 1) pieces.push({ num: String(n), den: String(value.d) });
    else if (degree === 0 || n !== 1) pieces.push({ text: String(n) });
    if (degree > 0) pieces.push({ text: variable(degree) });
    return pieces;
  }

  // markup for the inside of a <text>; `fraction` tells whether it needs layoutFractions()
  function svgPieces(pieces) {
    const fraction = pieces.some((piece) => piece.den);
    if (!fraction) {
      return { fraction, markup: svgEscape(pieces.map((piece) => `${piece.text}${piece.gap > 0.1 ? " " : ""}`).join("")) };
    }
    const markup = pieces.map((piece) => (piece.den
      ? `<tspan class="ch1-ld-frac" data-num>${piece.num}</tspan><tspan class="ch1-ld-frac" data-den data-gap="${piece.gap || 0}">${piece.den}</tspan>`
      : `<tspan data-gap="${piece.gap || 0}">${svgEscape(piece.text)}</tspan>`)).join("");
    return { fraction, markup };
  }

  // a whole polynomial (divisor, product label) as the inside of one <text>
  function svgPolynomial(poly, suffix = "") {
    if (M().isZeroPoly(poly)) return svgPieces([{ text: `0${suffix}` }]);
    const pieces = [];
    for (let degree = M().deg(poly); degree >= 0; degree -= 1) {
      const term = termPieces(poly, degree, pieces.length === 0);
      if (!term) continue;
      if (pieces.length) pieces.at(-1).gap = Math.max(pieces.at(-1).gap || 0, 0.3);
      pieces.push(...term);
    }
    if (suffix) {
      pieces.at(-1).gap = Math.max(pieces.at(-1).gap || 0, 0.25);
      pieces.push({ text: suffix });
    }
    return svgPieces(pieces);
  }

  function svgText(attrs, content, anchorEnd = false) {
    if (!content.fraction) return `<text ${attrs}${anchorEnd ? ' text-anchor="end"' : ""}>${content.markup}</text>`;
    // every piece gets its own x, so the anchor is applied by the layout, not by the browser
    return `<text ${attrs} data-frac${anchorEnd ? ' data-anchor="end"' : ""}>${content.markup}</text>`;
  }

  function layoutFractions(svg) {
    if (!svg?.isConnected) return;
    svg.querySelectorAll(".ch1-ld-frac-bar").forEach((bar) => bar.remove());
    svg.querySelectorAll("text[data-frac]").forEach((text) => {
      const size = parseFloat(getComputedStyle(text).fontSize) || 25;
      const y = Number(text.getAttribute("y"));
      const kids = [...text.children];
      const items = [];
      for (let i = 0; i < kids.length; i += 1) {
        const node = kids[i];
        if (node.hasAttribute("data-num")) {
          const den = kids[i + 1];
          i += 1;
          const wn = node.getComputedTextLength();
          const wd = den.getComputedTextLength();
          items.push({ num: node, den, wn, wd, inner: Math.max(wn, wd), w: Math.max(wn, wd) + (0.2 + Number(den.dataset.gap || 0)) * size });
        } else {
          items.push({ seg: node, w: node.getComputedTextLength() + Number(node.dataset.gap || 0) * size });
        }
      }
      const total = items.reduce((sum, item) => sum + item.w, 0);
      let x = Number(text.getAttribute("x")) - (text.dataset.anchor === "end" ? total : 0);
      items.forEach((item) => {
        if (item.seg) {
          item.seg.setAttribute("x", x.toFixed(2));
          item.seg.setAttribute("y", y);
        } else {
          const left = x + 0.1 * size;
          item.num.setAttribute("x", (left + (item.inner - item.wn) / 2).toFixed(2));
          item.num.setAttribute("y", (y - 0.4 * size).toFixed(2));
          item.den.setAttribute("x", (left + (item.inner - item.wd) / 2).toFixed(2));
          item.den.setAttribute("y", (y + 0.26 * size).toFixed(2));
          // the bar is a filled path with the text's classes, so it has the same fill in both themes
          const bar = document.createElementNS(SVG_NS, "path");
          const bx = (left - 0.03 * size).toFixed(2);
          const bw = (item.inner + 0.06 * size).toFixed(2);
          const bh = Math.max(1.2, 0.055 * size).toFixed(2);
          bar.setAttribute("class", `${text.getAttribute("class")} ch1-ld-frac-bar`);
          bar.setAttribute("d", `M${bx} ${(y - 0.3 * size).toFixed(2)}h${bw}v${bh}h-${bw}z`);
          text.after(bar);
        }
        x += item.w;
      });
    });
  }

  function termRow(poly, maxDegree, y, config) {
    if (M().isZeroPoly(poly)) {
      const x = config.x0 + maxDegree * config.columnWidth;
      return `<text class="ch1-ld-term${config.newDegree === 0 ? " is-new-quotient" : ""}" x="${x}" y="${y}"${config.newDegree === 0 ? " data-new-quotient" : ""}>0</text>`;
    }
    const output = [];
    const top = M().deg(poly);
    for (let degree = maxDegree; degree >= 0; degree -= 1) {
      const pieces = degree > top ? null : termPieces(poly, degree, degree === top);
      if (!pieces) continue;
      const x = config.x0 + (maxDegree - degree) * config.columnWidth;
      const isFocus = degree === config.focusDegree;
      const isNew = degree === config.newDegree;
      const classes = ["ch1-ld-term", isFocus ? "is-focus" : "", isNew ? "is-new-quotient" : ""].filter(Boolean).join(" ");
      const text = svgText(`class="${classes}" x="${x}" y="${y}"`, svgPieces(pieces));
      // the new quotient term fades in as a group, so a fraction bar moves with it
      output.push(isNew ? `<g data-new-quotient>${text}</g>` : text);
    }
    return output.join("");
  }

  function mount(root) {
    const presets = {
      default: { f: M().poly([-1, 0, 0, 0, 1]), g: M().poly([1, 1, 1]), name: "x^4-1\\div(x^2+x+1)", math: true },
      divides: { f: M().poly([-1, 0, 0, 1]), g: M().poly([-1, 1]), name: "x^3-1\\div(x-1)", math: true },
      fraction: { f: M().poly(["1/2", "-1/2", 0, 1]), g: M().poly(["1/2", 1]), name: "分数系数示例" },
    };
    // a preset name is a formula (rendered by KaTeX) or plain words
    const nameHtml = (example) => (example.math ? tex(example.name) : svgEscape(example.name));
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
    let gate = null;

    // f, then one bar per remainder reached; the dashed level is deg g, where the division stops
    function stairs(index, example = state.example, steps = state.steps) {
      const bars = [{ label: "f", deg: M().deg(example.f), role: "f" }];
      let k = 0;
      steps.forEach((entry, stepIndex) => {
        if (entry.kind !== "eliminate" || stepIndex > index) return;
        k += 1;
        bars.push({ label: `r${window.Ch1Stairs.sub(k)}`, deg: M().isZeroPoly(entry.r) ? null : M().deg(entry.r), role: "r" });
      });
      const done = steps[index]?.kind === "done";
      const last = bars.at(-1);
      const degG = M().deg(example.g);
      return window.Ch1Stairs.degreeStairs(bars, {
        maxDeg: M().deg(example.f),
        line: { deg: degG, label: `deg g = ${degG}` },
        highlight: done ? bars.length - 1 : -1,
        highlightLabel: done ? (last.deg == null ? "r = 0，停止" : `${last.deg} < ${degG}，停止`) : "",
      });
    }
    /*
     * Once a division is finished, the opposite case is drawn beside it: a run that stops at the
     * zero polynomial (g | f) next to one that stops at a remainder of degree < deg g.
     */
    function stairsPair(index, divides) {
      const mine = stairs(index);
      const other = divides ? presets.default : presets.divides;
      const otherSteps = M().divisionSteps(other.f, other.g);
      const caption = (d, example) => `<figcaption><b>${d ? "整除" : "不整除"}</b> ${nameHtml(example)}</figcaption>`;
      const otherDivides = M().isZeroPoly(otherSteps.at(-1).r);
      return `<div class="ch1-stairs-pair"><figure>${caption(divides, state.example)}${mine}</figure><figure class="is-compare">${caption(otherDivides, other)}${stairs(otherSteps.length - 1, other, otherSteps)}</figure></div>`;
    }
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
        // the new product slides in from just above its row, clear of the remainder above it
        rows.push(`<g${isNew ? ' data-new-product opacity="0" transform="translate(0,-18)"' : ""}>`);
        rows.push(svgText(`class="ch1-ld-product-label" x="22" y="${productY}"`, svgPolynomial(step.term, "· g(x)")));
        rows.push(`<text class="ch1-ld-minus" x="195" y="${productY}">−</text>`);
        rows.push(termRow(step.product, maxDegree, productY, { x0, columnWidth, focusDegree: isNew ? activeDegree : null }));
        rows.push("</g>");
        rows.push(`<path class="ch1-ld-subtract-line" d="M${lineStart} ${lineY} H${width - 34}" pathLength="1"${isNew ? ' data-new-line stroke-dasharray="1" stroke-dashoffset="1"' : ""}></path>`);
        rows.push(`<g${isNew ? ' data-new-remainder opacity="0" transform="translate(0,-22)"' : ""}>`);
        rows.push(termRow(step.r, maxDegree, remainderY, { x0, columnWidth }));
        rows.push("</g>");
      });

      // stacked fractions are no wider than whole numbers, so the glyphs keep their size on phones
      return `<svg data-division-svg data-animation-progress="0" viewBox="0 0 ${width} ${height}" role="img" aria-label="标准多项式长除法">
        <text class="ch1-ld-label" x="174" y="57" text-anchor="end">商</text>
        ${state.steps[index]?.kind === "start" ? "" : termRow(quotient, maxDegree, 59, { x0, columnWidth, newDegree: newQuotientDegree })}
        <path class="ch1-ld-bracket" d="M188 91 H${width - 34} M188 91 V154"></path>
        <text class="ch1-ld-label is-role" x="174" y="113" text-anchor="end">除式</text>
        <text class="ch1-ld-label is-role" x="${x0 - 10}" y="113">被除式</text>
        ${svgText('class="ch1-ld-divisor-text" x="174" y="141"', svgPolynomial(state.example.g), true)}
        ${termRow(state.example.f, maxDegree, 141, { x0, columnWidth, focusDegree: activeDegree })}
        ${rows.join("")}
      </svg>`;
    }

    function updateText(index) {
      const step = state.steps[index];
      const done = step.kind === "done";
      const divides = done && M().isZeroPoly(step.r);
      root.querySelector("[data-title]").innerHTML = nameHtml(state.example);
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
        const lead = M().deg(state.example.f) - M().deg(state.example.g);
        root.querySelector("[data-note]").innerHTML = `用 ${tex(lead > 1 ? `x^{${lead}}` : "x")} 消去当前最高次项。`;
      } else if (step.kind === "eliminate") {
        root.querySelector("[data-focus]").innerHTML = `商中加入 ${tex(M().formatPolyTex(step.term))}，乘回除式并在同次项下方对齐。`;
        root.querySelector("[data-note]").innerHTML = M().isZeroPoly(step.r) ? "相减后余式归零。" : `相减后得到 ${tex(M().formatPolyTex(step.r))}，余式次数降为 ${M().deg(step.r)}。`;
      } else {
        root.querySelector("[data-focus]").textContent = divides ? "余式归零，除法结束。" : "余式次数已经低于除式次数，除法结束。";
        root.querySelector("[data-note]").innerHTML = divides ? `因此 ${tex("f(x)=q(x)g(x)")}。` : `最终 ${tex(`\\deg r=${M().deg(step.r)}<\\deg g=${M().deg(state.example.g)}`)}。`;
      }
      root.querySelector("[data-stairs]").innerHTML = done ? stairsPair(index, divides) : stairs(index);
      root.querySelector("[data-stairs-note]").innerHTML = done
        ? (divides ? `余式降成 0 多项式，${tex("g")} 整除 ${tex("f")}。` : `余式次数降到 ${M().deg(step.r)}，低于 ${tex(`\\deg g=${M().deg(state.example.g)}`)}，不能再用 ${tex("g")} 的首项去除了。`)
        : "每一步消去当前最高次项，余式次数严格下降。";
      if (done) gate?.acted();
      root.querySelector("[data-progress]").innerHTML = state.steps.map((_, stepIndex) => `<span class="${stepIndex < index ? "is-done" : stepIndex === index ? "is-current" : ""}" aria-label="第 ${stepIndex + 1} 步"></span>`).join("");
    }

    function updateButtons() {
      const busy = Boolean(state.animation);
      root.querySelector("[data-prev]").disabled = busy || state.index === 0;
      root.querySelector("[data-next]").disabled = busy || state.index === state.steps.length - 1;
      root.querySelector("[data-reset]").disabled = busy || state.index === 0;
      root.querySelector("[data-play]").textContent = state.playing ? "暂停" : "自动播放";
      // stepping waits for a prediction; the gate itself unlocks the primary button
      if (gate && !gate.picked) root.querySelector("[data-play]").disabled = true;
      else if (!busy) root.querySelector("[data-play]").disabled = false;
      gate?.relock?.();
    }

    function render() {
      svgNode().outerHTML = scene(state.index);
      layoutFractions(svgNode());
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
      layoutFractions(svgNode());
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
          product.setAttribute("opacity", String(p));
          product.setAttribute("transform", `translate(0,${-18 * (1 - p)})`);
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
    document.fonts?.ready.then(() => layoutFractions(svgNode()));
    window.ch1Listen?.(window, "resize", () => layoutFractions(svgNode()), { passive: true });
    gate = window.LAPredictGate?.mount(root.querySelector("[data-division-gate]"), {
      root,
      manual: true,
      key: "visuals/ch1/repair-pass-v2.js#stop",
      question: `用 ${tex("g=x^2+x+1")} 去除 ${tex("f=x^4-1")}，每一步余式次数都下降。长除法做到什么时候停？`,
      options: [
        [`余式次数低于 ${tex("\\deg g=2")}，或余式为 0`, true, ""],
        ["只有余式变成 0 才停", false, `不整除时余式永远不会是 0：这里停在 ${tex("r=x-1")}。`],
        ["余式变成常数时才停", false, `${tex("x-1")} 的次数是 1，已经低于 2，不必等到常数。`],
        [`一共做 ${tex("\\deg f=4")} 步`, false, `商 ${tex("x^2-x")} 只有两项，消去两次就停了。`],
      ],
      right: `✓ 每次用余式首项除以 ${tex("g")} 的首项；一旦 ${tex("\\deg r<\\deg g")}，就无法再除。停下时 ${tex("f=qg+r")}，且 ${tex("r=0")} 或 ${tex("\\deg r<\\deg g")}。`,
      onPick: () => updateButtons(),
    });
    choose("default", root.querySelector('[data-preset="default"]'));
  }

  function interactive(el, section) {
    el.innerHTML = `<h2>交互实验</h2>
      <div class="ch1-lab ch1-long-division-lab">
        <div class="ch1-lab-head">
          <h3>长除法：余式次数降到哪里停</h3>
          <p>${section.interactive.description}</p>
        </div>
        <div data-division-gate></div>
        <div class="ch1-controls" role="group" aria-label="长除法示例与播放控制">
          <button type="button" data-preset="default" class="is-active" aria-pressed="true">非整除</button>
          <button type="button" data-preset="divides" aria-pressed="false">整除</button>
          <button type="button" data-preset="fraction" aria-pressed="false">分数系数</button>
          <span class="ch1-control-separator"></span>
          <button type="button" data-prev>上一步</button>
          <button type="button" data-play>自动播放</button>
          <button type="button" class="is-primary" data-next>下一步</button>
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
              <div><span>${tex("f(x)")}</span><strong data-f></strong></div>
              <div><span>${tex("g(x)")}</span><strong data-g></strong></div>
              <div><span>${tex("q(x)")}</span><strong data-q></strong></div>
              <div><span>${tex("r(x)")}</span><strong data-r></strong></div>
            </div>
            <section class="ch1-stairs-card">
              <h4>余式次数</h4>
              <div class="ch1-stairs" data-stairs></div>
              <p class="ch1-stairs-note" data-stairs-note></p>
            </section>
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


;/* visuals/ch1/motion-upgrade-init.js */
/* Compatibility hooks for the focused Chapter 1 motion upgrades. */
(() => {
  "use strict";

  if (!document.querySelector('link[href*="repair-pass-final.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "./visuals/ch1/repair-pass-final.css?v=ch1-repair-final6";
    document.head.append(link);
  }

  const math = window.Ch1Math;
  if (math?.observeCanvas && !math.observeCanvas.__ch1MotionDeferred) {
    const baseObserveCanvas = math.observeCanvas;
    math.observeCanvas = function observeCanvasAfterState(root, draw) {
      if (!root?.classList?.contains("ch1-division-canvas-shell")) return baseObserveCanvas(root, draw);
      let queued = false;
      const deferredDraw = () => {
        if (queued) return;
        queued = true;
        queueMicrotask(() => {
          queued = false;
          if (root.isConnected) draw();
        });
      };
      return baseObserveCanvas(root, deferredDraw);
    };
    math.observeCanvas.__ch1MotionDeferred = true;
  }

  if (typeof window.mountChapter1Lesson === "function" && !window.mountChapter1Lesson.__ch1MotionHeadCompatible) {
    const baseMountChapter1Lesson = window.mountChapter1Lesson;
    const compatibleMount = function mountChapter1LessonWithMotionHead(section, root) {
      baseMountChapter1Lesson(section, root);
      if (!section?.id || !root) return;
      root.querySelector(`#${CSS.escape(section.id)}-interactive .ch1-motion-head`)?.classList.add("ch1-lab-head");
    };
    compatibleMount.__ch1MotionHeadCompatible = true;
    window.mountChapter1Lesson = compatibleMount;
  }
})();


;/* visuals/ch1/mount.js */
/* Attach Chapter 1 presentation modules, compatibility shims, and guided learning layouts. */
(() => {
  "use strict";

  const addStylesheet = (href) => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.append(link);
  };

  addStylesheet("./visuals/ch1/refinement.css?v=ch1-final2");
  addStylesheet("./visuals/ch1/learning-design.css?v=ch1-learning2");

  const math = window.Ch1Math;
  if (math) {
    math.polyFrom ||= math.poly;
    math.rCmp ||= ((a, b) => math.rToNum(a) - math.rToNum(b));
    if (math.drawLattice && !math.drawLattice.__ch1Compatibility) {
      const baseDrawLattice = math.drawLattice;
      const compatibleDrawLattice = function compatibleDrawLattice(...args) {
        const grid = baseDrawLattice(...args);
        if (!grid.hitTest) {
          grid.hitTest = (px, py) => {
            const point = grid.toIndex(px, py);
            const maxI = Math.round((grid.width - 2 * grid.pad) / grid.sx);
            const maxJ = Math.round((grid.height - 2 * grid.pad) / grid.sy);
            if (point.i < 0 || point.j < 0 || point.i > maxI || point.j > maxJ) return null;
            return point;
          };
        }
        return grid;
      };
      compatibleDrawLattice.__ch1Compatibility = true;
      math.drawLattice = compatibleDrawLattice;
    }
  }

  if (window.Ch1UI?.renderFormal && window.defineChapter1Renderer) {
    ["rational-polynomials", "multivariate-polynomials", "symmetric-polynomials"].forEach((sectionId) => {
      window.defineChapter1Renderer(sectionId, { formal: window.Ch1UI.renderFormal });
    });
  }

  // One section-specific conclusion per lab, shown after the lab itself.
  const t = (source) => (window.texInline ? window.texInline(source) : source);
  const takeaways = {
    "univariate-polynomials": () => `加减按同次位置对齐；乘积中 ${t("x^k")} 的系数是所有满足 ${t("i+j=k")} 的 ${t("a_ib_j")} 之和。`,
    "polynomial-divisibility": () => `每一步用首项相除得到唯一的商项，余式次数严格下降；停止时 ${t("f=qg+r")}，且 ${t("r=0")} 或 ${t("\\deg r<\\deg g")}。`,
    "gcd-polynomials": () => `取余不改变公因式；最后一个非零余式首一化就是 ${t("\\gcd(f,g)")}，回代得到的 ${t("s,t")} 满足 ${t("sf+tg=\\gcd(f,g)")}。`,
    "multiple-factors": () => `两根相距再近也是两个单根；只有精确重合时才成为二重根，此时曲线与横轴相切，${t("\\gcd(f,f')")} 也不再是 1。`,
    "polynomial-functions": () => `${t("f")} 除以 ${t("x-a")} 的余式就是 ${t("f(a)")}；非零 ${t("n")} 次多项式至多有 ${t("n")} 个根；${t("n+1")} 个横坐标互异的点唯一确定次数不超过 ${t("n")} 的多项式。`,
    "complex-real-factorization": () => "实系数多项式的非实根成共轭对出现；一对共轭根合成一个判别式小于 0 的实二次因式。",
    "multivariate-polynomials": () => `${t("x^iy^j")} 对应格点 ${t("(i,j)")}；单项式相乘时指数向量相加，总次数相同的项组成一个齐次部分。`,
  };

  function moduleHeading(number, title) {
    const heading = document.createElement("div");
    heading.className = "ch1-module-heading";
    heading.innerHTML = `<span>${number}</span><div><h4>${title}</h4></div>`;
    return heading;
  }

  function applyTask(section, lab) {
    const task = section.interactive?.task;
    const head = lab.querySelector(":scope > .ch1-lab-head");
    if (!head || !task) return;
    const line = head.querySelector(":scope > p");
    if (line) {
      line.classList.add("ch1-lab-task");
      line.innerHTML = task;
    }
  }

  function buildConclusion(section, lab) {
    const takeaway = takeaways[section.id];
    if (!takeaway) return;
    const conclusion = document.createElement("p");
    conclusion.className = "ch1-live-conclusion";
    conclusion.innerHTML = takeaway();
    lab.append(conclusion);
    // with a prediction box, the conclusion waits until the prediction is checked
    const gate = lab.querySelector(".ch3l-predict");
    if (!gate || gate.classList.contains("is-done")) return;
    conclusion.hidden = true;
    const observer = new MutationObserver(() => {
      if (!gate.classList.contains("is-done")) return;
      conclusion.hidden = false;
      observer.disconnect();
    });
    observer.observe(gate, { attributes: true, attributeFilter: ["class"] });
    window.ch1UseCleanup?.(() => observer.disconnect());
  }

  function installCoefficientHighlights(lab) {
    const update = () => {
      const mode = lab.querySelector("[data-mode].is-active")?.dataset.mode;
      lab.dataset.coefficientMode = mode || "add";
      lab.querySelectorAll(".ch1-strip-cell.is-contributor").forEach((cell) => cell.classList.remove("is-contributor"));
      if (mode !== "mul") return;
      lab.querySelectorAll("[data-contributions] tr").forEach((row) => {
        const cells = row.cells;
        if (!cells || cells.length < 2) return;
        const i = (cells[0].textContent.match(/\d+/) || [])[0];
        const j = (cells[1].textContent.match(/\d+/) || [])[0];
        if (i !== undefined) lab.querySelector(`[data-f="${i}"]`)?.closest(".ch1-strip-cell")?.classList.add("is-contributor");
        if (j !== undefined) lab.querySelector(`[data-g="${j}"]`)?.closest(".ch1-strip-cell")?.classList.add("is-contributor");
      });
    };
    const observer = new MutationObserver(update);
    const table = lab.querySelector("[data-contributions]");
    if (table) observer.observe(table, { subtree: true, childList: true, characterData: true });
    lab.addEventListener("click", () => queueMicrotask(update));
    lab.addEventListener("input", () => queueMicrotask(update));
    window.ch1UseCleanup?.(() => observer.disconnect());
    update();
  }

  function restructureCoefficientLab(lab) {
    if (lab.dataset.coefficientLayout === "true") return;
    const controls = lab.querySelector(":scope > .ch1-controls");
    const pairs = [...lab.querySelectorAll(":scope > .ch1-two-col")];
    const sourcePair = pairs[0];
    const explanationPair = pairs[1];
    const sourcePanel = sourcePair?.querySelector(":scope > .ch1-panel");
    const stage = sourcePair?.querySelector(":scope > .ch1-stage");
    // the opening “middle 0” module keeps number 01; the workbench follows it
    const opener = lab.querySelector(":scope > [data-zero-module]");
    const n = (k) => String(k + (opener ? 1 : 0)).padStart(2, "0");
    const resultBand = lab.querySelector(":scope > .ch1-result-band");
    const fStrip = lab.querySelector("[data-f-strip]");
    const gStrip = lab.querySelector("[data-g-strip]");
    if (!controls || !sourcePanel || !stage || !resultBand || !fStrip || !gStrip || !explanationPair) return;

    const fBlock = fStrip.parentElement;
    const gBlock = gStrip.parentElement;
    const scaleBox = lab.querySelector("[data-scale-box]");
    const kBox = lab.querySelector("[data-k-box]");

    const workflow = document.createElement("div");
    workflow.className = "ch1-coeff-workflow";

    const editor = document.createElement("section");
    editor.className = "ch1-learning-module ch1-coeff-editor";
    editor.append(moduleHeading(n(1), "输入系数"));
    const editorGrid = document.createElement("div");
    editorGrid.className = "ch1-coeff-pair-grid";
    fBlock.classList.add("ch1-coeff-card", "is-f");
    gBlock.classList.add("ch1-coeff-card", "is-g");
    editorGrid.append(fBlock, gBlock);
    editor.append(editorGrid);

    const operation = document.createElement("section");
    operation.className = "ch1-learning-module ch1-coeff-operation";
    operation.append(moduleHeading(n(2), "选择运算"));
    operation.append(controls);
    const parameterRow = document.createElement("div");
    parameterRow.className = "ch1-coeff-parameters";
    if (scaleBox) parameterRow.append(scaleBox);
    if (kBox) parameterRow.append(kBox);
    operation.append(parameterRow);

    const result = document.createElement("section");
    result.className = "ch1-learning-module ch1-coeff-result";
    result.append(moduleHeading(n(3), "结果"));
    result.append(resultBand);

    const explanation = document.createElement("section");
    explanation.className = "ch1-learning-module ch1-coeff-analysis";
    explanation.append(moduleHeading(n(4), "乘积中指定次数的全部贡献"));
    const analysisGrid = document.createElement("div");
    analysisGrid.className = "ch1-coeff-analysis-grid";
    [...explanationPair.children].forEach((child) => analysisGrid.append(child));
    explanation.append(analysisGrid);

    const graph = document.createElement("details");
    graph.className = "ch1-graph-details";
    graph.open = false;
    graph.innerHTML = `<summary><span>结果的函数图像</span></summary>`;
    graph.append(stage);

    workflow.append(editor, operation, result, explanation, graph);
    // the section's question is the middle 0; the operations workbench folds away under it
    const more = document.createElement("details");
    more.className = "ch1-more-ops";
    more.innerHTML = `<summary><span>更多运算</span><small>加、减、数乘与乘法：输入两组系数，读出结果的每一项</small></summary>`;
    more.append(workflow);
    more.addEventListener("toggle", () => { if (more.open) window.dispatchEvent(new Event("resize")); });
    (opener || lab.querySelector(":scope > .ch1-lab-head")).after(more);
    sourcePair.remove();
    explanationPair.remove();
    sourcePanel.remove();
    lab.dataset.coefficientLayout = "true";
    installCoefficientHighlights(lab);
  }

  function enhanceLesson(section, root) {
    const interactive = root.querySelector(`#${CSS.escape(section.id)}-interactive`);
    const lab = interactive?.querySelector(".ch1-lab");
    if (!lab || lab.dataset.ch1LearningReady === "true") return;
    lab.dataset.ch1LearningReady = "true";
    lab.classList.add("ch1-guided-lab", `ch1-section-${section.id}`);
    applyTask(section, lab);
    if (section.id === "univariate-polynomials") restructureCoefficientLab(lab);
    buildConclusion(section, lab);
  }

  function syncCoefficientDegreeLabels(root = document) {
    const slider = root.querySelector("[data-k]");
    if (!slider) return;
    root.querySelectorAll("[data-k-value]").forEach((node) => {
      node.textContent = slider.value;
    });
  }

  document.addEventListener("input", (event) => {
    if (event.target?.matches?.("[data-k]")) syncCoefficientDegreeLabels(document);
  });

  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  // In lazy-loaded builds this listener can be installed during the first
  // hashchange dispatch. Do not tear down the lab just mounted for Chapter 1.
  window.addEventListener("hashchange", () => {
    if (!window.location.hash.startsWith("#ch1/") && window.location.hash !== "#ch1") {
      window.teardownChapter1Lesson?.();
    }
  });

  window.renderLessonPage = function renderLessonPageWithChapter1Extensions(section, chapter) {
    baseRenderLessonPage(section, chapter);
    const root = document.querySelector("#mainContent");
    window.mountChapter1Lesson?.(section, root);
    syncCoefficientDegreeLabels(root);
    enhanceLesson(section, root);
  };
})();

