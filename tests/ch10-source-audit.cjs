const fs = require("node:fs");
const path = require("node:path");

const roots = [
  "current/content",
  "current/visuals/ch10",
  "current/structured-learning.js",
];
const commands = ["begin", "end", "frac", "sum", "lambda", "omega", "delta", "operatorname", "mathbb", "ker", "det", "dim", "in", "to", "ne", "forall"];
const pattern = new RegExp(`(?<!\\\\)\\\\(?:${commands.join("|")})`, "g");
const findings = [];

function visit(target) {
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(target)) visit(path.join(target, entry));
    return;
  }
  if (!target.endsWith(".js")) return;
  const lines = fs.readFileSync(target, "utf8").split(/\r?\n/);
  lines.forEach((line, index) => {
    const matches = [...line.matchAll(pattern)];
    if (matches.length) findings.push({ file: target, line: index + 1, text: line.trim() });
  });
}

roots.forEach((root) => visit(root));
console.log(JSON.stringify({ findings }, null, 2));
if (findings.length) process.exitCode = 1;
