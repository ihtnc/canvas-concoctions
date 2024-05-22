import { describe, expect, test } from "vitest"
import gameOfLife from "./navigation-details"

describe("NavigationDetails Component", () => {
  test("should define props", () => {
    expect(gameOfLife.linkTitle).toBe('Game of Life')
    expect(gameOfLife.linkUrl).toBe('game-of-life')
    expect(gameOfLife.title).toBe('Game of Life')
    expect(gameOfLife.previewUrl).toBe('/previews/game-of-life.gif')
  })
})