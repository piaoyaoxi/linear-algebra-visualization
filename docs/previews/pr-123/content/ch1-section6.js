defineChapter1Section("multiple-factors", {
  number: "§6",
  textbookSection: "重因式",
  title: "重因式",
  navTitle: "重因式",
  question: "怎样判断一个多项式有没有重因式？两个根靠在一起时会发生什么？",
  goal: `理解 ${texInline("m")} 重因式与重根；会用 ${texInline("\\gcd(f,f')")} 判断有无重因式。`,
  tags: ["重因式", "重根", "导数"],
  intro: `若不可约多项式 ${texInline("p")} 满足 ${texInline("p^m\\mid f")}、${texInline("p^{m+1}\\nmid f")}，就称 ${texInline("p")} 是 ${texInline("f")} 的 ${texInline("m")} 重因式，${texInline("m\\ge2")} 时叫重因式；${texInline("p=x-a")} 时说 ${texInline("a")} 是 ${texInline("m")} 重根。${texInline("m")} 重因式是 ${texInline("f'")} 的 ${texInline("m-1")} 重因式，所以 ${texInline("f")} 没有重因式当且仅当 ${texInline("\\gcd(f,f')=1")}。`,
  textbook: {
    reference: "北大版《高等代数》第一章 §6",
    items: ["重因式与重数", "重因式的判别"],
  },
  formal: {
    title: "导数与重因式",
    equation: "\\begin{gathered}f=(x-a)^m h,\\quad h(a)\\ne0\\\\ f'=(x-a)^{m-1}\\bigl[m\\,h+(x-a)h'\\bigr]\\end{gathered}",
    definitions: [
      {
        title: "为什么降一重",
        text: `上式方括号在 ${texInline("x=a")} 处等于 ${texInline("m\\,h(a)\\ne0")}，所以 ${texInline("a")} 恰好是 ${texInline("f'")} 的 ${texInline("m-1")} 重根。`,
      },
      {
        title: "判别法",
        text: `${texInline("f")} 没有重因式 ${texInline("\\iff\\gcd(f,f')=1")}。${texInline("f/\\gcd(f,f')")} 与 ${texInline("f")} 有相同的不可约因式，但每个只出现一次。`,
      },
      {
        title: "实根处的图像",
        text: `${texInline("m\\ge2")} 时曲线在该点与 ${texInline("x")} 轴相切；${texInline("m")} 为奇数时穿过 ${texInline("x")} 轴，为偶数时不穿过。两个单根靠得再近，曲线也穿过两次，只有重合时才相切。`,
      },
    ],
    pitfalls: [
      `看图估重数：两个很近的单根在图上像相切，但 ${texInline("\\gcd(f,f')=1")}。`,
      `把 ${texInline("\\gcd(f,f')")} 当成重因式的全部：${texInline("m")} 重因式在其中只出现 ${texInline("m-1")} 次。`,
    ],
    note: "多项式函数：代入、余数定理与根的个数。",
  },
  interactive: {
    type: "slot",
    title: "两根合并与重数",
    description: "让两个单根合并，再比较不同重数的图像。",
    task: `先猜一猜，再拖动 ${texInline("u")}、${texInline("v")} 让两根靠近，或点“令 ${texInline("v=u")}，两根合并”。下方画的是同一横轴上的 ${texInline("f'")}，看它的零点和 ${texInline("f")} 的根什么时候重合；再切到“单根重数”比较 ${texInline("m=1,2,3,4")}。`,
  },
  example: {
    title: "例题：求重根并用导数验证",
    question: `设 ${texInline("f(x)=x^5-2x^4+x^3")}。求各根的重数与 ${texInline("\\gcd(f,f')")}，并说明实图像在各根附近是否穿过 ${texInline("x")} 轴。`,
    choices: [
      {
        correct: true,
        text: `${texInline("f=x^3(x-1)^2")}：0 是 3 重根，1 是 2 重根；${texInline("\\gcd(f,f')=x^2(x-1)")}。`,
      },
      { text: `0 与 1 都是单根，${texInline("\\gcd(f,f')=1")}。` },
      { text: `${texInline("\\gcd(f,f')=f")}，因为 ${texInline("f")} 与 ${texInline("f'")} 有公共根。` },
      { text: "0 是 2 重根，1 是 3 重根。" },
    ],
    steps: [
      `${texInline("f=x^3(x^2-2x+1)=x^3(x-1)^2")}，所以 0 是 3 重根，1 是 2 重根。`,
      `${texInline("f'=5x^4-8x^3+3x^2=x^2(x-1)(5x-3)")}。`,
      `公共部分为 ${texInline("x^2(x-1)")}，与“每个重数减 1”一致。`,
      `0 的重数为奇数，曲线相切并穿过 ${texInline("x")} 轴；1 的重数为偶数，曲线相切后折回。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("x=1")} 是 ${texInline("f=x^3-3x+2")} 的几重根？`,
      answer: `2 重：${texInline("f(1)=0")}，${texInline("f'(1)=3-3=0")}，${texInline("f''(1)=6\\ne0")}；实际上 ${texInline("f=(x-1)^2(x+2)")}。`,
    },
    {
      question: `${texInline("\\gcd(f,f')=1")} 时，${texInline("f")} 在复数域中会有重根吗？`,
      answer: "不会。最大公因式由辗转相除求得，不随数域扩大而改变，所以在复数域中也没有重因式。",
    },
    {
      question: `${texInline("u\\ne v")} 但两者非常接近时，${texInline("(x-u)(x-v)")} 有重根吗？`,
      answer: `没有，${texInline("\\gcd(f,f')=1")}；只有 ${texInline("u=v")} 时才是二重根。`,
    },
    {
      question: `${texInline("a")} 是 ${texInline("f")} 的 ${texInline("m")} 重根时，各阶导数在 ${texInline("a")} 处的值有什么规律？`,
      answer: `${texInline("f(a)=f'(a)=\\cdots=f^{(m-1)}(a)=0")}，而 ${texInline("f^{(m)}(a)\\ne0")}。`,
    },
  ],
  summary: [
    `${texInline("m")} 重因式是 ${texInline("f'")} 的 ${texInline("m-1")} 重因式。`,
    `${texInline("f")} 没有重因式当且仅当 ${texInline("\\gcd(f,f')=1")}。`,
    `两个根只有精确重合才成为重根；实根处重数不小于 2 时曲线与 ${texInline("x")} 轴相切。`,
  ],
});
