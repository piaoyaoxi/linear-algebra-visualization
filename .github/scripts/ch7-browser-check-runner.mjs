import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const evidence = "test-results/ch7-browser-evidence";
await mkdir(evidence, { recursive: true });

try {
  const lint = spawnSync(process.execPath, [".github/scripts/ch7-source-lint.mjs"], { encoding: "utf8" });
  if (lint.status !== 0) {
    throw new Error(`${lint.stdout || ""}${lint.stderr || ""}`.trim());
  }
  await import("./ch7-browser-check.mjs");
} catch (error) {
  const text = error?.stack || String(error);
  await writeFile(`${evidence}/failure.txt`, `${text}\n`, "utf8");
  console.error(text);
  // A failed assertion can leave Playwright's Chromium child alive. Exit
  // explicitly so CI reports the real failure and proceeds to upload evidence
  // instead of waiting for the workflow timeout.
  process.exit(1);
}
