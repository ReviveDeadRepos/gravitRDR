import fs from 'fs';
import path from 'path';

const ROOT = '/workspaces/gravitRDR/packages';

function collectJS(dir) {
  const files = [];
  function walk(d) {
    for (const e of fs.readdirSync(d)) {
      const p = path.join(d, e);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (e.endsWith('.js')) files.push(p);
    }
  }
  walk(dir);
  return files;
}

function fileExists(basePath) {
  return fs.existsSync(basePath) || fs.existsSync(basePath + '.js');
}

function getReplacementForEditor(resolvedPath, _importPath, packageRoot) {
  if (fileExists(resolvedPath)) return null;
  const rel = path.relative(packageRoot, resolvedPath);
  const parts = rel.split(path.sep);

  const samePackageDirs = ['guide', 'tool', 'i18n'];
  const samePackageFiles = ['editor', 'editorpaintconfiguration'];
  if (samePackageDirs.includes(parts[0])) return null;
  if (parts.length === 1 && samePackageFiles.includes(parts[0])) return null;
  if (parts[0] === 'development') return null;

  return '@gravitrdr/infinity-core';
}

function getReplacementForGravit(resolvedPath, _importPath, packageRoot) {
  if (fileExists(resolvedPath)) return null;
  const rel = path.relative(packageRoot, resolvedPath);
  const parts = rel.split(path.sep);

  const samePackageDirs = ['action', 'colormatcher', 'exporter', 'palette', 'panel', 'properties', 'sidebar', 'styleentry', 'transformer', 'i18n'];
  if (samePackageDirs.includes(parts[0])) return null;
  if (parts.length === 1 && parts[0] === 'gravitrdr') return null;
  if (parts[0] === 'development') return null;

  const coreDirs = ['core', 'event', 'geometry', 'paint', 'scene', 'vertex', 'view', 'infinity'];
  if (coreDirs.includes(parts[0]) || (parts.length === 1 && parts[0] === 'platform')) {
    return '@gravitrdr/infinity-core';
  }

  const editorDirs = ['guide', 'tool'];
  if (editorDirs.includes(parts[0]) || (parts.length === 1 && parts[0] === 'editor')) {
    return '@gravitrdr/infinity-editor';
  }

  const appDirs = ['extension', 'component', 'workspace', 'util'];
  const appFiles = ['document', 'shell', 'application', 'bootstrap'];
  if (appDirs.includes(parts[0]) || appFiles.includes(parts[0])) {
    return '@gravitrdr/application';
  }

  return null;
}

function processFiles(files, packageRoot, getReplacement) {
  let fixed = 0;
  const importRegex = /import\s+[^']*?\s+from\s+'((?:\.\.?\/)[^']+)'/g;

  for (const file of files) {
    const original = fs.readFileSync(file, 'utf8');
    const fileDir = path.dirname(file);

    const modified = original.replace(importRegex, (match, importPath) => {
      const resolvedPath = path.resolve(fileDir, importPath);
      const replacement = getReplacement(resolvedPath, importPath, packageRoot);
      if (replacement) {
        return match.replace(importPath, replacement);
      }
      return match;
    });

    if (modified !== original) {
      fs.writeFileSync(file, modified, 'utf8');

      const rel = path.relative(packageRoot, file).replace(/\\/g, '/');
      const importsIn = original.match(importRegex) || [];
      const importsOut = modified.match(importRegex) || [];
      const changed = importsIn.length - importsOut.length;
      console.log(`  ${rel} (${Math.abs(changed)} fixed)`);
      fixed++;
    }
  }

  return fixed;
}

// Main
const editorPackage = path.join(ROOT, 'infinity-editor');
const gravitPackage = path.join(ROOT, 'gravitrdr');

console.log('infinity-editor:');
const editorFiles = collectJS(editorPackage);
let total = processFiles(editorFiles, editorPackage, getReplacementForEditor);

console.log('\ngravitrdr:');
const gravitFiles = collectJS(gravitPackage);
total += processFiles(gravitFiles, gravitPackage, getReplacementForGravit);

console.log(`\nTotal files modified: ${total}`);
