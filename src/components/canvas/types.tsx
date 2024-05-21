import { RefObject } from "react"

type InitData = { devicePixelRatio: number };
export type InitRenderHandler = (canvas: HTMLCanvasElement, data: InitData) => void;

export type DrawData = {
  context: CanvasRenderingContext2D,
  frame: number,
  fps: number,
  devicePixelRatio: number
};
export type ShouldRedrawHandler = (canvas: HTMLCanvasElement, data: DrawData) => boolean;
export type DrawHandler = (data: DrawData) => void;
export type PreDrawHandler = (canvas: HTMLCanvasElement, data: DrawData) => void;
export type PostDrawHandler = (canvas: HTMLCanvasElement, data: DrawData) => void;
export type RenderEnvironmentLayerDrawHandler = (value: RenderEnvironmentValue, context: CanvasRenderingContext2D) => void;

export enum RenderLocation {
  TopLeft, TopCenter, TopRight,
  MiddleLeft, Center, MiddleRight,
  BottomLeft, BottomCenter, BottomRight
}

export type Coordinates = { x: number, y: number };
export type RenderEnvironmentLayerOptions = {
  location: RenderLocation | Coordinates,
  renderFps: boolean,
  renderSize: boolean,
  renderClientSize: boolean,
  renderPixelRatio: boolean,
  renderFrameNumber: boolean
};

export type RenderEnvironmentValue = {
  fps: number,
  width: number,
  height: number,
  clientWidth: number,
  clientHeight: number,
  pixelRatio: number,
  frame: number
}

export type RenderEnvironmentLayerRendererValue = boolean | RenderLocation | Coordinates | RenderEnvironmentLayerOptions | RenderEnvironmentLayerDrawHandler;

export type Use2DRenderLoopOptions = {
  autoStart?: boolean,
  clearEachFrame?: boolean,
  enableDebug?: boolean,
  onInit?: InitRenderHandler,
  onDraw?: DrawHandler,
  onPreDraw?: PreDrawHandler,
  onPostDraw?: PostDrawHandler,
  onShouldRedraw?: ShouldRedrawHandler,
  renderEnvironmentLayerRenderer?: RenderEnvironmentLayerRendererValue,
  maxFrame?: number
}

export type RenderDebugHandler = () => void;
export type RenderDebugConditionalHandler = (condition: () => boolean) => void;
export type UtilitiesObject = {
  resize: (width: number, height: number) => void,
}
export type DebugObject = {
  renderBreak: RenderDebugHandler,
  renderBreakWhen: RenderDebugConditionalHandler,
  renderContinue: RenderDebugHandler,
  renderStep: RenderDebugHandler
}
export type Use2DRenderLoopResponse = {
  ref: RefObject<HTMLCanvasElement>,
  utilities: UtilitiesObject,
  debug: DebugObject
};

export type OnResizeHandler = (canvas: HTMLCanvasElement, width: number, height: number) => void;