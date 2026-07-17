(() => {
  const M = () => window.Ch2Math;
  const tex = (s) => (window.texInline ? window.texInline(s) : s);
  const display = (s) => (window.texDisplay ? window.texDisplay(s) : s);
  const aEntry = (row, col) => tex(`a_{${row}${col}}`);
  const productTermHtml = (perm) => perm.map((col, row) => aEntry(row + 1, col)).join("");
  const signedTermHtml = (perm) => {
    const sign = M().signFromPerm(perm);
    return `${sign > 0 ? "+" : "−"}${productTermHtml(perm)}`;
  };

  function formalShell(title, lead, modulesHtml) {
    return `<h2>${title}</h2><div class="ch2-formal"><p class="ch2-formal-lead">${lead}</p>${modulesHtml}</div>`;
  }

  function module(num, title, sub, body) {
    return `<section class="ch2-module"><div class="ch2-module-heading"><span>${num}</span><div><h3>${title}</h3><p>${sub}</p></div></div>${body}</section>`;
  }

  // ========== §1 ==========
  function mountDetMeter(root) {
    const canvas = root.querySelector("[data-ch2-canvas]");
    const state = { matrix: [[1, 0.35], [0.15, 1]] };
    let animating = false;

    const presets = {
      identity: [[1, 0], [0, 1]],
      scale2: [[2, 0], [0, 1]],
      shear: [[1, 1], [0, 1]],
      mirror: [[-1, 0], [0, 1]],
      collinear: [[1, 2], [0.5, 1]],
      zero: [[0, 0], [0, 0]],
    };

    function readSliders() {
      return [
        [Number(root.querySelector('[data-key="a"]').value), Number(root.querySelector('[data-key="b"]').value)],
        [Number(root.querySelector('[data-key="c"]').value), Number(root.querySelector('[data-key="d"]').value)],
      ];
    }

    function writeSliders(m) {
      const flat = { a: m[0][0], b: m[0][1], c: m[1][0], d: m[1][1] };
      Object.entries(flat).forEach(([k, v]) => {
        const input = root.querySelector(`[data-key="${k}"]`);
        const lab = root.querySelector(`[data-val="${k}"]`);
        if (input) input.value = String(v);
        if (lab) lab.textContent = M().formatNum(v, 2);
      });
    }

    function syncReadout(m) {
      const det = M().det2(m);
      const st = M().detStatus(det);
      const detEl = root.querySelector("[data-det]");
      const absEl = root.querySelector("[data-abs]");
      const statusEl = root.querySelector("[data-status]");
      const formulaEl = root.querySelector("[data-formula]");
      detEl.textContent = M().formatNum(det, 3);
      absEl.textContent = M().formatNum(Math.abs(det), 3);
      statusEl.textContent = st.label;
      statusEl.className = `ch2-status ${st.cls}`;
      detEl.className = st.cls;
      formulaEl.textContent = `${M().formatNum(m[0][0])}·${M().formatNum(m[1][1])} − ${M().formatNum(m[0][1])}·${M().formatNum(m[1][0])}`;
      M().pulseClass(root.querySelector("[data-det-card]"));
    }

    function draw(m) {
      M().drawTransformScene(canvas, m, {
        firstLabel: "第1列",
        secondLabel: "第2列",
        caption: `det = ${M().formatNum(M().det2(m), 3)}`,
      });
      writeSliders(m);
      syncReadout(m);
    }

    async function goTo(target, { animate = true } = {}) {
      if (animating) return;
      animating = true;
      try {
        if (!animate || M().reducedMotion()) {
          state.matrix = M().cloneMat(target);
          draw(state.matrix);
          return;
        }
        await M().animateMatrix(canvas, target, {
          duration: 640,
          drawOptions: {
            firstLabel: "第1列",
            secondLabel: "第2列",
          },
          onUpdate: (current) => {
            state.matrix = M().cloneMat(current);
            writeSliders(current);
            syncReadout(current);
          },
        });
        state.matrix = M().cloneMat(target);
        draw(state.matrix);
      } finally {
        animating = false;
      }
    }

    root.querySelectorAll("[data-key]").forEach((input) => {
      input.addEventListener("input", () => {
        if (animating) return;
        state.matrix = readSliders();
        draw(state.matrix);
      });
    });

    root.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        root.querySelectorAll("[data-preset]").forEach((b) => b.classList.toggle("is-active", b === btn));
        goTo(presets[btn.dataset.preset], { animate: true });
      });
    });

    const onResize = () => {
      if (document.body.contains(canvas)) draw(state.matrix);
    };
    window.addEventListener("resize", onResize, { passive: true });
    draw(state.matrix);
  }

  // ========== §2 ==========
  function mountPermLab(root) {
    let perm = [1, 2, 3, 4];
    const list = root.querySelector("[data-perm-list]");

    function render({ pulse = false } = {}) {
      list.innerHTML = perm
        .map((value, index) => `<div class="ch2-perm-item${pulse ? " is-swap" : ""}" draggable="true" data-index="${index}">${value}</div>`)
        .join("");
      const pairs = M().inversionPairs(perm);
      const sign = M().signFromPerm(perm);
      root.querySelector("[data-tau]").textContent = String(pairs.length);
      root.querySelector("[data-parity]").textContent = pairs.length % 2 === 0 ? "偶排列" : "奇排列";
      root.querySelector("[data-sgn]").textContent = sign > 0 ? "+1" : "−1";
      root.querySelector("[data-perm-text]").textContent = perm.join(" ");
      root.querySelector("[data-inv-list]").innerHTML = pairs.length
        ? pairs.map(([a, b]) => `<span>(${a},${b})</span>`).join("")
        : "<span>无逆序对</span>";
      M().pulseClass(root.querySelector("[data-tau-card]"));

      let dragIndex = null;
      list.querySelectorAll(".ch2-perm-item").forEach((item) => {
        item.addEventListener("dragstart", () => {
          dragIndex = Number(item.dataset.index);
          item.style.opacity = "0.55";
        });
        item.addEventListener("dragend", () => {
          item.style.opacity = "1";
        });
        item.addEventListener("dragover", (e) => e.preventDefault());
        item.addEventListener("drop", () => {
          const target = Number(item.dataset.index);
          if (dragIndex == null || dragIndex === target) return;
          const next = perm.slice();
          const [moved] = next.splice(dragIndex, 1);
          next.splice(target, 0, moved);
          perm = next;
          render({ pulse: true });
        });
      });
    }

    root.querySelectorAll("[data-perm-preset]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const map = {
          id: [1, 2, 3, 4],
          adj: [1, 3, 2, 4],
          rev: [4, 3, 2, 1],
          cycle: [2, 3, 4, 1],
          ex: [3, 1, 4, 2],
        };
        const target = map[btn.dataset.permPreset];
        // animate via stepwise adjacent swaps toward target if short
        if (!M().reducedMotion() && target.join() !== perm.join()) {
          // soft visual: fade then set
          list.style.transition = "opacity 0.2s ease, transform 0.2s ease";
          list.style.opacity = "0.35";
          list.style.transform = "translateY(4px)";
          await new Promise((r) => setTimeout(r, 180));
          perm = target.slice();
          render({ pulse: true });
          list.style.opacity = "1";
          list.style.transform = "none";
        } else {
          perm = target.slice();
          render({ pulse: true });
        }
      });
    });

    root.querySelector("[data-adj-step]").addEventListener("click", () => {
      for (let i = 0; i < perm.length - 1; i += 1) {
        if (perm[i] > perm[i + 1]) {
          const next = perm.slice();
          [next[i], next[i + 1]] = [next[i + 1], next[i]];
          perm = next;
          render({ pulse: true });
          return;
        }
      }
    });

    render();
  }

  // ========== §3 ==========
  function mountSelectionGrid(root) {
    const n = 3;
    let chosenCols = Array(n).fill(null);

    function currentPerm() {
      return chosenCols.every((c) => c != null) ? chosenCols.map((c) => c + 1) : null;
    }

    function render() {
      const table = root.querySelector("[data-select-table]");
      const labels = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => aEntry(i + 1, j + 1)));
      table.innerHTML = labels
        .map(
          (row, i) =>
            `<tr>${row
              .map((label, j) => {
                const selected = chosenCols[i] === j;
                const colUsed = chosenCols.some((c, r) => r !== i && c === j);
                const rowUsed = chosenCols[i] != null && chosenCols[i] !== j;
                const cls = [selected ? "is-selected" : "", colUsed ? "is-locked-col" : "", rowUsed ? "is-locked-row" : ""]
                  .filter(Boolean)
                  .join(" ");
                return `<td class="${cls}" data-r="${i}" data-c="${j}">${label}</td>`;
              })
              .join("")}</tr>`,
        )
        .join("");

      table.querySelectorAll("td").forEach((td) => {
        td.addEventListener("click", () => {
          const r = Number(td.dataset.r);
          const c = Number(td.dataset.c);
          if (chosenCols.some((col, row) => row !== r && col === c)) {
            root.querySelector("[data-select-msg]").textContent = `第 ${c + 1} 列已被占用，换一列。`;
            M().pulseClass(root.querySelector("[data-select-msg]").parentElement);
            return;
          }
          chosenCols[r] = chosenCols[r] === c ? null : c;
          root.querySelector("[data-select-msg]").textContent = "继续：每行每列恰好一个。";
          render();
        });
      });

      const perm = currentPerm();
      if (!perm) {
        root.querySelector("[data-perm-out]").textContent = "未完成";
        root.querySelector("[data-term-out]").textContent = "—";
        root.querySelector("[data-sign-out]").textContent = "—";
        return;
      }
      const sign = M().signFromPerm(perm);
      root.querySelector("[data-perm-out]").textContent = perm.join("");
      root.querySelector("[data-term-out]").innerHTML = productTermHtml(perm);
      root.querySelector("[data-sign-out]").innerHTML = sign > 0 ? tex("+1") : tex("-1");
      root.querySelector("[data-select-msg]").textContent = "合法取项完成：排列、乘积与符号已同步。";
      M().pulseClass(root.querySelector("[data-sign-card]"));
    }

    root.querySelector("[data-select-reset]").addEventListener("click", () => {
      chosenCols = Array(n).fill(null);
      render();
    });
    root.querySelector("[data-select-231]").addEventListener("click", async () => {
      // stepwise fill with short delays for path feeling
      chosenCols = Array(n).fill(null);
      render();
      const path = [1, 2, 0];
      for (let i = 0; i < path.length; i += 1) {
        if (M().reducedMotion()) {
          chosenCols = path.slice();
          break;
        }
        chosenCols[i] = path[i];
        render();
        await new Promise((r) => setTimeout(r, 220));
      }
      chosenCols = path.slice();
      render();
    });

    const six = root.querySelector("[data-six-terms]");
    six.innerHTML = M()
      .permutations(3)
      .map((perm) => {
        const sign = M().signFromPerm(perm);
        return `<button type="button" data-six="${perm.join("")}" class="ch2-term-btn">${sign > 0 ? "+" : "−"}${productTermHtml(perm)}</button>`;
      })
      .join("");
    six.querySelectorAll("[data-six]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        six.querySelectorAll("button").forEach((b) => b.classList.toggle("is-active", b === btn));
        const cols = btn.dataset.six.split("").map((ch) => Number(ch) - 1);
        chosenCols = Array(n).fill(null);
        for (let i = 0; i < cols.length; i += 1) {
          chosenCols[i] = cols[i];
          render();
          if (!M().reducedMotion()) await new Promise((r) => setTimeout(r, 160));
        }
      });
    });

    render();
  }

  // ========== §4 ==========
  function mountRowOps(root) {
    const INITIAL = [
      [1.2, 0.35],
      [0.2, 1.1],
    ];
    let matrix = M().cloneMat(INITIAL);
    let base = M().det2(matrix);
    const ledger = [];
    const canvas = root.querySelector("[data-row-canvas]");
    let animating = false;

    function matrixHtml(m) {
      return tex(
        `\begin{bmatrix}${M().formatNum(m[0][0], 2)}&${M().formatNum(m[0][1], 2)}\\${M().formatNum(m[1][0], 2)}&${M().formatNum(m[1][1], 2)}\end{bmatrix}`,
      );
    }

    function draw(m) {
      // auto-fit view so operations never "zoom out of frame"
      M().drawTransformScene(canvas, m, {
        firstLabel: "列1",
        secondLabel: "列2",
        caption: `det = ${M().formatNum(M().det2(m), 3)} · 虚线=单位正方形`,
        showUnit: true,
      });
    }

    function sync() {
      const det = M().det2(matrix);
      root.querySelector("[data-mat]").innerHTML = matrixHtml(matrix);
      root.querySelector("[data-cur-det]").textContent = M().formatNum(det, 3);
      root.querySelector("[data-base-det]").textContent = M().formatNum(base, 3);
      const st = M().detStatus(det);
      root.querySelector("[data-cur-det]").className = st.cls;
      root.querySelector("[data-ledger]").innerHTML = ledger.length
        ? ledger.map((line) => `<li>${line}</li>`).join("")
        : "<li>start · 无操作</li>";
      draw(matrix);
      M().pulseClass(root.querySelector("[data-cur-card]"));
    }

    async function apply(next, line) {
      if (animating) return;
      animating = true;
      try {
        await M().animateMatrix(canvas, next, {
          duration: 580,
          drawOptions: {
            firstLabel: "列1",
            secondLabel: "列2",
            caption: "行操作中…",
            showUnit: true,
          },
          onUpdate: (current) => {
            root.querySelector("[data-cur-det]").textContent = M().formatNum(M().det2(current), 3);
            root.querySelector("[data-mat]").innerHTML = matrixHtml(current);
          },
        });
        matrix = M().cloneMat(next);
        if (line !== "reset") ledger.push(line);
        sync();
      } finally {
        animating = false;
      }
    }

    root.querySelector("[data-op-swap]").addEventListener("click", () => {
      apply([matrix[1].slice(), matrix[0].slice()], "R1 ↔ R2    × (−1)");
    });
    root.querySelector("[data-op-scale]").addEventListener("click", () => {
      // scale by 1.5 instead of 2 so classroom demo stays readable longer; autofit still protects
      apply([matrix[0].map((v) => v * 1.5), matrix[1].slice()], "R1 ← 1.5·R1    × 1.5");
    });
    root.querySelector("[data-op-add]").addEventListener("click", () => {
      apply([matrix[0].slice(), [matrix[1][0] + matrix[0][0], matrix[1][1] + matrix[0][1]]], "R2 ← R2+R1    × 1");
    });
    root.querySelector("[data-op-reset]").addEventListener("click", async () => {
      ledger.length = 0;
      base = M().det2(INITIAL);
      await apply(M().cloneMat(INITIAL), "reset");
      ledger.length = 0;
      sync();
    });

    // button label if present
    const scaleBtn = root.querySelector("[data-op-scale]");
    if (scaleBtn) scaleBtn.textContent = "R1 × 1.5";

    sync();
  }

  // ---- Register ----
  defineChapter2Renderer("determinant-intro", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "一个数，同时记录倍率、方向与塌缩",
        "行列式把方阵压成标量。二维里，|det| 是面积倍率，符号记录定向，零值对应维度塌缩。下面用同一张网格把三件事连起来。",
        module(
          "01",
          "二阶公式落在平行四边形上",
          "不是死记 ad−bc，而是看见两列怎样张成面积。",
          `<div class="ch2-def-stack">
            <article class="ch2-def"><span class="kicker">公式</span><strong>${tex("\\det\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}=ad-bc")}</strong><p>两列向量张成平行四边形；绝对值是面积，符号是定向。</p></article>
            <article class="ch2-def"><span class="kicker">符号</span><strong>有向面积，不是“负的几何面积”</strong><p>det&lt;0 时普通面积仍取绝对值，定向发生了翻转。</p></article>
            <article class="ch2-def"><span class="kicker">零值</span><strong>共线则塌缩</strong><p>高度连续降到 0 时 det→0，信息无法唯一恢复。</p></article>
          </div>
          <div class="ch2-reading-note"><strong>操作任务</strong><p>先找一个明显变形却 det=1 的例子，再拖到镜像与共线，确认三个仪表不同步变化的含义。</p></div>`,
        ),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head">
            <h3>行列式仪表 · 连续变形</h3>
            <p>拖动参数或点预设：网格与 det 读数同步插值过渡，而不是闪切。</p>
          </div>
          <div class="ch2-lab-grid">
            <div class="ch2-stage"><canvas data-ch2-canvas aria-label="有向面积画布"></canvas></div>
            <div class="ch2-side">
              <div class="ch2-meter">
                <div class="ch2-meter-card" data-det-card><strong>det</strong><span data-det>1</span></div>
                <div class="ch2-meter-card"><strong>|det|</strong><span data-abs>1</span></div>
                <div class="ch2-meter-card"><strong>状态</strong><span data-status class="ch2-status is-positive">方向保持</span></div>
              </div>
              <div class="ch2-note">展开式：<strong data-formula></strong></div>
              <div class="ch2-sliders">
                ${["a", "b", "c", "d"]
                  .map(
                    (k) =>
                      `<label><span>${k}</span><input data-key="${k}" type="range" min="-2" max="2" step="0.05" /><span data-val="${k}">0</span></label>`,
                  )
                  .join("")}
              </div>
              <div class="ch2-presets">
                <button type="button" data-preset="identity" class="is-active">单位</button>
                <button type="button" data-preset="scale2">放大 2</button>
                <button type="button" data-preset="shear">剪切</button>
                <button type="button" data-preset="mirror">镜像</button>
                <button type="button" data-preset="collinear">共线</button>
                <button type="button" data-preset="zero">零矩阵</button>
              </div>
            </div>
          </div>
        </div>`;
      mountDetMeter(root);
    },
  });

  defineChapter2Renderer("permutations", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "符号来自排列的奇偶性",
        "每行每列各取一个元素时，列指标形成一个排列。逆序数的奇偶决定该项前面的正负号。",
        module(
          "01",
          "逆序数与符号",
          "先数对，再写符号。",
          `<div class="ch2-def-stack">
            <article class="ch2-def"><span class="kicker">逆序</span><strong>${tex("\\tau(\\sigma)")}</strong><p>i&lt;j 但 σ(i)&gt;σ(j) 的数对个数。</p></article>
            <article class="ch2-def"><span class="kicker">符号</span><strong>${tex("\\operatorname{sgn}(\\sigma)=(-1)^{\\tau(\\sigma)}")}</strong><p>偶排列为 +1，奇排列为 −1。</p></article>
            <article class="ch2-def"><span class="kicker">相邻交换</span><strong>一次交换翻转奇偶</strong><p>这是对换改变符号的最直观理由。</p></article>
          </div>`,
        ),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head">
            <h3>排列奇偶实验室</h3>
            <p>拖动卡片重排；预设切换带过渡。逆序对列表与 τ、sgn 同步更新。</p>
          </div>
          <div class="ch2-side">
            <div class="ch2-note">当前排列：<strong data-perm-text>1 2 3 4</strong></div>
            <div class="ch2-perm-track"><div class="ch2-perm-row" data-perm-list></div></div>
            <div class="ch2-meter">
              <div class="ch2-meter-card" data-tau-card><strong>τ(σ)</strong><span data-tau>0</span></div>
              <div class="ch2-meter-card"><strong>奇偶</strong><span data-parity>偶排列</span></div>
              <div class="ch2-meter-card"><strong>sgn</strong><span data-sgn>+1</span></div>
            </div>
            <div class="ch2-note"><strong>逆序对</strong><div class="ch2-inversion-list" data-inv-list style="margin-top:8px"></div></div>
            <div class="ch2-presets">
              <button type="button" data-perm-preset="id">恒等</button>
              <button type="button" data-perm-preset="adj">相邻交换</button>
              <button type="button" data-perm-preset="rev">完全逆序</button>
              <button type="button" data-perm-preset="cycle">循环</button>
              <button type="button" data-perm-preset="ex">例题 3142</button>
              <button type="button" data-adj-step>相邻交换一步</button>
            </div>
          </div>
        </div>`;
      mountPermLab(root);
    },
  });

  defineChapter2Renderer("n-order-determinant", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "n 阶定义：带符号的合法取项求和",
        "每一项每行每列各取一次；符号由列指标排列的奇偶决定。二阶、三阶都是特例。",
        module(
          "01",
          "Leibniz 公式",
          "先合法，再计数，再定号。",
          `<div class="ch2-def-stack">
            <article class="ch2-def"><span class="kicker">定义</span><strong>${display("\\det(A)=\\sum_{\\sigma}\\operatorname{sgn}(\\sigma)\\prod_i a_{i\\sigma(i)}")}</strong><p>共 ${tex("n!")} 项；非法取项不进入求和。</p></article>
            <article class="ch2-def"><span class="kicker">注意</span><strong>Sarrus 法只用于三阶</strong><p>四阶及以上不要套对角线画法。</p></article>
          </div>`,
        ),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head">
            <h3>取项网格 · 排列项生成器</h3>
            <p>点选路径逐步点亮；六项卡片会按顺序铺开放入排列。</p>
          </div>
          <div class="ch2-lab-grid">
            <div class="ch2-matrix-box">
              <table class="ch2-matrix-table" data-select-table></table>
              <div class="ch2-presets" style="margin-top:12px">
                <button type="button" data-select-reset>清空</button>
                <button type="button" data-select-231>播放排列 231</button>
              </div>
              <p class="ch2-note" style="margin-top:12px" data-select-msg>继续选择：每行每列各一个。</p>
            </div>
            <div class="ch2-side">
              <div class="ch2-meter is-2">
                <div class="ch2-meter-card"><strong>排列</strong><span data-perm-out>—</span></div>
                <div class="ch2-meter-card" data-sign-card><strong>符号</strong><span data-sign-out>—</span></div>
              </div>
              <div class="ch2-note">乘积项：<strong data-term-out>—</strong></div>
              <div class="ch2-note"><strong>三阶六项</strong><div class="ch2-presets" data-six-terms style="margin-top:8px"></div></div>
            </div>
          </div>
        </div>`;
      mountSelectionGrid(root);
    },
  });

  defineChapter2Renderer("determinant-properties", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "三类行操作，三种倍率",
        "交换变号、倍乘乘 λ、倍加不变。几何上分别是翻转定向、缩放高度、剪切保持面积。",
        module(
          "01",
          "操作账本",
          "每一步都要留下可回溯的倍率。",
          `<div class="ch2-card-grid">
            <article class="ch2-card"><span class="kicker">交换</span><h4>× (−1)</h4><p>两行互换，定向翻转。</p></article>
            <article class="ch2-card"><span class="kicker">倍乘</span><h4>× λ</h4><p>一行整体缩放，面积同比缩放。</p></article>
            <article class="ch2-card"><span class="kicker">倍加</span><h4>× 1</h4><p>剪切：形状变，面积不变。</p></article>
          </div>`,
        ),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head">
            <h3>行操作观测台</h3>
            <p>每次操作让网格插值过渡到新矩阵，账本同步追加一行。</p>
          </div>
          <div class="ch2-lab-grid">
            <div class="ch2-stage"><canvas data-row-canvas aria-label="行操作几何"></canvas></div>
            <div class="ch2-side">
              <div class="ch2-note">当前矩阵<br><strong data-mat></strong></div>
              <div class="ch2-meter is-2">
                <div class="ch2-meter-card" data-cur-card><strong>当前 det</strong><span data-cur-det></span></div>
                <div class="ch2-meter-card"><strong>初始 det</strong><span data-base-det></span></div>
              </div>
              <div class="ch2-ledger"><strong>操作账本</strong><ol data-ledger></ol></div>
              <div class="ch2-toolbar">
                <button type="button" data-op-swap>交换两行</button>
                <button type="button" data-op-scale>R1 × 2</button>
                <button type="button" data-op-add>R2 += R1</button>
                <button type="button" data-op-reset>重置</button>
              </div>
            </div>
          </div>
        </div>`;
      mountRowOps(root);
    },
  });
})();
