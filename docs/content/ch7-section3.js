defineChapter7Section("matrix-of-linear-map", {
  number: "§3",
  textbookSection: "线性变换的矩阵",
  title: "线性变换的矩阵",
  navTitle: "线性变换的矩阵",
  question: "同一个线性变换换一组基，矩阵为什么变成相似的矩阵？",
  goal: `会写线性变换在一组基下的矩阵，掌握坐标公式与换基公式 ${texInline("B=X^{-1}AX")}，知道相似矩阵有相同的迹与行列式。`,
  tags: ["线性变换的矩阵", "过渡矩阵", "相似"],
  intro:
    `取定基 ${texInline(String.raw`\varepsilon_1,\dots,\varepsilon_n`)}，把 ${texInline(String.raw`\sigma\varepsilon_j`)} 的坐标排成第 ${texInline("j")} 列，就得到 ${texInline(String.raw`\sigma`)} 在这组基下的矩阵。换一组基，${texInline(String.raw`\sigma`)} 本身没有变，记录它的矩阵却变了。下面拖动新基，看矩阵怎样变，又有什么始终不变。`,
  concepts: [
    { label: "矩阵", text: `${texInline(String.raw`\sigma(\varepsilon_1,\dots,\varepsilon_n)=(\varepsilon_1,\dots,\varepsilon_n)A`)}` },
    { label: "换基", text: `${texInline(String.raw`(\eta)=(\varepsilon)X\Rightarrow B=X^{-1}AX`)}` },
  ],
  textbook: { reference: "北大版《高等代数》第七章 §3", items: ["线性变换在一组基下的矩阵", "坐标公式", "相似矩阵"] },
  interactive: { type: "slot", title: "同一个 σ，换一组基记录" },
  lesson3d: {
    blocks: [
      {
        title: "矩阵的列是基向量的像的坐标",
        tex: String.raw`\sigma(\varepsilon_1,\dots,\varepsilon_n)=(\varepsilon_1,\dots,\varepsilon_n)A`,
        text: `${texInline("A")} 的第 ${texInline("j")} 列是 ${texInline(String.raw`\sigma\varepsilon_j`)} 在 ${texInline(String.raw`\varepsilon_1,\dots,\varepsilon_n`)} 下的坐标。若 ${texInline(String.raw`\xi`)} 的坐标是列向量 ${texInline("x")}，则 ${texInline(String.raw`\sigma\xi`)} 的坐标是 ${texInline("Ax")}。任给 ${texInline("n")} 个向量 ${texInline(String.raw`\alpha_1,\dots,\alpha_n`)}，有唯一的线性变换使 ${texInline(String.raw`\sigma\varepsilon_j=\alpha_j`)}，所以取定基以后，线性变换与 ${texInline("n")} 阶矩阵一一对应，和、乘积、逆分别对应矩阵的和、乘积、逆。`,
      },
      {
        title: `换基：${texInline("B=X^{-1}AX")}`,
        tex: String.raw`(\eta_1,\dots,\eta_n)=(\varepsilon_1,\dots,\varepsilon_n)X\ \Longrightarrow\ B=X^{-1}AX`,
        text: `${texInline("X")} 是由 ${texInline(String.raw`\varepsilon`)} 到 ${texInline(String.raw`\eta`)} 的过渡矩阵，第 ${texInline("j")} 列是 ${texInline(String.raw`\eta_j`)} 在 ${texInline(String.raw`\varepsilon`)} 下的坐标；${texInline("B")} 是 ${texInline(String.raw`\sigma`)} 在 ${texInline(String.raw`\eta`)} 下的矩阵。读法：${texInline("X")} 把 ${texInline(String.raw`\eta`)} 坐标翻译成 ${texInline(String.raw`\varepsilon`)} 坐标，${texInline("A")} 在 ${texInline(String.raw`\varepsilon`)} 坐标里作用，${texInline("X^{-1}")} 再翻译回 ${texInline(String.raw`\eta`)} 坐标。同一个线性变换在不同基下的矩阵彼此相似，迹、行列式和特征多项式都相同。`,
      },
      {
        title: "好的基让矩阵变简单",
        text: `若 ${texInline(String.raw`\sigma\eta_j=\lambda_j\eta_j`)}，${texInline("B")} 的第 ${texInline("j")} 列只在对角位置上有数 ${texInline(String.raw`\lambda_j`)}。每个 ${texInline(String.raw`\eta_j`)} 都这样时，${texInline("B")} 是对角矩阵。§4 寻找这样的向量，§5 讨论它们什么时候够组成一组基。`,
      },
    ],
    pitfalls: [
      `把 ${texInline(String.raw`\sigma\varepsilon_j`)} 的坐标写成行。按北大版约定，坐标写成列，依次排成 ${texInline("A")} 的各列。`,
      `把 ${texInline("B=X^{-1}AX")} 写成 ${texInline("XAX^{-1}")}。${texInline("X")} 的列是新基在旧基下的坐标，${texInline("B")} 在右边先乘 ${texInline("X")}。`,
      "以为换基改变了变换本身。改变的只是记录它的矩阵。",
    ],
  },
  example: {
    title: "例题：求导在两组基下的矩阵",
    question: `${texInline(String.raw`P[x]_4`)} 是次数小于 4 的实系数多项式（连同 0）组成的空间。求导 ${texInline("D")} 在基 ${texInline(String.raw`1,x,x^2,x^3`)} 下的矩阵 ${texInline("M")}，在基 ${texInline(String.raw`1,x,\tfrac{x^2}{2},\tfrac{x^3}{6}`)} 下的矩阵 ${texInline("N")}。`,
    choices: [
      { correct: true, text: `${texInline("M")} 在主对角线上方的一条斜线上依次是 ${texInline("1,2,3")}，其余为 ${texInline("0")}；${texInline("N")} 在这条斜线上全是 ${texInline("1")}。` },
      { text: `${texInline("M")} 在主对角线下方的一条斜线上依次是 ${texInline("1,2,3")}（把像的坐标排成了行）。` },
      { text: `${texInline("M")} 与 ${texInline("N")} 相同，因为它们记录的是同一个 ${texInline("D")}。` },
      { text: `${texInline("M")} 在主对角线上方依次是 ${texInline("1,2,3")}；${texInline("N")} 在这条斜线上依次是 ${texInline(String.raw`1,\tfrac12,\tfrac16`)}。` },
    ],
    steps: [
      `${texInline(String.raw`D1=0,\ Dx=1,\ Dx^2=2x,\ Dx^3=3x^2`)}，坐标列依次是 ${texInline(String.raw`(0,0,0,0)^T,(1,0,0,0)^T,(0,2,0,0)^T,(0,0,3,0)^T`)}，所以 ${texInline(String.raw`M=\begin{pmatrix}0&1&0&0\\0&0&2&0\\0&0&0&3\\0&0&0&0\end{pmatrix}`)}。`,
      `新基 ${texInline(String.raw`\eta_1,\dots,\eta_4`)}：${texInline(String.raw`D\eta_1=0,\ D\eta_2=\eta_1,\ D\tfrac{x^2}{2}=x=\eta_2,\ D\tfrac{x^3}{6}=\tfrac{x^2}{2}=\eta_3`)}，所以 ${texInline("N")} 在主对角线上方全是 ${texInline("1")}。`,
      `过渡矩阵 ${texInline(String.raw`X=\operatorname{diag}(1,1,\tfrac12,\tfrac16)`)}，验证 ${texInline(String.raw`N=X^{-1}MX`)}：例如第 3 行第 4 列是 ${texInline(String.raw`2\cdot3\cdot\tfrac16=1`)}。`,
      `${texInline("N")} 中 ${texInline("D")} 把每个基向量送到前一个。把这组基倒过来排成 ${texInline(String.raw`\tfrac{x^3}{6},\tfrac{x^2}{2},x,1`)}，${texInline("1")} 就移到主对角线下方，这正是 §8 的若尔当块 ${texInline("J(0,4)")}。`,
    ],
  },
  quiz: [
    {
      question: `${texInline(String.raw`\sigma`)} 在某组基下的矩阵是单位矩阵 ${texInline("E")}。${texInline(String.raw`\sigma`)} 在其他基下的矩阵是什么？${texInline(String.raw`\sigma`)} 是什么变换？`,
      answer: `${texInline("X^{-1}EX=E")}，在任何基下都是 ${texInline("E")}；${texInline(String.raw`\sigma`)} 是单位变换。`,
    },
    {
      question: "为什么相似矩阵的迹相同？",
      answer: `${texInline(String.raw`|\lambda E-X^{-1}AX|=|X^{-1}(\lambda E-A)X|=|\lambda E-A|`)}，特征多项式相同；迹是 ${texInline(String.raw`\lambda^{n-1}`)} 项系数的相反数。从几何上看，它们记录的是同一个线性变换。`,
    },
    {
      question: `${texInline(String.raw`\mathbb R^2`)} 上旋转 90° 的变换，在某组实基下的矩阵能是对角矩阵吗？`,
      answer: `不能。对角就意味着 ${texInline(String.raw`\sigma\eta_1=\lambda_1\eta_1`)}，有一条直线被保持；旋转 90° 把每条过原点的直线都转走了。`,
    },
    {
      question: `在实验中把 ${texInline(String.raw`\eta_1`)} 换成 ${texInline(String.raw`2\eta_1`)}、${texInline(String.raw`\eta_2`)} 不动，${texInline("B")} 的四个元素怎样变化？`,
      answer: `对角元不变，${texInline("b_{21}")} 乘 2，${texInline("b_{12}")} 除以 2：${texInline(String.raw`\sigma(2\eta_1)=b_{11}(2\eta_1)+2b_{21}\eta_2`)}，而 ${texInline(String.raw`\sigma\eta_2`)} 用 ${texInline(String.raw`2\eta_1`)} 表示时系数减半。`,
    },
  ],
  summary: [
    `${texInline(String.raw`\sigma`)} 在基 ${texInline(String.raw`\varepsilon`)} 下的矩阵 ${texInline("A")}：第 ${texInline("j")} 列是 ${texInline(String.raw`\sigma\varepsilon_j`)} 的坐标；${texInline(String.raw`\sigma\xi`)} 的坐标等于 ${texInline("A")} 乘 ${texInline(String.raw`\xi`)} 的坐标。`,
    `${texInline(String.raw`(\eta)=(\varepsilon)X`)} 时 ${texInline("B=X^{-1}AX")}：同一线性变换在不同基下的矩阵相似，迹与行列式不变。`,
    `基向量都落在被 ${texInline(String.raw`\sigma`)} 保持的直线上时，矩阵成为对角矩阵，这是 §4、§5 的出发点。`,
  ],
});
