(() => {
  const M = () => window.Ch2Math;
  const tex = (s) => (window.texInline ? window.texInline(s) : s);

  // ---------- §5 strategy console ----------
  function mountStrategy(host) {
    let matrix = [
      [2, 1, 0],
      [1, 3, 1],
      [0, 2, 1],
    ];
    let factor = 1;
    const ledger = host.querySelector("[data-ledger]");

    function detOf(m) {
      return M().det3(m);
    }

    function renderMatrix() {
      const table = host.querySelector("[data-mat-table]");
      table.innerHTML = matrix
        .map((row, i) => `<tr>${row.map((v, j) => `<td data-r="${i}" data-c="${j}">${M().formatNum(v, 2)}</td>`).join("")}</tr>`)
        .join("");
      host.querySelector("[data-cur]").textContent = M().formatNum(detOf(matrix), 3);
      host.querySelector("[data-factor]").textContent = M().formatNum(factor, 3);
      host.querySelector("[data-orig]").textContent = M().formatNum(detOf(matrix) / factor, 3);
    }

    function push(line) {
      const li = document.createElement("li");
      li.textContent = line;
      ledger.appendChild(li);
    }

    host.querySelector("[data-op-swap]").addEventListener("click", () => {
      const t = matrix[0];
      matrix[0] = matrix[1];
      matrix[1] = t;
      factor *= -1;
      push("R1 ↔ R2    factor × (−1)");
      renderMatrix();
    });

    host.querySelector("[data-op-scale]").addEventListener("click", () => {
      matrix[1] = matrix[1].map((v) => v * 2);
      factor *= 2;
      push("R2 ← 2 R2    factor × 2");
      renderMatrix();
    });

    host.querySelector("[data-op-add]").addEventListener("click", () => {
      // R2 = R2 - (1/2)*? better: eliminate using first pivot if possible
      // simple demo: R2 <- R2 - (1/2) wait use integer: R1 has 2, R2 has 1
      // R2 <- 2*R2 - R1 would change scale - do R2 <- R2 - 0.5 R1
      const k = matrix[0][0] === 0 ? 0 : matrix[1][0] / matrix[0][0];
      matrix[1] = matrix[1].map((v, j) => v - k * matrix[0][j]);
      push(`R2 ← R2 − (${M().formatNum(k, 2)}) R1    factor × 1`);
      renderMatrix();
    });

    host.querySelector("[data-op-add2]").addEventListener("click", () => {
      const k = matrix[1][1] === 0 ? 0 : matrix[2][1] / matrix[1][1];
      matrix[2] = matrix[2].map((v, j) => v - k * matrix[1][j]);
      push(`R3 ← R3 − (${M().formatNum(k, 2)}) R2    factor × 1`);
      renderMatrix();
    });

    host.querySelector("[data-op-reset]").addEventListener("click", () => {
      matrix = [
        [2, 1, 0],
        [1, 3, 1],
        [0, 2, 1],
      ];
      factor = 1;
      ledger.innerHTML = "";
      push("start");
      renderMatrix();
    });

    host.querySelector("[data-op-triangle-hint]").addEventListener("click", () => {
      // run a short path to upper triangular-ish
      host.querySelector("[data-op-reset]").click();
      host.querySelector("[data-op-add]").click();
      host.querySelector("[data-op-add2]").click();
    });

    push("start");
    renderMatrix();
  }

  // ---------- §6 cofactor board ----------
  function mountCofactor(host) {
    const matrix = [
      [1, 2, 0],
      [0, 3, 0],
      [4, 5, 6],
    ];
    let active = { r: 1, c: 1 };

    function render() {
      const table = host.querySelector("[data-cof-table]");
      table.innerHTML = matrix
        .map(
          (row, i) =>
            `<tr>${row
              .map((v, j) => {
                const deleted = i === active.r || j === active.c;
                const selected = i === active.r && j === active.c;
                return `<td class="${selected ? "is-selected" : ""} ${deleted ? "is-deleted" : ""}" data-r="${i}" data-c="${j}">${v}</td>`;
              })
              .join("")}</tr>`,
        )
        .join("");

      table.querySelectorAll("td").forEach((td) => {
        td.addEventListener("click", () => {
          active = { r: Number(td.dataset.r), c: Number(td.dataset.c) };
          render();
        });
      });

      const minor = M().minorMatrix(matrix, active.r, active.c);
      const Mij = M().det2(minor[0][0], minor[0][1], minor[1][0], minor[1][1]);
      const sign = (active.r + active.c) % 2 === 0 ? 1 : -1;
      const Cij = sign * Mij;
      host.querySelector("[data-pos]").textContent = `a${active.r + 1}${active.c + 1}`;
      host.querySelector("[data-mij]").textContent = M().formatNum(Mij, 2);
      host.querySelector("[data-sign]").textContent = sign > 0 ? "+1" : "−1";
      host.querySelector("[data-cij]").textContent = M().formatNum(Cij, 2);

      // expand along row 2 (index 1) as demo
      let expand = 0;
      let terms = [];
      for (let j = 0; j < 3; j += 1) {
        const a = matrix[1][j];
        if (Math.abs(a) < 1e-12) continue;
        const m = M().minorMatrix(matrix, 1, j);
        const mij = M().det2(m[0][0], m[0][1], m[1][0], m[1][1]);
        const s = (1 + j) % 2 === 0 ? 1 : -1;
        expand += a * s * mij;
        terms.push(`${a}·(${s > 0 ? "+" : "−"}${M().formatNum(mij, 2)})`);
      }
      host.querySelector("[data-expand]").textContent = `${terms.join(" + ")} = ${M().formatNum(expand, 2)}`;
      host.querySelector("[data-true]").textContent = M().formatNum(M().det3(matrix), 2);
    }

    // checkerboard
    const board = host.querySelector("[data-board]");
    board.innerHTML = Array.from({ length: 9 }, (_, k) => {
      const i = Math.floor(k / 3);
      const j = k % 3;
      const plus = (i + j) % 2 === 0;
      return `<span class="${plus ? "plus" : "minus"}">${plus ? "+" : "−"}</span>`;
    }).join("");

    render();
  }

  // ---------- §7 Cramer ----------
  function mountCramer(host) {
    const state = { a11: 2, a12: 1, a21: 1, a22: 3, b1: 5, b2: 5 };
    const canvas = host.querySelector("[data-cramer-canvas]");
    const ctx = canvas.getContext("2d");

    function D() {
      return M().det2(state.a11, state.a12, state.a21, state.a22);
    }
    function D1() {
      return M().det2(state.b1, state.a12, state.b2, state.a22);
    }
    function D2() {
      return M().det2(state.a11, state.b1, state.a21, state.b2);
    }

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth || 520;
      const height = 280;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const origin = { x: width * 0.32, y: height * 0.68 };
      const scale = 36;
      M().drawAxes(ctx, width, height, origin, scale);
      const c1 = [state.a11, state.a21];
      const c2 = [state.a12, state.a22];
      const b = [state.b1, state.b2];
      M().drawParallelogram(ctx, origin, scale, c1, c2, "rgba(107,141,242,0.16)", "#6b8df2");
      const p1 = M().toCanvas(origin, scale, c1[0], c1[1]);
      const p2 = M().toCanvas(origin, scale, c2[0], c2[1]);
      const pb = M().toCanvas(origin, scale, b[0], b[1]);
      M().drawArrow(ctx, origin, p1, "#6b8df2");
      M().drawArrow(ctx, origin, p2, "#d46b4f");
      M().drawArrow(ctx, origin, pb, "#1f8a5b", 3);
      ctx.fillStyle = "rgba(30,40,55,0.8)";
      ctx.font = "12px system-ui";
      ctx.fillText("a1", p1.x + 4, p1.y);
      ctx.fillText("a2", p2.x + 4, p2.y);
      ctx.fillText("b", pb.x + 4, pb.y);
    }

    function sync() {
      const d = D();
      const d1 = D1();
      const d2 = D2();
      host.querySelector("[data-d]").textContent = M().formatNum(d, 3);
      host.querySelector("[data-d1]").textContent = M().formatNum(d1, 3);
      host.querySelector("[data-d2]").textContent = M().formatNum(d2, 3);
      const box = host.querySelector("[data-sol]");
      if (Math.abs(d) < 1e-8) {
        box.textContent = "D=0：不能使用克拉默公式。请判断 b 是否落在列空间（无解/无穷多解）。";
        box.className = "ch2-note ch2-status-zero";
      } else {
        box.textContent = `x1 = D1/D = ${M().formatNum(d1 / d, 3)},  x2 = D2/D = ${M().formatNum(d2 / d, 3)}`;
        box.className = "ch2-note ch2-status-pos";
      }
      ["a11", "a12", "a21", "a22", "b1", "b2"].forEach((key) => {
        const input = host.querySelector(`[data-k="${key}"]`);
        const lab = host.querySelector(`[data-v="${key}"]`);
        if (input) input.value = String(state[key]);
        if (lab) lab.textContent = M().formatNum(state[key], 2);
      });
      draw();
    }

    host.querySelectorAll("[data-k]").forEach((input) => {
      input.addEventListener("input", () => {
        state[input.dataset.k] = Number(input.value);
        sync();
      });
    });

    host.querySelector("[data-cramer-ex]").addEventListener("click", () => {
      Object.assign(state, { a11: 2, a12: 1, a21: 1, a22: 3, b1: 5, b2: 5 });
      sync();
    });
    host.querySelector("[data-cramer-sing]").addEventListener("click", () => {
      Object.assign(state, { a11: 1, a12: 2, a21: 2, a22: 4, b1: 3, b2: 6 });
      sync();
    });
    host.querySelector("[data-cramer-none]").addEventListener("click", () => {
      Object.assign(state, { a11: 1, a12: 2, a21: 2, a22: 4, b1: 1, b2: 0 });
      sync();
    });

    sync();
  }

  // ---------- §8 product lab ----------
  function mountProduct(host) {
    const presets = {
      scale: {
        A: [2, 0, 0, 1],
        B: [1.5, 0, 0, 1],
      },
      shearScale: {
        A: [1.2, 0, 0, 1],
        B: [1, 1, 0, 1],
      },
      mirrorRot: {
        A: [0, -1, 1, 0],
        B: [-1, 0, 0, 1],
      },
      doubleMirror: {
        A: [-1, 0, 0, 1],
        B: [1, 0, 0, -1],
      },
      project: {
        A: [1, 0, 0, 1],
        B: [1, 0, 0, 0],
      },
    };
    let current = presets.scale;
    const canvas = host.querySelector("[data-prod-canvas]");
    const ctx = canvas.getContext("2d");

    function mul(A, B) {
      // AB with column-major? store [a,b,c,d] as [[a,b],[c,d]]
      const a = A[0] * B[0] + A[1] * B[2];
      const b = A[0] * B[1] + A[1] * B[3];
      const c = A[2] * B[0] + A[3] * B[2];
      const d = A[2] * B[1] + A[3] * B[3];
      return [a, b, c, d];
    }

    function drawMat(label, mat, origin, scale) {
      const c1 = [mat[0], mat[2]];
      const c2 = [mat[1], mat[3]];
      const value = M().det2(mat[0], mat[1], mat[2], mat[3]);
      const fill = Math.abs(value) < 1e-8 ? "rgba(176,122,18,0.16)" : value > 0 ? "rgba(67,198,186,0.16)" : "rgba(212,107,79,0.16)";
      M().drawParallelogram(ctx, origin, scale, c1, c2, fill, "#6b8df2");
      ctx.fillStyle = "rgba(30,40,55,0.8)";
      ctx.font = "12px system-ui";
      ctx.fillText(label, origin.x - 20, origin.y + 48);
    }

    function sync() {
      const A = current.A;
      const B = current.B;
      const AB = mul(A, B);
      const dA = M().det2(A[0], A[1], A[2], A[3]);
      const dB = M().det2(B[0], B[1], B[2], B[3]);
      const dAB = M().det2(AB[0], AB[1], AB[2], AB[3]);
      host.querySelector("[data-da]").textContent = M().formatNum(dA, 3);
      host.querySelector("[data-db]").textContent = M().formatNum(dB, 3);
      host.querySelector("[data-dab]").textContent = M().formatNum(dAB, 3);
      host.querySelector("[data-prod]").textContent = M().formatNum(dA * dB, 3);

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth || 640;
      const height = 260;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const scale = 40;
      const o1 = { x: width * 0.18, y: height * 0.65 };
      const o2 = { x: width * 0.5, y: height * 0.65 };
      const o3 = { x: width * 0.82, y: height * 0.65 };
      M().drawAxes(ctx, width * 0.3, height, o1, scale);
      // rough local axes only as markers
      drawMat("I→B", B, o2, scale);
      drawMat("I→AB", AB, o3, scale);
      // unit at left
      drawMat("I", [1, 0, 0, 1], o1, scale);
    }

    host.querySelectorAll("[data-prod-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        current = presets[btn.dataset.prodPreset];
        host.querySelectorAll("[data-prod-preset]").forEach((b) => b.classList.toggle("is-active", b === btn));
        sync();
      });
    });

    // minor pairing info
    host.querySelector("[data-laplace-info]").textContent =
      "对 4×4 固定 2 行时，列组合数为 C(4,2)=6；k=1 时退化为按一行展开的 4 项。";

    sync();
  }

  defineChapter2Renderer("determinant-computation", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = `
        <h2>计算是有账本的结构操作</h2>
        <div class="ch2-formal-layout">
          <div class="definition-stack">
            <article class="definition-row"><strong>目标</strong><p>制造零 → 化三角或便于展开 → 用对角线或展开求值。</p></article>
            <article class="definition-row"><strong>账本</strong><p>交换 ×(−1)，倍乘 ×λ，行倍加 ×1。最终 det(原)=det(当前)/累计因子（按你的记账约定保持一致）。</p></article>
            <article class="definition-row"><strong>策略</strong><p>直接定义有 n! 项；结构化操作把计算量压到可手算的范围。</p></article>
          </div>
        </div>`;
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head">
            <h3>行列式策略台 · 操作账本</h3>
            <p>对 3×3 示例执行行变换。当前行列式、累计因子与还原得到的原行列式同步显示。</p>
          </div>
          <div class="ch2-lab-grid">
            <div class="ch2-matrix-box">
              <table class="ch2-matrix-table" data-mat-table></table>
              <div class="ch2-toolbar" style="margin-top:0.7rem">
                <button type="button" data-op-swap>交换 R1R2</button>
                <button type="button" data-op-scale>R2×2</button>
                <button type="button" data-op-add>消 R2 首元</button>
                <button type="button" data-op-add2>消 R3 次元</button>
                <button type="button" data-op-triangle-hint>演示路径</button>
                <button type="button" data-op-reset>重置</button>
              </div>
            </div>
            <div class="ch2-side">
              <div class="ch2-meter">
                <div class="ch2-meter-card"><strong>当前 det</strong><span data-cur></span></div>
                <div class="ch2-meter-card"><strong>累计因子</strong><span data-factor></span></div>
                <div class="ch2-meter-card"><strong>原 det</strong><span data-orig></span></div>
              </div>
              <div class="ch2-ledger"><strong>账本</strong><ol data-ledger></ol></div>
              <div class="ch2-note">直接展开 3 阶有 6 项；三角化通常更短。允许多条正确路线。</div>
            </div>
          </div>
        </div>`;
      mountStrategy(root);
    },
  });

  defineChapter2Renderer("cofactor-expansion", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = `
        <h2>余子式、代数余子式与一行展开</h2>
        <div class="ch2-formal-layout">
          <div class="definition-stack">
            <article class="definition-row"><strong>余子矩阵</strong><p>删第 i 行第 j 列后的 (n−1) 阶矩阵。</p></article>
            <article class="definition-row"><strong>代数余子式</strong><p>${tex("C_{ij}=(-1)^{i+j}M_{ij}")}</p></article>
            <article class="definition-row"><strong>展开</strong><p>${tex("\\det(A)=\\sum_j a_{ij}C_{ij}")}（按第 i 行）。</p></article>
          </div>
        </div>`;
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head">
            <h3>余子式展开板</h3>
            <p>点击元素查看删行删列、余子式与代数余子式；下方给出沿第二行展开的核对。</p>
          </div>
          <div class="ch2-lab-grid">
            <div class="ch2-matrix-box">
              <table class="ch2-matrix-table" data-cof-table></table>
              <div style="margin-top:0.7rem"><strong>符号棋盘</strong><div class="ch2-checkerboard" data-board></div></div>
            </div>
            <div class="ch2-side">
              <div class="ch2-stat"><strong>选中</strong><span data-pos></span></div>
              <div class="ch2-stat"><strong>M_ij</strong><span data-mij></span></div>
              <div class="ch2-stat"><strong>(−1)^{i+j}</strong><span data-sign></span></div>
              <div class="ch2-stat"><strong>C_ij</strong><span data-cij></span></div>
              <div class="ch2-note">沿第 2 行展开：<span data-expand></span></div>
              <div class="ch2-note">真实 det：<span data-true></span></div>
            </div>
          </div>
        </div>`;
      mountCofactor(root);
    },
  });

  defineChapter2Renderer("cramer-rule", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = `
        <h2>克拉默法则：解是行列式之比</h2>
        <div class="ch2-formal-layout">
          <div class="definition-stack">
            <article class="definition-row"><strong>前提</strong><p>${tex("\\det(A)\\ne 0")}，方程组有唯一解。</p></article>
            <article class="definition-row"><strong>公式</strong><p>${tex("x_i=\\det(A_i)/\\det(A)")}，其中 ${tex("A_i")} 由把第 i 列换成 ${tex("b")} 得到。</p></article>
            <article class="definition-row"><strong>边界</strong><p>${tex("\\det(A)=0")} 时公式失效；无解与无穷多解要分开判断。</p></article>
          </div>
        </div>`;
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head">
            <h3>替换列实验室 · 克拉默步进</h3>
            <p>调节系数与常数项，观察 D、D1、D2 与解；几何上显示 a1、a2 与 b。</p>
          </div>
          <div class="ch2-lab-grid">
            <div class="ch2-canvas-wrap"><canvas data-cramer-canvas width="560" height="280" aria-label="克拉默几何"></canvas></div>
            <div class="ch2-side">
              <div class="ch2-meter">
                <div class="ch2-meter-card"><strong>D</strong><span data-d></span></div>
                <div class="ch2-meter-card"><strong>D1</strong><span data-d1></span></div>
                <div class="ch2-meter-card"><strong>D2</strong><span data-d2></span></div>
              </div>
              <div data-sol class="ch2-note"></div>
              <div class="ch2-sliders">
                ${["a11", "a12", "a21", "a22", "b1", "b2"]
                  .map(
                    (key) =>
                      `<label><span>${key}</span><input data-k="${key}" type="range" min="-4" max="4" step="0.1" /><span data-v="${key}"></span></label>`,
                  )
                  .join("")}
              </div>
              <div class="ch2-presets">
                <button type="button" data-cramer-ex>例题 2x+y=5</button>
                <button type="button" data-cramer-sing>D=0 多解</button>
                <button type="button" data-cramer-none>D=0 无解</button>
              </div>
            </div>
          </div>
        </div>`;
      mountCramer(root);
    },
  });

  defineChapter2Renderer("laplace-and-product", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = `
        <h2>Laplace 推广与乘法规则</h2>
        <div class="ch2-formal-layout">
          <div class="definition-stack">
            <article class="definition-row"><strong>Laplace</strong><p>固定 k 行，遍历 k 列组合，子式与互补代数余子式配对求和；k=1 即 §6。</p></article>
            <article class="definition-row"><strong>乘法规则</strong><p>${tex("\\det(AB)=\\det(A)\\det(B)")}。复合变换的有向体积倍率相乘；右边矩阵先作用。</p></article>
            <article class="definition-row"><strong>推论</strong><p>可逆时 ${tex("\\det(A^{-1})=1/\\det(A)")}；${tex("\\det(A^m)=\\det(A)^m")}；相似不改变行列式。</p></article>
          </div>
        </div>`;
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head">
            <h3>两阶段体积实验 · 子式提示</h3>
            <p>比较 det(A)、det(B) 与 det(AB)。画面从单位形到 B，再到 AB（先 B 后 A）。</p>
          </div>
          <div class="ch2-lab-grid stack">
            <div class="ch2-canvas-wrap"><canvas data-prod-canvas width="720" height="260" aria-label="两阶段复合"></canvas></div>
            <div class="ch2-side">
              <div class="ch2-meter">
                <div class="ch2-meter-card"><strong>det(A)</strong><span data-da></span></div>
                <div class="ch2-meter-card"><strong>det(B)</strong><span data-db></span></div>
                <div class="ch2-meter-card"><strong>det(A)det(B)</strong><span data-prod></span></div>
                <div class="ch2-meter-card"><strong>det(AB)</strong><span data-dab></span></div>
              </div>
              <div class="ch2-presets">
                <button type="button" class="is-active" data-prod-preset="scale">两次缩放</button>
                <button type="button" data-prod-preset="shearScale">剪切后缩放</button>
                <button type="button" data-prod-preset="mirrorRot">镜像后旋转</button>
                <button type="button" data-prod-preset="doubleMirror">两次镜像</button>
                <button type="button" data-prod-preset="project">含投影</button>
              </div>
              <div class="ch2-note" data-laplace-info></div>
            </div>
          </div>
        </div>`;
      mountProduct(root);
    },
  });
})();
