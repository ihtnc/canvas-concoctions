import { Mock, afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import {
  type HSL,
  type RGB,
  type Size,
  areHSLsEqual,
  areSizesEqual,
  hexToRGB,
  rgbToHSL,
  hexToHSL,
  runRenderPipeline,
  renderPipeline,
  getTextSize
} from "./drawing-operations"

describe('drawing operations', () => {

  describe('hexToRGB function', () => {
    test.each([
      { value: 'red' },
      { value: '#F00' },
      { value: 'FF0000' },
      { value: 'invalid' },
      { value: '' }
    ])('should handle invalid value ($value)', ({ value }: { value: string }) => {
      const rgb = hexToRGB(value)
      expect(rgb).toBeUndefined()
    })

    test.each([
      { value: '#FF0000', expected: 255 },
      { value: '#000000', expected: 0  },
      { value: '#AA0000', expected: 170  },
      { value: '#560000', expected: 86  },
      { value: '#E90000', expected: 233  }
    ])('should convert the red component of ($value)', ({ value, expected }: { value: string, expected: number }) => {
      const rgb = hexToRGB(value)
      expect(rgb?.r).toBe(expected)
    })

    test.each([
      { value: '#00FF00', expected: 255 },
      { value: '#000000', expected: 0  },
      { value: '#00AA00', expected: 170  },
      { value: '#005600', expected: 86  },
      { value: '#00E900', expected: 233  }
    ])('should convert the green component of ($value)', ({ value, expected }: { value: string, expected: number }) => {
      const rgb = hexToRGB(value)
      expect(rgb?.g).toBe(expected)
    })

    test.each([
      { value: '#0000FF', expected: 255 },
      { value: '#000000', expected: 0  },
      { value: '#0000AA', expected: 170  },
      { value: '#000056', expected: 86  },
      { value: '#0000E9', expected: 233  }
    ])('should convert the blue component of ($value)', ({ value, expected }: { value: string, expected: number }) => {
      const rgb = hexToRGB(value)
      expect(rgb?.b).toBe(expected)
    })
  })

  describe('rgbToHSL function', () => {
    test.each([
      { rgb: { r: 194, g: 177, b: 128 }, hsl: { h: 45, s: 35, l: 63 } },
      { rgb: { r: 161, g: 161, b: 161 }, hsl: { h: 0, s: 0, l: 63 } },
      { rgb: { r: 4, g: 84, b: 97 }, hsl: { h: 188, s: 92, l: 20 } },
      { rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 } },
      { rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } }
    ])('should convert RGB($rgb)', ({ rgb, hsl }: { rgb: RGB, hsl: HSL }) => {
      const result = rgbToHSL(rgb)
      expect(result.h).toBe(hsl.h)
      expect(result.s).toBe(hsl.s)
      expect(result.l).toBe(hsl.l)
    })
  })

  describe('hexToHSL function', () => {
    test.each([
      { value: 'red' },
      { value: '#F00' },
      { value: 'FF0000' },
      { value: 'invalid' },
      { value: '' }
    ])('should handle invalid value ($value)', ({ value }: { value: string }) => {
      const hsl = hexToHSL(value)
      expect(hsl).toBeUndefined()
    })

    test.each([
      { hex: '#C2B180', hsl: { h: 45, s: 35, l: 63 } },
      { hex: '#A1A1A1', hsl: { h: 0, s: 0, l: 63 } },
      { hex: '#045461', hsl: { h: 188, s: 92, l: 20 } },
      { hex: '#000000', hsl: { h: 0, s: 0, l: 0 } },
      { hex: '#FFFFFF', hsl: { h: 0, s: 0, l: 100 } }
    ])('should convert $hex', ({ hex, hsl }: { hex: string, hsl: HSL }) => {
      const result = hexToHSL(hex)!
      expect(result.h).toBe(hsl.h)
      expect(result.s).toBe(hsl.s)
      expect(result.l).toBe(hsl.l)
    })
  })

  describe('areHSLsEqual function', () => {
    test('should return true when comparing HSL to itself', () => {
      const hsl: HSL = {
        h: 76,
        s: 54,
        l: 98
      }

      const result = areHSLsEqual(hsl, hsl)
      expect(result).toBe(true)
    })

    test('should handle undefined value1', () => {
      const hsl: HSL = {
        h: 76,
        s: 54,
        l: 98
      }

      const result = areHSLsEqual(undefined, hsl)
      expect(result).toBe(false)
    })

    test('should handle undefined value2', () => {
      const hsl: HSL = {
        h: 76,
        s: 54,
        l: 98
      }

      const result = areHSLsEqual(hsl, undefined)
      expect(result).toBe(false)
    })

    test('should return true if both are undefined', () => {
      const result = areHSLsEqual(undefined, undefined)
      expect(result).toBe(true)
    })

    test.each([
      { value: 8, expected: true },
      { value: 7, expected: false },
      { value: 6, expected: false }
    ])('should compare the h component ($value)', ({ value, expected }: ({ value: number, expected: boolean })) => {
      const mainHSL: HSL = {
        h: 8,
        s: 42,
        l: 88
      }

      const otherHSL: HSL = {
        h: value,
        s: mainHSL.s,
        l: mainHSL.l
      }

      const result = areHSLsEqual(mainHSL, otherHSL)
      expect(result).toBe(expected)
    })

    test.each([
      { value: 8, expected: true },
      { value: 7, expected: false },
      { value: 6, expected: false }
    ])('should compare the s component ($value)', ({ value, expected }: ({ value: number, expected: boolean })) => {
      const mainHSL: HSL = {
        h: 42,
        s: 8,
        l: 88
      }

      const otherHSL: HSL = {
        h: mainHSL.h,
        s: value,
        l: mainHSL.l
      }

      const result = areHSLsEqual(mainHSL, otherHSL)
      expect(result).toBe(expected)
    })

    test.each([
      { value: 8, expected: true },
      { value: 7, expected: false },
      { value: 6, expected: false }
    ])('should compare the l component ($value)', ({ value, expected }: ({ value: number, expected: boolean })) => {
      const mainHSL: HSL = {
        h: 42,
        s: 88,
        l: 8
      }

      const otherHSL: HSL = {
        h: mainHSL.h,
        s: mainHSL.s,
        l: value
      }

      const result = areHSLsEqual(mainHSL, otherHSL)
      expect(result).toBe(expected)
    })
  })

  describe('areSizesEqual function', () => {
    test('should return true when comparing Size to itself', () => {
      const size: Size = {
        width: 12,
        height: 34
      }

      const result = areSizesEqual(size, size)
      expect(result).toBe(true)
    })

    test('should handle undefined value1', () => {
      const size: Size = {
        width: 12,
        height: 34
      }

      const result = areSizesEqual(undefined, size)
      expect(result).toBe(false)
    })

    test('should handle undefined value2', () => {
      const size: Size = {
        width: 12,
        height: 34
      }

      const result = areSizesEqual(size, undefined)
      expect(result).toBe(false)
    })

    test('should return true if both are undefined', () => {
      const result = areSizesEqual(undefined, undefined)
      expect(result).toBe(true)
    })

    test.each([
      { value: 432, expected: true },
      { value: 431, expected: false },
      { value: 987, expected: false }
    ])('should compare the width component ($value)', ({ value, expected }: ({ value: number, expected: boolean })) => {
      const mainSize: Size = {
        width: 432,
        height: 987
      }

      const otherSize: Size = {
        width: value,
        height: mainSize.height
      }

      const result = areSizesEqual(mainSize, otherSize)
      expect(result).toBe(expected)
    })

    test.each([
      { value: 432, expected: true },
      { value: 431, expected: false },
      { value: 987, expected: false }
    ])('should compare the height component ($value)', ({ value, expected }: ({ value: number, expected: boolean })) => {
      const mainSize: Size = {
        width: 987,
        height: 432
      }

      const otherSize: Size = {
        width: mainSize.width,
        height: value
      }

      const result = areSizesEqual(mainSize, otherSize)
      expect(result).toBe(expected)
    })
  })

  describe('getTextSize function', () => {
    let context: CanvasRenderingContext2D
    let contextMock: { measureText: Mock }

    beforeEach(() => {
      contextMock = {
        measureText: vi.fn()
      }
      context = contextMock as unknown as CanvasRenderingContext2D
    })

    afterEach(() => {
      vi.resetAllMocks()
    })

    test('should call context.measureText', () => {
      const text = 'test'
      contextMock.measureText.mockReturnValue({ width: 0 })

      getTextSize(context, text)

      expect(contextMock.measureText).toHaveBeenCalledWith(text)
    })

    test('should return the width the text', () => {
      const width = 123

      contextMock.measureText.mockReturnValue({ width })

      const result = getTextSize(context, 'test')
      expect(result.width).toBe(width)
    })

    test('should return the height of the text based on boundingBox details', () => {
      const actualBoundingBoxAscent = 123
      const actualBoundingBoxDescent = 456
      const height = actualBoundingBoxAscent + actualBoundingBoxDescent

      contextMock.measureText.mockReturnValue({ width: 0, actualBoundingBoxAscent, actualBoundingBoxDescent })

      const result = getTextSize(context, 'test')
      expect(result.height).toBe(height)
    })
  })

  describe('renderPipeline function', () => {
    let data: number
    let context: CanvasRenderingContext2D
    let contextMock: { save: Mock, restore: Mock }

    beforeEach(() => {
      data = 1
      contextMock = {
        save: vi.fn(),
        restore: vi.fn()
      }
      context = contextMock as unknown as CanvasRenderingContext2D
    })

    afterEach(() => {
      vi.resetAllMocks()
    })

    test('should not immediately call functions', () => {
      const fn1 = vi.fn()
      const fn2 = vi.fn()
      const fn3 = vi.fn()

      renderPipeline([
        fn1,
        fn2,
        fn3
      ])

      expect(fn1).not.toHaveBeenCalled()
      expect(fn2).not.toHaveBeenCalled()
      expect(fn3).not.toHaveBeenCalled()
    })

    test('should call functions sequentially when run is called', () => {
      let callCount = 0
      const fn1 = vi.fn(() => expect(++callCount).toBe(1))
      const fn2 = vi.fn(() => expect(++callCount).toBe(2))
      const fn3 = vi.fn(() => expect(++callCount).toBe(3))

      renderPipeline([
        fn1,
        fn2,
        fn3
      ]).run(context, data)

      expect(fn1).toHaveBeenCalledWith(context, data)
      expect(fn2).toHaveBeenCalledWith(context, data)
      expect(fn3).toHaveBeenCalledWith(context, data)
    })

    test('should call filters sequentially when filters are supplied', () => {
      let callCount = 0
      const filter1 = vi.fn(() => expect(++callCount).toBe(1))
      const filter2 = vi.fn(() => expect(++callCount).toBe(2))
      const filter3 = vi.fn(() => expect(++callCount).toBe(3))

      renderPipeline([]).run(context, data, [filter1, filter2, filter3])

      expect(filter1).toHaveBeenCalledWith(context)
      expect(filter2).toHaveBeenCalledWith(context)
      expect(filter3).toHaveBeenCalledWith(context)
    })

    test('should call filters first before render functions', () => {
      let callCount = 0
      const filter1 = vi.fn(() => expect(++callCount).toBe(1))
      const filter2 = vi.fn(() => expect(++callCount).toBe(2))
      const filter3 = vi.fn(() => expect(++callCount).toBe(3))
      const fn1 = vi.fn(() => expect(++callCount).toBe(4))
      const fn2 = vi.fn(() => expect(++callCount).toBe(5))
      const fn3 = vi.fn(() => expect(++callCount).toBe(6))

      renderPipeline([fn1, fn2, fn3]).run(context, data, [filter1, filter2, filter3])

      expect(filter1).toHaveBeenCalledWith(context)
      expect(filter2).toHaveBeenCalledWith(context)
      expect(filter3).toHaveBeenCalledWith(context)
      expect(fn1).toHaveBeenCalledWith(context, data)
      expect(fn2).toHaveBeenCalledWith(context, data)
      expect(fn3).toHaveBeenCalledWith(context, data)
    })

    test('should not save context when no filters are supplied', () => {
      const fn = vi.fn()

      renderPipeline([fn]).run(context, data)

      expect(contextMock.save).not.toHaveBeenCalled()
    })

    test('should save context when filters are supplied', () => {
      const fn = vi.fn()
      const filter1 = vi.fn()
      const filter2 = vi.fn()

      renderPipeline([fn]).run(context, data, [filter1, filter2])

      expect(contextMock.save).toHaveBeenCalled()
    })

    test('should not restore context when no filters are supplied', () => {
      const fn = vi.fn()

      renderPipeline([fn]).run(context, data)

      expect(contextMock.restore).not.toHaveBeenCalled()
    })

    test('should restore context when filters are supplied', () => {
      const fn = vi.fn()
      const filter1 = vi.fn()
      const filter2 = vi.fn()

      renderPipeline([fn]).run(context, data, [filter1, filter2])

      expect(contextMock.restore).toHaveBeenCalled()
    })

    test('should not immediately call object functions', () => {
      const obj1 = { condition: vi.fn(), render: vi.fn() }
      const obj2 = { condition: vi.fn(), render: vi.fn() }
      const obj3 = { condition: vi.fn(), render: vi.fn() }

      renderPipeline([
        obj1,
        obj2,
        obj3
      ])

      expect(obj1.condition).not.toHaveBeenCalled()
      expect(obj1.render).not.toHaveBeenCalled()
      expect(obj2.condition).not.toHaveBeenCalled()
      expect(obj2.render).not.toHaveBeenCalled()
      expect(obj3.condition).not.toHaveBeenCalled()
      expect(obj3.render).not.toHaveBeenCalled()
    })

    test('should call object condition function when run is called', () => {
      const obj = { condition: vi.fn(), render: vi.fn() }

      renderPipeline([obj]).run(context, data)

      expect(obj.condition).toHaveBeenCalledWith(data)
    })

    test('should not call object render function when condition returns false', () => {
      const obj = { condition: vi.fn().mockReturnValue(false), render: vi.fn() }

      renderPipeline([obj]).run(context, data)

      expect(obj.render).not.toHaveBeenCalled()
    })

    test('should call object render function when condition returns true', () => {
      const obj = { condition: vi.fn().mockReturnValue(true), render: vi.fn() }

      renderPipeline([obj]).run(context, data)

      expect(obj.render).toHaveBeenCalledWith(context, data)
    })

    test('should call object functions sequentially when run is called', () => {
      let callCount = 0
      const fn1 = vi.fn(() => expect(++callCount).toBe(1))
      const fn2 = vi.fn(() => expect(++callCount).toBe(2))
      const fn3 = vi.fn(() => expect(++callCount).toBe(3))

      const obj1 = { condition: vi.fn().mockReturnValue(true), render: fn1 }
      const obj2 = { condition: vi.fn().mockReturnValue(true), render: fn2 }
      const obj3 = { condition: vi.fn().mockReturnValue(true), render: fn3 }

      renderPipeline([
        obj1,
        obj2,
        obj3
      ]).run(context, data)

      expect(obj1.condition).toHaveBeenCalledWith(data)
      expect(obj1.render).toHaveBeenCalledWith(context, data)
      expect(obj2.condition).toHaveBeenCalledWith(data)
      expect(obj2.render).toHaveBeenCalledWith(context, data)
      expect(obj3.condition).toHaveBeenCalledWith(data)
      expect(obj3.render).toHaveBeenCalledWith(context, data)
    })

    test('should not call object render function when one condition returns false', () => {
      const condition1 = vi.fn().mockReturnValue(true)
      const condition2 = vi.fn().mockReturnValue(false)

      const obj = { condition: [condition1, condition2], render: vi.fn() }

      renderPipeline([obj]).run(context, data)

      expect(obj.render).not.toHaveBeenCalled()
    })

    test('should call object render function when all conditions return true', () => {
      const condition1 = vi.fn().mockReturnValue(true)
      const condition2 = vi.fn().mockReturnValue(true)

      const obj = { condition: [condition1, condition2], render: vi.fn() }

      renderPipeline([obj]).run(context, data)

      expect(obj.render).toHaveBeenCalled()
    })

    test('should not call next condition when condition returns false', () => {
      const condition1 = vi.fn().mockReturnValue(false)
      const condition2 = vi.fn().mockReturnValue(true)

      const obj = { condition: [condition1, condition2], render: vi.fn() }

      renderPipeline([obj]).run(context, data)

      expect(condition2).not.toHaveBeenCalled()
    })

    test('should call functions sequentially when an array is supplied in object', () => {
      let callCount = 0
      const fn1 = vi.fn(() => expect(++callCount).toBe(1))
      const fn2 = vi.fn(() => expect(++callCount).toBe(2))
      const fn3 = vi.fn(() => expect(++callCount).toBe(3))

      const obj = { condition: vi.fn().mockReturnValue(true), render: [fn1, fn2, fn3] }

      renderPipeline([obj]).run(context, data)

      expect(fn1).toHaveBeenCalledWith(context, data)
      expect(fn2).toHaveBeenCalledWith(context, data)
      expect(fn3).toHaveBeenCalledWith(context, data)
    })

    test('should call object filter condition function', () => {
      const obj = { condition: vi.fn(), filter: vi.fn() }

      renderPipeline([vi.fn()]).run(context, data, [obj])

      expect(obj.condition).toHaveBeenCalledWith(data)
    })

    test('should not call object filter function when condition returns false', () => {
      const obj = { condition: vi.fn().mockReturnValue(false), filter: vi.fn() }

      renderPipeline([vi.fn()]).run(context, data, [obj])

      expect(obj.filter).not.toHaveBeenCalled()
    })

    test('should call object filter function when condition returns true', () => {
      const obj = { condition: vi.fn().mockReturnValue(true), filter: vi.fn() }

      renderPipeline([vi.fn()]).run(context, data, [obj])

      expect(obj.filter).toHaveBeenCalledWith(context)
    })

    test('should call object filter functions sequentially when run is called', () => {
      let callCount = 0
      const fn1 = vi.fn(() => expect(++callCount).toBe(1))
      const fn2 = vi.fn(() => expect(++callCount).toBe(2))
      const fn3 = vi.fn(() => expect(++callCount).toBe(3))

      const obj1 = { condition: vi.fn().mockReturnValue(true), filter: fn1 }
      const obj2 = { condition: vi.fn().mockReturnValue(true), filter: fn2 }
      const obj3 = { condition: vi.fn().mockReturnValue(true), filter: fn3 }

      renderPipeline([vi.fn()]).run(context, data, [obj1, obj2, obj3])

      expect(obj1.condition).toHaveBeenCalledWith(data)
      expect(obj1.filter).toHaveBeenCalledWith(context)
      expect(obj2.condition).toHaveBeenCalledWith(data)
      expect(obj2.filter).toHaveBeenCalledWith(context)
      expect(obj3.condition).toHaveBeenCalledWith(data)
      expect(obj3.filter).toHaveBeenCalledWith(context)
    })

    test('should not call object filter function when one condition returns false', () => {
      const condition1 = vi.fn().mockReturnValue(true)
      const condition2 = vi.fn().mockReturnValue(false)

      const obj = { condition: [condition1, condition2], filter: vi.fn() }

      renderPipeline([vi.fn()]).run(context, data, [obj])

      expect(obj.filter).not.toHaveBeenCalled()
    })

    test('should call object filter function when all conditions return true', () => {
      const condition1 = vi.fn().mockReturnValue(true)
      const condition2 = vi.fn().mockReturnValue(true)

      const obj = { condition: [condition1, condition2], filter: vi.fn() }

      renderPipeline([vi.fn()]).run(context, data, [obj])

      expect(obj.filter).toHaveBeenCalled()
    })

    test('should not call next condition when condition returns false', () => {
      const condition1 = vi.fn().mockReturnValue(false)
      const condition2 = vi.fn().mockReturnValue(true)

      const obj = { condition: [condition1, condition2], filter: vi.fn() }

      renderPipeline([vi.fn()]).run(context, data, [obj])

      expect(condition2).not.toHaveBeenCalled()
    })

    test('should call functions sequentially when an array is supplied in object', () => {
      let callCount = 0
      const fn1 = vi.fn(() => expect(++callCount).toBe(1))
      const fn2 = vi.fn(() => expect(++callCount).toBe(2))
      const fn3 = vi.fn(() => expect(++callCount).toBe(3))

      const obj = { condition: vi.fn().mockReturnValue(true), filter: [fn1, fn2, fn3] }

      renderPipeline([vi.fn()]).run(context, data, [obj])

      expect(fn1).toHaveBeenCalledWith(context)
      expect(fn2).toHaveBeenCalledWith(context)
      expect(fn3).toHaveBeenCalledWith(context)
    })
  })

  describe('runRenderPipeline function', () => {
    afterEach(() => {
      vi.resetAllMocks()
    })

    test('should call render function', () => {
      const fn = vi.fn()
      const data = 1
      const context: CanvasRenderingContext2D = {} as CanvasRenderingContext2D

      runRenderPipeline(context, data, fn)

      expect(fn).toHaveBeenCalledWith(context, data)
    })

    test('should call pre functions before render function', () => {
      let callCount = 0
      const fn1 = vi.fn(() => expect(++callCount).toBe(1))
      const fn2 = vi.fn(() => expect(++callCount).toBe(2))
      const fn3 = vi.fn(() => expect(++callCount).toBe(3))
      const render = vi.fn(() => expect(++callCount).toBe(4))
      const data = 1
      const context: CanvasRenderingContext2D = {} as CanvasRenderingContext2D

      runRenderPipeline(context, data, render, [fn1, fn2, fn3])

      expect(fn1).toHaveBeenCalledWith(context, data)
      expect(fn2).toHaveBeenCalledWith(context, data)
      expect(fn3).toHaveBeenCalledWith(context, data)
      expect(render).toHaveBeenCalledWith(context, data)
    })

    test('should call post functions after render function', () => {
      let callCount = 0
      const render = vi.fn(() => expect(++callCount).toBe(1))
      const fn1 = vi.fn(() => expect(++callCount).toBe(2))
      const fn2 = vi.fn(() => expect(++callCount).toBe(3))
      const fn3 = vi.fn(() => expect(++callCount).toBe(4))
      const data = 1
      const context: CanvasRenderingContext2D = {} as CanvasRenderingContext2D

      runRenderPipeline(context, data, render, [], [fn1, fn2, fn3])

      expect(render).toHaveBeenCalledWith(context, data)
      expect(fn1).toHaveBeenCalledWith(context, data)
      expect(fn2).toHaveBeenCalledWith(context, data)
      expect(fn3).toHaveBeenCalledWith(context, data)
    })

    test('should call functions in order', () => {
      let callCount = 0
      const pre1 = vi.fn(() => expect(++callCount).toBe(1))
      const pre2 = vi.fn(() => expect(++callCount).toBe(2))
      const render = vi.fn(() => expect(++callCount).toBe(3))
      const post1 = vi.fn(() => expect(++callCount).toBe(4))
      const post2 = vi.fn(() => expect(++callCount).toBe(5))
      const data = 1
      const context: CanvasRenderingContext2D = {} as CanvasRenderingContext2D

      runRenderPipeline(context, data, render, [pre1, pre2], [post1, post2])

      expect(pre1).toHaveBeenCalledWith(context, data)
      expect(pre2).toHaveBeenCalledWith(context, data)
      expect(render).toHaveBeenCalledWith(context, data)
      expect(post1).toHaveBeenCalledWith(context, data)
      expect(post2).toHaveBeenCalledWith(context, data)
    })
  })
})