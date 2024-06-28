import { type Mock, type MockInstance, afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { DEFAULT_RENDER_ENVIRONMENT_LAYER_OPTIONS, DEFAULT_RENDER_GRID_LAYER_OPTIONS, areCoordinatesEqual, getRenderEnvironmentLayerRenderer, getRenderGridLayerRenderer } from './utilities'
import { type RenderEnvironmentValue, type Coordinates, type RenderEnvironmentLayerOptions, type RenderGridLayerOptions, RenderLocation } from "./types"
import { type Size, getTextSize } from "@/utilities/drawing-operations"
import * as misc from "@/utilities/misc-operations"

vi.mock('@/utilities/drawing-operations', () => ({
  getTextSize: vi.fn()
}))

describe('canvas utilities', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('areCoordinatesEqual function', () => {
    test('should return true when comparing Coordinates to itself', () => {
      const coordinates: Coordinates = {
        x: 12,
        y: 34
      }

      const result = areCoordinatesEqual(coordinates, coordinates)
      expect(result).toBe(true)
    })

    test('should handle undefined value1', () => {
      const coordinates: Coordinates = {
        x: 12,
        y: 34
      }

      const result = areCoordinatesEqual(undefined, coordinates)
      expect(result).toBe(false)
    })

    test('should handle undefined value2', () => {
      const coordinates: Coordinates = {
        x: 12,
        y: 34
      }

      const result = areCoordinatesEqual(coordinates, undefined)
      expect(result).toBe(false)
    })

    test('should return true if both are undefined', () => {
      const result = areCoordinatesEqual(undefined, undefined)
      expect(result).toBe(true)
    })

    test.each([
      { value: 2, expected: true },
      { value: 1, expected: false },
      { value: 3, expected: false }
    ])('should compare the x component ($value)', ({ value, expected }: { value: number, expected: boolean }) => {
      const mainCoordinates: Coordinates = {
        x: 2,
        y: 3
      }

      const otherCoordinates: Coordinates = {
        x: value,
        y: mainCoordinates.y
      }

      const result = areCoordinatesEqual(mainCoordinates, otherCoordinates)
      expect(result).toBe(expected)
    })

    test.each([
        { value: 2, expected: true },
        { value: 1, expected: false },
        { value: 3, expected: false }
    ])('should compare the y component ($value)', ({ value, expected }: { value: number, expected: boolean }) => {
      const mainCoordinates: Coordinates = {
        x: 3,
        y: 2
      }

      const otherCoordinates: Coordinates = {
        x: mainCoordinates.x,
        y: value
      }

      const result = areCoordinatesEqual(mainCoordinates, otherCoordinates)
      expect(result).toBe(expected)
    })
  })

  describe('getRenderEnvironmentLayerRenderer function', () => {
    let renderValue: RenderEnvironmentValue
    let context: CanvasRenderingContext2D
    let getTextSizeMock: Mock
    let getTextSizeResponse: Size
    let deepCopyMock: MockInstance

    beforeEach(() => {
      renderValue = {
        fps: 101,
        width: 201,
        height: 202,
        clientWidth: 301,
        clientHeight: 302,
        pixelRatio: 401,
        frame: 501
      }

      context = {
        save: vi.fn(),
        fillStyle: '',
        globalAlpha: 0,
        fillText: vi.fn(),
        restore: vi.fn()
      } as unknown as CanvasRenderingContext2D

      getTextSizeResponse = { width: 10, height: 20 }
      getTextSizeMock = getTextSize as Mock
      getTextSizeMock.mockReturnValue(getTextSizeResponse)

      deepCopyMock = vi.spyOn(misc, 'deepCopy')
    })

    test('should call deepCopy when called', () => {
      getRenderEnvironmentLayerRenderer(false)
      expect(deepCopyMock).toHaveBeenCalledWith(DEFAULT_RENDER_ENVIRONMENT_LAYER_OPTIONS)
    })

    test.each([
      { value: undefined },
      { value: false }
    ])('should return null when value is $value', ({ value }: { value?: boolean }) => {
      const result = getRenderEnvironmentLayerRenderer(value)
      expect(result).toBe(null)
    })

    test('should return a function when value is a function', () => {
      const value = vi.fn()
      const result = getRenderEnvironmentLayerRenderer(value)
      expect(result).toBe(value)
    })

    test('should call supplied function when returned function is called', () => {
      const value = vi.fn()
      const result = getRenderEnvironmentLayerRenderer(value)!

      result(renderValue, context)

      expect(value).toHaveBeenCalledWith(renderValue, context)
    })

    test('should return render function when value is true', () => {
      const result = getRenderEnvironmentLayerRenderer(true)
      expect(result).not.toBeNull()
      expect(result).toBeTypeOf('function')
    })

    test('should call getTextSize function when render function is called', () => {
      const texts = [
        `fps: ${renderValue.fps};`,
        `size: ${renderValue.width}x${renderValue.height};`,
        `client: ${renderValue.clientWidth}x${renderValue.clientHeight};`,
        `ratio: ${renderValue.pixelRatio};`,
        `frame: ${renderValue.frame};`
      ]
      const expectedText = texts.join(' ')

      const result = getRenderEnvironmentLayerRenderer(true)!
      result(renderValue, context)

      expect(getTextSizeMock).toHaveBeenCalledWith(context, expectedText)
    })

    test('should call context.save() when render function is called', () => {
      const result = getRenderEnvironmentLayerRenderer(true)!
      result(renderValue, context)
      expect(context.save).toHaveBeenCalled()
    })

    test('should set context.fillStyle with default value when render function is called', () => {
      const result = getRenderEnvironmentLayerRenderer(true)!
      result(renderValue, context)
      expect(context.fillStyle).toBe(DEFAULT_RENDER_ENVIRONMENT_LAYER_OPTIONS.color)
    })

    test('should set context.globalAlpha with default value when render function is called', () => {
      const result = getRenderEnvironmentLayerRenderer(true)!
      result(renderValue, context)
      expect(context.globalAlpha).toBe(DEFAULT_RENDER_ENVIRONMENT_LAYER_OPTIONS.opacity)
    })

    test('should call context.fillText() with default values when render function is called', () => {
      const { leftX: x, topY: y } = getPresetCoordinates(renderValue, getTextSizeResponse)
      const coordinates = { x, y }
      const texts = [
        `fps: ${renderValue.fps};`,
        `size: ${renderValue.width}x${renderValue.height};`,
        `client: ${renderValue.clientWidth}x${renderValue.clientHeight};`,
        `ratio: ${renderValue.pixelRatio};`,
        `frame: ${renderValue.frame};`
      ]
      const expectedText = texts.join(' ')

      const result = getRenderEnvironmentLayerRenderer(true)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expectedText, coordinates.x, coordinates.y)
    })

    test('should call context.restore() when render function is called', () => {
      const result = getRenderEnvironmentLayerRenderer(true)!
      result(renderValue, context)
      expect(context.restore).toHaveBeenCalled()
    })

    test.each([
      { renderLocation: RenderLocation.TopLeft, title: RenderLocation[RenderLocation.TopLeft] },
      { renderLocation: RenderLocation.TopCenter, title: RenderLocation[RenderLocation.TopCenter] },
      { renderLocation: RenderLocation.TopRight, title: RenderLocation[RenderLocation.TopRight] },
      { renderLocation: RenderLocation.MiddleLeft, title: RenderLocation[RenderLocation.MiddleLeft] },
      { renderLocation: RenderLocation.Center, title: RenderLocation[RenderLocation.Center] },
      { renderLocation: RenderLocation.MiddleRight, title: RenderLocation[RenderLocation.MiddleRight] },
      { renderLocation: RenderLocation.BottomLeft, title: RenderLocation[RenderLocation.BottomLeft] },
      { renderLocation: RenderLocation.BottomCenter, title: RenderLocation[RenderLocation.BottomCenter] },
      { renderLocation: RenderLocation.BottomRight, title: RenderLocation[RenderLocation.BottomRight] }
    ])('should return render function when value is $title', ({ renderLocation }: { renderLocation: RenderLocation }) => {
      const result = getRenderEnvironmentLayerRenderer(renderLocation)
      expect(result).not.toBeNull()
      expect(result).toBeTypeOf('function')
    })

    test('should call context.fillText() with preset values when value is \'TopLeft\' and render function is called', () => {
      const { leftX: x, topY: y } = getPresetCoordinates(renderValue, getTextSizeResponse)
      const coordinates = { x, y }

      const result = getRenderEnvironmentLayerRenderer(RenderLocation.TopLeft)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expect.any(String), coordinates.x, coordinates.y)
    })

    test('should call context.fillText() with preset values when value is \'TopCenter\' and render function is called', () => {
      const { midX: x, topY: y } = getPresetCoordinates(renderValue, getTextSizeResponse)
      const coordinates = { x, y }

      const result = getRenderEnvironmentLayerRenderer(RenderLocation.TopCenter)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expect.any(String), coordinates.x, coordinates.y)
    })

    test('should call context.fillText() with preset values when value is \'TopRight\' and render function is called', () => {
      const { rightX: x, topY: y } = getPresetCoordinates(renderValue, getTextSizeResponse)
      const coordinates = { x, y }

      const result = getRenderEnvironmentLayerRenderer(RenderLocation.TopRight)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expect.any(String), coordinates.x, coordinates.y)
    })

    test('should call context.fillText() with preset values when value is \'MiddleLeft\' and render function is called', () => {
      const { leftX: x, midY: y } = getPresetCoordinates(renderValue, getTextSizeResponse)
      const coordinates = { x, y }

      const result = getRenderEnvironmentLayerRenderer(RenderLocation.MiddleLeft)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expect.any(String), coordinates.x, coordinates.y)
    })

    test('should call context.fillText() with preset values when value is \'Center\' and render function is called', () => {
      const { midX: x, midY: y } = getPresetCoordinates(renderValue, getTextSizeResponse)
      const coordinates = { x, y }

      const result = getRenderEnvironmentLayerRenderer(RenderLocation.Center)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expect.any(String), coordinates.x, coordinates.y)
    })

    test('should call context.fillText() with preset values when value is \'MiddleRight\' and render function is called', () => {
      const { rightX: x, midY: y } = getPresetCoordinates(renderValue, getTextSizeResponse)
      const coordinates = { x, y }

      const result = getRenderEnvironmentLayerRenderer(RenderLocation.MiddleRight)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expect.any(String), coordinates.x, coordinates.y)
    })

    test('should call context.fillText() with preset values when value is \'BottomLeft\' and render function is called', () => {
      const { leftX: x, bottomY: y } = getPresetCoordinates(renderValue, getTextSizeResponse)
      const coordinates = { x, y }

      const result = getRenderEnvironmentLayerRenderer(RenderLocation.BottomLeft)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expect.any(String), coordinates.x, coordinates.y)
    })

    test('should call context.fillText() with preset values when value is \'BottomCenter\' and render function is called', () => {
      const { midX: x, bottomY: y } = getPresetCoordinates(renderValue, getTextSizeResponse)
      const coordinates = { x, y }

      const result = getRenderEnvironmentLayerRenderer(RenderLocation.BottomCenter)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expect.any(String), coordinates.x, coordinates.y)
    })

    test('should call context.fillText() with preset values when value is \'BottomRight\' and render function is called', () => {
      const { rightX: x, bottomY: y } = getPresetCoordinates(renderValue, getTextSizeResponse)
      const coordinates = { x, y }

      const result = getRenderEnvironmentLayerRenderer(RenderLocation.BottomRight)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expect.any(String), coordinates.x, coordinates.y)
    })

    test('should call context.fillText() with default values when RenderLocation value is invalid and render function is called', () => {
      const { leftX: x, topY: y } = getPresetCoordinates(renderValue, getTextSizeResponse)
      const coordinates = { x, y }

      const result = getRenderEnvironmentLayerRenderer(-1 as RenderLocation)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expect.any(String), coordinates.x, coordinates.y)
    })

    test('should return render function when value is string', () => {
      const result = getRenderEnvironmentLayerRenderer('blue')
      expect(result).not.toBeNull()
      expect(result).toBeTypeOf('function')
    })

    test('should set context.fillStyle when value is string and render function is called', () => {
      const fillStyle = 'blue'

      const result = getRenderEnvironmentLayerRenderer(fillStyle)!
      result(renderValue, context)

      expect(context.fillStyle).toBe(fillStyle)
    })

    test('should return render function when value is Coordinates', () => {
      const result = getRenderEnvironmentLayerRenderer({ x: 10, y: 20 })
      expect(result).not.toBeNull()
      expect(result).toBeTypeOf('function')
    })

    test('should call context.fillText() with coordinate value when render function is called', () => {
      const coordinates = { x: renderValue.width, y: renderValue.height }

      const result = getRenderEnvironmentLayerRenderer(coordinates)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expect.any(String), coordinates.x, coordinates.y)
    })

    test.each([
      { x: -1, y: 20 },
      { x: 10, y: -1 }
    ])('should call context.fillText() with default values when coordinate value is invalid ($x, $y) and render function is called', (coordinates: { x: number, y: number }) => {
      const { leftX: x, topY: y } = getPresetCoordinates(renderValue, getTextSizeResponse)
      const expected = { x, y }

      const result = getRenderEnvironmentLayerRenderer(coordinates)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expect.any(String), expected.x, expected.y)
    })

    test('should call context.fillText() with default values when coordinate value exceeds width and render function is called', () => {
      const { leftX: x, topY: y } = getPresetCoordinates(renderValue, getTextSizeResponse)
      const expected = { x, y }
      const coordinates = { x: renderValue.width + 10, y: 0 }

      const result = getRenderEnvironmentLayerRenderer(coordinates)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expect.any(String), expected.x, expected.y)
    })

    test('should call context.fillText() with default values when coordinate value exceeds height and render function is called', () => {
      const { leftX: x, topY: y } = getPresetCoordinates(renderValue, getTextSizeResponse)
      const expected = { x, y }
      const coordinates = { x: 0, y: renderValue.height + 10 }

      const result = getRenderEnvironmentLayerRenderer(coordinates)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expect.any(String), expected.x, expected.y)
    })

    test('should return render function when value is RenderEnvironmentLayerOptions', () => {
      const options: RenderEnvironmentLayerOptions = {
        location: RenderLocation.TopLeft,
      }
      const result = getRenderEnvironmentLayerRenderer(options)
      expect(result).not.toBeNull()
      expect(result).toBeTypeOf('function')
    })

    test('should call context.fillText() with RenderLocation from options when render function is called', () => {
      const options: RenderEnvironmentLayerOptions = {
        location: RenderLocation.Center
      }
      const { midX: x, midY: y } = getPresetCoordinates(renderValue, getTextSizeResponse)
      const expected = { x, y }

      const result = getRenderEnvironmentLayerRenderer(options)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expect.any(String), expected.x, expected.y)
    })

    test('should call context.fillText() with default values when RenderLocation option value is invalid and render function is called', () => {
      const options: RenderEnvironmentLayerOptions = {
        location: -1 as RenderLocation
      }
      const { leftX: x, topY: y } = getPresetCoordinates(renderValue, getTextSizeResponse)
      const expected = { x, y }

      const result = getRenderEnvironmentLayerRenderer(options)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expect.any(String), expected.x, expected.y)
    })

    test('should call context.fillText() with Coordinates from options when render function is called', () => {
      const coordinates = { x: renderValue.width, y: renderValue.height }
      const options: RenderEnvironmentLayerOptions = {
        location: coordinates
      }

      const result = getRenderEnvironmentLayerRenderer(options)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expect.any(String), coordinates.x, coordinates.y)
    })

    test.each([
      { x: -1, y: 20 },
      { x: 10, y: -1 }
    ])('should call context.fillText() with default values when location option value is invalid ($x, $y) and render function is called', (coordinates: { x: number, y: number }) => {
      const options: RenderEnvironmentLayerOptions = {
        location: coordinates
      }
      const { leftX: x, topY: y } = getPresetCoordinates(renderValue, getTextSizeResponse)
      const expected = { x, y }

      const result = getRenderEnvironmentLayerRenderer(options)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expect.any(String), expected.x, expected.y)
    })

    test('should call context.fillText() with default values when location option value exceeds width and render function is called', () => {
      const coordinates = { x: renderValue.width + 10, y: 0 }
      const options: RenderEnvironmentLayerOptions = {
        location: coordinates
      }
      const { leftX: x, topY: y } = getPresetCoordinates(renderValue, getTextSizeResponse)
      const expected = { x, y }

      const result = getRenderEnvironmentLayerRenderer(options)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expect.any(String), expected.x, expected.y)
    })

    test('should call context.fillText() with default values when coordinate value exceeds height and render function is called', () => {
      const coordinates = { x: 0, y: renderValue.height + 10 }
      const options: RenderEnvironmentLayerOptions = {
        location: coordinates
      }
      const { leftX: x, topY: y } = getPresetCoordinates(renderValue, getTextSizeResponse)
      const expected = { x, y }

      const result = getRenderEnvironmentLayerRenderer(options)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expect.any(String), expected.x, expected.y)
    })

    test('should call context.fillText() with default text when value is RenderEnvironmentLayerOptions and render function is called', () => {
      const options: RenderEnvironmentLayerOptions = {
        location: RenderLocation.TopRight
      }
      const { rightX: x, topY: y } = getPresetCoordinates(renderValue, getTextSizeResponse)
      const expected = { x, y }
      const texts = [
        `fps: ${renderValue.fps};`,
        `size: ${renderValue.width}x${renderValue.height};`,
        `client: ${renderValue.clientWidth}x${renderValue.clientHeight};`,
        `ratio: ${renderValue.pixelRatio};`,
        `frame: ${renderValue.frame};`
      ]
      const expectedText = texts.join(' ')

      const result = getRenderEnvironmentLayerRenderer(options)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expectedText, expected.x, expected.y)
    })

    test('should set context.fillStyle with color option value when render function is called', () => {
      const options: RenderEnvironmentLayerOptions = {
        location: RenderLocation.BottomCenter,
        color: '#ff0000'
      }

      const result = getRenderEnvironmentLayerRenderer(options)!
      result(renderValue, context)

      expect(context.fillStyle).toBe(options.color)
    })

    test('should set context.globalAlpha with opacity option value when render function is called', () => {
      const options: RenderEnvironmentLayerOptions = {
        location: RenderLocation.BottomCenter,
        opacity: 0.45
      }

      const result = getRenderEnvironmentLayerRenderer(options)!
      result(renderValue, context)

      expect(context.globalAlpha).toBe(options.opacity)
    })

    test('should call context.fillText() with fps text when renderFps option is true and render function is called', () => {
      const options: RenderEnvironmentLayerOptions = {
        location: RenderLocation.TopRight,
        renderFps: true
      }
      const texts = [
        `fps: ${renderValue.fps};`,
        `size: ${renderValue.width}x${renderValue.height};`,
        `client: ${renderValue.clientWidth}x${renderValue.clientHeight};`,
        `ratio: ${renderValue.pixelRatio};`,
        `frame: ${renderValue.frame};`
      ]
      const expectedText = texts.join(' ')

      const result = getRenderEnvironmentLayerRenderer(options)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expectedText, expect.any(Number), expect.any(Number))
    })

    test('should call context.fillText() without fps text when renderFps option is false and render function is called', () => {
      const options: RenderEnvironmentLayerOptions = {
        location: RenderLocation.BottomLeft,
        renderFps: false
      }
      const texts = [
        `size: ${renderValue.width}x${renderValue.height};`,
        `client: ${renderValue.clientWidth}x${renderValue.clientHeight};`,
        `ratio: ${renderValue.pixelRatio};`,
        `frame: ${renderValue.frame};`
      ]
      const expectedText = texts.join(' ')

      const result = getRenderEnvironmentLayerRenderer(options)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expectedText, expect.any(Number), expect.any(Number))
    })

    test('should call context.fillText() with size text when renderSize option is true and render function is called', () => {
      const options: RenderEnvironmentLayerOptions = {
        location: RenderLocation.TopRight,
        renderSize: true
      }
      const texts = [
        `fps: ${renderValue.fps};`,
        `size: ${renderValue.width}x${renderValue.height};`,
        `client: ${renderValue.clientWidth}x${renderValue.clientHeight};`,
        `ratio: ${renderValue.pixelRatio};`,
        `frame: ${renderValue.frame};`
      ]
      const expectedText = texts.join(' ')

      const result = getRenderEnvironmentLayerRenderer(options)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expectedText, expect.any(Number), expect.any(Number))
    })

    test('should call context.fillText() without size text when renderSize option is false and render function is called', () => {
      const options: RenderEnvironmentLayerOptions = {
        location: RenderLocation.BottomLeft,
        renderSize: false
      }
      const texts = [
        `fps: ${renderValue.fps};`,
        `client: ${renderValue.clientWidth}x${renderValue.clientHeight};`,
        `ratio: ${renderValue.pixelRatio};`,
        `frame: ${renderValue.frame};`
      ]
      const expectedText = texts.join(' ')

      const result = getRenderEnvironmentLayerRenderer(options)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expectedText, expect.any(Number), expect.any(Number))
    })

    test('should call context.fillText() with client text when renderClientSize option is true and render function is called', () => {
      const options: RenderEnvironmentLayerOptions = {
        location: RenderLocation.TopRight,
        renderClientSize: true
      }
      const texts = [
        `fps: ${renderValue.fps};`,
        `size: ${renderValue.width}x${renderValue.height};`,
        `client: ${renderValue.clientWidth}x${renderValue.clientHeight};`,
        `ratio: ${renderValue.pixelRatio};`,
        `frame: ${renderValue.frame};`
      ]
      const expectedText = texts.join(' ')

      const result = getRenderEnvironmentLayerRenderer(options)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expectedText, expect.any(Number), expect.any(Number))
    })

    test('should call context.fillText() without client text when renderClientSize option is false and render function is called', () => {
      const options: RenderEnvironmentLayerOptions = {
        location: RenderLocation.BottomLeft,
        renderClientSize: false
      }
      const texts = [
        `fps: ${renderValue.fps};`,
        `size: ${renderValue.width}x${renderValue.height};`,
        `ratio: ${renderValue.pixelRatio};`,
        `frame: ${renderValue.frame};`
      ]
      const expectedText = texts.join(' ')

      const result = getRenderEnvironmentLayerRenderer(options)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expectedText, expect.any(Number), expect.any(Number))
    })

    test('should call context.fillText() with ratio text when renderPixelRatio option is true and render function is called', () => {
      const options: RenderEnvironmentLayerOptions = {
        location: RenderLocation.TopRight,
        renderPixelRatio: true
      }
      const texts = [
        `fps: ${renderValue.fps};`,
        `size: ${renderValue.width}x${renderValue.height};`,
        `client: ${renderValue.clientWidth}x${renderValue.clientHeight};`,
        `ratio: ${renderValue.pixelRatio};`,
        `frame: ${renderValue.frame};`
      ]
      const expectedText = texts.join(' ')

      const result = getRenderEnvironmentLayerRenderer(options)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expectedText, expect.any(Number), expect.any(Number))
    })

    test('should call context.fillText() without ratio text when renderPixelRatio option is false and render function is called', () => {
      const options: RenderEnvironmentLayerOptions = {
        location: RenderLocation.BottomLeft,
        renderPixelRatio: false
      }
      const texts = [
        `fps: ${renderValue.fps};`,
        `size: ${renderValue.width}x${renderValue.height};`,
        `client: ${renderValue.clientWidth}x${renderValue.clientHeight};`,
        `frame: ${renderValue.frame};`
      ]
      const expectedText = texts.join(' ')

      const result = getRenderEnvironmentLayerRenderer(options)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expectedText, expect.any(Number), expect.any(Number))
    })

    test('should call context.fillText() with frame text when renderFrameNumber option is true and render function is called', () => {
      const options: RenderEnvironmentLayerOptions = {
        location: RenderLocation.TopRight,
        renderFrameNumber: true
      }
      const texts = [
        `fps: ${renderValue.fps};`,
        `size: ${renderValue.width}x${renderValue.height};`,
        `client: ${renderValue.clientWidth}x${renderValue.clientHeight};`,
        `ratio: ${renderValue.pixelRatio};`,
        `frame: ${renderValue.frame};`
      ]
      const expectedText = texts.join(' ')

      const result = getRenderEnvironmentLayerRenderer(options)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expectedText, expect.any(Number), expect.any(Number))
    })

    test('should call context.fillText() without frame text when renderFrameNumber option is false and render function is called', () => {
      const options: RenderEnvironmentLayerOptions = {
        location: RenderLocation.BottomLeft,
        renderFrameNumber: false
      }
      const texts = [
        `fps: ${renderValue.fps};`,
        `size: ${renderValue.width}x${renderValue.height};`,
        `client: ${renderValue.clientWidth}x${renderValue.clientHeight};`,
        `ratio: ${renderValue.pixelRatio};`
      ]
      const expectedText = texts.join(' ')

      const result = getRenderEnvironmentLayerRenderer(options)!
      result(renderValue, context)

      expect(context.fillText).toHaveBeenCalledWith(expectedText, expect.any(Number), expect.any(Number))
    })

    type PresetCoordinates = {
      leftX: number, midX: number, rightX: number,
      topY: number, midY: number, bottomY: number
    }
    const getPresetCoordinates = (renderValue: RenderEnvironmentValue, textSize: Size): PresetCoordinates => {
      const offSet = 10
      const { width, height } = textSize
      const leftX = 0 + offSet
      const topY = 0 + offSet + offSet
      const midX = (renderValue.width / 2) - (width / 2)
      const midY = (renderValue.height / 2) - (height / 2)
      const rightX = renderValue.width - width - offSet
      const bottomY = renderValue.height - height

      return {
        leftX, midX, rightX,
        topY, midY, bottomY
      }
    }
  })

  describe('getRenderGridLayerRenderer function', () => {
    let context: CanvasRenderingContext2D
    let deepCopyMock: MockInstance

    beforeEach(() => {
      context = {
        save: vi.fn(),
        strokeStyle: '',
        globalAlpha: 0,
        setLineDash: vi.fn(),
        canvas: { width: 0, height: 0 },
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        restore: vi.fn()
      } as unknown as CanvasRenderingContext2D

      deepCopyMock = vi.spyOn(misc, 'deepCopy')
    })

    test('should call deepCopy when called', () => {
      getRenderGridLayerRenderer(false)
      expect(deepCopyMock).toHaveBeenCalledWith(DEFAULT_RENDER_GRID_LAYER_OPTIONS)
    })

    test.each([
      { value: undefined },
      { value: false }
    ])('should return null when value is $value', ({ value }: { value?: boolean }) => {
      const result = getRenderGridLayerRenderer(value)
      expect(result).toBe(null)
    })

    test('should return a function when value is a function', () => {
      const value = vi.fn()
      const result = getRenderGridLayerRenderer(value)
      expect(result).toBe(value)
    })

    test('should call supplied function when returned function is called', () => {
      const value = vi.fn()
      const result = getRenderGridLayerRenderer(value)!

      result(context)

      expect(value).toHaveBeenCalledWith(context)
    })

    test('should return render function when value is true', () => {
      const result = getRenderGridLayerRenderer(true)
      expect(result).not.toBeNull()
      expect(result).toBeTypeOf('function')
    })

    test('should call context.save() when render function is called', () => {
      const result = getRenderGridLayerRenderer(true)!
      result(context)
      expect(context.save).toHaveBeenCalled()
    })

    test('should set context.strokeStyle with default value when render function is called', () => {
      const result = getRenderGridLayerRenderer(true)!
      result(context)
      expect(context.strokeStyle).toBe(DEFAULT_RENDER_GRID_LAYER_OPTIONS.color)
    })

    test('should set context.globalAlpha with default value when render function is called', () => {
      const result = getRenderGridLayerRenderer(true)!
      result(context)
      expect(context.globalAlpha).toBe(DEFAULT_RENDER_GRID_LAYER_OPTIONS.opacity)
    })

    test('should not call context.setLineDash() when render function is called', () => {
      const result = getRenderGridLayerRenderer(true)!
      result(context)
      expect(context.setLineDash).not.toHaveBeenCalled()
    })

    test('should call context.restore() when render function is called', () => {
      const result = getRenderGridLayerRenderer(true)!
      result(context)
      expect(context.restore).toHaveBeenCalled()
    })

    test('should return render function when value is string', () => {
      const result = getRenderGridLayerRenderer('blue')
      expect(result).not.toBeNull()
      expect(result).toBeTypeOf('function')
    })

    test('should set context.strokeStyle when value is string and render function is called', () => {
      const strokeStyle = 'blue'

      const result = getRenderGridLayerRenderer(strokeStyle)!
      result(context)

      expect(context.strokeStyle).toBe(strokeStyle)
    })

    test('should return render function when value is number', () => {
      const result = getRenderGridLayerRenderer(100)
      expect(result).not.toBeNull()
      expect(result).toBeTypeOf('function')
    })

    test('should render horizontal lines at specified intervals until width is reached when value is number and function is called', () => {
      const gridSize = 10
      context.canvas.width = 100

      const result = getRenderGridLayerRenderer(gridSize)!
      result(context)

      let callCount = 0
      let current = gridSize
      while(current < context.canvas.width) {
        expect(context.moveTo).toHaveBeenCalledWith(current, 0)
        expect(context.lineTo).toHaveBeenCalledWith(current, context.canvas.height)
        current += gridSize
        callCount++
      }

      expect(context.beginPath).toHaveBeenCalledTimes(callCount)
      expect(context.moveTo).toHaveBeenCalledTimes(callCount)
      expect(context.lineTo).toHaveBeenCalledTimes(callCount)
      expect(context.stroke).toHaveBeenCalledTimes(callCount)
    })

    test('should render vertical lines at specified intervals until height is reached when value is number and function is called', () => {
      const gridSize = 10
      context.canvas.height = 100

      const result = getRenderGridLayerRenderer(gridSize)!
      result(context)

      let callCount = 0
      let current = gridSize
      while(current < context.canvas.height) {
        expect(context.moveTo).toHaveBeenCalledWith(0, current)
        expect(context.lineTo).toHaveBeenCalledWith(context.canvas.width, current)
        current += gridSize
        callCount++
      }

      expect(context.beginPath).toHaveBeenCalledTimes(callCount)
      expect(context.moveTo).toHaveBeenCalledTimes(callCount)
      expect(context.lineTo).toHaveBeenCalledTimes(callCount)
      expect(context.stroke).toHaveBeenCalledTimes(callCount)
    })

    test('should render horizontal lines at default intervals until width is reached when number value is invalid and function is called', () => {
      context.canvas.width = 100

      const result = getRenderGridLayerRenderer(0)!
      result(context)

      const gridSize = DEFAULT_RENDER_GRID_LAYER_OPTIONS.size as number
      let callCount = 0
      let current = gridSize
      while(current < context.canvas.width) {
        expect(context.moveTo).toHaveBeenCalledWith(current, 0)
        expect(context.lineTo).toHaveBeenCalledWith(current, context.canvas.height)
        current += gridSize
        callCount++
      }

      expect(context.beginPath).toHaveBeenCalledTimes(callCount)
      expect(context.moveTo).toHaveBeenCalledTimes(callCount)
      expect(context.lineTo).toHaveBeenCalledTimes(callCount)
      expect(context.stroke).toHaveBeenCalledTimes(callCount)
    })

    test('should render vertical lines at default intervals until height is reached when number value is invalid and function is called', () => {
      context.canvas.height = 100

      const result = getRenderGridLayerRenderer(0)!
      result(context)

      const gridSize = DEFAULT_RENDER_GRID_LAYER_OPTIONS.size as number
      let callCount = 0
      let current = gridSize
      while(current < context.canvas.height) {
        expect(context.moveTo).toHaveBeenCalledWith(0, current)
        expect(context.lineTo).toHaveBeenCalledWith(context.canvas.width, current)
        current += gridSize
        callCount++
      }

      expect(context.beginPath).toHaveBeenCalledTimes(callCount)
      expect(context.moveTo).toHaveBeenCalledTimes(callCount)
      expect(context.lineTo).toHaveBeenCalledTimes(callCount)
      expect(context.stroke).toHaveBeenCalledTimes(callCount)
    })

    test('should render horizontal lines at default intervals until width is reached when number value exceeds width and function is called', () => {
      context.canvas.width = 100

      const result = getRenderGridLayerRenderer(context.canvas.width + 1)!
      result(context)

      const gridSize = DEFAULT_RENDER_GRID_LAYER_OPTIONS.size as number
      let callCount = 0
      let current = gridSize
      while(current < context.canvas.width) {
        expect(context.moveTo).toHaveBeenCalledWith(current, 0)
        expect(context.lineTo).toHaveBeenCalledWith(current, context.canvas.height)
        current += gridSize
        callCount++
      }

      expect(context.beginPath).toHaveBeenCalledTimes(callCount)
      expect(context.moveTo).toHaveBeenCalledTimes(callCount)
      expect(context.lineTo).toHaveBeenCalledTimes(callCount)
      expect(context.stroke).toHaveBeenCalledTimes(callCount)
    })

    test('should render vertical lines at default intervals until height is reached when number value exceeds height and function is called', () => {
      context.canvas.height = 100

      const result = getRenderGridLayerRenderer(context.canvas.height + 1)!
      result(context)

      const gridSize = DEFAULT_RENDER_GRID_LAYER_OPTIONS.size as number
      let callCount = 0
      let current = gridSize
      while(current < context.canvas.height) {
        expect(context.moveTo).toHaveBeenCalledWith(0, current)
        expect(context.lineTo).toHaveBeenCalledWith(context.canvas.width, current)
        current += gridSize
        callCount++
      }

      expect(context.beginPath).toHaveBeenCalledTimes(callCount)
      expect(context.moveTo).toHaveBeenCalledTimes(callCount)
      expect(context.lineTo).toHaveBeenCalledTimes(callCount)
      expect(context.stroke).toHaveBeenCalledTimes(callCount)
    })

    test('should render horizontal lines at specified intervals until width is reached when value is Size and function is called', () => {
      const gridSize = { width: 10, height: 20 }
      context.canvas.width = 100

      const result = getRenderGridLayerRenderer(gridSize)!
      result(context)

      let callCount = 0
      let current = gridSize.width
      while(current < context.canvas.width) {
        expect(context.moveTo).toHaveBeenCalledWith(current, 0)
        expect(context.lineTo).toHaveBeenCalledWith(current, context.canvas.height)
        current += gridSize.width
        callCount++
      }

      expect(context.beginPath).toHaveBeenCalledTimes(callCount)
      expect(context.moveTo).toHaveBeenCalledTimes(callCount)
      expect(context.lineTo).toHaveBeenCalledTimes(callCount)
      expect(context.stroke).toHaveBeenCalledTimes(callCount)
    })

    test('should render vertical lines at specified intervals until height is reached when value is Size and function is called', () => {
      const gridSize = { width: 10, height: 20 }
      context.canvas.height = 100

      const result = getRenderGridLayerRenderer(gridSize)!
      result(context)

      let callCount = 0
      let current = gridSize.height
      while(current < context.canvas.height) {
        expect(context.moveTo).toHaveBeenCalledWith(0, current)
        expect(context.lineTo).toHaveBeenCalledWith(context.canvas.width, current)
        current += gridSize.height
        callCount++
      }

      expect(context.beginPath).toHaveBeenCalledTimes(callCount)
      expect(context.moveTo).toHaveBeenCalledTimes(callCount)
      expect(context.lineTo).toHaveBeenCalledTimes(callCount)
      expect(context.stroke).toHaveBeenCalledTimes(callCount)
    })

    test('should render horizontal lines at default intervals until width is reached when Size value is invalid and function is called', () => {
      const size = { width: 0, height: 10 }
      context.canvas.width = 100

      const result = getRenderGridLayerRenderer(size)!
      result(context)

      const gridSize = DEFAULT_RENDER_GRID_LAYER_OPTIONS.size as number
      let callCount = 0
      let current = gridSize
      while(current < context.canvas.width) {
        expect(context.moveTo).toHaveBeenCalledWith(current, 0)
        expect(context.lineTo).toHaveBeenCalledWith(current, context.canvas.height)
        current += gridSize
        callCount++
      }

      expect(context.beginPath).toHaveBeenCalledTimes(callCount)
      expect(context.moveTo).toHaveBeenCalledTimes(callCount)
      expect(context.lineTo).toHaveBeenCalledTimes(callCount)
      expect(context.stroke).toHaveBeenCalledTimes(callCount)
    })

    test('should render vertical lines at default intervals until height is reached when Size value is invalid and function is called', () => {
      const size = { width: 10, height: 0 }
      context.canvas.height = 100

      const result = getRenderGridLayerRenderer(size)!
      result(context)

      const gridSize = DEFAULT_RENDER_GRID_LAYER_OPTIONS.size as number
      let callCount = 0
      let current = gridSize
      while(current < context.canvas.height) {
        expect(context.moveTo).toHaveBeenCalledWith(0, current)
        expect(context.lineTo).toHaveBeenCalledWith(context.canvas.width, current)
        current += gridSize
        callCount++
      }

      expect(context.beginPath).toHaveBeenCalledTimes(callCount)
      expect(context.moveTo).toHaveBeenCalledTimes(callCount)
      expect(context.lineTo).toHaveBeenCalledTimes(callCount)
      expect(context.stroke).toHaveBeenCalledTimes(callCount)
    })

    test('should render horizontal lines at default intervals until width is reached when Size value exceeds width and function is called', () => {
      context.canvas.width = 100
      const size = { width: context.canvas.width + 1, height: 10 }

      const result = getRenderGridLayerRenderer(size)!
      result(context)

      const gridSize = DEFAULT_RENDER_GRID_LAYER_OPTIONS.size as number
      let callCount = 0
      let current = gridSize
      while(current < context.canvas.width) {
        expect(context.moveTo).toHaveBeenCalledWith(current, 0)
        expect(context.lineTo).toHaveBeenCalledWith(current, context.canvas.height)
        current += gridSize
        callCount++
      }

      expect(context.beginPath).toHaveBeenCalledTimes(callCount)
      expect(context.moveTo).toHaveBeenCalledTimes(callCount)
      expect(context.lineTo).toHaveBeenCalledTimes(callCount)
      expect(context.stroke).toHaveBeenCalledTimes(callCount)
    })

    test('should render vertical lines at default intervals until height is reached when Size value exceeds height and function is called', () => {
      context.canvas.height = 100
      const size = { width: 10, height: context.canvas.height + 1 }

      const result = getRenderGridLayerRenderer(size)!
      result(context)

      const gridSize = DEFAULT_RENDER_GRID_LAYER_OPTIONS.size as number
      let callCount = 0
      let current = gridSize
      while(current < context.canvas.height) {
        expect(context.moveTo).toHaveBeenCalledWith(0, current)
        expect(context.lineTo).toHaveBeenCalledWith(context.canvas.width, current)
        current += gridSize
        callCount++
      }

      expect(context.beginPath).toHaveBeenCalledTimes(callCount)
      expect(context.moveTo).toHaveBeenCalledTimes(callCount)
      expect(context.lineTo).toHaveBeenCalledTimes(callCount)
      expect(context.stroke).toHaveBeenCalledTimes(callCount)
    })

    test('should return render function when value is RenderGridLayerOptions', () => {
      const options: RenderGridLayerOptions = {
        size: 10
      }
      const result = getRenderGridLayerRenderer(options)
      expect(result).not.toBeNull()
      expect(result).toBeTypeOf('function')
    })

    test('should set context.strokeStyle with default value when value is RenderGridLayerOptions and render function is called', () => {
      const options: RenderGridLayerOptions = {
        size: 10
      }

      const result = getRenderGridLayerRenderer(options)!
      result(context)

      expect(context.strokeStyle).toBe(DEFAULT_RENDER_GRID_LAYER_OPTIONS.color)
    })

    test('should set context.globalAlpha with default value when render function is called', () => {
      const options: RenderGridLayerOptions = {
        size: 10
      }

      const result = getRenderGridLayerRenderer(options)!
      result(context)

      expect(context.globalAlpha).toBe(DEFAULT_RENDER_GRID_LAYER_OPTIONS.opacity)
    })

    test('should not call context.setLineDash() when render function is called', () => {
      const options: RenderGridLayerOptions = {
        size: 10
      }

      const result = getRenderGridLayerRenderer(options)!
      result(context)

      expect(context.setLineDash).not.toHaveBeenCalled()
    })

    test('should render horizontal lines at specified intervals until width is reached when size option value is number and function is called', () => {
      const gridSize = 10
      context.canvas.width = 100
      const options: RenderGridLayerOptions = {
        size: gridSize
      }

      const result = getRenderGridLayerRenderer(options)!
      result(context)

      let callCount = 0
      let current = gridSize
      while(current < context.canvas.width) {
        expect(context.moveTo).toHaveBeenCalledWith(current, 0)
        expect(context.lineTo).toHaveBeenCalledWith(current, context.canvas.height)
        current += gridSize
        callCount++
      }

      expect(context.beginPath).toHaveBeenCalledTimes(callCount)
      expect(context.moveTo).toHaveBeenCalledTimes(callCount)
      expect(context.lineTo).toHaveBeenCalledTimes(callCount)
      expect(context.stroke).toHaveBeenCalledTimes(callCount)
    })

    test('should render vertical lines at specified intervals until height is reached when value is number and function is called', () => {
      const gridSize = 10
      context.canvas.height = 100
      const options: RenderGridLayerOptions = {
        size: gridSize
      }

      const result = getRenderGridLayerRenderer(options)!
      result(context)

      let callCount = 0
      let current = gridSize
      while(current < context.canvas.height) {
        expect(context.moveTo).toHaveBeenCalledWith(0, current)
        expect(context.lineTo).toHaveBeenCalledWith(context.canvas.width, current)
        current += gridSize
        callCount++
      }

      expect(context.beginPath).toHaveBeenCalledTimes(callCount)
      expect(context.moveTo).toHaveBeenCalledTimes(callCount)
      expect(context.lineTo).toHaveBeenCalledTimes(callCount)
      expect(context.stroke).toHaveBeenCalledTimes(callCount)
    })

    test('should render horizontal lines at default intervals until width is reached when size option value is an invalid number and function is called', () => {
      context.canvas.width = 100
      const options: RenderGridLayerOptions = {
        size: 0
      }

      const result = getRenderGridLayerRenderer(options)!
      result(context)

      const gridSize = DEFAULT_RENDER_GRID_LAYER_OPTIONS.size as number
      let callCount = 0
      let current = gridSize
      while(current < context.canvas.width) {
        expect(context.moveTo).toHaveBeenCalledWith(current, 0)
        expect(context.lineTo).toHaveBeenCalledWith(current, context.canvas.height)
        current += gridSize
        callCount++
      }

      expect(context.beginPath).toHaveBeenCalledTimes(callCount)
      expect(context.moveTo).toHaveBeenCalledTimes(callCount)
      expect(context.lineTo).toHaveBeenCalledTimes(callCount)
      expect(context.stroke).toHaveBeenCalledTimes(callCount)
    })

    test('should render vertical lines at default intervals until height is reached when size option value is an invalid number and function is called', () => {
      context.canvas.height = 100
      const options: RenderGridLayerOptions = {
        size: 0
      }

      const result = getRenderGridLayerRenderer(options)!
      result(context)

      const gridSize = DEFAULT_RENDER_GRID_LAYER_OPTIONS.size as number
      let callCount = 0
      let current = gridSize
      while(current < context.canvas.height) {
        expect(context.moveTo).toHaveBeenCalledWith(0, current)
        expect(context.lineTo).toHaveBeenCalledWith(context.canvas.width, current)
        current += gridSize
        callCount++
      }

      expect(context.beginPath).toHaveBeenCalledTimes(callCount)
      expect(context.moveTo).toHaveBeenCalledTimes(callCount)
      expect(context.lineTo).toHaveBeenCalledTimes(callCount)
      expect(context.stroke).toHaveBeenCalledTimes(callCount)
    })

    test('should render horizontal lines at default intervals until width is reached when size option value is a number that exceeds width and function is called', () => {
      context.canvas.width = 100
      const options: RenderGridLayerOptions = {
        size: context.canvas.width + 1
      }

      const result = getRenderGridLayerRenderer(options)!
      result(context)

      const gridSize = DEFAULT_RENDER_GRID_LAYER_OPTIONS.size as number
      let callCount = 0
      let current = gridSize
      while(current < context.canvas.width) {
        expect(context.moveTo).toHaveBeenCalledWith(current, 0)
        expect(context.lineTo).toHaveBeenCalledWith(current, context.canvas.height)
        current += gridSize
        callCount++
      }

      expect(context.beginPath).toHaveBeenCalledTimes(callCount)
      expect(context.moveTo).toHaveBeenCalledTimes(callCount)
      expect(context.lineTo).toHaveBeenCalledTimes(callCount)
      expect(context.stroke).toHaveBeenCalledTimes(callCount)
    })

    test('should render vertical lines at default intervals until height is reached when size option value is a number that exceeds height and function is called', () => {
      context.canvas.height = 100
      const options: RenderGridLayerOptions = {
        size: context.canvas.height = 1
      }

      const result = getRenderGridLayerRenderer(options)!
      result(context)

      const gridSize = DEFAULT_RENDER_GRID_LAYER_OPTIONS.size as number
      let callCount = 0
      let current = gridSize
      while(current < context.canvas.height) {
        expect(context.moveTo).toHaveBeenCalledWith(0, current)
        expect(context.lineTo).toHaveBeenCalledWith(context.canvas.width, current)
        current += gridSize
        callCount++
      }

      expect(context.beginPath).toHaveBeenCalledTimes(callCount)
      expect(context.moveTo).toHaveBeenCalledTimes(callCount)
      expect(context.lineTo).toHaveBeenCalledTimes(callCount)
      expect(context.stroke).toHaveBeenCalledTimes(callCount)
    })

    test('should render horizontal lines at specified intervals until width is reached when size option value is Size and function is called', () => {
      const gridSize = { width: 10, height: 20 }
      context.canvas.width = 100
      const options: RenderGridLayerOptions = {
        size: gridSize
      }

      const result = getRenderGridLayerRenderer(options)!
      result(context)

      let callCount = 0
      let current = gridSize.width
      while(current < context.canvas.width) {
        expect(context.moveTo).toHaveBeenCalledWith(current, 0)
        expect(context.lineTo).toHaveBeenCalledWith(current, context.canvas.height)
        current += gridSize.width
        callCount++
      }

      expect(context.beginPath).toHaveBeenCalledTimes(callCount)
      expect(context.moveTo).toHaveBeenCalledTimes(callCount)
      expect(context.lineTo).toHaveBeenCalledTimes(callCount)
      expect(context.stroke).toHaveBeenCalledTimes(callCount)
    })

    test('should render vertical lines at specified intervals until height is reached when size option value is Size and function is called', () => {
      const gridSize = { width: 10, height: 20 }
      context.canvas.height = 100
      const options: RenderGridLayerOptions = {
        size: gridSize
      }

      const result = getRenderGridLayerRenderer(options)!
      result(context)

      let callCount = 0
      let current = gridSize.height
      while(current < context.canvas.height) {
        expect(context.moveTo).toHaveBeenCalledWith(0, current)
        expect(context.lineTo).toHaveBeenCalledWith(context.canvas.width, current)
        current += gridSize.height
        callCount++
      }

      expect(context.beginPath).toHaveBeenCalledTimes(callCount)
      expect(context.moveTo).toHaveBeenCalledTimes(callCount)
      expect(context.lineTo).toHaveBeenCalledTimes(callCount)
      expect(context.stroke).toHaveBeenCalledTimes(callCount)
    })

    test('should render horizontal lines at default intervals until width is reached when size option value is an invalid Size and function is called', () => {
      context.canvas.width = 100
      const options: RenderGridLayerOptions = {
        size: { width: 0, height: 10 }
      }

      const result = getRenderGridLayerRenderer(options)!
      result(context)

      const gridSize = DEFAULT_RENDER_GRID_LAYER_OPTIONS.size as number
      let callCount = 0
      let current = gridSize
      while(current < context.canvas.width) {
        expect(context.moveTo).toHaveBeenCalledWith(current, 0)
        expect(context.lineTo).toHaveBeenCalledWith(current, context.canvas.height)
        current += gridSize
        callCount++
      }

      expect(context.beginPath).toHaveBeenCalledTimes(callCount)
      expect(context.moveTo).toHaveBeenCalledTimes(callCount)
      expect(context.lineTo).toHaveBeenCalledTimes(callCount)
      expect(context.stroke).toHaveBeenCalledTimes(callCount)
    })

    test('should render vertical lines at default intervals until height is reached when size option value is an invalid Size and function is called', () => {
      context.canvas.height = 100
      const options: RenderGridLayerOptions = {
        size: { width: 10, height: 0 }
      }

      const result = getRenderGridLayerRenderer(options)!
      result(context)

      const gridSize = DEFAULT_RENDER_GRID_LAYER_OPTIONS.size as number
      let callCount = 0
      let current = gridSize
      while(current < context.canvas.height) {
        expect(context.moveTo).toHaveBeenCalledWith(0, current)
        expect(context.lineTo).toHaveBeenCalledWith(context.canvas.width, current)
        current += gridSize
        callCount++
      }

      expect(context.beginPath).toHaveBeenCalledTimes(callCount)
      expect(context.moveTo).toHaveBeenCalledTimes(callCount)
      expect(context.lineTo).toHaveBeenCalledTimes(callCount)
      expect(context.stroke).toHaveBeenCalledTimes(callCount)
    })

    test('should render horizontal lines at default intervals until width is reached when size option value is a Size that exceeds width and function is called', () => {
      context.canvas.width = 100
      const options: RenderGridLayerOptions = {
        size: { width: context.canvas.width + 1, height: 10 }
      }

      const result = getRenderGridLayerRenderer(options)!
      result(context)

      const gridSize = DEFAULT_RENDER_GRID_LAYER_OPTIONS.size as number
      let callCount = 0
      let current = gridSize
      while(current < context.canvas.width) {
        expect(context.moveTo).toHaveBeenCalledWith(current, 0)
        expect(context.lineTo).toHaveBeenCalledWith(current, context.canvas.height)
        current += gridSize
        callCount++
      }

      expect(context.beginPath).toHaveBeenCalledTimes(callCount)
      expect(context.moveTo).toHaveBeenCalledTimes(callCount)
      expect(context.lineTo).toHaveBeenCalledTimes(callCount)
      expect(context.stroke).toHaveBeenCalledTimes(callCount)
    })

    test('should render vertical lines at default intervals until height is reached when size option value is a Size that exceeds width and function is called', () => {
      context.canvas.height = 100
      const options: RenderGridLayerOptions = {
        size: { width: 10, height: context.canvas.height + 1 }
      }

      const result = getRenderGridLayerRenderer(options)!
      result(context)

      const gridSize = DEFAULT_RENDER_GRID_LAYER_OPTIONS.size as number
      let callCount = 0
      let current = gridSize
      while(current < context.canvas.height) {
        expect(context.moveTo).toHaveBeenCalledWith(0, current)
        expect(context.lineTo).toHaveBeenCalledWith(context.canvas.width, current)
        current += gridSize
        callCount++
      }

      expect(context.beginPath).toHaveBeenCalledTimes(callCount)
      expect(context.moveTo).toHaveBeenCalledTimes(callCount)
      expect(context.lineTo).toHaveBeenCalledTimes(callCount)
      expect(context.stroke).toHaveBeenCalledTimes(callCount)
    })

    test('should set context.strokeStyle when value is RenderGridLayerOptions and render function is called', () => {
      const options: RenderGridLayerOptions = {
        size: 10,
        color: 'blue'
      }

      const result = getRenderGridLayerRenderer(options)!
      result(context)

      expect(context.strokeStyle).toBe(options.color)
    })

    test('should set context.globalAlpha when value is RenderGridLayerOptions and render function is called', () => {
      const options: RenderGridLayerOptions = {
        size: 10,
        opacity: 0.45
      }

      const result = getRenderGridLayerRenderer(options)!
      result(context)

      expect(context.globalAlpha).toBe(options.opacity)
    })

    test('should call context.setLineDash() when value is RenderGridLayerOptions and render function is called', () => {
      const options: RenderGridLayerOptions = {
        size: 10,
        dashLength: 5
      }

      const result = getRenderGridLayerRenderer(options)!
      result(context)

      expect(context.setLineDash).toHaveBeenCalledWith([options.dashLength])
    })

    test.each([
      { dashLength: 0 },
      { dashLength: -1 }
    ])('should not call context.setLineDash() when dashLength value is $dashLength and render function is called', ({ dashLength }: { dashLength: number }) => {
      const options: RenderGridLayerOptions = {
        size: 10,
        dashLength
      }

      const result = getRenderGridLayerRenderer(options)!
      result(context)

      expect(context.setLineDash).not.toHaveBeenCalled()
    })
  })
})
