import { IFPathBase } from "@gravitrdr/infinity-core";
import { IFShapeEditor } from "./shapeeditor";
import { IFObject } from "@gravitrdr/infinity-core";
/**
 * A base editor for a base path
 * @param {IFPathBase} path the path this editor works on
 * @class IFPathBaseEditor
 * @extends IFShapeEditor
 * @constructor
 */
export function IFPathBaseEditor(path) {
  IFShapeEditor.call(this, path);
}
IFObject.inherit(IFPathBaseEditor, IFShapeEditor);

/** @override */
IFPathBaseEditor.prototype.toString = function () {
  return "[Object IFPathBaseEditor]";
};
