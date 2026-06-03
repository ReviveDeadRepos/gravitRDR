import { IFBlock } from './block';
import { IFObject } from '../core/object';
    /**
     * The base for items like shapes and groups
     * @class IFItem
     * @extends IFBlock
     * @constructor
     */
export     function IFItem() {
        IFBlock.call(this);
    }
    IFObject.inherit(IFItem, IFBlock);
