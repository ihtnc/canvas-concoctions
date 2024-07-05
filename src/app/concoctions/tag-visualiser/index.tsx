'use client'

import { type PreDrawHandler, type DrawHandler, type PostDrawHandler } from "@/components/canvas/types"
import useAnimatedCanvas from "@/components/canvas/use-animated-canvas"
import ControlPanel, { type OnInputHandler, type ControlItem, type OnKeyUpHandler } from "@/components/control-panel"
import { useRef } from "react"
import { addTag, cleanUpTags, getNewColor, processTags, renderTags } from "./engine"
import { type Tags, type TagAllocations } from "./engine/types"
import {
  TrashIcon,
  TagIcon,
  PlusCircleIcon
} from "@/components/icons"

type TagVisualiserProps = {
  className?: string,
  gridSize?: number
}
type DefaultData = {
  MinGridSize: number,
  MaxGridSize: number,
  DefaultGridSize: number
}

const DEFAULT_DATA: DefaultData = {
  MinGridSize: 10,
  MaxGridSize: 100,
  DefaultGridSize: 50
}

const TagVisualiser = ({
  className,
  gridSize = DEFAULT_DATA.DefaultGridSize
}: TagVisualiserProps) => {
  const tags = useRef<Tags>({})
  const tagAllocations = useRef<TagAllocations>({ origin: { x: 0, y: 0 }, allocations: {} })
  const tagHistory = useRef<Array<string>>([])

  const existingHues: Array<number> = []
  let tagInput = ''

  if (gridSize < DEFAULT_DATA.MinGridSize) { gridSize = DEFAULT_DATA.MinGridSize }
  else if (gridSize > DEFAULT_DATA.MaxGridSize) { gridSize = DEFAULT_DATA.MaxGridSize }

  const preDrawFn: PreDrawHandler = (canvas, data) => {
    const currentTags = tags.current
    const currentAllocations = tagAllocations.current
    const { tags: newTags, tagAllocations: newTagAllocations } = processTags(canvas, gridSize, data.frame, currentTags, currentAllocations)
    tags.current = newTags
    tagAllocations.current = newTagAllocations
  }

  const drawFn: DrawHandler = ({ context, frame }) => {
    renderTags(
      context,
      tags.current,
      frame,
      [],
      []
    )
  }

  const postDrawFn: PostDrawHandler = (canvas, data) => {
    const current = tags.current
    const newTags = cleanUpTags(data.frame, current)
    tags.current = newTags
  }

  const inputHandler: OnInputHandler = (value) => {
    tagInput = value
  }

  const keyUpHandler: OnKeyUpHandler = (value) => {
    if (value.key === 'Enter') { addHandler() }
  }

  const addHandler = () => {
    if (tagInput.trim().length === 0) { return }
    const color = getNewColor(existingHues)
    tags.current = addTag(tags.current, tagInput, color)
    existingHues.push(color.h)
    tagHistory.current.push(tagInput)
    tagInput = ''
  }

  const resetConcoction = () => {
    tags.current = {}
    tagHistory.current = []
    tagAllocations.current = { origin: { x: 0, y: 0 }, allocations: {} }
  }

  const { Canvas } = useAnimatedCanvas({
    predraw: preDrawFn,
    draw: drawFn,
    postdraw: postDrawFn
  })

  const controls: Array<ControlItem> = [{
    type: "label",
    content: (<TagIcon />),
    for: "tag"
  }, {
    type: "text",
    onInputHandler: inputHandler,
    onKeyUpHandler: keyUpHandler,
    name: "tag",
    placeholder: "Enter tag",
    value: () => tagInput,
    autoFocus: true
  }, {
    type: "button",
    onClickHandler: addHandler,
    content: (<PlusCircleIcon />),
    title: "Add tag",
    controlToFocusOnClick: "tag"
  }, {
    type: "button",
    onClickHandler: resetConcoction,
    content: (<TrashIcon />),
    title: "Reset canvas",
    className: "ml-auto",
    controlToFocusOnClick: "tag"
  }]

  return <>
    <Canvas className={className} />
    <ControlPanel controls={controls} />
  </>
}

export default TagVisualiser