import { type Coordinates } from "@/components/canvas/types"
import { type PageData, type PackedSpace } from "./engine/types"
import { type AnimatedCanvasRenderFunction } from "@ihtnc/use-animated-canvas"

export const renderDebugLayer: AnimatedCanvasRenderFunction<PageData> = (context, data) => {
  if (data.data === undefined) { return }

  const { tags } = data.data
  context.save()

  context.fillStyle = '#000000'

  const list: Array<{ tag: string, rank: number }> = []
  for (let t in tags) {
    const { value, rank } = tags[t]
    list.push({ tag: value, rank })
  }
  list.sort((a, b) => { return a.rank - b.rank })

  let x = 10
  let y = 10

  context.fillText('transition view', x, y)
  y += 10

  for (let t in list) {
    const tag = tags[list[t].tag]

    const name = `${tag.value}: ${tag.count};`

    let transitions = tag.transitions.map(t => t.id).join(',')
    transitions = tag.transitions.length > 0 ? `transitions: ${transitions};` : ''

    const text = `[${tag.rank}] ${name} ${transitions}`
    context.fillText(text, x, y)
    y += 10
  }

  context.restore()
}

export const createSpaceAllocationLayerRenderer = (space?: PackedSpace<string>): AnimatedCanvasRenderFunction<PageData> => {
  const renderer: AnimatedCanvasRenderFunction<PageData> = (context, data) => {
    if (space === undefined) { return }
    if (data.data === undefined) { return }

    const { gridSize } = data.data

    context.save()
    context.globalAlpha = 0.5
    context.fillStyle = 'gray'
    for (let a in space.allocations) {
      const allocation = space.allocations[a]
      const locationUL: Coordinates = {
        x: (space.origin.x + allocation.location.x) * gridSize,
        y: (space.origin.y + allocation.location.y) * gridSize
      }

      const width = allocation.horizontal ? allocation.size.width : allocation.size.height
      const height = allocation.horizontal ? allocation.size.height : allocation.size.width
      context.fillRect(locationUL.x, locationUL.y, width * gridSize, height * gridSize)
    }

    context.fillStyle = 'green'
    for (let f in space.free) {
      const free = space.free[f]
      const locationUL: Coordinates = {
        x: (space.origin.x + free.location.x) * gridSize,
        y: (space.origin.y + free.location.y) * gridSize
      }

      const width = free.size.width
      const height = free.size.height
      context.fillRect(locationUL.x, locationUL.y, width * gridSize, height * gridSize)
    }

    context.restore()
  }

  return renderer
}

export const createTagHistoryLayerRenderer = (tagHistory: Array<string>): AnimatedCanvasRenderFunction<PageData> => {
  const renderer: AnimatedCanvasRenderFunction<PageData> = (context, data) => {
    context.save()
    context.textAlign = 'right'

    const padding = 10
    let currentY = padding

    context.fillText('Input Log', context.canvas.width - padding, padding)
    currentY += padding

    for(let i = 0; i < tagHistory.length; i++) {
      const tag = tagHistory[i]
      context.fillText(tag, context.canvas.width - padding, currentY)
      currentY += padding
    }

    context.restore()
  }

  return renderer
}