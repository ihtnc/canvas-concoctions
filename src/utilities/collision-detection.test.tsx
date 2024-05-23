import { describe, expect, test } from "vitest"
import { checkOverlap } from "./collision-detection"

describe('checkOverlap function', () => {
  test('should return true when shapes overlap', () => {
    const shape1 = [{ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 10, y: 10 }, { x: 10, y: 0 }]
    const shape2 = [{ x: 5, y: 5 }, { x: 5, y: 15 }, { x: 15, y: 15 }, { x: 15, y: 5 }]

    const result = checkOverlap(shape1, shape2)

    expect(result).toBe(true)
  })

  test('should return false when shapes do not overlap', () => {
    const shape1 = [{ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 10, y: 10 }, { x: 10, y: 0 }]
    const shape2 = [{ x: 20, y: 20 }, { x: 20, y: 30 }, { x: 30, y: 30 }, { x: 30, y: 20 }]

    const result = checkOverlap(shape1, shape2)

    expect(result).toBe(false)
  })

  test('should return true when shapes are identical', () => {
    const shape1 = [{ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 10, y: 10 }, { x: 10, y: 0 }]
    const shape2 = [{ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 10, y: 10 }, { x: 10, y: 0 }]

    const result = checkOverlap(shape1, shape2)

    expect(result).toBe(true)
  })

  test('should return true when shapes share a vertex', () => {
    const shape1 = [{ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 10, y: 10 }, { x: 10, y: 0 }]
    const shape2 = [{ x: 10, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 10 }, { x: 20, y: 0 }]

    const result = checkOverlap(shape1, shape2)

    expect(result).toBe(true)
  })

  test('should return true when shapes overlap with concave shape', () => {
    const shape1 = [{ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 5, y: 5 }, { x: 10, y: 10 }, { x: 10, y: 0 }]
    const shape2 = [{ x: 5, y: 5 }, { x: 5, y: 15 }, { x: 15, y: 15 }, { x: 15, y: 5 }]

    const result = checkOverlap(shape1, shape2)

    expect(result).toBe(true)
  })

  test('should return false when shapes do not overlap with concave shape', () => {
    const shape1 = [{ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 5, y: 5 }, { x: 10, y: 10 }, { x: 10, y: 0 }]
    const shape2 = [{ x: 20, y: 20 }, { x: 20, y: 30 }, { x: 30, y: 30 }, { x: 30, y: 20 }]

    const result = checkOverlap(shape1, shape2)

    expect(result).toBe(false)
  })
})