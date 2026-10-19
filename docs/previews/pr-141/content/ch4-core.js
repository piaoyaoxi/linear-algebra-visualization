// §3 and §4 have their own files (ch4-section3.js, ch4-section4.js).
defineChapter4Section("elementary-matrices", {
  number: "§6",
  textbookSection: "初等矩阵",
  title: "初等矩阵",
  navTitle: "初等矩阵",
  question: "为什么一次行变换等于左乘一个矩阵？又为什么同样的想法会让初等变换可逆？",
  goal: `把三类初等行变换与初等矩阵一一对应，理解“对单位矩阵做同样操作”如何构造初等矩阵 ${texInline("P")}，并看懂 ${texInline("PA")} 为什么正是对 ${texInline("A")} 做行变换。`,
  tags: ["初等矩阵", "左乘", "行变换"],
  intro: "把一次行变换作用到单位矩阵上，就得到对应的初等矩阵；左乘它，就是对任意矩阵做同一次行变换。放到平面上看，三类初等矩阵分别是反射、伸缩和剪切。",
  concepts: [
    { label: "换行", text: "交换两行；对应的初等矩阵来自把单位矩阵的相同两行交换。" },
    { label: "倍乘", text: "某一行乘非零常数；反向操作是乘以倒数，所以仍然可逆。" },
    { label: "倍加", text: "一行加上另一行的倍数；反向操作是加上相反数倍，因此也可逆。" },
    { label: "左乘与右乘", text: "左乘初等矩阵作用于行；右乘初等矩阵作用于列。" },
  ],
  textbook: { reference: "北大版《高等代数》第四章", page: "", items: ["三类初等行变换", "由单位矩阵构造初等矩阵", "左乘对应行变换", "初等矩阵的逆"] },
  interactive: { type: "slot", label: "逐步演示", title: "实验：同一行变换如何同时作用于 E 和 A", description: "按步骤看 R₂ ← R₂ − 3R₁：先作用于单位矩阵得到 P，再左乘到 A。" },
  example: {
    title: "例题：从一次行变换写出初等矩阵",
    question: `对任意 2 阶矩阵 ${texInline("A")} 执行 ${texInline("R_1\\leftarrow R_1+2R_2")}。写出对应初等矩阵 ${texInline("P")}，并说明为什么变换后的矩阵是 ${texInline("PA")}。`,
    choices: [
      { correct: true, text: `${texInline("P=\\begin{pmatrix}1&2\\\\0&1\\end{pmatrix}")}；它的第一行把 ${texInline("A")} 的第一行与第二行的 2 倍组合起来。` },
      { text: `${texInline("P=\\begin{pmatrix}1&0\\\\2&1\\end{pmatrix}")}；左乘时应把 2 放在第一列。` },
      { text: `${texInline("P=\\begin{pmatrix}1&-2\\\\0&1\\end{pmatrix}")}；加法行变换对应负号。` },
      { text: `${texInline("P=\\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}")}；所有初等行变换都由换行矩阵完成。` },
    ],
    steps: [
      `先对单位矩阵 ${texInline("E")} 做同样操作，得到 ${texInline("P(1,2(2))=\\begin{pmatrix}1&2\\\\0&1\\end{pmatrix}")}。`,
      `把 ${texInline("P(1,2(2))")} 左乘到 ${texInline("A")}：它的第一行 ${texInline("(1,2)")} 会把 ${texInline("A")} 的第一行加上 ${texInline("A")} 的第二行的 2 倍。`,
      `因此 ${texInline("P(1,2(2))A")} 恰好就是执行 ${texInline("R_1\\leftarrow R_1+2R_2")} 后的矩阵。反向操作 ${texInline("R_1\\leftarrow R_1-2R_2")} 给出 ${texInline("P(1,2(2))^{-1}=P(1,2(-2))")}。`,
    ],
  },
  quiz: [
    { question: `要构造 ${texInline("R_2\\leftarrow R_2-3R_1")} 对应的初等矩阵，最直接的做法是什么？`, answer: `把同一个行变换施加到单位矩阵 ${texInline("E")} 上，得到 ${texInline("\\begin{pmatrix}1&0\\\\-3&1\\end{pmatrix}")}。` },
    { question: "三类初等矩阵的行列式分别是多少？这和第二章的行列式性质有什么关系？", answer: `换行为 ${texInline("-1")}，倍乘 ${texInline("k")} 为 ${texInline("k")}，倍加为 1。它们正是“交换变号、倍乘乘 ${texInline("k")}、倍加不变”；几何上分别是反射、伸缩和剪切。` },
    { question: "为什么初等矩阵都可逆？", answer: "每一类初等行变换都有一个反向的初等行变换；对应的反向操作就是逆矩阵。" },
    { question: `左乘 ${texInline("P")} 和右乘 ${texInline("P")} 的主要区别是什么？`, answer: "左乘改变行，右乘改变列。原因是矩阵乘法时左侧因子用自己的行组合右侧矩阵的行。" },
  ],
  summary: [`一次初等行变换 = 对单位矩阵做同样操作得到 ${texInline("P")} = 左乘 ${texInline("P")}。`, "初等矩阵都可逆；可逆矩阵都是初等矩阵的乘积。", "左乘看行，右乘看列；对分块矩阵的块行、块列也是如此。"],
  exercises: [`写出 ${texInline("R_2\\leftarrow -2R_2")} 对应的 2 阶初等矩阵，并写出它的逆。`],
});
