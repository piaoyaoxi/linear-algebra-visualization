defineChapter3Section("linear-dependence", {
  number: "§3",
  textbookSection: "线性相关性",
  title: "线性相关性",
  navTitle: "线性相关性",
  question: "一组向量里，哪些向量真正带来了新方向？为什么多的向量由少的向量线性表出，就一定相关？",
  goal: "理解线性相关、线性无关与张成的关系；会写出具体的线性关系；理解“多的由少的线性表出必相关”，掌握极大无关组与向量组的秩。",
  tags: ["线性相关", "线性无关", "张成", "极大无关组", "向量组的秩"],
  intro:
    "一个向量带来新方向，当且仅当它不能由前面的向量组合出来。在三维空间里，这件事看得见：新向量一旦落进前两个向量张成的平面，平行六面体就被压扁，体积变成 0。",
  concepts: [
    { label: "线性相关", text: `存在不全为零的 ${texInline("k_1,\\dots,k_s")}，使 ${texInline("k_1\\alpha_1+\\cdots+k_s\\alpha_s=0")}。` },
    { label: "极大无关组", text: "向量组中一个线性无关、并且能表出全部向量的部分组。" },
  ],
  textbook: { reference: "北大版《高等代数》第三章 §3", items: ["线性相关与线性无关", "向量组的线性表出", "极大线性无关组与向量组的秩"] },
  interactive: { type: "slot", title: "第三个向量有没有带来新方向" },
  lesson3d: {
    blocks: [
      {
        title: "相关 ⇔ 某个向量可由前面的向量表出",
        tex: String.raw`k_1\alpha_1+\cdots+k_s\alpha_s=0\ \text{有非零解}\iff \text{存在 }j,\ \alpha_j\in\operatorname{span}\{\alpha_1,\dots,\alpha_{j-1}\}`,
        text: `注意：相关组里并不是每个向量都能由其余向量表出。例如 ${texInline("\\{u,2u,w\\}")} 相关，但 ${texInline("w")} 不在 ${texInline("\\operatorname{span}\\{u,2u\\}")} 里。`,
      },
      {
        title: "多的由少的线性表出，必然相关",
        text: `若 ${texInline("\\alpha_1,\\dots,\\alpha_r")} 都能由 ${texInline("\\beta_1,\\dots,\\beta_s")} 线性表出，并且 ${texInline("r>s")}，那么 ${texInline("\\alpha_1,\\dots,\\alpha_r")} 线性相关（教材 §3 定理 2）。直观地说，s 个向量最多提供 s 个方向，多出来的向量不可能都是新方向。特别地，${texInline("F^n")} 中任意 n+1 个向量都相关。`,
      },
      {
        title: "极大无关组与秩",
        text: "由这个定理，同一向量组的任意两个极大无关组所含向量个数相同。这个共同的个数叫作向量组的秩。极大无关组本身一般不唯一。",
      },
    ],
    pitfalls: [
      "以为相关就是有两个向量共线。三个向量可以两两不共线，却落在同一个平面里。",
      "用看图或近似数值判断相关：体积很小但不为 0，仍然线性无关。",
      "以为极大无关组是唯一的。",
    ],
  },
  example: {
    title: "例题：求秩与全部极大无关组",
    question: `${texInline("v_1=(1,0,1)")}，${texInline("v_2=(0,1,1)")}，${texInline("v_3=(1,1,2)")}，${texInline("v_4=(1,-1,0)")}。这组向量的秩是多少？哪些部分组是极大无关组？`,
    choices: [
      { correct: true, text: "秩为 2；四个向量都在平面 x+y=z 上，任取两个都构成极大无关组，共 6 组。" },
      { text: `秩为 3；${texInline("\\{v_1,v_2,v_4\\}")} 是唯一的极大无关组。` },
      { text: `秩为 2；只有 ${texInline("\\{v_1,v_2\\}")} 是极大无关组。` },
      { text: "秩为 4，因为任意两个向量都不共线。" },
    ],
    steps: [
      `${texInline("v_3=v_1+v_2")}，${texInline("v_4=v_1-v_2")}，所以全部向量都能由 ${texInline("v_1,v_2")} 表出。`,
      `${texInline("v_1,v_2")} 不共线，线性无关，因此秩为 2。`,
      "四个向量的坐标都满足 x+y=z，它们在同一个过原点的平面上。",
      "任意两个向量都不共线，在这个平面里任取两个就能张成整个平面，所以 6 个两元部分组都是极大无关组。",
    ],
  },
  quiz: [
    {
      question: `${texInline("v_1,v_2,v_3")} 线性无关。${texInline("v_1+v_2,\\ v_2+v_3,\\ v_3+v_1")} 呢？${texInline("v_1-v_2,\\ v_2-v_3,\\ v_3-v_1")} 呢？`,
      answer: "第一组线性无关（系数矩阵的行列式为 2≠0）；第二组相关，三者之和为 0。",
    },
    {
      question: `${texInline("\\alpha_1,\\dots,\\alpha_4")} 都能由 ${texInline("\\beta_1,\\beta_2,\\beta_3")} 线性表出。α 组一定相关吗？`,
      answer: "一定相关：4 个向量由 3 个向量线性表出。",
    },
    {
      question: `实验里把 ${texInline("v_3")} 拖到 ${texInline("(1,1,1.5)")}，体积为 −0.5。这三个向量相关吗？`,
      answer: "不相关。体积不为 0，v₃ 不在平面里；看起来“几乎共面”不等于共面。",
    },
  ],
  summary: [
    "线性相关 ⇔ 存在非零组合等于 0 ⇔ 某个向量可由前面的向量表出。",
    "多的由少的线性表出，必然相关；因此极大无关组所含向量个数确定，这就是秩。",
    "下一节把秩搬到矩阵上：行向量组和列向量组的秩为什么相等。",
  ],
});
