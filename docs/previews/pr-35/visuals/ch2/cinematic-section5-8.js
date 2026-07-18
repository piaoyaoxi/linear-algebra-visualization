/* Chapter 2 cinematic interactions — sections 5–8. */
(() => {
  const C = window.Ch2Cinema;
  if (!C || !window.extendChapter2Renderer) return;
  const { M, tex, fmt, pause, setActive, cinemaShell, defs } = C;

  const clone = (matrix) => matrix.map((row) => row.slice());

  function matrixSvg(matrix, x, y, options = {}) {
    const size = options.size || 64;
    const gap = options.gap || 8;
    const classes = options.classes || (() => "");
    return matrix.map((row, r) => row.map((value, c) => {
      const cx = x + c * (size + gap);
      const cy = y + r * (size + gap);
      return `<g class="cinema-elim-cell ${classes(r, c)}"><rect x="${cx}" y="${cy}" width="${size}" height="${size}" rx="14"/><text x="${cx + size / 2}" y="${cy + size / 2 + 8}" text-anchor="middle">${fmt(value, 3)}</text></g>`;
    }).join("")).join("");
  }

  // §5 — calculation as a purposeful elimination route.
  function mountCalculationCinema(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const states = [
      [[2, 1, 0], [1, 3, 1], [0, 2, 1]],
      [[2, 1, 0], [0, 2.5, 1], [0, 2, 1]],
      [[2, 1, 0], [0, 2.5, 1], [0, 0, 0.2]],
    ];
    let step = 0;
    let busy = false;
    const labels = [
      "先寻找主对角线下方必须消去的元素。",
      "a₂₁ 已变成 0；下一目标是 a₃₂。",
      "已经是上三角：对角线乘积 2×2.5×0.2=1。",
    ];

    function render() {
      const matrix = states[step];
      const scene = root.querySelector("[data-c5-scene]");
      const panels = [
        { x: 58, title: "原矩阵", matrix: states[0] },
        { x: 372, title: "制造第一个 0", matrix: states[1] },
        { x: 686, title: "上三角", matrix: states[2] },
      ];
      scene.innerHTML = panels.map((panel, index) => `
        <g opacity="${index <= step ? 1 : 0.23}">
          <rect x="${panel.x}" y="126" width="254" height="342" rx="28" class="cinema-panel-bg"/>
          <text x="${panel.x + 24}" y="164" class="cinema-small">${panel.title}</text>
          ${matrixSvg(panel.matrix, panel.x + 26, 196, {
            size: 58,
            gap: 8,
            classes(r, c) {
              if (index === 0 && r === 1 && c === 0) return "is-target";
              if (index === 1 && r === 1 && c === 0) return "is-created-zero";
              if (index === 1 && r === 2 && c === 1) return "is-target";
              if (index === 2 && ((r === 1 && c === 0) || (r === 2 && c === 1))) return "is-created-zero";
              return "";
            },
          })}
        </g>`).join("");
      root.querySelector("[data-c5-step-text]").textContent = labels[step];
      root.querySelector("[data-triangle-status]").textContent = step === 2 ? "已经是上三角：现在只需读对角线乘积。" : labels[step];
      root.querySelector("[data-current-det]").textContent = fmt(M().determinant(matrix), 4);
      root.querySelector("[data-orig]").textContent = "1";
      root.querySelector("[data-c5-operation]").textContent = step === 0 ? "等待第一步" : step === 1 ? "R₂←R₂−0.5R₁" : "R₃←R₃−0.8R₂";
      root.querySelectorAll("[data-step-marker]").forEach((marker) => {
        const index = Number(marker.dataset.stepMarker);
        marker.classList.toggle("is-active", index === (step === 2 ? 3 : step));
      });
      root.querySelector("[data-c5-next]").disabled = busy || step >= 2;
      root.querySelector("[data-op-demo]").disabled = busy;
    }

    async function advance() {
      if (busy || step >= 2) return;
      step += 1;
      render();
      await pause(320);
    }

    root.querySelector("[data-c5-next]").addEventListener("click", advance, { signal });
    root.querySelector("[data-c5-reset]").addEventListener("click", () => { if (!busy) { step = 0; render(); } }, { signal });
    root.querySelector("[data-op-demo]").addEventListener("click", async () => {
      if (busy) return;
      busy = true;
      step = 0;
      render();
      await pause(300);
      step = 1;
      render();
      await pause(520);
      step = 2;
      busy = false;
      render();
    }, { signal });
    render();
    return () => controller.abort();
  }

  window.extendChapter2Renderer("determinant-computation", {
    interactive(root) {
      if (!root) return;
      const controls = `<button type="button" data-c5-next>执行下一步</button><button type="button" data-op-demo>播放两步三角化</button><button type="button" data-c5-reset>重置</button>`;
      const stage = `
        <div class="ch2-cinema-stage ch2-v2-stage">
          <svg viewBox="0 0 1000 580" role="img" aria-label="三阶行列式从原矩阵逐步消元到上三角矩阵">
            ${defs("c5")}
            <text x="40" y="52" class="cinema-kicker">计算不是乱试按钮，而是制造零的路线</text>
            <text x="40" y="86" class="cinema-title">每一步只盯住一个目标元素</text>
            <g data-c5-scene></g>
            <path d="M320 300H366" class="cinema-operation-arrow" marker-end="url(#c5-arrow-white)"/>
            <text x="343" y="278" text-anchor="middle" class="cinema-small">R₂−0.5R₁</text>
            <path d="M634 300H680" class="cinema-operation-arrow" marker-end="url(#c5-arrow-white)"/>
            <text x="657" y="278" text-anchor="middle" class="cinema-small">R₃−0.8R₂</text>
          </svg>
        </div>`;
      const after = `
        <div class="ch2-cinema-progress"><span class="is-active" data-step-marker="0">读结构</span><span data-step-marker="1">制造 a₂₁=0</span><span data-step-marker="3">制造 a₃₂=0，读对角线</span></div>
        <div class="ch2-cinema-equation-grid is-compact">
          <div><span>当前动作</span><strong data-c5-operation></strong></div>
          <div><span>当前 det</span><strong data-current-det></strong></div>
          <div><span>累计倍率</span><strong>1</strong></div>
          <div><span>恢复原 det</span><strong data-orig></strong></div>
        </div>
        <div class="ch2-cinema-conclusion"><strong data-triangle-status></strong><span data-c5-step-text></span></div>`;
      root.innerHTML = `<h2>交互实验</h2>${cinemaShell(
        "把行列式计算变成一条看得见的消元路线",
        "倍加不改变行列式，所以它最适合不断制造零。真正的目标不是“按完所有按钮”，而是让矩阵变成可以直接读取的上三角结构。",
        "先自己执行下一步，再播放完整路线。每次只观察橙色目标怎样变成青色的 0，最后再读取对角线乘积。",
        controls,
        stage,
        after,
      )}`;
      return mountCalculationCinema(root);
    },
  });

  // §6 — cofactor extraction and route comparison.
  function mountCofactorCinema(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const matrix = [[1, 2, 0], [0, 3, 0], [4, 5, 6]];
    let active = { row: 1, col: 1 };
    let route = { type: "row", index: 1 };

    function cofactor(row, col) {
      const minorMatrix = M().minorMatrix(matrix, row, col);
      const minor = M().determinant(minorMatrix);
      const sign = (row + col) % 2 === 0 ? 1 : -1;
      return { minorMatrix, minor, sign, cofactor: sign * minor };
    }

    function expansion(type, index) {
      const items = [];
      let total = 0;
      for (let cursor = 0; cursor < 3; cursor += 1) {
        const row = type === "row" ? index : cursor;
        const col = type === "row" ? cursor : index;
        const element = matrix[row][col];
        const info = cofactor(row, col);
        const contribution = element * info.cofactor;
        total += contribution;
        items.push({ row, col, element, contribution });
      }
      return { items, total };
    }

    function renderMinor() {
      const board = root.querySelector("[data-cofactor-board]");
      const grid = root.querySelector("[data-cof-table]");
      grid.innerHTML = matrix.map((row, r) => row.map((value, c) => {
        const selected = r === active.row && c === active.col;
        const crossed = r === active.row || c === active.col;
        return `<button type="button" data-cof-cell="${r},${c}" class="${selected ? "is-current" : crossed ? "is-deleted" : "is-remain"}" ${crossed && !selected ? "disabled" : ""}>${value}</button>`;
      }).join("")).join("");
      grid.querySelectorAll("[data-cof-cell]").forEach((button) => button.addEventListener("click", () => {
        const [row, col] = button.dataset.cofCell.split(",").map(Number);
        active = { row, col };
        renderMinor();
      }, { signal }));
      const rowLine = board.querySelector(".ch2-v2-strike-row");
      const colLine = board.querySelector(".ch2-v2-strike-col");
      rowLine.style.top = `${37 + active.row * 92}px`;
      colLine.style.left = `${57 + active.col * 92}px`;
      const info = cofactor(active.row, active.col);
      root.querySelector("[data-minor-grid]").innerHTML = info.minorMatrix.flat().map((value) => `<span>${value}</span>`).join("");
      root.querySelector("[data-c6-cell-label]").textContent = `a${active.row + 1}${active.col + 1}=${matrix[active.row][active.col]}`;
      root.querySelector("[data-c6-minor]").textContent = fmt(info.minor, 3);
      root.querySelector("[data-c6-sign]").textContent = info.sign > 0 ? "+" : "−";
      root.querySelector("[data-c6-cofactor]").textContent = fmt(info.cofactor, 3);
    }

    function renderRoute() {
      const result = expansion(route.type, route.index);
      const label = `第 ${route.index + 1} ${route.type === "row" ? "行" : "列"}`;
      root.querySelector("[data-route-label]").textContent = label;
      root.querySelector("[data-route-terms]").innerHTML = result.items.map((item) => `<span>${item.element}×A${item.row + 1}${item.col + 1}=${fmt(item.contribution, 3)}</span>`).join("");
      root.querySelector("[data-true]").textContent = fmt(result.total, 3);
      const omitted = result.items.filter((item) => Math.abs(item.element) < 1e-9).length;
      root.querySelector("[data-omitted]").textContent = `${omitted} 项因元素为 0 可直接略去`;
      root.querySelectorAll("[data-route-type]").forEach((button) => button.classList.toggle("is-active", button.dataset.routeType === route.type && Number(button.dataset.routeIndex) === route.index));
    }

    root.querySelectorAll("[data-cofactor-tab]").forEach((button) => button.addEventListener("click", () => {
      setActive(root, "[data-cofactor-tab]", button);
      const tab = button.dataset.cofactorTab;
      root.querySelector("[data-minor-panel]").hidden = tab !== "minor";
      root.querySelector("[data-expansion-panel]").hidden = tab !== "expansion";
    }, { signal }));
    root.querySelectorAll("[data-route-type]").forEach((button) => button.addEventListener("click", () => {
      route = { type: button.dataset.routeType, index: Number(button.dataset.routeIndex) };
      renderRoute();
    }, { signal }));
    renderMinor();
    renderRoute();
    return () => controller.abort();
  }

  window.extendChapter2Renderer("cofactor-expansion", {
    interactive(root) {
      if (!root) return;
      const controls = `<button type="button" class="is-active" data-cofactor-tab="minor">看一个代数余子式</button><button type="button" data-cofactor-tab="expansion">比较六条展开路线</button>`;
      const stage = `
        <div class="ch2-cinema-stage ch2-v2-stage ch2-cofactor-stage">
          <div data-minor-panel class="ch2-cofactor-layout">
            <div class="ch2-cofactor-board" data-cofactor-board><div class="ch2-v2-strike-row"></div><div class="ch2-v2-strike-col"></div><div data-cof-table></div></div>
            <div class="ch2-cofactor-transfer">→</div>
            <div class="ch2-minor-panel"><span class="cinema-kicker">删去所在行与列</span><strong data-c6-cell-label></strong><div class="ch2-minor-grid" data-minor-grid></div><p>剩下的四个数保持原来的相对位置，组成二阶余子式。</p></div>
          </div>
          <div data-expansion-panel class="ch2-route-panel" hidden>
            <div class="ch2-cinema-controls">${[0,1,2].map((i) => `<button type="button" data-route-type="row" data-route-index="${i}">第 ${i + 1} 行</button>`).join("")}${[0,1,2].map((i) => `<button type="button" data-route-type="col" data-route-index="${i}">第 ${i + 1} 列</button>`).join("")}</div>
            <div class="ch2-route-visual"><span>当前路线</span><h4 data-route-label></h4><div data-route-terms></div><p data-omitted></p></div>
          </div>
        </div>`;
      const after = `
        <div class="ch2-cinema-equation-grid is-compact"><div><span>余子式 Mᵢⱼ</span><strong data-c6-minor></strong></div><div><span>棋盘符号</span><strong data-c6-sign></strong></div><div><span>代数余子式 Aᵢⱼ</span><strong data-c6-cofactor></strong></div><div><span>整条展开结果</span><strong data-true>18</strong></div></div>
        <div class="ch2-cinema-conclusion"><strong>几何动作</strong><span>横线和竖线不是装饰：它们准确删除元素所在行列，留下的坐标关系就是余子式。</span></div>`;
      root.innerHTML = `<h2>交互实验</h2>${cinemaShell(
        "用两条细线真正看见余子式从哪里来",
        "点击一个元素时，不要在脑中模糊地说“去掉它附近的数”。准确动作是删掉它所在的整行与整列，保留下来的交叉补集才组成余子式。",
        "先点击中心元素，看四个保留元素如何原样搬到右侧；再切到展开路线，比较为什么含零最多的行或列最省计算。",
        controls,
        stage,
        after,
      )}`;
      return mountCofactorCinema(root);
    },
  });

  function planeSvg(matrix, b, prefix) {
    const origin = [118, 250];
    const scale = 74;
    const map = ([x, y]) => [origin[0] + x * scale, origin[1] - y * scale];
    const u = [matrix[0][0], matrix[1][0]];
    const v = [matrix[0][1], matrix[1][1]];
    const O = map([0, 0]);
    const U = map(u); const V = map(v); const UV = map([u[0] + v[0], u[1] + v[1]]); const B = map(b);
    return `<svg viewBox="0 0 320 320" role="img" aria-label="列向量与目标向量围成的有向面积">${defs(prefix)}<rect width="320" height="320" fill="#09121f"/><line x1="20" y1="250" x2="305" y2="250" class="cinema-axis"/><line x1="118" y1="18" x2="118" y2="304" class="cinema-axis"/><polygon points="${[O,U,UV,V].map((p) => p.join(",")).join(" ")}" class="cinema-parallelogram"/><line x1="${O[0]}" y1="${O[1]}" x2="${U[0]}" y2="${U[1]}" class="cinema-vector cyan" marker-end="url(#${prefix}-arrow-cyan)"/><line x1="${O[0]}" y1="${O[1]}" x2="${V[0]}" y2="${V[1]}" class="cinema-vector orange" marker-end="url(#${prefix}-arrow-orange)"/><line x1="${O[0]}" y1="${O[1]}" x2="${B[0]}" y2="${B[1]}" class="cinema-operation-arrow" marker-end="url(#${prefix}-arrow-white)"/><text x="${B[0] + 8}" y="${B[1] - 8}" class="cinema-small">b</text></svg>`;
  }

  // §7 — Cramer's rule as area ratios.
  function mountCramerCinema(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const presets = {
      unique: { A: [[2,1],[1,2]], b: [3,3], label: "唯一解" },
      near: { A: [[1,0.98],[0,0.02]], b: [1.98,0.02], label: "唯一解，但接近共线" },
      singular: { A: [[1,2],[2,4]], b: [3,6], label: "D=0：无穷多解" },
      none: { A: [[1,2],[2,4]], b: [3,7], label: "D=0：无解" },
    };
    let state = presets.unique;

    function render() {
      const A = state.A;
      const b = state.b;
      const A1 = [[b[0], A[0][1]], [b[1], A[1][1]]];
      const A2 = [[A[0][0], b[0]], [A[1][0], b[1]]];
      const D = M().det2(A); const D1 = M().det2(A1); const D2 = M().det2(A2);
      root.querySelector("[data-cramer-a]").innerHTML = planeSvg(A, b, "c7a");
      root.querySelector("[data-cramer-a1]").innerHTML = planeSvg(A1, b, "c7b");
      root.querySelector("[data-cramer-a2]").innerHTML = planeSvg(A2, b, "c7c");
      root.querySelector("[data-d]").textContent = fmt(D, 4);
      root.querySelector("[data-d1]").textContent = fmt(D1, 4);
      root.querySelector("[data-d2]").textContent = fmt(D2, 4);
      const sol = root.querySelector("[data-sol]");
      if (Math.abs(D) > 1e-9) {
        const x1 = D1 / D; const x2 = D2 / D;
        sol.textContent = state.label;
        root.querySelector("[data-x1]").textContent = fmt(x1, 4);
        root.querySelector("[data-x2]").textContent = fmt(x2, 4);
        const r1 = A[0][0] * x1 + A[0][1] * x2 - b[0];
        const r2 = A[1][0] * x1 + A[1][1] * x2 - b[1];
        root.querySelector("[data-residual]").textContent = `重构误差 ${fmt(Math.hypot(r1, r2), 6)}`;
      } else {
        const infinite = Math.abs(D1) < 1e-9 && Math.abs(D2) < 1e-9;
        sol.textContent = infinite ? "无穷多解：b 仍在线上" : "无解：b 已离开列空间";
        root.querySelector("[data-x1]").textContent = "—";
        root.querySelector("[data-x2]").textContent = "—";
        root.querySelector("[data-residual]").textContent = "分母面积 D=0，Cramer 比值停止。";
      }
    }

    root.querySelectorAll("[data-cramer-preset]").forEach((button) => button.addEventListener("click", () => {
      setActive(root, "[data-cramer-preset]", button);
      state = presets[button.dataset.cramerPreset];
      render();
    }, { signal }));
    render();
    return () => controller.abort();
  }

  window.extendChapter2Renderer("cramer-rule", {
    interactive(root) {
      if (!root) return;
      const controls = `<button type="button" class="is-active" data-cramer-preset="unique">唯一解</button><button type="button" data-cramer-preset="near" data-cramer-near>接近共线</button><button type="button" data-cramer-preset="singular" data-cramer-sing>无穷多解</button><button type="button" data-cramer-preset="none" data-cramer-none>无解</button>`;
      const stage = `<div class="ch2-cinema-stage ch2-v2-stage ch2-cramer-stage"><div class="ch2-cramer-grid"><section><h4>A：原来的两列与 b</h4><div data-cramer-a></div></section><section><h4>A₁：第一列换成 b</h4><div data-cramer-a1></div></section><section><h4>A₂：第二列换成 b</h4><div data-cramer-a2></div></section></div></div>`;
      const after = `<div class="ch2-cinema-equation-grid is-compact"><div><span>D=det(A)</span><strong data-d></strong></div><div><span>D₁</span><strong data-d1></strong></div><div><span>D₂</span><strong data-d2></strong></div><div><span>面积比坐标</span><strong>x₁=<span data-x1></span>，x₂=<span data-x2></span></strong></div></div><div class="ch2-cinema-conclusion"><strong data-sol></strong><span data-residual></span></div>`;
      root.innerHTML = `<h2>交互实验</h2>${cinemaShell(
        "Cramer 法则不是三个行列式排成一排，而是两次替换后的面积比",
        "D 测量原两列撑开的有向面积；D₁、D₂ 分别把一列替换成目标 b。两个比值恰好读取 b 在原两列下的坐标。",
        "先看唯一解 (1,1)，再进入接近共线和 D=0。观察分母面积变小时比值为何敏感，面积完全消失时公式为何必须停止。",
        controls,
        stage,
        after,
      )}`;
      return mountCramerCinema(root);
    },
  });

  function productPlane(matrix, prefix) {
    return planeSvg(matrix, [0,0], prefix);
  }

  // §8 — Laplace complement and product composition.
  function mountLaplaceProductCinema(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const laplace = [[1,2,0,0],[0,1,0,0],[0,0,2,1],[0,0,0,3]];
    const selected = new Set(["0,0","0,1","1,0","1,1"]);
    const complement = new Set(["2,2","2,3","3,2","3,3"]);
    root.querySelector("[data-laplace-table]").innerHTML = laplace.map((row, r) => row.map((value, c) => `<span class="${selected.has(`${r},${c}`) ? "is-selected" : complement.has(`${r},${c}`) ? "is-complement" : ""}">${value}</span>`).join("")).join("");
    root.querySelector("[data-pair-sum]").textContent = "6";
    root.querySelector("[data-pair-det]").textContent = "6";
    root.querySelector("[data-rule-status]").textContent = "验证完成：选定子式与互补子式配对得到 det(A)=6。";
    const presets = {
      general: { A: [[1,1],[0,1]], B: [[2,0],[0,0.5]] },
      rotate: { A: [[0,-1],[1,0]], B: [[1,0.8],[0,1]] },
      project: { A: [[1,1],[0,1]], B: [[1,0],[0,0]] },
    };
    let state = presets.general;

    function renderProduct() {
      const AB = M().mul2(state.A, state.B);
      const da = M().det2(state.A); const db = M().det2(state.B); const dab = M().det2(AB);
      root.querySelector("[data-prod-i]").innerHTML = productPlane([[1,0],[0,1]], "c8i");
      root.querySelector("[data-prod-b]").innerHTML = productPlane(state.B, "c8b");
      root.querySelector("[data-prod-ab]").innerHTML = productPlane(AB, "c8ab");
      root.querySelector("[data-da]").textContent = fmt(da, 4);
      root.querySelector("[data-db]").textContent = fmt(db, 4);
      root.querySelector("[data-prod]").textContent = fmt(da * db, 4);
      root.querySelector("[data-dab]").textContent = fmt(dab, 4);
      root.querySelector("[data-product-status]").textContent = Math.abs(dab) < 1e-9 ? "B 先把平面压成一条线，A 无法恢复已经丢失的面积。" : "复合变换的面积倍率，正好是两次倍率相乘。";
    }

    root.querySelectorAll("[data-prod-preset]").forEach((button) => button.addEventListener("click", () => {
      setActive(root, "[data-prod-preset]", button);
      state = presets[button.dataset.prodPreset];
      renderProduct();
    }, { signal }));
    root.querySelector("[data-prod-replay]").addEventListener("click", () => {
      root.querySelectorAll(".ch2-product-panel").forEach((panel, index) => panel.animate?.([{ opacity: .3, transform: "translateY(7px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: M().reducedMotion() ? 1 : 420, delay: M().reducedMotion() ? 0 : index * 170, easing: "ease-out" }));
    }, { signal });
    renderProduct();
    return () => controller.abort();
  }

  window.extendChapter2Renderer("laplace-and-product", {
    interactive(root) {
      if (!root) return;
      root.innerHTML = `<h2>交互实验</h2><div class="ch2-cinema">
        <div class="ch2-cinema-head"><h3>本节有两条视觉故事：互补选择与连续变换</h3><p>Laplace 展开把一个选定子式与自动剩下的互补子式配成一项；乘法规则则让同一个单位面积依次经过 B 和 A。一个是局部贡献相加，一个是连续倍率相乘。</p></div>
        <div class="ch2-cinema-task"><strong>观察任务</strong><span>先看蓝色区域选中哪些行列、橙色区域为何只能落在剩余位置；再看 I→B→AB 三幅图中的面积怎样连续变化。</span></div>
        <section class="ch2-cinema-substory"><span class="cinema-kicker">故事一 · Laplace 互补子式</span><div class="ch2-cinema-stage ch2-v2-stage ch2-laplace-stage"><div class="ch2-laplace-grid"><div class="ch2-laplace-table" data-laplace-table></div><div class="ch2-laplace-pipeline"><div><span>选定子式</span><strong>1</strong></div><i>×</i><div><span>位置符号</span><strong>+1</strong></div><i>×</i><div><span>互补子式</span><strong>6</strong></div></div></div></div><div class="ch2-cinema-equation-grid is-compact"><div><span>配对贡献</span><strong data-pair-sum></strong></div><div><span>det(A)</span><strong data-pair-det></strong></div><div style="grid-column:span 2"><span>状态</span><strong data-rule-status></strong></div></div></section>
        <section class="ch2-cinema-substory"><span class="cinema-kicker">故事二 · det(AB)=det(A)det(B)</span><div class="ch2-cinema-controls"><button type="button" class="is-active" data-prod-preset="general">伸缩后剪切</button><button type="button" data-prod-preset="rotate">剪切后旋转</button><button type="button" data-prod-preset="project">先降维</button><button type="button" data-prod-replay>重播 I→B→AB</button></div><div class="ch2-cinema-stage ch2-v2-stage ch2-product-stage"><div class="ch2-product-strip"><section class="ch2-product-panel"><h4>I · 面积 1</h4><div data-prod-i></div></section><b>→</b><section class="ch2-product-panel"><h4>B · 第一次变换</h4><div data-prod-b></div></section><b>→</b><section class="ch2-product-panel"><h4>AB · 再经过 A</h4><div data-prod-ab></div></section></div></div><div class="ch2-cinema-equation-grid is-compact"><div><span>det(A)</span><strong data-da></strong></div><div><span>det(B)</span><strong data-db></strong></div><div><span>det(A)det(B)</span><strong data-prod></strong></div><div><span>det(AB)</span><strong data-dab></strong></div></div><div class="ch2-cinema-conclusion"><strong>几何结论</strong><span data-product-status></span></div></section>
      </div>`;
      return mountLaplaceProductCinema(root);
    },
  });
})();
