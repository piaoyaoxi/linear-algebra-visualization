defineChapter1Section("multivariate-polynomials", {
  number: "§10",
  textbookSection: "多元多项式",
  title: "多元多项式",
  navTitle: "多元多项式",
  question: "多个变量出现以后，“次数”和“项的位置”怎样组织？为什么指数格点比一长串公式更能看清结构？",
  goal: "理解多元单项式与总次数；用指数格点读写项；掌握齐次分层与乘法时指数向量相加。",
  tags: ["指数格点", "齐次", "总次数"],
  intro:
    "二元情形把 x^i y^j 放在格点 (i,j)。斜线 i+j=d 是总次数为 d 的齐次层。乘法对应指数向量相加，再按格点聚合系数。",
  concepts: [
    { label: "单项式", text: `${texInline("x^i y^j")} 对应格点 ${texInline("(i,j)")}。` },
    { label: "总次数", text: `${texInline("\\deg(x^i y^j)=i+j")}；多项式总次数取最高项。` },
    { label: "齐次", text: `所有项总次数相同；可分层 ${texInline("f=f_0+f_1+\\cdots+f_d")}。` },
    { label: "乘法", text: `${texInline("(i,j)+(k,l)=(i+k,j+l)")}，同格点系数相加。` },
    { label: "二次式", text: `二元二次式连接系数地图与曲面（移动端可用等高线），不进入二次型分类。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章",
    items: ["多元多项式", "齐次多项式", "次数"],
  },
  interactive: {
    type: "slot",
    title: "实验：指数格点",
    description: "点击格点高亮单项式；按齐次层过滤；演示两项相乘的指数相加。",
    task: "标出给定多项式的非零格点，并计算与 x−y 相乘后指定格点的系数。",
    prompts: [
      "点击 (2,1)，读出 x²y。",
      "只显示总次数 3 的层。",
      "演示 (1,0)+(0,1)→(1,1)。",
      "确认格点坐标与指数严格一致。",
    ],
  },
  example: {
    title: "例题：齐次层与乘法格点",
    question: `给定 ${texInline("f=x^3+2x^2y-xy^2+4y^3+x-1")}。标出指数格点，写齐次层，判断总次数，并求 f·(x−y) 中 ${texInline("x^2y")} 的系数。`,
    choices: [
      {
        correct: true,
        text: `总次数 3；齐次层含常数 −1、一次 x、三次四项；${texInline("x^2y")} 系数来自配对合计可算得 1。`,
      },
      { text: "总次数等于项数。" },
      { text: "齐次层按单个变量次数划分。" },
      { text: "乘法不会把不同来源聚合到同一格点。" },
    ],
    steps: [
      "非零格点：(3,0),(2,1),(1,2),(0,3),(1,0),(0,0)。",
      "总次数 3；f₃=x³+2x²y−xy²+4y³，f₁=x，f₀=−1。",
      `${texInline("f(x-y)")} 中 ${texInline("x^2y")} 来自 ${texInline("x^3\\cdot(-y)")}、${texInline("(2x^2y)\\cdot x")} 等配对，按卷积聚合。`,
    ],
  },
  quiz: [
    { question: "格点 (i,j) 代表什么？", answer: "单项式 x^i y^j。" },
    { question: "总次数层用什么方程？", answer: "i+j=d。" },
    { question: "齐次多项式的定义？", answer: "所有非零项总次数相同。" },
    { question: "两项相乘时指数如何变？", answer: "对应指数向量相加。" },
    { question: "稀疏多项式为何仍保留格点位置？", answer: "位置编码指数，零系数只是缺项，坐标系不动。" },
    { question: "最高次齐次部分有何直觉？", answer: "在远离原点时主导形状。" },
  ],
  summary: [
    "指数格点让多元结构可视化。",
    "总次数与各变量次数要分开读。",
    "乘法是格点上的 Minkowski 和与聚合。",
    "下一节讨论对称性与基本对称多项式。",
  ],
  exercises: [
    "画出 x²+xy+y² 的格点。",
    "写出 (x+y)² 的齐次层。",
  ],
});
