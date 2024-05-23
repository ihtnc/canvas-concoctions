import { afterEach, describe, expect, test, vi } from "vitest"
import { chooseOption, chooseRandom, deepCopy, degreesToRadians, getRotatedCoordinates, operationPipeline, radiansToDegrees } from "./misc-operations"

describe('misc operations', () => {

  describe('chooseRandom function', () => {
    test('should only choose between min and max inclusive', () => {
      const min = 2
      const max = 5

      for (let i = 0; i < 100; i++) {
        const result = chooseRandom(min, max)
        expect(result).toBeGreaterThanOrEqual(min)
        expect(result).toBeLessThanOrEqual(max)
      }
    })
  })

  describe('chooseOption function', () => {
    test('should choose an option from the provided numbers', () => {
      const options = [1, 2, 3, 4, 5]
      const result = chooseOption(options)
      expect(options).toContain(result)
    })

    test('should choose an option from the provided booleans', () => {
      const options = [true, false]
      const result = chooseOption(options)
      expect(options).toContain(result)
    })

    test('should choose an option from the provided strings', () => {
      const options = ['str1', 'str2', 'str3']
      const result = chooseOption(options)
      expect(options).toContain(result)
    })
  })

  describe('deepCopy function', () => {
    test('should handle numbers', () => {
      const value = 123
      const result = deepCopy(value)
      expect(result).toBe(value)
    })

    test('should handle strings', () => {
      const value = '123'
      const result = deepCopy(value)
      expect(result).toBe(value)
    })

    test('should handle date', () => {
      const value = new Date(2024, 1, 1)
      const result = deepCopy(value)
      expect(result).toStrictEqual(value)
    })

    test('should handle array', () => {
      const value = [1, 2, 3]
      const result = deepCopy(value)
      expect(result).toStrictEqual(value)
    })

    test('should handle array of objects', () => {
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      const obj3 = { id: 3 }
      const value = [obj1, obj2, obj3]

      const result = deepCopy(value)

      expect(result).toStrictEqual(value)
      expect(result[0]).not.toBe(obj1)
      expect(result[1]).not.toBe(obj2)
      expect(result[2]).not.toBe(obj3)
    })

    test('should handle objects', () => {
      const value = { numericProp: 123, stringProp: 'abc' }
      const copy = value

      const result = deepCopy(value)

      expect(copy).toBe(value)
      expect(result).not.toBe(value)
      expect(result).toStrictEqual(value)
    })

    test('should handle nested objects', () => {
      const prop = { numericProp: 123, stringProp: 'abc' }
      const value = { objProp: prop }
      const copy = value

      const result = deepCopy(value)

      expect(copy).toBe(value)
      expect(result).not.toBe(value)
      expect(result.objProp).not.toBe(value.objProp)
      expect(result).toStrictEqual(value)
    })
  })

  describe('operationPipeline function', () => {
    afterEach(() => {
      vi.resetAllMocks()
    })

    test('should not immediately call functions', () => {
      const fn1 = vi.fn()
      const fn2 = vi.fn()
      const fn3 = vi.fn()

      operationPipeline([
        fn1,
        fn2,
        fn3
      ])

      expect(fn1).not.toHaveBeenCalled()
      expect(fn2).not.toHaveBeenCalled()
      expect(fn3).not.toHaveBeenCalled()
    })

    test('should call functions sequentially when run is called', () => {
      const initialValue: number = 1
      const fn1Return: number = 2
      const fn2Return: number = 3
      const fn3Return: number = 4

      const fn1 = vi.fn().mockReturnValue(fn1Return)
      const fn2 = vi.fn().mockReturnValue(fn2Return)
      const fn3 = vi.fn().mockReturnValue(fn3Return)

      operationPipeline([
        fn1,
        fn2,
        fn3
      ]).run(initialValue)

      expect(fn1).toHaveBeenCalledWith(initialValue)
      expect(fn2).toHaveBeenCalledWith(fn1Return)
      expect(fn3).toHaveBeenCalledWith(fn2Return)
    })

    test('should return response from last function', () => {
      const fn3Return: number = 1

      const fn1 = vi.fn()
      const fn2 = vi.fn()
      const fn3 = vi.fn().mockReturnValue(fn3Return)

      const finalValue = operationPipeline([
        fn1,
        fn2,
        fn3
      ]).run([])

      expect(finalValue).toBe(fn3Return)
    })

    test('should not immediately call object functions', () => {
      const obj1 = { condition: vi.fn(), operation: vi.fn() }
      const obj2 = { condition: vi.fn(), operation: vi.fn() }
      const obj3 = { condition: vi.fn(), operation: vi.fn() }

      operationPipeline([
        obj1,
        obj2,
        obj3
      ])

      expect(obj1.condition).not.toHaveBeenCalled()
      expect(obj1.operation).not.toHaveBeenCalled()
      expect(obj2.condition).not.toHaveBeenCalled()
      expect(obj2.operation).not.toHaveBeenCalled()
      expect(obj3.condition).not.toHaveBeenCalled()
      expect(obj3.operation).not.toHaveBeenCalled()
    })

    test('should call object condition function when run is called', () => {
      const initialValue: number = 1

      const obj = { condition: vi.fn(), operation: vi.fn() }

      operationPipeline([obj]).run(initialValue)

      expect(obj.condition).toHaveBeenCalledWith(initialValue)
    })

    test('should not call object operation function when condition returns false', () => {
      const obj = { condition: vi.fn().mockReturnValue(false), operation: vi.fn() }

      operationPipeline([obj]).run(1)

      expect(obj.operation).not.toHaveBeenCalled()
    })

    test('should call object operation function when condition returns true', () => {
      const initialValue: number = 1
      const obj = { condition: vi.fn().mockReturnValue(true), operation: vi.fn() }

      operationPipeline([obj]).run(initialValue)

      expect(obj.operation).toHaveBeenCalledWith(initialValue)
    })

    test('should call object functions sequentially when run is called', () => {
      const initialValue: number = 1
      const fn1Return: number = 2
      const fn2Return: number = 3
      const fn3Return: number = 4

      const obj1 = { condition: vi.fn().mockReturnValue(true), operation: vi.fn().mockReturnValue(fn1Return) }
      const obj2 = { condition: vi.fn().mockReturnValue(true), operation: vi.fn().mockReturnValue(fn2Return) }
      const obj3 = { condition: vi.fn().mockReturnValue(true), operation: vi.fn().mockReturnValue(fn3Return) }

      operationPipeline([
        obj1,
        obj2,
        obj3
      ]).run(initialValue)

      expect(obj1.condition).toHaveBeenCalledWith(initialValue)
      expect(obj1.operation).toHaveBeenCalledWith(initialValue)
      expect(obj2.condition).toHaveBeenCalledWith(fn1Return)
      expect(obj2.operation).toHaveBeenCalledWith(fn1Return)
      expect(obj3.condition).toHaveBeenCalledWith(fn2Return)
      expect(obj3.operation).toHaveBeenCalledWith(fn2Return)
    })

    test('should return response from last object operation', () => {
      const fn3Return: number = 4

      const obj1 = { condition: vi.fn().mockReturnValue(true), operation: vi.fn() }
      const obj2 = { condition: vi.fn().mockReturnValue(true), operation: vi.fn() }
      const obj3 = { condition: vi.fn().mockReturnValue(true), operation: vi.fn().mockReturnValue(fn3Return) }

      const finalValue = operationPipeline([
        obj1,
        obj2,
        obj3
      ]).run([])

      expect(finalValue).toBe(fn3Return)
    })

    test('should not call object operation function when one condition returns false', () => {
      const condition1 = vi.fn().mockReturnValue(true)
      const condition2 = vi.fn().mockReturnValue(false)

      const obj = { condition: [condition1, condition2], operation: vi.fn() }

      operationPipeline([obj]).run(1)

      expect(obj.operation).not.toHaveBeenCalled()
    })

    test('should not call object operation function when all conditions return true', () => {
      const condition1 = vi.fn().mockReturnValue(true)
      const condition2 = vi.fn().mockReturnValue(true)

      const obj = { condition: [condition1, condition2], operation: vi.fn() }

      operationPipeline([obj]).run(1)

      expect(obj.operation).toHaveBeenCalled()
    })

    test('should not call next condition when condition returns false', () => {
      const condition1 = vi.fn().mockReturnValue(false)
      const condition2 = vi.fn().mockReturnValue(true)

      const obj = { condition: [condition1, condition2], operation: vi.fn() }

      operationPipeline([obj]).run(1)

      expect(condition2).not.toHaveBeenCalled()
    })

    test('should call functions sequentially when an array is supplied in object', () => {
      const initialValue: number = 1
      const fn1Return: number = 2
      const fn2Return: number = 3
      const fn3Return: number = 4

      const fn1 = vi.fn().mockReturnValue(fn1Return)
      const fn2 = vi.fn().mockReturnValue(fn2Return)
      const fn3 = vi.fn().mockReturnValue(fn3Return)

      const obj = { condition: vi.fn().mockReturnValue(true), operation: [fn1, fn2, fn3] }

      operationPipeline([obj]).run(initialValue)

      expect(fn1).toHaveBeenCalledWith(initialValue)
      expect(fn2).toHaveBeenCalledWith(fn1Return)
      expect(fn3).toHaveBeenCalledWith(fn2Return)
    })

    test('should return response from last function in the array', () => {
      const fn3Return: number = 1

      const fn1 = vi.fn()
      const fn2 = vi.fn()
      const fn3 = vi.fn().mockReturnValue(fn3Return)

      const obj = { condition: vi.fn().mockReturnValue(true), operation: [fn1, fn2, fn3] }

      const finalValue = operationPipeline([obj]).run([])

      expect(finalValue).toBe(fn3Return)
    })
  })

  describe('degreesToRadians function', () => {
    test('should convert degrees to radians', () => {
      const degrees = 180
      const radians = degreesToRadians(degrees)
      expect(radians).toBe(Math.PI)
    })

    test('should convert 0 degrees to 0 radians', () => {
      const degrees = 0
      const radians = degreesToRadians(degrees)
      expect(radians).toBe(0)
    })

    test('should convert 90 degrees to PI/2 radians', () => {
      const degrees = 90
      const radians = degreesToRadians(degrees)
      expect(radians).toBe(Math.PI / 2)
    })

    test('should convert 270 degrees to 3PI/2 radians', () => {
      const degrees = 270
      const radians = degreesToRadians(degrees)
      expect(radians).toBe(3 * Math.PI / 2)
    })

    test('should convert 360 degrees to 2PI radians', () => {
      const degrees = 360
      const radians = degreesToRadians(degrees)
      expect(radians).toBe(2 * Math.PI)
    })
  })

  describe('radiansToDegrees function', () => {
    test('should convert radians to degrees', () => {
      const radians = Math.PI
      const degrees = radiansToDegrees(radians)
      expect(degrees).toBe(180)
    })

    test('should convert 0 radians to 0 degrees', () => {
      const radians = 0
      const degrees = radiansToDegrees(radians)
      expect(degrees).toBe(0)
    })

    test('should convert PI/2 radians to 90 degrees', () => {
      const radians = Math.PI / 2
      const degrees = radiansToDegrees(radians)
      expect(degrees).toBe(90)
    })

    test('should convert 3PI/2 radians to 270 degrees', () => {
      const radians = 3 * Math.PI / 2
      const degrees = radiansToDegrees(radians)
      expect(degrees).toBe(270)
    })

    test('should convert 2PI radians to 360 degrees', () => {
      const radians = 2 * Math.PI
      const degrees = radiansToDegrees(radians)
      expect(degrees).toBe(360)
    })
  })

  describe('getRotatedCoordinates function', () => {
    test('should rotate coordinates around point of rotation by angle (90)', () => {
      const coordinates = { x: 10, y: 10 }
      const pointOfRotation = { x: 0, y: 0 }
      const angle = 90

      const result = getRotatedCoordinates(coordinates, pointOfRotation, angle)

      expect(result.x).toBeCloseTo(-10)
      expect(result.y).toBeCloseTo(10)
    })

    test('should rotate coordinates around point of rotation by angle (180)', () => {
      const coordinates = { x: 10, y: 10 }
      const pointOfRotation = { x: 0, y: 0 }
      const angle = 180

      const result = getRotatedCoordinates(coordinates, pointOfRotation, angle)

      expect(result.x).toBeCloseTo(-10)
      expect(result.y).toBeCloseTo(-10)
    })

    test('should rotate coordinates around point of rotation by angle (270)', () => {
      const coordinates = { x: 10, y: 10 }
      const pointOfRotation = { x: 0, y: 0 }
      const angle = 270

      const result = getRotatedCoordinates(coordinates, pointOfRotation, angle)

      expect(result.x).toBeCloseTo(10)
      expect(result.y).toBeCloseTo(-10)
    })

    test('should rotate coordinates around point of rotation by angle (360)', () => {
      const coordinates = { x: 10, y: 10 }
      const pointOfRotation = { x: 0, y: 0 }
      const angle = 360

      const result = getRotatedCoordinates(coordinates, pointOfRotation, angle)

      expect(result.x).toBeCloseTo(10)
      expect(result.y).toBeCloseTo(10)
    })
  })
})