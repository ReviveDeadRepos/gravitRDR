import { IFShapeSet } from '@gravitrdr/infinity-core';
import { IFBlockEditor } from '../blockeditor';
import { IFObject } from '@gravitrdr/infinity-core'
import { IFElementEditor } from '../elementeditor';
    /**
     * An editor for a shapeSet
     * @param {IFShapeSet} set the set this editor works on
     * @class IFShapeSetEditor
     * @extends IFBlockEditor
     * @constructor
     */
export     function IFShapeSetEditor(set) {
        IFBlockEditor.call(this, set);
        this._flags |= IFBlockEditor.Flag.ResizeAll;
    };
    IFObject.inherit(IFShapeSetEditor, IFBlockEditor);
    IFElementEditor.exports(IFShapeSetEditor, IFShapeSet);

    /** @override */
    IFShapeSetEditor.prototype._prePaint = function (transform, context) {
        if (this.hasFlag(IFElementEditor.Flag.Selected) || this.hasFlag(IFElementEditor.Flag.Highlighted)) {
            this._paintBBoxOutline(transform, context);
        }
        IFBlockEditor.prototype._prePaint.call(this, transform, context);
    };

    /** @override */
    IFShapeSetEditor.prototype.toString = function () {
        return "[Object IFShapeSetEditor]";
    };
