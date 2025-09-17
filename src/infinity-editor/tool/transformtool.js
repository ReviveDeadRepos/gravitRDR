(function (_) {
    /**
     * The transform tool
     * @class IFTransformTool
     * @extends IFSelectTool
     * @constructor
     * @version 1.0
     */
    function IFTransformTool() {
        IFSelectTool.call(this);
    };

    IFObject.inherit(IFTransformTool, IFSelectTool);

    /** @override */
    IFTransformTool.prototype.activate = function (view) {
        IFSelectTool.prototype.activate.call(this, view);

        // If there's no available selection, select the pointer tool instead
        var selection = view.getEditor().getSelection();
        if (!selection || selection.length === 0) {
            this._manager.activateTool(IFPointerTool);
        } else {
            this._openTransformBox();
        }
    };

    /** @override */
    IFTransformTool.prototype._mouseDblClick = function () {
        // no-op, just disallow any actions on double click as this would
        // do things we don't want in transform mode
    };

    /** override */
    IFTransformTool.prototype.toString = function () {
        return "[Object IFTransformTool]";
    };

    _.IFTransformTool = IFTransformTool;
})(this);