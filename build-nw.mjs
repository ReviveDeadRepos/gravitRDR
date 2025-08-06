import nwbuild from 'nw-builder';
import fs from 'fs';
import path from 'path';

// Utility to recursively copy a directory
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy Infinity core into build/system/infinity before packaging
const infinitySrc = path.resolve('./build/infinity');
const infinityDest = path.resolve('./build/system/infinity');
copyDir(infinitySrc, infinityDest);

const commonOptions = {
  version: '0.75.0',
  flavor: 'sdk',
  cacheDir: './node-webkit/cache',
  zip: false,
  glob: false,
  srcDir: './build/system'
};

// macOS (icns)
await nwbuild({
  ...commonOptions,
  platform: 'osx',
  arch: 'x64',
  outDir: './build/system-binaries/GravitRDR/osx',
  app: { 
    icon: 'shell/system/appicon.icns',
    "LSApplicationCategoryType": "public.app-category.graphics-design",
    "NSHumanReadableCopyright": "Reserved © 2023 ReviveDeadRepos. Originally created by Quasado.",
    "NSLocalNetworkUsageDescription": "This app requires access to the local network to function properly.",
   }
});

// Windows (ico)
await nwbuild({
  ...commonOptions,
  platform: 'win',
  arch: 'x64',
  outDir: './build/system-binaries/GravitRDR/win',
  app: { icon: 'shell/system/appicon.ico' }
});

// Linux
await nwbuild({
  ...commonOptions,
  platform: 'linux',
  outDir: './build/system-binaries/GravitRDR/linux',
  arch: 'x64'
});
