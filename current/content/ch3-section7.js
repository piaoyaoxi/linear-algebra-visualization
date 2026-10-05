defineChapter3Section("binary-higher-degree", {
  number: "＊§7",
  textbookSection: "二元高次方程组",
  title: "二元高次方程组",
  navTitle: "二元高次",
  question: "当方程不再线性时，消元思想还能怎样工作？怎样把两个变量的曲线交点问题压缩成一个变量的候选根问题？",
  goal: "理解二元多项式方程组的公共解是代数曲线交点；会选择消元变量；认识结式矩阵与结式；能够从结式得到候选根、回代求另一坐标并逐点验解，同时识别重根与次数退化。",
  tags: ["选学", "多项式消元", "结式矩阵", "结式", "回代验解"],
  intro:
    "把两个方程都看成关于 x 的多项式，系数是 y 的多项式。结式 R(y) 为 0 的 y 是交点纵坐标的候选；每个候选都要回代求 x，并代回两个原方程检验。",
  videoPlan: {
    title: "从直线交点到曲线交点",
    duration: "约 2.5 分钟",
    scenes: [
      "两条直线的消元逐渐过渡为圆与直线的消元。",
      "把 f、g 按 x 的次数排列系数，错位堆叠成结式矩阵。",
      "行列式化为只含 y 的结式多项式。",
      "候选 y 回代求 x，未验证点与已验证交点使用不同标记。",
    ],
  },
  concepts: [
    {
      label: "曲线交点",
      text: `${texInline(String.raw`f(x,y)=0`)} 与 ${texInline(String.raw`g(x,y)=0`)} 的公共解对应两条代数曲线的交点。`,
    },
    {
      label: "选择消元变量",
      text: "把 f、g 看成关于 x 的多项式时，其系数是 y 的多项式；也可以反过来消去 y。不同选择影响计算复杂度。",
    },
    {
      label: "结式矩阵",
      text: "把两多项式的系数按次数错位排列成方阵；其行列式就是关于被保留变量的结式。",
    },
    {
      label: "结式条件",
      text: `在次数保持正常时，${texInline(String.raw`\operatorname{Res}_x(f,g)=0`)} 等价于 f、g 关于 x 有公共根。`,
    },
    {
      label: "候选与验解",
      text: "先解结式得到保留变量候选，再回代求被消去变量；每个候选点必须代回原方程，特别留意首项系数为零、重根与复根。",
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第三章 ＊§7",
    page: "",
    items: ["二元高次方程组", "消元法", "结式", "回代与验解", "重根和退化情形"],
  },
  interactive: {
    type: "slot",
    title: "实验：从曲线交点到一元方程",
    description: "在相交、相切与无实交点三个预设中，逐步显示系数表、结式矩阵、结式、候选根和回代验证。",
    task: "先处理单位圆与直线 x=y，消去 x；再切换到抛物线与切线，观察结式出现重根并与相切几何对应。",
    prompts: [
      "逐步点击‘整理系数—构造矩阵—计算结式—求候选—回代验解’。",
      "比较相交预设的两个单根与相切预设的一个二重根。",
      "在无实交点预设中区分复候选与实平面中的交点。",
      "切换消元方向，确认最终通过验解的交点集合一致。",
    ],
  },
  example: {
    title: "例题：单位圆与直线的结式",
    question: `求 ${texInline(String.raw`x^2+y^2=1`)} 与 ${texInline(String.raw`x-y=0`)} 的公共实解。要求把两式看成关于 x 的多项式，写出结式矩阵与结式，并回代验解。`,
    choices: [
      {
        correct: true,
        text: `结式为 ${texInline(String.raw`2y^2-1`)}；故 ${texInline(String.raw`y=\pm\frac{\sqrt2}{2}`)}，由 ${texInline(String.raw`x=y`)} 得两个交点 ${texInline(String.raw`\left(\tfrac{\sqrt2}{2},\tfrac{\sqrt2}{2}\right)`)} 与 ${texInline(String.raw`\left(-\tfrac{\sqrt2}{2},-\tfrac{\sqrt2}{2}\right)`)}。`,
      },
      { text: "结式为零的每个根都自动对应原方程组解，无需回代。" },
      { text: "圆与直线的次数分别为 2 和 1，因此一定有三个实交点。" },
      { text: `消去 x 后只能得到 ${texInline(String.raw`y=0`)}。` },
    ],
    steps: [
      `写成 ${texInline(String.raw`f=x^2+(y^2-1)`)} 与 ${texInline(String.raw`g=x-y`)}。`,
      `结式矩阵可取 ${texInline(String.raw`\begin{bmatrix}1&0&y^2-1\\1&-y&0\\0&1&-y\end{bmatrix}`)}。`,
      `其行列式为 ${texInline(String.raw`2y^2-1`)}。`,
      `解得 ${texInline(String.raw`y=\pm\sqrt2/2`)}。`,
      `由 ${texInline(String.raw`x-y=0`)} 得 ${texInline(String.raw`x=y`)}。`,
      "把两点代回两个原方程，均成立，因此都是已验证实交点。",
    ],
  },
  quiz: [
    {
      question: `解 ${texInline("x^2+y^2=5,\\ xy=2")} 时，候选 y=1 给出 ${texInline("x^2=4")}。${texInline("(-2,1)")} 是解吗？`,
      answer: `不是。x 必须同时是 ${texInline("f(x,1)=x^2-4")} 与 ${texInline("g(x,1)=x-2")} 的根，只有 x=2。回代时要用两个方程。`,
    },
    {
      question: `${texInline("x^2+y^2=2")} 与 ${texInline("y=x^2")} 消去 x 得 ${texInline("R(y)=(y-1)^2(y+2)^2")}。二重根 y=1 表示两条曲线在那里相切吗？`,
      answer: "不是。y=1 对应两个横截交点 (1,1) 与 (−1,1)，它们纵坐标相同，所以 y=1 是二重根。y=−2 回代得 x=±√2 i，没有实交点。",
    },
    {
      question: `${texInline("xy=1")} 与 ${texInline("xy=2")} 消去 x 得 ${texInline("R(y)=-y")}。y=0 为什么不是解？`,
      answer: "两个方程关于 x 的首项系数都是 y，在 y=0 处同时为 0，结式的根在这里只是伪候选。回代得 0=1，不成立。",
    },
  ],
  summary: [
    "结式把两条曲线的交点问题化为一个单变量多项式的根。",
    "结式的根只是候选：可能对应复交点，也可能来自首项系数同时为零的伪候选。",
    "每个候选都要回代求另一坐标，并代回两个原方程检验。",
  ],
  exercises: [
    "对单位圆与 x=y 改为消去 y，比较两个结式矩阵与最终交点。",
    "研究 y=x² 与 y=2x−1，说明结式二重根为什么对应相切点。",
  ],
});
