type GetLocalStorageFunction = (key: string, defaultValue: string) => string
export const getLocalStorage: GetLocalStorageFunction = (key, defaultValue) => {
  return localStorage.getItem(key) ?? defaultValue
}

type SetLocalStorageFunction = (key: string, value: string) => void
export const setLocalStorage: SetLocalStorageFunction = (key, value) => {
  localStorage.setItem(key, value)
}

export const loadImage = async (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}
export const requestAnimationFrame = (callback: FrameRequestCallback): number => {
  return window.requestAnimationFrame(callback)
}

export const cancelAnimationFrame = (handle: number): void => {
  window.cancelAnimationFrame(handle)
}

export const getDevicePixelRatio = (): number => {
  return window.devicePixelRatio ?? 1
}
