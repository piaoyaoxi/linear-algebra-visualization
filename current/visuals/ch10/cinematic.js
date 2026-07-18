(() => {
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const interpolate = (from, to, t) => {
    if (typeof from === "number" && typeof to === "number") return lerp(from, to, t);
    if (Array.isArray(from) && Array.isArray(to)) return from.map((value, index) => interpolate(value, to[index], t));
    if (from && to && typeof from === "object" && typeof to === "object") {
      return Object.fromEntries(Object.keys(to).map((key) => [key, interpolate(from[key], to[key], t)]));
    }
    return t < 0.5 ? from : to;
  };
  const fmt = (value, digits = 2) => {
    const rounded = Math.round(value * 10 ** digits) / 10 ** digits;
    return String(Object.is(rounded, -0) ? 0 : rounded);
  };
  const dot = (u, v) => u[0] * v[0] + u[1] * v[1];
  const det2 = (u, v) => u[0] * v[1] - u[1] * v[0];
  const mul2 = (A, v) => [A[0] * v[0] + A[1] * v[1], A[2] * v[0] + A[3] * v[1]];
  const transposeMul2 = (A, v) => [A[0] * v[0] + A[2] * v[1], A[1] * v[0] + A[3] * v[1]];
  const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const defs = () => `
    <defs>
      <linearGradient id="cinema-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#091525"/>
        <stop offset="0.58" stop-color="#0a1728"/>
        <stop offset="1" stop-color="#07111f"/>
      </linearGradient>
      <radialGradient id="cinema-halo">
        <stop offset="0" stop-color="#62e6ee" stop-opacity=".22"/>
        <stop offset="1" stop-color="#62e6ee" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="cinema-area-positive" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#53dde7" stop-opacity=".34"/>
        <stop offset="1" stop-color="#3ca8b3" stop-opacity=".12"/>
      </linearGradient>
      <linearGradient id="cinema-area-negative" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffad62" stop-opacity=".38"/>
        <stop offset="1" stop-color="#ff6f7f" stop-opacity=".14"/>
      </linearGradient>
      <filter id="cinema-glow-cyan" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="cinema-glow-amber" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <marker id="cinema-arrow-cyan" viewBox="0 0 10 10" refX="8.4" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#62e6ee"/></marker>
      <marker id="cinema-arrow-amber" viewBox="0 0 10 10" refX="8.4" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#ffad62"/></marker>
      <marker id="cinema-arrow-soft" viewBox="0 0 10 10" refX="8.4" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#9fb0c3"/></marker>
    </defs>`;

  const grid = (x, y, width, height, spacing = 44) => {
    let paths = "";
    for (let px = x; px <= x + width; px += spacing) paths += `<path d="M${px} ${y}V${y + height}"/>`;
    for (let py = y; py <= y + height; py += spacing) paths += `<path d="M${x} ${py}H${x + width}"/>`;
    return `<g class="cinema-grid">${paths}</g>`;
  };

  const mapPoint = (vector, origin, scale) => [origin[0] + vector[0] * scale, origin[1] - vector[1] * scale];
  const arrow = (vector, origin, scale, role, label, opacity = 1, labelDx = 12, labelDy = -10) => {
    const end = mapPoint(vector, origin, scale);
    const marker = role === "amber" ? "cinema-arrow-amber" : "cinema-arrow-cyan";
    return `<g opacity="${opacity}"><line class="cinema-vector is-${role}" x1="${origin[0]}" y1="${origin[1]}" x2="${end[0]}" y2="${end[1]}" marker-end="url(#${marker})"/><circle class="cinema-vector-end is-${role}" cx="${end[0]}" cy="${end[1]}" r="5"/><text class="cinema-vector-label is-${role}" x="${end[0] + labelDx}" y="${end[1] + labelDy}">${label}</text></g>`;
  };

  function clipImplicit(a, b, c, bounds) {
    const [xmin, xmax, ymin, ymax] = bounds;
    const points = [];
    const add = (x, y) => {
      if (x >= xmin - 1e-7 && x <= xmax + 1e-7 && y >= ymin - 1e-7 && y <= ymax + 1e-7) {
        if (!points.some((p) => Math.hypot(p[0] - x, p[1] - y) < 1e-5)) points.push([x, y]);
      }
    };
    if (Math.abs(b) > 1e-8) { add(xmin, (c - a * xmin) / b); add(xmax, (c - a * xmax) / b); }
    if (Math.abs(a) > 1e-8) { add((c - b * ymin) / a, ymin); add((c - b * ymax) / a, ymax); }
    return points.length >= 2 ? points.slice(0, 2) : null;
  }

  const implicit = (a, b, c, origin, scale, className, label = "") => {
    const points = clipImplicit(a, b, c, [-4.2, 4.2, -3.5, 3.5]);
    if (!points) return "";
    const p1 = mapPoint(points[0], origin, scale);
    const p2 = mapPoint(points[1], origin, scale);
    const middle = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
    return `<g class="${className}"><line x1="${p1[0]}" y1="${p1[1]}" x2="${p2[0]}" y2="${p2[1]}"/>${label ? `<text x="${middle[0] + 8}" y="${middle[1] - 8}">${label}</text>` : ""}</g>`;
  };

  const frame = (content) => `${defs()}<rect width="960" height="540" rx="28" fill="url(#cinema-bg)"/><circle cx="280" cy="260" r="250" fill="url(#cinema-halo)"/><path class="cinema-frame-line" d="M32 62H928"/>${content}`;

  function renderFunctional(state) {
    const origin = [350, 302];
    const scale = 58;
    const value = dot(state.a, state.x);
    const normalLength = Math.hypot(state.a[0], state.a[1]) || 1;
    const unit = [state.a[0] / normalLength, state.a[1] / normalLength];
    const tangent = [-unit[1], unit[0]];
    const projection = [unit[0] * value / normalLength, unit[1] * value / normalLength];
    const projectionPoint = mapPoint(projection, origin, scale);
    const xPoint = mapPoint(state.x, origin, scale);
    const levels = [-4, -2, 0, 2, 4].map((c) => implicit(state.a[0], state.a[1], c, origin, scale, c === 0 ? "cinema-kernel" : "cinema-level", c === 0 ? "ker f" : "")).join("");
    return frame(`<text class="cinema-kicker" x="44" y="42">线性函数不是一支箭头，而是一套平行的读数层</text><g class="cinema-plane"><rect x="54" y="82" width="610" height="414" rx="24"/>${grid(76, 104, 566, 370, 58)}<line class="cinema-axis" x1="76" y1="${origin[1]}" x2="642" y2="${origin[1]}"/><line class="cinema-axis" x1="${origin[0]}" y1="104" x2="${origin[0]}" y2="474"/>${levels}${implicit(state.a[0], state.a[1], value, origin, scale, "cinema-current-level", `f(x)=${fmt(value)}`)}<line class="cinema-projection" x1="${origin[0]}" y1="${origin[1]}" x2="${projectionPoint[0]}" y2="${projectionPoint[1]}"/><line class="cinema-projection-dash" x1="${projectionPoint[0]}" y1="${projectionPoint[1]}" x2="${xPoint[0]}" y2="${xPoint[1]}"/>${arrow(state.x, origin, scale, "cyan", "x")}${arrow([unit[0] * 1.45, unit[1] * 1.45], origin, scale, "amber", "读取方向", 1, -46, 28)}<path class="cinema-tangent" d="M${projectionPoint[0] - tangent[0] * 54} ${projectionPoint[1] + tangent[1] * 54}L${projectionPoint[0] + tangent[0] * 54} ${projectionPoint[1] - tangent[1] * 54}"/></g><g class="cinema-readout-panel"><rect x="690" y="92" width="226" height="388" rx="22"/><text class="cinema-panel-label" x="718" y="132">当前读取</text><text class="cinema-big-number" x="718" y="198">${fmt(value)}</text><text class="cinema-equation" x="718" y="232">f(x) = aᵀx</text><path class="cinema-meter-track" d="M718 274H888"/><path class="cinema-meter-fill ${value < 0 ? "is-negative" : ""}" d="M803 274H${803 + clamp(value * 17, -85, 85)}"/><circle class="cinema-meter-zero" cx="803" cy="274" r="4"/><text class="cinema-panel-label" x="718" y="326">画面里只盯三件事</text><g class="cinema-bullet"><circle cx="724" cy="352" r="4"/><text x="740" y="357">同一层：读数不变</text></g><g class="cinema-bullet"><circle cx="724" cy="388" r="4"/><text x="740" y="393">穿过核：符号改变</text></g><g class="cinema-bullet"><circle cx="724" cy="424" r="4"/><text x="740" y="429">倍率改变：层距改变</text></g></g>`);
  }

  function readerBands(a, b, origin, scale, className, selected = 0) {
    return [-4, -2, 0, 2, 4].map((c) => implicit(a, b, c, origin, scale, `${className}${Math.abs(c - selected) < 0.1 ? " is-current" : ""}`)).join("");
  }

  function renderDual(state) {
    const leftOrigin = [246, 292];
    const rightOrigin = [714, 292];
    const scale = 47;
    const value = dot(state.f, state.x);
    const mode = Math.round(state.mode);
    const basicOpacity = clamp(2 - state.mode, 0, 1);
    const basisOpacity = clamp(1 - Math.abs(state.mode - 2), 0, 1);
    const pullOpacity = clamp(state.mode - 2, 0, 1);
    return frame(`<text class="cinema-kicker" x="44" y="42">向量是被测量的对象；对偶向量是测量规则</text><g opacity="${basicOpacity}"><rect class="cinema-subpanel" x="46" y="92" width="400" height="382" rx="22"/><rect class="cinema-subpanel" x="514" y="92" width="400" height="382" rx="22"/><text class="cinema-panel-title" x="74" y="130">原空间 V</text><text class="cinema-panel-title" x="542" y="130">对偶空间 V*</text>${grid(76, 152, 340, 286, 47)}${grid(544, 152, 340, 286, 47)}${arrow(state.x, leftOrigin, scale, "cyan", "x")}${readerBands(state.f[0], state.f[1], rightOrigin, scale, "cinema-reader-band", value)}<g class="cinema-reader-glyph" transform="translate(${rightOrigin[0] - state.f[1] * 18} ${rightOrigin[1] + state.f[0] * 18}) rotate(${-Math.atan2(state.f[0], state.f[1]) * 180 / Math.PI})"><rect x="-38" y="-10" width="76" height="20" rx="10"/><path d="M-28 -3H28M-20 4H20"/></g><path class="cinema-pairing-bridge" d="M436 292C470 250 490 250 524 292"/><circle class="cinema-pairing-node" cx="480" cy="268" r="38"/><text class="cinema-pairing-label" x="480" y="260" text-anchor="middle">f(x)</text><text class="cinema-pairing-value" x="480" y="288" text-anchor="middle">${fmt(value)}</text></g><g opacity="${basisOpacity}"><rect class="cinema-subpanel" x="54" y="92" width="852" height="382" rx="22"/><text class="cinema-panel-title" x="82" y="130">对偶基就是“逐个读取坐标”的两台探针</text>${grid(84, 154, 380, 282, 47)}${arrow([1, 0], [274, 296], 74, "cyan", "e₁")}${arrow([0, 1], [274, 296], 74, "amber", "e₂")}<g class="cinema-pair-table" transform="translate(548 186)"><rect width="210" height="164" rx="18"/><text x="92" y="34">e₁</text><text x="146" y="34">e₂</text><text x="34" y="82">e¹</text><text x="34" y="132">e²</text><text class="is-hot" x="94" y="82">1</text><text x="148" y="82">0</text><text x="94" y="132">0</text><text class="is-hot" x="148" y="132">1</text></g><text class="cinema-small-title" x="540" y="392">e¹、e² 是两套读取层，不是原空间里的两支普通箭头。</text></g><g opacity="${pullOpacity}"><rect class="cinema-subpanel" x="54" y="92" width="852" height="382" rx="22"/><text class="cinema-panel-title" x="82" y="130">向量顺着 T 前进，测量规则沿着 T 反向拉回</text><g transform="translate(110 190)"><rect class="cinema-space-box" width="210" height="170" rx="22"/><text x="24" y="38">V</text>${arrow(state.x, [105, 105], 35, "cyan", "x")}</g><g transform="translate(640 190)"><rect class="cinema-space-box" width="210" height="170" rx="22"/><text x="24" y="38">W</text>${arrow([1.9, .7], [105, 105], 35, "cyan", "Tx")}</g><path class="cinema-forward-map" d="M332 238H626" marker-end="url(#cinema-arrow-cyan)"/><text class="cinema-map-label" x="480" y="224" text-anchor="middle">T</text><path class="cinema-backward-map" d="M626 338H332" marker-end="url(#cinema-arrow-amber)"/><text class="cinema-map-label is-amber" x="480" y="370" text-anchor="middle">T* : f ↦ f ∘ T</text><g class="cinema-reader-glyph" transform="translate(746 154)"><rect x="-38" y="-10" width="76" height="20" rx="10"/><path d="M-28 -3H28M-20 4H20"/></g></g>`);
  }

  function matrixGrid(A, mode) {
    return A.map((value, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const active = mode < 2 || mode === 2;
      return `<g transform="translate(${col * 74} ${row * 74})"><rect class="cinema-matrix-cell${active ? " is-active" : ""}" width="62" height="62" rx="12"/><text x="31" y="39" text-anchor="middle">${fmt(value, 1)}</text></g>`;
    }).join("");
  }

  function renderBilinear(state) {
    const leftOrigin = [220, 304];
    const rightOrigin = [744, 304];
    const scale = 48;
    const value = dot(state.x, mul2(state.A, state.y));
    const Ay = mul2(state.A, state.y);
    const Atx = transposeMul2(state.A, state.x);
    const mode = Math.round(state.mode);
    const leftBandOpacity = clamp(1 - state.mode, 0, 1);
    const rightBandOpacity = clamp(1 - Math.abs(state.mode - 1), 0, 1);
    const pipelineOpacity = 0.22 + 0.78 * clamp(1 - Math.abs(state.mode - 2), 0, 1);
    const swapOpacity = clamp(state.mode - 2, 0, 1);
    const leftBands = `<g opacity="${leftBandOpacity}">${readerBands(Ay[0], Ay[1], leftOrigin, scale, "cinema-reader-band", value)}</g>`;
    const rightBands = `<g opacity="${rightBandOpacity}">${readerBands(Atx[0], Atx[1], rightOrigin, scale, "cinema-reader-band", value)}</g>`;
    return frame(`<text class="cinema-kicker" x="44" y="42">双线性：固定一个输入，另一个输入就看到一套线性读数层</text><rect class="cinema-subpanel" x="44" y="92" width="352" height="382" rx="22"/><rect class="cinema-subpanel" x="564" y="92" width="352" height="382" rx="22"/><text class="cinema-panel-title" x="72" y="130">左输入 x</text><text class="cinema-panel-title" x="592" y="130">右输入 y</text>${grid(72, 154, 296, 282, 47)}${grid(592, 154, 296, 282, 47)}${leftBands}${rightBands}${arrow(state.x, leftOrigin, scale, "cyan", "x")}${arrow(state.y, rightOrigin, scale, "amber", "y")}<g class="cinema-matrix-machine"><rect x="394" y="148" width="172" height="246" rx="28"/><text class="cinema-machine-label" x="480" y="178" text-anchor="middle">配对矩阵 A</text><g transform="translate(418 198)">${matrixGrid(state.A, mode)}</g><circle class="cinema-output-orb ${value < 0 ? "is-negative" : ""}" cx="480" cy="432" r="42"/><text class="cinema-output-label" x="480" y="425" text-anchor="middle">B(x,y)</text><text class="cinema-output-value" x="480" y="451" text-anchor="middle">${fmt(value)}</text></g><path class="cinema-flow-line" d="M386 304H414" marker-end="url(#cinema-arrow-cyan)"/><path class="cinema-flow-line is-amber" d="M574 304H546" marker-end="url(#cinema-arrow-amber)"/><g class="cinema-pipeline" opacity="${pipelineOpacity}"><rect x="120" y="446" width="720" height="62" rx="18"/><text x="150" y="484">y</text><path d="M178 478H258" marker-end="url(#cinema-arrow-amber)"/><text x="282" y="484">Ay = (${fmt(Ay[0])}, ${fmt(Ay[1])})</text><path d="M448 478H538" marker-end="url(#cinema-arrow-cyan)"/><text x="562" y="484">xᵀ(Ay) = ${fmt(value)}</text></g><g class="cinema-swap-note" opacity="${swapOpacity}"><text x="480" y="112" text-anchor="middle">交错预设：交换 x、y，配对值变号</text></g>`);
  }

  function polygonPoints(x, y, origin, scale) {
    const px = mapPoint(x, origin, scale);
    const py = mapPoint(y, origin, scale);
    const pxy = mapPoint([x[0] + y[0], x[1] + y[1]], origin, scale);
    return `${origin[0]},${origin[1]} ${px[0]},${px[1]} ${pxy[0]},${pxy[1]} ${py[0]},${py[1]}`;
  }

  function renderSymplectic(state) {
    const origin = [338, 340];
    const scale = 70;
    const value = det2(state.x, state.y);
    const mode = Math.round(state.mode);
    const positive = value >= 0;
    const baseX = [2.4, .6];
    const baseY = [.7, 2.2];
    const ghostOpacity = clamp(state.mode - 1, 0, 1);
    const verdict = mode === 4 ? "不保持辛形式" : mode >= 2 ? "保持辛形式" : positive ? "正向配对" : "交换后变号";
    return frame(`<text class="cinema-kicker" x="44" y="42">辛形式不测长度，它测一对方向之间的有向面积</text><rect class="cinema-subpanel" x="44" y="92" width="620" height="400" rx="22"/>${grid(72, 120, 564, 344, 56)}<line class="cinema-axis" x1="72" y1="${origin[1]}" x2="636" y2="${origin[1]}"/><line class="cinema-axis" x1="${origin[0]}" y1="120" x2="${origin[0]}" y2="464"/><g opacity="${ghostOpacity}"><polygon class="cinema-area-ghost" points="${polygonPoints(baseX, baseY, origin, scale)}"/>${arrow(baseX, origin, scale, "cyan", "原 x", .28)}${arrow(baseY, origin, scale, "amber", "原 y", .28)}</g><polygon class="cinema-area ${positive ? "is-positive" : "is-negative"}" points="${polygonPoints(state.x, state.y, origin, scale)}"/>${arrow(state.x, origin, scale, "cyan", "x")}${arrow(state.y, origin, scale, "amber", "y")}<path class="cinema-orientation ${positive ? "" : "is-negative"}" d="M${origin[0] + 46} ${origin[1] - 4}A52 52 0 0 ${positive ? 0 : 1} ${origin[0] + 8} ${origin[1] - 48}" marker-end="url(#${positive ? "cinema-arrow-cyan" : "cinema-arrow-amber"})"/><g class="cinema-symp-panel"><rect x="690" y="92" width="226" height="400" rx="22"/><text class="cinema-panel-label" x="718" y="132">有向面积</text><text class="cinema-big-number ${positive ? "" : "is-negative"}" x="718" y="198">${fmt(value)}</text><text class="cinema-equation" x="718" y="232">ω(x,y) = det[x y]</text><path class="cinema-frame-line" d="M718 258H888"/><text class="cinema-panel-label" x="718" y="302">当前变换</text><text class="cinema-verdict ${mode === 4 ? "is-bad" : "is-good"}" x="718" y="340">${verdict}</text><text class="cinema-equation" x="718" y="378">${mode === 4 ? "SᵀJS ≠ J" : mode >= 2 ? "SᵀJS = J" : "ω(y,x) = −ω(x,y)"}</text><text class="cinema-panel-copy" x="718" y="420">${mode === 2 ? "剪切改变形状，但面积配对不变。" : mode === 3 ? "一边放大，配对方向按倒数压缩。" : mode === 4 ? "两个方向一起放大，面积被放大。" : "交换顺序只改变方向符号。"}</text></g>`);
  }


  const frameMobile = (content, height = 520) => `${defs()}<rect width="360" height="${height}" rx="22" fill="url(#cinema-bg)"/><circle cx="176" cy="230" r="210" fill="url(#cinema-halo)"/>${content}`;

  function renderFunctionalMobile(state) {
    const origin = [180, 275];
    const scale = 45;
    const value = dot(state.a, state.x);
    const normalLength = Math.hypot(state.a[0], state.a[1]) || 1;
    const unit = [state.a[0] / normalLength, state.a[1] / normalLength];
    const tangent = [-unit[1], unit[0]];
    const projection = [unit[0] * value / normalLength, unit[1] * value / normalLength];
    const projectionPoint = mapPoint(projection, origin, scale);
    const xPoint = mapPoint(state.x, origin, scale);
    const levels = [-4, -2, 0, 2, 4].map((c) => implicit(state.a[0], state.a[1], c, origin, scale, c === 0 ? "cinema-kernel" : "cinema-level", c === 0 ? "ker f" : "")).join("");
    return frameMobile(`<defs><clipPath id="cinema-mobile-functional-clip"><rect x="18" y="34" width="324" height="414" rx="20"/></clipPath></defs><rect class="cinema-subpanel" x="18" y="34" width="324" height="414" rx="20"/><g clip-path="url(#cinema-mobile-functional-clip)">${grid(36, 58, 288, 360, 45)}<line class="cinema-axis" x1="36" y1="${origin[1]}" x2="324" y2="${origin[1]}"/><line class="cinema-axis" x1="${origin[0]}" y1="58" x2="${origin[0]}" y2="418"/>${levels}${implicit(state.a[0], state.a[1], value, origin, scale, "cinema-current-level")}<line class="cinema-projection" x1="${origin[0]}" y1="${origin[1]}" x2="${projectionPoint[0]}" y2="${projectionPoint[1]}"/><line class="cinema-projection-dash" x1="${projectionPoint[0]}" y1="${projectionPoint[1]}" x2="${xPoint[0]}" y2="${xPoint[1]}"/>${arrow(state.x, origin, scale, "cyan", "x", 1, 9, -10)}${arrow([unit[0] * 1.35, unit[1] * 1.35], origin, scale, "amber", "a", 1, -18, 34)}<path class="cinema-tangent" d="M${projectionPoint[0] - tangent[0] * 42} ${projectionPoint[1] + tangent[1] * 42}L${projectionPoint[0] + tangent[0] * 42} ${projectionPoint[1] - tangent[1] * 42}"/></g><g class="cinema-mobile-value"><rect x="238" y="52" width="86" height="58" rx="14"/><text x="281" y="72" text-anchor="middle">f(x)</text><strong></strong><text class="is-number" x="281" y="98" text-anchor="middle">${fmt(value)}</text></g><text class="cinema-mobile-note" x="28" y="482">同层不变 · 穿核变号 · 倍率改刻度</text>`);
  }

  function renderDualMobile(state) {
    const value = dot(state.f, state.x);
    const basicOpacity = clamp(2 - state.mode, 0, 1);
    const basisOpacity = clamp(1 - Math.abs(state.mode - 2), 0, 1);
    const pullOpacity = clamp(state.mode - 2, 0, 1);
    const topOrigin = [180, 132];
    const bottomOrigin = [180, 386];
    const scale = 34;
    return frameMobile(`<defs><clipPath id="cinema-mobile-dual-top"><rect x="18" y="24" width="324" height="184" rx="18"/></clipPath><clipPath id="cinema-mobile-dual-bottom"><rect x="18" y="280" width="324" height="184" rx="18"/></clipPath></defs><g opacity="${basicOpacity}"><rect class="cinema-subpanel" x="18" y="24" width="324" height="184" rx="18"/><text class="cinema-panel-title" x="36" y="52">V：被测量的向量</text><g clip-path="url(#cinema-mobile-dual-top)">${grid(36, 66, 288, 126, 42)}${arrow(state.x, topOrigin, scale, "cyan", "x")}</g><rect class="cinema-subpanel" x="18" y="280" width="324" height="184" rx="18"/><text class="cinema-panel-title" x="36" y="308">V*：测量规则</text><g clip-path="url(#cinema-mobile-dual-bottom)">${grid(36, 322, 288, 126, 42)}${readerBands(state.f[0], state.f[1], bottomOrigin, scale, "cinema-reader-band", value)}<g class="cinema-reader-glyph" transform="translate(${bottomOrigin[0] - state.f[1] * 14} ${bottomOrigin[1] + state.f[0] * 14}) rotate(${-Math.atan2(state.f[0], state.f[1]) * 180 / Math.PI})"><rect x="-32" y="-9" width="64" height="18" rx="9"/><path d="M-23 -3H23M-17 4H17"/></g></g><circle class="cinema-pairing-node" cx="180" cy="244" r="34"/><text class="cinema-pairing-label" x="180" y="237" text-anchor="middle">f(x)</text><text class="cinema-pairing-value" x="180" y="260" text-anchor="middle">${fmt(value)}</text></g><g opacity="${basisOpacity}"><rect class="cinema-subpanel" x="18" y="24" width="324" height="440" rx="20"/><text class="cinema-panel-title" x="36" y="56">两台坐标探针</text>${grid(36, 76, 142, 244, 38)}${arrow([1, 0], [108, 222], 58, "cyan", "e₁")}${arrow([0, 1], [108, 222], 58, "amber", "e₂")}<g class="cinema-pair-table" transform="translate(196 116)"><rect width="130" height="150" rx="16"/><text x="66" y="30">e₁</text><text x="101" y="30">e₂</text><text x="22" y="72">e¹</text><text x="22" y="118">e²</text><text class="is-hot" x="68" y="72">1</text><text x="103" y="72">0</text><text x="68" y="118">0</text><text class="is-hot" x="103" y="118">1</text></g><text class="cinema-mobile-note" x="36" y="374">e¹ 只读取第一坐标</text><text class="cinema-mobile-note is-amber" x="36" y="408">e² 只读取第二坐标</text></g><g opacity="${pullOpacity}"><rect class="cinema-subpanel" x="18" y="24" width="324" height="440" rx="20"/><g transform="translate(72 54)"><rect class="cinema-space-box" width="216" height="116" rx="18"/><text x="18" y="30">V</text>${arrow(state.x, [108, 72], 28, "cyan", "x")}</g><path class="cinema-forward-map" d="M158 184V294" marker-end="url(#cinema-arrow-cyan)"/><text class="cinema-map-label" x="143" y="242" text-anchor="end">T</text><path class="cinema-backward-map" d="M202 294V184" marker-end="url(#cinema-arrow-amber)"/><text class="cinema-map-label is-amber" x="217" y="242">T*</text><g transform="translate(72 310)"><rect class="cinema-space-box" width="216" height="116" rx="18"/><text x="18" y="30">W</text>${arrow([1.9, .7], [108, 72], 28, "cyan", "Tx")}<g class="cinema-reader-glyph" transform="translate(170 35)"><rect x="-28" y="-8" width="56" height="16" rx="8"/><path d="M-20 -2H20M-14 4H14"/></g></g><text class="cinema-mobile-note" x="180" y="486" text-anchor="middle">向量前进，读取器反向拉回</text></g>`);
  }

  function renderBilinearMobile(state) {
    const value = dot(state.x, mul2(state.A, state.y));
    const Ay = mul2(state.A, state.y);
    const Atx = transposeMul2(state.A, state.x);
    const leftBandOpacity = clamp(1 - state.mode, 0, 1);
    const rightBandOpacity = clamp(1 - Math.abs(state.mode - 1), 0, 1);
    const swapOpacity = clamp(state.mode - 2, 0, 1);
    const leftOrigin = [90, 145];
    const rightOrigin = [270, 145];
    const scale = 26;
    return frameMobile(`<defs><clipPath id="cinema-mobile-bi-left"><rect x="12" y="24" width="156" height="210" rx="18"/></clipPath><clipPath id="cinema-mobile-bi-right"><rect x="192" y="24" width="156" height="210" rx="18"/></clipPath></defs><rect class="cinema-subpanel" x="12" y="24" width="156" height="210" rx="18"/><rect class="cinema-subpanel" x="192" y="24" width="156" height="210" rx="18"/><text class="cinema-panel-title" x="28" y="54">左槽 x</text><text class="cinema-panel-title" x="208" y="54">右槽 y</text><g clip-path="url(#cinema-mobile-bi-left)">${grid(28, 68, 124, 148, 36)}<g opacity="${leftBandOpacity}">${readerBands(Ay[0], Ay[1], leftOrigin, scale, "cinema-reader-band", value)}</g>${arrow(state.x, leftOrigin, scale, "cyan", "x", 1, 6, -8)}</g><g clip-path="url(#cinema-mobile-bi-right)">${grid(208, 68, 124, 148, 36)}<g opacity="${rightBandOpacity}">${readerBands(Atx[0], Atx[1], rightOrigin, scale, "cinema-reader-band", value)}</g>${arrow(state.y, rightOrigin, scale, "amber", "y", 1, 6, -8)}</g><path class="cinema-flow-line" d="M90 240V270" marker-end="url(#cinema-arrow-cyan)"/><path class="cinema-flow-line is-amber" d="M270 240V270" marker-end="url(#cinema-arrow-amber)"/><g class="cinema-matrix-machine"><rect x="80" y="270" width="200" height="164" rx="22"/><text class="cinema-machine-label" x="180" y="298" text-anchor="middle">配对矩阵 A</text><g transform="translate(112 314) scale(.72)">${matrixGrid(state.A, Math.round(state.mode))}</g></g><circle class="cinema-output-orb ${value < 0 ? "is-negative" : ""}" cx="180" cy="452" r="34"/><text class="cinema-output-label" x="180" y="446" text-anchor="middle">B(x,y)</text><text class="cinema-output-value" x="180" y="469" text-anchor="middle">${fmt(value)}</text><text class="cinema-mobile-note" x="180" y="510" text-anchor="middle" opacity="${swapOpacity}">交错时交换输入，配对值变号</text>`);
  }

  function renderSymplecticMobile(state) {
    const origin = [180, 302];
    const sum = [state.x[0] + state.y[0], state.x[1] + state.y[1]];
    const extent = Math.max(3, Math.abs(state.x[0]), Math.abs(state.x[1]), Math.abs(state.y[0]), Math.abs(state.y[1]), Math.abs(sum[0]), Math.abs(sum[1]));
    const scale = Math.min(45, 135 / extent);
    const value = det2(state.x, state.y);
    const mode = Math.round(state.mode);
    const positive = value >= 0;
    const baseX = [2.4, .6];
    const baseY = [.7, 2.2];
    const ghostOpacity = clamp(state.mode - 1, 0, 1);
    const verdict = mode === 4 ? "不保持辛形式" : mode >= 2 ? "保持辛形式" : positive ? "正向配对" : "交换后变号";
    return frameMobile(`<defs><clipPath id="cinema-mobile-symp"><rect x="18" y="24" width="324" height="410" rx="20"/></clipPath></defs><rect class="cinema-subpanel" x="18" y="24" width="324" height="410" rx="20"/><g clip-path="url(#cinema-mobile-symp)">${grid(36, 52, 288, 354, 45)}<line class="cinema-axis" x1="36" y1="${origin[1]}" x2="324" y2="${origin[1]}"/><line class="cinema-axis" x1="${origin[0]}" y1="52" x2="${origin[0]}" y2="406"/><g opacity="${ghostOpacity}"><polygon class="cinema-area-ghost" points="${polygonPoints(baseX, baseY, origin, scale)}"/>${arrow(baseX, origin, scale, "cyan", "原 x", .26, 4, 18)}${arrow(baseY, origin, scale, "amber", "原 y", .26, 4, 18)}</g><polygon class="cinema-area ${positive ? "is-positive" : "is-negative"}" points="${polygonPoints(state.x, state.y, origin, scale)}"/>${arrow(state.x, origin, scale, "cyan", "x", 1, 5, -8)}${arrow(state.y, origin, scale, "amber", "y", 1, 5, -8)}<path class="cinema-orientation ${positive ? "" : "is-negative"}" d="M${origin[0] + 38} ${origin[1] - 3}A44 44 0 0 ${positive ? 0 : 1} ${origin[0] + 7} ${origin[1] - 40}" marker-end="url(#${positive ? "cinema-arrow-cyan" : "cinema-arrow-amber"})"/></g><g class="cinema-mobile-value"><rect x="238" y="44" width="86" height="72" rx="14"/><text x="281" y="66" text-anchor="middle">ω(x,y)</text><text class="is-number" x="281" y="98" text-anchor="middle">${fmt(value)}</text></g><text class="cinema-verdict ${mode === 4 ? "is-bad" : "is-good"}" x="180" y="470" text-anchor="middle">${verdict}</text><text class="cinema-equation" x="180" y="500" text-anchor="middle">${mode === 4 ? "SᵀJS ≠ J" : mode >= 2 ? "SᵀJS = J" : "ω(y,x)=−ω(x,y)"}</text>`);
  }

  const scenes = {
    "linear-functional": { title: "线性函数：看见“读数层”如何组织整个空间", subtitle: "先不要调十个参数。按四个镜头依次观察：同层、核、符号和倍率。", steps: [
      { label: "01 读取", caption: "向量 x 落在哪一条等值线上，函数就返回那一层的读数。", formula: "f(x)=aᵀx", state: { a: [1, .5], x: [2, 1], mode: 0 } },
      { label: "02 同层移动", caption: "沿着等值线移动，位置改变，但读数保持不变。", formula: "f(x+t v)=f(x)", state: { a: [1, .5], x: [.8, 3.4], mode: 1 } },
      { label: "03 穿过核", caption: "核是零值层。穿过它，读数从正变负。", formula: "ker f = {x : f(x)=0}", state: { a: [1, .5], x: [-1.5, -1.1], mode: 2 } },
      { label: "04 改倍率", caption: "方向不变时，核不动；整体倍率只改变读数刻度与层距。", formula: "(2f)(x)=2f(x)", state: { a: [2, 1], x: [2, 1], mode: 3 } }
    ], render: renderFunctional, renderMobile: renderFunctionalMobile },
    "dual-space": { title: "对偶空间：把“对象”和“测量方法”彻底分开", subtitle: "右侧不是第二个向量平面，而是所有线性读取器组成的空间。", steps: [
      { label: "01 固定 f", caption: "固定一套测量规则，在 V 中移动 x；平行层直接显示哪些向量读数相同。", formula: "V × V* → F", state: { x: [2.2, 1.1], f: [1, -.65], mode: 0 } },
      { label: "02 固定 x", caption: "固定向量后，改变读取器；自然配对对函数槽同样线性。", formula: "(f+g)(x)=f(x)+g(x)", state: { x: [2.2, 1.1], f: [-.35, 1.15], mode: 1 } },
      { label: "03 对偶基", caption: "e¹ 与 e² 不是普通箭头，而是分别读取第一、第二坐标的两台探针。", formula: "eⁱ(eⱼ)=δⁱⱼ", state: { x: [2.2, 1.1], f: [1, 0], mode: 2 } },
      { label: "04 拉回", caption: "向量顺着 T 前进，函数沿 T 反向拉回；这样最终标量保持一致。", formula: "T*(f)=f∘T", state: { x: [1.4, 1.8], f: [.7, -.9], mode: 3 } }
    ], render: renderDual, renderMobile: renderDualMobile },
    "bilinear-form": { title: "双线性函数：一个输入先把另一个输入变成读取器", subtitle: "矩阵不是装饰表格，它记录所有基向量两两配对的结果。", steps: [
      { label: "01 固定 y", caption: "固定 y 后，Ay 产生一套作用在 x 上的线性读数层。", formula: "B(x,y)=xᵀ(Ay)", state: { x: [2, 1], y: [1.1, 2], A: [1, .7, -.4, 1.2], mode: 0 } },
      { label: "02 固定 x", caption: "固定 x 后，Aᵀx 产生作用在 y 上的读取器；两个输入槽地位对称但不必交换对称。", formula: "B(x,y)=(Aᵀx)ᵀy", state: { x: [-1.2, 2], y: [1.1, 2], A: [1, .7, -.4, 1.2], mode: 1 } },
      { label: "03 两条路径", caption: "先算 Ay 或先算 Aᵀx，最后都汇合到同一个标量。", formula: "xᵀAy=(Aᵀx)ᵀy", state: { x: [1.5, 1.4], y: [1.6, -.6], A: [1, .7, -.4, 1.2], mode: 2 } },
      { label: "04 交错预设", caption: "当 Aᵀ=−A 时，交换两个输入会让配对值变号。", formula: "B(y,x)=−B(x,y)", state: { x: [2, 1], y: [1, -2], A: [0, 1, -1, 0], mode: 3 } }
    ], render: renderBilinear, renderMobile: renderBilinearMobile },
    "symplectic-space": { title: "辛空间：连续看清“保持面积配对”究竟保持了什么", subtitle: "比较交换、剪切、互补缩放和均匀缩放；不要只盯着形状像不像。", steps: [
      { label: "01 正向面积", caption: "x 到 y 为逆时针顺序时，有向面积为正。", formula: "ω(x,y)=det[x y]", state: { x: [2.4, .6], y: [.7, 2.2], mode: 0 } },
      { label: "02 交换输入", caption: "平行四边形不变，但方向顺序反转，因此数值变号。", formula: "ω(y,x)=−ω(x,y)", state: { x: [.7, 2.2], y: [2.4, .6], mode: 1 } },
      { label: "03 剪切", caption: "剪切强烈改变外形，却保持有向面积；这是辛变换的典型画面。", formula: "SᵀJS=J", state: { x: [2.94, .6], y: [2.68, 2.2], mode: 2 } },
      { label: "04 互补缩放", caption: "一个方向放大，配对方向按倒数压缩，最终面积仍然不变。", formula: "diag(s,1/s)", state: { x: [3.84, .375], y: [1.12, 1.375], mode: 3 } },
      { label: "05 均匀缩放", caption: "两个方向一起放大，面积随之放大；可逆不等于辛。", formula: "SᵀJS≠J", state: { x: [3.36, .84], y: [.98, 3.08], mode: 4 } }
    ], render: renderSymplectic, renderMobile: renderSymplecticMobile }
  };

  function buildShell(scene) {
    return `<div class="ch10-cinema-head"><div><span>连续几何讲解</span><h3>${scene.title}</h3><p>${scene.subtitle}</p></div><button type="button" class="ch10-cinema-play" data-cinema-play>播放全部</button></div><div class="ch10-cinema-stage" tabindex="0" aria-label="${scene.title}"><svg viewBox="0 0 960 540" role="img" aria-live="polite" data-cinema-svg></svg></div><div class="ch10-cinema-controls" role="tablist">${scene.steps.map((step, index) => `<button type="button" role="tab" data-cinema-step="${index}" aria-selected="${index === 0}">${step.label}</button>`).join("")}</div><div class="ch10-cinema-caption" aria-live="polite"><strong data-cinema-caption></strong><span data-cinema-formula></span></div>`;
  }

  function wrapLegacy(section, root, cinema) {
    const interactiveSection = root.querySelector(`#${section.id}-interactive`);
    if (!interactiveSection) return null;
    interactiveSection.classList.add("has-cinematic");
    const heading = interactiveSection.querySelector(":scope > h2");
    if (heading) heading.textContent = "先看一段连续的几何变化";
    const observation = interactiveSection.querySelector(":scope > .ch10-observation-head");
    const legacy = interactiveSection.querySelector(`[data-ch10-interactive="${section.id}"]`);
    const tasks = interactiveSection.querySelector(":scope > .ch10-task-list");
    interactiveSection.insertBefore(cinema, observation || legacy || tasks || null);
    const details = document.createElement("details");
    details.className = "ch10-cinema-deep";
    details.innerHTML = `<summary><span>深入探索</span><strong>打开完整参数实验、边界状态与验证任务</strong></summary><div class="ch10-cinema-deep-body"></div>`;
    const body = details.querySelector(".ch10-cinema-deep-body");
    [observation, legacy, tasks].forEach((node) => { if (node) body.appendChild(node); });
    interactiveSection.appendChild(details);
    return details;
  }

  function mount(section, root) {
    const scene = scenes[section.id];
    if (!scene) return null;
    const host = document.createElement("div");
    host.className = `ch10-cinema is-${section.id}`;
    host.dataset.ch10Cinema = section.id;
    host.innerHTML = buildShell(scene);
    wrapLegacy(section, root, host);
    const svg = host.querySelector("[data-cinema-svg]");
    const caption = host.querySelector("[data-cinema-caption]");
    const formula = host.querySelector("[data-cinema-formula]");
    const buttons = [...host.querySelectorAll("[data-cinema-step]")];
    const play = host.querySelector("[data-cinema-play]");
    const stage = host.querySelector(".ch10-cinema-stage");
    const controller = new AbortController();
    const signal = controller.signal;
    let activeIndex = 0;
    let current = clone(scene.steps[0].state);
    let frameId = 0;
    let playToken = 0;
    const paint = () => {
      const mobile = window.matchMedia?.("(max-width: 760px)")?.matches;
      svg.setAttribute("viewBox", mobile ? "0 0 360 520" : "0 0 960 540");
      svg.innerHTML = mobile && scene.renderMobile ? scene.renderMobile(current) : scene.render(current);
      caption.textContent = scene.steps[activeIndex].caption;
      formula.textContent = scene.steps[activeIndex].formula;
      buttons.forEach((button, index) => button.setAttribute("aria-selected", String(index === activeIndex)));
    };
    const go = (index, options = {}) => new Promise((resolve) => {
      const nextIndex = clamp(index, 0, scene.steps.length - 1);
      activeIndex = nextIndex;
      const start = clone(current);
      const target = scene.steps[nextIndex].state;
      cancelAnimationFrame(frameId);
      if (reducedMotion() || options.instant) { current = clone(target); paint(); resolve(); return; }
      const started = performance.now();
      const tick = (now) => {
        const progress = clamp((now - started) / 920, 0, 1);
        current = interpolate(start, target, ease(progress));
        paint();
        if (progress < 1) frameId = requestAnimationFrame(tick); else resolve();
      };
      frameId = requestAnimationFrame(tick);
    });
    buttons.forEach((button) => button.addEventListener("click", () => { playToken += 1; go(Number(button.dataset.cinemaStep)); }, { signal }));
    stage.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      playToken += 1;
      go(activeIndex + (event.key === "ArrowRight" ? 1 : -1));
    }, { signal });
    play.addEventListener("click", async () => {
      const token = ++playToken;
      play.disabled = true;
      play.textContent = "播放中";
      for (let index = 0; index < scene.steps.length; index += 1) {
        if (token !== playToken) break;
        await go(index);
        if (token !== playToken) break;
        await new Promise((resolve) => setTimeout(resolve, reducedMotion() ? 120 : 720));
      }
      if (token === playToken) { play.disabled = false; play.textContent = "重新播放"; }
    }, { signal });
    paint();
    return () => { playToken += 1; cancelAnimationFrame(frameId); controller.abort(); };
  }

  window.Chapter10Cinematic = Object.freeze({ mount });
})();
