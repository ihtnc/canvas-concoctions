import { useRef, useEffect, RefObject } from "react";
import { clearFrame } from "@/utilities/canvas-operations";
import {
  type Use2DRenderLoopResponse,
  type Use2DRenderLoopOptions,
  type RenderDebugHandler,
  type RenderDebugConditionalHandler,
  type DrawData
} from "./types";
import { DEFAULT_OPTIONS, getRenderEnvironmentLayerRenderer } from "./utilities";

type FpsCounter = { frameCount: number, fps: number, reference: number };

const use2DRenderLoop = (options: Use2DRenderLoopOptions): Use2DRenderLoopResponse => {
  options = Object.assign({}, DEFAULT_OPTIONS, options);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { onInit, onPreDraw, onDraw, onPostDraw, onShouldRedraw, renderEnvironmentLayerRenderer } = options;
  const renderEnvironmentLayerHandler = getRenderEnvironmentLayerRenderer(renderEnvironmentLayerRenderer);

  const fpsCounter = useRef<FpsCounter>({
    frameCount: 0,
    fps: 0,
    reference: new Date().getTime()
  });

  const updateFpsCounter: () => number = () => {
    fpsCounter.current.frameCount++;
    const current = new Date().getTime();
    const elapsed = current - fpsCounter.current.reference;
    if (elapsed > 1000) {
      fpsCounter.current.fps = fpsCounter.current.frameCount;
      fpsCounter.current.frameCount = 0;
      fpsCounter.current.reference = current;
    }

    return fpsCounter.current.frameCount;
  };

  let frame: number = 0;
  let request: boolean | null = null;
  let requestOnce: boolean | null = null;

  const renderBreak: RenderDebugHandler = () => {
    if (options.enableDebug !== true) { return; }
    request = false;
    requestOnce = false;
  };

  const renderBreakWhen: RenderDebugConditionalHandler = (condition) => {
    if (options.enableDebug !== true) { return; }
    if (condition() !== true) { return; }
    request = false;
    requestOnce = false;
  };

  const renderContinue: RenderDebugHandler = () => {
    if (options.enableDebug !== true) { return; }

    request = true;
    requestOnce = false;
  };

  const renderStep: RenderDebugHandler = () => {
    if (options.enableDebug !== true) { return; }
    requestOnce = true;
    request = false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) { return; }

    canvas.style.touchAction = "none";

    const context = canvas.getContext('2d');
    const { devicePixelRatio=1 } = window;
    let animationFrameId: number;

    if (onInit) { onInit(canvas, { devicePixelRatio }); }

    const needsNewFrame: () => boolean = () => {
      if (options.autoStart === true && request === null && requestOnce === null) { return true; }
      if (options.autoStart === false && request === null && requestOnce === null) { return false; }
      if (options.enableDebug && request === false && requestOnce === false) { return false; }
      if (options.enableDebug && requestOnce) { requestOnce = false; }
      return true;
    };

    const render = () => {
      if (!context || needsNewFrame() == false) {
        animationFrameId = window.requestAnimationFrame(render);
        return;
      }

      const renderData: DrawData = { context, frame };

      if (onPreDraw) { onPreDraw(canvas, renderData); }
      if (options.clearEachFrame) { clearFrame(canvas); }

      if (renderEnvironmentLayerHandler) {
        updateFpsCounter();
        renderEnvironmentLayerHandler({
          fps: fpsCounter.current.fps,
          width: canvas.width,
          height: canvas.height,
          clientWidth: canvas.clientWidth,
          clientHeight: canvas.clientHeight,
          pixelRatio: devicePixelRatio,
          frame
        }, context);
      }

      const shouldRedraw = !onShouldRedraw || onShouldRedraw(canvas, renderData);
      if (shouldRedraw && onDraw) { onDraw(renderData); }
      if (onPostDraw) { onPostDraw(); }

      frame = (frame + 1 <= options.maxFrame!) ? frame + 1: 0;
      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    }
  }, [options]);

  return {
    ref: canvasRef,
    debug: {
      renderBreak, renderBreakWhen, renderContinue, renderStep
    }
  };
};

export default use2DRenderLoop;