defineChapter1Section("polynomial-functions", {
  number: "§7",
  textbookSection: "多项式函数",
  title: "多项式函数：评价连接余式、根与插值",
  navTitle: "多项式函数",
  question: "代入一个数为什么等于除以 x−a 的余式？这个事实怎样同时解释根数上界和插值唯一性？",
  goal: "掌握评价映射、余数定理、因式定理、根数上界和 Lagrange 插值；理解形式多项式与它诱导的函数之间的关系。",
  tags: ["评价", "余数定理", "根数上界", "Lagrange 插值"],
  intro:
    "带余除法对一次式 x−a 的余式次数低于 1，因此余式只能是常数。把 x=a 代入，乘积项消失，这个常数就是 f(a)。一个短等式由此把函数值、根、一次因式和插值串成同一条逻辑链。",
  concepts: [
    { label: "评价", text: `${texInline("\\operatorname{ev}_a(f)=f(a)")} 保持加法与乘法。` },
    { label: "余数定理", text: `${texInline("f(x)=(x-a)q(x)+f(a)")}。` },
    { label: "根数上界", text: "非零 n 次多项式在数域中至多有 n 个不同根。" },
    { label: "插值", text: "n+1 个横坐标互异的节点唯一确定一个次数不超过 n 的多项式。" },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章 §7 · Hoffman–Kunze 第 4 章 · Friedberg 插值材料 · Strang Vandermonde 材料",
    items: ["多项式函数与评价", "余数定理与因式定理", "根数上界", "Lagrange 插值"],
  },
  formal: {
    title: "一次除法把代入变成代数结构",
    intro:
      "Horner 法负责高效算出 f(a)，余数定理负责解释这个数的结构含义。每个不同根都贡献一个不同的一次因式；反过来，Lagrange 基函数在指定节点上像开关一样只点亮一个位置，从而重建低次多项式。",
    equation: "f(x)=(x-a)q(x)+f(a)",
    map: [
      { label: "Horner 评价", text: "从最高次系数开始，重复“乘 a，再加下一系数”。" },
      { label: "读余式", text: "除以 x−a 的余式是常数，代入 a 后正好等于 f(a)。" },
      { label: "数根", text: "每个不同根给出一个互不相伴的一次因式。" },
      { label: "反向重建", text: "Lagrange 基在自己的节点取 1，在其他节点取 0。" },
    ],
    bridge: {
      title: "三个实验模式在使用同一个评价映射",
      text: "Horner 模式计算单点值；根数模式把值为零转成一次因式；插值模式指定若干评价值，再求唯一的低次原像。左侧图像只是这些评价点的几何记录。",
    },
    theorem: {
      label: "评价主线",
      title: "余数定理同时控制根数与插值唯一性",
      statement: `${texInline("f(a)=0\\iff(x-a)\\mid f")}。因此非零 n 次多项式至多有 n 个不同根；给定互异的 ${texInline("x_0,\\ldots,x_n")} 与任意 ${texInline("y_0,\\ldots,y_n")}，恰有一个次数不超过 n 的多项式满足 ${texInline("f(x_i)=y_i")}。`,
    },
    proof: {
      title: "从一个根到 n+1 个评价条件",
      steps: [
        { title: "余数等于函数值", text: `用除法定理写 ${texInline("f=(x-a)q+r")}；deg r<1，所以 r 为常数，代入 a 得 ${texInline("r=f(a)")}。` },
        { title: "根变成因式", text: `${texInline("f(a)=0")} 与余式 r=0 等价，也就与 ${texInline("x-a\\mid f")} 等价。` },
        { title: "不同根消耗次数", text: `m 个不同根给出乘积 ${texInline("\\prod_{i=1}^m(x-a_i)\\mid f")}；比较次数得到 ${texInline("m\\le\\deg f")}。` },
        { title: "插值的存在与唯一", text: `令 ${texInline("L_i=\\prod_{j\\ne i}\\frac{x-x_j}{x_i-x_j}")} 并取 ${texInline("f=\\sum y_iL_i")} 得到存在性；两组答案之差有 n+1 个根且次数不超过 n，所以只能为 0。` },
      ],
    },
    definitions: [
      { title: "Horner 法", text: `${texInline("a_0+a_1x+\\cdots+a_nx^n")} 可嵌套成 ${texInline("(\\cdots((a_nx+a_{n-1})x+a_{n-2})\\cdots)x+a_0")}，只需逐层保留一个累积值。` },
      { title: "Lagrange 基", text: `${texInline("L_i(x_j)=\\delta_{ij}")}。每个基函数只负责一个节点的目标值，线性叠加后所有条件同时成立。` },
      { title: "形式与函数的对应", text: "在本章的无限数域上，两个多项式若在每个点取值相同，它们的差拥有无限多个根，只能是零多项式，因此系数也完全相同。" },
    ],
    boundary: {
      title: "插值节点必须互异，函数唯一性也需要留意数域",
      text: `若 ${texInline("x_i=x_j")} 而目标值不同，插值条件直接冲突；Lagrange 分母也会为 0。有限域上还可能出现不同形式诱导同一函数，例如 ${texInline("x^p-x")} 在 ${texInline("\\mathbb F_p")} 的每个点都取 0。`,
    },
    pitfalls: [
      "根数上界计算不同根，不把重数重复计入。",
      "Lagrange 节点的横坐标必须两两不同。",
      "形式相等始终以系数为定义；函数值判定依赖数域条件。",
    ],
    note: "评价把线性因式与根连接起来。下一节加入代数基本定理，说明 C 中完全分裂、R 中以一次和不可约二次因式终止。",
  },
  interactive: {
    type: "slot",
    title: "实验：评价、根预算与插值",
    description: "在 Horner、不同根上界和三点 Lagrange 插值之间切换，所有计算都使用精确有理数。",
    task: "移动评价点检查余数定理；给 n 次多项式分配不同根；最后编辑三个互异节点并重建二次以下多项式。",
    controlsTitle: "选择评价、根预算或插值",
    controlsDescription: "三个模式共用评价这一主线：先算一个点，再分配零点，最后由三个点反向重建多项式。",
    guide: [
      ["评价", "用 Horner 账本算 f(a)，再判断 x−a 是否为因式。"],
      ["分配根", "每加入一个不同根，就消耗一个一次因式的次数。"],
      ["重建", "观察每个 Lagrange 基怎样只点亮自己的节点。"],
    ],
    takeaway: "代入值就是一次除法的余式；不同根受次数限制；互异节点唯一决定低次多项式。",
    prompts: [
      "找到一个使 f(a)=0 的评价点。",
      "尝试让不同根数超过次数，解释为什么构造失败。",
      "把两个节点横坐标设成相同值，阅读冲突提示。",
    ],
  },
  example: {
    title: "用 Lagrange 思想重建二次多项式",
    question: `求次数不超过 2 且通过 ${texInline("(0,1),(1,2),(2,5)")} 的多项式。`,
    choices: [
      { correct: true, text: `${texInline("f(x)=x^2+1")}。` },
      { text: `${texInline("f(x)=2x+1")}。` },
      { text: `${texInline("f(x)=x^2+x+1")}。` },
      { text: "三个点无法唯一确定二次多项式。" },
    ],
    steps: [
      `三个 Lagrange 基分别为 ${texInline("L_0=\\frac{(x-1)(x-2)}2")}、${texInline("L_1=-x(x-2)")}、${texInline("L_2=\\frac{x(x-1)}2")}。`,
      `按目标值组合 ${texInline("f=L_0+2L_1+5L_2")}。`,
      "展开并合并同类项得到 x²+1。",
      "代入 0、1、2 分别得到 1、2、5；唯一性由根数上界保证。",
    ],
  },
  quiz: [
    { question: "f 除以 x−a 的余式是什么？", answer: `${texInline("f(a)")}。` },
    { question: "非零 n 次多项式最多有多少个不同根？", answer: "n 个。" },
    { question: "三个互异横坐标能唯一确定什么次数范围的多项式？", answer: "次数不超过 2。" },
    { question: "Lagrange 基 Lᵢ 在各节点取什么值？", answer: "在第 i 个节点取 1，在其他节点取 0。" },
  ],
  summary: [
    "除以 x−a 的余式就是 f(a)，所以根与一次因式等价。",
    "不同根的数量不超过非零多项式的次数。",
    "n+1 个互异节点唯一确定次数不超过 n 的插值多项式。",
  ],
  exercises: [
    `用 Horner 法计算 ${texInline("2x^4-3x^2+x-5")} 在 ${texInline("x=2")} 的值。`,
    "证明两个次数不超过 n 的多项式若在 n+1 个互异点取值相同，则它们相等。",
    `求通过 ${texInline("(-1,2),(0,0),(2,3)")} 的二次以下插值多项式。`,
  ],
});
