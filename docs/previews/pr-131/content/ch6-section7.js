defineChapter6Section("direct-sum", {
  number: "§7",
  textbookSection: "子空间的直和",
  title: "子空间的直和",
  navTitle: "直和",
  question: "什么条件保证每个向量的分解既存在又唯一？",
  goal: "掌握直和的定义与等价条件；会判断多个子空间的和是否为直和；理解直和分解沿子空间的方向进行，与是否垂直无关。",
  tags: ["直和", "补子空间", "分解唯一"],
  intro:
    `${texInline(String.raw`V=U\oplus W`)} 表示每个向量都能唯一地写成 ${texInline(String.raw`u+w`)}。唯一性只需检查零向量，存在性要求 ${texInline(String.raw`U+W`)} 铺满 ${texInline(String.raw`V`)}。在 ${texInline(String.raw`\mathbb R^3`)} 中，一条斜线和一个平面就给出这样的分解，分解的方向沿着那条直线。`,
  concepts: [
    { label: "直和", text: `和中每个向量的分解式唯一，记作 ${texInline("V_1\\oplus V_2")}。` },
    { label: "补子空间", text: `满足 ${texInline("V=U\\oplus W")} 的子空间 ${texInline("W")}。` },
  ],
  textbook: { reference: "北大版《高等代数》第六章 §7", items: ["直和的定义", "直和的等价条件", "补子空间", "多个子空间的直和"] },
  interactive: { type: "slot", title: "分解什么时候唯一" },
  lesson: {
    figure: "even-odd",
    figureLast: true,
    blocks: [
      {
        title: "直和与它的等价条件",
        tex: String.raw`V_1+V_2\ \text{是直和}\iff V_1\cap V_2=\{0\}\iff\dim(V_1+V_2)=\dim V_1+\dim V_2`,
        text: `和 ${texInline("V_1+V_2")} 中每个向量的分解式 ${texInline("\\alpha=\\alpha_1+\\alpha_2")} 都唯一时，称为直和，记作 ${texInline("V_1\\oplus V_2")}。只要零向量的分解唯一（${texInline("0=0+0")}），所有向量的分解就都唯一。`,
      },
      {
        title: "补子空间",
        text: `有限维空间 ${texInline("V")} 的每个子空间 ${texInline("U")} 都有补子空间 ${texInline("W")}，使 ${texInline("V=U\\oplus W")}：把 ${texInline("U")} 的基扩充为 ${texInline("V")} 的基，新添的向量生成 ${texInline("W")}。补子空间不唯一，${texInline("\\mathbb R^3")} 中水平面的补可以是任何一条不在平面里的过原点直线。`,
      },
      {
        title: "多个子空间的直和",
        tex: String.raw`W_i\cap\sum_{j\ne i}W_j=\{0\}\ (i=1,\dots,s)\iff\dim\sum_i W_i=\sum_i\dim W_i`,
        text: `两两交为零不够：同一平面内三条过原点的直线两两只交于原点，但 ${texInline("1+1+1")} 大于平面的维数 2，它们的和不是直和。`,
      },
    ],
    pitfalls: [
      "以为直和的两部分必须互相垂直。直和只涉及加法和维数。",
      `${texInline("U\\cap W=\\{0\\}")} 只保证分解唯一，不保证每个向量都能分解：${texInline("\\mathbb R^3")} 中两条直线交为零，和只是一个平面。`,
      "把两个子空间的判别法“交为零”直接搬到多个子空间。",
    ],
  },
  example: {
    title: "例题：对称部分与反对称部分",
    question: `证明 ${texInline("\\mathbb R^{n\\times n}")} 是对称矩阵子空间与反对称矩阵子空间的直和，并分解 ${texInline("A=\\begin{pmatrix}1&2\\\\0&3\\end{pmatrix}")}。`,
    choices: [
      { text: `${texInline("A=\\begin{pmatrix}1&0\\\\0&3\\end{pmatrix}+\\begin{pmatrix}0&2\\\\0&0\\end{pmatrix}")}` },
      { text: `${texInline("A=\\begin{pmatrix}1&2\\\\2&3\\end{pmatrix}+\\begin{pmatrix}0&0\\\\-2&0\\end{pmatrix}")}` },
      { correct: true, text: `${texInline("A=\\begin{pmatrix}1&1\\\\1&3\\end{pmatrix}+\\begin{pmatrix}0&1\\\\-1&0\\end{pmatrix}")}` },
      { text: "分解不唯一，对角线上的数可以任意分给两部分" },
    ],
    steps: [
      `存在：${texInline("A=\\frac{A+A^T}2+\\frac{A-A^T}2")}，前者对称，后者反对称。`,
      `唯一：若 ${texInline("B")} 既对称又反对称，则 ${texInline("B=B^T=-B")}，${texInline("B=O")}，两个子空间的交为零。`,
      `维数核对：${texInline("\\frac{n(n+1)}2+\\frac{n(n-1)}2=n^2")}。`,
      `代入：${texInline("\\frac{A+A^T}2=\\begin{pmatrix}1&1\\\\1&3\\end{pmatrix}")}，${texInline("\\frac{A-A^T}2=\\begin{pmatrix}0&1\\\\-1&0\\end{pmatrix}")}。另外两种拆法的第二项 ${texInline("\\begin{pmatrix}0&2\\\\0&0\\end{pmatrix}")}、${texInline("\\begin{pmatrix}0&0\\\\-2&0\\end{pmatrix}")} 都不是反对称矩阵。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("\\mathbb R^2")} 中 ${texInline("x")} 轴的补子空间唯一吗？`,
      answer: `不唯一，任何一条过原点、不同于 ${texInline("x")} 轴的直线都是。`,
    },
    {
      question: "三个子空间两两交为零，能推出它们的和是直和吗？",
      answer: `不能。实验的第二种模式里，同一平面内的三条直线满足 ${texInline("w_1+w_2-w_3=0")}，零向量有非零的分解。`,
    },
    {
      question: `${texInline("U\\cap W=\\{0\\}")} 能推出 ${texInline("U+W=V")} 吗？`,
      answer: `不能，只能推出 ${texInline("U+W")} 是直和。${texInline("\\mathbb R^3")} 中两条不同直线的和只是一个平面。`,
    },
    {
      question: `${texInline("V=U\\oplus W")}，${texInline("\\dim V=5")}，${texInline("\\dim U=2")}。${texInline("W")} 的维数是多少？`,
      answer: "3：直和的维数等于各部分维数之和。",
    },
  ],
  summary: [
    `直和 ${texInline("\\Leftrightarrow")} 零向量分解唯一 ${texInline("\\Leftrightarrow")} 交为零 ${texInline("\\Leftrightarrow")} 维数相加。`,
    "直和分解沿子空间的方向进行，与垂直无关；补子空间不唯一。",
    "多个子空间要检查每一个与其余之和的交。",
  ],
});
