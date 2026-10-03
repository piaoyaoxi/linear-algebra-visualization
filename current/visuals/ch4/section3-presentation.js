(() => {
  const SECTION_ID = "matrix-product-determinant-rank";
  const mathInline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const mathDisplay = (source) => (window.texDisplay ? window.texDisplay(source) : `<code>${source}</code>`);

  const I = [[1, 0], [0, 1]];
  const PRODUCT_A = [[2, 0], [0, 1]];
  const PRODUCT_B = [[1, 1], [0, 1]];
  const PRODUCT_AB = [[2, 2], [0, 1]];
  const PRODUCT_BA = [[2, 1], [0, 1]];
  // B crushes the whole plane onto the line y = x (rank 1)
  const BOTTLENECK_B = [[1, -1], [1, -1]];

  const canvasMatrices = new WeakMap();
  const canvasFrames = new WeakMap();
  const canvasOptions = new WeakMap();
  let activeRoot = null;
  let activeResizeObserver = null;
  let activeThemeObserver = null;
  let redrawFrame = 0;

  const cloneMatrix = (matrix) => matrix.map((row) => [...row]);
  const determinant = (matrix) => matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  const multiply = (left, right) => [
    [left[0][0] * right[0][0] + left[0][1] * right[1][0], left[0][0] * right[0][1] + left[0][1] * right[1][1]],
    [left[1][0] * right[0][0] + left[1][1] * right[1][0], left[1][0] * right[0][1] + left[1][1] * right[1][1]],
  ];
  const interpolateMatrix = (from, to, t) => from.map((row, i) => row.map((value, j) => value + (to[i][j] - value) * t));
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2);
  const reducedMotion = () => Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);

  function rank2(matrix) {
    const eps = 1e-6;
    if (Math.abs(determinant(matrix)) > eps) return 2;
    return matrix.flat().some((value) => Math.abs(value) > eps) ? 1 : 0;
  }

  function formatNumber(value) {
    const safe = Math.abs(value) < 5e-4 ? 0 : value;
    const rounded = Math.round(safe * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  }

  function matrixTex(matrix) {
    return `\\begin{bmatrix}${matrix.map((row) => row.map(formatNumber).join("&")).join("\\\\")}\\end{bmatrix}`;
  }

  function matrixGrid(matrix, className = "") {
    return `<span class="s3-matrix ${className}" style="--s3-cols:${matrix[0].length}">${matrix
      .flatMap((row) => row.map((value) => `<i>${formatNumber(value).replace("-", "−")}</i>`))
      .join("")}</span>`;
  }

  function getPalette() {
    const style = getComputedStyle(document.body);
    return {
      surface: style.getPropertyValue("--surface-solid").trim() || "#ffffff",
      surfaceSoft: style.getPropertyValue("--surface-soft").trim() || "#f2f7f5",
      text: style.getPropertyValue("--text").trim() || "#071512",
      muted: style.getPropertyValue("--muted").trim() || "#5f6965",
      line: style.getPropertyValue("--line-strong").trim() || "rgba(21,52,45,.22)",
      accent: style.getPropertyValue("--accent").trim() || "#2c5e4a",
      accentStrong: style.getPropertyValue("--accent-strong").trim() || "#1f4a39",
      coral: style.getPropertyValue("--coral").trim() || "#c4552f",
      blue: style.getPropertyValue("--blue").trim() || "#2a64a8",
      paper: style.getPropertyValue("--cv-paper").trim() || "#fdfcf8",
      axis: style.getPropertyValue("--cv-axis").trim() || "#8a8d84",
      v1: style.getPropertyValue("--cv-v1").trim() || "#2a64a8",
      v2: style.getPropertyValue("--cv-v2").trim() || "#c4552f",
      image: style.getPropertyValue("--cv-image").trim() || "#8c4f86",
    };
  }

  function setupCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const dpr = window.devicePixelRatio || 1;
    const pixelWidth = Math.max(1, Math.round(width * dpr));
    const pixelHeight = Math.max(1, Math.round(height * dpr));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return { ctx, width, height };
  }

  function drawLine(ctx, from, to, color, width = 1, alpha = 1) {
    if (![from.x, from.y, to.x, to.y].every(Number.isFinite)) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.restore();
  }

  function drawArrow(ctx, from, to, color, label, width = 3) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy);
    if (length < 3) return;
    const angle = Math.atan2(dy, dx);
    const head = Math.min(11, Math.max(7, length * 0.16));
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - head * Math.cos(angle - Math.PI / 6), to.y - head * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(to.x - head * Math.cos(angle + Math.PI / 6), to.y - head * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    if (label) {
      ctx.font = "700 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      ctx.fillText(label, to.x + 8, to.y - 8);
    }
    ctx.restore();
  }

  function drawTransformScene(canvas, matrix, options = {}) {
    canvasMatrices.set(canvas, cloneMatrix(matrix));
    canvasOptions.set(canvas, options);
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const origin = { x: width * 0.5, y: height * 0.55 };
    const scale = Math.min(width, height) / 8.4;
    const reachX = width / (2 * scale) + 1;
    const reachY = height / (2 * scale) + 1;
    const point = (x, y, transformed = false) => {
      const px = transformed ? matrix[0][0] * x + matrix[0][1] * y : x;
      const py = transformed ? matrix[1][0] * x + matrix[1][1] * y : y;
      return { x: origin.x + px * scale, y: origin.y - py * scale };
    };

    ctx.fillStyle = palette.paper;
    ctx.fillRect(0, 0, width, height);

    for (let i = Math.floor(-reachY); i <= Math.ceil(reachY); i += 1) {
      drawLine(ctx, point(-reachX, i), point(reachX, i), palette.axis, i === 0 ? 1.2 : 1, i === 0 ? 0.26 : 0.08);
    }
    for (let i = Math.floor(-reachX); i <= Math.ceil(reachX); i += 1) {
      drawLine(ctx, point(i, -reachY), point(i, reachY), palette.axis, i === 0 ? 1.2 : 1, i === 0 ? 0.26 : 0.08);
    }

    const columnLengths = [Math.hypot(matrix[0][0], matrix[1][0]), Math.hypot(matrix[0][1], matrix[1][1])];
    const nonZero = Math.max(...columnLengths) > 1e-7;
    const minLength = Math.max(Math.min(...columnLengths.filter((value) => value > 1e-7)), 0.15);
    const domain = Math.min(45, Math.max(10, Math.hypot(reachX, reachY) / minLength + 2));
    if (nonZero) {
      for (let i = -Math.ceil(domain); i <= Math.ceil(domain); i += 1) {
        drawLine(ctx, point(-domain, i, true), point(domain, i, true), palette.image, i === 0 ? 1.4 : 1.05, i === 0 ? 0.5 : 0.2);
        drawLine(ctx, point(i, -domain, true), point(i, domain, true), palette.image, i === 0 ? 1.4 : 1.05, i === 0 ? 0.5 : 0.2);
      }
    }

    const p00 = point(0, 0, true);
    const p10 = point(1, 0, true);
    const p11 = point(1, 1, true);
    const p01 = point(0, 1, true);
    const signedArea = determinant(matrix);
    if (Math.abs(signedArea) > 1e-5) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p00.x, p00.y);
      ctx.lineTo(p10.x, p10.y);
      ctx.lineTo(p11.x, p11.y);
      ctx.lineTo(p01.x, p01.y);
      ctx.closePath();
      /* the cell is a result (purple); a reversed orientation is drawn dashed */
      ctx.fillStyle = palette.image;
      ctx.globalAlpha = signedArea > 0 ? 0.12 : 0.07;
      ctx.fill();
      ctx.globalAlpha = 0.8;
      if (signedArea < 0) ctx.setLineDash([6, 4]);
      ctx.strokeStyle = palette.image;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.restore();
    }

    // ghost of an earlier state: same colours, dashed, 35% alpha
    if (options.ghost) {
      const g = options.ghost;
      const gp = (x, y) => ({ x: origin.x + (g[0][0] * x + g[0][1] * y) * scale, y: origin.y - (g[1][0] * x + g[1][1] * y) * scale });
      const col = Math.hypot(g[0][0], g[1][0]) > 1e-7 ? [g[0][0], g[1][0]] : [g[0][1], g[1][1]];
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.setLineDash([6, 5]);
      if (rank2(g) === 1) {
        // the line B crushed the plane onto
        const k = 40 / Math.hypot(col[0], col[1]);
        drawLine(ctx, { x: origin.x - col[0] * k * scale, y: origin.y + col[1] * k * scale }, { x: origin.x + col[0] * k * scale, y: origin.y - col[1] * k * scale }, palette.image, 1.6, 0.35);
      }
      drawArrow(ctx, origin, gp(1, 0), palette.v1, options.ghostLabels?.[0] ?? "", 2.2);
      drawArrow(ctx, origin, gp(0, 1), palette.v2, options.ghostLabels?.[1] ?? "", 2.2);
      ctx.restore();
    }

    const firstEnd = point(1, 0, true);
    const secondEnd = point(0, 1, true);
    drawArrow(ctx, origin, firstEnd, palette.v1, options.firstLabel ?? "第 1 列", 3.1);
    drawArrow(ctx, origin, secondEnd, palette.v2, options.secondLabel ?? "第 2 列", 3.1);

    ctx.save();
    ctx.fillStyle = palette.text;
    ctx.globalAlpha = 0.72;
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, nonZero ? 3.2 : 4.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    canvas._s3Geometry = { origin, scale, firstEnd, secondEnd };
  }

  function cancelCanvasAnimation(canvas) {
    const frame = canvasFrames.get(canvas);
    if (frame) cancelAnimationFrame(frame);
    canvasFrames.delete(canvas);
  }

  function animateCanvasTo(canvas, target, options = {}) {
    cancelCanvasAnimation(canvas);
    const from = cloneMatrix(canvasMatrices.get(canvas) || I);
    const duration = reducedMotion() ? 0 : options.duration ?? 620;
    if (duration <= 0) {
      drawTransformScene(canvas, target, options.drawOptions);
      options.onUpdate?.(target, 1);
      return Promise.resolve(target);
    }
    const start = performance.now();
    return new Promise((resolve) => {
      const frame = (now) => {
        if (!activeRoot?.isConnected) {
          canvasFrames.delete(canvas);
          resolve(canvasMatrices.get(canvas) || target);
          return;
        }
        const t = Math.min(1, (now - start) / duration);
        const current = interpolateMatrix(from, target, easeInOutCubic(t));
        drawTransformScene(canvas, current, options.drawOptions);
        options.onUpdate?.(current, t);
        if (t < 1) {
          const id = requestAnimationFrame(frame);
          canvasFrames.set(canvas, id);
          return;
        }
        canvasFrames.delete(canvas);
        drawTransformScene(canvas, target, options.drawOptions);
        options.onUpdate?.(target, 1);
        resolve(target);
      };
      const id = requestAnimationFrame(frame);
      canvasFrames.set(canvas, id);
    });
  }

  function miniShape(matrix, label) {
    const points = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([x, y]) => [matrix[0][0] * x + matrix[0][1] * y, matrix[1][0] * x + matrix[1][1] * y]);
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    const minX = Math.min(-0.25, ...xs) - 0.2;
    const maxX = Math.max(1.25, ...xs) + 0.2;
    const minY = Math.min(-0.25, ...ys) - 0.2;
    const maxY = Math.max(1.25, ...ys) + 0.2;
    const width = maxX - minX;
    const height = maxY - minY;
    const map = ([x, y]) => `${24 + ((x - minX) / width) * 132},${142 - ((y - minY) / height) * 112}`;
    return `<svg viewBox="0 0 180 160" role="img" aria-label="${label}">
      <path class="s3-mini-axis" d="M18 142H164M24 150V14"></path>
      <polygon class="s3-mini-shape" points="${points.map(map).join(" ")}"></polygon>
      <line class="s3-mini-first" x1="${map([0, 0]).split(",")[0]}" y1="${map([0, 0]).split(",")[1]}" x2="${map(points[1]).split(",")[0]}" y2="${map(points[1]).split(",")[1]}"></line>
      <line class="s3-mini-second" x1="${map([0, 0]).split(",")[0]}" y1="${map([0, 0]).split(",")[1]}" x2="${map(points[3]).split(",")[0]}" y2="${map(points[3]).split(",")[1]}"></line>
    </svg>`;
  }

  function renderFormal(formal) {
    if (!formal) return;
    formal.innerHTML = `
      <h2>先分清两个问题：面积倍率与独立方向</h2>
      <div class="s3-formal">
        <p class="s3-lead">两列张成的平行四边形同时回答两个问题：行列式给出面积倍率和方向是否翻转，秩给出输出还剩几个独立方向。</p>

        <section class="s3-formal-module" aria-labelledby="s3-two-meters-title">
          <div class="s3-module-heading"><span>01</span><div><h3 id="s3-two-meters-title">同一张图，两个仪表</h3><p>行列式和秩会在坍缩处相遇，但它们记录的信息不同。</p></div></div>
          <div class="s3-two-meters">
            <article><span>连续量</span><strong>行列式</strong>${mathDisplay("\\det(A)=ad-bc")}<p>绝对值连续记录面积倍率；符号记录两列的方向顺序。</p></article>
            <article><span>离散量</span><strong>秩</strong>${mathDisplay("\\operatorname{rank}(A)\\in\\{0,1,2\\}")}<p>二维输出是平面、直线还是一个点。秩只在临界状态跳变。</p></article>
          </div>
          <div class="s3-sign-strip">
            <div><i class="is-positive"></i><strong>det &gt; 0</strong><span>面积保留方向</span></div>
            <div><i class="is-negative"></i><strong>det &lt; 0</strong><span>面积保留但方向翻转</span></div>
            <div><i class="is-zero"></i><strong>det = 0</strong><span>平面坍缩，秩下降</span></div>
          </div>
        </section>

        <section class="s3-formal-module" aria-labelledby="s3-det-one-title">
          <div class="s3-module-heading"><span>02</span><div><h3 id="s3-det-one-title">det(A)=1 只说明面积不变</h3><p>单位矩阵、剪切和互补缩放可以拥有同一个行列式。</p></div></div>
          <div class="s3-det-one-gallery">
            <article>${miniShape([[1, 0], [0, 1]], "单位矩阵保持单位正方形")}<strong>单位矩阵</strong>${mathInline("\\det(I)=1")}<p>形状与面积都不变。</p></article>
            <article>${miniShape([[1, 0.8], [0, 1]], "剪切保持面积但改变形状")}<strong>剪切</strong>${mathInline("\\det(S)=1")}<p>形状改变，面积仍为 1。</p></article>
            <article>${miniShape([[2, 0], [0, 0.5]], "一方向放大另一方向缩小")}<strong>互补缩放</strong>${mathInline("\\det(D)=1")}<p>宽度乘 2，高度乘 1/2。</p></article>
          </div>
        </section>

        <section class="s3-formal-module" aria-labelledby="s3-laws-title">
          <div class="s3-module-heading"><span>03</span><div><h3 id="s3-laws-title">乘积的两条主线</h3><p>面积倍率可以累积；独立方向受到最窄一步的限制。</p></div></div>
          <div class="s3-law-pair">
            <article><span>面积计量</span>${mathDisplay("\\det(AB)=\\det(A)\\det(B)")}<p>先经过 B，再经过 A；单位面积依次乘上两个缩放因子。</p></article>
            <article><span>方向瓶颈</span>${mathDisplay("\\operatorname{rank}(AB)\\leq\\min\\{\\operatorname{rank}(A),\\operatorname{rank}(B)\\}")}<p>一旦输出被压到直线，后面的线性变换只能移动或继续压缩这条直线。</p></article>
          </div>
          <div class="s3-invertible-note">
            <strong>可逆因子不会成为瓶颈</strong>
            <p>${mathInline("A")} 可逆时，${mathInline("\\operatorname{rank}(AB)=\\operatorname{rank}(B)")}；${mathInline("B")} 可逆时，${mathInline("\\operatorname{rank}(AB)=\\operatorname{rank}(A)")}。</p>
          </div>
        </section>

        <section class="s3-formal-module" aria-labelledby="s3-row-column-title">
          <div class="s3-module-heading"><span>04</span><div><h3 id="s3-row-column-title">行秩与列秩是同一个数</h3><p>转置会交换行与列，却不会改变独立方向的数量。</p></div></div>
          <div class="s3-transpose-rank" data-s3-transpose-rank>
            <div class="s3-transpose-matrix" data-s3-transpose-matrix>${matrixGrid([[1, 0, 1], [0, 1, 1]])}</div>
            <button type="button" data-s3-transpose-toggle>转置</button>
            <div class="s3-transpose-copy"><strong data-s3-transpose-name>M 是 2 × 3</strong><p data-s3-transpose-text>两行独立；三列中第三列是前两列之和。行秩与列秩都等于 2。</p></div>
          </div>
          <div class="s3-rank-equality">${mathDisplay("\\operatorname{rank}(M^T)=\\operatorname{rank}(M)")}</div>
        </section>
      </div>
    `;
    bindTransposeRank(formal);
  }

  function bindTransposeRank(root) {
    const lab = root.querySelector("[data-s3-transpose-rank]");
    if (!lab) return;
    const original = [[1, 0, 1], [0, 1, 1]];
    const transposed = [[1, 0], [0, 1], [1, 1]];
    let flipped = false;
    const paint = () => {
      const matrix = flipped ? transposed : original;
      lab.querySelector("[data-s3-transpose-matrix]").innerHTML = matrixGrid(matrix);
      lab.querySelector("[data-s3-transpose-name]").textContent = flipped ? "Mᵀ 是 3 × 2" : "M 是 2 × 3";
      lab.querySelector("[data-s3-transpose-text]").textContent = flipped
        ? "原来的列成为行，原来的行成为列；独立方向数仍是 2。"
        : "两行独立；三列中第三列是前两列之和。行秩与列秩都等于 2。";
      lab.querySelector("[data-s3-transpose-toggle]").textContent = flipped ? "转置回 M" : "转置";
      lab.classList.toggle("is-transposed", flipped);
    };
    lab.querySelector("[data-s3-transpose-toggle]")?.addEventListener("click", () => {
      flipped = !flipped;
      paint();
    });
    paint();
  }

  function renderInteractive(interactive) {
    if (!interactive) return;
    interactive.innerHTML = `
      <h2>交互实验</h2>
      <div class="s3-lab" data-s3-lab>
        <div class="s3-lab-heading">
          <div><h3>连续作用两个矩阵</h3><p>先作用 B，再作用 A，合起来就是 AB。“面积倍率”看面积怎样累积，“丢掉的方向”看压扁之后还能不能恢复。</p></div>
        </div>
        <div class="s3-tabs" role="tablist" aria-label="第三节实验视角">
          <button type="button" role="tab" class="is-active" aria-selected="true" data-s3-tab="product">面积倍率</button>
          <button type="button" role="tab" aria-selected="false" data-s3-tab="bottleneck">丢掉的方向</button>
        </div>

        <div class="s3-panels">
          <section class="s3-panel is-active" role="tabpanel" data-s3-panel="product">
            <div class="s3-product-lab" data-s3-product-lab>
              <div data-s3-product-gate></div>
              <div class="s3-product-actions">
                <button type="button" class="button primary is-primary" data-s3-product-play>同步播放 AB 与 BA</button>
                <button type="button" class="button" data-s3-product-reset>重置</button>
              </div>
              <p class="s3-product-given">${mathInline("A=\\begin{bmatrix}2&0\\\\0&1\\end{bmatrix}")}（横向拉伸 2 倍），${mathInline("B=\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}")}（剪切）。</p>
              <div class="s3-product-grid">
                <article class="s3-canvas-card"><div class="s3-stage-top"><strong>AB：先 B 后 A</strong><span data-s3-ab-stage>单位正方形</span></div><canvas data-s3-ab-canvas aria-label="AB 的连续面积变换"></canvas></article>
                <article class="s3-canvas-card"><div class="s3-stage-top"><strong>BA：先 A 后 B</strong><span data-s3-ba-stage>单位正方形</span></div><canvas data-s3-ba-canvas aria-label="BA 的连续面积变换"></canvas></article>
              </div>
              <div class="s3-area-meter" data-s3-product-answer hidden>
                <div><span>起点</span><strong>1</strong><small>单位正方形面积</small></div><i>×</i>
                <div><span>det(B)</span><strong>1</strong><small>剪切保持面积</small></div><i>×</i>
                <div><span>det(A)</span><strong>2</strong><small>横向拉伸两倍</small></div><i>=</i>
                <div class="is-result"><span>最终面积</span><strong>2</strong><small>AB 与 BA 相同</small></div>
              </div>
              <div class="s3-product-conclusion" data-s3-product-answer hidden>
                <div>${mathDisplay("\\det(AB)=\\det A\\cdot\\det B=2")}</div>
                <div>${mathDisplay("\\det(BA)=\\det B\\cdot\\det A=2")}</div>
                <p>两种顺序得到的平行四边形不同，面积倍率却相同：每一步的倍率依次相乘。</p>
              </div>
            </div>
          </section>

          <section class="s3-panel" role="tabpanel" data-s3-panel="bottleneck" hidden>
            <div class="s3-bottleneck-lab" data-s3-bottleneck-lab>
              <div data-s3-bottleneck-gate></div>
              <div class="s3-bottleneck-controls" role="group" aria-label="选择第二步矩阵 A">
                <button type="button" data-s3-bottleneck="shear">剪切</button>
                <button type="button" data-s3-bottleneck="rotate">旋转 90°</button>
                <button type="button" data-s3-bottleneck="stretch">纵向拉伸</button>
                <button type="button" data-s3-bottleneck="kill">把 y=x 压到 0</button>
              </div>
              <div class="s3-bottleneck-flow">
                <article class="s3-canvas-card"><div class="s3-stage-top"><strong>第一步：B</strong><span>平面 → 直线 y=x</span></div><canvas data-s3-b-canvas aria-label="秩一矩阵 B 的输出"></canvas><footer>${mathInline(`B=${matrixTex(BOTTLENECK_B)},\\ \\operatorname{rank}(B)=1`)}</footer></article>
                <div class="s3-flow-arrow"><strong data-s3-a-label>A = ?</strong><span data-s3-a-matrix></span></div>
                <article class="s3-canvas-card"><div class="s3-stage-top"><strong>第二步：AB</strong><span data-s3-ab-rank-label>等待选择 A</span></div><canvas data-s3-bottleneck-canvas aria-label="复合矩阵 AB 的输出"></canvas><footer data-s3-bottleneck-rank></footer></article>
              </div>
              <div class="s3-bottleneck-readout">
                <strong data-s3-bottleneck-title>选一个 A</strong>
                <p data-s3-bottleneck-copy>B 已经把整个平面压到直线 y=x 上。选一个 A 作用在这条直线上，看 AB 的输出。</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    `;

    activeRoot = interactive;
    bindTabs(interactive);
    bindProductLab(interactive);
    bindBottleneckLab(interactive);
    bindResponsiveRedraw(interactive);
  }

  function bindTabs(root) {
    const tabs = [...root.querySelectorAll("[data-s3-tab]")];
    const panels = [...root.querySelectorAll("[data-s3-panel]")];
    const activate = (id, focus = false) => {
      tabs.forEach((tab) => {
        const active = tab.dataset.s3Tab === id;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        if (active && focus) tab.focus();
      });
      panels.forEach((panel) => {
        const active = panel.dataset.s3Panel === id;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });
      requestAnimationFrame(() => redrawAll(root));
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab.dataset.s3Tab));
      tab.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        activate(tabs[next].dataset.s3Tab, true);
      });
    });
  }

  function bindProductLab(root) {
    const lab = root.querySelector("[data-s3-product-lab]");
    if (!lab) return;
    const abCanvas = lab.querySelector("[data-s3-ab-canvas]");
    const baCanvas = lab.querySelector("[data-s3-ba-canvas]");
    const abStage = lab.querySelector("[data-s3-ab-stage]");
    const baStage = lab.querySelector("[data-s3-ba-stage]");
    const answers = [...lab.querySelectorAll("[data-s3-product-answer]")];
    const gate = window.LAPredictGate?.mount(lab.querySelector("[data-s3-product-gate]"), {
      root: lab,
      manual: true,
      key: "visuals/ch4/section3-presentation.js#product",
      question: `${mathInline("\\det A=2")}，${mathInline("\\det B=1")}。先 B 后 A 得到 AB，先 A 后 B 得到 BA。两个平行四边形会怎样？`,
      options: [
        ["形状不同，面积都是 2", true, ""],
        ["形状相同，面积都是 2", false, "AB 的第二列是 (2,1)ᵀ，BA 的第二列是 (1,1)ᵀ，两个平行四边形不一样。"],
        ["形状不同，面积分别是 2 和 1", false, "两种顺序经过的是同样两步，倍率都是 2×1。"],
        ["面积都是 3", false, "面积倍率相乘：1×2=2，不是相加。"],
      ],
      right: "✓ 形状取决于顺序，面积倍率与顺序无关：每经过一步，面积就乘上这一步的行列式。",
      onReveal: () => answers.forEach((n) => { n.hidden = false; }),
    });
    let run = 0;
    const reset = () => {
      run += 1;
      cancelCanvasAnimation(abCanvas);
      cancelCanvasAnimation(baCanvas);
      drawTransformScene(abCanvas, I, { firstLabel: "e₁", secondLabel: "e₂" });
      drawTransformScene(baCanvas, I, { firstLabel: "e₁", secondLabel: "e₂" });
      abStage.textContent = "单位正方形";
      baStage.textContent = "单位正方形";
    };
    lab.querySelector("[data-s3-product-play]")?.addEventListener("click", async () => {
      reset();
      const id = run;
      // labels name the step; the current area is shown only once a step is complete
      abStage.textContent = "第 1 步：作用 B";
      baStage.textContent = "第 1 步：作用 A";
      await Promise.all([
        animateCanvasTo(abCanvas, PRODUCT_B, { drawOptions: { firstLabel: "Be₁", secondLabel: "Be₂", ghost: I } }),
        animateCanvasTo(baCanvas, PRODUCT_A, { drawOptions: { firstLabel: "Ae₁", secondLabel: "Ae₂", ghost: I } }),
      ]);
      if (id !== run) return;
      abStage.textContent = "当前面积 1";
      baStage.textContent = "当前面积 2";
      if (!reducedMotion()) await new Promise((resolve) => setTimeout(resolve, 420));
      if (id !== run) return;
      abStage.textContent = "第 2 步：作用 A";
      baStage.textContent = "第 2 步：作用 B";
      await Promise.all([
        animateCanvasTo(abCanvas, PRODUCT_AB, { drawOptions: { firstLabel: "ABe₁", secondLabel: "ABe₂", ghost: PRODUCT_B } }),
        animateCanvasTo(baCanvas, PRODUCT_BA, { drawOptions: { firstLabel: "BAe₁", secondLabel: "BAe₂", ghost: PRODUCT_A } }),
      ]);
      if (id !== run) return;
      abStage.textContent = "最终面积 2";
      baStage.textContent = "最终面积 2";
      gate?.acted();
    });
    lab.querySelector("[data-s3-product-reset]")?.addEventListener("click", reset);
    reset();
  }

  function bindBottleneckLab(root) {
    const lab = root.querySelector("[data-s3-bottleneck-lab]");
    if (!lab) return;
    const bCanvas = lab.querySelector("[data-s3-b-canvas]");
    const resultCanvas = lab.querySelector("[data-s3-bottleneck-canvas]");
    // every A acts on the line y = x that B left behind
    const presets = {
      shear: { label: "剪切", matrix: [[1, 1], [0, 1]], title: "直线被剪切到另一个方向", copy: "剪切可逆，它把 y=x 送到经过 (2,1) 的直线。输出仍是一条直线，rank(AB)=rank(B)=1。" },
      rotate: { label: "旋转 90°", matrix: [[0, -1], [1, 0]], title: "直线转到了 y=−x", copy: "旋转可逆，直线换了位置，独立方向仍然只有 1 个，rank(AB)=1。" },
      stretch: { label: "纵向拉伸", matrix: [[1, 0], [0, 2]], title: "直线变陡，仍是直线", copy: "纵向拉伸可逆，y=x 变成 y=2x。长度和方向变了，rank(AB)=1。" },
      kill: { label: "压掉 y=x", matrix: [[1, -1], [1, -1]], title: "秩继续下降到 0", copy: "这个 A 不可逆，恰好把 y=x 上的每个点送到原点，所以 AB=0，rank(AB)=0。" },
    };
    drawTransformScene(bCanvas, BOTTLENECK_B, { firstLabel: "Be₁", secondLabel: "Be₂", ghost: I });
    drawTransformScene(resultCanvas, BOTTLENECK_B, { firstLabel: "Be₁", secondLabel: "Be₂" });

    const gate = window.LAPredictGate?.mount(lab.querySelector("[data-s3-bottleneck-gate]"), {
      root: lab,
      manual: true,
      key: "visuals/ch4/section3-presentation.js#bottleneck",
      question: "B 已经把整个平面压到直线 y=x 上。能不能找到一个 A，让 AB 的输出重新铺满整个平面？",
      options: [
        ["不能：无论 A 是什么，AB 的输出最多是一条直线", true, ""],
        ["能：选一个可逆的 A 就行", false, "可逆的 A 只把这条直线送到另一条直线，rank(AB)=rank(B)=1。"],
        ["能：选一个行列式很大的 A", false, "A 只能作用在 B 的输出上，一条直线乘多大的倍数仍是直线。"],
        ["只有 A=B⁻¹ 时能", false, "B 不可逆（det B=0），没有逆矩阵。"],
      ],
      onPick: () => lab.querySelectorAll("[data-s3-bottleneck]").forEach((b) => { b.disabled = false; b.removeAttribute("title"); }),
      right: `✓ AB 的每个输出都是 A 作用在 B 的某个输出上，而 B 的输出全在 y=x 上，所以 AB 的输出全在 A 把这条直线送到的地方：一条直线或一个点。这就是 ${mathInline("\\operatorname{rank}(AB)\\leq\\min\\{\\operatorname{rank}(A),\\operatorname{rank}(B)\\}")}。`,
    });

    const select = async (id) => {
      const preset = presets[id];
      if (!preset) return;
      lab.querySelectorAll("[data-s3-bottleneck]").forEach((button) => button.classList.toggle("is-active", button.dataset.s3Bottleneck === id));
      const product = multiply(preset.matrix, BOTTLENECK_B);
      lab.querySelector("[data-s3-a-label]").textContent = `A：${preset.label}`;
      lab.querySelector("[data-s3-a-matrix]").innerHTML = matrixGrid(preset.matrix);
      const rank = rank2(product);
      lab.querySelector("[data-s3-ab-rank-label]").textContent = rank === 1 ? "直线 → 直线" : "直线 → 一个点";
      lab.querySelector("[data-s3-bottleneck-rank]").innerHTML = mathInline(`AB=${matrixTex(product)},\\ \\operatorname{rank}(AB)=${rank}`);
      lab.querySelector("[data-s3-bottleneck-title]").textContent = preset.title;
      lab.querySelector("[data-s3-bottleneck-copy]").textContent = preset.copy;
      // start each choice from B's output, so the move from the dashed line is visible
      drawTransformScene(resultCanvas, BOTTLENECK_B, { firstLabel: "", secondLabel: "", ghost: BOTTLENECK_B });
      gate?.acted();
      await animateCanvasTo(resultCanvas, product, { drawOptions: { firstLabel: "ABe₁", secondLabel: "ABe₂", ghost: BOTTLENECK_B, ghostLabels: ["Be₁", "Be₂"] } });
    };
    lab.querySelectorAll("[data-s3-bottleneck]").forEach((button) => {
      if (!gate?.picked) { button.disabled = true; button.title = "先在上方作出预测"; }
      button.addEventListener("click", () => select(button.dataset.s3Bottleneck));
    });
  }

  function redrawAll(root) {
    if (!root?.isConnected) return;
    // redraw each visible canvas with its last matrix and options (labels, ghost)
    root.querySelectorAll("canvas").forEach((canvas) => {
      if (!canvas.offsetParent || canvasFrames.has(canvas) || !canvasMatrices.has(canvas)) return;
      drawTransformScene(canvas, canvasMatrices.get(canvas), canvasOptions.get(canvas) || {});
    });
  }

  function bindResponsiveRedraw(root) {
    activeResizeObserver?.disconnect();
    activeThemeObserver?.disconnect();
    const schedule = () => {
      if (redrawFrame) return;
      redrawFrame = requestAnimationFrame(() => {
        redrawFrame = 0;
        if (!root.isConnected) {
          activeResizeObserver?.disconnect();
          activeThemeObserver?.disconnect();
          return;
        }
        redrawAll(root);
      });
    };
    if (typeof ResizeObserver !== "undefined") {
      activeResizeObserver = new ResizeObserver(schedule);
      root.querySelectorAll("canvas").forEach((canvas) => activeResizeObserver.observe(canvas));
    }
    activeThemeObserver = new MutationObserver(schedule);
    activeThemeObserver.observe(document.body, { attributes: true, attributeFilter: ["class", "style"] });
    window.addEventListener("resize", schedule, { passive: true, once: false });
  }

  window.defineChapter4Renderer?.(SECTION_ID, {
    formal: renderFormal,
    interactive: renderInteractive,
  });
})();
