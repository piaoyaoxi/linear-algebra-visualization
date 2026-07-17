defineChapter1Section("rational-polynomials", {
  number: "§9",
  textbookSection: "有理系数多项式",
  title: "有理系数多项式",
  navTitle: "有理系数多项式",
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
    description: "列出候选有理根并 Horner 验证；选择素数检查 Eisenstein 三条件。",
    task: "对 x⁵+10x+5 用 p=5 检查 Eisenstein；再对另一多项式筛有理根。",
    prompts: [
      "确认候选先约分去重。",
      "用 Horner 标记是/否为根。",
      "切换素数，看三条件哪一条失败。",
      "全部通过时点亮“在 Q[x] 中不可约”。",
    ],
  },
  example: {
    title: "例题：Eisenstein 与有理根",
    question: `证明 ${texInline("x^5+10x+5")} 在 ${texInline("\\mathbb{Q}[x]")} 中不可约；再对 ${texInline("2x^3+x^2-x-1")} 用有理根定理筛选并完成一次分解。`,
    choices: [
      {
        correct: true,
        text: `前者取 p=5 满足 Eisenstein；后者候选 ±1,±1/2，可验证 x=1 或 x=−1/2 等并继续因式分解。`,
      },
      { text: "前者无有理根所以任意次数都不可约。" },
      { text: "Eisenstein 只需要 p 整除所有系数。" },
      { text: "有理根候选不必约分。" },
    ],
    steps: [
      `对 ${texInline("x^5+10x+5")}：p=5 不整除 1，整除 10 与 5，且 25 不整除 5。`,
      "故在 Q 上不可约。",
      `对 ${texInline("2x^3+x^2-x-1")}：可能有理根为 ±1,±1/2。`,
      "逐个 Horner 验证，找到根后提出线性因式再处理二次。",
    ],
  },
  quiz: [
    { question: "本原多项式是什么？", answer: "整系数且内容为 1 的多项式。" },
    { question: "有理根定理限制什么？", answer: "既约分数 p/q 的分子分母分别整除常数项与首项系数。" },
    { question: "Eisenstein 的第三条在说什么？", answer: "p² 不整除常数项。" },
    { question: "为何要清分母？", answer: "把 Q[x] 问题转到 Z[x] 的本原多项式上处理。" },
    { question: "无有理根是否推出不可约？", answer: "一般不；仅在二次、三次等特殊情形可配合使用。" },
    { question: "候选根为何要去重约分？", answer: "避免重复检验并符合既约形式。" },
  ],
  summary: [
    "内容—本原—Gauss 搭起 Q 与 Z 的桥。",
    "有理根定理把无限搜索变成有限列表。",
    "Eisenstein 给出不可约充分条件。",
    "下一节进入多元指数格点。",
  ],
  exercises: [
    "用有理根定理列出 x³−6x²+11x−6 的全部候选并验证。",
    "检验 x⁴+1 是否直接满足某个素数的 Eisenstein。",
  ],
});
