(() => {
  const mathInline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const mathDisplay = (source) => (window.texDisplay ? window.texDisplay(source) : `<code>${source}</code>`);

  const transposePresets = {
    rectangle: {
      label: "长方形",
      values: [
        [1, 2, 3],
        [4, 5, 6],
      ],
    },
    square: {
      label: "方阵",
      values: [
        [1, 2],
        [3, 4],
      ],
    },
    symmetric: {
      label: "对称矩阵",
      values: [
        [2, -1],
        [-1, 3],
      ],
    },
  };

  function matrixTex(values) {
    return `\\begin{bmatrix}${values.map((row) => row.join("&")).join("\\\\")}\\end{bmatrix}`;
  }

  function transpose(values) {
    return values[0].map((_, col) => values.map((row) => row[col]));
  }

  function matrixGrid(values, className = "") {
    const cols = values[0]?.length || 1;
    return `<div class="s2-matrix-grid ${className}" style="--s2-cols:${cols}">${values
      .flatMap((row, rowIndex) =>
        row.map(
          (value, colIndex) =>
            `<span data-row="${rowIndex}" data-col="${colIndex}">${value}</span>`,
        ),
      )
      .join("")}</div>`;
  }

  function operationMatrix(values, label) {
    return `
      <div class="s2-operation-matrix">
        <span class="s2-operation-label">${label}</span>
        ${matrixGrid(values)}
      </div>
    `;
  }

  function renderFormal(formal) {
    if (!formal || formal.dataset.sectionTwoReady === "true") return;

    formal.innerHTML = `
      <h2>先把运算规则放进同一张地图</h2>
      <div class="s2-foundation">
        <p class="s2-lead">加法与数乘在相同位置上工作；转置改变行列方向；乘法先通过尺寸闸门，再把一行与一列配对。每条规则都回答一个具体问题，不需要把它们混成一串公式背诵。</p>

        <section class="s2-module" aria-labelledby="s2-basic-operations-title">
          <div class="s2-module-heading">
            <span>01</span>
            <div>
              <h3 id="s2-basic-operations-title">加法与数乘：对齐后逐项操作</h3>
              <p>切换运算，观察同一位置上的数字怎样变化。</p>
            </div>
          </div>
          <div class="s2-basic-lab" data-s2-basic-lab>
            <div class="s2-segmented" role="group" aria-label="选择矩阵运算">
              <button type="button" class="is-active" data-basic-mode="add" aria-pressed="true">A + B</button>
              <button type="button" data-basic-mode="scale" aria-pressed="false">2A</button>
            </div>
            <div class="s2-operation-flow" data-basic-flow></div>
            <div class="s2-rule-note" data-basic-note aria-live="polite"></div>
          </div>
        </section>

        <section class="s2-module" aria-labelledby="s2-transpose-title">
          <div class="s2-module-heading">
            <span>02</span>
            <div>
              <h3 id="s2-transpose-title">转置翻折：每个元素沿主对角线换位置</h3>
              <p>行变列，形状从 m × n 变为 n × m；元素本身不改变。</p>
            </div>
          </div>
          <div class="s2-transpose-lab" data-s2-transpose-lab>
            <div class="s2-transpose-toolbar">
              <div class="s2-segmented" role="group" aria-label="选择转置示例">
                ${Object.entries(transposePresets)
                  .map(
                    ([id, item], index) =>
                      `<button type="button" class="${index === 0 ? "is-active" : ""}" data-transpose-preset="${id}" aria-pressed="${index === 0}">${item.label}</button>`,
                  )
                  .join("")}
              </div>
              <button class="s2-action-button" type="button" data-transpose-toggle>沿主对角线翻折</button>
            </div>
            <div class="s2-transpose-stage">
              <div class="s2-transpose-copy">
                <span data-transpose-name>A</span>
                <strong data-transpose-shape>2 × 3</strong>
              </div>
              <div class="s2-transpose-matrix" data-transpose-matrix aria-label="转置矩阵动画"></div>
              <div class="s2-diagonal-cue" aria-hidden="true"></div>
            </div>
            <p class="s2-transpose-readout" data-transpose-readout aria-live="polite"></p>
          </div>
          <div class="s2-property-grid">
            <article><span>翻折两次</span>${mathDisplay("(A^T)^T=A")}</article>
            <article><span>保持加法</span>${mathDisplay("(A+B)^T=A^T+B^T")}</article>
            <article><span>保持数乘</span>${mathDisplay("(\\lambda A)^T=\\lambda A^T")}</article>
            <article><span>乘积要倒序</span>${mathDisplay("(AB)^T=B^TA^T")}</article>
          </div>
        </section>

        <section class="s2-module" aria-labelledby="s2-size-title">
          <div class="s2-module-heading">
            <span>03</span>
            <div>
              <h3 id="s2-size-title">尺寸闸门：内部尺寸匹配，外侧尺寸留下</h3>
              <p>改变四个尺寸，闸门会立即判断乘法是否成立。</p>
            </div>
          </div>
          <div class="s2-size-gate" data-s2-size-gate>
            <div class="s2-size-controls">
              <label>A 的行数 m<select data-size="m">${[1, 2, 3, 4].map((n) => `<option${n === 2 ? " selected" : ""}>${n}</option>`).join("")}</select></label>
              <label>A 的列数 n<select data-size="n">${[1, 2, 3, 4].map((n) => `<option${n === 3 ? " selected" : ""}>${n}</option>`).join("")}</select></label>
              <label>B 的行数 r<select data-size="r">${[1, 2, 3, 4].map((n) => `<option${n === 3 ? " selected" : ""}>${n}</option>`).join("")}</select></label>
              <label>B 的列数 p<select data-size="p">${[1, 2, 3, 4].map((n) => `<option${n === 2 ? " selected" : ""}>${n}</option>`).join("")}</select></label>
            </div>
            <div class="s2-gate-stage">
              <div class="s2-dimension-card"><span>A</span><strong data-size-a>2 × 3</strong></div>
              <div class="s2-gate-symbol" data-gate-symbol aria-hidden="true">×</div>
              <div class="s2-dimension-card"><span>B</span><strong data-size-b>3 × 2</strong></div>
              <div class="s2-gate-door" data-gate-door><span></span></div>
              <div class="s2-dimension-card is-result" data-size-result-card><span>AB</span><strong data-size-result>2 × 2</strong></div>
            </div>
            <p class="s2-gate-message" data-size-message aria-live="polite"></p>
          </div>
        </section>

        <section class="s2-module" aria-labelledby="s2-laws-title">
          <div class="s2-module-heading">
            <span>04</span>
            <div>
              <h3 id="s2-laws-title">单位矩阵、结合律与作用方向</h3>
              <p>把“保持不变”“重新打包”和“交换顺序”分开理解。</p>
            </div>
          </div>
          <div class="s2-law-grid">
            <article class="s2-law-card">
              <span class="s2-card-kicker">单位矩阵</span>
              <div class="s2-machine-line"><strong>A</strong><i>→ I →</i><strong>A</strong></div>
              <p>${mathInline("IA=A")} 与 ${mathInline("AI=A")} 都表示穿过一个不改变对象的过程。</p>
            </article>
            <article class="s2-law-card">
              <span class="s2-card-kicker">结合律</span>
              <div class="s2-packaging-line"><span>(AB)C</span><i>=</i><span>A(BC)</span></div>
              <p>括号只改变先把哪两步打包；从输入出发，实际经过 C、B、A 的顺序不变。</p>
            </article>
            <article class="s2-law-card">
              <span class="s2-card-kicker">通常不交换</span>
              <div class="s2-compare-matrices">${mathInline("AB=\\begin{bmatrix}2&2\\\\0&1\\end{bmatrix}")}<i>≠</i>${mathInline("BA=\\begin{bmatrix}2&1\\\\0&1\\end{bmatrix}")}</div>
              <p>交换矩阵会交换过程顺序；某些特殊矩阵可以交换，但不能默认成立。</p>
            </article>
          </div>
          <div class="s2-side-preview">
            <div><span>左乘 EA</span><strong>更自然地组合 A 的行</strong></div>
            <div><span>右乘 AE</span><strong>更自然地组合 A 的列</strong></div>
            <p>这里先建立方向感，§6 再用初等矩阵把规则完整展开。</p>
          </div>
        </section>

        <section class="s2-module s2-extension-module" aria-labelledby="s2-extension-title">
          <div class="s2-module-heading">
            <span>05</span>
            <div>
              <h3 id="s2-extension-title">延伸观察</h3>
              <p>三条支线折叠收纳，不打断本节主线。</p>
            </div>
          </div>
          <div class="s2-extension-grid">
            <details><summary>矩阵幂：重复同一个过程</summary><p>${mathInline("A^kx")} 表示连续施加 k 次 A；结合律保证可以按不同方式分组计算。</p></details>
            <details><summary>非零矩阵也可能乘出零矩阵</summary><p>B 可以先把所有输入送入某个方向，而 A 恰好把这个方向全部消掉，于是 A、B 都非零但 ${mathInline("AB=0")}。</p></details>
            <details><summary>邻接矩阵的幂可以计数路径</summary><p>在网络中，${mathInline("(M^k)_{ij}")} 可以记录从节点 i 到节点 j 的 k 步路径数量；它体现“连续 k 步”的复合含义。</p></details>
          </div>
        </section>
      </div>
    `;

    bindBasicOperations(formal);
    bindTransposeLab(formal);
    bindSizeGate(formal);
    formal.dataset.sectionTwoReady = "true";
  }

  function bindBasicOperations(root) {
    const lab = root.querySelector("[data-s2-basic-lab]");
    if (!lab) return;
    const matrixA = [
      [1, 2, -1],
      [0, 3, 1],
    ];
    const matrixB = [
      [2, -1, 4],
      [1, 0, -2],
    ];
    const add = matrixA.map((row, i) => row.map((value, j) => value + matrixB[i][j]));
    const scale = matrixA.map((row) => row.map((value) => 2 * value));
    const flow = lab.querySelector("[data-basic-flow]");
    const note = lab.querySelector("[data-basic-note]");
    const buttons = [...lab.querySelectorAll("[data-basic-mode]")];

    const render = (mode) => {
      buttons.forEach((button) => {
        const active = button.dataset.basicMode === mode;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      if (mode === "scale") {
        flow.innerHTML = `
          <div class="s2-scalar-token">2</div><span class="s2-flow-symbol">×</span>
          ${operationMatrix(matrixA, "A")}<span class="s2-flow-symbol">=</span>
          ${operationMatrix(scale, "2A")}
        `;
        note.innerHTML = `<strong>同一个比例作用于所有位置。</strong><span>矩阵的形状保持 ${mathInline("2\\times3")} 不变。</span>`;
        return;
      }
      flow.innerHTML = `
        ${operationMatrix(matrixA, "A")}<span class="s2-flow-symbol">+</span>
        ${operationMatrix(matrixB, "B")}<span class="s2-flow-symbol">=</span>
        ${operationMatrix(add, "A+B")}
      `;
      note.innerHTML = `<strong>同型矩阵才能相加。</strong><span>两个 ${mathInline("2\\times3")} 矩阵按对应位置相加；${mathInline("2\\times3")} 与 ${mathInline("3\\times2")} 无法逐项对齐。</span>`;
    };

    lab.addEventListener("click", (event) => {
      const button = event.target.closest("[data-basic-mode]");
      if (button) render(button.dataset.basicMode);
    });
    render("add");
  }

  function bindTransposeLab(root) {
    const lab = root.querySelector("[data-s2-transpose-lab]");
    if (!lab) return;
    const stage = lab.querySelector("[data-transpose-matrix]");
    const shape = lab.querySelector("[data-transpose-shape]");
    const name = lab.querySelector("[data-transpose-name]");
    const readout = lab.querySelector("[data-transpose-readout]");
    const toggle = lab.querySelector("[data-transpose-toggle]");
    const presetButtons = [...lab.querySelectorAll("[data-transpose-preset]")];
    let presetId = "rectangle";
    let flipped = false;

    const rebuildCells = (original) => {
      stage.innerHTML = original
        .flatMap((row, rowIndex) =>
          row.map(
            (value, colIndex) =>
              `<span style="--cell-row:${rowIndex};--cell-col:${colIndex}" data-source-row="${rowIndex}" data-source-col="${colIndex}">${value}</span>`,
          ),
        )
        .join("");
      stage.dataset.transposePreset = presetId;
    };

    const render = ({ rebuild = false } = {}) => {
      const original = transposePresets[presetId].values;
      const shown = flipped ? transpose(original) : original;
      const rows = shown.length;
      const cols = shown[0].length;
      if (rebuild || stage.dataset.transposePreset !== presetId) rebuildCells(original);
      stage.style.setProperty("--s2-transpose-rows", rows);
      stage.style.setProperty("--s2-transpose-cols", cols);
      stage.querySelectorAll("span[data-source-row]").forEach((cell) => {
        const sourceRow = Number(cell.dataset.sourceRow);
        const sourceCol = Number(cell.dataset.sourceCol);
        cell.style.setProperty("--cell-row", flipped ? sourceCol : sourceRow);
        cell.style.setProperty("--cell-col", flipped ? sourceRow : sourceCol);
      });
      name.textContent = flipped ? "Aᵀ" : "A";
      shape.textContent = `${rows} × ${cols}`;
      toggle.textContent = flipped ? "翻折回 A" : "沿主对角线翻折";
      readout.innerHTML = flipped
        ? `${mathInline("a_{ij}")} 已移动到 ${mathInline("a_{ji}")}；当前显示 ${mathInline(`A^T=${matrixTex(shown)}`)}。`
        : `当前显示 ${mathInline(`A=${matrixTex(original)}`)}；翻折后第 i 行会成为第 i 列。`;
      lab.classList.toggle("is-flipped", flipped);
    };

    toggle.addEventListener("click", () => {
      flipped = !flipped;
      render();
    });

    presetButtons.forEach((button) => {
      button.addEventListener("click", () => {
        presetId = button.dataset.transposePreset;
        flipped = false;
        presetButtons.forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        render({ rebuild: true });
      });
    });
    render({ rebuild: true });
  }

  function bindSizeGate(root) {
    const gate = root.querySelector("[data-s2-size-gate]");
    if (!gate) return;
    const controls = Object.fromEntries(
      [...gate.querySelectorAll("[data-size]")].map((select) => [select.dataset.size, select]),
    );
    const render = () => {
      const m = Number(controls.m.value);
      const n = Number(controls.n.value);
      const r = Number(controls.r.value);
      const p = Number(controls.p.value);
      const open = n === r;
      gate.querySelector("[data-size-a]").textContent = `${m} × ${n}`;
      gate.querySelector("[data-size-b]").textContent = `${r} × ${p}`;
      gate.querySelector("[data-size-result]").textContent = open ? `${m} × ${p}` : "—";
      gate.querySelector("[data-size-result-card]").classList.toggle("is-blocked", !open);
      gate.querySelector("[data-gate-door]").classList.toggle("is-open", open);
      gate.classList.toggle("is-open", open);
      gate.querySelector("[data-size-message]").innerHTML = open
        ? `<strong>闸门打开：</strong>A 的列数 ${n} 与 B 的行数 ${r} 匹配，结果保留外侧尺寸 ${mathInline(`${m}\\times${p}`)}。`
        : `<strong>闸门关闭：</strong>A 的列数是 ${n}，B 的行数是 ${r}，中间尺寸无法配对。`;
    };
    Object.values(controls).forEach((select) => select.addEventListener("change", render));
    render();
  }

  // Multiplication interactive is owned by section2-continuous.js (single continuous lab).
  function renderInteractive(interactive) {
    if (!interactive) return;
    // Continuous module mounts the live lab; avoid building a second, discarded UI.
    window.mountSection2ContinuousLab?.(interactive);
  }

  window.defineChapter4Renderer?.("matrix-operations", {
    formal: renderFormal,
    interactive: renderInteractive,
  });
})();
