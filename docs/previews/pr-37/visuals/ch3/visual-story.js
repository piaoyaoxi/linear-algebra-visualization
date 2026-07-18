/* Chapter 3 cinematic visual stories — geometry, transformation, then symbols. */
(() => {
  const M = () => window.Ch3Math;
  const texD = (source) => M()?.texD?.(source) ?? `<code>${source}</code>`;
  const esc = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
  const f = (value) => Number(Number(value).toFixed(2));

  const W = 960;
  const H = 540;

  function defs() {
    return `
      <defs>
        <radialGradient id="ch3-scene-glow" cx="50%" cy="45%" r="68%">
          <stop offset="0" stop-color="#17203a" stop-opacity=".88"></stop>
          <stop offset=".72" stop-color="#0d1427" stop-opacity=".96"></stop>
          <stop offset="1" stop-color="#090e1b"></stop>
        </radialGradient>
        <filter id="ch3-glow-cyan" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5" result="b"></feGaussianBlur><feMerge><feMergeNode in="b"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge></filter>
        <filter id="ch3-glow-gold" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6" result="b"></feGaussianBlur><feMerge><feMergeNode in="b"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge></filter>
        <linearGradient id="ch3-span-plane" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#66d9ef" stop-opacity=".22"></stop><stop offset="1" stop-color="#f4a261" stop-opacity=".08"></stop></linearGradient>
        <linearGradient id="ch3-unit-fill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#66d9ef" stop-opacity=".36"></stop><stop offset="1" stop-color="#ffd166" stop-opacity=".18"></stop></linearGradient>
      </defs>`;
  }

  function sceneBase(options = {}) {
    const grid = options.grid !== false;
    const step = options.step ?? 48;
    const x1 = options.x1 ?? 34;
    const x2 = options.x2 ?? 926;
    const y1 = options.y1 ?? 28;
    const y2 = options.y2 ?? 510;
    const lines = [];
    if (grid) {
      for (let x = x1; x <= x2; x += step) lines.push(`<path d="M${x} ${y1}V${y2}"></path>`);
      for (let y = y1; y <= y2; y += step) lines.push(`<path d="M${x1} ${y}H${x2}"></path>`);
    }
    return `${defs()}<rect class="ch3-scene-bg" width="${W}" height="${H}" rx="24"></rect>${grid ? `<g class="ch3-scene-grid">${lines.join('')}</g>` : ''}<path class="ch3-scene-vignette" d="M0 0H960V540H0Z"></path>`;
  }

  function axes(ox, oy, bounds = {}) {
    const x1 = bounds.x1 ?? 40;
    const x2 = bounds.x2 ?? 920;
    const y1 = bounds.y1 ?? 32;
    const y2 = bounds.y2 ?? 504;
    return `<g class="ch3-axis"><path d="M${x1} ${oy}H${x2}"></path><path d="M${ox} ${y2}V${y1}"></path><text x="${x2 - 12}" y="${oy - 12}">x₁</text><text x="${ox + 12}" y="${y1 + 20}">x₂</text></g>`;
  }

  function softArrow(x1, y1, x2, y2, color = 'cyan', label = '', options = {}) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const px = -uy;
    const py = ux;
    const halfW = options.thin ? 2.1 : 3.7;
    const headLen = Math.min(23, Math.max(15, len * 0.18));
    const headHalf = options.thin ? 6.5 : 9.2;
    const neckX = x2 - ux * headLen;
    const neckY = y2 - uy * headLen;
    const pt = (x, y) => `${f(x)} ${f(y)}`;
    const d = [
      `M ${pt(x1 + px * halfW, y1 + py * halfW)}`,
      `L ${pt(neckX + px * halfW, neckY + py * halfW)}`,
      `L ${pt(neckX + px * headHalf, neckY + py * headHalf)}`,
      `Q ${pt(x2 - ux * 3 + px * 1.1, y2 - uy * 3 + py * 1.1)} ${pt(x2, y2)}`,
      `Q ${pt(x2 - ux * 3 - px * 1.1, y2 - uy * 3 - py * 1.1)} ${pt(neckX - px * headHalf, neckY - py * headHalf)}`,
      `L ${pt(neckX - px * halfW, neckY - py * halfW)}`,
      `L ${pt(x1 - px * halfW, y1 - py * halfW)}`,
      `A ${halfW} ${halfW} 0 0 0 ${pt(x1 + px * halfW, y1 + py * halfW)}`,
      'Z',
    ].join(' ');
    const lx = options.labelX ?? (x1 + dx * 0.56 + px * 20);
    const ly = options.labelY ?? (y1 + dy * 0.56 + py * 20);
    return `<g class="ch3-arrow ch3-enter" style="--delay:${options.delay ?? 0}ms;opacity:${options.opacity ?? 1}"><path class="ch3-fill-${color}" d="${d}"></path>${label ? `<text class="ch3-label ch3-text-${color}" x="${f(lx)}" y="${f(ly)}">${esc(label)}</text>` : ''}</g>`;
  }

  function line(x1, y1, x2, y2, color = 'cyan', options = {}) {
    return `<path class="ch3-line ch3-stroke-${color}${options.dashed ? ' is-dashed' : ''}${options.soft ? ' is-soft' : ''}${options.thin ? ' is-thin' : ''} ch3-enter" style="--delay:${options.delay ?? 0}ms;opacity:${options.opacity ?? 1}" d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}"></path>`;
  }

  function path(d, color = 'cyan', options = {}) {
    return `<path class="ch3-line ch3-stroke-${color}${options.dashed ? ' is-dashed' : ''}${options.soft ? ' is-soft' : ''}${options.thin ? ' is-thin' : ''} ch3-enter" style="--delay:${options.delay ?? 0}ms;opacity:${options.opacity ?? 1}" d="${d}"></path>`;
  }

  function dot(x, y, color = 'gold', label = '', options = {}) {
    return `<g class="ch3-enter" style="--delay:${options.delay ?? 0}ms"><circle class="ch3-dot ch3-fill-${color}" cx="${f(x)}" cy="${f(y)}" r="${options.r ?? 7}"></circle>${label ? `<text class="ch3-label ch3-text-${color}" x="${f(options.labelX ?? x + 14)}" y="${f(options.labelY ?? y - 14)}">${esc(label)}</text>` : ''}</g>`;
  }

  function text(x, y, value, options = {}) {
    const anchor = options.anchor ?? 'start';
    const cls = `ch3-scene-text${options.small ? ' is-small' : ''}${options.big ? ' is-big' : ''}${options.muted ? ' is-muted' : ''}${options.color ? ` ch3-text-${options.color}` : ''}`;
    return `<text class="${cls} ch3-enter" style="--delay:${options.delay ?? 0}ms" x="${f(x)}" y="${f(y)}" text-anchor="${anchor}">${esc(value)}</text>`;
  }

  function matrix(entries, x, y, options = {}) {
    const rows = entries.length;
    const cols = entries[0].length;
    const cw = options.cellW ?? 44;
    const ch = options.cellH ?? 38;
    const width = cols * cw;
    const height = rows * ch;
    const pivots = new Set((options.pivots ?? []).map(([r, c]) => `${r}:${c}`));
    const items = [];
    entries.forEach((row, r) => row.forEach((value, c) => {
      const px = x + c * cw + cw / 2;
      const py = y + r * ch + ch / 2 + 6;
      if (pivots.has(`${r}:${c}`)) items.push(`<circle class="ch3-pivot-halo" cx="${px}" cy="${py - 6}" r="16"></circle>`);
      items.push(`<text class="ch3-matrix-number" x="${px}" y="${py}" text-anchor="middle">${esc(value)}</text>`);
    }));
    return `<g class="ch3-matrix ch3-enter" style="--delay:${options.delay ?? 0}ms"><path d="M${x - 9} ${y}H${x - 18}V${y + height}H${x - 9}M${x + width + 9} ${y}H${x + width + 18}V${y + height}H${x + width + 9}"></path>${items.join('')}</g>`;
  }

  function mapPoint(ox, oy, scale, x, y) {
    return [ox + x * scale, oy - y * scale];
  }

  function storyElimination(step) {
    const ox = 245;
    const oy = 420;
    const s = 70;
    const P = mapPoint(ox, oy, s, 5 / 3, 7 / 3);
    const r1a = mapPoint(ox, oy, s, -1, 5);
    const r1b = mapPoint(ox, oy, s, 5, -1);
    const r2a = mapPoint(ox, oy, s, -0.5, -2);
    const r2b = mapPoint(ox, oy, s, 3, 5);
    const nr2a = mapPoint(ox, oy, s, -1, 7 / 3);
    const nr2b = mapPoint(ox, oy, s, 5, 7 / 3);
    const base = `${sceneBase({ x2: 630, step: 42 })}${axes(ox, oy, { x2: 630 })}<path class="ch3-divider-line" d="M650 52V488"></path>`;
    if (step === 0) {
      return `${base}${line(...r1a, ...r1b, 'cyan')}${line(...r2a, ...r2b, 'orange', { delay: 100 })}${dot(P[0], P[1], 'gold', '共同解 x*', { r: 9, labelX: P[0] + 18, labelY: P[1] - 18, delay: 220 })}${text(680, 96, '两个方程 = 两个几何约束', { big: true })}${text(680, 152, 'R₁  x + y = 4', { color: 'cyan' })}${text(680, 194, 'R₂  2x − y = 1', { color: 'orange' })}${text(680, 286, '方程组的解', { muted: true, small: true })}${text(680, 328, '就是两条约束', { big: true })}${text(680, 366, '共同穿过的点', { big: true, color: 'gold' })}`;
    }
    if (step === 1) {
      return `${base}${line(...r1a, ...r1b, 'cyan', { opacity: .72 })}${line(...r2a, ...r2b, 'orange', { dashed: true, opacity: .28 })}${line(...nr2a, ...nr2b, 'orange', { delay: 140 })}${dot(P[0], P[1], 'gold', '交点不动', { r: 9, labelX: P[0] + 18, labelY: P[1] - 18, delay: 240 })}${path(`M690 174C744 132 810 132 864 174`, 'gold', { dashed: true, delay: 80 })}${text(680, 92, 'R₂ ← R₂ − 2R₁', { big: true, color: 'gold' })}${text(680, 142, '旧 R₂', { muted: true })}${text(816, 142, '新 R₂', { color: 'orange' })}${text(680, 248, '新方程变成', { muted: true, small: true })}${text(680, 290, '−3y = −7', { big: true, color: 'orange' })}${text(680, 370, '约束写法改变', { big: true })}${text(680, 408, '共同解集保持不变', { big: true, color: 'gold' })}`;
    }
    return `${base}${line(...r1a, ...r1b, 'cyan', { opacity: .42 })}${line(...nr2a, ...nr2b, 'orange', { opacity: .62 })}${dot(P[0], P[1], 'gold', 'x*', { r: 8, labelX: P[0] + 14, labelY: P[1] - 16 })}${text(680, 78, '增广矩阵的同一步', { big: true })}${matrix([['1', '1', '│', '4'], ['2', '−1', '│', '1']], 690, 116, { cellW: 46, cellH: 40 })}${softArrow(790, 226, 790, 268, 'gold', '', { thin: true })}${text(816, 252, 'R₂−2R₁', { small: true, color: 'gold' })}${matrix([['1', '1', '│', '4'], ['0', '−3', '│', '−7']], 690, 288, { cellW: 46, cellH: 40, pivots: [[0, 0], [1, 1]], delay: 120 })}${text(680, 438, '主元锁定方向；自由列留下运动方向', { small: true, color: 'cyan' })}`;
  }

  function vectorGeometry(alpha, beta) {
    const O = [240, 380];
    const u = [165, -112];
    const v = [92, 136];
    const A = [O[0] + alpha * u[0], O[1] + alpha * u[1]];
    const B = [O[0] + beta * v[0], O[1] + beta * v[1]];
    const T = [A[0] + beta * v[0], A[1] + beta * v[1]];
    return { O, u, v, A, B, T };
  }

  function storyVector(step, state) {
    const alpha = state.alpha ?? 1;
    const beta = state.beta ?? 1;
    const { O, u, v, A, B, T } = vectorGeometry(alpha, beta);
    const base = `${sceneBase({ x2: 650, step: 44 })}${axes(O[0], O[1], { x2: 650 })}<path class="ch3-divider-line" d="M674 52V488"></path>`;
    if (step === 0) {
      return `${base}${softArrow(O[0], O[1], O[0] + u[0], O[1] + u[1], 'cyan', 'u')}${softArrow(O[0], O[1], O[0] + v[0], O[1] + v[1], 'orange', 'v', { delay: 100 })}${dot(O[0], O[1], 'white', 'O', { r: 4, labelX: O[0] - 22, labelY: O[1] + 25 })}${text(706, 96, '向量不是线段', { big: true })}${text(706, 140, '它是“从这里到那里”', { big: true, color: 'gold' })}${text(706, 210, '方向', { small: true, muted: true })}${text(706, 242, '由箭头给出', { color: 'cyan' })}${text(706, 304, '大小', { small: true, muted: true })}${text(706, 336, '由长度给出', { color: 'orange' })}${text(706, 420, '坐标列只是这段位移的数字记录', { small: true })}`;
    }
    if (step === 1) {
      return `${base}${softArrow(O[0], O[1], A[0], A[1], 'cyan', 'αu')}${softArrow(A[0], A[1], T[0], T[1], 'orange', 'βv', { delay: 100 })}${line(O[0], O[1], B[0], B[1], 'white', { dashed: true, opacity: .25, thin: true })}${line(B[0], B[1], T[0], T[1], 'white', { dashed: true, opacity: .25, thin: true })}${dot(A[0], A[1], 'white', '', { r: 4 })}${text(706, 96, '线性组合是一段路', { big: true })}${text(706, 160, `先走  ${f(alpha)}u`, { color: 'cyan' })}${text(706, 206, `再走  ${f(beta)}v`, { color: 'orange' })}${text(706, 282, '第二个向量', { muted: true, small: true })}${text(706, 316, '必须从第一个终点出发', { big: true, color: 'gold' })}${text(706, 420, '拖动系数，观察长度与方向同时改变', { small: true })}`;
    }
    return `${base}<path class="ch3-parallelogram" d="M${O[0]} ${O[1]}L${A[0]} ${A[1]}L${T[0]} ${T[1]}L${B[0]} ${B[1]}Z"></path>${softArrow(O[0], O[1], A[0], A[1], 'cyan', 'αu', { opacity: .7 })}${softArrow(A[0], A[1], T[0], T[1], 'orange', 'βv', { opacity: .7 })}${softArrow(O[0], O[1], T[0], T[1], 'gold', 'w', { delay: 160 })}${text(706, 92, '终点决定和向量', { big: true })}${text(706, 148, 'w = αu + βv', { big: true, color: 'gold' })}${text(706, 226, '几何', { small: true, muted: true })}${text(706, 258, '原点 → 最终终点', { color: 'gold' })}${text(706, 320, '坐标', { small: true, muted: true })}${text(706, 352, '每个分量分别相加', { color: 'cyan' })}${text(706, 424, '两种读法必须得到同一个 w', { small: true })}`;
  }

  function storyDependence(step) {
    const O = [270, 360];
    const v1 = [180, -105];
    const v2 = [105, 145];
    const P1 = [O[0] + v1[0], O[1] + v1[1]];
    const P2 = [O[0] + v2[0], O[1] + v2[1]];
    const P3 = [P1[0] + v2[0], P1[1] + v2[1]];
    const base = `${sceneBase({ x2: 650, step: 44 })}${axes(O[0], O[1], { x2: 650 })}<path class="ch3-divider-line" d="M674 52V488"></path>`;
    if (step === 0) {
      return `${base}${line(62, 481, 610, 161, 'cyan', { soft: true, opacity: .18 })}${line(62, 481, 610, 161, 'cyan', { opacity: .62 })}${softArrow(O[0], O[1], P1[0], P1[1], 'cyan', 'v₁')}${text(706, 92, '一个独立方向', { big: true })}${text(706, 146, '只能张成一条线', { big: true, color: 'cyan' })}${text(706, 230, '所有倍数 tv₁', { muted: true })}${text(706, 266, '都沿着同一方向', { color: 'cyan' })}${text(706, 410, '维数 = 1', { big: true, color: 'gold' })}`;
    }
    if (step === 1) {
      return `${base}<path class="ch3-span-sheet" d="M60 500L520 230L646 405L186 534Z"></path>${softArrow(O[0], O[1], P1[0], P1[1], 'cyan', 'v₁')}${softArrow(O[0], O[1], P2[0], P2[1], 'orange', 'v₂', { delay: 100 })}${text(706, 92, '第二个新方向', { big: true })}${text(706, 146, '把线铺成平面', { big: true, color: 'orange' })}${text(706, 230, '只要 v₂ 不在', { muted: true })}${text(706, 266, 'span(v₁) 上', { color: 'cyan' })}${text(706, 410, '维数 = 2', { big: true, color: 'gold' })}`;
    }
    if (step === 2) {
      return `${base}<path class="ch3-span-sheet" d="M60 500L520 230L646 405L186 534Z"></path>${softArrow(O[0], O[1], P1[0], P1[1], 'cyan', 'v₁', { opacity: .72 })}${softArrow(O[0], O[1], P2[0], P2[1], 'orange', 'v₂', { opacity: .72 })}${softArrow(O[0], O[1], P3[0], P3[1], 'gold', 'v₃', { delay: 150 })}${line(P1[0], P1[1], P3[0], P3[1], 'orange', { dashed: true, opacity: .5, thin: true })}${line(P2[0], P2[1], P3[0], P3[1], 'cyan', { dashed: true, opacity: .5, thin: true })}${text(706, 82, 'v₃ 看起来是新箭头', { big: true })}${text(706, 138, '但它没有带来新方向', { big: true, color: 'gold' })}${text(706, 232, 'v₃ = v₁ + v₂', { color: 'gold' })}${text(706, 284, 'v₁ + v₂ − v₃ = 0', { color: 'white' })}${text(706, 410, '存在非零关系 ⇒ 线性相关', { big: true, color: 'orange' })}`;
    }
    return `${base}<path class="ch3-span-sheet" d="M60 500L520 230L646 405L186 534Z"></path>${softArrow(O[0], O[1], P1[0], P1[1], 'cyan', 'v₁')}${softArrow(O[0], O[1], P2[0], P2[1], 'orange', 'v₂')}${softArrow(O[0], O[1], P3[0], P3[1], 'gold', 'v₃', { opacity: .12 })}${path(`M${P3[0] - 13} ${P3[1] - 13}L${P3[0] + 13} ${P3[1] + 13}M${P3[0] + 13} ${P3[1] - 13}L${P3[0] - 13} ${P3[1] + 13}`, 'orange', { delay: 120 })}${text(706, 90, '删去冗余向量 v₃', { big: true })}${text(706, 152, '张成空间完全不变', { big: true, color: 'gold' })}${text(706, 250, 'span(v₁,v₂,v₃)', { color: 'white' })}${text(706, 290, '= span(v₁,v₂)', { color: 'cyan' })}${text(706, 410, '基：保留全部方向，去掉重复信息', { big: true, color: 'orange' })}`;
  }

  function transformedGrid(mode) {
    const lines = [];
    const srcO = [245, 278];
    const dstO = [715, 278];
    const map = (x, y) => {
      const dx = x - srcO[0];
      const dy = y - srcO[1];
      if (mode === 'rank2') return [dstO[0] + .78 * dx + .34 * dy, dstO[1] - .22 * dx + .72 * dy];
      if (mode === 'rank1') return [dstO[0] + .9 * dx + .48 * dy, dstO[1] - .32 * dx - .17 * dy];
      return [...dstO];
    };
    for (let i = -3; i <= 3; i += 1) {
      const a = map(srcO[0] + i * 42, srcO[1] - 150);
      const b = map(srcO[0] + i * 42, srcO[1] + 150);
      lines.push(line(a[0], a[1], b[0], b[1], i === 0 ? 'cyan' : 'white', { opacity: i === 0 ? .9 : .18, thin: true }));
      const c = map(srcO[0] - 150, srcO[1] + i * 42);
      const d = map(srcO[0] + 150, srcO[1] + i * 42);
      lines.push(line(c[0], c[1], d[0], d[1], i === 0 ? 'orange' : 'white', { opacity: i === 0 ? .9 : .18, thin: true }));
    }
    return { lines: lines.join(''), map, srcO, dstO };
  }

  function storyRank(step) {
    const mode = ['rank2', 'rank1', 'rank0'][step] ?? 'rank2';
    const { lines, map, srcO, dstO } = transformedGrid(mode);
    const square = [[srcO[0], srcO[1]], [srcO[0] + 84, srcO[1]], [srcO[0] + 84, srcO[1] - 84], [srcO[0], srcO[1] - 84]].map(([x, y]) => map(x, y));
    const rank = mode === 'rank2' ? 2 : mode === 'rank1' ? 1 : 0;
    const title = mode === 'rank2' ? '面积仍然存在' : mode === 'rank1' ? '平面塌成直线' : '所有方向塌成一点';
    const base = `${sceneBase({ grid: false })}<path class="ch3-divider-line" d="M480 54V450"></path>${text(80, 72, '输入空间', { small: true, muted: true })}${text(556, 72, '输出空间 Im(A)', { small: true, muted: true })}${softArrow(438, 270, 522, 270, 'gold', 'A', { thin: true, labelY: 248 })}`;
    const srcGrid = [];
    for (let i = -3; i <= 3; i += 1) {
      srcGrid.push(line(srcO[0] + i * 42, srcO[1] - 150, srcO[0] + i * 42, srcO[1] + 150, i === 0 ? 'cyan' : 'white', { opacity: i === 0 ? .9 : .18, thin: true }));
      srcGrid.push(line(srcO[0] - 150, srcO[1] + i * 42, srcO[0] + 150, srcO[1] + i * 42, i === 0 ? 'orange' : 'white', { opacity: i === 0 ? .9 : .18, thin: true }));
    }
    return `${base}${srcGrid.join('')}${lines}<path class="ch3-unit-square" d="M${srcO[0]} ${srcO[1]}L${srcO[0] + 84} ${srcO[1]}L${srcO[0] + 84} ${srcO[1] - 84}L${srcO[0]} ${srcO[1] - 84}Z"></path><path class="ch3-unit-image" d="M${square.map((p) => `${f(p[0])} ${f(p[1])}`).join('L')}Z"></path>${mode === 'rank0' ? dot(dstO[0], dstO[1], 'gold', 'Im(A)', { r: 10, labelX: dstO[0] + 18, labelY: dstO[1] - 18, delay: 120 }) : ''}${text(480, 486, title, { anchor: 'middle', big: true, color: 'gold' })}${text(820, 486, `rank(A) = ${rank}`, { anchor: 'middle', big: true, color: 'cyan' })}`;
  }

  function storySolvability(step) {
    const O = [660, 330];
    const a1 = [150, -92];
    const a2 = [-75, 46];
    const inside = step !== 2;
    const b = inside ? [120, -74] : [94, -150];
    const target = [O[0] + b[0], O[1] + b[1]];
    const base = `${sceneBase({ x1: 430, step: 42 })}<path class="ch3-divider-line" d="M390 52V488"></path>${text(70, 82, '系数空间', { small: true, muted: true })}${text(70, 124, '选择 x₁、x₂', { big: true })}${text(70, 170, '就是选择两列的权重', { color: 'gold' })}${softArrow(288, 270, 430, 270, 'gold', 'A', { thin: true })}`;
    if (step === 0) {
      return `${base}${line(460, 454, 916, 174, 'cyan', { soft: true, opacity: .18 })}${line(460, 454, 916, 174, 'cyan', { opacity: .5 })}${softArrow(O[0], O[1], O[0] + a1[0], O[1] + a1[1], 'cyan', 'a₁')}${softArrow(O[0], O[1], O[0] + a2[0], O[1] + a2[1], 'orange', 'a₂', { delay: 100 })}${text(70, 270, '所有可能的 Ax', { big: true })}${text(70, 318, '组成列空间 Col(A)', { big: true, color: 'cyan' })}${text(70, 410, '这里两列共线', { muted: true })}${text(70, 446, '所以可达区域只有一条线', { color: 'gold' })}`;
    }
    return `${base}${line(460, 454, 916, 174, 'cyan', { soft: true, opacity: .18 })}${line(460, 454, 916, 174, 'cyan', { opacity: .5 })}${softArrow(O[0], O[1], target[0], target[1], inside ? 'gold' : 'orange', 'b', { delay: 100 })}${dot(target[0], target[1], inside ? 'gold' : 'orange', inside ? '可达' : '不可达', { r: 8, labelX: target[0] + 16, labelY: target[1] - 16, delay: 180 })}${text(70, 248, inside ? 'b 落在 Col(A) 中' : 'b 落在 Col(A) 外', { big: true, color: inside ? 'gold' : 'orange' })}${text(70, 310, inside ? '存在至少一个 x 使 Ax=b' : '没有任何 x 能命中 b', { big: true })}${text(70, 394, inside ? '增广列没有增加新方向' : '增广列带来了新方向', { muted: true })}${text(70, 438, inside ? 'rank(A)=rank([A|b])' : 'rank(A)<rank([A|b])', { color: inside ? 'cyan' : 'orange' })}`;
  }

  function solutionPoint(s) {
    const x0 = [260, 310];
    const eta = [150, -106];
    return [x0[0] + s * eta[0], x0[1] + s * eta[1]];
  }

  function storySolution(step, state) {
    const s = state.s ?? .65;
    const x0 = [260, 310];
    const eta = [150, -106];
    const x = solutionPoint(s);
    const bO = [770, 330];
    const b = [95, -70];
    const bP = [bO[0] + b[0], bO[1] + b[1]];
    const base = `${sceneBase({ grid: false })}<path class="ch3-divider-line" d="M590 52V488"></path>${text(62, 74, '未知量空间', { small: true, muted: true })}${text(650, 74, '输出空间', { small: true, muted: true })}${softArrow(548, 270, 632, 270, 'gold', 'A', { thin: true })}${line(72, 468, 540, 138, 'orange', { soft: true, opacity: .16 })}${line(72, 468, 540, 138, 'orange', { opacity: .34 })}${softArrow(bO[0], bO[1], bP[0], bP[1], 'gold', 'b')}`;
    if (step === 0) {
      return `${base}${softArrow(110, 410, x0[0], x0[1], 'cyan', 'x₀')}${dot(x0[0], x0[1], 'cyan', '一个特解', { r: 7, labelX: x0[0] + 16, labelY: x0[1] - 18 })}${path(`M${x0[0] + 8} ${x0[1] - 8}C470 142 626 156 ${bO[0]} ${bO[1] - 14}`, 'white', { dashed: true, opacity: .25, thin: true })}${text(650, 416, 'Ax₀ = b', { big: true, color: 'gold' })}${text(650, 456, 'x₀ 只是解集上的一个锚点', { small: true })}`;
    }
    if (step === 1) {
      return `${base}${softArrow(110, 410, x0[0], x0[1], 'cyan', 'x₀', { opacity: .55 })}${softArrow(110, 410, 110 + eta[0], 410 + eta[1], 'orange', 'η')}${softArrow(x0[0], x0[1], x0[0] + eta[0], x0[1] + eta[1], 'orange', 'η', { delay: 100 })}${dot(bO[0], bO[1], 'white', '0', { r: 5, labelX: bO[0] + 14, labelY: bO[1] + 24 })}${path(`M${110 + eta[0]} ${410 + eta[1]}C470 160 610 206 ${bO[0]} ${bO[1]}`, 'white', { dashed: true, opacity: .25, thin: true })}${text(650, 410, 'Aη = 0', { big: true, color: 'orange' })}${text(650, 454, '核方向在输出端完全消失', { small: true })}`;
    }
    if (step === 2) {
      const samples = [-1.1, -.55, 0, .55, 1.1].map((t, i) => {
        const p = solutionPoint(t);
        return `${dot(p[0], p[1], i === 2 ? 'cyan' : 'white', '', { r: i === 2 ? 7 : 4, delay: i * 55 })}${path(`M${p[0] + 6} ${p[1] - 6}C520 ${120 + i * 14} 650 ${180 + i * 8} ${bP[0] - 8} ${bP[1] + 4}`, i === 2 ? 'cyan' : 'white', { dashed: true, opacity: i === 2 ? .45 : .12, thin: true, delay: i * 55 })}`;
      }).join('');
      return `${base}${samples}${dot(bP[0], bP[1], 'gold', '同一个 b', { r: 9, labelX: bP[0] - 24, labelY: bP[1] - 20 })}${text(650, 408, '整条仿射直线', { big: true, color: 'orange' })}${text(650, 450, '都被 A 送到同一个 b', { big: true, color: 'gold' })}`;
    }
    return `${base}${softArrow(110, 410, x0[0], x0[1], 'cyan', 'x₀', { opacity: .5 })}${softArrow(x0[0], x0[1], x[0], x[1], 'orange', 'sη')}${softArrow(110, 410, x[0], x[1], 'gold', 'x', { delay: 120 })}${dot(x0[0], x0[1], 'cyan', '', { r: 5 })}${dot(x[0], x[1], 'gold', '', { r: 7, delay: 120 })}${path(`M${x[0] + 8} ${x[1] - 8}C520 120 650 170 ${bP[0] - 8} ${bP[1] + 4}`, 'gold', { dashed: true, opacity: .38, thin: true, delay: 150 })}${text(650, 396, 'x = x₀ + sη', { big: true, color: 'gold' })}${text(650, 438, 'Ax = Ax₀ + sAη = b', { color: 'cyan' })}${text(650, 474, '拖动 s：输入在移动，输出不动', { small: true })}`;
  }

  function curvePath(fn, xMin, xMax, samples, map) {
    const pts = [];
    for (let i = 0; i <= samples; i += 1) {
      const x = xMin + (xMax - xMin) * i / samples;
      const y = fn(x);
      if (Number.isFinite(y)) pts.push(map(x, y));
    }
    return pts.map((p, i) => `${i ? 'L' : 'M'}${f(p[0])} ${f(p[1])}`).join('');
  }

  function storyResultant(step) {
    const ox = 360;
    const oy = 300;
    const scale = 92;
    const map = (x, y) => mapPoint(ox, oy, scale, x, y);
    const upper = curvePath((x) => Math.sqrt(Math.max(0, 4 - x * x)), -2, 2, 120, map);
    const lower = curvePath((x) => -Math.sqrt(Math.max(0, 4 - x * x)), -2, 2, 120, map);
    const parabola = curvePath((x) => x * x - 1, -2.1, 2.1, 140, map);
    const xr = Math.sqrt((1 + Math.sqrt(13)) / 2);
    const yr = xr * xr - 1;
    const p1 = map(-xr, yr);
    const p2 = map(xr, yr);
    const base = `${sceneBase({ x2: 650, step: 46 })}${axes(ox, oy, { x2: 650 })}<path class="ch3-divider-line" d="M674 52V488"></path>${path(upper, 'cyan')}${path(lower, 'cyan')}${path(parabola, 'orange', { delay: 90 })}`;
    if (step === 0) {
      return `${base}${dot(p1[0], p1[1], 'gold', 'P₁', { r: 8, labelX: p1[0] - 34, labelY: p1[1] - 16, delay: 180 })}${dot(p2[0], p2[1], 'gold', 'P₂', { r: 8, labelX: p2[0] + 14, labelY: p2[1] - 16, delay: 240 })}${text(706, 86, '联立方程的解', { big: true })}${text(706, 136, '就是两条曲线的交点', { big: true, color: 'gold' })}${text(706, 236, 'x² + y² = 4', { color: 'cyan' })}${text(706, 280, 'y = x² − 1', { color: 'orange' })}${text(706, 420, '先看原问题，再谈消元', { small: true })}`;
    }
    if (step === 1) {
      return `${base}${dot(p1[0], p1[1], 'gold', '', { r: 7 })}${dot(p2[0], p2[1], 'gold', '', { r: 7 })}${line(p1[0], p1[1], p1[0], oy, 'gold', { dashed: true, thin: true, delay: 100 })}${line(p2[0], p2[1], p2[0], oy, 'gold', { dashed: true, thin: true, delay: 160 })}${dot(p1[0], oy, 'cyan', 'x₁', { r: 5, labelX: p1[0] - 12, labelY: oy + 26 })}${dot(p2[0], oy, 'cyan', 'x₂', { r: 5, labelX: p2[0] - 12, labelY: oy + 26 })}${text(706, 86, '消去 y', { big: true })}${text(706, 136, '就是把交点投影到 x 轴', { big: true, color: 'gold' })}${text(706, 248, '保留横坐标候选', { color: 'cyan' })}${text(706, 420, '二维交点问题 → 一元候选问题', { small: true })}`;
    }
    if (step === 2) {
      return `${base}${text(706, 82, '代入 y = x² − 1', { big: true })}${text(706, 142, 'x² + (x²−1)² = 4', { color: 'cyan' })}${text(706, 210, 'R(x) = x⁴ − x² − 3', { big: true, color: 'gold' })}${text(706, 278, 'R(x)=0 的根', { muted: true })}${text(706, 318, '只是可能的横坐标', { big: true, color: 'orange' })}${text(706, 420, '结式保留“可能有共同 y”的条件', { small: true })}`;
    }
    return `${base}${dot(p1[0], p1[1], 'gold', '✓', { r: 8, labelX: p1[0] - 28, labelY: p1[1] - 16 })}${dot(p2[0], p2[1], 'gold', '✓', { r: 8, labelX: p2[0] + 14, labelY: p2[1] - 16 })}${text(706, 82, '最后一步：回代', { big: true })}${text(706, 146, '同时满足两个原方程', { big: true, color: 'gold' })}${text(706, 228, 'f(xᵢ,yᵢ)=0', { color: 'cyan' })}${text(706, 270, 'g(xᵢ,yᵢ)=0', { color: 'orange' })}${text(706, 356, '候选 ≠ 解', { big: true, color: 'orange' })}${text(706, 420, '通过原方程验证后才是真解', { small: true })}`;
  }

  const stories = {
    elimination: {
      title: '消元不是搬数字，而是在保持交点不动',
      lead: '先把方程看成几何约束，再把同一个动作翻译成增广矩阵的行变换。',
      steps: [
        ['共同交点', '先找不变量', '每个方程是一条约束直线，方程组的解是它们的公共交点。', String.raw`R_1\cap R_2=\{x^*\}`, '后面的每一步都必须守住这个交点。'],
        ['可逆倍加', '让一条约束绕解旋转', '用一行的倍数加到另一行，新方程改变外观，却仍穿过同一个交点。', String.raw`R_2\leftarrow R_2-2R_1`, '可逆行变换改变写法，不改变解集。'],
        ['读出主元', '几何与矩阵对齐', '同一个行操作在增广矩阵中消去一个位置，主元记录独立约束，自由列记录可移动方向。', String.raw`\operatorname{rank}(A)=2`, '消元的终点，是把解空间的自由度读出来。'],
      ],
      draw: (step) => storyElimination(step),
    },
    'n-vector-space': {
      title: '向量是一段有方向的位移，线性组合是一条连续路径',
      lead: '箭头、首尾相接的运动和坐标分量必须讲同一件事。',
      steps: [
        ['把向量画对', '有向位移', '向量同时包含大小和方向；端点只是结果，完整箭头才表达从哪里到哪里。', String.raw`u=(u_1,\ldots,u_n)^T`, '几何箭头与坐标列是同一个对象的两种读法。'],
        ['缩放并接续', '先走 αu，再走 βv', '改变系数会改变长度，负系数还会反转方向；第二段必须从第一段终点出发。', String.raw`\alpha u+\beta v`, '线性组合是一条首尾相接的路径。'],
        ['得到和向量', '终点与坐标一致', '从原点直指最终终点的箭头就是 w，逐分量计算必须抵达同一位置。', String.raw`w_i=\alpha u_i+\beta v_i`, '几何终点和代数坐标一一对应。'],
      ],
      controls: 'vector',
      draw: (step, state) => storyVector(step, state),
    },
    'linear-dependence': {
      title: '线性相关的本质：新向量没有增加新的方向',
      lead: '逐个加入向量，看张成空间的维数何时真正增长。',
      steps: [
        ['一个方向', '先张成一条线', '一个非零向量的所有倍数只能沿着同一条直线运动。', String.raw`\operatorname{span}(v_1)`, '一个独立方向对应一维空间。'],
        ['加入新方向', '从线铺成平面', '第二个向量不在原来的线上，线性组合因此铺开二维平面。', String.raw`\dim\operatorname{span}(v_1,v_2)=2`, '维数只有在出现真正的新方向时才增长。'],
        ['加入冗余向量', '给出非零关系', 'v₃ 虽然是新箭头，却已经能由 v₁ 与 v₂ 拼出。', String.raw`v_1+v_2-v_3=0`, '存在非全零系数关系，就是线性相关的证书。'],
        ['删去冗余', '张成空间不缩小', '删去 v₃ 后原来的平面仍然完整存在。', String.raw`\operatorname{span}(v_1,v_2,v_3)=\operatorname{span}(v_1,v_2)`, '基保留全部方向，同时去掉重复信息。'],
      ],
      draw: (step) => storyDependence(step),
    },
    'matrix-rank': {
      title: '秩不是主元计数器，而是变换后幸存的维数',
      lead: '让矩阵作用在整张网格上：平面可以保持二维，也可以塌成线或点。',
      steps: [
        ['保留面积', '二维像空间', '两个基方向经过 A 后仍不共线，单位方格仍有面积。', String.raw`\operatorname{rank}(A)=2`, '输出空间仍有两个独立方向。'],
        ['压成直线', '一维像空间', '不同输入方向被压到同一条线上，所有小方格失去面积。', String.raw`\operatorname{rank}(A)=1`, '二维信息只剩一个独立方向。'],
        ['压成一点', '零维像空间', '所有输入都被送到同一个点，没有任何方向被保留。', String.raw`\operatorname{rank}(A)=0`, '秩就是像空间的维数。'],
      ],
      draw: (step) => storyRank(step),
    },
    solvability: {
      title: 'Ax=b 是否有解，只看目标 b 能不能被 A 到达',
      lead: '矩阵的列向量生成全部可能输出；这片可达区域就是列空间。',
      steps: [
        ['看可达区域', '列空间', '所有 Ax 都是 A 的列向量的线性组合；它们共同组成 Col(A)。', String.raw`\operatorname{Col}(A)=\{Ax:x\in F^n\}`, '列空间就是变换 A 的可达区域。'],
        ['目标可达', 'b 在列空间中', '当 b 落在可达区域里，至少存在一个输入 x 被 A 送到 b。', String.raw`\operatorname{rank}(A)=\operatorname{rank}([A\mid b])`, '增广列没有增加新方向，系统有解。'],
        ['目标不可达', 'b 在列空间外', '当 b 落在可达区域之外，任何输入都无法命中它。', String.raw`\operatorname{rank}(A)<\operatorname{rank}([A\mid b])`, '增广列增加了新方向，系统无解。'],
      ],
      draw: (step) => storySolvability(step),
    },
    'solution-structure': {
      title: '全部解 = 一个特解 + 所有不会改变输出的方向',
      lead: '在未知量空间里沿零空间移动；在输出空间里，结果始终停在同一个 b。',
      steps: [
        ['找到锚点', '一个特解 x₀', '先找任意一个满足 Ax₀=b 的点，它只是整条解集上的锚点。', String.raw`Ax_0=b`, '特解给出解集的位置。'],
        ['找到核方向', 'Aη=0', '沿 η 移动不会改变输出，因为这个方向被 A 压到零。', String.raw`\eta\in\ker(A)`, '零空间给出解集允许移动的方向。'],
        ['看整条纤维', '许多输入，同一个输出', '整条仿射直线上的点都被 A 送到同一个 b。', String.raw`A(x_0+\eta)=b`, '解集是 x₀ 平移后的零空间。'],
        ['拖动当前解', 'x=x₀+sη', '改变 s 只会沿零空间方向移动，Ax 始终等于 b。', String.raw`x=x_0+s\eta`, '位置由特解决定，形状由零空间决定。'],
      ],
      controls: 'solution',
      draw: (step, state) => storySolution(step, state),
    },
    'binary-higher-degree': {
      title: '二元高次消元：把曲线交点投影成一元候选，再回到原图验证',
      lead: '结式不是黑箱公式，而是“消去一个坐标”的代数实现。',
      steps: [
        ['看曲线交点', '原问题', '两个方程各自给出一条曲线，联立解就是公共点。', String.raw`f(x,y)=0,\quad g(x,y)=0`, '交点是问题本身，消元只是读取交点的方法。'],
        ['投影到 x 轴', '消去 y', '把公共点投影到 x 轴，只保留可能出现交点的横坐标。', String.raw`\exists y:\ f(x,y)=g(x,y)=0`, '二维交点问题被压成一元候选问题。'],
        ['形成一元条件', '结式或代入', '消去 y 后得到只含 x 的多项式 R(x)。', String.raw`R(x)=0`, 'R(x) 的根只是候选横坐标。'],
        ['回代原方程', '候选不等于解', '为候选 x 求 y，并同时代回两个原方程。', String.raw`f(x_i,y_i)=g(x_i,y_i)=0`, '通过回代后，候选才重新成为几何交点。'],
      ],
      draw: (step) => storyResultant(step),
    },
  };

  function buildControls(kind, state) {
    if (kind === 'vector') {
      return `<div class="ch3-story-control-set" aria-label="线性组合系数"><label><span>α</span><input type="range" min="-1.35" max="1.35" step="0.05" value="${state.alpha}"><strong>${f(state.alpha)}</strong></label><label><span>β</span><input type="range" min="-1.35" max="1.35" step="0.05" value="${state.beta}"><strong>${f(state.beta)}</strong></label></div>`;
    }
    if (kind === 'solution') {
      return `<div class="ch3-story-control-set is-single" aria-label="解族参数"><label><span>s</span><input type="range" min="-1.1" max="1.1" step="0.05" value="${state.s}"><strong>${f(state.s)}</strong></label></div>`;
    }
    return '';
  }

  function mountStory(section, root) {
    const config = stories[section.id];
    if (!config) return null;
    const interactive = root.querySelector(`#${CSS.escape(section.id)}-interactive`);
    const lab = interactive?.querySelector('.ch3-lab');
    if (!interactive || !lab || interactive.querySelector('[data-ch3-story]')) return null;

    const heading = interactive.querySelector(':scope > h2');
    if (heading) heading.textContent = '交互实验';

    const state = { step: 0, alpha: 1, beta: 1, s: .65 };
    const story = document.createElement('section');
    story.className = 'ch3-visual-story';
    story.dataset.ch3Story = section.id;
    story.innerHTML = `
      <header class="ch3-story-header"><span class="ch3-story-kicker">GEOMETRIC STORY</span><h3>${config.title}</h3><p>${config.lead}</p></header>
      <div class="ch3-story-stage-shell"><svg class="ch3-story-svg" data-story-svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(config.title)}"></svg></div>
      <div class="ch3-story-step-list" role="tablist" aria-label="视觉推导步骤" style="--step-count:${config.steps.length}">${config.steps.map((item, index) => `<button type="button" role="tab" data-story-step="${index}" aria-selected="${index === 0}"><span>${String(index + 1).padStart(2, '0')}</span><strong>${item[0]}</strong><small>${item[1]}</small></button>`).join('')}</div>
      <div class="ch3-story-reading" aria-live="polite"><div class="ch3-story-copy"><span data-story-kicker></span><h4 data-story-heading></h4><p data-story-text></p></div><div class="ch3-story-symbol"><div class="ch3-story-formula" data-story-formula></div><p data-story-conclusion></p></div></div>
      <div data-story-controls></div>`;

    const details = document.createElement('details');
    details.className = 'ch3-precision-lab';
    const summary = document.createElement('summary');
    summary.innerHTML = `<span><strong>继续做精确实验</strong><small>展开 RREF、完整坐标、参数验证与边界预设</small></span><i aria-hidden="true">＋</i>`;
    lab.replaceWith(details);
    details.append(summary, lab);

    const storySection = document.createElement('section');
    storySection.className = 'ch3-story-section';
    storySection.append(story);
    interactive.insertBefore(storySection, details);

    const svg = story.querySelector('[data-story-svg]');
    const buttons = [...story.querySelectorAll('[data-story-step]')];
    const controlsRoot = story.querySelector('[data-story-controls]');
    const cleanups = [];

    function render() {
      const item = config.steps[state.step];
      buttons.forEach((button, index) => {
        const active = index === state.step;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-selected', String(active));
      });
      story.querySelector('[data-story-kicker]').textContent = item[1];
      story.querySelector('[data-story-heading]').textContent = item[0];
      story.querySelector('[data-story-text]').textContent = item[2];
      story.querySelector('[data-story-formula]').innerHTML = texD(item[3]);
      story.querySelector('[data-story-conclusion]').textContent = item[4];
      svg.innerHTML = config.draw(state.step, state);
      controlsRoot.innerHTML = buildControls(config.controls, state);
      if (config.controls === 'vector') {
        const [alphaInput, betaInput] = controlsRoot.querySelectorAll('input');
        alphaInput.addEventListener('input', () => { state.alpha = Number(alphaInput.value); render(); });
        betaInput.addEventListener('input', () => { state.beta = Number(betaInput.value); render(); });
      } else if (config.controls === 'solution') {
        const input = controlsRoot.querySelector('input');
        input.addEventListener('input', () => { state.s = Number(input.value); render(); });
      }
    }

    buttons.forEach((button) => {
      const listener = () => { state.step = Number(button.dataset.storyStep); render(); };
      button.addEventListener('click', listener);
      cleanups.push(() => button.removeEventListener('click', listener));
    });
    details.addEventListener('toggle', () => { summary.querySelector('i').textContent = details.open ? '−' : '＋'; });
    render();
    return () => cleanups.splice(0).forEach((cleanup) => cleanup());
  }

  window.defineChapter3LessonEnhancer?.(mountStory);
})();
