(function (_) {
    /**
     * The base for a tool
     * @class IFTool
     * @extends IFObject
     * @constructor
     * @version 1.0
     */
    function IFTool() {
    }

    IFObject.inherit(IFTool, IFObject);

    // -----------------------------------------------------------------------------------------------------------------
    // IFTool Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * The manager creating and owning this tool
     * @type {IFToolManager}
     * @private
     */
    IFTool.prototype._manager = null;

    /**
     * The current docuument the tool is activated on, may be null for none
     * @type {IFScene}
     * @private
     */
    IFTool.prototype._scene = null;

    /**
     * The current editor view the tool is activated on, may be null for none
     * @type {IFEditorView}
     * @private
     */
    IFTool.prototype._view = null;

    /**
     * The current graphic editor the tool is activated on, may be null for none
     * @type {IFEditor}
     * @private
     */
    IFTool.prototype._editor = null;

    /**
     * Should return the current cursor for this tool.
     * If you need to update the cursor, simply call updateCursor()
     * @returns {String}
     * @see IFCursor
     * @version 1.0
     */
    IFTool.prototype.getCursor = function () {
        return IFCursor.Default;
    };

    /**
     * Called when this tool got activated for a given view
     * @param {IFEditorView} view the editor view the tool got activated for
     */
    IFTool.prototype.activate = function (view) {
        this._scene = view ? view.getScene() : null;
        this._view = view;
        this._editor = view.getEditor();
    };

    /**
     * Called when this tool got deactivated for it's current view
     * @param {IFEditorView} view the editor view the tool got deactivated for
     */
    IFTool.prototype.deactivate = function (view) {
        if (view.getScene() != this._scene || view != this._view) {
            throw new Error("Not supposed to happen");
        }
        this._scene = null;
        this._view = null;
        this._editor = null;
    };

    /**
     * Should return whether the tool can currently be
     * safely deactivated by calling it's deactivate()
     * function or not (i.e. while drawing)
     * @return {Boolean}
     * @version 1.0
     */
    IFTool.prototype.isDeactivatable = function () {
        // Always deactivable by default
        return true;
    };

    /**
     * Called when this tool should paint itself.
     * @param {IFPaintContext} context
     * @version 1.0
     */
    IFTool.prototype.paint = function (context) {
        // NO-OP
    };

    /**
     * Descendant classes should call this to update their cursor
     * @version 1.0
     */
    IFTool.prototype.updateCursor = function () {
        if (this._manager && this == this._manager.getActiveTool()) {
            this._manager._updateActiveToolCursor();
        }
    };

    /**
     * Descendant classes should call this to invalidate and
     * request a repaint of a certain area
     * @param {IFRect} [area] the area of invalidation, if not provided
     * or null, invalidates the whole area
     * @version 1.0
     */
    IFTool.prototype.invalidateArea = function (area) {
        if (this._manager && this == this._manager.getActiveTool()) {
            this._manager._invalidateActiveToolArea(area);
        }
    };

    /**
     * This may return to supress context menu because
     * the tool handles right clicking differently
     */
    IFTool.prototype.catchesContextMenu = function () {
        return false;
    };

    /** override */
    IFTool.prototype.toString = function () {
        return "[Object IFTool]";
    };

    _.IFTool = IFTool;
})(this);