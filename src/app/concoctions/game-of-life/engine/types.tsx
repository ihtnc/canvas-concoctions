import { type HSL, type RenderFunction } from "@/utilities/drawing-operations";
import { type MatrixOperationFunction, type MatrixValue } from "@/utilities/matrix-operations";

export enum CycleState {
  Start,
  Stop
}

export enum CellState {
  Alive,
  Dying,
  Dead,
  Growing
};
export type CellValue = { state: CellState };

export type CreateCellOperationFunction<T> = (cycleIndex: number, data?: T) => CellOperationFunction;

export interface CellOperationFunction extends MatrixOperationFunction {
  (value: MatrixValue<CellValue>): MatrixValue<CellValue>
};

export type RenderPipelineData = {
  map: MatrixValue<CellValue>,
  width: number,
  height: number,
  aliveColor: HSL,
  dyingColor: HSL,
  growingColor: HSL,
  cycleIndex: number
};

export interface CellRenderFunction extends RenderFunction {
  (context: CanvasRenderingContext2D, data: RenderPipelineData): void;
};
