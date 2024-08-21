import { type HSL } from "@/utilities/drawing-operations"
import { type MatrixCoordinate, type MatrixValue } from "@/utilities/matrix-operations"

export enum CycleState {
  Start,
  Stop
}

export enum CellState {
  Alive,
  Dying,
  Dead,
  Growing
}
export type CellValue = { state: CellState }

export type PageData = {
  map: MatrixValue<CellValue>,

  pointerCoordinate: MatrixCoordinate | null,
  resizeMap: boolean,
  resetMap: boolean,
  clicked: boolean,

  cellWidth: number,
  cellHeight: number,
  aliveColor: HSL,
  dyingColor: HSL,
  growingColor: HSL,
  cycleIndex: number
}