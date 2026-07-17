defineChapter1Section("complex-real-factorization", {
  number: "§8",
  textbookSection: "复系数与实系数多项式的因式分解",
  title: "复系数与实系数多项式的因式分解",
  navTitle: "实复因式分解",
  question: "为什么复系数多项式最终都能拆成一次因式？实系数多项式出现非实根时，为什么一定成共轭对？",
  goal: "理解代数基本定理的分解结论；掌握实系数的共轭根规律；在 R[x] 与 C[x] 中写出相应不可约分解。",
  tags: ["复平面", "共轭根", "实二次因式"],
  intro:
    "复数域提供了所有非常数多项式的根，因此 C[x] 中不可约多项式只有一次式。若系数全为实数，共轭运算会穿过每个系数，于是一个非实根必然拖着它的共轭根同时出现；这一对一次因式相乘后虚部抵消，形成实系数二次因式。",
  concepts: [
    { label: "代数基本定理", text: `每个非常数 ${texInline("f\\in\\mathbb{C}[x]")} 在 ${texInline("\\mathbb{C}")} 中有根，反复提出一次因式后完全分裂。` },
    { label: "共轭根", text: `实系数时 ${texInline("f(\\bar z)=\\overline{f(z)}")}；故 ${texInline("f(z)=0")} 推出 ${texInline("f(\\bar z)=0")}，且重数相同。` },
    { label: "实二次因式", text: `${texInline("(x-(a+bi))(x-(a-bi))=x^2-2ax+a^2+b^2")}。` },
    { label: "R 上不可约", text: `${texInline("\\mathbb{R}[x]")} 中不可约多项式只有一次式与无实根二次式。` },
    { label: "C 上不可约", text: `${texInline("\\mathbb{C}[x]")} 中非常数不可约多项式只有一次式。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章",
    items: ["复系数多项式完全分裂", "实系数多项式的共轭根", "R[x] 与 C[x] 中的不可约因式"],
  },
  interactive: {
    type: "slot",
    title: "实验：共轭锁复平面",
    description: "调节非实根 α=a+bi；共轭根严格镜像，实二次系数与两点同步。切换 R/C 镜头比较二次卡片和一次因式。",
    task: "拖动 a、b 并核对 x²−2ax+(a²+b²)；把 b 调到 0，观察共轭对退化为同一个实重根。",
    prompts: [
      "改变实部 a，确认两根一起水平移动。",
      "改变虚部 b，确认两根关于实轴镜像。",
      "核对二次式的一次项系数是 −2a、常数项是 a²+b²。",
      "切换 C 镜头，查看两个一次因式。",
      "令 b=0，区分“非实共轭对”与“实二重根”的临界状态。",
    ],
  },
  example: {
    title: "例题：由一个非实根恢复最低次实因式",
    question: `已知实系数多项式有三重根 ${texInline("1+2i")}。它还必须有哪些根？写出由这对根产生的实系数因式。`,
    choices: [
      { correct: true, text: `${texInline("1-2i")} 也以三重数出现；对应实因式为 ${texInline("(x^2-2x+5)^3")}。` },
      { text: `只需加入一次 ${texInline("x-(1+2i)")}；实系数不限制其他根。` },
      { text: `${texInline("1-2i")} 是单根，对应 ${texInline("x^2+5")}。` },
      { text: "共轭规律只对二次多项式成立。" },
    ],
    steps: [
      "实系数保证非实根的共轭仍是根。",
      "共轭操作保持因式重数，所以 1−2i 也是三重根。",
      `一对一次因式相乘：${texInline("(x-1-2i)(x-1+2i)")}。`,
      `利用平方和得到 ${texInline("(x-1)^2+4=x^2-2x+5")}。`,
      "每个根均出现三次，因此整个实因式取三次幂。",
    ],
  },
  quiz: [
    { question: "C[x] 中非常数不可约多项式的次数是多少？", answer: "1；代数基本定理保证任何更高次多项式都有根并可提出一次因式。" },
    { question: "实系数多项式的非实根为什么成共轭对？", answer: "因为 f( z̄ )=overline{f(z)}，零值在共轭下仍为零。" },
    { question: "共轭根的重数是否相同？", answer: "相同；共轭会把完整的因式幂映到对应共轭因式幂。" },
    { question: `根 ${texInline("a\\pm bi")} 对应的实二次因式是什么？`, answer: `${texInline("x^2-2ax+a^2+b^2")}。` },
    { question: "R[x] 中三次多项式可能不可约吗？", answer: "不可能；实三次函数至少有一个实根，因此含一次因式。" },
    { question: "把 b 调为 0 后，共轭对发生什么？", answer: "两个点合并为同一个实根；原二次式变为 (x−a)²。" },
  ],
  misconceptions: [
    "“成共轭对”只针对非实根；实根与自己共轭。",
    "R 上无实根的二次式在 C 上仍会分裂，不能把跨域不可约性混为一谈。",
  ],
  summary: [
    "C[x] 中多项式完全分裂为一次因式。",
    "实系数把非实根锁成等重数共轭对。",
    "共轭对合并成一个实系数不可约二次因式。",
    "下一节回到 Q[x]，用整数系数、候选根和素数判据研究不可约性。",
  ],
  exercises: [
    `写出以 ${texInline("2+i")} 为二重根的最低次首一实系数多项式。`,
    `在 ${texInline("\\mathbb{R}[x]")} 与 ${texInline("\\mathbb{C}[x]")} 中分别分解 ${texInline("x^4+1")}。`,
  ],
});