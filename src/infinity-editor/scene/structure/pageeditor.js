(function (_) {
    /**
     * An editor for a page
     * @param {IFShapeSet} group the group this editor works on
     * @class IFPageEditor
     * @extends IFBlockEditor
     * @constructor
     */
    function IFPageEditor(group) {
        IFBlockEditor.call(this, group);
        this._flags |= IFBlockEditor.Flag.ResizeAll;
    };
    IFObject.inherit(IFPageEditor, IFBlockEditor);
    IFPageEditor.exports(IFPageEditor, IFPage);

    /** @override */
    IFPageEditor.prototype.canApplyTransform = function () {
        // Page transforms can be applied only if the page doesn't
        // intersect with any other page
        if (this._transform && !this._transform.isIdentity() && !this.getElement().hasFlag(IFElement.Flag.Locked)) {
            var pageRect = this._transform.mapRect(new IFRect(
                this._element.getProperty('x'), this._element.getProperty('y'),
                this._element.getProperty('w'), this._element.getProperty('h')));

            if (this._element.getScene().willPageIntersectWithOthers(this._element, pageRect)) {
                return false;
            }

            return true;
        }
        return false;
    };

    /** @override */
    IFPageEditor.prototype.applyTransform = function () {
        if (this._transform && !this._transform.isIdentity()) {
            var pageRect = this._transform.mapRect(new IFRect(
                this._element.getProperty('x'), this._element.getProperty('y'),
                this._element.getProperty('w'), this._element.getProperty('h')));
            this._element.setProperties(['x', 'y', 'w', 'h'], [pageRect.getX(), pageRect.getY(), pageRect.getWidth(), pageRect.getHeight()]);
            this._transform = null;
        }
        this.resetTransform();
    };

    /** @override */
    IFPageEditor.prototype.acceptDrop = function (position, type, source, hitData) {
        if (IFBlockEditor.prototype.acceptDrop.call(this, position, type, source, hitData) === false) {
            // TODO : Make optional as most of the time this sucks
            /*
             // We can handle colors so check for a color
             if (type === IFElementEditor.DropType.Color) {
             this.getElement().setProperty('color', source ? source.asString() : null);
             return true;
             }
             */
        }
        return true;
    };

    /** @override */
    IFPageEditor.prototype._prePaint = function (transform, context) {
        if (this.hasFlag(IFElementEditor.Flag.Selected) || this.hasFlag(IFElementEditor.Flag.Highlighted)) {
            this._paintBBoxOutline(transform, context);
        }
        IFBlockEditor.prototype._prePaint.call(this, transform, context);
    };

    /** @override */
    IFPageEditor.prototype.toString = function () {
        return "[Object IFPageEditor]";
    };

    _.IFPageEditor = IFPageEditor;
})(this);