import { Mock, MockInstance, afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  getLocalStorage,
  setLocalStorage,
  constructPublicPath,
  loadImage,
  requestAnimationFrame,
  cancelAnimationFrame,
  getDevicePixelRatio
} from './client-operations'

describe('client operations', () => {
  describe('getLocalStorage function', () => {
    let getItem: Mock
    let storage: Storage

    beforeEach(() => {
      getItem = vi.fn()
      storage = {
        getItem,
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      }

      vi.spyOn(global, 'localStorage', 'get').mockReturnValue(storage)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    test('should call localStorage.getItem', () => {
      const key = 'testKey'

      getLocalStorage(key, 'defaultValue')

      expect(getItem).toHaveBeenCalledWith(key)
    })

    test('should return the value from localStorage if it exists', () => {
      const value = 'testValue'
      getItem.mockReturnValue(value)

      const result = getLocalStorage('testKey', 'defaultValue')

      expect(result).toBe(value)
    })

    test('should return the defaultValue if the value does not exist in localStorage', () => {
      const defaultValue = 'defaultValue'
      getItem.mockReturnValue(null)

      const result = getLocalStorage('testKey', defaultValue)

      expect(result).toBe(defaultValue)
    })
  })

  describe('setLocalStorage function', () => {
    let setItem: Mock
    let storage: Storage

    beforeEach(() => {
      setItem = vi.fn()
      storage = {
        getItem: vi.fn(),
        setItem,
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      }

      vi.spyOn(global, 'localStorage', 'get').mockReturnValue(storage)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    test('should call localStorage.setItem', () => {
      const key = 'testKey'
      const value = 'testValue'

      setLocalStorage(key, value)

      expect(setItem).toHaveBeenCalledWith(key, value)
    })
  })

  describe('constructPublicPath function', () => {
    let env: MockInstance

    beforeEach(() => {
      env = vi.spyOn(process, 'env', 'get')

      env.mockReturnValue({})
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    test.each([
      { basePath: 'base', expected: '/base' },
      { basePath: '/base', expected: '/base' },
      { basePath: 'base/', expected: '/base' },
      { basePath: '/base/', expected: '/base' },
    ])('should construct the public path correctly $basePath', ({ basePath, expected }: { basePath: string, expected: string }) => {
      const path = '/test/path'
      env.mockReturnValue({ NEXT_PUBLIC_BASE_PATH: basePath })

      const result = constructPublicPath(path)

      expect(result).toBe(`${expected}/test/path`)
    })

    test('should handle undefined NEXT_PUBLIC_BASE_PATH', () => {
      const path = '/test/path'

      const result = constructPublicPath(path)

      expect(result).toBe('/test/path')
    })

    test.each([
      { path: '/test/path', expected: 'test/path' },
      { path: 'test/path', expected: 'test/path' },
      { path: 'test/path/', expected: 'test/path/' },
      { path: '/test/path/', expected: 'test/path/' },
    ])('should construct the public path correctly $path', ({ path, expected }: { path: string, expected: string }) => {
      env.mockReturnValue({ NEXT_PUBLIC_BASE_PATH: 'base' })

      const result = constructPublicPath(path)

      expect(result).toBe(`/base/${expected}`)
    })
  })

  describe('loadImage function', () => {
    let image: HTMLImageElement
    let imageMock: MockInstance
    let setOnLoadMock: MockInstance, setOnErrorMock: MockInstance
    let onLoad: Mock

    beforeEach(() => {
      image = document.createElement('img')

      setOnLoadMock = vi.spyOn(image, 'onload', 'set')
      setOnLoadMock.mockImplementation((fn) => onLoad = fn as Mock)
      setOnErrorMock = vi.spyOn(image, 'onerror', 'set')

      imageMock = vi.spyOn(global, 'Image').mockImplementation(() => image)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    test('should create an image element', () => {
      loadImage('/test/image')

      expect(imageMock).toHaveBeenCalled()
    })

    test('should set the onload function', () => {
      loadImage('/test/image')

      expect(setOnLoadMock).toHaveBeenCalled()
    })

    test('should set the onerror function', () => {
      loadImage('/test/image')

      expect(setOnErrorMock).toHaveBeenCalled()
    })

    test('should set the image src to the correct path', () => {
      const src = '/test/image'
      const expected = /\/test\/image$/

      loadImage(src)

      expect(image.src).toMatch(expected)
    })

    test('should resolve with the image element when it has loaded', async () => {
      const promise = loadImage('/test/image')
      onLoad()

      const result = await promise

      expect(result).toBe(image)
    })
  })

  describe('requestAnimationFrame function', () => {
    let requestAnimationFrameMock: Mock

    beforeEach(() => {
      requestAnimationFrameMock = vi.fn()
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation(requestAnimationFrameMock)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    test('should call window.requestAnimationFrame', () => {
      const callback = vi.fn()

      requestAnimationFrame(callback)

      expect(requestAnimationFrameMock).toHaveBeenCalledWith(callback)
    })

    test('should return the handle from window.requestAnimationFrame', () => {
      const handle = 123

      requestAnimationFrameMock.mockReturnValue(handle)

      const result = requestAnimationFrame(vi.fn())

      expect(result).toBe(handle)
    })
  })

  describe('cancelAnimationFrame', () => {
    let cancelAnimationFrameMock: Mock

    beforeEach(() => {
      cancelAnimationFrameMock = vi.fn()
      vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(cancelAnimationFrameMock)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    test('should call window.cancelAnimationFrame', () => {
      const handle = 123

      cancelAnimationFrame(handle)

      expect(cancelAnimationFrameMock).toHaveBeenCalledWith(handle)
    })
  })

  describe('getDevicePixelRatio', () => {
    let devicePixelRatioMock: MockInstance

    beforeEach(() => {
      devicePixelRatioMock = vi.spyOn(window, 'devicePixelRatio', 'get')
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    test('should return the device pixel ratio', () => {
      const devicePixelRatio = 2
      devicePixelRatioMock.mockReturnValue(devicePixelRatio)

      const result = getDevicePixelRatio()

      expect(result).toBe(devicePixelRatio)
    })

    test('should return 1 if device pixel ratio is 0', () => {
      devicePixelRatioMock.mockReturnValue(0)

      const result = getDevicePixelRatio()

      expect(result).toBe(1)
    })
  })
})
