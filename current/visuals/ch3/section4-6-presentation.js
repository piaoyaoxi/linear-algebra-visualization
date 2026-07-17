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
        <div class="ch3-lab-head"><h3>秩证书工作台</h3><p>所有秩判定使用完整矩阵；画布只显示前两行坐标的投影，并明确标注投影限制。</p></div>
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
        <div class="ch3-lab-head"><h3>可达性闸门</h3><p>目标 b 可直接在画布中拖动，并吸附到 0.05 网格；矩阵、RREF、秩与解类型使用同一组精确坐标。</p></div>
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
      M().drawPoint(sized.ctx, frame, state.b, M().analyzeAugmented(augmented()).inconsistent ? frame.p.coral : frame.p.blue, "b");
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
      <div class="ch3-lab" data-ch3-lab="solution-structure">
        <div class="ch3-lab-head"><h3>解族生成器</h3><p>系统从精确 RREF 自动生成特解与零空间基。每次移动参数都会同时验证 Ax=b 和 A(x−x₀)=0。</p></div>
        <div class="ch3-presets">
          <button type="button" data-preset="unique">唯一解</button>
          <button type="button" class="is-active" data-preset="line">仿射直线</button>
          <button type="button" data-preset="plane">仿射平面</button>
          <button type="button" data-preset="homogeneous">齐次直线</button>
          <button type="button" data-preset="none">无解边界</button>
        </div>
        <div class="ch3-lab-grid">
          <div class="ch3-stage"><canvas data-canvas aria-label="解集前两坐标投影"></canvas></div>
          <div class="ch3-side">
            <div class="ch3-meter is-4">
              <div class="ch3-meter-card" data-solution-card><strong>解类型</strong><span data-type>—</span></div>
              <div class="ch3-meter-card"><strong>rank(A)</strong><span data-rank>—</span></div>
              <div class="ch3-meter-card"><strong>nullity</strong><span data-nullity>—</span></div>
              <div class="ch3-meter-card"><strong>自由变量</strong><span data-free>—</span></div>
            </div>
            <div class="ch3-panel"><h4>RREF</h4><div data-rref></div></div>
            <div class="ch3-panel"><h4>参数</h4><div class="ch3-sliders" data-parameters></div></div>
          </div>
        </div>
        <div class="ch3-lab-grid is-3">
          <div class="ch3-panel"><h4>特解 x₀</h4><div data-x0></div><button type="button" data-shift>换一个特解</button></div>
          <div class="ch3-panel"><h4>零空间基</h4><div data-basis></div></div>
          <div class="ch3-panel"><h4>当前解 x</h4><div data-current></div></div>
        </div>
        <div class="ch3-verification-grid">
          <div class="viz-callout" data-verify-axb></div>
          <div class="viz-callout" data-verify-null></div>
        </div>
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
        container.innerHTML = `<p class="ch3-note">没有自由参数。</p>`;
        return;
      }
      container.innerHTML = state.parameters.map((value, index) => `
        <label class="ch3-slider"><span>s${index + 1}</span><input type="range" min="-2" max="2" step="0.05" value="${value}" data-param="${index}" /><span data-value>${M().formatNumber(value)}</span></label>`).join("");
      container.querySelectorAll("[data-param]").forEach((input) => scope.listen(input, "input", () => {
        const index = Number(input.dataset.param);
        state.parameters[index] = Number(input.value);
        input.parentElement.querySelector("[data-value]").textContent = M().formatNumber(state.parameters[index]);
        render();
      }));
    }
    function currentVector(payload) {
      if (!payload.part.ok) return [];
      return payload.x0.map((value, index) => payload.nullspace.basis.reduce((sum, basis, k) => M().add(sum, M().mul(M().fromNumber(state.parameters[k] || 0), basis[index])), value));
    }
    function draw(payload, current) {
      const sized = M().sizeCanvas(canvas);
      if (!sized) return;
      const frame = M().drawAxes(sized.ctx, sized.width, sized.height, 46);
      if (!payload.part.ok) {
        sized.ctx.fillStyle = frame.p.coral;
        sized.ctx.font = "700 14px ui-sans-serif, system-ui";
        sized.ctx.fillText("矛盾行：当前系统无解，没有可绘制的解族。", 16, 28);
        return;
      }
      const x0 = payload.x0.map(M().toNumber);
      if (payload.nullspace.basis.length === 1 && x0.length >= 2) {
        const direction = payload.nullspace.basis[0].map(M().toNumber);
        const start = [x0[0] - 8 * direction[0], (x0[1] || 0) - 8 * (direction[1] || 0)];
        const end = [x0[0] + 8 * direction[0], (x0[1] || 0) + 8 * (direction[1] || 0)];
        const a = M().toCanvas(frame, start);
        const b = M().toCanvas(frame, end);
        sized.ctx.save();
        sized.ctx.strokeStyle = frame.p.blue;
        sized.ctx.lineWidth = 2.3;
        sized.ctx.setLineDash([7, 5]);
        sized.ctx.beginPath(); sized.ctx.moveTo(...a); sized.ctx.lineTo(...b); sized.ctx.stroke(); sized.ctx.restore();
      } else if (payload.nullspace.basis.length >= 2) {
        M().drawSpan(sized.ctx, frame, payload.nullspace.basis.map((basis) => basis.slice(0, 2).map(M().toNumber)), frame.p.accent);
      }
      M().drawPoint(sized.ctx, frame, [x0[0] || 0, x0[1] || 0], frame.p.accent, "x₀");
      M().drawPoint(sized.ctx, frame, [M().toNumber(current[0] || M().F(0)), M().toNumber(current[1] || M().F(0))], frame.p.blue, "x");
      if (payload.info.n > 2) {
        sized.ctx.fillStyle = frame.p.muted;
        sized.ctx.font = "600 12px ui-sans-serif, system-ui";
        sized.ctx.fillText("仅显示解向量的前两坐标投影", 14, 22);
      }
    }
    function render() {
      const payload = data();
      const classification = M().classifySystem(state.aug);
      const current = currentVector(payload);
      root.querySelector("[data-type]").textContent = classification.label;
      root.querySelector("[data-type]").className = `ch3-status ${classification.cls}`;
      root.querySelector("[data-rank]").textContent = String(payload.info.rankA);
      root.querySelector("[data-nullity]").textContent = payload.part.ok ? String(payload.nullspace.basis.length) : "—";
      root.querySelector("[data-free]").textContent = payload.part.ok && payload.info.free.length ? payload.info.free.map((i) => `x${i + 1}`).join(",") : "无";
      root.querySelector("[data-rref]").innerHTML = M().htmlMatrix(payload.info.rref, payload.info.n);
      root.querySelector("[data-x0]").innerHTML = payload.part.ok ? M().htmlVector(payload.x0) : "不存在";
      root.querySelector("[data-basis]").innerHTML = payload.part.ok && payload.nullspace.basis.length
        ? payload.nullspace.basis.map((basis, index) => `<div>${tex(String.raw`\eta_{${index + 1}}=`)}${M().htmlVector(basis)}</div>`).join("")
        : payload.part.ok ? `${tex(String.raw`\{0\}`)}` : "不存在";
      root.querySelector("[data-current]").innerHTML = payload.part.ok ? M().htmlVector(current) : "无解";
      root.querySelector("[data-shift]").disabled = !payload.part.ok || !payload.nullspace.basis.length;
      if (payload.part.ok) {
        const Ax = M().matVec(payload.A, current);
        const difference = current.map((value, index) => M().sub(value, payload.x0[index]));
        const Adiff = M().matVec(payload.A, difference);
        const axOk = Ax.every((value, index) => M().eq(value, payload.b[index]));
        const nullOk = Adiff.every(M().isZero);
        root.querySelector("[data-verify-axb]").innerHTML = `${tex(String.raw`Ax=b`)}：${axOk ? "验证通过" : "验证失败"}<div>${M().htmlVector(Ax)}</div>`;
        root.querySelector("[data-verify-null]").innerHTML = `${tex(String.raw`A(x-x_0)=0`)}：${nullOk ? "验证通过" : "验证失败"}<div>${M().htmlVector(Adiff)}</div>`;
        root.querySelector("[data-note]").textContent = state.shift
          ? "当前特解沿第一个零空间方向移动了一步；参数原点改变，但解集没有改变。"
          : "移动参数只会沿零空间方向改变当前解。";
      } else {
        root.querySelector("[data-verify-axb]").textContent = "系统无解，无法验证 Ax=b。";
        root.querySelector("[data-verify-null]").textContent = "没有特解，因此不存在非齐次解族。";
        root.querySelector("[data-note]").textContent = "解的结构公式以系统有解为前提。";
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
