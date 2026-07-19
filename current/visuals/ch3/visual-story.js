/* Chapter 3 visual stories — one invariant, three clear pictures. */
(() => {
  const M = () => window.Ch3Math;
  const texD = (source) => M()?.texD?.(source) ?? `<code>${source}</code>`;
  const esc = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
  const f = (value) => Number(Number(value).toFixed(2));

  const COLORS = {
    cyan: "#63e6e2",
    orange: "#ffb26b",
    gold: "#ffd166",
    white: "#f5f7fb",
    muted: "#9aa8b8",
    red: "#ff7b7b",
  };

  function defs() {
    return `
      <defs>
        <linearGradient id="ch3-panel-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#101d2d"></stop>
          <stop offset="1" stop-color="#0b1624"></stop>
        </linearGradient>
        <linearGradient id="ch3-area-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${COLORS.cyan}" stop-opacity=".30"></stop>
          <stop offset="1" stop-color="${COLORS.cyan}" stop-opacity=".10"></stop>
        </linearGradient>
        <filter id="ch3-soft-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.5" result="blur"></feGaussianBlur>
          <feMerge><feMergeNode in="blur"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge>
        </filter>
      </defs>`;
  }

  function arrowPath(x1, y1, x2, y2, color = "cyan", options = {}) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const px = -uy;
    const py = ux;
    const half = options.thin ? 2.2 : 3.7;
    const headLen = Math.min(22, Math.max(14, len * .19));
    const headHalf = options.thin ? 6 : 9;
    const neckX = x2 - ux * headLen;
    const neckY = y2 - uy * headLen;
    const p = (x, y) => `${f(x)} ${f(y)}`;
    const d = [
      `M ${p(x1 + px * half, y1 + py * half)}`,
      `L ${p(neckX + px * half, neckY + py * half)}`,
      `L ${p(neckX + px * headHalf, neckY + py * headHalf)}`,
      `Q ${p(x2 - ux * 3 + px, y2 - uy * 3 + py)} ${p(x2, y2)}`,
      `Q ${p(x2 - ux * 3 - px, y2 - uy * 3 - py)} ${p(neckX - px * headHalf, neckY - py * headHalf)}`,
      `L ${p(neckX - px * half, neckY - py * half)}`,
      `L ${p(x1 - px * half, y1 - py * half)}`,
      `A ${half} ${half} 0 0 0 ${p(x1 + px * half, y1 + py * half)}`,
      "Z",
    ].join(" ");
    const labelX = options.labelX ?? (x1 + dx * .58 + px * 16);
    const labelY = options.labelY ?? (y1 + dy * .58 + py * 16);
    return `<g class="ch3-arrow" style="opacity:${options.opacity ?? 1}">
      <path class="ch3-fill-${color}" d="${d}"></path>
      ${options.label ? `<text class="ch3-label ch3-text-${color}" x="${f(labelX)}" y="${f(labelY)}">${esc(options.label)}</text>` : ""}
    </g>`;
  }

  function line(x1, y1, x2, y2, color = "cyan", options = {}) {
    return `<path class="ch3-line ch3-stroke-${color}${options.dashed ? " is-dashed" : ""}${options.soft ? " is-soft" : ""}${options.thin ? " is-thin" : ""}" style="opacity:${options.opacity ?? 1}" d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}"></path>`;
  }

  function curve(d, color = "cyan", options = {}) {
    return `<path class="ch3-line ch3-stroke-${color}${options.dashed ? " is-dashed" : ""}${options.thin ? " is-thin" : ""}" style="opacity:${options.opacity ?? 1}" d="${d}"></path>`;
  }

  function dot(x, y, color = "gold", label = "", options = {}) {
    return `<g><circle class="ch3-dot ch3-fill-${color}" cx="${f(x)}" cy="${f(y)}" r="${options.r ?? 6}"></circle>
      ${label ? `<text class="ch3-label ch3-text-${color}" x="${f(options.labelX ?? x + 10)}" y="${f(options.labelY ?? y - 12)}">${esc(label)}</text>` : ""}
    </g>`;
  }

  function text(x, y, value, options = {}) {
    const cls = `ch3-scene-text${options.small ? " is-small" : ""}${options.big ? " is-big" : ""}${options.muted ? " is-muted" : ""}${options.color ? ` ch3-text-${options.color}` : ""}`;
    return `<text class="${cls}" x="${f(x)}" y="${f(y)}" text-anchor="${options.anchor ?? "start"}">${esc(value)}</text>`;
  }

  function panelFrame(x, y, w, h, index, label, metric, active) {
    return `
      <rect class="ch3-panel-bg${active ? " is-active" : ""}" x="${x}" y="${y}" width="${w}" height="${h}" rx="24"></rect>
      <text class="ch3-panel-index" x="${x + 22}" y="${y + 32}">${String(index + 1).padStart(2, "0")}</text>
      <text class="ch3-panel-label" x="${x + 55}" y="${y + 32}">${esc(label)}</text>
      <text class="ch3-panel-metric" x="${x + 22}" y="${y + h - 18}">${esc(metric)}</text>`;
  }

  function panelGroup(index, label, metric, active, content, mobile = false) {
    const x = mobile ? 52 : 28 + index * 310;
    const y = 18;
    const w = mobile ? 856 : 284;
    const h = 392;
    return `<g class="${mobile ? "ch3-mobile-panel" : "ch3-desktop-panel"}${active ? " is-active" : ""}" data-panel="${index}">
      ${panelFrame(x, y, w, h, index, label, metric, active)}
      ${content({ x, y, w, h, mobile })}
    </g>`;
  }

  function matrix(entries, x, y, options = {}) {
    const cw = options.cellW ?? 34;
    const ch = options.cellH ?? 34;
    const rows = entries.length;
    const cols = entries[0].length;
    const width = cols * cw;
    const height = rows * ch;
    const pivots = new Set((options.pivots ?? []).map(([r, c]) => `${r}:${c}`));
    const items = [];
    entries.forEach((row, r) => row.forEach((value, c) => {
      const cx = x + c * cw + cw / 2;
      const cy = y + r * ch + ch / 2 + 5;
      if (pivots.has(`${r}:${c}`)) items.push(`<circle class="ch3-pivot" cx="${cx}" cy="${cy - 5}" r="15"></circle>`);
      items.push(`<text class="ch3-matrix-number" x="${cx}" y="${cy}" text-anchor="middle">${esc(value)}</text>`);
    }));
    return `<g class="ch3-matrix">
      <path d="M${x - 8} ${y}H${x - 16}V${y + height}H${x - 8}M${x + width + 8} ${y}H${x + width + 16}V${y + height}H${x + width + 8}"></path>
      ${items.join("")}
    </g>`;
  }

  function eliminationPanel(index) {
    return (box) => {
      const { x, y, w, h, mobile } = box;
      const sx = mobile ? 1.75 : 1;
      const ox = x + (mobile ? 225 : 65);
      const oy = y + (mobile ? 288 : 260);
      if (index === 0) {
        const p = [ox + 92 * sx, oy - 90];
        return `
          ${line(ox - 10, oy - 20, ox + 190 * sx, oy - 210, "cyan")}
          ${line(ox - 5, oy - 190, ox + 196 * sx, oy - 2, "orange")}
          ${dot(p[0], p[1], "gold", "x*", { r: 7, labelX: p[0] + 12, labelY: p[1] - 12 })}
          ${text(x + 22, y + 76, "R₁ : x + y = 4", { color: "cyan", small: true })}
          ${text(x + 22, y + 101, "R₂ : 2x − y = 1", { color: "orange", small: true })}
          ${text(x + w / 2, y + h - 52, "解就是两条约束的交点", { anchor: "middle", small: true, muted: true })}`;
      }
      if (index === 1) {
        const p = [ox + 92 * sx, oy - 90];
        return `
          ${line(ox - 10, oy - 20, ox + 190 * sx, oy - 210, "cyan", { opacity: .75 })}
          ${line(ox - 5, oy - 190, ox + 196 * sx, oy - 2, "orange", { dashed: true, opacity: .22 })}
          ${line(ox - 8, p[1], ox + 200 * sx, p[1], "orange")}
          ${dot(p[0], p[1], "gold", "交点不动", { r: 7, labelX: p[0] + 12, labelY: p[1] - 12 })}
          ${text(x + 22, y + 78, "R₂ ← R₂ − 2R₁", { color: "gold", big: true })}
          ${text(x + w / 2, y + h - 52, "方程写法改变，解集保持不变", { anchor: "middle", small: true, muted: true })}`;
      }
      const mx = x + (mobile ? 160 : 32);
      return `
        ${matrix([["1", "1", "│", "4"], ["2", "−1", "│", "1"]], mx, y + 92, { cellW: mobile ? 50 : 29, cellH: 38 })}
        ${arrowPath(x + w / 2, y + 195, x + w / 2, y + 235, "gold", { thin: true })}
        ${text(x + w / 2 + 18, y + 224, "R₂−2R₁", { small: true, color: "gold" })}
        ${matrix([["1", "1", "│", "4"], ["0", "−3", "│", "−7"]], mx, y + 250, { cellW: mobile ? 50 : 29, cellH: 38, pivots: [[0, 0], [1, 1]] })}
        ${text(x + w / 2, y + h - 52, "两个主元 → 没有自由方向", { anchor: "middle", small: true, muted: true })}`;
    };
  }

  function vectorPanel(index, state) {
    return (box) => {
      const { x, y, w, h, mobile } = box;
      const scale = mobile ? 1.55 : 1;
      const O = [x + (mobile ? 220 : 58), y + 278];
      const u = [94 * scale, -74];
      const v = [68 * scale, 92];
      const a = state.alpha ?? 1;
      const b = state.beta ?? 1;
      const A = [O[0] + a * u[0], O[1] + a * u[1]];
      const T = [A[0] + b * v[0], A[1] + b * v[1]];
      const B = [O[0] + b * v[0], O[1] + b * v[1]];
      if (index === 0) {
        return `
          ${line(O[0] - 18, O[1], O[0] + 190 * scale, O[1], "white", { thin: true, opacity: .22 })}
          ${line(O[0], O[1] + 24, O[0], O[1] - 190, "white", { thin: true, opacity: .22 })}
          ${arrowPath(O[0], O[1], O[0] + u[0], O[1] + u[1], "cyan", { label: "u" })}
          ${arrowPath(O[0], O[1], O[0] + v[0], O[1] + v[1], "orange", { label: "v" })}
          ${text(x + w / 2, y + h - 52, "箭头同时表达大小与方向", { anchor: "middle", small: true, muted: true })}`;
      }
      if (index === 1) {
        return `
          ${arrowPath(O[0], O[1], A[0], A[1], "cyan", { label: "αu" })}
          ${arrowPath(A[0], A[1], T[0], T[1], "orange", { label: "βv" })}
          ${line(O[0], O[1], B[0], B[1], "white", { dashed: true, thin: true, opacity: .22 })}
          ${line(B[0], B[1], T[0], T[1], "white", { dashed: true, thin: true, opacity: .22 })}
          ${text(x + w / 2, y + h - 52, "第二段必须从第一段终点出发", { anchor: "middle", small: true, muted: true })}`;
      }
      return `
        ${arrowPath(O[0], O[1], A[0], A[1], "cyan", { label: "αu", opacity: .56 })}
        ${arrowPath(A[0], A[1], T[0], T[1], "orange", { label: "βv", opacity: .56 })}
        ${arrowPath(O[0], O[1], T[0], T[1], "gold", { label: "w", labelX: T[0] + 12, labelY: T[1] - 12 })}
        ${text(x + w / 2, y + h - 52, "终点向量就是 w = αu + βv", { anchor: "middle", small: true, muted: true })}`;
    };
  }

  function dependencePanel(index) {
    return (box) => {
      const { x, y, w, h, mobile } = box;
      const scale = mobile ? 1.6 : 1;
      const O = [x + (mobile ? 210 : 54), y + 286];
      const v1 = [106 * scale, -66];
      const v2 = [64 * scale, 94];
      const P1 = [O[0] + v1[0], O[1] + v1[1]];
      const P2 = [O[0] + v2[0], O[1] + v2[1]];
      const P3 = [P1[0] + v2[0], P1[1] + v2[1]];
      if (index === 0) {
        return `
          ${line(O[0] - 28 * scale, O[1] + 18, O[0] + 178 * scale, O[1] - 112, "cyan", { soft: true, opacity: .12 })}
          ${arrowPath(O[0], O[1], P1[0], P1[1], "cyan", { label: "v₁" })}
          ${text(x + w / 2, y + h - 52, "一个方向只能张成一条直线", { anchor: "middle", small: true, muted: true })}`;
      }
      const area = `<path class="ch3-area" d="M${O[0]} ${O[1]}L${P1[0]} ${P1[1]}L${P3[0]} ${P3[1]}L${P2[0]} ${P2[1]}Z"></path>`;
      if (index === 1) {
        return `
          ${area}
          ${arrowPath(O[0], O[1], P1[0], P1[1], "cyan", { label: "v₁" })}
          ${arrowPath(O[0], O[1], P2[0], P2[1], "orange", { label: "v₂" })}
          ${text(x + w / 2, y + h - 52, "第二个新方向把直线铺成平面", { anchor: "middle", small: true, muted: true })}`;
      }
      return `
        ${area}
        ${arrowPath(O[0], O[1], P1[0], P1[1], "cyan", { label: "v₁", opacity: .8 })}
        ${arrowPath(O[0], O[1], P2[0], P2[1], "orange", { label: "v₂", opacity: .8 })}
        ${arrowPath(O[0], O[1], P3[0], P3[1], "gold", { label: "v₃=v₁+v₂" })}
        ${text(x + w / 2, y + h - 76, "v₁ + v₂ − v₃ = 0", { anchor: "middle", color: "gold", small: true })}
        ${text(x + w / 2, y + h - 52, "v₃ 没有增加新的方向", { anchor: "middle", small: true, muted: true })}`;
    };
  }

  function rankPanel(index) {
    return (box) => {
      const { x, y, w, h, mobile } = box;
      const cx = x + w / 2;
      const cy = y + 220;
      const scale = mobile ? 1.75 : 1;
      if (index === 0) {
        const O = [cx - 80 * scale, cy + 55];
        const a1 = [110 * scale, -5];
        const a2 = [42 * scale, -120];
        const A = [O[0] + a1[0], O[1] + a1[1]];
        const B = [O[0] + a2[0], O[1] + a2[1]];
        const C = [A[0] + a2[0], A[1] + a2[1]];
        return `
          <path class="ch3-area" d="M${O[0]} ${O[1]}L${A[0]} ${A[1]}L${C[0]} ${C[1]}L${B[0]} ${B[1]}Z"></path>
          ${arrowPath(O[0], O[1], A[0], A[1], "cyan", { label: "Ae₁" })}
          ${arrowPath(O[0], O[1], B[0], B[1], "orange", { label: "Ae₂" })}
          ${text(cx, y + h - 52, "有面积 → 保留两个独立方向", { anchor: "middle", small: true, muted: true })}`;
      }
      if (index === 1) {
        const O = [cx - 92 * scale, cy + 55];
        const P1 = [cx + 95 * scale, cy - 70];
        const P2 = [cx + 25 * scale, cy - 23];
        return `
          ${line(O[0], O[1], P1[0], P1[1], "cyan", { soft: true, opacity: .12 })}
          ${arrowPath(O[0], O[1], P1[0], P1[1], "cyan", { label: "Ae₁" })}
          ${arrowPath(O[0], O[1], P2[0], P2[1], "orange", { label: "Ae₂" })}
          ${text(cx, y + h - 52, "都落在一条线 → 只剩一个方向", { anchor: "middle", small: true, muted: true })}`;
      }
      return `
        ${line(cx - 100 * scale, cy, cx + 100 * scale, cy, "white", { thin: true, opacity: .15 })}
        ${line(cx, cy - 100, cx, cy + 100, "white", { thin: true, opacity: .15 })}
        ${dot(cx, cy, "gold", "0", { r: 10, labelX: cx + 16, labelY: cy - 14 })}
        ${arrowPath(cx - 70 * scale, cy + 55, cx, cy, "cyan", { label: "Ae₁=0", opacity: .7 })}
        ${arrowPath(cx + 70 * scale, cy + 55, cx, cy, "orange", { label: "Ae₂=0", opacity: .7 })}
        ${text(cx, y + h - 52, "全部压到一点 → 没有方向留下", { anchor: "middle", small: true, muted: true })}`;
    };
  }

  function solvabilityPanel(index) {
    return (box) => {
      const { x, y, w, h, mobile } = box;
      const cx = x + w / 2;
      const cy = y + 226;
      const scale = mobile ? 1.75 : 1;
      const O = [cx - 100 * scale, cy + 60];
      const P = [cx + 95 * scale, cy - 70];
      const on = [cx + 28 * scale, cy - 25];
      const off = [cx + 25 * scale, cy - 120];
      if (index === 0) {
        return `
          ${line(O[0], O[1], P[0], P[1], "cyan", { soft: true, opacity: .13 })}
          ${arrowPath(O[0], O[1], cx + 78 * scale, cy - 58, "cyan", { label: "a₁" })}
          ${arrowPath(O[0], O[1], cx - 8 * scale, cy - 1, "orange", { label: "a₂" })}
          ${text(cx, y + h - 52, "所有线性组合形成 Col(A)", { anchor: "middle", small: true, muted: true })}`;
      }
      if (index === 1) {
        return `
          ${line(O[0], O[1], P[0], P[1], "cyan", { soft: true, opacity: .13 })}
          ${arrowPath(O[0], O[1], on[0], on[1], "gold", { label: "b" })}
          ${dot(on[0], on[1], "gold", "可达", { r: 7, labelX: on[0] + 12, labelY: on[1] - 14 })}
          ${text(cx, y + h - 76, "b ∈ Col(A)", { anchor: "middle", color: "gold", small: true })}
          ${text(cx, y + h - 52, "增广列没有增加新的方向", { anchor: "middle", small: true, muted: true })}`;
      }
      return `
        ${line(O[0], O[1], P[0], P[1], "cyan", { soft: true, opacity: .13 })}
        ${arrowPath(O[0], O[1], off[0], off[1], "orange", { label: "b" })}
        ${line(off[0], off[1], on[0], on[1], "white", { dashed: true, thin: true, opacity: .35 })}
        ${dot(off[0], off[1], "orange", "不可达", { r: 7, labelX: off[0] + 12, labelY: off[1] - 14 })}
        ${text(cx, y + h - 76, "b ∉ Col(A)", { anchor: "middle", color: "orange", small: true })}
        ${text(cx, y + h - 52, "增广列带来了新的方向", { anchor: "middle", small: true, muted: true })}`;
    };
  }

  function solutionPanel(index, state) {
    return (box) => {
      const { x, y, w, h, mobile } = box;
      const scale = mobile ? 1.7 : 1;
      const left = x + (mobile ? 230 : 70);
      const right = x + w - (mobile ? 170 : 48);
      const cy = y + 226;
      const s = state.s ?? .65;
      const x0 = [left, cy + 35];
      const eta = [72 * scale, -58];
      const xp = [x0[0] + s * eta[0], x0[1] + s * eta[1]];
      if (index === 0) {
        return `
          ${arrowPath(left - 54 * scale, cy + 74, x0[0], x0[1], "cyan", { label: "x₀" })}
          ${dot(right, cy - 15, "gold", "b", { r: 8, labelX: right + 12, labelY: cy - 28 })}
          ${curve(`M${x0[0] + 10} ${x0[1] - 10}C${left + 95 * scale} ${cy - 90} ${right - 70} ${cy - 80} ${right - 8} ${cy - 18}`, "white", { dashed: true, thin: true, opacity: .35 })}
          ${text(x + w / 2, y + h - 52, "先找到一个特解 x₀", { anchor: "middle", small: true, muted: true })}`;
      }
      if (index === 1) {
        return `
          ${line(x0[0] - 72 * scale, x0[1] + 58, x0[0] + 104 * scale, x0[1] - 84, "orange", { soft: true, opacity: .12 })}
          ${arrowPath(x0[0], x0[1], x0[0] + eta[0], x0[1] + eta[1], "orange", { label: "η" })}
          ${dot(right, cy - 15, "white", "0", { r: 8, labelX: right + 12, labelY: cy - 28 })}
          ${curve(`M${x0[0] + eta[0] * .65} ${x0[1] + eta[1] * .65}C${left + 120 * scale} ${cy - 65} ${right - 70} ${cy - 70} ${right - 8} ${cy - 18}`, "white", { dashed: true, thin: true, opacity: .35 })}
          ${text(x + w / 2, y + h - 76, "Aη = 0", { anchor: "middle", color: "orange", small: true })}
          ${text(x + w / 2, y + h - 52, "沿核方向移动不会改变输出", { anchor: "middle", small: true, muted: true })}`;
      }
      return `
        ${line(x0[0] - 95 * scale, x0[1] + 76, x0[0] + 122 * scale, x0[1] - 98, "orange", { soft: true, opacity: .13 })}
        ${dot(x0[0], x0[1], "cyan", "x₀", { r: 6, labelX: x0[0] - 8, labelY: x0[1] - 14 })}
        ${dot(xp[0], xp[1], "gold", "x", { r: 7, labelX: xp[0] + 10, labelY: xp[1] - 12 })}
        ${arrowPath(x0[0], x0[1], xp[0], xp[1], "orange", { label: "sη" })}
        ${dot(right, cy - 15, "gold", "同一个 b", { r: 8, labelX: right - 16, labelY: cy - 30 })}
        ${curve(`M${xp[0] + 8} ${xp[1] - 8}C${left + 130 * scale} ${cy - 95} ${right - 70} ${cy - 82} ${right - 8} ${cy - 18}`, "gold", { dashed: true, thin: true, opacity: .45 })}
        ${text(x + w / 2, y + h - 76, "x = x₀ + sη", { anchor: "middle", color: "gold", small: true })}
        ${text(x + w / 2, y + h - 52, "整条仿射直线都映到同一个 b", { anchor: "middle", small: true, muted: true })}`;
    };
  }

  function resultantPanel(index) {
    return (box) => {
      const { x, y, w, h, mobile } = box;
      const cx = x + w / 2;
      const scale = mobile ? 1.75 : 1;
      const baseY = y + 250;
      const left = cx - 90 * scale;
      const right = cx + 90 * scale;
      const p1 = [cx - 45 * scale, baseY - 75];
      const p2 = [cx + 45 * scale, baseY - 75];
      const circle = `M${cx - 82 * scale} ${baseY - 55}C${cx - 82 * scale} ${baseY - 155} ${cx + 82 * scale} ${baseY - 155} ${cx + 82 * scale} ${baseY - 55}C${cx + 82 * scale} ${baseY + 45} ${cx - 82 * scale} ${baseY + 45} ${cx - 82 * scale} ${baseY - 55}`;
      const parabola = `M${left} ${baseY + 16}Q${cx} ${baseY - 152} ${right} ${baseY + 16}`;
      if (index === 0) {
        return `
          ${curve(circle, "cyan")}
          ${curve(parabola, "orange")}
          ${dot(p1[0], p1[1], "gold", "P₁", { r: 7, labelX: p1[0] - 10, labelY: p1[1] - 12 })}
          ${dot(p2[0], p2[1], "gold", "P₂", { r: 7, labelX: p2[0] + 10, labelY: p2[1] - 12 })}
          ${text(cx, y + h - 52, "联立解就是两条曲线的公共点", { anchor: "middle", small: true, muted: true })}`;
      }
      if (index === 1) {
        return `
          ${curve(circle, "cyan", { opacity: .48 })}
          ${curve(parabola, "orange", { opacity: .48 })}
          ${line(left - 12, baseY + 30, right + 12, baseY + 30, "white", { thin: true, opacity: .35 })}
          ${line(p1[0], p1[1], p1[0], baseY + 30, "gold", { dashed: true, thin: true })}
          ${line(p2[0], p2[1], p2[0], baseY + 30, "gold", { dashed: true, thin: true })}
          ${dot(p1[0], baseY + 30, "gold", "x₁", { r: 5, labelX: p1[0] - 8, labelY: baseY + 54 })}
          ${dot(p2[0], baseY + 30, "gold", "x₂", { r: 5, labelX: p2[0] + 8, labelY: baseY + 54 })}
          ${text(cx, y + h - 52, "消去 y，只留下可能的横坐标", { anchor: "middle", small: true, muted: true })}`;
      }
      return `
        ${text(cx, y + 108, "R(x) = 0", { anchor: "middle", big: true, color: "gold" })}
        ${text(cx, y + 156, "候选 x₁, x₂", { anchor: "middle", color: "white" })}
        ${arrowPath(cx, y + 178, cx, y + 222, "gold", { thin: true })}
        ${text(cx, y + 264, "代回原来的两个方程", { anchor: "middle", color: "white" })}
        ${text(cx - 78, y + 310, "✓ f(xᵢ,yᵢ)=0", { color: "cyan", small: true })}
        ${text(cx - 78, y + 340, "✓ g(xᵢ,yᵢ)=0", { color: "orange", small: true })}
        ${text(cx, y + h - 52, "通过回代后才是真解", { anchor: "middle", small: true, muted: true })}`;
    };
  }

  const stories = {
    elimination: {
      kicker: "消元法 · 解集是不变量",
      title: "行变换可以改写约束，但不能移动共同解",
      subtitle: "先盯住两条直线的交点，再看同一步怎样落到增广矩阵上。",
      panels: [["原方程组", "共同交点"], ["可逆倍加", "交点不动"], ["阶梯形", "唯一解"]],
      steps: [
        ["共同交点", "两条方程各自是一条直线。方程组的解，是它们共同穿过的点。", String.raw`R_1\cap R_2=\{x^*\}`, "解集是接下来所有合法行变换都必须保持的对象。"],
        ["可逆倍加", "把一行的倍数加到另一行，新约束的样子会改变，但仍然穿过原来的共同解。", String.raw`R_2\leftarrow R_2-2R_1`, "初等行变换改变表达，不改变解集。"],
        ["读出主元", "同一步写进增广矩阵后，阶梯形直接显示主元列与自由列。", String.raw`\operatorname{rank}(A)=2`, "两个未知量都有主元，因此没有自由方向。"],
      ],
      drawPanel: eliminationPanel,
    },
    "n-vector-space": {
      kicker: "向量空间 · 线性组合",
      title: "线性组合不是三根孤立线段，而是一段连续位移",
      subtitle: "先走 αu，再从终点走 βv；从起点直达终点的箭头就是结果向量。",
      panels: [["两个方向", "u 与 v"], ["首尾相接", "αu + βv"], ["结果向量", "w"]],
      steps: [
        ["先把向量画对", "向量必须有起点、方向和终点；坐标只是这段有向位移的另一种记录。", String.raw`u=(u_1,\ldots,u_n)^T`, "箭头而不是端点，才完整表达向量。"],
        ["缩放并接续", "系数改变长度，也可能翻转方向。第二段位移必须从第一段终点开始。", String.raw`\alpha u+\beta v`, "首尾相接把两个方向组织成一个连续过程。"],
        ["闭合成结果", "从最初起点直接指向最终终点的箭头，就是线性组合得到的 w。", String.raw`w=\alpha u+\beta v`, "几何终点与逐坐标相加得到的结果完全一致。"],
      ],
      controls: "vector",
      drawPanel: vectorPanel,
    },
    "linear-dependence": {
      kicker: "线性相关 · 新方向是否出现",
      title: "相关性不是“长得相似”，而是新向量没有扩张张成空间",
      subtitle: "逐个加入向量，看张成空间的维数是否真正增加。",
      panels: [["一个方向", "一条直线"], ["加入 v₂", "铺开平面"], ["加入 v₃", "空间不变"]],
      steps: [
        ["一个向量", "只有一个非零方向时，所有倍数都落在同一条直线上。", String.raw`\operatorname{span}(v_1)`, "张成空间的维数是 1。"],
        ["增加新方向", "v₂ 不与 v₁ 共线，因此线性组合开始铺开一个二维平面。", String.raw`\dim\operatorname{span}(v_1,v_2)=2`, "真正的新方向才会增加维数。"],
        ["识别冗余", "v₃ 已经可以由 v₁ 与 v₂ 拼出，删掉它后张成的平面完全不变。", String.raw`v_3=v_1+v_2`, "存在非全零关系，就是线性相关的严格证书。"],
      ],
      drawPanel: dependencePanel,
    },
    "matrix-rank": {
      kicker: "矩阵的秩 · 变换后剩下的维数",
      title: "不要先背主元个数：看整张平面被压成了什么",
      subtitle: "二维面积、直线和点，分别对应 rank 2、rank 1 与 rank 0。",
      panels: [["保留面积", "rank(A)=2"], ["压成直线", "rank(A)=1"], ["压成一点", "rank(A)=0"]],
      steps: [
        ["二维输出", "两个基方向经过 A 后仍然不共线，单位方格变成有面积的平行四边形。", String.raw`\operatorname{rank}(A)=2`, "输出空间仍然拥有两个独立方向。"],
        ["一维输出", "两个基方向被送到同一条线上，所有二维面积都消失。", String.raw`\operatorname{rank}(A)=1`, "矩阵只保留了一个独立方向。"],
        ["零维输出", "所有输入都被送到同一个点，任何方向都没有保留下来。", String.raw`\operatorname{rank}(A)=0`, "秩就是像空间的维数。"],
      ],
      drawPanel: rankPanel,
    },
    solvability: {
      kicker: "有解判别 · 目标是否可达",
      title: "Ax=b 有没有解，只看 b 是否落在 A 的可达空间中",
      subtitle: "矩阵的列向量生成全部可能输出；b 在线上有解，在线外无解。",
      panels: [["列空间", "Col(A)"], ["b 在线上", "有解"], ["b 在线外", "无解"]],
      steps: [
        ["先看可达区域", "A 的列向量的全部线性组合，构成所有可能输出的集合。", String.raw`\operatorname{Col}(A)=\{Ax:x\in F^n\}`, "列空间就是矩阵 A 能够到达的区域。"],
        ["目标可达", "b 位于列空间中，因此至少存在一个输入 x 被 A 送到 b。", String.raw`\operatorname{rank}(A)=\operatorname{rank}([A\mid b])`, "增广列没有创造新方向，所以方程组有解。"],
        ["目标不可达", "b 落在列空间之外，无论怎样选择 x 都不能命中它。", String.raw`\operatorname{rank}(A)<\operatorname{rank}([A\mid b])`, "增广列增加了新方向，所以方程组无解。"],
      ],
      drawPanel: solvabilityPanel,
    },
    "solution-structure": {
      kicker: "解的结构 · 特解加零空间",
      title: "一个特解只是锚点；全部解沿核方向排成仿射空间",
      subtitle: "核中的方向被 A 压到零，因此沿这些方向移动不会改变输出 b。",
      panels: [["找到特解", "Ax₀=b"], ["找到核方向", "Aη=0"], ["生成全部解", "x=x₀+sη"]],
      steps: [
        ["特解是锚点", "先找到一个满足 Ax₀=b 的输入，它给出解集中的一个已知位置。", String.raw`Ax_0=b`, "x₀ 不是全部解，只是仿射解集的起点。"],
        ["核方向不改输出", "若 Aη=0，那么把 η 加到任何解上，输出都不会发生变化。", String.raw`A(x_0+\eta)=b`, "零空间给出了所有可以自由移动的方向。"],
        ["特解加齐次解", "沿 η 方向连续移动，整条仿射直线上的点都映到同一个 b。", String.raw`x=x_0+s\eta`, "非齐次方程的全部解 = 一个特解 + 齐次方程全部解。"],
      ],
      controls: "solution",
      drawPanel: solutionPanel,
    },
    "binary-higher-degree": {
      kicker: "二元高次 · 消元与回代",
      title: "消元只是把曲线交点投影成候选坐标，回代才确认真解",
      subtitle: "先看圆与抛物线的公共点，再把二维问题压缩成一元候选。",
      panels: [["曲线交点", "原问题"], ["投影到 x 轴", "候选横坐标"], ["结式与回代", "确认真解"]],
      steps: [
        ["先看几何对象", "两个多项式方程分别给出两条代数曲线，联立解就是它们的公共点。", String.raw`f(x,y)=0,\quad g(x,y)=0`, "交点是原问题，消元只是读取交点的一种方法。"],
        ["消去一个变量", "把每个交点投影到 x 轴，只留下可能出现公共点的横坐标。", String.raw`\exists y:\ f(x,y)=g(x,y)=0`, "二维交点问题被压缩成一元候选问题。"],
        ["候选必须回代", "结式给出的根只是一批候选 x；求出 y 后必须代回原来的两个方程。", String.raw`R(x)=0`, "两式同时为零，候选才重新成为真正的几何交点。"],
      ],
      drawPanel: resultantPanel,
    },
  };

  function buildSvg(config, state) {
    const desktop = config.panels.map((item, index) =>
      panelGroup(index, item[0], item[1], index === state.step, config.drawPanel(index, state), false),
    ).join("");
    const mobile = panelGroup(state.step, config.panels[state.step][0], config.panels[state.step][1], true, config.drawPanel(state.step, state), true);
    return `${defs()}<rect class="ch3-stage-bg" width="960" height="430" rx="26"></rect>${desktop}${mobile}`;
  }

  function buildControls(kind, state) {
    if (kind === "vector") {
      return `<div class="ch3-story-control-set" aria-label="线性组合系数">
        <label><span>α</span><input data-control="alpha" type="range" min="-1.4" max="1.4" step="0.05" value="${state.alpha}"><strong>${f(state.alpha)}</strong></label>
        <label><span>β</span><input data-control="beta" type="range" min="-1.4" max="1.4" step="0.05" value="${state.beta}"><strong>${f(state.beta)}</strong></label>
      </div>`;
    }
    if (kind === "solution") {
      return `<div class="ch3-story-control-set is-single" aria-label="解族参数">
        <label><span>s</span><input data-control="s" type="range" min="-1.2" max="1.2" step="0.05" value="${state.s}"><strong>${f(state.s)}</strong></label>
      </div>`;
    }
    return "";
  }

  function mountStory(section, root) {
    const config = stories[section.id];
    if (!config) return null;
    const interactive = root.querySelector(`#${CSS.escape(section.id)}-interactive`);
    const lab = interactive?.querySelector(".ch3-lab");
    if (!interactive || !lab || interactive.querySelector("[data-ch3-story]")) return null;

    const heading = interactive.querySelector(":scope > h2");
    if (heading) heading.textContent = "精确实验";

    const state = { step: 0, alpha: 1, beta: 1, s: .65 };
    const storySection = document.createElement("section");
    storySection.className = "ch3-story-section";
    storySection.innerHTML = `<h2>几何直觉</h2>`;

    const story = document.createElement("div");
    story.className = "ch3-visual-story";
    story.dataset.ch3Story = section.id;
    story.innerHTML = `
      <div class="ch3-story-stage-shell">
        <header class="ch3-stage-head"><span>${config.kicker}</span><h3>${config.title}</h3><p>${config.subtitle}</p></header>
        <svg class="ch3-story-svg" data-story-svg viewBox="0 0 960 430" role="img" aria-label="${esc(config.title)}"></svg>
        <div class="ch3-story-step-list" role="tablist" aria-label="几何推导步骤" style="--step-count:${config.steps.length}">
          ${config.steps.map((item, index) => `<button type="button" role="tab" data-story-step="${index}" aria-selected="${index === 0}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${item[0]}</strong></button>`).join("")}
        </div>
      </div>
      <div class="ch3-story-reading">
        <div class="ch3-story-copy" aria-live="polite"><span data-story-kicker></span><h4 data-story-heading></h4><p data-story-text></p><div data-story-controls></div></div>
        <div class="ch3-story-symbol"><div class="ch3-story-formula" data-story-formula></div><p data-story-conclusion></p></div>
      </div>`;
    storySection.append(story);

    const details = document.createElement("details");
    details.className = "ch3-precision-lab";
    const summary = document.createElement("summary");
    summary.innerHTML = `<span><strong>继续做精确实验</strong><small>展开 RREF、完整坐标、参数验证和数值控制</small></span><i aria-hidden="true">＋</i>`;
    lab.replaceWith(details);
    details.append(summary, lab);

    const formal = root.querySelector(`#${CSS.escape(section.id)}-formal`);
    if (formal) formal.before(storySection);
    else interactive.insertBefore(storySection, details);

    const svg = story.querySelector("[data-story-svg]");
    const buttons = [...story.querySelectorAll("[data-story-step]")];
    const controlsRoot = story.querySelector("[data-story-controls]");
    const cleanups = [];

    function bindControls() {
      controlsRoot.innerHTML = buildControls(config.controls, state);
      controlsRoot.querySelectorAll("input").forEach((input) => {
        const listener = () => {
          state[input.dataset.control] = Number(input.value);
          render(false);
        };
        input.addEventListener("input", listener);
      });
    }

    function render(rebuildControls = true) {
      const item = config.steps[state.step];
      buttons.forEach((button, index) => {
        const active = index === state.step;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", String(active));
      });
      story.querySelector("[data-story-kicker]").textContent = config.panels[state.step][0];
      story.querySelector("[data-story-heading]").textContent = item[0];
      story.querySelector("[data-story-text]").textContent = item[1];
      story.querySelector("[data-story-formula]").innerHTML = texD(item[2]);
      story.querySelector("[data-story-conclusion]").textContent = item[3];
      svg.innerHTML = buildSvg(config, state);
      if (rebuildControls) bindControls();
      else {
        controlsRoot.querySelectorAll("strong").forEach((strong, index) => {
          const key = config.controls === "vector" ? (index === 0 ? "alpha" : "beta") : "s";
          strong.textContent = f(state[key]);
        });
      }
    }

    buttons.forEach((button) => {
      const listener = () => { state.step = Number(button.dataset.storyStep); render(); };
      button.addEventListener("click", listener);
      cleanups.push(() => button.removeEventListener("click", listener));
    });

    details.addEventListener("toggle", () => { summary.querySelector("i").textContent = details.open ? "−" : "＋"; });
    render();
    return () => cleanups.splice(0).forEach((cleanup) => cleanup());
  }

  window.defineChapter3LessonEnhancer?.(mountStory);
})();