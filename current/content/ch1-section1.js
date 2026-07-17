defineChapter1Section("number-fields", {
  number: "§1",
  textbookSection: "数域",
  title: "数域",
  navTitle: "数域",
  question: "为什么多项式的系数必须先指定来自哪个数域？同一个表达式换一个数域后，哪些结论会改变？",
  goal: `掌握数域对加、减、乘、除非零元素封闭；识别 ${texInline("\\mathbb{Q}")}、${texInline("\\mathbb{R}")}、${texInline("\\mathbb{C}")} 与 ${texInline("\\mathbb{Q}(\\sqrt{2})")}；理解系数域会改变根与不可约性。`,
  tags: ["数域", "封闭性", "系数域"],
  intro:
    "多项式的系数不是任意数字的集合。教材把数域定义为复数域的子域，并对四则运算（除法只对非零元）封闭。本节先用对照看清“集合包含”与“运算封闭”的差别，再为后面的分解埋下线索。",
  concepts: [
    { label: "数域", text: `复数域 ${texInline("\\mathbb{C}")} 的子域：含 0、1，对加、减、乘、非零除法封闭。` },
    { label: "常见例子", text: `${texInline("\\mathbb{Q}")}、${texInline("\\mathbb{R}")}、${texInline("\\mathbb{C}")} 以及 ${texInline("\\mathbb{Q}(\\sqrt{2})")}=\\{a+b\\sqrt{2}\\mid a,b\\in\\mathbb{Q}\\}。` },
    { label: "反例", text: `${texInline("\\mathbb{Z}")} 不是数域：${texInline("2\\div 3\\notin\\mathbb{Z}")}。正实数集也不是：缺少 0 与加法逆元。` },
    { label: "系数域", text: `同一形式在不同数域中，合法系数、是否有根、是否可约都可能改变。` },
    { label: "包含关系", text: `${texInline("\\mathbb{Q}\\subset\\mathbb{Q}(\\sqrt{2})\\subset\\mathbb{R}\\subset\\mathbb{C}")}；图示只建立扩张直觉，不列尽所有子域。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章",
    page: "",
    items: ["数域的定义", "常见数域与反例", "系数域对后续分解的影响"],
  },
  interactive: {
    type: "slot",
    title: "实验：数域透镜",
    description: "切换集合，检查四则运算门是否全部通过，并看系数合法性。",
    task: "先确认 Z 在除法下失败；再比较 Q(√2) 的乘法与求逆仍留在集合内。",
    prompts: [
      "选择整数集，观察除法门亮红并给出反例。",
      "选择有理数、实数、复数，确认四门全绿。",
      "切换到 Q(√2)，看元素形式与求逆。",
      "检查系数带在 Q 与 R 上的合法性。",
    ],
  },
  example: {
    title: "例题：判断下列集合是否为数域",
    question: `判断并给出最短理由：<br>1. 整数集 ${texInline("\\mathbb{Z}")}；<br>2. 有理数集 ${texInline("\\mathbb{Q}")}；<br>3. ${texInline("\\{a+b\\sqrt{2}\\mid a,b\\in\\mathbb{Q}\\}")}；<br>4. 正实数集。`,
    choices: [
      {
        correct: true,
        text: `${texInline("\\mathbb{Z}")} 否（除法不封闭）；${texInline("\\mathbb{Q}")} 是；${texInline("\\mathbb{Q}(\\sqrt{2})")} 是；正实数否（无 0 与负元）。`,
      },
      { text: "四个集合都是数域，因为都能做加减乘除。" },
      { text: `只有 ${texInline("\\mathbb{R}")} 与 ${texInline("\\mathbb{C}")} 是数域，有理数不够大。` },
      { text: `正实数是数域，因为乘法与除法都封闭。` },
    ],
    steps: [
      "先检查是否含 0、1，以及加法逆元。",
      `${texInline("\\mathbb{Z}")}：${texInline("1/2\\notin\\mathbb{Z}")}，除法不封闭。`,
      `${texInline("\\mathbb{Q}")}：四则在有理数内完成，是数域。`,
      `${texInline("\\mathbb{Q}(\\sqrt{2})")}：乘积与分母有理化后仍为 ${texInline("a+b\\sqrt{2}")} 形式。`,
      "正实数：不含 0，也没有加法逆元，故不是数域。",
    ],
  },
  quiz: [
    { question: "数域定义中，除法对哪些元素要求封闭？", answer: "对所有非零元素要求除法结果仍在集合内。" },
    { question: `${texInline("\\mathbb{Z}")} 为什么不是数域？`, answer: "对除法不封闭，例如 1÷2 不是整数。" },
    { question: `${texInline("\\mathbb{Q}(\\sqrt{2})")} 的一般元素长什么样？`, answer: `${texInline("a+b\\sqrt{2}")}，其中 ${texInline("a,b\\in\\mathbb{Q}")}。` },
    { question: "集合包含是否等于运算封闭？", answer: "不等于。更大的集合仍可能对某种运算不封闭；封闭性要单独检验。" },
    { question: `${texInline("x^2-2")} 在 ${texInline("\\mathbb{Q}[x]")} 与 ${texInline("\\mathbb{R}[x]")} 中不可约性是否相同？`, answer: "不同：在有理系数下不可约，在实系数下可分解。" },
    { question: `系数 ${texInline("i")} 的多项式属于 ${texInline("\\mathbb{R}[x]")} 吗？`, answer: `不属于；它属于 ${texInline("\\mathbb{C}[x]")}。` },
  ],
  summary: [
    "数域要求对加、减、乘、非零除法封闭。",
    "Z 与正实数是典型反例；Q、R、C、Q(√2) 是常用数域。",
    "系数域会改变“有没有根、能不能分解”的结论。",
    "下一节把多项式本身建立为有位置的系数对象。",
  ],
  exercises: [
    "证明 Q(√2) 对乘法封闭。",
    "再举一个不是数域的常见数集，并给出一个反例。",
  ],
});
