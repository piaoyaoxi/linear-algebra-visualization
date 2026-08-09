/* Chapter 3 geometry lessons: one continuous mathematical scene per section. */
(() => {
  const M = () => window.Ch3Math;
  const TARGET = "#547ec8";

  const lessons = {
    elimination: {
      kicker: "消元法 · 保持共同解",
      title: "方程在改写，交点不移动",
      intro: "把一次行倍加同时画在直线与增广矩阵上：约束的写法改变，但可逆操作前后的共同解完全相同。",
      aria: "行变换前后两组直线共享同一交点",
      controls: "steps",
      precisionTitle: "用增广矩阵完成消元",
      precisionNote: "逐步做行变换，并核对主元、阶梯形和解的类型",
      labels: ["原方程组", "执行行倍加", "读出阶梯形"],
      caption: [
        "两条直线共同通过的点，就是方程组的解。",
        "旧的第二条直线淡出，等价的新约束出现；交点仍停在原处。",
        "阶梯形没有改变解，只把主元与回代顺序显露出来。",
      ],
    },
    "n-vector-space": {
      kicker: "向量空间 · 线性组合",
      title: "坐标给出权重，线性组合给出结果",
      intro: "箭头提供二维可见模型：α、β 分别缩放 u、v，再把两段位移首尾相接。矩阵语言中，同样的系数就是组合各列所用的权重。",
      aria: "两个向量缩放后首尾相接形成线性组合",
      controls: "vector",
      precisionTitle: "用完整坐标计算线性组合",
      precisionNote: "改变维数和坐标，核对每一个分量怎样参与运算",
      caption: "拖动系数时，三根箭头始终保持首尾相接；右侧完整坐标逐项记录同一次线性组合。",
    },
    "linear-dependence": {
      kicker: "线性相关 · 表示是否唯一",
      title: "新向量落入旧 span，系数表示开始重复",
      intro: "依次加入三个向量：前两个独立方向铺开平面；第三个向量若已在这个平面中，它可以由旧向量合成，于是同一目标出现不同的组合系数。",
      aria: "一个向量张成直线，第二个向量扩成平面，第三个向量不增加维数",
      controls: "steps",
      precisionTitle: "用线性关系判断相关",
      precisionNote: "拖动向量，并用非平凡零组合解释哪个向量冗余",
      labels: ["加入 v₁", "再加入 v₂", "检验 v₃"],
      caption: [
        "span(v₁) 是穿过原点的一条直线，维数为 1。",
        "v₂ 不在原来的直线上；两组系数现在可以到达整个平面，维数升为 2。",
        "v₃=0.7v₁+0.55v₂ 给出非平凡零关系；删去 v₃ 后，span 的维数仍是 2。",
      ],
    },
    "matrix-rank": {
      kicker: "矩阵的秩 · 先看二维例子",
      title: "二维网格会变成平面、直线或点",
      intro: "先用 2×2 矩阵观察列张成的维数：两个输出方向独立时铺满平面，共线时只生成直线，同时为零时只剩原点。下面再用主元和子式给出严格证书。",
      aria: "矩阵把二维网格连续压缩为直线或点",
      controls: "rank",
      precisionTitle: "用完整矩阵判断秩",
      precisionNote: "二维看面积，三维看体积或平面，再用 RREF 和非零子式核对",
      caption: "秩等于变换后仍然保留的独立方向数；数矩阵中的非零元素不能直接得到秩。",
    },
    solvability: {
      kicker: "有解判别 · 目标是否可达",
      title: "把 b 放入或移出列向量张成",
      intro: "A 的列向量在这个例子中只能生成绿色直线。b 落在线上时存在系数 x 使 Ax=b；离开直线后，偏离的分量无法由当前列生成。",
      aria: "目标向量与列空间的距离决定方程组是否有解",
      controls: "solvability",
      precisionTitle: "用增广矩阵判断有没有解",
      precisionNote: "移动目标 b，并比较 rank(A) 与 rank([A|b])",
      caption: "虚线标出 b 相对可达直线的偏离；只有偏离精确为零时，原方程 Ax=b 才有解。",
    },
    "solution-structure": {
      kicker: "解的结构 · 特解加零空间",
      title: "输入沿核方向移动，输出始终是同一个 b",
      intro: "左侧画输入空间中的仿射解线，右侧画固定输出 b。参数 s 改变输入 x=x₀+sη，但 Aη=0，所以所有这些点都映到同一目标。",
      aria: "仿射解线上的所有输入都映射到同一个目标向量",
      controls: "solution",
      precisionTitle: "用 RREF 写出全部解",
      precisionNote: "分出特解、零空间基与自由参数，并逐项验证",
      caption: "特解 x₀ 决定解集的位置，零空间方向 η 决定解集可以延伸的方向。",
    },
    "binary-higher-degree": {
      kicker: "二元高次 · 消元与回代",
      title: "交点投影给出候选，回代才确认真解",
      intro: "从圆与直线的真实交点出发，把二维交点投影到 x 轴，得到结式的一元候选；最后再回到两条原曲线核验。",
      aria: "圆与直线的交点被投影成一元候选并回代验证",
      controls: "steps",
      precisionTitle: "按步骤完成结式消元",
      precisionNote: "整理系数、构造 Sylvester 矩阵、求候选并回代",
      labels: ["看曲线交点", "投影到 x 轴", "解结式", "回代确认"],
      caption: [
        "原问题是寻找两条曲线的公共点；后续代数步骤都在追踪这些公共点。",
        "消去 y 后，每个真实交点只留下一个可能的横坐标。",
        "结式 R(x)=2x²−1 的根给出 x=±√2/2；它们仍只是候选。",
        "为每个候选求 y，并同时代回两条原方程；两式都为零才是真解。",
      ],
    },
  };

  function esc(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  }

  function format(value) {
    const rounded = Math.round(value * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0$/, "");
  }

  function stepButtons(config, state) {
    return config.labels.map((label, index) => `<button type="button" data-geo-step="${index}" class="${index === state.step ? "is-active" : ""}" aria-pressed="${index === state.step}">${index + 1} · ${esc(label)}</button>`).join("");
  }

  function slider(name, label, min, max, step, value) {
    return `<label class="ch3-geometry-slider"><span>${label}</span><input type="range" name="${name}" min="${min}" max="${max}" step="${step}" value="${value}" data-geo-range="${name}"><output data-geo-output="${name}">${format(value)}</output></label>`;
  }

  function controlsHtml(config, state) {
    if (config.controls === "steps") return stepButtons(config, state);
    if (config.controls === "vector") {
      return slider("alpha", "α", -1.5, 1.5, .05, state.alpha) + slider("beta", "β", -1.5, 1.5, .05, state.beta);
    }
    if (config.controls === "rank") {
      return `<button type="button" data-rank-preset="plane" class="is-active">二维输出</button><button type="button" data-rank-preset="line">压成直线</button><button type="button" data-rank-preset="point">压成一点</button>${slider("lambda", "λ", 0, 1, .02, state.lambda)}`;
    }
    if (config.controls === "solvability") {
      return `<button type="button" data-solvable-preset="on" class="is-active">b 在线上</button><button type="button" data-solvable-preset="off">b 在线外</button>${slider("distance", "偏离", -1.8, 1.8, .02, state.distance)}`;
    }
    if (config.controls === "solution") {
      return `<button type="button" data-solution-preset="-1">s=-1</button><button type="button" data-solution-preset="0">s=0</button><button type="button" data-solution-preset="1">s=1</button>${slider("s", "s", -2.2, 2.2, .02, state.s)}`;
    }
    return "";
  }

  function lineWorld(ctx, frame, a, b, color, width = 1.7, dash = []) {
    const p = M().toCanvas(frame, a);
    const q = M().toCanvas(frame, b);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(p[0], p[1]);
    ctx.lineTo(q[0], q[1]);
    ctx.stroke();
    ctx.restore();
  }

  function lineThrough(ctx, frame, direction, color, width = 1.7, dash = []) {
    const span = Math.max(frame.width, frame.height) / frame.scale + 4;
    lineWorld(ctx, frame, [-span * direction[0], -span * direction[1]], [span * direction[0], span * direction[1]], color, width, dash);
  }

  function polygonWorld(ctx, frame, points, fill, stroke, alpha = .1) {
    ctx.save();
    ctx.beginPath();
    points.forEach((point, index) => {
      const p = M().toCanvas(frame, point);
      if (!index) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
    });
    ctx.closePath();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();
  }

  function labelPx(ctx, text, x, y, color, align = "left", weight = 700) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `${weight} 12px ui-sans-serif, system-ui`;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function miniFrame(ctx, width, height, x, y, w, h, p, scale = 38) {
    const frame = { ctx, width, height, scale, cx: x + w / 2, cy: y + h / 2, p };
    ctx.save();
    ctx.strokeStyle = p.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, frame.cy); ctx.lineTo(x + w, frame.cy);
    ctx.moveTo(frame.cx, y); ctx.lineTo(frame.cx, y + h);
    ctx.stroke();
    ctx.restore();
    return frame;
  }

  function drawElimination(canvas, state) {
    const sized = M().sizeCanvas(canvas);
    if (!sized) return;
    const frame = M().drawAxes(sized.ctx, sized.width, sized.height, Math.min(54, sized.width / 9));
    const p = frame.p;
    M().drawLineEquation(sized.ctx, frame, 1, 1, 3, p.accentStrong, 2.2);
    if (state.step === 0) M().drawLineEquation(sized.ctx, frame, 1, 2, 4, p.coral, 2.2);
    else {
      sized.ctx.save();
      sized.ctx.globalAlpha = .28;
      sized.ctx.setLineDash([7, 6]);
      M().drawLineEquation(sized.ctx, frame, 1, 2, 4, p.coral, 1.5);
      sized.ctx.restore();
      M().drawLineEquation(sized.ctx, frame, 0, 1, 1, p.coral, 2.2);
    }
    M().drawPoint(sized.ctx, frame, [2, 1], TARGET, "共同解 (2,1)", 4.5);
    labelPx(sized.ctx, "R₁: x+y=3", 15, 23, p.accentStrong);
    labelPx(sized.ctx, state.step ? "R₂−R₁: y=1" : "R₂: x+2y=4", 15, 43, p.coral);
    if (state.step === 1) labelPx(sized.ctx, "旧约束", sized.width - 16, 23, p.muted, "right", 600);
    if (state.step === 2) labelPx(sized.ctx, "从 y=1 回代到 x+y=3", sized.width - 16, sized.height - 18, p.accentStrong, "right", 650);
  }

  function drawVector(canvas, state) {
    const sized = M().sizeCanvas(canvas);
    if (!sized) return;
    const frame = M().drawAxes(sized.ctx, sized.width, sized.height, Math.min(55, sized.width / 9));
    const p = frame.p;
    const u = [2.1, 1.05];
    const v = [-.65, 1.75];
    const au = [state.alpha * u[0], state.alpha * u[1]];
    const bv = [state.beta * v[0], state.beta * v[1]];
    const w = [au[0] + bv[0], au[1] + bv[1]];
    lineWorld(sized.ctx, frame, bv, w, p.line, 1.2, [5, 5]);
    lineWorld(sized.ctx, frame, [0, 0], bv, p.line, 1.2, [5, 5]);
    M().drawArrowBetween(sized.ctx, frame, [0, 0], au, p.accentStrong, "αu", 2.2, { labelT: .58, labelOffset: 12 });
    M().drawArrowBetween(sized.ctx, frame, au, w, p.coral, "βv", 2.2, { labelT: .42, labelOffset: -13 });
    M().drawArrow(sized.ctx, frame, w, TARGET, "αu+βv", 2.4, { labelT: .88, labelOffset: 18 });
    M().drawPoint(sized.ctx, frame, au, p.accentStrong, "", 3.2);
  }

  function drawDependence(canvas, state) {
    const sized = M().sizeCanvas(canvas);
    if (!sized) return;
    const frame = M().drawAxes(sized.ctx, sized.width, sized.height, Math.min(50, sized.width / 10));
    const p = frame.p;
    const v1 = [2.2, 1.05];
    const v2 = [-.7, 1.8];
    const v3 = [1.155, 1.725];
    lineThrough(sized.ctx, frame, v1, p.accent, 2.8);
    M().drawArrow(sized.ctx, frame, v1, p.accentStrong, "v₁", 2.2, { labelT: 1, labelOffset: 6 });
    if (state.step >= 1) {
      sized.ctx.save();
      sized.ctx.globalAlpha = .07;
      sized.ctx.fillStyle = p.accent;
      sized.ctx.fillRect(0, 0, sized.width, sized.height);
      sized.ctx.restore();
      for (let k = -4; k <= 4; k += 1) {
        lineWorld(sized.ctx, frame, [k * v2[0] - 8 * v1[0], k * v2[1] - 8 * v1[1]], [k * v2[0] + 8 * v1[0], k * v2[1] + 8 * v1[1]], p.line, 1);
        lineWorld(sized.ctx, frame, [k * v1[0] - 8 * v2[0], k * v1[1] - 8 * v2[1]], [k * v1[0] + 8 * v2[0], k * v1[1] + 8 * v2[1]], p.line, 1);
      }
      M().drawArrow(sized.ctx, frame, v2, p.coral, "v₂", 2.2, { labelT: 1, labelOffset: 6 });
    }
    if (state.step >= 2) {
      const a = [.7 * v1[0], .7 * v1[1]];
      lineWorld(sized.ctx, frame, [0, 0], a, p.accent, 1.3, [5, 5]);
      lineWorld(sized.ctx, frame, a, v3, p.coral, 1.3, [5, 5]);
      M().drawArrow(sized.ctx, frame, v3, TARGET, "v₃", 2.2, { labelT: 1, labelOffset: 6 });
      labelPx(sized.ctx, "v₃ = 0.7v₁ + 0.55v₂", sized.width - 15, 24, TARGET, "right");
    }
  }

  function transformed(point, lambda, zero) {
    if (zero) return [0, 0];
    return [point[0] + .65 * point[1], lambda * point[1]];
  }

  function drawRank(canvas, state) {
    const sized = M().sizeCanvas(canvas);
    if (!sized) return;
    const frame = M().drawAxes(sized.ctx, sized.width, sized.height, Math.min(48, sized.width / 10));
    const p = frame.p;
    for (let k = -5; k <= 5; k += 1) {
      const a = transformed([k, -6], state.lambda, state.zero);
      const b = transformed([k, 6], state.lambda, state.zero);
      const c = transformed([-6, k], state.lambda, state.zero);
      const d = transformed([6, k], state.lambda, state.zero);
      lineWorld(sized.ctx, frame, a, b, p.accent, 1);
      lineWorld(sized.ctx, frame, c, d, p.coral, 1);
    }
    const O = transformed([0, 0], state.lambda, state.zero);
    const e1 = transformed([1, 0], state.lambda, state.zero);
    const e2 = transformed([0, 1], state.lambda, state.zero);
    const sum = transformed([1, 1], state.lambda, state.zero);
    if (!state.zero) polygonWorld(sized.ctx, frame, [O, e1, sum, e2], p.accent, p.accentStrong, .13);
    M().drawArrow(sized.ctx, frame, e1, p.accentStrong, "Ae₁", 2.2, { labelT: .88, labelOffset: -14 });
    M().drawArrow(sized.ctx, frame, e2, p.coral, "Ae₂", 2.2, { labelT: .76, labelOffset: 15 });
    if (state.zero) M().drawPoint(sized.ctx, frame, [0, 0], TARGET, "所有输入都到 0", 5);
  }

  function drawSolvability(canvas, state) {
    const sized = M().sizeCanvas(canvas);
    if (!sized) return;
    const frame = M().drawAxes(sized.ctx, sized.width, sized.height, Math.min(52, sized.width / 9));
    const p = frame.p;
    const a = [2, 1];
    const len = Math.hypot(...a);
    const n = [-a[1] / len, a[0] / len];
    const projection = [2.4, 1.2];
    const b = [projection[0] + state.distance * n[0], projection[1] + state.distance * n[1]];
    lineThrough(sized.ctx, frame, a, p.accent, 3.2);
    M().drawArrow(sized.ctx, frame, [1.35, .675], p.accentStrong, "a₁", 2.1, { labelT: .72, labelOffset: 10 });
    lineWorld(sized.ctx, frame, projection, b, p.coral, 1.4, [5, 5]);
    M().drawArrow(sized.ctx, frame, b, TARGET, "b", 2.3, { labelT: 1, labelOffset: 7 });
    if (Math.abs(state.distance) > .025) {
      M().drawPoint(sized.ctx, frame, projection, p.accentStrong, "列空间点", 3.3);
      labelPx(sized.ctx, `不可达分量 ${format(Math.abs(state.distance))}`, sized.width - 15, 24, p.coral, "right");
    }
    labelPx(sized.ctx, "Col(A)", 15, 24, p.accentStrong);
  }

  function drawSolution(canvas, state) {
    const sized = M().sizeCanvas(canvas);
    if (!sized) return;
    const { ctx, width, height } = sized;
    const p = M().palette();
    const compact = width < 520;
    const gap = compact ? 22 : 38;
    const leftW = compact ? width * .62 : width * .65;
    const left = miniFrame(ctx, width, height, 0, 28, leftW, height - 48, p, Math.min(44, leftW / 8));
    const rightX = leftW + gap;
    const right = miniFrame(ctx, width, height, rightX, 28, Math.max(80, width - rightX), height - 48, p, Math.min(38, Math.max(80, width - rightX) / 5));
    labelPx(ctx, "输入空间", 13, 18, p.muted, "left", 650);
    labelPx(ctx, "输出空间", rightX, 18, p.muted, "left", 650);
    const x0 = [-1.45, .55];
    const eta = [1.05, .95];
    const x = [x0[0] + state.s * eta[0], x0[1] + state.s * eta[1]];
    const lineA = [x0[0] - 5 * eta[0], x0[1] - 5 * eta[1]];
    const lineB = [x0[0] + 5 * eta[0], x0[1] + 5 * eta[1]];
    lineWorld(ctx, left, lineA, lineB, p.coral, 2.2);
    M().drawArrow(ctx, left, x0, p.accentStrong, "x₀", 2.1, { labelT: .92, labelOffset: -8 });
    M().drawArrowBetween(ctx, left, x0, x, p.coral, "", 2.1);
    M().drawArrow(ctx, left, x, TARGET, "", 2.3);
    const xPixel = M().toCanvas(left, x);
    const midPixel = M().toCanvas(left, [(x0[0] + x[0]) / 2, (x0[1] + x[1]) / 2]);
    labelPx(ctx, "sη", Math.max(14, Math.min(leftW - 22, midPixel[0])), Math.max(45, Math.min(height - 20, midPixel[1] - 11)), p.coral, "center");
    labelPx(ctx, "x(s)", Math.max(14, Math.min(leftW - 28, xPixel[0] + 11)), Math.max(45, Math.min(height - 20, xPixel[1] - 10)), TARGET);
    const b = [0, 1.45];
    M().drawArrow(ctx, right, b, p.accentStrong, "b", 2.3, { labelT: 1, labelOffset: 5 });
    ctx.save();
    ctx.strokeStyle = p.line;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    const from = M().toCanvas(left, x);
    const to = M().toCanvas(right, b);
    ctx.moveTo(from[0] + 9, from[1]);
    ctx.bezierCurveTo(leftW + 6, from[1], rightX - 8, to[1], to[0] - 9, to[1]);
    ctx.stroke();
    ctx.restore();
    labelPx(ctx, "A", leftW + gap / 2, height / 2, p.accentStrong, "center");
  }

  function drawHigherDegree(canvas, state) {
    const sized = M().sizeCanvas(canvas);
    if (!sized) return;
    const frame = M().drawAxes(sized.ctx, sized.width, sized.height, Math.min(63, sized.width / 8));
    const p = frame.p;
    const ctx = sized.ctx;
    ctx.save();
    ctx.strokeStyle = p.accentStrong;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(frame.cx, frame.cy, frame.scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    M().drawLineEquation(ctx, frame, 1, -1, 0, p.coral, 2.2);
    const r = Math.SQRT1_2;
    const points = [[r, r], [-r, -r]];
    points.forEach((point, index) => {
      M().drawPoint(ctx, frame, point, TARGET, `P${index + 1}`, 4.2);
      if (state.step >= 1) lineWorld(ctx, frame, point, [point[0], 0], p.muted, 1.2, [5, 5]);
      if (state.step >= 1) M().drawPoint(ctx, frame, [point[0], 0], p.coral, "", 3.3);
    });
    if (state.step >= 2) labelPx(ctx, "R(x)=2x²−1", sized.width - 15, 24, p.accentStrong, "right");
    if (state.step >= 3) labelPx(ctx, "✓ 两个候选均通过原方程", sized.width - 15, sized.height - 18, p.accentStrong, "right");
  }

  function textFor(sectionId, state) {
    if (sectionId === "elimination") {
      return [
        ["共同交点", "先把解看成几何对象。两个约束的公共点 (2,1) 是后续所有等价方程组必须保留的对象。", String.raw`\begin{cases}x+y=3\\x+2y=4\end{cases}`, "行变换沿整条计算路径保持共同解集。"],
        ["可逆地改写约束", "用 R₂←R₂−R₁ 把第二个约束改写成 y=1。灰色虚线保留旧直线作对照，新旧约束都经过同一个解。", String.raw`R_2\leftarrow R_2-R_1`, "操作可逆，因此没有丢掉解，也没有制造新解。"],
        ["阶梯形暴露顺序", "新方程 y=1 先确定 y，再把它代回 x+y=3 得到 x=2。阶梯形只是在安排求解顺序。", String.raw`\left[\begin{array}{cc|c}1&1&3\\0&1&1\end{array}\right]`, "两个主元、没有自由变量，所以解唯一。"],
      ][state.step];
    }
    if (sectionId === "n-vector-space") {
      const x = 2.1 * state.alpha - .65 * state.beta;
      const y = 1.05 * state.alpha + 1.75 * state.beta;
      return ["系数决定组合权重", "绿色段是 αu；橙色段从它的终点出发，表示 βv；蓝色箭头连接原点与最终终点。把 u、v 作为矩阵的列时，(α,β)ᵀ 就是系数向量。", String.raw`\alpha u+\beta v=\begin{bmatrix}${format(x)}\\${format(y)}\end{bmatrix}`, "高维情形仍逐坐标计算；画布只显示投影，右侧坐标列保存完整结果。"];
    }
    if (sectionId === "linear-dependence") {
      return [
        ["一个方向", "v₁ 的所有倍数都留在同一条过原点的直线上。系数可以连续变化，但可达方向只有一个。", String.raw`\operatorname{span}(v_1)`, "加入第一个非零向量，span 的维数是 1。"],
        ["新方向扩张空间", "v₂ 不在原直线上。现在 a v₁+b v₂ 的两个系数能独立变化，平面中的点都可由这两条方向组合得到。", String.raw`\dim\operatorname{span}(v_1,v_2)=2`, "第二个独立方向让 span 从直线扩成平面。"],
        ["表示重复产生零关系", "蓝色 v₃ 已能沿绿色、橙色两段合成。同一个 v₃ 既可直接取系数 1，也可用 v₁、v₂ 的系数表示。", String.raw`0.7v_1+0.55v_2-v_3=0`, "这条非平凡关系证明向量组相关；删去 v₃ 不改变 span。"],
      ][state.step];
    }
    if (sectionId === "matrix-rank") {
      const rank = state.zero ? 0 : state.lambda < .025 ? 1 : 2;
      const formula = state.zero ? String.raw`A=0\quad\Rightarrow\quad\operatorname{rank}(A)=0` : String.raw`A_\lambda=\begin{bmatrix}1&0.65\\0&${format(state.lambda)}\end{bmatrix}`;
      return ["输出维数", state.zero ? "所有输入方向都被压到原点，没有任何输出方向留下。" : state.lambda < .025 ? "两列共线，整张二维网格被压到一条直线上。" : "两个输出方向仍不共线，单位方格具有非零面积。", formula, `当前输出空间维数为 ${rank}，所以 rank(A)=${rank}。`];
    }
    if (sectionId === "solvability") {
      const on = Math.abs(state.distance) < .025;
      return [on ? "目标落在列空间中" : "目标带来新方向", on ? "b 与绿色可达直线重合，存在系数 x 使 Ax=b。" : "b 含有当前列向量无法生成的偏离分量；因此没有任何系数组合能到达它。", String.raw`${on ? "b\\in\\operatorname{Col}(A)" : "b\\notin\\operatorname{Col}(A)"}`, on ? "增广列没有增加秩，方程组有解。" : "增广列增加了秩，方程组无解。"];
    }
    if (sectionId === "solution-structure") {
      return ["一整条仿射解集", "x₀ 是一个已知特解；橙色位移 sη 落在零空间中。移动滑杆只改变输入位置，不改变右侧输出。", String.raw`x=x_0+${format(state.s)}\eta`, "因为 Aη=0，所以 A(x₀+sη)=b 对任意 s 都成立。"];
    }
    return [
        ["先看原问题", "联立方程的解是单位圆 x²+y²=1 与直线 y=x 的公共点。几何对象先于消元过程。", String.raw`\begin{cases}x^2+y^2=1\\y=x\end{cases}`, "图上可见两个交点，但严格求解仍需代数步骤。"],
      ["把交点投影成候选", "消去 y 相当于只保留每个交点的横坐标；虚线把二维公共点投影到 x 轴。", String.raw`\exists y:\ f(x,y)=g(x,y)=0`, "投影会丢掉 y 信息，因此得到的只是候选横坐标。"],
      ["结式生成一元条件", "把两式关于 y 的公共根条件编码成结式，得到只含 x 的多项式。", String.raw`R(x)=2x^2-1`, "R(x)=0 给出 x=±√2/2，但还没有重新确认 y。"],
      ["回到原方程核验", "由 y=x 恢复纵坐标，再把两个候选点代回圆方程；两式都为零。", String.raw`\begin{aligned}(x,y)&=(\frac{\sqrt2}{2},\frac{\sqrt2}{2})\\&=(-\frac{\sqrt2}{2},-\frac{\sqrt2}{2})\end{aligned}`, "消元负责缩小候选集，回代负责确认真正的公共解。"],
    ][state.step];
  }

  const drawers = {
    elimination: drawElimination,
    "n-vector-space": drawVector,
    "linear-dependence": drawDependence,
    "matrix-rank": drawRank,
    solvability: drawSolvability,
    "solution-structure": drawSolution,
    "binary-higher-degree": drawHigherDegree,
  };

  function mountGeometry(section, root) {
    const config = lessons[section.id];
    if (!config) return null;
    const interactive = root.querySelector(`#${CSS.escape(section.id)}-interactive`);
    const lab = interactive?.querySelector(".ch3-lab");
    if (!interactive || !lab || root.querySelector("[data-ch3-geometry]")) return null;

    const scope = M().createScope(root);
    const state = { step: 0, alpha: 1, beta: .8, lambda: 1, zero: false, distance: 0, s: .7 };
    const sectionNode = document.createElement("section");
    sectionNode.className = "ch3-geometry-section";
    sectionNode.dataset.ch3Geometry = section.id;
    sectionNode.innerHTML = `<h2>几何直觉</h2><div class="ch3-geometry">
      <header class="ch3-geometry-head"><span class="ch3-geometry-kicker">${esc(config.kicker)}</span><h3>${esc(config.title)}</h3><p>${esc(config.intro)}</p></header>
      <div class="ch3-geometry-controls" data-geo-controls aria-label="可视化控制"></div>
      <div class="ch3-geometry-body">
        <figure class="ch3-geometry-figure"><canvas class="ch3-geometry-canvas" data-geo-canvas aria-label="${esc(config.aria)}"></canvas><figcaption data-geo-caption></figcaption></figure>
        <aside class="ch3-geometry-insight" aria-live="polite"><span data-geo-kicker></span><h4 data-geo-heading></h4><p data-geo-copy></p><div class="ch3-geometry-formula" data-geo-formula></div><div class="ch3-geometry-result" data-geo-result></div><div class="ch3-geometry-legend"><span><i></i>已有结构</span><span><i style="--legend-color:var(--coral)"></i>第二方向 / 变化</span><span><i style="--legend-color:var(--blue)"></i>目标 / 当前对象</span></div></aside>
      </div>
    </div>`;

    const details = document.createElement("details");
    details.className = "ch3-precision";
    const summary = document.createElement("summary");
    summary.innerHTML = `<span><strong>${esc(config.precisionTitle)}</strong><small>${esc(config.precisionNote)}</small></span><i aria-hidden="true">＋</i>`;
    lab.replaceWith(details);
    details.append(summary, lab);
    const formal = root.querySelector(`#${CSS.escape(section.id)}-formal`);
    if (formal) formal.before(sectionNode);
    else interactive.prepend(sectionNode);
    const heading = interactive.querySelector(":scope > h2");
    if (heading) heading.textContent = "进一步计算";

    const controls = sectionNode.querySelector("[data-geo-controls]");
    const canvas = sectionNode.querySelector("[data-geo-canvas]");

    function bindControls() {
      controls.innerHTML = controlsHtml(config, state);
      controls.querySelectorAll("[data-geo-step]").forEach((button) => scope.listen(button, "click", () => {
        state.step = Number(button.dataset.geoStep);
        render(true);
      }));
      controls.querySelectorAll("[data-geo-range]").forEach((input) => scope.listen(input, "input", () => {
        state[input.dataset.geoRange] = Number(input.value);
        if (input.dataset.geoRange === "lambda") state.zero = false;
        render(false);
      }));
      controls.querySelectorAll("[data-rank-preset]").forEach((button) => scope.listen(button, "click", () => {
        const mode = button.dataset.rankPreset;
        state.zero = mode === "point";
        state.lambda = mode === "plane" ? 1 : 0;
        render(true);
      }));
      controls.querySelectorAll("[data-solvable-preset]").forEach((button) => scope.listen(button, "click", () => {
        state.distance = button.dataset.solvablePreset === "on" ? 0 : 1.15;
        render(true);
      }));
      controls.querySelectorAll("[data-solution-preset]").forEach((button) => scope.listen(button, "click", () => {
        state.s = Number(button.dataset.solutionPreset);
        render(true);
      }));
    }

    function updateControlState() {
      controls.querySelectorAll("[data-geo-output]").forEach((output) => { output.textContent = format(state[output.dataset.geoOutput]); });
      controls.querySelectorAll("[data-geo-range]").forEach((input) => { input.value = state[input.dataset.geoRange]; });
      controls.querySelectorAll("[data-geo-step]").forEach((button) => {
        const active = Number(button.dataset.geoStep) === state.step;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      controls.querySelectorAll("[data-rank-preset]").forEach((button) => {
        const mode = state.zero ? "point" : state.lambda < .025 ? "line" : "plane";
        button.classList.toggle("is-active", button.dataset.rankPreset === mode);
      });
      controls.querySelectorAll("[data-solvable-preset]").forEach((button) => button.classList.toggle("is-active", button.dataset.solvablePreset === (Math.abs(state.distance) < .025 ? "on" : "off")));
      controls.querySelectorAll("[data-solution-preset]").forEach((button) => button.classList.toggle("is-active", Math.abs(Number(button.dataset.solutionPreset) - state.s) < .001));
    }

    function render(rebuild = false) {
      if (rebuild) bindControls();
      updateControlState();
      const copy = textFor(section.id, state);
      sectionNode.querySelector("[data-geo-kicker]").textContent = config.kicker.split(" · ")[0];
      sectionNode.querySelector("[data-geo-heading]").textContent = copy[0];
      sectionNode.querySelector("[data-geo-copy]").textContent = copy[1];
      sectionNode.querySelector("[data-geo-formula]").innerHTML = M().texD(copy[2]);
      sectionNode.querySelector("[data-geo-result]").textContent = copy[3];
      const caption = Array.isArray(config.caption) ? config.caption[state.step] : config.caption;
      sectionNode.querySelector("[data-geo-caption]").textContent = caption;
      drawers[section.id](canvas, state);
    }

    scope.listen(details, "toggle", () => { summary.querySelector("i").textContent = details.open ? "−" : "＋"; });
    scope.resize(() => drawers[section.id](canvas, state));
    bindControls();
    render(false);
    return scope.cleanup;
  }

  window.defineChapter3LessonEnhancer?.(mountGeometry);
})();
