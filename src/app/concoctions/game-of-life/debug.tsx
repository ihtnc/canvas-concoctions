import {
  type PageData,
  CellState,
  CycleState
} from "./engine/types"
import { type AnimatedCanvasRenderFunction, type AnimatedCanvasTransformFunction } from "@ihtnc/use-animated-canvas"

export const setMatrixValue: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined) { return data }

  const { map: value } = data.data
  value[0][2] = { state: CellState.Alive }
  value[1][0] = { state: CellState.Alive }
  value[1][2] = { state: CellState.Alive }
  value[2][1] = { state: CellState.Alive }
  value[2][2] = { state: CellState.Alive }

  return data
}

type RenderDebugObject = {
  cycleState: CycleState,
  buttonState: string
}
type GetRenderDebugLayerFunction = (debug: RenderDebugObject) => AnimatedCanvasRenderFunction<PageData>
export const getRenderDebugLayer: GetRenderDebugLayerFunction = (debug) => {
  const renderDebug: AnimatedCanvasRenderFunction<PageData> = (context, data) => {
    if (data.data === undefined) { return }

    const { map, cellWidth, cellHeight, cycleIndex } = data.data
    const rowCount = map.length
    const colCount = map[0].length
    const lastX = (colCount - 1) * cellWidth
    const lastY = (rowCount - 1) * cellHeight
    const tl = { y: 0, x: 0 }
    const tr = { y: 0, x: lastX }
    const bl = { y: lastY, x: 0 }
    const br = { y: lastY, x: lastX }

    const { buttonState, cycleState } = debug
    context.fillStyle = '#000000'
    const matrixSizeText = `map[${rowCount}][${colCount}];`
    const cellSizeText = `size:${cellWidth}x${cellHeight};`
    const cycleStateText = `state:${CycleState[cycleState]};`
    const cycleText = `cycle:${cycleIndex};`
    const buttonStateText = `button:${buttonState};`
    context.fillText(`${matrixSizeText} ${cellSizeText}`, 30, 10)
    context.fillText(`${buttonStateText} ${cycleStateText} ${cycleText}`, 30, 20)

    context.fillStyle = '#FF0000'
    context.fillRect(tl.x, tl.y, cellWidth, cellHeight)
    context.fillText(`x=${tl.x}; y=${tl.y}`, tl.x + 30, tl.y + 30)

    context.fillStyle = '#0077FF'
    context.fillRect(tr.x, tr.y, cellWidth, cellHeight)
    context.fillText(`x=${tr.x}; y=${tr.y}`, tr.x - 50, tr.y + 30)

    context.fillStyle = '#0000FF'
    context.fillRect(bl.x, bl.y, cellWidth, cellHeight)
    context.fillText(`x=${bl.x}; y=${bl.y}`, bl.x + 30, bl.y - 30)

    context.fillStyle = '#FF00FF'
    context.fillRect(br.x, br.y, cellWidth, cellHeight)
    context.fillText(`x=${br.x}; y=${br.y}`, br.x - 50, br.y - 30)
  }

  return renderDebug
}