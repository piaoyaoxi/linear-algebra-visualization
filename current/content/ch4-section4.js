defineChapter4Section("matrix-inverse", {
  number: "§4",
  textbookSection: "矩阵的逆",
  title: "矩阵的逆",
  navTitle: "矩阵的逆",
  question: "怎样严格说明一个矩阵可以被完整撤销？为什么复合过程的逆必须按相反次序执行？",
  goal:
    "掌握双侧逆、唯一性、乘积逆序和二阶求逆；能用逆矩阵解方程并用左右乘积验证结果，同时知道何时应直接消元。",
  tags: ["双侧逆", "唯一性", "逆序法则", "求逆与解方程"],
  intro:
    "逆矩阵把一次矩阵作用完整撤销。完整撤销要求两条路径都回到单位矩阵：先做 A 再做 A⁻¹，以及先做 A⁻¹ 再做 A。几何上可逆意味着没有把不同输入永久合并；代数上它意味着消元能产生每一个主元。",
  videoPlan: {
    title: "撤销一次矩阵作用",
    duration: "约 2 分钟",
    scenes: [
      "从单位网格和向量 x 出发，应用 A 得到 Ax。",
      "应用 A⁻¹，让两根基向量、网格和 x 同时回到原位。",
      "把 A 分成先 B 后 C，尝试错误顺序，再用 C⁻¹ 后 B⁻¹ 正确撤销。",
      "切换到降秩矩阵，显示多个输入合并后撤销步骤无法继续。",
    ],
  },
  concepts: [
    {
      label: "双侧逆",
      text: `方阵 A 可逆，是指存在同阶矩阵 ${texInline("A^{-1}")} 使 ${texInline("A^{-1}A=I")} 且 ${texInline("AA^{-1}=I")}。`,
    },
    {
      label: "逆唯一",
      text: `若 ${texInline("BA=I")} 且 ${texInline("AC=I")}，则 ${texInline("B=B(AC)=(BA)C=C")}。`,
    },
    {
      label: "存在判据",
      text: `n 阶矩阵可逆等价于 n 个主元，也等价于 ${texInline("\\det(A)\\ne0")}、${texInline("\\operatorname{rank}(A)=n")}。`,
    },
    {
      label: "逆序法则",
      text: `${texInline("(AB)^{-1}=B^{-1}A^{-1}")}；撤销先 B 后 A 的过程，要先撤销 A，再撤销 B。`,
    },
    {
      label: "矩阵方程",
      text: `A 可逆时，${texInline("AX=B")} 的唯一解是 ${texInline("X=A^{-1}B")}；${texInline("XA=B")} 的唯一解是 ${texInline("X=BA^{-1}")}。`,
    },
    {
      label: "二阶公式",
      text: `${texInline("\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}^{-1}=\\frac1{ad-bc}\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}")}，前提是 ${texInline("ad-bc\\ne0")}。`,
    },
    {
      label: "解方程",
      text: `若 ${texInline("Ax=b")} 且 A 可逆，则 ${texInline("x=A^{-1}b")}；这给出结构结论，数值计算时常直接消元。`,
    },
    {
      label: "消元求逆",
      text: `${texInline("[A\\mid I]\\longrightarrow[I\\mid A^{-1}]")} 同时求解 n 个方程 ${texInline("Ax=e_j")}；详细操作在 §6 回收。`,
    },
  ],
  textbook: {
    reference: "Strang · Lay · Hoffman–Kunze · Friedberg · Axler",
    page: "Strang §2.5；Lay §2.2—§2.3；Hoffman–Kunze §1.6；Friedberg §2.4；Axler §3.D",
    items: [
      "Strang：逆矩阵是撤销操作；通常先判断可逆，再决定是否真的计算 A⁻¹。",
      "Lay：把主元、齐次方程、列独立、覆盖性和可逆性组织成互相连通的判据。",
      "Hoffman–Kunze：用结合律证明逆的唯一性和乘积逆序法则。",
      "Friedberg 与 Axler：可逆性对应一一且覆盖；矩阵逆与所表示过程的逆保持一致。",
    ],
  },
  interactive: {
    type: "slot",
    title: "逆矩阵撤销实验",
    description:
      "沿 I→A→A⁻¹A 移动，追踪基向量、网格和样本向量是否一起回到原位；再切换到降秩矩阵观察撤销在哪一步中断。",
    task:
      "先用剪切、旋转和缩放完成往返，再选择投影或共线矩阵；用两个不同输入得到同一输出解释逆为什么不存在。",
    prompts: [
      "把进度停在 A，读出 Ae₁、Ae₂ 和 Ax。",
      "移动到最后一步，确认 A⁻¹Ae₁=e₁、A⁻¹Ae₂=e₂ 且 A⁻¹Ax=x。",
      "选择降秩矩阵，比较 det、rank 和输出维数，但把结论落到‘不同输入无法区分’。",
      "口头验证乘积逆序：若 A=CD，恢复时应先用 D⁻¹ 还是 C⁻¹？",
    ],
  },
  example: {
    title: "例题：求逆、解方程并完成双重验证",
    question: `设 ${texInline("A=\\begin{bmatrix}3&1\\\\1&1\\end{bmatrix}")}，${texInline("b=\\begin{bmatrix}7\\\\3\\end{bmatrix}")}。求 ${texInline("A^{-1}")} 与方程 ${texInline("Ax=b")} 的解，并验证结果。`,
    choices: [
      {
        correct: true,
        text: `${texInline("A^{-1}=\\frac12\\begin{bmatrix}1&-1\\\\-1&3\\end{bmatrix}")}，${texInline("x=(2,1)^T")}。`,
      },
      {
        text: `${texInline("A^{-1}=\\frac12\\begin{bmatrix}3&-1\\\\-1&1\\end{bmatrix}")}，${texInline("x=(9,2)^T")}。`,
      },
      {
        text: `${texInline("A^{-1}=\\begin{bmatrix}1/3&1\\\\1&1\\end{bmatrix}")}；求逆只需对每个非零元素取倒数。`,
      },
      {
        text: `${texInline("\\det(A)=0")}，所以 A 不可逆且方程无解。`,
      },
    ],
    steps: [
      `先算 ${texInline("\\det(A)=3\\cdot1-1\\cdot1=2\\ne0")}，因此逆矩阵存在。`,
      `二阶公式先交换主对角元素，再改变副对角元素符号，得到 ${texInline("\\begin{bmatrix}1&-1\\\\-1&3\\end{bmatrix}")}。`,
      `除以行列式：${texInline("A^{-1}=\\frac12\\begin{bmatrix}1&-1\\\\-1&3\\end{bmatrix}")}。`,
      `计算 ${texInline("x=A^{-1}b=\\frac12(4,2)^T=(2,1)^T")}。`,
      `代回原方程：${texInline("A(2,1)^T=(7,3)^T=b")}。`,
      `再验证矩阵：${texInline("AA^{-1}=A^{-1}A=I")}；两个方向都成立，完成双侧逆检查。`,
    ],
    audit: {
      matrix: [[3, 1], [1, 1]],
      determinant: 2,
      inverseNumerator: [[1, -1], [-1, 3]],
      inverseDenominator: 2,
      rhs: [7, 3],
      solution: [2, 1],
    },
  },
  quiz: [
    {
      question: "为什么逆矩阵至多只有一个？",
      answer: `若 ${texInline("BA=I")} 且 ${texInline("AC=I")}，结合律给出 ${texInline("B=B(AC)=(BA)C=C")}。`,
    },
    {
      question: `若 A、B 可逆，怎样验证 ${texInline("B^{-1}A^{-1}")} 是 AB 的逆？`,
      answer: `计算 ${texInline("(AB)(B^{-1}A^{-1})=A(BB^{-1})A^{-1}=I")}；反方向也同样得到 I。`,
    },
    {
      question: `一个二阶矩阵的行列式为 ${texInline("10^{-8}")}，它可逆吗？`,
      answer: "在精确代数中可逆，因为行列式非零；数值计算中它可能非常接近奇异，误差会被显著放大。",
    },
    {
      question: `解 ${texInline("XA=B")} 时，应该把 ${texInline("A^{-1}")} 乘在哪一侧？`,
      answer: `右乘：${texInline("XAA^{-1}=BA^{-1}")} 得到 ${texInline("X=BA^{-1}")}。`,
    },
    {
      question: "两列都非零的二阶矩阵一定可逆吗？",
      answer: "不一定。两列可能共线，此时行列式为 0、秩小于 2。",
    },
    {
      question: "求解一个给定的 Ax=b 时，是否总要先算 A⁻¹？",
      answer: "不需要。直接消元通常计算更少、数值更稳定；逆矩阵更适合表达结构和同时处理多个右端。",
    },
  ],
  summary: [
    `${texInline("A^{-1}A=AA^{-1}=I")} 定义完整的双侧撤销，逆矩阵由此唯一。`,
    "主元齐全、满秩和非零行列式是方阵可逆的等价信号。",
    `${texInline("(AB)^{-1}=B^{-1}A^{-1}")} 把复合过程按相反顺序撤销。`,
    "二阶公式适合手算；增广矩阵和直接消元适合一般计算。",
    "下一节将通过自然分组让大型矩阵的结构先显现出来。",
  ],
  exercises: [
    `求 ${texInline("\\begin{bmatrix}2&1\\\\5&3\\end{bmatrix}^{-1}")}，并同时检查左右乘积。`,
    `证明 ${texInline("(ABC)^{-1}=C^{-1}B^{-1}A^{-1}")}。`,
    `比较“先求 A⁻¹ 再算 A⁻¹b”和“直接消元解 Ax=b”的计算步骤。`,
  ],
});
