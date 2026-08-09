defineChapter1Section("multiple-factors", {
  number: "§6",
  textbookSection: "重因式",
  title: "重因式：重复次数怎样被导数看见",
  navTitle: "重因式",
  question: "一个根重复 m 次时，为什么 f 与 f′ 会共享 m−1 次这个因式？图像的穿过、贴住和平坦程度能说明多少？",
  goal: `掌握因式重数、根的重数与导数消失判别；会用 ${texInline("\\gcd(f,f')")} 找出重复部分，并理解平方自由分解。`,
  tags: ["重因式", "导数", "gcd(f,f′)", "平方自由"],
  intro:
    "重数首先是标准分解中的指数。求导会把 (x−a)ᵐ 至少降为 (x−a)ᵐ⁻¹，所以 f 与 f′ 的公共部分准确记录重复因式。实函数图像提供奇偶直觉，代数分解和 gcd 才给出精确判定。",
  concepts: [
    { label: "因式重数", text: `${texInline("p^m\\mid f")} 且 ${texInline("p^{m+1}\\nmid f")}。` },
    { label: "根的重数", text: `${texInline("f=(x-a)^mh")} 且 ${texInline("h(a)\\ne0")}。` },
    { label: "重复部分", text: `${texInline("\\gcd(f,f')")} 中 p 的指数比 f 中少 1。` },
    { label: "平方自由", text: `在本章的特征 0 数域上，${texInline("\\gcd(f,f')=1")} 当且仅当 f 没有重因式。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章 §6",
    items: ["重因式与重数", "导数判别", "无重因式条件", "平方自由部分"],
  },
  formal: {
    title: "导数把每个重复指数降低一次",
    intro:
      "把 f 在 a 附近写成 (x−a)ᵐh，且 h(a)≠0。这个条件把“至少 m 重”收紧为“恰好 m 重”。乘积求导后可以直接提出 (x−a)ᵐ⁻¹，而剩余括号在 a 处非零，因此重数恰好下降一次。",
    equation: "f=(x-a)^mh,\\ h(a)\\ne0\\quad\\Longrightarrow\\quad f'=(x-a)^{m-1}[mh+(x-a)h']",
    map: [
      { label: "调重数", text: "m 控制标准分解中的指数。" },
      { label: "同步求导", text: "观察同一线性因式在 f′ 中少一次。" },
      { label: "读取 gcd", text: "f 与 f′ 的公共部分汇总所有重复因式。" },
      { label: "对照图像", text: "实根的奇偶重数分别对应穿过与接触返回。" },
    ],
    bridge: {
      title: "公式、导数表、根轴和曲线由同一个 m 驱动",
      text: "实验中先读 gcd 和各阶导数，再看曲线。根合并模式刻意把两个单根连续靠近：屏幕上的距离可以趋近于零，代数重数只在 u=v 的精确时刻跳变。",
    },
    theorem: {
      label: "重根判别",
      title: "重数等价于连续导数的消失阶数",
      statement: `在本章的数域上，a 是 f 的 m 重根，当且仅当 ${texInline("f(a)=f'(a)=\\cdots=f^{(m-1)}(a)=0")} 且 ${texInline("f^{(m)}(a)\\ne0")}。因此 f 无重因式当且仅当 ${texInline("\\gcd(f,f')=1")}。`,
    },
    proof: {
      title: "从一个局部分解读出全部判据",
      steps: [
        { title: "提出最高幂", text: `写 ${texInline("f=(x-a)^mh")} 且 ${texInline("h(a)\\ne0")}。` },
        { title: "求一次导数", text: `${texInline("f'=(x-a)^{m-1}[mh+(x-a)h']")}；方括号在 a 处等于 ${texInline("mh(a)\\ne0")}。` },
        { title: "重复求导", text: "每求一次导数，(x−a) 的确定指数降低 1；前 m−1 阶导数在 a 处仍带有该因式。" },
        { title: "第 m 阶首次非零", text: `${texInline("f^{(m)}(a)=m!h(a)\\ne0")}。同样地，每个不可约因式 p 在 gcd(f,f′) 中留下指数 m−1。` },
      ],
    },
    definitions: [
      { title: "图像奇偶", text: `在实根附近，${texInline("h(a)\\ne0")} 的符号稳定，曲线局部形状由 ${texInline("(x-a)^m")} 控制：m 奇数时换号穿过，m 偶数时同号返回。` },
      { title: "平方自由部分", text: `若 ${texInline("d=\\gcd(f,f')")}，则 ${texInline("f/d")} 把每个不同不可约因式至少保留一次；更完整的平方自由分解可从连续 gcd 中恢复各重数层。` },
    ],
    boundary: {
      title: "非常接近的两个单根仍是两个单根",
      text: `${texInline("f=(x-u)(x-v)")} 在 ${texInline("u\\ne v")} 时满足 ${texInline("\\gcd(f,f')=1")}；无论 |u−v| 多小，两个因式仍不同。只有精确到 ${texInline("u=v")} 时，f 才变成平方，gcd 才出现 ${texInline("x-u")}。`,
    },
    pitfalls: [
      "pᵐ|f 只说明至少 m 重，还需排除 pᵐ⁺¹。",
      "曲线形状提供直觉，gcd 与导数提供判定。",
      "根的接近是连续参数，重数是精确的离散状态。",
    ],
    note: "导数把分解中的重数转成可计算条件。下一节用评价把根、余式和一次因式统一。",
  },
  interactive: {
    type: "slot",
    title: "实验：重数、导数与根合并",
    description: "调节根 a 与重数 m，同步观察 f、f′、gcd、导数消失表、根轴和固定坐标曲线。",
    task: "比较 m=1,2,3,4；再把两个单根逐渐靠近并令它们精确重合。",
    guide: [
      ["读代数", "先核对 f、f′ 与 gcd 中的因式指数。"],
      ["读导数", "找到在 a 处第一次非零的导数阶数。"],
      ["再看图像", "用奇偶解释穿过或接触返回。"],
    ],
    takeaway: "重数由精确因式指数决定；导数与 gcd 读取它，图像只呈现其实根局部形状。",
    prompts: [
      "比较 m=1 到 4 时 gcd 的指数。",
      "确认前 m−1 阶导数为 0，而第 m 阶非零。",
      "在根合并模式中区分“很近”与“相等”。",
    ],
  },
  example: {
    title: "用分解和导数交叉验证重数",
    question: `设 ${texInline("f=x^5-2x^4+x^3")}。求各根重数与 ${texInline("\\gcd(f,f')")}，并说明实图像的局部行为。`,
    choices: [
      { correct: true, text: `${texInline("f=x^3(x-1)^2")}；0 为 3 重根，1 为 2 重根；${texInline("\\gcd(f,f')=x^2(x-1)")}。` },
      { text: "0 与 1 都是单根，gcd=1。" },
      { text: `${texInline("\\gcd(f,f')=f")}。` },
      { text: "0 为 2 重根，1 为 3 重根。" },
    ],
    steps: [
      `${texInline("f=x^3(x^2-2x+1)=x^3(x-1)^2")}。`,
      `${texInline("f'=x^2(x-1)(5x-3)")}。`,
      `公共部分首一化得 ${texInline("x^2(x-1)")}。`,
      "0 的重数为奇数，曲线穿过；1 的重数为偶数，曲线接触后返回。",
    ],
  },
  quiz: [
    { question: "怎样表示 p 在 f 中恰好 m 重？", answer: `${texInline("p^m\\mid f")} 且 ${texInline("p^{m+1}\\nmid f")}。` },
    { question: "平方自由的 gcd 判别是什么？", answer: `${texInline("\\gcd(f,f')=1")}。` },
    { question: "偶数重实根附近的曲线怎样？", answer: "接触横轴后回到同一侧。" },
    { question: "两个不同根无限靠近会自动变成重根吗？", answer: "不会；只有参数精确相等时重数才改变。" },
  ],
  summary: [
    "重数是标准分解中不可约因式的精确指数。",
    "求导让重数降低一次，gcd(f,f′) 收集重复部分。",
    "实根图像由重数奇偶控制；精确判定依赖代数。",
  ],
  exercises: [
    `求 ${texInline("(x^2-1)^3(x+2)")} 的根重数与 ${texInline("\\gcd(f,f')")}。`,
    "证明 m 重根的导数消失阶数判别。",
    "设计一对相距 10⁻⁶ 的单根，并解释 gcd 为什么仍为 1。",
  ],
});
