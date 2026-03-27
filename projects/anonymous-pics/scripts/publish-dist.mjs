import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");

if (!existsSync(distDir)) {
  throw new Error("dist directory not found. Run the build first.");
}

const publishedDirs = ["assets", "icons"];
const publishedFiles = ["index.html", "manifest.webmanifest", "sw.js"];

for (const dir of publishedDirs) {
  rmSync(path.join(projectRoot, dir), { recursive: true, force: true });
}

for (const file of publishedFiles) {
  rmSync(path.join(projectRoot, file), { force: true });
}

for (const entry of readdirSync(distDir, { withFileTypes: true })) {
  const source = path.join(distDir, entry.name);
  const target = path.join(projectRoot, entry.name);

  if (entry.isDirectory()) {
    mkdirSync(target, { recursive: true });
    cpSync(source, target, { recursive: true });
    continue;
  }

  cpSync(source, target);
}

console.log("Published dist/ to project root.");
