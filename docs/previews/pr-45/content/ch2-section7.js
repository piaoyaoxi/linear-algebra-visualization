defineChapter2Section("cramer-rule", {
  number: "§7",
  textbookSection: "克拉默（Cramer）法则",
  title: "克拉默（Cramer）法则",
  navTitle: "克拉默法则",
  question: "为什么把常数列 b 放进系数矩阵的第 i 列，所得行列式与原行列式之比恰好等于 xi？",
  goal: "从列向量线性组合和行列式的分别线性推导 Cramer 法则，用 D、D1、D2 的几何读数区分唯一解、无穷多解与无解，并说明法则的理论边界。",
  tags: ["替换列", "面积比", "奇异边界"],
  prerequisites: [
    "会把线性方程组写成列向量组合。",
    "掌握行列式的分别线性与两列相同为零。",
  ],
  objectives: [
    "由 b=x1C1+...+xnCn 推导 Di=xiD。",
    "在 D≠0 时正确使用 xi=Di/D。",
    "说明 D=0 时为何还需检查替换列行列式或列空间关系。",
  ],
  intro:
    "方程 Ax=b 表示 b 是 A 的列向量的线性组合。把第 i 列替换为 b 后，分别线性会展开出 n 项；除含 xi 的一项外，其余项都因出现重复列而归零。",
  concepts: [
    { label: "原行列式", text: `${texInline("D=\\det(A)")}。` },
    { label: "替换列", text: `${texInline("D_i=\\det(A_i)")}，其中 ${texInline("A_i")} 的第 i 列替换为 b。` },
    { label: "Cramer", text: `${texInline("D\\ne0")} 时 ${texInline("x_i=D_i/D")}。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第二章 §7 · Strang 第 5 章 · Lay 第 3 章",
    page: "",
    items: ["Cramer 法则", "唯一解条件", "齐次方程组"],
  },
  story: {
    title: "Cramer 法则由列线性自然推出",
    lead: "把 b 放进第 i 列，相当于把 b 的列组合展开。重复列自动消失，只留下 xi 乘原行列式。",
    modules: [
      {
        number: "01",
        title: "替换列公式怎样产生",
        subtitle: "一遍分别线性加一遍交替性就足够。",
        blocks: [
          {
            type: "proof",
            items: [
              `若 ${texInline("Ax=b")}，按列写成 ${texInline("b=x_1C_1+\\cdots+x_nC_n")}。`,
              `在 ${texInline("A_i")} 中把第 i 列替换为这组和，并对该列使用分别线性。`,
              `含 ${texInline("x_kC_k\;(k\\ne i)")} 的项同时拥有原来的第 k 列和替换进来的第 k 列，因此两列相同，行列式为 0。`,
              `唯一保留的项是 ${texInline("x_iC_i")}，于是 ${texInline("D_i=x_iD")}。`,
              `当 ${texInline("D\\ne0")} 时可以相除，得到 ${texInline("x_i=D_i/D")}。`,
            ],
          },
          {
            type: "formula",
            kicker: "Cramer 法则",
            formula: texDisplay("x_i=\\frac{D_i}{D}\\qquad(D\\ne0)"),
            text: "分母非零是法则成立的必要条件，也是系数列能够张成完整 n 维平行体的条件。",
          },
        ],
      },
      {
        number: "02",
        title: "二维面积比怎样读取坐标",
        subtitle: "替换一条生成边，面积只保留对应坐标分量。",
        blocks: [
          {
            type: "cards",
            columns: 2,
            items: [
              { kicker: "替换第一列", title: texInline("D_1=\\det(b,C_2)=x_1D"), text: "b 中沿 C₂ 的分量与原第二列重复，面积贡献归零，只留下 x₁C₁。" },
              { kicker: "替换第二列", title: texInline("D_2=\\det(C_1,b)=x_2D"), text: "同理，替换第二列后只留下 x₂ 对原有向面积的倍乘。" },
            ],
          },
          {
            type: "note",
            title: "图形读数",
            text: "D 是原基底平行四边形的有向面积；Di 是替换一条边后的有向面积。二者之比给出 b 在相应基向量方向上的坐标。",
          },
        ],
      },
      {
        number: "03",
        title: "D=0 只说明唯一解通道关闭",
        subtitle: "无解与无穷多解需要继续比较 b 是否落在列空间中。",
        blocks: [
          {
            type: "definitions",
            items: [
              { kicker: "D ≠ 0", title: "唯一解", text: "列向量张成完整空间，Cramer 比值给出唯一坐标。" },
              { kicker: "D = 0，b 在列空间", title: "有无穷多解", text: "生成方向不足，但 b 仍可由这些列组合得到；非零齐次解带来自由参数，因而存在无穷多组表示。" },
              { kicker: "D = 0，b 不在列空间", title: "无解", text: "现有列只能到达较低维子空间，无法组合出 b。" },
            ],
          },
          {
            type: "misconception",
            items: [
              `${texInline("D=0")} 不能单独区分无解与无穷多解。`,
              "接近 0 的 D 会放大行列式比值对数据扰动的敏感性；这是深入理解数值稳定性的入口。",
              "Cramer 法则具有清楚的理论价值；大规模数值求解通常使用消元或分解算法。",
            ],
          },
        ],
      },
    ],
  },
  interactive: {
    type: "slot",
    visualTitle: "Cramer 面积比 · 列空间与解的状态",
    description: "调整二维系数列和 b，同时观察 D、D1、D2、面积比以及唯一、敏感、无穷多或无解状态。",
    task: "先判断 D=0 能否直接分类，再依次切换唯一解、近奇异、无穷多解和无解四个状态，说明 b 与列空间的关系。",
    prediction: {
      question: `只知道 ${texInline("D=0")}，能否判断方程组是无解还是有无穷多解？`,
      options: [
        { label: "不能，还要看 b", correct: true, feedback: "D=0 只说明系数列相关；b 是否落在它们张成的子空间中决定无解或无穷多解。" },
        { label: "一定无解", feedback: "若 b 与系数列共线，仍能被表示，并会出现自由参数。" },
        { label: "一定无穷多解", feedback: "若 b 落在系数列张成的低维子空间之外，方程组没有解。" },
      ],
    },
    prompts: [
      "在 D≠0 状态核对 D1=x1D、D2=x2D。",
      "让两列接近共线，观察面积比对微小变化的敏感性。",
      "比较 D=0 的两种预设，指出 b 是否位于列空间。",
    ],
  },
  example: {
    title: "从列线性推导并计算一个二元系统",
    question: `用 Cramer 法则解 ${texInline("\\begin{cases}2x+y=5\\\\x+3y=5\\end{cases}")}；同时用 ${texInline("b=xC_1+yC_2")} 解释两个替换列行列式为何分别等于 xD、yD。`,
    steps: [
      `系数矩阵 ${texInline("A=\\begin{bmatrix}2&1\\\\1&3\\end{bmatrix}")} 的行列式 ${texInline("D=2\\cdot3-1\\cdot1=5\\ne0")}，所以存在唯一解。`,
      `替换第一列：${texInline("D_1=\\det\\begin{bmatrix}5&1\\\\5&3\\end{bmatrix}=10")}，故 ${texInline("x=D_1/D=2")}。`,
      `替换第二列：${texInline("D_2=\\det\\begin{bmatrix}2&5\\\\1&5\\end{bmatrix}=5")}，故 ${texInline("y=D_2/D=1")}。`,
      `由于 ${texInline("b=xC_1+yC_2")}，在 ${texInline("\\det(b,C_2)")} 中 yC₂ 造成重复列而消失，只余 xD；第二列替换同理。`,
    ],
  },
  quiz: [
    { question: "Cramer 证明中，为什么除 xi 之外的展开项都为 0？", answer: "那些项把某个已有列 Ck 再放进第 i 列，产生两列相同，行列式为 0。" },
    { question: `使用 ${texInline("x_i=D_i/D")} 前必须检查什么？`, answer: "必须检查 D≠0，才能相除并保证唯一解。" },
    { question: "D=0 时还需要判断什么？", answer: "需要判断 b 是否位于系数列张成的列空间中，从而区分无解与无穷多解。" },
    { question: "为什么 Cramer 法则通常不用于大型数值系统？", answer: "它需要计算多个行列式，消元或矩阵分解通常更高效且更适合数值计算。" },
  ],
  summary: [
    "列线性与重复列为零共同给出 Di=xiD。",
    "D≠0 时，Cramer 比值读取唯一坐标。",
    "D=0 只关闭唯一解情形；b 与列空间的关系继续区分无解和无穷多解。",
  ],
  bridge: "Cramer 法则利用一次替换列分组。最后一节把分组推广到多行、多列的互补子式，并研究两个变换连续作用时行列式怎样复合。",
  exercises: [
    "从列线性完整证明三元 Cramer 法则。",
    "构造两个 D=0 的二元系统，使一个无解、另一个有无穷多解。",
  ],
});
