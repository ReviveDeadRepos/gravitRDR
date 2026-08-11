/**
 * Applied style type constants. Kept in a leaf module so that
 * both the style subsystem and element code can reference them
 * without importing each other.
 * @enum
 */
export var APPLIED_STYLE_TYPE = {
  /**
   * Content type - Render contents and effects
   */
  Content: "C",

  /**
   * Knockout - Applies effects on contents
   * but doesn't render the contents
   */
  Knockout: "K",

  /**
   * Mask - Applies effects on contents
   * and clips background with them
   */
  Mask: "M",

  /**
   * Background - Applies effects on
   * backgrounds and clips it with contents
   */
  Background: "B",
};
