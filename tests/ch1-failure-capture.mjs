import fs from "node:fs";
import path from "node:path";

const outputDir = process.env.CH1_EVIDENCE_DIR || "browser-evidence";

function serialize(reason, kind) {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  return JSON.stringify({
    kind,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  }, null, 2);
}

function write(reason, kind) {
  try {
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, "failure.json"), serialize(reason, kind));
  } catch (error) {
    console.error("Could not write browser audit failure evidence:", error);
  }
}

process.on("uncaughtExceptionMonitor", (error) => write(error, "uncaughtException"));
process.on("unhandledRejection", (reason) => write(reason, "unhandledRejection"));
