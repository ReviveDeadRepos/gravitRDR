import { GAction } from '@gravitrdr/application'
import { IFObject } from '@gravitrdr/infinity-core'
import { IFLocale } from '@gravitrdr/infinity-core'
import { GApplication } from '@gravitrdr/application'

    /**
     * Action closing all documents
     * @class GCloseAllAction
     * @extends GAction
     * @constructor
     */
export     function GCloseAllAction() {
    };
    IFObject.inherit(GCloseAllAction, GAction);

    GCloseAllAction.ID = 'file.close-all';
    GCloseAllAction.TITLE = new IFLocale.Key(GCloseAllAction, "title");

    /**
     * @override
     */
    GCloseAllAction.prototype.getId = function () {
        return GCloseAllAction.ID;
    };

    /**
     * @override
     */
    GCloseAllAction.prototype.getTitle = function () {
        return GCloseAllAction.TITLE;
    };

    /**
     * @override
     */
    GCloseAllAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_FILE;
    };

    /**
     * @override
     */
    GCloseAllAction.prototype.getGroup = function () {
        return "close";
    };

    /**
     * @override
     */
    GCloseAllAction.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /**
     * @override
     */
    GCloseAllAction.prototype.execute = function () {
        while (!!gApp.getActiveDocument()) {
            gApp.closeDocument(gApp.getActiveDocument());
        }
    };

    /** @override */
    GCloseAllAction.prototype.toString = function () {
        return "[Object GCloseAllAction]";
    };
