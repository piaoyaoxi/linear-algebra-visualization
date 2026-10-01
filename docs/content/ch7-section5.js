defineChapter7Section("diagonal-matrices", {
  number: "§5",
  textbookSection: "对角矩阵",
  title: "对角矩阵",
  navTitle: "对角矩阵",
  question: "有了特征向量组成的基，Aᵏ 为什么变得好算？",
  goal: "掌握 σ 可对角化的条件，会写 X⁻¹AX=diag(λ₁,…,λₙ) 并用它计算 Aᵏ；看懂迭代 xₖ₊₁=Axₖ 的长期走向。",
  tags: ["可对角化", "特征向量基", "矩阵的幂"],
  intro:
    "在特征向量组成的基下，σ 只把每个坐标各乘一个数，作用 k 次就是各乘 λᵢᵏ。把初始向量拆成特征向量的组合，每一份按自己的 λ 独立增长或衰减。下面反复作用 A，看点最终跑向哪里。",
  concepts: [
    { label: "可对角化", text: "σ 在某组基下的矩阵是对角矩阵，当且仅当 σ 有 n 个线性无关的特征向量。" },
    { label: "幂", text: `${texInline(String.raw`A^k=X\operatorname{diag}(\lambda_1^k,\dots,\lambda_n^k)X^{-1}`)}` },
  ],
  textbook: { reference: "北大版《高等代数》第七章 §5", items: ["线性变换可对角化的条件", "属于不同特征值的特征向量线性无关", "矩阵的对角化"] },
  interactive: { type: "slot", title: "反复作用 A，点跑向哪里" },
  lesson3d: {
    blocks: [
      {
        title: "可对角化的判别",
        tex: String.raw`X^{-1}AX=\operatorname{diag}(\lambda_1,\dots,\lambda_n)\iff AX_i=\lambda_iX_i\ (i=1,\dots,n),\ X_1,\dots,X_n\ \text{线性无关}`,
        text: "Xᵢ 是 X 的第 i 列，它是属于 λᵢ 的特征向量，列的顺序与对角元一一对应。属于不同特征值的特征向量线性无关，所以 n 个互不相同的特征值保证可对角化；有重根时，要看各特征子空间的维数之和是否等于 n。",
      },
      {
        title: "幂与迭代",
        tex: String.raw`x_0=c_1X_1+\cdots+c_nX_n\ \Longrightarrow\ A^kx_0=c_1\lambda_1^kX_1+\cdots+c_n\lambda_n^kX_n`,
        text: "|λ|<1 的分量衰减，|λ|>1 的分量增长，λ=1 的分量保持不变。k 很大时，|λ| 最大且系数不为 0 的那一份占主导，点贴着它的特征直线运动。",
      },
      {
        title: "特征向量不够时",
        text: "A=(1 1; 0 1) 的特征值 1 是二重根，V₁ 只有一维，不能对角化。它的迭代 (x₁,x₂)↦(x₁+x₂,x₂) 每步平移 x₂，是等差的漂移，拆不成按几何级数伸缩的分量。§8 用若尔当形描述这种情形。",
      },
    ],
    pitfalls: [
      "X 的列顺序与对角元顺序对不上。交换 X 的两列，对角矩阵里的两个特征值也要交换。",
      "以为有重特征值就不能对角化。单位矩阵 E 的特征值全相同，它本身就是对角矩阵。",
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
      `${texInline(String.raw`X=\begin{pmatrix}1&1\\1&-2\end{pmatrix}`)}，${texInline(String.raw`X^{-1}=\tfrac13\begin{pmatrix}2&1\\1&-1\end{pmatrix}`)}，${texInline(String.raw`A^n=X\operatorname{diag}(5^n,2^n)X^{-1}`)}，乘出来就是选项 A。`,
      `检验 n=1：${texInline(String.raw`\tfrac13\begin{pmatrix}12&3\\6&9\end{pmatrix}=A`)}。最后一个选项把 ${texInline(String.raw`5^n,2^n`)} 与 X 的列配错了，n=1 时得不到 A。`,
    ],
  },
  quiz: [
    {
      question: "n 个互不相同的特征值能推出可对角化。反过来，可对角化的矩阵一定有 n 个互不相同的特征值吗？",
      answer: "不一定，单位矩阵 E 就是反例。",
    },
    {
      question: "在上面的例题中，从 x₀=(1,−2)ᵀ 出发反复乘 A，点怎样运动？从 (1,0)ᵀ 出发呢？",
      answer: "(1,−2)ᵀ 是属于 2 的特征向量，xₖ=2ᵏ(1,−2)ᵀ 一直在这条直线上。(1,0)ᵀ=⅔(1,1)ᵀ+⅓(1,−2)ᵀ，xₖ=⅔·5ᵏ(1,1)ᵀ+⅓·2ᵏ(1,−2)ᵀ，5ᵏ 的分量占主导，方向趋近 (1,1)ᵀ。",
    },
    {
      question: "若 A²=A，A 的特征值只能是什么？",
      answer: "Aξ=λξ 推出 A²ξ=λ²ξ=λξ，所以 λ²=λ，λ=0 或 1。§9 会说明这样的 A 一定可对角化。",
    },
  ],
  summary: [
    "σ 可对角化当且仅当有 n 个线性无关的特征向量；X 的列与对角元一一对应。",
    "Aᵏ=X diag(λᵢᵏ) X⁻¹：把向量拆成特征分量，每一份按自己的 λ 独立伸缩。",
    "特征向量不够时不能对角化，迭代出现等差漂移，留给若尔当形处理。",
  ],
});
