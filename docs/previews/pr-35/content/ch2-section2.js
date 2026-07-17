defineChapter2Section("permutations", {
  number: "§2",
  textbookSection: "排列",
  title: "排列",
  navTitle: "排列",
  question: "行列式展开时，每行每列各取一个元素，为什么不同取法必须带上不同的正负号？",
  goal: "掌握排列、逆序对、逆序数与奇偶性；看见相邻交换怎样改变奇偶性，并把排列符号连接到行列式乘积项。",
  tags: ["排列", "逆序数", "相邻交换"],
  intro:
    `从第 1 行到第 n 行依次选取元素时，被选中的列指标组成一个排列。排列中的“交叉程度”由逆序数计量，奇偶性决定乘积项前面的符号 ${texInline("\\operatorname{sgn}(\\sigma)")}。`,
  concepts: [
    { label: "排列", text: `${texInline("1,2,\\ldots,n")} 的一个全排列可写成 ${texInline("\\sigma=(\\sigma(1),\\ldots,\\sigma(n))")}。` },
    { label: "逆序对", text: `当 ${texInline("i<j")} 但 ${texInline("\\sigma(i)>\\sigma(j)")} 时，位置 ${texInline("(i,j)")} 构成逆序。` },
    { label: "逆序数", text: `${texInline("\\tau(\\sigma)")} 是全部逆序对的个数。` },
    { label: "奇偶性", text: "逆序数为偶数时称偶排列，为奇数时称奇排列。" },
    { label: "排列符号", text: `${texInline("\\operatorname{sgn}(\\sigma)=(-1)^{\\tau(\\sigma)}")}。` },
    { label: "对换", text: "一次对换会翻转排列奇偶性；相邻交换给出最清楚的逐步观察。" },
  ],
  textbook: {
    reference: "北大版《高等代数》第二章 §2",
    page: "",
    items: ["排列", "逆序数", "奇偶性", "对换改变奇偶性"],
  },
  interactive: {
    type: "slot",
    title: "实验：排列奇偶实验室",
    description: "重排数字卡片，用逆序扫描器与连线图观察交叉，并逐步做相邻交换。",
    task: "把 3142 还原为 1234，记录每一步逆序数与符号怎样变化。",
    prompts: [
      "先扫描 3142 的全部位置对，确认三个逆序。",
      "查看连线图：每个交叉对应一个逆序对。",
      "点击两个位置做一次对换，观察奇偶性翻转。",
      "使用相邻交换步进器还原排列，比较步数与初始逆序数。",
    ],
  },
  example: {
    title: "例题：逆序数、符号与一次交换",
    question: `设 ${texInline("\\sigma=(3,1,4,2)")}。列出逆序对，求 ${texInline("\\tau(\\sigma)")} 与 ${texInline("\\operatorname{sgn}(\\sigma)")}；再交换最后两个位置。`,
    choices: [
      { correct: true, text: "逆序对为 (3,1)、(3,2)、(4,2)，τ=3，符号为 −1；交换最后两个位置后变为偶排列。" },
      { text: "只有 (3,1) 一个逆序，τ=1。" },
      { text: "τ 等于排列中的最大数 4，因此符号为 +1。" },
      { text: "交换任意两个位置不会改变奇偶性。" },
    ],
    steps: [
      "从左向右扫描：3 的右侧有 1、2 比它小；4 的右侧有 2 比它小。",
      "全部逆序对为 (3,1)、(3,2)、(4,2)，所以 τ=3。",
      `因此 ${texInline("\\operatorname{sgn}(\\sigma)=(-1)^3=-1")}。`,
      "交换最后两个位置得到 3124，逆序数变为 2，奇偶性翻转。",
    ],
  },
  quiz: [
    { question: "n 个元素一共有多少个排列？", answer: `${texInline("n!")} 个。` },
    { question: "排列 231 的逆序数是多少？", answer: "2，逆序对为 (2,1)、(3,1)。" },
    { question: "完全逆序 n…21 的逆序数是多少？", answer: `${texInline("\\binom{n}{2}=n(n-1)/2")}。` },
    { question: "一次相邻交换对符号有什么影响？", answer: "符号乘以 −1。" },
    { question: `乘积 ${texInline("a_{12}a_{23}a_{31}")} 对应哪个列指标排列？`, answer: "231。" },
  ],
  summary: [
    "排列记录每一行所选取的列。",
    "逆序数的奇偶决定排列符号。",
    "每次对换都会翻转奇偶性，连线交叉给出直观计数。",
    "下一节把合法取项与排列符号合成 n 阶行列式的定义。",
  ],
  exercises: [
    "写出 3 阶全部 6 个排列及其符号。",
    "把 4213 用相邻交换还原为 1234，并核对交换次数的奇偶性。",
  ],
});
