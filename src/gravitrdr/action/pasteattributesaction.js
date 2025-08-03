(function (_) {

    /**
     * Action for pasting clipboard contents as attributes
     * @class GPasteAttributesAction
     * @extends GAction
     * @constructor
     */
    function GPasteAttributesAction() {
    };
    IFObject.inherit(GPasteAttributesAction, GAction);

    GPasteAttributesAction.ID = 'edit.paste-attributes';
    GPasteAttributesAction.TITLE = new IFLocale.Key(GPasteAttributesAction, "title");

    /**
     * @override
     */
    GPasteAttributesAction.prototype.getId = function () {
        return GPasteAttributesAction.ID;
    };

    /**
     * @override
     */
    GPasteAttributesAction.prototype.getTitle = function () {
        return GPasteAttributesAction.TITLE;
    };

    /**
     * @override
     */
    GPasteAttributesAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_EDIT;
    };

    /**
     * @override
     */
    GPasteAttributesAction.prototype.getGroup = function () {
        return "ccp_special";
    };

    /**
     * @override
     */
    GPasteAttributesAction.prototype.getShortcut = function () {
        return [IFKey.Constant.F4];
    };

    /**
     * @override
     */
    GPasteAttributesAction.prototype.isEnabled = function () {
        return false;
        /*
        var cpMimeTypes = gShell.getClipboardMimeTypes();
        if (cpMimeTypes && cpMimeTypes.indexOf(IFAttribute.MIME_TYPE) >= 0) {
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
        }
        return false;
        */
    };

    /**
     * @override
     */
    GPasteAttributesAction.prototype.execute = function () {
        var attributes = IFNode.deserialize(gShell.getClipboardContent(IFAttribute.MIME_TYPE));
        if (attributes) {
            var editor = gApp.getActiveDocument().getEditor();
            var selection = editor.getSelection();

            editor.beginTransaction();
            try {
                for (var i = 0; i < selection.length; ++i) {
                    var target = selection[i];
                    if (target.hasMixin(IFElement.Attributes)) {
                        target.getAttributes().assignAttributesFrom(attributes);
                    }
                }
            } finally {
                // TODO : I18N
                editor.commitTransaction('Paste Attributes');
            }
        }
    };

    /** @override */
    GPasteAttributesAction.prototype.toString = function () {
        return "[Object GPasteAttributesAction]";
    };

    _.GPasteAttributesAction = GPasteAttributesAction;
})(this);