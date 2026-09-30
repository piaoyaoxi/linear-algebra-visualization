defineChapter10Section({
  id: "symplectic-space",
  number: "＊§4",
  textbookSection: "辛空间",
  title: "辛空间",
  navTitle: "辛空间",
  question: "如果一种双线性结构测量的是成对方向之间的有向面积，它还需要满足什么条件？",
  goal: "从二维有向面积进入交错与非退化，理解标准辛矩阵、偶数维、辛基、辛变换和辛正交补。",
  tags: ["辛形式", "有向面积", "辛变换"],
  intro:
    "二维中，标准辛配对就是两个向量张成的有向面积。交换顺序会变号，共线时为 0。但仅有交错还不够：辛形式还要非退化，任何非零方向都必须能找到一个搭档产生非零配对。",
  interactive: {
    type: "symplectic-area",
    title: "有向面积配对",
    question: "哪些操作改变向量，却不改变它们的辛配对？",
    instruction:
      "拖动两支向量，先完成交换、共线、缩放和加倍数四个观察任务。随后进入变换对照，比较长度、面积与辛配对分别是否保持。",
    tasks: [
      "交换 x 与 y，确认面积绝对值不变而符号反转。",
      "令 y 与 x 共线，确认配对精确变为 0。",
      "把 x 放大 λ 倍，确认配对也放大 λ 倍。",
      "把 y 替换为 y+tx，确认有向面积不变。",
    ],
  },
  concepts: [
    {
      label: "交错",
      text: `${texInline("\\omega(x,x)=0")}；在特征不为 2 时等价于交换变号。`,
    },
    {
      label: "非退化",
      text: `若 ${texInline("\\omega(x,y)=0")} 对所有 ${texInline("y")} 都成立，则 ${texInline("x=0")}。`,
    },
    {
      label: "标准矩阵",
      text: `${texInline("J=\\begin{bmatrix}0&I\\\\-I&0\\end{bmatrix}")}，${texInline("\\omega(x,y)=x^TJy")}。`,
    },
    {
      label: "辛变换",
      text: `${texInline("S^TJS=J")}，等价于保持所有辛配对。`,
    },
  ],
  jLens: {
    title: "标准矩阵 J 怎样计算有向面积",
    matrix: [0, 1, -1, 0],
    vectorX: [2, 1],
    vectorY: [-1, 2],
    steps: [
      { label: "输入右向量", formula: texInline("y") },
      { label: "由 J 改写测量方向", formula: texInline("Jy") },
      { label: "由左向量读取", formula: texInline("x^T(Jy)") },
      { label: "回到几何", formula: texInline("\\det[x\\;y]") },
    ],
  },
  structureTests: {
    title: "交错与非退化是两个不同测试",
    alternating: {
      label: "交错测试",
      text: "把两个输入逐渐合并，平行四边形收缩为 0；这对每个向量都成立。",
      formula: texInline("\\omega(x,x)=0"),
    },
    nondegenerate: {
      label: "非退化测试",
      text: "固定非零 x，让 y 绕一圈；必须能找到某个 y 使配对不为 0。",
      formula: texInline("\\omega(x,y)\\ne0"),
    },
    degenerateContrast: {
      label: "退化对照",
      text: "存在一个非零隐身方向，它与所有 y 的配对都为 0，因此不能构成辛空间。",
    },
  },
  evenDimension: {
    title: "为什么方向必须成对出现",
    visualPairs: [
      { label: texInline("(e_1,f_1)"), value: 1 },
      { label: texInline("(e_2,f_2)"), value: 1 },
    ],
    algebra: [
      "交错形式的矩阵是斜对称矩阵。",
      "奇数阶斜对称矩阵的行列式必为 0。",
      "非退化要求矩阵可逆。",
      "因此辛空间维数必须是偶数。",
    ],
  },
  symplecticBasis: {
    title: "辛基拼装器",
    order: [texInline("e_1"), texInline("e_2"), texInline("f_1"), texInline("f_2")],
    pairings: [
      [0, 0, 1, 0],
      [0, 0, 0, 1],
      [-1, 0, 0, 0],
      [0, -1, 0, 0],
    ],
    task: "点击配对矩阵中的非零格子，查看哪一对基向量形成一个标准面积单元，以及顺序怎样决定正负号。",
  },
  transformLab: {
    title: "辛变换实验室",
    presets: [
      { id: "identity", label: "原始", kind: "identity" },
      { id: "shear", label: "剪切", kind: "shear" },
      { id: "reciprocal", label: "互补缩放", kind: "reciprocal" },
      { id: "rotation", label: "旋转", kind: "rotation" },
      { id: "uniform", label: "均匀缩放", kind: "uniform" },
    ],
    vectorX: [2, 1],
    vectorY: [-1, 2],
    tasks: [
      "比较变换前后的平行四边形与配对值。",
      "观察剪切与互补缩放怎样改变长度，却保持配对。",
      "选择均匀缩放，说明为什么面积与配对一起改变。",
      "查看矩阵差 SᵀJS−J，而不是只看行列式。",
    ],
  },
  preservationCompare: [
    {
      id: "orthogonal",
      title: "正交",
      keeps: "长度与角度",
      condition: texInline("Q^TQ=I"),
      visual: "圆仍是圆",
    },
    {
      id: "symplectic",
      title: "辛",
      keeps: "辛配对",
      condition: texInline("S^TJS=J"),
      visual: "配对面积保持",
    },
    {
      id: "volume",
      title: "体积保持",
      keeps: "总体积",
      condition: texInline("\\det S=1"),
      visual: "高维总体积不变",
    },
    {
      id: "invertible",
      title: "一般可逆",
      keeps: "可恢复性",
      condition: texInline("\\det S\\ne0"),
      visual: "不一定保度量或配对",
    },
  ],
  highDimCounterexample: {
    title: "行列式为 1 仍可能不辛",
    matrix: texInline("D=\\operatorname{diag}(2,1/2,1,1)"),
    determinant: texInline("\\det D=1"),
    failure: texInline("D^TJD\\ne J"),
    text: "二维中的特殊等价关系不能直接推广到高维。",
  },
  complement: {
    title: "二维直线的辛正交补",
    definition: texInline("U^\\omega=\\{v:\\omega(v,u)=0,\\forall u\\in U\\}"),
    vector: [2, 1],
    conclusion: "在二维标准辛空间中，与一条非零直线辛正交的向量恰好仍在这条直线上。",
  },
  example: {
    title: "判断三类二维变换是否辛",
    question: `比较剪切 ${texInline("S_1=\\begin{bmatrix}1&t\\\\0&1\\end{bmatrix}")}、互补缩放 ${texInline("S_2=\\begin{bmatrix}s&0\\\\0&1/s\\end{bmatrix}")} 与均匀缩放 ${texInline("S_3=sI")}。`,
    steps: [
      {
        title: "检查剪切",
        text: `${texInline("S_1^TJS_1=J")}，因此剪切保持辛配对。`,
      },
      {
        title: "检查互补缩放",
        text: `${texInline("S_2^TJS_2=J")}；一个方向放大时，配对方向按倒数缩小。`,
      },
      {
        title: "检查均匀缩放",
        text: `${texInline("S_3^TJS_3=s^2J")}。`,
      },
      {
        title: "提炼条件",
        text: `均匀缩放只有在 ${texInline("s^2=1")} 时才辛。`,
      },
      {
        title: "标明二维边界",
        text: `二维中可用 ${texInline("S^TJS=(\\det S)J")} 快速判断，但高维不能只检查行列式。`,
      },
    ],
  },
  quiz: [
    {
      question: `为什么 ${texInline("\\omega(x,x)=0")} 不推出 ${texInline("x=0")}？`,
      answer: "交错形式对每个向量的自配对都为 0；非退化考察它与所有其他向量的配对。",
    },
    {
      question: "一对共线向量配对为 0，是否说明形式退化？",
      answer: "不说明。退化要求某个非零向量与所有向量都配对为 0。",
    },
    {
      question: "辛空间维数为什么必须为偶数？",
      answer: "奇数阶斜对称矩阵行列式为 0，不能满足非退化。",
    },
    {
      question: "辛变换的矩阵判据是什么？",
      answer: `${texInline("S^TJS=J")}。`,
    },
    {
      question: "高维中行列式为 1 是否足以保证辛？",
      answer: "不足。它只保证总体积，辛条件要求全部配对结构保持。",
    },
    {
      question: "二维非零直线的辛正交补是什么？",
      answer: "在标准二维辛空间中，它等于这条直线本身。",
    },
  ],
  summary: [
    "辛形式是交错且非退化的双线性函数；二维标准模型是有向面积。",
    "方向按二维面积单元成对组织，因此辛空间维数必须为偶数。",
    "辛变换保持 xᵀJy，不必保持长度、角度，也不能用高维体积保持代替。",
  ],
});
