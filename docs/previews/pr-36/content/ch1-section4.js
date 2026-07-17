defineChapter1Section("gcd-polynomials", {
  number: "§4",
  textbookSection: "最大公因式",
  title: "最大公因式",
  navTitle: "最大公因式",
  question: "两个多项式共有的“最大部分”怎样被算法稳定找出？为什么不断取余最终会停下来？",
  goal: "理解公因式与首一最大公因式；掌握欧几里得算法与 Bézout 等式；判断互素。",
  tags: ["欧几里得算法", "Bézout", "互素"],
  intro:
    "最大公因式在非零常数倍意义下唯一，教材与页面统一取首一形式。欧几里得算法反复用带余除法：gcd(f,g)=gcd(g,r)。余式次数下降保证终止。",
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
      "切换互素示例，看 d=1。",
    ],
  },
  example: {
    title: "例题：gcd(x⁴−1, x³−1)",
    question: `求 ${texInline("\\gcd(x^4-1,x^3-1)")}（首一），并说明算法步骤。可用因式分解做交叉验证。`,
    choices: [
      {
        correct: true,
        text: `${texInline("\\gcd=x-1")}。由 ${texInline("x^4-1=(x+1)(x^3-1)+(x-1)")} 等步骤得到。`,
      },
      { text: `${texInline("\\gcd=x^3-1")}，因为次数更低者就是最大公因式。` },
      { text: `${texInline("\\gcd=1")}，两多项式互素。` },
      { text: `${texInline("\\gcd=x^2+x+1")}。` },
    ],
    steps: [
      `${texInline("x^4-1=x(x^3-1)+(x-1)")}（或等价带余除法）。`,
      `继续对 ${texInline("x^3-1")} 与 ${texInline("x-1")} 做除法，余式为 0。`,
      `最后非零余式 ${texInline("x-1")} 已首一，即最大公因式。`,
      `分解验证：${texInline("x^4-1=(x-1)(x+1)(x^2+1)")}，${texInline("x^3-1=(x-1)(x^2+x+1)")}，公共首一因式 ${texInline("x-1")}。`,
    ],
  },
  quiz: [
    { question: "为什么最大公因式要首一化？", answer: "在非零常数倍意义下唯一；首一给出标准代表。" },
    { question: "欧几里得算法为何终止？", answer: "余式次数构成严格下降的非负整数列。" },
    { question: "Bézout 等式写什么？", answer: "d=sf+tg，对某组多项式 s,t。" },
    { question: "互素的判定是什么？", answer: "gcd=1（首一 1）。" },
    { question: "若 f,g 有公共根，能否互素？", answer: "不能：公共根会整除任何 sf+tg，与 =1 矛盾。" },
    { question: "gcd(f,g)=gcd(g,r) 的结构原因？", answer: "公因式集合在 f 换成 f−qg 后不变。" },
  ],
  summary: [
    "欧几里得算法把最大公因式变成可执行过程。",
    "首一规范消除常数倍歧义。",
    "Bézout 等式连接互素与线性组合。",
    "下一节进入不可约分解的存在与唯一。",
  ],
  exercises: [
    "求 gcd(x²−1, x²+2x+1)。",
    "若 gcd(f,g)=1，说明为何不存在公共根。",
  ],
});
