(() => {
  const SECTION_ID = "matrix-product-determinant-rank";
  const mathInline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const mathDisplay = (source) => (window.texDisplay ? window.texDisplay(source) : `<code>${source}</code>`);

  const I = [[1, 0], [0, 1]];
  const PRODUCT_A = [[2, 0], [0, 1]];
  const PRODUCT_B = [[1, 1], [0, 1]];
  const PRODUCT_AB = [[2, 2], [0, 1]];
  const PRODUCT_BA = [[2, 1], [0, 1]];
  const BOTTLENECK_B = [[1, 0], [0, 0]];

  const canvasMatrices = new WeakMap();
  const canvasFrames = new WeakMap();
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
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

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
      .flatMap((row) => row.map((value) => `<i>${formatNumber(value)}</i>`))
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
      accent: style.getPropertyValue("--accent").trim() || "#078b7e",
      accentStrong: style.getPropertyValue("--accent-strong").trim() || "#006f65",
      coral: style.getPropertyValue("--coral").trim() || "#d9835f",
      blue: style.getPropertyValue("--blue").trim() || "#547ec8",
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
      ctx.font = "700 12px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(label, to.x + 8, to.y - 8);
    }
    ctx.restore();
  }

  function drawTransformScene(canvas, matrix, options = {}) {
    canvasMatrices.set(canvas, cloneMatrix(matrix));
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

    ctx.fillStyle = palette.surface;
    ctx.fillRect(0, 0, width, height);

    for (let i = Math.floor(-reachY); i <= Math.ceil(reachY); i += 1) {
      drawLine(ctx, point(-reachX, i), point(reachX, i), palette.line, i === 0 ? 1.2 : 1, i === 0 ? 0.26 : 0.08);
    }
    for (let i = Math.floor(-reachX); i <= Math.ceil(reachX); i += 1) {
      drawLine(ctx, point(i, -reachY), point(i, reachY), palette.line, i === 0 ? 1.2 : 1, i === 0 ? 0.26 : 0.08);
    }

    const columnLengths = [Math.hypot(matrix[0][0], matrix[1][0]), Math.hypot(matrix[0][1], matrix[1][1])];
    const nonZero = Math.max(...columnLengths) > 1e-7;
    const minLength = Math.max(Math.min(...columnLengths.filter((value) => value > 1e-7)), 0.15);
    const domain = Math.min(45, Math.max(10, Math.hypot(reachX, reachY) / minLength + 2));
    if (nonZero) {
      for (let i = -Math.ceil(domain); i <= Math.ceil(domain); i += 1) {
        drawLine(ctx, point(-domain, i, true), point(domain, i, true), palette.coral, i === 0 ? 1.4 : 1.05, i === 0 ? 0.58 : 0.24);
        drawLine(ctx, point(i, -domain, true), point(i, domain, true), palette.accent, i === 0 ? 1.4 : 1.05, i === 0 ? 0.58 : 0.24);
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
      ctx.fillStyle = signedArea > 0 ? palette.accent : palette.blue;
      ctx.globalAlpha = 0.14;
      ctx.fill();
      ctx.globalAlpha = 0.56;
      ctx.strokeStyle = signedArea > 0 ? palette.accentStrong : palette.blue;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.restore();
    }

    const firstEnd = point(1, 0, true);
    const secondEnd = point(0, 1, true);
    drawArrow(ctx, origin, firstEnd, palette.accentStrong, options.firstLabel ?? "第 1 列", 3.1);
    drawArrow(ctx, origin, secondEnd, palette.coral, options.secondLabel ?? "第 2 列", 3.1);

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
        <p class="s3-lead">参考图形把列向量张成的平行四边形、连续矩阵作用和线性相关放在同一条主线上。本页重新设计为三个层次：先观察面积与方向，再追踪乘积倍率，最后识别秩的瓶颈。</p>

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
          <div><span>同一套视觉语言贯穿三个问题</span><h3>面积—秩实验室</h3><p>列向量、单位平行四边形、行列式和秩始终同步。先研究一个矩阵，再研究两个矩阵的复合。</p></div>
          <div class="s3-main-formulas">${mathInline("\\det(AB)=\\det(A)\\det(B)")}${mathInline("\\operatorname{rank}(AB)\\leq\\min\\{\\operatorname{rank}(A),\\operatorname{rank}(B)\\}")}</div>
        </div>
        <div class="s3-tabs" role="tablist" aria-label="第三节实验视角">
          <button type="button" role="tab" class="is-active" aria-selected="true" data-s3-tab="area">面积与秩</button>
          <button type="button" role="tab" aria-selected="false" data-s3-tab="product">乘积行列式</button>
          <button type="button" role="tab" aria-selected="false" data-s3-tab="bottleneck">秩瓶颈</button>
        </div>

        <div class="s3-panels">
          <section class="s3-panel is-active" role="tabpanel" data-s3-panel="area">
            <div class="s3-area-layout" data-s3-area-lab>
              <div class="s3-canvas-card s3-area-stage">
                <div class="s3-stage-top"><strong>拖动列向量端点，或调节矩阵元素</strong><span data-s3-area-shape>输出仍是整个平面</span></div>
                <canvas data-s3-area-canvas aria-label="矩阵列向量、网格和平行四边形"></canvas>
              </div>
              <aside class="s3-area-controls">
                <div class="s3-preset-row" role="group" aria-label="矩阵预设">
                  <button type="button" data-s3-preset="identity">单位</button>
                  <button type="button" data-s3-preset="shear">剪切</button>
                  <button type="button" data-s3-preset="mirror">镜像</button>
                  <button type="button" data-s3-preset="near">接近共线</button>
                  <button type="button" data-s3-preset="projection">投影</button>
                  <button type="button" data-s3-preset="zero">零矩阵</button>
                </div>
                <div class="s3-slider-grid">
                  ${[["a", 1], ["b", 0.45], ["c", 0.2], ["d", 1]].map(([key, value]) => `<label><span>${key}<output data-s3-value="${key}">${value}</output></span><input type="range" min="-2" max="2" step="0.05" value="${value}" data-s3-entry="${key}"></label>`).join("")}
                </div>
                <div class="s3-live-matrix"><span>A =</span><div data-s3-live-matrix>${matrixGrid([[1, 0.45], [0.2, 1]])}</div></div>
                <div class="s3-status-grid">
                  <div><span>det(A)</span><strong data-s3-det>0.91</strong></div>
                  <div><span>有向面积</span><strong data-s3-area>+0.91</strong></div>
                  <div><span>rank(A)</span><strong data-s3-rank>2</strong></div>
                  <div><span>可逆</span><strong data-s3-invertible>是</strong></div>
                </div>
                <p class="s3-observation" data-s3-observation>两列不共线，仍能张成整个平面。</p>
              </aside>
            </div>
          </section>

          <section class="s3-panel" role="tabpanel" data-s3-panel="product" hidden>
            <div class="s3-product-lab" data-s3-product-lab>
              <div class="s3-product-actions">
                <button type="button" class="button primary" data-s3-product-play>同步播放 AB 与 BA</button>
                <button type="button" class="button" data-s3-product-reset>重置</button>
              </div>
              <div class="s3-product-grid">
                <article class="s3-canvas-card"><div class="s3-stage-top"><strong>AB：先 B 后 A</strong><span data-s3-ab-stage>初始单位面积</span></div><canvas data-s3-ab-canvas aria-label="AB 的连续面积变换"></canvas></article>
                <article class="s3-canvas-card"><div class="s3-stage-top"><strong>BA：先 A 后 B</strong><span data-s3-ba-stage>初始单位面积</span></div><canvas data-s3-ba-canvas aria-label="BA 的连续面积变换"></canvas></article>
              </div>
              <div class="s3-area-meter">
                <div><span>起点</span><strong>1</strong><small>单位正方形面积</small></div><i>×</i>
                <div><span>det(B)</span><strong>1</strong><small>剪切保持面积</small></div><i>×</i>
                <div><span>det(A)</span><strong>2</strong><small>横向拉伸两倍</small></div><i>=</i>
                <div class="is-result"><span>最终面积</span><strong>2</strong><small>AB 与 BA 相同</small></div>
              </div>
              <div class="s3-product-conclusion">
                <div>${mathDisplay("\\det(AB)=2\\cdot1=2")}</div>
                <div>${mathDisplay("\\det(BA)=1\\cdot2=2")}</div>
                <p>两种顺序产生的平行四边形通常不同，但总面积倍率相同。行列式只记录倍率与方向，不记录完整形状。</p>
              </div>
            </div>
          </section>

          <section class="s3-panel" role="tabpanel" data-s3-panel="bottleneck" hidden>
            <div class="s3-bottleneck-lab" data-s3-bottleneck-lab>
              <div class="s3-bottleneck-controls" role="group" aria-label="选择第二步矩阵 A">
                <button type="button" class="is-active" data-s3-bottleneck="shear">可逆剪切</button>
                <button type="button" data-s3-bottleneck="rotate">可逆旋转</button>
                <button type="button" data-s3-bottleneck="stretch">可逆缩放</button>
                <button type="button" data-s3-bottleneck="kill">消灭这条线</button>
              </div>
              <div class="s3-bottleneck-flow">
                <article class="s3-canvas-card"><div class="s3-stage-top"><strong>第一步：B</strong><span>平面 → 直线</span></div><canvas data-s3-b-canvas aria-label="秩一矩阵 B 的输出"></canvas><footer>${mathInline("\\operatorname{rank}(B)=1")}</footer></article>
                <div class="s3-flow-arrow"><strong data-s3-a-label>A</strong><span data-s3-a-matrix>${matrixGrid([[1, 1], [0, 1]])}</span></div>
                <article class="s3-canvas-card"><div class="s3-stage-top"><strong>第二步：AB</strong><span data-s3-ab-rank-label>直线 → 直线</span></div><canvas data-s3-bottleneck-canvas aria-label="复合矩阵 AB 的输出"></canvas><footer data-s3-bottleneck-rank>${mathInline("\\operatorname{rank}(AB)=1")}</footer></article>
              </div>
              <div class="s3-bottleneck-readout">
                <strong data-s3-bottleneck-title>可逆 A 只会移动这条线</strong>
                <p data-s3-bottleneck-copy>B 已把整个平面压到 x 轴。剪切矩阵 A 可逆，因此它不会再丢失方向，rank(AB)=rank(B)=1。</p>
              </div>
            </div>
          </section>
        </div>
      </div>
      <div class="script-panel s3-task-panel"><h3>操作任务</h3><ol><li>让两列越来越接近共线，比较 det(A) 的连续变化与 rank(A) 的离散跳变。</li><li>用“镜像”比较有向面积的正负号。</li><li>同步播放 AB 与 BA，确认形状不同而最终面积倍率相同。</li><li>在秩瓶颈中寻找让 rank(AB) 从 1 继续降到 0 的 A。</li></ol></div>
    `;

    activeRoot = interactive;
    bindTabs(interactive);
    bindAreaLab(interactive);
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

  function bindAreaLab(root) {
    const lab = root.querySelector("[data-s3-area-lab]");
    if (!lab) return;
    const canvas = lab.querySelector("[data-s3-area-canvas]");
    const inputs = Object.fromEntries([...lab.querySelectorAll("[data-s3-entry]")].map((input) => [input.dataset.s3Entry, input]));
    const presets = {
      identity: [[1, 0], [0, 1]],
      shear: [[1, 0.85], [0, 1]],
      mirror: [[-1, 0], [0, 1]],
      near: [[1, 0.96], [1, 1]],
      projection: [[1, 1], [0, 0]],
      zero: [[0, 0], [0, 0]],
    };
    let matrix = [[Number(inputs.a.value), Number(inputs.b.value)], [Number(inputs.c.value), Number(inputs.d.value)]];
    let dragging = null;

    const setInputs = (next) => {
      inputs.a.value = String(next[0][0]);
      inputs.b.value = String(next[0][1]);
      inputs.c.value = String(next[1][0]);
      inputs.d.value = String(next[1][1]);
    };
    const readInputs = () => [[Number(inputs.a.value), Number(inputs.b.value)], [Number(inputs.c.value), Number(inputs.d.value)]];
    const markPreset = (id) => lab.querySelectorAll("[data-s3-preset]").forEach((button) => button.classList.toggle("is-active", Boolean(id) && button.dataset.s3Preset === id));

    const paint = (next = readInputs(), { syncInputs = false } = {}) => {
      matrix = cloneMatrix(next);
      if (syncInputs) setInputs(matrix);
      drawTransformScene(canvas, matrix, { firstLabel: "a₁", secondLabel: "a₂" });
      const det = determinant(matrix);
      const rank = rank2(matrix);
      const sign = det > 1e-6 ? "+" : det < -1e-6 ? "−" : "";
      const shape = rank === 2 ? "输出仍是整个平面" : rank === 1 ? "输出坍缩为一条直线" : "所有输出落到原点";
      lab.querySelector("[data-s3-area-shape]").textContent = shape;
      lab.querySelector("[data-s3-det]").textContent = formatNumber(det);
      lab.querySelector("[data-s3-area]").textContent = `${sign}${formatNumber(Math.abs(det))}`;
      lab.querySelector("[data-s3-rank]").textContent = String(rank);
      lab.querySelector("[data-s3-invertible]").textContent = rank === 2 ? "是" : "否";
      lab.querySelector("[data-s3-live-matrix]").innerHTML = matrixGrid(matrix);
      Object.entries(inputs).forEach(([key, input]) => {
        const output = lab.querySelector(`[data-s3-value="${key}"]`);
        if (output) output.value = formatNumber(Number(input.value));
      });
      lab.querySelector("[data-s3-observation]").textContent = rank === 2
        ? `两列不共线，仍能张成平面。det(A)=${formatNumber(det)}，距离 0 越近，平行四边形越扁。`
        : rank === 1
          ? "两列共线，平行四边形面积恰为 0；秩在这个临界点降为 1。"
          : "两列都是零向量，平面被收到一个点；行列式和秩都为 0。";
      lab.classList.toggle("is-negative", det < -1e-6);
      lab.classList.toggle("is-singular", rank < 2);
    };

    lab.querySelectorAll("[data-s3-preset]").forEach((button) => button.addEventListener("click", async () => {
      const target = presets[button.dataset.s3Preset];
      if (!target) return;
      markPreset(button.dataset.s3Preset);
      await animateCanvasTo(canvas, target, {
        duration: 560,
        drawOptions: { firstLabel: "a₁", secondLabel: "a₂" },
        onUpdate: (current) => paint(current, { syncInputs: true }),
      });
      paint(target, { syncInputs: true });
    }));

    Object.values(inputs).forEach((input) => input.addEventListener("input", () => {
      cancelCanvasAnimation(canvas);
      markPreset(null);
      paint();
    }));

    const pointerPosition = (event) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    canvas.addEventListener("pointerdown", (event) => {
      const geometry = canvas._s3Geometry;
      if (!geometry) return;
      const point = pointerPosition(event);
      const firstDistance = Math.hypot(point.x - geometry.firstEnd.x, point.y - geometry.firstEnd.y);
      const secondDistance = Math.hypot(point.x - geometry.secondEnd.x, point.y - geometry.secondEnd.y);
      const nearest = Math.min(firstDistance, secondDistance);
      if (nearest > 28) return;
      dragging = firstDistance <= secondDistance ? "first" : "second";
      canvas.setPointerCapture?.(event.pointerId);
      canvas.classList.add("is-dragging");
      cancelCanvasAnimation(canvas);
      markPreset(null);
      event.preventDefault();
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const geometry = canvas._s3Geometry;
      const point = pointerPosition(event);
      const x = clamp((point.x - geometry.origin.x) / geometry.scale, -2, 2);
      const y = clamp((geometry.origin.y - point.y) / geometry.scale, -2, 2);
      if (dragging === "first") {
        matrix[0][0] = x;
        matrix[1][0] = y;
      } else {
        matrix[0][1] = x;
        matrix[1][1] = y;
      }
      setInputs(matrix);
      paint(matrix, { syncInputs: true });
    });
    const stopDrag = (event) => {
      if (!dragging) return;
      dragging = null;
      canvas.releasePointerCapture?.(event.pointerId);
      canvas.classList.remove("is-dragging");
    };
    canvas.addEventListener("pointerup", stopDrag);
    canvas.addEventListener("pointercancel", stopDrag);
    paint(matrix, { syncInputs: true });
  }

  function bindProductLab(root) {
    const lab = root.querySelector("[data-s3-product-lab]");
    if (!lab) return;
    const abCanvas = lab.querySelector("[data-s3-ab-canvas]");
    const baCanvas = lab.querySelector("[data-s3-ba-canvas]");
    const abStage = lab.querySelector("[data-s3-ab-stage]");
    const baStage = lab.querySelector("[data-s3-ba-stage]");
    const reset = () => {
      cancelCanvasAnimation(abCanvas);
      cancelCanvasAnimation(baCanvas);
      drawTransformScene(abCanvas, I, { firstLabel: "e₁", secondLabel: "e₂" });
      drawTransformScene(baCanvas, I, { firstLabel: "e₁", secondLabel: "e₂" });
      abStage.textContent = "初始单位面积";
      baStage.textContent = "初始单位面积";
    };
    lab.querySelector("[data-s3-product-play]")?.addEventListener("click", async () => {
      reset();
      abStage.textContent = "第 1 步：B，面积 ×1";
      baStage.textContent = "第 1 步：A，面积 ×2";
      await Promise.all([
        animateCanvasTo(abCanvas, PRODUCT_B, { drawOptions: { firstLabel: "B e₁", secondLabel: "B e₂" } }),
        animateCanvasTo(baCanvas, PRODUCT_A, { drawOptions: { firstLabel: "A e₁", secondLabel: "A e₂" } }),
      ]);
      if (!reducedMotion()) await new Promise((resolve) => setTimeout(resolve, 260));
      abStage.textContent = "第 2 步：A，最终面积 2";
      baStage.textContent = "第 2 步：B，最终面积 2";
      await Promise.all([
        animateCanvasTo(abCanvas, PRODUCT_AB, { drawOptions: { firstLabel: "AB e₁", secondLabel: "AB e₂" } }),
        animateCanvasTo(baCanvas, PRODUCT_BA, { drawOptions: { firstLabel: "BA e₁", secondLabel: "BA e₂" } }),
      ]);
    });
    lab.querySelector("[data-s3-product-reset]")?.addEventListener("click", reset);
    reset();
  }

  function bindBottleneckLab(root) {
    const lab = root.querySelector("[data-s3-bottleneck-lab]");
    if (!lab) return;
    const bCanvas = lab.querySelector("[data-s3-b-canvas]");
    const resultCanvas = lab.querySelector("[data-s3-bottleneck-canvas]");
    const presets = {
      shear: { label: "剪切", matrix: [[1, 1], [0, 1]], title: "可逆 A 只会移动这条线", copy: "B 已把整个平面压到 x 轴。剪切矩阵 A 可逆，因此它不会再丢失方向，rank(AB)=rank(B)=1。" },
      rotate: { label: "旋转", matrix: [[0, -1], [1, 0]], title: "直线可以旋转，但不会变回平面", copy: "旋转把 B 的 x 轴输出转到 y 轴。方向位置改变了，独立方向数仍然只有 1。" },
      stretch: { label: "缩放", matrix: [[1.8, 0], [0, 0.6]], title: "可逆缩放改变长度，不改变秩", copy: "A 把这条线拉长，但可逆缩放不消灭任何非零方向，因此 rank(AB)=1。" },
      kill: { label: "消灭", matrix: [[0, 0], [0, 1]], title: "不可逆 A 可以让秩继续下降", copy: "B 的输出位于 x 轴，而 A 恰好把 x 轴全部送到原点，所以 AB=0，rank(AB)=0。" },
    };
    drawTransformScene(bCanvas, BOTTLENECK_B, { firstLabel: "B e₁", secondLabel: "B e₂" });

    const select = async (id, animate = true) => {
      const preset = presets[id] || presets.shear;
      lab.querySelectorAll("[data-s3-bottleneck]").forEach((button) => button.classList.toggle("is-active", button.dataset.s3Bottleneck === id));
      const product = multiply(preset.matrix, BOTTLENECK_B);
      lab.querySelector("[data-s3-a-label]").textContent = `A：${preset.label}`;
      lab.querySelector("[data-s3-a-matrix]").innerHTML = matrixGrid(preset.matrix);
      lab.querySelector("[data-s3-bottleneck-title]").textContent = preset.title;
      lab.querySelector("[data-s3-bottleneck-copy]").textContent = preset.copy;
      const rank = rank2(product);
      lab.querySelector("[data-s3-ab-rank-label]").textContent = rank === 1 ? "直线 → 直线" : "直线 → 一个点";
      lab.querySelector("[data-s3-bottleneck-rank]").innerHTML = mathInline(`\\operatorname{rank}(AB)=${rank}`);
      if (animate) await animateCanvasTo(resultCanvas, product, { drawOptions: { firstLabel: "AB e₁", secondLabel: "AB e₂" } });
      else drawTransformScene(resultCanvas, product, { firstLabel: "AB e₁", secondLabel: "AB e₂" });
    };
    lab.querySelectorAll("[data-s3-bottleneck]").forEach((button) => button.addEventListener("click", () => select(button.dataset.s3Bottleneck)));
    select("shear", false);
  }

  function redrawAll(root) {
    if (!root?.isConnected) return;
    const areaCanvas = root.querySelector("[data-s3-area-canvas]");
    if (areaCanvas?.offsetParent) drawTransformScene(areaCanvas, canvasMatrices.get(areaCanvas) || [[1, 0.45], [0.2, 1]], { firstLabel: "a₁", secondLabel: "a₂" });
    const abCanvas = root.querySelector("[data-s3-ab-canvas]");
    const baCanvas = root.querySelector("[data-s3-ba-canvas]");
    if (abCanvas?.offsetParent) drawTransformScene(abCanvas, canvasMatrices.get(abCanvas) || I, { firstLabel: "第 1 列", secondLabel: "第 2 列" });
    if (baCanvas?.offsetParent) drawTransformScene(baCanvas, canvasMatrices.get(baCanvas) || I, { firstLabel: "第 1 列", secondLabel: "第 2 列" });
    const bCanvas = root.querySelector("[data-s3-b-canvas]");
    const bottleneckCanvas = root.querySelector("[data-s3-bottleneck-canvas]");
    if (bCanvas?.offsetParent) drawTransformScene(bCanvas, BOTTLENECK_B, { firstLabel: "B e₁", secondLabel: "B e₂" });
    if (bottleneckCanvas?.offsetParent) drawTransformScene(bottleneckCanvas, canvasMatrices.get(bottleneckCanvas) || BOTTLENECK_B, { firstLabel: "AB e₁", secondLabel: "AB e₂" });
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
