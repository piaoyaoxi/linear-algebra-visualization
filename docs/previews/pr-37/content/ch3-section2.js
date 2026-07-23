defineChapter3Section("n-vector-space", {
  number: "§2",
  textbookSection: "n维向量空间",
  title: "n维向量空间",
  navTitle: "n维向量空间",
  question: "方程组中的 n 个未知量为什么可以被当作一个对象？当 n 大于 3、无法直接画出来时，我们凭什么仍能准确运算？",
  goal: `把有序数组理解为数域 ${texInline(String.raw`F`)} 上的向量空间 ${texInline(String.raw`F^n`)} 中的向量；掌握分量加法、数乘、线性组合与标准基分解；区分向量本身、坐标表示和二维投影。`,
  tags: ["Fⁿ", "有序坐标", "标准基", "线性组合", "高维投影"],
  intro:
    "向量的本质不是一支必须画出来的箭头，而是一个可以相加、可以数乘、并且坐标顺序固定的对象。二维和三维图像帮助直观，高维则依靠坐标、基与运算规则完整保存信息。",
  videoPlan: {
    title: "从未知量列到 Fⁿ",
    duration: "约 2 分钟",
    scenes: [
      "把方程组中的未知量列整体框出，记作 x。",
      "二维箭头、三维箭头与 n 维坐标条使用同一套加法和数乘规则。",
      "标准基逐个点亮，坐标成为各基向量的系数。",
      "高维对象只投影到前两坐标，明确投影不等于完整向量。",
    ],
  },
  concepts: [
    {
      label: "有序数组",
      text: `${texInline(String.raw`x=(x_1,\ldots,x_n)^T`)} 的坐标顺序不可交换；它是 ${texInline(String.raw`F^n`)} 中的一个向量。`,
    },
    {
      label: "向量运算",
      text: `${texInline(String.raw`u+v`)} 按对应分量相加，${texInline(String.raw`\lambda u`)} 把每个分量同时乘以 ${texInline(String.raw`\lambda`)}；运算结果仍在 ${texInline(String.raw`F^n`)} 中。`,
    },
    {
      label: "线性组合",
      text: `${texInline(String.raw`\alpha u+\beta v`)} 先分别缩放，再逐分量相加。后续的张成、相关与方程组都建立在这一操作上。`,
    },
    {
      label: "标准基",
      text: `${texInline(String.raw`e_i`)} 只有第 i 个坐标为 1；任意向量唯一写成 ${texInline(String.raw`x=x_1e_1+\cdots+x_ne_n`)}。`,
    },
    {
      label: "坐标与投影",
      text: "坐标列完整记录向量；二维画布在 n>2 时只显示前两个坐标的投影，不能据此判断整个高维向量是否相等或相关。",
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第三章 §2",
    page: "",
    items: ["n 维向量", "向量加法与数乘", "零向量与负向量", "标准基", "线性组合与坐标表示"],
  },
  interactive: {
    type: "slot",
    title: "实验：用完整坐标计算线性组合",
    description: "选择维数，调节两个向量及系数 α、β；坐标列、标准基分解、分量条与二维投影同步显示线性组合。",
    task: "把维数调到 4，令 α=2、β=−1，只改变第三个坐标，观察完整坐标变化而二维投影保持不变。",
    prompts: [
      "在 n=2 时比较 u、v 与 αu+βv 的箭头。",
      "升到 n=4 后只改变第三、第四坐标，确认投影无法看到全部变化。",
      "把 u 取负，检查每一个分量是否同时变号。",
      "将 α、β 都设为 0，确认任何 u、v 都组合成零向量。",
    ],
  },
  example: {
    title: "例题：在线性组合中读坐标",
    question: `设 ${texInline(String.raw`u=(1,-1,2,0)^T`)}，${texInline(String.raw`v=(2,1,0,3)^T`)}。计算 ${texInline(String.raw`2u-v`)}，写成标准基分解，并说明仅看前两坐标投影会遗漏什么。`,
    choices: [
      {
        correct: true,
        text: `${texInline(String.raw`2u-v=(0,-3,4,-3)^T=-3e_2+4e_3-3e_4`)}；前两坐标投影只显示 ${texInline(String.raw`(0,-3)`)}。`,
      },
      { text: `${texInline(String.raw`2u-v=(-1,-1,2,-3)^T`)}，因为只需计算非零坐标。` },
      { text: "四维向量不可见，所以线性组合没有几何或代数意义。" },
      { text: "标准基分解不唯一，可以任意更换系数。" },
    ],
    steps: [
      `先算 ${texInline(String.raw`2u=(2,-2,4,0)^T`)}。`,
      `逐分量减去 v，得到 ${texInline(String.raw`(0,-3,4,-3)^T`)}。`,
      `因此 ${texInline(String.raw`2u-v=0e_1-3e_2+4e_3-3e_4`)}。`,
      "零系数项可以省略，但它仍说明第一坐标为 0。",
      "前两坐标投影无法显示第三、第四分量，因此只适合辅助观察。",
    ],
  },
  quiz: [
    { question: `${texInline(String.raw`F^n`)} 中的 n 表示什么？`, answer: "每个向量拥有的有序坐标个数，也就是标准基向量的个数。" },
    { question: "两个向量何时相等？", answer: "它们属于同一 Fⁿ，并且每个对应坐标都相等。" },
    { question: "为什么向量加法必须逐分量对应？", answer: "每个坐标都对应固定的基方向；错位相加会改变坐标所指的方向。" },
    { question: "标准基分解为什么唯一？", answer: "标准基线性无关；若两种系数表示同一向量，相减后只能得到全零系数。" },
    { question: "二维投影相同能否推出两个四维向量相同？", answer: "不能；它们的第三、第四坐标仍可能不同。" },
    { question: `${texInline(String.raw`\alpha u+\beta v`)} 中 α、β 都为 0 时结果是什么？`, answer: "零向量，与 u、v 的具体取值无关。" },
  ],
  summary: [
    "Fⁿ 用有序坐标完整保存高维向量。",
    "向量加法、数乘和线性组合都按固定坐标规则进行。",
    "标准基把坐标解释为各基本方向的系数；投影只显示部分信息。",
    "下一节研究一组向量中是否存在冗余，也就是线性相关性。",
  ],
  exercises: [
    "在 R⁵ 中构造两个前两坐标相同但并不相等的向量。",
    "选取 u、v 与 α、β，分别用坐标计算和标准基展开验证同一个线性组合。",
  ],
});
