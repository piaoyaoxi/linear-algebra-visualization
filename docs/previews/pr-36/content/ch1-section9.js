defineChapter1Section("rational-polynomials", {
  number: "§9",
  textbookSection: "有理系数多项式",
  title: "有理系数多项式",
  navTitle: "有理系数",
  question: "有理系数多项式为什么可以先清分母转成整数系数？怎样在不盲目试根的情况下筛选可能的有理根和不可约性？",
  goal: "理解内容与本原部分、Gauss 引理；掌握有理根定理与 Eisenstein 判别；在精确整数下完成筛选。",
  tags: ["有理根", "Eisenstein", "本原"],
  intro:
    "有理系数可通过清分母与提内容转到本原整系数多项式。Gauss 引理说明本原多项式的乘积仍本原。有理根定理给出有限候选；Eisenstein 提供不可约的充分条件。",
  concepts: [
    { label: "内容", text: `整系数多项式系数的最大公因数；${texInline("f=\\mathrm{cont}(f)\\cdot f^*")}，${texInline("f^*")} 本原。` },
    { label: "Gauss", text: "两本原多项式之积仍本原。" },
    { label: "有理根定理", text: `若 ${texInline("p/q")}（既约）是整系数多项式的有理根，则 ${texInline("p\\mid a_0")}，${texInline("q\\mid a_n")}。` },
    { label: "Eisenstein", text: `存在素数 p：不整除首项，整除其余系数，且 p² 不整除常数项 ⇒ 在 Q 上不可约。` },
    { label: "注意", text: "“无有理根”不能直接推出任意次数不可约；二次、三次可结合次数使用。" },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章",
    items: ["本原多项式与 Gauss 引理", "有理根定理", "Eisenstein 判别法"],
  },
  interactive: {
    type: "slot",
    title: "实验：有理根筛选与 Eisenstein 透镜",
    description: "列出候选有理根并验证；选择素数检查 Eisenstein 三条件。",
    task: "对 x⁵+10x+5 用 p=5 检查 Eisenstein；再对另一多项式筛有理根。",
    prompts: [
      "确认候选先约分去重。",
      "标记是/否为根。",
      "切换素数，看三条件哪一条失败。",
    ],
  },
  example: {
    title: "例题：Eisenstein",
    question: `证明 ${texInline("x^5+10x+5")} 在 ${texInline("\\mathbb{Q}[x]")} 中不可约。`,
    choices: [
      { correct: true, text: "取 p=5：不整除首项，整除 10 与 5，25 不整除 5。" },
      { text: "无有理根所以任意次数都不可约。" },
      { text: "p=2 满足全部条件。" },
      { text: "Eisenstein 是必要条件。" },
    ],
    steps: ["检查 p=5 三条件。", "结论：ℚ 上不可约。"],
  },
  quiz: [
    { question: "有理根 p/q 既约时 p,q 各整除什么？", answer: "p 整除常数项，q 整除首项。" },
    { question: "Eisenstein 是充分还是必要？", answer: "充分不必要。" },
  ],
  summary: [
    "本原 + Gauss 连接 ℚ 与 ℤ。",
    "有理根有限候选。",
    "Eisenstein 三条件给充分不可约判据。",
  ],
  exercises: ["对给定整系数多项式列出有理根候选并验证。"],
});
