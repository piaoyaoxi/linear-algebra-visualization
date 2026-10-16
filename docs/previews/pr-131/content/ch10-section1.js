defineChapter10Section("linear-functional", {
  number: "§1",
  textbookSection: "线性函数",
  title: "线性函数",
  navTitle: "线性函数",
  question: "线性函数怎样把每个向量读成一个数？",
  goal: `理解线性函数的定义，会由基上的值写出 ${texInline(String.raw`f(x)=a_1x_1+\cdots+a_nx_n`)}，知道非零线性函数的核是 ${texInline("n-1")} 维子空间，等值面彼此平行。`,
  tags: ["线性函数", "基上的值", "核", "等值线"],
  intro:
    `线性函数 ${texInline("f")} 把每个向量读成数域 ${texInline("P")} 中的一个数，并且保持加法与数乘。在平面上，${texInline("f")} 取同一个值的点排成一条直线，不同的值给出一族平行线。下面拖动向量 ${texInline("x")} 读出 ${texInline("f(x)")}，再看 ${texInline("f")} 在基上的两个值怎样决定整族直线。`,
  concepts: [
    { label: "线性函数", text: texInline(String.raw`f(k\alpha+l\beta)=kf(\alpha)+lf(\beta)`) },
    { label: "坐标表示", text: texInline(String.raw`f(x)=a_1x_1+\cdots+a_nx_n,\ a_i=f(\varepsilon_i)`) },
  ],
  textbook: { reference: "北大版《高等代数》第十章 §1", items: ["线性函数的定义与例", "线性函数由基上的值唯一决定"] },
  interactive: { type: "slot", title: "等值线读出 f(x)" },
  lesson3d: {
    blocks: [
      {
        title: "线性函数的定义",
        tex: String.raw`f:V\to P,\qquad f(k\alpha+l\beta)=kf(\alpha)+lf(\beta)`,
        text: `${texInline("V")} 是数域 ${texInline("P")} 上的线性空间。例如 ${texInline("P^n")} 上的 ${texInline(String.raw`a_1x_1+\cdots+a_nx_n`)}，${texInline("n")} 阶矩阵的迹 ${texInline(String.raw`\operatorname{tr}A`)}，${texInline("P[x]")} 上的 ${texInline("f(p)=p(t_0)")}。由定义 ${texInline("f(0)=0")}，并且 ${texInline("f")} 把线性组合读成读数的线性组合。`,
        ponder: {
          q: `${texInline("f(x_1,x_2)=x_1+x_2+1")} 是线性函数吗？`,
          a: `不是。${texInline(String.raw`f(0)=1\ne0`)}。它的等值线也彼此平行，但 ${texInline("f=0")} 的那一条不过原点。`,
        },
      },
      {
        title: "由基上的值唯一决定",
        tex: String.raw`f(x_1\varepsilon_1+\cdots+x_n\varepsilon_n)=a_1x_1+\cdots+a_nx_n,\qquad a_i=f(\varepsilon_i)`,
        text: `取定 ${texInline("V")} 的基 ${texInline(String.raw`\varepsilon_1,\dots,\varepsilon_n`)}，${texInline("f")} 由 ${texInline("n")} 个数 ${texInline(String.raw`f(\varepsilon_1),\dots,f(\varepsilon_n)`)} 完全决定。反过来，任给 ${texInline("P")} 中 ${texInline("n")} 个数 ${texInline(String.raw`a_1,\dots,a_n`)}，存在唯一的线性函数 ${texInline("f")} 使 ${texInline(String.raw`f(\varepsilon_i)=a_i`)}。`,
        ponder: {
          q: `${texInline("f")} 在一组基上的值全是 0，${texInline("f")} 是什么？`,
          a: `零函数：对一切 ${texInline("x")}，${texInline(String.raw`f(x)=0\cdot x_1+\cdots+0\cdot x_n=0`)}。`,
        },
      },
      {
        title: "核与等值面",
        tex: String.raw`\ker f=\{\alpha\in V\mid f(\alpha)=0\},\qquad \dim\ker f=n-1\quad(f\ne 0)`,
        text: `${texInline(String.raw`f\ne0`)} 时值域是整个 ${texInline("P")}，由维数公式得 ${texInline(String.raw`\dim\ker f=n-1`)}。取 ${texInline(String.raw`\alpha_0`)} 使 ${texInline(String.raw`f(\alpha_0)=c`)}，则 ${texInline("f=c")} 的全体向量恰好是 ${texInline(String.raw`\alpha_0+\ker f`)}。平面上 ${texInline(String.raw`\ker f`)} 是过原点的直线，其余等值线都与它平行。`,
        ponder: {
          q: `两个非零线性函数 ${texInline("f")}、${texInline("g")} 的核相同，它们有什么关系？`,
          a: `相差一个非零常数倍。取 ${texInline(String.raw`\alpha_0`)} 使 ${texInline(String.raw`f(\alpha_0)=1`)}，则 ${texInline(String.raw`V=L(\alpha_0)\oplus\ker f`)}，两边比较得 ${texInline(String.raw`g=g(\alpha_0)f`)}。`,
        },
      },
    ],
    pitfalls: [
      `把 ${texInline("a_1x_1+a_2x_2+b")}（${texInline(String.raw`b\ne0`)}）当成线性函数。线性函数必须满足 ${texInline("f(0)=0")}。`,
      `以为系数 ${texInline("a_i")} 只属于 ${texInline("f")}。${texInline(String.raw`a_i=f(\varepsilon_i)`)} 依赖所选的基，换一组基，同一个 ${texInline("f")} 的系数一般会变。`,
      `把直线 ${texInline("a_1x_1+a_2x_2=0")} 的方向当成 ${texInline("(a_1,a_2)")}。这条直线的方向是 ${texInline("(-a_2,a_1)")}。`,
    ],
  },
  example: {
    title: "例题：由基上的值求线性函数",
    question: `在 ${texInline("P^3")} 中取基 ${texInline(String.raw`\alpha_1=(1,1,0),\ \alpha_2=(0,1,1),\ \alpha_3=(1,0,1)`)}，线性函数 ${texInline("f")} 满足 ${texInline(String.raw`f(\alpha_1)=1,\ f(\alpha_2)=2,\ f(\alpha_3)=3`)}。${texInline(String.raw`f(x_1,x_2,x_3)`)} 等于什么？`,
    choices: [
      { correct: true, text: texInline("x_1+2x_3") },
      { text: `${texInline("x_1+2x_2+3x_3")}：把 1, 2, 3 直接当作系数。` },
      { text: texInline("2x_1+x_3") },
      { text: `条件不够，${texInline("f")} 不唯一。` },
    ],
    steps: [
      `设 ${texInline("f(x)=a_1x_1+a_2x_2+a_3x_3")}，${texInline("P^3")} 上的线性函数都是这种形状。`,
      `代入三个基向量：${texInline("a_1+a_2=1,\\ a_2+a_3=2,\\ a_1+a_3=3")}。`,
      `三式相加得 ${texInline("2(a_1+a_2+a_3)=6")}，于是 ${texInline("a_3=2,\\ a_1=1,\\ a_2=0")}。`,
      `所以 ${texInline("f=x_1+2x_3")}。检验：${texInline("f(\\alpha_1)=1,\\ f(\\alpha_2)=2,\\ f(\\alpha_3)=3")}。基上的值唯一决定 ${texInline("f")}。`,
      `系数取 1, 2, 3 时 ${texInline("f(\\alpha_1)=3")}；系数取 2, 0, 1 时 ${texInline("f(\\alpha_1)=2")}，都与条件不符。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("f(x_1,x_2)=x_1x_2")} 是线性函数吗？`,
      answer: `不是。${texInline("f(2x)=4f(x)")}，不满足 ${texInline(String.raw`f(k\alpha)=kf(\alpha)`)}。它的等值线是双曲线，也不平行。`,
    },
    {
      question: `${texInline("V")} 是 ${texInline("n")} 维空间，${texInline(String.raw`f\ne0`)}。${texInline(String.raw`\ker f`)} 是几维的？${texInline("f=1")} 的全体向量构成子空间吗？`,
      answer: `${texInline(String.raw`\ker f`)} 是 ${texInline("n-1")} 维的。${texInline("f=1")} 的向量不含零向量，不构成子空间；它是 ${texInline(String.raw`\alpha_0+\ker f`)}，其中 ${texInline(String.raw`f(\alpha_0)=1`)}。`,
    },
    {
      question: `在 ${texInline("P[x]_n")} 中，${texInline("f(p)=p(1)")} 是线性函数吗？它在基 ${texInline("1,x,\\dots,x^{n-1}")} 上的值是多少？`,
      answer: `是线性函数：${texInline(String.raw`(kp+lq)(1)=kp(1)+lq(1)`)}。它在每个基向量上的值都是 1，所以 ${texInline(String.raw`f(a_0+a_1x+\cdots)=a_0+a_1+\cdots+a_{n-1}`)}。`,
    },
  ],
  summary: [
    `线性函数 ${texInline(String.raw`f:V\to P`)} 保持线性组合；取定基后 ${texInline(String.raw`f(x)=a_1x_1+\cdots+a_nx_n`)}，${texInline(String.raw`a_i=f(\varepsilon_i)`)}。`,
    `基上的 ${texInline("n")} 个值可以任意给定，并且唯一决定 ${texInline("f")}。`,
    `${texInline(String.raw`f\ne0`)} 时 ${texInline(String.raw`\ker f`)} 是 ${texInline("n-1")} 维子空间，${texInline("f=c")} 的向量是它的平移，各等值面彼此平行。`,
  ],
});
