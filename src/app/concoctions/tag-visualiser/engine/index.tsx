import { type HSL, type RenderFunction, type Size, runRenderPipeline, getTextSize } from "@/utilities/drawing-operations"
import { renderTagsLayer } from "./render"
import {
  type Tags,
  type RenderPipelineData,
  type TagValue,
  type TagOperationData,
  type AllocatedSpace,
  type PackedSpace,
  type TagAllocations,
  TagState
} from "./types"
import {
  fadeInNewTag,
  calculateProps,
  finaliseCompletedTransitions,
  resizeTagWithNewProps,
  moveTagWithNewProps,
  rotateTagWithNewProps,
  normaliseState,
  clearTargetProps
} from "./operations"
import { initialiseSpace, allocateSpace, areAllocatedSpaceEqual } from "./space-allocation"
import { deepCopy, operationPipeline } from "@/utilities/misc-operations"
import { chooseRandom } from "@/utilities/misc-operations"
import ENGINE_DATA from './data'
import { type TransitionProps } from "@/utilities/transition-operations"
import { type Coordinates } from "@/components/canvas/types"
import { areCoordinatesEqual } from "@/components/canvas/utilities"

const NEW_TAG: TagValue = {
  value: '',
  rank: 0,
  count: 0,
  props: {},
  targetProps: {},
  state: TagState.NewTag,
  transitions: []
}

export const getNewColor = (existingHues: Array<number>): HSL => {
  const lastColor = existingHues.length > 0 ? existingHues[existingHues.length - 1] : chooseRandom(0, 359)
  let newHue = (lastColor + 35) % 360
  while (existingHues.findIndex(h => h === newHue) >= 0) {
    newHue = (newHue + 33) % 360
  }

  return { h: newHue, s: ENGINE_DATA.BaseColor.s, l: ENGINE_DATA.BaseColor.l }
}

export const addTag = (tags: Tags, tag: string, color: HSL): Tags => {
  const tagKey = tag.toLowerCase()
  if (!(tagKey in tags)) {
    const newTag = deepCopy(NEW_TAG)
    newTag.value = tag
    newTag.props.color = color

    tags[tagKey] = newTag
  }
  tags[tagKey].count = tags[tagKey].count + 1
  return tags
}

const determineNewRanks = (tags: Tags): Tags => {
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

  return sorted
}

const getGridSize = (canvas: HTMLCanvasElement, gridSize: number): Size => {
  const height = Math.floor(canvas.height / gridSize)
  const width = Math.floor(canvas.width / gridSize)

  return { width, height }
}

const getOccupiedSpace = (context: CanvasRenderingContext2D, fontSize: number, value: string, gridSize: number): Size => {
  context.save()
  context.font = `${fontSize}px sans-serif`
  const { width, height } = getTextSize(context, value)
  context.restore()

  const row = Math.ceil(height / gridSize)
  const col = Math.ceil(width / gridSize)
  const size = { width: col, height: row }
  return size
}

const getTargetFont = (rank: number): number => {
  const fontSize = ENGINE_DATA.FontSizes[Math.min(rank, ENGINE_DATA.FontSizes.length) - 1]
  return fontSize
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

type ProcessTagsFunction = (canvas: HTMLCanvasElement, gridSize: number, frame: number, value: Tags, tagAllocations: TagAllocations) => { tags: Tags, space?: PackedSpace<string>, tagAllocations: TagAllocations };
export const processTags: ProcessTagsFunction = (canvas, gridSize, frame, value, tagAllocations) => {
  const currentOrigin = tagAllocations.origin
  const context = canvas.getContext('2d')
  if (context === null) { return { tags: value, tagAllocations: { origin: currentOrigin, allocations: {} } } }

  const ranked = determineNewRanks(value)
  const { width, height } = getGridSize(canvas, gridSize)
  let space: PackedSpace<string> | undefined = undefined

  const tags: TagAllocations = { origin: currentOrigin, allocations: {} }

  for (let t in ranked) {
    const tag = ranked[t]

    const props: TransitionProps = {}
    props.fontSize = getTargetFont(tag.rank)

    const tagSpace = getOccupiedSpace(context, props.fontSize, tag.value, gridSize)
    let allocation: AllocatedSpace<string> | undefined = undefined
    if (space === undefined) {
      const origin = getOffset(width, height, tagSpace)
      space = initialiseSpace(origin, tagSpace, tag.value)
      allocation = space!.allocations.length > 0 ? space!.allocations[0] : undefined
    } else {
      allocation = allocateSpace(space, tagSpace, tag.value)
    }

    if (allocation !== undefined) {
      tags.allocations[t] = { tag, allocation }
      tags.origin = deepCopy(space.origin)
    }

    const newProps = Object.assign({}, tag.targetProps, props)
    tag.targetProps = deepCopy(newProps)
  }

  if (space === undefined) { return { tags: ranked, tagAllocations: { origin: currentOrigin, allocations: {} } } }

  for (let t in tags.allocations) {
    const { tag, allocation } = tags.allocations[t]
    const data: TagOperationData = {
      frame, tag
    }

    const props: TransitionProps = {}
    props.location = getTargetLocation(space.origin, allocation, allocation.size, gridSize)
    props.rotation = getTargetRotation(space.origin, allocation, width, height)

    const newProps = Object.assign({}, tag.targetProps, props)
    tag.targetProps = deepCopy(newProps)

    if (tagAllocations.allocations[t] !== undefined) {
      const { allocation: oldAllocation } = tagAllocations.allocations[t]

      if (tag.state === TagState.Normal && areAllocatedSpaceEqual(oldAllocation, allocation) === false) {
        tag.state = TagState.NewProps
      } else if (tag.state === TagState.Normal && areCoordinatesEqual(currentOrigin, space.origin) === false) {
        tag.state = TagState.NewProps
      }
    }

    const result = operationPipeline([
      fadeInNewTag,
      moveTagWithNewProps,
      resizeTagWithNewProps,
      rotateTagWithNewProps,
      calculateProps
    ]).run(data)

    ranked[t] = result.tag
  }

  return { tags: ranked, space, tagAllocations: tags }
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

type RenderTagsFunction = (context: CanvasRenderingContext2D, tags: Tags, frame: number, pre?: Array<RenderFunction>, post?: Array<RenderFunction>) => void;
export const renderTags: RenderTagsFunction = (context, tags, frame, pre, post) => {
  const data: RenderPipelineData = {
    tags,
    frame
  }

  runRenderPipeline(context, data, renderTagsLayer, pre, post)
}

type CleanUpTagsFunction = (frame: number, value: Tags) => Tags;
export const cleanUpTags: CleanUpTagsFunction = (frame, value) => {
  const tags = value
  for (let t in tags) {
    const tag = tags[t]
    const data: TagOperationData = {
      frame, tag
    }

    const result = operationPipeline([
      finaliseCompletedTransitions,
      normaliseState,
      clearTargetProps
    ]).run(data)

    tags[t] = result.tag
  }

  return tags
}