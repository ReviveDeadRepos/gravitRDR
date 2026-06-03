import { IFAppliedStyle } from './appliedstyle';
import { IFNode } from '../node';

    /**
     * The inline style class
     * @class IFInlineStyle
     * @extends IFAppliedStyle
     * @mixes IFNode.Container
     * @constructor
     */
export     function IFInlineStyle() {
        IFAppliedStyle.call(this);
    }

    IFNode.inheritAndMix('style', IFInlineStyle, IFAppliedStyle, [IFNode.Container]);

    /** @override */
    IFInlineStyle.prototype.toString = function () {
        return "[IFInlineStyle]";
    };
