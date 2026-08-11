import { GAction } from "@gravitrdr/application";
import { IFObject } from "@gravitrdr/infinity-core";
import { IFLocale } from "@gravitrdr/infinity-core";
import { GApplication } from "@gravitrdr/application";

/**
 * Action for adding a new page
 * @class GAddPageAction
 * @extends GAction
 * @constructor
 */
export function GAddPageAction() {}
IFObject.inherit(GAddPageAction, GAction);

GAddPageAction.ID = "modify.add-page";
GAddPageAction.TITLE = new IFLocale.Key(GAddPageAction, "title");

/**
 * @override
 */
GAddPageAction.prototype.getId = function () {
  return GAddPageAction.ID;
};

/**
 * @override
 */
GAddPageAction.prototype.getTitle = function () {
  return GAddPageAction.TITLE;
};

/**
 * @override
 */
GAddPageAction.prototype.getCategory = function () {
  return GApplication.CATEGORY_MODIFY_PAGE;
};

/**
 * @override
 */
GAddPageAction.prototype.getGroup = function () {
  return "structure/modify";
};

/**
 * @override
 */
GAddPageAction.prototype.isEnabled = function () {
  return !!gApp.getActiveDocument();
};

/**
 * @override
 */
GAddPageAction.prototype.execute = function () {
  gApp.getActiveDocument().createNewPage();
};

/** @override */
GAddPageAction.prototype.toString = function () {
  return "[Object GAddPageAction]";
};
