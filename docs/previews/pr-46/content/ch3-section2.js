defineChapter3Section("n-vector-space", {
  number: "§2",
  textbookSection: "n维向量空间",
  title: "n维向量空间",
  navTitle: "n维向量空间",
  question: "为什么可以把 n 个未知量合成一个向量 x？当 n 大于 3、图像只能显示投影时，哪些信息仍被坐标完整保存？",
  goal: `在数域 ${texInline(String.raw`F`)} 上理解 ${texInline(String.raw`F^n`)} 的有序坐标、加法与数乘；会用标准基表示向量；把 ${texInline(String.raw`Ax`)} 读成 A 的列向量按 x 的坐标所作的线性组合。`,
  tags: ["Fⁿ", "有序坐标", "标准基", "线性组合", "Ax 的列组合"],
  intro:
    "方程组中的未知量有固定顺序，把它们写成一列就得到 x=(x₁,…,xₙ)ᵀ。坐标顺序、所属数域和逐分量运算共同确定这个对象。二维箭头提供一种可见模型；在高维中，完整坐标继续精确记录每个分量，任何低维画面都只承担观察作用。",
  videoPlan: {
    title: "从未知量列到列向量组合",
    duration: "约 2 分钟",
    scenes: [
      "把一个方程组的未知量按固定顺序框成列向量 x。",
      "用标准基逐项重建 x，说明每个坐标对应固定位置。",
      "把矩阵 A 拆成列 a₁,…,aₙ，并让 x 的坐标成为各列的权重。",
      "高维坐标列保持完整，画布只显示前两个坐标的投影。",
    ],
  },
  concepts: [
    {
      label: "有序坐标",
      text: `${texInline(String.raw`F^n`)} 中的向量写成 ${texInline(String.raw`x=(x_1,\ldots,x_n)^T`)}；坐标位置固定，两个向量相等当且仅当对应坐标全部相等。`,
    },
    {
      label: "加法与数乘",
      text: "同维向量逐分量相加，标量同时乘每个分量；这些规则保证结果仍属于同一个 Fⁿ。",
    },
    {
      label: "标准基",
      text: `${texInline(String.raw`e_i`)} 的第 i 个坐标为 1，其余为 0；逐坐标比较可直接验证 ${texInline(String.raw`x=x_1e_1+\cdots+x_ne_n`)} 的系数唯一。`,
    },
    {
      label: "矩阵—向量乘法",
      text: `若 ${texInline(String.raw`A=[a_1\ \cdots\ a_n]`)}，则 ${texInline(String.raw`Ax=x_1a_1+\cdots+x_na_n`)}。未知向量 x 同时记录了组合每一列所用的权重。`,
    },
    {
      label: "完整坐标与投影",
      text: "投影只显示被选中的坐标。高维向量的相等、线性关系和方程结论必须回到完整坐标判断。",
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第三章 §2 · Lay pp. 39–52 · Strang pp. 42–43",
    page: "",
    items: ["n 维向量", "向量加法与数乘", "标准基与坐标", "线性组合", "Ax 的列组合解释"],
  },
  interactive: {
    type: "slot",
    title: "实验：从线性组合读出完整坐标",
    description: "缩放后的向量首尾相接；坐标列、标准基分解和二维投影同步更新。",
    task: "先在 n=2 时预测 αu+βv 的终点，再升到 n=4，只改变第三、第四坐标；说明为什么画面可能不动，而完整向量已经改变。",
    prompts: [
      "改变 α 的符号，观察 αu 的方向和所有坐标如何同时变化。",
      "交换 u、v 后同时交换 α、β，检查最终向量是否保持不变。",
      "在 n=4 时保持前两坐标不动，只修改 u₃ 或 v₄。",
      "把当前式子读成一个两列矩阵乘以系数向量 (α,β)ᵀ。",
    ],
  },
  example: {
    title: "例题：同一个乘积的三种读法",
    question: `设 ${texInline(String.raw`A=\begin{bmatrix}1&0&1&1\\0&1&1&-1\\1&1&2&0\end{bmatrix}`)}，${texInline(String.raw`x=(1,2,-1,1)^T`)}。计算 ${texInline(String.raw`Ax`)}，并说明 x 与 Ax 分别属于哪个坐标空间。`,
    choices: [
      {
        correct: true,
        text: `${texInline(String.raw`Ax=a_1+2a_2-a_3+a_4=(1,0,1)^T`)}；${texInline(String.raw`x\in F^4`)}，${texInline(String.raw`Ax\in F^3`)}。`,
      },
      { text: `${texInline(String.raw`Ax\in F^4`)}，因为结果的坐标数由 A 的列数决定。` },
      { text: `${texInline(String.raw`Ax=(1,2,-1,1)^T`)}，矩阵只负责给向量重新排版。` },
      { text: "矩阵是 3×4，因此 A 与四维向量 x 不能相乘。" },
    ],
    steps: [
      "A 有 4 列，所以 x 必须提供 4 个列组合系数；A 有 3 行，所以结果有 3 个坐标。",
      `按列读取：${texInline(String.raw`Ax=a_1+2a_2-a_3+a_4`)}。`,
      `逐坐标计算得到 ${texInline(String.raw`(1+0-1+1,\ 0+2-1-1,\ 1+2-2+0)^T`)}。`,
      `因此 ${texInline(String.raw`Ax=(1,0,1)^T`)}。`,
      "下一节会发现，这四列之间存在关系，所以同一个结果还可能由另一组系数生成。",
    ],
    audit: {
      kind: "matrix-vector",
      A: [[1, 0, 1, 1], [0, 1, 1, -1], [1, 1, 2, 0]],
      x: [1, 2, -1, 1],
      y: [1, 0, 1],
    },
  },
  quiz: [
    { question: `${texInline(String.raw`F^n`)} 中的 n 记录什么？`, answer: "它记录每个向量的有序坐标个数；标准基也恰有 n 个向量。" },
    { question: "为什么交换两个坐标通常会得到不同向量？", answer: "每个坐标位置都有固定含义；交换数值会改变它们所乘的标准基向量。" },
    { question: `若 A 是 ${texInline(String.raw`m\times n`)} 矩阵，x 与 Ax 分别有多少个坐标？`, answer: "x 属于 Fⁿ，有 n 个坐标；Ax 属于 Fᵐ，有 m 个坐标。" },
    { question: `公式 ${texInline(String.raw`Ax=x_1a_1+\cdots+x_na_n`)} 中的 ${texInline(String.raw`x_i`)} 扮演什么角色？`, answer: "它是矩阵第 i 列 aᵢ 的组合权重。" },
    { question: "两个高维向量的前两坐标相同，能否断定它们相等？", answer: "不能；其余坐标仍可能不同，二维投影没有保存全部信息。" },
  ],
  summary: [
    "Fⁿ 用固定顺序的 n 个坐标完整记录向量，并按对应分量定义加法与数乘。",
    "标准基把每个坐标解释为一个固定基向量的系数。",
    "Ax 是 A 的列向量按 x 的坐标进行的线性组合。",
    "低维投影负责观察，完整坐标负责严格判断；下一节将研究列组合的表示何时唯一。",
  ],
  exercises: [
    `把一个 ${texInline(String.raw`2\times3`)} 矩阵乘向量的计算同时写成标量方程和列组合。`,
    "找出两个不同的 F⁴ 向量，使它们的前两坐标投影完全相同。",
    "用逐坐标比较证明标准基分解的系数唯一。",
  ],
});
