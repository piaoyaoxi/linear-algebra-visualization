defineChapter1Section("univariate-polynomials", {
  number: "§2",
  textbookSection: "一元多项式",
  title: "一元多项式：把系数放在正确的位置",
  navTitle: "一元多项式",
  question: "一个多项式由什么决定？为什么缺少的中间项要补 0，而乘法的某个系数要收集许多组来源？",
  goal: `把 ${texInline("F[x]")} 中的多项式理解为有限支撑的系数序列，掌握相等、加法、乘法和次数规律，并能追踪乘积指定次数的全部贡献。`,
  tags: ["形式多项式", "系数序列", "卷积", "次数"],
  intro:
    "幂次给系数提供了位置标签。多项式的相等由每个位置的系数决定；加法按位置对齐，乘法把指数和相同的配对汇入同一位置。把对象先建在系数层，图像、代入和根才会在后续拥有可靠的代数基础。",
  concepts: [
    { label: "形式多项式", text: `${texInline("f=\\sum_{i\\ge0}a_ix^i")}，其中只有有限多个 ${texInline("a_i")} 非零。` },
    { label: "相等", text: `${texInline("f=g")} 当且仅当每个位置都有 ${texInline("a_i=b_i")}。` },
    { label: "乘法系数", text: `${texInline("[x^k](fg)=\\sum_{i+j=k}a_ib_j")}。` },
    { label: "次数", text: "非零多项式的次数是最高非零位置；零多项式单独约定。" },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章 §2 · Hoffman–Kunze 第 4 章 · Friedberg 多项式附录",
    items: ["形式多项式及相等", "加法与乘法", "次数与首项", "多项式和多项式函数的区分"],
  },
  formal: {
    title: "系数序列给出多项式的代数身份",
    intro:
      "书写顺序可以变化，函数图像也可能只显示局部；系数序列保留了全部形式信息。内部零系数占据真实位置，尾部零系数可以删去。乘法时，每一对系数先把指数相加，再按结果指数归档。",
    equation: "(a_0,a_1,\\ldots)*(b_0,b_1,\\ldots)=\\left(\\sum_{i+j=k}a_ib_j\\right)_{k\\ge0}",
    map: [
      { label: "位置", text: "aᵢ 永远附着在 xⁱ 上；缺项用 0 保留地址。" },
      { label: "加法", text: "同一幂次的系数相加，首项可能抵消。" },
      { label: "乘法", text: "指数相加决定落点，落在同一点的贡献再求和。" },
      { label: "规范化", text: "删去最高端连续的零，读取最高非零下标。" },
    ],
    bridge: {
      title: "系数带把定义直接画了出来",
      text: "实验中每一列固定代表一个幂次。加减只在竖直方向发生；乘法模式的贡献表则沿着 i+j=k 的对角线收集配对。图像放在最后，只用于观察计算结果。",
    },
    theorem: {
      label: "次数定理",
      title: "非零乘积的次数相加",
      statement: `若 ${texInline("f,g\\in F[x]")} 都非零，则 ${texInline("\\deg(fg)=\\deg f+\\deg g")}。当 ${texInline("f+g\\ne0")} 时，${texInline("\\deg(f+g)\\le\\max(\\deg f,\\deg g)")}；首项抵消时可能严格小于。`,
    },
    proof: {
      title: "最高次项为什么不会在乘法中消失",
      steps: [
        { title: "写出首项", text: `设 ${texInline("f=a_mx^m+\\cdots")}、${texInline("g=b_nx^n+\\cdots")}，其中 ${texInline("a_m,b_n\\ne0")}。` },
        { title: "定位最高指数", text: `任何项的指数和都不超过 ${texInline("m+n")}；达到 ${texInline("m+n")} 的配对只有首项与首项。` },
        { title: "使用数域性质", text: `${texInline("x^{m+n}")} 的系数是 ${texInline("a_mb_n\\ne0")}。数域中两个非零数的乘积仍非零。` },
        { title: "读取次数", text: `因此最高非零位置恰为 ${texInline("m+n")}。加法则可能让两个首项系数相消，所以只得到上界。` },
      ],
    },
    definitions: [
      { title: "零多项式", text: "所有系数都为 0。它没有最高非零项，因此次数需要单独约定；常见做法是记 deg 0=−∞。" },
      { title: "卷积的含义", text: `固定 ${texInline("k")} 后，贡献来自 ${texInline("(0,k),(1,k-1),\\ldots,(k,0)")} 中实际存在的所有配对。对应位置相乘只取到其中一项，通常会漏算。` },
      { title: "形式与函数", text: "本节用系数定义形式多项式。§7 才引入评价 f↦f(a)，把形式对象送成一个函数。" },
    ],
    boundary: {
      title: "有限个取值不能代替系数比较",
      text: `多项式 ${texInline("h=x(x-1)\\cdots(x-m)")} 在 ${texInline("0,1,\\ldots,m")} 处都取 0，但 ${texInline("h")} 仍是非零形式多项式。检查若干函数值只能发现差异，不能据此证明两个形式多项式相等。`,
    },
    pitfalls: [
      "删除内部零系数会把后续所有幂次错位。",
      "两个同次数多项式相加后，次数可能因首项抵消而下降。",
      "乘积系数需要收集全部指数和相同的配对。",
    ],
    note: "多项式的运算已经建立。下一节利用最高项唯一确定商项，构造带余除法。",
  },
  interactive: {
    type: "slot",
    title: "实验：系数带工作台",
    description: "编辑两个有限系数序列，比较加减、数乘与卷积乘法，并追踪指定结果次数的全部来源。",
    task: "先观察首项抵消，再在乘法模式中逐项核对 i+j=k；最后检查分数系数与零多项式。",
    guide: [
      ["对齐", "把 f 与 g 的相同幂次放在同一列。"],
      ["选择运算", "观察加法的同列规则和乘法的跨列配对。"],
      ["追踪来源", "固定 k，核对贡献表中每一组 i+j=k。"],
    ],
    takeaway: "形式多项式由有位置的系数决定；乘法是指数相加后的精确卷积。",
    prompts: [
      "把一个中间系数设为 0，确认它的位置仍保留。",
      "使用首项抵消预设，比较输入次数与和的次数。",
      "切到乘法并改变 k，手算贡献表的总和。",
    ],
  },
  example: {
    title: "同时检查位置、抵消与卷积",
    question: `设 ${texInline("f=2-x+3x^3")}，${texInline("g=-2+x+x^2-3x^3")}。求 ${texInline("f+g")}、${texInline("[x^3](fg)")} 与 ${texInline("\\deg(fg)")}。`,
    choices: [
      { correct: true, text: `${texInline("f+g=x^2")}，${texInline("[x^3](fg)=-13")}，${texInline("\\deg(fg)=6")}。` },
      { text: `${texInline("f+g")} 仍为三次，因为两个加数都是三次。` },
      { text: `${texInline("[x^3](fg)=3(-3)=-9")}。` },
      { text: `${texInline("f")} 的系数序列是 ${texInline("[2,-1,3]")}。` },
    ],
    steps: [
      `${texInline("f=[2,-1,0,3]")}，${texInline("g=[-2,1,1,-3]")}。`,
      "逐位置相加得到 [0,0,1,0]，规范化后为 x²。",
      `${texInline("[x^3](fg)=a_0b_3+a_1b_2+a_2b_1+a_3b_0=-6-1+0-6=-13")}。`,
      "两个首项系数的乘积为 −9≠0，所以乘积次数为 3+3=6。",
    ],
  },
  quiz: [
    { question: `${texInline("[1,0,2]")} 表示什么？`, answer: `${texInline("1+2x^2")}。` },
    { question: "两个形式多项式何时相等？", answer: "每一个幂次位置的系数都相等。" },
    { question: `${texInline("[x^4](fg)")} 收集哪些配对？`, answer: `${texInline("a_0b_4+a_1b_3+a_2b_2+a_3b_1+a_4b_0")}。` },
    { question: "deg(f+g) 何时会小于两者的较大次数？", answer: "最高次项系数相消时。" },
  ],
  summary: [
    "形式多项式是只有有限个非零项的有位置系数序列。",
    "加法按位置对齐，乘法按指数和聚合。",
    "非零乘积次数相加；和的次数可能因首项抵消而下降。",
  ],
  exercises: [
    `把 ${texInline("3-2x^2+x^5")} 写成系数序列，并指出首项。`,
    `求 ${texInline("(1+x+x^2)(1-x+x^3)")} 的 ${texInline("x^3")} 与 ${texInline("x^4")} 系数。`,
    "构造两个四次多项式，使它们的和恰为一次。",
  ],
});
