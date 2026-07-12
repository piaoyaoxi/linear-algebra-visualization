(() => {
  const MODEL = Object.freeze({
    A: [[2, 0], [0, 1]],
    B: [[1, 1], [0, 1]],
    AB: [[2, 2], [0, 1]],
    BA: [[2, 1], [0, 1]],
    I: [[1, 0], [0, 1]],
    x: [1, 1],
  });

  const animationState = new WeakMap();
  const currentMatrices = new WeakMap();

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
    return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
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
      surface: styles.getPropertyValue("--surface-solid").trim() || "#ffffff",
      teal: styles.getPropertyValue("--accent").trim() || "#078b7e",
      tealStrong: styles.getPropertyValue("--accent-strong").trim() || "#006f65",
      coral: styles.getPropertyValue("--coral").trim() || "#d07456",
      blue: "#4f72c9",
    };
  }

  function setupCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
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
    const head = Math.min(11, Math.max(7, length * 0.13));
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
    ctx.font = "700 12px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(label, Math.min(to.x + 8, ctx.canvas.clientWidth - 46), Math.max(to.y - 8, 16));
    ctx.restore();
  }

  function drawTransformScene(canvas, matrix, options = {}) {
    if (!canvas) return;
    currentMatrices.set(canvas, matrix);
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const origin = { x: width * 0.5, y: height * 0.56 };
    const scale = Math.min(width, height) / 8.2;
    const reach = 8;

    ctx.fillStyle = palette.surface;
    ctx.fillRect(0, 0, width, height);

    for (let i = -reach; i <= reach; i += 1) {
      drawLine(
        ctx,
        { x: origin.x - reach * scale, y: origin.y - i * scale },
        { x: origin.x + reach * scale, y: origin.y - i * scale },
        palette.line,
        i === 0 ? 1.2 : 1,
        i === 0 ? 0.25 : 0.08,
      );
      drawLine(
        ctx,
        { x: origin.x + i * scale, y: origin.y - reach * scale },
        { x: origin.x + i * scale, y: origin.y + reach * scale },
        palette.line,
        i === 0 ? 1.2 : 1,
        i === 0 ? 0.25 : 0.08,
      );
    }

    const domain = 12;
    for (let i = -domain; i <= domain; i += 1) {
      drawLine(
        ctx,
        pointFor(matrix, -domain, i, origin, scale),
        pointFor(matrix, domain, i, origin, scale),
        palette.coral,
        i === 0 ? 1.45 : 1.05,
        i === 0 ? 0.72 : 0.31,
      );
      drawLine(
        ctx,
        pointFor(matrix, i, -domain, origin, scale),
        pointFor(matrix, i, domain, origin, scale),
        palette.teal,
        i === 0 ? 1.45 : 1.05,
        i === 0 ? 0.72 : 0.31,
      );
    }

    const p00 = pointFor(matrix, 0, 0, origin, scale);
    const p10 = pointFor(matrix, 1, 0, origin, scale);
    const p11 = pointFor(matrix, 1, 1, origin, scale);
    const p01 = pointFor(matrix, 0, 1, origin, scale);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p00.x, p00.y);
    ctx.lineTo(p10.x, p10.y);
    ctx.lineTo(p11.x, p11.y);
    ctx.lineTo(p01.x, p01.y);
    ctx.closePath();
    ctx.fillStyle = palette.teal;
    ctx.globalAlpha = 0.13;
    ctx.fill();
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = palette.tealStrong;
    ctx.lineWidth = 1.7;
    ctx.stroke();
    ctx.restore();

    drawArrow(ctx, origin, pointFor(matrix, 1, 0, origin, scale), palette.tealStrong, options.firstLabel || "第1列", 3.1);
    drawArrow(ctx, origin, pointFor(matrix, 0, 1, origin, scale), palette.coral, options.secondLabel || "第2列", 3.1);

    if (options.vector !== false) {
      const vector = multiplyMatrixVector(matrix, MODEL.x);
      drawArrow(ctx, origin, pointFor(matrix, MODEL.x[0], MODEL.x[1], origin, scale), palette.blue, options.vectorLabel || "当前向量", 3.4);
      if (options.vectorReadout) options.vectorReadout.textContent = `(${vector.map(formatNumber).join(", ")})ᵀ`;
    }

    ctx.save();
    ctx.fillStyle = palette.text;
    ctx.globalAlpha = 0.72;
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function formatNumber(value) {
    const rounded = Math.round(value * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  }

  function cancelCanvasAnimation(canvas) {
    const state = animationState.get(canvas);
    if (state?.raf) cancelAnimationFrame(state.raf);
    animationState.delete(canvas);
  }

  function animateCanvasSequence(canvas, keyframes, options = {}) {
    cancelCanvasAnimation(canvas);
    const duration = options.duration || 720;
    const pause = options.pause ?? 260;
    const drawOptions = options.drawOptions || {};
    const onStage = typeof options.onStage === "function" ? options.onStage : null;

    if (reducedMotion()) {
      const final = keyframes[keyframes.length - 1];
      drawTransformScene(canvas, final.matrix, drawOptions);
      onStage?.(keyframes.length - 1, final, 1);
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let index = 0;
      let segmentStart = 0;
      let pauseUntil = 0;

      const frame = (now) => {
        const current = keyframes[index];
        const next = keyframes[index + 1];
        if (!next) {
          drawTransformScene(canvas, current.matrix, drawOptions);
          onStage?.(index, current, 1);
          animationState.delete(canvas);
          resolve();
          return;
        }

        if (!segmentStart) {
          segmentStart = now;
          onStage?.(index, current, 0);
        }

        if (pauseUntil) {
          if (now < pauseUntil) {
            animationState.set(canvas, { raf: requestAnimationFrame(frame) });
            return;
          }
          pauseUntil = 0;
          segmentStart = now;
        }

        const t = Math.min(1, (now - segmentStart) / duration);
        const eased = easeInOutCubic(t);
        const matrix = interpolateMatrix(current.matrix, next.matrix, eased);
        drawTransformScene(canvas, matrix, drawOptions);
        onStage?.(index + (t >= 1 ? 1 : 0), t >= 1 ? next : current, t);

        if (t >= 1) {
          index += 1;
          segmentStart = 0;
          if (index < keyframes.length - 1 && pause > 0) pauseUntil = now + pause;
        }
        animationState.set(canvas, { raf: requestAnimationFrame(frame) });
      };

      animationState.set(canvas, { raf: requestAnimationFrame(frame) });
    });
  }

  function drawColumnScene(canvas, t) {
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const origin = { x: width * 0.5, y: height * 0.72 };
    const scale = Math.min(width, height) / 5.2;
    const b1 = [1, 0];
    const b2 = [1, 1];
    const ab1 = [2, 0];
    const ab2 = [2, 1];
    const v1 = interpolateVector(b1, ab1, t);
    const v2 = interpolateVector(b2, ab2, t);

    ctx.fillStyle = palette.surface;
    ctx.fillRect(0, 0, width, height);
    for (let i = -4; i <= 4; i += 1) {
      drawLine(ctx, { x: origin.x - 4 * scale, y: origin.y - i * scale }, { x: origin.x + 4 * scale, y: origin.y - i * scale }, palette.line, 1, 0.09);
      drawLine(ctx, { x: origin.x + i * scale, y: origin.y - 4 * scale }, { x: origin.x + i * scale, y: origin.y + 4 * scale }, palette.line, 1, 0.09);
    }
    const toPoint = (vector) => ({ x: origin.x + vector[0] * scale, y: origin.y - vector[1] * scale });
    drawArrow(ctx, origin, toPoint(v1), palette.tealStrong, t < 0.5 ? "b₁" : "Ab₁", 3.4);
    drawArrow(ctx, origin, toPoint(v2), palette.coral, t < 0.5 ? "b₂" : "Ab₂", 3.4);
    ctx.save();
    ctx.fillStyle = palette.text;
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
      return;
    }
    const start = performance.now();
    const duration = 760;
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const progress = from + (target - from) * easeInOutCubic(t);
      canvas.dataset.progress = String(progress);
      drawColumnScene(canvas, progress);
      updateColumnReadout(readout, progress);
      if (t < 1) animationState.set(canvas, { raf: requestAnimationFrame(step) });
      else animationState.delete(canvas);
    };
    animationState.set(canvas, { raf: requestAnimationFrame(step) });
  }

  function updateColumnReadout(readout, progress) {
    if (!readout) return;
    const b1 = interpolateVector([1, 0], [2, 0], progress);
    const b2 = interpolateVector([1, 1], [2, 1], progress);
    readout.innerHTML = `
      <div><span>第一列</span><strong>${texInline(`\\begin{bmatrix}${formatNumber(b1[0])}\\\\${formatNumber(b1[1])}\\end{bmatrix}`)}</strong></div>
      <div><span>第二列</span><strong>${texInline(`\\begin{bmatrix}${formatNumber(b2[0])}\\\\${formatNumber(b2[1])}\\end{bmatrix}`)}</strong></div>
      <p>${progress < 0.98 ? "A 正在分别作用于 B 的两列。" : `两根向量现在正是 ${texInline("AB")} 的两列。`}</p>`;
  }

  function renderLab(root) {
    root.innerHTML = `
      <h2>交互实验</h2>
      <div class="s2c-lab" data-s2c-lab>
        <header class="s2c-header">
          <div>
            <span class="s2c-kicker">同一组对象贯穿四个视角</span>
            <h3>让矩阵乘法真正发生在眼前</h3>
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
              <p>蓝色向量始终是同一个对象；绿色与橙色两族网格线分别跟随两列变化。</p>
            </div>
            <div class="s2c-canvas-shell">
              <canvas class="s2c-main-canvas" data-s2c-compose-canvas aria-label="矩阵复合连续动画"></canvas>
              <div class="s2c-stage-badge" data-s2c-compose-badge>初始：单位网格</div>
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
              <p>矩阵乘法不是把两张表格硬拼起来，而是把两个连续过程压缩成一个过程。</p>
            </div>
          </section>

          <section class="s2c-panel" data-s2c-panel="columns" role="tabpanel" hidden>
            <div class="s2c-stage-copy">
              <div><span>列视角</span><h4>B 的每一列，都继续接受 A 的作用</h4></div>
              <p>两根向量保持各自颜色，从 ${texInline("b_1,b_2")} 连续移动到 ${texInline("Ab_1,Ab_2")}。</p>
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
              <p>左边先剪切后拉伸，右边先拉伸后剪切；区别出现在中间状态，并保留到最终结果。</p>
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
      </div>
    `;

    bindTabs(root);
    bindComposition(root);
    bindColumns(root);
    bindFormula(root);
    bindOrder(root);
    bindRedraw(root);
  }

  function bindTabs(root) {
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
      tab.addEventListener("click", () => activate(tab.dataset.s2cTab));
      tab.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        activate(tabs[next].dataset.s2cTab, true);
      });
    });
  }

  function setProcessStep(root, step) {
    const items = [...root.querySelectorAll("[data-s2c-process-track] span")];
    items.forEach((item, index) => item.classList.toggle("is-active", index === step));
  }

  function bindComposition(root) {
    const canvas = root.querySelector("[data-s2c-compose-canvas]");
    const badge = root.querySelector("[data-s2c-compose-badge]");
    const readout = document.createElement("span");
    const drawOptions = { vectorReadout: readout, vectorLabel: "同一个 x" };
    const labels = ["初始：单位网格", "第一步：B 完成剪切", "第二步：A 继续拉伸，得到 AB"];
    const reset = () => {
      cancelCanvasAnimation(canvas);
      drawTransformScene(canvas, MODEL.I, drawOptions);
      badge.textContent = labels[0];
      setProcessStep(root, 0);
    };
    root.querySelector("[data-s2c-compose-play]")?.addEventListener("click", () => {
      animateCanvasSequence(
        canvas,
        [
          { matrix: MODEL.I, label: labels[0] },
          { matrix: MODEL.B, label: labels[1] },
          { matrix: MODEL.AB, label: labels[2] },
        ],
        {
          drawOptions,
          onStage: (index) => {
            const stage = Math.min(index, 2);
            badge.textContent = labels[stage];
            setProcessStep(root, stage);
          },
        },
      );
    });
    root.querySelector("[data-s2c-compose-direct]")?.addEventListener("click", () => {
      animateCanvasSequence(canvas, [{ matrix: MODEL.I }, { matrix: MODEL.AB }], {
        drawOptions,
        onStage: (index) => {
          badge.textContent = index === 0 ? labels[0] : "一次完成：AB 与两步复合终点相同";
          setProcessStep(root, index === 0 ? 0 : 2);
        },
      });
    });
    root.querySelector("[data-s2c-compose-reset]")?.addEventListener("click", reset);
    reset();
  }

  function bindColumns(root) {
    const canvas = root.querySelector("[data-s2c-column-canvas]");
    const readout = root.querySelector("[data-s2c-column-readout]");
    canvas.dataset.progress = "0";
    drawColumnScene(canvas, 0);
    updateColumnReadout(readout, 0);
    root.querySelector("[data-s2c-column-play]")?.addEventListener("click", () => animateColumns(canvas, readout, 1));
    root.querySelector("[data-s2c-column-reset]")?.addEventListener("click", () => animateColumns(canvas, readout, 0));
  }

  function bindFormula(root) {
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

    const select = (row, col) => {
      clearTimers();
      aCells.forEach((cell) => { cell.className = ""; });
      bCells.forEach((cell) => { cell.className = ""; });
      resultCells.forEach((cell) => cell.classList.toggle("is-active", Number(cell.dataset.row) === row && Number(cell.dataset.col) === col));
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
        timers.push(setTimeout(() => {
          terms.forEach((item) => {
            item.aCell?.classList.remove("is-pair-active");
            item.bCell?.classList.remove("is-pair-active");
          });
          term.aCell?.classList.add("is-row-source", "is-pair-active");
          term.bCell?.classList.add("is-column-source", "is-pair-active");
          note.textContent = `第 ${index + 1} 对：${term.a} × ${term.b} = ${term.product}`;
        }, index * 520));
      });
      timers.push(setTimeout(() => {
        terms.forEach((term) => {
          term.aCell?.classList.remove("is-pair-active");
          term.bCell?.classList.remove("is-pair-active");
          term.aCell?.classList.add("is-row-source");
          term.bCell?.classList.add("is-column-source");
        });
        formula.innerHTML = texInline(`c_{${row + 1}${col + 1}}=${full}=${MODEL.AB[row][col]}`);
        note.textContent = "所有配对乘积相加，得到这个结果元素。";
      }, terms.length * 520));
    };

    resultCells.forEach((cell) => cell.addEventListener("click", () => select(Number(cell.dataset.row), Number(cell.dataset.col))));
    select(0, 0);
  }

  function bindOrder(root) {
    const abCanvas = root.querySelector("[data-s2c-order-ab]");
    const baCanvas = root.querySelector("[data-s2c-order-ba]");
    const abBadge = root.querySelector("[data-s2c-order-ab-badge]");
    const baBadge = root.querySelector("[data-s2c-order-ba-badge]");
    const reset = () => {
      cancelCanvasAnimation(abCanvas);
      cancelCanvasAnimation(baCanvas);
      drawTransformScene(abCanvas, MODEL.I, { vector: false, firstLabel: "列1", secondLabel: "列2" });
      drawTransformScene(baCanvas, MODEL.I, { vector: false, firstLabel: "列1", secondLabel: "列2" });
      abBadge.textContent = "初始";
      baBadge.textContent = "初始";
    };
    root.querySelector("[data-s2c-order-play]")?.addEventListener("click", () => {
      animateCanvasSequence(abCanvas, [{ matrix: MODEL.I }, { matrix: MODEL.B }, { matrix: MODEL.AB }], {
        drawOptions: { vector: false, firstLabel: "列1", secondLabel: "列2" },
        onStage: (index) => { abBadge.textContent = ["初始", "B：剪切", "A：拉伸后得到 AB"][Math.min(index, 2)]; },
      });
      animateCanvasSequence(baCanvas, [{ matrix: MODEL.I }, { matrix: MODEL.A }, { matrix: MODEL.BA }], {
        drawOptions: { vector: false, firstLabel: "列1", secondLabel: "列2" },
        onStage: (index) => { baBadge.textContent = ["初始", "A：先拉伸", "B：剪切后得到 BA"][Math.min(index, 2)]; },
      });
    });
    root.querySelector("[data-s2c-order-reset]")?.addEventListener("click", reset);
    reset();
  }

  function redrawVisible(root) {
    const compose = root.querySelector("[data-s2c-compose-canvas]");
    if (compose?.offsetParent) drawTransformScene(compose, currentMatrices.get(compose) || MODEL.I, { vectorLabel: "同一个 x" });
    const column = root.querySelector("[data-s2c-column-canvas]");
    if (column?.offsetParent) drawColumnScene(column, Number(column.dataset.progress || 0));
    const ab = root.querySelector("[data-s2c-order-ab]");
    const ba = root.querySelector("[data-s2c-order-ba]");
    if (ab?.offsetParent) drawTransformScene(ab, currentMatrices.get(ab) || MODEL.I, { vector: false, firstLabel: "列1", secondLabel: "列2" });
    if (ba?.offsetParent) drawTransformScene(ba, currentMatrices.get(ba) || MODEL.I, { vector: false, firstLabel: "列1", secondLabel: "列2" });
  }

  function bindRedraw(root) {
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => redrawVisible(root)) : null;
    root.querySelectorAll("canvas").forEach((canvas) => observer?.observe(canvas));
    window.addEventListener("resize", () => redrawVisible(root), { passive: true });
    document.querySelector("#themeToggle")?.addEventListener("click", () => requestAnimationFrame(() => redrawVisible(root)));
  }

  window.defineChapter4LessonEnhancer?.((section, root) => {
    if (section?.id !== "matrix-operations") return;
    const interactive = root.querySelector("#matrix-operations-interactive");
    if (!interactive || interactive.dataset.sectionTwoContinuous === "true") return;
    renderLab(interactive);
    interactive.dataset.sectionTwoContinuous = "true";
  });
})();