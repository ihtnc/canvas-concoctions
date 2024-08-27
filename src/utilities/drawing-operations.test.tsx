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
})