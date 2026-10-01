defineChapter6Section("sets-maps", {
  number: "§1",
  textbookSection: "集合·映射",
  title: "集合·映射",
  navTitle: "集合·映射",
  question: "一条对应规则什么时候构成映射？什么时候可以唯一地倒回去？",
  goal: "分清定义域、陪域与像；会判断单射、满射、双射；理解双射与逆映射的关系，以及有限集与无限集的差别。",
  tags: ["映射", "单射", "满射", "双射", "逆映射"],
  intro:
    "映射给每个输入指定恰好一个输出。想倒回去时会遇到两种障碍：两个输入撞到同一个像，或者陪域里有元素没被取到。前者破坏单射，后者破坏满射；两种障碍都没有，映射才可逆。",
  concepts: [
    { label: "单射", text: "不同的输入有不同的像。" },
    { label: "满射", text: "陪域中每个元素都有原像。" },
  ],
  textbook: { reference: "北大版《高等代数》第六章 §1", items: ["集合及其运算", "映射、像与原像", "单射、满射、双射", "映射的乘积与逆映射"] },
  interactive: false,
  lesson: {
    figure: "maps",
    blocks: [
      {
        title: "映射、像与原像",
        tex: String.raw`f:X\to Y,\qquad f(X)=\{f(x):x\in X\}\subseteq Y`,
        text: `每个 ${texInline("x\\in X")} 恰有一个像 ${texInline("f(x)")}。像集 ${texInline("f(X)")} 可以比陪域 ${texInline("Y")} 小；${texInline("y")} 的原像集 ${texInline("\\{x:f(x)=y\\}")} 可以是空集，也可以含多个元素。两个映射相等，要求定义域、陪域和对应规则都相同。`,
      },
      {
        title: "单射、满射、双射与逆映射",
        tex: String.raw`g\circ f=1_X,\qquad f\circ g=1_Y`,
        text: `单射：${texInline("x_1\\ne x_2\\Rightarrow f(x_1)\\ne f(x_2)")}；满射：${texInline("f(X)=Y")}。双射同时满足二者，这时并且只有这时存在逆映射 ${texInline("g=f^{-1}")}，满足上式。乘积 ${texInline("(g\\circ f)(x)=g(f(x))")} 先作用 ${texInline("f")}。`,
      },
      {
        title: "有限集与无限集",
        text: `${texInline("X,Y")} 是元素个数相同的有限集时，${texInline("f:X\\to Y")} 单射 ⇔ 满射。无限集上这一条不成立：在全体多项式 ${texInline("P[x]")} 上，求导 ${texInline("D")} 是满射，但 ${texInline("D(1)=D(2)=0")}，不是单射；乘以 ${texInline("x")} 是单射，但常数 1 没有原像。第七章会看到，有限维空间上的线性变换又满足“单射 ⇔ 满射”。`,
      },
    ],
    pitfalls: [
      `陪域是映射的一部分：${texInline("f(x)=x^2")} 作为 ${texInline("\\mathbb R\\to\\mathbb R")} 不是满射，作为 ${texInline("\\mathbb R\\to[0,+\\infty)")} 是满射。`,
      `原像集 ${texInline("f^{-1}(y)")} 对任何映射都有意义；逆映射 ${texInline("f^{-1}")} 只有双射才有。`,
      `${texInline("g\\circ f")} 先作用 ${texInline("f")}，再作用 ${texInline("g")}；一般 ${texInline("g\\circ f\\ne f\\circ g")}。`,
    ],
  },
  example: {
    title: "例题：数一数映射、满射与单射",
    question: `设 ${texInline("X=\\{1,2,3\\}")}，${texInline("Y=\\{a,b\\}")}。从 ${texInline("X")} 到 ${texInline("Y")} 一共有多少个映射？其中满射、单射各有多少个？`,
    choices: [
      { text: "6 个映射，6 个满射，0 个单射" },
      { correct: true, text: "8 个映射，6 个满射，0 个单射" },
      { text: "8 个映射，8 个满射，2 个单射" },
      { text: "9 个映射，6 个满射，3 个单射" },
    ],
    steps: [
      `每个输入独立地选 ${texInline("a")} 或 ${texInline("b")}，共 ${texInline("2^3=8")} 个映射。`,
      "只有两个常值映射（全部映到 a 或全部映到 b）漏掉了一个输出，所以满射有 8−2=6 个。",
      "3 个输入放进 2 个输出，必有两个撞在一起，所以单射有 0 个。",
      `反过来从 ${texInline("Y")} 到 ${texInline("X")}：共 ${texInline("3^2=9")} 个映射，单射 ${texInline("3\\times2=6")} 个，满射 0 个。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("g\\circ f")} 是单射。${texInline("f")} 与 ${texInline("g")} 中哪一个一定是单射？`,
      answer: `${texInline("f")} 一定是：若 ${texInline("f(x_1)=f(x_2)")}，则 ${texInline("g(f(x_1))=g(f(x_2))")}，由 ${texInline("g\\circ f")} 单射得 ${texInline("x_1=x_2")}。${texInline("g")} 不一定，它在 ${texInline("f")} 的像集之外可以有碰撞。`,
    },
    {
      question: `${texInline("g\\circ f")} 是满射。哪一个一定是满射？`,
      answer: `${texInline("g")} 一定是：每个 ${texInline("z")} 都等于某个 ${texInline("g(f(x))")}，自然在 ${texInline("g")} 的像里。${texInline("f")} 不一定。`,
    },
    {
      question: "有限集 X 到自身的单射一定是满射吗？自然数集 ℕ 到自身的单射呢？",
      answer: `有限集上一定是：n 个互不相同的像占满 n 个元素。ℕ 上不一定，${texInline("n\\mapsto n+1")} 是单射，但 0 没有原像。`,
    },
  ],
  summary: [
    "映射给每个输入恰好一个输出；陪域是映射的一部分。",
    "单射看有没有碰撞，满射看有没有遗漏；双射 ⇔ 存在逆映射。",
    "元素个数相同的有限集之间，单射 ⇔ 满射；无限集上这一条失效。",
  ],
});
