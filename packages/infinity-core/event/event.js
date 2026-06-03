import { IFObject } from "../core/object";
/**
 * An object representing an event.
 * @class GEvent
 * @extends IFObject
 * @constructor
 * @version 1.0
 */
export function GEvent() {}

IFObject.inherit(GEvent, IFObject);

/** @private */
GEvent.prototype._paramsToString = function () {
  return "";
};
