defineChapter10Section("linear-functional", {
  number: "§1",
  textbookSection: "线性函数",
  title: "线性函数",
  navTitle: "线性函数",
  question: "线性函数怎样把每个向量读成一个数？",
  goal: "理解线性函数的定义，会由基上的值写出 f(x)=a₁x₁+…+aₙxₙ，知道非零线性函数的核是 n−1 维子空间，等值面彼此平行。",
  tags: ["线性函数", "基上的值", "核", "等值线"],
  intro:
    "线性函数 f 把每个向量读成数域 P 中的一个数，并且保持加法与数乘。在平面上，f 取同一个值的点排成一条直线，不同的值给出一族平行线。下面拖动向量 x 读出 f(x)，再看 f 在基上的两个值怎样决定整族直线。",
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
        text: "V 是数域 P 上的线性空间。例如 Pⁿ 上的 a₁x₁+…+aₙxₙ，n 阶矩阵的迹 tr A，P[x] 上的 f(p)=p(t₀)。由定义 f(0)=0，并且 f 把线性组合读成读数的线性组合。",
        ponder: {
          q: "f(x₁,x₂)=x₁+x₂+1 是线性函数吗？",
          a: "不是。f(0)=1≠0。它的等值线也彼此平行，但 f=0 的那一条不过原点。",
        },
      },
      {
        title: "由基上的值唯一决定",
        tex: String.raw`f(x_1\varepsilon_1+\cdots+x_n\varepsilon_n)=a_1x_1+\cdots+a_nx_n,\qquad a_i=f(\varepsilon_i)`,
        text: "取定 V 的基 ε₁,…,εₙ，f 由 n 个数 f(ε₁),…,f(εₙ) 完全决定。反过来，任给 P 中 n 个数 a₁,…,aₙ，存在唯一的线性函数 f 使 f(εᵢ)=aᵢ。",
        ponder: {
          q: "f 在一组基上的值全是 0，f 是什么？",
          a: "零函数：对一切 x，f(x)=0·x₁+…+0·xₙ=0。",
        },
      },
      {
        title: "核与等值面",
        tex: String.raw`\ker f=\{\alpha\in V\mid f(\alpha)=0\},\qquad \dim\ker f=n-1\quad(f\ne 0)`,
        text: "f≠0 时值域是整个 P，由维数公式得 dim ker f=n−1。取 α₀ 使 f(α₀)=c，则 f=c 的全体向量恰好是 α₀+ker f。平面上 ker f 是过原点的直线，其余等值线都与它平行。",
        ponder: {
          q: "两个非零线性函数 f、g 的核相同，它们有什么关系？",
          a: "相差一个非零常数倍。取 α₀ 使 f(α₀)=1，则 V=L(α₀)⊕ker f，两边比较得 g=g(α₀)f。",
        },
      },
    ],
    pitfalls: [
      "把 a₁x₁+a₂x₂+b（b≠0）当成线性函数。线性函数必须满足 f(0)=0。",
      "以为系数 aᵢ 只属于 f。aᵢ=f(εᵢ) 依赖所选的基，换一组基，同一个 f 的系数一般会变。",
      "把直线 a₁x₁+a₂x₂=0 的方向当成 (a₁,a₂)。这条直线的方向是 (−a₂,a₁)。",
    ],
  },
  example: {
    title: "例题：由基上的值求线性函数",
    question: `在 ${texInline("P^3")} 中取基 ${texInline(String.raw`\alpha_1=(1,1,0),\ \alpha_2=(0,1,1),\ \alpha_3=(1,0,1)`)}，线性函数 f 满足 ${texInline(String.raw`f(\alpha_1)=1,\ f(\alpha_2)=2,\ f(\alpha_3)=3`)}。${texInline(String.raw`f(x_1,x_2,x_3)`)} 等于什么？`,
    choices: [
      { correct: true, text: texInline("x_1+2x_3") },
      { text: `${texInline("x_1+2x_2+3x_3")}：把 1, 2, 3 直接当作系数。` },
      { text: texInline("2x_1+x_3") },
      { text: "条件不够，f 不唯一。" },
    ],
    steps: [
      `设 ${texInline("f(x)=a_1x_1+a_2x_2+a_3x_3")}，P³ 上的线性函数都是这种形状。`,
      `代入三个基向量：${texInline("a_1+a_2=1,\\ a_2+a_3=2,\\ a_1+a_3=3")}。`,
      `三式相加得 ${texInline("a_1+a_2+a_3=3")}，于是 ${texInline("a_3=2,\\ a_1=1,\\ a_2=0")}。`,
      `所以 ${texInline("f=x_1+2x_3")}。检验：${texInline("f(\\alpha_1)=1,\\ f(\\alpha_2)=2,\\ f(\\alpha_3)=3")}。基上的值唯一决定 f。`,
      `系数取 1, 2, 3 时 ${texInline("f(\\alpha_1)=3")}；系数取 2, 0, 1 时 ${texInline("f(\\alpha_1)=2")}，都与条件不符。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("f(x_1,x_2)=x_1x_2")} 是线性函数吗？`,
      answer: "不是。f(2x)=4f(x)，不满足 f(kα)=kf(α)。它的等值线是双曲线，也不平行。",
    },
    {
      question: "V 是 n 维空间，f≠0。ker f 是几维的？f=1 的全体向量构成子空间吗？",
      answer: "ker f 是 n−1 维的。f=1 的向量不含零向量，不构成子空间；它是 α₀+ker f，其中 f(α₀)=1。",
    },
    {
      question: `在 ${texInline("P[x]_n")} 中，f(p)=p(1) 是线性函数吗？它在基 ${texInline("1,x,\\dots,x^{n-1}")} 上的值是多少？`,
      answer: "是线性函数：(kp+lq)(1)=kp(1)+lq(1)。它在每个基向量上的值都是 1，所以 f(a₀+a₁x+…)=a₀+a₁+…+aₙ₋₁。",
    },
  ],
  summary: [
    "线性函数 f: V→P 保持线性组合；取定基后 f(x)=a₁x₁+…+aₙxₙ，aᵢ=f(εᵢ)。",
    "基上的 n 个值可以任意给定，并且唯一决定 f。",
    "f≠0 时 ker f 是 n−1 维子空间，f=c 的向量是它的平移，各等值面彼此平行。",
  ],
});
