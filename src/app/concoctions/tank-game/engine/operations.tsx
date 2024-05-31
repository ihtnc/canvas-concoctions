import { type GameOperationData, type GameOperationFunction, Command, TargetDirection, Difficulty, State } from "./types"
import config from './data'
import { chooseOption, chooseRandom, degreesToRadians, getRotatedCoordinates, operationPipeline, radiansToDegrees } from "@/utilities/misc-operations"
import { checkOverlap } from "@/utilities/collision-detection"
import { type Coordinates } from "@/components/canvas/types"

const getDifficultyMultiplier = (data: GameOperationData): number => {
  const { difficulty } = data.state
  return Math.max(difficulty - 1, 1)
}

export const positionTank: GameOperationFunction = (value: GameOperationData) => {
  const { tank } = value.game
  const { size } = config.tank
  const { size: game } = value.state
  const { size: control, padding: controlPadding } = config.controls

  tank.location = {
    x: control.width + controlPadding,
    y: game.height - control.width - controlPadding - size.height
  }

  return value
}

export const initialiseTank: GameOperationFunction = (value: GameOperationData) => {
  const { tank } = value.game

  tank.angle = 20
  tank.power = 10
  tank.bullets = 5

  return value
}

export const positionGunBarrel: GameOperationFunction = (value: GameOperationData) => {
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

  return value
}

export const positionTarget: GameOperationFunction = (value: GameOperationData) => {
  const { target } = value.game
  const { size, movementRange } = config.target
  const { size: game } = value.state

  const targetStartX = game.width * 0.6 + movementRange
  const targetEndX = game.width - size.width / 2 - movementRange
  const targetStartY = size.width / 2 + movementRange - size.height / 2
  const targetEndY = game.height - size.height / 2 - movementRange

  target.location = {
    x: chooseRandom(targetStartX, targetEndX),
    y: chooseRandom(targetStartY, targetEndY)
  }

  target.origin = { ...target.location }

  return value
}

export const initialiseTarget: GameOperationFunction = (value: GameOperationData) => {
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

  return value
}

export const executeAimCommand: GameOperationFunction = (value: GameOperationData) => {
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

  return result
}

export const fireBullet: GameOperationFunction = (value: GameOperationData) => {
  const { tank, bullet } = value.game
  const { frame } = value.state

  tank.bullets -= 1
  bullet.active = true
  bullet.startFrame = frame

  return value
}

export const initialiseBulletPosition: GameOperationFunction = (value: GameOperationData) => {
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

  return value
}

export const initialiseBulletVelocity: GameOperationFunction = (value: GameOperationData) => {
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

  return value
}

export const initialiseExplosion: GameOperationFunction = (value: GameOperationData) => {
  const { explosion, target } = value.game
  const { frame } = value.state

  explosion.active = true
  explosion.location = { x: target.location.x, y: target.location.y }
  explosion.startFrame = frame

  return value
}

export const positionPowerDownControl: GameOperationFunction = (value: GameOperationData) => {
  const { tank, controls } = value.game
  const { location: tankLocation } = tank
  const { size, padding, powerDown } = config.controls
  const { size: tankSize } = config.tank

  controls.powerDown.location = {
    x: tankLocation.x - size.width * powerDown.sizeMultiplier - padding + powerDown.offset.x,
    y: tankLocation.y + tankSize.height / 2 - size.height * powerDown.sizeMultiplier / 2 + powerDown.offset.y
  }

  return value
}

export const positionPowerUpControl: GameOperationFunction = (value: GameOperationData) => {
  const { tank, controls } = value.game
  const { location: tankLocation } = tank
  const { size, padding, powerUp } = config.controls
  const { size: tankSize } = config.tank

  controls.powerUp.location = {
    x: tankLocation.x + tankSize.width + padding + powerUp.offset.x,
    y: tankLocation.y + tankSize.height / 2 - size.height * powerUp.sizeMultiplier / 2 + powerUp.offset.y
  }

  return value
}

export const positionAngleDownControl: GameOperationFunction = (value: GameOperationData) => {
  const { tank, controls } = value.game
  const { location: tankLocation } = tank
  const { size, padding, angleDown } = config.controls
  const { size: tankSize } = config.tank

  controls.angleDown.location = {
    x: tankLocation.x + tankSize.width / 2 - size.width * angleDown.sizeMultiplier / 2 + angleDown.offset.x,
    y: tankLocation.y + tankSize.height + padding + angleDown.offset.y
  }

  return value
}

export const positionAngleUpControl: GameOperationFunction = (value: GameOperationData) => {
  const { tank, controls } = value.game
  const { location: tankLocation } = tank
  const { size, padding, angleUp } = config.controls
  const { size: tankSize } = config.tank

  controls.angleUp.location = {
    x: tankLocation.x + tankSize.width / 2 - size.width * angleUp.sizeMultiplier / 2 + angleUp.offset.x,
    y: tankLocation.y - size.height * angleUp.sizeMultiplier - padding + angleUp.offset.y
  }

  return value
}

export const positionFireControl: GameOperationFunction = (value: GameOperationData) => {
  const { tank, controls } = value.game
  const { location: tankLocation } = tank
  const { size: game } = value.state
  const { size, padding, fire } = config.controls
  const { size: tankSize } = config.tank

  controls.fire.location = {
    x: game.width - size.width * fire.sizeMultiplier - size.width - padding + fire.offset.x,
    y: tankLocation.y + tankSize.height / 2 - size.height * fire.sizeMultiplier / 2 + fire.offset.y
  }

  return value
}

export const positionGunBarrelFireControl: GameOperationFunction = (value: GameOperationData) => {
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

  return value
}

export const positionStaticObjects: GameOperationFunction = (value: GameOperationData) => {
  let result = operationPipeline([
    positionTank,
    positionTarget,
    positionPowerDownControl,
    positionPowerUpControl,
    positionAngleDownControl,
    positionAngleUpControl,
    positionFireControl
  ]).run(value)

  return result
}

export const updateBulletPosition: GameOperationFunction = (value: GameOperationData) => {
  const { bullet } = value.game
  const { location, velocity } = bullet
  const { animationSpeed } = config.bullet

  location.x += velocity.x / animationSpeed
  location.y += velocity.y / animationSpeed

  return value
}

export const updateBulletVelocity: GameOperationFunction = (value: GameOperationData) => {
  const { bullet } = value.game
  const { frame } = value.state
  const { bullet: bulletConfig, environment } = config

  const lifeTime = Math.max(frame - bullet.startFrame, 0)
  if (lifeTime % bulletConfig.animationSpeed === 0) {
    bullet.velocity.x *= (1 - environment.airResistance)
    bullet.velocity.y *= (1 - environment.airResistance)

    bullet.velocity.y += environment.gravity
  }

  return value
}

export const updateTargetPosition: GameOperationFunction = (value: GameOperationData) => {
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

  return value
}

const getReversedDirection = (value: GameOperationData): TargetDirection | null => {
  const { difficulty, size: game } = value.state
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

export const randomiseTargetDirection: GameOperationFunction = (value: GameOperationData) => {
  const { difficulty } = value.state
  const { target } = value.game

  const reversedDirection = getReversedDirection(value)
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

  return value
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

const getGameShape = (value: GameOperationData): Array<Coordinates> => {
  const { size } = value.state

  const ul = { x: 0, y: 0 }
  const ur = { x: size.width, y: 0 }
  const ll = { x: 0, y: size.height }
  const lr = { x: size.width, y: size.height }

  return [ul, ur, lr, ll]
}

export const checkObjectCollision: GameOperationFunction = (value: GameOperationData) => {
  const { target } = value.game

  const bulletShape = getBulletShape(value)
  const targetShape = getTargetShape(value)
  const isHit = checkOverlap(bulletShape, targetShape)

  target.isHit = isHit

  return value
}

const checkOutOfBoundsBullet = (value: GameOperationData): boolean => {
  const { size } = value.state
  const bulletShape = getBulletShape(value)
  const gameShape = getGameShape(value)

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

export const checkResult: GameOperationFunction = (value: GameOperationData) => {
  const { game, state } = value
  const { tank, target } = game

  if (target.isHit) {
    game.message = {
      active: true,
      hit: true,
      startFrame: state.frame
    }

    state.state = State.TurnComplete
    return value
  }

  if (checkOutOfBoundsBullet(value)) {
    if (tank.bullets > 0) {
      game.message = {
        active: true,
        hit: false,
        startFrame: state.frame
      }
    }

    state.state = tank.bullets === 0 ? State.GameOver : State.TurnComplete
  }

  return value
}

export const adjustDifficulty: GameOperationFunction = (value: GameOperationData) => {
  const { state } = value

  state.totalHits += 1

  if (state.totalHits % config.environment.hitsPerDifficulty === 0) {
    state.difficulty += 1
  }

  return value
}

export const calculateScore: GameOperationFunction = (value: GameOperationData) => {
  const { state } = value

  const baseScore = state.difficulty <= Difficulty.RepositionTarget ? 1 : 2
  const difficultyMultiplier = getDifficultyMultiplier(value)
  state.score += baseScore * difficultyMultiplier

  return value
}

export const refundBullet: GameOperationFunction = (value: GameOperationData) => {
  const { tank } = value.game

  tank.bullets += 1

  return value
}

export const resetBullet: GameOperationFunction = (value: GameOperationData) => {
  const { bullet } = value.game

  bullet.active = false

  return value
}

export const resetExplosion: GameOperationFunction = (value: GameOperationData) => {
  const { explosion } = value.game

  explosion.active = false

  return value
}

export const startNewTurn: GameOperationFunction = (value: GameOperationData) => {
  const { state } = value

  state.state = State.Ready

  return value
}

export const dismissMessage: GameOperationFunction = (value: GameOperationData) => {
  const { message } = value.game

  message.active = false
  message.hit = false
  message.startFrame = 0

  return value
}

export const initialiseGameOver: GameOperationFunction = (value: GameOperationData) => {
  const { gameOver } = value.game

  gameOver.active = true
  gameOver.startFrame = value.state.frame
  gameOver.newHighScore = value.state.score > value.state.hiScore

  return value
}

export const resetTank: GameOperationFunction = (value: GameOperationData) => {
  const { tank } = value.game

  tank.bullets = 5

  return value
}

export const resetState: GameOperationFunction = (value: GameOperationData) => {
  const { state } = value

  state.difficulty = Difficulty.Normal
  state.score = 0
  state.totalHits = 0

  return value
}

export const dismissGameOver: GameOperationFunction = (value: GameOperationData) => {
  const { gameOver } = value.game

  gameOver.active = false

  return value
}

export const updateHighScore: GameOperationFunction = (value: GameOperationData) => {
  const { state } = value

  state.hiScore = Math.max(state.score, state.hiScore)

  return value
}