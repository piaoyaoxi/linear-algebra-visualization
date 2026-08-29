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
      return `<label class="ch1-strip-cell" role="listitem"><span class="ch1-strip-deg">${i === 0 ? "1" : i === 1 ? "x" : `x<sup>${i}</sup>`}</span>${editable ? `<input class="ch1-strip-input" type="text" inputmode="decimal" data-${key}="${i}" value="${formatR(value)}" aria-label="x 的 ${i} 次项系数">` : `<strong class="ch1-strip-val">${formatR(value)}</strong>`}</label>`;
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
      accent: style.getPropertyValue("--accent").trim() || "#0f8f88",
      coral: style.getPropertyValue("--coral").trim() || "#d9835f",
      blue: style.getPropertyValue("--blue").trim() || "#547ec8",
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

  function camera(width, height, bounds = { xMin: -4, xMax: 4, yMin: -4, yMax: 4 }) {
    const pad = 34;
    const scale = Math.min((width - 2 * pad) / (bounds.xMax - bounds.xMin), (height - 2 * pad) / (bounds.yMax - bounds.yMin));
    const ox = width / 2 - ((bounds.xMin + bounds.xMax) / 2) * scale;
    const oy = height / 2 + ((bounds.yMin + bounds.yMax) / 2) * scale;
    return {
      bounds, scale,
      toScreen: (x, y) => ({ x: ox + x * scale, y: oy - y * scale }),
      toWorld: (x, y) => ({ x: (x - ox) / scale, y: (oy - y) / scale }),
    };
  }

  function drawAxes(ctx, width, height, cam, palette = getPalette()) {
    ctx.save();
    ctx.strokeStyle = palette.line;
    ctx.fillStyle = palette.muted;
    ctx.lineWidth = 1;
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    const origin = cam.toScreen(0, 0);
    ctx.beginPath();
    if (origin.y >= 0 && origin.y <= height) { ctx.moveTo(12, origin.y); ctx.lineTo(width - 12, origin.y); }
    if (origin.x >= 0 && origin.x <= width) { ctx.moveTo(origin.x, 12); ctx.lineTo(origin.x, height - 12); }
    ctx.stroke();
    for (let x = Math.ceil(cam.bounds.xMin); x <= Math.floor(cam.bounds.xMax); x++) {
      if (x === 0) continue;
      const p = cam.toScreen(x, 0);
      if (p.y >= 0 && p.y <= height) ctx.fillText(String(x), p.x - 3, p.y + 14);
    }
    ctx.restore();
  }

  function drawPolynomial(canvas, p, options = {}) {
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const cam = camera(width, height, options.bounds);
    drawAxes(ctx, width, height, cam, palette);
    const polys = options.series || [{ p, color: palette.accent, width: 2.5 }];
    for (const series of polys) {
      ctx.save();
      ctx.strokeStyle = series.color || palette.accent;
      ctx.lineWidth = series.width || 2.2;
      ctx.beginPath();
      let penDown = false;
      const samples = options.samples || Math.max(280, Math.round(width));
      for (let i = 0; i <= samples; i++) {
        const x = cam.bounds.xMin + (i / samples) * (cam.bounds.xMax - cam.bounds.xMin);
        const y = evalPolyNum(series.p, x);
        if (!Number.isFinite(y) || y < cam.bounds.yMin - 1 || y > cam.bounds.yMax + 1) { penDown = false; continue; }
        const point = cam.toScreen(x, y);
        if (!penDown) { ctx.moveTo(point.x, point.y); penDown = true; } else ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();
      ctx.restore();
    }
    (options.points || []).forEach((point) => {
      const pnt = cam.toScreen(point.x, point.y);
      ctx.beginPath();
      ctx.fillStyle = point.color || palette.coral;
      ctx.arc(pnt.x, pnt.y, point.r || 5, 0, Math.PI * 2);
      ctx.fill();
    });
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
    const cam = camera(width, height, options.bounds || { xMin: -4, xMax: 4, yMin: -1.4, yMax: 1.4 });
    drawAxes(ctx, width, height, cam, palette);
    roots.forEach((root) => {
      const base = cam.toScreen(root.x, 0);
      for (let i = 0; i < (root.m || 1); i++) {
        ctx.beginPath();
        ctx.fillStyle = root.color || palette.accent;
        ctx.arc(base.x, base.y - i * 7, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = palette.surface;
        ctx.stroke();
      }
      ctx.fillStyle = palette.text;
      ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
      if (root.label) {
        ctx.textAlign = root.labelAlign || "left";
        ctx.fillText(root.label, base.x + (root.labelDx ?? 8), base.y + (root.labelDy ?? 18));
        ctx.textAlign = "start";
      }
    });
    return cam;
  }

  function drawComplexPlane(canvas, points, options = {}) {
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const cam = camera(width, height, options.bounds || { xMin: -3, xMax: 3, yMin: -3, yMax: 3 });
    drawAxes(ctx, width, height, cam, palette);
    ctx.fillStyle = palette.muted;
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
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
      ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
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
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    for (let i = 0; i <= maxI; i++) {
      for (let j = 0; j <= maxJ; j++) {
        const x = pad + i * sx;
        const y = height - pad - j * sy;
        ctx.beginPath();
        ctx.fillStyle = palette.muted;
        ctx.arc(x, y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.strokeStyle = palette.line;
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
      ctx.fillStyle = term.active ? palette.accent : term.color || palette.coral;
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
    const observer = new ResizeObserver(() => {
      if (!root.isConnected) { observer.disconnect(); return; }
      draw();
    });
    observer.observe(root);
    observers.set(root, observer);
    draw();
    return () => observer.disconnect();
  }

  window.Ch1Math = {
    gcdInt, lcmInt, R, parseR, rAdd, rSub, rMul, rDiv, rNeg, rAbs, rEq, rIsZero, rToNum,
    formatR, formatRTex, poly, normalizePoly, zeroPoly, onePoly, isZeroPoly, deg, leading, polyEq,
    polyAdd, polySub, polyScale, polyShift, polyMul, polyPow, polyDiv, polyMod, makeMonic, polyGcd,
    polyDerivative, evalPoly, evalPolyNum, divisionSteps, extendedEuclidSteps, hornerSteps,
    lagrangeInterpolation, contentAndPrimitive, integerDivisors, rationalRootCandidates,
    formatPolyTex, formatCoefficients, coefficientStrip, getPalette, setupCanvas, camera, drawAxes,
    drawPolynomial, drawRootAxis, drawComplexPlane, drawLattice, observeCanvas,
  };
})();
