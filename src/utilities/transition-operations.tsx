import { type Coordinates } from "@ihtnc/use-animated-canvas"
import { areCoordinatesEqual } from "@/components/canvas/utilities"
import { type AreEqualFunction, deepCopy } from "./misc-operations"
import { type HSL, type Size, areHSLsEqual, areSizesEqual } from "./drawing-operations"

export type TransitionProps = {
  fontSize?: number,
  size?: Size,
  location?: Coordinates,
  rotation?: number,
  opacity?: number,
  color?: HSL
};

export const areTransitionPropsEqual: AreEqualFunction<TransitionProps> = (props1, props2): boolean => {
  if (areHSLsEqual(props1?.color, props2?.color) === false) { return false }
  if (areSizesEqual(props1?.size, props2?.size) === false) { return false }
  if (areCoordinatesEqual(props1?.location, props2?.location) === false) { return false }

  if (props1?.fontSize !== props2?.fontSize) { return false }
  if (props1?.opacity !== props2?.opacity) { return false }
  if (props1?.rotation !== props2?.rotation) { return false }
  return true
}

export type TransitionOperationData = {
  startFrame: number,
  startProps: TransitionProps,
  targetProps: TransitionProps,
  duration: number,
  currentFrame: number
};
export interface TransitionOperationFunction {
  (data: TransitionOperationData): TransitionProps
}

export const calculateProgress = (data: TransitionOperationData): number => {
  const duration = data.currentFrame - data.startFrame
  if (duration < 0) { return 0 }
  if (duration > data.duration) { return 1 }

  let progress = duration / data.duration
  return progress
}

export const fadeIn: TransitionOperationFunction = (data: TransitionOperationData) => {
  let progress = calculateProgress(data)

  return {
    opacity: progress
  }
}

export const move: TransitionOperationFunction = (data: TransitionOperationData) => {
  const { startProps, targetProps } = data

  if (targetProps.location === undefined) { return {} }
  if (startProps.location === undefined) {
    return { location: deepCopy(targetProps.location) }
  }

  const progress = calculateProgress(data)

  const currentX = startProps.location.x
  const currentY = startProps.location.y
  const offsetX = targetProps.location.x - currentX
  const offsetY =  targetProps.location.y - currentY

  return {
    location: {
      x: currentX + (offsetX * progress),
      y: currentY + (offsetY * progress)
    }
  }
}

export const resizeFont: TransitionOperationFunction = (data: TransitionOperationData) => {
  const { startProps, targetProps } = data

  if (targetProps.fontSize === undefined) { return {} }
  if (startProps.fontSize === undefined) {
    return { fontSize: targetProps.fontSize }
  }

  const progress = calculateProgress(data)

  const current = startProps.fontSize
  const offset = targetProps.fontSize - current

  return {
    fontSize: current + (offset * progress)
  }
}

export const freeRotate: TransitionOperationFunction = (data: TransitionOperationData) => {
  const { startProps, targetProps } = data

  if (targetProps.rotation === undefined) { return {} }
  if (startProps.rotation === undefined) {
    return { rotation: targetProps.rotation }
  }

  const offset = targetProps.rotation - startProps.rotation

  return rotate(data, startProps.rotation, offset)
}

export const minRotate: TransitionOperationFunction = (data: TransitionOperationData) => {
  const { startProps, targetProps } = data

  if (targetProps.rotation === undefined) { return {} }
  if (startProps.rotation === undefined) {
    return { rotation: targetProps.rotation }
  }

  const current = (startProps.rotation % 360)
  const target = (targetProps.rotation % 360)

  let offset = target - current
  offset = offset > 180 ? offset - 360 : offset
  offset = offset < -180 ? offset + 360 : offset

  return rotate(data, current, offset)
}

const rotate = (data: TransitionOperationData, current: number, offset: number) => {
  const { startProps, targetProps } = data

  if (targetProps.rotation === undefined) { return {} }
  if (startProps.rotation === undefined) {
    return { rotation: targetProps.rotation }
  }

  const progress = calculateProgress(data)

  return {
    rotation: current + (offset * progress)
  }
}

export type Transition = {
  id: string,
  startFrame: number,
  startProps: TransitionProps,
  targetProps: TransitionProps,
  duration: number,
  operation: TransitionOperationFunction
};

type RunTransitionFunction = (transition: Transition, currentFrame: number) => TransitionProps;
export const runTransition: RunTransitionFunction = (transition, currentFrame) => {
  const data: TransitionOperationData = {
    startFrame: transition.startFrame,
    startProps: transition.startProps,
    targetProps: transition.targetProps,
    duration: transition.duration,
    currentFrame
  }

  const props = transition.operation(data)
  return props
}