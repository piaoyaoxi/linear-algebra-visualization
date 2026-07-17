defineChapter1Section("symmetric-polynomials", {
  number: "§11",
  textbookSection: "对称多项式",
  title: "对称多项式",
  navTitle: "对称多项式",
  question: "变量位置被任意交换以后，哪些多项式完全不变？为什么所有对称多项式都能用少数几个基本对称多项式表达？",
  goal: "理解变量置换与对称多项式；识别轨道与基本对称多项式；了解对称改写思路与 Vieta 桥梁。",
  tags: ["置换", "轨道", "基本对称"],
  intro:
    "多项式在任意变量置换下不变则称为对称。单项式生成轨道，轨道和给出对称构件。基本对称多项式 σ₁,…,σₙ 生成全部对称多项式。根与系数的 Vieta 公式正是基本对称多项式。",
  concepts: [
    { label: "对称", text: "任意置换变量后标准化结果相同。" },
    { label: "轨道", text: `单项式在置换群作用下的全部像；例如 ${texInline("x^2y")} 的轨道。` },
    { label: "基本对称", text: `三变量：${texInline("\\sigma_1=x+y+z")}，${texInline("\\sigma_2=xy+xz+yz")}，${texInline("\\sigma_3=xyz")}。` },
    { label: "改写", text: "按最高项逐步减去 σ 的多项式组合，直至余式为 0。" },
    { label: "Vieta", text: `首一多项式系数与根的基本对称多项式相连。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章",
    items: ["对称多项式", "基本对称多项式", "对称多项式基本定理"],
  },
  interactive: {
    type: "slot",
    title: "实验：变量交换与轨道",
    description: "交换变量标签，比较标准化结果；查看单项式轨道与 σ 构件。",
    task: "区分 x²+y 与 x²+y²；把 x²+y²+z² 改写到 σ。",
    prompts: [
      "交换 x,y，看哪些表达式保持不变。",
      "查看 x²y 的轨道是否不重不漏。",
      "用 σ₁²−2σ₂ 验证 x²+y²+z²。",
      "对照 Vieta：根与系数卡片。",
    ],
  },
  example: {
    title: "例题：写成基本对称多项式",
    question: `把 ${texInline("x^2+y^2+z^2")} 与 ${texInline("x^2y+x^2z+y^2x+y^2z+z^2x+z^2y")} 分别写成 ${texInline("\\sigma_1,\\sigma_2,\\sigma_3")} 的多项式。`,
    choices: [
      {
        correct: true,
        text: `${texInline("x^2+y^2+z^2=\\sigma_1^2-2\\sigma_2")}；第二个等于 ${texInline("\\sigma_1\\sigma_2-3\\sigma_3")}。`,
      },
      { text: `${texInline("x^2+y^2+z^2=\\sigma_2")}。` },
      { text: "对称多项式不能用有限个 σ 表示。" },
      { text: "只有全次齐一次式才是对称的。" },
    ],
    steps: [
      `${texInline("\\sigma_1^2=(x+y+z)^2=x^2+y^2+z^2+2\\sigma_2")}，故 ${texInline("x^2+y^2+z^2=\\sigma_1^2-2\\sigma_2")}。`,
      "第二式是全部“平方×另一变量”型轨道和。",
      `可验证等于 ${texInline("\\sigma_1\\sigma_2-3\\sigma_3")}。`,
    ],
  },
  quiz: [
    { question: "如何判断表达式对称？", answer: "任意置换变量后标准化结果不变。" },
    { question: "循环对称是否等于全对称？", answer: "不一定；循环对称更弱。" },
    { question: "三变量 σ₂ 是什么？", answer: "xy+xz+yz。" },
    { question: "轨道和为什么对称？", answer: "置换只重排轨道内的项。" },
    { question: "Vieta 与基本对称的关系？", answer: "首一多项式系数（差号）由根的基本对称多项式给出。" },
    { question: "改写算法如何保证终止？", answer: "每步降低规定的最高项。" },
  ],
  summary: [
    "对称性是置换下的不变量。",
    "轨道给出构造对称式的砖块。",
    "基本对称多项式生成全部对称多项式。",
    "第一章主线从数域走到分解与对称结构，至此收束。",
  ],
  exercises: [
    "判断 x³+y³+z³−3xyz 是否对称，并尝试用 σ 表示。",
    "写出两变量时 σ₁,σ₂ 与 (x−r)(x−s) 的关系。",
  ],
});
