defineChapter2Section("n-order-determinant", {
  number: "§3",
  textbookSection: "n 阶行列式",
  title: "n 阶行列式",
  navTitle: "n 阶行列式",
  question: "怎样把二阶的 ad-bc 推广到 n 阶，同时保证每一行、每一列都恰好参与一次？",
  goal: "从合法选取路径建立 Leibniz 定义：每行取一个元素，所用列组成一个排列，乘积项乘上该排列的符号，再对全部排列求和。",
  tags: ["Leibniz 公式", "合法项", "三角形行列式"],
  prerequisites: [
    "会计算排列的逆序数与符号。",
    "理解求和符号和乘积符号。",
  ],
  objectives: [
    "判断一个乘积是否满足每行、每列各取一次。",
    "由排列写出对应乘积项及其符号。",
    "用合法路径说明上三角行列式等于主对角线乘积。",
  ],
  intro:
    "n 阶行列式的每项都要代表一次完整匹配：第 i 行选择第 σ(i) 列。σ 必须是排列，才能让所有列恰好使用一次；上一节的排列符号决定这一项的正负。",
  concepts: [
    { label: "合法路径", text: "每行选一个元素，并且每列恰好被选一次。" },
    { label: "排列项", text: `${texInline("\\operatorname{sgn}(\\sigma)\\prod_i a_{i\\sigma(i)}")}。` },
    { label: "定义", text: `对 ${texInline("S_n")} 中全部 ${texInline("n!")} 个排列项求和。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第二章 §3 · Strang 第 5 章 · Hoffman–Kunze 第 5 章",
    page: "",
    items: ["n 阶行列式定义", "三阶展开", "三角形行列式"],
  },
  story: {
    title: "Leibniz 定义：把全部合法匹配带符号求和",
    lead: "一条合法路径从每一行取一个元素，同时不重复任何一列。这样的路径与排列一一对应，因此共有 n! 条。",
    modules: [
      {
        number: "01",
        title: "先确定哪些乘积有资格出现",
        subtitle: "行指标固定为 1 到 n，列指标必须构成一个排列。",
        blocks: [
          {
            type: "definitions",
            items: [
              { kicker: "每行一次", title: texInline("a_{1\\sigma(1)}a_{2\\sigma(2)}\\cdots a_{n\\sigma(n)}"), text: "乘积中的第 i 个因子来自第 i 行。" },
              { kicker: "每列一次", title: texInline("\\{\\sigma(1),\\ldots,\\sigma(n)\\}=\\{1,\\ldots,n\\}"), text: "列指标没有遗漏也没有重复，因此 σ 是一个排列。" },
              { kicker: "符号一次", title: texInline("\\operatorname{sgn}(\\sigma)"), text: "列选择产生的交叉奇偶性决定这一项前的正负号。" },
            ],
          },
          {
            type: "misconception",
            items: [
              `${texInline("a_{11}a_{22}a_{23}")} 重复使用第 2 行并遗漏第 3 行，因此不属于三阶定义中的项。`,
              "在重复矩阵上画斜线只适用于记忆三阶展开；n 阶定义始终以排列为准。",
            ],
          },
        ],
      },
      {
        number: "02",
        title: "统一定义",
        subtitle: "把所有合法路径的带符号贡献相加。",
        blocks: [
          {
            type: "formula",
            kicker: "Leibniz 公式",
            formula: texDisplay("\\det(A)=\\sum_{\\sigma\\in S_n}\\operatorname{sgn}(\\sigma)\\prod_{i=1}^{n}a_{i\\sigma(i)}"),
            text: `${texInline("S_n")} 含有全部 n 阶排列。每个排列给出一条且仅一条合法路径，因此求和恰好含 ${texInline("n!")} 项。`,
          },
          {
            type: "cards",
            items: [
              { kicker: "n=2", title: "两条合法路径", text: `${texInline("a_{11}a_{22}")} 与 ${texInline("a_{12}a_{21}")} 的排列符号分别为 +、-。` },
              { kicker: "n=3", title: "六条合法路径", text: "三条偶排列路径取正号，三条奇排列路径取负号。" },
              { kicker: "一般 n", title: `${texInline("n!")} 条路径`, text: "公式适合定义与证明，直接计算时通常改用行列式性质。" },
            ],
          },
        ],
      },
      {
        number: "03",
        title: "上三角为什么只剩主对角线",
        subtitle: "零元素会阻断所有非恒等排列路径。",
        blocks: [
          {
            type: "proof",
            items: [
              `设 A 为上三角矩阵；若一条路径选择了 ${texInline("\\sigma(i)<i")}，对应元素位于主对角线下方，因而为 0。`,
              `任何非恒等排列都存在某个 i 使 ${texInline("\\sigma(i)<i")}；否则所有 ${texInline("\\sigma(i)\\ge i")} 只能同时取等号。`,
              "因此全部非恒等排列项都含零因子。",
              `唯一保留的是恒等排列，得到 ${texInline("\\det(A)=a_{11}a_{22}\\cdots a_{nn}")}。`,
            ],
          },
          {
            type: "note",
            title: "计算方向",
            text: "定义展示结构，性质负责效率。后面会把一般矩阵通过保持可追踪倍率的行变换化成三角形。",
          },
        ],
      },
    ],
  },
  interactive: {
    type: "slot",
    visualTitle: "Leibniz 取项台 · 从矩阵选出一个排列",
    description: "每行点击一个元素；系统同步检查列是否重复、读取排列、计算符号并显示该项贡献。",
    task: "先判断重复选列的路径是否属于定义，再构造排列 231；最后切换上三角矩阵，观察非恒等路径如何被零阻断。",
    prediction: {
      question: "若一条路径在不同的两行都选择了第 2 列，它会怎样进入 Leibniz 求和？",
      options: [
        { label: "不属于合法项", correct: true, feedback: "列指标必须构成排列；重复第 2 列意味着还会遗漏另一列。" },
        { label: "作为正项加入", feedback: "先检查列指标：重复一列时，它们不能组成排列。" },
        { label: "作为负项加入", feedback: "正负号只分配给合法排列；重复选列的路径没有排列符号。" },
      ],
    },
    prompts: [
      "构造排列 231，先算逆序数，再核对系统符号。",
      "故意重复一列，说明系统为什么拒绝这条路径。",
      "切换上三角视图，寻找一条仍然非零的非恒等路径。",
    ],
  },
  example: {
    title: "从一个乘积项反读排列与符号",
    question: `在三阶行列式中，判断乘积 ${texInline("a_{12}a_{23}a_{31}")} 是否为合法项；若合法，写出对应排列、逆序数和符号。`,
    steps: [
      "三个因子依次来自第 1、2、3 行，满足每行一次。",
      "列指标依次为 2、3、1，恰好使用三列各一次，因此对应排列 231。",
      "231 的逆序对位置为 (1,3)、(2,3)，逆序数为 2。",
      `排列为偶排列，所以该项以正号 ${texInline("+a_{12}a_{23}a_{31}")} 出现。`,
    ],
  },
  quiz: [
    { question: "n 阶 Leibniz 定义为什么恰有 n! 个乘积项？", answer: "合法路径与 n 个列指标的排列一一对应，而 n 阶排列共有 n! 个。" },
    { question: `${texInline("a_{11}a_{23}a_{32}")} 在三阶行列式中是否合法？符号是什么？`, answer: "合法，对应排列 132；逆序数为 1，因此符号为负。" },
    { question: "Sarrus 规则为什么不能作为一般 n 阶定义？", answer: "它只编码三阶的六条路径；一般定义需要遍历 S_n 中的全部排列。" },
    { question: "上三角行列式为什么等于主对角线乘积？", answer: "任何非恒等排列都选到至少一个主对角线下方的零元素，只剩恒等排列项。" },
  ],
  summary: [
    "合法乘积项要求每行、每列各取一次，因此由排列编号。",
    "排列符号给出每项的正负，全部 n! 个排列项之和定义行列式。",
    "三角结构会使所有非恒等排列项归零，只留下主对角线乘积。",
  ],
  bridge: "定义已经完整，但它仍显得庞大。下一节用三条母性质重新组织公式，并由此推出全部常用计算规则。",
  exercises: [
    "写出四阶行列式中排列 2413 对应的乘积项和符号。",
    "证明下三角行列式同样等于主对角线乘积。",
  ],
});
