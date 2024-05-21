import { render } from '@testing-library/react'
import ConcoctionsTemplate from './template'
import { Mock, afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { getConcoction } from './utilities'
import { useSelectedLayoutSegment } from 'next/navigation'
import { useAppDisplay } from '@/utilities/app-operations'

vi.mock('./utilities', () => ({
  getConcoction: vi.fn()
}))

vi.mock('next/navigation', () => ({
  useSelectedLayoutSegment: vi.fn()
}))

vi.mock('@/utilities/app-operations', () => ({
  useAppDisplay: vi.fn()
}))

describe('ConcoctionsTemplate component', () => {
  let getConcoctionMock: Mock
  let appDisplay = { title: true }
  let useAppDisplayMock: Mock
  let useSelectedLayoutSegmentMock: Mock

  beforeEach(() => {
    getConcoctionMock = getConcoction as Mock

    appDisplay = { title: true }
    useAppDisplayMock = useAppDisplay as Mock
    useAppDisplayMock.mockReturnValue(appDisplay)

    useSelectedLayoutSegmentMock = useSelectedLayoutSegment as Mock
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should try to get title of current concoction', () => {
    const segment = 'test-concoction'
    useSelectedLayoutSegmentMock.mockReturnValue(segment)

    render(<ConcoctionsTemplate><></></ConcoctionsTemplate>)

    expect(useSelectedLayoutSegment).toHaveBeenCalled()
    expect(getConcoction).toHaveBeenCalledWith(segment)
  })

  test('should check for app display status', () => {
    render(<ConcoctionsTemplate><></></ConcoctionsTemplate>)

    expect(useAppDisplay).toHaveBeenCalled()
  })

  test('should render the title of the current concoction correctly', () => {
    getConcoctionMock.mockReturnValue({ title: 'Test Concoction' })

    const { container } = render(<ConcoctionsTemplate><></></ConcoctionsTemplate>)

    expect(container).toMatchSnapshot()
  })

  test('should render the title of the current concoction if it is not recognised', () => {
    getConcoctionMock.mockReturnValue(undefined)

    const { container } = render(<ConcoctionsTemplate><></></ConcoctionsTemplate>)

    expect(container).toMatchSnapshot()
  })

  test('should render the children correctly', () => {
    const { container } = render(<ConcoctionsTemplate><>Test Content</></ConcoctionsTemplate>)
    expect(container).toMatchSnapshot()
  })

  test('should not render title if title is hidden in app display', () => {
    appDisplay.title = false
    getConcoctionMock.mockReturnValue({ title: 'Test Concoction' })

    const { container } = render(<ConcoctionsTemplate><>Test Content</></ConcoctionsTemplate>)

    expect(container).toMatchSnapshot()
  })
})