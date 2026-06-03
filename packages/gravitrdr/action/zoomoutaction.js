import { GAction } from '@gravitrdr/application'
import { IFObject } from '@gravitrdr/infinity-core'
import { IFLocale } from '@gravitrdr/infinity-core'
import { GApplication } from '@gravitrdr/application'
import { IFKey } from '@gravitrdr/infinity-core'
import { IFView } from '@gravitrdr/infinity-core'
import { IFRect } from '@gravitrdr/infinity-core'
import { IFPoint } from '@gravitrdr/infinity-core'

    /**
     * Action for zooming out of the current view
     * @class GZoomOutAction
     * @extends GAction
     * @constructor
     */
export     function GZoomOutAction() {
    };
    IFObject.inherit(GZoomOutAction, GAction);

    GZoomOutAction.ID = 'zoom.out';
    GZoomOutAction.TITLE = new IFLocale.Key(GZoomOutAction, "title");
    GZoomOutAction.ZOOM_STEP = 2.0;

    /**
     * @override
     */
    GZoomOutAction.prototype.getId = function () {
        return GZoomOutAction.ID;
    };

    /**
     * @override
     */
    GZoomOutAction.prototype.getTitle = function () {
        return GZoomOutAction.TITLE;
    };

    /**
     * @override
     */
    GZoomOutAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_VIEW_MAGNIFICATION;
    };

    /**
     * @override
     */
    GZoomOutAction.prototype.getGroup = function () {
        return "zoom/magnification";
    };

    /**
     * @override
     */
    GZoomOutAction.prototype.getShortcut = function () {
        return [IFKey.Constant.META, '-'];
    };

    /**
     * @override
     */
    GZoomOutAction.prototype.isEnabled = function () {
        var window = gApp.getWindows().getActiveWindow();
        var view = window ? window.getView() : null;
        return view && view.getZoom() > IFView.options.minZoomFactor;
    };

    /**
     * @override
     */
    GZoomOutAction.prototype.execute = function () {
        var window = gApp.getWindows().getActiveWindow();
        if (!window) return;
        var view = window.getView();
        var newZoom = view.getZoom() / GZoomOutAction.ZOOM_STEP;
        var scene = view.getScene();
        var zoomPoint = null;
        if (scene.getProperty('singlePage')) {
            var pageBBox = scene.getActivePage().getGeometryBBox();
            if (pageBBox && !pageBBox.isEmpty()) {
                zoomPoint = pageBBox.getSide(IFRect.Side.CENTER);
            }
        }
        if (!zoomPoint) {
            zoomPoint = view.getViewTransform().mapPoint(new IFPoint(view.getWidth() / 2.0, view.getHeight() / 2.0));
        }
        view.zoomAt(zoomPoint, newZoom);
    };

    /** @override */
    GZoomOutAction.prototype.toString = function () {
        return "[Object GZoomOutAction]";
    };
