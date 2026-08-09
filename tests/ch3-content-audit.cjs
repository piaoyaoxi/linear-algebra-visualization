const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..");
const contentRoot = path.join(repoRoot, "current", "content");
const sections = new Map();
let chapter = null;

const context = vm.createContext({
  console,
  Math,
  String,
  texInline: (source) => String(source),
  defineChapter3Section: (id, section) => sections.set(id, section),
  registerAlgebraChapter: (value) => { chapter = value; },
});

function load(file) {
  const source = fs.readFileSync(path.join(contentRoot, file), "utf8");
  vm.runInContext(source, context, { filename: file });
}

load("ch3.js");
for (let index = 1; index <= 7; index += 1) load(`ch3-section${index}.js`);

function matVec(A, x) {
  return A.map((row) => row.reduce((sum, value, index) => sum + value * x[index], 0));
}

function approxEqual(actual, expected, tolerance = 1e-9) {
  assert.equal(actual.length, expected.length);
  actual.forEach((value, index) => {
    assert.ok(Math.abs(value - expected[index]) <= tolerance, `${value} != ${expected[index]} at ${index}`);
  });
}

function rankOf(input, tolerance = 1e-10) {
  const matrix = input.map((row) => row.slice());
  const rows = matrix.length;
  const columns = matrix[0]?.length || 0;
  let rank = 0;
  for (let column = 0; column < columns && rank < rows; column += 1) {
    let pivot = rank;
    for (let row = rank + 1; row < rows; row += 1) {
      if (Math.abs(matrix[row][column]) > Math.abs(matrix[pivot][column])) pivot = row;
    }
    if (Math.abs(matrix[pivot][column]) <= tolerance) continue;
    [matrix[rank], matrix[pivot]] = [matrix[pivot], matrix[rank]];
    const divisor = matrix[rank][column];
    for (let j = column; j < columns; j += 1) matrix[rank][j] /= divisor;
    for (let row = 0; row < rows; row += 1) {
      if (row === rank) continue;
      const factor = matrix[row][column];
      for (let j = column; j < columns; j += 1) matrix[row][j] -= factor * matrix[rank][j];
    }
    rank += 1;
  }
  return rank;
}

function determinant(matrix) {
  if (matrix.length === 1) return matrix[0][0];
  if (matrix.length === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  return matrix[0].reduce((sum, value, column) => {
    const minor = matrix.slice(1).map((row) => row.filter((_, index) => index !== column));
    return sum + (column % 2 ? -1 : 1) * value * determinant(minor);
  }, 0);
}

function columnsToMatrix(vectors) {
  return Array.from({ length: vectors[0].length }, (_, row) => vectors.map((vector) => vector[row]));
}

function auditExample(section) {
  const audit = section.example.audit;
  assert.ok(audit, `${section.id || section.title} is missing example.audit`);
  if (audit.kind === "unique-system") {
    approxEqual(matVec(audit.A, audit.x), audit.b);
    assert.equal(rankOf(audit.A), audit.A[0].length);
    return;
  }
  if (audit.kind === "matrix-vector") {
    approxEqual(matVec(audit.A, audit.x), audit.y);
    return;
  }
  if (audit.kind === "dependence") {
    const matrix = columnsToMatrix(audit.vectors);
    assert.equal(rankOf(matrix), audit.rank);
    audit.relations.forEach((coefficients) => approxEqual(matVec(matrix, coefficients), Array(matrix.length).fill(0)));
    const independent = columnsToMatrix(audit.independentIndices.map((index) => audit.vectors[index]));
    assert.equal(rankOf(independent), audit.independentIndices.length);
    return;
  }
  if (audit.kind === "rank") {
    assert.equal(rankOf(audit.A), audit.rank);
    const minor = audit.minor.rows.map((row) => audit.minor.columns.map((column) => audit.A[row][column]));
    assert.equal(determinant(minor), audit.minor.determinant);
    const independent = audit.A.map((row) => audit.independentColumns.map((column) => row[column]));
    assert.equal(rankOf(independent), audit.independentColumns.length);
    return;
  }
  if (audit.kind === "solvability") {
    assert.equal(rankOf(audit.A), audit.rank);
    audit.cases.forEach((item) => {
      const augmented = audit.A.map((row, index) => [...row, item.b[index]]);
      const rankAugmented = rankOf(augmented);
      assert.equal(rankAugmented, item.rankAugmented);
      assert.equal(rankAugmented === audit.rank, item.solvable);
    });
    return;
  }
  if (audit.kind === "affine-family") {
    approxEqual(matVec(audit.A, audit.x0), audit.b);
    audit.basis.forEach((vector) => approxEqual(matVec(audit.A, vector), Array(audit.A.length).fill(0)));
    assert.equal(rankOf(audit.A), audit.rank);
    assert.equal(audit.basis.length, audit.A[0].length - audit.rank);
    assert.equal(rankOf(columnsToMatrix(audit.basis)), audit.basis.length);
    return;
  }
  if (audit.kind === "point-system") {
    audit.points.forEach(([x, y]) => {
      audit.equations.forEach((equation) => {
        const value = equation.kind === "circle"
          ? x * x + y * y - equation.constant
          : x - y - equation.constant;
        assert.ok(Math.abs(value) <= 1e-9, `point (${x}, ${y}) fails ${equation.kind}`);
      });
    });
    return;
  }
  assert.fail(`Unknown audit kind: ${audit.kind}`);
}

assert.ok(chapter, "Chapter 3 registration did not run");
assert.equal(chapter.id, "ch3");
assert.equal(chapter.sections.length, 7);
assert.equal(sections.size, 7);

const bannedInternal = /开发进度|原型版本|占位|即将制作|待补充/;
const falseOpposition = /不是[^。；]{0,40}而是/;

for (const [id, section] of sections) {
  section.id = id;
  assert.ok(section.question.length >= 30, `${id} needs a substantive starting question`);
  assert.ok(section.goal.length >= 30, `${id} needs a substantive goal`);
  assert.ok(section.intro.length >= 60, `${id} needs a substantive introduction`);
  assert.equal(section.interactive?.type, "slot", `${id} must mount a real Chapter 3 interaction`);
  assert.ok(section.interactive.task.length >= 30, `${id} needs a concrete interaction task`);
  assert.ok(section.interactive.prompts.length >= 3, `${id} needs guided observation prompts`);
  assert.equal(section.example.choices.length, 4, `${id} must keep four answer choices`);
  assert.equal(section.example.choices.filter((choice) => choice.correct).length, 1, `${id} must have one correct answer`);
  assert.ok(section.example.steps.length >= 4, `${id} needs a complete worked analysis`);
  assert.ok(section.quiz.length >= 4 && section.quiz.length <= 6, `${id} self-test size should stay focused`);
  assert.ok(section.summary.length >= 3, `${id} needs a connected summary`);
  const renderedContent = JSON.stringify({
    question: section.question,
    goal: section.goal,
    intro: section.intro,
    concepts: section.concepts,
    interactive: section.interactive,
    example: { ...section.example, audit: undefined },
    quiz: section.quiz,
    summary: section.summary,
  });
  assert.doesNotMatch(renderedContent, bannedInternal, `${id} exposes internal production wording`);
  assert.doesNotMatch(renderedContent, falseOpposition, `${id} uses a false-opposition sentence`);
  auditExample(section);
}

const anchorIds = ["n-vector-space", "matrix-rank", "solvability", "solution-structure"];
const anchorMatrices = anchorIds.map((id) => JSON.stringify(sections.get(id).example.audit.A));
assert.equal(new Set(anchorMatrices).size, 1, "Sections 2, 4, 5, and 6 must reuse the same anchor matrix");

console.log("Chapter 3 content audit passed: 7 sections, 7 verified examples, one continuous anchor matrix.");
