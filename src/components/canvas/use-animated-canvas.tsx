'use client'

import use2DRenderLoop from "./use-2d-render-loop"
import type {
  DrawHandler,
  ShouldRedrawHandler,
  PreDrawHandler,
  PostDrawHandler,
  InitRenderHandler,
  OnResizeHandler,
  RenderEnvironmentLayerRendererValue,
  DebugObject,
  RenderGridLayerRendererValue
} from "./types"
import {
  type MouseEventHandler,
  type PointerEventHandler,
  type JSXElementConstructor,
  useRef
} from "react"
import { useDebounceCallback, useResizeObserver, useEventListener } from "usehooks-ts"

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
  renderEnvironmentLayerRenderer?: RenderEnvironmentLayerRendererValue,
  renderGridLayerRenderer?: RenderGridLayerRendererValue
}

type UseAnimatedCanvasResponse = {
  Canvas: JSXElementConstructor<AnimatedCanvasProps>,
  debug: DebugObject
}

type AnimatedCanvasProps = {
  className?: string,
  onClick?: MouseEventHandler<HTMLCanvasElement>,
  onPointerDown?: PointerEventHandler<HTMLCanvasElement>,
  onPointerUp?: PointerEventHandler<HTMLCanvasElement>,
  onPointerMove?: PointerEventHandler<HTMLCanvasElement>,
  onPointerOut?: PointerEventHandler<HTMLCanvasElement>,
  onPointerEnter?: PointerEventHandler<HTMLCanvasElement>,
  onKeyDown?: (event: KeyboardEvent) => void,
  onKeyUp?: (event: KeyboardEvent) => void,
};

const DEFAULT_OPTIONS: UseAnimatedCanvasOptions = {
  autoStart: true,
  enableDebug: false,
  clearEachFrame: true,
  resizeDelayMs: 200
}

const useAnimatedCanvas: (props: UseAnimatedCanvasProps) => UseAnimatedCanvasResponse = (props) => {
  const {
    init, shouldRedraw, draw, predraw, postdraw,
    onResize,
    options,
    renderEnvironmentLayerRenderer,
    renderGridLayerRenderer
  } = props

  const canvasOptions = Object.assign({}, DEFAULT_OPTIONS, options)
  const { autoStart, enableDebug, clearEachFrame, resizeDelayMs } = canvasOptions

  const divRef = useRef<HTMLDivElement>(null)

  const { ref, utilities, debug } = use2DRenderLoop({
    autoStart,
    enableDebug,
    clearEachFrame,
    onInit: init,
    onPreDraw: predraw,
    onDraw: draw,
    onPostDraw: postdraw,
    onShouldRedraw: shouldRedraw,
    renderEnvironmentLayerRenderer,
    renderGridLayerRenderer
  })

  const resizeCallback: (size: { width?: number, height?: number }) => void = (size) => {
    const { width, height } = size
    const { resize } = utilities

    if (ref.current && width && height) {
      if (onResize) {
        onResize(ref.current, width, height)
      }

      resize(width, height)
    }
  }
  const debouncedOnResize = useDebounceCallback(resizeCallback, resizeDelayMs)
  useResizeObserver({ ref: divRef, onResize: debouncedOnResize })

  const CanvasElement: JSXElementConstructor<AnimatedCanvasProps> = ({ className, onKeyDown, onKeyUp, ...rest }) => {
    const onKeyDownHandler = onKeyDown ?? (() => {})
    const onKeyUpHandler = onKeyUp ?? (() => {})
    useEventListener("keydown", onKeyDownHandler)
    useEventListener("keyup", onKeyUpHandler)

    return (
      <div ref={divRef}
        className={className}>
        <canvas
          ref={ref}
          style={{ flexGrow: 1 }}
          {...rest}
        />
      </div>
    )
  }

  return {
    Canvas: CanvasElement,
    debug
  }
}

export default useAnimatedCanvas