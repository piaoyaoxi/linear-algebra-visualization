defineChapter4Section("matrix-language", {
  number: "§1",
  textbookSection: "矩阵概念的一些背景",
  title: "矩阵概念的一些背景",
  navTitle: "矩阵概念背景",
  question: "矩阵为什么会出现？一张有行有列的数字表，怎样同时记录数据、方程组和方向变化？",
  goal: "读懂矩阵的行、列、阶、元素与相等；理解矩阵尺寸和输入输出维数的关系；最后从两列读出二维变换对基本方向的作用。",
  tags: ["行列与阶", "位置结构", "输入输出", "先看列"],
  intro:
    "矩阵把一组彼此相关的数字连同它们的位置一起保存下来。行和列可以对应样本与变量、方程与未知量，也可以记录基本方向经过变换后的坐标。先读清结构，再解释这些数字来自哪里。",
  concepts: [
    {
      label: "行、列与阶",
      text: `${texInline("m\\times n")} 表示 ${texInline("m")} 行 ${texInline("n")} 列；行数和列数共同决定矩阵的形状。`,
    },
    {
      label: "元素位置",
      text: `${texInline("a_{ij}")} 表示第 ${texInline("i")} 行第 ${texInline("j")} 列的元素，下标先读行、再读列。`,
    },
    {
      label: "矩阵相等",
      text: "两个矩阵先要形状相同，再要求所有对应位置的元素分别相等。",
    },
    {
      label: "输入与输出",
      text: `${texInline("m\\times n")} 矩阵接收 ${texInline("n")} 个输入坐标，产生 ${texInline("m")} 个输出坐标。`,
    },
    {
      label: "列的含义",
      text: `把矩阵看成变换记录时，第 ${texInline("j")} 列就是 ${texInline("Ae_j")}，记录第 ${texInline("j")} 个标准基向量的去向。`,
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第四章",
    page: "",
    items: [
      "矩阵出现的背景与记录作用",
      "矩阵的行、列、阶与元素",
      "矩阵相等和基础矩阵类型",
      "矩阵尺寸与输入输出坐标数",
      "矩阵列向量的几何读取",
    ],
  },
  interactive: {
    type: "slot",
    title: "实验：同一张表，三种读法",
    description: "同一个 2×2 矩阵同时读作数据表、方程组的系数和两个方向 Ae₁、Ae₂。",
  },
  example: {
    title: "例题：从矩阵的两列读出平面变化",
    question: `设 ${texInline("A=\\begin{bmatrix}2&1\\\\0&1\\end{bmatrix}")}。不逐点代入，说明 ${texInline("A")} 对平面网格的大致作用，并判断它是否会把平面压扁。`,
    choices: [
      {
        correct: true,
        text: `第一列给出 ${texInline("Ae_1=(2,0)^T")}，第二列给出 ${texInline("Ae_2=(1,1)^T")}；网格横向拉伸并向右剪切，两列不共线，所以平面没有坍缩。`,
      },
      {
        text: `第一列给出 ${texInline("Ae_2=(2,0)^T")}，第二列给出 ${texInline("Ae_1=(1,1)^T")}；矩阵的列需要从右向左读取。`,
      },
      { text: "两列都含有非零元素，所以两个标准基向量都保持不变。" },
      { text: "必须把平面上每个点逐一代入，单看两列无法判断网格变化。" },
    ],
    steps: [
      `第一列是 ${texInline("Ae_1=(2,0)^T")}：水平方向仍沿 ${texInline("x")} 轴，但长度变为原来的 2 倍。`,
      `第二列是 ${texInline("Ae_2=(1,1)^T")}：竖直方向保留向上分量，同时向右偏移。`,
      `任意向量都由 ${texInline("e_1")}、${texInline("e_2")} 线性组合而成，所以两列的去向会带动整张网格。`,
      "两列不共线，仍能张成整个平面；因此这是横向拉伸与剪切的组合，不会把平面压扁。",
    ],
  },
  quiz: [
    {
      question: `${texInline("a_{23}")} 位于矩阵的哪个位置？`,
      answer: "第 2 行第 3 列。",
    },
    {
      question: "两个矩阵含有完全相同的一组数字，它们一定相等吗？",
      answer: "不一定。还要检查形状和每个数字所在的对应位置。",
    },
    {
      question: `${texInline("3\\times2")} 矩阵接收几维输入，产生几维输出？`,
      answer: "接收 2 维输入，产生 3 维输出。",
    },
    {
      question: "一个 2 阶矩阵的两列都非零，是否一定不会把平面压扁？",
      answer: "不一定。若两列共线，它们仍然只提供一个独立方向，网格会压到一条直线上。",
    },
  ],
  summary: [
    `矩阵同时保存数字和位置；${texInline("a_{ij}")} 的下标先读行、再读列。`,
    "矩阵可以来自数据、方程组和方向变化，但这些来源都依赖稳定的行列结构。",
    `${texInline("m\\times n")} 矩阵把 ${texInline("n")} 个输入坐标组织成 ${texInline("m")} 个输出坐标。`,
    "二维变换中，先读两列，就能抓住两个基本方向以及整张网格的去向。",
  ],
  exercises: [
    `写出一个一般的 ${texInline("2\\times3")} 矩阵，并指出 ${texInline("a_{23}")} 的位置。`,
    `构造一个两列都非零但会把平面压到直线上的 2 阶矩阵。`,
  ],
});
