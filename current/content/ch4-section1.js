defineChapter4Section("matrix-language", {
  number: "§1",
  textbookSection: "矩阵概念的一些背景",
  title: "矩阵概念的一些背景",
  navTitle: "矩阵概念背景",
  question: "一组数字为什么要保留行列位置？矩阵怎样把数据、方程和方向关系写进同一种语言？",
  goal:
    "读懂矩阵的尺寸、下标、行列与相等；会把矩阵按列阅读，并用列的线性组合解释一次矩阵—向量作用。",
  tags: ["行列位置", "矩阵尺寸", "按列阅读", "列组合"],
  intro:
    "矩阵同时保存数字和位置。位置给每个数字分配了角色：在数据表中可以是某个变量，在方程组中可以是某个未知量的系数，在坐标作用中可以属于某个基本输入方向。读矩阵的第一步始终是先确认尺寸和下标，再追问行与列分别组织了什么。",
  concepts: [
    {
      label: "矩阵与尺寸",
      text: `${texInline("A=(a_{ij})_{m\\times n}")} 有 m 行、n 列；尺寸 ${texInline("m\\times n")} 是矩阵身份的一部分。`,
    },
    {
      label: "元素下标",
      text: `${texInline("a_{ij}")} 位于第 i 行、第 j 列；第一个下标定位行，第二个下标定位列。`,
    },
    {
      label: "矩阵相等",
      text: `只有尺寸相同且每个对应位置都满足 ${texInline("a_{ij}=b_{ij}")} 时，两个矩阵才相等。`,
    },
    {
      label: "行与列",
      text: "一行汇集同一个输出坐标如何读取全部输入；一列汇集一个输入坐标对全部输出的贡献。",
    },
    {
      label: "按列写矩阵",
      text: `${texInline("A=[a_1\\ \\cdots\\ a_n]")} 把矩阵看成 n 个列向量并排组成的对象。`,
    },
    {
      label: "列组合",
      text: `若 ${texInline("x=(x_1,\\ldots,x_n)^T")}，则 ${texInline("Ax=x_1a_1+\\cdots+x_na_n")}；输入坐标就是组合各列的权重。`,
    },
    {
      label: "标准输入",
      text: `${texInline("Ae_j=a_j")}；把第 j 个标准坐标送入 A，会直接读出 A 的第 j 列。`,
    },
  ],
  textbook: {
    reference: "Strang · Lay · Hoffman–Kunze · Friedberg · Axler",
    page: "Strang §1.3；Lay §1.8；Hoffman–Kunze §1.3；Friedberg §2.2；Axler §3.C",
    items: [
      "Strang：先把 Ax 读成 A 的列的线性组合，再回到逐坐标计算。",
      "Lay：同一个矩阵同时连接矩阵方程、向量方程和标量方程。",
      "Hoffman–Kunze：行列位置来自线性方程组中系数角色的稳定排列。",
      "Friedberg 与 Axler：矩阵的列记录基本输入的输出坐标，矩阵表示依赖所选坐标。",
    ],
  },
  visual: {
    type: "transform",
    title: "实验：先追踪两列，再观察整个网格",
    description:
      "调节二阶矩阵的四个元素，先看 Ae₁、Ae₂ 的端点，再观察任意网格点如何由这两列组合出来。",
    task:
      "选择单位、拉伸、剪切、镜像、共线和零矩阵，逐次回答：两列在哪里？它们能生成平面、直线还是一个点？",
    prompts: [
      "从单位矩阵开始，确认第一列和第二列分别等于 e₁、e₂。",
      "只改变第二列，观察与 e₂ 平行的输入网格线怎样随之移动。",
      "选择共线矩阵，找出两个不同输入却落到同一输出的例子。",
      "回到任意矩阵，用 xAe₁+yAe₂ 预测一个网格点的去向，再用画面核对。",
    ],
  },
  example: {
    title: "例题：从尺寸与列同时读一个长方形矩阵",
    question: `设 ${texInline("A=\\begin{bmatrix}1&2\\\\0&1\\\\1&-1\\end{bmatrix}")}，${texInline("x=\\begin{bmatrix}2\\\\-1\\end{bmatrix}")}。A 接收几维输入、产生几维输出？并用列组合求 ${texInline("Ax")}。`,
    choices: [
      {
        correct: true,
        text: `A 接收 2 维输入并产生 3 维输出；${texInline("Ax=2a_1-a_2=(0,-1,3)^T")}。`,
      },
      {
        text: `A 接收 3 维输入并产生 2 维输出；${texInline("Ax=(0,-1)^T")}。`,
      },
      {
        text: `A 的两列分别乘 2 与 1，所以 ${texInline("Ax=2a_1+a_2=(4,1,1)^T")}。`,
      },
      {
        text: `长方形矩阵不能与向量相乘，只有方阵才有输入与输出。`,
      },
    ],
    steps: [
      `A 有 3 行、2 列，所以 ${texInline("A:\\mathbb{R}^2\\to\\mathbb{R}^3")}：输入有 2 个坐标，输出有 3 个坐标。`,
      `把 A 写成 ${texInline("A=[a_1\\ a_2]")}，其中 ${texInline("a_1=(1,0,1)^T")}，${texInline("a_2=(2,1,-1)^T")}。`,
      `输入 ${texInline("x=(2,-1)^T")} 给两列的权重分别是 2 与 −1。`,
      `因此 ${texInline("Ax=2a_1-a_2=2(1,0,1)^T-(2,1,-1)^T=(0,-1,3)^T")}。`,
      "逐行点积会得到同一个输出；按列计算先说明每个输入坐标贡献了哪一个方向。",
    ],
    audit: {
      matrix: [[1, 2], [0, 1], [1, -1]],
      vector: [2, -1],
      product: [0, -1, 3],
    },
  },
  quiz: [
    {
      question: `一个 ${texInline("4\\times3")} 矩阵有多少行、多少列？`,
      answer: "4 行、3 列。第一个数字表示行数，第二个数字表示列数。",
    },
    {
      question: `${texInline("a_{23}")} 与 ${texInline("a_{32}")} 可以互换吗？`,
      answer: "不能。它们分别位于第 2 行第 3 列和第 3 行第 2 列，承担不同位置的角色。",
    },
    {
      question: "两个矩阵含有完全相同的一组数字，它们一定相等吗？",
      answer: "不一定。还要检查尺寸以及每个数字所在的对应位置。",
    },
    {
      question: `若 ${texInline("A=[a_1\\ a_2\\ a_3]")}，那么 ${texInline("Ae_2")} 是什么？`,
      answer: `${texInline("Ae_2=a_2")}，也就是 A 的第二列。`,
    },
    {
      question: `${texInline("m\\times n")} 矩阵与列向量相乘时，输入和输出分别有几个坐标？`,
      answer: "输入有 n 个坐标，输出有 m 个坐标。",
    },
    {
      question: "一个二阶矩阵的两列都非零，是否一定能生成整个平面？",
      answer: "不一定。两列可能共线，此时所有列组合仍只落在一条直线上。",
    },
  ],
  summary: [
    "矩阵保存数字及其行列位置；尺寸和下标共同决定每个元素的角色。",
    `${texInline("A=[a_1\\ \\cdots\\ a_n]")} 把矩阵组织成列向量。`,
    `${texInline("Ax=\\sum_jx_ja_j")} 说明输入坐标是各列的组合权重。`,
    "二维网格帮助看见列的作用；长方形矩阵提醒我们这套语言适用于不同输入、输出维数。",
    "下一节将从列组合出发，解释矩阵乘法为什么采用现在的规则。",
  ],
  exercises: [
    `写出一个一般的 ${texInline("2\\times3")} 矩阵，标出 ${texInline("a_{23}")}，并说明它接收和产生多少个坐标。`,
    `构造一个两列都非零但所有输出都落在直线 ${texInline("y=2x")} 上的二阶矩阵。`,
    `对 ${texInline("A=[a_1\\ a_2\\ a_3]")} 和 ${texInline("x=(1,-2,3)^T")}，先写出列组合形式，再逐行核对。`,
  ],
});
