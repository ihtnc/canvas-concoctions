import { type Coordinates } from "@/components/canvas/types"
import { type TagsRenderFunction, type RenderPipelineData } from "./types"

export const renderTagsLayer: TagsRenderFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData) => {
  const { tags } = data

  for (let t in tags) {
    context.save()

    context.textBaseline = "middle"
    context.textAlign = "center"

    const tag = tags[t]
    const props = tag.props

    if (props.color !== undefined) {
      const color = `HSLA(${props.color.h}, ${props.color.s}%, ${props.color.s}%, ${props.opacity ?? 1})`
      context.fillStyle = color
    }

    if (props.fontSize !== undefined) {
      context.font = `${props.fontSize}px sans-serif`
    }

    let location: Coordinates | undefined = undefined
    if (props.location !== undefined) {
       location = {
        x: props.location.x,
        y: props.location.y
       }
    }

    let rotation = props.rotation !== undefined ? props.rotation % 360 : 0
    rotation = rotation > 180 ? rotation - 360 : rotation
    rotation = rotation < -180 ? rotation + 360 : rotation

    if (location !== undefined) {
      context.translate(location.x, location.y)
      context.rotate(rotation * Math.PI / 180)
      context.translate(0, 0)
      context.fillText(tag.value, 0, 0)
    }

    context.restore()
  }
}

