defineChapter3Section("matrix-rank", {
  number: "§4",
  textbookSection: "矩阵的秩",
  title: "矩阵的秩",
  navTitle: "矩阵的秩",
  question: "矩阵中有多少条真正独立的信息？为什么列向量、行向量、消元主元和非零子式最终给出同一个数？",
  goal: `从极大无关组理解行秩与列秩；用阶梯形主元数计算 ${texInline(String.raw`\operatorname{rank}(A)`)}；掌握初等变换的秩不变性，并能用一个非零子式给出可核验的秩证书。`,
  tags: ["列秩", "行秩", "主元列", "非零子式", "秩不变性"],
  intro:
    "秩不是矩阵中非零数字的个数，而是独立方向的个数。列视角看输出能到达多大的空间，行视角看约束中有多少条独立信息，消元视角数主元，子式视角寻找一个不塌缩的小方块。",
  videoPlan: {
    title: "四个窗口读同一个秩",
    duration: "约 2.5 分钟",
    scenes: [
      "列向量逐个加入，张成维数增长。",
      "对矩阵做行变换，主元位置逐步显现。",
      "原矩阵中的主元列被标出，与阶梯形主元列对应。",
      "一个 r 阶非零子式亮起，成为 rank≥r 的证书。",
    ],
  },
  concepts: [
    {
      label: "列秩与行秩",
      text: "列秩是列向量组极大无关组的长度，行秩是行向量组极大无关组的长度；二者相等，统称矩阵的秩。",
    },
    {
      label: "主元读秩",
      text: "把矩阵化为行阶梯形后，非零行数、主元数和秩相同；主元列的列号还指出原矩阵的一组独立列。",
    },
    {
      label: "变换不变性",
      text: "初等行变换由可逆矩阵左乘实现，不改变行空间维数，也不改变列之间的线性关系，因此秩保持不变。",
    },
    {
      label: "子式证书",
      text: `存在一个 r 阶非零子式可证明 ${texInline(String.raw`\operatorname{rank}(A)\ge r`)}；若所有 r+1 阶子式均为零，则秩不超过 r。`,
    },
    {
      label: "尺寸上界",
      text: `对 ${texInline(String.raw`m\times n`)} 矩阵，总有 ${texInline(String.raw`\operatorname{rank}(A)\le\min\{m,n\}`)}。`,
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第三章 §4",
    page: "",
    items: ["向量组的秩", "矩阵的行秩与列秩", "阶梯形与主元", "初等变换不改变秩", "子式与秩的判定"],
  },
  interactive: {
    type: "slot",
    title: "实验：秩证书工作台",
    description: "编辑矩阵或选择预设，精确同步显示 RREF、主元列、原矩阵独立列和一个最高阶非零子式；二维画布只承担投影观察。",
    task: "选择 3×3 秩为 2 的预设，找出两个主元列和一个 2 阶非零子式；再做一次行倍加，确认证书位置可能变化但秩不变。",
    prompts: [
      "从单位矩阵开始，把第三列改成前两列之和，观察秩从 3 降到 2。",
      "比较原矩阵与 RREF：数值改变很多，主元数却保持。",
      "查看子式证书中的具体行、列和行列式值。",
      "对三维列向量只看前两坐标投影时，警惕投影可能制造假相关。",
    ],
  },
  example: {
    title: "例题：用消元与子式共同确定秩",
    question: `设 ${texInline(String.raw`A=\begin{bmatrix}1&2&3\\2&4&6\\0&1&1\end{bmatrix}`)}。求 ${texInline(String.raw`\operatorname{rank}(A)`)}；指出一组独立列，并给出一个确实非零的 2 阶子式。`,
    choices: [
      {
        correct: true,
        text: `消元有两个主元，所以 ${texInline(String.raw`\operatorname{rank}(A)=2`)}；第 1、3 列独立，取第 1、3 行与第 1、3 列的子式 ${texInline(String.raw`\begin{vmatrix}1&3\\0&1\end{vmatrix}=1`)}。`,
      },
      { text: `左上角 2 阶子式非零，因此 ${texInline(String.raw`\operatorname{rank}(A)=2`)}。` },
      { text: "第二行是第一行的 2 倍，所以秩只能是 1。" },
      { text: "矩阵是 3×3 且含非零行，所以秩为 3。" },
    ],
    steps: [
      `做 ${texInline(String.raw`R_2\leftarrow R_2-2R_1`)}，第二行变为零行。`,
      "第一行和第三行不成比例，因此仍有两个主元。",
      `故 ${texInline(String.raw`\operatorname{rank}(A)=2`)}。`,
      "主元列可取原矩阵第 1、2 列；也可以另选第 1、3 列作为极大无关组。",
      `选择第 1、3 行及第 1、3 列，得到子式 ${texInline(String.raw`1`)}，证明秩至少为 2。`,
      "三阶行列式为 0，或消元只见两个主元，证明秩至多为 2。",
    ],
  },
  quiz: [
    { question: "行秩与列秩有什么关系？", answer: "它们总相等，因此矩阵的秩定义无歧义。" },
    { question: "为什么不能通过数非零元素求秩？", answer: "非零元素可能集中在彼此相关的行列中；秩数的是独立信息，不是非零项。" },
    { question: "RREF 中哪些信息直接给出秩？", answer: "主元个数，也等于非零行数。" },
    { question: "行变换后如何找原矩阵的一组独立列？", answer: "记录阶梯形的主元列号，再回到原矩阵取对应列。" },
    { question: "一个 r 阶非零子式能证明什么？", answer: "矩阵至少含 r 条独立行和 r 条独立列，所以秩至少为 r。" },
    { question: "二维投影中的两列共线能否说明三维原列相关？", answer: "不能；投影可能丢失第三坐标，必须用完整坐标做代数判定。" },
  ],
  summary: [
    "秩统一度量行、列与约束中的独立信息量。",
    "消元主元提供高效算法，非零子式提供可核验的证书。",
    "初等行变换改变表示但保持秩。",
    "下一节比较 A 与增广矩阵 [A|b] 的秩，判断目标向量 b 是否可达。",
  ],
  exercises: [
    "构造一个 3×4 秩为 2 的矩阵，并给出一个 2 阶非零子式。",
    "找一个三维向量组，其前两坐标投影相关但原向量组无关。",
  ],
});
