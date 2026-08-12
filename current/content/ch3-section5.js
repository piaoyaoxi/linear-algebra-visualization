defineChapter3Section("solvability", {
  number: "§5",
  textbookSection: "线性方程组有解判别定理",
  title: "线性方程组有解判别定理",
  navTitle: "有解判别",
  question: `在真正求出 x 之前，怎样判断目标 ${texInline(String.raw`b`)} 能否由 A 的列向量生成？列空间、增广秩和消元中的矛盾行为什么会给出同一个结论？`,
  goal: `把 ${texInline(String.raw`Ax=b`)} 解释为列组合；建立“${texInline(String.raw`b`)} 属于列张成—增广列不增加秩—RREF 无矛盾行”的等价链；掌握 ${texInline(String.raw`\operatorname{rank}(A)=\operatorname{rank}([A\mid b])`)}，并在有解后区分唯一解与无穷多解。`,
  tags: ["列向量张成", "可达目标", "增广秩", "Rouché–Capelli", "解的数量"],
  intro:
    "矩阵 A 固定后，x 只能改变各列的组合权重；所有可能的 Ax 构成 A 的列向量张成。把 b 加入列向量组，如果极大无关组的长度增加，b 就带来了 A 无法生成的新方向；消元会把同一事实显示成矛盾行。几何、秩与方程终局由此成为三种等价语言。",
  videoPlan: {
    title: "目标 b 何时可达",
    duration: "约 2 分钟",
    scenes: [
      "固定 A 的列向量，让所有列组合铺出可达集合。",
      "把 b 放入可达集合，显示一组组合系数 x。",
      "把 b 移到集合外，增广列出现新的独立方向。",
      "切换到 RREF，同步出现矛盾行并完成秩判别。",
    ],
  },
  concepts: [
    {
      label: "列组合",
      text: `${texInline(String.raw`Ax=b`)} 与 ${texInline(String.raw`x_1a_1+\cdots+x_na_n=b`)} 是同一个问题；x 的坐标就是生成 b 所需的权重。`,
    },
    {
      label: "可达条件",
      text: `方程有解当且仅当 ${texInline(String.raw`b\in\operatorname{span}(a_1,\ldots,a_n)`)}。`,
    },
    {
      label: "秩判别",
      text: `把 b 加为新列后，若秩保持不变，它已在原列张成中；所以有解当且仅当 ${texInline(String.raw`\operatorname{rank}(A)=\operatorname{rank}([A\mid b])`)}。`,
    },
    {
      label: "矛盾行",
      text: `RREF 中的 ${texInline(String.raw`[0\ \cdots\ 0\mid c]`)}、${texInline(String.raw`c\neq0`)} 表示右端产生了系数列无法匹配的新主元。`,
    },
    {
      label: "有解后的数量",
      text: `确认有解后，${texInline(String.raw`\operatorname{rank}(A)=n`)} 时没有自由变量，解唯一；秩小于 n 时有无穷多解。`,
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第三章 §5 · Lay pp. 50–52 · Friedberg pp. 184–186",
    page: "",
    items: ["Ax 的列组合", "列向量张成", "有解判别定理", "系数秩与增广秩", "唯一解与无穷多解"],
  },
  interactive: {
    type: "slot",
    title: "实验：让 b 进入或离开可达集合",
    description: "低维画面显示 b 是否落在列张成中，精确面板同步比较系数秩、增广秩和 RREF。",
    task: "先预测 b 在线上与线外时增广秩是否改变，再拖动 b 验证；把偏离列空间的部分理解为“当前列无法生成的分量”，不把它当作原方程的近似解。",
    prompts: [
      "在秩 1 预设中沿列空间移动 b，观察一组系数解如何变化。",
      "把 b 拖到线外，找到增广矩阵新增的主元或矛盾行。",
      "切换到满秩 2×2 预设，解释为什么平面中每个 b 都可达。",
      "令 b=0，区分“至少有零解”和“只有零解”。",
    ],
  },
  example: {
    title: "例题：同一个 A，两个目标的命运",
    question: `设 ${texInline(String.raw`A=\begin{bmatrix}1&0&1&1\\0&1&1&-1\\1&1&2&0\end{bmatrix}`)}。分别判断 ${texInline(String.raw`b=(1,2,3)^T`)} 与 ${texInline(String.raw`b'=(1,2,4)^T`)} 对应的方程组是否有解；若有解，再判断解是否唯一。`,
    choices: [
      {
        correct: true,
        text: `${texInline(String.raw`b=a_1+2a_2`)}，所以 Ax=b 有无穷多解；而 ${texInline(String.raw`\operatorname{rank}([A\mid b'])=3>2=\operatorname{rank}(A)`)}，所以 Ax=b′ 无解。`,
      },
      { text: "A 有四列，因此每个三维目标都必然可以由这些列生成。" },
      { text: "两个系统都无解，因为 A 的行数少于列数。" },
      { text: "Ax=b 有唯一解，因为已经找到一组系数 (1,2,0,0)ᵀ。" },
    ],
    steps: [
      `由上一节知 ${texInline(String.raw`\operatorname{rank}(A)=2`)}，且所有输出都满足“第三坐标 = 第一坐标 + 第二坐标”。`,
      `b=(1,2,3)^T 满足这一关系，并且 ${texInline(String.raw`b=a_1+2a_2`)}，所以 ${texInline(String.raw`\operatorname{rank}([A\mid b])=2`)}。`,
      `A 有 4 列而秩为 2，Ax=b 有两个自由变量，因此有无穷多解。`,
      `b'=(1,2,4)^T 的第三坐标 4 不等于 1+2；它不在原列张成的平面中。`,
      `加入 b′ 后秩升为 3，RREF 出现矛盾行，所以 Ax=b′ 无解。`,
    ],
    audit: {
      kind: "solvability",
      A: [[1, 0, 1, 1], [0, 1, 1, -1], [1, 1, 2, 0]],
      rank: 2,
      cases: [
        { b: [1, 2, 3], solvable: true, rankAugmented: 2 },
        { b: [1, 2, 4], solvable: false, rankAugmented: 3 },
      ],
    },
  },
  quiz: [
    { question: `为什么 ${texInline(String.raw`b\in\operatorname{span}(a_1,\ldots,a_n)`)} 等价于 Ax=b 有解？`, answer: "列张成中的每个向量都由某组系数组合得到；把这些系数排成 x，就得到 Ax=b，反向也完全相同。" },
    { question: "增广秩大于系数秩意味着什么？", answer: "b 增加了原列无法生成的新方向；RREF 会出现右端独有的主元或矛盾行。" },
    { question: "齐次系统为什么总有解？", answer: "取 x=0 就有 A0=0；零向量必属于任意列向量组的张成。" },
    { question: "超定系统一定无解吗？", answer: "不一定。只要 b 落在列张成中，方程仍有解；方程条数本身不能单独决定可解性。" },
    { question: "找到一个特解后，为什么还不能立即断言解唯一？", answer: "还需检查零空间是否只含零向量；等价地，检查 rank(A) 是否等于未知量个数 n。" },
  ],
  summary: [
    "Ax=b 有解、b 属于列张成、增广秩不增加、RREF 无矛盾行是同一事实的不同表达。",
    "有解判别先回答目标能否到达；解的数量还要继续比较秩与未知量个数。",
    "b=0 始终可达，但齐次系统仍可能拥有非零解。",
    "下一节固定一个可达目标，研究所有能够到达它的系数向量如何组织。",
  ],
  exercises: [
    "为贯穿矩阵写出列空间中所有向量必须满足的坐标关系。",
    "另找一个可达 b 和一个不可达 b，并分别用列组合与秩判别。",
    "构造一个有唯一解的超定系统，说明方程数多于未知量数仍可相容。",
  ],
});
