defineChapter7Section("linear-map-operations", {
  number: "§2",
  textbookSection: "线性变换的运算",
  title: "线性变换的运算",
  navTitle: "线性变换的运算",
  question: "线性变换怎样相加、相乘，怎样代入多项式？",
  goal: "掌握线性变换的和、数量乘法、乘积与逆变换，会把线性变换代入多项式；知道乘法一般不可交换。",
  tags: ["和", "乘积", "逆变换", "多项式 f(σ)"],
  intro:
    "两个线性变换可以对同一个向量分别作用后相加，也可以先后作用。乘积 στ 表示先 τ 后 σ，交换顺序一般得到不同的变换。同一个 σ 可以反复相乘，于是能代入多项式，这是后面研究特征值和最小多项式的工具。",
  concepts: [
    { label: "乘积", text: `${texInline(String.raw`(\sigma\tau)(\alpha)=\sigma(\tau(\alpha))`)}，先 τ 后 σ。` },
    { label: "多项式", text: `${texInline(String.raw`f(\sigma)=a_m\sigma^m+\cdots+a_1\sigma+a_0E`)}。` },
  ],
  textbook: { reference: "北大版《高等代数》第七章 §2", items: ["线性变换的乘法、加法与数量乘法", "逆变换", "线性变换的多项式"] },
  interactive: false,
  lesson3d: {
    blocks: [
      {
        title: "加法、数量乘法与乘法",
        tex: String.raw`(\sigma+\tau)(\alpha)=\sigma\alpha+\tau\alpha,\qquad (k\sigma)(\alpha)=k\,\sigma\alpha,\qquad (\sigma\tau)(\alpha)=\sigma(\tau\alpha)`,
        text: "三者仍是线性变换。乘法满足结合律和对加法的分配律，单位变换 E 满足 Eσ=σE=σ；乘法一般不满足交换律。全体线性变换在加法与数量乘法下构成数域 P 上的线性空间。",
      },
      {
        title: "逆变换",
        tex: String.raw`\sigma\tau=\tau\sigma=E\ \Longrightarrow\ \tau=\sigma^{-1},\qquad (\sigma\tau)^{-1}=\tau^{-1}\sigma^{-1}`,
        text: "可逆线性变换的逆仍是线性变换。撤销“先 τ 后 σ”时要先撤销 σ，所以逆的顺序相反。有限维空间中，只要 στ=E 一式成立，就有 τσ=E。",
      },
      {
        title: "线性变换的多项式",
        tex: String.raw`h=f+g\Rightarrow h(\sigma)=f(\sigma)+g(\sigma),\qquad h=fg\Rightarrow h(\sigma)=f(\sigma)g(\sigma)`,
        text: "σᵐ 是 m 个 σ 的乘积，σ⁰=E。因为 σⁱσʲ=σⁱ⁺ʲ=σʲσⁱ，同一个 σ 的两个多项式总可交换：f(σ)g(σ)=g(σ)f(σ)。",
      },
    ],
    pitfalls: [
      "把 στ 读成先 σ 后 τ。στ 作用在 α 上是 σ(τα)，靠近 α 的 τ 先作用。",
      "把 σ+τ 当成两步。σ+τ 是对同一个 α 分别作用，再把两个像相加。",
      "求 (στ)⁻¹ 时保持原来的顺序。正确的是 τ⁻¹σ⁻¹。",
    ],
  },
  example: {
    title: "例题：求导与乘 x 不可交换",
    question: `在 ${texInline(String.raw`P[x]`)} 中，D 是求导，${texInline(String.raw`\sigma(f(x))=xf(x)`)}。${texInline(String.raw`D\sigma-\sigma D`)} 是什么变换？`,
    choices: [
      { correct: true, text: `单位变换 ${texInline("E")}。` },
      { text: "零变换，因为求导和乘 x 都是线性变换。" },
      { text: `${texInline(String.raw`\sigma`)}，即乘 x。` },
      { text: `${texInline("D")}，即求导。` },
    ],
    steps: [
      `${texInline(String.raw`(D\sigma)(f)=D(xf)=f+xf'`)}。`,
      `${texInline(String.raw`(\sigma D)(f)=\sigma(f')=xf'`)}。`,
      `相减：${texInline(String.raw`(D\sigma-\sigma D)(f)=f`)} 对一切 f 成立，所以 ${texInline(String.raw`D\sigma-\sigma D=E`)}。`,
      `特别地 ${texInline(String.raw`D\sigma\ne\sigma D`)}：两个线性变换的乘积与顺序有关。`,
    ],
  },
  quiz: [
    {
      question: `若 ${texInline(String.raw`\sigma^2=\sigma`)}，${texInline(String.raw`(E-\sigma)^2`)} 等于什么？${texInline(String.raw`\sigma(E-\sigma)`)} 呢？`,
      answer: "(E−σ)²=E−2σ+σ²=E−σ；σ(E−σ)=σ−σ²=0。",
    },
    {
      question: `在 ${texInline(String.raw`P[x]`)} 中，J 是从 0 到 x 求积分。DJ 与 JD 各是什么？这在有限维空间中可能发生吗？`,
      answer: "DJ=E，而 JD(f)=f−f(0)，不等于 E。有限维空间中不会发生：στ=E 时 τσ=E 也成立。",
    },
    {
      question: "为什么 f(σ)g(σ)=g(σ)f(σ) 总成立，而两个线性变换 σ、τ 一般不可交换？",
      answer: "f(σ)、g(σ) 都是同一个 σ 的幂的组合，σⁱσʲ=σⁱ⁺ʲ=σʲσⁱ；两个不同的变换之间没有这样的关系。",
    },
  ],
  summary: [
    "和是对同一向量分别作用再相加；乘积 στ 是先 τ 后 σ，满足结合律，一般不可交换。",
    "可逆变换的逆仍是线性变换，(στ)⁻¹=τ⁻¹σ⁻¹。",
    "f(σ) 把多项式代入线性变换，同一个 σ 的多项式彼此可交换。",
  ],
});
