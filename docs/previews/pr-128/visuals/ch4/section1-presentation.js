(() => {
  const mathInline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const mathDisplay = (source) => (window.texDisplay ? window.texDisplay(source) : `<code>${source}</code>`);

  const anatomyValues = [
    [2, -1, 0, 3],
    [4, 1, 5, -2],
    [0, 6, 2, 1],
  ];

  const pixelColors = [
    "#e7ece3", "#c3d4c6", "#8fb19c", "#5b8a72", "#2c5e4a",
    "#dbe9f7", "#b6d1ee", "#85addf", "#6387c7", "#516cae",
    "#f3e1da", "#e7b8a7", "#d98d74", "#c8674f", "#a64f3c",
    "#eee9f6", "#d3c4e9", "#af95d5", "#8b6bbe", "#684b99",
    "#f4f1df", "#e4d99c", "#cbbd68", "#a99742", "#7d722f",
  ];

  /**
   * One filled path per arrow — stem and tip are the same color by construction.
   * Rounded outline (no dagger marker geometry).
   */
  function softArrow(x1, y1, x2, y2, className) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const px = -uy;
    const py = ux;

    const halfW = 2.35;
    const headLen = Math.min(15.5, Math.max(13, len * 0.22));
    const headHalf = 6.4;
    const tipX = x2;
    const tipY = y2;
    const neckX = tipX - ux * headLen;
    const neckY = tipY - uy * headLen;

    const f = (n) => n.toFixed(2);
    const pt = (x, y) => `${f(x)} ${f(y)}`;

    // Rounded start cap + parallel stem + soft arrow head, single closed path.
    const path = [
      `M ${pt(x1 + px * halfW, y1 + py * halfW)}`,
      `L ${pt(neckX + px * halfW, neckY + py * halfW)}`,
      `L ${pt(neckX + px * headHalf, neckY + py * headHalf)}`,
      `Q ${pt(tipX - ux * (headLen * 0.18) + px * 1.1, tipY - uy * (headLen * 0.18) + py * 1.1)} ${pt(tipX, tipY)}`,
      `Q ${pt(tipX - ux * (headLen * 0.18) - px * 1.1, tipY - uy * (headLen * 0.18) - py * 1.1)} ${pt(neckX - px * headHalf, neckY - py * headHalf)}`,
      `L ${pt(neckX - px * halfW, neckY - py * halfW)}`,
      `L ${pt(x1 - px * halfW, y1 - py * halfW)}`,
      `A ${halfW} ${halfW} 0 0 0 ${pt(x1 + px * halfW, y1 + py * halfW)}`,
      "Z",
    ].join(" ");

    return `<path class="basis-arrow ${className}" d="${path}"></path>`;
  }

  function renderBasisFigure() {
    const ox = 64;
    const oy = 116;
    const e1x = 188;
    const e1y = 116;
    const e2x = 132;
    const e2y = 42;
    const c3x = e1x + (e2x - ox);
    const c3y = e1y + (e2y - oy);

    return `
      <svg class="source-basis-svg" viewBox="0 0 280 156" role="img" aria-label="两个基本方向经过变换后成为矩阵的两列">
        <g class="basis-grid">
          <path d="M40 40H240M40 64H240M40 88H240M40 112H240M40 136H240"></path>
          <path d="M64 28V140M100 28V140M136 28V140M172 28V140M208 28V140"></path>
        </g>
        <g class="basis-axis">
          <path d="M38 ${oy}H246"></path>
          <path d="M${ox} 138V30"></path>
        </g>
        <path class="basis-cell" d="M${ox} ${oy} L${e1x} ${e1y} L${c3x} ${c3y} L${e2x} ${e2y} Z"></path>
        ${softArrow(ox, oy, e1x, e1y, "basis-arrow-one")}
        ${softArrow(ox, oy, e2x, e2y, "basis-arrow-two")}
        <circle class="basis-origin" cx="${ox}" cy="${oy}" r="3.6"></circle>
        <g class="basis-label basis-label-one">
          <rect x="196" y="104" width="44" height="22" rx="11"></rect>
          <text x="218" y="119" text-anchor="middle">Ae₁</text>
        </g>
        <g class="basis-label basis-label-two">
          <rect x="136" y="18" width="44" height="22" rx="11"></rect>
          <text x="158" y="33" text-anchor="middle">Ae₂</text>
        </g>
      </svg>
    `;
  }

  function renderSourceCards() {
    return `
      <div class="matrix-source-grid" aria-label="矩阵的三种来源">
        <article class="matrix-source-card">
          <div class="matrix-source-kicker">图像与数据</div>
          <div class="pixel-matrix-demo" aria-hidden="true">
            <div class="pixel-picture">
              ${pixelColors.map((color) => `<span style="--pixel:${color}"></span>`).join("")}
            </div>
            <span class="source-arrow">→</span>
            <div class="pixel-number-grid">
              ${[92, 78, 54, 31, 18, 84, 70, 49, 36, 25, 76, 61, 46, 33, 21, 65, 53, 40, 27, 14, 58, 47, 35, 24, 12]
                .map((value) => `<span>${value}</span>`)
                .join("")}
            </div>
          </div>
          <h3>像素按行列保存</h3>
          <p>图像可以被离散成像素网格，每个位置保存亮度或颜色通道的数值。</p>
        </article>

        <article class="matrix-source-card">
          <div class="matrix-source-kicker">方程组</div>
          <div class="source-equation">
            ${mathDisplay("\\begin{cases}2x-y=3\\\\x+3y=5\\end{cases}")}
            <span class="source-arrow">→</span>
            ${mathDisplay("\\begin{bmatrix}2&-1\\\\1&3\\end{bmatrix}")}
          </div>
          <h3>系数形成统一对象</h3>
          <p>每一行对应一个方程，每一列对应一个未知量，位置把关系保存下来。</p>
        </article>

        <article class="matrix-source-card matrix-source-card-basis">
          <div class="matrix-source-kicker">方向变化</div>
          <div class="source-basis-stage" aria-hidden="true">
            ${renderBasisFigure()}
          </div>
          <h3>两列记录两个基本方向</h3>
          <p>二维矩阵的第一列和第二列，分别记录 ${mathInline("Ae_1")} 与 ${mathInline("Ae_2")}。</p>
        </article>
      </div>
    `;
  }

  function renderAnatomyMatrix() {
    return anatomyValues
      .flatMap((row, rowIndex) =>
        row.map(
          (value, colIndex) => `
            <button
              class="anatomy-cell"
              type="button"
              data-row="${rowIndex + 1}"
              data-col="${colIndex + 1}"
              data-value="${value}"
              aria-label="第 ${rowIndex + 1} 行第 ${colIndex + 1} 列，数值 ${value}"
            >${value}</button>
          `,
        ),
      )
      .join("");
  }

  function renderEqualityCases() {
    const cases = [
      {
        left: "\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}",
        right: "\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}",
        correct: "equal",
        explanation: "形状相同，对应位置的四个元素也全部相同。",
      },
      {
        left: "\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}",
        right: "\\begin{bmatrix}1&3\\\\2&4\\end{bmatrix}",
        correct: "different",
        explanation: "第二个矩阵交换了两个非对角位置；数字集合相同，位置不同。",
      },
      {
        left: "\\begin{bmatrix}1&2&3\\\\4&5&6\\end{bmatrix}",
        right: "\\begin{bmatrix}1&4\\\\2&5\\\\3&6\\end{bmatrix}",
        correct: "different",
        explanation: `左边是 ${mathInline("2\\times3")}，右边是 ${mathInline("3\\times2")}，形状已经不同。`,
      },
    ];

    return cases
      .map(
        (item, index) => `
          <article class="equality-case" data-equality-case data-correct="${item.correct}">
            <div class="equality-matrices">
              ${mathDisplay(item.left)}
              <span class="equality-symbol" aria-hidden="true">?</span>
              ${mathDisplay(item.right)}
            </div>
            <div class="equality-actions" role="group" aria-label="判断第 ${index + 1} 组矩阵是否相等">
              <button type="button" data-equality-answer="equal">相等</button>
              <button type="button" data-equality-answer="different">不相等</button>
            </div>
            <p class="equality-feedback" aria-live="polite" data-equality-feedback>${item.explanation}</p>
          </article>
        `,
      )
      .join("");
  }

  function renderMatrixTypes() {
    const types = [
      ["行向量", "\\begin{bmatrix}1&2&3\\end{bmatrix}"],
      ["列向量", "\\begin{bmatrix}1\\\\2\\\\3\\end{bmatrix}"],
      ["方阵", "\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}"],
      ["长方形矩阵", "\\begin{bmatrix}1&2&3\\\\4&5&6\\end{bmatrix}"],
      ["零矩阵", "\\begin{bmatrix}0&0\\\\0&0\\end{bmatrix}"],
      ["单位矩阵", "E=\\begin{bmatrix}1&0\\\\0&1\\end{bmatrix}"],
    ];

    return types
      .map(
        ([label, formula]) => `
          <article class="matrix-type-card">
            <span>${label}</span>
            ${mathDisplay(formula)}
          </article>
        `,
      )
      .join("");
  }

  function renderFormal(formal) {
    if (!formal || formal.dataset.sectionOneReady === "true") return;

    formal.innerHTML = `
      <h2>从数字表到有位置的结构</h2>
      <div class="section-one-foundation">
        <p class="section-one-lead">先读清矩阵的行列结构，再理解这些数字怎样来自图像、方程组和方向变化。位置一旦改变，矩阵表达的关系也随之改变。</p>

        <section class="section-one-module" aria-labelledby="matrix-source-title">
          <div class="module-heading">
            <span>01</span>
            <div>
              <h3 id="matrix-source-title">矩阵为什么会出现</h3>
              <p>不同问题使用同一种行列语言保存关系。</p>
            </div>
          </div>
          ${renderSourceCards()}
        </section>

        <section class="section-one-module anatomy-module" aria-labelledby="matrix-anatomy-title">
          <div class="module-heading">
            <span>02</span>
            <div>
              <h3 id="matrix-anatomy-title">矩阵解剖：行、列、阶与元素</h3>
              <p>切换观察方式，再点击矩阵中的任意元素。</p>
            </div>
          </div>
          <div class="anatomy-toolbar" role="group" aria-label="矩阵观察方式">
            <button type="button" class="is-active" data-anatomy-mode="element" aria-pressed="true">看元素</button>
            <button type="button" data-anatomy-mode="row" aria-pressed="false">看行</button>
            <button type="button" data-anatomy-mode="column" aria-pressed="false">看列</button>
          </div>
          <div class="anatomy-lab">
            <div class="anatomy-matrix-shell" aria-label="三行四列矩阵">
              <span class="matrix-bracket matrix-bracket-left" aria-hidden="true"></span>
              <div class="anatomy-matrix" data-anatomy-matrix>${renderAnatomyMatrix()}</div>
              <span class="matrix-bracket matrix-bracket-right" aria-hidden="true"></span>
            </div>
            <aside class="anatomy-readout" aria-live="polite">
              <div class="anatomy-order">${mathDisplay("A\\in\\mathbb{R}^{3\\times4}")}</div>
              <div data-anatomy-formula>${mathDisplay("a_{11}=2")}</div>
              <p data-anatomy-text>数值 2 位于第 1 行、第 1 列；下标先读行，再读列。</p>
            </aside>
          </div>
        </section>

        <section class="section-one-module" aria-labelledby="matrix-equality-title">
          <div class="module-heading">
            <span>03</span>
            <div>
              <h3 id="matrix-equality-title">矩阵相等：先比形状，再比位置</h3>
              <p>同一组数字换了排列，通常就成为另一个矩阵。</p>
            </div>
          </div>
          <div class="equality-grid">${renderEqualityCases()}</div>
        </section>

        <section class="section-one-module" aria-labelledby="matrix-types-title">
          <div class="module-heading">
            <span>04</span>
            <div>
              <h3 id="matrix-types-title">本章会反复出现的基础矩阵</h3>
            </div>
          </div>
          <div class="matrix-type-grid">${renderMatrixTypes()}</div>
        </section>

        <section class="section-one-module" aria-labelledby="shape-machine-title">
          <div class="module-heading">
            <span>05</span>
            <div>
              <h3 id="shape-machine-title">尺寸机器：${mathInline("n")} 个输入坐标，${mathInline("m")} 个输出坐标</h3>
              <p>矩阵的列数对应输入坐标数，行数对应输出坐标数。</p>
            </div>
          </div>
          <div class="shape-machine" data-shape-machine>
            <div class="shape-controls">
              <label><span>输出维数 ${mathInline("m")}</span> <input type="range" min="1" max="4" value="3" data-shape-m /><output data-shape-m-value>3</output></label>
              <label><span>输入维数 ${mathInline("n")}</span> <input type="range" min="1" max="4" value="2" data-shape-n /><output data-shape-n-value>2</output></label>
            </div>
            <div class="shape-flow">
              <div class="shape-port-group">
                <strong data-input-label>2 维输入</strong>
                <div class="shape-ports" data-input-ports></div>
              </div>
              <span class="shape-flow-arrow" aria-hidden="true">→</span>
              <div class="shape-matrix-card">
                <strong data-shape-matrix-label>${mathInline("3\\times2")}</strong>
                <div class="shape-mini-matrix" data-shape-matrix></div>
              </div>
              <span class="shape-flow-arrow" aria-hidden="true">→</span>
              <div class="shape-port-group">
                <strong data-output-label>3 维输出</strong>
                <div class="shape-ports" data-output-ports></div>
              </div>
            </div>
            <p class="shape-explanation" data-shape-explanation aria-live="polite"></p>
          </div>
        </section>

        <div class="column-reading-note">
          <strong>先看列</strong>
          <p>在二维变换中，第一列记录 ${mathInline("Ae_1")}，第二列记录 ${mathInline("Ae_2")}。改动一个元素，只有它所在那一列对应的箭头会移动。</p>
        </div>
      </div>
    `;

    bindAnatomy(formal);
    bindEqualityCases(formal);
    bindShapeMachine(formal);
    formal.dataset.sectionOneReady = "true";
  }

  function bindAnatomy(root) {
    const matrix = root.querySelector("[data-anatomy-matrix]");
    const modeButtons = [...root.querySelectorAll("[data-anatomy-mode]")];
    const formula = root.querySelector("[data-anatomy-formula]");
    const text = root.querySelector("[data-anatomy-text]");
    if (!matrix || !formula || !text) return;

    let mode = "element";
    let selected = matrix.querySelector(".anatomy-cell");

    const update = () => {
      const row = Number(selected?.dataset.row || 1);
      const col = Number(selected?.dataset.col || 1);
      const value = selected?.dataset.value || "";

      matrix.querySelectorAll(".anatomy-cell").forEach((cell) => {
        const sameRow = Number(cell.dataset.row) === row;
        const sameCol = Number(cell.dataset.col) === col;
        cell.classList.toggle("is-selected", cell === selected);
        cell.classList.toggle("is-related", mode === "row" ? sameRow : mode === "column" ? sameCol : false);
        cell.classList.toggle("is-muted", mode === "row" ? !sameRow : mode === "column" ? !sameCol : cell !== selected);
      });

      if (mode === "row") {
        formula.innerHTML = mathDisplay(`R_${row}=\\begin{bmatrix}${anatomyValues[row - 1].join("&")}\\end{bmatrix}`);
        text.textContent = `第 ${row} 行横向读取四个位置，可以对应同一条记录或同一个方程。`;
      } else if (mode === "column") {
        const values = anatomyValues.map((item) => item[col - 1]);
        formula.innerHTML = mathDisplay(`C_${col}=\\begin{bmatrix}${values.join("\\\\")}\\end{bmatrix}`);
        text.textContent = `第 ${col} 列纵向读取三个位置，可以对应同一变量或同一个输入方向。`;
      } else {
        formula.innerHTML = mathDisplay(`a_{${row}${col}}=${value}`);
        text.textContent = `数值 ${value} 位于第 ${row} 行、第 ${col} 列；下标先读行，再读列。`;
      }
    };

    matrix.addEventListener("click", (event) => {
      const cell = event.target.closest(".anatomy-cell");
      if (!cell) return;
      selected = cell;
      update();
    });

    modeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        mode = button.dataset.anatomyMode;
        modeButtons.forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        update();
      });
    });

    update();
  }

  function bindEqualityCases(root) {
    root.querySelectorAll("[data-equality-case]").forEach((card) => {
      const feedback = card.querySelector("[data-equality-feedback]");
      const defaultHtml = feedback?.innerHTML.trim() || "";
      card.querySelectorAll("[data-equality-answer]").forEach((button) => {
        button.addEventListener("click", () => {
          const correct = button.dataset.equalityAnswer === card.dataset.correct;
          card.querySelectorAll("[data-equality-answer]").forEach((item) => {
            item.classList.toggle("is-selected", item === button);
          });
          card.classList.toggle("is-correct", correct);
          card.classList.toggle("is-wrong", !correct);
          if (feedback) feedback.innerHTML = correct ? `判断正确。${defaultHtml}` : "再检查一次：先比较行数和列数，再逐个比较对应位置。";
        });
      });
    });
  }

  function bindShapeMachine(root) {
    const machine = root.querySelector("[data-shape-machine]");
    if (!machine) return;
    const mInput = machine.querySelector("[data-shape-m]");
    const nInput = machine.querySelector("[data-shape-n]");

    const render = () => {
      const m = Number(mInput.value);
      const n = Number(nInput.value);
      machine.querySelector("[data-shape-m-value]").value = m;
      machine.querySelector("[data-shape-n-value]").value = n;
      machine.querySelector("[data-input-label]").textContent = `${n} 维输入`;
      machine.querySelector("[data-output-label]").textContent = `${m} 维输出`;
      machine.querySelector("[data-shape-matrix-label]").innerHTML = mathInline(`${m}\\times${n}`);
      machine.querySelector("[data-input-ports]").innerHTML = Array.from({ length: n }, (_, index) => `<span title="输入坐标 ${index + 1}">${index + 1}</span>`).join("");
      machine.querySelector("[data-output-ports]").innerHTML = Array.from({ length: m }, (_, index) => `<span title="输出坐标 ${index + 1}">${index + 1}</span>`).join("");
      const grid = machine.querySelector("[data-shape-matrix]");
      grid.style.setProperty("--shape-cols", n);
      grid.innerHTML = Array.from({ length: m * n }, () => "<span></span>").join("");
      machine.querySelector("[data-shape-explanation]").innerHTML = `${mathInline(`${m}\\times${n}`)} 矩阵有 ${n} 列，所以接收 ${n} 个输入坐标；它有 ${m} 行，所以产生 ${m} 个输出坐标。`;
    };

    mInput.addEventListener("input", render);
    nInput.addEventListener("input", render);
    render();
  }

  /*
   * §1 lab: one 2×2 table read three ways at once — a data table (店 × 水果),
   * a system of equations (方程 × 未知量) and two directions (Ae₁, Ae₂).
   * Selecting a_ij highlights the same entry in all three readings; changing it
   * moves only the arrow of column j, along coordinate i.
   */
  const ROWS = ["甲店", "乙店"];
  const COLS = ["苹果", "梨"];
  const SUB = ["₁", "₂"];

  function renderThreeReadings(root) {
    if (!root) return undefined;
    // col: a whole column picked from a column title (null while a single entry is picked)
    const state = { A: [[2, 1], [1, 3]], sel: [1, 0], ghost: null, col: null };
    root.innerHTML = `<h2>交互实验</h2>
      <section class="ch3l-lab ml1-lab">
        <header class="ch3l-head"><h3>同一张表，三种读法</h3><p>下面三处用的是同一个矩阵 ${mathInline("A")}。点 ${mathInline("A")} 中的一个元素，三处会同时标出它；选中后可以改它的值（0 到 4）。点列标题，三处同时标出这一整列。</p></header>
        <div data-ml1-gate></div>
        <div class="ml1-control">
          <div class="ml1-matrix" role="group" aria-label="矩阵 A 的元素"><b class="ml1-name">${mathInline("A=")}</b><div class="ml1-colwrap"><div class="ml1-colheads" data-ml1-colheads></div><div class="ml1-cells" data-ml1-cells></div></div></div>
          <div class="ml1-stepper"><b data-ml1-selname></b><button type="button" class="ch3l-btn" data-ml1-step="-1" aria-label="减 1">−1</button><button type="button" class="ch3l-btn is-primary" data-ml1-step="1" aria-label="加 1">+1</button></div>
        </div>
        <div class="ml1-views">
          <figure class="ml1-view"><figcaption>数据表：行是店，列是水果（箱）</figcaption><div data-ml1-table></div></figure>
          <figure class="ml1-view"><figcaption>方程组：行是方程，列是未知量</figcaption><div class="ml1-eqs" data-ml1-eqs></div></figure>
          <figure class="ml1-view ml1-plane"><figcaption>平面：第 ${mathInline("j")} 列是 ${mathInline("Ae_j")} 的坐标</figcaption><canvas aria-label="Ae₁ 与 Ae₂"></canvas></figure>
        </div>
        <div class="ch3l-card ml1-readout" data-ml1-readout></div>
      </section>`;
    const lab = root.querySelector(".ml1-lab");
    const canvas = lab.querySelector("canvas");
    const cells = lab.querySelector("[data-ml1-cells]");
    const tableBox = lab.querySelector("[data-ml1-table]");
    const eqs = lab.querySelector("[data-ml1-eqs]");
    const readout = lab.querySelector("[data-ml1-readout]");
    const selName = lab.querySelector("[data-ml1-selname]");
    let revealed = false;

    const isSel = (i, j) => state.sel[0] === i && state.sel[1] === j;
    const cls = (i, j) => `ml1-c${j + 1}${state.col === null && isSel(i, j) ? " is-sel" : ""}${state.col === j ? " is-col" : ""}`;
    const colHead = (j, text) => `<button type="button" class="ml1-colhead ml1-c${j + 1}${state.col === j ? " is-col" : ""}" data-ml1-col="${j}" aria-pressed="${state.col === j}">${text}</button>`;

    function paintDom() {
      const [si, sj] = state.sel;
      const A = state.A;
      cells.innerHTML = A.map((r, i) => r.map((v, j) => `<button type="button" class="${cls(i, j)}" data-ml1-cell="${i}${j}" aria-pressed="${isSel(i, j)}">${v}</button>`).join("")).join("");
      selName.innerHTML = mathInline(`a_{${si + 1}${sj + 1}}=${A[si][sj]}`);
      lab.querySelector("[data-ml1-colheads]").innerHTML = [0, 1].map((j) => colHead(j, `第 ${j + 1} 列`)).join("");
      tableBox.innerHTML = `<table class="ml1-table"><thead><tr><th></th>${COLS.map((c, j) => `<th>${colHead(j, c)}</th>`).join("")}</tr></thead><tbody>${A.map((r, i) => `<tr><th>${ROWS[i]}</th>${r.map((v, j) => `<td class="${cls(i, j)}">${v}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
      eqs.innerHTML = A.map((r, i) => `<p>${r.map((v, j) => `${j ? " + " : ""}<b class="${cls(i, j)}">${v}</b>${mathInline(`x_${j + 1}`)}`).join("")} = ${mathInline(`b_${i + 1}`)}</p>`).join("");
      const v = A[si][sj];
      const cj = state.col;
      readout.innerHTML = cj !== null
        ? `<div class="ml1-head"><b>第 ${cj + 1} 列的三种读法</b><strong>${mathInline(`Ae_${cj + 1}=(${A[0][cj]},${A[1][cj]})`)}</strong></div><ul class="ml1-list"><li>数据表：两家店卖出的${COLS[cj]}，${A[0][cj]} 箱与 ${A[1][cj]} 箱。</li><li>方程组：两个方程中 ${mathInline(`x_${cj + 1}`)} 的系数。</li><li>平面：箭头 ${mathInline(`Ae_${cj + 1}`)} 的横、纵坐标。</li></ul>`
        : revealed
        ? `<div class="ml1-head"><b>${mathInline(`a_{${si + 1}${sj + 1}}`)} 的三种读法</b><strong>${v}</strong></div><ul class="ml1-list"><li>数据表：${ROWS[si]}卖出${COLS[sj]} ${v} 箱。</li><li>方程组：第 ${si + 1} 个方程中 ${mathInline(`x_${sj + 1}`)} 的系数。</li><li>平面：${mathInline(`Ae_${sj + 1}`)} 的第 ${si + 1} 个坐标（${si === 0 ? "横" : "纵"}坐标）。</li></ul>`
        : `<div class="ml1-head"><b>选中的元素</b><strong>${mathInline(`a_{${si + 1}${sj + 1}}=${v}`)}</strong></div><p>位于第 ${si + 1} 行、第 ${sj + 1} 列。下标先读行，再读列。</p>`;
      lab.querySelector('[data-ml1-step="-1"]').disabled = !gate?.picked || v <= 0;
      const plus = lab.querySelector('[data-ml1-step="1"]');
      if (gate?.picked) plus.disabled = v >= 4;
      cells.querySelectorAll("[data-ml1-cell]").forEach((b) => b.addEventListener("click", () => {
        state.sel = [Number(b.dataset.ml1Cell[0]), Number(b.dataset.ml1Cell[1])];
        state.ghost = null;
        state.col = null;
        paint();
      }));
      lab.querySelectorAll("[data-ml1-col]").forEach((b) => b.addEventListener("click", () => {
        const j = Number(b.dataset.ml1Col);
        state.col = state.col === j ? null : j;
        paint();
      }));
    }

    function draw() {
      if (!canvas.isConnected) { ro?.disconnect(); mo?.disconnect(); return; }
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; }
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const st = getComputedStyle(canvas);
      const col = (n, fb) => st.getPropertyValue(n).trim() || fb;
      const C = { v1: col("--cv-v1", "#2a64a8"), v2: col("--cv-v2", "#c4552f"), axis: col("--cv-axis", "#8a8d84"), grid: col("--cv-grid-major", "#e2ddd0"), paper: col("--cv-paper", "#fdfcf8") };
      ctx.fillStyle = C.paper; ctx.fillRect(0, 0, w, h);
      const lo = -1.1;
      const hi = 4.6;
      const s = Math.min(w, h) / (hi - lo);
      const ox = (w - (hi - lo) * s) / 2;
      const oy = (h - (hi - lo) * s) / 2;
      const P = (x, y) => [ox + (x - lo) * s, h - oy - (y - lo) * s];
      ctx.lineWidth = 1; ctx.strokeStyle = C.grid;
      for (let k = 0; k <= 4; k += 1) {
        ctx.beginPath(); ctx.moveTo(...P(k, lo)); ctx.lineTo(...P(k, hi)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(...P(lo, k)); ctx.lineTo(...P(hi, k)); ctx.stroke();
      }
      ctx.strokeStyle = C.axis;
      ctx.beginPath(); ctx.moveTo(...P(lo, 0)); ctx.lineTo(...P(hi, 0)); ctx.moveTo(...P(0, lo)); ctx.lineTo(...P(0, hi)); ctx.stroke();
      ctx.fillStyle = C.axis; ctx.font = "12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      for (let k = 1; k <= 4; k += 1) { const [x, y] = P(k, 0); ctx.fillText(String(k), x - 3, y + 14); const [x2, y2] = P(0, k); ctx.fillText(String(k), x2 - 12, y2 + 4); }
      const arrow = (x, y, color, label, opts = {}) => {
        const [x0, y0] = P(0, 0);
        const [x1, y1] = P(x, y);
        if (x === 0 && y === 0) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x0, y0, 4, 0, Math.PI * 2); ctx.fill(); return; }
        const a = Math.atan2(y1 - y0, x1 - x0);
        ctx.save();
        if (opts.ghost) { ctx.globalAlpha = 0.35; ctx.setLineDash([5, 4]); }
        if (opts.focus) {
          // glow: the same colour, faint and wide (canvas strokeStyle does not take color-mix)
          ctx.strokeStyle = color; ctx.globalAlpha = 0.18; ctx.lineWidth = 9; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
          ctx.globalAlpha = opts.ghost ? 0.35 : 1;
        }
        ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w < 360 ? 3.6 : 2.4; ctx.lineCap = "butt";
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * 9, y1 - Math.sin(a) * 9); ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(a - 0.42) * 10, y1 - Math.sin(a - 0.42) * 10); ctx.lineTo(x1 - Math.cos(a + 0.42) * 10, y1 - Math.sin(a + 0.42) * 10); ctx.closePath(); ctx.fill();
        if (label && opts.ghost) {
          // the ghost is named below its tip, away from the current arrow's label
          ctx.globalAlpha = 0.7; ctx.font = "italic 600 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif"; ctx.fillText(label, x1 + 6, y1 + 16);
        } else if (label) { ctx.font = "italic 600 14px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif"; ctx.fillText(label, x1 + 6, y1 - 6); }
        ctx.restore();
      };
      const A = state.A;
      // the arrow before the last edit, unless the edit left it where it was
      const g = state.ghost;
      if (g && (g.x !== state.A[0][g.j] || g.y !== state.A[1][g.j])) arrow(g.x, g.y, g.j === 0 ? C.v1 : C.v2, `改前 Ae${SUB[g.j]}`, { ghost: true });
      const [si, sj] = state.sel;
      const ex = A[0][sj];
      const ey = A[1][sj];
      const color = sj === 0 ? C.v1 : C.v2;
      if (revealed && state.col === null) {
        // coordinate i of Ae_j: the dashed drop line and the segment on axis i
        ctx.save();
        ctx.strokeStyle = C.axis; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(...P(ex, ey)); ctx.lineTo(...(si === 0 ? P(ex, 0) : P(0, ey))); ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = color; ctx.globalAlpha = 0.28; ctx.lineWidth = 7; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(...P(0, 0)); ctx.lineTo(...(si === 0 ? P(ex, 0) : P(0, ey))); ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.fillStyle = color; ctx.font = "italic 600 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
        // the label sits outside the first quadrant, away from the arrows
        const lab2 = `a${SUB[si]}${SUB[sj]}`;
        const tw = ctx.measureText(lab2).width;
        const [lx, ly] = si === 0 ? P(ex / 2, 0) : P(0, ey / 2);
        if (si === 0) ctx.fillText(lab2, lx - tw / 2, ly + 30); else ctx.fillText(lab2, lx - tw - 18, ly + 4);
        ctx.restore();
      }
      [0, 1].forEach((j) => arrow(A[0][j], A[1][j], j === 0 ? C.v1 : C.v2, state.col === j ? `Ae${SUB[j]} = (${A[0][j]}, ${A[1][j]})` : `Ae${SUB[j]}`, { focus: state.col === null ? revealed && j === sj : j === state.col }));
    }

    function paint() { paintDom(); draw(); gate?.relock(); if (gate?.picked) { const v = state.A[state.sel[0]][state.sel[1]]; lab.querySelector('[data-ml1-step="1"]').disabled = v >= 4; } }

    lab.querySelectorAll("[data-ml1-step]").forEach((b) => b.addEventListener("click", () => {
      if (!gate?.picked) return;
      const [i, j] = state.sel;
      state.col = null;
      const next = Math.max(0, Math.min(4, state.A[i][j] + Number(b.dataset.ml1Step)));
      if (next === state.A[i][j]) return;
      state.ghost = { j, x: state.A[0][j], y: state.A[1][j] };
      state.A[i][j] = next;
      if (i === 1 && j === 0) { revealed = true; gate.acted(); }
      paint();
    }));

    const gate = window.LAPredictGate?.mount(lab.querySelector("[data-ml1-gate]"), {
      root: lab,
      manual: true,
      key: "visuals/ch4/section1-presentation.js#three-readings",
      question: `把 ${mathInline("a_{21}")} 从 1 改成 2。平面里哪个箭头会动，往哪个方向动？`,
      options: [
        [`${mathInline("Ae_1")} 向上移动一格`, true, ""],
        [`${mathInline("Ae_2")} 向上移动一格`, false, "a₂₁ 在第 1 列，第 1 列记录的是 Ae₁，Ae₂ 没有动。"],
        [`${mathInline("Ae_1")} 向右移动一格`, false, "a₂₁ 在第 2 行，它是 Ae₁ 的第 2 个坐标，也就是纵坐标。"],
        ["两个箭头都动", false, "一个元素只属于一列，只有这一列对应的箭头会动。"],
      ],
      right: `✓ ${mathInline("a_{21}")} 在第 1 列，所以属于 ${mathInline("Ae_1")}；在第 2 行，所以是纵坐标。同一个位置 ${mathInline("(i,j)")} 在数据表里是第 ${mathInline("i")} 家店的第 ${mathInline("j")} 种水果，在方程组里是第 ${mathInline("i")} 个方程中 ${mathInline("x_j")} 的系数。行和列的位置一旦定下，三种读法就同时定下。`,
      onPick: () => { state.sel = [1, 0]; state.ghost = null; paint(); },
    });

    let ro = new ResizeObserver(() => draw());
    ro.observe(canvas);
    let mo = new MutationObserver(() => draw());
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    paint();
    return () => { ro.disconnect(); mo.disconnect(); };
  }

  window.defineChapter4Renderer?.("matrix-language", {
    formal: renderFormal,
    interactive: renderThreeReadings,
  });
})();
