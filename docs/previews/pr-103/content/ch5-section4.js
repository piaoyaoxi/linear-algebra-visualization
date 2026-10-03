defineChapter5Section("positive-definite", {
  number: "§4",
  textbookSection: "正定二次型",
  title: "正定二次型",
  navTitle: "正定二次型",
  question: "怎样不用遍历所有非零向量，就严格判断 xᵀAx 是否始终大于 0？临界状态从正定到半正定再到不定时，究竟发生了什么？",
  goal: "定义五种符号类型；用标准形/惯性判断正定；掌握顺序主子式判别法；识别错误判据；理解 Gram 与 Cholesky 作为结构连接。",
  tags: ["正定", "顺序主子式", "半正定边界", "Gram"],
  intro:
    "正定意味着每个非零方向上二次型值都严格为正。有限个向量抽样永远不够；需要结构性判据：标准形全正、正惯性指数等于 n，或实对称矩阵的顺序主子式全为正。半正定不能简单把“全正”改成“全非负顺序主子式”。",
  videoPlan: {
    title: "方向值何时永远在零上方",
    duration: "约 2 分钟",
    scenes: [
      "单位圆扫描 q(θ)。",
      "Δ₁、Δ₂ 仪表与临界边界。",
      "Gram 矩阵：||Bx||²≥0。",
    ],
  },
  concepts: [
    {
      label: "正定",
      text: `实对称 ${texInline("A")} 正定：对一切 ${texInline("x\\neq0")} 有 ${texInline("x^TAx>0")}；此时也称二次型正定。`,
    },
    {
      label: "五种类型",
      text: "正定、半正定、负定、半负定、不定，按非零方向上取值的符号结构划分。",
    },
    {
      label: "标准形判据",
      text: "正定 ⇔ 标准形全部系数为正 ⇔ 正惯性指数 p=n。",
    },
    {
      label: "顺序主子式",
      text: `Sylvester 判据：正定 ⇔ 左上角顺序主子式 ${texInline("\\Delta_1,\\ldots,\\Delta_n")} 全大于 0。`,
    },
    {
      label: "二阶情形",
      text: `${texInline("A=\\begin{bmatrix}a&b\\\\b&c\\end{bmatrix}")} 正定 ⇔ ${texInline("a>0")} 且 ${texInline("ac-b^2>0")}。`,
    },
    {
      label: "Gram / Cholesky",
      text: `${texInline("B^TB")} 半正定，列满秩时正定；正定矩阵可写 ${texInline("A=R^TR")}（Cholesky），给出 ||Rx||² 结构解释。`,
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第五章",
    page: "",
    items: ["正定二次型与正定矩阵", "用标准形判断正定", "顺序主子式判别法", "正定矩阵的性质"],
  },
  interactive: {
    type: "slot",
    title: "实验：正定性实验室",
    description: "调节 a、b、c，同步查看曲面/等高线、单位圆方向值、顺序主子式与分类；预设覆盖临界状态。",
    task: "把交叉项 b 逐渐增大，观察何时 Δ₂ 变号并进入不定；再对比半正定山谷。",
    prompts: [
      "单位矩阵：全程正定。",
      "增大 |b| 直到 ac−b²=0。",
      "切换半正定与不定预设，读 q(θ) 曲线。",
    ],
  },
  example: {
    title: "例题：参数范围与顺序主子式",
    question: `设 ${texInline("f=x_1^2+2\\lambda x_1x_2+4x_2^2")}。求使 f 正定的实参数 ${texInline("\\lambda")} 的范围。`,
    choices: [
      {
        correct: true,
        text: `${texInline("|\\lambda|<2")}，因为 ${texInline("\\Delta_1=1>0")} 且 ${texInline("\\Delta_2=4-\\lambda^2>0")}。`,
      },
      {
        text: `${texInline("|\\lambda|\\le 2")}，端点也算正定。`,
      },
      {
        text: "只要对角元 1 与 4 都为正即可，λ 任意。",
      },
      {
        text: "只要行列式 4−λ² 非负即可。",
      },
    ],
    steps: [
      "对称矩阵为 [[1,λ],[λ,4]]。",
      "Δ₁=1>0 恒成立。",
      "Δ₂=4−λ²>0 ⇒ |λ|<2。",
      "端点 |λ|=2 时 Δ₂=0，退化为半正定而非正定。",
      "也可用配方法：f=(x₁+λx₂)²+(4−λ²)x₂²，需 4−λ²>0。",
    ],
  },
  quiz: [
    {
      question: "有限个测试向量全为正，能否断定正定？",
      answer: "不能。非零方向有无穷多个，需要结构性判据。",
    },
    {
      question: "顺序主子式全非负是否保证半正定？",
      answer: "不能把正定判据简单改成“全非负顺序主子式”。半正定需要更细的条件（例如一切主子式非负等）。",
    },
    {
      question: "对角元都为正是否保证正定？",
      answer: "不保证。交叉项过大可使矩阵不定。",
    },
    {
      question: "行列式为正是否保证正定？",
      answer: "不保证。例如 diag(−1,−1) 行列式为正但是负定。",
    },
    {
      question: "正定与 p=n 的关系？",
      answer: "实对称正定当且仅当正惯性指数等于矩阵阶数 n。",
    },
    {
      question: "为什么 BᵀB 半正定？",
      answer: "因为 xᵀ(BᵀB)x=||Bx||²≥0。",
    },
  ],
  summary: [
    "正定要求一切非零方向上二次型严格为正。",
    "可用标准形、惯性 p=n 或顺序主子式全正来判定。",
    "常见误区：只看对角元、只看行列式、误用半正定的顺序主子式口诀。",
    "Gram 与 Cholesky 解释正定结构，但不取代本章的代数主线。",
  ],
  exercises: [
    "用顺序主子式判断一个 3 阶实对称矩阵是否正定。",
    "给出“元素全正但不定”的 2 阶例子。",
  ],
});
