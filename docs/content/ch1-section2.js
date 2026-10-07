defineChapter1Section("univariate-polynomials", {
  number: "§2",
  textbookSection: "一元多项式",
  title: "一元多项式",
  navTitle: "一元多项式",
  question: "为什么说一个多项式由它的系数决定？系数中间的 0 能不能省掉？",
  goal: `掌握 ${texInline("P[x]")} 中多项式的相等、加法、乘法与次数；会用 ${texInline("i+j=k")} 求乘积中指定项的系数。`,
  tags: ["一元多项式", "系数", "次数", "乘法"],
  intro: `数域 ${texInline("P")} 上的一元多项式是 ${texInline("f(x)=a_0+a_1x+\\cdots+a_nx^n")}，${texInline("a_i\\in P")}。两个多项式相等，指同次项的系数全部相等。系数的位置就是次数：${texInline("3x^3-x+2")} 的系数依次为 ${texInline("(2,-1,0,3)")}，中间的 0 占着 ${texInline("x^2")} 的位置。`,
  textbook: {
    reference: "北大版《高等代数》第一章 §2",
    items: ["一元多项式及其相等", "加法与乘法", "次数"],
  },
  formal: {
    title: "运算与次数",
    equation: "f(x)g(x)=\\sum_{k=0}^{n+m}\\Bigl(\\sum_{i+j=k}a_ib_j\\Bigr)x^k",
    definitions: [
      {
        title: "加法与乘法",
        text: `加法把同次项系数相加。乘法中 ${texInline("x^k")} 的系数是所有满足 ${texInline("i+j=k")} 的 ${texInline("a_ib_j")} 之和，因为 ${texInline("a_ix^i\\cdot b_jx^j=a_ib_jx^{i+j}")}。`,
      },
      {
        title: "次数",
        text: `非零多项式最高非零系数的下标叫它的次数，记作 ${texInline("\\deg f")}。零多项式不定义次数。`,
      },
      {
        title: "次数公式",
        text: `${texInline("f,g\\ne0")} 时 ${texInline("\\deg(fg)=\\deg f+\\deg g")}，因为首项系数之积不为 0；${texInline("f+g\\ne0")} 时 ${texInline("\\deg(f+g)\\le\\max(\\deg f,\\deg g)")}，首项可能抵消。`,
      },
    ],
    pitfalls: [
      `把 ${texInline("(2,-1,0,3)")} 写成 ${texInline("(2,-1,3)")}，后面的系数全部错位。`,
      `把乘法当成同次系数相乘：${texInline("x^k")} 的系数要收集所有 ${texInline("i+j=k")} 的配对。`,
      "认为两个 3 次多项式之和一定是 3 次。",
    ],
    note: `整除的概念：带余除法 ${texInline("f=qg+r")}。`,
  },
  interactive: {
    type: "slot",
    title: "系数带工作台",
    description: `编辑 ${texInline("f")}、${texInline("g")} 的系数，比较乘法、加减与数乘。`,
    task: `先猜一猜删去中间的 0 会怎样，再动手比较两条曲线。展开“更多运算”可以做加减与乘法：拖动 ${texInline("k")}，读出所有满足 ${texInline("i+j=k")} 的配对；再点“首项抵消”，看和的次数怎样下降。`,
  },
  example: {
    title: "例题：系数、抵消与指定项",
    question: `设 ${texInline("f(x)=2-x+3x^3")}，${texInline("g(x)=-2+x+x^2-3x^3")}。写出系数序列，计算 ${texInline("f+g")}；求 ${texInline("fg")} 中 ${texInline("x^3")} 的系数，并判断 ${texInline("\\deg(fg)")}。`,
    choices: [
      {
        correct: true,
        text: `${texInline("f\\leftrightarrow(2,-1,0,3)")}，${texInline("g\\leftrightarrow(-2,1,1,-3)")}；${texInline("f+g=x^2")}；${texInline("x^3")} 的系数为 ${texInline("-13")}；${texInline("\\deg(fg)=6")}。`,
      },
      { text: `${texInline("f+g")} 仍为三次，因为两个加数都是三次。` },
      { text: `${texInline("x^3")} 的系数为 ${texInline("3\\cdot(-3)=-9")}，只需乘两个三次项系数。` },
      { text: `${texInline("f\\leftrightarrow(2,-1,3)")}，中间的零系数可以直接删除。` },
    ],
    steps: [
      `${texInline("f\\leftrightarrow(2,-1,0,3)")}，${texInline("g\\leftrightarrow(-2,1,1,-3)")}，缺少的 ${texInline("x^2")} 项系数记为 0。`,
      `同次相加得 ${texInline("(0,0,1,0)")}，即 ${texInline("f+g=x^2")}：三次项抵消了。`,
      `${texInline("x^3")} 的系数为 ${texInline("a_0b_3+a_1b_2+a_2b_1+a_3b_0=2(-3)+(-1)(1)+0\\cdot1+3(-2)=-13")}。`,
      `首项系数之积 ${texInline("3\\cdot(-3)=-9\\ne0")}，所以 ${texInline("\\deg(fg)=3+3=6")}。`,
    ],
  },
  quiz: [
    {
      question: `设 ${texInline("f=1+2x^2")}，${texInline("g=x-x^2")}。${texInline("fg")} 中 ${texInline("x^2")} 的系数是多少？`,
      answer: `${texInline("a_0b_2+a_1b_1+a_2b_0=1\\cdot(-1)+0\\cdot1+2\\cdot0=-1")}。`,
    },
    {
      question: `${texInline("\\deg(f+g)")} 什么时候会小于 ${texInline("\\max(\\deg f,\\deg g)")}？`,
      answer: "两者次数相同，并且首项系数互为相反数时。",
    },
    {
      question: "为什么两个非零多项式的乘积一定不是零多项式？",
      answer: "乘积的首项系数是两个首项系数之积，数域中两个非零数的积不为 0。",
    },
    {
      question: `${texInline("(2,-1,0,3)")} 与 ${texInline("(2,-1,3)")} 表示同一个多项式吗？`,
      answer: `不是。前者是 ${texInline("2-x+3x^3")}，后者是 ${texInline("2-x+3x^2")}。`,
    },
  ],
  summary: [
    "多项式由系数序列决定，缺少的项系数记为 0。",
    `加法同次相加；乘积中 ${texInline("x^k")} 的系数是 ${texInline("\\sum_{i+j=k}a_ib_j")}。`,
    "两个非零多项式乘积的次数等于次数之和；和的次数可能因首项抵消而降低。",
  ],
});
