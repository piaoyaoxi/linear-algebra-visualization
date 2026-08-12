defineChapter4Section("matrix-operations", {
  number: "§2",
  textbookSection: "矩阵的运算",
  title: "矩阵的运算",
  navTitle: "矩阵的运算",
  question: "矩阵乘法为什么采用行乘列？这条计算规则怎样从列组合和连续作用中自然出现？",
  goal:
    "掌握加法、数乘、转置与乘法；能在尺寸、列、元素和连续作用四种视角之间切换，并解释结合律与不交换性。",
  tags: ["逐项运算", "转置", "列定义乘法", "连续作用"],
  intro:
    "加法和数乘要求两个矩阵在同一位置上表达同类信息。矩阵乘法面对的是另一种任务：把 B 的每一列交给 A 继续处理，并把所得列重新排成一个矩阵。行乘列公式正是这一定义在单个元素上的展开。",
  videoPlan: {
    title: "从 A(Bx) 到 AB",
    duration: "约 2—3 分钟",
    scenes: [
      "把 B 的各列依次送入 A，得到 Ab₁,…,Abₚ。",
      "把这些输出列并排，定义 AB=[Ab₁ … Abₚ]。",
      "给定 x，比较 A(Bx) 与 (AB)x，确认两条路径重合。",
      "放大乘积的一个元素，把列定义展开成 A 的一行与 B 的一列的点积。",
      "同步播放 AB 与 BA，保留不同的中间状态。",
    ],
  },
  concepts: [
    {
      label: "同型加法",
      text: `若 A、B 都是 ${texInline("m\\times n")} 矩阵，则 ${texInline("(A+B)_{ij}=a_{ij}+b_{ij}")}。`,
    },
    {
      label: "数乘",
      text: `${texInline("(\\lambda A)_{ij}=\\lambda a_{ij}")}；同一个标量作用于矩阵的每个位置。`,
    },
    {
      label: "转置",
      text: `${texInline("(A^T)_{ij}=a_{ji}")}，所以 ${texInline("m\\times n")} 矩阵转置后成为 ${texInline("n\\times m")}。`,
    },
    {
      label: "乘法尺寸",
      text: `若 ${texInline("A\\in\\mathbb{R}^{m\\times n}")}、${texInline("B\\in\\mathbb{R}^{n\\times p}")}，则 ${texInline("AB\\in\\mathbb{R}^{m\\times p}")}。`,
    },
    {
      label: "列定义",
      text: `若 ${texInline("B=[b_1\\ \\cdots\\ b_p]")}，则 ${texInline("AB=[Ab_1\\ \\cdots\\ Ab_p]")}。`,
    },
    {
      label: "行乘列",
      text: `展开第 j 个输出列的第 i 个坐标，得到 ${texInline("(AB)_{ij}=\\sum_{k=1}^{n}a_{ik}b_{kj}")}。`,
    },
    {
      label: "连续作用",
      text: `${texInline("(AB)x=A(Bx)")}；靠近输入 x 的 B 先作用，A 随后处理 Bx。`,
    },
    {
      label: "单位与结合",
      text: `${texInline("IA=A=AI")}，且 ${texInline("(AB)C=A(BC)")}；括号可以改变，作用次序保持。`,
    },
    {
      label: "通常不交换",
      text: `${texInline("AB")} 与 ${texInline("BA")} 面对不同的中间结果，通常不相等，甚至可能只有一个乘积有定义。`,
    },
    {
      label: "转置倒序",
      text: `${texInline("(AB)^T=B^TA^T")}；交换输入与输出的读取方向时，因子的次序随之反转。`,
    },
  ],
  textbook: {
    reference: "Strang · Lay · Hoffman–Kunze · Friedberg",
    page: "Strang §2.4；Lay §2.1；Hoffman–Kunze §1.5；Friedberg §2.3",
    items: [
      "Lay：从 A(Bx) 和 B 的各列推出乘积矩阵，而后才写行乘列公式。",
      "Strang：用行乘列、A 乘 B 的各列、A 的各行乘 B、列乘行之和四种视角阅读同一乘积。",
      "Hoffman–Kunze：结合律是矩阵乘法定义必须保留的结构，而非额外记忆的巧合。",
      "Friedberg：矩阵复合的表示与乘积顺序完全一致。",
    ],
  },
  visual: {
    type: "multiply",
    title: "同一个乘积，四个入口",
    description: "同一组矩阵贯穿连续作用、看列、行乘列和交换顺序，所有视图显示同一个 AB。",
    task: `依次核对 ${texInline("ABx=A(Bx)")}、${texInline("AB=[Ab_1\\ \\cdots\\ Ab_p]")} 和一个具体 ${texInline("c_{ij}")}；最后比较 ${texInline("AB")} 与 ${texInline("BA")} 的中间状态。`,
    prompts: [
      "在“连续复合”中从 x 开始，先停在 Bx，再前往 A(Bx)。",
      "在“看列”中逐列验证 AB 的第 j 列就是 Abⱼ。",
      "在“行乘列”中点击任意结果元素，读出求和中的每一对乘数。",
      "在“交换顺序”中说明最终差异来自哪一个不同的中间图形。",
    ],
  },
  example: {
    title: "例题：同样两个动作，交换顺序后发生什么",
    question: `令 ${texInline("A=\\begin{bmatrix}2&0\\\\0&1\\end{bmatrix}")}，${texInline("B=\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}")}。计算 ${texInline("AB")} 与 ${texInline("BA")}；再用列或连续作用解释右上角元素为何不同。`,
    choices: [
      {
        correct: true,
        text: `${texInline("AB=\\begin{bmatrix}2&2\\\\0&1\\end{bmatrix}")}，${texInline("BA=\\begin{bmatrix}2&1\\\\0&1\\end{bmatrix}")}；A 会把 B 第二列中的水平分量再放大一次。`,
      },
      {
        text: `${texInline("AB=\\begin{bmatrix}2&1\\\\0&1\\end{bmatrix}")}，${texInline("BA=\\begin{bmatrix}2&2\\\\0&1\\end{bmatrix}")}；乘积按从左到右作用。`,
      },
      {
        text: `${texInline("AB=BA=\\begin{bmatrix}2&2\\\\0&1\\end{bmatrix}")}；结合律保证任意两个矩阵可以交换。`,
      },
      {
        text: `${texInline("AB")} 是对应元素相乘，所以 ${texInline("AB=\\begin{bmatrix}2&0\\\\0&1\\end{bmatrix}")}。`,
      },
    ],
    steps: [
      "两个矩阵都是 2×2，所以 AB 与 BA 都有定义。",
      `B 的第二列是 ${texInline("(1,1)^T")}；A 作用后得到 ${texInline("A(1,1)^T=(2,1)^T")}。因此 AB 的右上角是 2。`,
      `A 的第二列是 ${texInline("(0,1)^T")}；B 作用后得到 ${texInline("B(0,1)^T=(1,1)^T")}。因此 BA 的右上角是 1。`,
      `完整计算给出 ${texInline("AB=\\begin{bmatrix}2&2\\\\0&1\\end{bmatrix}")} 与 ${texInline("BA=\\begin{bmatrix}2&1\\\\0&1\\end{bmatrix}")}。`,
      "先剪切再横向拉伸时，剪切产生的水平偏移也被放大；交换顺序后，这个偏移在拉伸之后才产生。",
    ],
    audit: {
      a: [[2, 0], [0, 1]],
      b: [[1, 1], [0, 1]],
      ab: [[2, 2], [0, 1]],
      ba: [[2, 1], [0, 1]],
    },
  },
  quiz: [
    {
      question: `A 是 ${texInline("2\\times3")}，B 是 ${texInline("3\\times4")}，AB 的尺寸是什么？`,
      answer: `${texInline("2\\times4")}。内部尺寸 3 匹配，结果保留外侧的 2 与 4。`,
    },
    {
      question: `A 是 ${texInline("2\\times3")}，B 是 ${texInline("3\\times4")} 时，BA 有定义吗？`,
      answer: "没有。B 的列数 4 与 A 的行数 2 不匹配。",
    },
    {
      question: `AB 的第 j 列怎样由 B 的第 j 列得到？`,
      answer: `它等于 ${texInline("Ab_j")}；先取出 B 的第 j 列，再让 A 作用。`,
    },
    {
      question: `${texInline("(AB)_{ij}")} 使用 A 和 B 的哪些部分？`,
      answer: "使用 A 的第 i 行和 B 的第 j 列，对应相乘后求和。",
    },
    {
      question: `在 ${texInline("ABCx")} 中，哪一个矩阵最先作用？`,
      answer: `C 最先作用，然后是 B，最后是 A；结合律允许改变括号，但不改变这一顺序。`,
    },
    {
      question: "结合律是否能推出交换律？",
      answer: `${texInline("(AB)C=A(BC)")} 只改变括号；${texInline("AB=BA")} 交换因子次序，通常不成立。`,
    },
    {
      question: `为什么 ${texInline("(AB)^T")} 的因子顺序要倒过来？`,
      answer: `元素核对给出 ${texInline("((AB)^T)_{ij}=(AB)_{ji}=\\sum_k a_{jk}b_{ki}=(B^TA^T)_{ij}")}。`,
    },
  ],
  summary: [
    "加法和数乘逐位置工作；转置交换行列位置。",
    `${texInline("AB=[Ab_1\\ \\cdots\\ Ab_p]")} 是矩阵乘法的列定义。`,
    "行乘列公式来自列定义在单个输出坐标上的展开。",
    "连续作用解释结合律和乘法顺序；不同的中间结果解释通常不交换。",
    "下一节将追踪乘积的体积倍率和独立信息量。",
  ],
  exercises: [
    `设 A 为 ${texInline("3\\times2")}、B 为 ${texInline("2\\times5")}。写出 AB 的尺寸，并判断 BA 是否有定义。`,
    `取 ${texInline("C=\\begin{bmatrix}0&1\\\\1&0\\end{bmatrix}")}。分别说明 AC 与 CA 为什么交换 A 的列和行。`,
    `用 ${texInline("B=[b_1\\ b_2]")} 的列定义，推导 ${texInline("(AB)x=A(Bx)")}。`,
  ],
});
