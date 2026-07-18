(() => {
  const VIEW_W = 960;
  const VIEW_H = 540;
  const NS = "http://www.w3.org/2000/svg";
  let cleanup = [];
  let activeAnimation = 0;

  const inline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : `<code>${source}</code>`);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const rad = (degrees) => (degrees * Math.PI) / 180;
  const deg = (radians) => (radians * 180) / Math.PI;
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
  const norm = (v) => Math.hypot(v[0], v[1]);
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const scale = (k, v) => [k * v[0], k * v[1]];
  const matVec = (m, v) => [m[0] * v[0] + m[1] * v[1], m[2] * v[0] + m[3] * v[1]];
  const matMul = (a, b) => [
    a[0] * b[0] + a[1] * b[2],
    a[0] * b[1] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[2],
    a[2] * b[1] + a[3] * b[3],
  ];
  const transpose = (m) => [m[0], m[2], m[1], m[3]];
  const det = (m) => m[0] * m[3] - m[1] * m[2];
  const fmt = (value, digits = 2) => {
    if (!Number.isFinite(value)) return "—";
    if (Math.abs(value) < 0.5 * 10 ** -digits) return "0";
    return value.toFixed(digits).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
  };

  function on(target, type, handler, options) {
    if (!target) return;
    target.addEventListener(type, handler, options);
    cleanup.push(() => target.removeEventListener(type, handler, options));
  }

  function teardown() {
    activeAnimation += 1;
    cleanup.splice(0).reverse().forEach((dispose) => {
      try { dispose(); } catch (_) { /* route cleanup must not block rendering */ }
    });
  }

  function reducedMotion() {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  }

  function animateState(state, target, keys, draw, duration = 520) {
    const token = ++activeAnimation;
    const start = {};
    keys.forEach((key) => { start[key] = state[key]; });
    if (reducedMotion()) {
      keys.forEach((key) => { state[key] = target[key]; });
      draw();
      return;
    }
    const started = performance.now();
    const frame = (now) => {
      if (token !== activeAnimation) return;
      const t = clamp((now - started) / duration, 0, 1);
      const eased = 1 - (1 - t) ** 3;
      keys.forEach((key) => { state[key] = start[key] + (target[key] - start[key]) * eased; });
      draw();
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  function screenPoint(svg, event) {
    const rect = svg.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * VIEW_W,
      y: ((event.clientY - rect.top) / rect.height) * VIEW_H,
    };
  }

  function worldPoint(v, origin = [250, 390], unit = 82) {
    return [origin[0] + v[0] * unit, origin[1] - v[1] * unit];
  }

  function arrowPath(x1, y1, x2, y2, shaft = 7, headLength = 24, headHalf = 14) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy);
    if (length < 2) return "";
    const ux = dx / length;
    const uy = dy / length;
    const px = -uy;
    const py = ux;
    const half = shaft / 2;
    const head = Math.min(headLength, Math.max(13, length * 0.26));
    const neckX = x2 - ux * head;
    const neckY = y2 - uy * head;
    const f = (n) => Number(n.toFixed(2));
    return [
      `M ${f(x1 + px * half)} ${f(y1 + py * half)}`,
      `L ${f(neckX + px * half)} ${f(neckY + py * half)}`,
      `L ${f(neckX + px * headHalf)} ${f(neckY + py * headHalf)}`,
      `Q ${f(x2 - ux * 3 + px * 1.2)} ${f(y2 - uy * 3 + py * 1.2)} ${f(x2)} ${f(y2)}`,
      `Q ${f(x2 - ux * 3 - px * 1.2)} ${f(y2 - uy * 3 - py * 1.2)} ${f(neckX - px * headHalf)} ${f(neckY - py * headHalf)}`,
      `L ${f(neckX - px * half)} ${f(neckY - py * half)}`,
      `L ${f(x1 - px * half)} ${f(y1 - py * half)}`,
      `Q ${f(x1 - ux * 3)} ${f(y1 - uy * 3)} ${f(x1 + px * half)} ${f(y1 + py * half)}`,
      "Z",
    ].join(" ");
  }

  function arrow(x1, y1, x2, y2, color, label = "", options = {}) {
    const path = arrowPath(x1, y1, x2, y2, options.shaft || 7, options.headLength || 24, options.headHalf || 14);
    const labelX = x2 + (options.labelDx ?? 12);
    const labelY = y2 + (options.labelDy ?? -12);
    return `${path ? `<path d="${path}" fill="${color}" opacity="${options.opacity ?? 1}"></path>` : ""}${
      label ? `<text class="ch9cin-svg-text ${options.labelClass || ""}" x="${labelX}" y="${labelY}">${label}</text>` : ""
    }`;
  }

  function gridMarkup(width = VIEW_W, height = VIEW_H, step = 56) {
    const lines = [];
    for (let x = 0; x <= width; x += step) lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${height}"></line>`);
    for (let y = 0; y <= height; y += step) lines.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}"></line>`);
    return `<g class="ch9cin-grid">${lines.join("")}</g>`;
  }

  function polyline(points, className, attrs = "") {
    return `<polyline class="${className}" points="${points.map((p) => `${p[0]},${p[1]}`).join(" ")}" ${attrs}></polyline>`;
  }

  function polygon(points, className, attrs = "") {
    return `<polygon class="${className}" points="${points.map((p) => `${p[0]},${p[1]}`).join(" ")}" ${attrs}></polygon>`;
  }

  function arcPath(cx, cy, radius, startAngle, endAngle) {
    const start = [cx + radius * Math.cos(startAngle), cy - radius * Math.sin(startAngle)];
    const end = [cx + radius * Math.cos(endAngle), cy - radius * Math.sin(endAngle)];
    const sweep = endAngle - startAngle;
    const large = Math.abs(sweep) > Math.PI ? 1 : 0;
    const sweepFlag = sweep >= 0 ? 0 : 1;
    return `M ${start[0]} ${start[1]} A ${radius} ${radius} 0 ${large} ${sweepFlag} ${end[0]} ${end[1]}`;
  }

  function setPressed(buttons, predicate) {
    buttons.forEach((button) => {
      const active = predicate(button);
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function setMetric(root, name, value) {
    root.querySelectorAll(`[data-v2-metric="${name}"], [data-cin-output="${name}"]`).forEach((node) => { node.textContent = value; });
  }

  function setPath(root, step) {
    root.querySelectorAll("[data-v2-path-step]").forEach((item, index) => item.classList.toggle("is-active", index <= step));
  }

  function range(name, label, min, max, step, value, suffix = "") {
    return `<label class="ch9cin-range"><span>${label}</span><output data-cin-output="${name}">${value}${suffix}</output><input data-cin-range="${name}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
  }

  function metric(label, name, value = "—") {
    return `<div class="ch9v2-metric ch9cin-metric"><span>${label}</span><strong data-v2-metric="${name}">${value}</strong></div>`;
  }

  function labShell({ kicker, title, intro, steps, stageTitle, stageKicker, badge = "", svgLabel, controls, metrics, observation, formula = "" }) {
    return `<div class="ch9cin-lab" data-ch9-v2-lab>
      <header class="ch9cin-lab-head">
        <div><span>${kicker}</span><h2>${title}</h2><p>${intro}</p></div>
        <ol class="ch9v2-lab-path ch9cin-path" aria-label="实验路径">${steps.map((step, index) => `<li${index === 0 ? ' class="is-active"' : ""} data-v2-path-step="${index}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${step}</strong></li>`).join("")}</ol>
      </header>
      <div class="ch9v2-workbench ch9cin-workbench">
        <figure class="ch9v2-stage-card ch9cin-stage-card">
          <div class="ch9cin-stage-top"><div class="ch9cin-stage-title"><span data-cin-stage-kicker>${stageKicker}</span><strong data-cin-stage-title>${stageTitle}</strong></div><div class="ch9cin-badge" data-cin-badge>${badge}</div></div>
          <div class="ch9cin-svg-wrap"><div class="ch9cin-formula-dock" data-cin-formula>${formula}</div><svg data-cin-svg viewBox="0 0 ${VIEW_W} ${VIEW_H}" role="img" aria-label="${svgLabel}" tabindex="0"></svg></div>
          <figcaption class="ch9cin-caption" data-cin-caption></figcaption>
          <div class="ch9cin-controls">
            <div class="ch9cin-control-main">${controls}</div>
            <aside class="ch9cin-certificate"><strong>实时证书</strong><div class="ch9cin-metrics">${metrics}</div><div class="ch9cin-observation" data-cin-observation>${observation}</div></aside>
          </div>
        </figure>
      </div>
    </div>`;
  }

  function miniScene(type) {
    const cyan = "var(--ch9-cyan)";
    const orange = "var(--ch9-orange)";
    const violet = "var(--ch9-violet)";
    const o = [90, 118];
    if (type === "inner") {
      return `<div class="ch9cin-mini-scene"><svg viewBox="0 0 420 154">${arrow(o[0], o[1], 245, 118, cyan, "x", { shaft: 6 })}${arrow(o[0], o[1], 196, 36, orange, "y", { shaft: 6 })}<path d="${arcPath(o[0], o[1], 42, 0, rad(38))}" class="cyan" stroke-width="3"></path><line x1="196" y1="36" x2="196" y2="118" class="orange" stroke-width="2" stroke-dasharray="6 6"></line><text x="272" y="82" class="muted">夹角、投影、内积</text></svg></div>`;
    }
    if (type === "gram") {
      return `<div class="ch9cin-mini-scene"><svg viewBox="0 0 420 154">${arrow(o[0], o[1], 255, 90, cyan, "v₁", { shaft: 6 })}${arrow(o[0], o[1], 220, 32, orange, "v₂", { shaft: 6 })}<line x1="220" y1="32" x2="206" y2="98" class="orange" stroke-width="2" stroke-dasharray="6 6"></line>${arrow(206, 98, 220, 32, violet, "u₂", { shaft: 5 })}<text x="284" y="78" class="muted">减去平行部分</text></svg></div>`;
    }
    if (type === "iso") {
      return `<div class="ch9cin-mini-scene"><svg viewBox="0 0 420 154"><circle cx="104" cy="80" r="48" class="cyan" stroke-width="3"></circle><circle cx="315" cy="80" r="48" class="cyan" stroke-width="3"></circle>${arrow(104, 80, 142, 48, orange, "x", { shaft: 5 })}${arrow(315, 80, 345, 41, violet, "Φ(x)", { shaft: 5 })}<path d="M174 80H246" class="cyan" stroke-width="3"></path><text x="196" y="66" class="muted">保持内积</text></svg></div>`;
    }
    if (type === "ortho") {
      return `<div class="ch9cin-mini-scene"><svg viewBox="0 0 420 154"><circle cx="100" cy="78" r="50" class="cyan" stroke-width="3"></circle><path d="M175 78H240" class="cyan" stroke-width="3"></path><ellipse cx="320" cy="78" rx="50" ry="50" class="cyan" stroke-width="3"></ellipse>${arrow(320, 78, 355, 45, orange, "Qe₂", { shaft: 5 })}<text x="173" y="62" class="muted">圆仍是圆</text></svg></div>`;
    }
    if (type === "projection") {
      return `<div class="ch9cin-mini-scene"><svg viewBox="0 0 420 154"><line x1="54" y1="122" x2="364" y2="47" class="cyan" stroke-width="3"></line>${arrow(86, 114, 278, 38, orange, "x", { shaft: 6 })}${arrow(86, 114, 246, 75, cyan, "p", { shaft: 6 })}${arrow(246, 75, 278, 38, violet, "e", { shaft: 5 })}<rect x="242" y="69" width="12" height="12" fill="none" stroke="var(--ch9-violet)" stroke-width="2" transform="rotate(-14 248 75)"></rect></svg></div>`;
    }
    if (type === "spectral") {
      return `<div class="ch9cin-mini-scene"><svg viewBox="0 0 420 154"><text x="36" y="87" class="muted">x</text><rect x="76" y="48" width="72" height="72" rx="12" fill="rgba(100,220,231,.12)" stroke="var(--ch9-cyan)"></rect><text x="98" y="90">Qᵀ</text><path d="M151 84H185" class="cyan"></path><rect x="188" y="48" width="72" height="72" rx="12" fill="rgba(255,173,93,.12)" stroke="var(--ch9-orange)"></rect><text x="215" y="90">Λ</text><path d="M263 84H297" class="cyan"></path><rect x="300" y="48" width="72" height="72" rx="12" fill="rgba(170,140,255,.12)" stroke="var(--ch9-violet)"></rect><text x="328" y="90">Q</text></svg></div>`;
    }
    if (type === "least") {
      return `<div class="ch9cin-mini-scene"><svg viewBox="0 0 420 154"><line x1="42" y1="126" x2="378" y2="30" class="cyan" stroke-width="3"></line>${[[76,112],[132,91],[194,84],[258,55],[334,49]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="5" fill="var(--ch9-white)"></circle><line x1="${x}" y1="${y}" x2="${x}" y2="${134 - x * 0.27}" class="orange" stroke-width="3"></line>`).join("")}<text x="250" y="132" class="muted">残差垂直于列空间</text></svg></div>`;
    }
    return `<div class="ch9cin-mini-scene"><svg viewBox="0 0 420 154"><line x1="48" y1="78" x2="370" y2="78" class="ch9cin-axis"></line><line x1="208" y1="20" x2="208" y2="136" class="ch9cin-axis"></line>${arrow(208, 78, 305, 34, cyan, "z", { shaft: 6 })}${arrow(208, 78, 305, 122, orange, "z̄", { shaft: 6 })}<path d="${arcPath(208, 78, 72, rad(24), rad(74))}" class="violet" stroke-width="3"></path><text x="286" y="82" class="muted">纯相位旋转</text></svg></div>`;
  }

  const FOUNDATIONS = {
    "inner-product-geometry": {
      kicker: "从线性结构长出几何",
      title: "内积不是一个孤立公式，而是一整套测量的共同源头",
      intro: `先把 ${inline("\\langle x,y\\rangle")} 看成“长度乘有向投影”，再由它得到夹角、正交与距离。`,
      modules: [
        ["内积先决定影子的正负", "锐角时影子与 x 同向，钝角时反向，正交时影子恰好为 0。", miniScene("inner")],
        ["长度来自向量和自身的内积", "正定性保证非零向量的长度严格为正。", `<div class="ch9cin-proof">${display("\\lVert x\\rVert=\\sqrt{\\langle x,x\\rangle}")}</div>`],
        ["夹角公式由 Cauchy–Schwarz 保证", "内积不会超过两长度之积，所以余弦值始终落在合法区间。", `<div class="ch9cin-proof">${display("|\\langle x,y\\rangle|\\le\\lVert x\\rVert\\,\\lVert y\\rVert")}</div>`],
        ["零向量是必须单独处理的边界", "它与所有向量内积都为 0，但因为长度为 0，夹角公式没有定义。", `<div class="ch9cin-proof">${display("\\langle 0,y\\rangle=0,\\qquad \\angle(0,y)\\ \text{不定义}")}</div>`],
      ],
    },
    "orthonormal-bases": {
      kicker: "把斜坐标整理成直角坐标",
      title: "Gram–Schmidt 的核心只有一句：减掉已经解释过的方向",
      intro: "每一步都保留原张成空间，同时把新方向里与旧方向重合的部分移除。",
      modules: [
        ["正交与标准正交不是一回事", "两两垂直只解决方向冲突；单位化还要把长度统一为 1。", miniScene("gram")],
        ["投影给出需要减掉的部分", "第二向量在第一方向上的分量由一个内积系数决定。", `<div class="ch9cin-proof">${display("\\operatorname{proj}_{e_1}v_2=\\langle v_2,e_1\\rangle e_1")}</div>`],
        ["余量才是真正的新方向", "若余量为 0，输入向量线性相关，算法在这里明确停下。", `<div class="ch9cin-proof">${display("u_2=v_2-\\operatorname{proj}_{e_1}v_2")}</div>`],
        ["标准正交坐标直接由投影读出", "不再联立解方程，坐标就是沿各基方向的内积。", `<div class="ch9cin-proof">${display("x=\\sum_i\\langle x,e_i\\rangle e_i")}</div>`],
      ],
    },
    "euclidean-isomorphism": {
      kicker: "同维不代表同样的几何",
      title: "欧氏同构不仅能还原向量，还要把长度与夹角原样带过去",
      intro: "可逆剪切是线性同构，却不是等距同构；标准正交坐标才提供真正的几何桥梁。",
      modules: [
        ["线性同构只保证运算结构", "它保持加法、数乘与线性关系，但可以拉伸和剪切。", miniScene("iso")],
        ["欧氏同构再要求保持内积", "一条内积恒等式会自动保护长度、距离、角度和正交。", `<div class="ch9cin-proof">${display("\\langle Tx,Ty\\rangle=\\langle x,y\\rangle")}</div>`],
        ["标准正交基给出等距坐标", "Parseval 等式说明坐标列的普通长度就是原向量长度。", `<div class="ch9cin-proof">${display("\\lVert x\\rVert^2=\\sum_i|\\langle x,e_i\\rangle|^2")}</div>`],
        ["斜基坐标依然合法，但不再等距", "坐标向量可以唯一确定 x，却不能直接当作 x 的几何替身。", `<div class="ch9cin-proof">${display("x=Bc,\\qquad \\lVert c\\rVert\\ \text{通常不等于}\\ \\lVert x\\rVert")}</div>`],
      ],
    },
    "orthogonal-transformations": {
      kicker: "允许移动，不允许变形",
      title: "正交变换把整个空间搬走，却不改变任何欧氏测量",
      intro: "单位圆、矩阵两列和 QᵀQ 是同一事实的三种证据。",
      modules: [
        ["单位圆是整体长度检测器", "若所有单位向量长度保持，单位圆的像仍然只能是单位圆。", miniScene("ortho")],
        ["矩阵两列必须构成标准正交组", "Qe₁ 与 Qe₂ 的长度都是 1，而且彼此垂直。", `<div class="ch9cin-proof">${display("\\langle q_i,q_j\\rangle=\\delta_{ij}")}</div>`],
        ["QᵀQ=I 压缩了无穷多次检验", "它等价于对所有 x、y 保持内积。", `<div class="ch9cin-proof">${display("\\langle Qx,Qy\\rangle=x^TQ^TQy=x^Ty")}</div>`],
        ["行列式只负责定向", "det Q=1 是旋转；det Q=-1 是镜像与旋转的组合。", `<div class="ch9cin-proof">${display("Q^{-1}=Q^T,\\qquad \\det Q=\\pm1")}</div>`],
      ],
    },
    "orthogonal-subspaces": {
      kicker: "最近点来自正交分解",
      title: "投影把一个向量唯一拆成子空间内分量和垂直余量",
      intro: "垂足不是凭眼睛猜出来的；它由残差正交这一条条件唯一确定。",
      modules: [
        ["正交补收集所有垂直方向", "它要求与整个子空间中的每个向量都正交。", miniScene("projection")],
        ["分解具有唯一性", "一个分量在 W 内，另一个分量在 W⊥ 内。", `<div class="ch9cin-proof">${display("x=P_Wx+(x-P_Wx)")}</div>`],
        ["标准正交基让投影直接相加", "每个基方向取一次投影系数即可。", `<div class="ch9cin-proof">${display("P_Wx=\\sum_i\\langle x,e_i\\rangle e_i")}</div>`],
        ["垂足一定是唯一最近点", "任何其他候选点都会多出一段位于 W 内的距离。", `<div class="ch9cin-proof">${display("\\lVert x-w\\rVert^2=\\lVert x-p\\rVert^2+\\lVert p-w\\rVert^2")}</div>`],
      ],
    },
    "symmetric-canonical-form": {
      kicker: "对称性强迫方向彼此正交",
      title: "实对称矩阵不是普通对角化，而是可以用正交坐标彻底解耦",
      intro: "A=QΛQᵀ 应该被读成三次连续动作，而不是背成一串符号。",
      modules: [
        ["不同特征值对应正交方向", "Aᵀ=A 让内积可以在 A 的两侧自由移动。", miniScene("spectral")],
        ["Q 把标准坐标轴对准特征方向", "Q 的列是一组标准正交特征向量。", `<div class="ch9cin-proof">${display("Q^TAQ=\\Lambda")}</div>`],
        ["Λ 只做彼此独立的伸缩", "在特征坐标中，每个方向不再与其他方向混合。", `<div class="ch9cin-proof">${display("A=Q\\Lambda Q^T")}</div>`],
        ["重特征值不是失败，非对称才是闸门", "重特征空间内部仍可选择标准正交基；非对称矩阵不能直接套用实谱定理。", `<div class="ch9cin-proof">${display("A^T=A\\ \Longrightarrow\\ \text{存在正交特征基}")}</div>`],
      ],
    },
    "least-squares-distance": {
      kicker: "没有精确解，也能找最佳近似",
      title: "最小二乘就是把 b 正交投影到 A 的列空间",
      intro: "残差棒、SSE 和正规方程是同一个几何事实的三种表达。",
      modules: [
        ["所有 Ax 组成列空间", "方程无解意味着 b 不在这个子空间中。", miniScene("least")],
        ["最佳预测是列空间中的垂足", "残差必须垂直于每一列。", `<div class="ch9cin-proof">${display("r=b-A\\hat x\\perp\\operatorname{Col}(A)")}</div>`],
        ["正规方程来自正交条件", "Aᵀr=0 不是计算技巧，而是残差垂直的坐标表达。", `<div class="ch9cin-proof">${display("A^TA\\hat x=A^Tb")}</div>`],
        ["回归直线是一个具体实例", "常数列和 x 坐标列分别给出两条残差正交条件。", `<div class="ch9cin-proof">${display("\\sum r_i=0,\\qquad\\sum x_ir_i=0")}</div>`],
      ],
    },
    "unitary-spaces": {
      kicker: "把转置升级为共轭转置",
      title: "复数域中的长度需要共轭，保持长度的变换叫酉变换",
      intro: "共轭消掉相位，使 z̄z 成为非负实数；纯相位旋转只改变方向，不改变模长。",
      modules: [
        ["共轭把虚部翻到实轴另一侧", "z 与 z̄ 的相位相反，乘积只留下模长平方。", miniScene("unitary")],
        ["复内积必须使用共轭", "普通转置会让 i 的“长度平方”变成 -1。", `<div class="ch9cin-proof">${display("\\langle z,w\\rangle=z^*w")}</div>`],
        ["酉变换保持复内积", "U*U=I 是复数版本的 QᵀQ=I。", `<div class="ch9cin-proof">${display("\\langle Ux,Uy\\rangle=x^*U^*Uy=x^*y")}</div>`],
        ["Hermitian 对应实对称矩阵", "本节只建立入口：实数情形下共轭转置退化为普通转置。", `<div class="ch9cin-proof">${display("A^*=A,\\qquad U^{-1}=U^*")}</div>`],
      ],
    },
  };

  function renderFoundation(sectionId, root) {
    const data = FOUNDATIONS[sectionId];
    root.classList.add("ch9cin-formal");
    root.innerHTML = `<div class="ch9v2-foundation-intro"><span>${data.kicker}</span><h2>${data.title}</h2><p>${data.intro}</p></div><div class="ch9v2-foundation">${data.modules.map((module, index) => `<section class="ch9v2-module"><span class="ch9cin-index">${String(index + 1).padStart(2, "0")}</span><div class="ch9cin-copy"><h3>${module[0]}</h3><p>${module[1]}</p></div>${module[2]}</section>`).join("")}</div>`;
  }

  function bindExamples(root = document) {
    root.querySelectorAll("[data-ch9-example]").forEach((example) => {
      if (example.dataset.cinematicBound === "true") return;
      example.dataset.cinematicBound = "true";
      const inputs = [...example.querySelectorAll('input[type="radio"]')];
      const check = example.querySelector("[data-ch9-example-check]");
      const feedback = example.querySelector("[data-ch9-example-feedback]");
      const explanation = example.querySelector("[data-ch9-example-explanation]");
      inputs.forEach((input) => on(input, "change", () => {
        check.disabled = false;
        explanation.hidden = true;
        feedback.className = "example-feedback";
        feedback.textContent = "已经选择，可以检查。";
        example.querySelectorAll(".example-choice").forEach((choice) => choice.classList.remove("is-correct", "is-wrong"));
      }));
      on(check, "click", () => {
        const selected = inputs.find((input) => input.checked);
        if (!selected) return;
        example.querySelectorAll(".example-choice").forEach((choice) => choice.classList.remove("is-correct", "is-wrong"));
        const choice = selected.closest(".example-choice");
        if (selected.dataset.correct === "true") {
          choice.classList.add("is-correct");
          feedback.className = "example-feedback is-success";
          feedback.textContent = "判断正确。现在展开完整推理。";
          explanation.hidden = false;
        } else {
          choice.classList.add("is-wrong");
          feedback.className = "example-feedback is-error";
          feedback.textContent = "这个判断还没有通过定义与边界检查，可以重新选择。";
          explanation.hidden = true;
        }
      });
    });
  }

  function bindRange(root, name, handler) {
    const input = root.querySelector(`[data-cin-range="${name}"]`);
    on(input, "input", () => handler(Number(input.value)));
    return input;
  }

  function renderInner(root) {
    root.innerHTML = labShell({
      kicker: "交互实验 · 内积的几何含义",
      title: "把 y 的影子投到 x 上，内积的正负立刻可见",
      intro: "先看夹角，再落下垂线，最后把 x 的长度乘上有向投影。拖动橙色向量时，公式与几何同步变化。",
      steps: ["看夹角", "落下投影", "读取内积"],
      stageKicker: "第一步 · 方向关系",
      stageTitle: "锐角、直角和钝角对应内积的正、零、负",
      svgLabel: "两个向量的夹角、有向投影与内积",
      controls: `<div class="ch9cin-stage-tabs">${[0,1,2].map((n) => `<button type="button" data-ip-step="${n}"${n===0?' class="is-active"':''}>${["01 夹角","02 投影","03 内积"][n]}</button>`).join("")}</div><div class="ch9cin-control-row"><button type="button" data-ip-preset="acute">锐角</button><button type="button" data-ip-preset="orthogonal">正交</button><button type="button" data-ip-preset="obtuse">钝角</button><button type="button" data-ip-preset="parallel">线性相关</button><button type="button" data-ip-preset="zero">零向量</button></div><div class="ch9cin-range-grid">${range("angle","y 的方向",-170,170,1,48,"°")}${range("yLength","y 的长度",0,3.8,0.05,2.65)}${range("xLength","x 的长度",0.8,3.8,0.05,3.1)}</div>`,
      metrics: `${metric("夹角 θ","theta")}${metric("有向投影","shadow")}${metric("内积","dot")}${metric("C–S 等号比","ratio")}`,
      observation: `<strong>先拖动 y</strong><p>观察影子在原点右侧、原点和左侧之间移动。</p>`,
    });
    const svg = root.querySelector("[data-cin-svg]");
    const state = { step: 0, angle: 48, yLength: 2.65, xLength: 3.1 };
    let dragging = false;
    const presets = { acute: [48, 2.65], orthogonal: [90, 2.65], obtuse: [132, 2.65], parallel: [0, 2.8], zero: [48, 0] };
    const stepButtons = [...root.querySelectorAll("[data-ip-step]")];

    function draw() {
      const origin = [230, 395];
      const unit = 88;
      const x = [state.xLength, 0];
      const y = [state.yLength * Math.cos(rad(state.angle)), state.yLength * Math.sin(rad(state.angle))];
      const xEnd = worldPoint(x, origin, unit);
      const yEnd = worldPoint(y, origin, unit);
      const shadow = state.yLength * Math.cos(rad(state.angle));
      const shadowEnd = worldPoint([shadow, 0], origin, unit);
      const product = state.xLength * shadow;
      const angleValue = state.yLength < 1e-8 ? NaN : Math.abs(state.angle);
      const ratio = state.yLength < 1e-8 ? NaN : Math.abs(product) / (state.xLength * state.yLength);
      const showProjection = state.step >= 1 && state.yLength > 1e-8;
      const showProduct = state.step >= 2;
      const right = shadow >= 0 ? 1 : -1;
      const arcEnd = rad(clamp(state.angle, -170, 170));
      svg.innerHTML = `${gridMarkup()}<line class="ch9cin-axis" x1="70" y1="${origin[1]}" x2="900" y2="${origin[1]}"></line><line class="ch9cin-axis" x1="${origin[0]}" y1="500" x2="${origin[0]}" y2="80"></line><path d="${arcPath(origin[0], origin[1], 62, 0, arcEnd)}" class="ch9cin-stroke-cyan" stroke-width="4"></path><text x="${origin[0]+70}" y="${origin[1]-26}" class="ch9cin-svg-text is-cyan">θ</text>${arrow(origin[0],origin[1],xEnd[0],xEnd[1],"var(--ch9-cyan)","x",{shaft:9,headHalf:17,labelClass:"is-cyan"})}${arrow(origin[0],origin[1],yEnd[0],yEnd[1],"var(--ch9-orange)","y",{shaft:9,headHalf:17,labelClass:"is-orange"})}${showProjection ? `<line x1="${yEnd[0]}" y1="${yEnd[1]}" x2="${shadowEnd[0]}" y2="${shadowEnd[1]}" class="ch9cin-guide"></line>${arrow(origin[0],origin[1],shadowEnd[0],shadowEnd[1],"var(--ch9-violet)","有向影子",{shaft:7,headHalf:14,labelDy:28,labelClass:"is-violet"})}<path d="M ${shadowEnd[0]} ${shadowEnd[1]} v -18 h ${right*18}" fill="none" stroke="var(--ch9-orange)" stroke-width="3"></path>` : ""}${showProduct ? `<rect x="620" y="330" width="270" height="96" rx="18" fill="rgba(100,220,231,.08)" stroke="rgba(100,220,231,.35)"></rect><text x="650" y="365" class="ch9cin-svg-text is-muted">长度 × 有向影子</text><text x="650" y="402" class="ch9cin-svg-text is-cyan">${fmt(state.xLength,2)} × ${fmt(shadow,2)} = ${fmt(product,2)}</text>` : ""}<circle class="ch9cin-draggable" data-ip-handle cx="${yEnd[0]}" cy="${yEnd[1]}" r="18" fill="transparent" stroke="rgba(255,173,93,.35)" stroke-width="2"></circle>`;
      setMetric(root, "theta", Number.isFinite(angleValue) ? `${fmt(angleValue,0)}°` : "未定义");
      setMetric(root, "shadow", fmt(shadow, 3));
      setMetric(root, "dot", fmt(product, 3));
      setMetric(root, "ratio", Number.isFinite(ratio) ? fmt(ratio, 3) : "未定义");
      setMetric(root, "angle", `${fmt(state.angle,0)}°`);
      setMetric(root, "yLength", fmt(state.yLength,2));
      setMetric(root, "xLength", fmt(state.xLength,2));
      const angleInput = root.querySelector('[data-cin-range="angle"]'); if (angleInput) angleInput.value = state.angle;
      const yInput = root.querySelector('[data-cin-range="yLength"]'); if (yInput) yInput.value = state.yLength;
      const xInput = root.querySelector('[data-cin-range="xLength"]'); if (xInput) xInput.value = state.xLength;
      setPressed(stepButtons, (button) => Number(button.dataset.ipStep) === state.step);
      setPath(root, state.step);
      const formula = root.querySelector("[data-cin-formula]");
      formula.innerHTML = state.step === 0 ? `<span>先只判断方向关系</span>${display("\\cos\\theta\\gtrless0")}` : state.step === 1 ? `<span>有向投影决定正负</span>${display(`\\operatorname{comp}_x(y)=\\lVert y\\rVert\\cos\\theta=${fmt(shadow,2)}`)}` : `<span>内积就是长度乘影子</span>${display(`\\langle x,y\\rangle=\\lVert x\\rVert\\operatorname{comp}_x(y)=${fmt(product,2)}`)}`;
      root.querySelector("[data-cin-stage-kicker]").textContent = ["第一步 · 方向关系","第二步 · 有向投影","第三步 · 内积"][state.step];
      root.querySelector("[data-cin-stage-title]").textContent = ["锐角、直角和钝角对应内积的正、零、负","垂线落下后，影子可能指向 x 的正向或反向","公式里的每个量都已经在图上出现"][state.step];
      root.querySelector("[data-cin-caption]").textContent = state.yLength < 1e-8 ? "零向量与所有向量内积为 0，但夹角没有定义。" : showProjection ? "橙色虚线连接 y 与它在 x 轴上的垂足；紫色箭头就是有向投影。" : "拖动橙色箭头端点，让夹角穿过 90°。";
      const observation = root.querySelector("[data-cin-observation]");
      observation.classList.toggle("is-warning", state.yLength < 1e-8);
      observation.setAttribute("data-ip-observation", "");
      if (state.yLength < 1e-8) observation.innerHTML = `<strong>零向量边界</strong><p>内积为 0，夹角未定义；这里不能把“内积为 0”机械解释成直角。</p>`;
      else if (Math.abs(Math.cos(rad(state.angle))) < 0.01) observation.innerHTML = `<strong>正交状态</strong><p>有向投影为 0，所以内积恰好为 0；垂线与 x 形成直角。</p>`;
      else if (product > 0) observation.innerHTML = `<strong>内积为正</strong><p>y 的影子与 x 同向，两个向量形成锐角。</p>`;
      else observation.innerHTML = `<strong>内积为负</strong><p>y 的影子落到原点左侧，两个向量形成钝角。</p>`;
    }

    stepButtons.forEach((button) => on(button, "click", () => { state.step = Number(button.dataset.ipStep); draw(); }));
    root.querySelectorAll("[data-ip-preset]").forEach((button) => on(button, "click", () => {
      const [angle, yLength] = presets[button.dataset.ipPreset];
      animateState(state, { angle, yLength }, ["angle","yLength"], draw);
    }));
    bindRange(root, "angle", (value) => { state.angle = value; draw(); });
    bindRange(root, "yLength", (value) => { state.yLength = value; draw(); });
    bindRange(root, "xLength", (value) => { state.xLength = value; draw(); });
    on(svg, "pointerdown", (event) => { if (event.target.closest("[data-ip-handle]")) { dragging = true; svg.setPointerCapture(event.pointerId); } });
    on(svg, "pointermove", (event) => {
      if (!dragging) return;
      const p = screenPoint(svg, event);
      const dx = (p.x - 230) / 88;
      const dy = (395 - p.y) / 88;
      state.yLength = clamp(Math.hypot(dx, dy), 0, 3.8);
      state.angle = clamp(deg(Math.atan2(dy, dx)), -170, 170);
      draw();
    });
    on(svg, "pointerup", () => { dragging = false; });
    draw();
  }

  function renderGram(root) {
    root.innerHTML = labShell({
      kicker: "交互实验 · Gram–Schmidt",
      title: "第二个向量先投影，再把平行部分真正减掉",
      intro: "动画不直接跳到答案。每一步只增加一个几何对象，让投影、余量和单位化连续出现。",
      steps: ["保留 v₁","投影 v₂","减去投影","单位化"],
      stageKicker: "第一步 · 确定旧方向",
      stageTitle: "v₁ 决定第一条基方向",
      svgLabel: "Gram-Schmidt 正交化的连续几何过程",
      controls: `<div class="ch9cin-stage-tabs">${[0,1,2,3].map((n) => `<button type="button" data-gs-step="${n}"${n===0?' class="is-active"':''}>${["01 v₁","02 投影","03 余量","04 e₂"][n]}</button>`).join("")}</div><div class="ch9cin-control-row"><button type="button" data-gs-preset="general">一般位置</button><button type="button" data-gs-preset="near">接近相关</button><button type="button" data-gs-preset="dependent">线性相关</button><button type="button" data-gs-swap>交换顺序</button></div><div class="ch9cin-range-grid">${range("v2x","v₂ 横坐标",-3.5,3.5,0.05,2.1)}${range("v2y","v₂ 纵坐标",-3.5,3.5,0.05,2.7)}</div>`,
      metrics: `${metric("投影系数","coefficient")}${metric("余量长度","residual")}${metric("⟨e₁,e₂⟩","orthogonality")}${metric("张成面积","area")}`,
      observation: `<strong>先看第一方向</strong><p>后续只会减去已经由 e₁ 解释的部分。</p>`,
    });
    const svg = root.querySelector("[data-cin-svg]");
    const state = { step: 0, v1x: 3.0, v1y: 0.7, v2x: 2.1, v2y: 2.7 };
    const stepButtons = [...root.querySelectorAll("[data-gs-step]")];
    const presets = { general: [2.1,2.7], near: [3.1,0.92], dependent: [3.3,0.77] };

    function data() {
      const v1 = [state.v1x, state.v1y];
      const v2 = [state.v2x, state.v2y];
      const e1 = scale(1 / norm(v1), v1);
      const coefficient = dot(v2, e1);
      const projection = scale(coefficient, e1);
      const u2 = sub(v2, projection);
      const residual = norm(u2);
      const e2 = residual > 1e-7 ? scale(1 / residual, u2) : null;
      return { v1,v2,e1,coefficient,projection,u2,residual,e2 };
    }

    function draw() {
      const g = data();
      const origin = [230,390]; const unit = 86;
      const v1 = worldPoint(g.v1, origin, unit);
      const v2 = worldPoint(g.v2, origin, unit);
      const proj = worldPoint(g.projection, origin, unit);
      const u2Origin = worldPoint(g.u2, origin, unit);
      const e1 = worldPoint(g.e1, origin, unit);
      const e2 = g.e2 ? worldPoint(g.e2, origin, unit) : origin;
      let extra = "";
      if (state.step >= 1) extra += `<line x1="${v2[0]}" y1="${v2[1]}" x2="${proj[0]}" y2="${proj[1]}" class="ch9cin-guide"></line>${arrow(origin[0],origin[1],proj[0],proj[1],"rgba(220,231,240,.65)","投影",{shaft:6,headHalf:12,labelClass:"is-muted",labelDy:26})}`;
      if (state.step >= 2) extra += `${arrow(proj[0],proj[1],v2[0],v2[1],"var(--ch9-violet)","u₂",{shaft:8,headHalf:15,labelClass:"is-violet"})}${arrow(origin[0],origin[1],u2Origin[0],u2Origin[1],"rgba(170,140,255,.5)","平移到原点",{shaft:5,headHalf:10,labelClass:"is-muted",labelDy:24})}`;
      if (state.step >= 3 && g.e2) extra += `${arrow(origin[0],origin[1],e1[0],e1[1],"var(--ch9-cyan)","e₁",{shaft:10,headHalf:17,labelClass:"is-cyan",labelDy:28})}${arrow(origin[0],origin[1],e2[0],e2[1],"var(--ch9-violet)","e₂",{shaft:10,headHalf:17,labelClass:"is-violet"})}<path d="M ${e1[0]} ${e1[1]} l ${g.e2[0]*18} ${-g.e2[1]*18} l ${-g.e1[0]*18} ${g.e1[1]*18}" fill="none" stroke="var(--ch9-orange)" stroke-width="3"></path>`;
      svg.innerHTML = `${gridMarkup()}<line class="ch9cin-axis" x1="60" y1="${origin[1]}" x2="900" y2="${origin[1]}"></line><line class="ch9cin-axis" x1="${origin[0]}" y1="500" x2="${origin[0]}" y2="65"></line>${arrow(origin[0],origin[1],v1[0],v1[1],"var(--ch9-cyan)","v₁",{shaft:9,headHalf:17,labelClass:"is-cyan",opacity:state.step===3?.35:1})}${arrow(origin[0],origin[1],v2[0],v2[1],"var(--ch9-orange)","v₂",{shaft:9,headHalf:17,labelClass:"is-orange",opacity:state.step>=2?.42:1})}${extra}`;
      setMetric(root,"coefficient",fmt(g.coefficient,3));
      setMetric(root,"residual",fmt(g.residual,3));
      setMetric(root,"orthogonality",g.e2?fmt(dot(g.e1,g.e2),5):"—");
      setMetric(root,"area",fmt(Math.abs(g.v1[0]*g.v2[1]-g.v1[1]*g.v2[0]),3));
      setMetric(root,"v2x",fmt(state.v2x,2)); setMetric(root,"v2y",fmt(state.v2y,2));
      root.querySelector('[data-cin-range="v2x"]').value=state.v2x; root.querySelector('[data-cin-range="v2y"]').value=state.v2y;
      setPressed(stepButtons,b=>Number(b.dataset.gsStep)===state.step); setPath(root,state.step);
      const titles=["v₁ 决定第一条基方向","把 v₂ 在 e₁ 上的平行部分标出来","真正做减法，只留下垂直余量","把余量缩放到单位长度"];
      root.querySelector("[data-cin-stage-title]").textContent=titles[state.step];
      root.querySelector("[data-cin-stage-kicker]").textContent=`第 ${state.step+1} 步`;
      root.querySelector("[data-cin-caption]").textContent=state.step<2?"灰白箭头是将被减掉的平行部分；紫色余量还没有出现。":"紫色 u₂ 与第一方向垂直；单位化只改长度，不改方向。";
      root.querySelector("[data-cin-formula]").innerHTML=state.step===0?`<span>第一方向</span>${display("e_1=v_1/\\lVert v_1\\rVert")}`:state.step===1?`<span>投影</span>${display(`\\operatorname{proj}_{e_1}v_2=${fmt(g.coefficient,2)}e_1`)}`:state.step===2?`<span>减去平行部分</span>${display("u_2=v_2-\\operatorname{proj}_{e_1}v_2")}`:`<span>单位化</span>${display("e_2=u_2/\\lVert u_2\\rVert")}`;
      const obs=root.querySelector("[data-cin-observation]"); obs.setAttribute("data-gs-observation","");
      obs.classList.toggle("is-warning",g.residual<1e-6);
      if(g.residual<1e-6)obs.innerHTML=`<strong>算法边界</strong><p>余量为 0：v₂ 没有带来新方向，不能产生第二个标准正交基向量。</p>`;
      else if(state.step===3)obs.innerHTML=`<strong>正交化通过</strong><p>e₁、e₂ 长度均为 1，内积为 ${fmt(dot(g.e1,g.e2),5)}，原张成空间保持不变。</p>`;
      else obs.innerHTML=`<strong>张成空间保持</strong><p>每一步只在旧方向内减法或非零缩放，不会改变由输入向量张成的空间。</p>`;
    }
    stepButtons.forEach(b=>on(b,"click",()=>{state.step=Number(b.dataset.gsStep);draw();}));
    root.querySelectorAll("[data-gs-preset]").forEach(b=>on(b,"click",()=>{const[v2x,v2y]=presets[b.dataset.gsPreset];animateState(state,{v2x,v2y},["v2x","v2y"],draw);}));
    on(root.querySelector("[data-gs-swap]"),"click",()=>{const target={v1x:state.v2x,v1y:state.v2y,v2x:state.v1x,v2y:state.v1y};Object.assign(state,target);draw();});
    bindRange(root,"v2x",v=>{state.v2x=v;draw();}); bindRange(root,"v2y",v=>{state.v2y=v;draw();});
    draw();
  }

  function renderIso(root) {
    root.innerHTML=labShell({kicker:"交互实验 · 等距坐标桥",title:"同一个向量进入不同坐标基，只有标准正交基保留几何",intro:"左侧是真实空间，右侧是坐标空间。改变基时 x 不动，坐标列随之变化；两边的圆让长度是否保持一眼可见。",steps:["选择基","读取坐标","检查等距"],stageKicker:"两个空间",stageTitle:"真实向量与坐标向量并排比较",svgLabel:"欧几里得空间与坐标空间之间的等距映射",controls:`<div class="ch9cin-control-row"><button type="button" data-iso-mode="rotated" class="is-active">旋转标准正交基</button><button type="button" data-iso-mode="reflected">镜像标准正交基</button><button type="button" data-iso-mode="skew">一般斜基</button></div><div class="ch9cin-range-grid">${range("basisAngle","第一基方向",-150,150,1,32,"°")}${range("skew","第二方向倾斜",-1.25,1.25,.05,.72)}</div>`,metrics:`${metric("‖x‖","xNorm")}${metric("‖坐标列‖","cNorm")}${metric("长度误差","normError")}${metric("基向量内积","basisDot")}`,observation:`<strong>等距坐标通过</strong><p>标准正交坐标列与原向量具有相同长度。</p>`});
    const svg=root.querySelector("[data-cin-svg]"); const state={mode:"rotated",basisAngle:32,skew:.72,x:[2.35,1.45]}; const buttons=[...root.querySelectorAll("[data-iso-mode]")]; let dragging=false;
    function basis(){const a=rad(state.basisAngle),e1=[Math.cos(a),Math.sin(a)],n=[-Math.sin(a),Math.cos(a)];if(state.mode==="reflected")return{e1,e2:scale(-1,n),ortho:true};if(state.mode==="skew")return{e1,e2:add(n,scale(state.skew,e1)),ortho:false};return{e1,e2:n,ortho:true};}
    function draw(){const b=basis(),B=[b.e1[0],b.e2[0],b.e1[1],b.e2[1]],D=det(B),inv=[B[3]/D,-B[1]/D,-B[2]/D,B[0]/D],c=matVec(inv,state.x);const leftO=[230,340],rightO=[700,340],unit=72,xEnd=worldPoint(state.x,leftO,unit),cEnd=worldPoint(c,rightO,unit),b1=worldPoint(b.e1,leftO,unit),b2=worldPoint(b.e2,leftO,unit);svg.innerHTML=`${gridMarkup()}<line x1="480" y1="55" x2="480" y2="495" class="ch9cin-split-line"></line><text x="80" y="78" class="ch9cin-svg-text is-muted">真实空间 V</text><text x="560" y="78" class="ch9cin-svg-text is-muted">坐标空间 R²</text><circle cx="${leftO[0]}" cy="${leftO[1]}" r="${unit*norm(state.x)}" class="ch9cin-reference"></circle><circle cx="${rightO[0]}" cy="${rightO[1]}" r="${unit*norm(state.x)}" class="ch9cin-reference"></circle>${arrow(leftO[0],leftO[1],b1[0],b1[1],"var(--ch9-cyan)","b₁",{shaft:7,headHalf:14,labelClass:"is-cyan"})}${arrow(leftO[0],leftO[1],b2[0],b2[1],"var(--ch9-orange)","b₂",{shaft:7,headHalf:14,labelClass:"is-orange"})}${arrow(leftO[0],leftO[1],xEnd[0],xEnd[1],"var(--ch9-violet)","x",{shaft:10,headHalf:17,labelClass:"is-violet"})}${arrow(rightO[0],rightO[1],cEnd[0],cEnd[1],"var(--ch9-violet)","Φ(x)",{shaft:10,headHalf:17,labelClass:"is-violet"})}<line x1="${rightO[0]-170}" y1="${rightO[1]}" x2="${rightO[0]+170}" y2="${rightO[1]}" class="ch9cin-axis"></line><line x1="${rightO[0]}" y1="${rightO[1]+150}" x2="${rightO[0]}" y2="${rightO[1]-150}" class="ch9cin-axis"></line><path d="M 430 270 C 470 235 490 235 530 270" class="ch9cin-stroke-cyan" stroke-width="4"></path><text x="455" y="222" class="ch9cin-svg-text is-cyan">坐标映射</text><circle class="ch9cin-draggable" data-iso-handle cx="${xEnd[0]}" cy="${xEnd[1]}" r="18" fill="transparent" stroke="rgba(170,140,255,.38)" stroke-width="2"></circle>`;const xn=norm(state.x),cn=norm(c),err=Math.abs(xn-cn),bd=dot(b.e1,b.e2);setMetric(root,"xNorm",fmt(xn,3));setMetric(root,"cNorm",fmt(cn,3));setMetric(root,"normError",fmt(err,4));setMetric(root,"basisDot",fmt(bd,4));setMetric(root,"basisAngle",`${fmt(state.basisAngle,0)}°`);setMetric(root,"skew",fmt(state.skew,2));root.querySelector('[data-cin-range="basisAngle"]').value=state.basisAngle;root.querySelector('[data-cin-range="skew"]').value=state.skew;setPressed(buttons,x=>x.dataset.isoMode===state.mode);root.querySelector("[data-cin-formula]").innerHTML=b.ortho?`<span>标准正交坐标</span>${display("\\Phi(x)=(\\langle x,b_1\\rangle,\\langle x,b_2\\rangle)^T")}`:`<span>一般坐标必须解方程</span>${display("Bc=x")}`;const obs=root.querySelector("[data-cin-observation]");obs.setAttribute("data-iso-observation","");obs.classList.toggle("is-warning",!b.ortho);if(b.ortho)obs.innerHTML=state.mode==="reflected"?`<strong>等距坐标通过</strong><p>长度保持，但基的定向被翻转；这仍是欧氏同构。</p>`:`<strong>等距坐标通过</strong><p>两边圆半径一致，坐标列长度与 x 完全相同。</p>`;else obs.innerHTML=`<strong>这里只是线性坐标</strong><p>斜基仍能唯一表示 x，但右侧坐标长度与真实长度出现 ${fmt(err,3)} 的差异。</p>`;root.querySelector("[data-cin-caption]").textContent=b.ortho?"两边向量端点落在同半径圆上；标准正交坐标保留长度。":"右侧坐标向量离开对应半径圆；坐标仍合法，但不再等距。";}
    buttons.forEach(b=>on(b,"click",()=>{state.mode=b.dataset.isoMode;draw();}));bindRange(root,"basisAngle",v=>{state.basisAngle=v;draw();});bindRange(root,"skew",v=>{state.skew=v;draw();});on(svg,"pointerdown",e=>{if(e.target.closest("[data-iso-handle]")){dragging=true;svg.setPointerCapture(e.pointerId);}});on(svg,"pointermove",e=>{if(!dragging)return;const p=screenPoint(svg,e);state.x=[clamp((p.x-230)/72,-3.4,3.4),clamp((340-p.y)/72,-3.2,3.2)];draw();});on(svg,"pointerup",()=>{dragging=false;});draw();
  }

  function transformMatrix(state){const a=rad(state.angle),c=Math.cos(a),s=Math.sin(a);if(state.mode==="rotation")return[c,-s,s,c];if(state.mode==="reflection")return[c,s,s,-c];if(state.mode==="stretch")return[1+.6*state.amount,0,0,1-.45*state.amount];return[1,state.amount,0,1];}
  function pathForCircle(m,origin,unit){const pts=[];for(let k=0;k<=160;k++){const a=2*Math.PI*k/160;pts.push(worldPoint(matVec(m,[Math.cos(a),Math.sin(a)]),origin,unit));}return pts;}

  function renderOrtho(root){root.innerHTML=labShell({kicker:"交互实验 · 正交变换",title:"让单位圆接受旋转、镜像、伸缩和剪切的同场检验",intro:"滑动变换进度时，图形连续从 I 过渡到 Q。单位圆是否变形、两列是否标准正交、QᵀQ 是否等于 I 同步给出结论。",steps:["看单位圆","看矩阵两列","看 QᵀQ"],stageKicker:"图形层",stageTitle:"单位圆是所有方向的长度检测器",svgLabel:"正交与非正交线性变换对单位圆和网格的作用",controls:`<div class="ch9cin-control-row"><button type="button" data-ortho-mode="rotation" class="is-active">旋转</button><button type="button" data-ortho-mode="reflection">镜像</button><button type="button" data-ortho-mode="stretch">伸缩</button><button type="button" data-ortho-mode="shear">剪切</button></div><div class="ch9cin-stage-tabs">${[0,1,2].map(n=>`<button type="button" data-ortho-step="${n}"${n===0?' class="is-active"':''}>${["01 图形","02 两列","03 证书"][n]}</button>`).join("")}</div><div class="ch9cin-range-grid">${range("progress","变换进度",0,1,.01,1)}${range("angle","旋转/镜像方向",-180,180,1,36,"°")}${range("amount","形变强度",-1.25,1.25,.05,.7)}</div>`,metrics:`${metric("det Q","det")}${metric("‖QᵀQ−I‖∞","error")}${metric("两列内积","columnDot")}${metric("列长度","columnNorms")}`,observation:`<strong>正交证书通过</strong><p>单位圆保持，矩阵两列标准正交。</p>`});const svg=root.querySelector("[data-cin-svg]"),state={mode:"rotation",step:0,progress:1,angle:36,amount:.7},modes=[...root.querySelectorAll("[data-ortho-mode]")],steps=[...root.querySelectorAll("[data-ortho-step]")];function draw(){const target=transformMatrix(state),p=state.progress,m=[1+(target[0]-1)*p,target[1]*p,target[2]*p,1+(target[3]-1)*p],origin=[330,310],unit=120,circle=pathForCircle(m,origin,unit),q1=matVec(m,[1,0]),q2=matVec(m,[0,1]),q1s=worldPoint(q1,origin,unit),q2s=worldPoint(q2,origin,unit),gram=matMul(transpose(m),m),error=Math.max(Math.abs(gram[0]-1),Math.abs(gram[1]),Math.abs(gram[2]),Math.abs(gram[3]-1)),pass=error<.015;const grid=[];for(let k=-3;k<=3;k++){const a=worldPoint(matVec(m,[k,-3]),origin,unit/2),b=worldPoint(matVec(m,[k,3]),origin,unit/2),c=worldPoint(matVec(m,[-3,k]),origin,unit/2),d=worldPoint(matVec(m,[3,k]),origin,unit/2);grid.push(`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="ch9cin-guide" opacity=".28"></line><line x1="${c[0]}" y1="${c[1]}" x2="${d[0]}" y2="${d[1]}" class="ch9cin-guide" opacity=".28"></line>`);}const tri=[[.25,.25],[1.65,.25],[.65,1.35]].map(v=>worldPoint(matVec(m,v),origin,unit));svg.innerHTML=`${gridMarkup()}${grid.join("")}<circle cx="${origin[0]}" cy="${origin[1]}" r="${unit}" class="ch9cin-reference"></circle>${polyline(circle,"ch9cin-stroke-cyan",'fill="rgba(100,220,231,.08)" stroke-width="5"')}${polygon(tri,"ch9cin-fill-violet",'stroke="var(--ch9-violet)" stroke-width="3"')}${arrow(origin[0],origin[1],q1s[0],q1s[1],"var(--ch9-cyan)","Qe₁",{shaft:9,headHalf:16,labelClass:"is-cyan",labelDy:27})}${arrow(origin[0],origin[1],q2s[0],q2s[1],"var(--ch9-orange)","Qe₂",{shaft:9,headHalf:16,labelClass:"is-orange"})}<text x="650" y="270" class="ch9cin-svg-text is-muted">原单位圆</text><line x1="630" y1="288" x2="715" y2="288" class="ch9cin-reference"></line><text x="650" y="330" class="ch9cin-svg-text is-cyan">当前像</text><line x1="630" y1="348" x2="715" y2="348" class="ch9cin-stroke-cyan" stroke-width="5"></line>`;setMetric(root,"det",fmt(det(m),3));setMetric(root,"error",fmt(error,5));setMetric(root,"columnDot",fmt(dot(q1,q2),5));setMetric(root,"columnNorms",`${fmt(norm(q1),3)} / ${fmt(norm(q2),3)}`);setMetric(root,"progress",fmt(state.progress,2));setMetric(root,"angle",`${fmt(state.angle,0)}°`);setMetric(root,"amount",fmt(state.amount,2));root.querySelector('[data-cin-range="progress"]').value=state.progress;root.querySelector('[data-cin-range="angle"]').value=state.angle;root.querySelector('[data-cin-range="amount"]').value=state.amount;setPressed(modes,b=>b.dataset.orthoMode===state.mode);setPressed(steps,b=>Number(b.dataset.orthoStep)===state.step);setPath(root,state.step);const badge=root.querySelector("[data-cin-badge]");badge.setAttribute("data-ortho-badge","");badge.className=`ch9cin-badge ${pass?'is-pass':'is-fail'}`;badge.textContent=pass?(det(m)>=0?"正交 · 保持定向":"正交 · 翻转定向"):"非正交 · 发生形变";root.querySelector("[data-cin-formula]").innerHTML=state.step===0?`<span>整体长度测试</span>${display("\\lVert x\\rVert=1\\Rightarrow\\lVert Qx\\rVert=1")}`:state.step===1?`<span>矩阵列测试</span>${display("\\langle q_i,q_j\\rangle=\\delta_{ij}")}`:`<span>最终证书</span>${display(pass?"Q^TQ=I":"Q^TQ\\ne I")}`;root.querySelector("[data-cin-stage-title]").textContent=state.step===2?"QᵀQ=I 把所有几何检验压成一条矩阵恒等式":state.step===1?"矩阵两列就是两个标准基向量的去向":"单位圆是所有方向的长度检测器";const obs=root.querySelector("[data-cin-observation]");obs.setAttribute("data-ortho-observation","");obs.classList.toggle("is-warning",!pass);obs.innerHTML=pass?`<strong>正交证书通过</strong><p>圆保持为圆，列长度为 1 且彼此正交；det=${fmt(det(m),2)} 只决定定向。</p>`:`<strong>非正交</strong><p>单位圆已经变形，QᵀQ 与 I 的最大误差为 ${fmt(error,3)}。</p>`;root.querySelector("[data-cin-caption]").textContent=pass?"当前变换只搬动或翻转图形，没有拉伸、压缩和剪切。":"圆变成椭圆或斜椭圆，说明至少有一批方向的长度发生改变。";}
  modes.forEach(b=>on(b,"click",()=>{state.mode=b.dataset.orthoMode;animateState(state,{progress:1},["progress"],draw);}));steps.forEach(b=>on(b,"click",()=>{state.step=Number(b.dataset.orthoStep);draw();}));bindRange(root,"progress",v=>{state.progress=v;draw();});bindRange(root,"angle",v=>{state.angle=v;draw();});bindRange(root,"amount",v=>{state.amount=v;draw();});draw();}

  function renderProjection(root){root.innerHTML=labShell({kicker:"交互实验 · 正交投影",title:"垂足与距离平方曲线的最低点必须是同一个位置",intro:"左侧做 x=p+e，右侧让 W 上所有候选点参加距离比赛。拖动 x 或候选参数，几何图与碗形曲线同步。",steps:["做分解","移动候选点","验证最近点"],stageKicker:"几何与函数同时看",stageTitle:"正交余量对应距离平方的唯一最低点",svgLabel:"向量投影到子空间以及候选距离平方曲线",controls:`<div class="ch9cin-control-row"><button type="button" data-proj-preset="horizontal">水平 W</button><button type="button" data-proj-preset="diagonal">斜线 W</button><button type="button" data-proj-preset="perpendicular">x 在 W⊥</button><button type="button" class="ch9cin-action is-primary" data-proj-best>把候选点移到垂足</button></div><div class="ch9cin-range-grid">${range("angle","W 的方向",-80,80,1,25,"°")}${range("candidate","候选参数 t",-4,4,.05,.5)}</div>`,metrics:`${metric("⟨e,u⟩","orthogonality")}${metric("最短距离","bestDistance")}${metric("当前距离","candidateDistance")}${metric("多出的距离平方","extraSquare")}`,observation:`<strong>先移动候选点</strong><p>右侧灰点离最低点越远，左侧虚线距离越长。</p>`});const svg=root.querySelector("[data-cin-svg]"),state={angle:25,candidate:.5,x:[2.5,2.6]},presets={horizontal:{angle:0,x:[2.5,2.6]},diagonal:{angle:32,x:[2.5,2.6]},perpendicular:{angle:25,x:[-1.1,2.35]}};let dragging=false;function geom(){const u=[Math.cos(rad(state.angle)),Math.sin(rad(state.angle))],coef=dot(state.x,u),p=scale(coef,u),e=sub(state.x,p),w=scale(state.candidate,u);return{u,coef,p,e,w};}function draw(){const g=geom(),origin=[235,355],unit=78,x=worldPoint(state.x,origin,unit),p=worldPoint(g.p,origin,unit),w=worldPoint(g.w,origin,unit),a=worldPoint(scale(-5,g.u),origin,unit),b=worldPoint(scale(5,g.u),origin,unit),best2=dot(g.e,g.e),current2=best2+(state.candidate-g.coef)**2;const bowl=[];for(let k=0;k<=120;k++){const t=-4+8*k/120;const yy=best2+(t-g.coef)**2;bowl.push([560+(t+4)/8*330,430-clamp(yy/20,0,1)*300]);}const bestPt=[560+(g.coef+4)/8*330,430-clamp(best2/20,0,1)*300],currentPt=[560+(state.candidate+4)/8*330,430-clamp(current2/20,0,1)*300];svg.innerHTML=`${gridMarkup()}<line x1="480" y1="55" x2="480" y2="490" class="ch9cin-split-line"></line><text x="72" y="82" class="ch9cin-svg-text is-muted">x=p+e</text><line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="ch9cin-stroke-cyan" stroke-width="4"></line>${arrow(origin[0],origin[1],x[0],x[1],"var(--ch9-orange)","x",{shaft:9,headHalf:17,labelClass:"is-orange"})}${arrow(origin[0],origin[1],p[0],p[1],"var(--ch9-cyan)","p",{shaft:9,headHalf:17,labelClass:"is-cyan",labelDy:26})}${arrow(p[0],p[1],x[0],x[1],"var(--ch9-violet)","e",{shaft:8,headHalf:15,labelClass:"is-violet"})}<line x1="${w[0]}" y1="${w[1]}" x2="${x[0]}" y2="${x[1]}" class="ch9cin-guide"></line><circle cx="${w[0]}" cy="${w[1]}" r="8" fill="var(--ch9-white)"></circle><text x="${w[0]+12}" y="${w[1]+5}" class="ch9cin-svg-text">w</text><circle class="ch9cin-draggable" data-proj-handle cx="${x[0]}" cy="${x[1]}" r="18" fill="transparent" stroke="rgba(255,173,93,.38)" stroke-width="2"></circle><text x="565" y="82" class="ch9cin-svg-text is-muted">距离平方 ‖x-tu‖²</text><line x1="555" y1="430" x2="905" y2="430" class="ch9cin-axis"></line><line x1="570" y1="455" x2="570" y2="105" class="ch9cin-axis"></line>${polyline(bowl,"ch9cin-stroke-cyan",'fill="none" stroke-width="5"')}<circle cx="${bestPt[0]}" cy="${bestPt[1]}" r="9" fill="var(--ch9-cyan)"></circle><circle cx="${currentPt[0]}" cy="${currentPt[1]}" r="8" fill="var(--ch9-white)"></circle><line x1="${currentPt[0]}" y1="${currentPt[1]}" x2="${currentPt[0]}" y2="430" class="ch9cin-guide"></line><text x="${bestPt[0]+12}" y="${bestPt[1]-10}" class="ch9cin-svg-text is-cyan">p</text><text x="${currentPt[0]+12}" y="${currentPt[1]-10}" class="ch9cin-svg-text">w</text>`;setMetric(root,"orthogonality",fmt(dot(g.e,g.u),5));setMetric(root,"bestDistance",fmt(norm(g.e),3));setMetric(root,"candidateDistance",fmt(Math.sqrt(current2),3));setMetric(root,"extraSquare",fmt((state.candidate-g.coef)**2,4));setMetric(root,"angle",`${fmt(state.angle,0)}°`);setMetric(root,"candidate",fmt(state.candidate,2));root.querySelector('[data-cin-range="angle"]').value=state.angle;root.querySelector('[data-cin-range="candidate"]').value=state.candidate;root.querySelector("[data-cin-formula]").innerHTML=`<span>勾股分解</span>${display("\\lVert x-w\\rVert^2=\\lVert e\\rVert^2+\\lVert p-w\\rVert^2")}`;const hit=Math.abs(state.candidate-g.coef)<.015,obs=root.querySelector("[data-cin-observation]");obs.setAttribute("data-proj-observation","");obs.classList.toggle("is-warning",!hit);obs.innerHTML=hit?`<strong>最近点命中</strong><p>w=p，多出的距离平方为 0；左图垂足与右图最低点完全对齐。</p>`:`<strong>候选点还不是最近点</strong><p>当前多出了 ${fmt((state.candidate-g.coef)**2,3)} 的距离平方；把 w 沿 W 移向 p。</p>`;root.querySelector("[data-cin-caption]").textContent="右侧碗形曲线不是另一个问题，它正是左侧所有候选距离平方的完整记录。";}
  root.querySelectorAll("[data-proj-preset]").forEach(b=>on(b,"click",()=>{const t=presets[b.dataset.projPreset];state.angle=t.angle;state.x=[...t.x];draw();}));on(root.querySelector("[data-proj-best]"),"click",()=>{const g=geom();animateState(state,{candidate:g.coef},["candidate"],draw);});bindRange(root,"angle",v=>{state.angle=v;draw();});bindRange(root,"candidate",v=>{state.candidate=v;draw();});on(svg,"pointerdown",e=>{if(e.target.closest("[data-proj-handle]")){dragging=true;svg.setPointerCapture(e.pointerId);}});on(svg,"pointermove",e=>{if(!dragging)return;const p=screenPoint(svg,e);state.x=[clamp((p.x-235)/78,-3.5,3.5),clamp((355-p.y)/78,-3.4,3.4)];draw();});on(svg,"pointerup",()=>{dragging=false;});draw();}

  function rotation(angle){const c=Math.cos(angle),s=Math.sin(angle);return[c,-s,s,c];}
  function renderSpectral(root){root.innerHTML=labShell({kicker:"交互实验 · 实谱定理",title:"沿 Qᵀ → Λ → Q 的路径看完一次正交对角化",intro:"同一个测试圆先旋入特征坐标，再沿坐标轴独立伸缩，最后旋回原空间。非对称矩阵会在入口处关闭这条路径。",steps:["原坐标","应用 Qᵀ","应用 Λ","应用 Q"],stageKicker:"起点",stageTitle:"单位圆与两条正交特征方向",svgLabel:"实对称矩阵的正交谱分解动画",controls:`<div class="ch9cin-stage-tabs">${[0,1,2,3].map(n=>`<button type="button" data-sp-step="${n}"${n===0?' class="is-active"':''}>${["00 I","01 Qᵀ","02 ΛQᵀ","03 QΛQᵀ"][n]}</button>`).join("")}</div><div class="ch9cin-control-row"><button type="button" data-sp-preset="positive">正定椭圆</button><button type="button" data-sp-preset="indefinite">一正一负</button><button type="button" data-sp-preset="repeated">重特征值</button><button type="button" data-sp-preset="nonsymmetric">非对称对照</button></div><div class="ch9cin-range-grid">${range("angle","特征方向角",-90,90,1,32,"°")}${range("lambda1","λ₁",-3,3,.1,2.8)}${range("lambda2","λ₂",-3,3,.1,1.1)}${range("asym","非对称扰动",0,1.2,.05,0)}</div>`,metrics:`${metric("λ₁ / λ₂","lambdas")}${metric("⟨q₁,q₂⟩","qdot")}${metric("‖A−Aᵀ‖∞","symmetryError")}${metric("重构误差","reconstruction")}`,observation:`<strong>谱分解路径已打开</strong><p>点击四个阶段，观察坐标系和图形连续变化。</p>`});const svg=root.querySelector("[data-cin-svg]"),state={step:0,angle:32,lambda1:2.8,lambda2:1.1,asym:0},steps=[...root.querySelectorAll("[data-sp-step]")];function current(q,L){if(state.step===0)return[1,0,0,1];if(state.step===1)return transpose(q);if(state.step===2)return matMul(L,transpose(q));return matMul(matMul(q,L),transpose(q));}function draw(){const q=rotation(rad(state.angle)),L=[state.lambda1,0,0,state.lambda2],A0=matMul(matMul(q,L),transpose(q)),A=[A0[0],A0[1]+state.asym,A0[2],A0[3]],symmetric=Math.abs(state.asym)<1e-8;if(!symmetric)state.step=3;const T=symmetric?current(q,L):A,origin=[380,310],unit=92,circle=pathForCircle(T,origin,unit),sample=worldPoint(matVec(T,[1.25,.7]),origin,unit),q1=[q[0],q[2]],q2=[q[1],q[3]],q1s=worldPoint(q1,origin,unit),q2s=worldPoint(q2,origin,unit);svg.innerHTML=`${gridMarkup()}${polyline(circle,symmetric?'ch9cin-stroke-cyan':'ch9cin-stroke-orange',`fill="${symmetric?'rgba(100,220,231,.08)':'rgba(255,173,93,.08)'}" stroke-width="5"`)}${arrow(origin[0],origin[1],sample[0],sample[1],"var(--ch9-violet)",state.step===0?"x":"当前像",{shaft:9,headHalf:16,labelClass:"is-violet"})}${symmetric&&[0,3].includes(state.step)?`${arrow(origin[0],origin[1],q1s[0],q1s[1],"var(--ch9-cyan)","q₁",{shaft:8,headHalf:15,labelClass:"is-cyan",labelDy:28})}${arrow(origin[0],origin[1],q2s[0],q2s[1],"var(--ch9-orange)","q₂",{shaft:8,headHalf:15,labelClass:"is-orange"})}`:""}<g transform="translate(665 155)"><rect width="210" height="250" rx="20" fill="rgba(8,27,44,.78)" stroke="rgba(150,190,215,.22)"></rect><text x="28" y="45" class="ch9cin-svg-text is-muted">当前复合</text><text x="28" y="84" class="ch9cin-svg-text is-cyan">${["I","Qᵀ","ΛQᵀ","QΛQᵀ"][state.step]}</text><line x1="28" y1="110" x2="182" y2="110" class="ch9cin-split-line"></line><text x="28" y="148" class="ch9cin-svg-text is-muted">λ₁ = ${fmt(state.lambda1,2)}</text><text x="28" y="181" class="ch9cin-svg-text is-muted">λ₂ = ${fmt(state.lambda2,2)}</text><text x="28" y="218" class="ch9cin-svg-text ${symmetric?'is-cyan':'is-orange'}">${symmetric?'Aᵀ=A':'Aᵀ≠A'}</text></g>`;setMetric(root,"lambdas",`${fmt(state.lambda1,2)} / ${fmt(state.lambda2,2)}`);setMetric(root,"qdot",fmt(dot(q1,q2),5));setMetric(root,"symmetryError",fmt(Math.abs(A[1]-A[2]),5));setMetric(root,"reconstruction",symmetric?"0":"关闭");["angle","lambda1","lambda2","asym"].forEach(n=>{setMetric(root,n,n==="angle"?`${fmt(state[n],0)}°`:fmt(state[n],2));root.querySelector(`[data-cin-range="${n}"]`).value=state[n];});setPressed(steps,b=>Number(b.dataset.spStep)===state.step);steps.forEach(b=>b.disabled=!symmetric&&Number(b.dataset.spStep)!==3);setPath(root,symmetric?state.step:0);const badge=root.querySelector("[data-cin-badge]");badge.setAttribute("data-sp-badge","");badge.className=`ch9cin-badge ${symmetric?'is-pass':'is-fail'}`;badge.textContent=symmetric?"对称 · 谱路径开放":"非对称 · 谱路径关闭";root.querySelector("[data-cin-stage-title]").textContent=symmetric?["单位圆与两条正交特征方向","Qᵀ 把特征方向转到坐标轴","Λ 沿两条坐标轴独立伸缩","Q 把结果旋回原坐标"][state.step]:"矩阵不对称，不能宣称存在实正交标准形";root.querySelector("[data-cin-formula]").innerHTML=symmetric?`<span>当前阶段</span>${display(["x","Q^Tx","\\Lambda Q^Tx","Q\\Lambda Q^Tx=Ax"][state.step])}`:`<span>结论闸门</span>${display("A^T\\ne A")}`;const obs=root.querySelector("[data-cin-observation]");obs.setAttribute("data-sp-observation","");obs.classList.toggle("is-warning",!symmetric);if(!symmetric)obs.innerHTML=`<strong>谱定理已关闭</strong><p>当前矩阵不满足 Aᵀ=A，页面不会继续伪装成正交谱分解。</p>`;else if(Math.abs(state.lambda1-state.lambda2)<.01)obs.innerHTML=`<strong>重特征值</strong><p>图形各向同性，特征方向不唯一；任意标准正交基都可以作为特征基。</p>`;else if(state.step===3)obs.innerHTML=`<strong>谱分解通过</strong><p>Qᵀ、Λ、Q 三步的复合与 A 完全一致，重构误差为 0。</p>`;else obs.innerHTML=`<strong>路径进行中</strong><p>当前只完成了 ${state.step} 个动作；继续沿时间线观察。</p>`;root.querySelector("[data-cin-caption]").textContent="不要只看最终椭圆：真正需要理解的是坐标变换、独立伸缩和转回原坐标三步。";}
  steps.forEach(b=>on(b,"click",()=>{state.step=Number(b.dataset.spStep);draw();}));root.querySelectorAll("[data-sp-preset]").forEach(b=>on(b,"click",()=>{const p={positive:[32,2.8,1.1,0],indefinite:[28,2.5,-1.25,0],repeated:[0,1.8,1.8,0],nonsymmetric:[25,2.4,1.1,.65]}[b.dataset.spPreset];Object.assign(state,{angle:p[0],lambda1:p[1],lambda2:p[2],asym:p[3],step:0});draw();}));["angle","lambda1","lambda2","asym"].forEach(n=>bindRange(root,n,v=>{state[n]=v;draw();}));draw();}

  function optimum(points){const n=points.length,sx=points.reduce((s,p)=>s+p[0],0),sy=points.reduce((s,p)=>s+p[1],0),sxx=points.reduce((s,p)=>s+p[0]*p[0],0),sxy=points.reduce((s,p)=>s+p[0]*p[1],0),den=n*sxx-sx*sx,m=(n*sxy-sx*sy)/den,c=(sy-m*sx)/n;return{m,c};}
  function residuals(points,m,c){const r=points.map(([x,y])=>y-(m*x+c));return{r,sse:r.reduce((s,v)=>s+v*v,0),sum:r.reduce((s,v)=>s+v,0),weighted:r.reduce((s,v,k)=>s+points[k][0]*v,0)};}
  function renderLeast(root){root.innerHTML=labShell({kicker:"交互实验 · 最小二乘",title:"一条候选直线怎样被残差和正规方程共同校正",intro:"左侧看直线与残差棒，右侧把残差排成向量。按下最佳解时，蓝线连续移动到青色位置，两条正规方程同时归零。",steps:["选择直线","读取残差","比较 SSE","检查正交"],stageKicker:"数据空间",stageTitle:"候选直线与每个数据点的有向残差",svgLabel:"线性回归最小二乘拟合与残差正交条件",controls:`<div class="ch9cin-stage-tabs">${[0,1,2,3].map(n=>`<button type="button" data-ls-step="${n}"${n===0?' class="is-active"':''}>${["01 选线","02 残差","03 SSE","04 正交"][n]}</button>`).join("")}</div><div class="ch9cin-range-grid">${range("slope","斜率 m",-1,2.5,.02,.7)}${range("intercept","截距 c",-1,4,.02,2)}${range("pointY","紫色数据点 y",-.5,6,.05,3.2)}</div><button type="button" class="ch9cin-action is-primary" data-ls-best>连续移动到最小二乘解</button>`,metrics:`${metric("SSE=Σrᵢ²","sse")}${metric("Σrᵢ","sumR")}${metric("Σxᵢrᵢ","sumXR")}${metric("距最优参数","parameterGap")}`,observation:`<strong>候选直线</strong><p>调节 m 和 c，观察残差如何重新分布。</p>`});const svg=root.querySelector("[data-cin-svg]"),state={step:0,slope:.7,intercept:2,pointY:3.2},steps=[...root.querySelectorAll("[data-ls-step]")],points=[[-2,.8],[-1,1.4],[0,2.2],[1,3.2],[2,4.5]];function draw(){points[3][1]=state.pointY;const best=optimum(points),data=residuals(points,state.slope,state.intercept),gap=Math.hypot(state.slope-best.m,state.intercept-best.c),optimal=gap<.003;const sx=x=>100+(x+2.6)/5.2*420,sy=y=>450-(y+.5)/6.5*350,line=(m,c,color,dash="")=>`<line x1="${sx(-2.6)}" y1="${sy(m*-2.6+c)}" x2="${sx(2.6)}" y2="${sy(m*2.6+c)}" stroke="${color}" stroke-width="5" ${dash}></line>`;const bars=points.map(([x,y],k)=>{const fit=state.slope*x+state.intercept;return `${state.step>=1?`<line x1="${sx(x)}" y1="${sy(y)}" x2="${sx(x)}" y2="${sy(fit)}" stroke="var(--ch9-orange)" stroke-width="4"></line>`:""}<circle cx="${sx(x)}" cy="${sy(y)}" r="${k===3?9:7}" fill="${k===3?'var(--ch9-violet)':'var(--ch9-white)'}"></circle>`;}).join("");const residualBars=data.r.map((r,k)=>{const x=650+k*48,y0=295,y=y0-r*48;return `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y}" stroke="${r>=0?'var(--ch9-orange)':'var(--ch9-cyan)'}" stroke-width="12" stroke-linecap="round"></line><text x="${x-9}" y="330" class="ch9cin-svg-text is-muted">r${k+1}</text>`;}).join("");svg.innerHTML=`${gridMarkup()}<line x1="570" y1="55" x2="570" y2="490" class="ch9cin-split-line"></line><text x="80" y="78" class="ch9cin-svg-text is-muted">数据与拟合</text><text x="640" y="78" class="ch9cin-svg-text is-muted">残差向量 r</text>${line(best.m,best.c,"var(--ch9-cyan)",'stroke-dasharray="10 8" opacity=".55"')}${line(state.slope,state.intercept,"var(--ch9-violet)")}${bars}<line x1="620" y1="295" x2="900" y2="295" class="ch9cin-axis"></line>${residualBars}${state.step>=2?`<rect x="628" y="380" width="260" height="82" rx="16" fill="rgba(100,220,231,.08)" stroke="rgba(100,220,231,.3)"></rect><text x="654" y="414" class="ch9cin-svg-text is-muted">SSE = 所有残差平方和</text><text x="654" y="447" class="ch9cin-svg-text is-cyan">${fmt(data.sse,3)}</text>`:""}`;setMetric(root,"sse",fmt(data.sse,4));setMetric(root,"sumR",fmt(data.sum,5));setMetric(root,"sumXR",fmt(data.weighted,5));setMetric(root,"parameterGap",fmt(gap,4));["slope","intercept","pointY"].forEach(n=>{setMetric(root,n,fmt(state[n],2));root.querySelector(`[data-cin-range="${n}"]`).value=state[n];});setPressed(steps,b=>Number(b.dataset.lsStep)===state.step);setPath(root,state.step);root.querySelector("[data-cin-formula]").innerHTML=state.step<2?`<span>残差</span>${display("r_i=y_i-(mx_i+c)")}`:state.step===2?`<span>目标函数</span>${display("\\operatorname{SSE}=\\sum_i r_i^2")}`:`<span>正规方程</span>${display("\\sum r_i=0,\\qquad\\sum x_ir_i=0")}`;const obs=root.querySelector("[data-cin-observation]");obs.setAttribute("data-ls-observation","");obs.classList.toggle("is-warning",!optimal);obs.innerHTML=optimal?`<strong>最小二乘解已命中</strong><p>Σrᵢ=${fmt(data.sum,5)}，Σxᵢrᵢ=${fmt(data.weighted,5)}；残差同时垂直于两列。</p>`:`<strong>仍是候选直线</strong><p>两条正交条件尚未同时归零；蓝紫线还可以继续降低 SSE。</p>`;root.querySelector("[data-cin-caption]").textContent="青色虚线是最优位置，紫色实线是当前候选；最佳按钮会连续移动而不是突然跳变。";}
  steps.forEach(b=>on(b,"click",()=>{state.step=Number(b.dataset.lsStep);draw();}));["slope","intercept","pointY"].forEach(n=>bindRange(root,n,v=>{state[n]=v;draw();}));on(root.querySelector("[data-ls-best]"),"click",()=>{points[3][1]=state.pointY;const b=optimum(points);animateState(state,{slope:b.m,intercept:b.c},["slope","intercept"],draw,700);});draw();}

  function renderUnitary(root){root.innerHTML=labShell({kicker:"交互实验 · 酉空间",title:"共轭先把相位抵消，酉变换再沿等模圆旋转",intro:"蓝色 z、橙色 z̄ 与紫色 Uz 同处一个复平面。切换非酉缩放时，Uz 会离开等模圆，证书立即失败。",steps:["看共轭","得到 |z|²","施加酉相位"],stageKicker:"复平面",stageTitle:"z 与 z̄ 关于实轴镜像",svgLabel:"复数、共轭和酉相位变换的复平面",controls:`<div class="ch9cin-stage-tabs">${[0,1,2].map(n=>`<button type="button" data-u-step="${n}"${n===0?' class="is-active"':''}>${["01 共轭","02 模长","03 酉变换"][n]}</button>`).join("")}</div><div class="ch9cin-control-row"><button type="button" data-u-mode="unitary" class="is-active">纯相位 U</button><button type="button" data-u-mode="scaled">相位 + 缩放</button></div><div class="ch9cin-range-grid">${range("zAngle","z 的相位",-180,180,1,42,"°")}${range("zLength","|z|",0,3.4,.05,2.2)}${range("phase","U 的相位",-180,180,1,70,"°")}${range("scale","非酉缩放 ρ",.4,1.8,.05,1.35)}</div>`,metrics:`${metric("z̄z","selfInner")}${metric("|z| / |Uz|","normPair")}${metric("U*U−1","unitaryError")}${metric("长度平方误差","normError")}`,observation:`<strong>酉证书通过</strong><p>纯相位只改变方向，不改变模长。</p>`});const svg=root.querySelector("[data-cin-svg]"),state={step:0,mode:"unitary",zAngle:42,zLength:2.2,phase:70,scale:1.35},steps=[...root.querySelectorAll("[data-u-step]")],modes=[...root.querySelectorAll("[data-u-mode]")];function polar(r,a){return[r*Math.cos(rad(a)),r*Math.sin(rad(a))];}function mul(a,b){return[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]];}function draw(){const z=polar(state.zLength,state.zAngle),zb=[z[0],-z[1]],rho=state.mode==="unitary"?1:state.scale,uz=mul(polar(rho,state.phase),z),origin=[430,300],unit=95,zp=worldPoint(z,origin,unit),zbp=worldPoint(zb,origin,unit),uzp=worldPoint(uz,origin,unit),self=state.zLength**2,err=Math.abs(rho*rho-1),normErr=Math.abs(norm(uz)**2-self);svg.innerHTML=`${gridMarkup()}<line x1="70" y1="${origin[1]}" x2="890" y2="${origin[1]}" class="ch9cin-axis"></line><line x1="${origin[0]}" y1="500" x2="${origin[0]}" y2="65" class="ch9cin-axis"></line><text x="875" y="285" class="ch9cin-svg-text is-muted">Re</text><text x="445" y="78" class="ch9cin-svg-text is-muted">Im</text>${state.step>=1?`<circle cx="${origin[0]}" cy="${origin[1]}" r="${state.zLength*unit}" class="ch9cin-reference" stroke-dasharray="9 8"></circle>`:""}${arrow(origin[0],origin[1],zp[0],zp[1],"var(--ch9-cyan)","z",{shaft:9,headHalf:17,labelClass:"is-cyan"})}${arrow(origin[0],origin[1],zbp[0],zbp[1],"var(--ch9-orange)","z̄",{shaft:8,headHalf:15,labelClass:"is-orange",opacity:state.step===0?1:.48})}${state.step>=2?arrow(origin[0],origin[1],uzp[0],uzp[1],"var(--ch9-violet)","Uz",{shaft:10,headHalf:18,labelClass:"is-violet"}):""}<line x1="${zp[0]}" y1="${zp[1]}" x2="${zbp[0]}" y2="${zbp[1]}" class="ch9cin-guide"></line><circle class="ch9cin-draggable" data-u-handle cx="${zp[0]}" cy="${zp[1]}" r="18" fill="transparent" stroke="rgba(100,220,231,.35)" stroke-width="2"></circle>`;setMetric(root,"selfInner",fmt(self,3));setMetric(root,"normPair",`${fmt(state.zLength,3)} / ${fmt(norm(uz),3)}`);setMetric(root,"unitaryError",fmt(err,4));setMetric(root,"normError",fmt(normErr,4));["zAngle","zLength","phase","scale"].forEach(n=>{setMetric(root,n,n.includes("Angle")||n==="phase"?`${fmt(state[n],0)}°`:fmt(state[n],2));root.querySelector(`[data-cin-range="${n}"]`).value=state[n];});setPressed(steps,b=>Number(b.dataset.uStep)===state.step);setPressed(modes,b=>b.dataset.uMode===state.mode);setPath(root,state.step);root.querySelector("[data-cin-formula]").innerHTML=state.step===0?`<span>共轭只翻转虚部</span>${display("z=a+bi,\\qquad\\bar z=a-bi")}`:state.step===1?`<span>相位相消</span>${display(`\\bar z z=|z|^2=${fmt(self,2)}`)}`:`<span>酉证书</span>${display(state.mode==="unitary"?"U^*U=1":"U^*U\\ne1")}`;const pass=state.mode==="unitary",obs=root.querySelector("[data-cin-observation]");obs.setAttribute("data-u-observation","");obs.classList.toggle("is-warning",!pass);obs.innerHTML=state.zLength<1e-8?`<strong>零向量</strong><p>模长为 0，相位不可辨认；共轭与任何线性变换仍把它保持为 0。</p>`:pass?`<strong>酉证书通过</strong><p>Uz 与 z 落在同一条等模圆上；U*U−1=0。</p>`:`<strong>非酉对照</strong><p>Uz 已离开等模圆，长度平方误差为 ${fmt(normErr,3)}。</p>`;root.querySelector("[data-cin-caption]").textContent=pass?"紫色 Uz 只沿等模圆转动；它改变相位，不改变复内积给出的长度。":"缩放因子 ρ≠1，紫色 Uz 离开原等模圆。";}
  steps.forEach(b=>on(b,"click",()=>{state.step=Number(b.dataset.uStep);draw();}));modes.forEach(b=>on(b,"click",()=>{state.mode=b.dataset.uMode;draw();}));["zAngle","zLength","phase","scale"].forEach(n=>bindRange(root,n,v=>{state[n]=v;draw();}));let dragging=false;on(svg,"pointerdown",e=>{if(e.target.closest("[data-u-handle]")){dragging=true;svg.setPointerCapture(e.pointerId);}});on(svg,"pointermove",e=>{if(!dragging)return;const p=screenPoint(svg,e),dx=(p.x-430)/95,dy=(300-p.y)/95;state.zLength=clamp(Math.hypot(dx,dy),0,3.4);state.zAngle=deg(Math.atan2(dy,dx));draw();});on(svg,"pointerup",()=>{dragging=false;});draw();}

  function renderSection(sectionId, interactive) {
    interactive.classList.add("ch9cin-interactive");
    if (sectionId === "inner-product-geometry") return renderInner(interactive);
    if (sectionId === "orthonormal-bases") return renderGram(interactive);
    if (sectionId === "euclidean-isomorphism") return renderIso(interactive);
    if (sectionId === "orthogonal-transformations") return renderOrtho(interactive);
    if (sectionId === "orthogonal-subspaces") return renderProjection(interactive);
    if (sectionId === "symmetric-canonical-form") return renderSpectral(interactive);
    if (sectionId === "least-squares-distance") return renderLeast(interactive);
    return renderUnitary(interactive);
  }

  function mount(sectionId) {
    teardown();
    const formal = document.querySelector(`#${CSS.escape(sectionId)}-formal`);
    const interactive = document.querySelector(`#${CSS.escape(sectionId)}-interactive`);
    if (!formal || !interactive || !FOUNDATIONS[sectionId]) return;
    renderFoundation(sectionId, formal);
    renderSection(sectionId, interactive);
    bindExamples(document);
  }

  window.mountChapter9 = mount;
  window.Chapter9Cinematic = { mount, arrowPath };
})();
