import { describe, expect, test } from "vitest"
import tankGame from "./navigation-details"

describe("NavigationDetails Component", () => {
  test("should define props", () => {
    expect(tankGame.linkTitle).toBe('Tank Game')
    expect(tankGame.linkUrl).toBe('tank-game')
    expect(tankGame.title).toBe('Tank Game')
    expect(tankGame.previewUrl).toBe('/previews/tank-game.gif')
  })
})