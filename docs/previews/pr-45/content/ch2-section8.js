defineChapter2Section("laplace-and-product", {
  number: "§8",
  textbookSection: "拉普拉斯（Laplace）定理·行列式的乘法规则",
  title: "拉普拉斯（Laplace）定理·行列式的乘法规则",
  navTitle: "Laplace 与乘法",
  question: "怎样把单行余子式展开推广到多行互补选择，并说明两次线性变换的有向体积倍率为何相乘？",
  goal: "分两个阶段掌握本节：先用互补子式组织多行 Laplace 展开，再从复合变换和三条母性质理解 det(AB)=det(A)det(B)。",
  tags: ["互补子式", "Laplace 定理", "乘法规则"],
  prerequisites: [
    "掌握按一行或一列的代数余子式展开。",
    "理解行列式的三条母性质与有向体积倍率。",
  ],
  objectives: [
    "识别固定行组对应的列组与互补子式。",
    "在简单四阶例子中使用 Laplace 定理。",
    "从几何复合与代数结构两方面解释 det(AB)=det(A)det(B)。",
  ],
  intro:
    "本节包含两个结构性结论。Laplace 定理把‘选一个元素’提升为‘选一组行与同样多的一组列’；乘法规则把‘连续两次变换’压缩成两个倍率的乘积。",
  concepts: [
    { label: "互补子式", text: "选定 k 行和 k 列后，剩余行列构成互补的 n-k 阶子式。" },
    { label: "Laplace", text: "固定一组行，对全部同阶列组的子式与互补代数余子式乘积求和。" },
    { label: "乘法", text: `${texInline("\\det(AB)=\\det(A)\\det(B)")}。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第二章 §8",
    page: "",
    items: ["Laplace 定理", "互补子式", "行列式乘法规则"],
  },
  story: {
    title: "两种分组：互补选择与复合倍率",
    lead: "先完成多行展开，再跨过检查点进入乘法规则。两个结论都在组织庞大的 Leibniz 求和，却分别强调互补结构与复合结构。",
    modules: [
      {
        number: "01",
        title: "第一阶段：从单元素扩展到行列组",
        subtitle: "固定 k 行后，每条排列路径会在这些行中选中恰好 k 列。",
        blocks: [
          {
            type: "proof",
            items: [
              `固定行指标组 ${texInline("I=\\{i_1<\\cdots<i_k\\}")}。任意排列路径在这些行中会使用一个 k 元列组 ${texInline("J")}。`,
              `把所有使用同一列组 J 的路径归为一组；I×J 内的选择组成 k 阶子式 ${texInline("A[I,J]")}。`,
              `其余行和其余列组成互补子式 ${texInline("A[I^c,J^c]")}。`,
              `两部分内部排列符号与把 I、J 移到基准位置的符号合并，得到 ${texInline("(-1)^{\\sum I+\\sum J}")}。`,
              "对全部 k 元列组 J 求和，覆盖每条原排列路径一次。",
            ],
          },
          {
            type: "formula",
            kicker: "广义 Laplace 展开",
            formula: texDisplay("\\det(A)=\\sum_{|J|=k}(-1)^{\\sum I+\\sum J}\\det A[I,J]\\,\\det A[I^c,J^c]"),
            text: "当 k=1 时，它正好退化为按一行的代数余子式展开。",
          },
          {
            type: "note",
            title: "阶段检查",
            text: "在交互中固定行组 {1,2}，逐一配对六个二元列组及其互补列组；确认每一项都使用全部四行四列且没有重复。",
          },
        ],
      },
      {
        number: "02",
        title: "第二阶段：连续两次变换的倍率相乘",
        subtitle: "B 先改变单位平行体，A 再改变 B 的输出。",
        blocks: [
          {
            type: "cards",
            columns: 2,
            items: [
              { kicker: "几何读取", title: texInline("I\\xrightarrow{B}B\\xrightarrow{A}AB"), text: "第一次把有向体积乘 det(B)，第二次再乘 det(A)，总倍率为二者乘积。" },
              { kicker: "代数读取", title: "对 B 的列使用分别线性", text: "AB 的每一列是 A 的列组合；展开后，重复列项由交替性消失，只保留排列匹配。" },
            ],
          },
          {
            type: "formula",
            kicker: "乘法规则",
            formula: texDisplay("\\det(AB)=\\det(A)\\det(B)"),
            text: "符号也参与相乘：一次方向翻转给负号，两次方向翻转恢复正向；任一阶段塌缩都会使最终乘积为 0。",
          },
          {
            type: "proof",
            items: [
              `设 A 的列为 ${texInline("C_1,\\ldots,C_n")}。AB 的第 j 列为 ${texInline("\\sum_k b_{kj}C_k")}。`,
              "对 AB 的所有列反复使用分别线性，得到按 n 个列指标选择的乘积和。",
              "只要两个位置选择了同一个 Ck，交替性就使该项为 0；保留下来的列指标恰好构成一个排列 σ。",
              `排列后的 A 列行列式等于 ${texInline("\\operatorname{sgn}(\\sigma)\\det(A)")}，相应系数为 ${texInline("\\prod_j b_{\\sigma(j),j}")}。`,
              `提出 ${texInline("\\det(A)")} 后，剩余带符号求和正是 ${texInline("\\det(B)")}，因此对全部方阵都有 ${texInline("\\det(AB)=\\det(A)\\det(B)")}。`,
            ],
          },
        ],
      },
      {
        number: "03",
        title: "乘法规则的三个直接推论",
        subtitle: "复合、撤回与换坐标都可以只看倍率。",
        blocks: [
          {
            type: "cards",
            items: [
              { kicker: "逆", title: texInline("\\det(A^{-1})=1/\\det(A)"), text: "由 AA⁻¹=I 取行列式得到。" },
              { kicker: "幂", title: texInline("\\det(A^m)=\\det(A)^m\;(m\\ge0)"), text: "对非负整数 m，重复复合使倍率按同样次数相乘；m=0 时两边都等于 1。" },
              { kicker: "相似", title: texInline("\\det(P^{-1}AP)=\\det(A)"), text: "换坐标的倍率 det(P) 与 det(P⁻¹) 相互抵消。" },
            ],
          },
          {
            type: "misconception",
            items: [
              `${texInline("\\det(A+B)")} 一般不能拆开；乘法规则只对应矩阵乘法与变换复合。`,
              "Laplace 定理与乘法规则各自需要独立理解；本页的两个交互对应两个阶段。",
            ],
          },
        ],
      },
    ],
  },
  interactive: {
    type: "slot",
    visualTitle: "互补子式配对 · 两阶段倍率复合",
    description: "上半部分固定四阶矩阵中的两行并枚举六个互补列组；下半部分把 I→B→AB 的两次面积变化连续画出。",
    task: "先完成一个互补子式配对，再预测两个阶段的总倍率；最后切换镜像、剪切和塌缩预设核对符号与零值。",
    stages: {
      laplace: {
        title: "第一阶段 · 子式与互补子式",
        description: "固定前两行，四阶矩阵中共有六个两列组合。逐项读取子式、互补子式、位置符号与贡献。",
        task: "浏览六个列组，核对每组与其补集恰好覆盖四列，并确认六项贡献之和等于原四阶行列式。",
      },
      product: {
        title: "第二阶段 · I → B → AB",
        description: "中间画面先从 I 变为 B；右侧以 B 为真实起点，再连续变为 AB。",
        task: "先预测总倍率，再比较一次镜像、两次镜像与含投影三种符号或零值情形。",
      },
    },
    prediction: {
      question: `若 ${texInline("\\det(A)=-2")}、${texInline("\\det(B)=-3")}，复合变换 AB 的有向体积倍率是多少？`,
      options: [
        { label: "+6", correct: true, feedback: "两个倍率相乘得到 6；两次方向翻转使最终定向恢复。" },
        { label: "-5", feedback: "复合对应倍率相乘，矩阵加法才可能让人误想到相加。" },
        { label: "-6", feedback: "大小确实为 6；再检查两次负号相乘后的定向。" },
      ],
    },
    prompts: [
      "固定行组 {1,2}，检查每个列组与其补集是否恰好覆盖四列。",
      "观察 I→B→AB 的第二阶段是否从 B 的图形继续，而非重新从 I 开始。",
      "让任一阶段塌缩，说明为什么最终 det(AB)=0。",
    ],
  },
  example: {
    title: "只用乘法规则完成三项推导",
    question: `已知 ${texInline("\\det(A)=-2")}、${texInline("A")} 可逆，且 ${texInline("B=P^{-1}AP")}。求 ${texInline("\\det(A^{-1})")}、${texInline("\\det(A^3)")} 与 ${texInline("\\det(B)")}，并写出每一步所用的乘积关系。`,
    steps: [
      `由 ${texInline("AA^{-1}=I")}，有 ${texInline("\\det(A)\\det(A^{-1})=1")}；所以 ${texInline("\\det(A^{-1})=-\\tfrac12")}。`,
      `由重复使用乘法规则，${texInline("\\det(A^3)=\\det(A)^3=(-2)^3=-8")}。`,
      `相似矩阵满足 ${texInline("\\det(B)=\\det(P^{-1})\\det(A)\\det(P)")}。`,
      `又有 ${texInline("\\det(P^{-1})\\det(P)=1")}，所以 ${texInline("\\det(B)=\\det(A)=-2")}。`,
    ],
  },
  quiz: [
    { question: "广义 Laplace 展开中，为什么子式和互补子式必须使用互补的行列指标？", answer: "只有这样两部分合起来才恰好使用全部行、全部列各一次，对应原行列式的一组合法排列路径。" },
    { question: "k=1 的 Laplace 定理退化成什么？", answer: "退化成按固定一行的代数余子式展开。" },
    { question: `若 ${texInline("\\det(A)=0")}，${texInline("\\det(AB)")} 是多少？为什么？`, answer: "等于 0。A 已经使维度塌缩，后续复合不能恢复丢失的有向体积。" },
    { question: "相似变换为什么不改变行列式？", answer: "P 与 P⁻¹ 的倍率互为倒数，在 det(P⁻¹AP) 中抵消。" },
  ],
  summary: [
    "Laplace 定理按固定行组使用的列组分组，并配对互补子式。",
    "矩阵乘法对应变换复合，因此有向体积倍率满足 det(AB)=det(A)det(B)。",
    "逆、幂与相似不变性都是乘法规则的直接推论。",
  ],
  bridge: "本章从有向面积出发，经排列符号、三条母性质和计算方法，最终得到分组与复合规则。进入后续章节时，行列式将继续作为可逆性、特征结构与坐标变化的重要不变量。",
  exercises: [
    "对一个四阶矩阵固定前两行，列出 Laplace 展开的全部六组互补列指标。",
    "用三条母性质证明 det(AB)=det(A)det(B)，并单独处理 det(A)=0 的情形。",
  ],
});
