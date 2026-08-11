import { GEvent } from "./event";
import { IFObject } from "../core/object";
/**
 * An object representing an input event.
 * @class GUIInputEvent
 * @extends GEvent
 * @constructor
 * @version 1.0
 */
export function GUIInputEvent() {}

IFObject.inherit(GUIInputEvent, GEvent);

/** @override */
GUIInputEvent.prototype.toString = function () {
  return "[Object GUIInputEvent(" + this._paramsToString() + ")]";
};

/** @private */
GUIInputEvent.prototype._paramsToString = function () {
  return "";
};
