(() => {
  const { I, on, matrix, setPressed, markExperimentStep, conclusionMarkup } = window.Chapter8Lab;

  const presets = {
    distinct: { label: "两个不同实特征值", A: [[3, 1], [0, 1]], roots: [1, 3], range: [-1, 5], polynomial: "(\\lambda-1)(\\lambda-3)" },
    scalar: { label: "重根：2I", A: [[2, 0], [0, 2]], roots: [2], range: [-1, 5], polynomial: "(\\lambda-2)^2" },
    jordan: { label: "重根：Jordan 块", A: [[2, 1], [0, 2]], roots: [2], range: [-1, 5], polynomial: "(\\lambda-2)^2" },
    rotation: { label: "旋转矩阵", A: [[0, -1], [1, 0]], roots: [], range: [-3, 3], polynomial: "\\lambda^2+1" },
  };

  function fmt(value) {
    if (Math.abs(value) < 1e-9) return "0";
    if (Math.abs(value - Math.round(value)) < 1e-9) return String(Math.round(value));
    return Number(value.toFixed(2)).toString();
  }

  function detAt(A, lambda) {
    return (lambda - A[0][0]) * (lambda - A[1][1]) - A[0][1] * A[1][0];
  }

  function characteristicAt(A, lambda) {
    return [[fmt(lambda - A[0][0]), fmt(-A[0][1])], [fmt(-A[1][0]), fmt(lambda - A[1][1])]];
  }

  function kernelInfo(A, lambda) {
    const M = characteristicAt(A, lambda).map((row) => row.map(Number));
    const allZero = M.flat().every((value) => Math.abs(value) < 1e-9);
    if (allZero) return { rank: 0, nullity: 2, type: "plane", vector: [1, 0], text: "整个平面都是核：任意非零方向都是特征方向。" };
    const det = M[0][0] * M[1][1] - M[0][1] * M[1][0];
    if (Math.abs(det) > 1e-8) return { rank: 2, nullity: 0, type: "zero", vector: [0, 0], text: "核中只有 0，当前 λ 不是特征值。" };
    const row = Math.abs(M[0][0]) + Math.abs(M[0][1]) > 1e-9 ? M[0] : M[1];
    const vector = [-row[1], row[0]];
    return { rank: 1, nullity: 1, type: "line", vector, text: `核是一条直线，由方向 (${fmt(vector[0])}, ${fmt(vector[1])}) 张成。` };
  }

  function kernelSvg(info) {
    const line = (() => {
      const [x, y] = info.vector;
      const length = Math.hypot(x, y) || 1;
      const ux = x / length;
      const uy = -y / length;
      return { x1: 110 - ux * 78, y1: 90 - uy * 78, x2: 110 + ux * 78, y2: 90 + uy * 78 };
    })();
    return `
      <svg class="ch8-kernel-svg" viewBox="0 0 220 180" role="img" aria-label="核空间示意">
        <g class="ch8-kernel-grid"><path d="M20 30H200M20 60H200M20 90H200M20 120H200M20 150H200"></path><path d="M50 18V162M80 18V162M110 18V162M140 18V162M170 18V162"></path></g>
        <path class="ch8-kernel-axis" d="M18 90H202M110 164V16"></path>
        ${info.type === "plane" ? `<rect class="ch8-kernel-plane" x="20" y="18" width="180" height="144" rx="12"></rect>` : ""}
        ${info.type === "line" ? `<path class="ch8-kernel-line" d="M${line.x1} ${line.y1}L${line.x2} ${line.y2}"></path>` : ""}
        <circle class="ch8-kernel-origin" cx="110" cy="90" r="5"></circle>
        ${info.type === "zero" ? `<circle class="ch8-kernel-zero-ring" cx="110" cy="90" r="15"></circle>` : ""}
      </svg>`;
  }

  function mount(host) {
    host.innerHTML = `
      <div class="ch8-lab ch8-story-lab ch8-lambda-story">
        <div class="ch8-story-tabs" role="tablist" aria-label="λ-矩阵实验阶段">
          <button type="button" class="is-active" data-lambda-scene="build" aria-pressed="true"><span>01</span>先构造</button>
          <button type="button" data-lambda-scene="scan" aria-pressed="false"><span>02</span>再扫描</button>
          <button type="button" data-lambda-scene="compare" aria-pressed="false"><span>03</span>最后对比</button>
        </div>
        <div class="ch8-story-stage" data-lambda-stage></div>
      </div>`;

    const stage = host.querySelector("[data-lambda-stage]");
    const tabs = host.querySelector(".ch8-story-tabs");
    let scene = "build";
    let selectedCell = "11";
    let presetKey = "distinct";
    let lambda = 1;
    let scanElements = null;

    function renderBuild() {
      scanElements = null;
      markExperimentStep(host, 0);
      const cells = {
        "11": { label: "左上角", from: "a_{11}=2", result: "\\lambda-2", explanation: "对角位置来自 λI 的 λ，再减去 A 的对应元素 2。" },
        "12": { label: "右上角", from: "a_{12}=1", result: "-1", explanation: "非对角位置在 λI 中是 0，所以只剩 −a₁₂。" },
        "21": { label: "左下角", from: "a_{21}=0", result: "0", explanation: "非对角位置是 0−0，仍然为 0。" },
        "22": { label: "右下角", from: "a_{22}=2", result: "\\lambda-2", explanation: "另一个对角位置同样是 λ−a₂₂。" },
      };
      const active = cells[selectedCell];
      stage.innerHTML = `
        <div class="ch8-scene-intro"><span>构造规则</span><h3>同一个位置，逐格做 ${I("\\lambda I-A")}</h3><p>点击结果矩阵中的任意位置，追踪它从哪里来。</p></div>
        <div class="ch8-build-equation">
          <article><span>普通矩阵 A</span>${matrix([[2, 1], [0, 2]])}</article>
          <b aria-hidden="true">→</b>
          <article><span>λI</span>${matrix([["\\lambda", 0], [0, "\\lambda"]])}</article>
          <b aria-hidden="true">−</b>
          <article class="is-result"><span>特征矩阵 λI−A</span>
            <div class="ch8-click-matrix" role="group" aria-label="选择特征矩阵元素">
              ${[["11", "\\lambda-2"], ["12", "-1"], ["21", "0"], ["22", "\\lambda-2"]]
                .map(([id, tex]) => `<button type="button" data-build-cell="${id}" class="${selectedCell === id ? "is-active" : ""}">${I(tex)}</button>`)
                .join("")}
            </div>
          </article>
        </div>
        <div class="ch8-cause-strip">
          <div><span>你点的是</span><strong>${active.label}</strong></div>
          <div><span>原矩阵对应位置</span><strong>${I(active.from)}</strong></div>
          <div><span>结果</span><strong>${I(active.result)}</strong></div>
        </div>
        ${conclusionMarkup("现在应该看见", "对角位置带 λ，非对角位置只改变符号", active.explanation)}`;
      stage.querySelectorAll("[data-build-cell]").forEach((button) => on(button, "click", () => {
        selectedCell = button.dataset.buildCell;
        renderBuild();
      }));
    }

    function drawPlot(canvas, preset, currentLambda) {
      if (!canvas?.isConnected) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(300, rect.width || 620);
      const height = Math.max(230, rect.height || 300);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const styles = getComputedStyle(host);
      const ink = styles.getPropertyValue("--ch8-ink").trim() || "#173c39";
      const muted = styles.getPropertyValue("--ch8-muted").trim() || "#7f9793";
      const accent = styles.getPropertyValue("--ch8-accent").trim() || "#177f73";
      const danger = styles.getPropertyValue("--ch8-danger").trim() || "#bd5a48";
      const [xmin, xmax] = preset.range;
      const samples = 220;
      const values = Array.from({ length: samples + 1 }, (_, index) => {
        const x = xmin + ((xmax - xmin) * index) / samples;
        return [x, detAt(preset.A, x)];
      });
      const maxY = Math.max(1.5, ...values.map((item) => Math.abs(item[1]))) * 1.1;
      const pad = { left: 42, right: 20, top: 24, bottom: 36 };
      const mapX = (x) => pad.left + ((x - xmin) / (xmax - xmin)) * (width - pad.left - pad.right);
      const mapY = (y) => pad.top + ((maxY - y) / (2 * maxY)) * (height - pad.top - pad.bottom);
      ctx.strokeStyle = muted;
      ctx.globalAlpha = 0.22;
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i += 1) {
        const y = pad.top + ((height - pad.top - pad.bottom) * i) / 4;
        ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
      }
      ctx.globalAlpha = 0.55;
      ctx.beginPath(); ctx.moveTo(pad.left, mapY(0)); ctx.lineTo(width - pad.right, mapY(0)); ctx.stroke();
      if (xmin <= 0 && xmax >= 0) { ctx.beginPath(); ctx.moveTo(mapX(0), pad.top); ctx.lineTo(mapX(0), height - pad.bottom); ctx.stroke(); }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      ctx.lineJoin = "round";
      ctx.beginPath();
      values.forEach(([x, y], index) => index ? ctx.lineTo(mapX(x), mapY(y)) : ctx.moveTo(mapX(x), mapY(y)));
      ctx.stroke();
      preset.roots.forEach((root) => {
        ctx.fillStyle = danger;
        ctx.beginPath(); ctx.arc(mapX(root), mapY(0), 5, 0, Math.PI * 2); ctx.fill();
      });
      const value = detAt(preset.A, currentLambda);
      const singular = Math.abs(value) < 1e-7;
      ctx.strokeStyle = singular ? danger : ink;
      ctx.fillStyle = singular ? danger : ink;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(mapX(currentLambda), pad.top); ctx.lineTo(mapX(currentLambda), height - pad.bottom); ctx.stroke();
      ctx.beginPath(); ctx.arc(mapX(currentLambda), mapY(value), 6, 0, Math.PI * 2); ctx.fill();
      ctx.font = "12px ui-monospace, monospace";
      ctx.fillStyle = ink;
      ctx.fillText("λ", width - 18, mapY(0) - 7);
      ctx.fillText("det(λI−A)", pad.left, 15);
    }

    function rootButtonsMarkup(preset) {
      return preset.roots.length
        ? preset.roots.map((root) => `<button type="button" data-jump-root="${root}">跳到 λ=${root}</button>`).join("")
        : `<span>实数域中没有奇异参数；曲线不会穿过横轴。扩到复数域时，根为 ±i。</span>`;
    }

    function bindRootButtons() {
      scanElements.rootButtons.querySelectorAll("[data-jump-root]").forEach((button) => on(button, "click", () => {
        lambda = Number(button.dataset.jumpRoot);
        updateScan();
      }));
    }

    function updateScan(options = {}) {
      if (!scanElements?.range?.isConnected) return;
      const { syncRange = true } = options;
      const preset = presets[presetKey];
      const info = kernelInfo(preset.A, lambda);
      const det = detAt(preset.A, lambda);
      const singular = Math.abs(det) < 1e-7;

      if (syncRange) scanElements.range.value = String(lambda);
      scanElements.range.setAttribute("aria-valuetext", `λ 等于 ${fmt(lambda)}`);
      scanElements.current.textContent = fmt(lambda);
      scanElements.kernelVisual.innerHTML = kernelSvg(info);
      scanElements.kernelTitle.textContent = info.type === "zero" ? "只有原点" : info.type === "line" ? "出现一条非零方向" : "整个平面";
      scanElements.kernelText.textContent = info.text;
      scanElements.matrix.innerHTML = matrix(characteristicAt(preset.A, lambda));
      scanElements.det.textContent = fmt(det);
      scanElements.det.classList.toggle("is-danger", singular);
      scanElements.rank.textContent = String(info.rank);
      scanElements.nullity.textContent = String(info.nullity);
      scanElements.conclusion.innerHTML = conclusionMarkup(
        "四个信号",
        singular ? "此刻 λ 是特征值" : "此刻 λ 不是特征值",
        singular ? "行列式归零、秩下降、非零核出现；核中的方向就是特征方向。" : "行列式非零，特征矩阵满秩，齐次方程只有零解。",
        singular ? "danger" : "accent",
      );
      host.dataset.scanValue = fmt(lambda);
      drawPlot(scanElements.canvas, preset, lambda);
    }

    function renderScan() {
      markExperimentStep(host, 1);
      const preset = presets[presetKey];
      if (lambda < preset.range[0] || lambda > preset.range[1]) lambda = preset.roots[0] ?? 0;
      stage.innerHTML = `
        <div class="ch8-scene-intro"><span>参数扫描</span><h3>拖动 λ，只追踪同一条因果链</h3><p>先移动滑块，再依次看曲线上的点、特征矩阵、秩和核空间。四处必须同步变化。</p></div>
        <div class="ch8-lambda-controls">
          <label>选择矩阵<select data-scan-preset>${Object.entries(presets).map(([key, item]) => `<option value="${key}" ${key === presetKey ? "selected" : ""}>${item.label}</option>`).join("")}</select></label>
          <div class="ch8-root-buttons" data-root-buttons>${rootButtonsMarkup(preset)}</div>
        </div>
        <section class="ch8-range-panel" aria-label="调整 λ">
          <div><span>当前 λ</span><output data-scan-current for="ch8-lambda-range">${fmt(lambda)}</output></div>
          <input id="ch8-lambda-range" data-scan-range type="range" min="${preset.range[0]}" max="${preset.range[1]}" step="0.05" value="${lambda}" aria-label="当前 λ">
          <small>拖动圆点、点击轨道，或用左右方向键微调；下面所有读数会连续更新。</small>
        </section>
        <div class="ch8-scan-layout">
          <article class="ch8-scan-plot"><div class="ch8-object-label">① 先看 det(λI−A) 是否碰到 0</div><canvas data-scan-plot aria-label="特征多项式曲线"></canvas></article>
          <article class="ch8-kernel-stage">
            <div class="ch8-object-label">② 再看非零核是否出现</div>
            <div class="ch8-kernel-visual" data-scan-kernel-visual></div>
            <div class="ch8-kernel-copy"><span>当前核空间</span><strong data-scan-kernel-title></strong><p data-scan-kernel-text></p></div>
          </article>
        </div>
        <div class="ch8-signal-row">
          <div><span>③ 当前特征矩阵</span><div data-scan-matrix></div></div>
          <div><span>④ det</span><strong data-scan-det></strong></div>
          <div><span>⑤ rank</span><strong data-scan-rank></strong></div>
          <div><span>⑥ dim ker</span><strong data-scan-nullity></strong></div>
        </div>
        <div data-scan-conclusion></div>`;

      scanElements = {
        preset: stage.querySelector("[data-scan-preset]"),
        rootButtons: stage.querySelector("[data-root-buttons]"),
        range: stage.querySelector("[data-scan-range]"),
        current: stage.querySelector("[data-scan-current]"),
        canvas: stage.querySelector("[data-scan-plot]"),
        kernelVisual: stage.querySelector("[data-scan-kernel-visual]"),
        kernelTitle: stage.querySelector("[data-scan-kernel-title]"),
        kernelText: stage.querySelector("[data-scan-kernel-text]"),
        matrix: stage.querySelector("[data-scan-matrix]"),
        det: stage.querySelector("[data-scan-det]"),
        rank: stage.querySelector("[data-scan-rank]"),
        nullity: stage.querySelector("[data-scan-nullity]"),
        conclusion: stage.querySelector("[data-scan-conclusion]"),
      };

      on(scanElements.preset, "change", (event) => {
        presetKey = event.currentTarget.value;
        const nextPreset = presets[presetKey];
        lambda = nextPreset.roots[0] ?? 0;
        scanElements.range.min = String(nextPreset.range[0]);
        scanElements.range.max = String(nextPreset.range[1]);
        scanElements.rootButtons.innerHTML = rootButtonsMarkup(nextPreset);
        bindRootButtons();
        updateScan();
      });
      on(scanElements.range, "input", (event) => {
        lambda = Number(event.currentTarget.value);
        updateScan({ syncRange: false });
      });
      on(scanElements.range, "pointerdown", () => scanElements.range.classList.add("is-dragging"));
      on(scanElements.range, "pointerup", () => scanElements.range.classList.remove("is-dragging"));
      on(scanElements.range, "pointercancel", () => scanElements.range.classList.remove("is-dragging"));
      bindRootButtons();
      updateScan();
    }

    function renderCompare() {
      scanElements = null;
      markExperimentStep(host, 2);
      stage.innerHTML = `
        <div class="ch8-scene-intro"><span>结构对比</span><h3>同一个重根，为什么特征方向数量不同？</h3><p>两个矩阵都把特征值 2 重复了两次；区别只在核空间。</p></div>
        <div class="ch8-repeat-comparison">
          <article class="is-scalar">
            <div class="ch8-comparison-title"><span>矩阵 A</span><strong>纯缩放 2I</strong></div>
            ${matrix([[2, 0], [0, 2]])}
            <div class="ch8-comparison-polynomial">${I("\\chi_A=(\\lambda-2)^2")}</div>
            ${kernelSvg(kernelInfo([[2, 0], [0, 2]], 2))}
            <div class="ch8-comparison-result"><b>${I("\\dim\\ker(2I-A)=2")}</b><p>所有方向都保持方向不变。</p></div>
          </article>
          <div class="ch8-same-badge"><span>相同</span><b>${I("(\\lambda-2)^2")}</b><i>但核不同</i></div>
          <article class="is-jordan">
            <div class="ch8-comparison-title"><span>矩阵 B</span><strong>二阶 Jordan 块</strong></div>
            ${matrix([[2, 1], [0, 2]])}
            <div class="ch8-comparison-polynomial">${I("\\chi_B=(\\lambda-2)^2")}</div>
            ${kernelSvg(kernelInfo([[2, 1], [0, 2]], 2))}
            <div class="ch8-comparison-result"><b>${I("\\dim\\ker(2I-B)=1")}</b><p>只有一条真正的特征方向。</p></div>
          </article>
        </div>
        ${conclusionMarkup("实验结论", "特征多项式只告诉你根和代数重数", "核维数还在区分两种结构。后面需要 Smith 标准形与不变因子保存这部分信息。", "danger")}`;
    }

    function renderScene() {
      if (scene === "build") renderBuild();
      if (scene === "scan") renderScan();
      if (scene === "compare") renderCompare();
    }

    tabs.querySelectorAll("[data-lambda-scene]").forEach((button) => on(button, "click", () => {
      scene = button.dataset.lambdaScene;
      setPressed(tabs, button);
      renderScene();
    }));
    on(window, "resize", () => {
      if (scene === "scan") updateScan({ syncRange: false });
    }, { passive: true });
    renderScene();
  }

  window.defineChapter8Lab("lambda-story", mount);
})();