defineChapter10Section("dual-space", {
  number: "§2",
  textbookSection: "对偶空间",
  title: "对偶空间",
  navTitle: "对偶空间",
  question: "对偶基怎样读出一个向量的坐标？",
  goal: `知道 ${texInline("V^*=L(V,P)")} 与 ${texInline("V")} 同维，会求一组基的对偶基；掌握两组基的对偶基之间的过渡矩阵是 ${texInline("(A^T)^{-1}")}。`,
  tags: ["对偶空间", "对偶基", "坐标读取", "(Aᵀ)⁻¹"],
  intro:
    `${texInline("V")} 上的全体线性函数在加法与数乘下也组成线性空间，称为对偶空间 ${texInline("V^*")}。取定 ${texInline("V")} 的一组基，有一组线性函数恰好读出向量在这组基下的各个坐标，这就是对偶基。下面拖动一组斜的基，看两族读数直线怎样跟着变。`,
  concepts: [
    { label: "对偶基", text: texInline(String.raw`f_i(\varepsilon_j)=\delta_{ij}`) },
    { label: "过渡矩阵", text: texInline(String.raw`(\eta)=(\varepsilon)A\Rightarrow(g)=(f)(A^T)^{-1}`) },
  ],
  textbook: { reference: "北大版《高等代数》第十章 §2", items: ["对偶空间 L(V,P)", "对偶基", "对偶基之间的过渡矩阵", "V 与 V** 的同构"] },
  interactive: { type: "slot", title: "斜基与它的对偶基" },
  lesson3d: {
    blocks: [
      {
        title: "对偶空间与对偶基",
        tex: String.raw`f_i(\varepsilon_j)=\delta_{ij}=\begin{cases}1,&i=j\\0,&i\ne j\end{cases},\qquad \dim V^*=\dim V`,
        text: `${texInline("V^*")} 中的运算逐点定义：${texInline(String.raw`(f+g)(\alpha)=f(\alpha)+g(\alpha)`)}，${texInline(String.raw`(kf)(\alpha)=kf(\alpha)`)}。基 ${texInline(String.raw`\varepsilon_1,\dots,\varepsilon_n`)} 的对偶基 ${texInline(String.raw`f_1,\dots,f_n`)} 是 ${texInline("V^*")} 的一组基；${texInline("f_i")} 读出第 ${texInline("i")} 个坐标，所以 ${texInline(String.raw`\alpha=f_1(\alpha)\varepsilon_1+\cdots+f_n(\alpha)\varepsilon_n`)}，${texInline(String.raw`f=f(\varepsilon_1)f_1+\cdots+f(\varepsilon_n)f_n`)}。`,
        ponder: {
          q: `${texInline(String.raw`\eta_1,\eta_2`)} 的对偶基中，${texInline("g_1")} 只与 ${texInline(String.raw`\eta_1`)} 有关吗？`,
          a: `还与 ${texInline(String.raw`\eta_2`)} 有关。${texInline("g_1")} 要满足 ${texInline(String.raw`g_1(\eta_2)=0`)}，${texInline(String.raw`\eta_2`)} 一动，${texInline("g_1")} 的零线就跟着转。`,
        },
      },
      {
        title: "对偶基的过渡矩阵",
        tex: String.raw`(\eta_1,\dots,\eta_n)=(\varepsilon_1,\dots,\varepsilon_n)A\ \Longrightarrow\ (g_1,\dots,g_n)=(f_1,\dots,f_n)(A^T)^{-1}`,
        text: `${texInline(String.raw`f_1,\dots,f_n`)} 与 ${texInline(String.raw`g_1,\dots,g_n`)} 分别是两组基的对偶基。例：${texInline(String.raw`\eta_1=\varepsilon_1`)}，${texInline(String.raw`\eta_2=\varepsilon_1+\varepsilon_2`)}，则 ${texInline(String.raw`A=\begin{pmatrix}1&1\\0&1\end{pmatrix}`)}，${texInline(String.raw`(A^T)^{-1}=\begin{pmatrix}1&0\\-1&1\end{pmatrix}`)}，于是 ${texInline("g_1=f_1-f_2")}，${texInline("g_2=f_2")}。${texInline(String.raw`\eta_1`)} 没有变，${texInline("g_1")} 却变了。`,
        ponder: {
          q: "把每个基向量都放大 2 倍，对偶基怎样变？",
          a: `${texInline("A=2E")}，${texInline(String.raw`(A^T)^{-1}=\tfrac12E`)}，所以每个 ${texInline(String.raw`g_i=\tfrac12f_i`)}。量尺变长，读数变小。`,
        },
      },
      {
        title: "V 与 V** 的同构",
        tex: String.raw`\alpha\mapsto\alpha^{**},\qquad \alpha^{**}(f)=f(\alpha)\quad(f\in V^*)`,
        text: `把 ${texInline(String.raw`\alpha`)} 看成 ${texInline("V^*")} 上“在 ${texInline(String.raw`\alpha`)} 处取值”的函数，得到 ${texInline("V")} 到 ${texInline("V^{**}")} 的同构映射，它的定义不依赖基的选取。因此 ${texInline("V")} 也可以看成 ${texInline("V^*")} 的对偶空间。`,
      },
    ],
    pitfalls: [
      `以为 ${texInline("g_i")} 只由 ${texInline(String.raw`\eta_i`)} 决定。条件 ${texInline(String.raw`g_i(\eta_j)=0`)}（${texInline(String.raw`j\ne i`)}）把其余基向量都牵连进来。`,
      `把对偶基的过渡矩阵写成 ${texInline("A")} 或 ${texInline("A^{-1}")}。正确的是 ${texInline("(A^T)^{-1}")}。`,
      `把 ${texInline("V^*")} 的元素当成 ${texInline("V")} 的向量。${texInline("f")} 是函数，取定基以后才用 ${texInline("n")} 个数 ${texInline(String.raw`f(\varepsilon_1),\dots,f(\varepsilon_n)`)} 记录它。`,
    ],
  },
  example: {
    title: "例题：基向量没变，对偶基却变了",
    question: `${texInline("f_1,f_2")} 是 ${texInline(String.raw`\varepsilon_1,\varepsilon_2`)} 的对偶基。新基 ${texInline(String.raw`\eta_1=\varepsilon_1,\ \eta_2=\varepsilon_1+\varepsilon_2`)} 的对偶基中，${texInline("g_1")} 等于什么？`,
    choices: [
      { correct: true, text: texInline("f_1-f_2") },
      { text: `${texInline("f_1")}，因为 ${texInline(String.raw`\eta_1=\varepsilon_1`)}` },
      { text: texInline("f_1+f_2") },
      { text: texInline("f_2-f_1") },
    ],
    steps: [
      `设 ${texInline("g_1=af_1+bf_2")}，它要满足 ${texInline(String.raw`g_1(\eta_1)=1,\ g_1(\eta_2)=0`)}。`,
      `${texInline(String.raw`g_1(\eta_1)=g_1(\varepsilon_1)=a=1`)}；${texInline(String.raw`g_1(\eta_2)=a+b=0`)}，所以 ${texInline("b=-1")}。`,
      `于是 ${texInline("g_1=f_1-f_2")}。用公式核对：${texInline(String.raw`(A^T)^{-1}=\begin{pmatrix}1&0\\-1&1\end{pmatrix}`)} 的第一列是 ${texInline("(1,-1)^T")}。`,
      `${texInline(String.raw`f_1(\eta_2)=1\ne0`)}，所以 ${texInline("f_1")} 不满足条件；${texInline("f_1+f_2")} 在 ${texInline(String.raw`\eta_2`)} 上的值是 2；${texInline("f_2-f_1")} 在 ${texInline(String.raw`\eta_1`)} 上的值是 ${texInline("-1")}。`,
    ],
  },
  quiz: [
    {
      question: `${texInline(String.raw`\dim V=n`)} 时，${texInline(String.raw`\dim V^*`)} 是多少？${texInline("V^*")} 的一组基可以怎样得到？`,
      answer: `${texInline(String.raw`\dim V^*=n`)}。任取 ${texInline("V")} 的一组基，它的对偶基就是 ${texInline("V^*")} 的一组基。`,
    },
    {
      question: `接上面的例题，线性函数 ${texInline("f=3f_1+f_2")} 在对偶基 ${texInline("g_1,g_2")} 下的坐标是什么？`,
      answer: `坐标是 ${texInline(String.raw`(f(\eta_1),f(\eta_2))=(3,4)`)}，即 ${texInline("f=3g_1+4g_2")}。核对：${texInline("3(f_1-f_2)+4f_2=3f_1+f_2")}。`,
    },
    {
      question: `怎样用对偶基 ${texInline(String.raw`g_1,\dots,g_n`)} 写出向量 ${texInline(String.raw`\alpha`)} 在基 ${texInline(String.raw`\eta_1,\dots,\eta_n`)} 下的坐标？`,
      answer: `${texInline(String.raw`\alpha=g_1(\alpha)\eta_1+\cdots+g_n(\alpha)\eta_n`)}，第 ${texInline("i")} 个坐标就是 ${texInline(String.raw`g_i(\alpha)`)}。`,
    },
  ],
  summary: [
    `${texInline("V^*=L(V,P)")} 与 ${texInline("V")} 同维；基 ${texInline(String.raw`\varepsilon_1,\dots,\varepsilon_n`)} 的对偶基满足 ${texInline(String.raw`f_i(\varepsilon_j)=\delta_{ij}`)}。`,
    `对偶基是读坐标的工具：${texInline(String.raw`\alpha=\sum f_i(\alpha)\varepsilon_i`)}，${texInline(String.raw`f=\sum f(\varepsilon_i)f_i`)}；每个 ${texInline("f_i")} 由整组基决定。`,
    `${texInline(String.raw`(\eta)=(\varepsilon)A`)} 时，对偶基满足 ${texInline("(g)=(f)(A^T)^{-1}")}。`,
  ],
});
