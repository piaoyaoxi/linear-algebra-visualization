defineChapter7Section("image-and-kernel", {
  number: "§6",
  textbookSection: "线性变换的值域与核",
  title: "线性变换的值域与核",
  navTitle: "值域与核",
  question: "线性变换丢掉了哪些方向，又保留了哪些方向？",
  goal: "会求线性变换的值域 σV 与核 σ⁻¹(0)，理解维数公式 dim σV + dim σ⁻¹(0) = n，知道值域与核不一定互补。",
  tags: ["值域", "核", "秩", "维数公式"],
  intro:
    "σ 把一部分向量压成零，它们组成核 σ⁻¹(0)；全体像组成值域 σV。核越大，值域越小，两者的维数之和恰好是 n。下面沿核拖动一个点，看它的像为什么一动不动。",
  concepts: [
    { label: "值域", text: `${texInline(String.raw`\sigma V=\{\sigma\alpha:\ \alpha\in V\}`)}，维数称为 σ 的秩。` },
    { label: "核", text: `${texInline(String.raw`\sigma^{-1}(0)=\{\alpha\in V:\ \sigma\alpha=0\}`)}，维数称为 σ 的零度。` },
  ],
  textbook: { reference: "北大版《高等代数》第七章 §6", items: ["值域与核", "秩与零度", "维数公式"] },
  interactive: { type: "slot", title: "沿核滑动，像不动" },
  lesson3d: {
    blocks: [
      {
        title: "值域由基的像张成，维数等于矩阵的秩",
        tex: String.raw`\sigma V=L(\sigma\varepsilon_1,\dots,\sigma\varepsilon_n),\qquad \dim\sigma V=\operatorname{rank}A`,
        text: `A 是 σ 在基 ε₁,…,εₙ 下的矩阵。σεⱼ 的坐标是 A 的第 j 列，所以值域对应 A 的列空间；核对应齐次方程组 ${texInline("Ax=0")} 的解空间，它的一个基础解系给出核的一组基。`,
      },
      {
        title: "维数公式",
        tex: String.raw`\dim\sigma V+\dim\sigma^{-1}(0)=n`,
        text: "取核的一组基 ε₁,…,ε_k，扩充成 V 的基 ε₁,…,εₙ，则 σε_{k+1},…,σεₙ 是值域的一组基。推论：有限维空间上，σ 是单射 ⟺ σ 是满射 ⟺ σ 可逆。实验中沿核移动 x′，σx′ 不变，因为 x′−x 在核里；σx 的全部原像恰好组成 x+σ⁻¹(0)。",
      },
      {
        title: "维数互补，子空间未必互补",
        tex: String.raw`\sigma^2=\sigma\ \Longrightarrow\ V=\sigma V\oplus\sigma^{-1}(0)`,
        text: "维数公式只保证维数加起来是 n，σV 与 σ⁻¹(0) 却可以相交。求导 D 作用在 P[x]₃ 上，常数既在核里，又是 x 的导数，于是核含在值域里。σ²=σ 时 α=σα+(α−σα) 给出直和分解，实验的第一种模式就是这种情形。",
      },
    ],
    pitfalls: [
      "以为 V=σV⊕σ⁻¹(0) 总成立。它要求两者只交于零向量，D 在 P[x]₃ 上就不满足。",
      "把核 σ⁻¹(0) 读成逆变换作用在 0 上。σ⁻¹(0) 是被送到 0 的向量的集合，σ 不必可逆。",
      "用阶梯形里的列作为值域的基。应该取 A 中主元所在的原来的列，它们是 σεⱼ 的坐标。",
    ],
  },
  example: {
    title: "例题：矩阵空间上的值域与核",
    question: `在 ${texInline(String.raw`M_2(\mathbb R)`)} 上令 ${texInline(String.raw`\sigma(X)=X-X^{T}`)}。求 σ 的核与值域，它们的维数各是多少？`,
    choices: [
      { correct: true, text: "核是全体对称矩阵（3 维），值域是全体反对称矩阵（1 维）。" },
      { text: "核是全体反对称矩阵（1 维），值域是全体对称矩阵（3 维）。" },
      { text: "核只有零矩阵，σ 可逆。" },
      { text: "核是全体对称矩阵（3 维），值域是整个 M₂（4 维）。" },
    ],
    steps: [
      `${texInline(String.raw`\sigma(X)=0\iff X=X^{T}`)}，所以核是对称矩阵 ${texInline(String.raw`\begin{pmatrix}a&b\\b&c\end{pmatrix}`)} 组成的子空间，维数 3。`,
      `${texInline(String.raw`(X-X^{T})^{T}=-(X-X^{T})`)}，所以值域含在反对称矩阵里；反对称矩阵都是 ${texInline(String.raw`\begin{pmatrix}0&t\\-t&0\end{pmatrix}`)}，而它等于 ${texInline(String.raw`\sigma\begin{pmatrix}0&t\\0&0\end{pmatrix}`)}，所以值域恰是反对称矩阵，维数 1。`,
      "核对：3+1=4=dim M₂(ℝ)。",
      "对称矩阵与反对称矩阵只有零矩阵是公共的，所以这里 M₂(ℝ)=σV⊕σ⁻¹(0)。和 D 在 P[x]₃ 上的情形对照：维数公式两边都成立，直和只在这里成立。",
    ],
  },
  quiz: [
    {
      question: `σ²=0（σ 作用两次得零变换）等价于值域与核之间的什么关系？用 ${texInline(String.raw`\begin{pmatrix}0&1\\0&0\end{pmatrix}`)} 检验。`,
      answer: "σ²=0 ⟺ σ(σα)=0 对一切 α ⟺ σV⊆σ⁻¹(0)。这个矩阵把 (a,b)ᵀ 送到 (b,0)ᵀ：核是 x₁ 轴，值域也是 x₁ 轴，两者重合，维数 1+1=2。",
    },
    {
      question: "有限维空间 V 上，σ 是单射和 σ 是满射有什么关系？在 P[x] 上求导 D 是什么情形？",
      answer: "有限维时二者等价：单射 ⟺ 核为 0 ⟺ 值域维数为 n ⟺ 满射。P[x] 是无限维的，D 是满射（每个多项式都有原函数），却不是单射（常数被送到 0）。",
    },
    {
      question: "实验第一种模式中 σ²=σ。为什么这时 ℝ³=σV⊕σ⁻¹(0)？",
      answer: "任一 α=σα+(α−σα)，且 σ(α−σα)=σα−σ²α=0，所以和是全空间；若 β=σγ 又在核里，则 β=σγ=σ²γ=σβ=0，交为零。",
    },
    {
      question: "σ 在某组基下的矩阵是 3 阶矩阵 A，rank A=2。σ 的核是几维的？σ 可能是满射吗？",
      answer: "核是 3−2=1 维的；值域只有 2 维，不是满射。",
    },
  ],
  summary: [
    "值域 σV=L(σε₁,…,σεₙ)，维数等于 rank A；核对应 Ax=0 的解空间。",
    "dim σV+dim σ⁻¹(0)=n；有限维时单射、满射、可逆三者等价。",
    "维数互补不等于子空间互补：σV 与 σ⁻¹(0) 可以相交；只有两者只交于零向量时才是直和（例如 σ²=σ 时）。",
  ],
});
