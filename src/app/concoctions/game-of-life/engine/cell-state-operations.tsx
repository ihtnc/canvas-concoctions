import { type MatrixCoordinate, type MatrixValue, PeekDirection, peek, copy } from "@/utilities/matrix-operations"
import { type CellValue, CellState } from "./types"
import { deepCopy } from "@/utilities/misc-operations"

export const isCellUndefinedOrTechnicallyAlive = (cell: CellValue | undefined): boolean => {
  return cell === undefined || isCellTechnicallyAlive(cell)
}

export const isCellTechnicallyAlive = (cell: CellValue): boolean => {
  return cell.state === CellState.Alive || cell.state === CellState.Dying
}

type GetCellStateFunction = (value: MatrixValue<CellValue>, coordinate: MatrixCoordinate, useTransitionState?: boolean) => CellValue;
export const getCellState: GetCellStateFunction = (value, coordinate, useTransitionState = true) => {
  const neighbors: Array<CellValue | undefined> = [
    peek(value, coordinate, PeekDirection.UpperLeft),
    peek(value, coordinate, PeekDirection.Up),
    peek(value, coordinate, PeekDirection.UpperRight),
    peek(value, coordinate, PeekDirection.Left),
    peek(value, coordinate, PeekDirection.Right),
    peek(value, coordinate, PeekDirection.LowerLeft),
    peek(value, coordinate, PeekDirection.Down),
    peek(value, coordinate, PeekDirection.LowerRight)
  ]

  const { row, col } = coordinate
  let current = deepCopy(value[row][col])
  const alive = neighbors.filter(c => c !== undefined && c.state === CellState.Alive)

  const shouldDie = alive.length < 2 || alive.length > 3
  const shouldGrow = alive.length === 3

  if (current.state === CellState.Alive && shouldDie) {
    current.state = useTransitionState ? CellState.Dying : CellState.Dead
  } else if (current.state === CellState.Dead && shouldGrow) {
    current.state = useTransitionState ? CellState.Growing : CellState.Alive
  }

  return current
}

type GetCellMapStateFunction = (value: MatrixValue<CellValue>, useTransitionState?: boolean) => MatrixValue<CellValue>;
export const getCellMapState: GetCellMapStateFunction  = (value, useTransitionState = true) => {
  const next = copy(value)

  for (let i = 0; i < value.length; i++) {
    for (let j = 0; j < value[i].length; j++) {
      next[i][j] = getCellState(value, { row: i, col: j }, useTransitionState)
    }
  }

  return next
}

export const finaliseCellMapState: (value: MatrixValue<CellValue>) => MatrixValue<CellValue> = (value) => {
  for (let i = 0; i < value.length; i++) {
    for (let j = 0; j < value[i].length; j++) {
      const current = value[i][j]
      if (current.state === CellState.Dying) {
        current.state = CellState.Dead
      } else if (current.state === CellState.Growing) {
        current.state = CellState.Alive
      }
    }
  }

  return value
}
