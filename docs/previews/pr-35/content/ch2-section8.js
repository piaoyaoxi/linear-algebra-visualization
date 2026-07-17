defineChapter2Section("laplace-and-product", {
  number: "§8",
  textbookSection: "拉普拉斯（Laplace）定理·行列式的乘法规则",
  title: "拉普拉斯（Laplace）定理·行列式的乘法规则",
  navTitle: "Laplace与乘法",
  question: "怎样把沿一行展开推广到多个行？为什么连续两个变换的行列式等于各自行列式的乘积？",
  goal: "理解 k 阶子式配对的 Laplace 展开；掌握 det(AB)=det(A)det(B) 及其几何与代数含义。",
  tags: ["Laplace", "子式", "乘法规则"],
  intro:
    "固定 k 行后，遍历所有 k 列组合，子式与互补子式带符号相乘再求和，得到原行列式；k=1 时退化为 §6。乘法规则则说明复合变换的有向体积倍率相乘，且 AB 与 BA 通常不同形，但行列式乘积相同。",
  videoPlan: {
    title: "连续变换的倍率为什么相乘",
    duration: "约 2 分钟",
    scenes: [
      "单位图形先经 B 再经 A。",
      "面积依次乘 det(B)、det(A)。",
      "对照 det(AB)。",
      "展示一正一负与含零因子的情形。",
    ],
  },
  concepts: [
    { label: "k 阶子式", text: "由选定的 k 行 k 列交叉元素构成的行列式。" },
    { label: "Laplace", text: "固定 k 行，对所有列组合把子式与代数余子式配对求和。" },
    { label: "退化", text: "k=1 时就是按一行展开。" },
    { label: "乘法规则", text: `${texInline("\\det(AB)=\\det(A)\\det(B)")}。` },
    { label: "推论", text: `${texInline("\\det(A^{-1})=1/\\det(A)")}（A 可逆时）；${texInline("\\det(A^m)=\\det(A)^m")}；相似矩阵行列式相同。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第二章",
    page: "",
    items: ["Laplace 定理", "行列式的乘法规则", "重要推论", "与复合变换的联系"],
  },
  interactive: {
    type: "slot",
    title: "实验：子式配对与两阶段体积",
    description: "在 4×4 中选择 2 行 2 列观察子式配对；比较 det(A)、det(B) 与 det(AB)。",
    task: "选择预设“镜像后再缩放”，验证乘积与复合倍率一致。",
    prompts: [
      "固定两行，浏览不同列组合的子式对。",
      "确认 k=1 时回到单行展开。",
      "在两阶段实验室中读 det(A)、det(B)、det(AB)。",
      "尝试含投影（det=0）的复合，观察最终塌缩。",
    ],
  },
  example: {
    title: "例题：乘法规则与推论",
    question: `已知 ${texInline("\\det(A)=-2")}，${texInline("\\det(B)=3")}。求 ${texInline("\\det(AB)")}、${texInline("\\det(BA)")}、${texInline("\\det(A^{-1})")}、${texInline("\\det(A^2B)")}。`,
    choices: [
      { correct: true, text: "det(AB)=det(BA)=−6；det(A^{-1})=-1/2；det(A^2 B)=12。" },
      { text: "det(AB)=1，因为要先归一化。" },
      { text: "det(AB)≠det(BA)，因为矩阵不可交换。" },
      { text: "A 有负行列式，所以不可逆，det(A^{-1}) 无定义。" },
    ],
    steps: [
      "乘法规则：det(AB)=(-2)·3=-6，同样 det(BA)=-6。",
      "A 可逆因为 det≠0，det(A^{-1})=1/det(A)=-1/2。",
      "det(A^2)=(-2)^2=4，再乘 det(B) 得 12。",
      "几何上：一次翻转（负号）与正缩放复合，总符号为负，倍率 6。",
    ],
  },
  quiz: [
    { question: "det(AB) 与 det(BA) 是否一定相等？", answer: "是的，它们都等于 det(A)det(B)。" },
    { question: "若 det(B)=0，det(AB) 是多少？", answer: "0。" },
    { question: "k=1 的 Laplace 定理对应哪一节？", answer: "§6 按一行（列）展开。" },
    { question: "相似矩阵的行列式有何关系？", answer: "相等：det(P^{-1}AP)=det(A)。" },
  ],
  summary: [
    "Laplace 把展开从一行推广到多行。",
    "乘法规则连接复合变换与行列式乘积。",
    "可逆、矩阵幂、相似等结论由此导出。",
    "全章完成：从有向面积到定义、性质、计算、应用与复合。",
  ],
  exercises: [
    "用乘法规则说明 det(A)=0 则 AB 与 BA 都奇异。",
    "在 4×4 中固定两行写出 Laplace 展开的项数 C(4,2)。",
  ],
});
