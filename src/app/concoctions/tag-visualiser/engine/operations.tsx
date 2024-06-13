import { deepCopy } from "@/utilities/misc-operations"
import {
  type TransitionProps,
  type Transition,
  fadeIn,
  move,
  resizeFont,
  runTransition,
  minRotate
} from "@/utilities/transition-operations"
import {
  type TagOperationFunction,
  type TagValue,
  type TagOperationData,
  TagState
} from "./types"

const getNewProps = (tag:TagValue): TransitionProps => {
  const fontSizes = [100, 80, 60, 50, 40, 30, 25, 20, 15, 10]
  const rotations = [0, -90, 90]
  const locations = [{ x:900, y:350 }, { x:450, y:350 }, { x:1350, y:350 }]

  const props: TransitionProps = {}
  props.location = locations[(tag.rank - 1) % locations.length]
  props.fontSize = fontSizes[Math.min(tag.rank, fontSizes.length) - 1]
  props.rotation = rotations[(tag.rank - 1) % rotations.length]

  const newProps = Object.assign({}, tag.props, tag.targetProps, props)
  return deepCopy(newProps)
}

export const setNewPositions: TagOperationFunction = (data: TagOperationData) => {
  const { tag } = data
  if (tag.state === TagState.Normal) { return data }

  const newProps = getNewProps(tag)
  tag.targetProps = newProps

  return data
}

export const fadeInNewTags: TagOperationFunction = (data: TagOperationData) => {
  const { frame, tag } = data
  if (tag.state !== TagState.NewTag) { return data }

  const id = `${TagState[tag.state]}-fadeIn`
  let transition = tag.transitions.find(t => t.id === id)
  if (transition !== undefined) { return data }

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
  return data
}

export const moveNewRanks: TagOperationFunction = (data: TagOperationData) => {
  const { frame, tag } = data
  if (tag.state !== TagState.NewRank) { return data }
  if (tag.targetProps === undefined) { return data }

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

  return data
}

export const resizeNewRanks: TagOperationFunction = (data: TagOperationData) => {
  const { frame, tag } = data
  if (tag.state !== TagState.NewRank) { return data }
  if (tag.targetProps === undefined) { return data }

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

  return data
}

export const rotateNewRanks: TagOperationFunction = (data: TagOperationData) => {
  const { frame, tag } = data
  if (tag.state !== TagState.NewRank) { return data }
  if (tag.targetProps === undefined) { return data }

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

  return data
}

export const calculateProps: TagOperationFunction = (data: TagOperationData) => {
  const { frame, tag } = data

  let props: TransitionProps = {}
  for (let i = 0; i < tag.transitions.length; i++) {
    const transition = tag.transitions[i]
    const result = runTransition(transition, frame)
    props = Object.assign(props, result)
  }

  const newProps = Object.assign({}, tag.props, tag.targetProps, props)
  tag.props = deepCopy(newProps)
  return data
}

export const finaliseCompletedTransitions: TagOperationFunction = (data: TagOperationData) => {
  const { frame, tag } = data

  const active: Array<Transition> = []
  for (let i = 0; i < tag.transitions.length; i++) {
    const transition = tag.transitions[i]
    const completeFrame = transition.startFrame + transition.duration
    if (completeFrame > frame) {
      active.push(transition)
    }
  }

  tag.transitions = active
  return data
}

export const normaliseState: TagOperationFunction = (data: TagOperationData) => {
  if (data.tag.state === TagState.Normal) { return data }
  data.tag.state = TagState.Normal
  return data
}

export const clearTargetProps: TagOperationFunction = (data: TagOperationData) => {
  data.tag.targetProps = {}
  return data
}
