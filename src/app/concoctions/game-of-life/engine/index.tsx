import {
  type MatrixValue,
  VResizeDirection,
  HResizeDirection,
  initialise,
  resize,
  reset
} from "@/utilities/matrix-operations"
import { type CellValue, type PageData } from "./types"
import ENGINE_DATA from './data'
import { getNextCycle, isCheckStatePhase, isDormantPhase, isEndPhase } from "./cycle-operations"
import { generateCells, getCellShape, getDisplayMap, getStateMap } from "./utilities"
import { type AnimatedCanvasConditionalFunction, type AnimatedCanvasRenderFunction, type AnimatedCanvasTransformFunction } from "@ihtnc/use-animated-canvas"
import { finaliseCellMapState, getCellMapState } from "./cell-state-operations"

export const initialiseCellMap = (row: number, col: number): MatrixValue<CellValue> => {
  return initialise(row, col, ENGINE_DATA.DeadCell)
}

export const isClicked: AnimatedCanvasConditionalFunction<PageData> = (data) => {
  return data.data?.clicked === true
}

export const isInDormantPhase: AnimatedCanvasConditionalFunction<PageData> = (data) => {
  if (data.data === undefined) { return false }

  const { cycleIndex } = data.data
  return isDormantPhase(cycleIndex)
}

export const generateNewCells: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined || data.data.pointerCoordinate === null) { return data }

  const { map, pointerCoordinate } = data.data
  const newMap = generateCells(map, pointerCoordinate)
  data.data.map = newMap
  return data
}

export const isInCheckStatePhase: AnimatedCanvasConditionalFunction<PageData> = (data) => {
  if (data.data === undefined) { return false }

  const { cycleIndex } = data.data
  return isCheckStatePhase(cycleIndex)
}

export const setTransitionState: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined) { return data }

  const { map } = data.data
  const newMap = getCellMapState(map)
  data.data.map = newMap
  return data
}

export const isInEndPhase: AnimatedCanvasConditionalFunction<PageData> = (data) => {
  if (data.data === undefined) { return false }

  const { cycleIndex } = data.data
  return isEndPhase(cycleIndex)
}

export const setFinalState: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined) { return data }

  const { map } = data.data
  const newMap = finaliseCellMapState(map)
  data.data.map = newMap
  return data
}

export const shouldResizeCellMap: AnimatedCanvasConditionalFunction<PageData> = (data) => {
  return data.data?.resizeMap === true
}

export const resizeCellMap: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined) { return data }

  const { width, height } = data.drawData
  const { map: value, cellWidth, cellHeight } = data.data
  const newRow = Math.floor(height / cellHeight)
  const newCol = Math.floor(width / cellWidth)

  const newValue = resize(value, newRow, newCol, ENGINE_DATA.DeadCell, VResizeDirection.Down, HResizeDirection.Right)
  data.data.map = newValue
  data.data.resizeMap = false
  return data
}

export const shouldResetCellMap: AnimatedCanvasConditionalFunction<PageData> = (data) => {
  return data.data?.resetMap === true
}

export const resetCellMap: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined) { return data }

  const { map: value } = data.data

  const newValue = reset(value, ENGINE_DATA.DeadCell)
  data.data.map = newValue
  data.data.resetMap = false
  return data
}

export const renderCellLayer: AnimatedCanvasRenderFunction<PageData> = (context, data) => {
  if (data.data === undefined) { return }

  const { map, cellWidth, cellHeight, cycleIndex, aliveColor, dyingColor, growingColor } = data.data

  const stateMap = getStateMap(map)
  const displayMap = getDisplayMap(
    stateMap,
    cycleIndex,
    cellWidth, cellHeight,
    aliveColor, dyingColor, growingColor
  )
  for(let g = 0; g < displayMap.length; g++) {
    const group = displayMap[g]

    const { h, s, l } = group.color
    const color = `HSLA(${h}, ${s}%, ${l}%, ${group.opacity})`

    context.beginPath()
    context.fillStyle = color
    context.strokeStyle = color

    for(let i = 0; i < group.cells.length; i++) {
      const { row, col } = group.cells[i]
      const cellShape = getCellShape(map, { row, col }, cycleIndex)
      const cellRadius = [cellShape.tl, cellShape.tr, cellShape.br, cellShape.bl]
      const xOffset = Math.floor((cellWidth - group.width) / 2)
      const yOffset = Math.floor((cellHeight - group.height) / 2)
      const x = (col * cellWidth) + xOffset
      const y = (row * cellHeight) + yOffset
      context.roundRect(x, y, cellWidth, cellHeight, cellRadius)
    }

    context.fill()
    context.stroke()
  }
}

export const resetCellCycle: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined) { return data }

  data.data.cycleIndex = 0
  return data
}

export const getNextCellCycle: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined) { return data }

  let cycleIndex = data.data.cycleIndex

  cycleIndex = getNextCycle(cycleIndex)

  data.data.cycleIndex = cycleIndex
  return data
}