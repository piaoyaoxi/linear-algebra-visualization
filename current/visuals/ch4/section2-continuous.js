(() => {
  const MODEL = Object.freeze({
    A: [
      [2, 0],
      [0, 1],
    ],
    B: [
      [1, 1],
      [0, 1],
    ],
    AB: [
      [2, 2],
      [0, 1],
    ],
    BA: [
      [2, 1],
      [0, 1],
    ],
    I: [
      [1, 0],
      [0, 1],
    ],
    x: [1, 1],
  });

  /** @type {WeakMap<HTMLCanvasElement, { raf?: number, resolve?: (v?: unknown) => void }>} */
  const animationState = new WeakMap();
  /** @type {WeakMap<HTMLCanvasElement, number[][]>} */
  const currentMatrices = new WeakMap();
  /** @type {WeakMap<HTMLElement, { destroy: () => void }>} */
  const liveLabs = new WeakMap();
  /** @type {Set<HTMLElement>} */
  const activeRoots = new Set();

  let globalResizeBound = false;
  let globalThemeBound = false;

  const texInline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const texDisplay = (source) => (window.texDisplay ? window.texDisplay(source) : `<code>${source}</code>`);

  function multiplyMatrixVector(matrix, vector) {
    return [
      matrix[0][0] * vector[0] + matrix[0][1] * vector[1],
      matrix[1][0] * vector[0] + matrix[1][1] * vector[1],
    ];
  }

  function interpolateMatrix(from, to, t) {
    return from.map((row, i) => row.map((value, j) => value + (to[i][j] - value) * t));
  }

  function interpolateVector(from, to, t) {
    return from.map((value, i) => value + (to[i] - value) * t);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  }

  function reducedMotion() {
    return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
  }

  function matrixTex(matrix) {
    return `\\begin{bmatrix}${matrix.map((row) => row.join("&")).join("\\\\")}\\end{bmatrix}`;
  }

  function vectorTex(vector) {
    return `\\begin{bmatrix}${vector.join("\\\\")}\\end{bmatrix}`;
  }

  function formatNumber(value) {
    const rounded = Math.round(value * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  }

  function matrixCellGrid(matrix, id, buttons = false) {
    return `<div class="s2c-matrix" data-s2c-matrix="${id}" style="--s2c-cols:${matrix[0].length}">${matrix
      .flatMap((row, rowIndex) =>
        row.map((value, colIndex) => {
          const attrs = `data-row="${rowIndex}" data-col="${colIndex}"`;
          return buttons
            ? `<button type="button" ${attrs} data-s2c-result aria-label="计算第 ${rowIndex + 1} 行第 ${colIndex + 1} 列">${value}</button>`
            : `<span ${attrs}>${value}</span>`;
        }),
      )
      .join("")}</div>`;
  }

  function getPalette() {
    const styles = getComputedStyle(document.body);
    return {
      text: styles.getPropertyValue("--text").trim() || "#10211d",
      muted: styles.getPropertyValue("--muted").trim() || "#68736f",
      line: styles.getPropertyValue("--line-strong").trim() || "rgba(16, 40, 34, .22)",
      paperTop: "#fbfcfb",
      paperBottom: "#f3f6f4",
      teal: styles.getPropertyValue("--accent").trim() || "#078b7e",
      tealStrong: styles.getPropertyValue("--accent-strong").trim() || "#006f65",
      coral: styles.getPropertyValue("--coral").trim() || "#d69a48",
      blue: "#4f72c9",
    };
  }

  function setupCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const metrics = canvas._s2cMetrics || { w: 0, h: 0, dpr: 0 };
    if (metrics.w !== width || metrics.h !== height || metrics.dpr !== dpr) {
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas._s2cMetrics = { w: width, h: height, dpr };
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return { ctx, width, height };
  }

  function pointFor(matrix, x, y, origin, scale) {
    const tx = matrix[0][0] * x + matrix[0][1] * y;
    const ty = matrix[1][0] * x + matrix[1][1] * y;
    return { x: origin.x + tx * scale, y: origin.y - ty * scale };
  }

  function drawLine(ctx, from, to, color, width = 1, alpha = 1) {
    if (!Number.isFinite(from.x + from.y + to.x + to.y)) return;
    if (Math.hypot(to.x - from.x, to.y - from.y) < 0.4) return;
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
    if (length < 3.5) return;
    const angle = Math.atan2(dy, dx);
    const head = Math.min(10, Math.max(6.5, length * 0.14));
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
    ctx.lineTo(to.x - head * Math.cos(angle - Math.PI / 6.5), to.y - head * Math.sin(angle - Math.PI / 6.5));
    ctx.quadraticCurveTo(
      to.x - head * 0.35 * Math.cos(angle),
      to.y - head * 0.35 * Math.sin(angle),
      to.x - head * Math.cos(angle + Math.PI / 6.5),
      to.y - head * Math.sin(angle + Math.PI / 6.5),
    );
    ctx.closePath();
    ctx.fill();
    if (label) {
      ctx.font = "700 12px ui-sans-serif, system-ui, sans-serif";
      const maxX = (ctx.canvas.clientWidth || 400) - 40;
      ctx.fillText(label, Math.min(to.x + 8, maxX), Math.max(to.y - 8, 16));
    }
    ctx.restore();
  }

  function fillPaper(ctx, width, height, palette) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, palette.paperTop);
    gradient.addColorStop(1, palette.paperBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    const glow = ctx.createRadialGradient(
      width * 0.5,
      height * 0.46,
      8,
      width * 0.5,
      height * 0.46,
      Math.max(width, height) * 0.42,
    );
    glow.addColorStop(0, "rgba(7, 139, 126, 0.05)");
    glow.addColorStop(1, "rgba(7, 139, 126, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }

  function drawTransformScene(canvas, matrix, options = {}) {
    if (!canvas) return;
    currentMatrices.set(canvas, matrix);
    canvas._s2cDrawOptions = options;
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const origin = { x: width * 0.5, y: height * 0.56 };
    const scale = Math.min(width, height) / 8.6;
    const halfW = width / (2 * scale);
    const halfH = height / (2 * scale);
    const screenReach = Math.hypot(halfW, halfH) + 1.2;
    const col1Len = Math.hypot(matrix[0][0], matrix[1][0]);
    const col2Len = Math.hypot(matrix[0][1], matrix[1][1]);
    const minCol = Math.max(Math.min(col1Len || 0, col2Len || 0), 0);
    const maxCol = Math.max(col1Len, col2Len, 0);
    const allZero = maxCol < 1e-8;
    const domainReach = Math.min(48, Math.max(screenReach + 2, screenReach / Math.max(minCol || maxCol, 0.14) + 2));

    fillPaper(ctx, width, height, palette);

    const refX = halfW + 1.4;
    const refY = halfH + 1.4;
    for (let i = Math.floor(-refY); i <= Math.ceil(refY); i += 1) {
      const isAxis = i === 0;
      drawLine(
        ctx,
        { x: origin.x - refX * scale, y: origin.y - i * scale },
        { x: origin.x + refX * scale, y: origin.y - i * scale },
        palette.line,
        isAxis ? 1.15 : 1,
        isAxis ? 0.26 : 0.09,
      );
    }
    for (let i = Math.floor(-refX); i <= Math.ceil(refX); i += 1) {
      const isAxis = i === 0;
      drawLine(
        ctx,
        { x: origin.x + i * scale, y: origin.y - refY * scale },
        { x: origin.x + i * scale, y: origin.y + refY * scale },
        palette.line,
        isAxis ? 1.15 : 1,
        isAxis ? 0.26 : 0.09,
      );
    }

    if (!allZero) {
      const iMin = Math.floor(-domainReach);
      const iMax = Math.ceil(domainReach);
      for (let i = iMin; i <= iMax; i += 1) {
        const isAxis = i === 0;
        drawLine(
          ctx,
          pointFor(matrix, -domainReach, i, origin, scale),
          pointFor(matrix, domainReach, i, origin, scale),
          isAxis ? palette.tealStrong : palette.teal,
          isAxis ? 1.3 : 1.05,
          isAxis ? 0.4 : 0.26,
        );
        drawLine(
          ctx,
          pointFor(matrix, i, -domainReach, origin, scale),
          pointFor(matrix, i, domainReach, origin, scale),
          isAxis ? palette.tealStrong : palette.teal,
          isAxis ? 1.3 : 1.05,
          isAxis ? 0.4 : 0.26,
        );
      }
    }

    const p00 = pointFor(matrix, 0, 0, origin, scale);
    const p10 = pointFor(matrix, 1, 0, origin, scale);
    const p11 = pointFor(matrix, 1, 1, origin, scale);
    const p01 = pointFor(matrix, 0, 1, origin, scale);
    const cellArea = Math.abs((p10.x - p00.x) * (p01.y - p00.y) - (p01.x - p00.x) * (p10.y - p00.y));
    if (cellArea > 2) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p00.x, p00.y);
      ctx.lineTo(p10.x, p10.y);
      ctx.lineTo(p11.x, p11.y);
      ctx.lineTo(p01.x, p01.y);
      ctx.closePath();
      ctx.fillStyle = palette.teal;
      ctx.globalAlpha = 0.1;
      ctx.fill();
      ctx.globalAlpha = 0.36;
      ctx.strokeStyle = palette.tealStrong;
      ctx.lineWidth = 1.45;
      ctx.stroke();
      ctx.restore();
    }

    drawArrow(ctx, origin, pointFor(matrix, 1, 0, origin, scale), palette.tealStrong, options.firstLabel || "Ae₁", 3);
    drawArrow(ctx, origin, pointFor(matrix, 0, 1, origin, scale), palette.coral, options.secondLabel || "Ae₂", 3);

    if (options.vector !== false) {
      drawArrow(
        ctx,
        origin,
        pointFor(matrix, MODEL.x[0], MODEL.x[1], origin, scale),
        palette.blue,
        options.vectorLabel || "Mx",
        3.2,
      );
    }

    ctx.save();
    ctx.fillStyle = palette.text;
    ctx.globalAlpha = 0.74;
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, allZero ? 4 : 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function cancelCanvasAnimation(canvas) {
    if (!canvas) return;
    const state = animationState.get(canvas);
    if (state?.raf) cancelAnimationFrame(state.raf);
    const resolve = state?.resolve;
    animationState.delete(canvas);
    if (resolve) resolve();
  }

  function animateCanvasSequence(canvas, keyframes, options = {}) {
    cancelCanvasAnimation(canvas);
    const duration = options.duration || 700;
    const pause = options.pause ?? 220;
    const baseDraw = options.drawOptions || {};
    const onStage = typeof options.onStage === "function" ? options.onStage : null;
    const stageDraw = typeof options.stageDrawOptions === "function" ? options.stageDrawOptions : null;

    if (reducedMotion() || keyframes.length < 2) {
      const final = keyframes[keyframes.length - 1];
      const finalStage = keyframes.length - 1;
      drawTransformScene(canvas, final.matrix, stageDraw?.(finalStage) || baseDraw);
      onStage?.(finalStage, final, 1);
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let index = 0;
      let segmentStart = 0;
      let pauseUntil = 0;
      let activeStage = 0;

      const drawOpts = () => stageDraw?.(activeStage) || baseDraw;

      const frame = (now) => {
        const state = animationState.get(canvas);
        if (!state || state.resolve !== resolve) return;

        const current = keyframes[index];
        const next = keyframes[index + 1];
        if (!next) {
          drawTransformScene(canvas, current.matrix, drawOpts());
          onStage?.(index, current, 1);
          animationState.delete(canvas);
          resolve();
          return;
        }

        if (!segmentStart) {
          segmentStart = now;
          activeStage = index;
          onStage?.(index, current, 0);
        }

        if (pauseUntil) {
          if (now < pauseUntil) {
            state.raf = requestAnimationFrame(frame);
            return;
          }
          pauseUntil = 0;
          segmentStart = now;
        }

        const t = Math.min(1, (now - segmentStart) / duration);
        const eased = easeInOutCubic(t);
        // Prefer destination stage labels once past half of the segment.
        activeStage = t >= 0.55 ? index + 1 : index;
        drawTransformScene(canvas, interpolateMatrix(current.matrix, next.matrix, eased), drawOpts());

        if (t >= 1) {
          index += 1;
          segmentStart = 0;
          activeStage = index;
          onStage?.(index, keyframes[index], 1);
          if (index < keyframes.length - 1 && pause > 0) pauseUntil = now + pause;
        }
        state.raf = requestAnimationFrame(frame);
      };

      animationState.set(canvas, { resolve, raf: requestAnimationFrame(frame) });
    });
  }

  function drawColumnScene(canvas, t) {
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const origin = { x: width * 0.48, y: height * 0.7 };
    const scale = Math.min(width, height) / 5.4;
    const v1 = interpolateVector([1, 0], [2, 0], t);
    const v2 = interpolateVector([1, 1], [2, 1], t);
    const toPoint = (vector) => ({ x: origin.x + vector[0] * scale, y: origin.y - vector[1] * scale });

    fillPaper(ctx, width, height, palette);
    for (let i = -5; i <= 5; i += 1) {
      const isAxis = i === 0;
      drawLine(
        ctx,
        { x: origin.x - 5 * scale, y: origin.y - i * scale },
        { x: origin.x + 5 * scale, y: origin.y - i * scale },
        palette.line,
        isAxis ? 1.15 : 1,
        isAxis ? 0.24 : 0.08,
      );
      drawLine(
        ctx,
        { x: origin.x + i * scale, y: origin.y - 5 * scale },
        { x: origin.x + i * scale, y: origin.y + 5 * scale },
        palette.line,
        isAxis ? 1.15 : 1,
        isAxis ? 0.24 : 0.08,
      );
    }

    const p0 = toPoint([0, 0]);
    const p1 = toPoint(v1);
    const p2 = toPoint([v1[0] + v2[0], v1[1] + v2[1]]);
    const p3 = toPoint(v2);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
    ctx.fillStyle = palette.teal;
    ctx.globalAlpha = 0.1;
    ctx.fill();
    ctx.globalAlpha = 0.34;
    ctx.strokeStyle = palette.tealStrong;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();

    const label1 = t < 0.08 ? "b₁" : t > 0.92 ? "Ab₁" : "列₁";
    const label2 = t < 0.08 ? "b₂" : t > 0.92 ? "Ab₂" : "列₂";
    drawArrow(ctx, origin, p1, palette.tealStrong, label1, 3.2);
    drawArrow(ctx, origin, p3, palette.coral, label2, 3.2);

    ctx.save();
    ctx.fillStyle = palette.text;
    ctx.globalAlpha = 0.74;
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function animateColumns(canvas, readout, target = 1) {
    cancelCanvasAnimation(canvas);
    const from = Number(canvas.dataset.progress || 0);
    if (reducedMotion()) {
      canvas.dataset.progress = String(target);
      drawColumnScene(canvas, target);
      updateColumnReadout(readout, target);
      return Promise.resolve();
    }
    const start = performance.now();
    const duration = 760;
    return new Promise((resolve) => {
      const step = (now) => {
        const state = animationState.get(canvas);
        if (!state || state.resolve !== resolve) return;
        const t = Math.min(1, (now - start) / duration);
        const progress = from + (target - from) * easeInOutCubic(t);
        canvas.dataset.progress = String(progress);
        drawColumnScene(canvas, progress);
        updateColumnReadout(readout, progress);
        if (t < 1) state.raf = requestAnimationFrame(step);
        else {
          animationState.delete(canvas);
          resolve();
        }
      };
      animationState.set(canvas, { resolve, raf: requestAnimationFrame(step) });
    });
  }

  function updateColumnReadout(readout, progress) {
    if (!readout) return;
    const b1 = interpolateVector([1, 0], [2, 0], progress);
    const b2 = interpolateVector([1, 1], [2, 1], progress);
    readout.innerHTML = `
      <div><span>第一列</span><strong>${texInline(`\\begin{bmatrix}${formatNumber(b1[0])}\\\\${formatNumber(b1[1])}\\end{bmatrix}`)}</strong></div>
      <div><span>第二列</span><strong>${texInline(`\\begin{bmatrix}${formatNumber(b2[0])}\\\\${formatNumber(b2[1])}\\end{bmatrix}`)}</strong></div>
      <p>${progress < 0.98 ? "A 正在分别作用于 B 的两列；平行四边形随之变形。" : `两根向量现在正是 ${texInline("AB")} 的两列。`}</p>`;
  }

  function vectorLabelForCompose(stageIndex) {
    if (stageIndex <= 0) return "x";
    if (stageIndex === 1) return "Bx";
    return "ABx";
  }

  function renderLab(root) {
    root.innerHTML = `
      <h2>交互实验</h2>
      <div class="s2c-lab" data-s2c-lab>
        <header class="s2c-header">
          <div>
            <span class="s2c-kicker">同一组对象贯穿四个视角</span>
            <h3>矩阵乘法：在连续画面里完成</h3>
            <p>所有画面都使用同一个 ${texInline(`A=${matrixTex(MODEL.A)}`)}、${texInline(`B=${matrixTex(MODEL.B)}`)} 和输入 ${texInline(`x=${vectorTex(MODEL.x)}`)}。</p>
          </div>
          <div class="s2c-data-strip">
            <span>${texInline(`AB=${matrixTex(MODEL.AB)}`)}</span>
            <span>${texInline(`BA=${matrixTex(MODEL.BA)}`)}</span>
          </div>
        </header>

        <div class="s2c-tabs" role="tablist" aria-label="矩阵乘法的四种观察方式">
          <button type="button" class="is-active" role="tab" aria-selected="true" data-s2c-tab="compose">连续复合</button>
          <button type="button" role="tab" aria-selected="false" data-s2c-tab="columns">看列</button>
          <button type="button" role="tab" aria-selected="false" data-s2c-tab="formula">行乘列</button>
          <button type="button" role="tab" aria-selected="false" data-s2c-tab="order">交换顺序</button>
        </div>

        <div class="s2c-panels">
          <section class="s2c-panel is-active" data-s2c-panel="compose" role="tabpanel">
            <div class="s2c-stage-copy">
              <div>
                <span>核心画面</span>
                <h4>同一张网格，先经过 B，再经过 A</h4>
              </div>
              <p>蓝向量是 x 在当前变换下的像；整张青色网格随矩阵连续变形。</p>
            </div>
            <div class="s2c-canvas-shell">
              <canvas class="s2c-main-canvas" data-s2c-compose-canvas aria-label="矩阵复合连续动画"></canvas>
              <div class="s2c-stage-badge" data-s2c-compose-badge>初始：单位网格与 x</div>
            </div>
            <div class="s2c-controls">
              <button type="button" class="is-primary" data-s2c-compose-play>播放 B → A</button>
              <button type="button" data-s2c-compose-direct>直接看 AB</button>
              <button type="button" data-s2c-compose-reset>重置</button>
            </div>
            <div class="s2c-process-track" data-s2c-process-track>
              <span class="is-active">x</span><i>经过 B</i><span>Bx</span><i>再经过 A</i><span>A(Bx)=ABx</span>
            </div>
            <div class="s2c-conclusion">
              <strong>${texInline("ABx=A(Bx)")}</strong>
              <p>矩阵乘法把两个连续过程压成一个过程，而不是把两张表硬拼在一起。</p>
            </div>
          </section>

          <section class="s2c-panel" data-s2c-panel="columns" role="tabpanel" hidden>
            <div class="s2c-stage-copy">
              <div><span>列视角</span><h4>B 的每一列，都继续接受 A 的作用</h4></div>
              <p>两根向量从 ${texInline("b_1,b_2")} 连续移到 ${texInline("Ab_1,Ab_2")}；其间平行四边形跟着变形。</p>
            </div>
            <div class="s2c-columns-layout">
              <div class="s2c-canvas-shell"><canvas class="s2c-column-canvas" data-s2c-column-canvas aria-label="乘积矩阵的列动画"></canvas></div>
              <aside class="s2c-column-readout" data-s2c-column-readout></aside>
            </div>
            <div class="s2c-controls">
              <button type="button" class="is-primary" data-s2c-column-play>让 A 作用于两列</button>
              <button type="button" data-s2c-column-reset>回到 B 的两列</button>
            </div>
            <div class="s2c-conclusion"><strong>${texInline("(AB)_{:j}=Ab_j")}</strong><p>乘积的第 j 列，就是 A 作用在 B 的第 j 列之后得到的向量。</p></div>
          </section>

          <section class="s2c-panel" data-s2c-panel="formula" role="tabpanel" hidden>
            <div class="s2c-stage-copy">
              <div><span>坐标视角</span><h4>一个结果元素怎样由一行和一列汇合</h4></div>
              <p>点击结果矩阵中的位置，配对项会依次亮起，再汇入求和。</p>
            </div>
            <div class="s2c-formula-stage" data-s2c-formula-stage>
              <div class="s2c-matrix-block"><span>A</span>${matrixCellGrid(MODEL.A, "A")}</div>
              <b>×</b>
              <div class="s2c-matrix-block"><span>B</span>${matrixCellGrid(MODEL.B, "B")}</div>
              <b>=</b>
              <div class="s2c-matrix-block"><span>C=AB</span>${matrixCellGrid(MODEL.AB, "C", true)}</div>
            </div>
            <div class="s2c-dot-work" data-s2c-dot-work aria-live="polite"></div>
            <div class="s2c-conclusion"><strong>${texInline("c_{ij}=\\sum_k a_{ik}b_{kj}")}</strong><p>中间下标 k 依次走过所有配对位置，所以这些乘积要相加。</p></div>
          </section>

          <section class="s2c-panel" data-s2c-panel="order" role="tabpanel" hidden>
            <div class="s2c-stage-copy">
              <div><span>顺序比较</span><h4>从同一个单位方格出发，左右同时播放</h4></div>
              <p>左边先剪切后拉伸，右边先拉伸后剪切；中间状态不同，最终结果也不同。</p>
            </div>
            <div class="s2c-order-grid">
              <article>
                <header><strong>AB</strong><span>先 B，后 A</span></header>
                <div class="s2c-canvas-shell"><canvas data-s2c-order-ab aria-label="AB 的作用顺序动画"></canvas><div class="s2c-stage-badge" data-s2c-order-ab-badge>初始</div></div>
                <div>${texDisplay(`AB=${matrixTex(MODEL.AB)}`)}</div>
              </article>
              <article>
                <header><strong>BA</strong><span>先 A，后 B</span></header>
                <div class="s2c-canvas-shell"><canvas data-s2c-order-ba aria-label="BA 的作用顺序动画"></canvas><div class="s2c-stage-badge" data-s2c-order-ba-badge>初始</div></div>
                <div>${texDisplay(`BA=${matrixTex(MODEL.BA)}`)}</div>
              </article>
            </div>
            <div class="s2c-controls"><button type="button" class="is-primary" data-s2c-order-play>同步播放两种顺序</button><button type="button" data-s2c-order-reset>重置</button></div>
            <div class="s2c-conclusion"><strong>${texInline("AB\\ne BA")}</strong><p>第二个过程面对的中间图形不同，因此最终平行四边形和矩阵元素也不同。</p></div>
          </section>
        </div>

        <div class="script-panel s2-task-panel s2c-task-panel">
          <h3>操作任务</h3>
          <ol>
            <li>在「连续复合」中播放 B → A，再与「直接看 AB」对照终点。</li>
            <li>在「看列」中确认两列怎样变成 AB 的两列。</li>
            <li>在「行乘列」中点击四个结果位置，核对每一个配对求和。</li>
            <li>在「交换顺序」中比较 AB 与 BA 的中间状态与最终矩阵。</li>
          </ol>
        </div>
      </div>
    `;

    const controller = new AbortController();
    const { signal } = controller;

    bindTabs(root, signal);
    bindComposition(root, signal);
    bindColumns(root, signal);
    bindFormula(root, signal);
    bindOrder(root, signal);
    const observer = bindRedraw(root, signal);

    const destroy = () => {
      controller.abort();
      root.querySelectorAll("canvas").forEach((canvas) => cancelCanvasAnimation(canvas));
      observer?.disconnect();
      activeRoots.delete(root);
      liveLabs.delete(root);
    };

    liveLabs.set(root, { destroy });
    activeRoots.add(root);
  }

  function bindTabs(root, signal) {
    const tabs = [...root.querySelectorAll("[data-s2c-tab]")];
    const panels = [...root.querySelectorAll("[data-s2c-panel]")];
    const activate = (id, focus = false) => {
      tabs.forEach((tab) => {
        const active = tab.dataset.s2cTab === id;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        if (active && focus) tab.focus();
      });
      panels.forEach((panel) => {
        const active = panel.dataset.s2cPanel === id;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });
      requestAnimationFrame(() => redrawVisible(root));
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab.dataset.s2cTab), { signal });
      tab.addEventListener(
        "keydown",
        (event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          let next = index;
          if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
          if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
          if (event.key === "Home") next = 0;
          if (event.key === "End") next = tabs.length - 1;
          activate(tabs[next].dataset.s2cTab, true);
        },
        { signal },
      );
    });
  }

  function setProcessStep(root, step) {
    const items = [...root.querySelectorAll("[data-s2c-process-track] span")];
    items.forEach((item, index) => item.classList.toggle("is-active", index === step));
  }

  function bindComposition(root, signal) {
    const canvas = root.querySelector("[data-s2c-compose-canvas]");
    const badge = root.querySelector("[data-s2c-compose-badge]");
    const labels = ["初始：单位网格与 x", "第一步：B 完成剪切 → Bx", "第二步：A 继续拉伸 → ABx"];
    const stageDrawOptions = (stage) => ({
      vector: true,
      vectorLabel: vectorLabelForCompose(stage),
      firstLabel: "Ae₁",
      secondLabel: "Ae₂",
    });
    const reset = () => {
      cancelCanvasAnimation(canvas);
      drawTransformScene(canvas, MODEL.I, stageDrawOptions(0));
      badge.textContent = labels[0];
      setProcessStep(root, 0);
    };
    root.querySelector("[data-s2c-compose-play]")?.addEventListener(
      "click",
      () => {
        animateCanvasSequence(canvas, [{ matrix: MODEL.I }, { matrix: MODEL.B }, { matrix: MODEL.AB }], {
          stageDrawOptions,
          onStage: (index) => {
            const stage = Math.min(index, 2);
            badge.textContent = labels[stage];
            setProcessStep(root, stage);
          },
        });
      },
      { signal },
    );
    root.querySelector("[data-s2c-compose-direct]")?.addEventListener(
      "click",
      () => {
        animateCanvasSequence(canvas, [{ matrix: MODEL.I }, { matrix: MODEL.AB }], {
          stageDrawOptions: (stage) => stageDrawOptions(stage === 0 ? 0 : 2),
          onStage: (index) => {
            badge.textContent = index === 0 ? labels[0] : "一次完成：AB 与两步复合终点相同";
            setProcessStep(root, index === 0 ? 0 : 2);
          },
        });
      },
      { signal },
    );
    root.querySelector("[data-s2c-compose-reset]")?.addEventListener("click", reset, { signal });
    reset();
  }

  function bindColumns(root, signal) {
    const canvas = root.querySelector("[data-s2c-column-canvas]");
    const readout = root.querySelector("[data-s2c-column-readout]");
    canvas.dataset.progress = "0";
    drawColumnScene(canvas, 0);
    updateColumnReadout(readout, 0);
    root.querySelector("[data-s2c-column-play]")?.addEventListener("click", () => animateColumns(canvas, readout, 1), {
      signal,
    });
    root.querySelector("[data-s2c-column-reset]")?.addEventListener("click", () => animateColumns(canvas, readout, 0), {
      signal,
    });
  }

  function bindFormula(root, signal) {
    const stage = root.querySelector("[data-s2c-formula-stage]");
    const work = root.querySelector("[data-s2c-dot-work]");
    const aCells = [...stage.querySelectorAll('[data-s2c-matrix="A"] span')];
    const bCells = [...stage.querySelectorAll('[data-s2c-matrix="B"] span')];
    const resultCells = [...stage.querySelectorAll("[data-s2c-result]")];
    let timers = [];

    const clearTimers = () => {
      timers.forEach(clearTimeout);
      timers = [];
    };

    signal.addEventListener("abort", clearTimers);

    const select = (row, col) => {
      clearTimers();
      aCells.forEach((cell) => {
        cell.className = "";
      });
      bCells.forEach((cell) => {
        cell.className = "";
      });
      resultCells.forEach((cell) =>
        cell.classList.toggle("is-active", Number(cell.dataset.row) === row && Number(cell.dataset.col) === col),
      );
      const terms = MODEL.A[row].map((value, k) => ({
        a: value,
        b: MODEL.B[k][col],
        product: value * MODEL.B[k][col],
        aCell: aCells.find((cell) => Number(cell.dataset.row) === row && Number(cell.dataset.col) === k),
        bCell: bCells.find((cell) => Number(cell.dataset.row) === k && Number(cell.dataset.col) === col),
      }));

      work.innerHTML = `<span>第 ${row + 1} 行 × 第 ${col + 1} 列</span><strong data-s2c-work-formula></strong><p data-s2c-work-note>准备依次配对。</p>`;
      const formula = work.querySelector("[data-s2c-work-formula]");
      const note = work.querySelector("[data-s2c-work-note]");
      const full = terms.map((term) => `${term.a}\\cdot${term.b}`).join("+");
      formula.innerHTML = texInline(`c_{${row + 1}${col + 1}}=${full}`);

      terms.forEach((term, index) => {
        timers.push(
          setTimeout(() => {
            terms.forEach((item) => {
              item.aCell?.classList.remove("is-pair-active");
              item.bCell?.classList.remove("is-pair-active");
            });
            term.aCell?.classList.add("is-row-source", "is-pair-active");
            term.bCell?.classList.add("is-column-source", "is-pair-active");
            note.textContent = `第 ${index + 1} 对：${term.a} × ${term.b} = ${term.product}`;
          }, index * 520),
        );
      });
      timers.push(
        setTimeout(() => {
          terms.forEach((term) => {
            term.aCell?.classList.remove("is-pair-active");
            term.bCell?.classList.remove("is-pair-active");
            term.aCell?.classList.add("is-row-source");
            term.bCell?.classList.add("is-column-source");
          });
          formula.innerHTML = texInline(`c_{${row + 1}${col + 1}}=${full}=${MODEL.AB[row][col]}`);
          note.textContent = "所有配对乘积相加，得到这个结果元素。";
        }, terms.length * 520),
      );
    };

    resultCells.forEach((cell) =>
      cell.addEventListener("click", () => select(Number(cell.dataset.row), Number(cell.dataset.col)), { signal }),
    );
    select(0, 0);
  }

  function bindOrder(root, signal) {
    const abCanvas = root.querySelector("[data-s2c-order-ab]");
    const baCanvas = root.querySelector("[data-s2c-order-ba]");
    const abBadge = root.querySelector("[data-s2c-order-ab-badge]");
    const baBadge = root.querySelector("[data-s2c-order-ba-badge]");
    const drawOpts = { vector: false, firstLabel: "列1", secondLabel: "列2" };
    const reset = () => {
      cancelCanvasAnimation(abCanvas);
      cancelCanvasAnimation(baCanvas);
      drawTransformScene(abCanvas, MODEL.I, drawOpts);
      drawTransformScene(baCanvas, MODEL.I, drawOpts);
      abBadge.textContent = "初始";
      baBadge.textContent = "初始";
    };
    root.querySelector("[data-s2c-order-play]")?.addEventListener(
      "click",
      () => {
        animateCanvasSequence(abCanvas, [{ matrix: MODEL.I }, { matrix: MODEL.B }, { matrix: MODEL.AB }], {
          drawOptions: drawOpts,
          onStage: (index) => {
            abBadge.textContent = ["初始", "B：剪切", "A：拉伸后得到 AB"][Math.min(index, 2)];
          },
        });
        animateCanvasSequence(baCanvas, [{ matrix: MODEL.I }, { matrix: MODEL.A }, { matrix: MODEL.BA }], {
          drawOptions: drawOpts,
          onStage: (index) => {
            baBadge.textContent = ["初始", "A：先拉伸", "B：剪切后得到 BA"][Math.min(index, 2)];
          },
        });
      },
      { signal },
    );
    root.querySelector("[data-s2c-order-reset]")?.addEventListener("click", reset, { signal });
    reset();
  }

  function redrawVisible(root) {
    if (!root.isConnected) return;
    const compose = root.querySelector("[data-s2c-compose-canvas]");
    if (compose && compose.offsetParent !== null) {
      const opts = compose._s2cDrawOptions || { vectorLabel: "x", firstLabel: "Ae₁", secondLabel: "Ae₂" };
      drawTransformScene(compose, currentMatrices.get(compose) || MODEL.I, opts);
    }
    const column = root.querySelector("[data-s2c-column-canvas]");
    if (column && column.offsetParent !== null) drawColumnScene(column, Number(column.dataset.progress || 0));
    const ab = root.querySelector("[data-s2c-order-ab]");
    const ba = root.querySelector("[data-s2c-order-ba]");
    const orderOpts = { vector: false, firstLabel: "列1", secondLabel: "列2" };
    if (ab && ab.offsetParent !== null) drawTransformScene(ab, currentMatrices.get(ab) || MODEL.I, orderOpts);
    if (ba && ba.offsetParent !== null) drawTransformScene(ba, currentMatrices.get(ba) || MODEL.I, orderOpts);
  }

  function bindRedraw(root, signal) {
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            if (!signal.aborted) redrawVisible(root);
          })
        : null;
    root.querySelectorAll("canvas").forEach((canvas) => observer?.observe(canvas));
    if (!globalResizeBound) {
      globalResizeBound = true;
      window.addEventListener(
        "resize",
        () => {
          activeRoots.forEach((item) => redrawVisible(item));
        },
        { passive: true },
      );
    }
    if (!globalThemeBound) {
      globalThemeBound = true;
      document.querySelector("#themeToggle")?.addEventListener("click", () => {
        requestAnimationFrame(() => activeRoots.forEach((item) => redrawVisible(item)));
      });
    }
    return observer;
  }

  function mountSection2ContinuousLab(interactive) {
    if (!interactive) return;
    const existing = liveLabs.get(interactive);
    if (existing) existing.destroy();
    renderLab(interactive);
    interactive.dataset.sectionTwoContinuous = "true";
  }

  function teardownSection2ContinuousLab() {
    [...activeRoots].forEach((root) => liveLabs.get(root)?.destroy());
    activeRoots.clear();
  }

  window.mountSection2ContinuousLab = mountSection2ContinuousLab;
  window.teardownSection2ContinuousLab = teardownSection2ContinuousLab;
})();
