defineChapter10Section("bilinear-form", {
  number: "§3",
  textbookSection: "双线性函数",
  title: "双线性函数",
  navTitle: "双线性函数",
  question: "两个向量怎样一起读出一个数？",
  goal: `理解双线性函数与度量矩阵 ${texInline(String.raw`a_{ij}=f(\varepsilon_i,\varepsilon_j)`)}，会用 ${texInline(String.raw`f(\alpha,\beta)=X^TAY`)} 计算；掌握换基公式 ${texInline("B=C^TAC")}，会判断非退化，能把双线性函数分成对称与反对称两部分。`,
  tags: ["双线性函数", "度量矩阵", "合同", "非退化", "对称与反对称"],
  intro:
    `双线性函数 ${texInline(String.raw`f(\alpha,\beta)`)} 同时读两个向量，对每个变量都是线性的。固定 ${texInline(String.raw`\beta`)}，${texInline(String.raw`f(\cdot,\beta)`)} 就是一个线性函数，画出来是一族平行线；${texInline(String.raw`\beta`)} 一动，这族线跟着转动，疏密也变。取定基后，${texInline("f")} 的全部信息记在度量矩阵 ${texInline("A")} 里。`,
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
        text: `${texInline("f")} 对每个变量都线性：${texInline(String.raw`f(k_1\alpha_1+k_2\alpha_2,\beta)=k_1f(\alpha_1,\beta)+k_2f(\alpha_2,\beta)`)}，对 ${texInline(String.raw`\beta`)} 同样成立。${texInline(String.raw`X`)}、${texInline(String.raw`Y`)} 是 ${texInline(String.raw`\alpha`)}、${texInline(String.raw`\beta`)} 的坐标。固定 ${texInline(String.raw`\beta`)}，${texInline(String.raw`f(\alpha,\beta)`)} 是 ${texInline(String.raw`\alpha`)} 的线性函数，系数是 ${texInline(String.raw`AY`)}；固定 ${texInline(String.raw`\alpha`)}，系数是 ${texInline(String.raw`A^TX`)}。`,
        ponder: {
          q: `${texInline("a_{12}")} 与 ${texInline("a_{21}")} 分别读的是什么？`,
          a: `${texInline(String.raw`a_{12}=f(\varepsilon_1,\varepsilon_2)`)}，${texInline(String.raw`a_{21}=f(\varepsilon_2,\varepsilon_1)`)}。${texInline("f")} 不对称时两者可以不同，下标的次序不能交换。`,
        },
      },
      {
        title: "换基与合同",
        tex: String.raw`(\eta_1,\dots,\eta_n)=(\varepsilon_1,\dots,\varepsilon_n)C\ \Longrightarrow\ B=C^TAC`,
        text: `${texInline("B")} 的 ${texInline("(i,j)")} 元是 ${texInline(String.raw`f(\eta_i,\eta_j)`)}。同一个双线性函数在不同基下的度量矩阵彼此合同，秩相同。${texInline("f")} 称为非退化的，指 ${texInline(String.raw`f(\alpha,\beta)=0`)} 对一切 ${texInline(String.raw`\beta`)} 成立时必有 ${texInline(String.raw`\alpha=0`)}；这当且仅当度量矩阵满足 ${texInline(String.raw`|A|\ne0`)}。`,
        ponder: {
          q: `${texInline("B=C^TAC")} 与第七章线性变换的换基公式 ${texInline("X^{-1}AX")} 为什么不同？`,
          a: `双线性函数的两个变量都要换坐标：把 ${texInline("X=CX'")}、${texInline("Y=CY'")} 代入 ${texInline("X^TAY")}，得到 ${texInline("X'^T(C^TAC)Y'")}。`,
        },
      },
      {
        title: "对称与反对称",
        tex: String.raw`A=\tfrac12\left(A+A^T\right)+\tfrac12\left(A-A^T\right)`,
        text: `${texInline(String.raw`f(\alpha,\beta)=f(\beta,\alpha)`)} 时称 ${texInline("f")} 对称，度量矩阵对称，并且可以选基使它成为对角矩阵；${texInline(String.raw`f(\alpha,\beta)=-f(\beta,\alpha)`)} 时称 ${texInline("f")} 反对称，此时 ${texInline(String.raw`f(\alpha,\alpha)=0`)}。每个双线性函数都唯一地写成对称部分与反对称部分之和。`,
        ponder: {
          q: `${texInline(String.raw`f(\alpha,\beta)=x_1y_2`)} 的对称部分与反对称部分各是什么？`,
          a: `对称部分 ${texInline(String.raw`\tfrac12(x_1y_2+x_2y_1)`)}，反对称部分 ${texInline(String.raw`\tfrac12(x_1y_2-x_2y_1)`)}。`,
        },
      },
    ],
    pitfalls: [
      `换基时写成 ${texInline("C^{-1}AC")}。双线性函数的度量矩阵按合同 ${texInline("C^TAC")} 变化。`,
      `把 ${texInline("a_{ij}")} 记成 ${texInline(String.raw`f(\varepsilon_j,\varepsilon_i)`)}。${texInline("f")} 不对称时，次序一换矩阵就成了 ${texInline("A^T")}。`,
      `以为 ${texInline(String.raw`A\ne0`)} 就非退化。非退化要求 ${texInline(String.raw`|A|\ne0`)}。`,
    ],
  },
  example: {
    title: "例题：换基后的度量矩阵",
    question: `双线性函数 ${texInline("f")} 在基 ${texInline(String.raw`\varepsilon_1,\varepsilon_2`)} 下的度量矩阵是 ${texInline(String.raw`A=\begin{pmatrix}1&2\\0&3\end{pmatrix}`)}。新基 ${texInline(String.raw`\eta_1=\varepsilon_1,\ \eta_2=\varepsilon_1+\varepsilon_2`)} 下的度量矩阵是什么？`,
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
      `${texInline(String.raw`\begin{pmatrix}1&0\\0&3\end{pmatrix}`)} 是 ${texInline("C^{-1}AC")}，那是线性变换的换基公式；${texInline(String.raw`\begin{pmatrix}1&3\\0&3\end{pmatrix}`)} 是 ${texInline("AC")}，只换了第二个变量；${texInline("A")} 本身是旧基下的矩阵。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("P^2")} 上 ${texInline("f(x,y)=x_1y_2")} 的度量矩阵是什么？${texInline("f")} 非退化吗？`,
      answer: `${texInline(String.raw`A=\begin{pmatrix}0&1\\0&0\end{pmatrix}`)}，${texInline("|A|=0")}，${texInline("f")} 退化：例如 ${texInline(String.raw`f(\varepsilon_2,\beta)=0`)} 对一切 ${texInline(String.raw`\beta`)} 成立，而 ${texInline(String.raw`\varepsilon_2\ne0`)}。`,
    },
    {
      question: "为什么同一个双线性函数在不同基下的度量矩阵秩相同？",
      answer: `${texInline("B=C^TAC")}，${texInline("C")} 可逆，乘可逆矩阵不改变秩。所以“非退化”与基的选取无关。`,
    },
    {
      question: `欧氏空间的内积 ${texInline(String.raw`(\alpha,\beta)`)} 是双线性函数吗？它的度量矩阵有什么特点？`,
      answer: "是，并且是对称的；它的度量矩阵对称正定，就是第九章的度量矩阵。",
    },
  ],
  summary: [
    `取定基后 ${texInline(String.raw`f(\alpha,\beta)=X^TAY`)}，${texInline(String.raw`a_{ij}=f(\varepsilon_i,\varepsilon_j)`)}；固定一个变量，就得到另一个变量的线性函数。`,
    `换基 ${texInline(String.raw`(\eta)=(\varepsilon)C`)} 时度量矩阵变成 ${texInline("C^TAC")}，彼此合同；${texInline("f")} 非退化当且仅当 ${texInline(String.raw`|A|\ne0`)}。`,
    "每个双线性函数唯一地分成对称部分与反对称部分。",
  ],
});
