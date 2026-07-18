import { mkdir, writeFile } from "node:fs/promises";

const evidence = "test-results/ch7-browser-evidence";
await mkdir(evidence, { recursive: true });

try {
  await import("./ch7-browser-check.mjs");
} catch (error) {
  const message = error?.stack || error?.message || String(error);
  await writeFile(`${evidence}/failure.txt`, `${message}\n`, "utf8");
  console.error("CHAPTER_7_BROWSER_CHECK_FAILURE");
  console.error(message);
  process.exit(1);
}
