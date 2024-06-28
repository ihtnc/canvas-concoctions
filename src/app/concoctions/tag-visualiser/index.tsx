'use client'

import { type PreDrawHandler, type DrawHandler, type PostDrawHandler, RenderLocation } from "@/components/canvas/types"
import useAnimatedCanvas from "@/components/canvas/use-animated-canvas"
import ControlPanel, { type OnInputHandler, type ControlItem } from "@/components/control-panel"
import { useRef } from "react"
import {
  addTag, cleanUpTags, getNewColor, processTags, renderTags
} from "./engine"
import { renderDebugLayer } from "./debug"
import { type Tags } from "./engine/types"
import {
  TrashIcon,
  TagIcon,
  PlusCircleIcon,
  PlayIcon,
  PauseIcon,
  ForwardIcon
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

  const existingHues: Array<number> = []
  let tagInput = ''

  if (gridSize < DEFAULT_DATA.MinGridSize) { gridSize = DEFAULT_DATA.MinGridSize }
  else if (gridSize > DEFAULT_DATA.MaxGridSize) { gridSize = DEFAULT_DATA.MaxGridSize }

  const preDrawFn: PreDrawHandler = (canvas, data) => {
    const current = tags.current
    const newTags = processTags(canvas, gridSize, data.frame, current)
    tags.current = newTags
  }

  const drawFn: DrawHandler = ({ context, frame }) => {
    renderTags(
      context,
      tags.current,
      frame,
      [],
      [renderDebugLayer]
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

  const addHandler = () => {
    if (tagInput.trim().length === 0) { return }
    const color = getNewColor(existingHues)
    tags.current = addTag(tags.current, tagInput, color)
    existingHues.push(color.h)
    tagInput = ''
  }

  const resetConcoction = () => {
    tags.current = {}
  }

  const { Canvas, debug } = useAnimatedCanvas({
    predraw: preDrawFn,
    draw: drawFn,
    postdraw: postDrawFn,
    options: { enableDebug: true },
    renderEnvironmentLayerRenderer: RenderLocation.BottomCenter,
    renderGridLayerRenderer: { size: gridSize, opacity: 0.5 },
  })

  const play = () => {
    debug.renderContinue()
  }

  const pause = () => {
    debug.renderBreak()
  }

  const step = () => {
    debug.renderStep()
  }

  const controls: Array<ControlItem> = [{
    type: "label",
    content: (<TagIcon />),
    for: "tag"
  }, {
    type: "text",
    onInputHandler: inputHandler,
    name: "tag",
    placeholder: "Enter tag",
    value: () => tagInput
  }, {
    type: "button",
    onClickHandler: addHandler,
    content: (<PlusCircleIcon />),
    title: "Add tag"
  }, {
    type: "button",
    onClickHandler: play,
    content: (<PlayIcon />),
    title: "Play"
  }, {
    type: "button",
    onClickHandler: pause,
    content: (<PauseIcon />),
    title: "Pause"
  }, {
    type: "button",
    onClickHandler: step,
    content: (<ForwardIcon />),
    title: "Play"
  }, {
    type: "button",
    onClickHandler: resetConcoction,
    content: (<TrashIcon />),
    title: "Reset canvas",
    className: "ml-auto"
  }]

  return <>
    <Canvas className={className} />
    <ControlPanel controls={controls} />
  </>
}

export default TagVisualiser