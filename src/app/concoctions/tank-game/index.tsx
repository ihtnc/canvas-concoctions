'use client'

import { type ConcoctionNavigation } from "@/app/concoctions/utilities"
import { type DrawHandler, type InitRenderHandler, type OnResizeHandler, type PreDrawHandler, RenderLocation } from "@/components/canvas/types"
import useAnimatedCanvas from "@/components/canvas/use-animated-canvas"
import {
  initialiseGame,
  resizeGame,
  initialiseGameObjects,
  positionGameObjects,
  loadResources,
  renderGame,
  getCommandFromKeyCode,
  getCommandFromCoordinate,
  executeCommand
} from "./engine"
import { type GameStateObject, type GameObject, type ResourcesObject } from "./engine/types"
import { type PointerEventHandler, useRef } from "react"

type TankGameProps = {
  className?: string
};

const TankGame = ({ className }: TankGameProps) => {
  const objects = useRef<GameObject | null>(null)
  const state = useRef<GameStateObject | null>(null)
  const resources = useRef<ResourcesObject | null>(null)

  const initFn: InitRenderHandler = (canvas, data) => {
    state.current = initialiseGame(canvas.offsetWidth, canvas.offsetHeight)
    objects.current = initialiseGameObjects(state.current)
    loadResources("/resources/tank-game").then((res) => {
      resources.current = res
    })
  }

  const resizeFn: OnResizeHandler = (canvas, width, height) => {
    if (state.current === null) { return }
    state.current = resizeGame(state.current, width, height)

    if (objects.current === null) { return }
    objects.current = positionGameObjects(objects.current, state.current)
  }

  const predrawFn: PreDrawHandler = (canvas, data) => {
    if (objects.current === null || state.current === null) { return }

    const { bulletFired, currentCommand } = state.current
    if (bulletFired === true || state.current.currentCommand === undefined) { return }

    const { game: objectsResult, state: stateResult } = executeCommand(objects.current, state.current, currentCommand)
    objects.current = objectsResult
    state.current = stateResult
  }

  const drawFn: DrawHandler = ({ context, frame }) => {
    if (objects.current === null || state.current === null || resources.current === null) { return }

    renderGame(
      context,
      frame,
      objects.current,
      state.current,
      resources.current,
      [],
      []
    )
  }

  const cancelCommand = () => {
    if (state.current === null) { return }

    state.current.currentCommand = undefined
  }

  const keyCommand = (event: KeyboardEvent) => {
    if (objects.current === null || state.current === null) { return }
    if (state.current.bulletFired) { return }

    const command = getCommandFromKeyCode(event.code, objects.current, state.current)
    state.current.currentCommand = command
  }

  const pointerCommand: PointerEventHandler<HTMLCanvasElement> = (event) => {
    if (objects.current === null || state.current === null) { return }
    if (state.current.bulletFired) { return }

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const command = getCommandFromCoordinate({ x, y }, objects.current, state.current)
    state.current.currentCommand = command
  }

  const { Canvas, debug } = useAnimatedCanvas({
    init: initFn,
    onResize: resizeFn,
    predraw: predrawFn,
    draw: drawFn,
    options: { enableDebug: true },
    renderEnvironmentLayerRenderer: RenderLocation.BottomCenter
  })

  return <>
    <Canvas
      className={className}
      onKeyUp={cancelCommand}
      onPointerUp={cancelCommand}
      onPointerOut={cancelCommand}
      onKeyDown={keyCommand}
      onPointerDown={pointerCommand}
    />
  </>
}

export const NavigationDetails: ConcoctionNavigation = {
  linkTitle: 'Tank Game',
  linkUrl: 'tank-game',
  title: 'Tank Game'
}

export default TankGame