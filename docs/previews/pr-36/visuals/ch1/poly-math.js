/* Chapter 1 exact rational polynomial engine and fixed-camera drawing helpers. */
(() => {
  const frameIds = new WeakMap();

  function gcdInt(a, b) {
    let x = Math.abs(Math.trunc(Number(a) || 0));
    let y = Math.abs(Math.trunc(Number(b) || 0));
    while (y) {
      const t = y;
      y = x % y;
      x = t;
    }
    return x || 1;
  }

  function parseDecimalString(text) {
    const raw = String(text ?? "").trim();
    if (!raw) return { n: 0, d: 1 };
    if (/^[+-]?\d+\s*\/\s*[+-]?\d+$/.test(raw)) {
      const [n, d] = raw.split("/").map((part) => Number(part.trim()));
      if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) throw new Error("invalid rational");
      return reduce(n, d);
    }
    if (/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(raw)) {
      const [mantissaText, exponentText] = raw.toLowerCase().split("e");
      const exponent = Number(exponentText || 0);
      const sign = mantissaText.startsWith("-") ? -1 : 1;
      const unsigned = mantissaText.replace(/^[+-]/, "");
      const [whole = "0", fraction = ""] = unsigned.split(".");
      const digits = `${whole || "0"}${fraction}`.replace(/^0+(?=\d)/, "") || "0";
      let n = sign * Number(digits);
      let d = 10 ** fraction.length;
      if (exponent > 0) n *= 10 ** exponent;
      if (exponent < 0) d *= 10 ** -exponent;
      if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d)) throw new Error("number too large");
      return reduce(n, d);
    }
    throw new Error("请输入整数、小数或分数，例如 -3/4");
  }

  function reduce(n, d = 1) {
    n = Math.trunc(Number(n));
    d = Math.trunc(Number(d));
    if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) throw new Error("invalid rational");
    if (d < 0) {
      n = -n;
      d = -d;
    }
    const g = gcdInt(n, d);
    return { n: n / g, d: d / g };
  }

  function R(value, denominator = 1) {
    if (typeof value === "object" && value && "n" in value && "d" in value) return reduce(value.n, value.d);
    if (typeof value === "string" && denominator === 1) return parseDecimalString(value);
    if (denominator !== 1) return reduce(value, denominator);
    if (typeof value === "number" && Number.isInteger(value)) return reduce(value, 1);
    return parseDecimalString(String(value ?? 0));
  }

  const rAdd = (a, b) => reduce(a.n * b.d + b.n * a.d, a.d * b.d);
  const rSub = (a, b) => reduce(a.n * b.d - b.n * a.d, a.d * b.d);
  const rMul = (a, b) => reduce(a.n * b.n, a.d * b.d);
  const rNeg = (a) => reduce(-a.n, a.d);
  const rEq = (a, b) => a.n === b.n && a.d === b.d;
  const rIsZero = (a) => a.n === 0;
  const rToNum = (a) => a.n / a.d;
  const rAbs = (a) => reduce(Math.abs(a.n), a.d);
  const rCmp = (a, b) => a.n * b.d - b.n * a.d;
  function rDiv(a, b) {
    if (rIsZero(b)) throw new Error("除数不能为 0");
    return reduce(a.n * b.d, a.d * b.n);
  }

  function formatR(a) {
    return a.d === 1 ? String(a.n) : `${a.n}/${a.d}`;
  }

  function formatRTex(a) {
    if (a.d === 1) return String(a.n);
    const sign = a.n < 0 ? "-" : "";
    return `${sign}\\frac{${Math.abs(a.n)}}{${a.d}}`;
  }

  function polyFrom(values) {
    return normalizePoly((values || []).map((value) => R(value)));
  }

  function normalizePoly(coeffs) {
    const out = (coeffs || []).map((c) => R(c));
    if (!out.length) out.push(R(0));
    while (out.length > 1 && rIsZero(out[out.length - 1])) out.pop();
    return out;
  }

  function isZeroPoly(poly) {
    const p = normalizePoly(poly);
    return p.length === 1 && rIsZero(p[0]);
  }

  function deg(poly) {
    const p = normalizePoly(poly);
    return isZeroPoly(p) ? -Infinity : p.length - 1;
  }

  function leading(poly) {
    const p = normalizePoly(poly);
    return p[p.length - 1];
  }

  function polyEq(a, b) {
    const A = normalizePoly(a);
    const B = normalizePoly(b);
    return A.length === B.length && A.every((c, i) => rEq(c, B[i]));
  }

  function polyAdd(a, b) {
    const n = Math.max(a.length, b.length);
    return normalizePoly(Array.from({ length: n }, (_, i) => rAdd(a[i] || R(0), b[i] || R(0))));
  }

  function polySub(a, b) {
    return polyAdd(a, b.map(rNeg));
  }

  function polyScale(poly, scalar) {
    const s = R(scalar);
    return normalizePoly(poly.map((c) => rMul(c, s)));
  }

  function monomial(coefficient, degree) {
    const out = Array(Math.max(0, degree) + 1).fill(null).map(() => R(0));
    out[Math.max(0, degree)] = R(coefficient);
    return normalizePoly(out);
  }

  function polyMul(a, b) {
    if (isZeroPoly(a) || isZeroPoly(b)) return [R(0)];
    const out = Array(a.length + b.length - 1).fill(null).map(() => R(0));
    a.forEach((ca, i) => b.forEach((cb, j) => {
      out[i + j] = rAdd(out[i + j], rMul(ca, cb));
    }));
    return normalizePoly(out);
  }

  function polyDiv(f, g) {
    const F = normalizePoly(f);
    const G = normalizePoly(g);
    if (isZeroPoly(G)) throw new Error("不能除以零多项式");
    let rem = F;
    let q = [R(0)];
    while (!isZeroPoly(rem) && deg(rem) >= deg(G)) {
      const d = deg(rem) - deg(G);
      const coefficient = rDiv(leading(rem), leading(G));
      q = polyAdd(q, monomial(coefficient, d));
      rem = polySub(rem, polyMul(monomial(coefficient, d), G));
    }
    return { q: normalizePoly(q), r: normalizePoly(rem) };
  }

  const polyMod = (f, g) => polyDiv(f, g).r;
  function makeMonic(poly) {
    return isZeroPoly(poly) ? [R(0)] : polyScale(poly, rDiv(R(1), leading(poly)));
  }

  function polyGcd(a, b) {
    let A = normalizePoly(a);
    let B = normalizePoly(b);
    while (!isZeroPoly(B)) {
      [A, B] = [B, polyMod(A, B)];
    }
    return makeMonic(A);
  }

  function polyDerivative(poly) {
    const p = normalizePoly(poly);
    if (p.length <= 1) return [R(0)];
    return normalizePoly(p.slice(1).map((c, i) => rMul(c, R(i + 1))));
  }

  function evalPoly(poly, value) {
    const x = R(value);
    let acc = R(0);
    for (let i = poly.length - 1; i >= 0; i--) acc = rAdd(rMul(acc, x), poly[i] || R(0));
    return acc;
  }

  function evalPolyNum(poly, x) {
    let acc = 0;
    for (let i = poly.length - 1; i >= 0; i--) acc = acc * x + rToNum(poly[i] || R(0));
    return acc;
  }

  function formatPolyTex(poly, variable = "x") {
    const p = normalizePoly(poly);
    if (isZeroPoly(p)) return "0";
    const parts = [];
    for (let i = p.length - 1; i >= 0; i--) {
      const c = p[i];
      if (rIsZero(c)) continue;
      const abs = rAbs(c);
      let body = "";
      if (i === 0) body = formatRTex(abs);
      else if (i === 1) body = rEq(abs, R(1)) ? variable : `${formatRTex(abs)}${variable}`;
      else body = rEq(abs, R(1)) ? `${variable}^{${i}}` : `${formatRTex(abs)}${variable}^{${i}}`;
      const sign = c.n < 0 ? "-" : parts.length ? "+" : "";
      parts.push(sign ? `${sign} ${body}` : body);
    }
    return parts.join(" ");
  }

  function formatCoefficients(poly, minLength = 0) {
    const p = normalizePoly(poly);
    const length = Math.max(minLength, p.length);
    return `[${Array.from({ length }, (_, i) => formatR(p[i] || R(0))).join(", ")}]`;
  }

  function coefficientPairs(a, b, degree) {
    const pairs = [];
    for (let i = 0; i < a.length; i++) {
      const j = degree - i;
      if (j < 0 || j >= b.length) continue;
      const product = rMul(a[i], b[j]);
      pairs.push({ i, j, a: a[i], b: b[j], product });
    }
    return pairs;
  }

  function editableStripHtml(poly, key, length = null) {
    const p = normalizePoly(poly);
    const count = length ?? p.length;
    return `<div class="ch1-strip" role="group" aria-label="${key} 的系数带">${Array.from({ length: count }, (_, i) => {
      const value = p[i] || R(0);
      return `<label class="ch1-strip-cell">
        <span class="ch1-strip-deg">${i === 0 ? "常数" : i === 1 ? "x" : `x^${i}`}</span>
        <input class="ch1-strip-input" type="text" inputmode="decimal" spellcheck="false"
          data-poly="${key}" data-degree="${i}" value="${formatR(value)}" aria-label="${key} 的 x^${i} 系数" />
      </label>`;
    }).join("")}</div>`;
  }

  function staticStripHtml(poly, length = null, highlight = null) {
    const p = normalizePoly(poly);
    const count = length ?? p.length;
    return `<div class="ch1-strip" role="list">${Array.from({ length: count }, (_, i) => `
      <div class="ch1-strip-cell${highlight === i ? " is-highlight" : ""}" role="listitem">
        <span class="ch1-strip-deg">${i === 0 ? "常数" : i === 1 ? "x" : `x^${i}`}</span>
        <strong class="ch1-strip-val">${formatR(p[i] || R(0))}</strong>
      </div>`).join("")}</div>`;
  }

  function divisionSteps(f, g) {
    const F = normalizePoly(f);
    const G = normalizePoly(g);
    if (isZeroPoly(G)) throw new Error("不能除以零多项式");
    const steps = [{ kind: "start", q: [R(0)], rem: F, invariant: { f: F, g: G } }];
    let q = [R(0)];
    let rem = F;
    while (!isZeroPoly(rem) && deg(rem) >= deg(G)) {
      const degree = deg(rem) - deg(G);
      const coefficient = rDiv(leading(rem), leading(G));
      const term = monomial(coefficient, degree);
      const product = polyMul(term, G);
      const next = polySub(rem, product);
      q = polyAdd(q, term);
      steps.push({
        kind: "eliminate",
        q,
        rem: next,
        remBefore: rem,
        term,
        product,
        removedDegree: deg(rem),
        invariant: { f: F, g: G },
      });
      rem = next;
    }
    steps.push({ kind: "done", q, rem, invariant: { f: F, g: G } });
    return steps;
  }

  function extendedEuclidSteps(f, g) {
    const F = normalizePoly(f);
    const G = normalizePoly(g);
    let oldR = F;
    let r = G;
    let oldS = [R(1)];
    let s = [R(0)];
    let oldT = [R(0)];
    let t = [R(1)];
    const steps = [{
      kind: "start",
      a: oldR, b: r,
      sa: oldS, ta: oldT,
      sb: s, tb: t,
    }];
    while (!isZeroPoly(r)) {
      const { q, r: nextR } = polyDiv(oldR, r);
      const nextS = polySub(oldS, polyMul(q, s));
      const nextT = polySub(oldT, polyMul(q, t));
      steps.push({
        kind: "divide",
        a: oldR, b: r, q, remainder: nextR,
        sa: oldS, ta: oldT,
        sb: s, tb: t,
        nextS, nextT,
      });
      [oldR, r] = [r, nextR];
      [oldS, s] = [s, nextS];
      [oldT, t] = [t, nextT];
    }
    const scale = rDiv(R(1), leading(oldR));
    const d = polyScale(oldR, scale);
    const finalS = polyScale(oldS, scale);
    const finalT = polyScale(oldT, scale);
    steps.push({ kind: "done", a: d, b: [R(0)], sa: finalS, ta: finalT, sb: s, tb: t });
    return steps;
  }

  function interpolate(points) {
    if (!Array.isArray(points) || !points.length) return { poly: [R(0)], bases: [] };
    const xs = points.map((p) => R(p.x));
    for (let i = 0; i < xs.length; i++) {
      for (let j = i + 1; j < xs.length; j++) {
        if (rEq(xs[i], xs[j])) throw new Error("插值节点的横坐标必须互异");
      }
    }
    const bases = [];
    let result = [R(0)];
    points.forEach((point, i) => {
      let numerator = [R(1)];
      let denominator = R(1);
      points.forEach((other, j) => {
        if (i === j) return;
        numerator = polyMul(numerator, [rNeg(R(other.x)), R(1)]);
        denominator = rMul(denominator, rSub(R(point.x), R(other.x)));
      });
      const basis = polyScale(numerator, rDiv(R(1), denominator));
      bases.push(basis);
      result = polyAdd(result, polyScale(basis, R(point.y)));
    });
    return { poly: normalizePoly(result), bases };
  }

  function getPalette() {
    const style = getComputedStyle(document.body);
    return {
      surface: style.getPropertyValue("--surface-solid").trim() || "#fff",
      soft: style.getPropertyValue("--surface-soft").trim() || "#f0f4f4",
      text: style.getPropertyValue("--text").trim() || "#10201d",
      muted: style.getPropertyValue("--muted").trim() || "#66717f",
      line: style.getPropertyValue("--line-strong").trim() || "rgba(20,40,40,.22)",
      accent: style.getPropertyValue("--accent").trim() || "#0f8f88",
      coral: style.getPropertyValue("--coral").trim() || "#d9835f",
      blue: style.getPropertyValue("--blue").trim() || "#547ec8",
    };
  }

  function setupCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width || canvas.clientWidth || 520);
    const height = Math.max(1, rect.height || canvas.clientHeight || 300);
    const dpr = Math.min(3, window.devicePixelRatio || 1);
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
    const pad = 30;
    const scale = Math.min(
      (width - pad * 2) / (bounds.xMax - bounds.xMin),
      (height - pad * 2) / (bounds.yMax - bounds.yMin),
    );
    const ox = width / 2 - ((bounds.xMin + bounds.xMax) / 2) * scale;
    const oy = height / 2 + ((bounds.yMin + bounds.yMax) / 2) * scale;
    return {
      bounds,
      scale,
      toScreen(x, y) { return { x: ox + x * scale, y: oy - y * scale }; },
      toWorld(px, py) { return { x: (px - ox) / scale, y: (oy - py) / scale }; },
    };
  }

  function drawAxes(ctx, width, height, cam, palette) {
    const origin = cam.toScreen(0, 0);
    ctx.save();
    ctx.strokeStyle = palette.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(12, origin.y); ctx.lineTo(width - 12, origin.y);
    ctx.moveTo(origin.x, 12); ctx.lineTo(origin.x, height - 12);
    ctx.stroke();
    ctx.fillStyle = palette.muted;
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    for (let value = Math.ceil(cam.bounds.xMin); value <= Math.floor(cam.bounds.xMax); value++) {
      if (!value) continue;
      const p = cam.toScreen(value, 0);
      ctx.fillText(String(value), p.x - 3, p.y + 14);
    }
    ctx.restore();
  }

  function drawPolyGraph(canvas, poly, options = {}) {
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const cam = camera(width, height, options.bounds);
    drawAxes(ctx, width, height, cam, palette);
    ctx.save();
    ctx.strokeStyle = options.color || palette.accent;
    ctx.lineWidth = options.lineWidth || 2.4;
    ctx.beginPath();
    let started = false;
    const samples = options.samples || 320;
    for (let i = 0; i <= samples; i++) {
      const x = cam.bounds.xMin + (i / samples) * (cam.bounds.xMax - cam.bounds.xMin);
      const y = evalPolyNum(poly, x);
      if (!Number.isFinite(y) || y < cam.bounds.yMin - 3 || y > cam.bounds.yMax + 3) {
        started = false;
        continue;
      }
      const point = cam.toScreen(x, y);
      if (!started) {
        ctx.moveTo(point.x, point.y);
        started = true;
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }
    ctx.stroke();
    ctx.restore();
    (options.points || []).forEach((point) => {
      const screen = cam.toScreen(point.x, point.y);
      ctx.beginPath();
      ctx.fillStyle = point.color || palette.coral;
      ctx.arc(screen.x, screen.y, point.r || 5, 0, Math.PI * 2);
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
      const p = cam.toScreen(root.x, 0);
      for (let k = 0; k < (root.m || 1); k++) {
        ctx.beginPath();
        ctx.fillStyle = root.color || palette.accent;
        ctx.arc(p.x, p.y - k * 8, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = palette.surface;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      if (root.label) {
        ctx.fillStyle = palette.text;
        ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText(root.label, p.x + 8, p.y + 18);
      }
    });
    return cam;
  }

  function drawComplexPlane(canvas, points, options = {}) {
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const cam = camera(width, height, options.bounds || { xMin: -3, xMax: 3, yMin: -3, yMax: 3 });
    drawAxes(ctx, width, height, cam, palette);
    const re = cam.toScreen(cam.bounds.xMax - 0.2, 0);
    const im = cam.toScreen(0, cam.bounds.yMax - 0.2);
    ctx.fillStyle = palette.muted;
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("Re", re.x - 14, re.y - 7);
    ctx.fillText("Im", im.x + 7, im.y + 4);
    points.forEach((point) => {
      const p = cam.toScreen(point.re, point.im);
      ctx.beginPath();
      ctx.fillStyle = point.color || palette.coral;
      ctx.arc(p.x, p.y, point.r || 6, 0, Math.PI * 2);
      ctx.fill();
      if (point.label) {
        ctx.fillStyle = palette.text;
        ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText(point.label, p.x + 8, p.y - 7);
      }
    });
    return cam;
  }

  function drawLattice(canvas, terms, options = {}) {
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const maxI = options.maxI ?? 5;
    const maxJ = options.maxJ ?? 5;
    const pad = 42;
    const cellW = (width - pad * 2) / Math.max(1, maxI);
    const cellH = (height - pad * 2) / Math.max(1, maxJ);
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    for (let i = 0; i <= maxI; i++) {
      for (let j = 0; j <= maxJ; j++) {
        const x = pad + i * cellW;
        const y = height - pad - j * cellH;
        ctx.beginPath();
        ctx.fillStyle = palette.muted;
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    (terms || []).forEach((term) => {
      const x = pad + term.i * cellW;
      const y = height - pad - term.j * cellH;
      ctx.beginPath();
      ctx.fillStyle = term.active ? palette.accent : palette.coral;
      ctx.arc(x, y, term.active ? 8 : 6, 0, Math.PI * 2);
      ctx.fill();
      if (term.label) {
        ctx.fillStyle = palette.text;
        ctx.fillText(term.label, x + 9, y - 7);
      }
    });
    ctx.fillStyle = palette.muted;
    ctx.fillText("x 指数 →", width - 78, height - 12);
    ctx.fillText("y 指数 ↑", 8, 18);
    return {
      hitTest(px, py, radius = 16) {
        let best = null;
        for (let i = 0; i <= maxI; i++) {
          for (let j = 0; j <= maxJ; j++) {
            const x = pad + i * cellW;
            const y = height - pad - j * cellH;
            const distance = Math.hypot(px - x, py - y);
            if (distance <= radius && (!best || distance < best.distance)) best = { i, j, distance };
          }
        }
        return best;
      },
    };
  }

  const reducedMotion = () => Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
  function cancelAnimation(key) {
    const id = frameIds.get(key);
    if (id) cancelAnimationFrame(id);
    frameIds.delete(key);
  }

  function animateScalar(key, from, to, duration, update) {
    cancelAnimation(key);
    if (reducedMotion() || duration <= 0) {
      update(to, 1);
      return Promise.resolve();
    }
    const start = performance.now();
    return new Promise((resolve) => {
      const tick = (now) => {
        const raw = Math.min(1, (now - start) / duration);
        const t = raw < 0.5 ? 4 * raw ** 3 : 1 - ((-2 * raw + 2) ** 3) / 2;
        update(from + (to - from) * t, raw);
        if (raw < 1) {
          frameIds.set(key, requestAnimationFrame(tick));
        } else {
          frameIds.delete(key);
          resolve();
        }
      };
      frameIds.set(key, requestAnimationFrame(tick));
    });
  }

  window.Ch1Math = {
    gcdInt, R, parseRational: R,
    rAdd, rSub, rMul, rDiv, rNeg, rEq, rIsZero, rToNum, rAbs, rCmp,
    formatR, formatRTex,
    polyFrom, normalizePoly, isZeroPoly, deg, leading, polyEq,
    polyAdd, polySub, polyScale, monomial, polyMul, polyDiv, polyMod, makeMonic, polyGcd,
    polyDerivative, evalPoly, evalPolyNum, formatPolyTex, formatCoefficients, coefficientPairs,
    editableStripHtml, staticStripHtml, divisionSteps, extendedEuclidSteps, interpolate,
    getPalette, setupCanvas, camera, drawAxes, drawPolyGraph, drawRootAxis, drawComplexPlane, drawLattice,
    reducedMotion, animateScalar, cancelAnimation,
  };
})();