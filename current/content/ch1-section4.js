defineChapter1Section("gcd-polynomials", {
  number: "§4",
  textbookSection: "最大公因式",
  title: "最大公因式",
  navTitle: "最大公因式",
  question: "两个多项式共有的“最大部分”怎样被算法稳定找出？为什么不断取余最终会停下来？",
  goal: "理解公因式与首一最大公因式；掌握欧几里得算法与 Bézout 等式；判断互素。",
  tags: ["欧几里得算法", "Bézout", "互素"],
  intro: `最大公因式在非零常数倍意义下唯一，教材与页面统一取首一形式。欧几里得算法反复用带余除法：${texInline("\\gcd(f,g)=\\gcd(g,r)")}。余式次数下降保证终止。`,
  concepts: [
    { label: "最大公因式", text: `同时整除 f,g 且被任何公因式整除的多项式；规范为首一。` },
    { label: "欧几里得", text: `${texInline("\\gcd(f,g)=\\gcd(g,r)")}，其中 ${texInline("f=qg+r")}。` },
    { label: "终止", text: "余式次数严格下降的非负整数列必然停止。" },
    { label: "Bézout", text: `存在 ${texInline("s,t")} 使 ${texInline("d=sf+tg")}。` },
    { label: "互素", text: `${texInline("\\gcd(f,g)=1")} 时，存在 ${texInline("sf+tg=1")}；公共根会导致矛盾。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章",
    items: ["最大公因式", "欧几里得算法", "Bézout 等式", "互素"],
  },
  interactive: {
    type: "slot",
    title: "实验：欧几里得瀑布",
    description: "逐步显示 f、g、余式链条，并高亮最后非零余式的首一化。",
    task: "对 gcd(x⁴−1, x³−1) 走完算法，读出最大公因式。",
    prompts: [
      "观察每一步余式次数是否下降。",
      "读懂“同时整除 f,g ⇔ 同时整除 g,r”。",
      "走到最后非零余式并首一化。",
    ],
  },
  example: {
    title: "例题：gcd(x⁴−1, x³−1)",
    question: `求 ${texInline("\\gcd(x^4-1,x^3-1)")}（首一），并说明算法步骤。`,
    choices: [
      { correct: true, text: `${texInline("\\gcd=x-1")}。由带余除法链条得到。` },
      { text: `${texInline("\\gcd=x^3-1")}，因为次数更低者就是最大公因式。` },
      { text: `${texInline("\\gcd=1")}，两多项式互素。` },
      { text: "最大公因式不唯一，任意公因式都可以。" },
    ],
    steps: [
      "对 x⁴−1 与 x³−1 做带余除法。",
      "用余式替换，继续直到余式为 0。",
      "最后非零余式首一化得 x−1。",
    ],
  },
  quiz: [
    { question: "为什么 gcd 取首一？", answer: "消除非零常数倍的歧义，便于比较。" },
    { question: "互素的定义？", answer: "gcd=1，即没有非常数的公共因式。" },
  ],
  summary: [
    "gcd 取首一代表。",
    "欧几里得：gcd(f,g)=gcd(g,r)。",
    "Bézout：d=sf+tg。",
  ],
  exercises: ["手算两组多项式的首一 gcd。"],
});
