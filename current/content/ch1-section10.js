defineChapter1Section("multivariate-polynomials", {
  number: "§10",
  textbookSection: "多元多项式",
  title: "多元多项式",
  navTitle: "多元多项式",
  question: "有多个变量时，多项式的各项怎样排列？次数怎样定义？",
  goal: `理解 ${texInline("n")} 元多项式、次数与字典排列法；掌握齐次多项式与齐次成分。`,
  tags: ["多元多项式", "次数", "齐次成分"],
  intro: `单项式 ${texInline("a\\,x_1^{k_1}\\cdots x_n^{k_n}")} 的次数是 ${texInline("k_1+\\cdots+k_n")}；多项式的次数是系数非零的各项次数的最大值。两个变量时，把 ${texInline("x^iy^j")} 放在格点 ${texInline("(i,j)")} 上：同类项落在同一点，单项式相乘就是指数向量相加。`,
  textbook: {
    reference: "北大版《高等代数》第一章 §10",
    items: [`${texInline("n")} 元多项式与次数`, "字典排列法", "齐次多项式"],
  },
  formal: {
    title: "次数与齐次成分",
    equation: "x^iy^j\\cdot x^ky^\\ell=x^{i+k}y^{j+\\ell}",
    definitions: [
      {
        title: "同类项与次数",
        text: `指数完全相同的单项式是同类项。${texInline("x^3y^2+x^2y^5")} 的次数是 7；关于 ${texInline("x")} 的次数是 3，关于 ${texInline("y")} 的次数是 5。`,
      },
      {
        title: "齐次成分",
        text: `各项次数都等于 ${texInline("m")} 的多项式叫 ${texInline("m")} 次齐次多项式。每个多项式都能唯一写成 ${texInline("f=f_0+f_1+\\cdots+f_d")}，${texInline("f_i")} 是 ${texInline("i")} 次齐次成分。`,
      },
      {
        title: "字典排列法",
        text: `先比 ${texInline("x_1")} 的指数，相同再比 ${texInline("x_2")} 的指数……从大到小排列，第一项叫首项。两个非零多项式乘积的首项等于首项之积，所以乘积不为零。`,
      },
    ],
    pitfalls: [
      "把某一个变量的次数当成多项式的次数。",
      "把字典序的首项当成次数最高的项：它们可以不同。",
    ],
    note: "对称多项式：交换变量后不变的多项式。",
  },
  interactive: {
    type: "slot",
    title: "指数格点",
    description: "点击格点读取单项式，按次数分层，观察乘法。",
    task: `点击格点读出单项式和它的次数，按 ${texInline("d=0,1,2,3")} 查看齐次成分；先猜一猜，再切到“乘法合成”，看两个指数向量首尾相接落在哪一点。`,
  },
  example: {
    title: "例题：次数与齐次成分",
    question: `对 ${texInline("f=x^3+2x^2y-xy^2+4y^3+x-1")}，求次数并写出各齐次成分。`,
    choices: [
      {
        correct: true,
        text: `次数为 3；${texInline("f_3=x^3+2x^2y-xy^2+4y^3")}，${texInline("f_2=0")}，${texInline("f_1=x")}，${texInline("f_0=-1")}。`,
      },
      { text: `次数为 6，因为 ${texInline("x^3")} 与 ${texInline("y^3")} 的指数相加。` },
      { text: `${texInline("f_3=x^3+4y^3")}，交叉项不属于三次齐次成分。` },
      { text: "多元多项式没有次数。" },
    ],
    steps: [
      "逐项求次数：3、3、3、3、1、0，最大为 3。",
      `次数为 3 的四项组成 ${texInline("f_3")}；没有 2 次项，${texInline("f_2=0")}。`,
      `${texInline("f_1=x")}，${texInline("f_0=-1")}。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("(x+y+z)^3")} 中 ${texInline("x^2y")} 的系数是多少？`,
      answer: `3。三个因子中选两个出 ${texInline("x")}、一个出 ${texInline("y")}，有 3 种选法。`,
    },
    {
      question: `按字典序（${texInline("x")} 先于 ${texInline("y")}），${texInline("xy^5+x^3y^2-y")} 的首项和次数各是什么？`,
      answer: `首项是 ${texInline("x^3y^2")}（${texInline("x")} 的指数最大），次数是 6（来自 ${texInline("xy^5")}）。`,
    },
    {
      question: "两个非零的 2 次齐次多项式之积是什么？",
      answer: "4 次齐次多项式：每一项都是两个 2 次单项式之积。",
    },
    {
      question: `${texInline("x^2y")} 与 ${texInline("xy^2")} 是同类项吗？`,
      answer: `不是，指数向量分别是 ${texInline("(2,1)")} 与 ${texInline("(1,2)")}。`,
    },
  ],
  summary: [
    "多元单项式由指数向量确定，次数是各指数之和。",
    "单项式相乘，指数向量相加；按次数分组得到唯一的齐次成分。",
    "字典排列法下，非零多项式乘积的首项等于首项之积。",
  ],
});
