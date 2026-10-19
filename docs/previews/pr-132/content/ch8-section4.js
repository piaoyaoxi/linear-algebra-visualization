defineChapter8Section("similarity-criterion", {
  number: "§4",
  textbookSection: "矩阵相似的条件",
  title: "矩阵相似的条件",
  navTitle: "矩阵相似的条件",
  question: "怎样判断两个数字矩阵是否相似？",
  goal: `掌握 ${texInline("A")} 与 ${texInline("B")} 相似当且仅当 ${texInline(String.raw`\lambda E-A`)} 与 ${texInline(String.raw`\lambda E-B`)} 等价，当且仅当它们有相同的不变因子；会用不变因子区分特征多项式相同的矩阵。`,
  tags: ["相似", "特征矩阵的等价", "不变因子", "相似的判别"],
  intro:
    `特征多项式相同的矩阵不一定相似。把问题搬到特征矩阵上：${texInline("A")} 与 ${texInline("B")} 相似，恰好对应 ${texInline(String.raw`\lambda E-A`)} 与 ${texInline(String.raw`\lambda E-B`)} 等价。等价的判别前两节已经解决，于是不变因子就是相似的完整判别。`,
  concepts: [
    { label: "相似判别", text: texInline(String.raw`A\sim B\iff \lambda E-A\simeq\lambda E-B`) },
    { label: "不变因子", text: `${texInline(String.raw`\lambda E-A`)} 的不变因子也称为 ${texInline("A")} 的不变因子` },
  ],
  textbook: { reference: "北大版《高等代数》第八章 §4", items: ["数字矩阵相似与特征矩阵等价", "矩阵的不变因子", "相似的充分必要条件"] },
  lesson3d: {
    blocks: [
      {
        title: "相似与特征矩阵的等价",
        tex: String.raw`A\sim B\iff \lambda E-A\simeq \lambda E-B`,
        text: `若 ${texInline("B=X^{-1}AX")}，则 ${texInline(String.raw`\lambda E-B=X^{-1}(\lambda E-A)X`)}，${texInline("X")} 与 ${texInline("X^{-1}")} 都是可逆的数字矩阵，也是可逆的 ${texInline(String.raw`\lambda`)}-矩阵，所以两个特征矩阵等价。反过来，若 ${texInline(String.raw`\lambda E-A=U(\lambda)(\lambda E-B)V(\lambda)`)}，用 ${texInline(String.raw`\lambda E-A`)} 对 ${texInline(String.raw`U(\lambda)`)}、${texInline(String.raw`V(\lambda)`)} 作带余除法，可以从中取出一个数字矩阵 ${texInline("X")}，使 ${texInline("B=X^{-1}AX")}。`,
        ponder: {
          q: `${texInline("A")} 与它的转置 ${texInline("A^T")} 相似吗？`,
          a: `相似。${texInline(String.raw`\lambda E-A^T=(\lambda E-A)^T`)}，转置矩阵的全部 ${texInline("k")} 阶子式与原矩阵相同，行列式因子相同，于是两个特征矩阵等价。`,
        },
      },
      {
        title: "不变因子是相似的完整判别",
        tex: String.raw`A\sim B\iff \lambda E-A\ \text{与}\ \lambda E-B\ \text{有相同的不变因子}`,
        figure: "sameCharPoly",
        text: `${texInline(String.raw`\lambda E-A`)} 的秩是 ${texInline("n")}，有 ${texInline("n")} 个不变因子 ${texInline(String.raw`d_1,\dots,d_n`)}，乘积是特征多项式，称为 ${texInline("A")} 的不变因子。特征多项式只记录乘积，不变因子还记录这个乘积怎样分配到各个位置。`,
      },
    ],
    pitfalls: [
      "用特征多项式相同推出相似。特征多项式只是不变因子的乘积。",
      `把特征矩阵的等价与数字矩阵的相似混为一谈。等价允许左右乘不同的 ${texInline(String.raw`\lambda`)}-矩阵，它与相似的对应要借助上面的定理。`,
      `以为特征多项式和最小多项式都相同就相似。最小多项式是最后一个不变因子 ${texInline("d_n")}，中间的不变因子仍可以不同。`,
    ],
  },
  example: {
    title: "例题：找出相似的矩阵",
    question: `${texInline(String.raw`A=\begin{pmatrix}2&0&0\\1&2&0\\0&0&2\end{pmatrix}`)}，下列矩阵中哪一个与 ${texInline("A")} 相似？`,
    choices: [
      { correct: true, text: texInline(String.raw`\begin{pmatrix}2&1&0\\0&2&0\\0&0&2\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}2&0&0\\0&2&0\\0&0&2\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}2&0&0\\1&2&0\\0&1&2\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}2&1&0\\0&2&0\\0&0&3\end{pmatrix}`) },
    ],
    steps: [
      `${texInline("A")} 的不变因子：${texInline(String.raw`\lambda E-A`)} 中取第 2 行、第 1 列的元素 ${texInline("-1")}，它是非零常数，${texInline("D_1=1")}；全部 2 阶子式的最大公因式是 ${texInline(String.raw`\lambda-2`)}，${texInline(String.raw`D_3=(\lambda-2)^3`)}。于是不变因子为 ${texInline(String.raw`1,\ \lambda-2,\ (\lambda-2)^2`)}。`,
      `第一个矩阵是 ${texInline("A")} 的转置，不变因子同样是 ${texInline(String.raw`1,\ \lambda-2,\ (\lambda-2)^2`)}，与 ${texInline("A")} 相似。`,
      `${texInline("2E")} 的不变因子是 ${texInline(String.raw`\lambda-2,\ \lambda-2,\ \lambda-2`)}；第三个矩阵有一个 2 阶子式等于 1，不变因子是 ${texInline(String.raw`1,\ 1,\ (\lambda-2)^3`)}；最后一个的特征多项式是 ${texInline(String.raw`(\lambda-2)^2(\lambda-3)`)}，连特征值都不同。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("A")} 与 ${texInline("B")} 相似，${texInline(String.raw`\lambda E-A`)} 与 ${texInline(String.raw`\lambda E-B`)} 的标准形有什么关系？`,
      answer: "相同。两个特征矩阵等价，标准形由不变因子唯一决定。",
    },
    {
      question: `特征多项式都是 ${texInline(String.raw`(\lambda-2)^4`)}、最小多项式都是 ${texInline(String.raw`(\lambda-2)^2`)} 的两个四阶矩阵，一定相似吗？`,
      answer: `不一定。不变因子可以是 ${texInline(String.raw`1,\ 1,\ (\lambda-2)^2,\ (\lambda-2)^2`)}，也可以是 ${texInline(String.raw`1,\ \lambda-2,\ \lambda-2,\ (\lambda-2)^2`)}，两组都满足条件，对应的矩阵不相似。`,
    },
    {
      question: `数字矩阵 ${texInline("A")} 的不变因子之积等于什么？`,
      answer: `等于特征多项式 ${texInline(String.raw`|\lambda E-A|`)}，因为 ${texInline(String.raw`d_1\cdots d_n=D_n=|\lambda E-A|`)}。`,
    },
  ],
  summary: [
    `${texInline("A")} 与 ${texInline("B")} 相似 ${texInline(String.raw`\Leftrightarrow`)} ${texInline(String.raw`\lambda E-A`)} 与 ${texInline(String.raw`\lambda E-B`)} 等价。`,
    `${texInline(String.raw`\lambda E-A`)} 的不变因子称为 ${texInline("A")} 的不变因子；${texInline("A")} 与 ${texInline("B")} 相似 ${texInline(String.raw`\Leftrightarrow`)} 它们有相同的不变因子。`,
    "特征多项式只是不变因子的乘积，相同的特征多项式不能保证相似。",
  ],
});
