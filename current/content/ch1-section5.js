defineChapter1Section("factorization-theorem", {
  number: "§5",
  textbookSection: "因式分解定理",
  title: "因式分解定理",
  navTitle: "因式分解定理",
  question: "多项式为什么能够拆到“不能再拆”为止？不同拆法为什么最后只差顺序和非零常数？",
  goal: "理解可约与不可约（依赖系数域）；掌握因式分解的存在性与唯一性；会写成标准首一形式。",
  tags: ["不可约", "唯一分解", "数域切换"],
  intro:
    "因式分解定理包含两个结论：存在性——非零非常数多项式可分解为不可约因式之积；唯一性——在单位（非零常数）与顺序意义下唯一。不可约性随系数域变化。",
  concepts: [
    { label: "不可约", text: `非常数多项式若不能写成两个次数更低的非常数多项式之积，则在该数域上不可约。` },
    { label: "存在性", text: "每次拆分降低次数，有限步后到达不可约叶节点。" },
    { label: "唯一性", text: "最终不可约因式的多重集合在相伴意义下唯一，不是中间路径唯一。" },
    { label: "数域", text: `${texInline("x^2-2")} 在 ${texInline("\\mathbb{Q}")} 不可约，在 ${texInline("\\mathbb{R}")} 可约；${texInline("x^2+1")} 在 ${texInline("\\mathbb{R}")} 不可约，在 ${texInline("\\mathbb{C}")} 可约。` },
    { label: "标准化", text: "常数提到最前，不可约因式首一化并排序，便于比较。" },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章",
    items: ["可约与不可约", "因式分解存在性", "唯一性", "标准形式"],
  },
  interactive: {
    type: "slot",
    title: "实验：因式树与数域切换",
    description: "在 Q/R/C 下观察同一多项式的不可约分解变化。",
    task: "固定 x⁴−1 与 x²−2，切换数域，比较叶节点。",
    prompts: [
      "在 Q 下查看 x²−2 是否保持不可约。",
      "切到 R，看实根线性因式出现。",
      "切到 C，看 x²+1 继续分裂。",
    ],
  },
  example: {
    title: "例题：在 Q、R、C 中分解 x⁴+4",
    question: `分别在 ${texInline("\\mathbb{Q}[x]")}、${texInline("\\mathbb{R}[x]")}、${texInline("\\mathbb{C}[x]")} 中分解 ${texInline("x^4+4")}，指出各域中的不可约因式。`,
    choices: [
      {
        correct: true,
        text: `${texInline("\\mathbb{Q},\\mathbb{R}")}：${texInline("(x^2+2x+2)(x^2-2x+2)")}；${texInline("\\mathbb{C}")}：四个一次因式（共轭成对）。`,
      },
      { text: "三个数域下分解完全相同。" },
      { text: "在 Q 上已经是一次因式之积。" },
      { text: "x⁴+4 在任何数域上都不可约。" },
    ],
    steps: [
      "在 Q 上凑配成两个二次。",
      "检查二次是否有实根。",
      "在 C 上继续拆到一次。",
    ],
  },
  quiz: [
    { question: "唯一性针对什么？", answer: "最终不可约因式的多重集合，不是中间路径。" },
    { question: "不可约性依赖什么？", answer: "系数所在的数域。" },
  ],
  summary: [
    "存在性靠次数下降。",
    "唯一性在相伴与顺序意义下成立。",
    "切换数域会改变叶节点。",
  ],
  exercises: ["在 Q 与 R 中分别分解 x⁴−1。"],
});
