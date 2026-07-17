defineChapter2Section("determinant-intro", {
  number: "§1",
  textbookSection: "引言",
  title: "引言",
  navTitle: "引言",
  question: "一个方阵怎样用一个数概括“空间被放大多少、方向是否翻转、维度是否塌缩”？",
  goal: "在二维中建立有向面积视角：绝对值给出面积倍率，符号记录定向，零值对应塌缩；并预告三维体积与本章路线。",
  tags: ["有向面积", "倍率与符号", "维度塌缩"],
  intro:
    "行列式只对方阵定义，结果是一个标量。二维里，它同时记录平行四边形的面积倍率与定向；三维里对应有向体积。本节先把这三个信息立起来，再进入排列与 n 阶定义。",
  videoPlan: {
    title: "一个正方形的三种命运",
    duration: "约 1—2 分钟",
    scenes: [
      "单位正方形经拉伸剪切，面积改变但保持二维。",
      "镜像后面积不变，方向翻转。",
      "两列逐渐共线，图形压成线段，行列式归零。",
    ],
  },
  concepts: [
    { label: "方阵专属", text: "行列式只对方阵有定义，结果始终是一个标量。" },
    { label: "二阶公式", text: `${texInline("\\det\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}=ad-bc")}` },
    { label: "绝对值", text: `${texInline("|\\det(A)|")} 是单位正方形经变换后的面积倍率。` },
    { label: "符号", text: "正号表示定向保持，负号表示定向翻转；有向面积可为负，普通几何面积仍为正。" },
    { label: "零值", text: `${texInline("\\det(A)=0")} 时平面被压到直线或点，输入信息无法唯一恢复。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第二章",
    page: "",
    items: ["行列式的背景与几何意义", "二阶行列式", "有向面积与零行列式", "三维体积预告"],
  },
  interactive: {
    type: "slot",
    title: "实验：行列式仪表",
    description: "拖动两列向量，同步观察有向面积、符号与塌缩状态。",
    task: "先让图形明显变形却保持 det=1，再拖到 det=0 与 det<0，区分倍率、方向与塌缩。",
    prompts: [
      "选择“单位矩阵”，确认 det=1、方向保持。",
      "选择“剪切保持面积”，观察形变但 |det|=1。",
      "选择“镜像”，比较面积绝对值与符号。",
      "选择“共线”，看平行四边形压扁与 det→0。",
    ],
  },
  example: {
    title: "例题：从两列读出倍率与方向",
    question: `设 ${texInline("A=\\begin{bmatrix}2&1\\\\0&1\\end{bmatrix}")}。计算 ${texInline("\\det(A)")}，说明单位正方形的面积变化，并判断方向是否翻转、平面是否塌缩。`,
    choices: [
      {
        correct: true,
        text: `${texInline("\\det(A)=2")}：面积变为 2 倍，定向保持，两列不共线，平面不塌缩。`,
      },
      { text: `${texInline("\\det(A)=2")}：面积变为 2 倍，但符号为负，说明方向翻转。` },
      { text: `${texInline("\\det(A)=0")}：因为有剪切，平面一定塌缩。` },
      { text: `${texInline("\\det(A)=1")}：行列式恒为 1，与矩阵元素无关。` },
    ],
    steps: [
      `两列是 ${texInline("(2,0)^T")} 与 ${texInline("(1,1)^T")}。`,
      `按二阶公式：${texInline("2\\cdot1-1\\cdot0=2")}。`,
      "绝对值为 2，所以面积倍率是 2。",
      "结果为正，定向保持；非零，所以平面没有塌缩。",
    ],
  },
  quiz: [
    { question: "行列式可以对非方阵定义吗？结果是矩阵还是标量？", answer: "只对方阵定义，结果是一个标量。" },
    { question: `${texInline("\\det(A)=2")} 与 ${texInline("\\det(A)=-2")} 在几何上各说明什么？`, answer: "两者面积倍率都是 2；前者定向保持，后者定向翻转。" },
    { question: `${texInline("\\det(A)=1")} 是否意味着 ${texInline("A")} 是单位矩阵？`, answer: "不是。许多剪切或旋转矩阵也有 det=1。" },
    { question: "两列共线时行列式为什么为零？", answer: "平行四边形高度为零，有向面积为零，维度塌缩。" },
    { question: "“负面积”应如何准确表述？", answer: "有向面积为负；普通几何面积仍取绝对值。" },
  ],
  summary: [
    "行列式把方阵压成一个标量，同时携带倍率、方向与是否塌缩。",
    "二维中 |det| 是面积倍率，符号记录定向。",
    "det=0 对应信息丢失，预告可逆性与唯一解问题。",
    "下一节回答：展开式中各项的正负号从哪里来。",
  ],
  exercises: [
    "构造一个 det=1 但明显不是单位矩阵的 2 阶矩阵。",
    "画出一个 det<0 的例子，并标出方向翻转。",
  ],
});
