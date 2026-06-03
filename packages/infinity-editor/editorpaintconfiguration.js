import { IFScenePaintConfiguration } from '@gravitrdr/infinity-core';
import { IFObject } from '@gravitrdr/infinity-core';
    /**
     * A paint configuration for editor painting
     * @class IFEditorPaintConfiguration
     * @constructor
     * @extends IFScenePaintConfiguration
     */
export     function IFEditorPaintConfiguration() {
    }

    IFObject.inherit(IFEditorPaintConfiguration, IFScenePaintConfiguration);

    /**
     * Whether to render pages or not
     * @type {Boolean}
     */
    IFEditorPaintConfiguration.prototype.pagesVisible = true;

    /**
     * Whether to render the grid or not if it is active
     * @type {Boolean}
     */
    IFEditorPaintConfiguration.prototype.gridVisible = true;

    /** @override */
    IFEditorPaintConfiguration.prototype.toString = function () {
        return "[Object IFEditorPaintConfiguration]";
    };
