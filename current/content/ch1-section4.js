defineChapter1Section("gcd-polynomials", {
  number: "§4",
  textbookSection: "最大公因式",
  title: "最大公因式",
  navTitle: "最大公因式",
  question: "不分解因式，怎样求两个多项式的最大公因式？",
  goal: `掌握用辗转相除法求首一最大公因式，会写出 ${texInline("sf+tg=\\gcd(f,g)")}；理解互素的判定。`,
  tags: ["最大公因式", "辗转相除法", "互素"],
  intro: `若 ${texInline("f=qg+r")}，则 ${texInline("f,g")} 的公因式与 ${texInline("g,r")} 的公因式完全相同。于是反复做带余除法，余式次数不断下降，最后一个非零余式首一化后就是最大公因式。这就是辗转相除法。`,
  textbook: {
    reference: "北大版《高等代数》第一章 §4",
    items: ["最大公因式", "辗转相除法", "互素"],
  },
  formal: {
    title: "辗转相除法",
    equation: "f=qg+r\\ \\Longrightarrow\\ \\gcd(f,g)=\\gcd(g,r)",
    definitions: [
      {
        title: "最大公因式",
        text: `${texInline("d")} 是 ${texInline("f,g")} 的公因式，并且 ${texInline("f,g")} 的每个公因式都整除 ${texInline("d")}。首项系数为 1 的那个记作 ${texInline("\\gcd(f,g)")}。`,
      },
      {
        title: "线性组合表示",
        text: `存在 ${texInline("s,t\\in P[x]")} 使 ${texInline("sf+tg=\\gcd(f,g)")}。把辗转相除的各步倒着代回，就能求出一组 ${texInline("s,t")}。`,
      },
      {
        title: "互素",
        text: `${texInline("\\gcd(f,g)=1")} 时称 ${texInline("f,g")} 互素，这等价于存在 ${texInline("s,t")} 使 ${texInline("sf+tg=1")}。互素时，若 ${texInline("f\\mid gh")}，则 ${texInline("f\\mid h")}。`,
      },
    ],
    pitfalls: [
      "把次数较低的那个多项式直接当作最大公因式。",
      "忘记把最后的非零余式化成首一。",
      `认为 ${texInline("s,t")} 唯一：满足 ${texInline("sf+tg=\\gcd(f,g)")} 的 ${texInline("s,t")} 有无穷多组。`,
    ],
    note: "因式分解定理：不可约多项式与唯一分解。",
  },
  interactive: {
    type: "slot",
    title: "辗转相除法",
    description: "逐步取余，最后读出最大公因式和 s、t。",
    task: "先预测，再逐步做完 gcd(x⁴−1, x³−1)：看余式次数阶梯降到 0 多项式时，前一个余式是什么；最后读出 s、t 并代回验证，再换到“互素示例”比较。",
  },
  example: {
    title: "例题：求最大公因式并写成组合",
    question: `求 ${texInline("\\gcd(x^4-1,x^3-1)")}，并写出一组 ${texInline("s,t")} 使 ${texInline("s(x^4-1)+t(x^3-1)=\\gcd(x^4-1,x^3-1)")}。`,
    choices: [
      { correct: true, text: `${texInline("\\gcd=x-1")}，可取 ${texInline("s=1,\\ t=-x")}。` },
      { text: `${texInline("\\gcd=x^3-1")}，因为它的次数较低。` },
      { text: `${texInline("\\gcd=1")}，两个多项式互素。` },
      { text: `${texInline("\\gcd=x^2-1")}，因为 ${texInline("x^4-1=(x^2-1)(x^2+1)")}。` },
    ],
    steps: [
      `${texInline("x^4-1=x(x^3-1)+(x-1)")}。`,
      `${texInline("x^3-1=(x^2+x+1)(x-1)")}，余式为 0。`,
      `最后的非零余式 ${texInline("x-1")} 已首一，所以 ${texInline("\\gcd=x-1")}。`,
      `由第一步，${texInline("x-1=1\\cdot(x^4-1)+(-x)(x^3-1)")}，即 ${texInline("s=1,\\ t=-x")}。`,
    ],
  },
  quiz: [
    {
      question: `求 ${texInline("\\gcd(x^2-1,\\ x^2-3x+2)")}。`,
      answer: `${texInline("x-1")}。两式相减得 ${texInline("3x-3")}，而 ${texInline("x-1")} 整除两者。`,
    },
    {
      question: `为什么 ${texInline("f=qg+r")} 时 ${texInline("\\gcd(f,g)=\\gcd(g,r)")}？`,
      answer: `整除 ${texInline("f,g")} 的多项式整除 ${texInline("r=f-qg")}；整除 ${texInline("g,r")} 的多项式整除 ${texInline("f=qg+r")}。两组公因式相同。`,
    },
    {
      question: "两个互素的多项式能有公共根吗？",
      answer: `不能。若 ${texInline("f(a)=g(a)=0")}，代入 ${texInline("sf+tg=1")} 得 ${texInline("0=1")}。`,
    },
    {
      question: `${texInline("f\\ne0")} 时，${texInline("\\gcd(f,0)")} 是什么？`,
      answer: `${texInline("f")} 除以它的首项系数所得的首一多项式。`,
    },
  ],
  summary: [
    "辗转相除：公因式在每一步不变，最后的非零余式首一化就是最大公因式。",
    `倒着代回得到 ${texInline("sf+tg=\\gcd(f,g)")}。`,
    `${texInline("f,g")} 互素当且仅当存在 ${texInline("s,t")} 使 ${texInline("sf+tg=1")}。`,
  ],
});
