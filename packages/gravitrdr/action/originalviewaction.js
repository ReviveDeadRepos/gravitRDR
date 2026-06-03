import { GAction } from '@gravitrdr/application'
import { IFObject } from '@gravitrdr/infinity-core'
import { IFLocale } from '@gravitrdr/infinity-core'
import { GApplication } from '@gravitrdr/application'
import { IFKey } from '@gravitrdr/infinity-core'
import { IFRect } from '@gravitrdr/infinity-core'
import { IFPoint } from '@gravitrdr/infinity-core'

    /**
     * Action for reseting the current view to the original view
     * @class GOriginalViewAction
     * @extends GAction
     * @constructor
     */
export     function GOriginalViewAction() {
    };
    IFObject.inherit(GOriginalViewAction, GAction);

    GOriginalViewAction.ID = 'view.zoom.original';
    GOriginalViewAction.TITLE = new IFLocale.Key(GOriginalViewAction, "title");

    /**
     * @override
     */
    GOriginalViewAction.prototype.getId = function () {
        return GOriginalViewAction.ID;
    };

    /**
     * @override
     */
    GOriginalViewAction.prototype.getTitle = function () {
        return GOriginalViewAction.TITLE;
    };

    /**
     * @override
     */
    GOriginalViewAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_VIEW;
    };

    /**
     * @override
     */
    GOriginalViewAction.prototype.getGroup = function () {
        return "zoom";
    };

    /**
     * @override
     */
    GOriginalViewAction.prototype.getShortcut = function () {
        return [IFKey.Constant.META, '0'];
    };

    /**
     * @override
     */
    GOriginalViewAction.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /**
     * @override
     */
    GOriginalViewAction.prototype.execute = function () {
        var document = gApp.getActiveDocument();
        if (!document) return;
        var paintBBox = document.getScene().getPaintBBox();
        var activeWindow = document.getActiveWindow();
        if (!activeWindow) return;
        activeWindow.getView().zoomAtCenter(paintBBox && !paintBBox.isEmpty() ? paintBBox.getSide(IFRect.Side.CENTER) : new IFPoint(0, 0), 1.0);
    };

    /** @override */
    GOriginalViewAction.prototype.toString = function () {
        return "[Object GOriginalViewAction]";
    };
