import { execSync } from 'child_process';
import { cpSync, mkdirSync, writeFileSync, rmSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist/browser');
const BUILD = join(ROOT, 'build/source');

function main() {
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });

  console.log('=== Step 1: Build CSS + JS bundle with Vite ===');
  execSync('npx vite build --config vite.config.js', { cwd: ROOT, stdio: 'inherit' });

  const assetsDir = join(BUILD, 'assets');
  const cssFiles = readdirSync(assetsDir).filter(f => f.endsWith('.css'));
  const jsFiles = readdirSync(assetsDir).filter(f => f.endsWith('.js') && f.startsWith('app-'));

  const cssFile = cssFiles[0];
  const jsFile = jsFiles[0];
  if (!cssFile) throw new Error('No CSS output found');
  if (!jsFile) throw new Error('No JS bundle output found');

  mkdirSync(join(DIST, 'style'), { recursive: true });
  cpSync(join(assetsDir, cssFile), join(DIST, 'style/gravitrdr.css'));
  cpSync(join(assetsDir, jsFile), join(DIST, 'app.js'));
  rmSync(BUILD, { recursive: true, force: true });

  console.log('=== Step 2: Copy vendor scripts ===');
  const vendorScripts = [
    'jquery/dist/jquery.js',
    'jqtree/tree.jquery.js',
    'mousetrap/mousetrap.js',
    'opentype.js/dist/opentype.js',
    'wawoff2/build/decompress_binding.js',
    'rangy/lib/rangy-core.js',
    'rangy/lib/rangy-classapplier.js',
    'rangy/lib/rangy-selectionsaverestore.js',
    'pako/dist/pako.js',
    'colorthief/dist/umd/color-thief.global.js',
    'urijs/src/URI.js',
    'blob.js/Blob.js',
  ];
  mkdirSync(join(DIST, 'vendor'), { recursive: true });
  for (const vendPath of vendorScripts) {
    const src = join(ROOT, 'node_modules', vendPath);
    const name = vendPath.replace(/.*\//, '');
    cpSync(src, join(DIST, 'vendor', name));
  }

  console.log('=== Step 3: Generate production HTML ===');
  const vendorTags = vendorScripts
    .map(p => `<script src="vendor/${p.replace(/.*\//, '')}"></script>`)
    .join('\n');

  const html = `<!doctype html>
<html><head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>GravitRDR</title>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=0">
<link rel="stylesheet" href="style/gravitrdr.css">
</head><body>
${vendorTags}
<script src="app.js"></script>
<script>
if(this['process']&&this['require']){
  document.writeln('<script src="shell/system/filestorage.js"><\\/script>');
  document.writeln('<script src="shell/system/winstate.js"><\\/script>');
  document.writeln('<script src="shell/system/shell.js"><\\/script>');
}else{
  document.writeln('<script src="shell/browser/shell.js"><\\/script>');
}
</script>
</body></html>`;
  writeFileSync(join(DIST, 'index.html'), html);

  console.log('=== Step 4: Copy shell scripts ===');
  cpSync(join(ROOT, 'shell'), join(DIST, 'shell'), { recursive: true });

  console.log('=== Step 5: Copy assets ===');
  const publicDir = join(ROOT, 'src/public');
  for (const dir of ['cursor', 'webfonts', 'font']) {
    const src = join(publicDir, dir);
    if (existsSync(src)) cpSync(src, join(DIST, dir), { recursive: true });
  }

  console.log(`Build complete: ${DIST}`);
}

main();
