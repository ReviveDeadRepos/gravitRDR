(function (_) {
    /**
     * The pan tool
     * @class IFHandTool
     * @extends IFTool
     * @constructor
     * @version 1.0
     */
    function IFHandTool() {
        IFTool.call(this);
    }

    IFObject.inherit(IFHandTool, IFTool);

    /**
     * @type {Boolean}
     * @private
     */
    IFHandTool.prototype._panning = false;

    /** @override */
    IFHandTool.prototype.getCursor = function () {
        return this._panning ? IFCursor.HandClosed : IFCursor.HandOpen;
    };

    /** @override */
    IFHandTool.prototype.activate = function (view) {
        IFTool.prototype.activate.call(this, view);

        view.addEventListener(GUIMouseEvent.DragStart, this._mouseDragStart, this);
        view.addEventListener(GUIMouseEvent.Drag, this._mouseDrag, this);
        view.addEventListener(GUIMouseEvent.DragEnd, this._mouseDragEnd, this);
    };

    /** @override */
    IFHandTool.prototype.deactivate = function (view) {
        IFTool.prototype.deactivate.call(this, view);

        view.removeEventListener(GUIMouseEvent.DragStart, this._mouseDragStart);
        view.removeEventListener(GUIMouseEvent.Drag, this._mouseDrag);
        view.removeEventListener(GUIMouseEvent.DragEnd, this._mouseDragEnd);
    };

    /** @override */
    IFHandTool.prototype.isDeactivatable = function () {
        // cannot deactivate while dragging
        return this._panning ? false : true;
    };

    /**
     * @param {GUIMouseEvent.DragStart} event
     * @private
     */
    IFHandTool.prototype._mouseDragStart = function (event) {
        this._panning = true;
        this.updateCursor();
    };

    /**
     * @param {GUIMouseEvent.Drag} event
     * @private
     */
    IFHandTool.prototype._mouseDrag = function (event) {
        if (this._panning) {
            this._view.scrollBy(-event.clientDelta.getX(), -event.clientDelta.getY());
        }
    };

    /**
     * @param {GUIMouseEvent.DragEnd} event
     * @private
     */
    IFHandTool.prototype._mouseDragEnd = function (event) {
        if (this._panning) {
            this._panning = false;
            this.updateCursor();
        }
    };

    /** override */
    IFHandTool.prototype.toString = function () {
        return "[Object IFHandTool]";
    };

    _.IFHandTool = IFHandTool;
})(this);