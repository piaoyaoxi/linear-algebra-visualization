/* Chapter 3 cinematic SVG stories: geometry first, exact lab second. */
(() => {
  const M = () => window.Ch3Math;
  const tex = (source) => M()?.tex?.(source) ?? `<code>${source}</code>`;
  const texD = (source) => M()?.texD?.(source) ?? `<code>${source}</code>`;

  const esc = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

  const f = (value) => Number(value.toFixed(2));

  function svgDefs() {
    return `
      <defs>
        <marker id="ch3-arrow-accent" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path class="ch3-svg-fill-accent" d="M1 1 11 6 1 11Z"></path></marker>
        <marker id="ch3-arrow-coral" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path class="ch3-svg-fill-coral" d="M1 1 11 6 1 11Z"></path></marker>
        <marker id="ch3-arrow-blue" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path class="ch3-svg-fill-blue" d="M1 1 11 6 1 11Z"></path></marker>
        <marker id="ch3-arrow-muted" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path class="ch3-svg-fill-muted" d="M1 1 11 6 1 11Z"></path></marker>
        <filter id="ch3-soft-shadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="4" stdDeviation="7" flood-opacity="0.12"/></filter>
      </defs>`;
  }

  function grid({ x = 40, y = 30, width = 740, height = 390, step = 52 } = {}) {
    const vertical = [];
    const horizontal = [];
    for (let gx = x; gx <= x + width + 0.1; gx += step) vertical.push(`<path d="M${f(gx)} ${y}V${y + height}"></path>`);
    for (let gy = y; gy <= y + height + 0.1; gy += step) horizontal.push(`<path d="M${x} ${f(gy)}H${x + width}"></path>`);
    return `<g class="ch3-svg-grid">${vertical.join("")}${horizontal.join("")}</g>`;
  }

  function axes(ox = 390, oy = 244, x1 = 44, x2 = 778, y1 = 34, y2 = 420) {
    return `<g class="ch3-svg-axes"><path d="M${x1} ${oy}H${x2}"></path><path d="M${ox} ${y2}V${y1}"></path><text x="${x2 - 8}" y="${oy - 10}">x₁</text><text x="${ox + 10}" y="${y1 + 12}">x₂</text></g>`;
  }

  function arrow(x1, y1, x2, y2, color = "accent", label = "", options = {}) {
    const marker = options.marker === false ? "" : ` marker-end="url(#ch3-arrow-${color})"`;
    const dashed = options.dashed ? " ch3-svg-dashed" : "";
    const thin = options.thin ? " ch3-svg-thin" : "";
    const opacity = options.opacity == null ? 1 : options.opacity;
    const labelX = options.labelX ?? ((x1 + x2) / 2);
    const labelY = options.labelY ?? ((y1 + y2) / 2 - 12);
    return `
      <g class="ch3-svg-arrow-group ch3-story-animate" style="--story-delay:${options.delay ?? 0}ms;opacity:${opacity}">
        <path class="ch3-svg-stroke-${color}${dashed}${thin}" d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}"${marker}></path>
        ${label ? `<g class="ch3-svg-label ch3-svg-label-${color}" transform="translate(${f(labelX)} ${f(labelY)})"><rect x="-24" y="-14" width="48" height="28" rx="14"></rect><text text-anchor="middle" dominant-baseline="middle">${esc(label)}</text></g>` : ""}
      </g>`;
  }

  function point(x, y, color = "blue", label = "", options = {}) {
    return `<g class="ch3-story-animate" style="--story-delay:${options.delay ?? 0}ms"><circle class="ch3-svg-point ch3-svg-fill-${color}" cx="${f(x)}" cy="${f(y)}" r="${options.r ?? 7}"></circle>${label ? `<g class="ch3-svg-label ch3-svg-label-${color}" transform="translate(${f(options.labelX ?? x + 34)} ${f(options.labelY ?? y - 25)})"><rect x="-24" y="-14" width="48" height="28" rx="14"></rect><text text-anchor="middle" dominant-baseline="middle">${esc(label)}</text></g>` : ""}</g>`;
  }

  function line(x1, y1, x2, y2, color = "accent", options = {}) {
    return `<path class="ch3-svg-stroke-${color}${options.dashed ? " ch3-svg-dashed" : ""}${options.thick ? " ch3-svg-thick" : ""}${options.soft ? " ch3-svg-soft" : ""} ch3-story-animate" style="--story-delay:${options.delay ?? 0}ms;opacity:${options.opacity ?? 1}" d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}"></path>`;
  }

  function bracketMatrix(entries, x, y, options = {}) {
    const rows = entries.length;
    const cols = entries[0].length;
    const cellW = options.cellW ?? 44;
    const cellH = options.cellH ?? 38;
    const width = cols * cellW;
    const height = rows * cellH;
    const pivotSet = new Set((options.pivots ?? []).map(([r, c]) => `${r}:${c}`));
    let cells = "";
    entries.forEach((row, r) => row.forEach((value, c) => {
      cells += `<g class="${pivotSet.has(`${r}:${c}`) ? "is-pivot" : ""}" transform="translate(${x + c * cellW + cellW / 2} ${y + r * cellH + cellH / 2})"><rect x="-${cellW / 2 - 3}" y="-${cellH / 2 - 3}" width="${cellW - 6}" height="${cellH - 6}" rx="9"></rect><text text-anchor="middle" dominant-baseline="middle">${esc(value)}</text></g>`;
    }));
    return `<g class="ch3-svg-matrix ch3-story-animate" style="--story-delay:${options.delay ?? 0}ms"><path d="M${x - 10} ${y}H${x - 18}V${y + height}H${x - 10}"></path><path d="M${x + width + 10} ${y}H${x + width + 18}V${y + height}H${x + width + 10}"></path>${cells}</g>`;
  }

  function storyElimination(step) {
    const P = { x: 472, y: 218 };
    const base = `${svgDefs()}${grid()}${axes(390, 244)}`;
    if (step === 0) {
      return `${base}
        ${line(110, 360, 700, 84, "accent", { thick: true })}
        ${line(120, 76, 710, 344, "coral", { thick: true, delay: 90 })}
        ${point(P.x, P.y, "blue", "解 x*", { delay: 190, labelX: 530, labelY: 178 })}
        <g class="ch3-svg-equation-label ch3-story-animate" style="--story-delay:120ms" transform="translate(158 100)"><rect width="150" height="42" rx="14"></rect><text x="18" y="27">R₁ : x+y=4</text></g>
        <g class="ch3-svg-equation-label is-coral ch3-story-animate" style="--story-delay:180ms" transform="translate(550 322)"><rect width="168" height="42" rx="14"></rect><text x="18" y="27">R₂ : 2x−y=1</text></g>`;
    }
    if (step === 1) {
      return `${base}
        ${line(110, 360, 700, 84, "accent", { thick: true, opacity: 0.48 })}
        ${line(120, 76, 710, 344, "muted", { dashed: true, opacity: 0.38 })}
        ${line(90, P.y, 748, P.y, "coral", { thick: true, delay: 160 })}
        ${point(P.x, P.y, "blue", "同一解", { delay: 260, labelX: 542, labelY: 178 })}
        <g class="ch3-svg-operation ch3-story-animate" style="--story-delay:40ms" transform="translate(70 54)"><rect width="250" height="76" rx="20"></rect><text class="small" x="20" y="28">可逆倍加</text><text x="20" y="56">R₂ ← R₂ − 2R₁</text></g>
        <g class="ch3-svg-callout ch3-story-animate" style="--story-delay:260ms" transform="translate(548 250)"><rect width="190" height="64" rx="18"></rect><text x="20" y="26">新方程变了</text><text class="small" x="20" y="49">但仍穿过同一个交点</text></g>`;
    }
    return `${svgDefs()}
      <g transform="translate(90 72)">
        <text class="ch3-svg-stage-title" x="0" y="0">从方程外观读出主元结构</text>
        ${bracketMatrix([["1", "1", "4"], ["0", "−3", "−7"]], 62, 60, { pivots: [[0, 0], [1, 1]], delay: 40 })}
        <path class="ch3-svg-flow" d="M290 117H438" marker-end="url(#ch3-arrow-muted)"></path>
        <g class="ch3-svg-pivot-story ch3-story-animate" style="--story-delay:150ms" transform="translate(462 56)">
          <rect width="250" height="170" rx="26"></rect>
          <text class="small" x="24" y="34">两个主元</text>
          <circle class="ch3-svg-fill-accent" cx="48" cy="76" r="10"></circle><text x="72" y="82">锁定 x₁</text>
          <circle class="ch3-svg-fill-coral" cx="48" cy="122" r="10"></circle><text x="72" y="128">锁定 x₂</text>
          <path class="ch3-svg-divider" d="M24 148H226"></path>
          <text class="result" x="24" y="166">没有自由方向 → 唯一解</text>
        </g>
        <g class="ch3-svg-invariant ch3-story-animate" style="--story-delay:260ms" transform="translate(104 300)"><rect width="540" height="78" rx="22"></rect><text x="26" y="31">行变换改变方程的写法</text><text class="result" x="26" y="58">不改变所有方程共同满足的解集</text></g>
      </g>`;
  }

  function vectorGeometry(alpha, beta) {
    const O = [238, 270];
    const u = [112, -74];
    const v = [72, 104];
    const A = [O[0] + alpha * u[0], O[1] + alpha * u[1]];
    const T = [A[0] + beta * v[0], A[1] + beta * v[1]];
    const B = [O[0] + beta * v[0], O[1] + beta * v[1]];
    return { O, A, T, B };
  }

  function storyVector(step, state) {
    const alpha = state.alpha ?? 1;
    const beta = state.beta ?? 1;
    const { O, A, T, B } = vectorGeometry(alpha, beta);
    const base = `${svgDefs()}${grid({ x: 38, y: 34, width: 744, height: 378, step: 46 })}${axes(O[0], O[1], 40, 782, 32, 414)}`;
    if (step === 0) {
      return `${base}
        ${arrow(O[0], O[1], O[0] + 112, O[1] - 74, "accent", "u", { labelX: O[0] + 82, labelY: O[1] - 68 })}
        ${arrow(O[0], O[1], O[0] + 72, O[1] + 104, "coral", "v", { labelX: O[0] + 36, labelY: O[1] + 92, delay: 90 })}
        <g class="ch3-svg-origin-label"><circle cx="${O[0]}" cy="${O[1]}" r="5"></circle><text x="${O[0] - 28}" y="${O[1] + 28}">O</text></g>
        <g class="ch3-svg-callout ch3-story-animate" style="--story-delay:190ms" transform="translate(526 72)"><rect width="210" height="92" rx="22"></rect><text x="20" y="30">向量 = 有向位移</text><text class="small" x="20" y="56">长度给大小</text><text class="small" x="20" y="78">箭头给方向</text></g>`;
    }
    if (step === 1) {
      return `${base}
        ${arrow(O[0], O[1], A[0], A[1], "accent", "αu", { labelX: O[0] + (A[0] - O[0]) * 0.62, labelY: O[1] + (A[1] - O[1]) * 0.62 - 18 })}
        ${arrow(A[0], A[1], T[0], T[1], "coral", "βv", { labelX: A[0] + (T[0] - A[0]) * 0.55 + 20, labelY: A[1] + (T[1] - A[1]) * 0.55, delay: 80 })}
        ${line(O[0], O[1], B[0], B[1], "muted", { dashed: true, opacity: 0.46 })}
        ${line(B[0], B[1], T[0], T[1], "muted", { dashed: true, opacity: 0.46 })}
        ${point(A[0], A[1], "accent", "转折点", { r: 5, labelX: A[0] + 42, labelY: A[1] - 26, delay: 140 })}
        <g class="ch3-svg-callout ch3-story-animate" style="--story-delay:190ms" transform="translate(520 72)"><rect width="224" height="94" rx="22"></rect><text x="20" y="31">先走 αu</text><text x="20" y="60">再从终点走 βv</text><text class="small" x="20" y="82">首尾相接，而不是三条孤立线段</text></g>`;
    }
    return `${base}
      ${arrow(O[0], O[1], A[0], A[1], "accent", "αu", { labelX: O[0] + (A[0] - O[0]) * 0.55, labelY: O[1] + (A[1] - O[1]) * 0.55 - 18, opacity: 0.78 })}
      ${arrow(A[0], A[1], T[0], T[1], "coral", "βv", { labelX: A[0] + (T[0] - A[0]) * 0.54 + 20, labelY: A[1] + (T[1] - A[1]) * 0.54, opacity: 0.78 })}
      ${arrow(O[0], O[1], T[0], T[1], "blue", "w", { labelX: T[0] + 28, labelY: T[1] - 22, delay: 150 })}
      <g class="ch3-svg-coordinate-sum ch3-story-animate" style="--story-delay:240ms" transform="translate(500 246)">
        <rect width="246" height="130" rx="24"></rect>
        <text class="small" x="22" y="30">每个坐标独立相加</text>
        <text x="22" y="66">w₁ = ${f(alpha)}u₁ + ${f(beta)}v₁</text>
        <text x="22" y="98">w₂ = ${f(alpha)}u₂ + ${f(beta)}v₂</text>
        <path class="ch3-svg-divider" d="M22 112H224"></path>
        <text class="result" x="22" y="128">几何终点 = 坐标计算结果</text>
      </g>`;
  }

  function storyDependence(step) {
    const O = [292, 286];
    const v1 = [166, -92];
    const v2 = [94, 118];
    const v3 = [v1[0] + v2[0], v1[1] + v2[1]];
    const P1 = [O[0] + v1[0], O[1] + v1[1]];
    const P2 = [O[0] + v2[0], O[1] + v2[1]];
    const P3 = [O[0] + v3[0], O[1] + v3[1]];
    const base = `${svgDefs()}${grid({ x: 34, y: 34, width: 748, height: 378, step: 48 })}${axes(O[0], O[1], 36, 784, 34, 414)}`;
    if (step === 0) {
      return `${base}
        <path class="ch3-svg-span-fill ch3-story-animate" d="M${O[0]} ${O[1]}L${P1[0]} ${P1[1]}L${P1[0] + v2[0]} ${P1[1] + v2[1]}L${P2[0]} ${P2[1]}Z"></path>
        ${arrow(O[0], O[1], P1[0], P1[1], "accent", "v₁", { labelX: P1[0] - 20, labelY: P1[1] - 28 })}
        ${arrow(O[0], O[1], P2[0], P2[1], "coral", "v₂", { labelX: P2[0] + 34, labelY: P2[1] + 20, delay: 90 })}
        <g class="ch3-svg-callout ch3-story-animate" style="--story-delay:190ms" transform="translate(534 70)"><rect width="206" height="96" rx="22"></rect><text x="20" y="30">两个新方向</text><text class="small" x="20" y="57">线性组合铺开一个平面</text><text class="result" x="20" y="82">span(v₁,v₂)</text></g>`;
    }
    if (step === 1) {
      return `${base}
        <path class="ch3-svg-span-fill is-soft" d="M${O[0]} ${O[1]}L${P1[0]} ${P1[1]}L${P3[0]} ${P3[1]}L${P2[0]} ${P2[1]}Z"></path>
        ${arrow(O[0], O[1], P1[0], P1[1], "accent", "v₁", { labelX: P1[0] - 20, labelY: P1[1] - 28, opacity: 0.75 })}
        ${arrow(O[0], O[1], P2[0], P2[1], "coral", "v₂", { labelX: P2[0] + 34, labelY: P2[1] + 20, opacity: 0.75 })}
        ${arrow(O[0], O[1], P3[0], P3[1], "blue", "v₃", { labelX: P3[0] + 28, labelY: P3[1] - 24, delay: 150 })}
        ${line(P1[0], P1[1], P3[0], P3[1], "muted", { dashed: true, opacity: 0.5 })}
        ${line(P2[0], P2[1], P3[0], P3[1], "muted", { dashed: true, opacity: 0.5 })}
        <g class="ch3-svg-relation ch3-story-animate" style="--story-delay:250ms" transform="translate(520 274)"><rect width="236" height="92" rx="22"></rect><text class="small" x="20" y="28">非零关系证书</text><text x="20" y="60">v₁ + v₂ − v₃ = 0</text><text class="result" x="20" y="82">v₃ 没有带来新方向</text></g>`;
    }
    return `${base}
      <path class="ch3-svg-span-fill" d="M${O[0]} ${O[1]}L${P1[0]} ${P1[1]}L${P3[0]} ${P3[1]}L${P2[0]} ${P2[1]}Z"></path>
      ${arrow(O[0], O[1], P1[0], P1[1], "accent", "v₁", { labelX: P1[0] - 20, labelY: P1[1] - 28 })}
      ${arrow(O[0], O[1], P2[0], P2[1], "coral", "v₂", { labelX: P2[0] + 34, labelY: P2[1] + 20 })}
      ${arrow(O[0], O[1], P3[0], P3[1], "blue", "v₃", { labelX: P3[0] + 28, labelY: P3[1] - 24, opacity: 0.18 })}
      <g class="ch3-svg-delete-mark ch3-story-animate" style="--story-delay:130ms" transform="translate(${P3[0] - 14} ${P3[1] - 14})"><circle r="18"></circle><path d="M-8-8 8 8M8-8-8 8"></path></g>
      <g class="ch3-svg-invariant ch3-story-animate" style="--story-delay:220ms" transform="translate(492 270)"><rect width="270" height="92" rx="22"></rect><text x="22" y="31">删掉 v₃ 以后</text><text class="result" x="22" y="61">张成的平面完全没有缩小</text><text class="small" x="22" y="83">这就是“冗余”的几何含义</text></g>`;
  }

  function transformedGrid(mode) {
    const lines = [];
    const ox = 254;
    const oy = 246;
    const map = (x, y) => {
      const dx = x - ox;
      const dy = y - oy;
      if (mode === "rank2") return [606 + 0.82 * dx + 0.34 * dy, 246 - 0.22 * dx + 0.76 * dy];
      if (mode === "rank1") return [606 + 0.95 * dx + 0.45 * dy, 246 - 0.36 * dx - 0.17 * dy];
      return [606, 246];
    };
    for (let i = -3; i <= 3; i += 1) {
      const a = map(ox + i * 44, oy - 150);
      const b = map(ox + i * 44, oy + 150);
      lines.push(line(a[0], a[1], b[0], b[1], i === 0 ? "accent" : "muted", { opacity: i === 0 ? 0.95 : 0.42, thin: true }));
      const c = map(ox - 150, oy + i * 44);
      const d = map(ox + 150, oy + i * 44);
      lines.push(line(c[0], c[1], d[0], d[1], i === 0 ? "coral" : "muted", { opacity: i === 0 ? 0.95 : 0.42, thin: true }));
    }
    return { lines: lines.join(""), map };
  }

  function storyRank(step) {
    const modes = ["rank2", "rank1", "rank0"];
    const mode = modes[step] ?? "rank2";
    const { lines, map } = transformedGrid(mode);
    const label = mode === "rank2" ? "二维面积仍存在" : mode === "rank1" ? "所有方向塌到一条线" : "所有方向塌到一个点";
    const rank = mode === "rank2" ? 2 : mode === "rank1" ? 1 : 0;
    const matrices = {
      rank2: [["1", "0.5"], ["−0.3", "0.8"]],
      rank1: [["1", "0.5"], ["−0.4", "−0.2"]],
      rank0: [["0", "0"], ["0", "0"]],
    };
    const unit = [[254, 246], [342, 246], [342, 158], [254, 158]].map(([x, y]) => map(x, y));
    return `${svgDefs()}
      <g class="ch3-rank-panels">
        <rect class="ch3-svg-panel" x="42" y="48" width="336" height="336" rx="28"></rect>
        <rect class="ch3-svg-panel" x="442" y="48" width="336" height="336" rx="28"></rect>
        <text class="ch3-svg-panel-title" x="66" y="82">输入平面</text>
        <text class="ch3-svg-panel-title" x="466" y="82">A 作用后的输出</text>
        ${grid({ x: 62, y: 94, width: 296, height: 270, step: 44 })}
        <g transform="translate(410 216)"><circle class="ch3-svg-transform-disc" r="34"></circle><text text-anchor="middle" dominant-baseline="middle">A</text><path class="ch3-svg-flow" d="M-58 0H-34M34 0H58" marker-end="url(#ch3-arrow-muted)"></path></g>
        ${lines}
        <path class="ch3-svg-unit-image ch3-story-animate" d="M${unit.map((p) => `${f(p[0])} ${f(p[1])}`).join("L")}Z"></path>
        ${mode === "rank0" ? point(606, 246, "blue", "像空间", { r: 10, labelX: 676, labelY: 210, delay: 180 }) : ""}
      </g>
      <g class="ch3-svg-rank-readout ch3-story-animate" style="--story-delay:220ms" transform="translate(116 398)"><rect width="588" height="52" rx="18"></rect><text x="24" y="33">${esc(label)}</text><text class="result" x="500" y="33">rank(A) = ${rank}</text></g>
      <g transform="translate(704 86)">${bracketMatrix(matrices[mode], 0, 0, { cellW: 32, cellH: 30 })}</g>`;
  }

  function storySolvability(step) {
    const inside = step !== 2;
    const target = inside ? [640, 202] : [690, 126];
    const base = `${svgDefs()}
      <rect class="ch3-svg-panel" x="42" y="52" width="312" height="322" rx="28"></rect>
      <rect class="ch3-svg-panel" x="466" y="52" width="312" height="322" rx="28"></rect>
      <text class="ch3-svg-panel-title" x="66" y="86">未知量空间</text>
      <text class="ch3-svg-panel-title" x="490" y="86">输出空间</text>
      ${grid({ x: 62, y: 106, width: 272, height: 244, step: 44 })}
      ${grid({ x: 486, y: 106, width: 272, height: 244, step: 44 })}
      <g transform="translate(410 216)"><circle class="ch3-svg-transform-disc" r="34"></circle><text text-anchor="middle" dominant-baseline="middle">A</text><path class="ch3-svg-flow" d="M-58 0H-34M34 0H58" marker-end="url(#ch3-arrow-muted)"></path></g>`;
    if (step === 0) {
      return `${base}
        ${arrow(622, 240, 706, 190, "accent", "a₁", { labelX: 690, labelY: 165 })}
        ${arrow(622, 240, 580, 265, "coral", "a₂", { labelX: 560, labelY: 288, delay: 90 })}
        ${line(498, 314, 744, 167, "blue", { thick: true, soft: true, delay: 170 })}
        <g class="ch3-svg-callout ch3-story-animate" style="--story-delay:250ms" transform="translate(82 270)"><rect width="232" height="74" rx="20"></rect><text x="20" y="29">所有 Ax 都落在同一条线</text><text class="result" x="20" y="56">这条线就是 Col(A)</text></g>`;
    }
    return `${base}
      ${line(498, 314, 744, 167, "blue", { thick: true, soft: true })}
      ${arrow(622, 240, target[0], target[1], inside ? "accent" : "coral", "b", { labelX: target[0] + 28, labelY: target[1] - 22, delay: 90 })}
      ${inside ? point(target[0], target[1], "accent", "可达", { r: 7, labelX: target[0] + 62, labelY: target[1] + 26, delay: 160 }) : point(target[0], target[1], "coral", "不可达", { r: 7, labelX: target[0] + 58, labelY: target[1] - 30, delay: 160 })}
      <g class="ch3-svg-rank-gate ch3-story-animate ${inside ? "is-ok" : "is-bad"}" style="--story-delay:240ms" transform="translate(104 398)"><rect width="604" height="52" rx="18"></rect><text x="24" y="33">${inside ? "b 在列空间中，存在 x 使 Ax=b" : "b 在列空间外，不存在任何原像"}</text><text class="result" x="420" y="33">${inside ? "rank(A)=rank([A|b])" : "rank(A)<rank([A|b])"}</text></g>`;
  }

  function solutionPoint(s) {
    const x0 = [296, 260];
    const eta = [116, -86];
    return [x0[0] + s * eta[0], x0[1] + s * eta[1]];
  }

  function storySolution(step, state) {
    const s = state.s ?? 0.65;
    const x0 = [296, 260];
    const eta = [116, -86];
    const x = solutionPoint(s);
    const base = `${svgDefs()}
      <rect class="ch3-svg-panel" x="38" y="46" width="404" height="338" rx="28"></rect>
      <rect class="ch3-svg-panel" x="548" y="46" width="232" height="338" rx="28"></rect>
      <text class="ch3-svg-panel-title" x="62" y="80">未知量空间</text>
      <text class="ch3-svg-panel-title" x="572" y="80">输出空间</text>
      ${grid({ x: 58, y: 100, width: 364, height: 258, step: 43 })}
      ${grid({ x: 568, y: 100, width: 192, height: 258, step: 43 })}
      <g transform="translate(495 216)"><circle class="ch3-svg-transform-disc" r="34"></circle><text text-anchor="middle" dominant-baseline="middle">A</text><path class="ch3-svg-flow" d="M-58 0H-34M34 0H58" marker-end="url(#ch3-arrow-muted)"></path></g>`;
    if (step === 0) {
      return `${base}
        ${arrow(184, 306, x0[0], x0[1], "accent", "x₀", { labelX: x0[0] - 6, labelY: x0[1] - 30 })}
        ${arrow(652, 258, 704, 218, "blue", "b", { labelX: 720, labelY: 196, delay: 90 })}
        <path class="ch3-svg-flow ch3-story-animate" style="--story-delay:150ms" d="M${x0[0] + 20} ${x0[1] - 12}C430 144 520 134 652 236" marker-end="url(#ch3-arrow-muted)"></path>
        <g class="ch3-svg-callout ch3-story-animate" style="--story-delay:230ms" transform="translate(78 302)"><rect width="310" height="62" rx="20"></rect><text x="20" y="26">先找到一个特解 x₀</text><text class="small" x="20" y="49">它只是整条解集上的一个锚点</text></g>`;
    }
    if (step === 1) {
      return `${base}
        ${line(100, 404, 438, 154, "coral", { thick: true, soft: true })}
        ${arrow(184, 306, x0[0], x0[1], "accent", "x₀", { labelX: x0[0] - 6, labelY: x0[1] - 30, opacity: 0.75 })}
        ${arrow(x0[0], x0[1], x0[0] + eta[0], x0[1] + eta[1], "coral", "η", { labelX: x0[0] + eta[0] * 0.62 + 18, labelY: x0[1] + eta[1] * 0.62 - 4, delay: 100 })}
        ${arrow(652, 258, 704, 218, "blue", "0", { labelX: 720, labelY: 196, delay: 150 })}
        <path class="ch3-svg-flow ch3-story-animate" style="--story-delay:190ms" d="M${x0[0] + eta[0] * 0.62} ${x0[1] + eta[1] * 0.62}C480 154 532 172 652 236" marker-end="url(#ch3-arrow-muted)"></path>
        <g class="ch3-svg-callout ch3-story-animate" style="--story-delay:260ms" transform="translate(574 286)"><rect width="180" height="66" rx="20"></rect><text x="18" y="27">Aη = 0</text><text class="small" x="18" y="50">核方向被压到零</text></g>`;
    }
    return `${base}
      ${line(100, 404, 438, 154, "coral", { thick: true, soft: true })}
      ${arrow(184, 306, x0[0], x0[1], "accent", "x₀", { labelX: x0[0] - 8, labelY: x0[1] - 30, opacity: 0.5 })}
      ${arrow(x0[0], x0[1], x[0], x[1], "coral", "sη", { labelX: x0[0] + (x[0] - x0[0]) * 0.54 + 20, labelY: x0[1] + (x[1] - x0[1]) * 0.54 + 8, delay: 80 })}
      ${arrow(184, 306, x[0], x[1], "blue", "x", { labelX: x[0] + 28, labelY: x[1] - 24, delay: 150 })}
      ${point(x0[0], x0[1], "accent", "", { r: 6 })}
      ${point(x[0], x[1], "blue", "", { r: 7, delay: 150 })}
      ${arrow(652, 258, 704, 218, "blue", "b", { labelX: 720, labelY: 196, delay: 150 })}
      <path class="ch3-svg-flow ch3-story-animate" style="--story-delay:200ms" d="M${x[0] + 12} ${x[1] - 8}C470 118 542 158 652 236" marker-end="url(#ch3-arrow-muted)"></path>
      <g class="ch3-svg-solution-equation ch3-story-animate" style="--story-delay:250ms" transform="translate(76 396)"><rect width="672" height="54" rx="18"></rect><text x="24" y="34">x = x₀ + sη</text><text class="result" x="318" y="34">沿整条仿射直线移动，Ax 始终等于同一个 b</text></g>`;
  }

  function storyResultant(step) {
    const base = `${svgDefs()}${grid({ x: 42, y: 42, width: 736, height: 344, step: 46 })}${axes(410, 244, 44, 780, 42, 388)}`;
    const curveA = `<path class="ch3-svg-curve ch3-svg-stroke-accent ch3-story-animate" d="M90 332C190 74 308 80 410 278C500 438 626 364 742 96"></path>`;
    const curveB = `<path class="ch3-svg-curve ch3-svg-stroke-coral ch3-story-animate" style="--story-delay:80ms" d="M92 126C232 194 318 318 442 326C566 334 646 222 742 164"></path>`;
    const pts = [[270, 214], [530, 313]];
    if (step === 0) {
      return `${base}${curveA}${curveB}${pts.map(([x, y], i) => point(x, y, "blue", `P${i + 1}`, { labelX: x + 32, labelY: y - 24, delay: 160 + i * 80 })).join("")}
        <g class="ch3-svg-callout ch3-story-animate" style="--story-delay:300ms" transform="translate(548 70)"><rect width="190" height="76" rx="20"></rect><text x="18" y="30">解 = 两条曲线的交点</text><text class="small" x="18" y="56">先看几何，再做代数消元</text></g>`;
    }
    if (step === 1) {
      return `${base}${curveA}${curveB}${pts.map(([x, y], i) => `${point(x, y, "blue", "", { r: 7 })}${line(x, y, x, 244, "blue", { dashed: true, delay: 140 + i * 80 })}${point(x, 244, "accent", `x${i + 1}`, { r: 6, labelX: x, labelY: 274, delay: 220 + i * 80 })}`).join("")}
        <g class="ch3-svg-callout ch3-story-animate" style="--story-delay:340ms" transform="translate(536 72)"><rect width="214" height="82" rx="20"></rect><text x="18" y="30">把交点投影到 x 轴</text><text class="small" x="18" y="56">消去 y，只保留可能的 x</text></g>`;
    }
    if (step === 2) {
      return `${svgDefs()}
        <g transform="translate(78 72)">
          <text class="ch3-svg-stage-title" x="0" y="0">结式把“存在共同 y”压缩成一个一元条件</text>
          ${bracketMatrix([["a₂", "a₁", "a₀", "0"], ["0", "a₂", "a₁", "a₀"], ["b₂", "b₁", "b₀", "0"], ["0", "b₂", "b₁", "b₀"]], 52, 54, { cellW: 52, cellH: 42, delay: 60 })}
          <path class="ch3-svg-flow" d="M340 140H470" marker-end="url(#ch3-arrow-muted)"></path>
          <g class="ch3-svg-resultant-box ch3-story-animate" style="--story-delay:180ms" transform="translate(492 66)"><rect width="232" height="150" rx="26"></rect><text class="small" x="22" y="32">关于 x 的结式</text><text x="22" y="72">R(x)=0</text><path class="ch3-svg-divider" d="M22 92H210"></path><text class="result" x="22" y="124">根只是候选 x</text></g>
          <g class="ch3-svg-invariant ch3-story-animate" style="--story-delay:280ms" transform="translate(90 298)"><rect width="560" height="74" rx="22"></rect><text x="24" y="30">消元可能带来重根或伪候选</text><text class="result" x="24" y="56">所以最后必须回代原方程组验证</text></g>
        </g>`;
    }
    return `${base}${curveA}${curveB}
      ${pts.map(([x, y], i) => `${point(x, y, "accent", `验证${i + 1}`, { labelX: x + 42, labelY: y - 26, delay: 80 + i * 90 })}${line(x, y, x, 244, "muted", { dashed: true, opacity: 0.42 })}`).join("")}
      <g class="ch3-svg-verify-list ch3-story-animate" style="--story-delay:260ms" transform="translate(528 70)"><rect width="220" height="126" rx="22"></rect><text class="small" x="20" y="30">回代原方程</text><text x="20" y="62">✓ f(xᵢ,yᵢ)=0</text><text x="20" y="94">✓ g(xᵢ,yᵢ)=0</text><text class="result" x="20" y="116">通过后才是解</text></g>`;
  }

  const stories = {
    elimination: {
      title: "消元不是搬数字，而是在保持交点不动",
      lead: "把方程组看成几何约束：行变换会换一种约束写法，但共同解的位置必须保持不变。",
      steps: [
        ["共同交点", "先找不变量", "两条方程各自是一条直线；方程组的解，是它们共同穿过的点。", String.raw`R_1\cap R_2=\{x^*\}`, "先盯住交点，再看代数怎么变化。"],
        ["可逆倍加", "改变约束写法", "用一行的倍数加到另一行，新方程会旋转或平移成另一条直线，但仍然经过同一个解。", String.raw`R_2\leftarrow R_2-2R_1`, "可逆性保证新旧方程组拥有同一解集。"],
        ["读主元", "从几何回到矩阵", "主元不是神秘符号，它记录还有多少独立方向被约束；自由列则留下可移动方向。", String.raw`\operatorname{rank}(A)=2`, "消元的终点，是把几何自由度读出来。"],
      ], draw: (step) => storyElimination(step),
    },
    "n-vector-space": {
      title: "向量不是一根线，而是一段可以接续的有向位移",
      lead: "先看方向和位移如何首尾相接，再用坐标解释为什么每个分量必须同步相加。",
      steps: [
        ["有向位移", "先把向量画对", "向量必须同时有大小与方向；端点只是结果，箭头才表达从哪里到哪里。", String.raw`u=(u_1,\dots,u_n)^T`, "几何箭头与坐标列是同一个对象的两种读法。"],
        ["缩放并接续", "先走 αu，再走 βv", "改变系数会同时改变长度与方向。第二段位移必须从第一段终点出发。", String.raw`\alpha u+\beta v`, "线性组合不是三根孤立箭头，而是一段连续路径。"],
        ["闭合成 w", "终点就是和向量", "从原点直接指向最终终点的箭头是 w；它与逐坐标计算得到的结果完全一致。", String.raw`w_i=\alpha u_i+\beta v_i`, "几何终点和代数坐标必须一一对应。"],
      ], controls: "vector", draw: (step, state) => storyVector(step, state),
    },
    "linear-dependence": {
      title: "相关性不是“看起来差不多”，而是没有增加新的方向",
      lead: "把向量逐个加入张成空间：如果新箭头已经能由旧箭头拼出，它就是冗余信息。",
      steps: [
        ["铺开张成空间", "两个独立方向", "v₁ 与 v₂ 不在同一直线上，它们的线性组合可以铺开整个二维平面。", String.raw`\operatorname{span}(v_1,v_2)`, "每加入一个真正的新方向，张成空间的维数才会增长。"],
        ["加入第三个向量", "给出非零关系", "v₃ 虽然看起来是一根新箭头，但它恰好等于 v₁ 与 v₂ 的组合。", String.raw`v_1+v_2-v_3=0`, "存在非全零系数关系，就是线性相关的严格证书。"],
        ["删除冗余", "张成空间没有缩小", "删去 v₃ 后，原来的平面仍然完整存在；它没有贡献新的方向。", String.raw`\operatorname{span}(v_1,v_2,v_3)=\operatorname{span}(v_1,v_2)`, "极大无关组保留全部方向，同时去掉重复信息。"],
      ], draw: (step) => storyDependence(step),
    },
    "matrix-rank": {
      title: "秩就是变换之后还剩下多少个独立方向",
      lead: "不要先背主元个数。先让矩阵作用在整张网格上，看面积怎样保留、塌缩成线，最后甚至缩成点。",
      steps: [
        ["保留面积", "二维输出", "两个独立基方向经过 A 后仍不共线，单位方格变成有面积的平行四边形。", String.raw`\operatorname{rank}(A)=2`, "输出仍然拥有两个独立方向。"],
        ["压成直线", "一维输出", "不同输入方向被压到同一条线上，所有小方格都失去面积。", String.raw`\operatorname{rank}(A)=1`, "矩阵把二维信息压缩成一个独立方向。"],
        ["压成一点", "零维输出", "所有输入都被送到原点，没有任何方向能够保留下来。", String.raw`\operatorname{rank}(A)=0`, "秩是像空间的维数，而不只是 RREF 里的一个数字。"],
      ], draw: (step) => storyRank(step),
    },
    solvability: {
      title: "方程 Ax=b 是否有解，只看目标 b 能不能被 A 到达",
      lead: "把 A 看成从未知量空间到输出空间的机器。所有可能的 Ax 组成列空间，b 必须落在其中。",
      steps: [
        ["先看像空间", "A 能到哪里", "矩阵的列向量生成全部可能输出；在这个例子里，所有输出都落在一条直线上。", String.raw`\operatorname{Col}(A)=\{Ax:x\in F^n\}`, "列空间就是机器 A 的可达区域。"],
        ["目标在线上", "b 可达", "当 b 落在列空间中，至少存在一个输入 x 被 A 送到 b。", String.raw`\operatorname{rank}(A)=\operatorname{rank}([A\mid b])`, "增广列没有创造新方向，因此系统有解。"],
        ["目标在线外", "b 不可达", "当 b 落在列空间之外，无论怎样选择 x，都不能命中这个目标。", String.raw`\operatorname{rank}(A)<\operatorname{rank}([A\mid b])`, "增广列增加了新方向，矛盾行必然出现。"],
      ], draw: (step) => storySolvability(step),
    },
    "solution-structure": {
      title: "全部解不是一堆答案，而是一条被平移过的零空间",
      lead: "先找到一个特解 x₀，再沿着所有会被 A 压到 0 的方向移动；这些移动不会改变输出 b。",
      steps: [
        ["找到特解", "先钉住一个锚点", "x₀ 满足 Ax₀=b，但它通常不是唯一的。它只是仿射解集上的一个起点。", String.raw`Ax_0=b`, "特解给位置，零空间给方向。"],
        ["看核方向", "Aη=0", "沿 η 移动不会改变输出，因为 A 会把这段位移完全压到零向量。", String.raw`A\eta=0`, "Ker(A) 描述所有“移动了却不改变结果”的方向。"],
        ["生成全部解", "特解 + 零空间", "拖动参数 s，当前解 x 沿整条仿射直线移动；右侧输出始终停在同一个 b。", String.raw`x=x_0+s\eta`, "解集 = x₀+Ker(A)，这是代数公式的几何全貌。"],
      ], controls: "solution", draw: (step, state) => storySolution(step, state),
    },
    "binary-higher-degree": {
      title: "高次方程组的消元，是把交点信息投影到一条坐标轴",
      lead: "先在平面中看两条曲线的交点，再理解结式为什么只保留候选横坐标，以及为什么最后必须回代。",
      steps: [
        ["先看交点", "几何对象", "两个多项式方程分别给出一条代数曲线，联立解就是它们的公共点。", String.raw`f(x,y)=0,\quad g(x,y)=0`, "交点是原问题，消元只是读取交点的一种方法。"],
        ["投影到 x 轴", "消去 y", "把每个交点垂直投影到 x 轴，只保留可能出现交点的横坐标。", String.raw`\exists y:\ f(x,y)=g(x,y)=0`, "消元把二维交点问题压成一元候选问题。"],
        ["形成结式", "候选根", "Sylvester 行列式消去 y，得到只含 x 的结式 R(x)。", String.raw`R(x)=\operatorname{Res}_y(f,g)`, "R(x)=0 只说明 x 可能来自公共点。"],
        ["回代验证", "候选不等于解", "为每个候选 x 求 y，并代回原来的两个方程；两式同时为零才是真解。", String.raw`f(x_i,y_i)=g(x_i,y_i)=0`, "回代把代数候选重新接回几何交点。"],
      ], draw: (step) => storyResultant(step),
    },
  };

  function buildControls(kind, state) {
    if (kind === "vector") {
      return `<div class="ch3-story-control-set" aria-label="线性组合系数"><label><span>缩放 α</span><input type="range" min="-1.5" max="1.5" step="0.05" value="${state.alpha}"><strong>${f(state.alpha)}</strong></label><label><span>缩放 β</span><input type="range" min="-1.5" max="1.5" step="0.05" value="${state.beta}"><strong>${f(state.beta)}</strong></label></div>`;
    }
    if (kind === "solution") {
      return `<div class="ch3-story-control-set is-single" aria-label="解族参数"><label><span>沿零空间移动 s</span><input type="range" min="-1.25" max="1.25" step="0.05" value="${state.s}"><strong>${f(state.s)}</strong></label></div>`;
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

    const state = { step: 0, alpha: 1, beta: 1, s: 0.65 };
    const story = document.createElement("section");
    story.className = "ch3-visual-story";
    story.dataset.ch3Story = section.id;
    story.innerHTML = `
      <header class="ch3-story-header"><span class="ch3-story-kicker">GEOMETRY FIRST · 几何先于公式</span><h3>${config.title}</h3><p>${config.lead}</p></header>
      <div class="ch3-story-layout">
        <div class="ch3-story-stage-shell"><svg class="ch3-story-svg" data-story-svg viewBox="0 0 820 460" role="img" aria-label="${esc(config.title)}"></svg><p class="ch3-story-stage-caption" data-story-stage-caption aria-live="polite"></p></div>
        <aside class="ch3-story-guide"><div class="ch3-story-step-list" role="tablist" aria-label="视觉推导步骤">${config.steps.map((item, index) => `<button type="button" role="tab" data-story-step="${index}" aria-selected="${index === 0}"><span>${String(index + 1).padStart(2, "0")}</span>${item[0]}</button>`).join("")}</div><div class="ch3-story-copy" aria-live="polite"><span data-story-kicker></span><h4 data-story-heading></h4><p data-story-text></p><div class="ch3-story-formula" data-story-formula></div><div class="ch3-story-conclusion" data-story-conclusion></div></div><div data-story-controls></div></aside>
      </div>`;

    const details = document.createElement("details");
    details.className = "ch3-precision-lab";
    const summary = document.createElement("summary");
    summary.innerHTML = `<span><strong>继续做精确实验</strong><small>打开 RREF、完整坐标、参数验证和数值控制</small></span><i aria-hidden="true">＋</i>`;
    lab.replaceWith(details);
    details.append(summary, lab);
    const formal = root.querySelector(`#${CSS.escape(section.id)}-formal`);
    const storySection = document.createElement("section");
    storySection.className = "ch3-story-section";
    storySection.innerHTML = "<h2>几何直觉</h2>";
    storySection.append(story);
    if (formal) formal.before(storySection);
    else interactive.insertBefore(storySection, details);

    const svg = story.querySelector("[data-story-svg]");
    const buttons = [...story.querySelectorAll("[data-story-step]")];
    const controlsRoot = story.querySelector("[data-story-controls]");
    const cleanups = [];

    function render() {
      const item = config.steps[state.step];
      buttons.forEach((button, index) => { const active = index === state.step; button.classList.toggle("is-active", active); button.setAttribute("aria-selected", String(active)); });
      story.querySelector("[data-story-kicker]").textContent = item[1];
      story.querySelector("[data-story-heading]").textContent = item[0];
      story.querySelector("[data-story-text]").textContent = item[2];
      story.querySelector("[data-story-formula]").innerHTML = texD(item[3]);
      story.querySelector("[data-story-conclusion]").textContent = item[4];
      story.querySelector("[data-story-stage-caption]").textContent = `${state.step + 1}/${config.steps.length} · ${item[1]}：${item[4]}`;
      svg.innerHTML = config.draw(state.step, state);
      controlsRoot.innerHTML = buildControls(config.controls, state);
      if (config.controls === "vector") {
        const [alphaInput, betaInput] = controlsRoot.querySelectorAll("input");
        alphaInput.addEventListener("input", () => { state.alpha = Number(alphaInput.value); render(); });
        betaInput.addEventListener("input", () => { state.beta = Number(betaInput.value); render(); });
      } else if (config.controls === "solution") {
        const input = controlsRoot.querySelector("input");
        input.addEventListener("input", () => { state.s = Number(input.value); render(); });
      }
    }

    buttons.forEach((button) => { const listener = () => { state.step = Number(button.dataset.storyStep); render(); }; button.addEventListener("click", listener); cleanups.push(() => button.removeEventListener("click", listener)); });
    details.addEventListener("toggle", () => { summary.querySelector("i").textContent = details.open ? "−" : "＋"; });
    render();
    return () => cleanups.splice(0).forEach((cleanup) => cleanup());
  }

  window.defineChapter3LessonEnhancer?.(mountStory);
})();
