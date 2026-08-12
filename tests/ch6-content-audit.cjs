const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..");
const contentRoot = path.join(repoRoot, "current", "content");
const algebraContent = { chapters: [] };
const context = vm.createContext({
  console,
  Math,
  String,
  algebraContent,
  texInline: (source) => String(source),
  texDisplay: (source) => String(source),
  registerAlgebraChapter: (chapter) => algebraContent.chapters.push(chapter),
});
context.window = context;

function load(file) {
  const source = fs.readFileSync(path.join(contentRoot, file), "utf8");
  vm.runInContext(source, context, { filename: file });
}

load("ch6-registry.js");
for (let index = 1; index <= 8; index += 1) load(`ch6-section${index}.js`);
load("ch6.js");
load("ch6-assemble.js");
load("ch6-refinement.js");

const chapter = algebraContent.chapters.find((item) => item.id === "ch6");
assert.ok(chapter, "Chapter 6 registration did not run");
assert.equal(chapter.sections.length, 8);

const expectedOrder = [
  "sets-maps",
  "vector-space-definition",
  "basis-coordinates",
  "change-of-basis",
  "subspaces",
  "intersection-sum",
  "direct-sum",
  "isomorphism",
];
assert.deepEqual(Array.from(chapter.sections, (section) => section.id), expectedOrder);

function approxEqual(actual, expected, tolerance = 1e-9) {
  assert.equal(actual.length, expected.length);
  actual.forEach((value, index) => {
    assert.ok(Math.abs(value - expected[index]) <= tolerance, `${value} != ${expected[index]} at ${index}`);
  });
}

function add(a, b) {
  return a.map((value, index) => value + b[index]);
}

function linearCombination(vectors, coefficients) {
  return vectors.reduce(
    (sum, vector, index) => add(sum, vector.map((value) => value * coefficients[index])),
    Array(vectors[0].length).fill(0),
  );
}

function matVec(matrix, vector) {
  return matrix.map((row) => row.reduce((sum, value, index) => sum + value * vector[index], 0));
}

function matMul(a, b) {
  return a.map((row) => b[0].map((_, column) => row.reduce((sum, value, index) => sum + value * b[index][column], 0)));
}

function columnsToMatrix(vectors) {
  return Array.from({ length: vectors[0].length }, (_, row) => vectors.map((vector) => vector[row]));
}

function identity(size) {
  return Array.from({ length: size }, (_, row) => Array.from({ length: size }, (_, column) => Number(row === column)));
}

function approxMatrix(actual, expected, tolerance = 1e-9) {
  assert.equal(actual.length, expected.length);
  actual.forEach((row, index) => approxEqual(row, expected[index], tolerance));
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

function auditExample(section) {
  const audit = section.example.audit;
  assert.ok(audit, `${section.id} is missing example.audit`);

  if (audit.kind === "finite-map") {
    assert.equal(audit.outputs.length, audit.domain.length);
    const range = [...new Set(audit.outputs)];
    assert.equal(new Set(audit.outputs).size === audit.outputs.length, audit.injective);
    assert.equal(audit.codomain.every((value) => range.includes(value)), audit.surjective);
    const preimage = audit.domain.filter((_, index) => audit.outputs[index] === audit.preimageValue);
    assert.deepEqual(Array.from(preimage), Array.from(audit.preimage));
    const domainIndex = audit.domain.indexOf(audit.compositionInput);
    assert.equal(audit.secondMap[audit.outputs[domainIndex]], audit.compositionOutput);
    return;
  }

  if (audit.kind === "evaluation-constraint") {
    assert.notEqual(audit.zeroValue, audit.rhs);
    assert.notEqual(audit.sumValue, audit.rhs);
    assert.equal(audit.scale * audit.rhs, audit.scaledValue);
    assert.notEqual(audit.scaledValue, audit.rhs);
    return;
  }

  if (audit.kind === "polynomial-basis") {
    approxEqual(linearCombination(audit.vectors, audit.relation), Array(audit.target.length).fill(0));
    const basis = audit.basisIndices.map((index) => audit.vectors[index]);
    assert.equal(rankOf(columnsToMatrix(basis)), audit.dimension);
    approxEqual(linearCombination(basis, audit.coordinates), audit.target);
    return;
  }

  if (audit.kind === "change-of-basis") {
    approxMatrix(matMul(audit.W, audit.transition), audit.U);
    approxEqual(matVec(audit.transition, audit.oldCoordinates), audit.newCoordinates);
    approxEqual(matVec(audit.U, audit.oldCoordinates), audit.vector);
    approxEqual(matVec(audit.W, audit.newCoordinates), audit.vector);
    return;
  }

  if (audit.kind === "polynomial-subspace") {
    audit.basis.forEach((polynomial) => {
      const value = polynomial.reduce((sum, coefficient, degree) => sum + coefficient * audit.evaluationPoint ** degree, 0);
      assert.ok(Math.abs(value) <= 1e-9);
    });
    assert.equal(rankOf(columnsToMatrix(audit.basis)), audit.dimension);
    approxEqual(linearCombination(audit.basis, audit.coordinates), audit.target);
    return;
  }

  if (audit.kind === "intersection-sum") {
    assert.equal(rankOf(columnsToMatrix(audit.U)), audit.dimensions.U);
    assert.equal(rankOf(columnsToMatrix(audit.W)), audit.dimensions.W);
    audit.intersectionBasis.forEach((vector, index) => {
      approxEqual(linearCombination(audit.U, audit.intersectionUCoefficients[index]), vector);
      approxEqual(linearCombination(audit.W, audit.intersectionWCoefficients[index]), vector);
    });
    assert.equal(rankOf(columnsToMatrix(audit.intersectionBasis)), audit.dimensions.intersection);
    assert.equal(rankOf(columnsToMatrix(audit.sumBasis)), audit.dimensions.sum);
    assert.equal(
      audit.dimensions.U + audit.dimensions.W - audit.dimensions.intersection,
      audit.dimensions.sum,
    );
    return;
  }

  if (audit.kind === "direct-sum") {
    const combinedBasis = [...audit.UBasis, ...audit.WBasis];
    assert.equal(rankOf(columnsToMatrix(combinedBasis)), audit.combinedDimension);
    assert.equal(audit.UBasis.length + audit.WBasis.length - audit.combinedDimension, audit.intersectionDimension);
    approxEqual(add(audit.uPart, audit.wPart), audit.target);
    assert.equal(rankOf(columnsToMatrix([...audit.UBasis, audit.uPart])), audit.UBasis.length);
    assert.equal(rankOf(columnsToMatrix([...audit.WBasis, audit.wPart])), audit.WBasis.length);
    return;
  }

  if (audit.kind === "coordinate-isomorphism") {
    const basisMatrix = columnsToMatrix(audit.basis);
    approxMatrix(audit.inverseMatrix, basisMatrix);
    approxMatrix(matMul(audit.forwardMatrix, audit.inverseMatrix), identity(3));
    approxMatrix(matMul(audit.inverseMatrix, audit.forwardMatrix), identity(3));
    return;
  }

  assert.fail(`Unknown Chapter 6 audit kind: ${audit.kind}`);
}

const bannedInternal = /开发进度|原型版本|占位|即将制作|待补充|未来生产|AI 生成/;
const falseOpposition = /不是[^。；]{0,50}而是/;
const genericSource = /北大版《高等代数》第六章/;

for (const section of chapter.sections) {
  assert.ok(section.question.length >= 35, `${section.id} needs a substantive starting question`);
  assert.ok(section.goal.length >= 45, `${section.id} needs a substantive learning goal`);
  assert.ok(section.intro.length >= 70, `${section.id} needs a substantive introduction`);
  assert.ok(section.prerequisites?.length >= 2, `${section.id} needs prerequisites`);
  assert.ok(section.objectives?.length >= 3, `${section.id} needs measurable objectives`);
  assert.ok(section.story?.lead?.length >= 55, `${section.id} needs a connected formal lead`);
  assert.ok(section.story?.modules?.length >= 4, `${section.id} needs a theorem chain`);
  assert.ok(section.story.modules.every((module) => module.blocks?.length), `${section.id} has an empty story module`);
  assert.equal(section.interactive?.type, "slot", `${section.id} must retain its real interaction`);
  assert.ok(section.interactive.task.length >= 30, `${section.id} needs a concrete interaction task`);
  assert.ok(section.interactive.prompts.length >= 4, `${section.id} needs four guided observations`);
  assert.equal(section.example.choices.length, 4, `${section.id} must keep four answer choices`);
  assert.equal(section.example.choices.filter((choice) => choice.correct).length, 1, `${section.id} must have one correct answer`);
  assert.ok(section.example.steps.length >= 4, `${section.id} needs a complete worked solution`);
  assert.ok(section.quiz.length >= 5 && section.quiz.length <= 6, `${section.id} self-test size must stay focused`);
  assert.ok(section.summary.length >= 3, `${section.id} needs a connected summary`);
  assert.ok(section.bridge?.length >= 30, `${section.id} needs an explicit next-step bridge`);
  assert.doesNotMatch(section.textbook.reference, genericSource, `${section.id} still has a generic source label`);

  const studentContent = JSON.stringify({
    question: section.question,
    goal: section.goal,
    intro: section.intro,
    story: section.story,
    interactive: section.interactive,
    example: { ...section.example, audit: undefined },
    quiz: section.quiz,
    summary: section.summary,
    bridge: section.bridge,
  });
  assert.doesNotMatch(studentContent, bannedInternal, `${section.id} exposes internal production wording`);
  assert.doesNotMatch(studentContent, falseOpposition, `${section.id} uses a false-opposition sentence`);
  auditExample(section);
}

const section2 = chapter.sections.find((section) => section.id === "vector-space-definition");
const section5 = chapter.sections.find((section) => section.id === "subspaces");
assert.match(JSON.stringify(section2.story), /数域与运算属于空间/);
assert.match(JSON.stringify(section5.story), /沿用原空间的运算/);
assert.match(JSON.stringify(chapter.sections.find((section) => section.id === "basis-coordinates").story), /相关性/);
assert.match(JSON.stringify(chapter.sections.find((section) => section.id === "direct-sum").story), /两两交为零/);

console.log("Chapter 6 content audit passed: 8 sections, 8 verified examples, one theorem spine.");
