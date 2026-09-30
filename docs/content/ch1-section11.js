defineChapter1Section("symmetric-polynomials", {
  number: "§11",
  textbookSection: "对称多项式",
  title: "对称多项式",
  navTitle: "对称多项式",
  question: "交换任意两个变量后保持不变的多项式有什么结构？",
  goal: "理解对称多项式与初等对称多项式；掌握对称多项式基本定理，会用初等对称多项式表示简单的对称多项式。",
  tags: ["对称多项式", "初等对称多项式", "根与系数"],
  intro: `若交换任意两个变量 ${texInline("x_i,x_j")}，${texInline("f(x_1,\\ldots,x_n)")} 都不变，就称 ${texInline("f")} 为对称多项式。最基本的是初等对称多项式 ${texInline("\\sigma_1,\\ldots,\\sigma_n")}。基本定理：每个对称多项式都能唯一地表示成 ${texInline("\\sigma_1,\\ldots,\\sigma_n")} 的多项式。`,
  textbook: {
    reference: "北大版《高等代数》第一章 §11",
    items: ["对称多项式", "初等对称多项式", "对称多项式基本定理"],
  },
  formal: {
    title: "初等对称多项式",
    equation: "\\sigma_k=\\sum_{1\\le i_1<\\cdots<i_k\\le n}x_{i_1}x_{i_2}\\cdots x_{i_k}",
    definitions: [
      {
        title: "判断对称",
        text: `要对所有交换都不变。${texInline("x^2y+y^2z+z^2x")} 在轮换 ${texInline("x\\to y\\to z\\to x")} 下不变，但交换 ${texInline("x,y")} 后变为 ${texInline("y^2x+x^2z+z^2y")}，所以它不是对称多项式。`,
      },
      {
        title: "基本定理的证法",
        text: `取 ${texInline("f")} 按字典序的首项 ${texInline("a\\,x_1^{l_1}\\cdots x_n^{l_n}")}，必有 ${texInline("l_1\\ge\\cdots\\ge l_n")}。减去 ${texInline("a\\,\\sigma_1^{l_1-l_2}\\sigma_2^{l_2-l_3}\\cdots\\sigma_n^{l_n}")}，首项变小；有限步后得到 0。`,
      },
      {
        title: "根与系数",
        text: `若 ${texInline("x^n+a_1x^{n-1}+\\cdots+a_n")} 的根为 ${texInline("\\alpha_1,\\ldots,\\alpha_n")}，则 ${texInline("a_k=(-1)^k\\sigma_k(\\alpha_1,\\ldots,\\alpha_n)")}。于是根的任何对称多项式都能用系数表示。`,
      },
    ],
    pitfalls: [
      "只检查轮换就断定对称，如上面的例子。",
      `用根与系数的关系时漏掉符号 ${texInline("(-1)^k")}。`,
    ],
    noteLabel: "下一章",
    note: "行列式。",
  },
  interactive: false,
  example: {
    title: "例题：用初等对称多项式表示",
    question: `三个变量时，用 ${texInline("\\sigma_1,\\sigma_2,\\sigma_3")} 表示 ${texInline("x^2+y^2+z^2")} 与 ${texInline("x^2y+x^2z+y^2x+y^2z+z^2x+z^2y")}。`,
    choices: [
      {
        correct: true,
        text: `${texInline("x^2+y^2+z^2=\\sigma_1^2-2\\sigma_2")}；六项之和为 ${texInline("\\sigma_1\\sigma_2-3\\sigma_3")}。`,
      },
      { text: `两式分别等于 ${texInline("\\sigma_1^2")} 与 ${texInline("\\sigma_1\\sigma_2")}。` },
      { text: `第一式等于 ${texInline("\\sigma_2")}，第二式等于 ${texInline("\\sigma_3")}。` },
      { text: "对称多项式不能用有限个初等对称多项式表示。" },
    ],
    steps: [
      `${texInline("\\sigma_1^2=(x+y+z)^2=x^2+y^2+z^2+2\\sigma_2")}，所以 ${texInline("x^2+y^2+z^2=\\sigma_1^2-2\\sigma_2")}。`,
      `展开 ${texInline("\\sigma_1\\sigma_2=(x+y+z)(xy+xz+yz)")}：六个 ${texInline("x^2y")} 型的项各出现一次。`,
      `${texInline("xyz")} 由 ${texInline("x\\cdot yz,\\ y\\cdot xz,\\ z\\cdot xy")} 出现 3 次，所以六项之和为 ${texInline("\\sigma_1\\sigma_2-3\\sigma_3")}。`,
    ],
  },
  quiz: [
    {
      question: `用 ${texInline("\\sigma_1,\\sigma_2,\\sigma_3")} 表示 ${texInline("x^3+y^3+z^3")}。`,
      answer: `${texInline("\\sigma_1^3-3\\sigma_1\\sigma_2+3\\sigma_3")}。`,
    },
    {
      question: `${texInline("\\alpha,\\beta,\\gamma")} 是 ${texInline("x^3-2x+5")} 的根，求 ${texInline("\\alpha^2+\\beta^2+\\gamma^2")}。`,
      answer: `${texInline("\\sigma_1=0,\\ \\sigma_2=-2")}，所以 ${texInline("\\sigma_1^2-2\\sigma_2=4")}。`,
    },
    {
      question: "基本定理证明中的消去过程为什么一定会结束？",
      answer: `每一步首项按字典序严格变小；而满足 ${texInline("l_1\\ge\\cdots\\ge l_n")} 且不超过原首项的指数组只有有限个。`,
    },
    {
      question: `四个变量时 ${texInline("\\sigma_2")} 有几项？`,
      answer: `${texInline("\\binom42=6")} 项。`,
    },
  ],
  summary: [
    "对称多项式在交换任意两个变量后不变；只在轮换下不变还不够。",
    "每个对称多项式都能唯一表示成初等对称多项式的多项式。",
    `根与系数的关系：${texInline("a_k=(-1)^k\\sigma_k(\\alpha_1,\\ldots,\\alpha_n)")}。`,
  ],
});
