defineChapter1Section("number-fields", {
  number: "§1",
  textbookSection: "数域",
  title: "数域",
  navTitle: "数域",
  question: "为什么多项式的系数必须先指定来自哪个数域？同一个表达式换一个数域后，哪些结论会改变？",
  goal: `掌握数域对加、减、乘、非零除法封闭；识别 ${texInline("\\mathbb{Q}")}、${texInline("\\mathbb{R}")}、${texInline("\\mathbb{C}")} 与 ${texInline("\\mathbb{Q}(\\sqrt2)")}；理解系数域会改变根与不可约性。`,
  tags: ["四则封闭", "系数域", "不可约性"],
  intro:
    "系数域不是写在题目前面的装饰。它先规定哪些系数可以出现，再决定哪些根可以使用、哪些因式分解被允许。本节先把“集合包含”和“运算封闭”分开，再用同一个多项式在不同数域中的命运说明为什么必须先写清系数域。",
  concepts: [
    { label: "数域", text: `教材中的数域是 ${texInline("\\mathbb{C}")} 的子域：含 ${texInline("0,1")}，对加、减、乘和非零除法封闭。` },
    { label: "典型反例", text: `${texInline("\\mathbb{Z}")} 对除法不封闭；正实数集不含 0，也没有加法逆元。` },
    { label: "二次扩张", text: `${texInline("\\mathbb{Q}(\\sqrt2)=\\{a+b\\sqrt2\\mid a,b\\in\\mathbb{Q}\\}")}，四则运算后仍保持同一形式。` },
    { label: "系数合法", text: `${texInline("f\\in F[x]")} 要求每个系数都属于 ${texInline("F")}；一个不合法系数就会让整个表达式离开 ${texInline("F[x]")}。` },
    { label: "分解依赖域", text: `${texInline("x^2-2")} 在 ${texInline("\\mathbb{Q}[x]")} 中不可约，在 ${texInline("\\mathbb{R}[x]")} 中分解；${texInline("x^2+1")} 在 ${texInline("\\mathbb{C}[x]")} 中继续分裂。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章",
    items: ["数域的定义", "常见数域与反例", "系数域对根与分解的影响"],
  },
  interactive: {
    type: "slot",
    title: "实验：数域透镜",
    description: "切换候选集合，逐门检查四则封闭；再看多项式的系数是否合法、因式分解能否继续。",
    task: "先让整数集在除法门失败，再验证 Q(√2) 的乘法与求逆仍回到 a+b√2 的形式。",
    prompts: [
      "选择 ℤ，找出一个使非零除法离开集合的反例。",
      "选择 ℚ(√2)，查看两个一般元素相乘后的系数。",
      "检查含 √2 或 i 的系数在当前数域是否合法。",
      "比较 x²−2 与 x²+1 在 ℚ、ℝ、ℂ 中的分解终点。",
    ],
  },
  example: {
    title: "例题：用封闭性判断数域",
    question: `判断下列集合是否为数域，并给出最短的决定性理由：${texInline("\\mathbb{Z}")}、${texInline("\\mathbb{Q}")}、${texInline("\\mathbb{Q}(\\sqrt2)")}、正实数集。`,
    choices: [
      { correct: true, text: `${texInline("\\mathbb{Z}")} 否（非零除法不封闭）；${texInline("\\mathbb{Q}")} 是；${texInline("\\mathbb{Q}(\\sqrt2)")} 是；正实数集否（不含 0 且无加法逆元）。` },
      { text: "四个集合都能进行加减乘除，所以都是数域。" },
      { text: `只有 ${texInline("\\mathbb{R}")} 和 ${texInline("\\mathbb{C}")} 足够大，其他集合都不是数域。` },
      { text: "正实数对乘除封闭，因此已经满足数域定义。" },
    ],
    steps: [
      "先查 0、1 与加法逆元；缺一项即可否定。",
      `${texInline("\\mathbb{Z}")} 中 ${texInline("1/2\\notin\\mathbb{Z}")}，故非零除法不封闭。`,
      `${texInline("\\mathbb{Q}")} 的四则运算仍得到有理数。`,
      `对 ${texInline("u=a+b\\sqrt2")}、${texInline("v=c+d\\sqrt2")}，乘积仍为 ${texInline("(ac+2bd)+(ad+bc)\\sqrt2")}。`,
      `若 ${texInline("u\\ne0")}，则 ${texInline("u^{-1}=\\frac{a-b\\sqrt2}{a^2-2b^2}\\in\\mathbb{Q}(\\sqrt2)")}；因此它是数域。`,
      "正实数集不含 0，也不含任意元素的加法逆元，故不是数域。",
    ],
  },
  quiz: [
    { question: "数域定义中的除法为什么要排除 0？", answer: "0 没有乘法逆元；要求对每个非零元素的除法封闭。" },
    { question: `${texInline("\\mathbb{Z}")} 最快在哪一门失败？`, answer: `非零除法，例如 ${texInline("1/2\\notin\\mathbb{Z}")}。` },
    { question: `${texInline("\\mathbb{Q}(\\sqrt2)")} 的一般元素是什么形式？`, answer: `${texInline("a+b\\sqrt2")}，其中 ${texInline("a,b\\in\\mathbb{Q}")}。` },
    { question: `含系数 ${texInline("i")} 的多项式属于 ${texInline("\\mathbb{R}[x]")} 吗？`, answer: `不属于；它属于 ${texInline("\\mathbb{C}[x]")}。` },
    { question: `${texInline("x^2-2")} 在 ${texInline("\\mathbb{Q}[x]")} 与 ${texInline("\\mathbb{R}[x]")} 中的不可约性相同吗？`, answer: "不同；扩大系数域后可使用 ±√2 作为根。" },
    { question: "集合 A 包含于一个数域，能否直接推出 A 也是数域？", answer: "不能；还要逐项检查 A 自身对四则运算是否封闭。" },
  ],
  misconceptions: [
    "“集合越大越像数域”不是判定标准；封闭性是运算条件。",
    "系数属于某数域与多项式的根属于该数域是两件不同的事。",
  ],
  summary: [
    "数域是对四则运算封闭的复数子域，除法只对非零元要求。",
    "判断失败通常只需一个决定性反例。",
    "写 f∈F[x] 时，F 同时限制系数、根和允许的分解。",
    "下一节把多项式本身建立成有位置的有限系数对象。",
  ],
  exercises: [
    `证明 ${texInline("\\mathbb{Q}(\\sqrt2)")} 对非零除法封闭。`,
    `判断 ${texInline("\\{a+bi\\mid a,b\\in\\mathbb{Q}\\}")} 是否为数域。`,
  ],
});