defineChapter1Section("factorization-theorem", {
  number: "§5",
  textbookSection: "因式分解定理",
  title: "因式分解：路径可以变，终点保持唯一",
  navTitle: "因式分解定理",
  question: "不断拆分为什么一定会停？两条拆分路线又为什么必须得到同一批不可约因式？",
  goal: "理解可约、不可约和相伴，掌握不可约分解的存在性、唯一性与标准形式，并能解释唯一性证明中 Bézout 的作用。",
  tags: ["不可约", "唯一分解", "因式树", "数域"],
  intro:
    "存在性与唯一性解决两个不同问题。次数严格下降保证任何拆分最终停在不可约因式；不可约因式的“素性”保证另一条路线中一定能找到与它相伴的因子。提出常数、把因式首一化并记录重数后，终点可以被精确比较。",
  concepts: [
    { label: "不可约", text: "正次数多项式若无法分成两个更低正次数因式，就在当前 F[x] 中不可约。" },
    { label: "不可约的素性", text: `若不可约 ${texInline("p\\mid fg")}，则 ${texInline("p\\mid f")} 或 ${texInline("p\\mid g")}。` },
    { label: "标准分解", text: `${texInline("f=c p_1^{e_1}\\cdots p_k^{e_k}")}，其中 ${texInline("p_i")} 首一、两两不同且不可约。` },
    { label: "唯一的含义", text: "常数 c、首一不可约因式及其重数确定；书写顺序不携带信息。" },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章 §5 · Hoffman–Kunze 第 4 章 · Friedberg 多项式附录",
    items: ["可约与不可约", "分解的存在性", "不可约因式的整除性质", "标准分解与唯一性"],
  },
  formal: {
    title: "唯一分解把多项式还原为稳定的不可约部件",
    intro:
      "因式树适合展示存在性：每次沿树向下，次数都会变小。唯一性需要另一条工具链：不可约 p 与一个不被 p 整除的因子互素，Bézout 等式便把 p 从整个乘积推进到另一个因子中。",
    equation: "f=c\\,p_1^{e_1}\\cdots p_k^{e_k}",
    map: [
      { label: "固定数域", text: "不可约因式的集合随 Q、R、C 改变。" },
      { label: "继续拆分", text: "每个可约叶拆成次数更低的正次数因式。" },
      { label: "到达叶节点", text: "严格下降的次数保证有限步终止。" },
      { label: "标准化比较", text: "提出常数、首一化、排序并合并重复因式。" },
    ],
    bridge: {
      title: "双路径因式树把“路线”和“终点”分开",
      text: "实验中的路线按钮只改变中间节点；标准化面板独立收集每条路线的不可约叶。切换数域时，允许的叶节点会改变，这正是相对不可约性的可视化。",
    },
    theorem: {
      label: "唯一分解定理",
      title: "每个非常数多项式都有唯一的标准不可约分解",
      statement: `对 ${texInline("0\\ne f\\in F[x]")}，存在非零常数 ${texInline("c")}、两两不同的首一不可约多项式 ${texInline("p_1,\\ldots,p_k")} 和正整数 ${texInline("e_i")}，使 ${texInline("f=c\\prod p_i^{e_i}")}；这些数据除因式次序外唯一。`,
    },
    proof: {
      title: "先证明不可约因式像素数，再逐个配对",
      steps: [
        { title: "存在性", text: "若 f 可约，就拆成两个更低正次数因式并递归；次数严格下降，因此过程有限。" },
        { title: "建立素性", text: `设不可约 ${texInline("p\\mid fg")} 且 ${texInline("p\\nmid f")}。不可约性给出 ${texInline("\\gcd(p,f)=1")}，所以存在 ${texInline("sp+tf=1")}。乘 g 后可知 ${texInline("p\\mid g")}。` },
        { title: "跨分解寻找配对", text: `若 ${texInline("p_1\\cdots p_m=q_1\\cdots q_n")}，则 ${texInline("p_1")} 整除右侧乘积，反复用素性可知它整除某个 ${texInline("q_j")}。` },
        { title: "约去并归纳", text: `若不可约因式 ${texInline("p\\mid q")}，则 ${texInline("q=up")}，其中 u 是非零常数；首一化后 p=q。约去这一对并继续配对，便得到全部因式及其重数。` },
      ],
    },
    definitions: [
      { title: "数域决定停止位置", text: `${texInline("x^2+1")} 在 ${texInline("\\mathbb R[x]")} 中已经是不可约叶，在 ${texInline("\\mathbb C[x]")} 中还会裂成 ${texInline("x-i")} 与 ${texInline("x+i")}。` },
      { title: "相伴只差单位", text: `${texInline("p")} 与 ${texInline("cp")}（${texInline("c\\ne0")}）表达相同的不可约类型。标准形式把 c 统一提出，并令每个 pᵢ 首一。` },
    ],
    boundary: {
      title: "没有根只在二次、三次时足以判不可约",
      text: `${texInline("x^4+4")} 没有有理根，却在 ${texInline("\\mathbb Q[x]")} 中分解为 ${texInline("(x^2-2x+2)(x^2+2x+2)")}。四次多项式可能直接裂成两个二次因式，因而“无一次因式”还没有排除全部分解。`,
    },
    pitfalls: [
      "拆分路线无需唯一，标准化后的不可约叶多重集合才唯一。",
      "不可约结论需要标明系数域。",
      "常数单位与因式排列应从唯一性比较中排除。",
    ],
    note: "唯一分解给每个不可约因式一个指数。下一节研究这些指数怎样被导数和 gcd 读出来。",
  },
  interactive: {
    type: "slot",
    title: "实验：双路径因式树",
    description: "在 Q、R、C 中比较两条真实拆分路线，并分别标准化它们的不可约叶。",
    task: "比较 x⁴−1 的两条路线；再切换 x²−2、x²+1 与 x⁴+4，观察数域怎样改变最终叶。",
    controlsTitle: "选定系数域与待分解多项式",
    controlsDescription: "同一多项式先固定系数域，再切换路线 A、B；每条路线的中间式和标准化叶分别计算。",
    guide: [
      ["定域", "先选择 Q、R 或 C。"],
      ["走两条路线", "分别展开 A、B 路线的中间因式。"],
      ["比较叶", "独立首一化、排序，再比较两个叶多重集合。"],
    ],
    takeaway: "中间拆分路径可以不同；当前数域中的不可约叶及其重数保持唯一。",
    prompts: [
      "在 Q 中比较 x⁴−1 的两条路线。",
      "切到 C，观察 x²+1 继续分裂。",
      "检查 x⁴+4 的路线 B 是否也真正走到不可约叶。",
    ],
  },
  example: {
    title: "同一个多项式在 Q、R、C 中的终点",
    question: `分别写出 ${texInline("x^4+4")} 在 ${texInline("\\mathbb Q[x]")}、${texInline("\\mathbb R[x]")} 与 ${texInline("\\mathbb C[x]")} 中的不可约分解。`,
    choices: [
      { correct: true, text: `Q、R 中为 ${texInline("(x^2-2x+2)(x^2+2x+2)")}；C 中两个二次因式继续分成四个一次因式。` },
      { text: "三个数域中的不可约分解完全相同。" },
      { text: `${texInline("x^4+4")} 在 Q[x] 中不可约。` },
      { text: "实系数多项式一定只能分成一次因式。" },
    ],
    steps: [
      `Sophie Germain 恒等式给出 ${texInline("x^4+4=(x^2-2x+2)(x^2+2x+2)")}。`,
      "两个二次因式的判别式均为 −4，在 Q、R 中不可约。",
      `${texInline("x^2-2x+2")} 的复根为 ${texInline("1\\pm i")}；另一个二次的根为 ${texInline("-1\\pm i")}。`,
      "因此 C 中得到四个一次因式。",
    ],
  },
  quiz: [
    { question: "分解存在性为什么成立？", answer: "每次可约拆分都把问题降到更低次数，过程有限。" },
    { question: `不可约 ${texInline("p\\mid fg")} 能推出什么？`, answer: `${texInline("p\\mid f")} 或 ${texInline("p\\mid g")}。` },
    { question: "标准分解如何消除相伴歧义？", answer: "提出总的非零常数，并让每个不可约因式首一。" },
    { question: "四次多项式没有当前域中的根，能直接判不可约吗？", answer: "不能，它仍可能分成两个二次因式。" },
  ],
  summary: [
    "存在性来自次数下降；唯一性来自不可约因式的素性。",
    "标准分解由常数、首一不可约因式与重数组成。",
    "扩张系数域会让某些不可约叶继续分裂。",
  ],
  exercises: [
    `在 ${texInline("\\mathbb Q[x]")} 与 ${texInline("\\mathbb R[x]")} 中分解 ${texInline("x^4-5x^2+4")}。`,
    "用 Bézout 等式证明不可约因式整除乘积的性质。",
    "给出两条不同的拆分路径，并比较最终标准叶。",
  ],
});
