defineChapter4Section("matrix-inverse", {
  number: "§4",
  textbookSection: "矩阵的逆",
  title: "矩阵的逆",
  navTitle: "矩阵的逆",
  question: "一次矩阵作用已经得到输出后，怎样用一个确定的矩阵把原输入找回来？",
  goal: "把逆矩阵理解为可逆矩阵唯一的撤销运算，掌握逆矩阵的定义、基本运算规则、2 阶求逆公式，以及用逆矩阵解向量方程和矩阵方程的方法。",
  tags: ["逆矩阵", "撤销运算", "逆序法则", "矩阵方程"],
  intro:
    "第三节已经给出了判断可逆性的入口：方阵满秩等价于行列式非零。本节不再重复面积与秩的几何解释，而是从“怎样撤销一次矩阵作用”出发，研究逆矩阵本身怎样定义、怎样计算，以及怎样用于解方程。",
  concepts: [
    {
      label: "定义与唯一性",
      text: `若方阵 ${texInline("A")} 存在方阵 ${texInline("B")}，使 ${texInline("AB=BA=I")}，则 ${texInline("B=A^{-1}")}。这样的逆矩阵一旦存在便是唯一的。`,
    },
    {
      label: "必须是方阵",
      text: "这里讨论的是双侧逆。矩阵只有行数与列数相同，才可能同时满足左乘和右乘都得到同阶单位矩阵。方阵仍可能没有逆。",
    },
    {
      label: "撤销向量方程",
      text: `若 ${texInline("Ax=b")} 且 ${texInline("A")} 可逆，在等式左侧同时左乘 ${texInline("A^{-1}")}，得到 ${texInline("x=A^{-1}b")}。`,
    },
    {
      label: "撤销矩阵方程",
      text: `${texInline("AX=C")} 的解是 ${texInline("X=A^{-1}C")}；${texInline("XA=C")} 的解是 ${texInline("X=CA^{-1}")}。乘法次序必须保留。`,
    },
    {
      label: "乘积的逆",
      text: `${texInline("(AB)^{-1}=B^{-1}A^{-1}")}。撤销复合过程时，要先撤销最后发生的 ${texInline("A")}，再撤销较早发生的 ${texInline("B")}。`,
    },
    {
      label: "2 阶求逆公式",
      text: `若 ${texInline("A=\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}")} 且 ${texInline("ad-bc\\ne0")}，则 ${texInline("A^{-1}=\\frac{1}{ad-bc}\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}")}。分母为 0 时公式没有意义。`,
    },
    {
      label: "把求逆写成 AX=I",
      text: `求 ${texInline("A^{-1}")} 等价于求矩阵 ${texInline("X")} 使 ${texInline("AX=I")}。若 ${texInline("X=[x_1,\\ldots,x_n]")}，就要分别解 ${texInline("Ax_j=e_j")}。`,
    },
    {
      label: "常用规则",
      text: `${texInline("(A^T)^{-1}=(A^{-1})^T")}，${texInline("(A^m)^{-1}=(A^{-1})^m")}；当 ${texInline("k\\ne0")} 时，${texInline("(kA)^{-1}=k^{-1}A^{-1}")}。`,
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第四章",
    page: "",
    items: [
      "逆矩阵的定义与唯一性",
      "可逆矩阵的基本运算规则",
      "2 阶矩阵的求逆公式",
      "用逆矩阵解向量方程与矩阵方程",
      "将求逆写成 AX=I",
    ],
  },
  presentation: "generic",
  interactive: false,
  visual: false,
  example: {
    title: "例题：先求逆，再解线性方程",
    question: `设 ${texInline("A=\\begin{bmatrix}2&1\\\\1&1\\end{bmatrix}")}，${texInline("b=\\begin{bmatrix}5\\\\3\\end{bmatrix}")}。求 ${texInline("A^{-1}")}，并解 ${texInline("Ax=b")}。`,
    choices: [
      {
        correct: true,
        text: `${texInline("A^{-1}=\\begin{bmatrix}1&-1\\\\-1&2\\end{bmatrix}")}，${texInline("x=\\begin{bmatrix}2\\\\1\\end{bmatrix}")}。`,
      },
      {
        text: `${texInline("A^{-1}=\\begin{bmatrix}2&-1\\\\-1&1\\end{bmatrix}")}，${texInline("x=\\begin{bmatrix}7\\\\-2\\end{bmatrix}")}。`,
      },
      {
        text: `${texInline("A^{-1}=\\frac12\\begin{bmatrix}1&-1\\\\-1&2\\end{bmatrix}")}，${texInline("x=\\begin{bmatrix}1\\\\1/2\\end{bmatrix}")}。`,
      },
      {
        text: `${texInline("A^{-1}")} 存在，但 ${texInline("Ax=b")} 仍可能有多个解。`,
      },
    ],
    steps: [
      `先检查公式的分母：${texInline("2\\cdot1-1\\cdot1=1\\ne0")}，所以这个 2 阶公式可以使用。这里直接调用第三节已经建立的可逆判定，不再重复其几何解释。`,
      `交换主对角线元素，并把副对角线元素变号，得到 ${texInline("\\begin{bmatrix}1&-1\\\\-1&2\\end{bmatrix}")}。分母为 1，因此 ${texInline("A^{-1}=\\begin{bmatrix}1&-1\\\\-1&2\\end{bmatrix}")}。`,
      `在 ${texInline("Ax=b")} 左侧同时左乘 ${texInline("A^{-1}")}：${texInline("x=A^{-1}b")}。`,
      `计算 ${texInline("x=\\begin{bmatrix}1&-1\\\\-1&2\\end{bmatrix}\\begin{bmatrix}5\\\\3\\end{bmatrix}=\\begin{bmatrix}2\\\\1\\end{bmatrix}")}。`,
      `代回检查：${texInline("A\\begin{bmatrix}2\\\\1\\end{bmatrix}=\\begin{bmatrix}5\\\\3\\end{bmatrix}")}；同时 ${texInline("AA^{-1}=I")}，所以求逆与方程解都正确。`,
    ],
  },
  quiz: [
    {
      question: `已知 ${texInline("AB=I")} 就能直接称 ${texInline("B=A^{-1}")} 吗？`,
      answer: "本节的定义要求双侧关系 AB=BA=I。对同阶方阵，一侧逆最终会推出另一侧逆，但定义和验证时应把双侧单位关系写清楚。",
    },
    {
      question: "所有方阵都有逆矩阵吗？",
      answer: "没有。方阵只是可能存在双侧逆的必要形状条件；是否真正可逆还要满足第三节给出的判定条件。",
    },
    {
      question: `若 ${texInline("A,B")} 都可逆，${texInline("(AB)^{-1}")} 是什么？`,
      answer: `${texInline("(AB)^{-1}=B^{-1}A^{-1}")}。逆序来自撤销过程要从最后一步开始。`,
    },
    {
      question: `方程 ${texInline("XA=C")} 为什么必须在等式右侧乘 ${texInline("A^{-1}")}？`,
      answer: `因为 A 位于 X 的右侧，要在等式右侧右乘 ${texInline("A^{-1}")}；矩阵乘法不能随意交换次序。`,
    },
    {
      question: `若 ${texInline("AX=I")} 且 ${texInline("X=[x_1,\\ldots,x_n]")}，第 j 列满足什么方程？`,
      answer: `${texInline("Ax_j=e_j")}。逆矩阵的每一列分别把一个标准基向量作为目标输出。`,
    },
    {
      question: `若 ${texInline("k\\ne0")} 且 ${texInline("A")} 可逆，${texInline("(kA)^{-1}")} 等于什么？`,
      answer: `${texInline("(kA)^{-1}=k^{-1}A^{-1}")}。反向操作既要撤销 A，也要撤销标量 k 的缩放。`,
    },
    {
      question: `若 ${texInline("A^T")} 可逆，它的逆与 ${texInline("A^{-1}")} 有什么关系？`,
      answer: `${texInline("(A^T)^{-1}=(A^{-1})^T")}。`,
    },
  ],
  summary: [
    "逆矩阵是可逆方阵唯一的双侧撤销运算：AA⁻¹=A⁻¹A=I。",
    "逆矩阵把方程中的矩阵作用消去；矩阵位于未知量哪一侧，就在对应的一侧乘逆矩阵。",
    "复合过程的逆必须倒序执行，因此 (AB)⁻¹=B⁻¹A⁻¹。",
    "2 阶公式只在分母非零时成立；求一般逆矩阵可统一写成 AX=I，具体的初等变换算法留到第六节。",
    "下一节将转向矩阵的分块，用块结构组织更大的矩阵与运算。",
  ],
  exercises: [
    `证明逆矩阵的唯一性：若 ${texInline("AB=BA=I")} 且 ${texInline("AC=CA=I")}，证明 ${texInline("B=C")}。`,
    `设 ${texInline("A,B")} 可逆，直接验证 ${texInline("B^{-1}A^{-1}")} 同时是 ${texInline("AB")} 的左逆和右逆。`,
    `取 ${texInline("A=\\begin{bmatrix}1&2\\\\0&1\\end{bmatrix}")} 与 ${texInline("C=\\begin{bmatrix}3&1\\\\2&0\\end{bmatrix}")}，分别解 ${texInline("AX=C")} 和 ${texInline("XA=C")}，比较两次乘法的次序。`,
  ],
});
