(function (_) {

    /**
     * A fill paint
     * @class IFFillPaint
     * @extends IFAreaPaint
     * @constructor
     */
    function IFFillPaint() {
        IFAreaPaint.call(this);
    }

    IFNode.inherit('fillPaint', IFFillPaint, IFAreaPaint);

    /** @override */
    IFFillPaint.prototype.hitTest = function (source, location, transform, tolerance) {
        var vertexHit = new IFVertexInfo.HitResult();
        if (ifVertexInfo.hitTest(location.getX(), location.getY(), new IFVertexTransformer(source, transform), tolerance, true, vertexHit)) {
            return new IFStyle.HitResult(this, vertexHit);
        }
        return null;
    };

    /** @override */
    IFFillPaint.prototype.paint = function (canvas, bbox) {
        var pattern = this._createPaintPattern(canvas);
        if (pattern) {
            var patternTransform = this._getPaintPatternTransform(bbox);
            if (patternTransform) {
                var oldTransform = canvas.setTransform(canvas.getTransform(true).preMultiplied(patternTransform));
                canvas.fillVertices(pattern, this.$opc, this.$blm);
                canvas.setTransform(oldTransform);
            } else {
                canvas.fillVertices(pattern, this.$opc, this.$blm);
            }
        }
    };

    /** @override */
    IFFillPaint.prototype.toString = function () {
        return "[IFFillPaint]";
    };

    _.IFFillPaint = IFFillPaint;
})(this);