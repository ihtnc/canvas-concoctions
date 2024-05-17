import { type RenderFunction } from "@/utilities/drawing-operations"

export type RenderPipelineData = {
  frame: number
};

export interface TankGameRenderFunction extends RenderFunction {
  (context: CanvasRenderingContext2D, data: RenderPipelineData): void;
}
