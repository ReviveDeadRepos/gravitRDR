import { GAction } from "@gravitrdr/application";
import { IFObject } from "@gravitrdr/infinity-core";
import { IFLocale } from "@gravitrdr/infinity-core";
import { GApplication } from "@gravitrdr/application";
import { IFKey } from "@gravitrdr/infinity-core";
import { IFView } from "@gravitrdr/infinity-core";
import { IFRect } from "@gravitrdr/infinity-core";
import { IFPoint } from "@gravitrdr/infinity-core";

/**
 * Action for zooming into the current view
 * @class GZoomInAction
 * @extends GAction
 * @constructor
 */
export function GZoomInAction() {}
IFObject.inherit(GZoomInAction, GAction);

GZoomInAction.ID = "view.zoom.in";
GZoomInAction.TITLE = new IFLocale.Key(GZoomInAction, "title");
GZoomInAction.ZOOM_STEP = 2.0;

/**
 * @override
 */
GZoomInAction.prototype.getId = function () {
  return GZoomInAction.ID;
};

/**
 * @override
 */
GZoomInAction.prototype.getTitle = function () {
  return GZoomInAction.TITLE;
};

/**
 * @override
 */
GZoomInAction.prototype.getCategory = function () {
  return GApplication.CATEGORY_VIEW_MAGNIFICATION;
};

/**
 * @override
 */
GZoomInAction.prototype.getGroup = function () {
  return "zoom/magnification";
};

/**
 * @override
 */
GZoomInAction.prototype.getShortcut = function () {
  return [IFKey.Constant.META, "+"];
};

/**
 * @override
 */
GZoomInAction.prototype.isEnabled = function () {
  var window = gApp.getWindows().getActiveWindow();
  var view = window ? window.getView() : null;
  return view && view.getZoom() < IFView.options.maxZoomFactor;
};

/**
 * @override
 */
GZoomInAction.prototype.execute = function () {
  var window = gApp.getWindows().getActiveWindow();
  if (!window) return;
  var view = window.getView();
  var newZoom = view.getZoom() * GZoomInAction.ZOOM_STEP;
  var scene = view.getScene();
  var zoomPoint = null;
  if (scene.getProperty("singlePage")) {
    var pageBBox = scene.getActivePage().getGeometryBBox();
    if (pageBBox && !pageBBox.isEmpty()) {
      zoomPoint = pageBBox.getSide(IFRect.Side.CENTER);
    }
  }
  if (!zoomPoint) {
    zoomPoint = view
      .getViewTransform()
      .mapPoint(new IFPoint(view.getWidth() / 2.0, view.getHeight() / 2.0));
  }
  view.zoomAt(zoomPoint, newZoom);
};

/** @override */
GZoomInAction.prototype.toString = function () {
  return "[Object GZoomInAction]";
};
