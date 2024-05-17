import { renderPipeline, type RenderFunction } from "@/utilities/drawing-operations"
import {
  type ResourcesObject,
  type GameObject,
  type RenderPipelineData,
  type GameOperationData,
  type GameStateObject,
  type GameOperationFunction,
  Command
} from "./types"
import {
  renderAngleDownControl,
  renderAngleUpControl,
  renderBullet,
  renderFireControl,
  renderGameStats,
  renderGunBarrel,
  renderGunBarrelFireControl,
  renderPowerDownControl,
  renderPowerUpControl,
  renderTank,
  renderTarget,
  renderTrajectory,
} from "./render"
import config from "./data"
import { operationPipeline } from "@/utilities/misc-operations"
import {
  fireBullet,
  initialiseTank,
  initialiseTarget,
  positionAngleDownControl,
  positionAngleUpControl,
  positionBullet,
  positionFireControl,
  positionGunBarrel,
  positionGunBarrelFireControl,
  positionPowerDownControl,
  positionPowerUpControl,
  positionTank,
  positionTarget,
  setBulletVelocity
} from "./operations"
import { loadImage } from "@/utilities/client-operations"
import { type Coordinates } from "@/components/canvas/types"

export const initialiseGame = (width: number, height: number): GameStateObject => {
  const state: GameStateObject = {
    difficulty: 0,
    score: 0,
    totalHits: 0,
    size: { width, height },
    currentCommand: undefined,
    bulletFired: false,
    bulletStopped: false
  }

  return state
}

export const resizeGame = (state: GameStateObject, width: number, height: number): GameStateObject => {
  state.size = { width, height }
  return state
}

const getInitialObject = (): GameObject => {
  const initial: GameObject = {
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
      isHit: false
    },
    bullet: {
      location: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 }
    },
    delayCounter: {
      active: false,
      lifetime: 0
    },
    controls: {
      angleDown: { location: { x: 0, y: 0 } },
      angleUp: { location: { x: 0, y: 0 } },
      powerDown: { location: { x: 0, y: 0 } },
      powerUp: { location: { x: 0, y: 0 } },
      fire: { location: { x: 0, y: 0 } },
      gunBarrelFire: { location: { x: 0, y: 0 } }
    }
  }

  return initial
}

export const initialiseGameObjects = (state: GameStateObject): GameObject => {
  const initial = getInitialObject()

  const data: GameOperationData = {
    game: initial,
    state
  }

  let result = operationPipeline([
    initialiseTank,
    initialiseTarget,
    setBulletVelocity
  ]).run(data)

  result.game = positionGameObjects(result.game, state)

  return result.game
}

export const positionGameObjects = (game: GameObject, state: GameStateObject): GameObject => {
  const data: GameOperationData = {
    game,
    state
  }

  const result = operationPipeline([
    positionTank,
    positionGunBarrel,
    positionTarget,
    positionBullet,
    positionPowerDownControl,
    positionPowerUpControl,
    positionAngleDownControl,
    positionAngleUpControl,
    positionFireControl,
    positionGunBarrelFireControl
  ]).run(data)

  return result.game
}

export const loadResources = async (imageSource: string): Promise<ResourcesObject> => {
  return {
    tankImage: await loadImage(`${imageSource}/tank-no-barrel.svg`),
    gunBarrelImage: await loadImage(`${imageSource}/tank-barrel.svg`),
    targetImage: await loadImage(`${imageSource}/target.svg`),
    bulletImage: await loadImage(`${imageSource}/bullet.svg`),
    arrowImage: await loadImage(`${imageSource}/arrow.svg`),
    shootImage: await loadImage(`${imageSource}/shoot.svg`),
    explosionImage: await loadImage(`${imageSource}/explosion.svg`),
    rankImage: await loadImage(`${imageSource}/rank.svg`)
  }
}

export const getCommandFromKeyCode = (code: string, game: GameObject, state: GameStateObject): Command | undefined => {
  let command: Command | undefined = undefined

  switch (code) {
    case "ArrowLeft":
      command = Command.PowerDown
      break
    case "ArrowRight":
      command = Command.PowerUp
      break
    case "ArrowUp":
      command = Command.AngleUp
      break
    case "ArrowDown":
      command = Command.AngleDown
      break
    case "Space":
    case "Enter":
      command = Command.Fire
      break
  }

  return command
}

export const getCommandFromCoordinate = (location: Coordinates, game: GameObject, state: GameStateObject): Command | undefined => {
  const { x, y } = location
  const { location: powerUp } = game.controls.powerUp
  const { location: powerDown } = game.controls.powerDown
  const { location: angleUp } = game.controls.angleUp
  const { location: angleDown } = game.controls.angleDown
  const { location: fire } = game.controls.fire
  const { location: gunBarrelFire } = game.controls.gunBarrelFire

  const { sizeMultiplier: powerUpSizeMultiplier } = config.controls.powerUp
  const { sizeMultiplier: powerDownSizeMultiplier } = config.controls.powerDown
  const { sizeMultiplier: angleUpSizeMultiplier } = config.controls.angleUp
  const { sizeMultiplier: angleDownSizeMultiplier } = config.controls.angleDown
  const { sizeMultiplier: fireSizeMultiplier } = config.controls.fire
  const { sizeMultiplier: gunBarrelFireSizeMultiplier } = config.controls.gunBarrelFire
  const { width, height } = config.controls.size

  let command: Command | undefined = undefined
  if (x >= powerUp.x && x <= powerUp.x + width * powerUpSizeMultiplier &&
    y >= powerUp.y && y <= powerUp.y + height * powerUpSizeMultiplier) {
    command = Command.PowerUp
  } else if (x >= powerDown.x && x <= powerDown.x + width * powerDownSizeMultiplier &&
    y >= powerDown.y && y <= powerDown.y + height * powerDownSizeMultiplier) {
    command = Command.PowerDown
  } else if (x >= angleUp.x && x <= angleUp.x + width * angleUpSizeMultiplier &&
    y >= angleUp.y && y <= angleUp.y + height * angleUpSizeMultiplier) {
    command = Command.AngleUp
  } else if (x >= angleDown.x && x <= angleDown.x + width * angleDownSizeMultiplier &&
    y >= angleDown.y && y <= angleDown.y + height * angleDownSizeMultiplier) {
    command =  Command.AngleDown
  } else if (x >= fire.x && x <= fire.x + width * fireSizeMultiplier &&
    y >= fire.y && y <= fire.y + height * fireSizeMultiplier) {
    command = Command.Fire
  } else if (x >= gunBarrelFire.x && x <= gunBarrelFire.x + width * gunBarrelFireSizeMultiplier &&
    y >= gunBarrelFire.y && y <= gunBarrelFire.y + height * gunBarrelFireSizeMultiplier) {
    command = Command.Fire
  }

  return command
}

export const executeCommand = (game: GameObject, state: GameStateObject, command?: Command): GameOperationData => {
  const { tank } = game
  const pipeline: Array<GameOperationFunction> = []

  switch (command) {
    case Command.PowerDown:
      tank.power = Math.max(tank.power - 1, config.environment.minPower)
      pipeline.push(setBulletVelocity)
      break

    case Command.PowerUp:
      tank.power = Math.min(tank.power + 1, config.environment.maxPower)
      pipeline.push(setBulletVelocity)
      break

    case Command.AngleDown:
      tank.angle = Math.max(tank.angle - 1, config.environment.minAngle)
      pipeline.push(positionBullet)
      pipeline.push(positionGunBarrelFireControl)
      pipeline.push(setBulletVelocity)
      break

    case Command.AngleUp:
      tank.angle = Math.min(tank.angle + 1, config.environment.maxAngle)
      pipeline.push(positionBullet)
      pipeline.push(positionGunBarrelFireControl)
      pipeline.push(setBulletVelocity)
      break

    case Command.Fire:
      pipeline.push(fireBullet)
      break
  }

  const result = operationPipeline(pipeline).run({ game, state })
  return result
}

type RenderGameFunction = (context: CanvasRenderingContext2D, frame: number, game: GameObject, state: GameStateObject, resources: ResourcesObject, pre?: Array<RenderFunction>, post?: Array<RenderFunction>) => void;
export const renderGame: RenderGameFunction = (context, frame, game, state, resources, pre, post) => {
  const data: RenderPipelineData = {
    frame,
    game,
    state,
    config,
    resources
  }

  const background: Array<RenderFunction> = (pre ?? []).concat([

  ])
  const main: Array<RenderFunction> = [
    renderTank,
    renderGunBarrel,
    renderTarget,
    renderTrajectory,
    renderBullet
  ]
  const foreground: Array<RenderFunction> = (post ?? []).concat([
    renderGameStats,
    renderPowerDownControl,
    renderPowerUpControl,
    renderAngleDownControl,
    renderAngleUpControl,
    renderFireControl,
    renderGunBarrelFireControl
  ])

  const list: Array<RenderFunction> = []
  const pipeline = list.concat(
    background,
    main,
    foreground
  )

  renderPipeline(pipeline).run(context, data)
}