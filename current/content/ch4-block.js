defineChapter4Section("block-matrices", {
  number: "§5",
  textbookSection: "矩阵的分块",
  title: "矩阵的分块",
  navTitle: "矩阵的分块",
  question: "怎样沿自然分组切开大矩阵，使每个块都保留明确尺寸，并让零块直接暴露系统之间的依赖？",
  goal:
    "掌握合法分块、逐块加法、分块转置和块乘法；会从块对角、块三角结构判断哪些变量组彼此独立或单向耦合。",
  tags: ["自然分组", "块尺寸", "块乘法", "结构零块"],
  intro:
    "分块保留原矩阵的每一个元素，只改变阅读尺度。行分组对应输出或方程的分组，列分组对应输入或未知量的分组。块乘法仍遵循行乘列，只是每次乘法的对象从标量升级为带尺寸的子矩阵。",
  concepts: [
    {
      label: "完整切割",
      text: "每条水平或竖直分界线都必须贯穿整个矩阵，才能让每个块拥有确定的行数和列数。",
    },
    {
      label: "兼容分块",
      text: "分块加法要求两矩阵的行分组和列分组都相同；总尺寸相同仍可能无法逐块相加。",
    },
    {
      label: "块乘法",
      text: `若分组兼容，则 ${texInline("C_{ij}=\\sum_kA_{ik}B_{kj}")}；每个内部乘积和最终加法都要检查尺寸。`,
    },
    {
      label: "分块转置",
      text: `${texInline("(A^T)_{ij}=A_{ji}^T")}；块位置先关于主对角线交换，每个块内部再转置。`,
    },
    {
      label: "块对角",
      text: `${texInline("\\begin{bmatrix}A&0\\\\0&D\\end{bmatrix}(x,y)^T=(Ax,Dy)^T")}；两组输入沿独立通路处理。`,
    },
    {
      label: "块上三角",
      text: `${texInline("\\begin{bmatrix}A&B\\\\0&D\\end{bmatrix}")} 中第二组输入会影响两组输出，第一组输入只进入第一组输出，可按块回代。`,
    },
    {
      label: "块对角的逆",
      text: `A、D 可逆时，${texInline("\\operatorname{diag}(A,D)^{-1}=\\operatorname{diag}(A^{-1},D^{-1})")}。`,
    },
  ],
  textbook: {
    reference: "Strang · Lay · Linear Algebra and Learning from Data",
    page: "Strang §2.4；Lay §2.4；LALFD §1.2",
    items: [
      "Strang：块乘法与普通乘法使用同一条行乘列规则，并由块结构导向消元。",
      "Lay：变量和方程的自然分组决定块边界，电路与耦合系统展示零块的含义。",
      "Linear Algebra and Learning from Data：列乘行与低秩块帮助识别大矩阵中的结构。",
      "本站路线：先检查切法和尺寸，再计算一个指定输出块，最后阅读块对角与块三角依赖。",
    ],
  },
  interactive: {
    type: "slot",
    title: "分块结构工作台",
    description:
      "移动完整切割线、选择一个输出块并切换结构视图，让尺寸、块行块列和依赖关系保持同步。",
    task:
      "先构造两种总尺寸相同但切法不同的矩阵，说明为何不能逐块相加；再选择 C₁₂，只追踪真正参与它的块。",
    prompts: [
      "移动横向与纵向切割线，读出四个块的尺寸。",
      "切换为不同切法，找出第一个不兼容的对应块。",
      "在块乘法中选择 C₁₁、C₁₂、C₂₁、C₂₂，逐个核对内部尺寸。",
      "比较块对角与块上三角的依赖箭头，说明零块删除了哪条通路。",
    ],
  },
  example: {
    title: "例题：只计算乘积的右上块",
    question: `在 ${texInline("C=AB")} 中，${texInline("C_{12}=A_{11}B_{12}+A_{12}B_{22}")}。已知 ${texInline("A_{11}=\\begin{bmatrix}1&0\\\\0&2\\end{bmatrix}")}，${texInline("A_{12}=\\begin{bmatrix}1\\\\3\\end{bmatrix}")}，${texInline("B_{12}=\\begin{bmatrix}2&-1\\\\0&1\\end{bmatrix}")}，${texInline("B_{22}=\\begin{bmatrix}1&4\\end{bmatrix}")}。求 ${texInline("C_{12}")}。`,
    choices: [
      {
        correct: true,
        text: `${texInline("C_{12}=\\begin{bmatrix}3&3\\\\3&14\\end{bmatrix}")}。`,
      },
      {
        text: `${texInline("C_{12}=A_{11}+B_{12}+A_{12}+B_{22}=\\begin{bmatrix}5&3\\\\3&7\\end{bmatrix}")}。`,
      },
      {
        text: `${texInline("C_{12}=A_{12}B_{12}+A_{11}B_{22}")}；输出块下标决定把块的乘法顺序交换。`,
      },
      {
        text: "A₁₂ 是 2×1、B₂₂ 是 1×2，因此这两个块不能相乘。",
      },
    ],
    steps: [
      `先查尺寸：${texInline("A_{11}B_{12}")} 是 ${texInline("(2\\times2)(2\\times2)")}；${texInline("A_{12}B_{22}")} 是 ${texInline("(2\\times1)(1\\times2)")}。两项都得到 2×2。`,
      `第一项为 ${texInline("A_{11}B_{12}=\\begin{bmatrix}2&-1\\\\0&2\\end{bmatrix}")}。`,
      `第二项是列乘行：${texInline("A_{12}B_{22}=\\begin{bmatrix}1&4\\\\3&12\\end{bmatrix}")}。`,
      `逐项相加得到 ${texInline("C_{12}=\\begin{bmatrix}3&3\\\\3&14\\end{bmatrix}")}。`,
      "计算只读取 A 的第一块行和 B 的第二块列，其他块不会进入 C₁₂。",
    ],
    audit: {
      a11: [[1, 0], [0, 2]],
      a12: [[1], [3]],
      b12: [[2, -1], [0, 1]],
      b22: [[1, 4]],
      c12: [[3, 3], [3, 14]],
    },
  },
  quiz: [
    {
      question: "两个 4×6 矩阵总尺寸相同，是否一定能逐块相加？",
      answer: "不一定。还要保证水平和竖直分界线完全一致，使每个对应块同型。",
    },
    {
      question: `求 ${texInline("C_{21}")} 时，应读取 A 和 B 的哪些块？`,
      answer: `读取 A 的第二块行和 B 的第一块列：${texInline("C_{21}=\\sum_kA_{2k}B_{k1}")}。`,
    },
    {
      question: "分块乘法中，每个块可以当作可交换的数字吗？",
      answer: "不能。块仍是矩阵，乘法顺序和尺寸条件都必须保留。",
    },
    {
      question: `分块转置时，右上块 ${texInline("A_{12}")} 会变成什么？`,
      answer: `它移动到左下位置并内部转置，成为 ${texInline("A_{12}^T")}。`,
    },
    {
      question: "块对角矩阵中的零块表达什么？",
      answer: "对应输入组与输出组之间没有直接耦合，两条子系统通路可以分别处理。",
    },
    {
      question: "块上三角系统通常先解哪一条块方程？",
      answer: "先解只含第二组未知量的下面块方程，再回代到上面块方程。",
    },
  ],
  summary: [
    "分块由问题中的自然分组决定，切割线必须沿完整行列。",
    "块加法要求相同切法；块乘法继续执行块行乘块列。",
    "每个输出块只读取一条块行和一条块列，但内部矩阵顺序不可交换。",
    "零块把缺失的依赖关系直接写进矩阵形状。",
    "下一节把一次行列操作编码成可逆的初等矩阵。",
  ],
  exercises: [
    "把一个 5×7 矩阵按行数 2+3、列数 4+3 分块，写出四个块的尺寸。",
    `验证 ${texInline("\\operatorname{diag}(A,D)\\operatorname{diag}(A^{-1},D^{-1})=\\operatorname{diag}(I,I)")}。`,
    "构造一个块上三角系统，先解下面块方程，再完成块回代。",
  ],
});

defineChapter4Section("block-elementary-applications", {
  number: "§7",
  textbookSection: "分块乘法的初等变换及应用举例",
  title: "分块乘法的初等变换及应用举例",
  navTitle: "分块初等变换与应用",
  question: "怎样用一次合法的块行操作消去耦合块，并从消元过程自然得到 Schur 补？",
  goal:
    "掌握块初等操作的尺寸条件；会在 A 可逆时消去 C，写出 Schur 补和变换后的右端，并按块完成求解与回代。",
  tags: ["块行操作", "块高斯消元", "Schur 补", "耦合系统"],
  intro:
    "普通高斯消元用主元消去同列中的其他元素。块高斯消元把主元升级为可逆方块 A，用乘子 CA⁻¹ 消去左下块 C。消元后右下角出现 D−CA⁻¹B；它记录消去 x 后，y 所面对的有效系数。",
  concepts: [
    {
      label: "块系统",
      text: `${texInline("\\begin{bmatrix}A&B\\\\C&D\\end{bmatrix}\\begin{bmatrix}x\\\\y\\end{bmatrix}=\\begin{bmatrix}f\\\\g\\end{bmatrix}")} 表示 ${texInline("Ax+By=f")}、${texInline("Cx+Dy=g")}。`,
    },
    {
      label: "块乘子",
      text: `A 可逆时，${texInline("M=CA^{-1}")} 的尺寸与 C 相同，能够执行 ${texInline("R_2\\leftarrow R_2-MR_1")}。`,
    },
    {
      label: "块初等矩阵",
      text: `${texInline("E=\\begin{bmatrix}I&0\\\\-CA^{-1}&I\\end{bmatrix}")} 可逆，逆矩阵把负号改为正号。`,
    },
   {
     label: "Schur 补",
      text: `左乘 E 后右下块变为 ${texInline("S=D-CA^{-1}B")}；S 是原块矩阵关于 A 的 Schur 补。`,
    },
    {
      label: "右端同步",
      text: `同一块行操作把右端变为 ${texInline("g-CA^{-1}f")}；系数块与右端必须同步更新。`,
    },
    {
      label: "按块求解",
      text: `先解 ${texInline("Sy=g-CA^{-1}f")}，再由 ${texInline("x=A^{-1}(f-By)")} 回代。`,
    },
    {
      label: "行列式应用",
      text: `A 可逆时，块三角化给出 ${texInline("\\det\\begin{bmatrix}A&B\\\\C&D\\end{bmatrix}=\\det(A)\\det(S)")}。`,
    },
  ],
  textbook: {
    reference: "Strang · Lay · Friedberg",
    page: "Strang Ch.2 block elimination；Lay §2.4；Friedberg §3.1",
    items: [
      "Strang：从普通消元矩阵推广到块消元，Schur 补就是消元后的新主块。",
      "Lay：分块矩阵服务于自然分组的系统，块行乘块列始终携带尺寸。",
      "Friedberg：初等矩阵的可逆性保证块行操作保持方程组等价。",
      "本站应用：同一套块消元同时完成结构三角化、右端更新和两组变量的求解。",
    ],
  },
  interactive: {
    type: "slot",
    title: "块高斯消元工作台",
    description:
      "先通过尺寸闸门，再构造块初等矩阵，逐步追踪 C 被消去、Schur 补出现、右端同步改变和最终回代。",
    task:
      "固定 A 为 p×p 可逆块，B 为 p×q、C 为 q×p、D 为 q×q；确认 CA⁻¹ 的尺寸为 q×p，并完成四步块消元。",
    prompts: [
      "在尺寸闸门中解释为什么乘子必须是 q×p。",
      "写出 E 与 E⁻¹，确认块行倍加可以撤销。",
      "在消元步骤中分别核对左下块 0、右下块 S 和新右端。",
      "完成 Sy 的求解后，回到第一条块方程求 x。",
    ],
  },
  example: {
    title: "例题：用 Schur 补解两组二维未知量",
    question: `设 ${texInline("A=2I_2")}，${texInline("B=C=I_2")}，${texInline("D=3I_2")}，${texInline("f=(4,2)^T")}，${texInline("g=(1,5)^T")}。用块消元解 ${texInline("2x+y=f")}、${texInline("x+3y=g")}。`,
    choices: [
      {
        correct: true,
        text: `${texInline("S=\\frac52I_2")}，${texInline("y=(-\\frac25,\\frac85)^T")}，${texInline("x=(\\frac{11}5,\\frac15)^T")}。`,
      },
      {
        text: `${texInline("S=5I_2")}，${texInline("y=(-\\frac15,\\frac45)^T")}；计算 Schur 补时应把 A 而非 A⁻¹放在中间。`,
      },
      {
        text: `${texInline("S=\\frac72I_2")}，因为 ${texInline("D+CA^{-1}B")} 才能消去左下块。`,
      },
      {
        text: "B 与 C 非零，所以不能进行块消元，只能展开成四元方程组。",
      },
    ],
    steps: [
      `A⁻¹=${texInline("\\frac12I_2")}，因此块乘子 ${texInline("CA^{-1}=\\frac12I_2")}。`,
      `Schur 补为 ${texInline("S=D-CA^{-1}B=3I_2-\\frac12I_2=\\frac52I_2")}。`,
      `消元后的右端为 ${texInline("g-CA^{-1}f=(1,5)^T-\\frac12(4,2)^T=(-1,4)^T")}。`,
      `解 ${texInline("Sy=(-1,4)^T")} 得 ${texInline("y=(-\\frac25,\\frac85)^T")}。`,
      `回代第一式：${texInline("x=A^{-1}(f-By)=\\frac12((4,2)^T-y)=(\\frac{11}5,\\frac15)^T")}。`,
      `代回第二式：${texInline("x+3y=(1,5)^T=g")}；两条块方程同时成立。`,
    ],
    audit: {
      a: [[2, 0], [0, 2]],
      b: [[1, 0], [0, 1]],
      c: [[1, 0], [0, 1]],
      d: [[3, 0], [0, 3]],
      f: [4, 2],
      g: [1, 5],
      schur: [[2.5, 0], [0, 2.5]],
      reducedRhs: [-1, 4],
      x: [2.2, 0.2],
      y: [-0.4, 1.6],
    },
  },
  quiz: [
    {
      question: `若 A 是 p×p、C 是 q×p，${texInline("CA^{-1}")} 的尺寸是什么？`,
      answer: `${texInline("q\\times p")}；它能把高度 p 的第一块行送到高度 q 的第二块行。`,
    },
    {
      question: `为什么 ${texInline("R_2\\leftarrow R_2-CA^{-1}R_1")} 会消去 C？`,
      answer: `左下块变为 ${texInline("C-CA^{-1}A=C-C=0")}。`,
    },
    {
      question: "块行操作后，右端为什么也必须改变？",
      answer: "它作用于整条块方程；第二个右端同步变为 g−CA⁻¹f，方程组才保持等价。",
    },
    {
      question: "Schur 补 S 表达什么？",
      answer: "它是消去 x 后，变量组 y 在第二条约化块方程中面对的有效系数。",
    },
    {
      question: "构造原块矩阵关于 A 的 Schur 补需要什么前提？",
      answer: "A 必须可逆，才能形成 CA⁻¹ 并把 A 作为块主元。",
    },
    {
      question: `A 可逆时，原块矩阵的行列式怎样分解？`,
      answer: `${texInline("\\det(M)=\\det(A)\\det(S)")}；块消元把 M 化为块上三角矩阵。`,
    },
  ],
  summary: [
    "块初等操作沿用普通行操作的逻辑，同时严格携带每个块的尺寸。",
    `${texInline("E=\\begin{bmatrix}I&0\\\\-CA^{-1}&I\\end{bmatrix}")} 把左下块 C 消为 0。`,
    `${texInline("S=D-CA^{-1}B")} 是消元后 y 的有效系数，而新右端是 ${texInline("g-CA^{-1}f")}。`,
    "先解 Schur 补方程，再回代求 x，完成结构化高斯消元。",
    "这一过程把分块、逆矩阵、初等矩阵和方程求解收束成同一条计算主线。",
  ],
  exercises: [
    `直接乘法验证 ${texInline("\\begin{bmatrix}I&0\\\\-CA^{-1}&I\\end{bmatrix}\\begin{bmatrix}A&B\\\\C&D\\end{bmatrix}=\\begin{bmatrix}A&B\\\\0&S\\end{bmatrix}")}。`,
    "交换两组变量，写出 D 可逆时关于 D 的另一个 Schur 补。",
    "用块三角化证明 det(M)=det(A)det(S)，并说明哪些步骤使用了 A 可逆。",
  ],
});
