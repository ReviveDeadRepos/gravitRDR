import { GAction } from '@gravitrdr/application'
import { IFObject } from '@gravitrdr/infinity-core'
import { IFLocale } from '@gravitrdr/infinity-core'
import { GApplication } from '@gravitrdr/application'

    /**
     * Action for switching between pixel-mode and vector mode
     * @class GPixelPreviewAction
     * @extends GAction
     * @constructor
     */
export     function GPixelPreviewAction() {
    };
    IFObject.inherit(GPixelPreviewAction, GAction);

    GPixelPreviewAction.ID = 'view.pixel-preview';
    GPixelPreviewAction.TITLE = new IFLocale.Key(GPixelPreviewAction, 'title');

    /**
     * @override
     */
    GPixelPreviewAction.prototype.getId = function () {
        return GPixelPreviewAction.ID;
    };

    /**
     * @override
     */
    GPixelPreviewAction.prototype.getTitle = function () {
        return GPixelPreviewAction.TITLE;
    };

    /**
     * @override
     */
    GPixelPreviewAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_VIEW;
    };

    /**
     * @override
     */
    GPixelPreviewAction.prototype.getGroup = function () {
        return "render";
    };

    /** @override */
    GPixelPreviewAction.prototype.isCheckable = function () {
        return true;
    };

    /**
     * @override
     */
    GPixelPreviewAction.prototype.isChecked = function () {
        var window = gApp.getWindows().getActiveWindow();
        if (window) {
            return window.getView().getViewConfiguration().pixelMode;
        }
        return false;
    };

    /**
     * @override
     */
    GPixelPreviewAction.prototype.isEnabled = function () {
        return !!gApp.getWindows().getActiveWindow();
    };

    /**
     * @override
     */
    GPixelPreviewAction.prototype.execute = function () {
        var window = gApp.getWindows().getActiveWindow();
        if (!window) return;
        var view = window.getView();
        view.getViewConfiguration().pixelMode = !view.getViewConfiguration().pixelMode;
        view.invalidate();
    };

    /** @override */
    GPixelPreviewAction.prototype.toString = function () {
        return "[Object GPixelPreviewAction]";
    };
