defineChapter3Section("matrix-rank", {
  number: "§4",
  textbookSection: "矩阵的秩",
  title: "矩阵的秩",
  navTitle: "矩阵的秩",
  question: "行变换会改变列向量，为什么列秩却不变？行秩与列秩为什么总是相等？",
  goal: "理解矩阵的行秩、列秩与最高阶非零子式；会用初等行变换求秩，并从原矩阵中选出一组线性无关的列。",
  tags: ["行秩", "列秩", "行空间", "列空间", "子式"],
  intro:
    "矩阵的行向量张成输入空间里的行空间，列向量张成输出空间里的列空间。这两个空间一般不是同一个，但维数永远相等，这个共同的维数就是矩阵的秩。",
  concepts: [
    { label: "秩", text: "行秩 = 列秩 = 最高阶非零子式的阶数。" },
    { label: "初等行变换", text: "不改变行空间，也不改变列之间的线性关系。" },
  ],
  textbook: { reference: "北大版《高等代数》第三章 §4", items: ["行秩与列秩", "矩阵的秩与子式", "用初等变换求秩"] },
  interactive: { type: "slot", title: "行变换：行空间不动，列空间在动，维数都不变" },
  lesson3d: {
    blocks: [
      {
        title: "行变换保持两样东西",
        text: `新行都是旧行的组合，逆变换又能倒回去，所以<strong>行空间不变</strong>，行秩不变。另一方面，${texInline("PA")}（${texInline("P")} 可逆）与 ${texInline("A")} 的齐次方程组同解：${texInline("c_1a_1+\\cdots+c_na_n=0")} 成立，当且仅当 ${texInline("c_1(Pa_1)+\\cdots+c_n(Pa_n)=0")} 成立。所以<strong>列之间的线性关系不变</strong>，列秩也不变。`,
      },
      {
        title: "在阶梯形上读出行秩 = 列秩",
        ponder: {
          q: "行空间和列空间可能是同一个平面吗？",
          a: `可能。${texInline("A")} 对称时，第 ${texInline("i")} 行就是第 ${texInline("i")} 列的转置，行空间与列空间在同一个 ${texInline("\\mathbb R^n")} 里重合；一般情况下两者不同，只是维数相同。`,
        },
        tex: String.raw`\operatorname{rank}A=\text{阶梯形中非零行的个数}=\text{主元列的个数}`,
        text: `阶梯形的非零行线性无关，主元列也线性无关，两者个数都等于主元个数 ${texInline("r")}。回到原矩阵：行秩 = 列秩 = ${texInline("r")}。<strong>${texInline("A")} 中</strong>与主元列同位置的列，就是 ${texInline("A")} 的列向量组的一个极大无关组。`,
      },
      {
        title: "用子式刻画秩",
        text: `${texInline("\\operatorname{rank}A=r")}，当且仅当 ${texInline("A")} 有一个 ${texInline("r")} 阶子式不为 0，而所有 ${texInline("r+1")} 阶子式都为 0。找非零 ${texInline("r")} 阶子式时，先在 ${texInline("A")} 的主元列里取 ${texInline("r")} 列，再从这 ${texInline("r")} 列中挑出 ${texInline("r")} 个线性无关的行；它们交叉处的子式不为 0。`,
      },
    ],
    pitfalls: [
      "数矩阵里非零元素的个数，或者在没化简的矩阵里数非零行。",
      "用阶梯形里的列作为原矩阵列空间的基。应该取原矩阵中同位置的列。",
      "以为行变换也不改变列空间。列空间会变，只有它的维数不变。",
    ],
  },
  example: {
    title: "例题：行空间与列空间是不是同一个平面",
    question: `${texInline(String.raw`A=\begin{bmatrix}1&2&3\\2&4&6\\0&1&1\end{bmatrix}`)}。求行空间与列空间的方程，它们是同一个平面吗？${texInline("\\operatorname{rank}A")} 是多少？`,
    choices: [
      { correct: true, text: `行空间是 ${texInline("z=x+y")}，列空间是 ${texInline("y=2x")}，不是同一个平面；两者都是 2 维，${texInline("\\operatorname{rank}A=2")}。` },
      { text: `两者是同一个平面 ${texInline("z=x+y")}，${texInline("\\operatorname{rank}A=2")}。` },
      { text: `第二行是第一行的 2 倍，所以 ${texInline("\\operatorname{rank}A=1")}。` },
      { text: `${texInline("A")} 是 ${texInline("3\\times3")} 矩阵，${texInline("\\operatorname{rank}A=3")}。` },
    ],
    steps: [
      `行：${texInline("r_2=2r_1")}，${texInline("r_1,r_3")} 不共线，都满足 ${texInline("z=x+y")}，所以行空间是平面 ${texInline("z=x+y")}。`,
      `列：${texInline("c_3=c_1+c_2")}，${texInline("c_1=(1,2,0)^T,\\ c_2=(2,4,1)^T")} 不共线，都满足 ${texInline("y=2x")}，所以列空间是平面 ${texInline("y=2x")}。`,
      `两个平面不同，但都是 2 维，所以 ${texInline("\\operatorname{rank}A=2")}。`,
      `非零的 2 阶子式：主元列是第 1、2 列，其中第 1、3 行线性无关，${texInline(String.raw`\begin{vmatrix}1&2\\0&1\end{vmatrix}=1`)}。第 1、2 行不行：${texInline(String.raw`\begin{vmatrix}1&2\\2&4\end{vmatrix}=0`)}。`,
    ],
  },
  quiz: [
    {
      question: `对上面的 ${texInline("A")} 做 ${texInline(String.raw`R_2\leftarrow R_2-2R_1`)}。列空间变了吗？维数呢？${texInline("c_3=c_1+c_2")} 还成立吗？`,
      answer: `列空间从 ${texInline("y=2x")} 变成 ${texInline("y=0")}，变了；维数仍是 2；关系 ${texInline("c_3=c_1+c_2")} 仍然成立。`,
    },
    {
      question: `${texInline("3\\times5")} 矩阵的秩最大是多少？${texInline("Ax=0")} 的解空间维数至少是多少？`,
      answer: `秩最大是 3；解空间维数至少是 ${texInline("5-3=2")}。`,
    },
    {
      question: `${texInline("u")}、${texInline("v")} 是非零列向量，${texInline("uv^T")} 的秩是多少？它的行空间和列空间分别是什么？`,
      answer: `秩为 1；列空间是 ${texInline("u")} 方向的直线，行空间是 ${texInline("v")} 方向的直线。`,
    },
  ],
  summary: [
    "初等行变换不改变行空间，也不改变列之间的线性关系。",
    "所以行秩 = 列秩，它等于阶梯形的主元个数，也等于最高阶非零子式的阶数。",
    `下一节用秩判断方程组 ${texInline("Ax=b")} 是否有解。`,
  ],
});
