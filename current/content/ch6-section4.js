defineChapter6Section("change-of-basis", {
  number: "§4",
  textbookSection: "基变换与坐标变换",
  title: "基变换与坐标变换",
  navTitle: "基变换与坐标变换",
  question: "同一个向量为什么会有不同坐标？更换基时，究竟是什么变了，什么没有变？",
  goal: "区分向量本身与坐标；使用基矩阵与 v=Ux；正确书写过渡矩阵 P_{W←U}=W^{-1}U；完成坐标往返；区分主动线性变换与被动换基。",
  tags: ["过渡矩阵", "坐标变换", "主动与被动", "基矩阵"],
  intro:
    "换基是第六章的黄金样板：几何向量可以固定不动，变化的是基、网格与坐标数字。主动变换移动向量；被动换基改写表示。两种过程必须分开。",
  videoPlan: {
    title: "同一向量，不同坐标",
    duration: "约 2—3 分钟",
    scenes: [
      "固定箭头 v，标准基给出一组坐标。",
      "旋转或剪切基，箭头不动，坐标改变。",
      "写出 Ux=Wy 与 P_{W←U}=W^{-1}U。",
      "对比主动变换 Av，收束对象与表示。",
    ],
  },
  concepts: [
    { label: "基矩阵", text: '有序基 ' + texInline("U=(u_1,\\ldots,u_n)") + ' 对应矩阵 ' + texInline("U=[u_1\\ \\cdots\\ u_n]") + '。' },
    { label: "坐标恢复", text: texInline("v=Ux") + '，其中 ' + texInline("x=[v]_U") + '。' },
    { label: "同一向量", text: texInline("Ux=Wy") + ' 表示两组坐标描述同一个 v。' },
    { label: "过渡矩阵", text: texInline("P_{W\\leftarrow U}=W^{-1}U") + '，于是 ' + texInline("y=P_{W\\leftarrow U}x") + '。' },
    { label: "往返", text: texInline("P_{U\\leftarrow W}P_{W\\leftarrow U}=I") + '。' },
    { label: "主动 / 被动", text: "主动：基固定，向量 v↦Av；被动：向量固定，基与坐标改变。" },
  ],
  textbook: {
    reference: "北大版《高等代数》第六章",
    items: ["不同基下的坐标", "过渡矩阵", "坐标变换公式", "与线性变换的对比"],
  },
  interactive: {
    type: "slot",
    title: "实验：同一向量，新的坐标",
    description: "固定几何向量，切换或调节两组基，观察坐标与过渡矩阵同步更新；可切换主动变换模式对照。",
    task: "在被动模式下改变基，确认向量端点不动；再切换主动模式观察向量移动。",
    prompts: [
      "固定 v，只拖动第二组基，观察 y 变化而 v 不动。",
      "让两组基相同，确认过渡矩阵为单位矩阵。",
      "执行 U→W 再 W→U，检查往返。",
      "切换到主动变换，对比标题与动画差异。",
    ],
  },
  example: {
    title: "例题：计算过渡矩阵与新坐标",
    question: '设 ' + texInline("U=((1,0)^T,(1,1)^T)") + '，' + texInline("W=((1,1)^T,(-1,1)^T)") + '，且 ' + texInline("x=[v]_U=(2,1)^T") + '。<br>求 ' + texInline("P_{W\\leftarrow U}") + '、' + texInline("y=[v]_W") + '，并用 ' + texInline("Ux") + ' 与 ' + texInline("Wy") + ' 验证。',
    choices: [
      {
        correct: true,
        text: "P_{W←U}=½[[3,1],[-1,1]]（按列约定计算后），y=P x，且 Ux=Wy 得到同一几何向量。",
      },
      { text: "过渡矩阵是 U^{-1}W，方向与记号 P_{W←U} 相反也可混用。" },
      { text: "换基会移动几何向量，所以 Ux 与 Wy 表示不同点。" },
      { text: "只要维数相同，任意矩阵都可当作过渡矩阵。" },
    ],
    steps: [
      "先由 v=Ux 算出几何向量。",
      "过渡矩阵必须带方向：P_{W←U}=W^{-1}U。",
      "y=P_{W←U}x 得到 W 坐标。",
      "验证 Wy 与 Ux 相同，并检查 P_{U←W}P_{W←U}=I。",
    ],
  },
  quiz: [
    { question: "纯换基时几何向量如何运动？", answer: "不运动；改变的是基、网格和坐标。" },
    { question: "P_{W←U} 把谁变成谁？", answer: "把 U 坐标 x 变成 W 坐标 y=P_{W←U}x。" },
    { question: "主动变换与被动换基的关键差别？", answer: "主动移动向量；被动改写同一向量的坐标表示。" },
    { question: "两组基相同时过渡矩阵是什么？", answer: "单位矩阵。" },
    { question: "v=Ux 中 U 的列是什么？", answer: "有序基向量。" },
    { question: "为什么基必须有序？", answer: "列顺序与坐标分量顺序对应，交换顺序会改变坐标。" },
  ],
  summary: [
    "对象与表示要分开：向量可不动，坐标随基而变。",
    "过渡矩阵必须写清方向 P_{W←U}。",
    "主动变换与被动换基使用不同模式。",
    "下一节讨论空间的子集何时仍是线性空间。",
  ],
  exercises: [
    "自选两组 ℝ² 的基，计算往返过渡矩阵并验证乘积为单位阵。",
    "用一句话区分 Av 与换基后的新坐标。",
  ],
});
