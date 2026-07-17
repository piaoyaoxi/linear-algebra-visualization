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
    { label: "二次式", text: `二元二次式连接系数地图与曲面，不进入二次型分类。` },
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
    ],
  },
  example: {
    title: "例题：总次数与齐次层",
    question: `写出 ${texInline("f=x^3+2x^2y-xy^2+4y^3+x-1")} 的总次数，并列出总次数为 3 的齐次部分。`,
    choices: [
      { correct: true, text: "总次数 3；三次齐次元为 x³+2x²y−xy²+4y³。" },
      { text: "总次数是项数 6。" },
      { text: "总次数只看 x 的最高次。" },
      { text: "没有齐次部分。" },
    ],
    steps: ["各单项式总次数 = 指数和。", "取最大为总次数。", "抽出 i+j=3 的项。"],
  },
  quiz: [
    { question: "格点 (i,j) 对应什么？", answer: "单项式 x^i y^j。" },
    { question: "乘法时指数如何变？", answer: "向量相加。" },
  ],
  summary: [
    "格点组织多元项。",
    "总次数 = 指数和。",
    "乘法 = 向量加。",
  ],
  exercises: ["在格点上标出给定二元多项式的支撑。"],
});
