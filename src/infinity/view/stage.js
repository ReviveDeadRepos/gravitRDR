(function (_) {
    /**
     * A stage (layer) within a view
     * @param {IFView} view
     * @class IFStage
     * @constructor
     */
    function IFStage(view) {
        this._view = view;
        this._canvas = new IFPaintCanvas();
        this._paintContext = new IFPaintContext();
        this._paintContext.configuration = view.getViewConfiguration() ?
            view.getViewConfiguration() : new IFPaintConfiguration();
        this._paintContext.canvas = this._canvas;
        this._dirtyList = new IFDirtyList();
    }

    /**
     * @type {IFView}
     * @private
     */
    IFStage.prototype._view = null;

    /**
     * @type {IFPaintCanvas}
     * @private
     */
    IFStage.prototype._canvas = null;

    /**
     * @type {IFPaintContext}
     * @private
     */
    IFStage.prototype._paintContext = null;

    /**
     * @type IFDirtyList
     * @private
     */
    IFStage.prototype._dirtyList = null;

    /**
     * Id of next frame for repainting
     * @type {Number}
     * @private
     */
    IFStage.prototype._repaintRequestFrameId = null;

    IFStage.prototype.show = function () {
        this._canvas._canvasContext.canvas.style.visibility = '';
    };

    IFStage.prototype.hide = function () {
        this._canvas._canvasContext.canvas.style.visibility = 'hidden';
    };

    /**
     * Called to release the stage
     */
    IFStage.prototype.release = function () {
        // NO-OP
    };

    /**
     * Called to invalidate this paint widget or only a part of it
     * @param {IFRect} [area] the area to invalidate. If null (default),
     * then this clears the whole dirty areas and requests a full repaint
     * @return {Boolean} true if an invalidation ocurred, false if not
     * @version 1.0
     */
    IFStage.prototype.invalidate = function (area) {
        if (!area || area.isEmpty()) {
            // reset any previous dirty areas and add the whole view area
            this._dirtyList.reset();
            area = this._dirtyList.getArea();
        }

        if (area && this._dirtyList.dirty(area.getX(), area.getY(), area.getWidth(), area.getHeight())) {
            // Request a repaint for the next frame
            if (this._repaintRequestFrameId == null) {
                this._repaintRequestFrameId = ifPlatform.scheduleFrame(this._repaint.bind(this));
            }

            return true;
        }

        return false;
    };

    /**
     * Called whenever this widget should paint itself. Note that the canvas'
     * prepare / finish methods are automatically called and the clipping
     * region of the canvas is already set correctly.
     * @param {IFPaintContext} context the paint context to paint into
     * @private
     */
    IFStage.prototype.paint = function (context) {
        // NO-OP by default
    };

    /**
     * Called to resize this layer
     * @param {Number} width
     * @param {Number} height
     */
    IFStage.prototype.resize = function (width, height) {
        this._canvas.resize(width, height);
        this.updateViewArea();
    };

    /**
     * Called to update the view area
     */
    IFStage.prototype.updateViewArea = function () {
        var viewArea = new IFRect(0, 0, this._view.getWidth(), this._view.getHeight());
        if (!IFRect.equals(this._dirtyList.getArea(), viewArea)) {
            this._dirtyList.setArea(viewArea);
            this.invalidate();
        }
    };

    /**
     * Called to repaint all dirty regions
     * @private
     */
    IFStage.prototype._repaint = function () {
        // Get and flush existing dirty areas
        var dirtyListMatcher = this._dirtyList.flush();
        if (dirtyListMatcher != null) {
            // Prepare our canvas with the dirty rectangles
            this._canvas.prepare(dirtyListMatcher.getDirtyRectangles());

            // Prepare our paint context
            this._paintContext.dirtyMatcher = dirtyListMatcher;

            // Call our paint routine if any
            if (this.paint) {
                this.paint.call(this, this._paintContext);
            }

            // Finish canvas
            this._canvas.finish();
        }

        // Reset any repaint request id to free for the next call
        this._repaintRequestFrameId = null;
    };

    /** @override */
    IFStage.prototype.toString = function () {
        return "[Object IFStage]";
    };

    _.IFStage = IFStage;
})(this);