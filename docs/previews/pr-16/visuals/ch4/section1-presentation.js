(() => {
  const mathInline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const mathDisplay = (source) => (window.texDisplay ? window.texDisplay(source) : `<code>${source}</code>`);

  const anatomyValues = [
    [2, -1, 0, 3],
    [4, 1, 5, -2],
    [0, 6, 2, 1],
  ];

  const pixelColors = [
    "#edf7f4", "#cfe9e2", "#8ecfc2", "#4eaa9d", "#28796f",
    "#dbe9f7", "#b6d1ee", "#85addf", "#6387c7", "#516cae",
    "#f3e1da", "#e7b8a7", "#d98d74", "#c8674f", "#a64f3c",
    "#eee9f6", "#d3c4e9", "#af95d5", "#8b6bbe", "#684b99",
    "#f4f1df", "#e4d99c", "#cbbd68", "#a99742", "#7d722f",
  ];

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

        <article class="matrix-source-card">
          <div class="matrix-source-kicker">方向变化</div>
          <svg class="source-basis-svg" viewBox="0 0 260 132" role="img" aria-label="两个基本方向经过变换后成为矩阵的两列">
            <defs>
              <marker id="s1ArrowTeal" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                <path d="M0,0 L7,3.5 L0,7 Z" fill="currentColor"></path>
              </marker>
              <marker id="s1ArrowCoral" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                <path d="M0,0 L7,3.5 L0,7 Z" fill="currentColor"></path>
              </marker>
            </defs>
            <g class="basis-axis">
              <path d="M38 105H224"></path>
              <path d="M58 120V18"></path>
            </g>
            <g class="basis-vector basis-vector-one">
              <path d="M58 105L168 105" marker-end="url(#s1ArrowTeal)"></path>
              <text x="174" y="109">Ae₁</text>
            </g>
            <g class="basis-vector basis-vector-two">
              <path d="M58 105L126 42" marker-end="url(#s1ArrowCoral)"></path>
              <text x="132" y="40">Ae₂</text>
            </g>
          </svg>
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
        explanation: "左边是 2×3，右边是 3×2，形状已经不同。",
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
      ["单位矩阵", "I=\\begin{bmatrix}1&0\\\\0&1\\end{bmatrix}"],
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
              <p>这里只认识形状与身份，具体性质在后面逐步展开。</p>
            </div>
          </div>
          <div class="matrix-type-grid">${renderMatrixTypes()}</div>
        </section>

        <section class="section-one-module" aria-labelledby="shape-machine-title">
          <div class="module-heading">
            <span>05</span>
            <div>
              <h3 id="shape-machine-title">尺寸机器：n 个输入坐标，m 个输出坐标</h3>
              <p>矩阵的列数对应输入坐标数，行数对应输出坐标数。</p>
            </div>
          </div>
          <div class="shape-machine" data-shape-machine>
            <div class="shape-controls">
              <label>输出维数 m <input type="range" min="1" max="4" value="3" data-shape-m /><output data-shape-m-value>3</output></label>
              <label>输入维数 n <input type="range" min="1" max="4" value="2" data-shape-n /><output data-shape-n-value>2</output></label>
            </div>
            <div class="shape-flow">
              <div class="shape-port-group">
                <strong data-input-label>2 维输入</strong>
                <div class="shape-ports" data-input-ports></div>
              </div>
              <span class="shape-flow-arrow" aria-hidden="true">→</span>
              <div class="shape-matrix-card">
                <strong data-shape-matrix-label>3 × 2</strong>
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
          <strong>接下来：先看列</strong>
          <p>在二维变换中，第一列记录 ${mathInline("Ae_1")}，第二列记录 ${mathInline("Ae_2")}。下面的实验让两个基本方向带动整张网格。</p>
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
      const defaultText = feedback?.textContent || "";
      card.querySelectorAll("[data-equality-answer]").forEach((button) => {
        button.addEventListener("click", () => {
          const correct = button.dataset.equalityAnswer === card.dataset.correct;
          card.querySelectorAll("[data-equality-answer]").forEach((item) => {
            item.classList.toggle("is-selected", item === button);
          });
          card.classList.toggle("is-correct", correct);
          card.classList.toggle("is-wrong", !correct);
          if (feedback) feedback.textContent = correct ? `判断正确。${defaultText}` : "再检查一次：先比较行数和列数，再逐个比较对应位置。";
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
      machine.querySelector("[data-shape-matrix-label]").textContent = `${m} × ${n}`;
      machine.querySelector("[data-input-ports]").innerHTML = Array.from({ length: n }, (_, index) => `<span title="输入坐标 ${index + 1}">${index + 1}</span>`).join("");
      machine.querySelector("[data-output-ports]").innerHTML = Array.from({ length: m }, (_, index) => `<span title="输出坐标 ${index + 1}">${index + 1}</span>`).join("");
      const grid = machine.querySelector("[data-shape-matrix]");
      grid.style.setProperty("--shape-cols", n);
      grid.innerHTML = Array.from({ length: m * n }, () => "<span></span>").join("");
      machine.querySelector("[data-shape-explanation]").textContent = `${m}×${n} 矩阵有 ${n} 列，所以接收 ${n} 个输入坐标；它有 ${m} 行，所以产生 ${m} 个输出坐标。`;
    };

    mInput.addEventListener("input", render);
    nInput.addEventListener("input", render);
    render();
  }

  function enhanceTransform(interactive) {
    if (!interactive || interactive.dataset.sectionOneEnhanced === "true") return;
    const panel = interactive.querySelector(".visual-panel");
    const canvasWrap = interactive.querySelector(".canvas-wrap");
    const controls = interactive.querySelector(".control-stack");
    if (!panel || !canvasWrap || !controls) return;

    const presets = [
      ["identity", "单位矩阵", [1, 0, 0, 1]],
      ["stretch", "拉伸", [1.7, 0, 0, 0.75]],
      ["shear", "剪切", [1, 0.8, 0, 1]],
      ["projection", "共线", [1, 1, 0, 0]],
      ["zero", "零矩阵", [0, 0, 0, 0]],
    ];

    const toolbar = document.createElement("div");
    toolbar.className = "transform-preset-bar";
    toolbar.setAttribute("role", "group");
    toolbar.setAttribute("aria-label", "矩阵预设");
    toolbar.innerHTML = presets
      .map(
        ([id, label]) => `<button type="button" data-transform-preset="${id}" aria-pressed="${id === "identity"}">${label}</button>`,
      )
      .join("");
    canvasWrap.before(toolbar);

    const status = document.createElement("div");
    status.className = "section-one-transform-status";
    status.setAttribute("aria-live", "off");
    status.setAttribute("aria-busy", "false");
    controls.append(status);

    const inputs = ["a", "b", "c", "d"].map((key) => interactive.querySelector(`#matrix-${key}`));
    let statusSyncAt = 0;
    let pendingStatusMatrix = null;
    let statusSyncTimer = 0;

    const shapeCopy = (a, b, c, d) => {
      const det = a * d - b * c;
      const allZero = [a, b, c, d].every((value) => Math.abs(value) < 1e-7);
      if (allZero) {
        return {
          title: "一点",
          description: "两列都是零向量：整个平面被收到原点。",
        };
      }
      if (Math.abs(det) < 1e-7) {
        return {
          title: "一条直线",
          description: "两列共线：整张网格塌缩到一条直线上。",
        };
      }
      return {
        title: "整个平面",
        description: "两列不共线：变换后的网格仍能铺满平面。",
      };
    };

    const updateStatus = (matrix, { final = true } = {}) => {
      const source = matrix || {
        a: Number(inputs[0]?.value || 0),
        b: Number(inputs[1]?.value || 0),
        c: Number(inputs[2]?.value || 0),
        d: Number(inputs[3]?.value || 0),
      };
      const a = source.a;
      const b = source.b;
      const c = source.c;
      const d = source.d;
      const shape = shapeCopy(a, b, c, d);
      // Plain text keeps mid-animation sync cheap and consistent with the canvas.
      status.innerHTML = `
        <div><span>第一列</span><strong>(${formatCompact(a)}, ${formatCompact(c)})ᵀ</strong></div>
        <div><span>第二列</span><strong>(${formatCompact(b)}, ${formatCompact(d)})ᵀ</strong></div>
        <div><span>输出形状</span><strong>${shape.title}</strong></div>
        <p>${shape.description}</p>
      `;
      if (final) {
        status.setAttribute("aria-busy", "false");
        status.setAttribute("aria-live", "polite");
        // Re-announce once at rest without spamming during the morph.
        status.setAttribute("aria-live", "off");
        requestAnimationFrame(() => status.setAttribute("aria-live", "polite"));
      }
    };

    const scheduleStatus = (matrix, { final = false } = {}) => {
      pendingStatusMatrix = matrix;
      if (final) {
        if (statusSyncTimer) {
          clearTimeout(statusSyncTimer);
          statusSyncTimer = 0;
        }
        updateStatus(matrix, { final: true });
        statusSyncAt = performance.now();
        return;
      }
      const now = performance.now();
      const wait = Math.max(0, 100 - (now - statusSyncAt));
      if (statusSyncTimer) return;
      statusSyncTimer = window.setTimeout(() => {
        statusSyncTimer = 0;
        statusSyncAt = performance.now();
        if (pendingStatusMatrix) updateStatus(pendingStatusMatrix, { final: false });
      }, wait);
    };

    const markPreset = (id) => {
      toolbar.querySelectorAll("button").forEach((button) => {
        const active = Boolean(id) && button.dataset.transformPreset === id;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    };

    const writeInputsFallback = (values) => {
      inputs.forEach((input, index) => {
        if (!input) return;
        input.value = values[index];
      });
    };

    const applyPreset = (values, id, { animate = true } = {}) => {
      markPreset(id);
      status.setAttribute("aria-busy", "true");
      status.setAttribute("aria-live", "off");

      if (animate && typeof window.animateTransformMatrix === "function") {
        window
          .animateTransformMatrix(values, {
            onUpdate: (matrix, meta) => scheduleStatus(matrix, { final: Boolean(meta?.final) }),
          })
          .then((matrix) => scheduleStatus(matrix, { final: true }));
        return;
      }

      if (typeof window.setTransformMatrix === "function") {
        window.setTransformMatrix(values);
      } else {
        writeInputsFallback(values);
        inputs[0]?.dispatchEvent(new Event("input", { bubbles: true }));
      }
      scheduleStatus(
        { a: values[0], b: values[1], c: values[2], d: values[3] },
        { final: true },
      );
    };

    toolbar.addEventListener("click", (event) => {
      const button = event.target.closest("[data-transform-preset]");
      if (!button) return;
      const preset = presets.find(([presetId]) => presetId === button.dataset.transformPreset);
      if (preset) applyPreset(preset[2], preset[0], { animate: true });
    });

    inputs.forEach((input) =>
      input?.addEventListener("input", (event) => {
        if (!event.isTrusted) return;
        markPreset(null);
        scheduleStatus(null, { final: true });
      }),
    );

    applyPreset([1, 0, 0, 1], "identity", { animate: false });
    interactive.dataset.sectionOneEnhanced = "true";
  }

  function formatCompact(value) {
    const rounded = Math.round(value * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : String(rounded);
  }

  window.defineChapter4Renderer?.("matrix-language", {
    formal: renderFormal,
    interactive: enhanceTransform,
  });
})();
