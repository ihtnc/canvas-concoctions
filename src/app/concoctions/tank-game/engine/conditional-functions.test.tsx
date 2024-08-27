import {
  type GameObject,
  type GameStateObject,
  type ResourcesObject,
  Command,
  Difficulty,
  State,
  TargetDirection
} from "./types"
import {
  isAimCommand,
  isRestartCommand,
  isFireCommand,
  hasBullets,
  isBulletActive,
  isTargetHit,
  isTargetMoving,
  difficultyAllowsRepositioningTarget,
  difficultyAllowsMovingTarget,
  isGameReady,
  isGameTurnComplete,
  isGameOver,
  isGameOverScreenActive,
  isExplosionActive,
  isExplosionAnimationComplete,
  isMessageActive,
  isMessageAnimationComplete,
  isBulletImageLoaded,
  isRankImageLoaded,
  isTankImageLoaded,
  isGunBarrelImageLoaded,
  isTargetImageLoaded,
  isArrowImageLoaded,
  isShootImageLoaded,
  isExplosionImageLoaded,
  isRestartImageLoaded,
} from "./conditional-functions"
import { type MockInstance, beforeEach, afterEach, describe, expect, test, vi } from "vitest"
import config from "./data"
import { type DrawData } from "@ihtnc/use-animated-canvas"

describe("Game Conditional Functions", () => {
  let drawData: DrawData
  let data: any
  let state: GameStateObject
  let game: GameObject
  let resources: ResourcesObject
  let getCompleteMock: MockInstance

  beforeEach(() => {
    drawData = {
      fps: 0,
      width: 1,
      height: 2,
      clientWidth: 3,
      clientHeight: 4,
      offsetWidth: 5,
      offsetHeight: 6,
      pixelRatio: 7,
      frame: 8,
      isDarkMode: false
    }

    state = {
      currentCommand: undefined,
      difficulty: Difficulty.Normal,
      state: State.Ready,
      score: 0,
      hiScore: 0,
      totalHits: 0
    }

    game = {
      tank: { bullets: 0, location: { x: 0, y: 0 }, angle: 0, power: 0 },
      gunBarrel: { location: { x: 0, y: 0 }, rotation: { x: 0, y: 0 } },
      bullet: { active: false, location: { x: 0, y: 0 }, velocity: { x: 0, y: 0 }, startFrame: 0 },
      target: { isHit: false, currentDirection: undefined, location: { x: 0, y: 0 }, origin: { x: 0, y: 0 }, isReversing: false },
      explosion: { active: false, startFrame: 0, location: { x: 0, y: 0 } },
      message: { active: false, startFrame: 0, hit: false },
      gameOver: { active: false, startFrame: 0, message: { text: "", location: { x: 0, y: 0 }, size: { width: 0, height: 0 } }, score: { text: "", location: { x: 0, y: 0 }, size: { width: 0, height: 0 } }, highScore: { text: "", location: { x: 0, y: 0 }, size: { width: 0, height: 0 } }, newHighScore: false },
      controls: { powerUp: { location: { x: 0, y: 0 }}, powerDown: { location: { x: 0, y: 0 }}, angleUp: { location: { x: 0, y: 0 }}, angleDown: { location: { x: 0, y: 0 }}, gunBarrelFire: { location: { x: 0, y: 0 }}, fire: { location: { x: 0, y: 0 }}, restart: { location: { x: 0, y: 0 }}},
      stats: { bulletsLocation: { x: 0, y: 0 }, scoreLocation: { x: 0, y: 0 }, hiScoreLocation: { x: 0, y: 0 }, rankLocation: { x: 0, y: 0 }, scoreLabel: "", hiScoreLabel: "" }
    }

    const image = document.createElement('img')
    getCompleteMock = vi.spyOn(image, 'complete', 'get')
    vi.spyOn(global, 'Image').mockImplementation(() => image)

    resources = {
      bulletImage: new Image(),
      rankImage: new Image(),
      tankImage: new Image(),
      gunBarrelImage: new Image(),
      targetImage: new Image(),
      arrowImage: new Image(),
      shootImage: new Image(),
      explosionImage: new Image(),
      restartImage: new Image()
    }

    data = {
      data: { state, game, resources },
      drawData
    }
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe("isAimCommand function", () => {
    test.each([
      { currentCommand: Command.PowerUp, expected: true, title: Command[Command.PowerUp] },
      { currentCommand: Command.PowerDown, expected: true, title: Command[Command.PowerDown] },
      { currentCommand: Command.AngleUp, expected: true, title: Command[Command.AngleUp] },
      { currentCommand: Command.PowerDown, expected: true, title: Command[Command.AngleDown] },
      { currentCommand: Command.Fire, expected: false, title: Command[Command.Fire] },
      { currentCommand: Command.Restart, expected: false, title: Command[Command.Restart] },
      { currentCommand: undefined, expected: false, title: 'undefined' }
    ])("should return $expected if currentCommand is $title", ({ currentCommand, expected }: { currentCommand: Command | undefined, expected: boolean }) => {
      state.currentCommand = currentCommand

      const result = isAimCommand(data)

      expect(result).toBe(expected)
    })
  })

  describe("isRestartCommand function", () => {
    test.each([
      { currentCommand: Command.Restart, expected: true, title: Command[Command.Restart] },
      { currentCommand: Command.PowerUp, expected: false, title: Command[Command.PowerUp] },
      { currentCommand: undefined, expected: false, title: 'undefined' }
    ])("should return $expected if currentCommand is $title", ({ currentCommand, expected }: { currentCommand: Command | undefined, expected: boolean }) => {
      state.currentCommand = currentCommand

      const result = isRestartCommand(data)

      expect(result).toBe(expected)
    })
  })

  describe("isFireCommand function", () => {
    test.each([
      { currentCommand: Command.Fire, expected: true, title: Command[Command.Fire] },
      { currentCommand: Command.PowerUp, expected: false, title: Command[Command.PowerUp] },
      { currentCommand: undefined, expected: false, title: 'undefined' }
    ])("should return $expected if currentCommand is $title", ({ currentCommand, expected }: { currentCommand: Command | undefined, expected: boolean }) => {
      state.currentCommand = currentCommand

      const result = isFireCommand(data)

      expect(result).toBe(expected)
    })
  })

  describe("hasBullets function", () => {
    test.each([
      { bulletCount: 1, expected: true },
      { bulletCount: 2, expected: true },
      { bulletCount: 0, expected: false },
      { bulletCount: -1, expected: false }
    ])("should return $expected if bullet count is $bulletCount", ({ bulletCount, expected }: { bulletCount: number, expected: boolean }) => {
      game.tank.bullets = bulletCount

      const result = hasBullets(data)

      expect(result).toBe(expected)
    })
  })

  describe("isBulletActive function", () => {
    test.each([
      { isActive: true, expected: true },
      { isActive: false, expected: false }
    ])("should return $expected if bullet.active is $isActive", ({ isActive, expected }: { isActive: boolean, expected: boolean }) => {
      game.bullet.active = isActive

      const result = isBulletActive(data)

      expect(result).toBe(expected)
    })
  })

  describe("isTargetHit function", () => {
    test.each([
      { isHit: true, expected: true },
      { isHit: false, expected: false }
    ])("should return $expected if target.isHit is $isHit", ({ isHit, expected }: { isHit: boolean, expected: boolean }) => {
      game.target.isHit = isHit

      const result = isTargetHit(data)

      expect(result).toBe(expected)
    })
  })

  describe("isTargetMoving function", () => {
    test.each([
      { currentDirection: TargetDirection.Down, expected: true, title: TargetDirection[TargetDirection.Down] },
      { currentDirection: undefined, expected: false, title: 'undefined'}
    ])("should return $expected if target.currentDirection is $title", ({ currentDirection, expected }: { currentDirection: TargetDirection | undefined, expected: boolean }) => {
      game.target.currentDirection = currentDirection

      const result = isTargetMoving(data)

      expect(result).toBe(expected)
    })
  })

  describe("difficultyAllowsRepositioningTarget function", () => {
    test.each([
      { difficulty: Difficulty.RepositionTarget, expected: true, title: Difficulty[Difficulty.RepositionTarget] },
      { difficulty: Difficulty.MoveTargetRandomly, expected: true, title: Difficulty[Difficulty.MoveTargetRandomly] },
      { difficulty: Difficulty.Normal, expected: false, title: Difficulty[Difficulty.Normal] }
    ])("should return $expected if state.difficulty is $title", ({ difficulty, expected }: { difficulty: Difficulty, expected: boolean }) => {
      state.difficulty = difficulty

      const result = difficultyAllowsRepositioningTarget(data)

      expect(result).toBe(expected)
    })
  })

  describe("difficultyAllowsMovingTarget function", () => {
    test.each([
      { difficulty: Difficulty.MoveTargetTwoWay, expected: true, title: Difficulty[Difficulty.MoveTargetTwoWay] },
      { difficulty: Difficulty.MoveTargetFourWay, expected: true, title: Difficulty[Difficulty.MoveTargetFourWay] },
      { difficulty: Difficulty.RepositionTarget, expected: false, title: Difficulty[Difficulty.RepositionTarget] },
      { difficulty: Difficulty.Normal, expected: false, title: Difficulty[Difficulty.Normal] }
    ])("should return $expected if state.difficulty is $title", ({ difficulty, expected }: { difficulty: Difficulty, expected: boolean }) => {
      state.difficulty = difficulty

      const result = difficultyAllowsMovingTarget(data)

      expect(result).toBe(expected)
    })
  })

  describe("isGameReady function", () => {
    test.each([
      { gameState: State.Ready, expected: true, title: State[State.Ready] },
      { gameState: State.TurnComplete, expected: false, title: State[State.TurnComplete] },
      { gameState: State.GameOver, expected: false, title: State[State.GameOver] }
    ])("should return $expected if state.state is $title", ({ gameState, expected }: { gameState: State, expected: boolean }) => {
      state.state = gameState

      const result = isGameReady(data)

      expect(result).toBe(expected)
    })
  })

  describe("isGameTurnComplete function", () => {
    test.each([
      { gameState: State.Ready, expected: false, title: State[State.Ready] },
      { gameState: State.TurnComplete, expected: true, title: State[State.TurnComplete] },
      { gameState: State.GameOver, expected: false, title: State[State.GameOver] }
    ])("should return $expected if state.state is $title", ({ gameState, expected }: { gameState: State, expected: boolean }) => {
      state.state = gameState

      const result = isGameTurnComplete(data)

      expect(result).toBe(expected)
    })
  })

  describe("isGameOver function", () => {
    test.each([
      { gameState: State.Ready, expected: false, title: State[State.Ready] },
      { gameState: State.TurnComplete, expected: false, title: State[State.TurnComplete] },
      { gameState: State.GameOver, expected: true, title: State[State.GameOver] }
    ])("should return $expected if state.state is $title", ({ gameState, expected }: { gameState: State, expected: boolean }) => {
      state.state = gameState

      const result = isGameOver(data)

      expect(result).toBe(expected)
    })
  })

  describe("isGameOverScreenActive function", () => {
    test.each([
      { isActive: true, expected: true },
      { isActive: false, expected: false }
    ])("should return $expected if gameOver.active is $isActive", ({ isActive, expected }: { isActive: boolean, expected: boolean }) => {
      game.gameOver.active = isActive

      const result = isGameOverScreenActive(data)

      expect(result).toBe(expected)
    })
  })

  describe("isExplosionActive function", () => {
    test.each([
      { isActive: true, expected: true },
      { isActive: false, expected: false }
    ])("should return $expected if explosion.active is $isActive", ({ isActive, expected }: { isActive: boolean, expected: boolean }) => {
      game.explosion.active = isActive

      const result = isExplosionActive(data)

      expect(result).toBe(expected)
    })
  })

  describe("isExplosionAnimationComplete function", () => {
    let getDuration: MockInstance

    beforeEach(() => {
      getDuration = vi.spyOn(config.explosion, 'duration', 'get')
    })

    test.each([
      { startFrame: 0, duration: 10, frame: 0, expected: false },
      { startFrame: 0, duration: 10, frame: 9, expected: false },
      { startFrame: 0, duration: 10, frame: 10, expected: true },
      { startFrame: 0, duration: 10, frame: 11, expected: true },
    ])("should return $expected if animation is current frame >= duration [$frame - $startFrame >= $duration]", ({ startFrame, duration, frame, expected }: { startFrame: number, duration: number, frame: number, expected: boolean }) => {
      game.explosion.startFrame = startFrame
      drawData.frame = frame
      getDuration.mockReturnValue(duration)

      const result = isExplosionAnimationComplete(data)

      expect(result).toBe(expected)
    })
  })

  describe("isMessageActive function", () => {
    test.each([
      { isActive: true, expected: true },
      { isActive: false, expected: false }
    ])("should return $expected if message.active is $isActive", ({ isActive, expected }: { isActive: boolean, expected: boolean }) => {
      game.message.active = isActive

      const result = isMessageActive(data)

      expect(result).toBe(expected)
    })
  })

  describe("isMessageAnimationComplete function", () => {
    let getDuration: MockInstance

    beforeEach(() => {
      getDuration = vi.spyOn(config.message, 'duration', 'get')
    })

    test.each([
      { startFrame: 0, duration: 10, frame: 0, expected: false },
      { startFrame: 0, duration: 10, frame: 9, expected: false },
      { startFrame: 0, duration: 10, frame: 10, expected: true },
      { startFrame: 0, duration: 10, frame: 11, expected: true },
    ])("should return $expected if animation is current frame >= duration [$frame - $startFrame >= $duration]", ({ startFrame, duration, frame, expected }: { startFrame: number, duration: number, frame: number, expected: boolean }) => {
      game.message.startFrame = startFrame
      drawData.frame = frame
      getDuration.mockReturnValue(duration)

      const result = isMessageAnimationComplete(data)

      expect(result).toBe(expected)
    })
  })

  describe("isBulletImageLoaded function", () => {
    test.each([
      { isLoaded: true, expected: true },
      { isLoaded: false, expected: false }
    ])("should return $expected if bulletImage.complete is $isLoaded", ({ isLoaded, expected }: { isLoaded: boolean, expected: boolean }) => {
      getCompleteMock.mockReturnValue(isLoaded)

      const result = isBulletImageLoaded(data)

      expect(result).toBe(expected)
    })
  })

  describe("isRankImageLoaded function", () => {
    test.each([
      { isLoaded: true, expected: true },
      { isLoaded: false, expected: false }
    ])("should return $expected if rankImage.complete is $isLoaded", ({ isLoaded, expected }: { isLoaded: boolean, expected: boolean }) => {
      getCompleteMock.mockReturnValue(isLoaded)

      const result = isRankImageLoaded(data)

      expect(result).toBe(expected)
    })
  })

  describe("isTankImageLoaded function", () => {
    test.each([
      { isLoaded: true, expected: true },
      { isLoaded: false, expected: false }
    ])("should return $expected if tankImage.complete is $isLoaded", ({ isLoaded, expected }: { isLoaded: boolean, expected: boolean }) => {
      getCompleteMock.mockReturnValue(isLoaded)

      const result = isTankImageLoaded(data)

      expect(result).toBe(expected)
    })
  })

  describe("isGunBarrelImageLoaded function", () => {
    test.each([
      { isLoaded: true, expected: true },
      { isLoaded: false, expected: false }
    ])("should return $expected if gunBarrelImage.complete is $isLoaded", ({ isLoaded, expected }: { isLoaded: boolean, expected: boolean }) => {
      getCompleteMock.mockReturnValue(isLoaded)

      const result = isGunBarrelImageLoaded(data)

      expect(result).toBe(expected)
    })
  })

  describe("isTargetImageLoaded function", () => {
    test.each([
      { isLoaded: true, expected: true },
      { isLoaded: false, expected: false }
    ])("should return $expected if targetImage.complete is $isLoaded", ({ isLoaded, expected }: { isLoaded: boolean, expected: boolean }) => {
      getCompleteMock.mockReturnValue(isLoaded)

      const result = isTargetImageLoaded(data)

      expect(result).toBe(expected)
    })
  })

  describe("isArrowImageLoaded function", () => {
    test.each([
      { isLoaded: true, expected: true },
      { isLoaded: false, expected: false }
    ])("should return $expected if arrowImage.complete is $isLoaded", ({ isLoaded, expected }: { isLoaded: boolean, expected: boolean }) => {
      getCompleteMock.mockReturnValue(isLoaded)

      const result = isArrowImageLoaded(data)

      expect(result).toBe(expected)
    })
  })

  describe("isShootImageLoaded function", () => {
    test.each([
      { isLoaded: true, expected: true },
      { isLoaded: false, expected: false }
    ])("should return $expected if shootImage.complete is $isLoaded", ({ isLoaded, expected }: { isLoaded: boolean, expected: boolean }) => {
      getCompleteMock.mockReturnValue(isLoaded)

      const result = isShootImageLoaded(data)

      expect(result).toBe(expected)
    })
  })

  describe("isExplosionImageLoaded function", () => {
    test.each([
      { isLoaded: true, expected: true },
      { isLoaded: false, expected: false }
    ])("should return $expected if explosionImage.complete is $isLoaded", ({ isLoaded, expected }: { isLoaded: boolean, expected: boolean }) => {
      getCompleteMock.mockReturnValue(isLoaded)

      const result = isExplosionImageLoaded(data)

      expect(result).toBe(expected)
    })
  })

  describe("isRestartImageLoaded function", () => {
    test.each([
      { isLoaded: true, expected: true },
      { isLoaded: false, expected: false }
    ])("should return $expected if restartImage.complete is $isLoaded", ({ isLoaded, expected }: { isLoaded: boolean, expected: boolean }) => {
      getCompleteMock.mockReturnValue(isLoaded)

      const result = isRestartImageLoaded(data)

      expect(result).toBe(expected)
    })
  })
})
