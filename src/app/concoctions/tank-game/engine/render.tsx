import { getLocalStorage } from "@/utilities/client-operations"
import { type TankGameRenderFunction, type RenderPipelineData, Command } from "./types"
import { getTextSize, renderPipeline } from "@/utilities/drawing-operations"
import { type Coordinates } from "@/components/canvas/types"
import { degreesToRadians, radiansToDegrees } from "@/utilities/misc-operations"

type CreateTextStatRenderFunction = (key: string, value: string, offset: Coordinates) => TankGameRenderFunction
const createTextStatMessage: CreateTextStatRenderFunction = (key, value, offset) => {
  const render: TankGameRenderFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData) => {
    const { stats } = data.config

    const col1X = stats.location.x
    var col1Y = stats.location.y + offset.y

    var col2X = col1X + offset.x
    var col2Y = col1Y

    context.fillText(key, col1X, col1Y)
    context.fillText(value, col2X, col2Y)
  }

  return render
}

type CreateImageStatRenderFunction = (location: Coordinates) => TankGameRenderFunction

const createBulletImageStat: CreateImageStatRenderFunction = (location) => {
  const render: TankGameRenderFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData) => {
    const { bulletImage } = data.resources
    if (bulletImage.complete === false) { return }

    context.save()

    const { x: statX, y: statY } = data.config.stats.location
    const x = statX + location.x
    const y = statY + location.y
    const { tank } = data.game
    const { bullet } = data.config
    const { size } = bullet

    //rotate image to portrait
    context.translate(x, y)
    context.rotate(degreesToRadians(-90))

    const bulletSpacing = size.height + bullet.padding
    for (var i = 0; i < tank.bullets; i++) {
      context.drawImage(bulletImage, x - size.width, bulletSpacing * i, size.width, size.height)
    }

    context.restore()
  }

  return render
}

const createRankImageStat: CreateImageStatRenderFunction = (location) => {
  const render: TankGameRenderFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData) => {
    const { rankImage } = data.resources
    if (rankImage.complete === false) { return }

    const { stats } = data.config
    const { x: statX, y: statY } = stats.location
    const x = statX + location.x
    const y = statY + location.y
    const { difficulty } = data.state
    const { rank } = data.config
    const { size, offset } = rank

    for (var i = 0; i < difficulty; i++) {
      context.drawImage(rankImage, x + size.width * i + offset.x, y + offset.y, size.width, size.height)
    }
  }

  return render
}

export const renderGameStats: TankGameRenderFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData) => {
  context.save()

  const { stats } = data.config
  const { score } = data.state

  const { h, s, l } = stats.color
  const color = `HSL(${h}, ${s}%, ${l}%)`
  context.fillStyle = color
  context.font = stats.font

  const hiScoreMessage = "Hi Score:"
  const hiScoreSize = getTextSize(context, hiScoreMessage)
  const scoreMessage = "Score:"
  const scoreSize = getTextSize(context, scoreMessage)
  const longestMessage = Math.max(hiScoreSize.width, scoreSize.width)

  const hiScoreValue = getLocalStorage("hiScore", "0")
  const hiScoreFn = createTextStatMessage(hiScoreMessage, hiScoreValue, { x: longestMessage, y: 0 })

  const scoreOffset: Coordinates = { x: longestMessage, y: hiScoreSize.height + stats.padding }
  const scoreValue = `${score}`
  const scoreFn = createTextStatMessage(scoreMessage, scoreValue, scoreOffset)

  const { size: bulletSize } = data.config.bullet
  const bulletLocation: Coordinates = { x: 0, y: hiScoreSize.height + scoreSize.height + stats.padding }
  const bulletFn = createBulletImageStat(bulletLocation)

  const rankLocation: Coordinates = { x: 0, y: hiScoreSize.height + scoreSize.height + bulletSize.height + stats.padding }
  const rankFn = createRankImageStat(rankLocation)

  const renderFns = [
    hiScoreFn,
    scoreFn,
    bulletFn,
    rankFn
  ]

  renderPipeline(renderFns).run(context, data)

  context.restore()
}

export const renderTank: TankGameRenderFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData) => {
  const { tankImage } = data.resources
  if (tankImage.complete === false) { return }

  const { tank } = data.game
  const { size } = data.config.tank
  const { location } = tank

  context.drawImage(tankImage, location.x, location.y, size.width, size.height)
}

export const renderGunBarrel: TankGameRenderFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData) => {
  const { gunBarrelImage } = data.resources
  if (gunBarrelImage.complete === false) { return }

  const { gunBarrel, tank } = data.game
  const { size, angleMultiplier } = data.config.gunBarrel
  const { rotation } = gunBarrel
  const angle = tank.angle * angleMultiplier

  context.save()

  context.translate(rotation.x, rotation.y)
  context.rotate(degreesToRadians(angle))
  context.drawImage(gunBarrelImage, 0, -size.height / 2, size.width, size.height)

  context.restore()
}

export const renderTarget: TankGameRenderFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData) => {
  const { targetImage } = data.resources
  if (targetImage.complete === false) { return }

  const { target } = data.game
  if (target.isHit === false) { return }

  const { location } = target
  const { size } = data.config.target

  context.drawImage(targetImage, location.x, location.y, size.width, size.height)
}

export const renderTrajectory: TankGameRenderFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData) => {
  const { tank, gunBarrel } = data.game
  const { size } = data.config.gunBarrel
  const { environment, trajectory } = data.config
  const { location } = gunBarrel

  context.save()

  const startX = location.x
  const startY = location.y + size.height / 2
  const length = trajectory.length * tank.power / environment.maxPower
  const radians = degreesToRadians(tank.angle)
  const endX = startX + length * Math.cos(radians)
  const endY = startY - length * Math.sin(radians)
  const lineWidth = tank.power * trajectory.lineWidthMultiplier

  context.beginPath()
  context.moveTo(startX, startY)
  context.lineTo(endX, endY)
  context.lineWidth = lineWidth
  context.setLineDash(trajectory.lineDash)
  context.stroke()

  context.restore()
}

export const renderBullet: TankGameRenderFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData) => {
  const { bulletImage } = data.resources
  if (bulletImage.complete === false) { return }

  const { bullet } = data.game
  const { bulletFired, bulletStopped } = data.state
  if (bulletFired === false || bulletStopped) { return }

  const { location, velocity } = bullet
  const { size } = data.config.bullet
  const angle = radiansToDegrees(Math.atan2(velocity.y, velocity.x))

  context.save()

  context.translate(location.x, location.y)
  context.rotate(degreesToRadians(angle))
  context.drawImage(bulletImage, -size.width / 2, -size.height / 2, size.width, size.height)

  context.restore()
}

export const renderPowerDownControl: TankGameRenderFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData) => {
  const { arrowImage } = data.resources
  if (arrowImage.complete === false) { return }

  const { currentCommand } = data.state
  const { powerDown } = data.game.controls
  const { powerDown: config, size, activeOpacity, inactiveOpacity } = data.config.controls

  context.save()
  context.globalAlpha = currentCommand === Command.PowerDown ? activeOpacity : inactiveOpacity
  context.translate(powerDown.location.x + size.width * config.sizeMultiplier / 2, powerDown.location.y + size.height * config.sizeMultiplier / 2)
  context.rotate(degreesToRadians(180))
  context.translate(-powerDown.location.x - size.width * config.sizeMultiplier / 2, -powerDown.location.y - size.height * config.sizeMultiplier / 2)
  context.drawImage(arrowImage, powerDown.location.x, powerDown.location.y, size.width * config.sizeMultiplier, size.height * config.sizeMultiplier)
  context.restore()
}

export const renderPowerUpControl: TankGameRenderFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData) => {
  const { arrowImage } = data.resources
  if (arrowImage.complete === false) { return }

  const { currentCommand } = data.state
  const { powerUp } = data.game.controls
  const { powerUp: config, size, activeOpacity, inactiveOpacity } = data.config.controls

  context.save()
  context.globalAlpha = currentCommand === Command.PowerUp ? activeOpacity : inactiveOpacity
  context.drawImage(arrowImage, powerUp.location.x, powerUp.location.y, size.width * config.sizeMultiplier, size.height * config.sizeMultiplier)
  context.restore()
}

export const renderAngleDownControl: TankGameRenderFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData) => {
  const { arrowImage } = data.resources
  if (arrowImage.complete === false) { return }

  const { currentCommand } = data.state
  const { angleDown } = data.game.controls
  const { angleDown: config, size, activeOpacity, inactiveOpacity } = data.config.controls

  context.save()
  context.globalAlpha = currentCommand === Command.AngleDown ? activeOpacity : inactiveOpacity
  context.translate(angleDown.location.x + size.width * config.sizeMultiplier / 2, angleDown.location.y + size.height * config.sizeMultiplier / 2)
  context.rotate(degreesToRadians(90))
  context.translate(-angleDown.location.x - size.width * config.sizeMultiplier / 2, -angleDown.location.y - size.height * config.sizeMultiplier / 2)
  context.drawImage(arrowImage, angleDown.location.x, angleDown.location.y, size.width * config.sizeMultiplier, size.height * config.sizeMultiplier)
  context.restore()
}

export const renderAngleUpControl: TankGameRenderFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData) => {
  const { arrowImage } = data.resources
  if (arrowImage.complete === false) { return }

  const { currentCommand } = data.state
  const { angleUp } = data.game.controls
  const { angleUp: config, size, activeOpacity, inactiveOpacity } = data.config.controls

  context.save()
  context.globalAlpha = currentCommand === Command.AngleUp ? activeOpacity : inactiveOpacity
  context.translate(angleUp.location.x + size.width * config.sizeMultiplier / 2, angleUp.location.y + size.height * config.sizeMultiplier / 2)
  context.rotate(degreesToRadians(-90))
  context.translate(-angleUp.location.x - size.width * config.sizeMultiplier / 2, -angleUp.location.y - size.height * config.sizeMultiplier / 2)
  context.drawImage(arrowImage, angleUp.location.x, angleUp.location.y, size.width * config.sizeMultiplier, size.height * config.sizeMultiplier)
  context.restore()
}

export const renderFireControl: TankGameRenderFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData) => {
  const { shootImage } = data.resources
  if (shootImage.complete === false) { return }

  const { currentCommand } = data.state
  const { fire } = data.game.controls
  const { fire: config, size, activeOpacity, inactiveOpacity } = data.config.controls

  context.save()
  context.globalAlpha = currentCommand === Command.Fire ? activeOpacity : inactiveOpacity
  context.drawImage(shootImage, fire.location.x, fire.location.y, size.width * config.sizeMultiplier, size.height * config.sizeMultiplier)
  context.restore()
}

export const renderGunBarrelFireControl: TankGameRenderFunction = (context: CanvasRenderingContext2D, data: RenderPipelineData) => {
  const { shootImage } = data.resources
  if (shootImage.complete === false) { return }

  const { currentCommand } = data.state
  const { gunBarrelFire } = data.game.controls
  const { gunBarrelFire: config, size, activeOpacity, inactiveOpacity } = data.config.controls

  context.save()
  context.globalAlpha = currentCommand === Command.Fire ? activeOpacity : inactiveOpacity
  context.drawImage(shootImage, gunBarrelFire.location.x, gunBarrelFire.location.y, size.width * config.sizeMultiplier, size.height * config.sizeMultiplier)
  context.restore()
}