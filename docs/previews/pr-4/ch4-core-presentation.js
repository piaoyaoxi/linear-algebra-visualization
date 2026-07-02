(() => {
  const inline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : `<code>${source}</code>`);

  function formalShell(title, intro, main, meta, definitions, noteTitle, noteText) {
    return `
      <h2>${title}</h2>
      <div class="core-formal">
        <p class="core-intro">${intro}</p>
        <div class="core-map">
          <div class="core-map-main">${main}</div>
          <dl class="core-meta">${meta}</dl>
        </div>
        <div class="core-definition-stack">${definitions}</div>
        <div class="core-note"><strong>${noteTitle}</strong><p>${noteText}</p></div>
      </div>
    `;
  }

  function metaRow(title, text) {
    return `<div><dt>${title}</dt><dd>${text}</dd></div>`;
  }

  function definition(title, text) {
    return `<article class="core-definition"><strong>${title}</strong><p>${text}</p></article>`;
  }

  function renderSection3Formal() {
    const formal = document.querySelector("#matrix-product-determinant-rank-formal");
    if (!formal || formal.dataset.corePresentationReady === "true") return;

    formal.innerHTML = formalShell(
      "先把“缩放”和“有效方向”分开",
      "行列式和秩都在描述变换，但问的不是同一个问题：行列式问面积或体积缩放了多少；秩问最后还剩多少条彼此独立的方向能够到达。",
      display("\\det(AB)=\\det(A)\\det(B)"),
      [
        metaRow("行列式", "连续变换时，缩放因子相乘。"),
        metaRow("秩", "输出空间的维数；也就是仍然保留的独立方向数。"),
        metaRow("关键不等式", `${inline("\\operatorname{rank}(AB)\\leq\\min\\{\\operatorname{rank}(A),\\operatorname{rank}(B)\\}")}。`),
      ].join(""),
      [
        definition("行列式", `${inline("\\det(A)")} 为 0 时，二维网格被压到线或点；面积已经丢失。`),
        definition("秩", "不要把秩只当作消元后出现的数字。它在回答：输出还能沿多少个独立方向变化？"),
        definition("复合", "前一步已经压掉的方向，后一步只能接着处理剩下的输出；因此复合不能恢复已经丢失的独立性。"),
      ].join(""),
      "阅读抓手",
      `先问“列向量是否独立”，再问“面积是否被压到 0”。${inline("\\det")} 与秩在二维可逆问题里会相遇，但它们各自说明的是不同侧面。`,
    );
    formal.dataset.corePresentationReady = "true";
  }

  function rankView(mode) {
    if (mode === "one") {
      return `
        <h4>秩 1：两列落在同一条线上</h4>
        <p>这里第二列是第一列的两倍。输入平面虽然有两个基本方向，但经过矩阵后，它们都落到同一条输出方向上。</p>
        <div class="core-math">${display("B=\\begin{pmatrix}1&2\\\\1&2\\end{pmatrix},\\quad Be_1=\\begin{pmatrix}1\\\\1\\end{pmatrix},\\quad Be_2=2Be_1")}</div>
        <ul class="core-points"><li>两列相关，所以只能张成一条线，${inline("\\operatorname{rank}(B)=1")}。</li><li>无论再左乘什么 A，${inline("AB")} 的两列仍满足相同的倍数关系。</li><li>因此无法通过后续复合重新变成秩 2。</li></ul>`;
    }
    return `
      <h4>秩 2：两列仍然给出两个独立方向</h4>
      <p>这里两列不共线，输出还能铺满整个平面。把它理解成“两个基本方向经过变换后仍没有挤到同一条线”。</p>
      <div class="core-math">${display("A=\\begin{pmatrix}2&1\\\\0&1\\end{pmatrix},\\quad Ae_1=\\begin{pmatrix}2\\\\0\\end{pmatrix},\\quad Ae_2=\\begin{pmatrix}1\\\\1\\end{pmatrix}")}</div>
      <ul class="core-points"><li>两列不共线，所以它们张成平面，${inline("\\operatorname{rank}(A)=2")}。</li><li>${inline("\\det(A)=2\\ne0")}，面积没有被压到 0。</li><li>在二维中，这也预示着 A 可以有逆。</li></ul>`;
  }

  function renderSection3Interactive() {
    const section = document.querySelector("#matrix-product-determinant-rank-interactive");
    if (!section || section.dataset.corePresentationReady === "true") return;
    section.innerHTML = `
      <h2>交互实验</h2>
      <div class="core-lab">
        <div class="core-lab-head"><h3>秩：独立方向有没有被压掉</h3><p>不要先背公式。先切换两种列向量关系，观察“输出还能铺满平面”与“输出只剩一条线”的差别。</p></div>
        <div class="rank-choice-row"><button type="button" class="core-choice is-active" data-rank-mode="two">两列独立 · 秩 2</button><button type="button" class="core-choice" data-rank-mode="one">两列共线 · 秩 1</button></div>
        <div class="core-lab-panel" data-rank-panel>${rankView("two")}</div>
      </div>
    `;
    section.querySelectorAll("[data-rank-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        const mode = button.dataset.rankMode;
        section.querySelectorAll("[data-rank-mode]").forEach((item) => item.classList.toggle("is-active", item === button));
        const panel = section.querySelector("[data-rank-panel]");
        if (panel) panel.innerHTML = rankView(mode);
      });
    });
    section.dataset.corePresentationReady = "true";
  }

  function renderSection4Formal() {
    const formal = document.querySelector("#matrix-inverse-formal");
    if (!formal || formal.dataset.corePresentationReady === "true") return;
    formal.innerHTML = formalShell(
      "可逆的本质是信息可以倒推",
      "逆矩阵不是“另一个刚好能相乘得到 I 的公式”。它表示一次反向过程：先经过 A，再经过逆矩阵，所有输入都能准确回到原处。",
      display("A^{-1}A=AA^{-1}=I"),
      [
        metaRow("谁可能有逆", "首先必须是方阵；输入和输出维数要相同。"),
        metaRow("二维信号", `${inline("\\det(A)\\ne0")} 表示没有面积坍缩。`),
        metaRow("方程组", `${inline("Ax=b")} 对每个 b 有唯一解，说明输出能唯一倒推输入。`),
      ].join(""),
      [
        definition("几何语言", "可逆：两个独立方向仍然独立，平面仍然铺满平面；不可逆：至少一个方向被压没。"),
        definition("代数语言", "对 n 阶矩阵，可逆、秩为 n、行列式非零、列向量线性无关、行最简形为 I 是一组等价条件。"),
        definition("计算语言", "在 2 阶情形，可以使用公式；在更一般情形，后面的初等矩阵会给出系统的求逆方法。"),
      ].join(""),
      "不要混淆",
      "“存在逆矩阵”是结构结论；求出逆矩阵只是后续计算。先判断信息是否已丢失，再决定是否值得求逆。",
    );
    formal.dataset.corePresentationReady = "true";
  }

  function inverseView(mode) {
    if (mode === "singular") {
      return `
        <h4>不可逆：两列被挤到同一条线</h4>
        <p>第二列是第一列的两倍。两个基本方向在输出端不再独立，因此许多不同输入会得到相同输出。</p>
        <div class="core-math">${display("S=\\begin{pmatrix}1&2\\\\2&4\\end{pmatrix},\\quad \\det(S)=1\\cdot4-2\\cdot2=0")}</div>
        <ul class="core-points"><li>${inline("\\operatorname{rank}(S)=1")}，输出只剩一维。</li><li>面积被压到 0，无法从输出唯一倒推出输入。</li><li>所以 S 没有逆矩阵。</li></ul>`;
    }
    return `
      <h4>可逆：两列仍然独立</h4>
      <p>这里两个基本方向经过变换后仍不共线。它们仍然铺满整个平面，所以反向过程能够存在。</p>
      <div class="core-math">${display("A=\\begin{pmatrix}2&1\\\\1&1\\end{pmatrix},\\quad \\det(A)=1\\ne0,\\quad A^{-1}=\\begin{pmatrix}1&-1\\\\-1&2\\end{pmatrix}")}</div>
      <ul class="core-points"><li>${inline("\\operatorname{rank}(A)=2")}；没有独立方向丢失。</li><li>面积缩放因子非零。</li><li>乘上 ${inline("A^{-1}")} 可以把输出唯一送回原输入。</li></ul>`;
  }

  function renderSection4Interactive() {
    const section = document.querySelector("#matrix-inverse-interactive");
    if (!section || section.dataset.corePresentationReady === "true") return;
    section.innerHTML = `
      <h2>对照实验</h2>
      <div class="core-lab">
        <div class="core-lab-head"><h3>可逆和不可逆只差在哪里</h3><p>看两列是否仍独立，而不是只盯着“有没有公式”。</p></div>
        <div class="inverse-choice-row"><button type="button" class="core-choice is-active" data-inverse-mode="invertible">可逆</button><button type="button" class="core-choice" data-inverse-mode="singular">不可逆</button></div>
        <div class="core-lab-panel" data-inverse-panel>${inverseView("invertible")}</div>
      </div>
    `;
    section.querySelectorAll("[data-inverse-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        const mode = button.dataset.inverseMode;
        section.querySelectorAll("[data-inverse-mode]").forEach((item) => item.classList.toggle("is-active", item === button));
        const panel = section.querySelector("[data-inverse-panel]");
        if (panel) panel.innerHTML = inverseView(mode);
      });
    });
    section.dataset.corePresentationReady = "true";
  }

  const elementaryStates = [
    {
      label: "第 1 步 / 3：写下同一个行操作",
      note: `目标操作是 ${inline("R_2\\leftarrow R_2-3R_1")}。先不要急着改 A；先问“这条规则施加到单位矩阵上会发生什么”。`,
      leftTitle: "单位矩阵 I",
      left: "I=\\begin{pmatrix}1&0\\\\0&1\\end{pmatrix}",
      rightTitle: "原矩阵 A",
      right: "A=\\begin{pmatrix}1&2\\\\3&7\\end{pmatrix}",
      caption: "同一个操作会同时解释两件事：它怎样变出 E，又怎样改变 A。",
    },
    {
      label: "第 2 步 / 3：把操作施加到 I，得到 E",
      note: `对 I 做 ${inline("R_2\\leftarrow R_2-3R_1")}，第二行从 ${inline("(0,1)")} 变成 ${inline("(-3,1)")}。这就是对应的初等矩阵。`,
      leftTitle: "得到初等矩阵 E",
      left: "E=\\begin{pmatrix}1&0\\\\-3&1\\end{pmatrix}",
      rightTitle: "A 还没有计算",
      right: "A=\\begin{pmatrix}1&2\\\\3&7\\end{pmatrix}",
      caption: "构造 E 的方法不是背模板：对单位矩阵做同样的操作。",
    },
    {
      label: "第 3 步 / 3：左乘 E，就是对 A 做同一行变换",
      note: `现在计算 ${inline("EA")}。E 的第二行是 ${inline("(-3,1)")}，所以它会取 ${inline("-3R_1+R_2")}，这正是目标行操作。`,
      leftTitle: "左乘 E",
      left: "EA=\\begin{pmatrix}1&0\\\\-3&1\\end{pmatrix}\\begin{pmatrix}1&2\\\\3&7\\end{pmatrix}",
      rightTitle: "变换后的矩阵",
      right: "EA=\\begin{pmatrix}1&2\\\\0&1\\end{pmatrix}",
      caption: "因此“对 A 做一次行变换”和“左乘对应的初等矩阵 E”是同一件事。",
    },
  ];

  function elementaryView(index) {
    const state = elementaryStates[index];
    return `
      <div class="elementary-stepper">
        <div class="elementary-progress">${state.label}</div>
        <p class="core-lab-caption">${state.note}</p>
        <div class="matrix-pair">
          <div class="matrix-panel"><strong>${state.leftTitle}</strong>${display(state.left)}</div>
          <div class="matrix-panel"><strong>${state.rightTitle}</strong>${display(state.right)}</div>
        </div>
        <p class="core-lab-caption">${state.caption}</p>
      </div>`;
  }

  function renderSection6Formal() {
    const formal = document.querySelector("#elementary-matrices-formal");
    if (!formal || formal.dataset.corePresentationReady === "true") return;
    formal.innerHTML = formalShell(
      "初等矩阵就是“把操作写成矩阵”",
      "只要理解一条原则，初等矩阵就不神秘：先把某个行变换施加到单位矩阵，得到 E；再左乘 E，就会把同一条行规则施加到任意矩阵 A。",
      display("E\\,A=\\text{对 }A\\text{ 做对应的行变换}"),
      [
        metaRow("换行", "交换两行；反向操作仍是交换同两行。"),
        metaRow("倍乘", "一行乘非零数；反向操作是乘倒数。"),
        metaRow("倍加", "一行加另一行的倍数；反向操作是加相反数倍。"),
      ].join(""),
      [
        definition("怎样构造 E", "对单位矩阵 I 做同一个行变换。得到的结果就是初等矩阵 E。"),
        definition("为什么是左乘", "左侧矩阵的每一行会组合右侧矩阵的各行。因此 E 的行规则会直接重组 A 的行。"),
        definition("为什么可逆", "三类初等操作都有明确的反向操作；反向操作对应的初等矩阵就是 E 的逆。"),
      ].join(""),
      "向后连接",
      "这一节把消元和矩阵乘法接起来。§7 的分块初等变换只是把“行”升级成“矩阵块”，逻辑不会变。",
    );
    formal.dataset.corePresentationReady = "true";
  }

  function renderSection6Interactive() {
    const section = document.querySelector("#elementary-matrices-interactive");
    if (!section || section.dataset.corePresentationReady === "true") return;
    let step = 0;
    section.innerHTML = `
      <h2>逐步演示</h2>
      <div class="core-lab">
        <div class="core-lab-head"><h3>同一行操作，先作用于 I，再作用于 A</h3><p>把三步按顺序走完：你会看到 E 从哪里来，以及为什么 EA 就是行变换后的 A。</p></div>
        <div class="core-lab-panel" data-elementary-panel>${elementaryView(step)}</div>
        <div class="elementary-controls"><button type="button" class="button" data-elementary-prev disabled>上一步</button><button type="button" class="button primary" data-elementary-next>下一步</button><button type="button" class="button" data-elementary-reset>重新开始</button></div>
      </div>
    `;

    const panel = section.querySelector("[data-elementary-panel]");
    const previous = section.querySelector("[data-elementary-prev]");
    const next = section.querySelector("[data-elementary-next]");
    const reset = section.querySelector("[data-elementary-reset]");
    const paint = () => {
      if (panel) panel.innerHTML = elementaryView(step);
      if (previous) previous.disabled = step === 0;
      if (next) {
        next.disabled = step === elementaryStates.length - 1;
        next.textContent = step === elementaryStates.length - 1 ? "已完成" : "下一步";
      }
    };
    previous?.addEventListener("click", () => { if (step > 0) { step -= 1; paint(); } });
    next?.addEventListener("click", () => { if (step < elementaryStates.length - 1) { step += 1; paint(); } });
    reset?.addEventListener("click", () => { step = 0; paint(); });
    section.dataset.corePresentationReady = "true";
  }

  function applyCorePresentation() {
    renderSection3Formal();
    renderSection3Interactive();
    renderSection4Formal();
    renderSection4Interactive();
    renderSection6Formal();
    renderSection6Interactive();
  }

  function start() {
    const main = document.querySelector("#mainContent");
    if (!main) return;
    const observer = new MutationObserver(() => window.requestAnimationFrame(applyCorePresentation));
    observer.observe(main, { childList: true, subtree: true });
    applyCorePresentation();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
