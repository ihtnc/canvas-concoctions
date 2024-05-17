import { type HSL, type RenderFunction, runRenderPipeline } from "@/utilities/drawing-operations"
import { renderTagsLayer } from "./render"
import {
  type Tags,
  type RenderPipelineData,
  type TagValue,
  type TagOperationData,
  TagState
} from "./types"
import {
  fadeInNewTags,
  calculateProps,
  finaliseCompletedTransitions,
  setNewPositions,
  resizeNewRanks,
  moveNewRanks,
  normaliseState,
  clearTargetProps
} from "./operations"
import { deepCopy, operationPipeline } from "@/utilities/misc-operations"
import { chooseRandom } from "@/utilities/misc-operations"
import ENGINE_DATA from './data'

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
  let newHue = chooseRandom(0, 359)
  while (existingHues.findIndex(h => h === newHue) >= 0) {
    newHue = (newHue + 35) % 360
  }

  return { h: newHue, s: ENGINE_DATA.BaseColor.s, l: ENGINE_DATA.BaseColor.l }
}

export const addTag = (tags: Tags, tag: string, color: HSL): Tags => {
  if (!(tag in tags)) {
    const newTag = deepCopy(NEW_TAG)
    newTag.value = tag
    newTag.props.color = color

    tags[tag] = newTag
  }
  tags[tag].count = tags[tag].count + 1
  return tags
}

const determineNewRanks = (tags: Tags): Tags => {
  const list: Array<{ value: string, count: number }> = []
  for (let t in tags) {
    const { value, count } = tags[t]
    list.push({ value, count })
  }

  list.sort((a, b) => { return b.count - a.count })
  for (let i = 0; i < list.length; i++) {
    const tag = tags[list[i].value]
    if (tag.state === TagState.NewTag) {
      tag.rank = i + 1
    } else if (tag.rank !== i + 1) {
      tag.rank = i + 1
      tag.state = TagState.NewRank
    }
  }

  return tags
}

type ProcessTagsFunction = (frame: number, value: Tags) => Tags;
export const processTags: ProcessTagsFunction = (frame, value) => {
  const ranked = determineNewRanks(value)
  for (let t in ranked) {
    const tag = ranked[t]
    const data: TagOperationData = {
      frame, tag
    }

    const result = operationPipeline([
      setNewPositions,
      fadeInNewTags,
      moveNewRanks,
      resizeNewRanks,
      calculateProps
    ]).run(data)

    ranked[t] = result.tag
  }

  return ranked
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