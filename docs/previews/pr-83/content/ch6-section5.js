defineChapter6Section("subspaces", {
  number: "§5",
  textbookSection: "线性子空间",
  title: "线性子空间",
  navTitle: "线性子空间",
  question: "线性空间的子集什么时候自己也是线性空间？由几个向量生成的子空间有多大？",
  goal: "会用“非空且对加法、数乘封闭”判断子空间；理解生成子空间的维数等于向量组的秩；会把子空间的基扩充为整个空间的基。",
  tags: ["子空间", "生成子空间", "向量组的秩", "基的扩充"],
  intro:
    `子空间沿用原空间的加法和数乘，只需检查运算结果不离开这个子集。图中满足 ${texInline(String.raw`p(1)=0`)} 的曲线都过同一点，相加后仍过这一点；把条件改成 ${texInline(String.raw`p(1)=1`)}，两条曲线一相加就离开了集合。`,
  concepts: [
    { label: "子空间", text: "对原空间的加法与数乘封闭的非空子集。" },
    { label: "生成子空间", text: "L(α₁,…,αₛ)：α₁,…,αₛ 的全部线性组合。" },
  ],
  textbook: { reference: "北大版《高等代数》第六章 §5", items: ["子空间的判别", "齐次方程组的解空间", "生成子空间", "基的扩充定理"] },
  interactive: false,
  lesson: {
    figure: "curve-families",
    blocks: [
      {
        title: "子空间的判别",
        tex: String.raw`\alpha,\beta\in W,\ k,l\in P\ \Longrightarrow\ k\alpha+l\beta\in W`,
        text: `${texInline("V")} 的非空子集 ${texInline("W")} 对加法和数乘封闭，就是子空间：八条规律自动从 ${texInline("V")} 继承，零向量 ${texInline("0=0\\alpha")} 也在 ${texInline("W")} 中。齐次线性方程组的解集是 ${texInline("P^n")} 的子空间，维数为 ${texInline("n-r")}，基础解系就是它的一组基。`,
      },
      {
        title: "生成子空间",
        tex: String.raw`\dim L(\alpha_1,\dots,\alpha_s)=\operatorname{rank}\{\alpha_1,\dots,\alpha_s\}`,
        text: `${texInline("L(\\alpha_1,\\dots,\\alpha_s)")} 是包含 ${texInline("\\alpha_1,\\dots,\\alpha_s")} 的最小子空间，向量组的任一极大无关组都是它的基。两个向量组生成同一个子空间，当且仅当这两个向量组等价。`,
      },
      {
        title: "基的扩充",
        text: `${texInline("W")} 是 ${texInline("n")} 维空间 ${texInline("V")} 的 ${texInline("m")} 维子空间，${texInline("\\alpha_1,\\dots,\\alpha_m")} 是 ${texInline("W")} 的基，则总能再取 ${texInline("n-m")} 个向量，凑成 ${texInline("V")} 的基。例如图中 ${texInline("W_0")} 的基 ${texInline("x-1,(x-1)^2")} 添上 1，就是 ${texInline("P[x]_3")} 的基。`,
      },
    ],
    pitfalls: [
      `含零向量只是必要条件：第一象限含零且对加法封闭，但 ${texInline("(-1)(1,1)")} 跑到了第三象限。`,
      `非齐次方程组的解集、${texInline("\\{p:p(1)=1\\}")} 都不含零向量，不是子空间。`,
      `两个子空间的并一般不是子空间：${texInline("x")} 轴与 ${texInline("y")} 轴的并中，${texInline("(1,0)+(0,1)")} 不在其中。`,
    ],
  },
  example: {
    title: "例题：矩阵空间中的子空间",
    question: `在 ${texInline("\\mathbb R^{2\\times2}")} 中，下列子集哪些是子空间？① 对称矩阵；② 可逆矩阵；③ 迹为 0 的矩阵；④ 行列式为 0 的矩阵。`,
    choices: [
      { text: "①②③④ 都是" },
      { correct: true, text: "只有 ① 和 ③，它们的维数都是 3" },
      { text: "只有 ①③④" },
      { text: "只有 ②" },
    ],
    steps: [
      `①：对称矩阵的和与数乘仍对称。基 ${texInline("E_{11},E_{22},E_{12}+E_{21}")}，维数 3。`,
      `③：${texInline("\\operatorname{tr}(kA+lB)=k\\operatorname{tr}A+l\\operatorname{tr}B")}，迹为 0 的矩阵组合后迹仍为 0。基 ${texInline("E_{11}-E_{22},E_{12},E_{21}")}，维数 3。`,
      "②：零矩阵不可逆，可逆矩阵全体不含零向量。",
      `④：${texInline("\\operatorname{diag}(1,0)")} 与 ${texInline("\\operatorname{diag}(0,1)")} 的行列式都是 0，它们的和 ${texInline("E")} 的行列式是 1，对加法不封闭。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("\\{p\\in P[x]_4:p(1)=0\\}")} 的维数是多少？`,
      answer: `3。${texInline("P[x]_4")} 是次数小于 4 的多项式，维数 4；${texInline("x-1,(x-1)^2,(x-1)^3")} 是这个子空间的一组基。`,
    },
    {
      question: `${texInline("\\alpha_1,\\alpha_2")} 线性无关，${texInline("\\alpha_3=\\alpha_1+\\alpha_2")}。${texInline("L(\\alpha_1,\\alpha_2,\\alpha_3)")} 的维数是多少？`,
      answer: `2，等于向量组的秩；${texInline("L(\\alpha_1,\\alpha_2,\\alpha_3)=L(\\alpha_1,\\alpha_2)")}。`,
    },
    {
      question: `${texInline("\\mathbb R^4")} 中方程 ${texInline("x_1+x_2+x_3+x_4=0")} 的解空间维数是多少？`,
      answer: "3：未知量个数 4 减去系数矩阵的秩 1。",
    },
    {
      question: "第一象限 {(x,y): x≥0, y≥0} 含零向量、对加法封闭，为什么不是子空间？",
      answer: `对数乘不封闭：${texInline("(-1)(1,1)=(-1,-1)")} 不在其中。`,
    },
  ],
  summary: [
    "子空间 = 对加法、数乘封闭的非空子集。",
    `${texInline(String.raw`\dim L(\alpha_1,\dots,\alpha_s)`)} 等于向量组的秩，极大无关组是它的基。`,
    "子空间的基总能扩充为整个空间的基。",
  ],
});
