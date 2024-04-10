import { RefObject } from "react";

type InitData = { devicePixelRatio: number };
export type InitRenderHandler = (canvas: HTMLCanvasElement, data: InitData) => void;
export type ShouldRedrawHandler = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => boolean;
export type DrawHandler = (context: CanvasRenderingContext2D) => void;
export type PreDrawHandler = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => void;
export type PostDrawHandler = () => void;
export type RenderEnvironmentLayerDrawHandler = (value: RenderEnvironmentValue, context: CanvasRenderingContext2D) => void;

export enum RenderLocation {
  TopLeft, TopCenter, TopRight,
  MiddleLeft, Center, MiddleRight,
  BottomLeft, BottomCenter, BottomRight
};

export type Coordinates = { x: number, y: number };
export type RenderEnvironmentLayerOptions = {
  location: RenderLocation | Coordinates,
  renderFps: boolean,
  renderSize: boolean,
  renderClientSize: boolean,
  renderPixelRatio: boolean
};

export type RenderEnvironmentValue = {
  fps: number,
  width: number,
  height: number,
  clientWidth: number,
  clientHeight: number,
  pixelRatio: number
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
  renderEnvironmentLayerRenderer?: RenderEnvironmentLayerRendererValue
}

export type RenderDebugHandler = () => void;
export type RenderDebugConditionalHandler = (condition: () => boolean) => void;
export type DebugObject = {
  renderBreak: RenderDebugHandler,
  renderBreakWhen: RenderDebugConditionalHandler,
  renderContinue: RenderDebugHandler,
  renderStep: RenderDebugHandler
};
export type Use2DRenderLoopResponse = {
  ref: RefObject<HTMLCanvasElement>,
  debug: DebugObject
};

export type OnResizeHandler = (canvas: HTMLCanvasElement, width: number, height: number) => void;