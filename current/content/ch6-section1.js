defineChapter6Section("sets-maps", {
  number: "§1",
  textbookSection: "集合·映射",
  title: "集合·映射",
  navTitle: "集合·映射",
  question: "一张箭头图需要提供哪些信息才真正定义了映射？怎样从输入端、输出端分别判断信息会不会碰撞或遗漏？",
  goal: "把映射读成由定义域、陪域和对应规则组成的完整对象；准确区分像、原像、值域与陪域；用输入碰撞和输出遗漏判断单射、满射、双射，并把复合与逆映射连接到后续线性代数。",
  tags: ["定义域与陪域", "像与原像", "单射满射", "复合与逆"],
  prerequisites: ["会使用集合与子集符号。", "能沿箭头依次读取两步对应关系。"],
  objectives: [
    "先判断一条规则是否构成映射，再讨论它的性质。",
    "从箭头图中分别读取值域和一个元素的原像。",
    "解释逆映射存在为什么同时需要单射与满射。",
  ],
  intro:
    "线性代数会不断在不同对象之间建立对应：坐标列变成几何向量，向量经矩阵得到新向量，多项式变成系数列。为了讨论这些对应是否保留信息，必须先把输入集合、输出集合和规则说完整。",
  concepts: [
    { label: "映射", text: texInline("f:X\\to Y") + " 要求每个输入恰有一个输出。" },
    { label: "值域", text: texInline("f(X)=\\{f(x):x\\in X\\}") + "，它包含在陪域 Y 中。" },
    { label: "原像", text: texInline("f^{-1}(y)=\\{x\\in X:f(x)=y\\}") + "，可能为空、一个或多个元素。" },
    { label: "双射", text: "输入无碰撞且输出无遗漏，此时可以唯一倒退。" },
  ],
  textbook: {
    reference: "Axler · Friedberg · Hoffman–Kunze",
    items: ["映射的完整数据", "像与原像", "单射、满射、双射", "复合、恒等与逆映射"],
  },
  story: {
    title: "先把箭头规则说完整，再判断它保留了多少信息",
    lead:
      "映射的性质取决于定义域、陪域和对应规则三部分。固定同一个公式而改变陪域，满射性就可能改变；因此判断时必须从完整对象出发。",
    modules: [
      {
        number: "01",
        title: "映射由三部分共同确定",
        subtitle: "每个输入必须出现，并且只能沿一条箭头离开。",
        blocks: [
          {
            type: "formula",
            kicker: "完整记号",
            formula: texDisplay("f:X\\longrightarrow Y,\\qquad x\\longmapsto f(x)"),
            text: "X 是定义域，Y 是陪域，规则说明怎样由 x 得到 f(x)。不同输入可以得到同一个输出，这仍然是合法映射。",
          },
          {
            type: "definitions",
            items: [
              { kicker: "缺少箭头", title: "有输入没有输出", text: "规则尚未覆盖整个定义域，因而没有定义出 X 上的映射。" },
              { kicker: "分叉箭头", title: "一个输入有两个输出", text: "唯一性失败，同一个输入无法得到确定结果。" },
              { kicker: "重复命中", title: "多个输入共享输出", text: "映射仍然成立；随后检查单射时会发现信息碰撞。" },
            ],
          },
        ],
      },
      {
        number: "02",
        title: "像与原像从相反方向读箭头",
        subtitle: "值域记录实际到达的位置，陪域记录允许到达的全部位置。",
        blocks: [
          {
            type: "cards",
            items: [
              { kicker: "从输入出发", title: "像 f(x)", text: "沿唯一箭头前进，得到 x 对应的输出。" },
              { kicker: "从输出倒查", title: "原像 f⁻¹(y)", text: "收集所有落到 y 的输入；这个集合可以为空或含多个元素。" },
              { kicker: "实际命中", title: "值域 f(X)", text: "把全部像收集起来；始终有 f(X)⊆Y。" },
              { kicker: "预先声明", title: "陪域 Y", text: "陪域中可以存在暂时没有原像的元素。" },
            ],
          },
          {
            type: "note",
            title: "陪域会改变结论",
            text: "公式 f(x)=x² 取定义域 ℝ 时，若陪域为 [0,+∞)，它是满射；若陪域改为 ℝ，负数没有原像，满射性随之失败。",
          },
        ],
      },
      {
        number: "03",
        title: "单射与满射检查两种不同的信息损失",
        subtitle: "先从输入侧找碰撞，再从输出侧找遗漏。",
        blocks: [
          {
            type: "definitions",
            items: [
              { kicker: "输入侧", title: "单射", text: "f(x₁)=f(x₂) 能推出 x₁=x₂；输出可以唯一追溯到输入。" },
              { kicker: "输出侧", title: "满射", text: "对每个 y∈Y 都存在 x∈X 使 f(x)=y；陪域没有遗漏。" },
              { kicker: "两项同时成立", title: "双射", text: "每个输出恰有一个原像，映射可以完整而唯一地倒退。" },
            ],
          },
          {
            type: "proof",
            items: [
              { title: "逆映射要求唯一", text: "若两个输入落到同一输出，反向规则无法确定应该返回哪一个输入。" },
              { title: "逆映射要求处处有值", text: "若陪域中有元素未被命中，反向规则在该元素处没有输出。" },
              { title: "双射给出逆映射", text: "每个 y 恰有一个原像，于是可以定义 f⁻¹(y) 为这个唯一输入。" },
            ],
          },
        ],
      },
      {
        number: "04",
        title: "复合沿箭头前进，坐标化提供第一座线性代数之桥",
        subtitle: "右边的映射先作用；逆映射按相反顺序撤回每一步。",
        blocks: [
          {
            type: "formula",
            kicker: "复合",
            formula: texDisplay("(g\\circ f)(x)=g(f(x)),\\qquad (g\\circ f)^{-1}=f^{-1}\\circ g^{-1}"),
            text: "第二个公式在 f、g 都可逆时成立：撤回两步操作要先撤回最后发生的那一步。",
          },
          {
            type: "cards",
            items: [
              { kicker: "矩阵映射", title: texInline("x\\mapsto Ax"), text: "矩阵的列数决定输入坐标个数，行数决定输出坐标个数。" },
              { kicker: "坐标映射", title: texInline("v\\mapsto[v]_B"), text: "第 §8 节将证明，选定基后它是一座可逆的结构桥。" },
            ],
          },
        ],
      },
    ],
  },
  interactive: {
    type: "slot",
    title: "实验：映射检查台",
    description: "亲手改接箭头，并按合法性、单射、满射、可逆的顺序读取结果。",
    task: "先制造一次输入碰撞和一次输出遗漏，再修复成双射；每次都说明失败发生在输入侧还是输出侧。",
    prompts: [
      "逐个检查左侧输入是否恰有一条离开的箭头。",
      "让两个输入命中同一输出，观察单射和逆映射怎样变化。",
      "让一个输出无人命中，观察值域与陪域的差别。",
      "恢复双射，沿逆映射从每个输出唯一返回输入。",
    ],
  },
  example: {
    title: "例题：从映射表读取全部信息",
    question:
      "设 " + texInline("X=\\{1,2,3,4\\}") + "，" + texInline("Y=\\{a,b,c\\}") + "，映射 f 满足 " + texInline("1\\mapsto a,\\ 2\\mapsto b,\\ 3\\mapsto a,\\ 4\\mapsto c") + "。再设 " + texInline("g(a)=0,g(b)=1,g(c)=1") + "。求 f 的值域与 a 的原像，判断 f 的单射、满射性质，并计算 " + texInline("(g\\circ f)(4)") + "。",
    choices: [
      { correct: true, text: "值域为 {a,b,c}，a 的原像为 {1,3}；f 满射但非单射，(g∘f)(4)=1。" },
      { text: "f 是双射，因为定义域和陪域都只出现了有限个元素。" },
      { text: "a 被命中两次，所以这张表没有定义映射。" },
      { text: "(g∘f)(4)=g(4)，因为复合先作用左侧的 g。" },
    ],
    steps: [
      "每个输入都有且只有一个输出，所以 f 是合法映射。",
      "a、b、c 都被命中，因此值域等于陪域 Y，f 是满射。",
      "1 与 3 都映到 a，所以 f 不是单射；a 的原像是 {1,3}。",
      "复合从右向左计算：f(4)=c，随后 g(c)=1。",
    ],
    audit: {
      kind: "finite-map",
      domain: [1, 2, 3, 4],
      codomain: ["a", "b", "c"],
      outputs: ["a", "b", "a", "c"],
      preimageValue: "a",
      preimage: [1, 3],
      injective: false,
      surjective: true,
      compositionInput: 4,
      secondMap: { a: 0, b: 1, c: 1 },
      compositionOutput: 1,
    },
  },
  quiz: [
    { question: "为什么改变陪域可能改变满射性？", answer: "满射要求实际值域覆盖声明的整个陪域；陪域扩大后，新增元素可能没有原像。" },
    { question: "一个输出有三个原像时，这仍然是映射吗？", answer: "是。映射限制每个输入只能有一个输出，并不限制一个输出拥有多少原像；此时单射失败。" },
    { question: "怎样用原像描述单射？", answer: "单射时，每个输出的原像至多含一个元素。" },
    { question: "怎样用原像描述满射？", answer: "满射时，陪域中每个元素的原像都非空。" },
    { question: "为什么 (g∘f)⁻¹ 的次序是 f⁻¹∘g⁻¹？", answer: "复合先做 f 再做 g；撤回时先撤回最后的 g，再撤回 f。" },
  ],
  summary: [
    "映射由定义域、陪域和对应规则共同确定。",
    "单射排除输入碰撞，满射排除输出遗漏，双射保证可以唯一倒退。",
    "复合与逆映射为后面的坐标变换和同构准备了语言。",
  ],
  bridge: "下一节在集合上规定加法与数乘。集合提供对象，运算提供线性结构。",
  exercises: ["构造一个满射但非单射的有限映射。", "为 f(x)=x² 选择两个不同陪域，并比较满射性。"],
});
