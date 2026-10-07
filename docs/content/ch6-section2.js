defineChapter6Section("vector-space-definition", {
  number: "§2",
  textbookSection: "线性空间的定义与简单性质",
  title: "线性空间的定义与简单性质",
  navTitle: "线性空间定义",
  question: "只保留加法与数乘的运算规律，哪些对象都可以当作向量？",
  goal: "掌握线性空间的定义和简单性质；会在多项式、矩阵、函数等例子中找出零向量与负向量；会用一条失败的规律否定一个候选结构。",
  tags: ["线性空间", "八条运算规律", "零向量", "负向量", "数域"],
  intro:
    "线性空间只关心两件事：向量怎样相加，怎样乘以数域中的数。只要这两种运算满足八条规律，多项式、矩阵、函数都是向量。零向量也由运算决定，未必是数字 0。",
  concepts: [
    { label: "线性空间", text: `数域 ${texInline("P")} 上带有加法与数乘、满足八条运算规律的集合。` },
    { label: "零向量", text: `使 ${texInline("\\alpha+0=\\alpha")} 对一切 ${texInline("\\alpha")} 成立的元素，由加法决定。` },
  ],
  textbook: { reference: "北大版《高等代数》第六章 §2", items: ["线性空间的定义", "常见例子", "零元素与负元素的唯一性", "简单性质"] },
  interactive: false,
  lesson: {
    figure: "gallery",
    blocks: [
      {
        title: "线性空间的定义",
        tex: String.raw`\alpha+\beta\in V,\qquad k\alpha\in V\qquad(\alpha,\beta\in V,\ k\in P)`,
        text: `加法交换、结合，有零元 ${texInline("0")}，每个 ${texInline("\\alpha")} 有负元 ${texInline("-\\alpha")}；数乘满足 ${texInline("1\\alpha=\\alpha")}、${texInline("k(l\\alpha)=(kl)\\alpha")}；两者由 ${texInline("(k+l)\\alpha=k\\alpha+l\\alpha")}、${texInline("k(\\alpha+\\beta)=k\\alpha+k\\beta")} 相连。数域是定义的一部分：${texInline("\\mathbb C")} 可以看成 ${texInline("\\mathbb R")} 上的空间，也可以看成 ${texInline("\\mathbb C")} 上的空间，二者不同。`,
      },
      {
        title: "常见例子",
        tex: String.raw`P[x]_n=\{a_0+a_1x+\cdots+a_{n-1}x^{n-1}:a_i\in P\}`,
        text: `${texInline("P[x]_n")} 是次数小于 ${texInline("n")} 的多项式连同零多项式（北大记号），按通常运算构成线性空间。全体多项式 ${texInline("P[x]")}、全体 ${texInline("m\\times n")} 矩阵 ${texInline("P^{m\\times n}")}、区间上的全体实函数，按逐项或逐点运算都是线性空间。`,
      },
      {
        title: "简单性质",
        tex: String.raw`0\alpha=0,\qquad k0=0,\qquad (-1)\alpha=-\alpha`,
        text: `零向量唯一：${texInline("0_1=0_1+0_2=0_2")}；每个向量的负向量也唯一。${texInline("k\\alpha=0")} 当且仅当 ${texInline("k=0")} 或 ${texInline("\\alpha=0")}。这些都由八条规律推出，与向量具体是什么无关。`,
      },
    ],
    pitfalls: [
      `零向量由加法决定。例题中的 ${texInline("\\mathbb R^+")} 里，零向量是数 1。`,
      `只检查“运算封闭”不够：在 ${texInline("\\mathbb R^2")} 上保留加法、令 ${texInline("k\\circ(a,b)=(ka,0)")}，运算封闭，却违反 ${texInline("1\\circ\\alpha=\\alpha")}。`,
      `次数恰为 ${texInline("n")} 的多项式全体不是线性空间：它不含零多项式，${texInline("x^n+(-x^n)=0")} 也离开了集合。`,
    ],
  },
  example: {
    title: "例题：正实数上的“加法”与“数乘”",
    question: `在正实数集 ${texInline("\\mathbb R^+")} 上规定 ${texInline("a\\oplus b=ab")}，${texInline("k\\circ a=a^k\\ (k\\in\\mathbb R)")}。${texInline("\\mathbb R^+")} 对这两种运算构成 ${texInline("\\mathbb R")} 上的线性空间吗？如果构成，零向量和 ${texInline("a")} 的负向量分别是什么？`,
    choices: [
      { text: `不构成，因为 ${texInline("\\mathbb R^+")} 里没有 0。` },
      { text: `不构成，因为 ${texInline("(-1)\\circ a")} 不在 ${texInline("\\mathbb R^+")} 中。` },
      { correct: true, text: `构成；零向量是 1，${texInline("a")} 的负向量是 ${texInline("1/a")}。` },
      { text: `构成；零向量是 0，${texInline("a")} 的负向量是 ${texInline("-a")}。` },
    ],
    steps: [
      `封闭：${texInline("a,b>0")} 时 ${texInline("ab>0")}，${texInline("a^k>0")}。`,
      `加法：${texInline("ab=ba")}，${texInline("(ab)c=a(bc)")}；${texInline("a\\oplus1=a")}，所以零向量是 1；${texInline("a\\oplus\\frac1a=1")}，所以 ${texInline("a")} 的负向量是 ${texInline("\\frac1a")}。`,
      `数乘：${texInline("1\\circ a=a")}，${texInline("k\\circ(l\\circ a)=(a^l)^k=a^{kl}=(kl)\\circ a")}。`,
      `分配律：${texInline("(k+l)\\circ a=a^{k+l}=a^ka^l")}，${texInline("k\\circ(a\\oplus b)=(ab)^k=a^kb^k")}。八条全部成立。按对数刻度画 ${texInline("\\mathbb R^+")}，${texInline("\\oplus")} 就成了长度相接；§8 会看到 ${texInline("\\ln")} 把这个空间同构地映到 ${texInline("\\mathbb R")}。`,
    ],
  },
  quiz: [
    {
      question: `在 ${texInline("\\mathbb R^2")} 上保留通常加法，把数乘改成 ${texInline("k\\circ(a,b)=(ka,0)")}。八条规律中哪一条失败？`,
      answer: `只有 ${texInline("1\\circ\\alpha=\\alpha")} 失败：${texInline("1\\circ(a,b)=(a,0)")}。其余七条都成立，可见这一条不能由其他规律推出。`,
    },
    {
      question: `在例题的 ${texInline("\\mathbb R^+")} 中，${texInline("0\\circ a")} 等于什么？这与性质 ${texInline("0\\alpha=0")} 矛盾吗？`,
      answer: `${texInline("0\\circ a=a^0=1")}，正是这个空间的零向量，与性质一致。`,
    },
    {
      question: "为什么线性空间的零向量只有一个？",
      answer: `若 ${texInline("0_1,0_2")} 都是零向量，则 ${texInline("0_1=0_1+0_2=0_2")}。`,
    },
    {
      question: "全体 2 阶可逆实矩阵，按矩阵的加法与数乘，构成线性空间吗？",
      answer: `不构成：零矩阵不可逆；${texInline("E+(-E)=O")} 也说明加法不封闭。`,
    },
  ],
  summary: [
    "线性空间 = 集合 + 数域 + 满足八条规律的加法与数乘。",
    "多项式、矩阵、函数都可以是向量；零向量和负向量由运算决定。",
    "否定一个候选结构，找出一条失败的规律就够了。",
  ],
});
