defineChapter8Section("invariant-factors", {
  number: "§3",
  textbookSection: "不变因子",
  title: "不变因子",
  navTitle: "不变因子",
  question: "化标准形的路线有很多条，为什么得到的标准形总是同一个？",
  goal: `会求行列式因子 ${texInline(String.raw`D_k(\lambda)`)} 与不变因子 ${texInline(String.raw`d_k(\lambda)=D_k/D_{k-1}`)}；理解初等变换不改变行列式因子，从而标准形唯一；会用行列式因子判断两个 ${texInline(String.raw`\lambda`)}-矩阵是否等价。`,
  tags: ["行列式因子", "不变因子", "标准形的唯一性", "等价的判别"],
  intro:
    `化标准形时，每一步选哪个角元、先清行还是先清列，都可以不同。要说明结果唯一，得找一个初等变换改变不了的量。全部 ${texInline("k")} 阶子式的最大公因式就是这样的量。下面在子式墙上验证这一点。`,
  concepts: [
    { label: "行列式因子", text: texInline(String.raw`D_k(\lambda)=\gcd\{\text{全部 }k\text{ 阶子式}\}`) },
    { label: "不变因子", text: texInline(String.raw`d_k=D_k/D_{k-1}`) },
  ],
  textbook: { reference: "北大版《高等代数》第八章 §3", items: ["行列式因子", "等价 λ-矩阵有相同的行列式因子", "标准形的唯一性", "不变因子", "可逆 λ-矩阵是初等矩阵之积"] },
  interactive: { type: "slot", title: "子式墙" },
  lesson3d: {
    blocks: [
      {
        title: "行列式因子",
        tex: String.raw`D_k(\lambda)=\text{首一的}\ \gcd\{A(\lambda)\ \text{的全部}\ k\ \text{阶子式}\},\qquad D_k(\lambda)\mid D_{k+1}(\lambda)`,
        text: `设 ${texInline(String.raw`A(\lambda)`)} 的秩为 ${texInline("r")}，对 ${texInline(String.raw`k=1,\dots,r`)}，${texInline(String.raw`A(\lambda)`)} 中必有非零的 ${texInline("k")} 阶子式，它们的首项系数为 1 的最大公因式称为 ${texInline("k")} 阶行列式因子。每个 ${texInline("k+1")} 阶子式按一行展开，是 ${texInline("k")} 阶子式的组合，所以 ${texInline("D_k")} 整除 ${texInline("D_{k+1}")}。`,
        ponder: {
          q: `${texInline(String.raw`A(\lambda)`)} 中有一个 ${texInline("k")} 阶子式是非零常数，${texInline(String.raw`D_1,\dots,D_k`)} 各是什么？`,
          a: `都是 1。${texInline("D_k")} 整除这个常数，只能是 1；而 ${texInline("j")} 小于 ${texInline("k")} 时 ${texInline("D_j")} 整除 ${texInline("D_k")}，也都是 1。`,
        },
      },
      {
        title: "初等变换不改变行列式因子",
        tex: String.raw`D_k(\lambda)=d_1(\lambda)d_2(\lambda)\cdots d_k(\lambda),\qquad d_k(\lambda)=\frac{D_k(\lambda)}{D_{k-1}(\lambda)}\quad(D_0=1)`,
        text: `换行只改变一些子式的符号，乘非零常数只改变常数倍；把第 ${texInline("j")} 行的 ${texInline(String.raw`\varphi(\lambda)`)} 倍加到第 ${texInline("i")} 行，新的 ${texInline("k")} 阶子式等于旧子式加上 ${texInline(String.raw`\varphi(\lambda)`)} 乘另一个旧子式（差一个符号）。所以 ${texInline("D_k")} 整除变换后的每个 ${texInline("k")} 阶子式，再由变换可以撤回，两边的 ${texInline("D_k")} 相同。对标准形，非零的 ${texInline("k")} 阶子式只能是 ${texInline("k")} 个对角元之积，它们都被 ${texInline(String.raw`d_1\cdots d_k`)} 整除，于是得到上式。${texInline("d_k")} 由 ${texInline(String.raw`A(\lambda)`)} 唯一决定，称为不变因子，标准形因此唯一。`,
      },
      {
        title: "等价的判别",
        tex: String.raw`A(\lambda)\simeq B(\lambda)\iff D_k\ \text{全部相同}\iff d_k\ \text{全部相同}`,
        text: `两个 ${texInline(String.raw`\lambda`)}-矩阵等价，当且仅当它们有相同的行列式因子，也当且仅当它们有相同的不变因子。特别地，${texInline("n")} 阶 ${texInline(String.raw`\lambda`)}-矩阵可逆当且仅当它与 ${texInline("E")} 等价，也就是可以写成若干个初等矩阵的乘积。`,
        ponder: {
          q: `可逆的 ${texInline("n")} 阶 ${texInline(String.raw`\lambda`)}-矩阵，它的不变因子是什么？`,
          a: `全是 1。${texInline(String.raw`D_n=|A(\lambda)|`)} 首一化后是 1，于是 ${texInline(String.raw`d_1\cdots d_n=1`)}，每个 ${texInline("d_k")} 都是 1。`,
        },
      },
    ],
    pitfalls: [
      `只算一个 ${texInline("k")} 阶子式就当作 ${texInline("D_k")}。${texInline("D_k")} 是全部 ${texInline("k")} 阶子式的最大公因式。`,
      `把行列式因子当成不变因子。${texInline("d_k=D_k/D_{k-1}")}，例如 ${texInline("D_3")} 是 ${texInline("d_1d_2d_3")}。`,
      `把对角 ${texInline(String.raw`\lambda`)}-矩阵的对角元直接当作不变因子。${texInline(String.raw`\operatorname{diag}(\lambda,\lambda+1)`)} 的不变因子是 ${texInline(String.raw`1,\ \lambda(\lambda+1)`)}。`,
    ],
  },
  example: {
    title: "例题：由行列式因子求不变因子",
    question: `三阶 ${texInline(String.raw`\lambda`)}-矩阵的行列式因子为 ${texInline(String.raw`D_1=1,\ D_2=\lambda-1,\ D_3=(\lambda-1)^3(\lambda+2)`)}。它的不变因子是什么？`,
    choices: [
      { correct: true, text: texInline(String.raw`1,\ \lambda-1,\ (\lambda-1)^2(\lambda+2)`) },
      { text: texInline(String.raw`1,\ \lambda-1,\ (\lambda-1)^3(\lambda+2)`) },
      { text: texInline(String.raw`1,\ \lambda-1,\ (\lambda-1)(\lambda+2)`) },
      { text: texInline(String.raw`\lambda-1,\ \lambda-1,\ (\lambda-1)(\lambda+2)`) },
    ],
    steps: [
      `${texInline(String.raw`d_1=D_1=1`)}，${texInline(String.raw`d_2=D_2/D_1=\lambda-1`)}。`,
      `${texInline(String.raw`d_3=D_3/D_2=(\lambda-1)^3(\lambda+2)/(\lambda-1)=(\lambda-1)^2(\lambda+2)`)}。核对：${texInline(String.raw`d_1\mid d_2\mid d_3`)}，乘积为 ${texInline("D_3")}。`,
      `把 ${texInline("D_3")} 直接当作 ${texInline("d_3")}，乘积会多出 ${texInline(String.raw`\lambda-1`)}；${texInline(String.raw`(\lambda-1)(\lambda+2)`)} 使乘积少一个因子 ${texInline(String.raw`\lambda-1`)}；以 ${texInline(String.raw`\lambda-1,\ \lambda-1`)} 开头的那一组，${texInline("d_1")} 应为 ${texInline("D_1=1")}。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("n")} 阶矩阵 ${texInline("A")} 的特征矩阵 ${texInline(String.raw`\lambda E-A`)}，它的 ${texInline("n")} 阶行列式因子 ${texInline("D_n")} 是什么？`,
      answer: `${texInline(String.raw`D_n=|\lambda E-A|`)}，就是 ${texInline("A")} 的特征多项式（首项系数为 1）。于是 ${texInline(String.raw`d_1d_2\cdots d_n`)} 等于特征多项式。`,
    },
    {
      question: `两个 ${texInline(String.raw`\lambda`)}-矩阵对应位置的元素都不相同，它们可能等价吗？`,
      answer: `可能。等价只看行列式因子是否相同，例如 ${texInline(String.raw`\operatorname{diag}(\lambda,\lambda+1)`)} 与 ${texInline(String.raw`\operatorname{diag}(1,\lambda^2+\lambda)`)} 等价。`,
    },
    {
      question: "为什么说标准形是唯一的？",
      answer: `标准形的对角元 ${texInline("d_k=D_k/D_{k-1}")}，而 ${texInline("D_k")} 在初等变换下不变，只由 ${texInline(String.raw`A(\lambda)`)} 决定。无论走哪条化简路线，得到的 ${texInline("d_k")} 都相同。`,
    },
  ],
  summary: [
    `${texInline(String.raw`D_k(\lambda)`)} 是全部 ${texInline("k")} 阶子式的首一最大公因式，初等变换不改变它。`,
    `不变因子 ${texInline("d_k=D_k/D_{k-1}")} 就是标准形的对角元，所以标准形唯一。`,
    `两个 ${texInline(String.raw`\lambda`)}-矩阵等价 ${texInline(String.raw`\Leftrightarrow`)} 行列式因子相同 ${texInline(String.raw`\Leftrightarrow`)} 不变因子相同；可逆 ${texInline(String.raw`\lambda`)}-矩阵是初等矩阵的乘积。`,
  ],
});
