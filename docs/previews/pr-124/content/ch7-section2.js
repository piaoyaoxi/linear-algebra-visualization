defineChapter7Section("linear-map-operations", {
  number: "§2",
  textbookSection: "线性变换的运算",
  title: "线性变换的运算",
  navTitle: "线性变换的运算",
  question: "线性变换怎样相加、相乘，怎样代入多项式？",
  goal: "掌握线性变换的和、数量乘法、乘积与逆变换，会把线性变换代入多项式；知道乘法一般不可交换。",
  tags: ["和", "乘积", "逆变换", `多项式 ${texInline(String.raw`f(\sigma)`)}`],
  intro:
    `两个线性变换可以对同一个向量分别作用后相加，也可以先后作用。乘积 ${texInline(String.raw`\sigma\tau`)} 表示先 ${texInline(String.raw`\tau`)} 后 ${texInline(String.raw`\sigma`)}，交换顺序一般得到不同的变换。同一个 ${texInline(String.raw`\sigma`)} 可以反复相乘，于是能代入多项式，这是后面研究特征值和最小多项式的工具。`,
  concepts: [
    { label: "乘积", text: `${texInline(String.raw`(\sigma\tau)(\alpha)=\sigma(\tau(\alpha))`)}，先 ${texInline(String.raw`\tau`)} 后 ${texInline(String.raw`\sigma`)}。` },
    { label: "多项式", text: `${texInline(String.raw`f(\sigma)=a_m\sigma^m+\cdots+a_1\sigma+a_0E`)}。` },
  ],
  textbook: { reference: "北大版《高等代数》第七章 §2", items: ["线性变换的乘法、加法与数量乘法", "逆变换", "线性变换的多项式"] },
  interactive: false,
  lesson3d: {
    blocks: [
      {
        title: "加法、数量乘法与乘法",
        tex: String.raw`(\sigma+\tau)(\alpha)=\sigma\alpha+\tau\alpha,\qquad (k\sigma)(\alpha)=k\,\sigma\alpha,\qquad (\sigma\tau)(\alpha)=\sigma(\tau\alpha)`,
        text: `三者仍是线性变换。乘法满足结合律和对加法的分配律，单位变换 ${texInline("E")} 满足 ${texInline(String.raw`E\sigma=\sigma E=\sigma`)}；乘法一般不满足交换律。全体线性变换在加法与数量乘法下构成数域 ${texInline("P")} 上的线性空间。`,
      },
      {
        title: "逆变换",
        tex: String.raw`\sigma\tau=\tau\sigma=E\ \Longrightarrow\ \tau=\sigma^{-1},\qquad (\sigma\tau)^{-1}=\tau^{-1}\sigma^{-1}`,
        text: `可逆线性变换的逆仍是线性变换。撤销“先 ${texInline(String.raw`\tau`)} 后 ${texInline(String.raw`\sigma`)}”时要先撤销 ${texInline(String.raw`\sigma`)}，所以逆的顺序相反。有限维空间中，只要 ${texInline(String.raw`\sigma\tau=E`)} 一式成立，就有 ${texInline(String.raw`\tau\sigma=E`)}。`,
      },
      {
        title: "线性变换的多项式",
        tex: String.raw`h=f+g\Rightarrow h(\sigma)=f(\sigma)+g(\sigma),\qquad h=fg\Rightarrow h(\sigma)=f(\sigma)g(\sigma)`,
        text: `${texInline(String.raw`\sigma^m`)} 是 ${texInline("m")} 个 ${texInline(String.raw`\sigma`)} 的乘积，${texInline(String.raw`\sigma^0=E`)}。因为 ${texInline(String.raw`\sigma^i\sigma^j=\sigma^{i+j}=\sigma^j\sigma^i`)}，同一个 ${texInline(String.raw`\sigma`)} 的两个多项式总可交换：${texInline(String.raw`f(\sigma)g(\sigma)=g(\sigma)f(\sigma)`)}。`,
      },
    ],
    pitfalls: [
      `把 ${texInline(String.raw`\sigma\tau`)} 读成先 ${texInline(String.raw`\sigma`)} 后 ${texInline(String.raw`\tau`)}。${texInline(String.raw`\sigma\tau`)} 作用在 ${texInline(String.raw`\alpha`)} 上是 ${texInline(String.raw`\sigma(\tau\alpha)`)}，靠近 ${texInline(String.raw`\alpha`)} 的 ${texInline(String.raw`\tau`)} 先作用。`,
      `把 ${texInline(String.raw`\sigma+\tau`)} 当成两步。${texInline(String.raw`\sigma+\tau`)} 是对同一个 ${texInline(String.raw`\alpha`)} 分别作用，再把两个像相加。`,
      `求 ${texInline(String.raw`(\sigma\tau)^{-1}`)} 时保持原来的顺序。正确的是 ${texInline(String.raw`\tau^{-1}\sigma^{-1}`)}。`,
    ],
  },
  example: {
    title: "例题：求导与乘 x 不可交换",
    question: `在 ${texInline(String.raw`P[x]`)} 中，${texInline("D")} 是求导，${texInline(String.raw`\sigma(f(x))=xf(x)`)}。${texInline(String.raw`D\sigma-\sigma D`)} 是什么变换？`,
    choices: [
      { correct: true, text: `单位变换 ${texInline("E")}。` },
      { text: `零变换，因为求导和乘 ${texInline("x")} 都是线性变换。` },
      { text: `${texInline(String.raw`\sigma`)}，即乘 ${texInline("x")}。` },
      { text: `${texInline("D")}，即求导。` },
    ],
    steps: [
      `${texInline(String.raw`(D\sigma)(f)=D(xf)=f+xf'`)}。`,
      `${texInline(String.raw`(\sigma D)(f)=\sigma(f')=xf'`)}。`,
      `相减：${texInline(String.raw`(D\sigma-\sigma D)(f)=f`)} 对一切 ${texInline("f")} 成立，所以 ${texInline(String.raw`D\sigma-\sigma D=E`)}。`,
      `特别地 ${texInline(String.raw`D\sigma\ne\sigma D`)}：两个线性变换的乘积与顺序有关。`,
    ],
  },
  quiz: [
    {
      question: `若 ${texInline(String.raw`\sigma^2=\sigma`)}，${texInline(String.raw`(E-\sigma)^2`)} 等于什么？${texInline(String.raw`\sigma(E-\sigma)`)} 呢？`,
      answer: `${texInline(String.raw`(E-\sigma)^2=E-2\sigma+\sigma^2=E-\sigma`)}；${texInline(String.raw`\sigma(E-\sigma)=\sigma-\sigma^2=0`)}。`,
    },
    {
      question: `在 ${texInline(String.raw`P[x]`)} 中，${texInline("J")} 是从 ${texInline("0")} 到 ${texInline("x")} 求积分。${texInline("DJ")} 与 ${texInline("JD")} 各是什么？这在有限维空间中可能发生吗？`,
      answer: `${texInline("DJ=E")}，而 ${texInline("JD(f)=f-f(0)")}，不等于 ${texInline("E")}。有限维空间中不会发生：${texInline(String.raw`\sigma\tau=E`)} 时 ${texInline(String.raw`\tau\sigma=E`)} 也成立。`,
    },
    {
      question: `为什么 ${texInline(String.raw`f(\sigma)g(\sigma)=g(\sigma)f(\sigma)`)} 总成立，而两个线性变换 ${texInline(String.raw`\sigma`)}、${texInline(String.raw`\tau`)} 一般不可交换？`,
      answer: `${texInline(String.raw`f(\sigma)`)}、${texInline(String.raw`g(\sigma)`)} 都是同一个 ${texInline(String.raw`\sigma`)} 的幂的组合，${texInline(String.raw`\sigma^i\sigma^j=\sigma^{i+j}=\sigma^j\sigma^i`)}；两个不同的变换之间没有这样的关系。`,
    },
  ],
  summary: [
    `和是对同一向量分别作用再相加；乘积 ${texInline(String.raw`\sigma\tau`)} 是先 ${texInline(String.raw`\tau`)} 后 ${texInline(String.raw`\sigma`)}，满足结合律，一般不可交换。`,
    `可逆变换的逆仍是线性变换，${texInline(String.raw`(\sigma\tau)^{-1}=\tau^{-1}\sigma^{-1}`)}。`,
    `${texInline(String.raw`f(\sigma)`)} 把多项式代入线性变换，同一个 ${texInline(String.raw`\sigma`)} 的多项式彼此可交换。`,
  ],
});
