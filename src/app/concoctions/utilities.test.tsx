import { describe, expect, test } from "vitest"
import { getConcoctions, getConcoction } from './utilities'

describe('concoction utilities', () => {
  describe('getConcoctions function', () => {
    test('should return an array of ConcoctionNavigation objects', () => {
      const result = getConcoctions()

      expect(result.length).toBe(3)
    })

    test('should include navigation details for sand-sim', () => {
      const result = getConcoctions()
      const sandSim = result.find(c => c.linkUrl === 'sand-sim')
      expect(sandSim).toBeDefined()
    })

    test('should include navigation details for tag-visualiser', () => {
      const result = getConcoctions()
      const tagVisualiser = result.find(c => c.linkUrl === 'tag-visualiser')
      expect(tagVisualiser).toBeDefined()
    })

    test('should include navigation details for game-of-life', () => {
      const result = getConcoctions()
      const gameOfLife = result.find(c => c.linkUrl === 'game-of-life')
      expect(gameOfLife).toBeDefined()
    })
  })

  describe('getConcoction function', () => {
    test('should return a ConcoctionNavigation object when a matching linkUrl is found', () => {
      const linkUrl = 'sand-sim'
      const result = getConcoction(linkUrl)
      expect(result).toBeDefined()
    })

    test('should return undefined when no matching linkUrl is found', () => {
      const linkUrl = 'non-existent-concoction'
      const result = getConcoction(linkUrl)
      expect(result).toBeUndefined()
    })
  })
})