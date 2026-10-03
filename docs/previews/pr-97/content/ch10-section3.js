defineChapter10Section("bilinear-form", {
  number: "§3",
  textbookSection: "双线性函数",
  title: "双线性函数",
  navTitle: "双线性函数",
  question: "两个向量怎样一起读出一个数？",
  goal: "理解双线性函数与度量矩阵 aᵢⱼ=f(εᵢ,εⱼ)，会用 f(α,β)=XᵀAY 计算；掌握换基公式 B=CᵀAC，会判断非退化，能把双线性函数分成对称与反对称两部分。",
  tags: ["双线性函数", "度量矩阵", "合同", "非退化", "对称与反对称"],
  intro:
    "双线性函数 f(α,β) 同时读两个向量，对每个变量都是线性的。固定 β，f(·,β) 就是一个线性函数，画出来是一族平行线；β 一动，这族线跟着转动，疏密也变。取定基后，f 的全部信息记在度量矩阵 A 里。",
  concepts: [
    { label: "度量矩阵", text: texInline(String.raw`f(\alpha,\beta)=X^TAY,\ a_{ij}=f(\varepsilon_i,\varepsilon_j)`) },
    { label: "换基", text: texInline(String.raw`(\eta)=(\varepsilon)C\Rightarrow B=C^TAC`) },
  ],
  textbook: { reference: "北大版《高等代数》第十章 §3", items: ["双线性函数与度量矩阵", "换基与合同", "非退化双线性函数", "对称与反对称双线性函数"] },
  interactive: { type: "slot", title: "固定一个变量，得到一个线性函数" },
  lesson3d: {
    blocks: [
      {
        title: "度量矩阵",
        tex: String.raw`f(\alpha,\beta)=X^TAY,\qquad A=\big(f(\varepsilon_i,\varepsilon_j)\big)_{n\times n}`,
        text: "f 对每个变量都线性：f(k₁α₁+k₂α₂,β)=k₁f(α₁,β)+k₂f(α₂,β)，对 β 同样成立。X、Y 是 α、β 的坐标。固定 β，f(α,β) 是 α 的线性函数，系数是 AY；固定 α，系数是 AᵀX。",
        ponder: {
          q: "a₁₂ 与 a₂₁ 分别读的是什么？",
          a: "a₁₂=f(ε₁,ε₂)，a₂₁=f(ε₂,ε₁)。f 不对称时两者可以不同，下标的次序不能交换。",
        },
      },
      {
        title: "换基与合同",
        tex: String.raw`(\eta_1,\dots,\eta_n)=(\varepsilon_1,\dots,\varepsilon_n)C\ \Longrightarrow\ B=C^TAC`,
        text: "B 的 (i,j) 元是 f(ηᵢ,ηⱼ)。同一个双线性函数在不同基下的度量矩阵彼此合同，秩相同。f 称为非退化的，指 f(α,β)=0 对一切 β 成立时必有 α=0；这当且仅当度量矩阵满足 |A|≠0。",
        ponder: {
          q: "B=CᵀAC 与第七章线性变换的换基公式 X⁻¹AX 为什么不同？",
          a: "双线性函数的两个变量都要换坐标：把 X=CX′、Y=CY′ 代入 XᵀAY，得到 X′ᵀ(CᵀAC)Y′。",
        },
      },
      {
        title: "对称与反对称",
        tex: String.raw`A=\tfrac12\left(A+A^T\right)+\tfrac12\left(A-A^T\right)`,
        text: "f(α,β)=f(β,α) 时称 f 对称，度量矩阵对称，并且可以选基使它成为对角矩阵；f(α,β)=−f(β,α) 时称 f 反对称，此时 f(α,α)=0。每个双线性函数都唯一地写成对称部分与反对称部分之和。",
        ponder: {
          q: "f(α,β)=x₁y₂ 的对称部分与反对称部分各是什么？",
          a: "对称部分 ½(x₁y₂+x₂y₁)，反对称部分 ½(x₁y₂−x₂y₁)。",
        },
      },
    ],
    pitfalls: [
      "换基时写成 C⁻¹AC。双线性函数的度量矩阵按合同 CᵀAC 变化。",
      "把 aᵢⱼ 记成 f(εⱼ,εᵢ)。f 不对称时，次序一换矩阵就成了 Aᵀ。",
      "以为 A≠0 就非退化。非退化要求 |A|≠0。",
    ],
  },
  example: {
    title: "例题：换基后的度量矩阵",
    question: `双线性函数 f 在基 ε₁, ε₂ 下的度量矩阵是 ${texInline(String.raw`A=\begin{pmatrix}1&2\\0&3\end{pmatrix}`)}。新基 ${texInline(String.raw`\eta_1=\varepsilon_1,\ \eta_2=\varepsilon_1+\varepsilon_2`)} 下的度量矩阵是什么？`,
    choices: [
      { correct: true, text: texInline(String.raw`\begin{pmatrix}1&3\\1&6\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}1&0\\0&3\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}1&3\\0&3\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}1&2\\0&3\end{pmatrix}`) },
    ],
    steps: [
      `过渡矩阵 ${texInline(String.raw`C=\begin{pmatrix}1&1\\0&1\end{pmatrix}`)}，新矩阵 ${texInline("B=C^TAC")}。`,
      `逐个读出：${texInline(String.raw`f(\eta_1,\eta_1)=a_{11}=1`)}，${texInline(String.raw`f(\eta_1,\eta_2)=a_{11}+a_{12}=3`)}，${texInline(String.raw`f(\eta_2,\eta_1)=a_{11}+a_{21}=1`)}，${texInline(String.raw`f(\eta_2,\eta_2)=1+2+0+3=6`)}。`,
      `所以 ${texInline(String.raw`B=\begin{pmatrix}1&3\\1&6\end{pmatrix}`)}，与 ${texInline("C^TAC")} 相符。`,
      `${texInline(String.raw`\begin{pmatrix}1&0\\0&3\end{pmatrix}`)} 是 ${texInline("C^{-1}AC")}，那是线性变换的换基公式；${texInline(String.raw`\begin{pmatrix}1&3\\0&3\end{pmatrix}`)} 是 ${texInline("AC")}，只换了第二个变量；A 本身是旧基下的矩阵。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("P^2")} 上 ${texInline("f(x,y)=x_1y_2")} 的度量矩阵是什么？f 非退化吗？`,
      answer: "A=(0 1; 0 0)，|A|=0，f 退化：例如 f(ε₂,β)=0 对一切 β 成立，而 ε₂≠0。",
    },
    {
      question: "为什么同一个双线性函数在不同基下的度量矩阵秩相同？",
      answer: "B=CᵀAC，C 可逆，乘可逆矩阵不改变秩。所以“非退化”与基的选取无关。",
    },
    {
      question: "欧氏空间的内积 (α,β) 是双线性函数吗？它的度量矩阵有什么特点？",
      answer: "是，并且是对称的；它的度量矩阵对称正定，就是第九章的度量矩阵。",
    },
  ],
  summary: [
    "取定基后 f(α,β)=XᵀAY，aᵢⱼ=f(εᵢ,εⱼ)；固定一个变量，就得到另一个变量的线性函数。",
    "换基 (η)=(ε)C 时度量矩阵变成 CᵀAC，彼此合同；f 非退化当且仅当 |A|≠0。",
    "每个双线性函数唯一地分成对称部分与反对称部分。",
  ],
});
