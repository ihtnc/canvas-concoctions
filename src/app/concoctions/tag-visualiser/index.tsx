'use client'

import { type CanvasResizeHandler, type InitialiseDataHandler, use2dAnimatedCanvas, when } from "@ihtnc/use-animated-canvas"
import ControlPanel, { type OnInputHandler, type ControlItem, type OnKeyUpHandler } from "@/components/control-panel"
import { useRef } from "react"
import {
  addNewTag,
  shouldAddTag,
  hasNewTag,
  clearTargetProps,
  finaliseCompletedTransitions,
  normaliseState,
  renderTagsLayer,
  resetTags,
  shouldResetTags,
  determineNewRanks,
  determineTargetFonts,
  shouldResize,
  determineSpaceAllocations,
  fadeInNewTags,
  moveTagsWithNewProps,
  resizeTagsWithNewProps,
  rotateTagsWithNewProps,
  calculateProps
} from "./engine"
import { type GetTextSizeFunction, type PageData } from "./engine/types"
import {
  TrashIcon,
  TagIcon,
  PlusCircleIcon
} from "@/components/icons"
import { getTextSize } from "@/utilities/drawing-operations"

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
  const tagHistory = useRef<Array<string>>([])

  let tagInput = ''
  let add = false
  let addedInput = ''
  let reset = false
  let resize = false

  if (gridSize < DEFAULT_DATA.MinGridSize) { gridSize = DEFAULT_DATA.MinGridSize }
  else if (gridSize > DEFAULT_DATA.MaxGridSize) { gridSize = DEFAULT_DATA.MaxGridSize }

  const initialiseData: InitialiseDataHandler<PageData> = (canvas, initData) => {
    const context = canvas.getContext('2d')!
    const fn: GetTextSizeFunction = (text, fontSize) => {
      context.save()
      context.font = `${fontSize}px sans-serif`
      const size = getTextSize(context, text)
      context.restore()
      return size
    }

    return {
      tags: {},

      existingHues: [],
      spaceAllocation: {
        origin: { x: 0, y: 0 },
        allocations: {}
      },

      gridSize,
      height: Math.floor(canvas.height / gridSize),
      width: Math.floor(canvas.width / gridSize),

      newTagValue: '',
      addTag: false,
      resetTags: false,
      resize: false,

      getTextSize: fn
    }
  }

  const { Canvas } = use2dAnimatedCanvas<PageData>({
    initialiseData,
    preRenderTransform: [
      (data) => {
        if (data.data === undefined) { return data }

        data.data.addTag = add
        data.data.newTagValue = addedInput
        data.data.resetTags = reset
        data.data.resize = resize
        return data
      },
      when(shouldResetTags, [
        resetTags,
        (data) => {
          reset = false
          return data
        }
      ]),
      when(
        shouldResize,
        (data) => {
          resize = false

          if (data.data === undefined) { return data }

          const { gridSize } = data.data
          data.data.height = Math.floor(data.drawData.height / gridSize)
          data.data.width = Math.floor(data.drawData.width / gridSize)
          return data
        }
      ),
      when([
        hasNewTag,
        shouldAddTag
      ], [
        (data) => {
          add = false
          tagHistory.current.push(tagInput)
          addedInput = ''
          return data
        },
        addNewTag,
      ]),
      determineNewRanks,
      determineTargetFonts,
      determineSpaceAllocations,
      fadeInNewTags,
      moveTagsWithNewProps,
      resizeTagsWithNewProps,
      rotateTagsWithNewProps,
      calculateProps
    ],
    render: renderTagsLayer,
    postRenderTransform: [
      finaliseCompletedTransitions,
      normaliseState,
      clearTargetProps
    ]
  })

  const inputHandler: OnInputHandler = (value) => {
    tagInput = value
  }

  const keyUpHandler: OnKeyUpHandler = (value) => {
    if (value.key === 'Enter') { addHandler() }
  }

  const addHandler = () => {
    add = true
    addedInput = tagInput
    tagInput = ''
  }

  const resetConcoction = () => {
    reset = true
    tagHistory.current = []
  }

  const resizeHandler: CanvasResizeHandler = (width, height) => {
    resize = true
  }

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
    <Canvas className={className}
      onCanvasResize={resizeHandler}
    />
    <ControlPanel controls={controls} />
  </>
}

export default TagVisualiser