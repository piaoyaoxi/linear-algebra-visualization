defineChapter1Section("multiple-factors", {
  number: "§6",
  textbookSection: "重因式",
  title: "重因式",
  navTitle: "重因式",
  question: "一个根重复出现多次时，代数因式、导数和函数图像会同时发生什么变化？",
  goal: "理解重数；掌握 gcd(f,f′) 判别；用奇偶重数解释实根处穿过或贴住横轴；区分接近与真正重根。",
  tags: ["重数", "导数", "平方自由"],
  intro: `若不可约 ${texInline("p")} 满足 ${texInline("p^m \\mid f")} 但 ${texInline("p^{m+1} \\nmid f")}，则 ${texInline("m")} 为重数。${texInline("f")} 无重因式当且仅当 ${texInline("\\gcd(f,f')=1")}。真正重根由精确代数条件判定，不由像素距离猜测。`,
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
    ],
  },
  example: {
    title: "例题：重数与 gcd",
    question: `设 ${texInline("f=(x-1)^3(x+1)")}。求 ${texInline("\\gcd(f,f')")}，并说明 1 与 −1 的重数。`,
    choices: [
      { correct: true, text: "1 为 3 重根，−1 为单根；gcd 含 (x−1)² 因子。" },
      { text: "两个根都是单根。" },
      { text: "gcd 必为 1。" },
      { text: "重数只能从图像目测。" },
    ],
    steps: ["写出 f 与 f′。", "用欧几里得求 gcd。", "对照定义读重数。"],
  },
  quiz: [
    { question: "无重因式的判别？", answer: "gcd(f,f′)=1。" },
    { question: "偶数重数图像如何？", answer: "贴住横轴后返回同一侧。" },
  ],
  summary: [
    "重数是精确幂次。",
    "gcd(f,f′) 判别重因式。",
    "奇偶解释穿过/贴住。",
  ],
  exercises: ["对给定 f 计算重数结构。"],
});
