import {
  type ResourcesObject,
  type GameOperationData
} from "./types"
import * as Render from "./render"
import * as Operation from "./operations"
import { loadImage } from "@/utilities/client-operations"
import * as Condition from "./conditional-functions"
import {
  type AnimatedCanvasConditionalFilterObject,
  type AnimatedCanvasConditionalRenderObject,
  type AnimatedCanvasConditionalTransformObject,
  type AnimatedCanvasRenderFilterFunction,
  type AnimatedCanvasRenderFunction,
  type AnimatedCanvasTransformFunction,
  filterWhen,
  not,
  renderWhen,
  when
} from "@ihtnc/use-animated-canvas"

export const loadResources = async (imageSource: string): Promise<ResourcesObject> => {
  type Resources = {
    tankImage?: HTMLImageElement,
    gunBarrelImage?: HTMLImageElement,
    targetImage?: HTMLImageElement,
    bulletImage?: HTMLImageElement,
    arrowImage?: HTMLImageElement,
    shootImage?: HTMLImageElement,
    explosionImage?: HTMLImageElement,
    rankImage?: HTMLImageElement,
    restartImage?: HTMLImageElement
  }

  const resources: Resources = {}

  const tankTask = loadImage(`${imageSource}/tank-no-barrel.svg`).then((res) => resources.tankImage = res)
  const gunBarrelTask = loadImage(`${imageSource}/tank-barrel.svg`).then((res) => resources.gunBarrelImage = res)
  const targetTask = loadImage(`${imageSource}/target.svg`).then((res) => resources.targetImage = res)
  const bulletTask = loadImage(`${imageSource}/bullet.svg`).then((res) => resources.bulletImage = res)
  const arrowTask = loadImage(`${imageSource}/arrow.svg`).then((res) => resources.arrowImage = res)
  const shootTask = loadImage(`${imageSource}/shoot.svg`).then((res) => resources.shootImage = res)
  const explosionTask = loadImage(`${imageSource}/explosion.svg`).then((res) => resources.explosionImage = res)
  const rankTask = loadImage(`${imageSource}/rank.svg`).then((res) => resources.rankImage = res)
  const restartTask = loadImage(`${imageSource}/restart-circle.svg`).then((res) => resources.restartImage = res)

  await Promise.all([tankTask, gunBarrelTask, targetTask, bulletTask, arrowTask, shootTask, explosionTask, rankTask, restartTask])

  return resources as ResourcesObject
}

export const updateGameObjects = (): Array<AnimatedCanvasTransformFunction<GameOperationData> | AnimatedCanvasConditionalTransformObject<GameOperationData>> => {
  return [
    when(Condition.isAimCommand, Operation.executeAimCommand),
    when([
      Condition.isFireCommand,
      Condition.hasBullets,
      not(Condition.isBulletActive)
    ], [
      Operation.initialiseBulletPosition,
      Operation.initialiseBulletVelocity,
      Operation.fireBullet
    ]),
    Operation.positionGunBarrel,
    Operation.positionGunBarrelFireControl,
    when(Condition.isBulletActive, [
      Operation.updateBulletPosition,
      Operation.updateBulletVelocity
    ]),
    when([
      Condition.difficultyAllowsMovingTarget,
      not(Condition.isTargetHit),
      Condition.isTargetMoving
    ], [
      Operation.updateTargetPosition,
      Operation.randomiseTargetDirection
    ])
  ]
}

export const updateGameState = (): Array<AnimatedCanvasTransformFunction<GameOperationData> | AnimatedCanvasConditionalTransformObject<GameOperationData>> => {
  return [
    when(Condition.isBulletActive, Operation.checkObjectCollision),
    when(Condition.isTargetHit, Operation.initialiseExplosion),
    when([
      Condition.isGameReady,
      Condition.isBulletActive
    ], Operation.checkResult),
    when([
      Condition.isGameTurnComplete,
      Condition.isTargetHit
    ], [
      Operation.calculateScore,
      Operation.refundBullet,
      Operation.adjustDifficulty
    ]),
    when([
      Condition.isGameOver,
      Condition.isRestartCommand
    ], [
      Operation.dismissGameOver,
      Operation.resetState,
      Operation.resetTank
    ]),
    when([
      Condition.isGameTurnComplete,
      (data) => Condition.difficultyAllowsRepositioningTarget(data) || Condition.isTargetHit(data),
    ], Operation.positionTarget),
    when(Condition.isGameTurnComplete, [
      Operation.initialiseTarget,
      Operation.resetBullet,
      Operation.startNewTurn
    ]),
    when([
      Condition.isGameOver,
      Condition.isRestartCommand
    ], [
      Operation.positionTarget,
      Operation.initialiseTarget,
      Operation.resetBullet,
      Operation.startNewTurn
    ]),
    when([
      Condition.isGameOver,
      not(Condition.isGameOverScreenActive)
    ], [
      Operation.initialiseGameOver,
      Operation.updateHighScore,
    ]),
    when([
      Condition.isExplosionActive,
      Condition.isExplosionAnimationComplete
    ], Operation.resetExplosion),
    when([
      Condition.isMessageActive,
      Condition.isMessageAnimationComplete
    ], Operation.dismissMessage)
  ]
}

export const renderFilter = (): Array<AnimatedCanvasRenderFilterFunction | AnimatedCanvasConditionalFilterObject<GameOperationData>> => {
  return [
    filterWhen(Condition.isGameOverScreenActive, Render.gameOverFilter)
  ]
}

export const renderMain = (): Array<AnimatedCanvasRenderFunction<GameOperationData> | AnimatedCanvasConditionalRenderObject<GameOperationData>> => {
  return [
    renderWhen(Condition.isTankImageLoaded, Render.renderTank),
    renderWhen(Condition.isGunBarrelImageLoaded, Render.renderGunBarrel),
    renderWhen([
      Condition.isTargetImageLoaded,
      not(Condition.isTargetHit)
    ], Render.renderTarget),
    renderWhen(Condition.isGunBarrelImageLoaded, Render.renderTrajectory),
    renderWhen([
      Condition.isBulletImageLoaded,
      Condition.isBulletActive
    ], Render.renderBullet),
    renderWhen([
      Condition.isExplosionImageLoaded,
      Condition.isExplosionActive
    ], Render.renderExplosion)
  ]
}

export const renderForeground = (): Array<AnimatedCanvasRenderFunction<GameOperationData> | AnimatedCanvasConditionalRenderObject<GameOperationData>> => {
  return [
    ...Render.renderGameStats(),
    renderWhen(Condition.isArrowImageLoaded, Render.renderPowerDownControl),
    renderWhen(Condition.isArrowImageLoaded, Render.renderPowerUpControl),
    renderWhen(Condition.isArrowImageLoaded, Render.renderAngleDownControl),
    renderWhen(Condition.isArrowImageLoaded, Render.renderAngleUpControl),
    renderWhen(Condition.isShootImageLoaded, Render.renderFireControl),
    renderWhen(Condition.isShootImageLoaded, Render.renderGunBarrelFireControl),
    renderWhen([
      Condition.isMessageActive,
      not(Condition.isMessageAnimationComplete)
    ], Render.renderMessage),
    renderWhen(Condition.isGameOverScreenActive, Render.renderGameOver),
    renderWhen([
      Condition.isRestartImageLoaded,
      Condition.isGameOverScreenActive
    ], Render.renderRestartControl)
  ]
}
