defineChapter1Section("gcd-polynomials", {
  number: "§4",
  textbookSection: "最大公因式",
  title: "最大公因式：取余保持什么不变",
  navTitle: "最大公因式",
  question: "把 (f,g) 换成 (g,r) 时，为什么公共因式一个也没有丢？最后的余式怎样变成 Bézout 证书？",
  goal: `掌握首一最大公因式、欧几里得算法与扩展算法；能写出 ${texInline("d=sf+tg")} 并用它判断互素。`,
  tags: ["最大公因式", "欧几里得算法", "Bézout", "互素"],
  intro:
    "直接分解能够看见公共因式，欧几里得算法则在不知道分解的情况下找到它。带余式 f=qg+r 同时给出双向关系 r=f−qg 与 f=qg+r，所以 (f,g) 和 (g,r) 拥有完全相同的公共因式。",
  concepts: [
    { label: "首一 gcd", text: "d 同时整除 f、g，每个公共因式也都整除 d；再取首项系数为 1 的代表。“最大”按整除关系理解。" },
    { label: "取余不变量", text: `${texInline("\\gcd(f,g)=\\gcd(g,r)")}，其中 ${texInline("f=qg+r")}。` },
    { label: "Bézout 等式", text: `${texInline("\\gcd(f,g)=sf+tg")}，${texInline("s,t\\in F[x]")}。` },
    { label: "互素", text: `${texInline("\\gcd(f,g)=1")}，等价于存在 ${texInline("sf+tg=1")}。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章 §4 · Hoffman–Kunze 第 4 章 · Friedberg 多项式附录",
    items: ["最大公因式与首一规范", "欧几里得算法", "Bézout 等式", "互素多项式"],
  },
  formal: {
    title: "算法的核心：取余保持公共因式",
    intro:
      "每次取余都降低次数，却保留公共因式集合。最后一个非零余式因此与原来的 f、g 有同样的公共因式，并且它还能整除前一项，成为最大公因式。若同步记录每个余式如何由原始 f、g 组成，终点便自动附带 Bézout 表示。",
    equation: "f=qg+r\\quad\\Longrightarrow\\quad\\{f,g\\text{ 的公因式}\\}=\\{g,r\\text{ 的公因式}\\}",
    map: [
      { label: "保持", text: "用 f−qg 替换 f，公共因式集合保持不变。" },
      { label: "下降", text: "非零余式次数严格下降，算法有限步终止。" },
      { label: "规范", text: "最后非零余式首一化，得到唯一可比较的 gcd。" },
      { label: "回代", text: "同步更新线性组合系数，直接读出 s 与 t。" },
    ],
    bridge: {
      title: "左边是余式链，右边是同一过程留下的证明书",
      text: "实验每前进一步，A、B 变小但最终 gcd 不变；Bézout 面板从一开始就跟踪 A=s₁f+t₁g、B=s₂f+t₂g，因此到终点无需重新猜系数。",
    },
    theorem: {
      label: "Bézout 定理",
      title: "最大公因式能够由 f、g 的多项式线性组合得到",
      statement: `对不全为零的 ${texInline("f,g\\in F[x]")}，存在 ${texInline("s,t\\in F[x]")} 使首一最大公因式 ${texInline("d=sf+tg")}。特别地，${texInline("f,g")} 互素当且仅当 ${texInline("1=sf+tg")}。`,
    },
    proof: {
      title: "欧几里得算法同时证明存在性",
      steps: [
        { title: "公共因式双向保留", text: `由 ${texInline("r=f-qg")} 得“公因式整除 r”；由 ${texInline("f=qg+r")} 得反向结论。` },
        { title: "走到最后非零余式", text: "余式次数严格下降；设最后非零余式为 h，下一次相除余式为 0，所以 h 整除前一项。" },
        { title: "向前传播整除", text: "沿各等式反向看，h 逐步整除更早的两项，最终整除 f 和 g；而每个原公共因式又一直整除 h。" },
        { title: "同步线性组合", text: `初始 ${texInline("f=1\\cdot f+0\\cdot g")}、${texInline("g=0\\cdot f+1\\cdot g")}；每次 ${texInline("r=A-qB")} 同步更新系数。h 首一化后便得到 ${texInline("d=sf+tg")}。` },
      ],
    },
    definitions: [
      { title: "为什么要首一化", text: `${texInline("x-1")} 与 ${texInline("2x-2")} 具有同样的整除信息。把首项系数归一到 1 后，gcd 才成为唯一对象。` },
      { title: "理想视角", text: `全部线性组合 ${texInline("\\{sf+tg:s,t\\in F[x]\\}")} 中，次数最小的非零首一多项式正是 gcd；Bézout 等式说明它生成了全部线性组合。` },
      { title: "互素的用法", text: `若 ${texInline("sf+tg=1")}、${texInline("f\\mid gh")} 且 ${texInline("\\gcd(f,g)=1")}，等式乘 h 后可推出 ${texInline("f\\mid h")}。§5 的唯一分解会用到这一点。` },
    ],
    boundary: {
      title: "没有公共实根，仍可能存在公共因式",
      text: `取 ${texInline("f=x^2+1")}、${texInline("g=(x^2+1)(x+1)")}。两者没有公共实根，因为 f 没有实根；它们在 ${texInline("\\mathbb R[x]")} 中的 gcd 却是 ${texInline("x^2+1")}。互素必须通过 gcd 或 Bézout 判断。`,
    },
    pitfalls: [
      "次数较低的多项式未必整除另一个多项式。",
      "最后非零余式需要首一化。",
      "没有公共实根不足以推出在 R[x] 中互素。",
    ],
    note: "Bézout 证书让不可约因式拥有类似素数的整除性质。下一节由此证明不可约分解的唯一性。",
  },
  interactive: {
    type: "slot",
    title: "实验：欧几里得算法与 Bézout 证书",
    description: "逐步查看商、余式与次数下降；右侧同步显示当前对象的线性组合，终点再得到 gcd 的 Bézout 证书。",
    task: "完成 gcd(x⁴−1,x³−1) 的余式链，再切换到互素和含公共因式示例，逐个代回验证。",
    controlsTitle: "选择示例并推进余式链",
    controlsDescription: "每次点击下一步只揭示一轮取余；右侧同步追踪当前余式怎样由原始 f、g 线性组合得到。",
    guide: [
      ["取余", "从 A=qB+r 进入下一对 (B,r)。"],
      ["盯住不变量", "确认每一步的公共因式集合不变。"],
      ["核验证书", "把最终 s、t 代回 sf+tg。"],
    ],
    takeaway: "取余降低次数并保留公共因式；扩展算法把 gcd 连同 Bézout 证书一起算出。",
    prompts: [
      "每一步检查余式次数是否下降。",
      "到终点后确认最后非零余式已经首一。",
      "展开 sf+tg，核对它与 gcd 完全相等。",
    ],
  },
  example: {
    title: "求 gcd，并读出一组 Bézout 系数",
    question: `求 ${texInline("\\gcd(x^4-1,x^3-1)")}，并写成两个原多项式的线性组合。`,
    choices: [
      { correct: true, text: `${texInline("\\gcd=x-1")}，且 ${texInline("x-1=(x^4-1)-x(x^3-1)")}。` },
      { text: `${texInline("\\gcd=x^3-1")}，因为它次数较低。` },
      { text: `${texInline("\\gcd=1")}。` },
      { text: "gcd 只能从完整因式分解中得到。" },
    ],
    steps: [
      `${texInline("x^4-1=x(x^3-1)+(x-1)")}。`,
      `${texInline("x^3-1=(x^2+x+1)(x-1)")}。`,
      "最后非零余式 x−1 已首一，所以它是 gcd。",
      `第一步已经给出 ${texInline("x-1=1\\cdot(x^4-1)+(-x)(x^3-1)")}。`,
    ],
  },
  quiz: [
    { question: `${texInline("f=qg+r")} 为什么保持 gcd？`, answer: "(f,g) 与 (g,r) 的公共因式集合双向相同。" },
    { question: "欧几里得算法为什么终止？", answer: "非零余式次数严格下降。" },
    { question: "互素的一张可核验证书是什么？", answer: `${texInline("sf+tg=1")}。` },
    { question: "gcd 为什么统一取首一？", answer: "消除非零常数倍造成的相伴歧义。" },
  ],
  summary: [
    "取余替换保持全部公共因式，并让次数下降。",
    "最后非零余式首一化后就是 gcd。",
    "扩展欧几里得算法给出 d=sf+tg；d=1 正好刻画互素。",
  ],
  exercises: [
    `求 ${texInline("\\gcd(x^3-1,x^2-1)")} 并给出 Bézout 表示。`,
    `证明 ${texInline("\\gcd(f,g)=1,f\\mid gh\\Rightarrow f\\mid h")}。`,
    "给出两个没有公共实根、但 gcd 不是 1 的实系数多项式。",
  ],
});
