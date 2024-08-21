import { type MatrixCoordinate, type MatrixValue, PeekDirection, peek } from "@/utilities/matrix-operations"
import { isCellUndefinedOrTechnicallyAlive } from "./cell-state-operations"
import { type CellValue, CellState } from "./types"
import { type HSL, type BorderRadii } from "@/utilities/drawing-operations"
import { deepCopy } from "@/utilities/misc-operations"
import ENGINE_DATA from './data'
import { getCycleProgress } from "./cycle-operations"

type GenerateCellsFunction = (value: MatrixValue<CellValue>, coordinate: MatrixCoordinate) => MatrixValue<CellValue>
export const generateCells: GenerateCellsFunction = (value, coordinate) => {
  const { row, col } = coordinate
  if (row >= value.length) { return value }
  if (col >= value[row].length) { return value }

  value[row][col] = deepCopy(ENGINE_DATA.AliveCell)
  return value
}

type CellStateMap = { state: CellState, cells: Array<MatrixCoordinate> }
type GetStateMapFunction = (value: MatrixValue<CellValue>) => Array<CellStateMap>
export const getStateMap: GetStateMapFunction = (value): Array<CellStateMap> => {
  const sorted: Array<CellStateMap> = []

  for (let i = 0; i < value.length; i++) {
    for (let j = 0; j < value[i].length; j++) {
      const state = value[i][j].state
      let group = sorted.find(item => item.state === state)
      if (group === undefined) {
        const newLength = sorted.push({ state, cells: [] })
        group = sorted[newLength - 1]
      }
      group.cells.push({ row: i, col: j })
    }
  }

  return sorted
}

type CellDisplayMap = {
  state: CellState,
  color: HSL,
  opacity: number,
  width: number, height:
  number, cells: Array<MatrixCoordinate>
}
type GetDisplayMapFunction = (stateMap: Array<CellStateMap>, cycleIndex: number, width: number, height: number, aliveColor: HSL, dyingColor: HSL, growingColor: HSL) => Array<CellDisplayMap>
export const getDisplayMap: GetDisplayMapFunction = (stateMap, cycleIndex, width: number, height: number, aliveColor, dyingColor, growingColor): Array<CellDisplayMap> => {
  const sorted: Array<CellDisplayMap> = []
  const cycleProgress = getCycleProgress(cycleIndex)

  for (let i = 0; i < stateMap.length; i++) {
    if (stateMap[i].state === CellState.Dead) { continue }

    let color: HSL
    let cellWidth: number
    let cellHeight: number
    let opacity: number
    const state = stateMap[i].state
    switch (state) {
      case CellState.Dying:
        const dyingProgress = 1 - cycleProgress
        color = deepCopy(dyingColor)
        color.s = color.s * dyingProgress
        opacity = dyingProgress
        cellWidth = width * dyingProgress
        cellHeight = height * dyingProgress
        break
      case CellState.Growing:
        const growingProgress = cycleProgress
        color = deepCopy(growingColor)
        color.s = color.s * growingProgress
        opacity = growingProgress
        cellWidth = width * growingProgress
        cellHeight = height * growingProgress
        break
      default:
        color = deepCopy(aliveColor)
        opacity = 1
        cellWidth = width
        cellHeight = width
        break
    }

    const group: CellDisplayMap = {
      state,
      color,
      opacity,
      width: cellWidth,
      height: cellHeight,
      cells: []
    }
    for (let j = 0; j < stateMap[i].cells.length; j++) {
      group.cells.push(stateMap[i].cells[j])
    }

    sorted.push(group)
  }

  return sorted
}

export const getCellShape: (map: MatrixValue<CellValue>, coordinate: MatrixCoordinate, cycleIndex: number) => BorderRadii = (map, coordinate, cycleIndex) => {
  const { row, col } = coordinate
  const shape = deepCopy(ENGINE_DATA.CellShape)

  const cellTopLeft = peek(map, { row, col }, PeekDirection.UpperLeft)
  if (isCellUndefinedOrTechnicallyAlive(cellTopLeft)) {
    shape.tl = 0
  }

  const cellAbove = peek(map, { row, col }, PeekDirection.Up)
  if (isCellUndefinedOrTechnicallyAlive(cellAbove)) {
    shape.tl = 0
    shape.tr = 0
  }

  const cellTopRight = peek(map, { row, col }, PeekDirection.UpperRight)
  if (isCellUndefinedOrTechnicallyAlive(cellTopRight)) {
    shape.tr = 0
  }

  const cellLeft = peek(map, { row, col }, PeekDirection.Left)
  if (isCellUndefinedOrTechnicallyAlive(cellLeft)) {
    shape.tl = 0
    shape.bl = 0
  }

  const cellRight = peek(map, { row, col }, PeekDirection.Right)
  if (isCellUndefinedOrTechnicallyAlive(cellRight)) {
    shape.tr = 0
    shape.br = 0
  }

  const cellBottomLeft = peek(map, { row, col }, PeekDirection.LowerLeft)
  if (isCellUndefinedOrTechnicallyAlive(cellBottomLeft)) {
    shape.bl = 0
  }

  const cellBelow = peek(map, { row, col }, PeekDirection.Down)
  if (isCellUndefinedOrTechnicallyAlive(cellBelow)) {
    shape.bl = 0
    shape.br = 0
  }

  const cellBottomRight = peek(map, { row, col }, PeekDirection.LowerRight)
  if (isCellUndefinedOrTechnicallyAlive(cellBottomRight)) {
    shape.br = 0
  }

  return shape
}