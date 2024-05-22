import { describe, expect, test } from "vitest"
import tagVisualiser from "./navigation-details"

describe("NavigationDetails Component", () => {
  test("should define props", () => {
    expect(tagVisualiser.linkTitle).toBe('Tag Visualiser')
    expect(tagVisualiser.linkUrl).toBe('tag-visualiser')
    expect(tagVisualiser.title).toBe('Tag Visualiser')
    expect(tagVisualiser.previewUrl).toBeUndefined()
  })
})