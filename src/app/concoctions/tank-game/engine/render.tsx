import { type GameOperationData, Command } from "./types"
import { getTextSize } from "@/utilities/drawing-operations"
import { chooseRandom, degreesToRadians, radiansToDegrees } from "@/utilities/misc-operations"
import { isBulletImageLoaded, isRankImageLoaded } from "./conditional-functions"
import { type AnimatedCanvasRenderFilterFunction, type AnimatedCanvasRenderFunction, type Coordinates, renderWhen } from "@ihtnc/use-animated-canvas"

const renderHiScoreStat: AnimatedCanvasRenderFunction<GameOperationData> = (context, data) => {
  if (data.data === undefined) { return }

  context.save()

  const { hiScoreLabel, hiScoreLocation } = data.data.game.stats
  const { hiScore } = data.data.state
  const { stats } = data.data.config
  const { r, g, b } = stats.color
  const color = `RGB(${r}, ${g}, ${b})`
  context.fillStyle = color
  context.font = stats.font

  const col1X = stats.location.x
  const col1Y = stats.location.y + hiScoreLocation.y

  const col2X = col1X + hiScoreLocation.x
  const col2Y = col1Y

  context.fillText(hiScoreLabel, col1X, col1Y)
  context.fillText(`${hiScore}`, col2X, col2Y)

  context.restore()
}

const renderScoreStat: AnimatedCanvasRenderFunction<GameOperationData> = (context, data) => {
  if (data.data === undefined) { return }

  context.save()

  const { scoreLabel, scoreLocation } = data.data.game.stats
  const { score } = data.data.state
  const { stats } = data.data.config
  const { r, g, b } = stats.color
  const color = `RGB(${r}, ${g}, ${b})`
  context.fillStyle = color
  context.font = stats.font

  const col1X = stats.location.x
  const col1Y = stats.location.y + scoreLocation.y

  const col2X = col1X + scoreLocation.x
  const col2Y = col1Y

  context.fillText(scoreLabel, col1X, col1Y)
  context.fillText(`${score}`, col2X, col2Y)

  context.restore()
}

const renderBulletsStat: AnimatedCanvasRenderFunction<GameOperationData> = (context, data) => {
  if (data.data === undefined) { return }
  const { bulletImage } = data.data.resources!

  context.save()

  const { tank, stats } = data.data.game
  const { x: statX, y: statY } = data.data.config.stats.location
  const x = statX + stats.bulletsLocation.x
  const y = statY + stats.bulletsLocation.y

  const { bullet } = data.data.config
  const { size } = bullet

  //rotate image to portrait
  context.translate(x, y)
  context.rotate(degreesToRadians(-90))

  const bulletSpacing = size.height + bullet.padding
  for (let i = 0; i < tank.bullets; i++) {
    context.drawImage(bulletImage, x - size.width, bulletSpacing * i, size.width, size.height)
  }

  context.restore()
}

const renderRankStat: AnimatedCanvasRenderFunction<GameOperationData> = (context, data) => {
  if (data.data === undefined) { return }

  const { rankImage } = data.data.resources!

  const { rankLocation } = data.data.game.stats
  const { stats } = data.data.config
  const { x: statX, y: statY } = stats.location
  const x = statX + rankLocation.x
  const y = statY + rankLocation.y
  const { difficulty } = data.data.state
  const { rank } = data.data.config
  const { size, offset } = rank

  for (let i = 0; i < difficulty; i++) {
    context.drawImage(rankImage, x + size.width * i + offset.x, y + offset.y, size.width, size.height)
  }
}

export const renderGameStats = () => {
  return [
    renderHiScoreStat,
    renderScoreStat,
    renderWhen(isBulletImageLoaded, renderBulletsStat),
    renderWhen(isRankImageLoaded, renderRankStat)
  ]
}

export const renderTank: AnimatedCanvasRenderFunction<GameOperationData> = (context, renderData) => {
  if (renderData.data === undefined) { return }

  const { data } = renderData
  const { tankImage } = data.resources!

  const { tank } = data.game
  const { size } = data.config.tank
  const { location } = tank

  context.drawImage(tankImage, location.x, location.y, size.width, size.height)
}

export const renderGunBarrel: AnimatedCanvasRenderFunction<GameOperationData> = (context, renderData) => {
  if (renderData.data === undefined) { return }

  const { data } = renderData
  const { gunBarrelImage } = data.resources!

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

export const renderTarget: AnimatedCanvasRenderFunction<GameOperationData> = (context, renderData) => {
  if (renderData.data === undefined) { return }

  const { data } = renderData
  const { targetImage } = data.resources!
  const { location } = data.game.target
  const { size } = data.config.target

  context.drawImage(targetImage, location.x - size.width / 2, location.y - size.height / 2, size.width, size.height)
}

export const renderTrajectory: AnimatedCanvasRenderFunction<GameOperationData> = (context, renderData) => {
  if (renderData.data === undefined) { return }

  const { data } = renderData
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

export const renderBullet: AnimatedCanvasRenderFunction<GameOperationData> = (context, renderData) => {
  if (renderData.data === undefined) { return }

  const { data } = renderData
  const { bulletImage } = data.resources!
  const { location, velocity } = data.game.bullet
  const { size } = data.config.bullet
  const angle = radiansToDegrees(Math.atan2(velocity.y, velocity.x))

  context.save()

  context.translate(location.x, location.y)
  context.rotate(degreesToRadians(angle))
  context.drawImage(bulletImage, -size.width / 2, -size.height / 2, size.width, size.height)

  context.restore()
}

export const renderPowerDownControl: AnimatedCanvasRenderFunction<GameOperationData> = (context, renderData) => {
  if (renderData.data === undefined) { return }

  const { data } = renderData
  const { arrowImage } = data.resources!
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

export const renderPowerUpControl: AnimatedCanvasRenderFunction<GameOperationData> = (context, renderData) => {
  if (renderData.data === undefined) { return }

  const { data } = renderData
  const { arrowImage } = data.resources!
  const { currentCommand } = data.state
  const { powerUp } = data.game.controls
  const { powerUp: config, size, activeOpacity, inactiveOpacity } = data.config.controls

  context.save()
  context.globalAlpha = currentCommand === Command.PowerUp ? activeOpacity : inactiveOpacity
  context.drawImage(arrowImage, powerUp.location.x, powerUp.location.y, size.width * config.sizeMultiplier, size.height * config.sizeMultiplier)
  context.restore()
}

export const renderAngleDownControl: AnimatedCanvasRenderFunction<GameOperationData> = (context, renderData) => {
  if (renderData.data === undefined) { return }

  const { data } = renderData
  const { arrowImage } = data.resources!
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

export const renderAngleUpControl: AnimatedCanvasRenderFunction<GameOperationData> = (context, renderData) => {
  if (renderData.data === undefined) { return }

  const { data } = renderData
  const { arrowImage } = data.resources!
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

export const renderFireControl: AnimatedCanvasRenderFunction<GameOperationData> = (context, renderData) => {
  if (renderData.data === undefined) { return }

  const { data } = renderData
  const { shootImage } = data.resources!
  const { currentCommand } = data.state
  const { fire } = data.game.controls
  const { fire: config, size, activeOpacity, inactiveOpacity } = data.config.controls

  context.save()
  context.globalAlpha = currentCommand === Command.Fire ? activeOpacity : inactiveOpacity
  context.drawImage(shootImage, fire.location.x, fire.location.y, size.width * config.sizeMultiplier, size.height * config.sizeMultiplier)
  context.restore()
}

export const renderGunBarrelFireControl: AnimatedCanvasRenderFunction<GameOperationData> = (context, renderData) => {
  if (renderData.data === undefined) { return }

  const { data } = renderData
  const { shootImage } = data.resources!
  const { currentCommand } = data.state
  const { gunBarrelFire } = data.game.controls
  const { gunBarrelFire: config, size, activeOpacity, inactiveOpacity } = data.config.controls

  context.save()
  context.globalAlpha = currentCommand === Command.Fire ? activeOpacity : inactiveOpacity
  context.drawImage(shootImage, gunBarrelFire.location.x, gunBarrelFire.location.y, size.width * config.sizeMultiplier, size.height * config.sizeMultiplier)
  context.restore()
}

export const renderRestartControl: AnimatedCanvasRenderFunction<GameOperationData> = (context, renderData) => {
  if (renderData.data === undefined) { return }

  const { data } = renderData
  const { restartImage } = data.resources!
  const { location } = data.game.controls.restart
  const { restart: config, size } = data.config.controls

  context.save()

  context.globalAlpha = 1
  context.drawImage(restartImage, location.x, location.y, size.width * config.sizeMultiplier, size.height * config.sizeMultiplier)

  context.restore()
}

export const renderExplosion: AnimatedCanvasRenderFunction<GameOperationData> = (context, renderData) => {
  if (renderData.data === undefined) { return }

  const { data } = renderData
  const { explosionImage } = data.resources!
  const { location, startFrame } = data.game.explosion
  const { size, duration } = data.config.explosion

  context.save()

  const lifeTime = renderData.drawData.frame - startFrame
  const offset: Coordinates = { x: chooseRandom(-3, 3), y: chooseRandom(-3, 3) }

  context.globalAlpha = 1.5 - 1.5 * lifeTime / duration
  context.drawImage(explosionImage, location.x - size.width / 2 + offset.x, location.y - size.height / 2 + offset.y, size.width, size.height)

  context.restore()
}

export const renderMessage: AnimatedCanvasRenderFunction<GameOperationData> = (context, renderData) => {
  if (renderData.data === undefined) { return }

  const { data, drawData } = renderData
  const { message } = data.game
  const gameSize = { width: drawData.offsetWidth, height: drawData.offsetHeight }
  const { frame } = renderData.drawData
  const { message: messageConfig } = data.config
  const { hit, miss } = messageConfig

  const text = message.hit ? 'HIT!' : 'MISS!'
  const config = message.hit ? hit : miss
  const { color, font } = config

  context.save()

  const lifeTime = Math.max(frame - message.startFrame, 0)
  context.globalAlpha = 1.5 - 1.5 * (lifeTime / messageConfig.duration)
  context.strokeStyle = 'black'
  context.lineWidth = 1
  context.fillStyle = `RGB(${color.r}, ${color.g}, ${color.b})`
  context.font = font

  const size = getTextSize(context, text)
  context.fillText(text, gameSize.width / 2 - size.width / 2, gameSize.height / 2 - size.height)
  context.strokeText(text, gameSize.width / 2 - size.width / 2, gameSize.height / 2 - size.height)

  context.restore()
}

export const renderGameOver: AnimatedCanvasRenderFunction<GameOperationData> = (context, renderData) => {
  if (renderData.data === undefined) { return }

  const { data } = renderData
  const { frame } = renderData.drawData
  const { startFrame, message: messageDetails, score: scoreDetails, highScore: highScoreDetails, newHighScore } = data.game.gameOver
  const {
    message: messageConfig,
    score: scoreConfig,
    highScore: highScoreConfig,
    animationSpeed
  } = data.config.gameOver

  context.save()

  const lifeTime = Math.max(frame - startFrame, 0)
  context.globalAlpha = Math.min(1.5 * (lifeTime / animationSpeed), 1)

  context.fillStyle = `RGB(${messageConfig.color.r}, ${messageConfig.color.g}, ${messageConfig.color.b})`
  context.font = messageConfig.font
  context.fillText(messageDetails.text, messageDetails.location.x, messageDetails.location.y)

  context.fillStyle = `RGB(${scoreConfig.color.r}, ${scoreConfig.color.g}, ${scoreConfig.color.b})`
  context.font = scoreConfig.font
  context.fillText(scoreDetails.text, scoreDetails.location.x, scoreDetails.location.y)

  const blink = lifeTime % animationSpeed < 2 * animationSpeed / 3
  if (newHighScore && blink) {
    context.strokeStyle = 'black'
    context.lineWidth = 1
    context.fillStyle = `RGB(${highScoreConfig.color.r}, ${highScoreConfig.color.g}, ${highScoreConfig.color.b})`
    context.font = highScoreConfig.font
    context.fillText(highScoreDetails.text, highScoreDetails.location.x, highScoreDetails.location.y)
    context.strokeText(highScoreDetails.text, highScoreDetails.location.x, highScoreDetails.location.y)
  }

  context.restore()
}

export const gameOverFilter: AnimatedCanvasRenderFilterFunction = (context) => {
  context.globalAlpha = 0.35
}