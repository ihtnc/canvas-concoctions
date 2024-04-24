import {
  RenderLocation,
  type RenderEnvironmentLayerDrawHandler,
  type RenderEnvironmentLayerOptions,
  type RenderEnvironmentLayerRendererValue,
  type Use2DRenderLoopOptions,
  type Coordinates,
  type RenderEnvironmentValue,
} from "./types";

export const DEFAULT_RENDER_ENVIRONMENT_LAYER_OPTIONS: RenderEnvironmentLayerOptions = {
  location: RenderLocation.TopLeft,
  renderFps: true,
  renderSize: true,
  renderClientSize: true,
  renderPixelRatio: true,
  renderFrameNumber: true
};

export const DEFAULT_OPTIONS: Use2DRenderLoopOptions = {
  autoStart: true,
  clearEachFrame: true,
  enableDebug: false,
  renderEnvironmentLayerRenderer: false,
  maxFrame: Number.MAX_SAFE_INTEGER
};

export const getRenderEnvironmentLayerRenderer: (value?: RenderEnvironmentLayerRendererValue) => RenderEnvironmentLayerDrawHandler | null = (value) => {
  let options: RenderEnvironmentLayerOptions;
  options = DEFAULT_RENDER_ENVIRONMENT_LAYER_OPTIONS;

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
    } = value as RenderEnvironmentLayerOptions;

    if (location !== undefined) { options.location = location; }
    if (renderFps !== undefined) { options.renderFps = renderFps; }
    if (renderSize !== undefined) { options.renderSize = renderSize; }
    if (renderClientSize !== undefined) { options.renderClientSize = renderClientSize; }
    if (renderPixelRatio !== undefined) { options.renderPixelRatio = renderPixelRatio; }
  }

  let renderer: RenderEnvironmentLayerDrawHandler;
  if(typeof value === "function") {
    renderer = value;
  }

  const getCoordinates: (value: string, debugValue: RenderEnvironmentValue, context: CanvasRenderingContext2D) => Coordinates = (value, debugValue, context) => {
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
    const frameText = options.renderFrameNumber ? `frame: ${value.frame};` : '';
    const debugText = `${fpsText}${sizeText}${clientText}${ratioText}${frameText}`.trim();
    const { x, y } = getCoordinates(debugText, value, context);
    const originalFillStyle = context.fillStyle;
    context.fillStyle = "#000000";
    context.fillText(debugText, x, y);
    context.fillStyle = originalFillStyle;
  };

  return renderer;
}
