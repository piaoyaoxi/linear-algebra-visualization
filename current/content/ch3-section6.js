defineChapter3Section("solution-structure", {
  number: "§6",
  textbookSection: "线性方程组解的结构",
  title: "线性方程组解的结构",
  navTitle: "解的结构",
  question: "方程有解以后，为什么全部解恰好等于一个特解加上全部齐次解？RREF 中的每个自由变量怎样生成一个可移动方向？",
  goal: `从任意两解之差研究非齐次解集；证明 ${texInline(String.raw`\{x:Ax=b\}=x_0+\operatorname{Ker}(A)`)}；从 RREF 同时求一个特解和齐次方程的基础解系，并用 ${texInline(String.raw`n-\operatorname{rank}(A)`)} 计算方向维数。`,
  tags: ["特解", "齐次解", "零空间", "基础解系", "仿射解集"],
  intro:
    "找到一个特解只确定了解集中的一个点。若 x 与 x₀ 都满足 Ax=b，它们的差会被 A 送到零；反过来，在 x₀ 上加任意齐次解仍然到达同一个 b。这两个方向共同说明：非齐次解集的位置由特解决定，可移动的方向完全由零空间决定。",
  videoPlan: {
    title: "把零空间平移到一个特解处",
    duration: "约 2.5 分钟",
    scenes: [
      "从两个非齐次解出发，相减后把输出 b 消去。",
      "在 RREF 中分别标出主元变量和自由变量。",
      "让每个自由变量依次取 1，生成零空间基础方向。",
      "把过原点的零空间平移到特解 x₀，得到全部非齐次解。",
    ],
  },
  concepts: [
    {
      label: "特解",
      text: `任何一个满足 ${texInline(String.raw`Ax_0=b`)} 的向量都可作为特解；它只负责锚定解集的位置。`,
    },
    {
      label: "零空间",
      text: `${texInline(String.raw`\operatorname{Ker}(A)=\{x:Ax=0\}`)} 对加法与数乘封闭，记录所有不会改变输出的输入方向。`,
    },
    {
      label: "双向证明",
      text: `若 Ax=b，则 ${texInline(String.raw`A(x-x_0)=0`)}；若 ${texInline(String.raw`x_h\in\operatorname{Ker}(A)`)}，则 ${texInline(String.raw`A(x_0+x_h)=b`)}。`,
    },
    {
      label: "基础解系",
      text: "齐次解空间的一组基。计算时令每个自由变量依次取 1、其余自由变量取 0，可得到相应基础方向。",
    },
    {
      label: "方向维数",
      text: `若 A 有 n 列、秩为 r，则零空间维数为 ${texInline(String.raw`n-r`)}；它等于自由变量个数。`,
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第三章 §6",
    page: "",
    items: ["齐次方程组", "基础解系", "非齐次方程组的特解", "通解结构", "秩与自由变量"],
  },
  interactive: {
    type: "slot",
    title: "实验：沿零空间方向生成全部解",
    description: "特解、零空间基、当前参数与两条验证等式同步变化；高维预设使用完整坐标并明确标注投影。",
    task: "先在解直线中沿一个零空间方向移动，再选择“贯穿例 · F⁴ 二参数解集”；改变两个参数，逐项核对 Ax=b 与 A(x−x₀)=0。",
    prompts: [
      "在唯一解预设中解释为什么参数滑杆消失。",
      "沿 η₁ 换一个特解，观察整个解集是否移动。",
      "在贯穿例中分别只改变 s 和只改变 t，读出两个独立齐次方向。",
      "切换到无解预设，说明为什么此时没有特解，结构公式无法开始。",
    ],
  },
  example: {
    title: "例题：从 RREF 写出贯穿系统的全部解",
    question: `求 ${texInline(String.raw`A=\begin{bmatrix}1&0&1&1\\0&1&1&-1\\1&1&2&0\end{bmatrix}`)}、${texInline(String.raw`b=(1,2,3)^T`)} 时 ${texInline(String.raw`Ax=b`)} 的全部解，并说明零空间维数。`,
    choices: [
      {
        correct: true,
        text: `${texInline(String.raw`x=(1,2,0,0)^T+s(-1,-1,1,0)^T+t(-1,1,0,1)^T`)}；${texInline(String.raw`\dim\operatorname{Ker}(A)=4-2=2`)}。`,
      },
      { text: `${texInline(String.raw`x=(1,2,0,0)^T`)} 是唯一解，因为它已经满足 Ax=b。` },
      { text: "A 有三行，所以只能有一个自由变量。" },
      { text: "非齐次解集必须经过原点，因此特解应取零向量。" },
    ],
    steps: [
      `消元得到 ${texInline(String.raw`x_1+x_3+x_4=1`)}、${texInline(String.raw`x_2+x_3-x_4=2`)}，第三行化为零行。`,
      `令自由变量 ${texInline(String.raw`x_3=s`)}、${texInline(String.raw`x_4=t`)}。`,
      `于是 ${texInline(String.raw`x_1=1-s-t`)}、${texInline(String.raw`x_2=2-s+t`)}。`,
      `把常数项与两个参数分别收集，得到特解 ${texInline(String.raw`x_0=(1,2,0,0)^T`)} 和两个齐次方向。`,
      "直接计算可验证 Ax₀=b，且 Aη₁=Aη₂=0，所以公式中的每个向量都是解。",
      `A 有 4 列、秩为 2，因此 ${texInline(String.raw`\dim\operatorname{Ker}(A)=4-2=2`)}，与两个自由变量一致。`,
    ],
    audit: {
      kind: "affine-family",
      A: [[1, 0, 1, 1], [0, 1, 1, -1], [1, 1, 2, 0]],
      b: [1, 2, 3],
      x0: [1, 2, 0, 0],
      basis: [[-1, -1, 1, 0], [-1, 1, 0, 1]],
      rank: 2,
    },
  },
  quiz: [
    { question: "为什么任意两个非齐次解之差是齐次解？", answer: "若 Ax₁=b 且 Ax₂=b，则 A(x₁−x₂)=b−b=0。" },
    { question: "为什么特解加任意齐次解仍是非齐次方程的解？", answer: "A(x₀+x_h)=Ax₀+Ax_h=b+0=b。" },
    { question: "更换特解会不会改变完整解集？", answer: "不会。两个特解之差属于零空间；更换特解只会重新选择参数原点。" },
    { question: "自由变量个数怎样由矩阵尺寸和秩得到？", answer: "A 有 n 列、秩为 r 时，自由变量个数为 n−r。" },
    { question: "非齐次解集什么时候也经过原点？", answer: "当 b=0 时；此时方程本身齐次，解集就是零空间。" },
  ],
  summary: [
    "有解时，全部解恰好是一个特解与全部齐次解之和。",
    "特解决定位置，零空间决定所有可移动方向；两者承担不同作用。",
    "RREF 同时给出特解、自由变量和零空间基础解系。",
    "零空间维数等于 n−rank(A)，也等于自由变量个数；至此，前六节形成完整闭环。",
  ],
  exercises: [
    "在贯穿例中取 s=2、t=−1，算出一个具体解并代回 Ax=b。",
    "把 x₀ 改成贯穿解集中的另一个点，重新写参数式并证明集合不变。",
    "说明无解系统为什么不能写成 x₀+Ker(A)，即使 Ker(A) 本身始终存在。",
  ],
});
