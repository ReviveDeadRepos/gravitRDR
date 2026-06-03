import { GEventTarget } from '@gravitrdr/infinity-core'
import { IFLocale } from '@gravitrdr/infinity-core'
import { GDocument } from '../document';
import { IFElement } from '@gravitrdr/infinity-core'

    /**
     * Base class for property panels
     * @class GProperties
     * @extends GEventTarget
     * @constructor
     */
export     function GProperties() {
    };

    /**
     * Called to return the category of the panel
     * @return {String|IFLocale.Key}
     */
    GProperties.prototype.getCategory = function () {
        throw new Error("Not Supported.");
    };

    /**
     * Called to initialize the properties panel
     * @param {JQuery} panel the panel to init on
     */
    GProperties.prototype.init = function (panel) {
        throw new Error("Not Supported.");
    };

    /**
     * Called to update
     * @param {GDocument} document the document to work on
     * @param {Array<IFElement>} elements array of elements, contains at least one
     * @return {Boolean} true if this properties panel is available, false if not
     */
    GProperties.prototype.update = function (document, elements) {
        throw new Error("Not Supported.");
    };

    /** @override */
    GProperties.prototype.toString = function () {
        return "[Object GProperties]";
    };
