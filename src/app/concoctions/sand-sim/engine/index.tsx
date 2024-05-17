import {
  deepCopy
} from "@/utilities/misc-operations"
import {
  type HSL,
  type RenderFunction,
  runRenderPipeline
} from "@/utilities/drawing-operations"
import {
  type MatrixValue,
  type MatrixCoordinate,
  VResizeDirection,
  copy,
  initialise,
  resize,
  matrixPipeline,
  reset
} from "@/utilities/matrix-operations"
import ENGINE_DATA from './data'
import { type ParticleOperationFunction, type RenderPipelineData, type ParticleValue } from "./types"
import { dropParticles, increaseParticleValue } from "./operations"
import { renderParticleLayer } from "./render"

type InitialiseParticleMapFunction = (row: number, col: number) => MatrixValue<ParticleValue>;
export const initialiseParticleMap: InitialiseParticleMapFunction = (row, col) => {
  return initialise(row, col, ENGINE_DATA.EmptyParticle)
}

type ResizeParticleMapFunction = (value: MatrixValue<ParticleValue>, newRow: number, newCol: number) => MatrixValue<ParticleValue>;
export const resizeParticleMap: ResizeParticleMapFunction = (value, newRow, newCol) => {
  return resize(value, newRow, newCol, ENGINE_DATA.EmptyParticle, VResizeDirection.Up, undefined)
}

export const resetParticleMap: ParticleOperationFunction = (value: MatrixValue<ParticleValue>) => {
  return reset(value, ENGINE_DATA.EmptyParticle)
}

type GenerateParticlesFunction = (value: MatrixValue<ParticleValue>, color: HSL, coordinate: MatrixCoordinate) => MatrixValue<ParticleValue>;
const generateParticles: GenerateParticlesFunction = (value, color, coordinate) => {
  const { row, col } = coordinate
  if (row >= value.length) { return value }
  if (col >= value[row].length) { return value }

  value[row][col] = {
    color: deepCopy(color),
    value: ENGINE_DATA.InitialValue
  }
  return value
}

type ProcessParticleMapFunction = (value: MatrixValue<ParticleValue>, color: HSL, newParticle?: MatrixCoordinate) => MatrixValue<ParticleValue>;
export const processParticleMap: ProcessParticleMapFunction = (value, color, newParticle) => {
  const addNewParticles: ParticleOperationFunction = (value: MatrixValue<ParticleValue>) => {
    return newParticle === undefined
      ? value
      : generateParticles(value, color, newParticle)
  }

  const newValue = matrixPipeline([
    copy,
    addNewParticles,
    dropParticles,
    increaseParticleValue
  ]).run(value)

  return newValue
}

type RenderParticleMapFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData, pre?: Array<RenderFunction>, post?: Array<RenderFunction>) => void;
export const renderParticleMap: RenderParticleMapFunction = (context, data, pre, post) => {
  runRenderPipeline(context, data, renderParticleLayer, pre, post)
}
