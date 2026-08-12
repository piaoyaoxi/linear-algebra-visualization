defineChapter1Section("number-fields", {
  number: "§1",
  textbookSection: "数域",
  title: "数域",
  navTitle: "数域",
  question: "为什么研究多项式之前，必须先说明系数来自哪个数域？同一个表达式换一个数域后，哪些结论会改变？",
  goal: `掌握数域的四则封闭性；识别 ${texInline("\\mathbb{Q}")}、${texInline("\\mathbb{R}")}、${texInline("\\mathbb{C}")} 与 ${texInline("\\mathbb{Q}(\\sqrt2)")}；理解系数域会改变系数合法性、根与不可约性。`,
  tags: ["数域", "封闭性", "系数域", "反例"],
  intro:
    "多项式不是悬在空中的公式。它的每个系数都属于一个预先指定的数域，后面的整除、最大公因式和因式分解也都在这个数域中进行。本节用“四则运算门”和系数域切换，把集合包含、运算封闭与分解结论分开看清。",
  concepts: [
    { label: "数域", text: `复数域 ${texInline("\\mathbb{C}")} 的子集，对加、减、乘以及非零元素的除法封闭。` },
    { label: "典型数域", text: `${texInline("\\mathbb{Q}")}、${texInline("\\mathbb{R}")}、${texInline("\\mathbb{C}")} 与 ${texInline("\\mathbb{Q}(\\sqrt2)=\\{a+b\\sqrt2:a,b\\in\\mathbb{Q}\\}")}。` },
    { label: "典型反例", text: `${texInline("\\mathbb{Z}")} 对除法不封闭；正实数集不含 0，也没有加法逆元。` },
    { label: "系数域", text: `写 ${texInline("F[x]")} 时，所有系数都必须属于 ${texInline("F")}，所有因式分解也限定在 ${texInline("F")} 内。` },
    { label: "不可约性依赖域", text: `${texInline("x^2-2")} 在 ${texInline("\\mathbb{Q}[x]")} 中不可约，在 ${texInline("\\mathbb{R}[x]")} 中可分解。` },
    { label: "包含不等于封闭", text: "一个集合包含很多数，并不自动意味着四则运算的结果仍留在集合中。" },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章 §1",
    items: ["数域的定义", "常见数域与反例", "数域上的多项式环记号", "系数域对根与分解的影响"],
  },
  formal: {
    title: "先把系数的舞台搭好",
    intro:
      "数域不是按“数字多少”划分的等级，而是一套允许稳定做四则运算的舞台。检验一个集合时，要逐门检查运算封闭；讨论一个多项式时，要先确定它属于哪个 F[x]。同一个形式换一个系数域，系数是否合法、根是否存在、因式是否还能继续拆，都可能改变。",
    equation: "\\mathbb{Q}\\subset\\mathbb{Q}(\\sqrt2)\\subset\\mathbb{R}\\subset\\mathbb{C}",
    map: [
      { label: "加减乘", text: "任取两个元素，运算结果仍在集合内。" },
      { label: "非零除法", text: "任取非零元素，它的倒数仍在集合内；这是最容易失败的一门。" },
      { label: "系数合法", text: "多项式的每个系数都要通过当前数域的成员检查。" },
      { label: "分解边界", text: "因式的系数也必须留在当前数域，所以不可约性会随域改变。" },
    ],
    definitions: [
      {
        title: "数域的判定顺序",
        text: `先确认 ${texInline("0,1")} 与加法逆元，再检查加、减、乘和非零除法。一个反例就足以否定封闭性，例如 ${texInline("1/2\\notin\\mathbb{Z}")}。`,
      },
      {
        title: "为什么 Q(√2) 仍是数域",
        text: `两个 ${texInline("a+b\\sqrt2")} 相乘后仍可整理成同一形式；若 ${texInline("a+b\\sqrt2\\ne0")}，则 ${texInline("\\dfrac1{a+b\\sqrt2}=\\dfrac{a-b\\sqrt2}{a^2-2b^2}")} 仍属于该集合。`,
      },
      {
        title: "P[x] 的含义",
        text: `${texInline("F[x]")} 表示系数来自数域 ${texInline("F")} 的一元多项式全体。${texInline("x^2-i")} 属于 ${texInline("\\mathbb{C}[x]")}；它不属于 ${texInline("\\mathbb{R}[x]")}。`,
      },
      {
        title: "换域以后什么会变",
        text: `${texInline("x^2+1")} 在 ${texInline("\\mathbb{R}[x]")} 中没有一次因式，在 ${texInline("\\mathbb{C}[x]")} 中分解为 ${texInline("(x-i)(x+i)")}。改变的是允许使用的系数，不是原公式的字面形状。`,
      },
    ],
    cards: [
      { kicker: "反例法", title: "一处失败就出局", text: "判断“不是数域”通常只需找一个运算反例，不必穷举所有元素。" },
      { kicker: "有理化", title: "求逆要回到同一形式", text: "Q(√2) 的关键不是含根号，而是有理化后仍能写成 a+b√2。" },
      { kicker: "后续主线", title: "不可约必须带上数域", text: "以后说“不可约”时，心里始终补全“在 F[x] 中不可约”。" },
    ],
    pitfalls: [
      "把整数集误认为数域：整数对除法不封闭。",
      "把正实数集误认为数域：它不含 0，也没有加法逆元。",
      "只看根是否在集合中，却忘记先检查多项式系数是否合法。",
    ],
    note: `本节的主线是“先定 ${texInline("F")}，再研究 ${texInline("F[x]")}”。下一节把多项式本身建成幂基下的有限系数序列。`,
  },
  interactive: {
    type: "slot",
    title: "实验：数域透镜",
    description: "切换集合，逐门检查封闭性；再用同一组多项式比较系数合法性与可分解性。",
    task: "先找出 Z 和正实数集失败的运算门，再验证 Q(√2) 的乘法与求逆；最后比较 x²−2、x²+1 在不同域中的分解状态。",
    prompts: [
      "选择整数集，定位第一个失败的运算门并读出反例。",
      "选择 Q(√2)，展开两个一般元素的乘积和一个非零元素的逆。",
      "切换 Q、R、C，区分“系数合法”与“在当前域中可分解”。",
      "观察包含链只表达集合包含，不表达数字大小。",
    ],
  },
  example: {
    title: "例题：判断集合并说明最短理由",
    question: `判断下列集合是否为数域：${texInline("\\mathbb{Z}")}；${texInline("\\mathbb{Q}")}；${texInline("\\{a+b\\sqrt2:a,b\\in\\mathbb{Q}\\}")}；正实数集。`,
    choices: [
      {
        correct: true,
        text: `${texInline("\\mathbb{Z}")} 否（除法不封闭）；${texInline("\\mathbb{Q}")} 是；${texInline("\\mathbb{Q}(\\sqrt2)")} 是；正实数集否（缺 0 与加法逆元）。`,
      },
      { text: "四个集合都是数域，因为都可以进行乘法和除法。" },
      { text: `${texInline("\\mathbb{Q}")} 不是数域，因为它不含 ${texInline("\\sqrt2")}。` },
      { text: "正实数集是数域，因为正数相除仍为正数。" },
    ],
    steps: [
      "先检查 0、1 和加法逆元；正实数集在这一步已经失败。",
      `${texInline("\\mathbb{Z}")} 虽对加、减、乘封闭，但 ${texInline("1/2\\notin\\mathbb{Z}")}。`,
      `${texInline("\\mathbb{Q}")} 的四则运算（分母非零）仍给出有理数。`,
      `${texInline("\\mathbb{Q}(\\sqrt2)")} 的乘法与有理化求逆都回到 ${texInline("a+b\\sqrt2")} 形式。`,
      "所以只有有理数集与 Q(√2) 通过全部运算门。",
    ],
  },
  quiz: [
    { question: "数域定义中的除法为什么要排除 0？", answer: "0 没有乘法逆元，除以 0 没有定义。" },
    { question: `${texInline("\\mathbb{Z}")} 为什么不是数域？`, answer: `${texInline("1/2\\notin\\mathbb{Z}")}，所以非零除法不封闭。` },
    { question: `${texInline("\\mathbb{Q}(\\sqrt2)")} 的一般元素是什么？`, answer: `${texInline("a+b\\sqrt2")}，其中 ${texInline("a,b\\in\\mathbb{Q}")}。` },
    { question: `${texInline("x^2-\\sqrt2")} 属于 ${texInline("\\mathbb{Q}[x]")} 吗？`, answer: "不属于，因为系数 −√2 不是有理数。" },
    { question: `${texInline("x^2-2")} 在 Q[x] 与 R[x] 中的不可约性相同吗？`, answer: "不同；在 Q[x] 中不可约，在 R[x] 中可分解为两个一次因式。" },
    { question: "集合 A 包含集合 B，能否推出 A 是数域？", answer: "不能；数域需要逐项验证运算封闭性。" },
    { question: "正实数集在哪两个最基本条件上失败？", answer: "不含 0，也不含任意元素的加法逆元。" },
  ],
  summary: [
    "数域是允许稳定进行加、减、乘和非零除法的系数舞台。",
    "判断反例时抓住缺失的单位元、逆元或某个不封闭运算。",
    "写 F[x] 同时限制多项式系数和允许出现的因式系数。",
    "不可约性、根和最终分解会随系数域改变。",
    "下一节把多项式从“公式外观”还原成有位置的系数对象。",
  ],
  exercises: [
    `证明 ${texInline("\\mathbb{Q}(\\sqrt2)")} 对乘法和非零除法封闭。`,
    `判断 ${texInline("\\{a+bi:a,b\\in\\mathbb{Q}\\}")} 是否为数域。`,
    `分别在 ${texInline("\\mathbb{Q}[x]")}、${texInline("\\mathbb{R}[x]")} 中讨论 ${texInline("x^2-3")} 的可约性。`,
  ],
});
