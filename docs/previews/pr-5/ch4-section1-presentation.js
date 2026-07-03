(() => {
  function mathInline(source) {
    return window.texInline ? window.texInline(source) : `<code>${source}</code>`;
  }

  function mathDisplay(source) {
    return window.texDisplay ? window.texDisplay(source) : `<code>${source}</code>`;
  }

  function enhanceSectionOneFormal() {
    const formal = document.querySelector("#matrix-language-formal");
    if (!formal || formal.dataset.sectionOneReady === "true") return;

    formal.innerHTML = `
      <h2>先把矩阵的记号摆清楚</h2>
      <div class="foundation-layout">
        <p class="foundation-intro">这一节先把矩阵当作一个有位置的数表来读：先认清它有几行、几列，每个数字处在哪个位置；再回头看它为什么能够记录方程组和方向变化。</p>

        <div class="matrix-anatomy">
          <div class="matrix-anatomy-main">
            ${mathDisplay("A=\\begin{bmatrix}a_{11}&\\cdots&a_{1n}\\\\\\vdots&\\ddots&\\vdots\\\\a_{m1}&\\cdots&a_{mn}\\end{bmatrix}")}
          </div>
          <dl class="matrix-anatomy-meta">
            <div>
              <dt>矩阵的阶</dt>
              <dd>${mathInline("m\\times n")}：m 行，n 列。</dd>
            </div>
            <div>
              <dt>元素的位置</dt>
              <dd>${mathInline("a_{ij}")}：第 i 行第 j 列。先读行，再读列。</dd>
            </div>
            <div>
              <dt>矩阵相等</dt>
              <dd>先有相同的行数和列数，再要求所有对应位置的元素相等。</dd>
            </div>
          </dl>
        </div>

        <div class="foundation-card-grid">
          <article class="foundation-card">
            <span class="foundation-card-kicker">背景一</span>
            <h3>方程组把系数排成矩阵</h3>
            <p>多个方程会反复出现同一批未知数和系数。把系数按行排开，计算与比较才有统一的对象可操作。</p>
          </article>
          <article class="foundation-card">
            <span class="foundation-card-kicker">背景二</span>
            <h3>矩阵的行列位置带有信息</h3>
            <p>数字放在不同位置，通常就改变了矩阵，也改变了它能表达的关系。</p>
          </article>
          <article class="foundation-card">
            <span class="foundation-card-kicker">背景三</span>
            <h3>相等先比结构，再比数字</h3>
            <p>两个矩阵先要尺寸相同，再比较对应位置的数字是否相等。</p>
          </article>
        </div>

        <div class="column-reading-note">
          <strong>后面的观察法</strong>
          <p>当我们把二维矩阵看成平面变换的记录时，第一列告诉右向的基本方向去了哪里，第二列告诉上向的基本方向去了哪里。下面的交互只用来体验这句话，不取代本节的基本定义。</p>
        </div>
      </div>
    `;

    formal.dataset.sectionOneReady = "true";
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

  function applyPresentationFixes() {
    enhanceSectionOneFormal();
    enhanceExamples();
  }

  function start() {
    const main = document.querySelector("#mainContent");
    if (!main) return;

    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(applyPresentationFixes);
    });

    observer.observe(main, { childList: true, subtree: true });
    applyPresentationFixes();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
