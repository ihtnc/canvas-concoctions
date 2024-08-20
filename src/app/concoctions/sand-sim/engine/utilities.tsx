import { type ParticleColorMap, type ParticleValue } from "./types"
import ENGINE_DATA from './data'
import { type MatrixCoordinate, type MatrixValue, PeekDirection, peek } from "@/utilities/matrix-operations"
import { chooseRandom, deepCopy } from "@/utilities/misc-operations"
import { areHSLsEqual } from "@/utilities/drawing-operations"

export const isValueUndefinedOrNotEmpty = (particle?: ParticleValue): boolean => {
  return particle === undefined || !isValueEmpty(particle)
}

export const isValueEmpty = (particle: ParticleValue): boolean => {
  return particle.color === undefined || particle.value === ENGINE_DATA.EmptyParticle.value
}

export const calculateDistance = (time: number): number => {
  // distance = (initialVelocity * time) + (0.5 * acceleration * time^2)
  const initial = time * ENGINE_DATA.InitialVelocity
  const accelaration = (0.5 * ENGINE_DATA.Acceleration * time * time)
  return initial + accelaration
}

export const getNextCoordinate = (value: MatrixValue<ParticleValue>, current: MatrixCoordinate): MatrixCoordinate | undefined => {
  let direction: PeekDirection = PeekDirection.Down
  let retryCount: number = 0

  while (retryCount < 2) {
    const particleBelow = peek(value, current, direction)
    if (particleBelow === undefined) { return undefined }

    if (isValueEmpty(particleBelow)) {
      const next: MatrixCoordinate = {
        row: current.row + 1,
        col: current.col
      }

      if (direction === PeekDirection.LowerLeft) { next.col = current.col - 1 }
      else if (direction === PeekDirection.LowerRight) { next.col = current.col + 1 }

      return next
    }

    const option = chooseRandom(1, 100)
    if (option <= 48) { direction = PeekDirection.LowerLeft }
    else if (option <= 52) { return undefined }
    else { direction = PeekDirection.LowerRight }

    retryCount++
  }

  return undefined
}

export const getNextValue = (particle: ParticleValue): ParticleValue => {
  const nextValue = deepCopy(particle)
  nextValue.value = nextValue.value + ENGINE_DATA.IncrementValue
  return deepCopy(nextValue)
}

export const getColorMap = (value: MatrixValue<ParticleValue>): Array<ParticleColorMap> => {
  const sorted: Array<ParticleColorMap> = []

  for (let i = 0; i < value.length; i++) {
    for (let j = 0; j < value[i].length; j++) {
      if (value[i][j].color === undefined) { continue }

      const color = value[i][j].color!
      let group = sorted.find(item => areHSLsEqual(item.color, color))
      if (group === undefined) {
        const newLength = sorted.push({ color: deepCopy(color), particles: [] })
        group = sorted[newLength - 1]
      }
      group.particles.push({ row: i, col: j })
    }
  }

  return sorted
}