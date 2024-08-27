import { Coordinates } from "@ihtnc/use-animated-canvas"

const getAxes = (shape: Array<Coordinates>): Array<Coordinates> => {
  const axes = []
  for (let i = 0; i < shape.length; i++) {
    const p1 = shape[i]
    const p2 = shape[(i + 1) % shape.length]
    const edge = { x: p2.x - p1.x, y: p2.y - p1.y }
    const normal = { x: edge.y, y: -edge.x }

    const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y)
    normal.x /= length
    normal.y /= length

    axes.push(normal)
  }

  return axes
}

const project = (shape: Array<Coordinates>, axis: Coordinates): { min: number, max: number } => {
  let min = Number.MAX_VALUE
  let max = Number.MIN_VALUE

  for (let i = 0; i < shape.length; i++) {
    const dot = shape[i].x * axis.x + shape[i].y * axis.y
    min = Math.min(min, dot)
    max = Math.max(max, dot)
  }

  return { min, max }
}

export const checkOverlap = (shape1: Array<Coordinates>, shape2: Array<Coordinates>): boolean => {
  const axes = getAxes(shape1).concat(getAxes(shape2))

  for (let i = 0; i < axes.length; i++) {
    const axis = axes[i]
    const p1 = project(shape1, axis)
    const p2 = project(shape2, axis)

    if (p1.max < p2.min || p1.min > p2.max) {
      return false
    }
  }

  return true
}