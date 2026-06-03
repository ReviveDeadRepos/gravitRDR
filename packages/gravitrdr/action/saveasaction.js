import { GAction } from '@gravitrdr/application'
import { IFObject } from '@gravitrdr/infinity-core'
import { IFLocale } from '@gravitrdr/infinity-core'
import { GApplication } from '@gravitrdr/application'
import { IFKey } from '@gravitrdr/infinity-core'
import { GStorage } from '@gravitrdr/application'

    /**
     * Action saving a document filed under a name
     * @class GSaveAsAction
     * @extends GAction
     * @constructor
     */
export     function GSaveAsAction() {
    };
    IFObject.inherit(GSaveAsAction, GAction);

    GSaveAsAction.ID = 'file.save-as';
    GSaveAsAction.TITLE = new IFLocale.Key(GSaveAsAction, "title");

    /**
     * @override
     */
    GSaveAsAction.prototype.getId = function () {
        return GSaveAsAction.ID;
    };

    /**
     * @override
     */
    GSaveAsAction.prototype.getTitle = function () {
        return GSaveAsAction.TITLE;
    };

    /**
     * @override
     */
    GSaveAsAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_FILE;
    };

    /**
     * @override
     */
    GSaveAsAction.prototype.getGroup = function () {
        return 'file';
    };

    /**
     * @override
     */
    GSaveAsAction.prototype.getShortcut = function () {
        return [IFKey.Constant.SHIFT, IFKey.Constant.META, 'S'];
    };

    /**
     * @override
     */
    GSaveAsAction.prototype.isEnabled = function () {
        return !!this._getViableStorage() && !!gApp.getActiveDocument();
    };

    /**
     * @override
     */
    GSaveAsAction.prototype.execute = function () {
        gApp.saveDocumentAs(this._getViableStorage(), gApp.getActiveDocument());
    };

    /**
     * @returns {GStorage}
     * @private
     */
    GSaveAsAction.prototype._getViableStorage = function () {
        for (var i = 0; i < gravitrdr.storages.length; ++i) {
            var storage = gravitrdr.storages[i];
            if (storage.isAvailable() && storage.isPrompting() && storage.isSaving()) {
                var extensions = storage.getExtensions();
                if (!extensions || extensions.isEmpty() || extensions.indexOf('gravitrdr') >= 0) {
                    return storage;
                }
            }
        }
        return null;
    };

    /** @override */
    GSaveAsAction.prototype.toString = function () {
        return "[Object GSaveAsAction]";
    };
