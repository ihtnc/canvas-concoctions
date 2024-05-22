type GetLocalStorageFunction = (key: string, defaultValue: string) => string
export const getLocalStorage: GetLocalStorageFunction = (key, defaultValue) => {
  return localStorage.getItem(key) ?? defaultValue
}

type SetLocalStorageFunction = (key: string, value: string) => void
export const setLocalStorage: SetLocalStorageFunction = (key, value) => {
  localStorage.setItem(key, value)
}

export const constructPublicPath = (path: string): string => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH
  const baseUrl = basePath !== undefined ? `/${basePath.replace(/^\//, '').replace(/\/$/, '')}` : ''
  const url = path.replace(/^\//, '')
  return baseUrl + '/' + url
}

export const loadImage = async (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = constructPublicPath(src)
  })
}

export const requestAnimationFrame = (callback: FrameRequestCallback): number => {
  return window.requestAnimationFrame(callback)
}

export const cancelAnimationFrame = (handle: number): void => {
  window.cancelAnimationFrame(handle)
}

export const getDevicePixelRatio = (): number => {
  return window.devicePixelRatio || 1
}
