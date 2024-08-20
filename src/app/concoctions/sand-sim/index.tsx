'use client'

import {
  type PointerEventHandler
} from "react"
import {
  type MatrixCoordinate
} from "@/utilities/matrix-operations"
import { hexToHSL } from "@/utilities/drawing-operations"
import { type CanvasResizeHandler, type InitialiseDataHandler, use2dAnimatedCanvas, when } from "@ihtnc/use-animated-canvas"
import {
  initialiseParticleMap,
  resetParticleMap,
  resizeParticleMap,
  canGenerateParticle,
  generateParticles,
  dropParticles,
  increaseParticleValue,
  renderParticleLayer,
  shouldResizeParticleMap,
  shouldResetParticleMap
} from "./engine"
import { TrashIcon } from "@/components/icons"
import ControlPanel, { type ControlItem } from "@/components/control-panel"
import { type PageData } from "./engine/types"

type SandboxProps = {
  className?: string,
  grainSize?: number,
  initialColor?: string,
  rotateColor?: boolean
};

type DefaultData = {
  MinGrainSize: number,
  MaxGrainSize: number,
  ColorIncrement: number,
  DefaultGrainSize: number,
  DefaultInitialColor: string,
  DefaultRotateColor: boolean
}
const DEFAULT_DATA: DefaultData = {
  MinGrainSize: 5,
  MaxGrainSize: 20,
  ColorIncrement: 30,
  DefaultGrainSize: 5,
  DefaultInitialColor: '#C2B180',
  DefaultRotateColor: true
}

const SandSim = ({
  className,
  grainSize = DEFAULT_DATA.DefaultGrainSize,
  initialColor = DEFAULT_DATA.DefaultInitialColor,
  rotateColor = DEFAULT_DATA.DefaultRotateColor
}: SandboxProps) => {
  let clicked: boolean = false
  let resized: boolean = false
  let reset: boolean = false
  const pointerCoordinate: MatrixCoordinate = { row: 0, col: 0 }

  if (grainSize < DEFAULT_DATA.MinGrainSize) { grainSize = DEFAULT_DATA.MinGrainSize }
  else if (grainSize > DEFAULT_DATA.MaxGrainSize) { grainSize = DEFAULT_DATA.MaxGrainSize }

  const initialHSL = hexToHSL(initialColor)
  const currentHSL = initialHSL === undefined
    ? hexToHSL(DEFAULT_DATA.DefaultInitialColor)!
    : initialHSL!

  const initialiseData: InitialiseDataHandler<PageData> = (canvas, initData) => {
    const row = Math.floor(canvas.height / grainSize)
    const col = Math.floor(canvas.width / grainSize)
    const map = initialiseParticleMap(row, col)
    return {
      resizeMap: false,
      map,
      resetMap: false,
      currentColor: currentHSL,
      canGenerateParticle: false,
      particleHeight: grainSize,
      particleWidth: grainSize
    }
  }

  const onResizeFn: CanvasResizeHandler = (width, height) => {
    resized = true
  }

  const startNewParticles: PointerEventHandler<HTMLCanvasElement> = (event) => {
    clicked = true

    updateNewParticleCoordinate(event)
  }

  const stopNewParticles: PointerEventHandler<HTMLCanvasElement> = (event) => {
    if (clicked) {
      updateNewParticleColor()
    }

    clicked = false
  }

  const updateNewParticleCoordinate: PointerEventHandler<HTMLCanvasElement> = (event) => {
    const canvas = event.currentTarget
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const col = Math.floor(x / grainSize)
    const row = Math.floor(y / grainSize)

    pointerCoordinate.row = row
    pointerCoordinate.col = col
  }

  const resetConcoction = () => {
    clicked = false
    reset = true
  }

  const updateNewParticleColor = () => {
    if (!rotateColor) { return }
    currentHSL.h = (currentHSL.h + DEFAULT_DATA.ColorIncrement) % 360
  }

  const { Canvas } = use2dAnimatedCanvas<PageData>({
    initialiseData,
    preRenderTransform: [
      (data) => {
        if (data.data === undefined) { return data }
        data.data.currentColor = currentHSL
        data.data.canGenerateParticle = clicked
        data.data.newParticleCoordinate = pointerCoordinate
        data.data.resizeMap = resized
        data.data.resetMap = reset
        return data
      },
      when(shouldResetParticleMap, resetParticleMap),
      when(shouldResizeParticleMap, resizeParticleMap),
      when(canGenerateParticle, generateParticles),
      dropParticles
    ],
    render: renderParticleLayer,
    postRenderTransform: increaseParticleValue,
    options: {
      protectData: false
    }
  })

  const controls: Array<ControlItem> = [{
    type: "button",
    onClickHandler: resetConcoction,
    content: (<TrashIcon />),
    title: "Reset canvas",
    className: "ml-auto"
  }]

  return <>
    <Canvas
      className={className}
      onPointerDown={startNewParticles}
      onPointerUp={stopNewParticles}
      onPointerOut={stopNewParticles}
      onPointerMove={updateNewParticleCoordinate}
      onCanvasResize={onResizeFn}
    />
    <ControlPanel controls={controls} />
  </>
}

export default SandSim