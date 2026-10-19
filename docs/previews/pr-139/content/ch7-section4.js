defineChapter7Section("eigenvalues-eigenvectors", {
  number: "§4",
  textbookSection: "特征值与特征向量",
  title: "特征值与特征向量",
  navTitle: "特征值与特征向量",
  question: "哪些方向在线性变换下只被伸缩？",
  goal: `理解特征值、特征向量与特征子空间；会用特征多项式 ${texInline(String.raw`|\lambda E-A|`)} 求特征值，用 ${texInline(String.raw`(\lambda_0E-A)x=0`)} 求特征向量；知道哈密顿–凯莱定理。`,
  tags: ["特征值", "特征向量", "特征多项式", "特征子空间"],
  intro:
    `多数向量经过 ${texInline(String.raw`\sigma`)} 都会偏离原来的直线。若非零向量 ${texInline(String.raw`\xi`)} 满足 ${texInline(String.raw`\sigma\xi=\lambda_0\xi`)}，它所在的直线就被 ${texInline(String.raw`\sigma`)} 保持，只被伸缩或反向。转动下面的候选方向，找出这样的直线；在三维的例子里，它们能铺满一整个平面。`,
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
        text: `${texInline("x")} 是 ${texInline(String.raw`\xi`)} 在一组基下的坐标，${texInline("A")} 是 ${texInline(String.raw`\sigma`)} 在这组基下的矩阵。${texInline(String.raw`f(\lambda)=|\lambda E-A|`)} 称为 ${texInline("A")} 的特征多项式，它在数域 ${texInline("P")} 中的根就是 ${texInline(String.raw`\sigma`)} 的全部特征值；对每个特征值 ${texInline(String.raw`\lambda_0`)} 解 ${texInline(String.raw`(\lambda_0E-A)x=0`)}，基础解系给出属于 ${texInline(String.raw`\lambda_0`)} 的全部线性无关的特征向量。`,
      },
      {
        title: "特征子空间可以是多维的",
        tex: String.raw`V_{\lambda_0}=\{\xi\in V:\ \sigma\xi=\lambda_0\xi\},\qquad \dim V_{\lambda_0}=n-\operatorname{rank}(\lambda_0E-A)`,
        text: `${texInline(String.raw`V_{\lambda_0}`)} 由属于 ${texInline(String.raw`\lambda_0`)} 的全部特征向量连同零向量组成，是一个子空间。它的维数可以大于 1：实验里的三阶矩阵，${texInline("V_{-1}")} 是整个平面 ${texInline("x_1+x_2+x_3=0")}，平面里每个方向都被反向。`,
      },
      {
        title: "哈密顿–凯莱定理",
        tex: String.raw`f(\lambda)=|\lambda E-A|\ \Longrightarrow\ f(A)=a_nA^n+\cdots+a_1A+a_0E=O`,
        text: `相似矩阵的特征多项式相同，所以特征多项式属于线性变换本身，${texInline(String.raw`f(\sigma)=0`)}。用它可以把 ${texInline("A")} 的高次幂降到 ${texInline("n-1")} 次以下；§9 的最小多项式是 ${texInline("f")} 的因式。`,
      },
    ],
    pitfalls: [
      `把零向量算作特征向量。${texInline(String.raw`\sigma0=\lambda0`)} 对任何 ${texInline(String.raw`\lambda`)} 都成立，所以要求 ${texInline(String.raw`\xi\ne0`)}；特征值 ${texInline(String.raw`\lambda_0=0`)} 却是允许的。`,
      `不说数域。旋转 90° 在实数域上没有特征值，在复数域上有 ${texInline(String.raw`\pm i`)}。`,
      `以为特征向量是唯一的。属于 ${texInline(String.raw`\lambda_0`)} 的特征向量的非零线性组合仍是属于 ${texInline(String.raw`\lambda_0`)} 的特征向量。`,
    ],
  },
  example: {
    title: "例题：一个特征值对应一个平面",
    question: `求 ${texInline(String.raw`A=\begin{pmatrix}1&2&2\\2&1&2\\2&2&1\end{pmatrix}`)} 的特征值与特征子空间。`,
    choices: [
      { correct: true, text: `${texInline(String.raw`\lambda=5`)}，${texInline(String.raw`V_5=L((1,1,1)^T)`)}；${texInline(String.raw`\lambda=-1`)}（二重），${texInline(String.raw`V_{-1}`)} 是平面 ${texInline("x_1+x_2+x_3=0")}，维数 2。` },
      { text: `${texInline(String.raw`\lambda=5,-1,-1`)}，每个特征值各对应一条特征直线。` },
      { text: `${texInline(String.raw`\lambda=1`)}（三重），因为对角元都是 ${texInline("1")}。` },
      { text: `${texInline(String.raw`\lambda=3,1,-1`)}，因为它们的和等于迹 ${texInline("3")}。` },
    ],
    steps: [
      `${texInline(String.raw`|\lambda E-A|=(\lambda-5)(\lambda+1)^2`)}。（${texInline("A=2J-E")}，${texInline("J")} 是全 1 矩阵，也可以由 ${texInline("J")} 的特征值 ${texInline("3,0,0")} 直接得到。）`,
      `${texInline(String.raw`\lambda=5`)}：${texInline(String.raw`(5E-A)x=0`)} 化简得 ${texInline("x_1=x_2=x_3")}，${texInline(String.raw`V_5=L((1,1,1)^T)`)}。`,
      `${texInline(String.raw`\lambda=-1`)}：${texInline(String.raw`(-E-A)x=0`)} 的三个方程都是 ${texInline("x_1+x_2+x_3=0")}，秩为 1，基础解系 ${texInline(String.raw`(-1,1,0)^T,(-1,0,1)^T`)}，${texInline(String.raw`\dim V_{-1}=2`)}。`,
      `检验：${texInline(String.raw`5+(-1)+(-1)=3=\operatorname{tr}A`)}，${texInline(String.raw`5\cdot(-1)\cdot(-1)=5=|A|`)}。`,
    ],
  },
  quiz: [
    {
      question: `求导 ${texInline("D")} 在 ${texInline(String.raw`P[x]_n`)}（${texInline(String.raw`n\ge2`)}）上有哪些特征值和特征向量？`,
      answer: `在基 ${texInline(String.raw`1,x,\dots,x^{n-1}`)} 下 ${texInline("D")} 的矩阵主对角线全为 ${texInline("0")} 且是上三角的，特征多项式是 ${texInline(String.raw`\lambda^n`)}，只有特征值 ${texInline("0")}；${texInline("Df=0")} 的非零 ${texInline("f")} 是非零常数，${texInline("V_0")} 是一维的。`,
    },
    {
      question: `${texInline(String.raw`M_2(\mathbb R)`)} 上的转置变换 ${texInline(String.raw`T(X)=X^T`)} 有哪些特征值？特征子空间各是几维？`,
      answer: `${texInline("T^2=E")}，所以特征值只能是 ${texInline(String.raw`\pm1`)}。${texInline(String.raw`\lambda=1`)} 对应对称矩阵，维数 3；${texInline(String.raw`\lambda=-1`)} 对应反对称矩阵，维数 1。${texInline("3+1=4")}，两者铺满 ${texInline("M_2")}。`,
    },
    {
      question: `${texInline("A")} 与 ${texInline("A^T")} 的特征值相同吗？特征向量呢？`,
      answer: `${texInline(String.raw`|\lambda E-A^T|=|\lambda E-A|`)}，特征值相同。特征向量一般不同：${texInline(String.raw`A=\begin{pmatrix}1&1\\0&2\end{pmatrix}`)} 属于 ${texInline("1")} 的是 ${texInline("(1,0)^T")}，${texInline("A^T")} 属于 ${texInline("1")} 的是 ${texInline("(1,-1)^T")}。`,
    },
  ],
  summary: [
    `特征向量是所在直线被 ${texInline(String.raw`\sigma`)} 保持的非零向量：${texInline(String.raw`\sigma\xi=\lambda_0\xi`)}。`,
    `特征值是 ${texInline(String.raw`|\lambda E-A|`)} 在 ${texInline("P")} 中的根；${texInline(String.raw`V_{\lambda_0}`)} 是 ${texInline(String.raw`(\lambda_0E-A)x=0`)} 的解空间，维数可以大于 1。`,
    `哈密顿–凯莱定理：${texInline("A")} 是自己特征多项式的根，${texInline("f(A)=O")}。`,
  ],
});
