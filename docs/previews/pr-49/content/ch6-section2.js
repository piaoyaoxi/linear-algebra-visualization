defineChapter6Section("vector-space-definition", {
  number: "§2",
  textbookSection: "线性空间的定义与简单性质",
  title: "线性空间的定义与简单性质",
  navTitle: "线性空间定义",
  question: "几何箭头、多项式、矩阵和函数外表完全不同，为什么可以用同一套线性代数研究它们？数域和运算在定义中承担什么作用？",
  goal: "把线性空间理解为集合、数域、加法和数乘组成的结构；按加法与数乘兼容性组织八条公理；从公理推出零元、逆元和数乘的基本性质，并用明确反例检验候选结构。",
  tags: ["数域与运算", "八条公理", "函数空间", "性质推导"],
  prerequisites: ["理解映射是定义域、陪域与规则的整体。", "会对向量、多项式和函数做通常的加法与数乘。"],
  objectives: [
    "说明同一个集合配上不同数域或运算会得到不同结构。",
    "把八条公理分为加法结构与数乘兼容两组。",
    "从公理证明 0v=0、a0=0 与 (-1)v=-v。",
  ],
  intro:
    "向量空间把“能够做线性组合”提炼成一套公理。元素可以是箭头、矩阵、函数或多项式；决定结构的是所选数域以及加法、数乘怎样作用。公理确保不同计算路径得到一致结果。",
  concepts: [
    { label: "四项数据", text: "集合 V、数域 F、加法 V×V→V、数乘 F×V→V。" },
    { label: "加法结构", text: "交换、结合、零元与加法逆元。" },
    { label: "数乘兼容", text: "单位标量、结合律与两条分配律。" },
    { label: "推导性质", text: texInline("0v=0,\\ a0=0,\\ (-1)v=-v") + " 都由公理推出。" },
  ],
  textbook: {
    reference: "Axler · Friedberg · Hoffman–Kunze",
    items: ["运算是结构的一部分", "向量空间公理", "函数与多项式空间", "由公理推出简单性质"],
  },
  story: {
    title: "线性空间：保留线性组合，放下元素的外形",
    lead:
      "Friedberg 从几何向量的平行四边形法则出发，Axler 与 Hoffman–Kunze 随即把同一规则推广到函数、多项式和矩阵。抽象的价值在于：一次证明可以同时服务所有这些对象。",
    modules: [
      {
        number: "01",
        title: "元素的外形可以改变，线性组合的规则保持一致",
        subtitle: "“向量”是空间中的元素名称，不限定它必须画成箭头。",
        blocks: [
          {
            type: "cards",
            items: [
              { kicker: "坐标向量", title: texInline("\\mathbb{R}^n"), text: "分量逐项相加并统一数乘。" },
              { kicker: "多项式", title: texInline("P_2"), text: "系数逐项相加；数乘同时缩放全部系数。" },
              { kicker: "矩阵", title: texInline("M_{m\\times n}(F)"), text: "对应位置相加；数乘作用于每个元素。" },
              { kicker: "函数", title: texInline("F^S"), text: "在每个输入 s 处定义 (f+g)(s)=f(s)+g(s)。" },
            ],
          },
          {
            type: "note",
            title: "抽象带来的节省",
            text: "只要证明依赖向量空间公理，结论就自动适用于坐标向量、函数、多项式和矩阵，无需为每类对象重新证明。",
          },
        ],
      },
      {
        number: "02",
        title: "数域与运算属于空间的完整数据",
        subtitle: "集合相同并不保证得到同一个线性空间。",
        blocks: [
          {
            type: "formula",
            kicker: "四项数据",
            formula: texDisplay("V,\\qquad F,\\qquad +:V\\times V\\to V,\\qquad \\cdot:F\\times V\\to V"),
            text: "加法和数乘首先必须定义良好：任意允许的输入都要得到 V 中唯一的输出。",
          },
          {
            type: "definitions",
            items: [
              { kicker: "同一集合 ℂ", title: "以 ℝ 为数域", text: "只允许实数数乘；1 与 i 提供两个独立的实方向。" },
              { kicker: "同一集合 ℂ", title: "以 ℂ 为数域", text: "允许复数数乘；任意复数都是 1 的复数倍。" },
              { kicker: "受限集合", title: "RGB 立方体 [0,1]³", text: "通常加法与实数数乘会越过边界，因此封闭性失败。" },
            ],
          },
        ],
      },
      {
        number: "03",
        title: "八条公理可以读成 4 + 4",
        subtitle: "前四条管理加法，后四条保证数乘与加法、数域相容。",
        blocks: [
          {
            type: "definitions",
            items: [
              { kicker: "加法 1", title: texInline("u+v=v+u"), text: "交换次序不改变结果。" },
              { kicker: "加法 2", title: texInline("(u+v)+w=u+(v+w)"), text: "连续相加可以改变括号。" },
              { kicker: "加法 3–4", title: texInline("u+0=u,\\ u+(-u)=0"), text: "存在唯一零向量与每个向量的相反向量。" },
              { kicker: "数乘 1–2", title: texInline("1u=u,\\ (ab)u=a(bu)"), text: "单位标量与连续数乘遵守数域乘法。" },
              { kicker: "数乘 3", title: texInline("a(u+v)=au+av"), text: "数乘对向量加法分配。" },
              { kicker: "数乘 4", title: texInline("(a+b)u=au+bu"), text: "数乘对标量加法分配。" },
            ],
          },
          {
            type: "note",
            title: "公理的作用",
            text: "公理不负责描述长度、角度或距离。它们只保证有限线性组合可以稳定计算，并且常见代数变形合法。",
          },
        ],
      },
      {
        number: "04",
        title: "简单性质要从公理中推出来",
        subtitle: "推导会展示抽象公理怎样转化为熟悉的计算规则。",
        blocks: [
          {
            type: "proof",
            items: [
              { title: "证明 0v=0", text: texInline("0v=(0+0)v=0v+0v") + "，在加法两边消去 0v，得到 0v=0。" },
              { title: "证明 a0=0", text: texInline("a0=a(0+0)=a0+a0") + "，同样使用加法消去律得到 a0=0。" },
              { title: "证明 (-1)v=-v", text: texInline("(-1)v+v=(-1+1)v=0v=0") + "，所以 (-1)v 是 v 的加法逆元。" },
              { title: "零乘积结论", text: "若 av=0 且 a≠0，乘以 a⁻¹ 可得 v=0；因此 av=0 推出 a=0 或 v=0。" },
            ],
          },
        ],
      },
      {
        number: "05",
        title: "判断候选结构时，先寻找最短反例",
        subtitle: "一条失败的公理足以否定；全部成立需要覆盖任意元素与任意标量。",
        blocks: [
          {
            type: "misconception",
            title: "高频边界",
            items: [
              "含零向量只是必要检查，第一象限仍会在乘以 −1 时离开集合。",
              "有限次试验通过只能提供猜想，证明必须处理任意向量和任意标量。",
              "定义新的运算后，零向量和相反向量也要按新运算重新寻找。",
            ],
          },
          {
            type: "note",
            title: "与 §5 的分工",
            text: "本节从零开始规定整个空间的结构；§5 会在一个已知向量空间内部，判断某个子集能否继承原来的运算。",
          },
        ],
      },
    ],
  },
  interactive: {
    type: "slot",
    title: "实验：线性空间体检",
    description: "从不同对象中寻找零向量、加法和数乘的最短反例。",
    task: "先预测每个候选集合最早在哪一道检查失败，再切换场景核对；通过的场景还要用一般式说明封闭性。",
    prompts: [
      "比较整个 ℝ² 与一条过原点直线，说明二者为何都能承受任意实数数乘。",
      "对不过原点直线先检查零向量，再看加法。",
      "对第一象限使用标量 −1，对 RGB 立方体使用放大标量 2。",
      "比较 P₂ 与常数项固定为 1 的多项式集合。",
    ],
  },
  example: {
    title: "例题：函数也可以成为向量",
    question:
      "设 " + texInline("V=\\{f:\\mathbb{R}\\to\\mathbb{R}\\}") + "，加法与数乘逐点定义。再令 " + texInline("S=\\{f\\in V:f(0)=1\\}") + "。判断 V 与 S 在这些运算下是否为实线性空间，并给出关键理由。",
    choices: [
      { correct: true, text: "V 是实线性空间；S 不含零函数，且对加法和一般数乘不封闭。" },
      { text: "V 不是线性空间，因为函数没有固定数量的坐标。" },
      { text: "S 是线性空间，因为条件 f(0)=1 是一个方程。" },
      { text: "V 与 S 都是线性空间，只要能写出加法和数乘即可。" },
    ],
    steps: [
      "对 f,g∈V，逐点定义 (f+g)(x)=f(x)+g(x)、(af)(x)=af(x)，结果仍是 ℝ 到 ℝ 的函数。",
      "实数的运算律在每个 x 处成立，因此函数加法与数乘满足八条公理；零向量是零函数。",
      "零函数在 x=0 处取值 0，所以不属于 S。",
      "若 f,g∈S，则 (f+g)(0)=2；若 a≠1，则 (af)(0)=a。两种运算都可能离开 S。",
    ],
    audit: { kind: "evaluation-constraint", rhs: 1, zeroValue: 0, sumValue: 2, scale: 2, scaledValue: 2 },
  },
  quiz: [
    { question: "一套线性空间必须明确给出哪四项数据？", answer: "集合 V、数域 F、V 上的加法以及 F 对 V 的数乘。" },
    { question: "为什么同一个集合 ℂ 可以形成不同的线性空间结构？", answer: "可以选择 ℝ 或 ℂ 作为数域；允许的标量不同，线性组合和后续维数也会改变。" },
    { question: "0v=0 是公理吗？怎样推出？", answer: "它是推论。由 0v=(0+0)v=0v+0v，再使用加法消去律得到。" },
    { question: "第一象限含零且对加法封闭，为什么仍然失败？", answer: "它对任意实数数乘不封闭；非零向量乘以 −1 会进入第三象限。" },
    { question: "怎样证明全部实函数在逐点运算下满足分配律？", answer: "对任意 x，实数分配律给出 a(f+g)(x)=af(x)+ag(x)；两函数处处相等，因此分配律成立。" },
  ],
  summary: [
    "向量空间由集合、数域和两种运算共同构成。",
    "八条公理保证线性组合可以一致计算，并推出熟悉的零元与逆元性质。",
    "箭头、多项式、矩阵和函数都能成为向量；具体外形不进入公理。",
  ],
  bridge: "下一节研究有限个向量怎样生成整个空间，以及怎样删除冗余并得到唯一坐标。",
  exercises: ["验证所有 2×2 实矩阵在通常运算下构成线性空间。", "找出单位圆盘在实数数乘下的一个反例。"],
});
