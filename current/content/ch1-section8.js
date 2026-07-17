defineChapter1Section("complex-real-factorization", {
  number: "§8",
  textbookSection: "复系数与实系数多项式的因式分解",
  title: "复系数与实系数多项式的因式分解",
  navTitle: "实复因式分解",
  question: "为什么复系数多项式最终都能拆成一次因式？实系数多项式出现非实根时，为什么一定成共轭对出现？",
  goal: "理解代数基本定理的分解结论；掌握共轭根对与实二次因式；区分 R[x] 与 C[x] 的不可约形式。",
  tags: ["共轭根", "复平面", "实二次因式"],
  intro: `在 ${texInline("\\mathbb{C}[x]")} 中，非常数多项式可分解为一次因式。实系数时，非实根必须成共轭对出现，从而可合并为实系数不可约二次因式。`,
  concepts: [
    { label: "代数基本定理", text: `非常数 ${texInline("f\\in\\mathbb{C}[x]")} 在 ${texInline("\\mathbb{C}")} 中有根，故可拆到一次因式。` },
    { label: "共轭锁", text: `实系数时，若 ${texInline("a+bi")} 是根，则 ${texInline("a-bi")} 也是根。` },
    { label: "配对", text: `${texInline("(x-(a+bi))(x-(a-bi))=x^2-2ax+(a^2+b^2)")}。` },
    { label: "R 上不可约", text: `${texInline("\\mathbb{R}[x]")} 中不可约多项式为一次或无实根二次。` },
    { label: "重数", text: "非实重根按相同重数成共轭对出现。" },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章",
    items: ["复系数分解", "实系数共轭根", "实二次不可约因式"],
  },
  interactive: {
    type: "slot",
    title: "实验：共轭锁与复平面",
    description: "在复平面移动非实根，共轭点镜像同步；系数保持实数。",
    task: "拖动 a+bi，观察共轭点与二次因式卡片同步更新。",
    prompts: [
      "确认共轭点关于实轴严格镜像。",
      "读出对应的实二次因式。",
      "切换到 C 模式，看一次因式全部展开。",
    ],
  },
  example: {
    title: "例题：共轭配对",
    question: `实系数多项式有根 ${texInline("1+2i")}。写出必含的实二次因式。`,
    choices: [
      { correct: true, text: `${texInline("x^2-2x+5")}。` },
      { text: `${texInline("x-(1+2i)")} 本身就是实系数。` },
      { text: "只需一次因式 x−1。" },
      { text: "共轭根不必出现。" },
    ],
    steps: ["写出共轭 1−2i。", "相乘得 x²−2x+5。"],
  },
  quiz: [
    { question: "ℂ 上不可约多项式是什么？", answer: "一次多项式（非常数拆到一次）。" },
    { question: "实系数非实根为何成对？", answer: "因为 f(z̄)=f(z)̄，根闭于共轭。" },
  ],
  summary: [
    "ℂ 拆到一次因式。",
    "实系数非实根成共轭对。",
    "配对得实二次不可约因式。",
  ],
  exercises: ["写出含给定非实根的最低次实系数多项式。"],
});
