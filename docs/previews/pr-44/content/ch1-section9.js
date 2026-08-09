defineChapter1Section("rational-polynomials", {
  number: "§9",
  textbookSection: "有理系数多项式",
  title: "有理系数多项式：把分解问题压回整数",
  navTitle: "有理系数多项式",
  question: "分数系数怎样规范化为本原整系数多项式？有理根定理与 Eisenstein 判据各自能排除哪些分解？",
  goal: "掌握内容、本原多项式与 Gauss 引理；会生成并验证全部有理根候选，正确使用 Eisenstein 不可约判据。",
  tags: ["Gauss 引理", "本原多项式", "有理根定理", "Eisenstein"],
  intro:
    "有理系数看起来增加了分母，Gauss 引理却说明真正的分解结构可以转移到整数系数。先清分母，再提出所有系数的最大公因数，剩下的本原部分承载可约性；有理根与 Eisenstein 则提供两种方向不同的有限检验。",
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
      "清分母只乘上一个非零有理常数，提内容只拿走一个单位意义上的常数，它们都不改变非常数因式结构。Gauss 引理保证本原因式在相乘后仍保持本原，从而让 Q[x] 与 Z[x] 的可约性准确对接。",
    equation: "f=c\\,f^*,\\qquad f^*\\in\\mathbb Z[x],\\quad\\operatorname{cont}(f^*)=1",
    map: [
      { label: "清分母", text: "乘系数分母的最小公倍数，得到整系数多项式。" },
      { label: "提内容", text: "提出系数 gcd，留下本原部分 f*。" },
      { label: "筛有理根", text: "由首项和常数项的因数生成既约候选，再逐一精确代入。" },
      { label: "找不可约证书", text: "选择素数检查 Eisenstein 三条件；通过即可结束。" },
    ],
    bridge: {
      title: "三个工作台对应同一条判定流水线",
      text: "本原化面板先给出唯一的整数代表；候选筛选器在这个代表上枚举 p/q；素数透镜再逐项展示 Eisenstein 的逻辑方向。每一步都保留精确整数或有理数。",
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
      { title: "判据失败的含义", text: "某个素数未通过三条件，只能说明这一张证书没有签发。可以换素数、作变量平移，或使用其他分解方法。" },
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
    description: "先把有理系数多项式规范化，再生成有理根候选，并按素数检查 Eisenstein 三条件。",
    task: "规范化一个分数系数多项式；验证 2x³+x²−x−1 的全部候选；最后用 p=5 判定 x⁵+10x+5。",
    guide: [
      ["规范化", "读取公分母、整数内容和本原部分。"],
      ["筛候选", "由常数项与首项列出约分后的 ±p/q。"],
      ["找证书", "逐门检查 Eisenstein，并尊重判据的单向逻辑。"],
    ],
    takeaway: "Gauss 引理把 Q[x] 分解转到本原整数系数；有理根负责筛选，Eisenstein 负责签发不可约证书。",
    prompts: [
      "比较原多项式与本原部分的非常数因式。",
      "逐个点击候选，读取精确 Horner 值。",
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
