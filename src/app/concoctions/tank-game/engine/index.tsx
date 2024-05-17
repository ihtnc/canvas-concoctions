import { runRenderPipeline, type RenderFunction } from "@/utilities/drawing-operations"
import { type RenderPipelineData } from "./types"
import { renderGameLayer } from "./render"

type RenderGameFunction = (context: CanvasRenderingContext2D, frame: number, pre?: Array<RenderFunction>, post?: Array<RenderFunction>) => void;
export const renderGame: RenderGameFunction = (context, frame, pre, post) => {
  const data: RenderPipelineData = {
    frame
  }

  runRenderPipeline(context, data, renderGameLayer, pre, post)
}
