(function (_) {
    /**
     * The bezigon tool
     * @class IFBezigonTool
     * @extends IFPathTool
     * @constructor
     * @version 1.0
     */
    function IFBezigonTool() {
        IFPathTool.call(this);
    }

    IFObject.inherit(IFBezigonTool, IFPathTool);

    /** @override */
    IFBezigonTool.prototype.activate = function (view) {
        IFPathTool.prototype.activate.call(this, view);
        view.addEventListener(GUIMouseEvent.Drag, this._mouseDrag, this);
        view.addEventListener(GUIMouseEvent.Move, this._mouseMove, this);
        this._checkMode();
    };

    /** @override */
    IFBezigonTool.prototype.deactivate = function (view) {
        IFPathTool.prototype.deactivate.call(this, view);
        view.removeEventListener(GUIMouseEvent.Drag, this._mouseDrag);
        view.removeEventListener(GUIMouseEvent.Move, this._mouseMove);
    };

    /**
     * @param {GUIMouseEvent.Down} event
     * @private
     */
    IFBezigonTool.prototype._mouseDown = function (event) {
        var tm = new Date().getTime();
        if (tm - this._mDownTime < IFPathTool.DBLCLICKTM) {
            // Double-click
            this._mouseDblClick(event);
            return;
        }

        this._mDownTime = tm;
        this._lastMouseEvent = event;
        var anchorPt = null;
        var clickPt;
        this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
        this._dragStarted = false;
        this._dragStartPt = null;
        this._newPoint = null;
        this._editPt = null;

        if (event.button == GUIMouseEvent.BUTTON_LEFT ||
            event.button == GUIMouseEvent.BUTTON_RIGHT && ifPlatform.modifiers.optionKey) {
            this._released = false;

            this._blockDeactivation();
            this._checkMode();
            this._renewPreviewLink();

            if (this._mode == IFPathTool.Mode.Edit) {
                var customizer = function(anchorPt) {
                    if (ifPlatform.modifiers.optionKey &&
                            anchorPt.getProperty('tp') != IFPathBase.AnchorPoint.Type.Connector) {

                        anchorPt.setProperty('tp', IFPathBase.AnchorPoint.Type.Symmetric);
                    }
                }
                this._mouseDownOnEdit(event, customizer);
            }

            if (this._mode != IFPathTool.Mode.Edit) {
                clickPt = this._constrainIfNeeded(event.client, this._view.getWorldTransform(), this._pathRef);
                var otherPt;
                if (this._pathEditor) {
                    if (this._mode == IFPathTool.Mode.Append) {
                        otherPt = this._pathRef.getAnchorPoints().getFirstChild();
                    } else { // this._mode == IFPathTool.Mode.Prepend
                        otherPt = this._pathRef.getAnchorPoints().getLastChild();
                    }
                }

                if (otherPt && this._pathEditor.hitAnchorPoint(otherPt, clickPt, this._view.getWorldTransform(), this._scene.getProperty('pickDist'))) {
                    this._setCursorForPosition(IFCursor.PenEnd);
                    this._startTransaction(IFPathTool.Transaction.ModifyPathProperties);
                    // Close path
                    this._pathRef.setProperty('closed', true);
                    this._makePointMajor(otherPt);
                    this._pathEditor.setActiveExtendingMode(false);
                    this._mode = IFPathTool.Mode.Edit;
                    this._editPt = this._pathEditor.getPathPointPreview(otherPt);
                    this._pathEditor.requestInvalidation();
                } else {
                    this._setCursorForPosition(IFCursor.Pen);
                    var prevPt;
                    if (this._pathEditor) {
                        if (this._mode == IFPathTool.Mode.Append) {
                            prevPt = this._pathRef.getAnchorPoints().getLastChild();
                        } else { // this._mode == IFPathTool.Mode.Prepend
                            prevPt = this._pathRef.getAnchorPoints().getFirstChild();
                        }
                    }
                    if (prevPt && this._pathEditor.hitAnchorPoint(prevPt, clickPt, this._view.getWorldTransform(), this._scene.getProperty('pickDist'))) {
                        this._makePointMajor(prevPt);
                        this._editPt = this._pathEditor.getPathPointPreview(prevPt);
                        this._pathEditor.requestInvalidation();
                    } else {
                        // add new point
                        var pt = this._view.getViewTransform().mapPoint(clickPt);
                        this._editor.getGuides().beginMap();
                        pt = this._editor.getGuides().mapPoint(pt);
                        this._editor.getGuides().finishMap();
                        anchorPt = this._constructNewPoint(event, pt);
                        this._addPoint(anchorPt, true, false);
                    }
                }
            }
        }
    };

    /**
     * @param {GUIMouseEvent.Move} event
     * @private
     */
    IFBezigonTool.prototype._mouseMove = function (event) {
        if (!this._released) {
            if (event.button == GUIMouseEvent.BUTTON_RIGHT && ifPlatform.modifiers.optionKey) {
                this._mouseDrag(event);
            }
            return;
        }

        this._lastMouseEvent = event;
        this._setCursorForPosition(null, event.client);
    };

    /**
     * @param {GUIMouseEvent.Drag | GUIMouseEvent.Move} event
     * @private
     */
    IFBezigonTool.prototype._mouseDrag = function (event) {
        if (this._refPt && !this._released) {
            this._makePointMajor(this._refPt);
            this._editPt = this._pathEditor.getPathPointPreview(this._refPt);
            this._dragStartPt = this._refPt;
            this._pathEditor.requestInvalidation();
            this._refPt = null;
        }
        if (this._editPt && !this._released) {
            this._lastMouseEvent = event;
            this._dragStarted = true;
            this._pathEditor.requestInvalidation();
            var newPos = this._updatePoint(event.client);
            var otherPt;
            if (this._newPoint ||
                this._pathRef.getAnchorPoints().getFirstChild() != this._pathRef.getAnchorPoints().getLastChild()) {

                if (this._editPt == this._dpathRef.getAnchorPoints().getLastChild()) {
                    otherPt = this._pathRef.getAnchorPoints().getFirstChild();
                } else if (this._editPt == this._dpathRef.getAnchorPoints().getFirstChild()) {
                    otherPt = this._pathRef.getAnchorPoints().getLastChild();
                }

                if (otherPt && this._pathEditor.hitAnchorPoint(otherPt, newPos, this._view.getWorldTransform(), this._scene.getProperty('pickDist'))) {
                    this._setCursorForPosition(IFCursor.PenEnd);
                } else {
                    this._setCursorForPosition(IFCursor.Pen);
                }
            } else {
                this._setCursorForPosition(IFCursor.Pen);
            }

            this._pathEditor.requestInvalidation();
        }
        //this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
    };

    /**
     * Constructs new point, specific to Bezigon Tool, with the given position
     * @param {GUIMouseEvent} event used to define pressed button
     * @param {IFPoint} pt - coordinates to be used for new position in world system
     * @returns {IFPath.AnchorPoint} newly created anchor point
     * @private
     */
    IFBezigonTool.prototype._constructNewPoint = function (event, pt) {
        var anchorPt = new IFPath.AnchorPoint();
        anchorPt.setProperties(['x', 'y', 'ah'], [pt.getX(), pt.getY(), true]);

        if (event.button == GUIMouseEvent.BUTTON_LEFT) {
            if (ifPlatform.modifiers.optionKey) {
                anchorPt.setProperty('tp', IFPathBase.AnchorPoint.Type.Symmetric);
            } else {
                anchorPt.setProperty('tp', IFPathBase.AnchorPoint.Type.Asymmetric);
            }
        } else { // BUTTON_RIGHT && this._AltDown
            anchorPt.setProperty('tp', IFPathBase.AnchorPoint.Type.Connector);
        }

        return anchorPt;
    };

    /**
     * For Append and Prepend mode checks if a point, newly added to preview, is the path other end point.
     * And if so, closes the path specific for Bezigon Tool way, and removes that extra point from preview.
     * @private
     */
    IFBezigonTool.prototype._closeIfNeeded = function () {
        if (this._pathRef &&
            (this._newPoint ||
                this._pathRef.getAnchorPoints().getFirstChild() != this._pathRef.getAnchorPoints().getLastChild()) &&
            (this._mode == IFPathTool.Mode.Append || this._mode == IFPathTool.Mode.Prepend)) {

            var anchorPt;
            var otherPt;
            if (this._mode == IFPathTool.Mode.Append) {
                anchorPt = this._dpathRef.getAnchorPoints().getLastChild();
                otherPt = this._pathRef.getAnchorPoints().getFirstChild();
            } else { // this._mode == IFPathTool.Mode.Prepend
                anchorPt = this._dpathRef.getAnchorPoints().getFirstChild();
                otherPt = this._pathRef.getAnchorPoints().getLastChild();
            }

            var location = new IFPoint(anchorPt.getProperty('x'), anchorPt.getProperty('y'));
            var transform = this._pathRef.getTransform();
            location = transform ? transform.mapPoint(location) : location;

            if (otherPt && this._pathEditor.hitAnchorPoint(otherPt, location, null, this._scene.getProperty('pickDist')) ) {
                if (this._transactionType == IFPathTool.Transaction.NoTransaction) {
                    this._startTransaction(IFPathTool.Transaction.ModifyPathProperties);
                } else {
                    this._transactionType = IFPathTool.Transaction.ModifyPathProperties;
                }
                // Close path
                this._pathRef.beginUpdate();
                this._pathEditor.selectOnePoint(otherPt);
                if (ifPlatform.modifiers.optionKey) {
                    otherPt.setProperties(['ah', 'tp'], [false, IFPathBase.AnchorPoint.Type.Asymmetric]);
                }
                if (!otherPt.getProperty('ah')) {
                    otherPt.setProperties(['hlx', 'hly'], [anchorPt.getProperty('hlx'), anchorPt.getProperty('hly')]);
                }
                this._dpathRef.getAnchorPoints().removeChild(anchorPt);
                if (!this._newPoint) {
                    if (this._mode == IFPathTool.Mode.Append) {
                        anchorPt = this._pathRef.getAnchorPoints().getLastChild();
                    } else { // this._mode == IFPathTool.Mode.Prepend
                        anchorPt = this._pathRef.getAnchorPoints().getFirstChild();
                    }
                    this._pathRef.getAnchorPoints().removeChild(anchorPt);
                }
                this._dpathRef.setProperty('closed', true);
                this._pathRef.setProperty('closed', true);
                this._pathRef.endUpdate();
                this._pathEditor.requestInvalidation();
                this._pathEditor.setActiveExtendingMode(false);
                this._newPoint = false;
            }
        }
    };

    /** @override */
    IFBezigonTool.prototype._mouseRelease = function (event) {
        if (!this._released) {
            try {
                this._released = true;
                //this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
                if (this._mode == IFPathTool.Mode.Append || this._mode == IFPathTool.Mode.Prepend) {
                    var newPos = this._updatePoint(event.client);
                    this._closeIfNeeded();
                    if (this._pathRef.getProperty('closed')) {
                        this._setCursorForPosition(IFCursor.PenMinus);
                        this._mode = IFPathTool.Mode.Edit;
                    } else if (this._newPoint) {
                        this._addPoint(this._editPt, false, true);
                        this._setCursorForPosition(IFCursor.Pen);
                    } else if (this._editPt) {
                        if (this._transactionType == IFPathTool.Transaction.NoTransaction) {
                            this._startTransaction(IFPathTool.Transaction.MovePoint);
                        }
                        this._pathEditor.applyTransform(this._pathRef);
                        this._setCursorForPosition(IFCursor.PenEnd);
                    }
                    this._commitChanges();
                    // hit test result becomes invalid if any;
                    //this._lastHitTest = new IFPathTool.LastHitTest();
                } else if (this._mode == IFPathTool.Mode.Edit && (this._editPt || this._refPt)) {
                    if (this._dragStarted && this._editPt) {
                        var newPos = this._updatePoint(event.client);
                        if (this._transactionType == IFPathTool.Transaction.NoTransaction) {
                            this._startTransaction(IFPathTool.Transaction.MovePoint);
                        }
                        this._pathEditor.applyTransform(this._pathRef);
                        this._setCursorForPosition(null, newPos);
                        this._commitChanges();
                        // hit test result becomes invalid if any;
                        //this._lastHitTest = new IFPathTool.LastHitTest();
                    } else {
                        if (this._editPt) { // The case when path has just been closed on mouseDown
                            this._commitChanges();
                        } else { // this._refPt
                            this._mouseNoDragReleaseOnEdit(event.client);
                        }
                    }
                }
                this._dragStarted = false;
                this._dragStartPt = null;
            } finally {
                this._finishTransaction();
            }
        }
        this._lastMouseEvent = null;

        this._allowDeactivation();
    };

    /** override */
    IFBezigonTool.prototype.toString = function () {
        return "[Object IFBezigonTool]";
    };

    _.IFBezigonTool = IFBezigonTool;
})(this);
