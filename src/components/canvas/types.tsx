export type InitRenderHandler = (canvas: HTMLCanvasElement) => void;
export type ShouldRedrawHandler = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => boolean;
export type DrawHandler = (context: CanvasRenderingContext2D) => void;
export type PreDrawHandler = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => void;
export type PostDrawHandler = () => void;
export type DebugLayerDrawHandler = (value: DebugLayerValue, context: CanvasRenderingContext2D) => void;

export enum RenderLocation {
  TopLeft, TopCenter, TopRight,
  MiddleLeft, Center, MiddleRight,
  BottomLeft, BottomCenter, BottomRight
};

export type Coordinates = { x: number, y: number };
export type DebugLayerOptions = {
  location: RenderLocation | Coordinates,
  renderFps: boolean,
  renderSize: boolean,
  renderClientSize: boolean,
  renderPixelRatio: boolean
};

export type DebugLayerValue = {
  fps: number,
  width: number,
  height: number,
  clientWidth: number,
  clientHeight: number,
  pixelRatio: number
}

export type DebugLayerRendererValue = boolean | RenderLocation | Coordinates | DebugLayerOptions | DebugLayerDrawHandler;

export type Use2DRenderLoopOptions = {
  clearEachFrame?: boolean,
  onInit?: InitRenderHandler,
  onDraw?: DrawHandler,
  onPreDraw?: PreDrawHandler,
  onPostDraw?: PostDrawHandler,
  onShouldRedraw?: ShouldRedrawHandler,
  debugLayerRenderer?: DebugLayerRendererValue
}

export type OnResizeHandler = (canvas: HTMLCanvasElement, width: number, height: number) => void;