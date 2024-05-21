import { type HSL, type RenderFunction } from "@/utilities/drawing-operations"
import { type MatrixOperationFunction, type MatrixValue } from "@/utilities/matrix-operations"

export type ParticleValue = { color?: HSL, value: number };

export interface ParticleOperationFunction extends MatrixOperationFunction {
  (value: MatrixValue<ParticleValue>): MatrixValue<ParticleValue>
}

export type RenderPipelineData = {
  map: MatrixValue<ParticleValue>,
  width: number,
  height: number,
}

export interface ParticleRenderFunction extends RenderFunction {
  (context: CanvasRenderingContext2D, data: RenderPipelineData): void;
}
