(() => {
  const M = () => window.Ch2Math;
  const tex = (s) => (window.texInline ? window.texInline(s) : s);

  function shell(title, body, formalTitle, formalBody) {
    return {
      formal(formal) {
        if (!formal) return;
        formal.innerHTML = `<h2>${formalTitle}</h2><div class="ch2-formal-layout">${formalBody}</div>`;
      },
      interactive(root) {
        if (!root) return;
        root.innerHTML = `<h2>交互实验</h2><div class="ch2-lab">${body}</div>`;
      },
    };
  }

  // ---------- §1 Determinant Meter ----------
  function mountDetMeter(host) {
    const canvas = host.querySelector("[data-ch2-canvas]");
    const ctx = canvas.getContext("2d");
    const state = { a: 1, b: 0.4, c: 0.2, d: 1 };

    const presets = {
      identity: { a: 1, b: 0, c: 0, d: 1 },
      scale2: { a: 2, b: 0, c: 0, d: 1 },
      shear: { a: 1, b: 1, c: 0, d: 1 },
      mirror: { a: -1, b: 0, c: 0, d: 1 },
      collinear: { a: 1, b: 2, c: 0.5, d: 1 },
      zero: { a: 0, b: 0, c: 0, d: 0 },
    };

    function det() {
      return M().det2(state.a, state.b, state.c, state.d);
    }

    function statusOf(value) {
      if (Math.abs(value) < 1e-8) return { key: "zero", label: "维度塌缩", cls: "ch2-status-zero" };
      if (value > 0) return { key: "pos", label: "方向保持", cls: "ch2-status-pos" };
      return { key: "neg", label: "方向翻转", cls: "ch2-status-neg" };
    }

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth || 520;
      const height = 320;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const origin = { x: width * 0.38, y: height * 0.62 };
      const scale = 70;
      M().drawAxes(ctx, width, height, origin, scale);
      // unit square ghost
      M().drawParallelogram(ctx, origin, scale, [1, 0], [0, 1], "rgba(120,140,160,0.08)", "rgba(120,140,160,0.35)");
      const c1 = [state.a, state.c];
      const c2 = [state.b, state.d];
      const value = det();
      const fill =
        Math.abs(value) < 1e-8
          ? "rgba(176,122,18,0.18)"
          : value > 0
            ? "rgba(67,198,186,0.22)"
            : "rgba(212,107,79,0.22)";
      const stroke = value >= 0 ? "#2a9d8f" : "#c44b3c";
      const pts = M().drawParallelogram(ctx, origin, scale, c1, c2, fill, stroke);
      M().drawArrow(ctx, origin, pts.p1, "#6b8df2", 3);
      M().drawArrow(ctx, origin, pts.p3, "#d46b4f", 3);
      // orientation cue
      ctx.fillStyle = "rgba(30,40,55,0.75)";
      ctx.font = "12px ui-sans-serif, system-ui";
      ctx.fillText("e₁ → 第1列", pts.p1.x + 6, pts.p1.y);
      ctx.fillText("e₂ → 第2列", pts.p3.x + 6, pts.p3.y);
    }

    function sync() {
      const value = det();
      const st = statusOf(value);
      host.querySelector("[data-det]").textContent = M().formatNum(value, 3);
      host.querySelector("[data-abs]").textContent = M().formatNum(Math.abs(value), 3);
      const status = host.querySelector("[data-status]");
      status.textContent = st.label;
      status.className = st.cls;
      host.querySelector("[data-formula]").textContent = `${M().formatNum(state.a)}·${M().formatNum(state.d)} − ${M().formatNum(state.b)}·${M().formatNum(state.c)}`;
      ["a", "b", "c", "d"].forEach((key) => {
        const input = host.querySelector(`[data-key="${key}"]`);
        const label = host.querySelector(`[data-val="${key}"]`);
        if (input) input.value = String(state[key]);
        if (label) label.textContent = M().formatNum(state[key], 2);
      });
      draw();
    }

    host.querySelectorAll("[data-key]").forEach((input) => {
      input.addEventListener("input", () => {
        state[input.dataset.key] = Number(input.value);
        sync();
      });
    });

    host.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        Object.assign(state, presets[btn.dataset.preset]);
        host.querySelectorAll("[data-preset]").forEach((b) => b.classList.toggle("is-active", b === btn));
        sync();
      });
    });

    window.addEventListener(
      "resize",
      () => {
        if (document.body.contains(canvas)) draw();
      },
      { passive: true },
    );
    sync();
  }

  // ---------- §2 Permutation lab ----------
  function mountPermLab(host) {
    let perm = [1, 2, 3, 4];
    const list = host.querySelector("[data-perm-list]");
    const invBox = host.querySelector("[data-inv-list]");

    function render() {
      list.innerHTML = perm
        .map((value, index) => `<div class="ch2-perm-item" draggable="true" data-index="${index}">${value}</div>`)
        .join("");
      const pairs = M().inversionPairs(perm);
      const sign = M().signFromPerm(perm);
      host.querySelector("[data-tau]").textContent = String(pairs.length);
      host.querySelector("[data-parity]").textContent = pairs.length % 2 === 0 ? "偶排列" : "奇排列";
      host.querySelector("[data-sgn]").textContent = sign > 0 ? "+1" : "−1";
      host.querySelector("[data-perm-text]").textContent = perm.join("");
      invBox.innerHTML = pairs.length
        ? pairs.map(([a, b]) => `<span>(${a},${b})</span>`).join("")
        : "<span>无逆序对</span>";

      let dragIndex = null;
      list.querySelectorAll(".ch2-perm-item").forEach((item) => {
        item.addEventListener("dragstart", () => {
          dragIndex = Number(item.dataset.index);
        });
        item.addEventListener("dragover", (event) => event.preventDefault());
        item.addEventListener("drop", () => {
          const target = Number(item.dataset.index);
          if (dragIndex == null || dragIndex === target) return;
          const next = perm.slice();
          const [moved] = next.splice(dragIndex, 1);
          next.splice(target, 0, moved);
          perm = next;
          render();
        });
      });
    }

    host.querySelectorAll("[data-perm-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const map = {
          id: [1, 2, 3, 4],
          adj: [1, 3, 2, 4],
          rev: [4, 3, 2, 1],
          cycle: [2, 3, 4, 1],
          ex: [3, 1, 4, 2],
        };
        perm = map[btn.dataset.permPreset].slice();
        render();
      });
    });

    host.querySelector("[data-adj-step]").addEventListener("click", () => {
      // one bubble-sort adjacent swap toward identity
      for (let i = 0; i < perm.length - 1; i += 1) {
        if (perm[i] > perm[i + 1]) {
          const next = perm.slice();
          [next[i], next[i + 1]] = [next[i + 1], next[i]];
          perm = next;
          render();
          return;
        }
      }
    });

    render();
  }

  // ---------- §3 selection grid ----------
  function mountSelectionGrid(host) {
    const n = 3;
    const labels = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => `a${i + 1}${j + 1}`),
    );
    let chosenCols = Array(n).fill(null);

    function currentPerm() {
      return chosenCols.every((c) => c != null) ? chosenCols.map((c) => c + 1) : null;
    }

    function render() {
      const table = host.querySelector("[data-select-table]");
      table.innerHTML = labels
        .map(
          (row, i) =>
            `<tr>${row
              .map((label, j) => {
                const selected = chosenCols[i] === j;
                const colUsed = chosenCols.some((c, r) => r !== i && c === j);
                const rowUsed = chosenCols[i] != null && chosenCols[i] !== j;
                const cls = [
                  selected ? "is-selected" : "",
                  colUsed ? "is-locked-col" : "",
                  rowUsed ? "is-locked-row" : "",
                ]
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
            host.querySelector("[data-select-msg]").textContent = `第 ${c + 1} 列已被使用。`;
            return;
          }
          chosenCols[r] = chosenCols[r] === c ? null : c;
          host.querySelector("[data-select-msg]").textContent = "继续选择：每行每列各一个。";
          render();
        });
      });

      const perm = currentPerm();
      if (!perm) {
        host.querySelector("[data-perm-out]").textContent = "尚未完成合法取项";
        host.querySelector("[data-term-out]").textContent = "—";
        host.querySelector("[data-sign-out]").textContent = "—";
        return;
      }
      const sign = M().signFromPerm(perm);
      const term = perm.map((col, row) => `a${row + 1}${col}`).join(" ");
      host.querySelector("[data-perm-out]").textContent = perm.join("");
      host.querySelector("[data-term-out]").textContent = term;
      host.querySelector("[data-sign-out]").textContent = sign > 0 ? "+1" : "−1";
      host.querySelector("[data-select-msg]").textContent = "合法取项完成：已生成排列、乘积与符号。";
    }

    host.querySelector("[data-select-reset]").addEventListener("click", () => {
      chosenCols = Array(n).fill(null);
      render();
    });

    host.querySelector("[data-select-231]").addEventListener("click", () => {
      chosenCols = [1, 2, 0]; // columns for perm 2,3,1
      render();
    });

    // six terms list
    const six = host.querySelector("[data-six-terms]");
    if (six) {
      six.innerHTML = M()
        .permutations(3)
        .map((perm) => {
          const sign = M().signFromPerm(perm);
          const term = perm.map((col, row) => `a${row + 1}${col}`).join("");
          return `<button type="button" class="ch2-chip" data-six="${perm.join("")}">${sign > 0 ? "+" : "−"}${term}</button>`;
        })
        .join("");
      six.querySelectorAll("[data-six]").forEach((btn) => {
        btn.addEventListener("click", () => {
          chosenCols = btn.dataset.six.split("").map((ch) => Number(ch) - 1);
          render();
        });
      });
    }

    render();
  }

  // ---------- §4 row ops ----------
  function mountRowOps(host) {
    let matrix = [
      [2, 1],
      [0.5, 1.5],
    ];
    let ledger = [];
    let baseDet = M().det2(2, 1, 0.5, 1.5);

    const canvas = host.querySelector("[data-row-canvas]");
    const ctx = canvas.getContext("2d");

    function currentDet() {
      return M().det2(matrix[0][0], matrix[0][1], matrix[1][0], matrix[1][1]);
    }

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth || 480;
      const height = 280;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const origin = { x: width * 0.35, y: height * 0.65 };
      const scale = 55;
      M().drawAxes(ctx, width, height, origin, scale);
      const c1 = [matrix[0][0], matrix[1][0]];
      const c2 = [matrix[0][1], matrix[1][1]];
      const value = currentDet();
      const fill = value >= 0 ? "rgba(107,141,242,0.2)" : "rgba(212,107,79,0.2)";
      const pts = M().drawParallelogram(ctx, origin, scale, c1, c2, fill, "#6b8df2");
      M().drawArrow(ctx, origin, pts.p1, "#6b8df2");
      M().drawArrow(ctx, origin, pts.p3, "#d46b4f");
    }

    function sync() {
      host.querySelector("[data-mat]").textContent = `[[${M().formatNum(matrix[0][0])}, ${M().formatNum(matrix[0][1])}], [${M().formatNum(matrix[1][0])}, ${M().formatNum(matrix[1][1])}]]`;
      host.querySelector("[data-cur-det]").textContent = M().formatNum(currentDet(), 3);
      host.querySelector("[data-base-det]").textContent = M().formatNum(baseDet, 3);
      const ol = host.querySelector("[data-ledger]");
      ol.innerHTML = ledger.length
        ? ledger.map((line) => `<li>${line}</li>`).join("")
        : "<li>尚：无操作</li>";
      draw();
    }

    host.querySelector("[data-op-swap]").addEventListener("click", () => {
      matrix = [matrix[1].slice(), matrix[0].slice()];
      ledger.push("R1 ↔ R2    × (−1)");
      sync();
    });
    host.querySelector("[data-op-scale]").addEventListener("click", () => {
      matrix[0] = matrix[0].map((v) => v * 2);
      ledger.push("R1 ← 2 R1    × 2");
      sync();
    });
    host.querySelector("[data-op-add]").addEventListener("click", () => {
      matrix[1] = [matrix[1][0] + matrix[0][0], matrix[1][1] + matrix[0][1]];
      ledger.push("R2 ← R2 + R1    × 1");
      sync();
    });
    host.querySelector("[data-op-reset]").addEventListener("click", () => {
      matrix = [
        [2, 1],
        [0.5, 1.5],
      ];
      ledger = [];
      baseDet = currentDet();
      sync();
    });
    sync();
  }

  // Register sections
  defineChapter2Renderer("determinant-intro", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = `
        <h2>先抓住三个信息</h2>
        <div class="ch2-formal-layout">
          <p>行列式把方阵压成一个标量。在二维中，这个数同时告诉你：面积被放大多少、定向是否翻转、维度是否塌缩。</p>
          <div class="definition-stack">
            <article class="definition-row"><strong>二阶公式</strong><p>${tex("\\det\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}=ad-bc")}</p></article>
            <article class="definition-row"><strong>绝对值</strong><p>${tex("|\\det(A)|")} 是单位正方形变成平行四边形后的面积倍率。</p></article>
            <article class="definition-row"><strong>符号</strong><p>正号表示定向保持，负号表示定向翻转；不要把“有向面积为负”说成普通几何面积为负。</p></article>
            <article class="definition-row"><strong>零值</strong><p>两列共线时平行四边形高度为 0，${tex("\\det(A)=0")}，输入无法唯一恢复。</p></article>
          </div>
        </div>`;
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head">
            <h3>Determinant Meter：行列式仪表</h3>
            <p>拖动矩阵元素，观察有向面积、${tex("ad-bc")} 与状态标签如何同步变化。</p>
          </div>
          <div class="ch2-lab-grid">
            <div class="ch2-canvas-wrap"><canvas data-ch2-canvas width="640" height="320" aria-label="有向面积画布"></canvas></div>
            <div class="ch2-side">
              <div class="ch2-meter">
                <div class="ch2-meter-card"><strong>det</strong><span data-det>1</span></div>
                <div class="ch2-meter-card"><strong>|det|</strong><span data-abs>1</span></div>
                <div class="ch2-meter-card"><strong>状态</strong><span data-status class="ch2-status-pos">方向保持</span></div>
              </div>
              <div class="ch2-note">公式：<span data-formula></span></div>
              <div class="ch2-sliders">
                ${["a", "b", "c", "d"]
                  .map(
                    (key) => `
                  <label><span>${key}</span><input data-key="${key}" type="range" min="-2" max="2" step="0.05" /><span data-val="${key}">0</span></label>`,
                  )
                  .join("")}
              </div>
              <div class="ch2-presets">
                <button type="button" data-preset="identity" class="is-active">单位</button>
                <button type="button" data-preset="scale2">放大2</button>
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
      formal.innerHTML = `
        <h2>符号来自排列的奇偶性</h2>
        <div class="ch2-formal-layout">
          <p>每行每列各取一个元素时，列指标构成一个排列。逆序数的奇偶性决定该项前面的正负号。</p>
          <div class="definition-stack">
            <article class="definition-row"><strong>逆序数</strong><p>${tex("\\tau(\\sigma)")} 统计所有 i&lt;j 但 σ(i)&gt;σ(j) 的数对个数。</p></article>
            <article class="definition-row"><strong>排列符号</strong><p>${tex("\\operatorname{sgn}(\\sigma)=(-1)^{\\tau(\\sigma)}")}</p></article>
            <article class="definition-row"><strong>相邻交换</strong><p>任意一次相邻交换翻转奇偶性；因此对换也翻转奇偶性。</p></article>
          </div>
        </div>`;
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head">
            <h3>排列奇偶实验室</h3>
            <p>拖动下排数字改变排列；逆序对、逆序数与符号同步更新。也可用相邻交换一步步还原。</p>
          </div>
          <div class="ch2-side">
            <div class="ch2-note">当前排列：<strong data-perm-text>1234</strong></div>
            <div class="ch2-perm-row" data-perm-list></div>
            <div class="ch2-meter">
              <div class="ch2-meter-card"><strong>τ(σ)</strong><span data-tau>0</span></div>
              <div class="ch2-meter-card"><strong>奇偶</strong><span data-parity>偶排列</span></div>
              <div class="ch2-meter-card"><strong>sgn</strong><span data-sgn>+1</span></div>
            </div>
            <div class="ch2-note"><strong>逆序对</strong><div class="ch2-inversion-list" data-inv-list></div></div>
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
      formal.innerHTML = `
        <h2>n 阶定义：带符号的合法取项求和</h2>
        <div class="ch2-formal-layout">
          <div class="definition-stack">
            <article class="definition-row"><strong>定义</strong><p>${tex("\\det(A)=\\sum_{\\sigma}\\operatorname{sgn}(\\sigma)\\prod_{i=1}^n a_{i\\sigma(i)}")}</p></article>
            <article class="definition-row"><strong>项数</strong><p>共有 ${tex("n!")} 个排列，因而有 ${tex("n!")} 个乘积项。</p></article>
            <article class="definition-row"><strong>特例</strong><p>n=2 还原为 ad−bc；n=3 得到六项。Sarrus 法不能推广到四阶。</p></article>
          </div>
        </div>`;
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head">
            <h3>取项网格 · 排列项生成器</h3>
            <p>点击矩阵元素构造合法路径：每行每列各一。完成后显示排列、乘积与符号。</p>
          </div>
          <div class="ch2-lab-grid">
            <div class="ch2-matrix-box">
              <table class="ch2-matrix-table" data-select-table></table>
              <div class="ch2-presets" style="margin-top:0.6rem">
                <button type="button" data-select-reset>清空</button>
                <button type="button" data-select-231>排列 231</button>
              </div>
              <p class="ch2-note" data-select-msg>继续选择：每行每列各一个。</p>
            </div>
            <div class="ch2-side">
              <div class="ch2-stat"><strong>列指标排列</strong><span data-perm-out>—</span></div>
              <div class="ch2-stat"><strong>乘积项</strong><span data-term-out>—</span></div>
              <div class="ch2-stat"><strong>符号</strong><span data-sign-out>—</span></div>
              <div class="ch2-note"><strong>三阶六项</strong><div class="ch2-presets" data-six-terms style="margin-top:0.4rem"></div></div>
            </div>
          </div>
        </div>`;
      mountSelectionGrid(root);
    },
  });

  defineChapter2Renderer("determinant-properties", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = `
        <h2>三类行操作，三种倍率</h2>
        <div class="ch2-formal-layout">
          <div class="definition-stack">
            <article class="definition-row"><strong>交换</strong><p>两行互换，行列式变号（× −1）。</p></article>
            <article class="definition-row"><strong>倍乘</strong><p>一行乘 λ，行列式乘 λ。</p></article>
            <article class="definition-row"><strong>倍加</strong><p>一行加另一行倍数，行列式不变（× 1），几何上像剪切。</p></article>
            <article class="definition-row"><strong>统一来源</strong><p>分别线性 + 交替性 + det(I)=1，可推出相同行为零、三角求值与 ${tex("\\det(\\lambda A)=\\lambda^n\\det(A)")}。</p></article>
          </div>
        </div>`;
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head">
            <h3>行操作观测台</h3>
            <p>对同一矩阵执行交换、倍乘与行倍加，观察平行四边形与操作账本。</p>
          </div>
          <div class="ch2-lab-grid">
            <div class="ch2-canvas-wrap"><canvas data-row-canvas width="560" height="280" aria-label="行操作几何"></canvas></div>
            <div class="ch2-side">
              <div class="ch2-stat"><strong>当前矩阵</strong><span data-mat></span></div>
              <div class="ch2-meter">
                <div class="ch2-meter-card"><strong>当前 det</strong><span data-cur-det></span></div>
                <div class="ch2-meter-card"><strong>初始 det</strong><span data-base-det></span></div>
              </div>
              <div class="ch2-ledger"><strong>操作账本</strong><ol data-ledger></ol></div>
              <div class="ch2-toolbar">
                <button type="button" data-op-swap>交换两行</button>
                <button type="button" data-op-scale>R1×2</button>
                <button type="button" data-op-add>R2+=R1</button>
                <button type="button" data-op-reset>重置</button>
              </div>
            </div>
          </div>
        </div>`;
      mountRowOps(root);
    },
  });
})();
