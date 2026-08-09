(() => {
  const { I, on, markExperimentStep, conclusionMarkup, matrix } = window.Chapter8Lab;

  const passportPairs = {
    similar: {
      label: "真相似：同一变换换基",
      A: [[2, 0], [0, 1]],
      B: [[2, 1], [0, 1]],
      rows: [
        ["迹", "3", "3", true, "相同"],
        ["行列式", "2", "2", true, "相同"],
        ["特征多项式", "(\\lambda-2)(\\lambda-1)", "(\\lambda-2)(\\lambda-1)", true, "相同"],
        ["最小多项式", "(\\lambda-2)(\\lambda-1)", "(\\lambda-2)(\\lambda-1)", true, "相同"],
        ["不变因子", "1,\\ (\\lambda-2)(\\lambda-1)", "1,\\ (\\lambda-2)(\\lambda-1)", true, "完全一致"],
      ],
      conclusion: "全部不变因子一致；它们确实只是同一个线性变换在两组基下的矩阵。",
    },
    false: {
      label: "伪相似：相同 χ 的两种结构",
      A: [[2, 0], [0, 2]],
      B: [[2, 1], [0, 2]],
      rows: [
        ["迹", "4", "4", true, "相同"],
        ["行列式", "4", "4", true, "相同"],
        ["特征多项式", "(\\lambda-2)^2", "(\\lambda-2)^2", true, "仍相同"],
        ["最小多项式", "\\lambda-2", "(\\lambda-2)^2", false, "第一次分叉"],
        ["不变因子", "\\lambda-2,\\ \\lambda-2", "1,\\ (\\lambda-2)^2", false, "指纹不同"],
      ],
      conclusion: "前三个粗指标都相同，但最小多项式和不变因子不同，因此不相似。",
    },
  };

  function mount(host) {
    let mode = "rooms";
    let pairKey = "false";
    let page = 0;
    let basisT = 0;

    function renderRooms() {
      markExperimentStep(host, basisT < 0.05 ? 0 : basisT < 0.95 ? 1 : 2);
      host.innerHTML = `
        <div class="ch8-lab ch8-cinema ch8-similarity-cinema">
          <div class="ch8-story-tabs" role="tablist" aria-label="相似实验模式">
            <button type="button" class="is-active" data-sim-mode="rooms" aria-pressed="true"><span>01</span>连续换基</button>
            <button type="button" data-sim-mode="passport" aria-pressed="false"><span>02</span>结构护照</button>
          </div>

          <header class="ch8-cinema-head">
            <div><span>对象不动 · 坐标网格连续倾斜</span><h3>拖动换基参数，观察矩阵怎样随坐标语言改变</h3></div>
            <p>实线几何对象和线性变换始终固定。只有基向量、坐标网格和矩阵记录在变化。</p>
          </header>

          <section class="ch8-basis-stage ch8-coordinate-rooms">
            <svg data-basis-svg viewBox="40 20 520 460" role="img" aria-label="同一线性变换在连续变化的基下保持几何对象不变">
              <g class="basis-grid"><path data-grid-a></path><path data-grid-b></path></g>
              <path class="basis-axis" d="M70 360H540M245 462V48"></path>
              <polygon class="basis-input-shape" points="245,360 345,360 345,260 245,260"></polygon>
              <polygon class="basis-output-shape" points="245,360 445,360 445,260 245,260"></polygon>
              <path class="basis-map-arrow" d="M350 232C392 200 430 204 470 232"></path>
              <text class="basis-caption" x="252" y="246">单位方形</text>
              <text class="basis-caption" x="455" y="246">A 作用后</text>
              <path class="basis-vector" d="M245 360L365 235"></path>
              <path class="basis-vector image" d="M245 360L485 235"></path>
              <text class="basis-vector-label" x="356" y="224">v</text>
              <text class="basis-vector-label" x="486" y="224">Av</text>
              <path class="basis-one" data-basis-one></path>
              <path class="basis-two" data-basis-two></path>
              <text data-basis-one-label x="354" y="382">e₁</text>
              <text data-basis-two-label></text>
            </svg>

            <aside class="ch8-basis-readout">
              <span>当前基</span>
              <strong data-basis-name></strong>
              <div data-basis-p></div>
              <span>同一变换的矩阵记录</span>
              <div data-basis-matrix></div>
              <p data-basis-explanation></p>
            </aside>
          </section>

          <section class="ch8-basis-control">
            <div><span>换基参数 t</span><output data-basis-output>${basisT.toFixed(2)}</output></div>
            <input data-basis-range type="range" min="0" max="1" step="0.01" value="${basisT}" aria-label="换基参数 t">
            <div class="ch8-basis-presets"><button type="button" data-basis-snap="0">标准基 E</button><button type="button" data-basis-snap="0.5">中间状态</button><button type="button" data-basis-snap="1">斜基 F</button></div>
          </section>

          <div data-basis-conclusion></div>
        </div>`;

      const gridA = host.querySelector("[data-grid-a]");
      const gridB = host.querySelector("[data-grid-b]");
      const basisOne = host.querySelector("[data-basis-one]");
      const basisTwo = host.querySelector("[data-basis-two]");
      const basisTwoLabel = host.querySelector("[data-basis-two-label]");
      const range = host.querySelector("[data-basis-range]");
      const output = host.querySelector("[data-basis-output]");
      const name = host.querySelector("[data-basis-name]");
      const pSlot = host.querySelector("[data-basis-p]");
      const matrixSlot = host.querySelector("[data-basis-matrix]");
      const explanation = host.querySelector("[data-basis-explanation]");
      const conclusion = host.querySelector("[data-basis-conclusion]");

      function gridPath(t) {
        const origin = { x: 245, y: 360 };
        const b1 = { x: 100, y: 0 };
        const b2 = { x: 58 * t, y: -100 };
        const linesA = [];
        const linesB = [];
        for (let i = -4; i <= 5; i += 1) {
          const x1 = origin.x + i * b1.x - 4 * b2.x;
          const y1 = origin.y + i * b1.y - 4 * b2.y;
          const x2 = origin.x + i * b1.x + 4 * b2.x;
          const y2 = origin.y + i * b1.y + 4 * b2.y;
          linesA.push(`M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`);
        }
        for (let j = -4; j <= 4; j += 1) {
          const x1 = origin.x - 4 * b1.x + j * b2.x;
          const y1 = origin.y - 4 * b1.y + j * b2.y;
          const x2 = origin.x + 5 * b1.x + j * b2.x;
          const y2 = origin.y + 5 * b1.y + j * b2.y;
          linesB.push(`M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`);
        }
        return { a: linesA.join(""), b: linesB.join(""), b2 };
      }

      function update() {
        const { a, b, b2 } = gridPath(basisT);
        gridA.setAttribute("d", a);
        gridB.setAttribute("d", b);
        basisOne.setAttribute("d", "M245 360L345 360");
        basisTwo.setAttribute("d", `M245 360L${(245 + b2.x).toFixed(1)} ${(360 + b2.y).toFixed(1)}`);
        basisTwoLabel.setAttribute("x", String(257 + b2.x));
        basisTwoLabel.setAttribute("y", String(350 + b2.y));
        basisTwoLabel.textContent = basisT < 0.02 ? "e₂" : basisT > 0.98 ? "f₂=e₁+e₂" : "f₂(t)";
        output.textContent = basisT.toFixed(2);
        range.value = String(basisT);
        range.setAttribute("aria-valuetext", `换基参数 ${basisT.toFixed(2)}`);
        name.textContent = basisT < 0.02 ? "E=(e₁,e₂)" : basisT > 0.98 ? "F=(e₁,e₁+e₂)" : `F(t)=(e₁, te₁+e₂)`;
        pSlot.innerHTML = I(`P(t)=\\begin{bmatrix}1&${basisT.toFixed(2)}\\\\0&1\\end{bmatrix}`);
        matrixSlot.innerHTML = I(`B(t)=P(t)^{-1}AP(t)=\\begin{bmatrix}2&${basisT.toFixed(2)}\\\\0&1\\end{bmatrix}`);
        explanation.textContent = basisT < 0.02
          ? "网格是正交的，矩阵记录为对角形。"
          : basisT > 0.98
            ? "网格已经倾斜，矩阵出现非零上三角项，但实线几何对象完全没有动。"
            : "网格正在倾斜；矩阵中的非对角项连续增加，只是在记录坐标语言的变化。";
        conclusion.innerHTML = conclusionMarkup(
          "相似的几何意义",
          "矩阵在变，线性变换本身没有变",
          "同一个对象在连续变化的基下由 B(t)=P(t)⁻¹AP(t) 记录。相似不是图形碰巧像，而是同一线性变换的不同坐标表达。",
        );
        markExperimentStep(host, basisT < 0.05 ? 0 : basisT < 0.95 ? 1 : 2);
      }

      on(range, "input", (event) => { basisT = Number(event.currentTarget.value); update(); });
      host.querySelectorAll("[data-basis-snap]").forEach((button) => on(button, "click", () => { basisT = Number(button.dataset.basisSnap); update(); }));
      host.querySelectorAll("[data-sim-mode]").forEach((button) => on(button, "click", () => {
        mode = button.dataset.simMode;
        if (mode === "passport") renderPassport();
      }));
      update();
    }

    function renderPassport() {
      markExperimentStep(host, Math.min(page + 1, 3));
      const pair = passportPairs[pairKey];
      const final = page === pair.rows.length - 1;
      const current = pair.rows[page];
      host.innerHTML = `
        <div class="ch8-lab ch8-cinema ch8-similarity-cinema">
          <div class="ch8-story-tabs" role="tablist" aria-label="相似实验模式">
            <button type="button" data-sim-mode="rooms" aria-pressed="false"><span>01</span>连续换基</button>
            <button type="button" class="is-active" data-sim-mode="passport" aria-pressed="true"><span>02</span>结构护照</button>
          </div>

          <header class="ch8-cinema-head">
            <div><span>不要把必要条件当充分条件</span><h3>逐层打开相似类的结构护照</h3></div>
            <label>比较对象<select data-passport-pair>${Object.entries(passportPairs).map(([key, item]) => `<option value="${key}" ${key === pairKey ? "selected" : ""}>${item.label}</option>`).join("")}</select></label>
          </header>

          <div class="ch8-passport-matrices">
            <article><span>矩阵 A</span>${matrix(pair.A)}</article>
            <div><b>${final ? (pairKey === "similar" ? "≈" : "≠") : "?"}</b><span>是否相似</span></div>
            <article><span>矩阵 B</span>${matrix(pair.B)}</article>
          </div>

          <section class="ch8-passport-book">
            ${pair.rows.map((row, rowIndex) => {
              const visible = rowIndex <= page;
              return `<article class="${visible ? "is-visible" : "is-locked"} ${visible && !row[3] ? "is-fail" : ""}">
                <span>${String(rowIndex + 1).padStart(2, "0")}</span>
                <b>${row[0]}</b>
                <div>${visible ? I(row[1]) : "•••"}</div>
                <i>${visible ? (row[3] ? "=" : "≠") : "锁定"}</i>
                <div>${visible ? I(row[2]) : "•••"}</div>
                <small>${visible ? row[4] : "继续打开下一层"}</small>
              </article>`;
            }).join("")}
          </section>

          <div class="ch8-passport-controls">
            <button type="button" data-passport-prev ${page === 0 ? "disabled" : ""}>← 收回一层</button>
            <div><span>当前判断</span><strong>${final ? pair.conclusion : current[3] ? "仍然不能下结论：当前只通过了一个必要条件。" : "已经发现不变量不同，可以立即排除相似。"}</strong></div>
            <button type="button" class="is-primary" data-passport-next ${final ? "disabled" : ""}>打开下一层 →</button>
          </div>

          ${conclusionMarkup(
            "护照判定",
            final ? (pairKey === "similar" ? "不变因子完全一致：相似" : "不变因子不同：不相似") : `目前只检查到“${current[0]}”`,
            final ? pair.conclusion : "越粗的不变量越容易相同；只有完整的不变因子才能给出相似分类。",
            final && pairKey === "false" ? "danger" : "accent",
          )}
        </div>`;
      host.querySelectorAll("[data-sim-mode]").forEach((button) => on(button, "click", () => { mode = button.dataset.simMode; if (mode === "rooms") renderRooms(); }));
      on(host.querySelector("[data-passport-pair]"), "change", (event) => { pairKey = event.target.value; page = 0; renderPassport(); });
      on(host.querySelector("[data-passport-prev]"), "click", () => { page = Math.max(0, page - 1); renderPassport(); });
      on(host.querySelector("[data-passport-next]"), "click", () => { page = Math.min(passportPairs[pairKey].rows.length - 1, page + 1); renderPassport(); });
    }

    if (mode === "rooms") renderRooms();
    else renderPassport();
  }

  window.defineChapter8Lab("similarity-story", mount);
})();
