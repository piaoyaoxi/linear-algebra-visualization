defineChapter7Section("diagonal-matrices", {
  number: "§5",
  textbookSection: "对角矩阵",
  title: "对角矩阵",
  navTitle: "对角矩阵",
  question: `有了特征向量组成的基，${texInline("A^k")} 为什么变得好算？`,
  goal: `掌握 ${texInline(String.raw`\sigma`)} 可对角化的条件，会写 ${texInline(String.raw`X^{-1}AX=\operatorname{diag}(\lambda_1,\dots,\lambda_n)`)} 并用它计算 ${texInline("A^k")}；看懂迭代 ${texInline("x_{k+1}=Ax_k")} 的长期走向。`,
  tags: ["可对角化", "特征向量基", "矩阵的幂"],
  intro:
    `在特征向量组成的基下，${texInline(String.raw`\sigma`)} 只把每个坐标各乘一个数，作用 ${texInline("k")} 次就是各乘 ${texInline(String.raw`\lambda_i^k`)}。把初始向量拆成特征向量的组合，每一份按自己的 ${texInline(String.raw`\lambda`)} 独立增长或衰减。下面反复作用 ${texInline("A")}，看点最终跑向哪里。`,
  concepts: [
    { label: "可对角化", text: `${texInline(String.raw`\sigma`)} 在某组基下的矩阵是对角矩阵，当且仅当 ${texInline(String.raw`\sigma`)} 有 ${texInline("n")} 个线性无关的特征向量。` },
    { label: "幂", text: `${texInline(String.raw`A^k=X\operatorname{diag}(\lambda_1^k,\dots,\lambda_n^k)X^{-1}`)}` },
  ],
  textbook: { reference: "北大版《高等代数》第七章 §5", items: ["线性变换可对角化的条件", "属于不同特征值的特征向量线性无关", "矩阵的对角化"] },
  interactive: { type: "slot", title: "反复作用 A，点跑向哪里" },
  lesson3d: {
    blocks: [
      {
        title: "可对角化的判别",
        tex: String.raw`X^{-1}AX=\operatorname{diag}(\lambda_1,\dots,\lambda_n)\iff AX_i=\lambda_iX_i\ (i=1,\dots,n),\ X_1,\dots,X_n\ \text{线性无关}`,
        text: `${texInline("X_i")} 是 ${texInline("X")} 的第 ${texInline("i")} 列，它是属于 ${texInline(String.raw`\lambda_i`)} 的特征向量，列的顺序与对角元一一对应。属于不同特征值的特征向量线性无关，所以 ${texInline("n")} 个互不相同的特征值保证可对角化；有重根时，要看各特征子空间的维数之和是否等于 ${texInline("n")}。`,
      },
      {
        title: "幂与迭代",
        tex: String.raw`x_0=c_1X_1+\cdots+c_nX_n\ \Longrightarrow\ A^kx_0=c_1\lambda_1^kX_1+\cdots+c_n\lambda_n^kX_n`,
        text: `${texInline(String.raw`|\lambda|<1`)} 的分量衰减，${texInline(String.raw`|\lambda|>1`)} 的分量增长，${texInline(String.raw`\lambda=1`)} 的分量保持不变。${texInline("k")} 很大时，${texInline(String.raw`|\lambda|`)} 最大且系数不为 0 的那一份占主导，点贴着它的特征直线运动。`,
      },
      {
        title: "特征向量不够时",
        text: `${texInline(String.raw`A=\begin{pmatrix}1&1\\0&1\end{pmatrix}`)} 的特征值 ${texInline("1")} 是二重根，${texInline("V_1")} 只有一维，不能对角化。它的迭代 ${texInline(String.raw`(x_1,x_2)\mapsto(x_1+x_2,x_2)`)} 每步平移 ${texInline("x_2")}，是等差的漂移，拆不成按几何级数伸缩的分量。§8 用若尔当形描述这种情形。`,
      },
    ],
    pitfalls: [
      `${texInline("X")} 的列顺序与对角元顺序对不上。交换 ${texInline("X")} 的两列，对角矩阵里的两个特征值也要交换。`,
      `以为有重特征值就不能对角化。单位矩阵 ${texInline("E")} 的特征值全相同，它本身就是对角矩阵。`,
      "以为特征向量必须互相垂直。一般矩阵的特征向量只需线性无关。",
    ],
  },
  example: {
    title: "例题：用对角化求 Aⁿ",
    question: `${texInline(String.raw`A=\begin{pmatrix}4&1\\2&3\end{pmatrix}`)}，求 ${texInline("A^n")}。`,
    choices: [
      { correct: true, text: texInline(String.raw`A^n=\tfrac13\begin{pmatrix}2\cdot5^n+2^n&5^n-2^n\\2\cdot5^n-2\cdot2^n&5^n+2\cdot2^n\end{pmatrix}`) },
      { text: texInline(String.raw`A^n=\begin{pmatrix}4^n&1\\2&3^n\end{pmatrix}`) },
      { text: texInline(String.raw`A^n=\begin{pmatrix}5^n&0\\0&2^n\end{pmatrix}`) },
      { text: texInline(String.raw`A^n=\tfrac13\begin{pmatrix}2\cdot2^n+5^n&2^n-5^n\\2\cdot2^n-2\cdot5^n&2^n+2\cdot5^n\end{pmatrix}`) },
    ],
    steps: [
      `${texInline(String.raw`|\lambda E-A|=(\lambda-4)(\lambda-3)-2=(\lambda-5)(\lambda-2)`)}。`,
      `${texInline(String.raw`\lambda=5`)}：${texInline("x_1=x_2")}，取 ${texInline(String.raw`X_1=(1,1)^T`)}；${texInline(String.raw`\lambda=2`)}：${texInline("2x_1+x_2=0")}，取 ${texInline(String.raw`X_2=(1,-2)^T`)}。`,
      `${texInline(String.raw`X=\begin{pmatrix}1&1\\1&-2\end{pmatrix}`)}，${texInline(String.raw`X^{-1}=\tfrac13\begin{pmatrix}2&1\\1&-1\end{pmatrix}`)}，${texInline(String.raw`A^n=X\operatorname{diag}(5^n,2^n)X^{-1}`)}，乘出来就是左上角为 ${texInline(String.raw`\tfrac13(2\cdot5^n+2^n)`)} 的那一项。`,
      `检验 ${texInline("n=1")}：${texInline(String.raw`\tfrac13\begin{pmatrix}12&3\\6&9\end{pmatrix}=A`)}。左上角为 ${texInline(String.raw`\tfrac13(2\cdot2^n+5^n)`)} 的那一项把 ${texInline(String.raw`5^n,2^n`)} 与 ${texInline("X")} 的列配错了，${texInline("n=1")} 时得不到 ${texInline("A")}。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("n")} 个互不相同的特征值能推出可对角化。反过来，可对角化的矩阵一定有 ${texInline("n")} 个互不相同的特征值吗？`,
      answer: `不一定，单位矩阵 ${texInline("E")} 就是反例。`,
    },
    {
      question: `在上面的例题中，从 ${texInline("x_0=(1,-2)^T")} 出发反复乘 ${texInline("A")}，点怎样运动？从 ${texInline("(1,0)^T")} 出发呢？`,
      answer: `${texInline("(1,-2)^T")} 是属于 ${texInline("2")} 的特征向量，${texInline(String.raw`x_k=2^k(1,-2)^T`)} 一直在这条直线上。${texInline(String.raw`(1,0)^T=\tfrac23(1,1)^T+\tfrac13(1,-2)^T`)}，${texInline(String.raw`x_k=\tfrac23\cdot5^k(1,1)^T+\tfrac13\cdot2^k(1,-2)^T`)}，${texInline("5^k")} 的分量占主导，方向趋近 ${texInline("(1,1)^T")}。`,
    },
    {
      question: `若 ${texInline("A^2=A")}，${texInline("A")} 的特征值只能是什么？`,
      answer: `${texInline(String.raw`A\xi=\lambda\xi`)} 推出 ${texInline(String.raw`A^2\xi=\lambda^2\xi=\lambda\xi`)}，所以 ${texInline(String.raw`\lambda^2=\lambda`)}，${texInline(String.raw`\lambda=0`)} 或 ${texInline("1")}。§9 会说明这样的 ${texInline("A")} 一定可对角化。`,
    },
  ],
  summary: [
    `${texInline(String.raw`\sigma`)} 可对角化当且仅当有 ${texInline("n")} 个线性无关的特征向量；${texInline("X")} 的列与对角元一一对应。`,
    `${texInline(String.raw`A^k=X\operatorname{diag}(\lambda_i^k)X^{-1}`)}：把向量拆成特征分量，每一份按自己的 ${texInline(String.raw`\lambda`)} 独立伸缩。`,
    "特征向量不够时不能对角化，迭代出现等差漂移，留给若尔当形处理。",
  ],
});
