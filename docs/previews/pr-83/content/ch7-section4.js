defineChapter7Section("eigenvalues-eigenvectors", {
  number: "§4",
  textbookSection: "特征值与特征向量",
  title: "特征值与特征向量",
  navTitle: "特征值与特征向量",
  question: "哪些方向在线性变换下只被伸缩？",
  goal: "理解特征值、特征向量与特征子空间；会用特征多项式 |λE−A| 求特征值，用 (λ₀E−A)x=0 求特征向量；知道哈密顿–凯莱定理。",
  tags: ["特征值", "特征向量", "特征多项式", "特征子空间"],
  intro:
    "多数向量经过 σ 都会偏离原来的直线。若非零向量 ξ 满足 σξ=λ₀ξ，它所在的直线就被 σ 保持，只被伸缩或反向。转动下面的候选方向，找出这样的直线；在三维的例子里，它们能铺满一整个平面。",
  concepts: [
    { label: "特征向量", text: `${texInline(String.raw`\sigma\xi=\lambda_0\xi`)}，${texInline(String.raw`\xi\ne0`)}。` },
    { label: "特征多项式", text: `${texInline(String.raw`f(\lambda)=|\lambda E-A|`)}，它的根是特征值。` },
  ],
  textbook: { reference: "北大版《高等代数》第七章 §4", items: ["特征值与特征向量", "特征多项式", "特征子空间", "哈密顿–凯莱定理"] },
  interactive: { type: "slot", title: "哪些方向只被伸缩" },
  lesson3d: {
    blocks: [
      {
        title: "定义与求法",
        tex: String.raw`\sigma\xi=\lambda_0\xi\ (\xi\ne0)\iff (\lambda_0E-A)x=0\ \text{有非零解}\iff |\lambda_0E-A|=0`,
        text: "x 是 ξ 在一组基下的坐标，A 是 σ 在这组基下的矩阵。f(λ)=|λE−A| 称为 A 的特征多项式，它在数域 P 中的根就是 σ 的全部特征值；对每个特征值 λ₀ 解 (λ₀E−A)x=0，基础解系给出属于 λ₀ 的全部线性无关的特征向量。",
      },
      {
        title: "特征子空间可以是多维的",
        tex: String.raw`V_{\lambda_0}=\{\xi\in V:\ \sigma\xi=\lambda_0\xi\},\qquad \dim V_{\lambda_0}=n-\operatorname{rank}(\lambda_0E-A)`,
        text: "V_λ₀ 由属于 λ₀ 的全部特征向量连同零向量组成，是一个子空间。它的维数可以大于 1：实验里的三阶矩阵，V₋₁ 是整个平面 x₁+x₂+x₃=0，平面里每个方向都被反向。",
      },
      {
        title: "哈密顿–凯莱定理",
        tex: String.raw`f(\lambda)=|\lambda E-A|\ \Longrightarrow\ f(A)=a_nA^n+\cdots+a_1A+a_0E=O`,
        text: "相似矩阵的特征多项式相同，所以特征多项式属于线性变换本身，f(σ)=0。用它可以把 A 的高次幂降到 n−1 次以下；§9 的最小多项式是 f 的因式。",
      },
    ],
    pitfalls: [
      "把零向量算作特征向量。σ0=λ0 对任何 λ 都成立，所以要求 ξ≠0；特征值 λ₀=0 却是允许的。",
      "不说数域。旋转 90° 在实数域上没有特征值，在复数域上有 ±i。",
      "以为特征向量是唯一的。属于 λ₀ 的特征向量的非零线性组合仍是属于 λ₀ 的特征向量。",
    ],
  },
  example: {
    title: "例题：一个特征值对应一个平面",
    question: `求 ${texInline(String.raw`A=\begin{pmatrix}1&2&2\\2&1&2\\2&2&1\end{pmatrix}`)} 的特征值与特征子空间。`,
    choices: [
      { correct: true, text: `${texInline(String.raw`\lambda=5`)}，${texInline(String.raw`V_5=L((1,1,1)^T)`)}；${texInline(String.raw`\lambda=-1`)}（二重），${texInline(String.raw`V_{-1}`)} 是平面 ${texInline("x_1+x_2+x_3=0")}，维数 2。` },
      { text: "λ=5, −1, −1，每个特征值各对应一条特征直线。" },
      { text: "λ=1（三重），因为对角元都是 1。" },
      { text: "λ=3, 1, −1，因为它们的和等于迹 3。" },
    ],
    steps: [
      `${texInline(String.raw`|\lambda E-A|=(\lambda-5)(\lambda+1)^2`)}。（A=2J−E，J 是全 1 矩阵，也可以由 J 的特征值 3, 0, 0 直接得到。）`,
      `${texInline(String.raw`\lambda=5`)}：${texInline(String.raw`(5E-A)x=0`)} 化简得 ${texInline("x_1=x_2=x_3")}，${texInline(String.raw`V_5=L((1,1,1)^T)`)}。`,
      `${texInline(String.raw`\lambda=-1`)}：${texInline(String.raw`(-E-A)x=0`)} 的三个方程都是 ${texInline("x_1+x_2+x_3=0")}，秩为 1，基础解系 ${texInline(String.raw`(-1,1,0)^T,(-1,0,1)^T`)}，${texInline(String.raw`\dim V_{-1}=2`)}。`,
      `检验：${texInline(String.raw`5+(-1)+(-1)=3=\operatorname{tr}A`)}，${texInline(String.raw`5\cdot(-1)\cdot(-1)=5=|A|`)}。`,
    ],
  },
  quiz: [
    {
      question: `求导 D 在 ${texInline(String.raw`P[x]_n`)}（n≥2）上有哪些特征值和特征向量？`,
      answer: "在基 1, x, …, xⁿ⁻¹ 下 D 的矩阵主对角线全为 0 且是上三角的，特征多项式是 λⁿ，只有特征值 0；Df=0 的非零 f 是非零常数，V₀ 是一维的。",
    },
    {
      question: `${texInline(String.raw`M_2(\mathbb R)`)} 上的转置变换 ${texInline(String.raw`T(X)=X^T`)} 有哪些特征值？特征子空间各是几维？`,
      answer: "T²=E，所以特征值只能是 ±1。λ=1 对应对称矩阵，维数 3；λ=−1 对应反对称矩阵，维数 1。3+1=4，两者铺满 M₂。",
    },
    {
      question: "A 与 Aᵀ 的特征值相同吗？特征向量呢？",
      answer: "|λE−Aᵀ|=|λE−A|，特征值相同。特征向量一般不同：A=(1 1; 0 2) 属于 1 的是 (1,0)ᵀ，Aᵀ 属于 1 的是 (1,−1)ᵀ。",
    },
  ],
  summary: [
    "特征向量是所在直线被 σ 保持的非零向量：σξ=λ₀ξ。",
    "特征值是 |λE−A| 在 P 中的根；V_λ₀ 是 (λ₀E−A)x=0 的解空间，维数可以大于 1。",
    "哈密顿–凯莱定理：A 是自己特征多项式的根，f(A)=O。",
  ],
});
