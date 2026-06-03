import { GColorMatcher } from '@gravitrdr/application'
import { IFObject } from '@gravitrdr/infinity-core'
import { IFLocale } from '@gravitrdr/infinity-core'
import { ifMath } from '@gravitrdr/infinity-core'
import { IFColor } from '@gravitrdr/infinity-core'

    /**
     * Complementary Color Matcher
     * @class GComplementaryMatcher
     * @extends GColorMatcher
     * @constructor
     */
export     function GComplementaryMatcher() {
    };
    IFObject.inherit(GComplementaryMatcher, GColorMatcher);

    GComplementaryMatcher.TITLE = new IFLocale.Key(GComplementaryMatcher, "title");

    /** @override */
    GComplementaryMatcher.prototype.getTitle = function () {
        return GComplementaryMatcher.TITLE;
    };

    /** @override */
    GComplementaryMatcher.prototype.getCategory = function () {
        return GColorMatcher.CATEGORY_HARMONY;
    };

    /** @override */
    GComplementaryMatcher.prototype.match = function (referenceColor) {
        var hsl = referenceColor.asHSL();
        hsl[0] = ifMath.normalizeAngleDegrees(hsl[0] + 180);
        return [new IFColor(IFColor.Type.HSL, hsl)];
    };

    /** @override */
    GComplementaryMatcher.prototype.toString = function () {
        return "[Object GComplementaryMatcher]";
    };
