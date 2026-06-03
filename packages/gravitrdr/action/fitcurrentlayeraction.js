import { GAction } from '@gravitrdr/application'
import { IFObject } from '@gravitrdr/infinity-core'
import { IFLocale } from '@gravitrdr/infinity-core'
import { GApplication } from '@gravitrdr/application'

    /**
     * Action for fitting the current layer into the current view
     * @class GFitCurrentLayerAction
     * @extends GAction
     * @constructor
     */
export     function GFitCurrentLayerAction() {
    };
    IFObject.inherit(GFitCurrentLayerAction, GAction);

    GFitCurrentLayerAction.ID = 'view.zoom.fit-current-layer';
    GFitCurrentLayerAction.TITLE = new IFLocale.Key(GFitCurrentLayerAction, "title");

    /**
     * @override
     */
    GFitCurrentLayerAction.prototype.getId = function () {
        return GFitCurrentLayerAction.ID;
    };

    /**
     * @override
     */
    GFitCurrentLayerAction.prototype.getTitle = function () {
        return GFitCurrentLayerAction.TITLE;
    };

    /**
     * @override
     */
    GFitCurrentLayerAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_VIEW;
    };

    /**
     * @override
     */
    GFitCurrentLayerAction.prototype.getGroup = function () {
        return "zoom";
    };

    /**
     * @override
     */
    GFitCurrentLayerAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        var activeLayer = document ? document.getScene().getActiveLayer() : null;

        return (activeLayer && activeLayer.getPaintBBox() && !activeLayer.getPaintBBox().isEmpty());
    };

    /**
     * @override
     */
    GFitCurrentLayerAction.prototype.execute = function () {
        var document = gApp.getActiveDocument();
        if (!document) return;
        var activeLayer = document.getScene().getActiveLayer();
        var activeWindow = document.getActiveWindow();
        if (!activeWindow) return;
        activeWindow.getView().zoomAll(activeLayer.getPaintBBox(), false);
    };

    /** @override */
    GFitCurrentLayerAction.prototype.toString = function () {
        return "[Object GFitCurrentLayerAction]";
    };
