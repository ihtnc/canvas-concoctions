import {
  type ConditionalRenderObject,
  type ConditionalFilterObject,
  type RenderFunction,
  type RenderFilterFunction,
  renderPipeline,
  getTextSize
} from "@/utilities/drawing-operations"
import {
  type ResourcesObject,
  type GameObject,
  type RenderPipelineData,
  type GameOperationData,
  type GameStateObject,
  Command,
  State,
  Difficulty
} from "./types"
import * as Render from "./render"
import config from "./data"
import { operationPipeline, when } from "@/utilities/misc-operations"
import * as Operation from "./operations"
import { getLocalStorage, loadImage, setLocalStorage } from "@/utilities/client-operations"
import { type Coordinates } from "@/components/canvas/types"
import { renderWhen, filterWhen } from "@/utilities/drawing-operations"
import * as Condition from "./conditional-functions"

export const initialiseGame = (width: number, height: number): GameOperationData => {
  const hiScore = parseInt(getLocalStorage(config.localStorage.highScoreKey, "0"))

  const state: GameStateObject = {
    difficulty: Difficulty.Normal,
    hiScore: hiScore,
    score: 0,
    totalHits: 0,
    size: { width, height },
    currentCommand: undefined,
    state: State.Ready,
    frame: 0
  }

  const game = initialiseGameObjects(state)

  return {
    game,
    state
  }
}

export const resizeGame = (game: GameObject, state: GameStateObject, width: number, height: number): GameOperationData => {
  state.size = { width, height }

  const result = Operation.positionStaticObjects({ game, state })

  return result
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
    }
  }

  return initial
}

const initialiseGameObjects = (state: GameStateObject): GameObject => {
  const initial = getInitialObject()

  const data: GameOperationData = {
    game: initial,
    state
  }

  let result = operationPipeline([
    Operation.initialiseTank,
    Operation.initialiseTarget,
    Operation.positionStaticObjects
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
    rankImage: await loadImage(`${imageSource}/rank.svg`),
    restartImage: await loadImage(`${imageSource}/restart-circle.svg`)
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
      command = Condition.isGameOver({ game, state }) ? Command.Restart : Command.Fire
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
  const { location: restart } = game.controls.restart

  const { sizeMultiplier: powerUpSizeMultiplier } = config.controls.powerUp
  const { sizeMultiplier: powerDownSizeMultiplier } = config.controls.powerDown
  const { sizeMultiplier: angleUpSizeMultiplier } = config.controls.angleUp
  const { sizeMultiplier: angleDownSizeMultiplier } = config.controls.angleDown
  const { sizeMultiplier: fireSizeMultiplier } = config.controls.fire
  const { sizeMultiplier: gunBarrelFireSizeMultiplier } = config.controls.gunBarrelFire
  const { sizeMultiplier: restartSizeMultiplier } = config.controls.restart
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
  } else if (x >= restart.x && x <= restart.x + width * restartSizeMultiplier &&
    y >= restart.y && y <= restart.y + height * restartSizeMultiplier) {
    command = Command.Restart
  }

  return command
}

export const updateGameObjects = (frame: number, game: GameObject, state: GameStateObject): GameOperationData => {
  const data: GameOperationData = {
    game,
    state
  }

  data.state.frame = frame

  let result = operationPipeline([
    when<GameOperationData>(Condition.isAimCommand, Operation.executeAimCommand),
    when<GameOperationData>([
      Condition.isFireCommand,
      Condition.hasBullets,
      Condition.isBulletInactive
    ], [
      Operation.initialiseBulletPosition,
      Operation.initialiseBulletVelocity,
      Operation.fireBullet
    ]),
    Operation.positionGunBarrel,
    Operation.positionGunBarrelFireControl,
    when<GameOperationData>(Condition.isBulletActive, [
      Operation.updateBulletPosition,
      Operation.updateBulletVelocity
    ]),
    when<GameOperationData>([
      Condition.difficultyAllowsMovingTarget,
      Condition.isTargetNotHit,
      Condition.isTargetMoving
    ], [
      Operation.updateTargetPosition,
      Operation.randomiseTargetDirection
    ]),
  ]).run(data)

  return result
}

export const updateGameState = (game: GameObject, state: GameStateObject): GameOperationData => {
  const data: GameOperationData = {
    game,
    state
  }

  const previousHighScore = data.state.hiScore

  let result = operationPipeline([
    when<GameOperationData>(Condition.isBulletActive, Operation.checkObjectCollision),
    when<GameOperationData>(Condition.isTargetHit, Operation.initialiseExplosion),
    when<GameOperationData>([
      Condition.isGameReady,
      Condition.isBulletActive
    ], Operation.checkResult),
    when<GameOperationData>([
      Condition.isGameTurnComplete,
      Condition.isTargetHit
    ], [
      Operation.calculateScore,
      Operation.refundBullet,
      Operation.adjustDifficulty
    ]),
    when<GameOperationData>([
      Condition.isGameOver,
      Condition.isRestartCommand
    ], [
      Operation.dismissGameOver,
      Operation.resetState,
      Operation.resetTank
    ]),
    when<GameOperationData>([
      Condition.isGameTurnComplete,
      (data) => Condition.difficultyAllowsRepositioningTarget(data) || Condition.isTargetHit(data),
    ], Operation.positionTarget),
    when<GameOperationData>(Condition.isGameTurnComplete, [
      Operation.initialiseTarget,
      Operation.resetBullet,
      Operation.startNewTurn
    ]),
    when<GameOperationData>([
      Condition.isGameOver,
      Condition.isRestartCommand
    ], [
      Operation.positionTarget,
      Operation.initialiseTarget,
      Operation.resetBullet,
      Operation.startNewTurn
    ]),
    when<GameOperationData>([
      Condition.isGameOver,
      Condition.isGameOverScreenInactive
    ], [
      Operation.initialiseGameOver,
      Operation.updateHighScore,
    ]),
    when<GameOperationData>([
      Condition.isExplosionActive,
      Condition.isExplosionAnimationComplete
    ], Operation.resetExplosion),
    when<GameOperationData>([
      Condition.isMessageActive,
      Condition.isMessageAnimationComplete
    ], Operation.dismissMessage)
  ]).run(data)

  if (previousHighScore < result.state.hiScore) {
    setLocalStorage(config.localStorage.highScoreKey, result.state.hiScore.toString())
  }

  return result
}

type RenderGameFunction = (context: CanvasRenderingContext2D, frame: number, game: GameObject, state: GameStateObject, resources: ResourcesObject, pre?: Array<RenderFunction | ConditionalRenderObject>, post?: Array<RenderFunction | ConditionalRenderObject>) => void;
export const renderGame: RenderGameFunction = (context, frame, game, state, resources, pre, post) => {
  const data: RenderPipelineData = {
    frame,
    game,
    state,
    config,
    resources
  }

  const background: Array<RenderFunction | ConditionalRenderObject> = (pre ?? []).concat([

  ])
  const main: Array<RenderFunction | ConditionalRenderObject> = [
    renderWhen<RenderPipelineData>(Condition.isTankImageLoaded, Render.renderTank),
    renderWhen<RenderPipelineData>(Condition.isGunBarrelImageLoaded, Render.renderGunBarrel),
    renderWhen<RenderPipelineData>([
      Condition.isTargetImageLoaded,
      Condition.isTargetNotHit
    ], Render.renderTarget),
    renderWhen<RenderPipelineData>(Condition.isGunBarrelImageLoaded, Render.renderTrajectory),
    renderWhen<RenderPipelineData>([
      Condition.isBulletImageLoaded,
      Condition.isBulletActive
    ], Render.renderBullet),
    renderWhen<RenderPipelineData>([
      Condition.isExplosionImageLoaded,
      Condition.isExplosionActive
    ], Render.renderExplosion)
  ]
  const foreground: Array<RenderFunction | ConditionalRenderObject> = (post ?? []).concat([
    Render.renderGameStats,
    renderWhen<RenderPipelineData>(Condition.isArrowImageLoaded, Render.renderPowerDownControl),
    renderWhen<RenderPipelineData>(Condition.isArrowImageLoaded, Render.renderPowerUpControl),
    renderWhen<RenderPipelineData>(Condition.isArrowImageLoaded, Render.renderAngleDownControl),
    renderWhen<RenderPipelineData>(Condition.isArrowImageLoaded, Render.renderAngleUpControl),
    renderWhen<RenderPipelineData>(Condition.isShootImageLoaded, Render.renderFireControl),
    renderWhen<RenderPipelineData>(Condition.isShootImageLoaded, Render.renderGunBarrelFireControl),
    renderWhen<RenderPipelineData>([
      Condition.isMessageActive,
      Condition.isMessageAnimationInProgress
    ], Render.renderMessage),
    renderWhen<RenderPipelineData>(Condition.isGameOverScreenActive, Render.renderGameOver),
    renderWhen<RenderPipelineData>([
      Condition.isRestartImageLoaded,
      Condition.isGameOverScreenActive
    ], Render.renderRestartControl)
  ])

  const list: Array<RenderFunction | ConditionalRenderObject> = []
  const pipeline = list.concat(
    background,
    main,
    foreground
  )

  const filters: Array<RenderFilterFunction | ConditionalFilterObject> = [
    filterWhen<RenderPipelineData>(Condition.isGameOverScreenActive, Render.gameOverFilter)
  ]

  renderPipeline(pipeline).run(context, data, filters)
}

type PrepareGameOverObjectsFunction = (context: CanvasRenderingContext2D, game: GameObject, state: GameStateObject) => GameOperationData;
export const updateGameOverObjects: PrepareGameOverObjectsFunction = (context, game, state) => {
  if (Condition.isGameOver({ game, state }) === false) { return { game, state } }

  const { message: messageObj, score: scoreObj, highScore: highScoreObj } = game.gameOver
  const { restart } = game.controls
  const { score, size: gameSize } = state
  const {
    padding,
    message: messageConfig,
    score: scoreConfig,
    highScore: highScoreConfig
  } = config.gameOver
  const { restart: restartConfig, size } = config.controls

  context.save()

  context.font = messageConfig.font
  const text = "GAME OVER"
  const textSize = getTextSize(context, text)
  messageObj.text = text
  messageObj.size = textSize
  messageObj.location = {
    x: gameSize.width / 2 - textSize.width / 2,
    y: gameSize.height / 2 - textSize.height
  }

  context.font = scoreConfig.font
  const scoreText = `Score: ${score}`
  const scoreSize = getTextSize(context, scoreText)
  scoreObj.text = scoreText
  scoreObj.size = textSize
  scoreObj.location = {
    x: gameSize.width / 2 - scoreSize.width / 2,
    y: gameSize.height / 2
  }

  context.font = highScoreConfig.font
  const highScoreText = `New High Score!`
  const highScoreSize = getTextSize(context, highScoreText)
  highScoreObj.text = highScoreText
  highScoreObj.size = highScoreSize
  highScoreObj.location = {
    x: gameSize.width / 2 - highScoreSize.width / 2,
    y: gameSize.height / 2 - padding * 3 - textSize.height - highScoreSize.height
  }

  context.restore()

  restart.location = {
    x: gameSize.width / 2 - size.width * restartConfig.sizeMultiplier / 2,
    y: gameSize.height / 2 +  scoreObj.size.height + padding
  }

  return { game, state }
}