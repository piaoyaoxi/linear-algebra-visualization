defineChapter8Section("elementary-divisors", {
  number: "§5",
  textbookSection: "初等因子",
  title: "初等因子",
  navTitle: "初等因子",
  question: "把不变因子拆成素因式的方幂，会得到什么？",
  goal: "会由不变因子求初等因子，也会由初等因子还原不变因子；知道初等因子依赖数域；掌握复矩阵相似当且仅当初等因子相同。",
  tags: ["初等因子", "素因式分解", "数域", "相似的判别"],
  intro:
    "不变因子是一列依次整除的多项式。把每一个分解成不可约因式的方幂，这些方幂就是初等因子。它们是更小的积木，下一节每一块会对应一个若尔当块。下面把积木拆开、再拼回去。",
  concepts: [
    { label: "初等因子", text: "不变因子分解后得到的全部不可约因式方幂（计重数）" },
    { label: "相似判别", text: `复矩阵 ${texInline(String.raw`A\sim B`)} ${texInline(String.raw`\Leftrightarrow`)} 初等因子相同` },
  ],
  textbook: { reference: "北大版《高等代数》第八章 §5", items: ["初等因子的定义", "由初等因子还原不变因子", "初等因子与相似", "用对角形求初等因子"] },
  interactive: { type: "slot", title: "初等因子积木" },
  lesson3d: {
    blocks: [
      {
        title: "初等因子",
        tex: String.raw`d_i(\lambda)=(\lambda-\lambda_1)^{k_{i1}}(\lambda-\lambda_2)^{k_{i2}}\cdots(\lambda-\lambda_r)^{k_{ir}},\qquad 0\le k_{1j}\le k_{2j}\le\cdots\le k_{nj}`,
        text: `在复数域上，把 ${texInline("A")} 的每个不变因子分解成一次因式的方幂。其中次数大于零的方幂 ${texInline(String.raw`(\lambda-\lambda_j)^{k_{ij}}`)}，按出现的次数计算重数，全体称为 ${texInline("A")} 的初等因子。由于 ${texInline("d_i")} 整除 ${texInline("d_{i+1}")}，同一个 ${texInline(String.raw`\lambda_j`)} 的幂次自上而下不减。`,
        ponder: {
          q: `在实数域上，${texInline(String.raw`\lambda^2+1`)} 能再分解吗？在复数域上呢？`,
          a: `实数域上不可约，它本身是一个初等因子；复数域上 ${texInline(String.raw`\lambda^2+1=(\lambda-\mathrm{i})(\lambda+\mathrm{i})`)}，拆成两个初等因子。初等因子依赖数域。`,
        },
      },
      {
        title: "初等因子与相似",
        tex: String.raw`A\sim B\iff A\ \text{与}\ B\ \text{有相同的初等因子}\quad(A,B\ \text{为}\ n\ \text{阶复矩阵})`,
        text: `初等因子连同阶数 ${texInline("n")} 能还原不变因子：把每个 ${texInline(String.raw`\lambda_j`)} 的方幂按次数从高到低排好，各取最高的相乘得 ${texInline("d_n")}，各取次高的相乘得 ${texInline("d_{n-1}")}，依此类推，不够的位置补 1。所以初等因子与不变因子包含同样多的信息，也是相似的完整判别。`,
        ponder: {
          q: `五阶复矩阵的初等因子是 ${texInline(String.raw`\lambda,\ \lambda,\ \lambda^2,\ \lambda-1`)}，不变因子是什么？`,
          a: `${texInline(String.raw`d_5=\lambda^2(\lambda-1)`)}，${texInline(String.raw`d_4=\lambda`)}，${texInline(String.raw`d_3=\lambda`)}，${texInline("d_2=d_1=1")}。`,
        },
      },
      {
        title: "用对角形求初等因子",
        tex: String.raw`\lambda E-A\simeq\operatorname{diag}(h_1(\lambda),\dots,h_n(\lambda))\ \Longrightarrow\ \text{各 }h_i\text{ 的素因式方幂全体就是初等因子}`,
        text: `${texInline(String.raw`\lambda E-A`)} 化成对角形以后，不必再整理成标准形：把每个对角元 ${texInline(String.raw`h_i(\lambda)`)} 分解成素因式的方幂，全部合在一起就是 ${texInline("A")} 的初等因子。例如 ${texInline(String.raw`\operatorname{diag}(\lambda,\lambda+1,\lambda(\lambda+1))`)} 的初等因子是 ${texInline(String.raw`\lambda,\ \lambda+1,\ \lambda,\ \lambda+1`)}。`,
      },
    ],
    pitfalls: [
      "把不同不变因子中同一个素因式的方幂相乘合并。它们分别计数，是不同的初等因子。",
      `由初等因子还原不变因子时把幂次相加。${texInline("d_n")} 只取每个素因式的最高次方幂。`,
      `不说明数域就数初等因子。${texInline(String.raw`\lambda^2+1`)} 在实数域上是一个，在复数域上是两个。`,
    ],
  },
  example: {
    title: "例题：由初等因子还原不变因子",
    question: `五阶复矩阵 ${texInline("A")} 的初等因子是 ${texInline(String.raw`\lambda,\ \lambda,\ \lambda^2,\ \lambda-1`)}。${texInline("A")} 的不变因子是什么？`,
    choices: [
      { correct: true, text: texInline(String.raw`1,\ 1,\ \lambda,\ \lambda,\ \lambda^2(\lambda-1)`) },
      { text: texInline(String.raw`1,\ 1,\ 1,\ \lambda,\ \lambda^3(\lambda-1)`) },
      { text: texInline(String.raw`1,\ 1,\ 1,\ \lambda^2,\ \lambda^2(\lambda-1)`) },
      { text: texInline(String.raw`\lambda,\ \lambda,\ \lambda^2,\ \lambda-1,\ 1`) },
    ],
    steps: [
      `${texInline(String.raw`\lambda`)} 的方幂从高到低是 ${texInline(String.raw`\lambda^2,\ \lambda,\ \lambda`)}，${texInline(String.raw`\lambda-1`)} 的方幂只有 ${texInline(String.raw`\lambda-1`)}。`,
      `各取最高次：${texInline(String.raw`d_5=\lambda^2(\lambda-1)`)}；再取次高：${texInline(String.raw`d_4=\lambda`)}；再下一层：${texInline(String.raw`d_3=\lambda`)}；其余 ${texInline("d_2=d_1=1")}。`,
      `把 ${texInline(String.raw`\lambda`)} 与 ${texInline(String.raw`\lambda^2`)} 合成 ${texInline(String.raw`\lambda^3`)} 会改变初等因子；${texInline(String.raw`1,1,1,\lambda^2,\lambda^2(\lambda-1)`)} 的初等因子是 ${texInline(String.raw`\lambda^2,\ \lambda^2,\ \lambda-1`)}；${texInline(String.raw`\lambda,\lambda,\lambda^2,\lambda-1,1`)} 那一组不满足依次整除（${texInline(String.raw`\lambda^2`)} 不整除 ${texInline(String.raw`\lambda-1`)}）。`,
    ],
  },
  quiz: [
    {
      question: `${texInline(String.raw`\lambda E-A`)} 等价于 ${texInline(String.raw`\operatorname{diag}(\lambda-1,(\lambda-1)(\lambda+2),\lambda+2)`)}，${texInline("A")} 的初等因子是什么？`,
      answer: `${texInline(String.raw`\lambda-1,\ \lambda-1,\ \lambda+2,\ \lambda+2`)}。对角形不必是标准形，把每个对角元分解即可。`,
    },
    {
      question: `三阶复矩阵的特征多项式是 ${texInline(String.raw`(\lambda-2)^3`)}，它的初等因子可能是哪几种？`,
      answer: `三种：${texInline(String.raw`(\lambda-2)^3`)}；${texInline(String.raw`(\lambda-2)^2,\ \lambda-2`)}；${texInline(String.raw`\lambda-2,\ \lambda-2,\ \lambda-2`)}。初等因子的次数之和等于 3，分法对应 3 的三种拆分。`,
    },
    {
      question: "两个复矩阵的特征多项式相同，初等因子一定相同吗？",
      answer: `不一定。${texInline("2E")} 的初等因子是 ${texInline(String.raw`\lambda-2,\ \lambda-2`)}，若尔当块 ${texInline("J(2,2)")} 的初等因子是 ${texInline(String.raw`(\lambda-2)^2`)}，特征多项式都是 ${texInline(String.raw`(\lambda-2)^2`)}。`,
    },
  ],
  summary: [
    "把每个不变因子分解成不可约因式的方幂，全部方幂（计重数）就是初等因子；它依赖数域。",
    `初等因子连同阶数能还原不变因子：${texInline("d_n")} 取各素因式的最高次方幂，${texInline("d_{n-1}")} 取次高的，依此类推。`,
    `复矩阵 ${texInline("A")} 与 ${texInline("B")} 相似 ${texInline(String.raw`\Leftrightarrow`)} 它们有相同的初等因子。`,
  ],
});
