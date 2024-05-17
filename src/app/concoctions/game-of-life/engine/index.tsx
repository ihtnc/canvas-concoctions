import {
  type RenderFunction,
  runRenderPipeline
} from "@/utilities/drawing-operations"
import {
  type MatrixValue,
  type MatrixCoordinate,
  VResizeDirection,
  HResizeDirection,
  initialise,
  resize,
  reset,
  matrixPipeline,
  copy
} from "@/utilities/matrix-operations"
import { type CellValue, type CellOperationFunction, type RenderPipelineData, CycleState } from "./types"
import ENGINE_DATA from './data'
import { renderCellLayer } from "./render"
import { isEndPhase, isTransitionPhase } from "./cycle-operations"
import {
  addNewCellsOnDormantPhase,
  finaliseStateOnEndPhase,
  setTransitionStateOnCheckStatePhase
} from "./cell-operations"

type GetNextCycleFunction = (cycleIndex: number, state: CycleState) => number;
export const getNextCycle: GetNextCycleFunction = (cycleIndex, state) => {
  if (isTransitionPhase(cycleIndex)) { return cycleIndex + 1 }
  if (state === CycleState.Stop) { return 0 }

  return isEndPhase(cycleIndex) ? 0 : cycleIndex + 1
}

export const isFullCycle = (cycleIndex: number): boolean => {
  return isEndPhase(cycleIndex)
}

type InitialiseCellMapFunction = (row: number, col: number) => MatrixValue<CellValue>;
export const initialiseCellMap: InitialiseCellMapFunction = (row, col) => {
  return initialise(row, col, ENGINE_DATA.DeadCell)
}

type ResizeCellMapFunction = (value: MatrixValue<CellValue>, newRow: number, newCol: number) => MatrixValue<CellValue>;
export const resizeCellMap: ResizeCellMapFunction = (value, newRow, newCol) => {
  return resize(value, newRow, newCol, ENGINE_DATA.DeadCell, VResizeDirection.Down, HResizeDirection.Right)
}

export const resetCellMap: CellOperationFunction = (value: MatrixValue<CellValue>) => {
  return reset(value, ENGINE_DATA.DeadCell)
}

type ProcessCellMapFunction = (value: MatrixValue<CellValue>, cycleIndex: number, newCell?: MatrixCoordinate) => MatrixValue<CellValue>;
export const processCellMap: ProcessCellMapFunction = (value, cycleIndex, newCell) => {
  const newValue = matrixPipeline([
    copy,
    addNewCellsOnDormantPhase(cycleIndex, newCell),
    setTransitionStateOnCheckStatePhase(cycleIndex),
    finaliseStateOnEndPhase(cycleIndex)
  ]).run(value)

  return newValue
}

type RenderCellMapFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData, pre?: Array<RenderFunction>, post?: Array<RenderFunction>) => void;
export const renderCellMap: RenderCellMapFunction = (context, data, pre, post) => {
  runRenderPipeline(context, data, renderCellLayer, pre, post)
}
