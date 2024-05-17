import { type TankGameRenderFunction, type RenderPipelineData } from "./types"

export const renderGameLayer: TankGameRenderFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData) => {
  context.save()
  context.restore()
}

