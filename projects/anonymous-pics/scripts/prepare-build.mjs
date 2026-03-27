import { copyFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

copyFileSync(
  path.join(projectRoot, "index.src.html"),
  path.join(projectRoot, "index.html"),
);

console.log("Prepared source index.html for Vite.");
