import { describe, expect, test } from "vitest";
import ForwardIcon from "./forward-icon";
import PauseIcon from "./pause-icon";
import PlayIcon from "./play-icon";
import TrashIcon from "./trash-icon";
import TagIcon from "./tag-icon";
import PlusCircleIcon from "./plus-circle-icon";
import { render } from '@testing-library/react'

describe('icons', () => {
  test.each([
    { icon: ForwardIcon, title: 'ForwardIcon' },
    { icon: PauseIcon, title: 'PauseIcon' },
    { icon: PlayIcon, title: 'PlayIcon' },
    { icon: TrashIcon, title: 'TrashIcon' },
    { icon: TagIcon, title: 'TrashIcon' },
    { icon: PlusCircleIcon, title: 'PlusCircleIcon' }
  ])('should define $title', ({ icon }: { icon: () => JSX.Element }) => {
    const { container } = render(icon());
    expect(container).toMatchSnapshot();
  });
});