defineChapter7Section("image-and-kernel", {
  number: "§6",
  textbookSection: "线性变换的值域与核",
  title: "线性变换的值域与核",
  navTitle: "值域与核",
  question: "线性变换丢掉了哪些方向，又保留了哪些方向？",
  goal: `会求线性变换的值域 ${texInline(String.raw`\sigma V`)} 与核 ${texInline(String.raw`\sigma^{-1}(0)`)}，理解维数公式 ${texInline(String.raw`\dim\sigma V+\dim\sigma^{-1}(0)=n`)}，知道值域与核不一定互补。`,
  tags: ["值域", "核", "秩", "维数公式"],
  intro:
    `${texInline(String.raw`\sigma`)} 把一部分向量压成零，它们组成核 ${texInline(String.raw`\sigma^{-1}(0)`)}；全体像组成值域 ${texInline(String.raw`\sigma V`)}。核越大，值域越小，两者的维数之和恰好是 ${texInline("n")}。下面沿核拖动一个点，看它的像为什么一动不动。`,
  concepts: [
    { label: "值域", text: `${texInline(String.raw`\sigma V=\{\sigma\alpha:\ \alpha\in V\}`)}，维数称为 ${texInline(String.raw`\sigma`)} 的秩。` },
    { label: "核", text: `${texInline(String.raw`\sigma^{-1}(0)=\{\alpha\in V:\ \sigma\alpha=0\}`)}，维数称为 ${texInline(String.raw`\sigma`)} 的零度。` },
  ],
  textbook: { reference: "北大版《高等代数》第七章 §6", items: ["值域与核", "秩与零度", "维数公式"] },
  interactive: { type: "slot", title: "沿核滑动，像不动" },
  lesson3d: {
    blocks: [
      {
        title: "值域由基的像张成，维数等于矩阵的秩",
        tex: String.raw`\sigma V=L(\sigma\varepsilon_1,\dots,\sigma\varepsilon_n),\qquad \dim\sigma V=\operatorname{rank}A`,
        text: `${texInline("A")} 是 ${texInline(String.raw`\sigma`)} 在基 ${texInline(String.raw`\varepsilon_1,\dots,\varepsilon_n`)} 下的矩阵。${texInline(String.raw`\sigma\varepsilon_j`)} 的坐标是 ${texInline("A")} 的第 ${texInline("j")} 列，所以值域对应 ${texInline("A")} 的列空间；核对应齐次方程组 ${texInline("Ax=0")} 的解空间，它的一个基础解系给出核的一组基。`,
      },
      {
        title: "维数公式",
        tex: String.raw`\dim\sigma V+\dim\sigma^{-1}(0)=n`,
        text: `取核的一组基 ${texInline(String.raw`\varepsilon_1,\dots,\varepsilon_k`)}，扩充成 ${texInline("V")} 的基 ${texInline(String.raw`\varepsilon_1,\dots,\varepsilon_n`)}，则 ${texInline(String.raw`\sigma\varepsilon_{k+1},\dots,\sigma\varepsilon_n`)} 是值域的一组基。推论：有限维空间上，${texInline(String.raw`\sigma`)} 是单射 ${texInline(String.raw`\iff`)} ${texInline(String.raw`\sigma`)} 是满射 ${texInline(String.raw`\iff`)} ${texInline(String.raw`\sigma`)} 可逆。实验中沿核移动 ${texInline("x'")}，${texInline(String.raw`\sigma x'`)} 不变，因为 ${texInline("x'-x")} 在核里；${texInline(String.raw`\sigma x`)} 的全部原像恰好组成 ${texInline(String.raw`x+\sigma^{-1}(0)`)}。`,
      },
      {
        title: "维数互补，子空间未必互补",
        tex: String.raw`\sigma^2=\sigma\ \Longrightarrow\ V=\sigma V\oplus\sigma^{-1}(0)`,
        text: `维数公式只保证维数加起来是 ${texInline("n")}，${texInline(String.raw`\sigma V`)} 与 ${texInline(String.raw`\sigma^{-1}(0)`)} 却可以相交。求导 ${texInline("D")} 作用在 ${texInline("P[x]_3")} 上，常数既在核里，又是 ${texInline("x")} 的导数，于是核含在值域里。${texInline(String.raw`\sigma^2=\sigma`)} 时 ${texInline(String.raw`\alpha=\sigma\alpha+(\alpha-\sigma\alpha)`)} 给出直和分解，实验的第一种模式就是这种情形。`,
      },
    ],
    pitfalls: [
      `以为 ${texInline(String.raw`V=\sigma V\oplus\sigma^{-1}(0)`)} 总成立。它要求两者只交于零向量，${texInline("D")} 在 ${texInline("P[x]_3")} 上就不满足。`,
      `把核 ${texInline(String.raw`\sigma^{-1}(0)`)} 读成逆变换作用在 ${texInline("0")} 上。${texInline(String.raw`\sigma^{-1}(0)`)} 是被送到 ${texInline("0")} 的向量的集合，${texInline(String.raw`\sigma`)} 不必可逆。`,
      `用阶梯形里的列作为值域的基。应该取 ${texInline("A")} 中主元所在的原来的列，它们是 ${texInline(String.raw`\sigma\varepsilon_j`)} 的坐标。`,
    ],
  },
  example: {
    title: "例题：矩阵空间上的值域与核",
    question: `在 ${texInline(String.raw`M_2(\mathbb R)`)} 上令 ${texInline(String.raw`\sigma(X)=X-X^{T}`)}。求 ${texInline(String.raw`\sigma`)} 的核与值域，它们的维数各是多少？`,
    choices: [
      { correct: true, text: "核是全体对称矩阵（3 维），值域是全体反对称矩阵（1 维）。" },
      { text: "核是全体反对称矩阵（1 维），值域是全体对称矩阵（3 维）。" },
      { text: `核只有零矩阵，${texInline(String.raw`\sigma`)} 可逆。` },
      { text: `核是全体对称矩阵（3 维），值域是整个 ${texInline("M_2")}（4 维）。` },
    ],
    steps: [
      `${texInline(String.raw`\sigma(X)=0\iff X=X^{T}`)}，所以核是对称矩阵 ${texInline(String.raw`\begin{pmatrix}a&b\\b&c\end{pmatrix}`)} 组成的子空间，维数 3。`,
      `${texInline(String.raw`(X-X^{T})^{T}=-(X-X^{T})`)}，所以值域含在反对称矩阵里；反对称矩阵都是 ${texInline(String.raw`\begin{pmatrix}0&t\\-t&0\end{pmatrix}`)}，而它等于 ${texInline(String.raw`\sigma\begin{pmatrix}0&t\\0&0\end{pmatrix}`)}，所以值域恰是反对称矩阵，维数 1。`,
      `核对：${texInline(String.raw`3+1=4=\dim M_2(\mathbb R)`)}。`,
      `对称矩阵与反对称矩阵只有零矩阵是公共的，所以这里 ${texInline(String.raw`M_2(\mathbb R)=\sigma V\oplus\sigma^{-1}(0)`)}。和 ${texInline("D")} 在 ${texInline("P[x]_3")} 上的情形对照：维数公式两边都成立，直和只在这里成立。`,
    ],
  },
  quiz: [
    {
      question: `${texInline(String.raw`\sigma^2=0`)}（${texInline(String.raw`\sigma`)} 作用两次得零变换）等价于值域与核之间的什么关系？用 ${texInline(String.raw`\begin{pmatrix}0&1\\0&0\end{pmatrix}`)} 检验。`,
      answer: `${texInline(String.raw`\sigma^2=0\iff\sigma(\sigma\alpha)=0`)} 对一切 ${texInline(String.raw`\alpha`)} ${texInline(String.raw`\iff\sigma V\subseteq\sigma^{-1}(0)`)}。这个矩阵把 ${texInline("(a,b)^T")} 送到 ${texInline("(b,0)^T")}：核是 ${texInline("x_1")} 轴，值域也是 ${texInline("x_1")} 轴，两者重合，维数 ${texInline("1+1=2")}。`,
    },
    {
      question: `有限维空间 ${texInline("V")} 上，${texInline(String.raw`\sigma`)} 是单射和 ${texInline(String.raw`\sigma`)} 是满射有什么关系？在 ${texInline("P[x]")} 上求导 ${texInline("D")} 是什么情形？`,
      answer: `有限维时二者等价：单射 ${texInline(String.raw`\iff`)} 核为 ${texInline("0")} ${texInline(String.raw`\iff`)} 值域维数为 ${texInline("n")} ${texInline(String.raw`\iff`)} 满射。${texInline("P[x]")} 是无限维的，${texInline("D")} 是满射（每个多项式都有原函数），却不是单射（常数被送到 ${texInline("0")}）。`,
    },
    {
      question: `实验第一种模式中 ${texInline(String.raw`\sigma^2=\sigma`)}。为什么这时 ${texInline(String.raw`\mathbb R^3=\sigma V\oplus\sigma^{-1}(0)`)}？`,
      answer: `任一 ${texInline(String.raw`\alpha=\sigma\alpha+(\alpha-\sigma\alpha)`)}，且 ${texInline(String.raw`\sigma(\alpha-\sigma\alpha)=\sigma\alpha-\sigma^2\alpha=0`)}，所以和是全空间；若 ${texInline(String.raw`\beta=\sigma\gamma`)} 又在核里，则 ${texInline(String.raw`\beta=\sigma\gamma=\sigma^2\gamma=\sigma\beta=0`)}，交为零。`,
    },
    {
      question: `${texInline(String.raw`\sigma`)} 在某组基下的矩阵是 3 阶矩阵 ${texInline("A")}，${texInline(String.raw`\operatorname{rank}A=2`)}。${texInline(String.raw`\sigma`)} 的核是几维的？${texInline(String.raw`\sigma`)} 可能是满射吗？`,
      answer: `核是 ${texInline("3-2=1")} 维的；值域只有 2 维，不是满射。`,
    },
  ],
  summary: [
    `值域 ${texInline(String.raw`\sigma V=L(\sigma\varepsilon_1,\dots,\sigma\varepsilon_n)`)}，维数等于 ${texInline(String.raw`\operatorname{rank}A`)}；核对应 ${texInline("Ax=0")} 的解空间。`,
    `${texInline(String.raw`\dim\sigma V+\dim\sigma^{-1}(0)=n`)}；有限维时单射、满射、可逆三者等价。`,
    `维数互补不等于子空间互补：${texInline(String.raw`\sigma V`)} 与 ${texInline(String.raw`\sigma^{-1}(0)`)} 可以相交；只有两者只交于零向量时才是直和（例如 ${texInline(String.raw`\sigma^2=\sigma`)} 时）。`,
  ],
});
