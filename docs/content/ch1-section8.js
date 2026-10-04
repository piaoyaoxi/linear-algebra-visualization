defineChapter1Section("complex-real-factorization", {
  number: "§8",
  textbookSection: "复系数与实系数多项式的因式分解",
  title: "复系数与实系数多项式的因式分解",
  navTitle: "实复因式分解",
  question: "为什么复系数多项式总能拆成一次因式？实系数多项式的虚根为什么成对出现？",
  goal: "理解代数基本定理与复系数多项式的分解；掌握实系数多项式的共轭根性质与实数域上的分解。",
  tags: ["代数基本定理", "共轭根", "实二次因式"],
  intro: `代数基本定理：每个次数 ${texInline("\\ge1")} 的复系数多项式在 ${texInline("\\mathbb{C}")} 中至少有一个根。反复提出一次因式，复系数多项式就分解为一次因式之积。系数都是实数时，${texInline("f(\\bar z)=\\overline{f(z)}")}，所以虚根 ${texInline("\\alpha")} 与 ${texInline("\\bar\\alpha")} 成对出现，合成一个实系数二次因式。`,
  textbook: {
    reference: "北大版《高等代数》第一章 §8",
    items: ["代数基本定理", "复系数多项式的分解", "实系数多项式的分解"],
  },
  formal: {
    title: "共轭根与实二次因式",
    equation: "\\begin{aligned}&\\bigl(x-(a+bi)\\bigr)\\bigl(x-(a-bi)\\bigr)\\\\ &\\quad=x^2-2ax+a^2+b^2\\end{aligned}",
    definitions: [
      {
        title: "复数域上的分解",
        text: `次数 ${texInline("n\\ge1")} 的复系数多项式可写成 ${texInline("f=a_n(x-\\alpha_1)\\cdots(x-\\alpha_n)")}，${texInline("\\alpha_i")} 可以相同。复数域上的不可约多项式只有一次式。`,
      },
      {
        title: "共轭根",
        text: `实系数多项式若有虚根 ${texInline("\\alpha")}，则 ${texInline("\\bar\\alpha")} 也是根，且重数相同。上式中 ${texInline("b\\ne0")} 时判别式为 ${texInline("-4b^2<0")}。`,
      },
      {
        title: "实数域上的分解",
        text: "实数域上的不可约多项式只有一次式和判别式小于 0 的二次式；每个实系数多项式都能分解成这两类因式之积。",
      },
    ],
    pitfalls: [
      `以为实系数多项式只有实根：${texInline("x^2+1")} 的根是 ${texInline("\\pm i")}。`,
      `构造实系数多项式时只放一个虚根：${texInline("\\alpha")} 是根时 ${texInline("\\bar\\alpha")} 必须同时出现。`,
    ],
    note: "有理系数多项式：有理根与 Eisenstein 判别法。",
  },
  interactive: {
    type: "slot",
    title: "共轭根",
    description: "在复平面上拖动根，观察二次因式的系数。",
    task: `先猜一猜，再拖动 β：β 在紫色水平虚线上时根之和是实数，在过原点、方向为 ${texInline("\\bar\\alpha")} 的绿线上时根之积是实数。最后切到“实系数：共轭锁”拖动 α。`,
  },
  example: {
    title: "例题：由虚根写出实因式",
    question: `实系数多项式以 ${texInline("1+2i")} 为 3 重根。它还必须有哪个根？写出由这些根给出的次数最低的实系数首一因式。`,
    choices: [
      { correct: true, text: `${texInline("1-2i")} 也是 3 重根；因式为 ${texInline("(x^2-2x+5)^3")}。` },
      { text: `${texInline("1-2i")} 只需出现一次；因式为 ${texInline("x^2-2x+5")}。` },
      { text: `实系数多项式不能有 ${texInline("1+2i")} 这个根。` },
      { text: `${texInline("(x-1)^3")} 已经是所需实因式。` },
    ],
    steps: [
      `实系数多项式的虚根成对出现，且重数相同，所以 ${texInline("1-2i")} 也是 3 重根。`,
      `${texInline("(x-(1+2i))(x-(1-2i))=x^2-2x+5")}。`,
      `每个一次因式出现 3 次，所以因式为 ${texInline("(x^2-2x+5)^3")}，次数为 6。`,
    ],
  },
  quiz: [
    {
      question: `以 ${texInline("2+i")} 为根的二次首一实系数多项式是什么？`,
      answer: `${texInline("x^2-4x+5")}。`,
    },
    {
      question: "奇数次实系数多项式一定有实根吗？",
      answer: "一定。虚根成对出现，个数（按重数计）是偶数，而根的总数是奇数。",
    },
    {
      question: `${texInline("x^4+1")} 在实数域上可约吗？`,
      answer: `可约：${texInline("x^4+1=(x^2+1)^2-2x^2=(x^2-\\sqrt2x+1)(x^2+\\sqrt2x+1)")}。`,
    },
    {
      question: "把共轭根的虚部拖到 0，二次因式变成什么？",
      answer: `两根重合于实轴上的 ${texInline("a")}，二次因式变成 ${texInline("(x-a)^2")}。`,
    },
  ],
  summary: [
    "复系数多项式能分解为一次因式之积。",
    "实系数多项式的虚根成共轭对出现，重数相同。",
    "实数域上的不可约多项式只有一次式和判别式小于 0 的二次式。",
  ],
});
