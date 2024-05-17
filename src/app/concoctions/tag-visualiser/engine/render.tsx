import { type TagsRenderFunction, type RenderPipelineData } from "./types"

export const renderTagsLayer: TagsRenderFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData) => {
  const { tags } = data

  context.save()

  for (let t in tags) {
    const tag = tags[t]
    const props = tag.props

    if (props.color !== undefined) {
      const color = `HSLA(${props.color.h}, ${props.color.s}%, ${props.color.s}%, ${props.opacity ?? 1})`
      context.fillStyle = color
    }

    if (props.fontSize !== undefined) {
      context.font = `${props.fontSize}px sans-serif`
    }

    if (props.location !== undefined) {
      context.fillText(tag.value, props.location.x, props.location.y)
    }
  }

  context.restore()
}

