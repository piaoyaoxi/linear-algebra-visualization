defineChapter1Section("polynomial-divisibility", {
  number: "§3",
  textbookSection: "整除的概念",
  title: "整除的概念",
  navTitle: "整除的概念",
  question: "多项式的带余除法怎样一步步算出商和余式？什么时候说 g 整除 f？",
  goal: "掌握带余除法以及商、余式的唯一性；理解整除的定义与基本性质。",
  tags: ["带余除法", "整除", "商与余式"],
  intro: `对 ${texInline("f(x)")} 和非零的 ${texInline("g(x)")} 做长除法：每一步用当前余式的首项除以 ${texInline("g")} 的首项，得到商的下一项；乘回 ${texInline("g")} 再相减，余式次数就下降。做到 ${texInline("r=0")} 或 ${texInline("\\deg r<\\deg g")} 为止。`,
  textbook: {
    reference: "北大版《高等代数》第一章 §3",
    items: ["带余除法", "整除的定义与性质"],
  },
  formal: {
    title: "带余除法与整除",
    equation: "\\begin{gathered}f(x)=q(x)g(x)+r(x)\\\\ r(x)=0\\ \\ \\text{或}\\ \\ \\deg r<\\deg g\\end{gathered}",
    definitions: [
      {
        title: "整除",
        text: `若有 ${texInline("h(x)")} 使 ${texInline("f=gh")}，就说 ${texInline("g")} 整除 ${texInline("f")}，记作 ${texInline("g\\mid f")}。${texInline("g\\ne0")} 时，${texInline("g\\mid f")} 当且仅当 ${texInline("g")} 除 ${texInline("f")} 的余式为 0。`,
      },
      {
        title: "商和余式唯一",
        text: `若 ${texInline("f=q_1g+r_1=q_2g+r_2")}，则 ${texInline("(q_1-q_2)g=r_2-r_1")}。若 ${texInline("q_1\\ne q_2")}，左边次数至少为 ${texInline("\\deg g")}，右边次数却小于 ${texInline("\\deg g")}，矛盾。`,
      },
      {
        title: "基本性质",
        text: `整除有传递性；若 ${texInline("h\\mid f")}、${texInline("h\\mid g")}，则对任意 ${texInline("u,v")} 有 ${texInline("h\\mid uf+vg")}；若 ${texInline("f\\mid g")} 且 ${texInline("g\\mid f")}，则 ${texInline("f=cg")}，${texInline("c")} 为非零常数。`,
      },
    ],
    pitfalls: [
      "缺项不补 0，相减时同次项没有对齐。",
      "余式次数已经低于除式次数，还继续往下除。",
    ],
    note: "最大公因式：反复做带余除法。",
  },
  interactive: {
    type: "slot",
    title: "长除法",
    description: "逐步做首项相除、乘回、相减。",
    task: "点“下一步”做完 x⁴−1 除以 x²+x+1，每一步核对右侧的 f=qg+r；再换到“整除”示例，比较结束时的余式。",
  },
  example: {
    title: "例题：完成一次带余除法",
    question: `用带余除法求 ${texInline("x^4-1")} 除以 ${texInline("x^2+x+1")} 的商与余式，并判断是否整除。`,
    choices: [
      { correct: true, text: `商为 ${texInline("x^2-x")}，余式为 ${texInline("x-1")}，不整除。` },
      { text: `商为 ${texInline("x^2+1")}，余式为 0。` },
      { text: `商为 ${texInline("x^2-x")}，余式为 0。` },
      { text: "商和余式不唯一，可以换一组继续相等。" },
    ],
    steps: [
      `${texInline("x^4\\div x^2=x^2")}，减去 ${texInline("x^2(x^2+x+1)=x^4+x^3+x^2")}，余下 ${texInline("-x^3-x^2-1")}。`,
      `${texInline("-x^3\\div x^2=-x")}，减去 ${texInline("-x(x^2+x+1)=-x^3-x^2-x")}，余下 ${texInline("x-1")}。`,
      `${texInline("\\deg(x-1)=1<2")}，停止。`,
      `所以 ${texInline("x^4-1=(x^2-x)(x^2+x+1)+(x-1)")}；余式不为 0，不整除。`,
    ],
  },
  quiz: [
    {
      question: `用 ${texInline("x^2+1")} 除 ${texInline("x^3+x^2+x+1")}，商和余式是什么？`,
      answer: `商 ${texInline("x+1")}，余式 0，所以 ${texInline("x^2+1\\mid x^3+x^2+x+1")}。`,
    },
    {
      question: "为什么长除法一定在有限步内结束？",
      answer: "每一步余式的次数都严格下降，而次数是非负整数。",
    },
    {
      question: `非零常数 ${texInline("c")} 整除哪些多项式？`,
      answer: `整除所有多项式，因为 ${texInline("f=c\\cdot(c^{-1}f)")}。`,
    },
    {
      question: `若 ${texInline("h\\mid f")} 且 ${texInline("h\\mid g")}，${texInline("h")} 是否整除 ${texInline("f-qg")}？`,
      answer: `是，${texInline("f-qg")} 是 ${texInline("f,g")} 的组合。这正是下一节辗转相除法的依据。`,
    },
  ],
  summary: [
    `${texInline("g\\ne0")} 时，存在唯一的 ${texInline("q,r")} 使 ${texInline("f=qg+r")}，其中 ${texInline("r=0")} 或 ${texInline("\\deg r<\\deg g")}。`,
    `${texInline("g\\mid f")} 当且仅当余式为 0。`,
    "非零常数整除一切多项式；互相整除的两个多项式只差一个非零常数因子。",
  ],
});
