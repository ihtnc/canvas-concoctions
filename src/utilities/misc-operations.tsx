import { Coordinates } from "@/components/canvas/types"

export const chooseRandom: (min: number, max: number) => number = (min, max) => {
  const range = max - min + 1
  const chosen = Math.floor(Math.random() * range)
  return min + chosen
}

export const chooseOption: <T>(options: Array<T>) => T = (options) => {
  const chosen = chooseRandom(0, options.length - 1)
  return options[chosen]
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
export type ConditionalFunction = <T>(data: T) => boolean;
type ConditionalOperationObject = {
  condition: ConditionalFunction | Array<ConditionalFunction>,
  operation: OperationFunction | Array<OperationFunction>
};

type OperationPipelineFunction = (operations: Array<OperationFunction | ConditionalOperationObject>) => { run: OperationFunction }
export const operationPipeline:OperationPipelineFunction = (operations) => {
  return {
    run: (value) => {
      let lastValue = value
      for (let i = 0; i < operations.length; i++) {
        const item = operations[i]
        lastValue = runOperation(lastValue, item)
      }

      return lastValue
    }
  }
}

type RunOperationFunction = <T>(data: T, fn: OperationFunction | ConditionalOperationObject) => T;
const runOperation: RunOperationFunction = (data, fn) => {
  if (typeof fn === 'function') {
    const run = fn as OperationFunction
    return run(data)
  }

  if (typeof fn === 'object' && 'operation' in fn && 'condition' in fn) {
    const conditionalOperation = fn as ConditionalOperationObject

    if (typeof conditionalOperation.condition === 'function') {
      const conditionalFn = conditionalOperation.condition as ConditionalFunction
      if (conditionalFn(data) === false) { return data }
    }

    if (Array.isArray(conditionalOperation.condition)) {
      let conditionalFns = conditionalOperation.condition as Array<ConditionalFunction>
      if (conditionalFns.some((fn) => fn(data) === false)) { return data }
    }

    if (typeof conditionalOperation.operation === 'function') {
      const runFn = conditionalOperation.operation as OperationFunction
      return runFn(data)
    }

    if (Array.isArray(conditionalOperation.operation)) {
      let runFns = conditionalOperation.operation as Array<OperationFunction>
      let result = data
      for (let i = 0; i < runFns.length; i++) {
        result = runFns[i](result)
      }

      return result
    }
  }

  return data
}

type ConditionalOperationFunction = <T>(condition: ((data: T) => boolean) | Array<(data: T) => boolean>, operation: ((data: T) => T) | (Array<(data: T) => T>)) => ConditionalOperationObject;
export const when:ConditionalOperationFunction = (condition, operation) => {
  return {
    condition: condition as ConditionalFunction | Array<ConditionalFunction>,
    operation: operation as OperationFunction | Array<OperationFunction>
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
