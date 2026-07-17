defineChapter1Section("univariate-polynomials", {
  number: "§2",
  textbookSection: "一元多项式",
  title: "一元多项式",
  navTitle: "一元多项式",
  question: "一个多项式究竟是函数图像、形式表达式，还是一串有位置的系数？为什么零系数也不能随意丢掉位置？",
  goal: `正确读写 ${texInline("F[x]")} 中的一元多项式；掌握相等、加法、数乘、乘法与次数规律；把乘法理解成系数卷积。`,
  tags: ["形式多项式", "系数带", "卷积"],
  intro:
    "本节首先研究形式多项式：在幂基 1,x,x²,… 下只有有限个非零坐标的对象。图像可以帮助观察，但相等、次数和运算都由系数位置决定。内部的零系数必须保留位置，最高端连续的零才在规范化时删去。",
  concepts: [
    { label: "形式", text: `${texInline("f(x)=a_0+a_1x+\\cdots+a_nx^n")}，其中 ${texInline("a_i\\in F")} 且只有有限个系数非零。` },
    { label: "相等", text: "两个形式多项式相等，当且仅当每个相同次数位置的系数都相等。" },
    { label: "次数", text: "非零多项式的次数是最高非零系数的下标；零多项式单独处理。" },
    { label: "加法与数乘", text: "加法按同次位置对齐，数乘同时缩放全部系数；首项抵消会使和的次数下降。" },
    { label: "乘法卷积", text: `${texInline("[x^k](fg)=\\sum_{i+j=k}a_i b_j")}；非零时 ${texInline("\\deg(fg)=\\deg f+\\deg g")}。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章",
    items: ["一元多项式的定义与相等", "加法、数乘和乘法", "次数及其运算规律"],
  },
  interactive: {
    type: "slot",
    title: "实验：系数带工作台",
    description: "用精确整数或分数编辑两个系数带；加法、乘法、次数、指定项配对和固定相机图像同步更新。",
    task: "构造一次首项抵消；再选择乘积的某个次数，核对所有 i+j=k 的贡献。",
    prompts: [
      "把中间系数改为 0，确认格子仍保留该次数位置。",
      "输入 1/2 或 −3/4，确认页面保持精确分数而不四舍五入。",
      "使用“首项抵消”预设，比较 max(deg f,deg g) 与 deg(f+g)。",
      "切换乘法并改变目标次数 k，检查每一对 i+j=k 的乘积。",
      "把所有系数清零，确认次数显示为零多项式。",
    ],
  },
  example: {
    title: "例题：从系数位置完成加法与乘法",
    question: `设 ${texInline("f=2-x+3x^3")}，${texInline("g=-2+x+x^2-3x^3")}。写出系数带，计算 ${texInline("f+g")}；求 ${texInline("fg")} 的 ${texInline("x^3")} 项系数，并判断 ${texInline("\\deg(fg)")}。`,
    choices: [
      { correct: true, text: `系数带分别为 ${texInline("[2,-1,0,3]")}、${texInline("[-2,1,1,-3]")}；${texInline("f+g=x^2")}；${texInline("[x^3](fg)=-13")}；${texInline("\\deg(fg)=6")}。` },
      { text: `${texInline("[x^3](fg)=3\\cdot(-3)=-9")}，只需乘同次系数。` },
      { text: `${texInline("f+g")} 仍为三次，因为两个加数都是三次。` },
      { text: `系数带可写为 ${texInline("[2,-1,3]")}，中间零项可以省去位置。` },
    ],
    steps: [
      `${texInline("f")} 的系数带是 ${texInline("[2,-1,0,3]")}，${texInline("g")} 的系数带是 ${texInline("[-2,1,1,-3]")}。`,
      `按位置相加得到 ${texInline("[0,0,1,0]")}，规范化为 ${texInline("x^2")}；三次首项抵消。`,
      `${texInline("x^3")} 项来自四对：${texInline("a_0b_3,a_1b_2,a_2b_1,a_3b_0")}。`,
      `它们的和是 ${texInline("2(-3)+(-1)(1)+0(1)+3(-2)=-13")}。`,
      "两个多项式均非零，最高次项相乘不可能抵消，因此乘积次数为 3+3=6。",
    ],
  },
  quiz: [
    { question: `${texInline("[2,-1,0,3]")} 中第三个位置的 0 能删掉吗？`, answer: "不能；删掉会把后面的 3 从 x³ 系数错移成 x² 系数。" },
    { question: "零多项式的次数如何处理？", answer: "单独处理，不把它当作普通非负整数次数。" },
    { question: `什么时候 ${texInline("\\deg(f+g)<\\max(\\deg f,\\deg g)")}？`, answer: "最高次项发生抵消时；还可能继续向下抵消。" },
    { question: `${texInline("[x^k](fg)")} 怎样计算？`, answer: `把所有满足 ${texInline("i+j=k")} 的 ${texInline("a_i b_j")} 相加。` },
    { question: "非零多项式乘积的次数为什么相加？", answer: "乘积最高次项是两首项之积，系数域没有零因子，因此它非零。" },
    { question: `多项式图像相同是否就是本节形式相等的定义？`, answer: "本节先以系数逐项相等定义形式相等；在无限数域上二者随后会联系起来。" },
  ],
  misconceptions: [
    "乘法不是对应位置相乘；一个结果项通常汇聚多对系数。",
    "次数相加只用于非零乘积；加法的次数只有上界。",
  ],
  summary: [
    "形式多项式是带有次数位置的有限系数序列。",
    "内部零项保留位置，尾部零项规范化。",
    "加法按位置对齐，乘法按 i+j=k 卷积。",
    "下一节把乘法反向使用，建立商、余式与整除。",
  ],
  exercises: [
    `求 ${texInline("(1+x+x^2)(1-x)")} 的完整系数带。`,
    `构造两个三次多项式，使它们的和恰好是一常数。`,
  ],
});