defineChapter10Section("symplectic-space", {
  number: "＊§4",
  textbookSection: "辛空间",
  title: "辛空间",
  navTitle: "辛空间",
  question: "什么样的双线性函数可以当作“有向面积”？",
  goal: "知道辛空间是带有非退化反对称双线性函数的线性空间，维数是偶数，存在辛基；知道辛变换保持 ω，在平面上就是行列式为 1 的线性变换。",
  tags: ["选学", "辛内积", "有向面积", "辛基", "辛变换"],
  intro:
    "平面上 ω(x,y)=x₁y₂−x₂y₁ 是 x、y 张成的平行四边形的有向面积。它是反对称的双线性函数，ω(x,x)=0，并且非退化。下面对 x、y 施加几种线性变换：剪切改变长度和角度，ω 却保持不变。",
  concepts: [
    { label: "辛内积", text: `${texInline(String.raw`\omega(\alpha,\beta)=-\omega(\beta,\alpha)`)}，且 ω 非退化` },
    { label: "辛变换", text: texInline(String.raw`K^TJK=J`) },
  ],
  textbook: { reference: "北大版《高等代数》第十章 ＊§4", items: ["辛空间与辛内积", "辛基", "辛变换"] },
  interactive: { type: "slot", title: "保持有向面积的变换" },
  lesson3d: {
    blocks: [
      {
        title: "辛空间",
        tex: String.raw`\omega(\alpha,\beta)=-\omega(\beta,\alpha),\qquad \omega(\alpha,\alpha)=0`,
        text: "数域 P 上的线性空间 V 带有一个非退化的反对称双线性函数 ω，称为辛空间，ω 称为辛内积。反对称矩阵满足 |A|=|Aᵀ|=|−A|=(−1)ⁿ|A|，n 为奇数时 |A|=0，所以辛空间的维数是偶数。",
        ponder: {
          q: "平面上 ω(x,y)=0 说明 x、y 是什么关系？",
          a: "x、y 共线：平行四边形压成一条线段，有向面积为 0。",
        },
      },
      {
        title: "辛基",
        tex: String.raw`\omega(\varepsilon_i,\varepsilon_{-i})=1,\quad \omega(\varepsilon_i,\varepsilon_j)=0\ (i+j\ne0),\qquad J=\begin{pmatrix}0&E_n\\-E_n&0\end{pmatrix}`,
        text: "2n 维辛空间中存在满足上式的基 ε₁,…,εₙ,ε₋₁,…,ε₋ₙ，称为辛基，ω 在辛基下的矩阵是 J。平面上 ε₁=(1,0)、ε₋₁=(0,1) 就是一组辛基。",
        ponder: {
          q: "平面上给定 ε₁=(1,0)，满足 ω(ε₁,ε₋₁)=1 的 ε₋₁ 唯一吗？",
          a: "不唯一。ε₋₁=(t,1) 对任意 t 都满足 ω(ε₁,ε₋₁)=1。",
        },
      },
      {
        title: "辛变换",
        tex: String.raw`\omega(\sigma\alpha,\sigma\beta)=\omega(\alpha,\beta)\iff K^TJK=J`,
        text: "保持辛内积的线性变换称为辛变换，K 是它在辛基下的矩阵。平面上 ω(Kx,Ky)=|K|ω(x,y)，所以辛变换就是 |K|=1 的变换，例如剪切与旋转。高维时辛变换的行列式仍是 1，但 |K|=1 不能保证 K 是辛变换。",
        ponder: {
          q: "P⁴ 中取辛基 ε₁, ε₂, ε₋₁, ε₋₂，K=diag(2,1,1,½)。|K|=1，K 是辛变换吗？",
          a: "不是。ω(Kε₁,Kε₋₁)=ω(2ε₁,ε₋₁)=2≠1。",
        },
      },
    ],
    pitfalls: [
      "以为辛变换保持长度和角度。剪切保持 ω，却改变长度与夹角。",
      "把 ω 当作内积。ω(x,x)=0 对一切 x 成立，它不衡量长度。",
      "以为高维时 |K|=1 就够了。辛变换的条件是 KᵀJK=J。",
    ],
  },
  example: {
    title: "例题：哪个变换保持 ω",
    question: `平面上 ${texInline(String.raw`\omega(x,y)=x_1y_2-x_2y_1`)}。哪个矩阵 K 使 ${texInline(String.raw`\omega(Kx,Ky)=\omega(x,y)`)} 对一切 x, y 成立？`,
    choices: [
      { correct: true, text: texInline(String.raw`\begin{pmatrix}1&3\\0&1\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}2&0\\0&2\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}0&1\\1&0\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}2&0\\0&1\end{pmatrix}`) },
    ],
    steps: [
      `${texInline(String.raw`\omega(x,y)=\det(x,y)`)}，所以 ${texInline(String.raw`\omega(Kx,Ky)=\det\big(K(x,y)\big)=|K|\,\omega(x,y)`)}。`,
      `保持 ω 当且仅当 ${texInline("|K|=1")}。`,
      `剪切 ${texInline(String.raw`\begin{pmatrix}1&3\\0&1\end{pmatrix}`)} 的行列式是 1。其余三个都不保持 ω：${texInline(String.raw`\begin{pmatrix}2&0\\0&2\end{pmatrix}`)} 的行列式是 4，面积放大 4 倍；${texInline(String.raw`\begin{pmatrix}0&1\\1&0\end{pmatrix}`)} 的行列式是 −1，有向面积变号；${texInline(String.raw`\begin{pmatrix}2&0\\0&1\end{pmatrix}`)} 的行列式是 2，面积加倍。`,
      `剪切把 ${texInline(String.raw`\varepsilon_2`)} 送到 (3,1)，长度从 1 变成 ${texInline(String.raw`\sqrt{10}`)}，ω 仍不变。`,
    ],
  },
  quiz: [
    {
      question: "为什么奇数维空间上没有非退化的反对称双线性函数？",
      answer: "度量矩阵满足 Aᵀ=−A，于是 |A|=|Aᵀ|=(−1)ⁿ|A|。n 为奇数时 |A|=−|A|，只能 |A|=0。",
    },
    {
      question: "ω(y,x) 与 ω(x,y) 有什么关系？由此 ω(x,x) 等于多少？",
      answer: "ω(y,x)=−ω(x,y)。取 y=x 得 ω(x,x)=−ω(x,x)，所以 ω(x,x)=0。",
    },
    {
      question: "平面上保持 ω 的线性变换一定保持面积吗？一定保持长度吗？",
      answer: "一定保持有向面积，因而保持面积；不一定保持长度，例如剪切。",
    },
  ],
  summary: [
    "辛空间带有非退化的反对称双线性函数 ω，维数为偶数，存在辛基使 ω 的矩阵为 J。",
    "平面上 ω(x,y)=x₁y₂−x₂y₁ 是有向面积，ω(x,x)=0。",
    "辛变换保持 ω，矩阵满足 KᵀJK=J；平面上就是 |K|=1，长度和角度可以改变。",
  ],
});
