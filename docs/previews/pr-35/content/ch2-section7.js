defineChapter2Section("cramer-rule", {
  number: "§7",
  textbookSection: "克拉默（Cramer）法则",
  title: "克拉默（Cramer）法则",
  navTitle: "克拉默法则",
  question: "为什么第 i 个未知量可以写成“把第 i 列换成常数列后两个行列式的比值”？",
  goal: `在 ${texInline("\det(A)\ne 0")} 时会构造 ${texInline("A_i")} 并计算 ${texInline("x_i=\det(A_i)/\det(A)")}；理解二维面积比与 ${texInline("\det(A)=0")} 边界。`,
  tags: ["克拉默法则", "替换列", "唯一解"],
  intro:
    "当系数矩阵可逆时，Ax=b 有唯一解。克拉默法则把每个未知量写成行列式之比：分子是把对应列替换为 b 后的行列式。它揭示解的结构，但不是大规模数值计算的首选算法。",
  videoPlan: {
    title: "克拉默法则为什么是体积比",
    duration: "约 2 分钟",
    scenes: [
      "把 b 写成列的线性组合。",
      "用分别线性消掉重复列。",
      "得到 x_i 的行列式比。",
      "展示 det=0 时公式失效。",
    ],
  },
  concepts: [
    { label: "前提", text: `${texInline("A")} 为方阵且 ${texInline("\\det(A)\\ne 0")}。` },
    { label: "替换矩阵", text: `${texInline("A_i")} 由把 ${texInline("A")} 的第 i 列换成 ${texInline("b")} 得到。` },
    { label: "公式", text: `${texInline("x_i=\\det(A_i)/\\det(A)")}。` },
    { label: "二维解释", text: "有向面积比给出坐标。" },
    { label: "边界", text: `${texInline("\\det(A)=0")} 时不能使用公式；需另判无解或无穷多解。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第二章",
    page: "",
    items: ["克拉默法则的条件", "公式与证明思路", "齐次方程组推论", "方法的适用范围"],
  },
  interactive: {
    type: "slot",
    title: "实验：替换列与克拉默步进",
    description: `构造 ${texInline("A_i")}，比较面积比，并在 ${texInline("\det(A)=0")} 时观察分支。`,
    task: "对给定 2×2 方程组求出 x1,x2，并用面积比解释 x1。",
    prompts: [
      "确认 det(A)≠0。",
      "构造 A1、A2 并计算 D1、D2。",
      "得到 x_i=D_i/D 并回代。",
      "把两列拖到共线，观察公式禁用与无解/多解分支。",
    ],
  },
  example: {
    title: "例题：二元克拉默法则",
    question: `解方程组 ${texInline("2x+y=5")}，${texInline("x+3y=5")}。`,
    choices: [
      { correct: true, text: `${texInline("D=5")}，${texInline("D_1=10")}，${texInline("D_2=5")}，故 ${texInline("x=2,y=1")}。` },
      { text: `${texInline("x=1,y=2")}` },
      { text: "因为出现行列式，所以无解。" },
      { text: "D=0，不能用克拉默法则。" },
    ],
    steps: [
      `${texInline("A=\\begin{bmatrix}2&1\\\\1&3\\end{bmatrix}")}，${texInline("D=6-1=5")}。`,
      `${texInline("A_1=\\begin{bmatrix}5&1\\\\5&3\\end{bmatrix}")}，${texInline("D_1=15-5=10")}，${texInline("x=2")}。`,
      `${texInline("A_2=\\begin{bmatrix}2&5\\\\1&5\\end{bmatrix}")}，${texInline("D_2=10-5=5")}，${texInline("y=1")}。`,
      "回代：2·2+1=5，2+3·1=5。",
    ],
  },
  quiz: [
    { question: "克拉默法则的前提是什么？", answer: "方阵系数矩阵且行列式非零。" },
    { question: "A_2 怎样得到？", answer: "把 A 的第 2 列换成常数列 b。" },
    { question: "det(A)=0 是否一定无解？", answer: "不一定；可能无解或无穷多解。" },
    { question: "齐次方程 Ax=0 在 det(A)≠0 时解是什么？", answer: "只有零解。" },
  ],
  summary: [
    "唯一解时，每个未知量是两个行列式之比。",
    "替换的是列而不是行。",
    "det=0 时公式失效，需回到消元判断。",
    "下一节推广展开，并证明 det(AB)=det(A)det(B)。",
  ],
  exercises: [
    `对一个 3×3 方程组写出全部 ${texInline("A_i")}。`,
    "举一个 det=0 且有无穷多解的例子。",
  ],
});
