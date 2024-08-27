import { type GameOperationData, Command, Difficulty, State } from "./types"
import config from "./data"
import { type AnimatedCanvasConditionalFunction } from "@ihtnc/use-animated-canvas"

export const isClientResize: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return false }
  return data.data.client.resize
}
export const isClientClick: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return false }
  return data.data.client.click
}

export const isAimCommand: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return false }
  return data.data.state.currentCommand !== undefined
    && (data.data.state.currentCommand !== Command.Fire && data.data.state.currentCommand !== Command.Restart)
}
export const isRestartCommand: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return false }
  return data.data.state.currentCommand !== undefined && data.data.state.currentCommand === Command.Restart
}
export const isFireCommand: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return false }
  return data.data.state.currentCommand !== undefined && data.data.state.currentCommand === Command.Fire
}

export const hasBullets: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return false }
  return data.data.game.tank.bullets > 0
}
export const isBulletActive: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return false }
  return data.data.game.bullet.active
}

export const isTargetHit: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return false }
  return data.data.game.target.isHit
}
export const isTargetMoving: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return false }
  return data.data.game.target.currentDirection !== undefined
}

export const difficultyAllowsRepositioningTarget: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return false }
  return data.data.state.difficulty >= Difficulty.RepositionTarget
}
export const difficultyAllowsMovingTarget: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return false }
  return data.data.state.difficulty > Difficulty.RepositionTarget
}

export const isGameInitialising: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return false }
  return data.data.state.state === State.Initialise
}
export const isGameReady: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return false }
  return data.data.state.state === State.Ready
}
export const isGameTurnComplete: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return false }
  return data.data.state.state === State.TurnComplete
}
export const isGameOver: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return false }
  return data.data.state.state === State.GameOver
}

export const isGameOverScreenActive: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return false }
  return data.data.game.gameOver.active
}

export const isExplosionActive: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return false }
  return data.data.game.explosion.active
}
export const isExplosionAnimationComplete: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return false }
  return Math.max(data.drawData.frame - data.data.game.explosion.startFrame, 0) >= config.explosion.duration
}

export const isMessageActive: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return false }
  return data.data.game.message.active
}
export const isMessageAnimationComplete: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return false }
  return Math.max(data.drawData.frame - data.data.game.message.startFrame, 0) >= config.message.duration
}

export const isBulletImageLoaded: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined || data.data.resources === null) { return false }
  return data.data.resources.bulletImage.complete
}
export const isRankImageLoaded: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined || data.data.resources === null) { return false }
  return data.data.resources.rankImage.complete
}
export const isTankImageLoaded: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined || data.data.resources === null) { return false }
  return data.data.resources.tankImage.complete
}
export const isGunBarrelImageLoaded: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined || data.data.resources === null) { return false }
  return data.data.resources.gunBarrelImage.complete
}
export const isTargetImageLoaded: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined || data.data.resources === null) { return false }
  return data.data.resources.targetImage.complete
}
export const isArrowImageLoaded: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined || data.data.resources === null) { return false }
  return data.data.resources.arrowImage.complete
}
export const isShootImageLoaded: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined || data.data.resources === null) { return false }
  return data.data.resources.shootImage.complete
}
export const isExplosionImageLoaded: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined || data.data.resources === null) { return false }
  return data.data.resources.explosionImage.complete
}
export const isRestartImageLoaded: AnimatedCanvasConditionalFunction<GameOperationData> = (data) => {
  if (data.data === undefined || data.data.resources === null) { return false }
  return data.data.resources.restartImage.complete
}
