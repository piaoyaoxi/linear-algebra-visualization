defineChapter1Section("rational-polynomials", {
  number: "§9",
  textbookSection: "有理系数多项式",
  title: "有理系数多项式：把分解问题压回整数",
  navTitle: "有理系数多项式",
  question: "分数系数怎样规范化为本原整系数多项式？有理根定理与 Eisenstein 判据各自能排除哪些分解？",
  goal: "掌握内容、本原多项式与 Gauss 引理；会生成并验证全部有理根候选，正确使用 Eisenstein 不可约判据。",
  tags: ["Gauss 引理", "本原多项式", "有理根定理", "Eisenstein"],
  intro:
    "有理系数多项式带着分母，不便直接使用整数整除性。清分母并提出系数的最大公因数后，剩下的本原部分保留全部非常数因式。Gauss 引理说明这一步不会改变可约性；有理根定理给出有限候选，Eisenstein 判据在三项整除条件成立时直接判定不可约。",
  concepts: [
    { label: "内容", text: "整系数多项式全部系数的正最大公因数，记作 cont(f)。" },
    { label: "本原", text: `${texInline("\\operatorname{cont}(f)=1")}。` },
    { label: "有理根候选", text: `既约根 ${texInline("p/q")} 必须满足 ${texInline("p\\mid a_0,q\\mid a_n")}。` },
    { label: "Eisenstein", text: "用一个素数同时控制首项、其余系数和常数项的 p² 整除性。" },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章 §9",
    items: ["内容与本原多项式", "Gauss 引理", "有理根定理", "Eisenstein 判据"],
  },
  formal: {
    title: "规范化以后，整数整除性成为分解探针",
    intro:
      "清分母和提内容都只改变非零常数因子，不会增加或删去正次数因式。对非零有理系数多项式，约定本原部分的首项系数为正，就能固定符号。Gauss 引理据此把 Q[x] 中的可约性转成 Z[x] 中的可约性。",
    equation: "0\\ne f=c\\,f^*,\\qquad c\\in\\mathbb Q^\\times,\\quad f^*\\in\\mathbb Z[x]\\text{ 本原且首项系数为正}",
    map: [
      { label: "清分母", text: "乘系数分母的最小公倍数，得到整系数多项式。" },
      { label: "提内容", text: "提出系数 gcd，留下本原部分 f*。" },
      { label: "筛有理根", text: "由首项和常数项的因数生成既约候选，再逐一精确代入。" },
      { label: "检查判据", text: "选择素数检查 Eisenstein 三条件；同时成立即可判定不可约。" },
    ],
    bridge: {
      title: "三个工作台回答三类问题",
      text: "本原化面板核对 f=c f*；候选筛选器检验某个整系数多项式是否有有理根；素数检查器判断另一个例子是否满足 Eisenstein 三条件。三个面板使用独立示例，所有运算都保留精确整数或有理数。",
    },
    theorem: {
      label: "Gauss 引理",
      title: "本原多项式的乘积仍本原",
      statement: `若 ${texInline("f,g\\in\\mathbb Z[x]")} 都本原，则 ${texInline("fg")} 本原。由此，一个正次数本原整系数多项式在 ${texInline("\\mathbb Q[x]")} 中可约，当且仅当它在 ${texInline("\\mathbb Z[x]")} 中可约。`,
    },
    proof: {
      title: "用模素数排除共同因子",
      steps: [
        { title: "假设乘积不本原", text: "若 fg 的所有系数有共同素因子 p，则 fg 模 p 后成为零多项式。" },
        { title: "本原保证两边非零", text: "f、g 各自至少有一个系数不被 p 整除，所以它们模 p 后都是 Fₚ[x] 中的非零多项式。" },
        { title: "利用无零因子", text: "域上的两个非零多项式乘积非零，与 fg 模 p 为零矛盾。因此 fg 没有共同素因子。" },
        { title: "连接 Q[x] 与 Z[x]", text: "若在 Q[x] 中分解，分别清分母、提内容，再用乘积本原性校正常数，就得到 Z[x] 中的非常数分解；反向显然成立。" },
      ],
    },
    definitions: [
      { title: "有理根定理", text: `对 ${texInline("a_nx^n+\\cdots+a_0\\in\\mathbb Z[x]")} 的既约有理根 ${texInline("p/q")}，代入并整理可知 ${texInline("p\\mid a_0")}、${texInline("q\\mid a_n")}。它生成候选，不保证候选一定为根。` },
      { title: "Eisenstein 判据", text: `若存在素数 p，使 ${texInline("p\\nmid a_n")}、${texInline("p\\mid a_0,\\ldots,a_{n-1}")} 且 ${texInline("p^2\\nmid a_0")}，则 f 在 Q[x] 中不可约。` },
      { title: "判据失败的含义", text: "某个素数未通过三条件，只能说明 Eisenstein 判据对这个素数没有给出结论。可以换素数、作变量平移，或使用其他分解方法。" },
    ],
    boundary: {
      title: "没有有理根，只排除了一次因式",
      text: `${texInline("x^4+4")} 的有理根候选都不是根，但 ${texInline("x^4+4=(x^2-2x+2)(x^2+2x+2)")}。对二次、三次多项式，无有理根足以判 Q 上不可约；从四次开始还要排除更高次数的因式组合。`,
    },
    pitfalls: [
      "候选 p/q 要既约、包含正负并去重。",
      "有理根候选需要逐个代入验证。",
      "Eisenstein 失败没有给出可约结论。",
    ],
    note: "一元多项式的系数位置、除法和分解至此形成闭环。下一节把位置从一条系数带推广到多维指数格点。",
  },
  interactive: {
    type: "slot",
    title: "实验：本原化、有理根与 Eisenstein",
    description: "分别观察本原化等式、有理根候选的代入值，以及 Eisenstein 三项整除条件。",
    task: "分别完成三项检查：规范化分数系数多项式，逐个验证 2x³+x²−x−1 的有理根候选，再用 p=5 检查 x⁵+10x+5。",
    guide: [
      ["规范化", "核对公分母、提出常数和本原部分的乘积。"],
      ["验候选", "由常数项与首项列出 ±p/q，再点击逐项代入。"],
      ["查判据", "逐条检查 Eisenstein 条件，并判断结论是否成立。"],
    ],
    controlsTitle: "选择示例与检验条件",
    controlsDescription: "三个工作台彼此独立：先选规范化示例，再选待检验多项式与素数。",
    takeaway: "本原化保留正次数因式；有理根定理只给候选，Eisenstein 三条件同时成立才得到不可约结论。",
    prompts: [
      "比较原多项式与本原部分的非常数因式。",
      "逐个点击候选，读取精确代入值。",
      "让一个素数失败，确认结论只写“未判出”。",
    ],
  },
  example: {
    title: "同时使用 Eisenstein 与有理根定理",
    question: `证明 ${texInline("x^5+10x+5")} 在 Q[x] 中不可约；列出 ${texInline("2x^3+x^2-x-1")} 的全部有理根候选。`,
    choices: [
      { correct: true, text: `前者对 ${texInline("p=5")} 满足 Eisenstein；后者候选为 ${texInline("\\pm1,\\pm\\frac12")}。` },
      { text: "前者没有整数根，所以任意次数都不可约；后者候选只有 1。" },
      { text: "前者应取 p=2；后者候选为 ±2。" },
      { text: "有理根候选只由常数项决定。" },
    ],
    steps: [
      "对 x⁵+10x+5 取 p=5：首项系数不被 5 整除，其余系数都被 5 整除。",
      "常数项 5 不被 25 整除，因此三条件全部成立。",
      "对 2x³+x²−x−1，既约根 p/q 满足 p|−1、q|2。",
      `约分去重后得到 ${texInline("\\pm1,\\pm\\frac12")}；候选还需代入才能确认实际根。`,
    ],
  },
  quiz: [
    { question: "整系数多项式的内容是什么？", answer: "全部系数的正最大公因数。" },
    { question: "Gauss 引理怎样连接 Q[x] 与 Z[x]？", answer: "本原整系数多项式在 Q[x] 可约当且仅当在 Z[x] 可约。" },
    { question: "既约有理根 p/q 满足哪些整除条件？", answer: "p 整除常数项，q 整除首项系数。" },
    { question: "Eisenstein 对某个 p 失败能推出什么？", answer: "只能说该素数未给出结论。" },
  ],
  summary: [
    "清分母、提内容后，本原整系数部分承载真正的分解问题。",
    "有理根定理给出有限候选，候选仍需精确验证。",
    "Eisenstein 是不可约的充分判据，失败时不产生反向结论。",
  ],
  exercises: [
    `求 ${texInline("\\frac32x^3-\\frac94x+\\frac38")} 的本原整系数部分。`,
    `用有理根定理分解 ${texInline("3x^3-5x^2-2x+4")}。`,
    `对 ${texInline("x^4+1")} 作变量平移，尝试寻找 Eisenstein 证书。`,
  ],
});
