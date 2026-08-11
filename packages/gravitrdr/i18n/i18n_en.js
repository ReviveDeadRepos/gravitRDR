import { ifLocale, IFLocale } from "@gravitrdr/infinity-core";
import { GAddLayerAction } from "../action/addlayeraction";
import { GAddPageAction } from "../action/addpageaction";
import { GAlignAction } from "../action/alignaction";
import { GCloneAction } from "../action/cloneaction";
import { GCloseAction } from "../action/closeaction";
import { GCloseAllAction } from "../action/closeallaction";
import { GCopyAction } from "../action/copyaction";
import { GCopyAttributesAction } from "../action/copyattributesaction";
import { GCutAction } from "../action/cutaction";
import { GDeleteAction } from "../action/deleteaction";
import { GDeleteLayerAction } from "../action/deletelayeraction";
import { GDeletePageAction } from "../action/deletepageaction";
import { GDistributeAction } from "../action/distributeaction";
import { GDuplicateAction } from "../action/duplicateaction";
import { GFitAllAction } from "../action/fitallaction";
import { GFitCurrentLayerAction } from "../action/fitcurrentlayeraction";
import { GFitCurrentPageAction } from "../action/fitcurrentpageaction";
import { GFitSelectionAction } from "../action/fitselectionaction";
import { GGroupAction } from "../action/groupaction";
import { GPlaceImageAction } from "../action/placeimageaction";
import { GInvertSelectionAction } from "../action/invertselectionaction";
import { GLayerTypeAction } from "../action/layertypeaction";
import { GNewAction } from "../action/newaction";
import { GNewWindowAction } from "../action/newwindowaction";
import { GOpenAction } from "../action/openaction";
import { GArrangeAction } from "../action/arrangeaction";
import { GOriginalViewAction } from "../action/originalviewaction";
import { GPaintModeAction } from "../action/paintmodeaction";
import { GPasteAction } from "../action/pasteaction";
import { GPasteInPlaceAction } from "../action/pasteinplaceaction";
import { GPasteInsideAction } from "../action/pasteinsideaction";
import { GPasteAttributesAction } from "../action/pasteattributesaction";
import { GPixelPreviewAction } from "../action/pixelpreviewaction";
import { GRedoAction } from "../action/redoaction";
import { GSaveAction } from "../action/saveaction";
import { GSaveAllAction } from "../action/saveallaction";
import { GSaveAsAction } from "../action/saveasaction";
import { GShowRulersAction } from "../action/showrulersaction";
import { GSelectAllAction } from "../action/selectallaction";
import { GShowAllPagesAction } from "../action/showallpagesaction";
import { GShowGridAction } from "../action/showgridaction";
import { GSliceFromSelectionAction } from "../action/slicefromselection";
import { GSnapUnitAction } from "../action/snapunitaction";
import { GTransformAction } from "../action/transformaction";
import { GUndoAction } from "../action/undoaction";
import { GUngroupAction } from "../action/ungroupaction";
import { GZoomInAction } from "../action/zoominaction";
import { GZoomOutAction } from "../action/zoomoutaction";
import { GAnalogousMatcher } from "../colormatcher/analogousmatcher";
import { GComplementaryMatcher } from "../colormatcher/complementarymatcher";
import { GExportPalette } from "../palette/exportpalette";
import { GStylePalette } from "../palette/stylepalette";
import { GPropertiesPanel } from "../panel/propertiespanel";
import { GTransformPanel } from "../panel/transformpanel";
import { GStylesSwatchesSidebar } from "../sidebar/stylesswatchessidebar";
import { GPagesLayersSidebar } from "../sidebar/pageslayerssidebar";
// Action
ifLocale.setValues(
  GAddLayerAction,
  IFLocale.Language.English,
  ["title"],
  ["Add Layer"],
);
ifLocale.setValues(
  GAddPageAction,
  IFLocale.Language.English,
  ["title"],
  ["Add Page"],
);
ifLocale.setValues(
  GAlignAction,
  IFLocale.Language.English,
  [
    "title.align-left",
    "title.align-center",
    "title.align-right",
    "title.align-top",
    "title.align-middle",
    "title.align-bottom",
    "title.align-justify-horizontal",
    "title.align-justify-vertical",
  ],
  [
    "Align Left",
    "Align Center",
    "Align Right",
    "Align Top",
    "Align Middle",
    "Align Bottom",
    "Justify Horizontal",
    "Justify Vertical",
  ],
);
ifLocale.setValues(
  GCloneAction,
  IFLocale.Language.English,
  ["title"],
  ["Clone"],
);
ifLocale.setValues(
  GCloseAction,
  IFLocale.Language.English,
  ["title"],
  ["Close"],
);
ifLocale.setValues(
  GCloseAllAction,
  IFLocale.Language.English,
  ["title"],
  ["Close All"],
);
ifLocale.setValues(GCopyAction, IFLocale.Language.English, ["title"], ["Copy"]);
ifLocale.setValues(
  GCopyAttributesAction,
  IFLocale.Language.English,
  ["title"],
  ["Copy Attributes"],
);
ifLocale.setValues(GCutAction, IFLocale.Language.English, ["title"], ["Cut"]);
ifLocale.setValues(
  GDeleteAction,
  IFLocale.Language.English,
  ["title"],
  ["Delete"],
);
ifLocale.setValues(
  GDeleteLayerAction,
  IFLocale.Language.English,
  ["title"],
  ["Delete Layer"],
);
ifLocale.setValues(
  GDeletePageAction,
  IFLocale.Language.English,
  ["title"],
  ["Delete Page"],
);
ifLocale.setValues(
  GDistributeAction,
  IFLocale.Language.English,
  ["title.horizontal", "title.vertical"],
  ["Distribute Horizontally", "Distribute Vertically"],
);
ifLocale.setValues(
  GDuplicateAction,
  IFLocale.Language.English,
  ["title"],
  ["Duplicate"],
);
ifLocale.setValues(
  GFitAllAction,
  IFLocale.Language.English,
  ["title"],
  ["Fit All"],
);
ifLocale.setValues(
  GFitCurrentLayerAction,
  IFLocale.Language.English,
  ["title"],
  ["Fit Layer"],
);
ifLocale.setValues(
  GFitCurrentPageAction,
  IFLocale.Language.English,
  ["title"],
  ["Fit Page"],
);
ifLocale.setValues(
  GFitSelectionAction,
  IFLocale.Language.English,
  ["title"],
  ["Fit Selection"],
);
ifLocale.setValues(
  GGroupAction,
  IFLocale.Language.English,
  ["title"],
  ["Group Selection"],
);
ifLocale.setValues(
  GPlaceImageAction,
  IFLocale.Language.English,
  ["title"],
  ["Place Image..."],
);
ifLocale.setValues(
  GInvertSelectionAction,
  IFLocale.Language.English,
  ["title"],
  ["Invert Selection"],
);
ifLocale.setValues(
  GLayerTypeAction,
  IFLocale.Language.English,
  ["title"],
  ["%name% Layer"],
);
ifLocale.setValues(
  GNewAction,
  IFLocale.Language.English,
  ["title"],
  ["New..."],
);
ifLocale.setValues(
  GNewWindowAction,
  IFLocale.Language.English,
  ["title"],
  ["New Window"],
);
ifLocale.setValues(
  GOpenAction,
  IFLocale.Language.English,
  ["title"],
  ["Open..."],
);
ifLocale.setValues(
  GArrangeAction,
  IFLocale.Language.English,
  [
    "title.send-front",
    "title.bring-forward",
    "title.send-backward",
    "title.send-back",
  ],
  ["Send To Front", "Bring Forward", "Send Backward", "Send To Back"],
);
ifLocale.setValues(
  GOriginalViewAction,
  IFLocale.Language.English,
  ["title"],
  ["Original-View"],
);
ifLocale.setValues(
  GPaintModeAction,
  IFLocale.Language.English,
  ["title"],
  ["%name% View"],
);
ifLocale.setValues(
  GPasteAction,
  IFLocale.Language.English,
  ["title"],
  ["Paste"],
);
ifLocale.setValues(
  GPasteInPlaceAction,
  IFLocale.Language.English,
  ["title"],
  ["Paste In Place"],
);
ifLocale.setValues(
  GPasteInsideAction,
  IFLocale.Language.English,
  ["title"],
  ["Paste Inside Selection"],
);
ifLocale.setValues(
  GPasteAttributesAction,
  IFLocale.Language.English,
  ["title"],
  ["Paste Attributes"],
);
ifLocale.setValues(
  GPixelPreviewAction,
  IFLocale.Language.English,
  ["title"],
  ["Pixel Preview"],
);
ifLocale.setValues(GRedoAction, IFLocale.Language.English, ["title"], ["Redo"]);
ifLocale.setValues(GSaveAction, IFLocale.Language.English, ["title"], ["Save"]);
ifLocale.setValues(
  GSaveAllAction,
  IFLocale.Language.English,
  ["title"],
  ["Save All"],
);
ifLocale.setValues(
  GSaveAsAction,
  IFLocale.Language.English,
  ["title"],
  ["Save As..."],
);
ifLocale.setValues(
  GShowRulersAction,
  IFLocale.Language.English,
  ["title"],
  ["Show Rulers"],
);
ifLocale.setValues(
  GSelectAllAction,
  IFLocale.Language.English,
  ["title"],
  ["Select All"],
);
ifLocale.setValues(
  GShowAllPagesAction,
  IFLocale.Language.English,
  ["title"],
  ["All Pages visible"],
);
ifLocale.setValues(
  GShowGridAction,
  IFLocale.Language.English,
  ["title"],
  ["Show Grid"],
);
ifLocale.setValues(
  GSliceFromSelectionAction,
  IFLocale.Language.English,
  ["title"],
  ["Create Slice from Selection"],
);
ifLocale.setValues(
  GSnapUnitAction,
  IFLocale.Language.English,
  ["title.full", "title.half"],
  ["Snap to full units", "Snap to half units"],
);
ifLocale.setValues(
  GTransformAction,
  IFLocale.Language.English,
  [
    "title.rotate-45-left",
    "title.rotate-90-left",
    "title.rotate-180-left",
    "title.rotate-45-right",
    "title.rotate-90-right",
    "title.rotate-180-right",
    "title.flip-vertical",
    "title.flip-horizontal",
  ],
  [
    "Rotate 45° Left",
    "Rotate 90° Left",
    "Rotate 180° Left",
    "Rotate 45° Right",
    "Rotate 90° Right",
    "Rotate 180° Right",
    "Flip Vertical",
    "Flip Horizontal",
  ],
);
ifLocale.setValues(GUndoAction, IFLocale.Language.English, ["title"], ["Undo"]);
ifLocale.setValues(
  GUngroupAction,
  IFLocale.Language.English,
  ["title"],
  ["Ungroup Selection"],
);
ifLocale.setValues(
  GZoomInAction,
  IFLocale.Language.English,
  ["title"],
  ["Zoom in"],
);
ifLocale.setValues(
  GZoomOutAction,
  IFLocale.Language.English,
  ["title"],
  ["Zoom out"],
);

// Color
ifLocale.setValues(
  GAnalogousMatcher,
  IFLocale.Language.English,
  ["title"],
  ["Analogous"],
);
ifLocale.setValues(
  GComplementaryMatcher,
  IFLocale.Language.English,
  ["title"],
  ["Complementary"],
);

// Palette
ifLocale.setValues(
  GExportPalette,
  IFLocale.Language.English,
  ["title"],
  ["Export"],
);
ifLocale.setValues(
  GStylePalette,
  IFLocale.Language.English,
  ["title"],
  ["Style"],
);

// Panel
ifLocale.setValues(
  GPropertiesPanel,
  IFLocale.Language.English,
  ["title"],
  ["Properties"],
);
ifLocale.setValues(
  GTransformPanel,
  IFLocale.Language.English,
  ["title"],
  ["Transform"],
);

// Sidebar
ifLocale.setValues(
  GStylesSwatchesSidebar,
  IFLocale.Language.English,
  ["title"],
  ["Styles & Swatches"],
);
ifLocale.setValues(
  GPagesLayersSidebar,
  IFLocale.Language.English,
  ["title"],
  ["Pages & Layers"],
);
