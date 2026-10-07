defineChapter1Section("number-fields", {
  number: "§1",
  textbookSection: "数域",
  title: "数域",
  navTitle: "数域",
  question: "研究多项式之前，为什么要先说明系数取自哪个数域？",
  goal: `掌握数域的定义；会判断常见数集是否为数域；理解同一个多项式能否分解要看数域。`,
  tags: ["数域", "封闭性", "系数域"],
  intro: `数域是含 0 和 1、对加、减、乘、除（除数不为 0）都封闭的复数集合。多项式的系数、它的因式，以及“能不能再分解”，都要在指定的数域里讨论：${texInline("x^2-2")} 在 ${texInline("\\mathbb{Q}")} 上不能分解，在 ${texInline("\\mathbb{R}")} 上等于 ${texInline("(x-\\sqrt2)(x+\\sqrt2)")}。`,
  textbook: {
    reference: "北大版《高等代数》第一章 §1",
    items: ["数域的定义", "常见数域与反例"],
  },
  formal: {
    title: "数域的定义",
    equation: "\\mathbb{Q}\\subseteq P\\subseteq\\mathbb{C}\\qquad(P\\ \\text{为任意数域})",
    definitions: [
      {
        title: "数域",
        text: `设 ${texInline("P")} 是含 0 与 1 的复数集合。若 ${texInline("P")} 中任意两数的和、差、积、商（除数不为 0）仍属于 ${texInline("P")}，就称 ${texInline("P")} 为数域。`,
      },
      {
        title: `任何数域都含 ${texInline("\\mathbb{Q}")}`,
        text: `从 1 出发反复做加减，得到全体整数；再做除法，得到全体有理数。所以 ${texInline("\\mathbb{Q}")} 是最小的数域。`,
      },
      {
        title: `${texInline("\\mathbb{Q}(\\sqrt2)")} 是数域`,
        text: `${texInline("\\{a+b\\sqrt2:a,b\\in\\mathbb{Q}\\}")} 对加、减、乘显然封闭；非零元素的倒数 ${texInline("\\dfrac{a-b\\sqrt2}{a^2-2b^2}")} 仍是这种形式（${texInline("\\sqrt2")} 是无理数，故 ${texInline("a^2-2b^2\\ne0")}）。`,
      },
    ],
    pitfalls: [
      `只检查加法和乘法：${texInline("\\mathbb{Z}")} 对加、减、乘封闭，但 ${texInline("1\\div2\\notin\\mathbb{Z}")}。`,
      `不说数域就判断能否分解：${texInline("x^2+1")} 在 ${texInline("\\mathbb{R}")} 上不能分解，在 ${texInline("\\mathbb{C}")} 上等于 ${texInline("(x-i)(x+i)")}。`,
    ],
    note: "一元多项式：系数序列、运算与次数。",
  },
  interactive: false,
  example: {
    title: "例题：判断集合是否为数域",
    question: `判断下列集合是否为数域：${texInline("\\mathbb{Z}")}；${texInline("\\mathbb{Q}")}；${texInline("\\{a+b\\sqrt2:a,b\\in\\mathbb{Q}\\}")}；正实数集。`,
    choices: [
      {
        correct: true,
        text: `${texInline("\\mathbb{Z}")} 不是（除法不封闭）；${texInline("\\mathbb{Q}")} 是；${texInline("\\mathbb{Q}(\\sqrt2)")} 是；正实数集不是（不含 0）。`,
      },
      { text: "四个集合都是数域，因为都可以进行乘法和除法。" },
      { text: `${texInline("\\mathbb{Q}")} 不是数域，因为它不含 ${texInline("\\sqrt2")}。` },
      { text: "正实数集是数域，因为正数相除仍为正数。" },
    ],
    steps: [
      `正实数集不含 0，也不对减法封闭（${texInline("1-2=-1")}），不是数域。`,
      `${texInline("\\mathbb{Z}")} 对加、减、乘封闭，但 ${texInline("1/2\\notin\\mathbb{Z}")}，不是数域。`,
      `${texInline("\\mathbb{Q}")} 中两数的和、差、积、商（除数非零）仍是有理数，是数域。`,
      `${texInline("(a+b\\sqrt2)(c+d\\sqrt2)=(ac+2bd)+(ad+bc)\\sqrt2")}；非零元素的倒数为 ${texInline("\\dfrac{a-b\\sqrt2}{a^2-2b^2}")}，仍在集合中，所以 ${texInline("\\mathbb{Q}(\\sqrt2)")} 是数域。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("\\{a+bi:a,b\\in\\mathbb{Q}\\}")} 是数域吗？`,
      answer: `是。和、差、积仍是这种形式；非零元素的倒数 ${texInline("\\dfrac{a-bi}{a^2+b^2}")} 也在其中。`,
    },
    {
      question: `为什么任何数域 ${texInline("P")} 都包含 ${texInline("\\mathbb{Q}")}？`,
      answer: `${texInline("1\\in P")}，反复加减得到全体整数，再作除法得到全体有理数。`,
    },
    {
      question: `${texInline("x^2-\\sqrt2")} 是 ${texInline("\\mathbb{Q}")} 上的多项式吗？是 ${texInline("\\mathbb{Q}(\\sqrt2)")} 上的多项式吗？`,
      answer: `不是 ${texInline("\\mathbb{Q}")} 上的多项式（系数 ${texInline("-\\sqrt2")} 不是有理数）；是 ${texInline("\\mathbb{Q}(\\sqrt2)")} 上的多项式。`,
    },
    {
      question: `奇数集对乘法封闭，它是数域吗？`,
      answer: `不是：它不含 0，而且 ${texInline("1+1=2")} 不是奇数。`,
    },
  ],
  summary: [
    "数域含 0 和 1，对加、减、乘、除（除数非零）封闭；任何数域都包含有理数域。",
    "要说明一个集合不是数域，找出一个不封闭的运算实例即可。",
    "多项式的系数、因式和能否分解，都要相对于指定的数域来说。",
  ],
});
