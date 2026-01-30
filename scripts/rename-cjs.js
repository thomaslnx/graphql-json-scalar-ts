import { readdirSync, renameSync, rmSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distCjsDir = join(__dirname, "..", "dist-cjs");
const distDir = join(__dirname, "..", "dist");

if (!existsSync(distCjsDir)) {
  console.error("dist-cjs directory not found");
  process.exit(1);
}

/* Rename .js files to .cjs in dist-cjs */
const files = readdirSync(distCjsDir, { recursive: true });

for (const file of files) {
  if (
    typeof file === "string" &&
    (file.endsWith(".js") || file.endsWith(".js.map"))
  ) {
    const oldPath = join(distCjsDir, file);
    const newPath = join(
      distDir,
      file.replace(/\.js$/, ".cjs").replace(/\.map$/, ".map"),
    );
    const newDir = dirname(newPath);

    /* Ensure directory exists */
    if (!existsSync(newDir)) {
      mkdirSync(newDir, { recursive: true });
    }

    renameSync(oldPath, newPath);
  } else if (
    typeof file === "string" &&
    (file.endsWith(".d.ts") || file.endsWith(".d.ts.map"))
  ) {
    // Copy .d.ts and .d.ts.map files to dist (they're the same for both)
    // Skip if already exists (ESM build already created them)
  }
}

/* Clean up dist-cjs directory */
rmSync(distCjsDir, { recursive: true, force: true });

console.log("✓ CJS files renamed and moved to dist/");
