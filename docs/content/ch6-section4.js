defineChapter6Section("change-of-basis", {
  number: "§4",
  textbookSection: "基变换与坐标变换",
  title: "基变换与坐标变换",
  navTitle: "基变换与坐标变换",
  question: "同一个向量换一组基，坐标怎样变？过渡矩阵的方向怎样记？",
  goal: `掌握过渡矩阵 ${texInline(String.raw`(\eta_1,\dots,\eta_n)=(\varepsilon_1,\dots,\varepsilon_n)A`)} 与坐标变换公式 ${texInline(String.raw`X=AY`)}；理解多项式在基 ${texInline(String.raw`1,x-a,(x-a)^2`)} 下的坐标就是 Taylor 系数。`,
  tags: ["过渡矩阵", "坐标变换", "X=AY", "Taylor 系数"],
  intro:
    `换基时向量本身不动，变的是度量它的那组基。把新基向量在旧基下的坐标排成列，得到过渡矩阵 ${texInline(String.raw`A`)}；同一向量的旧坐标 ${texInline(String.raw`X`)} 与新坐标 ${texInline(String.raw`Y`)} 满足 ${texInline(String.raw`X=AY`)}。拖动 ${texInline(String.raw`a`)}，看同一条抛物线在一族新基下的坐标。`,
  concepts: [
    { label: "过渡矩阵", text: "由基 ε 到基 η 的过渡矩阵 A 满足 (η)=(ε)A，第 j 列是 ηⱼ 在 ε 下的坐标。" },
    { label: "坐标变换", text: "旧坐标 X、新坐标 Y 满足 X=AY。" },
  ],
  textbook: { reference: "北大版《高等代数》第六章 §4", items: ["基变换与过渡矩阵", "过渡矩阵可逆", "坐标变换公式 X=AY"] },
  interactive: { type: "slot", title: "同一条曲线，换一组基" },
  lesson: {
    blocks: [
      {
        title: "过渡矩阵",
        tex: String.raw`(\eta_1,\eta_2,\dots,\eta_n)=(\varepsilon_1,\varepsilon_2,\dots,\varepsilon_n)A`,
        text: `${texInline("A")} 称为由基 ${texInline("\\varepsilon")} 到基 ${texInline("\\eta")} 的过渡矩阵，它的第 ${texInline("j")} 列是 ${texInline("\\eta_j")} 在基 ${texInline("\\varepsilon")} 下的坐标。${texInline("A")} 可逆，由 ${texInline("\\eta")} 到 ${texInline("\\varepsilon")} 的过渡矩阵是 ${texInline("A^{-1}")}。`,
      },
      {
        title: "坐标变换公式",
        tex: String.raw`X=AY,\qquad Y=A^{-1}X`,
        text: `${texInline("X,Y")} 是同一个 ${texInline("\\alpha")} 在 ${texInline("\\varepsilon,\\eta")} 下的坐标：${texInline("\\alpha=(\\varepsilon)X=(\\eta)Y=(\\varepsilon)AY")}，坐标唯一，所以 ${texInline("X=AY")}，旧坐标在左边。在 ${texInline("\\mathbb R^n")} 中把两组基排成矩阵 ${texInline("U,W")}，则 ${texInline("W=UA")}，${texInline("A=U^{-1}W")}；有的教材把它记作 ${texInline("P_{U\\leftarrow W}")}，意思相同。`,
      },
      {
        title: "多项式的 Taylor 坐标",
        tex: String.raw`p(x)=p(a)+p'(a)(x-a)+\tfrac12p''(a)(x-a)^2`,
        text: `在 ${texInline("P[x]_3")} 中，由 ${texInline("1,x,x^2")} 到 ${texInline("1,x-a,(x-a)^2")} 的过渡矩阵是 ${texInline("A_a=\\begin{pmatrix}1&-a&a^2\\\\0&1&-2a\\\\0&0&1\\end{pmatrix}")}，${texInline("p")} 的新坐标是 ${texInline("(p(a),p'(a),\\tfrac12p''(a))")}。${texInline("A_a^{-1}=A_{-a}")}：换回旧基相当于把 ${texInline("a")} 换成 ${texInline("-a")}。`,
      },
    ],
    pitfalls: [
      `把 ${texInline("X=AY")} 写成 ${texInline("Y=AX")}。记法：${texInline("A")} 的列描述新基，所以 ${texInline("A")} 乘新坐标得旧坐标。`,
      `把过渡矩阵的列写成旧基在新基下的坐标，得到的是 ${texInline("A^{-1}")}。`,
      "换基与线性变换不同：换基时向量不动，只换坐标。",
    ],
  },
  example: {
    title: "例题：求过渡矩阵与新坐标",
    question: `在 ${texInline("P[x]_3")} 中，求由 ${texInline("1,x,x^2")} 到 ${texInline("1,x-1,(x-1)^2")} 的过渡矩阵 ${texInline("A")}，以及 ${texInline("p=2+3x+x^2")} 在新基下的坐标 ${texInline("Y")}。`,
    choices: [
      { text: `${texInline("A=\\begin{pmatrix}1&1&1\\\\0&1&2\\\\0&0&1\\end{pmatrix}")}，${texInline("Y=(6,5,1)^T")}` },
      { correct: true, text: `${texInline("A=\\begin{pmatrix}1&-1&1\\\\0&1&-2\\\\0&0&1\\end{pmatrix}")}，${texInline("Y=(6,5,1)^T")}` },
      { text: `${texInline("A=\\begin{pmatrix}1&-1&1\\\\0&1&-2\\\\0&0&1\\end{pmatrix}")}，${texInline("Y=(2,3,1)^T")}` },
      { text: `${texInline("A=\\begin{pmatrix}1&-1&1\\\\0&1&-2\\\\0&0&1\\end{pmatrix}")}，${texInline("Y=(0,1,1)^T")}` },
    ],
    steps: [
      `新基在旧基下的坐标：${texInline("1\\to(1,0,0)^T")}，${texInline("x-1\\to(-1,1,0)^T")}，${texInline("(x-1)^2=1-2x+x^2\\to(1,-2,1)^T")}，按列排成 ${texInline("A")}。`,
      `旧坐标 ${texInline("X=(2,3,1)^T")}。由 ${texInline("X=AY")} 得 ${texInline("Y=A^{-1}X")}，其中 ${texInline("A^{-1}=\\begin{pmatrix}1&1&1\\\\0&1&2\\\\0&0&1\\end{pmatrix}")} 是由新基到旧基的过渡矩阵。`,
      `${texInline("Y=A^{-1}X=(6,5,1)^T")}，即 ${texInline("p=6+5(x-1)+(x-1)^2")}；也可以直接算 ${texInline("p(1)=6,\\ p'(1)=5,\\ \\tfrac12p''(1)=1")}。`,
      `验证 ${texInline("AY=(6-5+1,\\ 5-2,\\ 1)^T=(2,3,1)^T=X")}。${texInline("Y=(0,1,1)^T")} 那一项把公式写成了 ${texInline("Y=AX")}；${texInline("A")} 写成 ${texInline("\\begin{pmatrix}1&1&1\\\\0&1&2\\\\0&0&1\\end{pmatrix}")} 的那一项把 ${texInline("A")} 与 ${texInline("A^{-1}")} 弄反了；${texInline("Y=(2,3,1)^T")} 那一项直接把旧坐标当成了新坐标。`,
    ],
  },
  quiz: [
    {
      question: `由 ${texInline("1,x-1,(x-1)^2")} 到 ${texInline("1,x,x^2")} 的过渡矩阵是什么？`,
      answer: `${texInline("A^{-1}=\\begin{pmatrix}1&1&1\\\\0&1&2\\\\0&0&1\\end{pmatrix}")}：${texInline("x=(x-1)+1")}，${texInline("x^2=(x-1)^2+2(x-1)+1")}，按列排列。它正是 ${texInline("A_{-1}")}。`,
    },
    {
      question: `每个基向量都放大 2 倍，${texInline("\\eta_i=2\\varepsilon_i")}，坐标怎样变？`,
      answer: `${texInline("A=2E")}，${texInline("X=2Y")}，所以 ${texInline("Y=\\tfrac12X")}：基向量变长，坐标变小。`,
    },
    {
      question: `由 ${texInline("\\varepsilon")} 到 ${texInline("\\eta")} 的过渡矩阵为 ${texInline("A")}，由 ${texInline("\\eta")} 到 ${texInline("\\zeta")} 的过渡矩阵为 ${texInline("B")}。由 ${texInline("\\varepsilon")} 到 ${texInline("\\zeta")} 的过渡矩阵是什么？`,
      answer: `${texInline("(\\zeta)=(\\eta)B=(\\varepsilon)AB")}，是 ${texInline("AB")}。`,
    },
    {
      question: `实验中拖动 ${texInline("a")} 时，右图的点 ${texInline("X")} 为什么一动不动？`,
      answer: `${texInline("X")} 是 ${texInline("p")} 在旧基 ${texInline("1,x,x^2")} 下的坐标，旧基和 ${texInline("p")} 都没变。变的是新基 ${texInline("\\eta_j")}（${texInline("A_a")} 的列）和沿新基走到 ${texInline("X")} 所需的步数 ${texInline("Y")}。`,
    },
  ],
  summary: [
    `${texInline(String.raw`(\eta)=(\varepsilon)A`)}：${texInline(String.raw`A`)} 的列是新基在旧基下的坐标。`,
    `${texInline(String.raw`X=AY`)}，旧坐标在左；由 ${texInline(String.raw`\eta`)} 到 ${texInline(String.raw`\varepsilon`)} 的过渡矩阵是 ${texInline(String.raw`A^{-1}`)}。`,
    `多项式在 ${texInline(String.raw`1,x-a,(x-a)^2`)} 下的坐标是 Taylor 系数。`,
  ],
});
