defineChapter10Section({
  id: "linear-functional",
  number: "§1",
  textbookSection: "线性函数",
  title: "线性函数",
  navTitle: "线性函数",
  question: "一个线性对象怎样把整个向量空间测量成一个数，同时保留加法与数乘？",
  goal: "从等值线、核空间和基上的读数出发，理解线性函数如何测量向量，并分清函数本身、坐标行向量与内积代表向量。",
  tags: ["线性函数", "核空间", "等值超平面"],
  intro:
    "先不要把它想成普通的一元函数曲线。在线性函数眼中，平面被分成一层层平行的等值线；向量移动到哪一层，仪表就读出相应的标量。穿过零值层时，读数改变符号。",
  openingCases: [
    {
      label: "读取第一坐标",
      formula: texInline("f(x_1,x_2)=x_1"),
      text: "竖直移动不会改变读数；横向跨过核直线时读数改变。",
    },
    {
      label: "把两个坐标相加",
      formula: texInline("f(x_1,x_2)=x_1+x_2"),
      text: "等值线倾斜，但仍然彼此平行；零值线仍穿过原点。",
    },
    {
      label: "零函数",
      formula: texInline("f(x)=0"),
      text: "所有向量都得到同一个读数，整个空间就是核。",
    },
  ],
  interactive: {
    type: "functional-field",
    title: "向量扫描器",
    question: "怎样移动向量，才能改变位置却保持函数值不变？",
    instruction:
      "先按“沿等值线走”播放一次引导，再拖动向量端点。切换视图观察正负区域、核直线、当前等值线和基向量读数怎样同步。",
    presets: [
      { id: "first", label: "读取 x₁", direction: [1, 0], scale: 1, vector: [2, 1] },
      { id: "second", label: "读取 x₂", direction: [0, 1], scale: 1, vector: [1, 2] },
      { id: "sum", label: "求和", direction: [1, 1], scale: 1, vector: [2, 1] },
      { id: "difference", label: "作差", direction: [1, -1], scale: 1, vector: [2, 1] },
      { id: "zero", label: "零函数", direction: [0, 0], scale: 0, vector: [2, 1] },
    ],
    tasks: [
      "沿当前等值线移动，确认位置变化而读数不变。",
      "沿测量方向跨过核，观察读数经过 0 并改变符号。",
      "只把倍率放大为 2，观察核方向不变而读数翻倍。",
      "切换零函数，说明为什么不再存在唯一的测量方向。",
    ],
  },
  linearityChecks: [
    {
      id: "addition",
      title: "先相加再测量",
      left: texInline("f(x+y)"),
      right: texInline("f(x)+f(y)"),
      text: "两条路径必须落到同一个标量读数。",
    },
    {
      id: "scaling",
      title: "先缩放再测量",
      left: texInline("f(\\lambda x)"),
      right: texInline("\\lambda f(x)"),
      text: "输入缩放多少倍，输出就缩放多少倍。",
    },
  ],
  concepts: [
    {
      label: "线性条件",
      text: `${texInline("f(x+y)=f(x)+f(y)")}，且 ${texInline("f(\\lambda x)=\\lambda f(x)")}。`,
    },
    {
      label: "核空间",
      text: `${texInline("\\ker f=\\{x:f(x)=0\\}")}；非零线性函数的核是余维 1 的子空间。`,
    },
    {
      label: "基值决定函数",
      text: `若 ${texInline("x=\\sum_i x_i e_i")}，则 ${texInline("f(x)=\\sum_i x_i f(e_i)")}。`,
    },
    {
      label: "坐标表示",
      text: `选定基后，${texInline("f(x)=[f][x]")}；行向量是函数的坐标，不是函数本身。`,
    },
  ],
  basisBuilder: {
    title: "基值构造器",
    instruction: "先规定函数怎样读取两支基向量，再让任意向量按同样系数组合这些读数。",
    standard: {
      basis: [
        [1, 0],
        [0, 1],
      ],
      values: [2, -1],
      vector: [1, 2],
    },
    skew: {
      basis: [
        [1, 1],
        [1, -1],
      ],
      values: [3, 1],
      vector: [2, 1],
    },
  },
  boundaryCases: [
    {
      id: "linear",
      label: "线性",
      formula: texInline("f(x)=a^Tx"),
      test: texInline("f(0)=0"),
      conclusion: "零向量必被送到 0，零值集合是子空间。",
    },
    {
      id: "affine",
      label: "仿射",
      formula: texInline("g(x)=a^Tx+c"),
      test: texInline("g(0)=c"),
      conclusion: "等值线仍然平行，但当常数项不为 0 时不再是线性函数。",
    },
  ],
  example: {
    title: "由非标准基上的取值确定线性函数",
    question: `在 ${texInline("\\mathbb R^2")} 中，令 ${texInline("v_1=(1,1)^T")}、${texInline("v_2=(1,-1)^T")}。已知 ${texInline("f(v_1)=3")}、${texInline("f(v_2)=1")}。求 ${texInline("f(x_1,x_2)")} 与 ${texInline("\\ker f")}。`,
    steps: [
      {
        title: "确认这是一组基",
        text: `${texInline("v_1,v_2")} 不共线，因此每个向量都有唯一的基坐标。`,
      },
      {
        title: "把标准基写回这组基",
        text: `${texInline("e_1=(v_1+v_2)/2")}，${texInline("e_2=(v_1-v_2)/2")}。`,
      },
      {
        title: "利用线性性读取标准基",
        text: `${texInline("f(e_1)=2")}，${texInline("f(e_2)=1")}。`,
      },
      {
        title: "写出坐标表达",
        text: `${texInline("f(x_1,x_2)=2x_1+x_2")}。`,
      },
      {
        title: "寻找零值方向",
        text: `${texInline("\\ker f=\\{(x_1,x_2)^T:2x_1+x_2=0\\}")}。`,
      },
    ],
  },
  quiz: [
    {
      question: `为什么线性函数必有 ${texInline("f(0)=0")}？`,
      answer: `${texInline("f(0)=f(0+0)=f(0)+f(0)")}，消去一项即可。`,
    },
    {
      question: `集合 ${texInline("\\{x:f(x)=2\\}")} 一定是子空间吗？`,
      answer: "不一定。它通常不经过原点，是与核平行的仿射超平面。",
    },
    {
      question: `函数 ${texInline("g(x,y)=2x-y+1")} 是否线性？`,
      answer: `不是，因为 ${texInline("g(0,0)=1\\ne0")}。`,
    },
    {
      question: "同一个线性函数换基后，什么保持不变？",
      answer: "函数对同一个几何向量的读数保持不变；向量坐标与函数的行坐标都会改变。",
    },
    {
      question: "为什么不能把法向箭头当成线性函数的定义？",
      answer: "法向箭头依赖选定的坐标与内积；线性函数本身只是从向量空间到标量域的线性映射。",
    },
  ],
  summary: [
    "线性函数把空间分成平行等值层，穿过原点的零值层就是核。",
    "一组基上的读数决定整个函数；行向量只是选定基后的坐标记录。",
    "下一节把所有线性测量方法放在一起，得到对偶空间。",
  ],
});
