import { IFSelectTool } from './selecttool';
import { IFObject } from '@gravitrdr/infinity-core'
    /**
     * The pointer selection tool
     * @class IFPointerTool
     * @extends IFSelectTool
     * @constructor
     * @version 1.0
     */
export     function IFPointerTool() {
        IFSelectTool.call(this);
    };

    IFObject.inherit(IFPointerTool, IFSelectTool);

    /** override */
    IFPointerTool.prototype.toString = function () {
        return "[Object IFPointerTool]";
    };
