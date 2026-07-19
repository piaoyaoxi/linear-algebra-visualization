defineChapter5Section("quadratic-matrix", {
  number: "§1",
  textbookSection: "二次型及其矩阵表示",
  title: "二次型及其矩阵表示",
  navTitle: "矩阵表示",
  question: "一个含有许多平方项和交叉项的二次齐次多项式，怎样被一个对称矩阵完整记录？变量替换以后矩阵为什么变成 CᵀAC？",
  goal: "识别 n 元二次型；在多项式与实对称矩阵之间双向转换；理解交叉项系数的平分规则；掌握非退化替换 x=Cy 对应合同 CᵀAC。",
  tags: ["二次型", "对称矩阵", "合同", "xᵀAx"],
  intro:
    "二次型把“二次齐次多项式”与“实对称矩阵”绑成同一个对象。交叉项在矩阵乘法里会出现两次，所以非对角元要平分系数；变量替换 x=Cy 会在左右两侧各留下一个 C，从而得到合同矩阵 CᵀAC。",
  videoPlan: {
    title: "交叉项放进哪一格",
    duration: "约 30 秒自动动画",
    scenes: [
      "展示 f=2x₁²+6x₁x₂+5x₂² 与空 2×2 矩阵。",
      "交叉项 6 被平分到 a₁₂ 与 a₂₁。",
      "展开 xᵀAx 验证。",
    ],
  },
  concepts: [
    {
      label: "二次型",
      text: `n 元二次型是二次齐次多项式：${texInline("f(x)=\\sum_i a_{ii}x_i^2+2\\sum_{i<j}a_{ij}x_ix_j")}。`,
    },
    {
      label: "矩阵表示",
      text: `取实对称矩阵 ${texInline("A")}，则 ${texInline("f(x)=x^TAx")}。对角元对应平方项，非对角元各放交叉项系数的一半。`,
    },
    {
      label: "对称化",
      text: `任意方阵 ${texInline("B")} 可分解为对称部分与斜对称部分；斜对称部分对 ${texInline("x^TBx")} 的贡献恒为 0。`,
    },
    {
      label: "二次型的秩",
      text: "二次型的秩定义为对应对称矩阵的秩。",
    },
    {
      label: "合同",
      text: `若存在可逆矩阵 ${texInline("C")} 使 ${texInline("B=C^TAC")}，则称 ${texInline("A")} 与 ${texInline("B")} 合同；它对应非退化变量替换 ${texInline("x=Cy")}。`,
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第五章",
    page: "",
    items: [
      "二次型的定义与矩阵表示",
      "交叉项系数与对称位置",
      "非退化线性替换与合同矩阵",
      "合同保持对称性与秩",
    ],
  },
  interactive: {
    type: "slot",
    title: "实验：多项式—矩阵同步与合同桥",
    description: "调节平方项与交叉项，观察对称矩阵同步变化；再选择可逆替换，查看 CᵀAC。",
    task: "先让交叉项非零，确认两个对称位置同步；再切换到不可逆 C，观察合同状态被关闭。",
    prompts: [
      "从对角二次型开始，再打开交叉项。",
      "点击多项式项或矩阵格，核对对应关系。",
      "用可逆替换做合同，再用 det C=0 的反例对比。",
    ],
  },
  example: {
    title: "例题：从多项式写对称矩阵",
    question: `设 ${texInline("f=3x_1^2-4x_1x_2+5x_2^2+2x_1x_3+6x_3^2")}。写出对应的实对称矩阵，并用 ${texInline("x^TAx")} 展开验证交叉项位置。`,
    choices: [
      {
        correct: true,
        text: `${texInline("A=\\begin{bmatrix}3&-2&1\\\\-2&5&0\\\\1&0&6\\end{bmatrix}")}：平方项进对角，交叉项系数各取一半放入对称位置。`,
      },
      {
        text: `${texInline("A=\\begin{bmatrix}3&-4&2\\\\0&5&0\\\\0&0&6\\end{bmatrix}")}：交叉项全部放在上三角。`,
      },
      {
        text: `${texInline("A=\\begin{bmatrix}3&-4&2\\\\-4&5&0\\\\2&0&6\\end{bmatrix}")}：交叉项系数不除以 2，直接放入两边。`,
      },
      { text: "同一个二次型可以对应多个不同的实对称矩阵，任选一个即可。" },
    ],
    steps: [
      "平方项系数直接进入对角：a₁₁=3，a₂₂=5，a₃₃=6。",
      "交叉项 −4x₁x₂ 对应 2a₁₂，故 a₁₂=a₂₁=−2。",
      "交叉项 2x₁x₃ 对应 2a₁₃，故 a₁₃=a₃₁=1。",
      "没有 x₂x₃ 项，故 a₂₃=a₃₂=0。",
      "矩阵对称；用 xᵀAx 展开可还原原多项式。",
    ],
  },
  quiz: [
    {
      question: "二次型为什么要求对应矩阵取实对称矩阵？",
      answer: "因为任意矩阵的斜对称部分对 xᵀBx 无贡献；取对称矩阵可唯一记录二次型。",
    },
    {
      question: "多项式中 6x₁x₂ 在对称矩阵的 a₁₂、a₂₁ 处应填多少？",
      answer: "各填 3，因为展开时两个位置各贡献一次。",
    },
    {
      question: `变量替换 ${texInline("x=Cy")} 后，新矩阵是什么？`,
      answer: `${texInline("C^TAC")}，而不是 ${texInline("C^{-1}AC")}。`,
    },
    {
      question: "合同与相似的差别是什么？",
      answer: "合同是 CᵀAC，对应二次型的变量替换；相似是 P⁻¹AP，对应线性变换的基变换。",
    },
    {
      question: "当 det C=0 时，能否说 A 与 CᵀAC 合同？",
      answer: "不能。合同要求 C 可逆，即替换非退化。",
    },
    {
      question: "二次型的秩如何定义？",
      answer: "等于对应对称矩阵的秩。",
    },
  ],
  summary: [
    "二次型是二次齐次多项式，可用唯一的实对称矩阵写成 xᵀAx。",
    "交叉项系数平分到两个对称位置；斜对称部分对二次型无贡献。",
    "非退化替换 x=Cy 把矩阵变为 CᵀAC，这称为合同。",
    "合同保持对称性与秩；惯性与标准形留待后续小节。",
  ],
  exercises: [
    "任取一个非对称矩阵 B，计算其对称部分 S，并随机取几个 x 验证 xᵀBx=xᵀSx。",
    "给定可逆 C 与对称 A，手算 B=CᵀAC，并检查 B 仍对称。",
  ],
});
