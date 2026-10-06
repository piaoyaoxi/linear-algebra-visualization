defineChapter7Section("linear-map-definition", {
  number: "§1",
  textbookSection: "线性变换的定义",
  title: "线性变换的定义",
  navTitle: "线性变换的定义",
  question: "什么样的变换 σ: V→V 保持线性组合？",
  goal: "会按定义判断一个变换是否线性，包括多项式空间、矩阵空间上的变换；知道线性变换的基本性质。",
  tags: ["线性变换", "保持加法", "保持数乘"],
  intro:
    "线性空间 V 到自身的变换 σ，如果把线性组合送到同样系数的线性组合，就称为线性变换。判断时只看两件事：加法和数乘是否被保持。平移、取绝对值、取行列式都会在某一步失败。",
  concepts: [
    { label: "线性变换", text: `${texInline(String.raw`\sigma(\alpha+\beta)=\sigma\alpha+\sigma\beta`)}，${texInline(String.raw`\sigma(k\alpha)=k\,\sigma\alpha`)}，对一切 ${texInline(String.raw`\alpha,\beta\in V`)}、${texInline(String.raw`k\in P`)} 成立。` },
    { label: "线性映射", text: "V 到另一个空间 W 的映射满足同样两条时，称为线性映射。" },
  ],
  textbook: { reference: "北大版《高等代数》第七章 §1", items: ["线性变换的定义", "线性变换的简单性质"] },
  interactive: false,
  lesson3d: {
    blocks: [
      {
        title: "定义：保持加法与数乘",
        tex: String.raw`\sigma(k\alpha+l\beta)=k\,\sigma(\alpha)+l\,\sigma(\beta),\qquad \alpha,\beta\in V,\ k,l\in P`,
        text: "V 是数域 P 上的线性空间，σ 是 V 到自身的变换。上式对一切向量和数成立时，σ 称为线性变换。本章的线性变换都指 V 到自身；V 到另一个空间 W 的这类映射称为线性映射（例如 ℝ³ 到 ℝ² 的投影）。",
      },
      {
        title: "由定义直接得到的性质",
        tex: String.raw`\sigma(0)=0,\qquad \sigma(-\alpha)=-\sigma(\alpha),\qquad \sigma\Big(\sum_{i} k_i\alpha_i\Big)=\sum_i k_i\,\sigma(\alpha_i)`,
        text: `所以线性关系被保持：若 ${texInline(String.raw`\alpha_1,\dots,\alpha_s`)} 线性相关，则 ${texInline(String.raw`\sigma\alpha_1,\dots,\sigma\alpha_s`)} 也线性相关。反过来不成立，零变换把任何线性无关组都送成零向量。`,
      },
      {
        title: "平移为什么不是线性变换",
        figure: "translation-gap",
        text: `${texInline(String.raw`\tau(\alpha)=\alpha+\beta_0`)}（${texInline(String.raw`\beta_0\ne0`)}）：先加后变换得 ${texInline(String.raw`\alpha+\beta+\beta_0`)}，先变换后加得 ${texInline(String.raw`\alpha+\beta+2\beta_0`)}，两条路径始终差一个 ${texInline(String.raw`\beta_0`)}。也可以直接看 ${texInline(String.raw`\tau(0)=\beta_0\ne0`)}。`,
      },
    ],
    pitfalls: [
      `只验证 ${texInline(String.raw`\sigma(0)=0`)} 就下结论。它只是必要条件，下面例题里的 ${texInline(String.raw`T_4`)} 就是反例。`,
      "用一两对具体向量验证后就断定线性。定义要求对一切向量和数成立；否定线性时，一组反例就够。",
      "把 V 到 W 的映射也叫线性变换。本章的线性变换专指 V 到自身。",
    ],
  },
  example: {
    title: "例题：矩阵空间上的四个变换",
    question: `在 ${texInline(String.raw`M_2(\mathbb R)`)} 上，取定矩阵 A，令 ${texInline(String.raw`T_1(X)=AX-XA`)}，${texInline(String.raw`T_2(X)=X^{T}`)}，${texInline(String.raw`T_3(X)=X+E`)}，${texInline(String.raw`T_4(X)=|X|\,E`)}。哪些是线性变换？`,
    choices: [
      { correct: true, text: `${texInline("T_1")}、${texInline("T_2")} 是线性变换；${texInline("T_3")}、${texInline("T_4")} 不是。` },
      { text: `只有 ${texInline("T_2")} 是，因为 ${texInline("T_1")} 含矩阵乘法，而矩阵乘法不可交换。` },
      { text: `${texInline("T_1")}、${texInline("T_2")}、${texInline("T_4")} 是，因为它们都把零矩阵送到零矩阵。` },
      { text: `四个都是，因为它们都把 ${texInline(String.raw`M_2(\mathbb R)`)} 映到自身。` },
    ],
    steps: [
      `${texInline(String.raw`T_1(kX+lY)=A(kX+lY)-(kX+lY)A=k\,T_1(X)+l\,T_1(Y)`)}，线性。乘法不可交换不影响这一点。`,
      `${texInline(String.raw`(kX+lY)^{T}=kX^{T}+lY^{T}`)}，${texInline("T_2")} 线性。`,
      `${texInline(String.raw`T_3(0)=E\ne0`)}，不是线性变换。`,
      `${texInline(String.raw`T_4(0)=0`)}，但 ${texInline(String.raw`T_4(2E)=|2E|\,E=4E`)}，而 ${texInline(String.raw`2T_4(E)=2E`)}，数乘不被保持。`,
    ],
  },
  quiz: [
    {
      question: `在 ${texInline(String.raw`P[x]`)} 上，${texInline(String.raw`\sigma(f(x))=f(x+1)`)} 是线性变换吗？它和“平移 ${texInline(String.raw`\alpha\mapsto\alpha+\beta_0`)}”有什么不同？`,
      answer: "是线性变换：(kf+lg)(x+1)=kf(x+1)+lg(x+1)。它平移的是自变量 x，被变换的向量是整个多项式 f，零多项式仍变成零多项式；把向量本身加上 β₀ 才破坏线性。",
    },
    {
      question: `若 ${texInline(String.raw`\sigma\alpha_1,\dots,\sigma\alpha_s`)} 线性无关，${texInline(String.raw`\alpha_1,\dots,\alpha_s`)} 一定线性无关吗？`,
      answer: "一定。若 α₁,…,αₛ 线性相关，由线性关系被保持，σα₁,…,σαₛ 也线性相关，矛盾。",
    },
    {
      question: "一个变换把每条直线都映成直线，能推出它是线性变换吗？",
      answer: "不能。平移把直线映成直线，却不保持加法，也不把 0 送到 0。",
    },
    {
      question: `ℝ² 上的线性变换 σ 满足 ${texInline(String.raw`\sigma(1,0)=(2,1)`)}，${texInline(String.raw`\sigma(0,1)=(-1,3)`)}。${texInline(String.raw`\sigma(3,-2)`)} 是多少？为什么两个像就够了？`,
      answer: `${texInline(String.raw`\sigma(3,-2)=3\sigma(1,0)-2\sigma(0,1)=(8,-3)`)}。每个向量都是 (1,0)、(0,1) 的线性组合，而 σ 保持线性组合。`,
    },
  ],
  summary: [
    "线性变换是 V 到自身、保持加法和数乘的变换，它把线性组合送到同系数的线性组合。",
    "σ(0)=0 只是必要条件；否定线性只需一个反例，肯定线性要对一切向量与数验证。",
    "下一节把线性变换本身相加、相乘，得到新的线性变换。",
  ],
});
