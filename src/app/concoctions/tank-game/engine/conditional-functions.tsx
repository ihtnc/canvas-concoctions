import { type ConditionalFunction } from "@/utilities/misc-operations"
import { type GameOperationData, type RenderPipelineData, Command, Difficulty, State } from "./types"
import config from "./data"

export interface GameConditionalFunction extends ConditionalFunction {
  (data: GameOperationData): boolean
}

export const isAimCommand: GameConditionalFunction = (data: GameOperationData) => data.state.currentCommand !== undefined && (data.state.currentCommand !== Command.Fire && data.state.currentCommand !== Command.Restart)
export const isRestartCommand: GameConditionalFunction = (data: GameOperationData) => data.state.currentCommand !== undefined && data.state.currentCommand === Command.Restart
export const isFireCommand: GameConditionalFunction = (data: GameOperationData) => data.state.currentCommand !== undefined && data.state.currentCommand === Command.Fire

export const hasBullets: GameConditionalFunction = (data: GameOperationData) => data.game.tank.bullets > 0
export const isBulletActive: GameConditionalFunction = (data: GameOperationData) => data.game.bullet.active
export const isBulletInactive: GameConditionalFunction = (data: GameOperationData) => !isBulletActive(data)

export const isTargetHit: GameConditionalFunction = (data: GameOperationData) => data.game.target.isHit
export const isTargetNotHit: GameConditionalFunction = (data: GameOperationData) => !isTargetHit(data)
export const isTargetMoving: GameConditionalFunction = (data: GameOperationData) => data.game.target.currentDirection !== undefined

export const difficultyAllowsRepositioningTarget: GameConditionalFunction = (data: GameOperationData) => data.state.difficulty >= Difficulty.RepositionTarget
export const difficultyAllowsMovingTarget: GameConditionalFunction = (data: GameOperationData) => data.state.difficulty > Difficulty.RepositionTarget

export const isGameReady: GameConditionalFunction = (data: GameOperationData) => data.state.state === State.Ready
export const isGameTurnComplete: GameConditionalFunction = (data: GameOperationData) => data.state.state === State.TurnComplete
export const isGameOver: GameConditionalFunction = (data: GameOperationData) => data.state.state === State.GameOver

export const isGameOverScreenActive: GameConditionalFunction = (data: GameOperationData) => data.game.gameOver.active
export const isGameOverScreenInactive: GameConditionalFunction = (data: GameOperationData) => !isGameOverScreenActive(data)

export const isExplosionActive: GameConditionalFunction = (data: GameOperationData) => data.game.explosion.active
export const isExplosionAnimationComplete: GameConditionalFunction = (data: GameOperationData) => Math.max(data.state.frame - data.game.explosion.startFrame, 0) >= config.explosion.duration

export const isMessageActive: GameConditionalFunction = (data: GameOperationData) => data.game.message.active
export const isMessageAnimationComplete: GameConditionalFunction = (data: GameOperationData) => Math.max(data.state.frame - data.game.message.startFrame, 0) >= config.message.duration
export const isMessageAnimationInProgress: GameConditionalFunction = (data: GameOperationData) => !isMessageAnimationComplete(data)

export interface GameRenderConditionalFunction extends ConditionalFunction {
  (data: RenderPipelineData): boolean
}

export const isBulletImageLoaded: GameRenderConditionalFunction = (data: RenderPipelineData) => data.resources.bulletImage.complete
export const isRankImageLoaded: GameRenderConditionalFunction = (data: RenderPipelineData) => data.resources.rankImage.complete
export const isTankImageLoaded: GameRenderConditionalFunction = (data: RenderPipelineData) => data.resources.tankImage.complete
export const isGunBarrelImageLoaded: GameRenderConditionalFunction = (data: RenderPipelineData) => data.resources.gunBarrelImage.complete
export const isTargetImageLoaded: GameRenderConditionalFunction = (data: RenderPipelineData) => data.resources.targetImage.complete
export const isArrowImageLoaded: GameRenderConditionalFunction = (data: RenderPipelineData) => data.resources.arrowImage.complete
export const isShootImageLoaded: GameRenderConditionalFunction = (data: RenderPipelineData) => data.resources.shootImage.complete
export const isExplosionImageLoaded: GameRenderConditionalFunction = (data: RenderPipelineData) => data.resources.explosionImage.complete
export const isRestartImageLoaded: GameRenderConditionalFunction = (data: RenderPipelineData) => data.resources.restartImage.complete
