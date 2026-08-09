defineChapter3Section("binary-higher-degree", {
  number: "＊§7",
  textbookSection: "二元高次方程组",
  title: "二元高次方程组",
  navTitle: "二元高次",
  question: "线性方程的行消元依赖一次项；面对两条代数曲线，怎样消去一个变量得到有限候选，又为什么必须回到原方程逐点确认？",
  goal: "把二元多项式方程组理解为代数曲线的公共点问题；会选择消元变量、按次数整理系数并构造 Sylvester 矩阵；理解结式给出的候选条件及次数退化边界，最后通过回代与验解确认公共解。",
  tags: ["选学", "多项式消元", "Sylvester 矩阵", "结式", "回代验解"],
  intro:
    "前六节的主线在解结构处已经闭合。本节只迁移其中一个算法动作：消去一个变量，再恢复被消去的信息。把 f、g 看成关于 x 的多项式时，它们的系数依赖 y；Sylvester 矩阵把“关于 x 有公共根”编码成只含 y 的结式。结式缩小候选集合，原方程负责最后确认。",
  videoPlan: {
    title: "从二维公共点到一元候选",
    duration: "约 2.5 分钟",
    scenes: [
      "先在平面上标出两条曲线的公共点。",
      "选择消去变量，把两个多项式按次数排成系数列。",
      "错位堆叠系数构成 Sylvester 矩阵，并计算结式。",
      "把候选根回代到两条原方程，区分候选点与已验证公共点。",
    ],
  },
  concepts: [
    {
      label: "公共点",
      text: `${texInline(String.raw`f(x,y)=0`)} 与 ${texInline(String.raw`g(x,y)=0`)} 的公共解同时位于两条代数曲线上。`,
    },
    {
      label: "选择消元变量",
      text: "把 f、g 看成关于 x 的多项式时，系数属于 F[y]；也可交换 x、y。次数和系数复杂度决定哪条路线更短。",
    },
    {
      label: "Sylvester 矩阵",
      text: "将两多项式的系数按次数错位排列成方阵；其行列式就是相对于所选消元变量的结式。",
    },
    {
      label: "候选条件",
      text: `在固定次数的正常情形下，${texInline(String.raw`\operatorname{Res}_x(f,g)=0`)} 表示两多项式关于 x 存在公共根；解它得到保留变量的候选值。`,
    },
    {
      label: "边界与验解",
      text: "首项系数消失会引起次数下降，候选还可能是复数或带有重数；每个实候选点都应代回两条原方程。",
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第三章 ＊§7",
    page: "",
    items: ["二元高次方程组", "消元变量的选择", "Sylvester 矩阵", "结式", "回代、重根与退化"],
  },
  interactive: {
    type: "slot",
    title: "实验：把公共点压缩成一元候选",
    description: "曲线、系数表、Sylvester 矩阵、结式、候选根和已验证解按同一顺序展开。",
    task: "先只看曲线并预测公共点个数；推进到结式后暂停，区分“候选根”和“已验证解”；最后回代，并比较相交、相切和无实交点三种预设。",
    prompts: [
      "在单位圆与 x=y 中分别选择消去 x、消去 y，比较中间矩阵与最终交点。",
      "在相切预设中观察结式的二重根，并回到图像解释接触重数。",
      "在无实交点预设中区分复候选与实平面中的公共点。",
      "找出流程中唯一能够确认真解的步骤。",
    ],
  },
  example: {
    title: "例题：单位圆与直线的结式",
    question: `求 ${texInline(String.raw`x^2+y^2=1`)} 与 ${texInline(String.raw`x-y=0`)} 的公共实解。把两式看成关于 x 的多项式，写出 Sylvester 矩阵、结式，并回代验解。`,
    choices: [
      {
        correct: true,
        text: `结式为 ${texInline(String.raw`2y^2-1`)}；故 ${texInline(String.raw`y=\pm\sqrt2/2`)}，由 ${texInline(String.raw`x=y`)} 得两点 ${texInline(String.raw`(\sqrt2/2,\sqrt2/2)`)} 与 ${texInline(String.raw`(-\sqrt2/2,-\sqrt2/2)`)}。`,
      },
      { text: "结式为零的每个数值都已是完整二维解，无需恢复另一个坐标。" },
      { text: "两个多项式的次数之和为 3，所以一定存在三个实公共点。" },
      { text: `消去 x 后只能得到 ${texInline(String.raw`y=0`)}。` },
    ],
    steps: [
      `按 x 整理为 ${texInline(String.raw`f=x^2+(y^2-1)`)} 与 ${texInline(String.raw`g=x-y`)}。`,
      `Sylvester 矩阵可取 ${texInline(String.raw`S_x(f,g)=\begin{bmatrix}1&0&y^2-1\\1&-y&0\\0&1&-y\end{bmatrix}`)}。`,
      `计算行列式得到 ${texInline(String.raw`\operatorname{Res}_x(f,g)=2y^2-1`)}。`,
      `解结式得 ${texInline(String.raw`y=\pm\sqrt2/2`)}，这些仍是 y 坐标候选。`,
      `由 ${texInline(String.raw`x-y=0`)} 恢复 ${texInline(String.raw`x=y`)}。`,
      "把两个点分别代回圆方程和直线方程，两式均为零，因此它们都是已验证的实公共点。",
    ],
    audit: {
      kind: "point-system",
      points: [[Math.SQRT1_2, Math.SQRT1_2], [-Math.SQRT1_2, -Math.SQRT1_2]],
      equations: [
        { kind: "circle", constant: 1 },
        { kind: "line-difference", constant: 0 },
      ],
    },
  },
  quiz: [
    { question: "为什么选择不同的消元变量会改变工作量？", answer: "两种整理方式的次数与系数复杂度可能不同，Sylvester 矩阵的大小和所得结式次数也会变化。" },
    { question: "Sylvester 矩阵的行列式记录什么？", answer: "它给出相对于所选消元变量的结式，用来检测公共根候选。" },
    { question: "结式根为什么仍需回代？", answer: "结式只保留一个坐标，并可能遇到次数下降、复根或重数；回代才能恢复另一坐标并核对两条原方程。" },
    { question: "结式出现二重根通常提示什么？", answer: "它常提示曲线相切或更高阶接触，但还需结合回代与局部结构确认。" },
    { question: "本节与线性消元共享的算法顺序是什么？", answer: "先消去变量降低问题维数，再回代恢复完整坐标，最后代回原方程验解。" },
  ],
  summary: [
    "二元高次方程组的解对应代数曲线公共点。",
    "Sylvester 矩阵把公共根条件编码为结式，从二维问题得到一元候选。",
    "候选根、重数和实公共点属于不同层次；回代与原方程验解完成最终确认。",
    "本节是消元思想的选学迁移，前六节构成线性方程组的核心主线。",
  ],
  exercises: [
    "对单位圆与 x=y 改为消去 y，写出相应 Sylvester 矩阵并核对结果。",
    "研究 y=x² 与 y=2x−1，说明结式二重根与相切点的关系。",
    "找一个首项系数在特定参数下消失的例子，说明为什么必须检查次数退化。",
  ],
});
