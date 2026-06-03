#!/usr/bin/env node
/**
 * Converts IIFE-based source files to ESM.
 *
 * Transforms:
 *   (function(_) { ... _.Foo = Foo; })(this);
 * into:
 *   export function Foo() { ... }
 *   // or
 *   export var Foo = ...;
 *
 * Also builds cross-file dependency graph and adds import statements.
 */

import fs from 'node:fs';
import path from 'node:path';

const IIFE_OPEN_RE = /^\s*\(function\s*\(\s*_\s*\)\s*\{/;
const IIFE_CLOSE_RE = /^\s*\}\s*\)?\s*\(\s*this\s*\)\s*\)?\s*;?\s*$/;
const EXPORT_RE = /^\s*_\s*\.\s*(\w+)\s*=\s*(.+?)\s*;?\s*$/;

function stripIife(code) {
  let lines = code.split('\n');
  // Strip trailing empty lines first
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }
  if (lines.length > 0 && IIFE_OPEN_RE.test(lines[0])) {
    lines.shift();
  }
  // Handle multi-line close: `}\n    (this);` or `})\n    (this);`
  if (lines.length >= 2) {
    const lastLine = lines[lines.length - 1].trim();
    const secondLast = lines[lines.length - 2].trim();
    const closeParenOnly = secondLast.match(/^\)$/);
    const closeCurlyParen = secondLast.match(/^\}\)$/);
    const closeCurlyOnly = secondLast.match(/^\}$/);
    if ((closeParenOnly || closeCurlyParen || closeCurlyOnly) && 
        lastLine.match(/^\)?\s*\(\s*this\s*\)\s*\)?\s*;?\s*$/)) {
      lines.pop();
      lines.pop();
    }
  }
  if (lines.length > 0 && IIFE_CLOSE_RE.test(lines[lines.length - 1])) {
    lines.pop();
  }
  return lines.join('\n');
}

async function convertFile(inputPath, outputPath) {
  const code = fs.readFileSync(inputPath, 'utf-8');
  let converted = stripIife(code);

  const lines = converted.split('\n');
  const exportLines = new Map(); // line index -> { propName, valueExpr }
  const modifiedLines = new Set();
  const exports = [];

  // Identify all `_.XXX = YYY` lines
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(EXPORT_RE);
    if (m) {
      exportLines.set(i, { propName: m[1], valueExpr: m[2].trim() });
    }
  }

  // Build a map of all declared names → line index (var X, function X, const X, let X)
  const declarations = new Map();
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const varMatch = trimmed.match(/^(var|let|const)\s+(\w+)\s*=/);
    const funcMatch = trimmed.match(/^function\s+(\w+)/);
    if (varMatch) declarations.set(varMatch[2], i);
    if (funcMatch) declarations.set(funcMatch[1], i);
  }

  // Process each export
  for (const [idx, { propName, valueExpr }] of exportLines) {
    let found = false;
    // Look for a matching declaration anywhere in the file
    if (declarations.has(propName)) {
      const declLine = declarations.get(propName);
      lines[declLine] = 'export ' + lines[declLine];
      modifiedLines.add(declLine);
      modifiedLines.add(idx);
      found = true;
    } else if (declarations.has(valueExpr)) {
      const declLine = declarations.get(valueExpr);
      lines[declLine] = 'export ' + lines[declLine];
      modifiedLines.add(declLine);
      modifiedLines.add(idx);
      found = true;
    }

    if (!found) {
      // No matching declaration → rewrite `_.X = Y;` → `export var X = Y;`
      const originalLine = lines[idx];
      const rewritten = originalLine.replace(/^\s*_\s*\.\s*(\w+)\s*=\s*(.*?)\s*;?\s*$/, 'export var $1 = $2;');
      if (rewritten !== originalLine) {
        lines[idx] = rewritten;
      } else {
        lines[idx] = `export { ${propName} };`;
      }
      modifiedLines.add(idx);
    }
    exports.push(propName);
  }

  // Build output
  const newLines = [];
  for (let i = 0; i < lines.length; i++) {
    if (!modifiedLines.has(i)) {
      const trimmed = lines[i].trim();
      // Skip remaining unhandled export lines
      if (EXPORT_RE.test(trimmed)) {
        continue;
      }
      newLines.push(lines[i]);
    } else {
      newLines.push(lines[i]);
    }
  }

  let result = newLines.join('\n');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, result, 'utf-8');
  return exports;
}

function scanExports(code) {
  const exports = [];
  const lines = code.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    const declMatch = trimmed.match(/^export\s+(var|let|const|function|class)\s+(\w+)/);
    if (declMatch) exports.push(declMatch[2]);
    const namedMatch = trimmed.match(/^export\s+\{\s*([\w\s,]+)\s*\}/);
    if (namedMatch) {
      namedMatch[1].split(',').map(s => s.trim()).filter(Boolean).forEach(n => exports.push(n));
    }
  }
  return exports;
}

function detectImports(code, fileExports, allExports) {
  const exportNames = [...allExports.keys()].filter(name => !fileExports.includes(name));
  if (exportNames.length === 0) return [];

  const escaped = exportNames.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  // Negative lookbehind for `.` so `thing.forEach` doesn't match `forEach`
  const re = new RegExp('(?<!\\.)\\b(' + escaped.join('|') + ')\\b', 'g');

  const refs = new Set();
  let m;
  while ((m = re.exec(code)) !== null) {
    refs.add(m[1]);
  }

  return [...refs];
}

async function main() {
  const args = process.argv.slice(2);
  const knownExportsFileIdx = args.indexOf('--known-exports');
  let knownExportsPath = null;
  if (knownExportsFileIdx !== -1 && knownExportsFileIdx + 1 < args.length) {
    knownExportsPath = args[knownExportsFileIdx + 1];
    args.splice(knownExportsFileIdx, 2);
  }
  const [sourceDir, outputDir, packageName, saveExportsPath] = args;
  if (!sourceDir || !outputDir) {
    console.error('Usage: convert-iife-to-esm.mjs <source-dir> <output-dir> [package-name] [save-exports-path] [--known-exports <path>]');
    process.exit(1);
  }

  const sourcePath = path.resolve(sourceDir);
  const outputPath = path.resolve(outputDir);

  console.log(`Converting ${sourcePath} → ${outputPath}`);

  const files = findJsFiles(sourcePath, sourcePath);
  files.sort();

  // Phase 1: Convert all files and collect exports
  const fileExports = new Map();
  const allExports = new Map();

  for (const file of files) {
    const inputFile = path.join(sourcePath, file);
    const outputFile = path.join(outputPath, file);
    const exps = await convertFile(inputFile, outputFile);
    fileExports.set(file, exps);
    for (const exp of exps) {
      allExports.set(exp, file);
    }
  }

  // Load known exports from dependency packages
  if (knownExportsPath && fs.existsSync(knownExportsPath)) {
    const known = JSON.parse(fs.readFileSync(knownExportsPath, 'utf-8'));
    for (const [name, source] of Object.entries(known)) {
      if (!allExports.has(name)) {
        allExports.set(name, source);
      }
    }
    console.log(`Loaded ${Object.keys(known).length} known exports from ${knownExportsPath}`);
  }

  console.log('Phase 1 complete: converted files, exports:');
  for (const [file, exps] of fileExports) {
    if (exps.length > 0) console.log(`  ${file}: ${exps.join(', ')}`);
  }

  // Phase 2: Add imports
  for (const file of files) {
    const outputFile = path.join(outputPath, file);
    const code = fs.readFileSync(outputFile, 'utf-8');
    const ourExports = fileExports.get(file) || [];
    const deps = detectImports(code, ourExports, allExports);

    if (deps.length > 0) {
      const depsByFile = {};
      for (const dep of deps) {
        if (allExports.has(dep)) {
          const srcFile = allExports.get(dep);
          if (srcFile !== file) {
            if (!depsByFile[srcFile]) depsByFile[srcFile] = [];
            depsByFile[srcFile].push(dep);
          }
        }
      }

      if (Object.keys(depsByFile).length > 0) {
        const importLines = [];
        for (const [srcFile, names] of Object.entries(depsByFile)) {
          const relPath = path.relative(path.dirname(outputFile), path.join(outputPath, srcFile));
          const importPath = relPath.startsWith('.') ? relPath : './' + relPath;
          importLines.push(`import { ${names.join(', ')} } from '${importPath.replace(/\.js$/, '')}';`);
        }

        const newCode = importLines.join('\n') + '\n' + code;
        fs.writeFileSync(outputFile, newCode, 'utf-8');
        console.log(`  Imports added to ${file}: ${deps.join(', ')}`);
      }
    }
  }

  // Phase 3: Generate barrel index.js
  if (packageName) {
    const finalExports = new Map();
    for (const file of files) {
      const outputFile = path.join(outputPath, file);
      const c = fs.readFileSync(outputFile, 'utf-8');
      finalExports.set(file, scanExports(c));
    }

    const indexLines = [`// Auto-generated barrel for ${packageName}`];
    for (const file of files) {
      const exps = finalExports.get(file) || [];
      if (exps.length > 0) {
        const importPath = './' + file.replace(/\.js$/, '');
        indexLines.push(`export { ${exps.join(', ')} } from '${importPath}';`);
      }
    }

    fs.writeFileSync(path.join(outputPath, 'index.js'), indexLines.join('\n') + '\n', 'utf-8');
    console.log(`Generated barrel index.js for ${packageName}`);
  }

  // Save exports for use by downstream packages
  if (saveExportsPath) {
    const exportMap = {};
    for (const [file, exps] of fileExports) {
      for (const exp of exps) {
        exportMap[exp] = file;
      }
    }
    fs.writeFileSync(saveExportsPath, JSON.stringify(exportMap, null, 2), 'utf-8');
    console.log(`Saved ${Object.keys(exportMap).length} exports to ${saveExportsPath}`);
  }

  console.log(`\nDone. Converted ${files.length} files.`);
}

function findJsFiles(dir, rootDir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(rootDir, fullPath);
    if (entry.name === 'node_modules' || entry.name === 'vendor') continue;
    if (entry.isDirectory()) {
      results.push(...findJsFiles(fullPath, rootDir));
    } else if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.endsWith('.min.js')) {
      results.push(relPath);
    }
  }
  return results;
}

main().catch(console.error);
