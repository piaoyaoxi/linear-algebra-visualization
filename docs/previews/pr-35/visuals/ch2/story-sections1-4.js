/* Chapter 2 geometry-first stories — sections 1–4. */
(() => {
  const C = window.Ch2Story;
  if (!C || typeof window.extendChapter2Renderer !== "function") return;
  const { M, fmt, tex, shell, defs, setActive, mapPoint, pointsString, parallelogram, animate } = C;

  // §1 — determinant as one continuous oriented-area scene.
  function mountAreaStory(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const svg = root.querySelector("[data-story-area-svg]");
    const origin = [410, 390];
    const scale = 126;
    const state = { u: [1, 0], v: [0.55, 1], dragging: null, busy: false };
    const presets = {
      identity: { u: [1, 0], v: [0, 1] },
      shear: { u: [1, 0], v: [1.1, 1] },
      scale2: { u: [2, 0], v: [0, 1] },
      mirror: { u: [-1, 0], v: [0, 1] },
      collapse: { u: [1, 0.5], v: [2, 1] },
      negative: { u: [-1.6, 0], v: [0, 1] },
    };

    function render() {
      const { u, v } = state;
      const det = u[0] * v[1] - u[1] * v[0];
      const O = mapPoint(origin, scale, [0, 0]);
      const U = mapPoint(origin, scale, u);
      const V = mapPoint(origin, scale, v);
      const poly = parallelogram(origin, scale, u, v);
      const fillClass = Math.abs(det) < 1e-7 ? "story-fill-negative" : det < 0 ? "story-fill-negative" : "story-fill-primary";
      svg.querySelector("[data-area-poly]").setAttribute("points", pointsString(poly));
      svg.querySelector("[data-area-poly]").setAttribute("class", fillClass);
      const uLine = svg.querySelector("[data-area-u]");
      const vLine = svg.querySelector("[data-area-v]");
      [[uLine, U, "cyan"], [vLine, V, "orange"]].forEach(([line, point, color]) => {
        line.setAttribute("x2", point[0]);
        line.setAttribute("y2", point[1]);
        line.setAttribute("marker-end", `url(#area-arrow-${color})`);
      });
      const uHandle = svg.querySelector('[data-area-handle="u"]');
      const vHandle = svg.querySelector('[data-area-handle="v"]');
      uHandle.setAttribute("cx", U[0]); uHandle.setAttribute("cy", U[1]);
      vHandle.setAttribute("cx", V[0]); vHandle.setAttribute("cy", V[1]);
      const uLabel = svg.querySelector("[data-area-u-label]");
      const vLabel = svg.querySelector("[data-area-v-label]");
      uLabel.setAttribute("x", U[0] + 12); uLabel.setAttribute("y", U[1] - 12);
      vLabel.setAttribute("x", V[0] + 12); vLabel.setAttribute("y", V[1] - 12);
      root.querySelector("[data-area-matrix]").innerHTML = tex(`\\begin{bmatrix}${fmt(u[0], 2)}&${fmt(v[0], 2)}\\\\${fmt(u[1], 2)}&${fmt(v[1], 2)}\\end{bmatrix}`);
      root.querySelector("[data-area-cross]").textContent = `${fmt(u[0], 2)}×${fmt(v[1], 2)} − ${fmt(v[0], 2)}×${fmt(u[1], 2)}`;
      root.querySelector("[data-area-det]").textContent = fmt(det, 3);
      root.querySelector("[data-area-abs]").textContent = fmt(Math.abs(det), 3);
      const status = root.querySelector("[data-area-status]");
      const message = root.querySelector("[data-area-message]");
      if (Math.abs(det) < 1e-7) {
        status.textContent = "二维面积消失";
        message.textContent = "两列共线，平行四边形退化成线段：这就是 det=0 的维度塌缩。";
      } else if (det < 0) {
        status.textContent = "方向翻转";
        message.textContent = `普通面积仍是 ${fmt(Math.abs(det), 3)}，负号只记录有序方向被翻转。`;
      } else {
        status.textContent = "方向保持";
        message.textContent = `单位正方形被送成面积为 ${fmt(Math.abs(det), 3)} 的平行四边形。`;
      }
      void O;
    }

    async function go(target) {
      if (state.busy) M().cancelAnim(svg);
      const from = { u: state.u.slice(), v: state.v.slice() };
      state.busy = true;
      try {
        await animate(svg, 620, (t) => {
          state.u = [M().lerp(from.u[0], target.u[0], t), M().lerp(from.u[1], target.u[1], t)];
          state.v = [M().lerp(from.v[0], target.v[0], t), M().lerp(from.v[1], target.v[1], t)];
          render();
        });
      } finally {
        state.u = target.u.slice(); state.v = target.v.slice(); state.busy = false; render();
      }
    }

    root.querySelectorAll("[data-area-preset]").forEach((button) => button.addEventListener("click", () => {
      setActive(root, "[data-area-preset]", button);
      void go(presets[button.dataset.areaPreset]);
    }, { signal }));

    const pointFromEvent = (event) => {
      const point = svg.createSVGPoint();
      point.x = event.clientX; point.y = event.clientY;
      const local = point.matrixTransform(svg.getScreenCTM().inverse());
      return [(local.x - origin[0]) / scale, (origin[1] - local.y) / scale];
    };
    svg.querySelectorAll("[data-area-handle]").forEach((handle) => {
      handle.addEventListener("pointerdown", (event) => {
        M().cancelAnim(svg); state.busy = false; state.dragging = handle.dataset.areaHandle;
        handle.setPointerCapture(event.pointerId);
      }, { signal });
      handle.addEventListener("pointermove", (event) => {
        if (state.dragging !== handle.dataset.areaHandle) return;
        const [x, y] = pointFromEvent(event);
        state[state.dragging] = [M().clamp(x, -2.2, 2.2), M().clamp(y, -1.2, 2.2)];
        root.querySelectorAll("[data-area-preset]").forEach((button) => { button.classList.remove("is-active"); button.setAttribute("aria-pressed", "false"); });
        render();
      }, { signal });
      const stop = () => { state.dragging = null; };
      handle.addEventListener("pointerup", stop, { signal });
      handle.addEventListener("pointercancel", stop, { signal });
    });
    render();
    return () => { controller.abort(); M().cancelAnim(svg); };
  }

  window.extendChapter2Renderer("determinant-intro", {
    interactive(root) {
      if (!root) return;
      const controls = [
        ["identity", "单位形"], ["shear", "剪切但面积不变"], ["scale2", "面积 ×2"],
        ["collapse", "共线 det=0"], ["mirror", "镜像"], ["negative", "翻转且放大"],
      ].map(([key, label], index) => `<button type="button" data-area-preset="${key}" class="${index === 0 ? "is-active" : ""}" aria-pressed="${index === 0}">${label}</button>`).join("");
      const stage = `<div class="ch2-story-stage"><svg data-story-area-svg viewBox="0 0 900 520" role="img" aria-label="拖动矩阵两列观察有向面积、方向和塌缩">${defs("area")}<g class="story-grid">${Array.from({ length: 19 }, (_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="520"/>`).join("")}${Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="${i * 50}" x2="900" y2="${i * 50}"/>`).join("")}</g><line class="story-axis" x1="0" y1="390" x2="900" y2="390"/><line class="story-axis" x1="410" y1="0" x2="410" y2="520"/><polygon class="story-ghost" points="410,390 536,390 536,264 410,264"/><polygon data-area-poly/><line data-area-u class="story-vector-primary" x1="410" y1="390"/><line data-area-v class="story-vector-secondary" x1="410" y1="390"/><circle data-area-handle="u" class="story-handle primary" r="9"/><circle data-area-handle="v" class="story-handle secondary" r="9"/><text data-area-u-label class="story-label">第一列</text><text data-area-v-label class="story-label">第二列</text><text x="26" y="34" class="story-caption">虚线是单位正方形；彩色图形是它经过矩阵后的像</text></svg></div>`;
      const formula = `<div><span>矩阵的两列</span><strong data-area-matrix></strong></div><div><span>交叉相乘相减</span><strong data-area-cross></strong></div><div><span>有向面积</span><strong data-area-det></strong></div><div><span>普通面积</span><strong data-area-abs></strong></div>`;
      root.innerHTML = `<h2>交互实验</h2>${shell("先看面积怎样出现，再看公式怎样把它记下来", "矩阵的两列就是单位正方形两条边的去向。图形、面积和方向在同一画面里同步变化。", "依次经历剪切、共线和翻转；也可以直接拖动两个端点，让 det 连续穿过 0。", controls, stage, formula, `<strong data-area-status></strong><span data-area-message></span>`)}`;
      return mountAreaStory(root);
    },
  });

  // §2 — inversions are literal wire crossings.
  function mountPermutationStory(root) {
    const controller = new AbortController();
    const { signal } = controller;
    let permutation = [3, 1, 4, 2];
    const xs = [135, 335, 535, 735];
    const topY = 105;
    const bottomY = 365;

    function inversions() {
      return M().inversionPairs(permutation);
    }

    function crossingPoint(i, j) {
      const x1 = xs[i], x2 = xs[j];
      const y1 = xs[permutation[i] - 1], y2 = xs[permutation[j] - 1];
      const denom = (y1 - x1) - (y2 - x2);
      const t = Math.abs(denom) < 1e-9 ? 0.5 : (x2 - x1) / denom;
      return [x1 + (y1 - x1) * t, topY + (bottomY - topY) * t];
    }

    function render(message = "每一个橙色交点都对应一对逆序。") {
      const svg = root.querySelector("[data-perm-svg]");
      const inv = inversions();
      const involved = new Set(inv.flatMap((item) => [item.i, item.j]));
      svg.querySelector("[data-perm-scene]").innerHTML = `
        ${xs.map((x, index) => `<rect class="story-card" x="${x - 34}" y="58" width="68" height="52" rx="13"/><text class="story-number" x="${x}" y="84">${permutation[index]}</text><text class="story-label-small" x="${x}" y="42" text-anchor="middle">位置 ${index + 1}</text>`).join("")}
        ${permutation.map((value, index) => `<line class="story-wire${involved.has(index) ? " is-inversion" : ""}" x1="${xs[index]}" y1="${topY}" x2="${xs[value - 1]}" y2="${bottomY}"/>`).join("")}
        ${inv.map((item) => { const [x, y] = crossingPoint(item.i, item.j); return `<circle cx="${x}" cy="${y}" r="8" fill="#e8a15d" stroke="var(--surface-solid,#fff)" stroke-width="3"/>`; }).join("")}
        ${xs.map((x, index) => `<circle cx="${x}" cy="${bottomY}" r="22" fill="var(--surface-solid,#fff)" stroke="var(--line-strong,rgba(24,43,57,.18))" stroke-width="2"/><text class="story-number" x="${x}" y="${bottomY}">${index + 1}</text>`).join("")}`;
      root.querySelector("[data-perm-word]").textContent = permutation.join("");
      root.querySelector("[data-perm-tau]").textContent = String(inv.length);
      root.querySelector("[data-perm-sign]").textContent = inv.length % 2 === 0 ? "+1（偶排列）" : "−1（奇排列）";
      root.querySelector("[data-perm-message]").textContent = message;
      root.querySelector("[data-adj-step]").disabled = !permutation.some((value, index) => index < permutation.length - 1 && value > permutation[index + 1]);
    }

    root.querySelector("[data-adj-step]").addEventListener("click", () => {
      const index = permutation.findIndex((value, i) => i < permutation.length - 1 && value > permutation[i + 1]);
      if (index < 0) return;
      const before = permutation.slice();
      [permutation[index], permutation[index + 1]] = [permutation[index + 1], permutation[index]];
      render(`交换相邻的 ${before[index]} 与 ${before[index + 1]}，恰好消掉一个交叉，所以奇偶性翻转。`);
    }, { signal });
    root.querySelector("[data-perm-reset]").addEventListener("click", () => { permutation = [3, 1, 4, 2]; render(); }, { signal });
    root.querySelectorAll("[data-perm-preset]").forEach((button) => button.addEventListener("click", () => {
      setActive(root, "[data-perm-preset]", button);
      permutation = button.dataset.permPreset.split("").map(Number);
      render("同一组数字换了顺序，交叉数也随之改变。");
    }, { signal }));
    render();
    return () => controller.abort();
  }

  window.extendChapter2Renderer("permutations", {
    interactive(root) {
      if (!root) return;
      const controls = `<button type="button" data-perm-preset="1234">无交叉 1234</button><button type="button" data-perm-preset="3142">三个交叉 3142</button><button type="button" data-perm-preset="4321">全部反序 4321</button><button type="button" data-adj-step>消掉一个相邻交叉</button><button type="button" data-perm-reset>重置</button>`;
      const stage = `<div class="ch2-story-stage is-plain"><svg data-perm-svg viewBox="0 0 870 470" role="img" aria-label="排列连线中的每个交叉对应一个逆序">${defs("perm")}<text x="28" y="34" class="story-caption">上方读排列；下方按 1、2、3、4 排好。连线相交一次，就多一个逆序。</text><g data-perm-scene></g></svg></div>`;
      const formula = `<div><span>当前排列</span><strong data-perm-word></strong></div><div><span>逆序数 τ</span><strong data-perm-tau></strong></div><div><span>符号</span><strong data-perm-sign></strong></div>`;
      root.innerHTML = `<h2>交互实验</h2>${shell("把逆序数画成真正的交叉", "排列的奇偶性不再是一个需要盲算的数字：它就是连线交叉的奇偶性。", "先看 3142 的三个交叉，再连续消掉相邻交叉，观察每次只改变一个逆序。", controls, stage, formula, `<strong>局部变化</strong><span data-perm-message></span>`)}`;
      return mountPermutationStory(root);
    },
  });

  // §3 — one legal path through a matrix.
  function mountLeibnizStory(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const stage = root.querySelector("[data-term-stage]");
    const grid = root.querySelector("[data-term-grid]");
    const overlay = root.querySelector("[data-term-overlay]");
    let matrix = [[2, 1, 3], [4, 5, 2], [1, 2, 6]];
    let selected = [];

    function valueOf(row, col) { return matrix[row][col]; }
    function signOf(permutation) { return M().signFromPerm(permutation); }

    function drawPath() {
      const stageRect = stage.getBoundingClientRect();
      const points = selected.map((col, row) => {
        const cell = grid.querySelector(`[data-cell="${row},${col}"]`);
        if (!cell) return null;
        const rect = cell.getBoundingClientRect();
        return [rect.left - stageRect.left + rect.width / 2, rect.top - stageRect.top + rect.height / 2];
      }).filter(Boolean);
      overlay.setAttribute("viewBox", `0 0 ${Math.max(1, stageRect.width)} ${Math.max(1, stageRect.height)}`);
      overlay.innerHTML = points.length > 1 ? `<polyline points="${pointsString(points)}" fill="none" stroke="#48b9c5" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${points.at(-1)[0]}" cy="${points.at(-1)[1]}" r="8" fill="#48b9c5"/>` : points.length === 1 ? `<circle cx="${points[0][0]}" cy="${points[0][1]}" r="8" fill="#48b9c5"/>` : "";
    }

    function render() {
      const used = new Set(selected);
      grid.innerHTML = matrix.flatMap((row, r) => row.map((value, c) => {
        const currentRow = r === selected.length;
        const isSelected = selected[r] === c;
        const locked = !isSelected && (!currentRow || used.has(c));
        const zeroClass = value === 0 ? " is-zero" : "";
        return `<button type="button" data-cell="${r},${c}" class="${isSelected ? "is-selected" : locked ? "is-locked" : ""}${zeroClass}" ${locked ? "disabled" : ""} aria-label="第 ${r + 1} 行第 ${c + 1} 列，数值 ${value}">${value}</button>`;
      })).join("");
      grid.querySelectorAll("button:not(:disabled)").forEach((button) => button.addEventListener("click", () => {
        const [row, col] = button.dataset.cell.split(",").map(Number);
        if (row !== selected.length) return;
        selected.push(col);
        render();
      }, { signal }));
      requestAnimationFrame(drawPath);
      const permutation = selected.map((col) => col + 1);
      root.querySelector("[data-term-perm]").textContent = permutation.length ? permutation.join("") : "—";
      root.querySelector("[data-term-sign]").textContent = permutation.length === 3 ? (signOf(permutation) > 0 ? "+" : "−") : "—";
      const factors = selected.map((col, row) => valueOf(row, col));
      root.querySelector("[data-term-product]").textContent = factors.length ? factors.join(" × ") : "—";
      const contribution = selected.length === 3 ? signOf(permutation) * factors.reduce((product, value) => product * value, 1) : null;
      root.querySelector("[data-term-value]").textContent = contribution === null ? "尚未完成" : fmt(contribution, 3);
      root.querySelector("[data-term-message]").textContent = contribution === null
        ? `下一步只能在第 ${selected.length + 1} 行选择尚未使用的列。`
        : contribution === 0
          ? "路径完全合法，只是它经过了一个零，因此这一项对行列式的贡献为 0。"
          : "三行三列各取一次，路径合法；现在符号和乘积共同决定这一项。";
    }

    root.querySelector("[data-term-reset]").addEventListener("click", () => { selected = []; render(); }, { signal });
    root.querySelector("[data-term-231]").addEventListener("click", () => { matrix = [[2,1,3],[4,5,2],[1,2,6]]; selected = [1,2,0]; render(); }, { signal });
    root.querySelector("[data-term-triangle]").addEventListener("click", () => { matrix = [[2,1,3],[0,4,5],[0,0,6]]; selected = [1,2,0]; render(); }, { signal });
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(drawPath) : null;
    observer?.observe(stage);
    render();
    return () => { controller.abort(); observer?.disconnect(); };
  }

  window.extendChapter2Renderer("n-order-determinant", {
    interactive(root) {
      if (!root) return;
      const controls = `<button type="button" data-term-reset>自己选一条路径</button><button type="button" data-term-231>展示排列 231</button><button type="button" data-term-triangle>上三角中的合法零项</button>`;
      const stage = `<div class="ch2-story-stage is-plain ch2-story-matrix-stage" data-term-stage><div class="ch2-story-matrix-grid" data-term-grid></div><svg class="ch2-story-path-overlay" data-term-overlay aria-hidden="true"></svg></div>`;
      const formula = `<div><span>列选择形成排列</span><strong data-term-perm></strong></div><div><span>排列符号</span><strong data-term-sign></strong></div><div><span>所选元素乘积</span><strong data-term-product></strong></div><div><span>这一项的贡献</span><strong data-term-value></strong></div>`;
      root.innerHTML = `<h2>交互实验</h2>${shell("行列式的一项，是穿过矩阵的一条合法路径", "每一行选一个元素，同时每一列只能使用一次。路径完成后，它才变成排列、符号和乘积。", "先自己逐行选择；再比较“选择不合法”和“路径合法但乘积为零”这两件完全不同的事。", controls, stage, formula, `<strong>当前判断</strong><span data-term-message></span>`)}`;
      return mountLeibnizStory(root);
    },
  });

  // §4 — one before/after geometry, not a dashboard of rules.
  function mountPropertyStory(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const svg = root.querySelector("[data-property-svg]");
    const base = { u: [1.35, 0.25], v: [0.35, 1.15] };
    const state = { u: base.u.slice(), v: base.v.slice(), busy: false, label: "原图形" };
    const origin = [390, 380];
    const scale = 135;

    function detOf(u, v) { return u[0] * v[1] - u[1] * v[0]; }
    function render() {
      const baseDet = detOf(base.u, base.v);
      const det = detOf(state.u, state.v);
      const O = mapPoint(origin, scale, [0,0]);
      const U = mapPoint(origin, scale, state.u);
      const V = mapPoint(origin, scale, state.v);
      svg.querySelector("[data-property-ghost]").setAttribute("points", pointsString(parallelogram(origin, scale, base.u, base.v)));
      svg.querySelector("[data-property-current]").setAttribute("points", pointsString(parallelogram(origin, scale, state.u, state.v)));
      svg.querySelector("[data-property-current]").setAttribute("class", det < 0 ? "story-fill-negative" : "story-fill-primary");
      const u = svg.querySelector("[data-property-u]"); const v = svg.querySelector("[data-property-v]");
      u.setAttribute("x2", U[0]); u.setAttribute("y2", U[1]);
      v.setAttribute("x2", V[0]); v.setAttribute("y2", V[1]);
      root.querySelector("[data-property-before]").textContent = fmt(baseDet, 3);
      root.querySelector("[data-property-after]").textContent = fmt(det, 3);
      root.querySelector("[data-property-factor]").textContent = fmt(det / baseDet, 3);
      root.querySelector("[data-property-label]").textContent = state.label;
      root.querySelector("[data-property-message]").textContent = state.label === "交换两列"
        ? "图形占据同一块区域，但绕行方向反过来，所以行列式只改变符号。"
        : state.label === "第一列乘 1.7"
          ? "一条生成边被拉长 1.7 倍，面积也恰好乘 1.7。"
          : state.label === "第二列加 0.8 倍第一列"
            ? "顶边沿第一列方向滑动，图形发生剪切；底和高不变，所以面积不变。"
            : "从原图形出发，分别观察交换、倍乘与倍加。";
      void O;
    }

    async function go(target, label, button) {
      if (state.busy) M().cancelAnim(svg);
      setActive(root, "[data-property-op]", button);
      const from = { u: state.u.slice(), v: state.v.slice() };
      state.busy = true; state.label = label;
      try {
        await animate(svg, 620, (t) => {
          state.u = [M().lerp(from.u[0], target.u[0], t), M().lerp(from.u[1], target.u[1], t)];
          state.v = [M().lerp(from.v[0], target.v[0], t), M().lerp(from.v[1], target.v[1], t)];
          render();
        });
      } finally { state.u = target.u.slice(); state.v = target.v.slice(); state.busy = false; render(); }
    }

    root.querySelectorAll("[data-property-op]").forEach((button) => button.addEventListener("click", () => {
      const key = button.dataset.propertyOp;
      if (key === "reset") void go(base, "原图形", button);
      if (key === "swap") void go({ u: base.v, v: base.u }, "交换两列", button);
      if (key === "scale") void go({ u: base.u.map((value) => 1.7 * value), v: base.v }, "第一列乘 1.7", button);
      if (key === "shear") void go({ u: base.u, v: [base.v[0] + 0.8 * base.u[0], base.v[1] + 0.8 * base.u[1]] }, "第二列加 0.8 倍第一列", button);
    }, { signal }));
    render();
    return () => { controller.abort(); M().cancelAnim(svg); };
  }

  window.extendChapter2Renderer("determinant-properties", {
    interactive(root) {
      if (!root) return;
      const controls = `<button type="button" data-property-op="reset" class="is-active" aria-pressed="true">原图形</button><button type="button" data-property-op="swap">交换两列</button><button type="button" data-property-op="scale">一列倍乘</button><button type="button" data-property-op="shear">一列倍加另一列</button>`;
      const stage = `<div class="ch2-story-stage"><svg data-property-svg viewBox="0 0 900 520" role="img" aria-label="比较列交换、倍乘和倍加前后的平行四边形">${defs("property")}<g class="story-grid">${Array.from({ length: 19 }, (_, i) => `<line x1="${i*50}" y1="0" x2="${i*50}" y2="520"/>`).join("")}${Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="${i*50}" x2="900" y2="${i*50}"/>`).join("")}</g><line class="story-axis" x1="0" y1="380" x2="900" y2="380"/><line class="story-axis" x1="390" y1="0" x2="390" y2="520"/><polygon data-property-ghost class="story-ghost"/><polygon data-property-current/><line data-property-u class="story-vector-primary" x1="390" y1="380" marker-end="url(#property-arrow-cyan)"/><line data-property-v class="story-vector-secondary" x1="390" y1="380" marker-end="url(#property-arrow-orange)"/><text x="24" y="34" class="story-caption">虚线始终保留原图形；彩色图形显示当前列操作的结果</text></svg></div>`;
      const formula = `<div><span>原 det</span><strong data-property-before></strong></div><div><span>当前 det</span><strong data-property-after></strong></div><div><span>变化倍率</span><strong data-property-factor></strong></div><div><span>当前操作</span><strong data-property-label></strong></div>`;
      root.innerHTML = `<h2>交互实验</h2>${shell("三个性质，其实是三种非常具体的几何动作", "交换改变方向，倍乘改变一条生成边，倍加只做剪切。把变化叠在同一幅图上，比背诵规则更直接。", "先交换两列，再做倍乘，最后观察剪切时彩色图形和虚线图形为何面积相同。", controls, stage, formula, `<strong>几何原因</strong><span data-property-message></span>`)}`;
      return mountPropertyStory(root);
    },
  });
})();
