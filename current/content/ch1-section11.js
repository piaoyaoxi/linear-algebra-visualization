defineChapter1Section("symmetric-polynomials", {
  number: "§11",
  textbookSection: "对称多项式",
  title: "对称多项式：变量换位后保持的结构",
  navTitle: "对称多项式",
  question: "怎样严格检验一个多项式对所有变量置换不变？为什么 σ₁,…,σₙ 足以表达全部对称多项式？",
  goal: "掌握变量置换、单项式轨道和基本对称多项式；理解对称多项式基本定理的最高项消去算法，并用 Vieta 连接根与系数。",
  tags: ["置换", "轨道", "基本对称多项式", "Vieta"],
  intro:
    "变量置换会重新排列指数向量的坐标。一个多项式若在所有置换下保持不变，同一轨道内的单项式必须带有相同系数。基本对称多项式 σ₁,…,σₙ 提供了一组适合消去最高单项式的坐标，最终能够生成全部对称多项式。",
  concepts: [
    { label: "对称", text: `对每个 ${texInline("\\pi\\in S_n")} 都有 ${texInline("f(x_{\\pi(1)},\\ldots,x_{\\pi(n)})=f(x_1,\\ldots,x_n)")}。` },
    { label: "单项式轨道", text: "一个指数向量在所有坐标置换下得到的不同地址集合。" },
    { label: "基本对称多项式", text: `${texInline("\\sigma_k=\\sum_{i_1<\\cdots<i_k}x_{i_1}\\cdots x_{i_k}")}。` },
    { label: "基本定理", text: `每个对称多项式都能唯一写成 ${texInline("G(\\sigma_1,\\ldots,\\sigma_n)")}。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章 §11",
    items: ["变量置换与对称性", "基本对称多项式", "基本定理及消项法", "根与系数关系"],
  },
  formal: {
    title: "置换重排地址，对称多项式保持轨道系数",
    intro:
      "检验对称性时要先置换指数坐标，再合并同类项并按固定次序比较。基本定理的构造算法同样依赖固定单项式次序：找到最高单项式，用一个 σ 的乘积匹配它，减掉以后最高项严格下降。",
    equation: "\\sigma_1=\\sum_i x_i,\\quad\\sigma_2=\\sum_{i<j}x_ix_j,\\quad\\ldots,\\quad\\sigma_n=x_1\\cdots x_n",
    map: [
      { label: "置换", text: "重新排列变量标签，也就是重新排列指数坐标。" },
      { label: "规范化", text: "合并相同指数向量并按统一次序排列。" },
      { label: "找最高项", text: "对称性保证最高指数可以写成 α₁≥⋯≥αₙ。" },
      { label: "用 σ 消去", text: "匹配最高项后相减，重复直到余式为 0。" },
    ],
    bridge: {
      title: "轨道检查回答“是否对称”，改写步进回答“怎样表达”",
      text: "左侧把换位与三循环分开执行，并始终规范化后比较；右侧展示 σ 展开中最高项和多余项怎样产生。Vieta 面板再把 x、y、z 换成一元多项式的根。",
    },
    theorem: {
      label: "对称多项式基本定理",
      title: "σ₁,…,σₙ 是全部对称多项式的唯一坐标",
      statement: `对任意 ${texInline("f\\in F[x_1,\\ldots,x_n]")}，f 对称当且仅当存在唯一的 ${texInline("G\\in F[t_1,\\ldots,t_n]")} 使 ${texInline("f=G(\\sigma_1,\\ldots,\\sigma_n)")}。`,
    },
    proof: {
      title: "最高项消去形成一个有限三角算法",
      intro: `采用字典序 ${texInline("x_1>x_2>\\cdots>x_n")}。`,
      steps: [
        { title: "整理最高指数", text: `对称性允许把最高单项式写成 ${texInline("x_1^{\\alpha_1}\\cdots x_n^{\\alpha_n}")} 且 ${texInline("\\alpha_1\\ge\\cdots\\ge\\alpha_n")}。` },
        { title: "构造匹配的 σ 乘积", text: `取 ${texInline("\\sigma_1^{\\alpha_1-\\alpha_2}\\sigma_2^{\\alpha_2-\\alpha_3}\\cdots\\sigma_n^{\\alpha_n}")}；它的字典序最高项恰好等于目标最高单项式。` },
        { title: "相减并下降", text: "乘上目标系数后从 f 中减去，最高项被消掉；余式仍对称，且新最高项严格更低，因此有限步终止。" },
        { title: "说明唯一性", text: "不同 σ 幂乘积具有不同的最高指数向量。若两种 G 表示相减为 0，其中最高的 σ 幂乘积无法被其他项抵消，所以全部系数只能为 0。" },
      ],
    },
    definitions: [
      { title: "三元基本构件", text: `${texInline("\\sigma_1=x+y+z")}、${texInline("\\sigma_2=xy+xz+yz")}、${texInline("\\sigma_3=xyz")}；任意变量置换只会重排每个和式中的项。` },
      { title: "轨道系数条件", text: `指数 ${texInline("(2,1,0)")} 的轨道有六个单项式。对称多项式若包含其中一个，就必须以同一系数包含轨道内全部项。` },
      { title: "Vieta 是一次代入", text: `若 ${texInline("p(t)=\\prod_{i=1}^n(t-r_i)=t^n-c_1t^{n-1}+c_2t^{n-2}-\\cdots")}，则 ${texInline("c_k=\\sigma_k(r_1,\\ldots,r_n)")}。系数天然不依赖根的排列。` },
    ],
    boundary: {
      title: "循环对称没有覆盖全部置换",
      text: `${texInline("x^2y+y^2z+z^2x")} 在循环 ${texInline("x\\to y\\to z\\to x")} 下保持不变；交换 x、y 后得到 ${texInline("y^2x+x^2z+z^2y")} ，通常不同。三变量对称性可以通过相邻换位生成元检验，单独检查一个三循环不够。`,
    },
    pitfalls: [
      "表达式比较前要先合并同类项并统一排序。",
      "循环不变只覆盖 Sₙ 的一部分置换。",
      "Vieta 的符号随系数次数交替。",
    ],
    note: "第一章在不变量处收束：数域固定合法运算，唯一分解固定不可约部件，对称理论固定变量置换下的表达。",
  },
  interactive: {
    type: "slot",
    title: "实验：S₃ 轨道、σ 消项与 Vieta",
    description: "对表达式执行换位和三循环，生成单项式轨道，逐步改写三个对称例子，并把 σ 值映射到一元多项式系数。",
    task: "区分全对称、循环对称和非对称；生成 (2,1,0) 的完整轨道；完成平方和与轨道和的 σ 改写。",
    guide: [
      ["检验置换", "规范化比较原式和置换后表达式。"],
      ["观察轨道", "检查同一轨道的项是否不重不漏、系数一致。"],
      ["逐步消项", "展开 σ 乘积，识别目标项和需要扣除的多余项。"],
    ],
    takeaway: "对称性是全部置换下的不变性；σ₁,…,σₙ 通过最高项消去唯一生成所有对称多项式。",
    prompts: [
      "先对循环反例做三循环，再做换位。",
      "核对 (2,1,0) 轨道的六个不同单项式。",
      "完成 x²+y²+z²=σ₁²−2σ₂，并用一个数值代入复核。",
    ],
  },
  example: {
    title: "用 σ 改写两个典型轨道和",
    question: `用 ${texInline("\\sigma_1,\\sigma_2,\\sigma_3")} 表示 ${texInline("x^2+y^2+z^2")} 与 ${texInline("\\sum_{sym}x^2y")}。`,
    choices: [
      { correct: true, text: `${texInline("x^2+y^2+z^2=\\sigma_1^2-2\\sigma_2")}；${texInline("\\sum_{sym}x^2y=\\sigma_1\\sigma_2-3\\sigma_3")}。` },
      { text: "两式分别等于 σ₁² 与 σ₁σ₂。" },
      { text: "两式分别等于 σ₂ 与 σ₃。" },
      { text: "对称多项式无法用有限个基本构件表达。" },
    ],
    steps: [
      `${texInline("\\sigma_1^2=x^2+y^2+z^2+2\\sigma_2")}，移项得到第一个公式。`,
      `展开 ${texInline("\\sigma_1\\sigma_2")} 时，每个 x²y 型轨道项出现一次。`,
      `${texInline("xyz")} 由 x·yz、y·xz、z·xy 出现三次，即多出 ${texInline("3\\sigma_3")}。`,
      "扣除这三项得到第二个公式。",
    ],
  },
  quiz: [
    { question: "n 元对称多项式的定义是什么？", answer: "对 Sₙ 中每一个变量置换都保持不变。" },
    { question: "指数 (2,1,0) 在 S₃ 下有几个不同轨道项？", answer: "6 个。" },
    { question: "三元基本对称多项式有哪些？", answer: "σ₁=x+y+z，σ₂=xy+xz+yz，σ₃=xyz。" },
    { question: "最高项消去为什么终止？", answer: "每一步都使固定单项式次序下的最高项严格下降。" },
  ],
  summary: [
    "对称性要求对全部变量置换保持不变，同一单项式轨道内系数一致。",
    "基本对称多项式通过最高项消去唯一生成所有对称多项式。",
    "Vieta 把根的基本对称多项式直接转成一元多项式系数。",
  ],
  exercises: [
    `把 ${texInline("x^3+y^3+z^3-3xyz")} 写成 σ 的多项式。`,
    `列出指数 ${texInline("(3,1,1)")} 在 S₃ 下的不同轨道项。`,
    `用 Vieta 表示三次首一多项式根的 ${texInline("r_1^2+r_2^2+r_3^2")}。`,
  ],
});
