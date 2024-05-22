import { describe, expect, test } from "vitest"
import sandSim from "./navigation-details"

describe("NavigationDetails Component", () => {
  test("should define props", () => {
    expect(sandSim.linkTitle).toBe('Sand Sim')
    expect(sandSim.linkUrl).toBe('sand-sim')
    expect(sandSim.title).toBe('Sand Simulation')
    expect(sandSim.previewUrl).toBe('/previews/sand-sim.gif')
  })
})