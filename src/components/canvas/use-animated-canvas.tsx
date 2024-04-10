'use client';

import use2DRenderLoop from "./use-2d-render-loop";
import type {
  DrawHandler,
  ShouldRedrawHandler,
  PreDrawHandler,
  PostDrawHandler,
  InitRenderHandler,
  OnResizeHandler,
  RenderEnvironmentLayerRendererValue,
  RenderDebugHandler,
  RenderDebugConditionalHandler
} from "./types";
import {
  type MouseEventHandler,
  type PointerEventHandler,
  type JSXElementConstructor,
  useRef
} from "react";
import { useDebounceCallback, useResizeObserver } from "usehooks-ts";

type UseAnimatedCanvasOptions = {
  autoStart?: boolean,
  enableDebug?: boolean,
  resizeDelayMs?: number,
  clearEachFrame?: boolean
}

type UseAnimatedCanvasProps = {
  init?: InitRenderHandler,
  shouldRedraw?: ShouldRedrawHandler,
  draw: DrawHandler,
  predraw?: PreDrawHandler,
  postdraw?: PostDrawHandler,
  onResize?: OnResizeHandler,
  options?: UseAnimatedCanvasOptions,
  renderEnvironmentLayerRenderer?: RenderEnvironmentLayerRendererValue
}

type UseAnimatedCanvasResponse = {
  Canvas: JSXElementConstructor<AnimatedCanvasProps>,
  renderBreak: RenderDebugHandler,
  renderBreakWhen: RenderDebugConditionalHandler,
  renderContinue: RenderDebugHandler,
  renderStep: RenderDebugHandler,
}

type AnimatedCanvasProps = {
  className?: string,
  onClick?: MouseEventHandler<HTMLCanvasElement>,
  onPointerDown?: PointerEventHandler<HTMLCanvasElement>,
  onPointerUp?: PointerEventHandler<HTMLCanvasElement>,
  onPointerMove?: PointerEventHandler<HTMLCanvasElement>,
  onPointerOut?: PointerEventHandler<HTMLCanvasElement>,
  onPointerEnter?: PointerEventHandler<HTMLCanvasElement>,
};

const DEFAULT_OPTIONS: UseAnimatedCanvasOptions = {
  autoStart: true,
  enableDebug: false,
  clearEachFrame: true,
  resizeDelayMs: 200
};

const useAnimatedCanvas: (props: UseAnimatedCanvasProps) => UseAnimatedCanvasResponse = (props) => {
  const {
    init, shouldRedraw, draw, predraw, postdraw,
    onResize,
    options,
    renderEnvironmentLayerRenderer
  } = props;

  const canvasOptions = Object.assign({}, DEFAULT_OPTIONS, options);
  const { autoStart, enableDebug, clearEachFrame, resizeDelayMs } = canvasOptions;

  const divRef = useRef<HTMLDivElement>(null);

  const { ref, debug } = use2DRenderLoop({
    autoStart,
    enableDebug,
    clearEachFrame,
    onInit: init,
    onPreDraw: predraw,
    onDraw: draw,
    onPostDraw: postdraw,
    onShouldRedraw: shouldRedraw,
    renderEnvironmentLayerRenderer
  });

  const { renderBreak, renderContinue, renderStep, renderBreakWhen } = debug;

  const resizeCallback: (size: { width?: number, height?: number }) => void = (size) => {
    const { width, height } = size;
    if (ref.current && width && height) {
      if (onResize) {
        onResize(ref.current, width, height);
      }

      ref.current.width = width;
      ref.current.height = height;
    }
  };
  const debouncedOnResize = useDebounceCallback(resizeCallback, resizeDelayMs);
  useResizeObserver({ ref: divRef, onResize: debouncedOnResize });

  const canvasElement: JSXElementConstructor<AnimatedCanvasProps> = ({ className, ...rest }) => {
    return (
      <div ref={divRef} className={className}>
        <canvas
          ref={ref}
          {...rest}
        />
      </div>
    )
  };

  return {
    Canvas: canvasElement,
    renderBreak,
    renderContinue,
    renderStep,
    renderBreakWhen
  };
};

export default useAnimatedCanvas;