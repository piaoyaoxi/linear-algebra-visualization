defineChapter1Section("multiple-factors", {
  number: "§6",
  textbookSection: "重因式",
  title: "重因式",
  navTitle: "重因式",
  question: "一个根重复出现多次时，代数因式、导数和函数图像会同时发生什么变化？",
  goal: "理解重数；掌握 gcd(f,f′) 判别；用奇偶重数解释实根处穿过或贴住横轴；区分接近与真正重根。",
  tags: ["重数", "导数", "平方自由"],
  intro:
    "若不可约 p 满足 p^m | f 但 p^{m+1} ∤ f，则 m 为重数。f 无重因式当且仅当 gcd(f,f′)=1。真正重根由精确代数条件判定，不由像素距离猜测。",
  concepts: [
    { label: "重数", text: `${texInline("f=(x-a)^m h")} 且 ${texInline("h(a)\\ne 0")} 时，a 是 m 重根。` },
    { label: "导数判别", text: `${texInline("\\gcd(f,f')=1")} 当且仅当 f 无重因式。` },
    { label: "奇偶图像", text: "奇数重数穿过横轴；偶数重数接触后返回；重数越高局部越平。" },
    { label: "精确临界", text: "两根很接近仍是两个单根；只有精确重合才是重根。" },
    { label: "平方自由", text: "可按重数层写成 f=f₁ f₂² f₃³ ⋯ 的结构分解。" },
  ],
  textbook: {
    reference: "北大版《高等代数》第一章",
    items: ["重因式", "导数与最大公因式", "无重因式判定"],
  },
  interactive: {
    type: "slot",
    title: "实验：根重数实验室",
    description: "调节重数 m 与根位置，同步因式指数、导数条件与固定相机下的图像。",
    task: "比较 m=1,2,3 时图像穿过/贴住，并用 gcd 读数验证。",
    prompts: [
      "把 m 设为 1，确认曲线穿过横轴。",
      "把 m 设为 2，看贴住并返回。",
      "把 m 设为 3，观察更平坦的穿过。",
      "确认相机范围固定，不会因点击而放大消失。",
    ],
  },
  example: {
    title: "例题：x⁵−2x⁴+x³ 的重根",
    question: `判断 ${texInline("f(x)=x^5-2x^4+x^3")} 的重根与重数，用 ${texInline("\\gcd(f,f')")} 验证，并描述实图像在根附近的穿过/贴住。`,
    choices: [
      {
        correct: true,
        text: `${texInline("f=x^3(x-1)^2")}：0 为 3 重根（穿过），1 为 2 重根（贴住）。`,
      },
      { text: "只有单根 0 与 1。" },
      { text: "0 为 2 重根，1 为 3 重根。" },
      { text: "无重根，因为可以因式分解。" },
    ],
    steps: [
      `${texInline("f=x^3(x^2-2x+1)=x^3(x-1)^2")}。`,
      `${texInline("f'=5x^4-8x^3+3x^2")}，${texInline("\\gcd(f,f')")} 含 ${texInline("x^2(x-1)")}。`,
      "0 处奇数重数：图像穿过；1 处偶数重数：贴住返回。",
    ],
  },
  quiz: [
    { question: "无重因式的充要条件是什么？", answer: "gcd(f,f′)=1。" },
    { question: "偶数重数根附近图像如何？", answer: "接触横轴后返回同一侧。" },
    { question: "两根非常接近是否等于重根？", answer: "不等于；重根要求精确重合。" },
    { question: "若 f=(x−a)^m h 且 h(a)≠0，f′ 至少含什么？", answer: "至少含 (x−a)^{m−1}。" },
    { question: "图像解释适用于哪些根？", answer: "主要解释实线性因式；复根不画到实轴上假装相交。" },
    { question: "平方自由部分指什么？", answer: "去掉所有平方（及更高）因子后的部分。" },
  ],
  summary: [
    "重数同时体现在因式指数、导数与局部图像。",
    "用 gcd(f,f′) 做代数判定。",
    "接近 ≠ 重合。",
    "下一节系统讨论多项式函数与插值。",
  ],
  exercises: [
    "对 f=(x−2)²(x+1) 计算 gcd(f,f′)。",
    "画草图说明 4 重根附近的平坦程度。",
  ],
});
