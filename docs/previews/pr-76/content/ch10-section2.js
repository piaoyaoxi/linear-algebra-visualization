defineChapter10Section("dual-space", {
  number: "§2",
  textbookSection: "对偶空间",
  title: "对偶空间",
  navTitle: "对偶空间",
  question: "对偶基怎样读出一个向量的坐标？",
  goal: "知道 V*=L(V,P) 与 V 同维，会求一组基的对偶基；掌握两组基的对偶基之间的过渡矩阵是 (Aᵀ)⁻¹。",
  tags: ["对偶空间", "对偶基", "坐标读取", "(Aᵀ)⁻¹"],
  intro:
    "V 上的全体线性函数在加法与数乘下也组成线性空间，称为对偶空间 V*。取定 V 的一组基，有一组线性函数恰好读出向量在这组基下的各个坐标，这就是对偶基。下面拖动一组斜的基，看两族读数直线怎样跟着变。",
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
        text: "V* 中的运算逐点定义：(f+g)(α)=f(α)+g(α)，(kf)(α)=kf(α)。基 ε₁,…,εₙ 的对偶基 f₁,…,fₙ 是 V* 的一组基；fᵢ 读出第 i 个坐标，所以 α=f₁(α)ε₁+…+fₙ(α)εₙ，f=f(ε₁)f₁+…+f(εₙ)fₙ。",
        ponder: {
          q: "η₁, η₂ 的对偶基中，g₁ 只与 η₁ 有关吗？",
          a: "还与 η₂ 有关。g₁ 要满足 g₁(η₂)=0，η₂ 一动，g₁ 的零线就跟着转。",
        },
      },
      {
        title: "对偶基的过渡矩阵",
        tex: String.raw`(\eta_1,\dots,\eta_n)=(\varepsilon_1,\dots,\varepsilon_n)A\ \Longrightarrow\ (g_1,\dots,g_n)=(f_1,\dots,f_n)(A^T)^{-1}`,
        text: `f₁,…,fₙ 与 g₁,…,gₙ 分别是两组基的对偶基。例：η₁=ε₁，η₂=ε₁+ε₂，则 ${texInline(String.raw`A=\begin{pmatrix}1&1\\0&1\end{pmatrix}`)}，${texInline(String.raw`(A^T)^{-1}=\begin{pmatrix}1&0\\-1&1\end{pmatrix}`)}，于是 g₁=f₁−f₂，g₂=f₂。η₁ 没有变，g₁ 却变了。`,
        ponder: {
          q: "把每个基向量都放大 2 倍，对偶基怎样变？",
          a: "A=2E，(Aᵀ)⁻¹=½E，所以每个 gᵢ=½fᵢ。量尺变长，读数变小。",
        },
      },
      {
        title: "V 与 V** 的同构",
        tex: String.raw`\alpha\mapsto\alpha^{**},\qquad \alpha^{**}(f)=f(\alpha)\quad(f\in V^*)`,
        text: "把 α 看成 V* 上“在 α 处取值”的函数，得到 V 到 V** 的同构映射，它的定义不依赖基的选取。因此 V 也可以看成 V* 的对偶空间。",
      },
    ],
    pitfalls: [
      "以为 gᵢ 只由 ηᵢ 决定。条件 gᵢ(ηⱼ)=0（j≠i）把其余基向量都牵连进来。",
      "把对偶基的过渡矩阵写成 A 或 A⁻¹。正确的是 (Aᵀ)⁻¹。",
      "把 V* 的元素当成 V 的向量。f 是函数，取定基以后才用 n 个数 f(ε₁),…,f(εₙ) 记录它。",
    ],
  },
  example: {
    title: "例题：基向量没变，对偶基却变了",
    question: `f₁, f₂ 是 ε₁, ε₂ 的对偶基。新基 ${texInline(String.raw`\eta_1=\varepsilon_1,\ \eta_2=\varepsilon_1+\varepsilon_2`)} 的对偶基中，${texInline("g_1")} 等于什么？`,
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
      `${texInline(String.raw`f_1(\eta_2)=1\ne0`)}，所以 ${texInline("f_1")} 不满足条件；${texInline("f_1+f_2")} 在 ${texInline(String.raw`\eta_2`)} 上的值是 2；${texInline("f_2-f_1")} 在 ${texInline(String.raw`\eta_1`)} 上的值是 −1。`,
    ],
  },
  quiz: [
    {
      question: "dim V=n 时，dim V* 是多少？V* 的一组基可以怎样得到？",
      answer: "dim V*=n。任取 V 的一组基，它的对偶基就是 V* 的一组基。",
    },
    {
      question: "接上面的例题，线性函数 f=3f₁+f₂ 在对偶基 g₁, g₂ 下的坐标是什么？",
      answer: "坐标是 (f(η₁), f(η₂))=(3, 4)，即 f=3g₁+4g₂。核对：3(f₁−f₂)+4f₂=3f₁+f₂。",
    },
    {
      question: "怎样用对偶基 g₁,…,gₙ 写出向量 α 在基 η₁,…,ηₙ 下的坐标？",
      answer: "α=g₁(α)η₁+…+gₙ(α)ηₙ，第 i 个坐标就是 gᵢ(α)。",
    },
  ],
  summary: [
    "V*=L(V,P) 与 V 同维；基 ε₁,…,εₙ 的对偶基满足 fᵢ(εⱼ)=δᵢⱼ。",
    "对偶基是读坐标的工具：α=Σfᵢ(α)εᵢ，f=Σf(εᵢ)fᵢ；每个 fᵢ 由整组基决定。",
    "(η)=(ε)A 时，对偶基满足 (g)=(f)(Aᵀ)⁻¹。",
  ],
});
