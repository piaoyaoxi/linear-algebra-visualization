(() => {
  const M = () => window.Ch3Math;
  const tex = (source) => M().tex(source);
  const texD = (source) => M().texD(source);

  function formalShell(title, lead, body) {
    return `<h2>${title}</h2><div class="ch3-formal"><p class="ch3-formal-lead">${lead}</p>${body}</div>`;
  }
  function module(number, title, subtitle, body) {
    return `<section class="ch3-module"><div class="ch3-module-heading"><span>${number}</span><div><h3>${title}</h3><p>${subtitle}</p></div></div>${body}</section>`;
  }
  function cards(items) {
    return `<div class="ch3-card-grid">${items.map(([kicker, title, text]) => `<article class="ch3-card"><span class="kicker">${kicker}</span><h4>${title}</h4><p>${text}</p></article>`).join("")}</div>`;
  }

  // §4 -----------------------------------------------------------------------
  function formalRank(root) {
    if (!root) return;
    root.innerHTML = formalShell(
      "定理与方法",
      "秩把四种看似不同的计数统一起来：独立列数、独立行数、主元数和最高阶非零子式的阶数。",
      module(
        "01",
        "行秩等于列秩",
        "独立输出方向与独立约束数量必然一致",
        `<div class="ch3-theorem-row"><div>${texD(String.raw`\operatorname{rank}(A)=\dim\operatorname{Col}(A)=\dim\operatorname{Row}(A)`)}</div><p>消元把行空间整理成非零阶梯行，同时保持列之间的关系。由此，主元数量同时读出行秩与列秩。</p></div>`,
      ) +
        module(
          "02",
          "两类证书",
          "算法告诉你答案，子式告诉你为什么至少这么大",
          cards([
            ["主元", "RREF 证书", "主元个数直接给出秩；主元列号指向原矩阵的一组独立列。"],
            ["子式", "非零行列式证书", "一个 r×r 子矩阵行列式非零，证明至少有 r 个独立方向。"],
            ["上界", "更高阶全部为零", "尺寸上界或消元主元数证明秩不可能更大。"],
          ]),
        ),
    );
  }

  function interactiveRank(root) {
    if (!root) return;
    root.innerHTML = `
      <h2>交互实验</h2>
      <div class="ch3-lab" data-ch3-lab="rank">
        <div class="ch3-lab-head"><span class="ch3-lab-kicker">目标 · 用三种证书读出同一个秩</span><h3>秩证书工作台</h3><p>先看列向量张成，再对照 RREF 主元与非零子式。二维画布只是投影，最终秩始终由完整矩阵精确计算。</p></div><div class="ch3-mission"><strong>操作任务</strong><span>选择“投影陷阱”：画面看似共线，但完整三维列仍然无关。</span><span class="ch3-mission-result">看结论：投影不能代替秩判定</span></div>
        <div class="ch3-presets">
          <button type="button" class="is-active" data-preset="full2">满秩 2×2</button>
          <button type="button" data-preset="rankOne">秩 1</button>
          <button type="button" data-preset="full3">满秩 3×3</button>
          <button type="button" data-preset="rankTwo3">秩 2 的 3×3</button>
          <button type="button" data-preset="projectionTrap">投影陷阱</button>
        </div>
        <div class="ch3-lab-grid">
          <div class="ch3-stage"><canvas data-canvas aria-label="矩阵列向量投影视图"></canvas></div>
          <div class="ch3-side">
            <div class="ch3-meter is-4">
              <div class="ch3-meter-card" data-rank-card><strong>rank(A)</strong><span data-rank>—</span></div>
              <div class="ch3-meter-card"><strong>尺寸</strong><span data-size>—</span></div>
              <div class="ch3-meter-card"><strong>主元列</strong><span data-pivots>—</span></div>
              <div class="ch3-meter-card"><strong>上界</strong><span data-bound>—</span></div>
            </div>
            <div class="ch3-panel"><h4>编辑矩阵</h4><div class="ch3-matrix-editor" data-editor></div></div>
            <div class="ch3-toolbar"><button type="button" data-row-add>R₂←R₂+R₁</button><button type="button" data-undo>撤销</button><button type="button" data-reset>重置预设</button></div>
          </div>
        </div>
        <div class="ch3-lab-grid">
          <div class="ch3-panel"><h4>RREF</h4><div data-rref></div></div>
          <div class="ch3-panel"><h4>原矩阵独立列</h4><div data-independent></div></div>
        </div>
        <div class="viz-callout" data-certificate></div>
        <p class="ch3-feedback" data-note aria-live="polite"></p>
      </div>`;

    const scope = M().createScope(root);
    const presets = {
      full2: [[1, 0], [0, 1]],
      rankOne: [[1, 2], [2, 4]],
      full3: [[1, 0, 1], [0, 1, 1], [1, 1, 0]],
      rankTwo3: [[1, 2, 3], [2, 4, 6], [0, 1, 1]],
      projectionTrap: [[1, 2], [0, 0], [0, 1]],
    };
    const state = { key: "full2", initial: null, A: null, history: [] };
    const canvas = root.querySelector("[data-canvas]");

    function load(key) {
      state.key = key;
      state.initial = M().matFromNumbers(presets[key]);
      state.A = M().cloneMat(state.initial);
      state.history = [M().cloneMat(state.A)];
      buildEditor();
      render();
    }

    function pushHistory() {
      state.history.push(M().cloneMat(state.A));
      if (state.history.length > 30) state.history.shift();
    }

    function buildEditor() {
      const editor = root.querySelector("[data-editor]");
      editor.style.setProperty("--ch3-cols", state.A[0].length);
      editor.innerHTML = state.A.flatMap((row, i) => row.map((value, j) => `
        <label><span class="visually-hidden">第 ${i + 1} 行第 ${j + 1} 列</span>
          <input type="text" value="${M().formatF(value)}" data-cell="${i},${j}" inputmode="decimal" />
        </label>`)).join("");
      editor.querySelectorAll("[data-cell]").forEach((input) => scope.listen(input, "change", () => {
        const [row, column] = input.dataset.cell.split(",").map(Number);
        try {
          state.A[row][column] = M().parseF(input.value);
          input.value = M().formatF(state.A[row][column]);
          pushHistory();
          render(false);
        } catch (error) {
          input.value = M().formatF(state.A[row][column]);
          root.querySelector("[data-note]").textContent = error.message;
        }
      }));
    }

    function draw() {
      const sized = M().sizeCanvas(canvas);
      if (!sized) return;
      const frame = M().drawAxes(sized.ctx, sized.width, sized.height, 46);
      const numeric = M().matToNumbers(state.A);
      if (numeric.length < 2) return;
      const columns = numeric[0].map((_, column) => numeric.map((row) => row[column]));
      M().drawSpan(sized.ctx, frame, columns.map((column) => column.slice(0, 2)), frame.p.accent);
      const colors = [frame.p.accent, frame.p.coral, frame.p.blue, frame.p.muted];
      columns.forEach((column, index) => M().drawArrow(sized.ctx, frame, [column[0], column[1]], colors[index % colors.length], `c${index + 1}`));
      if (numeric.length > 2) {
        sized.ctx.fillStyle = frame.p.muted;
        sized.ctx.font = "600 12px ui-sans-serif, system-ui";
        sized.ctx.fillText("仅显示每列的前两坐标；秩按完整矩阵计算", 14, 22);
      }
    }

    function render(rebuild = false) {
      if (rebuild) buildEditor();
      const rank = M().rankOf(state.A);
      const reduced = M().rref(state.A, state.A[0].length);
      const independent = reduced.pivots;
      const certificate = M().findRankCertificate(state.A);
      root.querySelector("[data-rank]").textContent = String(rank);
      root.querySelector("[data-size]").textContent = `${state.A.length}×${state.A[0].length}`;
      root.querySelector("[data-bound]").textContent = `≤ ${Math.min(state.A.length, state.A[0].length)}`;
      root.querySelector("[data-pivots]").textContent = independent.length ? independent.map((i) => i + 1).join(",") : "无";
      root.querySelector("[data-rref]").innerHTML = M().htmlMatrix(reduced.matrix);
      root.querySelector("[data-independent]").innerHTML = independent.length
        ? independent.map((column) => `<span class="viz-badge">原列 c${column + 1}</span>`).join(" ")
        : "没有非零独立列";
      if (certificate.rank) {
        const rows = certificate.rows.map((i) => i + 1).join(",");
        const columns = certificate.columns.map((i) => i + 1).join(",");
        root.querySelector("[data-certificate]").innerHTML = `取第 ${rows} 行、第 ${columns} 列组成的 ${certificate.rank} 阶子式，其行列式为 ${tex(M().latexF(certificate.det))}，因此 rank(A) 至少为 ${certificate.rank}；主元数给出同样的上界。`;
      } else {
        root.querySelector("[data-certificate]").textContent = "所有元素均为零，rank(A)=0。";
      }
      root.querySelector("[data-undo]").disabled = state.history.length <= 1;
      root.querySelector("[data-note]").textContent = state.key === "projectionTrap"
        ? "投影中两列共线，但完整三维列 (1,0,0)ᵀ 与 (2,0,1)ᵀ 线性无关；不要用投影替代完整判定。"
        : "行操作可能改变具体子式位置与列图形，但不会改变秩。";
      M().pulse(root.querySelector("[data-rank-card]"));
      draw();
    }

    root.querySelectorAll("[data-preset]").forEach((button) => scope.listen(button, "click", () => {
      root.querySelectorAll("[data-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
      load(button.dataset.preset);
    }));
    scope.listen(root.querySelector("[data-row-add]"), "click", () => {
      if (state.A.length < 2) return;
      state.A = M().rowAdd(state.A, 1, 0, M().F(1));
      pushHistory();
      render(true);
    });
    scope.listen(root.querySelector("[data-undo]"), "click", () => {
      if (state.history.length <= 1) return;
      state.history.pop();
      state.A = M().cloneMat(state.history[state.history.length - 1]);
      render(true);
    });
    scope.listen(root.querySelector("[data-reset]"), "click", () => load(state.key));
    scope.resize(draw);
    load("full2");
    return scope.cleanup;
  }

  // §5 -----------------------------------------------------------------------
  function formalSolvability(root) {
    if (!root) return;
    root.innerHTML = formalShell(
      "定理与判别",
      "右端 b 不是附加说明，而是目标输出。把它加入系数列后，若独立方向数量增加，就说明 A 的列无法到达它。",
      module(
        "01",
        "Rouché–Capelli 定理",
        "有解恰好等价于增广列没有创造新主元",
        `<div class="ch3-theorem-row"><div>${texD(String.raw`Ax=b\quad\Longleftrightarrow\quad\operatorname{rank}(A)=\operatorname{rank}([A\mid b])`)}</div><p>消元中的矛盾行与列空间中的“b 在外面”是同一事实的两种表达。</p></div>`,
      ) +
        module(
          "02",
          "有解之后再数自由度",
          "判有无解和判解的数量分两步完成",
          cards([
            ["无解", "增广秩更大", "b 增加了一个系数列不能生成的新方向。"],
            ["唯一", "有解且 rank=n", "没有自由变量，零空间只有 0。"],
            ["无穷", "有解且 rank<n", "至少一个自由变量生成齐次方向。"],
          ]),
        ),
    );
  }

  function interactiveSolvability(root) {
    if (!root) return;
    root.innerHTML = `
      <h2>交互实验</h2>
      <div class="ch3-lab" data-ch3-lab="solvability">
        <div class="ch3-lab-head"><span class="ch3-lab-kicker">目标 · 判断目标向量 b 是否落在列空间中</span><h3>可达性闸门</h3><p>拖动向量 b 穿过列空间边界。几何上的“能否到达”和增广矩阵是否产生新主元，是同一件事。</p></div><div class="ch3-mission"><strong>操作任务</strong><span>在“秩 1 · 在线”和“秩 1 · 线外”之间切换，再拖动 b 回到带状列空间。</span><span class="ch3-mission-result">看结论：rank(A)=rank([A|b])</span></div>
        <div class="ch3-presets">
          <button type="button" data-preset="full">满秩平面</button>
          <button type="button" class="is-active" data-preset="line">秩 1 · 在线</button>
          <button type="button" data-preset="miss">秩 1 · 线外</button>
          <button type="button" data-preset="zero">零映射</button>
        </div>
        <div class="ch3-lab-grid">
          <div class="ch3-stage"><canvas data-canvas aria-label="列空间与可拖动目标向量 b"></canvas></div>
          <div class="ch3-side">
            <div class="ch3-meter is-4">
              <div class="ch3-meter-card" data-gate-card><strong>结论</strong><span data-gate>—</span></div>
              <div class="ch3-meter-card"><strong>rank(A)</strong><span data-rank-a>—</span></div>
              <div class="ch3-meter-card"><strong>rank([A|b])</strong><span data-rank-aug>—</span></div>
              <div class="ch3-meter-card"><strong>解的数量</strong><span data-count>—</span></div>
            </div>
            <div class="ch3-panel"><h4>目标 b</h4>
              <label class="ch3-slider"><span>b₁</span><input type="range" min="-3" max="3" step="0.05" data-bx /><span data-bx-value></span></label>
              <label class="ch3-slider"><span>b₂</span><input type="range" min="-3" max="3" step="0.05" data-by /><span data-by-value></span></label>
              <button type="button" data-homogeneous>设 b=0</button>
            </div>
            <div class="ch3-panel"><h4>增广矩阵</h4><div data-matrix></div></div>
          </div>
        </div>
        <div class="ch3-lab-grid">
          <div class="ch3-panel"><h4>RREF</h4><div data-rref></div></div>
          <div class="ch3-panel"><h4>一组系数解</h4><div data-solution></div></div>
        </div>
        <div class="viz-callout" data-explanation></div>
      </div>`;

    const scope = M().createScope(root);
    const presets = {
      full: { A: [[1, 0], [0, 1]], b: [1.2, 0.8] },
      line: { A: [[1, 2], [2, 4]], b: [1, 2] },
      miss: { A: [[1, 2], [2, 4]], b: [1, 3] },
      zero: { A: [[0, 0], [0, 0]], b: [0, 0] },
    };
    const state = { key: "line", A: null, b: [1, 2] };
    const canvas = root.querySelector("[data-canvas]");

    function load(key) {
      state.key = key;
      state.A = M().matFromNumbers(presets[key].A);
      state.b = presets[key].b.slice();
      syncInputs();
      render();
    }
    function syncInputs() {
      root.querySelector("[data-bx]").value = state.b[0];
      root.querySelector("[data-by]").value = state.b[1];
    }
    function augmented() {
      return state.A.map((row, index) => [...row, M().fromNumber(state.b[index])]);
    }
    function draw() {
      const sized = M().sizeCanvas(canvas);
      if (!sized) return;
      const frame = M().drawAxes(sized.ctx, sized.width, sized.height, 48);
      const numeric = M().matToNumbers(state.A);
      const columns = numeric[0].map((_, column) => [numeric[0][column], numeric[1][column]]);
      const rank = M().rankOf(state.A);
      M().drawSpan(sized.ctx, frame, columns, frame.p.accent);
      const colors = [frame.p.accent, frame.p.coral];
      columns.forEach((column, index) => M().drawArrow(sized.ctx, frame, column, colors[index], `a${index + 1}`));
      M().drawArrow(sized.ctx, frame, state.b, M().analyzeAugmented(augmented()).inconsistent ? frame.p.coral : frame.p.blue, "b", 3.5, { tailDot: true });
      if (rank === 1) {
        sized.ctx.fillStyle = frame.p.muted;
        sized.ctx.font = "600 12px ui-sans-serif, system-ui";
        sized.ctx.fillText("虚线/带状方向表示列空间；拖动 b 穿过边界", 14, 22);
      }
    }
    function render() {
      const aug = augmented();
      const info = M().analyzeAugmented(aug);
      const classification = M().classifySystem(aug);
      const rankA = M().rankOf(state.A);
      const gate = root.querySelector("[data-gate]");
      gate.textContent = info.inconsistent ? "不可达" : "可达";
      gate.className = `ch3-status ${info.inconsistent ? "is-bad" : "is-ok"}`;
      root.querySelector("[data-rank-a]").textContent = String(rankA);
      root.querySelector("[data-rank-aug]").textContent = String(info.rankAug);
      root.querySelector("[data-count]").textContent = classification.label;
      root.querySelector("[data-bx-value]").textContent = M().formatNumber(state.b[0]);
      root.querySelector("[data-by-value]").textContent = M().formatNumber(state.b[1]);
      root.querySelector("[data-matrix]").innerHTML = M().htmlMatrix(aug, state.A[0].length);
      root.querySelector("[data-rref]").innerHTML = M().htmlMatrix(info.rref, info.n);
      const solution = M().particularSolution(aug);
      root.querySelector("[data-solution]").innerHTML = solution.ok
        ? `${tex(String.raw`x_0=`)}${M().htmlVector(solution.x)}`
        : "无解，因此不存在系数向量 x。";
      root.querySelector("[data-explanation]").innerHTML = info.inconsistent
        ? `加入 b 后秩从 ${rankA} 增加到 ${info.rankAug}；RREF 出现矛盾行，所以 ${tex(String.raw`b\notin\operatorname{Col}(A)`)}。`
        : `加入 b 后秩仍为 ${rankA}；因此 ${tex(String.raw`b\in\operatorname{Col}(A)`)}。${classification.key === "unique" ? "每个未知量列都有主元，所以解唯一。" : "仍有自由列，所以有无穷多组系数可到达同一 b。"}`;
      M().pulse(root.querySelector("[data-gate-card]"));
      draw();
    }

    root.querySelectorAll("[data-preset]").forEach((button) => scope.listen(button, "click", () => {
      root.querySelectorAll("[data-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
      load(button.dataset.preset);
    }));
    scope.listen(root.querySelector("[data-bx]"), "input", (event) => { state.b[0] = Number(event.target.value); render(); });
    scope.listen(root.querySelector("[data-by]"), "input", (event) => { state.b[1] = Number(event.target.value); render(); });
    scope.listen(root.querySelector("[data-homogeneous]"), "click", () => { state.b = [0, 0]; syncInputs(); render(); });
    M().bindDraggablePoints(scope, canvas, () => [state.b], (_, point) => {
      state.b = point.map((value) => Math.max(-3, Math.min(3, value)));
      syncInputs();
      render();
    }, render, 20);
    scope.resize(draw);
    load("line");
    return scope.cleanup;
  }

  // §6 -----------------------------------------------------------------------
  function formalSolutionStructure(root) {
    if (!root) return;
    root.innerHTML = formalShell(
      "定理与结构",
      "非齐次解集不是随意散落的一组点。选定一个特解后，任意其他解都由零空间中的方向到达。",
      module(
        "01",
        "特解加零空间",
        "差值落入核，核的平移给出全部解",
        `<div class="ch3-theorem-row"><div>${texD(String.raw`Ax=b,\ Ax_0=b\quad\Longrightarrow\quad x=x_0+x_h,\;x_h\in\operatorname{Ker}(A)`)}</div><p>反过来，任何 x₀+x_h 都满足 A(x₀+x_h)=b。两个方向合在一起就证明了通解公式。</p></div>`,
      ) +
        module(
          "02",
          "自由度与维数",
          "每个非主元列贡献一个独立参数",
          cards([
            ["nullity", "n−rank(A)", "零空间基向量个数，也是自由变量个数。"],
            ["齐次", "过原点的子空间", "特解为 0，全部解就是零空间本身。"],
            ["非齐次", "仿射平移", "通常不过原点，但方向结构与零空间完全相同。"],
          ]),
        ),
    );
  }

  function interactiveSolutionStructure(root) {
    if (!root) return;
    root.innerHTML = `
      <h2>交互实验</h2>
      <div class="ch3-lab ch3-lab--solution" data-ch3-lab="solution-structure">
        <div class="ch3-lab-head">
<span class="ch3-lab-kicker">目标 · 把“特解 + 零空间”变成看得见的位移</span>
<h3>沿着零空间生成全部解</h3>
<p>蓝色箭头 x 是当前解；青色箭头 x₀ 是一个特解；从 x₀ 出发的橙色箭头是零空间方向。改变参数，只会沿这些方向移动。</p>
        </div>
        <div class="ch3-mission">
<strong>操作任务</strong>
<span>选择“一条解直线”，拖动参数 s₁，观察 x−x₀ 始终平行 η₁。</span>
<span class="ch3-mission-result">看结论：解集 = x₀ + Ker(A)</span>
        </div>
        <div class="ch3-presets ch3-solution-presets">
<button type="button" data-preset="unique">唯一解</button>
<button type="button" class="is-active" data-preset="line">一条解直线</button>
<button type="button" data-preset="plane">一个解平面</button>
<button type="button" data-preset="homogeneous">齐次子空间</button>
<button type="button" data-preset="none">无解</button>
        </div>
        <div class="ch3-solution-layout">
<section class="ch3-stage-shell">
  <div class="ch3-stage-caption"><strong>解空间几何</strong><span data-geometry-note>二维完整视图</span></div>
  <div class="ch3-stage"><canvas data-canvas aria-label="特解、零空间方向与当前解"></canvas></div>
  <div class="ch3-stage-legend">
    <span><i class="is-accent"></i>特解 x₀</span>
    <span><i class="is-coral"></i>零空间方向 η</span>
    <span><i class="is-blue"></i>当前解 x</span>
  </div>
</section>
<aside class="ch3-solution-readout">
  <section class="ch3-equation-hero" data-solution-card>
    <span>通解结构</span>
    <div data-family></div>
    <p data-family-note>参数改变位置，不改变 Ax=b。</p>
  </section>
  <section class="ch3-parameter-panel">
    <div class="ch3-panel-heading"><h4>移动参数</h4><span>沿零空间方向移动</span></div>
    <div class="ch3-sliders" data-parameters></div>
  </section>
  <div class="ch3-meter ch3-solution-summary">
    <div class="ch3-meter-card"><strong>解类型</strong><span data-type>—</span></div>
    <div class="ch3-meter-card"><strong>rank(A)</strong><span data-rank>—</span></div>
    <div class="ch3-meter-card"><strong>nullity</strong><span data-nullity>—</span></div>
    <div class="ch3-meter-card"><strong>自由变量</strong><span data-free>—</span></div>
  </div>
  <details class="ch3-details ch3-rref-details">
    <summary>查看精确 RREF</summary>
    <div data-rref></div>
  </details>
</aside>
        </div>
        <section class="ch3-decomposition" aria-label="通解分解">
<article><span>① 选一个特解</span><div class="ch3-decomposition-value" data-x0></div><button type="button" data-shift>沿 η₁ 换一个特解</button></article>
<div class="ch3-decomposition-arrow" aria-hidden="true">＋</div>
<article><span>② 加零空间位移</span><div class="ch3-decomposition-value" data-basis></div></article>
<div class="ch3-decomposition-arrow" aria-hidden="true">＝</div>
<article class="is-current"><span>③ 得到当前解</span><div class="ch3-decomposition-value" data-current></div></article>
        </section>
        <section class="ch3-proof-strip" aria-label="实时验证">
<div data-verify-axb></div>
<div data-verify-null></div>
        </section>
        <p class="ch3-feedback" data-note aria-live="polite"></p>
      </div>`;

    const scope = M().createScope(root);
    const presets = {
      unique: [[1, 1, 3], [1, 2, 4]],
      line: [[1, 1, 2], [2, 2, 4]],
      plane: [[1, 1, 1, 2], [2, 2, 2, 4]],
      homogeneous: [[1, 1, 0], [2, 2, 0]],
      none: [[1, 1, 2], [2, 2, 5]],
    };
    const state = { key: "line", aug: null, parameters: [], shift: 0 };
    const canvas = root.querySelector("[data-canvas]");

    function load(key) {
      state.key = key;
      state.aug = M().matFromNumbers(presets[key]);
      state.parameters = [];
      state.shift = 0;
      rebuildParameters();
      render();
    }

    function data() {
      const info = M().analyzeAugmented(state.aug);
      const A = state.aug.map((row) => row.slice(0, -1));
      const b = state.aug.map((row) => row[row.length - 1]);
      const part = M().particularSolution(state.aug);
      const nullspace = M().nullspaceBasis(A);
      let x0 = part.ok ? part.x.map(M().F) : [];
      if (x0.length && state.shift && nullspace.basis.length) {
        x0 = x0.map((value, index) => M().add(value, M().mul(M().F(state.shift), nullspace.basis[0][index])));
      }
      return { info, A, b, part, nullspace, x0 };
    }

    function rebuildParameters() {
      const count = data().nullspace.basis.length;
      state.parameters = Array.from({ length: count }, (_, index) => state.parameters[index] || 0);
      const container = root.querySelector("[data-parameters]");
      if (!count) {
        container.innerHTML = `<p class="ch3-note">没有自由参数，解不会移动。</p>`;
        return;
      }
      container.innerHTML = state.parameters.map((value, index) => `
        <label class="ch3-slider ch3-parameter-slider"><span>s${index + 1}</span><input type="range" min="-2" max="2" step="0.05" value="${value}" data-param="${index}" /><strong data-value>${M().formatNumber(value)}</strong></label>`).join("");
      container.querySelectorAll("[data-param]").forEach((input) => scope.listen(input, "input", () => {
        const index = Number(input.dataset.param);
        state.parameters[index] = Number(input.value);
        input.parentElement.querySelector("[data-value]").textContent = M().formatNumber(state.parameters[index]);
        render();
      }));
    }

    function currentVector(payload) {
      if (!payload.part.ok) return [];
      return payload.x0.map((value, index) => payload.nullspace.basis.reduce(
        (sum, basis, k) => M().add(sum, M().mul(M().fromNumber(state.parameters[k] || 0), basis[index])),
        value,
      ));
    }

    function familyLatex(payload) {
      if (!payload.part.ok) return String.raw`\varnothing`;
      if (!payload.nullspace.basis.length) return String.raw`x=x_0`;
      const terms = payload.nullspace.basis.map((_, index) => `s_${index + 1}\eta_${index + 1}`).join("+");
      return `x=x_0+${terms}`;
    }

    function draw(payload, current) {
      const sized = M().sizeCanvas(canvas);
      if (!sized) return;
      const frame = M().drawAxes(sized.ctx, sized.width, sized.height, 54);
      sized.ctx.save();
      sized.ctx.fillStyle = frame.p.muted;
      sized.ctx.font = "650 12px ui-sans-serif, system-ui";
      sized.ctx.fillText(payload.info.n > 2 ? "前两坐标投影 · 方向关系仍按完整向量计算" : "二维解空间", 14, 22);
      sized.ctx.restore();

      if (!payload.part.ok) {
        sized.ctx.save();
        sized.ctx.fillStyle = frame.p.coral;
        sized.ctx.font = "760 16px ui-sans-serif, system-ui";
        sized.ctx.textAlign = "center";
        sized.ctx.fillText("RREF 出现矛盾行：没有任何向量 x 满足 Ax=b", frame.width / 2, frame.height / 2 - 4);
        sized.ctx.font = "600 13px ui-sans-serif, system-ui";
        sized.ctx.fillStyle = frame.p.muted;
        sized.ctx.fillText("因此也不存在“特解 + 零空间”的非齐次解族", frame.width / 2, frame.height / 2 + 24);
        sized.ctx.restore();
        return;
      }

      const x0 = payload.x0.map(M().toNumber);
      const x0p = [x0[0] || 0, x0[1] || 0];
      const xp = [M().toNumber(current[0] || M().F(0)), M().toNumber(current[1] || M().F(0))];
      const directions = payload.nullspace.basis.map((basis) => [M().toNumber(basis[0] || M().F(0)), M().toNumber(basis[1] || M().F(0))]);

      if (directions.length === 1) {
        const d = directions[0];
        const A = M().toCanvas(frame, [x0p[0] - 12 * d[0], x0p[1] - 12 * d[1]]);
        const B = M().toCanvas(frame, [x0p[0] + 12 * d[0], x0p[1] + 12 * d[1]]);
        sized.ctx.save();
        sized.ctx.strokeStyle = frame.p.coral;
        sized.ctx.globalAlpha = 0.32;
        sized.ctx.lineWidth = 8;
        sized.ctx.lineCap = "round";
        sized.ctx.beginPath();
        sized.ctx.moveTo(...A);
        sized.ctx.lineTo(...B);
        sized.ctx.stroke();
        sized.ctx.restore();
      } else if (directions.length >= 2) {
        const d1 = directions[0];
        const d2 = directions[1];
        const corners = [[-2, -2], [2, -2], [2, 2], [-2, 2]].map(([a, b]) => [
x0p[0] + a * d1[0] + b * d2[0],
x0p[1] + a * d1[1] + b * d2[1],
        ]).map((point) => M().toCanvas(frame, point));
        sized.ctx.save();
        sized.ctx.fillStyle = frame.p.accent;
        sized.ctx.globalAlpha = 0.09;
        sized.ctx.beginPath();
        sized.ctx.moveTo(...corners[0]);
        corners.slice(1).forEach((point) => sized.ctx.lineTo(...point));
        sized.ctx.closePath();
        sized.ctx.fill();
        sized.ctx.restore();
      }

      if (Math.hypot(...x0p) > 1e-8) M().drawArrowBetween(sized.ctx, frame, [0, 0], x0p, frame.p.accent, "x₀", 3.1, { tailDot: true });
      else {
        const O = M().toCanvas(frame, [0, 0]);
        sized.ctx.save();
        sized.ctx.fillStyle = frame.p.accent;
        sized.ctx.font = "760 12px ui-sans-serif, system-ui";
        sized.ctx.fillText("x₀=0", O[0] + 9, O[1] - 10);
        sized.ctx.restore();
      }

      directions.forEach((direction, index) => {
        const endpoint = [x0p[0] + direction[0], x0p[1] + direction[1]];
        M().drawArrowBetween(sized.ctx, frame, x0p, endpoint, frame.p.coral, `η${index + 1}`, 2.7, { alpha: 0.9 });
      });

      if (Math.hypot(xp[0] - x0p[0], xp[1] - x0p[1]) > 1e-8) {
        M().drawArrowBetween(sized.ctx, frame, x0p, xp, frame.p.blue, "参数位移", 2.2, { dashed: true, alpha: 0.72 });
      }
      M().drawArrowBetween(sized.ctx, frame, [0, 0], xp, frame.p.blue, "x", 3.8, { tailDot: true });
    }

    function render() {
      const payload = data();
      const classification = M().classifySystem(state.aug);
      const current = currentVector(payload);
      const type = root.querySelector("[data-type]");
      type.textContent = classification.label;
      type.className = `ch3-status ${classification.cls}`;
      root.querySelector("[data-rank]").textContent = String(payload.info.rankA);
      root.querySelector("[data-nullity]").textContent = payload.part.ok ? String(payload.nullspace.basis.length) : "—";
      root.querySelector("[data-free]").textContent = payload.part.ok && payload.info.free.length ? payload.info.free.map((i) => `x${i + 1}`).join(",") : "无";
      root.querySelector("[data-rref]").innerHTML = M().htmlMatrix(payload.info.rref, payload.info.n);
      root.querySelector("[data-family]").innerHTML = texD(familyLatex(payload));
      root.querySelector("[data-family-note]").textContent = payload.part.ok
        ? payload.nullspace.basis.length
? "参数只改变零空间位移；A 会把这些位移全部压到 0。"
: "没有零空间方向，所以特解就是唯一解。"
        : "没有特解，通解集合为空。";
      root.querySelector("[data-geometry-note]").textContent = payload.info.n > 2 ? `前两坐标投影 · 完整维数 n=${payload.info.n}` : "二维完整视图";
      root.querySelector("[data-x0]").innerHTML = payload.part.ok ? `${tex(String.raw`x_0=`)}${M().htmlVector(payload.x0)}` : "不存在";
      root.querySelector("[data-basis]").innerHTML = payload.part.ok && payload.nullspace.basis.length
        ? payload.nullspace.basis.map((basis, index) => `<div>${tex(String.raw`\eta_{${index + 1}}=`)}${M().htmlVector(basis)}</div>`).join("")
        : payload.part.ok ? tex(String.raw`\operatorname{Ker}(A)=\{0\}`) : "不存在";
      root.querySelector("[data-current]").innerHTML = payload.part.ok ? `${tex(String.raw`x=`)}${M().htmlVector(current)}` : "无解";
      const shiftButton = root.querySelector("[data-shift]");
      shiftButton.disabled = !payload.part.ok || !payload.nullspace.basis.length;
      shiftButton.textContent = state.shift ? "恢复原特解" : "沿 η₁ 换一个特解";

      if (payload.part.ok) {
        const Ax = M().matVec(payload.A, current);
        const difference = current.map((value, index) => M().sub(value, payload.x0[index]));
        const Adiff = M().matVec(payload.A, difference);
        const axOk = Ax.every((value, index) => M().eq(value, payload.b[index]));
        const nullOk = Adiff.every(M().isZero);
        root.querySelector("[data-verify-axb]").innerHTML = `<span class="ch3-check ${axOk ? "is-ok" : "is-bad"}">${axOk ? "✓" : "!"}</span><div><strong>${tex(String.raw`Ax=b`)}</strong><p>${axOk ? "验证通过：当前箭头的终点仍是原方程组的解。" : "验证失败"}</p></div>`;
        root.querySelector("[data-verify-null]").innerHTML = `<span class="ch3-check ${nullOk ? "is-ok" : "is-bad"}">${nullOk ? "✓" : "!"}</span><div><strong>${tex(String.raw`A(x-x_0)=0`)}</strong><p>${nullOk ? "验证通过：从 x₀ 到 x 的位移完全落在零空间中。" : "验证失败"}</p></div>`;
        root.querySelector("[data-note]").textContent = state.shift
? "你换了一个特解，参数原点随之改变；但整条（或整个平面）解集没有移动。"
: payload.nullspace.basis.length ? "拖动参数：蓝色 x 会移动，青色 x₀ 与橙色零空间方向共同解释它为何始终满足 Ax=b。" : "没有自由参数，因此当前系统只有一个解。";
      } else {
        root.querySelector("[data-verify-axb]").innerHTML = `<span class="ch3-check is-bad">×</span><div><strong>没有 Ax=b 的解</strong><p>RREF 的矛盾行阻止了特解出现。</p></div>`;
        root.querySelector("[data-verify-null]").innerHTML = `<span class="ch3-check is-muted">—</span><div><strong>结构公式不适用</strong><p>只有系统有解时，才能写成 x₀+Ker(A)。</p></div>`;
        root.querySelector("[data-note]").textContent = "先通过有解判别，才能讨论解族结构。";
      }
      M().pulse(root.querySelector("[data-solution-card]"));
      draw(payload, current);
    }

    root.querySelectorAll("[data-preset]").forEach((button) => scope.listen(button, "click", () => {
      root.querySelectorAll("[data-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
      load(button.dataset.preset);
    }));
    scope.listen(root.querySelector("[data-shift]"), "click", () => { state.shift = state.shift ? 0 : 1; render(); });
    scope.resize(() => { const payload = data(); draw(payload, currentVector(payload)); });
    load("line");
    return scope.cleanup;
  }

  window.defineChapter3Renderer?.("matrix-rank", { formal: formalRank, interactive: interactiveRank });
  window.defineChapter3Renderer?.("solvability", { formal: formalSolvability, interactive: interactiveSolvability });
  window.defineChapter3Renderer?.("solution-structure", { formal: formalSolutionStructure, interactive: interactiveSolutionStructure });
})();
