import { IFSlice } from "@gravitrdr/infinity-core";
import { IFBlockEditor } from "../blockeditor";
import { IFObject } from "@gravitrdr/infinity-core";
import { IFElementEditor } from "../elementeditor";
/**
 * An editor for a slice
 * @param {IFSlice} slice the slice this editor works on
 * @class IFSliceEditor
 * @extends IFBlockEditor
 * @constructor
 */
export function IFSliceEditor(slice) {
  IFBlockEditor.call(this, slice);
  this._flags |= IFBlockEditor.Flag.ResizeAll;
}
IFObject.inherit(IFSliceEditor, IFBlockEditor);
IFElementEditor.exports(IFSliceEditor, IFSlice);

/** @override */
IFSliceEditor.prototype._prePaint = function (transform, context) {
  if (
    this.hasFlag(IFElementEditor.Flag.Selected) ||
    this.hasFlag(IFElementEditor.Flag.Highlighted)
  ) {
    this._paintBBoxOutline(transform, context);
  }
  IFBlockEditor.prototype._prePaint.call(this, transform, context);
};

/** @override */
IFSliceEditor.prototype.toString = function () {
  return "[Object IFSliceEditor]";
};
