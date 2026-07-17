defineChapter2Section("cramer-rule", {
  number: "§7",
  textbookSection: "克拉默（Cramer）法则",
  title: "克拉默（Cramer）法则",
  navTitle: "克拉默法则",
  question: "为什么把系数矩阵的第 i 列换成常数列后，两个行列式的比值恰好给出第 i 个未知量？",
  goal: `在 ${texInline("\\det(A)\\ne0")} 的前提下构造替换矩阵 ${texInline("A_i")}，理解 ${texInline("x_i=\\det(A_i)/\\det(A)")} 的列线性推导与二维面积比，并正确处理 ${texInline("\\det(A)=0")} 的边界。`,
  tags: ["克拉默法则", "替换列", "唯一解"],
  intro:
    `方程 ${texInline("Ax=b")} 表示常数向量 b 是 A 的列向量的线性组合。当 ${texInline("\\det(A)\\ne0")} 时，这组列向量构成一组基，坐标唯一。把第 i 列替换成 b 后，行列式的分别线性会自动留下系数 ${texInline("x_i")}。`,
  videoPlan: {
    title: "克拉默法则为什么是有向体积比",
    duration: "约 2 分钟",
    scenes: [
      "把 b 写成 A 的列向量线性组合。",
      "在第 i 列放入 b，并用该列的线性展开。",
      "含重复列的项消失，只留下 xi det(A)。",
      "展示 det(A)=0 时基底塌缩，比例公式失去分母。",
    ],
  },
  concepts: [
    { label: "前提", text: `${texInline("A")} 为 n 阶方阵且 ${texInline("\\det(A)\\ne0")}。` },
    { label: "替换矩阵", text: `${texInline("A_i")} 由把 ${texInline("A")} 的第 i 列替换成 ${texInline("b")} 得到。` },
    { label: "公式", text: `${texInline("x_i=\\dfrac{\\det(A_i)}{\\det(A)}")}。` },
    { label: "推导核心", text: "第 i 列对 b 的线性展开中，除 xi 对应项外，其余项都含重复列而为零。" },
    { label: "二维解释", text: "替换列后的有向面积与原基底面积之比给出对应坐标。" },
    { label: "奇异边界", text: `${texInline("\\det(A)=0")} 时公式不可用；方程组可能无解，也可能有无穷多解。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第二章 §7",
    page: "",
    items: ["克拉默法则", "证明", "齐次方程组推论", "适用边界"],
  },
  interactive: {
    type: "slot",
    title: "实验：替换列与克拉默步进",
    description: "调节系数列与 b，实时比较 D、D1、D2，并在 D=0 时判断无解或无穷多解。",
    task: "先求解示例方程组，再把两列拖成共线，分别构造相容与不相容的 b。",
    prompts: [
      "确认 D 非零，再读取 D1/D 与 D2/D。",
      "观察 b 怎样由两列向量线性组合得到。",
      "切换 D=0 且相容的预设，确认出现无穷多解。",
      "切换 D=0 且不相容的预设，确认出现无解。",
    ],
  },
  example: {
    title: "例题：二元克拉默法则",
    question: `解方程组 ${texInline("2x+y=5")}，${texInline("x+3y=5")}。`,
    choices: [
      { correct: true, text: `${texInline("D=5,D_1=10,D_2=5")}，所以 ${texInline("x=2,y=1")}。` },
      { text: `${texInline("x=1,y=2")}。` },
      { text: `${texInline("D=0")}，克拉默法则不可用。` },
      { text: "出现行列式就说明方程组无解。" },
    ],
    steps: [
      `系数矩阵 ${texInline("A=\\begin{bmatrix}2&1\\\\1&3\\end{bmatrix}")}，${texInline("D=6-1=5")}。`,
      `替换第 1 列：${texInline("D_1=\\det\\begin{bmatrix}5&1\\\\5&3\\end{bmatrix}=10")}，所以 ${texInline("x=2")}。`,
      `替换第 2 列：${texInline("D_2=\\det\\begin{bmatrix}2&5\\\\1&5\\end{bmatrix}=5")}，所以 ${texInline("y=1")}。`,
      "回代两个方程，均成立。",
    ],
  },
  quiz: [
    { question: "克拉默法则的必要前提是什么？", answer: "系数矩阵为方阵且行列式非零。" },
    { question: "A2 怎样构造？", answer: "把 A 的第 2 列替换成 b，其余列保持不变。" },
    { question: "D=0 是否必然无解？", answer: "不必然，也可能有无穷多解。" },
    { question: "齐次方程 Ax=0 在 det(A)≠0 时有几个解？", answer: "只有零解。" },
    { question: "克拉默法则为什么适合理论说明却不常用于大规模数值计算？", answer: "它需要计算多个高阶行列式，成本和数值稳定性都不如消元法。" },
  ],
  summary: [
    "det(A) 非零时，A 的列构成基，方程组有唯一坐标。",
    "替换第 i 列并取行列式之比得到 xi。",
    "D=0 时应回到秩或消元判断无解与无穷多解。",
    "下一节把单行展开推广到子式，并研究复合变换的行列式。",
  ],
  exercises: [
    "对一个 3×3 方程组写出 A1、A2、A3 的结构。",
    "分别构造 D=0 且无解、D=0 且有无穷多解的二元方程组。",
  ],
});
