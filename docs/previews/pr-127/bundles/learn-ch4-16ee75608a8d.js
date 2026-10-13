
;/* visuals/ch4/section1-presentation.js */
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


;/* visuals/ch4/section2-presentation.js */
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
        <span class="s2-operation-label">${mathInline(label)}</span>
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
            <div class="s2-chip-bar" role="group" aria-label="选择矩阵运算">
              <button type="button" class="is-active" data-basic-mode="add" aria-pressed="true">${mathInline("A+B")}</button>
              <button type="button" data-basic-mode="scale" aria-pressed="false">${mathInline("2A")}</button>
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
              <p>行变列，形状从 ${mathInline("m\\times n")} 变为 ${mathInline("n\\times m")}；元素本身不改变。</p>
            </div>
          </div>
          <div class="s2-transpose-lab" data-s2-transpose-lab>
            <div class="s2-transpose-toolbar">
              <div class="s2-chip-bar" role="group" aria-label="选择转置示例">
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
                <span data-transpose-name>${mathInline("A")}</span>
                <strong data-transpose-shape>${mathInline("2\\times3")}</strong>
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
              <label><span>${mathInline("A")} 的行数 ${mathInline("m")}</span><select data-size="m">${[1, 2, 3, 4].map((n) => `<option${n === 2 ? " selected" : ""}>${n}</option>`).join("")}</select></label>
              <label><span>${mathInline("A")} 的列数 ${mathInline("n")}</span><select data-size="n">${[1, 2, 3, 4].map((n) => `<option${n === 3 ? " selected" : ""}>${n}</option>`).join("")}</select></label>
              <label><span>${mathInline("B")} 的行数 ${mathInline("r")}</span><select data-size="r">${[1, 2, 3, 4].map((n) => `<option${n === 3 ? " selected" : ""}>${n}</option>`).join("")}</select></label>
              <label><span>${mathInline("B")} 的列数 ${mathInline("p")}</span><select data-size="p">${[1, 2, 3, 4].map((n) => `<option${n === 2 ? " selected" : ""}>${n}</option>`).join("")}</select></label>
            </div>
            <div class="s2-gate-stage">
              <div class="s2-dimension-card"><span>${mathInline("A")}</span><strong data-size-a>${mathInline("2\\times3")}</strong></div>
              <div class="s2-gate-symbol" data-gate-symbol aria-hidden="true">×</div>
              <div class="s2-dimension-card"><span>${mathInline("B")}</span><strong data-size-b>${mathInline("3\\times2")}</strong></div>
              <div class="s2-gate-equals is-open" data-gate-eq aria-hidden="true" title="等于">=</div>
              <div class="s2-dimension-card is-result" data-size-result-card><span>${mathInline("AB")}</span><strong data-size-result>${mathInline("2\\times2")}</strong></div>
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
              <div class="s2-machine-line"><strong>${mathInline("A")}</strong><i>→ ${mathInline("E")} →</i><strong>${mathInline("A")}</strong></div>
              <p>${mathInline("EA=A")} 与 ${mathInline("AE=A")} 都表示穿过一个不改变对象的过程。</p>
            </article>
            <article class="s2-law-card">
              <span class="s2-card-kicker">结合律</span>
              <div class="s2-packaging-line"><span>${mathInline("(AB)C")}</span><i>=</i><span>${mathInline("A(BC)")}</span></div>
              <p>括号只改变先把哪两步打包；从输入出发，实际经过 ${mathInline("C")}、${mathInline("B")}、${mathInline("A")} 的顺序不变。</p>
            </article>
            <article class="s2-law-card">
              <span class="s2-card-kicker">通常不交换</span>
              <div class="s2-compare-matrices">${mathInline("AB=\\begin{bmatrix}2&2\\\\0&1\\end{bmatrix}")}<i>≠</i>${mathInline("BA=\\begin{bmatrix}2&1\\\\0&1\\end{bmatrix}")}</div>
              <p>交换矩阵会交换过程顺序；某些特殊矩阵可以交换，但不能默认成立。</p>
            </article>
          </div>
          <div class="s2-side-preview">
            <div><span>左乘 ${mathInline("PA")}</span><strong>${mathInline("PA")} 的每一行是 ${mathInline("A")} 的各行的组合</strong></div>
            <div><span>右乘 ${mathInline("AP")}</span><strong>${mathInline("AP")} 的每一列是 ${mathInline("A")} 的各列的组合</strong></div>
            <p>${mathInline("P")} 取初等矩阵时，左乘就是对 ${mathInline("A")} 做一次初等行变换，右乘就是做一次初等列变换。</p>
          </div>
        </section>

        <section class="s2-module s2-extension-module" aria-labelledby="s2-extension-title">
          <div class="s2-module-heading">
            <span>05</span>
            <div>
              <h3 id="s2-extension-title">延伸观察</h3>
            </div>
          </div>
          <div class="s2-extension-grid">
            <details><summary>矩阵幂：重复同一个过程</summary><p>${mathInline("A^kx")} 表示连续施加 ${mathInline("k")} 次 ${mathInline("A")}；结合律保证可以按不同方式分组计算。</p></details>
            <details><summary>非零矩阵也可能乘出零矩阵</summary><p>${mathInline("B")} 可以先把所有输入送入某个方向，而 ${mathInline("A")} 恰好把这个方向全部消掉，于是 ${mathInline("A")}、${mathInline("B")} 都非零但 ${mathInline("AB=0")}。</p></details>
            <details><summary>邻接矩阵的幂可以计数路径</summary><p>在网络中，${mathInline("(M^k)_{ij}")} 可以记录从节点 ${mathInline("i")} 到节点 ${mathInline("j")} 的 ${mathInline("k")} 步路径数量；它体现“连续 ${mathInline("k")} 步”的复合含义。</p></details>
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
      name.innerHTML = mathInline(flipped ? "A^T" : "A");
      shape.innerHTML = mathInline(`${rows}\\times${cols}`);
      toggle.innerHTML = flipped ? `翻折回 ${mathInline("A")}` : "沿主对角线翻折";
      readout.innerHTML = flipped
        ? `${mathInline("a_{ij}")} 已移动到 ${mathInline("a_{ji}")}；当前显示 ${mathInline(`A^T=${matrixTex(shown)}`)}。`
        : `当前显示 ${mathInline(`A=${matrixTex(original)}`)}；翻折后第 ${mathInline("i")} 行会成为第 ${mathInline("i")} 列。`;
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
      gate.querySelector("[data-size-a]").innerHTML = mathInline(`${m}\\times${n}`);
      gate.querySelector("[data-size-b]").innerHTML = mathInline(`${r}\\times${p}`);
      gate.querySelector("[data-size-result]").innerHTML = open ? mathInline(`${m}\\times${p}`) : "—";
      gate.querySelector("[data-size-result-card]").classList.toggle("is-blocked", !open);
      const eq = gate.querySelector("[data-gate-eq]");
      if (eq) {
        eq.textContent = open ? "=" : "≠";
        eq.classList.toggle("is-open", open);
      }
      gate.classList.toggle("is-open", open);
      gate.querySelector("[data-size-message]").innerHTML = open
        ? `<strong>闸门打开：</strong>${mathInline("A")} 的列数 ${n} 与 ${mathInline("B")} 的行数 ${r} 匹配，结果保留外侧尺寸 ${mathInline(`${m}\\times${p}`)}。`
        : `<strong>闸门关闭：</strong>${mathInline("A")} 的列数是 ${n}，${mathInline("B")} 的行数是 ${r}，中间尺寸无法配对。`;
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


;/* visuals/ch4/section2-continuous.js */
(() => {
  const MODEL = Object.freeze({
    A: [
      [2, 0],
      [0, 1],
    ],
    B: [
      [1, 1],
      [0, 1],
    ],
    AB: [
      [2, 2],
      [0, 1],
    ],
    BA: [
      [2, 1],
      [0, 1],
    ],
    I: [
      [1, 0],
      [0, 1],
    ],
    x: [1, 1],
  });

  /** @type {WeakMap<HTMLCanvasElement, { raf?: number, resolve?: (v?: unknown) => void }>} */
  const animationState = new WeakMap();
  /** @type {WeakMap<HTMLCanvasElement, number[][]>} */
  const currentMatrices = new WeakMap();
  /** @type {WeakMap<HTMLElement, { destroy: () => void }>} */
  const liveLabs = new WeakMap();
  /** @type {Set<HTMLElement>} */
  const activeRoots = new Set();

  let globalResizeBound = false;
  let globalThemeBound = false;

  const texInline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const texDisplay = (source) => (window.texDisplay ? window.texDisplay(source) : `<code>${source}</code>`);

  function multiplyMatrixVector(matrix, vector) {
    return [
      matrix[0][0] * vector[0] + matrix[0][1] * vector[1],
      matrix[1][0] * vector[0] + matrix[1][1] * vector[1],
    ];
  }

  function interpolateMatrix(from, to, t) {
    return from.map((row, i) => row.map((value, j) => value + (to[i][j] - value) * t));
  }

  function interpolateVector(from, to, t) {
    return from.map((value, i) => value + (to[i] - value) * t);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  }

  function reducedMotion() {
    return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
  }

  function matrixTex(matrix) {
    return `\\begin{bmatrix}${matrix.map((row) => row.join("&")).join("\\\\")}\\end{bmatrix}`;
  }

  function vectorTex(vector) {
    return `\\begin{bmatrix}${vector.join("\\\\")}\\end{bmatrix}`;
  }

  function formatNumber(value) {
    const rounded = Math.round(value * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  }

  function matrixCellGrid(matrix, id, buttons = false) {
    return `<div class="s2c-matrix" data-s2c-matrix="${id}" style="--s2c-cols:${matrix[0].length}">${matrix
      .flatMap((row, rowIndex) =>
        row.map((value, colIndex) => {
          const attrs = `data-row="${rowIndex}" data-col="${colIndex}"`;
          return buttons
            ? `<button type="button" ${attrs} data-s2c-result aria-label="计算第 ${rowIndex + 1} 行第 ${colIndex + 1} 列">${value}</button>`
            : `<span ${attrs}>${value}</span>`;
        }),
      )
      .join("")}</div>`;
  }

  function getPalette() {
    const styles = getComputedStyle(document.body);
    return {
      text: styles.getPropertyValue("--text").trim() || "#10211d",
      muted: styles.getPropertyValue("--muted").trim() || "#68736f",
      line: styles.getPropertyValue("--cv-axis").trim() || "#8a8d84",
      /* transformed grid and cells are results; the two columns are v1 / v2 */
      teal: styles.getPropertyValue("--cv-image").trim() || "#8c4f86",
      tealStrong: styles.getPropertyValue("--cv-image").trim() || "#8c4f86",
      v1: styles.getPropertyValue("--cv-v1").trim() || "#2a64a8",
      coral: styles.getPropertyValue("--cv-v2").trim() || "#c4552f",
      blue: styles.getPropertyValue("--cv-image").trim() || "#8c4f86",
    };
  }

  function setupCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const metrics = canvas._s2cMetrics || { w: 0, h: 0, dpr: 0 };
    if (metrics.w !== width || metrics.h !== height || metrics.dpr !== dpr) {
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas._s2cMetrics = { w: width, h: height, dpr };
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return { ctx, width, height };
  }

  function pointFor(matrix, x, y, origin, scale) {
    const tx = matrix[0][0] * x + matrix[0][1] * y;
    const ty = matrix[1][0] * x + matrix[1][1] * y;
    return { x: origin.x + tx * scale, y: origin.y - ty * scale };
  }

  function drawLine(ctx, from, to, color, width = 1, alpha = 1) {
    if (!Number.isFinite(from.x + from.y + to.x + to.y)) return;
    if (Math.hypot(to.x - from.x, to.y - from.y) < 0.4) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.restore();
  }

  function drawArrow(ctx, from, to, color, label, width = 3) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy);
    if (length < 3.5) return;
    const angle = Math.atan2(dy, dx);
    const head = Math.min(10, Math.max(6.5, length * 0.14));
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - head * Math.cos(angle - Math.PI / 6.5), to.y - head * Math.sin(angle - Math.PI / 6.5));
    ctx.quadraticCurveTo(
      to.x - head * 0.35 * Math.cos(angle),
      to.y - head * 0.35 * Math.sin(angle),
      to.x - head * Math.cos(angle + Math.PI / 6.5),
      to.y - head * Math.sin(angle + Math.PI / 6.5),
    );
    ctx.closePath();
    ctx.fill();
    if (label) {
      ctx.font = "700 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      const maxX = (ctx.canvas.clientWidth || 400) - 40;
      ctx.fillText(label, Math.min(to.x + 8, maxX), Math.max(to.y - 8, 16));
    }
    ctx.restore();
  }

  function drawTransformScene(canvas, matrix, options = {}) {
    if (!canvas) return;
    currentMatrices.set(canvas, matrix);
    canvas._s2cDrawOptions = options;
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const origin = { x: width * 0.5, y: height * 0.56 };
    const scale = Math.min(width, height) / 8.6;
    const halfW = width / (2 * scale);
    const halfH = height / (2 * scale);
    const screenReach = Math.hypot(halfW, halfH) + 1.2;
    const col1Len = Math.hypot(matrix[0][0], matrix[1][0]);
    const col2Len = Math.hypot(matrix[0][1], matrix[1][1]);
    const minCol = Math.max(Math.min(col1Len || 0, col2Len || 0), 0);
    const maxCol = Math.max(col1Len, col2Len, 0);
    const allZero = maxCol < 1e-8;
    const domainReach = Math.min(48, Math.max(screenReach + 2, screenReach / Math.max(minCol || maxCol, 0.14) + 2));

    const refX = halfW + 1.4;
    const refY = halfH + 1.4;
    for (let i = Math.floor(-refY); i <= Math.ceil(refY); i += 1) {
      const isAxis = i === 0;
      drawLine(
        ctx,
        { x: origin.x - refX * scale, y: origin.y - i * scale },
        { x: origin.x + refX * scale, y: origin.y - i * scale },
        palette.line,
        isAxis ? 1.15 : 1,
        isAxis ? 0.26 : 0.09,
      );
    }
    for (let i = Math.floor(-refX); i <= Math.ceil(refX); i += 1) {
      const isAxis = i === 0;
      drawLine(
        ctx,
        { x: origin.x + i * scale, y: origin.y - refY * scale },
        { x: origin.x + i * scale, y: origin.y + refY * scale },
        palette.line,
        isAxis ? 1.15 : 1,
        isAxis ? 0.26 : 0.09,
      );
    }

    if (!allZero) {
      const iMin = Math.floor(-domainReach);
      const iMax = Math.ceil(domainReach);
      for (let i = iMin; i <= iMax; i += 1) {
        const isAxis = i === 0;
        drawLine(
          ctx,
          pointFor(matrix, -domainReach, i, origin, scale),
          pointFor(matrix, domainReach, i, origin, scale),
          isAxis ? palette.tealStrong : palette.teal,
          isAxis ? 1.3 : 1.05,
          isAxis ? 0.4 : 0.26,
        );
        drawLine(
          ctx,
          pointFor(matrix, i, -domainReach, origin, scale),
          pointFor(matrix, i, domainReach, origin, scale),
          isAxis ? palette.tealStrong : palette.teal,
          isAxis ? 1.3 : 1.05,
          isAxis ? 0.4 : 0.26,
        );
      }
    }

    const p00 = pointFor(matrix, 0, 0, origin, scale);
    const p10 = pointFor(matrix, 1, 0, origin, scale);
    const p11 = pointFor(matrix, 1, 1, origin, scale);
    const p01 = pointFor(matrix, 0, 1, origin, scale);
    const cellArea = Math.abs((p10.x - p00.x) * (p01.y - p00.y) - (p01.x - p00.x) * (p10.y - p00.y));
    if (cellArea > 2) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p00.x, p00.y);
      ctx.lineTo(p10.x, p10.y);
      ctx.lineTo(p11.x, p11.y);
      ctx.lineTo(p01.x, p01.y);
      ctx.closePath();
      ctx.fillStyle = palette.teal;
      ctx.globalAlpha = 0.1;
      ctx.fill();
      ctx.globalAlpha = 0.36;
      ctx.strokeStyle = palette.tealStrong;
      ctx.lineWidth = 1.45;
      ctx.stroke();
      ctx.restore();
    }

    drawArrow(ctx, origin, pointFor(matrix, 1, 0, origin, scale), palette.v1, options.firstLabel || "Ae₁", 3);
    drawArrow(ctx, origin, pointFor(matrix, 0, 1, origin, scale), palette.coral, options.secondLabel || "Ae₂", 3);

    // trail: the points x has already reached (plane coordinates), kept as dashed ghosts
    // and joined by a dotted path that ends at the current tip
    if (options.vector !== false && Array.isArray(options.trail) && options.trail.length) {
      const toScreen = ([px, py]) => ({ x: origin.x + px * scale, y: origin.y - py * scale });
      const tip = pointFor(matrix, MODEL.x[0], MODEL.x[1], origin, scale);
      ctx.save();
      ctx.strokeStyle = palette.blue;
      ctx.fillStyle = palette.blue;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.35;
      ctx.setLineDash([6, 5]);
      options.trail.forEach((point) => {
        const p = toScreen(point.at);
        if (Math.hypot(p.x - tip.x, p.y - tip.y) < 4) return;
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      });
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      options.trail.forEach((point, i) => {
        const p = toScreen(point.at);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.lineTo(tip.x, tip.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = "italic 600 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      options.trail.forEach((point) => {
        const p = toScreen(point.at);
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
        ctx.fill();
        if (point.label && Math.hypot(p.x - tip.x, p.y - tip.y) >= 4) {
          ctx.globalAlpha = 0.75;
          const [dx, dy] = point.offset || [-8, -10];
          ctx.fillText(point.label, p.x + dx, p.y + dy);
        }
      });
      ctx.restore();
    }

    if (options.vector !== false) {
      drawArrow(
        ctx,
        origin,
        pointFor(matrix, MODEL.x[0], MODEL.x[1], origin, scale),
        palette.blue,
        options.vectorLabel || "Mx",
        3.2,
      );
    }

    ctx.save();
    ctx.fillStyle = palette.text;
    ctx.globalAlpha = 0.74;
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, allZero ? 4 : 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function cancelCanvasAnimation(canvas) {
    if (!canvas) return;
    const state = animationState.get(canvas);
    if (state?.raf) cancelAnimationFrame(state.raf);
    const resolve = state?.resolve;
    animationState.delete(canvas);
    if (resolve) resolve();
  }

  function animateCanvasSequence(canvas, keyframes, options = {}) {
    cancelCanvasAnimation(canvas);
    const duration = options.duration || 700;
    const pause = options.pause ?? 220;
    const baseDraw = options.drawOptions || {};
    const onStage = typeof options.onStage === "function" ? options.onStage : null;
    const stageDraw = typeof options.stageDrawOptions === "function" ? options.stageDrawOptions : null;

    if (reducedMotion() || keyframes.length < 2) {
      const final = keyframes[keyframes.length - 1];
      const finalStage = keyframes.length - 1;
      drawTransformScene(canvas, final.matrix, stageDraw?.(finalStage, finalStage) || baseDraw);
      onStage?.(finalStage, final, 1);
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let index = 0;
      let segmentStart = 0;
      let pauseUntil = 0;
      let activeStage = 0;

      // second argument: index of the last keyframe already reached
      const drawOpts = () => stageDraw?.(activeStage, index) || baseDraw;

      const frame = (now) => {
        const state = animationState.get(canvas);
        if (!state || state.resolve !== resolve) return;

        const current = keyframes[index];
        const next = keyframes[index + 1];
        if (!next) {
          drawTransformScene(canvas, current.matrix, drawOpts());
          onStage?.(index, current, 1);
          animationState.delete(canvas);
          resolve();
          return;
        }

        if (!segmentStart) {
          segmentStart = now;
          activeStage = index;
          onStage?.(index, current, 0);
        }

        if (pauseUntil) {
          if (now < pauseUntil) {
            state.raf = requestAnimationFrame(frame);
            return;
          }
          pauseUntil = 0;
          segmentStart = now;
        }

        const t = Math.min(1, (now - segmentStart) / duration);
        const eased = easeInOutCubic(t);
        // Prefer destination stage labels once past half of the segment.
        activeStage = t >= 0.55 ? index + 1 : index;
        drawTransformScene(canvas, interpolateMatrix(current.matrix, next.matrix, eased), drawOpts());

        if (t >= 1) {
          index += 1;
          segmentStart = 0;
          activeStage = index;
          onStage?.(index, keyframes[index], 1);
          if (index < keyframes.length - 1 && pause > 0) pauseUntil = now + pause;
        }
        state.raf = requestAnimationFrame(frame);
      };

      animationState.set(canvas, { resolve, raf: requestAnimationFrame(frame) });
    });
  }

  function drawColumnScene(canvas, t) {
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const origin = { x: width * 0.48, y: height * 0.7 };
    const scale = Math.min(width, height) / 5.4;
    const v1 = interpolateVector([1, 0], [2, 0], t);
    const v2 = interpolateVector([1, 1], [2, 1], t);
    const toPoint = (vector) => ({ x: origin.x + vector[0] * scale, y: origin.y - vector[1] * scale });

    for (let i = -5; i <= 5; i += 1) {
      const isAxis = i === 0;
      drawLine(
        ctx,
        { x: origin.x - 5 * scale, y: origin.y - i * scale },
        { x: origin.x + 5 * scale, y: origin.y - i * scale },
        palette.line,
        isAxis ? 1.15 : 1,
        isAxis ? 0.24 : 0.08,
      );
      drawLine(
        ctx,
        { x: origin.x + i * scale, y: origin.y - 5 * scale },
        { x: origin.x + i * scale, y: origin.y + 5 * scale },
        palette.line,
        isAxis ? 1.15 : 1,
        isAxis ? 0.24 : 0.08,
      );
    }

    const p0 = toPoint([0, 0]);
    const p1 = toPoint(v1);
    const p2 = toPoint([v1[0] + v2[0], v1[1] + v2[1]]);
    const p3 = toPoint(v2);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
    ctx.fillStyle = palette.teal;
    ctx.globalAlpha = 0.1;
    ctx.fill();
    ctx.globalAlpha = 0.34;
    ctx.strokeStyle = palette.tealStrong;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();

    const label1 = t < 0.08 ? "b₁" : t > 0.92 ? "Ab₁" : "列₁";
    const label2 = t < 0.08 ? "b₂" : t > 0.92 ? "Ab₂" : "列₂";
    drawArrow(ctx, origin, p1, palette.v1, label1, 3.2);
    drawArrow(ctx, origin, p3, palette.coral, label2, 3.2);

    ctx.save();
    ctx.fillStyle = palette.text;
    ctx.globalAlpha = 0.74;
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function animateColumns(canvas, readout, target = 1) {
    cancelCanvasAnimation(canvas);
    const from = Number(canvas.dataset.progress || 0);
    if (reducedMotion()) {
      canvas.dataset.progress = String(target);
      drawColumnScene(canvas, target);
      updateColumnReadout(readout, target);
      return Promise.resolve();
    }
    const start = performance.now();
    const duration = 760;
    return new Promise((resolve) => {
      const step = (now) => {
        const state = animationState.get(canvas);
        if (!state || state.resolve !== resolve) return;
        const t = Math.min(1, (now - start) / duration);
        const progress = from + (target - from) * easeInOutCubic(t);
        canvas.dataset.progress = String(progress);
        drawColumnScene(canvas, progress);
        updateColumnReadout(readout, progress);
        if (t < 1) state.raf = requestAnimationFrame(step);
        else {
          animationState.delete(canvas);
          resolve();
        }
      };
      animationState.set(canvas, { resolve, raf: requestAnimationFrame(step) });
    });
  }

  function updateColumnReadout(readout, progress) {
    if (!readout) return;
    const b1 = interpolateVector([1, 0], [2, 0], progress);
    const b2 = interpolateVector([1, 1], [2, 1], progress);
    // Plain text vectors — avoids .tex-inline chip layout fights in the side panel.
    readout.innerHTML = `
      <div><span>第一列</span><strong class="s2c-plain-vec">(${formatNumber(b1[0])}, ${formatNumber(b1[1])})ᵀ</strong></div>
      <div><span>第二列</span><strong class="s2c-plain-vec">(${formatNumber(b2[0])}, ${formatNumber(b2[1])})ᵀ</strong></div>
      <p>${progress < 0.98 ? "A 正在分别作用于 B 的两列；平行四边形随之变形。" : "两根向量现在正是 AB 的两列。"}</p>`;
  }

  function vectorLabelForCompose(stageIndex) {
    if (stageIndex <= 0) return "x";
    if (stageIndex === 1) return "Bx";
    return "ABx";
  }

  function renderLab(root) {
    root.innerHTML = `
      <h2>交互实验</h2>
      <div class="s2c-lab" data-s2c-lab>
        <header class="s2c-header">
          <div>
            <h3>矩阵乘法：在连续画面里完成</h3>
            <p>取 ${texInline(`A=${matrixTex(MODEL.A)}`)}，${texInline(`B=${matrixTex(MODEL.B)}`)}，输入 ${texInline(`x=${vectorTex(MODEL.x)}`)}。</p>
          </div>
          <div class="s2c-data-strip">
            <span>${texInline(`AB=${matrixTex(MODEL.AB)}`)}</span>
            <span>${texInline(`BA=${matrixTex(MODEL.BA)}`)}</span>
          </div>
        </header>

        <div class="s2c-tabs" role="tablist" aria-label="矩阵乘法的两种观察方式">
          <button type="button" class="is-active" role="tab" aria-selected="true" data-s2c-tab="compose">连续复合</button>
          <button type="button" role="tab" aria-selected="false" data-s2c-tab="order">交换顺序</button>
        </div>

        <div class="s2c-panels">
          <section class="s2c-panel is-active" data-s2c-panel="compose" role="tabpanel">
            <div class="s2c-stage-copy">
              <p>同一张网格先经过 ${texInline("B")}，再经过 ${texInline("A")}。紫色向量是输入 ${texInline("x")} 在当前变换下的像；虚线留下它经过的位置。</p>
            </div>
            <div data-s2c-compose-gate></div>
            <div class="s2c-canvas-shell">
              <canvas class="s2c-main-canvas" data-s2c-compose-canvas aria-label="矩阵复合连续动画"></canvas>
              <div class="s2c-stage-badge" data-s2c-compose-badge>初始：单位网格与 ${texInline("x")}</div>
            </div>
            <div class="s2c-controls">
              <button type="button" class="is-primary" data-s2c-compose-play>播放 ${texInline("B\\to A")}</button>
              <button type="button" data-s2c-compose-direct>直接看 ${texInline("AB")}</button>
              <button type="button" data-s2c-compose-reset>重置</button>
            </div>
            <div class="s2c-process-track" data-s2c-process-track>
              <span class="is-active" data-s2c-pt="0">${texInline("x=(1,1)^T")}</span><i>经过 ${texInline("B")}</i><span data-s2c-pt="1">${texInline("Bx")}</span><i>再经过 ${texInline("A")}</i><span data-s2c-pt="2">${texInline("A(Bx)")}</span>
            </div>
            <div class="s2c-conclusion" data-s2c-compose-conclusion hidden>
              <strong>${texInline("A(Bx)=(AB)x")}</strong>
              <p>两步的终点 ${texInline("(4,1)^T")} 正是乘积矩阵 ${texInline("AB")} 作用在 ${texInline("x")} 上的结果。矩阵乘法 ${texInline("AB")} 就是“先做 ${texInline("B")}，再做 ${texInline("A")}”这个复合变换的矩阵。</p>
            </div>
          </section>

          <section class="s2c-panel" data-s2c-panel="order" role="tabpanel" hidden>
            <div class="s2c-stage-copy">
              <p>从同一个单位方格出发，左右同时播放：左边先剪切后拉伸，右边先拉伸后剪切；中间状态不同，最终结果也不同。</p>
            </div>
            <div class="s2c-order-grid">
              <article>
                <header><strong>${texInline("AB")}</strong><span>先 ${texInline("B")}，后 ${texInline("A")}</span></header>
                <div class="s2c-canvas-shell"><canvas data-s2c-order-ab aria-label="AB 的作用顺序动画"></canvas><div class="s2c-stage-badge" data-s2c-order-ab-badge>初始</div></div>
                <div>${texDisplay(`AB=${matrixTex(MODEL.AB)}`)}</div>
              </article>
              <article>
                <header><strong>${texInline("BA")}</strong><span>先 ${texInline("A")}，后 ${texInline("B")}</span></header>
                <div class="s2c-canvas-shell"><canvas data-s2c-order-ba aria-label="BA 的作用顺序动画"></canvas><div class="s2c-stage-badge" data-s2c-order-ba-badge>初始</div></div>
                <div>${texDisplay(`BA=${matrixTex(MODEL.BA)}`)}</div>
              </article>
            </div>
            <div class="s2c-controls"><button type="button" class="is-primary" data-s2c-order-play>同步播放两种顺序</button><button type="button" data-s2c-order-reset>重置</button></div>
            <div class="s2c-conclusion"><strong>${texInline("AB\\ne BA")}</strong><p>第二个过程面对的中间图形不同，因此最终平行四边形和矩阵元素也不同。</p></div>
          </section>
        </div>

      </div>
    `;

    const controller = new AbortController();
    const { signal } = controller;

    bindTabs(root, signal);
    bindComposition(root, signal);
    bindColumns(root, signal);
    bindFormula(root, signal);
    bindOrder(root, signal);
    const observer = bindRedraw(root, signal);

    const destroy = () => {
      controller.abort();
      root.querySelectorAll("canvas").forEach((canvas) => cancelCanvasAnimation(canvas));
      observer?.disconnect();
      activeRoots.delete(root);
      liveLabs.delete(root);
    };

    liveLabs.set(root, { destroy });
    activeRoots.add(root);
  }

  function bindTabs(root, signal) {
    const tabs = [...root.querySelectorAll("[data-s2c-tab]")];
    const panels = [...root.querySelectorAll("[data-s2c-panel]")];
    const activate = (id, focus = false) => {
      tabs.forEach((tab) => {
        const active = tab.dataset.s2cTab === id;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        if (active && focus) tab.focus();
      });
      panels.forEach((panel) => {
        const active = panel.dataset.s2cPanel === id;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });
      // Double rAF: wait until the panel is visible before measuring canvas size.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          root.querySelectorAll("canvas").forEach((canvas) => {
            canvas._s2cMetrics = null;
          });
          redrawVisible(root);
        });
      });
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab.dataset.s2cTab), { signal });
      tab.addEventListener(
        "keydown",
        (event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          let next = index;
          if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
          if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
          if (event.key === "Home") next = 0;
          if (event.key === "End") next = tabs.length - 1;
          activate(tabs[next].dataset.s2cTab, true);
        },
        { signal },
      );
    });
  }

  function setProcessStep(root, step) {
    const items = [...root.querySelectorAll("[data-s2c-process-track] span")];
    items.forEach((item, index) => item.classList.toggle("is-active", index === step));
  }

  function bindComposition(root, signal) {
    const panel = root.querySelector('[data-s2c-panel="compose"]');
    const canvas = root.querySelector("[data-s2c-compose-canvas]");
    const badge = root.querySelector("[data-s2c-compose-badge]");
    const conclusion = root.querySelector("[data-s2c-compose-conclusion]");
    const points = [...root.querySelectorAll("[data-s2c-pt]")];
    const Bx = multiplyMatrixVector(MODEL.B, MODEL.x);
    const ABx = multiplyMatrixVector(MODEL.AB, MODEL.x);
    const labels = [`初始：单位网格与 ${texInline("x")}`, `第一步：${texInline("B")} 完成剪切 ${texInline("\\to Bx")}`, `第二步：${texInline("A")} 继续拉伸 ${texInline("\\to A(Bx)")}`];
    const vec = (v) => `(${v[0]},${v[1]})^T`;
    const gate = window.LAPredictGate?.mount(root.querySelector("[data-s2c-compose-gate]"), {
      root: panel,
      manual: true,
      key: "visuals/ch4/section2-continuous.js#compose",
      question: `${texInline("x")} 先经过 ${texInline("B")} 到达 ${texInline("Bx")}，再经过 ${texInline("A")} 到达 ${texInline("A(Bx)")}。这个终点和乘积矩阵 ${texInline("AB")} 一次作用得到的 ${texInline("(AB)x")} 相比会怎样？`,
      options: [
        ["两者是同一个点", true, ""],
        ["不同：两步走得更远", false, "两步的终点 (4, 1)ᵀ 和 (AB)x 完全重合。"],
        [`只有 ${texInline("x")} 是 ${texInline("e_1")} 或 ${texInline("e_2")} 时才相同`, false, "对任意 x 都有 A(Bx)=(AB)x，AB 的每一列正是 A 作用在 B 的列上。"],
        [`和 ${texInline("(BA)x")} 是同一个点`, false, "(BA)x=(3, 1)ᵀ，那是先 A 后 B 的结果。"],
      ],
      right: `✓ 两步的终点 ${texInline("A(Bx)=(4,1)^T")}，与 ${texInline("(AB)x")} 重合。${texInline("AB")} 就是“先 ${texInline("B")} 后 ${texInline("A")}”的复合变换的矩阵。`,
      onReveal: () => {
        conclusion.hidden = false;
        points[2].innerHTML = texInline(`A(Bx)=(AB)x=${vec(ABx)}`);
      },
    });
    // stage = label stage, done = index of the last keyframe reached
    const stageDrawOptions = (stage, done = stage) => {
      const trail = [{ at: MODEL.x, label: "x", offset: [-16, -8] }];
      // Bx = (2, 1) is also the tip of ABe₂: its name sits above the point, the arrow's to the right
      if (done >= 1) trail.push({ at: Bx, label: "Bx", offset: [-18, -20] });
      if (done >= 2) trail.push({ at: ABx, label: "" });
      return {
        vector: true,
        vectorLabel: vectorLabelForCompose(stage),
        trail,
        // the columns are images of e₁, e₂ under what has been applied so far: I, B, then AB
        firstLabel: ["e₁", "Be₁", "ABe₁"][stage] || "ABe₁",
        secondLabel: ["e₂", "Be₂", "ABe₂"][stage] || "ABe₂",
      };
    };
    const reset = () => {
      cancelCanvasAnimation(canvas);
      drawTransformScene(canvas, MODEL.I, stageDrawOptions(0));
      badge.innerHTML = labels[0];
      setProcessStep(root, 0);
      points[1].innerHTML = texInline("Bx");
      if (!gate?.revealed) points[2].innerHTML = texInline("A(Bx)");
    };
    root.querySelector("[data-s2c-compose-play]")?.addEventListener(
      "click",
      async () => {
        points[1].innerHTML = texInline("Bx");
        await animateCanvasSequence(canvas, [{ matrix: MODEL.I }, { matrix: MODEL.B }, { matrix: MODEL.AB }], {
          stageDrawOptions,
          onStage: (index, _frame, t) => {
            const stage = Math.min(index, 2);
            badge.innerHTML = labels[stage];
            setProcessStep(root, stage);
            if (stage >= 1 && t === 1) points[1].innerHTML = texInline(`Bx=${vec(Bx)}`);
          },
        });
        if (currentMatrices.get(canvas) === MODEL.AB) {
          points[1].innerHTML = texInline(`Bx=${vec(Bx)}`);
          gate?.acted();
          if (!gate) conclusion.hidden = false;
        }
      },
      { signal },
    );
    root.querySelector("[data-s2c-compose-direct]")?.addEventListener(
      "click",
      () => {
        animateCanvasSequence(canvas, [{ matrix: MODEL.I }, { matrix: MODEL.AB }], {
          stageDrawOptions: (stage, done) => ({ ...stageDrawOptions(stage === 0 ? 0 : 2, 0), vectorLabel: stage === 0 ? "x" : "(AB)x" }),
          onStage: (index) => {
            badge.innerHTML = index === 0 ? labels[0] : `一次完成：${texInline("AB")} 直接把 ${texInline("x")} 送到终点`;
            setProcessStep(root, index === 0 ? 0 : 2);
          },
        });
      },
      { signal },
    );
    root.querySelector("[data-s2c-compose-reset]")?.addEventListener("click", reset, { signal });
    reset();
  }

  function bindColumns(root, signal) {
    const canvas = root.querySelector("[data-s2c-column-canvas]");
    const readout = root.querySelector("[data-s2c-column-readout]");
    if (!canvas || !readout) return;
    canvas.dataset.progress = "0";
    drawColumnScene(canvas, 0);
    updateColumnReadout(readout, 0);
    root.querySelector("[data-s2c-column-play]")?.addEventListener("click", () => animateColumns(canvas, readout, 1), {
      signal,
    });
    root.querySelector("[data-s2c-column-reset]")?.addEventListener("click", () => animateColumns(canvas, readout, 0), {
      signal,
    });
  }

  function bindFormula(root, signal) {
    const stage = root.querySelector("[data-s2c-formula-stage]");
    const work = root.querySelector("[data-s2c-dot-work]");
    if (!stage || !work) return;
    const aCells = [...stage.querySelectorAll('[data-s2c-matrix="A"] span')];
    const bCells = [...stage.querySelectorAll('[data-s2c-matrix="B"] span')];
    const resultCells = [...stage.querySelectorAll("[data-s2c-result]")];
    let timers = [];

    const clearTimers = () => {
      timers.forEach(clearTimeout);
      timers = [];
    };

    signal.addEventListener("abort", clearTimers);

    const select = (row, col) => {
      clearTimers();
      aCells.forEach((cell) => {
        cell.className = "";
      });
      bCells.forEach((cell) => {
        cell.className = "";
      });
      resultCells.forEach((cell) =>
        cell.classList.toggle("is-active", Number(cell.dataset.row) === row && Number(cell.dataset.col) === col),
      );
      const terms = MODEL.A[row].map((value, k) => ({
        a: value,
        b: MODEL.B[k][col],
        product: value * MODEL.B[k][col],
        aCell: aCells.find((cell) => Number(cell.dataset.row) === row && Number(cell.dataset.col) === k),
        bCell: bCells.find((cell) => Number(cell.dataset.row) === k && Number(cell.dataset.col) === col),
      }));

      work.innerHTML = `<span>第 ${row + 1} 行 × 第 ${col + 1} 列</span><strong data-s2c-work-formula></strong><p data-s2c-work-note>准备依次配对。</p>`;
      const formula = work.querySelector("[data-s2c-work-formula]");
      const note = work.querySelector("[data-s2c-work-note]");
      const full = terms.map((term) => `${term.a}\\cdot${term.b}`).join("+");
      formula.innerHTML = texInline(`c_{${row + 1}${col + 1}}=${full}`);

      terms.forEach((term, index) => {
        timers.push(
          setTimeout(() => {
            terms.forEach((item) => {
              item.aCell?.classList.remove("is-pair-active");
              item.bCell?.classList.remove("is-pair-active");
            });
            term.aCell?.classList.add("is-row-source", "is-pair-active");
            term.bCell?.classList.add("is-column-source", "is-pair-active");
            note.textContent = `第 ${index + 1} 对：${term.a} × ${term.b} = ${term.product}`;
          }, index * 520),
        );
      });
      timers.push(
        setTimeout(() => {
          terms.forEach((term) => {
            term.aCell?.classList.remove("is-pair-active");
            term.bCell?.classList.remove("is-pair-active");
            term.aCell?.classList.add("is-row-source");
            term.bCell?.classList.add("is-column-source");
          });
          formula.innerHTML = texInline(`c_{${row + 1}${col + 1}}=${full}=${MODEL.AB[row][col]}`);
          note.textContent = "所有配对乘积相加，得到这个结果元素。";
        }, terms.length * 520),
      );
    };

    resultCells.forEach((cell) =>
      cell.addEventListener("click", () => select(Number(cell.dataset.row), Number(cell.dataset.col)), { signal }),
    );
    select(0, 0);
  }

  function bindOrder(root, signal) {
    const abCanvas = root.querySelector("[data-s2c-order-ab]");
    const baCanvas = root.querySelector("[data-s2c-order-ba]");
    const abBadge = root.querySelector("[data-s2c-order-ab-badge]");
    const baBadge = root.querySelector("[data-s2c-order-ba-badge]");
    const drawOpts = { vector: false, firstLabel: "列1", secondLabel: "列2" };
    const reset = () => {
      cancelCanvasAnimation(abCanvas);
      cancelCanvasAnimation(baCanvas);
      drawTransformScene(abCanvas, MODEL.I, drawOpts);
      drawTransformScene(baCanvas, MODEL.I, drawOpts);
      abBadge.textContent = "初始";
      baBadge.textContent = "初始";
    };
    root.querySelector("[data-s2c-order-play]")?.addEventListener(
      "click",
      () => {
        animateCanvasSequence(abCanvas, [{ matrix: MODEL.I }, { matrix: MODEL.B }, { matrix: MODEL.AB }], {
          drawOptions: drawOpts,
          onStage: (index) => {
            abBadge.innerHTML = ["初始", `${texInline("B")}：剪切`, `${texInline("A")}：拉伸后得到 ${texInline("AB")}`][Math.min(index, 2)];
          },
        });
        animateCanvasSequence(baCanvas, [{ matrix: MODEL.I }, { matrix: MODEL.A }, { matrix: MODEL.BA }], {
          drawOptions: drawOpts,
          onStage: (index) => {
            baBadge.innerHTML = ["初始", `${texInline("A")}：先拉伸`, `${texInline("B")}：剪切后得到 ${texInline("BA")}`][Math.min(index, 2)];
          },
        });
      },
      { signal },
    );
    root.querySelector("[data-s2c-order-reset]")?.addEventListener("click", reset, { signal });
    reset();
  }

  function redrawVisible(root) {
    if (!root.isConnected) return;
    const compose = root.querySelector("[data-s2c-compose-canvas]");
    if (compose && compose.offsetParent !== null) {
      const opts = compose._s2cDrawOptions || { vectorLabel: "x", firstLabel: "e₁", secondLabel: "e₂" };
      drawTransformScene(compose, currentMatrices.get(compose) || MODEL.I, opts);
    }
    const column = root.querySelector("[data-s2c-column-canvas]");
    if (column && column.offsetParent !== null) drawColumnScene(column, Number(column.dataset.progress || 0));
    const ab = root.querySelector("[data-s2c-order-ab]");
    const ba = root.querySelector("[data-s2c-order-ba]");
    const orderOpts = { vector: false, firstLabel: "列1", secondLabel: "列2" };
    if (ab && ab.offsetParent !== null) drawTransformScene(ab, currentMatrices.get(ab) || MODEL.I, orderOpts);
    if (ba && ba.offsetParent !== null) drawTransformScene(ba, currentMatrices.get(ba) || MODEL.I, orderOpts);
  }

  function bindRedraw(root, signal) {
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            if (!signal.aborted) redrawVisible(root);
          })
        : null;
    root.querySelectorAll("canvas").forEach((canvas) => observer?.observe(canvas));
    if (!globalResizeBound) {
      globalResizeBound = true;
      window.addEventListener(
        "resize",
        () => {
          activeRoots.forEach((item) => redrawVisible(item));
        },
        { passive: true },
      );
    }
    if (!globalThemeBound) {
      globalThemeBound = true;
      const redrawTheme = () => {
        requestAnimationFrame(() => activeRoots.forEach((item) => redrawVisible(item)));
      };
      document.querySelector("#themeToggle")?.addEventListener("click", redrawTheme);
      // Theme transition owns the toggle click; still redraw when theme commits.
      window.addEventListener("la-themechange", redrawTheme);
    }
    return observer;
  }

  function mountSection2ContinuousLab(interactive) {
    if (!interactive) return;
    const existing = liveLabs.get(interactive);
    if (existing) existing.destroy();
    renderLab(interactive);
    interactive.dataset.sectionTwoContinuous = "true";
  }

  function teardownSection2ContinuousLab() {
    [...activeRoots].forEach((root) => liveLabs.get(root)?.destroy());
    activeRoots.clear();
  }

  window.mountSection2ContinuousLab = mountSection2ContinuousLab;
  window.teardownSection2ContinuousLab = teardownSection2ContinuousLab;
})();


;/* visuals/ch4/core-presentation.js */
(() => {
  const inline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : `<code>${source}</code>`);
  const metaRow = (title, text) => `<div><dt>${title}</dt><dd>${text}</dd></div>`;
  const definition = (title, text) => `<article class="core-definition"><strong>${title}</strong><p>${text}</p></article>`;
  const formalShell = (title, intro, main, meta, definitions, noteTitle, noteText) => `<h2>${title}</h2><div class="core-formal"><p class="core-intro">${intro}</p><div class="core-map"><div class="core-map-main">${main}</div><dl class="core-meta">${meta}</dl></div><div class="core-definition-stack">${definitions}</div><div class="core-note"><strong>${noteTitle}</strong><p>${noteText}</p></div></div>`;

  function renderSection3Formal(formal) {
    if (!formal) return;
    formal.innerHTML = formalShell(
      "先把“缩放”和“有效方向”分开",
      "行列式和秩都在描述变换，它们关注的侧面不同：行列式问面积或体积缩放了多少；秩问最后还剩多少条彼此独立的方向能够到达。",
      display("\\det(AB)=\\det(A)\\det(B)"),
      [metaRow("行列式", "连续变换时，缩放因子相乘。"), metaRow("秩", "输出空间的维数；也就是仍然保留的独立方向数。"), metaRow("关键不等式", `${inline("\\operatorname{rank}(AB)\\leq\\min\\{\\operatorname{rank}(A),\\operatorname{rank}(B)\\}")}。`)].join(""),
      [definition("行列式", `${inline("\\det(A)")} 为 0 时，二维网格被压到线或点；面积已经丢失。`), definition("秩", "不要把秩只当作消元后出现的数字。它在回答：输出还能沿多少个独立方向变化？"), definition("复合", "前一步已经压掉的方向，后一步只能接着处理剩下的输出；因此复合不能恢复已经丢失的独立性。")].join(""),
      "阅读抓手",
      `先问“列向量是否独立”，再问“面积是否被压到 0”。${inline("\\det")} 与秩在二维可逆问题里会相遇，但它们各自说明的是不同侧面。`,
    );
  }

  function rankView(mode) {
    if (mode === "one") return `<h4>秩 1：两列落在同一条线上</h4><p>这里第二列是第一列的两倍。输入平面虽然有两个基本方向，但经过矩阵后，它们都落到同一条输出方向上。</p><div class="core-math">${display("B=\\begin{pmatrix}1&2\\\\1&2\\end{pmatrix},\\quad Be_1=\\begin{pmatrix}1\\\\1\\end{pmatrix},\\quad Be_2=2Be_1")}</div><ul class="core-points"><li>两列相关，所以只能张成一条线，${inline("\\operatorname{rank}(B)=1")}。</li><li>无论再左乘什么 A，${inline("AB")} 的两列仍满足相同的倍数关系。</li><li>因此无法通过后续复合重新变成秩 2。</li></ul>`;
    return `<h4>秩 2：两列仍然给出两个独立方向</h4><p>这里两列不共线，输出还能铺满整个平面。把它理解成“两个基本方向经过变换后仍没有挤到同一条线”。</p><div class="core-math">${display("A=\\begin{pmatrix}2&1\\\\0&1\\end{pmatrix},\\quad Ae_1=\\begin{pmatrix}2\\\\0\\end{pmatrix},\\quad Ae_2=\\begin{pmatrix}1\\\\1\\end{pmatrix}")}</div><ul class="core-points"><li>两列不共线，所以它们张成平面，${inline("\\operatorname{rank}(A)=2")}。</li><li>${inline("\\det(A)=2\\ne0")}，面积没有被压到 0。</li><li>在二维中，这也预示着 A 可以有逆。</li></ul>`;
  }

  function renderSection3Interactive(section) {
    if (!section) return;
    section.innerHTML = `<h2>交互实验</h2><div class="core-lab"><div class="core-lab-head"><h3>秩：独立方向有没有被压掉</h3><p>先切换两种列向量关系，观察“输出还能铺满平面”与“输出只剩一条线”的差别。</p></div><div class="rank-choice-row"><button type="button" class="core-choice is-active" data-rank-mode="two">两列独立 · 秩 2</button><button type="button" class="core-choice" data-rank-mode="one">两列共线 · 秩 1</button></div><div class="core-lab-panel" data-rank-panel>${rankView("two")}</div></div>`;
    section.querySelectorAll("[data-rank-mode]").forEach((button) => button.addEventListener("click", () => {
      const mode = button.dataset.rankMode;
      section.querySelectorAll("[data-rank-mode]").forEach((item) => item.classList.toggle("is-active", item === button));
      const panel = section.querySelector("[data-rank-panel]");
      if (panel) panel.innerHTML = rankView(mode);
    }));
  }

  function renderSection4Formal(formal) {
    if (!formal) return;
    formal.innerHTML = formalShell(
      "可逆的本质是信息可以倒推",
      "逆矩阵表示一次反向过程：先经过 A，再经过逆矩阵，所有输入都能准确回到原处。公式中的 I 记录的正是这个回到原处的结果。",
      display("A^{-1}A=AA^{-1}=E"),
      [metaRow("谁可能有逆", "首先必须是方阵；输入和输出维数要相同。"), metaRow("二维信号", `${inline("\\det(A)\\ne0")} 表示没有面积坍缩。`), metaRow("方程组", `${inline("Ax=b")} 对每个 b 有唯一解，说明输出能唯一倒推输入。`)].join(""),
      [definition("几何语言", "可逆：两个独立方向仍然独立，平面仍然铺满平面；不可逆：至少一个方向被压没。"), definition("代数语言", "对 n 阶矩阵，可逆、秩为 n、行列式非零、列向量线性无关、行最简形为 I 是一组等价条件。"), definition("计算语言", "在 2 阶情形，可以使用公式；在更一般情形，后面的初等矩阵会给出系统的求逆方法。")].join(""),
      "不要混淆",
      "“存在逆矩阵”是结构结论；求出逆矩阵只是后续计算。先判断信息是否已丢失，再决定是否值得求逆。",
    );
  }

  function inverseView(mode) {
    if (mode === "singular") return `<h4>不可逆：两列被挤到同一条线</h4><p>第二列是第一列的两倍。两个基本方向在输出端不再独立，因此许多不同输入会得到相同输出。</p><div class="core-math">${display("S=\\begin{pmatrix}1&2\\\\2&4\\end{pmatrix},\\quad \\det(S)=1\\cdot4-2\\cdot2=0")}</div><ul class="core-points"><li>${inline("\\operatorname{rank}(S)=1")}，输出只剩一维。</li><li>面积被压到 0，无法从输出唯一倒推出输入。</li><li>所以 S 没有逆矩阵。</li></ul>`;
    return `<h4>可逆：两列仍然独立</h4><p>这里两个基本方向经过变换后仍不共线。它们仍然铺满整个平面，所以反向过程能够存在。</p><div class="core-math">${display("A=\\begin{pmatrix}2&1\\\\1&1\\end{pmatrix},\\quad \\det(A)=1\\ne0,\\quad A^{-1}=\\begin{pmatrix}1&-1\\\\-1&2\\end{pmatrix}")}</div><ul class="core-points"><li>${inline("\\operatorname{rank}(A)=2")}；没有独立方向丢失。</li><li>面积缩放因子非零。</li><li>乘上 ${inline("A^{-1}")} 可以把输出唯一送回原输入。</li></ul>`;
  }

  function renderSection4Interactive(section) {
    if (!section) return;
    section.innerHTML = `<h2>对照实验</h2><div class="core-lab"><div class="core-lab-head"><h3>可逆和不可逆只差在哪里</h3><p>先看两列是否仍独立，再回到求逆公式。</p></div><div class="inverse-choice-row"><button type="button" class="core-choice is-active" data-inverse-mode="invertible">可逆</button><button type="button" class="core-choice" data-inverse-mode="singular">不可逆</button></div><div class="core-lab-panel" data-inverse-panel>${inverseView("invertible")}</div></div>`;
    section.querySelectorAll("[data-inverse-mode]").forEach((button) => button.addEventListener("click", () => {
      const mode = button.dataset.inverseMode;
      section.querySelectorAll("[data-inverse-mode]").forEach((item) => item.classList.toggle("is-active", item === button));
      const panel = section.querySelector("[data-inverse-panel]");
      if (panel) panel.innerHTML = inverseView(mode);
    }));
  }

  const elementaryStates = [
    { label: "第 1 步 / 3：写下同一个行操作", note: `目标操作是 ${inline("R_2\\leftarrow R_2-3R_1")}。先不要急着改 A；先问“这条规则施加到单位矩阵 E 上会发生什么”。`, leftTitle: "单位矩阵 E", left: "E=\\begin{pmatrix}1&0\\\\0&1\\end{pmatrix}", rightTitle: "原矩阵 A", right: "A=\\begin{pmatrix}1&2\\\\3&7\\end{pmatrix}", caption: "同一个操作会同时解释两件事：它怎样变出 P，又怎样改变 A。" },
    { label: "第 2 步 / 3：把操作施加到 E，得到 P", note: `对 E 做 ${inline("R_2\\leftarrow R_2-3R_1")}，第二行从 ${inline("(0,1)")} 变成 ${inline("(-3,1)")}。这就是对应的初等矩阵。`, leftTitle: "得到初等矩阵 P", left: "P=\\begin{pmatrix}1&0\\\\-3&1\\end{pmatrix}", rightTitle: "A 还没有计算", right: "A=\\begin{pmatrix}1&2\\\\3&7\\end{pmatrix}", caption: "构造 P 的方法很直接：对单位矩阵做同样的操作。" },
    { label: "第 3 步 / 3：左乘 P，就是对 A 做同一行变换", note: `现在计算 ${inline("PA")}。P 的第二行是 ${inline("(-3,1)")}，所以它会取 ${inline("-3R_1+R_2")}，这正是目标行操作。`, leftTitle: "左乘 P", left: "PA=\\begin{pmatrix}1&0\\\\-3&1\\end{pmatrix}\\begin{pmatrix}1&2\\\\3&7\\end{pmatrix}", rightTitle: "变换后的矩阵", right: "PA=\\begin{pmatrix}1&2\\\\0&1\\end{pmatrix}", caption: "因此“对 A 做一次行变换”和“左乘对应的初等矩阵 P”是同一件事。" },
  ];

  function elementaryView(index) {
    const state = elementaryStates[index];
    return `<div class="elementary-stepper"><div class="elementary-progress">${state.label}</div><p class="core-lab-caption">${state.note}</p><div class="matrix-pair"><div class="matrix-panel"><strong>${state.leftTitle}</strong>${display(state.left)}</div><div class="matrix-panel"><strong>${state.rightTitle}</strong>${display(state.right)}</div></div><p class="core-lab-caption">${state.caption}</p></div>`;
  }

  function renderSection6Formal(formal) {
    if (!formal) return;
    formal.innerHTML = formalShell(
      "初等矩阵就是“把操作写成矩阵”",
      "只要理解一条原则，初等矩阵就不神秘：先把某个行变换施加到单位矩阵，得到 P；再左乘 P，就会把同一条行规则施加到任意矩阵 A。",
      display("P\\,A=\\text{对 }A\\text{ 做对应的行变换}"),
      [metaRow("换行", "交换两行；反向操作仍是交换同两行。"), metaRow("倍乘", "一行乘非零数；反向操作是乘倒数。"), metaRow("倍加", "一行加另一行的倍数；反向操作是加相反数倍。")].join(""),
      [definition("怎样构造 P", "对单位矩阵 E 做同一个行变换。得到的结果就是初等矩阵 P。"), definition("为什么是左乘", "左侧矩阵的每一行会组合右侧矩阵的各行。因此 P 的行规则会直接重组 A 的行。"), definition("为什么可逆", "三类初等操作都有明确的反向操作；反向操作对应的初等矩阵就是 P 的逆。")].join(""),
      "向后连接",
      "这一节把消元和矩阵乘法接起来。§7 的分块初等变换只是把“行”升级成“矩阵块”，逻辑不会变。",
    );
  }

  function renderSection6Interactive(section) {
    if (!section) return;
    let step = 0;
    section.innerHTML = `<h2>逐步演示</h2><div class="core-lab"><div class="core-lab-head"><h3>同一行操作，先作用于 E，再作用于 A</h3><p>把三步按顺序走完：你会看到 P 从哪里来，以及为什么 PA 就是行变换后的 A。</p></div><div class="core-lab-panel" data-elementary-panel>${elementaryView(step)}</div><div class="elementary-controls"><button type="button" class="button" data-elementary-prev disabled>上一步</button><button type="button" class="button primary" data-elementary-next>下一步</button><button type="button" class="button" data-elementary-reset>重新开始</button></div></div>`;
    const panel = section.querySelector("[data-elementary-panel]");
    const previous = section.querySelector("[data-elementary-prev]");
    const next = section.querySelector("[data-elementary-next]");
    const reset = section.querySelector("[data-elementary-reset]");
    const paint = () => {
      if (panel) panel.innerHTML = elementaryView(step);
      if (previous) previous.disabled = step === 0;
      if (next) { next.disabled = step === elementaryStates.length - 1; next.textContent = step === elementaryStates.length - 1 ? "已完成" : "下一步"; }
    };
    previous?.addEventListener("click", () => { if (step > 0) { step -= 1; paint(); } });
    next?.addEventListener("click", () => { if (step < elementaryStates.length - 1) { step += 1; paint(); } });
    reset?.addEventListener("click", () => { step = 0; paint(); });
  }

  defineChapter4Renderer("matrix-product-determinant-rank", { formal: renderSection3Formal, interactive: renderSection3Interactive });
  defineChapter4Renderer("matrix-inverse", { formal: renderSection4Formal, interactive: renderSection4Interactive });
  defineChapter4Renderer("elementary-matrices", { formal: renderSection6Formal, interactive: renderSection6Interactive });
})();


;/* visuals/ch4/section6-elementary.js */
/*
 * Chapter 4 §6 初等矩阵: what each elementary matrix does to the plane.
 * Mode 1: pick one elementary row operation, see E -> P and the grid under P
 *         (swap = reflection, scale = stretch, row-add = shear; det P = -1, k, 1).
 *         It opens on the operation the prediction asks about, R₂ ← R₂ + 2R₁, with the
 *         grid still at E: “作用 P” (or any change in the lab) applies it. Only an action
 *         that leaves the lab on that operation grades the guess; elsewhere the guess stays.
 * Mode 2: build an invertible A as a product of elementary matrices, one step
 *         at a time, and watch the grid arrive at A. Each finished step leaves
 *         its unit-square image as a dashed ghost named by its product, so the
 *         chain I → E₁ → E₂E₁ → E₃E₂E₁ → E₄E₃E₂E₁ = A stays on the picture.
 * Overrides the step-only renderer registered in core-presentation.js.
 */
(() => {
  const tex = (s) => (window.texInline ? window.texInline(s) : s);
  const texD = (s) => (window.texDisplay ? window.texDisplay(s) : s);
  const reduceMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const mul = (A, B) => [
    [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
    [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
  ];
  const det = (A) => A[0][0] * A[1][1] - A[0][1] * A[1][0];
  const I = [[1, 0], [0, 1]];
  const lerp = (A, B, t) => A.map((r, i) => r.map((v, j) => v + (B[i][j] - v) * t));
  /*
   * Exact values. Every entry here is a multiple of 1/2 (exact in binary), or 1/k for
   * such a k (k = 3/2 gives 2/3, k = 5/2 gives 2/5), so a small denominator always fits.
   */
  const ratio = (x) => {
    for (let d = 1; d <= 64; d += 1) {
      const n = Math.round(x * d);
      if (Math.abs(n / d - x) < 1e-9) return [n, d];
    }
    return [x, 1];
  };
  // TeX: 2, -\tfrac{1}{2}
  const fmt = (x) => {
    const [n, d] = ratio(x);
    if (d === 1) return String(n);
    return `${n < 0 ? "-" : ""}\\tfrac{${Math.abs(n)}}{${d}}`;
  };
  // plain text for a slider readout: 2, −1/2
  const txt = (x) => {
    const [n, d] = ratio(x);
    return `${n < 0 ? "−" : ""}${Math.abs(n)}${d === 1 ? "" : `/${d}`}`;
  };
  // c·v in TeX: y, -y, 2y, \tfrac{1}{2}x
  const coef = (c, v) => (c === 0 ? "0" : c === 1 ? v : c === -1 ? `-${v}` : `${fmt(c)}${v}`);
  const texM = (A) => `\\begin{pmatrix}${fmt(A[0][0])}&${fmt(A[0][1])}\\\\${fmt(A[1][0])}&${fmt(A[1][1])}\\end{pmatrix}`;

  /* Elementary operations on 2x2. */
  function elementary(op) {
    if (op.type === "swap") return { E: [[0, 1], [1, 0]], label: "R_1\\leftrightarrow R_2", inv: "R_1\\leftrightarrow R_2", geo: `关于直线 ${tex("y=x")} 的反射`, det: -1 };
    if (op.type === "scale") {
      const E = op.row === 0 ? [[op.k, 0], [0, 1]] : [[1, 0], [0, op.k]];
      const axis = op.row === 0 ? "x" : "y";
      const times = tex(fmt(Math.abs(op.k)));
      return { E, label: `R_${op.row + 1}\\leftarrow ${fmt(op.k)}R_${op.row + 1}`, inv: `R_${op.row + 1}\\leftarrow ${fmt(1 / op.k)}R_${op.row + 1}`, geo: Math.abs(op.k) === 1 ? (op.k < 0 ? `沿 ${tex(axis)} 方向翻转，长度不变` : "每个点都不动") : op.k < 0 ? `沿 ${tex(axis)} 方向伸缩 ${times} 倍并翻转` : `沿 ${tex(axis)} 方向伸缩 ${times} 倍`, det: op.k };
    }
    // add: R_i <- R_i + c R_j
    const E = [[1, 0], [0, 1]];
    E[op.row][1 - op.row] = op.c;
    const moving = op.row === 0 ? "x" : "y";
    const by = op.row === 0 ? "y" : "x";
    const sign = op.c < 0 ? "-" : "+";
    return { E, label: `R_${op.row + 1}\\leftarrow R_${op.row + 1}${sign}${Math.abs(op.c) === 1 ? "" : fmt(Math.abs(op.c))}R_${2 - op.row}`, inv: `R_${op.row + 1}\\leftarrow R_${op.row + 1}${op.c < 0 ? "+" : "-"}${Math.abs(op.c) === 1 ? "" : fmt(Math.abs(op.c))}R_${2 - op.row}`, geo: `剪切：每个点的 ${tex(moving)} 坐标加上 ${tex(coef(op.c, by))}`, det: 1 };
  }

  /*
   * Drawing: grid image under M, unit square, e1/e2 images.
   * opts.view "build" frames the first quadrant, where the chain I → … → A lives.
   * opts.ghosts: earlier unit-square images [{ M, text, spot }], drawn dashed at 35%
   * under the current one; opts.tag names the current image at its spot.
   */
  const FONT = "'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
  function drawPlane(canvas, M, opts = {}) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const style = getComputedStyle(canvas);
    const col = (name, fb) => style.getPropertyValue(name).trim() || fb;
    const v1 = col("--cv-v1", "#2a64a8");
    const v2 = col("--cv-v2", "#c4552f");
    const image = col("--cv-image", "#8c4f86");
    const line = col("--cv-grid-major", "#e2ddd0");
    const muted = col("--cv-axis", "#8a8d84");
    const paper = col("--cv-paper", "#fdfcf8");
    let s = Math.min(w, h) / 8.4;
    let cx = w / 2;
    let cy = h / 2;
    if (opts.view === "build") {
      const [x0, x1, y0, y1] = BUILD_VIEW;
      s = Math.min(w / (x1 - x0), h / (y1 - y0));
      cx = w / 2 - (s * (x0 + x1)) / 2;
      cy = h / 2 + (s * (y0 + y1)) / 2;
    }
    const at = (G, x, y) => [cx + (G[0][0] * x + G[0][1] * y) * s, cy - (G[1][0] * x + G[1][1] * y) * s];
    const P = (x, y) => at(M, x, y);
    const Praw = (x, y) => [cx + x * s, cy - y * s];
    const square = (G) => {
      ctx.beginPath();
      [at(G, 0, 0), at(G, 1, 0), at(G, 1, 1), at(G, 0, 1)].forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p)));
      ctx.closePath();
    };
    // reference grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = line;
    for (let k = -8; k <= 8; k += 1) {
      ctx.beginPath(); ctx.moveTo(...Praw(k, -8)); ctx.lineTo(...Praw(k, 8)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(...Praw(-8, k)); ctx.lineTo(...Praw(8, k)); ctx.stroke();
    }
    // transformed grid
    ctx.strokeStyle = `color-mix(in srgb, ${image} 34%, transparent)`;
    ctx.lineWidth = 1.1;
    for (let k = -8; k <= 8; k += 1) {
      ctx.beginPath(); ctx.moveTo(...P(k, -8)); ctx.lineTo(...P(k, 8)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(...P(-8, k)); ctx.lineTo(...P(8, k)); ctx.stroke();
    }
    // axes
    ctx.strokeStyle = muted;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
    // ghosts of the earlier steps: same colour, dashed, 35%, under the current image
    const ghosts = opts.ghosts || [];
    ghosts.forEach((g) => {
      square(g.M);
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = image;
      ctx.lineWidth = 1.6;
      ctx.setLineDash([6, 5]);
      ctx.stroke();
      ctx.restore();
    });
    // unit square image
    square(M);
    // the image of the unit square is a result; a reversed orientation is dashed
    // canvas colours take no color-mix(): tints are the same colour at a low alpha
    ctx.save();
    ctx.globalAlpha = det(M) < 0 ? 0.07 : 0.12;
    ctx.fillStyle = image;
    ctx.fill();
    if (ghosts.length) {
      // the current image is the focus: a wide halo of the same colour underneath
      ctx.globalAlpha = 0.16;
      ctx.strokeStyle = image;
      ctx.lineWidth = 7;
      ctx.lineJoin = "round";
      ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = image;
    ctx.lineWidth = 1.6;
    if (det(M) < 0) ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    // basis images
    const arrow = (to, color, label) => {
      const [x0, y0] = P(0, 0);
      const [x1, y1] = to;
      const a = Math.atan2(y1 - y0, x1 - x0);
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * 8, y1 - Math.sin(a) * 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(a - 0.45) * 11, y1 - Math.sin(a - 0.45) * 11); ctx.lineTo(x1 - Math.cos(a + 0.45) * 11, y1 - Math.sin(a + 0.45) * 11); ctx.closePath(); ctx.fill();
      if (label) {
        // a paper halo keeps the label readable where it crosses grid lines and ghosts
        ctx.font = `700 13px ${FONT}`;
        ctx.lineJoin = "round";
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = paper;
        ctx.strokeText(label, x1 + 6, y1 - 6);
        ctx.fillText(label, x1 + 6, y1 - 6);
      }
    };
    arrow(P(1, 0), v1, opts.e1 ?? "Pe₁");
    arrow(P(0, 1), v2, opts.e2 ?? "Pe₂");
    // names of the images, beside a corner: spot.v is that corner of the unit square
    const name = (G, text, spot, { size, alpha }) => {
      const [x, y] = at(G, ...spot.v);
      const gap = 8;
      const place = {
        left: [x - gap, y, "right", "middle"],
        right: [x + gap, y, "left", "middle"],
        above: [x, y - gap, "center", "bottom"],
        below: [x, y + gap, "center", "top"],
      }[spot.side];
      ctx.save();
      ctx.font = `600 ${size}px ${FONT}`;
      ctx.textAlign = place[2];
      ctx.textBaseline = place[3];
      // keep the name inside the canvas
      const tw = ctx.measureText(text).width;
      const left = place[2] === "left" ? place[0] : place[2] === "right" ? place[0] - tw : place[0] - tw / 2;
      const tx = place[0] + Math.max(0, 4 - left) - Math.max(0, left + tw - (w - 4));
      ctx.lineJoin = "round";
      ctx.lineWidth = 4;
      ctx.strokeStyle = paper;
      ctx.strokeText(text, tx, place[1]);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = image;
      ctx.fillText(text, tx, place[1]);
      ctx.restore();
    };
    // the ghosts' names stay readable: nearly the size of the current one
    ghosts.forEach((g) => name(g.M, g.text, g.spot, { size: 13.5, alpha: 0.85 }));
    if (opts.tag) name(M, opts.tag.text, opts.tag.spot, { size: 14, alpha: 1 });
  }

  function animate(from, to, paint, done) {
    if (reduceMotion()) {
      paint(to);
      done?.();
      return () => {};
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / 650);
      paint(lerp(from, to, 1 - (1 - t) ** 3));
      if (t < 1) raf = requestAnimationFrame(step);
      else done?.();
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }

  /* A = [[2,1],[1,1]] = E₄E₃E₂E₁: E₁ acts first, every later step multiplies on the left. */
  const BUILD = [
    { op: { type: "scale", row: 1, k: 0.5 }, why: `先把 ${tex("y")} 方向压成一半` },
    { op: { type: "scale", row: 0, k: 2 }, why: `再把 ${tex("x")} 方向拉长 2 倍` },
    { op: { type: "add", row: 0, c: 2 }, why: `水平剪切：${tex("x")} 坐标加上 ${tex("2y")}` },
    { op: { type: "add", row: 1, c: 0.5 }, why: `竖直剪切：${tex("y")} 坐标加上 ${tex("x/2")}` },
  ];
  const TARGET = [[2, 1], [1, 1]];
  // the region x ∈ [−0.6, 4], y ∈ [−0.5, 2.5] holds every image of the chain and its name
  const BUILD_VIEW = [-0.6, 4, -0.5, 2.5];
  /*
   * Where each image of the chain is named (k = 0 … 4): a corner of the unit square
   * and the side to write on. The images are I = [0,1]², E₁ = [0,1]×[0,½],
   * E₂E₁ = [0,2]×[0,½], E₃E₂E₁ with corners (2,0), (3,½), (1,½), and A; these spots
   * keep the five names apart and off the arrows Ae₁, Ae₂.
   */
  const SPOTS = [
    { v: [0, 1], side: "left" },
    { v: [0, 1], side: "left" },
    { v: [1, 0], side: "below" },
    { v: [1, 1], side: "right" },
    { v: [1, 1], side: "above" },
  ];
  const SUB = "₀₁₂₃₄₅₆₇₈₉";
  // P_k ⋯ P_1 as a matrix, and its name: I, E₁, E₂E₁, …
  const chainAt = (k) => BUILD.slice(0, k).reduce((M, step) => mul(elementary(step.op).E, M), I);
  const chainName = (k) => (k ? Array.from({ length: k }, (_, i) => `P${SUB[k - i]}`).join("") : "E");
  const chainTex = (k) => (k ? Array.from({ length: k }, (_, i) => `P_${k - i}`).join("") : "E");
  // the same four factors in the opposite order: E₁E₂E₃E₄ = (4 4; 1/4 1/2), not A
  const WRONG_ORDER = BUILD.reduce((W, step) => mul(W, elementary(step.op).E), I);

  function renderInteractive(root, section, page) {
    if (!root) return undefined;
    // Picture first: the lab sits above the theorem block.
    const formal = page?.querySelector("#elementary-matrices-formal");
    if (formal && formal.compareDocumentPosition(root) & Node.DOCUMENT_POSITION_FOLLOWING) formal.before(root);
    root.innerHTML = `<h2>交互实验</h2>
      <section class="ch3l-lab el6-lab">
        <header class="ch3l-head"><h3>初等矩阵在平面上做什么</h3><p data-el-task></p></header>
        <div class="ch3l-toolbar" data-el-modes></div>
        <div data-el-gate="single"></div>
        <div data-el-gate="build" hidden></div>
        <div class="ch3l-body">
          <div class="el6-stage"><canvas class="el6-canvas" aria-label="初等矩阵作用下的网格"></canvas></div>
          <aside class="ch3l-side" data-el-side></aside>
        </div>
      </section>`;
    const canvas = root.querySelector("canvas");
    const side = root.querySelector("[data-el-side]");
    const task = root.querySelector("[data-el-task]");
    // ghosts: unit-square images of the finished build steps; moving: an animation is running
    // the operation the prediction asks about: R₂ ← R₂ + 2R₁, i.e. P(2,1(2))
    const ASKED = { type: "add", row: 1, c: 2 };
    // applied: the student has acted on the single-operation view (until then it waits at E)
    const state = { mode: "single", op: { ...ASKED }, applied: false, shown: I, build: 0, ghosts: [], moving: false };
    const onAsked = () => state.mode === "single" && state.op.type === ASKED.type && state.op.row === ASKED.row && state.op.c === ASKED.c;
    // before the first action the lab shows the asked operation on E, not yet applied
    const waiting = () => !state.applied && onAsked();
    let stop = () => {};
    let ro = null;
    let buildGate = null;
    const paint = (M) => {
      if (!canvas.isConnected) {
        // The lesson shell re-renders on navigation; release everything once detached.
        ro?.disconnect();
        stop();
        return;
      }
      state.shown = M;
      if (state.mode !== "build") {
        drawPlane(canvas, M, waiting() ? { e1: "e₁", e2: "e₂" } : {});
        return;
      }
      // names and arrow labels belong to a finished step, so they wait for the motion to end
      const k = state.build;
      const settled = !state.moving;
      const last = k === BUILD.length;
      drawPlane(canvas, M, {
        view: "build",
        e1: settled && k === 0 ? "e₁" : settled && last ? "Ae₁" : "",
        e2: settled && k === 0 ? "e₂" : settled && last ? "Ae₂" : "",
        ghosts: state.ghosts,
        tag: settled ? { text: last ? `${chainName(k)} = A` : chainName(k), spot: SPOTS[k] } : null,
      });
    };

    function singleSide() {
      const typeBtn = (t, l) => `<button type="button" class="ch3l-chip${state.op.type === t ? " is-active" : ""}" data-type="${t}">${l}</button>`;
      let param = "";
      if (state.op.type === "scale") param = `<label class="ch3l-range"><span>${tex("k")}</span><input type="range" min="-2" max="3" step="0.5" value="${state.op.k}" data-k /><b>${txt(state.op.k)}</b></label><div class="ch3l-actions">${[0, 1].map((r) => `<button type="button" class="ch3l-chip${state.op.row === r ? " is-active" : ""}" data-row="${r}">第 ${r + 1} 行</button>`).join("")}</div>`;
      if (state.op.type === "add") param = `<label class="ch3l-range"><span>${tex("c")}</span><input type="range" min="-2" max="2" step="0.5" value="${state.op.c}" data-c /><b>${txt(state.op.c)}</b></label><div class="ch3l-actions">${[1, 0].map((r) => `<button type="button" class="ch3l-chip${state.op.row === r ? " is-active" : ""}" data-row="${r}">${tex(r === 1 ? "R_2\\leftarrow R_2+cR_1" : "R_1\\leftarrow R_1+cR_2")}</button>`).join("")}</div>`;
      side.innerHTML = `<div class="ch3l-card"><h4>选择一次行变换</h4><div class="ch3l-actions">${typeBtn("swap", "换行")}${typeBtn("scale", "倍乘")}${typeBtn("add", "倍加")}</div>${param}</div>
        <div class="ch3l-card" data-el-info></div>`;
      singleInfo();
      // every control of this view is an action: it applies the chosen P
      const apply = (change) => { change(); state.applied = true; update(); };
      side.querySelectorAll("[data-type]").forEach((b) => b.addEventListener("click", () => apply(() => {
        const t = b.dataset.type;
        state.op = t === "swap" ? { type: "swap" } : t === "scale" ? { type: "scale", row: 1, k: 2 } : { type: "add", row: 1, c: 2 };
      })));
      side.querySelectorAll("[data-row]").forEach((b) => b.addEventListener("click", () => apply(() => { state.op.row = Number(b.dataset.row); })));
      // a slider keeps its own element while it is dragged: only the readout and the card change
      const slide = (input, set) => input?.addEventListener("input", () => {
        set(Number(input.value));
        state.applied = true;
        input.nextElementSibling.textContent = txt(state.op.type === "scale" ? state.op.k : state.op.c);
        singleInfo();
        retarget();
      });
      slide(side.querySelector("[data-k]"), (k) => { state.op.k = k === 0 ? 0.5 : k; }); // multiplying a row by 0 is not an elementary operation
      slide(side.querySelector("[data-c]"), (c) => { state.op.c = c; });
    }

    // the card under the controls: E → P, then (once applied) what P does
    function singleInfo() {
      const card = side.querySelector("[data-el-info]");
      if (!card) return;
      const e = elementary(state.op);
      // waiting at E: the effect of P stays hidden until it is applied
      const effect = waiting()
        ? `<div class="ch3l-actions"><button type="button" class="ch3l-btn is-primary" data-apply data-la-free${picked ? "" : ' disabled title="先在上方猜一猜"'}>作用 ${tex("P")}</button></div>`
        : `<p>${e.geo}</p><p>${tex(`\\det P=${fmt(e.det)}`)}：${Math.abs(e.det) === 1 ? "单位正方形的面积不变" : `单位正方形的面积变为原来的 ${tex(fmt(Math.abs(e.det)))} 倍`}${e.det < 0 ? "，定向翻转" : ""}。</p><p class="ch3l-muted">逆变换 ${tex(e.inv)}，所以 ${tex("P")} 可逆。</p>`;
      card.innerHTML = `<h4>对 ${tex("E")} 做 ${tex(e.label)}</h4>${texD(`E=${texM(I)}\\ \\longrightarrow\\ P=${texM(e.E)}`)}${effect}`;
      card.querySelector("[data-apply]")?.addEventListener("click", () => {
        state.applied = true;
        singleInfo();
        retarget();
      });
    }

    function retarget() {
      const to = waiting() ? I : elementary(state.op).E;
      stop();
      stop = animate(state.shown, to, paint);
    }

    function buildSide() {
      const k = state.build;
      const picked = !buildGate || buildGate.picked;
      const list = BUILD.map((s, i) => {
        const e = elementary(s.op);
        const cls = i < k ? "is-done" : i === k ? "is-next" : "";
        return `<li class="${cls}">${tex(`P_${i + 1}=${texM(e.E)}`)}<small class="el6-why">${s.why}</small></li>`;
      }).join("");
      const note = k === BUILD.length
        ? `网格到达 ${tex("A")}：${tex("A=P_4P_3P_2P_1")}，${tex("A")} 是初等矩阵的乘积。`
        : k === 0
          ? `网格依次经过 ${tex("P_1")}、${tex("P_2")}、${tex("P_3")}、${tex("P_4")} 四步。`
          : `再作用 ${BUILD.length - k} 步到达 ${tex("A")}。`;
      // data-la-free: this button waits for the build prediction, which this lab tracks itself
      side.innerHTML = `<div class="ch3l-actions"><button type="button" class="ch3l-btn is-primary" data-next data-la-free${!picked || k >= BUILD.length ? " disabled" : ""}${picked ? "" : ' title="先在上方猜一猜"'}>作用下一步</button><button type="button" class="ch3l-btn" data-restart>重来</button></div>
        <div class="ch3l-card"><h4>目标 ${tex(`A=${texM(TARGET)}`)}</h4><ol class="el6-steps">${list}</ol></div>
        <div class="ch3l-card"><h4>当前乘积</h4>${texD(`${chainTex(k)}=${texM(chainAt(k))}`)}<p>${note}</p></div>`;
      side.querySelector("[data-next]").addEventListener("click", () => {
        if (state.build >= BUILD.length || (buildGate && !buildGate.picked)) return;
        const done = state.build;
        const from = chainAt(done);
        const to = mul(elementary(BUILD[done].op).E, from);
        // the finished image stays behind as a ghost, named by its product
        state.ghosts.push({ M: from, text: chainName(done), spot: SPOTS[done] });
        state.build = done + 1;
        buildSide();
        stop();
        state.moving = true;
        stop = animate(state.shown, to, paint, () => {
          state.moving = false;
          paint(to);
          if (state.build === BUILD.length) buildGate?.acted();
        });
      });
      side.querySelector("[data-restart]").addEventListener("click", () => {
        state.build = 0;
        state.ghosts = [];
        buildSide();
        stop();
        state.moving = true;
        stop = animate(state.shown, I, paint, () => {
          state.moving = false;
          paint(I);
        });
      });
    }

    function update() {
      if (state.mode === "single") {
        singleSide();
        retarget();
      } else {
        buildSide();
      }
    }

    const TASKS = {
      single: `选一种行变换，先看它把单位矩阵变成哪个 ${tex("P")}，再看 ${tex("P")} 把整张网格变成什么样。淡色网格是原来的坐标网格。`,
      build: `可逆矩阵可以写成初等矩阵的乘积。逐步作用四个初等矩阵，看网格怎样一步步到达 ${tex("A")}。虚线是前几步的像。`,
    };
    const modes = root.querySelector("[data-el-modes]");
    const modeDefs = [["single", "一个初等矩阵"], ["build", `用初等矩阵拼出 ${tex("A")}`]];
    modes.innerHTML = modeDefs.map(([k, l]) => `<button type="button" class="ch3l-chip${k === state.mode ? " is-active" : ""}" data-mode="${k}">${l}</button>`).join("");
    modes.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => {
      modes.querySelectorAll("[data-mode]").forEach((x) => x.classList.toggle("is-active", x === b));
      state.mode = b.dataset.mode;
      task.innerHTML = TASKS[state.mode];
      root.querySelector('[data-el-gate="single"]').hidden = state.mode !== "single";
      root.querySelector('[data-el-gate="build"]').hidden = state.mode !== "build";
      // a fresh start: no ghosts from an earlier build
      stop();
      state.moving = false;
      state.ghosts = [];
      if (state.mode === "build") {
        state.build = 0;
        paint(I);
      }
      update();
    }));
    task.innerHTML = TASKS.single;

    // Prediction before the first exploration result is explained.
    const gate = root.querySelector('[data-el-gate="single"]');
    gate.innerHTML = `<div class="ch3l-predict"><div class="ch3l-predict-q"><span>先猜一猜</span><p>${tex("R_2\\leftarrow R_2+2R_1")} 对应的 ${tex("P(2,1(2))=\\begin{pmatrix}1&0\\\\2&1\\end{pmatrix}")} 会把单位正方形变成什么？</p></div>
      <div class="ch3l-predict-options">${(window.LAStableShuffle || ((a) => a))([
        ["沿竖直方向剪切，面积不变", true, ""],
        ["沿水平方向剪切，面积不变", false, "P 改变的是第 2 个坐标：(x,y) 变成 (x, 2x+y)。"],
        ["竖直方向拉长 2 倍，面积变为 2 倍", false, "det P=1，面积不变。"],
        ["绕原点旋转", false, "e₁ 被送到 (1,2)，e₂ 保持不动，长度变了，所以不是旋转。"],
      ], "visuals/ch4/section6-elementary.js").map(([t, ok, why], i) => `<button type="button" data-i="${i}" data-ok="${ok}" data-why="${why}">${t}</button>`).join("")}</div><p class="ch3l-predict-feedback" hidden></p></div>`;
    // predict → act → reveal: the verdict opens only after the student also acts on the lab
    let picked = null;
    let revealed = false;
    const fb = gate.querySelector(".ch3l-predict-feedback");
    const reveal = () => {
      if (revealed || !picked) return;
      revealed = true;
      const ok = picked.dataset.ok === "true";
      gate.querySelectorAll("[data-i]").forEach((x) => x.classList.remove("is-picked"));
      picked.classList.add(ok ? "is-right" : "is-wrong");
      gate.querySelector(".ch3l-predict").classList.add("is-done");
      fb.innerHTML = ok
        ? `✓ 每个点的 ${tex("y")} 坐标加上 ${tex("2x")}，${tex("x")} 坐标不变：竖直方向的剪切。倍加矩阵的行列式为 1，所以面积不变，这正是第二章“倍加不改变行列式”的几何原因。`
        : `再看看图：${picked.dataset.why}`;
    };
    gate.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => {
      if (revealed) return;
      picked = b;
      gate.querySelectorAll("[data-i]").forEach((x) => x.classList.toggle("is-picked", x === b));
      fb.hidden = false;
      fb.textContent = "记下了你的猜测。现在动手操作一次，结论随后出现。";
      // “作用 P” opens once a guess exists
      if (state.mode === "single") singleInfo();
    }));
    /*
     * Only the controls of the single-operation view are actions here (a slider counts on
     * release). The verdict needs the lab on R₂ ← R₂ + 2R₁ with P applied; an action on
     * another operation keeps the guess and says where the asked one is.
     */
    const judge = () => {
      if (revealed || !picked || state.mode !== "single") return;
      if (onAsked() && state.applied) {
        reveal();
        return;
      }
      fb.hidden = false;
      fb.innerHTML = `题目问的是 ${tex("P(2,1(2))")}：选“倍加”中的 ${tex("R_2\\leftarrow R_2+cR_1")}，取 ${tex("c=2")}，结论随后出现。`;
    };
    side.addEventListener("change", judge);
    side.addEventListener("click", (e) => { if (e.target.closest("button")) judge(); });

    /*
     * The build has its own prediction: in which order do the four factors end up?
     * The steps open once it is picked; the verdict waits until the grid reaches A.
     */
    const buildBox = root.querySelector('[data-el-gate="build"]');
    const wrong = `${tex("P_1P_2P_3P_4")} 算出来是 ${tex(texM(WRONG_ORDER))}`;
    buildGate = window.LAPredictGate?.mount(buildBox, {
      question: `按 ${tex("P_1")}、${tex("P_2")}、${tex("P_3")}、${tex("P_4")} 的次序一步步作用（${tex("P_1")} 最先），网格最后停在哪个乘积上？`,
      options: [
        [tex("P_4P_3P_2P_1"), true, ""],
        [tex("P_1P_2P_3P_4"), false, `每作用一步，新的初等矩阵乘在左边，最先作用的 ${tex("P_1")} 留在最右边。${wrong}，网格停不到 A。`],
        ["两种次序结果一样", false, `矩阵乘法一般不能交换次序，${wrong}，不等于 A。`],
      ],
      key: "visuals/ch4/section6-elementary.js#build",
      right: `✓ 每作用一步，新的初等矩阵就乘在左边。图中的虚线依次是 ${tex("E")}、${tex("P_1")}、${tex("P_2P_1")}、${tex("P_3P_2P_1")} 的像，最后到达 ${tex("A=P_4P_3P_2P_1")}。`,
      root: buildBox,
      manual: true,
      onPick: () => {
        const note = buildBox.querySelector(".ch3l-predict-feedback");
        if (note) note.textContent = "记下了你的猜测。按“作用下一步”走完四步，结论随后出现。";
        if (state.mode === "build") buildSide();
      },
    }) || null;

    ro = new ResizeObserver(() => paint(state.shown));
    ro.observe(canvas);
    update();
    return () => {
      stop();
      ro.disconnect();
    };
  }

  function renderFormal(root) {
    if (!root) return;
    const block = (title, math, text) => `<article class="ch3l-theorem"><h3>${title}</h3>${math ? `<div class="ch3l-theorem-math">${texD(math)}</div>` : ""}<p>${text}</p></article>`;
    root.innerHTML = `<h2>定理概念</h2><div class="ch3l-formal">
      ${block(`对 ${tex("E")} 做一次行变换，得到初等矩阵`, "P(i,j),\\qquad P(i(k))\\ (k\\ne0),\\qquad P(i,j(k))", `三类初等矩阵分别来自交换 ${tex("E")} 的两行、用非零数 ${tex("k")} 乘 ${tex("E")} 的一行、把 ${tex("E")} 的第 ${tex("j")} 行的 ${tex("k")} 倍加到第 ${tex("i")} 行。`)}
      ${block("左乘做行变换，右乘做列变换", "P\\,A=\\text{对 }A\\text{ 做同一行变换},\\qquad A\\,P=\\text{对 }A\\text{ 做对应的列变换}", `左乘时，${tex("P")} 的每一行组合 ${tex("A")} 的各行，所以 ${tex("P")} 记录的行规则原样作用到 ${tex("A")} 上。三类初等矩阵都可逆，逆矩阵就是逆变换对应的初等矩阵；它们的行列式分别是 ${tex("-1")}、${tex("k")}、${tex("1")}。`)}
      ${block("可逆矩阵 = 初等矩阵的乘积", "A\\ \\text{可逆}\\iff A=P_1P_2\\cdots P_s", `可逆矩阵可以经过初等行变换化成 ${tex("E")}，把这些变换倒过来，就把 ${tex("A")} 写成了初等矩阵的乘积。几何上，任何可逆线性变换都由若干次剪切、伸缩和反射复合而成。`)}
      <div class="ch3l-pitfalls"><h3>容易错在哪里</h3><ul>
        <li>把 ${tex("R_2\\leftarrow R_2+2R_1")} 的 2 写到第 1 行第 2 列。对 ${tex("E")} 做这次变换，改变的是第 2 行，2 应落在 ${tex("(2,1)")} 位置。</li>
        <li>把左乘和右乘弄反：行变换左乘，列变换右乘。</li>
        <li>以为“一行乘 0”也是初等变换。它不可逆，不对应初等矩阵。</li>
      </ul></div></div>`;
  }

  window.defineChapter4Renderer?.("elementary-matrices", { formal: renderFormal, interactive: renderInteractive });
})();


;/* visuals/ch4/section3-presentation.js */
(() => {
  const SECTION_ID = "matrix-product-determinant-rank";
  const mathInline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const mathDisplay = (source) => (window.texDisplay ? window.texDisplay(source) : `<code>${source}</code>`);

  const I = [[1, 0], [0, 1]];
  const PRODUCT_A = [[2, 0], [0, 1]];
  const PRODUCT_B = [[1, 1], [0, 1]];
  const PRODUCT_AB = [[2, 2], [0, 1]];
  const PRODUCT_BA = [[2, 1], [0, 1]];
  // B crushes the whole plane onto the line y = x (rank 1)
  const BOTTLENECK_B = [[1, -1], [1, -1]];

  const canvasMatrices = new WeakMap();
  const canvasFrames = new WeakMap();
  const canvasOptions = new WeakMap();
  let activeRoot = null;
  let activeResizeObserver = null;
  let activeThemeObserver = null;
  let redrawFrame = 0;

  const cloneMatrix = (matrix) => matrix.map((row) => [...row]);
  const determinant = (matrix) => matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  const multiply = (left, right) => [
    [left[0][0] * right[0][0] + left[0][1] * right[1][0], left[0][0] * right[0][1] + left[0][1] * right[1][1]],
    [left[1][0] * right[0][0] + left[1][1] * right[1][0], left[1][0] * right[0][1] + left[1][1] * right[1][1]],
  ];
  const interpolateMatrix = (from, to, t) => from.map((row, i) => row.map((value, j) => value + (to[i][j] - value) * t));
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2);
  const reducedMotion = () => Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);

  function rank2(matrix) {
    const eps = 1e-6;
    if (Math.abs(determinant(matrix)) > eps) return 2;
    return matrix.flat().some((value) => Math.abs(value) > eps) ? 1 : 0;
  }

  function formatNumber(value) {
    const safe = Math.abs(value) < 5e-4 ? 0 : value;
    const rounded = Math.round(safe * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  }

  function matrixTex(matrix) {
    return `\\begin{bmatrix}${matrix.map((row) => row.map(formatNumber).join("&")).join("\\\\")}\\end{bmatrix}`;
  }

  function matrixGrid(matrix, className = "") {
    return `<span class="s3-matrix ${className}" style="--s3-cols:${matrix[0].length}">${matrix
      .flatMap((row) => row.map((value) => `<i>${formatNumber(value).replace("-", "−")}</i>`))
      .join("")}</span>`;
  }

  function getPalette() {
    const style = getComputedStyle(document.body);
    return {
      surface: style.getPropertyValue("--surface-solid").trim() || "#ffffff",
      surfaceSoft: style.getPropertyValue("--surface-soft").trim() || "#f2f7f5",
      text: style.getPropertyValue("--text").trim() || "#071512",
      muted: style.getPropertyValue("--muted").trim() || "#5f6965",
      line: style.getPropertyValue("--line-strong").trim() || "rgba(21,52,45,.22)",
      accent: style.getPropertyValue("--accent").trim() || "#2c5e4a",
      accentStrong: style.getPropertyValue("--accent-strong").trim() || "#1f4a39",
      coral: style.getPropertyValue("--coral").trim() || "#c4552f",
      blue: style.getPropertyValue("--blue").trim() || "#2a64a8",
      paper: style.getPropertyValue("--cv-paper").trim() || "#fdfcf8",
      axis: style.getPropertyValue("--cv-axis").trim() || "#8a8d84",
      v1: style.getPropertyValue("--cv-v1").trim() || "#2a64a8",
      v2: style.getPropertyValue("--cv-v2").trim() || "#c4552f",
      image: style.getPropertyValue("--cv-image").trim() || "#8c4f86",
    };
  }

  function setupCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const dpr = window.devicePixelRatio || 1;
    const pixelWidth = Math.max(1, Math.round(width * dpr));
    const pixelHeight = Math.max(1, Math.round(height * dpr));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return { ctx, width, height };
  }

  function drawLine(ctx, from, to, color, width = 1, alpha = 1) {
    if (![from.x, from.y, to.x, to.y].every(Number.isFinite)) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.restore();
  }

  function drawArrow(ctx, from, to, color, label, width = 3) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy);
    if (length < 3) return;
    const angle = Math.atan2(dy, dx);
    const head = Math.min(11, Math.max(7, length * 0.16));
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - head * Math.cos(angle - Math.PI / 6), to.y - head * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(to.x - head * Math.cos(angle + Math.PI / 6), to.y - head * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    if (label) {
      ctx.font = "700 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      ctx.fillText(label, to.x + 8, to.y - 8);
    }
    ctx.restore();
  }

  function drawTransformScene(canvas, matrix, options = {}) {
    canvasMatrices.set(canvas, cloneMatrix(matrix));
    canvasOptions.set(canvas, options);
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const origin = { x: width * 0.5, y: height * 0.55 };
    const scale = Math.min(width, height) / 8.4;
    const reachX = width / (2 * scale) + 1;
    const reachY = height / (2 * scale) + 1;
    const point = (x, y, transformed = false) => {
      const px = transformed ? matrix[0][0] * x + matrix[0][1] * y : x;
      const py = transformed ? matrix[1][0] * x + matrix[1][1] * y : y;
      return { x: origin.x + px * scale, y: origin.y - py * scale };
    };

    ctx.fillStyle = palette.paper;
    ctx.fillRect(0, 0, width, height);

    for (let i = Math.floor(-reachY); i <= Math.ceil(reachY); i += 1) {
      drawLine(ctx, point(-reachX, i), point(reachX, i), palette.axis, i === 0 ? 1.2 : 1, i === 0 ? 0.26 : 0.08);
    }
    for (let i = Math.floor(-reachX); i <= Math.ceil(reachX); i += 1) {
      drawLine(ctx, point(i, -reachY), point(i, reachY), palette.axis, i === 0 ? 1.2 : 1, i === 0 ? 0.26 : 0.08);
    }

    const columnLengths = [Math.hypot(matrix[0][0], matrix[1][0]), Math.hypot(matrix[0][1], matrix[1][1])];
    const nonZero = Math.max(...columnLengths) > 1e-7;
    const minLength = Math.max(Math.min(...columnLengths.filter((value) => value > 1e-7)), 0.15);
    const domain = Math.min(45, Math.max(10, Math.hypot(reachX, reachY) / minLength + 2));
    if (nonZero) {
      for (let i = -Math.ceil(domain); i <= Math.ceil(domain); i += 1) {
        drawLine(ctx, point(-domain, i, true), point(domain, i, true), palette.image, i === 0 ? 1.4 : 1.05, i === 0 ? 0.5 : 0.2);
        drawLine(ctx, point(i, -domain, true), point(i, domain, true), palette.image, i === 0 ? 1.4 : 1.05, i === 0 ? 0.5 : 0.2);
      }
    }

    const p00 = point(0, 0, true);
    const p10 = point(1, 0, true);
    const p11 = point(1, 1, true);
    const p01 = point(0, 1, true);
    const signedArea = determinant(matrix);
    if (Math.abs(signedArea) > 1e-5) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p00.x, p00.y);
      ctx.lineTo(p10.x, p10.y);
      ctx.lineTo(p11.x, p11.y);
      ctx.lineTo(p01.x, p01.y);
      ctx.closePath();
      /* the cell is a result (purple); a reversed orientation is drawn dashed */
      ctx.fillStyle = palette.image;
      ctx.globalAlpha = signedArea > 0 ? 0.12 : 0.07;
      ctx.fill();
      ctx.globalAlpha = 0.8;
      if (signedArea < 0) ctx.setLineDash([6, 4]);
      ctx.strokeStyle = palette.image;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.restore();
    }

    // ghost of an earlier state: same colours, dashed, 35% alpha
    if (options.ghost) {
      const g = options.ghost;
      const gp = (x, y) => ({ x: origin.x + (g[0][0] * x + g[0][1] * y) * scale, y: origin.y - (g[1][0] * x + g[1][1] * y) * scale });
      const col = Math.hypot(g[0][0], g[1][0]) > 1e-7 ? [g[0][0], g[1][0]] : [g[0][1], g[1][1]];
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.setLineDash([6, 5]);
      if (rank2(g) === 1) {
        // the line B crushed the plane onto
        const k = 40 / Math.hypot(col[0], col[1]);
        drawLine(ctx, { x: origin.x - col[0] * k * scale, y: origin.y + col[1] * k * scale }, { x: origin.x + col[0] * k * scale, y: origin.y - col[1] * k * scale }, palette.image, 1.6, 0.35);
        if (options.ghostName) {
          // name the dashed line near where it leaves the canvas, on the upper-right side
          const len = Math.hypot(col[0], col[1]);
          const u = [col[0] / len, col[1] / len];
          const dir = u[1] < 0 || (u[1] === 0 && u[0] < 0) ? -1 : 1;
          const w = width;
          const h = height;
          let t = Math.max(w, h) / scale;
          let at = null;
          for (; t > 0.2; t *= 0.92) {
            const q = { x: origin.x + dir * u[0] * t * scale, y: origin.y - dir * u[1] * t * scale };
            if (q.x > 18 && q.x < w - 70 && q.y > 26 && q.y < h - 18) { at = q; break; }
          }
          if (at) {
            ctx.save();
            ctx.globalAlpha = 0.9;
            ctx.setLineDash([]);
            ctx.font = "600 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
            ctx.lineWidth = 4;
            ctx.strokeStyle = palette.paper;
            ctx.fillStyle = palette.image;
            ctx.strokeText(options.ghostName, at.x + 8, at.y - 6);
            ctx.fillText(options.ghostName, at.x + 8, at.y - 6);
            ctx.restore();
          }
        }
      }
      drawArrow(ctx, origin, gp(1, 0), palette.v1, "", 2.2);
      drawArrow(ctx, origin, gp(0, 1), palette.v2, "", 2.2);
      ctx.restore();
      // the ghost's names stay readable: same colours, stronger than the dashed strokes
      [[gp(1, 0), palette.v1, options.ghostLabels?.[0]], [gp(0, 1), palette.v2, options.ghostLabels?.[1]]].forEach(([tip, color, name]) => {
        if (!name || Math.hypot(tip.x - origin.x, tip.y - origin.y) < 3) return;
        // a ghost column that coincides with a current one is already named by it
        if ([point(1, 0, true), point(0, 1, true)].some((q) => Math.hypot(q.x - tip.x, q.y - tip.y) < 4)) return;
        ctx.save();
        ctx.globalAlpha = 0.75;
        ctx.font = "italic 600 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
        ctx.lineWidth = 3;
        ctx.strokeStyle = palette.paper;
        ctx.fillStyle = color;
        ctx.strokeText(name, tip.x + 8, tip.y - 8);
        ctx.fillText(name, tip.x + 8, tip.y - 8);
        ctx.restore();
      });
    }

    const firstEnd = point(1, 0, true);
    const secondEnd = point(0, 1, true);
    drawArrow(ctx, origin, firstEnd, palette.v1, options.firstLabel ?? "第 1 列", 3.1);
    drawArrow(ctx, origin, secondEnd, palette.v2, options.secondLabel ?? "第 2 列", 3.1);

    ctx.save();
    ctx.fillStyle = palette.text;
    ctx.globalAlpha = 0.72;
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, nonZero ? 3.2 : 4.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    canvas._s3Geometry = { origin, scale, firstEnd, secondEnd };
  }

  function cancelCanvasAnimation(canvas) {
    const frame = canvasFrames.get(canvas);
    if (frame) cancelAnimationFrame(frame);
    canvasFrames.delete(canvas);
  }

  function animateCanvasTo(canvas, target, options = {}) {
    cancelCanvasAnimation(canvas);
    const from = cloneMatrix(canvasMatrices.get(canvas) || I);
    const duration = reducedMotion() ? 0 : options.duration ?? 620;
    if (duration <= 0) {
      drawTransformScene(canvas, target, options.drawOptions);
      options.onUpdate?.(target, 1);
      return Promise.resolve(target);
    }
    const start = performance.now();
    return new Promise((resolve) => {
      const frame = (now) => {
        if (!activeRoot?.isConnected) {
          canvasFrames.delete(canvas);
          resolve(canvasMatrices.get(canvas) || target);
          return;
        }
        const t = Math.min(1, (now - start) / duration);
        const current = interpolateMatrix(from, target, easeInOutCubic(t));
        drawTransformScene(canvas, current, options.drawOptions);
        options.onUpdate?.(current, t);
        if (t < 1) {
          const id = requestAnimationFrame(frame);
          canvasFrames.set(canvas, id);
          return;
        }
        canvasFrames.delete(canvas);
        drawTransformScene(canvas, target, options.drawOptions);
        options.onUpdate?.(target, 1);
        resolve(target);
      };
      const id = requestAnimationFrame(frame);
      canvasFrames.set(canvas, id);
    });
  }

  function miniShape(matrix, label) {
    const points = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([x, y]) => [matrix[0][0] * x + matrix[0][1] * y, matrix[1][0] * x + matrix[1][1] * y]);
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    const minX = Math.min(-0.25, ...xs) - 0.2;
    const maxX = Math.max(1.25, ...xs) + 0.2;
    const minY = Math.min(-0.25, ...ys) - 0.2;
    const maxY = Math.max(1.25, ...ys) + 0.2;
    const width = maxX - minX;
    const height = maxY - minY;
    const map = ([x, y]) => `${24 + ((x - minX) / width) * 132},${142 - ((y - minY) / height) * 112}`;
    return `<svg viewBox="0 0 180 160" role="img" aria-label="${label}">
      <path class="s3-mini-axis" d="M18 142H164M24 150V14"></path>
      <polygon class="s3-mini-shape" points="${points.map(map).join(" ")}"></polygon>
      <line class="s3-mini-first" x1="${map([0, 0]).split(",")[0]}" y1="${map([0, 0]).split(",")[1]}" x2="${map(points[1]).split(",")[0]}" y2="${map(points[1]).split(",")[1]}"></line>
      <line class="s3-mini-second" x1="${map([0, 0]).split(",")[0]}" y1="${map([0, 0]).split(",")[1]}" x2="${map(points[3]).split(",")[0]}" y2="${map(points[3]).split(",")[1]}"></line>
    </svg>`;
  }

  function renderFormal(formal) {
    if (!formal) return;
    formal.innerHTML = `
      <h2>面积倍率与独立方向</h2>
      <div class="s3-formal">
        <p class="s3-lead">两列张成的平行四边形同时回答两个问题：行列式给出面积倍率和方向是否翻转，秩给出输出还剩几个独立方向。</p>

        <section class="s3-formal-module" aria-labelledby="s3-two-meters-title">
          <div class="s3-module-heading"><span>01</span><div><h3 id="s3-two-meters-title">同一张图，两个仪表</h3><p>行列式和秩会在坍缩处相遇，但它们记录的信息不同。</p></div></div>
          <div class="s3-two-meters">
            <article><span>连续量</span><strong>行列式</strong>${mathDisplay("\\det(A)=ad-bc")}<p>绝对值连续记录面积倍率；符号记录两列的方向顺序。</p></article>
            <article><span>离散量</span><strong>秩</strong>${mathDisplay("\\operatorname{rank}(A)\\in\\{0,1,2\\}")}<p>二维输出是平面、直线还是一个点。秩只在临界状态跳变。</p></article>
          </div>
          <div class="s3-sign-strip">
            <div><i class="is-positive"></i><strong>${mathInline("\\det>0")}</strong><span>面积保留方向</span></div>
            <div><i class="is-negative"></i><strong>${mathInline("\\det<0")}</strong><span>面积保留但方向翻转</span></div>
            <div><i class="is-zero"></i><strong>${mathInline("\\det=0")}</strong><span>平面坍缩，秩下降</span></div>
          </div>
        </section>

        <section class="s3-formal-module" aria-labelledby="s3-det-one-title">
          <div class="s3-module-heading"><span>02</span><div><h3 id="s3-det-one-title">${mathInline("\\det(A)=1")} 只说明面积不变</h3><p>单位矩阵、剪切和互补缩放可以拥有同一个行列式。</p></div></div>
          <div class="s3-det-one-gallery">
            <article>${miniShape([[1, 0], [0, 1]], "单位矩阵保持单位正方形")}<strong>单位矩阵</strong>${mathInline("\\det(E)=1")}<p>形状与面积都不变。</p></article>
            <article>${miniShape([[1, 0.8], [0, 1]], "剪切保持面积但改变形状")}<strong>剪切</strong>${mathInline("\\det(S)=1")}<p>形状改变，面积仍为 1。</p></article>
            <article>${miniShape([[2, 0], [0, 0.5]], "一方向放大另一方向缩小")}<strong>互补缩放</strong>${mathInline("\\det(D)=1")}<p>宽度乘 2，高度乘 1/2。</p></article>
          </div>
        </section>

        <section class="s3-formal-module" aria-labelledby="s3-laws-title">
          <div class="s3-module-heading"><span>03</span><div><h3 id="s3-laws-title">乘积的两条主线</h3><p>面积倍率可以累积；独立方向受到最窄一步的限制。</p></div></div>
          <div class="s3-law-pair">
            <article><span>面积计量</span>${mathDisplay("\\det(AB)=\\det(A)\\det(B)")}<p>先经过 ${mathInline("B")}，再经过 ${mathInline("A")}；单位面积依次乘上两个缩放因子。</p></article>
            <article><span>方向瓶颈</span>${mathDisplay("\\operatorname{rank}(AB)\\leq\\min\\{\\operatorname{rank}(A),\\operatorname{rank}(B)\\}")}<p>一旦输出被压到直线，后面的线性变换只能移动或继续压缩这条直线。</p></article>
          </div>
          <div class="s3-invertible-note">
            <strong>可逆因子不会成为瓶颈</strong>
            <p>${mathInline("A")} 可逆时，${mathInline("\\operatorname{rank}(AB)=\\operatorname{rank}(B)")}；${mathInline("B")} 可逆时，${mathInline("\\operatorname{rank}(AB)=\\operatorname{rank}(A)")}。</p>
          </div>
        </section>

        <section class="s3-formal-module" aria-labelledby="s3-row-column-title">
          <div class="s3-module-heading"><span>04</span><div><h3 id="s3-row-column-title">行秩与列秩是同一个数</h3><p>转置会交换行与列，却不会改变独立方向的数量。</p></div></div>
          <div class="s3-transpose-rank" data-s3-transpose-rank>
            <div class="s3-transpose-matrix" data-s3-transpose-matrix>${matrixGrid([[1, 0, 1], [0, 1, 1]])}</div>
            <button type="button" data-s3-transpose-toggle>转置</button>
            <div class="s3-transpose-copy"><strong data-s3-transpose-name>${mathInline("M")} 是 ${mathInline("2\\times3")}</strong><p data-s3-transpose-text>两行独立；三列中第三列是前两列之和。行秩与列秩都等于 2。</p></div>
          </div>
          <div class="s3-rank-equality">${mathDisplay("\\operatorname{rank}(M^T)=\\operatorname{rank}(M)")}</div>
        </section>
      </div>
    `;
    bindTransposeRank(formal);
  }

  function bindTransposeRank(root) {
    const lab = root.querySelector("[data-s3-transpose-rank]");
    if (!lab) return;
    const original = [[1, 0, 1], [0, 1, 1]];
    const transposed = [[1, 0], [0, 1], [1, 1]];
    let flipped = false;
    const paint = () => {
      const matrix = flipped ? transposed : original;
      lab.querySelector("[data-s3-transpose-matrix]").innerHTML = matrixGrid(matrix);
      lab.querySelector("[data-s3-transpose-name]").innerHTML = flipped ? `${mathInline("M^T")} 是 ${mathInline("3\\times2")}` : `${mathInline("M")} 是 ${mathInline("2\\times3")}`;
      lab.querySelector("[data-s3-transpose-text]").textContent = flipped
        ? "原来的列成为行，原来的行成为列；独立方向数仍是 2。"
        : "两行独立；三列中第三列是前两列之和。行秩与列秩都等于 2。";
      lab.querySelector("[data-s3-transpose-toggle]").innerHTML = flipped ? `转置回 ${mathInline("M")}` : "转置";
      lab.classList.toggle("is-transposed", flipped);
    };
    lab.querySelector("[data-s3-transpose-toggle]")?.addEventListener("click", () => {
      flipped = !flipped;
      paint();
    });
    paint();
  }

  function renderInteractive(interactive) {
    if (!interactive) return;
    interactive.innerHTML = `
      <h2>交互实验</h2>
      <div class="s3-lab" data-s3-lab>
        <div class="s3-lab-heading">
          <div><h3>连续作用两个矩阵</h3><p>先作用 ${mathInline("B")}，再作用 ${mathInline("A")}，合起来就是 ${mathInline("AB")}。“面积倍率”看面积怎样累积，“丢掉的方向”看压扁之后还能不能恢复。</p></div>
        </div>
        <div class="s3-tabs" role="tablist" aria-label="第三节实验视角">
          <button type="button" role="tab" class="is-active" aria-selected="true" data-s3-tab="product">面积倍率</button>
          <button type="button" role="tab" aria-selected="false" data-s3-tab="bottleneck">丢掉的方向</button>
        </div>

        <div class="s3-panels">
          <section class="s3-panel is-active" role="tabpanel" data-s3-panel="product">
            <div class="s3-product-lab" data-s3-product-lab>
              <div data-s3-product-gate></div>
              <div class="s3-product-actions">
                <button type="button" class="button primary is-primary" data-s3-product-play>同步播放 ${mathInline("AB")} 与 ${mathInline("BA")}</button>
                <button type="button" class="button" data-s3-product-reset>重置</button>
              </div>
              <p class="s3-product-given">${mathInline("A=\\begin{bmatrix}2&0\\\\0&1\\end{bmatrix}")}（横向拉伸 2 倍），${mathInline("B=\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}")}（剪切）。</p>
              <div class="s3-product-grid">
                <article class="s3-canvas-card"><div class="s3-stage-top"><strong>${mathInline("AB")}：先 ${mathInline("B")} 后 ${mathInline("A")}</strong><span data-s3-ab-stage>单位正方形</span></div><canvas data-s3-ab-canvas aria-label="AB 的连续面积变换"></canvas></article>
                <article class="s3-canvas-card"><div class="s3-stage-top"><strong>${mathInline("BA")}：先 ${mathInline("A")} 后 ${mathInline("B")}</strong><span data-s3-ba-stage>单位正方形</span></div><canvas data-s3-ba-canvas aria-label="BA 的连续面积变换"></canvas></article>
              </div>
              <div class="s3-area-meter" data-s3-product-answer hidden>
                <div><span>起点</span><strong>1</strong><small>单位正方形面积</small></div><i>×</i>
                <div><span>${mathInline("\\det(B)")}</span><strong>1</strong><small>剪切保持面积</small></div><i>×</i>
                <div><span>${mathInline("\\det(A)")}</span><strong>2</strong><small>横向拉伸两倍</small></div><i>=</i>
                <div class="is-result"><span>最终面积</span><strong>2</strong><small>${mathInline("AB")} 与 ${mathInline("BA")} 相同</small></div>
              </div>
              <div class="s3-product-conclusion" data-s3-product-answer hidden>
                <div>${mathDisplay("\\det(AB)=\\det A\\cdot\\det B=2")}</div>
                <div>${mathDisplay("\\det(BA)=\\det B\\cdot\\det A=2")}</div>
                <p>两种顺序得到的平行四边形不同，面积倍率却相同：每一步的倍率依次相乘。</p>
              </div>
            </div>
          </section>

          <section class="s3-panel" role="tabpanel" data-s3-panel="bottleneck" hidden>
            <div class="s3-bottleneck-lab" data-s3-bottleneck-lab>
              <div data-s3-bottleneck-gate></div>
              <div class="s3-bottleneck-controls" role="group" aria-label="选择第二步矩阵 A">
                <button type="button" data-s3-bottleneck="shear">剪切</button>
                <button type="button" data-s3-bottleneck="rotate">旋转 90°</button>
                <button type="button" data-s3-bottleneck="stretch">纵向拉伸</button>
                <button type="button" data-s3-bottleneck="kill">把 ${mathInline("y=x")} 压到 0</button>
              </div>
              <div class="s3-bottleneck-flow">
                <article class="s3-canvas-card"><div class="s3-stage-top"><strong>第一步：${mathInline("B")}</strong><span>平面 → 直线 ${mathInline("y=x")}</span></div><canvas data-s3-b-canvas aria-label="秩一矩阵 B 的输出"></canvas><footer>${mathInline(`B=${matrixTex(BOTTLENECK_B)},\\ \\operatorname{rank}(B)=1`)}</footer></article>
                <div class="s3-flow-arrow"><strong data-s3-a-label>${mathInline("A=?")}</strong><span data-s3-a-matrix></span></div>
                <article class="s3-canvas-card"><div class="s3-stage-top"><strong>第二步：${mathInline("AB")}</strong><span data-s3-ab-rank-label>等待选择 ${mathInline("A")}</span></div><canvas data-s3-bottleneck-canvas aria-label="复合矩阵 AB 的输出"></canvas><footer data-s3-bottleneck-rank></footer></article>
              </div>
              <div class="s3-bottleneck-readout">
                <strong data-s3-bottleneck-title>选一个 ${mathInline("A")}</strong>
                <p data-s3-bottleneck-copy>${mathInline("B")} 已经把整个平面压到直线 ${mathInline("y=x")} 上。选一个 ${mathInline("A")} 作用在这条直线上，看 ${mathInline("AB")} 的输出。</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    `;

    activeRoot = interactive;
    bindTabs(interactive);
    bindProductLab(interactive);
    bindBottleneckLab(interactive);
    bindResponsiveRedraw(interactive);
  }

  function bindTabs(root) {
    const tabs = [...root.querySelectorAll("[data-s3-tab]")];
    const panels = [...root.querySelectorAll("[data-s3-panel]")];
    const activate = (id, focus = false) => {
      tabs.forEach((tab) => {
        const active = tab.dataset.s3Tab === id;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        if (active && focus) tab.focus();
      });
      panels.forEach((panel) => {
        const active = panel.dataset.s3Panel === id;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });
      requestAnimationFrame(() => redrawAll(root));
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab.dataset.s3Tab));
      tab.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        activate(tabs[next].dataset.s3Tab, true);
      });
    });
  }

  function bindProductLab(root) {
    const lab = root.querySelector("[data-s3-product-lab]");
    if (!lab) return;
    const abCanvas = lab.querySelector("[data-s3-ab-canvas]");
    const baCanvas = lab.querySelector("[data-s3-ba-canvas]");
    const abStage = lab.querySelector("[data-s3-ab-stage]");
    const baStage = lab.querySelector("[data-s3-ba-stage]");
    const answers = [...lab.querySelectorAll("[data-s3-product-answer]")];
    const gate = window.LAPredictGate?.mount(lab.querySelector("[data-s3-product-gate]"), {
      root: lab,
      manual: true,
      key: "visuals/ch4/section3-presentation.js#product",
      question: `${mathInline("\\det A=2")}，${mathInline("\\det B=1")}。先 ${mathInline("B")} 后 ${mathInline("A")} 得到 ${mathInline("AB")}，先 ${mathInline("A")} 后 ${mathInline("B")} 得到 ${mathInline("BA")}。两个平行四边形会怎样？`,
      options: [
        ["形状不同，面积都是 2", true, ""],
        ["形状相同，面积都是 2", false, "AB 的第二列是 (2,1)ᵀ，BA 的第二列是 (1,1)ᵀ，两个平行四边形不一样。"],
        ["形状不同，面积分别是 2 和 1", false, "两种顺序经过的是同样两步，倍率都是 2×1。"],
        ["面积都是 3", false, "面积倍率相乘：1×2=2，不是相加。"],
      ],
      right: "✓ 形状取决于顺序，面积倍率与顺序无关：每经过一步，面积就乘上这一步的行列式。",
      onReveal: () => answers.forEach((n) => { n.hidden = false; }),
    });
    let run = 0;
    const reset = () => {
      run += 1;
      cancelCanvasAnimation(abCanvas);
      cancelCanvasAnimation(baCanvas);
      drawTransformScene(abCanvas, I, { firstLabel: "e₁", secondLabel: "e₂" });
      drawTransformScene(baCanvas, I, { firstLabel: "e₁", secondLabel: "e₂" });
      abStage.textContent = "单位正方形";
      baStage.textContent = "单位正方形";
    };
    lab.querySelector("[data-s3-product-play]")?.addEventListener("click", async () => {
      reset();
      const id = run;
      // labels name the step; the current area is shown only once a step is complete
      abStage.innerHTML = `第 1 步：作用 ${mathInline("B")}`;
      baStage.innerHTML = `第 1 步：作用 ${mathInline("A")}`;
      await Promise.all([
        animateCanvasTo(abCanvas, PRODUCT_B, { drawOptions: { firstLabel: "Be₁", secondLabel: "Be₂", ghost: I } }),
        animateCanvasTo(baCanvas, PRODUCT_A, { drawOptions: { firstLabel: "Ae₁", secondLabel: "Ae₂", ghost: I } }),
      ]);
      if (id !== run) return;
      abStage.textContent = "当前面积 1";
      baStage.textContent = "当前面积 2";
      if (!reducedMotion()) await new Promise((resolve) => setTimeout(resolve, 420));
      if (id !== run) return;
      abStage.innerHTML = `第 2 步：作用 ${mathInline("A")}`;
      baStage.innerHTML = `第 2 步：作用 ${mathInline("B")}`;
      await Promise.all([
        animateCanvasTo(abCanvas, PRODUCT_AB, { drawOptions: { firstLabel: "ABe₁", secondLabel: "ABe₂", ghost: PRODUCT_B, ghostLabels: ["Be₁", "Be₂"] } }),
        animateCanvasTo(baCanvas, PRODUCT_BA, { drawOptions: { firstLabel: "BAe₁", secondLabel: "BAe₂", ghost: PRODUCT_A, ghostLabels: ["Ae₁", "Ae₂"] } }),
      ]);
      if (id !== run) return;
      abStage.textContent = "最终面积 2";
      baStage.textContent = "最终面积 2";
      gate?.acted();
    });
    lab.querySelector("[data-s3-product-reset]")?.addEventListener("click", reset);
    reset();
  }

  function bindBottleneckLab(root) {
    const lab = root.querySelector("[data-s3-bottleneck-lab]");
    if (!lab) return;
    const bCanvas = lab.querySelector("[data-s3-b-canvas]");
    const resultCanvas = lab.querySelector("[data-s3-bottleneck-canvas]");
    // every A acts on the line y = x that B left behind
    const presets = {
      shear: { label: "剪切", matrix: [[1, 1], [0, 1]], title: "直线被剪切到另一个方向", copy: `剪切可逆，它把 ${mathInline("y=x")} 送到经过 ${mathInline("(2,1)")} 的直线。输出仍是一条直线，${mathInline("\\operatorname{rank}(AB)=\\operatorname{rank}(B)=1")}。` },
      rotate: { label: "旋转 90°", matrix: [[0, -1], [1, 0]], title: `直线转到了 ${mathInline("y=-x")}`, copy: `旋转可逆，直线换了位置，独立方向仍然只有 1 个，${mathInline("\\operatorname{rank}(AB)=1")}。` },
      stretch: { label: "纵向拉伸", matrix: [[1, 0], [0, 2]], title: "直线变陡，仍是直线", copy: `纵向拉伸可逆，${mathInline("y=x")} 变成 ${mathInline("y=2x")}。长度和方向变了，${mathInline("\\operatorname{rank}(AB)=1")}。` },
      kill: { label: `压掉 ${mathInline("y=x")}`, matrix: [[1, -1], [1, -1]], title: "秩继续下降到 0", copy: `这个 ${mathInline("A")} 不可逆，恰好把 ${mathInline("y=x")} 上的每个点送到原点，所以 ${mathInline("AB=0")}，${mathInline("\\operatorname{rank}(AB)=0")}。` },
    };
    drawTransformScene(bCanvas, BOTTLENECK_B, { firstLabel: "Be₁", secondLabel: "Be₂", ghost: I });
    drawTransformScene(resultCanvas, BOTTLENECK_B, { firstLabel: "Be₁", secondLabel: "Be₂" });

    const gate = window.LAPredictGate?.mount(lab.querySelector("[data-s3-bottleneck-gate]"), {
      root: lab,
      manual: true,
      key: "visuals/ch4/section3-presentation.js#bottleneck",
      question: `${mathInline("B")} 已经把整个平面压到直线 ${mathInline("y=x")} 上。能不能找到一个 ${mathInline("A")}，让 ${mathInline("AB")} 的输出重新铺满整个平面？`,
      options: [
        [`不能：无论 ${mathInline("A")} 是什么，${mathInline("AB")} 的输出最多是一条直线`, true, ""],
        [`能：选一个可逆的 ${mathInline("A")} 就行`, false, "可逆的 A 只把这条直线送到另一条直线，rank(AB)=rank(B)=1。"],
        [`能：选一个行列式很大的 ${mathInline("A")}`, false, "A 只能作用在 B 的输出上，一条直线乘多大的倍数仍是直线。"],
        [`只有 ${mathInline("A=B^{-1}")} 时能`, false, "B 不可逆（det B=0），没有逆矩阵。"],
      ],
      onPick: () => lab.querySelectorAll("[data-s3-bottleneck]").forEach((b) => { b.disabled = false; b.removeAttribute("title"); }),
      right: `✓ ${mathInline("AB")} 的每个输出都是 ${mathInline("A")} 作用在 ${mathInline("B")} 的某个输出上，而 ${mathInline("B")} 的输出全在 ${mathInline("y=x")} 上，所以 ${mathInline("AB")} 的输出全在 ${mathInline("A")} 把这条直线送到的地方：一条直线或一个点。这就是 ${mathInline("\\operatorname{rank}(AB)\\leq\\min\\{\\operatorname{rank}(A),\\operatorname{rank}(B)\\}")}。`,
    });

    const select = async (id) => {
      const preset = presets[id];
      if (!preset) return;
      lab.querySelectorAll("[data-s3-bottleneck]").forEach((button) => button.classList.toggle("is-active", button.dataset.s3Bottleneck === id));
      const product = multiply(preset.matrix, BOTTLENECK_B);
      lab.querySelector("[data-s3-a-label]").innerHTML = `${mathInline("A")}：${preset.label}`;
      lab.querySelector("[data-s3-a-matrix]").innerHTML = matrixGrid(preset.matrix);
      const rank = rank2(product);
      lab.querySelector("[data-s3-ab-rank-label]").textContent = rank === 1 ? "直线 → 直线" : "直线 → 一个点";
      lab.querySelector("[data-s3-bottleneck-rank]").innerHTML = mathInline(`AB=${matrixTex(product)},\\ \\operatorname{rank}(AB)=${rank}`);
      lab.querySelector("[data-s3-bottleneck-title]").innerHTML = preset.title;
      lab.querySelector("[data-s3-bottleneck-copy]").innerHTML = preset.copy;
      // start each choice from B's output, so the move from the dashed line is visible
      drawTransformScene(resultCanvas, BOTTLENECK_B, { firstLabel: "", secondLabel: "", ghost: BOTTLENECK_B, ghostName: "B 的像" });
      gate?.acted();
      await animateCanvasTo(resultCanvas, product, { drawOptions: { firstLabel: "ABe₁", secondLabel: "ABe₂", ghost: BOTTLENECK_B, ghostLabels: ["Be₁", "Be₂"], ghostName: "B 的像" } });
    };
    lab.querySelectorAll("[data-s3-bottleneck]").forEach((button) => {
      if (!gate?.picked) { button.disabled = true; button.title = "先在上方猜一猜"; }
      button.addEventListener("click", () => select(button.dataset.s3Bottleneck));
    });
  }

  function redrawAll(root) {
    if (!root?.isConnected) return;
    // redraw each visible canvas with its last matrix and options (labels, ghost)
    root.querySelectorAll("canvas").forEach((canvas) => {
      if (!canvas.offsetParent || canvasFrames.has(canvas) || !canvasMatrices.has(canvas)) return;
      drawTransformScene(canvas, canvasMatrices.get(canvas), canvasOptions.get(canvas) || {});
    });
  }

  function bindResponsiveRedraw(root) {
    activeResizeObserver?.disconnect();
    activeThemeObserver?.disconnect();
    const schedule = () => {
      if (redrawFrame) return;
      redrawFrame = requestAnimationFrame(() => {
        redrawFrame = 0;
        if (!root.isConnected) {
          activeResizeObserver?.disconnect();
          activeThemeObserver?.disconnect();
          return;
        }
        redrawAll(root);
      });
    };
    if (typeof ResizeObserver !== "undefined") {
      activeResizeObserver = new ResizeObserver(schedule);
      root.querySelectorAll("canvas").forEach((canvas) => activeResizeObserver.observe(canvas));
    }
    activeThemeObserver = new MutationObserver(schedule);
    activeThemeObserver.observe(document.body, { attributes: true, attributeFilter: ["class", "style"] });
    window.addEventListener("resize", schedule, { passive: true, once: false });
  }

  window.defineChapter4Renderer?.(SECTION_ID, {
    formal: renderFormal,
    interactive: renderInteractive,
  });
})();


;/* visuals/ch4/section4-presentation.js */
(() => {
  const inline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const IDENTITY = [1, 0, 0, 1];
  const EPSILON = 1e-9;
  const SQUARE = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ];
  // Diagonal of the unit square: tip sits on a clear geometric vertex
  // so students can verify arrow alignment by eye.
  const SAMPLE_VECTOR = [1, 1];

  // two-step preset: shear S first, then rotation R, so A = RS
  const SHEAR_S = [1, 1, 0, 1];
  const ROTATE_R = [0, -1, 1, 0];
  // x₁ ≠ x₂ on the line x + ker A for the rank-1 preset (ker A = span{(1, −1)})
  const KERNEL_INPUTS = [[0, 2], [3, -1]];

  const PRESETS = [
    {
      key: "shearRotate",
      label: "先剪切再旋转",
      factors: [SHEAR_S, ROTATE_R],
      factorNames: ["S", "R"],
      matrix: [0, -1, 1, 1],
      description: `先剪切 ${inline("S")}，再旋转 90°（${inline("R")}）：${inline("A=RS")}。两步都可逆，${inline("A")} 也可逆。`,
    },
    {
      key: "shear",
      label: "剪切",
      matrix: [1, 0.5, 0, 1],
      description: "网格被剪斜，但两个基方向仍然独立，完整的二维信息被保留下来。",
    },
    {
      key: "rotation",
      label: "旋转 90°",
      matrix: [0, -1, 1, 0],
      description: "平面只改变方向，没有被压扁；逆变换是反向旋转 90°。",
    },
    {
      key: "scale",
      label: "非零伸缩",
      matrix: [2, 0, 0, 0.5],
      description: "横向拉长、纵向压缩，但两个方向都没有消失，变换仍然可逆。",
    },
    {
      key: "collapse",
      label: "压到直线",
      matrix: [1, 1, 0, 0],
      description: "二维平面被压到一条直线，不同输入可能得到同一个输出，信息无法恢复。",
    },
  ];

  const PRESET_MAP = Object.fromEntries(PRESETS.map((preset) => [preset.key, preset]));

  function normalizeConcepts(section) {
    return (section?.concepts || []).map((concept) =>
      Array.isArray(concept) ? { label: concept[0], text: concept[1] } : concept,
    );
  }

  function renderSection4Formal(formal, section) {
    if (!formal) return;
    const concepts = normalizeConcepts(section);
    formal.innerHTML = `
      <div class="section4-formal-head">
        <div>
          <span>从几何动作回到代数定义</span>
          <h2>定理概念</h2>
        </div>
        <p>先抓住“做完能够原路返回”，再整理可逆的判定与计算。</p>
      </div>
      <div class="section4-formal">
        <div class="definition-stack">
          ${concepts
            .map(
              (concept, index) => `
                <article class="definition-row${index === 0 ? " is-anchor" : ""}">
                  <span class="definition-index">${String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>${concept.label}</strong>
                    <p>${concept.text}</p>
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>
    `;
  }

  function determinant(matrix) {
    return matrix[0] * matrix[3] - matrix[1] * matrix[2];
  }

  function matrixRank(matrix) {
    if (Math.abs(determinant(matrix)) > EPSILON) return 2;
    return matrix.some((value) => Math.abs(value) > EPSILON) ? 1 : 0;
  }

  function inverse(matrix) {
    const det = determinant(matrix);
    if (Math.abs(det) < EPSILON) return null;
    return [matrix[3] / det, -matrix[1] / det, -matrix[2] / det, matrix[0] / det];
  }

  function multiply(left, right) {
    return [
      left[0] * right[0] + left[1] * right[2],
      left[0] * right[1] + left[1] * right[3],
      left[2] * right[0] + left[3] * right[2],
      left[2] * right[1] + left[3] * right[3],
    ];
  }

  function interpolate(from, to, amount) {
    return from.map((value, index) => value + (to[index] - value) * amount);
  }

  // factors F₀, F₁, … applied in order on the way out; undone from the last one on the way back
  function factorMatrix(factors, journey) {
    const n = factors.length;
    const steps = journey <= 1 ? factors : [...factors].reverse().map(inverse);
    const local = (journey <= 1 ? journey : journey - 1) * n;
    const k = Math.min(n - 1, Math.floor(local + 1e-9));
    let matrix = journey <= 1 ? IDENTITY : factors.reduce((acc, f) => multiply(f, acc), IDENTITY);
    for (let i = 0; i < k; i += 1) matrix = multiply(steps[i], matrix);
    return multiply(interpolate(IDENTITY, steps[k], Math.min(1, local - k)), matrix);
  }

  function effectiveMatrix(matrix, journey, factors) {
    if (factors) return factorMatrix(factors, journey);
    if (journey <= 1) return interpolate(IDENTITY, matrix, journey);
    const matrixInverse = inverse(matrix);
    if (!matrixInverse) return matrix;
    const undoProgress = journey - 1;
    const inverseInMotion = interpolate(IDENTITY, matrixInverse, undoProgress);
    return multiply(inverseInMotion, matrix);
  }

  function apply(matrix, point) {
    return [matrix[0] * point[0] + matrix[1] * point[1], matrix[2] * point[0] + matrix[3] * point[1]];
  }

  function cleanNumber(value) {
    if (Math.abs(value) < 0.005) return "0";
    const rounded = Math.round(value * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  }

  // exact value as LaTeX: integers, or a fraction with a small denominator
  function fracLatex(value) {
    if (Math.abs(value) < 1e-9) return "0";
    for (let d = 1; d <= 12; d += 1) {
      const n = Math.round(value * d);
      if (Math.abs(value * d - n) < 1e-9) {
        if (d === 1) return String(n);
        return `${n < 0 ? "-" : ""}\\tfrac{${Math.abs(n)}}{${d}}`;
      }
    }
    return cleanNumber(value);
  }

  function matrixLatex(matrix) {
    return `\\begin{bmatrix}${fracLatex(matrix[0])}&${fracLatex(matrix[1])}\\\\${fracLatex(matrix[2])}&${fracLatex(matrix[3])}\\end{bmatrix}`;
  }

  function svgPoint(matrix, point, width = 420, height = 320, scale = 60) {
    const transformed = apply(matrix, point);
    return [width / 2 + transformed[0] * scale, height / 2 - transformed[1] * scale];
  }

  function lineMarkup(matrix, from, to, className) {
    const [x1, y1] = svgPoint(matrix, from);
    const [x2, y2] = svgPoint(matrix, to);
    return `<line class="${className}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
  }

  function gridMarkup(matrix, className) {
    const lines = [];
    for (let value = -4; value <= 4; value += 1) {
      lines.push(lineMarkup(matrix, [value, -4], [value, 4], value === 0 ? `${className} is-axis` : className));
      lines.push(lineMarkup(matrix, [-4, value], [4, value], value === 0 ? `${className} is-axis` : className));
    }
    return lines.join("");
  }

  function polygonPoints(matrix, points) {
    return points.map((point) => svgPoint(matrix, point).join(",")).join(" ");
  }

  function presetButtonMarkup(preset, first) {
    const isInvertible = matrixRank(preset.matrix) === 2;
    return `
      <button
        type="button"
        class="inverse-preset${first ? " is-active" : ""}${isInvertible ? "" : " is-singular"}"
        data-inverse-preset="${preset.key}"
        aria-pressed="${first ? "true" : "false"}"
      >
        <span class="inverse-preset-copy">
          <small><i aria-hidden="true"></i>${isInvertible ? "可逆" : "降秩"}</small>
          <strong>${preset.label}</strong>
        </span>
        <span class="inverse-preset-matrix">${inline(matrixLatex(preset.matrix))}</span>
      </button>
    `;
  }

  function renderSection4Interactive(interactive, section) {
    if (!interactive) return;
    const defaultPreset = PRESETS[0];

    interactive.innerHTML = `
      <h2>交互实验</h2>
      <div class="inverse-transform-lab" data-inverse-transform-lab>
        <header class="inverse-lab-head">
          <div>
            <span class="inverse-lab-kicker">线性变换工作台</span>
            <h3>${inline("A")} 改变平面，${inline("A^{-1}")} 把它还原</h3>
            <p>${section?.interactive?.task || `选择一个矩阵 ${inline("A")}，观察基向量与网格如何变化；若两个方向都被保留，再应用逆矩阵回到单位变换。`}</p>
          </div>
          <div class="inverse-core-rule" aria-label="二维矩阵可逆判据">
            <span>二维可逆判据</span>
            <strong>${inline("\\operatorname{rank}(A)=2\\iff A^{-1}\\text{ 存在}")}</strong>
          </div>
        </header>

        <div data-inverse-gate></div>

        <section class="inverse-preset-section" aria-label="选择线性变换">
          <div class="inverse-compact-heading">
            <strong>矩阵 ${inline("A")}</strong>
            <small>选择一个变换</small>
          </div>
          <div class="inverse-preset-grid">
            ${PRESETS.map((preset, index) => presetButtonMarkup(preset, index === 0)).join("")}
          </div>
        </section>

        <div class="inverse-workbench">
          <figure class="inverse-plane-card">
            <div class="inverse-plane-toolbar">
              <div>
                <span data-inverse-stage-label>单位变换</span>
                <strong data-inverse-stage-title>平面保持原样</strong>
              </div>
              <div class="inverse-plane-legend" aria-label="图例">
                <span><i class="is-reference"></i>原网格</span>
                <span><i class="is-current"></i>当前网格</span>
              </div>
            </div>
            <div class="inverse-plane-wrap">
              <svg class="inverse-plane" viewBox="0 0 420 320" role="img" aria-label="矩阵 A 与逆矩阵作用在二维网格上的连续变化">
                <g class="inverse-reference-grid">${gridMarkup(IDENTITY, "inverse-reference-line")}</g>
                <polygon class="inverse-reference-square" points="${polygonPoints(IDENTITY, SQUARE)}"></polygon>
                <g data-inverse-grid></g>
                <polygon class="inverse-current-square" data-inverse-square></polygon>
                <g data-inverse-kernel></g>
                <line class="inverse-basis is-x" data-inverse-basis-x />
                <line class="inverse-basis is-y" data-inverse-basis-y />
                <line class="inverse-sample-vector" data-inverse-vector />
                <circle class="inverse-origin-dot" data-inverse-origin r="4"></circle>
                <polygon class="inverse-arrowhead is-x" data-inverse-basis-x-head></polygon>
                <polygon class="inverse-arrowhead is-y" data-inverse-basis-y-head></polygon>
                <polygon class="inverse-arrowhead is-vector" data-inverse-vector-head></polygon>
                <text class="inverse-basis-label is-x" data-inverse-basis-x-label></text>
                <text class="inverse-basis-label is-y" data-inverse-basis-y-label></text>
                <text class="inverse-vector-label" data-inverse-vector-label></text>
              </svg>
            </div>
            <figcaption data-inverse-caption>起点：单位正方形的两条邻边正是 ${inline("e_1")} 与 ${inline("e_2")}。</figcaption>
          </figure>

          <aside class="inverse-control-panel" aria-live="polite">
            <section class="inverse-stage-control" data-inverse-stage-control>
              <div class="inverse-control-heading">
                <div>
                  <span>变换路径</span>
                  <strong>三个阶段</strong>
                </div>
                <div class="inverse-composition">
                  <span>当前复合</span>
                  <strong data-inverse-composition>${inline("E")}</strong>
                </div>
              </div>

              <ol class="inverse-journey" aria-label="逆变换的三个阶段">
                <li class="is-current" data-inverse-step="0">
                  <button type="button" data-inverse-jump="0">
                    <span>01</span><small>起点</small><strong>${inline("E")}</strong>
                  </button>
                </li>
                <li data-inverse-step="1">
                  <button type="button" data-inverse-jump="1">
                    <span>02</span><small>应用 ${inline("A")}</small><strong>${inline("A")}</strong>
                  </button>
                </li>
                <li data-inverse-step="2">
                  <button type="button" data-inverse-jump="2">
                    <span>03</span><small>应用 ${inline("A^{-1}")}</small><strong>${inline("A^{-1}A=E")}</strong>
                  </button>
                </li>
              </ol>

              <div class="inverse-range-shell">
                <input
                  id="inverse-journey-progress"
                  data-inverse-progress
                  type="range"
                  min="0"
                  max="2"
                  step="0.01"
                  value="0"
                  aria-label="在单位变换、应用 A、应用 A 逆三个阶段之间拖动"
                />
                <div class="inverse-range-marks" aria-hidden="true"><i></i><i></i><i></i></div>
              </div>

              <p class="inverse-equation" data-inverse-equation>${inline("Ex=x")}</p>
              <div class="inverse-control-row">
                <button class="button primary is-primary" type="button" data-inverse-next><span>应用 ${inline("A")}</span></button>
                <button class="button ghost" type="button" data-inverse-reset>回到起点</button>
              </div>
            </section>

            <section class="inverse-state-summary" data-inverse-verdict>
              <div class="inverse-decision-heading">
                <div>
                  <span data-inverse-verdict-kicker>二维保留</span>
                  <strong data-inverse-verdict-title>${inline("A")} 可逆</strong>
                </div>
                <div class="inverse-conclusion" data-inverse-conclusion>
                  <small data-inverse-conclusion-label>两侧逆</small>
                  <strong data-inverse-conclusion-formula>${inline("A^{-1}A=E")} · ${inline("AA^{-1}=E")}</strong>
                </div>
              </div>

              <dl class="inverse-facts">
                <div class="is-matrix"><dt>矩阵 ${inline("A")}</dt><dd data-inverse-matrix>${inline(matrixLatex(defaultPreset.matrix))}</dd></div>
                <div><dt>${inline("\\operatorname{rank}(A)")}</dt><dd data-inverse-rank>2</dd></div>
                <div><dt>${inline("\\det(A)")}</dt><dd data-inverse-det>1</dd></div>
                <div><dt>空间</dt><dd data-inverse-dimension>${inline("2\\to2")}</dd></div>
              </dl>
              <p class="inverse-explanation" data-inverse-explanation>${defaultPreset.description}</p>
            </section>
          </aside>
        </div>
      </div>
    `;

    const lab = interactive.querySelector("[data-inverse-transform-lab]");
    if (!lab) return;

    const elements = {
      grid: lab.querySelector("[data-inverse-grid]"),
      square: lab.querySelector("[data-inverse-square]"),
      basisX: lab.querySelector("[data-inverse-basis-x]"),
      basisY: lab.querySelector("[data-inverse-basis-y]"),
      basisXLabel: lab.querySelector("[data-inverse-basis-x-label]"),
      basisYLabel: lab.querySelector("[data-inverse-basis-y-label]"),
      vector: lab.querySelector("[data-inverse-vector]"),
      vectorLabel: lab.querySelector("[data-inverse-vector-label]"),
      basisXHead: lab.querySelector("[data-inverse-basis-x-head]"),
      basisYHead: lab.querySelector("[data-inverse-basis-y-head]"),
      vectorHead: lab.querySelector("[data-inverse-vector-head]"),
      originDot: lab.querySelector("[data-inverse-origin]"),
      stageLabel: lab.querySelector("[data-inverse-stage-label]"),
      stageTitle: lab.querySelector("[data-inverse-stage-title]"),
      caption: lab.querySelector("[data-inverse-caption]"),
      composition: lab.querySelector("[data-inverse-composition]"),
      equation: lab.querySelector("[data-inverse-equation]"),
      matrix: lab.querySelector("[data-inverse-matrix]"),
      rank: lab.querySelector("[data-inverse-rank]"),
      determinant: lab.querySelector("[data-inverse-det]"),
      dimension: lab.querySelector("[data-inverse-dimension]"),
      verdict: lab.querySelector("[data-inverse-verdict]"),
      verdictKicker: lab.querySelector("[data-inverse-verdict-kicker]"),
      verdictTitle: lab.querySelector("[data-inverse-verdict-title]"),
      explanation: lab.querySelector("[data-inverse-explanation]"),
      progress: lab.querySelector("[data-inverse-progress]"),
      next: lab.querySelector("[data-inverse-next]"),
      reset: lab.querySelector("[data-inverse-reset]"),
      controlRow: lab.querySelector(".inverse-control-row"),
      conclusion: lab.querySelector("[data-inverse-conclusion]"),
      conclusionLabel: lab.querySelector("[data-inverse-conclusion-label]"),
      conclusionFormula: lab.querySelector("[data-inverse-conclusion-formula]"),
      stageControl: lab.querySelector("[data-inverse-stage-control]"),
      kernel: lab.querySelector("[data-inverse-kernel]"),
      steps: [...lab.querySelectorAll("[data-inverse-step]")],
      jumpButtons: [...lab.querySelectorAll("[data-inverse-jump]")],
    };

    let presetKey = defaultPreset.key;
    let animationFrame = 0;
    let pauseTimer = 0;

    const gate = window.LAPredictGate?.mount(lab.querySelector("[data-inverse-gate]"), {
      root: lab,
      manual: true,
      key: "visuals/ch4/section4-presentation.js#order",
      question: `${inline("A")} 先剪切（${inline("S")}），再旋转 90°（${inline("R")}），即 ${inline("A=RS")}。要把平面还原，应该先撤销哪一步？`,
      options: [
        [`先撤销旋转（${inline("R^{-1}")}），再撤销剪切（${inline("S^{-1}")}）`, true, ""],
        [`先撤销剪切（${inline("S^{-1}")}），再撤销旋转（${inline("R^{-1}")}）`, false, "旋转是最后做的，网格此时已经转过；必须先把它转回来，剪切才能被撤销。"],
        ["顺序无所谓，结果一样", false, "R⁻¹S⁻¹ 与 S⁻¹R⁻¹ 是两个不同的矩阵，只有后者把网格送回原位。"],
        [`${inline("A")} 由两步合成，没有逆矩阵`, false, "剪切和旋转都可逆，合起来仍可逆，det A=1。"],
      ],
      right: `✓ 后做的先撤销：${inline("A^{-1}=(RS)^{-1}=S^{-1}R^{-1}")}，作用到 ${inline("Ax")} 上时先遇到 ${inline("R^{-1}")}。`,
      onPick: () => render(),
    });

    function stopAnimation() {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      if (pauseTimer) clearTimeout(pauseTimer);
      pauseTimer = 0;
    }

    // a two-step preset stops briefly after each factor, so each step can be seen
    function animateJourney(target, duration) {
      stopAnimation();
      const preset = PRESET_MAP[presetKey];
      const start = Number(elements.progress.value);
      const n = preset.factors?.length || 1;
      const stops = [];
      if (n > 1 && target > start) {
        for (let k = 1; k < n * 2; k += 1) {
          const v = k / n;
          if (v > start + 0.02 && v < target - 0.02) stops.push(v);
        }
      }
      stops.push(target);
      const each = n > 1 ? Math.max(480, duration / stops.length + 160) : duration;
      const run = (i) => animateTo(stops[i], each, () => {
        if (i + 1 >= stops.length) return;
        const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        pauseTimer = setTimeout(() => { pauseTimer = 0; run(i + 1); }, reduced ? 0 : 420);
      });
      run(0);
    }

    function animateTo(target, duration = 900, done) {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      const startValue = Number(elements.progress.value);
      const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const actualDuration = reducedMotion ? 0 : duration;
      const start = performance.now();

      function tick(now) {
        if (!lab.isConnected) {
          stopAnimation();
          return;
        }
        const amount = actualDuration === 0 ? 1 : Math.min(1, (now - start) / actualDuration);
        const eased = 1 - Math.pow(1 - amount, 3);
        elements.progress.value = String(startValue + (target - startValue) * eased);
        render();
        if (amount < 1) animationFrame = requestAnimationFrame(tick);
        else {
          animationFrame = 0;
          render();
          done?.();
        }
      }

      animationFrame = requestAnimationFrame(tick);
    }

    function setLine(line, from, to) {
      line.setAttribute("x1", from[0]);
      line.setAttribute("y1", from[1]);
      line.setAttribute("x2", to[0]);
      line.setAttribute("y2", to[1]);
    }

    function setDot(dot, point) {
      if (!dot) return;
      dot.setAttribute("cx", point[0]);
      dot.setAttribute("cy", point[1]);
    }

    /**
     * Draw a slender filled arrowhead whose apex is exactly `to`.
     * Shaft stops inside the triangle so the sharp tip is the true endpoint.
     */
    function setArrow(line, head, from, to, length = 14, halfWidth = 4) {
      const dx = to[0] - from[0];
      const dy = to[1] - from[1];
      const dist = Math.hypot(dx, dy) || 1;
      const ux = dx / dist;
      const uy = dy / dist;
      const px = -uy;
      const py = ux;
      // Keep a usable head even for very short collapsed vectors.
      const headLen = Math.min(length, Math.max(8, dist * 0.28));
      const headHalf = Math.min(halfWidth, headLen * 0.32);
      const base = [to[0] - ux * headLen, to[1] - uy * headLen];
      const left = [base[0] + px * headHalf, base[1] + py * headHalf];
      const right = [base[0] - px * headHalf, base[1] - py * headHalf];
      // Shaft ends inside the triangle body (not past the apex).
      const shaftEnd = [to[0] - ux * (headLen * 0.62), to[1] - uy * (headLen * 0.62)];
      setLine(line, from, shaftEnd);
      // Apex first — this pixel IS the mathematical endpoint.
      head.setAttribute("points", `${to[0]},${to[1]} ${left[0]},${left[1]} ${right[0]},${right[1]}`);
    }

    function setLabel(label, point, text) {
      label.setAttribute("x", point[0] + 10);
      label.setAttribute("y", point[1] - 10);
      label.textContent = text;
    }

    function setVectorLabel(label, point, text) {
      // Offset past the sharp tip so the label never covers the apex.
      label.setAttribute("x", point[0] + 11);
      label.setAttribute("y", point[1] - 3);
      label.setAttribute("dominant-baseline", "middle");
      label.setAttribute("text-anchor", "start");
      label.textContent = text;
    }

    function render() {
      const preset = PRESET_MAP[presetKey];
      const rank = matrixRank(preset.matrix);
      const det = determinant(preset.matrix);
      const isSingular = rank < 2;
      const maxJourney = isSingular ? 1 : 2;
      let journey = Math.min(Number(elements.progress.value), maxJourney);
      elements.progress.value = String(journey);
      // the fill ends under the thumb's centre, which travels 9px inside each end of the track
      elements.stageControl.style.setProperty("--journey-progress", `calc(9px + (100% - 18px) * ${journey / 2})`);

      const currentMatrix = effectiveMatrix(preset.matrix, journey, preset.factors);
      renderKernel(isSingular, currentMatrix, journey);
      const origin = svgPoint(currentMatrix, [0, 0]);
      const basisX = svgPoint(currentMatrix, [1, 0]);
      const basisY = svgPoint(currentMatrix, [0, 1]);
      const vectorTip = svgPoint(currentMatrix, SAMPLE_VECTOR);
      const stage = journey < 0.02 ? 0 : journey < 1.98 ? 1 : 2;
      const atA = Math.abs(journey - 1) < 0.02;
      const atIdentity = journey < 0.02;
      const restored = journey > 1.98;
      const movingBack = journey > 1.02 && !restored;

      elements.grid.innerHTML = gridMarkup(currentMatrix, "inverse-current-line");
      elements.square.setAttribute("points", polygonPoints(currentMatrix, SQUARE));
      setArrow(elements.basisX, elements.basisXHead, origin, basisX, 15, 4.2);
      setArrow(elements.basisY, elements.basisYHead, origin, basisY, 15, 4.2);
      setArrow(elements.vector, elements.vectorHead, origin, vectorTip, 14, 3.8);
      setDot(elements.originDot, origin);
      // two-factor presets: name the vectors by the last finished product (I, S, A=RS, S, I);
      // the name changes only when the next step has arrived
      const factorNames = preset.factors ? preset.factorNames : null;
      const settled = factorNames ? Math.min(4, Math.floor(journey * 2 + 0.04)) : -1;
      const prefix = factorNames ? ["", factorNames[0], "A", factorNames[0], ""][settled] : stage === 1 ? "A" : "";
      setLabel(elements.basisXLabel, basisX, `${prefix}e₁`);
      setLabel(elements.basisYLabel, basisY, `${prefix}e₂`);
      setVectorLabel(elements.vectorLabel, vectorTip, stage === 2 ? "A⁻¹Ax = x" : `${prefix}x`);

      elements.matrix.innerHTML = inline(matrixLatex(preset.matrix));
      elements.rank.innerHTML = inline(String(rank));
      elements.determinant.innerHTML = inline(fracLatex(det));
      elements.dimension.innerHTML = isSingular ? inline("2\\to1") : inline("2\\to2");
      elements.explanation.innerHTML = preset.description;

      lab.classList.toggle("is-singular", isSingular);
      lab.classList.toggle("is-restored", restored);
      elements.verdict.classList.toggle("is-singular", isSingular);
      elements.verdictKicker.textContent = isSingular ? "降为一维" : "二维保留";
      elements.verdictTitle.innerHTML = isSingular ? `${inline("A")} 不可逆` : `${inline("A")} 可逆`;
      elements.conclusion.classList.toggle("is-unavailable", isSingular);
      elements.conclusionLabel.textContent = isSingular ? "逆矩阵" : "两侧逆";
      elements.conclusionFormula.innerHTML = isSingular
        ? inline("A^{-1}\\text{ 不存在}")
        : `${inline("A^{-1}A=E")}<i aria-hidden="true">·</i>${inline("AA^{-1}=E")}`;

      elements.steps.forEach((stepElement, index) => {
        stepElement.classList.toggle("is-current", index === stage);
        stepElement.classList.toggle("is-complete", index < stage || (index === 1 && restored));
        stepElement.classList.toggle("is-unavailable", isSingular && index === 2);
        const jumpButton = stepElement.querySelector("[data-inverse-jump]");
        if (jumpButton) {
          jumpButton.disabled = isSingular && index === 2;
          if (index === stage) jumpButton.setAttribute("aria-current", "step");
          else jumpButton.removeAttribute("aria-current");
        }
      });

      const two = preset.factors ? preset.factorNames : null;
      if (two && !atIdentity) {
        const [S, R] = two;
        const half = Math.abs(journey - 0.5) < 0.02 || Math.abs(journey - 1.5) < 0.02;
        if (restored) {
          elements.stageLabel.textContent = "逆变换完成";
          elements.stageTitle.textContent = "网格回到原位";
          elements.caption.innerHTML = `先用 ${inline(`${R}^{-1}`)} 转回来，再用 ${inline(`${S}^{-1}`)} 剪回去：后做的一步先撤销。`;
          elements.composition.innerHTML = inline(`${S}^{-1}${R}^{-1}${R}${S}=E`);
          elements.equation.innerHTML = inline(`(${R}${S})^{-1}=${S}^{-1}${R}^{-1}`);
        } else if (journey > 1.02) {
          const second = journey > 1.5 + 0.02;
          elements.stageLabel.innerHTML = half ? `已撤销 ${inline(R)}` : second ? `正在撤销 ${inline(S)}` : `正在撤销 ${inline(R)}`;
          elements.stageTitle.innerHTML = half ? "只剩剪切" : second ? `应用 ${inline(`${S}^{-1}`)}` : `应用 ${inline(`${R}^{-1}`)}`;
          elements.caption.innerHTML = half || second ? `${inline(`${R}^{-1}`)} 已把旋转转回，网格回到只剪切过的样子。` : `最后做的是旋转，先用 ${inline(`${R}^{-1}`)} 把它转回来。`;
          elements.composition.innerHTML = inline(half || second ? `${R}^{-1}${R}${S}=${S}` : `${R}^{-1}A`);
          elements.equation.innerHTML = inline(half || second ? `${S}^{-1}(${S}x)\\longrightarrow x` : `${R}^{-1}(Ax)\\longrightarrow ${S}x`);
        } else {
          const second = journey > 0.5 + 0.02;
          elements.stageLabel.innerHTML = atA ? `应用 ${inline("A")} 完成` : half ? `已应用 ${inline(S)}` : second ? `正在应用 ${inline(R)}` : `正在应用 ${inline(S)}`;
          elements.stageTitle.textContent = atA ? "先剪切，再旋转" : half || !second ? "第一步：剪切" : "第二步：旋转 90°";
          elements.caption.innerHTML = atA ? `${inline(`A=${R}${S}`)}：剪切后的网格又转了 90°。` : half || !second ? "剪切把竖直方向推斜。" : "剪切后的整张网格再旋转 90°。";
          elements.composition.innerHTML = inline(atA ? `A=${R}${S}` : half || !second ? S : `${R}${S}`);
          elements.equation.innerHTML = inline(atA ? `x\\mapsto ${R}(${S}x)=Ax` : half || !second ? `x\\longrightarrow ${S}x` : `${S}x\\longrightarrow ${R}(${S}x)`);
        }
      } else if (atIdentity) {
        elements.stageLabel.textContent = "单位变换";
        elements.stageTitle.textContent = "平面保持原样";
        elements.caption.innerHTML = `起点：${inline("e_1")}、${inline("e_2")} 的端点与单位正方形的两个相邻顶点完全重合。`;
        elements.composition.innerHTML = inline("E");
        elements.equation.innerHTML = inline("Ex=x");
      } else if (restored) {
        elements.stageLabel.textContent = "逆变换完成";
        elements.stageTitle.textContent = "网格回到原位";
        elements.caption.innerHTML = `恢复：${inline("A^{-1}Ae_1=e_1")}、${inline("A^{-1}Ae_2=e_2")}，单位正方形与向量 ${inline("x")} 一起回到原位。`;
        elements.composition.innerHTML = inline("A^{-1}A=E");
        elements.equation.innerHTML = inline("A^{-1}(Ax)=(A^{-1}A)x=Ex=x");
      } else if (isSingular && atA) {
        elements.stageLabel.innerHTML = `应用 ${inline("A")} 完成`;
        elements.stageTitle.textContent = "二维被压成一维";
        elements.caption.innerHTML = `直线 ${inline("x+\\ker A")} 上的点全部落到同一点：知道 ${inline("Ax")} 也分不出原来是 ${inline("x_1")} 还是 ${inline("x_2")}。`;
        elements.composition.innerHTML = inline("A");
        elements.equation.innerHTML = inline("x_1\\ne x_2,\\ Ax_1=Ax_2");
      } else if (atA) {
        elements.stageLabel.innerHTML = `应用 ${inline("A")} 完成`;
        elements.stageTitle.textContent = "平面仍然是二维";
        elements.caption.innerHTML = `${inline("A")} 已作用：${inline("Ae_1")}、${inline("Ae_2")} 正好构成变换后平行四边形的两条相邻边。`;
        elements.composition.innerHTML = inline("A");
        elements.equation.innerHTML = inline("x\\mapsto Ax");
      } else {
        elements.stageLabel.innerHTML = movingBack ? `正在应用 ${inline("A^{-1}")}` : `正在应用 ${inline("A")}`;
        elements.stageTitle.textContent = movingBack ? "变换正在被撤销" : isSingular ? "平面正在坍缩" : "平面仍保持二维";
        elements.caption.innerHTML = movingBack
          ? `${inline("A^{-1}")} 正在把 ${inline("A")} 的变化逐步撤回；彩色网格与浅色原网格重新重合。`
          : isSingular
            ? "两个基方向逐渐合并，单位正方形的面积正在降为 0。"
            : `${inline("A")} 同时移动两个基向量，并带动整张网格连续变形。`;
        elements.composition.innerHTML = movingBack ? inline("A^{-1}A") : inline("A");
        elements.equation.innerHTML = movingBack ? inline("A^{-1}(Ax)\\longrightarrow x") : inline("x\\longrightarrow Ax");
      }

      let nextTarget = 1;
      let nextLabel = journey > 0.02 ? `完成应用 ${inline("A")}` : `应用 ${inline("A")}`;
      let nextDisabled = false;
      if (restored) {
        nextTarget = 0;
        nextLabel = "重新演示";
      } else if (isSingular && atA) {
        nextTarget = 1;
        nextLabel = `${inline("A^{-1}")} 不存在`;
        nextDisabled = true;
      } else if (journey > 1.02) {
        nextTarget = 2;
        nextLabel = "完成还原";
      } else if (atA) {
        nextTarget = 2;
        nextLabel = `应用 ${inline("A^{-1}")}`;
      }
      elements.next.dataset.inverseTarget = String(nextTarget);
      elements.next.innerHTML = `<span>${nextLabel}</span>`;
      elements.next.disabled = nextDisabled || Boolean(gate && !gate.picked);
      if (gate && !gate.picked) elements.next.title = "先在上方猜一猜";
      else elements.next.removeAttribute("title");
      const showReset = !atIdentity && !restored;
      elements.reset.hidden = !showReset;
      elements.controlRow.classList.toggle("is-single", !showReset);
      elements.conclusion.classList.toggle("is-active", restored);
      if (restored && preset.factors && !animationFrame && !pauseTimer) gate?.acted();
    }

    // rank-1 preset: the line x + ker A in the input plane (dashed), two inputs x₁ ≠ x₂ on it,
    // and their images, which meet at one point when A has acted
    function renderKernel(isSingular, currentMatrix, journey) {
      if (!isSingular || journey < 0.02) {
        elements.kernel.innerHTML = "";
        return;
      }
      const ends = [[-1, 3], [4.5, -2.5]];
      const [a1, a2] = ends.map((p) => svgPoint(IDENTITY, p));
      const [b1, b2] = ends.map((p) => svgPoint(currentMatrix, p));
      const parts = [
        `<line class="inverse-kernel-line" x1="${a1[0]}" y1="${a1[1]}" x2="${a2[0]}" y2="${a2[1]}" />`,
        `<line class="inverse-kernel-image" x1="${b1[0]}" y1="${b1[1]}" x2="${b2[0]}" y2="${b2[1]}" />`,
      ];
      const lineLabel = svgPoint(IDENTITY, [-0.5, 2.3]);
      parts.push(`<text class="inverse-kernel-text" x="${lineLabel[0] + 8}" y="${lineLabel[1]}">x + ker A</text>`);
      const met = journey > 0.98;
      KERNEL_INPUTS.forEach((input, i) => {
        const from = svgPoint(IDENTITY, input);
        const to = svgPoint(currentMatrix, input);
        parts.push(
          `<line class="inverse-kernel-path" x1="${from[0]}" y1="${from[1]}" x2="${to[0]}" y2="${to[1]}" />`,
          `<circle class="inverse-kernel-ghost" cx="${from[0]}" cy="${from[1]}" r="4.5" />`,
          `<text class="inverse-kernel-label" x="${from[0] + (i === 0 ? -22 : 8)}" y="${from[1] + (i === 0 ? 5 : 16)}">x${i ? "₂" : "₁"}</text>`,
          `<circle class="inverse-kernel-dot" cx="${to[0]}" cy="${to[1]}" r="4.5" />`,
        );
        if (!met) parts.push(`<text class="inverse-kernel-label" x="${to[0] + 8}" y="${to[1] + (i === 0 ? -6 : 16)}">Ax${i ? "₂" : "₁"}</text>`);
      });
      if (met) {
        const p = svgPoint(currentMatrix, KERNEL_INPUTS[0]);
        parts.push(`<text class="inverse-kernel-label is-met" x="${p[0] + 8}" y="${p[1] + 20}">Ax₁ = Ax₂</text>`);
      }
      elements.kernel.innerHTML = parts.join("");
    }

    lab.querySelectorAll("[data-inverse-preset]").forEach((button) => {
      button.addEventListener("click", () => {
        stopAnimation();
        presetKey = button.dataset.inversePreset;
        elements.progress.value = "0";
        lab.querySelectorAll("[data-inverse-preset]").forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        render();
      });
    });

    elements.progress.addEventListener("input", () => {
      stopAnimation();
      render();
    });
    elements.progress.addEventListener("change", () => {
      const maxJourney = matrixRank(PRESET_MAP[presetKey].matrix) < 2 ? 1 : 2;
      const target = Math.min(Math.round(Number(elements.progress.value)), maxJourney);
      animateJourney(target, 240);
    });
    elements.jumpButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const target = Number(button.dataset.inverseJump);
        if (target > 1 && matrixRank(PRESET_MAP[presetKey].matrix) < 2) return;
        animateJourney(target, target === 2 ? 900 : 620);
      });
    });
    elements.next.addEventListener("click", () => {
      const target = Number(elements.next.dataset.inverseTarget);
      animateJourney(target, target === 2 ? 900 : 620);
    });
    elements.reset.addEventListener("click", () => animateJourney(0, 700));

    render();
  }

  defineChapter4Renderer("matrix-inverse", {
    formal: renderSection4Formal,
    interactive: renderSection4Interactive,
  });
})();


;/* visuals/ch4/block-presentation.js */
(() => {
  const inline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : `<code>${source}</code>`);
  const metaRow = (title, text) => `<div><dt>${title}</dt><dd>${text}</dd></div>`;
  const definition = (title, text) => `<article class="block-definition"><strong>${title}</strong><p>${text}</p></article>`;
  const formalShell = (title, intro, main, meta, definitions, noteTitle, noteText) => `<h2>${title}</h2><div class="block-formal"><p class="block-intro">${intro}</p><div class="block-map"><div class="block-map-main">${main}</div><dl class="block-meta">${meta}</dl></div><div class="block-definition-stack">${definitions}</div><div class="block-note"><strong>${noteTitle}</strong><p>${noteText}</p></div></div>`;

  function renderSection5Formal(formal) {
    if (!formal) return;
    formal.innerHTML = formalShell(
      "先定分组，再谈分块运算",
      "把一个大矩阵切成块之前，先要知道每一组行和列代表什么。只要分组一致，块可以像较大的元素那样参与加法、数乘和乘法；但尺寸不匹配时，块运算同样没有定义。",
      display("\\begin{pmatrix}A_{11}&A_{12}\\\\A_{21}&A_{22}\\end{pmatrix}\\begin{pmatrix}B_{11}&B_{12}\\\\B_{21}&B_{22}\\end{pmatrix}"),
      [metaRow("先看尺寸", "每个块本身都是矩阵；要相加或相乘，内部尺寸仍必须匹配。"), metaRow("块行乘块列", `${inline("(AB)_{ij}")} 来自 A 的第 i 个块行和 B 的第 j 个块列。`), metaRow("块对角", "非对角块为 0 时，不同部分互不影响，可以分别处理。")].join(""),
      [definition("分块来自结构", "一个合理的分块往往来自变量分组、方程组分组或子空间分解；它应该反映原问题的结构。"), definition("块乘法", `与普通行列乘法完全同构。例如 ${inline("(AB)_{12}=A_{11}B_{12}+A_{12}B_{22}")}。`), definition("块对角结构", "当非对角块为 0，前一组变量不影响后一组，反之也一样；求解与求逆都可以按块分开。")].join(""),
      "阅读顺序",
      "先找输出块的位置，再选 A 的对应块行和 B 的对应块列。不要一上来试图同时看四个块。",
    );
  }

  const blockTargets = {
    "11": { title: "输出块 C₁₁", formula: "C_{11}=A_{11}B_{11}+A_{12}B_{21}", row: ["A_{11}", "A_{12}"], col: ["B_{11}", "B_{21}"], result: "C_{11}", note: "取 A 的第一块行，再取 B 的第一块列；两段配对相乘后相加。" },
    "12": { title: "输出块 C₁₂", formula: "C_{12}=A_{11}B_{12}+A_{12}B_{22}", row: ["A_{11}", "A_{12}"], col: ["B_{12}", "B_{22}"], result: "C_{12}", note: "右上块只用 A 的第一块行和 B 的第二块列；参与配对的块由输出位置决定。" },
    "21": { title: "输出块 C₂₁", formula: "C_{21}=A_{21}B_{11}+A_{22}B_{21}", row: ["A_{21}", "A_{22}"], col: ["B_{11}", "B_{21}"], result: "C_{21}", note: "下左块对应 A 的第二块行与 B 的第一块列。" },
    "22": { title: "输出块 C₂₂", formula: "C_{22}=A_{21}B_{12}+A_{22}B_{22}", row: ["A_{21}", "A_{22}"], col: ["B_{12}", "B_{22}"], result: "C_{22}", note: "下右块对应 A 的第二块行与 B 的第二块列。" },
  };

  function grid(label, cells, sourceSet, result) {
    return `<div><div class="block-grid-label">${label}</div><div class="block-grid">${cells.map((cell) => `<span class="block-cell${sourceSet?.includes(cell) ? " is-source" : ""}${result === cell ? " is-result" : ""}">${inline(cell)}</span>`).join("")}</div></div>`;
  }

  function blockProductView(targetKey) {
    const target = blockTargets[targetKey];
    return `<h4>${target.title}</h4><p>${target.note}</p><div class="block-grid-wrap">${grid("矩阵 A", ["A_{11}", "A_{12}", "A_{21}", "A_{22}"], target.row)}<span class="block-grid-symbol">×</span>${grid("矩阵 B", ["B_{11}", "B_{12}", "B_{21}", "B_{22}"], target.col)}<span class="block-grid-symbol">→</span>${grid("结果 C=AB", ["C_{11}", "C_{12}", "C_{21}", "C_{22}"], [], target.result)}</div><div class="block-math">${display(target.formula)}</div><div class="block-explanation"><ul class="block-points"><li>高亮的两个 A 块来自同一块行。</li><li>高亮的两个 B 块来自同一块列。</li><li>这就是“块行乘块列”；普通矩阵的行列乘法并没有变。</li></ul></div>`;
  }

  function renderSection5Interactive(section) {
    if (!section) return;
    section.innerHTML = `<h2>块配对实验</h2><div class="block-lab"><div class="block-lab-head"><h3>一个输出块到底由谁算出来</h3><p>选择 C 的不同位置。页面会只高亮参与该输出块计算的那一块行和那一块列。</p></div><div class="block-choice-row"><button type="button" class="block-choice is-active" data-block-target="11">C₁₁</button><button type="button" class="block-choice" data-block-target="12">C₁₂</button><button type="button" class="block-choice" data-block-target="21">C₂₁</button><button type="button" class="block-choice" data-block-target="22">C₂₂</button></div><div class="block-lab-panel" data-block-product-panel>${blockProductView("11")}</div></div>`;
    section.querySelectorAll("[data-block-target]").forEach((button) => button.addEventListener("click", () => {
      const target = button.dataset.blockTarget;
      section.querySelectorAll("[data-block-target]").forEach((item) => item.classList.toggle("is-active", item === button));
      const panel = section.querySelector("[data-block-product-panel]");
      if (panel) panel.innerHTML = blockProductView(target);
    }));
  }

  function renderSection7Formal(formal) {
    if (!formal) return;
    formal.innerHTML = formalShell(
      "把“倍数”升级成矩阵块",
      "普通消元里可以用一行减去另一行的若干倍；分块消元里，可以用一整块行减去另一块行左乘合适矩阵后的结果。唯一新增的要求是：这个矩阵块的尺寸必须匹配。",
      display("R_2\\leftarrow R_2-CR_1"),
      [metaRow("操作合法性", `${inline("CR_1")} 必须和 ${inline("R_2")} 有相同的行列结构，才能相减。`), metaRow(`怎样构造 ${inline("P")}`, "对分块单位矩阵执行同一个块行操作。"), metaRow("为什么还是左乘", "左侧矩阵的块行组合右侧矩阵的块行，所以改变的是块行。")].join(""),
      [definition("块初等矩阵", `对 ${inline("\\begin{pmatrix}E&0\\\\0&E\\end{pmatrix}")} 做块行操作 ${inline("R_2\\leftarrow R_2-CR_1")}，得到 ${inline("\\begin{pmatrix}E&0\\\\-C&E\\end{pmatrix}")}。`), definition("消去左下块", `当左下块恰好是 ${inline("C")} 时，左乘这个 ${inline("P")} 会把它变为 0；矩阵因此变成块上三角形式。`), definition("应用逻辑", "块上三角系统可以先解第一块，再代回第二块；这就是“块回代”。")].join(""),
      "与初等矩阵的关系",
      `初等矩阵中的数字倍数换成了矩阵 ${inline("C")}；同一操作先作用于分块单位矩阵，再通过左乘作用于原方程组。`,
    );
  }

  /*
   * §7 lab: the coupled system x = f, Cx + y = g with real 2×2 blocks.
   * The student picks the block X and left-multiplies by E = (I 0; X I):
   * the lower-left block becomes C + X and the right side g + Xf.
   * Only X = −C clears the coupling; then y = g − Cf can be read off.
   */
  const C7 = [[2, 1], [1, 1]]; // det C = 1, C⁻¹ = (1 −1; −1 2)
  const F7 = [1, -1];
  const G7 = [3, 2];
  const MULTIPLIERS = {
    negC: { label: "-C", X: [[-2, -1], [-1, -1]] },
    C: { label: "C", X: [[2, 1], [1, 1]] },
    negCinv: { label: "-C^{-1}", X: [[-1, 1], [1, -2]] },
    negI: { label: "-E", X: [[-1, 0], [0, -1]] },
  };
  const num = (v) => (v < 0 ? `−${-v}` : String(v));
  const add2 = (P, Q) => P.map((r, i) => r.map((v, j) => v + Q[i][j]));
  const apply2 = (P, v) => P.map((r) => r[0] * v[0] + r[1] * v[1]);
  const texM2 = (P) => `\\begin{pmatrix}${P.map((r) => r.join("&")).join("\\\\")}\\end{pmatrix}`;
  const texV2 = (v) => `\\begin{pmatrix}${v.join("\\\\")}\\end{pmatrix}`;

  // augmented [M | b] as 4 rows × 5 columns, with a class per cell role
  function augmented(lower, rhsLower) {
    const top = [[1, 0, 0, 0, F7[0]], [0, 1, 0, 0, F7[1]]];
    const bottom = [0, 1].map((i) => [lower[i][0], lower[i][1], i === 0 ? 1 : 0, i === 1 ? 1 : 0, rhsLower[i]]);
    return top.concat(bottom);
  }

  function augGrid(M, roles, was) {
    return `<table class="blk-grid bk7-grid"><tbody>${M.map((r, i) => `<tr class="${i === 1 ? "cut-below" : ""}">${r.map((v, j) => {
      const role = roles(i, j);
      const old = was?.[i]?.[j];
      const changed = old !== undefined && old !== v;
      const cls = [j === 1 ? "cut-right" : "", j === 3 ? "bk7-bar" : "", role, changed ? "is-new" : ""].filter(Boolean).join(" ");
      // the old value stays readable in (M | b) right beside; a changed cell is only tinted
      return `<td class="${cls}"><b>${num(v)}</b></td>`;
    }).join("")}</tr>`).join("")}</tbody></table>`;
  }

  function eGrid(X) {
    const E = [[1, 0, 0, 0], [0, 1, 0, 0], [X ? X[0][0] : "?", X ? X[0][1] : "?", 1, 0], [X ? X[1][0] : "?", X ? X[1][1] : "?", 0, 1]];
    return `<table class="blk-grid bk7-grid"><tbody>${E.map((r, i) => `<tr class="${i === 1 ? "cut-below" : ""}">${r.map((v, j) => `<td class="${[j === 1 ? "cut-right" : "", i > 1 && j < 2 ? "bk7-x" : ""].filter(Boolean).join(" ")}"><b>${typeof v === "number" ? num(v) : v}</b></td>`).join("")}</tr>`).join("")}</tbody></table>`;
  }

  function renderSection7Interactive(section) {
    if (!section) return;
    const state = { pick: null, applied: null };
    section.innerHTML = `<h2>交互实验</h2>
      <section class="ch3l-lab bk7-lab">
        <header class="ch3l-head"><h3>用一次块行变换消去 ${inline("C")}</h3><p>方程组 ${inline("x=f")}，${inline("Cx+y=g")} 中 ${inline("x")}、${inline("y")} 各有两个分量。选一个 ${inline("2\\times2")} 块 ${inline("X")}，把第一块行左乘 ${inline("X")} 后加到第二块行，也就是左乘 ${inline("P=\\begin{pmatrix}E&0\\\\X&E\\end{pmatrix}")}。</p></header>
        <div data-bk7-gate></div>
        <div class="blk-stage bk7-stage" data-bk7-stage></div>
        <div class="bk7-tools"><b class="bk7-tools-label">选 ${inline("X")}</b><div class="ch3l-toolbar">${Object.entries(MULTIPLIERS).map(([k, m]) => `<button type="button" class="ch3l-chip" data-x="${k}">${inline(m.label)}</button>`).join("")}</div></div>
        <div class="ch3l-actions bk7-actions"><button type="button" class="ch3l-btn is-primary" data-bk7-apply>左乘 ${inline("P")}</button><button type="button" class="ch3l-btn" data-bk7-reset>重来</button></div>
        <figure class="bk7-couple" data-bk7-couple aria-label="x 对 y 的耦合"></figure>
        <div class="ch3l-card bk7-readout" data-bk7-readout></div>
      </section>`;
    const stage = section.querySelector("[data-bk7-stage]");
    const readout = section.querySelector("[data-bk7-readout]");
    const lab = section.querySelector(".bk7-lab");
    const startAug = augmented(C7, G7);
    const roles = (lowerZero) => (i, j) => {
      if (j === 4) return i < 2 ? "bk7-f" : lowerZero === undefined ? "bk7-g" : "bk7-res";
      if (i > 1 && j < 2) return lowerZero ? "bk7-zero" : "bk7-c";
      return "";
    };

    /*
     * Coupling diagram: x → y through the lower-left block. The arrow's weight follows
     * ‖C+X‖ / ‖C‖ (Frobenius); it fades out at C+X=0 and turns red and thicker when the
     * coupling grows (X = C gives 2C).
     */
    const couple = section.querySelector("[data-bk7-couple]");
    const norm = (P) => Math.hypot(...P.flat());
    function paintCouple(lower, label) {
      const k = norm(lower) / norm(C7);
      const zero = k === 0;
      const grow = k > 1 + 1e-9;
      const width = zero ? 1.2 : 1.6 + 2.4 * Math.min(k, 2);
      const tone = zero ? "is-zero" : grow ? "is-grow" : "";
      const head = zero ? "" : `<path class="bk7-link-head ${tone}" d="M246 44 l-${8 + width} -${4 + width / 2} v${8 + width} z"></path>`;
      couple.innerHTML = `<svg viewBox="0 0 320 96" role="img" aria-label="${zero ? "x 不再影响 y" : "x 通过左下块影响 y"}">
        <circle class="bk7-node is-x" cx="46" cy="44" r="20"></circle><text class="bk7-node-name" x="46" y="49" text-anchor="middle">x</text>
        <circle class="bk7-node is-y" cx="274" cy="44" r="20"></circle><text class="bk7-node-name" x="274" y="49" text-anchor="middle">y</text>
        <text class="bk7-node-note" x="46" y="86" text-anchor="middle">x = f</text>
        <text class="bk7-node-note" x="274" y="86" text-anchor="middle">${zero ? "y = g − Cf" : "y 还含 x"}</text>
        <line class="bk7-link ${tone}" x1="72" y1="44" x2="${zero ? 246 : 238}" y2="44" style="stroke-width:${width};opacity:${zero ? 0.3 : Math.min(1, 0.35 + 0.65 * k)}" ${zero ? 'stroke-dasharray="4 4"' : ""}></line>
        ${head}
        <text class="bk7-link-label ${tone}" x="160" y="30" text-anchor="middle">${label}</text>
      </svg>`;
    }

    function paint() {
      const m = state.pick ? MULTIPLIERS[state.pick] : null;
      section.querySelectorAll("[data-x]").forEach((b) => b.classList.toggle("is-active", b.dataset.x === state.pick));
      const before = `<div class="blk-mat"><span>${inline("(M\\mid b)")}</span>${augGrid(startAug, roles(undefined))}</div>`;
      if (!state.applied) {
        stage.innerHTML = `<div class="blk-mat"><span>${inline(m ? `P,\\ X=${m.label}` : "P")}</span>${eGrid(m ? m.X : null)}</div><b class="blk-op">×</b>${before}`;
        readout.innerHTML = `<div class="bk7-head"><b>左下块</b><strong>${inline("C")}</strong></div><p>第二个方程 ${inline("Cx+y=g")} 同时含有 ${inline("x")} 和 ${inline("y")}，两组未知量耦合在一起。选好 ${inline("X")} 后按“左乘 ${inline("P")}”。</p>`;
        paintCouple(C7, "C");
        return;
      }
      const a = MULTIPLIERS[state.applied];
      const lower = add2(C7, a.X);
      const rhs = G7.map((v, i) => v + apply2(a.X, F7)[i]);
      const zero = lower.every((r) => r.every((v) => v === 0));
      const after = augmented(lower, rhs);
      paintCouple(lower, zero ? "C+X = 0" : state.applied === "C" ? "C+X = 2C" : "C+X ≠ 0");
      stage.innerHTML = `<div class="blk-mat"><span>${inline(`P,\\ X=${a.label}`)}</span>${eGrid(a.X)}</div><b class="blk-op">×</b>${before}<b class="blk-op">=</b><div class="blk-mat"><span>${inline("P(M\\mid b)")}</span>${augGrid(after, roles(zero), startAug)}</div>`;
      readout.innerHTML = zero
        ? `<div class="bk7-head"><b>左下块</b><strong class="ch3l-ok">${inline("C+X=0")}</strong></div><p>第二块方程不再含 ${inline("x")}，两组未知量分开了：</p><div class="blk-math">${display(`x=f=${texV2(F7)},\\qquad y=g-Cf=${texV2(rhs)}`)}</div>`
        : `<div class="bk7-head"><b>左下块</b><strong class="ch3l-bad">${inline(`C+X=${texM2(lower)}`)}</strong></div><p>左下块没有变成 0，第二块方程仍含 ${inline("x")}：${inline(`${texM2(lower)}x+y=${texV2(rhs)}`)}。换一个 ${inline("X")} 再试。</p>`;
    }

    const gate = window.LAPredictGate?.mount(section.querySelector("[data-bk7-gate]"), {
      root: lab,
      manual: true,
      key: "visuals/ch4/block-presentation.js#s7",
      question: `要让左下块 ${inline("C")} 变成 0，第二块行应加上第一块行左乘哪个块 ${inline("X")}？`,
      options: [
        [inline("X=-C"), true, ""],
        [inline("X=C"), false, "左下块变成 C+C=2C，耦合反而加倍。"],
        [inline("X=-C^{-1}"), false, `左下块变成 ${inline("C-C^{-1}")}，一般不为 0。`],
        [inline("X=-E"), false, `左下块变成 ${inline("C-E")}，只有 C=E 时才为 0。`],
      ],
      right: `✓ 左下块变成 ${inline("C-C=0")}，右端变成 ${inline("g-Cf")}。普通消元里的倍数，在这里换成了矩阵块 ${inline("-C")}，乘在第一块行的左边。`,
    });

    section.querySelectorAll("[data-x]").forEach((b) => b.addEventListener("click", () => {
      state.pick = b.dataset.x;
      state.applied = null;
      paint();
    }));
    section.querySelector("[data-bk7-apply]").addEventListener("click", () => {
      if (!state.pick) return;
      state.applied = state.pick;
      paint();
      gate?.acted();
    });
    section.querySelector("[data-bk7-reset]").addEventListener("click", () => {
      state.applied = null;
      paint();
    });
    paint();
  }

  defineChapter4Renderer("block-matrices", { formal: renderSection5Formal, interactive: renderSection5Interactive });
  defineChapter4Renderer("block-elementary-applications", { formal: renderSection7Formal, interactive: renderSection7Interactive });
})();


;/* visuals/ch4/section5-blocks.js */
/*
 * Chapter 4 §5 矩阵的分块: block multiplication with real sizes.
 * The student cuts A (3x4) and B (4x3). Block products are defined only when
 * A's column cut matches B's row cut; then any output block C_ij can be checked
 * numerically against the corresponding block of AB.
 * Overrides the 2x2 symbolic renderer registered in block-presentation.js.
 */
(() => {
  const tex = (s) => (window.texInline ? window.texInline(s) : s);
  const texD = (s) => (window.texDisplay ? window.texDisplay(s) : s);

  const A = [[1, 2, 0, 1], [0, 1, 3, 2], [2, 0, 1, 1]];
  const B = [[1, 0, 2], [0, 1, 1], [3, 1, 0], [1, 2, 1]];
  const mul = (X, Y) => X.map((r) => Y[0].map((_, j) => r.reduce((s, v, k) => s + v * Y[k][j], 0)));
  const add = (X, Y) => X.map((r, i) => r.map((v, j) => v + Y[i][j]));
  const sub = (M, r0, r1, c0, c1) => M.slice(r0, r1).map((r) => r.slice(c0, c1));
  const texM = (M) => `\\begin{pmatrix}${M.map((r) => r.join("&")).join("\\\\")}\\end{pmatrix}`;
  const C = mul(A, B);

  // A cut at `cut` splits n rows (or columns) into two groups [start, end).
  const groups = (cut, n) => [[0, cut], [cut, n]];

  // The grid carries rulers: column-group widths on top, row-group heights on the
  // left, so every block's size reads off its two rulers. opts.colTone / rowTone
  // colour a whole ruler (is-ok / is-bad); opts.sel marks the chosen row/col group.
  function gridHtml(M, rowCut, colCut, hiRows, hiCols, opts = {}) {
    const rg = groups(rowCut, M.length);
    const cg = groups(colCut, M[0].length);
    const rule = (axis, [a, b], k) => {
      const n = b - a;
      const tone = axis === "col" ? opts.colTone : opts.rowTone;
      const cls = ["blk-rule", `is-${axis}`, tone, opts.sel?.[axis] === k ? "is-sel" : ""].filter(Boolean).join(" ");
      const span = axis === "col" ? `colspan="${n}"` : `rowspan="${n}"`;
      return `<th ${span} class="${cls}" aria-label="${n} ${axis === "col" ? "列" : "行"}"><i>${n}</i></th>`;
    };
    const head = `<thead><tr><th class="blk-corner"></th>${cg.map((g, k) => rule("col", g, k)).join("")}</tr></thead>`;
    const body = M.map((r, i) => {
      const k = rg.findIndex(([a]) => a === i);
      return `<tr class="${i === rowCut - 1 ? "cut-below" : ""}">${k >= 0 ? rule("row", rg[k], k) : ""}${r.map((v, j) => {
        const hi = hiRows?.includes(i) && hiCols?.includes(j);
        return `<td class="${j === colCut - 1 ? "cut-right" : ""}${hi ? " is-hi" : ""}">${v}</td>`;
      }).join("")}</tr>`;
    }).join("");
    return `<table class="blk-grid ${opts.cls || ""}">${head}<tbody>${body}</tbody></table>`;
  }

  // C_ij = A_i1 B_1j + A_i2 B_2j written as sizes; the inner pair of each term is
  // bracketed with = or ≠, and the result size appears only when both pairs agree.
  function sizesHtml(i, j, rows, cols, p, q) {
    const term = (k, ak, bk) => `<span class="blk-term ${ak === bk ? "is-ok" : "is-bad"}">`
      + `<span class="blk-nm is-a">${tex(`A_{${i}${k}}`)}</span><span class="blk-nm is-b">${tex(`B_{${k}${j}}`)}</span>`
      + `<span class="blk-d is-a">${rows}×</span><span class="blk-k is-a">${ak}</span><span class="blk-dot">·</span>`
      + `<span class="blk-k is-b">${bk}</span><span class="blk-d is-b">×${cols}</span>`
      + `<span class="blk-link">${ak === bk ? "=" : "≠"}</span></span>`;
    const res = p === q
      ? `<span class="blk-plus">=</span><span class="blk-res"><span class="blk-nm">${tex(`C_{${i}${j}}`)}</span><span class="blk-d">${rows}×${cols}</span></span>`
      : "";
    return `<div class="blk-sizes">${term(1, p, q)}<span class="blk-plus">+</span>${term(2, 4 - p, 4 - q)}${res}</div>`;
  }

  const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i);

  function renderInteractive(root, section, page) {
    if (!root) return;
    const formal = page?.querySelector("#block-matrices-formal");
    if (formal && formal.compareDocumentPosition(root) & Node.DOCUMENT_POSITION_FOLLOWING) formal.before(root);
    const state = { aRow: 1, aCol: 2, bRow: 1, bCol: 2, target: "11" };
    let predicted = false;
    root.innerHTML = `<h2>交互实验</h2>
      <section class="ch3l-lab blk-lab">
        <header class="ch3l-head"><h3>怎样切，块乘法才有定义</h3><p>${tex("A")} 是 ${tex("3\\times4")} 矩阵，${tex("B")} 是 ${tex("4\\times3")} 矩阵。拖动滑块决定切口，矩阵外侧的括号标出每块的行数和列数；再点选输出块 ${tex("C_{ij}")}，用数字核对块乘法。</p></header>
        <div data-gate></div>
        <div class="blk-cuts">
          <label class="ch3l-range blk-range"><span>${tex("A")} 行</span><input type="range" min="1" max="2" step="1" data-cut="aRow" /><b data-v="aRow"></b></label>
          <label class="ch3l-range blk-range"><span>${tex("A")} 列</span><input type="range" min="1" max="3" step="1" data-cut="aCol" /><b data-v="aCol"></b></label>
          <label class="ch3l-range blk-range"><span>${tex("B")} 行</span><input type="range" min="1" max="3" step="1" data-cut="bRow" /><b data-v="bRow"></b></label>
          <label class="ch3l-range blk-range"><span>${tex("B")} 列</span><input type="range" min="1" max="2" step="1" data-cut="bCol" /><b data-v="bCol"></b></label>
        </div>
        <div class="blk-stage" data-stage></div>
        <div class="ch3l-toolbar" data-targets></div>
        <div class="blk-readout" data-readout></div>
      </section>`;
    const stage = root.querySelector("[data-stage]");
    const readout = root.querySelector("[data-readout]");
    const targets = root.querySelector("[data-targets]");

    // after the reveal, the verdict is followed by a line that reads the current cuts
    let revealedText = "";
    const split = (k, n) => `${state[k]}+${n - state[k]}`;
    function nowLine() {
      const ok = state.aCol === state.bRow;
      return ok
        ? `现在：${tex("A")} 的列 ${split("aCol", 4)} 与 ${tex("B")} 的行 ${split("bRow", 4)} 一致，块乘积有定义；${tex("A")} 的行 ${split("aRow", 3)}、${tex("B")} 的列 ${split("bCol", 3)} 把 ${tex("C")} 分成 ${split("aRow", 3)} 行、${split("bCol", 3)} 列。`
        : `现在：${tex("A")} 的列 ${split("aCol", 4)} 与 ${tex("B")} 的行 ${split("bRow", 4)} 不一致，块乘积无定义。`;
    }
    function syncFeedback() {
      if (!revealedText) return;
      fb.innerHTML = `${revealedText}<br><span class="blk-now">${nowLine()}</span>`;
    }

    function paint() {
      syncFeedback();
      const ok = state.aCol === state.bRow;
      // before a prediction nothing tells whether the cuts fit: rulers stay neutral,
      // the size strip and the verdict wait, and every C_ij stays selectable
      const open = predicted;
      const [i, j] = state.target.split("").map(Number);
      const rows = i === 1 ? range(0, state.aRow) : range(state.aRow, 3);
      const cols = j === 1 ? range(0, state.bCol) : range(state.bCol, 3);
      const inner = open ? (ok ? "is-ok" : "is-bad") : "";
      const p = state.aCol;
      const q = state.bRow;
      stage.innerHTML = `<div class="blk-mat"><span>${tex("A")}</span>${gridHtml(A, state.aRow, p, rows, range(0, 4), { colTone: inner, sel: { row: i - 1 } })}</div>
        <b class="blk-op">×</b>
        <div class="blk-mat"><span>${tex("B")}</span>${gridHtml(B, q, state.bCol, range(0, 4), cols, { rowTone: inner, sel: { col: j - 1 } })}</div>
        <b class="blk-op">=</b>
        <div class="blk-mat${open && !ok ? " is-void" : ""}"><span>${open && !ok ? `${tex("C=AB")}：块乘积无定义` : tex("C=AB")}</span>${gridHtml(C, state.aRow, state.bCol, open && !ok ? [] : rows, open && !ok ? [] : cols, { cls: "is-result", sel: open && !ok ? {} : { row: i - 1, col: j - 1 } })}</div>
        ${open ? sizesHtml(i, j, rows.length, cols.length, p, q) : ""}`;
      root.querySelectorAll("[data-v]").forEach((n) => {
        const k = n.dataset.v;
        n.textContent = k.endsWith("Row") ? `${state[k]}+${(k === "aRow" ? 3 : 4) - state[k]}` : `${state[k]}+${(k === "aCol" ? 4 : 3) - state[k]}`;
      });
      targets.innerHTML = ["11", "12", "21", "22"].map((t) => `<button type="button" class="ch3l-chip${t === state.target ? " is-active" : ""}" data-t="${t}">${tex(`C_{${t}}`)}</button>`).join("");
      targets.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { state.target = b.dataset.t; paint(); }));

      if (!open) {
        readout.innerHTML = `<p class="blk-wait">猜过之后，这里按块核对 ${tex(`C_{${i}${j}}`)}。</p>`;
        return;
      }
      if (!ok) {
        readout.innerHTML = `<p class="ch3l-bad">块乘积没有定义</p><p>${tex(`A_{${i}1}`)} 有 ${p} 列，${tex(`B_{1${j}}`)} 有 ${q} 行，${tex(`A_{${i}1}B_{1${j}}`)} 无法相乘。把 ${tex("A")} 的列切口和 ${tex("B")} 的行切口对齐。</p>`;
        return;
      }
      const r0 = i === 1 ? 0 : state.aRow;
      const r1 = i === 1 ? state.aRow : 3;
      const c0 = j === 1 ? 0 : state.bCol;
      const c1 = j === 1 ? state.bCol : 3;
      const Ai1 = sub(A, r0, r1, 0, p);
      const Ai2 = sub(A, r0, r1, p, 4);
      const B1j = sub(B, 0, p, c0, c1);
      const B2j = sub(B, p, 4, c0, c1);
      const block = add(mul(Ai1, B1j), mul(Ai2, B2j));
      const direct = sub(C, r0, r1, c0, c1);
      const same = JSON.stringify(block) === JSON.stringify(direct);
      readout.innerHTML = `<p>${tex(`C_{${i}${j}}=A_{${i}1}B_{1${j}}+A_{${i}2}B_{2${j}}`)}</p>
        <div class="blk-math">${texD(`${texM(Ai1)}${texM(B1j)}+${texM(Ai2)}${texM(B2j)}=${texM(block)}`)}</div>
        <p>${same ? `<span class="ch3l-ok">与 ${tex("AB")} 中对应的块完全相同</span>` : `<span class="ch3l-bad">与 ${tex("AB")} 不符</span>`}。</p>`;
    }

    root.querySelectorAll("[data-cut]").forEach((input) => {
      input.value = String(state[input.dataset.cut]);
      input.addEventListener("input", () => {
        state[input.dataset.cut] = Number(input.value);
        paint();
      });
    });

    const gate = root.querySelector("[data-gate]");
    gate.innerHTML = `<div class="ch3l-predict"><div class="ch3l-predict-q"><span>先猜一猜</span><p>把 ${tex("A")} 的列切成 2+2。${tex("B")} 的行要怎样切，${tex("AB")} 才能按块相乘？${tex("B")} 的列切口有没有限制？</p></div>
      <div class="ch3l-predict-options">${(window.LAStableShuffle || ((a) => a))([
        [`${tex("B")} 的行切成 2+2；${tex("B")} 的列可以任意切`, true, ""],
        [`${tex("B")} 的行切成 2+2，${tex("B")} 的列也必须切成 2+2`, false, "B 的列切口决定 C 的列怎样分块，与能否相乘无关。"],
        [`${tex("B")} 的行怎么切都可以`, false, "试着把 B 的行切成 1+3，看看块乘积还有没有定义。"],
        [`${tex("B")} 的行切法要和 ${tex("A")} 的行切法一样`, false, "相乘时配对的是 A 的列和 B 的行。"],
      ], "visuals/ch4/section5-blocks.js").map(([t, okk, why], k) => `<button type="button" data-i="${k}" data-ok="${okk}" data-why="${why}">${t}</button>`).join("")}</div><p class="ch3l-predict-feedback" hidden></p></div>`;
    // predict → act → reveal: the verdict opens only after the student also acts on the lab
    let picked = null;
    let revealed = false;
    const fb = gate.querySelector(".ch3l-predict-feedback");
    const reveal = () => {
      if (revealed || !picked) return;
      revealed = true;
      const okk = picked.dataset.ok === "true";
      gate.querySelectorAll("[data-i]").forEach((x) => x.classList.remove("is-picked"));
      picked.classList.add(okk ? "is-right" : "is-wrong");
      gate.querySelector(".ch3l-predict").classList.add("is-done");
      revealedText = okk
        ? `✓ 块乘法只要求 ${tex("A")} 的列分法与 ${tex("B")} 的行分法一致。${tex("A")} 的行切口和 ${tex("B")} 的列切口可以自由选择，它们只决定结果 ${tex("C")} 怎样分块。`
        : `再看看图：${picked.dataset.why}`;
      syncFeedback();
    };
    gate.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => {
      if (revealed) return;
      picked = b;
      predicted = true;
      paint();
      gate.querySelectorAll("[data-i]").forEach((x) => x.classList.toggle("is-picked", x === b));
      fb.hidden = false;
      fb.textContent = "记下了你的猜测。现在动手操作一次，结论随后出现。";
    }));
    const acted = (e) => { if (!gate.contains(e.target)) reveal(); };
    ["input", "change", "pointerup"].forEach((t) => root.addEventListener(t, acted));
    root.addEventListener("click", (e) => { if (e.target.closest("button") && !gate.contains(e.target)) reveal(); });
    paint();
  }

  function renderFormal(root) {
    if (!root) return;
    const block = (title, math, text) => `<article class="ch3l-theorem"><h3>${title}</h3>${math ? `<div class="ch3l-theorem-math">${texD(math)}</div>` : ""}<p>${text}</p></article>`;
    root.innerHTML = `<h2>定理概念</h2><div class="ch3l-formal">
      ${block("分块乘法", "C_{ij}=\\sum_{k}A_{ik}B_{kj}", `把块当作“较大的元素”，按行乘列的规则配对。条件只有一个：${tex("A")} 的列的分法与 ${tex("B")} 的行的分法相同，这样每个 ${tex("A_{ik}B_{kj}")} 都有定义。`)}
      ${block("块对角矩阵", "\\begin{pmatrix}A_1&0\\\\0&A_2\\end{pmatrix}\\begin{pmatrix}B_1&0\\\\0&B_2\\end{pmatrix}=\\begin{pmatrix}A_1B_1&0\\\\0&A_2B_2\\end{pmatrix}", `非对角块为 0 时，两组变量互不影响，乘法、求逆和求行列式都可以按块分别进行，例如 ${tex("\\det=\\det A_1\\cdot\\det A_2")}。`)}
      <div class="ch3l-pitfalls"><h3>容易错在哪里</h3><ul>
        <li>只看切得整齐不整齐。能否相乘只取决于 ${tex("A")} 的列分法和 ${tex("B")} 的行分法是否一致。</li>
        <li>把块乘积的顺序写反：${tex("A_{ik}B_{kj}")} 一般不等于 ${tex("B_{kj}A_{ik}")}，块之间同样不可交换。</li>
        <li>以为分块后可以把块当数一样求逆：一般 ${tex("\\begin{pmatrix}A&B\\\\C&D\\end{pmatrix}^{-1}")} 不等于各块分别求逆。</li>
      </ul></div></div>`;
  }

  window.defineChapter4Renderer?.("block-matrices", { formal: renderFormal, interactive: renderInteractive });
})();

