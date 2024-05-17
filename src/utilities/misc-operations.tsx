import { Coordinates } from "@/components/canvas/types"

export const chooseRandom: (min: number, max: number) => number = (min, max) => {
  const range = max - min + 1
  const chosen = Math.floor(Math.random() * range)
  return min + chosen
}

export const deepCopy: <T>(value: T) => T = (value) => {
  if (value === null || typeof value !== "object") { return value }

  if (value instanceof Date) {
    const dateCopy = new Date()
    dateCopy.setTime(value.getTime())
    return dateCopy as typeof value
  }

  if (Array.isArray(value)) {
    const arrayCopy = []
    for (let i=0; i < value.length; i++) {
      arrayCopy.push(deepCopy(value[i]))
    }
    return arrayCopy as typeof value
  }

  if (value instanceof Object) {
    const objCopy = { ...value }
    const obj = value as Object
    for (let prop in value) {
      if (obj.hasOwnProperty(prop)) {
        objCopy[prop] = deepCopy(value[prop])
      }
    }
    return objCopy
  }

  return value
}

export type OperationFunction = <T>(data: T) => T;

type OperationPipelineFunction = (operations: Array<OperationFunction>) => { run: OperationFunction }
export const operationPipeline:OperationPipelineFunction = (operations) => {
  return {
    run: (value) => {
      let lastValue = value
      for (let i = 0; i < operations.length; i++) {
        lastValue = operations[i](lastValue)
      }
      return lastValue
    }
  }
}

export type AreEqualFunction<T> = (value1?: T, value2?: T) => boolean;

export const degreesToRadians = (degrees: number): number => {
  return degrees * Math.PI / 180
}

export const radiansToDegrees = (radians: number): number => {
  return radians * 180 / Math.PI
}

export const getRotatedCoordinates = (coordinates: Coordinates, pointOfRotation: Coordinates, angle: number): Coordinates => {
  const { x, y } = coordinates
  const { x: cx, y: cy } = pointOfRotation

  const radians = degreesToRadians(angle)
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const rx = cos * (x - cx) - sin * (y - cy) + cx
  const ry = sin * (x - cx) + cos * (y - cy) + cy
  return { x: rx, y: ry }
}