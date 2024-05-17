import { beforeAll, describe, expect, test } from "vitest"
import {
  ForwardIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
  TagIcon,
  PlusCircleIcon,
  BeakerIcon
} from "."
import { render } from '@testing-library/react'
import { JSXElementConstructor } from "react"
import { IconProps } from "./types"

describe('icons', () => {
  const iconList: Array<{Icon: JSXElementConstructor<IconProps>, title: string}> = [
    { Icon: ForwardIcon, title: 'ForwardIcon' },
    { Icon: PauseIcon, title: 'PauseIcon' },
    { Icon: PlayIcon, title: 'PlayIcon' },
    { Icon: TrashIcon, title: 'TrashIcon' },
    { Icon: TagIcon, title: 'TrashIcon' },
    { Icon: PlusCircleIcon, title: 'PlusCircleIcon' },
    { Icon: BeakerIcon, title: 'BeakerIcon' }
  ]

  test.each(iconList)('should define $title', ({ Icon }: { Icon: JSXElementConstructor<IconProps> }) => {
    const { container } = render(<Icon />)
    expect(container).toMatchSnapshot()
  })

  test.each(iconList)('should set className ($title)', ({ Icon }: { Icon: JSXElementConstructor<IconProps> }) => {
    const className = "test-class-name"
    const { container } = render(<Icon className={className} />)
    expect(container).toMatchSnapshot()
  })
})