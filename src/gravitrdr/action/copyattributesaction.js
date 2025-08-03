(function (_) {

    /**
     * Action for copying the current selection's attributes to the clipboard
     * @class GCopyAttributesAction
     * @extends GAction
     * @constructor
     */
    function GCopyAttributesAction() {
    };
    IFObject.inherit(GCopyAttributesAction, GAction);

    GCopyAttributesAction.ID = 'edit.copy-attributes';
    GCopyAttributesAction.TITLE = new IFLocale.Key(GCopyAttributesAction, "title");

    /**
     * @override
     */
    GCopyAttributesAction.prototype.getId = function () {
        return GCopyAttributesAction.ID;
    };

    /**
     * @override
     */
    GCopyAttributesAction.prototype.getTitle = function () {
        return GCopyAttributesAction.TITLE;
    };

    /**
     * @override
     */
    GCopyAttributesAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_EDIT;
    };

    /**
     * @override
     */
    GCopyAttributesAction.prototype.getGroup = function () {
        return "ccp_special";
    };

    /**
     * @override
     */
    GCopyAttributesAction.prototype.getShortcut = function () {
        return [IFKey.Constant.SHIFT, IFKey.Constant.F4];
    };

    /**
     * @override
     */
    GCopyAttributesAction.prototype.isEnabled = function () {
        return false;
        /*
        var document = gApp.getActiveDocument();
        if (document) {
            var selection = document.getEditor().getSelection();
            if (selection) {
                for (var i = 0; i < selection.length; ++i) {
                    if (selection[i].hasMixin(IFElement.Attributes)) {
                        return true;
                    }
                }
            }
        }
        return false;*/
    };

    /**
     * @override
     */
    GCopyAttributesAction.prototype.execute = function () {
        var selection = gApp.getActiveDocument().getEditor().getSelection();
        for (var i = 0; i < selection.length; ++i) {
            if (selection[i].hasMixin(IFElement.Attributes)) {
                var attributes = selection[i].getAttributes();
                if (attributes && attributes.hasMixin(IFNode.Container) && attributes.getFirstChild()) {
                    var serializedAttributes = IFNode.serialize(attributes);
                    gShell.setClipboardContent(IFAttribute.MIME_TYPE, serializedAttributes);
                    break;
                }
            }
        }
    };

    /** @override */
    GCopyAttributesAction.prototype.toString = function () {
        return "[Object GCopyAttributesAction]";
    };

    _.GCopyAttributesAction = GCopyAttributesAction;
})(this);