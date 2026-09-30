defineChapter1Section("polynomial-functions", {
  number: "§7",
  textbookSection: "多项式函数",
  title: "多项式函数",
  navTitle: "多项式函数",
  question: "把一个数代入多项式会得到什么？为什么 n 次多项式最多有 n 个根？",
  goal: "掌握余数定理与因式定理；理解根的个数上界与多项式函数的相等；会用 Lagrange 插值构造多项式。",
  tags: ["余数定理", "根的个数", "插值"],
  intro: `用 ${texInline("x-a")} 除 ${texInline("f(x)")}，余式是常数；在等式中令 ${texInline("x=a")}，便知这个常数就是 ${texInline("f(a)")}。所以 ${texInline("a")} 是根当且仅当 ${texInline("(x-a)\\mid f")}。每个根贡献一个一次因式，因此 ${texInline("n")} 次多项式在数域中至多有 ${texInline("n")} 个根（重根按重数计）。`,
  textbook: {
    reference: "北大版《高等代数》第一章 §7",
    items: ["余数定理", "根的个数", "多项式函数的相等"],
  },
  formal: {
    title: "余数定理与根",
    equation: "f(x)=(x-a)\\,q(x)+f(a)",
    definitions: [
      {
        title: "Horner 法",
        text: `从首项系数开始，反复“乘 ${texInline("a")} 再加下一个系数”，最后得到 ${texInline("f(a)")}；中间依次得到的数正是商 ${texInline("q(x)")} 的系数。`,
      },
      {
        title: "函数相等与多项式相等",
        text: `若 ${texInline("f,g")} 的次数都不超过 ${texInline("n")}，且在 ${texInline("n+1")} 个不同的数处取值相同，则 ${texInline("f=g")}，因为 ${texInline("f-g")} 的根太多。所以数域上两个多项式函数相等，当且仅当两个多项式相等。`,
      },
      {
        title: "Lagrange 插值",
        text: `横坐标互异的 ${texInline("n+1")} 个点确定唯一一个次数不超过 ${texInline("n")} 的多项式：${texInline("L(x)=\\sum_i y_i\\prod_{j\\ne i}\\dfrac{x-x_j}{x_i-x_j}")}。`,
      },
    ],
    pitfalls: [
      `以为 ${texInline("n")} 次多项式一定有 ${texInline("n")} 个根：${texInline("x^2+1")} 在 ${texInline("\\mathbb{R}")} 中没有根，上界只说“至多”。`,
      "插值节点的横坐标重复时仍套用 Lagrange 公式，分母会等于 0。",
    ],
    note: "复系数与实系数多项式的因式分解：把根放到复平面上。",
  },
  interactive: {
    type: "slot",
    title: "代入、根数与插值",
    description: "Horner 计算、根数上界与 Lagrange 插值。",
    task: "在“评价 / Horner”中移动 a，看 f(a) 何时为 0；在“根数上界”中让不同根的个数超过次数；在“Lagrange 插值”中修改三个节点。",
  },
  example: {
    title: "例题：三点确定一个二次多项式",
    question: `求次数不超过 2 且满足 ${texInline("f(0)=1,\\ f(1)=2,\\ f(2)=5")} 的多项式。`,
    choices: [
      { correct: true, text: `${texInline("f(x)=x^2+1")}。` },
      { text: `${texInline("f(x)=x+1")}。` },
      { text: `${texInline("f(x)=2x^2+1")}。` },
      { text: "过三个点的这种多项式不唯一。" },
    ],
    steps: [
      `Lagrange 基：${texInline("L_0=\\tfrac{(x-1)(x-2)}{2}")}，${texInline("L_1=-x(x-2)")}，${texInline("L_2=\\tfrac{x(x-1)}{2}")}。`,
      `${texInline("f=1\\cdot L_0+2L_1+5L_2")}，展开合并得 ${texInline("f=x^2+1")}。`,
      `检验：${texInline("f(0)=1,\\ f(1)=2,\\ f(2)=5")}。次数不超过 2 的这种多项式只有一个。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("x^4-3x^2+2x+5")} 除以 ${texInline("x-2")} 的余式是多少？`,
      answer: `${texInline("f(2)=16-12+4+5=13")}。`,
    },
    {
      question: `${texInline("f,g")} 的次数都不超过 3，且在 0、1、2、3 处取值相同，能推出什么？`,
      answer: `${texInline("f=g")}。${texInline("f-g")} 若非零，次数不超过 3，却有 4 个根，矛盾。`,
    },
    {
      question: `过点 ${texInline("(0,1),(1,2),(2,5)")} 的多项式只有 ${texInline("x^2+1")} 一个吗？`,
      answer: `次数不超过 2 的只有这一个；次数更高的有无穷多个，例如 ${texInline("x^2+1+c\\,x(x-1)(x-2)")}。`,
    },
    {
      question: "用 Horner 法计算 f(a) 时，中间得到的数有什么意义？",
      answer: "依次是商 q(x) 的系数，最后一个数是余数 f(a)。",
    },
  ],
  summary: [
    `${texInline("f")} 除以 ${texInline("x-a")} 的余式是 ${texInline("f(a)")}；${texInline("f(a)=0\\iff(x-a)\\mid f")}。`,
    `${texInline("n")} 次多项式在数域中至多有 ${texInline("n")} 个根，所以多项式函数相等与多项式相等是一回事。`,
    `横坐标互异的 ${texInline("n+1")} 个点唯一确定次数不超过 ${texInline("n")} 的多项式。`,
  ],
});
