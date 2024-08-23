'use client'

import { type AnimatedCanvasConditionalFunction, type CanvasResizeHandler, type InitialiseDataHandler, not, use2dAnimatedCanvas, when } from "@ihtnc/use-animated-canvas"
import { type MatrixCoordinate } from "@/utilities/matrix-operations"
import { hexToHSL } from "@/utilities/drawing-operations"
import { type PointerEventHandler } from "react"
import {
  initialiseCellMap,
  resizeCellMap,
  resetCellMap,
  renderCellLayer,
  shouldResizeCellMap,
  shouldResetCellMap,
  getNextCellCycle,
  generateNewCells,
  isClicked,
  isInDormantPhase,
  isInCheckStatePhase,
  setTransitionState,
  isInEndPhase,
  setFinalState,
  resetCellCycle
} from "./engine"
import ControlPanel, { type ControlItem } from "@/components/control-panel"
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  TrashIcon
} from "@/components/icons"
import { type PageData, CycleState } from "./engine/types"

enum ButtonType {
  Start,
  Pause,
  Step
}

type GameOfLifeProps = {
  className?: string,
  cellSize?: number,
  autoStart?: boolean,
  aliveColor?: string,
  dyingColor?: string,
  growingColor?: string
}
type DefaultData = {
  MinCellSize: number,
  MaxCellSize: number,
  DefaultCellSize: number,
  DefaultAutoStart: boolean,
  DefaultAliveColor: string,
  DefaultDyingColor: string,
  DefaultGrowingColor: string
}

const DEFAULT_DATA: DefaultData = {
  MinCellSize: 10,
  MaxCellSize: 30,
  DefaultCellSize: 10,
  DefaultAutoStart: true,
  DefaultAliveColor: '#09AB00',
  DefaultDyingColor: '#C0C0C0',
  DefaultGrowingColor: '#0BD100',
}

const GameOfLife = ({
  className,
  cellSize=DEFAULT_DATA.DefaultCellSize,
  autoStart=DEFAULT_DATA.DefaultAutoStart,
  aliveColor=DEFAULT_DATA.DefaultAliveColor,
  dyingColor=DEFAULT_DATA.DefaultDyingColor,
  growingColor=DEFAULT_DATA.DefaultGrowingColor
}: GameOfLifeProps) => {
  let cycleState: CycleState = autoStart ? CycleState.Start : CycleState.Stop
  let lastButtonClicked: ButtonType = autoStart ? ButtonType.Start : ButtonType.Pause

  let clicked: boolean = false
  let resized: boolean = false
  let reset: boolean = false
  let pointerCoordinate: MatrixCoordinate | null = null

  if (cellSize < DEFAULT_DATA.MinCellSize) { cellSize = DEFAULT_DATA.MinCellSize }
  else if (cellSize > DEFAULT_DATA.MaxCellSize) { cellSize = DEFAULT_DATA.MaxCellSize }

  const aliveHSLProp = hexToHSL(aliveColor)
  const aliveHSL = aliveHSLProp === undefined
    ? hexToHSL(DEFAULT_DATA.DefaultAliveColor)!
    : aliveHSLProp!

  const dyingHSLProp = hexToHSL(dyingColor)
  const dyingHSL = dyingHSLProp === undefined
    ? hexToHSL(DEFAULT_DATA.DefaultDyingColor)!
    : dyingHSLProp!

  const growingHSLProp = hexToHSL(growingColor)
  const growingHSL = growingHSLProp === undefined
    ? hexToHSL(DEFAULT_DATA.DefaultGrowingColor)!
    : growingHSLProp!

  const initialiseData: InitialiseDataHandler<PageData> = (canvas, initData) => {
    const row = Math.floor(canvas.height / cellSize)
    const col = Math.floor(canvas.width / cellSize)
    const map = initialiseCellMap(row, col)

    return {
      map,

      cycleIndex: 0,

      cellWidth: cellSize,
      cellHeight: cellSize,
      aliveColor: aliveHSL,
      dyingColor: dyingHSL,
      growingColor: growingHSL,

      resizeMap: false,
      resetMap: false,
      pointerCoordinate: null,
      clicked
    }
  }

  const isClientStepMode: AnimatedCanvasConditionalFunction<PageData> = (data) => {
    return lastButtonClicked === ButtonType.Step
  }

  const isClientCycleActive: AnimatedCanvasConditionalFunction<PageData> = (data) => {
    return cycleState !== CycleState.Stop
  }

  const { Canvas } = use2dAnimatedCanvas({
    initialiseData,
    preRenderTransform: [
      (data) => {
        if (data.data === undefined) { return data }
        data.data.clicked = clicked
        data.data.pointerCoordinate = pointerCoordinate
        data.data.resizeMap = resized
        data.data.resetMap = reset
        return data
      },
      when(shouldResetCellMap, [
        resetCellMap,
        (data) => {
          reset = false
          return data
        }
      ]),
      when(shouldResizeCellMap, [
        resizeCellMap,
        (data) => {
          resized = false
          return data
        }
      ]),
      when([isClicked, isInDormantPhase], generateNewCells),
      when(isInCheckStatePhase, setTransitionState),
      when(isInEndPhase, setFinalState)
    ],
    render: renderCellLayer,
    postRenderTransform: [
      when([isClientStepMode, isInEndPhase], (data) => {
        cycleState = CycleState.Stop
        return data
      }),
      when(not(isClientCycleActive), resetCellCycle),
      when(isClientCycleActive, getNextCellCycle)
    ],
    options: {
      protectData: false
    }
  })

  const onResizeFn: CanvasResizeHandler = (width, height) => {
    resized = true
  }

  const startNewCells: PointerEventHandler<HTMLCanvasElement> = (event) => {
    clicked = true

    if (lastButtonClicked === ButtonType.Start) {
      cycleState = CycleState.Stop
    }
  }

  const stopNewCells: PointerEventHandler<HTMLCanvasElement> = (event) => {
    if (clicked && lastButtonClicked === ButtonType.Start) {
      cycleState = CycleState.Start
    }

    clicked = false
    pointerCoordinate = null
  }

  const updateNewCellCoordinate: PointerEventHandler<HTMLCanvasElement> = (event) => {
    const canvas = event.currentTarget
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const col = Math.floor(x / cellSize)
    const row = Math.floor(y / cellSize)

    pointerCoordinate = { row, col }
  }

  const startCycle = () => {
    lastButtonClicked = ButtonType.Start
    cycleState = CycleState.Start
  }

  const pauseCycle = () => {
    lastButtonClicked = ButtonType.Pause
    cycleState = CycleState.Stop
  }

  const stepCycle = () => {
    lastButtonClicked = ButtonType.Step
    cycleState = CycleState.Start
  }

  const resetConcoction = () => {
    reset = true
    pointerCoordinate = null
  }

  const hidePlayIcon = (): boolean => {
    return lastButtonClicked === ButtonType.Start
  }

  const hidePauseIcon = (): boolean => {
    const showNormal = lastButtonClicked === ButtonType.Start
    return !showNormal
  }

  const controls: Array<ControlItem> = [{
    type: "button",
    onClickHandler: startCycle,
    content: (<PlayIcon />),
    title: "Start cycle",
    hidden: hidePlayIcon
  }, {
    type: "button",
    onClickHandler: pauseCycle,
    content: (<PauseIcon />),
    title: "Pause cycle",
    hidden: hidePauseIcon
  }, {
    type: "button",
    onClickHandler: stepCycle,
    content: (<ForwardIcon />),
    title: "Forward 1 cycle"
  }, {
    type: "button",
    onClickHandler: resetConcoction,
    content: (<TrashIcon />),
    title: "Reset canvas",
    className: "ml-auto"
  }]

  return <>
    <Canvas
      className={className}
      onPointerDown={startNewCells}
      onPointerUp={stopNewCells}
      onPointerOut={stopNewCells}
      onPointerMove={updateNewCellCoordinate}
      onCanvasResize={onResizeFn}
    />
    <ControlPanel controls={controls} />
  </>
}

export default GameOfLife