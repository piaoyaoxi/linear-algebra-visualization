defineChapter3Section("matrix-rank", {
  number: "§4",
  textbookSection: "矩阵的秩",
  title: "矩阵的秩",
  navTitle: "矩阵的秩",
  question: "一组列向量真正提供了多少个独立方向？为什么极大无关组、消元主元、独立行和最高阶非零子式会给出同一个数？",
  goal: `从极大无关组定义向量组与矩阵的秩；理解行秩等于列秩；会用 RREF 主元和非零子式确定秩，并说明初等行变换为何保持列之间的线性关系。`,
  tags: ["向量组的秩", "行秩与列秩", "主元", "秩不变性", "非零子式"],
  intro:
    "向量个数会把冗余也计算在内，秩只计算一组无冗余的生成骨架。把矩阵化为 RREF 时，可逆行变换保持列之间的全部线性关系；主元列于是标出原矩阵的一组独立列，非零行则给出独立行。两种计数都等于主元数，这解释了行秩与列秩为何相等。",
  videoPlan: {
    title: "一个秩的四种证书",
    duration: "约 2.5 分钟",
    scenes: [
      "从矩阵列中依次保留真正增加张成的向量。",
      "对矩阵做可逆行变换，保持同一个列关系系数向量。",
      "在 RREF 中同时点亮非零行和主元列。",
      "回到原矩阵框出一个最高阶非零子式。",
    ],
  },
  concepts: [
    {
      label: "向量组的秩",
      text: "向量组任一极大无关组所含向量数相同，这个共同长度就是向量组的秩。",
    },
    {
      label: "列秩与行秩",
      text: "列秩是列向量组的秩，行秩是行向量组的秩；二者总相等，因此统一记作 rank(A)。",
    },
    {
      label: "行变换保持列关系",
      text: `若 ${texInline(String.raw`R=EA`)} 且 E 可逆，则 ${texInline(String.raw`Ac=0\Longleftrightarrow Rc=0`)}；同一组系数在 A 与 R 中给出完全相同的列关系。`,
    },
    {
      label: "主元读秩",
      text: "RREF 的主元数等于秩；主元列号应回到原矩阵取列，因为行变换会改变列向量本身。",
    },
    {
      label: "子式证书",
      text: `一个 r 阶非零子式证明 ${texInline(String.raw`\operatorname{rank}(A)\ge r`)}；所有 r+1 阶子式为零则给出相反方向的上界。`,
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第三章 §4 · Strang pp. 174–195 · Hoffman–Kunze pp. 65–68",
    page: "",
    items: ["向量组的秩", "矩阵的行秩与列秩", "行列秩相等", "主元与秩", "子式判定"],
  },
  interactive: {
    type: "slot",
    title: "实验：给秩寻找多重证书",
    description: "低维图形显示列张成的维数，完整矩阵同步给出 RREF、主元列和非零子式。",
    task: "先通过图形预测秩，再用主元和子式核对；最后打开“贯穿例 · 3×4 rank 2”，说明第三、第四列为什么没有增加秩。",
    prompts: [
      "在二维预设中让两个输出方向逐渐共线，记录秩发生变化的精确时刻。",
      "比较 3×3 rank 3 与 3×3 rank 2 的三维输出。",
      "对矩阵执行一次行倍加，观察数值变化与秩保持。",
      "读取主元列号后回到原矩阵取独立列，再检查非零子式证书。",
    ],
  },
  example: {
    title: "例题：用贯穿矩阵统一四种秩的读法",
    question: `设 ${texInline(String.raw`A=\begin{bmatrix}1&0&1&1\\0&1&1&-1\\1&1&2&0\end{bmatrix}`)}。求 ${texInline(String.raw`\operatorname{rank}(A)`)}，指出一组独立列和一组独立行，并给出一个最高阶非零子式。`,
    choices: [
      {
        correct: true,
        text: `第三行等于前两行之和，且左上 ${texInline(String.raw`2\times2`)} 子式为 1，所以 ${texInline(String.raw`\operatorname{rank}(A)=2`)}；可取前两列和前两行为相应极大无关组。`,
      },
      { text: "A 有四列，所以列秩为 4；行秩只有 3，二者不必相等。" },
      { text: "第三行由前两行生成，因此矩阵只能有秩 1。" },
      { text: "矩阵含有非零三阶子式，所以 rank(A)=3。" },
    ],
    steps: [
      `列关系 ${texInline(String.raw`a_3=a_1+a_2`)}、${texInline(String.raw`a_4=a_1-a_2`)} 表明所有列都在 ${texInline(String.raw`\operatorname{span}(a_1,a_2)`)} 中，所以列秩至多为 2。`,
      `左上子式 ${texInline(String.raw`\begin{vmatrix}1&0\\0&1\end{vmatrix}=1`)}，所以前两列线性无关，列秩至少为 2。`,
      `因此 ${texInline(String.raw`\operatorname{rank}(A)=2`)}，前两列构成一组极大无关列。`,
      "第三行等于第一、第二行之和，而前两行不成比例，所以前两行构成一组极大无关行。",
      "RREF 恰有两个主元，与列秩、行秩和最高阶非零子式的阶数一致。",
    ],
    audit: {
      kind: "rank",
      A: [[1, 0, 1, 1], [0, 1, 1, -1], [1, 1, 2, 0]],
      rank: 2,
      independentColumns: [0, 1],
      minor: { rows: [0, 1], columns: [0, 1], determinant: 1 },
    },
  },
  quiz: [
    { question: "为什么向量个数不能直接当作秩？", answer: "向量个数会把可由其他向量生成的冗余项也计算在内；秩只数极大无关组的长度。" },
    { question: "行变换为什么保持列之间的线性关系？", answer: "行变换等于左乘可逆矩阵 E；EA c=0 当且仅当 Ac=0，所以关系系数完全相同。" },
    { question: "怎样从 RREF 找原矩阵的一组独立列？", answer: "记录 RREF 的主元列号，再回到原矩阵取这些编号对应的列。" },
    { question: "一个二阶非零子式能够说明什么？", answer: "它说明矩阵至少含两个独立行和两个独立列，因此秩至少为 2。" },
    { question: "为什么 3×4 矩阵的秩不可能超过 3？", answer: "它只有三行；列向量属于三维坐标空间，最多只能有三个线性无关方向。" },
  ],
  summary: [
    "秩是极大无关组的长度，负责计数矩阵中真正独立的信息。",
    "可逆行变换保持列关系和行空间，因此可以安全地用 RREF 主元计算秩。",
    "行秩、列秩、主元数与最高阶非零子式的阶数相等。",
    "下一节把右端 b 加入列向量组，观察它是否会让秩增加。",
  ],
  exercises: [
    "为贯穿矩阵找出另一组极大无关列，并验证它的长度仍为 2。",
    "给出一个 3×3 矩阵，使所有二阶子式均为零但至少一个元素非零，并判断其秩。",
    "证明：左乘可逆矩阵不会改变矩阵的零空间。",
  ],
});
