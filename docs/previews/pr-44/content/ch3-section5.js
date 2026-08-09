defineChapter3Section("solvability", {
  number: "§5",
  textbookSection: "线性方程组有解判别定理",
  title: "线性方程组有解判别定理",
  navTitle: "有解判别",
  question: `给定 ${texInline(String.raw`Ax=b`)}，能否在求出具体解之前先判断目标 ${texInline(String.raw`b`)} 是否可以由 A 的列向量组合得到？`,
  goal: `把 ${texInline(String.raw`Ax=b`)} 解释为列组合；掌握 Rouché–Capelli 判别 ${texInline(String.raw`\operatorname{rank}(A)=\operatorname{rank}([A\mid b])`)}；会用列空间、矛盾行和增广秩说明有解或无解，并进一步区分唯一解与无穷多解。`,
  tags: ["列空间", "增广矩阵", "Rouché–Capelli", "矛盾行", "可达性"],
  intro:
    "求解之前先问可达性：A 的列向量张成一个输出空间，未知系数 x 只是在这些列之间调配。若 b 落在这个空间中，方程有解；若 b 带来了一个新的独立方向，增广矩阵的秩就会增加，方程无解。",
  videoPlan: {
    title: "把 b 拖过列空间边界",
    duration: "约 2 分钟",
    scenes: [
      "两列向量的所有线性组合形成一条直线或整个平面。",
      "目标点 b 在列空间内外移动，系数解随之出现或消失。",
      "同一过程切换到增广矩阵，显示 rank(A) 与 rank([A|b])。",
      "无解时矛盾行亮起。",
    ],
  },
  concepts: [
    {
      label: "列组合语言",
      text: `${texInline(String.raw`Ax=b`)} 等价于 ${texInline(String.raw`x_1a_1+\cdots+x_na_n=b`)}；x 的坐标就是组合各列的权重。`,
    },
    {
      label: "有解判别",
      text: `方程组有解当且仅当 ${texInline(String.raw`\operatorname{rank}(A)=\operatorname{rank}([A\mid b])`)}。`,
    },
    {
      label: "列空间语言",
      text: `同一结论可写成 ${texInline(String.raw`b\in\operatorname{Col}(A)`)}；b 没有超出 A 已经能张成的方向。`,
    },
    {
      label: "矛盾行",
      text: `消元若出现 ${texInline(String.raw`[0\ \cdots\ 0\mid c]`)} 且 ${texInline(String.raw`c\neq0`)}，说明系数部分没有新主元，而右端列产生了新主元。`,
    },
    {
      label: "解的数量",
      text: `有解后，若 ${texInline(String.raw`\operatorname{rank}(A)=n`)} 则唯一解；若秩小于未知量个数 n，则存在自由变量并有无穷多解。`,
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第三章 §5",
    page: "",
    items: ["有解判别定理", "系数矩阵与增广矩阵的秩", "列向量线性组合", "齐次与非齐次方程组", "解的数量初步"],
  },
  interactive: {
    type: "slot",
    title: "实验：判断 Ax=b 是否有解",
    description: "直接拖动二维目标 b 或用坐标滑块调节它；观察 b 是否落在列空间中，再用增广矩阵、RREF 和秩比较核对。",
    task: "选择秩 1 的矩阵，把 b 从列空间直线上拖到线外，再拖回原点；观察有解、无解与齐次情形的变化。",
    prompts: [
      "在满秩 2×2 预设中任意拖动 b，确认所有二维目标都可达。",
      "在秩 1 预设中沿直线拖动 b，读取一组系数解。",
      "把 b 稍微移出直线，观察增广秩何时增加。",
      "点击 b=0，说明齐次系统为什么总有解，但未必只有零解。",
    ],
  },
  example: {
    title: "例题：同一系数矩阵，不同右端",
    question: `设 ${texInline(String.raw`A=\begin{bmatrix}1&1\\2&2\\1&-1\end{bmatrix}`)}。分别判断 ${texInline(String.raw`b=(2,4,0)^T`)} 与 ${texInline(String.raw`b'=(2,5,0)^T`)} 对应方程组是否有解，并解释原因。`,
    choices: [
      {
        correct: true,
        text: `对 b，${texInline(String.raw`b=a_1+a_2`)}，所以有解；对 b'，${texInline(String.raw`\operatorname{rank}([A\mid b'])=3>2=\operatorname{rank}(A)`)}，所以无解。`,
      },
      { text: "方程数多于未知量数，因此两个系统都无解。" },
      { text: "A 有两列，所以任意三维 b 都可由它们组合。" },
      { text: "只需比较 b 与 b′ 的长度，长度较大的无解。" },
    ],
    steps: [
      "A 的两列线性无关，因此 rank(A)=2，列空间是 R³ 中的一个平面。",
      `计算 ${texInline(String.raw`a_1+a_2=(2,4,0)^T=b`)}，所以 b 在列空间中。`,
      `把 b′ 加入增广矩阵并消元，会出现第三个主元或矛盾行。`,
      `因此 ${texInline(String.raw`\operatorname{rank}([A\mid b'])=3`)}，b′ 不在列空间中。`,
      "方程数多于未知量数只说明系统超定，并不能单独决定有无解。",
    ],
  },
  quiz: [
    { question: "有解判别定理的秩形式是什么？", answer: "rank(A)=rank([A|b])。" },
    { question: "为什么 b 在列空间中等价于有解？", answer: "列空间正是 A 的所有列线性组合的集合，而 x 提供这些组合系数。" },
    { question: "增广秩比系数秩大时意味着什么？", answer: "右端列提供了系数列无法生成的新方向，消元出现矛盾，系统无解。" },
    { question: "齐次系统为什么总有解？", answer: "取 x=0 就有 A0=0；零向量也必属于任何列空间。" },
    { question: "有解且 rank(A)=n 时为什么唯一？", answer: "所有未知量列都是主元列，没有自由变量，零空间只有零向量。" },
    { question: "超定系统一定无解吗？", answer: "不一定；只要右端仍在列空间中，就可以有解。" },
  ],
  summary: [
    "有解性是目标 b 相对于列空间的可达性问题。",
    "比较系数秩与增广秩，可以在求具体解前作出判定。",
    "矛盾行是秩不相等的消元表现；齐次系统总可达零向量。",
    "下一节在有解前提下，把全部解组织成特解加零空间。",
  ],
  exercises: [
    "构造一个 3×2 的超定但有解系统，并给出列组合系数。",
    "固定一个秩 1 的 2×2 矩阵，分别选取在线上和线外的两个右端。",
  ],
});
