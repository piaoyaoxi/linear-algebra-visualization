/* Chapter 2 geometry-first stories — sections 5–8. */
(() => {
  const C = window.Ch2Story;
  if (!C || typeof window.extendChapter2Renderer !== "function") return;
  const { M, fmt, tex, shell, defs, setActive, mapPoint, pointsString, parallelogram, animate, determinant } = C;

  function clone(matrix) { return matrix.map((row) => row.slice()); }

  function matrixCells(matrix, x, y, size = 68, gap = 10, classFor = () => "") {
    return matrix.map((row, r) => row.map((value, c) => {
      const cx = x + c * (size + gap);
      const cy = y + r * (size + gap);
      return `<g class="story-elim-cell ${classFor(r, c)}"><rect x="${cx}" y="${cy}" width="${size}" height="${size}" rx="14"/><text x="${cx + size / 2}" y="${cy + size / 2 + 1}" text-anchor="middle" dominant-baseline="middle">${fmt(value, 3)}</text></g>`;
    }).join("")).join("");
  }

  // §5 — elimination is a route that manufactures zeros.
  function mountEliminationStory(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const svg = root.querySelector("[data-elim-svg]");
    const states = [
      [[2, 1, 0], [1, 3, 1], [0, 2, 1]],
      [[2, 1, 0], [0, 2.5, 1], [0, 2, 1]],
      [[2, 1, 0], [0, 2.5, 1], [0, 0, 0.2]],
    ];
    const ops = ["先找主对角线下方的非零元素", "R₂ ← R₂ − 0.5R₁", "R₃ ← R₃ − 0.8R₂"];
    let step = 0;
    let current = clone(states[0]);
    let busy = false;

    function targetCell() {
      if (step === 0) return [1, 0];
      if (step === 1) return [2, 1];
      return null;
    }

    function render() {
      const target = targetCell();
      svg.querySelector("[data-elim-matrix]").innerHTML = matrixCells(current, 310, 120, 74, 12, (r, c) => {
        if (target && r === target[0] && c === target[1]) return "is-target";
        if ((step >= 1 && r === 1 && c === 0) || (step >= 2 && r === 2 && c === 1)) return "is-zero";
        return "";
      });
      root.querySelector("[data-elim-step]").textContent = `${step + 1} / 3`;
      root.querySelector("[data-elim-op]").textContent = ops[step];
      root.querySelector("[data-elim-det]").textContent = fmt(determinant(current), 4);
      root.querySelector("[data-elim-diag]").textContent = step === 2 ? `${fmt(current[0][0])} × ${fmt(current[1][1])} × ${fmt(current[2][2])} = ${fmt(determinant(current), 4)}` : "尚未到上三角";
      root.querySelector("[data-elim-message]").textContent = step === 0
        ? "橙色元素是当前唯一目标；先别计算整个行列式，只想办法把它变成 0。"
        : step === 1
          ? "第一个零已经制造完成，行列式没有改变；注意力转向 a₃₂。"
          : "主对角线下方已经全为 0，现在行列式直接等于对角线乘积。";
      root.querySelector("[data-elim-next]").disabled = busy || step >= 2;
      root.querySelector("[data-elim-play]").disabled = busy;
      root.querySelectorAll("[data-elim-marker]").forEach((marker) => marker.classList.toggle("is-active", Number(marker.dataset.elimMarker) === step));
    }

    async function goTo(nextStep) {
      if (busy || nextStep === step) return;
      busy = true;
      const from = clone(current);
      const to = clone(states[nextStep]);
      try {
        await animate(svg, 540, (t) => {
          current = from.map((row, r) => row.map((value, c) => M().lerp(value, to[r][c], t)));
          const oldStep = step; step = nextStep; render(); step = oldStep;
        });
        step = nextStep; current = to; render();
      } finally { busy = false; render(); }
    }

    root.querySelector("[data-elim-next]").addEventListener("click", () => { void goTo(Math.min(2, step + 1)); }, { signal });
    root.querySelector("[data-elim-reset]").addEventListener("click", () => { if (!busy) { step = 0; current = clone(states[0]); render(); } }, { signal });
    root.querySelector("[data-elim-play]").addEventListener("click", async () => {
      if (busy) return;
      if (step !== 0) { step = 0; current = clone(states[0]); render(); }
      await goTo(1);
      await goTo(2);
    }, { signal });
    render();
    return () => { controller.abort(); M().cancelAnim(svg); };
  }

  window.extendChapter2Renderer("determinant-computation", {
    interactive(root) {
      if (!root) return;
      const controls = `<button type="button" data-elim-next>执行下一步</button><button type="button" data-elim-play>播放完整路线</button><button type="button" data-elim-reset>重置</button>`;
      const stage = `<div class="ch2-story-stage is-plain"><svg data-elim-svg viewBox="0 0 900 500" role="img" aria-label="通过两次倍加消元把三阶矩阵化为上三角"><text x="36" y="46" class="story-caption">一次只处理一个目标元素：橙色待消，青色已经制造成 0</text><g data-elim-matrix></g><path d="M230 255H290" class="story-vector-muted" marker-end="url(#elim-arrow-muted)"/>${defs("elim")}<text x="450" y="410" text-anchor="middle" class="story-label" data-elim-op></text><text x="450" y="447" text-anchor="middle" class="story-label-small">倍加行不改变行列式</text></svg></div>`;
      const formula = `<div><span>当前阶段</span><strong data-elim-step></strong></div><div><span>当前行操作</span><strong data-elim-op></strong></div><div><span>当前 det</span><strong data-elim-det></strong></div><div><span>最终读取</span><strong data-elim-diag></strong></div>`;
      root.innerHTML = `<h2>交互实验</h2>${shell("计算不是乱试公式，而是有目的地制造零", "倍加行不改变行列式，因此最适合把主对角线下方的元素逐个清空。", "每一步只追踪一个橙色目标。等它变成青色的 0，再移动到下一个目标。", controls, stage, formula, `<strong>现在该看什么</strong><span data-elim-message></span>`)}`;
      return mountEliminationStory(root);
    },
  });

  // §6 — delete one row and one column, then physically move the complement.
  function mountCofactorStory(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const svg = root.querySelector("[data-cofactor-svg]");
    const matrix = [[1, 2, 0], [0, 3, 0], [4, 5, 6]];
    const left = { x: 105, y: 120, size: 70, gap: 12 };
    const right = { x: 590, y: 165, size: 78, gap: 14 };
    let active = { row: 1, col: 1 };

    function sourcePos(r, c) { return [left.x + c * (left.size + left.gap), left.y + r * (left.size + left.gap)]; }
    function targetPos(index) { const r = Math.floor(index / 2); const c = index % 2; return [right.x + c * (right.size + right.gap), right.y + r * (right.size + right.gap)]; }

    function cofactorInfo() {
      const minorMatrix = M().minorMatrix(matrix, active.row, active.col);
      const minor = determinant(minorMatrix);
      const sign = (active.row + active.col) % 2 === 0 ? 1 : -1;
      return { minorMatrix, minor, sign, cofactor: sign * minor };
    }

    function bindCells() {
      svg.querySelectorAll("[data-cofactor-cell]").forEach((cell) => {
        const activate = () => {
          const [row, col] = cell.dataset.cofactorCell.split(",").map(Number);
          active = { row, col };
          render();
        };
        cell.addEventListener("click", activate, { signal });
        cell.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } }, { signal });
      });
    }

    function render() {
      const info = cofactorInfo();
      const remaining = [];
      matrix.forEach((row, r) => row.forEach((value, c) => { if (r !== active.row && c !== active.col) remaining.push({ r, c, value }); }));
      const cells = matrix.map((row, r) => row.map((value, c) => {
        const [x, y] = sourcePos(r, c);
        const current = r === active.row && c === active.col;
        const deleted = r === active.row || c === active.col;
        const cls = current ? "is-current" : deleted ? "is-deleted" : "is-remain";
        return `<g class="story-cofactor-cell ${cls}" data-cofactor-cell="${r},${c}" role="button" tabindex="0" aria-label="选择 a${r + 1}${c + 1}"><rect x="${x}" y="${y}" width="${left.size}" height="${left.size}" rx="14"/><text x="${x + left.size / 2}" y="${y + left.size / 2 + 1}" text-anchor="middle" dominant-baseline="middle">${value}</text></g>`;
      }).join("")).join("");
      const minorSlots = [0,1,2,3].map((index) => { const [x,y] = targetPos(index); return `<rect x="${x}" y="${y}" width="${right.size}" height="${right.size}" rx="15" fill="var(--surface-solid,#fff)" stroke="var(--line-strong,rgba(24,43,57,.18))" stroke-width="2"/>`; }).join("");
      const moving = remaining.map((item, index) => {
        const [x, y] = sourcePos(item.r, item.c);
        return `<g class="story-cofactor-cell story-moving-cell" data-fly="${index}" style="transform-box:fill-box;transform-origin:center"><rect x="${x}" y="${y}" width="${left.size}" height="${left.size}" rx="14"/><text x="${x + left.size / 2}" y="${y + left.size / 2 + 1}" text-anchor="middle" dominant-baseline="middle">${item.value}</text></g>`;
      }).join("");
      const rowY = left.y + active.row * (left.size + left.gap) + left.size / 2;
      const colX = left.x + active.col * (left.size + left.gap) + left.size / 2;
      svg.querySelector("[data-cofactor-scene]").innerHTML = `${cells}<line class="story-strike" x1="${left.x - 24}" y1="${rowY}" x2="${left.x + 3 * left.size + 2 * left.gap + 24}" y2="${rowY}"/><line class="story-strike" x1="${colX}" y1="${left.y - 24}" x2="${colX}" y2="${left.y + 3 * left.size + 2 * left.gap + 24}"/><path d="M430 245H535" class="story-vector-muted" marker-end="url(#cofactor-arrow-muted)"/><text x="482" y="220" text-anchor="middle" class="story-label-small">保留相对位置</text>${minorSlots}${moving}`;
      bindCells();
      requestAnimationFrame(() => {
        remaining.forEach((item, index) => {
          const [sx, sy] = sourcePos(item.r, item.c);
          const [tx, ty] = targetPos(index);
          const node = svg.querySelector(`[data-fly="${index}"]`);
          if (node) node.style.transform = `translate(${tx - sx + (right.size - left.size) / 2}px, ${ty - sy + (right.size - left.size) / 2}px)`;
        });
      });
      root.querySelector("[data-cof-entry]").textContent = `a${active.row + 1}${active.col + 1} = ${matrix[active.row][active.col]}`;
      root.querySelector("[data-cof-minor]").textContent = fmt(info.minor, 3);
      root.querySelector("[data-cof-sign]").textContent = info.sign > 0 ? "+1" : "−1";
      root.querySelector("[data-cof-value]").textContent = fmt(info.cofactor, 3);
      root.querySelector("[data-cof-message]").textContent = `横线删去第 ${active.row + 1} 行，竖线删去第 ${active.col + 1} 列；右侧四格没有重新排序。`;
    }
    render();
    return () => controller.abort();
  }

  window.extendChapter2Renderer("cofactor-expansion", {
    interactive(root) {
      if (!root) return;
      const stage = `<div class="ch2-story-stage is-plain"><svg data-cofactor-svg viewBox="0 0 900 500" role="img" aria-label="选择矩阵元素后删去所在行列并提取余子矩阵">${defs("cofactor")}<text x="36" y="45" class="story-caption">点击任意元素：两条细线准确删去它所在的整行与整列</text><text x="195" y="92" text-anchor="middle" class="story-label">原矩阵</text><text x="675" y="125" text-anchor="middle" class="story-label">余子矩阵</text><g data-cofactor-scene></g></svg></div>`;
      const formula = `<div><span>选中元素</span><strong data-cof-entry></strong></div><div><span>余子式 Mᵢⱼ</span><strong data-cof-minor></strong></div><div><span>位置符号</span><strong data-cof-sign></strong></div><div><span>代数余子式 Aᵢⱼ</span><strong data-cof-value></strong></div>`;
      root.innerHTML = `<h2>交互实验</h2>${shell("余子式不是“划掉附近的数”，而是取行列的交叉补集", "选中一个元素后，删掉它所在的整行与整列；剩下的元素保持原来的相对位置，组成低一阶矩阵。", "点击不同位置，先看两条删除线，再看四个保留元素怎样原样移动到右侧。", "", stage, formula, `<strong>准确动作</strong><span data-cof-message></span>`)}`;
      return mountCofactorStory(root);
    },
  });

  // §7 — Cramer's rule from b=x1a1+x2a2 and shear invariance.
  function mountCramerStory(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const svg = root.querySelector("[data-cramer-story-svg]");
    const origin = [165, 430];
    const scale = 58;
    const regular = { a1: [2, 1], a2: [1, 2], x1: 2, x2: 1 };
    regular.b = [regular.x1 * regular.a1[0] + regular.x2 * regular.a2[0], regular.x1 * regular.a1[1] + regular.x2 * regular.a2[1]];
    let mode = "basis";
    let progress = 1;
    let busy = false;

    function line(x1, y1, x2, y2, cls, marker = "") { return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}" ${marker ? `marker-end="url(#cramer-arrow-${marker})"` : ""}/>`; }

    function vectorScene(data, localMode, t) {
      const { a1, a2, x1, x2, b } = data;
      const O = mapPoint(origin, scale, [0,0]);
      const A1 = mapPoint(origin, scale, a1);
      const A2 = mapPoint(origin, scale, a2);
      const B = mapPoint(origin, scale, b);
      const X1 = mapPoint(origin, scale, [x1 * a1[0], x1 * a1[1]]);
      const D = a1[0] * a2[1] - a1[1] * a2[0];
      let shapes = `<polygon class="story-ghost" points="${pointsString(parallelogram(origin, scale, a1, a2))}"/>`;
      let vectors = line(O[0],O[1],A1[0],A1[1],"story-vector-primary","cyan") + line(O[0],O[1],A2[0],A2[1],"story-vector-secondary","orange");
      let labels = `<text x="${A1[0] + 10}" y="${A1[1] - 10}" class="story-label">a₁</text><text x="${A2[0] + 10}" y="${A2[1] - 10}" class="story-label">a₂</text>`;
      if (localMode === "basis") {
        vectors += line(O[0],O[1],B[0],B[1],"story-vector-target","yellow");
        shapes += `<polyline points="${pointsString([O, X1, B])}" fill="none" stroke="#71808a" stroke-width="3" stroke-dasharray="7 7"/>`;
        labels += `<text x="${B[0] + 10}" y="${B[1] - 10}" class="story-label">b</text><text x="${(O[0]+X1[0])/2}" y="${(O[1]+X1[1])/2 - 14}" class="story-label-small">2a₁</text><text x="${(X1[0]+B[0])/2 + 10}" y="${(X1[1]+B[1])/2}" class="story-label-small">+ a₂</text>`;
      } else if (localMode === "x1") {
        const w = [b[0] - t * x2 * a2[0], b[1] - t * x2 * a2[1]];
        const W = mapPoint(origin, scale, w);
        shapes += `<polygon class="story-fill-primary" points="${pointsString(parallelogram(origin, scale, w, a2))}"/>`;
        vectors += line(O[0],O[1],W[0],W[1],"story-vector-target","yellow");
        labels += `<text x="${W[0] + 10}" y="${W[1] - 10}" class="story-label">${t < .98 ? "b − t·x₂a₂" : "x₁a₁"}</text>`;
        if (t > .92) {
          const split1 = mapPoint(origin, scale, a1);
          const split2 = mapPoint(origin, scale, [a1[0] + a2[0], a1[1] + a2[1]]);
          shapes += line(split1[0], split1[1], split2[0], split2[1], "story-vector-muted");
        }
      } else if (localMode === "x2") {
        const w = [b[0] - t * x1 * a1[0], b[1] - t * x1 * a1[1]];
        const W = mapPoint(origin, scale, w);
        shapes += `<polygon class="story-fill-secondary" points="${pointsString(parallelogram(origin, scale, a1, w))}"/>`;
        vectors += line(O[0],O[1],W[0],W[1],"story-vector-target","yellow");
        labels += `<text x="${W[0] + 10}" y="${W[1] - 10}" class="story-label">${t < .98 ? "b − t·x₁a₁" : "x₂a₂"}</text>`;
      }
      return { html: shapes + vectors + labels, D };
    }

    function render() {
      let scene = "";
      let values;
      if (mode === "singular-in" || mode === "singular-out") {
        const a1 = [2,1], a2 = [4,2], b = mode === "singular-in" ? [6,3] : [5,4];
        const O = mapPoint(origin, scale, [0,0]);
        const A1 = mapPoint(origin, scale, a1); const A2 = mapPoint(origin, scale, a2); const B = mapPoint(origin, scale, b);
        scene = `${line(O[0],O[1],A1[0],A1[1],"story-vector-primary","cyan")}${line(O[0],O[1],A2[0],A2[1],"story-vector-secondary","orange")}${line(O[0],O[1],B[0],B[1],"story-vector-target","yellow")}<text x="${A1[0]+8}" y="${A1[1]-9}" class="story-label">a₁</text><text x="${A2[0]+8}" y="${A2[1]-9}" class="story-label">a₂</text><text x="${B[0]+8}" y="${B[1]-9}" class="story-label">b</text><text x="530" y="115" class="story-label">D=0：原面积已经塌缩</text><text x="530" y="155" class="story-caption">${mode === "singular-in" ? "b 仍在线上：有无穷多种列组合" : "b 离开这条线：没有列组合能到达"}</text>`;
        values = { D: 0, D1: 0, D2: mode === "singular-in" ? 0 : 6, x1: "—", x2: "—" };
        root.querySelector("[data-cramer-message]").textContent = mode === "singular-in" ? "分母面积为 0，面积比不再能区分坐标；同一个 b 有无穷多种表示。" : "分母面积为 0，而 b 又不在列空间中，因此方程组无解。";
      } else {
        const built = vectorScene(regular, mode, progress);
        scene = built.html;
        const D = built.D;
        const D1 = regular.b[0] * regular.a2[1] - regular.b[1] * regular.a2[0];
        const D2 = regular.a1[0] * regular.b[1] - regular.a1[1] * regular.b[0];
        values = { D, D1, D2, x1: D1 / D, x2: D2 / D };
        root.querySelector("[data-cramer-message]").textContent = mode === "basis"
          ? "先读 b=2a₁+a₂：坐标就是沿两条基向量分别走多少。"
          : mode === "x1"
            ? "把 b 沿 a₂ 方向滑到 x₁a₁。这个剪切不改变 det(·,a₂)，所以 D₁=x₁D。"
            : "把 b 沿 a₁ 方向滑到 x₂a₂。这个剪切不改变 det(a₁,·)，所以 D₂=x₂D。";
      }
      svg.querySelector("[data-cramer-scene]").innerHTML = scene;
      root.querySelector("[data-cramer-d]").textContent = fmt(values.D, 3);
      root.querySelector("[data-cramer-d1]").textContent = typeof values.D1 === "number" ? fmt(values.D1, 3) : values.D1;
      root.querySelector("[data-cramer-d2]").textContent = typeof values.D2 === "number" ? fmt(values.D2, 3) : values.D2;
      root.querySelector("[data-cramer-x1]").textContent = typeof values.x1 === "number" ? fmt(values.x1, 3) : values.x1;
      root.querySelector("[data-cramer-x2]").textContent = typeof values.x2 === "number" ? fmt(values.x2, 3) : values.x2;
    }

    async function selectMode(nextMode, button) {
      if (busy) M().cancelAnim(svg);
      setActive(root, "[data-cramer-mode]", button);
      mode = nextMode;
      if (mode === "x1" || mode === "x2") {
        progress = 0; busy = true;
        try { await animate(svg, 1050, (t) => { progress = t; render(); }); }
        finally { progress = 1; busy = false; render(); }
      } else { progress = 1; render(); }
    }

    root.querySelectorAll("[data-cramer-mode]").forEach((button) => button.addEventListener("click", () => { void selectMode(button.dataset.cramerMode, button); }, { signal }));
    render();
    return () => { controller.abort(); M().cancelAnim(svg); };
  }

  window.extendChapter2Renderer("cramer-rule", {
    interactive(root) {
      if (!root) return;
      const controls = `<button type="button" data-cramer-mode="basis" class="is-active" aria-pressed="true">先看 b 的坐标分解</button><button type="button" data-cramer-mode="x1">为什么 D₁/D=x₁</button><button type="button" data-cramer-mode="x2">为什么 D₂/D=x₂</button><button type="button" data-cramer-mode="singular-in">D=0 · 相容</button><button type="button" data-cramer-mode="singular-out">D=0 · 不相容</button>`;
      const stage = `<div class="ch2-story-stage"><svg data-cramer-story-svg viewBox="0 0 900 520" role="img" aria-label="在同一坐标平面中通过剪切不变性解释克拉默法则">${defs("cramer")}<g class="story-grid">${Array.from({ length: 19 }, (_, i) => `<line x1="${i*50}" y1="0" x2="${i*50}" y2="520"/>`).join("")}${Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="${i*50}" x2="900" y2="${i*50}"/>`).join("")}</g><line class="story-axis" x1="0" y1="430" x2="900" y2="430"/><line class="story-axis" x1="165" y1="0" x2="165" y2="520"/><g data-cramer-scene></g></svg></div>`;
      const formula = `<div><span>原面积 D</span><strong data-cramer-d></strong></div><div><span>替换第一列 D₁</span><strong data-cramer-d1></strong></div><div><span>x₁=D₁/D</span><strong data-cramer-x1></strong></div><div><span>替换第二列 D₂</span><strong data-cramer-d2></strong></div><div><span>x₂=D₂/D</span><strong data-cramer-x2></strong></div>`;
      root.innerHTML = `<h2>交互实验</h2>${shell("克拉默法则的核心不是三张面积图，而是一次不改变面积的滑动", "从 b=x₁a₁+x₂a₂ 出发。计算 x₁ 时，把 b 沿 a₂ 方向剪切到 x₁a₁；计算 x₂ 时，沿 a₁ 方向剪切到 x₂a₂。", "先看 b 的坐标分解，再分别播放两个滑动。注意平行四边形在剪切过程中形状改变，但有向面积保持。", controls, stage, formula, `<strong>这一幕说明什么</strong><span data-cramer-message></span>`)}`;
      return mountCramerStory(root);
    },
  });

  // §8 — complementary minors and one continuous composition scene.
  function mountLaplaceProductStory(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const A4 = [[1,2,0,1],[0,1,1,0],[2,0,1,1],[1,1,0,2]];
    const rows = [0,1];
    const pairs = [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
    let pairIndex = 0;
    const lapSvg = root.querySelector("[data-laplace-story-svg]");
    const prodSvg = root.querySelector("[data-product-story-svg]");
    const I = [[1,0],[0,1]];
    let product = { A: [[1.25,0],[0,1]], B: [[1.4,0.45],[0,1]] };
    let productBusy = false;

    function laplaceInfo(cols) {
      const complementRows = [2,3];
      const complementCols = [0,1,2,3].filter((index) => !cols.includes(index));
      const minor = rows.map((r) => cols.map((c) => A4[r][c]));
      const complement = complementRows.map((r) => complementCols.map((c) => A4[r][c]));
      const exponent = rows.reduce((s,v) => s + v + 1, 0) + cols.reduce((s,v) => s + v + 1, 0);
      const sign = exponent % 2 === 0 ? 1 : -1;
      return { cols, complementCols, minor, complement, sign, minorDet: determinant(minor), complementDet: determinant(complement) };
    }

    function renderLaplace() {
      const info = laplaceInfo(pairs[pairIndex]);
      const x0 = 92, y0 = 90, size = 64, gap = 14;
      lapSvg.querySelector("[data-laplace-cells]").innerHTML = A4.map((row,r) => row.map((value,c) => {
        const primary = rows.includes(r) && info.cols.includes(c);
        const complement = !rows.includes(r) && info.complementCols.includes(c);
        const muted = !primary && !complement;
        return `<g class="story-laplace-cell${primary ? " is-primary" : ""}${complement ? " is-complement" : ""}${muted ? " is-muted" : ""}"><rect x="${x0 + c*(size+gap)}" y="${y0 + r*(size+gap)}" width="${size}" height="${size}" rx="13"/><text x="${x0 + c*(size+gap)+size/2}" y="${y0 + r*(size+gap)+size/2+1}" text-anchor="middle" dominant-baseline="middle">${value}</text></g>`;
      }).join("")).join("");
      const term = info.sign * info.minorDet * info.complementDet;
      root.querySelector("[data-lap-cols]").textContent = info.cols.map((c) => c + 1).join("、");
      root.querySelector("[data-lap-comp]").textContent = info.complementCols.map((c) => c + 1).join("、");
      root.querySelector("[data-lap-minor]").textContent = fmt(info.minorDet, 3);
      root.querySelector("[data-lap-sign]").textContent = info.sign > 0 ? "+1" : "−1";
      root.querySelector("[data-lap-complement]").textContent = fmt(info.complementDet, 3);
      root.querySelector("[data-lap-term]").textContent = fmt(term, 3);
      root.querySelector("[data-lap-message]").textContent = "青色子式选走两行两列，橙色互补子式自动占据剩余两行两列；两块合起来恰好覆盖全部行列。";
    }

    function poly(matrix, origin = [300,400], scale = 95) { return pointsString(parallelogram(origin, scale, [matrix[0][0],matrix[1][0]], [matrix[0][1],matrix[1][1]])); }
    function renderProduct(current, ghost, label) {
      const AB = M().mul2(product.A, product.B);
      prodSvg.querySelector("[data-product-ghost]").setAttribute("points", poly(ghost));
      prodSvg.querySelector("[data-product-current]").setAttribute("points", poly(current));
      root.querySelector("[data-product-step]").textContent = label;
      root.querySelector("[data-product-da]").textContent = fmt(M().det2(product.A), 3);
      root.querySelector("[data-product-db]").textContent = fmt(M().det2(product.B), 3);
      root.querySelector("[data-product-dab]").textContent = fmt(M().det2(AB), 3);
      root.querySelector("[data-product-message]").textContent = label.includes("第一步")
        ? "同一个单位正方形正在变成 B 的像；面积倍率是 det(B)。"
        : label.includes("第二步")
          ? "第二次变换从已经形成的 B 出发，而不是重新从单位正方形开始。"
          : "两次面积倍率依次作用，因此总倍率相乘。";
    }

    async function playProduct() {
      if (productBusy) return;
      productBusy = true;
      root.querySelectorAll("[data-product-preset], [data-product-play]").forEach((button) => { button.disabled = true; });
      const B = clone(product.B); const AB = M().mul2(product.A, product.B);
      try {
        if (M().reducedMotion()) { renderProduct(AB, B, "完成：I → B → AB"); return; }
        await animate(prodSvg, 680, (t) => renderProduct(M().lerpMat2(I, B, t), I, "第一步：I → B"));
        await animate(prodSvg, 760, (t) => renderProduct(M().lerpMat2(B, AB, t), B, "第二步：B → AB"));
        renderProduct(AB, B, "完成：两个面积倍率相乘");
      } finally {
        productBusy = false;
        root.querySelectorAll("[data-product-preset], [data-product-play]").forEach((button) => { button.disabled = false; });
      }
    }

    root.querySelectorAll("[data-story8-tab]").forEach((button) => button.addEventListener("click", () => {
      setActive(root, "[data-story8-tab]", button);
      const tab = button.dataset.story8Tab;
      root.querySelector("[data-story8-laplace]").hidden = tab !== "laplace";
      root.querySelector("[data-story8-product]").hidden = tab !== "product";
      if (tab === "product") void playProduct();
    }, { signal }));
    root.querySelectorAll("[data-laplace-pair]").forEach((button) => button.addEventListener("click", () => {
      pairIndex = Number(button.dataset.laplacePair);
      setActive(root, "[data-laplace-pair]", button);
      renderLaplace();
    }, { signal }));
    root.querySelectorAll("[data-product-preset]").forEach((button) => button.addEventListener("click", () => {
      setActive(root, "[data-product-preset]", button);
      const key = button.dataset.productPreset;
      if (key === "scale") product = { A: [[1.25,0],[0,1]], B: [[1.4,0],[0,1]] };
      if (key === "shear") product = { A: [[1.2,0],[0,1]], B: [[1,0.7],[0,1]] };
      if (key === "mirror") product = { A: [[0,-1],[1,0]], B: [[-1,0],[0,1]] };
      if (key === "project") product = { A: [[1,0],[0,1]], B: [[1,0],[0,0]] };
      void playProduct();
    }, { signal }));
    root.querySelector("[data-product-play]").addEventListener("click", () => { void playProduct(); }, { signal });
    renderLaplace();
    renderProduct(I, I, "准备：从单位正方形出发");
    return () => { controller.abort(); M().cancelAnim(prodSvg); };
  }

  window.extendChapter2Renderer("laplace-and-product", {
    interactive(root) {
      if (!root) return;
      const pairButtons = [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]].map((pair,index) => `<button type="button" data-laplace-pair="${index}" class="${index===0?"is-active":""}" aria-pressed="${index===0}">列 ${pair.join("、")}</button>`).join("");
      const productButtons = `<button type="button" data-product-preset="scale" class="is-active" aria-pressed="true">两次缩放</button><button type="button" data-product-preset="shear">剪切后缩放</button><button type="button" data-product-preset="mirror">镜像后旋转</button><button type="button" data-product-preset="project">含投影</button><button type="button" data-product-play>重播</button>`;
      const controls = `<button type="button" data-story8-tab="laplace" class="is-active" aria-pressed="true">互补子式</button><button type="button" data-story8-tab="product" aria-pressed="false">复合变换</button>`;
      const stage = `<div data-story8-laplace><div class="ch2-story-controls">${pairButtons}</div><div class="ch2-story-stage is-plain"><svg data-laplace-story-svg viewBox="0 0 900 500" role="img" aria-label="四阶矩阵中的子式与互补子式"><text x="36" y="44" class="story-caption">固定前两行，再选两列；剩余行列自动形成互补子式</text><g data-laplace-cells></g><text x="520" y="115" class="story-label-small">所选列</text><text x="520" y="154" class="story-label" data-lap-cols></text><text x="520" y="215" class="story-label-small">互补列</text><text x="520" y="254" class="story-label" data-lap-comp></text><text x="520" y="330" class="story-label-small">本项贡献</text><text x="520" y="374" class="story-label"><tspan data-lap-minor></tspan> × <tspan data-lap-sign></tspan> × <tspan data-lap-complement></tspan> = <tspan data-lap-term></tspan></text></svg></div></div><div data-story8-product hidden><div class="ch2-story-controls">${productButtons}</div><div class="ch2-story-stage"><svg data-product-story-svg viewBox="0 0 900 500" role="img" aria-label="同一图形依次经历 B 和 A 两次线性变换">${defs("product")}<g class="story-grid">${Array.from({ length: 19 }, (_, i) => `<line x1="${i*50}" y1="0" x2="${i*50}" y2="500"/>`).join("")}${Array.from({ length: 11 }, (_, i) => `<line x1="0" y1="${i*50}" x2="900" y2="${i*50}"/>`).join("")}</g><line class="story-axis" x1="0" y1="400" x2="900" y2="400"/><line class="story-axis" x1="300" y1="0" x2="300" y2="500"/><polygon data-product-ghost class="story-ghost"/><polygon data-product-current class="story-fill-primary"/><text x="520" y="150" class="story-label" data-product-step></text><text x="520" y="205" class="story-caption">第一步乘 det(B)</text><text x="520" y="245" class="story-caption">第二步再乘 det(A)</text></svg></div></div>`;
      const formula = `<div><span>子式 det</span><strong data-lap-minor></strong></div><div><span>位置符号</span><strong data-lap-sign></strong></div><div><span>互补子式 det</span><strong data-lap-complement></strong></div><div><span>det(A)</span><strong data-product-da></strong></div><div><span>det(B)</span><strong data-product-db></strong></div><div><span>det(AB)</span><strong data-product-dab></strong></div>`;
      root.innerHTML = `<h2>交互实验</h2>${shell("先看互补关系，再看同一块面积怎样连续经历两次变换", "Laplace 展开把全部行列分成互补的两块；乘法规则则追踪同一个图形依次经过 B 和 A。", "先切换六种列组合观察两块如何互补；再进入复合变换，确认第二步从 B 的结果继续，而不是重新开始。", controls, stage, formula, `<strong>当前解释</strong><span data-lap-message></span><span data-product-message hidden></span>`)}`;
      const cleanup = mountLaplaceProductStory(root);
      const lapMessage = root.querySelector("[data-lap-message]");
      const productMessage = root.querySelector("[data-product-message]");
      root.querySelectorAll("[data-story8-tab]").forEach((button) => button.addEventListener("click", () => {
        const productTab = button.dataset.story8Tab === "product";
        lapMessage.hidden = productTab;
        productMessage.hidden = !productTab;
      }));
      return cleanup;
    },
  });
})();
