/* Chapter 3 exact linear-algebra engine and drawing helpers. */
(() => {
  const EPS = 1e-9;

  function gcd(a, b) {
    let x = Math.abs(Math.trunc(a));
    let y = Math.abs(Math.trunc(b));
    while (y) [x, y] = [y, x % y];
    return x || 1;
  }

  function F(n = 0, d = 1) {
    if (typeof n === "object" && n && Number.isFinite(n.n) && Number.isFinite(n.d)) {
      d = n.d;
      n = n.n;
    }
    n = Number(n);
    d = Number(d);
    if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) {
      throw new RangeError("Invalid rational number");
    }
    if (!Number.isInteger(n) || !Number.isInteger(d)) {
      return fromNumber(n / d);
    }
    if (d < 0) {
      n = -n;
      d = -d;
    }
    const g = gcd(n, d);
    return Object.freeze({ n: n / g, d: d / g });
  }

  function fromNumber(value, maxDenominator = 1000) {
    if (typeof value === "object" && value && "n" in value && "d" in value) return F(value.n, value.d);
    const x = Number(value);
    if (!Number.isFinite(x)) throw new RangeError("Non-finite number");
    if (Number.isInteger(x)) return F(x, 1);
    const sign = x < 0 ? -1 : 1;
    let target = Math.abs(x);
    let h1 = 1;
    let h0 = 0;
    let k1 = 0;
    let k0 = 1;
    let b = target;
    for (let i = 0; i < 24; i += 1) {
      const a = Math.floor(b);
      const h2 = a * h1 + h0;
      const k2 = a * k1 + k0;
      if (k2 > maxDenominator) break;
      [h0, h1] = [h1, h2];
      [k0, k1] = [k1, k2];
      const frac = b - a;
      if (frac < Number.EPSILON) break;
      b = 1 / frac;
    }
    return F(sign * h1, k1 || 1);
  }

  function parseF(value) {
    if (typeof value === "object" && value && "n" in value) return F(value);
    if (typeof value === "number") return fromNumber(value);
    const text = String(value ?? "").trim().replace(/−/g, "-");
    if (!text) return F(0);
    const fraction = text.match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/);
    if (fraction) return F(Number(fraction[1]), Number(fraction[2]));
    const n = Number(text);
    if (!Number.isFinite(n)) throw new TypeError(`Cannot parse rational: ${text}`);
    return fromNumber(n);
  }

  const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
  const sub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
  const mul = (a, b) => F(a.n * b.n, a.d * b.d);
  function div(a, b) {
    if (!b || b.n === 0) throw new RangeError("Division by zero");
    return F(a.n * b.d, a.d * b.n);
  }
  const neg = (a) => F(-a.n, a.d);
  const isZero = (a) => !a || a.n === 0;
  const eq = (a, b) => Boolean(a && b && a.n === b.n && a.d === b.d);
  const toNumber = (a) => (a ? a.n / a.d : 0);
  const absF = (a) => F(Math.abs(a.n), a.d);

  function formatF(a) {
    if (!a || a.n === 0) return "0";
    return a.d === 1 ? String(a.n) : `${a.n}/${a.d}`;
  }

  function latexF(a) {
    if (!a || a.n === 0) return "0";
    if (a.d === 1) return String(a.n);
    return a.n < 0 ? `-\\frac{${-a.n}}{${a.d}}` : `\\frac{${a.n}}{${a.d}}`;
  }

  function formatNumber(value, digits = 2) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "0";
    const rounded = Math.round(n * 10 ** digits) / 10 ** digits;
    return Math.abs(rounded) < 10 ** (-(digits + 1)) ? "0" : String(rounded);
  }

  function cloneMat(matrix) {
    return matrix.map((row) => row.map((value) => F(value)));
  }

  function matFromNumbers(rows) {
    return rows.map((row) => row.map(parseF));
  }

  function matToNumbers(matrix) {
    return matrix.map((row) => row.map(toNumber));
  }

  function rowSwap(matrix, i, j) {
    const out = cloneMat(matrix);
    [out[i], out[j]] = [out[j], out[i]];
    return out;
  }

  function rowScale(matrix, row, factor) {
    const k = parseF(factor);
    if (isZero(k)) throw new RangeError("A row may only be scaled by a nonzero number");
    const out = cloneMat(matrix);
    out[row] = out[row].map((value) => mul(value, k));
    return out;
  }

  function rowAdd(matrix, target, source, factor) {
    const k = parseF(factor);
    const out = cloneMat(matrix);
    out[target] = out[target].map((value, column) => add(value, mul(out[source][column], k)));
    return out;
  }

  function changedRows(before, after) {
    const result = [];
    after.forEach((row, i) => {
      if (!before[i] || row.some((value, j) => !eq(value, before[i][j]))) result.push(i);
    });
    return result;
  }

  function rref(matrix, pivotColumnCount = matrix[0]?.length ?? 0) {
    let out = cloneMat(matrix);
    const rows = out.length;
    const columns = out[0]?.length ?? 0;
    const pivotLimit = Math.min(pivotColumnCount, columns);
    const pivots = [];
    let pivotRow = 0;

    for (let column = 0; column < pivotLimit && pivotRow < rows; column += 1) {
      let candidate = -1;
      for (let row = pivotRow; row < rows; row += 1) {
        if (!isZero(out[row][column])) {
          if (candidate < 0 || Math.abs(toNumber(out[row][column])) > Math.abs(toNumber(out[candidate][column]))) {
            candidate = row;
          }
        }
      }
      if (candidate < 0) continue;
      if (candidate !== pivotRow) out = rowSwap(out, candidate, pivotRow);
      out = rowScale(out, pivotRow, div(F(1), out[pivotRow][column]));
      for (let row = 0; row < rows; row += 1) {
        if (row === pivotRow || isZero(out[row][column])) continue;
        out = rowAdd(out, row, pivotRow, neg(out[row][column]));
      }
      pivots.push(column);
      pivotRow += 1;
    }
    return { matrix: out, pivots };
  }

  function echelon(matrix, pivotColumnCount = matrix[0]?.length ?? 0) {
    let out = cloneMat(matrix);
    const rows = out.length;
    const columns = out[0]?.length ?? 0;
    const pivotLimit = Math.min(pivotColumnCount, columns);
    const pivots = [];
    const steps = [];
    let pivotRow = 0;

    for (let column = 0; column < pivotLimit && pivotRow < rows; column += 1) {
      let candidate = -1;
      for (let row = pivotRow; row < rows; row += 1) {
        if (!isZero(out[row][column])) {
          candidate = row;
          break;
        }
      }
      if (candidate < 0) continue;
      if (candidate !== pivotRow) {
        out = rowSwap(out, candidate, pivotRow);
        steps.push({ label: `R_${pivotRow + 1}\\leftrightarrow R_${candidate + 1}`, matrix: cloneMat(out) });
      }
      const pivot = out[pivotRow][column];
      if (!eq(pivot, F(1))) {
        out = rowScale(out, pivotRow, div(F(1), pivot));
        steps.push({ label: `R_${pivotRow + 1}\\leftarrow ${latexF(div(F(1), pivot))}R_${pivotRow + 1}`, matrix: cloneMat(out) });
      }
      for (let row = pivotRow + 1; row < rows; row += 1) {
        if (isZero(out[row][column])) continue;
        const factor = neg(out[row][column]);
        out = rowAdd(out, row, pivotRow, factor);
        steps.push({ label: `R_${row + 1}\\leftarrow R_${row + 1}+(${latexF(factor)})R_${pivotRow + 1}`, matrix: cloneMat(out) });
      }
      pivots.push(column);
      pivotRow += 1;
    }
    return { matrix: out, pivots, steps };
  }

  function analyzeAugmented(augmented) {
    const rowCount = augmented.length;
    const variableCount = (augmented[0]?.length ?? 1) - 1;
    const reduced = rref(augmented, variableCount);
    const free = [];
    for (let column = 0; column < variableCount; column += 1) {
      if (!reduced.pivots.includes(column)) free.push(column);
    }
    const inconsistentRows = [];
    reduced.matrix.forEach((row, index) => {
      if (row.slice(0, variableCount).every(isZero) && !isZero(row[variableCount])) inconsistentRows.push(index);
    });
    const rankA = reduced.pivots.length;
    const rankAug = rankA + (inconsistentRows.length ? 1 : 0);
    return {
      rref: reduced.matrix,
      pivots: reduced.pivots,
      free,
      inconsistent: inconsistentRows.length > 0,
      inconsistentRows,
      rankA,
      rankAug,
      m: rowCount,
      n: variableCount,
    };
  }

  function rankOf(matrix) {
    if (!matrix.length || !matrix[0].length) return 0;
    return rref(matrix, matrix[0].length).pivots.length;
  }

  function nullspaceBasis(matrix) {
    const A = cloneMat(matrix);
    const n = A[0]?.length ?? 0;
    const augmented = A.map((row) => [...row, F(0)]);
    const info = analyzeAugmented(augmented);
    const pivotRow = new Map(info.pivots.map((column, row) => [column, row]));
    const basis = info.free.map((freeColumn) => {
      const vector = Array.from({ length: n }, () => F(0));
      vector[freeColumn] = F(1);
      info.pivots.forEach((pivotColumn) => {
        vector[pivotColumn] = neg(info.rref[pivotRow.get(pivotColumn)][freeColumn]);
      });
      return vector;
    });
    return { basis, info };
  }

  function particularSolution(augmented) {
    const info = analyzeAugmented(augmented);
    if (info.inconsistent) return { ok: false, x: [], info };
    const x = Array.from({ length: info.n }, () => F(0));
    info.pivots.forEach((pivotColumn, row) => {
      x[pivotColumn] = info.rref[row][info.n];
    });
    return { ok: true, x, info };
  }

  function classifySystem(augmented) {
    const info = analyzeAugmented(augmented);
    if (info.inconsistent) return { key: "none", label: "无解", cls: "is-bad", info };
    if (info.free.length) return { key: "infinite", label: "无穷多解", cls: "is-inf", info };
    return { key: "unique", label: "唯一解", cls: "is-ok", info };
  }

  function matVec(matrix, vector) {
    return matrix.map((row) => row.reduce((sum, value, column) => add(sum, mul(value, vector[column])), F(0)));
  }

  function relationCertificate(vectors) {
    if (!vectors.length) return { dependent: false, coeffs: [], rank: 0 };
    const ambient = vectors[0].length;
    const matrix = Array.from({ length: ambient }, (_, row) => vectors.map((vector) => parseF(vector[row])));
    const { basis, info } = nullspaceBasis(matrix);
    if (!basis.length) return { dependent: false, coeffs: [], rank: info.rankA };
    let coeffs = basis[0].map(F);
    const denominators = coeffs.map((c) => c.d);
    const lcm = denominators.reduce((acc, value) => (acc * value) / gcd(acc, value), 1);
    coeffs = coeffs.map((c) => F(c.n * (lcm / c.d)));
    const common = coeffs.reduce((acc, c) => gcd(acc, c.n), 0) || 1;
    coeffs = coeffs.map((c) => F(c.n / common));
    const first = coeffs.find((c) => !isZero(c));
    if (first?.n < 0) coeffs = coeffs.map(neg);
    return { dependent: true, coeffs, rank: info.rankA };
  }

  function determinant(matrix) {
    const n = matrix.length;
    if (!n || matrix.some((row) => row.length !== n)) throw new TypeError("Determinant requires a square matrix");
    if (n === 1) return F(matrix[0][0]);
    if (n === 2) return sub(mul(matrix[0][0], matrix[1][1]), mul(matrix[0][1], matrix[1][0]));
    let sum = F(0);
    matrix[0].forEach((value, column) => {
      const minor = matrix.slice(1).map((row) => row.filter((_, j) => j !== column));
      const term = mul(value, determinant(minor));
      sum = column % 2 === 0 ? add(sum, term) : sub(sum, term);
    });
    return sum;
  }

  function combinations(items, choose) {
    const out = [];
    function walk(start, picked) {
      if (picked.length === choose) {
        out.push(picked.slice());
        return;
      }
      for (let i = start; i <= items.length - (choose - picked.length); i += 1) {
        picked.push(items[i]);
        walk(i + 1, picked);
        picked.pop();
      }
    }
    walk(0, []);
    return out;
  }

  function findRankCertificate(matrix) {
    const rank = rankOf(matrix);
    if (rank === 0) return { rank, rows: [], columns: [], det: F(0) };
    const rowSets = combinations(Array.from({ length: matrix.length }, (_, i) => i), rank);
    const columnSets = combinations(Array.from({ length: matrix[0].length }, (_, i) => i), rank);
    for (const rows of rowSets) {
      for (const columns of columnSets) {
        const minor = rows.map((row) => columns.map((column) => matrix[row][column]));
        const det = determinant(minor);
        if (!isZero(det)) return { rank, rows, columns, det };
      }
    }
    return { rank, rows: [], columns: [], det: F(0) };
  }

  function independentColumnIndices(matrix) {
    return rref(matrix, matrix[0]?.length ?? 0).pivots;
  }

  function latexMatrix(matrix, barAt = null) {
    const alignment = barAt == null ? "" : `{@{}${"c".repeat(barAt)}|${"c".repeat(matrix[0].length - barAt)}@{}}`;
    const env = barAt == null ? "bmatrix" : "array";
    const body = matrix.map((row) => row.map(latexF).join(" & ")).join(" \\\\ ");
    return barAt == null
      ? `\\begin{${env}}${body}\\end{${env}}`
      : `\\left[\\begin{array}${alignment}${body}\\end{array}\\right]`;
  }

  function latexVector(vector) {
    return `\\begin{bmatrix}${vector.map(latexF).join(" \\\\ ")}\\end{bmatrix}`;
  }

  function latexRelation(coeffs, names = coeffs.map((_, i) => `v_{${i + 1}}`)) {
    const terms = [];
    coeffs.forEach((coefficient, index) => {
      if (isZero(coefficient)) return;
      const magnitude = absF(coefficient);
      const coeff = eq(magnitude, F(1)) ? "" : latexF(magnitude);
      const body = `${coeff}${names[index]}`;
      if (!terms.length) terms.push(coefficient.n < 0 ? `-${body}` : body);
      else terms.push(coefficient.n < 0 ? `- ${body}` : `+ ${body}`);
    });
    return `${terms.join(" ") || "0"}=0`;
  }

  function latexEquation(row, variableCount) {
    const names = variableCount <= 3 ? ["x", "y", "z"] : [];
    const terms = [];
    for (let column = 0; column < variableCount; column += 1) {
      const coefficient = row[column];
      if (isZero(coefficient)) continue;
      const variable = names[column] || `x_{${column + 1}}`;
      const magnitude = absF(coefficient);
      const coeff = eq(magnitude, F(1)) ? "" : latexF(magnitude);
      const body = `${coeff}${variable}`;
      if (!terms.length) terms.push(coefficient.n < 0 ? `-${body}` : body);
      else terms.push(coefficient.n < 0 ? `- ${body}` : `+ ${body}`);
    }
    return `${terms.join(" ") || "0"}=${latexF(row[variableCount])}`;
  }

  const tex = (source) => (window.texInline ? window.texInline(source) : escapeHtml(source));
  const texD = (source) => (window.texDisplay ? window.texDisplay(source) : escapeHtml(source));
  const htmlMatrix = (matrix, barAt = null) => `<div class="ch3-math">${texD(latexMatrix(matrix, barAt))}</div>`;
  const htmlVector = (vector) => `<span class="ch3-vector">${tex(latexVector(vector))}</span>`;

  function htmlEquations(augmented, highlighted = []) {
    const variableCount = augmented[0].length - 1;
    return `<div class="ch3-equations">${augmented
      .map(
        (row, index) =>
          `<div class="ch3-equation${highlighted.includes(index) ? " is-changed" : ""}"><span class="ch3-row-label">R${index + 1}</span>${tex(latexEquation(row, variableCount))}</div>`,
      )
      .join("")}</div>`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function palette() {
    const styles = getComputedStyle(document.body);
    const read = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
    return {
      text: read("--text", "#18201d"),
      muted: read("--muted", "#6b756f"),
      line: read("--line", "#d9dfdc"),
      surface: read("--surface-solid", "#ffffff"),
      accent: read("--accent", "#2f8f72"),
      accentStrong: read("--accent-strong", "#176f57"),
      blue: read("--blue", "#547ec8"),
      coral: read("--coral", "#d9835f"),
    };
  }

  function sizeCanvas(canvas) {
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return { ctx, width, height, dpr };
  }

  function drawAxes(ctx, width, height, scale = 44) {
    const p = palette();
    const cx = width / 2;
    const cy = height / 2;
    ctx.save();
    ctx.strokeStyle = p.line;
    ctx.lineWidth = 1;
    for (let x = cx % scale; x < width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = cy % scale; y < height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.strokeStyle = p.muted;
    ctx.lineWidth = 1.35;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();
    ctx.restore();
    return { ctx, width, height, scale, cx, cy, p };
  }

  const toCanvas = (frame, point) => [frame.cx + point[0] * frame.scale, frame.cy - point[1] * frame.scale];
  const toWorld = (frame, point) => [(point[0] - frame.cx) / frame.scale, (frame.cy - point[1]) / frame.scale];

  function drawArrow(ctx, frame, point, color, label = "", width = 2.6) {
    const [x, y] = toCanvas(frame, point);
    const [ox, oy] = [frame.cx, frame.cy];
    const angle = Math.atan2(y - oy, x - ox);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 10 * Math.cos(angle - Math.PI / 6), y - 10 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x - 10 * Math.cos(angle + Math.PI / 6), y - 10 * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = frame.p.surface;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    if (label) {
      ctx.fillStyle = color;
      ctx.font = "700 12px ui-sans-serif, system-ui";
      ctx.fillText(label, x + 8, y - 8);
    }
    ctx.restore();
  }

  function drawPoint(ctx, frame, point, color, label = "", radius = 5) {
    const [x, y] = toCanvas(frame, point);
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    if (label) {
      ctx.font = "700 12px ui-sans-serif, system-ui";
      ctx.fillText(label, x + 8, y - 8);
    }
    ctx.restore();
  }

  function drawLineEquation(ctx, frame, a, b, c, color, width = 2.3) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    const limit = Math.max(frame.width, frame.height) / frame.scale + 3;
    let p1;
    let p2;
    if (Math.abs(b) > EPS) {
      p1 = [-limit, (c + a * limit) / b];
      p2 = [limit, (c - a * limit) / b];
    } else if (Math.abs(a) > EPS) {
      p1 = [c / a, -limit];
      p2 = [c / a, limit];
    } else {
      ctx.restore();
      return;
    }
    const A = toCanvas(frame, p1);
    const B = toCanvas(frame, p2);
    ctx.beginPath();
    ctx.moveTo(A[0], A[1]);
    ctx.lineTo(B[0], B[1]);
    ctx.stroke();
    ctx.restore();
  }

  function drawSpan(ctx, frame, vectors, color) {
    const cert = relationCertificate(vectors);
    ctx.save();
    if (cert.rank >= 2) {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.08;
      ctx.fillRect(0, 0, frame.width, frame.height);
    } else if (cert.rank === 1) {
      const vector = vectors.find((v) => Math.hypot(v[0], v[1]) > EPS) || [1, 0];
      const A = toCanvas(frame, [-12 * vector[0], -12 * vector[1]]);
      const B = toCanvas(frame, [12 * vector[0], 12 * vector[1]]);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(A[0], A[1]);
      ctx.lineTo(B[0], B[1]);
      ctx.stroke();
    }
    ctx.restore();
  }

  function createScope(root) {
    const cleanups = [];
    const listen = (target, type, handler, options) => {
      target?.addEventListener(type, handler, options);
      cleanups.push(() => target?.removeEventListener(type, handler, options));
      return handler;
    };
    const resize = (handler) => listen(window, "resize", () => {
      if (document.body.contains(root)) handler();
    }, { passive: true });
    const cleanup = () => {
      while (cleanups.length) {
        try {
          cleanups.pop()();
        } catch (_) {
          // Ignore teardown failures; a stale lesson must never break navigation.
        }
      }
    };
    return { listen, resize, cleanup };
  }

  function bindDraggablePoints(scope, canvas, getPoints, setPoint, redraw, radius = 16) {
    let active = -1;
    function frameForEvent() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      return {
        width: rect.width,
        height: rect.height,
        scale: 44,
        cx: rect.width / 2,
        cy: rect.height / 2,
        p: palette(),
      };
    }
    scope.listen(canvas, "pointerdown", (event) => {
      const frame = frameForEvent();
      if (!frame) return;
      const rect = canvas.getBoundingClientRect();
      const pointer = [event.clientX - rect.left, event.clientY - rect.top];
      const points = getPoints();
      let best = Infinity;
      points.forEach((point, index) => {
        const [x, y] = toCanvas(frame, point);
        const distance = Math.hypot(x - pointer[0], y - pointer[1]);
        if (distance < radius && distance < best) {
          active = index;
          best = distance;
        }
      });
      if (active >= 0) {
        canvas.setPointerCapture(event.pointerId);
        event.preventDefault();
      }
    });
    scope.listen(canvas, "pointermove", (event) => {
      if (active < 0) return;
      const frame = frameForEvent();
      const rect = canvas.getBoundingClientRect();
      const world = toWorld(frame, [event.clientX - rect.left, event.clientY - rect.top]);
      setPoint(active, world.map((value) => Math.round(value * 20) / 20));
      redraw();
    });
    const release = (event) => {
      if (active >= 0 && canvas.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      active = -1;
    };
    scope.listen(canvas, "pointerup", release);
    scope.listen(canvas, "pointercancel", release);
  }

  function pulse(element) {
    if (!element || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    element.classList.remove("is-pulse");
    void element.offsetWidth;
    element.classList.add("is-pulse");
  }

  const PRESETS = Object.freeze({
    systems: {
      unique2: { label: "唯一解", aug: [[1, 1, 3], [1, 2, 4]] },
      parallel2: { label: "平行无解", aug: [[1, 1, 2], [2, 2, 5]] },
      sameLine2: { label: "重合无穷多解", aug: [[1, 1, 2], [2, 2, 4]] },
      swapPivot: { label: "需要换行", aug: [[0, 1, 2], [1, 1, 3]] },
      upper3: { label: "三元上三角", aug: [[1, 1, 1, 6], [0, 1, 1, 3], [0, 0, 1, 1]] },
    },
    rank: {
      full2: { label: "满秩 2×2", A: [[1, 0], [0, 1]] },
      rankOne: { label: "秩一外积", A: [[1, 2], [2, 4]] },
      fullCol32: { label: "3×2 满列秩", A: [[1, 0], [0, 1], [1, 1]] },
      dependent33: { label: "3×3 秩二", A: [[1, 2, 3], [2, 4, 6], [0, 1, 1]] },
    },
  });

  window.Ch3Math = Object.freeze({
    EPS,
    F,
    fromNumber,
    parseF,
    add,
    sub,
    mul,
    div,
    neg,
    absF,
    isZero,
    eq,
    toNumber,
    formatF,
    latexF,
    formatNumber,
    cloneMat,
    matFromNumbers,
    matToNumbers,
    rowSwap,
    rowScale,
    rowAdd,
    changedRows,
    rref,
    echelon,
    analyzeAugmented,
    rankOf,
    nullspaceBasis,
    particularSolution,
    classifySystem,
    matVec,
    relationCertificate,
    determinant,
    findRankCertificate,
    independentColumnIndices,
    latexMatrix,
    latexVector,
    latexRelation,
    latexEquation,
    tex,
    texD,
    htmlMatrix,
    htmlVector,
    htmlEquations,
    escapeHtml,
    palette,
    sizeCanvas,
    drawAxes,
    toCanvas,
    toWorld,
    drawArrow,
    drawPoint,
    drawLineEquation,
    drawSpan,
    createScope,
    bindDraggablePoints,
    pulse,
    PRESETS,
  });
})();
