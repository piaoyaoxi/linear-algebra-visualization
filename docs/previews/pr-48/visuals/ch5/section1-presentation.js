(() => {
  const M = () => window.Ch5Math;
  const inline = (source) => (window.texInline ? window.texInline(source) : source);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : source);

  function module(index, title, subtitle, body) {
    return `<section class="ch5-module"><div class="ch5-module-heading"><span>${index}</span><div><h3>${title}</h3><p>${subtitle}</p></div></div>${body}</section>`;
  }

  function matrixButtons() {
    return `<div class="ch5s1-matrix-map" role="group" aria-label="二次型对应的二阶对称矩阵">
      <button type="button" data-map-cell="a">2</button>
      <button type="button" data-map-cell="b">3</button>
      <button type="button" data-map-cell="b">3</button>
      <button type="button" data-map-cell="c">5</button>
    </div>`;
  }

  function renderFormal(formal) {
    if (!formal) return;
    formal.innerHTML = `
      <h2>二次型是对象，矩阵是坐标记录</h2>
      <div class="ch5-foundation ch5s1-foundation">
        <p class="ch5-lead">先把一个容易混淆的层次分开：二次型是向量上的数值规律，矩阵是它在选定坐标中的记录。固定坐标后对称矩阵唯一；坐标改变后矩阵会变，但同一个向量的二次型值不会变。</p>

        ${module(
          "01",
          "先辨认对象：二次齐次是必要条件",
          "坐标式中的每一项总次数都必须等于 2",
          `<div class="ch5-mini-grid">
            <article class="ch5-card ch5s1-example is-yes"><span>二次型</span>${display("2x_1^2-3x_1x_2+x_2^2")}<p>平方项和交叉项的总次数都为 2。</p></article>
            <article class="ch5-card ch5s1-example is-no"><span>非二次型</span>${display("x_1^2+x_2+1")}<p>它含有一次项和常数项，不满足二次齐次条件。</p></article>
          </div>`,
        )}

        ${module(
          "02",
          "交叉项为什么要除以 2",
          "点击一项，看它落到矩阵的哪个位置",
          `<div class="ch5s1-map-demo" data-s1-map>
            <div class="ch5s1-term-list" role="group" aria-label="选择多项式中的一项">
              <button type="button" class="is-active" data-map-term="a">${inline("2x_1^2")}</button>
              <button type="button" data-map-term="b">${inline("6x_1x_2")}</button>
              <button type="button" data-map-term="c">${inline("5x_2^2")}</button>
            </div>
            <span class="ch5s1-map-arrow" aria-hidden="true">→</span>
            <div>${matrixButtons()}<p class="ch5s1-map-copy" data-map-copy></p></div>
          </div>`,
        )}

        ${module(
          "03",
          "为什么对称表示既充分又唯一",
          "对称化去掉冗余，极化公式恢复全部信息",
          `<div class="ch5-pair">
            <div class="ch5-card"><h4>去掉看不见的部分</h4>${display("B=S+K,\\quad S=\\frac{B+B^T}{2}")}<p>斜对称部分满足 ${inline("x^TKx=0")}，所以 ${inline("x^TBx=x^TSx")}。</p></div>
            <div class="ch5-card"><h4>从 q 恢复交叉信息</h4>${display("b(u,v)=\\frac12[q(u+v)-q(u)-q(v)]")}<p>实数域上的极化公式唯一恢复对称双线性形式，因此也唯一恢复固定坐标中的 A。</p></div>
          </div>
          <p class="ch5-muted">“唯一”始终带着一个前提：坐标已经固定。换一组坐标，同一个二次型会得到另一个合同矩阵。</p>`,
        )}

        ${module(
          "04",
          "换坐标为什么产生合同",
          "对象没有变，左右两个 C 记录坐标替换",
          `<div class="ch5s1-derivation">
            <div>${inline("x=Cy")}</div><span>代入</span>
            <div>${inline("x^TAx=(Cy)^TA(Cy)")}</div><span>转置</span>
            <div>${inline("(Cy)^T=y^TC^T")}</div><span>合并</span>
            <div>${inline("x^TAx=y^T(C^TAC)y")}</div>
          </div>
          <div class="ch5-next-note"><span>合同与相似</span><p>恒等式对任意 C 都成立；只有 ${inline("\\det C\\ne0")} 时才称合同。合同 ${inline("C^TAC")} 描述二次型换坐标，相似 ${inline("P^{-1}AP")} 描述线性算子换基。</p></div>`,
        )}
      </div>`;

    const controller = new AbortController();
    const signal = controller.signal;
    const map = formal.querySelector("[data-s1-map]");
    const copy = formal.querySelector("[data-map-copy]");
    const messages = {
      a: "平方项只进入主对角位置 a₁₁。",
      b: "6x₁x₂ 在展开中由 a₁₂x₁x₂ 与 a₂₁x₂x₁ 共同产生，所以两个位置各填 3。",
      c: "平方项只进入主对角位置 a₂₂。",
    };

    function select(kind) {
      map.querySelectorAll("[data-map-term]").forEach((button) => button.classList.toggle("is-active", button.dataset.mapTerm === kind));
      map.querySelectorAll("[data-map-cell]").forEach((cell) => cell.classList.toggle("is-active", cell.dataset.mapCell === kind));
      copy.textContent = messages[kind];
    }

    map.querySelectorAll("[data-map-term], [data-map-cell]").forEach((button) => {
      button.addEventListener("click", () => select(button.dataset.mapTerm || button.dataset.mapCell), { signal });
    });
    select("a");
    return () => controller.abort();
  }

  function mountLab(root) {
    if (!root) return;
    root.innerHTML = `
      <h2>交互实验</h2>
      <div class="ch5-lab ch5s1-lab">
        <div class="ch5-lab-head"><h3>合同变换桥</h3><p>同一个二次型换一套变量以后，矩阵和等高线表达都会变化。下面只做一件事：选择一种变量替换，确认函数值没有变，并判断它是否真的是合同。</p></div>
        <div class="ch5-task"><span>1</span><div><strong>先选择一种替换</strong><p>依次比较“剪切”和“奇异压缩”。前者只是换坐标；后者会丢失一个方向，无法反解。</p></div></div>
        <div class="ch5-toolbar" role="group" aria-label="选择变量替换">
          <button type="button" class="is-active" data-s1-preset="identity">不变</button>
          <button type="button" data-s1-preset="swap">交换变量</button>
          <button type="button" data-s1-preset="shear">剪切</button>
          <button type="button" data-s1-preset="scale">缩放</button>
          <button type="button" data-s1-preset="singular">奇异压缩</button>
        </div>

        <div class="ch5s1-flow" aria-label="合同变换流程">
          <div><span>新变量</span><strong>y</strong></div><b>→</b>
          <div><span>代入</span><strong>x=Cy</strong></div><b>→</b>
          <div><span>原二次型</span><strong>xᵀAx</strong></div>
        </div>

        <div class="ch5-lab-grid">
          <div class="ch5-panel">
            <div class="ch5s1-canvas-pair">
              <div><div class="ch5-stage is-compact"><canvas data-s1-a-canvas aria-label="原矩阵 A 的等高线"></canvas></div><strong>原坐标中的 A</strong></div>
              <div><div class="ch5-stage is-compact"><canvas data-s1-b-canvas aria-label="新矩阵 B 的等高线"></canvas></div><strong>新坐标中的 B</strong></div>
            </div>
            <div class="ch5-task"><span>2</span><div><strong>再选一个测试向量 y</strong><p>页面会先算 x=Cy，再比较 xᵀAx 与 yᵀBy。两边相等是代数恒等式；能否称为合同还要继续看 det C。</p></div></div>
            <div class="ch5-toolbar" role="group" aria-label="选择测试向量">
              <button type="button" class="is-active" data-s1-y="e1">y=(1,0)</button>
              <button type="button" data-s1-y="e2">y=(0,1)</button>
              <button type="button" data-s1-y="sum">y=(1,1)</button>
            </div>
          </div>

          <div class="ch5-panel">
            <div class="ch5-pair">
              <div class="ch5-reading"><h4>替换矩阵 C</h4><div class="ch5-matrix-wrap" data-s1-c></div></div>
              <div class="ch5-reading"><h4>新矩阵 B=CᵀAC</h4><div class="ch5-matrix-wrap" data-s1-b></div></div>
            </div>
            <div class="ch5-reading" aria-live="polite">
              <div class="ch5-reading-row"><span>det C</span><strong data-s1-det></strong></div>
              <div class="ch5-reading-row"><span>x=Cy</span><strong data-s1-x></strong></div>
              <div class="ch5-reading-row"><span>xᵀAx</span><strong data-s1-left></strong></div>
              <div class="ch5-reading-row"><span>yᵀBy</span><strong data-s1-right></strong></div>
            </div>
            <div class="ch5-result-card" data-s1-result><span class="ch5-status" data-s1-status></span><h4 data-s1-title></h4><p data-s1-copy></p></div>
          </div>
        </div>
      </div>`;

    const controller = new AbortController();
    const signal = controller.signal;
    const A = [
      [2, 0.8],
      [0.8, 1.4],
    ];
    const presets = {
      identity: { label: "不变", C: [[1, 0], [0, 1]] },
      swap: { label: "交换变量", C: [[0, 1], [1, 0]] },
      shear: { label: "剪切", C: [[1, 0.8], [0, 1]] },
      scale: { label: "缩放", C: [[1.5, 0], [0, 0.65]] },
      singular: { label: "奇异压缩", C: [[1, 1], [1, 1]] },
    };
    const vectors = { e1: [1, 0], e2: [0, 1], sum: [1, 1] };
    const state = { preset: "identity", vector: "e1" };

    function formatVector(v) {
      return `(${v.map((item) => M().formatNum(item, 3)).join(", ")})`;
    }

    function paint() {
      const C = presets[state.preset].C;
      const B = M().symmetrize(M().congruence(A, C));
      const y = vectors[state.vector];
      const x = M().matVec(C, y);
      const detC = M().det2(C);
      const left = M().qForm(A, x);
      const right = M().qForm(B, y);
      const invertible = Math.abs(detC) > 1e-8;
      const equal = Math.abs(left - right) < 1e-7;

      root.querySelector("[data-s1-c]").innerHTML = M().matrixHtml(C);
      root.querySelector("[data-s1-b]").innerHTML = M().matrixHtml(B);
      root.querySelector("[data-s1-det]").textContent = M().formatNum(detC, 4);
      root.querySelector("[data-s1-x]").textContent = formatVector(x);
      root.querySelector("[data-s1-left]").textContent = M().formatNum(left, 4);
      root.querySelector("[data-s1-right]").textContent = M().formatNum(right, 4);

      const result = root.querySelector("[data-s1-result]");
      const status = root.querySelector("[data-s1-status]");
      result.className = `ch5-result-card ${invertible ? "is-success" : "is-warning"}`;
      status.className = `ch5-status ${invertible ? "is-ok" : "is-warn"}`;
      status.textContent = invertible ? "合同成立" : "合同条件失败";
      root.querySelector("[data-s1-title]").textContent = invertible ? "只是换了一套坐标" : "一个方向被压掉了";
      root.querySelector("[data-s1-copy]").textContent = invertible
        ? `${presets[state.preset].label}的 det C≠0，新旧变量可互相恢复；两边函数值${equal ? "完全一致" : "应当一致"}。矩阵和等高线写法变了，二次型没有变。`
        : `虽然代数恒等式仍给出相同函数值，但 det C=0，不能由 x 恢复 y。变量信息已经丢失，所以 A 与 B 不能称为合同。`;

      M().drawContours(root.querySelector("[data-s1-a-canvas]"), A, { caption: "A：原坐标表达" });
      M().drawContours(root.querySelector("[data-s1-b-canvas]"), B, { caption: invertible ? "B：同一二次型的新坐标表达" : "B：奇异代入后的退化表达" });
    }

    root.querySelectorAll("[data-s1-preset]").forEach((button) => {
      button.addEventListener("click", () => {
        state.preset = button.dataset.s1Preset;
        root.querySelectorAll("[data-s1-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
        paint();
      }, { signal });
    });
    root.querySelectorAll("[data-s1-y]").forEach((button) => {
      button.addEventListener("click", () => {
        state.vector = button.dataset.s1Y;
        root.querySelectorAll("[data-s1-y]").forEach((item) => item.classList.toggle("is-active", item === button));
        paint();
      }, { signal });
    });
    window.addEventListener("resize", paint, { signal, passive: true });
    paint();
    return () => controller.abort();
  }

  window.defineChapter5Renderer("quadratic-matrix", { formal: renderFormal, interactive: mountLab });
})();
