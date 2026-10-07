defineChapter7Section("jordan-form-introduction", {
  number: "§8",
  textbookSection: "若尔当标准形简介",
  title: "若尔当标准形简介",
  navTitle: "若尔当标准形",
  question: "特征向量不够组成一组基时，矩阵最简能化成什么样？",
  goal: `认识若尔当块与若尔当形，知道复数域上每个矩阵都相似于若尔当形；会由 ${texInline(String.raw`A-\lambda E`)} 的各次幂的秩读出若尔当块的个数与大小。`,
  tags: ["若尔当块", "若尔当形", "链"],
  intro:
    `特征向量不够时，矩阵化不成对角形。退一步，在复数域上总能找到一组基，使矩阵只在主对角线下方多出一些 ${texInline("1")}：每串基向量被 ${texInline(String.raw`\sigma-\lambda E`)} 依次推到下一个，最后一个是特征向量，再推一次就是 ${texInline("0")}。`,
  concepts: [
    { label: "若尔当块", text: `${texInline(String.raw`J(\lambda,k)`)}：${texInline("k")} 阶，主对角线上全是 ${texInline(String.raw`\lambda`)}，紧挨在下方的一条斜线上全是 ${texInline("1")}。` },
    { label: "若尔当形", text: "由若干若尔当块组成的准对角矩阵。" },
  ],
  textbook: { reference: "北大版《高等代数》第七章 §8", items: ["若尔当块与若尔当形矩阵", "复矩阵相似于若尔当形"] },
  interactive: false,
  lesson3d: {
    blocks: [
      {
        title: "若尔当块就是一条链",
        tex: String.raw`J(\lambda,k)=\begin{pmatrix}\lambda&&&\\1&\lambda&&\\&\ddots&\ddots&\\&&1&\lambda\end{pmatrix},\qquad (\sigma-\lambda E)\varepsilon_1=\varepsilon_2,\ \dots,\ (\sigma-\lambda E)\varepsilon_k=0`,
        figure: "jordan-chain",
        text: `第 ${texInline("j")} 列表示 ${texInline(String.raw`\sigma\varepsilon_j=\lambda\varepsilon_j+\varepsilon_{j+1}`)}。链尾 ${texInline(String.raw`\varepsilon_k`)} 满足 ${texInline(String.raw`\sigma\varepsilon_k=\lambda\varepsilon_k`)}，是真正的特征向量；前面的向量要多作用几次 ${texInline(String.raw`\sigma-\lambda E`)} 才变成 ${texInline("0")}。图中两条链给出 ${texInline(String.raw`J(\lambda,3)\oplus J(\lambda,1)`)}：两个块，恰有两个线性无关的特征向量 ${texInline(String.raw`\varepsilon_3`)}、${texInline(String.raw`\varepsilon_4`)}。${texInline("k=1")} 时 ${texInline(String.raw`J(\lambda,1)=(\lambda)`)}，全由 1 阶块组成的若尔当形就是对角矩阵。`,
      },
      {
        title: "存在与唯一",
        tex: String.raw`A\sim J=\begin{pmatrix}J(\lambda_1,k_1)&&\\&\ddots&\\&&J(\lambda_s,k_s)\end{pmatrix}`,
        text: `复数域上每个 ${texInline("n")} 阶矩阵都相似于一个若尔当形矩阵；除去若尔当块的排列次序，这个若尔当形由 ${texInline("A")} 唯一决定。说成线性变换：复线性空间上的 ${texInline(String.raw`\sigma`)} 在某组基下的矩阵是若尔当形。`,
      },
      {
        title: "用秩读出块的结构",
        tex: String.raw`\#\{\lambda\ \text{的块}\}=n-\operatorname{rank}(A-\lambda E),\qquad \#\{\lambda\ \text{的块中阶数}\ge k\ \text{的}\}=\operatorname{rank}(A-\lambda E)^{k-1}-\operatorname{rank}(A-\lambda E)^{k}`,
        text: `每个块恰好贡献一个特征向量（链尾），所以块数等于特征子空间的维数；所有属于 ${texInline(String.raw`\lambda`)} 的块的阶数之和等于 ${texInline(String.raw`\lambda`)} 的重数。${texInline(String.raw`\lambda`)} 的重数 ${texInline(String.raw`\le3`)} 时这两条信息已够定出属于 ${texInline(String.raw`\lambda`)} 的若尔当块，更高阶时要用第二个公式。`,
      },
    ],
    pitfalls: [
      `以为特征多项式加上特征子空间的维数总能确定若尔当形。4 阶时 ${texInline("2+2")} 与 ${texInline("3+1")} 两种块结构的这两项数据完全相同。`,
      `把链上的箭头当成 ${texInline(String.raw`\sigma`)} 的作用。推动链的是 ${texInline(String.raw`\sigma-\lambda E`)}，${texInline(String.raw`\sigma`)} 本身把 ${texInline(String.raw`\varepsilon_j`)} 送到 ${texInline(String.raw`\lambda\varepsilon_j+\varepsilon_{j+1}`)}。`,
      "在实数域上套用若尔当形。存在性要求特征多项式分解成一次因式，旋转 90° 在实数域上就没有若尔当形。",
    ],
  },
  example: {
    title: "例题：由秩确定若尔当形",
    question: `求 ${texInline(String.raw`A=\begin{pmatrix}1&1&0\\-1&3&0\\0&0&2\end{pmatrix}`)} 的若尔当形，并找出对应的链。`,
    choices: [
      { correct: true, text: texInline(String.raw`J=\begin{pmatrix}2&0&0\\1&2&0\\0&0&2\end{pmatrix}`) + "，一个 2 阶块和一个 1 阶块。" },
      { text: texInline(String.raw`J=\begin{pmatrix}2&0&0\\1&2&0\\0&1&2\end{pmatrix}`) + "，一个 3 阶块。" },
      { text: texInline(String.raw`J=2E`) + "，因为特征值只有 2。" },
      { text: texInline(String.raw`J=\operatorname{diag}(1,3,2)`) + "，读对角元即可。" },
    ],
    steps: [
      `${texInline(String.raw`|\lambda E-A|=(\lambda-2)\big[(\lambda-1)(\lambda-3)+1\big]=(\lambda-2)^3`)}，特征值只有 2，重数 3。`,
      `${texInline(String.raw`A-2E=\begin{pmatrix}-1&1&0\\-1&1&0\\0&0&0\end{pmatrix}`)}，秩为 ${texInline("1")}，所以 ${texInline(String.raw`\dim V_2=3-1=2`)}：有 2 个块，阶数之和为 ${texInline("3")}，只能是 ${texInline("2+1")}。`,
      `链：取 ${texInline(String.raw`\eta_1=(1,0,0)^T`)}，${texInline(String.raw`\eta_2=(A-2E)\eta_1=(-1,-1,0)^T`)}，${texInline(String.raw`(A-2E)\eta_2=0`)}；另取特征向量 ${texInline(String.raw`\eta_3=(0,0,1)^T`)}，它单独组成一条长为 1 的链。`,
      `验证：${texInline(String.raw`A\eta_1=(1,-1,0)^T=2\eta_1+\eta_2`)}，${texInline(String.raw`A\eta_2=2\eta_2`)}，${texInline(String.raw`A\eta_3=2\eta_3`)}。以 ${texInline(String.raw`X=(\eta_1,\eta_2,\eta_3)`)} 为过渡矩阵，${texInline(String.raw`X^{-1}AX=J`)}。`,
    ],
  },
  quiz: [
    {
      question: `两个 4 阶矩阵的特征多项式都是 ${texInline(String.raw`(\lambda-2)^4`)}，特征子空间 ${texInline("V_2")} 都是 2 维的。它们一定相似吗？`,
      answer: `不一定。两个块的阶数可以是 ${texInline("2+2")}，也可以是 ${texInline("3+1")}。用 ${texInline(String.raw`\operatorname{rank}(A-2E)^2`)} 区分：${texInline("2+2")} 时为 ${texInline("0")}，${texInline("3+1")} 时为 ${texInline("1")}。`,
    },
    {
      question: `若 ${texInline("A^2=O")}，${texInline("A")} 的若尔当块最大是几阶？`,
      answer: `特征值只能是 ${texInline("0")}，${texInline(String.raw`J(0,k)^{k-1}\ne O`)} 而 ${texInline("J(0,k)^k=O")}，所以 ${texInline(String.raw`k\le2`)}，每个块是 1 阶或 2 阶。`,
    },
    {
      question: "若尔当形什么时候是对角矩阵？这和 §5 的可对角化条件是什么关系？",
      answer: `每个块都是 1 阶，即每个 ${texInline(String.raw`\lambda`)} 的块数（特征子空间的维数）等于 ${texInline(String.raw`\lambda`)} 的重数。这正是 ${texInline("n")} 个线性无关的特征向量存在的条件。`,
    },
    {
      question: `§3 的求导 ${texInline("D")} 作用在 ${texInline(String.raw`P[x]_4`)} 上，它的若尔当形是什么？用哪组基？`,
      answer: `${texInline("D")} 的特征值只有 ${texInline("0")}，核是一维的，所以只有一个块 ${texInline("J(0,4)")}。基取 ${texInline(String.raw`\tfrac{x^3}{6},\tfrac{x^2}{2},x,1`)}：${texInline("D")} 把每个依次送到下一个，最后 ${texInline("D1=0")}。`,
    },
  ],
  summary: [
    `若尔当块 ${texInline(String.raw`J(\lambda,k)`)} 是一条链：${texInline(String.raw`\sigma-\lambda E`)} 把基向量依次推到下一个，链尾是特征向量。`,
    "复数域上每个矩阵都相似于若尔当形，除块的次序外唯一。",
    `${texInline(String.raw`\lambda`)} 的块数 ${texInline(String.raw`=\dim V_\lambda`)}，各块阶数之和 ${texInline(String.raw`=\lambda`)} 的重数；更细的结构由 ${texInline(String.raw`(A-\lambda E)^k`)} 的秩决定。`,
  ],
});
