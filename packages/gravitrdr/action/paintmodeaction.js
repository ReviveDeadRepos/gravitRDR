import { GAction } from "@gravitrdr/application";
import { IFObject } from "@gravitrdr/infinity-core";
import { IFLocale, ifLocale } from "@gravitrdr/infinity-core";
import { IFScenePaintConfiguration } from "@gravitrdr/infinity-core";
import { GApplication } from "@gravitrdr/application";

/**
 * Action for changing paint mode in the current view
 * @class GPaintModeAction
 * @extends GAction
 * @constructor
 */
export function GPaintModeAction(paintMode) {
  this._paintMode = paintMode;
}
IFObject.inherit(GPaintModeAction, GAction);

GPaintModeAction.ID = "view.page.decoration";
GPaintModeAction.TITLE = new IFLocale.Key(GPaintModeAction, "title");

/**
 * @type {IFScenePaintConfiguration.PaintMode}
 * @private
 */
GPaintModeAction.prototype._paintMode = null;

/**
 * @override
 */
GPaintModeAction.prototype.getId = function () {
  return GPaintModeAction.ID + "." + this._paintMode;
};

/**
 * @override
 */
GPaintModeAction.prototype.getTitle = function () {
  return ifLocale
    .get(GPaintModeAction.TITLE)
    .replace(
      "%name%",
      ifLocale.get(IFScenePaintConfiguration.PaintModeName[this._paintMode]),
    );
};

/**
 * @override
 */
GPaintModeAction.prototype.getCategory = function () {
  return GApplication.CATEGORY_VIEW;
};

/**
 * @override
 */
GPaintModeAction.prototype.getGroup = function () {
  return "paint-mode";
};

/** @override */
GPaintModeAction.prototype.isCheckable = function () {
  return true;
};

/**
 * @override
 */
GPaintModeAction.prototype.isChecked = function () {
  var window = gApp.getWindows().getActiveWindow();
  if (window) {
    return (
      window.getView().getViewConfiguration().paintMode === this._paintMode
    );
  }
  return false;
};

/**
 * @override
 */
GPaintModeAction.prototype.isEnabled = function () {
  return !!gApp.getWindows().getActiveWindow();
};

/**
 * @override
 */
GPaintModeAction.prototype.execute = function () {
  var window = gApp.getWindows().getActiveWindow();
  if (!window) return;
  var view = window.getView();
  view.getViewConfiguration().paintMode = this._paintMode;
  view.invalidate();
};

/** @override */
GPaintModeAction.prototype.toString = function () {
  return "[Object GPaintModeAction]";
};
