import {
  RenderLocation,
  type DebugLayerDrawHandler,
  type DebugLayerOptions,
  type DebugLayerRendererValue,
  type Use2DRenderLoopOptions,
  type Coordinates,
  type DebugLayerValue,
} from "./types";

export const DEFAULT_DEBUG_LAYER_OPTIONS: DebugLayerOptions = {
  location: RenderLocation.TopLeft,
  renderFps: true,
  renderSize: true,
  renderClientSize: true,
  renderPixelRatio: true
};

export const DEFAULT_OPTIONS: Use2DRenderLoopOptions = {
  clearEachFrame: true,
  debugLayerRenderer: false
};

export const getDebugLayerRenderer: (value?: DebugLayerRendererValue) => DebugLayerDrawHandler | null = (value) => {
  let options: DebugLayerOptions;
  options = DEFAULT_DEBUG_LAYER_OPTIONS;

  if (value === undefined || value === false) {
    return null;
  }

  if (typeof(value) === "number") {
    options.location = value as RenderLocation;
  }

  const { x, y } = value as Coordinates;
  if (x !== undefined && y !== undefined) {
    options.location = { x, y };
  }

  if (typeof(value) === "object") {
    const {
      location,
      renderFps,
      renderSize,
      renderClientSize,
      renderPixelRatio
    } = value as DebugLayerOptions;

    if (location !== undefined) { options.location = location; }
    if (renderFps !== undefined) { options.renderFps = renderFps; }
    if (renderSize !== undefined) { options.renderSize = renderSize; }
    if (renderClientSize !== undefined) { options.renderClientSize = renderClientSize; }
    if (renderPixelRatio !== undefined) { options.renderPixelRatio = renderPixelRatio; }
  }

  let renderer: DebugLayerDrawHandler;
  if(typeof value === "function") {
    renderer = value;
  }

  const getCoordinates: (value: string, debugValue: DebugLayerValue, context: CanvasRenderingContext2D) => Coordinates = (value, debugValue, context) => {
    let { x, y } = options.location as Coordinates;
    if (x !== undefined && y !== undefined) { return {x, y}; }

    const { width, actualBoundingBoxAscent, actualBoundingBoxDescent } = context.measureText(value);
    const textWidth = width;
    const textHeight = actualBoundingBoxAscent + actualBoundingBoxDescent;
    const offSet = 10;
    const leftX = 0 + offSet;
    const topY = 0 + offSet + offSet;
    const midX = (debugValue.width / 2) - (textWidth / 2);
    const midY = (debugValue.height / 2) - (textHeight / 2);
    const rightX = debugValue.width - textWidth - offSet;
    const bottomY = debugValue.height - textHeight;
    switch(options.location) {
      case RenderLocation.TopLeft:
        x = leftX;
        y = topY;
        break;
      case RenderLocation.TopCenter:
        x = midX;
        y = topY;
        break;
      case RenderLocation.TopRight:
        x = rightX;
        y = topY;
        break;
      case RenderLocation.MiddleLeft:
        x = leftX;
        y = midY;
        break;
      case RenderLocation.Center:
        x = midX;
        y = midY;
        break;
      case RenderLocation.MiddleRight:
        x = rightX;
        y = midY;
        break;
      case RenderLocation.BottomLeft:
        x = leftX;
        y = bottomY;
        break;
      case RenderLocation.BottomCenter:
        x = midX;
        y = bottomY;
        break;
      case RenderLocation.BottomRight:
        x = rightX;
        y = bottomY;
        break;
    }
    return { x, y };
  }

  renderer = (value, context) => {
    const fpsText = options.renderFps ? `fps: ${value.fps}; ` : '';
    const sizeText = options.renderSize ? `size: ${value.width}x${value.height}; ` : '';
    const clientText = options.renderClientSize ? `client: ${value.clientWidth}x${value.clientHeight}; ` : '';
    const ratioText = options.renderPixelRatio ? `ratio: ${value.pixelRatio}; ` : '';
    const debugText = `${fpsText}${sizeText}${clientText}${ratioText}`.trim();
    const { x, y } = getCoordinates(debugText, value, context);
    const originalFillStyle = context.fillStyle;
    context.fillStyle = "#000000";
    context.fillText(debugText, x, y);
    context.fillStyle = originalFillStyle;
  };

  return renderer;
}
