defineChapter3Section("solvability", {
  number: "§5",
  textbookSection: "线性方程组有解判别定理",
  title: "线性方程组有解判别定理",
  navTitle: "有解判别",
  question: "不解方程，怎样判断 Ax=b 有没有解？“增广矩阵的秩多出 1”在几何上是什么样子？",
  goal: `理解 ${texInline("Ax=b")} 有解当且仅当 ${texInline("b")} 属于 A 的列空间，当且仅当 ${texInline("\\operatorname{rank}A=\\operatorname{rank}[A\\mid b]")}；有解时，再用秩判断解是否唯一。`,
  tags: ["列空间", "增广矩阵", "有解判别", "三棱柱"],
  intro:
    "Ax 取遍 A 的各列的全部组合，这些组合构成列空间。方程组有解，就是 b 落在列空间里。把 b 拖出列空间，增广矩阵多出一个主元，秩加 1。",
  concepts: [
    { label: "有解判别", text: `${texInline("Ax=b")} 有解 ⇔ ${texInline("\\operatorname{rank}A=\\operatorname{rank}[A\\mid b]")}。` },
    { label: "唯一性", text: "有解时，秩等于未知量个数 ⇔ 解唯一。" },
  ],
  textbook: { reference: "北大版《高等代数》第三章 §5", items: ["有解判别定理", "解的个数"] },
  interactive: { type: "slot", title: "把 b 拖离列空间，三个平面失去公共线" },
  lesson3d: {
    blocks: [
      {
        title: "有解判别定理",
        tex: String.raw`Ax=b\ \text{有解}\iff b\in\operatorname{span}\{a_1,\dots,a_n\}\iff\operatorname{rank}A=\operatorname{rank}[A\mid b]`,
        text: "b 能由各列表出，加入 b 就不会增加新的方向，秩不变；b 不能由各列表出，它就是一个新方向，秩加 1。增广矩阵只比 A 多一列，所以秩最多多 1。",
      },
      {
        title: "解的个数",
        tex: String.raw`\operatorname{rank}A=\operatorname{rank}[A\mid b]=r:\quad r=n\Rightarrow\text{唯一解},\qquad r<n\Rightarrow\text{无穷多解（有 }n-r\text{ 个自由未知量）}`,
      },
      {
        title: "偏离量从哪里来",
        text: `实验中的 A 满足“第 3 行 = 第 1 行 + 第 2 行”，所以要有解，b 也必须满足同样的关系 ${texInline("b_3=b_1+b_2")}。消元到最后一行得到 ${texInline(String.raw`[0\ 0\ 0\mid b_3-b_1-b_2]`)}：偏离量不为 0，这一行就是矛盾行。有没有解由它是否精确为 0 决定，与 b 离列空间多远无关。`,
      },
    ],
    pitfalls: [
      "以为方程比未知量多就一定无解，或者方阵一定有解。",
      "以为无解一定是因为有两个平行平面。三个平面可以两两相交成三条平行线，仍然没有公共点。",
      "把“有没有解”和“解是否唯一”混成一步判断。",
    ],
  },
  example: {
    title: "例题：先判断，再求解",
    question: `${texInline(String.raw`A=\begin{bmatrix}1&1&2\\1&2&3\\2&3&5\end{bmatrix}`)}。分别取 ${texInline("b=(1,2,3)^T")} 与 ${texInline("b'=(1,2,4)^T")}，判断 ${texInline("Ax=b")} 是否有解。`,
    choices: [
      { correct: true, text: "b 有解，并且有无穷多解；b′ 无解，此时 rank[A|b′]=3>rank A=2。" },
      { text: "两者都有唯一解，因为 A 是方阵。" },
      { text: "两者都无解，因为 A 的行列式为 0。" },
      { text: "b 有唯一解，b′ 有无穷多解。" },
    ],
    steps: [
      "A 的第三行等于前两行之和，rank A=2。有解必须满足 b₃=b₁+b₂。",
      `b=(1,2,3)：3=1+2，有解。消元得 ${texInline("x=(0,1,0)+t(-1,-1,1)")}，三个平面交于一条直线。`,
      `b′=(1,2,4)：化简后最后一行是 ${texInline(String.raw`[0\ 0\ 0\mid 1]`)}，rank[A|b′]=3，无解。`,
      "几何上，b′ 离开了列空间平面；三个平面两两相交，三条交线互相平行，形成三棱柱。",
    ],
  },
  quiz: [
    {
      question: "对上面这个 A，使方程有解的 b 组成什么集合？",
      answer: "过原点的平面 b₃=b₁+b₂，也就是 A 的列空间。",
    },
    {
      question: "A 是 3×4 矩阵，rank A=3。Ax=b 对每个 b 都有解吗？解有几个？",
      answer: "都有解，因为列空间是整个 F³；有 4−3=1 个自由未知量，所以有无穷多解。",
    },
    {
      question: "rank[A|b] 可能等于 rank A+2 吗？",
      answer: "不可能。增广矩阵只多一列，秩最多增加 1。",
    },
  ],
  summary: [
    "Ax=b 有解 ⇔ b 在列空间里 ⇔ rank A = rank[A|b]。",
    "有解时，秩等于未知量个数则唯一，小于则有自由未知量。",
    "下一节回答：有无穷多解时，全部解长什么样。",
  ],
});
