defineChapter3Section("elimination", {
  number: "§1",
  textbookSection: "消元法",
  title: "消元法",
  navTitle: "消元法",
  question: "为什么交换、倍乘或倍加方程以后，解集不变？“消去一个未知量”在几何上做了什么？",
  goal: "理解三类初等行变换都可逆，因此保持解集；会用增广矩阵完成消元与回代，并从阶梯形读出唯一解、无解或无穷多解。",
  tags: ["初等行变换", "增广矩阵", "阶梯形", "回代", "三平面"],
  intro:
    "三元一次方程的每一个方程是空间里的一个平面，方程组的解就是三个平面的公共点。消元不断把方程换成新的组合：平面在变，公共点不变。",
  concepts: [
    { label: "初等行变换", text: "交换两行、一行乘非零数、一行加上另一行的倍数；每一种都有逆变换。" },
    { label: "阶梯形", text: "主元逐行向右下推进；从最后一个主元开始回代。" },
  ],
  textbook: { reference: "北大版《高等代数》第三章 §1", items: ["初等变换与同解方程组", "阶梯形与回代"] },
  interactive: { type: "slot", title: "消元：平面绕交线转动，解点不动" },
  lesson3d: {
    blocks: [
      {
        title: "三类变换都可逆，所以解集不变",
        tex: String.raw`R_i\leftrightarrow R_j,\qquad R_i\leftarrow kR_i\ (k\ne0),\qquad R_i\leftarrow R_i+cR_j`,
        text: `它们的逆变换分别是再交换一次、乘 ${texInline("1/k")}、减去 ${texInline("cR_j")}。新方程组的每个方程都由旧方程组合而来，所以旧解都是新解；再用逆变换倒回去，新解也都是旧解。乘 0 没有逆变换，会丢掉一个约束，因此不允许。`,
      },
      {
        title: "倍加的几何含义",
        text: `新方程 ${texInline("R_i+cR_j")} 被所有同时满足 ${texInline("R_i")}、${texInline("R_j")} 的点满足，所以新平面始终含着这两个平面的交线；${texInline("c")} 变化时，新平面绕这条交线转动。选对 ${texInline("c")} 让某个系数变成 0，新平面就与对应的坐标轴平行，这就是“消去一个未知量”。`,
      },
      {
        title: "从阶梯形读出结果",
        tex: String.raw`\begin{array}{l}\text{出现 }[0\ \cdots\ 0\mid d],\ d\ne0\ \Rightarrow\ \text{无解}\\ \text{无矛盾行，每列都有主元}\ \Rightarrow\ \text{唯一解}\\ \text{无矛盾行，有非主元列}\ \Rightarrow\ \text{无穷多解}\end{array}`,
      },
    ],
    pitfalls: [
      "以为无解就意味着有两个平行平面。三个平面可以两两相交，却围成一个“三棱柱”，没有公共点。",
      "只对系数做变换，忘记右端常数要跟着一起变。",
      "以为方程个数等于未知量个数就一定有唯一解。",
    ],
  },
  example: {
    title: "例题：消元，并读出每一步的几何含义",
    question: `解方程组 ${texInline("x+y+z=2")}，${texInline("2x+2y+3z=5")}，${texInline("x-y+z=0")}。做完 ${texInline(String.raw`R_2\leftarrow R_2-2R_1`)} 以后，新的第二个平面与哪些坐标轴平行？`,
    choices: [
      { correct: true, text: `解为 ${texInline("(0,1,1)")}；新平面 ${texInline("z=1")} 同时平行于 x 轴和 y 轴。` },
      { text: `解为 ${texInline("(1,1,0)")}；新平面只平行于 x 轴。` },
      { text: `解为 ${texInline("(0,1,1)")}；新平面平行于 z 轴。` },
      { text: "方程组有无穷多解，因为第二行消元后只剩一个未知量。" },
    ],
    steps: [
      `增广矩阵为 ${texInline(String.raw`\left[\begin{array}{ccc|c}1&1&1&2\\2&2&3&5\\1&-1&1&0\end{array}\right]`)}。`,
      `${texInline(String.raw`R_2\leftarrow R_2-2R_1`)} 得到 ${texInline("z=1")}：x、y 的系数同时变成 0，这个平面与 x 轴、y 轴都平行。`,
      `${texInline(String.raw`R_3\leftarrow R_3-R_1`)} 得到 ${texInline("-2y=-2")}。第二列的主元位置是 0，交换第二、三行后继续。`,
      `回代：${texInline("z=1")}，${texInline("y=1")}，${texInline("x=2-1-1=0")}。`,
      `代回三个原方程检验：${texInline("0+1+1=2")}，${texInline("0+2+3=5")}，${texInline("0-1+1=0")}。`,
    ],
  },
  quiz: [
    {
      question: `对一个方程组做 ${texInline(String.raw`R_3\leftarrow R_3-4R_1`)}，新的第三个平面一定包含哪条直线？`,
      answer: "原来的平面 1 与平面 3 的交线。它仍然经过方程组的解。",
    },
    {
      question: "三个平面两两相交，但没有公共点。消元到最后会出现什么？",
      answer: `出现形如 ${texInline(String.raw`[0\ 0\ 0\mid d]`)}（${texInline(String.raw`d\ne0`)}）的矛盾行，此时 ${texInline(String.raw`\operatorname{rank}A=2<\operatorname{rank}[A\mid b]=3`)}。`,
    },
    {
      question: "把唯一解方程组的某一行乘 0，解集会怎样？这一步为什么不允许？",
      answer: "少了一个约束，解集一般从一个点扩大成一条直线。乘 0 没有逆变换，解集不再保持。",
    },
  ],
  summary: [
    "三类初等行变换都可逆，所以消元前后解集相同。",
    "倍加让平面绕两平面的交线转动；消去一个未知量，就是把平面转到与对应坐标轴平行。",
    "阶梯形里的矛盾行、主元与非主元列，分别对应无解、唯一解和自由变量。",
  ],
});
