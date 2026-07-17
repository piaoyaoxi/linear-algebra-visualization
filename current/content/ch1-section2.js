defineChapter1Section("univariate-polynomials", {
  number: "§2",
  textbookSection: "一元多项式",
  title: "一元多项式",
  navTitle: "一元多项式",
  question: "一个多项式究竟是函数图像、形式表达式，还是一串有位置的系数？为什么零系数也不能随意丢掉位置？",
  goal: "正确读写 P[x] 中的一元多项式；识别系数、首项、次数与零多项式；掌握加法、数乘、乘法与次数公式。",
  tags: ["系数带", "次数", "形式多项式"],
  intro:
    "本节首先研究形式多项式：它是幂基 1,x,x²,… 下的有限系数序列。图像只是一个观察窗口。内部零系数保留位置，尾部零系数被规范化。",
  concepts: [
    { label: "形式", text: `${texInline("f(x)=a_0+a_1x+\\cdots+a_nx^n")}，系数 ${texInline("a_i")} 来自指定数域。` },
    { label: "系数带", text: `从低次到高次写作 ${texInline("[a_0,a_1,\\ldots,a_n]")}；内部 0 不丢位置。` },
    { label: "次数", text: `非零多项式次数是最高非零系数的下标；零多项式单独处理，不强行写成普通整数。` },
    { label: "运算", text: "加法按同次对齐；数乘缩放全部系数；乘法是卷积：i 与 j 贡献到次数 i+j。" },
    { label: "次数公式", text: `${texInline("\\deg(fg)=\\deg f+\\deg g")}（非零）；${texInline("\\deg(f+g)\\le\\max(\\deg f,\\deg g)")}，首项可抵消。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章",
    items: ["一元多项式的定义", "相等与运算", "次数及其性质"],
  },
  interactive: {
    type: "slot",
    title: "实验：系数带工作台",
    description: "编辑系数，同步公式、次数与图像；观察加法抵消与乘法配对。",
    task: "构造首项抵消的加法，并查看乘积某一指定次数的所有贡献对。",
    prompts: [
      "把中间系数改为 0，确认位置仍在。",
      "选择“首项抵消”预设，看次数下降。",
      "切换到乘法，点选结果的 x³ 项看配对。",
      "把全部系数清零，确认显示为零多项式。",
    ],
  },
  example: {
    title: "例题：系数带、加法与指定项",
    question: `设 ${texInline("f(x)=2-x+3x^3")}，${texInline("g(x)=-2+x+x^2-3x^3")}。<br>写出系数带；计算 ${texInline("f+g")} 并解释次数下降；只求 ${texInline("fg")} 的 ${texInline("x^3")} 系数；判断 ${texInline("\\deg(fg)")}。`,
    choices: [
      {
        correct: true,
        text: `系数带 [2,−1,0,3] 与 [−2,1,1,−3]；${texInline("f+g=x^2")} 次数降为 2；${texInline("x^3")} 系数 0；${texInline("\\deg(fg)=6")}。`,
      },
      { text: `${texInline("f+g")} 次数仍为 3，因为两边都是 3 次。` },
      { text: `${texInline("fg")} 的 ${texInline("x^3")} 系数等于两边 ${texInline("x^3")} 系数之积。` },
      { text: "零系数可以删掉，所以 f 写作 [2,−1,3]。" },
    ],
    steps: [
      `${texInline("f")} 的系数带是 ${texInline("[2,-1,0,3]")}，中间 0 保留。`,
      `${texInline("f+g=[0,0,1,0]=x^2")}：3 次项抵消，次数降到 2。`,
      `${texInline("x^3")} 系数来自 ${texInline("(0,3)+(1,2)+(2,1)+(3,0)")} 四对，合计 0。`,
      `两边最高次 3，乘积次数 ${texInline("3+3=6")}。`,
    ],
  },
  quiz: [
    { question: "系数带 [0,0,0] 的次数是多少？", answer: "这是零多项式，不写成普通非负整数次数。" },
    { question: "为什么 [1,0,2] 中间的 0 不能删？", answer: "它标记 x 项位置；删掉会把 2 误当成一次项系数。" },
    { question: "非零多项式相乘时次数如何变化？", answer: "deg(fg)=deg f + deg g。" },
    { question: "加法次数何时严格小于两边最大次数？", answer: "当最高次系数相加抵消为零时。" },
    { question: "形式多项式与函数图像的关系是什么？", answer: "本节以形式对象为主；图像只是观察窗口，函数视角在 §7 系统处理。" },
    { question: "幂基下的坐标指什么？", answer: "多项式在 1,x,x²,… 下的系数序列。" },
  ],
  summary: [
    "多项式首先是有位置的系数序列。",
    "内部零系数保留，尾部零规范化。",
    "乘法按次数相加配对；加法可能降低次数。",
    "下一节把“整除”建立在带余除法上。",
  ],
  exercises: [
    "计算 (1+x+x²)(1−x) 的完整系数带。",
    "举一个 deg(f+g)<max(deg f,deg g) 的例子。",
  ],
});
