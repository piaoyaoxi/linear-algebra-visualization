defineChapter3Section("solvability", {
  number: "§5",
  textbookSection: "线性方程组有解判别定理",
  title: "线性方程组有解判别定理",
  navTitle: "有解判别",
  question: "给定 Ax=b，怎样在真正求出所有未知量之前，就判断 b 是否能由 A 的列组合出来？",
  goal: "把 Ax=b 理解为列的线性组合；掌握 rank(A)=rank([A|b]) 与 b∈Col(A)；能从矛盾行识别无解，并理解齐次系统总有零解。",
  tags: ["列空间", "增广秩", "矛盾行", "齐次系统"],
  intro:
    "有解与否，先问目标向量 b 是否落在列空间中。比较 A 与 [A|b] 的秩，就是在检查加入 b 以后是否出现了新的独立方向。",
  videoPlan: {
    title: "b 是目标点",
    duration: "约 2 分钟",
    scenes: ["列组合到达 b", "增广秩比较", "拖动 b 穿越列空间边界"],
  },
  concepts: [
    {
      label: "列组合",
      text: `${texInline("Ax=b")} 即 ${texInline("x_1a_1+\\cdots+x_na_n=b")}。`,
    },
    {
      label: "有解判别",
      text: `${texInline("\\operatorname{rank}(A)=\\operatorname{rank}([A|b])")} 当且仅当方程组有解。`,
    },
    {
      label: "列空间语言",
      text: `有解等价于 ${texInline("b\\in \\operatorname{Col}(A)")}。`,
    },
    {
      label: "矛盾行",
      text: "消元后出现 0=非零，说明增广秩严格更大，无解。",
    },
    {
      label: "齐次系统",
      text: `${texInline("Ax=0")} 总有零解，因为零向量一定在列空间中。`,
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第三章",
    page: "",
    items: ["有解判别定理", "列空间与右端", "增广矩阵的秩", "齐次与非齐次", "超定系统"],
  },
  interactive: {
    type: "slot",
    title: "实验：有解闸门",
    description: "拖动目标向量 b，比较 rank(A) 与 rank([A|b])，并同步查看列空间与消元结论。",
    task: "在列空间为一条直线的预设中，把 b 拖到线上与线外，观察结论翻转。",
    prompts: [
      "选择“满列空间”，任意 b 都应有解。",
      "选择“直线列空间”，让 b 穿过该直线。",
      "切换齐次 b=0，确认总是有解。",
      "比较行视角（直线交点）与列视角（组合到 b）。",
    ],
  },
  example: {
    title: "例题：比较两个右端",
    question: `设 ${texInline("A=\\begin{bmatrix}1&1\\\\2&2\\\\1&-1\\end{bmatrix}")}，${texInline("b=(2,4,0)^T")}。判断 b 是否在列空间中；再改为 ${texInline("b'=(2,5,0)^T")}，解释结论如何变化。`,
    choices: [
      {
        correct: true,
        text: `对 b：rank(A)=rank([A|b])=2，有解；对 b'：增广秩变为 3，无解，因为 b' 不在列空间中。`,
      },
      {
        text: "方程个数多于未知量个数，所以两个右端都无解。",
      },
      {
        text: "方阵才谈有解判别，长方矩阵无法判断。",
      },
      {
        text: "只要 A 有两列，任意三维 b 都有解。",
      },
    ],
    steps: [
      "A 的两列独立，rank(A)=2。",
      "对 b=(2,4,0)^T，b 可由两列组合，增广秩仍为 2。",
      "对 b'=(2,5,0)^T，加入 b' 后出现新方向，增广秩为 3。",
      "因此前者有解，后者无解；超定本身不决定有无解。",
    ],
  },
  quiz: [
    {
      question: "有解判别定理的秩形式是什么？",
      answer: "rank(A)=rank([A|b])。",
    },
    {
      question: "为什么齐次方程一定有解？",
      answer: "b=0 属于任何列空间，零解总存在。",
    },
    {
      question: "矛盾行与增广秩有何关系？",
      answer: "矛盾行意味着 b 贡献了新的独立方向，增广秩更大。",
    },
    {
      question: "超定系统是否一定无解？",
      answer: "不一定。关键是 b 是否仍在列空间中。",
    },
    {
      question: "本节与下一节如何分工？",
      answer: "本节只判有无解；有几个解、如何参数化留给解的结构。",
    },
  ],
  summary: [
    "有解先看 b 是否落在列空间。",
    "比较 A 与 [A|b] 的秩，就是比较是否出现新方向。",
    "齐次系统总有零解，但不一定只有零解。",
    "下一节把有解系统的全部解写成特解加零空间。",
  ],
  exercises: [
    "构造一个超定但有解的 3×2 系统。",
    "把同一 A 配两个不同 b，分别得到有解与无解。",
  ],
});
