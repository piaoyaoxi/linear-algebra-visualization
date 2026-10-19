defineChapter7Section("invariant-subspaces", {
  number: "§7",
  textbookSection: "不变子空间",
  title: "不变子空间",
  navTitle: "不变子空间",
  question: `哪些子空间在 ${texInline(String.raw`\sigma`)} 作用下不会离开自己？`,
  goal: "理解不变子空间的定义与常见例子，知道不变子空间的直和分解对应准对角矩阵，了解按特征值的根子空间分解。",
  tags: ["不变子空间", "准对角矩阵", "根子空间"],
  intro:
    `${texInline(String.raw`\sigma`)} 把子空间 ${texInline("W")} 映进 ${texInline("W")} 自身时，${texInline("W")} 称为 ${texInline(String.raw`\sigma`)} 的不变子空间，这时可以只在 ${texInline("W")} 里研究 ${texInline(String.raw`\sigma`)}，矩阵也随之分块。一维的不变子空间就是特征向量所在的直线；二维的不变平面却可以不含任何实特征向量。`,
  concepts: [
    { label: "不变子空间", text: `${texInline(String.raw`\sigma W\subseteq W`)}，即 ${texInline("W")} 中每个向量的像仍在 ${texInline("W")} 中。` },
    { label: "准对角", text: `${texInline("V")} 分解成不变子空间的直和时，适配基下 ${texInline(String.raw`\sigma`)} 的矩阵是准对角矩阵。` },
  ],
  textbook: { reference: "北大版《高等代数》第七章 §7", items: ["不变子空间的定义与例", "不变子空间与矩阵化简", "按特征值分解为不变子空间的直和"] },
  interactive: { type: "slot", title: "σW 有没有离开 W" },
  lesson3d: {
    blocks: [
      {
        title: "定义与常见的不变子空间",
        tex: String.raw`\sigma W\subseteq W\iff \sigma\alpha_1,\dots,\sigma\alpha_s\in W\quad(W=L(\alpha_1,\dots,\alpha_s))`,
        text: `检验时只需看生成元的像。${texInline(String.raw`\{0\}`)}、${texInline("V")}、值域 ${texInline(String.raw`\sigma V`)}、核 ${texInline(String.raw`\sigma^{-1}(0)`)}、每个特征子空间 ${texInline(String.raw`V_\lambda`)} 都是 ${texInline(String.raw`\sigma`)} 的不变子空间。一维子空间 ${texInline(String.raw`L(\xi)`)} 不变，当且仅当 ${texInline(String.raw`\xi`)} 是特征向量。若 ${texInline(String.raw`\sigma\tau=\tau\sigma`)}，则 ${texInline(String.raw`\tau`)} 的值域与核都是 ${texInline(String.raw`\sigma`)} 的不变子空间。`,
      },
      {
        title: "不变子空间让矩阵分块",
        tex: String.raw`V=W_1\oplus W_2,\ \ \sigma W_i\subseteq W_i\ \Longrightarrow\ \sigma(\varepsilon_1,\dots,\varepsilon_n)=(\varepsilon_1,\dots,\varepsilon_n)\begin{pmatrix}A_1&0\\0&A_2\end{pmatrix}`,
        text: `${texInline(String.raw`\varepsilon_1,\dots,\varepsilon_k`)} 是 ${texInline("W_1")} 的基，${texInline(String.raw`\varepsilon_{k+1},\dots,\varepsilon_n`)} 是 ${texInline("W_2")} 的基，${texInline("A_1")}、${texInline("A_2")} 是 ${texInline(String.raw`\sigma`)} 限制在 ${texInline("W_1")}、${texInline("W_2")} 上的矩阵。只有 ${texInline("W_1")} 不变时，把 ${texInline("W_1")} 的基扩充成 ${texInline("V")} 的基，矩阵是右上角带一块的分块上三角形。实验中 ${texInline("A")} 的不变平面配上不变直线，得到 2 阶块和 1 阶块。`,
      },
      {
        title: "按特征值分解",
        tex: String.raw`f(\lambda)=(\lambda-\lambda_1)^{r_1}\cdots(\lambda-\lambda_s)^{r_s}\ \Longrightarrow\ V=V_1\oplus\cdots\oplus V_s,\quad V_i=\{\xi:\ (\sigma-\lambda_iE)^{r_i}\xi=0\}`,
        text: `${texInline("f")} 是 ${texInline(String.raw`\sigma`)} 的特征多项式。每个 ${texInline("V_i")} 都是不变子空间，于是 ${texInline(String.raw`\sigma`)} 的矩阵化成 ${texInline("s")} 块，每块只有一个特征值 ${texInline(String.raw`\lambda_i`)}。${texInline("V_i")} 一般比特征子空间 ${texInline(String.raw`V_{\lambda_i}`)} 大，§8 在每个 ${texInline("V_i")} 里继续化简。`,
      },
    ],
    pitfalls: [
      `把不变理解成逐点不动。不变只要求 ${texInline(String.raw`\sigma W`)} 落在 ${texInline("W")} 里，${texInline("W")} 中的向量可以在 ${texInline("W")} 内部移动。`,
      "以为不变子空间一定有不变的补空间。剪切只有一条不变直线，它没有不变的补空间。",
      `以为不变子空间里一定有实特征向量。实验中的 ${texInline("x_1x_2")} 平面不变，平面里每条直线却都被转走。`,
    ],
  },
  example: {
    title: "例题：求导的全部不变子空间",
    question: `${texInline(String.raw`P[x]_4`)} 是次数小于 4 的实系数多项式（连同 0）组成的空间，${texInline("D")} 是求导。${texInline("D")} 有哪些不变子空间？`,
    choices: [
      { correct: true, text: `恰有 5 个：${texInline(String.raw`\{0\},\ P[x]_1,\ P[x]_2,\ P[x]_3,\ P[x]_4`)}。` },
      { text: `只有 ${texInline(String.raw`\{0\}`)} 和 ${texInline(String.raw`P[x]_4`)}。` },
      { text: `每条直线 ${texInline(String.raw`L(x^k)`)} 都是不变子空间，所以至少有 4 个一维的。` },
      { text: `有无穷多个，因为 ${texInline("P[x]_4")} 有无穷多个子空间。` },
    ],
    steps: [
      `${texInline(String.raw`P[x]_k`)}（次数小于 ${texInline("k")}）显然不变：求导降低次数。`,
      `反过来，设 ${texInline(String.raw`W\ne\{0\}`)} 不变，取 ${texInline("W")} 中次数最高的 ${texInline("f")}，次数为 ${texInline("k-1")}。则 ${texInline(String.raw`f,Df,\dots,D^{k-1}f`)} 都在 ${texInline("W")} 里，次数依次是 ${texInline(String.raw`k-1,\dots,1,0`)}，线性无关，所以 ${texInline(String.raw`P[x]_k\subseteq W`)}。`,
      `${texInline("W")} 中多项式次数都不超过 ${texInline("k-1")}，又有 ${texInline(String.raw`W\subseteq P[x]_k`)}，故 ${texInline(String.raw`W=P[x]_k`)}。`,
      `${texInline(String.raw`L(x^k)`)}（${texInline(String.raw`k\ge1`)}）不变不成立：${texInline(String.raw`Dx^k=kx^{k-1}\notin L(x^k)`)}。一维不变子空间只有 ${texInline("L(1)")}，对应 ${texInline("D")} 唯一的特征值 ${texInline("0")}。`,
    ],
  },
  quiz: [
    {
      question: `实验中的 ${texInline("A")}（绕 ${texInline("x_3")} 轴转 90°，再沿 ${texInline("x_3")} 轴拉伸 2 倍）在实数域上恰有哪几个不变子空间？`,
      answer: `4 个：${texInline(String.raw`\{0\}`)}、${texInline("x_3")} 轴、${texInline("x_1x_2")} 平面、${texInline(String.raw`\mathbb R^3`)}。一维不变子空间是实特征向量的直线，只有 ${texInline(String.raw`\lambda=2`)} 的 ${texInline("x_3")} 轴；二维不变子空间上的限制，其特征多项式是 ${texInline(String.raw`(\lambda^2+1)(\lambda-2)`)} 的二次实因式，只能是 ${texInline(String.raw`\lambda^2+1`)}，对应 ${texInline(String.raw`\ker(A^2+E)`)}，即 ${texInline("x_1x_2")} 平面。`,
    },
    {
      question: `若 ${texInline(String.raw`\sigma\tau=\tau\sigma`)}，为什么 ${texInline(String.raw`\tau`)} 的核 ${texInline(String.raw`\tau^{-1}(0)`)} 是 ${texInline(String.raw`\sigma`)} 的不变子空间？`,
      answer: `${texInline(String.raw`\xi\in\tau^{-1}(0)`)} 时 ${texInline(String.raw`\tau(\sigma\xi)=\sigma(\tau\xi)=\sigma0=0`)}，所以 ${texInline(String.raw`\sigma\xi`)} 仍在 ${texInline(String.raw`\tau^{-1}(0)`)} 里。`,
    },
    {
      question: `${texInline("W_1")}、${texInline("W_2")} 都是 ${texInline(String.raw`\sigma`)} 的不变子空间，${texInline(String.raw`W_1\cap W_2`)} 和 ${texInline("W_1+W_2")} 还是吗？`,
      answer: `都是。${texInline(String.raw`\alpha\in W_1\cap W_2`)} 时 ${texInline(String.raw`\sigma\alpha`)} 同时在 ${texInline("W_1")}、${texInline("W_2")} 中；${texInline(String.raw`\sigma(\alpha_1+\alpha_2)=\sigma\alpha_1+\sigma\alpha_2\in W_1+W_2`)}。`,
    },
    {
      question: `剪切 ${texInline(String.raw`\begin{pmatrix}1&1\\0&1\end{pmatrix}`)} 的矩阵能化成准对角（两个 1 阶块）吗？`,
      answer: `不能。两个 1 阶块意味着两条不变直线组成直和，而剪切只有 ${texInline("x_1")} 轴一条不变直线；适配基下最多化成上三角形。`,
    },
  ],
  summary: [
    `${texInline(String.raw`\sigma W\subseteq W`)} 时 ${texInline("W")} 是不变子空间；只需检查生成元的像。`,
    `${texInline("V")} 分解成不变子空间的直和，就把 ${texInline(String.raw`\sigma`)} 的矩阵化成准对角形；一维不变子空间就是特征直线。`,
    `按特征值把 ${texInline("V")} 分成根子空间的直和，每块只剩一个特征值，§8 再在每块里化简。`,
  ],
});
