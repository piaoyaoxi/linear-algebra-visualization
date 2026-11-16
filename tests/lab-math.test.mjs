// Unit tests for the floating-point helpers the labs share (readout numbers, colours), the
// math engines of chapters 2 and 5 and the model of the chapter 8 elementary-divisor lab.
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
for (const file of [
  "visuals/shared/exact.js",
  "visuals/shared/number.js",
  "visuals/shared/canvas.js",
  "visuals/ch2/labs-math.js",
  "visuals/ch3/shared-math.js",
  "visuals/ch5/quadratic-engine.js",
  "visuals/ch8/divisor-blocks.js",
]) {
  vm.runInThisContext(fs.readFileSync(path.join(root, file), "utf8"), { filename: file });
}
const N = window.LANumber;
const C2 = window.Ch2Math;
const C3 = window.Ch3Math;
const C5 = window.Ch5Math;
const B8 = window.Ch8Blocks;

const near = (actual, expected, eps = 1e-9) => assert.ok(Math.abs(actual - expected) < eps, `${actual} ≠ ${expected}`);
const nearMatrix = (actual, expected) => actual.forEach((row, i) => row.forEach((v, j) => near(v, expected[i][j])));

test("readout numbers: rounded, shortest form, never -0", () => {
  assert.equal(N.decimal(1.5), "1.5");
  assert.equal(N.decimal(2), "2");
  assert.equal(N.decimal(1 / 3), "0.33");
  assert.equal(N.decimal(1 / 3, 3), "0.333");
  assert.equal(N.decimal(-1 / 3), "-0.33");
  assert.equal(N.decimal(0.125), "0.13");
  assert.equal(N.decimal(-0.001), "0");
  assert.equal(N.decimal(-0), "0");
  assert.equal(N.decimal(1234.5678, 1), "1234.6");
  assert.equal(N.decimal(NaN), "NaN");
  // running text takes the true minus sign; a value that rounds to zero has none
  assert.equal(N.text(-1 / 3), "−0.33");
  assert.equal(N.text(-0.004), "0");
  assert.equal(N.text(2.5, 0), "3");
});

test("chapter formatters agree with the shared rule", () => {
  assert.equal(C2.formatNum(1 / 3), "0.333");
  assert.equal(C2.formatNum(-0.0001), "0");
  assert.equal(C2.formatNum(Infinity), "—");
  assert.equal(C3.formatNumber(-2 / 3), "-0.67");
  assert.equal(C3.formatNumber("x"), "0");
  assert.equal(C5.formatNum(0.004), "0");
  assert.equal(C5.formatNum(2.346), "2.35");
  assert.equal(C5.formatNum(NaN), "0");
});

test("colours at an opacity", () => {
  const { withAlpha } = window.LACanvas;
  assert.equal(withAlpha("#abc", 0.5), "rgba(170,187,204,0.5)");
  assert.equal(withAlpha("#2a64a8", 0.25), "rgba(42,100,168,0.25)");
  assert.equal(withAlpha("rgb(1, 2, 3)", 0.4), "rgba(1,2,3,0.4)");
  assert.equal(withAlpha("rgba(1,2,3,0.9)", 0.4), "rgba(1,2,3,0.4)");
  assert.equal(withAlpha("currentColor", 0.4), "currentColor");
});

test("chapter 2: determinants", () => {
  assert.equal(C2.det2([[1, 2], [3, 4]]), -2);
  assert.equal(C2.det3([[2, 1, 0], [1, 3, 1], [0, 1, 4]]), 18);
  near(C2.determinant([[1, 2, 3, 4], [0, 2, 5, 6], [0, 0, 3, 7], [0, 0, 0, 4]]), 24);
  // one row swap of the identity
  near(C2.determinant([[0, 1, 0, 0], [1, 0, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]), -1);
  assert.equal(C2.determinant([[1, 2, 3], [2, 4, 6], [1, 0, 1]]), 0);
  assert.deepEqual(C2.mul2([[1, 2], [3, 4]], [[0, 1], [1, 0]]), [[2, 1], [4, 3]]);
});

test("chapter 2: permutations, inversions and signs", () => {
  assert.deepEqual(
    C2.inversionPairs([3, 1, 2]).map(({ a, b }) => [a, b]),
    [[3, 1], [3, 2]],
  );
  assert.equal(C2.signFromPerm([3, 1, 2]), 1);
  assert.equal(C2.signFromPerm([2, 1, 3]), -1);
  const all = C2.permutations(3);
  assert.equal(all.length, 6);
  assert.deepEqual(all[0], [1, 2, 3]);
  assert.deepEqual(all[5], [3, 2, 1]);
  // as many even as odd permutations of 4 letters
  assert.equal(C2.permutations(4).reduce((sum, p) => sum + C2.signFromPerm(p), 0), 0);
  assert.equal(C2.allPositionPairs(4).length, 6);
});

test("chapter 2: minors and complementary indices", () => {
  const M = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
  assert.deepEqual(C2.minorMatrix(M, 1, 1), [[1, 3], [7, 9]]);
  assert.deepEqual(C2.submatrix(M, [0, 2], [1, 2]), [[2, 3], [8, 9]]);
  assert.deepEqual(C2.complementIndices(4, [1, 3]), [0, 2]);
});

test("chapter 2: a 2×2 system has one, none or infinitely many solutions", () => {
  assert.equal(C2.classifySystem2([[1, 2], [3, 4]], [5, 6]).kind, "unique");
  assert.equal(C2.classifySystem2([[1, 2], [2, 4]], [1, 3]).kind, "none");
  assert.equal(C2.classifySystem2([[1, 2], [2, 4]], [1, 2]).kind, "infinite");
  assert.equal(C2.classifySystem2([[0, 0], [0, 0]], [0, 0]).kind, "infinite");
  assert.equal(C2.classifySystem2([[0, 0], [0, 0]], [0, 1]).kind, "none");
});

test("chapter 2: exact fractions in readouts", () => {
  assert.equal(C2.formatFrac(0.5), "1/2");
  assert.equal(C2.formatFrac(-1.25), "−5/4");
  assert.equal(C2.formatFrac(2), "2");
  assert.equal(C2.formatFrac(Math.PI), "3.142");
  assert.equal(C2.formatFrac(NaN), "—");
});

test("chapter 5: a quadratic form and its matrix", () => {
  assert.deepEqual(C5.symmetrize([[1, 2], [0, 3]]), [[1, 1], [1, 3]]);
  // x₁² + 2x₁x₂ + 3x₂² at (1, 2)
  assert.equal(C5.qForm([[1, 1], [1, 3]], [1, 2]), 17);
  assert.deepEqual(C5.mat2FromAbc(1, 2, 3), [[1, 2], [2, 3]]);
  assert.equal(C5.polyPlain2([[1, 1], [1, 3]]), "x₁²+2x₁x₂+3x₂²");
  assert.equal(C5.polyPlain2([[2, -0.5], [-0.5, 0]], "y"), "2y₁²-y₁y₂");
});

test("chapter 5: a congruent matrix gives the same values in the new variables", () => {
  const A = [[2, 1], [1, 3]];
  const C = [[1, 1], [0, 1]];
  const y = [2, -1];
  // x = Cy = (1, −1), and f(1, −1) = 2 − 2 + 3
  assert.equal(C5.qForm(C5.congruence(A, C), y), 3);
  assert.equal(C5.qForm(A, C5.matVec(C, y)), 3);
});

test("chapter 5: rank, eigenvalues and inertia", () => {
  assert.equal(C5.matrixRank([[1, 2], [2, 4]]), 1);
  assert.equal(C5.matrixRank(C5.identity(3)), 3);
  assert.equal(C5.matrixRank([[0, 0], [0, 0]]), 0);
  assert.deepEqual(C5.eigenvalues2([[2, 1], [1, 2]]), [3, 1]);
  const indefinite = C5.inertiaSymmetric([[1, 0], [0, -2]]);
  assert.deepEqual([indefinite.p, indefinite.q, indefinite.zero, indefinite.signature], [1, 1, 0, 0]);
  const semidefinite = C5.inertiaSymmetric([[1, 1], [1, 1]]);
  assert.deepEqual([semidefinite.p, semidefinite.q, semidefinite.zero, semidefinite.rank], [1, 0, 1, 1]);
});

test("chapter 5: completing the square diagonalises the form", () => {
  // x₁² + 2x₁x₂ + 3x₂² = (x₁ + x₂)² + 2x₂²
  const square = C5.completeSquareSteps2([[1, 1], [1, 3]]);
  assert.ok(square.ok);
  assert.deepEqual(square.standard, [1, 2]);
  nearMatrix(square.C, [[1, -1], [0, 1]]);
  nearMatrix(square.D, [[1, 0], [0, 2]]);
  // 2x₁x₂ alone: x₁ = (y₁ + y₂)/2, x₂ = (y₁ − y₂)/2 gives (y₁² − y₂²)/2
  const cross = C5.completeSquareSteps2([[0, 1], [1, 0]]);
  assert.ok(cross.ok);
  nearMatrix(cross.D, [[cross.standard[0], 0], [0, cross.standard[1]]]);
  assert.ok(cross.standard[0] * cross.standard[1] < 0, "one positive and one negative square");
});

// the presets of the chapter 8 §5 lab: one row per invariant factor d₁ … dₙ
const SPLIT = [{}, {}, { a: 1 }, { a: 2, b: 1 }]; // 1, 1, λ−1, (λ−1)²(λ+2)
const FIELD = [{}, {}, {}, { q: 1 }, { a: 1, q: 1 }]; // 1, 1, 1, λ²+1, (λ−1)(λ²+1)
const REBUILD = [{}, {}, {}, { a: 1 }, { a: 2, c: 2 }]; // 1, 1, 1, λ−1, (λ−1)²(λ+1)²

test("chapter 8: elementary divisors are the prime powers of the invariant factors", () => {
  const list = B8.blocks(SPLIT, "R");
  assert.deepEqual(list.map((b) => [b.id, b.e]), [["2-a", 1], ["3-a", 2], ["3-b", 1]]);
  // their degrees add up to the order of the matrix
  assert.equal(list.reduce((sum, b) => sum + B8.PRIMES[b.p].deg * b.e, 0), 4);
  // one line per prime, its powers in increasing order
  assert.deepEqual(B8.lines(list).map((line) => line.map((b) => B8.label(b))), [["λ−1", "(λ−1)²"], ["λ+2"]]);
  assert.deepEqual(B8.invariantTex(SPLIT, "R"), ["1", "1", "\\lambda-1", "(\\lambda-1)^{2}(\\lambda+2)"]);
});

test("chapter 8: λ²+1 breaks into two blocks over the complex numbers only", () => {
  assert.equal(B8.blocks(FIELD, "R").length, 3);
  const complex = B8.blocks(FIELD, "C");
  assert.deepEqual(complex.map((b) => b.id), ["3-ip", "3-im", "4-a", "4-ip", "4-im"]);
  assert.deepEqual(complex.filter((b) => b.parent).map((b) => b.parent), ["3-q", "3-q", "4-q", "4-q"]);
  assert.ok(B8.hasSplit(FIELD));
  assert.ok(!B8.hasSplit(SPLIT));
  assert.equal(B8.lines(complex).length, 3);
  assert.equal(B8.invariantTex(FIELD, "C")[4], "(\\lambda-1)(\\lambda-\\mathrm{i})(\\lambda+\\mathrm{i})");
  assert.equal(B8.label({ p: "q", e: 1 }), "λ²+1");
  assert.equal(B8.tex({ p: "a", e: 3 }), "(\\lambda-1)^{3}");
});

test("chapter 8: a block keeps its size in both views and stays on the canvas", () => {
  for (const width of [720, 390]) {
    const size = { width, height: 400 };
    const inv = B8.layout(REBUILD, { view: "inv", field: "R", ...size });
    const ed = B8.layout(REBUILD, { view: "ed", field: "R", ...size });
    assert.equal(inv.left, width < 520 ? 74 : 110);
    assert.equal(inv.firstRow, 3);
    assert.deepEqual([...inv.pos.keys()].sort(), [...ed.pos.keys()].sort());
    inv.pos.forEach((box, id) => {
      assert.equal(box.w, ed.pos.get(id).w, `${id} changes width between the views`);
      assert.equal(box.h, ed.pos.get(id).h);
      assert.ok(box.x >= inv.left && box.x + box.w <= width, `${id} leaves the canvas`);
    });
    // width is proportional to degree × exponent: (λ−1)² is twice λ−1 (6px gap after each)
    near((inv.pos.get("4-a").w + 6) / (inv.pos.get("3-a").w + 6), 2);
    // the blocks of one invariant factor sit side by side on one row
    const [a, c] = [inv.pos.get("4-a"), inv.pos.get("4-c")];
    assert.equal(a.y, c.y);
    near(c.x, a.x + a.w + 6);
  }
});
