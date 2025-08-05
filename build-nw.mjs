import nwbuild from 'nw-builder';

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
