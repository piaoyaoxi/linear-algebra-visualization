defineChapter7Section("minimal-polynomial", {
  number: "§9",
  textbookSection: "最小多项式",
  title: "最小多项式",
  navTitle: "最小多项式",
  question: `使 ${texInline("A")} 变成零矩阵、次数最低的多项式是什么？它怎样判断 ${texInline("A")} 能否对角化？`,
  goal: `理解最小多项式的定义与整除性质，会用 ${texInline(String.raw`E,A,A^2,\dots`)} 第一次线性相关的位置求最小多项式，掌握“最小多项式是互素一次因式之积”的对角化判据。`,
  tags: ["最小多项式", "零化多项式", "对角化判据"],
  intro:
    `由哈密顿–凯莱定理，特征多项式 ${texInline("f")} 满足 ${texInline("f(A)=O")}，但它的次数未必最低。次数最低的首一零化多项式称为最小多项式 ${texInline(String.raw`m(\lambda)`)}。它恰好是互素的一次因式之积时，${texInline("A")} 能对角化。`,
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
        text: `用 ${texInline("m")} 去除 ${texInline("g")}，余式 ${texInline("r")} 的次数低于 ${texInline("m")} 且 ${texInline("r(A)=O")}，只能 ${texInline("r=0")}；由此最小多项式唯一。${texInline("m")} 与 ${texInline("f")} 的根相同，都是 ${texInline("A")} 的全部特征值，只是重数可能变小。相似矩阵的最小多项式相同。`,
      },
      {
        title: "怎样求：看第一次线性相关",
        tex: String.raw`A^k=c_0E+c_1A+\cdots+c_{k-1}A^{k-1}\ \Longrightarrow\ m(\lambda)=\lambda^k-c_{k-1}\lambda^{k-1}-\cdots-c_0`,
        text: `依次检查 ${texInline(String.raw`E,A,A^2,\dots`)}，第一个能由前面线性表出的 ${texInline("A^k")} 给出 ${texInline("m")}。对单个向量 ${texInline("v")} 做同样的事，${texInline(String.raw`v,Av,A^2v,\dots`)} 第一次线性相关得到 ${texInline("m_v")}，它整除 ${texInline("m")}；${texInline("m")} 是各基向量 ${texInline(String.raw`\varepsilon_i`)} 的最小多项式的最小公倍式。准对角矩阵 ${texInline(String.raw`\operatorname{diag}(A_1,A_2)`)} 的最小多项式是 ${texInline("m_1")} 与 ${texInline("m_2")} 的最小公倍式，若尔当块 ${texInline("J(a,k)")} 的最小多项式是 ${texInline(String.raw`(\lambda-a)^k`)}。`,
      },
      {
        title: "对角化判据",
        tex: String.raw`A\ \text{在}\ P\ \text{上可对角化}\iff m(\lambda)=(\lambda-\lambda_1)\cdots(\lambda-\lambda_s),\ \ \lambda_1,\dots,\lambda_s\in P\ \text{互不相同}`,
        text: `复数域上就是 ${texInline("m")} 没有重根。可对角化时 ${texInline(String.raw`\operatorname{diag}(\lambda_1,\dots,\lambda_n)`)} 的最小多项式显然是互异一次因式之积；反过来，若 ${texInline("m")} 是这样的乘积，${texInline("V")} 分解成各 ${texInline(String.raw`\ker(\sigma-\lambda_iE)`)} 的直和，每一块都由特征向量组成。`,
      },
    ],
    pitfalls: [
      `以为最小多项式总等于特征多项式。单位矩阵 ${texInline("E")} 的特征多项式是 ${texInline(String.raw`(\lambda-1)^n`)}，最小多项式是 ${texInline(String.raw`\lambda-1`)}。`,
      `某一个向量 ${texInline("v")} 满足 ${texInline("p(A)v=0")}，就断定 ${texInline("p(A)=O")}。${texInline("p(A)")} 要把每个基向量都送到 ${texInline("0")}，所以 ${texInline("m")} 是各 ${texInline("m_v")} 的最小公倍式。`,
      `以为最小多项式相同的矩阵一定相似。${texInline(String.raw`\operatorname{diag}(J(2,2),J(2,2))`)} 与 ${texInline(String.raw`\operatorname{diag}(J(2,2),2,2)`)} 的最小多项式都是 ${texInline(String.raw`(\lambda-2)^2`)}，若尔当形却不同。`,
    ],
  },
  example: {
    title: "例题：最小多项式与对角化",
    question: `求 ${texInline(String.raw`A=\begin{pmatrix}1&1&0\\-1&3&0\\0&0&2\end{pmatrix}`)} 的最小多项式，并判断 ${texInline("A")} 能否对角化。`,
    choices: [
      { correct: true, text: `${texInline(String.raw`m(\lambda)=(\lambda-2)^2`)}，${texInline("A")} 不能对角化。` },
      { text: `${texInline(String.raw`m(\lambda)=(\lambda-2)^3`)}，与特征多项式相同，${texInline("A")} 不能对角化。` },
      { text: `${texInline(String.raw`m(\lambda)=\lambda-2`)}，${texInline("A")} 能对角化。` },
      { text: `${texInline(String.raw`m(\lambda)=(\lambda-2)^2`)}，${texInline("A")} 能对角化，因为特征值只有一个。` },
    ],
    steps: [
      `§8 已求得 ${texInline(String.raw`f(\lambda)=(\lambda-2)^3`)}，所以 ${texInline("m")} 是 ${texInline(String.raw`\lambda-2,\ (\lambda-2)^2,\ (\lambda-2)^3`)} 之一。`,
      `${texInline(String.raw`A-2E=\begin{pmatrix}-1&1&0\\-1&1&0\\0&0&0\end{pmatrix}\ne O`)}，而 ${texInline(String.raw`(A-2E)^2=O`)}，所以 ${texInline(String.raw`m(\lambda)=(\lambda-2)^2`)}，次数比 ${texInline("f")} 低。`,
      `${texInline("m")} 有重因式 ${texInline(String.raw`(\lambda-2)^2`)}，按判据 ${texInline("A")} 不能对角化。`,
      `与 §8 对照：${texInline("m")} 中 ${texInline(String.raw`\lambda-2`)} 的次数 ${texInline("2")} 正是最大若尔当块的阶数，若尔当形是 ${texInline(String.raw`J(2,2)\oplus J(2,1)`)}。`,
    ],
  },
  quiz: [
    {
      question: `若 ${texInline("A^2=A")}，${texInline("A")} 一定可以对角化吗？`,
      answer: `一定。${texInline(String.raw`\lambda^2-\lambda=\lambda(\lambda-1)`)} 零化 ${texInline("A")}，所以 ${texInline("m")} 整除 ${texInline(String.raw`\lambda(\lambda-1)`)}，只能是 ${texInline(String.raw`\lambda`)}、${texInline(String.raw`\lambda-1`)} 或 ${texInline(String.raw`\lambda(\lambda-1)`)}，都是互素一次因式之积。`,
    },
    {
      question: `在实数域上，满足 ${texInline("A^2=-E")} 的矩阵能对角化吗？`,
      answer: `不能。${texInline("m")} 整除 ${texInline(String.raw`\lambda^2+1`)}，而 ${texInline("m")} 不能是一次的（${texInline("A=aE")} 时 ${texInline("a^2=-1")} 无实根），所以 ${texInline(String.raw`m=\lambda^2+1`)}，它在实数域上不能分解成一次因式。`,
    },
    {
      question: `${texInline(String.raw`\sigma`)} 在某组基下的矩阵是准对角矩阵 ${texInline(String.raw`\operatorname{diag}(A_1,A_2)`)}，${texInline(String.raw`\sigma`)} 的最小多项式与 ${texInline("A_1")}、${texInline("A_2")} 的最小多项式 ${texInline("m_1")}、${texInline("m_2")} 是什么关系？`,
      answer: `是 ${texInline("m_1")} 与 ${texInline("m_2")} 的最小公倍式：${texInline(String.raw`g(\operatorname{diag}(A_1,A_2))=\operatorname{diag}(g(A_1),g(A_2))`)}，它为 ${texInline("O")} 当且仅当 ${texInline("m_1")} 与 ${texInline("m_2")} 都整除 ${texInline("g")}。`,
    },
  ],
  summary: [
    `最小多项式 ${texInline("m")} 是次数最低的首一零化多项式，整除每个零化多项式，也整除特征多项式。`,
    `${texInline(String.raw`E,A,A^2,\dots`)} 第一次线性相关给出 ${texInline("m")}；单个向量的 ${texInline("m_v")} 整除 ${texInline("m")}。`,
    `${texInline("A")} 可对角化 ${texInline(String.raw`\iff`)} ${texInline("m")} 是数域上互素一次因式之积。`,
  ],
});
