
;/* content/ch10-section4.js */
defineChapter10Section("symplectic-space", {
  number: "＊§4",
  textbookSection: "辛空间",
  title: "辛空间",
  navTitle: "辛空间",
  question: "什么样的双线性函数可以当作“有向面积”？",
  goal: `知道辛空间是带有非退化反对称双线性函数的线性空间，维数是偶数，存在辛基；知道辛变换保持 ${texInline(String.raw`\omega`)}，在平面上就是行列式为 1 的线性变换。`,
  tags: ["选学", "辛内积", "有向面积", "辛基", "辛变换"],
  intro:
    `平面上 ${texInline(String.raw`\omega(x,y)=x_1y_2-x_2y_1`)} 是 ${texInline("x")}、${texInline("y")} 张成的平行四边形的有向面积。它是反对称的双线性函数，${texInline(String.raw`\omega(x,x)=0`)}，并且非退化。下面对 ${texInline("x")}、${texInline("y")} 施加几种线性变换：剪切改变长度和角度，${texInline(String.raw`\omega`)} 却保持不变。`,
  concepts: [
    { label: "辛内积", text: `${texInline(String.raw`\omega(\alpha,\beta)=-\omega(\beta,\alpha)`)}，且 ${texInline(String.raw`\omega`)} 非退化` },
    { label: "辛变换", text: texInline(String.raw`K^TJK=J`) },
  ],
  textbook: { reference: "北大版《高等代数》第十章 ＊§4", items: ["辛空间与辛内积", "辛基", "辛变换"] },
  interactive: { type: "slot", title: "保持有向面积的变换" },
  lesson3d: {
    blocks: [
      {
        title: "辛空间",
        tex: String.raw`\omega(\alpha,\beta)=-\omega(\beta,\alpha),\qquad \omega(\alpha,\alpha)=0`,
        text: `数域 ${texInline("P")} 上的线性空间 ${texInline("V")} 带有一个非退化的反对称双线性函数 ${texInline(String.raw`\omega`)}，称为辛空间，${texInline(String.raw`\omega`)} 称为辛内积。反对称矩阵满足 ${texInline(String.raw`|A|=|A^T|=|-A|=(-1)^n|A|`)}，${texInline("n")} 为奇数时 ${texInline(String.raw`|A|=0`)}，所以辛空间的维数是偶数。`,
        ponder: {
          q: `平面上 ${texInline(String.raw`\omega(x,y)=0`)} 说明 ${texInline("x")}、${texInline("y")} 是什么关系？`,
          a: `${texInline("x")}、${texInline("y")} 共线：平行四边形压成一条线段，有向面积为 0。`,
        },
      },
      {
        title: "辛基",
        tex: String.raw`\omega(\varepsilon_i,\varepsilon_{-i})=1,\quad \omega(\varepsilon_i,\varepsilon_j)=0\ (i+j\ne0),\qquad J=\begin{pmatrix}0&E_n\\-E_n&0\end{pmatrix}`,
        text: `${texInline("2n")} 维辛空间中存在满足上式的基 ${texInline(String.raw`\varepsilon_1,\dots,\varepsilon_n,\varepsilon_{-1},\dots,\varepsilon_{-n}`)}，称为辛基，${texInline(String.raw`\omega`)} 在辛基下的矩阵是 ${texInline("J")}。平面上 ${texInline(String.raw`\varepsilon_1=(1,0)`)}、${texInline(String.raw`\varepsilon_{-1}=(0,1)`)} 就是一组辛基。`,
        ponder: {
          q: `平面上给定 ${texInline(String.raw`\varepsilon_1=(1,0)`)}，满足 ${texInline(String.raw`\omega(\varepsilon_1,\varepsilon_{-1})=1`)} 的 ${texInline(String.raw`\varepsilon_{-1}`)} 唯一吗？`,
          a: `不唯一。${texInline(String.raw`\varepsilon_{-1}=(t,1)`)} 对任意 ${texInline("t")} 都满足 ${texInline(String.raw`\omega(\varepsilon_1,\varepsilon_{-1})=1`)}。`,
        },
      },
      {
        title: "辛变换",
        tex: String.raw`\omega(\sigma\alpha,\sigma\beta)=\omega(\alpha,\beta)\iff K^TJK=J`,
        text: `保持辛内积的线性变换称为辛变换，${texInline("K")} 是它在辛基下的矩阵。平面上 ${texInline(String.raw`\omega(Kx,Ky)=|K|\,\omega(x,y)`)}，所以辛变换就是 ${texInline("|K|=1")} 的变换，例如剪切与旋转。高维时辛变换的行列式仍是 1，但 ${texInline("|K|=1")} 不能保证 ${texInline("K")} 是辛变换。`,
        ponder: {
          q: `${texInline("P^4")} 中取辛基 ${texInline(String.raw`\varepsilon_1,\varepsilon_2,\varepsilon_{-1},\varepsilon_{-2}`)}，${texInline(String.raw`K=\operatorname{diag}(2,1,1,\tfrac12)`)}。${texInline("|K|=1")}，${texInline("K")} 是辛变换吗？`,
          a: `不是。${texInline(String.raw`\omega(K\varepsilon_1,K\varepsilon_{-1})=\omega(2\varepsilon_1,\varepsilon_{-1})=2\ne1`)}。`,
        },
      },
    ],
    pitfalls: [
      `以为辛变换保持长度和角度。剪切保持 ${texInline(String.raw`\omega`)}，却改变长度与夹角。`,
      `把 ${texInline(String.raw`\omega`)} 当作内积。${texInline(String.raw`\omega(x,x)=0`)} 对一切 ${texInline("x")} 成立，它不衡量长度。`,
      `以为高维时 ${texInline("|K|=1")} 就够了。辛变换的条件是 ${texInline("K^TJK=J")}。`,
    ],
  },
  example: {
    title: "例题：哪个变换保持 ω",
    question: `平面上 ${texInline(String.raw`\omega(x,y)=x_1y_2-x_2y_1`)}。哪个矩阵 ${texInline("K")} 使 ${texInline(String.raw`\omega(Kx,Ky)=\omega(x,y)`)} 对一切 ${texInline("x,y")} 成立？`,
    choices: [
      { correct: true, text: texInline(String.raw`\begin{pmatrix}1&3\\0&1\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}2&0\\0&2\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}0&1\\1&0\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}2&0\\0&1\end{pmatrix}`) },
    ],
    steps: [
      `${texInline(String.raw`\omega(x,y)=\det(x,y)`)}，所以 ${texInline(String.raw`\omega(Kx,Ky)=\det\big(K(x,y)\big)=|K|\,\omega(x,y)`)}。`,
      `保持 ${texInline(String.raw`\omega`)} 当且仅当 ${texInline("|K|=1")}。`,
      `剪切 ${texInline(String.raw`\begin{pmatrix}1&3\\0&1\end{pmatrix}`)} 的行列式是 1。其余三个都不保持 ${texInline(String.raw`\omega`)}：${texInline(String.raw`\begin{pmatrix}2&0\\0&2\end{pmatrix}`)} 的行列式是 4，面积放大 4 倍；${texInline(String.raw`\begin{pmatrix}0&1\\1&0\end{pmatrix}`)} 的行列式是 ${texInline("-1")}，有向面积变号；${texInline(String.raw`\begin{pmatrix}2&0\\0&1\end{pmatrix}`)} 的行列式是 2，面积加倍。`,
      `剪切把 ${texInline(String.raw`\varepsilon_2`)} 送到 ${texInline("(3,1)")}，长度从 1 变成 ${texInline(String.raw`\sqrt{10}`)}，${texInline(String.raw`\omega`)} 仍不变。`,
    ],
  },
  quiz: [
    {
      question: "为什么奇数维空间上没有非退化的反对称双线性函数？",
      answer: `度量矩阵满足 ${texInline("A^T=-A")}，于是 ${texInline("|A|=|A^T|=(-1)^n|A|")}。${texInline("n")} 为奇数时 ${texInline("|A|=-|A|")}，只能 ${texInline("|A|=0")}。`,
    },
    {
      question: `${texInline(String.raw`\omega(y,x)`)} 与 ${texInline(String.raw`\omega(x,y)`)} 有什么关系？由此 ${texInline(String.raw`\omega(x,x)`)} 等于多少？`,
      answer: `${texInline(String.raw`\omega(y,x)=-\omega(x,y)`)}。取 ${texInline("y=x")} 得 ${texInline(String.raw`\omega(x,x)=-\omega(x,x)`)}，所以 ${texInline(String.raw`\omega(x,x)=0`)}。`,
    },
    {
      question: `平面上保持 ${texInline(String.raw`\omega`)} 的线性变换一定保持面积吗？一定保持长度吗？`,
      answer: "一定保持有向面积，因而保持面积；不一定保持长度，例如剪切。",
    },
  ],
  summary: [
    `辛空间带有非退化的反对称双线性函数 ${texInline(String.raw`\omega`)}，维数为偶数，存在辛基使 ${texInline(String.raw`\omega`)} 的矩阵为 ${texInline("J")}。`,
    `平面上 ${texInline(String.raw`\omega(x,y)=x_1y_2-x_2y_1`)} 是有向面积，${texInline(String.raw`\omega(x,x)=0`)}。`,
    `辛变换保持 ${texInline(String.raw`\omega`)}，矩阵满足 ${texInline("K^TJK=J")}；平面上就是 ${texInline("|K|=1")}，长度和角度可以改变。`,
  ],
});


;/* content/ch10.js */
registerAlgebraChapter({
  id: "ch10",
  icon: "10",
  title: "第十章 双线性函数与辛空间",
  subtitle: "把向量读成数",
  summary:
    `线性函数把一个向量读成一个数，在平面上画出来是一族平行的等值线。全体线性函数组成对偶空间，对偶基就是读坐标的工具。双线性函数同时读两个向量，取定基后写成 ${texInline("X^TAY")}，换基时度量矩阵变成合同的矩阵。辛空间带有非退化的反对称双线性函数，在平面上就是有向面积。`,
  sections: [
    { id: "linear-functional", number: "§1", title: "线性函数", navTitle: "线性函数" },
    { id: "dual-space", number: "§2", title: "对偶空间", navTitle: "对偶空间" },
    { id: "bilinear-form", number: "§3", title: "双线性函数", navTitle: "双线性函数" },
    { id: "symplectic-space", number: "＊§4", title: "辛空间", navTitle: "辛空间" },
  ],
});


;/* content/ch10-assemble.js */
/* Apply Chapter 10 section patches after ch10.js registration. */
(() => {
  const chapter = algebraContent.chapters.find((item) => item.id === "ch10");
  const patches = window.getChapter10SectionPatches?.();
  if (!chapter || !patches) return;

  chapter.sections = chapter.sections.map((stub) => {
    const patch = patches.get(stub.id);
    if (!patch) {
      console.warn("Missing Chapter 10 section patch:", stub.id);
      return stub;
    }
    return { ...stub, ...patch, id: stub.id };
  });
})();


;/* visuals/structured-chapter-registry.js */
(() => {
  const renderers = new Map();

  window.defineStructuredChapterRenderer = function defineStructuredChapterRenderer(chapterId, renderer) {
    if (!chapterId || !renderer || typeof renderer !== "object") {
      throw new TypeError("Structured chapter renderers require a chapter id and renderer object.");
    }
    renderers.set(chapterId, renderer);
  };

  window.getStructuredChapterRenderer = function getStructuredChapterRenderer(chapterId) {
    return renderers.get(chapterId) || null;
  };

  window.teardownStructuredChapter = function teardownStructuredChapter(chapterId) {
    renderers.get(chapterId)?.teardown?.();
  };
})();


;/* visuals/ch10/registry.js */
/* Chapter 10 renderer registry with deterministic teardown. */
(() => {
  const renderers = new Map();
  let activeCleanup = null;

  function runCleanup() {
    if (typeof activeCleanup === "function") {
      try {
        activeCleanup();
      } catch (error) {
        console.warn("Chapter 10 teardown failed", error);
      }
    }
    activeCleanup = null;
  }

  window.defineChapter10Renderer = function defineChapter10Renderer(sectionId, renderer) {
    if (!sectionId || !renderer || typeof renderer !== "object") {
      throw new TypeError("Chapter 10 renderers require a section id and an object.");
    }
    renderers.set(sectionId, renderer);
  };

  window.teardownChapter10Lesson = runCleanup;

  window.mountChapter10Lesson = function mountChapter10Lesson(section, root) {
    runCleanup();
    if (!section?.id || !root) return;
    const renderer = renderers.get(section.id);
    if (!renderer) return;
    const cleanups = [];
    const formal = root.querySelector(`#${CSS.escape(section.id)}-formal`);
    const interactive = root.querySelector(`#${CSS.escape(section.id)}-interactive`);
    [renderer.formal?.(formal, section, root), renderer.interactive?.(interactive, section, root)].forEach((cleanup) => {
      if (typeof cleanup === "function") cleanups.push(cleanup);
    });
    activeCleanup = () => cleanups.splice(0).reverse().forEach((cleanup) => cleanup());
  };

  window.addEventListener("hashchange", runCleanup);
  window.addEventListener("pagehide", runCleanup);
})();


;/* visuals/ch8/registry.js */
/* Chapter 8 renderer registry with deterministic teardown. */
(() => {
  const renderers = new Map();
  let activeCleanup = null;

  function runCleanup() {
    if (typeof activeCleanup === "function") {
      try {
        activeCleanup();
      } catch (error) {
        console.warn("Chapter 8 teardown failed", error);
      }
    }
    activeCleanup = null;
  }

  window.defineChapter8Renderer = function defineChapter8Renderer(sectionId, renderer) {
    if (!sectionId || !renderer || typeof renderer !== "object") {
      throw new TypeError("Chapter 8 renderers require a section id and an object.");
    }
    renderers.set(sectionId, renderer);
  };

  window.teardownChapter8Lesson = runCleanup;

  window.mountChapter8Lesson = function mountChapter8Lesson(section, root) {
    runCleanup();
    if (!section?.id || !root) return;
    const renderer = renderers.get(section.id);
    if (!renderer) return;
    const cleanups = [];
    const formal = root.querySelector(`#${CSS.escape(section.id)}-formal`);
    const interactive = root.querySelector(`#${CSS.escape(section.id)}-interactive`);
    [renderer.formal?.(formal, section, root), renderer.interactive?.(interactive, section, root)].forEach((cleanup) => {
      if (typeof cleanup === "function") cleanups.push(cleanup);
    });
    activeCleanup = () => cleanups.splice(0).reverse().forEach((cleanup) => cleanup());
  };

  window.addEventListener("hashchange", runCleanup);
  window.addEventListener("pagehide", runCleanup);
})();


;/* content/lesson-extras.js */
/*
 * Section extras rendered by visuals/shared/lesson-extras.js at the end of the
 * theorem section: static figures (keys registered in lesson-figures.js) and
 * "停一下" questions whose answers open on click. Keep each question short and
 * different from the section's self-test.
 */
(() => {
  const t = (s) => (window.texInline ? window.texInline(s) : s);
  window.LESSON_EXTRAS = {
    /* ---------- 第一章 多项式 ---------- */
    "number-fields": {
      ponders: [
        {
          q: "两个数域的交还是数域吗？并呢？",
          a: `交是数域：四则运算在两个数域里都封闭，结果自然在交里。并一般不是：${t("\\sqrt2")} 与 ${t("\\sqrt3")} 都在 ${t("\\mathbb Q(\\sqrt2)\\cup\\mathbb Q(\\sqrt3)")} 中，${t("\\sqrt2+\\sqrt3")} 却不在其中任何一个。`,
        },
      ],
    },
    "univariate-polynomials": {
      figures: [{ key: "poly-product-table", caption: `${t("f=2-x+3x^2")}，${t("g=1+2x+x^2")}。第 ${t("i")} 行第 ${t("j")} 列放 ${t("a_ib_j")}，同一条反对角线上的数相加就是 ${t("fg")} 中 ${t("x^k")} 的系数。` }],
      ponders: [
        {
          q: `${t("\\deg(fg)=\\deg f+\\deg g")} 靠的是哪一条事实？`,
          a: `${t("fg")} 的首项系数是两个首项系数之积；数域中两个非零数的积不为零，所以这一项不会消失。`,
        },
      ],
    },
    "polynomial-divisibility": {
      ponders: [
        {
          q: `${t("g\\mid f")} 且 ${t("f\\mid g")} 时，${t("f")} 与 ${t("g")} 是什么关系？`,
          a: `两者次数相等，${t("f=qg")} 中的商 ${t("q")} 只能是非零常数：${t("f")} 与 ${t("g")} 只差一个非零常数因子。`,
        },
      ],
    },
    "gcd-polynomials": {
      figures: [{ key: "gcd-common-roots", caption: `在复平面上，两个多项式的公共根正是最大公因式的根：这里只有 ${t("x=1")}，所以 ${t("\\gcd(f,g)=x-1")}。` }],
      ponders: [
        {
          q: `${t("f")} 与 ${t("g")} 互素时，${t("f")} 与 ${t("g^2")} 一定互素吗？`,
          a: `一定。由 ${t("uf+vg=1")} 两边平方，得 ${t("(u^2f+2uvg)f+v^2g^2=1")}，所以 ${t("f")} 与 ${t("g^2")} 也互素。`,
        },
      ],
    },
    "factorization-theorem": {
      ponders: [
        {
          q: `“${t("p")} 不可约且 ${t("p\\mid fg")}，则 ${t("p\\mid f")} 或 ${t("p\\mid g")}”，去掉“不可约”还成立吗？`,
          a: `不成立：${t("x^2\\mid x\\cdot x")}，但 ${t("x^2\\nmid x")}。这条性质正是因式分解唯一性的关键。`,
        },
      ],
    },
    "multiple-factors": {
      ponders: [
        {
          q: `${t("f")} 在 ${t("\\mathbb{Q}")} 上没有重因式，放到 ${t("\\mathbb{C}")} 上会出现重根吗？`,
          a: `不会。${t("\\gcd(f,f')")} 用辗转相除在 ${t("\\mathbb{Q}")} 上算出，换到 ${t("\\mathbb{C}")} 上计算过程和结果都不变；它等于 1，${t("f")} 在 ${t("\\mathbb{C}")} 上也没有重根。`,
        },
      ],
    },
    "polynomial-functions": {
      ponders: [
        {
          q: `为什么 ${t("f(a)")} 恰好是 ${t("f")} 除以 ${t("x-a")} 的余式？`,
          a: `带余除法给出 ${t("f=(x-a)q+r")}，余式 ${t("r")} 是常数；代入 ${t("x=a")} 得 ${t("f(a)=r")}。`,
        },
      ],
    },
    "complex-real-factorization": {
      ponders: [
        {
          q: `实系数多项式在 ${t("\\mathbb{R}")} 上的不可约因式最高是几次？`,
          a: "2 次：只有一次因式和判别式小于 0 的二次因式。更高次的实系数多项式总能再分解。",
        },
      ],
    },
    "rational-polynomials": {
      ponders: [
        {
          q: `${t("2x+4")} 是本原多项式吗？`,
          a: `不是：系数有公因数 2。${t("2x+4=2(x+2)")}，其中 ${t("x+2")} 是本原多项式。`,
        },
      ],
    },
    "multivariate-polynomials": {
      ponders: [
        {
          q: "按字典序排列，两个非零多项式乘积的首项是什么？",
          a: "是两个首项之积。所以乘积一定不是零多项式，这是多元情形下“次数相加”的替代。",
        },
      ],
    },
    "symmetric-polynomials": {
      ponders: [
        {
          q: `${t("x^2y+y^2z+z^2x")} 是对称多项式吗？`,
          a: `不是。交换 ${t("x")} 与 ${t("y")} 得 ${t("y^2x+x^2z+z^2y")}，与原式不同；它只在轮换 ${t("x\\to y\\to z\\to x")} 下不变。`,
        },
      ],
    },

    /* ---------- 第二章 行列式 ---------- */
    "determinant-intro": {
      ponders: [
        {
          q: "二阶矩阵的四个元素都乘 2，行列式变为原来的几倍？",
          a: `4 倍：两条边都放大 2 倍，平行四边形的面积放大 ${t("2\\times2")} 倍。`,
        },
      ],
    },
    permutations: {
      ponders: [
        {
          q: `${t("n")} 个元素（${t("n\\ge2")}）的排列中，奇排列和偶排列各有多少个？`,
          a: `各 ${t("n!/2")} 个：对换前两个位置把每个奇排列变成一个偶排列，反之亦然，这是一一对应。`,
        },
      ],
    },
    "n-order-determinant": {
      figures: [{ key: "det3-rooks", caption: "三阶行列式的 6 个项：每行每列恰有一个点，点的列号排列给出正负号：上排三个是偶排列（+），下排三个是奇排列（−）。" }],
      ponders: [
        {
          q: `${t("n")} 阶行列式中，含 ${t("a_{11}a_{22}")} 的项有多少个？`,
          a: `${t("(n-2)!")} 个：第 1、2 行已经用掉第 1、2 列，剩下 ${t("n-2")} 行在剩下的 ${t("n-2")} 列中任意排列。`,
        },
      ],
    },
    "determinant-properties": {
      ponders: [
        {
          q: `${t("\\det A=0")} 能推出 ${t("A")} 有一行全为零吗？`,
          a: "不能。两行相同、两行成比例，或者一行是其余行的组合，都会让行列式为零。",
        },
      ],
    },
    "determinant-computation": {
      ponders: [
        {
          q: `把 ${t("n")} 阶行列式的行顺序完全倒过来，行列式乘以多少？`,
          a: `乘以 ${t("(-1)^{n(n-1)/2}")}：倒序排列的逆序数是 ${t("n(n-1)/2")}。`,
        },
      ],
    },
    "cofactor-expansion": {
      ponders: [
        {
          q: `按第 ${t("i")} 行展开时，代数余子式 ${t("A_{ij}")} 与第 ${t("i")} 行的元素有关吗？`,
          a: `无关：${t("A_{ij}")} 删去了第 ${t("i")} 行。所以改动第 ${t("i")} 行，只改变展开式中的系数 ${t("a_{ij}")}。`,
        },
      ],
    },
    "cramer-rule": {
      ponders: [
        {
          q: "方程个数少于未知量个数时，能用克拉默法则吗？",
          a: "不能：系数矩阵不是方阵，没有行列式可用。",
        },
      ],
    },
    "laplace-and-product": {
      ponders: [
        {
          q: `${t("\\det(A^TA)")} 可能是负数吗？`,
          a: `不可能：${t("\\det(A^TA)=\\det(A^T)\\det(A)=(\\det A)^2\\ge0")}。`,
        },
      ],
    },

    /* ---------- 第四章 矩阵 ---------- */
    "matrix-language": {
      ponders: [
        {
          q: `${t("3\\times1")} 矩阵和 ${t("1\\times3")} 矩阵有什么区别？`,
          a: "前者是列向量（3 行 1 列），后者是行向量（1 行 3 列）。形状不同，即使数字相同也不相等。",
        },
      ],
    },
    "matrix-operations": {
      ponders: [
        {
          q: `${t("AB=0")} 能推出 ${t("A=0")} 或 ${t("B=0")} 吗？`,
          a: `不能：${t("\\begin{pmatrix}1&0\\\\0&0\\end{pmatrix}\\begin{pmatrix}0&0\\\\0&1\\end{pmatrix}=0")}，两个因子都不是零矩阵。`,
        },
      ],
    },
    "matrix-product-determinant-rank": {
      ponders: [
        {
          q: `${t("\\operatorname{rank}(AB)")} 可能比 ${t("\\operatorname{rank}(A)")} 和 ${t("\\operatorname{rank}(B)")} 都小吗？`,
          a: `可能：${t("A=\\begin{pmatrix}1&0\\\\0&0\\end{pmatrix},\\ B=\\begin{pmatrix}0&0\\\\0&1\\end{pmatrix}")} 的秩都是 1，而 ${t("AB=0")}，秩为 0。`,
        },
      ],
    },
    "matrix-inverse": {
      ponders: [
        {
          q: `满足 ${t("A^2=0")} 的方阵可逆吗？`,
          a: `不可逆：若可逆，则 ${t("A=A^{-1}A^2=0")}，而零矩阵不可逆。也可以看行列式：${t("(\\det A)^2=\\det(A^2)=0")}。`,
        },
      ],
    },
    "block-matrices": {
      ponders: [
        {
          q: `${t("A_1,A_2")} 可逆时，${t("\\operatorname{diag}(A_1,A_2)")} 的逆是什么？`,
          a: `${t("\\operatorname{diag}(A_1^{-1},A_2^{-1})")}：两块互不影响，分别求逆。`,
        },
      ],
    },
    "elementary-matrices": {
      ponders: [
        {
          q: `交换两行的初等矩阵 ${t("P(i,j)")}，它的逆是什么？`,
          a: `是它自己：再交换一次就回到原样，${t("P(i,j)^2=E")}。`,
        },
      ],
    },
    "block-elementary-applications": {
      ponders: [
        {
          q: `${t("A,D")} 可逆时，${t("\\begin{vmatrix}A&0\\\\C&D\\end{vmatrix}")} 等于多少？`,
          a: `${t("\\det A\\cdot\\det D")}：用块倍加把 ${t("C")} 消成 0 不改变行列式，再按块对角计算。`,
        },
      ],
    },

    /* ---------- 第五章 二次型 ---------- */
    "quadratic-matrix": {
      ponders: [
        {
          q: `二次型 ${t("x_1x_2")} 的矩阵是什么？`,
          a: `${t("\\begin{pmatrix}0&\\tfrac12\\\\\\tfrac12&0\\end{pmatrix}")}：交叉项的系数平均分到两个对称位置上。`,
        },
      ],
    },
    "quadratic-standard-form": {
      ponders: [
        {
          q: `${t("x_1x_2")} 没有平方项，怎样开始配方？`,
          a: `先作替换 ${t("x_1=y_1+y_2,\\ x_2=y_1-y_2")}，得到 ${t("y_1^2-y_2^2")}，已经是标准形。`,
        },
      ],
    },
    "quadratic-uniqueness": {
      ponders: [
        {
          q: "实二次型的秩为 3、符号差为 1，正、负惯性指数各是多少？",
          a: `${t("p+q=3")}，${t("p-q=1")}，所以 ${t("p=2")}，${t("q=1")}。`,
        },
      ],
    },
    "positive-definite": {
      ponders: [
        {
          q: "正定矩阵的主对角元一定都是正数吗？",
          a: `一定：${t("a_{ii}=e_i^TAe_i>0")}。反过来不成立，例如 ${t("\\begin{pmatrix}1&2\\\\2&1\\end{pmatrix}")} 的对角元都是正数，却不是正定的。`,
        },
      ],
    },
  };
})();


;/* visuals/shared/lesson-extras.js */
/*
 * Lesson extras shared by every chapter: small static figures and "停一下"
 * questions placed at the end of the theorem section, in the spirit of the
 * 3Blue1Brown lessons (a picture beside the text, a short question in the
 * middle of the reading). Data lives in content/lesson-extras.js, keyed by
 * section id; figures register through window.defineLessonFigure.
 */
(() => {
  const figures = new Map();
  window.defineLessonFigure = (key, make) => figures.set(key, make);

  function ponderHtml(p) {
    return `<details class="lx-ponder"><summary><span>停一下</span><span class="lx-q">${p.q}</span></summary><p>${p.a}</p></details>`;
  }

  function figureHtml(spec) {
    const make = figures.get(spec.key);
    if (!make) return "";
    return `<figure class="lx-figure">${make()}${spec.caption ? `<figcaption>${spec.caption}</figcaption>` : ""}</figure>`;
  }

  function enhance(section) {
    const extras = window.LESSON_EXTRAS?.[section?.id];
    if (!extras) return;
    const root = document.querySelector("#mainContent");
    const formal = root?.querySelector(`#${CSS.escape(section.id)}-formal`);
    if (!formal || formal.querySelector(".lx-extras")) return;
    const box = document.createElement("div");
    box.className = "lx-extras";
    box.innerHTML = (extras.figures || []).map(figureHtml).join("") + (extras.ponders || []).map(ponderHtml).join("");
    if (box.innerHTML) formal.append(box);
  }

  const base = window.renderLessonPage;
  if (typeof base !== "function") return;
  window.renderLessonPage = function renderLessonPageWithExtras(section, chapter) {
    base(section, chapter);
    enhance(section);
  };
})();


;/* visuals/shared/lab-layout.js */
/*
 * Lab layout (docs/design-spec.md §6), applied after a lab renders so every kit
 * (ch3l / ch6l / ch7l / ch9l, and ch8 / ch10 on the ch7 kit) gets the same order:
 *   title → prediction (full width) → canvas + caption | buttons + readouts.
 * It only moves existing nodes, so the labs' own listeners keep working:
 *   - the prediction box moves out of the side column to just above the canvas row;
 *   - the drag hint drawn on the canvas becomes a numbered caption under it,
 *     e.g. “图 7.5-1 拖动 x₀（每次半格）”.
 */
(() => {
  const LAB = ".ch3l-lab, .ch6l-lab, .ch7l-lab, .ch9l-lab";
  const PREDICT = ".ch3l-predict, .ch6l-predict, .ch7l-predict, .ch9l-predict";
  const FRAME = ".ch7p, .ch9p, .la3d";
  const HINT = ".ch7p-hint, .ch9p-hint, .la3d-hint";
  const SIDE = ".ch3l-side, .ch6l-side, .ch7l-side, .ch9l-side";
  const CARD = ".ch3l-card, .ch6l-card, .ch7l-card, .ch9l-card";

  function figurePrefix() {
    const [chapterId, sectionId] = (location.hash.slice(1) || "").split("/");
    const chapterNo = Number((chapterId || "").replace(/\D/g, ""));
    // algebraContent is a top-level const in content/, so it is not on window
    const content = typeof algebraContent !== "undefined" ? algebraContent : window.algebraContent;
    const chapter = content?.chapters?.find((c) => c.id === chapterId);
    const section = chapter?.sections?.find((s) => s && s.id === sectionId);
    const sectionNo = Number(String(section?.number || "").replace(/\D/g, ""));
    return chapterNo && sectionNo ? `${chapterNo}.${sectionNo}` : "";
  }

  /* the direct child of the lab that holds the canvases */
  function canvasRow(lab) {
    const frame = lab.querySelector(FRAME);
    if (!frame) return null;
    let node = frame;
    while (node.parentElement && node.parentElement !== lab) node = node.parentElement;
    return node.parentElement === lab ? node : null;
  }

  function placePrediction(lab, row) {
    const box = lab.querySelector(PREDICT);
    if (!box || !row) return;
    // the gate container the lab created (or the box itself when it is a direct child)
    const parent = box.parentElement;
    const gate = parent && parent !== lab && parent.children.length === 1 ? parent : box;
    const after = gate.parentElement === lab && row.compareDocumentPosition(gate) & Node.DOCUMENT_POSITION_FOLLOWING;
    if (row.contains(gate) || after) row.before(gate);
  }

  function captions(lab, prefix, counter) {
    lab.querySelectorAll(FRAME).forEach((frame) => {
      if (frame.dataset.laCaptioned) return;
      const hint = frame.querySelector(HINT);
      // a number with nothing after it says nothing: a frame without a hint gets no caption
      // (yet: a hint written later is captioned then)
      if (!hint?.textContent.trim()) return;
      frame.dataset.laCaptioned = "1";
      counter.n += 1;
      const fig = document.createElement("p");
      fig.className = "la-figcaption";
      const label = prefix ? `图 ${prefix}-${counter.n}` : "";
      fig.innerHTML = `${label ? `<b>${label}</b>` : ""}<span>${hint.textContent}</span>`;
      hint.hidden = true;
      frame.after(fig);
    });
  }

  /*
   * A closing mark (，。；：、）) right after an inline formula is glued to it, so a
   * line never starts with punctuation when the formula ends a line.
   */
  const CLOSERS = "，。；：、）！？";
  function gluePunctuation(lab) {
    // hand-written wrappers around a whole formula (some labs): unwrap, then glue as below
    lab.querySelectorAll(".la-keep").forEach((keep) => {
      if (keep.querySelector(".la-punct") || !keep.querySelector(":scope > .tex-inline")) return;
      keep.replaceWith(...keep.childNodes);
    });
    lab.querySelectorAll(".tex-inline").forEach((formula) => {
      const next = formula.nextSibling;
      if (!next || next.nodeType !== Node.TEXT_NODE || !CLOSERS.includes(next.textContent.charAt(0))) return;
      // every closing mark in a row (“），”) goes with the formula
      let count = 0;
      while (count < next.textContent.length && CLOSERS.includes(next.textContent.charAt(count))) count += 1;
      if (formula.parentElement?.classList.contains("la-keep") || formula.querySelector(".la-keep")) return;
      const mark = document.createElement("span");
      mark.className = "la-punct";
      mark.textContent = next.textContent.slice(0, count);
      // only the formula's last piece is glued to the mark, so a long formula can still
      // break in the middle and the mark stays right after its end
      const html = formula.querySelector(".katex-html");
      // typeset.js may have grouped the pieces (<la-mg>): the last piece is the last .base anywhere
      const bases = html ? [...html.querySelectorAll(".base")] : [];
      const keep = document.createElement("span");
      keep.className = "la-keep";
      if (bases.length) {
        const last = bases[bases.length - 1];
        last.before(keep);
        keep.append(last, mark);
      } else {
        formula.before(keep);
        keep.append(formula, mark);
      }
      next.textContent = next.textContent.slice(count);
      if (!next.textContent) next.remove();
      // a line may break after the mark. Chromium breaks between the formula's last box and
      // what follows anyway; WebKit (Safari, every iOS browser) does not, so "B=CᵀAC，C=…，
      // det C=1。曲面…" became one unbreakable run wider than a phone and pushed the lab past
      // the screen edge
      // (after the whole unit: without pieces the formula and its mark share one wrapper)
      const unit = bases.length ? formula : keep;
      const after = unit.nextSibling;
      if (!(after && after.nodeName === "WBR") && !(after?.nodeType === Node.TEXT_NODE && /^\s/.test(after.textContent))) {
        unit.after(document.createElement("wbr"));
      }
    });
  }

  /*
   * An inline formula wider than its paragraph (a matrix cannot wrap) gets a line of
   * its own that scrolls sideways, instead of running past the card's edge on phones.
   */
  function fitWideFormulas(root) {
    root.querySelectorAll(".tex-inline").forEach((formula) => {
      const block = formula.parentElement?.closest("p, li, div, dd, td, label, figcaption");
      if (!block || !formula.offsetParent) return;
      formula.classList.remove("la-wide");
      const cs = getComputedStyle(block);
      const room = block.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      // a formula that already wraps onto several lines fits; only a single unbreakable run is too wide
      const pieces = formula.querySelector(".katex-html")?.getClientRects().length ?? 1;
      // the box itself may be capped at the paragraph width while the formula inside runs on
      const inner = formula.querySelector(".katex")?.getBoundingClientRect().width ?? 0;
      const width = Math.max(formula.getBoundingClientRect().width, inner, formula.scrollWidth);
      if (pieces <= 1 && width > room + 1) formula.classList.add("la-wide");
    });
  }

  function normalize() {
    // the whole lesson, not only the labs: examples, theorems and self-tests too
    const main = document.querySelector("main") || document.body;
    gluePunctuation(main);
    fitWideFormulas(main);
    const labs = document.querySelectorAll(LAB);
    if (!labs.length) return;
    const prefix = figurePrefix();
    const counter = { n: document.querySelectorAll(".la-figcaption").length };
    labs.forEach((lab) => {
      if (!lab.isConnected) return;
      const row = canvasRow(lab);
      placePrediction(lab, row);
      captions(lab, prefix, counter);
      gluePunctuation(lab);
      // The last readout card stretches to the canvas bottom only when little space
      // is left over; a short readout keeps its natural height (no empty box).
      lab.querySelectorAll(SIDE).forEach((side) => {
        const cards = [...side.children].filter((c) => c.matches(CARD) && !c.hidden);
        cards.forEach((c) => c.classList.remove("la-fill"));
        const last = cards[cards.length - 1];
        if (!last) return;
        const spare = side.getBoundingClientRect().bottom - last.getBoundingClientRect().bottom;
        if (spare > 0 && spare < 120) last.classList.add("la-fill");
      });
      placeResult(lab, row);
      fillFrame(lab, row);
      gatePrimary(lab);
      lab.classList.add("la-laid-out");
      // a wide row of presets would squeeze the title: put it on its own row instead
      const head = lab.querySelector(":scope > .ch3l-head, :scope > .ch6l-head, :scope > .ch7l-head, :scope > .ch9l-head");
      if (head) {
        lab.classList.remove("la-stack");
        if (head.getBoundingClientRect().width < 360) lab.classList.add("la-stack");
      }
    });
  }

  /*
   * When the side column runs far below the canvas (typically once the conclusion
   * opens), the conclusion moves under both columns as a full-width card, so the
   * canvas column does not end in a large empty space.
   */
  const RESULT = ".ch3l-result, .ch6l-result, .ch7l-result, .ch9l-result";
  function contentBottom(el) {
    let bottom = el.getBoundingClientRect().top;
    el.querySelectorAll("canvas, svg, img, button, input, select, p, figcaption, span, b, strong").forEach((n) => {
      if (!n.offsetParent || (n.closest("svg") && n.tagName.toLowerCase() !== "svg")) return;
      bottom = Math.max(bottom, n.getBoundingClientRect().bottom);
    });
    return bottom;
  }
  function placeResult(lab, row) {
    if (!row) return;
    const side = row.querySelector(SIDE);
    const result = side?.querySelector(`:scope > ${RESULT}, ${RESULT}`);
    if (!side || !result || result.hidden || !result.offsetParent) return;
    const stage = [...row.children].find((c) => c !== side && !c.contains(side) && c.querySelector(FRAME));
    if (!stage) return;
    // single column (narrow screens): the result is already below the canvas
    if (Math.abs(stage.getBoundingClientRect().top - side.getBoundingClientRect().top) > 40) return;
    const gap = side.getBoundingClientRect().bottom - contentBottom(stage);
    if (gap > 140) {
      result.classList.add("la-result-wide");
      row.after(result);
    }
  }

  /* What is still left over is taken up by the canvas frame (the canvas sits centred in it). */
  function fillFrame(lab, row) {
    if (!row) return;
    const side = row.querySelector(SIDE);
    const frame = row.querySelector(FRAME);
    if (!side || !frame) return;
    frame.style.minHeight = "";
    frame.classList.remove("la-frame-fill");
    const stage = [...row.children].find((c) => c !== side && !c.contains(side) && c.contains(frame));
    if (!stage || Math.abs(stage.getBoundingClientRect().top - side.getBoundingClientRect().top) > 40) return;
    // only when the frame is the last big thing in its column (captions may follow it)
    const gap = side.getBoundingClientRect().bottom - contentBottom(stage);
    if (gap > 40 && gap < 480) {
      frame.style.minHeight = `${Math.round(frame.getBoundingClientRect().height + gap)}px`;
      frame.classList.add("la-frame-fill");
    }
  }

  /*
   * Until the student has picked a prediction, the lab's primary action stays
   * disabled (spec: “选中前主按钮不可用”); dragging and presets stay free to explore.
   */
  const PICKED = ".is-picked, .is-right, .is-wrong";
  function gatePrimary(lab) {
    const box = lab.querySelector(PREDICT);
    // data-la-free: the lab locks its own later steps, so the early steps stay usable
    const primaries = [...lab.querySelectorAll("button.is-primary:not([data-la-free])")].filter((b) => !box || !box.contains(b));
    if (!box || !primaries.length) return;
    const open = box.classList.contains("is-done") || Boolean(box.querySelector(PICKED));
    primaries.forEach((b) => {
      if (!open && !b.disabled) {
        b.disabled = true;
        b.dataset.laGated = "1";
        b.title = "先在上方猜一猜";
      } else if (open && b.dataset.laGated) {
        b.disabled = false;
        delete b.dataset.laGated;
        b.removeAttribute("title");
      }
    });
    if (!lab.dataset.laGateWatch) {
      lab.dataset.laGateWatch = "1";
      lab.addEventListener("click", (e) => {
        if (e.target.closest(PREDICT)) requestAnimationFrame(() => gatePrimary(lab));
      });
    }
  }

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      normalize();
    });
  };

  const start = () => {
    const main = document.querySelector("main") || document.body;
    // also when something hidden opens (an answer, a conclusion): it needs the same layout pass
    new MutationObserver(schedule).observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "open"] });
    window.addEventListener("resize", schedule, { passive: true });
    schedule();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();


;/* visuals/shared/predict-ux.js */
/*
 * Prediction boxes behave the same in every lab. Every kit renders a `.xxl-predict` box
 * whose option buttons carry data-ok and data-why; this file adds, on top of each kit:
 *  - a “不确定，直接看” option: it unlocks the lab without a guess, and the reveal then
 *    simply shows the answer, with no right or wrong verdict;
 *  - after the reveal, every option can be clicked to read why it is right or wrong;
 *    the student's own pick keeps a “你的猜测” mark.
 * Before the reveal the kits already let the student change the pick freely.
 * Every lab's wrong-guess hint starts “再看看图：”; a hint that itself starts with “看…”
 * would say it twice, so that lead is dropped.
 */
(() => {
  const BOX = ".ch3l-predict, .ch6l-predict, .ch7l-predict, .ch9l-predict";
  const OPTIONS = ":scope > [class$='-predict-options']";
  const FEEDBACK = ":scope > [class$='-predict-feedback']";
  const UNSURE_HINT = "好，先不猜。动手操作一次，答案随后出现。";

  const isRevealed = (box) =>
    box.classList.contains("is-done") || box.dataset.answered === "true" || Boolean(box.querySelector(".is-right, .is-wrong"));
  const plain = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    div.querySelectorAll(".katex-mathml").forEach((n) => n.remove());
    return div.textContent.trim();
  };

  function enhance(box) {
    if (box.dataset.laUx) return;
    const options = box.querySelector(OPTIONS);
    const buttons = () => (options ? [...options.querySelectorAll("button[data-i]")] : []);
    if (!buttons().length || !buttons().some((b) => b.dataset.ok === "true")) return;
    box.dataset.laUx = "1";
    const right = () => buttons().find((b) => b.dataset.ok === "true");

    const unsure = document.createElement("button");
    unsure.type = "button";
    unsure.className = "la-unsure";
    unsure.textContent = "不确定，直接看";
    options.append(unsure);

    const why = document.createElement("p");
    why.className = "la-option-why";
    why.hidden = true;
    (box.querySelector(FEEDBACK) || options).after(why);

    unsure.addEventListener("click", (event) => {
      event.stopPropagation();
      if (isRevealed(box)) return;
      const answer = right();
      if (!answer) return;
      box.dataset.unsure = "1";
      // register a pick with the kit so the lab unlocks, without showing which one
      answer.click();
      const settle = () => {
        if (isRevealed(box)) return;
        buttons().forEach((b) => b.classList.remove("is-picked"));
        unsure.classList.add("is-picked");
        const feedback = box.querySelector(FEEDBACK);
        if (feedback) {
          feedback.hidden = false;
          feedback.textContent = UNSURE_HINT;
        }
      };
      settle();
      requestAnimationFrame(settle);
    });

    // a real pick after “不确定” is a guess again
    options.addEventListener("click", (event) => {
      if (!event.isTrusted || !event.target.closest("button[data-i]") || box.dataset.laUxRevealed) return;
      delete box.dataset.unsure;
      unsure.classList.remove("is-picked");
    });

    // after the reveal a click on an option explains it instead of grading again
    box.addEventListener(
      "click",
      (event) => {
        const button = event.target.closest("button[data-i]");
        if (!button || !box.dataset.laUxRevealed || !options.contains(button)) return;
        event.stopPropagation();
        event.preventDefault();
        explain(button);
      },
      true,
    );

    function explain(button) {
      buttons().forEach((b) => b.classList.toggle("is-viewing", b === button));
      const ok = button.dataset.ok === "true";
      const reason = button.dataset.why || "";
      why.hidden = false;
      why.innerHTML = `<b>${ok ? "✓ 这个选项对" : "× 这个选项不对"}</b>${reason ? `：${reason}` : "。"}`;
    }

    function onReveal() {
      if (box.dataset.laUxRevealed || !isRevealed(box)) return;
      box.dataset.laUxRevealed = "1";
      unsure.disabled = !box.dataset.unsure;
      const answer = right();
      if (box.dataset.unsure) {
        // no guess was made: show the answer without a verdict
        buttons().forEach((b) => b.classList.remove("is-right", "is-wrong", "is-picked"));
        answer?.classList.add("is-answer");
        unsure.classList.add("is-picked");
        // the option itself, formulas included (flattened text loses ≠, exponents …)
        const copy = answer?.cloneNode(true);
        copy?.querySelectorAll(".la-mine").forEach((n) => n.remove());
        const lead = copy && plain(copy.innerHTML) ? `答案是“${copy.innerHTML.trim()}”` : "答案";
        const lab = box.closest("section, [id$='-interactive']") || box.parentElement;
        const feedback = box.querySelector(FEEDBACK);
        if (feedback) {
          const html = feedback.innerHTML
            .replace(/✓\s*猜对了[，,]?/, `${lead}，`)
            .replace(/^(\s*<span[^>]*>)?\s*✓\s*/, (_, span) => `${span || ""}${lead}。`);
          feedback.innerHTML = html.includes(lead) ? html : `${lead}。${html}`;
        }
        // the ch7 kit repeats the verdict at the top of its conclusion box
        lab?.querySelectorAll("[class$='-ok']").forEach((n) => {
          if (n.textContent.trim() === "猜对了。") n.innerHTML = `${lead}。`;
        });
      } else {
        // kits mark the guess as right/wrong, or (the ch7 kit) leave it only “picked”
        let mine = buttons().find((b) => b.classList.contains("is-right") || b.classList.contains("is-wrong"));
        if (!mine) {
          mine = buttons().find((b) => b.classList.contains("is-picked"));
          if (mine) {
            mine.classList.remove("is-picked");
            mine.classList.add(mine.dataset.ok === "true" ? "is-right" : "is-wrong");
          }
        }
        if (mine && !mine.querySelector(".la-mine")) {
          const badge = document.createElement("em");
          badge.className = "la-mine";
          badge.textContent = "你的猜测";
          mine.append(badge);
        }
        // a wrong guess: the right option is marked as the answer as well
        if (mine && mine !== answer) answer?.classList.add("is-answer");
      }
      why.hidden = false;
      why.innerHTML = `<span class="la-option-hint">点其他选项，可以看它为什么对或错。</span>`;
    }

    new MutationObserver(onReveal).observe(box, { attributes: true, subtree: true, attributeFilter: ["class", "data-answered"] });
    onReveal();
  }

  const LOOK = /再看看图：\s*(?:请)?(?:注意)?(?:看一看|看看|看一下|观察一下|观察|看(?![清出到成作起见]))[，,：:\s]*/;
  function dropDoubledLook() {
    const main = document.querySelector("main") || document.body;
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.textContent.includes("再看看图") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
    const hits = [];
    while (walker.nextNode()) hits.push(walker.currentNode);
    hits.forEach((node) => {
      const fixed = node.textContent.replace(LOOK, "再看看图：");
      if (fixed !== node.textContent) node.textContent = fixed;
    });
  }

  /*
   * On a phone, when one option of a box needs two lines, every option of that box takes a
   * full row, one under another; otherwise short options stay side by side. An option's
   * single-line width is measured with wrapping switched off for a moment (data-la-opt-measure).
   */
  const PHONE = window.matchMedia?.("(max-width: 720px)");
  function stackOptions() {
    document.querySelectorAll(`:is(${BOX}) > [class$='-predict-options']`).forEach((options) => {
      const buttons = [...options.querySelectorAll(":scope > button")];
      if (!buttons.length || !options.getBoundingClientRect().width) return;
      let stack = false;
      if (PHONE?.matches) {
        const cs = getComputedStyle(options);
        const room = options.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        options.dataset.laOptMeasure = "1";
        stack = buttons.some((b) => b.getBoundingClientRect().width > room + 0.5);
        delete options.dataset.laOptMeasure;
      }
      // a data attribute: the kits find the box by its class name ending in “-predict-options”
      if (stack) options.dataset.laStack = "1";
      else delete options.dataset.laStack;
    });
  }

  const scan = () => {
    document.querySelectorAll(BOX).forEach(enhance);
    dropDoubledLook();
    stackOptions();
  };
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      scan();
    });
  };
  const start = () => {
    new MutationObserver(schedule).observe(document.querySelector("main") || document.body, { childList: true, subtree: true });
    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(stackOptions, 150);
    }, { passive: true });
    document.fonts?.ready.then(stackOptions);
    scan();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();


;/* visuals/shared/typeset.js */
/*
 * Chinese line breaking for the lesson page (styles in design-a.css):
 *  1. no line holds a single character alone: the last words of every text block, with
 *     the punctuation after them, stay together on one line (<la-t>);
 *  2. an inline formula breaks only after a relation (=, ≤, ∈ …) or an \allowbreak, never after + or −:
 *     the pieces between two relations are grouped (<la-mg>); a group wider than its line
 *     is given back its default break points;
 *  3. between Chinese text and an inline formula, or Latin letters and digits in justified
 *     text: a fixed quarter-em gap (<la-sp>) that justification does not stretch;
 *  4. in short texts (titles, questions, options) a word stays whole (<la-w>);
 *  5. a sentence with formulas inside a flex or grid box flows as text again (<la-run>);
 *  6. justified text that would come out letter-spaced keeps start alignment (data-la-ragged);
 *  7. a centred line ending in 。，； is centred on its ink (<la-hang>).
 * Only what changed is processed again; the script ignores its own edits.
 */
(() => {
  const CJK = /[\u3400-\u9fff\uf900-\ufaff]/g;
  const PUNCT = /^[\s，。：；、！？）」』”’》〉…—·,.;:!?)\]]+$/;
  const SKIP = ".katex, svg, canvas, script, style, textarea, input, select, code, pre, la-t, [contenteditable]";
  const segmenter = typeof Intl !== "undefined" && Intl.Segmenter ? new Intl.Segmenter("zh", { granularity: "word" }) : null;
  const cjkCount = (s) => (s.match(CJK) || []).length;
  const FUNC = "的了是在和与对把被为及或等也就都而且向从到由以之其个";

  /*
   * WebKit (Safari, and every browser on iOS) allows no line break on either side of a nowrap
   * box (<la-w>, <la-t>); Chromium breaks there as between any two Chinese characters. Without an
   * explicit <wbr>, a sentence made of kept words could not wrap at all and ran past a phone's
   * screen. A break is offered unless it would end a line on an opening mark or start one on a
   * closing mark; a space already offers one.
   */
  const OPENERS = "“‘（《「『【〈([{";
  const CLOSING = /^[，。：；、！？）」』”’》〉…,.;:!?)\]}]/;
  function allowBreakBefore(el) {
    const prev = el.previousSibling;
    if (!prev || prev.nodeName === "WBR") return;
    const before = prev.textContent;
    const ch = before.charAt(before.length - 1);
    if (!ch || /\s/.test(ch) || OPENERS.includes(ch) || CLOSING.test(el.textContent)) return;
    el.before(document.createElement("wbr"));
  }
  function allowBreakAfter(el) {
    const next = el.nextSibling;
    if (!next || next.nodeName === "WBR") return;
    const after = next.textContent;
    if (!after || /^\s/.test(after) || CLOSING.test(after) || OPENERS.includes(el.textContent.slice(-1))) return;
    el.after(document.createElement("wbr"));
  }

  /* the last non-empty piece of inline content of a block: a text node, or null */
  function tailText(block) {
    let node = block.lastChild;
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent.trim()) return node;
        node = node.previousSibling;
        continue;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) {
        node = node.previousSibling;
        continue;
      }
      if (node.matches(SKIP) || node.classList.contains("katex") || node.classList.contains("tex")) return null;
      const display = getComputedStyle(node).display;
      if (display === "none") {
        node = node.previousSibling;
        continue;
      }
      if (display !== "inline") return null;
      // descend into an inline element from its end
      if (node.lastChild) {
        node = node.lastChild;
        continue;
      }
      node = node.previousSibling;
    }
    return null;
  }

  /* where the kept tail starts: the trailing punctuation and enough last words for two characters */
  function tailStart(text) {
    if (cjkCount(text) < 2) return -1;
    const pieces = segmenter ? [...segmenter.segment(text)].map((s) => s.segment) : [...text];
    let kept = "";
    let start = text.length;
    for (let i = pieces.length - 1; i >= 0; i -= 1) {
      const piece = pieces[i];
      kept = piece + kept;
      start -= piece.length;
      if (PUNCT.test(piece)) continue;
      if (cjkCount(kept) >= 2 || kept.replace(PUNCT, "").length >= 4) {
        // a one-character word right before belongs to it (奇|排列) unless it is a particle (的|一侧)
        const before = pieces[i - 1];
        if (before && before.length === 1 && cjkCount(before) === 1 && !FUNC.includes(before)) {
          kept = before + kept;
          start -= 1;
        }
        break;
      }
    }
    // never more than a short phrase: a long tail would leave a ragged line before it
    if (kept.length > 10) return -1;
    // a short label (“第 1 行”) is kept whole
    return start >= 0 ? start : -1;
  }

  function keepTail(block) {
    // a column narrower than about two characters stacks its text on purpose
    if (block.clientWidth < parseFloat(getComputedStyle(block).fontSize) * 2.5) return;
    const node = tailText(block);
    if (!node || node.parentElement?.closest("la-t")) return;
    // in a flex or grid box a loose text run is an item of its own: a wrapper would split it
    if (node.parentElement === block && /flex|grid/.test(getComputedStyle(block).display)) return;
    const start = tailStart(node.textContent);
    if (start < 0) {
      keepWithFormula(block, node);
      return;
    }
    const tail = start > 0 ? node.splitText(start) : node;
    const keep = document.createElement("la-t");
    tail.before(keep);
    keep.append(tail);
    allowBreakBefore(keep);
  }

  /* a block that ends “… formula 中。” or “… z 轴。”: the single character stays with the short
     formula, or the short Latin word or number, in front of it */
  const LATIN_WORD = /^[^\u3400-\u9fff\uf900-\ufaff\s]{1,12}$/;
  function keepWithFormula(block, node) {
    const text = node.textContent.trim();
    // one character with its marks, or the marks alone (“<span>有解</span>。”)
    if (!text || text.length > 3 || cjkCount(text) > 1 || (cjkCount(text) === 0 && !PUNCT.test(text))) return;
    let prev = node.previousSibling;
    while (prev && (prev.nodeName === "LA-SP" || prev.nodeName === "WBR" || (prev.nodeType === Node.TEXT_NODE && !prev.textContent.trim()))) prev = prev.previousSibling;
    if (!prev) return;
    const latin = prev.nodeType === Node.TEXT_NODE && LATIN_WORD.test(prev.textContent);
    const word = prev.nodeType === Node.ELEMENT_NODE && !prev.matches(SKIP) && !prev.matches(".tex, .katex, .la-keep, la-sp")
      && getComputedStyle(prev).display === "inline" && prev.textContent.trim().length <= 8;
    if (!latin && !word && (prev.nodeType !== Node.ELEMENT_NODE || !prev.matches(".tex, .katex, .la-keep"))) return;
    const em = parseFloat(getComputedStyle(block).fontSize);
    if (!latin && !word && prev.getBoundingClientRect().width > em * 8) return;
    const keep = document.createElement("la-t");
    prev.before(keep);
    let cur = prev;
    while (cur) {
      const next = cur.nextSibling;
      keep.append(cur);
      if (cur === node) break;
      cur = next;
    }
    // the kept tail is one unit: no break offered inside it
    keep.querySelectorAll("wbr").forEach((w) => w.remove());
    allowBreakBefore(keep);
  }

  /* short texts (titles, questions, options, captions): a word is never split over two lines */
  const SHORT = "h1, h2, h3, h4, summary, figcaption, legend, .la-figcaption, [class*='predict-q'] p, [class*='predict-options'] > button, button[data-i], .example-choice-copy, li, [class$='-head'] > *, .lead";
  const WORD = /^[\u3400-\u9fff\uf900-\ufaff]{2,5}$/;
  function keepWords(block) {
    if (!segmenter || block.dataset.laWords || block.textContent.length > 140) return;
    block.dataset.laWords = "1";
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement.closest(".katex, la-w, la-t, la-sp, svg, button button") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      // a loose text run in a flex or grid box is an item of its own: wrappers would split it
      if (/flex|grid/.test(getComputedStyle(node.parentElement).display)) return;
      const parts = [...segmenter.segment(node.textContent)].map((x) => x.segment);
      if (!parts.some((x) => WORD.test(x))) return;
      const frag = document.createDocumentFragment();
      let plain = "";
      parts.forEach((x) => {
        if (!WORD.test(x)) {
          plain += x;
          return;
        }
        if (plain) frag.append(plain);
        plain = "";
        const w = document.createElement("la-w");
        w.textContent = x;
        frag.append(w);
      });
      if (plain) frag.append(plain);
      const words = [...frag.querySelectorAll("la-w")];
      node.replaceWith(frag);
      words.forEach((w) => {
        allowBreakBefore(w);
        allowBreakAfter(w);
      });
    });
  }

  /*
   * A flex or grid box makes every loose text run and every formula an item of its own, so
   * a sentence “文字 公式 文字” inside one falls apart into a column or wide gaps. Such a
   * sentence is wrapped (<la-run>) and flows as ordinary text again.
   */
  const INLINE = ".tex, la-sp, la-t, la-w, wbr, b, strong, em, i, sub, sup, a, code";
  function joinRuns(box) {
    if (box.closest(".katex, svg")) return;
    const runs = [[]];
    [...box.childNodes].forEach((n) => {
      const inline = n.nodeType === Node.TEXT_NODE || (n.nodeType === Node.ELEMENT_NODE && n.matches(INLINE));
      if (inline) runs[runs.length - 1].push(n);
      else runs.push([]);
    });
    // a long sentence beside another item (“停一下” + question in a flex summary): one item
    // of its own, so its last words can be kept together inside it
    const items = [...box.childNodes].filter((n) => n.nodeType === Node.ELEMENT_NODE || n.textContent.trim()).length;
    const sentence = (run) => items > run.length && !box.matches("button, label, a, [role='button']")
      && run.every((n) => n.nodeType === Node.TEXT_NODE || n.matches("la-sp, la-w, wbr, b, strong, em, i, sub, sup"))
      && cjkCount(run.map((n) => n.textContent).join("")) >= 12;
    runs.forEach((run) => {
      const texts = run.filter((n) => n.nodeType === Node.TEXT_NODE && cjkCount(n.textContent) > 0);
      if (!sentence(run) && (texts.length < 2 || !run.some((n) => n.nodeType === Node.ELEMENT_NODE && n.matches(".tex")))) return;
      while (run.length && run[0].nodeType === Node.TEXT_NODE && !run[0].textContent.trim()) run.shift();
      const wrap = document.createElement("la-run");
      run[0].before(wrap);
      run.forEach((n) => wrap.append(n));
    });
  }

  const isBlock = (el) => {
    if (el.matches(SKIP) || el.closest(".katex, svg, canvas, [hidden]")) return false;
    const display = getComputedStyle(el).display;
    return display !== "inline" && display !== "contents" && display !== "none";
  };

  /* formulas: group the KaTeX pieces so a line only breaks after a relation */
  // a piece is a KaTeX .base, or the wrapper lab-layout.js puts around the last one (with its 。)
  const pieceBase = (item) => (item.classList.contains("base") ? item : [...item.querySelectorAll(".base")].pop());
  const endsWithRelation = (item) => {
    const base = pieceBase(item);
    if (!base) return false;
    const kids = [...base.children].filter((c) => !c.classList.contains("strut") && !c.classList.contains("mspace"));
    const last = kids[kids.length - 1];
    // KaTeX ends a piece after a binary operator, a relation, or an explicit \allowbreak:
    // only the operator ends are not allowed as line breaks
    return Boolean(last && !last.classList.contains("mbin"));
  };

  function groupFormula(katex) {
    const html = katex.querySelector(":scope > .katex-html");
    if (!html || katex.closest(".katex-display") || html.dataset.laGrouped) return;
    // a formula not laid out yet (a closed answer) has no widths to judge by: it is grouped
    // when it is shown (typeset.js sees the open / hidden change)
    if (!html.getBoundingClientRect().width) return;
    html.dataset.laGrouped = "1";
    const bases = [...html.children].filter((c) => c.classList.contains("base") || (c.matches(".la-keep, la-okeep") && c.querySelector(".base")));
    if (bases.length < 2) return;
    // a short formula (A=CᵀC) stays whole: broken after its relation it reads as two pieces
    const em = parseFloat(getComputedStyle(katex.closest(".tex") || katex).fontSize);
    // the pieces' own widths: a formula already broken over two lines has a box as wide as both
    const width = bases.reduce((sum, b) => sum + (pieceBase(b)?.getBoundingClientRect().width || 0), 0);
    const short = width <= 7 * em;
    const groups = [];
    let current = [];
    bases.forEach((base) => {
      current.push(base);
      if (!short && endsWithRelation(base)) {
        groups.push(current);
        current = [];
      }
    });
    if (current.length) groups.push(current);
    groups.forEach((group) => {
      if (group.length < 2) return;
      const wrap = document.createElement("la-mg");
      group[0].before(wrap);
      group.forEach((base) => wrap.append(base));
    });
    fitGroups(katex);
  }

  /* a group wider than the line cannot stay unbroken: give its pieces back */
  function fitGroups(katex) {
    const block = katex.closest("p, li, dd, dt, td, th, div, label, button, figcaption, summary, h1, h2, h3, h4") || katex.parentElement;
    if (!block) return;
    const cs = getComputedStyle(block);
    const room = block.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    katex.querySelectorAll("la-mg").forEach((group) => {
      if (room > 0 && group.getBoundingClientRect().width > room + 1) group.replaceWith(...group.childNodes);
    });
  }

  /* an inline formula next to Chinese text: a quarter-em gap instead of a typed space */
  const HAN_END = /[\u3400-\u9fff\uf900-\ufaff](\s+)$/;
  const HAN_START = /^(\s+)[\u3400-\u9fff\uf900-\ufaff]/;
  const HAN_TOUCH_END = /[\u3400-\u9fff\uf900-\ufaff]$/;
  const HAN_TOUCH_START = /^[\u3400-\u9fff\uf900-\ufaff]/;
  // the text right before (dir = -1) or after (dir = 1) a node, within its block
  function neighbourText(node, dir) {
    let cur = node;
    for (;;) {
      let sib = dir < 0 ? cur.previousSibling : cur.nextSibling;
      while (sib) {
        if (sib.nodeType === Node.TEXT_NODE) {
          if (sib.textContent) return sib;
        } else if (sib.nodeType === Node.ELEMENT_NODE) {
          if (sib.matches(".tex, .katex, br, la-mg") || getComputedStyle(sib).display !== "inline") return null;
          if (sib.firstChild) {
            sib = dir < 0 ? sib.lastChild : sib.firstChild;
            continue;
          }
        }
        sib = dir < 0 ? sib.previousSibling : sib.nextSibling;
      }
      const up = cur.parentElement;
      if (!up || getComputedStyle(up).display !== "inline") return null;
      cur = up;
    }
  }
  // the gap is a four-per-em space (U+2005) brought to about a quarter em: a line can
  // break after it, and justified text never stretches it (browsers widen U+0020 spaces,
  // and WebKit widens them before anything else, which left wide holes beside formulas)
  const gap = () => {
    const sp = document.createElement("la-sp");
    sp.textContent = "\u2005";
    return sp;
  };
  function spaceFormula(katex) {
    if (katex.closest(".katex-display")) return;
    const unit = katex.parentElement?.closest(".tex") || katex;
    if (unit.dataset.laSp) return;
    unit.dataset.laSp = "1";
    if (getComputedStyle(unit).display === "block") return;
    let before = neighbourText(unit, -1);
    // an opening mark right before the formula (“（det C=1”) goes with its first piece, so a
    // line never ends on “（”: the mirror of the closing marks lab-layout.js glues to the last piece
    const opener = before?.textContent.slice(-1);
    if (opener && OPENERS.includes(opener) && !before.parentElement.closest(".katex, la-okeep")) {
      const first = katex.querySelector(":scope > .katex-html .base");
      if (first) {
        before.textContent = before.textContent.slice(0, -1);
        const mark = document.createElement("span");
        mark.className = "la-punct";
        mark.textContent = opener;
        const keep = document.createElement("la-okeep");
        first.before(keep);
        keep.append(mark, first);
        // the mark sits flush against the formula: no gap before it
        before = null;
      }
    }
    if (before && !before.parentElement.closest("la-sp")) {
      const m = before.textContent.match(HAN_END);
      if (m) before.textContent = before.textContent.slice(0, -m[1].length);
      if (m || HAN_TOUCH_END.test(before.textContent)) before.after(gap());
    }
    // a closing mark glued to the formula (lab-layout.js) brings its own space
    if (unit.querySelector(".la-punct")) return;
    const after = neighbourText(unit, 1);
    if (after && !after.parentElement.closest("la-sp")) {
      const m = after.textContent.match(HAN_START);
      if (m) after.textContent = after.textContent.slice(m[1].length);
      if (m || HAN_TOUCH_START.test(after.textContent)) after.before(gap());
    }
  }

  // how much the gap character differs from the target width 0.2em (with the Chinese
  // glyph's own side bearing that makes about a quarter em)
  function measureGap() {
    const body = document.querySelector("main p") || document.body;
    const cs = getComputedStyle(body);
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.font = `100px ${cs.fontFamily}`;
    const space = ctx.measureText("\u2005").width / 100;
    document.documentElement.style.setProperty("--la-sp-adjust", `${(0.2 - space).toFixed(3)}em`);
  }

  /* a typed space between Chinese and Latin letters or digits (“第 2 行”, “把 n 个”) in
     justified text becomes the same fixed gap, so justification goes between the Chinese
     characters instead of opening that space */
  const LATIN_GAP = /([\u3400-\u9fff\uf900-\ufaff]) +(?=[A-Za-z0-9\u0370-\u03ff(])|([A-Za-z0-9\u0370-\u03ff)]) +(?=[\u3400-\u9fff\uf900-\ufaff])/;
  function spaceLatin(block) {
    if (getComputedStyle(block).textAlign !== "justify") return;
    [...block.childNodes].forEach((node) => {
      if (node.nodeType !== Node.TEXT_NODE || !LATIN_GAP.test(node.textContent)) return;
      let cur = node;
      let m;
      while (cur && (m = LATIN_GAP.exec(cur.textContent))) {
        const lead = (m[1] || m[2]).length;
        const at = m.index + lead;
        const width = m[0].length - lead;
        const rest = cur.splitText(at);
        rest.textContent = rest.textContent.slice(width);
        rest.before(gap());
        cur = rest;
      }
    });
  }

  /*
   * Justified text with a loose line: when the last words are kept together (or a mark may
   * not start a line) the line before them runs short, and justification spreads the gap over
   * its characters. In a wide block that is invisible; in a narrow card it reads as letter-
   * spaced text. A block whose natural lines would need more than LOOSE em per character
   * keeps start alignment (data-la-ragged) instead.
   */
  const LOOSE = 0.11;
  function lineBoxes(block) {
    const rects = [];
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
      acceptNode: (n) => {
        if (n.nodeType === Node.ELEMENT_NODE) {
          if (n.classList.contains("katex")) {
            [...n.getClientRects()].forEach((r) => r.width && rects.push(r));
            return NodeFilter.FILTER_REJECT;
          }
          const d = getComputedStyle(n).display;
          return d === "inline" || d === "contents" ? NodeFilter.FILTER_SKIP : NodeFilter.FILTER_REJECT;
        }
        return n.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    const range = document.createRange();
    while (walker.nextNode()) {
      range.selectNodeContents(walker.currentNode);
      [...range.getClientRects()].forEach((r) => r.width && rects.push(r));
    }
    const lines = [];
    rects.forEach((r) => {
      const mid = (r.top + r.bottom) / 2;
      let line = lines.find((l) => mid > l.top && mid < l.bottom);
      if (!line) lines.push((line = { top: r.top, bottom: r.bottom, left: r.left, right: r.right }));
      line.top = Math.min(line.top, r.top);
      line.bottom = Math.max(line.bottom, r.bottom);
      line.left = Math.min(line.left, r.left);
      line.right = Math.max(line.right, r.right);
    });
    return lines.sort((a, b) => a.top - b.top);
  }
  const ownsText = (el) => [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && cjkCount(n.textContent) > 0);
  function settleJustify(blocks) {
    const list = blocks.filter((b) => b.isConnected && ownsText(b) && (b.dataset.laRagged || getComputedStyle(b).textAlign === "justify"));
    if (!list.length) return;
    // measure the natural (start-aligned) lines of all of them in one layout
    list.forEach((b) => b.setAttribute("data-la-measure", ""));
    const verdict = list.map((b) => {
      const lines = lineBoxes(b);
      if (lines.length < 2) return false;
      const cs = getComputedStyle(b);
      const em = parseFloat(cs.fontSize);
      const box = b.getBoundingClientRect();
      const right = box.right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth);
      return lines.slice(0, -1).some((l) => (right - l.right) / Math.max(1, (l.right - l.left) / em) > LOOSE * em);
    });
    list.forEach((b, i) => {
      b.removeAttribute("data-la-measure");
      if (verdict[i]) b.dataset.laRagged = "1";
      else delete b.dataset.laRagged;
    });
  }

  /*
   * A centred line ending in a full-width mark (。，；) looks shifted to the left: the mark's
   * ink fills only the left half of its em. The mark gets a negative half-em end margin
   * (<la-hang>), so the line is centred on what is visible (Apple centres titles this way).
   */
  const END_MARK = /[。，；：！？、]$/;
  function hangEnd(block) {
    if (block.matches("button, [role='button'], label") || block.querySelector("la-hang")) return;
    if (getComputedStyle(block).textAlign !== "center") return;
    let node = tailText(block);
    if (!node || !END_MARK.test(node.textContent.trimEnd())) return;
    const text = node.textContent.trimEnd();
    const mark = node.splitText(text.length - 1);
    const hang = document.createElement("la-hang");
    mark.before(hang);
    hang.append(mark);
  }

  function process(root) {
    if (!root || !root.isConnected) return;
    const scope = root.nodeType === Node.ELEMENT_NODE ? root : root.parentElement;
    if (!scope) return;
    const main = document.querySelector("main") || document.body;
    if (!main.contains(scope)) return;
    // the blocks inside the changed part, and the block that contains it
    const all = [...scope.querySelectorAll("*")];
    if (scope.nodeType === Node.ELEMENT_NODE) all.push(scope);
    all.forEach((el) => {
      if (/flex|grid/.test(getComputedStyle(el).display)) joinRuns(el);
    });
    const blocks = [...scope.querySelectorAll("*")].filter(isBlock);
    let up = scope;
    while (up && up !== main && !isBlock(up)) up = up.parentElement;
    if (up && up !== main) blocks.push(up);
    if (isBlock(scope)) blocks.push(scope);
    const formulas = [...scope.querySelectorAll(".katex")];
    formulas.forEach(spaceFormula);
    [...new Set(blocks)].forEach(spaceLatin);
    [...new Set(blocks)].forEach(keepTail);
    [...new Set(blocks)].forEach(hangEnd);
    settleJustify([...new Set(blocks)]);
    const shorts = [...scope.querySelectorAll(SHORT)];
    if (scope.matches?.(SHORT)) shorts.push(scope);
    const near = scope.closest?.(SHORT);
    if (near) shorts.push(near);
    [...new Set(shorts)].forEach(keepWords);
    formulas.forEach(groupFormula);
    scope.closest?.(".katex") && groupFormula(scope.closest(".katex"));
  }

  let observer = null;
  let pending = new Set();
  let queued = false;
  const flush = () => {
    queued = false;
    const roots = [...pending];
    pending = new Set();
    observer?.disconnect();
    try {
      roots.forEach(process);
    } finally {
      observer?.observe(document.querySelector("main") || document.body, OBSERVE);
    }
  };
  const OBSERVE = { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["hidden", "open"] };
  const schedule = (node) => {
    pending.add(node);
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => setTimeout(flush, 30));
  };

  let resizeTimer = 0;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      document.querySelectorAll("main .katex").forEach(fitGroups);
      settleJustify([...document.querySelectorAll("main *")].filter(isBlock));
    }, 200);
  };

  const start = () => {
    measureGap();
    document.fonts?.ready.then(() => {
      measureGap();
      settleJustify([...document.querySelectorAll("main *")].filter(isBlock));
    });
    const main = document.querySelector("main") || document.body;
    observer = new MutationObserver((records) => {
      records.forEach((record) => {
        if (record.type === "characterData") schedule(record.target.parentElement);
        else if (record.type === "attributes") schedule(record.target);
        else {
          record.addedNodes.forEach((n) => schedule(n.nodeType === Node.ELEMENT_NODE ? n : record.target));
        }
      });
    });
    observer.observe(main, OBSERVE);
    window.addEventListener("resize", onResize, { passive: true });
    schedule(main);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();


;/* visuals/shared/lesson-figures.js */
/*
 * Static SVG figures for lesson-extras.js. Colours come from CSS classes
 * (lesson-extras.css), so the figures follow the light and dark themes.
 */
(() => {
  const define = window.defineLessonFigure;
  if (!define) return;
  const sub = (n) => String(n).replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[d]);

  /* ch1 §2: a_i b_j in row i, column j; one anti-diagonal gives the x^k coefficient. */
  define("poly-product-table", () => {
    const a = [2, -1, 3];
    const b = [1, 2, 1];
    const k = 2;
    const c = 58;
    const x0 = 120;
    const y0 = 52;
    let cells = "";
    a.forEach((ai, i) =>
      b.forEach((bj, j) => {
        const hi = i + j === k;
        const x = x0 + j * c;
        const y = y0 + i * c;
        cells += `<rect x="${x}" y="${y}" width="${c - 6}" height="${c - 6}" rx="8" class="${hi ? "lx-svg-hi" : "lx-svg-cell"}"/>`;
        cells += `<text x="${x + (c - 6) / 2}" y="${y + (c - 6) / 2 + 5}" text-anchor="middle" class="lx-svg-text">${ai * bj}</text>`;
      }),
    );
    const head = b.map((bj, j) => `<text x="${x0 + j * c + (c - 6) / 2}" y="${y0 - 14}" text-anchor="middle" class="lx-svg-muted">b${sub(j)}=${bj}</text>`).join("");
    const side = a.map((ai, i) => `<text x="${x0 - 14}" y="${y0 + i * c + (c - 6) / 2 + 5}" text-anchor="end" class="lx-svg-muted">a${sub(i)}=${ai}</text>`).join("");
    const sum = `<text x="${x0 + 3 * c + 30}" y="${y0 + 1.5 * c - 18}" class="lx-svg-text">i+j=2 的格子：</text>
      <text x="${x0 + 3 * c + 30}" y="${y0 + 1.5 * c + 8}" class="lx-svg-text">2 + (−2) + 3 = 3</text>
      <text x="${x0 + 3 * c + 30}" y="${y0 + 1.5 * c + 34}" class="lx-svg-muted">= fg 中 x² 的系数</text>`;
    return `<svg viewBox="0 0 520 240" role="img" aria-label="系数乘法表">${head}${side}${cells}${sum}</svg>`;
  });

  /* ch1 §4: roots of f and g in the complex plane; the shared root is the root of gcd(f,g). */
  define("gcd-common-roots", () => {
    const W = 520;
    const H = 230;
    const ox = 260;
    const oy = 118;
    const s = 62;
    const P = (re, im) => [ox + re * s, oy - im * s];
    let grid = `<line x1="40" y1="${oy}" x2="${W - 40}" y2="${oy}" class="lx-svg-line"/><line x1="${ox}" y1="16" x2="${ox}" y2="${H - 16}" class="lx-svg-line"/>`;
    grid += `<text x="${W - 46}" y="${oy - 8}" class="lx-svg-muted">实轴</text><text x="${ox + 8}" y="26" class="lx-svg-muted">虚轴</text>`;
    const fRoots = [[1, 0, "1"], [0, 1, "i"], [0, -1, "−i"]];
    const gRoots = [[1, 0], [-2, 0, "−2"]];
    let marks = "";
    fRoots.forEach(([re, im, t]) => {
      const [x, y] = P(re, im);
      marks += `<circle cx="${x}" cy="${y}" r="11" fill="none" stroke="var(--accent)" stroke-width="2.4"/>`;
      if (t) marks += `<text x="${x + 15}" y="${y - 10}" class="lx-svg-text">${t}</text>`;
    });
    gRoots.forEach(([re, im, t]) => {
      const [x, y] = P(re, im);
      marks += `<circle cx="${x}" cy="${y}" r="5.5" class="lx-svg-dot2"/>`;
      if (t) marks += `<text x="${x - 6}" y="${y + 24}" class="lx-svg-text">${t}</text>`;
    });
    const legend = `<circle cx="56" cy="34" r="8" fill="none" stroke="var(--accent)" stroke-width="2.2"/><text x="72" y="39" class="lx-svg-muted">f=(x−1)(x²+1) 的根</text>
      <circle cx="56" cy="60" r="5" class="lx-svg-dot2"/><text x="72" y="65" class="lx-svg-muted">g=(x−1)(x+2) 的根</text>`;
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="两个多项式的根与公共根">${grid}${legend}${marks}</svg>`;
  });

  /* ch2 §3: the six terms of a 3x3 determinant as rook placements. */
  define("det3-rooks", () => {
    const perms = [
      [[1, 2, 3], "+"],
      [[2, 3, 1], "+"],
      [[3, 1, 2], "+"],
      [[1, 3, 2], "−"],
      [[2, 1, 3], "−"],
      [[3, 2, 1], "−"],
    ];
    const c = 20;
    const gap = 26;
    const bw = 3 * c;
    let out = "";
    perms.forEach(([p, sign], k) => {
      const x0 = 14 + (k % 3) * (bw + gap);
      const y0 = 14 + Math.floor(k / 3) * 128;
      for (let i = 0; i < 3; i += 1)
        for (let j = 0; j < 3; j += 1) out += `<rect x="${x0 + j * c}" y="${y0 + i * c}" width="${c}" height="${c}" class="lx-svg-cell"/>`;
      p.forEach((col, i) => {
        out += `<circle cx="${x0 + (col - 1) * c + c / 2}" cy="${y0 + i * c + c / 2}" r="6" class="${sign === "+" ? "lx-svg-dot" : "lx-svg-dot2"}"/>`;
      });
      out += `<text x="${x0 + bw / 2}" y="${y0 + bw + 20}" text-anchor="middle" class="lx-svg-text">${sign} ${p.join("")}</text>`;
      out += `<text x="${x0 + bw / 2}" y="${y0 + bw + 38}" text-anchor="middle" class="lx-svg-muted">a₁${sub(p[0])}a₂${sub(p[1])}a₃${sub(p[2])}</text>`;
    });
    return `<svg viewBox="0 0 ${14 + 3 * (bw + gap)} 262" role="img" aria-label="三阶行列式的六个项" style="max-width:420px;margin:0 auto">${out}</svg>`;
  });
})();


;/* learn-entry.js */
/*
 * learn.html entry adapter.
 * The existing course engine remains in app.js; this file turns it into the
 * dedicated learning application and supplies the guide route.
 */

const LEARN_GUIDE_CHAPTER = {
  id: "guide",
  icon: "0",
  title: "导学",
  subtitle: "如何使用",
  sections: [],
};

function learnTrackableSections(chapter) {
  return (chapter.sections || []).filter((section) => typeof section === "object" && section.id);
}

function learnChapterNumber(chapter) {
  const match = /^ch(\d+)$/.exec(chapter.id || "");
  if (match) return Number(match[1]);
  const index = algebraContent.chapters.indexOf(chapter);
  return index >= 0 ? index + 1 : 0;
}

function learnChapterShortTitle(chapter) {
  const trimmed = String(chapter.title || "")
    .replace(/^第[0-9一二三四五六七八九十百]+章/, "")
    .replace(/^[\s·:：\-—]+/, "")
    .trim();
  return trimmed || chapter.title || "";
}

function learnOrderedChapters() {
  return [...algebraContent.chapters].sort((a, b) => learnChapterNumber(a) - learnChapterNumber(b));
}

function learnFirstStructuredTarget() {
  for (const chapter of learnOrderedChapters()) {
    const first = learnTrackableSections(chapter)[0];
    if (first) return `#${chapter.id}/${first.id}`;
  }
  return "#ch4/matrix-language";
}

function learnLastTarget() {
  const last = readPreference("la-visual-last");
  if (!last || !last.startsWith("#")) return null;

  const [route, section] = last.slice(1).split("/");
  const chapter = algebraContent.chapters.find((item) => item.id === route);
  if (!chapter) return null;

  if (section) {
    if (!learnTrackableSections(chapter).some((item) => item.id === section)) return null;
  }

  return last;
}

getChapters = function getLearningChapters() {
  return [LEARN_GUIDE_CHAPTER, ...algebraContent.chapters];
};

getChapterById = function getLearningChapterById(id) {
  return getChapters().find((chapter) => chapter.id === id) || LEARN_GUIDE_CHAPTER;
};

getProgress = function getLearningProgress() {
  const trackable = algebraContent.chapters.flatMap((chapter) => learnTrackableSections(chapter));
  return { done: trackable.filter((section) => state.completed.has(section.id)).length, total: trackable.length };
};

getStartTarget = function getLearningStartTarget() {
  return learnLastTarget() || learnFirstStructuredTarget();
};

hasVisitedLesson = function hasLearningHistory() {
  return Boolean(learnLastTarget());
};

renderNav = function renderLearningNav() {
  els.nav.innerHTML = getChapters()
    .map((chapter) => {
      const chapterHref = `#${chapter.id}`;
      const structured = learnTrackableSections(chapter);
      const sectionLinks =
        chapter.id === "guide"
          ? ""
          : structured.length
            ? structured
                .map(
                  (section) => `
                    <a class="nav-section" href="#${chapter.id}/${section.id}" data-section-link="${section.id}" data-search-text="${normalizeSearchText(
                      getSectionSearchText(section),
                    )}">
                      <span class="status-dot"></span>
                      <span>${section.number} ${section.navTitle}</span>
                      <span class="section-status">未掌握</span>
                    </a>`,
                )
                .join("")
            : chapter.sections
                .map(
                  (section) => `
                    <a class="nav-section" href="${chapterHref}" data-search-text="${normalizeSearchText(getSectionSearchText(section))}">
                      <span class="status-dot"></span>
                      <span>${getSectionLabel(section)}</span>
                    </a>`,
                )
                .join("");

      return `
        <div class="chapter-group" data-chapter="${chapter.id}" data-search-text="${normalizeSearchText(`${chapter.title} ${getChapterSectionText(chapter)}`)}">
          <button class="nav-chapter" type="button" aria-expanded="false">
            <span class="chapter-icon">${chapter.icon}</span>
            <span class="chapter-label"><strong>${chapter.title}</strong><small>${getChapterSubtitle(chapter.id)}</small></span>
            <span class="chapter-arrow">›</span>
          </button>
          <div class="section-list">
            <div class="section-list-clip">
              <div class="section-list-inner">${sectionLinks}</div>
            </div>
          </div>
        </div>`;
    })
    .join("");

  bindChapterToggles();
  updateProgressUI();
};

updateContinueShortcut = function updateLearningContinueShortcut() {
  const shortcut = document.querySelector("#continueShortcut");
  if (!shortcut) return;
  shortcut.href = getStartTarget();
  shortcut.textContent = hasVisitedLesson() ? "继续学习" : "从第一节开始";
};

renderGuide = function renderLearningGuide() {
  const startTarget = getStartTarget();
  const visited = hasVisitedLesson();

  els.main.innerHTML = `
    <section class="section-band guide-hero" id="guide-intro">
      <div class="section-kicker">导学</div>
      <h2>先看见，再定义</h2>
      <p class="lead">这里沿北大版《高等代数》的章节展开。每个小节从一个具体的问题出发，先用图像与交互把画面立起来，再回到教材里的定义、定理与例题。</p>
      <p>你可以从头按顺序读，也可以在左侧目录里直接跳到正在学的小节。学习进度保存在这台设备上，随时可以接着上次的位置继续。</p>
      <div class="hero-actions">
        <a class="button primary" href="${startTarget}">${visited ? "继续学习" : "从第一节开始"}</a>
        <a class="button ghost" href="#guide-map" data-scroll-to="guide-map">查看学习路线</a>
      </div>
    </section>

    <section class="section-band" id="guide-usage">
      <div class="section-head"><div><div class="section-kicker">怎么学</div><h2>每个小节的三个动作</h2></div></div>
      <div class="usage-grid">
        <div class="usage-card"><span class="usage-step">01</span><strong>先抓住问题</strong><p>先明确这一节在回答什么，再建立必要的图像、结构和阅读方向。</p></div>
        <div class="usage-card"><span class="usage-step">02</span><strong>动手实验</strong><p>拖动矩阵元素、切换视角，亲手看网格、向量和结构怎样随参数变化。</p></div>
        <div class="usage-card"><span class="usage-step">03</span><strong>回到教材</strong><p>对照定义与定理，再做一道代表例题——答案默认折叠，先自己算。</p></div>
      </div>
      <div class="usage-tip">读完一节，点底部的「标记掌握」，进度会同步到左侧目录和下面的学习路线。</div>
    </section>

    <section class="section-band" id="guide-map">
      <div class="section-head"><div><div class="section-kicker">学习路线</div><h2>沿教材章节展开</h2></div></div>
      <div class="route-grid">${learnOrderedChapters().map(renderLearningRouteCard).join("")}</div>
    </section>`;
};

function renderLearningRouteCard(chapter) {
  const trackable = learnTrackableSections(chapter);
  const done = trackable.filter((section) => state.completed.has(section.id)).length;
  const ready = trackable.length > 0;
  const percent = ready ? Math.round((done / trackable.length) * 100) : 0;
  const preview = chapter.sections.slice(0, 4).map(getSectionLabel).join(" · ");
  const status = ready
    ? `<div class="route-meter" role="img" aria-label="已掌握 ${done} / ${trackable.length}"><span style="width:${percent}%"></span></div><span class="route-count">${done}/${trackable.length} 已掌握</span>`
    : `<span class="route-count">${chapter.sections.length} 个小节</span>`;
  const href = ready ? `#${chapter.id}/${trackable[0].id}` : `#${chapter.id}`;

  return `
    <a class="route-card${ready ? "" : " is-soon"}" href="${href}">
      <span class="route-num">${String(learnChapterNumber(chapter)).padStart(2, "0")}</span>
      <div class="route-body"><strong>${escapeHtml(learnChapterShortTitle(chapter))}</strong><p>${preview}${chapter.sections.length > 4 ? " …" : ""}</p></div>
      <div class="route-status">${status}</div>
    </a>`;
}

renderRoute = function renderLearningRoute() {
  const raw = decodeURIComponent(window.location.hash.replace(/^#/, "")) || "guide";
  const [requestedRoute, requestedSection] = raw.split("/");

  if (requestedRoute === "home") {
    window.location.replace("./index.html");
    return;
  }

  const chapter =
    requestedRoute === "guide"
      ? LEARN_GUIDE_CHAPTER
      : algebraContent.chapters.find((item) => item.id === requestedRoute) || LEARN_GUIDE_CHAPTER;
  const structured = learnTrackableSections(chapter);
  const validSection =
    requestedSection && structured.some((item) => item.id === requestedSection) ? requestedSection : "";

  state.route = chapter.id;
  state.section = validSection;
  state.openChapters.add(state.route);
  document.body.dataset.route = state.route;
  document.body.dataset.view = state.section ? "lesson" : "overview";

  if (chapter.id === "guide") renderGuide();
  else if (structured.length) renderStructuredChapter(chapter);
  else renderPlaceholder(chapter);

  if (chapter.id !== "guide") {
    writePreference("la-visual-last", `#${state.route}${state.section ? `/${state.section}` : ""}`);
  }

  updateDocumentTitle(chapter);
  updateNavActive();
  updateContinueShortcut();
  buildPageToc();
  document.body.classList.remove("sidebar-open");

  window.requestAnimationFrame(() => {
    setupInteractiveBlocks();
    if (state.section) document.querySelector(`#${CSS.escape(state.section)}`)?.scrollIntoView({ block: "start", behavior: "auto" });
    else window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  });
};


;/* learn-placeholder.js */
renderPlaceholder = function renderLearningPlaceholder(chapter) {
  els.main.innerHTML = `
    <section class="hero" id="${chapter.id}">
      <div class="hero-copy">
        <span class="eyebrow">章节导览</span>
        <h1>${chapter.title}</h1>
        <p>这一章围绕下列主题展开，适合配合教材相应章节阅读。</p>
        <div class="hero-actions">
          <a class="button primary" href="${getStartTarget()}">${hasVisitedLesson() ? "继续学习" : "从第一节开始"}</a>
          <a class="button ghost" href="#guide">查看学习路线</a>
        </div>
      </div>
      <div class="hero-visual">${renderHeroVisual()}</div>
    </section>
    <section class="section-band" id="planned-sections">
      <div class="section-head">
        <div>
          <div class="section-kicker">本章主题</div>
          <h2>${chapter.title}的可视化入口</h2>
        </div>
      </div>
      <p class="lead">这些主题围绕概念理解和可视化表达组织，帮助学生抓住章节主线。</p>
      <ul class="placeholder-list">
        ${chapter.sections.map((item) => `<li>${getSectionLabel(item)}</li>`).join("")}
      </ul>
    </section>`;
};


;/* structured-learning.js */
/* Extend the learning shell to any chapter that provides object-based sections. */
(() => {
  const legacyRenderChapter4 = window.renderChapter4;
  let mountedChapterId = "";
  let structuredRouteRequest = 0;

  function structuredSections(chapter) {
    return (chapter?.sections || []).filter(
      (section) => section && typeof section === "object" && section.id,
    );
  }

  function findSection(chapter, sectionId) {
    if (!sectionId) return null;
    return structuredSections(chapter).find((section) => section.id === sectionId) || null;
  }

  function chapterShortTitle(chapter) {
    return String(chapter?.title || "")
      .replace(/^第[0-9一二三四五六七八九十百]+章/, "")
      .replace(/^[\s·:：\-—]+/, "")
      .trim();
  }

  function courseNodes() {
    return algebraContent.chapters.flatMap((chapter) => {
      const sections = structuredSections(chapter);
      if (!sections.length) {
        return [
          {
            id: chapter.id,
            href: `#${chapter.id}`,
            title: chapter.title,
            context: chapter.subtitle || "章节导览",
            type: "chapter",
          },
        ];
      }

      return sections.map((section) => ({
        id: `${chapter.id}/${section.id}`,
        href: `#${chapter.id}/${section.id}`,
        title: `${section.number} ${section.navTitle || section.title}`,
        context: chapter.title,
        type: "section",
      }));
    });
  }

  function renderNeighborNavigation(chapter, section) {
    const nodes = courseNodes();
    const currentIndex = nodes.findIndex((node) => node.id === `${chapter.id}/${section.id}`);
    if (currentIndex < 0) return "";

    const previous = nodes[currentIndex - 1] || null;
    const next = nodes[currentIndex + 1] || null;

    const renderCard = (node, direction) => {
      if (!node) return `<span class="lesson-neighbor-spacer" aria-hidden="true"></span>`;
      const isPrevious = direction === "previous";
      const label =
        node.type === "chapter"
          ? isPrevious
            ? "上一章"
            : "下一章"
          : isPrevious
            ? "上一节"
            : "下一节";

      return `
        <a class="lesson-neighbor-card ${isPrevious ? "is-previous" : "is-next"}" href="${node.href}">
          <span class="lesson-neighbor-label">${isPrevious ? `← ${label}` : `${label} →`}</span>
          <strong>${node.title}</strong>
          <span>${node.context}</span>
        </a>`;
    };

    return `
      <nav class="lesson-neighbor-nav" aria-label="上下节导航">
        ${renderCard(previous, "previous")}
        ${renderCard(next, "next")}
      </nav>`;
  }

  function renderFallbackLessonCard(chapter, section) {
    return `
      <a class="lesson-card" href="#${chapter.id}/${section.id}">
        <div class="section-kicker">${section.number} · ${section.textbookSection || section.title}</div>
        <h3>${section.navTitle || section.title}</h3>
        <p>${section.question || section.goal || ""}</p>
        <div class="meta-row">
          ${(section.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>
      </a>`;
  }

  function renderFallbackOverview(chapter) {
    const sections = structuredSections(chapter);
    const cards = chapter.overviewCards?.length
      ? chapter.overviewCards
      : [
          { title: "概念", text: "从核心问题建立对象与结构。" },
          { title: "实验", text: "通过可操作状态观察边界与不变量。" },
          { title: "推理", text: "回到定义、例题和自测形成闭环。" },
        ];

    return `
      <section class="lesson-cover structured-cover" id="${chapter.id}-overview">
        <div class="lesson-cover-copy">
          <span class="eyebrow">${chapter.title}</span>
          <h1>${chapter.overviewTitle || chapterShortTitle(chapter)}</h1>
          <p>${chapter.summary || "本章沿教材顺序组织概念、交互实验、代表例题和自测。"}</p>
          <div class="meta-row"><span class="tag accent">${sections.length} 个小节</span></div>
        </div>
      </section>
      <section class="section-band compact-band" id="${chapter.id}-structure">
        <div class="section-head"><div><div class="section-kicker">本章结构</div><h2>一条主线连接全部小节</h2></div></div>
        <div class="overview-grid">
          ${cards.map((card) => `<div class="info-panel"><strong>${card.title}</strong><p>${card.text}</p></div>`).join("")}
        </div>
      </section>
      <section class="section-band compact-band" id="${chapter.id}-lessons">
        <div class="section-head"><div><div class="section-kicker">本章目录</div><h2>进入具体小节</h2></div></div>
        <div class="lesson-card-grid">${sections.map((section) => renderFallbackLessonCard(chapter, section)).join("")}</div>
      </section>`;
  }

  function renderFallbackLesson(chapter, section) {
    const interactive = section.interactive ? renderInteractiveSection(section, section.interactive) : "";
    return `
      <section class="lesson-cover structured-lesson-cover" id="${section.id}">
        <div class="lesson-cover-copy">
          <div class="breadcrumb">${chapter.title} <span>/</span> ${section.title}</div>
          <h1>${section.title}</h1>
          <p>${section.goal || ""}</p>
        </div>
      </section>
      <section class="section-band lesson-page-section" id="${section.id}-question">
        <h2>概念问题</h2>
        <p class="lead">${section.question || ""}</p>
        <p>${section.intro || ""}</p>
      </section>
      ${interactive}
      ${renderFormalSection(section, getConcepts(section))}
      ${renderExampleSection(section)}
      ${renderSelfTestSection(section)}
      <section class="section-band lesson-page-section" id="${section.id}-summary">
        <h2>小结</h2>
        ${renderSummary(section)}
        <button class="button mark-button" type="button" data-complete="${section.id}">标记掌握</button>
      </section>
      ${renderNeighborNavigation(chapter, section)}`;
  }

  function renderStructuredOverview(chapter) {
    const renderer = window.getStructuredChapterRenderer?.(chapter.id);
    els.main.innerHTML = renderer?.renderOverview?.(chapter, structuredSections(chapter)) || renderFallbackOverview(chapter);
    renderer?.mountOverview?.(chapter, els.main);
  }

  function renderStructuredLesson(chapter, section) {
    const renderer = window.getStructuredChapterRenderer?.(chapter.id);
    if (!renderer && typeof window.renderLessonPage === "function") {
      window.renderLessonPage(section, chapter);
      return;
    }
    const navigation = renderNeighborNavigation(chapter, section);
    els.main.innerHTML =
      renderer?.renderLesson?.(chapter, section, navigation) || renderFallbackLesson(chapter, section);
    renderer?.mountLesson?.(chapter, section, els.main);
  }

  window.getStructuredSections = structuredSections;
  window.findStructuredSection = findSection;

  learnLastTarget = function learnStructuredLastTarget() {
    const last = readPreference("la-visual-last");
    if (!last || !last.startsWith("#")) return null;

    const [route, sectionId] = last.slice(1).split("/");
    const chapter = algebraContent.chapters.find((item) => item.id === route);
    if (!chapter) return null;
    if (sectionId && !findSection(chapter, sectionId)) return null;
    return last;
  };

  renderNav = function renderStructuredLearningNav() {
    els.nav.innerHTML = getChapters()
      .map((chapter) => {
        const sections = structuredSections(chapter);
        const chapterHref = `#${chapter.id}`;
        const sectionLinks =
          chapter.id === "guide"
            ? ""
            : sections.length
              ? sections
                  .map(
                    (section) => `
                      <a class="nav-section" href="#${chapter.id}/${section.id}" data-section-link="${section.id}" data-search-text="${normalizeSearchText(
                        getSectionSearchText(section),
                      )}">
                        <span class="status-dot"></span>
                        <span>${section.number} ${section.navTitle || section.title}</span>
                        <span class="section-status">未掌握</span>
                      </a>`,
                  )
                  .join("")
              : (chapter.sections || [])
                  .map(
                    (section) => `
                      <a class="nav-section" href="${chapterHref}" data-search-text="${normalizeSearchText(getSectionSearchText(section))}">
                        <span class="status-dot"></span>
                        <span>${getSectionLabel(section)}</span>
                      </a>`,
                  )
                  .join("");

        return `
          <div class="chapter-group" data-chapter="${chapter.id}" data-search-text="${normalizeSearchText(`${chapter.title} ${getChapterSectionText(chapter)}`)}">
            <button class="nav-chapter" type="button" aria-expanded="false">
              <span class="chapter-icon">${chapter.icon}</span>
              <span class="chapter-label"><strong>${chapter.title}</strong><small>${getChapterSubtitle(chapter.id)}</small></span>
              <span class="chapter-arrow">›</span>
            </button>
            <div class="section-list">
              <div class="section-list-clip"><div class="section-list-inner">${sectionLinks}</div></div>
            </div>
          </div>`;
      })
      .join("");

    bindChapterToggles();
    updateProgressUI();
  };

  updateDocumentTitle = function updateStructuredDocumentTitle(chapter) {
    const section = findSection(chapter, state.section);
    document.title = section
      ? `${section.number} ${section.navTitle || section.title} | 高等代数可视化`
      : `${chapter.title} | 高等代数可视化`;
  };

  renderRoute = async function renderStructuredLearningRoute() {
    const requestId = ++structuredRouteRequest;
    if (typeof window.cancelTransformAnimation === "function") window.cancelTransformAnimation();
    window.teardownSection2ContinuousLab?.();
    if (mountedChapterId) window.teardownStructuredChapter?.(mountedChapterId);
    mountedChapterId = "";

    const raw = decodeURIComponent(window.location.hash.replace(/^#/, "")) || "guide";
    const [requestedRoute, requestedSection] = raw.split("/");

    if (requestedRoute === "home") {
      window.location.replace("./index.html");
      return;
    }

    const chapter =
      requestedRoute === "guide"
        ? LEARN_GUIDE_CHAPTER
        : algebraContent.chapters.find((item) => item.id === requestedRoute) || LEARN_GUIDE_CHAPTER;
    const section = findSection(chapter, requestedSection);

    if (section && typeof window.ensureChapterAssets === "function") {
      try {
        await window.ensureChapterAssets(chapter.id);
      } catch (error) {
        console.error("Could not load this chapter's interactive scripts:", error);
      }
      if (requestId !== structuredRouteRequest) return;
    }

    state.route = chapter.id;
    state.section = section?.id || "";
    state.openChapters.add(state.route);
    document.body.dataset.route = state.route;
    document.body.dataset.view = state.section ? "lesson" : "overview";

    if (chapter.id === "guide") {
      renderGuide();
    } else if (chapter.id === "ch4") {
      legacyRenderChapter4();
    } else if (structuredSections(chapter).length) {
      mountedChapterId = chapter.id;
      if (section) renderStructuredLesson(chapter, section);
      else renderStructuredOverview(chapter);
    } else {
      renderPlaceholder(chapter);
    }

    if (chapter.id !== "guide") {
      writePreference("la-visual-last", `#${state.route}${state.section ? `/${state.section}` : ""}`);
    }

    updateDocumentTitle(chapter);
    updateNavActive();
    updateContinueShortcut();
    buildPageToc();
    document.body.classList.remove("sidebar-open");

    window.requestAnimationFrame(() => {
      setupInteractiveBlocks();
      if (state.section) {
        document.querySelector(`#${CSS.escape(state.section)}`)?.scrollIntoView({ block: "start", behavior: "auto" });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    });
  };
})();


;/* guide-nav.js */
/* 导学只有一个页面：左侧目录应当是直接入口，而不是可展开的章节。 */
(() => {
  const baseRenderNav = window.renderNav;
  if (typeof baseRenderNav !== "function") return;

  window.renderNav = function renderNavWithDirectGuide() {
    baseRenderNav();

    const guideGroup = document.querySelector('.chapter-group[data-chapter="guide"]');
    const guideButton = guideGroup?.querySelector('button.nav-chapter');
    if (!guideGroup || !guideButton) return;

    const label = guideButton.querySelector(".chapter-label")?.innerHTML || "<strong>导学</strong><small>如何使用</small>";
    const icon = guideButton.querySelector(".chapter-icon")?.innerHTML || "0";
    const searchText = guideGroup.getAttribute("data-search-text") || "";

    guideGroup.classList.remove("is-open");
    guideGroup.classList.add("is-direct");
    guideGroup.innerHTML = `
      <a class="nav-chapter is-direct" href="#guide" data-search-text="${searchText}" aria-label="进入导学页">
        <span class="chapter-icon">${icon}</span>
        <span class="chapter-label">${label}</span>
      </a>`;
  };
})();


;/* visuals/page-toc-rail.js */
(() => {
  const toc = document.querySelector("#pageToc");
  if (!toc) return;

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const BASE_WIDTH = 14;
  const MAX_WIDTH = 44;
  const INFLUENCE_RADIUS = 66;
  const COLOR_IDLE = [166, 170, 167];
  const COLOR_HOT = [55, 60, 58];
  const COLOR_IDLE_DARK = [168, 176, 172];

  let railList = null;
  let railItems = [];
  let rafId = 0;
  let pendingPointerY = null;

  function smoothstep(value) {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  }

  function isDarkMode() {
    return document.body.classList.contains("dark");
  }

  function mixColor(from, to, t) {
    const r = Math.round(from[0] + (to[0] - from[0]) * t);
    const g = Math.round(from[1] + (to[1] - from[1]) * t);
    const b = Math.round(from[2] + (to[2] - from[2]) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function clearWaveStyles() {
    railItems.forEach((item) => {
      item.style.removeProperty("--toc-rail-width");
      item.style.removeProperty("--toc-rail-color");
      item.classList.remove("is-hot");
    });
  }

  function resetWave() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    pendingPointerY = null;
    toc.classList.remove("is-hovering");
    clearWaveStyles();
  }

  function applyWave(pointerY) {
    rafId = 0;
    if (!railItems.length || !finePointer.matches) return;

    toc.classList.add("is-hovering");
    // Light: pale gray → deep gray under the pointer.
    // Dark: muted gray → brighter light gray under the pointer.
    const idleColor = isDarkMode() ? COLOR_IDLE_DARK : COLOR_IDLE;
    const hotColor = isDarkMode() ? [236, 240, 238] : COLOR_HOT;

    let bestItem = null;
    let bestInfluence = 0;

    railItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const distance = Math.abs(pointerY - centerY);
      const influence = smoothstep(1 - distance / INFLUENCE_RADIUS);
      const width = BASE_WIDTH + (MAX_WIDTH - BASE_WIDTH) * influence;
      // Soft falloff: only strong proximity picks up color.
      const colorT = Math.pow(influence, 1.35);
      item.style.setProperty("--toc-rail-width", `${width.toFixed(2)}px`);
      item.style.setProperty("--toc-rail-color", mixColor(idleColor, hotColor, colorT));
      if (influence > bestInfluence) {
        bestInfluence = influence;
        bestItem = item;
      }
    });

    railItems.forEach((item) => {
      item.classList.toggle("is-hot", item === bestItem && bestInfluence > 0.28);
    });
  }

  function queueWave(pointerY) {
    pendingPointerY = pointerY;
    if (rafId) return;
    rafId = requestAnimationFrame(() => applyWave(pendingPointerY));
  }

  function bindRailInteractions() {
    if (!railList || railList.dataset.railBound === "true") return;
    railList.dataset.railBound = "true";

    railList.addEventListener("pointermove", (event) => queueWave(event.clientY), { passive: true });
    railList.addEventListener("pointerleave", resetWave);
  }

  function transformToc() {
    if (toc.querySelector(".toc-rail-list")) return;

    const links = [...toc.querySelectorAll("a[data-toc-link][data-scroll-to]")];
    if (!links.length) {
      toc.classList.remove("has-toc-rail", "is-hovering");
      return;
    }

    railList = document.createElement("div");
    railList.className = "toc-rail-list";
    railList.setAttribute("role", "list");

    links.forEach((link) => {
      const title = link.textContent.trim() || link.dataset.tocLink;
      const bar = document.createElement("span");
      bar.className = "toc-rail-bar";
      bar.setAttribute("aria-hidden", "true");

      const label = document.createElement("span");
      label.className = "toc-rail-label";
      label.textContent = title;
      label.setAttribute("aria-hidden", "true");

      link.classList.add("toc-rail-item");
      link.setAttribute("aria-label", title);
      link.removeAttribute("title");
      link.setAttribute("role", "listitem");
      link.replaceChildren(label, bar);
      railList.appendChild(link);
    });

    toc.replaceChildren(railList);
    toc.classList.add("has-toc-rail");
    railItems = [...railList.querySelectorAll(".toc-rail-item")];
    bindRailInteractions();
  }

  const observer = new MutationObserver(() => queueMicrotask(transformToc));
  observer.observe(toc, { childList: true, subtree: true });
  finePointer.addEventListener?.("change", resetWave);
  window.addEventListener("la-themestart", resetWave);
  window.addEventListener("la-themechange", resetWave);
  transformToc();
})();


;/* visuals/search-index.js */
/*
 * Course-wide search index (ported from the Liquid Glass draft, PR #30).
 * Indexes student-facing text only; answers, video plans and TTS drafts are skipped.
 */
(() => {
  "use strict";

  const normalize = (value) =>
    String(value || "")
      .toLocaleLowerCase("zh-CN")
      .replace(/\s+/g, "");

  const nonStudentTextKeys = new Set([
    "id",
    "type",
    "visualType",
    "src",
    "embed",
    "icon",
    "component",
    "renderer",
    "mount",
    "videoPlan",
    "ttsDraft",
    "scenes",
    "duration",
    "script",
    "correct",
    "answer",
    "answers",
    "steps",
    "explanation",
    "solution",
    "analysis",
  ]);

  const cleanText = (value) => {
    if (value == null) return "";
    if (Array.isArray(value)) return value.map(cleanText).filter(Boolean).join(" ");
    if (typeof value === "object") {
      return Object.entries(value)
        .filter(([key]) => !nonStudentTextKeys.has(key))
        .map(([, item]) => cleanText(item))
        .filter(Boolean)
        .join(" ");
    }

    const source = String(value);
    if (!source.includes("<")) return source.replace(/\s+/g, " ").trim();

    const template = document.createElement("template");
    template.innerHTML = source;
    template.content.querySelectorAll(".tex[data-tex]").forEach((node) => {
      node.replaceWith(document.createTextNode(node.getAttribute("data-tex") || ""));
    });
    return (template.content.textContent || "").replace(/\s+/g, " ").trim();
  };

  const shortTitle = (value, limit = 54) => {
    const text = cleanText(value);
    return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
  };

  const countOccurrences = (text, query) => {
    let count = 0;
    let cursor = 0;
    while (query && (cursor = text.indexOf(query, cursor)) >= 0) {
      count += 1;
      cursor += query.length;
    }
    return count;
  };

  const makeSnippet = (text, rawQuery, limit = 92) => {
    const clean = cleanText(text);
    if (!clean) return "";
    const query = String(rawQuery || "").trim();
    const matchAt = clean.toLocaleLowerCase("zh-CN").indexOf(query.toLocaleLowerCase("zh-CN"));
    const start = matchAt > 28 ? Math.max(0, matchAt - 24) : 0;
    const excerpt = clean.slice(start, start + limit).trim();
    return `${start ? "…" : ""}${excerpt}${start + limit < clean.length ? "…" : ""}`;
  };

  // Course chapters only; the guide gets one direct entry below.
  const getChapters = () => {
    if (typeof algebraContent === "undefined") return [];
    return Array.isArray(algebraContent.chapters) ? algebraContent.chapters : [];
  };

  const getSectionHref = (chapter, section) => {
    if (section && typeof section === "object" && section.id) return `#${chapter.id}/${section.id}`;
    return `#${chapter.id}`;
  };

  const buildEntries = () => {
    const entries = [];

    const pushEntry = ({ chapter, chapterIndex, section, sectionIndex, subIndex = 0, kind, title, text, href }) => {
      const cleanTitle = shortTitle(title);
      const cleanBody = cleanText(text);
      if (!cleanTitle && !cleanBody) return;
      entries.push({
        id: `${chapter.id}-${sectionIndex}-${subIndex}-${kind}`,
        kind,
        title: cleanTitle || chapter.title,
        body: cleanBody,
        href,
        chapterId: chapter.id,
        chapterTitle: cleanText(chapter.title),
        chapterIndex,
        sectionTitle: section ? cleanText(section.navTitle || section.title || section) : "章节导览",
        sectionNumber: section && typeof section === "object" ? cleanText(section.number) : "",
        sectionIndex,
        subIndex,
      });
    };

    const guide = { id: "guide", title: "导学" };
    pushEntry({
      chapter: guide,
      chapterIndex: -1,
      section: null,
      sectionIndex: -1,
      kind: "chapter",
      title: "导学",
      text: "如何使用 学习路线 从第一节开始",
      href: "#guide",
    });

    getChapters().forEach((chapter, chapterIndex) => {
      const sections = Array.isArray(chapter.sections) ? chapter.sections : [];
      pushEntry({
        chapter,
        chapterIndex,
        section: null,
        sectionIndex: -1,
        kind: "chapter",
        title: chapter.title,
        text: [chapter.subtitle, chapter.summary],
        href: `#${chapter.id}`,
      });

      sections.forEach((section, sectionIndex) => {
        const href = getSectionHref(chapter, section);
        if (typeof section === "string") {
          pushEntry({
            chapter,
            chapterIndex,
            section,
            sectionIndex,
            kind: "section",
            title: section,
            text: [chapter.subtitle, section],
            href,
          });
          return;
        }

        if (!section || typeof section !== "object") return;
        const sectionTitle = section.navTitle || section.title || section.textbookSection || `第 ${sectionIndex + 1} 节`;
        pushEntry({
          chapter,
          chapterIndex,
          section,
          sectionIndex,
          kind: "section",
          title: `${section.number || ""} ${sectionTitle}`,
          // One searchable destination per real route. Nested concepts,
          // examples and self-tests still participate in the full-text match,
          // but do not create dozens of duplicate links to the same section.
          text: section,
          href,
        });
      });
    });

    return entries;
  };

  let entryCache = null;
  const getEntries = () => {
    if (!entryCache) entryCache = buildEntries();
    return entryCache;
  };

  const search = (rawQuery, { limit = 120 } = {}) => {
    const query = normalize(rawQuery);
    if (!query) return { query: "", total: 0, results: [] };

    const results = getEntries()
      .map((entry) => {
        const title = normalize(entry.title);
        const section = normalize(`${entry.sectionNumber} ${entry.sectionTitle}`);
        const chapter = normalize(entry.chapterTitle);
        const body = normalize(entry.body);
        const matchesDestination = [title, section, body].some((value) => value.includes(query));
        const matchesChapter = entry.kind === "chapter" && chapter.includes(query);
        if (!matchesDestination && !matchesChapter) return null;

        let score = 0;
        if (title === query) score += 900;
        else if (title.startsWith(query)) score += 700;
        else if (title.includes(query)) score += 560;
        if (section === query) score += 450;
        else if (section.includes(query)) score += 320;
        if (entry.kind === "chapter" && chapter.includes(query)) score += 170;
        if (body.includes(query)) score += 90 + Math.min(8, countOccurrences(body, query)) * 7;
        if (entry.kind === "section") score += 28;
        else if (entry.kind === "chapter") score += 18;

        return {
          ...entry,
          score,
          snippet: makeSnippet(entry.body || entry.title, rawQuery),
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          a.chapterIndex - b.chapterIndex ||
          a.sectionIndex - b.sectionIndex ||
          b.score - a.score ||
          a.subIndex - b.subIndex,
      );

    return { query, total: results.length, results: results.slice(0, limit) };
  };

  window.AlgebraSearch = {
    search,
    invalidate() {
      entryCache = null;
    },
  };

  const warmIndex = () => getEntries();
  if ("requestIdleCallback" in window) window.requestIdleCallback(warmIndex, { timeout: 1400 });
  else window.setTimeout(warmIndex, 0);
})();


;/* visuals/search.js */
/*
 * Course search: the top-bar capsule travels to the search position, then a
 * liquid results surface is emitted from behind it and unfolds downward.
 * Clearing the query or closing reverses the same phases.
 *
 * Spring constants, morph geometry and result rendering come from the
 * Liquid Glass draft (PR #30); this module drives search on its own.
 */
(() => {
  "use strict";

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const lerp = (from, to, progress) => from + (to - from) * progress;
  const range = (value, start, end) => clamp((value - start) / Math.max(0.0001, end - start));
  const smoothstep = (value) => {
    const x = clamp(value);
    return x * x * (3 - 2 * x);
  };
  const smootherstep = (value) => {
    const x = clamp(value);
    return x * x * x * (x * (x * 6 - 15) + 10);
  };
  const px = (value) => Number(value.toFixed(2));
  const normalize = (value) =>
    String(value || "")
      .toLocaleLowerCase("zh-CN")
      .replace(/\s+/g, "");
  const setInert = (element, inert) => {
    if (!element) return;
    if (inert) element.setAttribute("inert", "");
    else element.removeAttribute("inert");
  };

  class ReversibleSpring {
    constructor({ openFrequency, closeFrequency, openDamping, closeDamping, onUpdate, onSettle }) {
      this.value = 0;
      this.target = 0;
      this.velocity = 0;
      this.openFrequency = openFrequency;
      this.closeFrequency = closeFrequency;
      this.openDamping = openDamping;
      this.closeDamping = closeDamping;
      this.onUpdate = onUpdate;
      this.onSettle = onSettle;
      this.frame = 0;
      this.lastTime = 0;
      this.tick = this.tick.bind(this);
    }

    setTarget(target) {
      this.target = target ? 1 : 0;
      if (!this.frame) {
        this.lastTime = 0;
        this.frame = requestAnimationFrame(this.tick);
      }
    }

    jump(target) {
      if (this.frame) cancelAnimationFrame(this.frame);
      this.frame = 0;
      this.lastTime = 0;
      this.target = target ? 1 : 0;
      this.value = this.target;
      this.velocity = 0;
      this.onUpdate?.(this.value, this.value, this.target);
      this.onSettle?.(this.value);
    }

    tick(now) {
      if (!this.lastTime) this.lastTime = now;
      let remaining = Math.min(0.12, Math.max(0.001, (now - this.lastTime) / 1000));
      this.lastTime = now;
      const opening = this.target === 1;
      const omega = opening ? this.openFrequency : this.closeFrequency;
      const damping = opening ? this.openDamping : this.closeDamping;
      while (remaining > 0) {
        const dt = Math.min(1 / 120, remaining);
        const acceleration = (this.target - this.value) * omega * omega - 2 * damping * omega * this.velocity;
        this.velocity += acceleration * dt;
        this.value += this.velocity * dt;
        remaining -= dt;
      }
      this.onUpdate?.(clamp(this.value), this.value, this.target);
      if (Math.abs(this.target - this.value) < 0.0018 && Math.abs(this.velocity) < 0.02) {
        this.value = this.target;
        this.velocity = 0;
        this.frame = 0;
        this.lastTime = 0;
        this.onUpdate?.(this.value, this.value, this.target);
        this.onSettle?.(this.value);
        return;
      }
      this.frame = requestAnimationFrame(this.tick);
    }
  }

  const REFERENCE_OPEN_GAP = 10;
  const REFERENCE_CLOSED_GAP = -56;
  const REFERENCE_TOP_HEIGHT = 80;
  const REFERENCE_GAP_SCALE = 1.4;
  const REFERENCE_OPEN_TRAVEL = REFERENCE_TOP_HEIGHT + REFERENCE_OPEN_GAP * REFERENCE_GAP_SCALE;

  const topMorphPath = (x, y, width, height, bow) => {
    const radius = height / 2;
    const right = x + width;
    const bottom = y + height;
    const straightSpan = Math.max(0, width - radius * 2);
    const curveInset = straightSpan * 0.22;
    const curveStart = right - radius - curveInset;
    const curveEnd = x + radius + curveInset;
    const curveWidth = Math.max(0, curveStart - curveEnd);
    const curveDepth = (bow * 4) / 3;
    return [
      `M ${x + radius} ${y}`,
      `H ${right - radius}`,
      `A ${radius} ${radius} 0 0 1 ${right - radius} ${bottom}`,
      `H ${curveStart}`,
      `C ${curveStart - curveWidth / 3} ${bottom + curveDepth}, ${curveEnd + curveWidth / 3} ${bottom + curveDepth}, ${curveEnd} ${bottom}`,
      `H ${x + radius}`,
      `A ${radius} ${radius} 0 0 1 ${x + radius} ${y}`,
      "Z",
    ].join(" ");
  };

  const resultsMorphPath = (x, y, width, height, bow) => {
    const radius = Math.min(height / 2, width / 2);
    const right = x + width;
    const bottom = y + height;
    const straightSpan = Math.max(0, width - radius * 2);
    const curveInset = straightSpan * 0.22;
    const curveStart = x + radius + curveInset;
    const curveEnd = right - radius - curveInset;
    const curveWidth = Math.max(0, curveEnd - curveStart);
    const curveDepth = (bow * 4) / 3;
    return [
      `M ${x + radius} ${y}`,
      `H ${curveStart}`,
      `C ${curveStart + curveWidth / 3} ${y - curveDepth}, ${curveEnd - curveWidth / 3} ${y - curveDepth}, ${curveEnd} ${y}`,
      `H ${right - radius}`,
      `A ${radius} ${radius} 0 0 1 ${right} ${y + radius}`,
      `V ${bottom - radius}`,
      `A ${radius} ${radius} 0 0 1 ${right - radius} ${bottom}`,
      `H ${x + radius}`,
      `A ${radius} ${radius} 0 0 1 ${x} ${bottom - radius}`,
      `V ${y + radius}`,
      `A ${radius} ${radius} 0 0 1 ${x + radius} ${y}`,
      "Z",
    ].join(" ");
  };

  const referenceMorphGeometry = (progress) => {
    const gap = lerp(REFERENCE_CLOSED_GAP, REFERENCE_OPEN_GAP, progress);
    const extension = Math.max(0, REFERENCE_TOP_HEIGHT + gap * REFERENCE_GAP_SCALE);
    const absorption = smoothstep(range(extension, 18, 38));
    const shoulder = 8 * Math.exp(-Math.pow((gap + 27) / 6, 2));
    const y = ((extension * absorption + shoulder) / REFERENCE_OPEN_TRAVEL) * 66;
    const pull = Math.max(0, gap - REFERENCE_OPEN_GAP);
    return { y, bow: Math.min(6, pull * 0.95) };
  };

  const appendHighlightedText = (element, value, rawQuery) => {
    const text = String(value || "");
    const query = String(rawQuery || "").trim();
    const haystack = text.toLocaleLowerCase("zh-CN");
    const needle = query.toLocaleLowerCase("zh-CN");
    let matchAt = query ? haystack.indexOf(needle) : -1;
    if (matchAt < 0) {
      element.textContent = text;
      return;
    }
    let cursor = 0;
    while (matchAt >= 0) {
      if (matchAt > cursor) element.append(document.createTextNode(text.slice(cursor, matchAt)));
      const mark = document.createElement("mark");
      mark.textContent = text.slice(matchAt, matchAt + query.length);
      element.append(mark);
      cursor = matchAt + query.length;
      matchAt = haystack.indexOf(needle, cursor);
    }
    if (cursor < text.length) element.append(document.createTextNode(text.slice(cursor)));
  };

  class CourseSearch {
    constructor() {
      this.body = document.body;
      this.mobileQuery = window.matchMedia("(max-width: 920px)");
      this.pointerFineQuery = window.matchMedia("(pointer: fine)");
      const modal = document.querySelector("#searchModal");
      this.el = {
        capsule: document.querySelector("#searchCapsule"),
        open: document.querySelector("#searchOpen"),
        capsuleOpen: document.querySelector("#searchCapsule .search-capsule-open"),
        modal,
        backdrop: modal?.querySelector(".search-modal-backdrop"),
        panel: modal?.querySelector(".search-modal-panel"),
        anchor: modal?.querySelector(".search-modal-bar-anchor"),
        mergeField: modal?.querySelector(".search-results-merge-field"),
        results: modal?.querySelector(".search-results-panel"),
        resultsBody: modal?.querySelector(".search-modal-body"),
        input: document.querySelector("#searchModalInput"),
        close: document.querySelector("#searchCloseButton"),
      };
      if (Object.values(this.el).some((element) => !element)) return;

      this.geometry = null;
      this.shouldFocus = false;
      this.restoreFocus = false;
      this.restoreFocusVisible = false;
      this.resultsInteractive = false;
      this.blobs = {
        top: this.el.mergeField.querySelector(".search-liquid-top-blob"),
        results: this.el.mergeField.querySelector(".search-liquid-results-blob"),
      };

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      this.motion = new ReversibleSpring({
        openFrequency: reduced ? 48 : 19.5,
        closeFrequency: reduced ? 50 : 21,
        // ~3% overshoot each way: the capsule lands a little past the search
        // position, and on the way home a little past its top-bar slot.
        openDamping: reduced ? 1 : 0.74,
        closeDamping: reduced ? 1 : 0.76,
        onUpdate: (value, raw, target) => this.render(value, raw, target),
        onSettle: (value) => this.settle(value),
      });
      this.resultsMotion = new ReversibleSpring({
        openFrequency: reduced ? 50 : 10.8,
        closeFrequency: reduced ? 52 : 11.6,
        openDamping: reduced ? 1 : 0.9,
        closeDamping: reduced ? 1 : 0.92,
        onUpdate: (value, raw, target) => this.renderResultsMotion(value, raw, target),
        onSettle: (value) => this.settleResults(value),
      });

      this.bind();
      this.setCapsuleInteraction(false);
      this.el.open.classList.add("is-interactive");
    }

    get phase() {
      return this.el.modal.dataset.phase || "closed";
    }

    set phase(value) {
      this.el.modal.dataset.phase = value;
    }

    bind() {
      const { open, input, modal } = this.el;
      open.addEventListener("click", (event) => {
        this.toggle({ focusInput: event.detail === 0 || this.pointerFineQuery.matches });
      });
      open.addEventListener("blur", () => open.classList.remove("is-pointer-focus-return"));
      document.querySelectorAll("[data-search-close]").forEach((element) => {
        element.addEventListener("click", (event) => this.close({ restoreFocus: true, focusVisible: event.detail === 0 }));
      });
      input.addEventListener("input", () => this.renderResults(input.value));
      modal.addEventListener("click", (event) => {
        if (event.target.closest?.(".search-result-link")) this.close({ skipMerge: true });
      });
      document.addEventListener("keydown", (event) => this.onKeydown(event));
      window.addEventListener("resize", () => this.onResize(), { passive: true });
      window.addEventListener("la-themestart", () => this.close({ skipMerge: true }));
    }

    onKeydown(event) {
      const active = this.motion.value > 0.001 || this.motion.target;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (active) this.el.input.focus();
        else this.open({ focusInput: true });
        return;
      }
      if (!active) return;
      if (event.key === "Escape") {
        event.preventDefault();
        this.close({ restoreFocus: true, focusVisible: true });
        return;
      }
      if (event.key === "Tab" && this.motion.value > 0.98) this.trapFocus(event);
    }

    // The capsule lives in the top bar and the results at the end of the
    // page, so Tab order is managed here: input, close, then each result.
    trapFocus(event) {
      const focusable = [
        ...this.el.capsuleOpen.querySelectorAll("input:not([disabled]), button:not([disabled])"),
        ...this.el.panel.querySelectorAll("a[href]"),
      ].filter((element) => !element.closest("[inert]") && element.tabIndex >= 0);
      if (!focusable.length) return;
      event.preventDefault();
      const index = focusable.indexOf(document.activeElement);
      const step = event.shiftKey ? -1 : 1;
      const next = index < 0 ? (event.shiftKey ? focusable.length - 1 : 0) : (index + step + focusable.length) % focusable.length;
      focusable[next].focus();
    }

    onResize() {
      if (this.resizeFrame) return;
      this.resizeFrame = requestAnimationFrame(() => {
        this.resizeFrame = 0;
        if (this.motion.value <= 0.001) return;
        this.measure();
        this.pinCapsule();
        this.render(this.motion.value, this.motion.value, this.motion.target);
        this.renderResultsMotion(this.resultsMotion.value, this.resultsMotion.value, this.resultsMotion.target);
      });
    }

    toggle(options = {}) {
      if (this.phase !== "closed" || this.motion.target || this.motion.value > 0.52) this.close({ restoreFocus: true });
      else this.open(options);
    }

    open({ focusInput = true } = {}) {
      if (this.phase !== "closed" || this.motion.target === 1) return;
      if (this.mobileQuery.matches && this.body.classList.contains("sidebar-open")) {
        document.querySelector("#drawerBackdrop")?.click();
      }
      this.shouldFocus = focusInput;
      this.restoreFocus = false;
      this.mount();
      this.el.open.setAttribute("aria-expanded", "true");
      this.motion.setTarget(1);
    }

    close({ restoreFocus = false, focusVisible = false, skipMerge = false } = {}) {
      const phase = this.phase;
      if (phase === "closed" && this.motion.value <= 0.001 && this.motion.target === 0) return;
      if ((phase === "merging" || phase === "returning") && !skipMerge) return;

      this.restoreFocus = restoreFocus;
      this.restoreFocusVisible = focusVisible;
      this.shouldFocus = false;
      this.el.open.setAttribute("aria-expanded", "false");
      this.el.input.blur();
      this.setCapsuleInteraction(false);

      const hasResultsSurface = this.resultsMotion.target === 1 || this.resultsMotion.value > 0.015;
      if (!skipMerge && normalize(this.el.input.value) && hasResultsSurface) {
        this.phase = "merging";
        this.el.modal.dataset.resultsPhase = "merging";
        this.setResultsInert(true);
        this.resultsMotion.setTarget(0);
        return;
      }
      this.beginReturn();
    }

    beginReturn() {
      if (this.phase === "closed") return;
      this.phase = "returning";
      this.setCapsuleInteraction(false);
      if (this.resultsMotion.value > 0.001 || this.resultsMotion.target) {
        this.setResultsInert(true);
        this.resultsMotion.setTarget(0);
      }
      this.motion.setTarget(0);
    }

    setResultsInert(inert) {
      setInert(this.el.results, inert);
      this.resultsInteractive = !inert;
      this.el.results.style.pointerEvents = inert ? "none" : "auto";
    }

    setCapsuleInteraction(interactive) {
      const { capsuleOpen, input, close } = this.el;
      capsuleOpen.classList.toggle("is-interactive", interactive);
      capsuleOpen.setAttribute("aria-hidden", interactive ? "false" : "true");
      if (interactive) {
        input.removeAttribute("tabindex");
        close.removeAttribute("tabindex");
      } else {
        input.setAttribute("tabindex", "-1");
        close.setAttribute("tabindex", "-1");
      }
    }

    mount() {
      const { modal, open, resultsBody, results } = this.el;
      modal.hidden = false;
      this.phase = "opening";
      modal.dataset.resultsPhase = "closed";
      this.body.classList.add("search-modal-open");
      open.classList.remove("is-interactive");
      open.setAttribute("tabindex", "-1");
      this.setCapsuleInteraction(false);
      resultsBody.replaceChildren();
      results.setAttribute("aria-hidden", "true");
      this.setResultsInert(true);
      this.measure();
      this.pinCapsule();
      this.resultsMotion.jump(0);
    }

    // Take the capsule out of the centred flex flow so growing its width does
    // not move its layout box; all travel then comes from the transform.
    pinCapsule() {
      const { capsule } = this.el;
      const { start } = this.geometry;
      capsule.style.position = "fixed";
      capsule.style.left = `${px(start.left)}px`;
      capsule.style.top = `${px(start.top)}px`;
      capsule.style.width = `${px(start.width)}px`;
      capsule.style.height = `${px(start.height)}px`;
    }

    measure() {
      const { capsule, anchor, panel, results } = this.el;
      // Read the capsule's resting box: drop the motion styles for one
      // synchronous layout read (no paint happens in between).
      const saved = capsule.getAttribute("style");
      capsule.removeAttribute("style");
      const home = capsule.getBoundingClientRect();
      if (saved) capsule.setAttribute("style", saved);
      this.geometry = {
        start: { left: home.left, top: home.top, width: home.width, height: home.height },
        end: anchor.getBoundingClientRect(),
        panelWidth: panel.getBoundingClientRect().width,
        resultsHeight: results.getBoundingClientRect().height || 344,
      };
    }

    render(progress, raw, target) {
      const { capsule, open, capsuleOpen, backdrop, modal } = this.el;
      const p = clamp(progress);
      if (p <= 0 && modal.hidden) return;
      if (!this.geometry) this.measure();

      const backdropProgress = smootherstep(range(p, 0.01, 0.3));
      // Travel follows the spring itself (not clamped), so its overshoot
      // carries on along the path: further down and wider when opening,
      // further up and narrower when returning, then settles.
      const travelProgress = clamp(raw, -0.08, 1.08);
      const closedContentProgress = 1 - smootherstep(range(p, 0.18, 0.48));
      const openContentProgress = smootherstep(range(p, 0.38, 0.62));

      backdrop.style.opacity = backdropProgress.toFixed(4);
      open.style.setProperty("--search-closed-content-opacity", closedContentProgress.toFixed(4));
      capsuleOpen.style.opacity = openContentProgress.toFixed(4);
      open.style.setProperty("--search-open-progress", travelProgress.toFixed(4));

      const interactive = p > 0.88 && target === 1 && (this.phase === "opening" || this.phase === "open");
      open.classList.toggle("is-interactive", !interactive && p < 0.12);
      if (!interactive) capsuleOpen.classList.remove("is-interactive");

      const { start, end } = this.geometry;
      const press = target === 1 ? Math.sin(range(p, 0, 0.16) * Math.PI) * 0.008 : 0;
      const pulse = 1 - press;
      capsule.style.width = `${px(lerp(start.width, end.width, travelProgress) * pulse)}px`;
      capsule.style.height = `${px(lerp(start.height, end.height, travelProgress) * pulse)}px`;
      capsule.style.transform = `translate3d(${px(lerp(0, end.left - start.left, travelProgress))}px, ${px(
        lerp(0, end.top - start.top, travelProgress),
      )}px, 0)`;
    }

    settle(value) {
      const { modal, capsule, open, capsuleOpen, input, resultsBody } = this.el;
      if (value === 1) {
        this.phase = "open";
        open.classList.remove("is-interactive");
        this.setCapsuleInteraction(true);
        if (this.shouldFocus) requestAnimationFrame(() => input.focus({ preventScroll: true }));
        return;
      }

      if (this.resultsMotion.value > 0.001 || this.resultsMotion.target) this.resultsMotion.jump(0);
      this.phase = "closed";
      modal.dataset.resultsPhase = "closed";
      modal.hidden = true;
      capsule.removeAttribute("style");
      open.style.removeProperty("--search-closed-content-opacity");
      open.style.removeProperty("--search-open-progress");
      open.style.removeProperty("--search-surface-merge");
      open.style.removeProperty("--search-unified-merge");
      open.classList.add("is-interactive");
      open.removeAttribute("tabindex");
      capsuleOpen.classList.remove("is-interactive");
      capsuleOpen.setAttribute("aria-hidden", "true");
      capsuleOpen.style.removeProperty("opacity");
      input.value = "";
      this.setCapsuleInteraction(false);
      resultsBody.replaceChildren();
      this.body.classList.remove("search-modal-open");
      this.geometry = null;
      if (this.restoreFocus) {
        open.classList.toggle("is-pointer-focus-return", !this.restoreFocusVisible);
        requestAnimationFrame(() => open.focus({ preventScroll: true }));
      }
      this.restoreFocus = false;
      this.restoreFocusVisible = false;
    }

    setResultsTarget(openResults) {
      const { modal, results } = this.el;
      if (openResults) {
        results.setAttribute("aria-hidden", "false");
        modal.dataset.resultsPhase = this.resultsMotion.value > 0.985 ? "open" : "opening";
        if (this.resultsMotion.target !== 1) this.resultsMotion.setTarget(1);
        return;
      }
      this.setResultsInert(true);
      results.setAttribute("aria-hidden", "true");
      if (this.phase !== "merging") modal.dataset.resultsPhase = "closing";
      if (this.resultsMotion.target !== 0 || this.resultsMotion.value > 0.001) this.resultsMotion.setTarget(0);
      else modal.dataset.resultsPhase = "closed";
    }

    renderResultsMotion(progress, raw, target) {
      const { results, resultsBody, mergeField, open } = this.el;
      const p = clamp(progress);
      const resultsHeight = this.geometry?.resultsHeight || results.offsetHeight || 344;
      const panelWidth = this.geometry?.panelWidth || this.el.panel.offsetWidth || 590;

      // The lower capsule slides out from behind the fixed search capsule
      // and, while it is still fused to it, already starts to unfold into
      // the panel; the content follows the unfold. Travel runs slightly
      // ahead of the spring (raw / 0.84), so the release comes before the
      // panel reaches full height. Reversing runs the same map backwards.
      const motionProgress = clamp(raw / 0.84);
      const geometry = referenceMorphGeometry(motionProgress);
      const travelProgress = Math.pow(smootherstep(motionProgress), 1.55);
      const resultTopY = lerp(0, 66, travelProgress);
      const expandProgress = smootherstep(range(p, 0.5, 0.99));
      const visibleHeight = lerp(56, resultsHeight, expandProgress);
      const clippedBottom = Math.max(0, resultsHeight - visibleHeight);
      const radius = lerp(28, 23, expandProgress);
      const bodyProgress = smootherstep(range(p, 0.52, 0.99));

      // Once the capsule heads home the rest of this layer is already under
      // it; hide it so it is not left behind at the search position.
      const shown = p > 0.001 && !(this.phase === "returning" && p < 0.2);
      results.style.visibility = shown ? "visible" : "hidden";
      results.style.opacity = shown ? "1" : "0";
      results.style.clipPath = `inset(0 0 ${px(clippedBottom)}px 0 round ${px(radius)}px)`;
      results.style.transform = `translateY(${px(resultTopY - 66)}px)`;
      resultsBody.style.opacity = bodyProgress.toFixed(4);
      resultsBody.style.transform = `translateY(${px(lerp(7, 0, bodyProgress))}px)`;

      const fusionEnter = smootherstep(range(p, 0.01, 0.35));
      const fusionRelease = 1 - smootherstep(range(p, 0.55, 0.9));
      const merge = fusionEnter * fusionRelease;
      results.style.setProperty("--search-surface-merge", merge.toFixed(4));
      results.style.setProperty("--search-unified-merge", merge.toFixed(4));
      open.style.setProperty("--search-surface-merge", merge.toFixed(4));
      open.style.setProperty("--search-unified-merge", merge.toFixed(4));

      mergeField.setAttribute("viewBox", `0 0 ${px(panelWidth)} 132`);
      this.blobs.top?.setAttribute("d", topMorphPath(0, 0, panelWidth, 56, geometry.bow));
      this.blobs.results?.setAttribute("d", resultsMorphPath(0, resultTopY, panelWidth, 56, geometry.bow));
      mergeField.style.opacity = shown ? merge.toFixed(4) : "0";

      // Closing with results: head home once the lower capsule is back under
      // the search capsule (below p = 0.18 it is within a pixel of hidden),
      // rather than after the spring's long settling tail.
      if (this.phase === "merging" && target === 0 && p < 0.18) this.beginReturn();

      const interactive = p > 0.94 && target === 1 && this.phase === "open";
      if (interactive !== this.resultsInteractive) this.setResultsInert(!interactive);
    }

    settleResults(value) {
      const { modal, results, resultsBody, input } = this.el;
      if (value === 1) {
        if (this.phase === "merging" || this.phase === "returning") return;
        modal.dataset.resultsPhase = "open";
        results.setAttribute("aria-hidden", "false");
        this.setResultsInert(false);
        return;
      }
      modal.dataset.resultsPhase = "closed";
      results.setAttribute("aria-hidden", "true");
      this.setResultsInert(true);
      if (this.phase === "merging") {
        requestAnimationFrame(() => requestAnimationFrame(() => this.beginReturn()));
      } else if (!normalize(input.value)) {
        resultsBody.replaceChildren();
      }
    }

    renderResults(value) {
      const { resultsBody } = this.el;
      if (!normalize(value)) {
        this.setResultsTarget(false);
        return;
      }

      resultsBody.replaceChildren();
      resultsBody.scrollTop = 0;
      const response = window.AlgebraSearch?.search(value) || { total: 0, results: [] };

      const header = document.createElement("div");
      header.className = "search-results-header";
      const count = document.createElement("div");
      count.className = "search-results-count";
      const countStrong = document.createElement("strong");
      countStrong.textContent = String(response.total);
      count.append(countStrong, document.createTextNode(" 个结果"));
      const context = document.createElement("div");
      context.className = "search-results-context";
      context.textContent = response.total > response.results.length ? `显示前 ${response.results.length} 项` : "全课程内容";
      header.append(count, context);
      resultsBody.append(header);

      if (!response.results.length) {
        const empty = document.createElement("div");
        empty.className = "search-empty-state";
        const kicker = document.createElement("span");
        kicker.className = "search-empty-kicker";
        kicker.textContent = "没有匹配结果";
        const hint = document.createElement("p");
        hint.textContent = "换一个更短的概念或关键词试试。";
        empty.append(kicker, hint);
        resultsBody.append(empty);
        this.setResultsTarget(true);
        return;
      }

      const groups = new Map();
      response.results.forEach((result) => {
        if (!groups.has(result.chapterId)) groups.set(result.chapterId, []);
        groups.get(result.chapterId).push(result);
      });

      const container = document.createElement("div");
      container.className = "search-result-groups";
      groups.forEach((items) => {
        const group = document.createElement("section");
        group.className = "search-result-group";
        const heading = document.createElement("h3");
        heading.className = "search-result-group-heading";
        const headingText = document.createElement("span");
        appendHighlightedText(headingText, items[0].chapterTitle, value);
        const headingCount = document.createElement("small");
        headingCount.textContent = `${items.length} 项`;
        heading.append(headingText, headingCount);

        const list = document.createElement("ul");
        list.className = "search-result-list";
        items.forEach((result) => {
          const item = document.createElement("li");
          const link = document.createElement("a");
          link.className = "search-result-link";
          link.href = result.href;

          const copy = document.createElement("span");
          copy.className = "search-result-copy";
          const title = document.createElement("strong");
          title.className = "search-result-title";
          appendHighlightedText(title, result.title, value);
          const breadcrumb = document.createElement("span");
          breadcrumb.className = "search-result-breadcrumb";
          appendHighlightedText(breadcrumb, result.chapterTitle, value);
          if (result.sectionTitle && result.sectionTitle !== "章节导览") {
            breadcrumb.append(document.createTextNode(" / "));
            appendHighlightedText(
              breadcrumb,
              `${result.sectionNumber ? `${result.sectionNumber} ` : ""}${result.sectionTitle}`,
              value,
            );
          }
          copy.append(title, breadcrumb);
          if (result.snippet && normalize(result.snippet) !== normalize(result.title)) {
            const snippet = document.createElement("span");
            snippet.className = "search-result-snippet";
            appendHighlightedText(snippet, result.snippet, value);
            copy.append(snippet);
          }

          const arrow = document.createElement("span");
          arrow.className = "search-result-arrow";
          arrow.setAttribute("aria-hidden", "true");
          arrow.textContent = "↵";
          link.append(copy, arrow);
          item.append(link);
          list.append(item);
        });

        group.append(heading, list);
        container.append(group);
      });
      resultsBody.append(container);
      this.setResultsTarget(true);
    }
  }

  const init = () => {
    window.__courseSearch = new CourseSearch();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();


;/* material.js */
/*
 * Shared motion for the design language (docs/design-spec.md §7):
 * - press spring: anything pressable shrinks a little on press and springs back
 *   with a small overshoot on release (Web Animations on `scale`, so it never
 *   fights an element's own `transform`);
 * - press light on primary buttons;
 * - pointer light on the floating controls (material.css reads --lg-x / --lg-y);
 * - phones: scrolling down tucks the search capsule into the menu button,
 *   scrolling up brings it back (the Chrome / Edge mobile toolbar rule).
 */
(() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const outCubic = (t) => 1 - Math.pow(1 - t, 3);

  const SPRING = window.CSS?.supports?.("animation-timing-function", "linear(0, 1)")
    ? getComputedStyle(document.documentElement).getPropertyValue("--spring-release").trim() || "ease-out"
    : "cubic-bezier(0.34, 1.3, 0.64, 1)";

  /* ---------- press spring ---------- */

  // every control a student presses: buttons, options, fold-outs, cards and the navigation links
  const PRESSABLE = [
    "button",
    '[role="button"]',
    "a.button",
    "summary",
    "label.example-choice",
    ".lesson-card",
    ".lesson-neighbor-card",
    "a.route-card",
    "a.nav-chapter",
    "a.nav-section",
    ".toc-rail-item",
  ].join(", ");
  const BLOOM = ".is-primary, .button.primary";
  let pressed = null;

  const isDisabled = (el) => el.disabled || el.getAttribute("aria-disabled") === "true" || el.closest("[data-no-press]");
  const currentScale = (el) => {
    const value = getComputedStyle(el).scale;
    return value && value !== "none" ? parseFloat(value) : 1;
  };
  // About 4px of give whatever the size: small buttons dip more, wide cards barely.
  const pressScale = (el) => {
    const r = el.getBoundingClientRect();
    return 1 - clamp(4 / Math.max(r.width, r.height, 1), 0.015, 0.06);
  };

  function press(el) {
    if (pressed && pressed !== el) release();
    pressed = el;
    const from = currentScale(el);
    el.__laPress?.cancel();
    el.__laPress = el.animate([{ scale: String(from) }, { scale: String(pressScale(el)) }], {
      duration: 90,
      easing: "cubic-bezier(0.3, 0, 0.5, 1)",
      fill: "forwards",
    });
  }

  function release() {
    const el = pressed;
    pressed = null;
    if (!el) return;
    const from = currentScale(el);
    el.__laPress?.cancel();
    el.__laPress = el.animate([{ scale: String(from) }, { scale: "1" }], { duration: 650, easing: SPRING });
  }

  function bloom(el, x, y) {
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    let layer = el.querySelector(":scope > .la-bloom");
    if (!layer) {
      layer = document.createElement("span");
      layer.className = "la-bloom";
      layer.setAttribute("aria-hidden", "true");
      el.prepend(layer);
    }
    const r = el.getBoundingClientRect();
    const dot = document.createElement("i");
    dot.style.left = `${x - r.left}px`;
    dot.style.top = `${y - r.top}px`;
    layer.append(dot);
    const grow = Math.max(r.width, r.height) / 5;
    dot
      .animate([{ transform: "scale(1)", opacity: 0.9 }, { transform: `scale(${grow})`, opacity: 0 }], {
        duration: 700,
        easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
      })
      .finished.then(() => dot.remove(), () => dot.remove());
  }

  document.addEventListener(
    "pointerdown",
    (event) => {
      if (reduced.matches || event.button !== 0) return;
      const el = event.target.closest?.(PRESSABLE);
      if (!el || isDisabled(el)) return;
      press(el);
      if (el.matches(BLOOM)) bloom(el, event.clientX, event.clientY);
    },
    // capture: labs that stop pointerdown for their own dragging still get the press
    { passive: true, capture: true },
  );
  window.addEventListener("pointerup", release, { passive: true });
  window.addEventListener("pointercancel", release, { passive: true });
  window.addEventListener("blur", release);
  document.addEventListener("keydown", (event) => {
    if (reduced.matches || event.repeat || (event.key !== " " && event.key !== "Enter")) return;
    const el = event.target.closest?.(PRESSABLE);
    if (el && !isDisabled(el)) press(el);
  });
  document.addEventListener("keyup", (event) => {
    if (event.key === " " || event.key === "Enter") release();
  });

  /* ---------- pointer light ---------- */

  const LIT = ".topbar .icon-button, .topbar-search";
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  let litFrame = 0;
  document.addEventListener(
    "pointermove",
    (event) => {
      if (!fine.matches || litFrame) return;
      const el = event.target.closest?.(LIT);
      if (!el) return;
      const { clientX, clientY } = event;
      litFrame = requestAnimationFrame(() => {
        litFrame = 0;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--lg-x", `${(clientX - r.left).toFixed(1)}px`);
        el.style.setProperty("--lg-y", `${(clientY - r.top).toFixed(1)}px`);
      });
    },
    { passive: true },
  );

  /* ---------- segmented controls: the selection slides with a spring ---------- */

  // A pill track whose children are all option buttons, exactly one of them chosen. The chosen
  // option's fill moves onto the track's ::before (material.css), which slides to the next choice.
  // Tracks that wrap onto two lines (phones) keep their own per-chip look.
  const SEG_TRACKS = '[class*="toolbar"], [class*="chip-bar"], [class*="tabs"], [role="tablist"], [role="radiogroup"]';
  const SEG_CHOSEN = '.is-active, [aria-pressed="true"], [aria-selected="true"]';
  const tracks = new Set();

  function segOptions(track) {
    const kids = [...track.children];
    return kids.length >= 2 && kids.every((k) => k.matches('button, [role="tab"], [role="radio"]')) ? kids : null;
  }

  function looksLikeTrack(track) {
    const cs = getComputedStyle(track);
    return parseFloat(cs.borderTopLeftRadius) >= 12 && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.display !== "none";
  }

  function placeSeg(track) {
    const kids = segOptions(track);
    const chosen = kids?.filter((k) => k.matches(SEG_CHOSEN)) || [];
    const oneLine = kids && kids.every((k) => k.offsetTop === kids[0].offsetTop);
    if (!kids || chosen.length !== 1 || !oneLine || !looksLikeTrack(track)) {
      track.classList.remove("la-seg", "is-seg-live", "is-seg-handoff");
      return;
    }
    // .la-seg stays on (it makes the track the offset parent and keeps ::before alive, so it can
    // slide); only the hand-off is lifted for a moment to read the chosen option's own fill
    track.classList.add("la-seg");
    track.classList.remove("is-seg-handoff");
    const el = chosen[0];
    el.style.transition = "none";
    const cs = getComputedStyle(el);
    track.style.setProperty("--seg-bg", cs.backgroundColor);
    track.style.setProperty("--seg-shadow", cs.boxShadow);
    track.style.setProperty("--seg-border", `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`);
    track.style.setProperty("--seg-r", cs.borderTopLeftRadius);
    track.style.setProperty("--seg-x", `${el.offsetLeft}px`);
    track.style.setProperty("--seg-y", `${el.offsetTop}px`);
    track.style.setProperty("--seg-w", `${el.offsetWidth}px`);
    track.style.setProperty("--seg-h", `${el.offsetHeight}px`);
    track.classList.add("is-seg-handoff");
    void el.offsetWidth;
    el.style.removeProperty("transition");
    // the first placement lands without sliding
    if (!track.classList.contains("is-seg-live")) requestAnimationFrame(() => track.classList.add("is-seg-live"));
  }

  const segWatch = new MutationObserver((records) => {
    const touched = new Set();
    records.forEach((r) => {
      // placeSeg flips classes on the track itself; only the options' changes matter
      if (r.type === "attributes" && tracks.has(r.target)) return;
      const track = r.target.closest?.(".la-seg, " + SEG_TRACKS);
      if (track && tracks.has(track)) touched.add(track);
    });
    touched.forEach(placeSeg);
  });

  function findTracks() {
    document.querySelectorAll(SEG_TRACKS).forEach((track) => {
      if (tracks.has(track) || !segOptions(track)) return;
      tracks.add(track);
      segWatch.observe(track, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "aria-pressed", "aria-selected"] });
      placeSeg(track);
    });
    tracks.forEach((track) => {
      if (!track.isConnected) tracks.delete(track);
    });
  }

  let segFrame = 0;
  const queueFind = () => {
    if (segFrame) return;
    segFrame = requestAnimationFrame(() => {
      segFrame = 0;
      findTracks();
    });
  };
  new MutationObserver(queueFind).observe(document.body, { childList: true, subtree: true });
  // theme, width and font changes alter the fill or the option widths
  new MutationObserver(() => tracks.forEach(placeSeg)).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener("resize", () => tracks.forEach(placeSeg), { passive: true });
  document.fonts?.ready.then(() => tracks.forEach(placeSeg));
  queueFind();

  /* ---------- phones: the search capsule tucks into the menu button ---------- */

  const stage = document.getElementById("searchCapsule");
  const menu = document.getElementById("sidebarToggle");
  const openButton = document.getElementById("searchOpen");
  if (!stage || !menu || !openButton) return;

  const phone = window.matchMedia("(max-width: 720px)");
  const body = document.body;

  // duration 0.75 s, bounce 0.2 (same parametrisation as the CSS springs)
  const spring = { x: 0, v: 0, t: 0, k: (2 * Math.PI / 0.75) ** 2, c: (4 * Math.PI * 0.8) / 0.75 };
  let running = false;
  let last = 0;
  let home = null;
  // Everything is laid out in the capsule's own box (left/top relative to its resting place),
  // so nothing depends on where the top bar happens to be on screen. iOS shifts fixed bars by
  // a few pixels while the page rubber-bands; positions read from the screen then were off
  // and the capsule jumped when the bounce settled.
  const BUTTON_KEYS = ["left", "top", "width", "height"];

  function clearStage() {
    stage.style.removeProperty("opacity");
    BUTTON_KEYS.forEach((key) => openButton.style.removeProperty(key));
    openButton.style.removeProperty("--search-closed-content-opacity");
    openButton.querySelectorAll(":scope > svg, :scope > .topbar-search-text").forEach((el) => el.style.removeProperty("filter"));
    home = null;
  }

  // the capsule's size and the menu button's centre, measured together so a shift of the
  // whole bar cancels out
  function measure() {
    const s = stage.getBoundingClientRect();
    const mr = menu.getBoundingClientRect();
    home = { width: s.width, height: s.height, menuX: mr.left + mr.width / 2 - s.left, menuR: mr.width / 2 };
  }

  // m = 0 at rest, 1 tucked. The capsule shortens from the right while it
  // drifts left, ends as a small drop and shrinks away under the menu button.
  function render() {
    const m = spring.x;
    if (m === 0 && spring.t === 0) {
      clearStage();
      return;
    }
    if (!home) measure();
    const R = home.height / 2;
    const x1 = home.menuX;
    const a0 = R;
    const b0 = home.width - R;
    const t = clamp(m);
    const k = outCubic(clamp(t / 0.62));
    let a = lerp(a0, x1, inOut(t));
    let r = lerp(R, R * 0.75, k);
    let b = a + (b0 - a0) * (1 - k);
    const f = clamp(1 - (a - x1) / (home.menuR + r));
    if (f > 0) r *= Math.sqrt(1 - f);
    if (m < 0) b += (b0 - a0) * 1.1 * -m; // springing back out: a little long, then settle
    openButton.style.left = `${(a - r).toFixed(2)}px`;
    openButton.style.top = `${(R - r).toFixed(2)}px`;
    openButton.style.width = `${Math.max(0, b - a + 2 * r).toFixed(2)}px`;
    openButton.style.height = `${Math.max(0, 2 * r).toFixed(2)}px`;
    stage.style.opacity = (1 - f).toFixed(3);
    const label = clamp(1 - m / 0.3);
    openButton.style.setProperty("--search-closed-content-opacity", label.toFixed(3));
    openButton.querySelectorAll(":scope > svg, :scope > .topbar-search-text").forEach((el) => {
      el.style.filter = label < 1 ? `blur(${((1 - label) * 6).toFixed(2)}px)` : "";
    });
  }

  function frame(now) {
    const dt = Math.min(1 / 30, (now - last) / 1000);
    last = now;
    const steps = Math.max(1, Math.ceil(dt * 240));
    for (let i = 0; i < steps; i += 1) {
      const a = -spring.k * (spring.x - spring.t) - spring.c * spring.v;
      spring.v += (a * dt) / steps;
      spring.x += (spring.v * dt) / steps;
    }
    const done = Math.abs(spring.x - spring.t) < 1e-4 && Math.abs(spring.v) < 1e-3;
    if (done) {
      spring.x = spring.t;
      spring.v = 0;
    }
    render();
    if (done) {
      running = false;
      return;
    }
    requestAnimationFrame(frame);
  }

  function tuckTo(target) {
    if (spring.t === target) return;
    spring.t = target;
    if (target) stage.setAttribute("inert", "");
    else stage.removeAttribute("inert");
    if (reduced.matches) {
      spring.x = target;
      spring.v = 0;
      render();
      return;
    }
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }

  // Scroll rule (as the Chrome / Edge mobile toolbars): 24px down tucks, 16px up brings it back,
  // the top 30px always shows it. Guards against flicker at the ends of the page:
  //  - iOS rubber-banding reports positions past either end; that bounce is not the reader
  //    scrolling, so those events are skipped (otherwise the bounce back at the bottom read as
  //    "scrolled up" and popped the capsule out);
  //  - it only tucks below 80px, so small moves near the top cannot toggle it;
  //  - after each change the opposite change waits 350ms.
  const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  let lastY = clamp(window.scrollY, 0, maxScroll());
  let travel = 0;
  let quietUntil = 0;
  let viewportSettleUntil = 0;
  let viewportH = window.visualViewport?.height || window.innerHeight;
  const onViewport = () => {
    const h = window.visualViewport?.height || window.innerHeight;
    if (Math.abs(h - viewportH) > 1) viewportSettleUntil = performance.now() + 400;
    viewportH = h;
  };
  window.visualViewport?.addEventListener("resize", onViewport, { passive: true });
  window.addEventListener("resize", onViewport, { passive: true });
  const setTuck = (target) => {
    if (spring.t === target) return;
    quietUntil = performance.now() + 350;
    tuckTo(target);
  };
  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      if (y < 0 || y > maxScroll()) return;
      // Safari's toolbars grow back at the bottom of the page and change the visible height;
      // the scroll position moves with them, which is not the reader scrolling. Only near the
      // bottom: mid-page the toolbars shrink on every scroll down, and ignoring those events
      // held the tuck back until the scroll had stopped.
      if (performance.now() < viewportSettleUntil && y > maxScroll() - 120) {
        lastY = y;
        return;
      }
      const dy = y - lastY;
      lastY = y;
      if (!phone.matches || body.classList.contains("search-modal-open") || body.classList.contains("sidebar-open")) return;
      if (y < 30) {
        travel = 0;
        setTuck(0);
        return;
      }
      if (dy * travel < 0) travel = 0;
      travel += dy;
      if (performance.now() < quietUntil) return;
      if (travel > 24 && y > 80) setTuck(1);
      else if (travel < -16) setTuck(0);
    },
    { passive: true },
  );

  const reset = () => {
    spring.t = 0;
    spring.x = 0;
    spring.v = 0;
    stage.removeAttribute("inert");
    clearStage();
  };
  phone.addEventListener?.("change", reset);
  window.addEventListener("resize", () => {
    home = null;
    if (spring.x !== 0 || spring.t !== 0) render();
  });
})();

