defineChapter1Section("polynomial-divisibility", {
  number: "§3",
  textbookSection: "整除的概念",
  title: "带余除法：用首项把次数压下去",
  navTitle: "整除与带余除法",
  question: "为什么长除法的下一项商没有选择余地？商和余式又为什么只能有一组？",
  goal: `理解 ${texInline("g\\mid f")}、带余除法和商余式唯一性；能用首项消去完成精确长除法，并用最终余式判断整除。`,
  tags: ["整除", "带余除法", "首项消去", "唯一性"],
  intro:
    "多项式除法的发动机是次数。当前最高项若要消失，商的下一项必须等于当前首项除以除式首项；乘回并相减后，次数严格下降。这个局部动作反复执行，最终得到一个次数低于除式的余式。",
  concepts: [
    { label: "整除", text: `${texInline("g\\mid f")} 表示存在 ${texInline("q\\in F[x]")} 使 ${texInline("f=qg")}。` },
    { label: "带余除法", text: `${texInline("f=qg+r")}，其中 ${texInline("r=0")} 或 ${texInline("\\deg r<\\deg g")}。` },
    { label: "单位与相伴", text: `${texInline("F[x]")} 的单位是非零常数；相差一个单位因子的多项式互为相伴。` },
    { label: "整除判定", text: `${texInline("g\\mid f")} 当且仅当带余除法的最终余式为 0。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章 §3",
    items: ["整除及基本性质", "带余除法定理", "商余式唯一性", "单位与相伴"],
  },
  formal: {
    title: "带余除法把整除变成一个有限算法",
    intro:
      "长除法每一步同时维护等式 f=qg+r。新商项加入 q，乘回的部分从 r 中减去；两处改动彼此抵消，所以等式始终成立。真正推进算法的是 r 的次数下降。",
    equation: "f(x)=q(x)g(x)+r(x),\\qquad r=0\\;\\text{或}\\;\\deg r<\\deg g",
    map: [
      { label: "比较首项", text: "当前余式首项除以 g 的首项，得到唯一的新商项。" },
      { label: "乘回对齐", text: "把新商项乘 g，按相同幂次写在当前余式下方。" },
      { label: "相减降次", text: "最高项消失，更新 f=qg+r 中的 q 与 r。" },
      { label: "读出结论", text: "r=0 表示整除；deg r<deg g 且 r≠0 表示不整除。" },
    ],
    bridge: {
      title: "动画中的每一帧都保持 f=qg+r",
      text: "商上方出现一项时，下方同步减去这一项乘 g。纵向对齐解释了为何只能消去同次项；右侧不变量则让每一步都能直接代回核验。",
    },
    theorem: {
      label: "除法定理",
      title: "商与低次余式存在且唯一",
      statement: `给定 ${texInline("f,g\\in F[x]")} 且 ${texInline("g\\ne0")}，存在唯一的 ${texInline("q,r\\in F[x]")} 使 ${texInline("f=qg+r")} 且 ${texInline("r=0")} 或 ${texInline("\\deg r<\\deg g")}。`,
    },
    proof: {
      title: "存在性靠降次，唯一性靠次数矛盾",
      steps: [
        { title: "达到停止条件", text: `若 ${texInline("f=0")} 或 ${texInline("\\deg f<\\deg g")}，取 ${texInline("q=0,r=f")} 即可。` },
        { title: "消去当前首项", text: `若当前余式首项为 ${texInline("ax^m")}，g 的首项为 ${texInline("bx^n")}，加入商项 ${texInline("(a/b)x^{m-n}")}。数域保证 ${texInline("a/b")} 合法。` },
        { title: "有限步终止", text: "相减后最高项消失，非零余式的次数严格下降；非负整数次数无法无限下降。" },
        { title: "排除两组答案", text: `若 ${texInline("q_1g+r_1=q_2g+r_2")} 且两余式都低于 g，则 ${texInline("(q_1-q_2)g=r_2-r_1")}。商差非零时左边次数至少为 deg g，右边却低于 deg g，矛盾。` },
      ],
    },
    definitions: [
      { title: "单位", text: `非零常数 ${texInline("c")} 的逆 ${texInline("c^{-1}")} 仍在 F 中，所以它是 ${texInline("F[x]")} 的单位。正次数多项式没有多项式逆。` },
      { title: "相伴", text: `${texInline("f")} 与 ${texInline("cf")}（${texInline("c\\ne0")}）彼此整除。以后最大公因式和不可约因式都要通过“首一化”消除这个常数倍歧义。` },
      { title: "线性组合", text: `若 ${texInline("d\\mid f")} 且 ${texInline("d\\mid g")}，则 ${texInline("d\\mid uf+vg")}。这个简单事实会在下一节生成 Bézout 等式。` },
    ],
    boundary: {
      title: "系数在数域中，首项才总能相除",
      text: `在 ${texInline("\\mathbb Z[x]")} 中用 2 去除 x，商的首项需要 ${texInline("\\frac12x")}，已经离开整数系数多项式环。因此本节的除法定理依赖 ${texInline("F")} 是数域。除式 ${texInline("g=0")} 也必须排除。`,
    },
    pitfalls: [
      "缺项未补 0 会破坏同次项对齐。",
      "余式次数已经低于除式时，算法已经完成。",
      "整除要求余式精确为 0。",
    ],
    note: "带余除法提供“替换成更低次数余式”的操作。下一节反复使用它，同时保持公共因式不变。",
  },
  interactive: {
    type: "slot",
    title: "实验：标准多项式长除法",
    description: "逐步显示商项、乘回项、纵向相减与新余式，并始终保留 f=qg+r。",
    task: "先预测每一步的新商项，再播放消去；比较整除、非整除与分数系数三个示例。",
    guide: [
      ["看首项", "用当前余式首项除以 g 的首项。"],
      ["乘回相减", "在同次项下方对齐，检查最高项恰好消失。"],
      ["检查停止", "读取余式是否为 0，或次数是否已低于 g。"],
    ],
    takeaway: "除法算法靠次数下降推进，f=qg+r 在每一步保持不变。",
    prompts: [
      "点击下一步前先写出你预测的新商项。",
      "每轮核对被消去的最高幂次。",
      "到终点后用 qg+r 展开还原 f。",
    ],
  },
  example: {
    title: "完成一次带余除法",
    question: `求 ${texInline("x^4-1")} 除以 ${texInline("x^2+x+1")} 的商和余式，并判断整除关系。`,
    choices: [
      { correct: true, text: `商为 ${texInline("x^2-x")}，余式为 ${texInline("x-1")}，所以不整除。` },
      { text: `商为 ${texInline("x^2+1")}，余式为 0。` },
      { text: `商为 ${texInline("x^2-x")}，余式为 0。` },
      { text: "只要 qg+r=f，商余式可以有很多组。" },
    ],
    steps: [
      `${texInline("x^4/x^2=x^2")}，减去 ${texInline("x^2(x^2+x+1)")}。`,
      `当前余式为 ${texInline("-x^3-x^2-1")}；其首项给出下一商项 ${texInline("-x")}。`,
      `减去 ${texInline("-x(x^2+x+1)")} 后得到 ${texInline("x-1")}。`,
      `因为 ${texInline("1=\\deg(x-1)<2=\\deg(x^2+x+1)")}，算法停止。`,
    ],
  },
  quiz: [
    { question: `${texInline("g\\mid f")} 的定义是什么？`, answer: `存在 ${texInline("q\\in F[x]")} 使 ${texInline("f=qg")}。` },
    { question: "长除法的下一商项怎样确定？", answer: "当前余式的首项除以除式的首项。" },
    { question: "算法为什么一定停止？", answer: "每个非终止步骤都让非零余式次数严格下降。" },
    { question: "F[x] 的单位有哪些？", answer: "所有非零常数多项式。" },
  ],
  summary: [
    "任意 f 对非零 g 都有唯一分解 f=qg+r，且余式次数低于 g。",
    "首项消去决定商项，次数下降保证终止。",
    "最终余式为 0 与 g 整除 f 完全等价。",
  ],
  exercises: [
    `计算 ${texInline("x^5+1")} 除以 ${texInline("x^2+1")} 的商与余式。`,
    `判断 ${texInline("x^2-x+1")} 是否整除 ${texInline("x^6+1")}。`,
    "证明整除关系具有传递性。",
  ],
});
