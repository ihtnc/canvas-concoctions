import { describe, expect, test } from "vitest";
import {
  ForwardIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
  TagIcon,
  PlusCircleIcon,
  BeakerIcon
} from ".";
import { render } from '@testing-library/react'

describe('icons', () => {
  test.each([
    { icon: ForwardIcon, title: 'ForwardIcon' },
    { icon: PauseIcon, title: 'PauseIcon' },
    { icon: PlayIcon, title: 'PlayIcon' },
    { icon: TrashIcon, title: 'TrashIcon' },
    { icon: TagIcon, title: 'TrashIcon' },
    { icon: PlusCircleIcon, title: 'PlusCircleIcon' },
    { icon: BeakerIcon, title: 'BeakerIcon' }
  ])('should define $title', ({ icon }: { icon: () => JSX.Element }) => {
    const { container } = render(icon());
    expect(container).toMatchSnapshot();
  });
});