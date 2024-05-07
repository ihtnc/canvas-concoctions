import { type MatrixCoordinate, type MatrixValue } from "@/utilities/matrix-operations";
import { type CellValue, type CreateCellOperationFunction, type CellOperationFunction, CellState } from "./types";
import { deepCopy } from "@/utilities/misc-operations";
import ENGINE_DATA from './data';
import { isCheckStatePhase, isDormantPhase, isEndPhase } from "./cycle-operations";
import { finaliseCellMapState, getCellMapState } from "./cell-state-operations";

type GenerateCellsFunction = (value: MatrixValue<CellValue>, coordinate: MatrixCoordinate) => MatrixValue<CellValue>;
const generateCells: GenerateCellsFunction = (value, coordinate) => {
  const { row, col } = coordinate;
  if (row >= value.length) { return value; }
  if (col >= value[row].length) { return value; }

  value[row][col] = deepCopy(ENGINE_DATA.AliveCell);
  return value;
};

export const addNewCellsOnDormantPhase: CreateCellOperationFunction<MatrixCoordinate> = (cycleIndex, newCell) => {
  const operation: CellOperationFunction = (value: MatrixValue<CellValue>) => {
    return isDormantPhase(cycleIndex) && newCell !== undefined
      ? generateCells(value, newCell)
      : value;
  };

  return operation;
}

export const setTransitionStateOnCheckStatePhase: CreateCellOperationFunction<undefined> = (cycleIndex) => {
  const operation: CellOperationFunction = (value: MatrixValue<CellValue>) => {
    return isCheckStatePhase(cycleIndex)
      ? getCellMapState(value)
      : value;
  };

  return operation;
};

export const finaliseStateOnEndPhase: CreateCellOperationFunction<undefined> = (cycleIndex) => {
  const operation: CellOperationFunction = (value: MatrixValue<CellValue>) => {
    return isEndPhase(cycleIndex)
      ? finaliseCellMapState(value)
      : value;
  }

  return operation;
}