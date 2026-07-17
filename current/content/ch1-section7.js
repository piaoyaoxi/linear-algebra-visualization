defineChapter1Section("polynomial-functions", {
  number: "§7",
  textbookSection: "多项式函数",
  title: "多项式函数",
  navTitle: "多项式函数",
  question: "形式多项式怎样通过代入变成函数？为什么一个非零多项式不可能在无限多个点同时取零？",
  goal: "理解评价映射、余数定理与因式定理；掌握根数上界；理解插值与多项式函数在无限域上的唯一性。",
  tags: ["余数定理", "根数上界", "插值"],
  intro:
    "把 x 换成数 a 得到 f(a)，这是评价映射。余数定理说 f 除以 x−a 的余式是常数 f(a)。非零 n 次多项式至多 n 个根。在无限数域上，多项式函数由足够多取值唯一确定。",
  concepts: [
    { label: "评价", text: `${texInline("a\\mapsto f(a)")}；Horner 法稳定计算。` },
    { label: "余数定理", text: `${texInline("f(x)=(x-a)q(x)+f(a)")}。` },
    { label: "因式定理", text: `${texInline("f(a)=0\\iff (x-a)\\mid f(x)")}。` },
    { label: "根数上界", text: `非零 n 次多项式至多 n 个不同根。` },
    { label: "插值", text: `n+1 个横坐标互异的点唯一确定次数 ≤n 的多项式；拉格朗日基满足 ${texInline("L_i(x_j)=\\delta_{ij}")}。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章",
    items: ["多项式函数", "余数定理与因式定理", "根的个数", "插值"],
  },
  interactive: {
    type: "slot",
    title: "实验：代入机器与插值",
    description: "拖动 a 看 Horner 与点 (a,f(a))；构造过定点的低次多项式。",
    task: "验证 f(a)=0 时 x−a 成为因式；再用 3 点构造次数 ≤2 的插值。",
    prompts: [
      "移动 a，观察公式、数值与图上的点同步。",
      "把 a 移到根上，看因式定理点亮。",
      "切换插值预设，检查三个节点。",
      "相机固定，曲线再高也不会把坐标系放大跑飞。",
    ],
  },
  example: {
    title: "例题：次数 ≤2 的插值",
    question: `求次数不超过 2 且满足 ${texInline("f(0)=1,f(1)=2,f(2)=5")} 的多项式。用拉格朗日形式构造并化简。`,
    choices: [
      {
        correct: true,
        text: `${texInline("f(x)=1+x+x^2")}。`,
      },
      { text: `${texInline("f(x)=1+2x")}，因为过三点可用一次。` },
      { text: `${texInline("f(x)=x^2")}。` },
      { text: "这样的多项式不唯一。" },
    ],
    steps: [
      `${texInline("L_0=\\frac{(x-1)(x-2)}{(0-1)(0-2)}=\\frac{(x-1)(x-2)}{2}")}。`,
      `${texInline("L_1=\\frac{x(x-2)}{(1-0)(1-2)}=-x(x-2)")}，${texInline("L_2=\\frac{x(x-1)}{2}")}。`,
      `${texInline("f=1\\cdot L_0+2L_1+5L_2=1+x+x^2")}。`,
      "验证三点取值匹配。",
    ],
  },
  quiz: [
    { question: "余数定理的结论是什么？", answer: "f 除以 x−a 的余式是 f(a)。" },
    { question: "非零 3 次多项式最多几个不同根？", answer: "最多 3 个。" },
    { question: "为什么无限域上函数相等推出系数相等？", answer: "差多项式有无限多根则必为零多项式。" },
    { question: "插值节点横坐标重复会怎样？", answer: "一般不再存在唯一的标准插值多项式，页面应报错而非伪逆。" },
    { question: "因式定理如何表述？", answer: "f(a)=0 当且仅当 x−a 整除 f。" },
    { question: "Horner 法在算什么？", answer: "用嵌套乘法稳定计算 f(a)。" },
  ],
  summary: [
    "代入把形式对象变成可计算函数。",
    "余数/因式定理连接根与线性因式。",
    "根数上界与插值唯一性是结构结论。",
    "下一节进入复平面与共轭根。",
  ],
  exercises: [
    "用余数定理计算 f(x)=x³−2x+1 在 x=2 的值。",
    "说明为何 4 个互异点不能被同一个非零 2 次多项式全部取零。",
  ],
});
