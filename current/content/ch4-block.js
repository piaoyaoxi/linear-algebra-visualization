defineChapter4Section("block-matrices", {
  number: "§5",
  textbookSection: "矩阵的分块",
  title: "矩阵的分块",
  navTitle: "矩阵的分块",
  question: "为什么把大矩阵按有意义的行列切开后，计算和结构都会更清楚？",
  goal: "理解分块要来自有意义的行列分组：块的尺寸必须匹配；块乘法仍然是行乘列；块对角结构表示彼此独立的子系统。",
  tags: ["分块", "块乘法", "块对角"],
  intro: "分块矩阵把一个大矩阵按结构重新组织。正确的切法会把问题里的子系统、输入输出分组或反复出现的结构显露出来；之后每一块就像一个“较大的元素”那样参与运算。",
  concepts: [
    { label: "分块的前提", text: "行和列必须按一致的尺寸切分；只有尺寸匹配的块才能参与同一种运算。" },
    { label: "块乘法", text: "输出块 Cᵢⱼ 仍然来自 A 的第 i 个块行和 B 的第 j 个块列的配对。" },
    { label: "块对角", text: "非对角块为零时，两个子系统不互相耦合，可以分别计算。" },
    { label: "结构优先", text: "分块的价值是先看见关系，再让计算顺着结构展开。" },
  ],
  textbook: { reference: "北大版《高等代数》第四章", page: "", items: ["矩阵的分块", "分块加法与数乘", "分块乘法", "块对角矩阵"] },
  interactive: {
    type: "block",
    title: "图示：把大矩阵看成小系统",
    description: "分块让输入、输出和子结构更清楚。",
    prompts: ["把一个大矩阵切成四块，并标出每块的输入输出含义。", "演示块乘法时，只高亮真正发生配对的块。", "用块对角矩阵展示两个子系统互不干扰的情况。"],
  },
  example: {
    title: "例题：从块行和块列读出一个输出块",
    question: `设 ${texInline("A=\\begin{pmatrix}A_{11}&A_{12}\\\\A_{21}&A_{22}\\end{pmatrix}")}，${texInline("B=\\begin{pmatrix}B_{11}&B_{12}\\\\B_{21}&B_{22}\\end{pmatrix}")}。写出 ${texInline("AB")} 的右上块，并说明它为什么只用到 A 的第一块行和 B 的第二块列。`,
    steps: [
      `右上块的位置是 ${texInline("(1,2")}，所以先取 A 的第一块行 ${texInline("(A_{11},A_{12})")}。`,
      `再取 B 的第二块列 ${texInline("(B_{12},B_{22})^T")}。`,
      `像普通矩阵的行乘列一样配对，得到 ${texInline("(AB)_{12}=A_{11}B_{12}+A_{12}B_{22}")}。`,
    ],
  },
  quiz: [
    { question: "为什么分块时不能只看图形上切得整不整齐？", answer: "因为块要参与加法或乘法，行列分组必须和各块的尺寸兼容；否则相应的块乘积没有定义。" },
    { question: `在 ${texInline("C=AB")} 的块乘法里，${texInline("C_{21}")} 由哪一行块和哪一列块配对？`, answer: "由 A 的第二块行和 B 的第一块列配对。" },
    { question: "块对角矩阵为什么可以分别处理不同块？", answer: "因为非对角块为零，一个块的输入不会流向另一个块的输出，子系统之间没有耦合。" },
  ],
  summary: ["分块要先保证尺寸与行列分组匹配。", "块乘法没有改变本质：仍然是块行乘块列。", "块对角结构把互不影响的子系统直接写在矩阵形状里。"],
  exercises: [`设 ${texInline("C=AB")} 是 2×2 分块乘积，写出 ${texInline("C_{22}")} 的块行列公式。`],
});

defineChapter4Section("block-elementary-applications", {
  number: "§7",
  textbookSection: "分块乘法的初等变换及应用举例",
  title: "分块乘法的初等变换及应用举例",
  navTitle: "分块初等变换与应用",
  question: "怎样把 §6 的初等行变换推广到“整块行”，并用它更清楚地处理耦合方程组？",
  goal: "把一次块行变换写成左乘一个分块初等矩阵；通过消去左下块，理解分块消元怎样帮助求解一个耦合系统。",
  tags: ["分块初等变换", "块消元", "耦合系统"],
  intro: "§6 里的一行可以加上另一行的倍数；到了这里，一整块行也可以加上另一块行左乘某个合适矩阵的结果。规则没有变，只是“倍数”升级成了尺寸匹配的矩阵块。",
  concepts: [
    { label: "块行操作", text: "例如 R₂ ← R₂ − C R₁；其中 C 的尺寸必须刚好能把第一块行变成第二块行的尺寸。" },
    { label: "块初等矩阵", text: "把同样操作施加到分块单位矩阵，就得到对应的分块初等矩阵 E。" },
    { label: "左乘仍改行", text: "左乘 E 时，E 的块行会组合原矩阵的块行，因此它实现的仍是行操作。" },
    { label: "应用", text: "块消元让耦合系统变成块上三角或块对角结构，从而可以按块回代。" },
  ],
  textbook: { reference: "北大版《高等代数》第四章", page: "", items: ["分块乘法中的初等变换", "块行操作的尺寸条件", "块消元", "应用举例"] },
  interactive: { type: "slot", label: "块消元逐步演示", title: "实验：把普通行变换升级成块行变换", description: "按步骤看块行操作如何消去耦合项，并把系统改写成更容易求解的结构。" },
  example: {
    title: "例题：用块行操作解一个耦合系统",
    question: `设 ${texInline("x=f")}，${texInline("Cx+y=g")}。把它写成分块方程组后，用一次块行操作消去左下块，并写出 x、y。`,
    steps: [
      `写成 ${texInline("\\begin{pmatrix}I&0\\\\C&I\\end{pmatrix}\\begin{pmatrix}x\\\\y\\end{pmatrix}=\\begin{pmatrix}f\\\\g\\end{pmatrix}")}。`,
      `对第二块行执行 ${texInline("R_2\\leftarrow R_2-CR_1")}，左下块 C 被消去，右侧变为 ${texInline("g-Cf")}。`,
      `得到 ${texInline("x=f")}，${texInline("y=g-Cf")}。这里没有神秘公式，只是把普通消元的“倍数”替换成了矩阵块 C。`,
    ],
  },
  quiz: [
    { question: `块行操作 ${texInline("R_2\\leftarrow R_2-CR_1")} 里，为什么 C 不能随便选尺寸？`, answer: "因为 CR₁ 必须和 R₂ 具有相同的列结构，才能相减；尺寸匹配是块操作合法的条件。" },
    { question: "分块初等矩阵如何构造？", answer: "和普通初等矩阵完全一样：对分块单位矩阵做同一个块行操作。" },
    { question: "块消元后为什么更容易解系统？", answer: "因为耦合块被消去后，系统变成块上三角或块对角形式，可以先解上面的块，再按块回代。" },
  ],
  summary: ["分块初等变换是普通行变换在块层面的延伸。", "左乘分块初等矩阵仍然改变块行。", "块消元的目的，是把耦合结构改写成可以按块求解的结构。"],
  exercises: [`验证 ${texInline("\\begin{pmatrix}I&0\\\\-C&I\\end{pmatrix}\\begin{pmatrix}I&0\\\\C&I\\end{pmatrix}=\\begin{pmatrix}I&0\\\\0&I\\end{pmatrix}")}。`],
});
