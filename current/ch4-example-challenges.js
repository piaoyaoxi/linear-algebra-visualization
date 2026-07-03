(() => {
  const inline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : `<code>${source}</code>`);

  const challenges = {
    "matrix-language": {
      title: "从两列读出变换",
      prompt: `设 ${inline("A=\\begin{pmatrix}2&1\\\\0&1\\end{pmatrix}")}。下面哪一种读法是正确的？`,
      choices: [
        {
          value: "a",
          correct: true,
          text: `第一列表示 ${inline("Ae_1=(2,0)^T")}，第二列表示 ${inline("Ae_2=(1,1)^T")}；横向被拉伸，竖直方向向右偏。`,
        },
        {
          value: "b",
          text: `第一列表示 ${inline("Ae_2=(2,0)^T")}，第二列表示 ${inline("Ae_1=(1,1)^T")}。`,
        },
        {
          value: "c",
          text: `两个标准基向量都保持不变，因此 A 不改变平面网格。`,
        },
        {
          value: "d",
          text: `只看矩阵元素，无法判断它怎样作用于标准基向量。`,
        },
      ],
      explain: `
        <p>矩阵的第 j 列就是 ${inline("Ae_j")}。因此先读两列：</p>
        <div class="challenge-proof-math">${display("Ae_1=\\begin{pmatrix}2\\\\0\\end{pmatrix},\\qquad Ae_2=\\begin{pmatrix}1\\\\1\\end{pmatrix}")}</div>
        <p>右向的基向量被拉长到 ${inline("(2,0)^T")}；上向的基向量被送到右上方，所以竖直方向带上了向右的剪切。</p>
      `,
    },
    "matrix-operations": {
      title: "矩阵乘法的先后顺序",
      prompt: `对任意向量 ${inline("x")}，${inline("ABx")} 的计算顺序是哪一个？`,
      choices: [
        {
          value: "a",
          text: `先计算 ${inline("Ax")}，再计算 ${inline("B(Ax)")}。`,
        },
        {
          value: "b",
          correct: true,
          text: `先计算 ${inline("Bx")}，再计算 ${inline("A(Bx)")}。`,
        },
        {
          value: "c",
          text: `A 和 B 同时作用在 x 上，因此没有先后顺序。`,
        },
        {
          value: "d",
          text: `先把 A 与 B 的对应元素相乘，再作用在 x 上。`,
        },
      ],
      explain: `
        <p>矩阵乘法压缩的是两个线性变换的复合。离 ${inline("x")} 最近的 B 先作用：</p>
        <div class="challenge-flow"><span>${inline("x")}</span><b>→ B →</b><span>${inline("Bx")}</span><b>→ A →</b><span>${inline("A(Bx)")}</span></div>
        <div class="challenge-proof-math">${display("(AB)x=A(Bx)")}</div>
      `,
    },
    "matrix-product-determinant-rank": {
      title: "从列关系判断秩",
      prompt: `设 ${inline("B=\\begin{pmatrix}1&2\\\\1&2\\end{pmatrix}")}。下面哪句话正确？`,
      choices: [
        {
          value: "a",
          text: `${inline("\\operatorname{rank}(B)=2")}，因为两列都不是零向量。`,
        },
        {
          value: "b",
          correct: true,
          text: `${inline("\\operatorname{rank}(B)=1")}，因为第二列等于第一列的 2 倍。`,
        },
        {
          value: "c",
          text: `${inline("\\operatorname{rank}(B)=0")}，因为两个行向量相同。`,
        },
        {
          value: "d",
          text: `仅从两列能否成倍数关系，无法判断矩阵的秩。`,
        },
      ],
      explain: `
        <p>两列分别是 ${inline("Be_1")} 和 ${inline("Be_2")}。这里它们落在同一条输出方向上：</p>
        <div class="challenge-proof-math">${display("Be_1=\\begin{pmatrix}1\\\\1\\end{pmatrix},\\qquad Be_2=\\begin{pmatrix}2\\\\2\\end{pmatrix}=2Be_1")}</div>
        <p>它们只能张成一条线，因此输出空间是一维，${inline("\\operatorname{rank}(B)=1")}。</p>
      `,
    },
    "matrix-inverse": {
      title: "先判断能不能倒推",
      prompt: `设 ${inline("S=\\begin{pmatrix}1&2\\\\2&4\\end{pmatrix}")}。关于 S，下面哪句话正确？`,
      choices: [
        {
          value: "a",
          text: `S 可逆，因为它的四个元素都不为 0。`,
        },
        {
          value: "b",
          text: `S 可逆，因为第二行是第一行的 2 倍。`,
        },
        {
          value: "c",
          correct: true,
          text: `S 不可逆，因为 ${inline("\\det(S)=0")}；两个列向量不再独立。`,
        },
        {
          value: "d",
          text: `S 是否可逆只能在真正求出 ${inline("S^{-1}")} 后判断。`,
        },
      ],
      explain: `
        <p>两列向量已经共线，因此平面会坍缩到一条线：</p>
        <div class="challenge-proof-math">${display("\\det(S)=1\\cdot4-2\\cdot2=0,\\qquad \\begin{pmatrix}2\\\\4\\end{pmatrix}=2\\begin{pmatrix}1\\\\2\\end{pmatrix}")}</div>
        <p>不同输入可能得到同一个输出，不能唯一倒推，所以 S 没有逆矩阵。</p>
      `,
    },
    "block-matrices": {
      title: "定位一个输出块",
      prompt: `设 ${inline("C=AB")} 是 2×2 分块乘积。${inline("C_{12}")} 应该怎样计算？`,
      choices: [
        {
          value: "a",
          text: `${inline("C_{12}=A_{11}B_{11}+A_{12}B_{21}")}。`,
        },
        {
          value: "b",
          correct: true,
          text: `${inline("C_{12}=A_{11}B_{12}+A_{12}B_{22}")}。`,
        },
        {
          value: "c",
          text: `${inline("C_{12}=A_{21}B_{12}+A_{22}B_{22}")}。`,
        },
        {
          value: "d",
          text: `${inline("C_{12}=A_{12}B_{12}")}。`,
        },
      ],
      explain: `
        <p>先锁定输出位置 ${inline("(1,2)")}：取 A 的第一块行，再取 B 的第二块列。</p>
        <div class="challenge-proof-math">${display("(A_{11},A_{12})\\begin{pmatrix}B_{12}\\\\B_{22}\\end{pmatrix}=A_{11}B_{12}+A_{12}B_{22}")}</div>
        <p>块乘法仍然是行乘列，只是“元素”换成了尺寸匹配的小矩阵。</p>
      `,
    },
    "elementary-matrices": {
      title: "由行操作构造初等矩阵",
      prompt: `对任意 2 阶矩阵 A 执行 ${inline("R_2\\leftarrow R_2-3R_1")}。对应的初等矩阵 E 是哪一个？`,
      choices: [
        {
          value: "a",
          text: `${inline("E=\\begin{pmatrix}1&-3\\\\0&1\\end{pmatrix}")}。`,
        },
        {
          value: "b",
          correct: true,
          text: `${inline("E=\\begin{pmatrix}1&0\\\\-3&1\\end{pmatrix}")}。`,
        },
        {
          value: "c",
          text: `${inline("E=\\begin{pmatrix}1&0\\\\3&1\\end{pmatrix}")}。`,
        },
        {
          value: "d",
          text: `${inline("E=\\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}")}。`,
        },
      ],
      explain: `
        <p>对单位矩阵做同一个行操作：</p>
        <div class="challenge-proof-math">${display("\\begin{pmatrix}1&0\\\\0&1\\end{pmatrix}\\xrightarrow{\\;R_2\\leftarrow R_2-3R_1\\;}\\begin{pmatrix}1&0\\\\-3&1\\end{pmatrix}=E")}</div>
        <p>左乘 E 时，第二行会取 ${inline("-3R_1+R_2")}，所以 ${inline("EA")} 正是行变换后的 A。</p>
      `,
    },
    "block-elementary-applications": {
      title: "由块行操作构造 E",
      prompt: `对分块单位矩阵执行 ${inline("R_2\\leftarrow R_2-CR_1")}。得到的分块初等矩阵是哪一个？`,
      choices: [
        {
          value: "a",
          text: `${inline("E=\\begin{pmatrix}I&-C\\\\0&I\\end{pmatrix}")}。`,
        },
        {
          value: "b",
          correct: true,
          text: `${inline("E=\\begin{pmatrix}I&0\\\\-C&I\\end{pmatrix}")}。`,
        },
        {
          value: "c",
          text: `${inline("E=\\begin{pmatrix}I&0\\\\C&I\\end{pmatrix}")}。`,
        },
        {
          value: "d",
          text: `${inline("E=\\begin{pmatrix}0&I\\\\I&0\\end{pmatrix}")}。`,
        },
      ],
      explain: `
        <p>和普通初等矩阵一样：把同一条块行规则作用到分块单位矩阵上。</p>
        <div class="challenge-proof-math">${display("\\begin{pmatrix}I&0\\\\0&I\\end{pmatrix}\\xrightarrow{\\;R_2\\leftarrow R_2-CR_1\\;}\\begin{pmatrix}I&0\\\\-C&I\\end{pmatrix}=E")}</div>
        <p>再左乘它，就能把 ${inline("\\begin{pmatrix}I&0\\\\C&I\\end{pmatrix}")} 的左下块消成 0。</p>
      `,
    },
  };

  function mascotMarkup(state) {
    const particles = Array.from({ length: 8 }, () => '<span class="challenge-particle" aria-hidden="true"></span>').join("");
    return `
      <div class="challenge-mascot${state === "correct" ? " is-burst" : ""}" aria-hidden="true">
        <span class="challenge-pi">π</span>
        <span class="challenge-particles">${particles}</span>
      </div>`;
  }

  function renderChallenge(sectionId, challenge) {
    const fieldName = `${sectionId}-example-choice`;
    return `
      <h2>代表例题</h2>
      <div class="example-challenge" data-example-challenge="${sectionId}" data-state="idle">
        <div class="example-challenge-head">
          <span class="example-label">例题 · 先作答再看解释</span>
          <h3>${challenge.title}</h3>
        </div>
        <p class="example-challenge-question">${challenge.prompt}</p>
        <fieldset class="example-choice-list" aria-label="${challenge.title}">
          <legend class="sr-only">请选择一个选项</legend>
          ${challenge.choices
            .map(
              (choice, index) => `
                <label class="example-choice" data-choice="${choice.value}">
                  <input type="radio" name="${fieldName}" value="${choice.value}" />
                  <span class="example-choice-marker" aria-hidden="true">${String.fromCharCode(65 + index)}</span>
                  <span class="example-choice-copy">${choice.text}</span>
                </label>`,
            )
            .join("")}
        </fieldset>
        <div class="example-challenge-actions">
          <button type="button" class="button primary example-check" data-example-action="check">检查</button>
          <div class="example-feedback" data-example-feedback aria-live="polite"></div>
        </div>
        <div class="example-explanation" data-example-explanation hidden>
          <div class="example-explanation-title">${mascotMarkup("correct")}<div><span>答对了</span><strong>把选择重新翻译回结构</strong></div></div>
          <div class="example-explanation-body">${challenge.explain}</div>
        </div>
      </div>
    `;
  }

  function setChoicesDisabled(root, disabled) {
    root.querySelectorAll('input[type="radio"]').forEach((input) => {
      input.disabled = disabled;
    });
  }

  function resetChallenge(root) {
    root.dataset.state = "idle";
    root.classList.remove("is-correct", "is-wrong");
    root.querySelectorAll('input[type="radio"]').forEach((input) => {
      input.checked = false;
      input.disabled = false;
    });
    root.querySelectorAll(".example-choice").forEach((choice) => choice.classList.remove("is-correct"));
    const button = root.querySelector("[data-example-action]");
    if (button) {
      button.textContent = "检查";
      button.classList.remove("is-shaking");
    }
    const feedback = root.querySelector("[data-example-feedback]");
    if (feedback) feedback.innerHTML = "";
    const explanation = root.querySelector("[data-example-explanation]");
    if (explanation) explanation.hidden = true;
  }

  function triggerParticleBurst(root) {
    const mascot = root.querySelector(".example-explanation .challenge-mascot");
    if (!mascot) return;
    mascot.classList.remove("is-burst");
    void mascot.offsetWidth;
    mascot.classList.add("is-burst");
  }

  function bindChallenge(root, challenge) {
    const button = root.querySelector("[data-example-action]");
    const feedback = root.querySelector("[data-example-feedback]");
    const explanation = root.querySelector("[data-example-explanation]");
    if (!button || !feedback || !explanation) return;

    button.addEventListener("click", () => {
      const currentState = root.dataset.state;
      if (currentState === "wrong" || currentState === "correct") {
        resetChallenge(root);
        return;
      }

      const selected = root.querySelector('input[type="radio"]:checked');
      if (!selected) {
        feedback.innerHTML = '<span class="example-feedback-copy">先选择一个选项，再检查。</span>';
        return;
      }

      const choice = challenge.choices.find((item) => item.value === selected.value);
      if (choice?.correct) {
        root.dataset.state = "correct";
        root.classList.remove("is-wrong");
        root.classList.add("is-correct");
        setChoicesDisabled(root, true);
        selected.closest(".example-choice")?.classList.add("is-correct");
        button.textContent = "重做";
        feedback.innerHTML = `${mascotMarkup("correct")}<div class="example-feedback-copy"><strong>答对了</strong><span>现在展开这一步的结构解释。</span></div>`;
        explanation.hidden = false;
        triggerParticleBurst(root);
        return;
      }

      root.dataset.state = "wrong";
      root.classList.remove("is-correct");
      root.classList.add("is-wrong");
      setChoicesDisabled(root, true);
      button.textContent = "再试一次";
      button.classList.remove("is-shaking");
      void button.offsetWidth;
      button.classList.add("is-shaking");
      button.addEventListener("animationend", () => button.classList.remove("is-shaking"), { once: true });
      feedback.innerHTML = `${mascotMarkup("wrong")}<div class="example-feedback-copy"><strong>还差一点</strong><span>保留这次选择，点击“再试一次”后重新判断。</span></div>`;
    });
  }

  function mountExampleChallenges() {
    Object.entries(challenges).forEach(([sectionId, challenge]) => {
      const section = document.querySelector(`#${sectionId}-example`);
      if (!section || section.dataset.interactiveExampleReady === "true") return;
      section.innerHTML = renderChallenge(sectionId, challenge);
      bindChallenge(section.querySelector("[data-example-challenge]"), challenge);
      section.dataset.interactiveExampleReady = "true";
    });
  }

  function start() {
    const main = document.querySelector("#mainContent");
    if (!main) return;
    const observer = new MutationObserver(() => window.requestAnimationFrame(mountExampleChallenges));
    observer.observe(main, { childList: true, subtree: true });
    mountExampleChallenges();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
