(() => {
  const M = () => window.Ch2Math;
  const tex = (s) => (window.texInline ? window.texInline(s) : s);
  const display = (s) => (window.texDisplay ? window.texDisplay(s) : s);
  const aEntry = (row, col) => tex(`a_{${row}${col}}`);

  function formalShell(title, lead, body) {
    return `<h2>${title}</h2><div class="ch2-formal"><p class="ch2-formal-lead">${lead}</p>${body}</div>`;
  }

  // ========== §5 ==========
  function mountStrategy(root) {
    let matrix = [
      [2, 1, 0],
      [1, 3, 1],
      [0, 2, 1],
    ];
    let factor = 1;
    const ledgerEl = root.querySelector("[data-ledger]");

    function detOf(m) {
      return M().det3(m);
    }

    function renderMatrix({ animateCells = false } = {}) {
      const table = root.querySelector("[data-mat-table]");
      table.innerHTML = matrix
        .map(
          (row, i) =>
            `<tr>${row
              .map((v, j) => `<td data-r="${i}" data-c="${j}" class="${animateCells ? "is-selected" : ""}">${M().formatNum(v, 2)}</td>`)
              .join("")}</tr>`,
        )
        .join("");
      if (animateCells) {
        setTimeout(() => {
          table.querySelectorAll("td").forEach((td) => td.classList.remove("is-selected"));
        }, 420);
      }
      const cur = detOf(matrix);
      root.querySelector("[data-cur]").textContent = M().formatNum(cur, 3);
      root.querySelector("[data-factor]").textContent = M().formatNum(factor, 3);
      root.querySelector("[data-orig]").textContent = M().formatNum(cur / factor, 3);
      M().pulseClass(root.querySelector("[data-cur-card]"));
    }

    function push(line) {
      const li = document.createElement("li");
      li.textContent = line;
      ledgerEl.appendChild(li);
    }

    function apply(next, factorMul, line) {
      matrix = next;
      factor *= factorMul;
      push(line);
      renderMatrix({ animateCells: true });
    }

    root.querySelector("[data-op-swap]").addEventListener("click", () => {
      const next = [matrix[1].slice(), matrix[0].slice(), matrix[2].slice()];
      apply(next, -1, "R1 ↔ R2    factor × (−1)");
    });
    root.querySelector("[data-op-scale]").addEventListener("click", () => {
      const next = M().cloneMat(matrix);
      next[1] = next[1].map((v) => v * 2);
      apply(next, 2, "R2 ← 2·R2    factor × 2");
    });
    root.querySelector("[data-op-add]").addEventListener("click", () => {
      const next = M().cloneMat(matrix);
      const k = next[0][0] === 0 ? 0 : next[1][0] / next[0][0];
      next[1] = next[1].map((v, j) => v - k * next[0][j]);
      apply(next, 1, `R2 ← R2 − (${M().formatNum(k, 2)})R1    × 1`);
    });
    root.querySelector("[data-op-add2]").addEventListener("click", () => {
      const next = M().cloneMat(matrix);
      const k = next[1][1] === 0 ? 0 : next[2][1] / next[1][1];
      next[2] = next[2].map((v, j) => v - k * next[1][j]);
      apply(next, 1, `R3 ← R3 − (${M().formatNum(k, 2)})R2    × 1`);
    });
    root.querySelector("[data-op-reset]").addEventListener("click", () => {
      matrix = [
        [2, 1, 0],
        [1, 3, 1],
        [0, 2, 1],
      ];
      factor = 1;
      ledgerEl.innerHTML = "";
      push("start");
      renderMatrix({ animateCells: true });
    });
    root.querySelector("[data-op-triangle-hint]").addEventListener("click", async () => {
      root.querySelector("[data-op-reset]").click();
      await new Promise((r) => setTimeout(r, 280));
      root.querySelector("[data-op-add]").click();
      await new Promise((r) => setTimeout(r, 420));
      root.querySelector("[data-op-add2]").click();
    });

    push("start");
    renderMatrix();
  }

  // ========== §6 ==========
  function mountCofactor(root) {
    const matrix = [
      [1, 2, 0],
      [0, 3, 0],
      [4, 5, 6],
    ];
    let active = { r: 1, c: 1 };

    function render() {
      const table = root.querySelector("[data-cof-table]");
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
      const Mij = M().det2(minor);
      const sign = (active.r + active.c) % 2 === 0 ? 1 : -1;
      const Cij = sign * Mij;
      root.querySelector("[data-pos]").innerHTML = aEntry(active.r + 1, active.c + 1);
      root.querySelector("[data-mij]").textContent = M().formatNum(Mij, 2);
      root.querySelector("[data-sign]").innerHTML = sign > 0 ? tex("+1") : tex("-1");
      root.querySelector("[data-cij]").textContent = M().formatNum(Cij, 2);
      M().pulseClass(root.querySelector("[data-cij-card]"));

      // checkerboard highlight
      root.querySelectorAll("[data-board] span").forEach((span, k) => {
        const i = Math.floor(k / 3);
        const j = k % 3;
        span.classList.toggle("is-active", i === active.r && j === active.c);
      });

      let expand = 0;
      const terms = [];
      for (let j = 0; j < 3; j += 1) {
        const a = matrix[1][j];
        if (Math.abs(a) < 1e-12) continue;
        const m = M().minorMatrix(matrix, 1, j);
        const mij = M().det2(m);
        const s = (1 + j) % 2 === 0 ? 1 : -1;
        expand += a * s * mij;
        terms.push(
          `${tex(String(a))}\,${tex(s > 0 ? "+" : "-")}\,${tex(`M_{2${j + 1}}`)}=${tex(M().formatNum(a * s * mij, 2))}`,
        );
      }
      // simpler readable expansion with KaTeX pieces
      const pieces = [];
      for (let j = 0; j < 3; j += 1) {
        const a = matrix[1][j];
        if (Math.abs(a) < 1e-12) continue;
        const m = M().minorMatrix(matrix, 1, j);
        const mij = M().det2(m);
        const s = (1 + j) % 2 === 0 ? 1 : -1;
        pieces.push(`${aEntry(2, j + 1)}${tex(`\,C_{2${j + 1}}`)}=${tex(M().formatNum(a * s * mij, 2))}`);
      }
      root.querySelector("[data-expand]").innerHTML = `${pieces.join(" + ")} = ${tex(M().formatNum(expand, 2))}`;
      root.querySelector("[data-true]").innerHTML = tex(M().formatNum(M().det3(matrix), 2));
    }

    const board = root.querySelector("[data-board]");
    board.innerHTML = Array.from({ length: 9 }, (_, k) => {
      const i = Math.floor(k / 3);
      const j = k % 3;
      const plus = (i + j) % 2 === 0;
      return `<span class="${plus ? "plus" : "minus"}">${plus ? "+" : "−"}</span>`;
    }).join("");

    const mijLabel = root.querySelector("[data-label-mij]");
    const signLabel = root.querySelector("[data-label-sign]");
    const cijLabel = root.querySelector("[data-label-cij]");
    if (mijLabel) mijLabel.innerHTML = tex("M_{ij}");
    if (signLabel) signLabel.innerHTML = tex("(-1)^{i+j}");
    if (cijLabel) cijLabel.innerHTML = tex("C_{ij}");

    render();
  }

  // ========== §7 ==========
  function mountCramer(root) {
    const state = { a11: 2, a12: 1, a21: 1, a22: 3, b1: 5, b2: 5 };
    const canvas = root.querySelector("[data-cramer-canvas]");
    let display = { ...state };
    let animating = false;

    function D(s) {
      return M().det2([
        [s.a11, s.a12],
        [s.a21, s.a22],
      ]);
    }
    function D1(s) {
      return M().det2([
        [s.b1, s.a12],
        [s.b2, s.a22],
      ]);
    }
    function D2(s) {
      return M().det2([
        [s.a11, s.b1],
        [s.a21, s.b2],
      ]);
    }

    function drawScene(s) {
      const matrix = [
        [s.a11, s.a12],
        [s.a21, s.a22],
      ];
      M().drawTransformScene(canvas, matrix, {
        firstLabel: "a₁",
        secondLabel: "a₂",
        showUnit: true,
        caption: "a₁, a₂ 张成平行四边形；绿箭为 b",
      });
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, rect.width || canvas.clientWidth || 520);
      const height = Math.max(1, rect.height || canvas.clientHeight || 300);
      const dpr = window.devicePixelRatio || 1;
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const origin = { x: width * 0.42, y: height * 0.62 };
      const scale = Math.min(width, height) * 0.22;
      const palette = M().getPalette();
      const pb = { x: origin.x + s.b1 * scale, y: origin.y - s.b2 * scale };
      M().drawArrow(ctx, origin, pb, palette.accent, 3.2);
      ctx.fillStyle = palette.text;
      ctx.font = "600 12px system-ui, sans-serif";
      ctx.fillText("b", pb.x + 8, pb.y - 6);
    }

    function sync(s) {
      const d = D(s);
      const d1 = D1(s);
      const d2 = D2(s);
      root.querySelector("[data-d]").textContent = M().formatNum(d, 3);
      root.querySelector("[data-d1]").textContent = M().formatNum(d1, 3);
      root.querySelector("[data-d2]").textContent = M().formatNum(d2, 3);
      const box = root.querySelector("[data-sol]");
      if (Math.abs(d) < 1e-8) {
        box.innerHTML = "<strong>D = 0</strong>：不能使用克拉默公式。请判断 b 是否落在列空间（无解 / 无穷多解）。";
        box.className = "ch2-note is-zero";
      } else {
        box.innerHTML = `<strong>解</strong>　x₁ = D₁/D = ${M().formatNum(d1 / d, 3)}，x₂ = D₂/D = ${M().formatNum(d2 / d, 3)}`;
        box.className = "ch2-note is-positive";
      }
      ["a11", "a12", "a21", "a22", "b1", "b2"].forEach((key) => {
        const input = root.querySelector(`[data-k="${key}"]`);
        const lab = root.querySelector(`[data-v="${key}"]`);
        if (input) input.value = String(s[key]);
        if (lab) lab.textContent = M().formatNum(s[key], 2);
      });
      drawScene(s);
      M().pulseClass(root.querySelector("[data-d-card]"));
    }

    async function goTo(target) {
      if (animating) return;
      animating = true;
      const from = { ...display };
      const keys = Object.keys(from);
      try {
        if (M().reducedMotion()) {
          display = { ...target };
          Object.assign(state, target);
          sync(display);
          return;
        }
        await M().animateTo(
          canvas,
          0,
          1,
          620,
          (t) => {
            const cur = {};
            keys.forEach((k) => {
              cur[k] = M().lerp(from[k], target[k], M().easeInOutCubic(t));
            });
            display = cur;
            sync(display);
          },
        );
        display = { ...target };
        Object.assign(state, target);
        sync(display);
      } finally {
        animating = false;
      }
    }

    root.querySelectorAll("[data-k]").forEach((input) => {
      input.addEventListener("input", () => {
        if (animating) return;
        state[input.dataset.k] = Number(input.value);
        display = { ...state };
        sync(display);
      });
    });

    root.querySelector("[data-cramer-ex]").addEventListener("click", () => {
      goTo({ a11: 2, a12: 1, a21: 1, a22: 3, b1: 5, b2: 5 });
    });
    root.querySelector("[data-cramer-sing]").addEventListener("click", () => {
      goTo({ a11: 1, a12: 2, a21: 2, a22: 4, b1: 3, b2: 6 });
    });
    root.querySelector("[data-cramer-none]").addEventListener("click", () => {
      goTo({ a11: 1, a12: 2, a21: 2, a22: 4, b1: 1, b2: 0 });
    });

    sync(display);
  }

  // ========== §8 — polished two-stage volume lab ==========
  function mountProduct(root) {
    const presets = {
      scale: {
        A: [[2, 0], [0, 1]],
        B: [[1.5, 0], [0, 1]],
      },
      shearScale: {
        A: [[1.2, 0], [0, 1]],
        B: [[1, 1], [0, 1]],
      },
      mirrorRot: {
        A: [[0, -1], [1, 0]],
        B: [[-1, 0], [0, 1]],
      },
      doubleMirror: {
        A: [[-1, 0], [0, 1]],
        B: [[1, 0], [0, -1]],
      },
      project: {
        A: [[1, 0], [0, 1]],
        B: [[1, 0], [0, 0]],
      },
    };

    const cI = root.querySelector("[data-c-i]");
    const cB = root.querySelector("[data-c-b]");
    const cAB = root.querySelector("[data-c-ab]");
    let current = presets.scale;
    let busy = false;

    function setMeters(A, B, AB) {
      const dA = M().det2(A);
      const dB = M().det2(B);
      const dAB = M().det2(AB);
      root.querySelector("[data-da]").textContent = M().formatNum(dA, 3);
      root.querySelector("[data-db]").textContent = M().formatNum(dB, 3);
      root.querySelector("[data-prod]").textContent = M().formatNum(dA * dB, 3);
      root.querySelector("[data-dab]").textContent = M().formatNum(dAB, 3);
      const stA = M().detStatus(dA);
      const stB = M().detStatus(dB);
      const stAB = M().detStatus(dAB);
      root.querySelector("[data-da]").className = stA.cls;
      root.querySelector("[data-db]").className = stB.cls;
      root.querySelector("[data-dab]").className = stAB.cls;
      root.querySelector("[data-prod]").className = stAB.cls;
      M().pulseClass(root.querySelector("[data-dab-card]"));
    }

    function paintStatic(A, B) {
      const AB = M().mul2(A, B);
      const I = [[1, 0], [0, 1]];
      M().drawTransformScene(cI, I, { firstLabel: "e₁", secondLabel: "e₂", caption: "单位形" });
      M().drawTransformScene(cB, B, { firstLabel: "Be₁", secondLabel: "Be₂", caption: "先 B" });
      M().drawTransformScene(cAB, AB, { firstLabel: "ABe₁", secondLabel: "ABe₂", caption: "再 A → AB" });
      setMeters(A, B, AB);
    }

    async function play(A, B) {
      if (busy) return;
      busy = true;
      current = { A, B };
      const I = [[1, 0], [0, 1]];
      const AB = M().mul2(A, B);
      try {
        // reset stages
        M().drawTransformScene(cI, I, { firstLabel: "e₁", secondLabel: "e₂", caption: "单位形" });
        M().drawTransformScene(cB, I, { firstLabel: "…", secondLabel: "…", caption: "准备 B" });
        M().drawTransformScene(cAB, I, { firstLabel: "…", secondLabel: "…", caption: "准备 AB" });
        setMeters(I, I, I);

        // Stage 1: I → B on middle canvas (and keep left as I)
        await M().animateMatrix(cB, B, {
          duration: 700,
          drawOptions: { firstLabel: "Be₁", secondLabel: "Be₂", caption: "第一步：× B" },
          onUpdate: (mat) => {
            const dB = M().det2(mat);
            root.querySelector("[data-db]").textContent = M().formatNum(dB, 3);
            root.querySelector("[data-prod]").textContent = M().formatNum(1 * dB, 3);
          },
        });

        // Stage 2: middle stays B; right animates I → AB while showing composition
        // Also animate a ghost path: start from B shape toward AB
        await M().animateMatrix(cAB, AB, {
          duration: 780,
          drawOptions: { firstLabel: "ABe₁", secondLabel: "ABe₂", caption: "第二步：× A（先 B 后 A）" },
          onUpdate: (mat) => {
            const dAB = M().det2(mat);
            const dA = M().det2(A);
            const dB = M().det2(B);
            root.querySelector("[data-da]").textContent = M().formatNum(dA, 3);
            root.querySelector("[data-db]").textContent = M().formatNum(dB, 3);
            root.querySelector("[data-prod]").textContent = M().formatNum(dA * dB, 3);
            root.querySelector("[data-dab]").textContent = M().formatNum(dAB, 3);
          },
        });

        paintStatic(A, B);
      } finally {
        busy = false;
      }
    }

    root.querySelectorAll("[data-prod-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        root.querySelectorAll("[data-prod-preset]").forEach((b) => b.classList.toggle("is-active", b === btn));
        const p = presets[btn.dataset.prodPreset];
        play(p.A, p.B);
      });
    });

    root.querySelector("[data-prod-replay]")?.addEventListener("click", () => {
      play(current.A, current.B);
    });

    // initial play
    play(current.A, current.B);

    window.addEventListener(
      "resize",
      () => {
        if (document.body.contains(cI)) paintStatic(current.A, current.B);
      },
      { passive: true },
    );
  }

  // ---- Register ----
  defineChapter2Renderer("determinant-computation", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "计算是带账本的结构操作",
        "直接定义有 n! 项。手算路径是：造零 → 三角化或展开 → 用账本还原原行列式。",
        `<div class="ch2-def-stack">
          <article class="ch2-def"><span class="kicker">账本</span><strong>交换 ×(−1)，倍乘 ×λ，倍加 ×1</strong><p>当前 det 与累计因子始终可见；原 det = 当前 / 因子（与记账约定一致）。</p></article>
          <article class="ch2-def"><span class="kicker">策略</span><strong>多条正确路线可以并存</strong><p>比的是步骤结构，不是唯一按钮序列。</p></article>
        </div>`,
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head">
            <h3>行列式策略台 · 操作账本</h3>
            <p>每次行变换高亮刷新矩阵；可一键播放“消元演示路径”。</p>
          </div>
          <div class="ch2-lab-grid">
            <div class="ch2-matrix-box">
              <table class="ch2-matrix-table" data-mat-table></table>
              <div class="ch2-toolbar" style="margin-top:12px">
                <button type="button" data-op-swap>交换 R1R2</button>
                <button type="button" data-op-scale>R2×2</button>
                <button type="button" data-op-add>消 R2 首元</button>
                <button type="button" data-op-add2>消 R3 次元</button>
                <button type="button" data-op-triangle-hint>播放演示路径</button>
                <button type="button" data-op-reset>重置</button>
              </div>
            </div>
            <div class="ch2-side">
              <div class="ch2-meter">
                <div class="ch2-meter-card" data-cur-card><strong>当前 det</strong><span data-cur></span></div>
                <div class="ch2-meter-card"><strong>累计因子</strong><span data-factor></span></div>
                <div class="ch2-meter-card"><strong>原 det</strong><span data-orig></span></div>
              </div>
              <div class="ch2-ledger"><strong>账本</strong><ol data-ledger></ol></div>
              <div class="ch2-note">3 阶直接展开 6 项；结构化消元通常更短。</div>
            </div>
          </div>
        </div>`;
      mountStrategy(root);
    },
  });

  defineChapter2Renderer("cofactor-expansion", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "余子式、代数余子式与一行展开",
        "删行删列得到余子矩阵；乘位置符号得到代数余子式；沿一行求和回到原行列式。",
        `<div class="ch2-def-stack">
          <article class="ch2-def"><span class="kicker">符号</span><strong>${tex("C_{ij}=(-1)^{i+j}M_{ij}")}</strong><p>棋盘只是记忆，指数奇偶才是定义。</p></article>
          <article class="ch2-def"><span class="kicker">展开</span><strong>${tex("\\det(A)=\\sum_j a_{ij}C_{ij}")}</strong><p>优先选零多的行/列，降低子问题数量。</p></article>
        </div>`,
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head">
            <h3>余子式展开板</h3>
            <p>点击元素：删去的行列淡出，余子式与代数余子式同步更新；棋盘当前位置高亮。</p>
          </div>
          <div class="ch2-lab-grid">
            <div class="ch2-matrix-box">
              <table class="ch2-matrix-table" data-cof-table></table>
              <div style="margin-top:12px"><strong style="font-size:12px;letter-spacing:.05em;color:var(--muted)">符号棋盘</strong><div class="ch2-checkerboard" data-board></div></div>
            </div>
            <div class="ch2-side">
              <div class="ch2-meter is-2">
                <div class="ch2-meter-card"><strong>选中</strong><span data-pos></span></div>
                <div class="ch2-meter-card"><strong class="ch2-meter-math" data-label-mij></strong><span data-mij></span></div>
                <div class="ch2-meter-card"><strong class="ch2-meter-math" data-label-sign></strong><span data-sign></span></div>
                <div class="ch2-meter-card" data-cij-card><strong class="ch2-meter-math" data-label-cij></strong><span data-cij></span></div>
              </div>
              <div class="ch2-note">沿第 2 行展开：<strong data-expand></strong></div>
              <div class="ch2-note">真实 det：<strong data-true></strong></div>
            </div>
          </div>
        </div>`;
      mountCofactor(root);
    },
  });

  defineChapter2Renderer("cramer-rule", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "克拉默法则：解是行列式之比",
        "在 det(A)≠0 时，把第 i 列换成 b 得到 Aᵢ，则 xᵢ = det(Aᵢ)/det(A)。D=0 时公式失效。",
        `<div class="ch2-def-stack">
          <article class="ch2-def"><span class="kicker">前提</span><strong>${tex("\\det(A)\\ne 0")}</strong><p>方阵且满秩，才有唯一解坐标。</p></article>
          <article class="ch2-def"><span class="kicker">边界</span><strong>D=0 不一定无解</strong><p>可能无解，也可能无穷多解——要看 b 是否在列空间。</p></article>
        </div>`,
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head">
            <h3>替换列实验室 · 克拉默几何</h3>
            <p>预设切换时系数与向量平滑插值；D、D₁、D₂ 同步变化。</p>
          </div>
          <div class="ch2-lab-grid">
            <div class="ch2-stage"><canvas data-cramer-canvas aria-label="克拉默几何"></canvas></div>
            <div class="ch2-side">
              <div class="ch2-meter">
                <div class="ch2-meter-card" data-d-card><strong>D</strong><span data-d></span></div>
                <div class="ch2-meter-card"><strong>D₁</strong><span data-d1></span></div>
                <div class="ch2-meter-card"><strong>D₂</strong><span data-d2></span></div>
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
      formal.innerHTML = formalShell(
        "Laplace 推广与乘法规则",
        "固定 k 行的子式配对求和推广了按一行展开；连续两个线性变换的有向面积倍率相乘，且右边矩阵先作用。",
        `<div class="ch2-def-stack">
          <article class="ch2-def"><span class="kicker">乘法规则</span><strong>${display("\\det(AB)=\\det(A)\\det(B)")}</strong><p>形状可以因顺序不同，但行列式乘积相同。AB 与 BA 通常不同形。</p></article>
          <article class="ch2-def"><span class="kicker">复合顺序</span><strong>先 B 后 A</strong><p>与第四章矩阵乘法一致：靠近输入的矩阵先作用。</p></article>
          <article class="ch2-def"><span class="kicker">Laplace</span><strong>k=1 退化为 §6</strong><p>固定 2 行时列组合数为 C(n,2)，不要一次铺满所有分支。</p></article>
        </div>
        <div class="ch2-reading-note"><strong>观看方式</strong><p>点预设后，中间屏先长到 B，右侧再长到 AB；四个 det 读数随动画帧更新。</p></div>`,
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head">
            <h3>两阶段体积实验 · 连续复合</h3>
            <p>同一套网格语言：单位形 → 先 B → 再 A 得到 AB。点预设会<strong>播放</strong>整段过渡，而不是三张静图闪切。</p>
          </div>
          <div class="ch2-lab-grid is-stack">
            <div class="ch2-stage-row">
              <div class="ch2-stage-panel">
                <div class="ch2-stage"><canvas data-c-i aria-label="单位形"></canvas></div>
                <div class="ch2-stage-caption">I · 单位形</div>
              </div>
              <div class="ch2-stage-panel">
                <div class="ch2-stage"><canvas data-c-b aria-label="经过 B"></canvas></div>
                <div class="ch2-stage-caption">I → B（先作用）</div>
              </div>
              <div class="ch2-stage-panel">
                <div class="ch2-stage"><canvas data-c-ab aria-label="经过 AB"></canvas></div>
                <div class="ch2-stage-caption">I → AB（再 A）</div>
              </div>
            </div>
            <div class="ch2-side">
              <div class="ch2-meter is-4">
                <div class="ch2-meter-card"><strong>det(A)</strong><span data-da></span></div>
                <div class="ch2-meter-card"><strong>det(B)</strong><span data-db></span></div>
                <div class="ch2-meter-card"><strong>det(A)det(B)</strong><span data-prod></span></div>
                <div class="ch2-meter-card" data-dab-card><strong>det(AB)</strong><span data-dab></span></div>
              </div>
              <div class="ch2-presets">
                <button type="button" class="is-active" data-prod-preset="scale">两次缩放</button>
                <button type="button" data-prod-preset="shearScale">剪切后缩放</button>
                <button type="button" data-prod-preset="mirrorRot">镜像后旋转</button>
                <button type="button" data-prod-preset="doubleMirror">两次镜像</button>
                <button type="button" data-prod-preset="project">含投影</button>
                <button type="button" data-prod-replay>重播动画</button>
              </div>
              <div class="ch2-note">Laplace 提示：对 4×4 固定 2 行时列组合数为 C(4,2)=6；k=1 时退化为按一行展开的 4 项。主画面优先讲清乘法规则的几何复合。</div>
            </div>
          </div>
        </div>`;
      mountProduct(root);
    },
  });
})();
