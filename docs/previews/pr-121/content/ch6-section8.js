defineChapter6Section("isomorphism", {
  number: "§8",
  textbookSection: "线性空间的同构",
  title: "线性空间的同构",
  navTitle: "同构",
  question: "外表不同的两个线性空间，什么时候具有完全相同的线性结构？",
  goal: "掌握同构映射的定义与基本性质；理解有限维线性空间同构当且仅当维数相同；会验证一个具体映射是否为同构。",
  tags: ["同构", "坐标映射", "维数"],
  intro:
    `同构是保持加法与数乘的双射，它把一个空间里的运算原样搬到另一个空间：${texInline(String.raw`p+q`)} 的像正好是 ${texInline(String.raw`p`)} 的像与 ${texInline(String.raw`q`)} 的像之和。取系数和取函数值，是 ${texInline(String.raw`P[x]_3`)} 到 ${texInline(String.raw`\mathbb R^3`)} 的两个不同同构。`,
  concepts: [
    { label: "同构映射", text: "保持加法与数乘的双射。" },
    { label: "维数定理", text: `数域 ${texInline("P")} 上有限维空间同构 ${texInline("\\Leftrightarrow")} 维数相同。` },
  ],
  textbook: { reference: "北大版《高等代数》第六章 §8", items: ["同构映射的定义", "坐标映射是同构", "同构的基本性质", "同构当且仅当维数相同"] },
  interactive: { type: "slot", title: "两张“坐标”，同一套运算" },
  lesson: {
    blocks: [
      {
        title: "同构映射",
        tex: String.raw`\sigma(\alpha+\beta)=\sigma(\alpha)+\sigma(\beta),\qquad \sigma(k\alpha)=k\sigma(\alpha)`,
        text: `数域 ${texInline("P")} 上线性空间 ${texInline("V")} 到 ${texInline("V'")} 的双射 ${texInline("\\sigma")} 满足上式时，称为同构映射，记 ${texInline("V\\cong V'")}。取定 ${texInline("V")} 的一组基，把向量对应到它的坐标，就是 ${texInline("V")} 到 ${texInline("P^n")} 的同构。`,
      },
      {
        title: "同构保持什么",
        text: `${texInline("\\sigma(0)=0")}，${texInline("\\sigma(-\\alpha)=-\\sigma(\\alpha)")}，${texInline("\\sigma")} 保持线性组合，因而把线性相关组映成线性相关组、线性无关组映成线性无关组，把子空间映成同维数的子空间。同构的逆映射与两个同构的乘积仍是同构。`,
      },
      {
        title: "维数决定同构",
        tex: String.raw`V\cong V'\iff \dim V=\dim V'`,
        text: `对数域 ${texInline("P")} 上的有限维空间成立。所以 ${texInline("P[x]_4")}、${texInline("P^{2\\times2}")} 与 ${texInline("P^4")} 两两同构。`,
      },
    ],
    pitfalls: [
      "同构不意味着元素相同：多项式和数组是不同的对象，只是运算结构一致。",
      `同构一般不唯一：取系数和取函数值都给出 ${texInline("P[x]_3\\cong\\mathbb R^3")}。`,
      `比较维数要在同一个数域上：${texInline("\\mathbb C")} 看成 ${texInline("\\mathbb R")} 上的空间时维数是 2，与 ${texInline("\\mathbb R^2")} 同构。`,
    ],
  },
  example: {
    title: "例题：取值映射是同构吗",
    question: `${texInline("T:P[x]_3\\to\\mathbb R^3")}，${texInline("T(p)=(p(0),p(1),p(2))")}。${texInline("T")} 是同构吗？若是，求 ${texInline("T^{-1}(1,3,7)")}。`,
    choices: [
      { text: `不是同构，因为 ${texInline("T(p)")} 不是 ${texInline("p")} 的系数。` },
      { correct: true, text: `是同构，${texInline("T^{-1}(1,3,7)=1+x+x^2")}。` },
      { text: `是同构，${texInline("T^{-1}(1,3,7)=1+3x+7x^2")}。` },
      { text: `是同构，${texInline("T^{-1}(1,3,7)=1+2x")}。` },
    ],
    steps: [
      `线性：${texInline("(p+q)(k)=p(k)+q(k)")}，${texInline("(cp)(k)=cp(k)")}。`,
      `单射：${texInline("T(p)=0")} 说明次数小于 3 的 ${texInline("p")} 有 0、1、2 三个根，只能 ${texInline("p=0")}。`,
      `满射：任给 ${texInline("(y_0,y_1,y_2)")}，插值多项式 ${texInline("y_0+(y_1-y_0)x+\\tfrac{y_2-2y_1+y_0}{2}x(x-1)")} 在 0、1、2 处恰好取这三个值。所以 ${texInline("T")} 是同构。`,
      `设 ${texInline("p=a+bx+cx^2")}：${texInline("a=1,\\ a+b+c=3,\\ a+2b+4c=7")}，解得 ${texInline("b=c=1")}。验证 ${texInline("p(2)=1+2+4=7")}；${texInline("1+2x")} 在 2 处的值是 5。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("\\mathbb R^{2\\times2}")} 与 ${texInline("P[x]_4")} 同构吗？`,
      answer: `同构，二者都是 ${texInline("\\mathbb R")} 上的 4 维空间。例如把 ${texInline("\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}")} 对应到 ${texInline("a+bx+cx^2+dx^3")}。`,
    },
    {
      question: `§2 例题中的 ${texInline("(\\mathbb R^+,\\oplus,\\circ)")} 与 ${texInline("\\mathbb R")} 之间有什么同构？`,
      answer: `${texInline("\\ln")}：${texInline("\\ln(ab)=\\ln a+\\ln b")}，${texInline("\\ln(a^k)=k\\ln a")}，并且 ${texInline("\\ln")} 是 ${texInline("\\mathbb R^+")} 到 ${texInline("\\mathbb R")} 的双射。`,
    },
    {
      question: `求导 ${texInline("D:P[x]_4\\to P[x]_4")} 为什么不是同构？`,
      answer: `${texInline("D(1)=D(2)=0")}，${texInline("D")} 不是单射；它的像只是 ${texInline("P[x]_3")}，也不是满射。`,
    },
    {
      question: `${texInline("\\sigma")} 是同构，${texInline("\\sigma(\\alpha_1),\\sigma(\\alpha_2),\\sigma(\\alpha_3)")} 线性相关。${texInline("\\alpha_1,\\alpha_2,\\alpha_3")} 呢？`,
      answer: `也线性相关：${texInline("\\sigma^{-1}")} 也是同构，把相关组映成相关组。`,
    },
  ],
  summary: [
    "同构 = 保持加法与数乘的双射。",
    `有限维空间同构当且仅当维数相同；坐标映射给出 ${texInline(String.raw`V\cong P^n`)}。`,
    "同构不唯一，它保持一切由加法和数乘描述的性质。",
  ],
});
