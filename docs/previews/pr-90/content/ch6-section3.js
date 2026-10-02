defineChapter6Section("basis-coordinates", {
  number: "§3",
  textbookSection: "维数·基与坐标",
  title: "维数·基与坐标",
  navTitle: "维数·基与坐标",
  question: "选定一组基以后，抽象向量怎样变成一列数？这列数为什么唯一？",
  goal: "理解基、维数与坐标；会把多项式、矩阵的线性相关问题转化为坐标的线性相关问题；会求向量在给定基下的坐标。",
  tags: ["基", "维数", "坐标", "有限维", "无限维"],
  intro:
    `在 ${texInline(String.raw`P[x]_3`)} 中取基 ${texInline(String.raw`1,x,x^2`)}，多项式 ${texInline(String.raw`a_0+a_1x+a_2x^2`)} 就对应三维空间中的点 ${texInline(String.raw`(a_0,a_1,a_2)`)}。坐标保持加法与数乘，所以多项式之间的线性关系，都能在坐标空间里直接看出来。`,
  concepts: [
    { label: "基", text: "线性无关、并且能线性表出空间中每个向量的有序向量组。" },
    { label: "坐标", text: "向量由一组基线性表出时唯一的系数组。" },
  ],
  textbook: { reference: "北大版《高等代数》第六章 §3", items: ["线性无关与线性表出", "基与维数", "坐标", "有限维与无限维"] },
  interactive: { type: "slot", title: "多项式与它的坐标点" },
  lesson: {
    blocks: [
      {
        title: "基与维数",
        tex: String.raw`V=L(\varepsilon_1,\dots,\varepsilon_n),\qquad \varepsilon_1,\dots,\varepsilon_n\ \text{线性无关}`,
        text: `这时 ${texInline("\\varepsilon_1,\\dots,\\varepsilon_n")} 是 ${texInline("V")} 的一组基，${texInline("\\dim V=n")}。${texInline("P[x]_n")} 有基 ${texInline("1,x,\\dots,x^{n-1}")}，维数 ${texInline("n")}；${texInline("P^{m\\times n}")} 有基 ${texInline("E_{ij}")}，维数 ${texInline("mn")}。有限个多项式的次数有上界，张不满全体多项式，所以 ${texInline("P[x]")} 是无限维的。`,
      },
      {
        title: "坐标",
        tex: String.raw`\alpha=a_1\varepsilon_1+a_2\varepsilon_2+\cdots+a_n\varepsilon_n\ \longleftrightarrow\ (a_1,a_2,\dots,a_n)`,
        text: "基线性无关，所以这种表法唯一，系数组称为 α 在这组基下的坐标。基是有序的：交换两个基向量，坐标的两个分量也随之交换。",
      },
      {
        title: "相关性可以在坐标里判断",
        tex: String.raw`k_1\alpha_1+\cdots+k_s\alpha_s=0\iff k_1X_1+\cdots+k_sX_s=0`,
        text: `${texInline("X_i")} 是 ${texInline("\\alpha_i")} 的坐标。坐标保持加法与数乘，所以一组向量线性相关，当且仅当它们的坐标向量线性相关。判断几个多项式或矩阵是否构成基，就化为求坐标矩阵的秩或行列式。`,
      },
    ],
    pitfalls: [
      "维数与“看起来有几个数”不同：2 阶实对称矩阵有 4 个元素，所成空间的维数是 3。",
      "坐标依赖于基和基的顺序，离开基谈坐标没有意义。",
      "三个多项式两两不成比例，仍可能线性相关：实验中预设的三条曲线就是例子。",
    ],
  },
  example: {
    title: "例题：判断基并求坐标",
    question: `${texInline("1+x,\\ x+x^2,\\ 1+x^2")} 是 ${texInline("P[x]_3")} 的一组基吗？若是，求 ${texInline("2+3x+x^2")} 在这组基下的坐标。`,
    choices: [
      { text: `不是基，因为 ${texInline("1+x^2")} 能由前两个表出。` },
      { text: `是基，坐标为 ${texInline("(1,1,1)")}。` },
      { text: `是基，坐标为 ${texInline("(2,3,1)")}。` },
      { correct: true, text: `是基，坐标为 ${texInline("(2,1,0)")}。` },
    ],
    steps: [
      `在基 ${texInline("1,x,x^2")} 下，三个多项式的坐标是 ${texInline("(1,1,0),(0,1,1),(1,0,1)")}，坐标矩阵的行列式为 ${texInline("2\\ne0")}，三者线性无关；${texInline("\\dim P[x]_3=3")}，所以它们是一组基。`,
      `设 ${texInline("2+3x+x^2=a(1+x)+b(x+x^2)+c(1+x^2)")}，比较系数：${texInline("a+c=2,\\ a+b=3,\\ b+c=1")}。`,
      `三式相加得 ${texInline("a+b+c=3")}，于是 ${texInline("a=2,\\ b=1,\\ c=0")}。`,
      `验证：${texInline("2(1+x)+(x+x^2)=2+3x+x^2")}。新坐标 ${texInline("(2,1,0)")} 与它在 ${texInline("1,x,x^2")} 下的坐标 ${texInline("(2,3,1)")} 不同。`,
    ],
  },
  quiz: [
    {
      question: "2 阶实对称矩阵构成的空间维数是多少？",
      answer: `3。基可取 ${texInline("E_{11},\\ E_{22},\\ E_{12}+E_{21}")}：对称矩阵由两个对角元和一个非对角元决定。`,
    },
    {
      question: `${texInline("\\mathbb C")} 看成 ${texInline("\\mathbb R")} 上的线性空间和看成 ${texInline("\\mathbb C")} 上的线性空间，维数分别是多少？`,
      answer: `2 和 1。在 ${texInline("\\mathbb R")} 上可取基 ${texInline("1,\\mathrm i")}；在 ${texInline("\\mathbb C")} 上任何一个非零复数单独构成基。`,
    },
    {
      question: `为什么全体多项式 ${texInline("P[x]")} 没有有限的基？`,
      answer: `任取有限个多项式，设最高次数为 ${texInline("m")}，它们的线性组合次数都不超过 ${texInline("m")}，表不出 ${texInline("x^{m+1}")}。`,
    },
    {
      question: `实验中把 ${texInline("p_3")} 的坐标点拖到 ${texInline("(-1,-\\tfrac12,-\\tfrac12)")}，三个多项式还是基吗？`,
      answer: `不是。${texInline("(-1,-\\tfrac12,-\\tfrac12)=(1,0,2)-\\tfrac12(4,1,5)")}，即 ${texInline("p_3=p_1-\\tfrac12p_2")}，三个坐标点与原点共面。`,
    },
  ],
  summary: [
    "基 = 线性无关 + 能表出全部向量；维数是基所含向量的个数。",
    "取定有序基，每个向量对应唯一的坐标，并且坐标保持运算。",
    "抽象向量的线性相关，归结为坐标的线性相关。",
  ],
});
