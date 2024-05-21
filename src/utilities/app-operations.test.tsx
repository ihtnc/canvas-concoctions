import { useSearchParams } from "next/navigation"
import { Mock, afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { useAppDisplay } from "./app-operations"

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn()
}))

describe("app operations", () => {
  describe("useAppDisplay function", () => {
    let searchParams = { has: vi.fn() }
    let useSearchParamsMock: Mock

    beforeEach(() => {
      useSearchParamsMock = useSearchParams as Mock
      useSearchParamsMock.mockReturnValue(searchParams)
    })

    afterEach(() => {
      vi.resetAllMocks()
    })

    test("should check search params for each app display property", () => {
      const result = useAppDisplay()

      const props = Object.getOwnPropertyNames(result)
      expect(props.length).toBeGreaterThan(0)
      expect(searchParams.has).toHaveBeenCalledTimes(props.length)
      props.forEach(key => {
        expect(searchParams.has).toHaveBeenCalledWith(`no-${key}`)
      })
    })

    test.each([
      { param: 'no-nav', value: true, expected: false },
      { param: 'no-nav', value: false, expected: true },
      { param: 'other', value: true, expected: true },
    ])("should set search param to nav property ($param | $value)", ({ param, value, expected }: { param: string, value: boolean, expected: boolean }) => {
      searchParams.has.mockImplementation((key: string) => key === param ? value : false)

      const result = useAppDisplay()
      expect(result.nav).toBe(expected)
    })

    test.each([
        { param: 'no-title', value: true, expected: false },
        { param: 'no-title', value: false, expected: true },
        { param: 'other', value: true, expected: true },
      ])("should set search param to title property ($param | $value)", ({ param, value, expected }: { param: string, value: boolean, expected: boolean }) => {
        searchParams.has.mockImplementation((key: string) => key === param ? value : false)

        const result = useAppDisplay()
        expect(result.title).toBe(expected)
      })
  })
})