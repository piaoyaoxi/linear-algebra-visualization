defineChapter1Section("polynomial-divisibility", {
  number: "§3",
  textbookSection: "整除的概念",
  title: "整除的概念",
  navTitle: "整除的概念",
  question: "整数除法中的“商和余数”怎样迁移到多项式？为什么每一步都必须消掉当前最高次项？",
  goal: "理解 g|f 与带余除法；掌握商余式唯一性与余式次数限制；识别单位与相伴。",
  tags: ["带余除法", "整除", "相伴"],
  intro:
    "多项式带余除法写成 f=qg+r，其中 r=0 或 deg r < deg g。每一步用当前余式首项除以除式首项，保证余式次数严格下降，因此算法必然终止。",
  concepts: [
    { label: "整除", text: `${texInline("g\\mid f")} 表示存在多项式 ${texInline("q")} 使 ${texInline("f=qg")}（余式为 0）。` },
    { label: "带余除法", text: `${texInline("f=qg+r")}，${texInline("r=0")} 或 ${texInline("\\deg r<\\deg g")}。` },
    { label: "唯一性", text: "在除式非零时，商与余式唯一。" },
    { label: "单位与相伴", text: `非零常数倍互相整除，称为相伴；后续最大公因式常取首一形式。` },
    { label: "精确判定", text: "余式必须精确为零才叫整除；不使用“差不多为零”。" },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章",
    items: ["整除的定义", "带余除法", "单位与相伴"],
  },
  interactive: {
    type: "slot",
    title: "实验：除法阶梯",
    description: "单步/自动播放多项式长除法，观察首项消去与余式次数下降。",
    task: "对 x⁴−1 除以 x²+x+1 完整走完，判断是否整除。",
    prompts: [
      "点“下一步”，只看当前被消去的最高次项。",
      "确认每一步余式次数下降。",
      "走到结束，读出商与余式。",
      "切换到整除示例，看余式为 0 时状态点亮。",
    ],
  },
  example: {
    title: "例题：x⁴−1 除以 x²+x+1",
    question: `用带余除法计算 ${texInline("x^4-1")} 除以 ${texInline("x^2+x+1")}，写出商、余式，并判断是否整除。`,
    choices: [
      {
        correct: true,
        text: `商 ${texInline("x^2-x")}，余式 ${texInline("x-1")}，不整除。`,
      },
      { text: `商 ${texInline("x^2+1")}，余式 0，整除。` },
      { text: `商 ${texInline("x^2-x")}，余式 0，整除。` },
      { text: "多项式除法不保证余式次数低于除式。" },
    ],
    steps: [
      `首项：${texInline("x^4/x^2=x^2")}，乘回 ${texInline("x^4+x^3+x^2")}，相减得 ${texInline("-x^3-x^2-1")}。`,
      `再取 ${texInline("-x^3/x^2=-x")}，乘回 ${texInline("-x^3-x^2-x")}，相减得 ${texInline("x-1")}。`,
      `余式次数 1 < 2，停止。商 ${texInline("x^2-x")}，余式 ${texInline("x-1")}\\ne 0，故不整除。`,
    ],
  },
  quiz: [
    { question: "整除 g|f 的定义是什么？", answer: "存在多项式 q 使 f=qg。" },
    { question: "带余除法对余式的次数有何限制？", answer: "r=0 或 deg r < deg g。" },
    { question: "为什么每一步要消当前最高次项？", answer: "保证余式次数严格下降，算法在有限步终止。" },
    { question: "什么是相伴多项式？", answer: "彼此相差非零常数倍，互相整除。" },
    { question: "余式“非常接近 0”能否说整除？", answer: "不能。整除要求精确为零。" },
    { question: "商和余式是否唯一？", answer: "在除式非零时唯一。" },
  ],
  summary: [
    "带余除法把整数除法迁移到多项式。",
    "余式次数限制保证过程终止且结论干净。",
    "整除当且仅当最终余式精确为 0。",
    "下一节用反复取余得到最大公因式。",
  ],
  exercises: [
    "计算 x³−1 除以 x−1 的商与余式。",
    "说明 f 与 2f 为何相伴。",
  ],
});
