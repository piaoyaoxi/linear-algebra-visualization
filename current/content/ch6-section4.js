defineChapter6Section("change-of-basis", {
  number: "§4",
  textbookSection: "基变换与坐标变换",
  title: "基变换与坐标变换",
  navTitle: "基变换与坐标变换",
  question: "同一个向量由两组基描述时，怎样系统地把旧坐标换成新坐标？过渡矩阵的方向为什么必须写清楚？",
  goal: "区分向量与坐标表示；用基矩阵恢复几何向量；从 Ux=Wy 推导 P(W←U)=W⁻¹U；解释过渡矩阵各列的含义、往返与复合规律，并分清被动换基和主动线性变换。",
  tags: ["基矩阵", "过渡矩阵", "方向与复合", "主动被动"],
  prerequisites: ["理解有序基给出唯一坐标。", "会计算可逆矩阵及矩阵乘法。"],
  objectives: [
    "从基矩阵方程推导坐标变换公式。",
    "读出过渡矩阵第 j 列是旧基第 j 个向量在新基下的坐标。",
    "通过恢复同一个向量检验过渡矩阵方向。",
  ],
  intro:
    "坐标是相对于基的编码。更换有序基时，空间中的向量保持原位，编码规则发生变化。Lay 的换基图和 Axler 的坐标映射共同揭示了一个可靠流程：旧坐标先经旧基恢复为向量，再由新基重新读取。",
  videoPlan: {
    title: "同一向量，不同坐标",
    duration: "约 2—3 分钟",
    scenes: ["固定几何向量 v。", "连续改变基与网格，坐标数字同步变化。", "由 Ux=Wy 推导 W⁻¹U。", "对照主动变换 v↦Av。"],
  },
  concepts: [
    { label: "基矩阵", text: texInline("U=[u_1\\ \\cdots\\ u_n]") + "，列顺序与坐标顺序一致。" },
    { label: "坐标恢复", text: texInline("v=U[v]_U") + "。" },
    { label: "过渡矩阵", text: texInline("P_{W\\leftarrow U}=W^{-1}U") + "。" },
    { label: "列的含义", text: "第 j 列是 [uⱼ]W。" },
    { label: "复合", text: texInline("P_{Z\\leftarrow U}=P_{Z\\leftarrow W}P_{W\\leftarrow U}") + "。" },
  ],
  textbook: {
    reference: "Lay · Axler · Friedberg",
    items: ["基矩阵与坐标映射", "过渡矩阵的列", "坐标变换的方向", "换基复合", "主动与被动"],
  },
  story: {
    title: "对象与表示：换基时真正改变的是坐标语言",
    lead:
      "整节只追踪三个对象：固定的向量 v、两组有序基 U 与 W、两组坐标 [v]U 与 [v]W。每个公式都应能回答它把哪一种坐标送到哪一种坐标。",
    modules: [
      {
        number: "01",
        title: "基矩阵把坐标列恢复为向量",
        subtitle: "坐标分量正是各基向量前的系数。",
        blocks: [
          {
            type: "formula",
            kicker: "恢复公式",
            formula: texDisplay("U=[u_1\\ \\cdots\\ u_n],\\qquad v=U[v]_U=x_1u_1+\\cdots+x_nu_n"),
            text: "基矩阵的列依次是有序基向量。矩阵乘坐标列，恰好把各列按坐标系数组合成 v。",
          },
          {
            type: "misconception",
            title: "对象与表示",
            items: [
              "v 属于向量空间 V；[v]U 属于坐标空间 Fⁿ。",
              "只有在标准基下，坐标列才会与常见几何分量看起来相同。",
              "交换基的顺序会交换对应坐标位置，向量本身保持不变。",
            ],
          },
        ],
      },
      {
        number: "02",
        title: "过渡矩阵来自“先恢复，再重新读取”",
        subtitle: "方向由目标坐标写在箭头左端的记号确定。",
        blocks: [
          {
            type: "proof",
            items: [
              { title: "写出同一个向量", text: texInline("v=Ux=Wy") + "，其中 x=[v]U，y=[v]W。" },
              { title: "从旧坐标恢复", text: "Ux 把 U 坐标 x 送回空间中的向量 v。" },
              { title: "用新基读取", text: texInline("y=W^{-1}v") + "，因为 W 可逆。" },
              { title: "合并两步", text: texInline("y=W^{-1}Ux=P_{W\\leftarrow U}x") + "，所以 P(W←U)=W⁻¹U。" },
            ],
          },
          {
            type: "note",
            title: "快速方向检查",
            text: "矩阵右侧输入 U 坐标，左侧输出 W 坐标。若结果无法通过 Ux=Wy 恢复同一个向量，矩阵方向或计算已经出错。",
          },
        ],
      },
      {
        number: "03",
        title: "过渡矩阵的列直接记录旧基在新基中的坐标",
        subtitle: "这给出一种无需先写 W⁻¹U 的构造方法。",
        blocks: [
          {
            type: "formula",
            kicker: "第 j 列",
            formula: texDisplay("P_{W\\leftarrow U}e_j=W^{-1}Ue_j=W^{-1}u_j=[u_j]_W"),
            text: "依次把 u₁,…,uₙ 用 W 表示，并把所得坐标列排在一起，就得到 P(W←U)。",
          },
          {
            type: "cards",
            items: [
              { kicker: "同一组基", title: texInline("P_{U\\leftarrow U}=I"), text: "每个基向量在自身基下的坐标是标准单位列。" },
              { kicker: "反向换回", title: texInline("P_{U\\leftarrow W}=P_{W\\leftarrow U}^{-1}"), text: "两次往返必须恢复原坐标。" },
              { kicker: "三组基", title: texInline("P_{Z\\leftarrow U}=P_{Z\\leftarrow W}P_{W\\leftarrow U}"), text: "先 U→W，再 W→Z；矩阵乘法次序与复合一致。" },
            ],
          },
        ],
      },
      {
        number: "04",
        title: "被动换基与主动变换固定不同对象",
        subtitle: "两者都使用矩阵，所描述的过程却完全不同。",
        blocks: [
          {
            type: "definitions",
            items: [
              { kicker: "被动换基", title: texInline("[v]_U\\mapsto[v]_W"), text: "几何向量 v 固定；基、网格和坐标数字改变。" },
              { kicker: "主动变换", title: texInline("v\\mapsto Av"), text: "参照基固定；矩阵把向量送到空间中的另一个向量。" },
              { kicker: "检验问题", title: "什么保持不动？", text: "先回答这个问题，再判断页面中的矩阵属于哪一种过程。" },
            ],
          },
        ],
      },
      {
        number: "05",
        title: "退化向量组无法承担坐标系统",
        subtitle: "基向量相关时，覆盖性或唯一性至少有一项失败。",
        blocks: [
          {
            type: "formula",
            kicker: "退化边界",
            formula: texDisplay("\\det W=0\\quad\\Longrightarrow\\quad W^{-1}\\text{ 不存在}"),
            text: "此时某些向量没有 W 坐标，或同一向量拥有多组系数；合法的过渡矩阵也随之不存在。",
          },
        ],
      },
    ],
  },
  interactive: {
    type: "slot",
    title: "黄金实验：同一向量，新坐标",
    description: "在被动模式中固定向量，在主动模式中固定基，连续比较两种矩阵过程。",
    task: "先在被动模式中拖动基并核对 v 的端点，再让新基退化；随后切到主动模式，说明哪一个对象开始移动。",
    prompts: [
      "被动模式始终盯住 v 的端点，同时观察 W 坐标怎样补偿基的变化。",
      "让 U=W，验证过渡矩阵回到单位矩阵。",
      "选择退化预设，解释 det W=0 为什么使坐标读取失效。",
      "切到主动模式，比较输入 v 与输出 Av，并确认标准网格固定。",
    ],
  },
  example: {
    title: "例题：计算有方向的过渡矩阵",
    question:
      "设 " + texInline("U=((1,0)^T,(1,1)^T)") + "，" + texInline("W=((1,1)^T,(-1,1)^T)") + "，且 " + texInline("[v]_U=(2,1)^T") + "。求 " + texInline("P_{W\\leftarrow U}") + " 与 " + texInline("[v]_W") + "，并验证两组坐标恢复同一个 v。",
    choices: [
      { correct: true, text: "P(W←U)=½[[1,2],[-1,0]]，[v]W=(2,-1)ᵀ，且 U(2,1)ᵀ=W(2,-1)ᵀ=(3,1)ᵀ。" },
      { text: "P(W←U)=U⁻¹W；过渡方向可以省略。" },
      { text: "[v]W=(3,1)ᵀ，因为坐标总与标准分量相同。" },
      { text: "换基后 v 从 (3,1)ᵀ 移动到另一个几何位置。" },
    ],
    steps: [
      "写出基矩阵 U=[[1,1],[0,1]]、W=[[1,-1],[1,1]]。",
      "按方向计算 P(W←U)=W⁻¹U=½[[1,2],[-1,0]]；它的两列分别是 [u₁]W 与 [u₂]W。",
      "新坐标为 [v]W=P(W←U)[v]U=(2,-1)ᵀ。",
      "U(2,1)ᵀ=(3,1)ᵀ，W(2,-1)ᵀ=(3,1)ᵀ，验证了同一个向量。",
    ],
    audit: {
      kind: "change-of-basis",
      U: [[1, 1], [0, 1]],
      W: [[1, -1], [1, 1]],
      transition: [[0.5, 1], [-0.5, 0]],
      oldCoordinates: [2, 1],
      newCoordinates: [2, -1],
      vector: [3, 1],
    },
  },
  quiz: [
    { question: "P(W←U) 的第 j 列是什么？", answer: "旧基向量 uⱼ 在新基 W 下的坐标列 [uⱼ]W。" },
    { question: "怎样从坐标 [v]U 恢复向量 v？", answer: "用基矩阵左乘：v=U[v]U。" },
    { question: "为什么 P(W←U)=W⁻¹U？", answer: "先用 U 从旧坐标恢复 v，再用 W⁻¹读取新坐标。" },
    { question: "从 U 经 W 再换到 Z 时，矩阵怎样复合？", answer: "P(Z←U)=P(Z←W)P(W←U)，右侧的 U→W 先作用。" },
    { question: "主动变换与被动换基各固定什么？", answer: "主动变换固定参照基并移动向量；被动换基固定向量并改变基与坐标。" },
    { question: "两列相关的 W 能否定义坐标？", answer: "不能。W 不可逆，坐标存在性或唯一性失败。" },
  ],
  summary: [
    "基矩阵把坐标恢复为向量，逆基矩阵把向量读成坐标。",
    "P(W←U)=W⁻¹U，方向、列意义、往返和复合都能由这一公式解释。",
    "被动换基固定向量；主动变换固定参照基并移动向量。",
  ],
  bridge: "下一节进入已知线性空间内部，判断哪些子集能够继承这套线性结构。",
  exercises: ["自选 ℝ² 的三组基并验证过渡矩阵的复合规律。", "用“过渡矩阵的列”方法重新计算本节例题。"],
});
