import {
  deepCopy
} from "@/utilities/misc-operations"
import {
  type BorderRadii,
} from "@/utilities/drawing-operations"
import {
  type MatrixValue,
  type MatrixCoordinate,
  VResizeDirection,
  PeekDirection,
  initialise,
  resize,
  reset,
  peek
} from "@/utilities/matrix-operations"
import ENGINE_DATA from './data'
import { type ParticleValue, type PageData } from "./types"
import type { AnimatedCanvasConditionalFunction, AnimatedCanvasRenderFunction, AnimatedCanvasTransformFunction } from "@ihtnc/use-animated-canvas"
import { calculateDistance, getColorMap, getNextCoordinate, getNextValue, isValueEmpty, isValueUndefinedOrNotEmpty } from "./utilities"

type InitialiseParticleMapFunction = (row: number, col: number) => MatrixValue<ParticleValue>;
export const initialiseParticleMap: InitialiseParticleMapFunction = (row, col) => {
  return initialise(row, col, ENGINE_DATA.EmptyParticle)
}

export const canGenerateParticle: AnimatedCanvasConditionalFunction<PageData> = (data) => {
  return data.data?.canGenerateParticle === true
}

export const generateParticles: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined) { return data }

  const {
    map: value,
    currentColor: color,
    newParticleCoordinate: coordinate
  } = data.data

  if (coordinate === undefined) { return data }

  const { row, col } = coordinate
  if (row < 0 || row >= value.length) { return data }
  if (col < 0 || col >= value[row].length) { return data }

  value[row][col] = {
    color: deepCopy(color),
    value: ENGINE_DATA.InitialValue
  }

  data.data.map = value
  return data
}

export const dropParticles: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined) { return data }

  const { map: newValue } = data.data
  const value = deepCopy(newValue)
  const coordinate: MatrixCoordinate = { row: 0, col: 0 }

  for (let i = 0; i < value.length; i++) {
    for (let j = 0; j < value[i].length; j++) {
      const currentValue = value[i][j]
      if (isValueEmpty(currentValue)) { continue }

      coordinate.row = i
      coordinate.col = j
      const particleBelow = peek(value, coordinate, PeekDirection.Down)
      if (isValueUndefinedOrNotEmpty(particleBelow)) { continue }

      const distance = calculateDistance(currentValue.value)
      let actualValue = Math.floor(distance)
      let currentRow = i
      let currentCol = j

      const current: MatrixCoordinate = {
        row: currentRow,
        col: currentCol
      }
      while(--actualValue >= 0) {
        const next = getNextCoordinate(value, current)
        if (next === undefined) { break }

        newValue[next.row][next.col] = deepCopy(currentValue)
        newValue[current.row][current.col] = deepCopy(ENGINE_DATA.EmptyParticle)

        current.row = next.row
        current.col = next.col
      }
    }
  }

  data.data.map = newValue
  return data
}

export const increaseParticleValue: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined) { return data }

  const { map: value } = data.data
  const coordinate: MatrixCoordinate = { row: 0, col: 0 }
  for (let i = 0; i < value.length; i++) {
    for (let j = 0; j < value[i].length; j++) {
      const currentValue = value[i][j]
      if (isValueEmpty(currentValue)) { continue }

      coordinate.row = i
      coordinate.col = j
      const particleBelow = peek(value, coordinate, PeekDirection.Down)
      if (isValueUndefinedOrNotEmpty(particleBelow)) { continue }

      value[i][j] = getNextValue(currentValue)
    }
  }

  data.data.map = value
  return data
}

export const shouldResizeParticleMap: AnimatedCanvasConditionalFunction<PageData> = (data) => {
  return data.data?.resizeMap === true
}

export const resizeParticleMap: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined) { return data }

  const { width, height } = data.drawData
  const { map: value, particleWidth, particleHeight } = data.data
  const newRow = Math.floor(height / particleHeight)
  const newCol = Math.floor(width / particleWidth)

  const newValue = resize(value, newRow, newCol, ENGINE_DATA.EmptyParticle, VResizeDirection.Up, undefined)
  data.data.map = newValue
  data.data.resizeMap = false
  return data
}

export const shouldResetParticleMap: AnimatedCanvasConditionalFunction<PageData> = (data) => {
  return data.data?.resetMap === true
}

export const resetParticleMap: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined) { return data }

  const { map: value } = data.data

  const newValue = reset(value, ENGINE_DATA.EmptyParticle)
  data.data.map = newValue
  data.data.resetMap = false
  return data
}

export const renderParticleLayer: AnimatedCanvasRenderFunction<PageData> = (context, data) => {
  if (data.data === undefined) { return }

  const { map, particleWidth: width, particleHeight: height } = data.data
  let shape: BorderRadii = { tl: 0, tr: 0, bl: 0, br: 0 }

  const colorMap = getColorMap(map)
  for(let g = 0; g < colorMap.length; g++) {
    const group = colorMap[g]

    const { h, s, l } = group.color
    const color = `HSL(${h}, ${s}%, ${l}%)`

    context.beginPath()
    context.fillStyle = color
    context.strokeStyle = color

    for(let i = 0; i < group.particles.length; i++) {
      const { row, col } = group.particles[i]
      shape.tl = ENGINE_DATA.ParticleShape.tl
      shape.tr = ENGINE_DATA.ParticleShape.tr
      shape.bl = ENGINE_DATA.ParticleShape.bl
      shape.br = ENGINE_DATA.ParticleShape.br

      const particleAbove = peek(map, { row, col }, PeekDirection.Up)
      if (isValueUndefinedOrNotEmpty(particleAbove)) {
        shape.tl = 0
        shape.tr = 0
      }

      const particleBelow = peek(map, { row, col }, PeekDirection.Down)
      if (isValueUndefinedOrNotEmpty(particleBelow)) {
        shape.bl = 0
        shape.br = 0
      }

      const particleRadius = [shape.tl, shape.tr, shape.br, shape.bl]
      context.roundRect(col * width, row * height, width, height, particleRadius)
    }

    context.fill()
    context.stroke()
  }
}
