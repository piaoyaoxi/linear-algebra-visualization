defineChapter4Section("matrix-product-determinant-rank", {
  number: "§3",
  textbookSection: "矩阵乘积的行列式与秩",
  title: "矩阵乘积的行列式与秩",
  navTitle: "乘积的行列式与秩",
  question: "连续施加两个矩阵后，面积倍率怎样累积？已经丢失的独立方向还能被后面的矩阵恢复吗？",
  goal: "把行列式读成有向面积倍率，把秩读成输出中保留下来的独立方向数；再用连续变换理解乘积行列式与乘积秩的约束。",
  tags: ["有向面积", "乘积行列式", "秩", "秩瓶颈"],
  intro:
    "第二节把矩阵乘法理解为过程复合。本节继续追踪同一个过程：行列式记录面积或体积被放大多少以及方向是否翻转；秩记录输出还能沿多少个独立方向变化。倍率可以继续相乘，丢掉的方向却不会凭空回来。",
  concepts: [
    {
      label: "有向面积",
      text: `${texInline("\\det(A)")} 的绝对值是二维面积倍率；正负号记录方向是否翻转。`,
    },
    {
      label: "乘积行列式",
      text: `${texInline("\\det(AB)=\\det(A)\\det(B)")}；连续两步的面积倍率依次相乘。`,
    },
    {
      label: "秩",
      text: `${texInline("\\operatorname{rank}(A)")} 是列空间的维数，也等于行空间的维数。`,
    },
    {
      label: "方阵的临界状态",
      text: `对 ${texInline("n")} 阶矩阵，${texInline("\\det(A)\\ne0")} 等价于 ${texInline("\\operatorname{rank}(A)=n")}；行列式为 0 时至少丢掉一个方向。`,
    },
    {
      label: "秩瓶颈",
      text: `${texInline("\\operatorname{rank}(AB)\\leq\\min\\{\\operatorname{rank}(A),\\operatorname{rank}(B)\\}")}。`,
    },
    {
      label: "可逆因子保持秩",
      text: `若 ${texInline("A")} 可逆，则 ${texInline("\\operatorname{rank}(AB)=\\operatorname{rank}(B)")}；若 ${texInline("B")} 可逆，则 ${texInline("\\operatorname{rank}(AB)=\\operatorname{rank}(A)")}。`,
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第四章",
    page: "",
    items: [
      "矩阵乘积的行列式",
      "行列式为零与列向量相关",
      "矩阵的行秩、列秩与秩",
      "乘积的秩不等式",
      "可逆矩阵乘法对秩的保持",
    ],
  },
  visual: {
    type: "rank",
    title: "面积—秩实验室",
    description: "拖动两列或选择预设，让面积、行列式、秩和可逆状态同步变化；再观察乘积中的面积计量与秩瓶颈。",
    task: "先让两列逐渐接近共线，观察行列式连续趋近 0，而秩只在临界点从 2 跳到 1；随后比较 AB 与 BA 的形状和面积，并用秩瓶颈解释后续变换为何不能恢复丢失的方向。",
    prompts: [
      "在“面积与秩”中拖动两根列向量，寻找行列式很小但仍非零的状态。",
      "选择“镜像”，确认面积绝对值不变而方向符号改变。",
      "在“乘积行列式”中同步播放 AB 与 BA，比较最终形状与面积倍率。",
      "在“秩瓶颈”中切换可逆 A 与会消灭直线的 A，观察 rank(AB) 只能保持或继续下降。",
    ],
  },
  example: {
    title: "例题：不展开乘积，判断行列式与秩",
    question: `设 ${texInline("A=\\begin{bmatrix}2&1\\\\0&1\\end{bmatrix}")}，${texInline("B=\\begin{bmatrix}1&1\\\\2&2\\end{bmatrix}")}。不必先算出 ${texInline("AB")} 的全部元素，判断 ${texInline("\\det(AB)")} 与 ${texInline("\\operatorname{rank}(AB)")}。`,
    choices: [
      {
        correct: true,
        text: `${texInline("\\det(AB)=0")}，且 ${texInline("\\operatorname{rank}(AB)=1")}；B 的两列相同，而 A 可逆。`,
      },
      {
        text: `${texInline("\\det(AB)=4")}，且 ${texInline("\\operatorname{rank}(AB)=2")}；A 的行列式会把 B 的秩也放大两倍。`,
      },
      {
        text: `${texInline("\\det(AB)=0")}，但 ${texInline("\\operatorname{rank}(AB)=0")}；行列式为 0 就意味着零矩阵。`,
      },
      {
        text: `必须完整计算 ${texInline("AB")} 后才能判断，单看两个因子无法得到任何结论。`,
      },
    ],
    steps: [
      `先看 B：两列都等于 ${texInline("(1,2)^T")}，所以 ${texInline("\\operatorname{rank}(B)=1")} 且 ${texInline("\\det(B)=0")}。`,
      `由乘积行列式，${texInline("\\det(AB)=\\det(A)\\det(B)=2\\cdot0=0")}。`,
      `A 的行列式为 ${texInline("2\\ne0")}，所以 A 可逆。可逆的左因子只改变方向和尺度，不改变 B 已有的独立方向数。`,
      `因此 ${texInline("\\operatorname{rank}(AB)=\\operatorname{rank}(B)=1")}。`,
      "结论来自结构：面积已经在 B 这一步降为 0；A 可以移动那条输出直线，却不能把它重新撑成平面。",
    ],
  },
  quiz: [
    {
      question: `二维矩阵的 ${texInline("\\det(A)=-3")} 表示什么？`,
      answer: "面积放大为原来的 3 倍，同时方向发生翻转。",
    },
    {
      question: `${texInline("\\det(A)=1")} 是否说明 A 没有改变图形？`,
      answer: "不说明。剪切或一方向放大、另一方向缩小都可能保持面积 1。",
    },
    {
      question: `在二维中，${texInline("\\det(A)")} 连续趋近 0 时，秩会怎样变化？`,
      answer: "只要行列式仍非零，秩仍是 2；到达行列式恰为 0 的临界状态时，秩才降为 1 或 0。",
    },
    {
      question: `若 ${texInline("\\det(A)=2")} 且 ${texInline("\\det(B)=-3")}，${texInline("\\det(AB)")} 是多少？`,
      answer: `${texInline("\\det(AB)=-6")}；面积倍率相乘，负号表示总方向翻转。`,
    },
    {
      question: `若 ${texInline("\\operatorname{rank}(B)=1")}，是否可能有 ${texInline("\\operatorname{rank}(AB)=2")}？`,
      answer: "不可能。B 的输出已经限制在一条线，A 只能把这条线变成另一条线或一个点。",
    },
    {
      question: `转置会改变矩阵的秩吗？`,
      answer: `${texInline("\\operatorname{rank}(A^T)=\\operatorname{rank}(A)")}；转置交换行空间与列空间，但独立方向数相同。`,
    },
    {
      question: `若 A 可逆，${texInline("\\operatorname{rank}(AB)")} 与 ${texInline("\\operatorname{rank}(B)")} 有什么关系？`,
      answer: "二者相等。A 不会丢失方向，因此只重新安排 B 的输出。",
    },
  ],
  summary: [
    "行列式的绝对值记录面积倍率，符号记录方向；行列式为 0 是坍缩的临界信号。",
    "连续变换的面积倍率相乘，所以 det(AB)=det(A)det(B)，AB 与 BA 虽形状可不同却有相同的行列式。",
    "秩是输出中保留下来的独立方向数；行秩与列秩相等。",
    "乘积受最窄的一步限制：rank(AB) 不超过两个因子的秩；可逆因子则保持另一因子的秩。",
    "下一节将沿着同一条主线追问：什么时候这些变化可以被完整撤销？",
  ],
  exercises: [
    `构造三个不同的 2 阶矩阵，使它们的行列式都为 1，但分别表现为单位变换、剪切和非等比例缩放。`,
    `取秩为 1 的矩阵 B，分别选择可逆 A 和不可逆 A，验证 ${texInline("\\operatorname{rank}(AB)")} 只能保持或下降。`,
  ],
});
