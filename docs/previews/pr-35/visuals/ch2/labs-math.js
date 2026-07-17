/* Shared determinant / matrix helpers for Chapter 2 labs. */
(() => {
  const EPS = 1e-9;

  function det2(a, b, c, d) {
    return a * d - b * c;
  }

  function det3(m) {
    const [[a, b, c], [d, e, f], [g, h, i]] = m;
    return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  }

  function cloneMatrix(m) {
    return m.map((row) => row.slice());
  }

  function formatNum(value, digits = 2) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "0";
    if (Math.abs(n) < 5 * 10 ** -(digits + 1)) return "0";
    return n.toFixed(digits).replace(/\.?0+$/, "");
  }

  function inversionPairs(perm) {
    const pairs = [];
    for (let i = 0; i < perm.length; i += 1) {
      for (let j = i + 1; j < perm.length; j += 1) {
        if (perm[i] > perm[j]) pairs.push([perm[i], perm[j]]);
      }
    }
    return pairs;
  }

  function signFromPerm(perm) {
    const tau = inversionPairs(perm).length;
    return tau % 2 === 0 ? 1 : -1;
  }

  function permutations(n) {
    const base = Array.from({ length: n }, (_, i) => i + 1);
    const out = [];
    const used = Array(n).fill(false);
    const cur = [];
    function dfs() {
      if (cur.length === n) {
        out.push(cur.slice());
        return;
      }
      for (let i = 0; i < n; i += 1) {
        if (used[i]) continue;
        used[i] = true;
        cur.push(base[i]);
        dfs();
        cur.pop();
        used[i] = false;
      }
    }
    dfs();
    return out;
  }

  function minorMatrix(m, row, col) {
    return m.filter((_, r) => r !== row).map((line) => line.filter((_, c) => c !== col));
  }

  function drawAxes(ctx, width, height, origin, scale) {
    ctx.save();
    ctx.strokeStyle = "rgba(120,140,160,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, origin.y);
    ctx.lineTo(width - 20, origin.y);
    ctx.moveTo(origin.x, 20);
    ctx.lineTo(origin.x, height - 20);
    ctx.stroke();
    ctx.restore();
  }

  function toCanvas(origin, scale, x, y) {
    return { x: origin.x + x * scale, y: origin.y - y * scale };
  }

  function drawArrow(ctx, from, to, color, width = 2.5) {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - 10 * Math.cos(angle - 0.35), to.y - 10 * Math.sin(angle - 0.35));
    ctx.lineTo(to.x - 10 * Math.cos(angle + 0.35), to.y - 10 * Math.sin(angle + 0.35));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawParallelogram(ctx, origin, scale, c1, c2, fill, stroke) {
    const o = origin;
    const p1 = toCanvas(o, scale, c1[0], c1[1]);
    const p2 = toCanvas(o, scale, c1[0] + c2[0], c1[1] + c2[1]);
    const p3 = toCanvas(o, scale, c2[0], c2[1]);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(o.x, o.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return { p1, p2, p3 };
  }

  window.Ch2Math = {
    EPS,
    det2,
    det3,
    cloneMatrix,
    formatNum,
    inversionPairs,
    signFromPerm,
    permutations,
    minorMatrix,
    drawAxes,
    toCanvas,
    drawArrow,
    drawParallelogram,
  };
})();
