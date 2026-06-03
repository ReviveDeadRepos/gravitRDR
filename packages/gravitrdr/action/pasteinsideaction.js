import { GAction } from '@gravitrdr/application'
import { IFObject } from '@gravitrdr/infinity-core'
import { IFLocale } from '@gravitrdr/infinity-core'
import { GApplication } from '@gravitrdr/application'
import { IFKey } from '@gravitrdr/infinity-core'
import { IFNode } from '@gravitrdr/infinity-core'
import { IFElement } from '@gravitrdr/infinity-core'
import { IFRect } from '@gravitrdr/infinity-core'
import { IFPoint } from '@gravitrdr/infinity-core'
import { IFTransform } from '@gravitrdr/infinity-core'

    /**
     * Action for pasting clipboard contents into selection
     * @class GPasteInsideAction
     * @extends GAction
     * @constructor
     */
export     function GPasteInsideAction() {
    };
    IFObject.inherit(GPasteInsideAction, GAction);

    GPasteInsideAction.ID = 'edit.paste-inside';
    GPasteInsideAction.TITLE = new IFLocale.Key(GPasteInsideAction, "title");

    /**
     * @override
     */
    GPasteInsideAction.prototype.getId = function () {
        return GPasteInsideAction.ID;
    };

    /**
     * @override
     */
    GPasteInsideAction.prototype.getTitle = function () {
        return GPasteInsideAction.TITLE;
    };

    /**
     * @override
     */
    GPasteInsideAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_EDIT;
    };

    /**
     * @override
     */
    GPasteInsideAction.prototype.getGroup = function () {
        return "ccp";
    };

    /**
     * @override
     */
    GPasteInsideAction.prototype.getShortcut = function () {
        return [IFKey.Constant.SHIFT, IFKey.Constant.META, 'V'];
    };

    /**
     * @override
     */
    GPasteInsideAction.prototype.isEnabled = function () {
        var cpMimeTypes = window.window.gShell.getClipboardMimeTypes();
        if (cpMimeTypes && cpMimeTypes.indexOf(IFNode.MIME_TYPE) >= 0) {
            var document = gApp.getActiveDocument();
            if (document) {
                var selection = document.getEditor().getSelection();
                if (selection) {
                    for (var i = 0; i < selection.length; ++i) {
                        if (selection[i].hasMixin(IFNode.Container)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    };

    /**
     * @override
     */
    GPasteInsideAction.prototype.execute = function () {
        var nodes = IFNode.deserialize(window.window.gShell.getClipboardContent(IFNode.MIME_TYPE));
        if (nodes && nodes.length > 0) {
            var elements = [];
            for (var i = 0; i < nodes.length; ++i) {
                if (nodes[i] instanceof IFElement) {
                    elements.push(nodes[i]);
                }
            }

            if (elements.length > 0) {
                var editor = gApp.getActiveDocument().getEditor();
                var selection = editor.getSelection();
                var newSelection = [];

                editor.beginTransaction();
                try {
                    for (var i = 0; i < selection.length; ++i) {
                        var target = selection[i];
                        if (!target.hasMixin(IFNode.Container)) {
                            continue;
                        }

                        var insertGroup = [];
                        for (var k = 0; k < elements.length; ++k) {
                            if (elements[k].validateInsertion(target)) {
                                insertGroup.push(elements[k].clone());
                            }
                        }

                        var groupBBox = IFElement.prototype.getGroupGeometryBBox(insertGroup);
                        var groupCntr = groupBBox ? groupBBox.getSide(IFRect.Side.CENTER) : new IFPoint(0,0);
                        var targBBox = target instanceof IFElement ? target.getGeometryBBox() : null;
                        var targCntr = targBBox ? targBBox.getSide(IFRect.Side.CENTER) : new IFPoint(0,0);
                        for (var k = 0; k < insertGroup.length; ++k) {
                            insertGroup[k].transform(new IFTransform(1, 0, 0, 1,
                                -groupCntr.getX() + targCntr.getX(), -groupCntr.getY() + targCntr.getY()));
                            target.appendChild(insertGroup[k]);
                            newSelection.push(insertGroup[k]);

                        }
                    }

                    editor.updateSelection(false, newSelection);
                } finally {
                    // TODO : I18N
                    editor.commitTransaction('Paste Inside');
                }
            }
        }
    };

    /** @override */
    GPasteInsideAction.prototype.toString = function () {
        return "[Object GPasteInsideAction]";
    };
