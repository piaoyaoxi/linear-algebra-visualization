defineChapter8Section("jordan-derivation", {
  number: "§6",
  textbookSection: "若尔当标准形的理论推导",
  title: "若尔当标准形的理论推导",
  navTitle: "若尔当标准形的推导",
  question: "为什么初等因子恰好对应若尔当块？",
  goal: `会求若尔当块与若尔当形矩阵的初等因子；掌握复矩阵相似于若尔当形矩阵，且块与初等因子一一对应；会用 ${texInline(String.raw`\operatorname{rank}(A-\lambda_0E)^j`)} 逐层数出块的个数与阶数。`,
  tags: ["若尔当块", "初等因子", "若尔当标准形", "核空间的维数"],
  intro:
    `一个若尔当块的特征矩阵只有一个初等因子，块拼起来，初等因子也拼起来。于是只要读出 ${texInline("A")} 的初等因子，就知道它的若尔当形。块的大小还能从 ${texInline(String.raw`\ker(A-\lambda_0E)^j`)} 一层层的维数看出来，下面把它搭成一座塔。`,
  concepts: [
    { label: "若尔当块", text: texInline(String.raw`\lambda E-J(\lambda_0,k)\simeq\operatorname{diag}(1,\dots,1,(\lambda-\lambda_0)^k)`) },
    { label: "块数", text: texInline(String.raw`\#\{\text{阶}\ge j\}=\nu_j-\nu_{j-1}`) },
  ],
  textbook: { reference: "北大版《高等代数》第八章 §6", items: ["若尔当块的初等因子", "若尔当形矩阵的初等因子", "复矩阵相似于若尔当形矩阵"] },
  interactive: { type: "slot", title: "核空间一层一层长高" },
  lesson3d: {
    blocks: [
      {
        title: "若尔当块的初等因子",
        tex: String.raw`J(\lambda_0,k)=\begin{pmatrix}\lambda_0&&&\\1&\lambda_0&&\\&\ddots&\ddots&\\&&1&\lambda_0\end{pmatrix},\qquad \lambda E-J(\lambda_0,k)\simeq\begin{pmatrix}1&&&\\&\ddots&&\\&&1&\\&&&(\lambda-\lambda_0)^k\end{pmatrix}`,
        text: `${texInline(String.raw`|\lambda E-J|=(\lambda-\lambda_0)^k`)}，所以 ${texInline(String.raw`D_k=(\lambda-\lambda_0)^k`)}。去掉第一行和最后一列，剩下的 ${texInline("k-1")} 阶子式是对角线全为 ${texInline("-1")} 的三角形行列式，等于 ${texInline("(-1)^{k-1}")}，所以 ${texInline("D_{k-1}=1")}，从而 ${texInline(String.raw`D_1=\cdots=D_{k-1}=1`)}。${texInline(String.raw`J(\lambda_0,k)`)} 只有一个初等因子 ${texInline(String.raw`(\lambda-\lambda_0)^k`)}。`,
        ponder: {
          q: `若尔当块 ${texInline(String.raw`J(\lambda_0,k)`)} 的最小多项式是什么？`,
          a: `${texInline(String.raw`(\lambda-\lambda_0)^k`)}。它是最后一个不变因子；也可以看链 ${texInline(String.raw`\varepsilon_1\to\varepsilon_2\to\cdots\to\varepsilon_k\to0`)}，${texInline(String.raw`(J-\lambda_0E)^{k-1}\varepsilon_1=\varepsilon_k\ne0`)}。`,
        },
      },
      {
        title: "复矩阵的若尔当标准形",
        tex: String.raw`A\sim J=\begin{pmatrix}J(\lambda_1,k_1)&&\\&\ddots&\\&&J(\lambda_s,k_s)\end{pmatrix}\iff A\ \text{的初等因子是}\ (\lambda-\lambda_1)^{k_1},\dots,(\lambda-\lambda_s)^{k_s}`,
        text: `若尔当形矩阵 ${texInline("J")} 的特征矩阵等价于把各块的标准形拼成的对角形，由上一节，${texInline("J")} 的初等因子就是各块初等因子的全体。任给复矩阵 ${texInline("A")}，按它的初等因子 ${texInline(String.raw`(\lambda-\lambda_i)^{k_i}`)} 写出若尔当块并拼成 ${texInline("J")}，${texInline("A")} 与 ${texInline("J")} 的初等因子相同，所以相似。除去块的排列次序，${texInline("J")} 由 ${texInline("A")} 唯一决定。`,
      },
      {
        title: "逐层数出块的大小",
        tex: String.raw`\nu_j=\dim\ker(A-\lambda_0E)^j,\qquad \#\{\lambda_0\ \text{的块中阶数}\ge j\ \text{的}\}=\nu_j-\nu_{j-1}=\operatorname{rank}(A-\lambda_0E)^{j-1}-\operatorname{rank}(A-\lambda_0E)^j`,
        text: `记 ${texInline(String.raw`N=A-\lambda_0E`)}。每个属于 ${texInline(String.raw`\lambda_0`)} 的 ${texInline("k")} 阶块给出一条链 ${texInline(String.raw`\varepsilon_1\to\varepsilon_2\to\cdots\to\varepsilon_k\to0`)}，第 ${texInline("j")} 层的向量落在 ${texInline(String.raw`\ker N^j`)} 中、不落在 ${texInline(String.raw`\ker N^{j-1}`)} 中。所以 ${texInline(String.raw`\ker N^j`)} 比 ${texInline(String.raw`\ker N^{j-1}`)} 多出的维数，正是阶数不小于 ${texInline("j")} 的块的个数。不求初等因子，只算几个秩，也能写出若尔当形。`,
        ponder: {
          q: `${texInline(String.raw`\nu_1=2`)}，${texInline(String.raw`\nu_2=3`)}，${texInline(String.raw`\nu_3=4=n`)}，块的阶数是多少？`,
          a: `${texInline("b_1=2")}，${texInline("b_2=1")}，${texInline("b_3=1")}：两个块，其中一个的阶数至少是 3，所以是 3 阶与 1 阶。`,
        },
      },
    ],
    pitfalls: [
      `把若尔当块写成上三角。本书的若尔当块中 1 在主对角线下方，对应链 ${texInline(String.raw`(J-\lambda_0E)\varepsilon_i=\varepsilon_{i+1}`)}。`,
      `只看 ${texInline(String.raw`\operatorname{rank}(A-\lambda_0E)`)} 就断定块的大小。它只给出块的个数，阶数要看更高次幂的秩。`,
      `把初等因子 ${texInline(String.raw`(\lambda-2)^2`)} 与两个 ${texInline(String.raw`\lambda-2`)} 混为一谈。前者是一个 2 阶块，后者是两个 1 阶块。`,
    ],
  },
  example: {
    title: "例题：由不变因子写出若尔当形",
    question: `三阶复矩阵 ${texInline("A")} 的不变因子是 ${texInline(String.raw`1,\ \lambda-1,\ (\lambda-1)^2`)}。${texInline("A")} 的若尔当标准形是哪一个？`,
    choices: [
      { correct: true, text: texInline(String.raw`\begin{pmatrix}1&0&0\\1&1&0\\0&0&1\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}1&0&0\\1&1&0\\0&1&1\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}1&0&0\\0&1&0\\0&0&1\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}1&0&0\\1&1&0\\0&0&2\end{pmatrix}`) },
    ],
    steps: [
      `初等因子是 ${texInline(String.raw`\lambda-1,\ (\lambda-1)^2`)}，对应若尔当块 ${texInline("J(1,1)")} 与 ${texInline("J(1,2)")}。`,
      `拼起来是 ${texInline(String.raw`\operatorname{diag}(J(1,2),J(1,1))`)}，即 ${texInline(String.raw`\begin{pmatrix}1&0&0\\1&1&0\\0&0&1\end{pmatrix}`)}（块的次序可以交换）。`,
      `主对角线下方有两个 1 的那一个是 ${texInline("J(1,3)")}，初等因子为 ${texInline(String.raw`(\lambda-1)^3`)}；单位矩阵的初等因子是三个 ${texInline(String.raw`\lambda-1`)}；右下角为 2 的那一个，特征多项式是 ${texInline(String.raw`(\lambda-1)^2(\lambda-2)`)}。`,
    ],
  },
  quiz: [
    {
      question: `用初等因子怎样判断复矩阵 ${texInline("A")} 能否对角化？`,
      answer: `${texInline("A")} 可对角化当且仅当它的初等因子全是一次的，此时每个若尔当块都是 1 阶。`,
    },
    {
      question: `若尔当形中属于 ${texInline(String.raw`\lambda_0`)} 的块数，与 ${texInline(String.raw`\lambda_0`)} 的特征向量有什么关系？`,
      answer: `块数等于 ${texInline(String.raw`\dim\ker(A-\lambda_0E)`)}，即属于 ${texInline(String.raw`\lambda_0`)} 的线性无关特征向量的最大个数：每个块恰好贡献一个特征向量。`,
    },
    {
      question: `四阶矩阵 ${texInline("A")} 只有特征值 2，${texInline(String.raw`\operatorname{rank}(A-2E)=2`)}，${texInline("(A-2E)^2=0")}。写出 ${texInline("A")} 的若尔当形。`,
      answer: `${texInline(String.raw`\nu_1=2`)}，${texInline(String.raw`\nu_2=4`)}，两个块且都不超过 2 阶，阶数之和为 4，所以是 ${texInline(String.raw`\operatorname{diag}(J(2,2),J(2,2))`)}。`,
    },
  ],
  summary: [
    `若尔当块 ${texInline(String.raw`J(\lambda_0,k)`)} 的特征矩阵只有一个初等因子 ${texInline(String.raw`(\lambda-\lambda_0)^k`)}。`,
    `复矩阵相似于若尔当形矩阵，每个初等因子 ${texInline(String.raw`(\lambda-\lambda_i)^{k_i}`)} 对应一个块 ${texInline(String.raw`J(\lambda_i,k_i)`)}，除次序外唯一。`,
    `${texInline(String.raw`\nu_j=\dim\ker(A-\lambda_0E)^j`)} 逐层增长，${texInline(String.raw`\nu_j-\nu_{j-1}`)} 是阶数不小于 ${texInline("j")} 的块的个数。`,
  ],
});
