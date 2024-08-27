import { type HSL, type Size } from "@/utilities/drawing-operations"
import {
  type Tags,
  type TagValue,
  type AllocatedSpace,
  type PackedSpace,
  type TagAllocations,
  type PageData,
  TagState
} from "./types"
import { initialiseSpace, allocateSpace, areAllocatedSpaceEqual } from "./space-allocation"
import { deepCopy } from "@/utilities/misc-operations"
import { chooseRandom } from "@/utilities/misc-operations"
import ENGINE_DATA from './data'
import {
  type Transition,
  type TransitionProps,
  fadeIn,
  minRotate,
  move,
  resizeFont,
  runTransition
} from "@/utilities/transition-operations"
import { areCoordinatesEqual } from "@/components/canvas/utilities"
import { type Coordinates, type AnimatedCanvasConditionalFunction, type AnimatedCanvasRenderFunction, type AnimatedCanvasTransformFunction } from "@ihtnc/use-animated-canvas"

const NEW_TAG: TagValue = {
  value: '',
  rank: 0,
  count: 0,
  props: {},
  targetProps: {},
  state: TagState.NewTag,
  transitions: []
}

export const shouldResetTags: AnimatedCanvasConditionalFunction<PageData> = (data) => {
  if (data.data === undefined) { return false }
  return data.data.resetTags
}

export const resetTags: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined) { return data }

  data.data.resetTags = false
  data.data.tags = {}
  data.data.spaceAllocation = { origin: { x: 0, y: 0 }, allocations: {} }
  return data
}

export const shouldResize: AnimatedCanvasConditionalFunction<PageData> = (data) => {
  if (data.data === undefined) { return false }
  return data.data.resize
}

export const shouldAddTag: AnimatedCanvasConditionalFunction<PageData> = (data) => {
  if (data.data === undefined) { return false }
  return data.data.addTag
}

export const hasNewTag: AnimatedCanvasConditionalFunction<PageData> = (data) => {
  if (data.data === undefined) { return false }
  return data.data.newTagValue.trim().length > 0
}

const getNewColor = (existingHues: Array<number>): HSL => {
  const lastColor = existingHues.length > 0 ? existingHues[existingHues.length - 1] : chooseRandom(0, 359)
  let newHue = (lastColor + 35) % 360
  while (existingHues.findIndex(h => h === newHue) >= 0) {
    newHue = (newHue + 33) % 360
  }

  return { h: newHue, s: ENGINE_DATA.BaseColor.s, l: ENGINE_DATA.BaseColor.l }
}

export const addNewTag: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined) { return data }

  const { tags, newTagValue, existingHues } = data.data

  const color = getNewColor(existingHues)
  existingHues.push(color.h)

  const tagKey = newTagValue.toLowerCase()
  if (!(tagKey in tags)) {
    const newTag = deepCopy(NEW_TAG)
    newTag.value = newTagValue
    newTag.props.color = color

    tags[tagKey] = newTag
  }
  tags[tagKey].count = tags[tagKey].count + 1
  data.data.tags = tags
  data.data.existingHues = existingHues
  return data
}

export const determineNewRanks: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined) { return data }

  const { tags } = data.data
  const list: Array<{ value: string, count: number }> = []

  for (let t in tags) {
    const { value, count } = tags[t]
    list.push({ value, count })
  }

  const sorted: Tags = {}
  list.sort((a, b) => { return b.count - a.count })
  for (let i = 0; i < list.length; i++) {
    const tag = tags[list[i].value]
    if (tag.state === TagState.NewTag) {
      tag.rank = i + 1
    } else if (tag.rank !== i + 1) {
      tag.rank = i + 1
      tag.state = TagState.NewProps
    }

    sorted[tag.value] = tag
  }

  data.data.tags = sorted
  return data
}

const getTargetFont = (rank: number): number => {
  const fontSize = ENGINE_DATA.FontSizes[Math.min(rank, ENGINE_DATA.FontSizes.length) - 1]
  return fontSize
}

export const determineTargetFonts: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined) { return data }

  const { tags } = data.data

  for (let t in tags) {
    const tag = tags[t]
    const props: TransitionProps = {}
    props.fontSize = getTargetFont(tag.rank)

    const newProps = Object.assign({}, tag.targetProps, props)
    tag.targetProps = deepCopy(newProps)

    tags[t] = tag
  }

  data.data.tags = tags
  return data
}

const getOccupiedSpace = (textSize: Size, value: string, gridSize: number): Size => {
  const { width, height } = textSize
  const row = Math.ceil(height / gridSize)
  const col = Math.ceil(width / gridSize)
  const size = { width: col, height: row }
  return size
}

const getTargetLocation = (origin: Coordinates, allocation: AllocatedSpace<string>, tagSpace: Size, gridSize: number): Coordinates => {
  const locationUL: Coordinates = {
    x: (origin.x + allocation.location.x) * gridSize,
    y: (origin.y + allocation.location.y) * gridSize
  }

  const orientatedWidth = allocation.horizontal ? tagSpace.width : tagSpace.height
  const orientatedHeight = allocation.horizontal ? tagSpace.height : tagSpace.width
  const location: Coordinates = {
    x: locationUL.x + Math.floor(orientatedWidth * gridSize / 2),
    y: locationUL.y + Math.floor(orientatedHeight * gridSize / 2)
  }

  return location
}

const getTargetRotation = (origin: Coordinates, allocation: AllocatedSpace<string>, width: number, height: number): number => {
  if (allocation.horizontal) { return 0 }

  const centerX = width / 2
  if (origin.x + allocation.location.x < centerX) { return -90 }

  return 90
}

const getOffset = (width: number, height: number, itemSize: Size): Coordinates => {
  const gridCenterY = Math.floor(height / 2)
  const gridCenterX = Math.floor(width / 2)
  const spaceCenterY = Math.floor(itemSize.height / 2)
  const spaceCenterX = Math.floor(itemSize.width / 2)
  const offset = {
    y: gridCenterY - spaceCenterY,
    x: gridCenterX - spaceCenterX
  }

  return offset
}

export const determineSpaceAllocations: AnimatedCanvasTransformFunction<PageData> = (data) => {

  if (data.data === undefined) { return data }

  const { tags, spaceAllocation, gridSize, width, height, getTextSize } = data.data
  const origin = spaceAllocation.origin
  const newAllocations: TagAllocations = { origin, allocations: {} }

  let space: PackedSpace<string> | undefined = undefined

  // allocate space for tags
  for (let t in tags) {
    const tag = tags[t]

    const textSize = getTextSize(tag.value, tag.targetProps.fontSize!)
    const tagSpace = getOccupiedSpace(textSize, tag.value, gridSize)
    let allocation: AllocatedSpace<string> | undefined = undefined
    if (space === undefined) {
      const origin = getOffset(width, height, tagSpace)
      space = initialiseSpace(origin, tagSpace, tag.value)
      allocation = space!.allocations.length > 0 ? space!.allocations[0] : undefined
    } else {
      allocation = allocateSpace(space, tagSpace, tag.value)
    }

    if (allocation !== undefined) {
      newAllocations.allocations[t] = { tag, allocation }
      newAllocations.origin = deepCopy(space.origin)
    }
  }

  if (space === undefined) {
    data.data.spaceAllocation = { origin, allocations: {} }
    return data
  }

  // adjust tag locations based on new allocations
  for (let t in newAllocations.allocations) {
    const { tag, allocation } = newAllocations.allocations[t]

    const props: TransitionProps = {}
    props.location = getTargetLocation(space.origin, allocation, allocation.size, gridSize)
    props.rotation = getTargetRotation(space.origin, allocation, width, height)

    const newProps = Object.assign({}, tag.targetProps, props)
    tag.targetProps = deepCopy(newProps)

    if (spaceAllocation.allocations[t] !== undefined) {
      const { allocation: oldAllocation } = spaceAllocation.allocations[t]

      if (tag.state === TagState.Normal && areAllocatedSpaceEqual(oldAllocation, allocation) === false) {
        tag.state = TagState.NewProps
      } else if (tag.state === TagState.Normal && areCoordinatesEqual(origin, space.origin) === false) {
        tag.state = TagState.NewProps
      }
    }
  }

  data.data.spaceAllocation = newAllocations
  return data
}

export const fadeInNewTags: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined) { return data }

  const { tags } = data.data
  const { frame } = data.drawData

  for (let t in tags) {
    const tag = tags[t]

    if (tag.state !== TagState.NewTag) { continue }

    const id = `${TagState[tag.state]}-fadeIn`
    let transition = tag.transitions.find(t => t.id === id)
    if (transition !== undefined) { continue }

    const fadeInDuration = 60

    transition = {
      id: id,
      startFrame: frame,
      startProps: deepCopy(tag.props),
      targetProps: { opacity: 1 },
      duration: fadeInDuration,
      operation: fadeIn
    }

    tag.transitions.push(transition)
    tags[t] = tag
  }

  data.data.tags = tags
  return data
}

export const moveTagsWithNewProps: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined) { return data }

  const { tags } = data.data
  const { frame } = data.drawData

  for (let t in tags) {
    const tag = tags[t]

    if (tag.state !== TagState.NewProps) { continue }
    if (tag.targetProps === undefined) { continue }

    const id = `${TagState[tag.state]}-move`
    const moveDuration = 90

    let transition = tag.transitions.find(t => t.id === id)
    if (transition === undefined) {
      transition = {
        id: id,
        startFrame: frame,
        startProps: {},
        targetProps: {},
        duration: moveDuration,
        operation: move
      }

      tag.transitions.push(transition)
    }

    transition.startFrame = frame
    transition.startProps = deepCopy(tag.props)
    transition.targetProps = deepCopy(tag.targetProps)

    tags[t] = tag
  }

  data.data.tags = tags
  return data
}

export const resizeTagsWithNewProps: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined) { return data }

  const { tags } = data.data
  const { frame } = data.drawData

  for (let t in tags) {
    const tag = tags[t]

    if (tag.state !== TagState.NewProps) { continue }
    if (tag.targetProps === undefined) { continue }

    const id = `${TagState[tag.state]}-resize`
    const resizeDuration = 90

    let transition = tag.transitions.find(t => t.id === id)
    if (transition === undefined) {
      transition = {
        id: id,
        startFrame: frame,
        startProps: {},
        targetProps: {},
        duration: resizeDuration,
        operation: resizeFont
      }

      tag.transitions.push(transition)
    }

    transition.startFrame = frame
    transition.startProps = deepCopy(tag.props)
    transition.targetProps = deepCopy(tag.targetProps)

    tags[t] = tag
  }

  data.data.tags = tags
  return data
}

export const rotateTagsWithNewProps: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined) { return data }

  const { tags } = data.data
  const { frame } = data.drawData

  for (let t in tags) {
    const tag = tags[t]

    if (tag.state !== TagState.NewProps) { continue }
    if (tag.targetProps === undefined) { continue }

    const id = `${TagState[tag.state]}-rotate`
    const rotateDuration = 90

    let transition = tag.transitions.find(t => t.id === id)
    if (transition === undefined) {
      transition = {
        id: id,
        startFrame: frame,
        startProps: {},
        targetProps: {},
        duration: rotateDuration,
        operation: minRotate
      }

      tag.transitions.push(transition)
    }

    transition.startFrame = frame
    transition.startProps = deepCopy(tag.props)
    transition.targetProps = deepCopy(tag.targetProps)

    tags[t] = tag
  }

  data.data.tags = tags
  return data
}

export const calculateProps: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined) { return data }

  const { tags } = data.data
  const { frame } = data.drawData

  for (let t in tags) {
    const tag = tags[t]

    let props: TransitionProps = {}
    for (let i = 0; i < tag.transitions.length; i++) {
      const transition = tag.transitions[i]
      const result = runTransition(transition, frame)
      props = Object.assign(props, result)
    }

    const newProps = Object.assign({}, tag.props, tag.targetProps, props)
    tag.props = deepCopy(newProps)
    tags[t] = tag
  }

  data.data.tags = tags
  return data
}

export const renderTagsLayer: AnimatedCanvasRenderFunction<PageData> = (context, data) => {
  if (data.data === undefined) { return }

  const { tags } = data.data

  context.textBaseline = "middle"
  context.textAlign = "center"

  for (let t in tags) {
    context.save()

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

export const finaliseCompletedTransitions: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined) { return data }

  const { frame } = data.drawData
  const { tags } = data.data

  for (let t in tags) {
    const tag = tags[t]

    const active: Array<Transition> = []
    for (let i = 0; i < tag.transitions.length; i++) {
      const transition = tag.transitions[i]
      const completeFrame = transition.startFrame + transition.duration
      if (completeFrame > frame) {
        active.push(transition)
      }
    }

    tag.transitions = active

    tags[t] = tag
  }

  data.data.tags = tags
  return data
}

export const normaliseState: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined) { return data }

  const { tags } = data.data

  for (let t in tags) {
    const tag = tags[t]
    if (tag.state === TagState.Normal) { continue }

    tag.state = TagState.Normal
    tags[t] = tag
  }

  data.data.tags = tags
  return data
}

export const clearTargetProps: AnimatedCanvasTransformFunction<PageData> = (data) => {
  if (data.data === undefined) { return data }

  const { tags } = data.data

  for (let t in tags) {
    const tag = tags[t]
    tag.targetProps = {}
    tags[t] = tag
  }

  data.data.tags = tags
  return data
}