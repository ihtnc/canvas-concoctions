import { type GameOperationData, type GameOperationFunction } from "./types"
import config from './data'
import { degreesToRadians, getRotatedCoordinates } from "@/utilities/misc-operations"

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

  const allowedArea = game.width * 0.6 - movementRange
  const targetStartX = game.width - allowedArea - size.width
  const targetAllowedY = game.height - size.height

  target.location = {
    x: targetStartX + Math.floor(Math.random() * allowedArea),
    y: Math.floor(Math.random() * targetAllowedY)
  }

  target.origin = { ...target.location }

  return value
}

export const initialiseTarget: GameOperationFunction = (value: GameOperationData) => {
  const { target } = value.game

  target.isHit = false

  return value
}

export const positionBullet: GameOperationFunction = (value: GameOperationData) => {
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

export const setBulletVelocity: GameOperationFunction = (value: GameOperationData) => {
  const { bullet, tank } = value.game
  const { maxPower, powerMultiplier } = config.environment

  var halfPower = maxPower / 2
  var adjustedPower = halfPower + (tank.power / maxPower) * halfPower
  var firePower = adjustedPower * powerMultiplier
  var radians = degreesToRadians(tank.angle)

  bullet.velocity = {
    x: firePower * Math.cos(radians),
    y: firePower * Math.sin(radians) * -1
  }

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

  var startX = barrel.x
  var startY = barrel.y + barrelSize.height / 2
  var trajectoryLength = length + padding
  var radians = degreesToRadians(tank.angle)
  var endX = startX + trajectoryLength * Math.cos(radians)
  var endY = startY - trajectoryLength * Math.sin(radians)

  gunBarrelFire.location = {
    x: endX - size.width / 2 + offset.x,
    y: endY - size.height / 2 + offset.y
  }

  return value
}

export const fireBullet: GameOperationFunction = (value: GameOperationData) => {
  const { state } = value
  const { tank } = value.game

  state.bulletFired = true
  state.bulletStopped = false
  tank.bullets -= 1

  return value
}
