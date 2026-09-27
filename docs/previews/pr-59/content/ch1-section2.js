defineChapter1Section("univariate-polynomials", {
  number: "§2",
  textbookSection: "一元多项式",
  title: "一元多项式",
  navTitle: "一元多项式",
  question: "一个多项式究竟是函数图像、形式表达式，还是一串有位置的系数？为什么中间的零系数不能随意删掉？",
  goal: `正确读写 ${texInline("F[x]")} 中的一元多项式；掌握相等、加法、数乘、乘法与次数性质；把多项式理解为幂基下的有限系数序列。`,
  tags: ["形式多项式", "系数带", "次数", "卷积"],
  intro:
    "本节先把多项式当作形式对象，而不是先把它当作一条曲线。幂次就是系数的位置标签：内部零系数必须保留，尾部零系数可以规范化删除。运算发生在系数层；图像只负责帮助观察，不负责定义多项式。",
  concepts: [
    { label: "形式", text: `${texInline("f(x)=a_0+a_1x+\\cdots+a_nx^n")}，其中 ${texInline("a_i\\in F")}，只有有限多个系数非零。` },
    { label: "相等", text: "两个多项式相等，当且仅当每个次数位置的对应系数都相等。" },
    { label: "次数", text: "非零多项式的次数是最高非零系数的下标；零多项式单独处理。" },
    { label: "加法与数乘", text: "同次系数对齐相加；标量同时乘到每个系数。" },
    { label: "乘法", text: `${texInline("[x^k](fg)=\\sum_{i+j=k}a_i b_j")}，即所有指数和为 ${texInline("k")} 的配对汇入同一位置。` },
    { label: "次数公式", text: `${texInline("\\deg(fg)=\\deg f+\\deg g")}（两者非零）；${texInline("\\deg(f+g)\\le\\max\\{\\deg f,\\deg g\\}")}。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章 §2",
    items: ["一元多项式及其相等", "多项式加法、数乘与乘法", "次数与首项", "多项式运算律"],
  },
  formal: {
    title: "把公式还原成系数结构",
    intro:
      "多项式的核心信息不是字写得多漂亮，而是每个幂次位置上的系数。把 f(x) 放到幂基 1,x,x²,… 下，就得到一条有限系数带。加法是位置对齐，乘法是指数相加后的配对汇总；次数规律来自最高非零位置及其首项系数。",
    equation: "f(x)=a_0+a_1x+\\cdots+a_nx^n\\quad\\longleftrightarrow\\quad[a_0,a_1,\\ldots,a_n]",
    map: [
      { label: "系数位置", text: "a_i 永远属于 x^i；中间的 0 仍占据次数位置。" },
      { label: "形式相等", text: "逐位置比较系数，不根据图像相似或书写顺序判断。" },
      { label: "加法", text: "同次格相加；最高次可能抵消，因此次数可能下降。" },
      { label: "乘法", text: "a_i 与 b_j 的乘积进入 i+j 格；同一格收集全部来源。" },
    ],
    definitions: [
      {
        title: "系数带与规范化",
        text: `${texInline("2-x+3x^3")} 对应 ${texInline("[2,-1,0,3]")}。中间 0 不能删；末尾连续的 0 不改变形式，可规范化去掉。`,
      },
      {
        title: "零多项式",
        text: "所有系数都为 0 的对象是零多项式。它没有普通整数次数；涉及次数公式时要把零多项式单独分支。",
      },
      {
        title: "为什么乘法像卷积",
        text: `${texInline("a_ix^i\\cdot b_jx^j=a_i b_jx^{i+j}")}。固定结果次数 ${texInline("k")} 后，要把所有满足 ${texInline("i+j=k")} 的配对相加。`,
      },
      {
        title: "次数的两个结论",
        text: `非零乘积的首项系数是两边首项系数之积，所以 ${texInline("\\deg(fg)=\\deg f+\\deg g")}；加法可能发生首项抵消，只能保证不超过较大次数。`,
      },
      {
        title: "运算律",
        text: `${texInline("F[x]")} 中加法与乘法满足交换律、结合律和分配律；常数多项式把数域 ${texInline("F")} 嵌入到 ${texInline("F[x]")}。`,
      },
    ],
    cards: [
      { kicker: "读写", title: "先补齐缺项", text: "把多项式写成系数带前，先为缺失幂次补 0，避免所有后续位置错位。" },
      { kicker: "抵消", title: "加法次数不一定保留", text: "两个最高次项互为相反数时，和的次数会跳到下一个非零位置。" },
      { kicker: "指定项", title: "不要只乘同位置", text: "求乘积 x^k 系数时，列出整条 i+j=k 对角线，而不是只看 a_kb_k。" },
    ],
    pitfalls: [
      "把 [2,−1,0,3] 写成 [2,−1,3]，导致 3 从 x³ 项错位到 x² 项。",
      "认为两个三次多项式的和一定还是三次。",
      "把多项式乘法误当作对应位置相乘。",
      "给零多项式强行指定次数 0。",
    ],
    note: "下一节把乘法结构转向整除：给定 f 与非零 g，怎样唯一地分出商 q 与次数更低的余式 r。",
  },
  interactive: {
    type: "slot",
    title: "实验：系数带工作台",
    description: "编辑两个多项式，切换加法、数乘与乘法；系数带、公式、次数、指定项贡献和固定相机图像同步更新。",
    task: "先制造首项抵消，再在乘法模式中选择不同结果次数，查看完整配对；最后输入分数系数，验证精确计算。",
    prompts: [
      "把某个中间系数设为 0，确认位置仍然保留。",
      "使用“首项抵消”预设，观察和的次数从 3 降低。",
      "切到乘法并改变 k，逐项核对所有 i+j=k 的贡献。",
      "把全部系数置零，确认零多项式没有普通次数。",
    ],
  },
  example: {
    title: "例题：系数带、抵消与指定项",
    question: `设 ${texInline("f(x)=2-x+3x^3")}，${texInline("g(x)=-2+x+x^2-3x^3")}。写出系数带，计算 ${texInline("f+g")}；求 ${texInline("fg")} 的 ${texInline("x^3")} 系数，并判断 ${texInline("\\deg(fg)")}。`,
    choices: [
      {
        correct: true,
        text: `${texInline("f=[2,-1,0,3]")}，${texInline("g=[-2,1,1,-3]")}；${texInline("f+g=x^2")}；${texInline("[x^3](fg)=-13")}；${texInline("\\deg(fg)=6")}。`,
      },
      { text: `${texInline("f+g")} 仍为三次，因为两个加数都是三次。` },
      { text: `${texInline("[x^3](fg)=3\\cdot(-3)=-9")}，只需乘两个三次项系数。` },
      { text: `${texInline("f=[2,-1,3]")}，中间的零系数可以直接删除。` },
    ],
    steps: [
      `${texInline("f=[2,-1,0,3]")}，${texInline("g=[-2,1,1,-3]")}；缺失的 ${texInline("x^2")} 项用 0 占位。`,
      "对应位置相加得 [0,0,1,0]，尾部 0 规范化后为 x²。",
      `${texInline("x^3")} 系数来自 ${texInline("a_0b_3+a_1b_2+a_2b_1+a_3b_0")}。`,
      `代入系数：${texInline("2(-3)+(-1)(1)+0(1)+3(-2)=-13")}。`,
      "f、g 都非零且次数均为 3，所以乘积次数为 3+3=6。",
    ],
  },
  quiz: [
    { question: `${texInline("[1,0,2]")} 表示哪个多项式？`, answer: `${texInline("1+2x^2")}。` },
    { question: "两个多项式何时相等？", answer: "所有同次位置的对应系数分别相等。" },
    { question: "零多项式的次数怎样处理？", answer: "单独处理，不把它赋成普通非负整数。" },
    { question: `${texInline("\\deg(f+g)")} 何时可能小于两者较大次数？`, answer: "最高次项发生抵消时。" },
    { question: `${texInline("[x^4](fg)")} 要收集哪些配对？`, answer: `${texInline("a_0b_4+a_1b_3+a_2b_2+a_3b_1+a_4b_0")}。` },
    { question: "两个非零多项式乘积的次数是什么？", answer: `${texInline("\\deg(fg)=\\deg f+\\deg g")}。` },
    { question: "多项式图像相同是否足以说明形式相等？", answer: "在本章的无限数域上最终可以推出相等，但形式定义仍以系数逐项相等为准；该联系在 §7 说明。" },
  ],
  summary: [
    "一元多项式是幂基下有位置的有限系数序列。",
    "内部零系数保留位置；零多项式的次数单独处理。",
    "加法按同次对齐，乘法按指数和聚合全部配对。",
    "非零乘积次数相加；和的次数可能因首项抵消而下降。",
    "下一节用首项消去把任意 f 分解成 qg+r。",
  ],
  exercises: [
    `把 ${texInline("3-2x^2+x^5")} 写成系数带，并指出首项和次数。`,
    `求 ${texInline("(1+x+x^2)(1-x+x^3)")} 的 ${texInline("x^3")} 与 ${texInline("x^4")} 系数。`,
    "构造两个四次多项式，使它们的和只有一次。",
  ],
});
