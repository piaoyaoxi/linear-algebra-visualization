defineChapter8Section("lambda-matrix", {
  number: "§1",
  textbookSection: "λ-矩阵",
  title: "λ-矩阵",
  navTitle: "λ-矩阵",
  question: `${texInline(String.raw`\lambda E-A`)} 比 ${texInline("A")} 多告诉了我们什么？`,
  goal: `知道 ${texInline(String.raw`\lambda`)}-矩阵是元素为 ${texInline(String.raw`\lambda`)} 的多项式的矩阵；会判断 ${texInline(String.raw`\lambda`)}-矩阵的秩与可逆性；理解代入 ${texInline(String.raw`\lambda_0`)} 后的秩记录了特征向量的个数。`,
  tags: ["λ-矩阵", "特征矩阵", "秩", "可逆 λ-矩阵"],
  intro:
    `把 ${texInline(String.raw`\lambda E-A`)} 看成一个整体，它是元素为 ${texInline(String.raw`\lambda`)} 的多项式的矩阵。它的行列式是特征多项式，只告诉我们 ${texInline(String.raw`\lambda`)} 在哪里使矩阵降秩；矩阵本身还告诉我们降了多少。下面让 ${texInline(String.raw`\lambda_0`)} 扫过数轴，比较几个特征多项式相同的例子。`,
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
        text: `${texInline(String.raw`\lambda`)}-矩阵的加法、乘法和行列式与数字矩阵的规则相同，只是元素换成了多项式。${texInline(String.raw`A(\lambda)`)} 中不恒为零的子式的最高阶数称为它的秩。${texInline(String.raw`|\lambda E-A|`)} 是 ${texInline("n")} 次多项式，不是零多项式，所以 ${texInline(String.raw`\lambda E-A`)} 的秩总是 ${texInline("n")}；把 ${texInline(String.raw`\lambda`)} 换成一个数 ${texInline(String.raw`\lambda_0`)} 以后，数字矩阵 ${texInline(String.raw`\lambda_0E-A`)} 的秩可能更小，降低的数目 ${texInline(String.raw`n-\operatorname{rank}(\lambda_0E-A)`)} 就是属于 ${texInline(String.raw`\lambda_0`)} 的线性无关特征向量的个数。`,
        ponder: {
          q: `${texInline(String.raw`A=\begin{pmatrix}2&1\\0&2\end{pmatrix}`)} 与 ${texInline("2E")} 的特征多项式都是 ${texInline(String.raw`(\lambda-2)^2`)}。代入 ${texInline(String.raw`\lambda=2`)} 后，两个特征矩阵的秩一样吗？`,
          a: `不一样。${texInline("2E-A")} 的秩是 1，${texInline("2E-2E")} 是零矩阵，秩为 0。特征多项式相同，特征矩阵却不同。`,
        },
      },
      {
        title: "可逆的 λ-矩阵",
        tex: String.raw`A(\lambda)B(\lambda)=B(\lambda)A(\lambda)=E\quad\iff\quad |A(\lambda)|=d,\ d\ \text{是非零常数}`,
        text: `若 ${texInline(String.raw`A(\lambda)B(\lambda)=E`)}，两边取行列式得 ${texInline(String.raw`|A(\lambda)|\cdot|B(\lambda)|=1`)}，两个多项式相乘等于 1，它们只能都是非零常数。反过来，${texInline(String.raw`|A(\lambda)|=d\ne0`)} 时 ${texInline(String.raw`B(\lambda)=A^*(\lambda)/d`)} 的元素仍是多项式。所以判断标准是行列式为非零常数，仅仅不是零多项式还不够。`,
        ponder: {
          q: `${texInline(String.raw`\lambda E-A`)} 是可逆的 ${texInline(String.raw`\lambda`)}-矩阵吗？`,
          a: `不是。${texInline(String.raw`|\lambda E-A|`)} 是 ${texInline("n")} 次多项式（${texInline(String.raw`n\ge1`)}），不是常数。`,
        },
      },
    ],
    pitfalls: [
      `把“秩为 ${texInline("n")}”当成“可逆”。${texInline(String.raw`|\lambda E-A|`)} 不是零多项式，秩为 ${texInline("n")}；它不是常数，所以不可逆。`,
      `以为对每个实数 ${texInline(String.raw`\lambda_0`)} 都满秩就可逆。${texInline(String.raw`|A(\lambda)|=\lambda^2+1`)} 在实轴上没有零点，${texInline(String.raw`A(\lambda)`)} 仍然不可逆。`,
      `以为特征多项式相同，代入同一个特征值后秩就相同。秩要由 ${texInline(String.raw`\lambda_0E-A`)} 本身决定。`,
    ],
  },
  example: {
    title: "例题：哪一个 λ-矩阵可逆",
    question: `下列 ${texInline(String.raw`\lambda`)}-矩阵中，哪一个是可逆的 ${texInline(String.raw`\lambda`)}-矩阵？`,
    choices: [
      { correct: true, text: texInline(String.raw`\begin{pmatrix}\lambda&\lambda+1\\\lambda-1&\lambda\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}2&0\\0&\lambda\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}\lambda&1\\-1&\lambda\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}\lambda&\lambda\\1&1\end{pmatrix}`) },
    ],
    steps: [
      `逐个算行列式：${texInline(String.raw`\lambda\cdot\lambda-(\lambda+1)(\lambda-1)=1`)}，是非零常数，所以 ${texInline(String.raw`\begin{pmatrix}\lambda&\lambda+1\\\lambda-1&\lambda\end{pmatrix}`)} 可逆，逆矩阵为 ${texInline(String.raw`\begin{pmatrix}\lambda&-\lambda-1\\1-\lambda&\lambda\end{pmatrix}`)}。`,
      `${texInline(String.raw`\begin{vmatrix}2&0\\0&\lambda\end{vmatrix}=2\lambda`)}，不是常数，逆矩阵中会出现 ${texInline(String.raw`\tfrac1\lambda`)}。`,
      `${texInline(String.raw`\begin{vmatrix}\lambda&1\\-1&\lambda\end{vmatrix}=\lambda^2+1`)}，在实数处都不为零，但它不是常数，逆矩阵的元素带分母 ${texInline(String.raw`\lambda^2+1`)}。`,
      `${texInline(String.raw`\begin{vmatrix}\lambda&\lambda\\1&1\end{vmatrix}=0`)}，两列相同，秩为 1。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("n")} 阶矩阵 ${texInline("A")} 的特征矩阵 ${texInline(String.raw`\lambda E-A`)} 的秩是多少？代入 ${texInline(String.raw`\lambda_0`)} 后的秩说明了什么？`,
      answer: `秩是 ${texInline("n")}，因为 ${texInline(String.raw`|\lambda E-A|`)} 是 ${texInline("n")} 次多项式。${texInline(String.raw`n-\operatorname{rank}(\lambda_0E-A)`)} 是属于 ${texInline(String.raw`\lambda_0`)} 的线性无关特征向量的个数，它为 0 说明 ${texInline(String.raw`\lambda_0`)} 不是特征值。`,
    },
    {
      question: `可逆 ${texInline(String.raw`\lambda`)}-矩阵 ${texInline(String.raw`A(\lambda)`)} 的逆矩阵的行列式是什么？`,
      answer: `若 ${texInline(String.raw`|A(\lambda)|=d`)}，则 ${texInline(String.raw`|A(\lambda)^{-1}|=1/d`)}，也是非零常数。`,
    },
    {
      question: `两个可逆 ${texInline(String.raw`\lambda`)}-矩阵的乘积可逆吗？`,
      answer: `可逆。乘积的行列式是两个非零常数之积，仍是非零常数；逆矩阵为 ${texInline(String.raw`B(\lambda)^{-1}A(\lambda)^{-1}`)}。`,
    },
  ],
  summary: [
    `${texInline(String.raw`\lambda`)}-矩阵的元素是 ${texInline(String.raw`P[\lambda]`)} 中的多项式；它可逆当且仅当行列式是非零常数。`,
    `${texInline(String.raw`\lambda E-A`)} 的秩总是 ${texInline("n")}，行列式就是特征多项式。`,
    `代入 ${texInline(String.raw`\lambda_0`)} 后，${texInline(String.raw`n-\operatorname{rank}(\lambda_0E-A)`)} 记录属于 ${texInline(String.raw`\lambda_0`)} 的特征向量个数；特征多项式相同的矩阵在这里可以不同。`,
  ],
});
