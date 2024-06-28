import { MockInstance, afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import {
  type MatrixValue,
  HResizeDirection,
  VResizeDirection,
  PeekDirection,
  initialise,
  resize,
  matrixPipeline,
  peek,
  copy,
  reset,
  diff,
  applyChanges,
  replaceValues,
  getUniqueValues
} from "./matrix-operations"
import * as miscOperations from './misc-operations'

describe('matrix-operations', () => {

  describe('initialise function', () => {
    test('should return a matrix', () => {
      const matrix = initialise(1, 1, 0)

      expect(matrix).toBeDefined()
      expect(matrix).not.toBeNull()
    })

    test('should return an appropriately sized matrix', () => {
      const row = 4
      const col = 5

      const matrix = initialise(row, col, 0)

      expect(matrix.length).toBe(row)
      matrix.forEach(row => expect(row.length).toBe(col))
    })

    test('should populate matrix with a specified value', () => {
      const row = 4
      const col = 5
      const defaultValue = 9

      const matrix = initialise(row, col, defaultValue)

      matrix.forEach(row => row.forEach(col => expect(col).toBe(defaultValue)))
    })
  })

  describe('resize function', () => {
    let matrix: MatrixValue<number>
    let initialRow: number, initialCol: number, initialValue: number

    beforeEach(() => {
      initialRow = 4
      initialCol = 5
      initialValue = 1
      matrix = initialise(initialRow, initialCol, initialValue)
    })

    test('should return a new matrix', () => {
      const resized = resize(matrix, initialRow + 2, initialCol + 2, 0)

      expect(resized).toBeDefined()
      expect(resized).not.toBeNull()
      expect(resized).not.toBe(matrix)
    })

    test('should return a bigger matrix if appropriately sized', () => {
      const row = initialRow + 2
      const col = initialCol + 2

      const resized = resize(matrix, row, col, 0)

      expect(resized.length).toBe(row)
      resized.forEach(row => expect(row.length).toBe(col))
    })

    test('should return a smaller matrix if appropriately sized', () => {
      const row = initialRow - 1
      const col = initialCol - 1

      const resized = resize(matrix, row, col, 0)

      expect(resized.length).toBe(row)
      resized.forEach(row => expect(row.length).toBe(col))
    })

    test('should not resize matrix if dimensions did not change', () => {
      const resized = resize(matrix, initialRow, initialCol, 0)

      expect(resized.length).toBe(initialRow)
      resized.forEach(row => expect(row.length).toBe(initialCol))
    })

    test('should keep existing matrix values', () => {
      const resized = resize(matrix, initialRow, initialCol, 0)

      expect(resized.length).not.toBe(0)
      resized.forEach(row => {
        expect(row.length).not.toBe(0)
        row.forEach(col => expect(col).toBe(initialValue))
      })
    })

    test.each([
      { additionalRow: 2, direction: HResizeDirection.Both, title: HResizeDirection[HResizeDirection.Both] },
      { additionalRow: 1, direction: HResizeDirection.Left, title: HResizeDirection[HResizeDirection.Left] },
      { additionalRow: 5, direction: HResizeDirection.Right, title: HResizeDirection[HResizeDirection.Right] }
    ])('should keep existing matrix at the bottom when new size is $additionalRow row(s) larger and resize direction is \'Up\' and $title',
    ({ additionalRow, direction }: { additionalRow: number, direction: HResizeDirection }) => {
      const newRow = initialRow + additionalRow

      const resized = resize(matrix, newRow, initialCol, 0, VResizeDirection.Up, direction)

      let expectedValue: number
      expect(resized.length).not.toBe(0)
      for(let row = 0; row < resized.length; row++) {
        expect(resized[row].length).not.toBe(0)

        const isOutOfBounds = row < additionalRow
        if (isOutOfBounds) { expectedValue = 0 }
        else { expectedValue = initialValue }

        for(let col = 0; col < resized[row].length; col++) {
          expect(resized[row][col]).toBe(expectedValue)
        }
      }
    })

    test.each([
      { truncateRow: 1, direction: HResizeDirection.Both, title: HResizeDirection[HResizeDirection.Both] },
      { truncateRow: 2, direction: HResizeDirection.Left, title: HResizeDirection[HResizeDirection.Left] },
      { truncateRow: 3, direction: HResizeDirection.Right, title: HResizeDirection[HResizeDirection.Right] }
    ])('should truncate matrix from the top when new size is $truncateRow row(s) smaller and resize direction is \'Up\' and $title',
    ({ truncateRow, direction }: { truncateRow: number, direction: HResizeDirection }) => {
      const newRow = initialRow - truncateRow

      const valueToTruncate = 9
      for(let row = 0; row + newRow < initialRow; row++) {
        for(let col = 0; col < initialCol; col++) {
          matrix[row][col] = valueToTruncate
        }
      }

      const resized = resize(matrix, newRow, initialCol, 0, VResizeDirection.Up, direction)

      expect(resized.length).not.toBe(0)
      for(let row = 0; row < resized.length; row++) {
        expect(resized[row].length).not.toBe(0)
        for(let col = 0; col < resized[row].length; col++) {
          expect(resized[row][col]).toBe(initialValue)
        }
      }
    })

    test.each([
      { additionalRow: 2, direction: HResizeDirection.Both, title: HResizeDirection[HResizeDirection.Both] },
      { additionalRow: 1, direction: HResizeDirection.Left, title: HResizeDirection[HResizeDirection.Left] },
      { additionalRow: 5, direction: HResizeDirection.Right, title: HResizeDirection[HResizeDirection.Right] }
    ])('should keep existing matrix at the top when new size is $additionalRow row(s) larger and resize direction is \'Down\' and $title',
    ({ additionalRow, direction }: { additionalRow: number, direction: HResizeDirection }) => {
      const newRow = initialRow + additionalRow

      const resized = resize(matrix, newRow, initialCol, 0, VResizeDirection.Down, direction)

      let expectedValue: number
      expect(resized.length).not.toBe(0)
      for(let row = 0; row < resized.length; row++) {
        expect(resized[row].length).not.toBe(0)

        const isOutOfBounds = row >= initialRow
        if (isOutOfBounds) { expectedValue = 0 }
        else { expectedValue = initialValue }

        for(let col = 0; col < resized[row].length; col++) {
          expect(resized[row][col]).toBe(expectedValue)
        }
      }
    })

    test.each([
      { truncateRow: 1, direction: HResizeDirection.Both, title: HResizeDirection[HResizeDirection.Both] },
      { truncateRow: 2, direction: HResizeDirection.Left, title: HResizeDirection[HResizeDirection.Left] },
      { truncateRow: 3, direction: HResizeDirection.Right, title: HResizeDirection[HResizeDirection.Right] }
    ])('should truncate matrix from the top when new size is $truncateRow row(s) smaller and resize direction is \'Down\' and $title',
    ({ truncateRow, direction }: { truncateRow: number, direction: HResizeDirection }) => {
      const newRow = initialRow - truncateRow

      const valueToTruncate = 9
      for(let row = newRow; row < initialRow; row++) {
        for(let col = 0; col < initialCol; col++) {
          matrix[row][col] = valueToTruncate
        }
      }

      const resized = resize(matrix, newRow, initialCol, 0, VResizeDirection.Down, direction)

      expect(resized.length).not.toBe(0)
      for(let row = 0; row < resized.length; row++) {
        expect(resized[row].length).not.toBe(0)
        for(let col = 0; col < resized[row].length; col++) {
          expect(resized[row][col]).toBe(initialValue)
        }
      }
    })

    test.each([
      { additionalRow: 2, direction: HResizeDirection.Both, title: HResizeDirection[HResizeDirection.Both] },
      { additionalRow: 1, direction: HResizeDirection.Left, title: HResizeDirection[HResizeDirection.Left] },
      { additionalRow: 5, direction: HResizeDirection.Right, title: HResizeDirection[HResizeDirection.Right] }
    ])('should keep existing matrix at the center when new size is $additionalRow row(s) larger and resize direction is \'Both\' and $title',
    ({ additionalRow, direction }: { additionalRow: number, direction: HResizeDirection }) => {
      const newRow = initialRow + additionalRow

      const resized = resize(matrix, newRow, initialCol, 0, VResizeDirection.Both, direction)

      let expectedValue: number
      expect(resized.length).not.toBe(0)
      for(let row = 0; row < resized.length; row++) {
        expect(resized[row].length).not.toBe(0)

        const additionalRowTop = Math.floor(-additionalRow / 2)
        const isOutOfBounds = (row + additionalRowTop < 0) || (row + additionalRowTop >= initialRow)
        if (isOutOfBounds) { expectedValue = 0 }
        else { expectedValue = initialValue }

        for(let col = 0; col < resized[row].length; col++) {
          expect(resized[row][col]).toBe(expectedValue)
        }
      }
    })

    test.each([
      { truncateRow: 1, direction: HResizeDirection.Both, title: HResizeDirection[HResizeDirection.Both] },
      { truncateRow: 2, direction: HResizeDirection.Left, title: HResizeDirection[HResizeDirection.Left] },
      { truncateRow: 3, direction: HResizeDirection.Right, title: HResizeDirection[HResizeDirection.Right] }
    ])('should truncate matrix from the top when new size is $truncateRow row(s) smaller and resize direction is \'Both\' and $title',
    ({ truncateRow, direction }: { truncateRow: number, direction: HResizeDirection }) => {
      const newRow = initialRow - truncateRow
      const truncateRowTop = Math.abs(Math.floor(-truncateRow / 2))
      const truncateRowBottom = truncateRow - truncateRowTop

      const valueToTruncate = 9
      for(let row = 0; row < initialRow; row++) {
        const forTopTruncation = row - truncateRowTop < 0
        const forBottomTruncation = row >= initialRow - truncateRowBottom

        for(let col = 0; col < initialCol; col++) {
          if(forTopTruncation || forBottomTruncation) {
            matrix[row][col] = valueToTruncate
          }
        }
      }

      const resized = resize(matrix, newRow, initialCol, 0, VResizeDirection.Both, direction)

      expect(resized.length).not.toBe(0)
      for(let row = 0; row < resized.length; row++) {
        expect(resized[row].length).not.toBe(0)
        for(let col = 0; col < resized[row].length; col++) {
          expect(resized[row][col]).toBe(initialValue)
        }
      }
    })

    test('should return an empty array if new row is 0', () => {
      const resized = resize(matrix, 0, initialCol, 0)
      expect(resized.length).toBe(0)
    })

    test.each([
      { additionalCol: 2, direction: VResizeDirection.Both, title: VResizeDirection[VResizeDirection.Both] },
      { additionalCol: 1, direction: VResizeDirection.Up, title: VResizeDirection[VResizeDirection.Up] },
      { additionalCol: 10, direction: VResizeDirection.Down, title: VResizeDirection[VResizeDirection.Down] }
    ])('should keep existing matrix at the left when new size is $additionalCol column(s) larger and resize direction is $title and \'Right\'',
    ({ additionalCol, direction }: { additionalCol: number, direction: VResizeDirection }) => {
      const newCol = initialCol + additionalCol

      const resized = resize(matrix, initialRow, newCol, 0, direction, HResizeDirection.Right)

      let expectedValue: number
      expect(resized.length).not.toBe(0)
      for(let row = 0; row < resized.length; row++) {
        expect(resized[row].length).not.toBe(0)
        for(let col = 0; col < resized[row].length; col++) {
          const isOutOfBounds = col >= resized[row].length - additionalCol
          if (isOutOfBounds) { expectedValue = 0 }
          else { expectedValue = initialValue }

          expect(resized[row][col]).toBe(expectedValue)
        }
      }
    })

    test.each([
      { truncateCol: 1, direction: VResizeDirection.Both, title: VResizeDirection[VResizeDirection.Both] },
      { truncateCol: 2, direction: VResizeDirection.Up, title: VResizeDirection[VResizeDirection.Up] },
      { truncateCol: 3, direction: VResizeDirection.Down, title: VResizeDirection[VResizeDirection.Down] }
    ])('should truncate matrix from the right when new size is $truncateCol column(s) smaller and resize direction is $title and \'Right\'',
    ({ truncateCol, direction }: { truncateCol: number, direction: VResizeDirection }) => {
      const newCol = initialCol - truncateCol

      const valueToTruncate = 9
      for(let row = 0; row < initialRow; row++) {
        for(let col = newCol; col < initialCol; col++) {
          matrix[row][col] = valueToTruncate
        }
      }

      const resized = resize(matrix, initialRow, newCol, 0, direction, HResizeDirection.Right)

      expect(resized.length).not.toBe(0)
      for(let row = 0; row < resized.length; row++) {
        expect(resized[row].length).not.toBe(0)
        for(let col = 0; col < resized[row].length; col++) {
          expect(resized[row][col]).toBe(initialValue)
        }
      }
    })

    test.each([
      { additionalCol: 2, direction: VResizeDirection.Both, title: VResizeDirection[VResizeDirection.Both] },
      { additionalCol: 1, direction: VResizeDirection.Both, title: VResizeDirection[VResizeDirection.Both] },
      { additionalCol: 10, direction: VResizeDirection.Both, title: VResizeDirection[VResizeDirection.Both] }
    ])('should keep existing matrix at the right when new size is $additionalCol column(s) larger and resize direction is $title and \'Left\'',
    ({ additionalCol, direction }: { additionalCol: number, direction: VResizeDirection }) => {
      const newCol = initialCol + additionalCol

      const resized = resize(matrix, initialRow, newCol, 0, direction, HResizeDirection.Left)

      let expectedValue: number
      expect(resized.length).not.toBe(0)
      for(let row = 0; row < resized.length; row++) {
        expect(resized[row].length).not.toBe(0)
        for(let col = 0; col < resized[row].length; col++) {
          const isOutOfBounds = col < additionalCol
        if (isOutOfBounds) { expectedValue = 0 }
          else { expectedValue = initialValue }

          expect(resized[row][col]).toBe(expectedValue)
        }
     }
    })

    test.each([
      { truncateCol: 1, direction: VResizeDirection.Both, title: VResizeDirection[VResizeDirection.Both] },
      { truncateCol: 2, direction: VResizeDirection.Up, title: VResizeDirection[VResizeDirection.Up] },
      { truncateCol: 3, direction: VResizeDirection.Down, title: VResizeDirection[VResizeDirection.Down] }
    ])('should truncate matrix from the left when new size is $truncateCol column(s) smaller and resize direction is $title and \'Left\'',
    ({ truncateCol, direction }: { truncateCol: number, direction: VResizeDirection }) => {
      const newCol = initialCol - truncateCol

      const valueToTruncate = 9
      for(let row = 0; row < initialRow; row++) {
        for(let col = 0; col < truncateCol; col++) {
          matrix[row][col] = valueToTruncate
        }
      }

      const resized = resize(matrix, initialRow, newCol, 0, direction, HResizeDirection.Left)

      expect(resized.length).not.toBe(0)
      for(let row = 0; row < resized.length; row++) {
        expect(resized[row].length).not.toBe(0)
        for(let col = 0; col < resized[row].length; col++) {
          expect(resized[row][col]).toBe(initialValue)
        }
      }
    })

    test.each([
      { additionalCol: 2, direction: VResizeDirection.Both, title: VResizeDirection[VResizeDirection.Both] },
      { additionalCol: 1, direction: VResizeDirection.Up, title: VResizeDirection[VResizeDirection.Up] },
      { additionalCol: 10, direction: VResizeDirection.Down, title: VResizeDirection[VResizeDirection.Down] }
    ])('should keep existing matrix at the center when new size is $additionalCol column(s) larger and resize direction is $title and \'Both\'',
    ({ additionalCol, direction }: { additionalCol: number, direction: VResizeDirection }) => {
      const newCol = initialCol + additionalCol

      const resized = resize(matrix, initialRow, newCol, 0, direction, HResizeDirection.Both)

      let expectedValue: number
      expect(resized.length).not.toBe(0)
      for(let row = 0; row < resized.length; row++) {
        expect(resized[row].length).not.toBe(0)
        for(let col = 0; col < resized[row].length; col++) {
          const additionalColLeft = Math.floor(-additionalCol / 2)
          const isOutOfBounds = (col + additionalColLeft < 0) || (col + additionalColLeft >= initialCol)
          if (isOutOfBounds) { expectedValue = 0 }
          else { expectedValue = initialValue }

          expect(resized[row][col]).toBe(expectedValue)
        }
     }
    })

    test.each([
      { truncateCol: 1, direction: VResizeDirection.Both, title: VResizeDirection[VResizeDirection.Both] },
      { truncateCol: 2, direction: VResizeDirection.Up, title: VResizeDirection[VResizeDirection.Up] },
      { truncateCol: 3, direction: VResizeDirection.Down, title: VResizeDirection[VResizeDirection.Down] }
    ])('should truncate matrix from the left when new size is $truncateCol column(s) smaller and resize direction is $title and \'Both\'',
    ({ truncateCol, direction }: { truncateCol: number, direction: VResizeDirection }) => {
      const newCol = initialCol - truncateCol
      const truncateColLeft = Math.abs(Math.floor(-truncateCol / 2))
      const truncateColRight = truncateCol - truncateColLeft

      const valueToTruncate = 9
      for(let row = 0; row < initialRow; row++) {
        for(let col = 0; col < initialCol; col++) {
          const forLeftTruncation = col - truncateColLeft < 0
          const forRightTruncation = col >= initialCol - truncateColRight
          if(forLeftTruncation || forRightTruncation) {
            matrix[row][col] = valueToTruncate
          }
        }
      }

      const resized = resize(matrix, initialRow, newCol, 0, direction, HResizeDirection.Both)

      expect(resized.length).not.toBe(0)
      for(let row = 0; row < resized.length; row++) {
        expect(resized[row].length).not.toBe(0)
        for(let col = 0; col < resized[row].length; col++) {
          expect(resized[row][col]).toBe(initialValue)
        }
      }
    })

    test('should return an array of empty arrays if new column is 0', () => {
      const resized = resize(matrix, initialRow, 0, 0)

      expect(resized.length).toBe(initialRow)
      resized.forEach(col => expect(col.length).toBe(0))
    })
  })

  describe('matrixPipeline function', () => {
    let operationPipeline: MockInstance

    afterEach(() => {
      vi.restoreAllMocks()
    })

    beforeEach(() => {
      operationPipeline = vi.spyOn(miscOperations, 'operationPipeline')
    })

    test('should call operationPipeline', () => {
      const fn1 = vi.fn()
      const fn2 = vi.fn()
      const fn3 = vi.fn()

      matrixPipeline([
        fn1,
        fn2,
        fn3
      ])

      expect(operationPipeline).toHaveBeenCalledWith([fn1, fn2, fn3])
    })
  })

  describe('peek function', () => {
    let matrix: MatrixValue<number>

    beforeEach(() => {
      matrix = [
        [1,2,3],
        [4,5,6],
        [7,8,9]
      ]
    })

    test.each([
      { peekDirection: PeekDirection.UpperLeft, expectedValue: 1, title: PeekDirection[PeekDirection.UpperLeft] },
      { peekDirection: PeekDirection.Up, expectedValue: 2, title: PeekDirection[PeekDirection.Up] },
      { peekDirection: PeekDirection.UpperRight, expectedValue: 3, title: PeekDirection[PeekDirection.UpperRight] },
      { peekDirection: PeekDirection.Left, expectedValue: 4, title: PeekDirection[PeekDirection.Left] },
      { peekDirection: PeekDirection.Right, expectedValue: 6, title: PeekDirection[PeekDirection.Right] },
      { peekDirection: PeekDirection.LowerLeft, expectedValue: 7, title: PeekDirection[PeekDirection.LowerLeft] },
      { peekDirection: PeekDirection.Down, expectedValue: 8, title: PeekDirection[PeekDirection.Down] },
      { peekDirection: PeekDirection.LowerRight, expectedValue: 9, title: PeekDirection[PeekDirection.LowerRight] }
    ])('should return correctly when PeekDirection is $title', ({ peekDirection, expectedValue }: { peekDirection: PeekDirection, expectedValue: number }) => {
      const value = peek(matrix, { row: 1, col: 1 }, peekDirection)
      expect(value).toBe(expectedValue)
    })

    test.each([
      { peekDirection: PeekDirection.UpperLeft, title: PeekDirection[PeekDirection.UpperLeft] },
      { peekDirection: PeekDirection.Up, title: PeekDirection[PeekDirection.Up] },
      { peekDirection: PeekDirection.UpperRight, title: PeekDirection[PeekDirection.UpperRight] },
      { peekDirection: PeekDirection.Left, title: PeekDirection[PeekDirection.Left] },
      { peekDirection: PeekDirection.Right, title: PeekDirection[PeekDirection.Right] },
      { peekDirection: PeekDirection.LowerLeft, title: PeekDirection[PeekDirection.LowerLeft] },
      { peekDirection: PeekDirection.Down, title: PeekDirection[PeekDirection.Down] },
      { peekDirection: PeekDirection.LowerRight, title: PeekDirection[PeekDirection.LowerRight] }
    ])('should return undefined when row is less than 0 and PeekDirection is $title', ({ peekDirection }: { peekDirection: PeekDirection }) => {
      const value = peek(matrix, { row: -1, col: 1 }, peekDirection)
      expect(value).toBeUndefined()
    })

    test.each([
      { peekDirection: PeekDirection.UpperLeft, title: PeekDirection[PeekDirection.UpperLeft] },
      { peekDirection: PeekDirection.Up, title: PeekDirection[PeekDirection.Up] },
      { peekDirection: PeekDirection.UpperRight, title: PeekDirection[PeekDirection.UpperRight] },
      { peekDirection: PeekDirection.Left, title: PeekDirection[PeekDirection.Left] },
      { peekDirection: PeekDirection.Right, title: PeekDirection[PeekDirection.Right] },
      { peekDirection: PeekDirection.LowerLeft, title: PeekDirection[PeekDirection.LowerLeft] },
      { peekDirection: PeekDirection.Down, title: PeekDirection[PeekDirection.Down] },
      { peekDirection: PeekDirection.LowerRight, title: PeekDirection[PeekDirection.LowerRight] }
    ])('should return undefined when row is greater than or equal to matrix.length and PeekDirection is $title', ({ peekDirection }: { peekDirection: PeekDirection }) => {
      const value = peek(matrix, { row: matrix.length, col: 1 }, peekDirection)
      expect(value).toBeUndefined()
    })

    test.each([
      { peekDirection: PeekDirection.UpperLeft, title: PeekDirection[PeekDirection.UpperLeft] },
      { peekDirection: PeekDirection.Up, title: PeekDirection[PeekDirection.Up] },
      { peekDirection: PeekDirection.UpperRight, title: PeekDirection[PeekDirection.UpperRight] },
      { peekDirection: PeekDirection.Left, title: PeekDirection[PeekDirection.Left] },
      { peekDirection: PeekDirection.Right, title: PeekDirection[PeekDirection.Right] },
      { peekDirection: PeekDirection.LowerLeft, title: PeekDirection[PeekDirection.LowerLeft] },
      { peekDirection: PeekDirection.Down, title: PeekDirection[PeekDirection.Down] },
      { peekDirection: PeekDirection.LowerRight, title: PeekDirection[PeekDirection.LowerRight] }
    ])('should return undefined when col is less than 0 and PeekDirection is $title', ({ peekDirection }: { peekDirection: PeekDirection }) => {
      const value = peek(matrix, { row: 1, col: -1 }, peekDirection)
      expect(value).toBeUndefined()
    })

    test.each([
      { peekDirection: PeekDirection.UpperLeft, title: PeekDirection[PeekDirection.UpperLeft] },
      { peekDirection: PeekDirection.Up, title: PeekDirection[PeekDirection.Up] },
      { peekDirection: PeekDirection.UpperRight, title: PeekDirection[PeekDirection.UpperRight] },
      { peekDirection: PeekDirection.Left, title: PeekDirection[PeekDirection.Left] },
      { peekDirection: PeekDirection.Right, title: PeekDirection[PeekDirection.Right] },
      { peekDirection: PeekDirection.LowerLeft, title: PeekDirection[PeekDirection.LowerLeft] },
      { peekDirection: PeekDirection.Down, title: PeekDirection[PeekDirection.Down] },
      { peekDirection: PeekDirection.LowerRight, title: PeekDirection[PeekDirection.LowerRight] }
    ])('should return undefined when col is greater than or equal to matrix[].length and PeekDirection is $title', ({ peekDirection }: { peekDirection: PeekDirection }) => {
      const value = peek(matrix, { row: 1, col: matrix[1].length }, peekDirection)
      expect(value).toBeUndefined()
    })

    test.each([
      { col: 0, peekDirection: PeekDirection.UpperLeft, title: PeekDirection[PeekDirection.UpperLeft] },
      { col: 1, peekDirection: PeekDirection.Up, title: PeekDirection[PeekDirection.Up] },
      { col: 2, peekDirection: PeekDirection.UpperRight, title: PeekDirection[PeekDirection.UpperRight] },
    ])('should return undefined when row is 0 and PeekDirection is $title', ({ col, peekDirection }: { col: number, peekDirection: PeekDirection }) => {
      const value = peek(matrix, { row: 0, col }, peekDirection)
      expect(value).toBeUndefined()
    })

    test.each([
      { row: 1 },
      { row: 2 },
      { row: 0 },
    ])('should return undefined when col is 0 and PeekDirection is \'Left\'', ({ row }: { row: number }) => {
      const value = peek(matrix, { row, col: 0 }, PeekDirection.Left)
      expect(value).toBeUndefined()
    })

    test.each([
      { row: 1 },
      { row: 2 },
      { row: 0 },
    ])('should return undefined when col is matrix[].length - 1 and PeekDirection is \'Right\'', ({ row }: { row: number }) => {
      const value = peek(matrix, { row, col: matrix[row].length }, PeekDirection.Right)
      expect(value).toBeUndefined()
    })

    test.each([
      { col: 2, peekDirection: PeekDirection.LowerLeft, title: PeekDirection[PeekDirection.UpperLeft] },
      { col: 0, peekDirection: PeekDirection.Down, title: PeekDirection[PeekDirection.Up] },
      { col: 1, peekDirection: PeekDirection.LowerRight, title: PeekDirection[PeekDirection.UpperRight] },
    ])('should return undefined when row is matrix.length - 1 and PeekDirection is $title', ({ col, peekDirection }: { col: number, peekDirection: PeekDirection }) => {
      const value = peek(matrix, { row: matrix.length - 1, col }, peekDirection)
      expect(value).toBeUndefined()
    })

    test.each([
      { row: 1, col: 2, peekDirection: PeekDirection.UpperLeft, expectedValue: 2, title: PeekDirection[PeekDirection.UpperLeft] },
      { row: 2, col: 0, peekDirection: PeekDirection.Up, expectedValue: 4, title: PeekDirection[PeekDirection.Up] },
      { row: 2, col: 1, peekDirection: PeekDirection.UpperRight, expectedValue: 6, title: PeekDirection[PeekDirection.UpperRight] },
      { row: 2, col: 1, peekDirection: PeekDirection.Left, expectedValue: 7, title: PeekDirection[PeekDirection.Left] },
      { row: 1, col: 0, peekDirection: PeekDirection.Right, expectedValue: 5, title: PeekDirection[PeekDirection.Right] },
      { row: 1, col: 1, peekDirection: PeekDirection.LowerLeft, expectedValue: 7, title: PeekDirection[PeekDirection.LowerLeft] },
      { row: 0, col: 2, peekDirection: PeekDirection.Down, expectedValue: 6, title: PeekDirection[PeekDirection.Down] },
      { row: 0, col: 0, peekDirection: PeekDirection.LowerRight, expectedValue: 5, title: PeekDirection[PeekDirection.LowerRight] }
    ])('should return correctly when row is $row, col is $col, and PeekDirection is $title', ({ row, col, peekDirection, expectedValue }: { row: number, col: number, peekDirection: PeekDirection, expectedValue: number }) => {
      const value = peek(matrix, { row, col }, peekDirection)
      expect(value).toBe(expectedValue)
    })
  })

  describe('copy function', () => {
    let matrix: MatrixValue<number>

    beforeEach(() => {
      matrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ]
    })

    test('should return new object', () => {
      const sameMatrix = matrix
      const copyMatrix = copy(matrix)
      expect(sameMatrix).toBe(matrix)
      expect(copyMatrix).not.toBe(matrix)
    })

    test('should copy each value', () => {
      const copyMatrix = copy(matrix)

      expect(copyMatrix.length).toBe(matrix.length)
      for (let i = 0; i < copyMatrix.length; i++) {
        expect(copyMatrix[i].length).toBe(matrix[i].length)
        for (let j = 0; j < copyMatrix[i].length; j++) {
          expect(copyMatrix[i][j]).toBe(matrix[i][j])
        }
      }
    })
  })

  describe('reset function', () => {
    let matrix: MatrixValue<number>

    beforeEach(() => {
      matrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ]
    })

    test('should return same object', () => {
      const sameMatrix = matrix
      const resetMatrix = reset(matrix, 0)
      expect(sameMatrix).toBe(matrix)
      expect(resetMatrix).toBe(matrix)
    })

    test('should reset each value', () => {
      const resetValue = -1
      const resetMatrix = reset(matrix, resetValue)

      expect(resetMatrix.length).toBe(matrix.length)
      for (let i = 0; i < resetMatrix.length; i++) {
        expect(resetMatrix[i].length).toBe(matrix[i].length)
        for (let j = 0; j < resetMatrix[i].length; j++) {
          expect(resetMatrix[i][j]).toBe(resetValue)
        }
      }
    })
  })

  describe('diff function', () => {
    let matrix: MatrixValue<number>

    beforeEach(() => {
      matrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ]
    })

    test('should return new object', () => {
      const sameMatrix = matrix
      const diffMatrix = diff(matrix, matrix)
      expect(sameMatrix).toBe(matrix)
      expect(diffMatrix).not.toBe(matrix)
    })

    test('should return a matrix with 0s when calculating diff between matrix and itself', () => {
      const diffMatrix = diff(matrix, matrix)

      expect(diffMatrix.length).toBe(matrix.length)
      for (let i = 0; i < diffMatrix.length; i++) {
        expect(diffMatrix[i].length).toBe(matrix[i].length)
        for (let j = 0; j < diffMatrix[i].length; j++) {
          expect(diffMatrix[i][j]).toBe(0)
        }
      }
    })

    test('should return a matrix with same values when calculating diff between matrix and a matrix with 0s', () => {
      const emptyMatrix = matrixPipeline([
        copy,
        (value) => reset(value as MatrixValue<number>, 0) as typeof value
      ]).run(matrix)
      const diffMatrix = diff(emptyMatrix, matrix)

      expect(diffMatrix.length).toBe(matrix.length)
      for (let i = 0; i < diffMatrix.length; i++) {
        expect(diffMatrix[i].length).toBe(matrix[i].length)
        for (let j = 0; j < diffMatrix[i].length; j++) {
          expect(diffMatrix[i][j]).toBe(matrix[i][j])
        }
      }
    })

    test('should return a matrix with negative values when calculating diff between a matrix with 0s and a matrix', () => {
      const emptyMatrix = matrixPipeline([
        copy,
        (value) => reset(value as MatrixValue<number>, 0) as typeof value
      ]).run(matrix)
      const diffMatrix = diff(matrix, emptyMatrix)

      expect(diffMatrix.length).toBe(matrix.length)
      for (let i = 0; i < diffMatrix.length; i++) {
        expect(diffMatrix[i].length).toBe(matrix[i].length)
        for (let j = 0; j < diffMatrix[i].length; j++) {
          expect(diffMatrix[i][j]).toBe(-matrix[i][j])
        }
      }
    })

    test('should return a copy of target matrix when matrix and target have different matrix lengths', () => {
      const otherMatrix: MatrixValue<number> = []
      for (let i = 0; i < matrix.length + 1; i++) {
        otherMatrix[i] = []
        for (let j = 0; i < matrix.length && j < matrix[i].length; j++) {
          otherMatrix[i][j] = i+j
        }
      }

      const diffMatrix = diff(matrix, otherMatrix)

      expect(diffMatrix).not.toBe(otherMatrix)
      expect(diffMatrix.length).toBe(otherMatrix.length)
      for (let i = 0; i < diffMatrix.length; i++) {
        expect(diffMatrix[i].length).toBe(otherMatrix[i].length)
        for (let j = 0; j < diffMatrix[i].length; j++) {
          expect(diffMatrix[i][j]).toBe(otherMatrix[i][j])
        }
      }
    })

    test('should return a copy of target matrix when matrix and target have different matrix[].lengths', () => {
      const otherMatrix: MatrixValue<number> = []
      for (let i = 0; i < matrix.length; i++) {
        otherMatrix[i] = []
        for (let j = 0; j < matrix[i].length + 1; j++) {
          otherMatrix[i][j] = i+j
        }
      }

      const diffMatrix = diff(matrix, otherMatrix)

      expect(diffMatrix).not.toBe(otherMatrix)
      expect(diffMatrix.length).toBe(otherMatrix.length)
      for (let i = 0; i < diffMatrix.length; i++) {
        expect(diffMatrix[i].length).toBe(otherMatrix[i].length)
        for (let j = 0; j < diffMatrix[i].length; j++) {
          expect(diffMatrix[i][j]).toBe(otherMatrix[i][j])
        }
      }
    })

    test('should return a matrix with only the diff', () => {
      const otherMatrix = copy(matrix)
      const diffRow = matrix.length - 1
      const diffCol = 0
      const newValue = 9
      otherMatrix[diffRow][diffCol] = newValue
      const expectedDiff = otherMatrix[diffRow][diffCol] - matrix[diffRow][diffCol]

      const diffMatrix = diff(matrix, otherMatrix)

      expect(diffMatrix.length).toBe(otherMatrix.length)
      for (let i = 0; i < diffMatrix.length; i++) {
        expect(diffMatrix[i].length).toBe(otherMatrix[i].length)
        for (let j = 0; j < diffMatrix[i].length; j++) {
          let expected: number = (i === diffRow && j === diffCol)
            ? expectedDiff
            : 0

          expect(diffMatrix[i][j]).toBe(expected)
        }
      }
    })
  })

  describe('applyChanges function', () => {
    let matrix: MatrixValue<number>

    beforeEach(() => {
      matrix = [
        [0, 2, 3],
        [4, 5, 0],
        [7, 0, 9]
      ]
    })

    test('should return original object', () => {
      const sameMatrix = matrix
      const copyMatrix = copy(matrix)
      const applyMatrix = applyChanges(matrix, copyMatrix, 0)
      expect(sameMatrix).toBe(matrix)
      expect(applyMatrix).toBe(matrix)
    })

    test('should not apply any changes when the two matrices have different matrix lengths', () => {
      const changes: MatrixValue<number> = []
      for (let i = 0; i < matrix.length + 1; i++) {
        changes[i] = []
        for (let j = 0; i < matrix.length && j < matrix[i].length; j++) {
          changes[i][j] = i+j
        }
      }

      const copyMatrix = copy(matrix)
      const applyMatrix = applyChanges(matrix, changes, 0)

      for (let i = 0; i < applyMatrix.length; i++) {
        for (let j = 0; j < applyMatrix[i].length; j++) {
          expect(applyMatrix[i][j]).toBe(copyMatrix[i][j])
        }
      }
    })

    test('should not apply any changes when the two matrices have different matrix[].lengths', () => {
      const changes: MatrixValue<number> = []
      for (let i = 0; i < matrix.length; i++) {
        changes[i] = []
        for (let j = 0; j < matrix[i].length + 1; j++) {
          changes[i][j] = i+j
        }
      }

      const copyMatrix = copy(matrix)
      const applyMatrix = applyChanges(matrix, changes, 0)

      for (let i = 0; i < applyMatrix.length; i++) {
        for (let j = 0; j < applyMatrix[i].length; j++) {
          expect(applyMatrix[i][j]).toBe(copyMatrix[i][j])
        }
      }
    })

    test('should apply changes using specific ignore value', () => {
      const ignoreValue = 10
      const changes  = matrixPipeline([
        copy,
        (value) => reset(value as MatrixValue<number>, 0) as typeof value
      ]).run(matrix)

      for (let i = 0; i < changes.length; i++) {
        for (let j = 0; j < changes[i].length; j++) {
          changes[i][j] = ignoreValue
        }
      }

      const changeRow = matrix.length - 1
      const changeCol = 0
      const newValue = 11
      changes[changeRow][changeCol] = newValue

      const applyMatrix = applyChanges(matrix, changes, ignoreValue)

      for (let i = 0; i < applyMatrix.length; i++) {
        for (let j = 0; j < applyMatrix[i].length; j++) {
          let expected: number = (i === changeRow && j === changeCol)
            ? newValue
            : matrix[i][j]

          expect(applyMatrix[i][j]).toBe(expected)
        }
      }
    })
  })

  describe('replaceValues function', () => {
    let matrix: MatrixValue<number>

    beforeEach(() => {
      matrix = [
        [0, 2, 3],
        [4, 5, 0],
        [7, 0, 9]
      ]
    })

    test('should return original object', () => {
      const sameMatrix = matrix
      const replaceMatrix = replaceValues(matrix, 0, 1)
      expect(sameMatrix).toBe(matrix)
      expect(replaceMatrix).toBe(matrix)
    })

    test('should replace values in matrix when value is supplied in search', () => {
      const search = 0
      const replacement = 6

      const replaced = replaceValues(matrix, search, replacement)

      for (let i = 0; i < replaced.length; i++) {
        for (let j = 0; j < replaced[i].length; j++) {
          expect(replaced[i][j]).not.toBe(0)
        }
      }
      expect(replaced[0][0]).toBe(replacement)
      expect(replaced[1][2]).toBe(replacement)
      expect(replaced[2][1]).toBe(replacement)
    })

    test('should call function for each item in matrix when function is supplied in search', () => {
      const search = vi.fn()

      for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
          matrix[i][j] = (i * matrix.length) + j + 1
        }
      }

      const replaced = replaceValues(matrix, search, 99)

      let expectedCalls = 0
      for (let i = 0; i < replaced.length; i++) {
        for (let j = 0; j < replaced[i].length; j++) {
          expect(search).toHaveBeenNthCalledWith(replaced[i][j], replaced[i][j])
          expectedCalls++
        }
      }
      expect(search).toHaveBeenCalledTimes(expectedCalls)
    })

    test('should replace values in matrix when function returns true', () => {
      const search = (value: number) => value % 2 === 0
      const replacement = 99

      for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
          matrix[i][j] = (i * matrix.length) + j + 1
        }
      }

      const replaced = replaceValues(matrix, search, replacement)

      for (let i = 0; i < replaced.length; i++) {
        for (let j = 0; j < replaced[i].length; j++) {
          expect(replaced[i][j] % 2).not.toBe(0)

          const original = (i * matrix.length) + j + 1
          if (original % 2 !== 0) { continue }
          expect(replaced[i][j]).toBe(replacement)
        }
      }
    })

    test('should call deepCopy when replacing values in matrix', () => {
      const search = 2
      const replacement = 99

      vi.spyOn(miscOperations, 'deepCopy')

      replaceValues(matrix, search, replacement)

      expect(miscOperations.deepCopy).toHaveBeenCalledOnce()
      expect(miscOperations.deepCopy).toHaveBeenCalledWith(replacement)

      vi.restoreAllMocks()
    })
  })

  describe('getUniqueValues function', () => {
    let matrix: MatrixValue<number>

    beforeEach(() => {
      matrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ]
    })

    test('should return an empty array when matrix is empty', () => {
      const uniqueValues = getUniqueValues([])
      expect(uniqueValues).toEqual([])
    })

    test('should return an array of unique values in matrix', () => {
      const expected = matrix.flat()
      const uniqueValues = getUniqueValues(matrix)
      expect(uniqueValues).toEqual(expected)
    })

    test('should return an array of unique values in matrix when matrix has duplicate values', () => {
      matrix = [
        [1, 2, 3],
        [1, 2, 3],
        [1, 2, 3]
      ]
      const expected = [1, 2, 3]

      const uniqueValues = getUniqueValues(matrix)
      expect(uniqueValues).toEqual(expected)
    })

    test('should not include ignoreValue', () => {
      matrix = [
        [1, 2, 3],
        [4, 5, 1],
        [6, 1, 7]
      ]
      const expected = [2, 3, 4, 5, 6, 7]

      const uniqueValues = getUniqueValues(matrix, 1)
      expect(uniqueValues).toEqual(expected)
    })

    test('should call function for each item in matrix when uniqueFn is supplied', () => {
      const uniqueFn = vi.fn()

      getUniqueValues(matrix, undefined, uniqueFn)

      let expectedCalls = 0
      for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
          expect(uniqueFn).toHaveBeenNthCalledWith(matrix[i][j], matrix, matrix[i][j])
          expectedCalls++
        }
      }
      expect(uniqueFn).toHaveBeenCalledTimes(expectedCalls)
    })

    test('should determine uniqueness based on uniqueFn', () => {
      const uniqueFn = vi.fn().mockReturnValue(false)

      const unique = getUniqueValues(matrix, undefined, uniqueFn)

      expect(unique).toEqual([])
    })
  })
})