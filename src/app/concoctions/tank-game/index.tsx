'use client'

import { type Coordinates, type CanvasResizeHandler, type InitialiseDataHandler, use2dAnimatedCanvas, when } from "@ihtnc/use-animated-canvas"
import {
  loadResources,
  updateGameObjects,
  updateGameState,
  renderMain,
  renderForeground,
  renderFilter
} from "./engine"
import { type GameStateObject, type GameObject, type ResourcesObject, type GameOperationData, type GetTextSizeFunction, State, Difficulty } from "./engine/types"
import { type PointerEventHandler, useRef } from "react"
import { isClientResize, isGameInitialising, isGameOver } from "./engine/conditional-functions"
import {
  getCommandFromCoordinate,
  getCommandFromKeyCode,
  initialiseTank,
  initialiseTarget,
  positionStaticObjects,
  setInitialGameObject,
  setInitialGameStateObject,
  updateGameOverObjects
} from "./engine/operations"
import { getLocalStorage } from "@/utilities/client-operations"
import config from './engine/data'
import { getTextSize } from "@/utilities/drawing-operations"

type TankGameProps = {
  className?: string
};

const TankGame = ({ className }: TankGameProps) => {
  const resources = useRef<ResourcesObject | null>(null)
  let resize: boolean = false
  let input: string | undefined = undefined
  let pointerCoordinates: Coordinates | undefined = undefined

  const initialiseData: InitialiseDataHandler<GameOperationData> = (canvas, initData) => {
    const context = canvas.getContext('2d')!
    const fn: GetTextSizeFunction = (text, font) => {
      context.save()
      context.font = font
      const size = getTextSize(context, text)
      context.restore()
      return size
    }

    const { stats } = config
    const hiScoreLabel = "Hi Score: "
    const hiScoreSize = fn(hiScoreLabel, stats.font)
    const scoreLabel = "Score: "
    const scoreSize = fn(scoreLabel, stats.font)
    const longestMessage = Math.max(hiScoreSize.width, scoreSize.width)

    const hiScoreLocation: Coordinates = { x: longestMessage, y: 0 }
    const scoreLocation: Coordinates = { x: longestMessage, y: hiScoreSize.height + stats.padding }
    const { size: bulletSize } = config.bullet
    const bulletsLocation: Coordinates = { x: 0, y: hiScoreSize.height + scoreSize.height + stats.padding }
    const rankLocation: Coordinates = { x: 0, y: hiScoreSize.height + scoreSize.height + bulletSize.height + stats.padding }

    const game: GameObject = {
      tank: {
        location: { x: 0, y: 0 },
        angle: 0,
        power: 0,
        bullets: 0
      },
      gunBarrel: {
        location: { x: 0, y: 0 },
        rotation: { x: 0, y: 0 }
      },
      target: {
        location: { x: 0, y: 0 },
        origin: { x: 0, y: 0 },
        currentDirection: undefined,
        isHit: false,
        isReversing: false
      },
      bullet: {
        location: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        active: false,
        startFrame: 0
      },
      explosion: {
        location: { x: 0, y: 0 },
        active: false,
        startFrame: 0
      },
      message: {
        active: false,
        hit: false,
        startFrame: 0
      },
      gameOver: {
        active: false,
        startFrame: 0,
        message: {
          text: "",
          location: { x: 0, y: 0 },
          size: { width: 0, height: 0 }
        },
        score: {
          text: "",
          location: { x: 0, y: 0 },
          size: { width: 0, height: 0 }
        },
        highScore: {
          text: "",
          location: { x: 0, y: 0 },
          size: { width: 0, height: 0 }
        },
        newHighScore: false
      },
      controls: {
        angleDown: { location: { x: 0, y: 0 } },
        angleUp: { location: { x: 0, y: 0 } },
        powerDown: { location: { x: 0, y: 0 } },
        powerUp: { location: { x: 0, y: 0 } },
        fire: { location: { x: 0, y: 0 } },
        gunBarrelFire: { location: { x: 0, y: 0 } },
        restart: { location: { x: 0, y: 0 } }
      },
      stats: {
        hiScoreLabel,
        hiScoreLocation,
        scoreLabel,
        scoreLocation,
        bulletsLocation,
        rankLocation
      }
    }

    const hiScore = parseInt(getLocalStorage(config.localStorage.highScoreKey, "0"))

    const state: GameStateObject = {
      difficulty: Difficulty.Normal,
      hiScore: hiScore,
      score: 0,
      totalHits: 0,
      currentCommand: undefined,
      state: State.Initialise
    }

    loadResources("/resources/tank-game").then((res) => {
      resources.current = res
    })

    return {
      game,
      state,
      config,
      resources: resources.current,
      client: {
        resize: false,
        input: undefined,
        pointerCoordinates: undefined
      },
      getTextSize: fn
    }
  }

  const { Canvas } = use2dAnimatedCanvas<GameOperationData>({
    initialiseData,
    preRenderTransform: [
      (data) => {
        if (data.data === undefined) { return data }
        if (resources.current === null) { return data }

        data.data.resources = resources.current
        return data
      },
      (data) => {
        if (data.data === undefined) { return data }

        data.data.client.resize = resize
        data.data.client.input = input
        data.data.client.pointerCoordinates = pointerCoordinates

        return data
      },
      when(isClientResize, [
        (data) => {
          resize = false
          return data
        },
        ...positionStaticObjects()
      ]),
      when(isGameInitialising, [
        setInitialGameStateObject,
        setInitialGameObject,
        initialiseTank,
        initialiseTarget,
        ...positionStaticObjects()
      ]),
      getCommandFromKeyCode,
      getCommandFromCoordinate,
      when(isGameOver, updateGameOverObjects),
      ...updateGameObjects()
    ],
    renderFilter: renderFilter(),
    render: [
      ...renderMain(),
      ...renderForeground()
    ],
    postRenderTransform: updateGameState(),
    options: {
      protectData: false
    }
  })

  const cancelKeyCommand = (event: KeyboardEvent) => {
    input = undefined
    event.preventDefault()
  }

  const cancelPointerCommand = () => {
    pointerCoordinates = undefined
  }

  const keyCommand = (event: KeyboardEvent) => {
    input = event.code
    event.preventDefault()
  }

  const pointerCommand: PointerEventHandler<HTMLCanvasElement> = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    pointerCoordinates = { x, y }
  }

  const resizeHandler: CanvasResizeHandler = (width, height) => {
    resize = true
  }

  return <>
    <Canvas
      className={className}
      onKeyUp={cancelKeyCommand}
      onPointerUp={cancelPointerCommand}
      onPointerEnter={cancelPointerCommand}
      onPointerOut={cancelPointerCommand}
      onPointerMove={cancelPointerCommand}
      onKeyDown={keyCommand}
      onPointerDown={pointerCommand}
      onCanvasResize={resizeHandler}
    />
  </>
}

export default TankGame