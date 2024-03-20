'use client';

import use2DRenderLoop from "./use-2d-render-loop";
import type {
  DrawHandler,
  ShouldRedrawHandler,
  PreDrawHandler,
  PostDrawHandler,
  InitRenderHandler,
  OnResizeHandler,
  DebugLayerRendererValue
} from "./types";
import { type MouseEventHandler, useRef } from "react";
import { useDebounceCallback, useResizeObserver } from "usehooks-ts";

type CanvasOptions = {
  resizeDelayMs?: number,
  clearEachFrame?: boolean
}

type CanvasProps = {
  init?: InitRenderHandler,
  shouldRedraw?: ShouldRedrawHandler,
  draw: DrawHandler,
  predraw?: PreDrawHandler,
  postdraw?: PostDrawHandler,
  onResize?: OnResizeHandler,
  onClick?: MouseEventHandler<HTMLCanvasElement>,
  onMouseDown?: MouseEventHandler<HTMLCanvasElement>,
  onMouseUp?: MouseEventHandler<HTMLCanvasElement>,
  onMouseMove?: MouseEventHandler<HTMLCanvasElement>,
  onMouseLeave?: MouseEventHandler<HTMLCanvasElement>,
  onMouseEnter?: MouseEventHandler<HTMLCanvasElement>,
  options?: CanvasOptions,
  debugLayerRenderer?: DebugLayerRendererValue,
  className?: string
}

const DEFAULT_OPTIONS: CanvasOptions = {
  clearEachFrame: true,
  resizeDelayMs: 200
};

const Canvas = (props: CanvasProps) => {
  const {
    init, shouldRedraw, draw, predraw, postdraw,
    onResize,
    onClick, onMouseDown, onMouseUp, onMouseMove, onMouseLeave, onMouseEnter,
    options=DEFAULT_OPTIONS,
    debugLayerRenderer,
    ...rest
  } = props;

  const { clearEachFrame, resizeDelayMs } = options;

  const divRef = useRef<HTMLDivElement>(null);

  const ref = use2DRenderLoop({
    clearEachFrame,
    onInit: init,
    onPreDraw: predraw,
    onDraw: draw,
    onPostDraw: postdraw,
    onShouldRedraw: shouldRedraw,
    debugLayerRenderer: debugLayerRenderer
  });

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

  return (
    <div ref={divRef} {...rest}>
      <canvas ref={ref}
        onClick={onClick}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onMouseEnter={onMouseEnter}
      />
    </div>
  );
};

export default Canvas;