import { MockInstance, afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import {
  type TransitionOperationData,
  type TransitionProps,
  type TransitionOperationFunction,
  type Transition,
  areTransitionPropsEqual,
  calculateProgress,
  fadeIn,
  move,
  resizeFont,
  freeRotate,
  minRotate,
  runTransition
} from './transition-operations'
import * as canvasUtilities from '@/components/canvas/utilities'
import * as drawingOperations from './drawing-operations'
import { type Coordinates } from "@/components/canvas/types"

describe('transition operations', () => {

  describe('areTransitionPropsEqual function', () => {
    let props1: TransitionProps
    let props2: TransitionProps

    let areCoordinatesEqual: MockInstance
    let areHSLsEqual: MockInstance
    let areSizesEqual: MockInstance

    beforeEach(() => {
      props1 = {}
      props2 = {}

      areCoordinatesEqual = vi.spyOn(canvasUtilities, 'areCoordinatesEqual')
      areHSLsEqual = vi.spyOn(drawingOperations, 'areHSLsEqual')
      areSizesEqual = vi.spyOn(drawingOperations, 'areSizesEqual')

      areCoordinatesEqual.mockReturnValue(true)
      areHSLsEqual.mockReturnValue(true)
      areSizesEqual.mockReturnValue(true)
    })

    afterEach(() => {
      vi.resetAllMocks()
    })

    test('should return true when comparing TransitionProps to itself', () => {
      areCoordinatesEqual.mockRestore()
      areHSLsEqual.mockRestore()
      areSizesEqual.mockRestore()

      props1.color = { h: 1, s: 2, l: 3 }
      props1.size = { width: 4, height: 5 }
      props1.location = { x: 6, y: 7 }
      props1.fontSize = 8
      props1.opacity = 9
      props1.rotation = 10

      const result = areTransitionPropsEqual(props1, props1)
      expect(result).toBe(true)
    })

    test('should call areHSLsEqual', () => {
      props1.color = { h: 1, s: 2, l: 3 }
      props2.color = { h: 4, s: 5, l: 6 }

      areTransitionPropsEqual(props1, props2)

      expect(areHSLsEqual).toHaveBeenCalledWith(props1.color, props2.color)
    })

    test('should return false if areHSLsEqual is false', () => {
      areHSLsEqual.mockReset()
      areHSLsEqual.mockReturnValue(false)

      const actual = areTransitionPropsEqual(props1, props2)

      expect(actual).toBe(false)
    })

    test('should call areSizesEqual', () => {
      props1.size = { width: 1, height: 2 }
      props2.size = { width: 3, height: 4 }

      areTransitionPropsEqual(props1, props2)

      expect(areSizesEqual).toHaveBeenCalledWith(props1.size, props2.size)
    })

    test('should return false if areSizesEqual is false', () => {
      areSizesEqual.mockReset()
      areSizesEqual.mockReturnValue(false)

      const actual = areTransitionPropsEqual(props1, props2)

      expect(actual).toBe(false)
    })

    test('should call areCoordinatesEqual', () => {
      props1.location = { x: 1, y: 2 }
      props2.location = { x: 3, y: 4 }

      areTransitionPropsEqual(props1, props2)

      expect(areCoordinatesEqual).toHaveBeenCalledWith(props1.location, props2.location)
    })

    test('should return false if areCoordinatesEqual is false', () => {
      areCoordinatesEqual.mockReset()
      areCoordinatesEqual.mockReturnValue(false)

      const actual = areTransitionPropsEqual(props1, props2)

      expect(actual).toBe(false)
    })

    test('should return false if fontSize are not equal', () => {
      props1.fontSize = 1
      props2.fontSize = 2

      const actual = areTransitionPropsEqual(props1, props2)

      expect(actual).toBe(false)
    })

    test('should return false if opacity are not equal', () => {
      props1.opacity = 1
      props2.opacity = 2

      const actual = areTransitionPropsEqual(props1, props2)

      expect(actual).toBe(false)
    })

    test('should return false if rotation are not equal', () => {
      props1.rotation = 1
      props2.rotation = 2

      const actual = areTransitionPropsEqual(props1, props2)

      expect(actual).toBe(false)
    })

    test('should return true if all are equal', () => {
      props1.fontSize = 1
      props2.fontSize = 1
      props1.opacity = 2
      props2.opacity = 2
      props1.rotation = 3
      props2.rotation = 3

      const actual = areTransitionPropsEqual(props1, props2)

      expect(actual).toBe(true)
    })

    test('should handle undefined props1', () => {
      areCoordinatesEqual.mockRestore()
      areHSLsEqual.mockRestore()
      areSizesEqual.mockRestore()

      props2.color = { h: 1, s: 2, l: 3 }
      props2.size = { width: 4, height: 5 }
      props2.location = { x: 6, y: 7 }
      props2.fontSize = 8
      props2.opacity = 9
      props2.rotation = 10

      const result = areTransitionPropsEqual(undefined, props2)
      expect(result).toBe(false)
    })

    test('should handle undefined props2', () => {
      areCoordinatesEqual.mockRestore()
      areHSLsEqual.mockRestore()
      areSizesEqual.mockRestore()

      props1.color = { h: 1, s: 2, l: 3 }
      props1.size = { width: 4, height: 5 }
      props1.location = { x: 6, y: 7 }
      props1.fontSize = 8
      props1.opacity = 9
      props1.rotation = 10

      const result = areTransitionPropsEqual(props1, undefined)
      expect(result).toBe(false)
    })

    test('should return true if both are undefined', () => {
      const result = areTransitionPropsEqual(undefined, undefined)
      expect(result).toBe(true)
    })
  })

  describe('calculateProgress function', () => {
    test.each([
      { frame: 99 },
      { frame: 0 }
    ])('should handle early frames ($frame < 100)', ({ frame }: { frame: number }) => {
      const data: TransitionOperationData = {
        startFrame: 100,
        currentFrame: frame,
        duration: 50,
        startProps: {},
        targetProps: {}
      }

      const result = calculateProgress(data)

      expect(result).toBe(0)
    })

    test.each([
      { frame: 151 },
      { frame: 200 }
    ])('should handle late frames ($frame > 150)', ({ frame }: { frame: number }) => {
      const data: TransitionOperationData = {
        startFrame: 100,
        currentFrame: frame,
        duration: 50,
        startProps: {},
        targetProps: {}
      }

      const result = calculateProgress(data)

      expect(result).toBe(1)
    })

    test.each([
        { frame: 0, expected: 0 },
        { frame: 50, expected: 0.5 },
        { frame: 1, expected: 0.01 },
        { frame: 99, expected: 0.99 },
        { frame: 100, expected: 1 }
      ])('should calculate progress correctly ($frame/100)', ({ frame, expected }: { frame: number, expected: number }) => {
        const data: TransitionOperationData = {
          startFrame: 0,
          currentFrame: frame,
          duration: 100,
          startProps: {},
          targetProps: {}
        }

        const result = calculateProgress(data)

        expect(result).toBe(expected)
      })
  })

  describe('fadeIn function', () => {
    let data: TransitionOperationData

    beforeEach(() => {
      data ={
        startFrame: 0,
        duration: 100,
        currentFrame: 0,
        startProps: {},
        targetProps: {}
      }
    })

    test.each([
      { frame: 0, expected: 0 },
      { frame: 1, expected: 0.01 },
      { frame: 50, expected: 0.5 },
      { frame: 99, expected: 0.99 },
      { frame: 100, expected: 1 },
    ])('should calculate opacity correctly ($frame/100)', ({ frame, expected }: { frame: number, expected: number }) => {
      data.currentFrame = frame

      const actual = fadeIn(data)

      expect(actual.opacity).toBe(expected)
    })

    test('should ignore startProps opacity', () => {
      data.startProps.opacity = 0.5

      const actual = fadeIn(data)

      expect(actual.opacity).toBe(0)
    })

    test('should ignore targetProps opacity', () => {
      data.targetProps.opacity = 0.5
      data.currentFrame = 100

      const actual = fadeIn(data)

      expect(actual.opacity).toBe(1)
    })

    test('should only return opacity', () => {
      const actual = fadeIn(data)

      const fields = Object.keys(actual)

      expect(fields).toHaveLength(1)
      expect(fields[0]).toBe('opacity')
    })
  })

  describe('move function', () => {
    let data: TransitionOperationData

    beforeEach(() => {
      data ={
        startFrame: 0,
        duration: 100,
        currentFrame: 0,
        startProps: {},
        targetProps: {}
      }
    })

    test('should return empty props if targetProps.location is undefined', () => {
      const actual = move(data)

      expect(actual).toStrictEqual({})
    })

    test('should return targetProps.location value if startProps.location is undefined', () => {
      const location: Coordinates = { x: 1, y: 2 }
      const { targetProps } = data
      targetProps.location = location

      const actual = move(data)

      expect(actual.location).not.toBe(targetProps.location)
      expect(actual.location).toStrictEqual(targetProps.location)
    })

    test.each([
      { frame: 0, expectedX: 0, expectedY: 100 },
      { frame: 1, expectedX: 0.5, expectedY: 99 },
      { frame: 50, expectedX: 25, expectedY: 50 },
      { frame: 99, expectedX: 49.5, expectedY: 1 },
      { frame: 100, expectedX: 50, expectedY: 0 },
    ])('should calculate location based on startProps and targetProps location values ($frame/100)', ({ frame, expectedX, expectedY }: { frame: number, expectedX: number, expectedY: number }) => {
      data.startProps.location = { x: 0, y: 100 }
      data.targetProps.location = { x: 50, y: 0 }
      data.currentFrame = frame

      const actual = move(data)

      const expected: Coordinates = {
        x: expectedX, y: expectedY
      }
      expect(actual.location).toStrictEqual(expected)
    })

    test('should only return location', () => {
      data.startProps.location = { x: 0, y: 100 }
      data.targetProps.location = { x: 100, y: 200 }

      const actual = move(data)

      const fields = Object.keys(actual)

      expect(fields).toHaveLength(1)
      expect(fields[0]).toBe('location')
    })
  })

  describe('resizeFont function', () => {
    let data: TransitionOperationData

    beforeEach(() => {
      data ={
        startFrame: 0,
        duration: 100,
        currentFrame: 0,
        startProps: {},
        targetProps: {}
      }
    })

    test('should return empty props if targetProps.fontSize is undefined', () => {
      const actual = resizeFont(data)

      expect(actual).toStrictEqual({})
    })

    test('should return targetProps.fontSize value if startProps.fontSize is undefined', () => {
      const fontSize = 1
      const { targetProps } = data
      targetProps.fontSize = fontSize

      const actual = resizeFont(data)

      expect(actual.fontSize).toBe(targetProps.fontSize)
    })

    test.each([
      { frame: 0, expected: 25 },
      { frame: 1, expected: 26 },
      { frame: 50, expected: 75 },
      { frame: 99, expected: 124 },
      { frame: 100, expected: 125 },
    ])('should calculate fontSize based on startProps and targetProps ($frame/100)', ({ frame, expected }: { frame: number, expected: number }) => {
      data.startProps.fontSize = 25
      data.targetProps.fontSize = 125
      data.currentFrame = frame

      const actual = resizeFont(data)

      expect(actual.fontSize).toBe(expected)
    })

    test('should only return fontSize', () => {
      data.startProps.fontSize = 25
      data.targetProps.fontSize = 75

      const actual = resizeFont(data)

      const fields = Object.keys(actual)

      expect(fields).toHaveLength(1)
      expect(fields[0]).toBe('fontSize')
    })
  })

  describe('runTransition function', () => {
    let operationFn: MockInstance
    let transition: Transition

    beforeEach(() => {
      operationFn = vi.fn()

      transition = {
        id: 'test',
        startFrame: 0,
        startProps: { fontSize: 10 },
        targetProps: { fontSize: 20 },
        duration: 50,
        operation: operationFn as unknown as TransitionOperationFunction
      }
    })

    afterEach(() => {
      vi.resetAllMocks()
    })

    test('should call operation property', () => {
      const currentFrame = 10

      runTransition(transition, currentFrame)

      const expectedData: TransitionOperationData = {
        startFrame: transition.startFrame,
        startProps: transition.startProps,
        targetProps: transition.targetProps,
        duration: transition.duration,
        currentFrame
      }
      expect(operationFn).toHaveBeenCalledWith(expectedData)
    })

    test('should return operation response', () => {
      const expected: TransitionProps = {}
      operationFn.mockReturnValue(expected)

      const actual = runTransition(transition, 20)

      expect(actual).toBe(expected)
    })
  })

  describe('freeRotate function', () => {
    let data: TransitionOperationData

    beforeEach(() => {
      data ={
        startFrame: 0,
        duration: 100,
        currentFrame: 0,
        startProps: {},
        targetProps: {}
      }
    })

    test('should return an empty object if targetProps.rotation is undefined', () => {
      const actual = freeRotate(data)

      expect(actual).toStrictEqual({})
    })

    test('should return targetProps.rotation value if startProps.rotation is undefined', () => {
      const rotation = 90
      const { targetProps } = data
      targetProps.rotation = rotation

      const actual = freeRotate(data)

      expect(actual.rotation).toBe(rotation)
    })

    test.each([
      { frame: 0, expected: 0 },
      { frame: 50, expected: 45 },
      { frame: 100, expected: 90 },
    ])('should calculate rotation progress based on currentFrame value ($frame/100)', ({ frame, expected }) => {
      data.startProps.rotation = 0
      data.targetProps.rotation = 90
      data.currentFrame = frame

      const actual = freeRotate(data)

      expect(actual.rotation).toBe(expected)
    })

    test.each([
      { startRotation: 0, targetRotation: 360 * 4, expected: 360 * 2 },
      { startRotation: 0, targetRotation: -90 * 8, expected: -90 * 4 },
      { startRotation: 90, targetRotation: 90 * 6, expected: 90 + (90 * 6 - 90) / 100 * 50 },
      { startRotation: 90, targetRotation: -90 * 6, expected: 90 + (-90 * 6 - 90) / 100 * 50 },
      { startRotation: -90, targetRotation: 270 * 2, expected: -90 + (270 * 2 + 90) / 100 * 50 },
      { startRotation: -90, targetRotation: -270 * 2, expected: -90 + (-270 * 2 + 90) / 100 * 50 }
    ])('should calculate rotation based on currentProps and targetProps values ($startRotation/$targetRotation)', ({ startRotation, targetRotation, expected }) => {
      data.startProps.rotation = startRotation
      data.targetProps.rotation = targetRotation
      data.currentFrame = 50

      const actual = freeRotate(data)

      expect(actual.rotation).toBe(expected)
    })

    test('should only return rotation', () => {
      data.startProps.rotation = 25
      data.targetProps.rotation = 75

      const actual = freeRotate(data)

      const fields = Object.keys(actual)

      expect(fields).toHaveLength(1)
      expect(fields[0]).toBe('rotation')
    })
  })

  describe('minRotate function', () => {
    let data: TransitionOperationData

    beforeEach(() => {
      data ={
        startFrame: 0,
        duration: 100,
        currentFrame: 0,
        startProps: {},
        targetProps: {}
      }
    })

    test('should return an empty object if targetProps.rotation is undefined', () => {
      const actual = minRotate(data)

      expect(actual).toStrictEqual({})
    })

    test('should return targetProps.rotation value if startProps.rotation is undefined', () => {
      const rotation = 90
      const { targetProps } = data
      targetProps.rotation = rotation

      const actual = minRotate(data)

      expect(actual.rotation).toBe(rotation)
    })

    test.each([
      { frame: 0, expected: 0 },
      { frame: 50, expected: 45 },
      { frame: 100, expected: 90 },
    ])('should calculate rotation progress based on currentFrame value ($frame/100)', ({ frame, expected }) => {
      data.startProps.rotation = 0
      data.targetProps.rotation = 90
      data.currentFrame = frame

      const actual = minRotate(data)

      expect(actual.rotation).toBe(expected)
    })

    test.each([
      { startRotation: 90, expected: 90 },
      { startRotation: 180, expected: 180 },
      { startRotation: 270, expected: 270 },
      { startRotation: 360, expected: 0 },
      { startRotation: -90, expected: -90 },
      { startRotation: -180, expected: -180 },
      { startRotation: -270, expected: -270 },
      { startRotation: -360, expected: 0 },
      { startRotation: 90 * 5, expected: 90 },
      { startRotation: 90 * 7, expected: 270 },
      { startRotation: -180 * 3, expected: -180 },
      { startRotation: -270 * 3, expected: -90 }
    ])('should normalise startProps rotation within 360 degress ($startRotation)', ({ startRotation, expected }) => {
      data.startProps.rotation = startRotation
      data.targetProps.rotation = 0
      data.currentFrame = 0

      const actual = minRotate(data)

      expect(actual.rotation).toBe(expected)
    })

    test.each([
      { targetRotation: 90, expected: 45 },
      { targetRotation: 180, expected: 90 },
      { targetRotation: 270, expected: -45 },
    ])('should reverse rotation when greater than 180 degrees ($targetRotation)', ({ targetRotation, expected }) => {
      data.startProps.rotation = 0
      data.targetProps.rotation = targetRotation
      data.currentFrame = 50

      const actual = minRotate(data)

      expect(actual.rotation).toBe(expected)
    })

    test.each([
      { targetRotation: -90, expected: -45 },
      { targetRotation: -180, expected: -90 },
      { targetRotation: -270, expected: 45 },
    ])('should reverse rotation when less than -180 degrees ($targetRotation)', ({ targetRotation, expected }) => {
      data.startProps.rotation = 0
      data.targetProps.rotation = targetRotation
      data.currentFrame = 50

      const actual = minRotate(data)

      expect(actual.rotation).toBe(expected)
    })

    test('should only return rotation', () => {
      data.startProps.rotation = 25
      data.targetProps.rotation = 75

      const actual = minRotate(data)

      const fields = Object.keys(actual)

      expect(fields).toHaveLength(1)
      expect(fields[0]).toBe('rotation')
    })
  })
})