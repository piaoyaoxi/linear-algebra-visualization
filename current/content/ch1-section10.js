defineChapter1Section("multivariate-polynomials", {
  number: "§10",
  textbookSection: "多元多项式",
  title: "多元多项式：指数向量给每一项一个地址",
  navTitle: "多元多项式",
  question: "多个变量出现后，怎样判断同类项、总次数和齐次层？乘法的许多项落到同一地址时，系数怎样汇总？",
  goal: "掌握多元单项式、指数向量、各变量次数、总次数与齐次分解；能用指数向量加法解释多项式乘法和系数聚合。",
  tags: ["指数向量", "支撑", "总次数", "齐次分层"],
  intro:
    "一元系数带把幂次放在数轴上，多元多项式把地址扩展到非负整数格点。xⁱyʲ 位于 (i,j)，同类项要求地址完全一致；乘法把两个地址相加，所有落到同一结果地址的系数贡献再求和。",
  concepts: [
    { label: "指数向量", text: `${texInline("\\alpha=(\\alpha_1,\\ldots,\\alpha_n)\\in\\mathbb N^n")}，记 ${texInline("x^\\alpha=x_1^{\\alpha_1}\\cdots x_n^{\\alpha_n}")}。` },
    { label: "支撑", text: "非零系数对应的指数向量集合。" },
    { label: "总次数", text: `${texInline("|\\alpha|=\\sum\\alpha_i")}；多项式总次数取支撑中 |α| 的最大值。` },
    { label: "乘法卷积", text: `${texInline("[x^\\gamma](fg)=\\sum_{\\alpha+\\beta=\\gamma}a_\\alpha b_\\beta")}。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章 §10",
    items: ["多元单项式与指数向量", "次数", "多项式运算", "齐次多项式与齐次部分"],
  },
  formal: {
    title: "从一维卷积推广到指数格点卷积",
    intro:
      "指数向量同时解决位置、次数和乘法。二维格点上的斜线 i+j=d 收集 d 次齐次项；两个多项式相乘时，每对支撑点做向量加法，系数乘积沿所有到达同一终点的路径汇总。",
    equation: "x^\\alpha x^\\beta=x^{\\alpha+\\beta},\\qquad [x^\\gamma](fg)=\\sum_{\\alpha+\\beta=\\gamma}a_\\alpha b_\\beta",
    map: [
      { label: "定位", text: "每个非零项在指数格点上占一个地址。" },
      { label: "分层", text: "|α|=d 的点组成 d 次齐次层。" },
      { label: "合成", text: "两个支撑点相加，得到乘积项的地址。" },
      { label: "聚合", text: "多条路径到达同一 γ 时，把 aαbβ 全部相加。" },
    ],
    bridge: {
      title: "主图看地址，分层区看次数，贡献表看系数",
      text: "点击空格点会显示系数 0，说明坐标系始终存在；切换齐次层只隐藏其他地址；乘法模式则把一对指数向量画成和点，并列出目标系数的所有来源。",
    },
    theorem: {
      label: "齐次分解与次数",
      title: "每个多元多项式都有唯一齐次分层",
      statement: `任意多元多项式可唯一写成 ${texInline("f=f_0+f_1+\\cdots+f_d")}，其中 ${texInline("f_k")} 是 k 次齐次多项式。若 ${texInline("f,g\\ne0")}，则 ${texInline("\\deg(fg)=\\deg f+\\deg g")}。`,
    },
    proof: {
      title: "按地址分组，再看最高层乘积",
      steps: [
        { title: "每项只有一个总次数", text: `单项式 ${texInline("x^\\alpha")} 的 ${texInline("|\\alpha|")} 唯一，因此把相同 |α| 的项收集起来得到一组 fₖ。` },
        { title: "分层唯一", text: "若存在两组分层，逐个指数地址比较系数，同一地址只能落在一个总次数层中，所以各层相同。" },
        { title: "最高层只来自最高层", text: `若 deg f=d、deg g=e，则乘积的 d+e 次齐次部分恰为 ${texInline("f_dg_e")}。` },
        { title: "最高层不会归零", text: "选定一个单项式次序，f_d 与 g_e 的最高单项式相乘给出乘积唯一最高项，系数为两个非零首系数之积，因此 f_dg_e≠0。" },
      ],
    },
    definitions: [
      { title: "三种次数", text: `对 ${texInline("x^3y^2+x^2y^5")}，x 次数为 3，y 次数为 5，总次数为 7。前两者看单个坐标，后者先在每一项内求坐标和。` },
      { title: "齐次与缩放", text: `f_d 是 d 次齐次多项式时，${texInline("f_d(tx_1,\\ldots,tx_n)=t^df_d(x_1,\\ldots,x_n)")}。这条缩放律把齐次层与后续二次型联系起来。` },
      { title: "普通多项式的指数", text: "所有指数必须是非负整数；负指数、变量出现在分母或一般根式中的表达式属于其他代数对象。" },
    ],
    boundary: {
      title: "一个结果格点可能接收多条乘法路径",
      text: `在 ${texInline("f(x,y)(x-y)")} 中，目标 ${texInline("x^3y")} 可以同时接收 ${texInline("2x^2y\\cdot x")} 与 ${texInline("x^3\\cdot(-y)")}；结果系数是 ${texInline("2+(-1)=1")}。只画指数和而忽略系数聚合，会漏掉多元乘法的核心。`,
    },
    pitfalls: [
      "x 次数、y 次数与总次数使用不同的最大值规则。",
      "只有完整指数向量相同的项才能合并。",
      "乘法既要相加指数，也要汇总到达同一点的系数贡献。",
    ],
    note: "指数格点组织了多元项。下一节让变量标签发生置换，研究哪些系数配置在全部置换下保持不变。",
  },
  interactive: {
    type: "slot",
    title: "实验：指数格点、齐次层与乘法卷积",
    description: "点击支撑内外的格点，过滤齐次层，选择指数向量相加，并展开目标格点的系数贡献。",
    task: "读出给定多项式的支撑与齐次分解；再计算 f(x,y)(x−y) 中 x³y 的全部来源。",
    guide: [
      ["读地址", "用横纵坐标确定 x、y 的指数。"],
      ["读分层", "沿 i+j=d 的斜线收集齐次部分。"],
      ["做卷积", "相加指数向量，并把所有同终点贡献相加。"],
    ],
    takeaway: "指数向量是多元单项式的地址；乘法是地址相加与系数聚合的组合。",
    prompts: [
      "点击 (2,1)，区分 x²y 与 xy²。",
      "依次查看 d=0,1,2,3 的齐次层。",
      "展开 x³y 结果格点的全部乘法来源。",
    ],
  },
  example: {
    title: "从指数地址写出齐次分层",
    question: `对 ${texInline("f=x^3+2x^2y-xy^2+4y^3+x-1")}，求总次数并写出各齐次部分。`,
    choices: [
      { correct: true, text: `deg f=3；${texInline("f_3=x^3+2x^2y-xy^2+4y^3")}，${texInline("f_2=0")}，${texInline("f_1=x")}，${texInline("f_0=-1")}。` },
      { text: "总次数为 6，因为 x³ 与 y³ 的指数相加。" },
      { text: `${texInline("f_3=x^3+4y^3")}。` },
      { text: "多元多项式没有次数。" },
    ],
    steps: [
      "逐项计算指数和：3、3、3、3、1、0。",
      "最大指数和为 3，所以 deg f=3。",
      "收集全部指数和为 3 的四项得到 f₃。",
      "没有二次项，故 f₂=0；x 与 −1 分别构成 f₁、f₀。",
    ],
  },
  quiz: [
    { question: `${texInline("x^3y^2z")} 的总次数是多少？`, answer: "6。" },
    { question: `${texInline("x^2y")} 与 ${texInline("xy^2")} 是同类项吗？`, answer: "不是，指数向量不同。" },
    { question: "二元 d 次齐次层在指数格点上是什么？", answer: "直线 i+j=d 上的非负整数格点。" },
    { question: "乘积中 x^γ 的系数怎样求？", answer: "把所有满足 α+β=γ 的 aαbβ 相加。" },
  ],
  summary: [
    "多元单项式由非负整数指数向量定位。",
    "按总次数分组得到唯一齐次分解。",
    "多元乘法让指数向量相加，并在同一结果格点汇总系数。",
  ],
  exercises: [
    `画出 ${texInline("1+x+y+x^2+xy+y^2")} 的支撑并分层。`,
    `求 ${texInline("(x+y+z)^3")} 中 ${texInline("x^2y")} 的系数，并列出全部来源。`,
    "构造一个 x 次数 4、y 次数 5、总次数 6 的二元多项式。",
  ],
});
