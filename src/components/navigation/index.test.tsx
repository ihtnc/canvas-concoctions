import { render, screen } from '@testing-library/react'
import Navigation from './index'
import { Mock, afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { usePathname } from 'next/navigation'
import { getConcoctions } from '@/app/concoctions/utilities'
import { useAppDisplay } from '@/utilities/app-operations'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn()
}))

vi.mock('@/app/concoctions/utilities', () => ({
  getConcoctions: vi.fn()
}))

vi.mock('@/utilities/app-operations', () => ({
  useAppDisplay: vi.fn()
}))

vi.mock('./nav-item', () => ({
  default: (props: any) => <div>{JSON.stringify(props)}</div>
}))

describe('Navigation component', () => {
  let usePathnameMock: Mock
  let appDisplay = { nav: true }
  let useAppDisplayMock: Mock
  let getConcoctionsMock: Mock

  beforeEach(() => {
    usePathnameMock = usePathname as Mock
    usePathnameMock.mockReturnValue('')

    appDisplay = { nav: true }
    useAppDisplayMock = useAppDisplay as Mock
    useAppDisplayMock.mockReturnValue(appDisplay)

    getConcoctionsMock = getConcoctions as Mock
    getConcoctionsMock.mockReturnValue([])
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should retrieve list of concoctions', () => {
    render(<Navigation />)

    expect(getConcoctions).toHaveBeenCalled()
  })

  test('should retrieve current path', () => {
    render(<Navigation />)

    expect(usePathname).toHaveBeenCalled()
  })

  test('should check for app display status', () => {
    render(<Navigation />)

    expect(useAppDisplay).toHaveBeenCalled()
  })

  test('should render home menu and list of concoctions', () => {
    getConcoctionsMock.mockReturnValue([
      { linkUrl: 'concoction1', linkTitle: 'Concoction 1' },
      { linkUrl: 'concoction2', linkTitle: 'Concoction 2', previewUrl: 'concoction2.jpg' }
    ])

    const { container } = render(<Navigation />)

    expect(container).toMatchSnapshot()
  })

  test('should set home menu item as active when current path is on root', () => {
    usePathnameMock.mockReturnValue('/')

    const { container } = render(<Navigation />)

    expect(container).toMatchSnapshot()
  })

  test('should set appropriate concoction menu item as active based on current path', () => {
    usePathnameMock.mockReturnValue('/concoction2')

    getConcoctionsMock.mockReturnValue([
      { linkUrl: 'concoction1', linkTitle: 'Concoction 1' },
      { linkUrl: 'concoction2', linkTitle: 'Concoction 2' }
    ])

    const { container } = render(<Navigation />)

    expect(container).toMatchSnapshot()
  })

  test('should render menu items if current path is not recognised', () => {
    usePathnameMock.mockReturnValue('/concotion3')

    getConcoctionsMock.mockReturnValue([
      { linkUrl: 'concoction1', linkTitle: 'Concoction 1' },
      { linkUrl: 'concoction2', linkTitle: 'Concoction 2' }
    ])

    const { container } = render(<Navigation />)

    expect(container).toMatchSnapshot()
  })

  test('should append baseUrl to concoction linkUrl', () => {
    usePathnameMock.mockReturnValue('/concoction1')

    getConcoctionsMock.mockReturnValue([
      { linkUrl: 'concoction1', linkTitle: 'Concoction 1' }
    ])

    const { container } = render(<Navigation baseUrl='/base' />)

    expect(container).toMatchSnapshot()
  })

  test.each([
    { baseUrl: 'base', linkUrl: 'concoction', expected: '/base/concoction' },
    { baseUrl: '/base', linkUrl: '/concoction', expected: '/base/concoction' },
    { baseUrl: '/base', linkUrl: 'concoction', expected: '/base/concoction' },
    { baseUrl: 'base', linkUrl: '/concoction', expected: '/base/concoction' },
  ])('should handle URLs without leading / (baseUrl: $baseUrl; linkUrl: $linkUrl)', ({ baseUrl, linkUrl, expected }: { baseUrl: string, linkUrl: string, expected: string }) => {
    usePathnameMock.mockReturnValue('/')

    getConcoctionsMock.mockReturnValue([
      { linkUrl, linkTitle: 'Concoction 1' }
    ])

    render(<Navigation baseUrl={baseUrl} />)

    const content = screen.getByText(expected, { exact: false })

    expect(content).toBeDefined()
  })

  test('should not render anything if navigation is hidden in app display', () => {
    appDisplay.nav = false

    const { container } = render(<Navigation />)

    expect(container).toMatchSnapshot()
  })
})