defineChapter1Section("factorization-theorem", {
  number: "§5",
  textbookSection: "因式分解定理",
  title: "因式分解定理",
  navTitle: "因式分解定理",
  question: "多项式能否拆成不能再拆的因式之积？换一种拆法，结果会不会不同？",
  goal: "理解不可约多项式；掌握因式分解及唯一性定理和标准分解式。",
  tags: ["不可约", "因式分解", "唯一性"],
  intro: `次数 ${texInline("\\ge1")} 的多项式如果不能写成两个次数更低的多项式之积，就叫不可约。每个次数 ${texInline("\\ge1")} 的多项式都能分解成不可约多项式之积；除去因式的顺序和非零常数倍，分解是唯一的。`,
  textbook: {
    reference: "北大版《高等代数》第一章 §5",
    items: ["不可约多项式", "因式分解及唯一性定理", "标准分解式"],
  },
  formal: {
    title: "因式分解及唯一性",
    equation: "f(x)=c\\,p_1(x)^{r_1}p_2(x)^{r_2}\\cdots p_s(x)^{r_s}",
    definitions: [
      {
        title: "不可约多项式",
        text: `数域 ${texInline("P")} 上次数 ${texInline("\\ge1")} 的多项式 ${texInline("p")}，若不能写成 ${texInline("P")} 上两个次数都比 ${texInline("p")} 低的多项式之积，就称 ${texInline("p")} 在 ${texInline("P")} 上不可约。一次多项式都不可约。`,
      },
      {
        title: "关键性质",
        text: `若 ${texInline("p")} 不可约且 ${texInline("p\\mid fg")}，则 ${texInline("p\\mid f")} 或 ${texInline("p\\mid g")}。因为 ${texInline("p\\nmid f")} 时 ${texInline("\\gcd(p,f)=1")}，由上一节得 ${texInline("p\\mid g")}。唯一性由这条性质推出。`,
      },
      {
        title: "标准分解式",
        text: `上式中 ${texInline("c")} 是 ${texInline("f")} 的首项系数，${texInline("p_1,\\ldots,p_s")} 是互不相同的首一不可约多项式，${texInline("r_i")} 是正整数。`,
      },
    ],
    pitfalls: [
      `不说数域就判断不可约：${texInline("x^2+1")} 在 ${texInline("\\mathbb{R}")} 上不可约，在 ${texInline("\\mathbb{C}")} 上等于 ${texInline("(x-i)(x+i)")}。`,
      `用“没有根”判断高次多项式不可约：${texInline("x^4+4")} 没有实根，却等于 ${texInline("(x^2-2x+2)(x^2+2x+2)")}。`,
    ],
    note: `重因式：标准分解式中 ${texInline("r_i>1")} 的因式。`,
  },
  interactive: false,
  example: {
    title: "例题：在 Q、R、C 上分解 x⁴+4",
    question: `分别在 ${texInline("\\mathbb{Q}")}、${texInline("\\mathbb{R}")}、${texInline("\\mathbb{C}")} 上写出 ${texInline("x^4+4")} 的标准分解式。`,
    choices: [
      {
        correct: true,
        text: `在 ${texInline("\\mathbb{Q}")}、${texInline("\\mathbb{R}")} 上为 ${texInline("(x^2-2x+2)(x^2+2x+2)")}；在 ${texInline("\\mathbb{C}")} 上为 ${texInline("(x-1-i)(x-1+i)\\allowbreak(x+1-i)(x+1+i)")}。`,
      },
      { text: "三个数域上的分解完全相同。" },
      { text: `${texInline("x^4+4")} 没有实根，所以在 ${texInline("\\mathbb{R}")} 上不可约。` },
      { text: `在 ${texInline("\\mathbb{R}")} 上可以拆成四个一次因式。` },
    ],
    steps: [
      `配方：${texInline("x^4+4=(x^2+2)^2-(2x)^2=(x^2-2x+2)(x^2+2x+2)")}。`,
      `两个二次式的判别式都是 ${texInline("4-8=-4<0")}，没有实根，所以在 ${texInline("\\mathbb{R}")} 上（从而在 ${texInline("\\mathbb{Q}")} 上）不可约。`,
      `在 ${texInline("\\mathbb{C}")} 上，${texInline("x^2-2x+2")} 的根为 ${texInline("1\\pm i")}，${texInline("x^2+2x+2")} 的根为 ${texInline("-1\\pm i")}。`,
      "于是在复数域上得到四个一次因式。",
    ],
  },
  quiz: [
    {
      question: `写出 ${texInline("x^4-1")} 在 ${texInline("\\mathbb{R}")} 与 ${texInline("\\mathbb{C}")} 上的标准分解式。`,
      answer: `${texInline("\\mathbb{R}")}：${texInline("(x-1)(x+1)(x^2+1)")}；${texInline("\\mathbb{C}")}：${texInline("(x-1)(x+1)(x-i)(x+i)")}。`,
    },
    {
      question: `2 次或 3 次多项式在 ${texInline("P")} 上可约，当且仅当什么？`,
      answer: `它在 ${texInline("P")} 中有根。可约时必有一次因式，一次因式给出根；反之有根就有一次因式。`,
    },
    {
      question: `${texInline("p")} 不可约，${texInline("f")} 任意。${texInline("\\gcd(p,f)")} 可能是什么？`,
      answer: `只能是 1 或 ${texInline("p")} 的首一化：前者 ${texInline("p,f")} 互素，后者 ${texInline("p\\mid f")}。`,
    },
    {
      question: "为什么一次多项式总是不可约？",
      answer: "若它等于两个次数都比 1 低的多项式之积，这两个因式都是零次的，乘积也是零次，矛盾。",
    },
  ],
  summary: [
    "次数不小于 1 的多项式都能分解成不可约多项式之积，除顺序和常数倍外唯一。",
    `唯一性的关键：不可约的 ${texInline("p")} 整除 ${texInline("fg")} 时，必整除其中一个。`,
    "不可约与否取决于数域；高次多项式没有根也可能可约。",
  ],
});
