import { useRef, useEffect } from "react"
import { clearFrame } from "@/utilities/canvas-operations"
import {
  type Use2DRenderLoopResponse,
  type Use2DRenderLoopOptions,
  type RenderDebugHandler,
  type RenderDebugConditionalHandler,
  type DrawData
} from "./types"
import { DEFAULT_OPTIONS, getRenderEnvironmentLayerRenderer, getRenderGridLayerRenderer } from "./utilities"
import { cancelAnimationFrame, getDevicePixelRatio, requestAnimationFrame } from "@/utilities/client-operations"

type FrameCounter = { frameCount: number, fps: number, lastRender: number };

const use2DRenderLoop = (options: Use2DRenderLoopOptions): Use2DRenderLoopResponse => {
  options = Object.assign({}, DEFAULT_OPTIONS, options)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { onInit, onPreDraw, onDraw, onPostDraw, onShouldRedraw, renderEnvironmentLayerRenderer, renderGridLayerRenderer } = options
  const renderEnvironmentLayerHandler = getRenderEnvironmentLayerRenderer(renderEnvironmentLayerRenderer)
  const renderGridLayerHandler = getRenderGridLayerRenderer(renderGridLayerRenderer)

  const frameCounter = useRef<FrameCounter>({
    frameCount: 0,
    fps: 0,
    lastRender: performance.now()
  })

  const updateFrameCounter: () => number = () => {
    const current = performance.now()
    const frameLength = current - frameCounter.current.lastRender
    const fps = Math.round(1000 / frameLength)

    frameCounter.current.fps = fps
    frameCounter.current.lastRender = current

    let frame = frameCounter.current.frameCount
    frame = (frame + 1 <= options.maxFrame!) ? frame + 1: 0
    frameCounter.current.frameCount = frame

    return fps
  }

  let request: boolean | null = null
  let requestOnce: boolean | null = null

  const renderBreak: RenderDebugHandler = () => {
    if (options.enableDebug !== true) { return }
    request = false
    requestOnce = false
  }

  const renderBreakWhen: RenderDebugConditionalHandler = (condition) => {
    if (options.enableDebug !== true) { return }
    if (condition() !== true) { return }
    request = false
    requestOnce = false
  }

  const renderContinue: RenderDebugHandler = () => {
    if (options.enableDebug !== true) { return }

    request = true
    requestOnce = false
  }

  const renderStep: RenderDebugHandler = () => {
    if (options.enableDebug !== true) { return }
    requestOnce = true
    request = false
  }

  const resize = (width: number, height: number) => {
    const canvas = canvasRef.current
    if (canvas === null) { return }

    canvas.width = width
    canvas.height = height
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) { return }

    canvas.style.touchAction = "none"

    const context = canvas.getContext('2d')
    const devicePixelRatio = getDevicePixelRatio()
    let animationFrameId: number

    if (onInit) { onInit(canvas, { devicePixelRatio }) }

    const needsNewFrame: () => boolean = () => {
      if (options.autoStart === true && request === null && requestOnce === null) { return true }
      if (options.autoStart === false && request === null && requestOnce === null) { return false }
      if (options.enableDebug && request === false && requestOnce === false) { return false }

      // requestOnce is used to step through the render loop and is manually set
      //   so there's no need to preserve the value after each render
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (options.enableDebug && requestOnce) { requestOnce = false }

      return true
    }

    const render = () => {
      if (!context || needsNewFrame() === false) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      const renderData: DrawData = {
        context,
        frame: frameCounter.current.frameCount,
        fps: frameCounter.current.fps,
        devicePixelRatio
      }

      if (onPreDraw) { onPreDraw(canvas, renderData) }
      if (options.clearEachFrame) { clearFrame(canvas) }

      if (renderGridLayerHandler) { renderGridLayerHandler(context) }

      if (renderEnvironmentLayerHandler) {
        renderEnvironmentLayerHandler({
          fps: frameCounter.current.fps,
          width: canvas.width,
          height: canvas.height,
          clientWidth: canvas.clientWidth,
          clientHeight: canvas.clientHeight,
          pixelRatio: devicePixelRatio,
          frame: frameCounter.current.frameCount
        }, context)
      }

      const shouldRedraw = !onShouldRedraw || onShouldRedraw(canvas, renderData)
      if (shouldRedraw && onDraw) { onDraw(renderData) }
      if (onPostDraw) { onPostDraw(canvas, renderData) }

      updateFrameCounter()
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [options])

  return {
    ref: canvasRef,
    utilities: {
      resize
    },
    debug: {
      renderBreak, renderBreakWhen, renderContinue, renderStep
    }
  }
}

export default use2DRenderLoop