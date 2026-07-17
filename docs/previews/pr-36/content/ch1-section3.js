defineChapter1Section("polynomial-divisibility", {
  number: "§3",
  textbookSection: "整除的概念",
  title: "整除的概念",
  navTitle: "整除的概念",
  question: "整数除法中的商和余数怎样迁移到多项式？为什么每一步都要消去当前最高次项？",
  goal: "理解多项式整除、带余除法及商余式唯一性；掌握单位、相伴与基本整除性质；能从完整除法过程判断是否整除。",
  tags: ["带余除法", "整除", "商余式", "相伴"],
  intro: `给定非零除式 ${texInline("g")}，任何 ${texInline("f")} 都能唯一写成 ${texInline("f=qg+r")}，其中 ${texInline("r=0")} 或 ${texInline("\\deg r<\\deg g")}。长除法每一步选择唯一的首项倍数，使当前最高次项消失；次数严格下降让算法在有限步后停止。`,
  concepts: [
    { label: "整除", text: `${texInline("g\\mid f")} 表示存在 ${texInline("q\\in F[x]")} 使 ${texInline("f=qg")}。` },
    { label: "带余除法", text: `${texInline("f=qg+r")}，且 ${texInline("r=0")} 或 ${texInline("\\deg r<\\deg g")}。` },
    { label: "唯一性", text: "除式非零时，商 q 与余式 r 由 f、g 唯一确定。" },
    { label: "单位", text: "F[x] 中的单位正是非零常数多项式。" },
    { label: "相伴", text: "两个非零多项式互为非零常数倍时相伴，它们彼此整除。" },
    { label: "传递性", text: `${texInline("a\\mid b")} 且 ${texInline("b\\mid c")} 可推出 ${texInline("a\\mid c")}。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章 §3",
    items: ["整除的定义与基本性质", "带余除法定理", "商余式唯一性", "单位与相伴"],
  },
  formal: {
    title: "用首项消去建立多项式除法",
    intro:
      "多项式除法不是试商。当前余式的最高次项只能由除式首项的某个倍数消去，所以商的下一项被唯一确定。乘回并相减后，最高次数严格下降；当次数低于除式时，任何继续相减都会破坏余式条件，算法在这里自然停止。",
    equation: "f(x)=q(x)g(x)+r(x),\\qquad r=0\\;\\text{或}\\;\\deg r<\\deg g",
    map: [
      { label: "看首项", text: "用当前余式首项除以除式首项，确定商的下一项。" },
      { label: "乘回", text: "把新商项乘除式，得到本轮要减去的多项式。" },
      { label: "相减", text: "当前最高次项精确抵消，余式次数下降。" },
      { label: "停止", text: "余式为 0 或次数低于除式，商余式同时确定。" },
    ],
    definitions: [
      {
        title: "整除与余式为零",
        text: `${texInline("g\\mid f")} 与“${texInline("f")} 除以 ${texInline("g")} 的余式为 0”完全等价。余式很小、系数近似为 0 都不算整除。`,
      },
      {
        title: "商余式为什么唯一",
        text: `若 ${texInline("f=q_1g+r_1=q_2g+r_2")}，则 ${texInline("(q_1-q_2)g=r_2-r_1")}。若商不同，左边次数至少为 ${texInline("\\deg g")}，右边次数却低于 ${texInline("\\deg g")}；只能两边都为 0。`,
      },
      {
        title: "单位与相伴",
        text: `非零常数 ${texInline("c")} 有逆 ${texInline("c^{-1}")}；因此 ${texInline("f")} 与 ${texInline("cf")} 互相整除。相伴多项式在分解中代表同一个不可约因子类型。`,
      },
      {
        title: "整除的线性组合性质",
        text: `若 ${texInline("d\\mid f")} 且 ${texInline("d\\mid g")}，则对任意 ${texInline("u,v\\in F[x]")} 有 ${texInline("d\\mid uf+vg")}。这是下一节 Bézout 等式的入口。`,
      },
    ],
    cards: [
      { kicker: "首项", title: "每一步只有一个正确商项", text: "商项的系数和次数都由两边首项相除决定，不能自由选择。" },
      { kicker: "余式", title: "停止条件是次数", text: "余式不要求“看起来简单”，只要求为 0 或次数严格低于除式。" },
      { kicker: "精确性", title: "整除没有近似状态", text: "本章使用精确有理系数运算，避免浮点误差把非零余式误判为 0。" },
    ],
    pitfalls: [
      "缺项时不补 0，导致相减位置错位。",
      "余式次数已经低于除式后仍继续试商。",
      "把非零常数因子当作不同的本质因子，忘记相伴关系。",
      "认为商余式可以有多组，只要拼回 f 即可。",
    ],
    note: "下一节把带余除法反复使用：不断用余式替换较大的多项式，直到得到最大公因式。",
  },
  interactive: {
    type: "slot",
    title: "实验：除法阶梯",
    description: "逐步显示首项相除、乘回、相减和次数下降；始终保留 f=qg+r 的不变量账本。",
    task: "完整计算 x⁴−1 除以 x²+x+1，再切换整除示例；用回退与重置检查每一步状态是否可逆。",
    prompts: [
      "先预测第一项商，再点击下一步验证。",
      "观察本轮被消去的首项和相减后的最高非零位置。",
      "每一步核对当前 f=qg+r 是否仍成立。",
      "结束时比较“余式为零”与“余式次数低于除式”两种状态。",
    ],
  },
  example: {
    title: "例题：完成一次带余除法",
    question: `用带余除法计算 ${texInline("x^4-1")} 除以 ${texInline("x^2+x+1")} 的商与余式，并判断是否整除。`,
    choices: [
      { correct: true, text: `商为 ${texInline("x^2-x")}，余式为 ${texInline("x-1")}，因此不整除。` },
      { text: `商为 ${texInline("x^2+1")}，余式为 0。` },
      { text: `商为 ${texInline("x^2-x")}，余式为 0。` },
      { text: "商和余式不唯一，可以换一组继续相等。" },
    ],
    steps: [
      `${texInline("x^4/x^2=x^2")}，所以商的第一项是 ${texInline("x^2")}。`,
      `减去 ${texInline("x^2(x^2+x+1)=x^4+x^3+x^2")} 后，当前余式为 ${texInline("-x^3-x^2-1")}。`,
      `${texInline("-x^3/x^2=-x")}；减去 ${texInline("-x(x^2+x+1)")}。`,
      `得到余式 ${texInline("x-1")}，其次数 1 小于除式次数 2，算法停止。`,
      `因此 ${texInline("x^4-1=(x^2-x)(x^2+x+1)+(x-1)")}；余式非零，所以不整除。`,
    ],
  },
  quiz: [
    { question: `${texInline("g\\mid f")} 的精确定义是什么？`, answer: `存在 ${texInline("q\\in F[x]")} 使 ${texInline("f=qg")}。` },
    { question: "带余除法对余式有什么限制？", answer: `余式为 0，或 ${texInline("\\deg r<\\deg g")}。` },
    { question: "长除法每一步为什么必须看首项？", answer: "只有首项相除得到的商项才能精确消掉当前最高次项。" },
    { question: "为什么算法一定停止？", answer: "每个非终止步骤都让余式次数严格下降，而次数是非负整数。" },
    { question: "F[x] 中的单位是什么？", answer: "所有非零常数多项式。" },
    { question: "相伴多项式是什么关系？", answer: "互为非零常数倍，因此彼此整除。" },
    { question: `${texInline("d\\mid f,d\\mid g")} 能推出什么线性组合结论？`, answer: `对任意 ${texInline("u,v")}，都有 ${texInline("d\\mid uf+vg")}。` },
  ],
  summary: [
    "带余除法把 f 唯一拆成 qg+r。",
    "首项消去保证每一步商项唯一，次数下降保证算法终止。",
    "整除等价于最终余式精确为 0。",
    "非零常数是单位；相伴多项式只差一个单位因子。",
    "下一节反复取余，寻找两个多项式的首一最大公因式。",
  ],
  exercises: [
    `计算 ${texInline("x^5+1")} 除以 ${texInline("x^2+1")} 的商与余式。`,
    `判断 ${texInline("x^2-x+1")} 是否整除 ${texInline("x^6+1")}。`,
    "证明整除关系具有传递性。",
  ],
});
