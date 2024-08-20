import { type HSL } from "@/utilities/drawing-operations"
import { type MatrixCoordinate, type MatrixValue } from "@/utilities/matrix-operations"

export type PageData = {
  resizeMap: boolean,
  map: MatrixValue<ParticleValue>,
  resetMap: boolean,
  currentColor: HSL,
  canGenerateParticle: boolean,
  newParticleCoordinate?: MatrixCoordinate,
  particleWidth: number,
  particleHeight: number,
}

export type ParticleValue = { color?: HSL, value: number }

export type ParticleColorMap = { color: HSL, particles: Array<MatrixCoordinate> }