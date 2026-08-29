defineChapter10Section({
  id: "bilinear-form",
  number: "§3",
  textbookSection: "双线性函数",
  title: "双线性函数",
  navTitle: "双线性函数",
  question: "两个向量怎样共同进入一个函数，并让每个输入槽都保持线性？",
  goal: "理解双输入槽、配对矩阵、两条等价计算路径、合同换基、对称与交错分解、退化根空间以及二次型连接。",
  tags: ["双线性函数", "配对矩阵", "合同变换"],
  intro:
    "双线性函数不是把向量对整体当成一个普通向量。固定右槽时，左槽得到一个线性函数；固定左槽时，右槽也得到一个线性函数。矩阵记录的是基向量之间所有可能的配对读数。",
  interactive: {
    type: "bilinear-mixer",
    title: "双输入机器",
    question: "固定一个输入槽后，另一个输入槽为什么变成线性函数？",
    instruction:
      "先固定右槽，沿左侧等值线移动 x；再固定左槽，沿右侧等值线移动 y。切换计算路径，确认两条路线得到同一个标量。",
    presets: [
      { id: "symmetric", label: "对称", matrix: [2, 1, 1, 2] },
      { id: "alternating", label: "交错", matrix: [0, 1, -1, 0] },
      { id: "general", label: "一般", matrix: [2, 1, -1, 3] },
      { id: "degenerate", label: "退化", matrix: [1, 2, 2, 4] },
    ],
    tasks: [
      "固定 y，把 x 放大 2 倍，观察输出是否放大 2 倍。",
      "交换 x 与 y，比较对称、交错和一般预设的读数关系。",
      "切换两条计算路径：先算 Ay 再由 x 读取，或先算 Aᵀx 再由 y 读取。",
      "在退化预设中锁定左根方向，再任意改变 y，确认输出始终为 0。",
    ],
  },
  concepts: [
    {
      label: "分别线性",
      text: `${texInline("B:V\\times W\\to F")} 对左右两个输入槽分别满足可加性与齐次性。`,
    },
    {
      label: "配对矩阵",
      text: `${texInline("a_{ij}=B(e_i,f_j)")}，因此 ${texInline("B(x,y)=x^TAy")}。`,
    },
    {
      label: "合同换基",
      text: `同一空间同时换基时，${texInline("A'=P^TAP")}。`,
    },
    {
      label: "退化",
      text: "存在非零方向与另一槽所有向量配对都为 0 时，双线性函数退化。",
    },
  ],
  pairingMatrix: {
    title: "矩阵是一张基向量配对表",
    matrix: [
      [2, 1],
      [-1, 3],
    ],
    rowLabels: [texInline("e_1"), texInline("e_2")],
    columnLabels: [texInline("e_1"), texInline("e_2")],
    task: "点击一个矩阵格子，观察对应的两支基向量进入双输入机器；再从一对基向量反向定位格子。",
  },
  rebuild: {
    title: "从基配对值重建一般输入",
    steps: [
      { label: "拆开左输入", formula: texInline("x=\\sum_i x_i e_i") },
      { label: "拆开右输入", formula: texInline("y=\\sum_j y_j f_j") },
      { label: "形成所有配对", formula: texInline("B(e_i,f_j)=a_{ij}") },
      { label: "按坐标加权汇总", formula: texInline("B(x,y)=\\sum_{i,j}x_i a_{ij}y_j") },
    ],
  },
  congruence: {
    title: "合同舞台",
    text: "换基改变配对矩阵的记录方式，但同一对几何向量的配对值不变。",
    matrix: [2, 1, -1, 3],
    basisChange: [1, 1, 0, 1],
    vectorX: [1, 2],
    vectorY: [2, -1],
  },
  symmetrySplit: {
    title: "交换两个输入会发生什么",
    matrix: [2, 3, -1, 1],
    tabs: [
      {
        id: "symmetric",
        label: "对称部分",
        formula: texInline("S=(A+A^T)/2"),
        relation: texInline("B_S(x,y)=B_S(y,x)"),
      },
      {
        id: "skew",
        label: "斜对称部分",
        formula: texInline("K=(A-A^T)/2"),
        relation: texInline("B_K(x,y)=-B_K(y,x)"),
      },
      {
        id: "whole",
        label: "重新叠加",
        formula: texInline("A=S+K"),
        relation: "一般配对同时包含两种结构。",
      },
    ],
  },
  radical: {
    title: "隐身方向测试",
    fullRank: [2, 1, -1, 2],
    degenerate: [1, 2, 2, 4],
    nonsymmetricDegenerate: [1, 2, 0, 0],
    text: "左根中的非零向量对所有右槽输入都读数为 0；右根则交换两个输入槽。",
  },
  quadraticMerge: {
    title: "把两个输入合并为同一个向量",
    symmetric: [2, 1, 1, 3],
    skew: [0, 2, -2, 0],
    vector: [1, 2],
    conclusion: `${texInline("x^TAx=x^T((A+A^T)/2)x")}；斜对称部分在对角输入中消失。`,
  },
  example: {
    title: "由基配对值写出矩阵并计算",
    question: `已知 ${texInline("B(e_1,e_1)=2")}、${texInline("B(e_1,e_2)=1")}、${texInline("B(e_2,e_1)=-1")}、${texInline("B(e_2,e_2)=3")}。计算 ${texInline("B((1,2)^T,(3,-1)^T)")} 并判断结构。`,
    steps: [
      {
        title: "把配对值放进正确格子",
        text: `${texInline("A=\\begin{bmatrix}2&1\\\\-1&3\\end{bmatrix}")}。`,
      },
      {
        title: "先让右输入经过矩阵",
        text: `${texInline("Ay=\\begin{bmatrix}5\\\\-6\\end{bmatrix}")}。`,
      },
      {
        title: "由左输入读取结果",
        text: `${texInline("x^T(Ay)=5-12=-7")}。`,
      },
      {
        title: "检查交换关系",
        text: "矩阵既不对称也不斜对称，因此交换输入后一般既不相等也不互为相反数。",
      },
      {
        title: "检查退化性",
        text: `${texInline("\\det A=7\\ne0")}，所以左根与右根都只有零向量。`,
      },
    ],
  },
  quiz: [
    {
      question: "双线性是否意味着对向量对整体线性？",
      answer: "不是。它要求固定任意一个槽后，对另一个槽线性。",
    },
    {
      question: `矩阵元素 ${texInline("a_{ij}")} 表示什么？`,
      answer: `${texInline("a_{ij}=B(e_i,f_j)")}。`,
    },
    {
      question: "同一空间换基时为什么得到合同而不是相似？",
      answer: "两个输入坐标都改变，一侧产生转置因子，因此矩阵按 PᵀAP 变化。",
    },
    {
      question: `若 ${texInline("A^T=-A")} 且数域特征不为 2，${texInline("B(x,x)")} 等于什么？`,
      answer: "恒等于 0。",
    },
    {
      question: "二次型为什么不能恢复一般双线性函数？",
      answer: "因为斜对称部分代入同一个向量两次时恒为 0。",
    },
    {
      question: "左根与右根一定相同吗？",
      answer: "不一定；一般矩阵的左核与右核可能不同，只有在特殊结构下才会重合。",
    },
  ],
  summary: [
    "双线性函数有两个分别线性的输入槽，矩阵记录基向量之间的全部配对。",
    "换基按合同改变记录；对称、斜对称和退化性描述不同结构。",
    "辛形式将从交错且非退化的双线性函数中产生。",
  ],
});
