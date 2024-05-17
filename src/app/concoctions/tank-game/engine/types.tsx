import { type Coordinates } from "@/components/canvas/types"
import { type Size, type RenderFunction, type HSL } from "@/utilities/drawing-operations"
import { type OperationFunction } from "@/utilities/misc-operations"

export type GameObject = {
  tank: TankObject,
  gunBarrel: GunBarrelObject,
  target: TargetObject,
  bullet: BulletObject,
  delayCounter: DelayCounterObject,
  controls: ControlsObject
}

type TankObject = {
  location: Coordinates,
  angle: number,
  power: number,
  bullets: number
}

type GunBarrelObject = {
  location: Coordinates,
  rotation: Coordinates
}

type TargetObject = {
  location: Coordinates,
  origin: Coordinates,
  currentDirection?: TargetDirection,
  isHit: boolean
}

enum TargetDirection {
  Left,
  Right,
  Up,
  Down
}

type BulletObject = {
  location: Coordinates,
  velocity: Coordinates
}

type DelayCounterObject = {
  active: boolean,
  lifetime: number
}

type ControlsObject = {
  powerUp: ControlObject,
  powerDown: ControlObject,
  angleUp: ControlObject,
  angleDown: ControlObject,
  gunBarrelFire: ControlObject
  fire: ControlObject
}

type ControlObject = {
  location: Coordinates
}

export enum Command {
  PowerUp,
  PowerDown,
  AngleUp,
  AngleDown,
  Fire
}

export type GameStateObject = {
  score: number,
  difficulty: number,
  totalHits: number,
  size: Size,
  currentCommand?: Command,
  bulletFired: boolean,
  bulletStopped: boolean
}

export type GameConfig = {
  tank: TankConfig,
  gunBarrel: GunBarrelConfig,
  target: TargetConfig,
  bullet: BulletConfig,
  rank: RankConfig,
  trajectory: TrajectoryConfig,
  explosion: ExplosionConfig,
  environment: EnvironmentConfig,
  controls: ControlsConfig,
  stats: StatsConfig
}

type TankConfig = {
  size: Size
}

type GunBarrelConfig = {
  offset: Coordinates,
  size: Size,
  angleMultiplier: number
}

type TargetConfig = {
  size: Size,
  movementRange: number,
  movementSpeedMultiplier: number
}

type BulletConfig = {
  offset: Coordinates,
  size: Size,
  speed: number,
  padding: number
}

type RankConfig = {
  offset: Coordinates,
  size: Size
}

type TrajectoryConfig = {
  lineWidthMultiplier: number,
  length: number,
  lineDash: Array<number>
}

type ExplosionConfig = {
  size: Size
}

type EnvironmentConfig = {
  gravity: number,
  airResistance: number,
  airResistanceModifier: number,
  powerMultiplier: number,
  maxAngle: number,
  minAngle: number,
  maxPower: number,
  minPower: number,
  hitsPerDifficulty: number,
  fps: number
}

type ControlsConfig = {
  size: Size,
  padding: number,
  activeOpacity: number,
  inactiveOpacity: number,
  powerUp: ControlConfig,
  powerDown: ControlConfig,
  angleUp: ControlConfig,
  angleDown: ControlConfig,
  gunBarrelFire: ControlConfig,
  fire: ControlConfig
}

type ControlConfig = {
  offset: Coordinates,
  sizeMultiplier: number
}

type StatsConfig = {
  location: Coordinates,
  padding: number,
  color: HSL,
  font: string
}

export type ResourcesObject = {
  tankImage: HTMLImageElement,
  gunBarrelImage: HTMLImageElement,
  targetImage: HTMLImageElement,
  bulletImage: HTMLImageElement,
  explosionImage: HTMLImageElement,
  arrowImage: HTMLImageElement,
  shootImage: HTMLImageElement,
  rankImage: HTMLImageElement
}

export type GameOperationData = {
  game: GameObject,
  state: GameStateObject
}
export interface GameOperationFunction extends OperationFunction {
  (value: GameOperationData): GameOperationData
}

export type RenderPipelineData = {
  frame: number,
  game: GameObject,
  state: GameStateObject,
  config: GameConfig,
  resources: ResourcesObject
}

export interface TankGameRenderFunction extends RenderFunction {
  (context: CanvasRenderingContext2D, data: RenderPipelineData): void;
}
