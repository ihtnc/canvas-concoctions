'use client'

import {
  type DrawHandler,
  type InitRenderHandler,
  type OnResizeHandler,
  type PreDrawHandler,
  type PostDrawHandler,
} from "@/components/canvas/types"
import useAnimatedCanvas from "@/components/canvas/use-animated-canvas"
import {
  initialiseGame,
  resizeGame,
  loadResources,
  renderGame,
  getCommandFromKeyCode,
  getCommandFromCoordinate,
  updateGameObjects,
  updateGameState,
  updateGameOverObjects
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
    const { game: objectsResult, state: stateResult } = initialiseGame(canvas.offsetWidth, canvas.offsetHeight)
    state.current = stateResult
    objects.current = objectsResult
    loadResources("/resources/tank-game").then((res) => {
      resources.current = res
    })
  }

  const resizeFn: OnResizeHandler = (canvas, width, height) => {
    if (objects.current === null || state.current === null) { return }

    const { game: objectsResult, state: stateResult } = resizeGame(objects.current, state.current, width, height)

    state.current = stateResult
    objects.current = objectsResult
  }

  const predrawFn: PreDrawHandler = (canvas, data) => {
    if (objects.current === null || state.current === null) { return }

    const ctx = canvas.getContext('2d')
    if (ctx === null) { return }

    let objectsResult = objects.current
    let stateResult = state.current

    const withGameOverDetails = updateGameOverObjects(ctx, objectsResult, stateResult)
    objectsResult = withGameOverDetails.game
    stateResult = withGameOverDetails.state

    const result = updateGameObjects(data.frame, objectsResult, stateResult)
    objects.current = result.game
    state.current = result.state
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

  const postdrawFn: PostDrawHandler = (canvas, data) => {
    if (objects.current === null || state.current === null) { return }

    const { game: objectsResult, state: stateResult } = updateGameState(objects.current, state.current)
    objects.current = objectsResult
    state.current = stateResult
  }

  const cancelCommand = () => {
    if (state.current === null) { return }

    state.current.currentCommand = undefined
  }

  const keyCommand = (event: KeyboardEvent) => {
    if (objects.current === null || state.current === null) { return }

    const command = getCommandFromKeyCode(event.code, objects.current, state.current)
    state.current.currentCommand = command
  }

  const pointerCommand: PointerEventHandler<HTMLCanvasElement> = (event) => {
    if (objects.current === null || state.current === null) { return }

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const command = getCommandFromCoordinate({ x, y }, objects.current, state.current)
    state.current.currentCommand = command
  }

  const { Canvas } = useAnimatedCanvas({
    init: initFn,
    onResize: resizeFn,
    predraw: predrawFn,
    draw: drawFn,
    postdraw: postdrawFn
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

export default TankGame