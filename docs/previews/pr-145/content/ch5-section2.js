defineChapter5Section("quadratic-standard-form", {
  number: "§2",
  textbookSection: "标准形",
  title: "标准形",
  navTitle: "标准形",
  question: "为什么交叉项可以通过非退化变量替换消去？怎样在保留二次型结构的同时，把它化成平方项之和？",
  goal: "理解标准形是无交叉项的对角形式；会用配方法与成对初等变换化标准形；记录可逆变量替换；区分“存在”与“唯一”。",
  tags: ["标准形", "配方法", "合同消元", "秩"],
  intro:
    "标准形把二次型写成只含平方项的对角形式。主要方法是配方法，以及与之等价的合同初等变换：对对称矩阵做一次行操作时，必须同步做对应的列操作，才能保持对称并对应合法变量替换。",
  videoPlan: {
    title: "交叉项如何消失",
    duration: "约 2—3 分钟",
    scenes: [
      "含交叉项的等高线倾斜。",
      "配方逐步完成平方并定义新变量。",
      "累积替换矩阵 C，CᵀAC 变为对角。",
    ],
  },
  concepts: [
    {
      label: "标准形",
      text: `经非退化替换后化为 ${texInline("f=d_1y_1^2+\\cdots+d_ry_r^2")}（${texInline("d_i\\neq0")}）。非零项个数 ${texInline("r")} 等于二次型的秩。`,
    },
    {
      label: "配方法",
      text: "选取非零平方项为主项，收集含该变量的全部项，完成平方并引入新变量；对剩余二次型继续。",
    },
    {
      label: "无平方项起步",
      text: `若先出现 ${texInline("2ax_ix_j")} 而无平方项，可先用和差替换 ${texInline("y_i=x_i+x_j")}、${texInline("y_j=x_i-x_j")} 再配方。`,
    },
    {
      label: "合同初等变换",
      text: "交换、倍乘、倍加都必须行、列成对进行，对应可逆替换的逐步累积。",
    },
    {
      label: "不唯一",
      text: `标准形的具体系数一般不唯一：令 ${texInline("y_i=kz_i")}（${texInline("k\\neq0")}），系数 ${texInline("d_i")} 变为 ${texInline("k^2d_i")}。`,
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第五章",
    page: "",
    items: ["二次型的标准形", "配方法", "矩阵形式的合同变换", "标准形与秩"],
  },
  interactive: {
    type: "slot",
    title: "实验：配方步进与对称消元",
    description: "逐步完成配方，同步更新多项式、替换矩阵与当前对称矩阵；也可用成对初等变换消去交叉项。",
    task: `走完一个含交叉项的二元例子，确认累积 ${texInline("C")} 可逆且最终交叉项为 0。`,
    prompts: [
      `先观察 ${texInline("b\\neq0")} 时等高线倾斜。`,
      "按步进器完成平方并记录新变量。",
      "切换到对称消元，看行列同步操作。",
    ],
  },
  example: {
    title: "例题：配方法",
    question: `用配方法化 ${texInline("f=x_1^2+4x_1x_2+5x_2^2")} 为标准形，并写出可逆变量替换。`,
    choices: [
      {
        correct: true,
        text: `${texInline("f=y_1^2+y_2^2")}，其中 ${texInline("y_1=x_1+2x_2")}，${texInline("y_2=x_2")}（或等价的可逆替换）。`,
      },
      {
        text: `${texInline("f=y_1^2+y_2^2")}，但不必检查替换是否可逆。`,
      },
      {
        text: "只能通过正交旋转化标准形，配方法对本题不适用。",
      },
      {
        text: "标准形系数唯一，因此只有一种写法。",
      },
    ],
    steps: [
      `以 ${texInline("x_1^2")} 为主项：${texInline("f=(x_1+2x_2)^2+x_2^2")}。`,
      `令 ${texInline("y_1=x_1+2x_2")}，${texInline("y_2=x_2")}，则 ${texInline("f=y_1^2+y_2^2")}。`,
      `反解 ${texInline("x_1=y_1-2y_2")}，${texInline("x_2=y_2")}，替换矩阵可逆。`,
      `对应合同后矩阵为 ${texInline("\\operatorname{diag}(1,1)")}，交叉项消失。`,
      `系数还可经缩放改变：令 ${texInline("y_2=2z_2")}，得 ${texInline("f=y_1^2+4z_2^2")}，仍是标准形。`,
    ],
  },
  quiz: [
    {
      question: "标准形中非零平方项的个数等于什么？",
      answer: "等于二次型的秩。",
    },
    {
      question: "合同初等变换为什么要行列成对操作？",
      answer: "才能保持对称，并对应两侧同时出现的变量替换因子。",
    },
    {
      question: "标准形的系数是否唯一？",
      answer: `一般不唯一。例如 ${texInline("y_1^2+y_2^2")} 中令 ${texInline("y_2=2z_2")}，得 ${texInline("y_1^2+4z_2^2")}；不变的是正、负平方项的个数。`,
    },
    {
      question: "没有平方项只有交叉项时，常见第一步是什么？",
      answer: "先做和差型替换，使平方项出现，再配方。",
    },
  ],
  summary: [
    "标准形是无交叉项的对角二次型；非零项个数等于秩。",
    "配方法与成对合同初等变换是同一过程的两种语言。",
    `变量替换必须可逆；要记录累积矩阵 ${texInline("C")}。`,
    "标准形存在，但系数一般不唯一。",
  ],
  exercises: [
    `对 ${texInline("f=2x_1x_2")} 先做和差替换再化标准形。`,
    `用成对初等变换把一个 ${texInline("2\\times2")} 对称矩阵化到对角。`,
  ],
});
