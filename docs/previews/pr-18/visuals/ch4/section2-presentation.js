(() => {
  const mathInline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const mathDisplay = (source) => (window.texDisplay ? window.texDisplay(source) : `<code>${source}</code>`);

  const A = [
    [2, 0],
    [0, 1],
  ];
  const B = [
    [1, 1],
    [0, 1],
  ];
  const AB = [
    [2, 2],
    [0, 1],
  ];
  const BA = [
    [2, 1],
    [0, 1],
  ];

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
              <h3 id="s2-transpose-title">Transpose Flip：每个元素沿主对角线换位置</h3>
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

  function renderInteractive(interactive) {
    if (!interactive || interactive.dataset.sectionTwoReady === "true") return;

    interactive.innerHTML = `
      <h2>交互实验</h2>
      <div class="s2-multiplication-lab" data-s2-multiplication-lab>
        <div class="s2-lab-heading">
          <div>
            <span class="s2-lab-kicker">同一组数据贯穿全部视角</span>
            <h3>矩阵乘法：从过程到公式</h3>
            <p>固定 ${mathInline(`A=${matrixTex(A)}`)} 与 ${mathInline(`B=${matrixTex(B)}`)}，只改变观察方式。</p>
          </div>
          <div class="s2-dataset-strip" aria-label="本实验使用的矩阵">
            <span>${mathInline(`A=${matrixTex(A)}`)}</span>
            <span>${mathInline(`B=${matrixTex(B)}`)}</span>
            <span>${mathInline(`AB=${matrixTex(AB)}`)}</span>
          </div>
        </div>

        <div class="s2-view-tabs" role="tablist" aria-label="矩阵乘法观察方式">
          <button type="button" role="tab" class="is-active" aria-selected="true" data-s2-view="compose">复合</button>
          <button type="button" role="tab" aria-selected="false" data-s2-view="columns">看列</button>
          <button type="button" role="tab" aria-selected="false" data-s2-view="formula">行乘列</button>
          <button type="button" role="tab" aria-selected="false" data-s2-view="order">交换顺序</button>
        </div>

        <div class="s2-view-stack">
          <section class="s2-view-panel is-active" role="tabpanel" data-s2-panel="compose">
            <div class="s2-compose-flow">
              ${vectorStage("输入", [1, 1], "x", "teal")}
              <div class="s2-process-arrow"><strong>B</strong><span>先剪切</span></div>
              ${vectorStage("中间结果", [2, 1], "Bx", "coral")}
              <div class="s2-process-arrow"><strong>A</strong><span>再横向拉伸</span></div>
              ${vectorStage("最终结果", [4, 1], "A(Bx)", "blue")}
            </div>
            <div class="s2-view-conclusion">
              <strong>${mathInline("ABx=A(Bx)")}</strong>
              <p>从输入向量出发，靠近 x 的 B 先作用。两步过程合并后，新的矩阵就是 AB。</p>
            </div>
          </section>

          <section class="s2-view-panel" role="tabpanel" data-s2-panel="columns" hidden>
            <div class="s2-column-flow">
              <div class="s2-column-group">
                <span>B 的两列</span>
                ${columnCard("b₁", [1, 0], "teal")}
                ${columnCard("b₂", [1, 1], "coral")}
              </div>
              <div class="s2-column-operator"><strong>A</strong><span>分别作用</span></div>
              <div class="s2-column-group">
                <span>AB 的两列</span>
                ${columnCard("Ab₁", [2, 0], "teal")}
                ${columnCard("Ab₂", [2, 1], "coral")}
              </div>
            </div>
            <div class="s2-view-conclusion">
              <strong>${mathInline("(AB)_{:j}=Ab_j")}</strong>
              <p>B 的第 j 列是 ${mathInline("Be_j")}；再让 A 作用，就得到 ${mathInline("ABe_j")}，也就是 AB 的第 j 列。</p>
            </div>
          </section>

          <section class="s2-view-panel" role="tabpanel" data-s2-panel="formula" hidden>
            <div class="s2-row-column-lens" data-row-column-lens>
              <div class="s2-lens-matrices">
                <div class="s2-lens-block"><span>A</span>${interactiveMatrix(A, "lens-a")}</div>
                <span class="s2-lens-symbol">×</span>
                <div class="s2-lens-block"><span>B</span>${interactiveMatrix(B, "lens-b")}</div>
                <span class="s2-lens-symbol">=</span>
                <div class="s2-lens-block"><span>C = AB</span>${resultMatrix(AB)}</div>
              </div>
              <div class="s2-dot-product" data-dot-product aria-live="polite"></div>
            </div>
          </section>

          <section class="s2-view-panel" role="tabpanel" data-s2-panel="order" hidden>
            <div class="s2-order-compare">
              <article>
                <span class="s2-card-kicker">AB：右边先发生</span>
                <div class="s2-order-steps"><b>输入</b><i>→ B 剪切 →</i><b>中间图形</b><i>→ A 拉伸 →</i><b>结果</b></div>
                ${mathDisplay(`AB=${matrixTex(AB)}`)}
                <p>剪切产生的水平偏移，在第二步被 A 一起放大。</p>
              </article>
              <article>
                <span class="s2-card-kicker">BA：交换过程顺序</span>
                <div class="s2-order-steps"><b>输入</b><i>→ A 拉伸 →</i><b>中间图形</b><i>→ B 剪切 →</i><b>结果</b></div>
                ${mathDisplay(`BA=${matrixTex(BA)}`)}
                <p>先拉伸后再剪切，剪切加入的水平偏移没有经历前面的拉伸。</p>
              </article>
            </div>
            <div class="s2-view-conclusion">
              <strong>${mathInline("AB\\ne BA")}</strong>
              <p>不交换是一条“通常规律”；对单位矩阵、同一个矩阵的幂等特殊组合，乘法仍可能交换。</p>
            </div>
          </section>
        </div>
      </div>

      <div class="script-panel s2-task-panel">
        <h3>操作任务</h3>
        <ol>
          <li>在“复合”中按箭头读取 ${mathInline("x\\to Bx\\to A(Bx)")}。</li>
          <li>在“看列”中确认 AB 的两列分别是 ${mathInline("Ab_1")} 与 ${mathInline("Ab_2")}。</li>
          <li>在“行乘列”中依次点击四个结果位置，核对每一个点积。</li>
          <li>最后比较 AB 与 BA，说明右上角为什么从 2 变成 1。</li>
        </ol>
      </div>
    `;

    bindViewTabs(interactive);
    bindRowColumnLens(interactive);
    interactive.dataset.sectionTwoReady = "true";
  }

  function vectorStage(title, vector, label, tone) {
    const [x, y] = vector;
    const scale = 24;
    const ox = 54;
    const oy = 108;
    const tx = ox + x * scale;
    const ty = oy - y * scale;
    return `
      <article class="s2-vector-stage is-${tone}">
        <span>${title}</span>
        <svg viewBox="0 0 170 138" role="img" aria-label="向量 ${label} 等于 ${x}, ${y}">
          <path class="s2-mini-grid" d="M18 36H152M18 60H152M18 84H152M18 108H152M30 18V126M54 18V126M78 18V126M102 18V126M126 18V126M150 18V126"></path>
          <path class="s2-mini-axis" d="M18 ${oy}H154M${ox} 126V16"></path>
          <path class="s2-mini-vector" d="M${ox} ${oy}L${tx} ${ty}"></path>
          <circle class="s2-mini-tip" cx="${tx}" cy="${ty}" r="5"></circle>
          <text x="${Math.min(145, tx + 8)}" y="${Math.max(18, ty - 8)}">${label}</text>
        </svg>
        <strong>${mathInline(`${label}=\\begin{bmatrix}${x}\\\\${y}\\end{bmatrix}`)}</strong>
      </article>
    `;
  }

  function columnCard(label, values, tone) {
    return `
      <article class="s2-column-card is-${tone}">
        <span>${label}</span>
        ${mathDisplay(`\\begin{bmatrix}${values[0]}\\\\${values[1]}\\end{bmatrix}`)}
      </article>
    `;
  }

  function interactiveMatrix(values, id) {
    return `<div class="s2-lens-matrix" data-matrix-id="${id}" style="--s2-cols:${values[0].length}">${values
      .flatMap((row, rowIndex) =>
        row.map(
          (value, colIndex) =>
            `<span data-row="${rowIndex}" data-col="${colIndex}">${value}</span>`,
        ),
      )
      .join("")}</div>`;
  }

  function resultMatrix(values) {
    return `<div class="s2-lens-matrix is-result" data-result-matrix style="--s2-cols:${values[0].length}">${values
      .flatMap((row, rowIndex) =>
        row.map(
          (value, colIndex) =>
            `<button type="button" data-result-cell data-row="${rowIndex}" data-col="${colIndex}" aria-label="计算结果矩阵第 ${rowIndex + 1} 行第 ${colIndex + 1} 列">${value}</button>`,
        ),
      )
      .join("")}</div>`;
  }

  function bindViewTabs(root) {
    const lab = root.querySelector("[data-s2-multiplication-lab]");
    if (!lab) return;
    const tabs = [...lab.querySelectorAll("[data-s2-view]")];
    const panels = [...lab.querySelectorAll("[data-s2-panel]")];

    const activate = (id, focus = false) => {
      tabs.forEach((tab) => {
        const active = tab.dataset.s2View === id;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        if (active && focus) tab.focus();
      });
      panels.forEach((panel) => {
        const active = panel.dataset.s2Panel === id;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab.dataset.s2View));
      tab.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        activate(tabs[next].dataset.s2View, true);
      });
    });
  }

  function bindRowColumnLens(root) {
    const lens = root.querySelector("[data-row-column-lens]");
    if (!lens) return;
    const aCells = [...lens.querySelectorAll('[data-matrix-id="lens-a"] span')];
    const bCells = [...lens.querySelectorAll('[data-matrix-id="lens-b"] span')];
    const resultCells = [...lens.querySelectorAll("[data-result-cell]")];
    const output = lens.querySelector("[data-dot-product]");

    const select = (row, col) => {
      aCells.forEach((cell) => cell.classList.toggle("is-highlighted", Number(cell.dataset.row) === row));
      bCells.forEach((cell) => cell.classList.toggle("is-highlighted", Number(cell.dataset.col) === col));
      resultCells.forEach((cell) => {
        const active = Number(cell.dataset.row) === row && Number(cell.dataset.col) === col;
        cell.classList.toggle("is-active", active);
        cell.setAttribute("aria-pressed", String(active));
      });
      const products = A[row].map((value, index) => `${value}\\cdot${B[index][col]}`);
      output.innerHTML = `
        <span>第 ${row + 1} 行 × 第 ${col + 1} 列</span>
        <strong>${mathInline(`c_{${row + 1}${col + 1}}=${products.join("+")}=${AB[row][col]}`)}</strong>
        <p>A 的第 ${row + 1} 行与 B 的第 ${col + 1} 列逐项配对，再把乘积相加。</p>
      `;
    };

    resultCells.forEach((cell) => {
      cell.addEventListener("click", () => select(Number(cell.dataset.row), Number(cell.dataset.col)));
    });
    select(0, 0);
  }

  window.defineChapter4Renderer?.("matrix-operations", {
    formal: renderFormal,
    interactive: renderInteractive,
  });
})();
