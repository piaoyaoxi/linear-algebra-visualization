(() => {
  const inline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : `<code>${source}</code>`);

  function renderSectionOneFormal() {
    const formal = document.querySelector("#matrix-language-formal");
    if (!formal || formal.dataset.presentationReady === "true") return;

    formal.innerHTML = `
      <h2>先把矩阵的记号摆清楚</h2>
      <div class="lesson-formal-layout">
        <p class="lesson-formal-intro">这一节先把矩阵当作一个有位置的数表来读：先认清它有几行、几列，每个数字处在哪个位置；再回头看它为什么能够记录方程组和方向变化。</p>
        <div class="matrix-anatomy">
          <div class="matrix-anatomy-main">${display("A=(a_{ij})_{m\\times n}")}</div>
          <dl class="lesson-meta-list">
            <div><dt>矩阵的阶</dt><dd>${inline("m\\times n")}：m 行，n 列。</dd></div>
            <div><dt>元素的位置</dt><dd>${inline("a_{ij}")}：第 i 行第 j 列。先读行，再读列。</dd></div>
            <div><dt>矩阵相等</dt><dd>先有相同的行数和列数，再要求所有对应位置的元素相等。</dd></div>
          </dl>
        </div>
        <div class="lesson-card-grid">
          <article class="lesson-card"><span class="lesson-card-kicker">背景一</span><h3>方程组把系数排成矩阵</h3><p>多个方程会反复出现同一批未知数和系数。把系数按行排开，计算与比较才有统一的对象可操作。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">背景二</span><h3>矩阵的行列位置带有信息</h3><p>数字放在不同位置，通常就改变了矩阵，也改变了它能表达的关系。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">背景三</span><h3>相等先比结构，再比数字</h3><p>两个矩阵先要尺寸相同，再比较对应位置的数字是否相等。</p></article>
        </div>
        <div class="lesson-reading-note"><strong>后面的观察法</strong><p>当我们把二维矩阵看成平面变换的记录时，第一列告诉右向的基本方向去了哪里，第二列告诉上向的基本方向去了哪里。下面的交互只用来体验这句话，不取代本节的基本定义。</p></div>
      </div>
    `;
    formal.dataset.presentationReady = "true";
  }

  function renderSectionTwoFormal() {
    const formal = document.querySelector("#matrix-operations-formal");
    if (!formal || formal.dataset.presentationReady === "true") return;

    formal.innerHTML = `
      <h2>先分清三类运算</h2>
      <div class="lesson-formal-layout">
        <p class="lesson-formal-intro">矩阵运算最容易混的地方，是把“逐项组合”和“过程复合”混在一起。加法、数乘和转置先解决读写规则；矩阵乘法进入过程复合，它要求尺寸匹配，并把两个连续步骤压缩成一个新矩阵。</p>
        <div class="operation-map">
          <div class="operation-map-main">${display("A_{m\\times n}B_{n\\times p}=C_{m\\times p}")}</div>
          <dl class="lesson-meta-list">
            <div><dt>加法与数乘</dt><dd>同型矩阵才能逐项相加；数乘把每个元素同时缩放。</dd></div>
            <div><dt>转置</dt><dd>${inline("(A^T)_{ij}=a_{ji}")}：行和列互换。</dd></div>
            <div><dt>矩阵乘法</dt><dd>A 的列数要等于 B 的行数；外侧尺寸决定 AB 的阶。</dd></div>
            <div><dt>单位矩阵</dt><dd>${inline("IA=A")}，${inline("AI=A")}；它表示不改变输入的操作。</dd></div>
          </dl>
        </div>
        <div class="definition-stack">
          <article class="definition-row"><strong>加法与数乘</strong><p>${inline("(A+B)_{ij}=a_{ij}+b_{ij}")}。它们要求 A 与 B 同型，因为每一个位置都必须找到对应位置。</p></article>
          <article class="definition-row"><strong>转置</strong><p>${inline("A^T")} 把 A 的行和列互换，从而改变我们读取同一个数字表的位置方向。</p></article>
          <article class="definition-row"><strong>矩阵乘法</strong><p>若 ${inline("A=(a_{ik})_{m\\times n}")}，${inline("B=(b_{kj})_{n\\times p}")}，那么 ${inline("(AB)_{ij}=\\sum_{k=1}^n a_{ik}b_{kj}")}。先检查中间尺寸 n 是否匹配，再做“第 i 行配第 j 列”。</p></article>
          <article class="definition-row"><strong>基本性质</strong><p>矩阵乘法满足结合律 ${inline("(AB)C=A(BC)")}；交换顺序通常会改变结果，所以计算前必须保留顺序。</p></article>
        </div>
        <div class="lesson-reading-note"><strong>这一节的核心</strong><p>请把 ${inline("AB")} 同时记成三句话：先 B 后 A；AB 的第 j 列是 A 作用到 B 的第 j 列；${inline("(AB)_{ij}")} 是 A 的第 i 行与 B 的第 j 列的配对。这三句话是在描述同一件事。</p></div>
      </div>
    `;
    formal.dataset.presentationReady = "true";
  }

  function multiplyView(view) {
    if (view === "columns") {
      return `
        <h4>看列：乘积的列从哪里来</h4>
        <p>不要把 AB 当成一张全新的表。先看 B 的每一列：它们分别是 ${inline("Be_1")}、${inline("Be_2")}。再让 A 作用一次，就得到 AB 的对应列。</p>
        <div class="multiply-lab-math">${display("ABe_j=A(Be_j)")}</div>
        <div class="multiply-lab-math">${display("B=\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix},\\quad A=\\begin{bmatrix}2&0\\\\0&1\\end{bmatrix},\\quad AB=\\begin{bmatrix}2&2\\\\0&1\\end{bmatrix}")}</div>
        <ul class="multiply-lab-check"><li>第 1 列：${inline("Be_1=(1,0)^T")}，再经 A 作用得到 ${inline("(2,0)^T")}。</li><li>第 2 列：${inline("Be_2=(1,1)^T")}，再经 A 作用得到 ${inline("(2,1)^T")}。</li></ul>`;
    }
    if (view === "formula") {
      return `
        <h4>行列公式：一个位置怎样算出来</h4>
        <p>乘积矩阵的一个位置只看两部分：A 的一行和 B 的一列。它们逐项相乘再相加，给出一个输出坐标。</p>
        <div class="multiply-lab-math">${display("(AB)_{12}=\\begin{bmatrix}2&0\\end{bmatrix}\\begin{bmatrix}1\\\\1\\end{bmatrix}=2\\cdot1+0\\cdot1=2")}</div>
        <div class="multiply-lab-math">${display("AB=\\begin{bmatrix}2&0\\\\0&1\\end{bmatrix}\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}=\\begin{bmatrix}2&2\\\\0&1\\end{bmatrix}")}</div>
        <ul class="multiply-lab-check"><li>“行乘列”给出输出的第 i 个坐标。</li><li>尺寸不匹配时，根本找不到可以配对的整行和整列。</li></ul>`;
    }
    return `
      <h4>复合：右边先作用</h4>
      <p>把 ${inline("A")} 和 ${inline("B")} 当成两个连续步骤。${inline("ABx")} 的计算顺序是先算 ${inline("Bx")}，再算 ${inline("A(Bx)")}。</p>
      <div class="multiply-chain-row"><span class="multiply-chain-pill">${inline("x=(1,1)^T")}</span><span class="multiply-arrow">→ B →</span><span class="multiply-chain-pill">${inline("Bx=(2,1)^T")}</span><span class="multiply-arrow">→ A →</span><span class="multiply-chain-pill">${inline("A(Bx)=(4,1)^T")}</span></div>
      <div class="multiply-lab-math">${display("A(Bx)=(AB)x")}</div>
      <ul class="multiply-lab-check"><li>从右向左读是函数复合的习惯：离 x 最近的 B 先做。</li><li>把两步压成一步，才得到矩阵 AB。</li></ul>`;
  }

  function renderSectionTwoInteractive() {
    const section = document.querySelector("#matrix-operations-interactive");
    if (!section || section.dataset.presentationReady === "true") return;
    section.innerHTML = `
      <h2>交互实验</h2>
      <div class="multiply-lab">
        <div class="multiply-lab-head"><h3>同一个 AB，三种读法</h3><p>用同一组矩阵，在“复合”“看列”“行列公式”之间切换。三种语言要互相对上，最后都指向同一个乘积矩阵。</p></div>
        <div class="segmented" data-golden-tabs><button type="button" class="is-active" data-golden-view="compose">复合</button><button type="button" data-golden-view="columns">看列</button><button type="button" data-golden-view="formula">行列公式</button></div>
        <div class="multiply-lab-view" data-golden-view-panel>${multiplyView("compose")}</div>
      </div>
    `;
    section.querySelectorAll("[data-golden-view]").forEach((button) => {
      button.addEventListener("click", () => {
        const view = button.dataset.goldenView;
        section.querySelectorAll("[data-golden-view]").forEach((item) => item.classList.toggle("is-active", item === button));
        const panel = section.querySelector("[data-golden-view-panel]");
        if (panel) panel.innerHTML = multiplyView(view);
      });
    });
    section.dataset.presentationReady = "true";
  }

  function enhanceExamples() {
    document.querySelectorAll(".lesson-page-section[id$='-example']").forEach((section) => {
      if (section.dataset.exampleReady === "true") return;
      const details = section.querySelector("details.example-box");
      const summary = details?.querySelector("summary");
      const question = details?.querySelector(".example-question");
      if (!details || !summary || !question) return;
      const title = document.createElement("h3");
      title.className = "example-title";
      title.textContent = summary.textContent.trim();
      const label = document.createElement("span");
      label.className = "example-label";
      label.textContent = "题目";
      question.prepend(label);
      details.before(title);
      title.after(question);
      summary.textContent = "展开答案与分析";
      section.dataset.exampleReady = "true";
    });
  }

  function applyLessonPresentation() {
    renderSectionOneFormal();
    renderSectionTwoFormal();
    renderSectionTwoInteractive();
    enhanceExamples();
  }

  function start() {
    const main = document.querySelector("#mainContent");
    if (!main) return;
    const observer = new MutationObserver(() => window.requestAnimationFrame(applyLessonPresentation));
    observer.observe(main, { childList: true, subtree: true });
    applyLessonPresentation();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
