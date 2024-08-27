import { type GameOperationData, type GameObject, type GameStateObject, Command, TargetDirection, Difficulty, State } from "./types"
import config from './data'
import { chooseOption, chooseRandom, degreesToRadians, getRotatedCoordinates, radiansToDegrees } from "@/utilities/misc-operations"
import { checkOverlap } from "@/utilities/collision-detection"
import { type Coordinates } from "@/components/canvas/types"
import { type AnimatedCanvasData, type AnimatedCanvasTransformFunction } from "@ihtnc/use-animated-canvas"
import { isGameOver } from "./conditional-functions"
import { getLocalStorage, setLocalStorage } from "@/utilities/client-operations"

const getDifficultyMultiplier = (data: GameOperationData): number => {
  const { difficulty } = data.state
  return Math.max(difficulty - 1, 1)
}

export const positionTank: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value, drawData } = data
  const { tank } = value.game
  const { size } = config.tank
  const game = { width: drawData.offsetWidth, height: drawData.offsetHeight }
  const { size: control, padding: controlPadding } = config.controls

  tank.location = {
    x: control.width + controlPadding,
    y: game.height - control.width - controlPadding - size.height
  }

  data.data.game.tank = tank
  return data
}

export const initialiseTank: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { tank } = value.game

  tank.angle = 20
  tank.power = 10
  tank.bullets = 5

  data.data.game.tank = tank
  return data
}

export const positionGunBarrel: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { tank, gunBarrel } = value.game
  const { size, offset } = config.gunBarrel
  const { size: tankSize } = config.tank

  gunBarrel.location = {
    x: tank.location.x + tankSize.width - size.width + offset.x,
    y: tank.location.y + tankSize.height / 2 - size.height / 2 + offset.y
  }

  gunBarrel.rotation = {
    x: gunBarrel.location.x,
    y: gunBarrel.location.y + size.height / 2
  }

  data.data.game.gunBarrel = gunBarrel
  return data
}

export const positionTarget: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value, drawData } = data
  const { target } = value.game
  const { size, movementRange } = config.target
  const game = { width: drawData.offsetWidth, height: drawData.offsetHeight }

  const targetStartX = game.width * 0.6 + movementRange
  const targetEndX = game.width - size.width / 2 - movementRange
  const targetStartY = size.width / 2 + movementRange - size.height / 2
  const targetEndY = game.height - size.height / 2 - movementRange

  target.location = {
    x: chooseRandom(targetStartX, targetEndX),
    y: chooseRandom(targetStartY, targetEndY)
  }

  target.origin = { ...target.location }

  data.data.game.target = target
  return data
}

export const initialiseTarget: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { difficulty } = value.state
  const { target } = value.game

  target.isHit = false
  target.currentDirection = undefined
  target.isReversing = false

  if (difficulty >= Difficulty.MoveTargetTwoWay) {
    target.currentDirection = chooseOption([
      TargetDirection.Up,
      TargetDirection.Down,
      TargetDirection.Left,
      TargetDirection.Right
    ])
  }

  data.data.game.target = target
  return data
}

export const setInitialGameObject: AnimatedCanvasTransformFunction<GameOperationData> = (data)  => {
  if (data.data === undefined) { return data }

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
    },
    stats: data.data.game.stats
  }

  data.data.game = initial
  return data
}

export const setInitialGameStateObject: AnimatedCanvasTransformFunction<GameOperationData> = (data)  => {
  if (data.data === undefined) { return data }

  const hiScore = parseInt(getLocalStorage(config.localStorage.highScoreKey, "0"))

  const state: GameStateObject = {
    difficulty: Difficulty.Normal,
    hiScore: hiScore,
    score: 0,
    totalHits: 0,
    currentCommand: undefined,
    state: State.Ready
  }

  data.data.state = state
  return data
}

export const getCommandFromKeyCode: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { client } = data.data
  let command: Command | undefined = undefined

  switch (client.input) {
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
      command = isGameOver(data) ? Command.Restart : Command.Fire
      break
  }

  data.data.state.currentCommand = command
  return data
}

export const getCommandFromCoordinate: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined || data.data.client.pointerCoordinates === undefined) { return data }

  const { game } = data.data
  const { x, y } = data.data.client.pointerCoordinates
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

  data.data.state.currentCommand = command
  return data
}

export const executeAimCommand: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  let result = value
  const { tank } = result.game
  const { currentCommand } = result.state

  switch (currentCommand) {
    case Command.PowerDown:
      tank.power = Math.max(tank.power - 0.25, config.environment.minPower)
      break

    case Command.PowerUp:
      tank.power = Math.min(tank.power + 0.25, config.environment.maxPower)
      break

    case Command.AngleDown:
      tank.angle = Math.max(tank.angle - 0.25, config.environment.minAngle)
      break

    case Command.AngleUp:
      tank.angle = Math.min(tank.angle + 0.25, config.environment.maxAngle)
      break
  }

  data.data.game.tank = tank
  return data
}

export const fireBullet: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { tank, bullet } = value.game
  const { frame } = data.drawData

  tank.bullets -= 1
  bullet.active = true
  bullet.startFrame = frame

  data.data.game.tank = tank
  data.data.game.bullet = bullet
  return data
}

export const initialiseBulletPosition: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { bullet, gunBarrel, tank } = value.game
  const { offset: offset, size } = config.bullet
  const { location: barrel, rotation: barrelRotation } = gunBarrel
  const {
    size: barrelSize,
    offset: barrelOffset,
    angleMultiplier: barrelAngleMultiplier
} = config.gunBarrel

  const startX = barrel.x + barrelSize.width + barrelOffset.x + size.width / 2 + offset.x
  const startY = barrel.y + barrelSize.height / 2 + offset.y
  const angle = tank.angle * barrelAngleMultiplier
  const rotated = getRotatedCoordinates(
    { x: startX, y: startY },
    { x: barrelRotation.x, y: barrelRotation.y },
    angle
  )

  bullet.location = {
    x: rotated.x,
    y: rotated.y
  }

  data.data.game.bullet = bullet
  return data
}

export const initialiseBulletVelocity: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { bullet, tank } = value.game
  const { maxPower, powerMultiplier } = config.environment
  const halfPower = maxPower / 2
  const adjustedPower = halfPower + (tank.power / maxPower) * halfPower
  const firePower = adjustedPower * powerMultiplier
  const radians = degreesToRadians(tank.angle)

  bullet.velocity = {
    x: firePower * Math.cos(radians),
    y: firePower * Math.sin(radians) * -1
  }

  data.data.game.bullet = bullet
  return data
}

export const initialiseExplosion: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { explosion, target } = value.game
  const { frame } = data.drawData

  explosion.active = true
  explosion.location = { x: target.location.x, y: target.location.y }
  explosion.startFrame = frame

  data.data.game.explosion = explosion
  return data
}

export const positionPowerDownControl: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { tank, controls } = value.game
  const { location: tankLocation } = tank
  const { size, padding, powerDown } = config.controls
  const { size: tankSize } = config.tank

  controls.powerDown.location = {
    x: tankLocation.x - size.width * powerDown.sizeMultiplier - padding + powerDown.offset.x,
    y: tankLocation.y + tankSize.height / 2 - size.height * powerDown.sizeMultiplier / 2 + powerDown.offset.y
  }

  data.data.game.controls = controls
  return data
}

export const positionPowerUpControl: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { tank, controls } = value.game
  const { location: tankLocation } = tank
  const { size, padding, powerUp } = config.controls
  const { size: tankSize } = config.tank

  controls.powerUp.location = {
    x: tankLocation.x + tankSize.width + padding + powerUp.offset.x,
    y: tankLocation.y + tankSize.height / 2 - size.height * powerUp.sizeMultiplier / 2 + powerUp.offset.y
  }

  data.data.game.controls = controls
  return data
}

export const positionAngleDownControl: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { tank, controls } = value.game
  const { location: tankLocation } = tank
  const { size, padding, angleDown } = config.controls
  const { size: tankSize } = config.tank

  controls.angleDown.location = {
    x: tankLocation.x + tankSize.width / 2 - size.width * angleDown.sizeMultiplier / 2 + angleDown.offset.x,
    y: tankLocation.y + tankSize.height + padding + angleDown.offset.y
  }

  data.data.game.controls = controls
  return data
}

export const positionAngleUpControl: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { tank, controls } = value.game
  const { location: tankLocation } = tank
  const { size, padding, angleUp } = config.controls
  const { size: tankSize } = config.tank

  controls.angleUp.location = {
    x: tankLocation.x + tankSize.width / 2 - size.width * angleUp.sizeMultiplier / 2 + angleUp.offset.x,
    y: tankLocation.y - size.height * angleUp.sizeMultiplier - padding + angleUp.offset.y
  }

  data.data.game.controls = controls
  return data
}

export const positionFireControl: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value, drawData } = data
  const { tank, controls } = value.game
  const { location: tankLocation } = tank
  const game = { width: drawData.offsetWidth, height: drawData.offsetHeight }
  const { size, padding, fire } = config.controls
  const { size: tankSize } = config.tank

  controls.fire.location = {
    x: game.width - size.width * fire.sizeMultiplier - size.width - padding + fire.offset.x,
    y: tankLocation.y + tankSize.height / 2 - size.height * fire.sizeMultiplier / 2 + fire.offset.y
  }

  data.data.game.controls = controls
  return data
}

export const positionGunBarrelFireControl: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { tank, gunBarrel, controls } = value.game
  const { gunBarrelFire } = controls
  const { location: barrel } = gunBarrel
  const { size, padding } = config.controls
  const { size: barrelSize, offset } = config.gunBarrel
  const { length } = config.trajectory

  const startX = barrel.x
  const startY = barrel.y + barrelSize.height / 2
  const trajectoryLength = length + padding
  const radians = degreesToRadians(tank.angle)
  const endX = startX + trajectoryLength * Math.cos(radians)
  const endY = startY - trajectoryLength * Math.sin(radians)

  gunBarrelFire.location = {
    x: endX - size.width / 2 + offset.x,
    y: endY - size.height / 2 + offset.y
  }

  data.data.game.controls.gunBarrelFire = gunBarrelFire
  return data
}

export const positionStaticObjects = (): Array<AnimatedCanvasTransformFunction<GameOperationData>> => {
  return [
    positionTank,
    positionTarget,
    positionPowerDownControl,
    positionPowerUpControl,
    positionAngleDownControl,
    positionAngleUpControl,
    positionFireControl
  ]
}

export const updateBulletPosition: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { bullet } = value.game
  const { location, velocity } = bullet
  const { animationSpeed } = config.bullet

  location.x += velocity.x / animationSpeed
  location.y += velocity.y / animationSpeed

  data.data.game.bullet.location = location
  return data
}

export const updateBulletVelocity: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { bullet } = value.game
  const { frame } = data.drawData
  const { bullet: bulletConfig, environment } = config

  const lifeTime = Math.max(frame - bullet.startFrame, 0)
  if (lifeTime % bulletConfig.animationSpeed === 0) {
    bullet.velocity.x *= (1 - environment.airResistance)
    bullet.velocity.y *= (1 - environment.airResistance)

    bullet.velocity.y += environment.gravity
  }

  data.data.game.bullet = bullet
  return data
}

export const updateTargetPosition: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { currentDirection, location } = value.game.target
  const { movementSpeedMultiplier } = config.target
  const difficultyMultiplier = getDifficultyMultiplier(value)

  switch (currentDirection) {
    case TargetDirection.Left:
      location.x -= difficultyMultiplier * movementSpeedMultiplier
      break

    case TargetDirection.Right:
      location.x += difficultyMultiplier * movementSpeedMultiplier
      break

    case TargetDirection.Up:
      location.y -= difficultyMultiplier * movementSpeedMultiplier
      break

    case TargetDirection.Down:
      location.y += difficultyMultiplier * movementSpeedMultiplier
      break
  }

  data.data.game.target.location = location
  return data
}

const getReversedDirection = (data: AnimatedCanvasData<GameOperationData>): TargetDirection | null => {
  if (data.data === undefined) { return null }

  const { data: value, drawData } = data
  const { difficulty } = value.state
  const game = { width: drawData.offsetWidth, height: drawData.offsetHeight }
  const { currentDirection, location, origin } = value.game.target
  const { size, movementRange } = config.target

  const aboveRange =  location.y <= origin.y - movementRange
  const belowRange = location.y >= origin.y + movementRange
  const leftRange = location.x <= origin.x - movementRange
  const rightRange = location.x >= origin.x + movementRange
  const aboveCanvas = location.y <= size.height / 2
  const belowCanvas = location.y >= game.height - size.height / 2
  const leftCanvas = location.x < size.width / 2
  const rightCanvas = location.x >= game.width - size.width / 2

  const changeOrientation = difficulty <= Difficulty.MoveTargetFourWay ? false : true
  let newDirection: TargetDirection | null = null
  switch (currentDirection) {
    case TargetDirection.Left:
      if (leftRange || leftCanvas) {
        newDirection = changeOrientation
          ? chooseOption([TargetDirection.Up, TargetDirection.Down])
          : TargetDirection.Right
      }
      break

    case TargetDirection.Right:
      if (rightRange || rightCanvas) {
        newDirection = changeOrientation
          ? chooseOption([TargetDirection.Up, TargetDirection.Down])
          : TargetDirection.Left
      }
      break

    case TargetDirection.Up:
      if (aboveRange || aboveCanvas) {
        newDirection = changeOrientation
          ? chooseOption([TargetDirection.Left, TargetDirection.Right])
          : TargetDirection.Down
      }
      break

    case TargetDirection.Down:
      if (belowRange || belowCanvas) {
        newDirection = changeOrientation
          ? chooseOption([TargetDirection.Left, TargetDirection.Right])
          : TargetDirection.Up
      }
      break
  }

 return newDirection
}

const getNewDirection = (value: GameOperationData): TargetDirection | null => {
  const { difficulty } = value.state
  const { isReversing, currentDirection, location, origin } = value.game.target

  const aboveOrigin = location.y < origin.y
  const belowOrigin = location.y > origin.y
  const leftOrigin = location.x < origin.x
  const rightOrigin = location.x > origin.x

  const changeOrientation = difficulty <= Difficulty.MoveTargetTwoWay ? false : true
  let newDirection: TargetDirection | null = null
  switch (currentDirection) {
    case TargetDirection.Left:
      if (leftOrigin && changeOrientation) {
        newDirection = isReversing
          ? chooseOption([TargetDirection.Up, TargetDirection.Down])
          : currentDirection
      }
      break

    case TargetDirection.Right:
      if (rightOrigin && changeOrientation) {
        newDirection = isReversing
          ? chooseOption([TargetDirection.Up, TargetDirection.Down])
          : currentDirection
      }
      break

    case TargetDirection.Up:
      if (isReversing && aboveOrigin && changeOrientation) {
        newDirection = isReversing
          ? chooseOption([TargetDirection.Left, TargetDirection.Right])
          : currentDirection
      }
      break

    case TargetDirection.Down:
      if (isReversing && belowOrigin && changeOrientation) {
        newDirection = isReversing
          ? chooseOption([TargetDirection.Left, TargetDirection.Right])
          : currentDirection
      }
      break
  }

 return newDirection
}

export const randomiseTargetDirection: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { difficulty } = value.state
  const { target } = value.game

  const reversedDirection = getReversedDirection(data)
  if (difficulty <= Difficulty.MoveTargetFourWay) {
    target.isReversing = reversedDirection !== null || target.isReversing
    target.currentDirection = reversedDirection ?? target.currentDirection

    const newDirection = getNewDirection(value)
    if (newDirection !== null) { target.isReversing = false }
    target.currentDirection = newDirection ?? target.currentDirection
  } else {
    target.currentDirection = reversedDirection ?? target.currentDirection
    target.isReversing = false
  }

  data.data.game.target = target
  return data
}

const getBulletShape = (value: GameOperationData): Array<Coordinates> => {
  const { size } = config.bullet
  const { location, velocity } = value.game.bullet

  const degree = radiansToDegrees(Math.atan2(velocity.y, velocity.x))
  var ul = getRotatedCoordinates({ x: location.x - size.width / 2, y: location.y - size.height / 2 }, location, degree)
  var ur = getRotatedCoordinates({ x: location.x + size.width / 2, y: location.y - size.height / 2 }, location, degree)
  var ll = getRotatedCoordinates({ x: location.x - size.width / 2, y: location.y + size.height / 2 }, location, degree)
  var lr = getRotatedCoordinates({ x: location.x + size.width / 2, y: location.y + size.height / 2 }, location, degree)

  return [ul, ur, lr, ll]
}

const getTargetShape = (value: GameOperationData): Array<Coordinates> => {
  const { size } = config.target
  const { location } = value.game.target

  const ul = { x: location.x - size.width / 2, y: location.y - size.height / 2 }
  const ur = { x: location.x + size.width / 2, y: location.y - size.height / 2 }
  const ll = { x: location.x - size.width / 2, y: location.y + size.height / 2 }
  const lr = { x: location.x + size.width / 2, y: location.y + size.height / 2 }

  return [ul, ur, lr, ll]
}

const getGameShape = (data: AnimatedCanvasData<GameOperationData>): Array<Coordinates> => {
  const { drawData } = data
  const size = { width: drawData.offsetWidth, height: drawData.offsetHeight }

  const ul = { x: 0, y: 0 }
  const ur = { x: size.width, y: 0 }
  const ll = { x: 0, y: size.height }
  const lr = { x: size.width, y: size.height }

  return [ul, ur, lr, ll]
}

export const checkObjectCollision: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { target } = value.game

  const bulletShape = getBulletShape(value)
  const targetShape = getTargetShape(value)
  const isHit = checkOverlap(bulletShape, targetShape)

  target.isHit = isHit

  data.data.game.target = target
  return data
}

const checkOutOfBoundsBullet = (data: AnimatedCanvasData<GameOperationData>): boolean => {
  if (data.data === undefined) { return false }

  const { drawData } = data
  const size = { width: drawData.offsetWidth, height: drawData.offsetHeight }
  const bulletShape = getBulletShape(data.data)
  const gameShape = getGameShape(data)

  const isWithinBounds = checkOverlap(bulletShape, gameShape)
  if (isWithinBounds) { return false }

  for (let i = 0; i < bulletShape.length; i++) {
    const point = bulletShape[i]
    const xWithinScreen = point.x >= 0 && point.x < size.width
    const yAboveScreen = point.y < 0

    if (xWithinScreen && yAboveScreen) {
      return false
    }
  }

  return true
}

export const checkResult: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value, drawData } = data
  const { game, state } = value
  const { tank, target } = game

  if (target.isHit) {
    game.message = {
      active: true,
      hit: true,
      startFrame: data.drawData.frame
    }

    state.state = State.TurnComplete

    data.data.game = game
    data.data.state = state
    return data
  }

  if (checkOutOfBoundsBullet(data)) {
    if (tank.bullets > 0) {
      game.message = {
        active: true,
        hit: false,
        startFrame: data.drawData.frame
      }
    }

    state.state = tank.bullets === 0 ? State.GameOver : State.TurnComplete
  }

  data.data.game = game
  data.data.state = state
  return data
}

export const adjustDifficulty: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { state } = value

  state.totalHits += 1

  if (state.totalHits % config.environment.hitsPerDifficulty === 0) {
    state.difficulty += 1
  }

  data.data.state = state
  return data
}

export const calculateScore: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { state } = value

  const baseScore = state.difficulty <= Difficulty.RepositionTarget ? 1 : 2
  const difficultyMultiplier = getDifficultyMultiplier(value)
  state.score += baseScore * difficultyMultiplier

  data.data.state = state
  return data
}

export const refundBullet: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { tank } = value.game

  tank.bullets += 1

  data.data.game.tank = tank
  return data
}

export const resetBullet: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { bullet } = value.game

  bullet.active = false

  data.data.game.bullet = bullet
  return data
}

export const resetExplosion: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { explosion } = value.game

  explosion.active = false

  data.data.game.explosion = explosion
  return data
}

export const startNewTurn: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { state } = value

  state.state = State.Ready

  data.data.state = state
  return data
}

export const dismissMessage: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { message } = value.game

  message.active = false
  message.hit = false
  message.startFrame = 0

  data.data.game.message = message
  return data
}

export const initialiseGameOver: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { gameOver } = value.game

  gameOver.active = true
  gameOver.startFrame = data.drawData.frame
  gameOver.newHighScore = value.state.score > value.state.hiScore

  data.data.game.gameOver = gameOver
  return data
}

export const resetTank: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { tank } = value.game

  tank.bullets = 5

  data.data.game.tank = tank
  return data
}

export const resetState: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { state } = value

  state.difficulty = Difficulty.Normal
  state.score = 0
  state.totalHits = 0

  data.data.state = state
  return data
}

export const dismissGameOver: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { gameOver } = value.game

  gameOver.active = false

  data.data.game.gameOver = gameOver
  return data
}

export const updateHighScore: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { data: value } = data
  const { state } = value

  const previousHighScore = state.hiScore

  state.hiScore = Math.max(state.score, state.hiScore)

  if (previousHighScore < state.hiScore) {
    setLocalStorage(config.localStorage.highScoreKey, state.hiScore.toString())
  }

  data.data.state = state
  return data
}

export const updateGameOverObjects: AnimatedCanvasTransformFunction<GameOperationData> = (data) => {
  if (data.data === undefined) { return data }

  const { drawData } = data
  const { game, state, getTextSize } = data.data
  const { message: messageObj, score: scoreObj, highScore: highScoreObj } = game.gameOver
  const { restart } = game.controls
  const { score } = state
  const gameSize = { width: drawData.offsetWidth, height: drawData.offsetHeight }
  const {
    padding,
    message: messageConfig,
    score: scoreConfig,
    highScore: highScoreConfig
  } = config.gameOver
  const { restart: restartConfig, size } = config.controls

  const text = "GAME OVER"
  const textSize = getTextSize(text, messageConfig.font)
  messageObj.text = text
  messageObj.size = textSize
  messageObj.location = {
    x: gameSize.width / 2 - textSize.width / 2,
    y: gameSize.height / 2 - textSize.height
  }

  const scoreText = `Score: ${score}`
  const scoreSize = getTextSize(scoreText, scoreConfig.font)
  scoreObj.text = scoreText
  scoreObj.size = textSize
  scoreObj.location = {
    x: gameSize.width / 2 - scoreSize.width / 2,
    y: gameSize.height / 2
  }

  const highScoreText = `New High Score!`
  const highScoreSize = getTextSize(highScoreText, highScoreConfig.font)
  highScoreObj.text = highScoreText
  highScoreObj.size = highScoreSize
  highScoreObj.location = {
    x: gameSize.width / 2 - highScoreSize.width / 2,
    y: gameSize.height / 2 - padding * 3 - textSize.height - highScoreSize.height
  }

  restart.location = {
    x: gameSize.width / 2 - size.width * restartConfig.sizeMultiplier / 2,
    y: gameSize.height / 2 +  scoreObj.size.height + padding
  }

  data.data.game.gameOver.message = messageObj
  data.data.game.gameOver.score = scoreObj
  data.data.game.gameOver.highScore = highScoreObj
  data.data.game.controls.restart = restart

  return data
}