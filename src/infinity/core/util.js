(function (_) {

    /**
     * @class IFUtil
     * @constructor
     * @version 1.0
     */
    function IFUtil() {
    };

    /**
     * This is equal to the Array.indexOf function except that for
     * comparing the values in the array, the ifUtil.equals function
     * is used instead
     * @param {Array} array the array to get an index for an element
     * @param {*} element the element to get the index for
     * @param {Boolean} [objectByValue] if set, objects are compared by their value and
     * not by their reference. Defaults to false if not provided.
     * @return {Number} a value less than zero if element is not found or
     * the index of the given element in the given array
     */
    IFUtil.prototype.indexOfEquals = function (array, element, objectByValue) {
        for (var i = 0; i < array.length; ++i) {
            if (this.equals(array[i], element, objectByValue)) {
                return i;
            }
        }
        return -1;
    };

    /**
     * Compare two objects for equality by their values. Also takes care of null parameters.
     * If the function can not compare the type by value then it'll return false as if
     * the two parameters wouldn't be equal.
     * Currently supported types: Object, Boolean, Number, String, Array, Date, IFRect, IFPoint, IFTransform.
     * For objects this will iterate only the object's own properties to an unnested deepness so
     * take care in using this function for highly complex object structures.
     * For numbers, the epsilon comparison will be used so that very small differences in numbers
     * are considered equal to compensate for any floating point errors
     * @param {*} left left side of comparison
     * @param {*} right right side of comparison
     * @param {Boolean} [objectByValue] if set, objects are compared by their value and
     * not by their reference. Defaults to false if not provided.
     * @return {Boolean} true if left and right are equal (also if they're null!)
     */
    IFUtil.prototype.equals = function (left, right, objectByValue) {
        if (!left && left === right) {
            return true;
        } else if (left && right) {
            // Check for special 'equals' function
            if (left.constructor.equals || right.constructor.equals) {
                if (left.constructor === right.constructor) {
                    return left.constructor.equals(left, right);
                } else {
                    return false;
                }
            } else if (left instanceof Date || right instanceof Date) {
                return left instanceof Date && right instanceof Date ? (+left == +right) : false;
            } else if (left instanceof Array || right instanceof Array) {
                if (left instanceof Array && right instanceof Array) {
                    if (left.length !== right.length) {
                        return false;
                    }

                    for (var i = 0; i < left.length; ++i) {
                        if (!this.equals(left[i], right[i], objectByValue)) {
                            return false;
                        }
                    }

                    return true;
                } else {
                    return false;
                }
            } else {
                var leftType = typeof left;
                var rightType = typeof right;

                if (leftType !== rightType) {
                    return false;
                }

                if (leftType === 'number') {
                    if (isNaN(left) || isNaN(right)) {
                        return isNaN(left) && isNaN(right);
                    } else {
                        return ifMath.isEqualEps(left, right);
                    }
                } else if (leftType === 'string') {
                    return left.localeCompare(right) === 0;
                } else if (leftType === 'boolean') {
                    return (+left == +right);
                } else if (leftType === 'object') {
                    if (!objectByValue) {
                        return left === right;
                    } else {
                        var leftKeys = Object.keys(left);
                        var rightKeys = Object.keys(right);

                        if (!this.equals(leftKeys, rightKeys, objectByValue)) {
                            return false;
                        }

                        for (var i = 0; i < leftKeys.length; ++i) {
                            if (!this.equals(left[leftKeys[i]], right[leftKeys[i]]), objectByValue) {
                                return false;
                            }
                        }

                        return true;
                    }
                } else {
                    return false;
                }
            }
        } else {
            return false;
        }
    };

    /**
     * Checks if a given array contains at least one key
     * of a given object
     * @param {Array<*>} array
     * @param {*} object
     */
    IFUtil.prototype.containsObjectKey = function (array, object) {
        for (var key in object) {
            if (array.indexOf(key) >= 0) {
                return true;
            }
        }
        return false;
    };

    var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

    /**
     * Generate an unique id
     * @param {Number} [len] the desired length of the uid, defaults to 32
     * @returns {String} more or less unique id depending on the desired length
     */
    IFUtil.prototype.uuid = function (len) {
        var chars = CHARS, uuid = [], i;
        var radix = chars.length;
        var len = len ? len : 32;
        for (i = 0; i < len; i++) {
            uuid[i] = chars[0 | Math.random() * radix];
        }
        return uuid.join('');
    };

    /**
     * Replace all occurrences of a string with another string
     * @param {String} string the string to replace within
     * @param {String} what_ the string to look for
     * @param {String} with_ the string to replace with
     * @returns {String}
     */
    IFUtil.prototype.replaceAll = function (string, what_, with_) {
        var result = string;
        while (result.indexOf(what_) >= 0) {
            result = result.replace(what_, with_);
        }
        return result;
    };

    // Makes unique sort of array elements, leaving only the elements from [a,b] segment
    // New array is written into newnums
    IFUtil.prototype.uSortSegment = function (a, b, nums, newnums) {
        var nElms = 0;
        nums.sort(function (s, k) {
            return s - k;
        });

        if (nums[0] >= a && nums[0] <= b) {
            newnums[0] = nums[0];
            nElms = 1;

            if (nums.length == 1) {
                return nElms;
            }
        }

        for (var i = 1; i < nums.length; i++) {
            if (nums[i] != nums[i - 1] && nums[i] >= a && nums[i] <= b) {
                newnums.push(nums[i]);
                ++nElms;
            }
        }

        return nElms;
    };

    /**
     * Escape an unescaped html string
     * @param {String} html
     * @returns {String}
     */
    IFUtil.prototype.escape = function (html) {
        return html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    };

    /**
     * Unscape an escaped html string
     * @param {String} html
     * @returns {String}
     */
    IFUtil.prototype.unescape = function (html) {
        var result = ifUtil.replaceAll(html, "&lt;", '<');
        result = ifUtil.replaceAll(result, "&gt;", '>');
        result = ifUtil.replaceAll(result, "&quot;", '"');
        result = ifUtil.replaceAll(result, "&#039;", "'");
        result = ifUtil.replaceAll(result, "&amp;", '&');
        return result;
    };

    /**
     * Checks and returns whether a given string is numeric or not
     * @param {string} string
     * @returns {boolean}
     */
    IFUtil.prototype.isNumeric = function (string) {
        // parseFloat NaNs numeric-cast false positives (null|true|false|"")
        // ...but misinterprets leading-number strings, particularly hex literals ("0x...")
        // subtraction forces infinities to NaN
        return string - parseFloat(string) >= 0;
    };

    /**
     * Format a number into a string
     * @param {Number} number the number to format
     * @param {Number} [decimalPlaces] the number of decimal places,
     * defaults to 3
     * @param {String} [decimalSeparator] the decimal separator to use,
     * if not provided defaults to ','
     * @returns {string}
     */
    IFUtil.prototype.formatNumber = function (number, decimalPlaces, decimalSeparator) {
        decimalSeparator = decimalSeparator || ',';
        decimalPlaces = typeof decimalPlaces === 'number' ? decimalPlaces : 3;
        return ifMath.round(number, false, decimalPlaces).toString().replace('.', decimalSeparator);
    };

    /**
     * Parses a string into a number
     * @param {string} the string to be parsed as number
     * @returns {Number}
     */
    IFUtil.prototype.parseNumber = function (string) {
        var parseString = "";
        var foundDecSep = false;
        for (var i = string.length; i >= 0; --i) {
            var char = string.charAt(i);
            if (char === ',' && !foundDecSep) {
                parseString = '.' + parseString;
            } else if (this.isNumeric(char)) {
                parseString = char + parseString;
            }
        }
        return parseFloat(parseString);
    };

    /**
     * Blends the fore color with the back color using
     * a given alpha value
     * @param {Array<Number>} back [r,g,b] color (0..255)
     * @param {Array<Number>} fore [r,g,b] color (0..255)
     * @param {Number} alpha between 0..1
     * @return {Array<Number>} [r,g,b] blended result
     */
    IFUtil.prototype.blendRGBColors = function (back, fore, alpha) {
        alpha = Math.min(Math.max(alpha, 0), 1);

        return [
            (back[0] * (1 - alpha)) + (fore[0] * alpha),
            (back[1] * (1 - alpha)) + (fore[1] * alpha),
            (back[2] * (1 - alpha)) + (fore[2] * alpha)
        ];
    };

    /**
     * Return a rgb array to a html hex string
     * @param {Array<Number>} rgb [r,g,b] color (0..255)
     * @returns {string}
     */
    IFUtil.prototype.rgbToHtmlHex = function (rgb) {
        var bin = rgb[0] << 16 | rgb[1] << 8 | rgb[2];
        return '#' + (function (h) {
            return new Array(7 - h.length).join("0") + h
        })(bin.toString(16).toUpperCase());
    };

    _.ifUtil = new IFUtil();
})(this);