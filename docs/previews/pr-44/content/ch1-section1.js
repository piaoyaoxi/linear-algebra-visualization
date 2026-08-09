defineChapter1Section("number-fields", {
  number: "§1",
  textbookSection: "数域",
  title: "数域：先规定允许的运算",
  navTitle: "数域",
  question: "多项式的系数可以取哪些数？换一个系数域以后，同一个多项式的根与分解为什么会改变？",
  goal: `会用封闭性判定数域，能证明 ${texInline("\\mathbb Q(\\sqrt2)")} 是数域，并在讨论系数、根和不可约性时始终写清所在的域。`,
  tags: ["数域", "封闭性", "系数域", "反例"],
  intro:
    "后续每一次相除、求最大公因式和因式分解，都要在一套固定的系数规则中完成。数域正是这套规则：加减乘除的结果仍能留在集合里。先把运算舞台说清楚，后面的“整除”和“不可约”才有确定含义。",
  concepts: [
    { label: "数域", text: `含至少两个元素的 ${texInline("\\mathbb C")} 的子集，并且对加、减、乘和非零除法封闭。` },
    { label: "子域检验", text: `对 ${texInline("a,b\\in F")} 检查 ${texInline("a-b\\in F")}；对 ${texInline("b\\ne0")} 再检查 ${texInline("a/b\\in F")}。` },
    { label: "系数域", text: `${texInline("F[x]")} 同时限制多项式的系数和分解中允许出现的因式系数。` },
    { label: "相对不可约", text: `${texInline("x^2-2")} 在 ${texInline("\\mathbb Q[x]")} 中不可约，在 ${texInline("\\mathbb R[x]")} 中分解为两个一次因式。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章 §1",
    items: ["数域的定义", "典型数域与反例", "扩域示例", "系数域对分解的影响"],
  },
  formal: {
    title: "数域是一套封闭的运算规则",
    intro:
      "判断数域的高效方法是寻找结构证据。要证明“是”，需说明运算始终回到集合；要证明“否”，一个最短反例已经足够。集合包含链只表示允许使用的数越来越多，也因此可能让原先不可约的多项式继续分裂。",
    equation: "\\mathbb Q\\subset\\mathbb Q(\\sqrt2)\\subset\\mathbb R\\subset\\mathbb C",
    map: [
      { label: "先看集合", text: "集合至少有两个元素，因而零元与单位元可以被区分。" },
      { label: "再看运算", text: "减法包含加法和相反数；非零除法包含乘法逆元。" },
      { label: "写明 F[x]", text: "系数、商、余式和因式全都要留在 F 内。" },
      { label: "换域比较", text: "扩域可能增加根和因式，原表达式本身保持不变。" },
    ],
    bridge: {
      title: "实验里的四道门就是数域定义",
      text: "集合通过每一道门，意味着任取元素都不会被相应运算送出集合。右侧多项式表再把这件事推进一步：系数合法与可分解性是两个先后发生的判断。",
    },
    theorem: {
      label: "子域判别",
      title: "减法与非零除法足以完成检验",
      statement: `设 ${texInline("F\\subset\\mathbb C")} 至少含两个元素。若任意 ${texInline("a,b\\in F")} 都有 ${texInline("a-b\\in F")}，并且在 ${texInline("b\\ne0")} 时有 ${texInline("a/b\\in F")}，那么 ${texInline("F")} 是数域。`,
    },
    proof: {
      title: "验证 Q(√2) 的关键只在求逆",
      intro: `取 ${texInline("u=a+b\\sqrt2")} 与 ${texInline("v=c+d\\sqrt2")}；加减和乘法可直接合并系数。`,
      steps: [
        { title: "乘法仍有同一形状", text: `${texInline("uv=(ac+2bd)+(ad+bc)\\sqrt2")}，两项系数仍为有理数。` },
        { title: "用共轭有理化", text: `若 ${texInline("u\\ne0")}，则 ${texInline("u^{-1}=\\dfrac{a-b\\sqrt2}{a^2-2b^2}")}。` },
        { title: "分母不会为零", text: `若 ${texInline("a^2-2b^2=0")} 且 ${texInline("b\\ne0")}，便得到有理数 ${texInline("a/b=\\sqrt2")}，矛盾；${texInline("b=0")} 时由 ${texInline("u\\ne0")} 也知分母非零。` },
        { title: "求逆回到集合", text: "分子仍是有理数与 √2 的有理线性组合，分母是非零有理数，所以逆元仍属于 Q(√2)。" },
      ],
    },
    definitions: [
      { title: "反例怎样选", text: `整数集只需用 ${texInline("1/2\\notin\\mathbb Z")} 否定；正实数集只需指出 ${texInline("1-2=-1")} 离开集合。一个失败已经否定“对任意元素封闭”。` },
      { title: "F[x] 的完整含义", text: `${texInline("x^2-i\\in\\mathbb C[x]")}，但它不属于 ${texInline("\\mathbb R[x]")}。只有先通过系数检查，才有资格在当前域里讨论它的分解。` },
    ],
    boundary: {
      title: "含有 √2，并不自动含有 √√2",
      text: `${texInline("x^2-\\sqrt2")} 的系数属于 ${texInline("\\mathbb Q(\\sqrt2)")}；它在该域中仍不可约。若 ${texInline("(a+b\\sqrt2)^2=\\sqrt2")}，比较有理部分与 √2 部分得 ${texInline("a^2+2b^2=0,\\ 2ab=1")}，有理数 a、b 无法同时满足。`,
    },
    pitfalls: [
      "集合很大并不能代替封闭性检验。",
      "多项式含有哪些系数，与它在当前域中能否分解，需要分两步判断。",
      "每个不可约结论都带着一个隐含的“在 F[x] 中”。",
    ],
    note: `先定 ${texInline("F")}，再研究 ${texInline("F[x]")}。下一节把 ${texInline("F[x]")} 中的对象精确建成有限系数序列。`,
  },
  interactive: {
    type: "slot",
    title: "实验：数域透镜",
    description: "切换候选集合，先检查运算封闭，再比较多项式的系数合法性与分解状态。",
    task: "用一个最短反例淘汰 ℤ 和正实数集；验证 Q(√2) 的求逆；最后追踪同一多项式随 Q、R、C 扩大怎样继续分裂。",
    guide: [
      ["判集合", "逐门检查零与单位、加法逆元、乘法和非零求逆。"],
      ["判系数", "先确认表达式属于当前 F[x]。"],
      ["判分解", "只允许使用当前域中的因式系数。"],
    ],
    takeaway: "数域规定合法运算；不可约性和根必须连同系数域一起陈述。",
    prompts: [
      "在整数集中找到非零除法失败的反例。",
      "展开 Q(√2) 的乘法与求逆公式。",
      "比较 x²−2、x²−√2、x²+1 在不同域中的状态。",
    ],
  },
  example: {
    title: "判断集合，并给出最短理由",
    question: `判断 ${texInline("\\mathbb Z")}、${texInline("\\mathbb Q")}、${texInline("\\mathbb Q(\\sqrt2)")} 与正实数集是否为数域。`,
    choices: [
      { correct: true, text: `只有 ${texInline("\\mathbb Q")} 与 ${texInline("\\mathbb Q(\\sqrt2)")} 是数域；前者四则封闭，后者可用共轭完成求逆。` },
      { text: "四个集合都能做乘法，所以都是数域。" },
      { text: `${texInline("\\mathbb Q")} 不含 ${texInline("\\sqrt2")}，所以不是数域。` },
      { text: "正实数相除仍为正数，所以正实数集是数域。" },
    ],
    steps: [
      `${texInline("1/2\\notin\\mathbb Z")}，所以整数集对非零除法不封闭。`,
      "有理数的四则运算在分母非零时仍是有理数。",
      `对 ${texInline("\\mathbb Q(\\sqrt2)")} 使用乘法展开和共轭有理化，结果仍写成 ${texInline("a+b\\sqrt2")}。`,
      "正实数集不含 0 和加法逆元；例如 1−2 离开集合。",
    ],
  },
  quiz: [
    { question: "为什么数域中的除法要注明除数非零？", answer: "零没有乘法逆元。" },
    { question: `${texInline("x^2-\\sqrt2")} 属于哪个最小的本节常见多项式环？`, answer: `${texInline("\\mathbb Q(\\sqrt2)[x]")}。` },
    { question: `${texInline("x^2-2")} 在 Q[x] 与 R[x] 中的不可约性相同吗？`, answer: "不同；它在 Q[x] 不可约，在 R[x] 分解为 (x−√2)(x+√2)。" },
    { question: "否定一个集合为数域需要检查完所有元素吗？", answer: "不需要；找到一个违反封闭性的反例就够了。" },
  ],
  summary: [
    "数域是对加、减、乘和非零除法封闭的系数舞台。",
    "F[x] 同时限制系数、商余式与因式的系数。",
    "扩域可能增加根与因式，因此不可约性依赖所在的域。",
  ],
  exercises: [
    `证明 ${texInline("\\{a+bi:a,b\\in\\mathbb Q\\}")} 是数域。`,
    `判断 ${texInline("\\mathbb Q(\\sqrt2+\\sqrt3)")} 是否包含 ${texInline("\\sqrt2")} 与 ${texInline("\\sqrt3")}。`,
    `分别在 ${texInline("\\mathbb Q[x]")} 与 ${texInline("\\mathbb R[x]")} 中讨论 ${texInline("x^2-3")} 的可约性。`,
  ],
});
