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
