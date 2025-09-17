(function (_) {
    var SVG_CHESSBOARD_CSS_URL = 'url("data:image/svg+xml;base64,' +
        btoa('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="white"/><rect width="4" height="4" fill="#CDCDCD"/><rect x="4" y="4" width="4" height="4" fill="#CDCDCD"/></svg>') +
        '")';

    /**
     * A base class for patterns like color, gradients, etc.
     * @mixin IFGradient
     * @extends IFObject
     * @constructor
     */
    function IFPattern() {
    }

    IFObject.inherit(IFPattern, IFObject);

    /**
     * The type of the pattern
     * @enum
     */
    IFPattern.Type = {
        Color: 'C',
        Gradient: 'G',
        Texture: 'T',
        Noise: 'N'
    };

    /**
     * Pattern's mime-type
     * @type {string}
     */
    IFPattern.MIME_TYPE = "application/infinity+pattern";

    /**
     * Compares if two patterns are equal or not
     * @param {IFPattern} left
     * @param {IFPattern} right
     * @return {Boolean}
     */
    IFPattern.equals = function (left, right) {
        if (!left && left === right) {
            return true;
        } else if (left && right) {
            if (left instanceof IFColor && right instanceof IFColor) {
                return IFColor.equals(left, right);
            } else if (left instanceof IFGradient && right instanceof IFGradient) {
                return IFGradient.equals(left, right);
            }
        }
        return false;
    };

    /**
     * Parse a pattern string
     * @param string
     * @returns {IFPattern}
     */
    IFPattern.parsePattern = function (string) {
        if (string && string.length > 0) {
            var type = string.charAt(0);
            string = string.substring(1);
            if (type === IFPattern.Type.Color) {
                return IFColor.parseColor(string);
            } else if (type === IFPattern.Type.Gradient) {
                return IFGradient.parseGradient(string);
            }
        }
        return null;
    };

    /**
     * Convert a pattern into a string
     * @param pattern
     * @returns {String}
     */
    IFPattern.asString = function (pattern) {
        if (pattern) {
            return pattern.getPatternType() + pattern.asString();
        }
        return null;
    };

    IFPattern.asCSSBackground = function (pattern) {
        var result = SVG_CHESSBOARD_CSS_URL;
        if (pattern) {
            switch (pattern.getPatternType()) {
                case IFPattern.Type.Color:
                    result = 'linear-gradient(' + pattern.asCSSString() + ', ' + pattern.asCSSString() + '), ' + result;
                    break;
                case IFPattern.Type.Gradient:
                    result = pattern.asCSSBackgroundString() + ', ' + result;
                    break;
            }
        }
        return result;
    };

    /**
     * Returns the pattern type
     * @return {IFPattern.Type}
     */
    IFPattern.prototype.getPatternType = function () {
        throw new Error('Not supported');
    };

    _.IFPattern = IFPattern;
})(this);