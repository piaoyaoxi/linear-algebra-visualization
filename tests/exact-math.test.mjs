// Unit tests for the exact arithmetic behind every rank / solvability / dependence
// verdict, the polynomial engine of chapter 1 and the λ-matrix engine of chapter 8.
// Expected values are worked out by hand, independent of the code under test.
// Run: node --test tests/*.test.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../current");
globalThis.window = globalThis;
globalThis.matchMedia ??= () => ({ matches: false });
for (const file of ["visuals/shared/exact.js", "visuals/ch1/poly-math.js", "visuals/ch8/poly.js"]) {
  vm.runInThisContext(fs.readFileSync(path.join(root, file), "utf8"), { filename: file });
}
const X = window.LAExact;
const P1 = window.Ch1Math;
const P8 = window.Ch8Poly;

const q = (n, d = 1) => X.F(n, d);
const mat = (rows) => X.matFromNumbers(rows);
const same = (a, b) => assert.ok(X.eq(a, b), `${X.formatF(a)} ≠ ${X.formatF(b)}`);
const nums = (values) => values.map(X.toNumber);

test("rationals are normalised and exact", () => {
  assert.deepEqual({ ...q(6, -4) }, { n: -3, d: 2 });
  assert.deepEqual({ ...q(0, 5) }, { n: 0, d: 1 });
  same(X.add(q(1, 3), q(1, 6)), q(1, 2));
  same(X.mul(q(-2, 3), q(9, 4)), q(-3, 2));
  same(X.div(q(1, 2), q(3, 4)), q(2, 3));
  assert.throws(() => X.div(q(1), q(0)), RangeError);
  assert.equal(X.cmp(q(1, 3), q(1, 2)), -1);
});

test("integer gcd", () => {
  assert.equal(X.gcd(12, -18), 6);
  assert.equal(X.gcd(0, 5), 5);
  assert.equal(X.gcd(0, 0), 0);
  assert.equal([0, 0, 4, 6].reduce(X.gcd, 0), 2);
});

test("parts beyond the safe integer range throw instead of rounding", () => {
  assert.throws(() => q(2 ** 53), RangeError);
  assert.throws(() => X.mul(q(2 ** 30), q(2 ** 30)), RangeError);
});

test("typed text is read exactly", () => {
  same(X.parseExact("0.0001"), q(1, 10000));
  same(X.parseExact("−3/4"), q(-3, 4));
  same(X.parseExact("2.5"), q(5, 2));
  same(X.parseF(0.5), q(1, 2));
  assert.throws(() => X.parseExact("1/0"), RangeError);
});

test("rank", () => {
  assert.equal(X.rankOf(mat([[1, 2, 3], [2, 4, 6], [1, 0, 1]])), 2);
  assert.equal(X.rankOf(mat([[1, 0, 0], [0, 1, 0], [0, 0, 1]])), 3);
  assert.equal(X.rankOf(mat([[0, 0], [0, 0]])), 0);
  // dependent only exactly: the third row is row1 + row2 with fractions
  assert.equal(X.rankOf(mat([[1, 1 / 3, 0], [0, 2 / 3, 1], [1, 1, 1]])), 2);
});

test("determinant", () => {
  same(X.determinant(mat([[2, 1, 0], [1, 3, 1], [0, 1, 4]])), q(18));
  same(X.determinant(mat([[1, 2], [2, 4]])), q(0));
  same(X.determinant(mat([[0, 1, 0], [1, 0, 0], [0, 0, 1]])), q(-1));
});

test("row reduction", () => {
  const { matrix, pivots } = X.rref(mat([[2, 4], [1, 3]]));
  assert.deepEqual(pivots, [0, 1]);
  assert.deepEqual(X.matToNumbers(matrix), [[1, 0], [0, 1]]);
});

test("null space vectors are mapped to zero", () => {
  const A = mat([[1, 2, 3], [2, 4, 6]]);
  const { basis } = X.nullspaceBasis(A);
  assert.equal(basis.length, 2);
  for (const v of basis) assert.deepEqual(nums(X.matVec(A, v)), [0, 0]);
});

test("solvability of linear systems", () => {
  assert.equal(X.classifySystem(mat([[1, 1, 2], [1, -1, 0]])).key, "unique");
  assert.equal(X.classifySystem(mat([[1, 1, 1], [2, 2, 3]])).key, "none");
  assert.equal(X.classifySystem(mat([[1, 1, 1], [2, 2, 2]])).key, "infinite");
  const solved = X.particularSolution(mat([[1, 1, 2], [1, -1, 0]]));
  assert.ok(solved.ok);
  assert.deepEqual(nums(solved.x), [1, 1]);
  const info = X.analyzeAugmented(mat([[1, 1, 1], [2, 2, 3]]));
  assert.equal(info.rankA, 1);
  assert.equal(info.rankAug, 2);
});

test("linear relation certificate", () => {
  const cert = X.relationCertificate([[1, 0], [0, 1], [1, 1]]);
  assert.ok(cert.dependent);
  assert.deepEqual(nums(cert.coeffs), [1, 1, -1]);
  assert.equal(X.relationCertificate([[1, 0], [0, 1]]).dependent, false);
});

test("chapter 1: division with remainder", () => {
  const { q: quotient, r } = P1.polyDiv(P1.poly([-1, 0, 0, 1]), P1.poly([-1, 1]));
  assert.deepEqual(nums(quotient), [1, 1, 1]);
  assert.ok(P1.isZeroPoly(r));
  const second = P1.polyDiv(P1.poly([1, 0, 1]), P1.poly([0, 2]));
  assert.deepEqual(nums(second.q), [0, 0.5]);
  assert.deepEqual(nums(second.r), [1]);
});

test("chapter 1: gcd and Bézout coefficients", () => {
  const f = P1.poly([-1, 0, 1]); // x² − 1
  const g = P1.poly([1, 2, 1]); // x² + 2x + 1
  assert.deepEqual(nums(P1.polyGcd(f, g)), [1, 1]);
  const done = P1.extendedEuclidSteps(f, g).at(-1);
  assert.equal(done.kind, "done");
  const combo = P1.polyAdd(P1.polyMul(done.s, f), P1.polyMul(done.t, g));
  assert.ok(P1.polyEq(combo, done.d));
  assert.deepEqual(nums(P1.polyGcd(P1.poly([1, 0, 1]), P1.poly([0, 1]))), [1]);
});

test("chapter 1: content and primitive part keep a zero constant term", () => {
  const { content, primitive } = P1.contentAndPrimitive(P1.poly([0, 4, 0, 2])); // 2x³ + 4x
  same(content, q(2));
  assert.deepEqual(nums(primitive), [0, 2, 0, 1]);
});

test("chapter 1: derivative, interpolation, rational root candidates", () => {
  assert.deepEqual(nums(P1.polyDerivative(P1.poly([0, 0, 0, 1]))), [0, 0, 3]);
  const { polynomial } = P1.lagrangeInterpolation([{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 5 }]);
  assert.deepEqual(nums(polynomial), [1, 0, 1]);
  const candidates = nums(P1.rationalRootCandidates(P1.poly([-1, -1, 1, 2])));
  assert.deepEqual(candidates, [-1, -0.5, 0.5, 1]);
});

test("chapter 8: invariant factors", () => {
  // Jordan block of 2: d₁ = 1, d₂ = (λ−2)²
  const jordan = P8.invariantFactors(P8.charMatrix([[2, 0], [1, 2]]));
  assert.deepEqual(jordan.map(nums), [[1], [4, -4, 1]]);
  // diag(1, 1, 2): 1, λ−1, (λ−1)(λ−2)
  const diag = P8.invariantFactors(P8.charMatrix([[1, 0, 0], [0, 1, 0], [0, 0, 2]]));
  assert.deepEqual(diag.map(nums), [[1], [-1, 1], [2, -3, 1]]);
});

test("chapter 8: determinant factors end with the characteristic polynomial", () => {
  const D = P8.determinantFactors(P8.charMatrix([[0, -1], [1, 0]]));
  assert.deepEqual(nums(D.at(-1)), [1, 0, 1]);
  assert.equal(P8.rank(P8.charMatrix([[1, 2], [3, 4]])), 2);
});
