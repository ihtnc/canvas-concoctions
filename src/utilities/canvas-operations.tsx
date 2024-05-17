type CanvasOperationFunction = (canvas: HTMLCanvasElement) => void;

export const clearFrame:CanvasOperationFunction = (canvas) => {
  const { width, height } = canvas
  const context = canvas.getContext('2d')
  context?.clearRect(0, 0, width, height)
}
