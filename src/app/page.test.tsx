import { render } from '@testing-library/react'
import Home from './page'
import { describe, expect, test } from 'vitest'

describe('Home component', () => {
  test('should render the page', () => {
    const { container } = render(<Home />)

    expect(container).toMatchSnapshot()
  })
})