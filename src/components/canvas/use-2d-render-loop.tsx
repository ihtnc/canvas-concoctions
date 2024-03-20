import { useRef, useEffect, RefObject } from "react";
import { clearFrame } from "@/utilities/canvas-operations";
import { type Use2DRenderLoopOptions } from "./types";
import { DEFAULT_OPTIONS, getDebugLayerRenderer } from "./utilities";

type FpsCounter = { frameCount: number, fps: number, reference: number };

const use2DRenderLoop = (options: Use2DRenderLoopOptions=DEFAULT_OPTIONS): RefObject<HTMLCanvasElement> => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { onInit, onPreDraw, onDraw, onPostDraw, onShouldRedraw, debugLayerRenderer } = options;
  const debugLayerHandler = getDebugLayerRenderer(debugLayerRenderer);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) { return; }

    const context = canvas.getContext('2d');
    const { devicePixelRatio=1 } = window;
    let animationFrameId: number;

    if (onInit) { onInit(canvas); }

    const render = () => {
      if (!context) {
        animationFrameId = window.requestAnimationFrame(render);
        return;
      }

      if (onPreDraw) { onPreDraw(canvas, context); }
      if (options.clearEachFrame) { clearFrame(canvas); }

      if (debugLayerHandler) {
        updateFpsCounter();
        debugLayerHandler({
          fps: fpsCounter.current.fps,
          width: canvas.width,
          height: canvas.height,
          clientWidth: canvas.clientWidth,
          clientHeight: canvas.clientHeight,
          pixelRatio: devicePixelRatio
        }, context);
      }

      const shouldRedraw = !onShouldRedraw || onShouldRedraw(canvas, context);
      if (shouldRedraw && onDraw) { onDraw(context); }
      if (onPostDraw) { onPostDraw(); }

      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    }
  }, [options]);

  return canvasRef;
};

export default use2DRenderLoop;