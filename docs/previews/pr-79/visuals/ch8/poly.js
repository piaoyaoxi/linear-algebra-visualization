/*
 * Chapter 8 exact polynomial engine.
 *
 * A polynomial in λ is an array of Ch3Math rationals, lowest degree first,
 * with no trailing zeros (the zero polynomial is []). A λ-matrix is an array
 * of rows of such polynomials. Every decision (degree, divisibility, rank,
 * gcd) is exact; nothing here uses floating point.
 */
(() => {
  const M = () => window.Ch3Math;
  const F = (x) => M().parseF(x);

  function trim(p) {
    const out = p.slice();
    while (out.length && M().isZero(out[out.length - 1])) out.pop();
    return out;
  }

  const make = (coeffs) => trim(coeffs.map(F));
  const constant = (c) => make([c]);
  const lam = () => make([0, 1]);
  const zero = () => [];
  const one = () => make([1]);
  const deg = (p) => p.length - 1;
  const isZero = (p) => p.length === 0;
  const lc = (p) => p[p.length - 1];
  const isConstant = (p) => p.length === 1;
  const isOne = (p) => p.length === 1 && M().eq(p[0], F(1));

  function add(a, b) {
    const n = Math.max(a.length, b.length);
    return trim(Array.from({ length: n }, (_, i) => M().add(a[i] || F(0), b[i] || F(0))));
  }

  const neg = (a) => a.map((c) => M().neg(c));
  const sub = (a, b) => add(a, neg(b));
  const scale = (a, c) => trim(a.map((x) => M().mul(x, F(c))));

  function mul(a, b) {
    if (isZero(a) || isZero(b)) return [];
    const out = Array.from({ length: a.length + b.length - 1 }, () => F(0));
    a.forEach((x, i) => b.forEach((y, j) => (out[i + j] = M().add(out[i + j], M().mul(x, y)))));
    return trim(out);
  }

  function pow(a, k) {
    let out = one();
    for (let i = 0; i < k; i += 1) out = mul(out, a);
    return out;
  }

  const eq = (a, b) => a.length === b.length && a.every((x, i) => M().eq(x, b[i]));

  /* a = q·b + r with deg r < deg b. */
  function divmod(a, b) {
    if (isZero(b)) throw new RangeError("Polynomial division by zero");
    let r = a.slice();
    const q = Array.from({ length: Math.max(0, a.length - b.length + 1) }, () => F(0));
    while (!isZero(r) && deg(r) >= deg(b)) {
      const k = deg(r) - deg(b);
      const c = M().div(lc(r), lc(b));
      q[k] = c;
      const shifted = Array.from({ length: k }, () => F(0)).concat(b.map((x) => M().mul(x, c)));
      r = sub(r, shifted);
    }
    return { q: trim(q), r };
  }

  const divides = (a, b) => !isZero(a) && isZero(divmod(b, a).r);
  const monic = (p) => (isZero(p) ? [] : scale(p, M().div(F(1), lc(p))));

  function gcd(a, b) {
    let x = a;
    let y = b;
    while (!isZero(y)) [x, y] = [y, divmod(x, y).r];
    return monic(x);
  }

  function evalAt(p, x) {
    return p.reduceRight((s, c) => M().add(M().mul(s, F(x)), c), F(0));
  }

  /* ---------- formatting ---------- */

  function latex(p, x = "\\lambda") {
    if (isZero(p)) return "0";
    const terms = [];
    for (let k = p.length - 1; k >= 0; k -= 1) {
      const c = p[k];
      if (M().isZero(c)) continue;
      const negative = c.n < 0;
      const abs = M().absF(c);
      const unit = abs.n === 1 && abs.d === 1;
      const mono = k === 0 ? "" : k === 1 ? x : `${x}^{${k}}`;
      const body = k === 0 ? M().latexF(abs) : unit ? mono : `${M().latexF(abs)}${mono}`;
      terms.push((terms.length ? (negative ? "-" : "+") : negative ? "-" : "") + body);
    }
    return terms.join("");
  }

  const SUP = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  const sup = (k) => String(k).split("").map((d) => SUP[d]).join("");

  /* Plain text for canvas labels: "λ²−2λ+1". */
  function text(p, x = "λ") {
    if (isZero(p)) return "0";
    const terms = [];
    for (let k = p.length - 1; k >= 0; k -= 1) {
      const c = p[k];
      if (M().isZero(c)) continue;
      const negative = c.n < 0;
      const abs = M().absF(c);
      const unit = abs.n === 1 && abs.d === 1;
      const mono = k === 0 ? "" : k === 1 ? x : `${x}${sup(k)}`;
      const body = k === 0 ? M().formatF(abs) : unit ? mono : `${M().formatF(abs)}${mono}`;
      terms.push((terms.length ? (negative ? "−" : "+") : negative ? "−" : "") + body);
    }
    return terms.join("");
  }

  /*
   * Factor over the rationals where the roots are small integers:
   * "\lambda(\lambda+1)^2". A leftover factor without integer roots is kept
   * whole; the leading coefficient is written in front.
   */
  function factorLatex(p, x = "\\lambda") {
    if (isZero(p)) return "0";
    if (deg(p) < 1) return latex(p, x);
    let rest = monic(p);
    const lead = lc(p);
    const factors = [];
    const order = [0, ...Array.from({ length: 12 }, (_, i) => [i + 1, -(i + 1)]).flat()];
    for (const r of order) {
      if (deg(rest) < 1) break;
      const root = make([-r, 1]);
      let k = 0;
      while (deg(rest) >= 1 && isZero(divmod(rest, root).r)) {
        rest = divmod(rest, root).q;
        k += 1;
      }
      if (k) factors.push({ body: r === 0 ? x : `${x}${r < 0 ? "+" : "-"}${Math.abs(r)}`, k, bare: r === 0 });
    }
    if (deg(rest) >= 1) factors.push({ body: latex(rest, x), k: 1, bare: false });
    const head = M().eq(lead, F(1)) ? "" : M().eq(lead, F(-1)) ? "-" : M().latexF(lead);
    if (factors.length === 1 && factors[0].k === 1 && !head) return factors[0].body;
    return head + factors.map((f) => `${f.bare ? f.body : `(${f.body})`}${f.k > 1 ? `^{${f.k}}` : ""}`).join("");
  }

  /* ---------- λ-matrices ---------- */

  const mapMatrix = (A, f) => A.map((row, i) => row.map((x, j) => f(x, i, j)));

  /* Entries given as coefficient lists (lowest degree first). */
  const matrix = (rows) => rows.map((row) => row.map((c) => make(Array.isArray(c) ? c : [c])));

  /* λE − A for a numeric square matrix A. */
  function charMatrix(A) {
    return A.map((row, i) => row.map((a, j) => (i === j ? make([M().neg(F(a)), 1]) : make([M().neg(F(a))]))));
  }

  function det(A) {
    const n = A.length;
    if (n === 1) return A[0][0];
    if (n === 2) return sub(mul(A[0][0], A[1][1]), mul(A[0][1], A[1][0]));
    let sum = [];
    A[0].forEach((a, j) => {
      if (isZero(a)) return;
      const minor = A.slice(1).map((row) => row.filter((_, c) => c !== j));
      const term = mul(a, det(minor));
      sum = j % 2 ? sub(sum, term) : add(sum, term);
    });
    return sum;
  }

  function combinations(n, k) {
    const out = [];
    const walk = (start, picked) => {
      if (picked.length === k) {
        out.push(picked.slice());
        return;
      }
      for (let i = start; i < n; i += 1) walk(i + 1, [...picked, i]);
    };
    walk(0, []);
    return out;
  }

  /* All k-th order minors: { rows, cols, value }. */
  function minors(A, k) {
    const out = [];
    combinations(A.length, k).forEach((rows) =>
      combinations(A[0].length, k).forEach((cols) => {
        const sub = rows.map((i) => cols.map((j) => A[i][j]));
        out.push({ rows, cols, value: det(sub) });
      }),
    );
    return out;
  }

  /* Determinant factors D_1, …, D_r (monic gcd of all k-minors); r is the rank. */
  function determinantFactors(A) {
    const n = Math.min(A.length, A[0].length);
    const out = [];
    for (let k = 1; k <= n; k += 1) {
      const g = minors(A, k).reduce((acc, m) => gcd(acc, m.value), []);
      if (isZero(g)) break;
      out.push(g);
    }
    return out;
  }

  /* Invariant factors d_k = D_k / D_{k-1}. */
  function invariantFactors(A) {
    const D = determinantFactors(A);
    return D.map((Dk, i) => (i === 0 ? Dk : divmod(Dk, D[i - 1]).q));
  }

  const rank = (A) => determinantFactors(A).length;
  const evalMatrix = (A, x) => mapMatrix(A, (p) => evalAt(p, x));

  function latexMatrix(A) {
    return `\\begin{pmatrix}${A.map((row) => row.map((p) => latex(p)).join("&")).join("\\\\")}\\end{pmatrix}`;
  }

  window.Ch8Poly = Object.freeze({
    F,
    make,
    constant,
    lam,
    zero,
    one,
    deg,
    isZero,
    isConstant,
    isOne,
    lc,
    add,
    sub,
    neg,
    scale,
    mul,
    pow,
    eq,
    divmod,
    divides,
    monic,
    gcd,
    evalAt,
    latex,
    text,
    factorLatex,
    matrix,
    charMatrix,
    det,
    minors,
    determinantFactors,
    invariantFactors,
    rank,
    evalMatrix,
    latexMatrix,
  });
})();
