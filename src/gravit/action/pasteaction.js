(function (_) {

    /**
     * Action for pasting clipboard contents into the center of active page
     * @class GPasteAction
     * @extends GAction
     * @constructor
     */
    function GPasteAction() {
    };
    IFObject.inherit(GPasteAction, GAction);

    GPasteAction.ID = 'edit.paste';
    GPasteAction.TITLE = new IFLocale.Key(GPasteAction, "title");

    /**
     * @override
     */
    GPasteAction.prototype.getId = function () {
        return GPasteAction.ID;
    };

    /**
     * @override
     */
    GPasteAction.prototype.getTitle = function () {
        return GPasteAction.TITLE;
    };

    /**
     * @override
     */
    GPasteAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_EDIT;
    };

    /**
     * @override
     */
    GPasteAction.prototype.getGroup = function () {
        return "ccp";
    };

    /**
     * @override
     */
    GPasteAction.prototype.getShortcut = function () {
        return [IFKey.Constant.META, 'V'];
    };

    /**
     * @override
     */
    GPasteAction.prototype.isEnabled = function () {
        if (document.activeElement && $(document.activeElement).is(":editable")) {
            return true;
        }

        var cpMimeTypes = gShell.getClipboardMimeTypes();
        if (cpMimeTypes && cpMimeTypes.indexOf(IFNode.MIME_TYPE) >= 0) {
            return !!gApp.getActiveDocument();
        }

        return false;
    };

    /**
     * @override
     */
    GPasteAction.prototype.execute = function () {
        if (document.activeElement && $(document.activeElement).is(":editable")) {
            document.execCommand('paste');
        } else {
            // TODO : Support pasting other formats like raster images
            var nodes = IFNode.deserialize(gShell.getClipboardContent(IFNode.MIME_TYPE));
            if (nodes && nodes.length > 0) {
                var elements = [];
                var editor = gApp.getActiveDocument().getEditor();
                var page = gApp.getActiveDocument().getScene().querySingle('page:active');
                var pageCntr = page.getGeometryBBox().getSide(IFRect.Side.CENTER);
                for (var i = 0; i < nodes.length; ++i) {
                    if (nodes[i] instanceof IFElement) {
                        var element = nodes[i];
                        var bbox = element.getGeometryBBox();
                        var elemCntr = bbox ? bbox.getSide(IFRect.Side.CENTER) : new IFPoint(0,0);

                        element.transform(new IFTransform(1, 0, 0, 1,
                            -elemCntr.getX() + pageCntr.getX(), -elemCntr.getY() + pageCntr.getY()));

                        elements.push(element);
                    }
                }

                if (elements.length > 0) {
                    editor.beginTransaction();
                    try {
                        editor.insertElements(elements, true, true);
                    } finally {
                        // TODO : I18N
                        editor.commitTransaction('Paste');
                    }
                }
            }
        }
    };

    /** @override */
    GPasteAction.prototype.toString = function () {
        return "[Object GPasteAction]";
    };

    _.GPasteAction = GPasteAction;
})(this);