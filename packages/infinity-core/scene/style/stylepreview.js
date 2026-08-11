import { IFStyle } from "./style";
import { IFRectangle } from "../shape/rectangle";
import { IFTransform } from "../../geometry/transform";
import { IFPaintCanvas } from "../../paint/paintcanvas";
import { IFPaintContext } from "../../paint/paintcontext";
import { IFScenePaintConfiguration } from "../scenepaintconfiguration";
import { IFRect } from "../../geometry/rect";
import { IFPoint } from "../../geometry/point";

var PREVIEW_CHESSBOARD_FILL = null;

/**
 * Creates a preview image of this canvas
 * @param {Number} width the width of the preview
 * @param {Number} height the height of the preview
 * @return {String} a base64-encoded image data url with the preview
 */
IFStyle.prototype.createPreviewImage = function (width, height) {
  // Create a temporary rectangle shape for preview painting
  var previewRect = new IFRectangle();
  previewRect.setProperty(
    "trf",
    new IFTransform(width / 2, 0, 0, height / 2, width / 2, height / 2),
  );

  // Setup canvas and context for painting
  var canvas = new IFPaintCanvas();
  canvas.resize(width, height);
  canvas.prepare();
  var context = new IFPaintContext();
  context.canvas = canvas;
  context.configuration = new IFScenePaintConfiguration();

  // Paint transparent background
  if (!PREVIEW_CHESSBOARD_FILL) {
    PREVIEW_CHESSBOARD_FILL = IFPaintCanvas.createChessboard(
      4,
      "white",
      "rgb(185, 185, 185)",
    );
  }
  context.canvas.fillRect(
    0,
    0,
    width,
    height,
    context.canvas.createTexture(PREVIEW_CHESSBOARD_FILL),
  );

  // Calculate real bounding box
  var bbox = this.getBBox(new IFRect(0, 0, width, height));

  // Transform canvas to fit bounding box exactly
  var bboxCenter = bbox.getSide(IFRect.Side.CENTER);
  var realCenter = new IFPoint(width / 2, height / 2);
  var scaleX = 1.0 / (bbox.getWidth() / width);
  var scaleY = 1.0 / (bbox.getHeight() / height);
  var matrix = new IFTransform()
    .translated(-bboxCenter.getX(), -bboxCenter.getY())
    .scaled(scaleX, scaleY)
    .translated(realCenter.getX(), realCenter.getY())
    .getMatrix();

  canvas.setOrigin(new IFPoint(-matrix[4], -matrix[5]));
  canvas.setScale(scaleX);

  // Paint rectangle with this style
  previewRect.renderStyle(context, this);

  return canvas.asPNGImage();
};
