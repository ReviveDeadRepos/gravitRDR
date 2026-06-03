import { IFStyleEntry } from "./styleentry";
import { IFObject } from "../../core/object";
import { IFVertexSource } from "../../vertex/vertexsource";

/**
 * A base for vector effects
 * @class IFVEffectEntry
 * @extends IFStyleEntry
 * @constructor
 */
export function IFVEffectEntry() {
  IFStyleEntry.call(this);
}

IFObject.inherit(IFVEffectEntry, IFStyleEntry);

/**
 * @param {IFVertexSource} source the source vertices this
 * filter should be applied to
 * @return {IFVertexSource} a new vertex source with the
 * vector effect applied
 */
IFVEffectEntry.prototype.createEffect = function (source) {
  throw new Error("Not Supported");
};

/** @override */
IFVEffectEntry.prototype.toString = function () {
  return "[IFVEffectEntry]";
};
