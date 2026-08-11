defineChapter4Section("elementary-matrices", {
  number: "§6",
  textbookSection: "初等矩阵",
  title: "初等矩阵",
  navTitle: "初等矩阵",
  question: "怎样把一次初等行操作编码成矩阵乘法？为什么左乘改行、右乘改列，而且每一步都能撤销？",
  goal:
    "会从三类初等操作构造初等矩阵，解释 EA 与 AE 的差别，写出逆操作，并把连续消元与 [A|I] 求逆联系起来。",
  tags: ["三类操作", "I→E→EA", "左乘右乘", "消元求逆"],
  intro:
    "初等矩阵把消元法写进矩阵乘法。对单位矩阵 I 做一次初等操作得到 E；同一个 E 左乘任意矩阵 A，就在 A 上执行同一次行操作。由于每一步都有明确的反向操作，初等矩阵全部可逆。",
  concepts: [
    {
      label: "交换型",
      text: "交换 I 的两行得到置换型初等矩阵；再交换一次就是逆操作。",
    },
    {
      label: "倍乘型",
      text: `把 I 的第 i 行乘非零数 c；逆操作把该行乘 ${texInline("c^{-1}")}，因此 c 不能为 0。`,
    },
    {
      label: "倍加型",
      text: `执行 ${texInline("R_i\\leftarrow R_i+cR_j")}；逆操作使用 ${texInline("-c")}。`,
    },
    {
      label: "左乘改行",
      text: `${texInline("EA")} 的每一行按 E 的行系数组合 A 的各行，所以 E 把自身记录的行操作施加到 A。`,
    },
    {
      label: "右乘改列",
      text: `${texInline("AE")} 的每一列按 E 的列系数组合 A 的各列；同一个 E 放在右侧时执行对应列操作。`,
    },
    {
      label: "初等矩阵可逆",
      text: "反向初等操作产生 E⁻¹；因此初等操作保持秩，作用于增广矩阵时保持方程组解集。",
    },
    {
      label: "连续操作",
      text: `${texInline("E_k\\cdots E_2E_1A")} 按从右到左的顺序记录完整消元过程。`,
    },
    {
      label: "消元求逆",
      text: `若 ${texInline("E_k\\cdots E_1A=I")}，则 ${texInline("E_k\\cdots E_1=A^{-1}")}；这正是 ${texInline("[A\\mid I]\\to[I\\mid A^{-1}]")}。`,
    },
  ],
  textbook: {
    reference: "Hoffman–Kunze · Friedberg · Strang · Lay",
    page: "Hoffman–Kunze §1.3、§1.6；Friedberg §3.1—§3.2；Strang §2.5；Lay §2.2",
    items: [
      "Hoffman–Kunze：同一行操作作用于 I 与 A，给出 B=EA；反向操作立即给出 E⁻¹。",
      "Friedberg：初等行列操作由左右乘初等矩阵实现，并保持秩。",
      "Strang：消元矩阵把每一步消元保存为因子，Gauss–Jordan 同时作用于 A 和 I。",
      "Lay：增广矩阵 [A|I] 的右半部分逐列求解 Ax=eⱼ。",
    ],
  },
  interactive: {
    type: "slot",
    title: "初等矩阵工作台",
    description:
      "在交换、非零倍乘、倍加之间切换，逐步追踪 I→E→EA；再比较 EA 与 AE，并把多步行操作同步应用到方程组。",
    task:
      "每一种操作都完成三件事：从 I 写出 E、预测 EA 的变化行、写出 E⁻¹；随后切到右乘，确认变化对象从行转为列。",
    prompts: [
      "选择交换操作，确认 E=E⁻¹。",
      "选择倍乘操作，解释系数取 0 时为什么无法形成初等操作。",
      "选择倍加操作，比较 EA 的变化行和 AE 的变化列。",
      "在方程组视图中确认系数矩阵与右端必须同步执行行操作。",
    ],
  },
  example: {
    title: "例题：从行操作构造 E，并验证 EA",
    question: `对 ${texInline("A=\\begin{bmatrix}1&2\\\\3&7\\end{bmatrix}")} 执行 ${texInline("R_2\\leftarrow R_2-3R_1")}。写出 E、EA 与 E⁻¹。`,
    choices: [
      {
        correct: true,
        text: `${texInline("E=\\begin{bmatrix}1&0\\\\-3&1\\end{bmatrix}")}，${texInline("EA=\\begin{bmatrix}1&2\\\\0&1\\end{bmatrix}")}，${texInline("E^{-1}=\\begin{bmatrix}1&0\\\\3&1\\end{bmatrix}")}。`,
      },
      {
        text: `${texInline("E=\\begin{bmatrix}1&-3\\\\0&1\\end{bmatrix}")}；左乘会修改 A 的第二列。`,
      },
      {
        text: `${texInline("E=\\begin{bmatrix}1&0\\\\-3&0\\end{bmatrix}")}；把第二行清零就是消元。`,
      },
      {
        text: `${texInline("E^{-1}=E")}；所有初等矩阵都等于自己的逆。`,
      },
    ],
    steps: [
      `从 ${texInline("I=\\begin{bmatrix}1&0\\\\0&1\\end{bmatrix}")} 开始，对第二行执行同一操作。`,
      `得到 ${texInline("E=\\begin{bmatrix}1&0\\\\-3&1\\end{bmatrix}")}。E 的第二行记录“第二行减三倍第一行”的组合系数。`,
      `计算 ${texInline("EA=\\begin{bmatrix}1&2\\\\-3+3&-6+7\\end{bmatrix}=\\begin{bmatrix}1&2\\\\0&1\\end{bmatrix}")}。`,
      `反向操作是 ${texInline("R_2\\leftarrow R_2+3R_1")}，所以 ${texInline("E^{-1}=\\begin{bmatrix}1&0\\\\3&1\\end{bmatrix}")}。`,
      `核对 ${texInline("E^{-1}EA=A")}；反向行操作确实恢复原矩阵。`,
    ],
    audit: {
      matrix: [[1, 2], [3, 7]],
      elementary: [[1, 0], [-3, 1]],
      product: [[1, 2], [0, 1]],
      inverse: [[1, 0], [3, 1]],
    },
  },
  quiz: [
    {
      question: "怎样最快构造某次行操作对应的初等矩阵？",
      answer: "把同一次行操作施加到同阶单位矩阵 I 上。",
    },
    {
      question: "为什么倍乘型初等操作的倍数必须非零？",
      answer: "乘 0 会把整行信息删除，无法通过乘一个数恢复，因此操作不可逆。",
    },
    {
      question: `${texInline("R_1\\leftarrow R_1+4R_2")} 的逆操作是什么？`,
      answer: `${texInline("R_1\\leftarrow R_1-4R_2")}。`,
    },
    {
      question: "EA 与 AE 分别主要改变什么？",
      answer: "EA 按 E 的行系数组合 A 的行；AE 按 E 的列系数组合 A 的列。",
    },
    {
      question: `若 ${texInline("E_3E_2E_1A=I")}，A⁻¹ 是什么？`,
      answer: `${texInline("A^{-1}=E_3E_2E_1")}。`,
    },
    {
      question: "对增广矩阵做行操作时，为什么右端也要改变？",
      answer: "行操作作用于整条方程。只改系数而不改右端会得到另一组方程，解集不再保持。",
    },
  ],
  summary: [
    "对 I 做一次初等操作得到 E；左乘 E 会把同一行操作施加到 A。",
    "三类初等矩阵都有明确的反向操作，因此全部可逆。",
    "左乘改行、右乘改列；矩阵所在侧决定被组合的方向。",
    "连续初等矩阵乘积记录完整消元，Gauss–Jordan 由此产生 A⁻¹。",
    "下一节把标量行倍加升级为带尺寸的块行倍加。",
  ],
  exercises: [
    `写出 ${texInline("R_1\\leftrightarrow R_3")}、${texInline("R_2\\leftarrow5R_2")} 和 ${texInline("R_3\\leftarrow R_3-2R_1")} 对应的三阶初等矩阵及其逆。`,
    `对同一个 A 比较 EA 与 AE，逐项说明变化的行和列。`,
    `手工把 ${texInline("[A\\mid I]")} 化为 ${texInline("[I\\mid A^{-1}]")} 并记录每一个初等矩阵因子。`,
  ],
});
