defineChapter8Section("lambda-matrix", {
  number: "§1",
  textbookSection: "λ-矩阵",
  title: "λ-矩阵",
  navTitle: "λ-矩阵",
  question: "λE−A 比 A 多告诉了我们什么？",
  goal: "知道 λ-矩阵是元素为 λ 的多项式的矩阵；会判断 λ-矩阵的秩与可逆性；理解代入 λ₀ 后的秩记录了特征向量的个数。",
  tags: ["λ-矩阵", "特征矩阵", "秩", "可逆 λ-矩阵"],
  intro:
    "把 λE−A 看成一个整体，它是元素为 λ 的多项式的矩阵。它的行列式是特征多项式，只告诉我们 λ 在哪里使矩阵降秩；矩阵本身还告诉我们降了多少。下面让 λ₀ 扫过数轴，比较几个特征多项式相同的例子。",
  concepts: [
    { label: "λ-矩阵", text: texInline(String.raw`A(\lambda)=(a_{ij}(\lambda)),\ a_{ij}(\lambda)\in P[\lambda]`) },
    { label: "可逆", text: texInline(String.raw`A(\lambda)\ \text{可逆}\iff|A(\lambda)|=d\ne0`) },
  ],
  textbook: { reference: "北大版《高等代数》第八章 §1", items: ["λ-矩阵", "λ-矩阵的秩", "可逆的 λ-矩阵"] },
  interactive: { type: "slot", title: "沿数轴扫描 λ" },
  lesson3d: {
    blocks: [
      {
        title: "λ-矩阵与它的秩",
        tex: String.raw`A(\lambda)=\begin{pmatrix}a_{11}(\lambda)&\cdots&a_{1n}(\lambda)\\\vdots&&\vdots\\a_{m1}(\lambda)&\cdots&a_{mn}(\lambda)\end{pmatrix},\qquad a_{ij}(\lambda)\in P[\lambda]`,
        text: "λ-矩阵的加法、乘法和行列式与数字矩阵的规则相同，只是元素换成了多项式。A(λ) 中不恒为零的子式的最高阶数称为它的秩。|λE−A| 是 n 次多项式，不是零多项式，所以 λE−A 的秩总是 n；把 λ 换成一个数 λ₀ 以后，数字矩阵 λ₀E−A 的秩可能更小，降低的数目 n−rank(λ₀E−A) 就是属于 λ₀ 的线性无关特征向量的个数。",
        ponder: {
          q: "A=(2 1; 0 2) 与 2E 的特征多项式都是 (λ−2)²。代入 λ=2 后，两个特征矩阵的秩一样吗？",
          a: "不一样。2E−A 的秩是 1，2E−2E 是零矩阵，秩为 0。特征多项式相同，特征矩阵却不同。",
        },
      },
      {
        title: "可逆的 λ-矩阵",
        tex: String.raw`A(\lambda)B(\lambda)=B(\lambda)A(\lambda)=E\quad\iff\quad |A(\lambda)|=d,\ d\ \text{是非零常数}`,
        text: "若 A(λ)B(λ)=E，两边取行列式得 |A(λ)|·|B(λ)|=1，两个多项式相乘等于 1，它们只能都是非零常数。反过来，|A(λ)|=d≠0 时 B(λ)=A*(λ)/d 的元素仍是多项式。所以判断标准是行列式为非零常数，仅仅不是零多项式还不够。",
        ponder: {
          q: "λE−A 是可逆的 λ-矩阵吗？",
          a: "不是。|λE−A| 是 n 次多项式（n≥1），不是常数。",
        },
      },
    ],
    pitfalls: [
      "把“秩为 n”当成“可逆”。|λE−A| 不是零多项式，秩为 n；它不是常数，所以不可逆。",
      "以为对每个实数 λ₀ 都满秩就可逆。|A(λ)|=λ²+1 在实轴上没有零点，A(λ) 仍然不可逆。",
      "以为特征多项式相同，代入同一个特征值后秩就相同。秩要由 λ₀E−A 本身决定。",
    ],
  },
  example: {
    title: "例题：哪一个 λ-矩阵可逆",
    question: "下列 λ-矩阵中，哪一个是可逆的 λ-矩阵？",
    choices: [
      { correct: true, text: texInline(String.raw`\begin{pmatrix}\lambda&\lambda+1\\\lambda-1&\lambda\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}2&0\\0&\lambda\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}\lambda&1\\-1&\lambda\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}\lambda&\lambda\\1&1\end{pmatrix}`) },
    ],
    steps: [
      `逐个算行列式：${texInline(String.raw`\lambda\cdot\lambda-(\lambda+1)(\lambda-1)=1`)}，是非零常数，所以第一个可逆，逆矩阵为 ${texInline(String.raw`\begin{pmatrix}\lambda&-\lambda-1\\1-\lambda&\lambda\end{pmatrix}`)}。`,
      `${texInline(String.raw`\begin{vmatrix}2&0\\0&\lambda\end{vmatrix}=2\lambda`)}，不是常数，逆矩阵中会出现 ${texInline(String.raw`\tfrac1\lambda`)}。`,
      `${texInline(String.raw`\begin{vmatrix}\lambda&1\\-1&\lambda\end{vmatrix}=\lambda^2+1`)}，在实数处都不为零，但它不是常数，逆矩阵的元素带分母 ${texInline(String.raw`\lambda^2+1`)}。`,
      `${texInline(String.raw`\begin{vmatrix}\lambda&\lambda\\1&1\end{vmatrix}=0`)}，两列相同，秩为 1。`,
    ],
  },
  quiz: [
    {
      question: "n 阶矩阵 A 的特征矩阵 λE−A 的秩是多少？代入 λ₀ 后的秩说明了什么？",
      answer: "秩是 n，因为 |λE−A| 是 n 次多项式。n−rank(λ₀E−A) 是属于 λ₀ 的线性无关特征向量的个数，它为 0 说明 λ₀ 不是特征值。",
    },
    {
      question: "可逆 λ-矩阵 A(λ) 的逆矩阵的行列式是什么？",
      answer: "若 |A(λ)|=d，则 |A(λ)⁻¹|=1/d，也是非零常数。",
    },
    {
      question: "两个可逆 λ-矩阵的乘积可逆吗？",
      answer: "可逆。乘积的行列式是两个非零常数之积，仍是非零常数；逆矩阵为 B(λ)⁻¹A(λ)⁻¹。",
    },
  ],
  summary: [
    "λ-矩阵的元素是 P[λ] 中的多项式；它可逆当且仅当行列式是非零常数。",
    "λE−A 的秩总是 n，行列式就是特征多项式。",
    "代入 λ₀ 后，n−rank(λ₀E−A) 记录属于 λ₀ 的特征向量个数；特征多项式相同的矩阵在这里可以不同。",
  ],
});
