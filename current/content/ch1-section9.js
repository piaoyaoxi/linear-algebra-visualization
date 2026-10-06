defineChapter1Section("rational-polynomials", {
  number: "§9",
  textbookSection: "有理系数多项式",
  title: "有理系数多项式",
  navTitle: "有理系数",
  question: "怎样找出有理系数多项式的有理根？怎样证明它在有理数域上不可约？",
  goal: "理解本原多项式与高斯引理；掌握有理根的求法和艾森斯坦判别法。",
  tags: ["本原多项式", "有理根", "艾森斯坦判别法"],
  intro: `有理系数多项式乘上适当的整数就成为整系数多项式，可约性不变。系数互素的整系数多项式叫本原多项式。由高斯引理，整系数多项式若能分解成两个次数更低的有理系数多项式之积，也能分解成两个次数更低的整系数多项式之积。`,
  textbook: {
    reference: "北大版《高等代数》第一章 §9",
    items: ["本原多项式与高斯引理", "有理根", "艾森斯坦判别法"],
  },
  formal: {
    title: "有理根与不可约判别",
    equation: "\\begin{gathered}\\tfrac rs\\ \\text{是}\\ a_nx^n+\\cdots+a_0\\ \\text{的根},\\quad\\gcd(r,s)=1\\\\ \\Longrightarrow\\quad s\\mid a_n,\\quad r\\mid a_0\\end{gathered}",
    definitions: [
      {
        title: "高斯引理",
        text: "两个本原多项式的乘积仍是本原多项式。",
      },
      {
        title: "有理根",
        text: `整系数多项式的有理根 ${texInline("r/s")}（既约）满足上式，所以候选只有有限个，逐个代入检验即可。`,
      },
      {
        title: "艾森斯坦判别法",
        text: `整系数 ${texInline("f=a_nx^n+\\cdots+a_0")}，若有素数 ${texInline("p")} 使 ${texInline("p\\nmid a_n")}，${texInline("p")} 整除 ${texInline("a_{n-1},\\ldots,a_0")}，且 ${texInline("p^2\\nmid a_0")}，则 ${texInline("f")} 在有理数域上不可约。条件不满足时，不能由此断定可约。`,
      },
    ],
    pitfalls: [
      `没有有理根就断言不可约：这只对 2、3 次成立；${texInline("x^4+4")} 没有有理根，却可约。`,
      "列有理根候选时漏掉负数。",
    ],
    note: "多元多项式：多个变量的单项式、次数与齐次成分。",
  },
  interactive: false,
  example: {
    title: "例题：艾森斯坦判别法与有理根",
    question: `(1) 证明 ${texInline("x^5+10x+5")} 在 ${texInline("\\mathbb{Q}")} 上不可约。(2) 列出 ${texInline("2x^3+x^2-x-1")} 的全部有理根候选，并判断它在 ${texInline("\\mathbb{Q}")} 上是否可约。`,
    choices: [
      {
        correct: true,
        text: `(1) 取 ${texInline("p=5")} 用艾森斯坦判别法；(2) 候选为 ${texInline("\\pm1,\\pm\\frac12")}，都不是根，它是三次的，所以在 ${texInline("\\mathbb{Q}")} 上不可约。`,
      },
      { text: "(1) 没有整数根，所以不可约；(2) 候选只有 ±1。" },
      { text: `(1) 应取 ${texInline("p=2")}；(2) 候选为 ${texInline("\\pm2")}。` },
      { text: "(2) 有理根候选只由常数项决定，与首项系数无关。" },
    ],
    steps: [
      `(1) ${texInline("5\\nmid1")}；5 整除 0、0、0、10、5；${texInline("25\\nmid5")}。艾森斯坦判别法的条件成立，不可约。`,
      `(2) 既约根 ${texInline("r/s")} 满足 ${texInline("r\\mid-1")}、${texInline("s\\mid2")}，候选为 ${texInline("\\pm1,\\pm\\frac12")}。`,
      `代入：${texInline("f(1)=1,\\ f(-1)=-1,\\ f(\\tfrac12)=-1,\\ f(-\\tfrac12)=-\\tfrac12")}，都不为 0。`,
      "三次多项式若可约必有一次因式，从而有有理根；这里没有，所以不可约。",
    ],
  },
  quiz: [
    {
      question: `${texInline("x^3-2")} 在 ${texInline("\\mathbb{Q}")} 上可约吗？`,
      answer: `不可约。取 ${texInline("p=2")} 满足艾森斯坦判别法的条件（也可以验证它没有有理根）。`,
    },
    {
      question: `求 ${texInline("2x^3-3x^2+1")} 的有理根。`,
      answer: `候选为 ${texInline("\\pm1,\\pm\\frac12")}；代入得根 ${texInline("1")}（二重）和 ${texInline("-\\frac12")}，即 ${texInline("2x^3-3x^2+1=(x-1)^2(2x+1)")}。`,
    },
    {
      question: "为什么没有有理根的三次有理系数多项式在有理数域上不可约？",
      answer: "若可约，两个因式中必有一个是一次的，它给出一个有理根。",
    },
    {
      question: `${texInline("x^4+1")} 能直接用艾森斯坦判别法吗？`,
      answer: `不能直接用。令 ${texInline("x=y+1")}，得 ${texInline("y^4+4y^3+6y^2+4y+2")}，对 ${texInline("p=2")} 满足条件，所以 ${texInline("x^4+1")} 在 ${texInline("\\mathbb{Q}")} 上不可约。`,
    },
  ],
  summary: [
    "有理系数的分解问题可以化为整系数问题，高斯引理保证可约性不变。",
    `有理根 ${texInline("r/s")} 满足 ${texInline("s\\mid a_n")}、${texInline("r\\mid a_0")}，候选要逐个检验。`,
    "艾森斯坦判别法给出不可约的充分条件；条件不满足时不能断定可约。",
  ],
});
