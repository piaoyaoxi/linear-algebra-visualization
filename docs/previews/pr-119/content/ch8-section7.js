defineChapter8Section("rational-canonical-form", {
  number: "§7",
  textbookSection: "矩阵的有理标准形",
  title: "矩阵的有理标准形",
  navTitle: "有理标准形",
  question: "不求特征值，能写出一个与 A 相似的标准矩阵吗？",
  goal: "会写多项式的伴随矩阵，知道它的不变因子是 1,…,1,d(λ)；掌握数域 P 上的矩阵相似于由不变因子的伴随矩阵组成的有理标准形。",
  tags: ["伴随矩阵", "弗罗贝尼乌斯块", "有理标准形", "任意数域"],
  intro:
    "若尔当形要求把特征多项式分解成一次因式，在有理数域或实数域上常常做不到。不变因子本身就是数域 P 上的多项式，每个不变因子写成一个伴随矩阵，拼起来就得到不必分解因式的标准形。",
  concepts: [
    { label: "伴随矩阵", text: "d(λ) 的伴随矩阵的不变因子为 1,…,1,d(λ)" },
    { label: "有理标准形", text: "A 相似于各个非常数不变因子的伴随矩阵拼成的准对角矩阵" },
  ],
  textbook: { reference: "北大版《高等代数》第八章 §7", items: ["多项式的伴随矩阵", "伴随矩阵的不变因子", "有理标准形的存在与唯一"] },
  interactive: { type: "slot", title: "伴随矩阵：平移加反馈" },
  lesson3d: {
    blocks: [
      {
        title: "伴随矩阵",
        tex: String.raw`d(\lambda)=\lambda^n+a_{n-1}\lambda^{n-1}+\cdots+a_1\lambda+a_0,\qquad C=\begin{pmatrix}0&0&\cdots&0&-a_0\\1&0&\cdots&0&-a_1\\0&1&\cdots&0&-a_2\\\vdots&&\ddots&&\vdots\\0&0&\cdots&1&-a_{n-1}\end{pmatrix}`,
        text: "C 称为 d(λ) 的伴随矩阵。|λE−C|=d(λ)；去掉 λE−C 的第一行和最后一列，剩下的 n−1 阶子式是对角线全为 −1 的三角形行列式，所以 Dₙ₋₁=1。于是 λE−C 的不变因子是 1,…,1,d(λ)，C 的最小多项式就是 d(λ)。",
        ponder: {
          q: "实矩阵 A 的特征多项式是 λ²+1，写出一个与它相似的实矩阵。",
          a: "λ²+1 在实数域上不可约，A 的不变因子只能是 1, λ²+1，有理标准形是伴随矩阵 (0 −1; 1 0)。",
        },
      },
      {
        title: "有理标准形",
        tex: String.raw`A\sim\begin{pmatrix}C(d_{k+1})&&\\&\ddots&\\&&C(d_n)\end{pmatrix},\qquad d_{k+1}\mid d_{k+2}\mid\cdots\mid d_n`,
        text: "设 A 是数域 P 上的 n 阶矩阵，d₁=⋯=dₖ=1，d_{k+1},…,dₙ 是次数大于零的不变因子。把它们的伴随矩阵依次拼成准对角矩阵，拼成的矩阵与 A 有相同的不变因子，所以与 A 相似，而且由 A 唯一决定。整个过程只用到 P 上的多项式运算。例如不变因子为 1, λ+1, λ²−λ−2 时，有理标准形是 diag((−1), (0 2; 1 1))。",
        ponder: {
          q: "A 的有理标准形只有一个块，说明什么？",
          a: "A 的不变因子是 1,…,1,f(λ)，最小多项式等于特征多项式。",
        },
      },
    ],
    pitfalls: [
      "把伴随矩阵最后一列写成 a₀, a₁, …。应当是 −a₀, −a₁, …, −aₙ₋₁。",
      "用初等因子拼伴随块。有理标准形用的是不变因子，每个次数大于零的不变因子一块。",
      "以为写有理标准形要先求特征值。它只需要不变因子，在任何数域上都能写出。",
    ],
  },
  example: {
    title: "例题：写出有理标准形",
    question: `三阶矩阵 A 的不变因子是 ${texInline(String.raw`1,\ \lambda-1,\ (\lambda-1)(\lambda+2)`)}。A 的有理标准形是哪一个？`,
    choices: [
      { correct: true, text: texInline(String.raw`\begin{pmatrix}1&0&0\\0&0&2\\0&1&-1\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}1&0&0\\0&0&-2\\0&1&1\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}1&0&0\\0&1&0\\0&0&-2\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}0&0&-2\\1&0&3\\0&1&0\end{pmatrix}`) },
    ],
    steps: [
      `次数大于零的不变因子是 ${texInline(String.raw`\lambda-1`)} 与 ${texInline(String.raw`(\lambda-1)(\lambda+2)=\lambda^2+\lambda-2`)}。`,
      `${texInline(String.raw`\lambda-1`)} 的伴随矩阵是 ${texInline("(1)")}；${texInline(String.raw`\lambda^2+\lambda-2`)} 中 ${texInline("a_0=-2,\\ a_1=1")}，伴随矩阵是 ${texInline(String.raw`\begin{pmatrix}0&2\\1&-1\end{pmatrix}`)}。拼起来得 ${texInline(String.raw`\begin{pmatrix}1&0&0\\0&0&2\\0&1&-1\end{pmatrix}`)}。`,
      `最后一列为 ${texInline(String.raw`(0,-2,1)^T`)} 的那一个没有变号；${texInline(String.raw`\operatorname{diag}(1,1,-2)`)} 是若尔当形，它与 A 相似，但不是有理标准形；左下方是 1、最后一列为 ${texInline(String.raw`(-2,3,0)^T`)} 的那一个是特征多项式 ${texInline(String.raw`\lambda^3-3\lambda+2`)} 的伴随矩阵，它的不变因子是 ${texInline(String.raw`1,1,(\lambda-1)^2(\lambda+2)`)}，与 A 不相似。`,
    ],
  },
  quiz: [
    {
      question: "有理标准形与若尔当标准形相比，有什么优点？",
      answer: "有理标准形只用不变因子，在任何数域上都存在，不需要把特征多项式分解成一次因式。",
    },
    {
      question: "A 的有理标准形中最后一块是谁的伴随矩阵？它与 A 的最小多项式有什么关系？",
      answer: "是最后一个不变因子 dₙ(λ) 的伴随矩阵，而 dₙ(λ) 就是 A 的最小多项式。",
    },
    {
      question: "两个有理数矩阵在复数域上相似，它们在有理数域上也相似吗？",
      answer: "相似。不变因子由子式的最大公因式算出，不随数域扩大而改变；两者的有理标准形相同，相似矩阵 X 可以取有理矩阵。",
    },
  ],
  summary: [
    "d(λ) 的伴随矩阵：次对角线上是 1，最后一列是 −a₀,…,−aₙ₋₁；它的不变因子是 1,…,1,d(λ)。",
    "数域 P 上的矩阵相似于由它的非常数不变因子的伴随矩阵拼成的有理标准形，且唯一。",
    "有理标准形不必分解因式，在任何数域上都能写出。",
  ],
});
