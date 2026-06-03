import { IFImage } from '@gravitrdr/infinity-core';
import { IFShapeEditor } from './shapeeditor';
import { IFBlockEditor } from '../blockeditor';
import { IFObject } from '@gravitrdr/infinity-core'
import { IFElementEditor } from '../elementeditor';
import { IFInlineStyle } from '@gravitrdr/infinity-core'
    /**
     * A base editor for an image
     * @param {IFImage} image the image this editor works on
     * @class IFImageEditor
     * @extends IFShapeEditor
     * @constructor
     */
export     function IFImageEditor(image) {
        IFShapeEditor.call(this, image);
        this._flags |= IFBlockEditor.Flag.ResizeAll;
    };
    IFObject.inherit(IFImageEditor, IFShapeEditor);
    IFElementEditor.exports(IFImageEditor, IFImage);

    /** @override */
    IFImageEditor.prototype.initialSetup = function () {
        // Add an empty style to images by default
        this.getElement().getStyleSet().appendChild(new IFInlineStyle());
    };

    /** @override */
    IFImageEditor.prototype.toString = function () {
        return "[Object IFImageEditor]";
    };
