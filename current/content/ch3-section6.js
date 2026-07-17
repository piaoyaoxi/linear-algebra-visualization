defineChapter3Section("solution-structure", {
  number: "§6",
  textbookSection: "线性方程组解的结构",
  title: "线性方程组解的结构",
  navTitle: "解的结构",
  question: "方程组一旦有解，为什么所有解一定构成“一个特解 + 齐次解空间”？自由变量究竟在生成哪些方向？",
  goal: `从 RREF 识别主元变量与自由变量；求齐次方程 ${texInline(String.raw`Ax=0`)} 的基础解系；理解 ${texInline(String.raw`x=x_0+\operatorname{Ker}(A)`)} 的仿射结构，并用 ${texInline(String.raw`n-\operatorname{rank}(A)`)} 计算解集维数。`,
  tags: ["主元变量", "自由变量", "基础解系", "零空间", "仿射解集"],
  intro:
    "有解只说明至少找到一个点。真正的结构来自差值：任意两个非齐次解之差都会被 A 送到零，所以所有解之间允许的移动方向恰好是零空间。选择不同特解只会改变参数原点，不会改变整个解集。",
  videoPlan: {
    title: "把零空间平移到特解处",
    duration: "约 2.5 分钟",
    scenes: [
      "RREF 中主元列与自由列分别着色。",
      "每个自由变量单独取 1，生成一个基础解向量。",
      "齐次解空间从原点展开。",
      "一个特解把整个零空间平移成非齐次解集。",
    ],
  },
  concepts: [
    {
      label: "主元与自由变量",
      text: "主元变量由方程约束，自由变量可以独立取值；每个自由变量通常对应零空间中的一个基本方向。",
    },
    {
      label: "零空间",
      text: `${texInline(String.raw`\operatorname{Ker}(A)=\{x\in F^n:Ax=0\}`)} 对加法和数乘封闭，是一个线性子空间。`,
    },
    {
      label: "基础解系",
      text: "齐次方程解空间的一组基。实际计算时常让一个自由变量取 1、其余取 0，依次得到基础方向。",
    },
    {
      label: "特解加齐次解",
      text: `若 ${texInline(String.raw`Ax_0=b`)}，则 ${texInline(String.raw`Ax=b`)} 的全部解为 ${texInline(String.raw`x=x_0+x_h`)}，其中 ${texInline(String.raw`x_h\in\operatorname{Ker}(A)`)}。`,
    },
    {
      label: "维数公式",
      text: `零空间维数为 ${texInline(String.raw`n-\operatorname{rank}(A)`)}；这就是自由变量个数，也是有解时解集的方向维数。`,
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第三章 §6",
    page: "",
    items: ["齐次方程组的基础解系", "零空间", "非齐次方程组的特解", "通解结构", "解空间维数与秩"],
  },
  interactive: {
    type: "slot",
    title: "实验：解族生成器",
    description: "从 RREF 自动拆出特解和零空间基；调节参数生成具体解，并同时验证 Ax=b 与 A(x−x₀)=0。",
    task: "选择一个自由变量的预设，沿参数滑块移动；再把特解替换成解集中的另一个点，确认整条解集不变。",
    prompts: [
      "选择唯一解预设，观察零空间只含零向量。",
      "选择仿射直线预设，分别开关特解和齐次方向。",
      "选择两个自由变量的预设，用两个参数在解平面中移动。",
      "点击“换一个特解”，比较公式参数变化与实际解集。",
    ],
  },
  example: {
    title: "例题：从 RREF 写出完整通解",
    question: `求方程组 ${texInline(String.raw`x_1+x_2+x_3=2`)}，${texInline(String.raw`2x_1+2x_2+2x_3=4`)} 的全部解，并说明解集的维数。`,
    choices: [
      {
        correct: true,
        text: `令 ${texInline(String.raw`x_2=s,x_3=t`)}，则 ${texInline(String.raw`x=(2,0,0)^T+s(-1,1,0)^T+t(-1,0,1)^T`)}；解集维数为 ${texInline(String.raw`3-1=2`)}。`,
      },
      { text: "有两个方程，所以只有一个自由变量。" },
      { text: "非齐次解集必须过原点，因此特解应取零向量。" },
      { text: "第二个方程与第一个不同，所以秩为 2。" },
    ],
    steps: [
      "第二个方程是第一个方程的 2 倍，只有一个独立约束，rank(A)=1。",
      `主元变量取 ${texInline(String.raw`x_1`)}；令 ${texInline(String.raw`x_2=s,x_3=t`)}。`,
      `得到 ${texInline(String.raw`x_1=2-s-t`)}。`,
      `取 ${texInline(String.raw`s=t=0`)} 得特解 ${texInline(String.raw`x_0=(2,0,0)^T`)}。`,
      `分别让 ${texInline(String.raw`(s,t)=(1,0)`)} 与 ${texInline(String.raw`(0,1)`)} 得两个齐次方向。`,
      `解集是 R³ 中经过 x₀ 的二维仿射平面，维数 ${texInline(String.raw`n-r=2`)}。`,
    ],
  },
  quiz: [
    { question: "为什么任意两个非齐次解之差是齐次解？", answer: "若 Ax₁=b 且 Ax₂=b，则 A(x₁−x₂)=b−b=0。" },
    { question: "为什么特解加任意齐次解仍是原方程的解？", answer: "A(x₀+x_h)=Ax₀+Ax_h=b+0=b。" },
    { question: "自由变量个数如何计算？", answer: "未知量个数 n 减去 rank(A)。" },
    { question: "齐次解集与非齐次解集的几何区别是什么？", answer: "齐次解集是过原点的线性子空间；非齐次解集是它的平移，通常不过原点。" },
    { question: "更换特解会改变解集吗？", answer: "不会。两个特解之差属于零空间，只会改变参数原点。" },
    { question: "有解且 nullity(A)=0 时有多少个解？", answer: "唯一解，因为没有非零齐次方向可移动。" },
  ],
  summary: [
    "自由变量生成零空间方向，主元变量随之被确定。",
    "非齐次通解等于任一特解加上整个零空间。",
    "零空间维数 n−rank(A) 精确给出解集的自由度。",
    "选学的下一节保留‘消去变量—回代—验解’主线，把对象从线性式升级为多项式。",
  ],
  exercises: [
    "给一个秩为 2 的 2×4 有解系统，写出两个基础解向量。",
    "从一个通解中另选特解，并重新参数化，验证解集没有改变。",
  ],
});
