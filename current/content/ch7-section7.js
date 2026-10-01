defineChapter7Section("invariant-subspaces", {
  number: "§7",
  textbookSection: "不变子空间",
  title: "不变子空间",
  navTitle: "不变子空间",
  question: "哪些子空间在 σ 作用下不会离开自己？",
  goal: "理解不变子空间的定义与常见例子，知道不变子空间的直和分解对应准对角矩阵，了解按特征值的根子空间分解。",
  tags: ["不变子空间", "准对角矩阵", "根子空间"],
  intro:
    "σ 把子空间 W 映进 W 自身时，W 称为 σ 的不变子空间，这时可以只在 W 里研究 σ，矩阵也随之分块。一维的不变子空间就是特征向量所在的直线；二维的不变平面却可以不含任何实特征向量。",
  concepts: [
    { label: "不变子空间", text: `${texInline(String.raw`\sigma W\subseteq W`)}，即 W 中每个向量的像仍在 W 中。` },
    { label: "准对角", text: "V 分解成不变子空间的直和时，适配基下 σ 的矩阵是准对角矩阵。" },
  ],
  textbook: { reference: "北大版《高等代数》第七章 §7", items: ["不变子空间的定义与例", "不变子空间与矩阵化简", "按特征值分解为不变子空间的直和"] },
  interactive: { type: "slot", title: "σW 有没有离开 W" },
  lesson3d: {
    blocks: [
      {
        title: "定义与常见的不变子空间",
        tex: String.raw`\sigma W\subseteq W\iff \sigma\alpha_1,\dots,\sigma\alpha_s\in W\quad(W=L(\alpha_1,\dots,\alpha_s))`,
        text: "检验时只需看生成元的像。{0}、V、值域 σV、核 σ⁻¹(0)、每个特征子空间 V_λ 都是 σ 的不变子空间。一维子空间 L(ξ) 不变，当且仅当 ξ 是特征向量。若 στ=τσ，则 τ 的值域与核都是 σ 的不变子空间。",
      },
      {
        title: "不变子空间让矩阵分块",
        tex: String.raw`V=W_1\oplus W_2,\ \ \sigma W_i\subseteq W_i\ \Longrightarrow\ \sigma(\varepsilon_1,\dots,\varepsilon_n)=(\varepsilon_1,\dots,\varepsilon_n)\begin{pmatrix}A_1&0\\0&A_2\end{pmatrix}`,
        text: "ε₁,…,εₖ 是 W₁ 的基，εₖ₊₁,…,εₙ 是 W₂ 的基，A₁、A₂ 是 σ 限制在 W₁、W₂ 上的矩阵。只有 W₁ 不变时，把 W₁ 的基扩充成 V 的基，矩阵是右上角带一块的分块上三角形。实验中 A 的不变平面配上不变直线，得到 2 阶块和 1 阶块。",
      },
      {
        title: "按特征值分解",
        tex: String.raw`f(\lambda)=(\lambda-\lambda_1)^{r_1}\cdots(\lambda-\lambda_s)^{r_s}\ \Longrightarrow\ V=V_1\oplus\cdots\oplus V_s,\quad V_i=\{\xi:\ (\sigma-\lambda_iE)^{r_i}\xi=0\}`,
        text: "f 是 σ 的特征多项式。每个 Vᵢ 都是不变子空间，于是 σ 的矩阵化成 s 块，每块只有一个特征值 λᵢ。Vᵢ 一般比特征子空间 V_λᵢ 大，§8 在每个 Vᵢ 里继续化简。",
      },
    ],
    pitfalls: [
      "把不变理解成逐点不动。不变只要求 σW 落在 W 里，W 中的向量可以在 W 内部移动。",
      "以为不变子空间一定有不变的补空间。剪切只有一条不变直线，它没有不变的补空间。",
      "以为不变子空间里一定有实特征向量。实验中的 x₁x₂ 平面不变，平面里每条直线却都被转走。",
    ],
  },
  example: {
    title: "例题：求导的全部不变子空间",
    question: `${texInline(String.raw`P[x]_4`)} 是次数小于 4 的实系数多项式（连同 0）组成的空间，D 是求导。D 有哪些不变子空间？`,
    choices: [
      { correct: true, text: `恰有 5 个：${texInline(String.raw`\{0\},\ P[x]_1,\ P[x]_2,\ P[x]_3,\ P[x]_4`)}。` },
      { text: `只有 ${texInline(String.raw`\{0\}`)} 和 ${texInline(String.raw`P[x]_4`)}。` },
      { text: `每条直线 ${texInline(String.raw`L(x^k)`)} 都是不变子空间，所以至少有 4 个一维的。` },
      { text: "有无穷多个，因为 P[x]₄ 有无穷多个子空间。" },
    ],
    steps: [
      `${texInline(String.raw`P[x]_k`)}（次数小于 k）显然不变：求导降低次数。`,
      `反过来，设 W≠{0} 不变，取 W 中次数最高的 f，次数为 k−1。则 ${texInline(String.raw`f,Df,\dots,D^{k-1}f`)} 都在 W 里，次数依次是 k−1,…,1,0，线性无关，所以 ${texInline(String.raw`P[x]_k\subseteq W`)}。`,
      `W 中多项式次数都不超过 k−1，又有 ${texInline(String.raw`W\subseteq P[x]_k`)}，故 ${texInline(String.raw`W=P[x]_k`)}。`,
      `${texInline(String.raw`L(x^k)`)}（k≥1）不变不成立：${texInline(String.raw`Dx^k=kx^{k-1}\notin L(x^k)`)}。一维不变子空间只有 L(1)，对应 D 唯一的特征值 0。`,
    ],
  },
  quiz: [
    {
      question: "实验中的 A（绕 x₃ 轴转 90°，再沿 x₃ 轴拉伸 2 倍）在实数域上恰有哪几个不变子空间？",
      answer: "4 个：{0}、x₃ 轴、x₁x₂ 平面、ℝ³。一维不变子空间是实特征向量的直线，只有 λ=2 的 x₃ 轴；二维不变子空间上的限制，其特征多项式是 (λ²+1)(λ−2) 的二次实因式，只能是 λ²+1，对应 ker(A²+E)，即 x₁x₂ 平面。",
    },
    {
      question: "若 στ=τσ，为什么 τ 的核 τ⁻¹(0) 是 σ 的不变子空间？",
      answer: "ξ∈τ⁻¹(0) 时 τ(σξ)=σ(τξ)=σ0=0，所以 σξ 仍在 τ⁻¹(0) 里。",
    },
    {
      question: "W₁、W₂ 都是 σ 的不变子空间，W₁∩W₂ 和 W₁+W₂ 还是吗？",
      answer: "都是。α∈W₁∩W₂ 时 σα 同时在 W₁、W₂ 中；σ(α₁+α₂)=σα₁+σα₂∈W₁+W₂。",
    },
    {
      question: `剪切 ${texInline(String.raw`\begin{pmatrix}1&1\\0&1\end{pmatrix}`)} 的矩阵能化成准对角（两个 1 阶块）吗？`,
      answer: "不能。两个 1 阶块意味着两条不变直线组成直和，而剪切只有 x₁ 轴一条不变直线；适配基下最多化成上三角形。",
    },
  ],
  summary: [
    "σW⊆W 时 W 是不变子空间；只需检查生成元的像。",
    "V 分解成不变子空间的直和，就把 σ 的矩阵化成准对角形；一维不变子空间就是特征直线。",
    "按特征值把 V 分成根子空间的直和，每块只剩一个特征值，§8 再在每块里化简。",
  ],
});
