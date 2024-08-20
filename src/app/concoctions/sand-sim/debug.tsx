import {
  type PageData
} from "./engine/types"
import { type AnimatedCanvasRenderFunction, type AnimatedCanvasTransformFunction } from "@ihtnc/use-animated-canvas"

export const setMatrixValue: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined) { return data }

  const { map: value } = data.data
  for(let i = 0; i < value.length; i++) {
    for(let j = 0; j < value[i].length; j++) {
      if (i !== j) { continue }
      value[i][j] = { color: { h: 246, s: 92, l: 20 }, value: 1 }
    }
  }

  data.data.map = value
  return data
}

export const renderDebugLayer: AnimatedCanvasRenderFunction<PageData> = (context, data) => {
  if (data.data === undefined) { return data }

  const { map, particleWidth: width, particleHeight: height } = data.data
  const rowCount = map.length
  const colCount = map[0].length
  const lastX = (colCount - 1) * width
  const lastY = (rowCount - 1) * height
  const tl = { y: 0, x: 0 }
  const tr = { y: 0, x: lastX }
  const bl = { y: lastY, x: 0 }
  const br = { y: lastY, x: lastX }

  context.save()

  context.fillStyle = '#000000'
  const matrixSizeText = `map[${rowCount}][${colCount}];`
  const grainSizeText = `size:${width}x${height};`
  context.fillText(`${matrixSizeText} ${grainSizeText}`, 30, 10)

  context.fillStyle = '#FF0000'
  context.fillRect(tl.x, tl.y, width, height)
  context.fillText(`x=${tl.x}; y=${tl.y}`, tl.x + 30, tl.y + 30)

  context.fillStyle = '#0077FF'
  context.fillRect(tr.x, tr.y, width, height)
  context.fillText(`x=${tr.x}; y=${tr.y}`, tr.x - 50, tr.y + 30)

  context.fillStyle = '#0000FF'
  context.fillRect(bl.x, bl.y, width, height)
  context.fillText(`x=${bl.x}; y=${bl.y}`, bl.x + 30, bl.y - 30)

  context.fillStyle = '#FF00FF'
  context.fillRect(br.x, br.y, width, height)
  context.fillText(`x=${br.x}; y=${br.y}`, br.x - 50, br.y - 30)

  context.restore()
}

