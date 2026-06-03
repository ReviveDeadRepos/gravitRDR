import { execSync } from 'child_process';
import { cpSync, mkdirSync, readFileSync, writeFileSync, rmSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist/browser');

function main() {
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });

  console.log('=== Step 1: Compile CSS with Vite ===');
  execSync('npx vite build --config vite.config.js', { cwd: ROOT, stdio: 'inherit' });

  const assetsDir = join(ROOT, 'build/source/assets');
  const cssFiles = readdirSync(assetsDir).filter(f => f.endsWith('.css'));
  const cssFile = cssFiles[0];
  if (!cssFile) throw new Error('No CSS output found');
  const cssHash = cssFile.replace('style-', '').replace('.css', '');

  mkdirSync(join(DIST, 'style'), { recursive: true });
  cpSync(join(assetsDir, cssFile), join(DIST, 'style/gravitrdr.css'));
  rmSync(join(ROOT, 'build/source'), { recursive: true, force: true });

  console.log('=== Step 2: Copy source JS files ===');
  const SRC = join(ROOT, 'src');
  const copyDirs = [
    'infinity', 'infinity-editor', 'application', 'gravitrdr', 'shell',
  ];
  for (const dir of copyDirs) {
    const srcDir = join(SRC, dir);
    if (dir === 'shell') {
      const actualShell = join(ROOT, 'shell');
      cpSync(actualShell, join(DIST, dir), { recursive: true, dereference: true });
    } else {
      cpSync(srcDir, join(DIST, dir), { recursive: true, dereference: true, filter: (f) => !f.endsWith('.scss') });
    }
  }

  console.log('=== Step 3: Copy vendor JS files ===');
  const vendorScripts = [
    ['jquery/dist/jquery.js'],
    ['jqtree/tree.jquery.js'],
    ['mousetrap/mousetrap.js'],
    ['opentype.js/dist/opentype.js'],
    ['wawoff2/build/decompress_binding.js'],
    ['rangy/lib/rangy-core.js'],
    ['rangy/lib/rangy-classapplier.js'],
    ['rangy/lib/rangy-selectionsaverestore.js'],
    ['pako/dist/pako.js'],
    ['colorthief/dist/umd/color-thief.global.js'],
    ['urijs/src/URI.js'],
    ['blob.js/Blob.js'],
  ];
  mkdirSync(join(DIST, 'vendor'), { recursive: true });
  for (const [vendPath] of vendorScripts) {
    const src = join(ROOT, 'node_modules', vendPath);
    cpSync(src, join(DIST, 'vendor', vendPath.replace(/.*\//, '')));
  }

  console.log('=== Step 4: Generate production HTML ===');
  const scriptTags = buildScriptTags();
  const html = `<!doctype html>
<html><head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>GravitRDR</title>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=0">
<link rel="stylesheet" href="style/gravitrdr.css">
</head><body>
${scriptTags}
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

  console.log('=== Step 5: Copy assets ===');
  cpSync(join(ROOT, 'src/public/cursor'), join(DIST, 'cursor'), { recursive: true });
  if (existsSync(join(ROOT, 'src/public/webfonts'))) {
    cpSync(join(ROOT, 'src/public/webfonts'), join(DIST, 'webfonts'), { recursive: true });
  }
  if (existsSync(join(ROOT, 'src/public/font'))) {
    cpSync(join(ROOT, 'src/public/font'), join(DIST, 'font'), { recursive: true });
  }

  console.log(`Build complete: ${DIST}`);
}

function buildScriptTags() {
  const vendorFiles = [
    'jquery.js', 'tree.jquery.js', 'mousetrap.js', 'opentype.js',
    'decompress_binding.js', 'rangy-core.js', 'rangy-classapplier.js',
    'rangy-selectionsaverestore.js', 'pako.js', 'color-thief.global.js',
    'URI.js', 'Blob.js',
  ];
  const vendorTags = vendorFiles.map(f => `<script src="vendor/${f}"></script>`).join('\n');

  const sourceFiles = [
    'infinity/core/object.js', 'infinity/core/system.js', 'infinity/core/cursor.js',
    'infinity/core/key.js', 'infinity/core/locale.js', 'infinity/core/math.js',
    'infinity/core/util.js', 'infinity/event/event.js', 'infinity/event/eventtarget.js',
    'infinity/event/inputevent.js', 'infinity/event/keyevent.js', 'infinity/event/mouseevent.js',
    'infinity/geometry/length.js', 'infinity/geometry/point.js', 'infinity/geometry/rect.js',
    'infinity/geometry/transform.js', 'infinity/vertex/vertex.js', 'infinity/vertex/vertexsource.js',
    'infinity/vertex/vertextarget.js', 'infinity/vertex/vertexcontainer.js',
    'infinity/vertex/vertexinfo.js', 'infinity/vertex/vertexpixelaligner.js',
    'infinity/vertex/vertextransformer.js', 'infinity/vertex/vertexoffsetter.js',
    'infinity/paint/pattern.js', 'infinity/paint/annotation.js', 'infinity/paint/bitmap.js',
    'infinity/paint/font.js', 'infinity/paint/colorspace.js', 'infinity/paint/color.js',
    'infinity/paint/colorprofile.js', 'infinity/paint/dirtylist.js', 'infinity/paint/gradient.js',
    'infinity/paint/paintcanvas.js', 'infinity/paint/paintconfiguration.js',
    'infinity/paint/paintcontext.js', 'infinity/scene/node.js', 'infinity/scene/element.js',
    'infinity/scene/block.js', 'infinity/scene/item.js', 'infinity/scene/scene.js',
    'infinity/scene/scenepaintconfiguration.js', 'infinity/scene/selector.js',
    'infinity/scene/style/style.js', 'infinity/scene/style/sharedstyle.js',
    'infinity/scene/style/appliedstyle.js', 'infinity/scene/style/inlinestyle.js',
    'infinity/scene/style/linkedstyle.js', 'infinity/scene/style/styleset.js',
    'infinity/scene/style/styleentry.js', 'infinity/scene/style/filterentry.js',
    'infinity/scene/style/effectentry.js', 'infinity/scene/style/paintentry.js',
    'infinity/scene/style/veffectentry.js', 'infinity/scene/style/effect/shadoweffect.js',
    'infinity/scene/style/filter/blurfilter.js', 'infinity/scene/style/paint/patternpaint.js',
    'infinity/scene/style/paint/areapaint.js', 'infinity/scene/style/paint/fillpaint.js',
    'infinity/scene/style/paint/strokepaint.js', 'infinity/scene/style/veffect/offsetveffect.js',
    'infinity/scene/structure/page.js', 'infinity/scene/structure/layer.js',
    'infinity/scene/structure/slice.js', 'infinity/scene/structure/swatch.js',
    'infinity/scene/shape/shape.js', 'infinity/scene/shape/shapeset.js',
    'infinity/scene/shape/pathbase.js', 'infinity/scene/shape/image.js',
    'infinity/scene/shape/polygon.js', 'infinity/scene/shape/rectangle.js',
    'infinity/scene/shape/ellipse.js', 'infinity/scene/shape/path.js',
    'infinity/scene/shape/text.js', 'infinity/view/stage.js', 'infinity/view/scenestage.js',
    'infinity/view/widget.js', 'infinity/view/view.js', 'infinity/platform.js',
    'infinity/i18n/i18n_en.js', 'infinity/i18n/i18n_de.js',
    'infinity-editor/guide/guides.js', 'infinity-editor/guide/guide.js',
    'infinity-editor/guide/gridguide.js', 'infinity-editor/guide/unitguide.js',
    'infinity-editor/guide/pageguide.js', 'infinity-editor/guide/shapeboxguide.js',
    'infinity-editor/scene/transformbox.js', 'infinity-editor/scene/elementeditor.js',
    'infinity-editor/scene/blockeditor.js', 'infinity-editor/scene/sceneeditor.js',
    'infinity-editor/scene/shape/shapeeditor.js', 'infinity-editor/scene/shape/shapeseteditor.js',
    'infinity-editor/scene/shape/pathbaseeditor.js', 'infinity-editor/scene/shape/texteditor.js',
    'infinity-editor/scene/shape/ellipseeditor.js', 'infinity-editor/scene/shape/rectangleeditor.js',
    'infinity-editor/scene/shape/polygoneditor.js', 'infinity-editor/scene/shape/patheditor.js',
    'infinity-editor/scene/shape/imageeditor.js', 'infinity-editor/scene/structure/pageeditor.js',
    'infinity-editor/scene/structure/layereditor.js', 'infinity-editor/scene/structure/sliceeditor.js',
    'infinity-editor/tool/tool.js', 'infinity-editor/tool/toolmanager.js',
    'infinity-editor/tool/selecttool.js', 'infinity-editor/tool/marqueetool.js',
    'infinity-editor/tool/shapetool.js', 'infinity-editor/tool/subselecttool.js',
    'infinity-editor/tool/lassotool.js', 'infinity-editor/tool/layertool.js',
    'infinity-editor/tool/handtool.js', 'infinity-editor/tool/zoomtool.js',
    'infinity-editor/tool/pathtool.js', 'infinity-editor/tool/pentool.js',
    'infinity-editor/tool/bezigontool.js', 'infinity-editor/tool/linetool.js',
    'infinity-editor/tool/rectangletool.js', 'infinity-editor/tool/ellipsetool.js',
    'infinity-editor/tool/polygontool.js', 'infinity-editor/tool/texttool.js',
    'infinity-editor/tool/pointertool.js', 'infinity-editor/tool/pagetool.js',
    'infinity-editor/tool/transformtool.js', 'infinity-editor/tool/slicetool.js',
    'infinity-editor/view/editorbackstage.js', 'infinity-editor/view/editorscenestage.js',
    'infinity-editor/view/editortoolstage.js', 'infinity-editor/view/editorfrontstage.js',
    'infinity-editor/view/editorview.js', 'infinity-editor/editor.js',
    'infinity-editor/editorpaintconfiguration.js', 'infinity-editor/i18n/i18n_en.js',
    'infinity-editor/i18n/i18n_de.js',
    'application/component/autoedit.js', 'application/component/panel.js',
    'application/component/patterntarget.js', 'application/component/colorbutton.js',
    'application/component/colorpanel.js', 'application/component/cornertype.js',
    'application/component/blendmode.js', 'application/component/unit.js',
    'application/component/gradienteditor.js', 'application/component/overlay.js',
    'application/component/pivot.js', 'application/component/stylepanel.js',
    'application/component/swatchpanel.js', 'application/component/menu.js',
    'application/component/menubar.js', 'application/component/menuitem.js',
    'application/component/menubutton.js', 'application/extension/action.js',
    'application/extension/colormatcher.js', 'application/extension/exporter.js',
    'application/extension/module.js', 'application/extension/view.js',
    'application/extension/palette.js', 'application/extension/panel.js',
    'application/extension/properties.js', 'application/extension/sidebar.js',
    'application/extension/storage.js', 'application/extension/styleentry.js',
    'application/extension/transformer.js', 'application/workspace/header.js',
    'application/workspace/palettes.js', 'application/workspace/panels.js',
    'application/workspace/sidebars.js', 'application/workspace/toolbar.js',
    'application/workspace/window.js', 'application/workspace/windows.js',
    'application/util/ciede2000.js', 'application/util/image.js',
    'application/util/selectors.js', 'application/shell.js', 'application/application.js',
    'application/document.js', 'application/bootstrap.js', 'application/i18n/i18n_en.js',
    'application/i18n/i18n_de.js',
    'gravitrdr/action/addlayeraction.js', 'gravitrdr/action/deletelayeraction.js',
    'gravitrdr/action/addpageaction.js', 'gravitrdr/action/alignaction.js',
    'gravitrdr/action/cloneaction.js', 'gravitrdr/action/closeaction.js',
    'gravitrdr/action/closeallaction.js', 'gravitrdr/action/copyaction.js',
    'gravitrdr/action/copyattributesaction.js', 'gravitrdr/action/cutaction.js',
    'gravitrdr/action/deleteaction.js', 'gravitrdr/action/deletepageaction.js',
    'gravitrdr/action/distributeaction.js', 'gravitrdr/action/duplicateaction.js',
    'gravitrdr/action/fitallaction.js', 'gravitrdr/action/fitcurrentlayeraction.js',
    'gravitrdr/action/fitcurrentpageaction.js', 'gravitrdr/action/fitselectionaction.js',
    'gravitrdr/action/groupaction.js', 'gravitrdr/action/placeimageaction.js',
    'gravitrdr/action/invertselectionaction.js', 'gravitrdr/action/layertypeaction.js',
    'gravitrdr/action/magnificationaction.js', 'gravitrdr/action/newaction.js',
    'gravitrdr/action/newwindowaction.js', 'gravitrdr/action/openaction.js',
    'gravitrdr/action/arrangeaction.js', 'gravitrdr/action/originalviewaction.js',
    'gravitrdr/action/pixelpreviewaction.js', 'gravitrdr/action/paintmodeaction.js',
    'gravitrdr/action/pasteaction.js', 'gravitrdr/action/pasteinplaceaction.js',
    'gravitrdr/action/pasteinsideaction.js', 'gravitrdr/action/pasteattributesaction.js',
    'gravitrdr/action/redoaction.js', 'gravitrdr/action/saveaction.js',
    'gravitrdr/action/saveallaction.js', 'gravitrdr/action/saveasaction.js',
    'gravitrdr/action/showrulersaction.js', 'gravitrdr/action/selectallaction.js',
    'gravitrdr/action/showallpagesaction.js', 'gravitrdr/action/showgridaction.js',
    'gravitrdr/action/slicefromselection.js', 'gravitrdr/action/snapunitaction.js',
    'gravitrdr/action/transformaction.js', 'gravitrdr/action/undoaction.js',
    'gravitrdr/action/ungroupaction.js', 'gravitrdr/action/zoominaction.js',
    'gravitrdr/action/zoomoutaction.js', 'gravitrdr/colormatcher/analogousmatcher.js',
    'gravitrdr/colormatcher/complementarymatcher.js', 'gravitrdr/exporter/imagexporter.js',
    'gravitrdr/palette/exportpalette.js', 'gravitrdr/palette/stylepalette.js',
    'gravitrdr/panel/propertiespanel.js', 'gravitrdr/panel/transformpanel.js',
    'gravitrdr/properties/documentproperties.js', 'gravitrdr/properties/polygonproperties.js',
    'gravitrdr/properties/pathproperties.js', 'gravitrdr/properties/rectangleproperties.js',
    'gravitrdr/properties/ellipseproperties.js', 'gravitrdr/properties/imageproperties.js',
    'gravitrdr/properties/infoproperties.js', 'gravitrdr/properties/pageproperties.js',
    'gravitrdr/properties/textproperties.js', 'gravitrdr/properties/sliceproperties.js',
    'gravitrdr/sidebar/pageslayerssidebar.js', 'gravitrdr/sidebar/stylesswatchessidebar.js',
    'gravitrdr/styleentry/patternpaintentry.js', 'gravitrdr/styleentry/areapaintentry.js',
    'gravitrdr/styleentry/fillpaintentry.js', 'gravitrdr/styleentry/strokepaintentry.js',
    'gravitrdr/styleentry/blurfilterentry.js', 'gravitrdr/styleentry/offsetveffectentry.js',
    'gravitrdr/styleentry/shadoweffectentry.js', 'gravitrdr/transformer/aligntransformer.js',
    'gravitrdr/transformer/adjusttransformer.js', 'gravitrdr/i18n/i18n_en.js',
    'gravitrdr/i18n/i18n_de.js', 'gravitrdr/gravitrdr.js',
  ];
  const sourceTags = sourceFiles.map(f => `<script src="${f}"></script>`).join('\n');

  return vendorTags + '\n' + sourceTags;
}

main();
