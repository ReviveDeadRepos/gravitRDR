import { execSync } from "child_process";
import {
  cpSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  existsSync,
  readdirSync,
} from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist/browser");
const BUILD = join(ROOT, "build/source");

function main() {
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });

  console.log("=== Step 1: Build CSS + JS bundle with Vite ===");
  execSync("npx vite build --config vite.config.js", {
    cwd: ROOT,
    stdio: "inherit",
  });

  const assetsDir = join(BUILD, "assets");
  const cssFiles = readdirSync(assetsDir).filter((f) => f.endsWith(".css"));
  const jsFiles = readdirSync(assetsDir).filter(
    (f) => f.endsWith(".js") && f.startsWith("app-"),
  );

  const cssFile = cssFiles[0];
  const jsFile = jsFiles[0];
  if (!cssFile) throw new Error("No CSS output found");
  if (!jsFile) throw new Error("No JS bundle output found");

  mkdirSync(join(DIST, "style"), { recursive: true });
  cpSync(join(assetsDir, cssFile), join(DIST, "style/gravitrdr.css"));
  cpSync(join(assetsDir, jsFile), join(DIST, "app.js"));
  rmSync(BUILD, { recursive: true, force: true });

  console.log("=== Step 2: Generate production HTML ===");
  const html = `<!doctype html>
<html><head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>GravitRDR</title>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=0">
<link rel="stylesheet" href="style/gravitrdr.css">
</head><body>
<script type="module" src="app.js"></script>
</body></html>`;
  writeFileSync(join(DIST, "index.html"), html);

  console.log("=== Step 3: Copy shell scripts ===");
  cpSync(join(ROOT, "shell"), join(DIST, "shell"), { recursive: true });

  console.log("=== Step 4: Copy assets ===");
  const publicDir = join(ROOT, "src/public");
  for (const dir of ["cursor", "webfonts", "font"]) {
    const src = join(publicDir, dir);
    if (existsSync(src)) cpSync(src, join(DIST, dir), { recursive: true });
  }

  console.log(`Build complete: ${DIST}`);
}

main();
