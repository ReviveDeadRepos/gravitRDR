(function (_) {

    /**
     * A shadow effect
     * @class IFShadowEffect
     * @extends IFEffectEntry
     * @constructor
     */
    function IFShadowEffect() {
        IFEffectEntry.call(this);
        this._setDefaultProperties(IFShadowEffect.GeometryProperties, IFShadowEffect.VisualProperties);
    }

    IFNode.inherit('shadowEffect', IFShadowEffect, IFEffectEntry);

    /**
     * Geometry properties
     */
    IFShadowEffect.GeometryProperties = {
        // Inner shadow or not (drop shadow)
        in: false,
        // The radius of the shadow
        r: 5,
        // The horizontal shift of the shadow
        x: 0,
        // The vertical shift of the shadow
        y: 0
    };

    /**
     * Visual properties
     */
    IFShadowEffect.VisualProperties = {
        // The color of the shadow
        cls: IFColor.parseCSSColor('rgba(0,0,0,0.5)')
    };

    /** @override */
    IFShadowEffect.prototype.getPadding = function () {
        return [this.$r - this.$x, this.$r - this.$y, this.$r + this.$x, this.$r + this.$y];
    };

    /** @override */
    IFShadowEffect.prototype.isPost = function () {
        return this.$in ? true : false;
    };

    /** @override */
    IFShadowEffect.prototype.render = function (canvas, contents, scale) {
        // Fill our whole canvas with the shadow color
        canvas.fillCanvas(this.$cls);

        var x = this.$x * scale;
        var y = this.$y * scale;
        var r = this.$r * scale;

        // Paint shadow now
        if (this.$in) {
            canvas.drawCanvas(contents, x, y, 1, IFPaintCanvas.CompositeOperator.DestinationOut);
            canvas.getBitmap().blur(r);
            canvas.drawCanvas(contents, 0, 0, 1, IFPaintCanvas.CompositeOperator.DestinationIn);
        } else {
            // Drop shadow
            canvas.drawCanvas(contents, x, y, 1, IFPaintCanvas.CompositeOperator.DestinationIn);
            canvas.getBitmap().blur(r);
        }
    };

    /** @override */
    IFShadowEffect.prototype.store = function (blob) {
        if (IFEffectEntry.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFShadowEffect.GeometryProperties);
            this.storeProperties(blob, IFShadowEffect.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'cls') {
                        return value.asString();
                    }
                }
                return value;
            });
            return true;
        }
        return false;
    };

    /** @override */
    IFShadowEffect.prototype.restore = function (blob) {
        if (IFEffectEntry.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFShadowEffect.GeometryProperties);
            this.restoreProperties(blob, IFShadowEffect.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'cls') {
                        return IFColor.parseColor(value);
                    }
                }
            });
            return true;
        }
        return false;
    };

    /** @override */
    IFShadowEffect.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, IFShadowEffect.GeometryProperties);
        this._handleVisualChangeForProperties(change, args, IFShadowEffect.VisualProperties);
        IFEffectEntry.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFShadowEffect.prototype.toString = function () {
        return "[IFShadowEffect]";
    };

    _.IFShadowEffect = IFShadowEffect;
})(this);