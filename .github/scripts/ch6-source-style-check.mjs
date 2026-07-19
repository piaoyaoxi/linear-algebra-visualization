import fs from "node:fs";
import path from "node:path";

const root = "current/visuals/ch6";
const extensions = new Set([".css", ".js", ".html"]);
const forbidden = [
  "--ch6-ink",
  "--ch6-cyan",
  "--ch6-orange",
  "#071525",
  "#5ce0eb",
  "#ffad5b",
  "rgba(92, 224, 235",
  "rgba(255, 173, 91",
  "ch6-vector-glow",
  "<ellipse class=\"ch6-map-set\"",
  "青色：",
  "橙色：",
  "白色：",
  "绿色：",
  "青色段",
  "橙色段",
  "绿色箭头",
  "白色向量",
  "橙色方向",
  "linear-gradient(",
  "radial-gradient(",
  "stroke-dasharray",
  "filter: drop-shadow",
];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const item = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(item);
    return extensions.has(path.extname(entry.name)) ? [item] : [];
  });
}

const files = walk(root);
const problems = [];
for (const file of files) {
  const source = fs.readFileSync(file, "utf8").toLowerCase();
  for (const token of forbidden) {
    if (source.includes(token.toLowerCase())) problems.push(`${file}: ${token}`);
  }
}

if (problems.length) {
  throw new Error(`Rejected Chapter 6 visual language remains:\n${problems.join("\n")}`);
}

console.log(`PASS source-style-check (${files.length} files)`);
