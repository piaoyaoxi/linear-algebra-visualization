defineChapter10Section({
  id: "dual-space",
  number: "§2",
  textbookSection: "对偶空间",
  title: "对偶空间",
  navTitle: "对偶空间",
  question: "所有线性测量方法放在一起，会不会也形成一个向量空间？",
  goal: "把对偶空间理解为测量方法的空间，掌握自然配对、对偶基、换基平衡、双对偶和对偶映射。",
  tags: ["对偶空间", "对偶基", "对偶映射"],
  intro:
    "原空间中的对象是向量；对偶空间中的对象是线性函数。它们通过求值相遇：函数读取向量，输出一个标量。对偶基不是第二组普通箭头，而是一组坐标读取器。",
  openingFunctions: [
    { id: "first", label: "读取第一坐标", coefficients: [1, 0] },
    { id: "second", label: "读取第二坐标", coefficients: [0, 1] },
    { id: "sum", label: "读取坐标和", coefficients: [1, 1] },
  ],
  interactive: {
    type: "dual-probe",
    title: "谁在测量谁",
    question: "固定其中一个输入时，另一个输入怎样线性地改变配对值？",
    instruction:
      "左侧拖动向量，右侧拖动测量器参数。先固定测量器缩放向量，再固定向量缩放测量器；切换“看 V 中的等值线”和“看 V* 中的等值线”。",
    tasks: [
      "固定函数，把向量放大 2 倍，检查读数是否放大 2 倍。",
      "固定向量，把函数系数放大 2 倍，检查读数是否放大 2 倍。",
      "切换等值线所在的空间，说明自然配对为什么对两个槽分别线性。",
    ],
  },
  concepts: [
    {
      label: "对偶空间",
      text: `${texInline("V^*=\\operatorname{Hom}(V,F)")}，其中每个元素都是一个线性函数。`,
    },
    {
      label: "自然配对",
      text: `${texInline("\\langle f,x\\rangle=f(x)")}；一个函数槽与一个向量槽共同产生标量。`,
    },
    {
      label: "对偶基",
      text: `${texInline("e^i(e_j)=\\delta_{ij}")}；${texInline("e^i")} 只读取第 ${texInline("i")} 个坐标。`,
    },
    {
      label: "对偶映射",
      text: `若 ${texInline("T:V\\to W")}，则 ${texInline("T^*:W^*\\to V^*")}，${texInline("T^*(g)=g\\circ T")}。`,
    },
  ],
  coordinateReaders: {
    title: "坐标读取器",
    basis: [
      [1, 0],
      [0, 1],
    ],
    vector: [2, -1],
    table: [
      [1, 0],
      [0, 1],
    ],
  },
  dualBasisBuilder: {
    title: "非标准基的对偶读取器",
    presets: [
      {
        id: "standard",
        label: "标准基",
        basis: [
          [1, 0],
          [0, 1],
        ],
      },
      {
        id: "skew",
        label: "斜基",
        basis: [
          [1, 0.45],
          [0.65, 1.25],
        ],
      },
      {
        id: "near",
        label: "接近共线",
        basis: [
          [1.35, 0.4],
          [1.55, 0.5],
        ],
      },
      {
        id: "singular",
        label: "精确共线",
        basis: [
          [1, 0.5],
          [2, 1],
        ],
      },
    ],
    tasks: [
      "检查第一读取器的核是否沿第二支基向量。",
      "检查第二读取器的核是否沿第一支基向量。",
      "让基接近共线，观察读取器系数为什么迅速增大。",
      "在精确共线时说明为什么无法分别读取两个坐标。",
    ],
  },
  balance: {
    title: "换基平衡",
    text: "几何向量和几何函数都不变；向量坐标与函数坐标相互配合地改变，使配对值保持不变。",
    standardBasis: [
      [1, 0],
      [0, 1],
    ],
    newBasis: [
      [1, 1],
      [1, -1],
    ],
    vector: [2, 1],
    functional: [2, -1],
  },
  doubleDual: {
    title: "向量也能读取函数",
    steps: [
      {
        label: "给定向量",
        formula: texInline("x\\in V"),
        text: "先固定一个几何向量。",
      },
      {
        label: "输入任意函数",
        formula: texInline("f\\in V^*"),
        text: "让向量面对所有线性函数。",
      },
      {
        label: "返回求值结果",
        formula: texInline("J(x)(f)=f(x)"),
        text: `${texInline("J(x)")} 本身是对 ${texInline("V^*")} 的线性函数，因此属于 ${texInline("V^{**}")}。`,
      },
    ],
  },
  pullback: {
    title: "拉回传送带",
    steps: [
      { label: "原输入", formula: texInline("x\\in V") },
      { label: "先做变换", formula: texInline("x\\mapsto Tx\\in W") },
      { label: "再做测量", formula: texInline("Tx\\mapsto g(Tx)") },
      { label: "压缩成一个测量", formula: texInline("T^*(g)=g\\circ T\\in V^*") },
    ],
  },
  example: {
    title: "求非标准基的对偶基",
    question: `在 ${texInline("\\mathbb R^2")} 中，令 ${texInline("v_1=(1,1)^T")}、${texInline("v_2=(2,1)^T")}。求对偶基 ${texInline("v^1,v^2")}。`,
    steps: [
      {
        title: "为第一读取器设未知系数",
        text: `设 ${texInline("v^1=[a\\;b]")}，要求 ${texInline("v^1(v_1)=1")}、${texInline("v^1(v_2)=0")}。`,
      },
      {
        title: "解第一组条件",
        text: `${texInline("a+b=1")}、${texInline("2a+b=0")}，得到 ${texInline("v^1=[-1\\;2]")}。`,
      },
      {
        title: "求第二读取器",
        text: `同理得到 ${texInline("v^2=[1\\;-1]")}。`,
      },
      {
        title: "用逆矩阵统一验证",
        text: `基矩阵 ${texInline("P=\\begin{bmatrix}1&2\\\\1&1\\end{bmatrix}")} 的逆矩阵各行正是 ${texInline("v^1,v^2")}。`,
      },
      {
        title: "恢复任意向量",
        text: `${texInline("x=v^1(x)v_1+v^2(x)v_2")}。`,
      },
    ],
  },
  quiz: [
    {
      question: `线性函数 ${texInline("f:V\\to F")} 属于哪个空间？`,
      answer: `${texInline("f\\in V^*")}。`,
    },
    {
      question: `为什么 ${texInline("e^i(x)")} 等于第 ${texInline("i")} 个坐标？`,
      answer: `把 ${texInline("x=\\sum_jx_je_j")} 代入，并使用 ${texInline("e^i(e_j)=\\delta_{ij}")}。`,
    },
    {
      question: "有限维时维数相同，能否直接把原空间和对偶空间视为同一个空间？",
      answer: "不能。维数相同保证存在同构，但一般没有不依赖选择的自然同构。",
    },
    {
      question: `若 ${texInline("T:V\\to W")}，对偶映射为什么从 ${texInline("W^*")} 指向 ${texInline("V^*")}？`,
      answer: "W 上的测量与 T 复合后，变成了 V 上的测量。",
    },
    {
      question: `自然映射 ${texInline("J:V\\to V^{**}")} 怎样定义？`,
      answer: `${texInline("J(x)(f)=f(x)")}。`,
    },
  ],
  summary: [
    "对偶空间的元素是线性测量方法，自然配对把函数与向量送到标量。",
    "对偶基不是普通箭头，而是按 Kronecker 条件读取坐标的函数。",
    "换基时向量坐标与函数坐标共同改变；对偶映射通过复合把测量拉回。",
  ],
});
