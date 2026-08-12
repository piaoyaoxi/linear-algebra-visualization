defineChapter6Section("intersection-sum", {
  number: "§6",
  textbookSection: "子空间的交与和",
  title: "子空间的交与和",
  navTitle: "交与和",
  question: "两个子空间共同拥有哪些方向？把它们的方向合在一起，最多能到达多大的空间？",
  goal: "定义交空间与和空间；理解 U+W={u+w}；会用生成组合并求基；掌握维数公式 dim(U+W)=dim U+dim W-dim(U∩W)。",
  tags: ["交空间", "和空间", "维数公式", "基合并"],
  intro:
    "交空间收集公共方向；和空间收集所有能写成 u+w 的向量。和空间不是两个集合的颜色叠合，更不是集合并。维数公式用交空间校正被重复计算的方向。",
  concepts: [
    { label: "交", text: texInline("U\\cap W=\\{v\\mid v\\in U\\ \\text{且}\\ v\\in W\\}") + '，它仍是子空间。' },
    { label: "和", text: texInline("U+W=\\{u+w\\mid u\\in U,\\ w\\in W\\}") + '，它仍是子空间。' },
    { label: "并集对照", text: "U∪W 一般不是子空间；和空间比并集更大，包含真正的线性合成。" },
    { label: "基合并", text: "取 U 的基与 W 的基并成生成组，再删除冗余，得到 U+W 的基。" },
    { label: "维数公式", text: texInline("\\dim(U+W)=\\dim U+\\dim W-\\dim(U\\cap W)") + '。' },
    { label: "包含关系", text: "若 U⊆W，则 U∩W=U，U+W=W。" },
  ],
  textbook: {
    reference: "北大版《高等代数》第六章",
    items: ["子空间的交与和", "生成组与基", "维数公式"],
  },
  interactive: {
    type: "slot",
    title: "实验：子空间混合器与维数账本",
    description: "在平面中调节两个过原点子空间，观察交与和，并用维数公式核对。",
    task: "比较两直线重合、相交于原点、以及直线落在平面内等预设，读出 dim(U∩W) 与 dim(U+W)。",
    prompts: [
      "两条不同直线：交为 {0}，和为平面。",
      "两条相同直线：交与和都是该直线。",
      "观察维数账本如何减去重复方向。",
      "确认和空间不是两线段的集合并。",
    ],
  },
  example: {
    title: "例题：求交、和与维数",
    question: '在 ℝ³ 中设 ' + texInline("U=\\mathrm{span}\\{(1,0,1)^T,(0,1,1)^T\\}") + '，' + texInline("W=\\mathrm{span}\\{(1,1,0)^T,(1,-1,2)^T\\}") + '。<br>求 U∩W 与 U+W 的基，并验证维数公式。',
    choices: [
      {
        correct: true,
        text: "两平面交于一条直线，和为 ℝ³；dim 公式 2+2-1=3 成立。",
      },
      { text: "交空间一定是 {0}，因为生成向量看起来不同。" },
      { text: "和空间维数是 4，因为两边各有 2 个生成元。" },
      { text: "U∪W 就是 U+W。" },
    ],
    steps: [
      "U 与 W 都是二维子空间（各自两生成元独立）。",
      "解 Ua=Wb 求公共方向，得到一维交空间。",
      "合并生成组后删除冗余，得到三维和空间，即整个 ℝ³。",
      "代入公式：2+2-1=3。",
    ],
  },
  quiz: [
    { question: "U+W 的元素长什么样？", answer: "形如 u+w，其中 u∈U、w∈W。" },
    { question: "为什么集合并一般不是子空间？", answer: "两个分别来自 U、W 的向量相加可能离开 U∪W。" },
    { question: "维数公式为什么要减 dim(U∩W)？", answer: "公共方向在 dim U 与 dim W 中被各算一次，需要校正。" },
    { question: "若 U⊆W，交与和是什么？", answer: "交为 U，和为 W。" },
    { question: "和空间是否自动等于直和？", answer: "否。直和还要求交空间为 {0}，留给下一节。" },
    { question: "基合并的目标是什么？", answer: "得到 U+W 的一组基：既生成和空间，又去掉冗余。" },
  ],
  summary: [
    "交收集公共方向，和收集全部线性合成。",
    "U+W ≠ U∪W。",
    "维数公式用交空间去掉重复计算。",
    "下一节讨论何时分解唯一：直和。",
  ],
  exercises: [
    "在 ℝ² 中取两条不同过原点直线，写出交与和。",
    "说明为何不能把和空间画成两张透明纸的颜色叠加就算完成。",
  ],
});
