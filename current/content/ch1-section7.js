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
    { label: "插值", text: `n+1 个横坐标互异的点唯一确定次数 ≤n 的多项式。` },
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
    ],
  },
  example: {
    title: "例题：余数定理",
    question: `设 ${texInline("f(x)=x^3-2x+1")}。求 f(2)，并判断 x−2 是否整除 f。`,
    choices: [
      { correct: true, text: "f(2)=5≠0，故 x−2 不整除 f。" },
      { text: "f(2)=0，整除。" },
      { text: "余数定理不适用于三次。" },
      { text: "只能用长除法，不能代入。" },
    ],
    steps: ["用 Horner 或直接代入得 f(2)。", "因式定理：f(a)=0 ⇔ 整除。"],
  },
  quiz: [
    { question: "余数定理说什么？", answer: "f 除以 x−a 的余式是 f(a)。" },
    { question: "n 次非零多项式最多几个不同根？", answer: "n 个。" },
  ],
  summary: [
    "评价与余数定理连接形式与函数。",
    "根 ⇔ 一次因式。",
    "插值靠互异节点个数保证唯一。",
  ],
  exercises: ["用 Horner 计算给定 f(a)。"],
});
