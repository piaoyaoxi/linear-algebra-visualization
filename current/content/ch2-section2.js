defineChapter2Section("permutations", {
  number: "§2",
  textbookSection: "排列",
  title: "排列",
  navTitle: "排列",
  question: "同一个排列可以由不同交换路线得到，怎样保证最终的正负号始终一致？",
  goal: "用逆序数定义排列的奇偶性，证明一次相邻交换必翻转奇偶性，并把排列符号解释成高阶行列式乘积项的符号账本。",
  tags: ["逆序数", "奇偶排列", "排列符号"],
  prerequisites: [
    "能够列出 n 个元素的一种排列。",
    "理解交换两个位置会改变排列顺序。",
  ],
  objectives: [
    "准确找出一个排列的全部逆序对。",
    "说明相邻交换为何使逆序数恰好改变 1。",
    "用排列符号判断行列式乘积项前的正负号。",
  ],
  intro:
    "高阶行列式的一个合法乘积会从每一行取一个元素，同时让列指标恰好形成一个排列。列指标的交叉次数记录了从自然顺序到当前顺序经历的方向翻转奇偶性。",
  concepts: [
    { label: "逆序", text: `${texInline("i<j,\\;\\sigma(i)>\\sigma(j)")} 时，${texInline("(i,j)")} 是一对逆序。` },
    { label: "逆序数", text: `${texInline("\\tau(\\sigma)")} 是全部逆序对的个数。` },
    { label: "排列符号", text: `${texInline("\\operatorname{sgn}(\\sigma)=(-1)^{\\tau(\\sigma)}")}。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第二章 §2 · Strang 第 5 章 · Hoffman–Kunze 第 5 章",
    page: "",
    items: ["逆序与逆序数", "奇排列与偶排列", "交换对奇偶性的影响"],
  },
  story: {
    title: "排列符号是一套与路线无关的交换账本",
    lead: "逆序数数的是排列图中的交叉对。行列式只需要知道交叉总数的奇偶性，因为每一次方向交换只贡献一个负号。",
    modules: [
      {
        number: "01",
        title: "从逆序对到排列符号",
        subtitle: "先逐对比较，再把交叉总数压缩成一个正负号。",
        blocks: [
          {
            type: "definitions",
            items: [
              { kicker: "逆序对", title: texInline("i<j,\\;\\sigma(i)>\\sigma(j)"), text: "位置靠前的数反而更大，这一对在连线图中形成一次交叉。" },
              { kicker: "逆序数", title: texInline("\\tau(\\sigma)"), text: "把所有逆序对计数；计数本身取决于排列，不取决于怎样扫描。" },
              { kicker: "符号", title: texInline("\\operatorname{sgn}(\\sigma)=(-1)^{\\tau(\\sigma)}"), text: "偶数次交叉给 +1，奇数次交叉给 -1。" },
            ],
          },
        ],
      },
      {
        number: "02",
        title: "为什么相邻交换必翻转奇偶性",
        subtitle: "只交换相邻位置时，其他元素与这两项的相对关系成对保持。",
        blocks: [
          {
            type: "proof",
            items: [
              "设相邻两项为 x、y；交换前后，只有 x 与 y 的先后次序直接翻转。",
              "任意第三个元素 z 位于这两个位置之外，它与 x、y 形成的逆序总数保持不变。",
              "因此总逆序数恰好增加 1 或减少 1，奇偶性必定翻转。",
              "任意一次交换可以分解成奇数次相邻交换，所以任意交换也会翻转排列符号。",
            ],
          },
          {
            type: "note",
            title: "路线为什么不会改变答案",
            text: "从自然排列走到同一个终点排列，任何交换路线的总次数奇偶性都等于终点排列的逆序数奇偶性，因此最终符号一致。",
          },
        ],
      },
      {
        number: "03",
        title: "符号怎样进入行列式",
        subtitle: "列指标的排列决定乘积项的方向。",
        blocks: [
          {
            type: "formula",
            kicker: "乘积项预告",
            formula: texDisplay("\\operatorname{sgn}(\\sigma)a_{1\\sigma(1)}a_{2\\sigma(2)}\\cdots a_{n\\sigma(n)}"),
            text: "下一节会把所有排列对应的乘积项求和。排列符号保证交换两列时，整组项的符号同步翻转。",
          },
          {
            type: "misconception",
            items: [
              "逆序数是成对比较的总数，不等于每个元素离原位置的距离之和。",
              "一次相邻交换只改变奇偶性；逆序数的具体值可能增加或减少 1。",
              "行列式使用排列的奇偶性，不需要记住一条具体的交换路线。",
            ],
          },
        ],
      },
    ],
  },
  interactive: {
    type: "slot",
    visualTitle: "排列扫描器 · 逆序对与交叉线",
    description: "拖动卡片或使用相邻交换，逆序对列表、交叉线和排列符号会同步变化。",
    task: "先预测一次相邻交换会怎样改变奇偶性，再扫描排列 3142，并用一次相邻交换核对预测。",
    prediction: {
      question: "任意一次相邻交换之后，排列符号会怎样变化？",
      options: [
        { label: "一定翻转", correct: true, feedback: "相邻两项彼此的逆序状态翻转，其他逆序变化成对抵消，因此奇偶性一定翻转。" },
        { label: "一定不变", feedback: "观察交换的那一对：它们的先后关系必定改变一次。" },
        { label: "取决于数值大小", feedback: "逆序数可能加 1 或减 1，但两种情况都会翻转奇偶性。" },
      ],
    },
    prompts: [
      "逐项列出 3142 的逆序对，再与连线交叉核对。",
      "执行一次相邻交换，观察逆序数改变多少。",
      "用多条不同交换路线回到 1234，比较总交换次数的奇偶性。",
    ],
  },
  example: {
    title: "给排列定号，并追踪一次交换",
    question: `设 ${texInline("\\sigma=(3,1,4,2)")}。求 ${texInline("\\tau(\\sigma)")} 与 ${texInline("\\operatorname{sgn}(\\sigma)")}；再交换最后两个位置，判断新排列的符号。`,
    steps: [
      `逆序位置对为 ${texInline("(1,2),(1,4),(3,4)")}（对应值对 ${texInline("(3,1),(3,2),(4,2)")}），所以 ${texInline("\\tau(\\sigma)=3")}。`,
      `因此 ${texInline("\\operatorname{sgn}(\\sigma)=(-1)^3=-1")}。`,
      `交换最后两个位置得到 ${texInline("(3,1,2,4)")}；这是一次相邻交换，符号必翻转。`,
      `新排列的逆序位置对为 ${texInline("(1,2),(1,3)")}（对应值对 ${texInline("(3,1),(3,2)")}），逆序数为 2，符号为 +1，与交换规律一致。`,
    ],
  },
  quiz: [
    { question: `排列 ${texInline("231")} 的逆序数与符号分别是多少？`, answer: `逆序位置对是 ${texInline("(1,3),(2,3)")}，逆序数为 2，符号为 +1。` },
    { question: "为什么一次相邻交换只使逆序数改变 1？", answer: "只有被交换的相邻两项彼此的逆序状态改变，其他元素与它们形成的逆序总数不变。" },
    { question: "同一排列由不同交换路线得到时，为什么符号仍然确定？", answer: "所有路线的交换次数奇偶性都等于该排列逆序数的奇偶性。" },
    { question: `若 ${texInline("\\sigma")} 为奇排列，交换任意两个位置后得到什么奇偶性？`, answer: "得到偶排列，因为任意一次交换都会翻转奇偶性。" },
  ],
  summary: [
    "逆序数把排列中的全部交叉对计数。",
    "相邻交换恰好翻转一次奇偶性，任意交换也会翻转排列符号。",
    "排列符号为高阶行列式的每个合法乘积项提供一致的正负号。",
  ],
  bridge: "符号账本已经建立。下一节让列指标遍历全部排列，写出 n 阶行列式的统一定义。",
  exercises: [
    "分别用两条交换路线把 1234 变成 3412，并比较交换次数的奇偶性。",
    "证明一个排列与其逆排列具有相同符号。",
  ],
});
