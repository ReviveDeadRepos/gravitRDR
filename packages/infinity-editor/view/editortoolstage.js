import { IFEditorView } from './editorview';
import { IFStage } from '@gravitrdr/infinity-core';
import { IFObject } from '@gravitrdr/infinity-core'
    /**
     * A stage for rendering the tools
     * @param {IFEditorView} view
     * @class IFEditorToolStage
     * @extends IFStage
     * @constructor
     */
export     function IFEditorToolStage(view) {
        IFStage.call(this, view);
    }
    IFObject.inherit(IFEditorToolStage, IFStage);

    /** @override */
    IFEditorToolStage.prototype.toString = function () {
        return "[Object IFEditorToolStage]";
    };
