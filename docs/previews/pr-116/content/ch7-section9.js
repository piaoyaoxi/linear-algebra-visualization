defineChapter7Section("minimal-polynomial", {
  number: "§9",
  textbookSection: "最小多项式",
  title: "最小多项式",
  navTitle: "最小多项式",
  question: "使 A 变成零矩阵、次数最低的多项式是什么？它怎样判断 A 能否对角化？",
  goal: "理解最小多项式的定义与整除性质，会用 E, A, A², … 第一次线性相关的位置求最小多项式，掌握“最小多项式是互素一次因式之积”的对角化判据。",
  tags: ["最小多项式", "零化多项式", "对角化判据"],
  intro:
    "由哈密顿–凯莱定理，特征多项式 f 满足 f(A)=O，但它的次数未必最低。次数最低的首一零化多项式称为最小多项式 m(λ)。它恰好是互素的一次因式之积时，A 能对角化。",
  concepts: [
    { label: "最小多项式", text: `首项系数为 1、使 ${texInline("m(A)=O")} 且次数最低的多项式 ${texInline(String.raw`m(\lambda)`)}。` },
    { label: "整除", text: `${texInline(String.raw`g(A)=O\iff m(\lambda)\mid g(\lambda)`)}，特别地 ${texInline(String.raw`m\mid f`)}。` },
  ],
  textbook: { reference: "北大版《高等代数》第七章 §9", items: ["最小多项式的定义与唯一性", "最小多项式整除零化多项式", "可对角化的最小多项式判据"] },
  interactive: { type: "slot", title: "v, Av, A²v, … 第几步落回" },
  lesson3d: {
    blocks: [
      {
        title: "定义与整除性",
        tex: String.raw`g(A)=O\iff m(\lambda)\mid g(\lambda),\qquad m(\lambda)\mid f(\lambda)=|\lambda E-A|`,
        text: "用 m 去除 g，余式 r 的次数低于 m 且 r(A)=O，只能 r=0；由此最小多项式唯一。m 与 f 的根相同，都是 A 的全部特征值，只是重数可能变小。相似矩阵的最小多项式相同。",
      },
      {
        title: "怎样求：看第一次线性相关",
        tex: String.raw`A^k=c_0E+c_1A+\cdots+c_{k-1}A^{k-1}\ \Longrightarrow\ m(\lambda)=\lambda^k-c_{k-1}\lambda^{k-1}-\cdots-c_0`,
        text: "依次检查 E, A, A², …，第一个能由前面线性表出的 Aᵏ 给出 m。对单个向量 v 做同样的事，v, Av, A²v, … 第一次线性相关得到 mᵥ，它整除 m；m 是各基向量 εᵢ 的最小多项式的最小公倍式。准对角矩阵 diag(A₁,A₂) 的最小多项式是 m₁ 与 m₂ 的最小公倍式，若尔当块 J(a,k) 的最小多项式是 (λ−a)ᵏ。",
      },
      {
        title: "对角化判据",
        tex: String.raw`A\ \text{在}\ P\ \text{上可对角化}\iff m(\lambda)=(\lambda-\lambda_1)\cdots(\lambda-\lambda_s),\ \ \lambda_1,\dots,\lambda_s\in P\ \text{互不相同}`,
        text: "复数域上就是 m 没有重根。可对角化时 diag(λ₁,…,λₙ) 的最小多项式显然是互异一次因式之积；反过来，若 m 是这样的乘积，V 分解成各 ker(σ−λᵢE) 的直和，每一块都由特征向量组成。",
      },
    ],
    pitfalls: [
      "以为最小多项式总等于特征多项式。单位矩阵 E 的特征多项式是 (λ−1)ⁿ，最小多项式是 λ−1。",
      "某一个向量 v 满足 p(A)v=0，就断定 p(A)=O。p(A) 要把每个基向量都送到 0，所以 m 是各 mᵥ 的最小公倍式。",
      "以为最小多项式相同的矩阵一定相似。diag(J(2,2),J(2,2)) 与 diag(J(2,2),2,2) 的最小多项式都是 (λ−2)²，若尔当形却不同。",
    ],
  },
  example: {
    title: "例题：最小多项式与对角化",
    question: `求 ${texInline(String.raw`A=\begin{pmatrix}1&1&0\\-1&3&0\\0&0&2\end{pmatrix}`)} 的最小多项式，并判断 A 能否对角化。`,
    choices: [
      { correct: true, text: `${texInline(String.raw`m(\lambda)=(\lambda-2)^2`)}，A 不能对角化。` },
      { text: `${texInline(String.raw`m(\lambda)=(\lambda-2)^3`)}，与特征多项式相同，A 不能对角化。` },
      { text: `${texInline(String.raw`m(\lambda)=\lambda-2`)}，A 能对角化。` },
      { text: `${texInline(String.raw`m(\lambda)=(\lambda-2)^2`)}，A 能对角化，因为特征值只有一个。` },
    ],
    steps: [
      `§8 已求得 ${texInline(String.raw`f(\lambda)=(\lambda-2)^3`)}，所以 m 是 ${texInline(String.raw`\lambda-2,\ (\lambda-2)^2,\ (\lambda-2)^3`)} 之一。`,
      `${texInline(String.raw`A-2E=\begin{pmatrix}-1&1&0\\-1&1&0\\0&0&0\end{pmatrix}\ne O`)}，而 ${texInline(String.raw`(A-2E)^2=O`)}，所以 ${texInline(String.raw`m(\lambda)=(\lambda-2)^2`)}，次数比 f 低。`,
      "m 有重因式 (λ−2)²，按判据 A 不能对角化。",
      "与 §8 对照：m 中 λ−2 的次数 2 正是最大若尔当块的阶数，若尔当形是 J(2,2)⊕J(2,1)。",
    ],
  },
  quiz: [
    {
      question: "若 A²=A，A 一定可以对角化吗？",
      answer: "一定。λ²−λ=λ(λ−1) 零化 A，所以 m 整除 λ(λ−1)，只能是 λ、λ−1 或 λ(λ−1)，都是互素一次因式之积。",
    },
    {
      question: "在实数域上，满足 A²=−E 的矩阵能对角化吗？",
      answer: "不能。m 整除 λ²+1，而 m 不能是一次的（A=aE 时 a²=−1 无实根），所以 m=λ²+1，它在实数域上不能分解成一次因式。",
    },
    {
      question: "σ 在某组基下的矩阵是准对角矩阵 diag(A₁,A₂)，σ 的最小多项式与 A₁、A₂ 的最小多项式 m₁、m₂ 是什么关系？",
      answer: "是 m₁ 与 m₂ 的最小公倍式：g(diag(A₁,A₂))=diag(g(A₁),g(A₂))，它为 O 当且仅当 m₁ 与 m₂ 都整除 g。",
    },
  ],
  summary: [
    "最小多项式 m 是次数最低的首一零化多项式，整除每个零化多项式，也整除特征多项式。",
    "E, A, A², … 第一次线性相关给出 m；单个向量的 mᵥ 整除 m。",
    "A 可对角化 ⟺ m 是数域上互素一次因式之积。",
  ],
});
