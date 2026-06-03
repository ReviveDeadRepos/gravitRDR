import { IFItem } from "../item";
import { IFNode } from "../node";
import { IFElement } from "../element";
import { IFLayer } from "../structure/layer";
import { IFBlock } from "../block";
/**
 * The base for a groups
 * @class IFShapeSet
 * @extends IFItem
 * @mixes IFNode.Container
 * @mixes IFElement.Transform
 * @constructor
 */
export function IFShapeSet() {
  IFItem.call(this);
}
IFNode.inheritAndMix("shapeSet", IFShapeSet, IFItem, [
  IFNode.Container,
  IFElement.Transform,
]);

/** @override */
IFShapeSet.prototype.validateInsertion = function (parent, reference) {
  return parent instanceof IFLayer || parent instanceof IFShapeSet;
};

/** @override */
IFShapeSet.prototype._detailHitTest = function (
  location,
  transform,
  tolerance,
  force,
) {
  return new IFBlock.HitResult(this);
};
