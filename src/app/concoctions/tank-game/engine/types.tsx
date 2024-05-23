import { type Coordinates } from "@/components/canvas/types"
import { type Size, type RenderFunction, type RGB } from "@/utilities/drawing-operations"
import { type OperationFunction } from "@/utilities/misc-operations"

export type GameObject = {
  tank: TankObject,
  gunBarrel: GunBarrelObject,
  target: TargetObject,
  bullet: BulletObject,
  explosion: ExplosionObject,
  message: MessageObject,
  gameOver: GameOverObject,
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
  isReversing: boolean,
  isHit: boolean
}

export enum TargetDirection {
  Left,
  Right,
  Up,
  Down
}

type BulletObject = {
  location: Coordinates,
  velocity: Coordinates,
  active: boolean,
  startFrame: number
}

type ExplosionObject = {
  location: Coordinates,
  active: boolean,
  startFrame: number
}

type MessageObject = {
  active: boolean,
  hit: boolean,
  startFrame: number
}

type GameOverTextObject = {
  text: string,
  location: Coordinates,
  size: Size
}

type GameOverObject = {
  active: boolean,
  startFrame: number,
  message: GameOverTextObject,
  score: GameOverTextObject,
  highScore: GameOverTextObject,
  newHighScore: boolean
}

type ControlsObject = {
  powerUp: ControlObject,
  powerDown: ControlObject,
  angleUp: ControlObject,
  angleDown: ControlObject,
  gunBarrelFire: ControlObject
  fire: ControlObject,
  restart: ControlObject
}

type ControlObject = {
  location: Coordinates
}

export enum State {
  Ready,
  TurnComplete,
  GameOver
}

export enum Command {
  PowerUp,
  PowerDown,
  AngleUp,
  AngleDown,
  Fire,
  Restart
}

export enum Difficulty {
  Normal,
  RepositionTarget,
  MoveTargetTwoWay,
  MoveTargetFourWay,
  MoveTargetRandomly
}

export type GameStateObject = {
  frame: number,
  score: number,
  hiScore: number
  difficulty: number,
  totalHits: number,
  size: Size,
  currentCommand?: Command,
  state: State
}

export type GameConfig = {
  tank: Readonly<TankConfig>,
  gunBarrel: Readonly<GunBarrelConfig>,
  target: Readonly<TargetConfig>,
  bullet: Readonly<BulletConfig>,
  rank: Readonly<RankConfig>,
  trajectory: Readonly<TrajectoryConfig>,
  explosion: Readonly<ExplosionConfig>,
  environment: Readonly<EnvironmentConfig>,
  controls: Readonly<ControlsConfig>,
  stats: Readonly<StatsConfig>,
  message: Readonly<MessageConfig>,
  gameOver: Readonly<GameOverConfig>,
  localStorage: Readonly<LocalStorageConfig>
}

type TankConfig = {
  size: Readonly<Size>
}

type GunBarrelConfig = {
  offset: Readonly<Coordinates>,
  size: Readonly<Size>,
  angleMultiplier: Readonly<number>
}

type TargetConfig = {
  size: Readonly<Size>,
  movementRange: Readonly<number>,
  movementSpeedMultiplier: Readonly<number>
}

type BulletConfig = {
  offset: Readonly<Coordinates>,
  size: Readonly<Size>,
  animationSpeed: Readonly<number>,
  padding: Readonly<number>
}

type RankConfig = {
  offset: Readonly<Coordinates>,
  size: Readonly<Size>
}

type TrajectoryConfig = {
  lineWidthMultiplier: Readonly<number>,
  length: Readonly<number>,
  lineDash: ReadonlyArray<number>
}

type ExplosionConfig = {
  size: Readonly<Size>,
  duration: Readonly<number>
}

type EnvironmentConfig = {
  gravity: Readonly<number>,
  airResistance: Readonly<number>,
  airResistanceModifier: Readonly<number>,
  powerMultiplier: Readonly<number>,
  maxAngle: Readonly<number>,
  minAngle: Readonly<number>,
  maxPower: Readonly<number>,
  minPower: Readonly<number>,
  hitsPerDifficulty: Readonly<number>
}

type ControlsConfig = {
  size: Readonly<Size>,
  padding: Readonly<number>,
  activeOpacity: Readonly<number>,
  inactiveOpacity: Readonly<number>,
  powerUp: Readonly<ControlConfig>,
  powerDown: Readonly<ControlConfig>,
  angleUp: Readonly<ControlConfig>,
  angleDown: Readonly<ControlConfig>,
  gunBarrelFire: Readonly<ControlConfig>,
  fire: Readonly<ControlConfig>,
  restart: Readonly<ControlConfig>
}

type ControlConfig = {
  offset: Readonly<Coordinates>,
  sizeMultiplier: Readonly<number>
}

type StatsConfig = {
  location: Readonly<Coordinates>,
  padding: Readonly<number>,
  color: Readonly<RGB>,
  font: Readonly<string>
}

type MessageTextConfig = {
  color: Readonly<RGB>,
  font: Readonly<string>
}

type MessageConfig = {
  duration: Readonly<number>,
  hit: Readonly<MessageTextConfig>,
  miss: Readonly<MessageTextConfig>
}

type GameOverConfig = {
  animationSpeed: Readonly<number>,
  padding: Readonly<number>,
  message: Readonly<MessageTextConfig>,
  score: Readonly<MessageTextConfig>,
  highScore: Readonly<MessageTextConfig>
}

type LocalStorageConfig = {
  highScoreKey: Readonly<string>
}

export type ResourcesObject = {
  tankImage: HTMLImageElement,
  gunBarrelImage: HTMLImageElement,
  targetImage: HTMLImageElement,
  bulletImage: HTMLImageElement,
  explosionImage: HTMLImageElement,
  arrowImage: HTMLImageElement,
  shootImage: HTMLImageElement,
  rankImage: HTMLImageElement,
  restartImage: HTMLImageElement
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
