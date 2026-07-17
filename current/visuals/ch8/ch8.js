(() => {
  const cleanups = [];
  let autoplayTimer = 0;

  const I = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const D = (source) => (window.texDisplay ? window.texDisplay(source) : `<pre>${source}</pre>`);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const fmt = (value) => {
    if (Math.abs(value) < 1e-10) return "0";
    if (Math.abs(value - Math.round(value)) < 1e-10) return String(Math.round(value));
    return Number(value.toFixed(2)).toString();
  };

  function on(target, type, handler, options) {
    target?.addEventListener(type, handler, options);
    cleanups.push(() => target?.removeEventListener(type, handler, options));
  }

  function stopAutoplay() {
    if (autoplayTimer) window.clearInterval(autoplayTimer);
    autoplayTimer = 0;
  }

  function teardown() {
    stopAutoplay();
    while (cleanups.length) cleanups.pop()();
  }

  function matrix2(values) {
    return D(`\\begin{bmatrix}${values[0][0]}&${values[0][1]}\\\\${values[1][0]}&${values[1][1]}\\end{bmatrix}`);
  }

  function matrixN(rows) {
    return D(`\\begin{bmatrix}${rows.map((row) => row.join("&")).join("\\\\")}\\end{bmatrix}`);
  }

  function setPressed(group, active) {
    group.querySelectorAll("button").forEach((button) => {
      const selected = button === active;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  const lambdaPresets = {
    distinct: {
      label: "两个不同实特征值",
      A: [[3, 1], [0, 1]],
      polynomial: "(\\lambda-3)(\\lambda-1)",
      rootsR: [1, 3],
      rootsC: ["1", "3"],
      range: [-1, 5],
      note: "两个特征值各提供一个特征方向。",
    },
    diagonalRepeated: {
      label: "重根且可对角化",
      A: [[2, 0], [0, 2]],
      polynomial: "(\\lambda-2)^2",
      rootsR: [2],
      rootsC: ["2（重数 2）"],
      range: [-1, 5],
      note: "在 λ=2 时特征矩阵为零矩阵，核维数为 2。",
    },
    jordanRepeated: {
      label: "重根但不可对角化",
      A: [[2, 1], [0, 2]],
      polynomial: "(\\lambda-2)^2",
      rootsR: [2],
      rootsC: ["2（重数 2）"],
      range: [-1, 5],
      note: "在 λ=2 时秩为 1，核维数只有 1。",
    },
    rotation: {
      label: "实数域无特征值",
      A: [[0, -1], [1, 0]],
      polynomial: "\\lambda^2+1",
      rootsR: [],
      rootsC: ["i", "-i"],
      range: [-3, 3],
      note: "实参数扫描不会奇异；扩到复数域后根为 ±i。",
    },
  };

  function mountLambdaScanner(host) {
    host.innerHTML = `
      <div class="ch8-lab ch8-lambda-lab">
        <div class="ch8-lab-toolbar">
          <label>矩阵预设<select data-lambda-preset>${Object.entries(lambdaPresets)
            .map(([id, item]) => `<option value="${id}">${item.label}</option>`)
            .join("")}</select></label>
          <div class="ch8-segmented" data-lambda-field role="group" aria-label="底域">
            <button type="button" class="is-active" data-field="R" aria-pressed="true">实数域 R</button>
            <button type="button" data-field="C" aria-pressed="false">复数域 C</button>
          </div>
        </div>
        <div class="ch8-lambda-layout">
          <div class="ch8-plot-card">
            <canvas data-lambda-plot width="720" height="360" aria-label="特征多项式曲线"></canvas>
            <div class="ch8-lambda-control">
              <label for="ch8-lambda-range">当前 λ <strong data-lambda-value>0</strong></label>
              <input id="ch8-lambda-range" data-lambda-range type="range" step="0.05" />
              <div class="ch8-root-shortcuts" data-lambda-roots></div>
            </div>
          </div>
          <div class="ch8-status-stack">
            <article><span>原矩阵 A</span><div data-lambda-a></div></article>
            <article><span>当前特征矩阵</span><div data-lambda-matrix></div></article>
            <article class="ch8-status-primary"><span>结构状态</span><div class="ch8-metric-row"><b data-lambda-det></b><b data-lambda-rank></b><b data-lambda-nullity></b></div><p data-lambda-kernel></p></article>
            <article><span>特征多项式与根</span><div data-lambda-polynomial></div><p data-lambda-root-list></p></article>
          </div>
        </div>
        <p class="ch8-lab-note" data-lambda-note></p>
      </div>`;

    const presetSelect = host.querySelector("[data-lambda-preset]");
    const fieldGroup = host.querySelector("[data-lambda-field]");
    const range = host.querySelector("[data-lambda-range]");
    const canvas = host.querySelector("[data-lambda-plot]");
    let presetId = "distinct";
    let field = "R";

    function currentPreset() {
      return lambdaPresets[presetId];
    }

    function detAt(preset, lambda) {
      const [[a, b], [c, d]] = preset.A;
      return (lambda - a) * (lambda - d) - b * c;
    }

    function matrixAt(preset, lambda) {
      const [[a, b], [c, d]] = preset.A;
      return [[fmt(lambda - a), fmt(-b)], [fmt(-c), fmt(lambda - d)]];
    }

    function rankAndKernel(matrix) {
      const numeric = matrix.map((row) => row.map(Number));
      const entries = numeric.flat();
      const zero = entries.every((value) => Math.abs(value) < 1e-9);
      if (zero) return { rank: 0, nullity: 2, kernel: "整个平面都是核：任意非零向量都是特征向量。" };
      const det = numeric[0][0] * numeric[1][1] - numeric[0][1] * numeric[1][0];
      if (Math.abs(det) > 1e-8) return { rank: 2, nullity: 0, kernel: "只有零解，当前参数不是特征值。" };
      const row = Math.abs(numeric[0][0]) + Math.abs(numeric[0][1]) > 1e-9 ? numeric[0] : numeric[1];
      const vector = [-row[1], row[0]];
      return {
        rank: 1,
        nullity: 1,
        kernel: `核由方向 (${fmt(vector[0])}, ${fmt(vector[1])}) 张成，出现一个特征方向。`,
      };
    }

    function drawPlot() {
      const preset = currentPreset();
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(320, rect.width || 640);
      const height = Math.max(220, rect.height || 320);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const style = getComputedStyle(host);
      const ink = style.getPropertyValue("--ch8-ink").trim() || "#23413f";
      const muted = style.getPropertyValue("--ch8-muted").trim() || "#8ca3a1";
      const accent = style.getPropertyValue("--ch8-accent").trim() || "#1c8b7d";
      const danger = style.getPropertyValue("--ch8-danger").trim() || "#bd5a48";
      const [xmin, xmax] = preset.range;
      const samples = 180;
      const values = Array.from({ length: samples + 1 }, (_, index) => {
        const x = xmin + ((xmax - xmin) * index) / samples;
        return [x, detAt(preset, x)];
      });
      const maxY = Math.max(1.4, ...values.map((item) => Math.abs(item[1]))) * 1.08;
      const pad = { left: 42, right: 18, top: 18, bottom: 34 };
      const mapX = (x) => pad.left + ((x - xmin) / (xmax - xmin)) * (width - pad.left - pad.right);
      const mapY = (y) => pad.top + ((maxY - y) / (2 * maxY)) * (height - pad.top - pad.bottom);

      ctx.strokeStyle = muted;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.32;
      ctx.beginPath();
      ctx.moveTo(pad.left, mapY(0));
      ctx.lineTo(width - pad.right, mapY(0));
      ctx.moveTo(mapX(0), pad.top);
      ctx.lineTo(mapX(0), height - pad.bottom);
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      ctx.lineJoin = "round";
      ctx.beginPath();
      values.forEach(([x, y], index) => {
        const px = mapX(x);
        const py = mapY(y);
        if (index === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      const lambda = Number(range.value);
      const y = detAt(preset, lambda);
      const singular = Math.abs(y) < 1e-8;
      ctx.strokeStyle = singular ? danger : ink;
      ctx.fillStyle = singular ? danger : ink;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(mapX(lambda), pad.top);
      ctx.lineTo(mapX(lambda), height - pad.bottom);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(mapX(lambda), mapY(y), 5.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "12px ui-monospace, monospace";
      ctx.fillStyle = ink;
      ctx.fillText("λ", width - 18, mapY(0) - 7);
      ctx.fillText("det", mapX(0) + 7, 14);
    }

    function render() {
      const preset = currentPreset();
      const lambda = Number(range.value);
      const matrix = matrixAt(preset, lambda);
      const det = detAt(preset, lambda);
      const status = rankAndKernel(matrix);
      host.querySelector("[data-lambda-value]").textContent = fmt(lambda);
      host.querySelector("[data-lambda-a]").innerHTML = matrix2(preset.A);
      host.querySelector("[data-lambda-matrix]").innerHTML = matrix2(matrix);
      host.querySelector("[data-lambda-det]").innerHTML = `${I(`\\det=${fmt(det)}`)}`;
      host.querySelector("[data-lambda-rank]").innerHTML = `${I(`\\operatorname{rank}=${status.rank}`)}`;
      host.querySelector("[data-lambda-nullity]").innerHTML = `${I(`\\dim\\ker=${status.nullity}`)}`;
      host.querySelector("[data-lambda-kernel]").textContent = status.kernel;
      host.querySelector("[data-lambda-polynomial]").innerHTML = D(`\\chi_A(\\lambda)=${preset.polynomial}`);
      host.querySelector("[data-lambda-root-list]").textContent =
        field === "R"
          ? preset.rootsR.length
            ? `实特征值：${preset.rootsR.join("，")}`
            : "实数域中没有特征值。"
          : `复数域中的根：${preset.rootsC.join("，")}`;
      host.querySelector("[data-lambda-note]").textContent = preset.note;
      drawPlot();
    }

    function configurePreset() {
      const preset = currentPreset();
      range.min = preset.range[0];
      range.max = preset.range[1];
      range.value = presetId === "rotation" ? 0 : preset.rootsR[0] ?? 0;
      const rootHost = host.querySelector("[data-lambda-roots]");
      rootHost.innerHTML = preset.rootsR.length
        ? `<span>跳到奇异参数</span>${preset.rootsR.map((root) => `<button type="button" data-root="${root}">λ=${root}</button>`).join("")}`
        : `<span>实数域无奇异参数</span>`;
      rootHost.querySelectorAll("button").forEach((button) => on(button, "click", () => {
        range.value = button.dataset.root;
        render();
      }));
      render();
    }

    on(presetSelect, "change", () => {
      presetId = presetSelect.value;
      configurePreset();
    });
    on(range, "input", render);
    fieldGroup.querySelectorAll("button").forEach((button) => on(button, "click", () => {
      field = button.dataset.field;
      setPressed(fieldGroup, button);
      render();
    }));
    on(window, "resize", drawPlot, { passive: true });
    configurePreset();
  }

  const smithSteps = [
    {
      op: "初始矩阵",
      kind: "起点",
      matrix: "\\begin{bmatrix}\\lambda&1\\\\0&\\lambda\\end{bmatrix}",
      U: "I",
      V: "I",
      note: "单位 1 已经出现，但还不在枢轴位置。",
    },
    {
      op: "C₁ ↔ C₂",
      kind: "列交换",
      matrix: "\\begin{bmatrix}1&\\lambda\\\\\\lambda&0\\end{bmatrix}",
      U: "I",
      V: "\\begin{bmatrix}0&1\\\\1&0\\end{bmatrix}",
      note: "把单位移到左上角；列交换对应右乘。",
    },
    {
      op: "R₂ ← R₂ − λR₁",
      kind: "行倍加",
      matrix: "\\begin{bmatrix}1&\\lambda\\\\0&-\\lambda^2\\end{bmatrix}",
      U: "\\begin{bmatrix}1&0\\\\-\\lambda&1\\end{bmatrix}",
      V: "\\begin{bmatrix}0&1\\\\1&0\\end{bmatrix}",
      note: "倍加操作可逆，逆操作是加上 λR₁。",
    },
    {
      op: "C₂ ← C₂ − λC₁",
      kind: "列倍加",
      matrix: "\\begin{bmatrix}1&0\\\\0&-\\lambda^2\\end{bmatrix}",
      U: "\\begin{bmatrix}1&0\\\\-\\lambda&1\\end{bmatrix}",
      V: "\\begin{bmatrix}0&1\\\\1&-\\lambda\\end{bmatrix}",
      note: "第一行和第一列已经清零，只剩一个对角项。",
    },
    {
      op: "R₂ ← −R₂",
      kind: "单位倍乘",
      matrix: "\\begin{bmatrix}1&0\\\\0&\\lambda^2\\end{bmatrix}",
      U: "\\begin{bmatrix}1&0\\\\\\lambda&-1\\end{bmatrix}",
      V: "\\begin{bmatrix}0&1\\\\1&-\\lambda\\end{bmatrix}",
      note: "−1 是单位；最终对角元首一且 1 | λ²。",
    },
  ];

  function mountSmithStepper(host) {
    host.innerHTML = `
      <div class="ch8-lab ch8-smith-lab">
        <div class="ch8-stepper-head">
          <div><span data-smith-count></span><h3 data-smith-op></h3><p data-smith-kind></p></div>
          <div class="ch8-stepper-actions">
            <button type="button" data-smith-prev>上一步</button><button type="button" class="is-primary" data-smith-next>下一步</button><button type="button" data-smith-auto>自动播放</button><button type="button" data-smith-reset>重置</button>
          </div>
        </div>
        <div class="ch8-smith-equation">
          <article><span>累计 U(λ)</span><div data-smith-u></div></article><strong>·</strong>
          <article><span>初始 A₀(λ)</span><div>${D("\\begin{bmatrix}\\lambda&1\\\\0&\\lambda\\end{bmatrix}")}</div></article><strong>·</strong>
          <article><span>累计 V(λ)</span><div data-smith-v></div></article><strong>=</strong>
          <article class="is-current"><span>当前矩阵</span><div data-smith-matrix></div></article>
        </div>
        <div class="ch8-smith-ledger">
          ${smithSteps.map((step, index) => `<button type="button" data-smith-jump="${index}"><span>${index}</span><b>${step.op}</b></button>`).join("")}
        </div>
        <div class="ch8-verification"><strong data-smith-status></strong><p data-smith-note></p></div>
        <div class="ch8-illegal-row">
          <span>判断操作是否合法：</span>
          <button type="button" data-illegal="multiply-lambda">R₁ ← λR₁</button>
          <button type="button" data-illegal="divide">C₂ ← C₂/(λ−1)</button>
          <button type="button" data-illegal="add">R₂ ← R₂+(λ²+1)R₁</button>
          <p data-illegal-feedback aria-live="polite"></p>
        </div>
      </div>`;
    let index = 0;
    const prev = host.querySelector("[data-smith-prev]");
    const next = host.querySelector("[data-smith-next]");
    const auto = host.querySelector("[data-smith-auto]");

    function render() {
      const step = smithSteps[index];
      host.querySelector("[data-smith-count]").textContent = `步骤 ${index + 1} / ${smithSteps.length}`;
      host.querySelector("[data-smith-op]").textContent = step.op;
      host.querySelector("[data-smith-kind]").textContent = step.kind;
      host.querySelector("[data-smith-u]").innerHTML = D(step.U);
      host.querySelector("[data-smith-v]").innerHTML = D(step.V);
      host.querySelector("[data-smith-matrix]").innerHTML = D(step.matrix);
      host.querySelector("[data-smith-note]").textContent = step.note;
      host.querySelector("[data-smith-status]").textContent = index === smithSteps.length - 1 ? "Smith 标准形已完成" : "等价关系校验通过";
      prev.disabled = index === 0;
      next.disabled = index === smithSteps.length - 1;
      host.querySelectorAll("[data-smith-jump]").forEach((button) => button.classList.toggle("is-active", Number(button.dataset.smithJump) === index));
    }

    function stepNext() {
      if (index < smithSteps.length - 1) index += 1;
      else stopAutoplay();
      render();
    }

    on(prev, "click", () => { index = Math.max(0, index - 1); render(); });
    on(next, "click", stepNext);
    on(host.querySelector("[data-smith-reset]"), "click", () => { stopAutoplay(); index = 0; auto.textContent = "自动播放"; render(); });
    on(auto, "click", () => {
      if (autoplayTimer) {
        stopAutoplay();
        auto.textContent = "自动播放";
        return;
      }
      if (index === smithSteps.length - 1) index = 0;
      auto.textContent = "暂停";
      autoplayTimer = window.setInterval(() => {
        if (index === smithSteps.length - 1) {
          stopAutoplay();
          auto.textContent = "自动播放";
          return;
        }
        stepNext();
      }, 1150);
      render();
    });
    host.querySelectorAll("[data-smith-jump]").forEach((button) => on(button, "click", () => { stopAutoplay(); auto.textContent = "自动播放"; index = Number(button.dataset.smithJump); render(); }));
    host.querySelectorAll("[data-illegal]").forEach((button) => on(button, "click", () => {
      const messages = {
        "multiply-lambda": "不合法：λ 不是 F[λ] 中的单位，操作没有多项式逆。",
        divide: "不合法：除以非单位多项式会离开 F[λ]，也不是可逆初等变换。",
        add: "合法：加上另一行的任意多项式倍数，逆操作是减去同一倍数。",
      };
      host.querySelector("[data-illegal-feedback]").textContent = messages[button.dataset.illegal];
    }));
    render();
  }

  const invariantPresets = {
    diagonal: {
      label: "A = 2I",
      matrix: "\\begin{bmatrix}\\lambda-2&0\\\\0&\\lambda-2\\end{bmatrix}",
      minors1: ["\\lambda-2", "0", "0", "\\lambda-2"],
      minors2: ["(\\lambda-2)^2"],
      D1: "\\lambda-2",
      D2: "(\\lambda-2)^2",
      factors: ["\\lambda-2", "\\lambda-2"],
      min: "\\lambda-2",
      char: "(\\lambda-2)^2",
      verdict: "两个一阶不变因子，对应两个独立的一阶块。",
    },
    jordan: {
      label: "B = J₂(2)",
      matrix: "\\begin{bmatrix}\\lambda-2&-1\\\\0&\\lambda-2\\end{bmatrix}",
      minors1: ["\\lambda-2", "-1", "0", "\\lambda-2"],
      minors2: ["(\\lambda-2)^2"],
      D1: "1",
      D2: "(\\lambda-2)^2",
      factors: ["1", "(\\lambda-2)^2"],
      min: "(\\lambda-2)^2",
      char: "(\\lambda-2)^2",
      verdict: "特征多项式相同，但最大不变因子含平方，只有一个二阶块。",
    },
    mixed: {
      label: "J₂(1) ⊕ [−2]",
      matrix: "\\begin{bmatrix}\\lambda-1&-1&0\\\\0&\\lambda-1&0\\\\0&0&\\lambda+2\\end{bmatrix}",
      minors1: ["\\lambda-1", "-1", "\\lambda+2", "0"],
      minors2: ["(\\lambda-1)^2", "(\\lambda-1)(\\lambda+2)", "-(\\lambda+2)"],
      minors3: ["(\\lambda-1)^2(\\lambda+2)"],
      D1: "1",
      D2: "1",
      D3: "(\\lambda-1)^2(\\lambda+2)",
      factors: ["1", "1", "(\\lambda-1)^2(\\lambda+2)"],
      min: "(\\lambda-1)^2(\\lambda+2)",
      char: "(\\lambda-1)^2(\\lambda+2)",
      verdict: "互素的局部因子被合并到最大不变因子中。",
    },
  };

  function mountInvariantPipeline(host) {
    host.innerHTML = `
      <div class="ch8-lab ch8-invariant-lab">
        <div class="ch8-lab-toolbar">
          <label>预设<select data-invariant-preset>${Object.entries(invariantPresets).map(([id, item]) => `<option value="${id}">${item.label}</option>`).join("")}</select></label>
          <div class="ch8-segmented" data-invariant-stage role="group" aria-label="查看层级">
            <button type="button" class="is-active" data-stage="1" aria-pressed="true">一阶子式</button><button type="button" data-stage="2" aria-pressed="false">高阶子式</button><button type="button" data-stage="3" aria-pressed="false">不变因子</button>
          </div>
        </div>
        <div class="ch8-invariant-layout">
          <article class="ch8-matrix-card"><span>特征矩阵</span><div data-invariant-matrix></div></article>
          <div class="ch8-pipeline-arrow">→</div>
          <article class="ch8-minor-card"><span data-invariant-minor-title></span><div class="ch8-minor-list" data-invariant-minors></div><p data-invariant-gcd></p></article>
          <div class="ch8-pipeline-arrow">→</div>
          <article class="ch8-factor-card"><span>结构指纹</span><div data-invariant-factors></div><p data-invariant-verdict></p></article>
        </div>
        <div class="ch8-invariant-readouts"><div><span>特征多项式</span><b data-invariant-char></b></div><div><span>最小多项式</span><b data-invariant-min></b></div></div>
      </div>`;
    const select = host.querySelector("[data-invariant-preset]");
    const stages = host.querySelector("[data-invariant-stage]");
    let stage = 1;

    function render() {
      const preset = invariantPresets[select.value];
      const maxOrder = preset.minors3 ? 3 : 2;
      const order = stage === 1 ? 1 : stage === 2 ? maxOrder : maxOrder;
      const minors = preset[`minors${order}`] || preset.minors2;
      const Dk = preset[`D${order}`] || preset.D2;
      host.querySelector("[data-invariant-matrix]").innerHTML = D(preset.matrix);
      host.querySelector("[data-invariant-minor-title]").textContent = stage === 3 ? "由 Dₖ 相邻相除" : `${order} 阶子式与首一 gcd`;
      host.querySelector("[data-invariant-minors]").innerHTML = stage === 3
        ? preset.factors.map((factor, index) => `<span>${I(`d_${index + 1}=${factor}`)}</span>`).join("")
        : minors.map((minor) => `<span>${I(minor)}</span>`).join("");
      host.querySelector("[data-invariant-gcd]").innerHTML = stage === 3
        ? `${I("D_k=d_1\\cdots d_k")}，每层由相邻商取出。`
        : `首一最大公因式：${I(`D_${order}=${Dk}`)}`;
      host.querySelector("[data-invariant-factors]").innerHTML = preset.factors.map((factor, index) => `<div><span>d${index + 1}</span>${I(factor)}</div>`).join("");
      host.querySelector("[data-invariant-verdict]").textContent = preset.verdict;
      host.querySelector("[data-invariant-char]").innerHTML = I(preset.char);
      host.querySelector("[data-invariant-min]").innerHTML = I(preset.min);
    }

    on(select, "change", render);
    stages.querySelectorAll("button").forEach((button) => on(button, "click", () => {
      stage = Number(button.dataset.stage);
      setPressed(stages, button);
      render();
    }));
    render();
  }

  const passportPresets = {
    similar: {
      label: "元素不同但相似",
      pair: "J₂(1) 与 J₂(1)ᵀ",
      rows: [
        ["迹", "2 = 2", "通过", "necessary"],
        ["行列式", "1 = 1", "通过", "necessary"],
        ["特征多项式", "(λ−1)²", "通过", "necessary"],
        ["最小多项式", "(λ−1)²", "通过", "necessary"],
        ["不变因子", "1, (λ−1)²", "完全相同", "complete"],
      ],
      result: "相似：完整不变因子相同。",
      tone: "yes",
    },
    traceDet: {
      label: "同迹同行列式仍不够",
      pair: "diag(0,1,2) 与 diag(0,0,3)",
      rows: [
        ["迹", "3 = 3", "通过", "necessary"],
        ["行列式", "0 = 0", "通过", "necessary"],
        ["特征多项式", "λ(λ−1)(λ−2) ≠ λ²(λ−3)", "不匹配", "fail"],
        ["最小多项式", "无需继续", "已排除", "locked"],
        ["不变因子", "无需继续", "已排除", "locked"],
      ],
      result: "不相似：特征多项式已经不同。",
      tone: "no",
    },
    sameChar: {
      label: "同特征多项式但不相似",
      pair: "2I 与 J₂(2)",
      rows: [
        ["迹", "4 = 4", "通过", "necessary"],
        ["行列式", "4 = 4", "通过", "necessary"],
        ["特征多项式", "(λ−2)²", "通过", "necessary"],
        ["最小多项式", "λ−2 ≠ (λ−2)²", "不匹配", "fail"],
        ["不变因子", "(λ−2),(λ−2) ≠ 1,(λ−2)²", "不匹配", "fail"],
      ],
      result: "不相似：同特征多项式没有记录块分配。",
      tone: "no",
    },
    sameCharMin: {
      label: "同 χ 与 m 仍可能不够",
      pair: "J₃(0)⊕J₃(0) 与 J₃(0)⊕J₂(0)⊕J₁(0)",
      rows: [
        ["迹", "0 = 0", "通过", "necessary"],
        ["行列式", "0 = 0", "通过", "necessary"],
        ["特征多项式", "λ⁶", "通过", "necessary"],
        ["最小多项式", "λ³", "通过但不充分", "necessary"],
        ["不变因子", "λ³,λ³ ≠ λ,λ²,λ³", "不匹配", "fail"],
      ],
      result: "不相似：最高幂相同，但块的完整分配不同。",
      tone: "no",
    },
    blockOrder: {
      label: "块顺序不同但相似",
      pair: "J₂(1)⊕[2] 与 [2]⊕J₂(1)",
      rows: [
        ["迹", "4 = 4", "通过", "necessary"],
        ["行列式", "2 = 2", "通过", "necessary"],
        ["特征多项式", "(λ−1)²(λ−2)", "通过", "necessary"],
        ["最小多项式", "(λ−1)²(λ−2)", "通过", "necessary"],
        ["不变因子", "1,1,(λ−1)²(λ−2)", "完全相同", "complete"],
      ],
      result: "相似：块排列不影响相似类。",
      tone: "yes",
    },
  };

  function mountSimilarityPassport(host) {
    host.innerHTML = `
      <div class="ch8-lab ch8-passport-lab">
        <div class="ch8-lab-toolbar"><label>比较预设<select data-passport-preset>${Object.entries(passportPresets).map(([id, item]) => `<option value="${id}">${item.label}</option>`).join("")}</select></label><div class="ch8-passport-actions"><button type="button" data-passport-next>打开下一栏</button><button type="button" data-passport-all>全部展开</button><button type="button" data-passport-reset>重置</button></div></div>
        <div class="ch8-passport-pair" data-passport-pair></div>
        <div class="ch8-passport-table" data-passport-table></div>
        <div class="ch8-passport-result" data-passport-result aria-live="polite"></div>
        <div class="ch8-logic-chain"><span>相似</span><i>⇒</i><span>不变因子相同</span><i>⇒</i><span>最小/特征多项式相同</span><i>⇒</i><span>迹、行列式相同</span></div>
      </div>`;
    const select = host.querySelector("[data-passport-preset]");
    let revealed = 1;

    function render() {
      const preset = passportPresets[select.value];
      host.querySelector("[data-passport-pair]").innerHTML = `<span>正在比较</span><strong>${preset.pair}</strong>`;
      host.querySelector("[data-passport-table]").innerHTML = preset.rows
        .map((row, index) => `<div class="${index < revealed ? "is-visible" : "is-locked"}" data-tone="${row[3]}"><span>${row[0]}</span><b>${row[1]}</b><em>${index < revealed ? row[2] : "尚未检查"}</em></div>`)
        .join("");
      const complete = revealed >= preset.rows.length || preset.rows.slice(0, revealed).some((row) => row[3] === "fail");
      host.querySelector("[data-passport-result]").innerHTML = complete ? `<strong data-tone="${preset.tone}">${preset.result}</strong>` : `<span>继续打开证件栏，不要过早下结论。</span>`;
      host.querySelector("[data-passport-next]").disabled = revealed >= preset.rows.length;
    }

    on(select, "change", () => { revealed = 1; render(); });
    on(host.querySelector("[data-passport-next]"), "click", () => { revealed = Math.min(passportPresets[select.value].rows.length, revealed + 1); render(); });
    on(host.querySelector("[data-passport-all]"), "click", () => { revealed = passportPresets[select.value].rows.length; render(); });
    on(host.querySelector("[data-passport-reset]"), "click", () => { revealed = 1; render(); });
    render();
  }

  const factorPresets = {
    chain: {
      label: "三层整除链",
      invariants: ["λ−1", "(λ−1)²(λ+2)", "(λ−1)⁴(λ+2)²"],
      byField: {
        R: ["(λ−1)", "(λ−1)²", "(λ+2)", "(λ−1)⁴", "(λ+2)²"],
        C: ["(λ−1)", "(λ−1)²", "(λ+2)", "(λ−1)⁴", "(λ+2)²"],
        Q: ["(λ−1)", "(λ−1)²", "(λ+2)", "(λ−1)⁴", "(λ+2)²"],
      },
      regroup: ["λ−1", "(λ−1)²(λ+2)", "(λ−1)⁴(λ+2)²"],
      groups: { "λ−1": [1, 2, 4], "λ+2": [1, 2] },
    },
    quadratic: {
      label: "底域敏感因子",
      invariants: ["1", "(λ²+1)²"],
      byField: {
        R: ["(λ²+1)²"],
        Q: ["(λ²+1)²"],
        C: ["(λ−i)²", "(λ+i)²"],
      },
      regroup: ["1", "(λ²+1)²"],
      groups: { "λ²+1": [2], "λ−i / λ+i": [2, 2] },
    },
    mixed: {
      label: "多个不可约族",
      invariants: ["λ²+1", "(λ²+1)(λ−2)²", "(λ²+1)³(λ−2)⁴"],
      byField: {
        R: ["λ²+1", "λ²+1", "(λ−2)²", "(λ²+1)³", "(λ−2)⁴"],
        Q: ["λ²+1", "λ²+1", "(λ−2)²", "(λ²+1)³", "(λ−2)⁴"],
        C: ["λ−i", "λ+i", "λ−i", "λ+i", "(λ−2)²", "(λ−i)³", "(λ+i)³", "(λ−2)⁴"],
      },
      regroup: ["λ²+1", "(λ²+1)(λ−2)²", "(λ²+1)³(λ−2)⁴"],
      groups: { "λ²+1": [1, 1, 3], "λ−2": [2, 4] },
    },
  };

  function mountElementaryFactorizer(host) {
    host.innerHTML = `
      <div class="ch8-lab ch8-factorizer-lab">
        <div class="ch8-lab-toolbar">
          <label>不变因子预设<select data-factor-preset>${Object.entries(factorPresets).map(([id, item]) => `<option value="${id}">${item.label}</option>`).join("")}</select></label>
          <div class="ch8-segmented" data-factor-field role="group" aria-label="底域"><button type="button" data-field="Q" aria-pressed="false">Q</button><button type="button" class="is-active" data-field="R" aria-pressed="true">R</button><button type="button" data-field="C" aria-pressed="false">C</button></div>
          <div class="ch8-factor-actions"><button type="button" data-factor-mode="split" class="is-active">拆分</button><button type="button" data-factor-mode="regroup">重组</button></div>
        </div>
        <div class="ch8-factor-layout">
          <article><span>不变因子整除链</span><div class="ch8-invariant-chain" data-factor-invariants></div></article>
          <div class="ch8-pipeline-arrow">⇄</div>
          <article><span data-factor-output-title>初等因子多重集</span><div class="ch8-factor-bricks" data-factor-output></div></article>
        </div>
        <div class="ch8-factor-groups" data-factor-groups></div>
        <p class="ch8-lab-note" data-factor-note></p>
      </div>`;
    const select = host.querySelector("[data-factor-preset]");
    const fieldGroup = host.querySelector("[data-factor-field]");
    let field = "R";
    let mode = "split";

    function render() {
      const preset = factorPresets[select.value];
      host.querySelector("[data-factor-invariants]").innerHTML = preset.invariants.map((item, index) => `<div><span>d${index + 1}</span><b>${item}</b>${index < preset.invariants.length - 1 ? "<i>∣</i>" : ""}</div>`).join("");
      const items = mode === "split" ? preset.byField[field] : preset.regroup;
      host.querySelector("[data-factor-output-title]").textContent = mode === "split" ? `初等因子多重集（${field}）` : "按最大指数端对齐后的不变因子";
      host.querySelector("[data-factor-output]").innerHTML = items.map((item, index) => `<div><span>${mode === "split" ? index + 1 : `d${index + 1}`}</span><b>${item}</b></div>`).join("");
      host.querySelector("[data-factor-groups]").innerHTML = Object.entries(preset.groups).map(([name, exponents]) => `<div><strong>${name}</strong><span>指数序列：${exponents.join("，")}</span><i>从最大指数端对齐</i></div>`).join("");
      host.querySelector("[data-factor-note]").textContent =
        select.value === "quadratic" && field === "C"
          ? "扩到复数域后，λ²+1 分裂成两个一次因子；两个初等因子都必须保留。"
          : mode === "split"
            ? "每次出现的不可约幂都是独立对象；相同项也不能合并。"
            : "重组结果与原整除链一致，说明初等因子与不变因子携带同一份分类信息。";
    }

    on(select, "change", render);
    fieldGroup.querySelectorAll("button").forEach((button) => on(button, "click", () => { field = button.dataset.field; setPressed(fieldGroup, button); render(); }));
    host.querySelectorAll("[data-factor-mode]").forEach((button) => on(button, "click", () => {
      mode = button.dataset.factorMode;
      host.querySelectorAll("[data-factor-mode]").forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    }));
    render();
  }

  const jordanPresets = {
    diagonal: { label: "完全可对角化：1+1+1", eigen: 2, blocks: [1, 1, 1], chain: 1 },
    single: { label: "单个三阶块", eigen: 3, blocks: [3], chain: 3 },
    threeTwo: { label: "J₃(3) ⊕ J₂(3)", eigen: 3, blocks: [3, 2], chain: 3 },
    mixed: { label: "J₂(1) ⊕ J₁(1) ⊕ J₂(−2)", eigen: 1, blocks: [2, 1], chain: 2, secondary: { eigen: -2, blocks: [2] } },
  };

  function kernelNu(blocks, power) {
    return blocks.reduce((sum, size) => sum + Math.min(size, power), 0);
  }

  function jordanBlockLatex(size, eigen) {
    const rows = Array.from({ length: size }, (_, r) => Array.from({ length: size }, (_, c) => (r === c ? String(eigen) : c === r + 1 ? "1" : "0")));
    return `\\begin{bmatrix}${rows.map((row) => row.join("&")).join("\\\\")}\\end{bmatrix}`;
  }

  function mountJordanBuilder(host) {
    host.innerHTML = `
      <div class="ch8-lab ch8-jordan-lab">
        <div class="ch8-lab-toolbar"><label>块结构预设<select data-jordan-preset>${Object.entries(jordanPresets).map(([id, item]) => `<option value="${id}">${item.label}</option>`).join("")}</select></label><div class="ch8-jordan-actions"><button type="button" data-chain-next>加入下一个链向量</button><button type="button" data-chain-reset>重置链</button></div></div>
        <div class="ch8-jordan-layout">
          <article class="ch8-chain-card"><span>若尔当链：N = A − λ₀I</span><div class="ch8-chain" data-jordan-chain></div><p data-jordan-chain-note></p></article>
          <article class="ch8-block-card"><span>链基下的块</span><div data-jordan-block></div><div class="ch8-column-explain" data-jordan-columns></div></article>
        </div>
        <div class="ch8-kernel-meter">
          <div class="ch8-kernel-head"><div><span>核维数增长</span><strong data-kernel-formula></strong></div><div class="ch8-power-buttons" data-kernel-powers></div></div>
          <div class="ch8-kernel-bars" data-kernel-bars></div>
          <div class="ch8-block-strip" data-jordan-blocks></div>
          <p data-kernel-reading></p>
        </div>
      </div>`;
    const select = host.querySelector("[data-jordan-preset]");
    let revealed = 1;
    let power = 1;

    function render() {
      const preset = jordanPresets[select.value];
      const chainLength = preset.chain;
      revealed = clamp(revealed, 1, chainLength);
      const nodes = [];
      for (let k = revealed; k >= 1; k -= 1) {
        nodes.push(`<span class="${k === 1 ? "is-eigen" : ""}">v${k}</span>`);
        nodes.push(`<i>${k === 1 ? "N" : "N"}</i>`);
      }
      nodes.push("<span class=\"is-zero\">0</span>");
      host.querySelector("[data-jordan-chain]").innerHTML = nodes.join("");
      host.querySelector("[data-jordan-chain-note]").innerHTML = revealed < chainLength
        ? `继续寻找 ${I(`v_${revealed + 1}`)}，使 ${I(`Nv_${revealed + 1}=v_${revealed}`)}。`
        : `链已完成：${I(`Nv_1=0`)}，且每个高阶向量落到前一个。`;
      host.querySelector("[data-jordan-block]").innerHTML = D(jordanBlockLatex(revealed, preset.eigen));
      host.querySelector("[data-jordan-columns]").innerHTML = Array.from({ length: revealed }, (_, index) => `<span>${index === 0 ? `Av₁=${preset.eigen}v₁` : `Av${index + 1}=${preset.eigen}v${index + 1}+v${index}`}</span>`).join("");
      host.querySelector("[data-chain-next]").disabled = revealed >= chainLength;

      const maxPower = Math.max(...preset.blocks) + 1;
      host.querySelector("[data-kernel-powers]").innerHTML = Array.from({ length: maxPower }, (_, index) => `<button type="button" data-power="${index + 1}" class="${power === index + 1 ? "is-active" : ""}">${index + 1}</button>`).join("");
      host.querySelectorAll("[data-power]").forEach((button) => on(button, "click", () => { power = Number(button.dataset.power); render(); }));
      const sequence = Array.from({ length: maxPower }, (_, index) => kernelNu(preset.blocks, index + 1));
      const maxNu = sequence[sequence.length - 1];
      host.querySelector("[data-kernel-bars]").innerHTML = sequence.map((nu, index) => `<div class="${power === index + 1 ? "is-active" : ""}"><span style="--height:${(nu / maxNu) * 100}%"></span><b>ν${index + 1}=${nu}</b></div>`).join("");
      const nu = kernelNu(preset.blocks, power);
      const previous = power === 1 ? 0 : kernelNu(preset.blocks, power - 1);
      host.querySelector("[data-kernel-formula]").innerHTML = I(`\\nu_${power}=\\dim\\ker N^${power}=${nu}`);
      host.querySelector("[data-jordan-blocks]").innerHTML = preset.blocks.map((size, index) => `<div style="--size:${size}"><span>块 ${index + 1}</span><b>J${size}(${preset.eigen})</b></div>`).join("");
      host.querySelector("[data-kernel-reading]").textContent = `本阶增量 ν${power}−ν${Math.max(0, power - 1)}=${nu - previous}，所以有 ${nu - previous} 个块的长度至少为 ${power}。`;
    }

    on(select, "change", () => { revealed = 1; power = 1; render(); });
    on(host.querySelector("[data-chain-next]"), "click", () => { revealed += 1; render(); });
    on(host.querySelector("[data-chain-reset]"), "click", () => { revealed = 1; render(); });
    render();
  }

  const krylovPresets = {
    cubic: {
      label: "p(λ)=λ³−2λ+1",
      degree: 3,
      polynomial: "\\lambda^3-2\\lambda+1",
      relation: "A^3v=2Av-v",
      vectors: ["v", "Av", "A²v", "A³v"],
      ranks: [1, 2, 3, 3],
      companion: [["0", "0", "-1"], ["1", "0", "2"], ["0", "1", "0"]],
      feedback: "(-1,2,0)^T",
    },
    rotation: {
      label: "p(λ)=λ²+1",
      degree: 2,
      polynomial: "\\lambda^2+1",
      relation: "A^2v=-v",
      vectors: ["v", "Av", "A²v"],
      ranks: [1, 2, 2],
      companion: [["0", "-1"], ["1", "0"]],
      feedback: "(-1,0)^T",
    },
    linear: {
      label: "p(λ)=λ−1",
      degree: 1,
      polynomial: "\\lambda-1",
      relation: "Av=v",
      vectors: ["v", "Av"],
      ranks: [1, 1],
      companion: [["1"]],
      feedback: "(1)^T",
    },
  };

  function mountKrylovCompanion(host) {
    host.innerHTML = `
      <div class="ch8-lab ch8-krylov-lab">
        <div class="ch8-lab-toolbar"><label>轨道预设<select data-krylov-preset>${Object.entries(krylovPresets).map(([id, item]) => `<option value="${id}">${item.label}</option>`).join("")}</select></label><div class="ch8-krylov-actions"><button type="button" data-krylov-next>施加一次 A</button><button type="button" data-krylov-reset>重置轨道</button></div></div>
        <div class="ch8-krylov-layout">
          <article class="ch8-conveyor-card"><span>同一个向量的未来</span><div class="ch8-conveyor" data-krylov-conveyor></div><div class="ch8-rank-ledger" data-krylov-ranks></div><p data-krylov-relation></p></article>
          <article class="ch8-companion-card"><span>循环基下的友矩阵</span><div data-krylov-companion></div><p>前移列 + 反馈列 <b data-krylov-feedback></b></p></article>
        </div>
        <div class="ch8-canonical-bridge">
          <div><span>不变因子路线</span><strong>f₁ | f₂ | ··· | fₛ</strong><i>→</i><b>友矩阵块</b><i>→</i><em>有理标准形（任意域）</em></div>
          <div><span>初等因子路线</span><strong>p(λ)ᵏ</strong><i>→</i><b>若尔当块</b><i>→</i><em>若尔当标准形（需分裂）</em></div>
        </div>
        <div class="ch8-block-builder">
          <h4>不变因子块组装</h4>
          <div class="ch8-invariant-inputs"><button type="button" data-block-set="single" class="is-active">单循环块</button><button type="button" data-block-set="two">f₁=λ−1，f₂=(λ−1)(λ²+1)</button></div>
          <div data-block-output></div>
        </div>
      </div>`;
    const select = host.querySelector("[data-krylov-preset]");
    let step = 0;
    let blockSet = "single";

    function render() {
      const preset = krylovPresets[select.value];
      step = clamp(step, 0, preset.vectors.length - 1);
      host.querySelector("[data-krylov-conveyor]").innerHTML = preset.vectors.map((vector, index) => `<div class="${index <= step ? "is-visible" : ""} ${index === step ? "is-current" : ""}"><span>${vector}</span>${index < preset.vectors.length - 1 ? "<i>A</i>" : ""}</div>`).join("");
      host.querySelector("[data-krylov-ranks]").innerHTML = preset.ranks.map((rank, index) => `<span class="${index <= step ? "is-visible" : ""}">rank K${index + 1}=${rank}</span>`).join("");
      const dependent = step >= preset.degree;
      host.querySelector("[data-krylov-relation]").innerHTML = dependent
        ? `<strong>首次停止扩张：</strong>${I(preset.relation)}，对应 ${I(`p(\\lambda)=${preset.polynomial}`)}。`
        : `当前新向量仍增加张成空间维数；继续施加 ${I("A")}。`;
      host.querySelector("[data-krylov-companion]").innerHTML = step >= preset.degree ? matrixN(preset.companion) : `<div class="ch8-companion-skeleton">等待首次线性关系</div>`;
      host.querySelector("[data-krylov-feedback]").textContent = step >= preset.degree ? preset.feedback : "—";
      host.querySelector("[data-krylov-next]").disabled = step >= preset.vectors.length - 1;
      host.querySelector("[data-block-output]").innerHTML = blockSet === "single"
        ? `<div class="ch8-block-result"><span>当前块</span><b>C(${preset.polynomial.replaceAll("\\", "")})</b><em>维数 ${preset.degree}；χ=m=p</em></div>`
        : `<div class="ch8-block-result"><span>有理标准形</span><b>diag(C(λ−1), C(λ³−λ²+λ−1))</b><em>总维数 4；χ=(λ−1)²(λ²+1)；m=(λ−1)(λ²+1)</em></div>`;
    }

    on(select, "change", () => { step = 0; render(); });
    on(host.querySelector("[data-krylov-next]"), "click", () => { step += 1; render(); });
    on(host.querySelector("[data-krylov-reset]"), "click", () => { step = 0; render(); });
    host.querySelectorAll("[data-block-set]").forEach((button) => on(button, "click", () => {
      blockSet = button.dataset.blockSet;
      host.querySelectorAll("[data-block-set]").forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    }));
    render();
  }

  function bindExample(section, root) {
    const host = root.querySelector(`[data-ch8-example][data-section-id="${section.id}"]`);
    if (!host) return;
    const action = host.querySelector("[data-ch8-example-action]");
    const feedback = host.querySelector("[data-ch8-example-feedback]");
    const list = host.querySelector("[data-ch8-example-steps]");
    const choices = host.querySelectorAll('input[type="radio"]');
    let step = 0;

    function showSteps(all = false) {
      const target = all ? section.example.steps.length : Math.min(section.example.steps.length, step + 1);
      list.innerHTML = section.example.steps.slice(0, target).map((item) => `<li>${item}</li>`).join("");
      step = target;
    }

    if (choices.length) {
      choices.forEach((input) => on(input, "change", () => {
        action.disabled = false;
        action.textContent = "检查";
        feedback.textContent = "已经选择，可以检查。";
        host.querySelectorAll("label").forEach((label) => label.classList.remove("is-correct", "is-wrong"));
        list.innerHTML = "";
      }));
      on(action, "click", () => {
        if (action.dataset.state === "correct") {
          choices.forEach((input) => { input.checked = false; });
          action.dataset.state = "";
          action.textContent = "检查";
          action.disabled = true;
          feedback.textContent = "选择一个答案后再检查。";
          list.innerHTML = "";
          host.querySelectorAll("label").forEach((label) => label.classList.remove("is-correct", "is-wrong"));
          return;
        }
        const selected = [...choices].find((input) => input.checked);
        if (!selected) return;
        const correct = section.example.choices[Number(selected.value)]?.correct;
        const label = selected.closest("label");
        host.querySelectorAll("label").forEach((item) => item.classList.remove("is-correct", "is-wrong"));
        if (!correct) {
          label.classList.add("is-wrong");
          action.textContent = "再试一次";
          feedback.textContent = "这一步的结构判断还不对，解析暂不展开。";
          return;
        }
        label.classList.add("is-correct");
        action.dataset.state = "correct";
        action.textContent = "重做";
        feedback.textContent = "判断正确，完整推理已经展开。";
        showSteps(true);
      });
      return;
    }

    on(action, "click", () => {
      if (step >= section.example.steps.length) {
        step = 0;
        list.innerHTML = "";
        action.textContent = "显示第一步";
        feedback.textContent = "先独立思考，再逐步核对。";
        return;
      }
      showSteps(false);
      if (step >= section.example.steps.length) {
        action.textContent = "重新开始";
        feedback.textContent = "推理完成。现在回看每一步为什么必要。";
      } else {
        action.textContent = "显示下一步";
        feedback.textContent = `已展开 ${step}/${section.example.steps.length} 步。`;
      }
    });
  }

  const mounts = {
    "lambda-scanner": mountLambdaScanner,
    "smith-stepper": mountSmithStepper,
    "invariant-pipeline": mountInvariantPipeline,
    "similarity-passport": mountSimilarityPassport,
    "elementary-factorizer": mountElementaryFactorizer,
    "jordan-builder": mountJordanBuilder,
    "krylov-companion": mountKrylovCompanion,
  };

  window.mountChapter8 = function mountChapter8(section, root = document) {
    teardown();
    if (!section) return;
    const host = root.querySelector(`[data-ch8-lab="${section.interactive?.kind || ""}"]`);
    const mount = mounts[section.interactive?.kind];
    if (host && mount) mount(host);
    bindExample(section, root);
  };

  window.teardownChapter8 = teardown;
})();
