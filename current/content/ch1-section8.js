defineChapter1Section("complex-real-factorization", {
  number: "§8",
  textbookSection: "复系数与实系数多项式的因式分解",
  title: "复系数与实系数多项式的因式分解",
  navTitle: "实复因式分解",
  question: "为什么复系数多项式最终都能拆成一次因式？实系数多项式出现非实根时，为什么一定成共轭对出现？",
  goal: "理解代数基本定理的分解结论；掌握共轭根对与实二次因式；区分 R[x] 与 C[x] 的不可约形式。",
  tags: ["共轭根", "复平面", "实二次因式"],
  intro:
    "在 C[x] 中，非常数多项式可分解为一次因式。实系数时，非实根必须成共轭对出现，从而可合并为实系数不可约二次因式。",
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
      "比较同一多项式在 R 与 C 的分解。",
    ],
  },
  example: {
    title: "例题：分解 x⁴+4x²+13",
    question: `在 ${texInline("\\mathbb{R}[x]")} 与 ${texInline("\\mathbb{C}[x]")} 中分别分解 ${texInline("x^4+4x^2+13")}，并说明非实根为何成共轭对。`,
    choices: [
      {
        correct: true,
        text: `先令 ${texInline("y=x^2")} 得 ${texInline("y=-2\\pm 3i")}，再开方得四个复根且共轭成对；${texInline("\\mathbb{R}")} 上合并为两个实二次因式，${texInline("\\mathbb{C}")} 上为四个一次因式。`,
      },
      { text: "实系数也可以只有一个非实根。" },
      { text: "在 R 中应完全拆成一次因式。" },
      { text: "共轭只对二次多项式成立。" },
    ],
    steps: [
      `令 ${texInline("y=x^2")}，则 ${texInline("y^2+4y+13=0")}，${texInline("y=-2\\pm 3i")}。`,
      "再开平方根得到四个复数根，共轭成对。",
      "每对共轭根合成一个实二次因式，得到 R 上分解。",
      "实系数多项式的共轭根性质保证非实根不会单独出现。",
    ],
  },
  quiz: [
    { question: "C[x] 中不可约非常数多项式是什么形式？", answer: "一次多项式。" },
    { question: "实系数非实根为何成对？", answer: "共轭仍是根：系数实则共轭保持方程。" },
    { question: "共轭对如何合成二次因式？", answer: "x²−2ax+(a²+b²)。" },
    { question: "“在 R 中无根”是否等于“在 C 中不可约”？", answer: "不等于。在 R 无根的二次在 C 仍可约。" },
    { question: "R[x] 不可约多项式有哪些类型？", answer: "一次，或无实根的二次。" },
    { question: "重数在共轭对中如何表现？", answer: "相同重数成对出现。" },
  ],
  summary: [
    "C 上可拆到一次；R 上留下一次与无实根二次。",
    "共轭锁保证系数保持实数。",
    "配对动画连接根平面与因式卡片。",
    "下一节讨论有理系数的内容、有理根与 Eisenstein。",
  ],
  exercises: [
    "把 (x−(1+2i))(x−(1−2i)) 展开成实系数二次。",
    "解释为何实系数三次多项式必有实根。",
  ],
});
